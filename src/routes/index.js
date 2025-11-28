const { Router } = require("express");
const router = Router();

router.use("/products", require("../controllers/productController"));
router.use("/users", require("../controllers/userController"));
router.use("/", require("./cartRoutes"));

module.exports = router;
