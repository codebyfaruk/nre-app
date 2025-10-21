// components/layout.js

// Build role-based menu
function buildRoleBasedMenu(roles) {
    let menuHTML = `
        <a href="dashboard.html" class="menu-item ${window.location.pathname.includes('dashboard') ? 'active' : ''}">
            <i class="fas fa-home w-6 mr-3"></i>
            <span class="font-semibold">Dashboard</span>
        </a>
    `;
    
    const isStaff = roles.includes('staff');
    const isManager = roles.includes('manager');
    const isAdmin = roles.includes('admin');
    const isSuperAdmin = roles.includes('superadmin');
    
    // Staff: Only POS, Sales, Returns
    if (isStaff && !isManager && !isAdmin && !isSuperAdmin) {
        menuHTML += `
            <div class="menu-section">
                <p class="menu-section-title">Sales</p>
                <a href="pages/pos.html" class="menu-item">
                    <i class="fas fa-cash-register w-6 mr-3"></i>
                    <span>Point of Sale</span>
                </a>
                <a href="pages/sales.html" class="menu-item">
                    <i class="fas fa-receipt w-6 mr-3"></i>
                    <span>Sales</span>
                </a>
                <a href="pages/returns.html" class="menu-item">
                    <i class="fas fa-undo w-6 mr-3"></i>
                    <span>Returns</span>
                </a>
            </div>
        `;
    }
    
    // Manager: Products, Inventory, POS, Sales, Returns
    if (isManager && !isAdmin && !isSuperAdmin) {
        menuHTML += `
            <div class="menu-section">
                <p class="menu-section-title">Inventory</p>
                <a href="pages/products.html" class="menu-item">
                    <i class="fas fa-box w-6 mr-3"></i>
                    <span>Products</span>
                </a>
                <a href="pages/categories.html" class="menu-item">
                    <i class="fas fa-tags w-6 mr-3"></i>
                    <span>Categories</span>
                </a>
                <a href="pages/inventory.html" class="menu-item">
                    <i class="fas fa-warehouse w-6 mr-3"></i>
                    <span>Inventory</span>
                </a>
            </div>
            <div class="menu-section">
                <p class="menu-section-title">Sales</p>
                <a href="pages/pos.html" class="menu-item">
                    <i class="fas fa-cash-register w-6 mr-3"></i>
                    <span>Point of Sale</span>
                </a>
                <a href="pages/sales.html" class="menu-item">
                    <i class="fas fa-receipt w-6 mr-3"></i>
                    <span>Sales History</span>
                </a>
                <a href="pages/returns.html" class="menu-item">
                    <i class="fas fa-undo w-6 mr-3"></i>
                    <span>Returns</span>
                </a>
            </div>
        `;
    }
    
    // Admin: Everything except User Management
    if (isAdmin && !isSuperAdmin) {
        menuHTML += `
            <div class="menu-section">
                <p class="menu-section-title">Management</p>
                <a href="pages/shops.html" class="menu-item">
                    <i class="fas fa-building w-6 mr-3"></i>
                    <span>Shops</span>
                </a>
                <a href="pages/products.html" class="menu-item">
                    <i class="fas fa-box w-6 mr-3"></i>
                    <span>Products</span>
                </a>
                <a href="pages/categories.html" class="menu-item">
                    <i class="fas fa-tags w-6 mr-3"></i>
                    <span>Categories</span>
                </a>
                <a href="pages/inventory.html" class="menu-item">
                    <i class="fas fa-warehouse w-6 mr-3"></i>
                    <span>Inventory</span>
                </a>
            </div>
            <div class="menu-section">
                <p class="menu-section-title">Sales</p>
                <a href="pages/pos.html" class="menu-item">
                    <i class="fas fa-cash-register w-6 mr-3"></i>
                    <span>Point of Sale</span>
                </a>
                <a href="pages/sales.html" class="menu-item">
                    <i class="fas fa-receipt w-6 mr-3"></i>
                    <span>Sales History</span>
                </a>
                <a href="pages/returns.html" class="menu-item">
                    <i class="fas fa-undo w-6 mr-3"></i>
                    <span>Returns</span>
                </a>
            </div>
        `;
    }
    
    // SuperAdmin: Everything
    if (isSuperAdmin) {
        menuHTML += `
            <div class="menu-section">
                <p class="menu-section-title">System</p>
                <a href="pages/users.html" class="menu-item">
                    <i class="fas fa-users w-6 mr-3"></i>
                    <span>Users</span>
                </a>
                <a href="pages/shops.html" class="menu-item">
                    <i class="fas fa-building w-6 mr-3"></i>
                    <span>Shops</span>
                </a>
            </div>
            <div class="menu-section">
                <p class="menu-section-title">Products</p>
                <a href="pages/products.html" class="menu-item">
                    <i class="fas fa-box w-6 mr-3"></i>
                    <span>Products</span>
                </a>
                <a href="pages/categories.html" class="menu-item">
                    <i class="fas fa-tags w-6 mr-3"></i>
                    <span>Categories</span>
                </a>
                <a href="pages/inventory.html" class="menu-item">
                    <i class="fas fa-warehouse w-6 mr-3"></i>
                    <span>Inventory</span>
                </a>
            </div>
            <div class="menu-section">
                <p class="menu-section-title">Sales</p>
                <a href="pages/pos.html" class="menu-item">
                    <i class="fas fa-cash-register w-6 mr-3"></i>
                    <span>Point of Sale</span>
                </a>
                <a href="pages/sales.html" class="menu-item">
                    <i class="fas fa-receipt w-6 mr-3"></i>
                    <span>Sales History</span>
                </a>
                <a href="pages/returns.html" class="menu-item">
                    <i class="fas fa-undo w-6 mr-3"></i>
                    <span>Returns</span>
                </a>
            </div>
        `;
    }
    
    $('#navigationMenu').html(menuHTML);
    
    // Highlight active menu item
    highlightActiveMenu();
}

// Highlight active menu based on current page
function highlightActiveMenu() {
    const currentPath = window.location.pathname;
    $('.menu-item').removeClass('active');
    
    $('.menu-item').each(function() {
        const href = $(this).attr('href');
        if (currentPath.includes(href) || (href === 'dashboard.html' && currentPath.endsWith('dashboard.html'))) {
            $(this).addClass('active');
        }
    });
}

// Initialize layout
function initializeLayout(user) {
    if (!user) return;
    
    // Set user info
    const initial = user.username.charAt(0).toUpperCase();
    $('#userGreeting').text(`Welcome, ${user.username}`);
    $('#userInitial').text(initial);
    $('#userAvatar').text(initial);
    $('#sidebarUsername').text(user.username);
    
    // Set role display
    const userRoles = user.roles.map(r => r.role.name);
    const primaryRole = getPrimaryRole(userRoles);
    $('#sidebarRole').text(capitalizeFirst(primaryRole));
    $('#userRoleDisplay').text(capitalizeFirst(primaryRole));
    
    // Build menu
    buildRoleBasedMenu(userRoles);
}

function getPrimaryRole(roles) {
    if (roles.includes('superadmin')) return 'superadmin';
    if (roles.includes('admin')) return 'admin';
    if (roles.includes('manager')) return 'manager';
    if (roles.includes('staff')) return 'staff';
    return 'user';
}

function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
