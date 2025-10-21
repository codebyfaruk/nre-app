// js/api.js

class API {
    constructor() {
        this.baseURL = CONFIG.API_BASE_URL;
        this.token = localStorage.getItem(CONFIG.TOKEN_KEY);
    }

    getHeaders() {
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.token}`
        };
    }

    async request(endpoint, options = {}) {
        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                ...options,
                headers: this.getHeaders()
            });

            if (response.status === 401) {
                localStorage.clear();
                window.location.href = '../index.html';
                throw new Error('Unauthorized');
            }

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || 'Request failed');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // Shops
    async getShops() {
        return this.request('/shops/');
    }

    async getShop(id) {
        return this.request(`/shops/${id}`);
    }

    async createShop(data) {
        return this.request('/shops/', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async updateShop(id, data) {
        return this.request(`/shops/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    async deleteShop(id) {
        return this.request(`/shops/${id}`, {
            method: 'DELETE'
        });
    }

    // Products
    async getProducts(params = {}) {
        const query = new URLSearchParams(params).toString();
        return this.request(`/products/${query ? '?' + query : ''}`);
    }

    async getProduct(id) {
        return this.request(`/products/${id}`);
    }

    async createProduct(data) {
        return this.request('/products/', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async updateProduct(id, data) {
        return this.request(`/products/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    async deleteProduct(id) {
        return this.request(`/products/${id}`, {
            method: 'DELETE'
        });
    }

    // Categories
    async getCategories() {
        return this.request('/products/categories');
    }

    async createCategory(data) {
        return this.request('/products/categories', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    // Inventory
    async getShopInventory(shopId, lowStockOnly = false) {
        return this.request(`/inventory/shop/${shopId}?low_stock_only=${lowStockOnly}`);
    }

    async adjustStock(inventoryId, adjustment, reason) {
        return this.request(`/inventory/${inventoryId}/adjust`, {
            method: 'POST',
            body: JSON.stringify({ adjustment, reason })
        });
    }

    // Sales
    async getSales(params = {}) {
        const query = new URLSearchParams(params).toString();
        return this.request(`/sales/${query ? '?' + query : ''}`);
    }

    async createSale(data) {
        return this.request('/sales/', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async getSale(id) {
        return this.request(`/sales/${id}`);
    }

    async cancelSale(id, reason) {
        return this.request(`/sales/${id}/cancel?reason=${encodeURIComponent(reason)}`, {
            method: 'POST'
        });
    }

    // Returns
    async getReturns(status = null) {
        const query = status ? `?status=${status}` : '';
        return this.request(`/sales/returns/${query}`);
    }

    async createReturn(data) {
        return this.request('/sales/returns/', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async processReturn(id, status) {
        return this.request(`/sales/returns/${id}/process`, {
            method: 'PUT',
            body: JSON.stringify({ status })
        });
    }

    // Users
    async getUsers() {
        return this.request('/users/');
    }

    async createUser(data) {
        return this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }
}

const api = new API();
