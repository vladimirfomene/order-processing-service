const inventory = {};
const pendingOrders = [];
const SHIPMENT_THRESHOLD = 1800;

/**
 * Initializes our inventory with all products in productInfo
 * and sets the quantity for every product to zero
 * Time Complexity - O(n)
 * Space Complexity - O(n)
 * @param  {array} productInfo - info about inventory products
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
 * Time Complexity - O(n)
 * Space Complexity - O(1)
 * @param  {array} restock - new stock of products
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
 * Time Complexity - O(n)
 * Space Complexity - O(1)
 * @param  {object} shipment - shipment < 1.8Kg ready to fly on drone
 */
function shipPackage(shipment, print) {
  print(`Order ${shipment.order_id} has just been shipped.`);
  print(`It comprises of the following products: `);
  for (let product of shipment.shipped) {
    print(`${product.quantity} ${inventory[product.product_id].product_name}`);
  }
}

/**
 * Processes incoming orders so as to fit the 1.8Kg
 * constraint of every shipment before pushing out order
 * for fulfillment.
 * Time Complexity -
 * Space Complexity -
 * @param  {object} order - order with requested list of products from hospital.
 */
function processOrder(order) {
  let shipments = [];
  let currShipmentMass = 0;

  let unfilfilledPartialOrder = {
    order_id: order.order_id,
    requested: [],
  };

  let sortedRequest = order.requested.sort((a, b) => {
    return inventory[b.product_id].mass_g - inventory[a.product_id].mass_g;
  });

  for (let product of sortedRequest) {
    if (
      inventory[product.product_id] === undefined ||
      inventory[product.product_id].quantity === 0
    ) {
      unfilfilledPartialOrder.requested.push(product);
      continue;
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

    if (unfilfilledPartialOrder.requested.length !== 0)
      pendingOrders.push(unfilfilledPartialOrder);

    while (product.quantity > 0) {
      if (
        inventory[product.product_id].mass_g + currShipmentMass >
          SHIPMENT_THRESHOLD ||
        shipments.length === 0
      ) {
        shipments.push({
          order_id: order.order_id,
          shipped: [],
        });

        shipments[shipments.length - 1].shipped.push({
          product_id: product.product_id,
          quantity: 1,
        });

        currShipmentMass = inventory[product.product_id].mass_g;
      } else {
        let currShipment = shipments[shipments.length - 1].shipped;
        let lastProductCurrShipment = currShipment[currShipment.length - 1];
        if (lastProductCurrShipment.product_id !== product.product_id) {
          shipments[shipments.length - 1].shipped.push({
            product_id: product.product_id,
            quantity: 0,
          });
        }
        currShipment[currShipment.length - 1].quantity++;
        currShipmentMass += inventory[product.product_id].mass_g;
      }
      product.quantity--;
    }
  }

  shipments.forEach((shipment) => {
    shipPackage(shipment, console.log);
  });
}

exports.initCatalog = initCatalog;
exports.shipPackage = shipPackage;
exports.processOrder = processOrder;
exports.processRestock = processRestock;
exports.inventory = inventory;
exports.pendingOrders = pendingOrders;
