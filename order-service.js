const inventory = {};
const pendingOrders = [];
const SHIPMENT_THRESHOLD = 1800;

/**
 * Initializes our inventory with all products in productInfo
 * and sets the quantity for every product to zero
 * Time Complexity -
 * Space Complexity -
 * @param  {} productInfo
 */
function initCatalog(productInfo) {
  for (let product of productInfo) {
    product.quantity = 0;
    inventory[product.product_id] = product;
  }
}

/**
 * Add new products to the inventory when there is
 * a new supply and calls processOrder on any pending orders.
 * Time Complexity -
 * Space Complexity -
 * @param  {} restock
 */
function processRestock(restock) {
  for (let stock of restock) {
    inventory[stock.product_id].quantity =
      stock.quantity + inventory[stock.product_id].quantity;
  }

  pendingOrders.forEach(processOrder);
}

/**
 * Prints information about the a particular shipping. Its order_id,
 * and the products in the shipment.
 * Time Complexity -
 * Space Complexity -
 * @param  {} shipment
 */
function shipPackage(shipment) {
  console.log(`Order ${shipment.order_id} has just been shipped.`);
  console.log(`It comprises of the following products: `);
  for (let product of shipment.shipped) {
    console.log(
      `${product.quantity} ${inventory[product.product_id].product_name}`
    );
  }
}

const order = {
  order_id: 123,
  requested: [
    { product_id: 0, quantity: 2 },
    { product_id: 10, quantity: 4 },
  ],
};
const shipment = {
  order_id: 123,
  shipped: [
    { product_id: 0, quantity: 1 },
    { product_id: 10, quantity: 2 },
  ],
};

/**
 * Processes incoming orders so as to fit the 1.8Kg
 * constraint of every shipment before pushing out order
 * for fulfillment.
 * Time Complexity -
 * Space Complexity -
 * @param  {} order
 */
function processOrder(order) {
  let shipmentMass = 0;

  let shipment = {
    order_id: order.order_id,
    shipped: [],
  };

  let unfilfilledPartialOrder = {
    order_id: order.order_id,
    requested: [],
  };

  for (let product of order.requested) {
    if (
      inventory[product.product_id] === undefined ||
      inventory[product.product_id].quantity === 0
    ) {
      unfilfilledPartialOrder.requested.push(product);
    }

    if (inventory[product.product_id].quantity < product.quantity) {
      let quantityLeftToFulfill =
        product.quantity - inventory[product.product_id].quantity;
      unfilfilledPartialOrder.requested.push({
        product_id: product.product_id,
        quantity: quantityLeftToFulfill,
      });

      product.quantity = inventory[product.product_id].quantity;
    }

    //fulfill
    while (product.quantity > 0) {
      if (
        inventory[product.product_id].mass_g + shipmentMass >
        SHIPMENT_THRESHOLD
      ) {
        shipPackage(shipment);
        shipment = {
          order_id: order.order_id,
          shipped: [product],
        };
        shipmentMass = product.quantity * inventory[product.product_id].mass_g;
      } else {
        shipment.shipped.push(product);
        shipmentMass += product.quantity * inventory[product.product_id].mass_g;
      }

      product.quantity--;
    }
  }
}

exports.initCatalog = initCatalog;
exports.shipPackage = shipPackage;
exports.processOrder = processOrder;
exports.processRestock = processRestock;
