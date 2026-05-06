export function Header() {
  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800">Quản trị hệ thống</h2>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">Admin</span>
          <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-white font-semibold">
            A
          </div>
        </div>
      </div>
    </div>
  );
}
