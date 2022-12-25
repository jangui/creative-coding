let width;
let height;
let hyphae;
let wobbleFactor;
let nodeShrinkFactor;
let nodeStartSize;
let branchAttempts;
let newBranchShrinkFactor;
let colorChangeFactor;
let minNodeSize;

class Hypha {
  newNodes;
  branches;

  constructor(radius, center, startingBranchCount, color) {
    this.radius = radius;
    this.center = center;
    this.boundary = [radius, center];
    this.branches = [];
    this.newNodes = [];
    this.initializeBranches(startingBranchCount, color);
  }

  initializeBranches(startingBranchCount, color) {
  // create initial branches
  for (let i = 0; i < startingBranchCount; i++) {
    let velocity = createVector(random(-1, 1), random(-1, 1));
    velocity.setMag(nodeStartSize);
    let x = int(random(this.center.x-this.radius, this.center.x+this.radius));
    let y = int(random(this.center.y-this.radius, this.center.y+this.radius));
    let position = createVector(x, y);
    let startNode = new Node(position, velocity, nodeStartSize, color)
    this.branches.push(new Branch(i, startNode, this.newNodes));
  }
 }

  draw() {
    this.newNodes.forEach(node => {
      node.draw();
    });
    this.newNodes = [];
  }

  grow() {
    // grow each branch
    this.branches.forEach(branch => {
      let newNode = branch.grow(this.boundary, this.branches);
      if (newNode) { this.newNodes.push(newNode); }
    });

    // grow new branches
    for (let i = 0; i < branchAttempts; ++i) {
      let branchIndex = int(random(0, this.branches.length));
      let newBranch = this.branches[branchIndex].branch(this.boundary, this.branches);
      if (newBranch) {
        this.branches.push(newBranch);
        this.newNodes.push(newBranch.nodes[0]);
      }
    }
  }
}

class Branch {
  id;
  nodes;

  constructor(id, startNode) {
    this.id = id;
    this.nodes = [startNode];
  }

  grow(boundary, branches) {
    // get tail node
    let lastNode = this.nodes[this.nodes.length-1];
    if (lastNode.size <= minNodeSize) { return; }

    // create new node
    let newNode = this.growNode(lastNode, false);
    if (!newNode) { return; }

    // check collisions
    if (this.checkCollisions(newNode, boundary, branches)) { return; }

    // add node
    this.nodes.push(newNode);
    return newNode;
  }

  growNode(parentNode, branchNode) {
    // modify direction
    let rotationRadians = random(-wobbleFactor, wobbleFactor);
    let newVelocity = p5.Vector.rotate(parentNode.velocity, rotationRadians);

    // set new branch velocity perpendicular-ish from old branch
    if (branchNode) {
      let negativeXVelocity = -newVelocity.x;
      newVelocity.x = newVelocity.y;
      newVelocity.y = negativeXVelocity;
      newVelocity = p5.Vector.mult(newVelocity, random([-1,1]));
    }

    // update velocity magnitude
    newVelocity.setMag(parentNode.size);

    // set position, size & color
    let newPosition = p5.Vector.add(parentNode.position, newVelocity);
    let size = parentNode.size - nodeShrinkFactor;
    let color = [parentNode.color[0], parentNode.color[1], parentNode.color[2]];
    if (color[2] < 88) { color[2] += colorChangeFactor; }
    return new Node(newPosition, newVelocity, size, color);
  }

  // create a new branch
  branch(boundary, branches) {
    if (branches.length >= 2000) { return; }
    // select random node
    let node = random(this.nodes);
    if (node.size <= minNodeSize) { return; }

    // create new node
    let newNode = this.growNode(node, true, true);
    if (!newNode) { return; }

    // check collisions
    let collision = this.checkCollisions(newNode, boundary, true);
    if (collision) { return; }

    // modify new branch size
    newNode.size = node.size - newBranchShrinkFactor;

    // create new branch
    let id = branches[branches.length-1].id + 1;
    return new Branch(id, newNode);
}

// returns true if collision
  checkCollisions(node, boundary, branches) {
    // check boundary collisions
    if (this.checkBoundaryCollisions(node, boundary)) { return true; }

    // check collisions against nodes from other branches
    if (this.checkBranchCollisions(node, branches)) { return true; }

    return false;
  }

  checkBranchCollisions(node, branches) {
    for (let i = 0; i < branches.length; i++) {
      let branch = branches[i];
      for (let j = 0; j < branch.nodes.length; j++) {
        let otherNode = branch.nodes[j];
        // check if node colliding
        if (node.isColliding(otherNode)) {return true;}
        /*
        // check if will collide given same trajectory
        let futureTrajectory = new Node(node.position, node.velocity, node.size, node.color);
        futureTrajectory.position = p5.Vector.add(futureTrajectory.position, futureTrajectory.velocity);
        if (futureTrajectory.isColliding(otherNode)) {return true;}
        */

      }
    }
  }

  checkBoundaryCollisions(node, boundary) {
    let radius = boundary[0];
    let center = boundary[1];

    let distance = (node.position.x - center.x)**2 + (node.position.y - center.y)**2;
    if (distance >= radius**2) { return true; }

    /*
    if (node.position.x >= width - node.size || node.position.x <= node.size) {
      return true;
    }
    if (node.position.y >= height - node.size || node.position.y <= node.size) {
      return true;
    }
    */
  }
}

class Node {
  position;
  velocity;
  size;
  color;

  constructor(position, velocity, size, color) {
    this.position = position;
    this.velocity = velocity;
    this.size = size;
    this.color = color;
  }

  draw() {
    colorMode(HSL, 100);
    stroke(this.color[0], this.color[1], this.color[2]);
    strokeWeight(this.size*1.75);
    point(this.position.x, this.position.y);
  }

  isColliding(otherNode) {
    let radiusDifference = (otherNode.size/2 + this.size/2) ** 2;
    let sqrtDistance = (otherNode.position.x-this.position.x) ** 2 + (otherNode.position.y-this.position.y) ** 2;
    return sqrtDistance < radiusDifference;
  }
}

// p5 setup function
function setup() {

  width = 1300;
  height = 730;
  createCanvas(width, height);

  wobbleFactor = radians(15);
  nodeShrinkFactor = 0.035;
  newBranchShrinkFactor = 0.2;
  colorChangeFactor = 0.001;
  nodeStartSize = 2.75;
  minNodeSize = 0.1;
  branchAttempts = 1;
  hyphae = [];

  let radius = 100;
  let spacingX = 15;
  let spacingY = 60;
  let startingBranchCount = 30;
  let rows = 3;
  let cols = 6;
  for (let i = 0; i < cols; ++i) {
    for (let j = 0; j < rows; ++j) {
      let x = i*(radius*2+spacingX) + radius;
      let y = j*(radius*2+spacingY) + radius;
      if (j===0) { y+=10}
      if (i===0) { x+=10}
      let center = createVector(x, y);
      let hue = int(map(i, 0, cols, 10, 90));
      let saturation = int(map(j, 0, rows, 20, 90));
      let color = [hue, saturation, 70];
      let hypha = new Hypha(radius, center, startingBranchCount, color);
      hyphae.push(hypha);
    }
  }


  // draw background
  background(255);
}

// p5 draw function
function draw() {
  hyphae.forEach(hypha => {
    hypha.draw();
    hypha.grow();
  })
}

function mousePressed() {
  noLoop();
  hyphae.forEach(hypha => {
    console.log(hypha.branches.length)
  })
}