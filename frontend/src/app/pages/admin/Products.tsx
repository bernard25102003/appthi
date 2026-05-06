import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, X } from "lucide-react";
import api from "../../../lib/api/client";
import { API } from "../../../lib/api/endpoints";
import type { ApiProduct, ApiCategory, PaginatedResponse } from "../../../lib/api/types";

export function AdminProducts() {
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    categoryId: "",
    imageUrl: "",
    featured: false,
  });

  const fetchProducts = async () => {
    try {
      const res = await api.get<PaginatedResponse<ApiProduct>>(
        `${API.ADMIN.PRODUCTS}?limit=100`
      );
      setProducts(res.data ?? []);
    } catch {
      // silently fail
    }
  };

  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      fetchProducts(),
      api
        .get<{ categories: ApiCategory[] }>(API.CATEGORIES.LIST)
        .then((res) => setCategories(res?.categories ?? []))
        .catch(() => {}),
    ]).finally(() => setIsLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsSaving(true);
    try {
      if (editingProduct !== null) {
        await api.patch(API.ADMIN.PRODUCT(editingProduct), {
          name: formData.name,
          description: formData.description,
          price: formData.price,
          categoryId: formData.categoryId,
          imageUrl: formData.imageUrl || undefined,
          featured: formData.featured,
        });
      } else {
        await api.post(API.ADMIN.PRODUCT_CREATE, {
          name: formData.name,
          description: formData.description,
          price: formData.price,
          categoryId: formData.categoryId,
          imageUrl: formData.imageUrl || undefined,
          featured: formData.featured,
        });
      }
      await fetchProducts();
      resetForm();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Lỗi lưu sản phẩm");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (product: ApiProduct) => {
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      categoryId: product.categoryId,
      imageUrl: product.imageUrl || "",
      featured: product.featured,
    });
    setEditingProduct(product.id);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xóa sản phẩm này?")) return;
    try {
      await api.delete(API.ADMIN.PRODUCT(id));
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Xóa thất bại");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: 0,
      categoryId: categories[0]?.id ?? "",
      imageUrl: "",
      featured: false,
    });
    setEditingProduct(null);
    setShowModal(false);
    setFormError(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Quản lý sản phẩm</h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Thêm sản phẩm
        </button>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-lg shadow-md h-64 animate-pulse" />
      ) : (
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold">Tên</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Danh mục</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Giá</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Đánh giá</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Nổi bật</th>
              <th className="px-6 py-3 text-right text-sm font-semibold">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium">{product.name}</td>
                <td className="px-6 py-4 text-sm">{product.category?.name ?? "—"}</td>
                <td className="px-6 py-4 text-sm font-semibold text-orange-600">
                  {product.price.toLocaleString("vi-VN")}đ
                </td>
                <td className="px-6 py-4 text-sm">
                  {product.rating.toFixed(1)} ({product.reviewCount})
                </td>
                <td className="px-6 py-4 text-sm">
                  {product.featured ? (
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">Có</span>
                  ) : (
                    <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs">Không</span>
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-right">
                  <button
                    onClick={() => handleEdit(product)}
                    className="text-blue-600 hover:text-blue-800 mr-3"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">
                {editingProduct ? "Sửa sản phẩm" : "Thêm sản phẩm mới"}
              </h2>
              <button onClick={resetForm} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Tên sản phẩm</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Mô tả</label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Giá (đ)</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Danh mục</label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600"
                    required
                  >
                    <option value="">-- Chọn danh mục --</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">URL hình ảnh</label>
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="featured"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="w-4 h-4 text-orange-600 focus:ring-orange-600"
                />
                <label htmlFor="featured" className="text-sm font-medium">
                  Sản phẩm nổi bật
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-60"
                >
                  {isSaving ? "Đang lưu..." : editingProduct ? "Cập nhật" : "Thêm mới"}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
