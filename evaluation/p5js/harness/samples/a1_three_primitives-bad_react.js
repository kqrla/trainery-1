// sample model output: react mental model. treats fill() as a per-shape attribute
// set once at the end, like styling a component. all shapes render with defaults.
function setup() {
  createCanvas(100, 100);
  background(220);
  circle(50, 50, 40);
  rect(10, 10, 30, 30);
  strokeWeight(3);
  line(0, 0, 100, 100);
  fill(255, 0, 0);
}
function draw() {}
