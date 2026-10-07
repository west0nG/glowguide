import assert from 'node:assert/strict';
export async function checkMotionCoverage(page, baseUrl='http://localhost:5175/') {
 const settled=()=>page.waitForFunction(()=>!document.querySelector('[data-motion]'));
 const clean=async()=>{await settled();assert.equal(await page.evaluate(()=>[...document.querySelectorAll('.product-card,.picker-product,.glossary-row,.nav-confirm,.slot-image')].some(e=>e.style.transform||e.style.opacity)),false);};
 await page.cdp('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'no-preference'}]});
 await page.goto(baseUrl); await page.reload();
 // A real pointer hold produces card feedback without hover or navigation.
 const point=await page.evaluate(()=>{const r=document.querySelector('.card-image a').getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2};});
 await page.mouse.move(point.x,point.y);await page.mouse.down();
 assert.equal(await page.evaluate(()=>document.querySelector('.card-image a').dataset.motion),'press');
 await page.mouse.move(180,105);await page.mouse.up();await settled();
 assert.equal(await page.evaluate(()=>location.hash),'');
 const reflow=await page.evaluate(async()=>{
  document.querySelector('[data-category="Lip"]').click();
  const root=document.querySelector('#home-results'),card=root.querySelector('.product-card');
  const active=root.dataset.motion;
  await new Promise(r=>setTimeout(r,70));
  return {active,transform:getComputedStyle(card).transform,ids:[...root.querySelectorAll('[data-motion-key]')].map(n=>n.dataset.motionKey)};
 });
 assert.equal(reflow.active,'results');assert.notEqual(reflow.transform,'none');assert.deepEqual(reflow.ids,['rare-lip-oil','rhode-lip','fenty-gloss']);
 // Multiple changes in one frame are intentional stress, with native click/input events.
 await page.evaluate(()=>{for(const category of ['All','Blush','Lip','All'])document.querySelector(`[data-category="${category}"]`).click();const input=document.querySelector('#home-search');for(const value of ['R','Rh','Rare','no-match']){input.value=value;input.dispatchEvent(new Event('input',{bubbles:true}));}});
 assert.equal(await page.evaluate(()=>document.querySelectorAll('.product-card').length),0);
 await page.click('[data-action="reset-search"]');await clean();
 assert.equal(await page.evaluate(()=>document.querySelectorAll('.product-card').length),10);
 await page.fill('#home-search','Rare');await clean();
 assert.equal(await page.evaluate(()=>document.activeElement.id),'home-search');
 assert.equal(await page.evaluate(()=>document.querySelectorAll('.product-card').length),2);
 await page.click('[data-action="clear-search"][data-mode="home"]');await clean();
 // Real navigation gets only the active marker, not a whole-page transition.
 const nav=await page.evaluate(async()=>{document.querySelector('.app-nav a[href="#/compare"]').click();await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));return {active:document.querySelector('.nav-confirm[data-motion]')?.dataset.motion,main:getComputedStyle(document.querySelector('#main')).transform};});
 assert.deepEqual(nav,{active:'navigation',main:'none'});
 await page.click('[data-action="picker"][data-index="0"]');
 const picker=await page.evaluate(async()=>{const input=document.querySelector('#picker-search');input.value='Fenty';input.dispatchEvent(new Event('input',{bubbles:true}));const root=document.querySelector('#picker-results');await new Promise(r=>setTimeout(r,60));return {active:root.dataset.motion,transform:getComputedStyle(root.querySelector('.picker-product')).transform,count:root.children.length};});
 assert.equal(picker.active,'picker-results');assert.notEqual(picker.transform,'none');assert.equal(picker.count,2);
 const confirm=await page.evaluate(()=>{document.querySelector('[data-action="pick"][data-id="fenty-gloss"]').click();return {active:document.querySelector('.compare-slot').dataset.motion,open:document.querySelector('dialog').open};});
 assert.deepEqual(confirm,{active:'slot',open:false});await clean();
 // Close an animating list; no style changes can continue on its detached nodes.
 await page.click('[data-action="picker"][data-index="1"]');
 const disabled=await page.evaluate(async()=>{const input=document.querySelector('#picker-search');input.value='Fenty';input.dispatchEvent(new Event('input',{bubbles:true}));await new Promise(r=>setTimeout(r,120));const button=document.querySelector('[data-id="fenty-gloss"][data-action="pick"]');return {disabled:button.disabled,opacity:Number(getComputedStyle(button).opacity)};});
 assert.ok(disabled.disabled && disabled.opacity <= .65,JSON.stringify(disabled));
 const closed=await page.evaluate(async()=>{const input=document.querySelector('#picker-search');input.value='Rhode';input.dispatchEvent(new Event('input',{bubbles:true}));const root=document.querySelector('#picker-results');document.querySelector('[data-action="close-dialog"]').click();let writes=0;const observer=new MutationObserver(r=>writes+=r.length);observer.observe(root,{attributes:true,subtree:true});await new Promise(r=>setTimeout(r,550));observer.disconnect();return {writes,marker:root.hasAttribute('data-motion')};});
 assert.deepEqual(closed,{writes:0,marker:false});
 await page.evaluate(()=>location.hash='/product/dynasty-cream');await page.waitForSelector('.label-notes');
 await page.click('.label-notes summary');
 assert.equal(await page.evaluate(()=>document.querySelector('.label-notes').dataset.motion),'glossary');
 await page.evaluate(()=>{const d=document.querySelector('.label-notes');d.open=false;});
 await clean();assert.equal(await page.evaluate(()=>document.querySelector('.label-notes').open),false);
 await page.focus('.label-notes summary');await page.keyboard.press('Enter');await clean();
 assert.equal(await page.evaluate(()=>document.querySelector('.label-notes').open),true);
 // Toggle the OS preference while content is moving, then exercise all new surfaces.
 await page.click('.app-nav a[href="#/"]');
 await page.evaluate(()=>document.querySelector('[data-category="Lip"]').click());
 await page.cdp('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});await clean();
 await page.fill('#home-search','Rhode');assert.equal(await page.evaluate(()=>document.querySelectorAll('.product-card').length),1);await clean();
 await page.click('.app-nav a[href="#/compare"]');await clean();
 await page.click('[data-action="picker"][data-index="1"]');await page.fill('#picker-search','Rare');await clean();
 await page.click('[data-action="pick"][data-id="rare-blush"]');await clean();
 await page.evaluate(()=>location.hash='/product/dynasty-cream');await page.waitForSelector('.label-notes');
 await page.click('.label-notes summary');await clean();
 assert.equal(await page.evaluate(()=>getComputedStyle(document.querySelector('.glossary-row')).opacity),'1');
 await page.cdp('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'no-preference'}]});
 // A repeated navigation/dialog cycle must not multiply delegated listeners.
 const doc=await page.cdp('Runtime.evaluate',{expression:'document',objectGroup:'motion-listeners'});
 const listeners=await page.cdp('DOMDebugger.getEventListeners',{objectId:doc.result.objectId});
 for(let i=0;i<3;i++) {await page.click('.app-nav a[href="#/compare"]');await page.click('[data-action="picker"][data-index="1"]');await page.fill('#picker-search',i%2?'Rhode':'Rare');await page.focus('[data-action="close-dialog"]');await page.keyboard.press('Escape');await page.click('.app-nav a[href="#/"]');}
 const after=await page.cdp('DOMDebugger.getEventListeners',{objectId:doc.result.objectId});
 assert.equal(after.listeners.length,listeners.listeners.length);
 await page.cdp('Runtime.releaseObjectGroup',{objectGroup:'motion-listeners'});await clean();
 console.log('PASS expanded coverage: pointer product press, category reflow, rapid search/filter/empty/reset, navigation marker, picker filtering/first-slot confirmation/cancel cleanup, keyboard glossary open/close, live reduced-motion for all new surfaces, stable document listener count.');
}
