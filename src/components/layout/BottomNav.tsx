'use client';

import { useEffect, useState } from 'react';
import { getUser } from '@/lib/auth';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaHome, FaTrophy, FaDumbbell, FaCalendarAlt, FaMedal, FaUser } from 'react-icons/fa';

export default function BottomNav({ className = '' }: { className?: string }) {
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
    { name: 'Training', icon: FaCalendarAlt, href: '/dashboard/training' },
    { name: 'Achievements', icon: FaMedal, href: '/dashboard/achievements' },
    { name: 'Profile', icon: FaUser, href: username ? `/${username}` : '/login' },
  ];

  return (
    <nav className={`bg-solo-dark border-t border-solo-purple/20 py-2 ${className}`}>
      <div className="flex justify-around items-center">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center p-2 ${
                isActive ? 'text-solo-accent' : 'text-solo-light hover:text-white'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-xs mt-1">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
