# Làm lại màn Chi phí NVL, Chi phí hoạt động theo artifact (T945)

- Ngày: 26/11/2026
- Người: Trum, agent: Claude Code điều phối, 2 Antigravity (gemini-4-hydrogen-high)
- Trạng thái cuối phiên: Xong

## Đã làm

- Trum duyệt thiết kế trên artifact https://claude.ai/artifact/H3fsL7ZzrZGsayd1kJWpjS (8 khung: Chi phí NVL kiểm kê định kỳ, có cửa hàng chưa kiểm kê, tổng mua trong tháng; Chi phí hoạt động; mỗi màn máy tính và điện thoại).
- Claude viết `src/modules/home/TheTongChiPhi.tsx` và CSS `.ttcp*`: thẻ tổng dùng chung, số to, % trên doanh thu, mục Cách tính gồm ô cố định. Điện thoại xếp dòng, dấu + − một cột riêng. Thay CSS, thành phần của T944 (`TheCongThucNvl.tsx` đã xoá).
- Anti A, Chi phí NVL: `chi-phi-nvl.ts` luôn tính chi phí theo NXT, cửa hàng chưa kiểm kê chỉ gắn cờ `chuaKk` (QD118). `ChiPhiNvl.tsx`, `MChiPhiNvl.tsx`: thẻ tổng mới, bảng không thanh tỷ lệ, chip Chưa kiểm kê; dải cảnh báo Bỏ qua, Xem chi tiết; hộp liệt kê cửa hàng chưa kiểm kê kèm nút Kiểm kê ngày cuối tháng; phương pháp tổng mua chỉ 4 cột. Bỏ `HopChotTonHt` khỏi 2 màn này.
- Anti B, Chi phí hoạt động: `ChiPhiThang.tsx`, `MChiPhiThang.tsx`: thẻ tổng Chi tiền mặt + Chi ngân hàng + Số lý do chi; bảng Lý do chi, Số phiếu chi, Số tiền, 2 cột tỷ lệ, dòng Cộng; bấm dòng vẫn mở phiếu chi bên dưới.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi. Không có `as any`, `@ts-ignore` trong dòng mới.
- Anti chạy `kiem_van.py` 4 file tsx: 0 ĐỎ.
- Playwright gói Standard: Chi phí NVL tháng 9 máy tính khớp mẫu; Chi phí hoạt động tháng 10 khớp mẫu, tiền mặt 35.641.000 + ngân hàng 25.619.000 = 61.260.000.
- Cảnh báo chưa kiểm kê: dữ liệu mẫu không tháng nào hiện được (tháng 7, 8 đã khoá sổ, tháng 9 đủ phiếu). Sửa tạm `cnChuaKiemKe`, `canKiemKeCuoiThang` để xem: dải, hộp máy tính, tấm điện thoại đúng mẫu. Đã hoàn lại file.
- `python tools/kiem_tra.py --nhanh`: dừng ở mục Thẻ kho (T933, có sẵn). Các mục trước không báo lỗi.

## Dở dang, việc tiếp theo

- Không. `HopChotTonHt.tsx` còn dùng ở Khoá sổ (`KhoaSoStandard.tsx`, `MKhoaSo.tsx`), giữ nguyên.

## Bẫy, quyết định mới

- QD118 (đã ghi khi duyệt thiết kế).
- Dữ liệu mẫu không có tháng nào vừa chưa khoá sổ vừa thiếu phiếu kiểm kê, nên cảnh báo chưa kiểm kê không xem được trên bản demo nếu không sửa tạm dữ liệu.
