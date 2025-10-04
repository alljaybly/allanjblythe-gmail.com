import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Send, Bot, User, CornerDownLeft, Sparkles, Loader } from 'lucide-react';
import { useChatStore } from '../store/chatStore';
import { MessageSender, ChatMessage, DashboardFeature } from '../types';
import { GoogleGenAI } from '@google/genai';
import { useDashboardAPI } from '../hooks/useDashboardAPI';
import FeatureBadge from '../components/FeatureBadge';
import { mapApiStatusToBaselineStatus } from '../services/codeScanner';

// Lazy load the modal component for better performance
const FeatureDetailModal = lazy(() => import('../components/FeatureDetailModal'));

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

const findFeatureByName = (name: string, featureMap: DashboardFeature[] | null): DashboardFeature | undefined => {
    if (!featureMap) return undefined;
    const lowerName = name.toLowerCase().trim().replace(/api$/i, '').trim();
    return featureMap.find(f => f.name.toLowerCase().trim() === lowerName);
};

const Chat = () => {
    const { messages, isLoading, addMessage, setLoading } = useChatStore();
    const [input, setInput] = useState('');
    const [searchParams, setSearchParams] = useSearchParams();
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [selectedFeature, setSelectedFeature] = useState<DashboardFeature | null>(null);

    const { data: allFeatures } = useDashboardAPI('/features?limit=2000');

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSendMessage = async (query: string) => {
        if (!query.trim()) return;

        const userMessage: ChatMessage = {
            sender: MessageSender.User,
            text: query,
        };
        addMessage(userMessage);
        setLoading(true);
        setInput('');

        try {
            const detectedFeature = findFeatureByName(query, allFeatures);
            
            let prompt = `You are Baseline Feature Scout, an expert on web platform features and their browser support status according to the Baseline standard. Keep your answers concise and helpful for web developers. Here is the user's question: "${query}"`;

            if (detectedFeature) {
                prompt = `You are Baseline Feature Scout, an expert assistant for web developers focused on browser compatibility and the Baseline standard.
The user is asking about "${query}".

I have retrieved the following structured data for the most relevant feature from the Web Platform Dashboard API. **You must base your answer on this data.**

**Feature Data:**
*   **Name:** ${detectedFeature.name}
*   **Status:** Baseline ${detectedFeature.baseline.status} (since ${detectedFeature.baseline.since || 'N/A'})
*   **Description:** ${detectedFeature.description}
*   **MDN Link:** ${detectedFeature.mdn_url || 'N/A'}

**Your Task:**
1.  Confirm you are talking about the **${detectedFeature.name}** feature.
2.  Briefly explain what it does, using the provided description.
3.  Clearly state its Baseline status and what that means for production use.
4.  If an MDN link is available, encourage the user to read more there.
5.  Keep the tone helpful and direct. Do not mention that you were given this data; just use it.`;
            }
            
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });
            
            const aiMessage: ChatMessage = {
                sender: MessageSender.AI,
                text: response.text,
                feature: detectedFeature,
            };
            addMessage(aiMessage);

        } catch (error) {
            console.error('Error fetching AI response:', error);
            const errorMessage: ChatMessage = {
                sender: MessageSender.AI,
                text: "Sorry, I encountered an error while trying to respond. Please check the console for details or try again later.",
            };
            addMessage(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const initialQuery = searchParams.get('q');
        if (initialQuery && allFeatures) {
            handleSendMessage(initialQuery);
            searchParams.delete('q');
            setSearchParams(searchParams, { replace: true });
        }
    }, [searchParams, allFeatures]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleSendMessage(input);
    };

    return (
        <div className="flex flex-col h-[calc(100vh-12rem)] max-w-3xl mx-auto bg-light-card dark:bg-dark-card rounded-xl border border-light-border dark:border-dark-border shadow-lg relative">
            <div className="flex-1 p-6 space-y-6 overflow-y-auto">
                {messages.map((message, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className={`flex items-start gap-4 ${message.sender === MessageSender.User ? 'justify-end' : ''}`}
                    >
                        {message.sender === MessageSender.AI && (
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-cosmic-blue/20 flex items-center justify-center">
                                <Bot size={20} className="text-cosmic-blue" />
                            </div>
                        )}
                        <div className={`max-w-md p-4 rounded-xl ${message.sender === MessageSender.User ? 'bg-cosmic-blue text-white rounded-br-none' : 'bg-light-bg dark:bg-dark-bg rounded-bl-none'}`}>
                            <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                            {message.feature && (
                                <div
                                    className="mt-4 p-3 bg-slate-200/50 dark:bg-slate-800/50 rounded-lg border border-light-border dark:border-dark-border cursor-pointer hover:border-cosmic-blue/50 transition-colors"
                                    onClick={() => setSelectedFeature(message.feature)}
                                    aria-label={`View details for ${message.feature.name}`}
                                    role="button"
                                >
                                    <div className="flex justify-between items-center">
                                       <h4 className="font-bold text-base">{message.feature.name}</h4>
                                       <FeatureBadge status={mapApiStatusToBaselineStatus(message.feature)} />
                                    </div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-3">{message.feature.description}</p>
                                    {message.feature.mdn_url && (
                                        <a
                                            href={message.feature.mdn_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-xs text-cosmic-blue font-semibold hover:underline mt-2 inline-block"
                                            onClick={(e) => e.stopPropagation()} // Prevent modal from opening when clicking link
                                        >
                                            Read on MDN &rarr;
                                        </a>
                                    )}
                                </div>
                            )}
                        </div>
                        {message.sender === MessageSender.User && (
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-200 dark:bg-dark-border flex items-center justify-center">
                                <User size={20} />
                            </div>
                        )}
                    </motion.div>
                ))}
                {isLoading && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-start gap-4"
                    >
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-cosmic-blue/20 flex items-center justify-center">
                            <Bot size={20} className="text-cosmic-blue" />
                        </div>
                        <div className="max-w-md p-4 rounded-xl bg-light-bg dark:bg-dark-bg rounded-bl-none">
                            <div className="flex items-center gap-2">
                                <Sparkles size={16} className="text-cosmic-blue animate-pulse" />
                                <p className="text-sm text-slate-500 dark:text-slate-400">Thinking...</p>
                            </div>
                        </div>
                    </motion.div>
                )}
                <div ref={messagesEndRef} />
            </div>
            <div className="p-4 border-t border-light-border dark:border-dark-border">
                <form onSubmit={handleSubmit} className="relative">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask about a web feature..."
                        disabled={isLoading}
                        className="w-full pl-4 pr-24 py-3 rounded-full bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border focus:ring-2 focus:ring-cosmic-blue focus:outline-none disabled:opacity-60"
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !input.trim()}
                        className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2 px-4 py-2 bg-cosmic-blue text-white rounded-full font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Sending' : 'Send'}
                        <Send size={16} />
                    </button>
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 hidden md:flex items-center gap-1 text-xs text-slate-400">
                        <span>Press</span>
                        <CornerDownLeft size={12}/>
                        <span>to send</span>
                    </div>
                </form>
            </div>

            {/* Modal rendering */}
            <Suspense fallback={
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
                    <Loader className="animate-spin text-white" size={48} />
                </div>
            }>
                {selectedFeature && (
                    <FeatureDetailModal 
                        feature={selectedFeature} 
                        onClose={() => setSelectedFeature(null)} 
                    />
                )}
            </Suspense>
        </div>
    );
};

export default Chat;