
//  http://xissburg.com/faster-gaussian-blur-in-glsl/

attribute vec4 a_Vertex;
attribute vec2 a_TexCoord;

varying vec2 v_TexCoord;
varying vec2 v_BlurTexCoords[14];

uniform float u_PixelSize;

void main()
{
    gl_Position = a_Vertex;
    v_TexCoord = a_TexCoord;
    v_BlurTexCoords[ 0] = v_TexCoord + vec2(0.0, -7.0*u_PixelSize);
    v_BlurTexCoords[ 1] = v_TexCoord + vec2(0.0, -6.0*u_PixelSize);
    v_BlurTexCoords[ 2] = v_TexCoord + vec2(0.0, -5.0*u_PixelSize);
    v_BlurTexCoords[ 3] = v_TexCoord + vec2(0.0, -4.0*u_PixelSize);
    v_BlurTexCoords[ 4] = v_TexCoord + vec2(0.0, -3.0*u_PixelSize);
    v_BlurTexCoords[ 5] = v_TexCoord + vec2(0.0, -2.0*u_PixelSize);
    v_BlurTexCoords[ 6] = v_TexCoord + vec2(0.0, -u_PixelSize);
    v_BlurTexCoords[ 7] = v_TexCoord + vec2(0.0,  u_PixelSize);
    v_BlurTexCoords[ 8] = v_TexCoord + vec2(0.0,  2.0*u_PixelSize);
    v_BlurTexCoords[ 9] = v_TexCoord + vec2(0.0,  3.0*u_PixelSize);
    v_BlurTexCoords[10] = v_TexCoord + vec2(0.0,  4.0*u_PixelSize);
    v_BlurTexCoords[11] = v_TexCoord + vec2(0.0,  5.0*u_PixelSize);
    v_BlurTexCoords[12] = v_TexCoord + vec2(0.0,  6.0*u_PixelSize);
    v_BlurTexCoords[13] = v_TexCoord + vec2(0.0,  7.0*u_PixelSize);
}