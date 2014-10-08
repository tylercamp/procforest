/**
 * Created by tylercamp on 9/11/14.
 */

;(function() {

    "use strict";

    //  TODO: Incorrect, but works with the camera system
    Math.fromSphericalCoordinate = function (rot, incline, radius_) {
        radius_ = radius_ || 1;
        return {
            x: Math.cos(rot) * Math.cos(incline) * radius_,
            y: Math.sin(incline) * radius_,
            z: Math.sin(rot) * Math.cos(incline) * radius_
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

    Math.magnitude = function magnitudeOfVector(vectorObject) {
        return Math.sqrt(vectorObject.x * vectorObject.x + vectorObject.y * vectorObject.y + vectorObject.z * vectorObject.z);
    };

    Math.cross = function vectorCrossProduct(leftVecObject, rightVecObject) {
        return { x: leftVecObject.y * rightVecObject.z - leftVecObject.z * rightVecObject.y,
            y: leftVecObject.z * rightVecObject.x - leftVecObject.x * rightVecObject.z,
            z: leftVecObject.x * rightVecObject.y - leftVecObject.y * rightVecObject.x }
    };

    Math.vecOfLength = function(sourceVector, length) {
        var conversionFactor = length / Math.magnitude(sourceVector);
        return {
            x: sourceVector.x * conversionFactor,
            y: sourceVector.y * conversionFactor,
            z: sourceVector.z * conversionFactor
        };
    };



    Math.vecLerp = function lerpVectors(normal, v1, v2) {
        normal = Math.clamp(normal, 0, 1);
        var normal_i = 1 - normal;
        return {
            x: v1.x * normal_i + v2.x * normal,
            y: v1.y * normal_i + v2.y * normal,
            z: v1.z * normal_i + v2.z * normal
        };
    };

    Math.vecModulate = function modulateVectorAngle(vector, azimuth, inclination) {
        //  http://mathworld.wolfram.com/SphericalCoordinates.html
        var length = Math.magnitude(vector);
        var currentAzimuth, currentInclination;

        //  May need to be z/x instead of x/z
        currentAzimuth = Math.atan2(vector.z, vector.x);
        currentInclination = Math.asin(vector.y / length);

        return Math.fromSphericalCoordinate(currentAzimuth + azimuth, currentInclination + inclination, length);
    };

    //  Returns a vector with re-set azimuth/inclination for non-null angles
    Math.vecModulateAbsolute = function setVectorAngle(vector, azimuth, inclination) {
        //  http://mathworld.wolfram.com/SphericalCoordinates.html
        var length = Math.magnitude(vector);
        var currentAzimuth, currentInclination;

        //  May need to be z/x instead of x/z
        currentAzimuth = Math.atan2(vector.z, vector.x);
        currentInclination = Math.asin(vector.y / length);

        if (azimuth || azimuth === 0)
            currentAzimuth = azimuth;
        if (inclination || inclination === 0)
            currentInclination = inclination;

        return Math.fromSphericalCoordinate(currentAzimuth, currentInclination, length);
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