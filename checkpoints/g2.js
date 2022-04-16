const canvasSketch = require('canvas-sketch');
const random = require('canvas-sketch-util/random');
const math = require('canvas-sketch-util/math');
const TweakPane = require('tweakpane');

const settings = {
  dimensions: [ 1080, 1080 ],
  animate: true,
};

const params = {
  n: 7,
  displacementAmplitude: 20,
  noiseFrequency: 0.01,
};

class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

const getDisplacedMidPoint = (point1, point2, displacementAmplitude, frame) => {
  // get midpoint
  xm  = (point1.x + point2.x) / 2
  ym  = (point1.y + point2.y) / 2

  // displace midpoint
  let noise = random.noise3D(xm, ym, frame, params.noiseFrequency);
  displacement = math.mapRange(noise, -1, 1, -displacementAmplitude, displacementAmplitude);
  ym += displacement;

  return new Point(xm, ym);
}

const addDisplacedMidPoints = (points, displacementAmplitude, frame) => {
  newPoints = []
  points.forEach( (point, ind) => {
    if (ind == points.length-1) { newPoints.push(point); return; }
    nextPoint = points[ind+1];

    midPoint = getDisplacedMidPoint(point, nextPoint, displacementAmplitude, frame);
    newPoints.push(point);
    newPoints.push(midPoint);

  });
  return newPoints;
};

const sketch = ({context, width, height, frame}) => {
  return ({context, width, height, frame}) => {
    // clear context
    context.clearRect(0, 0, width, height);

    let startHeight = height / 2;
    startPoint = new Point(0, startHeight);
    endPoint = new Point(width, startHeight);
    let points = [ startPoint, endPoint ];

    for (let i = 0; i < params.n; ++i) {
      points = addDisplacedMidPoints(points, params.displacementAmplitude, frame);
    }

    // draw lines between points
    context.fillStyle = 'black';
    context.save();
    context.beginPath();
    context.moveTo(startPoint.x, startPoint.y);
    points.forEach( (point) => {
      context.lineTo(point.x, point.y);
      //context.bezierCurveTo(point.x+2, point.y+4, point.x-7, point.y+8, point.x, point.y);
    });
    context.stroke();
    context.restore();
  }
};

const createPane = () => {
  const pane = new TweakPane.Pane();
  let folder = pane.addFolder({title: 'Settings'});
  folder.addInput(params, 'n', {min: 0, max: 15, step: 1});
  folder.addInput(params, 'displacementAmplitude', {min: 0, max: 50, step: 0.5});
  folder.addInput(params, "noiseFrequency", {min: 0, max: 0.01, step: 0.0001});
};

createPane();
canvasSketch(sketch, settings);
