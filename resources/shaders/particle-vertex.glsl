
uniform mat4 u_ModelViewMatrix;
uniform mat4 u_ProjectionMatrix;

attribute vec4 a_Vertex;
attribute vec4 a_Color;
varying vec4 v_Color;

void main(void) {
    v_Color = a_Color;
    gl_Position = u_ProjectionMatrix * u_ModelViewMatrix * a_Vertex;
    gl_PointSize = 1.0/gl_Position.z;
}