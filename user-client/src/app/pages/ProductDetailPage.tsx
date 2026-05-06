import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Star, Minus, Plus, ShoppingCart } from 'lucide-react';
import { mockProducts, mockReviews } from '../mockData';
import { useCart } from '../contexts/CartContext';

export function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  const product = mockProducts.find(p => p.id === id);

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="text-6xl mb-4">😢</div>
        <h2 className="mb-4">Không tìm thấy sản phẩm</h2>
        <button
          onClick={() => navigate('/products')}
          className="bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90"
        >
          Quay lại trang sản phẩm
        </button>
      </div>
    );
  }

  const productReviews = mockReviews.filter(r => r.product_id === product.id);

  const handleAddToCart = () => {
    addToCart(
      {
        product_id: product.id,
        name: product.name,
        price: product.price,
        image: product.images[0],
      },
      quantity
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Gallery */}
        <div>
          <div className="aspect-square rounded-lg overflow-hidden bg-muted mb-4">
            <img
              src={product.images[selectedImage]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`aspect-square rounded-lg overflow-hidden border-2 ${
                    selectedImage === idx ? 'border-primary' : 'border-transparent'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          <h1 className="mb-4">{product.name}</h1>
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map(star => (
                <Star
                  key={star}
                  className={`w-5 h-5 ${
                    star <= product.avg_rating
                      ? 'fill-secondary text-secondary'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-muted-foreground">
              {product.avg_rating} ({product.review_count} đánh giá)
            </span>
          </div>
          <div className="mb-4">
            <span className="text-3xl text-primary font-bold">
              {product.price.toLocaleString('vi-VN')}đ
            </span>
          </div>
          <div className="mb-6 text-muted-foreground">
            Đã bán {product.sold_count} sản phẩm
          </div>
          <p className="mb-6 text-muted-foreground">{product.description}</p>

          {/* Quantity Selector */}
          <div className="mb-6">
            <label className="block mb-2">Số lượng</label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 rounded-lg border border-border hover:bg-muted flex items-center justify-center"
              >
                <Minus className="w-4 h-4" />
              </button>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-20 text-center py-2 bg-input-background border border-border rounded-lg"
              />
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-10 h-10 rounded-lg border border-border hover:bg-muted flex items-center justify-center"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          <button
            onClick={handleAddToCart}
            className="w-full bg-primary text-primary-foreground py-3 rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
          >
            <ShoppingCart className="w-5 h-5" />
            Thêm vào giỏ hàng
          </button>
        </div>
      </div>

      {/* Reviews */}
      <div className="border-t border-border pt-8">
        <h2 className="mb-6">Đánh giá sản phẩm</h2>
        {productReviews.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Chưa có đánh giá nào
          </div>
        ) : (
          <div className="space-y-4">
            {productReviews.map((review, idx) => (
              <div key={idx} className="bg-card p-6 rounded-lg border border-border">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="font-medium mb-1">{review.user_name}</div>
                    <div className="flex items-center gap-1 mb-2">
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= review.rating
                              ? 'fill-secondary text-secondary'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(review.created_at).toLocaleDateString('vi-VN')}
                  </div>
                </div>
                <p className="text-muted-foreground">{review.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
