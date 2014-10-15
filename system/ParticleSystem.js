/**
 * Created by emilysquid on 10/13/14.
 **/

;(function() {

    "use strict";

    function createArrayFromVectors(arrayOfVectors) {
        var result = [];

        arrayOfVectors.forEach(function (vector) {
            result.push(vector.elements[0]);
            result.push(vector.elements[1]);
            result.push(vector.elements[2])
        });
        return new Float32Array(result);
    }

    function ParticleSystem(gl) {
        this.particleCount = 3000;
        this.particleArray = [];
        this.velocity = [];

        this._vertexBuffer = gl.createBuffer();

        //initial positions of vertices (vectors inside an array)
        var i;
        for (i = 0; i < this.particleCount; i++){
            this.particleArray.push( new Vector4([Math.random()* 2 - 1, Math.random()* 2 - 1, Math.random() *.1, 1.0]) );
        }

        for(var p = 0; p < this.particleCount; p++) {
            this.velocity.push( new Vector4([Math.random() *.001 -.0005, Math.random() *.001-.0005, Math.random() *.01, 1.0]) );
        }
    }

    ParticleSystem.prototype.update = function() {
        //moves x & y positions periodically
        var particlePosition = { x: 0, y: 0 };
        var i;
        for (i = 0; i < this.particleCount; i++){
            particlePosition.x = this.particleArray[i].elements[0];
            particlePosition.y = this.particleArray[i].elements[1];

            particlePosition.x += this.velocity[i].elements[0];
            particlePosition.y += this.velocity[i].elements[1];

            if(particlePosition.y < -1 || particlePosition.y > 1
                || particlePosition.x < -1 || particlePosition.x > 1) {
                particlePosition.y = Math.random() * 2 - 1;
                particlePosition.x = Math.random() * 2 - 1;

            }
            this.particleArray[i].elements[0] = particlePosition.x;
            this.particleArray[i].elements[1] = particlePosition.y;
        }
    };

    ParticleSystem.prototype.draw = function(gl, a_Vertex) {
        /*CONVERT*/
        var particleVerts = createArrayFromVectors(this.particleArray);

        // Bind the buffer object to target
        gl.bindBuffer(gl.ARRAY_BUFFER, this._vertexBuffer);
        // Write date into the buffer object
        gl.bufferData(gl.ARRAY_BUFFER, particleVerts, gl.DYNAMIC_DRAW);
        // Assign the buffer object to a_Vertex variable
        gl.vertexAttribPointer(a_Vertex, 3, gl.FLOAT, false, 0, 0);

        gl.drawArrays(gl.POINTS, 0, this.particleCount);
    };


    window.ParticleSystem = ParticleSystem;
})();