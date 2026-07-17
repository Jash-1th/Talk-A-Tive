const express = require("express");
const { asyncWrap, protect } = require("../middlewares/middleware");
const { sendMessage, allMessages } = require("../controllers/messageControllers");

const router = express.Router({ mergeParams: true });

router.route("/")
    .post(asyncWrap(protect), sendMessage);

router.route("/:chatId")
    .get(asyncWrap(protect), allMessages)

module.exports = router;