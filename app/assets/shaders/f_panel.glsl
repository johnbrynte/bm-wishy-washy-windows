uniform vec2 size;
uniform vec4 imageSize;
uniform sampler2D sampler;

varying highp vec2 vTextureCoord;

void main(void) {
    vec2 uv = vTextureCoord;
    vec2 coord = vec2(0.0, 0.0);
    // relative border size to panel
    float bW = imageSize.z / size.x;
    float bH = imageSize.w / size.y;
    
    if (uv.x < bW) {
        // relative border size to image
        coord.x = (uv.x / bW) * imageSize.z / imageSize.x;
    } else if (uv.x > 1.0 - bW) {
        // relative border size to image
        coord.x = 1.0 - (1.0 - ((uv.x - (1.0 - bW)) / bW)) * imageSize.z / imageSize.x;
    } else {
        // panel coordinate
        float px = imageSize.z / imageSize.x + (uv.x - bH) * (1.0 - 2.0 * imageSize.z / imageSize.x);
        float pW = size.x - 2.0 * imageSize.z;
        float iW = imageSize.x - 2.0 * imageSize.z - 2.0;
        // image coordinate
        coord.x = (imageSize.z + 1.0) / imageSize.x + (iW / imageSize.x) * fract((px * pW) / iW);
    }

    if (uv.y < bH) {
        // relative border size to image
        coord.y = (uv.y / bH) * imageSize.w / imageSize.y;
    } else if (uv.y > 1.0 - bH) {
        // relative border size to image
        coord.y = 1.0 - (1.0 - ((uv.y - (1.0 - bH)) / bH)) * imageSize.w / imageSize.y;
    } else {
        // panel coordinate
        float py = imageSize.w / imageSize.y + (uv.y - bW) * (1.0 - 2.0 * imageSize.w / imageSize.y);
        float pH = size.y - 2.0 * imageSize.w;
        float iH = imageSize.y - 2.0 * imageSize.w - 2.0;
        // image coordinate
        coord.y = (imageSize.w + 1.0) / imageSize.y + (iH / imageSize.y) * fract((py * pH) / iH);
    }

    gl_FragColor = texture2D(sampler, coord);
}
