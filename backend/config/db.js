/*import mongoose from "mongoose";

export const  connectDB = async () =>{

    await mongoose.connect('mongodb+srv://ToT_admin:0000@cluster0.pq5hvg7.mongodb.net/').then(()=>console.log("DB Connected"));
    
   
}*/

import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ DB Connected");
  } catch (err) {
    console.error("❌ MongoDB Error:", err.message);
    process.exit(1);
  }
};


// add your mongoDB connection string above.
// Do not use '@' symbol in your databse user's password else it will show an error.