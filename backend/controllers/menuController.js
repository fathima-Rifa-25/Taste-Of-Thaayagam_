import menuModel from "../models/menuModel.js";

// Get all menu categories
export const listMenu = async (req, res) => {
  try {
    const menus = await menuModel.find({});
    res.json({ success: true, data: menus });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message || "Error" });
  }
};
