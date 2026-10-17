# Chữ trang chủ Free theo thuật ngữ chuẩn kèm giải thích (T316)

- Ngày: 17/10/2026
- Người: dinhlanphuongipacc, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `home/BaBaiToanFree.tsx`: hướng chữ "thuật ngữ chuẩn đứng trước, lời giải thích đi kèm", để chủ cửa hàng quen dần với tên báo cáo của gói cao hơn.
  - Khối Kết quả kinh doanh (trước là Quản lý lãi lỗ): tiêu đề phụ, số lớn Lợi nhuận tháng này, Biên lợi nhuận kèm "lãi/lỗ … đ trên mỗi 100 đ doanh thu"; dòng Doanh thu, Giá vốn nguyên vật liệu, Chi phí hoạt động, Chi phí phân bổ, khấu hao có chú thích; nút Xem kết quả kinh doanh mở báo cáo 10.2.3 đúng tháng đang xem; biểu đồ Hiệu quả kinh doanh 13 tháng.
  - Quỹ tiền: tiêu đề phụ, dòng Tháng này thu · chi, Tổng tồn quỹ giữa vòng, giải nghĩa biểu đồ Dòng tiền 13 tháng, gợi ý khi rê chuột ở Dòng tiền thuần.
  - Mua hàng và công nợ nhà cung cấp (bỏ viết tắt NCC): Giá trị mua hàng, Công nợ phải trả, Nợ đầu kỳ, Phát sinh mua nợ, Đã thanh toán, Nợ cuối kỳ có chú thích; Mặt hàng mua nhiều nhất, Nhà cung cấp nợ nhiều nhất; nút Thanh toán nhà cung cấp.
  - Hao hụt kiểm kê: tiêu đề phụ, Mặt hàng chênh lệch, Tiến độ kiểm kê theo cửa hàng, Thiếu, Thừa nhiều nhất, link Báo cáo hao hụt.
- `home/ChiPhiThang.tsx`, `home/index.ts`: màn chi tiết đổi tên Chi phí hoạt động.
- `app.css`: mục cuối T316 (`.bbt-e-mota`, `.bbt-e-giai`).
- `tools/kiem_tra.py`: bài kiểm web dùng tiêu đề mới Kết quả kinh doanh, Mua hàng và công nợ nhà cung cấp.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi. `python tools/kiem_tra.py --nhanh`: Không có lỗi (lần đầu sau khi lấy bản mới báo Execution context was destroyed, chạy lại thì đạt). `kiem_van --loai giao-dien` các tệp đã sửa: sạch.
- Thử tay ở 1366x900: chữ mới hiện đúng 4 khối; cửa hàng đang lỗ thì ghi "lỗ 0,2 đ trên mỗi 100 đ"; nút Xem kết quả kinh doanh mở báo cáo tháng 10/2026.

## Dở dang, việc tiếp theo

- Bản điện thoại (`MTrangChu.tsx`, Trum làm) vẫn chữ cũ Quản lý lãi lỗ, Chi phí trong tháng; bài kiểm điện thoại trong `kiem_tra.py` vẫn tìm chữ cũ.
- Đề xuất màu dịu cho biểu đồ (họ xanh cho vòng tồn quỹ, cột tông nhạt) chưa áp, chờ chốt.

## Bẫy, quyết định mới

- Không.
