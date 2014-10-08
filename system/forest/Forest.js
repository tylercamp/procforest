/**
 * Created by tylercamp on 9/29/14.
 *
 *
 * Structure:
 *
 *  A forest contains a variety of vegetationObjects (Forest.vegatationObjects - Vegetation array). Each
 *      Vegetation object can be rendered individually, and a Vegetation object can be a variety of types
 *      of vegetation.
 *
 *  A vegetation object internally consists of a B-tree of segments, which outlines the physical structure
 *      of the vegetation. Vegetation.generateMesh generates a mesh from these segments, assuming that each
 *      segment represents the "stem' of the vegetation.
 *
 *  Vegetation generation is done through a growing process; a Vegetation on its own contains render
 *      info but not information regarding how to develop the vegetation. A Seed object describes
 *      growth, population density requirements, and other information. When a vegetation object
 *      is grown it references the Seed from which it was created to determine how to grow.
 *
 *  When a Vegetation object is grown, there is a probability (depending on the seed) that it will
 *      produce offspring. The offspring should be inserted into the forest with proximity to its
 *      parent while respecting density requirements set by the seed.
 *
 *  When a mesh is generated from a Vegetation object, a 'shape' function is called to determine how
 *      the mesh should be shaped relative to the segment. All structural meshes will be cylindrical,
 *      Seed.shape(...) determines indents and thickness.
 *
 *  The overall forest growth process is done by simulating a timeline. A set of seeds are created,
 *      from which the forest will sprout. The timeline ticks a certain number of times, each tick
 *      growing all of the vegetation in the forest by one increment. New vegetation offspring is
 *      inserted into the forest and included in the simulation.
 *
 *
 *
 *
 *
 *  Logic processing for growth begins in Forest.js.
 *
 */

;(function() {

    "use strict";

    //  Does constraint calculations for density requirements

    //  'parent' refers to the Vegetation object that invoked the spawning of 'vegetation'
    function insertVegetationToForest(vegetationCollection, vegetation, parent) {
        console.warn('insertVegetationToForest NYI');
    }

    function Forest() {
        this.vegetationObjects = [];
    }

    Forest.prototype.generate = function(numGrowthTicks, terrain) {
        this.timeline = new Timeline();
        this.vegetationObjects = [];

        var maxSeedsDistance = 30;
        var spread = { x: 0, y: 0 };
        var terrainWidth = terrain.renderWidth(), terrainHeight = terrain.renderHeight();
        spread.x = terrainWidth / (Math.ceil(terrainWidth/maxSeedsDistance) * maxSeedsDistance) * maxSeedsDistance;
        spread.y = terrainHeight / (Math.ceil(terrainHeight/maxSeedsDistance) * maxSeedsDistance) * maxSeedsDistance;
        var x, y;

        console.log('Using spread', spread);
        console.log('seed-w', terrainWidth / spread.x);
        console.log('seed-h', terrainHeight / spread.y);

        //  Spread initial seeds (don't put seeds on the edges of the terrain)
        var vegetation, vegetationObjects = this.vegetationObjects;
        for (y = spread.y; y < terrainWidth - spread.y; y += spread.y) {
            for (x = spread.x; x < terrainHeight - spread.x; x += spread.x) {
                vegetation = Forest.Seed.plant(x, terrain.getValue(x, y), y, terrain.getNormal(x, y), Seeds.pick());
                vegetationObjects.push(vegetation);
            }
        }

        console.log('Planted ' + vegetationObjects.length + ' seeds in the forest');

        //  Configure timeline onTick
        this.timeline.onTick(function (tick) {
            //  Don't insert offspring until we're done processing
            var newVegetation = [];

            var i, vegetation, offspring;
            for (i = 0; i < vegetationObjects.length; i++) {
                vegetation = vegetationObjects[i];
                //  Do the vegetation growth
                offspring = vegetation.grow(terrain);
                //  Add offspring to the forest if any were generated
                if (offspring) {
                    newVegetation.push({
                        offspring: offspring,
                        parent: vegetation
                    });
                }
            }

            for (i = 0; i < newVegetation.length; i++) {
                insertVegetationToForest(vegetationObjects, newVegetation[i].offspring, newVegetation[i].parent);
            }
        });


        //  Simulate for numGrowthTicks
        this.timeline.tick(numGrowthTicks);
    };

    window.Forest = Forest;

})();