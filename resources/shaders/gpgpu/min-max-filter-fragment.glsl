
uniform int u_SampleWidth;
uniform int u_SampleHeight;

uniform sampler2D u_SampleTexture;
uniform sampler2D u_DataTexture;
uniform float u_HStep;
uniform float u_VStep;

varying vec2 v_TexCoord;

#define MAX_SAMPLE_SIZE 32.0


//  http://stackoverflow.com/questions/9882716/packing-float-into-vec4-how-does-this-code-work
vec4 pack_depth(float depth);
float unpack_depth(vec4 rgba_depth);

void main(void) {
    vec2 maxTexel, minTexel, texel;
    float maxValue = -1000.0, minValue = 1000.0, value;

    float x = 0.0, y = 0.0;
    vec4 sample;
    while (y < MAX_SAMPLE_SIZE) {
        while (x < MAX_SAMPLE_SIZE) {
            if (u_SampleTexture != -1) {
                sample = texture2D(u_SampleTexture, v_TexCoord + vec2(x * u_HStep, y * u_VStep);

                //  Detect max
                value = unpack_sample(texture2D(u_DataTexture, sample.xy));
                if (value > maxValue) {
                    maxValue = value;
                    maxTexel = sample.xy;
                }

                //  Detect min
                value = unpack_sample(texture2D(u_DataTexture, sample.zw);
                if (value < minValue) {
                    minValue = value;
                    minTexel = sample.zw;
                }
            }
            else {
                texel = v_TexCoord + vec2(x * u_HStep, y * u_VStep);

                sample = texture2D(u_DataTexture, texel);
                value = unpack_depth(sample);

                if (value > maxValue) {
                    maxValue = value;
                    maxTexel = texel;
                }

                if (value < minValue) {
                    minValue = value;
                    minTexel = texel;
                }
            }

            if (x >= u_SampleWidth)
                break;
        }

        if (y >= u_SampleHeight)
            break;
    }

    gl_FragColor.xy = maxTexel;
    gl_FragColor.zw = minTexel;
}

vec4 pack_float(float value)
{
    const vec4 bit_shift = vec4(256.0*256.0*256.0, 256.0*256.0, 256.0, 1.0);
    const vec4 bit_mask  = vec4(0.0, 1.0/256.0, 1.0/256.0, 1.0/256.0);
    vec4 res = fract(value * bit_shift);
    res -= res.xxyz * bit_mask;
    return res;
}

float unpack_float(vec4 rgba_value)
{
    const vec4 bit_shift = vec4(1.0/(256.0*256.0*256.0), 1.0/(256.0*256.0), 1.0/256.0, 1.0);
    float value = dot(rgba_value, bit_shift);
    return value;
}