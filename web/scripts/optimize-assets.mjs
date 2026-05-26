// One-off asset optimizer. Resizes oversized images down to their real display
// size and recompresses them. Writes to a temp file, keeps the result only when
// it is actually smaller, then atomically replaces the original.
import sharp from 'sharp'
import { statSync, renameSync, unlinkSync } from 'node:fs'

const KB = (p) => (statSync(p).size / 1024).toFixed(0)

async function replace(file, pipelineFactory) {
  const before = +KB(file)
  const tmp = file + '.tmp'
  await pipelineFactory().toFile(tmp)
  const after = +KB(tmp)
  if (after < before) {
    renameSync(tmp, file)
    console.log(`✓ ${file}  ${before}KB → ${after}KB  (-${(100 * (before - after) / before).toFixed(0)}%)`)
  } else {
    unlinkSync(tmp)
    console.log(`· ${file}  kept original (${before}KB ≤ ${after}KB)`)
  }
}

// Square brand logo: only ever shown ≤120px in the header and as a social-card
// image. 1254² is overkill — palette-quantize and cap at 512² for crisp retina.
await replace('public/shinyms-logo.png', () =>
  sharp('public/shinyms-logo.png')
    .resize(512, 512, { fit: 'inside', withoutEnlargement: true })
    .png({ quality: 90, compressionLevel: 9, palette: true })
)

// Gameplay screenshot: rendered at 960px wide. Cap source at 1280 (2x for the
// common 640px mobile width is plenty) and recompress with mozjpeg.
await replace('public/gameplay.jpeg', () =>
  sharp('public/gameplay.jpeg')
    .resize(1280, 720, { fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 80, mozjpeg: true })
)

// Boss GIFs are shown at 28–120px tall but ship at full mob-sheet resolution.
// Cap height at 240 (2x the largest on-page use) keeping the animation intact.
for (const gif of ['public/maple/mobs/zakum.gif', 'public/maple/mobs/horntail.gif']) {
  await replace(gif, () =>
    sharp(gif, { animated: true })
      .resize({ height: 240, fit: 'inside', withoutEnlargement: true })
      .gif()
  )
}
