const inventory = {};

function initCatalog(productInfo) {
  for (let product of productInfo) {
    product.quantity = 0;
    inventory[product.product_id] = product;
  }
}

function processRestock(restock) {
  for (let stock of restock) {
    inventory[stock.product_id].quantity =
      inventory[stock.product_id] === undefined
        ? stock.quantity
        : stock.quantity + inventory[stock.product_id].quantity;
  }
}
