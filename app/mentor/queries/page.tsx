'use client';

import { useState, useEffect, useRef } from 'react';


import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar, TopBar } from "@/components/app-sidebar";

interface Student {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
    course?: string;
}

interface Message {
    _id: string;
    sender: { _id: string; name: string } | string;
    receiver: string;
    content: string;
    createdAt: string;
}

export default function MentorQueryPage() {
    const [students, setStudents] = useState<Student[]>([]);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [user, setUser] = useState<any>(null); // Store current mentor info

    // Fetch students assigned to mentor
    useEffect(() => {
        const fetchStudents = async () => {
            // Fetch current user to define 'me' in chat
            try {
                const userRes = await fetch('/api/user');
                if (userRes.ok) {
                    const userData = await userRes.json();
                    setUser(userData.user);
                }

                const res = await fetch('/api/mentor/students');
                if (res.ok) {
                    const data = await res.json();
                    // Handle different response structures if needed (array or { success: true, students: [] })
                    const studentList = Array.isArray(data) ? data : data.students;
                    setStudents(studentList || []);
                }
            } catch (error) {
                console.error('Error fetching students:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStudents();
    }, []);

    // Fetch messages when a student is selected
    useEffect(() => {
        if (!selectedStudent) return;

        const fetchMessages = async () => {
            try {
                const res = await fetch(`/api/chat/${selectedStudent._id}`);
                if (res.ok) {
                    const data = await res.json();
                    setMessages(data);
                }
            } catch (error) {
                console.error('Error fetching messages:', error);
            }
        };

        fetchMessages();

        // Polling for new messages
        const interval = setInterval(fetchMessages, 5000);
        return () => clearInterval(interval);
    }, [selectedStudent]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedStudent) return;

        try {
            const res = await fetch('/api/chat/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    receiverId: selectedStudent._id,
                    content: newMessage,
                }),
            });

            if (res.ok) {
                const savedMessage = await res.json();
                setMessages((prev) => [...prev, savedMessage]);
                setNewMessage('');
            }
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    if (loading) return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset className="bg-background">
                <TopBar />
                <div className="p-8 text-center">Loading...</div>
            </SidebarInset>
        </SidebarProvider>
    );

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset className="bg-background flex flex-col h-screen overflow-hidden">
                <TopBar />
                <div className="flex flex-1 w-full gap-4 p-4 overflow-hidden">
                    {/* Sidebar - Student List */}
                    <div className="w-80 flex-shrink-0 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg shadow-sm overflow-hidden flex flex-col">
                        <div className="p-4 border-b dark:border-gray-700 bg-gray-50 dark:bg-zinc-900/50">
                            <h2 className="font-semibold text-gray-700 dark:text-gray-200">Assigned Students</h2>
                        </div>
                        <div className="overflow-y-auto flex-1">
                            {students.length === 0 ? (
                                <p className="p-4 text-center text-gray-500 dark:text-gray-400">No students assigned.</p>
                            ) : (
                                students.map((student) => (
                                    <div
                                        key={student._id}
                                        onClick={() => setSelectedStudent(student)}
                                        className={`p-4 border-b dark:border-gray-700 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors flex items-center gap-3 ${selectedStudent?._id === student._id ? 'bg-blue-100 dark:bg-blue-900/40 border-l-4 border-l-blue-600' : ''
                                            }`}
                                    >
                                        <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-white font-bold">
                                            {student.avatar ? (
                                                <img src={student.avatar} alt={student.name} className="w-full h-full rounded-full" />
                                            ) : (
                                                student.name.charAt(0).toUpperCase()
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="font-medium text-gray-800 dark:text-gray-100">{student.name}</h3>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">{student.course || 'No Course'}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Main Chat Area */}
                    <div className="flex-1 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg shadow-sm flex flex-col overflow-hidden min-w-0">
                        {selectedStudent ? (
                            <>
                                <div className="p-4 border-b dark:border-gray-700 bg-gray-50 dark:bg-zinc-900/50 flex items-center justify-between shrink-0">
                                    <h2 className="font-semibold text-gray-700 dark:text-gray-200">Chat with {selectedStudent.name}</h2>
                                    <span className="text-xs text-gray-400 dark:text-gray-500">
                                        {selectedStudent.email}
                                    </span>
                                </div>

                                <div className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-zinc-900/50 space-y-4">
                                    {messages.length === 0 ? (
                                        <p className="text-center text-gray-500 dark:text-gray-400 my-8">No conversation yet.</p>
                                    ) : (
                                        messages.map((msg) => {
                                            // Determine if I sent the message
                                            // API returns 'id', Mongoose message returns '_id' or string
                                            const senderId = typeof msg.sender === 'string' ? msg.sender : msg.sender._id;
                                            const currentUserId = user?.id || user?._id;
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
                                                        <p className="text-sm">{msg.content}</p>
                                                        <span
                                                            className={`text-[10px] block mt-1 text-right ${isMe ? 'text-blue-200' : 'text-gray-400 dark:text-gray-500'
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

                                <div className="p-4 bg-white dark:bg-gray-800 border-t dark:border-gray-700 shrink-0">
                                    <form onSubmit={handleSendMessage} className="flex gap-2">
                                        <input
                                            type="text"
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            placeholder="Type a reply..."
                                            className="flex-1 p-3 border dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 dark:text-white"
                                        />
                                        <button
                                            type="submit"
                                            disabled={!newMessage.trim()}
                                            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
                                        >
                                            Send
                                        </button>
                                    </form>
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 dark:text-gray-500">
                                <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                                <p className="text-lg font-medium">Select a student to start chatting</p>
                            </div>
                        )}
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
