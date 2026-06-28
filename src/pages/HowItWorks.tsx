import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { motion } from 'framer-motion';
import { MousePointerClick, Share2, Video } from 'lucide-react';

const HowItWorks = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] font-sans selection:bg-blue-500/30 overflow-x-hidden flex flex-col transition-colors duration-300">
      <Navbar />
      
      <div className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32 text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl lg:text-6xl font-extrabold text-slate-900 dark:text-white mb-6 transition-colors duration-300">
            Connecting is as easy as <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-emerald-400">1-2-3.</span>
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 mb-16 max-w-2xl mx-auto leading-relaxed transition-colors duration-300">
            We eliminated user accounts, passwords, and downloads. MeetSphere is built for immediate, frictionless collaboration.
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-[#151C2C] border border-slate-200 dark:border-slate-700/50 rounded-3xl p-8 text-left hover:border-blue-500/50 transition-colors duration-300 shadow-sm dark:shadow-none">
              <div className="w-14 h-14 bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mb-6 transition-colors duration-300">
                <MousePointerClick size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 transition-colors duration-300">1. Create or Join</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed transition-colors duration-300">
                Click "Create Meeting" to instantly generate a secure room, or enter a code to join an existing one. No sign-up required.
              </p>
            </div>

            <div className="bg-white dark:bg-[#151C2C] border border-slate-200 dark:border-slate-700/50 rounded-3xl p-8 text-left hover:border-emerald-500/50 transition-colors duration-300 shadow-sm dark:shadow-none">
              <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mb-6 transition-colors duration-300">
                <Share2 size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 transition-colors duration-300">2. Share the Code</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed transition-colors duration-300">
                Copy your unique 9-character meeting code (e.g. ABC-123-XYZ) and share it with your team, clients, or friends.
              </p>
            </div>

            <div className="bg-white dark:bg-[#151C2C] border border-slate-200 dark:border-slate-700/50 rounded-3xl p-8 text-left hover:border-purple-500/50 transition-colors duration-300 shadow-sm dark:shadow-none">
              <div className="w-14 h-14 bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 rounded-2xl flex items-center justify-center mb-6 transition-colors duration-300">
                <Video size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 transition-colors duration-300">3. Collaborate</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed transition-colors duration-300">
                Turn on your camera, share your screen, or open the real-time whiteboard to start collaborating instantly.
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
};

export default HowItWorks;
