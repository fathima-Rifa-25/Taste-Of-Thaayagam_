import express from "express";
import {
  addSupplier,
  listSuppliers,
  updateSupplier,
  deleteSupplier,
} from "../controllers/supplierController.js";

const supplierRouter = express.Router();

// Add supplier
supplierRouter.post("/", addSupplier);

// List all suppliers
supplierRouter.get("/list", listSuppliers);

// Update supplier
supplierRouter.put("/:id", updateSupplier);

// Delete supplier
supplierRouter.delete("/:id", deleteSupplier);

export default supplierRouter;


