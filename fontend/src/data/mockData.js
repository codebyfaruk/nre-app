// src/data/mockData.js
// Add to existing mockData.js

// Available Roles
export const availableRoles = [
  {
    id: 1,
    name: "staff",
    displayName: "Staff",
    description: "Can make sales and handle returns",
  },
  {
    id: 2,
    name: "manager",
    displayName: "Manager",
    description: "Can manage products and inventory",
  },
  {
    id: 3,
    name: "admin",
    displayName: "Admin",
    description: "Can manage shops and users",
  },
  {
    id: 4,
    name: "superadmin",
    displayName: "Super Admin",
    description: "Full system access",
  },
];

// Expand mockUsers (update existing)
export const mockUsers = [
  {
    id: 1,
    username: "superadmin",
    email: "superadmin@shop.com",
    fullName: "Super Admin",
    password: "SuperAdmin@123",
    roles: ["superadmin", "admin", "manager", "staff"],
    isActive: true,
    createdAt: "2025-01-01T00:00:00Z",
  },
  {
    id: 2,
    username: "admin",
    email: "admin@shop.com",
    fullName: "Admin User",
    password: "Admin@123",
    roles: ["admin", "manager", "staff"],
    isActive: true,
    createdAt: "2025-01-05T00:00:00Z",
  },
  {
    id: 3,
    username: "manager",
    email: "manager@shop.com",
    fullName: "Manager User",
    password: "Manager@123",
    roles: ["manager", "staff"],
    isActive: true,
    createdAt: "2025-01-10T00:00:00Z",
  },
  {
    id: 4,
    username: "staff",
    email: "staff@shop.com",
    fullName: "Staff User",
    password: "Staff@123",
    roles: ["staff"],
    isActive: true,
    createdAt: "2025-01-15T00:00:00Z",
  },
  {
    id: 5,
    username: "john.doe",
    email: "john@shop.com",
    fullName: "John Doe",
    password: "Staff@123",
    roles: ["staff"],
    isActive: true,
    createdAt: "2025-01-20T00:00:00Z",
  },
  {
    id: 6,
    username: "jane.smith",
    email: "jane@shop.com",
    fullName: "Jane Smith",
    password: "Manager@123",
    roles: ["manager", "staff"],
    isActive: true,
    createdAt: "2025-02-01T00:00:00Z",
  },
  {
    id: 7,
    username: "mike.wilson",
    email: "mike@shop.com",
    fullName: "Mike Wilson",
    password: "Staff@123",
    roles: ["staff"],
    isActive: false,
    createdAt: "2025-02-10T00:00:00Z",
  },
];

// Mock Shops
export const mockShops = [
  {
    id: 1,
    name: "Main Store - Downtown",
    address: "123 Main Street",
    city: "Mumbai",
    state: "Maharashtra",
    country: "India",
    phone: "+91-9876543210",
    email: "downtown@shop.com",
    isActive: true,
  },
  {
    id: 2,
    name: "Branch Store - Andheri",
    address: "456 West Avenue",
    city: "Mumbai",
    state: "Maharashtra",
    country: "India",
    phone: "+91-9876543211",
    email: "andheri@shop.com",
    isActive: true,
  },
  {
    id: 3,
    name: "Outlet - Thane",
    address: "789 East Road",
    city: "Thane",
    state: "Maharashtra",
    country: "India",
    phone: "+91-9876543212",
    email: "thane@shop.com",
    isActive: true,
  },
];

// Mock Categories
export const mockCategories = [
  { id: 1, name: "Smartphones", description: "Mobile phones" },
  { id: 2, name: "Laptops", description: "Laptops and notebooks" },
  { id: 3, name: "Tablets", description: "Tablets and e-readers" },
  { id: 4, name: "Wearables", description: "Smart watches" },
  { id: 5, name: "Audio", description: "Headphones and speakers" },
  { id: 6, name: "Accessories", description: "Chargers, cases, etc" },
];

// Mock Products
export const mockProducts = [
  {
    id: 1,
    name: "iPhone 15 Pro Max",
    sku: "IP15PM-256-BLU",
    description: "Latest iPhone with A17 Pro chip",
    categoryId: 1,
    brand: "Apple",
    model: "15 Pro Max",
    price: 134900,
    discountPrice: null,
    costPrice: 120000,
    warrantyMonths: 12,
    isActive: true,
  },
  {
    id: 2,
    name: "Samsung Galaxy S24 Ultra",
    sku: "SGS24U-512-BLK",
    description: "Samsung flagship with S Pen",
    categoryId: 1,
    brand: "Samsung",
    model: "S24 Ultra",
    price: 129999,
    discountPrice: 124999,
    costPrice: 115000,
    warrantyMonths: 12,
    isActive: true,
  },
  {
    id: 3,
    name: 'MacBook Pro 16"',
    sku: "MBP16-M3-1TB",
    description: "MacBook Pro with M3 Max chip",
    categoryId: 2,
    brand: "Apple",
    model: 'MacBook Pro 16"',
    price: 299900,
    discountPrice: null,
    costPrice: 275000,
    warrantyMonths: 12,
    isActive: true,
  },
  {
    id: 4,
    name: 'iPad Pro 12.9"',
    sku: "IPP129-M2-512",
    description: "iPad Pro with M2 chip",
    categoryId: 3,
    brand: "Apple",
    model: 'iPad Pro 12.9"',
    price: 139900,
    discountPrice: null,
    costPrice: 125000,
    warrantyMonths: 12,
    isActive: true,
  },
  {
    id: 5,
    name: "Apple Watch Series 9",
    sku: "AWS9-45-GPS",
    description: "Latest Apple Watch",
    categoryId: 4,
    brand: "Apple",
    model: "Watch Series 9",
    price: 45900,
    discountPrice: 42900,
    costPrice: 38000,
    warrantyMonths: 12,
    isActive: true,
  },
  {
    id: 6,
    name: "Sony WH-1000XM5",
    sku: "WH1000XM5-BLK",
    description: "Premium noise cancelling headphones",
    categoryId: 5,
    brand: "Sony",
    model: "WH-1000XM5",
    price: 34990,
    discountPrice: 29990,
    costPrice: 25000,
    warrantyMonths: 24,
    isActive: true,
  },
];

// Mock Inventory
export const mockInventory = [
  {
    id: 1,
    productId: 1,
    shopId: 1,
    quantity: 15,
    minStockLevel: 5,
    reservedQuantity: 2,
  },
  {
    id: 2,
    productId: 2,
    shopId: 1,
    quantity: 8,
    minStockLevel: 5,
    reservedQuantity: 1,
  },
  {
    id: 3,
    productId: 3,
    shopId: 1,
    quantity: 3,
    minStockLevel: 5,
    reservedQuantity: 0,
  },
  {
    id: 4,
    productId: 4,
    shopId: 1,
    quantity: 12,
    minStockLevel: 5,
    reservedQuantity: 3,
  },
  {
    id: 5,
    productId: 5,
    shopId: 1,
    quantity: 2,
    minStockLevel: 5,
    reservedQuantity: 0,
  },
  {
    id: 6,
    productId: 6,
    shopId: 1,
    quantity: 18,
    minStockLevel: 5,
    reservedQuantity: 2,
  },
];

// Mock Sales
// Update mockSales in src/data/mockData.js

export const mockSales = [
  {
    id: 1,
    invoiceNumber: "INV-2025-001",
    saleDate: "2025-01-22T10:30:00Z",
    shopId: 1,
    paymentMethod: "cash",
    paymentReference: null,
    subtotal: 134900,
    taxAmount: 24282,
    totalAmount: 159182,
    status: "completed",
    customerName: "Rajesh Kumar",
    customerPhone: "+91 98765 43210",
    notes: "Gift wrap requested",
    items: [
      {
        productId: 1,
        productName: "iPhone 15 Pro Max",
        productSku: "IP15PM-256",
        quantity: 1,
        unitPrice: 134900,
        discount: 0,
        totalPrice: 134900,
      },
    ],
  },
  {
    id: 2,
    invoiceNumber: "INV-2025-002",
    saleDate: "2025-01-22T11:45:00Z",
    shopId: 1,
    paymentMethod: "card",
    paymentReference: "REF1737542700000",
    subtotal: 249998,
    taxAmount: 44999.64,
    totalAmount: 294997.64,
    status: "completed",
    customerName: "Priya Sharma",
    customerPhone: "+91 98888 12345",
    notes: null,
    items: [
      {
        productId: 2,
        productName: "Samsung Galaxy S24 Ultra",
        productSku: "SGS24U-512",
        quantity: 2,
        unitPrice: 124999,
        discount: 0,
        totalPrice: 249998,
      },
    ],
  },
  {
    id: 3,
    invoiceNumber: "INV-2025-003",
    saleDate: "2025-01-22T14:20:00Z",
    shopId: 2,
    paymentMethod: "upi",
    paymentReference: "UPI1737551200000",
    subtotal: 269900,
    taxAmount: 48582,
    totalAmount: 318482,
    status: "completed",
    customerName: "Amit Patel",
    customerPhone: "+91 99999 54321",
    notes: "Corporate purchase",
    items: [
      {
        productId: 3,
        productName: 'MacBook Pro 14" M3',
        productSku: "MBP14-M3-512",
        quantity: 1,
        unitPrice: 199900,
        discount: 0,
        totalPrice: 199900,
      },
      {
        productId: 6,
        productName: "AirPods Pro (2nd Gen)",
        productSku: "APP2-USB",
        quantity: 1,
        unitPrice: 24900,
        discount: 0,
        totalPrice: 24900,
      },
    ],
  },
  {
    id: 4,
    invoiceNumber: "INV-2025-004",
    saleDate: "2025-01-21T16:30:00Z",
    shopId: 1,
    paymentMethod: "cash",
    paymentReference: null,
    subtotal: 44900,
    taxAmount: 8082,
    totalAmount: 52982,
    status: "completed",
    customerName: null,
    customerPhone: null,
    notes: null,
    items: [
      {
        productId: 4,
        productName: "Sony WH-1000XM5",
        productSku: "SONY-WH1000XM5",
        quantity: 1,
        unitPrice: 29900,
        discount: 0,
        totalPrice: 29900,
      },
      {
        productId: 5,
        productName: 'Samsung 55" QLED 4K TV',
        productSku: "SAM-55QLED-Q80C",
        quantity: 1,
        unitPrice: 89999,
        discount: 74999,
        totalPrice: 15000,
      },
    ],
  },
  {
    id: 5,
    invoiceNumber: "INV-2025-005",
    saleDate: "2025-01-21T12:15:00Z",
    shopId: 3,
    paymentMethod: "online",
    paymentReference: "ONL1737460500000",
    subtotal: 89999,
    taxAmount: 16199.82,
    totalAmount: 106198.82,
    status: "completed",
    customerName: "Sneha Reddy",
    customerPhone: "+91 97777 88888",
    notes: "Delivery to office address",
    items: [
      {
        productId: 5,
        productName: 'Samsung 55" QLED 4K TV',
        productSku: "SAM-55QLED-Q80C",
        quantity: 1,
        unitPrice: 89999,
        discount: 0,
        totalPrice: 89999,
      },
    ],
  },
];

// Add to existing mockData.js

export const mockReturns = [
  {
    id: 1,
    returnNumber: "RET-2025-001",
    saleId: 1,
    invoiceNumber: "INV-2025-001",
    returnDate: "2025-01-23T10:30:00Z",
    shopId: 1,
    customerName: "Rajesh Kumar",
    customerPhone: "+91 98765 43210",
    reason: "Defective product - screen not working properly",
    status: "pending",
    totalAmount: 159182,
    refundAmount: 159182,
    processedBy: null,
    processedDate: null,
    notes: "Customer reported issue within 2 days of purchase",
    items: [
      {
        productId: 1,
        productName: "iPhone 15 Pro Max",
        productSku: "IP15PM-256",
        quantity: 1,
        unitPrice: 134900,
        totalPrice: 134900,
        returnReason: "Screen flickering issue",
      },
    ],
  },
  {
    id: 2,
    returnNumber: "RET-2025-002",
    saleId: 2,
    invoiceNumber: "INV-2025-002",
    returnDate: "2025-01-22T14:20:00Z",
    shopId: 1,
    customerName: "Priya Sharma",
    customerPhone: "+91 98888 12345",
    reason: "Changed mind - bought wrong model",
    status: "approved",
    totalAmount: 294997.64,
    refundAmount: 147498.82,
    processedBy: "Admin User",
    processedDate: "2025-01-22T16:00:00Z",
    notes: "Partial return - 1 unit returned, 1 unit kept",
    items: [
      {
        productId: 2,
        productName: "Samsung Galaxy S24 Ultra",
        productSku: "SGS24U-512",
        quantity: 1,
        unitPrice: 124999,
        totalPrice: 124999,
        returnReason: "Customer bought 2, needs only 1",
      },
    ],
  },
  {
    id: 3,
    returnNumber: "RET-2025-003",
    saleId: 4,
    invoiceNumber: "INV-2025-004",
    returnDate: "2025-01-22T11:00:00Z",
    shopId: 1,
    customerName: "Anonymous Customer",
    customerPhone: null,
    reason: "Product not as described",
    status: "rejected",
    totalAmount: 52982,
    refundAmount: 0,
    processedBy: "Manager User",
    processedDate: "2025-01-22T12:00:00Z",
    notes: "Return rejected - product seal was broken, used condition",
    items: [
      {
        productId: 4,
        productName: "Sony WH-1000XM5",
        productSku: "SONY-WH1000XM5",
        quantity: 1,
        unitPrice: 29900,
        totalPrice: 29900,
        returnReason: "Not satisfied with sound quality",
      },
    ],
  },
  {
    id: 4,
    returnNumber: "RET-2025-004",
    saleId: 3,
    invoiceNumber: "INV-2025-003",
    returnDate: "2025-01-23T09:15:00Z",
    shopId: 2,
    customerName: "Amit Patel",
    customerPhone: "+91 99999 54321",
    reason: "Wrong product received",
    status: "pending",
    totalAmount: 318482,
    refundAmount: 29282,
    processedBy: null,
    processedDate: null,
    notes: "Customer received AirPods instead of AirPods Pro",
    items: [
      {
        productId: 6,
        productName: "AirPods Pro (2nd Gen)",
        productSku: "APP2-USB",
        quantity: 1,
        unitPrice: 24900,
        totalPrice: 24900,
        returnReason: "Wrong product delivered",
      },
    ],
  },
  {
    id: 5,
    returnNumber: "RET-2025-005",
    saleId: 5,
    invoiceNumber: "INV-2025-005",
    returnDate: "2025-01-22T16:45:00Z",
    shopId: 3,
    customerName: "Sneha Reddy",
    customerPhone: "+91 97777 88888",
    reason: "Damaged during delivery",
    status: "approved",
    totalAmount: 106198.82,
    refundAmount: 106198.82,
    processedBy: "Admin User",
    processedDate: "2025-01-22T18:00:00Z",
    notes: "Full refund approved - TV screen cracked during shipping",
    items: [
      {
        productId: 5,
        productName: 'Samsung 55" QLED 4K TV',
        productSku: "SAM-55QLED-Q80C",
        quantity: 1,
        unitPrice: 89999,
        totalPrice: 89999,
        returnReason: "Physical damage - screen cracked",
      },
    ],
  },
];

// Helper functions
export const getProductsWithCategory = () => {
  return mockProducts.map((product) => ({
    ...product,
    categoryName:
      mockCategories.find((c) => c.id === product.categoryId)?.name ||
      "Unknown",
  }));
};

// Helper function to get inventory with product details - FIXED
export const getInventoryWithDetails = (shopId = null) => {
  console.log("🔍 Getting inventory details for shop:", shopId);

  let inventory = [...mockInventory]; // Create a copy

  // Filter by shop if provided
  if (shopId) {
    inventory = inventory.filter((inv) => inv.shopId === parseInt(shopId));
    console.log(
      "📦 Filtered inventory for shop",
      shopId,
      ":",
      inventory.length,
      "items"
    );
  }

  // Map with product and shop details
  const detailedInventory = inventory
    .map((inv) => {
      const product = mockProducts.find((p) => p.id === inv.productId);
      const shop = mockShops.find((s) => s.id === inv.shopId);
      const category = mockCategories.find((c) => c.id === product?.categoryId);

      if (!product) {
        console.warn("⚠️ Product not found for inventory item:", inv);
        return null;
      }

      return {
        ...inv,
        product: {
          ...product,
          categoryName: category?.name || "Unknown",
        },
        shop,
        availableQuantity: inv.quantity - inv.reservedQuantity,
      };
    })
    .filter(Boolean); // Remove null items

  console.log("✅ Detailed inventory:", detailedInventory);
  return detailedInventory;
};

export const getLowStockItems = () => {
  return getInventoryWithDetails().filter(
    (inv) => inv.quantity <= inv.minStockLevel
  );
};

// Mock API
export const mockAPI = {
  delay: (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms)),

  login: async (username, password) => {
    await mockAPI.delay(800);
    const user = mockUsers.find(
      (u) => u.username === username && u.password === password
    );
    if (user) {
      const { password, ...userWithoutPassword } = user;
      return { success: true, data: userWithoutPassword };
    }
    return { success: false, error: "Invalid credentials" };
  },

  getProducts: async () => {
    await mockAPI.delay();
    return { success: true, data: getProductsWithCategory() };
  },

  getShops: async () => {
    await mockAPI.delay();
    return { success: true, data: mockShops };
  },

  getInventory: async (shopId = null) => {
    await mockAPI.delay();
    return { success: true, data: getInventoryWithDetails(shopId) };
  },

  getLowStock: async () => {
    await mockAPI.delay();
    return { success: true, data: getLowStockItems() };
  },

  getSales: async () => {
    await mockAPI.delay();
    return { success: true, data: mockSales };
  },

  getTodaySales: async () => {
    await mockAPI.delay();
    const total = mockSales.reduce((sum, sale) => sum + sale.totalAmount, 0);
    return { success: true, data: { sales: mockSales, total } };
  },

  getReturns: async (status = null) => {
    await mockAPI.delay();
    let returns = mockReturns;
    if (status) {
      returns = returns.filter((r) => r.status === status);
    }
    return { success: true, data: returns };
  },

  getCategories: async () => {
    await mockAPI.delay();
    return { success: true, data: mockCategories };
  },
};
