import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { motion } from 'framer-motion';
import { Monitor, PenTool, Lock, Zap, Video, Code } from 'lucide-react';

const Features = () => {
  const features = [
    {
      icon: <Video size={24} />,
      title: 'HD Video & Audio',
      description: 'Crystal clear peer-to-peer communication powered by WebRTC and PeerJS. Low latency and high reliability.',
      colorClasses: 'bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400'
    },
    {
      icon: <Monitor size={24} />,
      title: 'Screen Sharing',
      description: 'Share your entire screen or specific application windows instantly with all participants in the room.',
      colorClasses: 'bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400'
    },
    {
      icon: <PenTool size={24} />,
      title: 'Live Whiteboard',
      description: 'Brainstorm together with a synchronized drawing canvas. Real-time updates delivered via Socket.io.',
      colorClasses: 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
    },
    {
      icon: <Zap size={24} />,
      title: 'Zero Friction',
      description: 'No accounts, no downloads, no passwords. Instantly create or join using just a generated meeting code.',
      colorClasses: 'bg-orange-100 dark:bg-yellow-500/20 text-orange-600 dark:text-yellow-400'
    },
    {
      icon: <Lock size={24} />,
      title: 'Secure Rooms',
      description: 'Unique, randomized meeting codes ensure your rooms stay private. WebRTC offers built-in encryption.',
      colorClasses: 'bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400'
    },
    {
      icon: <Code size={24} />,
      title: 'Modern Stack',
      description: 'Built for speed using React 19, Vite, Tailwind CSS v4, and Node.js. A premium, responsive UI/UX.',
      colorClasses: 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] font-sans selection:bg-blue-500/30 overflow-x-hidden flex flex-col transition-colors duration-300">
      <Navbar />
      
      <div className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-24 text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl lg:text-6xl font-extrabold text-slate-900 dark:text-white mb-6 transition-colors duration-300">
            Powerful features. <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-500">Zero complexity.</span>
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 mb-16 max-w-2xl mx-auto leading-relaxed transition-colors duration-300">
            Everything you need for productive remote collaboration, packed into a lightweight, lightning-fast application.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, idx) => (
              <div key={idx} className="bg-white dark:bg-[#151C2C] border border-slate-200 dark:border-slate-700/50 rounded-3xl p-6 text-left hover:border-blue-500/50 dark:hover:bg-slate-800/50 transition-colors duration-300 shadow-sm dark:shadow-none group">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 transition-transform group-hover:scale-110 ${feature.colorClasses}`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 transition-colors duration-300">{feature.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm transition-colors duration-300">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
};

export default Features;
