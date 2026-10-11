# Màn khởi tạo khi mở từ FABi (T138)

- Ngày: 11/10/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Dở dang (chạy được, chờ Trum duyệt cách ghép loại hình, gói, chế độ)

## Đã làm

- Đổi mã việc onboard từ T134 sang T138 vì Trum đã dùng T134 cho mẫu in đổi khổ. Commit ý tưởng hôm 10/10 chưa push nên xung đột ở `docs/TIEN-DO.md`, đã gộp giữ cả hai bên.
- PhuongXT chốt điểm 1: làm màn mới `/khoi-tao-fabi`, giữ `/khoi-tao` cho người tự đăng ký.
- Màn mới `src/modules/onboarding/KhoiTaoFabi.tsx`, khai đường dẫn ở `src/App.tsx`:
  - Màn chào: "Chào <tên>", khối "Đã nhận từ FABi" (chi nhánh, món, kênh bán, kho).
  - Bước 1, Đơn vị: mã số thuế điền sẵn, Tra cứu, ngày bắt đầu dùng sổ. Câu hỏi loại hình 4 lựa chọn: Hộ kinh doanh (TT152, Free), DN siêu nhỏ (TT58, Standard), DN nhỏ và vừa (TT133, Plus), DN lớn (TT99, Pro). Có nhãn Gợi ý theo số chi nhánh FABi.
  - Bước 2, Chi nhánh và kho: tích chi nhánh lên sổ; gói Free chọn một kho mỗi chi nhánh, gói khác hiện đủ kho.
  - Bước 3, Đồng bộ bán hàng: tổng hợp theo kênh hoặc chi tiết theo hoá đơn (T113), giờ chốt, ước số chứng từ Xuất bán POS mỗi tháng từ `DAILY`.
  - Bước 4, Số dư đầu kỳ: gói Free một màn tiền mặt, tiền gửi; gói khác chọn Nhập nhanh, Excel, Để sau; nút Bỏ qua.
  - Hoàn tất: thanh tiến trình lấy dữ liệu, số chứng từ đã tạo từ ngày bắt đầu, 3 việc nên làm tiếp, nút Vào phần mềm ghi `goi`, `cheDo`, `dongBoFabi` vào phiên.
  - Khung bên phải "Bạn sẽ có gì" đổi theo lựa chọn: gói, chế độ, số chi nhánh, kho, cách đồng bộ, số tính năng.
  - Lưu dở ở localStorage khoá `iacc-khoi-tao-fabi`, mở lại đúng bước; vào phần mềm thì xoá.
- Làm lại đầu luồng theo PhuongXT (lượt 2), màn còn 6 bước:
  - Bước Loại hình: Hộ kinh doanh hay Doanh nghiệp. Hộ kinh doanh chọn nhóm: nhóm 1 dưới 1 tỷ, nhóm 2 từ 1 đến dưới 3 tỷ, nhóm 3 từ 3 đến dưới 50 tỷ, nhóm 4 từ 50 tỷ, kèm cách tính thuế TNCN. Nhóm 2 chọn thêm theo tỷ lệ % trên doanh thu hay theo lợi nhuận. Nhóm theo doanh thu FABi có nhãn.
  - Bước Chọn gói: hộ kinh doanh có Free (tính thuế theo doanh thu) và Standard (theo lợi nhuận), cả hai theo TT152. Doanh nghiệp chọn cả 4 gói: Free chỉ quản lý lãi lỗ, không theo thông tư (bên trong ghi sổ như TT152); Standard theo TT58; Plus, Pro chọn TT133 hoặc TT99.
  - Dưới thẻ gói liệt kê tính năng của gói đang chọn, gom theo phân hệ, đánh dấu Thêm ở tính năng gói liền trước chưa có (`TinhNangGoi`).
  - `src/app/che-do.ts`: `CHE_DO_HOP_LE` cho gói Standard thêm TT152, để hộ kinh doanh dùng Standard vẫn giữ TT152 khi tải lại. Ở Cấu hình hệ thống, gói Standard giờ chọn được TT58 hoặc TT152.
- Lối vào bản mẫu: liên kết "Thử mở từ FABi" dưới form đăng nhập (`src/modules/auth/Login.tsx`).
- CSS mục cuối `app.css`: "Khởi tạo khi mở từ FABi (T138)", lớp `.ktf-*`.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_tra.py --nhanh`: Không có lỗi. Máy Windows phải đặt `PYTHONIOENCODING=utf-8`, không thì lỗi in chữ.
- `kiem_van.py` cho `KhoiTaoFabi.tsx`, `Login.tsx`: sạch.
- Bấm thử trên trình duyệt hết luồng gói Free, đồng bộ chi tiết: phiên lưu `F`, `TT152`, `chiTiet`, bản lưu dở bị xoá, vào Bàn làm việc.
- Chưa bấm thử luồng gói Plus, Pro, màn hẹp dưới 900px.

## Dở dang, việc tiếp theo

- Hỏi Trum duyệt: gói Standard thêm TT152 (đổi QD31), doanh nghiệp gói Free không theo thông tư mà vẫn lưu `cheDo` TT152, thuế suất 15%, 17%, 20% và ngưỡng nhóm chưa đối chiếu văn bản gốc. Trum chốt thì ghi `docs/QUYET-DINH.md`.
- Doanh nghiệp gợi ý gói theo số chi nhánh (`goiGoiY`). Doanh thu FABi 29 tỷ là số cứng (`DT_FABI`).
- Nhóm hộ kinh doanh, cách tính thuế TNCN chưa lưu vào phiên, chỉ nằm trong màn khởi tạo.
- Ba việc nên làm tiếp ở màn Hoàn tất chưa nối tới màn nào; có thể đưa thành thẻ Việc cần làm trên Bàn làm việc.
- Mô tả gói Free trong `GOI` còn ghi "1 điểm bán", hiện ở khung bên phải (việc T60).

## Bẫy, quyết định mới

- Không.
