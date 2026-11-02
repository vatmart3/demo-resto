// Capture mobile (iPhone 390px) : node scripts/dev/shoot.cjs <url> <outdir> [scrollY...]
const { chromium, devices } = require('playwright')
;(async () => {
  const [url, out, ...ys] = process.argv.slice(2)
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] })
  const ctx = await browser.newContext({ ...devices['iPhone 13'], reducedMotion: process.env.RM ? 'reduce' : 'no-preference' })
  const page = await ctx.newPage()
  const logs = []
  page.on('console', (m) => logs.push(`[${m.type()}] ${m.text()}`))
  page.on('pageerror', (e) => logs.push(`[pageerror] ${e.message}`))
  await page.goto(url, { waitUntil: 'networkidle' })
  await page.waitForTimeout(800)
  if (process.env.FULL) {
    await page.screenshot({ path: `${out}/full.png`, fullPage: true })
  }
  const list = ys.length ? ys : ['0']
  for (const y of list) {
    if (y.startsWith('#')) {
      await page.evaluate((s) => document.querySelector(s).scrollIntoView({ block: 'start', behavior: 'instant' }), y)
    } else {
      await page.evaluate((v) => window.scrollTo({ top: Number(v), behavior: 'instant' }), y)
    }
    await page.waitForTimeout(Number(process.env.WAIT || 1500))
    await page.screenshot({ path: `${out}/s-${y.replace('#', 'id-')}.png` })
  }
  console.log(logs.slice(0, 30).join('\n'))
  await browser.close()
})()
