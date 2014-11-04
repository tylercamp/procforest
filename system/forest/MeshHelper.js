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

        var perpVector, rotationMatrix, result;
        perpVector = Math.normal(Math.perpVector(normal));
        perpVector = new Vector4([perpVector.x, perpVector.y, perpVector.z, 1]);

        rotationMatrix = new Matrix4().setRotate(angleDegrees, normal.x, normal.y, normal.z);
        result = rotationMatrix.multiplyVector4(perpVector);
        result = Math.normal({ x: result.elements[0], y: result.elements[1], z: result.elements[2] });
        result = Math.vecSum(Math.vecMultiply(result, rotationalDistance), basePoint);

        return result;
    };

    window.MeshHelper = MeshHelper;

})();