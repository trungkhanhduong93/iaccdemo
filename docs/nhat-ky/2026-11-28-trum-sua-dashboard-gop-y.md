# 28/11/2026 · Trum · Sửa dashboard nhà hàng theo góp ý (T958)

## Đã làm

- Tooltip biểu đồ 13 tháng (Kết quả kinh doanh, Thu chi, Chi phí NVL, Hao hụt): tên tháng có kẻ dưới, mỗi dòng chấm màu vuông, tên chữ xám canh trái, số đậm canh phải. Lớp mới `nh-tip`, bỏ lớp `dnh-tip` cũ không còn chỗ dùng. Hộp nguồn hao hụt cùng kiểu.
- Khối Chi phí NVL: cột trái kéo cao bằng biểu đồ, 4 ô số dồn đáy. Chưa đặt định mức thì thay 2 ô định mức bằng Thấp nhất và Tháng trước, lưới luôn đủ 4 ô.
- Khối Công nợ: các dòng Đầu kỳ tới Cuối kỳ giãn đều lấp chiều cao thẻ, hết khoảng trống trên dải chênh lệch.
- Bảng theo cửa hàng: bỏ nền xanh ở dòng cửa hàng đang chọn, tiêu đề nhóm canh giữa.

## Kiểm

- `npm run typecheck`, `npm run build` exit 0.
- Ca kiểm dashboard riêng (`t956-khoi.py`, gói Plus, Pro, khổ 1440, 390, 360): "Không có lỗi."
- `kiem_tra.py --nhanh` vẫn dừng ở ca Thẻ kho, lỗi có sẵn ghi ở T957.

## Dở dang, việc tiếp theo

Không.
