const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const Whiteboard = require('./models/whiteboard');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://localhost:27017/whiteboard', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('drawing', (data) => {
        socket.broadcast.emit('drawing', data);
    });

    socket.on('save', async (data) => {
        let whiteboard = await Whiteboard.findOne();
        if (!whiteboard) {
            whiteboard = new Whiteboard();
        }
        whiteboard.lines.push(data);
        await whiteboard.save();
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
