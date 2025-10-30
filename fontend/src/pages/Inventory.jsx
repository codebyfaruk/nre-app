// src/pages/Inventory.jsx - SIMPLIFIED & FIXED

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
  const [allProducts, setAllProducts] = useState([]);
  const [displayProducts, setDisplayProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // ✅ Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    loadData();
  }, []);

  // ✅ Filter and paginate
  useEffect(() => {
    const filtered = allProducts.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory = selectedCategory
        ? p.category_id === parseInt(selectedCategory)
        : true;

      return matchesSearch && matchesCategory;
    });

    const start = (currentPage - 1) * itemsPerPage;
    setDisplayProducts(filtered.slice(start, start + itemsPerPage));
  }, [allProducts, searchTerm, selectedCategory, currentPage]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [productsRes, categoriesRes, shopsRes] = await Promise.all([
        apiService.getProducts(),
        apiService.getCategories(),
        apiService.getShops(),
      ]);

      setAllProducts(productsRes.data || []);
      setCategories(categoriesRes.data || []);
      setShops(shopsRes.data || []);
    } catch (error) {
      console.error("Error loading:", error);
      showError("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const filteredCount = allProducts.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory
      ? p.category_id === parseInt(selectedCategory)
      : true;

    return matchesSearch && matchesCategory;
  }).length;

  const totalPages = Math.ceil(filteredCount / itemsPerPage) || 1;

  const handleOpenModal = (product = null) => {
    setEditingProduct(product);
    setShowModal(true);
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Delete this product?")) return;

    try {
      await apiService.deleteProduct(id);
      showSuccess("✅ Product deleted!");
      setCurrentPage(1);
      loadData();
    } catch (error) {
      console.error("Error:", error);
      showError("Failed to delete");
    }
  };

  const handleSaveProduct = async (data) => {
    try {
      const payload = {
        name: data.name,
        sku: data.sku,
        slug: data.name.toLowerCase().replace(/\s+/g, "-"),
        category_id: parseInt(data.categoryId),
        brand: data.brand,
        model: data.model || null,
        price: parseFloat(data.price),
        discount_price: data.discountPrice
          ? parseFloat(data.discountPrice)
          : null,
        cost_price: parseFloat(data.costPrice),
        description: data.description || null,
        image_url: data.imageUrl || null,
        is_active: data.isActive,
      };

      if (data.existingProductId) {
        await apiService.updateProduct(data.existingProductId, payload);
        showSuccess("✅ Updated!");
      } else {
        await apiService.createProduct(payload);
        showSuccess("✅ Created!");
      }

      setShowModal(false);
      setEditingProduct(null);
      setCurrentPage(1);
      loadData();
    } catch (error) {
      console.error("Error:", error);
      showError("Failed to save product");
    }
  };

  return (
    <Layout>
      <ProductsHeader />

      <ProductsFilters
        searchTerm={searchTerm}
        onSearchChange={(v) => {
          setSearchTerm(v);
          setCurrentPage(1);
        }}
        selectedCategory={selectedCategory}
        onCategoryChange={(v) => {
          setSelectedCategory(v);
          setCurrentPage(1);
        }}
        categories={categories}
        onAddClick={() => handleOpenModal()}
      />

      <ProductsTable
        products={displayProducts}
        categories={categories}
        shops={shops}
        loading={loading}
        onEdit={handleOpenModal}
        onDelete={handleDeleteProduct}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        totalResults={filteredCount}
        itemsPerPage={itemsPerPage}
      />

      {showModal && (
        <ProductModal
          product={editingProduct}
          categories={categories}
          shops={shops}
          onClose={() => {
            setShowModal(false);
            setEditingProduct(null);
          }}
          onSave={handleSaveProduct}
        />
      )}
    </Layout>
  );
};
