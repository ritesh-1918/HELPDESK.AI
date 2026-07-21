const fs = require('fs');

const signupReplacements = {
    "style={{ fontFamily: \"'Inter', sans-serif\", background: 'linear-gradient(160deg, #f0fdf4 0%, #dcfce7 60%, #bbf7d0 100%)' }}": 'className="min-h-screen flex items-center justify-center relative overflow-hidden p-6 bg-gradient-to-br from-green-50 via-green-100 to-green-200 font-sans"',
    "style={{ background: 'radial-gradient(circle, rgba(34,160,69,0.12) 0%, transparent 70%)' }}": 'className="absolute top-0 left-0 w-[600px] h-[600px] rounded-full pointer-events-none bg-[radial-gradient(circle,rgba(34,160,69,0.12)_0%,transparent_70%)]"',
    "className=\"w-full max-w-md bg-white rounded-3xl p-8 relative z-10 text-center\" style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.08)', border: '1px solid #f0fdf4' }}": 'className="w-full max-w-md bg-white rounded-3xl p-8 relative z-10 text-center shadow-[0_8px_40px_rgba(0,0,0,0.08)] border border-green-50"',
    "className=\"w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6\" style={{ background: '#f0fdf4', border: '1px solid #d1fae5' }}": 'className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 bg-green-50 border border-green-100"',
    "style={{ color: '#16a34a' }}": 'className="text-green-600"',
    "style={{ fontFamily: \"'Syne', sans-serif\", fontSize: '24px', fontWeight: 800, color: '#0f1f12', marginBottom: '16px' }}": 'className="font-syne text-2xl font-extrabold text-gray-900 mb-4"',
    "style={{ color: '#374151', fontSize: '14px', lineHeight: 1.7, marginBottom: '32px' }}": 'className="text-gray-700 text-sm leading-relaxed mb-8"',
    "style={{ background: 'linear-gradient(135deg, #16a34a, #22c55e)', color: '#ffffff', fontWeight: 600, fontSize: '15px', boxShadow: '0 4px 20px rgba(34,160,69,0.3)' }}": 'className="inline-flex items-center justify-center w-full px-6 py-3.5 rounded-xl transition-all bg-gradient-to-br from-green-600 to-green-500 text-white font-semibold text-[15px] shadow-[0_4px_20px_rgba(34,160,69,0.3)]"',
    "style={{ color: '#374151', fontWeight: 500, fontSize: '14px' }}": 'className="absolute top-8 left-8 flex items-center gap-2 transition-all group text-gray-700 font-medium text-sm hover:text-green-600"',
    "className=\"p-2 rounded-full transition-all\" style={{ background: '#ffffff', border: '1px solid #e5e7eb' }}": 'className="p-2 rounded-full transition-all bg-white border border-gray-200"',
    "className=\"flex items-center gap-2 px-4 py-2 rounded-full transition\" style={{ background: 'rgba(34,160,69,0.08)', border: '1px solid #d1fae5' }}": 'className="flex items-center gap-2 px-4 py-2 rounded-full transition bg-green-600/10 border border-green-100"',
    "style={{ fontWeight: 800, fontSize: '18px', color: '#0f1f12' }}": 'className="font-extrabold text-lg text-gray-900"',
    "style={{ fontFamily: \"'Syne', sans-serif\", fontSize: '28px', fontWeight: 800, color: '#0f1f12', letterSpacing: '-0.02em', marginBottom: '8px' }}": 'className="font-syne text-[28px] font-extrabold text-gray-900 tracking-tight mb-2"',
    "style={{ color: '#6b7280', fontSize: '14px' }}": 'className="text-gray-500 text-sm"',
    "style={{ background: '#fef2f2', border: '1px solid #fee2e2', borderRadius: '12px', padding: '14px 16px' }}": 'className="mb-6 flex items-start gap-3 bg-red-50 border border-red-100 rounded-xl p-4"',
    "style={{ background: '#fee2e2' }}": 'className="rounded-full p-1 mt-0.5 bg-red-100"',
    "style={{ color: '#b91c1c' }}": 'className="text-sm font-medium text-red-700"',
    "style={{ color: '#16a34a', fontWeight: 600 }}": 'className="text-green-600 font-semibold"',
    "className=\"min-h-screen flex items-center justify-center relative overflow-hidden p-6 py-12\" style={{ fontFamily: \"'Inter', sans-serif\", background: 'linear-gradient(160deg, #f0fdf4 0%, #dcfce7 60%, #bbf7d0 100%)' }}": 'className="min-h-screen flex items-center justify-center relative overflow-hidden p-6 py-12 bg-gradient-to-br from-green-50 via-green-100 to-green-200 font-sans"'
};

const adminDashboardReplacements = {
    "style={{ background: '#f8faf9', minHeight: '100vh', paddingBottom: '40px' }} className=\"space-y-10 -m-6 p-6 md:-m-10 md:p-10\"": 'className="space-y-10 -m-6 p-6 md:-m-10 md:p-10 bg-[#f8faf9] min-h-screen pb-10"',
    "style={{ fontFamily: 'Syne, sans-serif', fontSize: '24px', fontWeight: 800, color: '#0f1f12', letterSpacing: '-0.02em', margin: 0 }}": 'className="font-syne text-2xl font-extrabold text-gray-900 tracking-tight m-0"',
    "style={{ color: '#6b7280', fontSize: '13px', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 500 }}": 'className="text-gray-500 text-[13px] mt-1 flex items-center gap-2 font-medium"',
    "style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }}": 'className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block"',
    "style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 16px', background: '#F0FDF4', border: '1.5px solid #BBF7D0', borderRadius: '100px' }}": 'className="flex items-center gap-2 px-4 py-1.5 bg-green-50 border-[1.5px] border-green-200 rounded-full"',
    "style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', display: 'inline-block', animation: 'pulse-dot 2s infinite' }}": 'className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block animate-[pulse-dot_2s_infinite]"',
    "style={{ fontSize: '11px', fontWeight: 700, color: '#15803d', letterSpacing: '0.08em', textTransform: 'uppercase' }}": 'className="text-[11px] font-bold text-green-700 tracking-[0.08em] uppercase"',
    "style={{ fontFamily: 'Syne, sans-serif', fontSize: '15px', fontWeight: 700, color: '#0f1f12', display: 'flex', alignItems: 'center', gap: '8px' }}": 'className="font-syne text-[15px] font-bold text-gray-900 flex items-center gap-2"',
    "style={{ background: '#fff', borderRadius: '20px', border: '1px solid #f0fdf4', boxShadow: '0 2px 16px rgba(0,0,0,0.05)', overflow: 'hidden' }}": 'className="bg-white rounded-[20px] border border-green-50 shadow-[0_2px_16px_rgba(0,0,0,0.05)] overflow-hidden"',
    "style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '100px', padding: '3px 10px' }}": 'className="flex items-center gap-1.5 bg-green-50 border border-green-200 rounded-full px-2.5 py-[3px]"',
    "style={{ width: 5, height: 5, borderRadius: '50%', background: '#22c55e', display: 'inline-block', animation: 'pulse-dot 2s infinite' }}": 'className="w-[5px] h-[5px] rounded-full bg-green-500 inline-block animate-[pulse-dot_2s_infinite]"',
    "style={{ fontSize: '10px', fontWeight: 700, color: '#15803d' }}": 'className="text-[10px] font-bold text-green-700"',
    "style={{ background: '#fff', borderRadius: '20px', border: '1px solid #f0fdf4', padding: '24px' }}": 'className="bg-white rounded-[20px] border border-green-50 p-6"',
    "className=\"flex items-center justify-between p-4 rounded-2xl border border-gray-100 transition-all cursor-default hover:bg-white hover:border-green-100\" style={{ background: '#f8faf9' }}": 'className="flex items-center justify-between p-4 rounded-2xl border border-gray-100 transition-all cursor-default hover:bg-white hover:border-green-100 bg-[#f8faf9]"',
    "style={{ fontSize: '13px', fontWeight: 600, color: '#111827', margin: 0 }}": 'className="text-[13px] font-semibold text-gray-900 m-0"',
    "style={{ fontSize: '11px', color: '#6b7280', marginTop: '1px' }}": 'className="text-[11px] text-gray-500 mt-[1px]"',
    "style={{ fontSize: '10px', color: '#9ca3af', letterSpacing: '0.14em', fontWeight: 600, textTransform: 'uppercase' }}": 'className="text-[10px] text-gray-400 tracking-[0.14em] font-semibold uppercase"',
    "style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 10px', background: '#f8faf9', borderRadius: '100px', border: '1px solid #e5e7eb' }}": 'className="flex items-center gap-1.5 px-2.5 py-1 bg-[#f8faf9] rounded-full border border-gray-200"',
    "style={{ fontSize: '9px', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.1em' }}": 'className="text-[9px] font-semibold text-gray-400 uppercase tracking-[0.1em]"',
    "style={{ background: aiIconMap[idx].bg, color: aiIconMap[idx].color, width: 36, height: 36, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}": 'style={{ background: aiIconMap[idx].bg, color: aiIconMap[idx].color }} className="w-9 h-9 rounded-[10px] flex items-center justify-center"'
};

function processFile(filepath, replacementsDict) {
    let content = fs.readFileSync(filepath, 'utf-8');
    for (const [oldStr, newStr] of Object.entries(replacementsDict)) {
        content = content.replace(oldStr, newStr);
    }
    // Handle inline dynamics manually for the active sub styles
    content = content.replace(
        "style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '3px 10px', background: sub.status === 'Active' ? '#dcfce7' : '#f3f4f6', color: sub.status === 'Active' ? '#15803d' : '#6b7280', border: sub.status === 'Active' ? '1px solid #bbf7d0' : '1px solid #e5e7eb', borderRadius: '100px' }}",
        "className={`flex items-center gap-1.5 px-2.5 py-[3px] rounded-full border ${sub.status === 'Active' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-gray-100 text-gray-500 border-gray-200'}`}"
    );
    content = content.replace(
        "style={{ width: 5, height: 5, borderRadius: '50%', background: sub.status === 'Active' ? '#22c55e' : '#9ca3af' }}",
        "className={`w-[5px] h-[5px] rounded-full ${sub.status === 'Active' ? 'bg-green-500' : 'bg-gray-400'}`}"
    );
    content = content.replace(
        "style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' }}",
        "className=\"text-[10px] font-bold uppercase\""
    );

    fs.writeFileSync(filepath, content);
}

processFile('Frontend/src/pages/Signup.jsx', signupReplacements);
processFile('Frontend/src/admin/pages/AdminDashboard.jsx', adminDashboardReplacements);
console.log("Done");
