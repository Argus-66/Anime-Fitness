"use client";

import { useState } from 'react';
import Link from 'next/link';
import { FaUser, FaEnvelope, FaLock, FaRulerVertical, FaWeight } from 'react-icons/fa';
import { BsGenderAmbiguous } from 'react-icons/bs';
import { IoMdCalendar } from 'react-icons/io';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    age: '',
    gender: '',
    height: '',
    weight: ''
  });

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (formData.password !== formData.confirmPassword) {
        alert("Passwords don't match!");
        return;
      }

      console.log('Attempting registration...');
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          age: parseInt(formData.age),
          height: parseInt(formData.height),
          weight: parseInt(formData.weight)
        }),
      });

      const data = await res.json();
      console.log('Registration response:', data);

      if (!res.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      alert('Registration successful!');
      router.push('/login');
    } catch (error) {
      console.error('Registration error:', error);
      alert((error as Error).message || 'Something went wrong');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-solo-dark via-solo-purple to-solo-accent py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-solo-dark/50 backdrop-blur-lg rounded-xl shadow-xl overflow-hidden">
        <div className="px-6 py-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-solo-light to-solo-beige text-transparent bg-clip-text">
              Join the Quest
            </h2>
            <p className="mt-2 text-solo-light/80">Begin your fitness journey today</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username */}
            <div className="relative">
              <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-solo-light/50" />
              <input
                type="text"
                name="username"
                placeholder="Username"
                value={formData.username}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 bg-solo-purple/20 border border-solo-light/10 rounded-lg 
                  text-white placeholder-solo-light/50 focus:outline-none focus:border-solo-light/30
                  transition-colors"
                required
              />
            </div>

            {/* Email */}
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

            {/* Password */}
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

            {/* Confirm Password */}
            <div className="relative">
              <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-solo-light/50" />
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 bg-solo-purple/20 border border-solo-light/10 rounded-lg 
                  text-white placeholder-solo-light/50 focus:outline-none focus:border-solo-light/30"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Age */}
              <div className="relative">
                <IoMdCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-solo-light/50" />
                <input
                  type="number"
                  name="age"
                  placeholder="Age"
                  value={formData.age}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-solo-purple/20 border border-solo-light/10 rounded-lg 
                    text-white placeholder-solo-light/50 focus:outline-none focus:border-solo-light/30"
                  required
                />
              </div>

              {/* Gender */}
              <div className="relative">
                <BsGenderAmbiguous className="absolute left-3 top-1/2 -translate-y-1/2 text-solo-light/50" />
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-solo-purple/20 border border-solo-light/10 rounded-lg 
                    text-white focus:outline-none focus:border-solo-light/30 appearance-none"
                  required
                >
                  <option value="">Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Height */}
              <div className="relative">
                <FaRulerVertical className="absolute left-3 top-1/2 -translate-y-1/2 text-solo-light/50" />
                <input
                  type="number"
                  name="height"
                  placeholder="Height (cm)"
                  value={formData.height}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-solo-purple/20 border border-solo-light/10 rounded-lg 
                    text-white placeholder-solo-light/50 focus:outline-none focus:border-solo-light/30"
                  required
                />
              </div>

              {/* Weight */}
              <div className="relative">
                <FaWeight className="absolute left-3 top-1/2 -translate-y-1/2 text-solo-light/50" />
                <input
                  type="number"
                  name="weight"
                  placeholder="Weight (kg)"
                  value={formData.weight}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-solo-purple/20 border border-solo-light/10 rounded-lg 
                    text-white placeholder-solo-light/50 focus:outline-none focus:border-solo-light/30"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-solo-accent hover:bg-solo-purple text-white rounded-lg
                transform transition-all duration-300 hover:scale-[1.02]
                shadow-[0_0_20px_rgba(82,43,91,0.3)] hover:shadow-[0_0_30px_rgba(82,43,91,0.5)]"
            >
              Create Account
            </button>
          </form>

          <p className="mt-6 text-center text-solo-light/80">
            Already have an account?{' '}
            <Link href="/login" className="text-solo-light hover:text-white transition-colors">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
} 