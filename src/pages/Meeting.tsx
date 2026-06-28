import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import Peer from 'peerjs';
import { Mic, MicOff, Video, VideoOff, MonitorUp, PenTool, Users, Settings, PhoneOff, Copy, Check, MessageSquare, ChevronUp, MoreHorizontal, Moon, Sun, X, Send } from 'lucide-react';
import WhiteboardModal from './WhiteboardModal';
import Logo from '../components/Logo';

interface Participant {
  peerId: string;
  name: string;
  color: string;
  stream?: MediaStream;
}

export default function Meeting() {
  const { meetingCode } = useParams<{ meetingCode: string }>();
  const navigate = useNavigate();
  
  const [socket, setSocket] = useState<Socket | null>(null);
  const [peer, setPeer] = useState<Peer | null>(null);
  
  const [participants, setParticipants] = useState<Record<string, Participant>>({});
  const [myStream, setMyStream] = useState<MediaStream | null>(null);
  
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [showWhiteboard, setShowWhiteboard] = useState(false);
  const [pinnedParticipantId, setPinnedParticipantId] = useState<string | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [copied, setCopied] = useState(false);

  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark') || localStorage.getItem('theme') === 'dark';
    }
    return true;
  });
  const [showParticipants, setShowParticipants] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<{senderId: string, sender: string, text: string, time: string, color: string, id: string}[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  const myName = typeof window !== 'undefined' ? localStorage.getItem('guest_name') || 'Guest' : 'Guest';
  const myColor = typeof window !== 'undefined' ? localStorage.getItem('guest_color') || '#3B82F6' : '#3B82F6';

  useEffect(() => {
    if (showChat) chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, showChat]);

  const toggleTheme = () => {
    const newDark = !isDarkMode;
    setIsDarkMode(newDark);
    if (newDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const myVideoRef = useRef<HTMLVideoElement>(null);
  const streamsRef = useRef<Record<string, MediaStream>>({});

  const showWhiteboardRef = useRef(showWhiteboard);
  const isHostRef = useRef(isHost);

  useEffect(() => { showWhiteboardRef.current = showWhiteboard; }, [showWhiteboard]);
  useEffect(() => { isHostRef.current = isHost; }, [isHost]);

  useEffect(() => {
    const sessionId = localStorage.getItem('guest_session_id');
    const name = localStorage.getItem('guest_name') || 'Guest';
    const color = localStorage.getItem('guest_color') || '#3B82F6';

    if (!sessionId) {
      navigate('/');
      return;
    }

    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/meetings/${meetingCode}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          alert('Meeting not found');
          navigate('/');
        } else {
          setIsHost(data.hostSessionId === sessionId);
        }
      });

    const newSocket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000');
    setSocket(newSocket);

    const newPeer = new Peer(undefined as any, {
      host: import.meta.env.VITE_PEER_HOST || '0.peerjs.com',
      port: 443,
      secure: true,
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
          { urls: 'stun:stun.cloudflare.com:3478' }
        ]
      }
    });
    setPeer(newPeer);

    Promise.all([
      navigator.mediaDevices.getUserMedia({ video: true, audio: true }).catch(err => {
        console.error('Failed to get local stream', err);
        return null;
      }),
      new Promise<string>((resolve) => {
        if (newPeer.id) resolve(newPeer.id);
        else newPeer.on('open', (id) => resolve(id));
      })
    ]).then(([stream, id]) => {
      if (stream) {
        setMyStream(stream);
        if (myVideoRef.current) {
          myVideoRef.current.srcObject = stream;
        }
      }

      const userDetails = { peerId: id, name, color, sessionId };
      newSocket.emit('join-room', meetingCode, userDetails);
      setParticipants(prev => ({ ...prev, [id]: { peerId: id, name, color, stream: stream || undefined } }));
      if (stream) streamsRef.current[id] = stream;

      newSocket.on('user-connected', (userDetails: any) => {
        setParticipants(prev => ({ ...prev, [userDetails.peerId]: userDetails }));
        if (stream) {
          const call = newPeer.call(userDetails.peerId, stream, { metadata: { name, color } });
          call.on('stream', (userVideoStream) => {
            setParticipants(prev => ({ 
              ...prev, 
              [userDetails.peerId]: { ...userDetails, stream: userVideoStream } 
            }));
            streamsRef.current[userDetails.peerId] = userVideoStream;
          });
        }
      });

      newPeer.on('call', (call) => {
        if (stream) call.answer(stream);
        else call.answer();
        
        const callerDetails = call.metadata;
        call.on('stream', (userVideoStream) => {
          setParticipants(prev => ({ 
            ...prev, 
            [call.peer]: { peerId: call.peer, name: callerDetails?.name || 'Guest', color: callerDetails?.color || '#3B82F6', stream: userVideoStream } 
          }));
          streamsRef.current[call.peer] = userVideoStream;
        });
      });

      newSocket.on('user-disconnected', (peerId: string) => {
        setParticipants(prev => {
          const newParts = { ...prev };
          delete newParts[peerId];
          return newParts;
        });
      });

      newSocket.on('toggle-whiteboard', (isOpen: boolean) => {
        setShowWhiteboard(isOpen);
      });

      newSocket.on('sync-state', (state: any) => {
        if (state.showWhiteboard !== undefined) {
          setShowWhiteboard(state.showWhiteboard);
        }
      });

      newSocket.on('chat-message', (data: any) => {
        setChatMessages(prev => [...prev, data]);
      });

      newSocket.emit('request-state');
    });

    return () => {
      newSocket.disconnect();
      newPeer.destroy();
      myStream?.getTracks().forEach(t => t.stop());
    };
  }, [meetingCode]);

  useEffect(() => {
    if (myVideoRef.current && myStream) {
      if (myVideoRef.current.srcObject !== myStream) {
        myVideoRef.current.srcObject = myStream;
      }
    }
  }, [myStream, participants, pinnedParticipantId, showWhiteboard]);

  const toggleMic = () => {
    if (myStream) {
      myStream.getAudioTracks()[0].enabled = !isMicOn;
      setIsMicOn(!isMicOn);
    }
  };

  const toggleCamera = () => {
    if (myStream) {
      myStream.getVideoTracks()[0].enabled = !isCameraOn;
      setIsCameraOn(!isCameraOn);
    }
  };

  const toggleScreenShare = async () => {
    if (!isScreenSharing) {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        const videoTrack = screenStream.getVideoTracks()[0];
        
        if (myStream) {
          const senders = peer?.connections;
          if (senders) {
            Object.values(senders).forEach((conns: any) => {
              conns.forEach((conn: any) => {
                if (conn.peerConnection) {
                  const sender = conn.peerConnection.getSenders().find((s: any) => s.track?.kind === 'video');
                  if (sender) sender.replaceTrack(videoTrack);
                }
              });
            });
          }
          if (myVideoRef.current) myVideoRef.current.srcObject = screenStream;
        }

        videoTrack.onended = () => {
          stopScreenShare();
        };
        setIsScreenSharing(true);
      } catch (err) {
        console.error('Failed to share screen', err);
      }
    } else {
      stopScreenShare();
    }
  };

  const stopScreenShare = () => {
    if (myStream) {
      const videoTrack = myStream.getVideoTracks()[0];
      const senders = peer?.connections;
      if (senders) {
        Object.values(senders).forEach((conns: any) => {
          conns.forEach((conn: any) => {
            if (conn.peerConnection) {
              const sender = conn.peerConnection.getSenders().find((s: any) => s.track?.kind === 'video');
              if (sender) sender.replaceTrack(videoTrack);
            }
          });
        });
      }
      if (myVideoRef.current) myVideoRef.current.srcObject = myStream;
    }
    setIsScreenSharing(false);
  };

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  const sendMessage = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newMessage.trim() || !socket || !peer?.id) return;
    
    const msg = {
      id: Math.random().toString(36).substring(2, 9),
      senderId: peer.id,
      sender: myName,
      text: newMessage.trim(),
      time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
      color: myColor
    };
    
    socket.emit('chat-message', msg);
    setChatMessages(prev => [...prev, msg]);
    setNewMessage("");
  };

  const leaveMeeting = () => {
    if (window.confirm("Are you sure you want to leave the meeting?")) {
      myStream?.getTracks().forEach(t => t.stop());
      navigate('/');
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(meetingCode || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const participantList = Object.values(participants);
  const gridCols = participantList.length === 1 ? 'grid-cols-1' :
                   participantList.length <= 2 ? 'grid-cols-1 md:grid-cols-2' :
                   participantList.length <= 4 ? 'grid-cols-2' :
                   'grid-cols-2 md:grid-cols-3 lg:grid-cols-4';

  const renderParticipant = (p: Participant, isPinnedMain: boolean = false) => {
    const isMe = p.peerId === peer?.id;
    return (
      <div 
        key={p.peerId} 
        onClick={() => {
          if (!showWhiteboard) {
            setPinnedParticipantId(pinnedParticipantId === p.peerId ? null : p.peerId);
          }
        }}
        className={`relative bg-slate-800 rounded-2xl overflow-hidden shadow-lg group ${!showWhiteboard ? 'cursor-pointer hover:ring-2 hover:ring-emerald-500/50 transition-all' : ''} ${showWhiteboard ? 'w-56 h-full shrink-0 border-2 ' + (isMe ? 'border-emerald-500' : 'border-transparent') : 'w-full h-full border border-slate-800/50'}`}
      >
        {isMe ? (
          <video 
            ref={myVideoRef} 
            autoPlay 
            muted 
            playsInline 
            className={`w-full h-full ${isPinnedMain ? 'object-contain bg-[#080B14]' : 'object-cover'} ${!isScreenSharing ? 'scale-x-[-1]' : ''}`} 
          />
        ) : (
          <VideoComponent stream={p.stream} isMain={isPinnedMain} />
        )}
        <div className="absolute bottom-2 left-2 bg-slate-900/60 backdrop-blur-md px-2 py-1 rounded-lg flex items-center space-x-2">
          <span className="text-[10px] font-medium text-white">{p.name} {isMe && '(You)'}</span>
        </div>
        <div className="absolute bottom-2 right-2 bg-slate-900/60 backdrop-blur-md w-6 h-6 rounded-lg flex items-center justify-center">
           {isMe && !isMicOn ? <MicOff size={10} className="text-red-400" /> : <Mic size={10} className="text-emerald-400" />}
        </div>
      </div>
    );
  };

  return (
    <div className={`h-screen flex flex-col font-sans overflow-hidden transition-colors duration-500 ${!isDarkMode ? 'bg-slate-50 text-slate-900' : 'bg-[#0B0F19] text-white'}`}>
      {/* Top Bar */}
      <div className="h-20 shrink-0 flex items-center justify-between px-6 z-10 pt-2">
        <div className="flex items-center gap-2 cursor-pointer w-1/3" onClick={leaveMeeting}>
          <Logo className="w-8 h-6" />
          <span className={`font-bold text-xl hidden sm:block tracking-tight ${!isDarkMode ? 'text-slate-900' : 'text-white'}`}>Meet<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Sphere</span></span>
        </div>
        
        <div className="flex flex-col items-center justify-center w-1/3">
          <div className={`flex items-center space-x-2 px-4 py-1.5 rounded-full mt-2 cursor-pointer transition-colors ${!isDarkMode ? 'bg-slate-200 hover:bg-slate-300' : 'bg-[#1A2235] hover:bg-[#20293F]'}`} onClick={copyCode}>
            <span className={`font-mono text-xs font-semibold ${!isDarkMode ? 'text-slate-700' : 'text-slate-200'}`}>{meetingCode}</span>
            <div className={`${!isDarkMode ? 'text-slate-500 hover:text-slate-800' : 'text-slate-400 hover:text-white'} transition-colors`} title="Copy Code">
              {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
            </div>
          </div>
          <div className="flex items-center gap-1.5 mt-1.5">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
            <span className={`text-[10px] font-medium ${!isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>{participantList.length} participants</span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 w-1/3">
          <button onClick={() => { setShowParticipants(!showParticipants); setShowChat(false); }} className={`flex items-center gap-1.5 transition-colors px-3 py-2 rounded-xl text-xs font-medium ${!isDarkMode ? 'bg-slate-200 hover:bg-slate-300 text-slate-700' : 'bg-[#1A2235] hover:bg-[#20293F] text-slate-300'}`}>
             <Users size={16} /> {participantList.length}
          </button>
          <button onClick={() => { setShowChat(!showChat); setShowParticipants(false); }} className={`transition-colors p-2 rounded-xl ${!isDarkMode ? 'bg-slate-200 hover:bg-slate-300 text-slate-700' : 'bg-[#1A2235] hover:bg-[#20293F] text-slate-300'}`}>
             <MessageSquare size={16} />
          </button>
          <button onClick={() => setIsDarkMode(!isDarkMode)} className={`transition-colors p-2 rounded-xl ${!isDarkMode ? 'bg-slate-200 hover:bg-slate-300 text-slate-700' : 'bg-[#1A2235] hover:bg-[#20293F] text-slate-300'}`}>
             {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <button onClick={leaveMeeting} className="bg-red-500 hover:bg-red-600 transition-colors px-4 py-2 rounded-xl text-xs font-bold text-white ml-1">
             Leave
          </button>
        </div>
      </div>

      {/* Center Layout Container */}
      <div className="flex-1 overflow-hidden flex relative">
        <div className={`flex-1 p-4 md:p-6 overflow-hidden flex ${showWhiteboard ? 'flex-col' : 'items-stretch'} justify-center relative gap-4 transition-all duration-300 ${(showParticipants || showChat) ? 'mr-80' : ''}`}>
          
          {/* Layout Area */}
          {showWhiteboard ? (
            <div className="w-full h-full max-w-[1400px] flex flex-col md:flex-row gap-4 mx-auto">
               <div className="flex-[3] h-full w-full bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-200 relative mb-4 md:mb-0">
                  {socket && (
                    <WhiteboardModal 
                      socket={socket} 
                      roomId={meetingCode || ''} 
                      onClose={() => {
                        setShowWhiteboard(false);
                        socket?.emit('toggle-whiteboard', false);
                      }} 
                      isHost={isHost}
                    />
                  )}
               </div>
               <div className="flex-1 h-full flex md:flex-col gap-4 overflow-x-auto md:overflow-x-hidden md:overflow-y-auto pr-1">
                  {participantList.map(p => (
                     <div key={p.peerId} className="w-48 md:w-full h-32 md:h-48 shrink-0">
                        {renderParticipant(p)}
                     </div>
                  ))}
               </div>
            </div>
          ) : pinnedParticipantId && participants[pinnedParticipantId] ? (
            <div className="w-full h-full max-w-[1400px] flex flex-col md:flex-row gap-4 mx-auto">
               <div className="flex-[3] h-full">
                  {renderParticipant(participants[pinnedParticipantId], true)}
               </div>
               <div className="flex-1 h-full flex md:flex-col gap-4 overflow-x-auto md:overflow-x-hidden md:overflow-y-auto pr-1">
                  {participantList.filter(p => p.peerId !== pinnedParticipantId).map(p => (
                     <div key={p.peerId} className="w-48 md:w-full h-32 md:h-48 shrink-0">
                        {renderParticipant(p)}
                     </div>
                  ))}
               </div>
            </div>
          ) : (
            <div className="w-full h-full max-w-[1400px] flex items-center mx-auto">
              <div className={`w-full h-full grid ${gridCols} gap-4`}>
                {participantList.map(p => renderParticipant(p))}
              </div>
            </div>
          )}
        </div>

        {/* Unified Sidebar */}
        <div className={`absolute top-0 right-0 h-full w-80 shadow-2xl transition-transform duration-300 transform ${(showParticipants || showChat) ? 'translate-x-0' : 'translate-x-full'} ${!isDarkMode ? 'bg-white border-l border-slate-200 text-slate-900' : 'bg-[#121826] border-l border-slate-800/50 text-white'} z-20 flex flex-col`}>
          {showParticipants ? (
            <>
              <div className={`p-4 border-b flex justify-between items-center ${!isDarkMode ? 'border-slate-200' : 'border-slate-800/50'}`}>
                <h3 className="font-semibold text-sm">Participants ({participantList.length})</h3>
                <button onClick={() => setShowParticipants(false)} className={`p-1.5 rounded-lg transition-colors ${!isDarkMode ? 'hover:bg-slate-100' : 'hover:bg-slate-800'}`}>
                  <X size={16} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {participantList.map(p => (
                  <div key={p.peerId} className={`flex items-center justify-between p-3 rounded-xl ${!isDarkMode ? 'bg-slate-50 border border-slate-100 hover:bg-slate-100' : 'bg-slate-800/30 border border-slate-800 hover:bg-slate-800/50'} transition-colors`}>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm" style={{backgroundColor: p.color}}>
                        {p.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold">{p.name}</span>
                        {p.peerId === peer?.id && <span className={`text-[10px] ${!isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>(You)</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : showChat ? (
            <>
              <div className={`p-4 border-b flex justify-between items-center ${!isDarkMode ? 'border-slate-200' : 'border-slate-800/50'}`}>
                <h3 className="font-semibold text-sm">Meeting Chat</h3>
                <button onClick={() => setShowChat(false)} className={`p-1.5 rounded-lg transition-colors ${!isDarkMode ? 'hover:bg-slate-100' : 'hover:bg-slate-800'}`}>
                  <X size={16} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {chatMessages.length === 0 ? (
                   <div className={`h-full flex items-center justify-center text-sm ${!isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>No messages yet.</div>
                ) : (
                   chatMessages.map(msg => {
                     const isMe = msg.senderId === peer?.id;
                     return (
                     <div key={msg.id} className="flex flex-col">
                       <div className="flex items-center gap-2 mb-0.5">
                         <span className="font-semibold text-[13px]" style={{color: isMe ? '#3B82F6' : msg.color}}>{isMe ? 'You' : msg.sender}</span>
                         <span className={`text-[11px] font-medium ${!isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>{msg.time}</span>
                       </div>
                       <div className={`text-[13px] leading-relaxed ${!isDarkMode ? 'text-slate-800' : 'text-slate-200'}`}>
                         {msg.text}
                       </div>
                     </div>
                     );
                   })
                )}
                <div ref={chatEndRef} />
              </div>
              <div className={`p-3 border-t ${!isDarkMode ? 'border-slate-200' : 'border-slate-800/50'}`}>
                <form onSubmit={sendMessage} className="flex items-center gap-2">
                  <input 
                    type="text" 
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    placeholder="Send a message..."
                    className={`flex-1 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${!isDarkMode ? 'bg-slate-100 placeholder-slate-500 text-slate-900' : 'bg-slate-800/50 placeholder-slate-500 text-white'}`}
                  />
                  <button 
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 text-white p-2.5 rounded-xl transition-colors"
                  >
                    <Send size={16} />
                  </button>
                </form>
              </div>
            </>
          ) : null}
        </div>
      </div>

      {/* Bottom Controls */}
      <div className={`pb-6 pt-2 shrink-0 flex flex-col items-center justify-center z-10 relative ${(showParticipants || showChat) ? 'mr-80' : ''} transition-all duration-300`}>
        <div 
          onClick={() => { setShowParticipants(!showParticipants); setShowChat(false); }}
          className={`text-[11px] font-medium mb-3 flex items-center gap-1 cursor-pointer transition-colors ${!isDarkMode ? 'text-slate-500 hover:text-slate-700' : 'text-slate-400 hover:text-slate-300'}`}
        >
          Showing all {participantList.length} participants 
          <ChevronUp size={12} className={`transition-transform duration-300 ${showParticipants ? 'rotate-180' : ''}`} />
        </div>
        
        <div className={`rounded-[2rem] p-2 flex items-center gap-1 shadow-2xl border ${!isDarkMode ? 'bg-white border-slate-200' : 'bg-[#1A2235] border-slate-800/50'}`}>
          <button 
            onClick={toggleMic}
            className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center gap-1 transition-colors group ${!isDarkMode ? 'hover:bg-slate-100' : 'hover:bg-slate-800/50'}`}
          >
            <div className={`p-2.5 rounded-full transition-colors ${!isMicOn ? 'bg-slate-100 text-red-500' : !isDarkMode ? 'bg-slate-100 text-slate-700 group-hover:bg-slate-200' : 'text-slate-300 group-hover:text-white'}`}>
              {isMicOn ? <Mic size={18} /> : <MicOff size={18} />}
            </div>
            <span className={`text-[10px] font-medium ${!isDarkMode ? 'text-slate-500 group-hover:text-slate-700' : 'text-slate-400 group-hover:text-slate-300'}`}>Mic</span>
          </button>

          <button 
            onClick={toggleCamera}
            className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center gap-1 transition-colors group ${!isDarkMode ? 'hover:bg-slate-100' : 'hover:bg-slate-800/50'}`}
          >
            <div className={`p-2.5 rounded-full transition-colors ${!isCameraOn ? 'bg-slate-100 text-red-500' : !isDarkMode ? 'bg-slate-100 text-slate-700 group-hover:bg-slate-200' : 'text-slate-300 group-hover:text-white'}`}>
              {isCameraOn ? <Video size={18} /> : <VideoOff size={18} />}
            </div>
            <span className={`text-[10px] font-medium ${!isDarkMode ? 'text-slate-500 group-hover:text-slate-700' : 'text-slate-400 group-hover:text-slate-300'}`}>Camera</span>
          </button>

          <button 
            onClick={toggleScreenShare}
            className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center gap-1 transition-colors group ${!isDarkMode ? 'hover:bg-slate-100' : 'hover:bg-slate-800/50'}`}
          >
            <div className={`p-2.5 rounded-full transition-colors ${isScreenSharing ? 'bg-blue-500 text-white' : !isDarkMode ? 'bg-slate-100 text-slate-700 group-hover:bg-slate-200' : 'text-slate-300 group-hover:text-white'}`}>
              <MonitorUp size={18} />
            </div>
            <span className={`text-[10px] font-medium ${!isDarkMode ? 'text-slate-500 group-hover:text-slate-700' : 'text-slate-400 group-hover:text-slate-300'}`}>Screen</span>
          </button>

          <button 
            onClick={() => {
              const newState = !showWhiteboard;
              setShowWhiteboard(newState);
              socket?.emit('toggle-whiteboard', newState);
            }}
            className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center gap-1 transition-colors group ${!isDarkMode ? 'hover:bg-slate-100' : 'hover:bg-slate-800/50'}`}
          >
            <div className={`p-2.5 rounded-full transition-colors ${showWhiteboard ? 'bg-blue-100 text-blue-600' : !isDarkMode ? 'bg-slate-100 text-slate-700 group-hover:bg-slate-200' : 'text-slate-300 group-hover:text-white'}`}>
              <PenTool size={18} />
            </div>
            <span className={`text-[10px] font-medium ${showWhiteboard ? 'text-blue-600' : !isDarkMode ? 'text-slate-500 group-hover:text-slate-700' : 'text-slate-400 group-hover:text-slate-300'}`}>Whiteboard</span>
          </button>

          <button 
            onClick={() => { setShowParticipants(!showParticipants); setShowChat(false); }} 
            className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center gap-1 transition-colors group relative ${!isDarkMode ? 'hover:bg-slate-100' : 'hover:bg-slate-800/50'}`}
          >
            <div className={`p-2.5 rounded-full transition-colors relative ${showParticipants ? 'bg-blue-100 text-blue-600' : !isDarkMode ? 'bg-slate-100 text-slate-700 group-hover:bg-slate-200' : 'text-slate-300 group-hover:text-white'}`}>
              <Users size={18} />
              <div className="absolute top-1 -right-1 bg-blue-500 text-[9px] font-bold px-1.5 py-0.5 rounded-full text-white">{participantList.length}</div>
            </div>
            <span className={`text-[10px] font-medium ${showParticipants ? 'text-blue-600' : !isDarkMode ? 'text-slate-500 group-hover:text-slate-700' : 'text-slate-400 group-hover:text-slate-300'}`}>Participants</span>
          </button>

          <button 
            onClick={toggleTheme} 
            className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center gap-1 transition-colors group ${!isDarkMode ? 'hover:bg-slate-100' : 'hover:bg-slate-800/50'}`}
          >
            <div className={`p-2.5 rounded-full transition-colors ${!isDarkMode ? 'bg-slate-100 text-slate-700 group-hover:bg-slate-200' : 'text-slate-300 group-hover:text-white'}`}>
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </div>
            <span className={`text-[10px] font-medium ${!isDarkMode ? 'text-slate-500 group-hover:text-slate-700' : 'text-slate-400 group-hover:text-slate-300'}`}>{isDarkMode ? 'Light' : 'Dark'} Mode</span>
          </button>

          <div className={`w-px h-8 mx-1 ${!isDarkMode ? 'bg-slate-200' : 'bg-slate-800'}`}></div>

          <button 
            onClick={leaveMeeting}
            className="w-[72px] h-14 rounded-[1.25rem] flex flex-col items-center justify-center gap-0.5 transition-colors bg-red-500 hover:bg-red-600 text-white ml-1 mr-1"
          >
            <PhoneOff size={16} className="mt-0.5" />
            <span className="text-[10px] font-bold">Leave</span>
          </button>
        </div>
      </div>
    </div>
  );
}

const VideoComponent = ({ stream, isMain }: { stream?: MediaStream, isMain?: boolean }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      if (videoRef.current.srcObject !== stream) {
        videoRef.current.srcObject = stream;
      }
    }
  }, [stream]);

  return <video ref={videoRef} autoPlay playsInline className={`w-full h-full ${isMain ? 'object-contain bg-[#080B14]' : 'object-cover'}`} />;
};
