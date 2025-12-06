precision mediump float;

uniform sampler2D u_texture;
uniform float u_time;

varying vec2 v_texCoord;

float rand(float n){return fract(sin(n) * 43758.5453123);}

float noise(float p){
    float fl = floor(p);
    float fc = fract(p);
    return mix(rand(fl), rand(fl + 1.0), fc);
}

float luminance(vec3 c) {
    return dot(c, vec3(0.2126, 0.7152, 0.0722));
}

void main() {
    vec2 uv = v_texCoord;

    vec4 tex = texture2D(u_texture, uv);
    vec3 col = tex.rgb;

    float t = u_time;

    float l = luminance(col);
    float warmth = col.r * 0.6 + col.g * 0.3 - col.b * 0.4;

    // warm bright areas
    float warmMask = smoothstep(0.05, 0.30, warmth) *
                     smoothstep(0.25, 0.7,  l);

    // left region
    warmMask *= (1.0 - smoothstep(0.1, 0.4, uv.x));

    // ------------ FLICKER ------------
    float gate = step(0.8, noise(t * 0.8));
    float flickerNoise = noise(t * 20.0);
    float flickerStrength = gate * flickerNoise;

    float dimAmount = mix(0.0, 1.0, flickerStrength);

    vec3 brightColor = col * vec3(1.6, 1.1, 0.85) + vec3(0.08, 0.04, 0.0);

    vec3 darkDip = col * 0.10; // 25 percent of original brightness

    vec3 flickered = mix(brightColor, darkDip, dimAmount);

    col = mix(col, flickered, warmMask);

    float d = distance(uv, vec2(0.5));
    float vignette = smoothstep(0.9, 0.5, d);
    col *= vignette;

    gl_FragColor = vec4(clamp(col, 0.0, 1.0), tex.a);
}
