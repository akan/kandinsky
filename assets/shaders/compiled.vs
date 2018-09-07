{@}fragment.fs{@}//---// START DEFAULT SHADERMATERIAL VARIABLES //---//

//precision highp float;
//precision highp int;
//#define SHADER_NAME ShaderMaterial
//#define MAX_DIR_LIGHTS 1
//#define MAX_POINT_LIGHTS 0
//#define MAX_SPOT_LIGHTS 0
//#define MAX_HEMI_LIGHTS 0
//#define MAX_SHADOWS 0
//#define GAMMA_FACTOR 2
//#define FLIP_SIDED
//uniform mat4 viewMatrix;
//uniform vec3 cameraPosition;

//---// END DEFAULT SHADERMATERIAL VARIABLES //---//

varying vec2 vUv;

void main() {
    gl_FragColor = vec4(vUv, 0.0, 1.0);
}{@}vertex.vs{@}//---// START DEFAULT SHADERMATERIAL VARIABLES //---//

//precision highp float;
//precision highp int;
//#define SHADER_NAME ShaderMaterial
//#define VERTEX_TEXTURES
//#define GAMMA_FACTOR 2
//#define MAX_DIR_LIGHTS 1
//#define MAX_POINT_LIGHTS 0
//#define MAX_SPOT_LIGHTS 0
//#define MAX_HEMI_LIGHTS 0
//#define MAX_SHADOWS 0
//#define MAX_BONES 251
//uniform mat4 modelMatrix;
//uniform mat4 modelViewMatrix;
//uniform mat4 projectionMatrix;
//uniform mat4 viewMatrix;
//uniform mat3 normalMatrix;
//uniform vec3 cameraPosition;
//attribute vec3 position;
//attribute vec3 normal;
//attribute vec2 uv;
//#ifdef USE_COLOR
//	attribute vec3 color;
//#endif
//#ifdef USE_MORPHTARGETS
//	attribute vec3 morphTarget0;
//	attribute vec3 morphTarget1;
//	attribute vec3 morphTarget2;
//	attribute vec3 morphTarget3;
//	#ifdef USE_MORPHNORMALS
//		attribute vec3 morphNormal0;
//		attribute vec3 morphNormal1;
//		attribute vec3 morphNormal2;
//		attribute vec3 morphNormal3;
//	#else
//		attribute vec3 morphTarget4;
//		attribute vec3 morphTarget5;
//		attribute vec3 morphTarget6;
//		attribute vec3 morphTarget7;
//	#endif
//#endif
//#ifdef USE_SKINNING
//	attribute vec4 skinIndex;
//	attribute vec4 skinWeight;
//#endif

//---// END DEFAULT SHADERMATERIAL VARIABLES //---//

varying vec2 vUv;

void main() {
    vUv = uv;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}{@}eyes.fs{@}//---// START DEFAULT SHADERMATERIAL VARIABLES //---//

//precision highp float;
//precision highp int;
//#define SHADER_NAME ShaderMaterial
//#define MAX_DIR_LIGHTS 1
//#define MAX_POINT_LIGHTS 0
//#define MAX_SPOT_LIGHTS 0
//#define MAX_HEMI_LIGHTS 0
//#define MAX_SHADOWS 0
//#define GAMMA_FACTOR 2
//#define FLIP_SIDED
//uniform mat4 viewMatrix;
//uniform vec3 cameraPosition;

//---// END DEFAULT SHADERMATERIAL VARIABLES //---//

varying vec2 vUv;

uniform sampler2D map;
uniform vec3 color;
uniform vec2 offset;
uniform float opacity;

void main() {
    vec2 uv = vUv / 3.0;
    uv += offset;
    vec4 image = texture2D(map, uv);
    gl_FragColor = vec4(color, image.a);
    gl_FragColor.a *= opacity;
}{@}eyes.vs{@}//---// START DEFAULT SHADERMATERIAL VARIABLES //---//

//precision highp float;
//precision highp int;
//#define SHADER_NAME ShaderMaterial
//#define VERTEX_TEXTURES
//#define GAMMA_FACTOR 2
//#define MAX_DIR_LIGHTS 1
//#define MAX_POINT_LIGHTS 0
//#define MAX_SPOT_LIGHTS 0
//#define MAX_HEMI_LIGHTS 0
//#define MAX_SHADOWS 0
//#define MAX_BONES 251
//uniform mat4 modelMatrix;
//uniform mat4 modelViewMatrix;
//uniform mat4 projectionMatrix;
//uniform mat4 viewMatrix;
//uniform mat3 normalMatrix;
//uniform vec3 cameraPosition;
//attribute vec3 position;
//attribute vec3 normal;
//attribute vec2 uv;
//#ifdef USE_COLOR
//	attribute vec3 color;
//#endif
//#ifdef USE_MORPHTARGETS
//	attribute vec3 morphTarget0;
//	attribute vec3 morphTarget1;
//	attribute vec3 morphTarget2;
//	attribute vec3 morphTarget3;
//	#ifdef USE_MORPHNORMALS
//		attribute vec3 morphNormal0;
//		attribute vec3 morphNormal1;
//		attribute vec3 morphNormal2;
//		attribute vec3 morphNormal3;
//	#else
//		attribute vec3 morphTarget4;
//		attribute vec3 morphTarget5;
//		attribute vec3 morphTarget6;
//		attribute vec3 morphTarget7;
//	#endif
//#endif
//#ifdef USE_SKINNING
//	attribute vec4 skinIndex;
//	attribute vec4 skinWeight;
//#endif

//---// END DEFAULT SHADERMATERIAL VARIABLES //---//

varying vec2 vUv;

void main() {
    vUv = uv;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}{@}mouth.fs{@}//---// START DEFAULT SHADERMATERIAL VARIABLES //---//

//precision highp float;
//precision highp int;
//#define SHADER_NAME ShaderMaterial
//#define MAX_DIR_LIGHTS 1
//#define MAX_POINT_LIGHTS 0
//#define MAX_SPOT_LIGHTS 0
//#define MAX_HEMI_LIGHTS 0
//#define MAX_SHADOWS 0
//#define GAMMA_FACTOR 2
//#define FLIP_SIDED
//uniform mat4 viewMatrix;
//uniform vec3 cameraPosition;

//---// END DEFAULT SHADERMATERIAL VARIABLES //---//

varying vec2 vUv;

uniform sampler2D map;
uniform vec2 offset;
uniform float opacity;

void main() {
    vec2 uv = vUv / 3.0;
    uv += offset;
    vec4 image = texture2D(map, uv);
    gl_FragColor = image;
    gl_FragColor.a *= opacity;
}{@}mouth.vs{@}//---// START DEFAULT SHADERMATERIAL VARIABLES //---//

//precision highp float;
//precision highp int;
//#define SHADER_NAME ShaderMaterial
//#define VERTEX_TEXTURES
//#define GAMMA_FACTOR 2
//#define MAX_DIR_LIGHTS 1
//#define MAX_POINT_LIGHTS 0
//#define MAX_SPOT_LIGHTS 0
//#define MAX_HEMI_LIGHTS 0
//#define MAX_SHADOWS 0
//#define MAX_BONES 251
//uniform mat4 modelMatrix;
//uniform mat4 modelViewMatrix;
//uniform mat4 projectionMatrix;
//uniform mat4 viewMatrix;
//uniform mat3 normalMatrix;
//uniform vec3 cameraPosition;
//attribute vec3 position;
//attribute vec3 normal;
//attribute vec2 uv;
//#ifdef USE_COLOR
//	attribute vec3 color;
//#endif
//#ifdef USE_MORPHTARGETS
//	attribute vec3 morphTarget0;
//	attribute vec3 morphTarget1;
//	attribute vec3 morphTarget2;
//	attribute vec3 morphTarget3;
//	#ifdef USE_MORPHNORMALS
//		attribute vec3 morphNormal0;
//		attribute vec3 morphNormal1;
//		attribute vec3 morphNormal2;
//		attribute vec3 morphNormal3;
//	#else
//		attribute vec3 morphTarget4;
//		attribute vec3 morphTarget5;
//		attribute vec3 morphTarget6;
//		attribute vec3 morphTarget7;
//	#endif
//#endif
//#ifdef USE_SKINNING
//	attribute vec4 skinIndex;
//	attribute vec4 skinWeight;
//#endif

//---// END DEFAULT SHADERMATERIAL VARIABLES //---//

varying vec2 vUv;

void main() {
    vUv = uv;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}