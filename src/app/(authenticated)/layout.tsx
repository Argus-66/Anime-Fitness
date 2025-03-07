'use client';

import Sidebar from '@/components/layout/Sidebar';
import BottomNav from '@/components/layout/BottomNav';

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-solo-dark overflow-hidden">
      <Sidebar className="hidden md:flex fixed left-0 top-0 h-screen" />
      <main className="flex-1 overflow-auto md:ml-64 pb-20 md:pb-0 h-screen">
        {children}
      </main>
      <BottomNav className="md:hidden fixed bottom-0 left-0 right-0 z-50" />
    </div>
  );
} 