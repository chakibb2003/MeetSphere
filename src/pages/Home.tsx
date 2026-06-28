import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Video, ArrowRight, Monitor, PenTool, UserX, ShieldCheck, Zap, Users, LayoutGrid, MoreHorizontal, MicOff, VideoOff, PhoneOff, Link as LinkIcon, X } from 'lucide-react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Logo from '../components/Logo';

const Home = () => {
  const navigate = useNavigate();
  const [meetingCode, setMeetingCode] = useState('');
  const [name, setName] = useState('');

  const [showNameModal, setShowNameModal] = useState(false);
  const [tempName, setTempName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem('guest_session_id')) {
      let uuid;
      try {
        uuid = crypto.randomUUID();
      } catch (e) {
        uuid = 'guest-' + Math.random().toString(36).substring(2, 11);
      }
      localStorage.setItem('guest_session_id', uuid);
    }
    const savedName = localStorage.getItem('guest_name');
    if (savedName) setName(savedName);
  }, []);

  const saveGuestDetails = (explicitName?: string) => {
    localStorage.setItem('guest_name', explicitName || name || 'Guest');
  };

  const handleCreateMeetingClick = () => {
    let currentName = name;
    if (currentName === 'Guest') currentName = '';
    setTempName(currentName);
    setShowNameModal(true);
  };

  const executeCreateMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempName.trim()) return;

    setIsCreating(true);
    setName(tempName.trim());
    saveGuestDetails(tempName.trim());
    
    try {
      const sessionId = localStorage.getItem('guest_session_id');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/meetings/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hostSessionId: sessionId })
      });
      const data = await response.json();
      if (data.meetingCode) {
        navigate(`/meeting/${data.meetingCode}`);
      } else {
        alert('Server returned error: ' + JSON.stringify(data));
        setIsCreating(false);
      }
    } catch (err: any) {
      console.error('Failed to create meeting:', err);
      alert(`Failed to create meeting. Is the server running? Error: ${err.message}`);
      setIsCreating(false);
    }
  };

  const handleJoinMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    if (!meetingCode.trim()) return;
    saveGuestDetails();
    navigate(`/meeting/${meetingCode.trim()}`);
  };

  const scrollToJoin = () => {
    document.getElementById('join-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] font-sans selection:bg-blue-500/30 overflow-x-hidden transition-colors duration-300">
      
      {/* Top Section */}
      <div className="relative pt-6 pb-20 lg:pt-8 lg:pb-28 overflow-hidden bg-white dark:bg-[#0B0F19] transition-colors duration-300">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
          <div className="absolute top-[-10%] right-[-5%] w-[50%] h-[50%] bg-blue-50 dark:bg-blue-900/20 rounded-full blur-3xl opacity-60"></div>
          <div className="absolute top-[20%] left-[-10%] w-[40%] h-[40%] bg-emerald-50 dark:bg-emerald-900/20 rounded-full blur-3xl opacity-60"></div>
        </div>

        <Navbar />

        {/* Hero Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 lg:mt-24 grid lg:grid-cols-2 gap-16 items-center relative z-10">
          
          {/* Left Column - Text */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 shadow-sm mb-8 text-xs font-semibold text-slate-600 dark:text-slate-300 transition-colors duration-300">
              <span>🚀 Fast</span>
              <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-500"></span>
              <span>Secure</span>
              <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-500"></span>
              <span>Simple</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 ml-1"></span>
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-extrabold text-slate-900 dark:text-white leading-[1.1] tracking-tight mb-6 transition-colors duration-300">
              Secure meetings <br />
              for <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-emerald-400">everyone.</span>
            </h1>
            
            <p className="text-lg text-slate-500 dark:text-slate-400 mb-10 max-w-xl leading-relaxed font-medium transition-colors duration-300">
              MeetSphere makes it easy to create and join high-quality video meetings with anyone, anywhere.
            </p>
            
            <div className="flex flex-wrap items-center gap-4 mb-14">
              <button 
                onClick={handleCreateMeetingClick}
                className="bg-blue-600 hover:bg-blue-700 dark:hover:bg-blue-500 text-white px-6 py-3.5 rounded-xl text-base font-semibold transition-all flex items-center gap-2 shadow-lg shadow-blue-500/25"
              >
                <Video className="w-5 h-5" />
                Create a Meeting
              </button>
              <button 
                onClick={scrollToJoin}
                className="bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-white px-6 py-3.5 rounded-xl text-base font-semibold transition-all flex items-center gap-2 border border-slate-200 dark:border-slate-700 shadow-sm"
              >
                Join a Meeting
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            {/* Feature Mini Row */}
            <div className="flex items-center gap-6 text-sm text-slate-600 dark:text-slate-400 font-medium transition-colors duration-300">
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-xl border border-blue-100 dark:border-slate-800 bg-blue-50 dark:bg-slate-800/50 flex items-center justify-center transition-colors">
                  <span className="text-sm font-bold text-blue-600 border-2 border-blue-600 rounded px-1">HD</span>
                </div>
                <span className="text-[11px] uppercase tracking-wide">HD Video</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-xl border border-emerald-100 dark:border-slate-800 bg-emerald-50 dark:bg-slate-800/50 flex items-center justify-center transition-colors">
                  <Monitor className="w-5 h-5 text-emerald-600" />
                </div>
                <span className="text-[11px] uppercase tracking-wide">Screen Share</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-xl border border-purple-100 dark:border-slate-800 bg-purple-50 dark:bg-slate-800/50 flex items-center justify-center transition-colors">
                  <PenTool className="w-5 h-5 text-purple-600" />
                </div>
                <span className="text-[11px] uppercase tracking-wide">Whiteboard</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-xl border border-orange-100 dark:border-slate-800 bg-orange-50 dark:bg-slate-800/50 flex items-center justify-center transition-colors">
                  <UserX className="w-5 h-5 text-orange-600" />
                </div>
                <span className="text-[11px] uppercase tracking-wide">No Sign Up</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-xl border border-blue-100 dark:border-slate-800 bg-blue-50 dark:bg-slate-800/50 flex items-center justify-center transition-colors">
                  <ShieldCheck className="w-5 h-5 text-blue-600" />
                </div>
                <span className="text-[11px] uppercase tracking-wide">100% Free</span>
              </div>
            </div>
          </motion.div>

          {/* Right Column - Mockup UI */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="relative lg:ml-10"
          >
            <div className="bg-white dark:bg-[#151C2C] border border-slate-200 dark:border-slate-700/50 rounded-[2rem] p-4 shadow-2xl overflow-hidden relative transition-colors duration-300">
              {/* Meeting Header */}
              <div className="flex items-center justify-between mb-4 px-2">
                <div className="flex items-center gap-2">
                  <Logo className="w-6 h-5" />
                  <span className="text-slate-900 dark:text-white text-[15px] font-extrabold tracking-tight">
                    Meet<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-emerald-400">Sphere</span>
                  </span>
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 font-mono font-medium">ABC-123-XYZ</div>
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=100&h=100" className="w-7 h-7 rounded-full border-2 border-white dark:border-[#151C2C] object-cover" alt="" />
                    <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=100&h=100" className="w-7 h-7 rounded-full border-2 border-white dark:border-[#151C2C] object-cover" alt="" />
                    <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100&h=100" className="w-7 h-7 rounded-full border-2 border-white dark:border-[#151C2C] object-cover" alt="" />
                  </div>
                  <div className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-bold px-2 py-1 rounded-full border border-slate-200 dark:border-slate-700">+3</div>
                  <button className="bg-red-500 hover:bg-red-600 text-white text-[11px] font-bold px-4 py-1.5 rounded-full transition-colors">Leave</button>
                </div>
              </div>

              {/* Video Grid */}
              <div className="grid grid-cols-2 gap-3 mb-16">
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm bg-slate-100 dark:bg-slate-800">
                  <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400&h=300" className="w-full h-full object-cover" alt="You" />
                  <div className="absolute inset-0 ring-2 ring-blue-500 rounded-2xl"></div>
                  <div className="absolute bottom-2 left-2 bg-slate-900/60 backdrop-blur text-white text-[10px] font-medium px-2.5 py-1 rounded-lg">You</div>
                  <div className="absolute bottom-2 right-2 bg-slate-900/60 backdrop-blur p-1 rounded-md">
                    <div className="flex gap-0.5 items-end h-3">
                       <span className="w-0.5 bg-green-400 h-1"></span>
                       <span className="w-0.5 bg-green-400 h-2"></span>
                       <span className="w-0.5 bg-green-400 h-3"></span>
                    </div>
                  </div>
                </div>
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm bg-slate-100 dark:bg-slate-800">
                  <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400&h=300" className="w-full h-full object-cover" alt="James" />
                  <div className="absolute bottom-2 left-2 bg-slate-900/60 backdrop-blur text-white text-[10px] font-medium px-2.5 py-1 rounded-lg">James</div>
                </div>
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm bg-slate-100 dark:bg-slate-800">
                  <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400&h=300" className="w-full h-full object-cover" alt="David" />
                  <div className="absolute bottom-2 left-2 bg-slate-900/60 backdrop-blur text-white text-[10px] font-medium px-2.5 py-1 rounded-lg">David</div>
                </div>
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm bg-slate-100 dark:bg-slate-800">
                  <img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=400&h=300" className="w-full h-full object-cover" alt="Sophia" />
                  <div className="absolute bottom-2 left-2 bg-slate-900/60 backdrop-blur text-white text-[10px] font-medium px-2.5 py-1 rounded-lg">Sophia</div>
                </div>
              </div>

              {/* Floating Controls */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border border-slate-200 dark:border-slate-700/50 p-2 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:shadow-2xl transition-colors duration-300">
                <button className="flex flex-col items-center gap-1 w-14 py-1 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl transition-colors">
                  <div className="bg-slate-100 dark:bg-slate-700 p-2.5 rounded-full text-slate-700 dark:text-white"><MicOff size={16} /></div>
                  <span className="text-[10px] font-medium text-slate-600 dark:text-slate-300">Mic</span>
                </button>
                <button className="flex flex-col items-center gap-1 w-14 py-1 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl transition-colors">
                  <div className="bg-slate-100 dark:bg-slate-700 p-2.5 rounded-full text-slate-700 dark:text-white"><VideoOff size={16} /></div>
                  <span className="text-[10px] font-medium text-slate-600 dark:text-slate-300">Camera</span>
                </button>
                <button className="flex flex-col items-center gap-1 w-14 py-1 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl transition-colors">
                  <Monitor size={18} className="text-slate-600 dark:text-slate-300 mt-1 mb-1" />
                  <span className="text-[10px] font-medium text-slate-600 dark:text-slate-300">Screen</span>
                </button>
                <button className="flex flex-col items-center gap-1 w-14 py-1 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl transition-colors">
                  <PenTool size={18} className="text-slate-600 dark:text-slate-300 mt-1 mb-1" />
                  <span className="text-[10px] font-medium text-slate-600 dark:text-slate-300">Whiteboard</span>
                </button>
                <button className="flex flex-col items-center gap-1 w-14 py-1 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl transition-colors">
                  <Users size={18} className="text-slate-600 dark:text-slate-300 mt-1 mb-1" />
                  <span className="text-[10px] font-medium text-slate-600 dark:text-slate-300">People</span>
                </button>
                <button className="flex flex-col items-center gap-1 w-14 py-1 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl transition-colors">
                  <MoreHorizontal size={18} className="text-slate-600 dark:text-slate-300 mt-1 mb-1" />
                  <span className="text-[10px] font-medium text-slate-600 dark:text-slate-300">More</span>
                </button>
                <button className="bg-red-500 hover:bg-red-600 text-white text-[12px] font-bold px-5 py-3 rounded-xl ml-1 transition-colors flex items-center gap-2">
                  <PhoneOff size={14} />
                  Leave
                </button>
              </div>

            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom Section */}
      <div id="join-section" className="bg-slate-50 dark:bg-[#070A12] text-slate-900 dark:text-white pt-24 pb-20 relative border-t border-slate-200/60 dark:border-slate-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Left Column - Steps */}
          <div>
            <h3 className="text-blue-600 dark:text-blue-500 font-bold text-sm uppercase tracking-wider mb-3">How it works</h3>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-12">
              Start a meeting in <br />3 simple steps
            </h2>

            <div className="flex items-start justify-between relative max-w-lg">
              {/* Connecting line */}
              <div className="absolute top-6 left-12 right-12 h-0.5 bg-slate-200 dark:bg-slate-800 -z-10"></div>
              
              <div className="flex flex-col items-center text-center w-32 bg-slate-50 dark:bg-[#070A12] transition-colors duration-300">
                <div className="w-14 h-14 bg-blue-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 border-4 border-slate-50 dark:border-[#070A12] transition-colors duration-300">
                  <Video className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">1</span>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">Create</h4>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">Start a new meeting with one click.</p>
              </div>

              <div className="flex flex-col items-center text-center w-32 bg-slate-50 dark:bg-[#070A12] transition-colors duration-300">
                <div className="w-14 h-14 bg-emerald-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 border-4 border-slate-50 dark:border-[#070A12] transition-colors duration-300">
                  <LinkIcon className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">2</span>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">Share</h4>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">Share the meeting code with others.</p>
              </div>

              <div className="flex flex-col items-center text-center w-32 bg-slate-50 dark:bg-[#070A12] transition-colors duration-300">
                <div className="w-14 h-14 bg-purple-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 border-4 border-slate-50 dark:border-[#070A12] transition-colors duration-300">
                  <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">3</span>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">Join</h4>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">Anyone can join and collaborate instantly.</p>
              </div>
            </div>
          </div>

          {/* Right Column - Join Card */}
          <div className="relative">
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-blue-50 dark:bg-blue-900/20 rounded-full blur-3xl -z-10 transition-colors duration-300"></div>
             
             <div className="bg-white dark:bg-[#151C2C] rounded-3xl p-8 lg:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-2xl border border-slate-100 dark:border-slate-800 relative z-10 max-w-md mx-auto lg:ml-auto lg:mr-0 transition-colors duration-300">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">Join a Meeting</h3>
                
                <form onSubmit={handleJoinMeeting} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 sm:col-span-1">
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-400 mb-2 uppercase tracking-wide">Meeting Code</label>
                      <input
                        type="text"
                        placeholder="ABC-123-XYZ"
                        value={meetingCode}
                        onChange={(e) => setMeetingCode(e.target.value.toUpperCase())}
                        className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all uppercase font-semibold text-sm"
                      />
                    </div>
                    
                    <div className="col-span-2 sm:col-span-1">
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-400 mb-2 uppercase tracking-wide">Your Name</label>
                      <input
                        type="text"
                        placeholder="John Doe"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-semibold text-sm"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={!name.trim() || !meetingCode.trim()}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl flex items-center justify-center space-x-2 transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed mt-4"
                  >
                    <ArrowRight className="w-5 h-5" />
                    <span>Join Meeting</span>
                  </button>
                </form>
             </div>
          </div>

        </div>
      </div>

      <Footer />

      {/* Name Modal for Create */}
      {showNameModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-slate-900/60 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white dark:bg-[#151C2C] border border-slate-200 dark:border-slate-700 rounded-3xl p-8 max-w-sm w-full shadow-2xl relative"
          >
            <button 
              onClick={() => setShowNameModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
            >
              <X size={18} />
            </button>
            
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/40 rounded-full flex items-center justify-center mb-6">
              <UserX className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">What's your name?</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              Please enter your name to create and host this meeting.
            </p>
            
            <form onSubmit={executeCreateMeeting}>
              <input
                type="text"
                autoFocus
                placeholder="E.g. Jane Doe"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-semibold text-sm mb-6"
              />
              <button
                type="submit"
                disabled={!tempName.trim() || isCreating}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isCreating ? 'Creating...' : 'Create Meeting'}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Home;
