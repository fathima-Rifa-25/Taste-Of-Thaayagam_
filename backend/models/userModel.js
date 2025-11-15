import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    firstName: { type: String },
    lastName: { type: String },
    // keep legacy 'name' for backward compatibility
    name: { type: String },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    isAdmin: { type: Boolean, default: false },
    password: { type: String, required: true },
    cartData:{type:Object,default:{}}
    ,
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date }
}, { minimize: false })

const userModel = mongoose.models.user || mongoose.model("user", userSchema);
export default userModel;