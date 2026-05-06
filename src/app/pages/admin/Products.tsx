import { useState } from "react";
import { Plus, Edit, Trash2, X } from "lucide-react";
import { products as initialProducts, categories } from "../../data/mockData";

export function AdminProducts() {
  const [products, setProducts] = useState(initialProducts);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    category: categories[0],
    image: "",
    rating: 4.5,
    reviews: 0,
    featured: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingProduct !== null) {
      setProducts(
        products.map((p) =>
          p.id === editingProduct ? { ...formData, id: editingProduct } : p
        )
      );
    } else {
      const newProduct = {
        ...formData,
        id: Math.max(...products.map((p) => p.id)) + 1,
      };
      setProducts([...products, newProduct]);
    }

    resetForm();
  };

  const handleEdit = (id: number) => {
    const product = products.find((p) => p.id === id);
    if (product) {
      setFormData(product);
      setEditingProduct(id);
      setShowModal(true);
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Bạn có chắc muốn xóa sản phẩm này?")) {
      setProducts(products.filter((p) => p.id !== id));
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: 0,
      category: categories[0],
      image: "",
      rating: 4.5,
      reviews: 0,
      featured: false,
    });
    setEditingProduct(null);
    setShowModal(false);
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

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold">ID</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Tên</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">
                Danh mục
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Giá</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">
                Đánh giá
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold">
                Nổi bật
              </th>
              <th className="px-6 py-3 text-right text-sm font-semibold">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm">{product.id}</td>
                <td className="px-6 py-4 text-sm font-medium">
                  {product.name}
                </td>
                <td className="px-6 py-4 text-sm">{product.category}</td>
                <td className="px-6 py-4 text-sm font-semibold text-orange-600">
                  {product.price.toLocaleString("vi-VN")}đ
                </td>
                <td className="px-6 py-4 text-sm">
                  {product.rating} ({product.reviews})
                </td>
                <td className="px-6 py-4 text-sm">
                  {product.featured ? (
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                      Có
                    </span>
                  ) : (
                    <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs">
                      Không
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-right">
                  <button
                    onClick={() => handleEdit(product.id)}
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

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Tên sản phẩm</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Mô tả</label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
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
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: Number(e.target.value) })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Danh mục</label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">URL hình ảnh</label>
                <input
                  type="url"
                  required
                  value={formData.image}
                  onChange={(e) =>
                    setFormData({ ...formData, image: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="featured"
                  checked={formData.featured}
                  onChange={(e) =>
                    setFormData({ ...formData, featured: e.target.checked })
                  }
                  className="w-4 h-4 text-orange-600 focus:ring-orange-600"
                />
                <label htmlFor="featured" className="text-sm font-medium">
                  Sản phẩm nổi bật
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700 transition-colors"
                >
                  {editingProduct ? "Cập nhật" : "Thêm mới"}
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
