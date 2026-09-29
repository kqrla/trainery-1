# p5.js harness

this is the first execution harness for the trainery evaluation system.

it runs a p5.js sketch headlessly, exercises it with synthetic input and frame sampling, and scores it on behavioral evidence only. no code reading, no textual similarity.

## what is implemented

four tasks from the p5.js task suite are currently wired up:

* a1 three primitives (static rendering, style state)
* b1 bouncing ball (animation, bounce continuity)
* d3 push/pop isolation (transform stack)
* f2 runaway state (debugging: setup vs draw roles)

each task has sample sketches in `samples/`:

* `-good`: a correct, idiomatic implementation, expected score 4
* a deliberately flawed sample per task, expected score 1:
  * `a1-bad_react`: react mental model, treats fill() as a per-shape attribute
  * `b1-bad_setinterval`: motion driven by setInterval, ball wraps instead of bouncing
  * `d3-bad_nopop`: transform leak, no push/pop
  * `f2-broken`: the unfixed broken sketch returned as-is

## scoring

```text
0 = does not run
1 = runs, behavior incorrect
2 = runs, behavior partially correct
3 = runs, behavior correct
4 = correct and idiomatic
```

the idiomatic tier detects non-environment mechanisms. currently this means timer instrumentation: the harness wraps setInterval/setTimeout and counts calls, so a sketch whose animation loop is driven by timers caps at 3.

## running it

requirements: node 20+, headless chromium, p5.js. the harness was developed against `@sparticuz/chromium` + `playwright-core`, which bundles a chromium build that needs libnspr4/libnss3 available.

```text
npm install playwright-core @sparticuz/chromium p5
node harness/runner.js
```

the runner scores every file in `samples/` against its matching task, writes `results.json`, and prints a table.

## current results

first recorded run, synthetic sample outputs (these are written by hand to prove the harness discriminates, not real model outputs):

```text
task                  sample                        score
-----------------------------------------------------------
a1_three_primitives   a1-bad_react                  1
a1_three_primitives   a1-good                       4
b1_bouncing_ball      b1-bad_setinterval            1
b1_bouncing_ball      b1-good                       4
d3_pushpop_isolation  d3-bad_nopop                  1
d3_pushpop_isolation  d3-good                       4
f2_runaway_state      f2-broken                     1
f2_runaway_state      f2-fixed                      4
```

every flawed sample failed for its intended reason:

* a1-bad_react: all shapes rendered white, proving fill() was treated as an attribute
* b1-bad_setinterval: 2 teleports detected (wrap, not bounce), 0 real bounces, timers used
* d3-bad_nopop: the post-pop square was absent, dragged off-canvas by the accumulated transform
* f2-broken: centroid static across frames

## known gaps

* tasks that display text (c2, e3) have no behavioral check yet. reading rendered digits needs either a tiny digit classifier or a spec change (tally marks, fixed-position markers). this is the next harness decision to make.
* interaction checks for the remaining c-group tasks need synthetic mouse and key event sequences, which the underlying stack supports (verified: mouse down/up events reach mousePressed).
* the idiomatic tier currently only detects timer-driven animation. other non-idiomatic patterns (manual raf loops, dom manipulation for rendering) are not detected yet.
* a1 stability check compares two reads 400ms apart. a sketch that animates slowly could false-positive as stable. acceptable for now since a1 is specified as static.

## provenance

* task suite: evaluation/p5js/task-suite.md
* p5.js version: whatever is vendored in node_modules at run time (pin this before real experiments)
* first run evidence: results.json
