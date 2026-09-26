const express = require("express");
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

// All product routes require a valid JWT
router.use(protect);

// Both admin and user can view (list + single), with pagination/search
router.get("/", authorize("admin", "user"), getProducts);
router.get("/:id", authorize("admin", "user"), getProductById);

// Both admin and user can create - the creator becomes the "owner"
router.post("/", authorize("admin", "user"), createProduct);

// Update/delete: role check happens here, then OWNERSHIP check happens
// inside the controller (admin bypasses ownership, user does not)
router.put("/:id", authorize("admin", "user"), updateProduct);
router.delete("/:id", authorize("admin", "user"), deleteProduct);

module.exports = router;
