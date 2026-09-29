// sample model output: correct
let x = 10;
let y = 50;
let vx = 3;
let vy = 2;
function setup() {
  createCanvas(200, 100);
}
function draw() {
  background(0);
  fill(255);
  circle(x, y, 10);
  x = x + vx;
  y = y + vy;
  if (x < 5 || x > 195) vx = vx * -1;
  if (y < 5 || y > 95) vy = vy * -1;
}
