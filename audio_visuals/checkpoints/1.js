const canvasSketch = require('canvas-sketch');
const random = require('canvas-sketch-util/random');
const math = require('canvas-sketch-util/math');
const TweakPane = require('tweakpane');

const settings = {
  dimensions: [ 1080, 1080 ],
  animate: true,
};

const params = {
  curves: 1,
  radius: 600,
  minModifier: 0.8,
  maxModifier: 1.2
};

class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

class Curvy {
  constructor(startPoint, radius, color, frame) {
    this.startPoint = startPoint;
    this.radius = radius
    this.color = color;
    this.endPoint = new Point(this.startPoint.x - this.radius * 2, this.startPoint.y);
  }

  draw(context, frame) {
    context.save();
    context.strokeStyle = this.color;

    // move to start point
    context.beginPath();
    context.moveTo(this.startPoint.x, this.startPoint.y);

    // draw first curve
    let controlX = this.startPoint.x
    let controlY = this.startPoint.y - this.radius
    let controlPoint = new Point(controlX, controlY)
    context.quadraticCurveTo(controlPoint.x, controlPoint.y, this.endPoint.x, this.endPoint.y)

    // draw seccond curve
    context.moveTo(this.endPoint.x, this.endPoint.y);
    controlX = this.endPoint.x
    controlY = this.endPoint.y + this.radius
    controlPoint = new Point(controlX, controlY)
    context.quadraticCurveTo(controlPoint.x, controlPoint.y, this.startPoint.x, this.startPoint.y)

    // fill lines
    context.stroke();

    context.restore();
  }
}

const sketch = ({context, width, height, frame}) => {
  return ({context, width, height, frame}) => {
    // clear context
    context.fillColor = 'black';
    context.fillRect(0, 0, width, height);

    for (let i = 0; i < params.curves; ++i) {
      // get random radius
      let noise = random.noise2D(frame, i, 0.01)
      let radius  = math.mapRange(noise, -1, 1, 0, params.radius);

      // create curve
      let startPoint = new Point((width / 2) + radius, height / 2)
      let c = new Curvy(startPoint, radius, 'blue', frame)
      c.draw(context, frame)
    }
  }
};

const createPane = () => {
  const pane = new TweakPane.Pane();
  let folder = pane.addFolder({title: 'Settings'});
  folder.addInput(params, 'curves', {min: 0, max: 50, step: 1});
  folder.addInput(params, 'radius', {min: 0, max: 1000, step: 1});
  folder.addInput(params, 'minModifier', {min: 0, max: 1, step: 0.01});
  folder.addInput(params, 'maxModifier', {min: 1, max: 3, step: 0.01});
};

createPane();
canvasSketch(sketch, settings);
