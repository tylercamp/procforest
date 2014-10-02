
precision mediump float;

uniform sampler2D u_ScreenTexture;
uniform sampler2D u_EmissiveTexture;

#define KERNEL_SIZE 3
#define KERNEL_SIZEF 3.0
uniform float u_SampleKernel[KERNEL_SIZE];

varying vec2 v_ScreenTexCoord;



//  -kernelSize / 2
#define KERNEL_BASE_OFFSET -1.5

// range of sample locations (x/y)
#define KERNEL_RANGE 3.0
#define BUFFER_SIZE 128.0
#define EMISSION_INTENSITY_FACTOR 1.0



void main(void) {

    vec4 emissiveSum = vec4(0,0,0,0);
    float kernelElementFactor = KERNEL_RANGE / (BUFFER_SIZE * KERNEL_SIZEF);

    for (float y = 0.0; y <= KERNEL_SIZEF; y++) {
        for (float x = 0.0; x <= KERNEL_SIZEF; x++) {
            vec2 emissiveTexel = vec2(
                v_ScreenTexCoord.x + kernelElementFactor * (x + KERNEL_BASE_OFFSET),
                v_ScreenTexCoord.y + kernelElementFactor * (y + KERNEL_BASE_OFFSET)
            );

            emissiveSum += texture2D(u_EmissiveTexture, emissiveTexel) * u_SampleKernel[int(y) * KERNEL_SIZE + int(x)];
        }
    }





    gl_FragColor = texture2D(u_ScreenTexture, v_ScreenTexCoord) + emissiveSum * EMISSION_INTENSITY_FACTOR;
}