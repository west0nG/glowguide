import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createPairSuggestion } from '../src/pair-suggestion.ts';
test('suggestion is absent until two distinct products are selected',()=>{
 const pick=createPairSuggestion();for(const ids of [[],['a'],['a','a'],['','a'],['a','b','c']])assert.equal(pick(ids),null);
});
test('random choice can select either A or B',()=>{
 assert.deepEqual(createPairSuggestion(()=>0)(['a','b']),{id:'a',slot:'A'});
 assert.deepEqual(createPairSuggestion(()=>.9)(['a','b']),{id:'b',slot:'B'});
});
test('same unordered pair stays stable while its displayed slot follows order',()=>{
 let calls=0;const pick=createPairSuggestion(()=>{calls++;return .8;});
 assert.deepEqual(pick(['a','b']),{id:'b',slot:'B'});
 assert.deepEqual(pick(['a','b']),{id:'b',slot:'B'});
 assert.deepEqual(pick(['b','a']),{id:'b',slot:'A'});assert.equal(calls,1);
});
test('removing hides the suggestion, a different pair draws anew, session reset clears choices',()=>{
 let calls=0;const pick=createPairSuggestion(()=>calls++===0?0:.9);
 assert.equal(pick(['a','b'])?.id,'a');assert.equal(pick(['a']),null);
 assert.equal(pick(['a','c'])?.id,'c');assert.equal(calls,2);
 assert.equal(pick(['a','b'])?.id,'a');assert.equal(calls,2);
 assert.equal(createPairSuggestion(()=>.9)(['a','b'])?.id,'b');
});
