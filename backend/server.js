require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const meetingRoutes = require('./routes/meetingRoutes');
app.use('/api/meetings', meetingRoutes);

// Socket.io for WebRTC Signaling and Whiteboard
io.on('connection', socket => {
  socket.on('join-room', (roomId, userDetails) => {
    socket.join(roomId);
    
    socket.to(roomId).emit('user-connected', userDetails);

    socket.on('disconnect', () => {
      socket.to(roomId).emit('user-disconnected', userDetails?.peerId);
    });

    socket.on('draw-start', (data) => {
      socket.to(roomId).emit('draw-start', data);
    });
    
    socket.on('draw-move', (data) => {
      socket.to(roomId).emit('draw-move', data);
    });

    socket.on('draw-end', () => {
      socket.to(roomId).emit('draw-end');
    });

    socket.on('sync-board', (data) => {
      socket.to(roomId).emit('sync-board', data);
    });

    socket.on('clear-board', () => {
      socket.to(roomId).emit('clear-board');
    });

    socket.on('toggle-whiteboard', (isOpen) => {
      socket.to(roomId).emit('toggle-whiteboard', isOpen);
    });

    socket.on('request-state', () => {
      socket.to(roomId).emit('request-state');
    });

    socket.on('sync-state', (state) => {
      socket.to(roomId).emit('sync-state', state);
    });

    socket.on('request-board-state', () => {
      socket.to(roomId).emit('request-board-state');
    });

    socket.on('chat-message', (data) => {
      socket.to(roomId).emit('chat-message', data);
    });
  });
});

// Database Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch(err => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
