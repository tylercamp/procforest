/**
 * Created by tylercamp on 9/11/14.
 */

;(function() {

    "use strict";

    var mouseDeltaIgnoreThreshold = 500;
    var previousMousePos = { x: -10000, y: -10000 };
    var cameraYOffset = 0.5;
    var cameraYOffsetBounds = { min: -20, max: 500 };

    window.ProgramFlow = {
        InitializeResources: function initResources(gl, resources, renderResources, canvas) {

            (function() {
                this.skyboxShader = glHelper.generateShader(gl, resources.skyboxVertexShader, resources.skyboxFragmentShader);
                this.terrainShader = glHelper.generateShader(gl, resources.terrainVertexShader, resources.terrainFragmentShader);
                this.coloredGeometryShader = glHelper.generateShader(gl, resources.coloredGeomVertexShader, resources.coloredGeomFragmentShader);
                this.particleShader = glHelper.generateShader(gl, resources.particleVertexShader, resources.particleFragmentShader);
                this.proceduralShader = glHelper.generateShader(gl, resources.proceduralVertexShader, resources.proceduralFragmentShader);
                this.grassImage = glHelper.generateTextureObject(gl, resources.grassImage);
                this.modelViewMatrix = new Matrix4();
                this.projectionMatrix = new Matrix4();

                this.modelViewMatrix.setIdentity();
                this.projectionMatrix.setPerspective(75, canvas.width / canvas.height, 0.1, 10000.0);



                gl.useProgram(this.skyboxShader);
                this.skyboxShaderParams = {
                    a_Vertex: gl.getAttribLocation(this.skyboxShader, "a_Vertex"),
                    a_TexCoord0: gl.getAttribLocation(this.skyboxShader, "a_TexCoord0"),

                    u_ModelViewMatrix: gl.getUniformLocation(this.skyboxShader, "u_ModelViewMatrix"),
                    u_ProjectionMatrix: gl.getUniformLocation(this.skyboxShader, "u_ProjectionMatrix"),
                    u_Texture0: gl.getUniformLocation(this.skyboxShader, "u_Texture0")
                };
                this.skyboxShaderParams.attribArrays = [
                    this.skyboxShaderParams.a_Vertex,
                    this.skyboxShaderParams.a_TexCoord0
                ];


                gl.useProgram(this.terrainShader);
                this.terrainShaderParams = {
                    a_Vertex: gl.getAttribLocation(this.terrainShader, "a_Vertex"),
                    a_Color: gl.getAttribLocation(this.terrainShader, "a_Color"),
                    a_TexCoord0: gl.getAttribLocation(this.terrainShader, "a_TexCoord0"),
                    a_Normal: gl.getAttribLocation(this.terrainShader, "a_Normal"),

                    u_ModelViewMatrix: gl.getUniformLocation(this.terrainShader, "u_ModelViewMatrix"),
                    u_ProjectionMatrix: gl.getUniformLocation(this.terrainShader, "u_ProjectionMatrix"),
                    u_Texture0: gl.getUniformLocation(this.terrainShader, "u_Texture0")
                };
                this.terrainShaderParams.attribArrays = [
                    this.terrainShaderParams.a_Vertex,
                    this.terrainShaderParams.a_Color,
                    this.terrainShaderParams.a_TexCoord0,
                    this.terrainShaderParams.a_Normal
                ];


                gl.useProgram(this.coloredGeometryShader);
                this.coloredGeometryShaderParams = {
                    a_Vertex: gl.getAttribLocation(this.coloredGeometryShader, "a_Vertex"),
                    a_Color: gl.getAttribLocation(this.coloredGeometryShader, "a_Color"),

                    u_ModelViewMatrix: gl.getUniformLocation(this.coloredGeometryShader, "u_ModelViewMatrix"),
                    u_ProjectionMatrix: gl.getUniformLocation(this.coloredGeometryShader, "u_ProjectionMatrix")
                };
                this.coloredGeometryShaderParams.attribArrays = [
                    this.coloredGeometryShaderParams.a_Vertex,
                    this.coloredGeometryShaderParams.a_Color
                ];


                gl.useProgram(this.particleShader);
                this.particleShaderParams = {
                    a_Vertex: gl.getAttribLocation(this.particleShader, "a_Vertex"),
                    a_Color: gl.getAttribLocation(this.particleShader, "a_Color"),

                    u_ModelViewMatrix: gl.getUniformLocation(this.particleShader, "u_ModelViewMatrix"),
                    u_ProjectionMatrix: gl.getUniformLocation(this.particleShader, "u_ProjectionMatrix")
                };


                gl.useProgram(this.proceduralShader);
                this.proceduralShaderParams = {
                    a_Vertex: gl.getAttribLocation(this.proceduralShader, "a_Vertex"),
                    a_Color: gl.getAttribLocation(this.proceduralShader, "a_Color"),

                    u_NoiseParameter: gl.getUniformLocation(this.proceduralShader, "u_NoiseParameter"),

                    u_ModelViewMatrix: gl.getUniformLocation(this.proceduralShader, "u_ModelViewMatrix"),
                    u_ProjectionMatrix: gl.getUniformLocation(this.proceduralShader, "u_ProjectionMatrix")
                };
                this.proceduralShaderParams.attribArrays = [
                    this.proceduralShaderParams.a_Vertex,
                    this.proceduralShaderParams.a_Color
                ];



                Effect.TexturePassthrough.init(gl, resources.ppVertexShader, resources.pp_Passthrough);
                Effect.Blur.init(gl, resources.blur_HorizontalVertexShader, resources.blur_VerticalVertexShader, resources.blur_FragShader);

            }).call(renderResources);
        },

        InitializeWebGL: function initWebGL(resources, renderResources) {
            console.log('Running WebGL initialization...');

            var canvas = document.querySelector('#target-canvas');

            var targetResolution = {
                width: window.innerWidth,
                height: window.innerHeight
            };

            glHelper.setCanvasSize(canvas, targetResolution.width, targetResolution.height);

            var gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

            if (!gl) {
                alert ('Could not initialize WebGL.');
                return;
            }

            gl.ext = gl.getExtension("EXT_texture_filter_anisotropic") ||
                     gl.getExtension("MOZ_EXT_texture_filter_anisotropic") ||
                     gl.getExtension("WEBKIT_EXT_texture_filter_anisotropic");
            if (gl.ext && gl.ext.TEXTURE_MAX_ANISOTROPY_EXT)
                console.log('Anisotropic filtering enabled');

            $('#res-x').text(canvas.width);
            $('#res-y').text(canvas.height);

            renderResources.screen = {
                width: canvas.width,
                height: canvas.height
            };

            Controllers.mouse = new MouseController(canvas);
            Controllers.keyboard = new KeyboardController(window);
            Controllers.camera = new CameraController();
            Controllers.terrain = new TerrainController(gl);
            Controllers.time = new TimeController();
            Controllers.performance = new PerformanceMonitor(gl);
            Controllers.forest = new Forest();
            Controllers.particleSystem = new ParticleSystem(gl);
            Controllers.audioProcessor = new AudioProcessor();

            Controllers.time.onFpsChange(function (newFps) {
                $('#fps').text(newFps);
            });

            ProgramFlow.InitializeResources(gl, resources, renderResources, canvas);

            gl.enable(gl.DEPTH_TEST);
            gl.depthFunc(gl.LEQUAL);
            gl.enable(gl.CULL_FACE);

            //renderResources.skybox = new Skybox(resources.skyboxImage);
            renderResources.skybox = new Skybox([
                resources.skybox_Front,
                resources.skybox_Left,
                resources.skybox_Right,
                resources.skybox_Top,
                resources.skybox_Back,
                resources.skybox_Bottom
            ]);

            renderResources.skybox.generateBuffers(gl);

            Controllers.audioProcessor.init();
            Controllers.audioProcessor.setAudioData(resources.song_1);

            return gl;
        },

        InitializeUI: function initUI(gl, resources) {
            $('#frame-skipping').text(ProcForest.Settings.frameSkip);
            $('#frame-skipping-slider').val(ProcForest.Settings.frameSkip);
            $('#frame-skipping-slider').change(function (e) {
                ProcForest.Settings.frameSkip = parseInt(e.target.value);
                $('#frame-skipping').text(e.target.value);
            });

            var $cbxBloom = $('#cbx-bloom');
            var $cbxTerrain = $('#cbx-terrain');
            var $cbxSkybox = $('#cbx-skybox');
            var $cbxForest = $('#cbx-forest');
            var $cbxParticles = $('#cbx-particles');
//            var $bloomKernelSlider = $('#bloom-kernel-slider');
            var $bloomStrideSlider = $('#bloom-stride-slider');
//            var $bloomPassSlider = $('#bloom-pass-slider');
//            var $bloomPowerSlider = $('#bloom-power-slider');
//            var $bloomFactorSlider = $('#bloom-factor-slider');

//            $bloomKernelSlider.val(Blur.kernelSize);
//            $bloomKernelSlider.change(function (e) {
//                Blur.kernelSize = parseInt(e.target.value);
//            });
            var $textureGenSlider = $('#texture-gen-slider');

            $bloomStrideSlider.val(Effect.Blur.sampleStride);
            $bloomStrideSlider.change(function (e) {
                Effect.Blur.sampleStride = parseInt(e.target.value);
            });

//            $bloomPassSlider.val(Blur.numPasses);
//            $bloomPassSlider.change(function (e) {
//                Blur.numPasses = parseInt(e.target.value);
//            });
//
//            $bloomPowerSlider.val(Blur.intensityRamp);
//            $bloomPowerSlider.change(function (e) {
//                Blur.intensityRamp = parseFloat(e.target.value);
//            });
//
//            $bloomFactorSlider.val(Blur.intensityFactor);
//            $bloomFactorSlider.change(function (e) {
//                Blur.intensityFactor = parseFloat(e.target.value);
//            });

            $textureGenSlider.val(ProcForest.Settings.textureVelocity);
            $textureGenSlider.change(function (e) {
                ProcForest.Settings.textureVelocity = parseFloat(e.target.value);
            });

            $cbxBloom.prop("checked", ProcForest.Settings.useBloom);
            $cbxTerrain.prop("checked", ProcForest.Settings.drawTerrain);
            $cbxForest.prop("checked", ProcForest.Settings.drawForest);
            $cbxSkybox.prop("checked", ProcForest.Settings.drawSkybox);
            $cbxParticles.prop("checked", ProcForest.Settings.drawParticles);

            $cbxBloom.click(function(e) {
                ProcForest.Settings.useBloom = $cbxBloom.prop("checked");
            });

            $cbxTerrain.click(function(e) {
                ProcForest.Settings.drawTerrain = $cbxTerrain.prop("checked");
            });

            $cbxForest.click(function(e) {
                ProcForest.Settings.drawForest = $cbxForest.prop("checked");
            });

            $cbxSkybox.click(function(e) {
                ProcForest.Settings.drawSkybox = $cbxSkybox.prop("checked");
            });

            $cbxParticles.click(function(e) {
                ProcForest.Settings.drawParticles = $cbxParticles.prop("checked");
            });

            //  I am so sorry for anyone trying to figure out how this little chunk works
            Controllers.performance.onStatsUpdate(function (stats) {
                var fps = Controllers.time.getFps();
                //  The callback is bound to an object with an 'updateStats' method
                this.updateStats(fps, [
                    { e: "#stats-draw-elements",    value: stats.drawElements },
                    { e: "#stats-draw-arrays",      value: stats.drawArrays },
                    { e: "#stats-bind-texture",     value: stats.bindTexture },
                    { e: "#stats-bind-framebuffer", value: stats.bindFramebuffer },
                    { e: "#stats-clear",            value: stats.clear },
                    { e: "#stats-use-program",      value: stats.useProgram },
                    { e: "#stats-enable-vaa",       value: stats.enableVAA },
                    { e: "#stats-disable-vaa",      value: stats.disableVAA }
                ]);

                this.updateResources([
                    { e: "#stats-textures",     value: stats.totalTextures },
                    { e: "#stats-framebuffers", value: stats.totalFramebuffers },
                    { e: "#stats-programs",     value: stats.totalShaderPrograms }
                ]);

            }.bind({ // Object that has the updateUI method
                    updateStats: function(fps, statsObjects) {
                        statsObjects.forEach(function (data) {
                            $(data.e + '-pf').text(Math.round(data.value / fps)); // per-frame stats
                            $(data.e + '-ps').text(data.value); // per-second stats
                        });
                    },
                    updateResources: function(statsObjects) {
                        statsObjects.forEach(function (data) {
                            $(data.e).text(data.value);
                        });
                    }
                }));
        },

        GenerateTerrain: function generateTerain(renderResources) {
            Controllers.terrain.generator = new TerrainController.BlankGenerator();

            var terrainSize = ProcForest.Settings.terrainSize, scale = 2;
            var heightFactor = 0.7;

            var simplexGenerator = new TerrainController.SimplexGenerator(terrainSize * 0.1 * heightFactor);

            Utility.timedOp('Terrain generation', function() {
                renderResources.currentTerrain = Controllers.terrain.createTerrain(terrainSize, terrainSize, {
                    x: scale,
                    y: 1,
                    z: scale
                });

                //  Apply several layers of simplex noise
                simplexGenerator.apply(renderResources.currentTerrain);

                simplexGenerator.setProperties(terrainSize * 0.05 * heightFactor, 3);
                simplexGenerator.apply(renderResources.currentTerrain);

                simplexGenerator.setProperties(terrainSize * 0.01 * heightFactor, 5);
                simplexGenerator.apply(renderResources.currentTerrain);

                simplexGenerator.setProperties(terrainSize * 0.005 * heightFactor, 10);
                simplexGenerator.apply(renderResources.currentTerrain);

                simplexGenerator.setProperties(terrainSize * 0.001 * heightFactor, 20);
                simplexGenerator.apply(renderResources.currentTerrain);

                simplexGenerator.setProperties(terrainSize * 0.0001 * heightFactor, 100);
                simplexGenerator.apply(renderResources.currentTerrain);
            });
            renderResources.currentTerrain.terrainTexture = renderResources.grassImage;

            renderResources.currentTerrain.update();

            Controllers.camera.x = renderResources.currentTerrain.width() * renderResources.currentTerrain.scale.x * 0.5;
            Controllers.camera.z = renderResources.currentTerrain.height() * renderResources.currentTerrain.scale.z * 0.55;
        },

        GrowForest: function growForest(gl, renderResources, numTicks) {
            Controllers.forest.generate(numTicks, renderResources.currentTerrain);
            Controllers.forest.vegetationObjects.forEach(function(vegetation) {
                vegetation._generateRenderMesh(gl, renderResources.currentTerrain);
            });
        },

        UpdateUI: function updateUI(resources) {
            var camera = Controllers.camera;

            $('#cam-x').text(camera.x.toFixed(2));
            $('#cam-y').text(camera.y.toFixed(2));
            $('#cam-z').text(camera.z.toFixed(2));

            $('#cam-rot-x').text(camera.rotation.x.toFixed(1));
            $('#cam-rot-y').text(camera.rotation.y.toFixed(1));

            var chunkIndex = resources.currentTerrain.chunks.indexOf(resources.currentTerrain.getChunkForPosition(camera.x, camera.z));
            $('#terrain-chunk-index').text(chunkIndex);

            var terrainNormal = resources.currentTerrain.getNormal(camera.x, camera.z);
            $('#terrain-norm-x').text(terrainNormal.x.toFixed(4));
            $('#terrain-norm-y').text(terrainNormal.y.toFixed(4));
            $('#terrain-norm-z').text(terrainNormal.z.toFixed(4));

            $('#num-particles').text(Controllers.particleSystem.activeParticles);
        },

        UpdateCamera: function updateCamera(resources) {

            var mouse = Controllers.mouse;
            var camera = Controllers.camera;
            var keyboard = Controllers.keyboard;

            var mousePos = mouse.getPosition();

            //  Ignore deltas if they're "too big" (i.e. cursor was taken off the element and moved
            //      somewhere else, could handle this better)
            var mouseDelta;
            if (Math.abs(mousePos.x - previousMousePos.x) < mouseDeltaIgnoreThreshold &&
                Math.abs(mousePos.y - previousMousePos.y) < mouseDeltaIgnoreThreshold)
                mouseDelta = { x: mousePos.x - previousMousePos.x, y: mousePos.y - previousMousePos.y };
            else
                mouseDelta = { x: 0, y: 0 };
            previousMousePos = mousePos;

            var cameraSensitivity = 0.1;

            if (mouse.checkLeftButton()) {
                camera.rotation.y -= mouseDelta.x * cameraSensitivity;
                camera.rotation.x -= mouseDelta.y * cameraSensitivity;
            }

            var timeDelta = Controllers.time.getDelta();
            var moveSpeed = (Math.max(cameraYOffset, -1) + 2) * timeDelta;
            if (keyboard.checkKey('W'))
                camera.moveForward(moveSpeed);
            if (keyboard.checkKey('A'))
                camera.moveLeft(moveSpeed);
            if (keyboard.checkKey('S'))
                camera.moveBackward(moveSpeed);
            if (keyboard.checkKey('D'))
                camera.moveRight(moveSpeed);

            if (keyboard.checkKey('X'))
                cameraYOffset += moveSpeed;
            if (keyboard.checkKey('Z'))
                cameraYOffset -= moveSpeed;

            cameraYOffset = Math.clamp(cameraYOffset, cameraYOffsetBounds.min, cameraYOffsetBounds.max);

            camera.y = resources.currentTerrain.getValue(camera.x, camera.z) + cameraYOffset;

            if (camera.rotation.y > 360)
                camera.rotation.y -= 360;
            if (camera.rotation.y < 0)
                camera.rotation.y += 360;

            if (camera.rotation.x > 90)
                camera.rotation.x = 90;
            if (camera.rotation.x < -90)
                camera.rotation.x = -90;
        },

        RenderTerrain: function renderTerrain(gl, resources) {
            if (!ProcForest.Settings.drawTerrain)
                return;

            gl.useProgram(resources.terrainShader);

            var terrain = resources.currentTerrain;
            var shaderParams = resources.terrainShaderParams;
            glHelper.enableAttribArrays(gl, shaderParams.attribArrays);



            gl.uniformMatrix4fv(shaderParams.u_ModelViewMatrix, false,
                resources.modelViewMatrix.elements);
            gl.uniformMatrix4fv(shaderParams.u_ProjectionMatrix, false,
                resources.projectionMatrix.elements);

            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, terrain.terrainTexture);
            gl.uniform1i(shaderParams.u_Texture0, 0);

            var terrainData = terrain.getRenderingBuffers();
            for (var i = 0; i < terrainData.numBatches; i++) {
                gl.bindBuffer(gl.ARRAY_BUFFER, terrainData.vertexBuffers[i]);
                gl.vertexAttribPointer(shaderParams.a_Vertex, 3, gl.FLOAT, false, 0, 0);

                gl.bindBuffer(gl.ARRAY_BUFFER, terrainData.colorBuffers[i]);
                gl.vertexAttribPointer(shaderParams.a_Color, 3, gl.FLOAT, false, 0, 0);

                gl.bindBuffer(gl.ARRAY_BUFFER, terrainData.texCoordBuffers[i]);
                gl.vertexAttribPointer(shaderParams.a_TexCoord0, 2, gl.FLOAT, false, 0, 0);

                gl.bindBuffer(gl.ARRAY_BUFFER, terrainData.normalBuffers[i]);
                gl.vertexAttribPointer(shaderParams.a_Normal, 3, gl.FLOAT, false, 0, 0);

                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, terrainData.indexBuffers[i]);

                gl.drawElements(gl.TRIANGLES, terrainData.triangleCounts[i] * 3, gl.UNSIGNED_SHORT, 0);
            }

            glHelper.disableAttribArrays(gl, shaderParams.attribArrays);
        },

        RenderSkybox: function renderSkybox(gl, resources) {
            if (!ProcForest.Settings.drawSkybox)
                return;

            //  Normal generation isn't right, don't care enough to do this correctly
            gl.disable(gl.CULL_FACE);

            gl.useProgram(resources.skyboxShader);

            var shaderParams = resources.skyboxShaderParams;
            glHelper.enableAttribArrays(gl, shaderParams.attribArrays);

            var skyboxModelview = new Matrix4();
            skyboxModelview.rotate(Controllers.camera.rotation.x, 1, 0, 0);
            skyboxModelview.rotate(Controllers.camera.rotation.y, 0, 1, 0);
            gl.uniformMatrix4fv(shaderParams.u_ModelViewMatrix, false, skyboxModelview.elements);
            gl.uniformMatrix4fv(shaderParams.u_ProjectionMatrix, false, resources.projectionMatrix.elements);

            var skybox = resources.skybox;
            var renderdata = skybox.getRenderingBuffers();

            gl.activeTexture(gl.TEXTURE0);

            var i;
            for (i = 0; i < renderdata.elementCounts.length; i++) {
                gl.bindTexture(gl.TEXTURE_2D, renderdata.textures[i]);
                gl.uniform1i(shaderParams.u_Texture0, 0);

                gl.bindBuffer(gl.ARRAY_BUFFER, renderdata.vertexBuffers[i]);
                gl.vertexAttribPointer(shaderParams.a_Vertex, 3, gl.FLOAT, false, 0, 0);

                gl.bindBuffer(gl.ARRAY_BUFFER, renderdata.texCoordBuffers[i]);
                gl.vertexAttribPointer(shaderParams.a_TexCoord0, 2, gl.FLOAT, false, 0, 0);

                gl.drawArrays(gl.TRIANGLES, 0, renderdata.elementCounts[i] * 3);
            }

            glHelper.disableAttribArrays(gl, shaderParams.attribArrays);

            gl.enable(gl.CULL_FACE);
        },

        RenderLakes: function renderLakes(gl, resources) {

        },

        RenderForest: function renderForest(gl, resources, brightnessFactor_) {
            if (!ProcForest.Settings.drawForest)
                return;

            brightnessFactor_ = brightnessFactor_ || 1;

            var forest = Controllers.forest;

            //var shader = resources.coloredGeometryShader;
            //var shaderParams = resources.coloredGeometryShaderParams;

            var shader = resources.proceduralShader;
            var shaderParams = resources.proceduralShaderParams;

            gl.useProgram(shader);

            gl.uniformMatrix4fv(shaderParams.u_ModelViewMatrix, false, resources.modelViewMatrix.elements);
            gl.uniformMatrix4fv(shaderParams.u_ProjectionMatrix, false, resources.projectionMatrix.elements);

            gl.uniform1f(shaderParams.u_NoiseParameter, ProcForest.Settings.textureGenSeed);
            gl.uniform1f(shaderParams.u_BrightnessFactor, brightnessFactor_);
            ProcForest.Settings.textureGenSeed += Controllers.time.getDelta() * ProcForest.Settings.textureVelocity;

            glHelper.enableAttribArrays(gl, shaderParams.attribArrays);

            var i, vegetationObject;
            for (i = 0; i < forest.vegetationObjects.length; i++) {
                vegetationObject = forest.vegetationObjects[i];
                //vegetationObject.drawStructure(gl, shaderParams, false);
                vegetationObject.draw(gl, shaderParams, resources.currentTerrain, false);
            }

            glHelper.disableAttribArrays(gl, shaderParams.attribArrays);
        },

        RenderParticles: function renderParticles(gl, resources) {
            if (!ProcForest.Settings.drawParticles)
                return;

            var particleSystem = Controllers.particleSystem;
            var shaderParams = resources.particleShaderParams;

            gl.useProgram(resources.particleShader);
            gl.enableVertexAttribArray(shaderParams.a_Vertex);
            gl.enableVertexAttribArray(shaderParams.a_Color);
            gl.uniformMatrix4fv(shaderParams.u_ModelViewMatrix, false, resources.modelViewMatrix.elements);
            gl.uniformMatrix4fv(shaderParams.u_ProjectionMatrix, false, resources.projectionMatrix.elements);
            particleSystem.draw(gl, shaderParams.a_Vertex, shaderParams.a_Color);
            gl.disableVertexAttribArray(shaderParams.a_Vertex);
            gl.disableVertexAttribArray(shaderParams.a_Color);
        },

        UpdateParticles: function updateParticles(gl, resources) {
            var particleSystem = Controllers.particleSystem;
            var terrain = resources.currentTerrain;

            //  Spawn particles randomly over the terrain
            var numParticles = 15;
            var i, x, y, z, xnorm, znorm;
            for (i = 0; i < numParticles; i++) {
                x = Math.random() * terrain.renderWidth();
                z = Math.random() * terrain.renderHeight();
                y = terrain.getValue(x, z) + Math.random() * 15 + 0.25;

                xnorm = x / terrain.renderWidth();
                znorm = z / terrain.renderHeight();

                particleSystem.generateParticles(x, y, z, 1, 10, { r: Math.random(), g: Math.random(), b: Math.random() });
            }

            particleSystem.update();
        },

        RenderClouds: function renderClouds(gl, resources) {

        },



        RenderAll: function renderAllElements(gl, resources) {
            this.RenderSkybox(gl, resources);
            this.RenderTerrain(gl, resources);
            //this.RenderSpecialSquare(gl, resources);
            this.RenderLakes(gl, resources);
            this.RenderForest(gl, resources, 0.25);
            this.RenderParticles(gl, resources);
            this.RenderClouds(gl, resources);
        },

        RenderEmissive: function renderEmissiveElements(gl, resources) {
            //this.RenderSkybox(gl, resources);
            this.RenderForest(gl, resources, 1);
            this.RenderParticles(gl, resources);
            //this.RenderSpecialSquare(gl, resources);
        }
    };

})();