const inventory = {};

function initCatalog(productInfo) {
  for (let product of productInfo) {
    product.quantity = 0;
    inventory[product.product_id] = product;
  }
}

//re-examine this method
function processRestock(restock) {
  for (let stock of restock) {
    inventory[stock.product_id].quantity =
      inventory[stock.product_id] === undefined
        ? stock.quantity
        : stock.quantity + inventory[stock.product_id].quantity;
  }
}

function shipPackage(shipment) {
  console.log(`Order ${shipment.order_id} has just been shipped.`);
  console.log(`It comprises of the following products: `);
  for (let product of shipment.shipped) {
    console.log(
      `${product.quantity} ${inventory[product.product_id].product_name}`
    );
  }
}
