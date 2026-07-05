import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';

const sections = [
    {
        title: '1. Acceptance of Terms',
        content: `By accessing or using HelpDesk.ai ("the Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service. These terms apply to all visitors, users, and administrators of the platform.`
    },
    {
        title: '2. Description of Service',
        content: `HelpDesk.ai is an AI-powered IT helpdesk automation platform that allows organizations to create, categorize, and manage support tickets. The platform uses artificial intelligence to assist in ticket routing, priority detection, and automated resolution of common issues.`
    },
    {
        title: '3. Account Registration & Company Onboarding',
        content: `Administrators must register their company and be verified by our Master Admin team before gaining access. You agree to provide accurate, current, and complete information during registration. You are responsible for maintaining the confidentiality of your login credentials and for all activities that occur under your account.`
    },
    {
        title: '4. Acceptable Use',
        content: `You agree not to misuse the Service. Prohibited activities include: attempting to gain unauthorized access to any part of the system, submitting false or misleading support tickets, using the platform for commercial resale or redistribution without written authorization, uploading malicious content, or attempting to reverse-engineer the AI models.`
    },
    {
        title: '5. Data Privacy & Security',
        content: `We take data security seriously. All data transmitted is encrypted using 256-bit TLS/SSL. Each company's data is isolated in a multi-tenant architecture. We do not sell your data to third parties. For detailed information, see our Privacy Policy. You retain ownership of all data you submit to the platform.`
    },
    {
        title: '6. AI-Generated Content',
        content: `HelpDesk.ai uses AI to analyze, categorize, and suggest resolutions for tickets. While we strive for accuracy, AI outputs may not always be correct. Human review is available and recommended for critical issues. We are not liable for actions taken based solely on AI-generated recommendations.`
    },
    {
        title: '7. Subscription & Billing (India)',
        content: `Paid plans are billed in Indian Rupees (₹). The Starter plan is free. The Growth plan is billed at ₹3,999/month. Enterprise pricing is custom and negotiated separately. All prices are exclusive of applicable GST. Subscriptions auto-renew unless cancelled before the next billing cycle.`
    },
    {
        title: '8. Intellectual Property',
        content: `The HelpDesk.ai platform, its AI models, codebase, and all associated intellectual property remain the exclusive property of HelpDesk.ai and its creators. You may not copy, modify, or distribute any part of the platform without express written permission.`
    },
    {
        title: '9. Limitation of Liability',
        content: `To the fullest extent permitted by applicable law, HelpDesk.ai shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly. Our total liability for any claim shall not exceed the amount paid by you in the preceding 12 months.`
    },
    {
        title: '10. Termination',
        content: `We reserve the right to suspend or terminate your account for violations of these Terms. You may terminate your account at any time by contacting our support team. Upon termination, your data will be retained for 30 days before permanent deletion, during which you may export it.`
    },
    {
        title: '11. Changes to Terms',
        content: `We may update these Terms of Service from time to time. We will notify registered administrators via email of any material changes. Continued use of the Service after changes become effective constitutes your acceptance of the new terms.`
    },
    {
        title: '12. Governing Law',
        content: `These Terms shall be governed by and construed in accordance with the laws of India, specifically the Information Technology Act, 2000 and associated rules. Any disputes shall be subject to the exclusive jurisdiction of the courts of Bengaluru, Karnataka, India.`
    },
    {
        title: '13. Contact',
        content: `For questions about these Terms, please contact us at: legal@helpdesk.ai`
    },
];

export default function TermsOfService() {
    const navigate = useNavigate();
    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 px-6 py-4 flex items-center justify-between">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-emerald-700 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Go Back
                </button>
                <button onClick={() => navigate('/')} className="font-black text-emerald-900 italic uppercase text-lg hover:text-emerald-700 transition-colors">
                    HelpDesk.ai
                </button>
                <div className="w-24" />
            </nav>

            <div className="max-w-4xl mx-auto px-6 py-16">
                <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center">
                        <FileText className="w-6 h-6 text-emerald-700" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-extrabold text-gray-900">Terms of Service</h1>
                        <p className="text-gray-500 text-sm mt-1">Last updated: March 10, 2026</p>
                    </div>
                </div>

                <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5 mb-12 text-sm text-emerald-800">
                    Please read these Terms of Service carefully before using HelpDesk.ai. By registering or using our platform, you confirm that you have read, understood, and agree to be bound by these terms.
                </div>

                <div className="space-y-10">
                    {sections.map(({ title, content }) => (
                        <div key={title}>
                            <h2 className="text-lg font-bold text-gray-900 mb-3">{title}</h2>
                            <p className="text-gray-600 leading-relaxed">{content}</p>
                        </div>
                    ))}
                </div>

                <div className="mt-16 pt-8 border-t border-gray-200 text-center">
                    <p className="text-sm text-gray-400">© 2026 HelpDesk.ai. All rights reserved.</p>
                    <div className="flex items-center justify-center gap-4 mt-4">
                        <button onClick={() => navigate('/privacy')} className="text-sm text-emerald-700 hover:underline">Privacy Policy</button>
                        <span className="text-gray-300">|</span>
                        <button onClick={() => navigate('/security')} className="text-sm text-emerald-700 hover:underline">Security</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
