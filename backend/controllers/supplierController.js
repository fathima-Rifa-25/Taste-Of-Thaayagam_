import supplierModel from "../models/supplierModel.js";

// Add supplier
const addSupplier = async (req, res) => {
  try {
    console.log("REQ BODY:", req.body);

    const { name, itemName, qty, contact, location, status } = req.body;

    // Validate fields
    if (!name || !itemName || !qty || !contact || !location) {
      return res.json({
        success: false,
        message: "All fields (name, itemName, qty, contact, location) are required",
      });
    }

    const supplier = new supplierModel({ 
      name, 
      itemName, 
      qty, 
      contact, 
      location, 
      status: status || "Active"  // default if not provided
    });

    await supplier.save();

    res.json({ success: true, message: "Supplier Added", data: supplier });
  } catch (error) {
    console.error("ADD ERROR:", error.message);
    res.json({
      success: false,
      message: "Error Adding Supplier",
      error: error.message,
    });
  }
};

// List all suppliers
const listSuppliers = async (req, res) => {
  try {
    const suppliers = await supplierModel.find({});
    res.json({ success: true, data: suppliers });
  } catch (error) {
    console.error("LIST ERROR:", error.message);
    res.json({ 
      success: false, 
      message: "Error Fetching Suppliers", 
      error: error.message 
    });
  }
};

// Update supplier
const updateSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await supplierModel.findByIdAndUpdate(
      id, 
      req.body, 
      { new: true }
    );

    if (!updated) {
      return res.json({ success: false, message: "Supplier not found" });
    }

    res.json({ success: true, message: "Supplier Updated", data: updated });
  } catch (error) {
    console.error("UPDATE ERROR:", error.message);
    res.json({ 
      success: false, 
      message: "Error Updating Supplier", 
      error: error.message 
    });
  }
};

// Delete supplier
const deleteSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await supplierModel.findByIdAndDelete(id);

    if (!deleted) {
      return res.json({ success: false, message: "Supplier not found" });
    }

    res.json({ success: true, message: "Supplier Deleted" });
  } catch (error) {
    console.error("DELETE ERROR:", error.message);
    res.json({ 
      success: false, 
      message: "Error Deleting Supplier", 
      error: error.message 
    });
  }
};

export { addSupplier, listSuppliers, updateSupplier, deleteSupplier };
