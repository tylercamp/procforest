/**
 * Created by tylercamp on 9/30/14.
 */

;(function() {

    "use strict";
    
    function Vegetation() {
        this.meshes = [];
    }

    Vegetation.prototype.fitToTerrain = function (terrain) {

    };

    Vegetation.prototype.draw = function() {

    };

    Vegetation.prototype.drawStructure = function(gl, shaderParams) {

        gl.enableVertexAttribArray(shaderParams.a_Vertex);
        gl.enableVertexAttribArray(shaderParams.a_Color);

        var i, meshBuffers;
        for (i = 0; i < this.meshes.length; i++) {
            meshBuffers = this.meshes[i].getBuffers();

            gl.bindBuffer(gl.ARRAY_BUFFER, meshBuffers.vertices);
            gl.vertexAttribPointer(shaderParams.a_Vertex, this.meshes[i].vertexDescriptor.stride, gl.FLOAT, false, 0, 0);

            gl.bindBuffer(gl.ARRAY_BUFFER, meshBuffers.colors);
            gl.vertexAttribPointer(shaderParams.a_Color, this.meshes[i].colorDescriptor.stride, gl.FLOAT, false, 0, 0);

            if (meshBuffers.indices) {
                throw "DON'T DO THIS (NYI)";
            }
            else {
                gl.drawArrays(gl.LINES, 0, this.meshes[i].vertices.length);
            }
        }

        gl.disableVertexAttribArray(shaderParams.a_Vertex);
        gl.disableVertexAttribArray(shaderParams.a_Color);
    };

})();