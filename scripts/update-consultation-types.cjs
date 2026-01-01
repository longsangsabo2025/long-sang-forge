// Update consultation_types to correct 3 packages
const { Client } = require("pg");

async function main() {
  const client = new Client(process.env.DATABASE_URL);

  try {
    await client.connect();
    console.log("Connected to database");

    // Delete old data
    await client.query("DELETE FROM consultation_types");
    console.log("Deleted old consultation types");

    // Insert new 3 packages
    await client.query(`
      INSERT INTO consultation_types (name, description, duration_minutes, price, color, is_active) VALUES
      ('Gói Cơ Bản (30 phút)', 'Tìm hiểu doanh nghiệp • Tư vấn 1:1 qua Google Meet • Giải đáp thắc mắc AI • Gợi ý hướng đi', 30, 299000, '#22d3ee', true),
      ('Gói Tiêu Chuẩn (60 phút)', 'Gói Cơ Bản + Phân tích quy trình • Đề xuất giải pháp chi tiết • Ước tính chi phí • Tài liệu tóm tắt PDF', 60, 499000, '#3b82f6', true),
      ('Gói Premium (120 phút)', 'Gói Tiêu Chuẩn + Demo giải pháp thực tế • Roadmap 3-6 tháng • Báo cáo chi tiết • Bonus: Follow-up 30p miễn phí', 120, 999000, '#a855f7', true)
    `);
    console.log("Inserted new 3 consultation packages");

    // Verify
    const result = await client.query(
      "SELECT name, duration_minutes, price FROM consultation_types ORDER BY duration_minutes"
    );
    console.log("\n=== NEW CONSULTATION TYPES ===");
    console.table(result.rows);
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await client.end();
  }
}

main();
