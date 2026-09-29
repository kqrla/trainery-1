# p5.js task suite

this is a draft evaluation suite for the first trainery experiment.

the suite is the dependent variable. every task has a behavioral acceptance check that can be verified in a headless browser, not by reading the code.

each task lists the p5.js concepts it exercises. these map directly to candidate transfer edges in the conceptual graph, so a per-task breakdown after the experiment can show which concept areas benefited from transfer-aware training.

## scoring

each task scores:

```text
0 = does not run
1 = runs, behavior incorrect
2 = runs, behavior partially correct
3 = runs, behavior correct
4 = correct and idiomatic (uses the intended environment mechanism)
```

the "idiomatic" tier matters. a model that reimplements a frame loop with setTimeout has passed behaviorally but not acquired the environment.

---

## a. static rendering (concepts: setup, draw, canvas, primitives, style state)

### task a1: three primitives

draw a 100x100 canvas. fill a red circle at (50, 50) with radius 20, a blue rect at (10, 10) sized 30x30, and a green line from (0, 0) to (100, 100).

acceptance: canvas exists, three shapes present with the specified colors and positions. pixel sampling at known points is enough.

### task a2: style state ordering

draw two circles. the first must be red, the second must be blue.

acceptance: both circles present, colors correct. this catches models that assume fill() applies retroactively or that shapes are objects with their own stored color (a react-style mental model).

### task a3: rectMode

using rectMode(CENTER), draw a rect centered at (50, 50) sized 40x40.

acceptance: corners at (30, 30). this tests whether the model read the environment semantics instead of assuming css-style corner-anchored boxes.

### task a4: background and layering

set the background to dark gray, then draw a small light circle and a larger dark circle on top.

acceptance: background color correct, and the light circle is partially occluded by the larger dark circle. this tests draw-order-as-layering (last drawn wins), which contrasts with z-index and with declarative scene graphs.

### task a5: custom shape

use beginShape()/vertex()/endShape() to draw a five-pointed star centered at (50, 50).

acceptance: canvas shows a single closed 10-vertex star, non-zero area, roughly symmetric.

---

## b. animation (concepts: draw loop, frameCount, delta timing, motion)

### task b1: bouncing ball

animate a ball moving at constant velocity that bounces off all four canvas edges.

acceptance: over a captured frame sequence, the ball's centroid changes direction at each edge and never leaves the canvas.

### task b2: frameCount phase

animate a circle whose radius oscillates as 20 + 10 * sin(frameCount * 0.05).

acceptance: sampled radii across frames match the function within tolerance.

### task b3: delta timing

animate a square moving at 60 pixels per second using deltaTime, in a way that stays correct if the frame rate changes.

acceptance: measure the square's position across frames. distance per elapsed time is about 60px/s under an injected frame-rate slowdown.

### task b4: trails

animate a ball moving in a circle that leaves a fading trail.

acceptance: instead of calling background(), the model must use a translucent rect or overlay. over frames, pixels behind the ball retain a decreasing-intensity ghost. this is a strong target-specific pattern with no common react/vite analog, and it is a good "does the curriculum correctly mark things novel" probe.

### task b5: state initialization

animate a ball, but initialize its position with a random x so that each page load differs, while keeping the velocity fixed.

acceptance: across two runs with different seeds, the ball starts at different positions but the same speed. this tests setup-as-initializer versus draw-as-per-frame (which must not re-randomize). a react mental model maps this to useState lazy init, the analogy is partly valid, and the failure mode (re-randomizing every frame) is the interesting part.

---

## c. interaction and events (concepts: event handlers, input state)

### task c1: mouse follow

draw a circle that follows the mouse position.

acceptance: dispatch synthetic mouse events, sample canvas, the circle centroid equals the last mouse position.

### task c2: mousePressed counter

display a number that increments once per mouse press.

acceptance: 3 synthetic presses, the displayed count reads 3. this catches double-counting (using both mousePressed() and a window listener) and the draw-loop redraw requirement for text updates.

### task c3: key control

move a square with the arrow keys, one key press = one grid step.

acceptance: synthetic keydown events move the square in the correct direction by the correct step. tests p5's keyIsDown / keyCode conventions and the difference between event-driven and per-frame input polling.

### task c4: drag to draw

implement a simple paint tool: while the mouse is down and moving, draw small circles at the cursor; when released, stop drawing.

acceptance: mouse-down movement adds marks, movement without the button does not.

### task c5: buttons and callbacks

add a p5.dom button "reset" that clears the canvas and resets any animation state to its initial values.

acceptance: after interaction and animation, clicking the button returns the canvas to the initial frame state. this is the closest analog to react's explicit state reset, and the transfer edge (imperative reset vs. re-render from state) is a good graph test.

---

## d. transformation (concepts: coordinate systems, push/pop, transform stack)

### task d1: translate

use translate() to draw a circle at logical (0, 0) that appears at the canvas center.

acceptance: the circle centroid is at (width/2, height/2).

### task d2: rotate

draw a long thin rect rotated 45 degrees around its center.

acceptance: sampled shape orientation is diagonal. catches models that assume css rotation properties or that rotate() rotates the shape rather than the coordinate system.

### task d3: push/pop isolation

draw a diagonal rotated rect inside push()/pop(), then draw an unrotated square after pop().

acceptance: the first shape is rotated, the second is axis-aligned, proving the model treats style/transform state as a stack. this is the strongest single probe for the scope-vs-component-state analogy.

### task d4: orbit

animate a small circle orbiting the canvas center at radius 30 using translate() + rotate() (not trig arithmetic).

acceptance: over frames the circle's path is circular around center at radius about 30. the acceptance is behavioral only; but the idiomatic tier checks whether translate/rotate were used. the idiom can be detected by asking for a variant and watching whether the coordinate approach or manual trig is used.

---

## e. composition and abstraction (concepts: functions, modules, reuse)

### task e1: parameterized shape function

write a function drawStar(x, y, size, color) and use it to draw three stars at different positions and sizes.

acceptance: three stars present, positions and sizes vary, single implementation. tests whether the model transfers the parameter/function concept into drawing-code organization.

### task e2: many instances

draw 50 bouncing balls, each with its own position and velocity, with collisions with the walls only.

acceptance: all 50 move and bounce; no two share state. this forces instance management (arrays of objects or classes) inside a global-function environment. a react mental model maps well to "array of components", and the gap is the absence of per-instance render.

### task e3: state machine

implement a traffic light: red, yellow, green cycles automatically every 2 seconds. pressing the space key freezes the cycle, pressing it again resumes.

acceptance: color sequence over time is correct, freeze works, resume continues from where it stopped. this is the clearest state-machine transfer probe in the suite.

### task e4: particle system

implement a particle emitter: particles spawn at the mouse, move outward with fading alpha, and are removed when fully transparent or off-canvas.

acceptance: after moving the mouse, particles exist, move, and disappear over time. the array-manage-remove pattern is common to react list rendering but must be done imperatively here.

---

## f. debugging (concepts: environment mechanics, failure diagnosis)

these tasks provide a broken sketch and require a fix. behavioral acceptance plus a one-line diff check.

### task f1: fix the flicker

given a sketch that draws a background only in setup(), causing all animation frames to accumulate into a smear, make the animation render cleanly.

acceptance: animation shows a moving shape with no accumulation.

### task f2: fix the runaway state

given a sketch where a velocity is added to a position inside setup() instead of draw(), resulting in no motion, make it animate.

acceptance: the shape moves. this directly tests setup/draw role separation.

### task f3: fix the transform leak

given a sketch where translate() accumulates every frame because it is called without push/pop, causing the drawing to slide off-canvas, fix the transform handling.

acceptance: the drawing stays at a stable position while still animating internally.

---

## g. generalization (concepts: specification to implementation, novel combination)

### task g1: pong

implement a minimal pong: left paddle controlled by the mouse y, a ball that bounces off the top, bottom, and paddle, and a score displayed when the ball exits the left or right edge, after which the ball resets.

acceptance: all behaviors observable via synthetic events and frame sampling.

### task g2: generative pattern from spec

given only this text spec, implement it: "a grid of squares, 8 by 8, where each square's fill lightness depends on its distance from the canvas center, and the whole pattern slowly pulses over time."

acceptance: grid present, lightness gradient matches distance from center at sample points, pulsing visible over frames. no examples of this exact pattern should appear in the training corpus, which is the point.

### task g3: novel mechanic

implement a "gravity brush": while the mouse is held, circles spawn at the cursor and fall with acceleration, bouncing once off the floor with 0.5 restitution, then fading out.

acceptance: circles spawn only while held, accelerate downward, bounce to about half height once, then fade and vanish.

---

## suite properties

* 25 tasks: 5 rendering, 5 animation, 5 interaction, 4 transform, 4 composition, 3 debugging, 3 generalization
* every acceptance check is executable in a headless browser with synthetic input events and frame sampling
* task concept annotations align with the seed graph edges: setup/draw vs. lifecycle functions, style state vs. props, push/pop vs. scope, event handlers vs. event listeners, instances vs. lists of components, state machine vs. state hooks
* tasks b4, d3, f2, e3 are expected to be the highest-signal discriminators between transfer-aware and target-only conditions
