// sample model output: correct fix. state update moved into draw.
let x = 0;
let vx = 2;
function setup() {
  createCanvas(200, 100);
}
function draw() {
  background(0);
  fill(255);
  circle(x, 50, 10);
  x += vx;
}
