import foodModel from "../models/foodModel.js";
import fs from 'fs'

// all food list
const listFood = async (req, res) => {
    try {
        const foods = await foodModel.find({})
        res.json({ success: true, data: foods })
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" })
    }

}

// add food
const addFood = async (req, res) => {
    try {
        if (!req.file) {
            return res.json({ success: false, message: "Image is required" });
        }

        const food = new foodModel({
            name: req.body.name,
            description: req.body.description,
            price: req.body.price,
            category: req.body.category,
            image: req.file.filename,   // just the filename
        });

        await food.save();
        res.json({ success: true, message: "Food Added" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" });
    }
}

// delete food
const removeFood = async (req, res) => {
    try {

        const food = await foodModel.findById(req.body.id);
        fs.unlink(`uploads/${food.image}`, () => { })

        await foodModel.findByIdAndDelete(req.body.id)
        res.json({ success: true, message: "Food Removed" })

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" })
    }

}

// update food
const updateFood = async (req, res) => {
  try {
    const { _id, name, category, price } = req.body;

    const updated = await foodModel.findByIdAndUpdate(
      _id,
      { name, category, price },
      { new: true } // return the updated document
    );

    if (!updated) {
      return res.json({ success: false, message: "Food not found" });
    }

    res.json({ success: true, message: "Food updated successfully", data: updated });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Error updating food", error: error.message });
  }
};

export { listFood, addFood, removeFood, updateFood };


