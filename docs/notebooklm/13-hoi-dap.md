# 13. Hỏi đáp mẫu — IACC Cloud (iaccdemo)
Bản xuất từ repo iaccdemo commit 98d2bb3, ngày 23/11/2026.

## Phạm vi tài liệu
Tài liệu này tổng hợp 72 câu hỏi đáp mẫu dành cho sale, triển khai và dev mới. Nội dung giải đáp về gói tính năng, nghiệp vụ kế toán, định khoản chứng từ, màn hình, báo cáo, điện thoại, đồng bộ hệ sinh thái, kỹ thuật và quy trình nhóm. Chi tiết chuyên sâu của từng chủ đề được dẫn chiếu cụ thể về các tài liệu nguồn từ 01 đến 11.


## 1. Gói dịch vụ và giá trị sử dụng

### Hỏi: IACC Cloud hiện có những gói dịch vụ nào và mức giá ra sao?
Hệ thống hiện cung cấp ba gói dịch vụ chính: Standard, Plus và Pro (QD80). Gói Standard có mức giá 0 đồng, tiếp nhận toàn bộ tính năng của gói Free cũ (QD80). Gói Plus và gói Pro là hai gói trả phí dành cho nhà hàng và doanh nghiệp vừa và lớn (QD80). Mức giá niêm yết thương mại chính thức của gói Plus và Pro sẽ được công bố khi phát hành backend (docs/KIEN-TRUC.md:30).
Xem file 01, mục 2.

### Hỏi: Gói Free trước đây có còn tồn tại trên hệ thống không?
Gói Free đã được bãi bỏ hoàn toàn theo quyết định QD80 vào ngày 23/10/2026. Toàn bộ tính năng của gói Free cũ được chuyển giao trọn vẹn sang gói Standard (QD80). Mã nhận diện gói chuyển từ ký tự F sang S (QD80). Biểu tượng đại diện của gói là chiếc khiên màu xanh ngọc (src/styles/app.css:29).
Xem file 01, mục 2.1.

### Hỏi: Gói Standard hỗ trợ những chế độ kế toán nào?
Gói Standard hỗ trợ mặc định Chế độ kế toán hộ kinh doanh theo Thông tư 152/2025/TT-BTC (src/app/che-do.ts:31). Ngoài ra, doanh nghiệp siêu nhỏ dùng gói Standard được áp dụng Thông tư 58/2026/TT-BTC theo trường hợp 1 (src/app/che-do.ts:35). Doanh nghiệp chỉ nộp thuế theo tỷ lệ phần trăm doanh thu và theo dõi Sổ doanh thu S1-DNSN (T632).
Xem file 02, mục 2.

### Hỏi: Những khách hàng nào nên lựa chọn gói Plus?
Gói Plus phù hợp cho doanh nghiệp F&B có từ 1 đến 3 điểm bán (src/app/session.tsx:20). Gói đáp ứng nhu cầu quản lý mua bán hàng hoá, kho nguyên vật liệu và điều chuyển kho (QD112). Gói cũng hỗ trợ xuất hoá đơn điện tử trực tiếp và áp dụng Thông tư 58 hoặc Thông tư 152 (src/app/che-do.ts:33).
Xem file 01, mục 1.2 và 2.4.

### Hỏi: Điểm khác biệt lớn nhất giữa gói Plus và gói Pro là gì?
Gói Pro mở đầy đủ tính năng kế toán tổng hợp với hệ thống tài khoản Nợ/Có theo Thông tư 99 và Thông tư 133 (src/app/che-do.ts:33). Gói Pro có chức năng ghi sổ và bỏ ghi sổ chứng từ (QD81). Gói Pro hỗ trợ tính giá thành nhiều cấp và quản lý tài sản cố định chuyên sâu (src/app/registry.ts:12). Gói Plus không có ghi sổ và không dùng hệ thống tài khoản kép (QD81).
Xem file 01, mục 2.2.

### Hỏi: Gói Standard có được hạch toán định khoản Nợ/Có không?
Gói Standard không sử dụng định khoản Nợ/Có (QD81). Giao diện chứng từ ẩn toàn bộ các cột tài khoản kế toán, khoản mục chi phí và mã công việc (docs/TONG-KET-LOGIC-STANDARD.md:15). Người dùng chỉ cần nhập lý do thu chi và số tiền thực tế (docs/TONG-KET-LOGIC-STANDARD.md:102). Chứng từ sau khi lưu sẽ tự động cập nhật số dư vào các sổ sách liên quan (docs/TONG-KET-LOGIC-STANDARD.md:15).
Xem file 02, mục 3.

### Hỏi: Khi chuyển đổi gói từ Standard lên Plus thì dữ liệu cũ có bị ảnh hưởng không?
Dữ liệu cũ được bảo toàn nguyên vẹn khi chuyển đổi gói thuê bao (src/app/session.tsx:83). Hệ thống tự động chuyển chế độ kế toán sang chế độ mặc định của gói mới nếu chế độ cũ không tương thích (src/app/che-do.ts:39-41). Các phân hệ bổ sung của gói mới sẽ tự động hiển thị trên thanh điều hướng (src/app/registry.ts:201).
Xem file 02, mục 2.2.

### Hỏi: Gói nào trong hệ thống hỗ trợ phát hành hoá đơn điện tử trực tiếp?
Tính năng phát hành hoá đơn điện tử trực tiếp có từ gói Plus và gói Pro (QD106). Gói Standard chỉ hỗ trợ xem danh sách hoá đơn bán hàng đổ về từ máy tính tiền (src/app/plan.ts:59). Doanh nghiệp dùng gói Plus và Pro có thể lập hoá đơn điều chỉnh và thay thế trực tiếp trên web (QD106).
Xem file 01, mục 3.4.


## 2. Chế độ kế toán và nguyên lý vận hành

### Hỏi: Hệ thống IACC Cloud hỗ trợ những chế độ kế toán pháp định nào?
Hệ thống thiết kế đáp ứng 4 chế độ kế toán hiện hành của Bộ Tài chính Việt Nam (src/app/che-do.ts:4-23). Bốn chế độ gồm Thông tư 152 cho hộ kinh doanh, Thông tư 58 cho doanh nghiệp siêu nhỏ (src/app/che-do.ts:19-20). Hai chế độ doanh nghiệp gồm Thông tư 133 cho doanh nghiệp vừa và nhỏ, Thông tư 99 cho doanh nghiệp tiêu chuẩn (src/app/che-do.ts:21-22).
Xem file 02, mục 1.

### Hỏi: Hộ kinh doanh cá thể theo Thông tư 152 ghi chép sổ sách như thế nào?
Hộ kinh doanh áp dụng kiểu ghi sổ đơn, không dùng tài khoản kế toán kép (src/app/che-do.ts:19). Người dùng theo dõi trực tiếp dòng tiền qua Sổ quỹ tiền mặt, Sổ tiền gửi và Sổ doanh thu (src/modules/bao-cao/danh-sach.ts:107). Thuế GTGT đầu vào không được khấu trừ mà tính thẳng vào giá trị mua hàng (docs/TONG-KET-LOGIC-STANDARD.md:188).
Xem file 02, mục 1.1 và 3.2.

### Hỏi: Doanh nghiệp siêu nhỏ áp dụng Thông tư 58 có phải hạch toán Nợ/Có không?
Theo quy định Thông tư 58, doanh nghiệp siêu nhỏ ghi nhận nghiệp vụ vào các mẫu sổ chuyên dụng (src/app/che-do.ts:20). Trong bản mẫu IACC Cloud, cả gói Standard và gói Plus chạy Thông tư 58 đều không hiển thị Nợ/Có (QD81). Người dùng không thao tác ghi sổ hay chọn tài khoản đối ứng (QD81, T825).
Xem file 02, mục 3.1.

### Hỏi: Cơ chế giảm thuế GTGT cho ngành F&B được hệ thống tính toán ra sao?
Đơn vị tính thuế GTGT theo tỷ lệ phần trăm doanh thu được giảm 20% mức tỷ lệ thuế theo quy định (src/modules/ban-hang/giam-thue.ts:11-30). Hệ thống tự động tạo dòng tiền giảm thuế trên chứng từ bán hàng (docs/TONG-KET-LOGIC-STANDARD.md:179). Doanh thu thuần của đơn vị bằng tổng thanh toán trừ đi phần tiền thuế được giảm (docs/TONG-KET-LOGIC-STANDARD.md:179).
Xem file 02, mục 3.3.

### Hỏi: Vì sao trên giao diện gói Standard và Plus không có nút Ghi sổ?
Quyết định QD81 xác định gói Standard và Plus không sử dụng quy trình duyệt ghi sổ. Thao tác ghi sổ và bỏ ghi sổ chỉ áp dụng cho gói Pro có hạch toán kép (QD81, T825). Trên gói Standard và Plus, chứng từ hợp lệ khi bấm Lưu sẽ tự động cập nhật ngay vào số dư báo cáo (docs/TONG-KET-LOGIC-STANDARD.md:15).
Xem file 02, mục 3.1.

### Hỏi: Năm tài chính của đơn vị có thể bắt đầu từ những mốc thời gian nào?
Đơn vị được cấu hình ngày bắt đầu năm tài chính là ngày đầu tiên của mỗi quý (docs/TONG-KET-LOGIC-STANDARD.md:77). Bốn mốc hợp lệ gồm ngày 01/01, 01/04, 01/07 và 01/10 (docs/TONG-KET-LOGIC-STANDARD.md:77). Chứng từ mới tạo không được phép có ngày trước ngày đầu năm tài chính đã khai báo (src/ui/generic/ChungTuForm.tsx:402).
Xem file 02, mục 5.1.

### Hỏi: Quy tắc khoá sổ kế toán hoạt động thế nào trên từng gói?
Gói Standard và Plus cho phép khoá sổ linh hoạt theo từng tháng và từng cửa hàng riêng biệt (QD20). Thao tác thực hiện tại phân hệ Hệ thống (src/modules/tong-hop/KhoaSoStandard.tsx). Gói Pro thực hiện khoá sổ tập trung cho toàn bộ đơn vị tại phân hệ Kế toán tổng hợp (src/modules/tong-hop/CuoiKy.tsx:44). Kỳ đã khoá sổ sẽ chặn hoàn toàn quyền sửa và xoá chứng từ (docs/TONG-KET-LOGIC-STANDARD.md:20).
Xem file 02, mục 5.4.

### Hỏi: Bút toán kết chuyển xác định kết quả kinh doanh cuối kỳ gồm những bước nào?
Màn hình Kết chuyển tự động gom doanh thu từ tài khoản loại 5 và chi phí từ tài khoản loại 6, 8 sang tài khoản 911 (src/modules/tong-hop/index.ts:24-25). Chênh lệch doanh thu lớn hơn chi phí được kết chuyển lãi sang bên Có tài khoản 4212 (src/modules/tong-hop/CuoiKy.tsx:60). Nếu chi phí lớn hơn doanh thu, hệ thống ghi nhận lỗ sang bên Nợ tài khoản 4212 (src/modules/tong-hop/CuoiKy.tsx:61).
Xem file 02, mục 6.1.


## 3. Định khoản và chứng từ kế toán

### Hỏi: Các định khoản kế toán trong bản mẫu hiện tại được lưu ở đâu?
Toàn bộ định khoản kế toán trong bản mẫu hiện tại được khai báo trong mảng `noCo` tại tệp `index.ts` của từng phân hệ (src/modules/*/index.ts). Đây là các định khoản mẫu minh hoạ luồng nghiệp vụ F&B (docs/KIEN-TRUC.md:30). Bản mẫu chưa có cơ sở dữ liệu và engine hạch toán tự động ở backend (docs/KIEN-TRUC.md:30).
Xem file 04, mục 1.

### Hỏi: Nghiệp vụ thu tiền mặt từ khách hàng được định khoản thế nào?
Theo chế độ Thông tư 99 và 133, phiếu thu tiền mặt thu nợ ghi Nợ TK 1111 và Có TK 131 (src/modules/tien/index.ts:36). Thu tiền bán hàng trực tiếp ghi Nợ TK 1111 và Có TK 5111, Có TK 33311 (docs/TONG-KET-LOGIC-STANDARD.md:157). Đối với Thông tư 58, phiếu thu ghi trực tiếp vào Sổ quỹ tiền mặt S2d-DNSN mà không dùng tài khoản (src/modules/tien/index.ts:35).
Xem file 04, mục 2.1.

### Hỏi: Nghiệp vụ chi tiền mặt mua nguyên vật liệu hoặc chi phí được hạch toán ra sao?
Phiếu chi tiền mặt mua vật tư ghi Nợ TK 6421 và Có TK 1111 kèm thuế Nợ TK 1331 (src/modules/tien/index.ts:33). Trả nợ tiền mua hàng cho nhà cung cấp ghi Nợ TK 331 và Có TK 1111 (src/modules/tien/index.ts:42). Chi tiền mặt chờ phân bổ nhiều tháng ghi Nợ TK 242 và Có TK 1111 (src/modules/tien/index.ts:18).
Xem file 04, mục 2.2.

### Hỏi: Phiếu bán hàng ngoài POS mã 3.1.7 định khoản những tài khoản nào?
Phiếu bán hàng lập tay ghi nhận doanh thu ghi Nợ TK 1111 và Có TK 5111 (src/modules/ban-hang/ChungTuBanHang.tsx:45). Thuế GTGT đầu ra ghi Nợ TK 1111 và Có TK 33311 (src/modules/ban-hang/ChungTuBanHang.tsx:45). Đồng thời, phiếu tự động ghi nhận giá vốn hàng xuất bán ghi Nợ TK 632 và Có TK 152 (src/modules/ban-hang/ChungTuBanHang.tsx:45).
Xem file 04, mục 3.3.

### Hỏi: Khi xuất kho nguyên vật liệu theo định lượng món bán, hệ thống hạch toán bút toán gì?
Phiếu xuất kho định lượng mã 5.1.2 hạch toán giá vốn nguyên vật liệu tiêu hao (src/modules/ban-hang/index.ts:32-33). Bút toán ghi Nợ TK 632 và Có TK 152 (src/modules/ban-hang/index.ts:33). Theo Thông tư 58, phiếu ghi nhận vào Sổ chi phí S2b-DNSN và Sổ vật liệu S2c-DNSN (src/modules/ban-hang/index.ts:33).
Xem file 04, mục 3.2.

### Hỏi: Phiếu điều chuyển kho giữa các chi nhánh định khoản như thế nào?
Xuất điều chuyển kho mã 5.1.4 ghi Nợ TK 1368 và Có TK 152 tại kho xuất (src/modules/kho/dieu-chuyen.ts:16). Nhập điều chuyển kho mã 5.1.4-2 ghi Nợ TK 152 và Có TK 3368 tại kho nhận (src/modules/kho/dieu-chuyen.ts:17). Riêng phiếu Xuất chuyển kho nội bộ một chi nhánh không sinh bút toán Nợ/Có (src/modules/kho/dieu-chuyen.ts:18).
Xem file 04, mục 5.3.

### Hỏi: Khi kiểm kê kho phát hiện thừa hoặc thiếu nguyên vật liệu, bút toán sinh ra là gì?
Kiểm kê thiếu tự động sinh phiếu Xuất điều chỉnh XDC ghi Nợ TK 1381 và Có TK 152 (src/modules/kho/index.ts:39). Kiểm kê thừa tự động sinh phiếu Nhập điều chỉnh NDC ghi Nợ TK 152 và Có TK 3381 (src/modules/kho/index.ts:40). Phiếu kiểm kê gốc chỉ lưu số lượng thực tế, không ghi tiền trực tiếp (docs/TONG-KET-LOGIC-STANDARD.md:195).
Xem file 04, mục 5.5.

### Hỏi: Nghiệp vụ thanh lý tài sản cố định hạch toán những tài khoản nào?
Thanh lý tài sản cố định ghi giảm hao mòn luỹ kế Nợ TK 2141 và Có TK 211 (src/modules/tscd/index.ts:59). Giá trị còn lại chưa khấu hao hết đưa vào chi phí khác Nợ TK 811 và Có TK 211 (src/modules/tscd/index.ts:59). Số tiền thu được từ thanh lý ghi tăng quỹ Nợ TK 1111 và tăng thu nhập khác Có TK 711 (src/modules/tscd/index.ts:59).
Xem file 04, mục 6.1.

### Hỏi: Nghiệp vụ phân bổ chi phí trả trước và công cụ dụng cụ hạch toán ra sao?
Ghi tăng thẻ phân bổ chi phí ghi Nợ TK 242 và Có TK 1111, 1121 hoặc 331 (src/modules/ccdc/index.ts:20). Định kỳ hàng tháng, hệ thống trích phân bổ vào chi phí ghi Nợ TK 6421 hoặc 6422 và Có TK 242 (src/modules/ccdc/the-phan-bo.ts). Khi ghi giảm CCDC hỏng, giá trị còn lại được phân bổ hết vào Nợ TK 6421 và Có TK 242 (src/modules/ccdc/index.ts:124).
Xem file 04, mục 6.2.


## 4. Màn hình chức năng và thao tác

### Hỏi: Hệ thống gồm bao nhiêu phân hệ và mở theo quy tắc nào?
Hệ thống được cấu trúc thành 14 phân hệ nghiệp vụ chính (src/app/registry.ts:12). Phân hệ chỉ hiển thị trên thanh điều hướng khi có ít nhất một màn hình được mở trong gói đang dùng (src/app/registry.ts:201). Toàn bộ tính năng ngoài gói thuê bao đang kích hoạt sẽ bị ẩn hoàn toàn (QD22, src/app/plan.ts:228).
Xem file 03, mục 1.1.

### Hỏi: Sáu màn hình mẫu dùng chung (generic screens) gồm những màn hình nào?
Sáu màn hình mẫu dùng chung gồm: CatalogScreen cho danh mục, VoucherScreen cho danh sách chứng từ (src/ui/generic/). ChungTuForm là form lập sửa chứng từ toàn màn hình, ReportScreen hiển thị báo cáo (src/ui/generic/). Hai màn hình còn lại là ToolScreen cho chức năng tiện ích và QuyTrinhScreen cho sơ đồ nghiệp vụ (src/ui/generic/).
Xem file 09, mục 1.4.

### Hỏi: Màn hình VoucherScreen hiển thị những vùng thông tin nào?
VoucherScreen chia thành hai vùng hiển thị chính theo chiều dọc (src/ui/generic/VoucherScreen.tsx). Vùng phía trên là bảng danh sách các chứng từ kèm bộ lọc và các nút thao tác (QD25). Vùng phía dưới hiển thị chi tiết các dòng hàng hoá, thuế suất và hạch toán của chứng từ đang chọn (QD27).
Xem file 06, mục 3.2.

### Hỏi: Các trạng thái của chứng từ được nhận biết qua màu sắc nào trên danh sách?
Trên giao diện gói Pro, chứng từ Chưa ghi sổ hiển thị vạch màu vàng ở đầu dòng (QD27). Chứng từ bị lỗi hạch toán hoặc cảnh báo hiển thị nền màu đỏ nhạt (QD27). Chứng từ Đã ghi sổ hiển thị nền trắng bình thường không có vạch màu (QD27). Gói Standard và Plus không hiển thị trạng thái ghi sổ (QD81).
Xem file 04, mục 1.1.

### Hỏi: Thao tác hàng loạt trên danh sách chứng từ cho phép thực hiện những việc gì?
Khi tích chọn nhiều chứng từ, người dùng có thể thực hiện Ghi sổ hoặc Bỏ ghi sổ đồng loạt (QD25). Hệ thống cũng hỗ trợ In hàng loạt, Xuất dữ liệu Excel hàng loạt và Xoá các chứng từ chưa ghi sổ (QD25). Menu thao tác hàng loạt tự động mở khi người dùng bấm vào ô chọn tất cả (QD27).
Xem file 06, mục 3.3.

### Hỏi: Người dùng có thể tìm kiếm nhanh chứng từ và chức năng bằng cách nào?
Người dùng bấm tổ hợp phím Ctrl+K để mở hộp tìm kiếm nhanh CommandPalette (QD01, src/app/CommandPalette.tsx). Công cụ hỗ trợ gõ tiếng Việt không dấu để tìm kiếm màn hình chức năng, danh mục hoặc số chứng từ (QD01). Bấm Enter để chuyển hướng ngay tới màn hình tương ứng (src/app/CommandPalette.tsx:40).
Xem file 06, mục 2.2.

### Hỏi: Khi nào các nút Sửa và Xoá chứng từ bị vô hiệu hoá?
Nút Sửa và Xoá bị vô hiệu hoá khi chứng từ thuộc tháng hoặc cửa hàng đã thực hiện khoá sổ kế toán (docs/TONG-KET-LOGIC-STANDARD.md:20). Chứng từ bán hàng đã phát hành hoá đơn điện tử cũng không được phép sửa xoá (QD106). Phiếu kiểm kê kho đã tự sinh phiếu điều chỉnh cũng bị khoá thao tác chỉnh sửa (docs/TONG-KET-LOGIC-STANDARD.md:198).
Xem file 04, mục 1.3.

### Hỏi: Màn hình Kiểm tra cuối kỳ thực hiện kiểm tra những tiêu chuẩn số liệu nào?
Màn hình kiểm tra tự động 7 tiêu chuẩn số liệu trước khi cho phép khoá sổ (src/modules/tong-hop/CuoiKy.tsx:13-42). Bảy tiêu chuẩn gồm: doanh thu POS khớp sổ, hoá đơn khớp doanh thu, không âm kho và không âm quỹ (src/modules/tong-hop/CuoiKy.tsx:14-20). Ba tiêu chuẩn còn lại là hết chứng từ chưa ghi, hết hoá đơn đầu vào chưa lập và cân đối tài sản nguồn vốn (src/modules/tong-hop/CuoiKy.tsx:17-19).
Xem file 02, mục 5.2.


## 5. Báo cáo tài chính và mẫu in ấn

### Hỏi: Hệ thống cung cấp những báo cáo tài chính pháp định nào?
Hệ thống cung cấp 4 báo cáo tài chính pháp định cho gói Plus và gói Pro (src/modules/bao-cao/danh-sach.ts:144-148). Bốn báo cáo gồm Báo cáo tình hình tài chính B01, Báo cáo kết quả hoạt động kinh doanh B02 (src/modules/tong-hop/BaoCaoTaiChinh.tsx). Hai báo cáo còn lại là Báo cáo lưu chuyển tiền tệ B03 và Thuyết minh báo cáo tài chính B09 (src/modules/bao-cao/danh-sach.ts:147-148).
Xem file 05, mục 1.

### Hỏi: Báo cáo kết quả hoạt động kinh doanh gồm những chỉ tiêu cốt lõi nào?
Báo cáo phản ánh Doanh thu thuần mã 10, Giá vốn hàng bán mã 11 và Lợi nhuận gộp mã 20 (src/modules/tong-hop/BaoCaoTaiChinh.tsx). Báo cáo trừ đi Chi phí bán hàng mã 25 và Chi phí quản lý mã 26 để ra Lợi nhuận thuần kinh doanh mã 30 (src/modules/tong-hop/BaoCaoTaiChinh.tsx). Sau khi cộng Lợi nhuận khác mã 40, báo cáo xác định Tổng lợi nhuận kế toán trước thuế mã 50 (src/modules/tong-hop/BaoCaoTaiChinh.tsx).
Xem file 05, mục 1.2.

### Hỏi: Hộ kinh doanh theo Thông tư 152 có những mẫu sổ kế toán nào?
Hộ kinh doanh có trọn bộ 7 mẫu sổ kế toán chuyên dụng (src/modules/bao-cao/danh-sach.ts:107). Các sổ gồm Sổ doanh thu S1-HKD, Sổ chi phí S2c-HKD, Sổ quỹ tiền mặt S3a-HKD và Sổ tiền gửi S3b-HKD (src/modules/bao-cao/danh-sach.ts:108-112). Ba sổ còn lại gồm Sổ vật liệu hàng hoá S4-HKD, Sổ chi phí tiền lương S5-HKD và Sổ công nợ S6-HKD (src/modules/bao-cao/danh-sach.ts:113-115).
Xem file 05, mục 2.1.

### Hỏi: Doanh nghiệp siêu nhỏ theo Thông tư 58 có những mẫu sổ kế toán nào?
Thông tư 58 ban hành trọn bộ 11 mẫu sổ kế toán tinh giản (src/modules/bao-cao/danh-sach.ts:117). Tiêu biểu gồm Sổ doanh thu S1-DNSN, Sổ chi phí sản xuất S2b-DNSN và Sổ vật liệu dụng cụ S2c-DNSN (src/modules/bao-cao/danh-sach.ts:118-121). Tiền mặt và ngân hàng theo dõi trên Sổ tiền S2d-DNSN; công nợ theo dõi trên Sổ công nợ S4a-DNSN (src/modules/bao-cao/danh-sach.ts:122-124).
Xem file 05, mục 2.2.

### Hỏi: Người dùng có thể xuất báo cáo ra những định dạng tệp nào?
Hệ thống hỗ trợ xuất báo cáo ra tệp bảng tính Excel (.xlsx) thông qua thư viện exceljs (QD31). Báo cáo xuất ra giữ nguyên định dạng dòng, cột và công thức tính toán (src/ui/bao-cao/ToGiay.tsx:1). Khi in ấn hoặc lưu tệp PDF, hệ thống sử dụng trực tiếp hộp thoại in chuẩn của trình duyệt web (QD31).
Xem file 05, mục 4.2.

### Hỏi: Quy tắc hiển thị khối chữ ký trên mẫu in chứng từ phụ thuộc vào điều gì?
Khối chữ ký được tự động điều chỉnh theo chế độ kế toán đang kích hoạt (src/app/mau-in.ts:190). Chế độ Thông tư 133 và 99 có 5 chức danh gồm Người lập, Người nhận, Thủ kho, Kế toán trưởng và Giám đốc (src/app/mau-in.ts:192). Chế độ Thông tư 152 của hộ kinh doanh chỉ gồm 2 chữ ký: Người lập biểu và Đại diện hộ kinh doanh (src/app/mau-in.ts:196).
Xem file 05, mục 3.2.

### Hỏi: Mẫu in chứng từ có hiện cột Tài khoản Nợ và Có đối với hộ kinh doanh không?
Mẫu in tự động ẩn cột Tài khoản Nợ và Có khi đơn vị sử dụng chế độ không dùng Nợ/Có (src/app/mau-in.ts:201). Đối với Thông tư 152 hoặc Thông tư 58 trường hợp 1, chứng từ chỉ hiển thị số tiền và diễn giải nội dung (src/app/mau-in.ts:202). Cột tài khoản đối ứng chỉ xuất hiện khi in từ đơn vị dùng chế độ Nợ/Có (src/app/mau-in.ts:203).
Xem file 05, mục 3.3.

### Hỏi: Công cụ ReportPaper cho phép người dùng tuỳ chỉnh báo cáo như thế nào?
ReportPaper cung cấp thanh công cụ lọc dữ liệu theo từng cửa hàng hoặc xem toàn chuỗi (QD31, src/ui/bao-cao/ReportPaper.tsx). Người dùng có thể tích chọn ẩn các dòng không có số liệu phát sinh để bảng tính gọn gàng (src/ui/bao-cao/ReportPaper.tsx:211). Công cụ cũng hỗ trợ gom nhóm dòng và điều chỉnh cỡ chữ trực tiếp khi xem trước (QD31).
Xem file 05, mục 4.1.


## 6. Giao diện và trải nghiệm trên thiết bị di động

### Hỏi: Ứng dụng trên điện thoại di động chạy qua web hay cài đặt từ kho ứng dụng?
Bản mẫu hiện tại hoạt động trực tiếp trên trình duyệt web của điện thoại di động (src/ui/mobile/MobileShell.tsx:1). Giao diện tự động co giãn và thích ứng hoàn hảo mà không cần cài đặt từ App Store hay Google Play (AGENTS.md:3). Bản cài đặt ứng dụng độc lập thuộc phạm vi phát triển giai đoạn sau (src/modules/tien-ich/index.ts:43).
Xem file 06, mục 4.1.

### Hỏi: Màn hình điện thoại được tối ưu cho độ phân giải nào?
Giao diện di động được thiết kế chuẩn hoá theo bề rộng màn hình tối thiểu 360px (docs/KIEN-TRUC.md:15). Mọi thành phần từ thẻ thông tin, bảng danh sách đến form lập phiếu đều không bị tràn ngang hay vỡ khung (docs/KIEN-TRUC.md:15). Chữ và các nút bấm có kích thước vừa vặn cho thao tác chạm ngón tay (src/styles/app.css:35000).
Xem file 06, mục 4.1.

### Hỏi: Thanh điều hướng dưới đáy màn hình điện thoại gồm những mục nào?
Thanh điều hướng dưới đáy màn hình điện thoại cố định 5 mục chính (src/ui/mobile/MobileShell.tsx:25). Năm mục gồm: Trang chủ, Thu chi tiền, Danh sách chứng từ, Báo cáo và Menu mở rộng (src/ui/mobile/MobileShell.tsx:26-30). Người dùng có thể chuyển đổi nhanh giữa các khu vực tác nghiệp chỉ bằng một lần chạm (src/ui/mobile/MobileShell.tsx:31).
Xem file 06, mục 4.2.

### Hỏi: Thao tác lập phiếu thu chi trên điện thoại có gì khác trên máy tính?
Biểu mẫu trên điện thoại được thiết kế cuộn dọc một màn hình liền mạch (src/ui/mobile/MLapPhieu.tsx). Bàn phím số tự động bật lên khi người dùng chạm vào ô nhập số tiền (src/ui/mobile/MLapPhieu.tsx:120). Các danh mục lựa chọn như người nộp tiền, lý do chi hay quỹ tiền được mở qua tấm trượt từ đáy (src/ui/mobile/MLapPhieu.tsx:150).
Xem file 06, mục 4.3.

### Hỏi: Người dùng xem báo cáo tài chính trên điện thoại dưới dạng nào?
Báo cáo trên điện thoại được chuyển đổi từ bảng nhiều cột sang định dạng các thẻ tóm tắt số liệu (src/ui/mobile/MBaoCaoDong.tsx:18). Người dùng xem nhanh số dư đầu kỳ, tổng phát sinh tăng giảm và số dư cuối kỳ (src/ui/mobile/MBaoCaoDong.tsx:35). Khi cần xem chi tiết, người dùng có thể chạm vào từng dòng để mở danh sách chứng từ cấu thành (src/ui/mobile/MBaoCaoDong.tsx:40).
Xem file 06, mục 4.4.

### Hỏi: Tấm trượt từ đáy (Bottom Sheet) trên điện thoại được dùng trong những trường hợp nào?
Tấm trượt từ đáy được sử dụng thay thế cho toàn bộ các menu thả xuống trên màn hình nhỏ (src/styles/app.css:36000). Thành phần dùng để chọn chi nhánh làm việc, chọn tháng kế toán và chọn đối tượng nộp nhận tiền (src/ui/mobile/MLapPhieu.tsx). Thiết kế này giúp người dùng dễ dàng thao tác bằng một tay trên điện thoại (src/styles/app.css:36050).
Xem file 06, mục 4.3.

### Hỏi: Chủ nhà hàng có thể duyệt chứng từ trên điện thoại di động không?
Chủ nhà hàng có thể duyệt chứng từ trực tiếp trên giao diện điện thoại tại mục Tiện ích (src/ui/mobile/MDuyetChungTu.tsx). Màn hình hiển thị danh sách các phiếu chi, phiếu mua hàng đang chờ phê duyệt kèm số tiền và ghi chú (src/modules/tien-ich/index.ts:25). Người dùng có thể bấm duyệt từng phiếu hoặc duyệt nhanh toàn bộ danh sách (src/modules/tien-ich/TienIch.tsx:120).
Xem file 11, mục 1.5.


## 7. Đồng bộ dữ liệu hệ sinh thái iPOS.vn

### Hỏi: Dữ liệu bán hàng từ máy thu ngân POS FABi được đưa vào IACC Cloud như thế nào?
Tính năng 11.1 tự động đồng bộ hoá đơn bán hàng từ hệ thống FABi về kế toán theo thời gian thực (src/modules/tien-ich/index.ts:18). Hệ thống tiếp nhận thông tin đơn hàng đã thanh toán và sinh chứng từ Xuất bán POS mã 3.1.1 (src/modules/ban-hang/ChungTuBanHang.tsx). Kế toán không cần gõ lại từng hoá đơn bán lẻ hàng ngày (QD01).
Xem file 01, mục 3.2.

### Hỏi: Một hoá đơn bán lẻ trên POS khi đồng bộ sang kế toán sẽ sinh ra chứng từ gì?
Hoá đơn POS khi đồng bộ sang kế toán sẽ tạo chứng từ Xuất bán POS mã 3.1.1 bóc tách chi tiết từng món ăn (src/modules/ban-hang/ChungTuBanHang.tsx). Đồng thời, hệ thống kích hoạt tự động sinh phiếu Xuất kho định lượng mã 5.1.2 để trừ kho nguyên liệu (QD112). Nếu thanh toán tiền mặt hoặc thẻ, hệ thống sinh phiếu thu tương ứng trong phân hệ Tiền (src/app/session.tsx:51).
Xem file 04, mục 3.1.

### Hỏi: Dữ liệu kho từ iPOS Inventory được kế thừa sang IACC Cloud gồm những gì?
Tính năng 11.3 kế thừa toàn bộ danh mục kho hàng, nguyên vật liệu và đơn vị tính từ iPOS Inventory (src/modules/tien-ich/index.ts:22, QD51). Các chứng từ nhập mua nguyên liệu, xuất điều chuyển và biên bản kiểm kê cũng được đồng bộ tự động (src/modules/kho/index.ts:15). Kế toán kho không phải lập lại danh mục và chứng từ trên phần mềm kế toán (QD51).
Xem file 01, mục 3.3.

### Hỏi: Khi món ăn bán ra chưa có công thức định lượng thì hệ thống xử lý thế nào?
Khi phát hiện món ăn mới bán ra chưa có công thức định lượng tiêu hao, hệ thống sẽ đưa món đó vào danh sách chờ xử lý (src/modules/tien-ich/index.ts:20). Hệ thống không tự ý xuất kho để tránh sai lệch số liệu tồn kho (src/modules/tien-ich/index.ts:20). Đồng thời, phần mềm gửi cảnh báo nhắc nhở kế toán cập nhật công thức chế biến (src/modules/tien-ich/index.ts:21).
Xem file 11, mục 1.2.

### Hỏi: Hệ thống ánh xạ các phương thức thanh toán trên POS về các quỹ tiền ra sao?
Cấu hình tại `session.mapPttt` cho phép ánh xạ từng hình thức thanh toán POS về đúng tài khoản quỹ (src/app/session.tsx:52). Tiền mặt thu ngân được chuyển về quỹ tiền mặt của từng cửa hàng (src/app/session.tsx:52). Tiền quẹt thẻ POS hoặc quét mã QR chuyển khoản được tự động đưa về tài khoản ngân hàng tương ứng (src/app/session.tsx:52).
Xem file 01, mục 3.2.

### Hỏi: Tiện ích nhận và đối soát hoá đơn đầu vào hoạt động như thế nào?
Tính năng 11.4 kết nối trực tiếp với cổng hoá đơn điện tử của cơ quan thuế (src/modules/tien-ich/index.ts:24). Phần mềm tự động tải tệp hoá đơn XML của nhà cung cấp xuất cho doanh nghiệp (src/modules/tien-ich/TienIch.tsx:80). Động cơ đối soát tự động so khớp số tiền, ngày lập và thuế suất với các phiếu mua hàng đang chờ hoá đơn trong hệ thống (src/modules/tien-ich/TienIch.tsx:85).
Xem file 11, mục 1.4.

### Hỏi: Tiện ích tải sao kê ngân hàng điện tử hỗ trợ những ngân hàng nào?
Tính năng 11.8 hỗ trợ kết nối và tải sao kê điện tử tự động từ các ngân hàng lớn như Vietcombank và Techcombank (src/modules/tien-ich/index.ts:29). Hệ thống tự động đối soát giao dịch ngân hàng với phiếu thu chi và tiền thanh toán QR (src/modules/tien-ich/index.ts:28). Các giao dịch chưa khớp được đưa vào bảng chờ kế toán xử lý (src/modules/tien-ich/index.ts:30).
Xem file 11, mục 1.8.

### Hỏi: Kết nối cơ quan thuế hỗ trợ những nghiệp vụ trực tuyến nào?
Tính năng 11.9 cho phép kết nối trực tiếp với hệ thống Thuế điện tử bằng chữ ký số của doanh nghiệp (src/modules/tien-ich/index.ts:31). Kế toán có thể nộp tờ khai thuế GTGT, tra cứu thông báo thuế và kiểm tra trạng thái hoá đơn trực tiếp trên phần mềm (src/modules/tien-ich/index.ts:32). Doanh nghiệp không cần đăng nhập vào cổng thuế riêng biệt (src/modules/tien-ich/index.ts:31).
Xem file 11, mục 1.9.


## 8. Kiến trúc kỹ thuật Frontend và Backend

### Hỏi: Bản mẫu iaccdemo được xây dựng bằng những công nghệ lập trình nào?
Bản mẫu iaccdemo được phát triển trên nền tảng React 19.3.0, TypeScript 7.0.2 và Vite 8.3.3 (AGENTS.md:3). Ứng dụng chạy hoàn toàn phía client trên trình duyệt web qua cơ chế Client-Side Rendering (docs/KIEN-TRUC.md:1). Toàn bộ giao diện được định dạng bằng CSS thuần tập trung trong tệp `src/styles/app.css` (docs/KIEN-TRUC.md:10).
Xem file 09, mục 1.1.

### Hỏi: Dữ liệu trong bản mẫu iaccdemo hiện được lưu trữ ở đâu?
Dữ liệu hiển thị trong bản mẫu được sinh tự động từ các hạt giống toán học trong tệp `src/data/mock.ts` (docs/KIEN-TRUC.md:30). Các thao tác thêm mới, sửa đổi hoặc xoá chứng từ của người dùng được lưu tạm vào bộ nhớ trình duyệt `localStorage` (src/app/session.tsx:83). Khi xoá dữ liệu duyệt web, hệ thống sẽ quay về trạng thái dữ liệu mẫu ban đầu (docs/KIEN-TRUC.md:30).
Xem file 09, mục 1.6 và 1.7.

### Hỏi: Cơ chế sinh dữ liệu giả lập có hạt giống (mock seed) mang lại lợi ích gì?
Kỹ thuật sinh số ngẫu nhiên có hạt giống đảm bảo số liệu kinh doanh nhất quán tuyệt đối giữa các lần tải trang (docs/KIEN-TRUC.md:30). Mọi thành viên trong nhóm phát triển đều nhìn thấy cùng một bộ số liệu báo cáo và chứng từ (docs/KIEN-TRUC.md:30). Cơ chế này giúp việc kiểm thử giao diện và phát hiện lỗi lệch số diễn ra thuận lợi (docs/KIEN-TRUC.md:30).
Xem file 09, mục 1.7.

### Hỏi: Tệp app.css có quy mô như thế nào và được tổ chức ra sao?
Tệp `src/styles/app.css` chứa hơn 50.000 dòng mã CSS thuần tập trung của toàn bộ dự án (src/styles/app.css:1). Đầu tệp định nghĩa khối biến giao diện `:root` kiểm soát màu sắc, kích thước và phông chữ (src/styles/app.css:2). Khi thêm CSS mới, lập trình viên gom thành mục riêng ở cuối tệp kèm mã công việc Txxx để tránh xung đột (AGENTS.md:61).
Xem file 09, mục 1.1.

### Hỏi: Trạng thái phiên làm việc (Session) lưu những thông tin gì trong localStorage?
Đối tượng `Session` lưu trữ trạng thái đăng nhập, tên người dùng, vai trò tài khoản và đơn vị kế toán đang làm việc (src/app/session.tsx:94-100). Đối tượng cũng lưu gói thuê bao, chế độ kế toán, cửa hàng được chọn và bảng ánh xạ phương thức thanh toán (src/app/session.tsx:101-111). Dữ liệu được lưu trữ dưới khoá `iacc-cloud-session` trong trình duyệt (src/app/session.tsx:116).
Xem file 09, mục 1.6.

### Hỏi: Định tuyến URL trong ứng dụng web sử dụng cơ chế nào?
Hệ thống sử dụng bộ định tuyến băm HashRouter của thư viện React Router (docs/TRIEN-KHAI.md:11). Định dạng đường dẫn có dạng `#/app/<phân-hệ>/<mã-màn-hình>` (src/App.tsx). Cơ chế băm giúp ứng dụng chạy ổn định trên mọi máy chủ web tĩnh như Cloudflare Pages mà không cần cấu hình viết lại đường dẫn URL (docs/TRIEN-KHAI.md:11).
Xem file 09, mục 1.1.

### Hỏi: Kiến trúc Backend dự kiến trong tương lai sẽ đảm nhận những nhiệm vụ gì?
Backend tương lai sẽ cung cấp hệ cơ sở dữ liệu tập trung lưu trữ an toàn số liệu kế toán của nhiều khách hàng (docs/KIEN-TRUC.md:30). Backend đảm nhận engine hạch toán tự động, khoá sổ kỳ kế toán và kiểm tra cân đối số phát sinh (docs/KIEN-TRUC.md:30). Hệ thống máy chủ cũng chịu trách nhiệm kết nối API trực tiếp với FABi, iPOS Inventory và cổng thuế điện tử (docs/KIEN-TRUC.md:30).
Xem file 09, mục 2.

### Hỏi: Bản mẫu hiện tại đã kết nối API thực tế với máy chủ FABi và IVT chưa?
Bản mẫu iaccdemo hiện tại chưa kết nối API thực tế với bất kỳ máy chủ backend nào (AGENTS.md:3, docs/KIEN-TRUC.md:30). Toàn bộ dữ liệu đơn hàng FABi và chứng từ kho IVT hiển thị trên giao diện là số liệu mô phỏng nội bộ (docs/KIEN-TRUC.md:30). Việc đấu nối cổng API thực tế sẽ được triển khai khi hoàn thiện hạ tầng backend (docs/KIEN-TRUC.md:30).
Xem file 01, mục 7.2.


## 9. Quy trình làm việc và phối hợp nhóm

### Hỏi: Ba thành viên nòng cốt phát triển dự án gồm những ai và phân công ra sao?
Dự án do ba thành viên nòng cốt trực tiếp phát triển (AGENTS.md:3). Trum (`trungkhanhduong93`) là trưởng dự án, quyết định kiến trúc, nghiệp vụ và phê duyệt phiên bản (AGENTS.md:14). PhuongXT phụ trách giao diện các phân hệ kế toán và báo cáo tài chính (AGENTS.md:15). dinhlanphuongipacc phụ trách tiện ích, chứng từ kho, kiểm thử điện thoại và câu chữ (AGENTS.md:16).
Xem file 10, mục 1.1.

### Hỏi: Dự án có áp dụng quy trình duyệt Pull Request trước khi nhập mã không?
Dự án không áp dụng quy trình duyệt kéo mã Pull Request (AGENTS.md:5). Mọi thành viên và các trợ lý AI tự kiểm thử theo quy trình nghiêm ngặt và đẩy mã trực tiếp lên nhánh main (AGENTS.md:5). Robot GitHub Actions sẽ tự động kiểm tra cú pháp và triển khai bản mới lên web xem trước (AGENTS.md:5).
Xem file 10, mục 1.2.

### Hỏi: Bản xem trước trực tuyến và bản phát hành chính thức khác nhau thế nào?
Bản xem trước tại `https://iaccdemo.pages.dev` cập nhật tự động sau mỗi lần đẩy mã lên nhánh main (AGENTS.md:5). Đây là môi trường kiểm thử liên tục của nội bộ đội ngũ phát triển (docs/TRIEN-KHAI.md:19). Bản phát hành chính thức tại `https://i-accounting.pages.dev` chỉ cập nhật khi có thành viên gắn thẻ phiên bản git tag dạng `v*` (AGENTS.md:5).
Xem file 10, mục 1.2 và 4.1.

### Hỏi: Bộ kiểm tra 5 bước bắt buộc trước khi đẩy mã nguồn (push) gồm những gì?
Trước khi đẩy mã có sửa code, thành viên bắt buộc chạy đủ 5 bước kiểm tra (AGENTS.md:61):
1. Chạy `npm run typecheck` không báo lỗi cú pháp TypeScript.
2. Chạy `npm run build` hoàn thành không có lỗi đóng gói.
3. Chạy `python tools/kiem_tra.py --nhanh` đạt thông báo không có lỗi.
4. Chạy `python tools/kiem_van.py <tệp>` cho các tệp giao diện hoặc tài liệu, hết lỗi ĐỎ.
5. Dọn dẹp toàn bộ câu lệnh console.log và đoạn mã thử nghiệm tạm thời.
Xem file 10, mục 2.4.

### Hỏi: Quy trình nhận việc đầu phiên được thực hiện qua các bước nào?
Đầu phiên, thành viên chạy lệnh `python tools/ban_do.py dau-phien <tên GitHub>` để lấy mã công việc Txxx tiếp theo (AGENTS.md:20). Sau đó chuyển trạng thái công việc sang `Đang làm` trong tệp `docs/TIEN-DO.md` (AGENTS.md:23). Thành viên ghi rõ các tệp dùng chung sẽ sửa vào cột Ghi chú và đẩy commit nhận việc lên nhánh main trước khi bắt đầu viết mã (AGENTS.md:24-26).
Xem file 10, mục 2.2.

### Hỏi: Khi phát hiện bẫy kỹ thuật mất trên 15 phút xử lý thì thành viên phải ghi vào đâu?
Khi gặp lỗi kỹ thuật mất hơn 15 phút mới tìm ra nguyên nhân gốc rễ, thành viên ghi chép lại vào tệp `docs/BAY.md` (AGENTS.md:59). Nội dung ghi nhận gồm hiện tượng lỗi bên ngoài, nguyên nhân kỹ thuật bên trong và giải pháp phòng tránh cụ thể (AGENTS.md:59). Việc này giúp đồng đội và các trợ lý AI không lặp lại sai lầm tương tự (docs/BAY.md:1).
Xem file 10, mục 2.3.

### Hỏi: Quyết định thiết kế mới (QD) được ghi nhận và lưu trữ ở tệp nào?
Mọi quyết định mới về bố cục giao diện, nghiệp vụ kế toán, thư viện hoặc cách làm việc đều được ghi chép vào `docs/QUYET-DINH.md` (AGENTS.md:60). Mỗi quyết định được đánh số thứ tự tăng dần từ QD01 kèm ngày tháng và lý do chốt quyết định (docs/QUYET-DINH.md:1). Khi nhận việc mới có khả năng sinh quyết định, thành viên giữ chỗ trước dòng `## QDxx. <tên> (đang soạn)` (AGENTS.md:25).
Xem file 10, mục 2.2 và 2.3.

### Hỏi: Công cụ kiem_van.py có vai trò gì trong việc kiểm soát câu chữ tài liệu?
Công cụ `python tools/kiem_van.py <tệp>` dùng để quét và phát hiện các dấu hiệu văn phong máy móc trí tuệ nhân tạo (AGENTS.md:61, tools/kiem_van.py:1). Công cụ phát hiện các từ sáo rỗng, câu văn quá dài trên 40 từ và các cấu trúc liệt kê không tự nhiên (tools/kiem_van.py:10). Tài liệu hoặc giao diện chỉ được phép đẩy lên hệ thống khi đã xử lý hết toàn bộ lỗi ĐỎ (AGENTS.md:61).
Xem file 10, mục 3.2.
