precision mediump float;

uniform sampler2D u_texture;
uniform float u_time;
uniform float u_dust_time;
uniform float u_play;
uniform float u_state;

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

float rand2d(vec2 co){
    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

void main() {
    vec2 uv = v_texCoord;

    vec4 tex = texture2D(u_texture, uv);
    vec3 baseColor = tex.rgb;    
    vec3 col = baseColor;

    float t = u_time;

    float l = luminance(baseColor);
    float warmth = baseColor.r * 0.6 + baseColor.g * 0.3 - baseColor.b * 0.4;

    float warmMask = smoothstep(0.05, 0.30, warmth) * smoothstep(0.25, 0.7,  l);

    warmMask *= (1.0 - smoothstep(0.1, 0.4, uv.x));

    if (u_state == 1.0 && u_play == 1.0) {
        float gate = step(0.8, noise(t * 0.8));
        float flickerNoise = noise(t * 20.0);
        float flickerStrength = gate * flickerNoise;

        float dimAmount = mix(0.0, 1.0, flickerStrength);

        vec3 brightColor = baseColor * vec3(1.6, 1.1, 0.85) + vec3(0.08, 0.04, 0.0);
        vec3 darkDip     = baseColor * 0.10;

        vec3 flickered   = mix(brightColor, darkDip, dimAmount);

        col = mix(col, flickered, warmMask);
    }

    float dust = 0.0;
    float dt = u_dust_time;

    for(int i = 0; i < 6; i++){
        float fi = float(i);

        float speed = 0.05 + rand(fi) * 0.05;
        float angle = rand(fi + 10.0) * 6.28;
        vec2 dir = vec2(cos(angle), sin(angle));

        float scale = 15.0 + rand(fi + 20.0) * 10.0;

        vec2 dustUV = uv * scale + dir * dt * speed;
        vec2 id = floor(dustUV);
        vec2 f = fract(dustUV);

        float r = rand2d(id);

        if(r > 0.97) {
            vec2 p = vec2(rand2d(id), rand2d(id + 5.0));
            float dist = distance(f, p);

            float fadeSpeed = 1.0 + rand(r) * 2.0;
            float fadeOffset = r * 100.0;
            float fade = 0.5 + 0.5 * sin(dt * fadeSpeed + fadeOffset);

            dust += smoothstep(0.05, 0.0, dist) * fade;
        }
    }

    col += vec3(1.0, 0.5, 0.4) * dust * 0.4;

    if (u_state == 2.0) {
        float gray = dot(col, vec3(0.3, 0.58, 0.12));
        vec3 coolTint = vec3(0.8, 0.9, 1.0);
        col = mix(col, vec3(gray) * coolTint, 0.8);

        float gradient = mix(1.0, -0.14, uv.x);
        col *= gradient;
    }

    gl_FragColor = vec4(clamp(col, 0.0, 1.0), tex.a);
}
