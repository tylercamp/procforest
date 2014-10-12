/**
 * Created by tylercamp on 10/2/14.
 */

;(function() {

    "use strict";

    window.Seeds = {
        tree: {
            name: 'tree',
            terrainAlignmentFactor: 0.3,

            probability: function() {
                return ProcForest.Settings.SeedProbabilities.tree;
            },

            finalize: function(segment) {

            },

            //  Returns vector indicating position for next point (relative to last point)
            growth: function(terrain, segment, fingerprint, currentDirection) {
                //  segment.length
                //  segment.parent
                //  segment.baseOrientation
                //  segment.subdivisionIndex

                //  Make sure the direction is at an angle with the terrain
                var currentDirectionMod = Math.vecModulateAbsolute(currentDirection, null, Math.pi/3);
                //  TWIRL BABY TWIRL
                return Math.vecModulate(currentDirectionMod, Math.pi/7, 0);

//                return {
//                    x: currentDirection.x + Math.random() - 0.5,
//                    y: currentDirection.y + Math.random() - 0.5,
//                    z: currentDirection.z + Math.random() - 0.5
//                };
            },

            shape: function() {
                console.error('shape NYI');
            }
        },

//        shrub: {
//            name: 'shrub',
//            terrainAlignmentFactor: 0.8,
//
//            probability: function () {
//                return 0;
//            }
//        },

        root: {
            name: 'overgrowth root',
            terrainAligmentFactor: 1,

            probability: function () {
                return ProcForest.Settings.SeedProbabilities.root;
            },

            finalize: function(segment) {
                //  Can't smooth with fewer than 3 points
                if (segment.structure.length < 3)
                    return;

                //  100 degrees
                var smallestAngle = 100 * Math.pi / 180;
                var currentSmallestAngle, i = 0;
                while ((currentSmallestAngle = segment.smallestSectionAngle()) < smallestAngle && i++ < 15) { // max of 15 iterations
                    segment.smooth(0.05);
                }
            },

            growth: function(terrain, segment, fingerprint, currentDirection) {
                var lengthRange = {
                    max: 15,
                    min: 1
                };
                var maxLength = lengthRange.min + fingerprint.a * (lengthRange.max - lengthRange.min);

                var heightRange = {
                    max: 2,
                    min: 0.1
                };

                var maxGrowthAngularVariation = Math.pi * (1/4) * (fingerprint.a + fingerprint.b) / 2;

                var currentLength = segment.calculateArcLength();
                var lastPoint = segment.structure[segment.structure.length - 1];
                var firstPoint = segment.structure[0];
                var terrainHeightAtPoint = terrain.getValue(lastPoint.x, lastPoint.z);
                if (lastPoint.y < terrainHeightAtPoint && currentLength > lengthRange.min) {
                    return null; // Don't grow anymore if we're already re-intersecting with the terrain
                }

                var maxHeight = heightRange.min + fingerprint.c * (heightRange.max - heightRange.min) + terrainHeightAtPoint;

                var gravityPull = Math.max(0, currentLength - maxLength) * 0.5;
                var sunPull = Math.max(0, 2*fingerprint.b - Math.max(0, (lastPoint.y - maxHeight) * 2));
                var gravityVector = {
                    x: 0, y: -1, z: 0
                };

                var sunVector = {
                    x: 0, y: 1, z: 0
                };

                var directionalChangeFactor = 0.5;

                var naturalGrowth = Math.normal(Math.vecModulate(
                                                            currentDirection,
                                                            maxGrowthAngularVariation * Math.random(),
                                                            maxGrowthAngularVariation * Math.random()));

                //  Make sure to move away from the root's starting position
                if (lastPoint !== firstPoint) {
                    naturalGrowth.x += 1 / (lastPoint.x - firstPoint.x) * directionalChangeFactor;
                    naturalGrowth.y += 1 / (lastPoint.y - firstPoint.y) * directionalChangeFactor;
                    Math.normalize(naturalGrowth);
                }

                naturalGrowth.x *= directionalChangeFactor;
                naturalGrowth.y *= directionalChangeFactor;
                naturalGrowth.z *= directionalChangeFactor;

                naturalGrowth.y -= Math.max(0, lastPoint.y - maxHeight) * 0.2;

                var result = {
                    x: naturalGrowth.x + sunPull*sunVector.x + gravityPull*gravityVector.x,
                    y: naturalGrowth.y + sunPull*sunVector.y + gravityPull*gravityVector.y,
                    z: naturalGrowth.z + sunPull*sunVector.z + gravityPull*gravityVector.z
                };

                //  tilt the growth vector towards the max height of the vegetation
                result = Math.vecModulate(result, null, (maxHeight - lastPoint.y) * 2 * (1/Math.pi) * fingerprint.c);
                result = Math.vecOfLength(result, 0.75);

                return result;
            },

            shape: function () {
                console.error('shape NYI');
            }
        }
    };





    ///////// Utility functions //////////

    //  Pick a random seed based on their selection probabilities
    Seeds.pick = function(seedsArray_) {
        seedsArray_ = seedsArray_ || this.asArray;

        if (seedsArray_.length === 0)
            return null;
        if (seedsArray_.length === 1)
            return seedsArray_[0];

        var probabilities = [];
        var i, p = 0, currentp, p_i;
        for (i = 0; i < Seeds.asArray.length; i++) {
            currentp = Seeds.asArray[i].probability();
            probabilities.push(currentp + p);
            p += currentp;
        }

        p_i = 1 / p;

        //  Normalize
        for (i = 0; i < probabilities.length; i++) {
            probabilities[i] *= p_i;
        }

        var selection = Math.random();
        for (i = 0; i < probabilities.length; i++) {
            if (probabilities[i] > selection)
                return Seeds.asArray[i];
        }

        //  Should never reach this point
        throw "Seeds.pick could not select seed";
    };



    //  Build Seeds.asArray
    var prop, seedsArray = [];
    for (prop in Seeds) {
        if (Seeds.hasOwnProperty(prop) && typeof Seeds[prop] === 'object') {
            seedsArray.push(Seeds[prop]);
        }
    }
    Seeds.asArray = seedsArray;

})();