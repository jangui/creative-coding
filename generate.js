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

    let startHeight = height / 2;
    startPoint = new Point(0, startHeight);
    endPoint = new Point(width, startHeight);

    startPoint2 = new Point(0, startHeight+150);
    endPoint2 = new Point(width, startHeight+150);

    startPoint3 = new Point(0, startHeight-150);
    endPoint3 = new Point(width, startHeight-150);

    startPoint4 = new Point(0, startHeight+300);
    endPoint4 = new Point(width, startHeight+300);

    startPoint5 = new Point(0, startHeight-300);
    endPoint5 = new Point(width, startHeight-300);

    const m1 = new Mountain(startPoint, endPoint, 'purple', frame-params.animationOffset);
    const m2 = new Mountain(startPoint, endPoint, 'blue', frame);
    const m3 = new Mountain(startPoint, endPoint, 'red', frame+params.animationOffset);

    const m4 = new Mountain(startPoint2, endPoint2, 'purple', frame-params.animationOffset);
    const m5 = new Mountain(startPoint2, endPoint2, 'blue', frame);
    const m6 = new Mountain(startPoint2, endPoint2, 'red', frame+params.animationOffset);

    const m7 = new Mountain(startPoint3, endPoint3, 'purple', frame-params.animationOffset);
    const m8 = new Mountain(startPoint3, endPoint3, 'blue', frame);
    const m9 = new Mountain(startPoint3, endPoint3, 'red', frame+params.animationOffset);

    const m10 = new Mountain(startPoint4, endPoint4, 'purple', frame-params.animationOffset);
    const m11 = new Mountain(startPoint4, endPoint4, 'blue', frame);
    const m12 = new Mountain(startPoint4, endPoint4, 'red', frame+params.animationOffset);

    const m13 = new Mountain(startPoint5, endPoint5, 'purple', frame-params.animationOffset);
    const m14 = new Mountain(startPoint5, endPoint5, 'blue', frame);
    const m15 = new Mountain(startPoint5, endPoint5, 'red', frame+params.animationOffset);

    m1.draw(context, frame);
    m2.draw(context, frame);
    m3.draw(context, frame);

    m4.draw(context, frame);
    m5.draw(context, frame);
    m6.draw(context, frame);

    m7.draw(context, frame);
    m8.draw(context, frame);
    m9.draw(context, frame);

    m10.draw(context, frame);
    m11.draw(context, frame);
    m12.draw(context, frame);

    m13.draw(context, frame);
    m14.draw(context, frame);
    m15.draw(context, frame);

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
