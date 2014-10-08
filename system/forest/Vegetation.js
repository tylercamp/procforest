/**
 * Created by tylercamp on 9/30/14.
 */

;(function() {

    "use strict";

    function Segment() {
        this.baseOrientation = { x: 0, y: 0, z: 0 };
        this.parent = null;
        this.subdivisionIndex = -1;

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

        this._structureMesh = null;
        this._needsBuild = false;
    }

    Vegetation.prototype.draw = function(gl, shaderParams, autoAttribArrays_) {

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
            colors.push(1);
            colors.push(1);
            colors.push(1);
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
        if (this.structureSegments.length === 0 || !this.seed) {
            console.error('Cannot grow vegetation without a base segment or seed, try creating vegetation using Forest.Seed.plant(...)');
        }

        var i, segment, relativeChange, lastVertex, nextToLastVertex, currentDirection;
        for (i = 0; i < this.structureSegments.length; i++) {
            segment = this.structureSegments[i];
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

            relativeChange = this.seed.growth(terrain, segment, this.fingerprint, currentDirection);
            if (!relativeChange)
                continue;

            segment.structure.push({
                x: lastVertex.x + relativeChange.x,
                y: lastVertex.y + relativeChange.y,
                z: lastVertex.z + relativeChange.z
            });
        }

        this._needsBuild = true;
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