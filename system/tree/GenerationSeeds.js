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
                return 1;
            },

            //  Returns vector indicating position for next point (relative to last point)
            growth: function(segment, currentDirection) {
                //  segment.length
                //  segment.parent
                //  segment.baseOrientation
                //  segment.subdivisionIndex

                console.log('growth');

                return currentDirection;

                //console.error('growth NYI');
            },

            shape: function() {
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
        for (i = 0; i < probabilities.length - 1; i++) {
            if (probabilities[i] < selection && probabilities[i+1] > selection)
                return Seeds.asArray[i];
        }

        return seedsArray_[probabilities.length - 1];
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