/**
 * Created by tylercamp on 9/11/14.
 */

;(function() {

    "use strict";

    var templateVertices;
    var templateTexCoords;
    var templateColors;

    function SingleImageSkybox(textureImage) {
        this._textureImage = textureImage;
    }

    function MultiImageSkybox(textureImages) {
        this._textureImages = textureImages;

        console.assert(textureImages.length >= 5, 'A Skybox texture array needs at least 5 textures (front, left, right, top, back)');
    }
    
    window.Skybox = function Skybox(textureImages) {
        this._skyboxImplementation = null;

        if (textureImages instanceof Array) {
            this._skyboxImplementation = new MultiImageSkybox(textureImages);
        }
        else {
            this._skyboxImplementation = new SingleImageSkybox(textureImages);
        }
    };

    Skybox.prototype.generateBuffers = function generateBuffersProxy(gl) {
        return this._skyboxImplementation.generateBuffers(gl);
    };

    Skybox.prototype.getRenderingBuffers = function getRenderingBuffersProxy() {
        return this._skyboxImplementation.getRenderingBuffers();
    };




    /*************** SingleImageSkybox Implementation ****************/

    SingleImageSkybox.prototype.generateBuffers = function generateBuffersAndTextureObject(gl) {
        this._glTextureObject = glHelper.generateTextureObject(gl, this._textureImage, gl.CLAMP_TO_EDGE);

        this._glVertexBuffer = gl.createBuffer();
        this._glTexCoordBuffer = gl.createBuffer();
        this._glColorBuffer = gl.createBuffer();

        this._fillBuffers(gl, 10000);
    };

    SingleImageSkybox.prototype._fillBuffers = function insertVertexDataToBuffers(gl, cubeSize) {

        cubeSize /= 2;

        /* Values hard-coded from spatial reasoning */

        // All spatial comments are from the perspective of standing in the cube and looking
        //      at the front face
        var vertices = [
            //  Front
            -cubeSize, cubeSize, -cubeSize, // Front-top-left
            cubeSize, cubeSize, -cubeSize, // Front-top-right
            cubeSize, -cubeSize, -cubeSize, // Front-bottom-right

            -cubeSize, cubeSize, -cubeSize, // Front-top-left
            cubeSize, -cubeSize, -cubeSize, // Front-bottom-right
            -cubeSize, -cubeSize, -cubeSize, // Front-bottom-left

            // Back
            -cubeSize, cubeSize, cubeSize, // Back-top-left
            cubeSize, cubeSize, cubeSize, // Back-top-right
            cubeSize, -cubeSize, cubeSize, // Back-bottom-right

            -cubeSize, cubeSize, cubeSize, // Back-top-left
            cubeSize, -cubeSize, cubeSize, // Back-bottom-right
            -cubeSize, -cubeSize, cubeSize, // Back-bottom-left

            // Left
            -cubeSize, cubeSize, -cubeSize, // Left-front-top
            -cubeSize, -cubeSize, -cubeSize, // Left-front-bottom
            -cubeSize, -cubeSize, cubeSize, // Left-back-bottom

            -cubeSize, cubeSize, -cubeSize, // Left-front-top
            -cubeSize, -cubeSize, cubeSize, // Left-back-bottom
            -cubeSize, cubeSize, cubeSize, // Left-back-top

            // Right
            cubeSize, cubeSize, -cubeSize, // Right-front-top
            cubeSize, -cubeSize, -cubeSize, // Right-front-bottom
            cubeSize, -cubeSize, cubeSize, // Right-back-bottom

            cubeSize, cubeSize, -cubeSize, // Right-front-top
            cubeSize, -cubeSize, cubeSize, // Right-back-bottom
            cubeSize, cubeSize, cubeSize, // Right-back-top

            // Top
            cubeSize, cubeSize, -cubeSize, // Top-front-right
            cubeSize, cubeSize, cubeSize, // Top-back-right
            -cubeSize, cubeSize, cubeSize, // Top-back-left

            cubeSize, cubeSize, -cubeSize, // Top-front-right
            -cubeSize, cubeSize, cubeSize, // Top-back-left
            -cubeSize, cubeSize, -cubeSize, // Top-front-left

            // Bottom
            cubeSize, -cubeSize, -cubeSize, // Bottom-front-right
            cubeSize, -cubeSize, cubeSize, // Bottom-back-right
            -cubeSize, -cubeSize, cubeSize, // Bottom-back-left

            cubeSize, -cubeSize, -cubeSize, // Bottom-front-right
            -cubeSize, -cubeSize, cubeSize, // Bottom-back-left
            -cubeSize, -cubeSize, -cubeSize // Bottom-front-left
        ];


        //  In texture coordinate space
        var cellWidth = 1 / 4;
        var cellHeight = 1 / 3;
        //  Assume that front face is at (1, 1) on cell grid

        var texcoords = [
            //  Front
            1 * cellWidth, 2 * cellHeight, // Front-top-left
            2 * cellWidth, 2 * cellHeight, // Front-top-right
            2 * cellWidth, 1 * cellHeight, // Front-bottom-right

            1 * cellWidth, 2 * cellHeight, // Front-top-left
            2 * cellWidth, 1 * cellHeight, // Front-bottom-right
            1 * cellWidth, 1 * cellHeight, // Front-bottom-left

            // Back
            4 * cellWidth, 2 * cellHeight, // Back-top-left
            3 * cellWidth, 2 * cellHeight, // Back-top-right
            3 * cellWidth, 1 * cellHeight, // Back-bottom-right

            4 * cellWidth, 2 * cellHeight, // Back-top-left
            3 * cellWidth, 1 * cellHeight, // Back-bottom-right
            4 * cellWidth, 1 * cellHeight, // Back-bottom-left

            // Left
            1 * cellWidth, 2 * cellHeight, // Left-front-top
            1 * cellWidth, 1 * cellHeight, // Left-front-bottom
            0 * cellWidth, 1 * cellHeight, // Left-back-bottom

            1 * cellWidth, 2 * cellHeight, // Left-front-top
            0 * cellWidth, 1 * cellHeight, // Left-back-bottom
            0 * cellWidth, 2 * cellHeight, // Left-back-top

            // Right
            2 * cellWidth, 2 * cellHeight, // Right-front-top
            2 * cellWidth, 1 * cellHeight, // Right-front-bottom
            3 * cellWidth, 1 * cellHeight, // Right-back-bottom

            2 * cellWidth, 2 * cellHeight, // Right-front-top
            3 * cellWidth, 1 * cellHeight, // Right-back-bottom
            3 * cellWidth, 2 * cellHeight, // Right-back-top

            // Top
            2 * cellWidth, 2 * cellHeight, // Top-front-right
            2 * cellWidth, 3 * cellHeight, // Top-back-right
            1 * cellWidth, 3 * cellHeight, // Top-back-left

            2 * cellWidth, 2 * cellHeight, // Top-front-right
            1 * cellWidth, 3 * cellHeight, // Top-back-left
            1 * cellWidth, 2 * cellHeight, // Top-front-left

            // Bottom
            2 * cellWidth, 1 * cellHeight, // Bottom-front-right
            2 * cellWidth, 0 * cellHeight, // Bottom-back-right
            1 * cellWidth, 0 * cellHeight, // Bottom-back-left

            2 * cellWidth, 1 * cellHeight, // Bottom-front-right
            1 * cellWidth, 0 * cellHeight, // Bottom-back-left
            1 * cellWidth, 1 * cellHeight // Bottom-front-left
        ];


//        var colors = [];
//        var i;
//
//        //  6 faces, 2 triangles per face, 3 vertices per triangle
//        for (i = 0; i < 6 * 2 * 3; i++) {
//            colors.push(1.0); // r
//            colors.push(1.0); // g
//            colors.push(1.0); // b
//        }

        vertices = new Float32Array(vertices);
        gl.bindBuffer(gl.ARRAY_BUFFER, this._glVertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

        texcoords = new Float32Array(texcoords);
        gl.bindBuffer(gl.ARRAY_BUFFER, this._glTexCoordBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, texcoords, gl.STATIC_DRAW);

//        colors = new Float32Array(colors);
//        gl.bindBuffer(gl.ARRAY_BUFFER, this._glColorBuffer);
//        gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
    };

    SingleImageSkybox.prototype.getRenderingBuffers = function getRenderBuffersAndTextureObject() {

        if (this._glTextureObject === undefined || this._glTextureObject === null) {
            console.error('Skybox.generateBuffers must be called before getRenderingBuffers can be called.');
        }

        var self = this;
        return {
            vertexBuffers: [self._glVertexBuffer],
            texCoordBuffers: [self._glTexCoordBuffer],
            //colorBuffers: [self._glColorBuffer],
            elementCounts: [6 * 2], // 6 faces, 2 triangles per face
            textures: [self._glTextureObject]
        };
    };



    /*************** MultiImageSkybox Implementation ****************/

    MultiImageSkybox.prototype.generateBuffers = function generateBuffersAndTextureObjects(gl) {
        var numTextures = this._textureImages.length;
        var i;
        var vertexData = this._generateVertexBufferArrays(10000);

        this._glTextureObjects = new Array(numTextures);
        this._glVertexBuffers = new Array(numTextures);
        this._glTexCoordBuffers = new Array(numTextures);
        //this._glColorBuffers = new Array(numTextures);
        this._elementCounts = new Array(numTextures);

        for (i = 0; i < numTextures; i++) {
            this._glTextureObjects[i] = glHelper.generateTextureObject(gl, this._textureImages[i], gl.CLAMP_TO_EDGE);

            this._glVertexBuffers[i] = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, this._glVertexBuffers[i]);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexData[i]), gl.STATIC_DRAW);

            this._glTexCoordBuffers[i] = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, this._glTexCoordBuffers[i]);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
                0, 0,   0, 1,   1, 1,
                0, 0,   1, 0,   1, 1
            ]), gl.STATIC_DRAW);

//            this._glColorBuffers[i] = gl.createBuffer();
//            gl.bindBuffer(gl.ARRAY_BUFFER, this._glColorBuffers[i]);
//            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
//                1, 1, 1,   1, 1, 1,   1, 1, 1,
//                1, 1, 1,   1, 1, 1,   1, 1, 1
//            ]), gl.STATIC_DRAW);

            this._elementCounts[i] = 2;
        }
    };

    MultiImageSkybox.prototype._generateVertexBufferArrays = function generateVertexBufferArrays(cubeSize) {
        var result = [];
        cubeSize /= 2;

        /*** Front face ***/
        result.push([
            -cubeSize, -cubeSize, -cubeSize,   -cubeSize, cubeSize, -cubeSize,   cubeSize, cubeSize, -cubeSize,
            -cubeSize, -cubeSize, -cubeSize,   cubeSize, -cubeSize, -cubeSize,   cubeSize, cubeSize, -cubeSize
        ]);

        /*** Left face ***/
        result.push([
            -cubeSize, -cubeSize, cubeSize,   -cubeSize, cubeSize, cubeSize,   -cubeSize, cubeSize, -cubeSize,
            -cubeSize, -cubeSize, cubeSize,   -cubeSize, -cubeSize, -cubeSize, -cubeSize, cubeSize, -cubeSize
        ]);

        /*** Right face ***/
        result.push([
            cubeSize, -cubeSize, -cubeSize,   cubeSize, cubeSize, -cubeSize,   cubeSize, cubeSize, cubeSize,
            cubeSize, -cubeSize, -cubeSize,   cubeSize, -cubeSize, cubeSize,   cubeSize, cubeSize, cubeSize
        ]);

        /*** Top face ***/
        result.push([
            -cubeSize, cubeSize, -cubeSize, cubeSize, cubeSize, -cubeSize, cubeSize, cubeSize, cubeSize,
            -cubeSize, cubeSize, -cubeSize,   -cubeSize, cubeSize, cubeSize,   cubeSize, cubeSize, cubeSize
        ]);

        /*** Back face ***/
        result.push([
            cubeSize, -cubeSize, cubeSize,   cubeSize, cubeSize, cubeSize,   -cubeSize, cubeSize, cubeSize,
            cubeSize, -cubeSize, cubeSize,   -cubeSize, -cubeSize, cubeSize,   -cubeSize, cubeSize, cubeSize
        ]);

        /*** Bottom ***/
        //  If a bottom image was specified
        if (this._textureImages.length === 6) {
            result.push([
                -cubeSize, -cubeSize, cubeSize,   -cubeSize, -cubeSize, -cubeSize,   cubeSize, -cubeSize, -cubeSize,
                -cubeSize, -cubeSize, cubeSize,   cubeSize, -cubeSize, cubeSize,   cubeSize, -cubeSize, -cubeSize
            ]);
        }

        return result;
    };

    MultiImageSkybox.prototype.getRenderingBuffers = function getRenderingBuffersAndTextureObjects() {
        var self = this;
        return {
            vertexBuffers: self._glVertexBuffers,
            texCoordBuffers: self._glTexCoordBuffers,
            //colorBuffers: self._glColorBuffers,
            elementCounts: self._elementCounts,
            textures: self._glTextureObjects
        };
    };

})();