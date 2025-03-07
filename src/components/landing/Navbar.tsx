import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="fixed top-0 w-full z-50 bg-solo-dark/80 backdrop-blur-md border-b border-solo-purple/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex-shrink-0">
            <span className="text-2xl font-bold bg-gradient-to-r from-solo-light to-solo-beige text-transparent bg-clip-text">
              Fitness Quest
            </span>
          </div>
          
          <div className="flex space-x-4">
            <Link 
              href="/login"
              className="px-4 py-2 rounded-lg text-solo-light hover:text-white transition-colors"
            >
              Login
            </Link>
            <Link 
              href="/register"
              className="px-4 py-2 rounded-lg bg-solo-accent hover:bg-solo-purple text-white transition-colors"
            >
              Register
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
} 