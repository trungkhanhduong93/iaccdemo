# Bỏ báo cáo, chỉ giữ sổ quỹ, sổ ngân hàng và bộ sổ TT58 (T171)

- Ngày: 13/10/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/modules/bao-cao/danh-sach.ts`: thêm `giuBC`. Mọi chế độ chỉ giữ Sổ quỹ tiền mặt 2.2.1, Sổ ngân hàng 2.2.3; TT58 giữ thêm 2.2.5, 2.2.7, 3.2.5, 5.2.8, 6.2.4, 6.2.5, 7.2.1, 10.2.2, 10.2.3, 10.4.1, 10.4.2. Bỏ `anTam` của 2.2.1, 2.2.3 để hai sổ này hiện ở mọi gói, mọi thông tư.
- `src/app/registry.ts`: `apDung` lọc theo `giuBC`, bỏ lọc theo trường hợp thuế TT58 (gói Standard thấy đủ 13 mẫu). `hienMan` ẩn tab Báo cáo của phân hệ và nhóm báo cáo ở phân hệ Báo cáo khi không còn báo cáo nào; Tất cả báo cáo luôn hiện.
- `src/app/Screen.tsx`: mở thẳng địa chỉ báo cáo đã bỏ thì hiện "Báo cáo không còn dùng".
- `src/modules/bao-cao/TrungTam.tsx`: chip "Gói đang dùng mở x/y báo cáo" không đếm báo cáo đã bỏ.
- `src/ui/generic/QuyTrinhScreen.tsx`: khung Báo cáo trên sơ đồ chỉ liệt kê báo cáo còn hiện; báo cáo khai sẵn bị bỏ hết thì lấy báo cáo còn hiện của phân hệ, không còn thì ẩn khung.
- `src/ui/generic/ReportScreen.tsx`: Sổ doanh thu 3.2.5 ở TH4 dùng mẫu S2a thay cho dòng báo không mở sổ.
- `src/modules/kho/XuatNhapTon.tsx`: gọi `apDung` theo chữ ký mới.
- `tools/kiem_tra.py`: hạ ngưỡng số màn tối thiểu của gói Standard, Plus, Pro từ 125 xuống 110 vì đã bỏ báo cáo.
- `docs/KIEN-TRUC.md`: ghi quy ước báo cáo còn dùng.
- `tools/xuat_bao_cao_he_thong.py`: sheet Báo cáo & Mẫu in đọc danh sách giữ lại và ký hiệu TT58 từ `danh-sach.ts` (hàm `doc_bao_cao_giu`), thêm cột Còn dùng (T171) (Còn dùng mọi gói, Còn dùng chỉ TT58, Đã ẩn), thêm 4 sổ TT58 còn thiếu (6.2.4, 6.2.5, 10.4.1, 10.4.2). Ký hiệu TT58 sai trước đây (Sổ quỹ S2a, Sổ ngân hàng S2b, Sổ công nợ NCC S4b...) nay theo phần mềm.

- Sau đó PhuongXT chốt bộ sổ TT58 hiện theo dòng ghi chú của từng trường hợp thuế: `apDung` ở `registry.ts` lọc lại theo `th` như T108, `ReportScreen.tsx` trả lại dòng báo không mở sổ 3.2.5 ở trường hợp 4. TH1: S1, TH2: S2a (sổ doanh thu), S2b, S2c, S2d, TH3: S3a, S3b, TH4: S2b, S2c, S2d, S3b; S4a đến S4d mọi trường hợp; B01, B02 ở TH2, TH4.
- Thêm `kyHieuBC` ở `danh-sach.ts`: danh sách báo cáo (Tất cả báo cáo, tab Báo cáo của phân hệ) ghi ký hiệu Sổ doanh thu 3.2.5 theo trường hợp (S1, S2a, S3a), trước luôn ghi S1-DNSN; tờ sổ dùng chung hàm này.

## Đã kiểm

- `npm run typecheck`: không lỗi. `npm run build`: chạy xong, không lỗi.
- `python tools/kiem_tra.py --nhanh`: Không có lỗi (gói Plus 117 màn).
- Đếm bằng registry trên bản chạy thử: Free, Standard TT152, Plus, Pro chỉ còn 2.2.1, 2.2.3; Standard TT58 còn 13 báo cáo. Xem bằng mắt Tất cả báo cáo (Standard), sơ đồ Kho, mở thẳng 5-2-3.
- `python tools/kiem_van.py`: các file đã sửa không có mục ĐỎ.
- `python tools/xuat_bao_cao_he_thong.py` không chạy được trên máy này (thiếu `../Present/tools/build_present`), chưa làm mới file Excel trong repo.
- Chạy thử công cụ với bản giả `build_present` (không có tính năng) ra file tạm: sheet Báo cáo & Mẫu in có 62 dòng, 2 Còn dùng mọi gói, 11 Còn dùng chỉ TT58, 32 Đã ẩn, ký hiệu TT58 đúng.

## Dở dang, việc tiếp theo

- Trum chạy `python tools/xuat_bao_cao_he_thong.py` trên máy có thư mục `Present` để làm mới `docs/IACC-Cloud-Chi-Tiet-He-Thong.xlsx`, rồi commit file đó.
- Báo cáo bị bỏ mới chỉ ẩn, code và cấu hình vẫn còn. Muốn xoá hẳn code thì mở việc mới.
- Sổ doanh thu 3.2.5 chế độ TT58 vẫn là một màn, đổi mẫu S1, S2a, S3a theo trường hợp thuế; ký hiệu đầu trang luôn ghi S1-DNSN. Muốn tách 3 màn riêng thì mở việc mới.

## Bẫy, quyết định mới

- Không.
