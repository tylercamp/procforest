/**
 * Created by tylercamp on 9/26/14.
 */

;(function() {

    "use strict";

    var vertices = new Float32Array([
        -1, -1,    1, 1,    -1, 1,
        -1, -1,    1, -1,    1, 1
    ]);

    var texCoords = new Float32Array([
        0, 0,    1, 1,    0, 1,
        0, 0,    1, 0,    1, 1
    ]);

    var vBufferObject, tcBufferObject;

    function FullscreenQuad() {

    }

    FullscreenQuad.prototype.render = function render(gl, vertexAttribute, texCoordAttribute, _autoToggleAttribArrays) {

        //  Init if necessary
        if (!vBufferObject) {
            vBufferObject = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, vBufferObject);
            gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

            tcBufferObject = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, tcBufferObject);
            gl.bufferData(gl.ARRAY_BUFFER, texCoords, gl.STATIC_DRAW);
        }

        //  Special-case: shaderParams object is passed in as second parameter, autoToggleAttribArrays must be implicit true
        if (arguments.length === 2) {
            texCoordAttribute = vertexAttribute.a_TexCoord;
            vertexAttribute = vertexAttribute.a_Vertex;
        }

        if (_autoToggleAttribArrays === undefined)
            _autoToggleAttribArrays = true;

        //  Prepare buffer data
        if (vertexAttribute !== null) {
            if (_autoToggleAttribArrays)
                gl.enableVertexAttribArray(vertexAttribute);
            gl.bindBuffer(gl.ARRAY_BUFFER, vBufferObject);
            gl.vertexAttribPointer(vertexAttribute, 2, gl.FLOAT, false, 0, 0);
        }

        if (texCoordAttribute !== null) {
            if (_autoToggleAttribArrays)
                gl.enableVertexAttribArray(texCoordAttribute);
            gl.bindBuffer(gl.ARRAY_BUFFER, tcBufferObject);
            gl.vertexAttribPointer(texCoordAttribute, 2, gl.FLOAT, false, 0, 0);
        }



        //  Invoke render operation
        gl.drawArrays(gl.TRIANGLES, 0, 6);



        if (_autoToggleAttribArrays) {
            if (vertexAttribute !== undefined)
                gl.disableVertexAttribArray(vertexAttribute);
            if (texCoordAttribute !== undefined)
                gl.disableVertexAttribArray(texCoordAttribute);
        }
    };

    FullscreenQuad.instance = new FullscreenQuad();



    window.FullscreenQuad = FullscreenQuad;

})();