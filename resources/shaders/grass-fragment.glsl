
precision mediump float;

uniform sampler2D u_Diffuse;

varying vec2 v_TexCoord0;

void main(void) {
    gl_FragColor = texture2D(u_Diffuse, v_TexCoord0);
    if (gl_FragColor.a < 0.1)
        discard;

    gl_FragColor.rgb *= vec3(0.2, 0.21, 0.2) * 0.7;
    gl_FragColor.a = pow(gl_FragColor.a, 3.0);
}