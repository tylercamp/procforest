/**
 * Created by tylercamp on 11/4/14.
 */

;(function() {

    "use strict";


    function MeshHelper() {

    }

    MeshHelper.prototype.calculateRotatedPoint = function(basePoint, normal, angleDegrees, rotationalDistance, offset_) {
        offset_ = offset_ || 0;

        basePoint.x += normal.x * offset_;
        basePoint.y += normal.y * offset_;
        basePoint.z += normal.z * offset_;

        var perpVector, rotationMatrix, rotationNormal, rotationElements;
        perpVector = Math.normal(Math.perpVector(normal));
        perpVector = new Vector4([perpVector.x, perpVector.y, perpVector.z, 1]);

        rotationMatrix = new Matrix4().setRotate(angleDegrees, normal.x, normal.y, normal.z);
        rotationNormal = rotationMatrix.multiplyVector4(perpVector);
        rotationElements = rotationNormal.elements;

        var len = Math.sqrt(
            rotationElements[0]*rotationElements[0] +
            rotationElements[1]*rotationElements[1] +
            rotationElements[2]*rotationElements[2]
        );

        return {
            x: basePoint.x + (rotationElements[0] * rotationalDistance) / len,
            y: basePoint.y + (rotationElements[1] * rotationalDistance) / len,
            z: basePoint.z + (rotationElements[2] * rotationalDistance) / len
        };
    };

    window.MeshHelper = MeshHelper;

})();