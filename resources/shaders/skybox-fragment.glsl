precision mediump float;

uniform sampler2D u_Texture0;

varying vec2 v_TexCoord0;

void main (void) {
    gl_FragColor = texture2D(u_Texture0, v_TexCoord0);
}