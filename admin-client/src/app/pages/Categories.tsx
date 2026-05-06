import { useState } from 'react';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import { categories, Category } from '../data/mockData';
import { toast } from 'sonner';

export function Categories() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  const handleDelete = (categoryId: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa danh mục này?')) {
      const index = categories.findIndex(c => c.id === categoryId);
      if (index > -1) {
        categories.splice(index, 1);
        toast.success('Đã xóa danh mục thành công');
      }
    }
  };

  const handleAddNew = () => {
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Quản lý danh mục</h1>
        <button
          onClick={handleAddNew}
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus size={20} />
          Thêm danh mục
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 text-gray-600">ID</th>
                <th className="text-left py-3 px-4 text-gray-600">Tên danh mục</th>
                <th className="text-left py-3 px-4 text-gray-600">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {categories.length === 0 ? (
                <tr>
                  <td colSpan={3} className="text-center py-8 text-gray-500">
                    Chưa có danh mục nào
                  </td>
                </tr>
              ) : (
                categories.map((category) => (
                  <tr key={category.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">{category.id}</td>
                    <td className="py-3 px-4 font-medium">{category.name}</td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(category)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(category.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <CategoryModal
          category={editingCategory}
          onClose={() => setIsModalOpen(false)}
          onSave={() => {
            setIsModalOpen(false);
            toast.success(editingCategory ? 'Đã cập nhật danh mục' : 'Đã thêm danh mục mới');
          }}
        />
      )}
    </div>
  );
}

interface CategoryModalProps {
  category: Category | null;
  onClose: () => void;
  onSave: () => void;
}

function CategoryModal({ category, onClose, onSave }: CategoryModalProps) {
  const [name, setName] = useState(category?.name || '');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError('Vui lòng nhập tên danh mục');
      return;
    }

    if (category) {
      const index = categories.findIndex(c => c.id === category.id);
      if (index > -1) {
        categories[index] = { ...categories[index], name };
      }
    } else {
      categories.push({
        id: Date.now().toString(),
        name,
      });
    }

    onSave();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">
            {category ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tên danh mục <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Nhập tên danh mục"
            />
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg"
            >
              {category ? 'Cập nhật' : 'Thêm mới'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg"
            >
              Hủy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
