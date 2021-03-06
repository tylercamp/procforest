/**
 * Created by tylercamp on 10/2/14.
 */

;(function() {

    "use strict";

    window.Seeds = {
        wispTree: {
            name: 'wisp tree',
            radialGenerationAccuracy: 15,
            terrainAlignmentFactor: 0.3,
            excitationFalloff: 2,

            probabilityFieldFunction: {
                type: 'linear',
                holeRadius: 2,
                maxDistance: 10,
                scale: 3
            },

            probability: function() {
                return ProcForest.Settings.SeedProbabilities.wispTree;
            },

            finalize: function(segment) {

            },

            calculateExcitation: function(vegetation, wave, fingerprint) {
                var responseBand = responseBands.pick(fingerprint.a * 0.5 + fingerprint.b * 0.5)
                var fftInfo = evaluateFft(
                    wave.fft,
                    responseBand.min, responseBand.max
                );
                return wave.smoothedAmplitude * fftInfo.max * 2;
            },

            //  Returns vector indicating position for next point (relative to last point)
            growth: function(terrain, segment, fingerprint, currentDirection) {
                //  segment.length
                //  segment.parent
                //  segment.baseOrientation
                //  segment.subdivisionIndex

                var newSegments = null;
                if ((1 / (segment.subdivisionIndex + 1)) * (1 / (segment.numChildren + 1)) * Math.random() * fingerprint.a > 0.1)
                    newSegments = [
                        { offset: 0.5, baseOrientation: Math.normal(Math.vecModulate(segment.baseOrientation, Math.pi/4, Math.pi/4)) }
                    ];

                //  Make sure the direction is at an angle with the terrain
                var currentDirectionMod = Math.vecOfLength(Math.vecModulateAbsolute(currentDirection, null, Math.pi/3), 2);
                //  TWIRL BABY TWIRL
                return {
                    newSegments: newSegments,
                    relativeChange: Math.vecModulate(currentDirectionMod, Math.pi/7, 0)
                };

//                return {
//                    x: currentDirection.x + Math.random() - 0.5,
//                    y: currentDirection.y + Math.random() - 0.5,
//                    z: currentDirection.z + Math.random() - 0.5
//                };
            },

            meshPoint: function(segment, basePoint, normal, progression, meshHelper) {
                return meshHelper.calculateRotatedPoint(basePoint, normal, progression * 360, 0.3);
            }
        },

        tree: {
            name: 'tree',
            radialGenerationAccuracy: 15,
            terrainAlignmentFactor: 0.5,
            excitationFalloff: 2,

            probabilityFieldFunction: {
                type: 'linear',
                holeRadius: 2,
                maxDistance: 10,
                scale: 4
            },

            probability: function() {
                return ProcForest.Settings.SeedProbabilities.tree;
            },

            finalize: function(segment) {

            },

            calculateExcitation: function(vegetation, wave, fingerprint) {
                var responseBand = responseBands.pick(fingerprint.a * 0.5 + fingerprint.b * 0.5)
                var fftInfo = evaluateFft(
                    wave.fft,
                    responseBand.min, responseBand.max
                );
                return wave.smoothedAmplitude * fftInfo.max * 2;
            },

            //  Returns vector indicating position for next point (relative to last point)
            growth: function(terrain, segment, fingerprint, currentDirection) {
                //  segment.length
                //  segment.parent
                //  segment.baseOrientation
                //  segment.subdivisionIndex

                var newSegments = null;
                if ((1 / (segment.subdivisionIndex + 1)) * (1 / (segment.numChildren + 1)) * Math.random() * fingerprint.a > 0.5)
                    newSegments = [
                        { offset: 0.5, baseOrientation: Math.normal(Math.vecLerp(0.5, Math.cross(currentDirection, Math.randomVector()), { x: 0, y: 1, z: 0 })) }
                    ];

                //newSegments = null;

                var randomMovementSize = Math.random()*0.3*fingerprint.b;
                var relativeChange = Math.vecSum(currentDirection, Math.fromSphericalCoordinate(Math.random()*Math.pi*2, Math.random()*Math.pi_2, randomMovementSize));
                relativeChange = Math.normal(Math.vecLerp(0.2 * fingerprint.a * (1 / (segment.subdivisionIndex + 1)), relativeChange, { x: 0, y: 1, z: 0 }));
                //Math.normalize(relativeChange);

                var currentSize = segment.calculateArcLength();
                var offspring = null;
                if (segment.subdivisionIndex === 0) {
                    if (Math.random() * currentSize > (5.0 * fingerprint.a + 5.0))
                        offspring = [Seeds.root];
                }
                else {

                }

                return {
                    newSegments: newSegments,
                    relativeChange: relativeChange,
                    offspring: offspring
                };

//                return {
//                    x: currentDirection.x + Math.random() - 0.5,
//                    y: currentDirection.y + Math.random() - 0.5,
//                    z: currentDirection.z + Math.random() - 0.5
//                };
            },

            meshPoint: function(segment, basePoint, normal, progression, meshHelper) {
                return meshHelper.calculateRotatedPoint(basePoint, normal, progression * 360, 0.5);
            }
        },

//        shrub: {
//            name: 'shrub',
//            radialGenerationAccuracy: 6,
//            terrainAlignmentFactor: 0.8,
//
//            probability: function () {
//                return 0;
//            }
//        },

        root: {
            name: 'overgrowth root',
            radialGenerationAccuracy: 15,
            terrainAligmentFactor: 1,
            excitationFalloff: 1,

            probabilityFieldFunction: {
                type: 'linear',
                holeRadius: 0.5,
                maxDistance: 2,
                scale: 1
            },

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

            calculateExcitation: function(vegetation, wave, fingerprint) {
                var responseBand = responseBands.pick(fingerprint.a * 0.5 + fingerprint.b * 0.5)
                var fftInfo = evaluateFft(
                    wave.fft,
                    responseBand.min, responseBand.max
                );
                return wave.smoothedAmplitude * fftInfo.max * 2;
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

                var relativeChange = {
                    x: naturalGrowth.x + sunPull*sunVector.x + gravityPull*gravityVector.x,
                    y: naturalGrowth.y + sunPull*sunVector.y + gravityPull*gravityVector.y,
                    z: naturalGrowth.z + sunPull*sunVector.z + gravityPull*gravityVector.z
                };

                //  tilt the growth vector towards the max height of the vegetation
                relativeChange = Math.vecModulate(relativeChange, null, (maxHeight - lastPoint.y) * 2 * (1/Math.pi) * fingerprint.c);
                relativeChange = Math.vecOfLength(relativeChange, 0.75);

                return {
                    relativeChange: relativeChange
                };
            },

            meshPoint: function(segment, basePoint, normal, progression, meshHelper) {
                return meshHelper.calculateRotatedPoint(basePoint, normal, progression * 360, 0.5);
            }
        },

        lilyBush: {
            name: 'Lily Bush',
            radialGenerationAccuracy: 15,
            terrainAlignmentFactor: 1,
            excitationFalloff: 4,

            probabilityFieldFunction: {
                type: 'linear',
                holeRadius: 0.5,
                maxDistance: 1,
                scale: 1
            },

            probability: function() {
                return ProcForest.Settings.SeedProbabilities.lilyBush;
            },

            finalize: function(segment) {

            },

            calculateExcitation: function(vegetation, wave, fingerprint) {
                return wave.smoothedAmplitude;
            },

            growth: function(terrain, segment, fingerprint, currentDirection) {
                var relativeChange, subSegments, changeMagnitude;
                changeMagnitude = 1 / (segment.calculateArcLength() + 1) * fingerprint.b * (segment.subdivisionIndex+1);
                relativeChange = Math.vecOfLength(currentDirection, changeMagnitude);
                if (segment.calculateArcLength() / (segment.subdivisionIndex + 1) > 3 * fingerprint.a + 0.5) {
                    relativeChange = null;
                }

                subSegments = [];
                if (segment.numChildren === 0 && segment.subdivisionIndex < Math.ceil(fingerprint.a * 4) + 2) {
                    subSegments.push({
                        offset: 0,
                        baseOrientation: currentDirection
                    });
                }

                return {
                    relativeChange: relativeChange,
                    newSegments: subSegments
                };
            },

            meshPoint: function(segment, basePoint, normal, progression, meshHelper) {
                var pointDistance = Math.magnitude(Math.vecDifference(basePoint, segment.structure[0]));
                var radialOffset = Math.pow(pointDistance, 1.2) / (segment.subdivisionIndex * 0.3 + 1) + 0.25;
                return meshHelper.calculateRotatedPoint(basePoint, normal, progression * 360, radialOffset);
            }
        },

        cradleTree: {
            name: 'Cradle Tree',
            radialGenerationAccuracy: 15,
            terrainAlignmentFactor: 1,
            excitationFalloff: 5,

            probabilityFieldFunction: {
                type: 'linear',
                holeRadius: 0.5,
                maxDistance: 1,
                scale: 1
            },

            probability: function() {
                //return ProcForest.Settings.SeedProbabilities.cradleTree;
                return 0;
            },

            finalize: function(segment) {

            },

            calculateExcitation: function(vegetation, wave, fingerprint) {
                return wave.smoothedAmplitude;
            },

            growth: function(terrain, segment, fingerprint, currentDirection) {
                return null;
            },

            meshPoint: function(segment, basePoint, normal, progression, meshHelper) {
                return meshHelper.calculateRotatedPoint(basePoint, normal, progression * 360, 0.5);
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




    var numBands = 6;
    var bandPadding = 0.6 / numBands;
    var masterBand = [0, 0.9]; // subsets of masterBand
    var responseBands = [];
    var i, bandWidth;
    bandWidth = (1 - bandPadding*(numBands-1)) / numBands;
    for (i = 0; i < numBands; i++) {
        responseBands.push({
            min: ((bandPadding + bandWidth) * i) * (masterBand[1] - masterBand[0]) + masterBand[0],
            max: ((bandPadding + bandWidth) * i + bandWidth) * (masterBand[1] - masterBand[0]) + masterBand[0]
        });
    }

    responseBands.pick = function(normal) {
        return this[Math.floor(normal * this.length)];
    };

    function evaluateFft(fft, minBin, maxBin) {
        if (!fft || !fft.length) {
            return {
                min: 0, max: 0, average: 0
            };
        }

        var range = Math.ceil(fft.length);
        minBin = Math.max(0, Math.floor(range * minBin));
        maxBin = Math.min(fft.length-1, Math.floor(range * maxBin));

        var result = {
            max: -100000,
            min: 10000,
            average: 0
        };

        var i, fftValue;
        for (i = minBin; i <= maxBin; i++) {
            fftValue = fft[i] / 255;
            result.average += fftValue;
            if (fftValue > result.max)
                result.max = fftValue;
            if (fftValue < result.min)
                result.min = fftValue;
        }

        result.average /= (maxBin - minBin) + 1;

        return result;
    }



    //  Build Seeds.asArray
    var prop, seedsArray = [];
    for (prop in Seeds) {
        if (Seeds.hasOwnProperty(prop) && typeof Seeds[prop] === 'object') {
            seedsArray.push(Seeds[prop]);
        }
    }
    Seeds.asArray = seedsArray;

})();