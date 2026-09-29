# research journal

this is the messy chronological notebook for trainery.

unlike the other research documents, this file is allowed to contain:

* unfinished ideas
* questions
* failed experiments
* weird observations
* implementation notes
* hypotheses that later turn out to be wrong
* decisions
* things that need to be investigated
* thoughts that are not ready for the formal methodology

the formal research documents should describe the current methodology.

this file records how we got there.

---

## 2026-09-18

### kaboom.js as the next target

kaboom.js is being added as another target environment.

the useful property is that it is javascript → javascript while still introducing a specialized programming model.

this makes it a useful complement to p5.js and three.js.

the particularly interesting experiment is cumulative transfer:

```text
react + vite + python
          ↓
        p5.js
          ↓
   learned p5.js knowledge
          ↓
      kaboom.js
```

the question is whether learning one specialized javascript environment creates a useful prior for another.

this is different from simply saying:

> p5.js and kaboom.js are both javascript.

the language-level similarity is only one variable.

the actual question is whether acquired conceptual knowledge transfers.

---

---

## 2026-09-29

### p5.js task suite and first execution harness

the p5.js task suite now exists: 25 tasks across rendering, animation, interaction, transformation, composition, debugging, and generalization. every acceptance check is behavioral and runs headlessly (synthetic mouse/key events, frame sampling, pixel probes). no code reading.

a first execution harness implements four of those tasks and was validated with synthetic sample outputs:

```text
a1_three_primitives   bad_react        1
a1_three_primitives   good             4
b1_bouncing_ball      bad_setinterval   1
b1_bouncing_ball      good             4
d3_pushpop_isolation  bad_nopop         1
d3_pushpop_isolation  good             4
f2_runaway_state      broken           1
f2_runaway_state      fixed            4
```

the flawed samples are deliberate misconception probes and each failed for its intended reason:

* fill() treated as a per-shape attribute (react mental model)
* animation driven by setInterval with a wrap instead of a bounce
* transform leak without push/pop dragging the second shape off-canvas
* state update left in setup so nothing moves

scoring has a fourth tier for idiomatic use: behaviorally correct code that drives its frame loop with timers caps at 3. a bouncing ball reimplemented with setInterval has not acquired the environment.

a design decision the suite surfaced: tasks that display text have no behavioral check yet. reading rendered digits needs either a small digit classifier or a spec change. this is the current open harness question.

the harness was developed against headless chromium with the libnspr4/libnss3 workaround documented in evaluation/p5js/harness/readme.md.

## open questions

* how should source proficiency be measured?
* what exactly counts as "proficiency" for each target?
* how should transfer relationships be generated?
* how much of the graph should be human-verified?
* how should negative transfer be represented?
* how should curriculum generation decide what to skip?
* how much target data should each condition receive?
* how should compute be normalized?
* what should count as successful cumulative transfer?
* how should visual and geometric artifacts be evaluated automatically?

---

## current principle

do not make the experiment prove the hypothesis.

make the experiment capable of disproving it.
