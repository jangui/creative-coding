const canvasSketch = require('canvas-sketch');
const random = require('canvas-sketch-util/random');
const math = require('canvas-sketch-util/math');

const settings = {
  dimensions: [ 1080, 1080 ],
  animate: false,
};

class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

const getDisplacedMidPoint = (point1, point2, maxDisplacement) => {
  // get midpoint
  xm  = (point1.x + point2.x) / 2
  ym  = (point1.y + point2.y) / 2

  // displace midpoint
  displacement = random.range(-maxDisplacement, maxDisplacement);
  ym += displacement;

  return new Point(xm, ym);
}

const addDisplacedMidPoints = (points, maxDisplacement) => {
  newPoints = []
  points.forEach( (point, ind) => {
    if (ind == points.length-1) { newPoints.push(point); return; }
    nextPoint = points[ind+1];

    midPoint = getDisplacedMidPoint(point, nextPoint, maxDisplacement);
    newPoints.push(point);
    newPoints.push(midPoint);

  });
  return newPoints;
};

const sketch = ({context, width, height}) => {
  return ({context, width, height}) => {

    startHeight = height / 2;
    startPoint = new Point(0, startHeight);
    endPoint = new Point(width, startHeight);
    let points = [ startPoint, endPoint ];

    let n = 7;
    let maxDisplacement = 20;
    for (let i = 0; i < n; ++i) {
      points = addDisplacedMidPoints(points, maxDisplacement);
    }
    console.log(points.length);

    // draw lines between points
    context.fillStyle = 'black';
    context.save();
    context.beginPath();
    context.moveTo(startPoint.x, startPoint.y);
    points.forEach( (point) => {
      context.lineTo(point.x, point.y);
    });
    context.stroke();
    context.restore();

    /*
    context.fill()
    //context.bezierCurveTo(100, 245, 300, 240, 540, 500);
    context.rect(200, 200, 200, 200);
    context.lineWidth = 10;
    */

  }
};

canvasSketch(sketch, settings);
