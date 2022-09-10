const canvasSketch = require('canvas-sketch');
const random = require('canvas-sketch-util/random');
const math = require('canvas-sketch-util/math');
const TweakPane = require('tweakpane');

const settings = {
  dimensions: [ 1080, 1080 ],
  animate: true,
};

const params = {
  n: 13,
  displacementAmplitude: 65,
  noiseFrequency: 0.0065,
  animationOffset: 2,
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

class Mountain {
  constructor(startPoint, endPoint, color, frame) {
    this.startPoint = startPoint;
    this.endPoint = endPoint;
    this.points = [ startPoint, endPoint ];
    this.color = color;

    for (let i = 0; i < params.n; ++i) {
      this.points = addDisplacedMidPoints(this.points, params.displacementAmplitude, frame);
    }
  }

  draw(context, frame) {
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

    context.restore();
  }
}

const sketch = ({context, width, height, frame}) => {
  return ({context, width, height, frame}) => {
    // clear context
    context.fillColor = 'black';
    context.fillRect(0, 0, width, height);

    for (let i = 0; i < 8; ++i) {
        startPoint = new Point(0, i*150);
        endPoint = new Point(width, i*150);
        for (let j = 0; j < 3; ++j) {
            const m1 = new Mountain(startPoint, endPoint, 'purple', frame-params.animationOffset);
            const m2 = new Mountain(startPoint, endPoint, 'blue', frame);
            const m3 = new Mountain(startPoint, endPoint, 'red', frame+params.animationOffset);
            m1.draw(context, frame)
            m2.draw(context, frame)
            m3.draw(context, frame)
        }
    }
  }
};

const createPane = () => {
  const pane = new TweakPane.Pane();
  let folder = pane.addFolder({title: 'Settings'});
  folder.addInput(params, 'n', {min: 0, max: 15, step: 1});
  folder.addInput(params, 'displacementAmplitude', {min: 0, max: 150, step: 0.5});
  folder.addInput(params, 'noiseFrequency', {min: 0, max: 0.02, step: 0.0001});
  folder.addInput(params, 'animationOffset', {min: 0, max: 100, step: 1});
};

createPane();
canvasSketch(sketch, settings);
