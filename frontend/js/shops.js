// js/shops.js

$(document).ready(function() {
    if (!checkAuth()) return;
    if (!isAdmin()) {
        showError('Access denied. Admin only.');
        window.location.href = '../dashboard.html';
        return;
    }

    loadShops();

    $('#shopForm').on('submit', handleShopSubmit);
});

async function loadShops() {
    try {
        const shops = await api.getShops();
        
        if (shops.length === 0) {
            $('#shopsTable').html('<tr><td colspan="6" class="text-center py-4 text-gray-500">No shops found</td></tr>');
            return;
        }

        let html = '';
        shops.forEach(shop => {
            html += `
                <tr class="border-b hover:bg-gray-50">
                    <td class="py-3 px-4 font-semibold">${shop.name}</td>
                    <td class="py-3 px-4">${shop.city}</td>
                    <td class="py-3 px-4">${shop.phone}</td>
                    <td class="py-3 px-4">${shop.email}</td>
                    <td class="py-3 px-4">
                        <span class="px-3 py-1 rounded-full text-xs ${shop.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                            ${shop.is_active ? 'Active' : 'Inactive'}
                        </span>
                    </td>
                    <td class="py-3 px-4">
                        <button onclick="editShop(${shop.id})" class="text-blue-600 hover:text-blue-800 mr-3">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="deleteShop(${shop.id})" class="text-red-600 hover:text-red-800">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        });

        $('#shopsTable').html(html);
    } catch (error) {
        showError('Failed to load shops');
    }
}

function showAddShopModal() {
    $('#modalTitle').text('Add Shop');
    $('#shopId').val('');
    $('#shopForm')[0].reset();
    $('#shopCountry').val('India');
    $('#shopModal').removeClass('hidden');
}

function closeShopModal() {
    $('#shopModal').addClass('hidden');
}

async function editShop(id) {
    try {
        const shop = await api.getShop(id);
        
        $('#modalTitle').text('Edit Shop');
        $('#shopId').val(shop.id);
        $('#shopName').val(shop.name);
        $('#shopPhone').val(shop.phone);
        $('#shopEmail').val(shop.email);
        $('#shopAddress').val(shop.address);
        $('#shopCity').val(shop.city);
        $('#shopState').val(shop.state);
        $('#shopCountry').val(shop.country);
        
        $('#shopModal').removeClass('hidden');
    } catch (error) {
        showError('Failed to load shop details');
    }
}

async function handleShopSubmit(e) {
    e.preventDefault();
    
    const shopId = $('#shopId').val();
    const data = {
        name: $('#shopName').val(),
        phone: $('#shopPhone').val(),
        email: $('#shopEmail').val(),
        address: $('#shopAddress').val(),
        city: $('#shopCity').val(),
        state: $('#shopState').val(),
        country: $('#shopCountry').val(),
        is_active: true
    };

    try {
        showLoading();
        
        if (shopId) {
            await api.updateShop(shopId, data);
            showSuccess('Shop updated successfully');
        } else {
            await api.createShop(data);
            showSuccess('Shop created successfully');
        }
        
        closeShopModal();
        loadShops();
    } catch (error) {
        showError(error.message || 'Failed to save shop');
    }
}

async function deleteShop(id) {
    const result = await Swal.fire({
        title: 'Delete Shop?',
        text: 'This action cannot be undone!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc2626',
        confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
        try {
            showLoading();
            await api.deleteShop(id);
            showSuccess('Shop deleted successfully');
            loadShops();
        } catch (error) {
            showError('Failed to delete shop');
        }
    }
}
