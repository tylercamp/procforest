
precision mediump float;

uniform sampler2D u_ScreenTexture;
varying vec2 v_ScreenTexCoord;

void main(void) {
    gl_FragColor = texture2D(u_ScreenTexture, v_ScreenTexCoord);
}