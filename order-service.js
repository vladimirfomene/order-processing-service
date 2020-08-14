function initCatalog(productInfo) {
  let inventory = {};
  for (let product of productInfo) {
    product.quantity = 0;
    inventory[product.product_id] = product;
  }

  return inventory;
}
