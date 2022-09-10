/*
 * Trees are made of branches.
 * Trees can have different maximum branch heights
 * Trees can have different minimum leave spawning heights.
 * They have a starting point from which they grow.
 * They have a starting width and a starting branch length that decrease with each new branch.
 *
 * Branches have a width and a length.
 * Branches can have child branches coming out of them.
 * Each new child branch has a thickness less than their parent branch.
 *
 * Branches can have leaves.
 * There are different types of leaves.
 * For the most part they symetrical along their vertical axis.
 * They might have a thickness length etc as well.

*/


const canvasSketch = require('canvas-sketch');
const random = require('canvas-sketch-util/random');
const math = require('canvas-sketch-util/math');
const TweakPane = require('tweakpane');

const settings = {
  dimensions: [ 1080, 1080 ],
  animate: false,
};

const params = {
  treeHeight: 30,
  startingBranchLength: 30,
  branchLengthDecrease: 0.9,
  startingBranchWidth: 5,
  branchWidthDecrease: 0.9,
  maxBranchChildren: 3,
  branchingFactor: 0.5
};

class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

class Branch {
  constructor(startPoint, length, width, curveMax, branchHeight, treeHeight, minleafHeight, maxBranchChildren, branchingFactor, color) {
    this.startPoint = startPoint;
    this.lengthMax = lengthMax;
    this.width = width;
    this.curveMax = curveMax;
    this.branchHeight = branchHeight; // current branch height
    this.treeHeight = treeHeight;
    this.children = [];
    this.maxBranchChildren = maxBranchChildren;
    this.branchingFactor = branchingFactor;
    this.leafHeight = leafHeight;  // minimum branching height where leaves start growing
    this.color = color;
    this.makeChildren();
  }

  draw(context) {
    context.save();
    context.strokeStyle = this.color;

    // move to start point
    context.beginPath();
    context.moveTo(this.startPoint.x, this.startPoint.y);

    // draw line between each point
    this.points.forEach( (point) => {
      context.lineTo(point.x, point.y);
    });

    // fill lines
    context.stroke();

    // restore context
    context.restore();

    // draw children
    this.drawChildren(context);
  }

  drawChildren(context) {
    this.children.forEach( child => {
      child.draw(context);
    });
  }

  makeChildren(context) {
    if (this.branchHeight >= this.treeHeight) { return }

    let numChildren = 1 # random from 0 to this.maxBranchChildren;

    let childrenStartPoint = new Point(this.startPoing.x, this.startPoint.y + startingBranchLength);

    for (let i = 0; i < numChildren; ++i) {
      let branchLength = this.startingBranchLength * 0.9
      let branchWidth = this.startingBranchWidth * 0.9

      const child = new Branch(childrenStartPoint, branchLength, branchWidth, 0, 0, treeHeight, 3, 1, 'black', minLeafHeight);
      this.children.push(child);
    }


  }
}

class Tree {
  constructor(startPoint, startingBranchLength, startingBranchWidth, treeHeight, maxBranchChildren, branchingFactor, minLeafHeight, color) {
    this.startPoint = startPoint;
    this.color = color;
    this.branchHeight = branchHeight;
    this.trunk = new Branch(startPoint, startingBranchLength, startingBranchWidth, 0, 0, treeHeight, 3, 1, 'black', minLeafHeight);
  }

  draw(context) {
    this.trunk.draw(context);
  }
}

const sketch = ({context, width, height, frame}) => {
  return ({context, width, height, frame}) => {
    // clear context
    context.fillColor = 'black';
    context.fillRect(0, 0, width, height);

    startPoint = new Point(width/2, height/2);
    let tree = new Tree(startPoint, params.startingBranchLenght, params.startingBranchWidth, params.treeHeight, params.maxBranchChildren, params.branchingFactor, params.minLeafHeight, color);
    tree.draw(context);
};

const createPane = () => {
  const pane = new TweakPane.Pane();
  let folder = pane.addFolder({title: 'Tree'});
  folder.addInput(params, 'treeHeight', {min: 0, max: 50, step: 1});

  folder.addInput(params, 'startingBranchLength', {min: 0, max: 50, step: 1});
  folder.addInput(params, 'branchLengthDecrease', {min: 0, max: 1, step: 0.01});

  folder.addInput(params, 'startingBranchWidth', {min: 0, max: 50, step: 1});
  folder.addInput(params, 'branchWidthDecrease', {min: 0, max: 1, step: 0.01});

  folder.addInput(params, 'maxBranchChildren', {min: 0, max: 10, step: 1});
  folder.addInput(params, 'branchingFactor', {min: 0, max: 1, step: 0.01});

};

createPane();
canvasSketch(sketch, settings);
