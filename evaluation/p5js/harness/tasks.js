// task definitions for the p5.js harness.
// each check runs the sketch headlessly and returns behavioral evidence only.

const tasks = [
  {
    id: 'a1_three_primitives',
    prompt: 'draw a 100x100 canvas. fill a red circle at (50, 50) with radius 20, a blue rect at (10, 10) sized 30x30, and a green line from (0, 0) to (100, 100).',
    async check(page, h) {
      // render stability: two reads 400ms apart identical (no accidental animation)
      const p1 = await h.pixels(page, [[50, 60], [20, 30], [4, 4]]);
      await page.waitForTimeout(400);
      const p2 = await h.pixels(page, [[50, 60], [20, 30], [4, 4]]);
      const stable = JSON.stringify(p1) === JSON.stringify(p2);
      const red = h.isColor(p1[0], [255, 0, 0]);
      const blue = h.isColor(p1[1], [0, 0, 255]);
      const green = h.hasChannel(p1[2], 1); // green stroke at (4,4)
      const correct = red && blue && green;
      return {
        runs: stable,
        behavior: correct ? 'correct' : 'incorrect',
        idiomatic: true, // no non-p5 mechanism detectable for a static task
        evidence: { at_50_60: p1[0], at_20_30: p1[1], at_4_4: p1[2], stable },
      };
    },
  },
  {
    id: 'b1_bouncing_ball',
    prompt: 'animate a ball moving at constant velocity that bounces off all four canvas edges.',
    async check(page, h) {
      const samples = [];
      for (let i = 0; i < 90; i++) {
        await page.waitForTimeout(16);
        samples.push(await h.centroid(page, 200, 100));
      }
      const valid = samples.filter((s) => s !== null);
      if (valid.length < 60) return { runs: false, behavior: 'incorrect', idiomatic: false, evidence: { tracked: valid.length } };
      const xs = valid.map((s) => s.x);
      const ys = valid.map((s) => s.y);
      // motion
      const xRange = Math.max(...xs) - Math.min(...xs);
      const yRange = Math.max(...ys) - Math.min(...ys);
      const moving = xRange > 30 && yRange > 10;
      // bounce on x: sign change of dx with continuity (no teleport)
      let bounces = 0, teleports = 0;
      for (let i = 2; i < xs.length; i++) {
        const d1 = xs[i - 1] - xs[i - 2];
        const d2 = xs[i] - xs[i - 1];
        if (d1 * d2 < 0 && Math.abs(d1) < 20 && Math.abs(d2) < 20) bounces++;
        if (Math.abs(d2) > 30) teleports++;
      }
      const inBounds = valid.every((s) => s.x >= 0 && s.x <= 200 && s.y >= 0 && s.y <= 100);
      const correct = moving && bounces >= 1 && teleports === 0 && inBounds;
      const partial = moving && inBounds;
      const idiomatic = await h.noExternalLoop(page); // no setInterval/setTimeout driving motion
      return {
        runs: true,
        behavior: correct ? 'correct' : partial ? 'partial' : 'incorrect',
        idiomatic,
        evidence: { xRange: Math.round(xRange), yRange: Math.round(yRange), bounces, teleports, inBounds },
      };
    },
  },
  {
    id: 'd3_pushpop_isolation',
    prompt: 'draw a diagonal rotated rect inside push()/pop(), then draw an unrotated square after pop().',
    async check(page, h) {
      const p = await h.pixels(page, [[55, 55], [65, 50], [20, 80], [16, 76]]);
      const barDiagonal = p[0][0] > 100 && p[0][1] > 100; // lit on diagonal through center
      const barNotHorizontal = !(p[1][0] > 100 && p[1][1] > 100); // (65,50) dark if rotated, lit if horizontal
      const squareCenter = p[2][0] > 100 && p[2][1] > 100; // axis-aligned square present at (20,80)
      const squareCorner = p[3][0] > 100 && p[3][1] > 100; // corner lit only if axis-aligned
      const correct = barDiagonal && barNotHorizontal && squareCenter && squareCorner;
      return {
        runs: true,
        behavior: correct ? 'correct' : 'incorrect',
        idiomatic: true,
        evidence: { barDiagonal, barNotHorizontal, squareCenter, squareCorner },
      };
    },
  },
  {
    id: 'f2_runaway_state',
    prompt:
      'this sketch should animate a circle moving right, but it does not move. fix it.\n\nlet x = 0;\nlet vx = 2;\nfunction setup() {\n  createCanvas(200, 100);\n  x += vx;\n  background(0);\n  fill(255);\n  circle(x, 50, 10);\n}\nfunction draw() {}',
    async check(page, h) {
      const c1 = await h.centroid(page, 200, 100);
      await page.waitForTimeout(500);
      const c2 = await h.centroid(page, 200, 100);
      if (c1 === null || c2 === null) return { runs: false, behavior: 'incorrect', idiomatic: false, evidence: { c1, c2 } };
      const moved = c2.x - c1.x > 15;
      const steady = Math.abs(c2.y - c1.y) < 3;
      return {
        runs: true,
        behavior: moved && steady ? 'correct' : 'incorrect',
        idiomatic: true,
        evidence: { x1: Math.round(c1.x), x2: Math.round(c2.x), moved },
      };
    },
  },
];

module.exports = { tasks };
