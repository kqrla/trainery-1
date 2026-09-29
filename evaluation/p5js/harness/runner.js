// runner: executes sketch code headlessly against task checks and produces scores.
const chromium = require('@sparticuz/chromium');
const { chromium: pw } = require('playwright-core');
const fs = require('fs');
const path = require('path');

process.env.LD_LIBRARY_PATH = process.env.LD_LIBRARY_PATH || '/tmp/cl/usr/lib/x86_64-linux-gnu';
const P5 = fs.readFileSync('node_modules/p5/lib/p5.min.js', 'utf8');

// helpers shared by task checks
const h = {
  async pixels(page, points) {
    return page.evaluate((pts) => {
      const ctx = document.querySelector('canvas')?.getContext('2d');
      if (!ctx) return pts.map(() => null);
      return pts.map(([x, y]) => Array.from(ctx.getImageData(x, y, 1, 1).data));
    }, points);
  },
  isColor(px, [r, g, b], tol = 60) {
    if (!px || px[3] === 0) return false;
    return Math.abs(px[0] - r) < tol && Math.abs(px[1] - g) < tol && Math.abs(px[2] - b) < tol;
  },
  hasChannel(px, ch, min = 100) {
    return !!px && px[ch] >= min;
  },
  // centroid of lit pixels inside canvas bounds (bright pixels above threshold)
  async centroid(page, w, h) {
    return page.evaluate(
      ([w, h]) => {
        const c = document.querySelector('canvas');
        if (!c) return null;
        const ctx = c.getContext('2d');
        const img = ctx.getImageData(0, 0, w, h);
        let sx = 0, sy = 0, n = 0;
        for (let y = 0; y < h; y++) {
          for (let x = 0; x < w; x++) {
            const i = (y * w + x) * 4;
            if (img.data[i] > 80 || img.data[i + 1] > 80 || img.data[i + 2] > 80) {
              sx += x; sy += y; n++;
            }
          }
        }
        return n > 5 ? { x: sx / n, y: sy / n, n } : null;
      },
      [w, h]
    );
  },
  // idiomatic tier: motion should live in the p5 draw loop, not in timers
  async noExternalLoop(page) {
    return page.evaluate(() => {
      const timers = window.__timer_count || 0;
      return timers === 0;
    });
  },
};

async function runSketch(page, code) {
  const errors = [];
  page.removeAllListeners('pageerror');
  page.on('pageerror', (e) => errors.push(String(e)));
  // instrument timers for the idiomatic check
  const wrapped = `
    window.__timer_count = 0;
    (function() {
      const _si = window.setInterval, _st = window.setTimeout;
      window.setInterval = function() { window.__timer_count++; return _si.apply(this, arguments); };
      window.setTimeout = function() { window.__timer_count++; return _st.apply(this, arguments); };
    })();
  `;
  const safeCode = code.replace(/<\/script>/g, '');
  await page.setContent(
    `<!DOCTYPE html><html><head><script>${P5}</script><script>${wrapped}</script></head><body><script>
${safeCode}
</script></body></html>`
  );
  await page.waitForTimeout(600);
  return errors;
}

function toScore(r) {
  if (!r.runs) return 0;
  if (r.behavior === 'incorrect') return 1;
  if (r.behavior === 'partial') return 2;
  return r.idiomatic ? 4 : 3;
}

(async () => {
  const samplesDir = process.argv[2] || 'harness/samples';
  const { tasks } = require('./tasks.js');
  const files = fs.readdirSync(samplesDir).filter((f) => f.endsWith('.js')).sort();

  const execPath = await chromium.executablePath();
  const results = [];

  for (const task of tasks) {
    for (const f of files.filter((f) => f.startsWith(task.id))) {
      const code = fs.readFileSync(path.join(samplesDir, f), 'utf8');
      let res;
      // single-process chromium is fragile: a fresh browser per sample is the sturdy pattern
      let browser = null;
      try {
        browser = await pw.launch({ executablePath: execPath, args: chromium.args });
        const page = await browser.newPage();
        const errs = await runSketch(page, code);
        if (errs.length) {
          res = { runs: false, behavior: 'incorrect', idiomatic: false, evidence: { error: errs[0] } };
        } else {
          res = await task.check(page, h);
        }
      } catch (e) {
        res = { runs: false, behavior: 'incorrect', idiomatic: false, evidence: { error: String(e).slice(0, 120) } };
      } finally {
        if (browser) await browser.close().catch(() => {});
      }
      const score = toScore(res);
      results.push({ task: task.id, sample: f.replace('.js', ''), score, ...res });
    }
  }
  fs.writeFileSync('harness/results.json', JSON.stringify(results, null, 2));

  // summary table
  console.log('task                  sample                  score');
  console.log('-----------------------------------------------------');
  for (const r of results) {
    console.log(
      `${r.task.padEnd(22)}${r.sample.padEnd(24)}${String(r.score)}${r.evidence && r.evidence.error ? '  (error: ' + String(r.evidence.error).slice(0, 60) + ')' : ''}`
    );
  }
})();
