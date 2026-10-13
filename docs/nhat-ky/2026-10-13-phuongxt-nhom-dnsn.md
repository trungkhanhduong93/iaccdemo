# Chọn 4 nhóm doanh nghiệp siêu nhỏ TT58 (T174)

- Ngày: 13/10/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/modules/bao-cao/tt58.ts`: thêm `NHOM_DNSN`, 4 nhóm theo cách nộp thuế (1: GTGT, TNDN tỷ lệ % doanh thu; 2: GTGT tỷ lệ %, TNDN thu nhập tính thuế; 3: GTGT khấu trừ, TNDN tỷ lệ %; 4: GTGT khấu trừ, TNDN thu nhập tính thuế). `moTaBoSoTT58` ghi gọn danh sách sổ, bỏ chữ "Trường hợp".
- `src/modules/onboarding/OnboardFabi.tsx`: bước 1 popup khởi tạo, chọn Doanh nghiệp gói Standard (TT58) thì hiện "Doanh nghiệp siêu nhỏ thuộc nhóm nào?" với 4 nhóm, mỗi nhóm ghi bộ sổ. Mặc định Nhóm 2. Lưu `ppGtgt`, `ppTndn` vào phiên khi hoàn tất.
- `src/modules/he-thong/HeThong.tsx`: Thông tin đơn vị, doanh nghiệp chế độ TT58 thay hai ô Phương pháp thuế GTGT, TNDN bằng ô Nhóm doanh nghiệp siêu nhỏ, dưới ô ghi bộ sổ. Doanh nghiệp chế độ khác giữ như cũ.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- Bản chạy thử: popup khởi tạo hiện 4 nhóm, bấm Nhóm 3 lưu `khauTru`, `tyLe`. Thông tin đơn vị gói Standard đổi sang Nhóm 4, Lưu thì phiên có `khauTru`, `thuNhap`. Đã trả phiên thử về Phố Mây gói Plus.
- `python tools/kiem_van.py` 3 file đã sửa: sạch.

## Dở dang, việc tiếp theo

- Không.
- Ảnh PhuongXT gửi ghi bộ sổ nhóm 2 là S2a (sổ chi tiết tiền và tài sản), S2d (sổ TSCĐ), khác với phần mềm đang làm theo T108 (S2a sổ doanh thu theo dõi GTGT, S2d sổ chi tiết tiền, S4b sổ TSCĐ). Chưa đổi, chờ đối chiếu văn bản TT58 gốc (T04).

## Bẫy, quyết định mới

- Không.
