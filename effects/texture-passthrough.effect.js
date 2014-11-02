/**
 * Created by tylercamp on 9/27/14.
 */

;(function() {

    "use strict";
    
    window.Effect = window.Effect || {};

    window.Effect.TexturePassthrough = {
        init: function (gl, passthroughVertex, passthroughFragment) {
            this.program = glHelper.generateShader(gl, passthroughVertex, passthroughFragment);

            gl.useProgram(this.program);
            this.params.a_Vertex = gl.getAttribLocation(this.program, 'a_Vertex');
            this.params.a_TexCoord = gl.getAttribLocation(this.program, 'a_ScreenTexCoord');
            this.params.a_Color = gl.getAttribLocation(this.program, 'a_Color');
            this.params.u_ScreenTexture = gl.getUniformLocation(this.program, 'u_ScreenTexture');

            this._colorBuffer = gl.createBuffer();
        },

        bind: function (gl, textureObject) {
            gl.useProgram(this.program);
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, textureObject);
            gl.uniform1i(this.params.u_ScreenTexture, 0);
        },

        params: {
            //  Filled in init()
        }
    };

})();