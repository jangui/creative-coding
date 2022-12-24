let width;
let height;
let branches;
let newNodes;
let wobbleFactor;
let nodeShrinkFactor;
let nodeStartSize;
let branchAttempts;
let newBranchDecreaseFactor;

class Branch {
  id;
  nodes;

  constructor(id, startNode) {
    this.nodes = [startNode];
    newNodes.push(startNode);
  }
  grow() {
    let lastNode = this.nodes[this.nodes.length-1];
    let newNode = this.growNode(lastNode);
    if (!this.checkCollisions(newNode)) {
      newNodes.push(newNode);
      this.nodes.push(newNode);
    }
  }

  growNode(node) {
    // new node direction
    let updateX = random(-wobbleFactor, wobbleFactor);
    let updateY = random(-wobbleFactor, wobbleFactor);
    let direction = [node.direction[0]+updateX, node.direction[1]+updateY];

    // new node position
    let velocity = [0,0];
    let magnitude = sqrt(direction[0]**2 + direction[1]**2);
    if (magnitude === 0) { return; }
    velocity[0] = 2 * direction[0] / magnitude;
    velocity[1] = 2 * direction[1]/ magnitude;
    let position = [node.x + velocity[0], node.y + velocity[1]];

    // create new node
    let size = node.size - nodeShrinkFactor;
    let color = node.color;
    color[2] += 0.0025;
    return new Node(position[0], position[1], direction, size, color);
  }

  // create a new branch
  branch() {
    // select random node
    let node = random(this.nodes);

    // create new node
    let newNode = this.growNode(node);

    // check collisions
    let collision = this.checkCollisions(newNode);
    if (!collision) {
      newNodes.push(newNode);
      newNode.size = node.size * newBranchDecreaseFactor;
      // create new branch
      let id = branches[branches.length-1].id + 1;
      let branch = new Branch(id, newNode);
      branches.push(branch);
    }
  }

  // returns true if collision
  checkCollisions(node) {
    // check boundary collisions
    if (node.x >= width - node.size || node.x <= node.size) {
      return true;
    }
    if (node.y >= height - node.size || node.y <= node.size) {
      return true;
    }

    // check collisions against nodes from other stems
    for (let i = 0; i < branches.length; i++) {
      let tailNodes = 0
      if (branches[i].id === this.id) { tailNodes = 12; }
      let branch = branches[i];
      for (let j = 0; j < branch.nodes.length - tailNodes; j++) {
        let otherNode = branch.nodes[j];
        if (node.isColliding(otherNode)) {
          return true;
        }
      }
    }
    return false;
  }
}

class Node {
  x;
  y;
  direction;
  size;
  color;

  constructor(x, y, direction, size, color) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.size = size;
    this.direction = direction;
  }

  draw() {
    colorMode(HSL, 100)
    stroke(this.color[0], this.color[1], this.color[2]);
    strokeWeight(this.size);
    point(this.x, this.y);
  }

  isColliding(otherNode) {
    return ((otherNode.x-this.x)**2 + (otherNode.y-this.y)**2) < ((otherNode.size/2 + this.size)**2);
  }
}

// p5 setup function
function setup() {
  width = 400;
  height = 400;
  createCanvas(width, height);

  wobbleFactor = 5;
  nodeShrinkFactor = 0.01;
  nodeStartSize = 8;
  newNodes = [];
  branchAttempts = 10;
  newBranchDecreaseFactor = 0.8;

  let startingBranchCount = 6;
  branches = [];
  for (let i = 0; i < startingBranchCount; i++) {
    let startDirection = [random(), random()];
    let x = int(random(width/4, 3*width/4));
    let y = int(random(height/4, 3*height/4));
    let color = [int(random(50,60)),60, 70]
    let startNode = new Node(x, y, startDirection, nodeStartSize, color)
    branches.push(new Branch(i, startNode));
  }
  // draw background
  background(220);
}

// p5 draw function
function draw() {
  newNodes.forEach( node => {
    node.draw();
  });
  newNodes = [];

  branches.forEach( branch => {
    branch.grow();
  });

  for (let i = 0; i < branchAttempts; ++i) {
    let branchIndex = int(random(0, branches.length));
    branches[branchIndex].branch();
  }
}
