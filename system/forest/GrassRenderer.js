/**
 * Created by tylercamp on 11/4/14.
 */

;(function() {

    "use strict";

    function appendVec3ToArray(array, vector) {
        array.push(vector.x);
        array.push(vector.y);
        array.push(vector.z);
    }

    function appendVec2ToArray(array, vector) {
        array.push(vector.x);
        array.push(vector.y);
    }

    function generateGrassPlane(verticesArray, texCoordsArray, position, normal, width, height, rotationDegrees) {
        var perp = Math.perpVector(normal);
        var rotMatrix = new Matrix4();

        perp = new Vector4([perp.x, perp.y, perp.z, 1]);
        rotMatrix.setRotate(rotationDegrees, normal.x, normal.y, normal.z);

        var bl, br, tl, tr;
        bl = rotMatrix.multiplyVector4(perp);

        bl = { x: bl.elements[0], y: bl.elements[1], z: bl.elements[2] };
        br = { x: -bl.x, y: -bl.y, z: -bl.z };
        bl = Math.vecOfLength(bl, width / 2);
        br = Math.vecOfLength(br, width / 2);
        tl = Math.vecSum(bl, Math.vecOfLength(normal, height));
        tr = Math.vecSum(br, Math.vecOfLength(normal, height));

        bl = Math.vecSum(bl, position);
        br = Math.vecSum(br, position);
        tl = Math.vecSum(tl, position);
        tr = Math.vecSum(tr, position);

        appendVec3ToArray(verticesArray, bl);
        appendVec3ToArray(verticesArray, br);
        appendVec3ToArray(verticesArray, tl);

        appendVec3ToArray(verticesArray, tl);
        appendVec3ToArray(verticesArray, br);
        appendVec3ToArray(verticesArray, tr);



        var tlc, trc, blc, brc;
        tlc = { x: 0, y: 1 };
        trc = { x: 1, y: 1 };
        blc = { x: 0, y: 0 };
        brc = { x: 1, y: 0 };

        appendVec2ToArray(texCoordsArray, blc);
        appendVec2ToArray(texCoordsArray, brc);
        appendVec2ToArray(texCoordsArray, tlc);

        appendVec2ToArray(texCoordsArray, tlc);
        appendVec2ToArray(texCoordsArray, brc);
        appendVec2ToArray(texCoordsArray, trc);
    }
    
    function GrassRenderer() {
        this.mesh = new Mesh();

        this._meshWidth = 1;
        this._meshHeight = 0.35;

        this._widthVariance = this._meshWidth / 2;
        this._heightVariance = this._meshHeight / 2;

        this._count = 0;
    }

    GrassRenderer.prototype.maxMeshes = function() {
        return 5460; // Only for 2x-plane-per-mesh configuration
    };

    GrassRenderer.prototype.setGrassTexture = function(texture) {
        this._grassTexture = texture;
    };

    GrassRenderer.prototype.setMeshSize = function(width, height) {
        this._meshWidth = width || this._meshWidth;
        this._meshHeight = height || this._meshHeight;
    };

    GrassRenderer.prototype.setMeshVariance = function(widthVariance, heightVariance) {
        this._widthVariance = widthVariance || this._widthVariance;
        this._heightVariance = heightVariance || this._heightVariance;
    };

    GrassRenderer.prototype.generate = function(gl, terrain, count) {
        //  Max of 5,460 grass instances (buffer size limit)
        this._count = Math.min(this.maxMeshes(), count);

        var vertices = [];
        var texCoords = [];
        var i, rotation, normal, width, height, position = {};

        for (i = 0; i < this._count; i++) {
            position.x = Math.random() * terrain.renderWidth();
            position.z = Math.random() * terrain.renderHeight();
            position.y = terrain.getValue(position.x, position.z);
            rotation = Math.random() * 360;
            normal = terrain.getNormal(position.x, position.z);
            width = this._meshWidth + (Math.random() * 2 - 1) * this._widthVariance;
            height = this._meshHeight + (Math.random() * 2 - 1) * this._heightVariance;
            generateGrassPlane(vertices, texCoords, position, normal, width, height, rotation);
            generateGrassPlane(vertices, texCoords, position, normal, width, height, rotation + 90);
        }

        this.mesh.setVertices({
            data: vertices
        });

        this.mesh.setTexUnitCoords({
            data: texCoords
        });

        this.mesh.build(gl);
    };

    GrassRenderer.prototype.draw = function(gl, shaderParams, autoAttribArrays_) {
        if (autoAttribArrays_ === undefined)
            autoAttribArrays_ = true;

        if (autoAttribArrays_) {
            gl.enableVertexAttribArray(shaderParams.a_Vertex);
            gl.enableVertexAttribArray(shaderParams.a_TexCoord0);
        }

        var renderBuffers = this.mesh.getBuffers(gl);

        gl.bindBuffer(gl.ARRAY_BUFFER, renderBuffers.vertices);
        gl.vertexAttribPointer(shaderParams.a_Vertex, this.mesh.vertexDescriptor.stride, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, renderBuffers.texCoords[0]);
        gl.vertexAttribPointer(shaderParams.a_TexCoord0, 2, gl.FLOAT, false, 0, 0);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this._grassTexture);
        gl.uniform1i(shaderParams.u_Diffuse, 0);

        gl.drawArrays(gl.TRIANGLES, 0, this.mesh.numElements());

        if (autoAttribArrays_) {
            gl.disableVertexAttribArray(shaderParams.a_TexCoord0);
            gl.disableVertexAttribArray(shaderParams.a_Vertex);
        }
    };

    window.GrassRenderer = GrassRenderer;

})();