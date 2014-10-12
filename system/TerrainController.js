/**
 * Created by tylercamp on 8/9/14.
 */

;(function () {

    "use strict";

    function bilinearInterpolate(xnorm, ynorm, tl, tr, bl, br) {
        var xnorm_1 = 1 - xnorm, ynorm_1 = 1 - ynorm;

        return  tl * xnorm_1 * ynorm_1 +
                tr * xnorm   * ynorm_1 +
                bl * xnorm_1 * ynorm +
                br * xnorm   * ynorm;
    }

    window.TerrainController = (function() {

        function TerrainController(glContext) {
            this.generator = null;

            this._gl = glContext;
        }

        TerrainController.prototype.createTerrain = function createNewTerrainUsingActiveGenerator(width, height, _scale) {
            if (this.generator === null) {
                console.error('A generator type (TerrainController.generator) must be assigned to the terrain controller before a terrain can be generated.');
                return null;
            }

            var newTerrain = new TerrainObject(this._gl, _scale);
            Utility.timedOp('reset terrain', function () {
                newTerrain.resetToSize(width, height);
            });

            Utility.timedOp('apply generation', function () {
                this.generator.apply(newTerrain);
            }.bind(this));

            Utility.timedOp('update render buffers', function () {
                newTerrain.update();
            });

            return newTerrain;
        };



        function BlankGenerator() {

        }

        BlankGenerator.prototype.apply = function applyGeneratorToTerrain(terrainObject) {

        };



        function RandomGenerator(maxOffset) {
            this.options = { maxOffset: maxOffset };
        }

        RandomGenerator.prototype.apply = function applyGeneratorToTerrain(terrainObject) {
            var width = terrainObject.width() + 1;
            var height = terrainObject.height() + 1;

            for (var x = 0; x < width; x++) {
                for (var y = 0; y < height; y++) {
                    //  Make the terrain a cosine wave
                    terrainObject.addValue(x, y, Math.random() * this.options.maxOffset);
                }
            }
        };



        //  TODO: Generation functions should belong to something other than the TerrainController (Math?)
        TerrainController.linearInterpolate = function linearInterpolate(val1, val2, factor) {
            return val1 + (val2 - val1) * factor;
        };

        TerrainController.hermiteInterpolate = function hermiteInterpolate(val1, val2, factor) {
            console.error('NOT YET IMPLEMENTED');
        };

        function WaveOctaveGenerator(numOctaves, baseAmplitude, baseOctave_) {
            this.numOctaves = numOctaves;
            this.baseAmplitude = baseAmplitude;
            this.baseOctave = baseOctave_ || 0;
        }

        WaveOctaveGenerator.prototype.apply = function applyGeneratorToTerrain(terrainObject) {
            var offsets = new Array(this.numOctaves);
            var i, x, y, unitx, unity;

            for (i = 0; i < this.numOctaves; i++) {
                offsets[i] = Math.random() * Math.tau;
            }

            for (y = 0; y < terrainObject.height() + 1; y++) {
                unity = y / (terrainObject.height() + 1);

                for (x = 0; x < terrainObject.width() + 1; x++) {
                    unitx = x / (terrainObject.width() + 1);

                    var dataSample = 0;
                    for (i = 0; i < this.numOctaves; i++) {
                        dataSample += Math.sin(unitx * Math.tau * Math.pow(2, i + this.baseOctave) + offsets[i]) * (1 / Math.pow(2, i + 1 + this.baseOctave)) * this.baseAmplitude;
                        dataSample += Math.cos(unity * Math.tau * Math.pow(2, i + this.baseOctave) + offsets[i]) * (1 / Math.pow(2, i + 1 + this.baseOctave)) * this.baseAmplitude;

                        //dataSample += Math.sin(unitx * Math.tau * i + offsets[i]) * (1 / Math.pow(1.1, i+1)) * this.baseAmplitude;
                        //dataSample += Math.cos(unity * Math.tau * i + offsets[i]) * (1 / Math.pow(1.1, i+1)) * this.baseAmplitude;

                        //dataSample += Math.sin(unitx * Math.tau * i + offsets[i]) * (1 / (i+1)) * this.baseAmplitude;
                        //dataSample += Math.cos(unity * Math.tau * i + offsets[i]) * (1 / (i+1)) * this.baseAmplitude;
                    }

                    terrainObject.addValue(x, y, dataSample);
                }
            }
        };

        function DebugGenerator(maxHeight) {
            this.options = { maxHeight: maxHeight };
        }

        DebugGenerator.prototype.apply = function applyGeneratorToTerrain(terrainObject) {
            var width = terrainObject.width() + 1;
            var height = terrainObject.height() + 1;

            for (var x = 0; x < width; x++) {
                for (var y = 0; y < height; y++) {
                    //  Make the terrain a cosine wave
                    terrainObject.addValue(x, y, Math.cos(y / height * Math.pi * 2) * this.options.maxHeight);
                }
            }
        };


        function SimplexGenerator(height, frequency_) {
            if (height === undefined) {
                console.error('No height value was provided for SimplexGenerator');
            }

            this.height = height;
            this.frequency = frequency_ || 1;
        }

        SimplexGenerator.prototype.setProperties = function setProperties(height, frequency) {
            this.height = height;
            this.frequency = frequency;
        };

        SimplexGenerator.prototype.apply = function applyGeneratorToTerrain(terrainObject) {
            var width = terrainObject.width() + 1;
            var height = terrainObject.height() + 1;

            var simplexValue;

            noise.seed(Math.random());

            for (var x = 0; x < width; x++) {
                for (var y = 0; y < height; y++) {
                    simplexValue = noise.simplex2((x / width) * this.frequency, (y / height) * this.frequency) * this.height;
                    terrainObject.addValue(x, y, simplexValue);
                }
            }
        };


        function TerrainChunk(gl, width, height, defaultValue) {
            this.rawData = [];

            this._width = 0;
            this._height = 0;

            this._glIndexBuffer = gl.createBuffer();

            this._glVertexBuffer = gl.createBuffer();
            this._glTexCoordBuffer = gl.createBuffer();
            this._glColorBuffer = gl.createBuffer();
            this._glNormalBuffer = gl.createBuffer();

            this._gl = gl;

            this._resetToSize(width, height, defaultValue);
        }

        TerrainChunk.prototype._resetToSize = function clearInternalBufferAndFillToSize(width, height, defaultValue) {
            defaultValue = defaultValue || 0;

            this._width = width;
            this._height = height;

            this.rawData = new Array((width+1) * (height+1));
            for (var i = 0; i < this.rawData.length; i++) {
                this.rawData[i] = defaultValue;
            }
        };

        TerrainChunk.prototype.getValue = function getValueAtPosition(x, y) {

            var width = this._width;
            var height = this._height;

            var vertexWidth = width + 1;
            var vertexHeight = height + 1;

            if (x < 0) x = 0;
            if (y < 0) y = 0;
            if (x > width) x = width;
            if (y > height) y = height;

            if (x % 1 === 0 && y % 1 === 0) {
                return this.rawData[y * vertexWidth + x];
            }

            var fx = Math.floor(x);
            var fy = Math.floor(y);
            var cx = Math.ceil(x);
            var cy = Math.ceil(y);

            if (x % 1 === 0) {
                var top, bottom;
                top = this.rawData[fy * vertexWidth + x];
                bottom = this.rawData[cy * vertexWidth + x];
                return TerrainController.linearInterpolate(top, bottom, y % 1);
            }

            if (y % 1 === 0) {
                var left, right;
                left = this.rawData[y * vertexWidth + fx];
                right = this.rawData[y * vertexWidth + cx];
                return TerrainController.linearInterpolate(left, right, x % 1);
            }

            var tl = this.rawData[fy * vertexWidth + fx];
            var tr = this.rawData[fy * vertexWidth + cx];
            var bl = this.rawData[cy * vertexWidth + fx];
            var br = this.rawData[cy * vertexWidth + cx];

            return bilinearInterpolate(x - fx, y - fy, tl, tr, bl, br);
        };

        TerrainChunk.prototype.setValue = function setValueAtVertexPosition(x, y, value) {
            this.rawData[(this._width + 1) * y + x] = value;
        };

        TerrainChunk.prototype.getNormal = function getNormalForVertexPosition(x, y) {
            var normals = [];

            //  Sampled values in the grid
            var current, adjacent, vertexWidth, vertexHeight;
            vertexWidth = this._width + 1;
            vertexHeight = this._height + 1;
            current = this.rawData[y * vertexWidth + x];

            var left = null, up = null, right = null, down = null;

            //  Point on the left
            if (x > 0) {
                adjacent = this.rawData[y * vertexWidth + x - 1];
                left = { x: -1, y: current - adjacent, z: 0 };
                Math.normalize(left);
            }

            //  Point on the right
            if (x < this._width) {
                adjacent = this.rawData[y * vertexWidth + x + 1];
                right = { x: 1, y: current - adjacent, z: 0 };
                Math.normalize(right);
            }

            //  Point above
            if (y > 0) {
                adjacent = this.rawData[(y - 1) * vertexWidth + x];
                up = { x: 0, y: current - adjacent, z: 1 };
                Math.normalize(up);
            }

            //  Point below
            if (y < this._height) {
                adjacent = this.rawData[(y + 1) * vertexWidth + x];
                down = { x: 0, y: current - adjacent, z: -1 };
                Math.normalize(down);
            }


            if (left && up)
                normals.push(Math.cross(left, up));
            if (up && right)
                normals.push(Math.cross(up, right));
            if (right && down)
                normals.push(Math.cross(right, down));
            if (down && left)
                normals.push(Math.cross(down, left));


            var i;
            var averageNormal = { x: 0, y: 0, z: 0 };
            for (i = 0; i < normals.length; i++) {
                averageNormal.x += normals[i].x;
                averageNormal.y += normals[i].y;
                averageNormal.z += normals[i].z;
            }

            //  For whatever reason the x is negative? Reverse that
            averageNormal.x = -averageNormal.x;

            return Math.normal(averageNormal);
        };

        TerrainChunk.prototype.update = function updateBuffers(scale, chunkPosition) {
            var i, x, y, z, normal;

            var scale_i = {
                x: 1 / scale.x,
                y: 1 / scale.y,
                z: 1 / scale.z
            };

            var rawVertices = new Array(this.rawData.length * 3);
            var rawColors = new Array(this.rawData.length * 3);
            var rawTexCoords = new Array(this.rawData.length * 2);
            var rawNormals = new Array(this.rawData.length * 3);
            for (i = 0; i < this.rawData.length; i++) {
                x = i % (this._width + 1);
                y = this.rawData[i]; // height is the data point
                z = Math.floor(i / (this._width + 1));

                rawVertices[i*3 + 0] = x * scale.x + chunkPosition.x;
                rawVertices[i*3 + 1] = y * scale.y + chunkPosition.y;
                rawVertices[i*3 + 2] = z * scale.z + chunkPosition.z;

                var range = 0.01;
                var base = 1.0 - range;
                //  Unused
                rawColors[i*3 + 0] = base + Math.random()*range;
                rawColors[i*3 + 1] = base + Math.random()*range;
                rawColors[i*3 + 2] = base + Math.random()*range;

                rawTexCoords[i*2 + 0] = x;
                rawTexCoords[i*2 + 1] = z;

                normal = this.getNormal(x, z);
                rawNormals[i*3 + 0] = normal.x * scale_i.x;
                rawNormals[i*3 + 1] = normal.y * scale_i.y;
                rawNormals[i*3 + 2] = normal.z * scale_i.z;
            }

            var rawIndices = new Array(this.numTerrainTriangles() * 3);
            var tlIndex, trIndex, blIndex, brIndex;

            var indexOffset = 0;
            var verticesWidth = this._width + 1, verticesHeight = this._height + 1;
            for (y = 0; y < this._height; y++) {
                for (x = 0; x < this._width; x++, indexOffset+=6) {
                    tlIndex = y * verticesWidth + x;
                    trIndex = y * verticesWidth + (x + 1);
                    blIndex = (y + 1) * verticesWidth + x;
                    brIndex = (y + 1) * verticesWidth + (x + 1);

                    rawIndices[indexOffset + 0] = blIndex;
                    rawIndices[indexOffset + 1] = trIndex;
                    rawIndices[indexOffset + 2] = tlIndex;

                    rawIndices[indexOffset + 3] = blIndex;
                    rawIndices[indexOffset + 4] = brIndex;
                    rawIndices[indexOffset + 5] = trIndex;
                }
            }

            var newVertexData, newColorData, newTexCoordData, newIndexData, newNormalData;
            newVertexData = new Float32Array(rawVertices);
            newColorData = new Float32Array(rawColors);
            newIndexData = new Uint16Array(rawIndices);
            newTexCoordData = new Float32Array(rawTexCoords);
            newNormalData = new Float32Array(rawNormals);


            var gl = this._gl;
            gl.bindBuffer(gl.ARRAY_BUFFER, this._glVertexBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, newVertexData, gl.STATIC_DRAW);

            gl.bindBuffer(gl.ARRAY_BUFFER, this._glColorBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, newColorData, gl.STATIC_DRAW);

            gl.bindBuffer(gl.ARRAY_BUFFER, this._glTexCoordBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, newTexCoordData, gl.STATIC_DRAW);

            gl.bindBuffer(gl.ARRAY_BUFFER, this._glNormalBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, newNormalData, gl.STATIC_DRAW);

            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._glIndexBuffer);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, newIndexData, gl.STATIC_DRAW);
        };

        TerrainChunk.prototype.width = function getWidth() {
            return this._width;
        };

        TerrainChunk.prototype.height = function getHeight() {
            return this._height;
        };

        TerrainChunk.prototype.getRenderingBuffers = function getRenderingBuffers() {
            var self = this;
            return {
                indexBuffer: self._glIndexBuffer,
                vertexBuffer: self._glVertexBuffer,
                texCoordBuffer: self._glTexCoordBuffer,
                normalBuffer: self._glNormalBuffer,
                colorBuffer: self._glColorBuffer
            };
        };

        TerrainChunk.prototype.numTerrainTriangles = function calculateNumberOfTrianglesInTerrain() {
            return this._width * this._height * 2;
        };





        function TerrainObject(gl, _scale) {
            this.chunks = [];

            if (!_scale) {
                this.scale = { x: 1, y: 1, z: 1 };
            }
            else {
                if (typeof _scale === 'object') {
                    this.scale = _scale;
                }
                else {
                    this.scale = { x: _scale, y: _scale, z: _scale };
                }
            }

            this._chunkSize = 255;

            this._width = 0;
            this._height = 0;

            this.terrainTexture = null;

            this._gl = gl;
        }

        TerrainObject.prototype.resetToSize = function clearInternalBufferAndFillToSize(width, height, defaultValue_) {
            defaultValue_ = defaultValue_ || 0;

            this._width = width;
            this._height = height;

            this.chunks = [];

            var numChunks = {
                x: Math.ceil(this._width / this._chunkSize),
                y: Math.ceil(this._height / this._chunkSize)
            };

            var x, y, chunk, chunkWidth, chunkHeight;
            for (y = 0; y < numChunks.y; y++) {
                for (x = 0; x < numChunks.x; x++) {
                    chunkWidth = Math.min(this._chunkSize, this._width - x * this._chunkSize);
                    chunkHeight = Math.min(this._chunkSize, this._height - y * this._chunkSize);
                    chunk = new TerrainChunk(this._gl, chunkWidth, chunkHeight, defaultValue_);
                    this.chunks.push(chunk);
                }
            }
        };

        TerrainObject.prototype.getValue = function getValueAtPosition(x, y) {
            var chunk = this.getChunkForPosition(x, y);
            x /= this.scale.x;
            y /= this.scale.z;
            x = Math.clamp(x, 0, this._width);
            y = Math.clamp(y, 0, this._height);
            return chunk.getValue(x % this._chunkSize, y % this._chunkSize);
        };

        TerrainObject.prototype.getChunkForPosition = function getChunkForPosition(x, y) {
            var chunkx, chunky;
            x /= this.scale.x;
            y /= this.scale.z;
            chunkx = Math.floor(x / this._chunkSize);
            chunky = Math.floor(y / this._chunkSize);

            var numChunks = {
                x: Math.ceil(this._width / this._chunkSize),
                y: Math.ceil(this._height / this._chunkSize)
            };

            chunkx = Math.clamp(chunkx, 0, numChunks.x - 1);
            chunky = Math.clamp(chunky, 0, numChunks.y - 1);

            return this.chunks[chunky * numChunks.x + chunkx];
        };

        TerrainObject.prototype.getNormal = function getNormalForPosition(x, y) {
            x /= this.scale.x;
            y /= this.scale.z;

            var fx, fy, cx, cy;
            fx = Math.floor(x); fy = Math.floor(y);
            cx = Math.ceil(x); cy = Math.ceil(y);

            var tlchunk, trchunk, blchunk, brchunk;
            tlchunk = this.getChunkForPosition(fx * this.scale.x, fy * this.scale.z);
            trchunk = this.getChunkForPosition(cx * this.scale.x, fy * this.scale.z);
            blchunk = this.getChunkForPosition(fx * this.scale.x, cy * this.scale.z);
            brchunk = this.getChunkForPosition(cx * this.scale.x, cy * this.scale.z);

            var tl, tr, bl, br, chunkSize = this._chunkSize;
            tl = tlchunk.getNormal(fx - Math.floor(fx/chunkSize)*chunkSize, fy - Math.floor(fy/chunkSize)*chunkSize);
            tr = trchunk.getNormal(cx - Math.floor(cx/chunkSize)*chunkSize, fy - Math.floor(fy/chunkSize)*chunkSize);
            bl = blchunk.getNormal(fx - Math.floor(fx/chunkSize)*chunkSize, cy - Math.floor(cy/chunkSize)*chunkSize);
            br = brchunk.getNormal(cx - Math.floor(cx/chunkSize)*chunkSize, cy - Math.floor(cy/chunkSize)*chunkSize);

            var scale_i = {
                x: 1 / this.scale.x,
                y: 1 / this.scale.y,
                z: 1 / this.scale.z
            };

            tl.x *= scale_i.x; tl.y *= scale_i.y; tl.z *= scale_i.z;
            tr.x *= scale_i.x; tr.y *= scale_i.y; tr.z *= scale_i.z;
            bl.x *= scale_i.x; bl.y *= scale_i.y; bl.z *= scale_i.z;
            br.x *= scale_i.x; br.y *= scale_i.y; br.z *= scale_i.z;

            var xmod = x % 1, ymod = y % 1;
            return Math.normal({
                x: bilinearInterpolate(xmod, ymod, tl.x, tr.x, bl.x, br.x),
                y: bilinearInterpolate(xmod, ymod, tl.y, tr.y, bl.y, br.y),
                z: bilinearInterpolate(xmod, ymod, tl.z, tr.z, bl.z, br.z)
            });
        };

        TerrainObject.prototype.addValue = function addValueAtVertexPosition(x, y, value) {
            var currentValue = this.getValue(x * this.scale.x, y * this.scale.z);
            this.setValue(x, y, currentValue + value);
        };

        TerrainObject.prototype.setValue = function setValueAtVertexPosition(x, y, value) {

            if (x < 0 || x > this._width || x % 1 !== 0) throw [ "Invalid x coordinate", x ];
            if (y < 0 || y > this._height || y % 1 !== 0) throw [ "Invalid y coordinate", y ];

            var numChunks = {
                x: Math.ceil(this._width / this._chunkSize),
                y: Math.ceil(this._height / this._chunkSize)
            };

            var chunkSize = this._chunkSize;

            this.chunks.forEach(function (chunk, i) {
                var chunkx, chunky;
                chunkx = i % numChunks.x;
                chunky = (i - chunkx) / numChunks.x;

                //  If the vertex isn't relevant to this chunk, exit
                if (x < chunkx * chunkSize || y < chunky * chunkSize)
                    return;
                if (x > chunkx * chunkSize + chunk._width || y > chunky * chunkSize + chunk._height)
                    return;

                var localx, localy;
                localx = x - chunkx * chunkSize;
                localy = y - chunky * chunkSize;
                chunk.setValue(localx, localy, value);
            });
        };

        TerrainObject.prototype.update = function updateBuffers() {
            var numChunks = {
                x: Math.ceil(this._width / this._chunkSize),
                y: Math.ceil(this._height / this._chunkSize)
            };

            for (var y = 0; y < numChunks.y; y++) {
                for (var x = 0; x < numChunks.x; x++) {
                    var chunk;
                    chunk = this.chunks[y * numChunks.x + x];
                    chunk.update(this.scale, {
                        x: x * this._chunkSize * this.scale.x,
                        y: 0 * this.scale.y,
                        z: y * this._chunkSize * this.scale.z
                    });
                }
            }
        };

        TerrainObject.prototype.renderWidth = function getRenderWidth() {
            return this._width * this.scale.x;
        };

        TerrainObject.prototype.renderHeight = function getRenderHeight() {
            return this._height * this.scale.z;
        };

        TerrainObject.prototype.width = function getWidth() {
            return this._width;
        };

        TerrainObject.prototype.height = function getHeight() {
            return this._height;
        };

        TerrainObject.prototype.getRenderingBuffers = function getRenderingBuffers() {
            var indexBuffers = [];
            var vertexBuffers = [];
            var texCoordBuffers = [];
            var colorBuffers = [];
            var normalBuffers = [];
            var triangleCounts = [];

            this.chunks.forEach(function (chunk) {
                var chunkBuffers = chunk.getRenderingBuffers();

                indexBuffers.push(chunkBuffers.indexBuffer);
                vertexBuffers.push(chunkBuffers.vertexBuffer);
                texCoordBuffers.push(chunkBuffers.texCoordBuffer);
                normalBuffers.push(chunkBuffers.normalBuffer);
                colorBuffers.push(chunkBuffers.colorBuffer);
                triangleCounts.push(chunk.numTerrainTriangles());
            });

            return {
                indexBuffers: indexBuffers,
                vertexBuffers: vertexBuffers,
                texCoordBuffers: texCoordBuffers,
                colorBuffers: colorBuffers,
                normalBuffers: normalBuffers,
                numBatches: this.chunks.length,
                triangleCounts: triangleCounts
            };
        };

        TerrainObject.prototype.numTerrainTriangles = function calculateNumberOfTrianglesInTerrain() {
            return this._width * this._height * 2;
        };

        TerrainController.BlankGenerator = BlankGenerator;
        TerrainController.RandomGenerator = RandomGenerator;
        TerrainController.WaveOctaveGenerator = WaveOctaveGenerator;
        TerrainController.DebugGenerator = DebugGenerator;

        if (window.noise) {
            //  Only hook the Perlin generator if the library has been linked
            TerrainController.SimplexGenerator = SimplexGenerator;
        }
        else {
            console.warn('perlin.js is missing, Simplex generation will be disabled');
        }

        return TerrainController;

    })();

})();