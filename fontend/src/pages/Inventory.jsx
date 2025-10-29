// src/pages/Inventory.jsx - COMPLETE WITH AUTOCOMPLETE

import { useState, useEffect } from "react";
import { Layout } from "../components/layout/Layout";
import {
  ProductsHeader,
  ProductsFilters,
  ProductsTable,
  ProductModal,
} from "../components/products";
import { apiService } from "../services/api.service";
import { showSuccess, showError } from "../utils/toast";

export const Inventory = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [productsRes, categoriesRes, shopsRes] = await Promise.all([
        apiService.getProducts(),
        apiService.getCategories(),
        apiService.getShops(),
      ]);

      setProducts(productsRes.data);
      setCategories(categoriesRes.data);
      setShops(shopsRes.data);
    } catch (error) {
      console.error("Error loading data:", error);
      showError("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    setShowModal(true);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setShowModal(true);
  };

  // ✅ Switch from add to edit mode when product is selected from autocomplete
  const handleSwitchToEdit = (selectedProduct) => {
    setEditingProduct(selectedProduct);
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product?")) {
      return;
    }

    try {
      await apiService.deleteProduct(productId);
      showSuccess("Product deleted successfully!");
      loadData();
    } catch (error) {
      console.error("Error deleting product:", error);
      showError("Failed to delete product");
    }
  };

  const handleSaveProduct = async (productData) => {
    try {
      const generateSlug = (name) => {
        return name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "");
      };

      const apiData = {
        name: productData.name,
        sku: productData.sku,
        slug: generateSlug(productData.name),
        description: productData.description || null,
        category_id: parseInt(productData.categoryId),
        brand: productData.brand,
        model: productData.model || null,
        price: parseFloat(productData.price),
        discount_price: productData.discountPrice
          ? parseFloat(productData.discountPrice)
          : null,
        cost_price: parseFloat(productData.costPrice),
        specifications: productData.specifications || null,
        warranty_months: parseInt(productData.warrantyMonths) || 12,
        image_url: productData.imageUrl || null,
        is_active: productData.isActive,
      };

      if (productData.existingProductId) {
        // ✅ UPDATE PRODUCT
        await apiService.updateProduct(productData.existingProductId, apiData);

        // ✅ UPDATE INVENTORY FOR EACH SHOP
        if (productData.shopInventory) {
          const inventoryUpdates = Object.entries(
            productData.shopInventory
          ).map(async ([shopId, invData]) => {
            if (invData.inventoryId) {
              // Update existing inventory
              return apiService.updateInventory(invData.inventoryId, {
                quantity: invData.quantity,
              });
            } else if (invData.quantity > 0) {
              // Create new inventory for this shop
              return apiService.createInventory({
                product_id: productData.existingProductId,
                shop_id: parseInt(shopId),
                quantity: invData.quantity,
                min_stock_level: 10,
                max_stock_level: 1000,
              });
            }
          });
          await Promise.all(inventoryUpdates.filter(Boolean));
        }

        showSuccess("Product and inventory updated successfully!");
      } else {
        // ✅ CREATE NEW PRODUCT
        const response = await apiService.createProduct(apiData);

        // ✅ CREATE INVENTORY FOR ALL SHOPS WITH QUANTITY > 0
        if (productData.shopInventory) {
          const inventoryCreates = Object.entries(productData.shopInventory)
            .filter(([_, invData]) => invData.quantity > 0)
            .map(([shopId, invData]) =>
              apiService.createInventory({
                product_id: response.data.id,
                shop_id: parseInt(shopId),
                quantity: invData.quantity,
                min_stock_level: 10,
                max_stock_level: 1000,
              })
            );

          if (inventoryCreates.length > 0) {
            await Promise.all(inventoryCreates);
            const totalQty = Object.values(productData.shopInventory).reduce(
              (sum, inv) => sum + inv.quantity,
              0
            );
            showSuccess(
              `Product added with ${totalQty} units across ${inventoryCreates.length} shops!`
            );
          } else {
            showSuccess("Product added successfully!");
          }
        } else {
          showSuccess("Product added successfully!");
        }
      }

      setShowModal(false);
      setEditingProduct(null);
      loadData();
    } catch (error) {
      console.error("Error saving product:", error);

      const errorMessage = error.response?.data?.detail
        ? Array.isArray(error.response.data.detail)
          ? error.response.data.detail[0].msg
          : error.response.data.detail
        : "Failed to save product";

      showError(errorMessage);
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory
      ? product.category_id === parseInt(selectedCategory)
      : true;
    return matchesSearch && matchesCategory;
  });

  return (
    <Layout>
      <div className="p-6">
        <ProductsHeader onAddProduct={handleAddProduct} />

        <ProductsFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          categories={categories}
        />

        <ProductsTable
          products={filteredProducts}
          categories={categories}
          shops={shops}
          loading={loading}
          onEdit={handleEditProduct}
          onDelete={handleDeleteProduct}
        />

        {showModal && (
          <ProductModal
            product={editingProduct}
            categories={categories}
            shops={shops}
            allProducts={products}
            onClose={() => {
              setShowModal(false);
              setEditingProduct(null);
            }}
            onSave={handleSaveProduct}
            onSwitchToEdit={handleSwitchToEdit}
          />
        )}
      </div>
    </Layout>
  );
};
