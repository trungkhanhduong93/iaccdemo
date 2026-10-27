# Tổng kết logic gói Standard, sửa 3 lỗi soát ra (T669)

- Ngày: 27/10/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- Viết `docs/TONG-KET-LOGIC-STANDARD.md`: logic từng màn, từng phân hệ khi chạy gói Standard (web và điện thoại), kèm bảng điểm cần soát. Bản HTML cùng nội dung, có mục lục: `docs/TONG-KET-LOGIC-STANDARD.html` (mở bằng trình duyệt).
- `src/app/Topbar.tsx`: ẩn nút chuông thông báo khi gói không có Cảnh báo số liệu 11.6 (gói Standard), trước đó bấm chuông ra trang khoá Tiện ích.
- `src/app/Screen.tsx`: gói ẩn hẳn tính năng ngoài gói (Standard, QD22) mở màn ngoài gói bằng đường dẫn thì về màn đầu phân hệ, phân hệ ẩn thì về Trang chủ; không hiện trang mời "Nâng cấp lên Plus/Pro" nữa. Gói Plus, Pro vẫn thấy trang khoá như cũ.
- `src/modules/onboarding/OnboardFabi.tsx`: bước Thông tin đơn vị, nút Tiếp tục khoá khi tên đơn vị trống (ô có dấu * nhưng trước đó không chặn).

## Đã kiểm

- `npm run typecheck`: không lỗi.
- `npm run build`: chạy xong, không lỗi.
- `python tools/kiem_tra.py --nhanh`: "Không có lỗi."
- Trình duyệt, đơn vị mẫu Cà phê Góc Nhỏ gói Standard: không có chuông; mở `#/app/tien-ich/11-6` về Tổng quan; mở `#/app/kho/5-1-12` về Kiểm kê 5.1.10, không còn trang khoá.
- Chưa bấm tay popup khởi tạo với tên trống, chỉ đọc điều kiện khoá nút.
- `python tools/kiem_van.py` cho tài liệu, nhật ký: hết ĐỎ.
- `python tools/xuat_bao_cao_he_thong.py` không chạy được trên máy này: thiếu thư mục `Present/tools` (module `build_present`) ở thư mục cha của repo. File Excel báo cáo hệ thống chưa làm mới.

## Dở dang, việc tiếp theo

- Không.
- Bảng báo cáo gói Standard ở mục 12 của bản tổng kết đọc từ cấu hình `bao-cao/danh-sach.ts`, chưa mở từng màn soát.
- Còn lại ở mục 15: câu thông báo sau khi chuyển gói ở Gói thuê bao có thể ghi TT152 với doanh nghiệp (`GoiThueBao.tsx:61`); khối Quỹ tiền trang chủ cộng 5 quỹ mẫu (T303) nên tổng tồn quỹ lệch sổ quỹ.

## Bẫy, quyết định mới

- Không.
