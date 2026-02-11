'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
    LayoutDashboard,
    FolderGit2,
    Users,
    BarChart3,
    Sparkles,
    TestTube,
    Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Repositories', href: '/repositories', icon: FolderGit2 },
    { name: 'Students', href: '/students', icon: Users },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'AI Feedback', href: '/feedback', icon: Sparkles },
    { name: 'Test APIs', href: '/test', icon: TestTube },
    { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
    const pathname = usePathname();
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await fetch('/api/user');
                const data = await response.json();
                if (data.success) {
                    setUser(data.user);
                }
            } catch (error) {
                console.error('Error fetching user:', error);
            }
        };

        fetchUser();
    }, []);

    return (
        <div className="flex h-full w-64 flex-col border-r bg-card">
            <div className="flex h-16 items-center border-b px-6">
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Student Progress
                </h1>
            </div>
            <nav className="flex-1 space-y-1 px-3 py-4">
                {navigation.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                                isActive
                                    ? 'bg-primary text-primary-foreground'
                                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                            )}
                        >
                            <item.icon className="h-5 w-5" />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>
            <div className="border-t p-4">
                <div className="flex items-center gap-3">
                    {user?.avatar ? (
                        <img
                            src={user.avatar}
                            alt={user.name || user.login}
                            className="h-10 w-10 rounded-full border-2 border-border"
                        />
                    ) : (
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                            {user?.name?.[0] || user?.login?.[0] || 'U'}
                        </div>
                    )}
                    <div className="flex-1 overflow-hidden">
                        <p className="text-sm font-medium truncate">
                            {user?.name || user?.login || 'Demo User'}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                            {user?.email || `${user?.login}@users.noreply.github.com`}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
