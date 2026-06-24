const Product = require('../models/Product');

//@desc Get all products
//@route GET /api/products
const getProducts = async (req, res) => {
  try {
    const products = await Product.find({});
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//@desc Tao mot san pham
//@ route POST /api/products
const createProduct = async (req,res) => {
  try {
     const {name,description,price,category,stock,imageUrl} = req.body;
     const product = new Product({
      name,
      description,
      price,
      category,
      stock,
      imageUrl
     });
     const savedProduct = await product.save();
     res.status(201).json(savedProduct);
  } catch (error) {
      res.status(400).json({ message: error.message });
  }
}

//@desc Delete a product by ID
//@route DELETE /api/products/:id
const deleteProduct = async (req,res) => {
  try {
   const id = req.params.id; 
   const product = await Product.findById({_id: id});
   if(!product) {
    return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
   }
   await product.remove();
   res.status(200).json({ message: 'Sản phẩm đã được xóa' });
  }catch(error) {
    res.status(500).json({ message: error.message });
  }
}

module.exports = {
  getProducts,
  createProduct,
  deleteProduct
};