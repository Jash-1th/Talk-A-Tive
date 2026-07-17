const express = require("express")
const router = express.Router({ mergeParams: true });
const { registration, authenticateUser, allUsers } = require("../controllers/userControllers");
const { asyncWrap, protect } = require("../middlewares/middleware");

router.route("/")
    .post(asyncWrap(registration))
    .get(protect, asyncWrap(allUsers))

router.route("/login")
    .post(asyncWrap(authenticateUser))

module.exports = router;