import React, { useState } from 'react';
import { HelpCircle, Mail, MessageSquare, Book, ChevronRight, ChevronDown, Video, PlayCircle, Filter, Search, LifeBuoy } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card";
import { YOUTUBE_RESOURCES, VIDEO_CATEGORIES } from '../../data/youtubeResources';

import useAuthStore from "../../store/authStore";

const FAQItem = ({ faq }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div 
            className="space-y-3 cursor-pointer group rounded-xl p-4 hover:bg-gray-50/50 transition-colors border border-transparent hover:border-gray-100"
            onClick={() => setIsOpen(!isOpen)}
        >
            <div className="flex justify-between items-start gap-4">
                <h4 className="font-bold text-gray-900 text-lg leading-snug group-hover:text-emerald-700 transition-colors">{faq.q}</h4>
                <div className="text-gray-400 group-hover:text-emerald-500 transition-colors mt-1 shrink-0">
                    {isOpen ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                </div>
            </div>
            {isOpen && (
                <div className="pt-2 animate-in slide-in-from-top-1 fade-in duration-200">
                    <p className="text-gray-600 leading-relaxed">{faq.a}</p>
                </div>
            )}
        </div>
    );
};

const Help = () => {
    const { profile } = useAuthStore();
    const [activeTab, setActiveTab] = useState('All');
    const [videos, setVideos] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    const generateMailto = () => {
        const email = "bonthalamadhavi1@gmail.com";
        const subject = encodeURIComponent("Support Request: [Issue Summary]");
        const fullName = profile?.full_name || "User";
        
        const bodyTemplate = `Hi HelpDesk.AI Support Team,

I am writing to report an issue regarding:
[ENTER YOUR ISSUE HERE]

Regards,
${fullName}`;

        return `mailto:${email}?subject=${subject}&body=${encodeURIComponent(bodyTemplate)}`;
    };

    // Debounce the search query to avoid hammering the YouTube API quota on every keystroke
    React.useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(searchQuery);
        }, 800);
        return () => clearTimeout(handler);
    }, [searchQuery]);

    React.useEffect(() => {
        const fetchVideos = async () => {
            setIsLoading(true);
            const cacheKey = `yt_videos_v3_${activeTab}_${debouncedSearch}`;
            const cacheTimeKey = `yt_videos_time_v3_${activeTab}_${debouncedSearch}`;
            
            try {
                const cachedData = localStorage.getItem(cacheKey);
                const cacheTimestamp = localStorage.getItem(cacheTimeKey);
                
                // Cache valid for 24 hours to prevent API quota exhaustion
                if (cachedData && cacheTimestamp && (Date.now() - parseInt(cacheTimestamp)) < 86400000) {
                    setVideos(JSON.parse(cachedData));
                    setIsLoading(false);
                    return;
                }

                const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
                if (!API_KEY) {
                    throw new Error("No API Key");
                }

                const query = debouncedSearch
                    ? `IT helpdesk troubleshooting ${debouncedSearch}`
                    : activeTab === 'All' 
                        ? 'IT helpdesk troubleshooting' 
                        : `IT helpdesk ${activeTab.toLowerCase()} troubleshooting`;

                const response = await fetch(
                    `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=12&q=${encodeURIComponent(query)}&type=video&key=${API_KEY}`
                );
                
                if (!response.ok) { throw new Error("API Error"); }
                
                const data = await response.json();
                
                // Decode HTML entities in YouTube titles
                const decodeText = (str) => {
                    return str.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, "&");
                };

                const fetchedVideos = data.items.map(item => ({
                    id: item.id.videoId,
                    title: decodeText(item.snippet.title),
                    description: item.snippet.description,
                    category: activeTab === 'All' ? 'General' : activeTab,
                    url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
                    thumbnail_url: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url
                }));

                localStorage.setItem(cacheKey, JSON.stringify(fetchedVideos));
                localStorage.setItem(cacheTimeKey, Date.now().toString());
                
                setVideos(fetchedVideos);
            } catch (error) {
                console.warn("YouTube API fallback:", error);
                // When API fails, use the static resources but format them to match the new API structure
                const fallbackList = activeTab === 'All' ? YOUTUBE_RESOURCES : YOUTUBE_RESOURCES.filter(v => v.category === activeTab);
                
                // Map the static resources to match the structure expected by the modern UI cards
                const formattedFallback = fallbackList.map(item => {
                    // Extract video ID from the static URL to construct the identical structure
                    const videoId = item.url.split('v=')[1];
                    return {
                        id: videoId || item.id,
                        title: item.title,
                        description: item.description,
                        category: item.category,
                        url: item.url,
                        thumbnail_url: item.thumbnail_url
                    };
                });
                
                setVideos(formattedFallback);
            } finally {
                setIsLoading(false);
            }
        };

        fetchVideos();
    }, [activeTab, debouncedSearch]);

    const faqs = [
        {
            q: "How does the AI categorization work?",
            a: "When you submit a ticket, our DistilBERT model analyzes the text and metadata to instantly route it to the correct support team, bypassing manual triage."
        },
        {
            q: "Can I reopen a resolved ticket?",
            a: "Yes. If an issue reoccurs within 7 days, you can click 'Reopen Ticket' directly from your dashboard to alert the assigned agent."
        },
        {
            q: "Where do I track my active requests?",
            a: "Navigate to the 'My Tickets' page from the top navigation. You can filter by status, priority, or search the resolution logs directly."
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50/50 pb-20">
            {/* Premium Hero Banner */}
            <div className="bg-emerald-900 border-b border-emerald-950/20 relative overflow-hidden">
                {/* Decorative background flare */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/20 blur-[120px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/2" />
                
                <div className="max-w-7xl mx-auto px-6 py-16 lg:py-24 relative z-10 flex flex-col items-center text-center">
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-800/50 text-emerald-200 text-sm font-medium mb-6 border border-emerald-700/50">
                        <LifeBuoy className="w-4 h-4" /> 24/7 Support Center
                    </span>
                    <h1 className="text-4xl lg:text-5xl font-black text-white tracking-tight mb-4 drop-shadow-sm">
                        How can we help you today?
                    </h1>
                    <p className="text-lg text-emerald-100 max-w-2xl mx-auto font-medium opacity-90 mb-10">
                        Search our **Solution Library**, watch curated IT tutorials, or connect with a support agent instantly.
                    </p>

                    {/* Faux Search Bar representing the Hub */}
                    <div className="relative w-full max-w-3xl group">
                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                            <Search className="h-6 w-6 text-emerald-700/50 group-focus-within:text-emerald-600 transition-colors" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search tutorials, FAQs, and documentation..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full text-lg py-5 pl-14 pr-6 rounded-2xl border-0 shadow-2xl bg-white/95 backdrop-blur-xl focus:bg-white text-gray-900 placeholder:text-gray-400 focus:ring-4 focus:ring-emerald-500/20 transition-all outline-none"
                        />
                    </div>
                </div>
            </div>

            {/* Main Content Hub */}
            <main className="max-w-7xl mx-auto px-6 pt-12">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    
                    {/* Left Column: Resources (Takes 3 columns) */}
                    <div className="lg:col-span-3 space-y-8">
                        
                        {/* Interactive UI: Video Hub */}
                        <div className="bg-white rounded-3xl p-6 lg:p-8 shadow-sm border border-gray-100">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                                        <Video className="w-6 h-6 text-emerald-600" /> Curated Video Tutorials
                                    </h2>
                                    <p className="text-gray-500 mt-1">Resolve common issues instantly with expert guides.</p>
                                </div>

                                {/* Modern Tab Filter */}
                                <div className="flex items-center p-1 bg-gray-100 rounded-xl overflow-x-auto scrollbar-hide">
                                    {VIDEO_CATEGORIES.map((category) => (
                                        <button
                                            key={category}
                                            onClick={() => setActiveTab(category)}
                                            className={`px-5 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${
                                                activeTab === category 
                                                ? 'bg-white text-emerald-700 shadow-sm ring-1 ring-gray-900/5' 
                                                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200/50'
                                            }`}
                                        >
                                            {category}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Resource Library Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {isLoading ? (
                                    /* Premium Skeleton Loaders */
                                    Array(6).fill(0).map((_, i) => (
                                        <div key={i} className="rounded-2xl border border-gray-100 bg-white overflow-hidden animate-pulse">
                                            <div className="aspect-video bg-gray-200 w-full" />
                                            <div className="p-5 space-y-3">
                                                <div className="h-5 bg-gray-200 rounded-md w-3/4" />
                                                <div className="h-4 bg-gray-100 rounded-md w-full" />
                                                <div className="h-4 bg-gray-100 rounded-md w-5/6" />
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    videos.map((video) => (
                                        <a 
                                            key={video.id} 
                                            href={video.url} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="group flex flex-col rounded-2xl overflow-hidden border border-gray-100 hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-900/5 transition-all duration-300 hover:-translate-y-1 bg-white cursor-pointer"
                                        >
                                            <div className="relative aspect-video w-full bg-gray-100 overflow-hidden">
                                                <img 
                                                    src={video.thumbnail_url} 
                                                    alt={video.title}
                                                    className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500 ease-out"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                                    <PlayCircle className="w-14 h-14 text-white opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all duration-300 drop-shadow-lg" />
                                                </div>
                                                <div className="absolute top-4 left-4 bg-emerald-600/90 backdrop-blur-md text-white text-xs font-bold tracking-wide px-3 py-1.5 rounded-full shadow-sm">
                                                    {video.category}
                                                </div>
                                            </div>
                                            <div className="p-5 flex flex-col flex-1">
                                                <h4 className="font-bold text-gray-900 text-base leading-snug group-hover:text-emerald-700 transition-colors line-clamp-2">
                                                    {video.title}
                                                </h4>
                                                <p className="text-sm text-gray-500 mt-3 line-clamp-2 mt-auto leading-relaxed">
                                                    {video.description}
                                                </p>
                                            </div>
                                        </a>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Top FAQ Section inside Hub */}
                        <div className="bg-white rounded-3xl p-6 lg:p-8 shadow-sm border border-gray-100 mt-8">
                            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3 mb-8">
                                <Book className="w-6 h-6 text-indigo-500" /> Frequently Asked Questions
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                                {faqs.map((faq, index) => (
                                    <FAQItem key={index} faq={faq} />
                                ))}
                            </div>
                        </div>

                    </div>

                    {/* Right Column: Contact Sidebar (Takes 1 column) */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-gradient-to-b from-gray-900 to-gray-800 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                            <h3 className="text-xl font-bold mb-2">Still Need Help?</h3>
                            <p className="text-gray-400 text-sm mb-6">Our dedicated support teams are ready to assist you.</p>
                            
                            <div className="space-y-3">
                                <a href={generateMailto()} className="w-full group flex items-center justify-between bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl p-4 transition-all focus:outline-none focus:ring-2 focus:ring-white/50 cursor-pointer block">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg group-hover:bg-blue-500 group-hover:text-white transition-colors">
                                            <Mail size={20} />
                                        </div>
                                        <div className="text-left">
                                            <div className="font-bold text-sm">Email Support</div>
                                            <div className="text-xs text-gray-400">Response in 24h</div>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-white transition-colors" />
                                </a>
                            </div>
                        </div>

                        {/* System Status Sidebar Entry */}
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex items-center justify-between">
                            <div>
                                <h4 className="font-bold text-gray-900">System Status</h4>
                                <p className="text-sm text-gray-500 mt-1">All services operational</p>
                            </div>
                            <div className="h-3 w-3 bg-emerald-500 rounded-full animate-pulse ring-4 ring-emerald-50" />
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
};

export default Help;
