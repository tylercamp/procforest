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
 *      is grown it references the Seed from which it was created to determine how to grow. If the
 *      seed indicates no growth for a segment (returns null), the segment is said to be 'finalized'.
 *      The .finalize() method within the seed is invoked with that segment as a parameter, for any
 *      final operations that may be necessary (i.e. smoothing/texture generation.) Finalized segments
 *      are skipped during growth processing.
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
    function insertVegetationToForest(terrain, vegetationCollection, seed, parent) {
        var size = 20;
        var newPosition = Math.vecSum(parent.position(), {
            x: Math.random() * size - size / 2,
            y: 0,
            z: Math.random() * size - size / 2
        });

        newPosition.y = terrain.getValue(newPosition.x, newPosition.z);
        var vegetation = Forest.Seed.plant(newPosition.x, newPosition.y, newPosition.z, terrain.getNormal(newPosition.x, newPosition.z), seed);
        vegetationCollection.push(vegetation);

        return vegetation;
    }

    function Forest() {
        this.vegetationObjects = [];
        this.probabilityFields = null;
        this.registerNewOffspring = true;
        this.isFrozen = false;

        this.defaultProbabilityFunction = {
            type: 'no-op'
        };
    }

    Forest.prototype.update = function() {
        var i, timeDelta;
        timeDelta = Controllers.time.getDelta();
        for (i = 0; i < this.vegetationObjects.length; i++) {
            this.vegetationObjects[i].update(timeDelta);
        }
    };

    Forest.prototype.excite = function(waveData) {
        var i;
        for (i = 0; i < this.vegetationObjects.length; i++) {
            this.vegetationObjects[i].excite(waveData);
        }
    };

    Forest.prototype.generate = function(numGrowthTicks, terrain) {
        this.timeline = new Timeline();
        this.vegetationObjects = [];
        this.probabilityFields = new ProbabilityField(Math.floor(terrain.renderWidth() * 0.5), Math.floor(terrain.renderHeight() * 0.5));

        /***** DEBUG UI STUFF *****/
        var probabilityFieldUI = document.querySelector('#probability-field');
        probabilityFieldUI.width = this.probabilityFields.width;
        probabilityFieldUI.height = this.probabilityFields.height;


        var maxSeedsDistance = ProcForest.Settings.Forest.maxSeedsDistance;
        var spread = { x: 0, y: 0 };
        var terrainWidth = terrain.renderWidth(), terrainHeight = terrain.renderHeight();
        spread.x = terrainWidth / (Math.ceil(terrainWidth/maxSeedsDistance) * maxSeedsDistance) * maxSeedsDistance;
        spread.y = terrainHeight / (Math.ceil(terrainHeight/maxSeedsDistance) * maxSeedsDistance) * maxSeedsDistance;
        var x, y;

        console.log('Using spread', spread);
        console.log('seed-w', terrainWidth / spread.x);
        console.log('seed-h', terrainHeight / spread.y);

        //  Spread initial seeds (don't put seeds on the edges of the terrain)
        var vegetation, vegetationObjects = this.vegetationObjects, xrand, zrand;
        for (y = spread.y; y <= terrainWidth - spread.y; y += spread.y) {
            for (x = spread.x; x <= terrainHeight - spread.x; x += spread.x) {
                xrand = Math.random() * spread.x * 0.25 - spread.x * 0.125;
                zrand = Math.random() * spread.y * 0.25 - spread.y * 0.125;
                vegetation = Forest.Seed.plant(x+xrand, terrain.getValue(x+xrand, y+zrand), y+zrand, terrain.getNormal(x+xrand, y+zrand), Seeds.pick());
                vegetationObjects.push(vegetation);
            }
        }

        console.log('Planted ' + vegetationObjects.length + ' seeds in the forest');

        var currentPosition;
        for (var i = 0; i < vegetationObjects.length; i++) {
            currentPosition = vegetationObjects[i].position();
            currentPosition.x *= this.probabilityFields.width / terrainWidth;
            currentPosition.z *= this.probabilityFields.height / terrainHeight;
            this.probabilityFields.composite({ x: currentPosition.x, y: currentPosition.z }, vegetationObjects[i].seed.probabilityFieldFunction);
        }
        console.log('Generated initial probability field');
        this.probabilityFields.copyToCanvas(probabilityFieldUI);

        var probabilityFields = this.probabilityFields;
        //  Configure timeline onTick
        this.timeline.onTick(function (tick) {
            if (self.isFrozen) {
                console.log('Forest cannot be grown after it has been frozen.');
                return;
            }

            //  Don't insert offspring until we're done processing
            var newVegetation = [];

            var i, vegetation, offspring;
            for (i = 0; i < vegetationObjects.length; i++) {
                vegetation = vegetationObjects[i];
                //  Do the vegetation growth
                offspring = vegetation.grow(terrain);
                //  Add offspring to the forest if any were generated
                if (offspring) {
                    offspring.forEach(function (singleOffspring) {
                        newVegetation.push({
                            seed: singleOffspring,
                            parent: vegetation
                        });
                    });
                }
            }

            for (i = 0; i < newVegetation.length; i++) {
                var vegetationInstance = insertVegetationToForest(terrain, vegetationObjects, newVegetation[i].seed, newVegetation[i].parent);
                var currentPosition = vegetationInstance.position();
                currentPosition.x *= probabilityFields.width / terrainWidth;
                currentPosition.z *= probabilityFields.height / terrainHeight;
                probabilityFields.composite({ x: currentPosition.x, y: currentPosition.z }, vegetationInstance.seed.probabilityFieldFunction);
            }

            if (newVegetation.length) {
                console.log('Updating probability field');
                probabilityFields.copyToCanvas(document.querySelector('#probability-field'));
            }
        });


        //  Simulate for numGrowthTicks
        this.timeline.tick(numGrowthTicks);
    };

    window.Forest = Forest;

})();