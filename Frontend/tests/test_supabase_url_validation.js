import assert from 'node:assert/strict'
import { isLikelyValidUrl } from '../src/lib/supabaseUrlValidation.js'

assert.equal(isLikelyValidUrl('https://example.supabase.co'), true)
assert.equal(isLikelyValidUrl('http://example.supabase.co'), false)
assert.equal(isLikelyValidUrl('your_supabase_url'), false)

console.log('supabase url validation checks passed')
