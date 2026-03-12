# Hiệu sách - MERN Stack

Trang web hiệu sách: frontend (công khai), admin-cms (quản trị), server (API).

## Cấu trúc

- `frontend/` - React (Vite), trang bán hàng, tone xanh lá nhạt
- `admin-cms/` - React (Vite), trang quản trị (đăng nhập admin)
- `server/` - Node.js + Express + MongoDB

## Chạy dự án

1. **MongoDB**: Chạy MongoDB local (hoặc set `MONGODB_URI` trong `server/.env`).

2. **Server**
   ```bash
   cd server && npm run dev
   ```
   Mặc định: http://localhost:5000

3. **Frontend**
   ```bash
   cd frontend && npm run dev
   ```
   Mặc định: http://localhost:5173

4. **Admin CMS**
   ```bash
   cd admin-cms && npm run dev
   ```
   Cấu hình port 3001 trong vite.config (hoặc mặc định 5174 khi 5173 đã dùng).

## Tài khoản Admin mặc định

Sau lần chạy server đầu tiên (khi chưa có user admin), server tự tạo tài khoản:
- **Email:** admin@localhost
- **Mật khẩu:** admin123

Dùng để đăng nhập Admin CMS (http://localhost:3001).

## Biến môi trường (server)

- `PORT` - Port server (mặc định 5000)
- `MONGODB_URI` - URI MongoDB (mặc định mongodb://127.0.0.1:27017/hieusach)
- `JWT_SECRET` - Secret cho JWT (nên set khi deploy)
