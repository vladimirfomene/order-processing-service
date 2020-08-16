const {
  processOrder,
  shipPackage,
  initCatalog,
  processRestock,
  prepareShipment,
  subStractUnfulfillableProducts,
  firstFitDecreasingPacking,
  shipDrones,
  inventory,
  pendingOrders,
} = require("./order-service");

const productInfo = [
  { mass_g: 700, product_name: "RBC A+ Adult", product_id: 0 },
  { mass_g: 700, product_name: "RBC B+ Adult", product_id: 1 },
  { mass_g: 750, product_name: "RBC AB+ Adult", product_id: 2 },
  { mass_g: 680, product_name: "RBC O- Adult", product_id: 3 },
  { mass_g: 350, product_name: "RBC A+  Child", product_id: 4 },
  { mass_g: 200, product_name: "RBC AB+ Child", product_id: 5 },
  { mass_g: 120, product_name: "PLT AB+", product_id: 6 },
  { mass_g: 80, product_name: "PLT O+", product_id: 7 },
  { mass_g: 40, product_name: "CRYO A+", product_id: 8 },
  { mass_g: 80, product_name: "CRYO AB+", product_id: 9 },
  { mass_g: 300, product_name: "FFP A+", product_id: 10 },
  { mass_g: 300, product_name: "FFP B+", product_id: 11 },
  { mass_g: 300, product_name: "FFP AB+", product_id: 12 },
];

beforeAll(() => {
  initCatalog(productInfo);
});

test("Inventory should not be empty after initCatalog", () => {
  expect(Object.keys(inventory).length).toBe(13);
});

test("Inventory objects should be equal to those in productInfo", () => {
  productInfo.forEach((product) => {
    expect(product).toEqual(inventory[product.product_id]);
  });
});

test("Restock should create inventory products with non-zero quantities", () => {
  const restock = [
    { product_id: 0, quantity: 30 },
    { product_id: 1, quantity: 25 },
    { product_id: 2, quantity: 25 },
    { product_id: 3, quantity: 12 },
    { product_id: 4, quantity: 15 },
    { product_id: 5, quantity: 10 },
    { product_id: 6, quantity: 8 },
    { product_id: 7, quantity: 8 },
    { product_id: 8, quantity: 20 },
    { product_id: 9, quantity: 10 },
    { product_id: 10, quantity: 5 },
    { product_id: 11, quantity: 5 },
    { product_id: 12, quantity: 5 },
  ];

  processRestock(restock);
  restock.forEach((product) => {
    expect(product.quantity).toEqual(inventory[product.product_id].quantity);
  });
});

test("Expect console to print products being shipped.", () => {
  const shipment = {
    order_id: 123,
    shipped: [
      { product_id: 0, quantity: 1 },
      { product_id: 10, quantity: 2 },
    ],
  };

  const print = jest.fn();
  shipPackage(shipment, print);

  expect(print).toHaveBeenCalledTimes(4);
});

test("Should send orders to pending collection if not available in stock", () => {
  const order = {
    order_id: 123,
    requested: [
      { product_id: 0, quantity: 2 },
      { product_id: 1, quantity: 2 },
      { product_id: 10, quantity: 100 },
    ],
  };

  let drones = processOrder(order);
  expect(drones).toEqual([
    { order_id: 123, capacity: 100, products: { "0": 2, "10": 1 } },
    { order_id: 123, capacity: 100, products: { "1": 2, "10": 1 } },
    { order_id: 123, capacity: 900, products: { "10": 3 } },
  ]);
  expect(pendingOrders).toEqual([
    { order_id: 123, requested: [{ product_id: 10, quantity: 95 }] },
  ]);
});

test("prepareShipment should transform products in drone into shipment object", () => {
  let shipment = prepareShipment({
    order_id: 123,
    capacity: 100,
    products: { "0": 2, "10": 1 },
  });

  expect(shipment).toEqual({
    order_id: 123,
    shipped: [
      { product_id: 0, quantity: 2 },
      { product_id: 10, quantity: 1 },
    ],
  });
});

test("Ship drones once you have all the shipment objects", () => {
  let shipments = [
    { order_id: 123, shipped: [] },
    { order_id: 123, shipped: [] },
    { order_id: 123, shipped: [] },
  ];

  const shipPackage = jest.fn();
  shipDrones(shipments, shipPackage);

  expect(shipPackage).toHaveBeenCalledTimes(shipments.length);
});

test("substractedProducts should create an unfulfillable order", () => {
  let unfilfillableProducts = subStractUnfulfillableProducts(
    { product_id: 10, quantity: 100 },
    {
      order_id: 123,
      shipped: [
        { product_id: 0, quantity: 2 },
        { product_id: 10, quantity: 100 },
      ],
    }
  );

  expect(unfilfillableProducts).toEqual({
    order_id: 123,
    requested: [{ product_id: 10, quantity: 95 }],
  });
});

test("When product is not in inventory add it to unfulfillable order", () => {
  let unfilfillableProducts = subStractUnfulfillableProducts(
    { product_id: 15, quantity: 100 },
    {
      order_id: 123,
      shipped: [{ product_id: 15, quantity: 100 }],
    }
  );

  expect(unfilfillableProducts).toEqual({
    order_id: 123,
    requested: [{ product_id: 15, quantity: 100 }],
  });
});

test("does firstfitdecreasing packing work", () => {
  let drones = [];
  let order = {
    order_id: 123,
    shipped: [
      { product_id: 0, quantity: 2 },
      { product_id: 10, quantity: 100 },
    ],
  };
  let product = { product_id: 0, quantity: 2 };
  firstFitDecreasingPacking(product, drones, order);
  expect(drones).toEqual([
    { order_id: 123, capacity: 400, products: { "0": 2 } },
  ]);
});
