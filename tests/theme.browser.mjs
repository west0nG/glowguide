import assert from 'node:assert/strict';
export async function checkTheme(page, baseUrl='http://localhost:5173/') {
 const sizes=[[820,1180,true],[1180,820,true],[900,800,false],[360,800,true]];
 for(const [width,height,touch] of sizes) {
  await page.goto(baseUrl); await page.reload();
  await page.cdp('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:touch});
  await page.cdp('Emulation.setTouchEmulationEnabled',{enabled:touch});
  const capture=async name=>{
   await page.waitForFunction(()=>document.getAnimations().every(a=>a.playState==='finished') && !document.querySelector('.toast.visible, [data-motion]'));
   await page.waitForFunction(()=>[...document.querySelectorAll('img')].filter(i=>i.getBoundingClientRect().top<innerHeight).every(i=>i.complete));
   const b=await page.evaluate(()=>({page:document.documentElement.scrollWidth-innerWidth,main:document.querySelector('#main').scrollWidth-document.querySelector('#main').clientWidth,gradient:getComputedStyle(document.querySelector('#app')).backgroundImage,heading:getComputedStyle(document.querySelector('h1,h2,.wordmark')).fontFamily}));
   assert.ok(b.page<=1&&b.main<=1,`${name} ${width}: overflow ${JSON.stringify(b)}`);assert.ok(b.gradient.includes('linear-gradient'));assert.ok(b.heading.includes('Asul'));
   await page.screenshot({path:`/tmp/global-${width}-${name}.png`});
  };
  await capture('home');
  await page.fill('#home-search','Rare');assert.equal(await page.evaluate(()=>document.querySelectorAll('.product-card').length),2);await capture('search');
  await page.fill('#home-search','unmatchedzz');await capture('empty-search');await page.click('[data-action="reset-search"]');
  await page.click('[data-category="Moisturizer"]');
  await page.click('a[aria-label="View Dynasty Cream"]');await capture('detail');await page.click('.label-notes summary');await capture('glossary');
  await page.click('.app-nav a[href="#/compare"]');await capture('empty-compare');await page.click('[data-action="picker"][data-index="0"]');await capture('picker');
  await page.fill('#picker-search','Rare');await page.click('[data-action="pick"][data-id="rare-blush"]');
  await page.click('[data-action="picker"][data-index="1"]');await page.click('[data-action="pick"][data-id="rhode-blush"]');await capture('compare');
  await page.hover('.recommendation');await capture('recommendation');
  await page.click('.app-nav [data-action="scan"]');await capture('scanner');await page.keyboard.press('Escape');
  await page.click('.app-nav a[href="#/consultation"]');await capture('consultation');
 }
 console.log('PASS full-theme visible states across four sizes: home, search, empty search, detail, glossary, empty compare, picker, compare, recommendation, scanner, consultation.');
}
