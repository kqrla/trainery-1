// sample model output: failed fix. the model returned the sketch unchanged,
// so the circle still never moves.
let x = 0;
let vx = 2;
function setup() {
  createCanvas(200, 100);
  x += vx;
  background(0);
  fill(255);
  circle(x, 50, 10);
}
function draw() {}
