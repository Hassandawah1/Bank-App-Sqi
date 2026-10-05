const express = require("express")
const { saveProduct, getProducts } = require("../controllers/product.controller")
const router = express.Router()

router.post("/products", saveProduct)
router.get("/products", getProducts)

module.exports = router