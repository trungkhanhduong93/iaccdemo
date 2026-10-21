# Hộp Tuỳ chỉnh báo cáo theo mẫu A, gom nhóm 3 cấp (T587)

- Ngày: 21/10/2026
- Người: Trum, agent: Claude Code điều phối, Antigravity viết code
- Trạng thái cuối phiên: Xong

## Đã làm

- Vẽ 3 phương án tab Cột trên canvas Design, Trum chốt mẫu A. Vẽ thêm 3 tab còn lại. Canvas: https://claude.ai/artifact/6q5LaL5Zghrx149Z2nrbh3
- `src/ui/bao-cao/DsCotNhom.tsx` (mới): tab Cột gom theo `Col.nhom` (tiêu đề 2 tầng). Có ô tìm cột, đếm số cột đang hiện, nút Hiện tất cả, ô tick nhóm 3 trạng thái, thu gọn nhóm. Rê chuột hiện nút đổi tên, nút lên, xuống. Kéo nhóm thì cả nhóm đổi chỗ.
- `src/ui/bao-cao/tuyChinhBC.ts`: gom nhóm viết lại thành hàm đệ quy, tối đa 3 cấp, cho cả Chi tiết lẫn Tổng hợp. Cấp 3 mang `_i: 2`. Kết quả 1 và 2 cấp giữ nguyên cờ `_b`, `_i`, `_t`, `_nhom`.
- `src/ui/bao-cao/TuyChinhBC.tsx`: tab Gom nhóm có 3 hàng nút chọn cấp, nút Chi tiết / Tổng hợp. Tab Người ký có nút "Dùng chung mọi báo cáo / Riêng báo cáo này" và khung xem trước chân trang. Tab Trang có dãy nút cỡ chữ.
- `src/ui/thiet-ke/DsKy.tsx`: thêm prop `kieu` (`'the'` mặc định, `'dong'`). Màn Thiết kế mẫu in không truyền prop nên giữ giao diện cũ.
- `src/styles/app.css`: mục mới cuối file (T587), có lớp thụt `i2`.

## Đã kiểm

- `npm run typecheck`, `npm run build`: chạy xong, không lỗi.
- `python tools/kiem_tra.py --nhanh`: `Không có lỗi.`
- `python tools/kiem_van.py` cho `TuyChinhBC.tsx`, `DsCotNhom.tsx`, `DsKy.tsx`: sạch.
- Anti báo đã chạy Playwright trên báo cáo 3.2.8, gom 3 cấp đúng ở cả Chi tiết và Tổng hợp. Claude chưa tự mở trình duyệt để xem.
- Claude tự đọc diff `tuyChinhBC.ts` và phần đổi thứ tự của `DsCotNhom.tsx`. Không chạy review chéo bằng Anti thứ hai: worker review kẹt ở bước đăng nhập ("not signed in").

## Dở dang, việc tiếp theo

- Không.
- Ca biên còn để ngỏ: trong `DsCotNhom.tsx`, kéo cột thông tin hoặc kéo nhóm thì mọi cột không thuộc nhóm dồn lên trước các nhóm. Báo cáo có cột thường đứng sau nhóm cột sẽ bị đổi chỗ cột đó. Hiện chưa thấy báo cáo nào như vậy.
- Báo cáo xuất nhập tồn chưa khai `nhomDuoc`, nên tab Gom nhóm của báo cáo này vẫn báo không hỗ trợ.

## Bẫy, quyết định mới

- Không.
