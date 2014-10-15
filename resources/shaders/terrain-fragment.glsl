precision mediump float;

uniform sampler2D u_Texture0;

varying vec2 v_TexCoord0;
varying vec4 v_Color;
varying vec3 v_Normal;

void main (void) {
    vec3 lightVec = normalize(vec3(-0.2, -1.0, -0.3));
    vec4 lightColor = vec4(vec3(0.3), 1.0);
    //vec4 lightColor = vec4(vec3(1.0), 1.0);
    float dotp = -dot(lightVec, v_Normal);

    vec4 texel = texture2D(u_Texture0, v_TexCoord0) * v_Color;

    gl_FragColor = vec4(texel.x * dotp, texel.y * dotp, texel.z * dotp, texel.w) * lightColor;
}