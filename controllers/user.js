const User= require("../models/user");

module.exports.signupGET =(req,res)=>{
    res.render("users/signup.ejs");
};
module.exports.signupPOST = async(req,res)=>{
    try{
        let {username,email,password}= req.body;
        const newUser= new User({email,username});
        const registerUser =await User.register(newUser,password);
        req.login(registerUser,(err)=>{
            if(err){
                return next(err);
            }
            req.flash("success","Welcome to Wanderlust!");
            res.redirect("/listings");
        }); 
    }catch(err){
        req.flash("error",err.message);
        res.redirect("/signup");
    } 
};

module.exports.loginGET = (req,res)=>{
    res.render("users/login.ejs");
};
module.exports.loginPOST = async(req,res)=>{
    req.flash("success","Welcome back to WanderLust!");
    let redirectURL=res.locals.redirectUrl || "/listings";
    res.redirect(redirectURL);
};

module.exports.logout = (req,res)=>{
    req.logout((err)=>{
        if(err){
            return next(err);
        }
        req.flash("success","Successfully Logged out!!");
        res.redirect("/listings");
    });
};