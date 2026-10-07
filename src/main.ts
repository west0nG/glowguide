import '@fontsource/dm-sans/latin-400.css';
import '@fontsource/dm-sans/latin-500.css';
import '@fontsource/dm-sans/latin-600.css';
import '@fontsource/jost/latin-400.css';
import './style.css';
import { categories, categoryLabels, ingredientOriginLabels, getProduct, products, recommend, searchProducts, selectProduct } from './catalog';
import type { Category, Product } from './catalog';
import { icon } from './icons';

const app = document.querySelector<HTMLDivElement>('#app')!;
const dialog = document.querySelector<HTMLDialogElement>('#modal')!;
const dialogPanel = dialog.querySelector<HTMLDivElement>('.dialog-panel')!;
const toast = document.querySelector<HTMLDivElement>('#toast')!;
let query = '';
let category: Category = 'All';
let selected: string[] = [];
let toastTimer: ReturnType<typeof setTimeout>;
let scanTimer: ReturnType<typeof setTimeout> | undefined;
let scanId = products[0].id;
let scanning = false;
let pickerIndex = 0;
let dialogOrigin: HTMLElement | null = null;
let dialogMode: 'scan' | 'picker' | null = null;

const escape = (value: string) => value.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
const picture = (p: Product, className = '', eager = false) => `<img class="product-photo ${p.category === 'Blush' || p.category === 'Lip' ? 'packshot' : ''} ${className}" src="${p.image}" alt="${escape(p.name)} by ${escape(p.brand)}" loading="${eager ? 'eager' : 'lazy'}" width="800" height="800" />`;
const currentRoute = () => location.hash.replace(/^#/, '') || '/';
const isCompare = () => currentRoute() === '/compare';

function header(back = false, title = ''): string {
  return `<header class="app-header ${back ? 'inner-header' : ''}">
    ${back ? `<a href="#/" class="icon-button back-button" aria-label="Back to products">${icon('back')}</a><span class="header-title">${title}</span><span class="header-spacer"></span>` : `<a href="#/" class="wordmark" aria-label="GlowGuide home">GlowGuide</a>`}
  </header>`;
}

function navigation(): string {
  return `<nav class="app-nav" aria-label="Main navigation">
    <a href="#/" class="nav-item ${!isCompare() ? 'active' : ''}" ${!isCompare() ? 'aria-current="page"' : ''}>${icon('search')}<span>Discover</span></a>
    <button type="button" class="nav-item" data-action="scan">${icon('scan')}<span>Scan</span></button>
    <a href="#/compare" class="nav-item ${isCompare() ? 'active' : ''}" ${isCompare() ? 'aria-current="page"' : ''}><span class="nav-icon">${icon('compare')}${selected.length ? `<span class="nav-count">${selected.length}</span>` : ''}</span><span>Compare</span></a>
  </nav>`;
}

function searchField(value: string, mode: 'home' | 'picker'): string {
  return `<div class="search-field">${icon('search', 21)}<input type="search" id="${mode}-search" autocomplete="off" placeholder="Name, brand or ingredient" aria-label="Search ${mode === 'home' ? 'products' : 'products to compare'}" value="${escape(value)}" /><button class="icon-button clear-search" data-action="clear-search" data-mode="${mode}" aria-label="Clear search" ${!value ? 'hidden' : ''}>${icon('close', 17)}</button></div>`;
}

function card(p: Product): string {
  return `<article class="product-card">
    <div class="card-image ${p.tone}"><a href="#/product/${p.id}" aria-label="View ${escape(p.name)}">${picture(p, '', true)}</a></div>
    <a class="card-text" href="#/product/${p.id}"><span class="eyebrow">${p.brand}</span><h3>${p.name}</h3><p>${p.subtitle}</p></a>
  </article>`;
}

function homeResults(): string {
  const result = searchProducts(query, category);
  return `<div class="section-heading"><h2>${query ? 'Search results' : category === 'All' ? 'On the shelf' : categoryLabels[category]}</h2><span class="result-count" role="status">${result.length} products</span></div>
  ${result.length ? `<div class="product-grid">${result.map(card).join('')}</div>` : `<div class="empty-state">${icon('search', 32)}<h2>No products found.</h2><p>Try a brand, product name or ingredient.</p><button class="text-button" data-action="reset-search">Show all products ${icon('arrow', 17)}</button></div>`}`;
}

function renderHome(): string {
  return `${header()}<main class="main-content home-content" id="main">
    <div class="discovery-tools">${searchField(query, 'home')}
    <button class="scan-entry" data-action="scan"><span class="scan-entry-icon">${icon('scan', 27)}</span><strong>Scan the Product</strong>${icon('arrow', 21)}</button></div>
    <div class="category-tabs" role="group" aria-label="Product categories">${categories.map(c => `<button class="category-tab ${c === category ? 'selected' : ''}" data-action="category" data-category="${c}" aria-pressed="${c === category}">${categoryLabels[c]}</button>`).join('')}</div>
    <section id="home-results" aria-label="Product collection">${homeResults()}</section>
  </main>${navigation()}`;
}

function detail(p: Product): string {
  const glossary = p.ingredients.filter(i => i.korean);
  return `${header(true, 'Product notes')}<main class="main-content detail-content" id="main">
    <div class="detail-overview"><div class="detail-image ${p.tone}">${picture(p, '', true)}<span class="image-caption">${p.category} · ${p.size}</span></div>
    <div class="product-intro"><p class="eyebrow">${p.brand}</p><h1>${p.name}</h1><p class="product-subtitle">${p.subtitle}</p><p class="product-description">${p.description}</p></div></div>
    <section class="detail-section"><div class="section-heading"><h2>At a glance</h2><span class="tiny-label">01</span></div><dl class="glance-grid"><div><dt>Texture</dt><dd>${p.texture}</dd></div><div><dt>Finish</dt><dd>${p.finish}</dd></div><div class="wide"><dt>Focus</dt><dd>${p.focus}</dd></div></dl></section>
    <section class="detail-section"><div class="section-heading"><h2>What’s inside</h2><span class="tiny-label">02</span></div><div class="ingredients">${p.ingredients.map((item, index) => `<div class="ingredient"><span class="ingredient-number">0${index + 1}</span><div class="ingredient-content"><div class="ingredient-heading"><h3>${item.name}</h3><span class="ingredient-origin" aria-label="Ingredient origin: ${ingredientOriginLabels[item.origin]}">${ingredientOriginLabels[item.origin]}</span></div><p>${item.note}</p></div></div>`).join('')}</div></section>
    ${glossary.length ? `<details class="label-notes"><summary><span class="label-icon">${icon('language')}</span><span><strong>Read the label</strong><small>Korean → English</small></span>${icon('down', 18)}</summary><div class="glossary"><p class="glossary-caption">Example ingredient terms</p>${glossary.map(i => `<div class="glossary-row"><span lang="ko">${i.korean}</span><span>${i.name}</span></div>`).join('')}</div></details>` : ''}
    <section class="detail-section"><div class="section-heading"><h2>How to use</h2><span class="tiny-label">03</span></div><p class="body-copy">${p.use}</p></section>
    <a class="source-link" href="${p.source}" target="_blank" rel="noopener noreferrer">Product information from ${p.brand} ${icon('external', 13)}</a>
  </main>${navigation()}`;
}

function slot(index: number): string {
  const p = getProduct(selected[index] || '');
  if (!p) return `<button class="empty-slot" data-action="picker" data-index="${index}"><span class="slot-plus">${icon('plus', 22)}</span><strong>Add a product</strong><span>Search products</span></button>`;
  return `<article class="compare-slot"><div class="slot-image ${p.tone}">${picture(p, '', true)}<button class="remove-button" aria-label="Remove ${escape(p.name)} from comparison" data-action="remove" data-id="${p.id}">${icon('close', 15)}</button></div><span class="eyebrow">${p.brand}</span><h2>${p.name}</h2><button class="change-button" data-action="picker" data-index="${index}">Change ${icon('reset', 12)}</button></article>`;
}

function comparisonTable(a: Product, b: Product): string {
  const rows: [string, string, string][] = [
    ['Category', a.category, b.category],
    ['Key ingredients', a.ingredients.map(i => i.name).join(' · '), b.ingredients.map(i => i.name).join(' · ')],
    ['Texture', a.texture, b.texture],
    ['Finish', a.finish, b.finish],
    ['Focus', a.focus, b.focus],
    ['Size', a.size, b.size],
  ];
  if (a.shade || b.shade) rows.splice(1, 0, ['Shade', a.shade || '—', b.shade || '—']);
  const result = recommend(a, b);
  return `<section class="comparison-section"><table class="comparison-table"><caption class="sr-only">Comparison of ${a.name} and ${b.name}</caption><thead class="sr-only"><tr><th scope="col">${a.name}</th><th scope="col">${b.name}</th></tr></thead>${rows.map(([label, left, right]) => `<tbody><tr><th colspan="2" scope="rowgroup">${label}</th></tr><tr><td>${left}</td><td>${right}</td></tr></tbody>`).join('')}</table></section>
    <aside class="recommendation" aria-label="Product recommendations">${result.text ? `<p>${result.text}</p>` : ''}<div class="recommendation-options">${result.notes.map(note => `<p><strong>${note.name}</strong><span>${note.text}</span></p>`).join('')}</div></aside>`;
}

function compare(): string {
  const a = getProduct(selected[0] || ''); const b = getProduct(selected[1] || '');
  return `${header()}<main class="main-content compare-content" id="main" aria-label="Compare products"><div class="compare-slots">${slot(0)}${slot(1)}</div>
    ${a && b ? comparisonTable(a, b) : ''}
    ${selected.length ? `<button class="reset-comparison text-button" data-action="clear-pair">${icon('reset', 15)} Clear comparison</button>` : ''}
    </main>${navigation()}`;
}

function render(): void {
  const route = currentRoute();
  if (route === '/compare') app.innerHTML = compare();
  else if (route.startsWith('/product/')) {
    const p = getProduct(route.slice('/product/'.length));
    app.innerHTML = p ? detail(p) : `${header(true, 'Product notes')}<main class="main-content empty-state"><h1>Product not found.</h1><p>Browse the sample collection to find a product.</p><a class="primary-button" href="#/">Back to products</a></main>${navigation()}`;
  } else app.innerHTML = renderHome();
  document.title = route === '/compare' ? 'Compare · GlowGuide' : route.startsWith('/product/') ? `${getProduct(route.slice(9))?.name || 'Product'} · GlowGuide` : 'GlowGuide';
}

function notify(message: string): void {
  clearTimeout(toastTimer); toast.textContent = message; toast.classList.add('visible');
  toastTimer = setTimeout(() => toast.classList.remove('visible'), 2800);
}

function updateSelection(id: string, replacement?: number): boolean {
  const result = selectProduct(selected, id, replacement);
  if (result.status === 'full') {
    notify('Two products selected. Open Compare to change one.'); return false;
  }
  if (result.status === 'duplicate') { notify('This product is already in the comparison.'); return false; }
  if (result.status === 'invalid') return false;
  selected = result.ids; render();
  notify(result.status === 'removed' ? 'Removed from comparison.' : `${selected.length} of 2 products selected.`);
  return true;
}

function closeDialog(): void {
  clearTimeout(scanTimer); scanning = false; dialogMode = null;
  dialog.close(); dialogPanel.innerHTML = ''; dialog.className = '';
  if (dialogOrigin?.isConnected) dialogOrigin.focus();
  else app.querySelector<HTMLElement>(isCompare() ? '.change-button, .empty-slot' : '.scan-entry, .back-button')?.focus();
}

function openDialog(mode: 'scan' | 'picker'): void {
  if (!dialog.open) dialogOrigin = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  dialogMode = mode; dialog.className = mode === 'scan' ? 'scan-dialog' : 'picker-dialog';
  fitDialogToApp();
  if (!dialog.open) dialog.showModal();
}

// Native modal dialogs leave their parent's layout, so explicitly share the app frame.
function fitDialogToApp(): void {
  const bounds = app.getBoundingClientRect();
  const styles = getComputedStyle(app);
  const scale = parseFloat(styles.zoom) || 1;
  dialog.style.zoom = String(scale);
  dialog.style.left = `${bounds.left / scale}px`;
  dialog.style.top = `${bounds.top / scale}px`;
  dialog.style.width = `${bounds.width / scale}px`;
  dialog.style.height = `${bounds.height / scale}px`;
  dialog.style.borderRadius = styles.borderRadius;
}

function pickerResults(value: string): string {
  const result = searchProducts(value);
  return result.length ? result.map(p => {
    const unavailable = selected.some((id, index) => id === p.id && index !== pickerIndex);
    return `<button class="picker-product" data-action="pick" data-id="${p.id}" ${unavailable ? 'disabled' : ''}><span class="picker-image">${picture(p)}</span><span class="picker-info"><small>${p.brand}</small><strong>${p.name}</strong><span>${unavailable ? 'Already selected' : p.subtitle}</span></span>${icon(unavailable ? 'check' : 'plus', 18)}</button>`;
  }).join('') : '<div class="picker-empty"><p>No matching products.</p><small>Try a product name or ingredient.</small></div>';
}

function openPicker(index: number): void {
  pickerIndex = index; openDialog('picker');
  dialogPanel.innerHTML = `<div class="sheet-handle"></div><div class="dialog-heading"><div><p class="eyebrow">PRODUCT ${index + 1} OF 2</p><h2 id="modal-title">${selected[index] ? 'Change product' : 'Find a product'}</h2></div><button class="icon-button" data-action="close-dialog" aria-label="Close product picker">${icon('close')}</button></div>${searchField('', 'picker')}<div id="picker-results" class="picker-list">${pickerResults('')}</div>`;
  dialog.querySelector<HTMLInputElement>('input')?.focus();
}

function openScan(): void {
  scanning = false; clearTimeout(scanTimer);
  scanId = products[0].id;
  openDialog('scan'); renderScan();
  dialog.querySelector<HTMLButtonElement>('[data-action="close-dialog"]')?.focus();
}

function renderScan(): void {
  const p = getProduct(scanId)!;
  dialogPanel.innerHTML = `<div class="dialog-heading"><h2 id="modal-title">Scan a product</h2><button class="icon-button" data-action="close-dialog" aria-label="Close scanner">${icon('close')}</button></div>
    <div class="scan-view ${scanning ? 'is-scanning' : ''}"><span class="sample-badge">SAMPLE SCAN</span>${picture(p, '', true)}<div class="scan-corners"><i></i><i></i><i></i><i></i>${scanning ? '<div class="scan-line"></div>' : ''}</div>${scanning ? '<span class="scan-caption">Reading product details…</span>' : ''}</div>
    <p class="scan-product-name" role="status">${p.name}</p><div class="scan-samples" role="group" aria-label="Choose a sample product">${products.map(item => `<button data-action="scan-sample" data-id="${item.id}" class="sample-thumb ${item.id === scanId ? 'selected' : ''}" aria-label="Use ${escape(item.name)} sample" aria-pressed="${item.id === scanId}" ${scanning ? 'disabled' : ''}>${picture(item)}</button>`).join('')}</div>
    <button class="primary-button full-width" data-action="run-scan" ${scanning ? 'disabled' : ''}>${icon('scan', 20)}${scanning ? 'Reading label…' : 'Scan this sample'}</button>`;
}

function runScan(): void {
  if (scanning) return;
  scanning = true; renderScan();
  dialog.querySelector<HTMLButtonElement>('[data-action="close-dialog"]')?.focus();
  const id = scanId;
  scanTimer = setTimeout(() => {
    if (!dialog.open || dialogMode !== 'scan') return;
    closeDialog(); location.hash = `/product/${id}`;
  }, 950);
}

document.addEventListener('click', event => {
  const origin = event.target; if (!(origin instanceof Element)) return;
  const button = origin.closest<HTMLButtonElement>('[data-action]'); if (!button || button.disabled) return;
  const { action, id, index, mode } = button.dataset;
  switch (action) {
    case 'category':
      category = button.dataset.category as Category;
      render(); break;
    case 'remove': selected = selected.filter(p => p !== id); render(); notify('Product removed.'); break;
    case 'clear-pair': selected = []; render(); break;
    case 'picker': openPicker(Number(index)); break;
    case 'pick': if (updateSelection(id!, pickerIndex)) closeDialog(); break;
    case 'scan': openScan(); break;
    case 'close-dialog': closeDialog(); break;
    case 'scan-sample': scanId = id!; renderScan(); dialog.querySelector<HTMLButtonElement>(`[data-action="scan-sample"][data-id="${id}"]`)?.focus(); break;
    case 'run-scan': runScan(); break;
    case 'reset-search': query = ''; category = 'All'; render(); break;
    case 'clear-search': {
      const input = document.querySelector<HTMLInputElement>(`#${mode}-search`)!;
      input.value = ''; input.dispatchEvent(new Event('input', { bubbles: true })); input.focus(); break;
    }
  }
});

document.addEventListener('input', event => {
  const input = event.target; if (!(input instanceof HTMLInputElement)) return;
  if (input.id === 'home-search') {
    query = input.value; document.querySelector('#home-results')!.innerHTML = homeResults();
  } else if (input.id === 'picker-search') document.querySelector('#picker-results')!.innerHTML = pickerResults(input.value);
  else return;
  input.parentElement!.querySelector<HTMLButtonElement>('.clear-search')!.hidden = !input.value;
});

dialog.addEventListener('cancel', event => { event.preventDefault(); closeDialog(); });
dialog.addEventListener('keydown', event => {
  if (event.key !== 'Tab') return;
  const controls = [...dialog.querySelectorAll<HTMLElement>('button:not(:disabled), input, a[href], [tabindex="0"]')]
    .filter(element => element.getClientRects().length > 0);
  const first = controls[0]; const last = controls[controls.length - 1];
  if (!first || !last) return;
  if (event.shiftKey && (document.activeElement === first || !dialog.contains(document.activeElement))) {
    event.preventDefault(); last.focus();
  } else if (!event.shiftKey && (document.activeElement === last || !dialog.contains(document.activeElement))) {
    event.preventDefault(); first.focus();
  }
});
dialog.addEventListener('click', event => {
  if (event.target === dialog) closeDialog();
});
window.addEventListener('hashchange', () => {
  if (dialog.open) closeDialog();
  render();
  app.querySelector<HTMLElement>('h1')?.setAttribute('tabindex', '-1');
  app.querySelector<HTMLElement>('h1')?.focus({ preventScroll: true });
});

// Desktop previews keep the iPad canvas proportions; touch devices use their viewport.
function fitTabletPreview(): void {
  const styles = getComputedStyle(app);
  const width = parseFloat(styles.getPropertyValue('--tablet-width'));
  const height = parseFloat(styles.getPropertyValue('--tablet-height'));
  const scale = Math.min(1, (window.innerWidth - 48) / width, (window.innerHeight - 48) / height);
  app.style.setProperty('--preview-scale', String(Math.max(0.1, scale)));
  if (dialog.open) fitDialogToApp();
}
window.addEventListener('resize', fitTabletPreview);
const syncOpenDialog = () => { if (dialog.open) fitDialogToApp(); };
new ResizeObserver(syncOpenDialog).observe(app);
window.addEventListener('scroll', syncOpenDialog, { passive: true });
window.visualViewport?.addEventListener('resize', syncOpenDialog);
window.visualViewport?.addEventListener('scroll', syncOpenDialog);
fitTabletPreview();
render();
