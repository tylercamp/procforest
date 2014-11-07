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
            this.maxSpeed = 1.3;
            this.velocity = { x: 0, y: 0, z: 0 };
            this.friction = 3;

            this._gotInput = false;
        }

        CameraController.prototype.update = function(deltaTime) {
            this.x += this.velocity.x * deltaTime;
            this.y += this.velocity.y * deltaTime;
            this.z += this.velocity.z * deltaTime;

            var currentSpeed = Math.magnitude(this.velocity);
            if (currentSpeed > 0 && !this._gotInput) {
                if (currentSpeed - this.friction * deltaTime < 0) {
                    this.velocity = {
                        x: 0, y: 0, z: 0
                    };
                }
                else {
                    this.velocity = Math.vecSum(this.velocity, Math.vecOfLength(Math.vecNegate(this.velocity), this.friction * deltaTime));
                }
            }

            this._gotInput = false;
        };

        CameraController.prototype.move = function (yAngle, speed) {
            this._gotInput = true;
            var rotation = {
                x: Math.toRadians(this.rotation.x),
                y: Math.toRadians(this.rotation.y + yAngle)
            };

            //var moveVector = Math.fromSphericalCoordinate(rotation.y, rotation.x);
            var moveVector = Math.vecOfLength(Math.fromSphericalCoordinate(rotation.y, 0), speed);
            this.velocity = Math.vecSum(moveVector, this.velocity);
            if (Math.magnitude(this.velocity) > this.maxSpeed)
                this.velocity = Math.vecOfLength(this.velocity, this.maxSpeed);
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