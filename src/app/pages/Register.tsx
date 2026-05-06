import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import { isValidEmail } from "../utils/authStorage";

export function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const redirectTo = useMemo(() => searchParams.get("redirect") || "/account", [searchParams]);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!name.trim()) {
      setError("Vui lòng nhập họ tên");
      return;
    }
    if (!isValidEmail(email)) {
      setError("Email không đúng định dạng");
      return;
    }
    if (password.length < 6) {
      setError("Mật khẩu tối thiểu 6 ký tự");
      return;
    }
    if (password !== confirmPassword) {
      setError("Mật khẩu và xác nhận mật khẩu phải trùng nhau");
      return;
    }

    setSubmitting(true);
    try {
      await register(name, email, password);
      setSuccess("Đăng ký thành công");
      navigate(redirectTo);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đăng ký thất bại");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-10 px-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-bold mb-2">Đăng ký</h1>
        <p className="text-gray-600 mb-6">Tạo tài khoản FastFood của bạn</p>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {success}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Họ tên</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600"
              placeholder="Nguyễn Văn A"
              autoComplete="name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600"
              placeholder="example@gmail.com"
              autoComplete="email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Mật khẩu</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600"
              placeholder="Tối thiểu 6 ký tự"
              autoComplete="new-password"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Xác nhận mật khẩu</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600"
              placeholder="Nhập lại mật khẩu"
              autoComplete="new-password"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors disabled:opacity-60"
          >
            {submitting ? "Đang tạo tài khoản..." : "Đăng ký"}
          </button>
        </form>

        <div className="mt-6 text-sm text-gray-600">
          Đã có tài khoản?{" "}
          <Link to={`/login?redirect=${encodeURIComponent(redirectTo)}`} className="text-orange-600 hover:text-orange-700 font-semibold">
            Đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
}

