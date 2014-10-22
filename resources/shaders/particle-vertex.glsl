
uniform mat4 u_ModelViewMatrix;
uniform mat4 u_ProjectionMatrix;

attribute vec4 a_Vertex;

void main(void) {
    gl_Position = u_ProjectionMatrix * u_ModelViewMatrix * a_Vertex;
    gl_PointSize = 1.0/gl_Position.z;
}