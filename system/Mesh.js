/**
 * Created by tylercamp on 9/30/14.
 */

;(function() {

    "use strict";

    function buildBuffer(gl, buffer, bufferData) {
        buffer = buffer || gl.createBuffer();
        if (!buffer)
            console.warn('gl.createBuffer failed');
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, bufferData, gl.STATIC_DRAW);

        return buffer;
    }


    
    function Mesh() {
        this.vertices = [];
        this.indices = [];
        this.normals = [];
        this.texCoordSets = [];
        this.colors = [];

        this.textures = [];
        this.luminanceTextures = [];

        this.vertexDescriptor = {};
        this.normalDescriptor = {};
        this.colorDescriptor = {};

        //  Whether or not the JS-copy of data will be retained after being uploaded to the GPU
        this.retainData = false;
        this._numData = 0;

        this._drawBuffers = {};

        this._needsBuild = true;
    }

    Mesh.prototype.build = function buildBuffers(gl) {

        if (!this.vertexDescriptor.primitive && this.vertexDescriptor.primitive !== 0) // 0 = gl.POINTS
            this.vertexDescriptor.primitive = gl.TRIANGLES; // Default to triangles

        //  Build buffers
        if (this.vertices.length)
            this._drawBuffers.vertices = buildBuffer(gl, this._drawBuffers.vertices, new Float32Array(this.vertices));

        if (this.indices.length)
            this._drawBuffers.indices = buildBuffer(gl, this._drawBuffers.indices, new Int16Array(this.indices));

        if (this.normals.length)
            this._drawBuffers.normals = buildBuffer(gl, this._drawBuffers.normals, new Float32Array(this.normals));

        if (this.colors.length)
            this._drawBuffers.colors = buildBuffer(gl, this._drawBuffers.colors, new Float32Array(this.colors));

        var i;
        for (i = 0; i < this.texCoordSets.length; i++) {
            if (!this.texCoordSets[i] || !(this.texCoordSets instanceof Array))
                continue;

            this._drawBuffers.texCoords = this._drawBuffers.texCoords || [];
            this._drawBuffers.texCoords[i] = buildBuffer(gl, this._drawBuffers.texCoords[i], new Float32Array(this.texCoordSets[i]));
        }

        //  Build textures (for images not yet converted)
        for (i = 0; i < this.textures.length; i++) {
            if (this.textures[i] instanceof Image) {
                this.textures[i] = glHelper.generateTextureObject(gl, this.textures[i]);
            }
        }

        for (i = 0; i < this.luminanceTextures.length; i++) {
            if (this.luminanceTextures[i] instanceof Image) {
                this.luminanceTextures[i] = glHelper.generateTextureObject(gl, this.luminanceTextures[i], gl.CLAMP_TO_EDGE);
            }
        }

        this._numData = this.vertices.length;

        if (!this.retainData) {
            this.vertices = [];
            this.indices = [];
            this.normals = [];
            this.colors = [];
            this.texCoordSets = [];
        }

        this._needsBuild = false;
    };

    Mesh.prototype.numElements = function() {
        return this._numData / this.vertexDescriptor.stride;
    };

    // Descriptor takes: 'data [float array]', 'stride [integer=3]', 'primitive [integer=gl.TRIANGLES]'
    Mesh.prototype.setVertices = function(descriptor) {
        this.vertices = descriptor.data;

        this.vertexDescriptor.stride = descriptor.stride || 3;
        this.vertexDescriptor.primitive = descriptor.primitive; // Can't set default without gl...

        this._needsBuild = true;
    };

    // Descriptor takes: 'data [integer array]'
    Mesh.prototype.setIndices = function(descriptor) {
        this.indices = descriptor.data;

        this._needsBuild = true;
    };

    // Descriptor takes: 'data [float array]', 'stride [integer=3]'
    Mesh.prototype.setNormals = function(descriptor) {
        this.normals = descriptor.data;

        this.normalDescriptor.stride = descriptor.stride || 3;

        this._needsBuild = true;
    };

    // Descriptor takes: 'data [float array]', 'stride [integer=3]'
    Mesh.prototype.setColors = function(descriptor) {
        this.colors = descriptor.data;

        this.colorDescriptor.stride = descriptor.stride || 3;

        this._needsBuild = true;
    };

    // Descriptor takes: 'data [float array]', 'textureUnit [integer=0]' (Stride always assumed 2)
    Mesh.prototype.setTexUnitCoords = function(descriptor) {
        descriptor.textureUnit = descriptor.textureUnit || 0;
        this.texCoordSets[descriptor.textureUnit] = descriptor.data;

        this._needsBuild = true;
    };

    //  Descriptor takes: 'image [Image]', 'textureUnit [integer=0]'
    Mesh.prototype.addTexture = function(textureDescriptor) {
        this.textures.push({
            image: textureDescriptor.image,
            textureUnit: textureDescriptor.textureUnit || 0
        });

        this._needsBuild = true;
    };

    //  Descriptor takes: 'image [Image]'
    Mesh.prototype.addLuminanceTexture = function(lumTextureDescriptor) {
        this.luminanceTextures.push(lumTextureDescriptor.image);

        this._needsBuild = true;
    };



    Mesh.prototype.getBuffers = function getRenderingBuffers(gl) {
        if (this._needsBuild) {
            console.warn('Rebuilding mesh at draw-time');
            this.build(gl);
        }

        return this._drawBuffers;
    };

    window.Mesh = Mesh;

})();