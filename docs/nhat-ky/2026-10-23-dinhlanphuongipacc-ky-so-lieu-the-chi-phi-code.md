# Điện thoại, danh sách thẻ chi phí theo Kỳ số liệu: sửa code (T645)

- Ngày: 23/10/2026
- Người: dinhlanphuongipacc, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- Làm theo đặc tả đã duyệt trong [nhật ký trước](2026-10-23-dinhlanphuongipacc-ky-so-lieu-the-chi-phi.md), mẫu bản 6.
- `src/ui/mobile/MLoc.tsx`: thêm prop `kyThang` (danh sách tháng, tháng mặc định) và 2 trường `ky`, `anHet` trong `GtLocMobile`. Có `kyThang` thì dòng Thời gian thành Kỳ số liệu, bấm mở tấm `MChon` "Chọn kỳ số liệu" (tháng mới ở trên, tháng mặc định có chữ "Tháng hiện tại"), thêm dòng công tắc Ẩn thẻ hết phân bổ. Đặt lại đưa kỳ về tháng mặc định, bật lại công tắc. Màn khác không truyền `kyThang` nên không đổi.
- `src/ui/mobile/MDsChungTuChuan.tsx`: thêm prop `nhanDem` (mặc định "chứng từ"), `nhanTong` (mặc định "Tổng cộng"), `theTongThem` (hàng thêm trong thẻ tổng). Chữ "Danh sách chứng từ" lấy theo `nhanDem`. Màn khác không đổi.
- `src/ui/mobile/MCcdc.tsx`: bỏ `kyHienTai = 202610` để cứng, kỳ lấy từ bộ lọc, mặc định `kyMacDinh(s)`, danh sách tháng `dsKyNam(s)`. Ẩn thẻ ghi tăng sau kỳ. Mỗi thẻ tính `kyNay` (phân bổ trong kỳ, như web `ccdc/index.ts`), `con`, `ngayPb` (ngày bắt đầu phân bổ sớm nhất). Công tắc bật thì giữ thẻ `kyNay > 0 || con > 0`. Chip `Tháng mm/yyyy`. Thẻ tổng: "N thẻ", "Kỳ tháng mm/yyyy", Tổng giá trị, Phân bổ tháng này (tháng khác thì "Phân bổ tháng mm/yyyy"), Giá trị còn lại. Từng thẻ: bỏ "Còn ..." ở dòng tên, thêm dòng `Ghi tăng ... · PB từ ...`, khối Phân bổ tháng này, Còn lại ở dưới.
- `src/styles/app.css`: mục cuối file `/* ── Danh sách thẻ chi phí điện thoại theo kỳ số liệu (T645) ── */`.
- Theo yêu cầu sau khi push: bỏ nền cam ở khối Phân bổ tháng này, Còn lại của từng thẻ (`.m-cp645-so`).

## Đã kiểm

- `npm run typecheck`: không lỗi.
- `npm run build`: chạy xong, không lỗi.
- `python tools/kiem_tra.py --nhanh` (máy chủ `npm run dev` cổng 5180): `Không có lỗi.`
- `python tools/kiem_van.py` cho `MCcdc.tsx`, `MLoc.tsx`, `MDsChungTuChuan.tsx`, `app.css`: sạch.
- Mở `/app/ccdc/8-1-1` cỡ 375px, gói Plus: tháng 10/2026 có 9 thẻ, ẩn thẻ ghi tăng 05/11/2026 và thẻ đã phân bổ xong. Chọn tháng 09/2026, tắt công tắc: ẩn thẻ tháng 10, hiện thêm thẻ đã xong, nhãn thành "Phân bổ tháng 09/2026". Đặt lại về tháng 10, công tắc bật. Trang không tràn ngang.
- `python tools/xuat_bao_cao_he_thong.py` không chạy được: máy này thiếu module `build_present`. Báo cáo Excel chưa làm mới.

## Dở dang, việc tiếp theo

- Không. Bản máy tính chưa làm, chờ người dùng gửi ảnh yêu cầu rồi làm việc mới.
- Trum giữ `MCcdc.tsx`, `app.css` ở T552: ai push sau gộp tay.

## Bẫy, quyết định mới

- Không.
