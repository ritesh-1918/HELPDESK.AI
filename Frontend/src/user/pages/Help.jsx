import React, { useState } from 'react';
import { HelpCircle, Mail, MessageSquare, Book, ChevronRight, Video, PlayCircle, Filter } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card";
import { YOUTUBE_RESOURCES, VIDEO_CATEGORIES } from '../../data/youtubeResources';

const Help = () => {
    const [activeTab, setActiveTab] = useState('All');
    const [videos, setVideos] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    React.useEffect(() => {
        const fetchVideos = async () => {
            setIsLoading(true);
            const cacheKey = `youtube_videos_${activeTab}`;
            const cacheTimeKey = `youtube_videos_time_${activeTab}`;
            
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

                const query = activeTab === 'All' 
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
                const fallback = activeTab === 'All' ? YOUTUBE_RESOURCES : YOUTUBE_RESOURCES.filter(v => v.category === activeTab);
                setVideos(fallback);
            } finally {
                setIsLoading(false);
            }
        };

        fetchVideos();
    }, [activeTab]);

    const faqs = [
        {
            q: "How does the AI categorization work?",
            a: "When you submit a ticket, our AI analyzes the text and any uploaded screenshots to identify the core issue, categorize it, and assign it to the correct support team automatically."
        },
        {
            q: "Can I reopen a resolved ticket?",
            a: "Yes. If an issue reoccurs or the provided solution didn't fully resolve your problem, you can click 'Reopen Ticket' on the ticket detail page."
        },
        {
            q: "How do I check the status of my ticket?",
            a: "Navigate to the 'My Tickets' page from the top navigation. You can filter by status, priority, or search for specific tickets."
        }
    ];

    return (
        <div className="min-h-screen bg-[#f6f8f7] pb-20">
            <main className="pt-10 px-6 max-w-4xl mx-auto space-y-8">

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                        <HelpCircle className="text-emerald-600 w-8 h-8" /> Help & Support
                    </h1>
                    <p className="text-gray-500 font-medium mt-2">
                        Find answers to common questions or get in touch with our team.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Contact Cards */}
                    <Card className="rounded-2xl border border-emerald-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer bg-white group">
                        <CardContent className="p-6 flex items-start gap-4">
                            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl group-hover:scale-110 transition-transform">
                                <MessageSquare size={24} />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-gray-900">Live Chat</h3>
                                <p className="text-sm text-gray-500 mt-1">Chat with our support bot or request a human agent.</p>
                            </div>
                            <ChevronRight className="text-gray-300 group-hover:text-emerald-500 transition-colors" />
                        </CardContent>
                    </Card>

                    <Card className="rounded-2xl border border-blue-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer bg-white group">
                        <CardContent className="p-6 flex items-start gap-4">
                            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:scale-110 transition-transform">
                                <Mail size={24} />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-gray-900">Email Support</h3>
                                <p className="text-sm text-gray-500 mt-1">Send us a detailed message at support@helpdesk.ai.</p>
                            </div>
                            <ChevronRight className="text-gray-300 group-hover:text-blue-500 transition-colors" />
                        </CardContent>
                    </Card>
                </div>

                {/* FAQ Section */}
                <Card className="rounded-2xl border border-gray-100 shadow-sm bg-white overflow-hidden">
                    <CardHeader className="bg-gray-50/50 border-b border-gray-100 pb-4">
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Book className="w-5 h-5 text-gray-400" /> Frequently Asked Questions
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                        {faqs.map((faq, index) => (
                            <div key={index} className="space-y-2">
                                <h4 className="font-bold text-gray-900">{faq.q}</h4>
                                <p className="text-gray-600 text-sm leading-relaxed">{faq.a}</p>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Video Tutorials Section */}
                <Card className="rounded-2xl border border-gray-100 shadow-sm bg-white overflow-hidden">
                    <CardHeader className="bg-gray-50/50 border-b border-gray-100 pb-4">
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Video className="w-5 h-5 text-gray-400" /> Video Tutorials
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        
                        {/* Tabs */}
                        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-4 scrollbar-hide">
                            <Filter className="w-4 h-4 text-gray-400 mr-2 shrink-0" />
                            {VIDEO_CATEGORIES.map((category) => (
                                <button
                                    key={category}
                                    onClick={() => setActiveTab(category)}
                                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                                        activeTab === category 
                                        ? 'bg-emerald-600 text-white shadow-sm' 
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                >
                                    {category}
                                </button>
                            ))}
                        </div>

                        {/* Video Grid */}
                        {isLoading ? (
                            <div className="flex justify-center items-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {videos.map((video) => (
                                    <a 
                                        key={video.id} 
                                        href={video.url} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="group flex flex-col rounded-xl overflow-hidden border border-gray-100 hover:shadow-lg transition-all hover:-translate-y-1 bg-white cursor-pointer"
                                    >
                                        <div className="relative aspect-video w-full bg-gray-100 overflow-hidden border-b border-gray-100">
                                            <img 
                                                src={video.thumbnail_url} 
                                                alt={video.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                                                <PlayCircle className="w-12 h-12 text-white opacity-90 group-hover:scale-110 transition-transform shadow-sm rounded-full" />
                                            </div>
                                            <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm text-white text-xs font-semibold px-2 py-1 rounded">
                                                {video.category}
                                            </div>
                                        </div>
                                        <div className="p-4 flex-1 flex flex-col">
                                            <h4 className="font-bold text-gray-900 line-clamp-2 leading-snug group-hover:text-emerald-700 transition-colors">
                                                {video.title}
                                            </h4>
                                            <p className="text-xs text-gray-500 mt-2 line-clamp-2 mt-auto">
                                                {video.description}
                                            </p>
                                        </div>
                                    </a>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

            </main>
        </div>
    );
};

export default Help;
