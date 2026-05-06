import { useState } from 'react';
import { Trash2, Star } from 'lucide-react';
import { reviews, users, products } from '../data/mockData';
import { toast } from 'sonner';

export function Reviews() {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const totalPages = Math.ceil(reviews.length / itemsPerPage);
  const paginatedReviews = reviews.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleDelete = (reviewId: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa đánh giá này?')) {
      const index = reviews.findIndex(r => r.id === reviewId);
      if (index > -1) {
        reviews.splice(index, 1);
        toast.success('Đã xóa đánh giá thành công');
      }
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {Array.from({ length: 5 }, (_, i) => (
          <Star
            key={i}
            size={16}
            className={i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Quản lý đánh giá</h1>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 text-gray-600">Sản phẩm</th>
                <th className="text-left py-3 px-4 text-gray-600">Người đánh giá</th>
                <th className="text-left py-3 px-4 text-gray-600">Đánh giá</th>
                <th className="text-left py-3 px-4 text-gray-600">Nội dung</th>
                <th className="text-left py-3 px-4 text-gray-600">Thời gian</th>
                <th className="text-left py-3 px-4 text-gray-600">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {paginatedReviews.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-500">
                    Chưa có đánh giá nào
                  </td>
                </tr>
              ) : (
                paginatedReviews.map((review) => {
                  const product = products.find(p => p.id === review.product_id);
                  const user = users.find(u => u.id === review.user_id);

                  return (
                    <tr key={review.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {product && (
                            <>
                              <img
                                src={product.images[0]}
                                alt={product.name}
                                className="w-12 h-12 object-cover rounded"
                              />
                              <span className="font-medium">{product.name}</span>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">{user?.name || 'N/A'}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {renderStars(review.rating)}
                          <span className="text-sm text-gray-600">({review.rating})</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 max-w-md">
                        <p className="line-clamp-2">{review.comment}</p>
                      </td>
                      <td className="py-3 px-4">{new Date(review.created_at).toLocaleString('vi-VN')}</td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleDelete(review.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  );
                })
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
    </div>
  );
}
