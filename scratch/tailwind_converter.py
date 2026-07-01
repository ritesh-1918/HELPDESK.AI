import os

replacements = {
    "style={{ fontFamily: \"'Inter', sans-serif\", background: 'linear-gradient(160deg, #f0fdf4 0%, #dcfce7 60%, #bbf7d0 100%)' }}": "className=\"min-h-screen flex items-center justify-center relative overflow-hidden p-6 bg-gradient-to-br from-green-50 via-green-100 to-green-200 font-sans\"",
    "style={{ background: 'radial-gradient(circle, rgba(34,160,69,0.12) 0%, transparent 70%)' }}": "className=\"absolute top-0 left-0 w-[600px] h-[600px] rounded-full pointer-events-none bg-[radial-gradient(circle,rgba(34,160,69,0.12)_0%,transparent_70%)]\"",
    "style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.08)', border: '1px solid #f0fdf4' }}": "className=\"w-full max-w-md bg-white rounded-3xl p-8 relative z-10 text-center shadow-[0_8px_40px_rgba(0,0,0,0.08)] border border-green-50\"",
    "style={{ background: '#f0fdf4', border: '1px solid #d1fae5' }}": "className=\"w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 bg-green-50 border border-green-100\"",
    "style={{ color: '#16a34a' }}": "className=\"text-green-600\"",
    "style={{ fontFamily: \"'Syne', sans-serif\", fontSize: '24px', fontWeight: 800, color: '#0f1f12', marginBottom: '16px' }}": "className=\"font-syne text-2xl font-extrabold text-gray-900 mb-4\"",
    "style={{ color: '#374151', fontSize: '14px', lineHeight: 1.7, marginBottom: '32px' }}": "className=\"text-gray-700 text-sm leading-relaxed mb-8\"",
    "style={{ background: 'linear-gradient(135deg, #16a34a, #22c55e)', color: '#ffffff', fontWeight: 600, fontSize: '15px', boxShadow: '0 4px 20px rgba(34,160,69,0.3)' }}": "className=\"inline-flex items-center justify-center w-full px-6 py-3.5 rounded-xl transition-all bg-gradient-to-br from-green-600 to-green-500 text-white font-semibold text-[15px] shadow-[0_4px_20px_rgba(34,160,69,0.3)]\"",
    "style={{ color: '#374151', fontWeight: 500, fontSize: '14px' }}": "className=\"absolute top-8 left-8 flex items-center gap-2 transition-all group text-gray-700 font-medium text-sm hover:text-green-600\"",
    "style={{ background: '#ffffff', border: '1px solid #e5e7eb' }}": "className=\"p-2 rounded-full transition-all bg-white border border-gray-200\"",
    "style={{ background: 'rgba(34,160,69,0.08)', border: '1px solid #d1fae5' }}": "className=\"flex items-center gap-2 px-4 py-2 rounded-full transition bg-green-600/10 border border-green-100\"",
    "style={{ fontWeight: 800, fontSize: '18px', color: '#0f1f12' }}": "className=\"font-extrabold text-lg text-gray-900\"",
    "style={{ fontFamily: \"'Syne', sans-serif\", fontSize: '28px', fontWeight: 800, color: '#0f1f12', letterSpacing: '-0.02em', marginBottom: '8px' }}": "className=\"font-syne text-[28px] font-extrabold text-gray-900 tracking-tight mb-2\"",
    "style={{ color: '#6b7280', fontSize: '14px' }}": "className=\"text-gray-500 text-sm\"",
    "style={{ background: '#fef2f2', border: '1px solid #fee2e2', borderRadius: '12px', padding: '14px 16px' }}": "className=\"mb-6 flex items-start gap-3 bg-red-50 border border-red-100 rounded-xl p-4\"",
    "style={{ background: '#fee2e2' }}": "className=\"rounded-full p-1 mt-0.5 bg-red-100\"",
    "style={{ color: '#b91c1c' }}": "className=\"text-sm font-medium text-red-700\"",
    "style={{ color: '#16a34a', fontWeight: 600 }}": "className=\"text-green-600 font-semibold\""
}

def apply(filepath):
    with open(filepath, "r") as f:
        content = f.read()
    
    for old, new in replacements.items():
        # Because we already have className= in some places, combining them properly is hard.
        # But for exact string matching we can do it.
        # To avoid className="..." className="...", we should be careful.
        content = content.replace(old, "")
        
    with open(filepath, "w") as f:
        f.write(content)

# Actually, rather than writing a brittle python script, I'll just use sed or Python to clean it up based on patterns.
