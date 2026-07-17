const Chat = require("../models/chatModel");
const CustomError = require("../utils/ErrorHandler");


module.exports.accessChats = async (req, res, next) => {
    let { userId } = req.body;
    console.log(" User LOggedin : " + req.user);
    if (!userId) {
        console.log("UserId param not sent with request");
        return res.status(400)
    }
    let isChat = await Chat.find({ isGroupChat: false, $and: [{ users: { $elemMatch: { $eq: userId } } }, { users: { $elemMatch: { $eq: req.user._id } } }] }).populate("users", "-password").populate({
        path: "latestMessage",
        populate: {
            path: "sender",
            select: "-password"
        }
    })
    if (isChat.length > 0) {
        return res.send(isChat[0]);
    }
    let chat = {
        chatName: "sender",
        isGroupChat: false,
        users: [req.user._id, userId]
    }
    try {
        let newChat = await Chat.create(chat);
        console.log(newChat);
        const FullChat = await Chat.findOne({ _id: newChat._id }).populate(
            "users",
            "-password"
        );
        console.log("craeted Chat", FullChat);
        res.status(200).json(FullChat);

    } catch (err) {
        console.log("error in creating a chat");
        next(new CustomError(400, err.message));
    }
}

module.exports.fetchChats = async (req, res, next) => {
    console.log(req.user._id);
    let allChats = await Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
        .populate({
            path: "latestMessage",
            populate: {
                path: "sender",
                select: "-password"
            }
        })
        .populate("users", "-password")
        .populate("groupAdmin", "-password")

    res.json(allChats);
}

module.exports.createGroupChat = async (req, res, next) => {
    let { users, name } = req.body;
    if (!users || !name) {
        return next(new CustomError(400, "add the users and set the name to group"));
    }
    console.log(typeof users);
    users = JSON.parse(users);
    users.push(req.user);
    if (users.length < 2) {
        return next(new CustomError(400, "More than two users are required to create the group"));
    }
    let newGroup = {
        chatName: name,
        users,
        isGroupChat: true,
        groupAdmin: req.user._id
    }
    try {
        Chat.create(newGroup).then(async (result) => {
            let fetchNewGroup = await Chat.findById(result._id).populate("users", "-password").populate("groupAdmin", "-password")
            res.json(fetchNewGroup);

        })
    } catch (err) {
        console.log("error in creating the group");
        return next(new CustomError(400, err.message));
    }
}

module.exports.rename = async (req, res) => {
    let { chatId, chatName } = req.body
    let updatedChat = await Chat.findByIdAndUpdate(chatId, { chatName }, { new: true }).populate("users", "-password").populate("groupAdmin", "-password")
    res.json(updatedChat);

}

module.exports.addToGroup = async (req, res, next) => {
    let { chatId, userId } = req.body;
    let updatedGroup = await Chat.findByIdAndUpdate(chatId, { $push: { users: userId } }, { new: true }).populate("users", "-password").populate("groupAdmin", "-password");
    if (!updatedGroup) return next(new CustomError(400, "Chat Not Found"));
    res.json(updatedGroup);
}

module.exports.removeFromGroup = async (req, res, next) => {
    let { chatId, userId } = req.body;
    let updatedGroup = await Chat.findByIdAndUpdate(chatId, { $pull: { users: userId } }, { new: true }).populate("users", "-password").populate("groupAdmin", "-password");
    if (!updatedGroup) return next(new CustomError(400, "Chat Not Found"));
    res.json(updatedGroup);

}