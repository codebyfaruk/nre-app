// src/services/mock.service.js - COMPLETE VERSION
import {
  mockUsers,
  mockProducts,
  mockShops,
  mockInventory,
  mockSales,
  mockReturns,
  mockCategories,
  availableRoles,
  getProductsWithCategory,
  getInventoryWithDetails,
  getLowStockItems,
} from "../data/mockData";

export const mockService = {
  delay: (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms)),

  // Auth
  login: async (username, password) => {
    await mockService.delay();
    const user = mockUsers.find(
      (u) => u.username === username && u.password === password
    );
    if (user) {
      const { password, ...userWithoutPassword } = user;
      return { success: true, data: userWithoutPassword };
    }
    return { success: false, error: "Invalid credentials" };
  },

  // Products
  getProducts: async () => {
    await mockService.delay();
    return { success: true, data: getProductsWithCategory() };
  },

  createProduct: async (productData) => {
    await mockService.delay();
    const newProduct = {
      id: mockProducts.length + 1,
      ...productData,
      isActive: true,
    };
    mockProducts.push(newProduct);
    return { success: true, data: newProduct };
  },

  updateProduct: async (id, productData) => {
    await mockService.delay();
    const index = mockProducts.findIndex((p) => p.id === id);
    if (index !== -1) {
      mockProducts[index] = { ...mockProducts[index], ...productData };
      return { success: true, data: mockProducts[index] };
    }
    return { success: false, error: "Product not found" };
  },

  deleteProduct: async (id) => {
    await mockService.delay();
    const index = mockProducts.findIndex((p) => p.id === id);
    if (index !== -1) {
      mockProducts.splice(index, 1);
      return { success: true };
    }
    return { success: false, error: "Product not found" };
  },

  // Shops
  getShops: async () => {
    await mockService.delay();
    return { success: true, data: mockShops };
  },

  // Inventory
  getInventory: async (shopId = null) => {
    await mockService.delay();
    const inventory = getInventoryWithDetails(shopId);
    return { success: true, data: inventory };
  },

  getLowStock: async () => {
    await mockService.delay();
    return { success: true, data: getLowStockItems() };
  },

  // Sales
  getSales: async () => {
    await mockService.delay();
    return { success: true, data: mockSales };
  },

  getTodaySales: async () => {
    await mockService.delay();
    const total = mockSales.reduce((sum, sale) => sum + sale.totalAmount, 0);
    return { success: true, data: { sales: mockSales, total } };
  },

  createSale: async (saleData) => {
    await mockService.delay();
    const newSale = {
      id: mockSales.length + 1,
      invoiceNumber: `INV-2025-${String(mockSales.length + 1).padStart(
        3,
        "0"
      )}`,
      saleDate: new Date().toISOString(),
      ...saleData,
    };
    mockSales.push(newSale);
    return { success: true, data: newSale };
  },

  // Returns
  getReturns: async (status = null) => {
    await mockService.delay();
    let returns = mockReturns;
    if (status) {
      returns = returns.filter((r) => r.status === status);
    }
    return { success: true, data: returns };
  },

  // Categories
  getCategories: async () => {
    await mockService.delay();
    return { success: true, data: mockCategories };
  },

  // Users Management ✅ NEW METHODS
  getUsers: async () => {
    await mockService.delay();
    return { success: true, data: mockUsers };
  },

  createUser: async (userData) => {
    await mockService.delay();
    const newUser = {
      id: mockUsers.length + 1,
      ...userData,
      createdAt: new Date().toISOString(),
    };
    mockUsers.push(newUser);
    return { success: true, data: newUser };
  },

  updateUser: async (id, userData) => {
    await mockService.delay();
    const index = mockUsers.findIndex((u) => u.id === id);
    if (index !== -1) {
      mockUsers[index] = { ...mockUsers[index], ...userData };
      return { success: true, data: mockUsers[index] };
    }
    return { success: false, error: "User not found" };
  },

  deleteUser: async (id) => {
    await mockService.delay();
    const index = mockUsers.findIndex((u) => u.id === id);
    if (index !== -1) {
      const deletedUser = mockUsers[index];
      mockUsers.splice(index, 1);
      return { success: true };
    }
    return { success: false, error: "User not found" };
  },

  getRoles: async () => {
    await mockService.delay();
    return { success: true, data: availableRoles };
  },
  // Add to existing mock.service.js

  // Returns Management
  getReturns: async (status = null) => {
    await mockService.delay();
    let returns = [...mockReturns];
    if (status) {
      returns = returns.filter((r) => r.status === status);
    }
    return { success: true, data: returns };
  },

  approveReturn: async (id, notes) => {
    await mockService.delay();
    const index = mockReturns.findIndex((r) => r.id === id);
    if (index !== -1) {
      mockReturns[index] = {
        ...mockReturns[index],
        status: "approved",
        processedBy: "Current User",
        processedDate: new Date().toISOString(),
        notes: notes || mockReturns[index].notes,
      };
      return { success: true, data: mockReturns[index] };
    }
    return { success: false, error: "Return not found" };
  },

  rejectReturn: async (id, notes) => {
    await mockService.delay();
    const index = mockReturns.findIndex((r) => r.id === id);
    if (index !== -1) {
      mockReturns[index] = {
        ...mockReturns[index],
        status: "rejected",
        processedBy: "Current User",
        processedDate: new Date().toISOString(),
        refundAmount: 0,
        notes: notes || mockReturns[index].notes,
      };
      return { success: true, data: mockReturns[index] };
    }
    return { success: false, error: "Return not found" };
  },

  // Add to existing mock.service.js

  // Shops Management
  createShop: async (shopData) => {
    await mockService.delay();
    const newShop = {
      id: mockShops.length + 1,
      ...shopData,
      createdAt: new Date().toISOString(),
    };
    mockShops.push(newShop);
    return { success: true, data: newShop };
  },

  updateShop: async (id, shopData) => {
    await mockService.delay();
    const index = mockShops.findIndex((s) => s.id === id);
    if (index !== -1) {
      mockShops[index] = { ...mockShops[index], ...shopData };
      return { success: true, data: mockShops[index] };
    }
    return { success: false, error: "Shop not found" };
  },

  deleteShop: async (id) => {
    await mockService.delay();
    const index = mockShops.findIndex((s) => s.id === id);
    if (index !== -1) {
      const deletedShop = mockShops[index];
      mockShops.splice(index, 1);
      return { success: true };
    }
    return { success: false, error: "Shop not found" };
  },
};
