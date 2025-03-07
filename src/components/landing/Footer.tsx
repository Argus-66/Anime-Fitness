import Link from 'next/link';

const socialLinks = [
  { name: 'GitHub', url: 'https://github.com/argus-66/' },
  { name: 'LinkedIn', url: 'https://www.linkedin.com/in/ayush-h-541948252/' },
  { name: 'Instagram', url: 'https://www.instagram.com/ayush_h_jagadish/' },
  { name: 'Twitter', url: 'https://x.com/Argus_Ayush' }
];

export default function Footer() {
  return (
    <footer className="bg-solo-dark py-12 border-t border-solo-purple/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center space-y-8">
          <div className="text-2xl font-bold bg-gradient-to-r from-solo-light to-solo-beige text-transparent bg-clip-text">
            Fitness Quest
          </div>
          
          <div className="flex space-x-8">
            {socialLinks.map((link) => (
              <a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-solo-light hover:text-white transition-colors"
              >
                {link.name}
              </a>
            ))}
          </div>
          
          <p className="text-solo-light/60 text-sm">
            © {new Date().getFullYear()} Fitness Quest. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
} 