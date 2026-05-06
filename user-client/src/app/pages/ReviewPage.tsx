import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Star } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { mockOrders } from '../mockData';
import { toast } from 'sonner';

export function ReviewPage() {
  const { orderId } = useParams();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [reviews, setReviews] = useState<Record<string, { rating: number; comment: string }>>({});
  const [loading, setLoading] = useState(false);

  if (!isAuthenticated) {
    navigate('/login?redirect=/orders');
    return null;
  }

  const order = mockOrders.find(o => o.id === orderId);

  if (!order) {
    navigate('/orders');
    return null;
  }

  const handleRatingChange = (productId: string, rating: number) => {
    setReviews(prev => ({
      ...prev,
      [productId]: { ...prev[productId], rating },
    }));
  };

  const handleCommentChange = (productId: string, comment: string) => {
    setReviews(prev => ({
      ...prev,
      [productId]: { ...prev[productId], comment },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const hasAllRatings = order.items.every(item => reviews[item.product_id]?.rating > 0);
    if (!hasAllRatings) {
      toast.error('Vui lòng đánh giá tất cả sản phẩm');
      return;
    }

    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    setLoading(false);
    toast.success('Cảm ơn bạn đã đánh giá!');
    navigate('/orders');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="mb-8">Đánh Giá Đơn Hàng</h1>

        <div className="bg-card rounded-lg p-6 shadow mb-6">
          <div className="text-sm text-muted-foreground mb-2">Đơn hàng</div>
          <div className="font-medium">#{order.id}</div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {order.items.map((item) => {
            const review = reviews[item.product_id] || { rating: 0, comment: '' };

            return (
              <div key={item.product_id} className="bg-card rounded-lg p-6 shadow">
                <div className="flex gap-4 mb-4">
                  <div className="w-20 h-20 rounded bg-muted overflow-hidden flex-shrink-0">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className="text-base mb-1">{item.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {item.price.toLocaleString('vi-VN')}đ
                    </p>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block mb-2">Đánh giá *</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => handleRatingChange(item.product_id, star)}
                        className="focus:outline-none"
                      >
                        <Star
                          className={`w-8 h-8 transition-colors ${
                            star <= review.rating
                              ? 'fill-secondary text-secondary'
                              : 'text-gray-300 hover:text-secondary/50'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block mb-2">Nhận xét</label>
                  <textarea
                    value={review.comment}
                    onChange={(e) => handleCommentChange(item.product_id, e.target.value)}
                    rows={3}
                    placeholder="Chia sẻ trải nghiệm của bạn..."
                    className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>
            );
          })}

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => navigate('/orders')}
              className="flex-1 bg-muted text-foreground px-6 py-3 rounded-lg hover:bg-muted/80"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? 'Đang gửi...' : 'Gửi đánh giá'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
