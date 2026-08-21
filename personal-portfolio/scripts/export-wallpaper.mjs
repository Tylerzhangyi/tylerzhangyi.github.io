import { chromium } from 'playwright'
import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')
const outputDir = path.join(rootDir, 'public', 'wallpapers')
const url = process.env.WALLPAPER_URL || 'http://localhost:8806'
const timestamp = new Date().toISOString().slice(0, 10)

const PRESETS = [
  { label: '3840x2560', width: 3840, height: 2560 },
  { label: 'mac-2560x1664', width: 2560, height: 1664 }
]

const hideUiCss = `
  .site-header,
  .app-loader,
  [class*="neoScrollCue"],
  [class*="neoKicker"],
  nextjs-portal,
  [data-nextjs-toast],
  [data-nextjs-dialog-overlay],
  #__next-build-watcher {
    display: none !important;
  }

  html.is-boot-loading,
  html.is-boot-handoff {
    overflow: hidden;
  }

  .neoSceneViewport [class*="neoContent"],
  [class*="neoSceneViewport"] [class*="neoContent"] {
    padding-top: 0 !important;
  }
`

async function waitForHero(page) {
  await page.waitForFunction(
    () => {
      const loader = document.querySelector('.app-loader')
      if (loader) return false
      const hero = document.querySelector('#section-home')
      if (!hero) return false
      const title = hero.querySelector('[aria-label]')
      return Boolean(title && title.getAttribute('aria-label')?.trim())
    },
    { timeout: 45000 }
  )

  await page.waitForTimeout(1800)
}

async function exportWallpaper(page, { label, width, height }) {
  await page.setViewportSize({ width, height })
  await page.waitForTimeout(400)

  const outputPath = path.join(outputDir, `homepage-wallpaper-${label}-${timestamp}.png`)
  await page.locator('#section-home').screenshot({ path: outputPath, type: 'png' })
  console.log(`Wallpaper saved to ${outputPath}`)
}

async function main() {
  await mkdir(outputDir, { recursive: true })

  const browser = await chromium.launch()
  const page = await browser.newPage({
    viewport: { width: PRESETS[0].width, height: PRESETS[0].height },
    deviceScaleFactor: 1
  })

  await page.goto(url, { waitUntil: 'networkidle' })
  await page.addStyleTag({ content: hideUiCss })
  await waitForHero(page)

  for (const preset of PRESETS) {
    await exportWallpaper(page, preset)
  }

  await browser.close()
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
