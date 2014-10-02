
attribute vec2 a_Vertex;
attribute vec2 a_ScreenTexCoord;

varying vec2 v_ScreenTexCoord;
//  Assume a 5x5 filter kernel
varying vec2 v_GaussianSampleTexCoords[25];

void main() {
    v_ScreenTexCoord = a_ScreenTexCoord;
    gl_Position = vec4(a_Vertex.x, a_Vertex.y, 0, 1);
}