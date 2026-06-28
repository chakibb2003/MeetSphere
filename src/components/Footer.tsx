import React from 'react';
import { Monitor, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-50 dark:bg-[#070A12] border-t border-slate-200 dark:border-slate-800 py-8 text-center text-slate-500 dark:text-slate-400 text-sm flex flex-col md:flex-row items-center justify-center gap-4 md:gap-12 relative z-10 transition-colors duration-300">
      <div className="flex items-center gap-2">
         <Monitor className="w-4 h-4" />
         <span>MeetSphere works on</span>
      </div>
      <div className="flex items-center gap-6">
         <span className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
           <img src="https://upload.wikimedia.org/wikipedia/commons/e/e1/Google_Chrome_icon_%28February_2022%29.svg" alt="Chrome" className="w-4 h-4 object-contain" />
           Chrome
         </span>
         <span className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
           <img src="https://upload.wikimedia.org/wikipedia/commons/a/a0/Firefox_logo%2C_2019.svg" alt="Firefox" className="w-4 h-4 object-contain" />
           Firefox
         </span>
         <span className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
           <img src="https://www.vectorlogo.zone/logos/apple_safari/apple_safari-icon.svg" alt="Safari" className="w-4 h-4 object-contain" />
           Safari
         </span>
         <span className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
           <img src="https://upload.wikimedia.org/wikipedia/commons/9/98/Microsoft_Edge_logo_%282019%29.svg" alt="Edge" className="w-4 h-4 object-contain" />
           Edge
         </span>
      </div>
      <div className="flex items-center gap-1">
        Made with <Heart className="w-4 h-4 text-red-500 fill-red-500" /> for better connections
      </div>
    </footer>
  );
};

export default Footer;
