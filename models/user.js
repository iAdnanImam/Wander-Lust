const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportMongoose =require("passport-local-mongoose");

const userSchema= new Schema({
    email:{
        type:String,
        required:true
    }
});
userSchema.plugin(passportMongoose);
module.exports=mongoose.model("User",userSchema);