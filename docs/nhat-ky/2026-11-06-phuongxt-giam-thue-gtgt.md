# Cấu hình giảm thuế GTGT theo nghị quyết (T754)

- Ngày: 06/11/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `giam-thue.ts`: cấu hình giảm thuế của đơn vị (có giảm, nghị quyết, % giảm), danh sách 6 nghị quyết giảm 20% mức tỷ lệ (43/2022 tới 204/2025), tỷ lệ % GTGT ngầm định theo hàng, `giamThueHang(dt, ma)` tính từng dòng. `giamThueHkd` (tính trên tổng) giờ theo cấu hình, tắt giảm thì 0.
- `session.tsx`: thêm `giamVat`, `hangGiamVat` theo đơn vị; SessionProvider gọi `datGiamVat` như kiểu chữ số T710.
- `HeThong.tsx` (CauHinh): thẻ Giảm thuế GTGT chỉ hiện khi GTGT theo % doanh thu (hộ kinh doanh, doanh nghiệp chọn % doanh thu). Nút bật tắt, chọn nghị quyết, ô % giảm, hiệu lực chỉ đọc. Lưu cùng nút Lưu.
- `truong-dm.ts`, `danh-muc/index.ts`: ô tích "Giảm thuế theo quy định" ở khối Thông tin thuế của hàng hoá (TT152 và TT58 % doanh thu), chỉ hiện khi cấu hình bật, không bắt buộc. Lưu theo đơn vị qua `phien`. Hàng mẫu tích sẵn trừ bia (chịu thuế TTĐB) và nguyên vật liệu.
- `ChungTuForm.tsx`, `BangSua.tsx`, `BangHangBan.tsx`: tiền giảm thuế từng dòng = doanh thu tính thuế × % GTGT của hàng × % giảm, hàng không tích thì 0.
- CSS cuối `app.css` mục T754.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- Mở bản trên máy: thẻ Giảm thuế GTGT hiện ở Cấu hình kế toán; form BIA01 có ô tích, không tích sẵn.
- `kiem_van.py` 3 file có chữ mới: không mục ĐỎ.
- `xuat_bao_cao_he_thong.py` không chạy được: máy thiếu `../Present/tools/build_present.py`, Excel chưa làm mới.

## Dở dang, việc tiếp theo

- Danh sách chứng từ, báo cáo bán hàng, chi tiết Xuất bán POS không có từng mã hàng nên vẫn tính giảm trên tổng (tỷ lệ ăn uống × % giảm), chưa trừ hàng không tích. Chứng từ có bia có thể lệch nhẹ giữa danh sách và form.
- Chưa có ngày hiệu lực chặn theo ngày chứng từ: bật là giảm cho mọi ngày. PhuongXT, Trum xem có cần không.
- Màn điện thoại (`MXuatBanPos.tsx`) chưa đổi.

## Bẫy, quyết định mới

- QD97 trong `docs/QUYET-DINH.md`.
