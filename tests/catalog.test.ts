import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getProduct, products, searchProducts, selectProduct, recommend } from '../src/catalog.ts';

test('consultant can search ingredients, Korean label terms, and combined brand/name', () => {
  assert.deepEqual(searchProducts('  쌀겨수  ').map(p => p.id), ['dynasty-cream']);
  assert.equal(searchProducts('niacinamide').length, 2);
  assert.deepEqual(searchProducts('JOSEON plum').map(p => p.id), ['green-plum-cleanser']);
  assert.equal(searchProducts('', 'Moisturizer').length, 2);
  assert.equal(searchProducts('something not in the catalog').length, 0);
});

test('new brands have separate searchable products across blush and lip categories', () => {
  for (const brand of ['Rare Beauty', 'Rhode', 'Fenty Beauty']) {
    const matches = searchProducts(brand);
    assert.equal(matches.length, 2);
    assert.deepEqual(new Set(matches.map(p => p.category)), new Set(['Blush', 'Lip']));
    assert.ok(matches.every(p => p.ingredients.every(i => !i.korean)));
  }
  assert.deepEqual(searchProducts('RARE hope', 'Lip').map(p => p.id), ['rare-lip-oil']);
  assert.deepEqual(searchProducts('rhode peptide', 'Lip').map(p => p.id), ['rhode-lip']);
  assert.equal(searchProducts('', 'Blush').length, 3);
  assert.equal(searchProducts('', 'Lip').length, 3);
  assert.equal(new Set(products.map(p => p.id)).size, products.length);
});

test('comparison keeps a maximum of two distinct products and supports replacement', () => {
  const first = selectProduct([], products[0].id);
  const pair = selectProduct(first.ids, products[1].id);
  assert.equal(selectProduct(pair.ids, products[2].id).status, 'full');
  assert.deepEqual(selectProduct(pair.ids, products[2].id, 0).ids, [products[2].id, products[1].id]);
  assert.equal(selectProduct(pair.ids, products[1].id, 0).status, 'duplicate');
  assert.deepEqual(selectProduct(pair.ids, products[0].id).ids, [products[1].id]);
  assert.deepEqual(selectProduct([], products[0].id, 1).ids, [products[0].id]);
  assert.equal(selectProduct(pair.ids, 'missing').status, 'invalid');
});

test('recommendations follow each pair without assuming every category is a moisturizer', () => {
  const blush = getProduct('rare-blush')!;
  const creamBlush = getProduct('rhode-blush')!;
  const lip = getProduct('rhode-lip')!;
  const same = recommend(blush, creamBlush);
  assert.equal(same.text, '');
  assert.match(same.notes[0].text, /liquid color/);
  assert.match(same.notes[1].text, /cheeks and lips/);
  const lips = recommend(lip, getProduct('fenty-gloss')!);
  assert.match(lips.notes[0].text, /unscented/);
  assert.match(lips.notes[1].text, /shimmer/);
  const mixed = recommend(blush, lip);
  assert.match(mixed.text, /different purposes/);
  assert.deepEqual(mixed.notes.map(p => p.name), [blush.name, lip.name]);
  const reversed = recommend(creamBlush, blush);
  assert.deepEqual(reversed.notes.map(p => p.name), [creamBlush.name, blush.name]);
  const moisturizers = recommend(getProduct('dynasty-cream')!, getProduct('red-bean-gel')!);
  assert.match(moisturizers.notes[0].text, /richer moisturizer/);
});
