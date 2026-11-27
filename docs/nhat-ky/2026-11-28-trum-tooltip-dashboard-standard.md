# 28/11/2026 · Trum · Tooltip dashboard nhà hàng theo gói Standard (T959)

## Đã làm

- Tooltip 4 biểu đồ dashboard Plus, Pro dùng lại lớp `ll-tip` của gói Standard. Tiêu đề "Tháng m/yyyy", biên LN ròng ở góc phải, dòng Lợi nhuận và Chênh lệch thu chi tách bằng kẻ, tô xanh khi dương, đỏ khi âm. Biểu đồ tỷ lệ NVL, hao hụt có định mức thì thêm dòng Vượt hoặc Dưới định mức.
- Biểu đồ Chi phí NVL nhận prop `vuaKhung` của `SparkDinhMuc`: khung cha đặt chiều cao theo cột trái, biểu đồ tính lại viewBox theo tỷ lệ khung nên không méo.
- Hai biểu đồ 13 tháng hạ `h` từ 280 xuống 220.
- Hộp nguồn hao hụt mọc ngay dưới dòng có dấu ?, không còn đợi hết khối số.

## Kiểm

- `npm run typecheck`, `npm run build` exit 0.
- Ca kiểm dashboard riêng (`t956-khoi.py`, gói Plus, Pro, khổ 1440, 390, 360): "Không có lỗi."
- `kiem_tra.py --nhanh` vẫn dừng ở ca Thẻ kho, lỗi có sẵn ghi ở T957.

## Dở dang, việc tiếp theo

Không.
