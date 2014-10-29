/**
 * Created by tylercamp on 10/27/14.
 *
 * Probability field conceptual summary:
 *
 *  A probability field is a 2D array containing weights that determine the probability
 *      of selection of a point in that isoplane. Functions are composited (added) onto
 *      the field and can be of any form, linear and exponential are the only 2 used
 *      here. Since the point of this probability field is to determine the probability
 *      of vegetation being spawned, there is a "hole radius" parameter that heavily
 *      decreases the probability around the center of the function's gradient. At the
 *      boundary of that hole the net probability of the function is +1, and decreases
 *      according to the linear/exponential properties of the function.
 *
 *  When the field is sampled the values are grouped into bands, and the sum of the
 *      isovalues in each band determines the likelyhood of selection of a value in
 *      that band. i.e. if there are 500 10% samples and 5 90% samples, their normalized
 *      probabilities (in bands) will sort to ~91% chance of selection in the 10% band,
 *      and ~9% selection in the 90% band, despite the larger individual weights of the
 *      90% bands. Thus, the individual weights can be less important in the system than
 *      the overall diffusion of the different band values.
 *
 *  A random value is generated from 0 - 1 and is used to index into the normalized
 *      band probabilities. When a band (isoplane) has been identified from this indexing
 *      the nearest point to the parent vegetation on that plane should be used (not
 *      a hard rule) as the point where the vegetation will be placed.
 *
 *
 *  Note:
 *      - It may be more appropriate to use a B-spline as a general function for field composition.
 *      - Apply a ramp to the field when determining band sizes to give more meaning to heavy weights
 *
 *
 *      Negative weights? Isovalues of '0' or below (conceptually impossible options) would be
 *      normalized into bands similarly to positive bands
 *          - Only count >0 isovalues?
 *          - Should only >0 isovalues be evaluated when determining bands/normalization?
 *
 *          --- Negative isovalues should be treated as nonexistent during analysis
 *
 */

;(function() {

    "use strict";

    function readFramebufferPixels(gl, width, height) {
        var result = new Uint8Array(width * height * 4);
        gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, result);
        return result;
    }

    function runMinMaxKernel(field, width, height) {
        gl.useProgram(minMaxFilter);

    }


    var minMaxFilter = null, minMaxParams = null;

    function GPGPUProbabilityField(gl, width, height) {

    }

    GPGPUProbabilityField.prototype.debugRenderField = function renderField() {
        var gl = this.gl;
        Effect.TexturePassthrough.bind(gl, this._buffers.primary.renderTexture);
        FullscreenQuad.instance.render(gl, Effect.TexturePassthrough.params);
    };

    GPGPUProbabilityField.prototype.clear = function clearFieldTexture() {
        var gl = this.gl, framebuffer = this._buffers.primary;

        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer.fbo);
        gl.clear(gl.COLOR_BUFFER_BIT);
    };

    GPGPUProbabilityField.prototype.composite = function addFieldFunction(position, func) {

    };

    GPGPUProbabilityField.init = function init(gl, minMaxProgram, linearCompositeProgram, exponentialCompositeProgram) {
        minMaxFilter = minMaxProgram;
        minMaxParams = {
            u_SampleWidth: gl.getUniformLocation(minMaxProgram, 'u_SampleWidth'),
            u_SampleHeight: gl.getUniformLocation(minMaxProgram, 'u_SampleHeight'),
            u_SampleTexture: gl.getUniformLocation(minMaxProgram, 'u_SampleTexture'),
            u_HStep: gl.getUniformLocation(minMaxProgram, 'u_HStep'),
            u_VStep: gl.getUniformLocation(minMaxProgram, 'u_VStep')
        };
    };




    var compositionFunctions = {
        'exponential': function(currentPosition, sourcePosition, params) {
            // holeRadius, maxDistance
        },

        'linear': function(currentPosition, sourcePosition, params){
            var dx = currentPosition.x - sourcePosition.x, dy = currentPosition.y - sourcePosition.y;
            var distance = Math.sqrt(dx*dx + dy*dy);

            if (distance < params.holeRadius)
                return -(params.scale || 1) * 2;
            if (distance > params.maxDistance)
                return 0;

            return (1 - (distance - params.holeRadius) / (params.maxDistance - params.holeRadius)) * (params.scale || 1);
        },

        'no-op': function() {
            return 0;
        }
    };

    function JSProbabilityField(width, height) {
        this.data = new Float32Array(width*height);
        this.width = width;
        this.height = height;
        this.numBands = 10;
    }

    JSProbabilityField.prototype.clear = function clearFieldData() {
        var i = 0;
        for (i = 0; i < this.data.length; i++) {
            this.data[i] = 0;
        }
    };

    JSProbabilityField.prototype.composite = function addFieldFunction(position, func) {
        var compositeFunction = compositionFunctions[func.type];
        var cellPosition = { x: Math.floor(position.x), y: Math.floor(position.y) };
        var x, y, currentPosition = {};
        for (y = 0; y < this.height; y++) {
            for (x = 0; x < this.width; x++) {
                currentPosition.x = x;
                currentPosition.y = y;
                this.data[y * this.width + x] += compositeFunction(currentPosition, cellPosition, func);
            }
        }
    };

    JSProbabilityField.prototype.minMax = function minMaxSum(onlyNonNegative_) {
        onlyNonNegative_ = onlyNonNegative_ || false;
        var min = 10000, max = -10000;
        var minPos = -1, maxPos = -1, index;
        var count = 0, sum = 0;

        var x, y;
        for (y = 0; y < this.height; y++) {
            for (x = 0; x < this.width; x++) {
                index = y * this.width + x;

                if (onlyNonNegative_ && this.data[index] < 0)
                    continue;

                if (this.data[index] < min) {
                    min = this.data[index];
                    minPos = index;
                }
                if (this.data[index] > max) {
                    max = this.data[index];
                    maxPos = index;
                }

                sum += this.data[index];
                count++;
            }
        }

        var self = this;

        return {
            min: min,
            max: max,
            sum: sum,
            count: count,
            minPos: {
                x: minPos % self.width,
                y: Math.floor(minPos / self.width)
            },
            maxPos: {
                x: maxPos % self.width,
                y: Math.floor(maxPos / self.width)
            }
        };
    };

    JSProbabilityField.prototype.calculateBands = function() {
        var bands = new Array(this.numBands);
        var i;
        var minMaxSum = this.minMaxSum(true);
        var min = minMaxSum.min, max = minMaxSum.max, sum = minMaxSum.sum;

        for (i = 0; i < this.numBands; i++) {
            bands[i] = {
                min: i * (max - min) / this.numBands + min, // minimum value of probabilities in this band
                max: (i+1) * (max - min) / this.numBands + min, // maximum value of probabilities in this band
                count: 0 // number of samples in this band (calculated later)
            };
        }
    };

    JSProbabilityField.prototype.nearestPointInBand = function(targetPoint, bandMin, bandMax) {
        var x, y, nearestPoint, nearestDistance = 10000, sample, currentDistance;
        var dx, dy;
        nearestPoint = {};
        for (y = 0; y < this.height; y++) {
            for (x = 0; x < this.width; x++) {
                sample = this.data[y * this.width + x];
                if (sample >= bandMin && sample <= bandMax) {
                    dx = targetPoint.x - x;
                    dy = targetPoint.y - y;
                    currentDistance = Math.sqrt(dx*dx + dy*dy);

                    if (currentDistance < nearestDistance) {
                        nearestDistance = currentDistance;
                        nearestPoint.x = x;
                        nearestPoint.y = y;
                    }
                }
            }
        }

        return nearestPoint;
    };

    //  Debug
    JSProbabilityField.prototype.copyToCanvas = function(canvas) {
        var x, y, color, factor = 10, ctx;
        ctx = canvas.getContext('2d');
        for (y = 0; y < this.height; y++) {
            for (x = 0; x < this.width; x++) {
                var sample = this.data[y * this.width + x];
                if (sample > 0)
                    color = '0,' + Math.round(sample*factor) + ',0';
                else
                    color = Math.round(-sample * factor) + ',0,0';

                ctx.fillStyle = 'rgb(' + color + ')';
                ctx.fillRect(x, y, 1, 1);
            }
        }
    };









    window.ProbabilityField = JSProbabilityField;

})();