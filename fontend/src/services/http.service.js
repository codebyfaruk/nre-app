// src/services/http.service.js - MATCHED TO YOUR BACKEND ROUTES

import axios from "axios";

const API_BASE_URL = "http://0.0.0.0:8000/api";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const token = user.access_token || user.token;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    console.log(
      `🌐 API Request: ${config.method?.toUpperCase()} ${config.url}`
    );
    console.log(`📤 Request Data:`, config.data);
    return config;
  },
  (error) => {
    console.error("❌ Request Error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    console.log(`📥 Response Data:`, response.data);
    return response;
  },
  async (error) => {
    console.error(
      "❌ API Error:",
      error.response?.status,
      error.response?.data
    );
    return Promise.reject(error);
  }
);

export const httpService = {
  // ============================================
  // 🔐 AUTH ENDPOINTS
  // ============================================

  login: async (username, password) => {
    const response = await apiClient.post("/auth/login", {
      username,
      password,
    });
    return { success: true, data: response.data };
  },

  refreshToken: async (refreshToken) => {
    const response = await apiClient.post("/auth/refresh", {
      refresh_token: refreshToken,
    });
    return { success: true, data: response.data };
  },

  getMe: async () => {
    const response = await apiClient.get("/auth/me");
    return { success: true, data: response.data };
  },

  // ============================================
  // 👥 USERS ENDPOINTS
  // ============================================

  getUsers: async () => {
    const response = await apiClient.get("/users/");
    return { success: true, data: response.data };
  },

  getUser: async (id) => {
    const response = await apiClient.get(`/users/${id}`);
    return { success: true, data: response.data };
  },

  createUser: async (userData) => {
    // Note: You might need POST /api/auth/register instead
    const response = await apiClient.post("/auth/register", userData);
    return { success: true, data: response.data };
  },

  updateUser: async (id, userData) => {
    const response = await apiClient.put(`/users/${id}`, userData);
    return { success: true, data: response.data };
  },

  deleteUser: async (id) => {
    await apiClient.delete(`/users/${id}`);
    return { success: true };
  },

  // ✅ FIXED: Correct endpoint for roles
  getRoles: async () => {
    const response = await apiClient.get("/users/roles/");
    return { success: true, data: response.data };
  },

  createRole: async (roleData) => {
    const response = await apiClient.post("/users/roles", roleData);
    return { success: true, data: response.data };
  },

  assignRoleToUser: async (userId, roleId) => {
    const response = await apiClient.post(`/users/${userId}/roles/${roleId}`);
    return { success: true, data: response.data };
  },

  removeRoleFromUser: async (userId, roleId) => {
    await apiClient.delete(`/users/${userId}/roles/${roleId}`);
    return { success: true };
  },

  // ============================================
  // 🏪 SHOPS ENDPOINTS
  // ============================================

  getShops: async () => {
    const response = await apiClient.get("/shops/");
    return { success: true, data: response.data };
  },

  getShop: async (id) => {
    const response = await apiClient.get(`/shops/${id}`);
    return { success: true, data: response.data };
  },

  createShop: async (shopData) => {
    const response = await apiClient.post("/shops/", shopData);
    return { success: true, data: response.data };
  },

  updateShop: async (id, shopData) => {
    const response = await apiClient.put(`/shops/${id}`, shopData);
    return { success: true, data: response.data };
  },

  deleteShop: async (id) => {
    await apiClient.delete(`/shops/${id}`);
    return { success: true };
  },

  assignStaffToShop: async (userId, shopId) => {
    const response = await apiClient.post("/shops/staff", {
      user_id: userId,
      shop_id: shopId,
    });
    return { success: true, data: response.data };
  },

  removeStaffFromShop: async (userId, shopId) => {
    await apiClient.delete(`/shops/staff/${userId}/shop/${shopId}`);
    return { success: true };
  },

  // ============================================
  // 📦 PRODUCTS ENDPOINTS
  // ============================================

  getProducts: async () => {
    const response = await apiClient.get("/products/");
    return { success: true, data: response.data };
  },

  getProduct: async (id) => {
    const response = await apiClient.get(`/products/${id}`);
    return { success: true, data: response.data };
  },

  createProduct: async (productData) => {
    const response = await apiClient.post("/products/", productData);
    return { success: true, data: response.data };
  },

  updateProduct: async (id, productData) => {
    const response = await apiClient.put(`/products/${id}`, productData);
    return { success: true, data: response.data };
  },

  deleteProduct: async (id) => {
    await apiClient.delete(`/products/${id}`);
    return { success: true };
  },

  // Categories
  getCategories: async () => {
    const response = await apiClient.get("/products/categories");
    return { success: true, data: response.data };
  },

  getCategory: async (id) => {
    const response = await apiClient.get(`/products/categories/${id}`);
    return { success: true, data: response.data };
  },

  createCategory: async (categoryData) => {
    const response = await apiClient.post("/products/categories", categoryData);
    return { success: true, data: response.data };
  },

  updateCategory: async (id, categoryData) => {
    const response = await apiClient.put(
      `/products/categories/${id}`,
      categoryData
    );
    return { success: true, data: response.data };
  },

  // ============================================
  // 📊 INVENTORY ENDPOINTS
  // ============================================

  getInventory: async (shopId = null) => {
    const url = shopId ? `/inventory/shop/${shopId}` : "/inventory/";
    const response = await apiClient.get(url);
    return { success: true, data: response.data };
  },

  getShopInventory: async (shopId) => {
    const response = await apiClient.get(`/inventory/shop/${shopId}`);
    return { success: true, data: response.data };
  },

  getProductInventory: async (productId) => {
    const response = await apiClient.get(`/inventory/product/${productId}`);
    return { success: true, data: response.data };
  },

  createInventory: async (inventoryData) => {
    const response = await apiClient.post("/inventory/", inventoryData);
    return { success: true, data: response.data };
  },

  updateInventory: async (id, inventoryData) => {
    const response = await apiClient.put(`/inventory/${id}`, inventoryData);
    return { success: true, data: response.data };
  },

  adjustInventoryStock: async (id, quantity, reason) => {
    const response = await apiClient.post(`/inventory/${id}/adjust`, {
      quantity,
      reason,
    });
    return { success: true, data: response.data };
  },

  reserveInventoryStock: async (id, quantity) => {
    const response = await apiClient.post(
      `/inventory/${id}/reserve/${quantity}`
    );
    return { success: true, data: response.data };
  },

  releaseInventoryStock: async (id, quantity) => {
    const response = await apiClient.post(
      `/inventory/${id}/release/${quantity}`
    );
    return { success: true, data: response.data };
  },

  // ❌ REMOVED - Your backend doesn't have this endpoint
  // getLowStock: async () => {
  //   const response = await apiClient.get('/inventory/low-stock');
  //   return { success: true, data: response.data };
  // },

  // ============================================
  // 💰 SALES ENDPOINTS
  // ============================================

  getSales: async (params = {}) => {
    const response = await apiClient.get("/sales/", { params });
    return { success: true, data: response.data };
  },

  getSale: async (id) => {
    const response = await apiClient.get(`/sales/${id}`);
    return { success: true, data: response.data };
  },

  createSale: async (saleData) => {
    const response = await apiClient.post("/sales/", saleData);
    return { success: true, data: response.data };
  },

  cancelSale: async (id) => {
    const response = await apiClient.post(`/sales/${id}/cancel`);
    return { success: true, data: response.data };
  },

  // ❌ REMOVED - Your backend doesn't have this endpoint
  // getTodaySales: async () => {
  //   const response = await apiClient.get('/sales/today');
  //   return { success: true, data: response.data };
  // },

  // ============================================
  // ↩️ RETURNS ENDPOINTS
  // ============================================

  getReturns: async (status = null) => {
    const params = status ? { status } : {};
    const response = await apiClient.get("/sales/returns/", { params });
    return { success: true, data: response.data };
  },

  createReturn: async (returnData) => {
    const response = await apiClient.post("/sales/returns/", returnData);
    return { success: true, data: response.data };
  },

  processReturn: async (id, processData) => {
    const response = await apiClient.put(
      `/sales/returns/${id}/process`,
      processData
    );
    return { success: true, data: response.data };
  },

  // ============================================
  // 👤 CUSTOMERS ENDPOINTS
  // ============================================

  createCustomerProfile: async (profileData) => {
    const response = await apiClient.post("/customers/profiles", profileData);
    return { success: true, data: response.data };
  },

  getCustomerProfileByUser: async (userId) => {
    const response = await apiClient.get(`/customers/profiles/user/${userId}`);
    return { success: true, data: response.data };
  },

  getCustomerProfile: async (profileId) => {
    const response = await apiClient.get(`/customers/profiles/${profileId}`);
    return { success: true, data: response.data };
  },

  updateCustomerProfile: async (profileId, profileData) => {
    const response = await apiClient.put(
      `/customers/profiles/${profileId}`,
      profileData
    );
    return { success: true, data: response.data };
  },

  // Addresses
  createAddress: async (addressData) => {
    const response = await apiClient.post("/customers/addresses", addressData);
    return { success: true, data: response.data };
  },

  getUserAddresses: async (userId) => {
    const response = await apiClient.get(`/customers/addresses/user/${userId}`);
    return { success: true, data: response.data };
  },

  getAddress: async (addressId) => {
    const response = await apiClient.get(`/customers/addresses/${addressId}`);
    return { success: true, data: response.data };
  },

  updateAddress: async (addressId, addressData) => {
    const response = await apiClient.put(
      `/customers/addresses/${addressId}`,
      addressData
    );
    return { success: true, data: response.data };
  },

  deleteAddress: async (addressId) => {
    await apiClient.delete(`/customers/addresses/${addressId}`);
    return { success: true };
  },

  // ============================================
  // 📊 DASHBOARD/STATS (Custom implementations)
  // ============================================

  getDashboardStats: async () => {
    // Since you don't have a /dashboard/stats endpoint,
    // we'll fetch the needed data separately and combine it
    try {
      const [sales, products] = await Promise.all([
        apiClient.get("/sales/"),
        apiClient.get("/products/"),
      ]);

      return {
        success: true,
        data: {
          totalSales: sales.data.length,
          totalProducts: products.data.length,
          sales: sales.data,
          products: products.data,
        },
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
};
