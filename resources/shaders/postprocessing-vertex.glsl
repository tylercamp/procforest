
//  A default vertex shader that can be used for post-processing shaders

attribute vec2 a_Vertex;
attribute vec4 a_Color;
attribute vec2 a_ScreenTexCoord;

varying vec4 v_Color;
varying vec2 v_ScreenTexCoord;

void main() {
    v_Color = a_Color;
    v_ScreenTexCoord = a_ScreenTexCoord;
    gl_Position = vec4(a_Vertex.x, a_Vertex.y, 0, 1);
}