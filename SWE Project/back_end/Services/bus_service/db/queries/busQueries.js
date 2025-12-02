// bus_service/db/queries/busQueries.js
const pool = require('../pool');

class BusQueries {
    // Lấy tất cả xe với điều kiện động
    async findAll(filters = {}, pagination = {}) {
        const {
            status,
            search,
            minCapacity,
            maxCapacity,
            minFuel,
            route
        } = filters;

        const { limit = 1000, offset = 0 } = pagination;

        let query = 'SELECT * FROM Buses WHERE 1=1';
        let countQuery = 'SELECT COUNT(*) as total FROM Buses WHERE 1=1';
        let params = [];
        let countParams = [];

        // Lọc theo trạng thái
        if (status && status !== 'all') {
            query += ' AND Status = ?';
            countQuery += ' AND Status = ?';
            params.push(status);
            countParams.push(status);
        }

        // Tìm kiếm
        if (search) {
            query += ' AND (BusID LIKE ? OR PlateNumber LIKE ? OR Location LIKE ?)';
            countQuery += ' AND (BusID LIKE ? OR PlateNumber LIKE ? OR Location LIKE ?)';
            const searchPattern = `%${search}%`;
            params.push(searchPattern, searchPattern, searchPattern);
            countParams.push(searchPattern, searchPattern, searchPattern);
        }

        // Bộ lọc nâng cao
        if (minCapacity) {
            query += ' AND Capacity >= ?';
            countQuery += ' AND Capacity >= ?';
            params.push(parseInt(minCapacity));
            countParams.push(parseInt(minCapacity));
        }

        if (maxCapacity) {
            query += ' AND Capacity <= ?';
            countQuery += ' AND Capacity <= ?';
            params.push(parseInt(maxCapacity));
            countParams.push(parseInt(maxCapacity));
        }

        if (minFuel) {
            query += ' AND FuelLevel >= ?';
            countQuery += ' AND FuelLevel >= ?';
            params.push(parseInt(minFuel));
            countParams.push(parseInt(minFuel));
        }

        if (route) {
            query += ' AND RouteID LIKE ?';
            countQuery += ' AND RouteID LIKE ?';
            const routePattern = `%${route}%`;
            params.push(routePattern);
            countParams.push(routePattern);
        }

        // Sắp xếp và phân trang
        query += ' ORDER BY BusID LIMIT ? OFFSET ?';
        params.push(parseInt(limit), parseInt(offset));

        const [buses] = await pool.query(query, params);
        const [countResult] = await pool.query(countQuery, countParams);

        return {
            buses,
            total: countResult[0].total
        };
    }

    // Lấy xe theo ID
    async findById(busId) {
        const [buses] = await pool.query(
            'SELECT * FROM Buses WHERE BusID = ?',
            [busId]
        );
        return buses[0];
    }

    // Lấy xe theo biển số
    async findByPlateNumber(plateNumber) {
        const [buses] = await pool.query(
            'SELECT * FROM Buses WHERE PlateNumber = ?',
            [plateNumber]
        );
        return buses[0];
    }

    // Kiểm tra tồn tại
    async exists(busId, plateNumber = null) {
        let query = 'SELECT BusID FROM Buses WHERE BusID = ?';
        let params = [busId];

        if (plateNumber) {
            query += ' OR PlateNumber = ?';
            params.push(plateNumber);
        }

        const [result] = await pool.query(query, params);
        return result.length > 0;
    }

    // Tạo xe mới
    async create(busData) {
        const {
            BusID,
            PlateNumber,
            Capacity,
            CurrentLoad = 0,
            FuelLevel = 100,
            Status = 'ready',
            Location = null,
            PickUpLocation = null,
            DropOffLocation = null,
            DriverID = null,
            RouteID = null
        } = busData;

        const [result] = await pool.query(
            `INSERT INTO Buses (BusID, PlateNumber, Capacity, CurrentLoad, FuelLevel, 
                          Status, Location, PickUpLocation, DropOffLocation, DriverID, RouteID)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [BusID, PlateNumber, Capacity, CurrentLoad, FuelLevel, Status,
                Location, PickUpLocation, DropOffLocation, DriverID, RouteID]
        );

        return result;
    }

    // Cập nhật xe
    async update(busId, updates) {
        const allowedFields = [
            'PlateNumber', 'Capacity', 'CurrentLoad', 'FuelLevel',
            'Status', 'Location', 'PickUpLocation', 'DropOffLocation',
            'DriverID', 'RouteID'
        ];

        // If status is being changed to inactive, automatically clear RouteID and DriverID
        if (updates.Status && updates.Status.toLowerCase() === 'inactive') {
            updates.RouteID = null;
            updates.DriverID = null;
        }

        const updateFields = [];
        const values = [];

        Object.keys(updates).forEach(key => {
            if (allowedFields.includes(key) && updates[key] !== undefined) {
                updateFields.push(`${key} = ?`);
                values.push(updates[key]);
            }
        });

        if (updateFields.length === 0) {
            throw new Error('Không có trường nào để cập nhật');
        }

        values.push(busId);

        const [result] = await pool.query(
            `UPDATE Buses SET ${updateFields.join(', ')} WHERE BusID = ?`,
            values
        );
        return result;
    }

    // Cập nhật trạng thái
    async updateStatus(busId, status) {
        // If status is being changed to inactive, automatically clear RouteID and DriverID
        let query;
        let params;

        if (status && status.toLowerCase() === 'inactive') {
            query = 'UPDATE Buses SET Status = ?, RouteID = NULL, DriverID = NULL WHERE BusID = ?';
            params = [status, busId];
        } else {
            query = 'UPDATE Buses SET Status = ? WHERE BusID = ?';
            params = [status, busId];
        }

        const [result] = await pool.query(query, params);
        return result;
    }

    // Cập nhật vị trí
    async updateLocation(busId, location) {
        const [result] = await pool.query(
            'UPDATE Buses SET Location = ? WHERE BusID = ?',
            [location, busId]
        );
        return result;
    }

    // Cập nhật nhiên liệu
    async updateFuelLevel(busId, fuelLevel) {
        const [result] = await pool.query(
            'UPDATE Buses SET FuelLevel = ? WHERE BusID = ?',
            [fuelLevel, busId]
        );
        return result;
    }

    // Gán tài xế vào xe
    async assignDriver(busId, driverId) {
        const [result] = await pool.query(
            'UPDATE Buses SET DriverID = ? WHERE BusID = ?',
            [driverId, busId]
        );
        return result;
    }

    // Gỡ tài xế khỏi xe
    async removeDriver(busId) {
        const [result] = await pool.query(
            'UPDATE Buses SET DriverID = NULL WHERE BusID = ?',
            [busId]
        );
        return result;
    }

    // Gán tuyến cho xe
    async assignRoute(busId, routeId) {
        const [result] = await pool.query(
            'UPDATE Buses SET RouteID = ?, Status = "running" WHERE BusID = ?',
            [routeId, busId]
        );
        return result;
    }

    // Xóa xe
    async delete(busId) {
        const [result] = await pool.query(
            'DELETE FROM Buses WHERE BusID = ?',
            [busId]
        );
        return result;
    }

    // Lấy thống kê
    async getStats() {
        const [stats] = await pool.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN Status = 'running' THEN 1 ELSE 0 END) as running,
        SUM(CASE WHEN Status = 'waiting' THEN 1 ELSE 0 END) as waiting,
        SUM(CASE WHEN Status = 'inactive' THEN 1 ELSE 0 END) as inactive,
        SUM(CASE WHEN Status = 'ready' THEN 1 ELSE 0 END) as ready,
        SUM(Capacity) as totalCapacity,
        SUM(CurrentLoad) as registered,
        AVG(FuelLevel) as avgFuel
      FROM Buses
    `);
        return stats[0];
    }

    // Lấy xe theo trạng thái
    async findByStatus(status) {
        const [buses] = await pool.query(
            'SELECT * FROM Buses WHERE Status = ?',
            [status]
        );
        return buses;
    }

    // Lấy xe theo tài xế
    async findByDriver(driverId) {
        const [buses] = await pool.query(
            'SELECT * FROM Buses WHERE DriverID = ?',
            [driverId]
        );
        return buses;
    }

    // Lấy xe theo tuyến
    async findByRoute(routeId) {
        const [buses] = await pool.query(
            'SELECT * FROM Buses WHERE RouteID = ?',
            [routeId]
        );
        return buses;
    }

    // Lấy xe có sức chứa tối thiểu
    async findByMinCapacity(minCapacity) {
        const [buses] = await pool.query(
            'SELECT * FROM Buses WHERE Capacity >= ? ORDER BY Capacity ASC',
            [minCapacity]
        );
        return buses;
    }

    // Lấy xe sẵn sàng (không có tài xế, không có tuyến)
    async findAvailable() {
        const [buses] = await pool.query(
            "SELECT * FROM Buses WHERE Status = 'ready' AND DriverID IS NULL AND RouteID IS NULL"
        );
        return buses;
    }
}

module.exports = new BusQueries();