require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { connectDB } = require("./config/connectMongoDB.js");
const userRoutes = require("./routes/userRoutes.js");
const chatRoutes = require("./routes/chatRoutes.js");
const messageRoutes = require("./routes/messageRoutes.js");

const app = express();

// Deployment-friendly configuration
const DEV_LINK = process.env.DEV_LINK || 'http://localhost:3000';
const PROD_LINK = process.env.PROD_LINK;
const MONGO_URL = process.env.MONGO_URL;

const whitelist = [DEV_LINK, PROD_LINK].filter(Boolean); // Filter out undefined links

const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin || whitelist.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
};

app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

connectDB(MONGO_URL)
    .then(() => console.log("DB Connection successful"))
    .catch((err) => console.log("DB Connection Error:", err));

// Routes
app.use("/api/user", userRoutes);
app.use("/api/chats", chatRoutes);
// Consistent naming: matches your SingleChat.jsx API calls
app.use("/api/messages", messageRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        message: err.message,
        stack: process.env.NODE_ENV === "production" ? null : err.stack,
    });
});

// Use process.env.PORT for deployment (e.g., Render/Heroku)
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// Socket.io Setup
const io = require("socket.io")(server, {
    pingTimeout: 60000,
    cors: {
        origin: [DEV_LINK, PROD_LINK].filter(Boolean),
    },
});

io.on("connection", (socket) => {
    console.log("Connected to socket.io");

    socket.on("setup", (userData) => {
        socket.join(userData._id);
        socket.emit("connected");
    });

    socket.on("join chat", (room) => {
        socket.join(room);
        console.log("User Joined Room: " + room);
    });

    socket.on("typing", (room) => socket.in(room).emit("typing"));
    socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

    socket.on("new message", (newMessageRecieved) => {
        var chat = newMessageRecieved.chat;
        if (!chat.users) return console.log("chat.users not defined");

        chat.users.forEach((user) => {
            if (user._id == newMessageRecieved.sender._id) return;
            socket.in(user._id).emit("message recieved", newMessageRecieved);
        });
    });

    socket.on("disconnect", () => {
        console.log("USER DISCONNECTED");
    });
});