
precision mediump float;

uniform sampler2D u_ScreenTexture;
varying vec2 v_ScreenTexCoord;
varying vec4 v_Color;

void main(void) {
    gl_FragColor = texture2D(u_ScreenTexture, v_ScreenTexCoord);
    gl_FragColor.rgb *= v_Color.rgb * v_Color.a;
}