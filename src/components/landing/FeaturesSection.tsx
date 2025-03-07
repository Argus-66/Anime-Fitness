import { GiMuscleUp, GiLevelEndFlag, GiCardRandom, GiPodiumWinner } from 'react-icons/gi';

const features = [
  {
    icon: <GiMuscleUp className="w-12 h-12" />,
    title: "Themed Workouts",
    description: "Train like your favorite anime characters with specially designed workout routines."
  },
  {
    icon: <GiLevelEndFlag className="w-12 h-12" />,
    title: "Level Up System",
    description: "Gain XP, level up your skills, and become stronger with every workout."
  },
  {
    icon: <GiCardRandom className="w-12 h-12" />,
    title: "Card Collection",
    description: "Unlock and collect unique anime-themed cards as you progress."
  },
  {
    icon: <GiPodiumWinner className="w-12 h-12" />,
    title: "Leaderboards",
    description: "Compete with others and climb the ranks in global and friend leaderboards."
  }
];

export default function FeaturesSection() {
  return (
    <section className="py-20 bg-gradient-to-b from-solo-dark to-solo-purple relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('/images/pattern.png')] opacity-5"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <h2 className="text-4xl md:text-5xl font-bold text-center bg-gradient-to-r from-solo-light to-solo-beige text-transparent bg-clip-text mb-16">
          Features
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div 
              key={feature.title}
              className="group p-8 rounded-xl bg-gradient-to-br from-solo-purple/30 to-solo-accent/10 
                backdrop-blur-sm border border-solo-light/10
                transform hover:scale-105 transition-all duration-300
                hover:shadow-[0_0_30px_rgba(82,43,91,0.3)]"
            >
              <div className="text-solo-light mb-6 transform group-hover:scale-110 transition-transform duration-300">
                {feature.icon}
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">{feature.title}</h3>
              <p className="text-solo-light/80 group-hover:text-solo-light transition-colors duration-300">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 