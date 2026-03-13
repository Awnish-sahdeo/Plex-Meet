const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {
  console.log(`[connect] New client: ${socket.id}`);

  socket.on('join-room', ({ roomId, peerId }) => {
    // Kick existing sockets with same peerId in this room to prevent ghosts
    let roomSockets = io.sockets.adapter.rooms.get(roomId);
    if (roomSockets) {
      for (const id of roomSockets) {
        const s = io.sockets.sockets.get(id);
        if (s && s.peerId === peerId && id !== socket.id) {
          console.log(`[join-room] Kicking ghost socket ${id} for peer ${peerId}`);
          s.leave(roomId);
          s.disconnect(true);
        }
      }
    }

    socket.join(roomId);
    socket.roomId = roomId;
    socket.peerId = peerId;
    socket.displayName = `User ${socket.id.slice(0, 4)}`;

    const peers = [];
    roomSockets = io.sockets.adapter.rooms.get(roomId);
    if (roomSockets) {
      for (const id of roomSockets) {
        if (id !== socket.id) {
          const s = io.sockets.sockets.get(id);
          if (s) {
            peers.push({
              socketId: id,
              peerId: s.peerId,
              displayName: s.displayName,
              isMuted: s.isMuted || false,
              isCameraOff: s.isCameraOff || false
            });
          }
        }
      }
    }
    
    socket.emit('existing-peers', { peers });
    socket.to(roomId).emit('peer-joined', { 
      peerId, 
      socketId: socket.id, 
      displayName: socket.displayName 
    });
    
    console.log(`[join-room] Client ${socket.id} (${peerId}) joined room: ${roomId}`);
  });

  socket.on('offer', ({ targetSocketId, offer, fromSocketId }) => {
    socket.to(targetSocketId).emit('offer', { offer, fromSocketId });
  });

  socket.on('answer', ({ targetSocketId, answer, fromSocketId }) => {
    socket.to(targetSocketId).emit('answer', { answer, fromSocketId });
  });

  socket.on('ice-candidate', ({ targetSocketId, candidate, fromSocketId }) => {
    socket.to(targetSocketId).emit('ice-candidate', { candidate, fromSocketId });
  });

  socket.on('disconnect', () => {
    const { roomId, peerId } = socket;
    if (roomId) {
      socket.leave(roomId);
      socket.to(roomId).emit('peer-left', { socketId: socket.id, peerId });
      console.log(`[disconnect] Client ${socket.id} left room: ${roomId}`);
    }
  });

  /**
   * Media & Screen State Sync
   */
  socket.on('media-state-changed', ({ roomId, isMuted, isCameraOff }) => {
    socket.isMuted = isMuted;
    socket.isCameraOff = isCameraOff;
    socket.to(roomId).emit('peer-media-state-changed', {
      socketId: socket.id,
      isMuted,
      isCameraOff
    });
  });

  socket.on('screen-share-started', ({ roomId }) => {
    socket.to(roomId).emit('peer-screen-share-started', { socketId: socket.id });
  });

  socket.on('screen-share-stopped', ({ roomId }) => {
    socket.to(roomId).emit('peer-screen-share-stopped', { socketId: socket.id });
  });

  socket.on('raise-hand', ({ roomId, isRaised }) => {
    socket.to(roomId).emit('peer-hand-raised', { socketId: socket.id, isRaised });
  });

  socket.on('chat-message', ({ roomId, text, senderName }) => {
    const msg = {
      id: Math.random().toString(36).slice(2, 9),
      senderId: socket.id,
      senderName,
      text,
      ts: Date.now()
    };
    io.to(roomId).emit('chat-message', msg);
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`[signaling] Server running on port ${PORT}`);
});
