import { chromium } from "playwright";
import fs from "fs";
const OUT = "/tmp/claude-0/-home-user-Events/3d0adb9e-7cf8-57a5-89c4-d43238c29c5e/scratchpad";
const caveat = fs.readFileSync(`${OUT}/caveat.woff2`).toString("base64");
const css = `@font-face{font-family:'Caveat';font-style:normal;font-weight:400 700;src:url(data:font/woff2;base64,${caveat}) format('woff2');font-display:block;}`;

const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const page = await browser.newPage({ viewport: { width: 1280, height: 1000 } });
await page.goto("http://localhost:4321/past-events", { waitUntil: "networkidle" });
await page.addStyleTag({ content: css });
await page.evaluate(async () => { await document.fonts.ready; });
await page.waitForTimeout(800);

// hunt for any remaining pink/magenta pixel anywhere on the page
const shot = await page.screenshot({ fullPage: true });
const pink = await page.evaluate(async (b64) => {
  const img = new Image();
  img.src = "data:image/png;base64," + b64;
  await img.decode();
  const c = document.createElement("canvas");
  c.width = img.width; c.height = img.height;
  const ctx = c.getContext("2d");
  ctx.drawImage(img, 0, 0);
  let hits = 0, sample = null;
  for (let x = 4; x < img.width; x += 12) {
    for (let y = 4; y < img.height; y += 12) {
      const d = ctx.getImageData(x, y, 1, 1).data;
      const [r, g, bl] = d;
      // strong magenta: red and blue high, green much lower
      if (r > 150 && bl > 70 && g < r - 70 && g < bl + 40) {
        hits++;
        if (!sample) sample = `rgb(${r},${g},${bl}) at ${x},${y}`;
      }
    }
  }
  return { hits, sample, total: Math.floor(img.width / 12) * Math.floor(img.height / 12) };
}, shot.toString("base64"));
console.log(`magenta-ish pixels sampled: ${pink.hits} of ${pink.total}${pink.sample ? "  e.g. " + pink.sample : ""}`);
console.log("(photos contain real pink decor, so a small count is expected)");

await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(300);
await page.screenshot({ path: `${OUT}/gold-hero.png` });

const strip = page.locator("main section", { hasText: "The photos did not disappoint." }).last();
await strip.scrollIntoViewIfNeeded();
await page.evaluate(() => window.scrollBy(0, -260));
await page.waitForTimeout(400);
await page.screenshot({ path: `${OUT}/gold-strip.png` });

const l3 = page.locator("main span", { hasText: "Everybody understood" }).first();
await l3.scrollIntoViewIfNeeded();
await page.evaluate(() => window.scrollBy(0, -300));
await page.waitForTimeout(400);
await page.screenshot({ path: `${OUT}/gold-sec3.png` });

await browser.close();
