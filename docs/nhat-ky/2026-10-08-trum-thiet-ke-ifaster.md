# Đổi ngôn ngữ thiết kế theo iFaster, thay logo (T26)

- Ngày: 08/10/2026
- Người: Trum, agent: Claude Code điều phối, Antigravity (gemini-3.8-flash-high) sửa code
- Trạng thái cuối phiên: Xong

## Đã làm

- Xem ifaster.ipos.vn bằng Playwright, chỉ xem, không lưu dữ liệu. Đo màu, cỡ chữ, bo góc của sidebar, nút, tab, bảng, thẻ.
- `tools/xuat_logo_acc.py`: xuất logo Accounting Powered by iPOS.vn từ `D:\trum\iPOS-ACC-Present\logo acc.png` ra 3 file trong `src/assets/` (bản màu, bản chữ trắng, chữ A) và `public/favicon.png`.
- `src/styles/app.css`: đổi biến `:root` sang màu iFaster, thêm `--navy-d`, `--sb-on`, `--th`. Sidebar xám đen, mục đang chọn là khối xanh sáng. Tab chữ thường 14px. Đầu bảng nền xanh nhạt, bỏ viết hoa. Thẻ bỏ viền và bóng. Chữ thân 14px.
- `src/ui/Logo.tsx`: `Logo` nhận `cao` và `nen` (`sang` hoặc `toi`), thêm `DauLogo` cho chữ A.
- `src/app/Shell.tsx`: sidebar mở hiện logo chữ trắng, thu gọn hiện chữ A.
- `Login.tsx`, `ChonDonVi.tsx`, `KhoiTao.tsx`: thay logo cũ kèm chữ "IACC Cloud" bằng logo mới. Vòng giữa màn đăng nhập giữ chữ "IACC Cloud".
- `docs/QUYET-DINH.md`: thêm QD15, ghi QD12 đã được thay phần thiết kế.

## Đã kiểm

- `npm run typecheck`: không lỗi.
- `npm run build`: chạy xong. Còn cảnh báo gói JS hơn 500 kB, đã có việc T13.
- `python tools/kiem_tra.py --nhanh`: 207 lượt mở màn, in `Không có lỗi.`
- Chụp và xem bằng mắt: đăng nhập, Bàn làm việc, sidebar thu gọn, danh mục tài khoản, danh sách chứng từ 2.1.1, form chi qua ngân hàng.
- Chưa kiểm 3 gói F, S, A bằng `kiem_tra.py` bản đầy đủ.

## Dở dang, việc tiếp theo

- Không.
- Biểu đồ (`src/ui/Charts.tsx`, `TongQuan.tsx`) còn màu viết cứng theo bộ màu cũ, chưa đổi.

## Bẫy, quyết định mới

- QD15 trong `docs/QUYET-DINH.md`.
- Gặp lỗi dữ liệu cũ ngoài phạm vi, đã ghi thành T27 trong `docs/TIEN-DO.md`.
