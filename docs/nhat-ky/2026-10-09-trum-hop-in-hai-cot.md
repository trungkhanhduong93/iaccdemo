# Hộp in chứng từ 2 cột, sửa dính tiêu đề bảng (T56)

- Ngày: 09/10/2026
- Người: Trum, agent: Claude Code điều phối, Antigravity viết code
- Trạng thái cuối phiên: Xong

## Đã làm

- Làm lại bản Anti chưa commit trên nền T55 của PhuongXT. Bản gốc cất ở `git stash` tên `anti-design-truoc-T56`.
- Bỏ phần thanh trên báo cáo và chế độ xem kép của bản Anti: trùng T55, trái QD36 (xem một tờ liền), làm mất bộ lọc riêng từng báo cáo của T47. Bỏ luôn phần sửa `Screen.tsx`, `ReportScreen.tsx`, `SoQuy.tsx`, `XuatNhapTon.tsx`, `BaoCaoTaiChinh.tsx`.
- Màn xem báo cáo còn một nút In trên thanh công cụ, nút In ở thanh dưới tờ giấy đã bỏ từ T55.
- `InChungTu.tsx`: hộp in chứng từ chia 2 cột. Trái chọn mẫu (thẻ), đơn vị và người ký, nút Thiết kế mẫu in hoặc Sửa nhanh khổ và người ký. Phải xem trước tờ in. Đầu hộp: Xuất PDF, In, Đóng.
- `app.css`: dính tiêu đề và hàng lọc bảng danh sách chứng từ khi cuộn (hàng lọc cao 36px, z-index tiêu đề 10 và 20). CSS hộp in gom ở mục `Hộp in chứng từ 2 cột (T56)` cuối file. Xoá luật `.in-ct-than`, `.in-ct-chon-mau` không còn dùng.
- `ToKhaiGTGT.tsx`: nút In trên đầu Tờ khai GTGT gọi hộp in, trước đó bấm không có tác dụng.

## Đã kiểm

- `npm run typecheck`: không lỗi.
- `npm run build`: chạy xong, không lỗi.
- `python tools/kiem_tra.py --nhanh`: 233 lượt mở màn, `Không có lỗi.` (Windows cần `PYTHONIOENCODING=utf-8`, không thì script lỗi in tiếng Việt).
- `python tools/kiem_van.py src/ui/bao-cao/InChungTu.tsx`: sạch.
- Chưa xem bằng mắt hộp in ở khổ hẹp dưới 900px.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- Không. Lưu ý khi đặt class mới cho hộp in: `.in-ct-ky`, `.in-ct-tt` đã dùng cho tờ in, đặt trùng thì đè lên khối chữ ký khi in.
