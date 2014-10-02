/**
 * Created by tylercamp on 9/11/14.
 */

;(function() {

    "use strict";

    //  TODO: Incorrect, but works with the camera system
    Math.fromSphericalCoordinate = function (rot, incline) {
        return {
            x: Math.cos(rot) * Math.cos(incline),
            y: Math.sin(incline),
            z: Math.sin(rot) * Math.cos(incline)
        };
    };

    Math.pi = 3.1415926535;
    Math.pi_2 = 1.5707963268;
    Math.tau = 6.2831853071;

    Math.toRadians = function degreesToRadians(degrees) {
        return degrees * (Math.pi / 180.0);
    };

    Math.toDegrees = function radiansToDegrees(radians) {
        return radians * (180 / Math.pi);
    };

    Math.sqr = function squareOfNumber(number) {
        return number * number;
    };

    Math.clamp = function clampNumberBetweenValues(number, min, max) {
        if (number < min) return min;
        if (number > max) return max;
        return number;
    };

    Math.normal = function normalizedVector(vectorObject) {
        var mag = Math.sqrt(vectorObject.x * vectorObject.x + vectorObject.y * vectorObject.y + vectorObject.z * vectorObject.z);

        return {
            x: vectorObject.x / mag,
            y: vectorObject.y / mag,
            z: vectorObject.z / mag
        };
    };

    Math.normalize = function normalizeExistingVector(vectorObject) {
        var mag = Math.sqrt(vectorObject.x * vectorObject.x + vectorObject.y * vectorObject.y + vectorObject.z * vectorObject.z);

        vectorObject.x /= mag;
        vectorObject.y /= mag;
        vectorObject.z /= mag;
    };

    Math.cross = function vectorCrossProduct(leftVecObject, rightVecObject) {
        return { x: leftVecObject.y * rightVecObject.z - leftVecObject.z * rightVecObject.y,
            y: leftVecObject.z * rightVecObject.x - leftVecObject.x * rightVecObject.z,
            z: leftVecObject.x * rightVecObject.y - leftVecObject.y * rightVecObject.x }
    };



    window.Utility = {};

    //  http://stackoverflow.com/questions/2901102/how-to-print-a-number-with-commas-as-thousands-separators-in-javascript
    Utility.numberWithCommas = function numberWithCommas(x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    };

    Utility.timedOp = function timedOp(label, func) {
        var start = (new Date()).valueOf();
        var result = func();
        var end = (new Date()).valueOf();

        console.log(label, (end - start) / 1000 + 's')

        return result;
    }

})();