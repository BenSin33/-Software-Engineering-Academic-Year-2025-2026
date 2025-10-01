export default function Login() {
    return (
    <>
      <main className="flex items-center justify-center h-screen bg-gray-50">
        <div className="bg-white p-8 rounded shadow-md w-96">
          <h1 className="text-2xl font-bold mb-4">Đăng nhập</h1>
          <form>
            <input
              type="text"
              name = "username"
              placeholder="Tài khoản"
              className="w-full mb-3 p-2 border rounded"
            />
            <input
              type="password"
              placeholder="Mật khẩu"
              className="w-full mb-3 p-2 border rounded"
            />
            <button
              type="submit"
              className="w-full bg-yellow-600 text-black p-2 rounded hover:text-white"
            >
              Đăng nhập
            </button>
          </form>
        </div>
      </main>
    </>
    );
  }
  