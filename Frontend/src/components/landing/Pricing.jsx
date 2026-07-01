import React from 'react';
import { CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Pricing({ 
    billingAnnual, 
    setBillingAnnual, 
    pricingPlans, 
    isRedirecting, 
    setIsRedirecting 
}) {
    const navigate = useNavigate();

    const handlePricingClick = (planName) => {
        if (planName === 'Growth') {
            setIsRedirecting(true);
            const stripeUrl = import.meta.env.VITE_STRIPE_GROWTH_LINK;
            if (stripeUrl) {
                window.location.href = stripeUrl;
            } else {
                console.warn("Stripe link not configured in .env");
                setTimeout(() => {
                    setIsRedirecting(false);
                    navigate('/admin-signup');
                }, 1000);
            }
        } else if (planName === 'Enterprise') {
            navigate('/contact-sales');
        } else {
            navigate('/admin-signup');
        }
    };

    return (
        <section className="py-24 bg-gray-50 dark:bg-slate-950 transition-colors duration-300" id="pricing">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
                        Simple, Transparent Pricing
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 dark:text-slate-400 mb-8">
                        All plans in Indian Rupees (₹) · GST applicable
                    </p>

                    <div className="inline-flex items-center gap-3 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-full px-2 py-2 shadow-sm">
                        <button
                            onClick={() => setBillingAnnual(false)}
                            className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                                !billingAnnual 
                                ? 'bg-emerald-600 text-white shadow' 
                                : 'text-gray-500 dark:text-gray-400 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200'
                            }`}
                        >
                            Monthly
                        </button>
                        <button
                            onClick={() => setBillingAnnual(true)}
                            className={`px-5 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-2 ${
                                billingAnnual 
                                ? 'bg-emerald-600 text-white shadow' 
                                : 'text-gray-500 dark:text-gray-400 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200'
                            }`}
                        >
                            Annual 
                            <span className="bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 text-xs font-bold px-1.5 py-0.5 rounded-full">
                                Save 20%
                            </span>
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {pricingPlans.map((plan) => (
                        <div
                            key={plan.name}
                            className={`p-8 rounded-2xl bg-white dark:bg-slate-900 transition-all relative border ${
                                plan.popular 
                                ? 'border-emerald-500 shadow-2xl shadow-emerald-500/10 scale-[1.02]' 
                                : 'border-gray-200 dark:border-slate-800 hover:border-gray-300 dark:hover:border-slate-700'
                            }`}
                        >
                            {plan.popular && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-emerald-600 text-white px-4 py-1.5 rounded-full text-xs font-bold tracking-wide whitespace-nowrap shadow-lg">
                                    ⭐ MOST POPULAR
                                </div>
                            )}
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{plan.name}</h3>
                            <div className="text-4xl font-extrabold text-gray-900 dark:text-white mb-2">
                                {plan.priceLabel ? plan.priceLabel : (
                                    <>
                                        ₹{plan.price.toLocaleString('en-IN')}
                                        <span className="text-base font-normal text-gray-500 dark:text-gray-400 dark:text-slate-400">{plan.period}</span>
                                    </>
                                )}
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-slate-400 mb-6">{plan.desc}</p>
                            <button
                                onClick={() => handlePricingClick(plan.name)}
                                disabled={isRedirecting && plan.name === 'Growth'}
                                className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-all mb-8 text-sm ${plan.ctaStyle} ${isRedirecting && plan.name === 'Growth' ? 'opacity-80 cursor-not-allowed' : ''}`}
                            >
                                {isRedirecting && plan.name === 'Growth' ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Redirecting...
                                    </>
                                ) : (
                                    plan.cta
                                )}
                            </button>
                            <ul className="space-y-3">
                                {plan.features.map((feat) => (
                                    <li key={feat} className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-400 dark:text-slate-300">
                                        <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-px" />
                                        {feat}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}