/**
 * Created by tylercamp on 8/9/14.
 */

;(function() {

    //  TODO: Use

    "use strict";

    //  Assumes step/render occur in the same loop
    window.TimeController = function TimeController(_initialFps) {
        this._lastRenderTime = new Date();
        this._lastFpsUpdateTime = new Date();

        this._fps = _initialFps || 0;
        this._delta = _initialFps ? 1000 / _initialFps : 0;
        this._countedFrames = 0;

        this._onFpsChangeListeners = [];
    };

    TimeController.prototype.getFps = function getFps() {
        return this._fps;
    };

    TimeController.prototype.markNewFrame = function markNewFrame() {
        this._countedFrames++;

        var currentTime = new Date();
        this._delta = (currentTime.valueOf() - this._lastRenderTime.valueOf()) / 1000.0;
        this._lastRenderTime = currentTime;


        var msSinceFpsUpdate = currentTime.valueOf() - this._lastFpsUpdateTime.valueOf();
        if (msSinceFpsUpdate >= 1000) {
            this._fps = this._countedFrames;
            this._countedFrames = 0;
            this._lastFpsUpdateTime = currentTime;

            var fps = this._fps;
            this._onFpsChangeListeners.forEach(function (listener) {
                listener(fps);
            });
        }
    };

    TimeController.prototype.onFpsChange = function addOnFpsChangeHandler(handler) {
        this._onFpsChangeListeners.push(handler);
    };

    TimeController.prototype.getDelta = function getDelta() {
        return this._delta;
    };

})();