// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE =
  `precision mediump float;
  attribute vec4 a_Position;
  attribute vec2 a_UV;
  varying vec2 v_UV;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  uniform mat4 u_ViewMatrix;
  uniform mat4 u_ProjectionMatrix;

  uniform float u_Size;

  void main() {
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    v_UV = a_UV;

    gl_PointSize = u_Size;
  }`

// Fragment shader program
var FSHADER_SOURCE =
  `precision mediump float;
  varying vec2 v_UV;
  uniform vec4 u_FragColor;
  uniform sampler2D u_Sampler0;
  uniform sampler2D u_Sampler1;
  uniform int u_whichTexture;
  void main() {
    if (u_whichTexture == -3) {
      gl_FragColor = texture2D(u_Sampler1, v_UV); // use texture1 (u_Sampler1 AKA floor plane)
    } else if (u_whichTexture == -2) { // use color
      gl_FragColor = u_FragColor;
    } else if (u_whichTexture == -1) { // use UV debug color
      gl_FragColor = vec4(v_UV, 1.0, 1.0); 
    } else if (u_whichTexture == 0) { // use texture0
      gl_FragColor = texture2D(u_Sampler0, v_UV);
    } else { // error, put redish
      gl_FragColor = vec4(1, 0.2, 0.2, 1);
    }
  }`

// Global variables
let canvas;
let gl;
let a_Position;
let a_UV;
let u_FragColor;
let u_Size;
let u_ModelMatrix;
let u_ProjectionMatrix;
let u_ViewMatrix;
let u_GlobalRotateMatrix;
let u_Sampler0;
let u_whichTexture;

function setupWebGL() {
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  //gl = getWebGLContext(canvas);
  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true });
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  gl.enable(gl.DEPTH_TEST);
}

function connectVariablesToGLSL() {
  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  a_UV = gl.getAttribLocation(gl.program, 'a_UV');
  if (a_UV < 0) {
    console.log('Failed to get the storage location of a_UV');
    return;
  }

  // Get the storage location of u_whichTexture
  u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');
  if (!u_whichTexture) {
    console.log('Failed to get the storage location of u_whichTexture');
    return;
  }

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  // Get the storage location of u_Size
  u_Size = gl.getUniformLocation(gl.program, 'u_Size');
  if (!u_Size) {
    console.log('Failed to get the storage location of u_Size');
    return;
  }

  // Get the storage location of u_ModelMatrix
  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!u_ModelMatrix) {
    console.log('Failed to get the storage location of u_ModelMatrix');
    return;
  }

  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
  if (!u_GlobalRotateMatrix) {
    console.log('Failed to get the storage location of u_GlobalRotateMatrix');
    return;
  }

  u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
  if (!u_ViewMatrix) {
    console.log('Failed to get the storage location of u_ViewMatrix');
    return;
  }

  u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
  if (!u_ProjectionMatrix) {
    console.log('Failed to get the storage location of u_ProjectionMatrix');
    return;
  }

  // get the storage location of u_Sampler0
  u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
  if (!u_Sampler0) {
    console.log('Failed to get the storage location of u_Sampler0');
    return false;
  }

  // get the storage location of u_Sampler1
  u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');
  if (!u_Sampler1) {
    console.log('Failed to get the storage location of u_Sampler1');
    return false;
  }

  
}

// Constants
const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;

// Globals related to UI elements
let g_selectedColor = [1.0, 1.0, 1.0, 1.0];
let g_selectedSize = 5.0;
let g_selectedType = POINT;
let g_selectedSegments = 10.0;
let g_globalAngle = 0;
let g_globalAngleY = 0;
let g_FrontLeftLegAngle = 0;
let g_frontLeftLegAnimation = false;
let g_FrontLeftLegPawAngle = 0;
let g_frontLeftLegPawAnimation = false;

// Set up actions for the HTML UI elements
function addActionsForHtmlUI() {
  // Awesomeness: draw a pattern button event
  /*document.getElementById('patternSizeSlide').addEventListener('mouseup', function() { patSize = this.value; });
  document.getElementById('patternNumSlide').addEventListener('mouseup', function() { numInc = parseFloat(this.value); });
  document.getElementById('patternButton').onclick = function() { drawAPattern(); };*/

  // Button events (shape type)
  /*document.getElementById('green').onclick = function() { g_selectedColor = [0.0, 1.0, 0.0, 1.0] };
  document.getElementById('red').onclick = function() { g_selectedColor = [1.0, 0.0, 0.0, 1.0] };
  document.getElementById('clearButton').onclick = function() { g_shapesList = []; renderAllShapes(); };

  document.getElementById("pointButton").onclick = function() { g_selectedType = POINT; };
  document.getElementById("triButton").onclick = function() { g_selectedType = TRIANGLE; };
  document.getElementById("circleButton").onclick = function() { g_selectedType = CIRCLE; };

  // Slider events
  document.getElementById('redSlide').addEventListener('mouseup', function() { g_selectedColor[0] = this.value / 100; });
  document.getElementById('greenSlide').addEventListener('mouseup', function() { g_selectedColor[1] = this.value / 100; });*/
  document.getElementById('frontLeftLegSlide').addEventListener('mousemove', function() { g_FrontLeftLegAngle = this.value; renderScene(); });
  document.getElementById('animationFrontLeftLegOnButton').onclick = function() {g_frontLeftLegAnimation = true; };
  document.getElementById('animationFrontLeftLegOffButton').onclick = function() {g_frontLeftLegAnimation = false; };

  document.getElementById('frontLeftLegPawSlide').addEventListener('mousemove', function() { g_FrontLeftLegPawAngle = this.value; renderScene(); });
  document.getElementById('animationFrontLeftLegPawOnButton').onclick = function() {g_frontLeftLegPawAnimation = true; };
  document.getElementById('animationFrontLeftLegPawOffButton').onclick = function() {g_frontLeftLegPawAnimation = false; };

  // Size slider events
  //document.getElementById('sizeSlide').addEventListener('mouseup', function() { g_selectedSize = this.value; });

  document.getElementById('angleSlideX').addEventListener('mousemove', function() { g_globalAngle = this.value; renderScene(); });

  document.getElementById('angleSlideY').addEventListener('mousemove', function() { g_globalAngleY = this.value; renderScene(); });

  // Circle Segment slider events
  //document.getElementById('segmentSlide').addEventListener('mouseup', function() { g_selectedSegments = this.value; });
}

function initTextures() {

  // create the image object
  var image = new Image();
  if (!image) {
    console.log('Failed to create the image object');
    return false;
  }

  // register the event handler to be called on loading an image
  image.onload = function() { sendImageToTEXTURE0(image); };
  // tell the browser to load image
  image.src = 'sky.jpg';

  var image2 = new Image();
  if (!image2) {
    console.log('Failed to create the image2 object');
    return false;
  }
  image2.onload = function() { sendImageToTEXTURE(image2, u_Sampler1) };
  image.src = 'uvgrid.jpg';

  return true;
}

function sendImageToTEXTURE0(image) {
  // create a texture object
  var texture = gl.createTexture();
  if (!texture) {
    console.log('Failed to create the texture object');
    return false;
  }
  
  // flip the image's y axis
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);

  // enable texture unit0
  gl.activeTexture(gl.TEXTURE0);

  // bind the texture object to the target
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // set the texture parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

  // set the texture image
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);


  // set the texture unit 0 to the sampler
  gl.uniform1i(u_Sampler0, 0);

  console.log('finished loadTexture');

}

function sendImageToTEXTURE(image, given_texture) {
  // create a texture object
  var texture = gl.createTexture();
  if (!texture) {
    console.log('Failed to create the texture object');
    return false;
  }
  
  // flip the image's y axis
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);

  // enable texture unit0
  gl.activeTexture(gl.TEXTURE0);

  // bind the texture object to the target
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // set the texture parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

  // set the texture image
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);


  // set the texture unit 0 to the sampler
  gl.uniform1i(given_texture, 0);

  console.log('finished loadTexture');

}

function main() {
  // Set up canvas and gl variables
  setupWebGL();

  // Set up GLSL shader programs and connect GLSL variables
  connectVariablesToGLSL();

  // Set up actions for the HTML UI elements
  addActionsForHtmlUI();


  document.onkeydown = keydown;

  // Register function (event handler) to be called on a mouse press
  /*canvas.onmousedown = click;

  canvas.onmousemove = function(ev) { if (ev.buttons == 1) { click(ev) } };*/

  initTextures();


  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Clear <canvas>
  //renderScene();

  requestAnimationFrame(tick);

}

var g_startTime = performance.now()/1000.0;
var g_seconds = performance.now()/1000.0 - g_startTime;

// Called by browser repeatedly whenever it's time
function tick() {
  // Save the current time
  g_seconds = performance.now() / 1000.0 - g_startTime;
  //console.log(g_seconds);

  // Update Animation Angles
  updateAnimationAngles();

  // Draw everything
  renderScene();

  // Tell the browser to update again when it has time
  requestAnimationFrame(tick);


}

function updateAnimationAngles() {
  if (g_frontLeftLegAnimation) {
    g_FrontLeftLegAngle = (45 * Math.sin(g_seconds));
  }

  if (g_frontLeftLegPawAnimation) {
    g_FrontLeftLegPawAngle = (45 * Math.sin(3 * g_seconds));
  }
}

function convertCoordinatesEventToGL(ev) {
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

  return([x, y]);
}

/*var g_eye = [0,0.3,-2];
var g_at = [0,0,0];
var g_up = [0,1,0];*/
var g_camera = new Camera();

function keydown(ev) {
  if (ev.keyCode == 87){ // letter w (forward)
    // forward
    
  } else if (ev.keyCode == 83) { // letter s (backwards)
    // backwards
  } else if (ev.keyCode == 68) { // letter d (right)
    // right
    //g_eye[0] -= 0.2;
    g_camera.eye.elements[0] -= 0.2;
  } else if (ev.keyCode == 65) { // letter a (left)
    // left
    // swap from sub to addition on both left and right if not working as intended
    //g_eye[0] += 0.2;
    g_camera.eye.elements[0] += 0.2;
  }

  renderScene();
  console.log(ev.keyCode);
  //console.log('test: ' + g_camera.eye.elements[0]);
}


function renderScene() {

  // Check the time at the start of this function
  var startTime = performance.now();

  var projMat = new Matrix4();
  projMat.setPerspective(60, canvas.width/canvas.height, 0.1, 100);
  gl.uniformMatrix4fv(u_ProjectionMatrix, false, projMat.elements);

  var viewMat = new Matrix4();
  viewMat.setLookAt(g_camera.eye.elements[0],g_camera.eye.elements[1],g_camera.eye.elements[2],   g_camera.at.elements[0],g_camera.at.elements[1],g_camera.at.elements[2],   g_camera.up.elements[0],g_camera.up.elements[1],g_camera.up.elements[2]); // (eye, at, up)
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMat.elements);

  // Pass the matrix to u_ModelMatrix attribute
  var globalRotMat = new Matrix4().rotate(g_globalAngle, 0, 1, 0);
  //globalRotMat.rotate(g_globalAngle, g_globalAngleY, 0, 0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.clear(gl.COLOR_BUFFER_BIT);

  // Draw the floor
  var body = new Cube();
  body.color = [1.0, 0.0, 0.0, 1.0];
  body.textureNum = -3;
  body.matrix.translate(0.0, -0.75, 0.0);
  body.matrix.scale(10, 0, 10);
  body.matrix.translate(-0.5, 0, -0.5);
  body.render();



  // Draw the animal
  var matr = new Matrix4();

    // Draw a test triangle
    //drawTriangle3D( [-1.0,0.0,0.0,  -0.5,-1.0,0.0,  0.0,0.0,0.0]);

    // Draw the body cube
    /*var body = new Cube();
    body.color = [1.0,0.0,0.0,1.0];
    body.matrix.setTranslate(-0.25, -0.75, 0.0);
    body.matrix.rotate(-5,1,0,0);
    body.matrix.scale(0.5, 0.3, 0.5);
    body.render();

    // Draw a left arm
    var leftArm = new Cube();
    leftArm.color = [1.0, 1.0, 0.0, 1.0];
    leftArm.matrix.setTranslate(0, -0.5, 0.0);
    leftArm.matrix.rotate(-5, 1.0, 0.0, 0.0);
    leftArm.matrix.rotate(-g_yellowAngle, 0,0,1);
    leftArm.matrix.scale(0.25, 0.7, 0.5);
    leftArm.matrix.translate(-0.5,0,0);
    leftArm.render();

    // test box
    var box = new Cube();
    box.color = [1,0,1,1];
    box.matrix.setTranslate(-0.1,0.1,0.0);
    box.matrix.rotate(-30,1,0,0);
    box.matrix.scale(0.2,0.4,0.2);
    box.render();*/

    // Draw torso
    matr.setIdentity();
    matr.translate(-0.2, -0.2, -0.2);
    matr.scale(0.25, 0.35, 0.9);

    drawCube(matr, [0.2, 0.2, 0.2, 1]);



    // Draw head

    matr.setIdentity();
    matr.translate(-0.25, 0, -0.55);
    matr.scale(0.35, 0.3, 0.35);

    drawCube(matr, [0.2, 0.2, 0.2, 1]);

    // Draw mouth

    matr.setIdentity();
    matr.translate(-0.2, 0, -0.65);
    matr.scale(0.25, 0.15, 0.1);

    drawCube(matr, [0.9, 0.9, 0.9, 1]);

    // Draw left ear

    matr.setIdentity();
    matr.translate(-0.23, 0.3, -0.35);
    matr.scale(0.08, 0.08, 0.15);

    drawCube(matr, [0.2, 0.2, 0.2, 1]);

    // Draw right ear

    matr.setIdentity();
    matr.translate(-0.02, 0.3, -0.35);
    matr.scale(0.08, 0.08, 0.15);

    drawCube(matr, [0.2, 0.2, 0.2, 1]);


    // Draw tail section 1

    matr.setIdentity();
    matr.translate(-0.1, 0.118, 0.65)
    matr.rotate(45, 1, 0, 0);
    matr.scale(0.05, 0.05, 0.4);

    drawCube(matr, [0.2, 0.2, 0.2, 1]);

    // Draw tail section 2

    matr.setIdentity();
    matr.translate(-0.1, -0.16, 0.95)
    //matr.rotate(45, 1, 0, 0);
    matr.scale(0.05, 0.05, 0.4);

    drawCube(matr, [0.2, 0.2, 0.2, 1]);



    // Draw front left leg
    matr.setIdentity();

    matr.rotate(g_FrontLeftLegAngle, 1, 0, 0);
    var leftLegCoordsMat = new Matrix4(matr);

    matr.translate(0, -0.435, -0.12);
    matr.scale(0.1, 0.6, 0.1);
    
    drawCube(matr, [0.2, 0.2, 0.2, 1]);

    // Draw front left leg paw
    matr = leftLegCoordsMat;
    matr.rotate(g_FrontLeftLegPawAngle, 1, 0, 0);
    matr.translate(0, -0.19, 0.15);
    matr.rotate(30, 1, 0, 0);
    matr.translate(-0.012, -0.45, -0.12);
    matr.scale(0.12, 0.15, 0.1);

    drawCube(matr, [0.9, 0.9, 0.9, 1]);



    // Draw front right leg
    matr.setIdentity();
    matr.translate(-0.25, -0.435, -0.12);
    matr.scale(0.1, 0.6, 0.1);
    
    drawCube(matr, [0.2, 0.2, 0.2, 1]);

    // Draw front right leg paw
    matr.setIdentity();
    matr.translate(-0.25, -0.19, 0.15);
    matr.rotate(30, 1, 0, 0);
    matr.translate(-0.012, -0.45, -0.12);
    matr.scale(0.12, 0.15, 0.1);

    drawCube(matr, [0.9, 0.9, 0.9, 1]);



    // Draw back left leg
    matr.setIdentity();
    matr.translate(0, -0.335, 0.52);
    matr.scale(0.1, 0.25, 0.1);
    
    drawCube(matr, [0.2, 0.2, 0.2, 1]);

    // Draw back left lower leg 
    matr.setIdentity();
    matr.translate(0.007, 0.02, 0.06);
    matr.rotate(15, 1, 0, 0);
    matr.translate(-0.012, -0.45, 0.52);
    matr.scale(0.11, 0.35, 0.1);

    drawCube(matr, [0.9, 0.9, 0.9, 1]);

    // Draw back left leg paw
    matr.setIdentity();
    matr.translate(0, -0.53, 0.85);
    matr.rotate(80, 1, 0, 0);
    matr.translate(-0.012, -0.45, -0.12);
    matr.scale(0.12, 0.15, 0.1);

    drawCube(matr, [0.9, 0.9, 0.9, 1]);



    // Draw back right leg
    matr.setIdentity();
    matr.translate(-0.25, -0.335, 0.52);
    matr.scale(0.1, 0.25, 0.1);
    
    drawCube(matr, [0.2, 0.2, 0.2, 1]);

    // Draw back right lower leg 
    matr.setIdentity();
    matr.translate(-0.243, 0.02, 0.06);
    matr.rotate(15, 1, 0, 0);
    matr.translate(-0.012, -0.45, 0.52);
    matr.scale(0.11, 0.35, 0.1);

    drawCube(matr, [0.9, 0.9, 0.9, 1]);

    // Draw back right leg paw
    matr.setIdentity();
    matr.translate(-0.25, -0.53, 0.85);
    matr.rotate(80, 1, 0, 0);
    matr.translate(-0.012, -0.45, -0.12);
    matr.scale(0.12, 0.15, 0.1);

    drawCube(matr, [0.9, 0.9, 0.9, 1]);



  // Check the time at the end of the function, and show on web page
  var duration = performance.now() - startTime;
  sendTextToHTML(" ms: " + Math.floor(duration) + " fps: " + Math.floor(10000/duration)/10, "numdot");
}

function sendTextToHTML(text, htmlID) {
  var htmlElm = document.getElementById(htmlID);
  if (!htmlElm) {
    console.log("Failed to get " + htmlID + " from HTML");
    return;
  }
  htmlElm.innerHTML = text;
}

function drawCube(matrix, color) {
  var newCube = new Cube();
  newCube.color = color;
  newCube.matrix = matrix;
  newCube.render();
}

var g_shapesList = [];

/*var g_points = [];  // The array for the position of a mouse press
var g_colors = [];  // The array to store the color of a point
var g_sizes = [];*/

function click(ev) {
  // Extract the event click and return it in WebGL coordinates
  [x, y] = convertCoordinatesEventToGL(ev);
  //console.log('x: ' + x, ' y: ' + y);

  // Create and store the new point
  let point;
  if (g_selectedType == POINT) {
    point = new Point();
  } else if (g_selectedType == TRIANGLE) {
    point = new Triangle();
  } else {
    point = new Circle();
    point.segments = g_selectedSegments;
  }
  point.position = [x, y];
  point.color = g_selectedColor.slice();
  point.size = g_selectedSize;
  g_shapesList.push(point);

  // Draw every shape that is supposed to be in the canvas
  renderScene();
  
}

function drawRectangleWithTriangles(widthStart, widthEnd, heightStart, heightEnd) {
  drawTriangle([widthStart, heightStart, widthEnd, heightEnd, widthEnd, heightStart]);
  drawTriangle([widthStart, heightStart, widthStart, heightEnd, widthEnd, heightEnd]);
}
