/**
 * Created by tylercamp on 9/27/14.
 */

;(function() {

    "use strict";

    function resetStats(object) {
        object = object || {};
        object.drawElements = 0;
        object.drawArrays = 0;
        object.bindTexture = 0;
        object.bindFramebuffer = 0;
        object.clear = 0;
        object.useProgram = 0;
        object.enableVAA = 0;
        object.disableVAA = 0;

        if (object.totalTextures === undefined)
            object.totalTextures = 0;
        if (object.totalFramebuffers === undefined)
            object.totalFramebuffers = 0;
        if (object.totalShaderPrograms === undefined)
            object.totalShaderPrograms = 0;
    }
    
    function PerformanceMonitor(gl) {
        this.hookToGL(gl);
        this.statsTotal = {};
        resetStats(this.statsTotal);

        this._onStatsUpdateListeners = [];
    }

    PerformanceMonitor.prototype.beginMonitoring = function clearStatsAndStartInterval() {
        var self = this;
        resetStats(self.statsTotal);

        setInterval(function() {
            self._onStatsUpdateListeners.forEach(function (listener) {
                listener(self.statsTotal);
            });
            resetStats(self.statsTotal);
        }, 1000);
    };



    PerformanceMonitor.prototype.hookToGL = function hookToWebGLObject(gl) {
        var self = this;

        function genHook(glFuncName, propertyName) {
            var originalFunc = gl[glFuncName];
            gl[glFuncName] = function() {
                self.statsTotal[propertyName]++;
                return originalFunc.apply(gl, arguments);
            };
        }

        genHook('drawArrays', 'drawArrays');
        genHook('drawElements', 'drawElements');
        genHook('bindTexture', 'bindTexture');
        genHook('bindFramebuffer', 'bindFramebuffer');
        genHook('clear', 'clear');
        genHook('createTexture', 'totalTextures');
        genHook('createFramebuffer', 'totalFramebuffers');
        genHook('createProgram', 'totalShaderPrograms');
        genHook('useProgram', 'useProgram');
        genHook('enableVertexAttribArray', 'enableVAA');
        genHook('disableVertexAttribArray', 'disableVAA');
    };

    PerformanceMonitor.prototype.onStatsUpdate = function(handler) {
        this._onStatsUpdateListeners.push(handler);
    };


    window.PerformanceMonitor = PerformanceMonitor;

})();