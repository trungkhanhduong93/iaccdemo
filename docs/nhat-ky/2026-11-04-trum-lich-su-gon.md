# Lịch sử phiếu bản gọn (T732)

- Ngày: 04/11/2026
- Người: Trum, agent: Claude Code điều phối, Antigravity code
- Trạng thái cuối phiên: Xong

## Đã làm

- Vẽ bản gọn trên artifact, Trum duyệt. Lưu bản thiết kế ở `docs/thiet-ke/T732-lich-su-gon.html`.
- `src/ui/mobile/MLichSu.tsx`: thêm `duKien` cho `DongLichSu`, `chenh` cho `TruongDoi`, đổi dữ liệu mẫu, vẽ lại thẻ app.
- `src/ui/generic/ChungTuForm.tsx` hàm `LichSu`: vẽ lại thẻ web, lớp `ls-g-*`.
- `src/styles/app.css`: rút mục T715 còn phần đang dùng, thêm mục T732 cuối file.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- `python tools/kiem_van.py` cho `MLichSu.tsx`, `ChungTuForm.tsx`: 0 ĐỎ.
- Playwright gói S, phiếu chi `#/app/tien/2-1-1/chi-3`, web 1440x900 và app 390x844: 3 thẻ, thẻ Sửa 4 hàng và dải Lý do, không còn nhãn Người làm, Thời điểm, Nội dung.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- QD94 trong `docs/QUYET-DINH.md`.
- Không đặt class `tot`, `up`, `down` trần trong mục mới: `app.css` dòng 236 có `.tot` dùng chung (grid canh phải), đè lên hàng Tổng tiền. Đã đổi sang `ls-g-tot`, `m-ls-tot`.
