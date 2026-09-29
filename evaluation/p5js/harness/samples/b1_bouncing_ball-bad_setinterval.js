// sample model output: non-idiomatic. no draw loop, motion driven by setInterval,
// and the ball wraps at the edge instead of bouncing.
let x = 10;
function setup() {
  createCanvas(200, 100);
  setInterval(function () {
    background(0);
    fill(255);
    circle(x, 50, 10);
    x = x + 3;
    if (x > 195) x = 10;
  }, 16);
}
function draw() {}
