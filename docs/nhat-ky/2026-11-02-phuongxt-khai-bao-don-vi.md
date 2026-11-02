# Khai báo đơn vị: nhóm HKD, phương pháp thuế (T138)

- Ngày: 02/11/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Dở dang (T138 còn việc khác)

## Đã làm

- `src/modules/onboarding/OnboardFabi.tsx`: popup Thêm đơn vị kế toán (`haiBuoc`) đổi tiêu đề thành "Khai báo đơn vị". Bước 1, dưới loại hình thêm ô chọn như Thông tin đơn vị: hộ kinh doanh có Nhóm doanh thu, Phương pháp thuế TNCN (nhóm 1, 3, 4 khoá); doanh nghiệp có Phương pháp thuế GTGT, TNDN. Ngoài phần gói đang dùng kê khai được thì hiện cảnh báo nâng cấp (dùng `ngoaiGoi`).
- Bấm đồng bộ: lưu `nhom`, `ppHkd` vào `ttDv`; doanh nghiệp lưu `ppGtgt`, `ppTndn` (gói Standard giữ `tyLe`, như popup kê khai thuế).
- Popup Thông tin kê khai thuế điền sẵn nhóm, cách tính thuế đã khai.
- `src/styles/app.css`: mục cuối `.ktf-pp`.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- `python tools/kiem_van.py src/modules/onboarding/OnboardFabi.tsx`: Sạch.
- Chưa bấm thử trên trình duyệt.

## Dở dang, việc tiếp theo

- Không với phần này. Các mục dở của T138 ở nhật ký trước vẫn còn.

## Bẫy, quyết định mới

- Không.
