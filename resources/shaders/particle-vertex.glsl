
//  https://www.cs.uaf.edu/2009/spring/cs480/lecture/02_03_pretty.html

uniform mat4 u_ModelViewMatrix;
uniform mat4 u_ProjectionMatrix;

attribute vec4 a_Vertex;
attribute vec4 a_Color;
varying vec4 v_Color;

const float ParticleSize = 5.0;

void main(void) {
    v_Color = a_Color;
    gl_Position = u_ProjectionMatrix * u_ModelViewMatrix * a_Vertex;

    gl_PointSize = ParticleSize / gl_Position.w;
}
