# Màn Tính giá vốn xuất kho theo bản vẽ (T770)

- Ngày: 07/11/2026
- Người: Trum, agent: Claude Code điều phối; Antigravity 2 worker, OpenCode 1 worker
- Trạng thái cuối phiên: Xong

## Đã làm

- Bản vẽ gốc: https://claude.ai/artifact/KNxBSWT9Jkkoy8nx47ZewM.
- `src/modules/kho/tinh-gia-von/du-lieu.ts`: dữ liệu giả 4 kho, 5 nhóm, 18 mặt hàng; sinh bảng giá vốn cố định theo tháng; lý do lỗi mẫu (âm kho, chưa có đơn giá, đơn vị tính chưa quy đổi, phiếu nhập số lượng âm).
- `src/ui/ChonThang.tsx`: ô chọn tháng dạng lưới 12 tháng, khoá tháng sau tháng hiện tại. Dùng chung được cho màn khác.
- `src/modules/kho/tinh-gia-von/TinhGiaVon.tsx`: màn danh sách kho/5-1-7. Thanh lọc như Xuất khác (phễu, Thời gian, Tìm, Lọc; Kho, Nhóm, Hàng trong Bộ lọc nâng cao). Bảng 2 tầng Đầu kỳ (I, đơn giá, II), Nhập trong kỳ (III, IV), Giá vốn = (II + IV) ÷ (I + III), dòng Cộng, xuất Excel.
- `src/modules/kho/tinh-gia-von/TinhGiaVonModal.tsx`: modal chọn Kho, Thời gian, Nhóm, Hàng; Chạy tính giá có tiến trình, Huỷ giữa chừng; kết quả đếm thành công, lỗi, nút Xem mã lỗi.
- `src/modules/kho/tinh-gia-von/DsMaLoiGiaVon.tsx`: modal danh sách mã lỗi (Mã hàng, Tên hàng, Kho, Lý do lỗi), xuất Excel.
- `src/modules/kho/index.ts`: dòng 5.1.7 đổi từ màn công cụ sang màn riêng.
- `src/styles/app.css`: mục cuối T770. Đổi tên lớp worker đặt trùng lớp có sẵn: `.phu` thành `.tgv-phu`, `.hop` thành `.tgv-hop`, `.ct-goi-y` thành `.cthang-goi-y`; `.ds-hang-trang-thai` gói trong `.page-gia-von`.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- `python tools/kiem_van.py` cho 4 file .tsx có chữ: sạch.
- Bấm thử bằng Playwright (`backup/smoke_t770.py`, không commit): bảng 50 dòng trang 1; chạy 72 mã ra 66 thành công, 6 lỗi; Xem mã lỗi ra 6 dòng; Chạy lại rồi Huỷ ở 12/72 ra khung đã huỷ; không lỗi trang.

## Dở dang, việc tiếp theo

- Không.
- Hai điều tự giả định trên bản vẽ, Trum chưa chốt: Huỷ thì giữ nguyên đơn giá như trước lần chạy; mã lỗi giữ đơn giá cũ, mã thành công vẫn cập nhật.

## Bẫy, quyết định mới

- Không.
