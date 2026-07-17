const CustomError = require("../utils/ErrorHandler");
const User = require("../models/UserModel");
const { generateToken } = require("../utils/generateToken");

module.exports.registration = async (req, res, next) => {
    console.log("hi");
    let { name, email, password, pic } = req.body;
    if (!name || !email || !password) {
        console.log(`name : ${name} , email : ${email} , password : ${password}`)
        return next(new CustomError(400, "please fill all the feilds"));
    }
    let reg_user = await User.findOne({ email });
    if (reg_user) {
        return next(new CustomError("400", "User Already Existed"));
    }
    let user = await User.create({ name, email, password, pic });
    if (user) {
        res.json(
            {
                _id: user._id,
                name: user.name,
                email: user.email,
                pic: user.pic,
                token: generateToken(user._id)
            }
        )
    }
}


module.exports.authenticateUser = async (req, res, next) => {
    let { email, password } = req.body;
    let user = await User.findOne({ email });
    if (!user) {
        return next(new CustomError(400, "User does not Exist, Enter Correct Credentials"));
    }
    if (user && (await user.matchPassword(password))) {
        res.json(
            {
                _id: user._id,
                name: user.name,
                email: user.email,
                pic: user.pic,
                token: generateToken(user._id)
            }
        )
    } else {
        next(new CustomError(400, "Invalid email Or Password"));
    }
}

module.exports.allUsers = async (req, res) => {
    const keyword = req.query.search
        ? {
            $or: [
                { name: { $regex: req.query.search, $options: "i" } },
                { email: { $regex: req.query.search, $options: "i" } },
            ],
        }
        : {};

    const users = await User.find(keyword).find({ _id: { $ne: req.user._id } });
    res.send(users);

}