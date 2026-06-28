import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { motion } from 'framer-motion';
import { Code, Briefcase } from 'lucide-react';

const About = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] font-sans selection:bg-blue-500/30 overflow-x-hidden flex flex-col transition-colors duration-300">
      <Navbar />
      
      <div className="flex-grow max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white dark:bg-[#151C2C] border border-slate-200 dark:border-slate-700/50 rounded-3xl p-8 lg:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-2xl transition-colors duration-300"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700/60 bg-slate-50 dark:bg-slate-800/40 text-xs font-medium text-slate-600 dark:text-slate-300 mb-8 transition-colors duration-300">
            Portfolio Project
          </div>
          
          <h1 className="text-3xl lg:text-5xl font-extrabold text-slate-900 dark:text-white mb-6 transition-colors duration-300">
            About <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-500">MeetSphere</span>
          </h1>
          
          <div className="space-y-6 text-slate-600 dark:text-slate-400 leading-relaxed text-lg mb-10 transition-colors duration-300">
            <p>
              MeetSphere is a high-performance, lightweight video conferencing application inspired by platforms like Google Meet and Zoom.
            </p>
            <p>
              This project was built from the ground up as a portfolio piece to demonstrate advanced web development concepts, including real-time peer-to-peer media streaming (WebRTC), bi-directional event-based communication (Socket.io), and modern UI/UX implementation using React and Tailwind CSS.
            </p>
            <p>
              The core philosophy behind MeetSphere is <strong>frictionless collaboration</strong>. By stripping away user authentication, databases, and heavy backend logic, the platform allows anyone to connect instantly and securely via guest sessions.
            </p>
          </div>


        </motion.div>
      </div>

      <Footer />
    </div>
  );
};

export default About;
