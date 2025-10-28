// src/pages/Inventory.jsx - RENAMED FROM PRODUCTS
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
      const [productsRes, categoriesRes] = await Promise.all([
        apiService.getProducts(),
        apiService.getCategories(),
      ]);
      setProducts(productsRes.data);
      setCategories(categoriesRes.data);
    } catch (error) {
      console.error("Error loading data:", error);
      showError("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      !selectedCategory || product.categoryId === parseInt(selectedCategory);
    return matchesSearch && matchesCategory;
  });

  const handleAddProduct = () => {
    setEditingProduct(null);
    setShowModal(true);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setShowModal(true);
  };

  const handleDeleteProduct = async (product) => {
    if (window.confirm(`Delete ${product.name}?`)) {
      try {
        await apiService.deleteProduct(product.id);
        showSuccess("Product deleted successfully!");
        loadData();
      } catch (error) {
        console.error("Error deleting product:", error);
        showError("Failed to delete product");
      }
    }
  };

  const handleSaveProduct = async (productData) => {
    try {
      if (editingProduct) {
        await apiService.updateProduct(editingProduct.id, productData);
        showSuccess("Product updated successfully!");
      } else {
        await apiService.createProduct(productData);
        showSuccess("Product added successfully!");
      }
      setShowModal(false);
      loadData();
    } catch (error) {
      console.error("Error saving product:", error);
      showError("Failed to save product");
    }
  };

  return (
    <Layout title="Inventory Management">
      {" "}
      {/* ✅ Changed title */}
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
        onEdit={handleEditProduct}
        onDelete={handleDeleteProduct}
        loading={loading}
      />
      {showModal && (
        <ProductModal
          product={editingProduct}
          categories={categories}
          onClose={() => setShowModal(false)}
          onSave={handleSaveProduct}
        />
      )}
    </Layout>
  );
};
