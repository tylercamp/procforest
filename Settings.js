/**
 * Created by tylercamp on 10/7/14.
 */

;(function() {

    "use strict";
    
    window.ProcForest = window.ProcForest || {};



    window.ProcForest.Settings = {
        useBloom: true,

        drawSkybox: true,
        drawForest: false,
        drawTerrain: true,
        drawParticles: true,

        terrainSize: 200,

        frameSkip: 1,
        backgroundColor: { r: 0.0, g: 0.0, b: 0.0, a: 0 },
        numForestSimulationTicks: 1,

        Forest: {
            maxSeedsDistance: 40
        },

        SeedProbabilities: {
            wispTree: 0.5,
            tree: 0.5,
            root: 0.5
        }
    };

})();