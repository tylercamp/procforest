/**
 * Created by tylercamp on 8/9/14.
 */

(function() {

    "use strict";

    window.CameraController = (function () {

        function CameraController() {
            this.x = 0;
            this.y = 0;
            this.z = 0;
            this.rotation = { x: 0, y: 0 };
        }


        CameraController.prototype.move = function (yAngle, speed) {
            var rotation = {
                x: Math.toRadians(this.rotation.x),
                y: Math.toRadians(this.rotation.y + yAngle)
            };

            //var moveVector = Math.fromSphericalCoordinate(rotation.y, rotation.x);
            var moveVector = Math.fromSphericalCoordinate(rotation.y, 0);
            this.x += moveVector.x * speed;
            this.y += moveVector.y * speed;
            this.z += moveVector.z * speed;
        };

        CameraController.prototype.moveForward = function moveForward(speed) {
            this.move(-90, speed);
        };

        CameraController.prototype.moveBackward = function moveBackward(speed) {
            this.move(90, speed);
        };

        CameraController.prototype.moveLeft = function moveLeft(speed) {
            this.move(180, speed);
        };

        CameraController.prototype.moveRight = function moveRight(speed) {
            this.move(0, speed);
        };

        return CameraController;
    })();
})();