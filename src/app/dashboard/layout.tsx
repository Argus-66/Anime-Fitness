import Sidebar from '@/components/layout/Sidebar';
import BottomNav from '@/components/layout/BottomNav';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-solo-dark">
      <Sidebar className="hidden md:flex" />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
      <BottomNav className="md:hidden fixed bottom-0 left-0 right-0" />
    </div>
  );
} 