function getImageUrl(image) {
   if (!image) return '';
   if (/^https?:\/\//i.test(image)) return image;
   return `/images/${image.replace(/^\/?images\//, '')}`;
}

function addImageUrl(product) {
   const data = product.toObject ? product.toObject() : product;
   return { ...data, imageUrl: getImageUrl(data.image) };
}

module.exports = { getImageUrl, addImageUrl };
