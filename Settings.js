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

        terrainSize: 40,

        frameSkip: 2,
        backgroundColor: { r: 0.0, g: 0.0, b: 0.0, a: 0 },
        numForestSimulationTicks: 100,

        SeedProbabilities: {
            tree: 0,
            root: 1
        }
    };

})();