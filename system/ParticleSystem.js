/**
 * Created by emilysquid on 10/13/14.
 **/


;(function() {

    "use strict";

    function createArrayFromVectors(arrayOfVectors, lifetimes) {
        var result = [], i, vector;
        for (i = 0; i < arrayOfVectors.length; i++) {
            if (lifetimes[i] > 0) {
                vector = arrayOfVectors[i];
                result.push(vector.elements[0]);
                result.push(vector.elements[1]);
                result.push(vector.elements[2]);
            }
        }

        return new Float32Array(result);
    }

    function ParticleSystem(gl) {
        this.maxParticles = 3000;
        this.particleArray = [];
        this.velocity = [];
        this.lifeTimes = [];
        this.lifeSpan = 0;
        this.clusterSize = 10;
        this.height = 30;
        this.posX = 50;
        this.posZ = 20;
        this.activeParticles = 0;

        this._vertexBuffer = gl.createBuffer();
        //initial positions of vertices (vectors inside an array)
        var i;
        //fill array with vector4s and initial positions
        for ( i = 0; i < this.maxParticles; i++){
            this.particleArray.push( new Vector4([(Math.random()* this.clusterSize- (0.5 * this.clusterSize)) + this.posX, Math.random() * this.height,
                    (Math.random() * this.clusterSize- (0.5 * this.clusterSize)) + this.posZ ]) );
        }

        //fill array with velocity
        for(var p = 0; p < this.maxParticles; p++) {
            this.velocity.push( new Vector4([Math.random() *.3 -.05, Math.random() *.3-.05, Math.random() *.3-.05, 1.0]) );
        }

        for(var l = 0; l < this.maxParticles; l++) {
            this.lifeTimes.push(this.lifeSpan);
        }

    }
    ParticleSystem.prototype.generateParticles = function(positionX, positionY, positionZ, count, lifeTime) {
        var numCreated = 0;
        for(var l = 0; l < this.maxParticles && numCreated < count; l++) {
            if (this.lifeTimes[l] == 0) {
                this.particleArray[l].elements[0] = positionX;
                this.particleArray[l].elements[1] = positionY;
                this.particleArray[l].elements[2] = positionZ;
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

                particlePosition.x = this.particleArray[i].elements[0];
                particlePosition.y = this.particleArray[i].elements[1];
                particlePosition.z = this.particleArray[i].elements[2];

                //apply velocity
                particlePosition.x += this.velocity[i].elements[0] * deltaTime;
                particlePosition.y += this.velocity[i].elements[1] * deltaTime;
                particlePosition.z += this.velocity[i].elements[2] * deltaTime;

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

    ParticleSystem.prototype.draw = function(gl, a_Vertex) {
        /*CONVERT*/
        var particleVerts = createArrayFromVectors(this.particleArray, this.lifeTimes);

        // Bind the buffer object to target
        gl.bindBuffer(gl.ARRAY_BUFFER, this._vertexBuffer);
        // Write date into the buffer object
        gl.bufferData(gl.ARRAY_BUFFER, particleVerts, gl.DYNAMIC_DRAW);
        // Assign the buffer object to a_Vertex variable
        gl.vertexAttribPointer(a_Vertex, 3, gl.FLOAT, false, 0, 0);

        gl.drawArrays(gl.POINTS, 0, this.activeParticles);
    };


    window.ParticleSystem = ParticleSystem;
})();