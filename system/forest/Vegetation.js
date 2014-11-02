/**
 * Created by tylercamp on 9/30/14.
 */

;(function() {

    "use strict";

    function Segment() {
        this.baseOrientation = { x: 0, y: 0, z: 0 };
        this.parent = null;
        this.subdivisionIndex = -1;
        this.numChildren = 0;
        this.isFinalized = false;

        this.structure = [];
    }

    Segment.prototype.calculateArcLength = function totalLengthOfStructure() {
        var i, total = 0, current, next;
        for (i = 0; i < this.structure.length - 1; i++) {
            current = this.structure[i];
            next = this.structure[i + 1];

            total += Math.magnitude({
                x: next.x - current.x,
                y: next.y - current.y,
                z: next.z - current.z
            });
        }

        return total;
    };

    //  Returns the sharpest angle within the segment (in radians)
    Segment.prototype.smallestSectionAngle = function() {
        var smallestAngle = Math.pi, currentAngle, i;
        var previousVertex, currentVertex, nextVertex, b_a, b_c;
        for (i = 1; i < this.structure.length - 1; i++) {
            previousVertex = this.structure[i-1];
            currentVertex = this.structure[i];
            nextVertex = this.structure[i+1];

            b_a = {
                x: currentVertex.x - previousVertex.x,
                y: currentVertex.y - previousVertex.y,
                z: currentVertex.z - previousVertex.z
            };

            b_c = {
                x: currentVertex.x - nextVertex.x,
                y: currentVertex.y - nextVertex.y,
                z: currentVertex.z - nextVertex.z
            };

            currentAngle = Math.acos(Math.dot(b_a, b_c));
            if (currentAngle < smallestAngle)
                smallestAngle = currentAngle;
        }

        return smallestAngle;
    };

    //  from 0 - 1, 0 being no change and 1 causing every vertex to be evenly averaged with its immediate neighbors
    Segment.prototype.smooth = function smoothenStructureVertices(smoothFactor) {

        var originalData = new Array(this.structure.length);
        for (i = 0; i < this.structure.length; i++) {
            originalData[i] = {
                x: this.structure[i].x,
                y: this.structure[i].y,
                z: this.structure[i].z
            };
        }

        var i, previous, current, next, smoothFactor_i;
        smoothFactor_i = 1 / (1 + 2*smoothFactor);
        smoothFactor = 1 - smoothFactor_i;
        smoothFactor /= 2;
        for (i = 1; i < this.structure.length - 1; i++) {
            previous = originalData[i - 1];
            current = this.structure[i];
            next = originalData[i + 1];

            current.x = current.x * smoothFactor_i +
                        previous.x * smoothFactor +
                        next.x * smoothFactor;

            current.y = current.y * smoothFactor_i +
                        previous.y * smoothFactor +
                        next.y * smoothFactor;

            current.z = current.z * smoothFactor_i +
                        previous.z * smoothFactor +
                        next.z * smoothFactor;
        }
    };
    
    function Vegetation() {
        this.meshes = [];
        this.seed = null;
        this.structureSegments = [];

        //  A set of unique numbers from 0-1 to give this vegetation its own properties (used by the seed)
        this.fingerprint = {
            a: Math.random(),
            b: Math.random(),
            c: Math.random()
        };

        this._renderMesh = null;
        this._structureMesh = null;
        this._needsBuild = true;
    }

    Vegetation.prototype.position = function() {
        var result = null;
        if (this.structureSegments.length) {
            if (this.structureSegments[0].structure.length) {
                result = this.structureSegments[0].structure[0];
            }
        }

        if (result) {
            //  Make copy
            result = {
                x: result.x,
                y: result.y,
                z: result.z
            };
        }

        return result;
    };

    Vegetation.prototype.draw = function(gl, shaderParams, fittingTerrain, autoAttribArrays_) {
        if (this.structureSegments[0].structure.length <= 1)
            return;

        if (!this._renderMesh || this._needsBuild) {
            this._generateRenderMesh(gl, fittingTerrain);
        }

        if (autoAttribArrays_ === undefined)
            autoAttribArrays_ = true;

        if (autoAttribArrays_) {
            gl.enableVertexAttribArray(shaderParams.a_Vertex);
            gl.enableVertexAttribArray(shaderParams.a_Color);
        }

        var meshBuffers = this._renderMesh.getBuffers();

        gl.bindBuffer(gl.ARRAY_BUFFER, meshBuffers.vertices);
        gl.vertexAttribPointer(shaderParams.a_Vertex, this._renderMesh.vertexDescriptor.stride, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, meshBuffers.colors);
        gl.vertexAttribPointer(shaderParams.a_Color, this._renderMesh.colorDescriptor.stride, gl.FLOAT, false, 0, 0);

        if (meshBuffers.indices) {
            throw "DON'T DO THIS (NYI)";
        }
        else {
            gl.drawArrays(this._renderMesh.vertexDescriptor.primitive, 0, this._renderMesh.vertices.length / 3);
        }

        if (autoAttribArrays_) {
            gl.disableVertexAttribArray(shaderParams.a_Vertex);
            gl.disableVertexAttribArray(shaderParams.a_Color);
        }
    };

    Vegetation.prototype._generateRenderMesh = function(gl, fittingTerrain) {
        var meshData = VegetationMeshBuilder.instance.buildMeshForVegetation(this, fittingTerrain);
        var colors = [];

        if (!this._renderMesh)
            this._renderMesh = new Mesh();

        var i;
        for (i = 0; i < meshData.vertices.length; i++) {
            colors.push(0.5 * this.fingerprint.a + i / meshData.vertices.length);
            colors.push(0.5 * this.fingerprint.b + i / meshData.vertices.length);
            colors.push(0.5 * this.fingerprint.c + i / meshData.vertices.length);

            //colors.push(Math.random()/2 + 0.5);
            //colors.push(Math.random()/2 + 0.5);
            //colors.push(Math.random()/2 + 0.5);
        }

        this._renderMesh.setVertices({
            data: meshData.vertices,
            primitive: gl.TRIANGLES
        });

        this._renderMesh.setColors({
            data: colors
        });

        this._renderMesh.build(gl);
        this._needsBuild = false;
    };

    Vegetation.prototype._generateStructureMesh = function(gl) {
        var vertices, colors, i, j, currentSegment, currentVertex, nextVertex;

        vertices = [];
        for (i = 0; i < this.structureSegments.length; i++) {
            currentSegment = this.structureSegments[i];
            for (j = 0; j < currentSegment.structure.length - 1; j++) {
                currentVertex = currentSegment.structure[j];
                nextVertex = currentSegment.structure[j+1];

                vertices.push(currentVertex.x);
                vertices.push(currentVertex.y);
                vertices.push(currentVertex.z);
                vertices.push(nextVertex.x);
                vertices.push(nextVertex.y);
                vertices.push(nextVertex.z);
            }
        }

        colors = [];
        for (i = 0; i < vertices.length / 3; i++) {
            colors.push(1 * this.fingerprint.a + i / vertices.length);
            colors.push(1 * this.fingerprint.b + i / vertices.length);
            colors.push(1 * this.fingerprint.c + i / vertices.length);
        }

        if (!this._structureMesh)
            this._structureMesh = new Mesh();

        this._structureMesh.setVertices({
            data: vertices,
            primitive: gl.LINES
        });

        this._structureMesh.setColors({
            data: colors
        });
        this._structureMesh.build(gl);

        this._needsBuild = false;
    };

    Vegetation.prototype.grow = function grow(terrain) {
        var structureSegments = this.structureSegments;

        if (structureSegments.length === 0 || !this.seed) {
            console.error('Cannot grow vegetation without a base segment or seed, try creating vegetation using Forest.Seed.plant(...)');
        }

        var newSegments = [], offspring = [];

        var i, segment, growth, lastVertex, nextToLastVertex, currentDirection;
        for (i = 0; i < structureSegments.length; i++) {
            segment = structureSegments[i];
            if (segment.isFinalized)
                continue;

            this._needsBuild = true;

            lastVertex = segment.structure[segment.structure.length - 1];

            if (segment.structure.length > 1) {
                nextToLastVertex = segment.structure[segment.structure.length - 2];
                currentDirection = {
                    x: lastVertex.x - nextToLastVertex.x,
                    y: lastVertex.y - nextToLastVertex.y,
                    z: lastVertex.z - nextToLastVertex.z
                };
            }
            else {
                currentDirection = segment.baseOrientation;
            }

            growth = this.seed.growth(terrain, segment, this.fingerprint, currentDirection) || {};

            if (growth.offspring) {
                growth.offspring.forEach(function (singleOffspring) {
                    offspring.push(singleOffspring);
                });
            }

            if (growth.relativeChange) {
                segment.structure.push({
                    x: lastVertex.x + growth.relativeChange.x,
                    y: lastVertex.y + growth.relativeChange.y,
                    z: lastVertex.z + growth.relativeChange.z
                });
            }

            if (growth.newSegments) {
                growth.newSegments.forEach(function (segmentInfo) {
                    var rootStructureA, rootStructureB, rootStructureIndex, newSegment = new Segment();
                    newSegment.parent = segment;
                    newSegment.subdivisionIndex = newSegment.parent.subdivisionIndex + 1;
                    newSegment.baseOrientation = segmentInfo.baseOrientation;
                    rootStructureIndex = Math.floor((segment.structure.length - 1) * segmentInfo.offset);
                    rootStructureA = segment.structure[rootStructureIndex];
                    rootStructureB = segment.structure[rootStructureIndex + 1];
                    segmentInfo.offset -= rootStructureIndex / (segment.structure.length);
                    segmentInfo.offset *= segment.structure.length;

                    newSegment.structure.push(Math.vecLerp(segmentInfo.offset, rootStructureA, rootStructureB));
                    newSegments.push(newSegment);
                    segment.numChildren++;
                });
            }

            if (!growth.relativeChange) {
                this.seed.finalize(segment);
                segment.isFinalized = true;
            }
        }

        for (i = 0; i < newSegments.length; i++) {
            structureSegments.push(newSegments[i]);
        }

        if (offspring.length)
            return offspring;
    };

    //  For debugging
    Vegetation.prototype.drawStructure = function(gl, shaderParams, autoAttribArrays_) {
        if (!this._structureMesh || this._needsBuild)
            this._generateStructureMesh(gl);

        if (autoAttribArrays_ === undefined)
            autoAttribArrays_ = true;

        if (autoAttribArrays_) {
            gl.enableVertexAttribArray(shaderParams.a_Vertex);
            gl.enableVertexAttribArray(shaderParams.a_Color);
        }

        var meshBuffers = this._structureMesh.getBuffers();

        gl.bindBuffer(gl.ARRAY_BUFFER, meshBuffers.vertices);
        gl.vertexAttribPointer(shaderParams.a_Vertex, this._structureMesh.vertexDescriptor.stride, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, meshBuffers.colors);
        gl.vertexAttribPointer(shaderParams.a_Color, this._structureMesh.colorDescriptor.stride, gl.FLOAT, false, 0, 0);

        if (meshBuffers.indices) {
            throw "DON'T DO THIS (NYI)";
        }
        else {
            gl.drawArrays(this._structureMesh.vertexDescriptor.primitive, 0, this._structureMesh.vertices.length / 3);
        }

        if (autoAttribArrays_) {
            gl.disableVertexAttribArray(shaderParams.a_Vertex);
            gl.disableVertexAttribArray(shaderParams.a_Color);
        }
    };

    window.Vegetation = Vegetation;
    Vegetation.Segment = Segment;

})();