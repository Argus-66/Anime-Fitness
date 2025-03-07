"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const encouragementTexts = ["Rise...", "Conquer...", "Evolve..."];

const themes = [
    { name: "Solo Leveling", status: "Currently Featuring", image: "/images/landingpage/solo.png" },
    { name: "Dragon Ball", status: "Upcomming", image: "/images/landingpage/dbz.jpg" },
    { name: "One Punch Man", status: "Upcomming", image: "/images/landingpage/opm.jpg" },
    { name: "Attack on Titan", status: "Upcomming", image: "/images/landingpage/levi.jpg" },
    { name: "Jujutsu Kaisen", status: "Upcomming", image: "/images/landingpage/jjk.png" }
];

export default function HeroSection() {
    const [currentText, setCurrentText] = useState(0);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const textInterval = setInterval(() => {
            setCurrentText((prev) => (prev + 1) % encouragementTexts.length);
        }, 3000);

        const carouselInterval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % themes.length);
        }, 1700);

        return () => {
            clearInterval(textInterval);
            clearInterval(carouselInterval);
        };
    }, []);

    const getCardStyle = (index: number) => {
        const total = themes.length;
        const offset = (index - currentIndex + total) % total;

        if (offset === 0) {
            // Center card (fully visible)
            return { transform: "translateX(0%) scale(1)", opacity: 1, zIndex: 5, width: "350px" };
        } else if (offset === 1 || offset === total - 1) {
            // Immediate left & right (10% visible)
            const direction = offset === 1 ? 1 : -1;
            return { transform: `translateX(${direction * 90}%) scale(0.9)`, opacity: 0.8, zIndex: 4 };
        } else if (offset === 2 || offset === total - 2) {
            // Farther left & right (5% visible)
            const direction = offset === 2 ? 1 : -1;
            return { transform: `translateX(${direction * 120}%) scale(0.8)`, opacity: 0.5, zIndex: 3 };
        } else {
            // Hidden (fallback, just in case)
            return { transform: "scale(0)", opacity: 0, zIndex: 1 };
        }
    };

    return (
        <section className="min-h-screen flex flex-col md:flex-row items-center justify-between px-4 md:px-12 py-8 bg-gradient-to-br from-solo-dark via-solo-purple to-solo-accent overflow-hidden">
            {/* Left Side */}
            <div className="w-full md:w-1/2 space-y-8 text-white relative z-10">
                <div className="space-y-4">
                    <h1 className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-solo-light to-solo-beige text-transparent bg-clip-text leading-tight">
                        Level Up Your Fitness Journey
                    </h1>
                    <p className="text-3xl md:text-4xl text-solo-highlight font-semibold animate-pulse">
                        {encouragementTexts[currentText]}
                    </p>
                </div>
                <div className="space-y-6 mt-12">
                    <Link href="/register" className="block w-fit group">
                        <button className="px-10 py-4 bg-solo-accent text-xl font-bold text-white rounded-lg transition-transform duration-300 hover:scale-105 hover:bg-solo-purple">
                            Get Started
                        </button>
                    </Link>
                    <button className="px-10 py-4 border-2 border-solo-highlight text-xl font-bold text-solo-highlight rounded-lg transition-transform duration-300 hover:scale-105 hover:bg-solo-highlight/10">
                        Learn More
                    </button>
                </div>
            </div>

            {/* Right Side - Carousel */}
            <div className="w-full md:w-1/2 h-[800px] relative mt-12 md:mt-0 flex justify-center items-center overflow-hidden">
                <div className="relative w-[600px] h-[600px]">
                    {themes.map((theme, index) => {
                        const { transform, opacity, zIndex } = getCardStyle(index);

                        return (
                            <div
                                key={theme.name}
                                className="absolute w-[700px] h-full transition-all duration-700 ease-in-out rounded-lg overflow-hidden shadow-xl"
                                style={{
                                    transform,
                                    opacity,
                                    zIndex,
                                    left: "50%",
                                    top: 0,
                                    transformOrigin: "center",
                                    marginLeft: "-350px" // Center each card perfectly
                                }}
                            >
                                <Image
                                    src={theme.image}
                                    alt={theme.name}
                                    fill
                                    className="object-cover"
                                    priority
                                />
                                <div className="absolute bottom-4 left-4 text-white font-bold text-xl bg-black/60 px-4 py-2 rounded">
                                    {theme.name}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Info Box */}
                <div className="absolute bottom-[35%] right-[5%] z-50 bg-solo-purple/90 p-6 rounded-lg w-80 backdrop-blur-md border border-solo-light/20 shadow-2xl">
                    <p className="text-solo-light text-lg font-medium">{ themes[currentIndex].status }</p>
                    <p className="text-white text-2xl font-bold mt-1">
                        {themes[currentIndex].name}
                    </p>
                </div>
            </div>
        </section>
    );
}
