
uniform mat4 u_ProjectionMatrix;
uniform mat4 u_ModelViewMatrix;

attribute vec4 a_Vertex;
attribute vec4 a_Color;

varying vec4 v_Color;

void main() {
    v_Color = a_Color;
    gl_Position = u_ProjectionMatrix * u_ModelViewMatrix * a_Vertex;
}