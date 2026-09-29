// sample model output: correct. transform and style state isolated with push/pop.
function setup() {
  createCanvas(100, 100);
  rectMode(CENTER);
  noStroke();
}
function draw() {
  background(0);
  push();
  translate(50, 50);
  rotate(PI / 4);
  fill(255);
  rect(0, 0, 50, 8);
  pop();
  fill(255);
  square(20, 80, 10);
}
