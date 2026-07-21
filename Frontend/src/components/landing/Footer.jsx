import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Twitter, Linkedin, Github, Play, Globe } from 'lucide-react';

export default function Footer({ setShowDemo = () => {} }) {
    const navigate = useNavigate();
    const footerLinkClass =
        "relative inline-block text-xs sm:text-sm text-white/65 dark:text-slate-400 transition-all duration-200 ease-out after:absolute after:left-0 after:-bottom-0.5 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-emerald-300 after:transition-transform after:duration-200 hover:-translate-y-0.5 hover:text-white hover:after:scale-x-100 focus-visible:-translate-y-0.5 focus-visible:text-white focus-visible:outline-none focus-visible:after:scale-x-100 dark:hover:text-slate-100 dark:after:bg-emerald-400";
    const footerBottomLinkClass =
        "relative inline-block text-xs text-white/40 dark:text-slate-400 transition-all duration-200 ease-out after:absolute after:left-0 after:-bottom-0.5 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-emerald-300 after:transition-transform after:duration-200 hover:-translate-y-0.5 hover:text-white hover:after:scale-x-100 focus-visible:-translate-y-0.5 focus-visible:text-white focus-visible:outline-none focus-visible:after:scale-x-100 dark:hover:text-slate-200 dark:after:bg-emerald-400";

    return (
        <footer className="bg-emerald-950 text-white dark:bg-slate-950 dark:text-slate-200 w-full overflow-hidden transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-10">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-x-6 gap-y-10 sm:gap-10">
                    <div className="col-span-2 md:col-span-1 space-y-4 text-center md:text-left flex flex-col items-center md:items-start">
                        <div className="flex items-center gap-2">
                            <img src="/favicon.png" alt="H" className="w-7 h-7 object-contain" />
                            <span className="font-black text-lg text-white dark:text-slate-100 tracking-tighter uppercase">HelpDesk.ai</span>
                        </div>
                        <p className="text-white/50 dark:text-slate-400 text-xs sm:text-sm leading-relaxed max-w-sm">
                            AI-powered IT helpdesk automation for modern Indian enterprises.
                        </p>
                        <p className="text-[11px] text-white/30 dark:text-slate-400">Made with ❤️ in India 🇮🇳</p>
                        <div className="flex gap-2.5 pt-1">
                            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-white/10 dark:bg-slate-800 hover:bg-white/20 dark:hover:bg-slate-700 rounded-lg flex items-center justify-center transition-all duration-300 hover:-translate-y-0.5 hover:scale-110">
                                <Twitter className="w-3.5 h-3.5" />
                            </a>
                            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-white/10 dark:bg-slate-800 hover:bg-white/20 dark:hover:bg-slate-700 rounded-lg flex items-center justify-center transition-all duration-300 hover:-translate-y-0.5 hover:scale-110">
                                <Linkedin className="w-3.5 h-3.5" />
                            </a>
                            <a href="https://github.com/ritesh-1918/HELPDESK.AI" target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-white/10 dark:bg-slate-800 hover:bg-white/20 dark:hover:bg-slate-700 rounded-lg flex items-center justify-center transition-all duration-300 hover:-translate-y-0.5 hover:scale-110">
                                <Github className="w-3.5 h-3.5" />
                            </a>
                        </div>
                    </div>

                    {[
                        {
                            heading: 'Product',
                            links: [
                                { label: 'Auto-Categorization', href: '/features/categorization' },
                                { label: 'Priority Detection', href: '/features/priority' },
                                { label: 'Smart Resolution', href: '/features/resolution' },
                                { label: 'Analytics Dashboard', href: '/admin-signup' },
                            ]
                        },
                        {
                            heading: 'Resources',
                            links: [
                                { label: 'Documentation', href: '/docs' },
                                { label: 'API Reference', href: '/api-reference' },
                                { label: 'Changelog', href: '/changelog' },
                                { label: 'Status Page', href: '/status' },
                            ]
                        },
                        {
                            heading: 'Company',
                            links: [
                                { label: 'About Us', href: '/about' },
                                { label: 'Careers', href: '/careers' },
                                { label: 'Privacy Policy', href: '/privacy' },
                                { label: 'Terms of Service', href: '/terms' },
                            ]
                        },
                        {
                            heading: 'Legal',
                            links: [
                                { label: 'Security Overview', href: '/security' },
                                { label: 'Privacy Policy', href: '/privacy' },
                                { label: 'Terms of Service', href: '/terms' },
                                { label: 'Cookie Policy', href: '/cookie-policy' },
                            ]
                        },
                    ].map(({ heading, links }) => (
                        <div key={heading} className="col-span-1 text-left sm:text-left">
                            <h4 className="text-[11px] font-bold uppercase tracking-widest text-white/40 dark:text-slate-400 mb-3.5">{heading}</h4>
                            <ul className="space-y-2">
                                {links.map(({ label, href }) => (
                                    <li key={label}>
                                        {href.startsWith('/') ? (
                                            <button
                                                onClick={() => navigate(href)}
                                                className={`${footerLinkClass} text-left bg-transparent border-none p-0 cursor-pointer`}
                                            >
                                                {label}
                                            </button>
                                        ) : (
                                            <a href={href} className={footerLinkClass}>{label}</a>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-12 pt-6 border-t border-white/10 dark:border-slate-800 text-center md:text-left">
                    <p className="text-[11px] text-white/40 dark:text-slate-400 order-2 md:order-1">
                        © 2026 HelpDesk.ai. All rights reserved. · Registered in India
                    </p>
                    <div className="flex flex-col sm:flex-row items-center gap-4 order-1 md:order-2 w-full md:w-auto justify-center md:justify-end">
                        <div className="flex items-center gap-5 justify-center">
                            <button onClick={() => navigate('/terms')} className={`${footerBottomLinkClass} bg-transparent border-none p-0 cursor-pointer`}>Terms</button>
                            <button onClick={() => navigate('/privacy')} className={`${footerBottomLinkClass} bg-transparent border-none p-0 cursor-pointer`}>Privacy</button>
                            <button onClick={() => navigate('/security')} className={`${footerBottomLinkClass} bg-transparent border-none p-0 cursor-pointer`}>Security</button>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-white/40 dark:text-slate-400 border border-white/10 dark:border-slate-800 rounded-lg px-2.5 py-1 cursor-pointer hover:bg-white/10 dark:hover:bg-slate-800/50 transition-all duration-300 hover:-translate-y-0.5 hover:scale-110">
                            <Globe className="w-3.5 h-3.5" />
                            <span>English (IN)</span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
