# Dùng Node.js LTS nhẹ
FROM node:18-alpine

# Tạo thư mục làm việc trong container
WORKDIR /app

# Copy file package.json
COPY package*.json ./

# Cài dependencies
RUN npm install

# Copy toàn bộ mã nguồn
COPY . .

# Mở port mặc định (API Gateway dùng 5000)
EXPOSE 5000

# Lệnh mặc định (gateway sẽ override nếu cần)
CMD ["node", "API_gateway/server.js"]
