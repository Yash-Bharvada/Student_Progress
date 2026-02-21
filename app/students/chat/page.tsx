'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar, TopBar } from "@/components/app-sidebar";

interface Message {
    _id: string;
    sender: { _id: string; name: string; avatar?: string; role: string } | string;
    receiver: string;
    content: string;
    createdAt: string;
}

interface User {
    _id?: string;
    id?: string;
    name: string;
    mentorId?: string;
    role: string;
}

export default function StudentChatPage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [mentor, setMentor] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [currentUser, setCurrentUser] = useState<User | null>(null);

    // Fetch current user and their mentor
    useEffect(() => {
        const fetchUserAndMentor = async () => {
            try {
                // 1. Get current user profile to find mentorId
                const userRes = await fetch('/api/user');
                if (!userRes.ok) throw new Error('Failed to fetch user');
                const userData = await userRes.json();
                const currentUser = userData.user;
                setCurrentUser(currentUser);

                if (currentUser.mentorId) {
                    const chatRes = await fetch(`/api/chat/${currentUser.mentorId}`);
                    if (chatRes.ok) {
                        const chatData = await chatRes.json();
                        setMessages(chatData);
                    }
                }

            } catch (error) {
                console.error('Error loading chat:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserAndMentor();
    }, []);

    // Poll for new messages every 5 seconds
    useEffect(() => {
        if (!currentUser?.mentorId) return;

        const interval = setInterval(async () => {
            try {
                const res = await fetch(`/api/chat/${currentUser.mentorId}`);
                if (res.ok) {
                    const data = await res.json();
                    setMessages(data);
                }
            } catch (error) {
                console.error('Error polling messages:', error);
            }
        }, 5000);

        return () => clearInterval(interval);
    }, [currentUser?.mentorId]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !currentUser?.mentorId) return;

        setSending(true);
        try {
            const res = await fetch('/api/chat/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    receiverId: currentUser.mentorId,
                    content: newMessage,
                }),
            });

            if (res.ok) {
                const savedMessage = await res.json();
                setMessages((prev) => [...prev, savedMessage]);
                setNewMessage('');
            } else {
                console.error('Failed to send message');
            }
        } catch (error) {
            console.error('Error sending message:', error);
        } finally {
            setSending(false);
        }
    };

    if (loading) return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset className="bg-background">
                <TopBar />
                <div className="p-8 text-center">Loading chat...</div>
            </SidebarInset>
        </SidebarProvider>
    );

    if (!currentUser?.mentorId) {
        return (
            <SidebarProvider>
                <AppSidebar />
                <SidebarInset className="bg-background">
                    <TopBar />
                    <div className="p-8 text-center">
                        <h1 className="text-2xl font-bold mb-4">Chat with Mentor</h1>
                        <p className="text-gray-500">You do not have an assigned mentor yet.</p>
                    </div>
                </SidebarInset>
            </SidebarProvider>
        );
    }

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset className="bg-background flex flex-col h-screen overflow-hidden">
                <TopBar />
                <div className="flex flex-col flex-1 w-full p-4 overflow-hidden">
                    <div className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 p-4 flex items-center justify-between rounded-t-lg shadow-sm shrink-0">
                        <h1 className="text-xl font-semibold dark:text-white">
                            Chat with Mentor
                        </h1>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-zinc-900/50 space-y-4 rounded-b-lg shadow-inner">
                        {messages.length === 0 ? (
                            <p className="text-center text-gray-500 dark:text-gray-400 my-8">No messages yet. Start the conversation!</p>
                        ) : (
                            messages.map((msg) => {
                                const senderId = typeof msg.sender === 'string' ? msg.sender : msg.sender._id;
                                const currentUserId = currentUser?.id || currentUser?._id;
                                const isMe = senderId === currentUserId;

                                return (
                                    <div
                                        key={msg._id}
                                        className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div
                                            className={`max-w-[70%] rounded-lg p-3 ${isMe
                                                ? 'bg-blue-600 text-white rounded-br-none'
                                                : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border dark:border-gray-700 rounded-bl-none shadow-sm'
                                                }`}
                                        >
                                            <p>{msg.content}</p>
                                            <span
                                                className={`text-xs block mt-1 ${isMe ? 'text-blue-100' : 'text-gray-400 dark:text-gray-500'
                                                    }`}
                                            >
                                                {new Date(msg.createdAt).toLocaleTimeString([], {
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <form onSubmit={handleSendMessage} className="mt-4 flex gap-2 shrink-0">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type your message..."
                            className="flex-1 p-3 border dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 dark:text-white"
                            disabled={sending}
                        />
                        <button
                            type="submit"
                            disabled={sending || !newMessage.trim()}
                            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {sending ? 'Sending...' : 'Send'}
                        </button>
                    </form>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
