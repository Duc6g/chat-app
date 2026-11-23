const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Phục vụ file tĩnh trong thư mục public
app.use(express.static('public'));

// Lưu danh sách người dùng online
const users = new Map();

// Khi có 1 client kết nối
io.on('connection', (socket) => {
    console.log('✅ Người dùng kết nối:', socket.id);

    // Người dùng đăng nhập/gửi tên
    socket.on('set-username', (username) => {
        users.set(socket.id, username);
        socket.broadcast.emit('user-online', username);
        io.emit('user-list', Array.from(users.values()));
    });

    // Nhận tin nhắn từ client → Gửi cho TẤT CẢ mọi người
    socket.on('send-message', (data) => {
        io.emit('new-message', {
            from: data.username,
            message: data.message,
            time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
        });
    });

    // Người dùng ngắt kết nối
    socket.on('disconnect', () => {
        const username = users.get(socket.id);
        if (username) {
            users.delete(socket.id);
            socket.broadcast.emit('user-offline', username);
            io.emit('user-list', Array.from(users.values()));
            console.log('❌ Người dùng rời:', username);
        }
    });
});

// Khởi động server
const PORT = 3000;
server.listen(PORT, () => {
    console.log(`🚀 Server chạy tại: http://localhost:${PORT}`);
});