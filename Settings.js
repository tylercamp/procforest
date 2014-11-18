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
        textureVelocity: 0.4,

        terrainSize: 400,

        frameSkip: 0,
        backgroundColor: { r: 0.0, g: 0.0, b: 0.0, a: 0 },
        fogColor: { r: 0.1, g: 0.1, b: 0.1, a: 0 },
        fogRange: { min: 60, max: 100 },
        numForestSimulationTicks: 10,
        maxTreeViewDist: 110,

        //numGrassMeshes: 0,
        numGrassMeshes: 200000,

        Forest: {
            maxSeedsDistance: 15
        },

        SeedProbabilities: {
            wispTree: 0.3,
            tree: 0.5,
            root: 0.2,
            lilyBush: 0,
            cradleTree: 0.5
        }
    };

})();