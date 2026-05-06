import { Link } from 'react-router';

export function NotFoundPage() {
  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <div className="text-8xl mb-4">404</div>
      <h1 className="mb-4">Không tìm thấy trang</h1>
      <p className="text-muted-foreground mb-8">
        Trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển
      </p>
      <Link
        to="/"
        className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90"
      >
        Về trang chủ
      </Link>
    </div>
  );
}
