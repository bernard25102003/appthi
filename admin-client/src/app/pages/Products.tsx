import { useState, useRef } from 'react';
import { Search, Plus, Edit2, Trash2, X, Upload, Image as ImageIcon, Loader } from 'lucide-react';
import { products, categories, Product } from '../data/mockData';
import { uploadMultipleToImageKit } from '../../../../Imagekit Docs/utils/imagekit';
import { toast } from 'sonner';

export function Products() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || product.category_id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleDelete = (productId: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
      const index = products.findIndex(p => p.id === productId);
      if (index > -1) {
        products.splice(index, 1);
        toast.success('Đã xóa sản phẩm thành công');
      }
    }
  };

  const handleAddNew = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Quản lý sản phẩm</h1>
        <button
          onClick={handleAddNew}
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus size={20} />
          Thêm sản phẩm
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="">Tất cả danh mục</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 text-gray-600">Hình ảnh</th>
                <th className="text-left py-3 px-4 text-gray-600">Tên sản phẩm</th>
                <th className="text-left py-3 px-4 text-gray-600">Giá</th>
                <th className="text-left py-3 px-4 text-gray-600">Danh mục</th>
                <th className="text-left py-3 px-4 text-gray-600">Đã bán</th>
                <th className="text-left py-3 px-4 text-gray-600">Đánh giá</th>
                <th className="text-left py-3 px-4 text-gray-600">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {paginatedProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-500">
                    Không tìm thấy sản phẩm nào
                  </td>
                </tr>
              ) : (
                paginatedProducts.map((product) => (
                  <tr key={product.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <img src={product.images[0]} alt={product.name} className="w-16 h-16 object-cover rounded" />
                    </td>
                    <td className="py-3 px-4 font-medium">{product.name}</td>
                    <td className="py-3 px-4">{product.price.toLocaleString('vi-VN')}đ</td>
                    <td className="py-3 px-4">
                      {categories.find(c => c.id === product.category_id)?.name}
                    </td>
                    <td className="py-3 px-4">{product.sold_count}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <span className="text-yellow-500">★</span>
                        <span>{product.avg_rating}</span>
                        <span className="text-gray-500 text-sm">({product.review_count})</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(product)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
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

        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-4">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-1 rounded ${
                  currentPage === page
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {page}
              </button>
            ))}
          </div>
        )}
      </div>

      {isModalOpen && (
        <ProductModal
          product={editingProduct}
          onClose={() => setIsModalOpen(false)}
          onSave={() => {
            setIsModalOpen(false);
            toast.success(editingProduct ? 'Đã cập nhật sản phẩm' : 'Đã thêm sản phẩm mới');
          }}
        />
      )}
    </div>
  );
}

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
  onSave: () => void;
}

interface ImageFile {
  file: File;
  preview: string;
}

function ProductModal({ product, onClose, onSave }: ProductModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragZoneRef = useRef<HTMLDivElement>(null);
  
  const [formData, setFormData] = useState({
    name: product?.name || '',
    price: product?.price || 0,
    category_id: product?.category_id || '',
    description: product?.description || '',
  });

  const [imageFiles, setImageFiles] = useState<ImageFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleFiles = (files: FileList) => {
    const newImages: ImageFile[] = [];
    
    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/')) {
        const preview = URL.createObjectURL(file);
        newImages.push({ file, preview });
      } else {
        toast.error(`File ${file.name} không phải là hình ảnh`);
      }
    });

    setImageFiles(prev => [...prev, ...newImages]);
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget === dragZoneRef.current) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  const removeImage = (index: number) => {
    setImageFiles(prev => {
      const updated = [...prev];
      URL.revokeObjectURL(updated[index].preview);
      updated.splice(index, 1);
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Vui lòng nhập tên sản phẩm';
    if (formData.price <= 0) newErrors.price = 'Giá phải lớn hơn 0';
    if (!formData.category_id) newErrors.category_id = 'Vui lòng chọn danh mục';
    if (!formData.description.trim()) newErrors.description = 'Vui lòng nhập mô tả';
    if (imageFiles.length === 0) newErrors.images = 'Vui lòng thêm ít nhất một hình ảnh';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsUploading(true);
    
    try {
      // Try to upload to ImageKit
      let imageUrls: string[] = [];
      
      try {
        const uploadedImages = await uploadMultipleToImageKit(
          imageFiles.map(img => img.file),
          'admin-products'
        );
        imageUrls = uploadedImages.map(img => img.url);
      } catch (uploadError) {
        console.warn('ImageKit upload failed, using local blob URLs:', uploadError);
        // Fallback to blob URLs if ImageKit is not configured
        imageUrls = imageFiles.map(img => img.preview);
        toast.warning('ImageKit chưa được cấu hình. Sử dụng URL cục bộ.');
      }

      if (product) {
        const index = products.findIndex(p => p.id === product.id);
        if (index > -1) {
          products[index] = {
            ...products[index],
            ...formData,
            images: imageUrls,
          };
        }
      } else {
        products.push({
          id: Date.now().toString(),
          ...formData,
          images: imageUrls,
          sold_count: 0,
          avg_rating: 0,
          review_count: 0,
        });
      }

      onSave();
    } catch (error) {
      console.error('Submit error:', error);
      toast.error('Lỗi khi lưu sản phẩm');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">
            {product ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tên sản phẩm <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Giá <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Danh mục <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">Chọn danh mục</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                {errors.category_id && <p className="text-red-500 text-sm mt-1">{errors.category_id}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mô tả <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hình ảnh <span className="text-red-500">*</span>
              </label>

              {/* Drag and Drop Area */}
              <div
                ref={dragZoneRef}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition ${
                  isDragging
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-300 bg-gray-50 hover:border-orange-400'
                }`}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                <div className="flex flex-col items-center gap-2">
                  <Upload className={`${isDragging ? 'text-orange-500' : 'text-gray-400'}`} size={32} />
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      Kéo thả hình ảnh vào đây hoặc nhấp để chọn
                    </p>
                    <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF tối đa 5MB</p>
                  </div>
                </div>
              </div>

              {errors.images && <p className="text-red-500 text-sm mt-2">{errors.images}</p>}

              {/* Image Preview Gallery */}
              {imageFiles.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-3">
                    Đã chọn {imageFiles.length} hình ảnh
                  </p>
                  <div className="grid grid-cols-4 gap-3">
                    {imageFiles.map((img, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={img.preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full aspect-square object-cover rounded border border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="submit"
              disabled={isUploading}
              className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-400 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2"
            >
              {isUploading && <Loader size={16} className="animate-spin" />}
              {isUploading ? 'Đang upload...' : product ? 'Cập nhật' : 'Thêm mới'}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={isUploading}
              className="flex-1 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 text-gray-700 px-4 py-2 rounded-lg"
            >
              Hủy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
