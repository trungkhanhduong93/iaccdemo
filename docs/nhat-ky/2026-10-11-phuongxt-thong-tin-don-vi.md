# Thông tin đơn vị gom thông tin khai lúc khởi tạo (T145)

- Ngày: 11/10/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- PhuongXT chốt: mọi thông tin của đơn vị khai lúc khởi tạo gom về Hệ thống, Thông tin đơn vị để sửa lại.
- `src/app/session.tsx`: `ttDv` lưu thông tin kê khai từng đơn vị (`TtDonVi`: loại hình, nhóm hộ kinh doanh, cách tính thuế TNCN, địa điểm kinh doanh chính, kênh bán online, kênh bán qua sàn; tên, MST, địa chỉ sửa đè). `dsDonVi`, `donViHienTai` đọc tên, MST, địa chỉ từ đây; `loaiHinhDv` cho loại hình (chưa khai thì tên "Hộ kinh doanh..." là hộ kinh doanh).
- Popup khởi tạo (`OnboardFabi.tsx`) lưu loại hình, nhóm, cách tính thuế, chi nhánh chính, kênh bán vào `ttDv`.
- `src/modules/he-thong/HeThong.tsx`, Thông tin đơn vị:
  - Thông tin trên chứng từ, báo cáo: tên, địa chỉ sửa và lưu thật; MST sửa được khi đơn vị chưa khai (đơn vị dùng thử từ FABi bỏ qua tra cứu); số điểm bán theo chi nhánh của đơn vị.
  - Thông tin kê khai: Loại hình; doanh nghiệp có Thông tư áp dụng (chế độ kế toán chuyển từ Cấu hình kế toán sang, hỏi lại khi đổi; gói Free ghi "Quản lý lãi lỗ, không theo thông tư"); hộ kinh doanh có Nhóm doanh thu, Phương pháp tính thuế TNCN (nhóm 1, 3, 4 khoá theo nhóm), Địa điểm kinh doanh chính, Kênh bán online, Kênh bán qua sàn đã khấu trừ thuế. Đổi loại hình thì nhắc xem lại gói, chế độ, không tự đổi.
- Cấu hình kế toán: ô Chế độ chỉ hiện, kèm liên kết Sửa ở Thông tin đơn vị. Bảng Chi nhánh và ánh xạ POS lấy chi nhánh theo đơn vị; gói Free, Standard ghi tên một kho mỗi chi nhánh (dữ liệu mẫu một kho), gói khác ghi số kho.
- Gói Free, Standard: Danh mục chi nhánh, danh mục Kho chỉ có một kho mẫu mỗi chi nhánh (gói Standard vẫn thêm kho được).
- Thanh trên ghi "Hộ kinh doanh · MST" hoặc "Công ty · MST" theo loại hình.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `PYTHONIOENCODING=utf-8 python tools/kiem_tra.py --nhanh`: Không có lỗi.
- `kiem_van.py` các file đã sửa: không có mục ĐỎ.
- Dùng thử từ FABi, khởi tạo hộ kinh doanh nhóm 2 theo doanh thu, chi nhánh chính Nguyễn Trãi: Thông tin đơn vị hiện đúng các giá trị, MST trống; khai MST, đổi nhóm 3 (cách tính thuế khoá theo lợi nhuận), lưu: thanh trên "Hộ kinh doanh · MST 8090 556 677".
- Phố Mây gói Plus: Thông tư áp dụng TT133, đổi sang TT99 có hỏi lại, Cấu hình kế toán hiện TT99. Thử xong trả phiên về Phố Mây gói Plus, TT133.

## Dở dang, việc tiếp theo

- Người đại diện, kế toán trưởng ở Thông tin đơn vị chưa lưu.
- Danh mục chi nhánh chưa có ngừng lên sổ chi nhánh.

## Bẫy, quyết định mới

- Không.
