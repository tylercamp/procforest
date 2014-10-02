/**
 * Created by tylercamp on 9/29/14.
 */

;(function() {

    "use strict";
    
    function Forest() {
        this.vegetationObjects = [];
    }

    Forest.prototype.generate = function() {
        this.vegetationObjects.push(Controllers.vegetation.generateOvergrowthRoot());
    };

    window.Forest = Forest;

})();