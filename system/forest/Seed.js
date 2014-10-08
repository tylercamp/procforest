/**
 * Created by tylercamp on 10/2/14.
 */

;(function() {

    "use strict";

    Forest.Seed = {
        plant: function(x, y, z, directionNormal, seed) {
            var result = new Vegetation();
            var baseSegment = new Vegetation.Segment();
            baseSegment.baseOrientation = directionNormal;
            baseSegment.structure.push({
                x: x, y: y, z: z
            });
            baseSegment.subdivisionIndex = 0;
            result.structureSegments.push(baseSegment);
            result.seed = seed;

            return result;
        }
    };

})();