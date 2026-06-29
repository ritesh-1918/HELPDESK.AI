const INVALID_MARKERS = new Set([
	'your_supabase_url',
	'your_project_url',
	'your_supabase_anon_key',
	'your_key',
])

export const isLikelyValidUrl = (value) => {
	if (!value || INVALID_MARKERS.has(value)) return false
	try {
		const parsed = new URL(value)
		return parsed.protocol === 'https:'
	} catch {
		return false
	}
}

export const isLikelyValidAnonKey = (value) => {
	return Boolean(value && !INVALID_MARKERS.has(value) && value.length > 20)
}
