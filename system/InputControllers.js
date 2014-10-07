/**
 * Created by tylercamp on 8/9/14.
 */

(function () {

    "use strict";

    window.KeyboardController = (function() {

        function onKeyEvent(e) {
            switch (e.type) {
                case ('keydown'):
                    this._keyboardStates[e.keyCode] = true;
                    if (this._onKeyListeners[e.keyCode]) {
                        this._onKeyListeners[e.keyCode].forEach(function (listener) {
                            listener();
                        });
                    }
                    break;

                case ('keyup'):
                    this._keyboardStates[e.keyCode] = false;
                    break;
            }
        }

        function KeyboardController(target) {
            this._keyboardStates = [];
            this._onKeyListeners = {};
            for (var i = 0; i < 255; i++) {
                this._keyboardStates[i] = false;
            }

            this.target = target;

            //  assigning tabindex allows the element to be selectable/receive keyboard input
            if (this.target.setAttribute)
                this.target.setAttribute("tabindex", '1');

            this.target.addEventListener('keydown', onKeyEvent.bind(this));
            this.target.addEventListener('keyup', onKeyEvent.bind(this));
        }

        KeyboardController.prototype.checkKey = function(keyCode) {
            if (typeof keyCode === 'string')
                keyCode = keyCode.charCodeAt(0);

            return this._keyboardStates[keyCode];
        };

        KeyboardController.prototype.onKey = function(keyCode, handler) {
            var charCode;
            if (typeof keyCode === 'number')
                charCode = keyCode;
            else
                charCode = keyCode.charCodeAt(0);

            if (!this._onKeyListeners[charCode])
                this._onKeyListeners[charCode] = [handler];
            else
                this._onKeyListeners[charCode].push(handler);
        };

        return KeyboardController;

    })();

    window.MouseController = (function () {

        function mouseEventHandler(e) {
            var factor = this.scaleForDevicePixelRatio ? (window.devicePixelRatio || 1) : 1;
            this._lastPosition = { x: e.layerX * factor, y: e.layerY * factor };

            if (e.type === "mouseup")
                this._buttonStates[e.button] = false;
            if (e.type === "mousedown")
                this._buttonStates[e.button] = true;
            if (e.type === "mousemove") {
                //  Prevent click-drag on element from changing cursor/selecting text
                e.preventDefault();
            }
        }

        function MouseController(target) {
            this.target = target;
            if (typeof target === 'string')
                this.target = document.querySelector(target);

            this.target.addEventListener('mousemove', mouseEventHandler.bind(this));
            this.target.addEventListener('mousedown', mouseEventHandler.bind(this));
            this.target.addEventListener('mouseup', mouseEventHandler.bind(this));
            this.scaleForDevicePixelRatio = true;

            this._lastPosition = { x: 0, y: 0 };
            this._buttonStates = [false, false, false];
        }

        MouseController.prototype.getPosition = function getMousePosition() {
            return { x: this._lastPosition.x, y: this._lastPosition.y };
        };

        MouseController.prototype.checkButton = function checkButton(index) {
            return this._buttonStates[index];
        };

        MouseController.prototype.checkLeftButton = function checkLeftButton() {
            return this.checkButton(0);
        };

        MouseController.prototype.checkRightButton = function checkRightButton() {
            return this.checkButton(2);
        };

        return MouseController;
    })();

})();