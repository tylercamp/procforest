
//  http://xissburg.com/faster-gaussian-blur-in-glsl/

attribute vec4 a_Vertex;
attribute vec2 a_TexCoord;

varying vec2 v_TexCoord;
varying vec2 v_BlurTexCoords[14];

uniform float u_PixelStep;

void main()
{
    gl_Position = a_Vertex;
    v_TexCoord = a_TexCoord;
    v_BlurTexCoords[ 0] = v_TexCoord + vec2(-0.028, 0.0);
    v_BlurTexCoords[ 1] = v_TexCoord + vec2(-0.024, 0.0);
    v_BlurTexCoords[ 2] = v_TexCoord + vec2(-0.020, 0.0);
    v_BlurTexCoords[ 3] = v_TexCoord + vec2(-0.016, 0.0);
    v_BlurTexCoords[ 4] = v_TexCoord + vec2(-0.012, 0.0);
    v_BlurTexCoords[ 5] = v_TexCoord + vec2(-0.008, 0.0);
    v_BlurTexCoords[ 6] = v_TexCoord + vec2(-0.004, 0.0);
    v_BlurTexCoords[ 7] = v_TexCoord + vec2( 0.004, 0.0);
    v_BlurTexCoords[ 8] = v_TexCoord + vec2( 0.008, 0.0);
    v_BlurTexCoords[ 9] = v_TexCoord + vec2( 0.012, 0.0);
    v_BlurTexCoords[10] = v_TexCoord + vec2( 0.016, 0.0);
    v_BlurTexCoords[11] = v_TexCoord + vec2( 0.020, 0.0);
    v_BlurTexCoords[12] = v_TexCoord + vec2( 0.024, 0.0);
    v_BlurTexCoords[13] = v_TexCoord + vec2( 0.028, 0.0);
}