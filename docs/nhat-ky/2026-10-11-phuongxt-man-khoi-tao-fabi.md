# Màn khởi tạo khi mở từ FABi (T138)

- Ngày: 11/10/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Dở dang (đã push, PhuongXT xem lại một lượt trên bản online)

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
- Sửa theo góp ý PhuongXT khi xem bản nháp (lượt 3):
  - Màn chào: khối "Thông tin từ FABi" gồm thương hiệu, cửa hàng, kênh bán, món; bỏ kho (FABi không có kho), bỏ câu diễn giải.
  - Nút "Để sau" là quay lại FABi: hiện màn "Đang quay lại FABi", bản mẫu có nút mở lại.
  - Màn giới thiệu giao diện kế toán: khung giao diện thu nhỏ đánh số 4 vùng, hỏi "Bạn có muốn dùng thử không?".
  - Bấm Dùng thử thì vào phần mềm gói Free (TT152). 6 bước khởi tạo thành popup đè lên phần mềm (`src/modules/onboarding/OnboardFabi.tsx`, đặt trong `src/app/Shell.tsx`). Đóng popup (nút X, Esc) thì còn thẻ nhắc nổi góc dưới phải, bấm Tiếp tục mở lại đúng bước. Xong popup thì đổi sang gói, chế độ đã chọn.
  - Bản mẫu: mỗi lần mở `/khoi-tao-fabi` (nút "Thử mở từ FABi") coi như đơn vị mới chưa dùng kế toán, xoá tiến độ khởi tạo cũ, bắt đầu từ màn chào (PhuongXT chốt). Tiến độ dở chỉ giữ trong phần mềm, qua thẻ Tiếp tục.
- Gộp bước Loại hình và Chọn gói thành "Loại hình và gói" (popup còn 5 bước): chọn loại hình, nhóm hộ kinh doanh, rồi bấm chọn gói ngay bên dưới; tính năng gói thu vào dòng "Xem N tính năng". Khung "Bạn sẽ có gì" ghi gói, chế độ, giá (theo năm, theo tháng) và điểm nổi bật của gói, bỏ dòng nói về thông tư khác chế độ đang chọn.
- Bảng giá và điểm nổi bật gói chuyển từ `GoiThueBao.tsx` sang `src/app/plan.ts` (`GIA_GOI_NAM`, `GIA_GOI_THANG`, `DIEM_NOI_BAT`) để hai màn dùng chung.
- Bước Đơn vị: chữ đổi theo loại hình (công ty, hộ kinh doanh); thêm ngày bắt đầu năm tài chính, ghi vào `ngayDauNam`, `namTaiChinh` của phiên; bỏ ngày bắt đầu dùng sổ, số dư đầu kỳ và số chứng từ POS tính từ ngày đầu năm.
- Bước Chi nhánh (bỏ kho), làm cho chuỗi vài chục chi nhánh (`DsChiNhanh`): danh sách dòng mảnh, gom theo khu vực khi có từ 2 khu vực (tích cả nhóm, thu gọn), tìm khi có từ 6 chi nhánh, lọc Tất cả, Đã chọn, Chưa chọn, chọn tất cả theo kết quả lọc; khung cao cố định, tự cuộn. Đã thử với 40 chi nhánh mẫu rồi gỡ.
- Hộ kinh doanh: thêm nút Chính trên dòng để chọn chi nhánh chính (bắt buộc, không tự lấy chi nhánh đầu), Kênh bán online và Kênh bán qua sàn đã khấu trừ thuế chọn bằng ô thả xuống (danh sách kênh mẫu ở `KENH_ONLINE`, `KENH_SAN`). Doanh nghiệp chỉ chọn chi nhánh. Chi nhánh chính, kênh bán chưa lưu vào phiên.
- Bước Đồng bộ bán hàng bỏ giờ chốt cuối ngày. Bỏ bước Số dư đầu kỳ vì lúc khởi tạo chưa có danh mục; màn hoàn tất có thêm việc "Nhập số dư đầu kỳ khi đã có danh mục". Popup còn 4 bước: Loại hình và gói, Đơn vị, Chi nhánh, Đồng bộ bán hàng.
- Popup đổi tên thành Khởi tạo dữ liệu. Màn hoàn tất: "Dữ liệu đã sẵn sàng", bỏ câu số chứng từ đã tạo, gợi ý khởi tạo các danh mục có trong gói đã chọn (6 danh mục đầu, còn lại ghi "và N danh mục khác"). Bấm Bắt đầu làm việc thì vào phân hệ Danh mục, sơ đồ Khởi tạo danh mục.
- Dùng thử gói Free với tất cả cửa hàng trên FABi (PhuongXT chọn cách A: gói Free không giới hạn chi nhánh). Màn giới thiệu ghi rõ. Sửa luôn việc T60 cho gói Free: mô tả gói, điểm nổi bật, thẻ gói và hỏi đáp màn Gói thuê bao.
- Dùng thử từ FABi tạo đơn vị thứ 4 mới (`dvMoi` trong phiên, id `fabi`), không đụng 3 đơn vị mẫu (PhuongXT dặn: 3 đơn vị kia là ví dụ đã khai xong). Đơn vị mới lấy tên FABi (`TEN_FABI`), chưa có MST, địa chỉ (FABi không có), gói Free; thanh trên ghi "Chưa khai mã số thuế". Bước Đơn vị để trống MST, tên điền sẵn tên FABi, Tra cứu điền tên, địa chỉ mẫu khác đơn vị mẫu (MST 0319 990 088); khởi tạo xong ghi tên, MST, địa chỉ, gói vào đơn vị mới. `dsDonVi` trong `session.tsx` gộp 3 đơn vị mẫu với đơn vị mới; đăng nhập thường bỏ đơn vị mới.
- Lối vào bản mẫu: liên kết "Thử mở từ FABi" dưới form đăng nhập (`src/modules/auth/Login.tsx`).
- CSS mục cuối `app.css`: "Khởi tạo khi mở từ FABi (T138)", lớp `.ktf-*`.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_tra.py --nhanh`: Không có lỗi. Máy Windows phải đặt `PYTHONIOENCODING=utf-8`, không thì lỗi in chữ.
- `kiem_van.py` cho `KhoiTaoFabi.tsx`, `Login.tsx`: sạch.
- Bấm thử trên trình duyệt hết luồng gói Free, đồng bộ chi tiết: phiên lưu `F`, `TT152`, `chiTiet`, bản lưu dở bị xoá, vào Bàn làm việc.
- Lượt 3: Dùng thử vào Bàn làm việc gói Free có popup; đóng bằng Esc, tải lại trang vẫn còn thẻ nhắc bước 2/6; đi hết popup với doanh nghiệp thì phiên đổi sang `PL`, `TT133`, popup và thẻ nhắc tắt; đang dở mở lại `/khoi-tao-fabi` thì vào phần mềm, popup mở bước 3.
- Chưa bấm thử luồng gói Plus, Pro, màn hẹp dưới 900px.

## Dở dang, việc tiếp theo

- PhuongXT xem bản nháp trên https://iaccdemo.pages.dev (đăng nhập, bấm "Thử mở từ FABi") rồi góp ý. PhuongXT chốt không cần Trum duyệt các điểm: gói Standard thêm TT152 (đổi QD31), doanh nghiệp gói Free quản lý lãi lỗ, không theo thông tư (vẫn lưu `cheDo` TT152). Thuế suất 15%, 17%, 20% chưa đối chiếu văn bản gốc.
- Doanh nghiệp gợi ý gói theo số chi nhánh (`goiGoiY`). Doanh thu FABi 29 tỷ là số cứng (`DT_FABI`).
- Nhóm hộ kinh doanh, cách tính thuế TNCN chưa lưu vào phiên, chỉ nằm trong màn khởi tạo.
- Điểm nổi bật gói Standard ghi "tính thuế GTGT và TNDN", hộ kinh doanh dùng Standard thì nộp TNCN; gói Standard còn ghi "1 điểm bán" (T60). Câu chữ ở `DIEM_NOI_BAT`, `GOI`, chờ PhuongXT chốt.
- Ba việc nên làm tiếp ở màn Hoàn tất chưa nối tới màn nào; có thể đưa thành thẻ Việc cần làm trên Bàn làm việc.
- Mô tả gói Free trong `GOI` còn ghi "1 điểm bán", hiện ở khung bên phải (việc T60).

## Bẫy, quyết định mới

- Không.
