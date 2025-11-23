const dayjs = require('dayjs');
const customParseFormat = require('dayjs/plugin/customParseFormat');
dayjs.extend(customParseFormat);

function getStatus(timeStart, timeEnd, date) {
    if (!timeStart || !timeEnd || !date) return 'chưa có lịch trình'
    const now = dayjs().format('YYYY-MM-DD HH:mm');

    const start = dayjs(new Date(`${timeStart} ${formatDate(date)}`))
    const end = dayjs(new Date(`${timeEnd} ${formatDate(date)}`))
    if (start.isAfter(now)) return 'Dự Kiến';
    else if (end.isBefore(now)) return 'Đã hoàn thành';
    else return 'Đang hoạt động'
}

function getLevels(timeArr, period){
    const now = dayjs();
    const levelArr = timeArr.map((time)=>{
         const startTime = dayjs(new Date(`${time.timeStart} ${formatDate(time.date)}`));
          const gap = now.diff(startTime);
          return Math.floor(gap/period);
    })
    
    return levelArr;
}

const formatDate = (day) => {
    if (!day) return ""; // nếu không có dữ liệu thì trả về rỗng tránh crash
    const date = new Date(day);

    if (isNaN(date.getTime())) return ""; // kiểm tra có phải ngày hợp lệ không

    return date.toISOString().split("T")[0];
};

module.exports = { getStatus,getLevels }