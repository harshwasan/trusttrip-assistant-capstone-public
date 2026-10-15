import assert from 'node:assert/strict';
import test from 'node:test';
import { z } from 'zod';
import { preferencesSchema, planSchema } from '../server/domain.js';
import { toGeminiSchema } from '../server/gemini-schema.js';

const unsupported = new Set(['$schema', 'additionalProperties', 'minLength', 'maxLength', 'minItems', 'maxItems', 'default', 'exclusiveMinimum']);

function checkSubset(value) {
  if (Array.isArray(value)) return value.forEach(checkSubset);
  if (!value || typeof value !== 'object') return;
  for (const [key, child] of Object.entries(value)) {
    assert.equal(unsupported.has(key), false, `unsupported key: ${key}`);
    checkSubset(child);
  }
}

test('conversation and itinerary schemas use the Gemini subset', () => {
  for (const schema of [z.object({reply:z.string().min(1).max(900),preferences:preferencesSchema}).strict(), planSchema]) {
    const converted = toGeminiSchema(schema);
    checkSubset(converted);
    assert.equal(converted.type, 'object');
  }
});

test('nullable fields use type arrays while local Zod bounds remain enforced', () => {
  const converted = toGeminiSchema(preferencesSchema);
  assert.deepEqual(converted.properties.origin.type, ['string', 'null']);
  assert.deepEqual(converted.properties.travellerType.type, ['string', 'null']);
  assert.equal(preferencesSchema.shape.origin.safeParse('x'.repeat(121)).success, false);
});
