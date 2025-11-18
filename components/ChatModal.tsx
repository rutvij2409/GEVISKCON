import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Chat } from "@google/genai";
import { InventoryItem } from '../types';
import { Modal } from './Modal';
import { Loader } from './Loader';
import { Icon } from './Icon';
import { AnimatedAIcon } from './AnimatedAIcon';

interface ChatModalProps {
  items: InventoryItem[];
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  author: 'user' | 'ai';
  content: string;
}

// A simple markdown renderer for lists
const renderMarkdown = (text: string) => {
  // Replace bullet points like * or - with list items
  const listItems = text.replace(/^\s*[\*\-]\s*(.*)/gm, '<li>$1</li>');
  // Wrap lists in <ul> tags if they are not already
  const withUl = listItems.replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>');
  return withUl.replace(/\n/g, '<br />');
};


export const ChatModal: React.FC<ChatModalProps> = ({ items, isOpen, onClose }) => {
  const [chatSession, setChatSession] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    if (isOpen) {
      const initializeChat = async () => {
        setIsLoading(true);
        setMessages([]); // Clear previous conversation

        try {
          const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
          const newChatSession = ai.chats.create({
            model: 'gemini-2.5-flash',
            config: {
              systemInstruction: `You are an expert AI inventory assistant. You will be given a list of inventory items that currently have stock (a quantity greater than zero).
                Your role is to answer user questions based ONLY on this provided data.
                - If a user asks about an item that is not in the list you were given, you should state that it is not currently in stock.
                - Be friendly, concise, and helpful.
                - When asked for numbers or totals (like 'how many entries'), provide them clearly based on the data you have.
                - When asked for lists of items, format them as a bulleted list.
                - Do not mention that you are working with JSON data. Just use the data to answer questions naturally.
                - Start the conversation by confirming you have analyzed the current in-stock inventory and are ready for questions.`
            },
          });
          setChatSession(newChatSession);

          const activeItems = items.filter(item => item.quantity > 0);
          const inventoryContext = `Here is the current inventory data based on items with a quantity greater than zero: ${JSON.stringify(activeItems)}`;
          const response = await newChatSession.sendMessage({ message: inventoryContext });

          setMessages([{ author: 'ai', content: response.text }]);
        } catch (error) {
          console.error("Failed to initialize chat:", error);
          setMessages([{ author: 'ai', content: "Sorry, I couldn't connect to the AI service. Please check your API key and network connection." }]);
        } finally {
          setIsLoading(false);
        }
      };
      initializeChat();
    } else {
      setChatSession(null); // Clean up session on close
    }
  }, [isOpen, items]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || !chatSession || isLoading) return;

    const userMessage: Message = { author: 'user', content: userInput };
    setMessages(prev => [...prev, userMessage]);
    setUserInput('');
    setIsLoading(true);

    try {
      const response = await chatSession.sendMessage({ message: userInput });
      const aiMessage: Message = { author: 'ai', content: response.text };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error("Failed to send message:", error);
      const errorMessage: Message = { author: 'ai', content: "I'm having trouble responding right now. Please try again later." };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="AI Inventory Assistant">
        <div className="flex flex-col h-[70vh]">
            <div className="flex-grow overflow-y-auto pr-4 -mr-4 space-y-4">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex items-end gap-2 ${msg.author === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.author === 'ai' && <AnimatedAIcon size="small" className="w-8 h-8 self-start flex-shrink-0" />}
                        <div 
                            className={`max-w-md lg:max-w-lg px-4 py-2 rounded-2xl ${
                                msg.author === 'user' 
                                ? 'bg-amber-500 text-white rounded-br-none' 
                                : 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-bl-none'
                            }`}
                        >
                            <p className="text-sm" dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }}></p>
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                        <Loader />
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSendMessage} className="flex-shrink-0 pt-4 flex items-center gap-2">
                <input
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder="Ask about your inventory..."
                    className="flex-grow w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-full bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    disabled={isLoading}
                />
                <button type="submit" className="bg-amber-600 text-white p-3 rounded-full shadow-sm hover:bg-amber-700 disabled:bg-amber-300" disabled={isLoading || !userInput.trim()}>
                    <Icon path="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" className="w-5 h-5" />
                </button>
            </form>
        </div>
    </Modal>
  );
};
