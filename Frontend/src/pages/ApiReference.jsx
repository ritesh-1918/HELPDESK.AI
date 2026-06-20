import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Terminal, Shield, Cpu, Key, ArrowLeft, Check, Copy } from 'lucide-react';
import { Card } from '../components/ui/card';

export default function ApiReference() {
    const navigate = useNavigate();
    const [copied, setCopied] = React.useState(null);

    const handleCopy = (text, key) => {
        navigator.clipboard.writeText(text);
        setCopied(key);
        setTimeout(() => setCopied(null), 2000);
    };

    return (
        <div className="min-h-screen bg-[#f6f8f7] pb-20">
            {/* Header */}
            <header className="w-full bg-white border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-[1100px] mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
                        <img src="/favicon.png" alt="HELPDESK.AI Logo" className="w-7 h-7 object-contain" />
                        <div className="flex items-baseline gap-2">
                            <h1 className="text-xl font-black tracking-tighter text-gray-900 italic">HELPDESK.AI</h1>
                            <span className="px-2 py-0.5 text-[10px] font-black bg-blue-100 text-blue-800 rounded-md uppercase tracking-wider">API</span>
                        </div>
                    </div>
                    <button 
                        onClick={() => navigate('/')}
                        className="flex items-center gap-2 text-xs font-bold text-gray-600 hover:text-emerald-600 transition-colors bg-gray-50 hover:bg-emerald-50 px-3.5 py-2 rounded-xl border border-gray-200"
                    >
                        <ArrowLeft size={14} /> Back to Home
                    </button>
                </div>
            </header>

            <div className="max-w-[900px] mx-auto px-4 md:px-6 mt-12 space-y-12">
                <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-700 text-xs font-bold">
                        <Terminal size={14} /> Developer API Reference v1
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Integrate Automation Workflows</h1>
                    <p className="text-slate-600 text-base leading-relaxed">
                        Connect your existing CRM, Slack bots, or internal tools directly to the HELPDESK.AI triage engine. Classify incoming tickets and generate timelines instantly.
                    </p>
                </div>

                {/* Authentication Card */}
                <Card className="p-8 rounded-[2rem] border border-slate-200/80 bg-white space-y-6 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                            <Key size={20} />
                        </div>
                        <div>
                            <h3 className="font-extrabold text-slate-900 text-lg">Authentication</h3>
                            <p className="text-xs text-slate-500 font-medium">Secure request header formats</p>
                        </div>
                    </div>
                    <p className="text-slate-600 text-sm leading-relaxed">
                        All incoming API calls must contain a valid Bearer Token in the authorization header. Generate your API key inside the Admin Dashboard Settings panel.
                    </p>
                    <div className="bg-slate-950 p-4 rounded-xl font-mono text-xs text-slate-300 border border-slate-900 relative">
                        <span className="absolute top-2 right-2 text-[10px] uppercase font-bold text-slate-500">Headers</span>
                        Authorization: Bearer hk_live_xxxxxxxxxxxxxxxxxxxxxxxx
                    </div>
                </Card>

                {/* Endpoint Section */}
                <div className="space-y-6">
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Endpoint Catalog</h2>

                    {/* Create Ticket Endpoint */}
                    <Card className="p-8 rounded-[2rem] border border-slate-200/80 bg-white space-y-6 shadow-sm">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                            <div className="flex items-center gap-3">
                                <span className="bg-emerald-600 text-white font-black text-xs px-2.5 py-1 rounded-lg">POST</span>
                                <code className="text-sm font-extrabold text-slate-800">/api/v1/tickets/classify</code>
                            </div>
                            <span className="text-xs font-semibold text-slate-400">Classify & Save Incident</span>
                        </div>

                        <p className="text-slate-600 text-sm leading-relaxed">
                            Sends raw issue strings or base64 files for immediate NLP categorizing, priority detection, and routing.
                        </p>

                        <div className="space-y-3">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Request Body (JSON)</span>
                            <div className="relative">
                                <pre className="bg-slate-950 p-5 rounded-2xl font-mono text-xs text-emerald-400 overflow-x-auto border border-slate-900 select-text">
{`{
  "text": "VPN connecting error 789 on router downstairs",
  "meta": {
    "source": "Slack Integration",
    "reporter_email": "user@company.com"
  }
}`}
                                </pre>
                                <button 
                                    onClick={() => handleCopy(`{\n  "text": "VPN connecting error 789 on router downstairs",\n  "meta": {\n    "source": "Slack Integration",\n    "reporter_email": "user@company.com"\n  }\n}`, 'req')}
                                    className="absolute top-3 right-3 text-slate-500 hover:text-white p-2 bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-800 transition-colors"
                                >
                                    {copied === 'req' ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Response payload (JSON)</span>
                            <pre className="bg-slate-950 p-5 rounded-2xl font-mono text-xs text-slate-300 overflow-x-auto border border-slate-900">
{`{
  "status": "success",
  "ticket_id": "7cc6e8ef-b5d9-4615-a349-1d629154e7c6",
  "classification": {
    "category": "Network",
    "priority": "High",
    "assigned_team": "Network Ops",
    "confidence": 0.96
  }
}`}
                            </pre>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
