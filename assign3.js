"use strict";

function main() {
  // Get A WebGL context
  /** @type {HTMLCanvasElement} */
  var canvas = document.querySelector("#canvas");
  var gl = canvas.getContext("webgl");
  if (!gl) {
    return;
  }

  // setup GLSL program
  var program = webglUtils.createProgramFromScripts(gl, ["vertex-shader-3d", "fragment-shader-3d"]);

  // look up where the vertex data needs to go.
  var positionLocation = gl.getAttribLocation(program, "a_position");
  //var colorLocation = gl.getAttribLocation(program, "a_color");
  var normalLocation = gl.getAttribLocation(program, "a_normal");

  // lookup uniforms
  var worldViewProjectionLocation = gl.getUniformLocation(program, "u_worldViewProjection");
  var worldInverseTransposeLocation = gl.getUniformLocation(program, "u_worldInverseTranspose");
  var colorLocation = gl.getUniformLocation(program, "u_color");
  var reverseLightDirectionLocation = gl.getUniformLocation(program, "u_reverseLightDirection");

  var positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  setGeometry(gl);

  var normalBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
  setNormals(gl);

  function radToDeg(r) {
    return r * 180 / Math.PI;
  }

  function degToRad(d) {
    return d * Math.PI / 180;
  }

  var fieldOfViewRadians = degToRad(60);
  var fRotationRadians = 0;

  drawScene();

  webglLessonsUI.setupSlider("#fRotation", {value: radToDeg(fRotationRadians), slide: updateRotation, min: -360, max: 360});

  function updateRotation(event, ui) {
    fRotationRadians = degToRad(ui.value);
    drawScene();
  }

  function drawScene() {
    webglUtils.resizeCanvasToDisplaySize(gl.canvas);

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);
    gl.useProgram(program);
    gl.enableVertexAttribArray(positionLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    var size = 3;          // 3 components per iteration
    var type = gl.FLOAT;   // the data is 32bit floats
    var normalize = false; // don't normalize the data
    var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
    var offset = 0;        // start at the beginning of the buffer
    gl.vertexAttribPointer(positionLocation, size, type, normalize, stride, offset);

    gl.enableVertexAttribArray(normalLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);

    var size = 3;                 // 3 components per iteration
    var type = gl.FLOAT;  // the data is 8bit unsigned values
    var normalize = false;         // normalize the data (convert from 0-255 to 0-1)
    var stride = 0;               // 0 = move forward size * sizeof(type) each iteration to get the next position
    var offset = 0;               // start at the beginning of the buffer
    gl.vertexAttribPointer(normalLocation, size, type, normalize, stride, offset);

    var aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    var zNear = 1;
    var zFar = 2000;
    var projectionMatrix = m4.perspective(fieldOfViewRadians, aspect, zNear, zFar);

    var camera = [200, 250, 300];
    var target = [0, 50, 0];
    var up = [0, 1, 0];
    var cameraMatrix = m4.lookAt(camera, target, up);

    var viewMatrix = m4.inverse(cameraMatrix);
    var viewProjectionMatrix = m4.multiply(projectionMatrix, viewMatrix);
    var worldMatrix = m4.yRotation(fRotationRadians);

    var worldViewProjectionMatrix = m4.multiply(viewProjectionMatrix, worldMatrix);
    var worldInverseMatrix = m4.inverse(worldMatrix);
    var worldInverseTransposeMatrix = m4.transpose(worldInverseMatrix);

    gl.uniformMatrix4fv(worldViewProjectionLocation, false, worldViewProjectionMatrix);
    gl.uniformMatrix4fv(worldInverseTransposeLocation, false, worldInverseTransposeMatrix);

    gl.uniform4fv(colorLocation, [0.2, 1, 0.2, 1]); // green
    gl.uniform3fv(reverseLightDirectionLocation, m4.normalize([0.5, 0.7, 1]));
  
    var primitiveType = gl.TRIANGLES;
    var offset = 0;
    var count = 52 * 6;
    gl.drawArrays(primitiveType, offset, count);
  }
}

function setGeometry(gl) {
    var positions = new Float32Array([
          // D부분 
          // left column 앞
          0, 0, 0,
          20, 0, 0,
          0, 150, 0,
          0, 150, 0,
          20, 0, 0,
          20, 150, 0,

          // middle_top rung 앞
          20, 0, 0,
          20, 30, 0,
          60, 75, 0,
          60, 75, 0,
          20, 30, 0,
          40, 75, 0,

          // middle_bottom rung 앞
          20, 150, 0,
          20, 120, 0,
          60, 75, 0,
          60, 75, 0,
          20, 120, 0,
          40, 75, 0,

          // left column 뒤
          0, 0, 30,
          20, 0, 30,
          0, 150, 30,
          0, 150, 30,
          20, 0, 30,
          20, 150, 30,

          // middle_top rung 뒤
          20, 0, 30,
          20, 30, 30,
          60, 75, 30,
          60, 75, 30,
          20, 30, 30,
          40, 75, 30,

          // middle_bottom rung 뒤
          20, 150, 30,
          20, 120, 30,
          60, 75, 30,
          60, 75, 30,
          20, 120, 30,
          40, 75, 30,

          // top
          0, 0, 0,
          20, 0, 0,
          20, 0, 30,
          0, 0, 0,
          20, 0, 30,
          0, 0, 30,

          // top_right
          20, 0, 0,
          20, 0, 30,
          60, 75, 0,
          60, 75, 0,
          20, 0, 30,
          60, 75, 30,

          // bottom
          0, 150, 0,
          20, 150, 0,
          0, 150, 30,
          0, 150, 30,
          20, 150, 0,
          20, 150, 30,

          // bottom_right
          20, 150, 0,
          20, 150, 30,
          60, 75, 30,
          60, 75, 30,
          20, 150, 30,
          60, 75, 30,

          // left column 왼
          0, 0, 0,
          0, 150, 0,
          0, 150, 30,
          0, 150, 30,
          0, 150, 0,
          0, 0, 30,

          // middle_top rung 왼
          20, 30, 0,
          20, 30, 30,
          40, 75, 0,
          40, 75, 0,
          20, 30, 30,
          40, 75, 30,

          // middle_bottom rung 왼
          20, 120, 0,
          20, 120, 30,
          40, 75, 0,
          40, 75, 0,
          20, 120, 30,
          40, 75, 30,

          // right
          20, 30, 0,
          20, 30, 30,
          20, 120, 0,
          20, 120, 0,
          20, 30, 30,
          20, 120, 30,
          //////////////////////////////////////////////////////////////////////////////////

          // H부분 
          // left column 앞
          80, 0, 0,
          100, 0, 0,
          80, 150, 0,
          80, 150, 0,
          100, 0, 0,
          100, 150, 0,

          // right column 앞
          140, 0, 0,
          160, 0, 0,
          140, 150, 0,
          140, 150, 0,
          160, 0, 0,
          160, 150, 0,

          // middle rung 앞
          100, 60, 0,
          140, 60, 0,
          100, 90, 0,
          100, 90, 0,
          140, 60, 0,
          140, 90, 0,

          // left column 뒤
          80, 0, 30,
          100, 0, 30,
          80, 150, 30,
          80, 150, 30,
          100, 0, 30,
          100, 150, 30,

          // right column 뒤
          140, 0, 30,
          160, 0, 30,
          140, 150, 30,
          140, 150, 30,
          160, 0, 30,
          160, 150, 30,

          // middle rung 뒤
          100, 60, 30,
          140, 60, 30,
          100, 90, 30,
          100, 90, 30,
          140, 60, 30,
          140, 90, 30,

          // left top
          80, 0, 0,
          100, 0, 0,
          100, 0, 30,
          100, 0, 30,
          100, 0, 0,
          80, 0, 30,

          // right top
          140, 0, 0,
          160, 0, 0,
          160, 0, 30,
          160, 0, 30,
          160, 0, 0,
          140, 0, 30,

          // middle top
          100, 60, 0,
          140, 60, 0,
          140, 60, 30,
          140, 60, 30,
          140, 60, 0,
          100, 60, 30,

          // left bottom
          80, 150, 0,
          100, 150, 0,
          100, 150, 30,
          100, 150, 30,
          100, 150, 0,
          80, 150, 30,

          // right bottom
          140, 150, 0,
          160, 150, 0,
          160, 150, 30,
          160, 150, 30,
          160, 150, 0,
          140, 150, 30,

          // middle bottom
          100, 90, 0,
          140, 90, 0,
          140, 90, 30,
          140, 90, 30,
          140, 90, 0,
          100, 90, 30,
          
          // left
          80, 0, 0,
          80, 0, 30,
          80, 150, 0,
          80, 150, 0,
          80, 0, 30,
          80, 150, 30,

          // left_top
          140, 0, 0,
          140, 0, 30,
          140, 60, 0,
          140, 60, 0,
          140, 0, 30,
          140, 60, 30,

          // left_bottom
          140, 90, 0,
          140, 90, 30,
          140, 150, 0,
          140, 150, 0,
          140, 90, 30,
          140, 150, 30,

          // right
          160, 0, 0,
          160, 0, 30,
          160, 150, 0,
          160, 150, 0,
          160, 0, 30,
          160, 150, 30,

          // right_top
          100, 0, 0,
          100, 0, 30,
          100, 60, 0,
          100, 60, 0,
          100, 0, 30,
          100, 60, 30,

          // right_bottom
          100, 90, 0,
          100, 90, 30,
          100, 150, 0,
          100, 150, 0,
          100, 90, 30,
          100, 150, 30,
          //////////////////////////////////////////////////////////////////////////////////

          // M부분 
          // left column 앞
          180, 0, 0,
          200, 0, 0,
          180, 150, 0,
          180, 150, 0,
          200, 0, 0,
          200, 150, 0,

          // right column 앞
          250, 0, 0,
          270, 0, 0,
          250, 150, 0,
          250, 150, 0,
          270, 0, 0,
          270, 150, 0,

          // middle_left rung 앞
          200, 0, 0,
          200, 30, 0,
          225, 90, 0,
          225, 90, 0,
          200, 30, 0,
          225, 120, 0,

          // middle_left rung 앞
          225, 90, 0,
          225, 120, 0,
          250, 0, 0,
          250, 0, 0,
          225, 120, 0,
          250, 30, 0,

          // left column 뒤
          180, 0, 30,
          200, 0, 30,
          180, 150, 30,
          180, 150, 30,
          200, 0, 30,
          200, 150, 30,

          // right column 뒤
          250, 0, 30,
          270, 0, 30,
          250, 150, 30,
          250, 150, 30,
          270, 0, 30,
          270, 150, 30,

          // middle_left rung 뒤
          200, 0, 30,
          200, 30, 30,
          225, 90, 30,
          225, 90, 30,
          200, 30, 30,
          225, 120, 30,

          // middle_left rung 뒤
          225, 90, 30,
          225, 120, 30,
          250, 0, 30,
          250, 0, 30,
          225, 120, 30,
          250, 30, 30,

          // left top
          180, 0, 0,
          200, 0, 0,
          180, 0, 30,
          180, 0, 30,
          200, 0, 0,
          200, 0, 30,

          // right top
          250, 0, 0,
          270, 0, 0,
          250, 0, 30,
          250, 0, 30,
          270, 0, 0,
          270, 0, 30,

          // middle_left top
          200, 0, 0,
          200, 0, 30,
          225, 90, 0,
          225, 90, 0,
          200, 0, 30,
          225, 90, 30,

          // middle_right top
          250, 0, 0,
          250, 0, 30,
          225, 90, 0,
          225, 90, 0,
          250, 0, 30,
          225, 90, 30,

          // left bottom
          180, 150, 0,
          200, 150, 0,
          180, 150, 30,
          180, 150, 30,
          200, 150, 0,
          200, 150, 30,

          // right bottom
          250, 150, 0,
          270, 150, 0,
          250, 150, 30,
          250, 150, 30,
          270, 150, 0,
          270, 150, 30,

          // middle_left bottom
          200, 30, 0,
          200, 30, 30,
          225, 120, 0,
          225, 120, 0,
          200, 30, 30,
          225, 120, 30,

          // middle_right bottom
          250, 30, 0,
          250, 30, 30,
          225, 120, 0,
          225, 120, 0,
          250, 30, 30,
          225, 120, 30,

          // left_1
          180, 0, 0,
          180, 0, 30,
          180, 150, 30,
          180, 150, 30,
          180, 0, 30,
          180, 150, 30,

          // left_2
          250, 30, 0,
          250, 30, 30,
          250, 150, 0,
          250, 150, 0,
          250, 30, 30,
          250, 150, 30,

          // right_1
          270, 0, 0,
          270, 0, 30,
          270, 150, 30,
          270, 150, 30,
          270, 0, 30,
          270, 150, 30,

          // right_2
          200, 30, 0,
          200, 30, 30,
          200, 150, 0,
          200, 150, 0,
          200, 30, 30,
          200, 150, 30,
      ]);

  var matrix = m4.xRotation(Math.PI);
  matrix = m4.translate(matrix, -50, -75, -15);
    
  for (var ii = 0; ii < positions.length; ii += 3) {
    var vector = m4.transformPoint(matrix, [positions[ii + 0], positions[ii + 1], positions[ii + 2], 1]);
    positions[ii + 0] = vector[0];
    positions[ii + 1] = vector[1];
    positions[ii + 2] = vector[2];
  }

  gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
}

function setNormals(gl) {
    var normals = new Float32Array([

            // D부분
            // left column 앞
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
  
            // middle_top rung 앞
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,
  
            // middle_bottom rung 앞
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
  
            // left column 뒤
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,
  
            // middle_top rung 뒤
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,
  
            // middle_bottom rung 뒤
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,
  
            // top
            0, 1, 0,
            0, 1, 0,
            0, 1, 0,
            0, 1, 0,
            0, 1, 0,
            0, 1, 0,
  
            // top_right
            0, 1, 0,
            0, 1, 0,
            0, 1, 0,
            0, 1, 0,
            0, 1, 0,
            0, 1, 0,
  
            // bottom
            0, -1, 0,
            0, -1, 0,
            0, -1, 0,
            0, -1, 0,
            0, -1, 0,
            0, -1, 0,
  
            // bottom_right
            0, -1, 0,
            0, -1, 0,
            0, -1, 0,
            0, -1, 0,
            0, -1, 0,
            0, -1, 0,
  
            // left column 왼
            -1, 0, 0,
            -1, 0, 0,
            -1, 0, 0,
            -1, 0, 0,
            -1, 0, 0,
            -1, 0, 0,
  
            // middle_top rung 왼
            -1, -1, 0,
            -1, -1, 0,
            -1, -1, 0,
            -1, -1, 0,
            -1, -1, 0,
            -1, -1, 0,
  
            // middle_bottom rung 왼
            1, -1, 0,
            1, -1, 0,
            1, -1, 0,
            1, -1, 0,
            1, -1, 0,
            1, -1, 0,
  
            // right
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,
            //////////////////////////////////////////////////////////////////////////////////

            // H부분 
            // left column 앞
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
  
            // right column 앞
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
  
            // middle rung 앞
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,

            // left column 뒤
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,
  
            // right column 뒤
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,
  
            // middle rung 뒤
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,

            // left top
            0, 1, 0,
            0, 1, 0,
            0, 1, 0,
            0, 1, 0,
            0, 1, 0,
            0, 1, 0,

            // right top
            0, 1, 0,
            0, 1, 0,
            0, 1, 0,
            0, 1, 0,
            0, 1, 0,
            0, 1, 0,

            // middle top
            0, 1, 0,
            0, 1, 0,
            0, 1, 0,
            0, 1, 0,
            0, 1, 0,
            0, 1, 0,

            // left bottom
            0, -1, 0,
            0, -1, 0,
            0, -1, 0,
            0, -1, 0,
            0, -1, 0,
            0, -1, 0,

            // right bottom
            0, -1, 0,
            0, -1, 0,
            0, -1, 0,
            0, -1, 0,
            0, -1, 0,
            0, -1, 0,

            // middle bottom
            0, -1, 0,
            0, -1, 0,
            0, -1, 0,
            0, -1, 0,
            0, -1, 0,
            0, -1, 0,

            // left
            -1, 0, 0,
            -1, 0, 0,
            -1, 0, 0,
            -1, 0, 0,
            -1, 0, 0,
            -1, 0, 0,

            // left_top
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,

            // left_bottom
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,

            // right
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,

            // right_top
            -1, 0, 0,
            -1, 0, 0,
            -1, 0, 0,
            -1, 0, 0,
            -1, 0, 0,
            -1, 0, 0,

            // right_bottom
            -1, 0, 0,
            -1, 0, 0,
            -1, 0, 0,
            -1, 0, 0,
            -1, 0, 0,
            -1, 0, 0,
            //////////////////////////////////////////////////////////////////////////////////

            // M부분 
            // left column 앞
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,

            // right column 앞
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,

            // middle_left rung 앞
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,

            // middle_left rung 앞
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,

            // left column 뒤
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,

            // right column 뒤
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,

            // middle_left rung 뒤
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,

            // middle_left rung 뒤
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,

            // left top
            0, 1, 0,
            0, 1, 0,
            0, 1, 0,
            0, 1, 0,
            0, 1, 0,
            0, 1, 0,

            // right top
            0, 1, 0,
            0, 1, 0,
            0, 1, 0,
            0, 1, 0,
            0, 1, 0,
            0, 1, 0,

            // middle_left top
            1, 1, 0,
            1, 1, 0,
            1, 1, 0,
            1, 1, 0,
            1, 1, 0,
            1, 1, 0,

            // middle_right top
            -1, 1, 0,
            -1, 1, 0,
            -1, 1, 0,
            -1, 1, 0,
            -1, 1, 0,
            -1, 1, 0,

            // left bottom
            0, -1, 0,
            0, -1, 0,
            0, -1, 0,
            0, -1, 0,
            0, -1, 0,
            0, -1, 0,

            // right bottom
            0, -1, 0,
            0, -1, 0,
            0, -1, 0,
            0, -1, 0,
            0, -1, 0,
            0, -1, 0,

            // middle_left bottom
            -1, -1, 0,
            -1, -1, 0,
            -1, -1, 0,
            -1, -1, 0,
            -1, -1, 0,
            -1, -1, 0,

            // middle_right bottom
            1, -1, 0,
            1, -1, 0,
            1, -1, 0,
            1, -1, 0,
            1, -1, 0,
            1, -1, 0,

            // left_1
            -1, 0, 0,
            -1, 0, 0,
            -1, 0, 0,
            -1, 0, 0,
            -1, 0, 0,
            -1, 0, 0,

            // left_2
            -1, 0, 0,
            -1, 0, 0,
            -1, 0, 0,
            -1, 0, 0,
            -1, 0, 0,
            -1, 0, 0,

            // right_1
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,

            // right_2
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,
        ]);
    gl.bufferData(gl.ARRAY_BUFFER, normals, gl.STATIC_DRAW);
}

main();
