import mongoose from "mongoose";

const supplierSchema = new mongoose.Schema({
  name: { type: String, required: true },
  itemName: { type: String, required: true },
  qty: { type: Number, required: true },
  contact: { type: String, required: true },
  location: { type: String, required: true },  // ✅ new field
  status: { 
    type: String, 
    enum: ["Active", "Inactive"],  // ✅ restrict values
    default: "Active" 
  },
}, { timestamps: true });

const supplierModel = mongoose.models.supplier || mongoose.model("supplier", supplierSchema);
export default supplierModel;
