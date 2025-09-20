import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { ChatMessage, Language, Source } from '../types';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { streamChat } from '../services/geminiService';
import { SendIcon } from './icons/SendIcon';
import { MicIcon } from './icons/MicIcon';
import { UploadIcon } from './icons/UploadIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';
import type { Content } from '@google/genai';

const Message: React.FC<{ message: ChatMessage }> = ({ message }) => {
    const isModel = message.role === 'model';
    const sources = message.parts.flatMap(p => p.sources || []);
    return (
        <div className={`flex ${isModel ? 'justify-start' : 'justify-end'} mb-4`}>
            <div className={`max-w-xl p-4 rounded-lg shadow-md ${isModel ? 'bg-white' : 'bg-green-100'}`}>
                {message.image && <img src={message.image} alt="user upload" className="rounded-lg mb-2 max-h-60" />}
                {message.isLoading
                    ? <div className="flex items-center space-x-2"><SpinnerIcon className="w-5 h-5" /><p>Kisan Mitra is thinking...</p></div>
                    : message.parts.map((part, index) => <p key={index} className="text-gray-800 whitespace-pre-wrap">{part.text}</p>)
                }
                 {sources.length > 0 && (
                    <div className="mt-4 border-t pt-2">
                        <h4 className="font-semibold text-sm text-gray-600 mb-1">Sources:</h4>
                        <ul className="list-disc list-inside text-xs">
                            {sources.map((source, i) => (
                                <li key={i} className="truncate">
                                    <a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                        {source.title || source.uri}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

interface ChatViewProps {
    title: string;
    description: string;
    language: Language;
    useSearch?: boolean;
    allowImageUpload?: boolean;
    examplePrompts?: { text: string; upload?: boolean }[];
}

export const ChatView: React.FC<ChatViewProps> = ({ title, description, language, useSearch = false, allowImageUpload = false, examplePrompts = [] }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const chatEndRef = useRef<HTMLDivElement>(null);

    const onTranscriptChange = useCallback((transcript: string) => {
        setInput(prev => prev + transcript);
    }, []);

    const { isListening, toggleListening, hasRecognitionSupport, error: speechError } = useSpeechRecognition(onTranscriptChange);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleExampleClick = (prompt: { text: string; upload?: boolean }) => {
        setInput(prompt.text);
        if (prompt.upload && allowImageUpload) {
            fileInputRef.current?.click();
        }
    };
    
    const sendMessage = async () => {
        if (!input.trim() && !imageFile) return;

        const userMessage: ChatMessage = {
            role: 'user',
            parts: [{ text: input }],
            image: imagePreview || undefined,
        };
        
        setMessages(prev => [...prev, userMessage, { role: 'model', parts: [], isLoading: true }]);
        setInput('');
        setImageFile(null);
        setImagePreview(null);
        setIsLoading(true);

        const history: Content[] = messages.map(msg => ({
            role: msg.role,
            parts: msg.parts.map(p => ({text: p.text}))
        }));

        try {
            const stream = await streamChat({ prompt: input, image: imageFile, language: language.name, useSearch, history });
            
            let currentText = '';
            let currentSources: Source[] = [];
            
            setMessages(prev => prev.slice(0, -1)); // Remove loader
            setMessages(prev => [...prev, { role: 'model', parts: [{ text: '' }] }]);

            for await (const chunk of stream) {
                const text = chunk.text;
                const groundingMetadata = chunk.candidates?.[0]?.groundingMetadata;
                if(groundingMetadata?.groundingChunks) {
                    currentSources = groundingMetadata.groundingChunks
                        .map((c: any) => c.web)
                        .filter(Boolean) as Source[];
                }

                currentText += text;

                setMessages(prev => {
                    const lastMsgIndex = prev.length - 1;
                    const newMessages = [...prev];
                    if (newMessages[lastMsgIndex]?.role === 'model') {
                        newMessages[lastMsgIndex] = { ...newMessages[lastMsgIndex], parts: [{ text: currentText, sources: currentSources }] };
                    }
                    return newMessages;
                });
            }

        } catch (error) {
            console.error("Error streaming chat:", error);
             setMessages(prev => {
                const lastMsgIndex = prev.length - 1;
                const newMessages = [...prev];
                if(newMessages[lastMsgIndex]?.isLoading) {
                    newMessages[lastMsgIndex] = { role: 'model', parts: [{ text: 'Sorry, I encountered an error. Please try again.' }] };
                }
                return newMessages;
            });
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="flex flex-col h-full">
            <header className="p-6 border-b border-gray-200">
                <h2 className="text-3xl font-bold text-gray-800">{title}</h2>
                <p className="text-md text-gray-600 mt-1">{description}</p>
            </header>
            <main className="flex-grow p-6 overflow-y-auto">
                {messages.length === 0 && examplePrompts.length > 0 && (
                     <div className="text-center max-w-3xl mx-auto">
                        <p className="text-gray-500 mb-6">Start the conversation by asking a question below, or try one of these examples.</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {examplePrompts.map((prompt, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleExampleClick(prompt)}
                                    className="p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border text-left text-gray-700 hover:border-green-300 flex items-center space-x-3"
                                >
                                    {prompt.upload && <UploadIcon className="w-5 h-5 text-green-600 flex-shrink-0" />}
                                    <span>{prompt.text}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
                {messages.map((msg, index) => <Message key={index} message={msg} />)}
                {messages.length === 0 && examplePrompts.length === 0 && (
                     <div className="text-center text-gray-500">Start the conversation by asking a question below.</div>
                )}
                <div ref={chatEndRef} />
            </main>
            <footer className="p-4 border-t border-gray-200 bg-white">
                {imagePreview && (
                    <div className="relative w-24 h-24 mb-2">
                        <img src={imagePreview} alt="upload preview" className="w-full h-full object-cover rounded-lg" />
                        <button onClick={() => { setImageFile(null); setImagePreview(null); }} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center font-bold">&times;</button>
                    </div>
                )}
                <div className="flex items-center space-x-2">
                    {allowImageUpload && (
                         <>
                            <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageChange} className="hidden" />
                            <button onClick={() => fileInputRef.current?.click()} className="p-2 text-gray-500 hover:text-green-600 rounded-full hover:bg-gray-100 transition-colors" disabled={isLoading}>
                                <UploadIcon className="w-6 h-6" />
                            </button>
                         </>
                    )}
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                        placeholder="Type your question here..."
                        className="flex-grow p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-green-500 focus:outline-none"
                        rows={1}
                        disabled={isLoading}
                    />
                    {hasRecognitionSupport && (
                        <button onClick={() => toggleListening(language.code)} className={`p-2 rounded-full transition-colors ${isListening ? 'bg-red-500 text-white' : 'text-gray-500 hover:text-green-600 hover:bg-gray-100'}`} disabled={isLoading}>
                            <MicIcon className="w-6 h-6" />
                        </button>
                    )}
                    <button onClick={sendMessage} className="p-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-green-300 transition-colors" disabled={isLoading}>
                        <SendIcon className="w-6 h-6" />
                    </button>
                </div>
                {speechError && (
                    <p className="text-red-600 text-sm mt-2 text-center" role="alert">
                        {speechError}
                    </p>
                )}
            </footer>
        </div>
    );
};