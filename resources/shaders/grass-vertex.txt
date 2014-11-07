
uniform mat4 u_ModelViewMatrix;
uniform mat4 u_ProjectionMatrix;

attribute vec4 a_Vertex;
attribute vec2 a_TexCoord0;

varying vec2 v_TexCoord0;

void main(void) {
    gl_Position = u_ProjectionMatrix * u_ModelViewMatrix * a_Vertex;
    v_TexCoord0 = a_TexCoord0;
}