varying highp vec2 vTextureCoord;

void main(void) {
    vTextureCoord = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
