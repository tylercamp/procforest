
precision mediump float;

uniform mat4 u_ProjectionMatrix;
uniform mat4 u_ModelViewMatrix;

attribute vec4 a_Vertex;
attribute vec4 a_Color;

varying vec3 v_Position;
varying vec4 v_Color;

void main() {
    v_Position = a_Vertex.xyz;
    v_Color = a_Color;
    gl_Position = u_ProjectionMatrix * u_ModelViewMatrix * a_Vertex;
}