const express= require("express");
const router= express.Router();
const User= require("../models/user");
const wrapAsync = require("../utils/wrapAsync");
const passport= require("passport");
const { saveRedirectUrl } = require("../middleware");
const userController= require("../controllers/user.js");

//SignUp Route
router.
    route("/signup").
    get(userController.signupGET).
    post(wrapAsync(userController.signupPOST));

//Login Route
router.
    route("/login").
    get(userController.loginGET).
    post(saveRedirectUrl,passport.authenticate("local",{failureRedirect:"/login", failureFlash:true}), wrapAsync(userController.loginPOST));

//Logout Route
router.get("/logout",userController.logout);
module.exports=router;