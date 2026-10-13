# Chọn 4 nhóm doanh nghiệp siêu nhỏ TT58 (T174)

- Ngày: 13/10/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong (bỏ chia nhóm, chỉ giữ việc chuyển ô Thông tư áp dụng)

## Đã làm

- Cuối phiên PhuongXT bỏ việc chia 4 nhóm TT58, sẽ tìm cách khác. Đã trả `tt58.ts`, `HeThong.tsx`, `OnboardFabi.tsx` về bản trước T174 (commit 9b470fd), Sau đó PhuongXT giữ lại một việc: ô Thông tư áp dụng ở `HeThong.tsx` chuyển lên card Thông tin kê khai, cạnh ô Loại hình; doanh nghiệp gói Standard chỉ hiện TT58, ô khoá không sửa (gói Standard có TT152 chỉ cho hộ kinh doanh); doanh nghiệp gói Free, Standard chọn được Phương pháp thuế TNDN kể cả khi GTGT khấu trừ (trước khoá ở theo lợi nhuận), gói Plus, Pro vẫn cố định. Các dòng dưới là phần đã làm rồi bỏ.

- `src/modules/bao-cao/tt58.ts`: thêm `NHOM_DNSN`, 4 nhóm theo cách nộp thuế (1: GTGT, TNDN tỷ lệ % doanh thu; 2: GTGT tỷ lệ %, TNDN thu nhập tính thuế; 3: GTGT khấu trừ, TNDN tỷ lệ %; 4: GTGT khấu trừ, TNDN thu nhập tính thuế). `moTaBoSoTT58` ghi gọn danh sách sổ, bỏ chữ "Trường hợp".
- `src/modules/onboarding/OnboardFabi.tsx`: bước 1 popup khởi tạo, chọn Doanh nghiệp gói Standard (TT58) thì hiện "Doanh nghiệp siêu nhỏ thuộc nhóm nào?" với 4 nhóm, mỗi nhóm ghi bộ sổ. Mặc định Nhóm 2. Lưu `ppGtgt`, `ppTndn` vào phiên khi hoàn tất.
- `src/modules/he-thong/HeThong.tsx`: Thông tin đơn vị, doanh nghiệp chế độ TT58 thay hai ô Phương pháp thuế GTGT, TNDN bằng ô Nhóm doanh nghiệp siêu nhỏ, dưới ô ghi bộ sổ. Doanh nghiệp chế độ khác giữ như cũ. Ô Thông tư áp dụng chuyển từ card Chế độ kế toán lên card Thông tin kê khai, cạnh ô Loại hình.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- Bản chạy thử: popup khởi tạo hiện 4 nhóm, bấm Nhóm 3 lưu `khauTru`, `tyLe`. Thông tin đơn vị gói Standard đổi sang Nhóm 4, Lưu thì phiên có `khauTru`, `thuNhap`. Đã trả phiên thử về Phố Mây gói Plus.
- `python tools/kiem_van.py` 3 file đã sửa: sạch.

## Dở dang, việc tiếp theo

- Không.
- Ảnh PhuongXT gửi ghi bộ sổ nhóm 2 là S2a (sổ chi tiết tiền và tài sản), S2d (sổ TSCĐ), khác với phần mềm đang làm theo T108 (S2a sổ doanh thu theo dõi GTGT, S2d sổ chi tiết tiền, S4b sổ TSCĐ). PhuongXT xác nhận phần mềm đúng, theo danh sách biểu mẫu TT58 ở https://thuvienphapluat.vn/hoi-dap-phap-luat/toan-bo-bieu-mau-thong-tu-582026ttbtc-bieu-mau-ke-toan-cho-doanh-nghiep-sieu-nho-tu-01072026-nhu-th-138091871.html. Giữ nguyên.

## Bẫy, quyết định mới

- Không.
