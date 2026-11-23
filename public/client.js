const socket = io();

// Các phần tử DOM
const loginBox = document.getElementById('login-box');
const chatContainer = document.getElementById('chat-container');
const usernameInput = document.getElementById('username-input');
const joinBtn = document.getElementById('join-btn');
const messageForm = document.getElementById('message-form');
const messageInput = document.getElementById('message-input');
const messagesDiv = document.getElementById('messages');
const userListDiv = document.getElementById('user-list');

let currentUsername = '';

// Tham gia chat
joinBtn.addEventListener('click', () => {
    const username = usernameInput.value.trim();
    if (!username) return alert('Vui lòng nhập tên!');
    
    currentUsername = username;
    socket.emit('set-username', username);
    
    // Ẩn đăng nhập, hiện chat
    loginBox.classList.add('hidden');
    chatContainer.classList.remove('hidden');
});

// Gửi tin nhắn
messageForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const msg = messageInput.value.trim();
    if (!msg) return;
    
    socket.emit('send-message', { username: currentUsername, message: msg });
    messageInput.value = '';
});

// Nhận tin nhắn mới
socket.on('new-message', (data) => {
    appendMessage(data.from, data.message, data.time);
});

// Cập nhật danh sách người dùng
socket.on('user-list', (users) => {
    userListDiv.innerHTML = '';
    if (users.length === 0) {
        userListDiv.innerHTML = '<p class="no-user">Chưa có ai online</p>';
        return;
    }
    users.forEach(user => {
        const div = document.createElement('div');
        div.className = 'user-item';
        div.textContent = user;
        userListDiv.appendChild(div);
    });
});

// Thông báo người dùng vào/ra
socket.on('user-online', (username) => {
    appendSystemMessage(`${username} đã tham gia phòng chat`);
});
socket.on('user-offline', (username) => {
    appendSystemMessage(`${username} đã rời phòng chat`);
});

// Thêm tin nhắn vào giao diện
function appendMessage(from, message, time) {
    const isMe = from === currentUsername;
    
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${isMe ? 'me' : 'other'}`;
    
    msgDiv.innerHTML = `
        ${!isMe ? `<div class="message-sender">${from}</div>` : ''}
        <div class="message-bubble">${escapeHtml(message)}</div>
        <div class="message-time">${time}</div>
    `;
    
    messagesDiv.appendChild(msgDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// Thêm thông báo hệ thống
function appendSystemMessage(text) {
    const sysDiv = document.createElement('div');
    sysDiv.className = 'system-notification';
    sysDiv.textContent = text;
    messagesDiv.appendChild(sysDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// Xử lý ký tự đặc biệt để tránh lỗi
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}