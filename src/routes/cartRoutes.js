const express = require("express");
const router = express.Router();

const cartController = require("../controllers/cartController");

// Rutas para carrito de invitado
router.post("/cart/guest", cartController.createGuestCart);
router.get("/cart/guest/:guestId", cartController.getGuestCart);
router.put("/cart/guest/:guestId", cartController.updateGuestCart);

// Rutas para carrito de usuario
router.get("/cart/user/:userId", cartController.getUserCart);
router.put("/cart/user/:userId", cartController.updateUserCart);
router.delete("/cart/user/:userId", cartController.deleteUserCart);

// Ruta para fusionar carritos
router.post("/cart/merge", cartController.mergeCart);

module.exports = router;
