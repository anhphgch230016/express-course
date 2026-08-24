var express = require('express');
var router = express.Router();
var ProductModel = require('../models/ProductModel');
var CategoryModel = require('../models/CategoryModel');
const { checkSingleSession, checkMultipleSession } = require('../middlewares/auth');
var path = require('path');
const { addImageUrl } = require('../utils/productImage');

//import and config "multer" package
var multer = require('multer');

const storage = multer.diskStorage(
   {
      destination: (req, file, cb) => {
         cb(null, path.join(__dirname, '../public/images'));
      },
      filename: (req, file, cb) => {
         const safeName = path.basename(file.originalname).replace(/[^a-zA-Z0-9._-]/g, '_');
         const fileName = `${Date.now()}-${Math.round(Math.random() * 1E9)}-${safeName}`;
         cb(null, fileName);
      }
   }
);

const upload = multer({
   storage: storage,
   limits: { fileSize: 5 * 1024 * 1024 },
   fileFilter: (req, file, cb) => {
      if (file.mimetype.startsWith('image/')) return cb(null, true);
      cb(new Error('Only image files are allowed.'));
   }
})

function getSubmittedImage(req, currentImage = '') {
   if (req.file) return req.file.filename;
   const imageUrl = (req.body.imageUrl || '').trim();
   return imageUrl || currentImage;
}

router.get('/', checkMultipleSession(['user', 'admin']), async (req, res) => {
   var productList = await ProductModel.find({}).populate('category');
   productList = productList.map(addImageUrl);
   if (req.session.role == "admin")
      res.render('product/index', { productList });
   else
      res.render('product/indexUser', { productList });
});

router.get('/add', checkSingleSession, async (req, res) => {
   var categoryList = await CategoryModel.find({});
   res.render('product/add', { categoryList });
})

router.post('/add', checkSingleSession, upload.single('imageFile'), async (req, res) => {
   try {
      var product = req.body;
      product.image = getSubmittedImage(req);
      if (!product.image) {
         return res.status(400).send('Please provide an image URL or upload an image file.');
      }
      await ProductModel.create(product);
      res.redirect('/product');
   }
   catch (err) {
      if (err.name === 'ValidationError') {
         let InputErrors = {};
         for (let field in err.errors) {
            InputErrors[field] = err.errors[field].message;
         }
         res.render('product/add', { InputErrors, product });
      }
   }
})

router.get('/edit/:id', checkSingleSession, async (req, res) => {
   var id = req.params.id;
   var product = await ProductModel.findById(id);
   res.render('product/edit', { product: addImageUrl(product) });
})

router.post('/edit/:id', checkSingleSession, upload.single('imageFile'), async (req, res) => {
   var id = req.params.id;
   var data = req.body;
   data.image = getSubmittedImage(req, data.currentImage);
   delete data.imageUrl;
   delete data.currentImage;
   await ProductModel.findByIdAndUpdate(id, data);
   res.redirect('/product');
})

router.get('/delete/:id', checkSingleSession, async (req, res) => {
   var id = req.params.id;
   await ProductModel.findByIdAndDelete(id);
   res.redirect('/product');
})

router.post('/search', checkMultipleSession(['user', 'admin']), async (req, res) => {
   var keyword = req.body.keyword;
   var productList = await ProductModel.find({ name: new RegExp(keyword, "i") }).populate('category');
   productList = productList.map(addImageUrl);
   const view = req.session.role === 'admin' ? 'product/index' : 'product/indexUser';
   res.render(view, { productList })
})

router.get('/sort/asc', checkMultipleSession(['user', 'admin']), async (req, res) => {
   var productList = await ProductModel.find().sort({ name: 1 }).populate('category');
   productList = productList.map(addImageUrl);
   const view = req.session.role === 'admin' ? 'product/index' : 'product/indexUser';
   res.render(view, { productList })
})

router.get('/sort/desc', checkMultipleSession(['user', 'admin']), async (req, res) => {
   var productList = await ProductModel.find().sort({ name: -1 }).populate('category');
   productList = productList.map(addImageUrl);
   const view = req.session.role === 'admin' ? 'product/index' : 'product/indexUser';
   res.render(view, { productList })
})

module.exports = router;
