// js/dashboard.js

$(document).ready(async function() {
    console.log('🚀 Dashboard initializing...');
    
    // Check auth
    if (!checkAuth()) {
        console.log('❌ Not authenticated');
        return;
    }

    // Get user
    const user = getCurrentUser();
    console.log('✅ User:', user);
    
    if (!user) {
        showError('Session expired. Please login again.');
        localStorage.clear();
        window.location.href = 'index.html';
        return;
    }
    
    try {
        // Load components
        console.log('📦 Loading components...');
        await loadComponents();
        
        // Wait for DOM
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // Build menu
        console.log('🔨 Building menu...');
        buildMenu(user);
        
        // Set user info
        console.log('👤 Setting user info...');
        setUserInfo(user);
        
        // Set page title
        if ($('#pageTitle').length) {
            $('#pageTitle').text('Dashboard');
        }
        
        // Load data
        console.log('📊 Loading data...');
        loadDashboardData();
        
    } catch (error) {
        console.error('❌ Error:', error);
        showError('Failed to load dashboard');
    }
});

// ========================================
// MENU BUILDER
// ========================================

function buildMenu(user) {
    console.log('🔨 Building menu for:', user.username);
    
    if (!user || !user.roles) {
        console.error('❌ Invalid user data');
        return;
    }
    
    const roles = user.roles.map(r => r.role.name);
    console.log('👤 Roles:', roles);
    
    const currentPath = window.location.pathname;
    const inPages = currentPath.includes('/pages/');
    const base = inPages ? '' : 'pages/';
    const dash = inPages ? '../dashboard.html' : 'dashboard.html';
    
    let menu = `
        <a href="${dash}" class="menu-item ${currentPath.includes('dashboard') ? 'active' : ''}">
            <i class="fas fa-home w-6 mr-3"></i>
            <span>Dashboard</span>
        </a>
    `;
    
    const isStaff = roles.includes('staff');
    const isManager = roles.includes('manager');
    const isAdmin = roles.includes('admin');
    const isSuperAdmin = roles.includes('superadmin');
    
    // Staff only
    if (isStaff && !isManager && !isAdmin && !isSuperAdmin) {
        menu += `
            <div class="mt-4">
                <p class="menu-section-title">Sales</p>
                <a href="${base}pos.html" class="menu-item">
                    <i class="fas fa-cash-register w-6 mr-3"></i>
                    <span>Point of Sale</span>
                </a>
                <a href="${base}sales.html" class="menu-item">
                    <i class="fas fa-receipt w-6 mr-3"></i>
                    <span>Sales</span>
                </a>
                <a href="${base}returns.html" class="menu-item">
                    <i class="fas fa-undo w-6 mr-3"></i>
                    <span>Returns</span>
                </a>
            </div>
        `;
    }
    
    // Manager or higher
    if (isManager || isAdmin || isSuperAdmin) {
        menu += `
            <div class="mt-4">
                <p class="menu-section-title">Inventory</p>
                <a href="${base}products.html" class="menu-item">
                    <i class="fas fa-box w-6 mr-3"></i>
                    <span>Products</span>
                </a>
                <a href="${base}inventory.html" class="menu-item">
                    <i class="fas fa-warehouse w-6 mr-3"></i>
                    <span>Inventory</span>
                </a>
            </div>
            <div class="mt-4">
                <p class="menu-section-title">Sales</p>
                <a href="${base}pos.html" class="menu-item">
                    <i class="fas fa-cash-register w-6 mr-3"></i>
                    <span>Point of Sale</span>
                </a>
                <a href="${base}sales.html" class="menu-item">
                    <i class="fas fa-receipt w-6 mr-3"></i>
                    <span>Sales</span>
                </a>
                <a href="${base}returns.html" class="menu-item">
                    <i class="fas fa-undo w-6 mr-3"></i>
                    <span>Returns</span>
                </a>
            </div>
        `;
    }
    
    // Admin or higher
    if (isAdmin || isSuperAdmin) {
        menu += `
            <div class="mt-4">
                <p class="menu-section-title">Management</p>
                <a href="${base}shops.html" class="menu-item">
                    <i class="fas fa-building w-6 mr-3"></i>
                    <span>Shops</span>
                </a>
            </div>
        `;
    }
    
    // SuperAdmin only
    if (isSuperAdmin) {
        menu += `
            <div class="mt-4">
                <p class="menu-section-title">System</p>
                <a href="${base}users.html" class="menu-item">
                    <i class="fas fa-users w-6 mr-3"></i>
                    <span>Users</span>
                </a>
            </div>
        `;
    }
    
    $('#navigationMenu').html(menu);
    console.log('✅ Menu built');
}

// ========================================
// USER INFO SETTER
// ========================================

function setUserInfo(user) {
    const initial = user.username.charAt(0).toUpperCase();
    const role = user.roles[0]?.role?.name || 'user';
    const roleName = role.charAt(0).toUpperCase() + role.slice(1);
    
    $('#userGreeting').text(`Welcome, ${user.username}`);
    $('#userInitial').text(initial);
    $('#userAvatar').text(initial);
    $('#sidebarUsername').text(user.username);
    $('#sidebarRole').text(roleName);
    $('#userRoleDisplay').text(roleName);
    
    console.log('✅ User info set');
}

// ========================================
// DATA LOADING
// ========================================

async function loadDashboardData() {
    try {
        await Promise.all([
            loadTodaySales(),
            loadProducts(),
            loadLowStock(),
            loadPendingReturns()
        ]);
        
        await loadRecentSales();
        await loadLowStockList();
        
        console.log('✅ All data loaded');
    } catch (error) {
        console.error('❌ Data error:', error);
    }
}

async function loadTodaySales() {
    try {
        const today = new Date().toISOString().split('T')[0];
        const sales = await api.getSales({ start_date: today + 'T00:00:00' });
        
        const total = sales.reduce((sum, sale) => {
            if (sale.status === 'completed') {
                return sum + parseFloat(sale.total_amount);
            }
            return sum;
        }, 0);
        
        $('#todaySales').text(formatCurrency(total));
    } catch (error) {
        console.error('Failed to load today sales:', error);
        $('#todaySales').text('₹0');
    }
}

async function loadProducts() {
    try {
        const products = await api.getProducts();
        $('#totalProducts').text(products.length);
    } catch (error) {
        console.error('Failed to load products:', error);
        $('#totalProducts').text('0');
    }
}

async function loadLowStock() {
    try {
        const shops = await api.getShops();
        let lowStockCount = 0;
        
        for (const shop of shops) {
            try {
                const inventory = await api.getShopInventory(shop.id, true);
                lowStockCount += inventory.length;
            } catch (error) {
                console.warn(`Failed inventory for shop ${shop.id}`);
            }
        }
        
        $('#lowStock').text(lowStockCount);
    } catch (error) {
        console.error('Failed to load low stock:', error);
        $('#lowStock').text('0');
    }
}

async function loadPendingReturns() {
    try {
        const returns = await api.getReturns('pending');
        $('#pendingReturns').text(returns.length);
    } catch (error) {
        console.error('Failed to load returns:', error);
        $('#pendingReturns').text('0');
    }
}

async function loadRecentSales() {
    try {
        const sales = await api.getSales({ limit: 5 });
        
        if (sales.length === 0) {
            $('#recentSalesTable').html(`
                <tr>
                    <td colspan="5" class="px-6 py-8 text-center text-gray-500">
                        <i class="fas fa-receipt text-4xl mb-3 block"></i>
                        <p class="font-semibold">No sales yet</p>
                        <p class="text-sm">Go to POS to make your first sale!</p>
                    </td>
                </tr>
            `);
            return;
        }

        const shops = await api.getShops();
        const shopMap = {};
        shops.forEach(shop => shopMap[shop.id] = shop.name);

        let html = '';
        sales.forEach(sale => {
            html += `
                <tr class="hover:bg-gray-50 transition">
                    <td class="px-6 py-4 font-semibold text-sm">${sale.invoice_number}</td>
                    <td class="px-6 py-4 text-sm text-gray-600">${formatDateOnly(sale.sale_date)}</td>
                    <td class="px-6 py-4 text-sm">${shopMap[sale.shop_id] || 'N/A'}</td>
                    <td class="px-6 py-4 text-right font-bold text-green-600">${formatCurrency(sale.total_amount)}</td>
                    <td class="px-6 py-4 text-center">
                        <span class="px-3 py-1 text-xs rounded-full ${getStatusBadge(sale.status)}">
                            ${sale.status.toUpperCase()}
                        </span>
                    </td>
                </tr>
            `;
        });
        
        $('#recentSalesTable').html(html);
    } catch (error) {
        console.error('Failed to load recent sales:', error);
        $('#recentSalesTable').html(`
            <tr><td colspan="5" class="px-6 py-8 text-center text-red-500">Error loading sales</td></tr>
        `);
    }
}

async function loadLowStockList() {
    try {
        const shops = await api.getShops();
        let html = '';
        let total = 0;
        
        for (const shop of shops) {
            try {
                const inventory = await api.getShopInventory(shop.id, true);
                
                inventory.forEach(item => {
                    total++;
                    const percent = ((item.quantity / item.min_stock_level) * 100).toFixed(0);
                    
                    html += `
                        <div class="flex items-center justify-between p-4 mb-2 bg-red-50 border-l-4 border-red-500 rounded-lg hover:shadow-md transition">
                            <div class="flex items-center space-x-3 flex-1">
                                <div class="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                                    <i class="fas fa-exclamation-triangle text-red-600"></i>
                                </div>
                                <div class="flex-1 min-w-0">
                                    <p class="font-semibold text-gray-900 truncate">${item.product?.name || 'Unknown'}</p>
                                    <p class="text-sm text-gray-600">${shop.name}</p>
                                    <div class="mt-1 w-full bg-gray-200 rounded-full h-1.5">
                                        <div class="bg-red-600 h-1.5 rounded-full" style="width: ${Math.min(percent, 100)}%"></div>
                                    </div>
                                </div>
                            </div>
                            <div class="ml-4 text-right flex-shrink-0">
                                <span class="text-2xl font-bold text-red-600">${item.quantity}</span>
                                <p class="text-xs text-gray-500">/ ${item.min_stock_level}</p>
                            </div>
                        </div>
                    `;
                });
            } catch (error) {
                console.warn(`Failed inventory for shop ${shop.id}`);
            }
        }
        
        if (total === 0) {
            html = `
                <div class="text-center py-12">
                    <i class="fas fa-check-circle text-5xl text-green-500 mb-3"></i>
                    <p class="text-lg font-semibold text-gray-700">All Good!</p>
                    <p class="text-sm text-gray-500">No low stock items</p>
                </div>
            `;
        }
        
        $('#lowStockList').html(html);
    } catch (error) {
        console.error('Failed to load low stock list:', error);
        $('#lowStockList').html(`
            <div class="text-center py-12 text-red-500">
                <i class="fas fa-times-circle text-4xl mb-3"></i>
                <p>Error loading data</p>
            </div>
        `);
    }
}
