/**
 * Created by tylercamp on 9/26/14.
 */

;(function() {

    "use strict";

    //  https://software.intel.com/en-us/blogs/2014/07/15/an-investigation-of-fast-real-time-gpu-based-image-blur-algorithms

    var intermediateBuffers;

    var hShader, vShader;

    var hShaderParams = { };
    var vShaderParams = { };

    var screenQuad;

    
    window.Blur = {
        init: function init(gl, horizontalVertShaderText, verticalVertShaderText, fragShaderText) {
            if (!intermediateBuffers)
                intermediateBuffers = new BufferCollection();

            var errorString;

            var hVertShader = gl.createShader(gl.VERTEX_SHADER);
            var vVertShader = gl.createShader(gl.VERTEX_SHADER);
            var fragShader = gl.createShader(gl.FRAGMENT_SHADER);

            gl.shaderSource(hVertShader, horizontalVertShaderText);
            gl.shaderSource(vVertShader, verticalVertShaderText);
            gl.shaderSource(fragShader, fragShaderText);

            gl.compileShader(hVertShader);
            errorString = gl.getShaderInfoLog(hVertShader);
            if (errorString) console.warn('hVertShader error', errorString);

            gl.compileShader(vVertShader);
            errorString = gl.getShaderInfoLog(vVertShader);
            if (errorString) console.warn('vVertShader error', errorString);

            gl.compileShader(fragShader);
            errorString = gl.getShaderInfoLog(fragShader);
            if (errorString) console.warn('fragShader error', errorString);


            hShader = gl.createProgram();
            vShader = gl.createProgram();

            gl.attachShader(hShader, hVertShader);
            gl.attachShader(hShader, fragShader);

            gl.attachShader(vShader, vVertShader);
            gl.attachShader(vShader, fragShader);



            gl.linkProgram(hShader);
            errorString = gl.getProgramInfoLog(hShader);
            if (errorString) console.warn('Blur horizontal-shader linking error', errorString);

            gl.linkProgram(vShader);
            errorString = gl.getProgramInfoLog(vShader);
            if (errorString) console.warn('Blur vertical-shader linking error', errorString);


            hShaderParams.a_Vertex = gl.getAttribLocation(hShader, 'a_Vertex');
            hShaderParams.a_TexCoord = gl.getAttribLocation(hShader, 'a_TexCoord');
            hShaderParams.u_SourceTexture = gl.getUniformLocation(hShader, 'u_SourceTexture');

            vShaderParams.a_Vertex = gl.getAttribLocation(vShader, 'a_Vertex');
            vShaderParams.a_TexCoord = gl.getAttribLocation(vShader, 'a_TexCoord');
            vShaderParams.u_SourceTexture = gl.getUniformLocation(vShader, 'u_SourceTexture');

            screenQuad = new FullscreenQuad();

            gl.enable(gl.BLEND);
        },

        render: function generateGaussianBlur(gl, target, sourceTexture, sourceWidth, sourceHeight, autoClear_) {
            var intermediateBuffer = intermediateBuffers.getBuffer(gl, sourceWidth, sourceHeight);

            autoClear_ = autoClear_ || false;

            gl.disable(gl.DEPTH_TEST);

            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, sourceTexture);

            //  Set framebuffer to internal buffer
            gl.bindFramebuffer(gl.FRAMEBUFFER, intermediateBuffer.fbo);
            gl.clear(gl.COLOR_BUFFER_BIT);

            gl.useProgram(hShader);
            gl.uniform1i(hShaderParams.u_SourceTexture, 0);
            screenQuad.render(gl, hShaderParams.a_Vertex, hShaderParams.a_TexCoord);

            //  Set framebuffer to target, set texture to rendertexture from internal buffer
            gl.bindFramebuffer(gl.FRAMEBUFFER, target);
            if (autoClear_)
                gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            gl.bindTexture(gl.TEXTURE_2D, intermediateBuffer.renderTexture);
            gl.useProgram(vShader);
            gl.uniform1i(vShaderParams.u_SourceTexture, 0);
            screenQuad.render(gl, vShaderParams.a_Vertex, vShaderParams.a_TexCoord);

            gl.enable(gl.DEPTH_TEST);
        }

    };

})();