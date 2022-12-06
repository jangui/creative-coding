let capture;
let diameter;
let gridSize;
let enlarger
let threshold;
let mic;
let fft;

function setup() {
  createCanvas(400, 400);

  capture = createCapture(VIDEO);
  capture.size(400, 400);
  capture.hide();

  mic = new p5.AudioIn();
  mic.start();
  fft = new p5.FFT;
  fft.setInput(mic);

  gridSize = 5;
  enlarger = 0;
  threshold = 0;
}

function keyPressed() {
  if (keyCode == LEFT_ARROW) {
    if (gridSize > 0) { gridSize -= 1; }
  } else if (keyCode == RIGHT_ARROW) {
    gridSize += 1;
  } else if (keyCode == UP_ARROW) {
    enlarger += 1;
  } else if (keyCode == DOWN_ARROW) {
    if (enlarger > 0) { enlarger -= 1; }
  } else if (key == ',') {
    if (threshold+1 < diameter) { threshold += 1; }
  } else if (key == '.') {
    if (threshold > 0) { threshold -= 1; }
  }
}

function draw() {
  background(255);

  let audioSpectrum = fft.analyze();
  let spectrumDivisions = 4;
  let spectrumDivider = int(audioSpectrum.length / spectrumDivisions);
  let div1Total = 0;
  let div2Total = 0;
  let div3Total = 0
  let maxSpectrumTotal = 255 * spectrumDivider;
  for (let i = 0; i < audioSpectrum.length; ++i) {
    if (i < spectrumDivider) { div1Total += audioSpectrum[i]; }
    else if (i < spectrumDivider * 2) { div2Total += audioSpectrum[i]; }
    else { div3Total += audioSpectrum[i]; }
  }

  let div1Modulated = map(div1Total, 0, maxSpectrumTotal, 0, 255);
  let div2Modulated = map(div2Total, 0, maxSpectrumTotal, 0, 255);
  let div3Modulated = map(div3Total, 0, maxSpectrumTotal, 0, 255);

  div1Less = int(div1Modulated / 3);
  div2Less = int(div2Modulated / 3);
  div3Less = int(div3Modulated / 3);

  color1 = [div3Modulated, div2Modulated, div3Less]
  color2 = [div3Modulated, div1Less, div2Modulated]
  color3 = [div3Modulated, div1Modulated, div2Modulated]
  colors = [color1, color2, color3]

  capture.loadPixels();
  for (let i = 0; i < capture.height; i+=gridSize) {
    for (let j = 0; j < capture.width; j+=gridSize) {
      let index = (j * capture.width + i) * 4;
      let pixel = capture.pixels[index]
      diameter = map(pixel, 0, 255, gridSize+enlarger, 0);

      colorCategory = int(map(diameter, 0, gridSize+enlarger, 0, colors.length-1));
      rgbColor = colors[colorCategory];

      fill(rgbColor[0], rgbColor[1], rgbColor[2]);
      noStroke();
      //circle(i, j, diameter);
      if (diameter > threshold) { circle(i, j, diameter); }
    }
  }
}

