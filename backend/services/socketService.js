const socketService = {
  io: null,

  init(io) {
    this.io = io;
    this.setupSocketHandlers();
  },

  setupSocketHandlers() {
    this.io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);

      socket.on('join-attendance-room', (userId) => {
        socket.join(`attendance-${userId}`);
        console.log(`User ${userId} joined attendance room`);
      });

      socket.on('join-admin-room', () => {
        socket.join('admin-attendance');
        console.log('Admin joined attendance room');
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
    });
  },

  // Emit attendance update to specific user
  emitToUser(userId, event, data) {
    if (this.io) {
      this.io.to(`attendance-${userId}`).emit(event, data);
    }
  },

  // Emit attendance update to all admins
  emitToAdmins(event, data) {
    if (this.io) {
      this.io.to('admin-attendance').emit(event, data);
    }
  },

  // Emit to all connected clients
  emitToAll(event, data) {
    if (this.io) {
      this.io.emit(event, data);
    }
  }
};

module.exports = socketService;
