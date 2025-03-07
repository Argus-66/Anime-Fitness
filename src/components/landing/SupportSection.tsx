export default function SupportSection() {
  return (
    <section className="py-20 bg-gradient-to-b from-solo-dark to-solo-purple relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('/images/pattern.png')] opacity-5"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <h2 className="text-4xl font-bold text-solo-light mb-8">Support the Project</h2>
        <p className="text-xl text-solo-light/80 max-w-2xl mx-auto mb-12">
          Help us keep leveling up! Your support enables us to add more themes, features, 
          and make your fitness journey even more epic.
        </p>
        
        <a 
          href="https://buymeacoffee.com/Argus" 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-block px-8 py-4 bg-[#FF5E5B] text-white rounded-lg
            transform transition-all duration-300 hover:scale-105
            shadow-[0_0_20px_rgba(255,94,91,0.3)] hover:shadow-[0_0_30px_rgba(255,94,91,0.5)]"
        >
          ☕ Buy Me a Coffee
        </a>
      </div>
    </section>
  );
} 