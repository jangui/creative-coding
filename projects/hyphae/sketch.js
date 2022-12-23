let width;
let height;
let stems;
let newNodes;
let nodeColor;
let wobbleFactor;
let nodeShrinkFactor;
let nodeStartSize;
let branchAttempts;

class Stem {
  nodes;
  id;

  constructor(id) {
    this.id = id;
    let startDirection = [random(), random()];
    let x = int(random(width/4, 3*width/4));
    let y = int(random(height/4, 3*height/4));
    let startNode = new Node(x, y, startDirection, nodeStartSize)
    this.nodes = [startNode];
    newNodes.push(startNode);
  }

  // add a new node to stem
  grow() {
    let lastNode = this.nodes[this.nodes.length-1];

    // new node direction
    let updateX = random(-wobbleFactor, wobbleFactor);
    let updateY = random(-wobbleFactor, wobbleFactor);
    let direction = [lastNode.direction[0]+updateX, lastNode.direction[1]+updateY];

    // new node position
    let velocity = [0,0];
    let magnitude = sqrt(direction[0]**2 + direction[1]**2);
    if (magnitude == 0) { return; }
    velocity[0] = 2 * direction[0] / magnitude;
    velocity[1] = 2 * direction[1]/ magnitude;
    let position = [lastNode.x + velocity[0], lastNode.y + velocity[1]];

    // create new node
    let size = lastNode.size - nodeShrinkFactor;
    let newNode = new Node(position[0], position[1], direction, size);
    let collision = this.checkCollisions(newNode);
    if (!collision) {
      newNodes.push(newNode);
      this.nodes.push(newNode);
    }
  }

  // add a new branch
  branch() {

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
    for (let i = 0; i < stems.length; i++) {
      let tailNodes = 0
      if (stems[i].id == this.id) { tailNodes = 12; }
      let stem = stems[i];
      for (let j = 0; j < stem.nodes.length - tailNodes; j++) {
        let otherNode = stem.nodes[j];
        let collision = ((otherNode.x-node.x)**2 + (otherNode.y-node.y)**2) < ((otherNode.size/2 + node.size)**2);
        if (collision) {
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

  constructor(x, y, direction, size) {
    this.x = x;
    this.y = y;
    this.color = nodeColor;
    this.size = size;
    this.direction = direction;
  }

  draw() {
    stroke(this.color);
    strokeWeight(this.size);
    point(this.x, this.y);
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
  nodeColor = 'purple';
  newNodes = [];
  branchAttemps = 10;

  let stemCount = 6;
  stems = [];
  for (let i = 0; i < stemCount; i++) {
    stems.push(new Stem(i));
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

  stems.forEach( stem => {
    stem.grow();
  });

  for (let i = 0; i < branchAttempts; ++i) {
    let stemIndex = int(random(0, stems.length));
    stems[stemIndex].branch();
  }
}
