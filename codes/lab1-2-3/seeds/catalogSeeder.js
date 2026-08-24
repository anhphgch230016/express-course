var CategoryModel = require('../models/CategoryModel');
var ProductModel = require('../models/ProductModel');
var categorySeedData = require('../db/web.categories.json');
var productSeedData = require('../db/web.products.json');

async function seedCatalogData() {
   const sourceCategoryNames = new Map(
      categorySeedData.map((category) => [category._id.$oid, category.name])
   );

   // Use names as stable keys because MongoDB generates different IDs per database.
   for (const category of categorySeedData) {
      await CategoryModel.updateOne(
         { name: category.name },
         {
            $setOnInsert: {
               name: category.name,
               description: category.description
            }
         },
         { upsert: true }
      );
   }

   const savedCategories = await CategoryModel.find({
      name: { $in: categorySeedData.map((category) => category.name) }
   });
   const categoryIds = new Map(
      savedCategories.map((category) => [category.name, category._id])
   );

   for (const product of productSeedData) {
      const categoryName = sourceCategoryNames.get(product.category);
      const categoryId = categoryIds.get(categoryName);

      if (!categoryId) {
         throw new Error(`Seed category not found for product: ${product.name}`);
      }

      await ProductModel.updateOne(
         { name: product.name },
         {
            $setOnInsert: {
               name: product.name,
               price: product.price,
               image: product.image,
               category: categoryId
            }
         },
         { upsert: true }
      );
   }

   console.log(`Catalog seed is ready: ${categorySeedData.length} categories, ${productSeedData.length} products`);
}

module.exports = seedCatalogData;
