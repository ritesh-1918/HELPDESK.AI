import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';

const sections = [
    {
        title: '1. Information We Collect',
        content: `When you register on HelpDesk.ai, we collect: (a) Personal Information — your full name, work email, phone number, job title, and password (stored as a secure hash). (b) Company Information — company name, size, industry, website, and country. (c) Usage Data — log files, IP addresses, browser type, pages viewed, and time spent on the platform. (d) Support Ticket Content — text, images, and attachments submitted as tickets within the platform.`
    },
    {
        title: '2. How We Use Your Information',
        content: `We use the information we collect to: provide and improve the HelpDesk.ai service; authenticate users and prevent unauthorized access; process and route support tickets using our AI engine; send system notifications, account updates, and approval status emails; analyze usage patterns to improve the platform; comply with legal requirements and enforce our Terms of Service.`
    },
    {
        title: '3. Data Isolation & Multi-tenancy',
        content: `Each registered company on HelpDesk.ai has its data isolated from all other companies. Employees can only view tickets from their own organization. Admins can only manage their company's data. Master Admins can view aggregate metadata but not individual ticket content. This architecture ensures your organizational data is never visible to other tenants.`
    },
    {
        title: '4. AI Processing of Ticket Data',
        content: `Ticket content submitted to HelpDesk.ai is processed by our AI engine to perform categorization, priority detection, and duplicate checking. This processing occurs on our secure servers. We do not use your ticket content to train AI models for external customers. Processed data is used solely to deliver the service to your organization.`
    },
    {
        title: '5. Data Retention',
        content: `We retain your data for as long as your account is active. Upon account termination, your data is retained for 30 days for recovery purposes, after which it is permanently deleted from our servers. Support tickets are retained for the duration of your subscription and for 60 days after cancellation to allow for export.`
    },
    {
        title: '6. Data Security',
        content: `We implement industry-standard security measures including: 256-bit TLS encryption in transit; AES-256 encryption at rest; role-based access controls (RBAC); regular security audits and penetration testing; Supabase Row Level Security (RLS) policies isolating each tenant's data; access logging and anomaly detection.`
    },
    {
        title: '7. Third-Party Services',
        content: `HelpDesk.ai uses the following trusted third-party services: Supabase (database & authentication), Google Gemini API (AI analysis), Vercel (frontend hosting), and cloud infrastructure providers. These services are bound by their own privacy policies and are used solely to operate the HelpDesk.ai platform. We do not share personal data with any advertising or marketing platforms.`
    },
    {
        title: '8. Cookies & Tracking',
        content: `We use session cookies for authentication and local storage for user preferences. We do not use third-party advertising cookies. Analytics are limited to anonymous, aggregate usage data. You can disable cookies in your browser settings, though some features may not function correctly without them.`
    },
    {
        title: '9. Your Rights (DPDP India / GDPR)',
        content: `You have the right to: access the personal data we hold about you; request correction of inaccurate data; request deletion of your data ("right to be forgotten"); object to certain types of processing; request portability of your data in a machine-readable format. To exercise these rights, contact us at privacy@helpdesk.ai.`
    },
    {
        title: '10. Children\'s Privacy',
        content: `HelpDesk.ai is designed for use by IT professionals and enterprise organizations. We do not knowingly collect personal information from individuals under 18 years of age. If you believe a minor has provided us with personal data, please contact us immediately.`
    },
    {
        title: '11. Changes to This Policy',
        content: `We may update this Privacy Policy periodically. When we make material changes, we will notify registered admins via email and update the "Last updated" date at the top of this page. Continued use of the service after such changes constitutes acceptance of the new policy.`
    },
    {
        title: '12. Contact Us',
        content: `For privacy-related inquiries: privacy@helpdesk.ai\nFor security vulnerabilities (responsible disclosure): security@helpdesk.ai\nRegistered Office (for legal correspondence): [Bengaluru, India]`
    },
];

export default function PrivacyPolicy() {
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
                    <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
                        <Shield className="w-6 h-6 text-blue-700" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-extrabold text-gray-900">Privacy Policy</h1>
                        <p className="text-gray-500 text-sm mt-1">Last updated: March 10, 2026</p>
                    </div>
                </div>

                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 mb-12 text-sm text-blue-800">
                    Your privacy matters to us. This policy explains how HelpDesk.ai collects, uses, and protects your personal data. We comply with the Digital Personal Data Protection Act (DPDP) 2023 of India and maintain GDPR-equivalent standards.
                </div>

                <div className="space-y-10">
                    {sections.map(({ title, content }) => (
                        <div key={title}>
                            <h2 className="text-lg font-bold text-gray-900 mb-3">{title}</h2>
                            <p className="text-gray-600 leading-relaxed whitespace-pre-line">{content}</p>
                        </div>
                    ))}
                </div>

                <div className="mt-16 pt-8 border-t border-gray-200 text-center">
                    <p className="text-sm text-gray-400">© 2026 HelpDesk.ai. All rights reserved.</p>
                    <div className="flex items-center justify-center gap-4 mt-4">
                        <button onClick={() => navigate('/terms')} className="text-sm text-emerald-700 hover:underline">Terms of Service</button>
                        <span className="text-gray-300">|</span>
                        <button onClick={() => navigate('/security')} className="text-sm text-emerald-700 hover:underline">Security</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
