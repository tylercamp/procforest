precision mediump float;

varying vec4 v_Color;
varying vec4 v_Position;

const float MaxDistance = 150.0;
const float FadeDistance = 100.0;

void main(void) {
    gl_FragColor = v_Color;
    gl_FragColor.a *= 1.0 - max(0.0, length(v_Position) - FadeDistance) / (MaxDistance - FadeDistance);
}