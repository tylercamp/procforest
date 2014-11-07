
uniform mat4 u_ProjectionMatrix;
uniform mat4 u_ModelViewMatrix;

attribute vec4 a_Vertex;
attribute vec4 a_Color;
attribute vec3 a_Normal;
attribute vec2 a_TexCoord0;

varying vec4 v_Color;
varying vec3 v_Normal;
varying vec2 v_TexCoord0;

void main(void) {
    v_Color = a_Color;
    v_Normal = a_Normal;
    v_TexCoord0 = a_TexCoord0;
    gl_Position = u_ProjectionMatrix * u_ModelViewMatrix * a_Vertex;
}