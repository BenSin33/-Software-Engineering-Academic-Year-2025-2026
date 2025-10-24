const express = require('express');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const app = express();
app.use(express.json());

// Đọc file cấu hình JSON dùng chung cho tất cả các service
const configPath = path.join(__dirname, '../../config/service_config.json');
let serviceConfig = {};

try {
  const rawConfig = fs.readFileSync(configPath, 'utf-8');
  serviceConfig = JSON.parse(rawConfig);
} catch (err) {
  console.error('Không thể đọc file cấu hình:', err.message);
  process.exit(1);
}

/**
 * API trung gian nhận danh sách dữ liệu cần từ các service khác
 * và trả về dữ liệu tổng hợp từ các service gốc
 * Nếu có dữ liệu thay đổi, sẽ gọi lại service gốc để cập nhật
 */
app.post('/api/data-sync', async (req, res) => {
  const { requests, updates } = req.body;

  if (!Array.isArray(requests) || requests.length === 0) {
    return res.status(400).json({ error: 'Yêu cầu không hợp lệ hoặc trống.' });
  }

  const results = {};

  for (const request of requests) {
    const { type, ids } = request;

    if (!type || !Array.isArray(ids) || ids.length === 0) {
      results[type || 'unknown'] = 'Thiếu type hoặc danh sách ids không hợp lệ.';
      continue;
    }

    const config = serviceConfig[type];

    if (!config || !config.url) {
      results[type] = `Không tìm thấy cấu hình cho loại dữ liệu: ${type}`;
      continue;
    }

    try {
      // Gọi đến service để lấy dữ liệu
      const response = await axios({
        method: config.method || 'POST',
        url: config.url,
        data: { ids }
      });

      const foundItems = response.data;
      const foundIds = foundItems.map(item => item.id);
      const missingIds = ids.filter(id => !foundIds.includes(id));

      results[type] = {
        data: foundItems,
        missing: missingIds.length > 0 ? missingIds : null,
        message: missingIds.length > 0
          ? `Không tìm thấy ${missingIds.length} ${type}(s): ${missingIds.join(', ')}`
          : 'Tất cả dữ liệu hợp lệ.'
      };

      // Nếu có dữ liệu cập nhật cho type này → gọi update
      if (updates && updates[type] && config.updateUrl) {
        try {
          await axios.post(config.updateUrl, { data: updates[type] });
          results[type].updateStatus = 'Đã cập nhật dữ liệu thành công.';
        } catch (updateErr) {
          results[type].updateStatus = `Lỗi khi cập nhật dữ liệu: ${updateErr.message}`;
        }
      }

    } catch (error) {
      results[type] = {
        error: `Lỗi khi gọi service: ${error.message}`
      };
    }
  }

  res.json(results);
});

app.listen(3000, () => console.log('DataSyncService chạy tại port 3000'));