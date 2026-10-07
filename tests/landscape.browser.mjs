import assert from 'node:assert/strict';
export async function checkLandscape(page, baseUrl='http://localhost:5175/') {
 const sizes=[[900,800,false],[360,800,true],[820,1180,true],[1280,868,false]];
 const routes=['','#/consultation','#/compare','#/product/dynasty-cream'];
 async function verify(label) {
  const result=await page.evaluate(()=>{
   const a=document.querySelector('#app'),r=a.getBoundingClientRect(),m=document.querySelector('#main');
   return {logical:[a.offsetWidth,a.offsetHeight],canvas:[r.width,r.height],viewport:[innerWidth,innerHeight],zoom:Number(getComputedStyle(a).zoom),inside:r.left>=-1&&r.top>=-1&&r.right<=innerWidth+1&&r.bottom<=innerHeight+1,pageOverflow:document.documentElement.scrollWidth-innerWidth,mainOverflow:m.scrollWidth-m.clientWidth,columns:document.querySelector('.product-grid')?getComputedStyle(document.querySelector('.product-grid')).gridTemplateColumns.split(' ').length:null};
  });
  assert.deepEqual(result.logical,[1180,820],label);
  assert.ok(Math.abs(result.canvas[0]/result.canvas[1]-1180/820)<.002,label);
  assert.ok(result.inside&&result.pageOverflow<=1&&result.mainOverflow<=1,`${label} ${JSON.stringify(result)}`);
  if(result.columns!==null) assert.equal(result.columns,4,label);
  if(result.viewport[0]===1280) assert.equal(result.zoom,1,label);
  return result;
 }
 async function modal(label) {
  await page.waitForFunction(()=>document.querySelector('.dialog-panel').getAnimations().every(a=>a.playState==='finished'));
  const result=await page.evaluate(()=>{
   const a=document.querySelector('#app'),d=document.querySelector('dialog'),p=document.querySelector('.dialog-panel');
   const box=e=>{const r=e.getBoundingClientRect();return [r.x,r.y,r.width,r.height,r.right,r.bottom];};
   return {app:box(a),dialog:box(d),panel:box(p),zoom:[getComputedStyle(a).zoom,getComputedStyle(d).zoom]};
  });
  result.app.forEach((v,i)=>assert.ok(Math.abs(v-result.dialog[i])<1,`${label}: overlay alignment`));
  assert.equal(result.zoom[0],result.zoom[1]);
  assert.ok(result.panel[0]>=result.app[0]-1&&result.panel[1]>=result.app[1]-1&&result.panel[4]<=result.app[4]+1&&result.panel[5]<=result.app[5]+1,`${label}: panel inside canvas`);
 }
 const measurements=[];
 for(const [width,height,touch] of sizes) {
  await page.cdp('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:touch});
  await page.cdp('Emulation.setTouchEmulationEnabled',{enabled:touch});
  for(const route of routes) {
   await page.goto('about:blank');await page.goto(baseUrl+route);
   await page.waitForSelector('#main');await verify(`${width} first ${route}`);
   await page.reload();await page.waitForSelector('#main');await verify(`${width} refresh ${route}`);
  }
  await page.click('.app-nav a[href="#/consultation"]');
  await page.click('input[value="Combination"]');await page.click('[data-action="consultation-next"]');
  await page.click('input[value="Dryness"]');await page.click('[data-action="consultation-back"]');
  assert.equal(await page.evaluate(()=>document.querySelector('input:checked').value),'Combination');
  await page.click('.app-nav a[href="#/compare"]');await page.click('[data-action="picker"][data-index="0"]');
  await modal(`${width} picker`);await page.fill('#picker-search','Rare');await page.waitForFunction(()=>!document.querySelector('[data-motion]')&&document.getAnimations().every(a=>a.playState==='finished'));
  await page.click('[data-action="pick"][data-id="rare-blush"]');
  assert.equal(await page.evaluate(()=>document.querySelector('[data-action="remove"]')?.dataset.id),'rare-blush', `Picker selection at ${width}x${height}`);
  await page.click('.app-nav [data-action="scan"]');await modal(`${width} scan`);await page.keyboard.press('Escape');
  await page.click('.app-nav a[href="#/"]');await page.waitForFunction(()=>!document.querySelector('[data-motion]'));
  measurements.push({width,height,...await verify(`${width} final`)});
  await page.screenshot({path:`/tmp/landscape-default-${width}.png`});
 }
 console.log('PASS default landscape: 4 viewport shapes × 4 direct routes × first visit/refresh, native questionnaire/picker actions and both modal alignments.');
 console.log(measurements);
}
