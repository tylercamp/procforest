/**
 * Created by tylercamp on 10/7/14.
 */

;(function() {

    "use strict";
    
    window.ProcForest = window.ProcForest || {};



    window.ProcForest.Settings = {
        useBloom: true,

        drawSkybox: true,
        drawForest: true,
        drawTerrain: true,
        drawParticles: true,

        textureGenSeed: 0.125,
        textureVelocity: 0.6,

        terrainSize: 100,

        frameSkip: 1,
        backgroundColor: { r: 0.0, g: 0.0, b: 0.0, a: 0 },
        numForestSimulationTicks: 10,

        numGrassMeshes: 200000,

        Forest: {
            maxSeedsDistance: 20
        },

        SeedProbabilities: {
            wispTree: 0.5,
            tree: 0.5,
            root: 0.5
        }
    };

})();