'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaEnvelope, FaLock } from 'react-icons/fa';
import { getUser, setUser } from '@/lib/auth';
import { FcGoogle } from 'react-icons/fc';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const router = useRouter();
  
  useEffect(() => {
    const user = getUser();
    if (user) {
      router.push('/dashboard');
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Save user data
      setUser(data.user);
      router.push('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      alert((error as Error).message);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleGoogleSignIn = () => {
    // Implementation of Google sign-in
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-solo-dark via-solo-purple to-solo-accent py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-solo-dark/50 backdrop-blur-lg rounded-xl shadow-xl overflow-hidden">
        <div className="px-6 py-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-solo-light to-solo-beige text-transparent bg-clip-text">
              Welcome Back
            </h2>
            <p className="mt-2 text-solo-light/80">Continue your fitness journey</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-solo-light/50" />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 bg-solo-purple/20 border border-solo-light/10 rounded-lg 
                  text-white placeholder-solo-light/50 focus:outline-none focus:border-solo-light/30"
                required
              />
            </div>

            <div className="relative">
              <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-solo-light/50" />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 bg-solo-purple/20 border border-solo-light/10 rounded-lg 
                  text-white placeholder-solo-light/50 focus:outline-none focus:border-solo-light/30"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-solo-accent hover:bg-solo-purple text-white rounded-lg
                transform transition-all duration-300 hover:scale-[1.02]
                shadow-[0_0_20px_rgba(82,43,91,0.3)] hover:shadow-[0_0_30px_rgba(82,43,91,0.5)]"
            >
              Login
            </button>
          </form>

          {/* Sign in with Google */}
          <button 
            onClick={handleGoogleSignIn}
            className="flex items-center justify-center w-full py-2.5 border border-solo-light/20 rounded-lg hover:bg-white/5 transition-colors"
          >
            <FcGoogle className="mr-2 text-xl" />
            <span>Sign in with Google</span>
          </button>

          <p className="text-center text-solo-light/60 text-sm mt-6">
            Don&apos;t have an account? <Link href="/register" className="text-solo-accent hover:text-solo-accent/80">Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
} 