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

    //  Unused for now
    function generateKernel(size) {
        //  Pascal's triangle method
        var gen_a = [1], gen_b = [], i, j;
        for (i = 1; i < size; i++) {
            gen_b = new Array(gen_a.length + 1);
            for (j = 0; j < gen_b.length; j++) {
                gen_b[j] = 0;
            }

            for (j = 0; j < gen_a.length; j++) {
                gen_b[j] += gen_a[j];
                gen_b[j+1] += gen_a[j];
            }

            gen_a = gen_b;
        }

        var sum = 0;
        for (i = 0; i < gen_a.length; i++) {
            sum += gen_a[i];
        }

        for (i = 0; i < gen_a.length; i++) {
            gen_a[i] /= sum;
        }

        return gen_a;
    }

    
    window.Blur = {
        sampleStride: 3,
        intensityRamp: 1.5,
        intensityFactor: 1.5,

        init: function init(gl, horizontalVertShaderText, verticalVertShaderText, fragShaderText) {
            if (!intermediateBuffers)
                intermediateBuffers = {
                    horizontal: new BufferCollection(),
                    vertical: new BufferCollection()
                };

            var errorString;

            var hVertShader = gl.createShader(gl.VERTEX_SHADER);
            var vVertShader = gl.createShader(gl.VERTEX_SHADER);
            var vertShader = gl.createShader(gl.FRAGMENT_SHADER);

            gl.shaderSource(hVertShader, horizontalVertShaderText);
            gl.shaderSource(vVertShader, verticalVertShaderText);
            gl.shaderSource(vertShader, fragShaderText);

            gl.compileShader(hVertShader);
            errorString = gl.getShaderInfoLog(hVertShader);
            if (errorString) console.warn('hVertShader error', errorString);

            gl.compileShader(vVertShader);
            errorString = gl.getShaderInfoLog(vVertShader);
            if (errorString) console.warn('vVertShader error', errorString);

            gl.compileShader(vertShader);
            errorString = gl.getShaderInfoLog(vertShader);
            if (errorString) console.warn('vertShader error', errorString);


            hShader = gl.createProgram();
            vShader = gl.createProgram();

            gl.attachShader(hShader, hVertShader);
            gl.attachShader(hShader, vertShader);

            gl.attachShader(vShader, vVertShader);
            gl.attachShader(vShader, vertShader);



            gl.linkProgram(hShader);
            errorString = gl.getProgramInfoLog(hShader);
            if (errorString) console.warn('Blur horizontal-shader linking error', errorString);

            gl.linkProgram(vShader);
            errorString = gl.getProgramInfoLog(vShader);
            if (errorString) console.warn('Blur vertical-shader linking error', errorString);


            hShaderParams.a_Vertex = gl.getAttribLocation(hShader, 'a_Vertex');
            hShaderParams.a_TexCoord = gl.getAttribLocation(hShader, 'a_TexCoord');
            hShaderParams.u_SourceTexture = gl.getUniformLocation(hShader, 'u_SourceTexture');
            hShaderParams.u_PixelSize = gl.getUniformLocation(hShader, 'u_PixelSize');
//            hShaderParams.u_Kernel = gl.getUniformLocation(hShader, 'u_Kernel');
//            hShaderParams.u_KernelSize = gl.getUniformLocation(hShader, 'u_KernelSize');
//            hShaderParams.u_IntensityRamp = gl.getUniformLocation(hShader, 'u_IntensityRamp');
//            hShaderParams.u_IntensityFactor = gl.getUniformLocation(hShader, 'u_IntensityFactor');

            vShaderParams.a_Vertex = gl.getAttribLocation(vShader, 'a_Vertex');
            vShaderParams.a_TexCoord = gl.getAttribLocation(vShader, 'a_TexCoord');
            vShaderParams.u_SourceTexture = gl.getUniformLocation(vShader, 'u_SourceTexture');
            vShaderParams.u_PixelSize = gl.getUniformLocation(vShader, 'u_PixelSize');
//            vShaderParams.u_Kernel = gl.getUniformLocation(vShader, 'u_Kernel');
//            vShaderParams.u_KernelSize = gl.getUniformLocation(vShader, 'u_KernelSize');
//            vShaderParams.u_IntensityRamp = gl.getUniformLocation(vShader, 'u_IntensityRamp');
//            vShaderParams.u_IntensityFactor = gl.getUniformLocation(vShader, 'u_IntensityFactor');

            screenQuad = new FullscreenQuad();

            gl.enable(gl.BLEND);
        },

        render: function generateGaussianBlur(gl, target, sourceTexture, sourceWidth, sourceHeight, autoClear_) {
            var hBuffer = intermediateBuffers.horizontal.getBuffer(gl, sourceWidth, sourceHeight);
            var vBuffer = intermediateBuffers.vertical.getBuffer(gl, sourceWidth, sourceHeight);

            autoClear_ = autoClear_ || false;

            gl.disable(gl.DEPTH_TEST);
            gl.activeTexture(gl.TEXTURE0);


            { // Horizontal pass
                gl.bindTexture(gl.TEXTURE_2D, sourceTexture);
                gl.bindFramebuffer(gl.FRAMEBUFFER, hBuffer.fbo);
                gl.clear(gl.COLOR_BUFFER_BIT);

                gl.useProgram(hShader);
                gl.uniform1i(hShaderParams.u_SourceTexture, 0);
                //gl.uniform1i(hShaderParams.u_KernelSize, this.kernelSize);
                //gl.uniform1f(hShaderParams.u_IntensityFactor, this.intensityFactor);
                //gl.uniform1f(hShaderParams.u_IntensityRamp, this.intensityRamp);
                gl.uniform1f(hShaderParams.u_PixelSize, 1 / sourceWidth * this.sampleStride);
                //gl.uniform1fv(hShaderParams.u_Kernel, this._currentKernel);
                screenQuad.render(gl, hShaderParams.a_Vertex, hShaderParams.a_TexCoord);
            }

            { // Vertical pass
                gl.bindTexture(gl.TEXTURE_2D, hBuffer.renderTexture);
                gl.bindFramebuffer(gl.FRAMEBUFFER, vBuffer.fbo);
                gl.clear(gl.COLOR_BUFFER_BIT);
                gl.useProgram(vShader);

                gl.uniform1i(vShaderParams.u_SourceTexture, 0);
                //gl.uniform1i(vShaderParams.u_KernelSize, this.kernelSize);
                //gl.uniform1f(vShaderParams.u_IntensityFactor, this.intensityFactor);
                //gl.uniform1f(vShaderParams.u_IntensityRamp, this.intensityRamp);
                gl.uniform1f(vShaderParams.u_PixelSize, 1 / sourceHeight * this.sampleStride);
                //gl.uniform1fv(vShaderParams.u_Kernel, this._currentKernel);
                screenQuad.render(gl, vShaderParams.a_Vertex, vShaderParams.a_TexCoord);
            }


            //  Render to target
            gl.bindFramebuffer(gl.FRAMEBUFFER, target);
            if (autoClear_)
                gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            Effect.TexturePassthrough.bind(gl, vBuffer.renderTexture);
            screenQuad.render(gl, Effect.TexturePassthrough.params);

            gl.enable(gl.DEPTH_TEST);
        }
    };

})();