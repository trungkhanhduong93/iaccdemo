# 11. Phân hệ Tiện ích bổ sung và Hệ thống — IACC Cloud (iaccdemo)
Bản xuất từ repo iaccdemo commit 98d2bb3, ngày 23/11/2026.

## Phạm vi tài liệu
Tài liệu này đặc tả chi tiết phân hệ Tiện ích bổ sung, phân hệ Hệ thống, Trung tâm thông báo và danh mục thuế suất theo Thông tư 58 trong IACC Cloud. Nội dung tập trung vào các công cụ đồng bộ dữ liệu, đối soát, cảnh báo, quản trị tài khoản, phân quyền người dùng và bảng thuế ngành nghề F&B. Chi tiết về nguyên lý định khoản kế toán hoặc thiết kế giao diện người dùng nằm tại tài liệu 02 và 06.

## 1. Phân hệ Tiện ích bổ sung (Module 10)

Phân hệ Tiện ích bổ sung tại `src/modules/tien-ich/` cung cấp các công cụ tự động hoá nhằm giảm tải công việc ghi chép thủ công cho kế toán (src/modules/tien-ich/index.ts:13):

### 1.1. Đồng bộ dữ liệu bán hàng realtime (Tính năng 11.1)
Tính năng mã 11.1 tự động đồng bộ số liệu bán hàng từ máy thu ngân FABi về IACC Cloud (src/modules/tien-ich/index.ts:18).
Hệ thống tiếp nhận thông tin đơn hàng, tự động lập chứng từ Xuất bán POS mã 3.1.1 và các phiếu thu tiền mặt hoặc thu tiền gửi tương ứng (src/app/session.tsx:51).
Kế toán có thể theo dõi trực tiếp trạng thái kết nối, số lượng chứng từ đã đồng bộ thành công và danh sách các hoá đơn lỗi chờ xử lý (src/modules/tien-ich/TienIch.tsx:20).
Bảng ánh xạ phương thức thanh toán tại `session.mapPttt` tự động điều hướng tiền về đúng quỹ tiền mặt hoặc tài khoản ngân hàng của từng cửa hàng (src/app/session.tsx:52).

### 1.2. Tự động xuất kho theo định lượng (Tính năng 11.2)
Tính năng mã 11.2 kết nối dữ liệu món ăn bán ra trên POS với công thức định lượng tiêu hao nguyên vật liệu (src/modules/tien-ich/index.ts:19).
Ngay khi một đơn hàng hoàn thành trên FABi, hệ thống tự động tính toán khối lượng nguyên liệu tiêu hao và sinh phiếu xuất kho tương ứng (src/modules/tien-ich/index.ts:20).
Đối với các món ăn mới chưa khai báo công thức chế biến, hệ thống đưa vào danh sách chờ xử lý, gửi cảnh báo cho thủ kho và không xuất kho tuỳ tiện (src/modules/tien-ich/index.ts:21).

### 1.3. Tự động đồng bộ dữ liệu kho từ iPOS Inventory (Tính năng 11.3)
Tính năng mã 11.3 dành cho gói Plus và gói Pro nhằm kế thừa dữ liệu kho vận từ phần mềm iPOS Inventory (src/modules/tien-ich/index.ts:22, QD51).
Hệ thống tự động đồng bộ danh mục kho, danh mục nguyên vật liệu, đơn vị tính và các phiếu nhập, xuất, điều chuyển kho, kiểm kê định kỳ (src/modules/tien-ich/index.ts:23).
Kế toán không phải mất thời gian nhập lại các chứng từ kho trên phần mềm kế toán (QD51).

### 1.4. Nhận và đối soát hoá đơn đầu vào (Tính năng 11.4)
Tính năng mã 11.4 kết nối trực tiếp với hệ thống quản lý hoá đơn điện tử của cơ quan thuế (src/modules/tien-ich/index.ts:24).
Hệ thống tự động tải về các hoá đơn mua hàng phát sinh theo mã số thuế của doanh nghiệp dưới dạng tệp XML chuẩn (src/modules/tien-ich/TienIch.tsx:80).
Động cơ đối soát tự động so khớp thông tin nhà cung cấp, số tiền, ngày lập và dòng hàng hoá với các phiếu mua hàng đang chờ hoá đơn trong hệ thống (src/modules/tien-ich/TienIch.tsx:85).

### 1.5. Duyệt chứng từ hai cấp và duyệt hàng loạt (Tính năng 11.5)
Tính năng mã 11.5 thiết lập quy trình kiểm soát nội bộ chặt chẽ cho doanh nghiệp và chuỗi nhà hàng (src/modules/tien-ich/index.ts:25):
- Cấp 1: Kế toán viên hoặc nhân viên cửa hàng lập phiếu ở trạng thái Chờ duyệt.
- Cấp 2: Kế toán trưởng hoặc Chủ doanh nghiệp phê duyệt để chứng từ chính thức được ghi sổ kế toán.
- Hỗ trợ thao tác duyệt hàng loạt hàng chục chứng từ cùng lúc sau khi kiểm tra số liệu tổng hợp (src/modules/tien-ich/TienIch.tsx:120).

### 1.6. Cảnh báo số liệu cuối kỳ (Tính năng 11.6)
Tính năng mã 11.6 đóng vai trò trợ lý kiểm toán tự động, phát hiện sớm các sai sót số liệu trước khi khoá sổ (src/modules/tien-ich/index.ts:26):
- Cảnh báo âm kho nguyên vật liệu: liệt kê các mặt hàng có số lượng tồn kho trên sổ sách nhỏ hơn 0.
- Cảnh báo lệch sổ quỹ tiền mặt: so sánh số dư sổ quỹ kế toán với số dư tiền thực tế nộp về từ các cửa hàng.
- Cảnh báo chứng từ chưa tính giá vốn: nhắc nhở chạy tính giá vốn xuất kho trước khi lập báo cáo tài chính.
- Cảnh báo kiểm kê cuối tháng theo quyết định QD115: yêu cầu chốt số liệu kiểm kê thực tế theo tồn hệ thống.

### 1.7. Đối soát tự động giữa các hệ thống (Tính năng 11.7)
Tính năng mã 11.7 đối soát tự động giữa dữ liệu bán hàng POS, dữ liệu kế toán và dữ liệu sao kê ngân hàng (src/modules/tien-ich/index.ts:27).
Hệ thống tự động phát hiện các khoản lệch doanh thu, giao dịch chuyển khoản chưa khớp số tiền hoặc các đơn hàng huỷ trên POS nhưng chưa huỷ bút toán kế toán (src/modules/tien-ich/DoiSoat.tsx:15).

### 1.8. Kết nối ngân hàng điện tử (Tính năng 11.8)
Tính năng mã 11.8 hỗ trợ tải sao kê tự động từ các ngân hàng thương mại lớn như Vietcombank, Techcombank, BIDV (src/modules/tien-ich/index.ts:28).
Hệ thống tự động đối chiếu các giao dịch thu tiền qua mã QR bán hàng với từng đơn hàng cụ thể, giúp kế toán không phải dò từng dòng sao kê giấy (src/modules/tien-ich/index.ts:29).

### 1.9. Kết nối cơ quan thuế (Tính năng 11.9)
Tính năng mã 11.9 cho phép kiểm tra kết nối với cổng thông tin Tổng cục Thuế bằng chữ ký số của doanh nghiệp (src/modules/tien-ich/index.ts:31).
Hệ thống hỗ trợ nộp trực tiếp các tờ khai thuế GTGT, tờ khai thuế hộ kinh doanh và tra cứu thông báo từ cơ quan thuế (src/modules/tien-ich/index.ts:32).

### 1.10. Trí tuệ nhân tạo nhập liệu (Tính năng 11.10)
Tính năng mã 11.10 cho phép lập chứng từ nhanh bằng cách chụp ảnh hoá đơn giấy hoặc ra lệnh bằng giọng nói (src/modules/tien-ich/index.ts:33).
Hệ thống bóc tách thông tin người bán, ngày hoá đơn, danh sách mặt hàng và số tiền để sinh chứng từ nháp kèm định khoản gợi ý để kế toán xem xét trước khi lưu (src/modules/tien-ich/index.ts:34).

### 1.11. Thiết kế mẫu in chứng từ (Tính năng 11.11)
Tính năng mã 11.11 tại `src/modules/tien-ich/ThietKeMauIn.tsx` cung cấp công cụ tuỳ biến mẫu in chứng từ cho doanh nghiệp (QD57):
Cho phép điều chỉnh tiêu đề phiếu, chọn hiển thị logo công ty, thay đổi kích thước phông chữ và thiết lập danh sách người ký tên (thủ trưởng, kế toán trưởng, người lập phiếu, thủ quỹ, thủ kho) (src/ui/bao-cao/khoMauIn.ts:1).

### 1.12. Báo cáo tự khai báo (Tính năng 11.12)
Tính năng mã 11.12 cho phép người dùng tự định nghĩa các chỉ tiêu báo cáo tài chính hoặc báo cáo quản trị đặc thù bằng công thức số học dựa trên số dư và số phát sinh của các tài khoản kế toán (src/modules/tien-ich/index.ts:36).

### 1.13. Quản lý nhiều bộ dữ liệu (Tính năng 11.13)
Tính năng mã 11.13 hỗ trợ một tài khoản người dùng quản lý đồng thời nhiều đơn vị kế toán độc lập, thuận tiện cho các chuỗi có nhiều pháp nhân hoặc nhiều thương hiệu khác nhau (src/modules/tien-ich/index.ts:37).

### 1.14. Xử lý dữ liệu lớn (Tính năng 11.14)
Tính năng mã 11.14 tối ưu hoá hạ tầng xử lý, cho phép lọc và xuất khẩu các báo cáo có dung lượng lớn lên đến 500.000 dòng dữ liệu ra tệp Excel hoặc CSV thông qua tiến trình chạy ngầm (src/modules/tien-ich/index.ts:38).

### 1.15. Nhiều kho cho một điểm bán (Tính năng 11.15)
Tính năng mã 11.15 giải quyết bài toán đặc thù ngành F&B: một nhà hàng có nhiều kho nhỏ như kho bếp, kho bar, kho đồ khô (src/modules/tien-ich/index.ts:39).
Hệ thống tự động định tuyến xuất kho nguyên liệu cho từng món ăn về đúng kho phụ trách (src/modules/tien-ich/index.ts:40).

### 1.16. Bảng điều khiển Dashboard và các tiện ích mở rộng (11.16, X1, X2, X3)
Tính năng 11.16 cung cấp bảng điều khiển Dashboard tổng quan tình hình tài chính doanh nghiệp (src/modules/home/TongQuan.tsx:1).
Tiện ích X1 xác nhận khả năng truy cập trên mọi trình duyệt web hiện đại không cần cài đặt phần mềm (src/modules/tien-ich/index.ts:41).
Tiện ích X2 cung cấp hệ thống Nhật ký thao tác chi tiết truy vết mọi hành vi người dùng (src/modules/he-thong/HeThong.tsx:1).
Tiện ích X3 hỗ trợ xem báo cáo và duyệt chứng từ nhanh trên ứng dụng điện thoại di động (src/modules/tien-ich/index.ts:43).

---

## 2. Phân hệ Hệ thống (Module 13)

Phân hệ Hệ thống tại `src/modules/he-thong/` quản lý toàn bộ các thiết lập cốt lõi của đơn vị kế toán (src/modules/he-thong/index.ts:7):

### 2.1. Quản lý người sử dụng (Màn hình `nguoi-dung`)
Màn hình Người sử dụng chỉ mở cho gói Plus và gói Pro, gói Standard giới hạn một tài khoản chủ quán duy nhất (src/modules/he-thong/index.ts:12, T472).
Hệ thống cho phép thêm mới tài khoản nhân viên, thiết lập họ tên, email đăng nhập, gán chức vụ vai trò và phân công phạm vi các cửa hàng được phép truy cập (src/modules/he-thong/huong-dan.ts:6).
Tài khoản Kế toán trưởng và Chủ doanh nghiệp được kích hoạt tính năng bảo mật xác thực hai lớp (2FA) (src/modules/he-thong/huong-dan.ts:15).

### 2.2. Chức vụ và phân quyền (Màn hình `phan-quyen`)
Màn hình Chức vụ và phân quyền cho phép thiết lập ma trận bảo mật chi tiết theo từng chức danh nhân sự (QD95, src/modules/he-thong/index.ts:13):
Hệ thống cung cấp sẵn các chức vụ mẫu gồm Kế toán trưởng, Kế toán viên, Thủ quỹ, Thủ kho và Chủ doanh nghiệp.
Phân quyền được thiết lập độc lập cho từng tính năng của 14 phân hệ theo 6 hành vi cơ bản: Xem danh sách, Thêm mới, Chỉnh sửa, Xoá dữ liệu, Ghi sổ chứng từ và Khoá sổ kế toán (QD95, src/modules/he-thong/huong-dan.ts:24).

### 2.3. Thông tin đơn vị kế toán (Màn hình `thong-tin`)
Màn hình Thông tin đơn vị quản lý hồ sơ pháp lý và chế độ kế toán của doanh nghiệp (src/modules/he-thong/huong-dan.ts:61):
- Thông tin pháp lý: tên đơn vị, mã số thuế, địa chỉ trụ sở chính dùng để in ấn trên chứng từ và báo cáo tài chính.
- Thiết lập chế độ: lựa chọn loại hình (Hộ kinh doanh hoặc Doanh nghiệp), chế độ thông tư kế toán áp dụng (TT152, TT58, TT133, TT99) và năm tài chính làm việc (src/app/session.tsx:36).
- Thiết lập thuế: lựa chọn phương pháp tính thuế GTGT và thuế TNDN theo quy định (src/app/session.tsx:39).
- Phương pháp tính giá kho: thiết lập ngày đầu năm tài chính và phương pháp tính giá xuất kho (bình quân gia quyền, nhập trước xuất trước) (src/modules/he-thong/huong-dan.ts:66).

### 2.4. Cấu hình kế toán (Màn hình `cau-hinh`)
Màn hình Cấu hình kế toán thiết lập các tham số vận hành tự động cho toàn hệ thống (src/modules/he-thong/huong-dan.ts:80):
- Bộ định khoản tự động: cài đặt sẵn tài khoản Nợ và tài khoản Có mặc định cho từng nghiệp vụ thu tiền, chi tiền, mua hàng, bán hàng, xuất nhập kho (src/modules/he-thong/huong-dan.ts:83).
- Quy tắc đánh số chứng từ: cấu hình tiền tố (ví dụ PT cho phiếu thu, PC cho phiếu chi, PN cho phiếu nhập), mẫu số và quy tắc tăng số tự động theo tháng hoặc theo năm (src/modules/he-thong/huong-dan.ts:85).
- Định dạng chữ số: thiết lập kiểu hiển thị dấu chấm và dấu phẩy phân cách hàng nghìn theo chuẩn Việt Nam hoặc quốc tế (T710, src/app/session.tsx:53).

### 2.5. Khoá sổ kế toán (Màn hình `khoa-so`)
Màn hình Khoá sổ kế toán cho phép chốt số liệu tài chính theo từng tháng làm việc để ngăn chặn hành vi sửa đổi dữ liệu quá khứ (src/modules/he-thong/huong-dan.ts:97):
Gói Standard có tab Khoá sổ riêng trong phân hệ Hệ thống, các gói khác dùng màn hình Khoá sổ cuối kỳ mã 10.1.6 trong phân hệ Tổng hợp (T315, src/modules/he-thong/index.ts:17).
Trước khi khoá sổ, hệ thống thực hiện kiểm tra điều kiện: kiểm tra chứng từ chưa ghi sổ, kiểm tra số dư âm kho, kiểm tra chênh lệch số phát sinh (QD113).
Sau khi khoá sổ thành công, mọi chứng từ thuộc kỳ đã khoá đều bị chặn thao tác sửa hoặc xoá (src/modules/he-thong/huong-dan.ts:98).

### 2.6. Quản lý gói thuê bao (Màn hình `goi-thue-bao`)
Màn hình Gói thuê bao hiển thị thông tin gói dịch vụ đang kích hoạt (Standard, Plus, Pro), ngày bắt đầu, ngày hết hạn và danh sách tính năng khả dụng (src/modules/he-thong/index.ts:19).
Cung cấp nút nâng cấp gói trực tiếp và hiển thị nhãn trạng thái các tính năng sắp ra mắt trong lộ trình phát triển (T663).

### 2.7. Nhật ký thao tác người dùng (Màn hình `nhat-ky`)
Màn hình Nhật ký thao tác ghi nhận toàn bộ lịch sử tương tác trên hệ thống để phục vụ công tác thanh tra và kiểm soát nội bộ (src/modules/he-thong/huong-dan.ts:43):
- Ghi nhận chi tiết: thời điểm phát sinh, tài khoản thực hiện, loại hành động (đăng nhập, thêm mới, chỉnh sửa, xoá, ghi sổ, khoá sổ, xuất Excel), tên chứng từ và địa chỉ IP truy cập (src/modules/he-thong/huong-dan.ts:47).
- Tính toàn vẹn: dữ liệu nhật ký do hệ thống tự động ghi nhận, không có bất kỳ cá nhân nào có quyền chỉnh sửa hoặc xoá bỏ bản ghi nhật ký (src/modules/he-thong/huong-dan.ts:49).

---

## 3. Trung tâm thông báo hệ thống (Notification Center)

Trung tâm thông báo được bố trí tại `src/app/thong-bao/` nhằm đảm bảo thông tin quan trọng được truyền đạt kịp thời tới người dùng:
- Biểu tượng chuông thông báo trên thanh Topbar hiển thị số lượng thông báo mới chưa đọc (src/app/thong-bao/ThanhTren.tsx:1).
- Phân loại thông báo: thông báo đồng bộ dữ liệu POS thành công, thông báo chứng từ chờ duyệt, thông báo cảnh báo âm kho và thông báo chính sách thuế mới từ cơ quan quản lý.
- Màn hình Tất cả thông báo tại `src/app/thong-bao/TatCaThongBao.tsx` cho phép xem lại toàn bộ lịch sử thông báo, đánh dấu đã đọc hoặc lọc thông báo theo từng danh mục nghiệp vụ cụ thể.

---

## 4. Danh mục ngành nghề tính thuế theo Thông tư 58/2024/TT-BTC

Tệp bảng tính quản trị `docs/NGANH-NGHE-THUE-TT58.xlsx` quy định chi tiết tỷ lệ phần trăm tính thuế Giá trị gia tăng (GTGT) và thuế Thu nhập doanh nghiệp (TNDN) cho các hộ kinh doanh và doanh nghiệp áp dụng phương pháp tỷ lệ doanh thu theo Thông tư 58.

Dưới đây là bảng tổng hợp 4 nhóm ngành nghề chính và mức thuế suất áp dụng trong IACC Cloud:

| Nhóm ngành nghề chính | Chi tiết các hoạt động kinh doanh cụ thể | Tỷ lệ % thuế GTGT | Tỷ lệ % thuế TNDN | Hướng dẫn áp dụng trong IACC Cloud |
| :--- | :--- | :---: | :---: | :--- |
| **1. Phân phối, cung cấp hàng hoá** | Bán buôn, bán lẻ các loại hàng hoá tiêu dùng, nguyên liệu đóng gói sẵn (trừ hàng hoá đại lý hưởng hoa hồng). | **1%** | **1%** | Áp dụng cho các cửa hàng F&B có bán kèm hàng hoá đóng gói sẵn mang về (bánh kẹo, cà phê gói, trà đóng hộp, nước ngọt đóng chai). |
| **2. Dịch vụ, xây dựng không bao thầu NVL** | - Lưu trú khách sạn, nhà trọ, dịch vụ ăn uống phục vụ tại chỗ.<br>- Cho thuê mặt bằng, cửa hàng, kho bãi, phương tiện vận tải.<br>- Tư vấn pháp luật, tài chính, kế toán, kiểm toán, dịch vụ CNTT.<br>- Dịch vụ karaoke, vũ trường, massage, bi-a, trò chơi điện tử.<br>- May đo, giặt là, cắt tóc, làm đầu, sửa chữa đồ dùng gia đình. | **5%** | **5%** | Nhóm thuế suất cốt lõi cho các nhà hàng, quán ăn, quán cà phê kinh doanh dịch vụ ăn uống tại chỗ hoặc dịch vụ giải trí đi kèm. |
| **2a. Hoạt động đặc thù thuộc nhóm Dịch vụ** | Các hoạt động giáo dục, đào tạo, y tế, biểu diễn nghệ thuật giải trí chuyên nghiệp. | **5%** | **2%** | Áp dụng khi đơn vị có đăng ký các hoạt động biểu diễn âm nhạc, đêm nhạc nghệ thuật có thu phí tại quán. |
| **2b. Hoạt động tài chính** | Thu nhập từ lãi tiền gửi ngân hàng, lãi cho vay vốn kinh doanh. | **-** | **5%** | Hệ thống tự động tách dòng lãi tiền gửi từ sao kê ngân hàng để áp mức thuế TNDN 5%, không tính thuế GTGT. |
| **3. Sản xuất, vận tải, dịch vụ gắn với hàng hoá** | - Sản xuất, gia công, chế biến sản phẩm hàng hoá thực phẩm.<br>- Vận tải hàng hoá, vận chuyển hành khách, giao đồ ăn nhanh.<br>- Dịch vụ sửa chữa, bảo dưỡng máy móc thiết bị ngành bếp.<br>- Xây dựng, lắp đặt công trình có bao thầu nguyên vật liệu. | **3%** | **2%** | Áp dụng cho các đơn vị có xưởng sơ chế, bếp trung tâm sản xuất thực phẩm cung cấp cho chuỗi hoặc nhận gia công thực phẩm. |
| **4. Hoạt động kinh doanh khác** | - Sản xuất sản phẩm chịu thuế GTGT khấu trừ mức 5%.<br>- Cung ứng dịch vụ chịu thuế GTGT khấu trừ mức 5%.<br>- Các hoạt động kinh doanh phát sinh khác chưa được liệt kê. | **2%** | **2%** | Áp dụng cho các khoản doanh thu phụ trợ khác của nhà hàng không thuộc 3 nhóm trên. |

Khi thiết lập hồ sơ tại màn hình Thông tin đơn vị, kế toán lựa chọn ngành nghề kinh doanh chính.
Hệ thống sẽ tự động gán tỷ lệ phần trăm thuế GTGT và thuế TNDN tương ứng vào công thức tính thuế trên các chứng từ bán hàng POS và tờ khai thuế định kỳ (src/app/session.tsx:39, src/modules/thue/index.ts:15).

---

## 5. Phân định trạng thái các tính năng Tiện ích và Hệ thống

Nhằm giúp đội ngũ triển khai và bán hàng tư vấn chính xác cho khách hàng, trạng thái các tính năng được phân định rõ:

### 5.1. Đã có trong bản mẫu
Toàn bộ giao diện người dùng của 16 tính năng Tiện ích bổ sung và 7 màn hình Hệ thống (src/modules/tien-ich/index.ts:13, src/modules/he-thong/index.ts:7).
Giao diện mô phỏng đồng bộ bán hàng từ FABi, tính toán xuất kho theo công thức và nhận hoá đơn đầu vào (src/modules/tien-ich/TienIch.tsx:1).
Cơ chế phân quyền người dùng theo chức vụ và phân công cửa hàng trên giao diện (src/modules/he-thong/HeThong.tsx:10).
Bảng nhật ký thao tác mô phỏng đầy đủ các hành vi thêm, sửa, xoá chứng từ (src/modules/he-thong/nhatKyMau.ts:1).
Công cụ xem trước và tuỳ biến mẫu in chứng từ tiêu chuẩn khổ A4 (src/modules/tien-ich/ThietKeMauIn.tsx:1).
Bảng danh mục ngành nghề và thuế suất theo Thông tư 58 tích hợp vào công thức tính thuế mô phỏng (docs/NGANH-NGHE-THUE-TT58.xlsx).

### 5.2. Dự kiến / chưa làm
Repo chưa có kế hoạch riêng cho chủ đề này ngoài phần backend (file 09, mục 2). Tính năng chưa làm xem file 12 (Tiến độ việc), dòng trạng thái `Chưa làm`, `Chờ`.

### 5.3. Chưa chốt
Repo không ghi việc nào đang chờ chốt trong chủ đề này. Việc đang mở xem file 12 (Tiến độ việc). Quyết định đang soạn xem các mục có chữ `(đang soạn)` trong file 07.

