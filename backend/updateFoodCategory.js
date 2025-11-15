import mongoose from "mongoose";
import foodModel from "./models/foodModel.js";

const MONGO_URI = "mongodb+srv://ToT_admin:0000@cluster0.pq5hvg7.mongodb.net/food-delivery?retryWrites=true&w=majority&appName=Cluster0"; // Change to your DB

const categoryMap = {
  "Starter": "Starter",
  "Biryani": "Biryani",
  "Rice": "Rice",
  "Curry": "Curry",
  "Thali": "Thali",
  "Mandhi": "Mandhi",
  "Breakfast": "Breakfast",
  "Desserts": "Desserts",
   "starter": "Starter",
  "biryani": "Biryani",
   "rice": "Rice",
  "curry": "Curry",
  "thali": "Thali",
  "mandhi": "Mandhi",
  "breakfast": "Breakfast",
  "desserts": "Desserts",
  // Add more mappings if needed
};

async function updateCategories() {
  await mongoose.connect(MONGO_URI);
  const foods = await foodModel.find({});
  for (const food of foods) {
    // Map old category to new menu_name if needed
    const newCategory = categoryMap[food.category] || food.category;
    if (food.category !== newCategory) {
      food.category = newCategory;
      await food.save();
      console.log(`Updated ${food.name} to category ${newCategory}`);
    }
  }
  mongoose.disconnect();
}

updateCategories();
