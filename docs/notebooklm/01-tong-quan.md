# 01. Tổng quan sản phẩm — IACC Cloud (iaccdemo)
Bản xuất từ repo iaccdemo commit 98d2bb3, ngày 23/11/2026.

## Phạm vi tài liệu
Tài liệu này cung cấp thông tin tổng quan về phần mềm kế toán IACC Cloud. Nội dung tập trung vào định vị sản phẩm, đối tượng phục vụ, so sánh ba gói dịch vụ, liên kết các ứng dụng iPOS và danh mục tài liệu nguồn. Chi tiết về thao tác màn hình, định khoản, kiến trúc kỹ thuật hoặc quy trình nhóm nằm tại các tài liệu từ 02 đến 14.

## 1. Định vị sản phẩm IACC Cloud

### 1.1. IACC Cloud là gì?
IACC Cloud (mã dự án iaccdemo) là phần mềm kế toán trực tuyến chuyên sâu cho ngành F&B do iPOS.vn phát triển (src/app/plan.ts:167, docs/KIEN-TRUC.md:1). Phần mềm chạy hoàn toàn trên trình duyệt web, không cần cài đặt máy trạm (src/modules/tien-ich/index.ts:41).

Hệ thống tự động hoá quy trình hạch toán kế toán từ dữ liệu bán hàng POS và kho nguyên vật liệu (QD01). Thay vì nhập liệu thủ công từng hoá đơn, IACC Cloud kết nối trực tiếp với phần mềm bán hàng FABi và kho vận iPOS Inventory để lấy dữ liệu (src/modules/tien-ich/index.ts:18).

Hiện tại, repo iaccdemo là bản mẫu giao diện hoàn chỉnh bằng React 19, TypeScript 7 và Vite 8 (AGENTS.md:3). Toàn bộ dữ liệu hiển thị là số liệu mô phỏng có hạt giống nhất quán, chưa có backend thực tế (docs/KIEN-TRUC.md:30).

### 1.2. Đối tượng phục vụ mục tiêu
IACC Cloud phục vụ ba nhóm đối tượng khách hàng chính trong ngành ẩm thực và đồ uống (src/app/session.tsx:20):

| Nhóm khách hàng | Đặc điểm mô hình | Nhu cầu kế toán chính |
| :--- | :--- | :--- |
| Hộ kinh doanh cá thể F&B | Quán ăn, quán cà phê đơn lẻ kê khai thuế theo Thông tư 88/2021 hoặc Thông tư 152/2025 (src/app/che-do.ts:8). | Ghi chép sổ quỹ tiền mặt, xuất nhập tồn cơ bản, xuất hoá đơn điện tử từ máy tính tiền và nộp thuế khoán hoặc thuế theo tỷ lệ (src/modules/thue/index.ts:15). |
| Doanh nghiệp F&B vừa và nhỏ | Công ty vận hành 1 đến 3 điểm bán, áp dụng Thông tư 133/2016 hoặc Thông tư 58/2024 (QD31, src/app/che-do.ts:9). | Hạch toán đầy đủ tài khoản kế toán, tính giá thành món ăn, quản lý công nợ và đối chiếu dòng tiền nhiều kênh thanh toán (src/modules/tien/index.ts:12). |
| Chuỗi nhà hàng đa chi nhánh | Doanh nghiệp từ 3 điểm bán trở lên, có bếp trung tâm, kho tổng và các cửa hàng trực thuộc (QD66, src/app/session.tsx:48). | Hạch toán doanh thu chi phí theo từng cửa hàng, kiểm soát điều chuyển kho, đối soát doanh thu đa kênh và quản trị lãi lỗ từng điểm (src/modules/kho/index.ts:25). |

## 2. So sánh ba gói tính năng Standard, Plus và Pro

### 2.1. Lịch sử điều chỉnh gói dịch vụ
Hệ thống ban đầu được thiết kế gồm bốn gói dịch vụ: Free, Starter, Medium và Advance (QD27). Ngày 09/10/2026, các gói đổi tên thành Free, Standard, Plus và Pro (QD27).

Ngày 23/10/2026, Trum chốt quyết định QD80 chính thức bỏ gói Free. Hệ thống chuẩn hoá còn ba gói dịch vụ chính:
- Gói Standard mang mã nội bộ S, tiếp nhận toàn bộ tính năng của gói Free cũ, bổ sung một số báo cáo cơ bản và có mức giá 0 đồng (QD80).
- Gói Plus mang mã nội bộ PL, tiếp nhận các tính năng từ gói Standard cũ (QD80).
- Gói Pro mang mã nội bộ PR, gộp toàn bộ tính năng cao cấp của gói Medium và Advance cũ (QD80).

Trong mã nguồn, tệp `src/app/features.json` sinh tự động từ bảng tính Excel vẫn lưu mã một ký tự F, S, M, A. Hàm `doiGoiTuExcel()` trong `src/app/plan.ts:27` tự động chuyển đổi F thành S, S thành PL, M và A thành PR (QD80).

### 2.2. Bảng so sánh tổng hợp ba gói dịch vụ

| Tiêu chí so sánh | Gói Standard (S) | Gói Plus (PL) | Gói Pro (PR) | Căn cứ mã nguồn / Quyết định |
| :--- | :--- | :--- | :--- | :--- |
| Giá thuê bao | 0 đ / tháng | Có phí theo chu kỳ | Phí doanh nghiệp cao cấp | (QD80) |
| Biểu tượng gói | Khiên xanh ngọc (`--st`) | Ngôi sao xanh dương (`--md`) | Vương miện vàng kim (`--ad`) | (QD80, src/styles/app.css:10) |
| Chế độ kế toán | TT152 (HKD), TT58 (DN) | TT58, TT152 | TT99, TT133 | (src/app/che-do.ts:31-36) |
| Bán hàng POS (3.1.1) | Đã có trong bản mẫu | Đã có trong bản mẫu | Đã có trong bản mẫu | (src/app/plan.ts:46) |
| Bán hàng ngoài POS (3.1.7) | Không hỗ trợ | Không hỗ trợ | Đã có trong bản mẫu | (src/app/plan.ts:74) |
| Hoá đơn điện tử | Xem danh sách | Khởi tạo và phát hành | Đầy đủ thay thế, điều chỉnh | (QD106, src/app/plan.ts:59) |
| Phiếu thu chi tiền mặt | Đã có trong bản mẫu | Đã có trong bản mẫu | Đã có trong bản mẫu | (src/modules/tien/index.ts:10) |
| Sổ tiền gửi ngân hàng | Đã có trong bản mẫu | Đã có trong bản mẫu | Đã có trong bản mẫu | (src/app/plan.ts:41) |
| Kho nguyên vật liệu | Kiểm kê, Thẻ kho, Xuất nhập tồn | Điều chuyển, Công thức chế biến | Sơ chế, Chế biến đa cấp, Giá thành | (src/app/plan.ts:47, QD112) |
| Tính giá vốn hàng tồn | Tạm tính theo tỷ lệ | Tính giá xuất kho cuối kỳ | Đa phương pháp tính giá | (src/modules/kho/index.ts:20) |
| Tài sản cố định (TSCD) | Không hỗ trợ | Báo cáo theo dõi TT58 | Quản lý trích khấu hao tự động | (src/app/plan.ts:43, src/app/plan.ts:79) |
| Công cụ dụng cụ (CCDC) | Thẻ chi phí trả trước | Bảng phân bổ chi phí | Quản lý tăng giảm chi tiết | (src/modules/ccdc/index.ts:112) |
| Quản trị người dùng | 1 tài khoản | Nhiều người dùng | Phân quyền chi tiết theo vai trò | (src/modules/he-thong/index.ts:12) |
| Nhật ký thao tác | Đã có trong bản mẫu | Đã có trong bản mẫu | Đã có trong bản mẫu | (src/app/plan.ts:42, T689) |
| Đồng bộ tự động | Bán hàng FABi | Bán hàng, kho, hoá đơn | Toàn bộ tiện ích realtime, ngân hàng | (src/modules/tien-ich/index.ts:18) |

### 2.3. Đặc điểm chi tiết gói Standard (mã S)
Gói Standard dành riêng cho các hộ kinh doanh và cửa hàng nhỏ với mục tiêu đơn giản hoá tối đa nghiệp vụ ghi chép (QD22).
Về phân hệ, gói mở Bán hàng nhận dữ liệu từ POS, Thu chi tiền, Kho hàng cơ bản và Kê khai thuế hộ kinh doanh (src/app/plan.ts:46).
Về hiển thị, hệ thống tự động ẩn các tính năng ngoài gói trên thanh điều hướng và menu (QD22, `anNgoaiGoi()` trong `src/app/plan.ts`).
Về ghi sổ, gói không áp dụng định khoản Nợ Có phức tạp. Sổ sách ghi nhận trực tiếp theo Thông tư 88 hoặc Thông tư 152 (QD81, src/app/che-do.ts:31).
Về báo cáo tài chính, hệ thống ẩn phân hệ Tổng hợp. Người dùng xem Báo cáo kết quả kinh doanh và các sổ sách doanh thu, tồn kho theo quy định thuế (src/app/plan.ts:46).

### 2.4. Đặc điểm chi tiết gói Plus (mã PL)
Gói Plus đáp ứng nhu cầu kế toán của các doanh nghiệp và nhà hàng F&B độc lập hoặc chuỗi nhỏ (QD80).
Về phân hệ, gói mở toàn bộ phân hệ của gói Standard, bổ sung Quản lý mua hàng đầy đủ, Điều chuyển kho nội bộ, Công thức chế biến, Kế toán tổng hợp và Kê khai thuế khấu trừ (src/app/plan.ts:57).
Về kho vận, gói hỗ trợ phiếu Xuất điều chuyển và Nhập điều chuyển giữa các điểm bán (QD112). Gói hỗ trợ công thức định lượng tiêu hao để tự động trừ kho nguyên liệu khi bán hàng (src/modules/tien-ich/index.ts:19).
Về hạch toán, gói áp dụng chế độ Thông tư 58 hoặc Thông tư 152 (src/app/che-do.ts:33). Gói không áp dụng ghi sổ, lưu phiếu là xong, không có trạng thái hay nút ghi sổ (QD81).

### 2.5. Đặc điểm chi tiết gói Pro (mã PR)
Gói Pro là giải pháp kế toán quản trị toàn diện cho các chuỗi nhà hàng quy mô lớn và doanh nghiệp F&B chuyên nghiệp (QD80).
Về phân hệ, gói mở toàn bộ 14 phân hệ trong hệ thống, bao gồm Tài sản cố định, Công cụ dụng cụ, Tính giá thành nhiều cấp và Phân bổ chi phí chuỗi (src/app/registry.ts:12).
Về tính năng nâng cao, gói hỗ trợ lập chứng từ bán hàng thủ công ngoài POS mã 3.1.7, quản lý quy trình sơ chế và chế biến nhiều công đoạn, tính khấu hao tài sản tự động và đối soát tự động sao kê ngân hàng (src/app/plan.ts:69, src/modules/tien-ich/index.ts:28).
Về phân quyền, gói cho phép thiết lập vai trò chi tiết cho từng nhân viên, giới hạn phạm vi truy cập dữ liệu theo từng cửa hàng trực thuộc (src/modules/he-thong/huong-dan.ts:24).

## 3. Liên kết trong hệ sinh thái giải pháp iPOS.vn

### 3.1. Vị trí của IACC Cloud trong chuỗi sản phẩm
IACC Cloud giữ vai trò trung tâm xử lý dữ liệu kế toán trong hệ sinh thái giải pháp F&B của iPOS.vn (QD01):

```
+-------------------------------------------------------------------+
|                           iPOS.vn Cloud                           |
+-------------------------------------------------------------------+
|  [ Máy bán hàng POS / FABi ] ---> Hoá đơn bán hàng, Doanh thu, Thu chi
|               |                                                   |
|               v                                                   |
|  [ Kho vận iPOS Inventory ] ----> Nhập xuất nguyên liệu, Điều chuyển
|               |                                                   |
|               +-----------------+                                 |
|                                 v                                 |
|                 +-------------------------------+                 |
|                 |     IACC Cloud (iaccdemo)     |                 |
|                 |   (Hạch toán, Sổ sách, Thuế)  |                 |
|                 +-------------------------------+                 |
|                                 |                                 |
|        +------------------------+------------------------+        |
|        v                                                 v        |
|  [ Hoá đơn điện tử ]                            [ Báo cáo thuế ]  |
+-------------------------------------------------------------------+
```

### 3.2. Liên kết dữ liệu với hệ thống bán hàng FABi và POS
Dữ liệu phát sinh từ máy thu ngân tại điểm bán được đưa vào IACC Cloud qua các kênh tích hợp (QD62, src/modules/tien-ich/index.ts:18):
- Hoá đơn thanh toán trên POS được tổng hợp thành chứng từ Xuất bán POS mã màn hình 3-1-1. Hệ thống bóc tách chi tiết từng dòng món ăn, thuế GTGT, phí dịch vụ và tiền giảm giá (src/modules/types.ts:78).
- Tiền mặt thu ngân nộp về quỹ hoặc các khoản chi tiêu trực tiếp tại điểm bán được đồng bộ thành phiếu thu và phiếu chi trong phân hệ Tiền (src/app/session.tsx:51).
- Hệ thống ánh xạ từng hình thức thanh toán trên POS như tiền mặt, thẻ ngân hàng, ví điện tử, chuyển khoản QR vào tài khoản quỹ tương ứng trong IACC Cloud (src/app/session.tsx:52).

### 3.3. Liên kết dữ liệu với hệ thống quản lý kho iPOS Inventory
Đối với khách hàng dùng phần mềm kho iPOS Inventory, IACC Cloud kế thừa toàn bộ danh mục và chứng từ kho vận (QD51, src/modules/tien-ich/index.ts:22):
- Danh mục nguyên vật liệu, nhóm hàng và quy đổi đơn vị tính được đồng bộ thống nhất giữa hai hệ thống (QD51).
- Phiếu nhập mua nguyên liệu, phiếu xuất kho, phiếu điều chuyển và biên bản kiểm kê được kế thừa trực tiếp để sinh bút toán kế toán kho (src/modules/kho/index.ts:15).
- Hệ thống kế thừa công thức sơ chế và công thức chế biến từ iPOS Inventory để tính giá thành và hạch toán tiêu hao (QD51, src/modules/kho/index.ts:22).

### 3.4. Liên kết với giải pháp Hoá đơn điện tử iPOS
Phần mềm tích hợp với dịch vụ phát hành hoá đơn điện tử của iPOS.vn (QD106):
- Tự động lấy dữ liệu hoá đơn bán hàng từ POS để phát hành hoá đơn điện tử có mã của cơ quan thuế từ máy tính tiền (QD106).
- Hỗ trợ các nghiệp vụ điều chỉnh hoá đơn sai sót, thay thế hoá đơn hoặc lập thông báo giải trình trực tiếp trên giao diện kế toán (src/modules/hoa-don/index.ts:10).

## 4. Môi trường triển khai và vận hành hệ thống

### 4.1. Bản xem trước trực tuyến iaccdemo
Bản xem trước đặt tại địa chỉ `https://iaccdemo.pages.dev` (AGENTS.md:5).
Mục đích là môi trường kiểm thử liên tục cho đội ngũ phát triển, kiểm thử giao diện và lấy ý kiến nội bộ (docs/TRIEN-KHAI.md:19).
Bản web tự động triển khai qua GitHub Actions mỗi khi có commit mới đẩy lên nhánh main chứa tệp sửa đổi ngoài Markdown (docs/TRIEN-KHAI.md:21).
Hệ thống chạy trên dữ liệu mô phỏng, lưu trạng thái phiên tạm thời trong bộ nhớ trình duyệt `localStorage` (src/app/session.tsx:1).

### 4.2. Bản phát hành chính thức i-accounting
Bản phát hành đặt tại địa chỉ `https://i-accounting.pages.dev` (AGENTS.md:5).
Mục đích là môi trường phát hành chính thức giới thiệu sản phẩm cho khách hàng và đối tác (docs/TRIEN-KHAI.md:34).
Bản web triển khai qua quy trình gắn thẻ phiên bản git tag dạng `v*` như `v1.0.0`. Khi gắn tag mới, luồng công việc `.github/workflows/release.yml` tự động đóng gói và cập nhật bản phát hành (docs/TRIEN-KHAI.md:36, docs/RELEASE.md:5).

## 5. Danh mục 14 tệp nguồn tri thức NotebookLM

Hệ thống tài liệu nguồn cho NotebookLM gồm 14 tệp chuyên đề đặt trong thư mục `docs/notebooklm/`. Dưới đây là bảng phân định nội dung chi tiết:

| Số tệp | Tên tệp tài liệu | Chủ đề chính | Nội dung trả lời cho người dùng |
| :---: | :--- | :--- | :--- |
| 01 | `01-tong-quan.md` | Tổng quan sản phẩm | Định vị IACC Cloud, đối tượng sử dụng, so sánh 3 gói, hệ sinh thái iPOS, môi trường web và danh mục tài liệu. |
| 02 | `02-nguyen-ly-ke-toan.md` | Nguyên lý kế toán F&B | 4 chế độ thông tư TT152, TT58, TT133, TT99, phương pháp thuế, chu kỳ kế toán, quy tắc khoá sổ và tính giá vốn. |
| 03 | `03-phan-he-man-hinh.md` | Phân hệ và màn hình | Chi tiết 14 phân hệ, danh sách 120 tính năng Excel và các màn hình tự viết, quy tắc định tuyến URL. |
| 04 | `04-chung-tu-dinh-khoan.md` | Chứng từ và hạch toán | Cấu trúc form chứng từ AMIS, danh mục loại phiếu, bút toán Nợ Có mẫu, luồng ghi sổ và quy tắc đánh số chứng từ. |
| 05 | `05-bao-cao-mau-in.md` | Báo cáo và mẫu in | Hệ thống báo cáo tài chính, báo cáo quản trị F&B, sổ sách theo thông tư, 17 mẫu in A4 và công cụ tuỳ chỉnh cột. |
| 06 | `06-giao-dien-ux.md` | Giao diện và UX | Ngôn ngữ thiết kế iFaster, bảng màu `:root`, thành phần dùng chung `src/ui/`, chuẩn mobile 360px và các quyết định UX. |
| 07 | `07-quyet-dinh-qd.md` | Quyết định thiết kế (QD) | Toàn văn và phân tích 115 quyết định kiến trúc, nghiệp vụ và giao diện đã chốt trong `docs/QUYET-DINH.md`. |
| 08 | `08-bay-ky-thuat.md` | Bẫy kỹ thuật và sự cố | Danh mục lỗi lập trình thường gặp, bẫy dữ liệu giả, lỗi CSS, lỗi bộ nhớ và cách tránh trong `docs/BAY.md`. |
| 09 | `09-kien-truc-fe-be.md` | Kiến trúc Frontend và Backend | Cấu trúc thư mục React Vite, luồng quản lý trạng thái, mô hình dữ liệu giả và đặc tả kiến trúc Backend dự kiến. |
| 10 | `10-quy-trinh-team.md` | Quy trình phối hợp team | Luật làm việc 3 người trong `AGENTS.md`, quy trình đầu phiên, nhận việc Txxx, kiểm tra trước khi push và release. |
| 11 | `11-tien-ich.md` | Tiện ích và hệ thống | Công cụ đồng bộ FABi, IVT, đối soát, cảnh báo số liệu, quản trị người dùng, phân quyền và danh mục thuế TT58. |
| 12 | `12-tien-do-viec.md` | Tiến độ công việc | Bảng theo dõi tiến độ các tác vụ T01 đến T903, phân công nhân sự và trạng thái hoàn thành từ `docs/TIEN-DO.md`. |
| 13 | `13-hoi-dap-mau.md` | Hỏi đáp thường gặp | Tập hợp câu hỏi điển hình của sale, nhân viên triển khai và lập trình viên mới về tính năng và quy ước hệ thống. |
| 14 | `14-nhat-ky-thay-doi.md` | Nhật ký thay đổi | Toàn bộ lịch sử cập nhật phiên bản, tính năng mới và các đợt hoàn thiện hệ thống bóc tách từ `CHANGELOG.md`. |

## 6. Hướng dẫn cách đặt câu hỏi cho NotebookLM

Để NotebookLM truy xuất chính xác thông tin từ các tệp tài liệu nguồn, người dùng nên áp dụng các hướng dẫn sau:

### 6.1. Luôn nêu rõ ngữ cảnh gói dịch vụ
Câu hỏi chưa rõ: Phần mềm có tính năng tính giá thành sản phẩm không?
Câu hỏi nên dùng: Trong gói Plus và gói Pro, phần mềm hỗ trợ tính giá thành sản phẩm theo phương pháp nào?
Lý do là tính năng phần mềm bị giới hạn theo từng gói Standard, Plus hoặc Pro (QD80). Nêu rõ gói giúp notebook lọc đúng phạm vi áp dụng.

### 6.2. Nêu chính xác tên màn hình hoặc mã tính năng
Câu hỏi chưa rõ: Xem sổ quỹ ở đâu?
Câu hỏi nên dùng: Màn hình Sổ quỹ tiền mặt mã 2.2.1 trong phân hệ Thu chi có những cột dữ liệu nào và mở được ở những gói nào?
Lý do là mỗi màn hình đều có mã số định danh chuẩn theo bảng tính năng Excel và đường dẫn URL tương ứng.

### 6.3. Trích dẫn mã quyết định QD hoặc mã đầu việc Txxx
Câu hỏi chưa rõ: Tại sao lại bỏ nút thêm mới ở danh mục kho?
Câu hỏi nên dùng: Theo quyết định nào và lý do vì sao danh mục kho trong gói Standard lại không cho phép bấm nút thêm mới?
Lý do là các thay đổi quan trọng đều được ghi nhận bằng mã quyết định từ QD01 đến QD115 hoặc mã công việc T01 đến T903.

### 6.4. Phân biệt rõ dữ liệu bản mẫu và thiết kế dự kiến
Câu hỏi chưa rõ: Backend lưu chứng từ ra sao?
Câu hỏi nên dùng: Trong bản mẫu hiện tại, cấu trúc thực thể chứng từ dự kiến cho Backend gồm những trường dữ liệu nào trong tài liệu 09?
Lý do là repo hiện tại là bản mẫu frontend iaccdemo. Mọi thông tin về cơ sở dữ liệu và xử lý server đều thuộc phạm vi dự kiến.

## 7. Phân định trạng thái các khối chức năng

Nhằm hỗ trợ đội ngũ bán hàng và triển khai tư vấn chính xác, toàn bộ các tính năng được phân định rõ ràng thành ba nhóm trạng thái:

### 7.1. Đã có trong bản mẫu
Toàn bộ giao diện người dùng cho 14 phân hệ đã hoàn chỉnh trên cả máy tính và điện thoại di động (src/app/registry.ts:12, src/ui/mobile/MobileShell.tsx:1).
Hệ thống hiển thị dữ liệu mô phỏng với hạt giống cố định gồm doanh thu theo ngày DAILY, danh mục khách hàng, nhà cung cấp, vật tư và chứng từ (src/data/mock.ts:1).
Chức năng thêm mới, sửa, xoá chứng từ giả lập và lưu tạm vào bộ nhớ phiên localStorage đã hoạt động (src/ui/generic/daXoa.ts:1).
Người dùng có thể chuyển đổi linh hoạt giữa 3 gói Standard, Plus, Pro và 4 chế độ thông tư kế toán trên thanh điều hướng (src/app/session.tsx:30, QD17).
Hệ thống xem trước báo cáo tài chính, báo cáo thuế và 17 biểu mẫu in chứng từ tiêu chuẩn A4 có hỗ trợ xuất file Excel (src/app/mau-in.ts:1, src/ui/bao-cao/ToGiay.tsx:1).

### 7.2. Dự kiến / chưa làm
Repo chưa có kế hoạch riêng cho chủ đề này ngoài phần backend (file 09, mục 2). Tính năng chưa làm xem file 12 (Tiến độ việc), dòng trạng thái `Chưa làm`, `Chờ`.

### 7.3. Chưa chốt
Công nghệ backend: repo chưa chọn ngôn ngữ, cơ sở dữ liệu (file 09). Việc khác đang mở xem file 12, quyết định đang soạn xem file 07.

