const { Router } = require("express");
const router = Router();

router.use("/products", require("../controllers/productController"));
router.use("/users", require("../controllers/userController"));
router.use("/checkout", require("../controllers/checkoutController"));
router.use("/test-email", require("./emailTestRoutes"));
router.use("/", require("./cartRoutes"));

module.exports = router;
