# Đồng bộ chữ, link T316, T325 sang trang chủ Free điện thoại (T337)

- Ngày: 17/10/2026
- Người: Trum, agent: Claude Code điều phối, Antigravity viết code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/ui/mobile/MTrangChuFree.tsx`: khối Kết quả kinh doanh đổi tiêu đề, thêm link Xem kết quả kinh doanh, tiêu đề phụ, nhãn Lợi nhuận, giải nghĩa biên lợi nhuận, chú thích từng dòng (Giá vốn nguyên vật liệu, Chi phí hoạt động, Chi phí phân bổ, khấu hao). Khối Quỹ tiền thêm link Sổ quỹ tiền mặt, Sổ ngân hàng, tiêu đề phụ, nút Tạo quỹ dưới vòng tồn quỹ.
- `src/ui/mobile/MKhoFree.tsx`: chữ theo T316 (Mua hàng & công nợ nhà cung cấp, Giá trị mua hàng, Công nợ phải trả, chú thích dòng nợ, Mặt hàng chênh lệch, Tiến độ kiểm kê theo cửa hàng...), link Báo cáo hao hụt.
- `src/styles/app.css`: mục cuối file T337.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi. `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- `python tools/kiem_van.py` 2 file trên: Sạch.
- Playwright 390px gói F: không lỗi trang; worker bấm thử 6 link, nút mới, mở đúng màn (10-2-3, 2-2-1, 2-2-3, 5-2-15, danh mục 1-12, phiếu chi CHI02).

## Dở dang, việc tiếp theo

- T331 (dinhlanphuongipacc, tách vùng xếp hạng, danh sách quỹ tên trái tiền phải) xong thì đồng bộ tiếp sang app.

## Bẫy, quyết định mới

- Không.
