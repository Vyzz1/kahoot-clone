import {Schema, model} from "mongoose";

// Định nghĩa Schema cho MigrationVersion
const migrationVersionSchema = new Schema({
    // Trường 'version' sẽ lưu trữ số phiên bản hiện tại của database
    version: { 
        type: Number, 
        required: true, 
        default: 0 // Mặc định là 0 nếu chưa có phiên bản nào được chạy
    },
    // Trường 'lastRun' sẽ lưu trữ thời gian chạy migration cuối cùng
    // Điều này giúp theo dõi khi nào migration được áp dụng lần cuối
    lastRun: {
        type: Date,
        default: Date.now 
    },
});
// Tạo model MigrationVersion từ schema đã định nghĩa
const MigrationVersion = model("MigrationVersion", migrationVersionSchema);

export default MigrationVersion;