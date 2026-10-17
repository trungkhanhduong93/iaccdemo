# Màn Nghiệp vụ điện thoại, lọc báo cáo điện thoại, icon nhỏ (T310, T311, T312, T313)

- Ngày: 17/10/2026
- Người: Trum, agent: Claude Code điều phối, Antigravity viết code
- Trạng thái cuối phiên: Xong

## Đã làm

- T311: `src/ui/mobile/MNghiepVu.tsx` đổi lưới 3 cột thành khối Lập nhanh 4 nút và danh sách thẻ phân hệ. Mỗi thẻ có tối đa 3 chip mở thẳng màn. CSS ở mục T311 cuối `app.css`.
- T312: `src/ui/mobile/MSoBaoCao.tsx` chip Thời gian, Kho/CN đổi thành thẻ chỉ hiển thị, bỏ 2 sheet `MChon`.
- T313: `src/ui/mobile/MBaoCaoLoc.tsx` thay danh sách kỳ bằng Tháng này, Tháng trước và 2 ô Từ ngày, Đến ngày kiểu `input type="date"`. File mới `src/ui/mobile/kyBaoCaoMobile.ts` giữ khoảng ngày theo từng báo cáo và định dạng nhãn kỳ.
- T310: đổi px cứng của icon sang biến `--ic-sm`, `--ic` trong `app.css`, `LichSuQuy.tsx`. Đổi `ic xs` thành `ic sm` ở `MTrangChu.tsx`, `MHeThong.tsx`.

## Đã kiểm

- `npm run typecheck`, `npm run build`: chạy xong, không lỗi.
- `python tools/kiem_tra.py --nhanh`: in `Không có lỗi.`
- `python tools/kiem_van.py` cho 3 file điện thoại và `docs/QUYET-DINH.md`: 0 ĐỎ.
- Chụp màn Nghiệp vụ gói Free, Pro và Sổ quỹ tiền mặt ở 400x840: thẻ cuối không bị thanh dưới che, chip không còn mũi tên.

## Dở dang, việc tiếp theo

- Không.
- Hạn chế đã biết: dữ liệu mẫu tính theo tháng. Chọn 05/09 đến 20/09 thì nhãn hiện đúng khoảng ngày nhưng số liệu vẫn là cả tháng 9, giống bản máy tính.

## Bẫy, quyết định mới

- Ghi QD68 vào `docs/QUYET-DINH.md`: bố cục màn Nghiệp vụ, chip lọc chỉ hiển thị, chọn ngày trong bộ lọc.
