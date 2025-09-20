#ifdef GL_ES
precision mediump float;
#endif

const float PHI = 1.61803398874989484820459; // Φ = Golden Ratio
uniform float u_time;

// A simpler, faster pseudo-random function
float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

void main() {
  // Use the simpler random function for each channel with different offsets
  gl_FragColor = vec4(random(gl_FragCoord.xy + fract(u_time) * 100.0),
                      random(gl_FragCoord.xy + fract(u_time) * 200.0),
                      random(gl_FragCoord.xy + fract(u_time) * 300.0), 0.001);
}
}
