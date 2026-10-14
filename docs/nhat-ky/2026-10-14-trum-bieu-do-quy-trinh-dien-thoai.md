# Biểu đồ trang chủ và sơ đồ quy trình trên điện thoại (T235, T236)

- Ngày: 14/10/2026
- Người: Trum, agent: Claude Code điều phối và kiểm, Antigravity Windows (Anti A) code T235 và gộp, kiểm T236, Antigravity WSL (Anti B) code T236
- Trạng thái cuối phiên: T235 Xong, T236 Xong

## Đã làm

T235, trang chủ điện thoại có các biểu đồ của màn Tổng quan bản web:

- `src/ui/mobile/MTrangChu.tsx`: gói khác Free, tab Quản trị thêm 6 thẻ sau thẻ Tổng quan tài chính: Thác nước lợi nhuận, Xu hướng kinh doanh 4 tháng, Dòng tiền kỳ, Hiệu quả theo chi nhánh, Cơ cấu chi phí, Món bán chạy. Số lấy từ `tinhToanTongQuan` như bản web, đổi theo chip chi nhánh. Ba ô chỉ số có đường nhỏ, ô Phải thu không có dữ liệu nên để trống. Nút Chi tiết của thẻ tài chính cuộn xuống thẻ Thác nước. Gói Free giữ nguyên.
- `src/ui/Charts.tsx`: `WaterfallChart`, `CostStructureChart` thêm prop tuỳ chọn `compact` (nhãn ngắn, chú thích 1 cột). Mặc định tắt, bản web không đổi.

T236, sơ đồ quy trình điện thoại:

- `src/ui/mobile/MNghiepVu.tsx`: bấm ô nghiệp vụ mở thẳng sơ đồ quy trình, đầu màn có hai nút "Quy trình | Tất cả", "Tất cả" là danh sách màn như cũ, lưu trên URL `&xem=ds`. Phân hệ không có sơ đồ thì chỉ hiện danh sách.
- `src/ui/mobile/MQuyTrinh.tsx`: vẽ lại theo dòng thời gian dọc, mỗi bước một thẻ có vòng số, bước có từ 2 chứng từ xếp lưới 2 cột. Ẩn chứng từ ngoài gói ở mọi gói (trước chỉ ẩn ở gói Free, gói khác hiện ổ khoá), áp cả luật T194. Bước hết chứng từ thì bỏ, đánh số lại. Bấm chứng từ vào danh sách chứng từ đó. Export `layDsBuoc` cho `MNghiepVu` dùng.
- `src/styles/app.css`: mục T235, T236; xoá 19 lớp `m-qt-*` cũ không còn dùng.
- `tools/kiem_tra.py`: `kiem_tra_dot_18_a`, `kiem_tra_dot_18_b` gọi trong `--dien-thoai`; sửa hai bước kiểm cũ chọn theo lớp `m-qt-*` sang lớp mới.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_tra.py --nhanh` (cổng 5181): in `Không có lỗi.`
- `kiem_tra_dot_18_a()`, `kiem_tra_dot_18_b()`: 0 lỗi.
- `--dien-thoai` (Anti A chạy): chỉ còn lỗi đã biết của T234.
- Anti A xem ảnh `tools/shots/m-18-*.png`, `w-18-tong-quan.png`. Claude chưa tự xem ảnh.

## Dở dang, việc tiếp theo

- Chưa thử trên điện thoại thật.
- T234 vẫn chờ: hai màn Chi phí trong tháng, Lịch sử thu chi chưa có bản điện thoại.

## Bẫy, quyết định mới

- Anti B (WSL) không chạy được npm, python và không xem được ảnh. Cách đã dùng: Anti B ghi CSS và hàm kiểm ra file nháp trong `backup/`, sau đó Anti A gộp vào `app.css`, `kiem_tra.py`, chạy kiểm, xem ảnh. Hai worker không sửa chung file.
