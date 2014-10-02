
//  A default vertex shader that can be used for post-processing shaders

attribute vec2 a_Vertex;
attribute vec2 a_ScreenTexCoord;

varying vec2 v_ScreenTexCoord;

void main() {
    v_ScreenTexCoord = a_ScreenTexCoord;
    gl_Position = vec4(a_Vertex.x, a_Vertex.y, 0, 1);
}