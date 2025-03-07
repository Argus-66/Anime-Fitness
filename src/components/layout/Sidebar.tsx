'use client';

import { useEffect, useState } from 'react';
import { getUser } from '@/lib/auth';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaHome, FaTrophy, FaDumbbell, FaCalendarAlt, FaMedal, FaUser } from 'react-icons/fa';

export default function Sidebar({ className = '' }: { className?: string }) {
  const [username, setUsername] = useState<string | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const user = getUser();
    if (user) {
      setUsername(user.username);
    }
  }, []);

  const navItems = [
    { name: 'Dashboard', icon: FaHome, href: '/dashboard' },
    { name: 'Leaderboard', icon: FaTrophy, href: '/dashboard/leaderboard' },
    { name: 'Workouts', icon: FaDumbbell, href: '/dashboard/workouts' },
    { name: 'Training Plans', icon: FaCalendarAlt, href: '/dashboard/training' },
    { name: 'Achievements', icon: FaMedal, href: '/dashboard/achievements' },
    { name: 'Profile', icon: FaUser, href: username ? `/${username}` : '/login' },
  ];

  return (
    <div className={`w-64 bg-solo-dark/95 backdrop-blur-md h-screen flex flex-col ${className}`}>
      <div className="p-6 border-b border-solo-purple/20">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-solo-light to-solo-beige text-transparent bg-clip-text">
          Fitness Quest
        </h1>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive 
                  ? 'bg-solo-accent text-white shadow-[0_0_15px_rgba(82,43,91,0.5)]' 
                  : 'text-solo-light hover:bg-solo-purple/20 hover:text-white hover:shadow-[0_0_10px_rgba(82,43,91,0.3)]'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
