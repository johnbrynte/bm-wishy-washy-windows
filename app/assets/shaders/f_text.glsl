uniform sampler2D sampler;
uniform vec3 color;

varying highp vec2 vTextureCoord;

void main(void) {
    vec4 mask = texture2D(sampler, vTextureCoord);
    gl_FragColor = vec4(color, mask.a);
}
