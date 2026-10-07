import assert from 'node:assert/strict';
export async function checkNewFeatures(page, baseUrl='http://localhost:5175/') {
 await page.goto(baseUrl);await page.reload();
 assert.equal(await page.evaluate(()=>document.querySelector('.app-nav [aria-current="page"]').textContent.trim()),'Discover');
 assert.deepEqual(await page.evaluate(()=>[...document.querySelector('.app-nav').children].map(n=>n.textContent.trim())),['Consultation','Discover','Scan','Compare']);
 const read=()=>page.evaluate(()=>{const n=document.querySelector('.pair-suggestion');return n?{id:n.dataset.productId,slot:n.dataset.slot,text:n.textContent,last:n===document.querySelector('#main').lastElementChild}:null;});
 const pick=async(index,id)=>{await page.click(`[data-action="picker"][data-index="${index}"]`);await page.waitForFunction(()=>document.getAnimations().every(a=>a.playState==='finished')&&!document.querySelector('[data-motion]'));await page.click(`[data-action="pick"][data-id="${id}"]`);await page.waitForFunction(()=>!document.querySelector('dialog').open);};
 await page.click('.app-nav a[href="#/compare"]');assert.equal(await read(),null);
 await pick(0,'rare-blush');assert.equal(await read(),null);
 await page.click('[data-action="picker"][data-index="1"]');
 assert.equal(await page.evaluate(()=>document.querySelector('[data-action="pick"][data-id="rare-blush"]').disabled),true);
 await page.click('[data-action="pick"][data-id="rhode-blush"]');
 const first=await read();assert.ok(first&&['rare-blush','rhode-blush'].includes(first.id));
 assert.equal(first.slot,first.id==='rare-blush'?'A':'B');assert.equal(first.last,true);assert.ok(!/demo|演示/i.test(first.text));
 assert.ok(first.text.includes(first.id==='rare-blush'?'Soft Pinch Liquid Blush':'Pocket Blush'));
 await page.click('.app-nav a[href="#/consultation"]');await page.click('.app-nav a[href="#/compare"]');assert.deepEqual(await read(),first);
 await page.click('.app-nav [data-action="scan"]');await page.keyboard.press('Escape');assert.deepEqual(await read(),first);
 await pick(1,'fenty-gloss');const changed=await read();assert.ok(changed&&['rare-blush','fenty-gloss'].includes(changed.id));
 await page.click('[data-action="remove"][data-id="rare-blush"]');assert.equal(await read(),null);
 await page.click('[data-action="clear-pair"]');assert.equal(await read(),null);
 await pick(0,'rare-blush');await pick(1,'rhode-blush');assert.deepEqual(await read(),first);
 await page.reload();assert.equal(await read(),null);
 console.log('PASS new features: Consultation first/default Discover; 0/1/duplicate/2/remove/clear/change pair states; session-stable A/B and matching product name; bottom placement; no demo label.');
}
