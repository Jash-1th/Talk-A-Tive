const jwt = require("jsonwebtoken");
const CustomError = require("../utils/ErrorHandler");
const User = require("../models/UserModel");

module.exports.asyncWrap = function (fn) {

    return function (req, res, next) {
        fn(req, res, next).catch((err) => { next(err) });
    }
}

module.exports.protect = async function (req, res, next) {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        try {
            token = req.headers.authorization.split(" ")[1];
            let decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select("-password");

            next();
        } catch (err) {
            next(new CustomError("unauthorized error,token failed"))
        }
    }
    if (!token) {
        next(new CustomError(401, "unauthorized error, please provide the jwt token"));
    }
}