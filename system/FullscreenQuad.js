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

    var colors = new Float32Array([
        1, 1, 1, 1,    1, 1, 1, 1,    1, 1, 1, 1,
        1, 1, 1, 1,    1, 1, 1, 1,    1, 1, 1, 1
    ]);

    var vBufferObject, tcBufferObject, cBufferObject;

    function FullscreenQuad() {

    }

    FullscreenQuad.prototype.render = function render(gl, vertexAttribute, texCoordAttribute, colorAttribute, color_, autoToggleAttribArrays_) {

        //  Init if necessary
        if (!vBufferObject) {
            vBufferObject = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, vBufferObject);
            gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

            tcBufferObject = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, tcBufferObject);
            gl.bufferData(gl.ARRAY_BUFFER, texCoords, gl.STATIC_DRAW);

            cBufferObject = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, cBufferObject);
        }

        //  Special-case: shaderParams object is passed in as second parameter, autoToggleAttribArrays must be implicit true
        if (arguments.length === 2 || arguments.length === 3) {
            // 2: gl, params
            // 3: gl, params, color
            color_ = texCoordAttribute;
            texCoordAttribute = vertexAttribute.a_TexCoord;
            colorAttribute = vertexAttribute.a_Color;
            vertexAttribute = vertexAttribute.a_Vertex;
        }

        if (autoToggleAttribArrays_ === undefined)
            autoToggleAttribArrays_ = true;

        //  Prepare buffer data
        if (typeof vertexAttribute === "number") {
            if (autoToggleAttribArrays_)
                gl.enableVertexAttribArray(vertexAttribute);
            gl.bindBuffer(gl.ARRAY_BUFFER, vBufferObject);
            gl.vertexAttribPointer(vertexAttribute, 2, gl.FLOAT, false, 0, 0);
        }

        if (typeof texCoordAttribute === "number") {
            if (autoToggleAttribArrays_)
                gl.enableVertexAttribArray(texCoordAttribute);
            gl.bindBuffer(gl.ARRAY_BUFFER, tcBufferObject);
            gl.vertexAttribPointer(texCoordAttribute, 2, gl.FLOAT, false, 0, 0);
        }

        if (typeof colorAttribute === "number") {
            color_ = color_ || { };
            if (color_.r === undefined) color_.r = 1;
            if (color_.g === undefined) color_.g = 1;
            if (color_.b === undefined) color_.b = 1;
            if (color_.a === undefined) color_.a = 1;

            var i;
            for (i = 0; i < 6; i++) {
                colors[i*4 + 0] = color_.r;
                colors[i*4 + 1] = color_.g;
                colors[i*4 + 2] = color_.b;
                colors[i*4 + 3] = color_.a;
            }

            gl.bindBuffer(gl.ARRAY_BUFFER, cBufferObject);
            gl.bufferData(gl.ARRAY_BUFFER, colors, gl.DYNAMIC_DRAW);
            if (autoToggleAttribArrays_)
                gl.enableVertexAttribArray(colorAttribute);
            gl.vertexAttribPointer(colorAttribute, 4, gl.FLOAT, false, 0, 0);
        }



        //  Invoke render operation
        gl.drawArrays(gl.TRIANGLES, 0, 6);



        if (autoToggleAttribArrays_) {
            if (vertexAttribute !== undefined)
                gl.disableVertexAttribArray(vertexAttribute);
            if (texCoordAttribute !== undefined)
                gl.disableVertexAttribArray(texCoordAttribute);
            if (colorAttribute !== undefined)
                gl.disableVertexAttribArray(colorAttribute);
        }
    };

    FullscreenQuad.instance = new FullscreenQuad();



    window.FullscreenQuad = FullscreenQuad;

})();