# Màn khởi tạo khi mở từ FABi (T138)

- Ngày: 11/10/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Dở dang (bản thử đã chạy được, chờ Trum duyệt câu hỏi loại hình)

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
- Lối vào bản mẫu: liên kết "Thử mở từ FABi" dưới form đăng nhập (`src/modules/auth/Login.tsx`).
- CSS mục cuối `app.css`: "Khởi tạo khi mở từ FABi (T138)", lớp `.ktf-*`.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_tra.py --nhanh`: Không có lỗi. Máy Windows phải đặt `PYTHONIOENCODING=utf-8`, không thì lỗi in chữ.
- `kiem_van.py` cho `KhoiTaoFabi.tsx`, `Login.tsx`: sạch.
- Bấm thử trên trình duyệt hết luồng gói Free, đồng bộ chi tiết: phiên lưu `F`, `TT152`, `chiTiet`, bản lưu dở bị xoá, vào Bàn làm việc.
- Chưa bấm thử luồng gói Plus, Pro, màn hẹp dưới 900px.

## Dở dang, việc tiếp theo

- Hỏi Trum: câu hỏi loại hình có đúng nghiệp vụ không, và có ép gói theo loại hình như đang làm không (điểm 2, 3 của nhật ký 10/10). Trum chốt thì ghi `docs/QUYET-DINH.md`.
- Gợi ý gói đang theo số chi nhánh (`GOI_GOI_Y`), doanh thu 29 tỷ là chữ cứng.
- Ba việc nên làm tiếp ở màn Hoàn tất chưa nối tới màn nào; có thể đưa thành thẻ Việc cần làm trên Bàn làm việc.
- Mô tả gói Free trong `GOI` còn ghi "1 điểm bán", hiện ở khung bên phải (việc T60).

## Bẫy, quyết định mới

- Không.
