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
        return {
            x: leftVecObject.y * rightVecObject.z - leftVecObject.z * rightVecObject.y,
            y: leftVecObject.z * rightVecObject.x - leftVecObject.x * rightVecObject.z,
            z: leftVecObject.x * rightVecObject.y - leftVecObject.y * rightVecObject.x
        };
    };

    Math.dot = function vectorDotProduct(leftVecObject, rightVecObject) {
        return leftVecObject.x * rightVecObject.x + leftVecObject.y * rightVecObject.y + leftVecObject.z * rightVecObject.z;
    };

    Math.perpVector = function perpendicularVector(vecObject) {
        var result = {
            x: -vecObject.y,
            y: vecObject.x,
            z: vecObject.z
        };

        return result;

        //  0.01 floating-point tolerance
        if (Math.abs(Math.dot(vecObject, result)) < 0.01)
            return result;
        else return {
            x: vecObject.x,
            y: vecObject.z,
            z: -vecObject.y
        }
    };

    Math.vecOfLength = function(sourceVector, length) {
        var conversionFactor = length / Math.magnitude(sourceVector);
        return {
            x: sourceVector.x * conversionFactor,
            y: sourceVector.y * conversionFactor,
            z: sourceVector.z * conversionFactor
        };
    };

    Math.vecLerp = function lerpVectors(ratio, v1, v2) {
        ratio = Math.clamp(ratio, 0, 1);
        var normal_i = 1 - ratio;
        return {
            x: v1.x * normal_i + v2.x * ratio,
            y: v1.y * normal_i + v2.y * ratio,
            z: v1.z * normal_i + v2.z * ratio
        };
    };

    Math.vecModulate = function modulateVectorAngle(vector, azimuth, inclination) {
        //  http://mathworld.wolfram.com/SphericalCoordinates.html
        var length = Math.magnitude(vector);
        var currentAzimuth, currentInclination;

        currentAzimuth = Math.atan2(vector.z, vector.x);
        currentInclination = Math.asin(vector.y / length);

        return Math.fromSphericalCoordinate(currentAzimuth + azimuth, currentInclination + inclination, length);
    };

    //  Returns a vector with re-set azimuth/inclination for non-null angles (based on spherical coordinate calculations)
    Math.vecModulateAbsolute = function setVectorAngle(vector, azimuth, inclination) {
        //  http://mathworld.wolfram.com/SphericalCoordinates.html
        var length = Math.magnitude(vector);
        var currentAzimuth, currentInclination;

        currentAzimuth = Math.atan2(vector.z, vector.x);
        currentInclination = Math.asin(vector.y / length);

        if (azimuth || azimuth === 0)
            currentAzimuth = azimuth;
        if (inclination || inclination === 0)
            currentInclination = inclination;

        return Math.fromSphericalCoordinate(currentAzimuth, currentInclination, length);
    };

    Math.vecSum = function sumOfVectors(v1, v2) {
        return {
            x: v1.x + v2.x,
            y: v1.y + v2.y,
            z: v1.z + v2.z
        };
    };

    //  v1 - v2
    Math.vecDifference = function differenceOfVectors(v1, v2) {
        return {
            x: v1.x - v2.x,
            y: v1.y - v2.y,
            z: v1.z - v2.z
        };
    };

    Math.vecMultiply = function multiplyVectorByScalar(v, s) {
        return {
            x: v.x * s,
            y: v.y * s,
            z: v.z * s
        };
    };

    Math.vecNegate = function negatedVector(v) {
        return {
            x: -v.x, y: -v.y, z: -v.z
        };
    };

    Math.randomVector = function generateRandomVectorOfLength(length_) {
        length_ = length_ || 1;
        return Math.vecOfLength({
            x: Math.random() - 0.5,
            y: Math.random() - 0.5,
            z: Math.random() - 0.5
        }, length_);
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

        console.log(label, (end - start) / 1000 + 's');

        return result;
    }

})();