// utils/syncUtils.js
const axios = require('axios');

const syncParentToService = async (parentData) => {
  try {
    await axios.post('http://localhost:PORT/api/parents/sync', parentData);
    console.log(` Đồng bộ phụ huynh ${parentData.fullName} sang service khác`);
  } catch (err) {
    console.error(' Lỗi đồng bộ phụ huynh:', err.message);
  }
};

const deleteParentFromService = async (parentId) => {
  try {
    await axios.delete(`http://localhost:PORT/api/parents/sync/${parentId}`);
    console.log(` Đã đồng bộ xóa phụ huynh ${parentId}`);
  } catch (err) {
    console.error(' Lỗi xóa phụ huynh ở service khác:', err.message);
  }
};

const syncDriverToService = async (driverData) => {
  try {
    await axios.post('http://localhost:PORT/api/drivers/sync', driverData);
    console.log(` Đồng bộ tài xế ${driverData.fullName} sang service khác`);
  } catch (err) {
    console.error(' Lỗi đồng bộ tài xế:', err.message);
  }
};

const deleteDriverFromService = async (driverId) => {
  try {
    await axios.delete(`http://localhost:PORT/api/drivers/sync/${driverId}`);
    console.log(` Đã đồng bộ xóa tài xế ${driverId}`);
  } catch (err) {
    console.error(' Lỗi xóa tài xế ở service khác:', err.message);
  }
};

module.exports = {
  syncParentToService,
  deleteParentFromService,
  syncDriverToService,
  deleteDriverFromService,
};