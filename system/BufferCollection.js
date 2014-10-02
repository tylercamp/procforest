/**
 * Created by tylercamp on 9/29/14.
 */

;(function() {

    "use strict";

    function generateBuffer(gl, width, height, options_) {
        options_ = options_ || {
            depth: true,
            color: true,
            colorTexture: true
        };

        var result = {
            fbo: gl.createFramebuffer(),
            renderTexture: gl.createTexture(),
            width: width,
            height: height
        };

        gl.bindFramebuffer(gl.FRAMEBUFFER, result.fbo);

        if (options_.color) {
            if (options_.colorTexture) {
                gl.bindTexture(gl.TEXTURE_2D, result.renderTexture);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
                gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, result.renderTexture, 0);
            }
            else {
                console.warn('BufferCollection only supports texture storage for renderbuffer color components');
            }
        }

        var depthBuffer;

        if (options_.depth) {
            depthBuffer = gl.createRenderbuffer();
            gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer);
            gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);
            gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthBuffer);
        }

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.bindTexture(gl.TEXTURE_2D, null);

        return result;
    }

    function BufferCollection() {
        this.bufferData = [];
    }

    BufferCollection.prototype.getBuffer = function (gl, width, height, name_) {
        var result = null;
        //  Default name of null
        name_ = name_ || null;

        this.bufferData.forEach(function (buffer) {
            if (buffer.width === width && buffer.height === height) {
                if (name_ === buffer.name)
                    result = buffer;
            }
        });

        if (!result) {
            result = generateBuffer(gl, width, height);
            result.name = name_;
            this.bufferData.push(result);
        }

        return result;
    };

    window.BufferCollection = BufferCollection;

})();