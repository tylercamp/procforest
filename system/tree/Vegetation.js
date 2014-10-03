/**
 * Created by tylercamp on 9/30/14.
 */

;(function() {

    "use strict";

    function Segment() {
        this.length = 0;
        this.baseOrientation = { x: 0, y: 0, z: 0 };
        this.parent = null;
        this.subdivisionIndex = -1;

        this.structure = [];
    }
    
    function Vegetation() {
        this.meshes = [];
        this.seed = null;
        this.structureSegments = [];

        this._structureMesh = null;
    }

    Vegetation.prototype.fitToTerrain = function (terrain) {

    };

    Vegetation.prototype.draw = function() {

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

        this._structureMesh = new Mesh();
        this._structureMesh.setVertices({
            data: vertices,
            primitive: gl.LINES
        });

        this._structureMesh.setColors({
            data: colors
        });
        this._structureMesh.build(gl);
    };

    Vegetation.prototype.grow = function grow() {
        if (this.structureSegments.length === 0 || !this.seed) {
            console.error('Cannot grow vegetation without a base segment or seed, try creating vegetation using Forest.Seed.plant(...)');
        }

        var i, segment, relativeChange, lastVertex;
        for (i = 0; i < this.structureSegments.length; i++) {
            segment = this.structureSegments[i];
            relativeChange = this.seed.growth(segment, segment.baseOrientation); // NOTE: currentDirection should not be this.baseOrientation
            lastVertex = segment.structure[segment.structure.length - 1];
            segment.structure.push({
                x: lastVertex.x + relativeChange.x,
                y: lastVertex.y + relativeChange.y,
                z: lastVertex.z + relativeChange.z
            });
        }
    };

    //  For debugging
    Vegetation.prototype.drawStructure = function(gl, shaderParams) {
        if (!this._structureMesh)
            this._generateStructureMesh(gl);

        gl.enableVertexAttribArray(shaderParams.a_Vertex);
        gl.enableVertexAttribArray(shaderParams.a_Color);

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

        gl.disableVertexAttribArray(shaderParams.a_Vertex);
        gl.disableVertexAttribArray(shaderParams.a_Color);
    };

    window.Vegetation = Vegetation;
    Vegetation.Segment = Segment;

})();