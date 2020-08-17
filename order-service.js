const inventory = {};
const pendingOrders = [];
const DRONE_CAPACITY = 1800;

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
 * @param {function} print - expects the a print function like console.log
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
 * Time Complexity - O(n(ml + logn))
 * Space Complexity - O(m) - representative of the numbers of drones for the order.
 * @param  {object} order - order with requested list of products from hospital.
 */
function processOrder(order) {
  let drones = [];

  let sortedRequest = order.requested.sort((a, b) => {
    return inventory[b.product_id].mass_g - inventory[a.product_id].mass_g;
  });

  for (let product of sortedRequest) {
    let unfilfillableProducts = subStractUnfulfillableProducts(product, order);

    if (unfilfillableProducts.requested.length !== 0)
      pendingOrders.push(unfilfillableProducts);

    firstFitDecreasingPacking(product, drones, order);
  }

  let shipments = drones.map(prepareShipment);
  shipDrones(shipments, shipPackage);
  return drones;
}

/**
 * Use the firstfitdecreasing algorithm to minimize the number of drones
 * used per order. This algorithm comes from the bin packing problem in
 * computer science. This current implementation could be improved by
 * storing our drones in balanced binary search tree (AVL tree, Red Black tree).
 * This will improve the time for search firstfit drone.
 * Time Complexity - O(ml), l for the number of drones and m for the product quantity.
 * Space Complexity - O(1)
 * @param {object} product - product currently being packed
 * @param {array} drones - collections of drones to use for delivery.
 * @param {object} order - order object with requested
 */
function firstFitDecreasingPacking(product, drones, order) {
  while (product.quantity > 0) {
    let initQuantity = product.quantity;
    for (let drone of drones) {
      if (drone.capacity > inventory[product.product_id].mass_g) {
        drone.capacity -= inventory[product.product_id].mass_g;
        drone.products[product.product_id] =
          drone.products[product.product_id] === undefined
            ? 1
            : 1 + drone.products[product.product_id];
        product.quantity--;
        break;
      }
    }

    if (initQuantity === product.quantity) {
      let drone = {
        order_id: order.order_id,
        capacity: DRONE_CAPACITY - inventory[product.product_id].mass_g,
        products: {},
      };

      drone.products[product.product_id] = 1;
      product.quantity--;
      drones.push(drone);
    }
  }
}

/**
 *Extract the product quantity that cannot be fulfilled at the moment.
 * Time Complexity - O(1)
 * Space Complexity - O(1)
 * @param {object} product - object with product_id and quantity requested
 * @param {object} order - order object from hospital.
 */
function subStractUnfulfillableProducts(product, order) {
  let unfilfillableProducts = {
    order_id: order.order_id,
    requested: [],
  };

  if (
    inventory[product.product_id] === undefined ||
    inventory[product.product_id].quantity === 0
  ) {
    unfilfillableProducts.requested.push({
      product_id: product.product_id,
      quantity: product.quantity,
    });
    product.quantity = 0;
    return unfilfillableProducts;
  }

  if (inventory[product.product_id].quantity < product.quantity) {
    let quantityLeftToFulfill =
      product.quantity - inventory[product.product_id].quantity;
    unfilfillableProducts.requested.push({
      product_id: product.product_id,
      quantity: quantityLeftToFulfill,
    });

    product.quantity = inventory[product.product_id].quantity;
  }

  return unfilfillableProducts;
}

/**
 * Calls shipPackage to ship a collection of shipments.
 * Time Complexity - O(n*n) because shipPackage takes O(n)
 * Space Complexity - O(1)
 * @param {array} shipments - shipments to be put on drones for delivery
 * @param {function} shipPackage - ships packages
 */
function shipDrones(shipments, shipPackage) {
  shipments.forEach((shipment) => {
    shipPackage(shipment, console.log);
  });
}

/**
 * Re-structure items in the drone so that it is ready to be shipped.
 * Time Complexity - O(n)
 * Space Complexity - 0(n)
 * @param {object} drone - drone object with capacity, order_id and shipments
 * @returns {object} - shipment object ready to get in drone.
 */
function prepareShipment(drone) {
  let shipped = [];
  for (let productId of Object.keys(drone.products)) {
    shipped.push({
      product_id: Number(productId),
      quantity: drone.products[productId],
    });
  }

  return {
    order_id: drone.order_id,
    shipped: shipped,
  };
}

exports.initCatalog = initCatalog;
exports.shipPackage = shipPackage;
exports.processOrder = processOrder;
exports.processRestock = processRestock;
exports.prepareShipment = prepareShipment;
exports.shipDrones = shipDrones;
exports.subStractUnfulfillableProducts = subStractUnfulfillableProducts;
exports.firstFitDecreasingPacking = firstFitDecreasingPacking;
exports.inventory = inventory;
exports.pendingOrders = pendingOrders;
