precision mediump float;

uniform sampler2D u_ScreenTexture;
varying vec2 v_ScreenTexCoord;



void main(void) {
    vec4 screenTexel = texture2D(u_ScreenTexture, v_ScreenTexCoord);

    //vec4 result = vec4(
    //    ProcessChannel(screenTexel.r),
    //    ProcessChannel(screenTexel.g),
    //    ProcessChannel(screenTexel.b),
    //    screenTexel.a
    //);

    float len = length(vec3(screenTexel.x, screenTexel.y, screenTexel.z));
    float max = 1.732; // sqrt(3)
    float numBands = 8.0 - 1.0;

    float val = floor((len / max) * numBands + 0.5) / numBands;

    gl_FragColor = vec4(val, val, val, 1.0);
}