/**
 * Created by tylercamp on 8/9/14.
 */

;(function() {

    "use strict";
    
    window.glHelper = {
        //  resourceNameMapping is an object of format:
        //  { resourceName: "uri/to/resource.png" }
        //
        //  The object passed into onComplete will be of format:
        //  { resourceName: loadedResourceObject }
        //
        pollResources: function pollResources(onComplete, resourceNameMapping) {
            var result = {};
            var resourceNames = [];

            for (var resourceName in resourceNameMapping) {
                if (!resourceNameMapping.hasOwnProperty(resourceName))
                    continue;
                resourceNames.push(resourceName);
            }

            resourceNames.forEach(function (resourceName, index) {
                var uri = resourceNameMapping[resourceName];

                if ((/\.(gif|jpg|jpeg|tiff|png)$/i).test(uri)) {
                    //console.log('Matched image', uri);

                    var image = new Image();

                    image.onload = function () {
                        //console.log('Polled image w', image.width, 'h', image.height);

                        resourceNames.splice(resourceNames.indexOf(resourceName),  1);
                        result[resourceName] = this;

                        if (resourceNames.length === 0)
                            onComplete(result);
                    }.bind(image);

                    image.src = uri;
                }
                else {
                    $.get(uri, null, function (resourceData) {
                        //console.log('Finished polling ' + resourceName, arguments);

                        resourceNames.splice(resourceNames.indexOf(resourceName), 1);
                        result[resourceName] = resourceData;

                        if (resourceNames.length === 0)
                            onComplete(result);
                    });
                }
            });
        },

        generateTextureObject: function generateTextureObjectFromImage(gl, imageObject, _repeatMode) {
            var texture = gl.createTexture();

            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
            gl.bindTexture(gl.TEXTURE_2D, texture);

            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, imageObject);

            gl.generateMipmap(gl.TEXTURE_2D);

            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, _repeatMode || gl.REPEAT);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, _repeatMode || gl.REPEAT);

            if (gl.ext && gl.ext.TEXTURE_MAX_ANISOTROPY_EXT) {
                gl.texParameteri(gl.TEXTURE_2D, gl.ext.TEXTURE_MAX_ANISOTROPY_EXT, 4);
            }

            return texture;
        },

        generateShader: function generateShader(gl, vertexSource, fragmentSource) {
            var vertexShaderObject = gl.createShader(gl.VERTEX_SHADER);
            var fragmentShaderObject = gl.createShader(gl.FRAGMENT_SHADER);
            var errorString = null;

            gl.shaderSource(vertexShaderObject, vertexSource);
            gl.shaderSource(fragmentShaderObject, fragmentSource);

            gl.compileShader(vertexShaderObject);
            errorString = gl.getShaderInfoLog(vertexShaderObject);
            if (errorString) {
                console.warn('Vertex shader error', errorString);
            }

            gl.compileShader(fragmentShaderObject);
            errorString = gl.getShaderInfoLog(fragmentShaderObject);
            if (errorString) {
                console.warn('Fragment shader error', errorString);
            }

            var programObject = gl.createProgram();
            gl.attachShader(programObject, vertexShaderObject);
            gl.attachShader(programObject, fragmentShaderObject);

            gl.linkProgram(programObject);

            errorString = gl.getProgramInfoLog(programObject);
            if (errorString) {
                console.warn('Shader linking error', errorString);
            }

            return programObject;
        },

        //  Handles canvas sizing, taking high-DPI displays into account (i.e. retina)
        //  https://www.khronos.org/webgl/wiki/HandlingHighDPI
        setCanvasSize: function setCanvasSize(canvasObject, width, height) {

            width = Math.floor(width);
            height = Math.floor(height);

            // set the display size of the canvas.
            canvasObject.style.width = width + "px";
            canvasObject.style.height = height + "px";

            // set the size of the drawingBuffer
            //var devicePixelRatio = window.devicePixelRatio || 1;
            var devicePixelRatio = 1;
            canvasObject.width = Math.round(width * devicePixelRatio);
            canvasObject.height = Math.round(height * devicePixelRatio);
        },

        enableAttribArrays: function enableShaderAttributeArrays(gl, attribArray) {
            var i;
            for (i = 0; i < attribArray.length; i++) {
                gl.enableVertexAttribArray(attribArray[i]);
            }
        },

        disableAttribArrays: function disableShaderAttributeArrays(gl, attribArray) {
            var i;
            for (i = 0; i < attribArray.length; i++) {
                gl.disableVertexAttribArray(attribArray[i]);
            }
        }
    };

})();