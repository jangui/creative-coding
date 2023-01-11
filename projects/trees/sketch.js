let width;
let height;
let nodes;
let newNodes;

class Node {
  position;
  velocity;

  constructor(size, position, velocity) {
    this.size = size;
    this.position = position;
    this.velocity = velocity;
  }

  draw() {
    colorMode(HSL, 100);
    stroke(80, 60, 80);
    strokeWeight(1);

    // draw left from center given current velocity
    let drawingVector = createVector(this.velocity.y,-this.velocity.x);
    drawingVector.setMag(this.size/2);
    let drawingPositionLeft = p5.Vector.add(this.position, drawingVector);
    point(drawingPositionLeft.x, drawingPositionLeft.y);
    let shadowProbability = 0.2;
    this.addShadow(drawingVector, shadowProbability);

    // draw right from center given current velocity
    drawingVector.rotate(PI);
    let drawingPositionRight = p5.Vector.add(this.position, drawingVector);
    point(drawingPositionRight.x, drawingPositionRight.y);
    this.addShadow(drawingVector);
    shadowProbability = 0.8;
    this.addShadow(drawingVector, shadowProbability);

  }

  addShadow(drawingVector, shadowProbability) {
    for (let i = 0; i < 10; ++i) {
      if (random() < shadowProbability) {
        let shadowPoint = this.getShadowPoint(drawingVector);
        point(shadowPoint.x, shadowPoint.y);
      }
    }
  }

  getShadowPoint(drawingVector) {
    let shadowPointVector = drawingVector.copy();
    let randNum = random(0,2);
    let randNumShifted = Math.log(randNum*500+1)/8;
    let magnitude = map(randNumShifted,  0, 0.864, 0, this.size/2);
    shadowPointVector.setMag(magnitude);
    return p5.Vector.add(this.position, shadowPointVector);
  }

  grow() {
    let newPosition = p5.Vector.add(this.position, this.velocity);
    let newSize = this.size-0.025;
    if (this.checkCollisions(newPosition)) {return;}
    let wobbleFactor = radians(3);
    let rotationRadians = random(-wobbleFactor, wobbleFactor);
    let newVelocity = p5.Vector.rotate(this.velocity, rotationRadians);
    return new Node(newSize, newPosition, newVelocity);
  }

  checkCollisions(position) {
   if (position.x > width || position.x < 0) {
     return true;
   }
   if (position.y > height || position.y < 0) {
     return true;
   }
   return false;
  }
}

function setup() {
  width = 400;
  height = 400;
  createCanvas(width, height);
  nodes = [];
  newNodes = [];
  let nodeCount = 1;
  for (let i = 0; i < nodeCount; ++i) {
    let position = createVector(width/2, height-5);
    let velocity = createVector(0,-0.5);
    let size = 30;
    let newNode = new Node(size, position, velocity);
    nodes.push(newNode);
    newNodes.push(newNode);
  }
}

function draw() {
  let grownNodes = [];
  newNodes.forEach(node => {
    node.draw();
    let grownNode = node.grow();
    if (grownNode) { grownNodes.push(node.grow()); }
  });
  newNodes = grownNodes;
}

function mousePressed() {
  noLoop();
}