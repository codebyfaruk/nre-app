// js/products.js

let allProducts = [];
let categories = [];

$(document).ready(function() {
    if (!checkAuth()) return;

    loadCategories();
    loadProducts();

    // Hide add button for staff
    if (!isManager()) {
        $('#addProductBtn').hide();
    }

    $('#productForm').on('submit', handleProductSubmit);
    $('#searchProduct').on('input', filterProducts);
    $('#filterCategory, #filterStatus').on('change', filterProducts);

    // Initialize Select2
    $('.select2').select2();
});

async function loadCategories() {
    try {
        categories = await api.getCategories();
        
        let options = '<option value="">Select Category</option>';
        categories.forEach(cat => {
            options += `<option value="${cat.id}">${cat.name}</option>`;
        });
        
        $('#productCategory, #filterCategory').html(options);
    } catch (error) {
        console.error('Failed to load categories');
    }
}

async function loadProducts() {
    try {
        allProducts = await api.getProducts();
        displayProducts(allProducts);
    } catch (error) {
        $('#productsGrid').html('<div class="text-center py-8 text-red-500 col-span-full">Failed to load products</div>');
    }
}

function displayProducts(products) {
    if (products.length === 0) {
        $('#productsGrid').html('<div class="text-center py-8 text-gray-500 col-span-full">No products found</div>');
        return;
    }

    let html = '';
    products.forEach(product => {
        const category = categories.find(c => c.id === product.category_id);
        const displayPrice = product.discount_price || product.price;
        
        html += `
            <div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
                <div class="h-48 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                    <i class="fas fa-box text-6xl text-blue-300"></i>
                </div>
                <div class="p-4">
                    <div class="flex items-start justify-between mb-2">
                        <h3 class="font-bold text-lg">${product.name}</h3>
                        <span class="px-2 py-1 rounded text-xs ${product.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                            ${product.is_active ? 'Active' : 'Inactive'}
                        </span>
                    </div>
                    <p class="text-sm text-gray-600 mb-2">${product.brand || ''} ${product.model || ''}</p>
                    <p class="text-xs text-gray-500 mb-2">SKU: ${product.sku}</p>
                    <p class="text-xs text-gray-500 mb-3">${category ? category.name : 'Uncategorized'}</p>
                    
                    <div class="flex items-center justify-between mb-3">
                        <div>
                            ${product.discount_price ? `
                                <span class="text-lg font-bold text-green-600">${formatCurrency(product.discount_price)}</span>
                                <span class="text-sm text-gray-400 line-through ml-2">${formatCurrency(product.price)}</span>
                            ` : `
                                <span class="text-lg font-bold text-blue-600">${formatCurrency(product.price)}</span>
                            `}
                        </div>
                    </div>
                    
                    ${isManager() ? `
                        <div class="flex space-x-2">
                            <button onclick="editProduct(${product.id})" class="flex-1 bg-blue-500 text-white py-2 rounded hover:bg-blue-600">
                                <i class="fas fa-edit mr-1"></i>Edit
                            </button>
                            <button onclick="deleteProduct(${product.id})" class="flex-1 bg-red-500 text-white py-2 rounded hover:bg-red-600">
                                <i class="fas fa-trash mr-1"></i>Delete
                            </button>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    });

    $('#productsGrid').html(html);
}

function filterProducts() {
    const search = $('#searchProduct').val().toLowerCase();
    const categoryFilter = $('#filterCategory').val();
    const statusFilter = $('#filterStatus').val();

    let filtered = allProducts.filter(product => {
        const matchSearch = !search || 
            product.name.toLowerCase().includes(search) ||
            product.sku.toLowerCase().includes(search) ||
            (product.brand && product.brand.toLowerCase().includes(search));
        
        const matchCategory = !categoryFilter || product.category_id == categoryFilter;
        const matchStatus = !statusFilter || product.is_active.toString() === statusFilter;

        return matchSearch && matchCategory && matchStatus;
    });

    displayProducts(filtered);
}

function showAddProductModal() {
    $('#productModalTitle').text('Add Product');
    $('#productId').val('');
    $('#productForm')[0].reset();
    $('#productModal').removeClass('hidden');
}

function closeProductModal() {
    $('#productModal').addClass('hidden');
}

async function editProduct(id) {
    try {
        const product = await api.getProduct(id);
        
        $('#productModalTitle').text('Edit Product');
        $('#productId').val(product.id);
        $('#productName').val(product.name);
        $('#productSku').val(product.sku);
        $('#productDescription').val(product.description);
        $('#productCategory').val(product.category_id);
        $('#productBrand').val(product.brand);
        $('#productModel').val(product.model);
        $('#productPrice').val(product.price);
        $('#productDiscountPrice').val(product.discount_price);
        $('#productCostPrice').val(product.cost_price);
        $('#productWarranty').val(product.warranty_months);
        
        $('#productModal').removeClass('hidden');
    } catch (error) {
        showError('Failed to load product details');
    }
}

async function handleProductSubmit(e) {
    e.preventDefault();
    
    const productId = $('#productId').val();
    const name = $('#productName').val();
    
    const data = {
        name: name,
        slug: name.toLowerCase().replace(/\s+/g, '-'),
        sku: $('#productSku').val(),
        description: $('#productDescription').val(),
        category_id: parseInt($('#productCategory').val()) || null,
        brand: $('#productBrand').val(),
        model: $('#productModel').val(),
        price: $('#productPrice').val(),
        discount_price: $('#productDiscountPrice').val() || null,
        cost_price: $('#productCostPrice').val() || null,
        warranty_months: parseInt($('#productWarranty').val()) || 0,
        is_active: true
    };

    try {
        showLoading();
        
        if (productId) {
            await api.updateProduct(productId, data);
            showSuccess('Product updated successfully');
        } else {
            await api.createProduct(data);
            showSuccess('Product created successfully');
        }
        
        closeProductModal();
        loadProducts();
    } catch (error) {
        showError(error.message || 'Failed to save product');
    }
}

async function deleteProduct(id) {
    const result = await Swal.fire({
        title: 'Delete Product?',
        text: 'This action cannot be undone!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc2626',
        confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
        try {
            showLoading();
            await api.deleteProduct(id);
            showSuccess('Product deleted successfully');
            loadProducts();
        } catch (error) {
            showError('Failed to delete product');
        }
    }
}
