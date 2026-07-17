const express = require("express");
const { protect, asyncWrap } = require("../middlewares/middleware");
const { accessChats, fetchChats, createGroupChat, rename, addToGroup, removeFromGroup } = require("../controllers/chatControllers");

const router = express.Router();

router.route("/")
    .post(asyncWrap(protect), asyncWrap(accessChats))
    .get(asyncWrap(protect), asyncWrap(fetchChats));

router.route("/group")
    .post(asyncWrap(protect), asyncWrap(createGroupChat));

router.route("/rename")
    .patch(asyncWrap(protect), asyncWrap(rename))

router.route("/groupadd")
    .patch(asyncWrap(protect), addToGroup)

router.route("/groupremove")
    .patch(asyncWrap(protect), removeFromGroup)



module.exports = router;