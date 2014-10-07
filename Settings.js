/**
 * Created by tylercamp on 10/7/14.
 */

;(function() {

    "use strict";
    
    window.ProcForest = window.ProcForest || {};



    window.ProcForest.Settings = {
        useBloom: false,

        drawSkybox: false,
        drawForest: true,
        drawTerrain: true,

        frameSkip: 1,
        backgroundColor: { r: 0.0, g: 0.0, b: 0.0, a: 0 },
        numForestSimulationTicks: 1,

        SeedProbabilities: {
            tree: 0,
            root: 1
        }
    };

})();