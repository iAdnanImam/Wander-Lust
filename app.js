if(process.env.NODE_ENV!="production"){
  require("dotenv").config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const engine = require("ejs-mate");
const session= require("express-session");
const MongoStore = require("connect-mongo");
const flash=require("connect-flash");
const passport= require("passport");
const localStrategy= require("passport-local");
const User= require("./models/user.js");

const listingRoute = require("./routes/listing.js");
const reviewRoute = require("./routes/review.js");
const userRoute = require("./routes/user.js");

// Mongoose Connection
const dbURL= process.env.ATLASDB_URL;
async function main() {
  await mongoose.connect(dbURL);
  console.log("DB connection successful");
}
main().catch(err => console.log(err));

// Set up EJS and views
app.engine("ejs", engine);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

const store= MongoStore.create({
  mongoUrl: dbURL,
  crypto:{
     secret:process.env.SECRET,
  },
  touchAfter:24*3600,
});

store.on("error",()=>{
  console.log("ERROR in MONGO SESSION STORE",err);
})
const sessionOptions={
  store, 
  secret:process.env.SECRET,
  resave:false,
  saveUninitialized:true,
  cookie:{
    expires:Date.now()+1000*60*60*24*3,
    maxAge:1000*60*60*24*3,
    httpOnly:true
  }
};
// ROUTES
app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
  res.locals.success=req.flash("success");
  res.locals.error=req.flash("error");
  res.locals.currUser=req.user;
  next();
});

app.use("/listings",listingRoute);
app.use("/listings/:id/reviews",reviewRoute);
app.use("/",userRoute);

// Error Handling Middleware
app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something went wrong!" } = err;
  res.status(statusCode).render("error.ejs",{message});
});

// Server Listening
app.listen(8080, () => {
  console.log("Listening on port 8080");
});
