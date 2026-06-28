import React, { useRef, useEffect, useState } from 'react';
import { X, Pencil, Eraser, Square, Circle, Minus, Type, StickyNote, Image as ImageIcon, Undo, Redo, Trash2, MousePointer2, ChevronRight } from 'lucide-react';

interface WhiteboardProps {
  socket: any;
  roomId: string;
  onClose: () => void;
  isHost: boolean;
}

export default function WhiteboardModal({ socket, roomId, onClose, isHost }: WhiteboardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#000000');
  const [tool, setTool] = useState('pencil');
  const [brushSize, setBrushSize] = useState(2);
  const [shapeType, setShapeType] = useState('rect');
  
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [snapshot, setSnapshot] = useState<ImageData | null>(null);

  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const [textInput, setTextInput] = useState<{ visible: boolean, x: number, y: number, text: string, isSticky: boolean }>({ visible: false, x: 0, y: 0, text: '', isSticky: false });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingImage, setPendingImage] = useState<HTMLImageElement | null>(null);

  const colors = [
    { name: 'Black', hex: '#000000' },
    { name: 'Blue', hex: '#3B82F6' },
    { name: 'Red', hex: '#EF4444' },
    { name: 'Green', hex: '#22C55E' },
    { name: 'Yellow', hex: '#EAB308' },
  ];

  const sizes = [
    { name: 'Small', value: 2 },
    { name: 'Medium', value: 6 },
    { name: 'Large', value: 12 },
  ];

  const saveHistory = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL();
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(dataUrl);
      setHistoryIndex(newHistory.length - 1);
      return newHistory;
    });
  };

  const broadcastBoard = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    socket?.emit('sync-board', { roomId, dataUrl: canvas.toDataURL() });
  };

  useEffect(() => {
    const updateCanvasSize = () => {
      if (!canvasRef.current) return;
      const canvas = canvasRef.current;
      const parent = canvas.parentElement;
      if (parent) {
        const { clientWidth, clientHeight } = parent;
        if (canvas.width !== clientWidth || canvas.height !== clientHeight) {
          const ctx = canvas.getContext('2d');
          const imgData = ctx?.getImageData(0, 0, canvas.width, canvas.height);
          canvas.width = clientWidth;
          canvas.height = clientHeight;
          if (imgData && ctx) {
             ctx.putImageData(imgData, 0, 0);
          } else {
             saveHistory();
          }
        }
      }
    };
    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, []);

  useEffect(() => {
    if (!socket) return;
    const ctx = canvasRef.current?.getContext('2d');

    const handleDrawStart = (data: any) => {
      if (!ctx) return;
      ctx.beginPath();
      ctx.moveTo(data.x, data.y);
      if (data.tool === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.lineWidth = data.brushSize * 2;
      } else {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = data.color;
        ctx.lineWidth = data.brushSize;
      }
    };

    const handleDrawMove = (data: any) => {
      if (!ctx) return;
      ctx.lineTo(data.x, data.y);
      ctx.stroke();
    };

    const handleDrawEnd = () => {
      if (!ctx) return;
      ctx.closePath();
    };

    const handleSyncBoard = (data: any) => {
      const canvas = canvasRef.current;
      if (!canvas || !ctx) return;
      const img = new Image();
      img.onload = () => {
        ctx.globalCompositeOperation = 'source-over';
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        saveHistory();
      };
      img.src = data.dataUrl;
    };

    const handleClearBoard = () => {
      const canvas = canvasRef.current;
      if (!canvas || !ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      saveHistory();
    };

    socket.on('draw-start', handleDrawStart);
    socket.on('draw-move', handleDrawMove);
    socket.on('draw-end', handleDrawEnd);
    socket.on('sync-board', handleSyncBoard);
    socket.on('clear-board', handleClearBoard);

    socket.on('request-board-state', () => {
      if (isHost) {
        broadcastBoard();
      }
    });

    socket.emit('request-board-state');

    return () => {
      socket.off('draw-start', handleDrawStart);
      socket.off('draw-move', handleDrawMove);
      socket.off('draw-end', handleDrawEnd);
      socket.off('sync-board', handleSyncBoard);
      socket.off('clear-board', handleClearBoard);
      socket.off('request-board-state');
    };
  }, [socket, historyIndex]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    let x = ('touches' in e) ? e.touches[0].clientX - rect.left : (e as React.MouseEvent).clientX - rect.left;
    let y = ('touches' in e) ? e.touches[0].clientY - rect.top : (e as React.MouseEvent).clientY - rect.top;

    if (tool === 'select') return;

    if (tool === 'text' || tool === 'sticky') {
      setTextInput({ visible: true, x, y, text: '', isSticky: tool === 'sticky' });
      return;
    }

    if (tool === 'image' && pendingImage) {
      ctx.globalCompositeOperation = 'source-over';
      ctx.drawImage(pendingImage, x, y, pendingImage.width / 2, pendingImage.height / 2);
      setPendingImage(null);
      setTool('select');
      saveHistory();
      broadcastBoard();
      return;
    }

    setIsDrawing(true);

    if (tool === 'shapes') {
      setStartX(x);
      setStartY(y);
      setSnapshot(ctx.getImageData(0, 0, canvas.width, canvas.height));
      return;
    }

    ctx.beginPath();
    ctx.moveTo(x, y);
    if (tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = brushSize * 2;
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = color;
      ctx.lineWidth = brushSize;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    }

    if (socket) {
      socket.emit('draw-start', { x, y, color, brushSize, tool, roomId });
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    let x = ('touches' in e) ? e.touches[0].clientX - rect.left : (e as React.MouseEvent).clientX - rect.left;
    let y = ('touches' in e) ? e.touches[0].clientY - rect.top : (e as React.MouseEvent).clientY - rect.top;

    if (tool === 'shapes' && snapshot) {
      ctx.putImageData(snapshot, 0, 0);
      ctx.beginPath();
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = color;
      ctx.lineWidth = brushSize;
      if (shapeType === 'rect') {
        ctx.rect(startX, startY, x - startX, y - startY);
      } else if (shapeType === 'circle') {
        const radius = Math.sqrt(Math.pow(x - startX, 2) + Math.pow(y - startY, 2));
        ctx.arc(startX, startY, radius, 0, 2 * Math.PI);
      } else if (shapeType === 'line') {
        ctx.moveTo(startX, startY);
        ctx.lineTo(x, y);
      }
      ctx.stroke();
      return;
    }

    ctx.lineTo(x, y);
    ctx.stroke();

    if (socket) {
      socket.emit('draw-move', { x, y, roomId });
    }
  };

  const endDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    if (tool === 'shapes' && snapshot) {
      setSnapshot(null);
      saveHistory();
      broadcastBoard();
    } else {
      if (ctx) ctx.closePath();
      saveHistory();
      if (socket) socket.emit('draw-end', { roomId });
    }
  };

  const handleTextSubmit = () => {
    if (!textInput.visible || !textInput.text.trim()) {
       setTextInput(prev => ({ ...prev, visible: false }));
       return;
    }
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.globalCompositeOperation = 'source-over';
    
    if (textInput.isSticky) {
      ctx.fillStyle = '#FEF08A';
      ctx.shadowColor = 'rgba(0,0,0,0.1)';
      ctx.shadowBlur = 10;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 4;
      ctx.fillRect(textInput.x, textInput.y, 160, 160);
      ctx.shadowColor = 'transparent';
      ctx.fillStyle = '#000000';
      ctx.font = '14px sans-serif';
      ctx.fillText(textInput.text, textInput.x + 10, textInput.y + 24);
    } else {
      ctx.fillStyle = color;
      ctx.font = `${brushSize * 4 + 10}px sans-serif`;
      ctx.fillText(textInput.text, textInput.x, textInput.y + (brushSize * 4 + 10));
    }

    setTextInput({ visible: false, x: 0, y: 0, text: '', isSticky: false });
    saveHistory();
    broadcastBoard();
    setTool('select');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        setPendingImage(img);
        setTool('image');
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const undo = () => {
    if (historyIndex <= 0) return;
    const newIndex = historyIndex - 1;
    setHistoryIndex(newIndex);
    const dataUrl = history[newIndex];
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
      ctx?.drawImage(img, 0, 0);
      broadcastBoard();
    };
    img.src = dataUrl;
  };

  const redo = () => {
    if (historyIndex >= history.length - 1) return;
    const newIndex = historyIndex + 1;
    setHistoryIndex(newIndex);
    const dataUrl = history[newIndex];
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
      ctx?.drawImage(img, 0, 0);
      broadcastBoard();
    };
    img.src = dataUrl;
  };

  const clearBoard = () => {
    if (!window.confirm("Are you sure you want to clear the whiteboard?")) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    saveHistory();
    if (socket) {
      socket.emit('clear-board', { roomId });
    }
  };

  return (
    <div className="w-full h-full relative overflow-hidden bg-white bg-[radial-gradient(#e5e7eb_1.5px,transparent_1.5px)] [background-size:20px_20px]">
      
      {/* Hidden File Input */}
      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />

      {/* Text/Sticky Input Overlay */}
      {textInput.visible && (
        <textarea
          autoFocus
          className={`absolute z-20 outline-none resize-none ${textInput.isSticky ? 'bg-[#FEF08A] text-black p-2 w-40 h-40 shadow-md' : 'bg-transparent'} border border-blue-500 rounded`}
          style={{ 
             left: textInput.x, 
             top: textInput.y, 
             color: textInput.isSticky ? '#000' : color,
             fontSize: textInput.isSticky ? '14px' : `${brushSize * 4 + 10}px`,
             fontFamily: 'sans-serif'
          }}
          value={textInput.text}
          onChange={e => setTextInput(prev => ({...prev, text: e.target.value}))}
          onBlur={handleTextSubmit}
          onKeyDown={e => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleTextSubmit(); } }}
        />
      )}

      {/* Left Sidebar Toolbar */}
      <div className="absolute top-4 bottom-4 left-4 w-16 bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center py-4 z-10 overflow-y-auto no-scrollbar">
        <div className="flex flex-col w-full space-y-1">
          <button onClick={() => setTool('select')} className={`flex flex-col items-center gap-1 w-full p-2 ${tool === 'select' ? 'text-blue-500 bg-blue-50/50' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}>
            <MousePointer2 size={20} />
            <span className="text-[9px] font-medium">Select</span>
          </button>
          <button onClick={() => setTool('pencil')} className={`flex flex-col items-center gap-1 w-full p-2 ${tool === 'pencil' ? 'text-blue-500 bg-blue-50/50' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}>
            <Pencil size={20} />
            <span className="text-[9px] font-medium">Pen</span>
          </button>
          <button onClick={() => setTool('eraser')} className={`flex flex-col items-center gap-1 w-full p-2 ${tool === 'eraser' ? 'text-blue-500 bg-blue-50/50' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}>
            <Eraser size={20} />
            <span className="text-[9px] font-medium">Eraser</span>
          </button>
          
          <div className="relative group w-full">
            <button onClick={() => setTool('shapes')} className={`flex flex-col items-center gap-1 w-full p-2 ${tool === 'shapes' ? 'text-blue-500 bg-blue-50/50' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}>
              {shapeType === 'rect' ? <Square size={20} /> : shapeType === 'circle' ? <Circle size={20} /> : <Minus size={20} />}
              <span className="text-[9px] font-medium flex items-center">Shapes <ChevronRight size={10} className="ml-0.5" /></span>
            </button>
            <div className="absolute left-full top-0 ml-2 hidden group-hover:flex bg-white rounded-lg shadow-md border border-slate-200 p-1 space-x-1">
              <button onClick={() => {setShapeType('rect'); setTool('shapes');}} className={`p-2 rounded ${shapeType==='rect' ? 'bg-blue-50 text-blue-500' : 'text-slate-500 hover:bg-slate-100'}`}><Square size={16}/></button>
              <button onClick={() => {setShapeType('circle'); setTool('shapes');}} className={`p-2 rounded ${shapeType==='circle' ? 'bg-blue-50 text-blue-500' : 'text-slate-500 hover:bg-slate-100'}`}><Circle size={16}/></button>
              <button onClick={() => {setShapeType('line'); setTool('shapes');}} className={`p-2 rounded ${shapeType==='line' ? 'bg-blue-50 text-blue-500' : 'text-slate-500 hover:bg-slate-100'}`}><Minus size={16}/></button>
            </div>
          </div>

          <button onClick={() => setTool('text')} className={`flex flex-col items-center gap-1 w-full p-2 ${tool === 'text' ? 'text-blue-500 bg-blue-50/50' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}>
            <Type size={20} />
            <span className="text-[9px] font-medium">Text</span>
          </button>
          <button onClick={() => setTool('sticky')} className={`flex flex-col items-center gap-1 w-full p-2 ${tool === 'sticky' ? 'text-blue-500 bg-blue-50/50' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}>
            <StickyNote size={20} />
            <span className="text-[9px] font-medium">Sticky</span>
          </button>
          <button onClick={() => fileInputRef.current?.click()} className={`flex flex-col items-center gap-1 w-full p-2 ${tool === 'image' || pendingImage ? 'text-blue-500 bg-blue-50/50' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}>
            <ImageIcon size={20} />
            <span className="text-[9px] font-medium">Image</span>
          </button>
        </div>
        
        <div className="w-8 h-px bg-slate-100 my-3"></div>
        
        <div className="flex flex-col w-full space-y-1">
          <button onClick={undo} disabled={historyIndex <= 0} className={`flex flex-col items-center gap-1 w-full p-2 ${historyIndex <= 0 ? 'text-slate-300' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}>
            <Undo size={20} />
            <span className="text-[9px] font-medium">Undo</span>
          </button>
          <button onClick={redo} disabled={historyIndex >= history.length - 1} className={`flex flex-col items-center gap-1 w-full p-2 ${historyIndex >= history.length - 1 ? 'text-slate-300' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}>
            <Redo size={20} />
            <span className="text-[9px] font-medium">Redo</span>
          </button>
        </div>

        <div className="mt-auto pt-2 w-full">
          <button onClick={clearBoard} className="flex flex-col items-center gap-1 w-full p-2 text-slate-400 hover:text-red-500 hover:bg-red-50">
            <Trash2 size={20} />
            <span className="text-[9px] font-medium">Clear</span>
          </button>
        </div>
      </div>

      {/* Top Left Floating Toolbar */}
      <div className="absolute top-4 left-24 bg-white rounded-2xl shadow-sm border border-slate-200 p-4 z-10 flex flex-col gap-4 min-w-[200px]">
        <div>
          <span className="text-xs font-semibold text-slate-700 block mb-2">Color</span>
          <div className="flex space-x-2">
            {colors.map(c => (
              <button 
                key={c.name}
                onClick={() => { setColor(c.hex); if(tool==='eraser' || tool==='select') setTool('pencil'); }}
                className={`w-6 h-6 rounded-full border-2 transition-transform ${color === c.hex && tool !== 'eraser' ? 'border-blue-500 scale-110' : 'border-transparent'}`}
                style={{ backgroundColor: c.hex }}
                title={c.name}
              />
            ))}
          </div>
        </div>
        <div>
          <span className="text-xs font-semibold text-slate-700 block mb-2">Size</span>
          <div className="flex space-x-3 items-center">
            {sizes.map(s => (
              <button 
                key={s.name}
                onClick={() => setBrushSize(s.value)}
                className={`flex items-center justify-center w-8 h-8 rounded-full transition-colors ${brushSize === s.value ? 'bg-blue-50 border border-blue-200' : 'hover:bg-slate-50'}`}
              >
                <div className="bg-slate-800 rounded-full" style={{ width: s.value, height: s.value }}></div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Top Right Close Button */}
      <div className="absolute top-4 right-4 z-10">
        <button onClick={onClose} className="p-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-full text-slate-500 shadow-sm transition-colors">
          <X size={20} />
        </button>
      </div>

      {/* Canvas Area */}
      <div className={`absolute inset-0 ${tool === 'pencil' || tool === 'shapes' ? 'cursor-crosshair' : tool === 'eraser' ? 'cursor-none' : 'cursor-default'}`}>
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={endDrawing}
          onMouseLeave={endDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={endDrawing}
          className="w-full h-full touch-none"
        />
        {/* Custom Eraser Cursor */}
        {tool === 'eraser' && (
          <div className="absolute top-0 left-0 pointer-events-none border border-slate-400 rounded-full mix-blend-difference hidden" style={{ width: brushSize*2, height: brushSize*2, transform: 'translate(-50%, -50%)' }}></div>
        )}
      </div>
    </div>
  );
}
