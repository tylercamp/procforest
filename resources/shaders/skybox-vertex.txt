
uniform mat4 u_ProjectionMatrix;
uniform mat4 u_ModelViewMatrix;

attribute vec4 a_Vertex;
attribute vec2 a_TexCoord0;

varying vec2 v_TexCoord0;

void main(void) {
    v_TexCoord0 = a_TexCoord0;
    gl_Position = u_ProjectionMatrix * u_ModelViewMatrix * a_Vertex;
}