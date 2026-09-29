// sample model output: transform leak. no push/pop, so translate and rotate
// accumulate every frame and drag the second shape into the rotated frame.
function setup() {
  createCanvas(100, 100);
  rectMode(CENTER);
  noStroke();
}
function draw() {
  background(0);
  translate(50, 50);
  rotate(PI / 4);
  fill(255);
  rect(0, 0, 50, 8);
  fill(255);
  square(20, 80, 10);
}
