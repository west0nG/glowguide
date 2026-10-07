import assert from 'node:assert/strict';
export async function checkMotion(page, baseUrl='http://localhost:5175/') {
 await page.cdp('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'no-preference'}]});
 await page.goto(baseUrl+'#/consultation'); await page.reload();
 await page.click('input[value="Dry"]');
 await page.focus('input[value="Oily"]'); await page.keyboard.press('Space');
 await page.waitForFunction(()=>!document.querySelector('[data-motion]'));
 assert.deepEqual(await page.evaluate(()=>[...document.querySelectorAll('input:checked')].map(e=>e.value)),['Oily']);
 const choice=await page.evaluate(async()=>{
  const input=document.querySelector('input[value="Combination"]'); input.click();
  const owner=input.closest('fieldset');
  const started=owner.dataset.motion==='choice';
  await new Promise(r=>setTimeout(r,90));
  const stroke=parseFloat(getComputedStyle(input.parentElement.querySelector('.choice-check')).strokeDashoffset);
  return {started,stroke};
 });
 assert.ok(choice.started && choice.stroke>0 && choice.stroke<100,JSON.stringify(choice));
 // Cancel during a tween and watch its detached DOM for late writes.
 const cancellation=await page.evaluate(async()=>{
  document.querySelector('input[value="Dry"]').click();
  const old=document.querySelector('fieldset');
  document.querySelector('[data-action="consultation-next"]').click();
  let writes=0;const observer=new MutationObserver(records=>writes+=records.length);
  observer.observe(old,{subtree:true,attributes:true});
  await new Promise(r=>setTimeout(r,500));observer.disconnect();
  return {writes,marker:old.hasAttribute('data-motion'),styles:[...old.querySelectorAll('[style]')].some(n=>n.getAttribute('style')?.trim())};
 });
 assert.deepEqual(cancellation,{writes:0,marker:false,styles:false});
 await page.evaluate(()=>{const a=document.querySelector('input[value="Dryness"]'),b=document.querySelector('input[value="Rough texture"]');a.click();b.click();a.click();});
 await page.waitForFunction(()=>!document.querySelector('[data-motion]'));
 assert.deepEqual(await page.evaluate(()=>[...document.querySelectorAll('input:checked')].map(e=>e.value)),['Rough texture']);
 await page.click('[data-action="new-customer"]');
 await page.evaluate(()=>document.querySelector('input[value="Dry"]').click());
 await page.cdp('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
 await page.waitForFunction(()=>!document.querySelector('[data-motion]'));
 assert.equal(await page.evaluate(()=>getComputedStyle(document.querySelector('input:checked + svg .choice-check')).opacity),'1');
 await page.evaluate(()=>document.querySelector('input[value="Oily"]').click());
 assert.equal(await page.evaluate(()=>document.querySelector('[data-motion]')),null);
 await page.cdp('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'no-preference'}]});
 await page.click('.app-nav a[href="#/compare"]');
 for(const [index,id] of [[0,'rare-blush'],[1,'fenty-gloss']]) {
  await page.click(`[data-action="picker"][data-index="${index}"]`);
  await page.click(`[data-action="pick"][data-id="${id}"]`);
 }
 await page.waitForFunction(()=>!document.querySelector('[data-motion]'));
 assert.equal(await page.evaluate(()=>document.querySelectorAll('.pair-link').length),1);
 await page.click('[data-action="picker"][data-index="1"]');
 const pair=await page.evaluate(()=>{document.querySelector('[data-action="pick"][data-id="rhode-lip"]').click();return {motion:document.querySelector('.compare-slots').dataset.motion,modal:document.querySelector('dialog').open};});
 assert.deepEqual(pair,{motion:'pair',modal:false});
 await page.click('[data-action="remove"][data-id="rhode-lip"]');
 assert.equal(await page.evaluate(()=>document.querySelector('.pair-link, [data-motion]')),null);
 await page.click('.app-nav [data-action="scan"]');
 const scan=await page.evaluate(async()=>{document.querySelector('[data-action="run-scan"]').click();const owner=document.querySelector('.scan-view');const motion=owner.dataset.motion;await new Promise(r=>setTimeout(r,250));return {motion,transform:getComputedStyle(owner.querySelector('.scan-line')).transform};});
 assert.equal(scan.motion,'scan');assert.notEqual(scan.transform,'none');
 await page.keyboard.press('Escape');
 await page.click('.app-nav [data-action="scan"]');
 await page.evaluate(()=>new Promise(r=>setTimeout(r,1000)));
 assert.equal(await page.evaluate(()=>location.hash),'#/compare');
 assert.equal(await page.evaluate(()=>document.querySelector('[data-motion], .scan-line')),null);
 await page.cdp('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
 await page.evaluate(()=>document.querySelector('[data-action="run-scan"]').click());
 assert.deepEqual(await page.evaluate(()=>({motion:!!document.querySelector('[data-motion]'),beam:getComputedStyle(document.querySelector('.scan-line')).opacity})),{motion:false,beam:'0'});
 await page.waitForFunction(()=>location.hash.startsWith('#/product/'));
 assert.equal(await page.evaluate(()=>document.querySelector('[data-motion]')),null);
 await page.cdp('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'no-preference'}]});
 console.log('PASS GSAP: live stroke/beam, keyboard/radio/multi-select, rapid replacement/removal, zero detached-node writes, mid-animation reduced-motion cleanup, static reduced-motion confirmation, scan cancel/reopen, completed scan route.');
}
