let tree;

class Tree {
  minNodeSize = 1;
  nodeSizeDecrease = 0.035;
  shadowIntensity = 10;
  leftShadowFactor = 0.15;
  rightShadowFactor = 0.8;
  newNodes = [];

  treeWobbleAngle = radians(3);

  branchProbability = 0.0075;
  minBranchAngle = radians(20);
  maxBranchAngle = radians(60);
  minBranchingSizeFactor = 0.3;
  maxBranchingSizeFactor = 0.8;

  constructor(startingSize, position, maxWidth, maxHeight, color, background) {
    this.maxWidth = maxWidth;
    this.maxHeight = maxHeight;
    this.color = color;
    this.background = background;
    let velocity = createVector(0,-0.5); // trees start growing vertically
    this.newNodes.push(new Node(startingSize, position, velocity));


  }

  grow() {
    let grownNodes = []
    this.newNodes.forEach(node => {
      // grow current branch
      let grownNode = this.growNode(node);
      if (grownNode) { grownNodes.push(grownNode); }

      // attempt new branch
      grownNode = this.branch(node);
      if (grownNode) { grownNodes.push(grownNode); }
    });
    this.newNodes = grownNodes;
  }

  growNode(parentNode) {
    if (parentNode.size < this.minNodeSize) { return; }

    // decrease size for new node
    let newSize = parentNode.size - this.nodeSizeDecrease;

    // calc position for new node
    let newPosition = p5.Vector.add(parentNode.position, parentNode.velocity);
    if (this.checkCollisions(newPosition)) { return; }

    // slightly alter new node's direction
    let rotationRadians = random(-this.treeWobbleAngle, this.treeWobbleAngle);
    let newVelocity = p5.Vector.rotate(parentNode.velocity, rotationRadians);

    return new Node(newSize, newPosition, newVelocity);
  }

  branch(parentNode) {
    if (random() > this.branchProbability) { return; }

    // branch size
    let minSize = parentNode.size * this.minBranchingSizeFactor;
    let maxSize = parentNode.size * this.maxBranchingSizeFactor;
    let newSize = random(minSize, maxSize);

    // branch direction
    let posOrNeg = random() < 0.5 ? -1 : 1;
    let rotation = random(this.minBranchAngle, this.maxBranchAngle);
    rotation *= posOrNeg;
    let newVelocity = p5.Vector.rotate(parentNode.velocity, rotation);

    // branch start position
    let perpendicularVelocity = createVector(parentNode.velocity.y,-parentNode.velocity.x);
    perpendicularVelocity.setMag(parentNode.size/4); // move 1/4 parent node's size away from parent's center
    perpendicularVelocity.mult(-posOrNeg);
    let newPosition = p5.Vector.add(parentNode.position, perpendicularVelocity);
    if (this.checkCollisions(newPosition)) { return; }

    return new Node(newSize, newPosition, newVelocity);
  }

  draw() {
    this.newNodes.forEach(node => {
      node.draw(
          this.color,
          this.background,
          this.shadowIntensity,
          this.leftShadowFactor,
          this.rightShadowFactor
      );
    });
  }

  checkCollisions(position) {
    if (position.x > this.maxWidth || position.x < 0) {
      return true;
    } else if (position.y > this.maxHeight || position.y < 0) {
      return true;
    }
    return false;
  }
}

class Node {
  constructor(size, position, velocity) {
    this.size = size;
    this.position = position;
    this.velocity = velocity;
  }

  draw(color, background, shadowIntensity, leftShadowFactor, rightShadowFactor) {
    // a vector perpendicular to current direction is needed to calculate left most
    // and right most points from center
    let perpendicularVelocity = createVector(this.velocity.y,-this.velocity.x);
    perpendicularVelocity.setMag(this.size/2);

    // get left and right most point from center
    let leftPosition = p5.Vector.add(this.position, perpendicularVelocity);
    perpendicularVelocity.rotate(PI);
    let rightPosition = p5.Vector.add(this.position, perpendicularVelocity);

    // draw a line of background to make new nodes appear in foreground
    // a line is needed to cover up the 'shadow' points from other nodes
    stroke(background);
    strokeWeight(1);
    line(leftPosition.x, leftPosition.y, rightPosition.x, rightPosition.y);


    // drawing setup
    stroke(color);
    strokeWeight(1);

    // draw right side
    point(rightPosition.x, rightPosition.y);
    this.addShadow(perpendicularVelocity, shadowIntensity, rightShadowFactor);

    // draw left side
    perpendicularVelocity.rotate(PI);
    point(leftPosition.x, leftPosition.y);
    this.addShadow(perpendicularVelocity, shadowIntensity, leftShadowFactor);
  }

  addShadow(drawingVector, shadowIntensity, shadowProbability) {
    for (let i = 0; i < shadowIntensity; ++i) {
      if (random() < shadowProbability) {
        let shadowPoint = this.getShadowPoint(drawingVector);
        point(shadowPoint.x, shadowPoint.y);
      }
    }
  }

  // generates a random point along the drawing vector
  getShadowPoint(drawingVector) {
    let shadowPointVector = drawingVector.copy();

    // janky math for getting a random distribution that works well
    let randNum = random(0,2);
    let randNumShifted = Math.log(randNum*500+1)/8;
    let magnitude = map(randNumShifted,  0, 0.864, 0, this.size/2);

    shadowPointVector.setMag(magnitude);
    return p5.Vector.add(this.position, shadowPointVector);
  }
}

function setup() {
  screenWidth = 400;
  screenHeight = 300;
  createCanvas(screenWidth, screenHeight);
  let backgroundColor = 'black';
  background(backgroundColor);

  let position = createVector(width/2, height);
  let startingSize = 30;
  let color = 'green';
  tree = new Tree(startingSize, position, screenWidth, screenHeight, color, backgroundColor);
}

function draw() {
  tree.draw();
  tree.grow();
}
