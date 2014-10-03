/**
 * Created by tylercamp on 10/2/14.
 */

;(function() {

    "use strict";

    function Timeline() {
        this._tickListeners = [];
        this._tick = 0;
    }

    Timeline.prototype.tick = function tick(numTicks_) {
        var tick, i;
        numTicks_ = numTicks_ || 1;

        for (tick = 0; tick < numTicks_; tick++) {
            this._tick++;

            for (i = 0; i < this._tickListeners.length; i++) {
                this._tickListeners[i](this._tick);
            }
        }
    };

    Timeline.prototype.getTick = function getCurrentTick() {
        return this._tick;
    };

    Timeline.prototype.onTick = function addOnTickListener(listener) {
        this._tickListeners.push(listener);
    };

    window.Timeline = Timeline;

})();