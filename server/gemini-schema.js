import { z } from 'zod';

// Gemini accepts only a subset of JSON Schema. Keep the Zod schema as the
// authoritative validator for the response after the model returns it.
const supported = new Set([
  '$defs', '$ref', 'type', 'format', 'title', 'description', 'enum',
  'items', 'properties', 'required', 'minimum', 'maximum', 'anyOf',
]);

function convert(schema) {
  if (Array.isArray(schema)) return schema.map(convert);
  if (schema === null || typeof schema !== 'object') return schema;

  const result = {};
  for (const [key, value] of Object.entries(schema)) {
    if (!supported.has(key)) continue;
    if (key === 'properties' || key === '$defs') {
      result[key] = Object.fromEntries(
        Object.entries(value).map(([name, child]) => [name, convert(child)]),
      );
    } else {
      result[key] = convert(value);
    }
  }

  // Zod represents nullable fields as anyOf [T, null]. A simple type array
  // is smaller and is supported by Gemini's structured-output endpoint.
  if (Array.isArray(result.anyOf) && result.anyOf.length === 2) {
    const nonNull = result.anyOf.filter(option => option.type !== 'null');
    if (nonNull.length === 1 && result.anyOf.some(option => option.type === 'null')
      && typeof nonNull[0].type === 'string') {
      delete result.anyOf;
      Object.assign(result, nonNull[0], { type: [nonNull[0].type, 'null'] });
      if (Array.isArray(result.enum) && !result.enum.includes(null)) result.enum.push(null);
    }
  }
  return result;
}

export function toGeminiSchema(zodSchema) {
  return convert(z.toJSONSchema(zodSchema));
}
