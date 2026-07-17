const Message = require("../models/messageModel");
const CustomError = require("../utils/ErrorHandler");
const Chat = require("../models/chatModel");

module.exports.allMessages = async (req, res, next) => {
    try {
        const messages = await Message.find({ chat: req.params.chatId })
            .populate("sender", "name pic email")
            .populate("chat");
        console.log(messages);
        res.json(messages);
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }

}

module.exports.sendMessage = async (req, res, next) => {
    let { chatId, content } = req.body;

    if (!content || content.length == 0) {
        return next(new CustomError(400, "Enter the message"));
    }

    let message = {
        sender: req.user._id,
        content,
        chat: chatId
    }

    try {
        let newMessage = await Message.create(message);

        newMessage = await newMessage.populate("sender", "name pic email");
        newMessage = await newMessage.populate({
            path: "chat",
            populate: {
                path: "users",
                select: "name pic email"
            }
        });

        await Chat.findByIdAndUpdate(req.body.chatId, { latestMessage: newMessage._id });

        res.json(newMessage);

    } catch (err) {
        console.log('error in creting message');
        next(new CustomError(500, err.message));
    }
}