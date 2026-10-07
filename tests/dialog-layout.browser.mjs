import assert from 'node:assert/strict';

// Run with an Ego Browser Page; the caller owns the task space and its lifecycle.
export async function checkDialogLayout(page, baseUrl = 'http://localhost:5173/') {
  const sizes = [
    [900, 800, false], // Regression: the old 600px dialog exceeded the 523px app.
    [1440, 900, false],
    [1024, 700, false],
    [900, 1100, false],
    [820, 1180, true],
    [1180, 820, true],
    [360, 800, true],
  ];

  async function resize([width, height, touch]) {
    await page.cdp('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: touch });
    await page.cdp('Emulation.setTouchEmulationEnabled', { enabled: touch });
    await page.waitForFunction(() => {
      const app = document.querySelector('#app').getBoundingClientRect();
      const modal = document.querySelector('#modal');
      if (!modal.open) return true;
      const overlay = modal.getBoundingClientRect();
      return ['x', 'y', 'width', 'height'].every(key => Math.abs(app[key] - overlay[key]) < 1);
    });
  }

  async function checkBounds(label) {
    await page.waitForFunction(() => document.querySelector('.dialog-panel').getAnimations().every(a => a.playState === 'finished'));
    const result = await page.evaluate(() => {
      const app = document.querySelector('#app');
      const modal = document.querySelector('#modal');
      const panel = document.querySelector('.dialog-panel');
      const rect = element => {
        const { x, y, width, height, right, bottom } = element.getBoundingClientRect();
        return { x, y, width, height, right, bottom };
      };
      const action = modal.querySelector('[data-action="run-scan"]');
      return {
        app: rect(app), overlay: rect(modal), panel: rect(panel),
        close: rect(modal.querySelector('[data-action="close-dialog"]')),
        action: action ? rect(action) : null,
        appZoom: getComputedStyle(app).zoom, modalZoom: getComputedStyle(modal).zoom,
        backdrop: getComputedStyle(modal, '::backdrop').backgroundColor,
        appRadius: getComputedStyle(app).borderRadius, modalRadius: getComputedStyle(modal).borderRadius,
        panelOverflow: panel.scrollWidth - panel.clientWidth,
        pageOverflow: document.documentElement.scrollWidth - window.innerWidth,
      };
    });
    const inside = (inner, outer) => inner.x >= outer.x - 1 && inner.y >= outer.y - 1
      && inner.right <= outer.right + 1 && inner.bottom <= outer.bottom + 1;
    for (const key of ['x', 'y', 'width', 'height']) {
      assert.ok(Math.abs(result.app[key] - result.overlay[key]) < 1, `${label}: overlay ${key}`);
    }
    assert.equal(result.appZoom, result.modalZoom, `${label}: uniform scale`);
    assert.equal(result.appRadius, result.modalRadius, `${label}: frame corners`);
    assert.equal(result.backdrop, 'rgba(0, 0, 0, 0)', `${label}: outer desktop stays undimmed`);
    assert.ok(inside(result.panel, result.app), `${label}: panel inside app`);
    assert.ok(inside(result.close, result.panel), `${label}: close button visible`);
    if (result.action) assert.ok(inside(result.action, result.panel), `${label}: scan action visible`);
    assert.ok(result.panelOverflow <= 1 && result.pageOverflow <= 1, `${label}: no horizontal overflow`);
  }

  await page.goto(baseUrl);
  await resize(sizes[0]);
  await page.click('.scan-entry');
  await page.click('[data-action="scan-sample"][data-id="rhode-blush"]');
  for (const size of sizes) {
    await resize(size);
    await checkBounds(`scan ${size.join('x')}`);
    assert.equal(await page.evaluate(() => document.querySelector('.sample-thumb.selected').dataset.id), 'rhode-blush');
  }
  await page.keyboard.press('Escape');
  assert.equal(await page.evaluate(() => document.activeElement.matches('.scan-entry')), true, 'restore scanner opener');

  await page.click('.app-nav a[href="#/compare"]');
  await page.click('[data-action="picker"][data-index="0"]');
  await page.fill('#picker-search', 'Rare');
  for (const size of sizes) {
    await resize(size);
    await checkBounds(`picker ${size.join('x')}`);
    assert.equal(await page.evaluate(() => document.querySelector('#picker-search').value), 'Rare', 'preserve query on resize');
  }
  await page.click('[data-action="pick"][data-id="rare-blush"]');
  await page.click('[data-action="picker"][data-index="1"]');
  assert.equal(await page.evaluate(() => document.querySelector('[data-action="pick"][data-id="rare-blush"]').disabled), true);
  await page.click('[data-action="pick"][data-id="rhode-blush"]');

  // A scan still opens standalone details and leaves the comparison pair intact.
  await page.click('.app-nav [data-action="scan"]');
  await page.click('[data-action="scan-sample"][data-id="glow-serum"]');
  await page.click('[data-action="run-scan"]');
  await page.waitForFunction(() => location.hash === '#/product/glow-serum' && !document.querySelector('#modal').open);
  await page.click('.app-nav a[href="#/compare"]');
  const pair = await page.evaluate(() => [...document.querySelectorAll('[data-action="remove"]')].map(e => e.dataset.id));
  assert.deepEqual(pair, ['rare-blush', 'rhode-blush']);

  await resize(sizes[0]);
  await page.click('.app-nav [data-action="scan"]');
  await page.focus('[data-action="run-scan"]');
  await page.keyboard.press('Tab');
  assert.equal(await page.evaluate(() => document.activeElement.dataset.action), 'close-dialog', 'forward focus trap');
  await page.keyboard.press('Shift+Tab');
  assert.equal(await page.evaluate(() => document.activeElement.dataset.action), 'run-scan', 'reverse focus trap');
  const beforeCancel = await page.url();
  await page.evaluate(() => {
    document.querySelector('[data-action="run-scan"]').click();
    document.querySelector('[data-action="close-dialog"]').click();
  });
  // A negative timer assertion must wait past the 950ms recognition delay.
  await page.waitForTimeout(1100);
  assert.equal(await page.url(), beforeCancel, 'cancel prevents delayed navigation');
  await page.click('.app-nav [data-action="scan"]');
  const backdropPoint = await page.evaluate(() => {
    const r = document.querySelector('#modal').getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + 8 };
  });
  await page.mouse.click(backdropPoint.x, backdropPoint.y);
  assert.equal(await page.evaluate(() => document.querySelector('#modal').open), false, 'backdrop dismisses');

  console.log(`PASS: Scan and picker at ${sizes.length} viewport/input combinations, open-dialog resize, focus, and scan/comparison independence.`);
}
