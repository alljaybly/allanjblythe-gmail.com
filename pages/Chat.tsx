
import React, { useState, useEffect, useRef, FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Send, Bot, User, BrainCircuit, Link as LinkIcon } from 'lucide-react';
import { useChatStore } from '../store/chatStore';
import { ChatMessage, MessageSender, DashboardFeature, BaselineStatus } from '../types';
import { useDashboardAPI } from '../hooks/useDashboardAPI';
import FeatureBadge from '../components/FeatureBadge';
import { GoogleGenAI } from '@google/genai';

// Helper to map API status to the app's enum
const mapApiStatusToBaselineStatus = (feature: DashboardFeature): BaselineStatus => {
  if (!feature || !feature.baseline) return BaselineStatus.Unknown;
  switch (feature.baseline.status) {
    case 'wide': return BaselineStatus.Widely;
    case 'newly': return BaselineStatus.Newly;
    case 'limited': return BaselineStatus.Limited;
    default: return BaselineStatus.Unknown;
  }
};

// Helper to format the prompt for the AI
const createFeaturePrompt = (feature: DashboardFeature, query: string): string => {
  const supportSummary = feature.browser_support
    .map(s => `${s.browser}: ${s.support.version_added ? `since ${s.support.version_added}` : 'Not supported'}`)
    .join(', ');

  return `
    The user is asking about the web feature "${feature.name}".
    User's query: "${query}"

    Here is the data I have for this feature from the web-platform-dashboard API:
    - Description: ${feature.description}
    - MDN URL: ${feature.mdn_url || 'N/A'}
    - Baseline Status: ${feature.baseline.status} (available since ${feature.baseline.since || 'N/A'})
    - Browser Support: ${supportSummary}

    Based on this data, please provide a comprehensive but easy-to-understand answer. Structure your response as follows:
    1.  **Summary**: Start with a clear, concise explanation of what the feature is and its main purpose.
    2.  **Use Cases**: Give a few practical examples of how a developer would use this feature.
    3.  **Browser Compatibility**: Briefly summarize the compatibility. Mention if it's "widely available" (baseline), "newly available", or has "limited support". Don't just list the versions, but explain what it means for a developer (e.g., "You can use this safely in production," or "You might need fallbacks or polyfills for some users.").
    4.  **Recommendation**: Conclude with a clear recommendation on whether it's ready for production use.
    
    Keep the tone helpful and encouraging. Format the response with markdown (e.g., using **bold** for headings).
  `;
};

const FeatureCard = ({ feature }: { feature: DashboardFeature }) => (
    <div className="mt-4 p-4 bg-light-bg dark:bg-dark-bg rounded-lg border border-light-border dark:border-dark-border">
        <div className="flex justify-between items-start">
            <h4 className="font-bold text-lg">{feature.name}</h4>
            <FeatureBadge status={mapApiStatusToBaselineStatus(feature)} />
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 line-clamp-3">{feature.description}</p>
        {feature.mdn_url && (
            <a href={feature.mdn_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-cosmic-blue mt-3 hover:underline">
                <LinkIcon size={14} /> Read more on MDN
            </a>
        )}
    </div>
);


const Chat = () => {
    const { messages, isLoading, addMessage, setLoading } = useChatStore();
    const [input, setInput] = useState('');
    const location = useLocation();
    const navigate = useNavigate();
    const { data: allFeatures } = useDashboardAPI('/features?limit=2000');
    
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSendMessage = async (messageText: string) => {
        if (!messageText.trim() || isLoading) return;

        const userMessage: ChatMessage = { sender: MessageSender.User, text: messageText };
        addMessage(userMessage);
        setLoading(true);
        setInput('');

        try {
            // Simple NLP: find a feature that matches the query from the fetched list
            const lowerQuery = messageText.toLowerCase();
            const foundFeature = Array.isArray(allFeatures) ? allFeatures.find(f => 
                f.name.toLowerCase().includes(lowerQuery) || 
                f.identifier.toLowerCase().includes(lowerQuery)
            ) : null;
            
            let prompt = `The user asked: "${messageText}". Provide a helpful and concise answer about web development topics.`;
            let featureForResponse: DashboardFeature | undefined = undefined;

            if (foundFeature) {
                prompt = createFeaturePrompt(foundFeature, messageText);
                featureForResponse = foundFeature;
            }
            
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });

            const aiText = response.text;

            const aiMessage: ChatMessage = { sender: MessageSender.AI, text: aiText, feature: featureForResponse };
            addMessage(aiMessage);

        } catch (error) {
            console.error('Error fetching AI response:', error);
            const errorMessage: ChatMessage = {
                sender: MessageSender.AI,
                text: "Sorry, I encountered an error. Please try again later.",
            };
            addMessage(errorMessage);
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const query = queryParams.get('q');
        if (query) {
            handleSendMessage(query);
            // Clear the query param from URL after using it
            navigate('/chat', { replace: true });
        }
    }, [location, allFeatures]); // Rerun if features load after initial query


    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        handleSendMessage(input);
    };

    return (
        <div className="flex flex-col h-[calc(100vh-12rem)] max-w-3xl mx-auto bg-light-card dark:bg-dark-card rounded-xl border border-light-border dark:border-dark-border shadow-lg">
            <div className="flex-1 p-6 overflow-y-auto">
                <div className="space-y-6">
                    {messages.map((msg, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex items-start gap-4 ${msg.sender === MessageSender.User ? 'justify-end' : ''}`}
                        >
                            {msg.sender === MessageSender.AI && (
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-cosmic-blue/20 flex items-center justify-center">
                                    <Bot size={20} className="text-cosmic-blue" />
                                </div>
                            )}
                            <div className={`max-w-xl p-4 rounded-xl ${msg.sender === MessageSender.AI ? 'bg-light-bg dark:bg-dark-bg' : 'bg-cosmic-blue text-white'}`}>
                                <p className="whitespace-pre-wrap">{msg.text}</p>
                                {msg.feature && <FeatureCard feature={msg.feature} />}
                            </div>
                             {msg.sender === MessageSender.User && (
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-200 dark:bg-dark-border flex items-center justify-center">
                                    <User size={20} className="text-slate-600 dark:text-slate-300" />
                                </div>
                            )}
                        </motion.div>
                    ))}
                    {isLoading && (
                         <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-start gap-4"
                        >
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-cosmic-blue/20 flex items-center justify-center">
                                <Bot size={20} className="text-cosmic-blue" />
                            </div>
                            <div className="max-w-md p-4 rounded-xl bg-light-bg dark:bg-dark-bg">
                               <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                                   <motion.div
                                        animate={{ scale: [1, 1.1, 1], opacity: [0.7, 1, 0.7] }}
                                        transition={{ duration: 1.5, repeat: Infinity }}
                                   >
                                     <BrainCircuit size={16} />
                                   </motion.div>
                                    <span>AI is thinking...</span>
                               </div>
                            </div>
                        </motion.div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>
            <div className="p-4 border-t border-light-border dark:border-dark-border">
                <form onSubmit={handleSubmit} className="flex items-center gap-4">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask about a web feature..."
                        disabled={isLoading}
                        className="flex-1 w-full px-4 py-2 rounded-full bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border focus:ring-2 focus:ring-cosmic-blue focus:outline-none disabled:opacity-50"
                    />
                    <button type="submit" disabled={isLoading || !input.trim()} className="p-3 bg-cosmic-blue text-white rounded-full font-semibold hover:opacity-90 transition-all disabled:opacity-50 disabled:scale-100 active:scale-95">
                        <Send size={20} />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Chat;
