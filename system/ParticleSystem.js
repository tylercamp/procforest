/**
 * Created by emilysquid on 10/13/14.
 **/


;(function() {

    "use strict";

    function fillArrayFromVectors(arrayOfVectors, lifetimes, targetArray) {
        var numInserted = 0, i, vector;
        for (i = 0; i < arrayOfVectors.length; i++) {
            if (lifetimes[i] > 0) {
                vector = arrayOfVectors[i];
                targetArray[numInserted * 3 + 0] = vector.elements[0];
                targetArray[numInserted * 3 + 1] = vector.elements[1];
                targetArray[numInserted * 3 + 2] = vector.elements[2];

                ++numInserted;
            }
        }
    }

    function fillArrayFromFilteredColors(arrayOfColors, lifetimes, targetArray) {
        var i, numInserted = 0;
        for (i = 0; i < lifetimes.length; i++) {
            if (lifetimes[i] > 0) {
                targetArray[numInserted*4 + 0] = arrayOfColors[i * 4 + 0];
                targetArray[numInserted*4 + 1] = arrayOfColors[i * 4 + 1];
                targetArray[numInserted*4 + 2] = arrayOfColors[i * 4 + 2];
                targetArray[numInserted*4 + 3] = arrayOfColors[i * 4 + 3];

                ++numInserted;
            }
        }
    }

    function ParticleSystem(gl) {
        this.maxParticles = 10000;
        this.particleArray = [];
        this.velocity = [];
        this.lifeTimes = [];
        this.maxLifeTimes = [];
        this.clusterSize = 10;
        this.height = 30;
        this.posX = 50;
        this.posZ = 20;
        this.activeParticles = 0;
        this.particleColors = [];

        //  Rather than create a new buffer every time we render, pre-allocate the buffers and re-fill them
        //      when we render
        this._particlePositionsBuffer = new Float32Array(this.maxParticles * 3);
        this._particleColorsBuffer = new Float32Array(this.maxParticles * 4);

        this._vertexBuffer = gl.createBuffer();
        this._colorBuffer = gl.createBuffer();
        //initial positions of vertices (vectors inside an array)
        var i;
        //fill array with vector4s and initial positions
        for ( i = 0; i < this.maxParticles; i++){
            this.particleArray.push( new Vector4([(Math.random()* this.clusterSize- (0.5 * this.clusterSize)) + this.posX, Math.random() * this.height,
                    (Math.random() * this.clusterSize- (0.5 * this.clusterSize)) + this.posZ ]) );
        }

        //fill array with velocity
        for(var p = 0; p < this.maxParticles; p++) {
            this.velocity.push( new Vector4([Math.random() *.4 -.2, Math.random() *.4-.2, Math.random() *.4-.2, 1.0]) );
        }

        for(var l = 0; l < this.maxParticles; l++) {
            this.lifeTimes.push(0);
            this.maxLifeTimes.push(0);
            this.particleColors.push(Math.random());
            this.particleColors.push(Math.random());
            this.particleColors.push(Math.random());
            this.particleColors.push(1);
        }

    }
    ParticleSystem.prototype.generateParticles = function(positionX, positionY, positionZ, count, lifeTime, color) {
        var numCreated = 0;
        for(var l = 0; l < this.maxParticles && numCreated < count; l++) {
            if (this.lifeTimes[l] == 0) {
                this.maxLifeTimes[l] = lifeTime;
                this.particleArray[l].elements[0] = positionX;
                this.particleArray[l].elements[1] = positionY;
                this.particleArray[l].elements[2] = positionZ;
                this.particleColors[l*4 + 0] = color.r;
                this.particleColors[l*4 + 1] = color.g;
                this.particleColors[l*4 + 2] = color.b;
                this.lifeTimes[l] = lifeTime;
                this.activeParticles++;
                numCreated++;
            }
        }
    };

    ParticleSystem.prototype.update = function() {
        var deltaTime = Controllers.time.getDelta();
        //moves x & y positions periodically

        //this.particleArray = particle;
        var particlePosition = { x: 0, y: 0 , z:0};
        var i;
        for (i = 0; i < this.maxParticles; i++){
            if(this.lifeTimes[i] > 0) {//get positions from particle array
                this.lifeTimes[i] -= deltaTime;
                if (this.lifeTimes[i] <= 0) {
                    this.activeParticles--;
                    this.lifeTimes[i] = 0;
                }

                this.particleColors[i * 4 + 3] = Math.min(1, this.lifeTimes[i]/(this.maxLifeTimes[i]-5));
                this.particleColors[i * 4 + 3] += Math.sin(this.lifeTimes[i]);

                particlePosition.x = this.particleArray[i].elements[0];
                particlePosition.y = this.particleArray[i].elements[1];
                particlePosition.z = this.particleArray[i].elements[2];

                //apply velocity
                particlePosition.x += this.velocity[i].elements[0] * deltaTime * -Math.random();
                particlePosition.y += this.velocity[i].elements[1] * deltaTime * -Math.random();
                particlePosition.z += this.velocity[i].elements[2] * deltaTime * -Math.random();

                this.velocity[i].elements[0] += Math.random() *.01 - .005;
                this.velocity[i].elements[1] += Math.random() *.01 - .005;
                this.velocity[i].elements[2] += Math.random() *.01 - .005;

//            if(particlePosition.y < 0 || particlePosition.y > this.height
//                || particlePosition.x < -this.clusterSize  + this.posX|| particlePosition.x > this.clusterSize + this.posX
//                || particlePosition.z < -this.clusterSize  + this.posZ|| particlePosition.z > this.clusterSize + this.posZ) {
//                particlePosition.y = Math.random() * this.height;
//                particlePosition.x = (Math.random() * this.clusterSize- (0.5 * this.clusterSize))+ this.posX;
//                particlePosition.z = (Math.random() * this.clusterSize- (0.5 * this.clusterSize))+ this.posZ;
//
//            }
                this.particleArray[i].elements[0] = particlePosition.x;
                this.particleArray[i].elements[1] = particlePosition.y;
                this.particleArray[i].elements[2] = particlePosition.z;
            }
        }
    };

    ParticleSystem.prototype.draw = function(gl, a_Vertex, a_Color) {
        /*CONVERT*/
        fillArrayFromVectors(this.particleArray, this.lifeTimes, this._particlePositionsBuffer);
        fillArrayFromFilteredColors(this.particleColors, this.lifeTimes, this._particleColorsBuffer);

        // Bind the buffer object to target
        gl.bindBuffer(gl.ARRAY_BUFFER, this._vertexBuffer);
        // Write date into the buffer object
        gl.bufferData(gl.ARRAY_BUFFER, this._particlePositionsBuffer, gl.DYNAMIC_DRAW);
        // Assign the buffer object to a_Vertex variable
        gl.vertexAttribPointer(a_Vertex, 3, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, this._colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this._particleColorsBuffer, gl.DYNAMIC_DRAW);
        gl.vertexAttribPointer(a_Color, 4, gl.FLOAT, false, 0, 0);

        gl.drawArrays(gl.POINTS, 0, this.activeParticles);
    };


    window.ParticleSystem = ParticleSystem;
})();