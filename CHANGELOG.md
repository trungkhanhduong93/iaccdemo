# Thay đổi trên bản online

Ghi thay đổi người dùng nhìn thấy trên https://iaccdemo.pages.dev, mới nhất ở trên. Mỗi dòng kèm mã việc nếu có.

## 09/10/2026

- T50: Tối ưu bộ khung 1 trang nhìn theo LedgerStudio: danh sách chứng từ và báo cáo chuẩn 100vh không bị thanh cuộn ngoài. Danh sách chứng từ tích hợp Virtual Scrolling cuộn mượt cho dữ liệu lớn, chống giật rung cột khi cuộn, thêm thanh gom nhóm đa cấp (GroupZone) xem tổng hợp nhanh theo loại phiếu, ngày, đối tượng. Màn báo cáo tối ưu hiệu năng cuộn bảng lớn với content-visibility.
- T47: Phân hệ Báo cáo mới dưới Tổng hợp, gom 45 sổ, báo cáo chia theo phân hệ, có ô đổi nhanh sang báo cáo cùng phân hệ. Báo cáo hiện như tờ A4 thật: tự chia trang, lặp tiêu đề cột, khổ dọc hoặc ngang, phóng to thu nhỏ, xem liên tục hoặc từng trang, in đúng như đang xem. Đầu trang ghi Mẫu số và căn cứ theo thông tư đang dùng, sổ có dòng cộng chuyển trang và "Sổ này có N trang". Xuất Excel giữ khung mẫu, CSV, PDF, HTML, XML. Cấu hình kế toán chọn được chế độ (TT133 hoặc TT99 với gói Plus, Pro); danh mục tài khoản, mẫu báo cáo, mẫu in đổi theo. Chứng từ in được theo mẫu (phiếu thu 01-TT, phiếu nhập kho 01-VT…), in hàng loạt, 2 liên. Tiện ích Thiết kế mẫu in sửa cỡ chữ, tên cột, người ký, ẩn hiện, thứ tự, độ rộng cột. Báo cáo có bộ lọc riêng và khung Tuỳ chỉnh cột, gom nhóm, người ký. Thêm 10 sổ còn thiếu theo thông tư.
- T49: Form phiếu thu chi gọn hơn: tiêu đề chỉ tên loại phiếu, giữa đầu form ghi Thêm mới, Đang chỉnh sửa hoặc Chi tiết phiếu kèm số. Đối tượng chọn từ danh mục và chảy xuống từng dòng. Lý do đứng trên Diễn giải, có dòng Ghi chú; chọn lý do thì diễn giải, ghi chú, lý do từng dòng theo. Người giao dịch thay hai ô cũ. Ngày chứng từ có lịch. Gói Free có Tháng hạch toán lãi lỗ. Tổng tiền nằm cố định ở đáy form, thẳng cột Thành tiền; bỏ tab Hạch toán. Mọi phiếu: Tiện ích có Sao chép và Tuỳ chỉnh giao diện phiếu (ẩn hiện cột); phiếu vừa lưu hoặc vừa sửa hiện ngay ở danh sách.
- T48: Danh sách chứng từ mọi phân hệ: gói Free bỏ chip trạng thái, luôn hiện tất cả phiếu. Dòng tổng dưới bảng thành Tổng trang; Tổng cộng mọi trang nằm trên hàng phân trang, số thẳng cột tiền. Tổng tiền là cột cuối, bỏ cột Chức năng (đúp chuột để xem phiếu). Khung chi tiết đóng sẵn, bấm Mở chi tiết mới hiện. Xoá phiếu (Hàng loạt và trong form) luôn hỏi lại; gói Free xoá được mọi phiếu, phiếu thuộc kỳ đã khoá sổ không xoá được.
- T25: Sổ quỹ, Sổ ngân hàng, Sổ công nợ theo chi nhánh chọn trên thanh trên; chọn Tất cả chi nhánh thì gộp số các chi nhánh. Bỏ ô Chi nhánh trên thanh lọc màn báo cáo.
- T46: Date Picker 1 tháng theo theme hệ thống cho ô lọc ngày và hộp phễu nâng cao. Thiết kế lại hộp Tuỳ chỉnh cột hiển thị & Đóng băng theo mẫu mới (công tắc switch, nút đóng băng trái/phải, icon minh hoạ). Chiều cao mỗi dòng bảng chứng từ cố định chuẩn 36px khi danh sách ít dòng. Bật/tắt cột tài khoản trong chứng từ dạng pill sáng rõ nét. Khối chân sơ đồ quy trình dạng lưới 3 nhóm trực quan cân đối.
- T45: Rê chuột vào phân hệ trên sidebar hiện bảng flyout tooltip 2 cột (Nghiệp vụ và Tiện ích). Thêm nút thu gọn và mở màn hình chi tiết chứng từ ở các màn hình danh sách chứng từ để mở rộng tối đa vùng xem danh sách. Xử lý triệt để khoảng hở giữa hàng tiêu đề và hàng lọc cột, khoảng hở dòng tổng cộng và chân phân trang liền mạch.
- T44: Màn hình máy tính xách tay 14 inch (hoặc dưới 1920px) tự động thu nhỏ 90% hiển thị trọn vẹn thoải mái. Chuyển nút tìm kiếm Ctrl K từ sidebar lên thanh trên cạnh ô Chi nhánh, bỏ nút Thêm nhanh ở sidebar. Badge phiên bản Pro đổi sang màu vàng đồng dạng viên thuốc bo tròn theo mẫu iPOS Inventory. Hàng lọc từng cột dưới tiêu đề cho phép bấm vào ô để gõ tìm kiếm trực tiếp cho mọi cột. Xử lý triệt để khoảng hở giữa hàng tiêu đề và hàng lọc khi cuộn bảng.
- T43: Gói đổi tên thành Free, Standard, Plus, Pro. Sidebar và nút cam đổi màu theo logo. Màn không còn trống bên phải. Danh sách chứng từ gọn một hàng, có nút Hàng loạt chỉ hiện thao tác hợp với phiếu đã chọn, bỏ cột Trạng thái và dòng tiêu đề, dòng tổng luôn thấy. Mua hàng có thêm dữ liệu mẫu.

## 08/10/2026

- T42: Màn nhỏ dưới 1700px thu nhỏ toàn bộ giao diện cho bớt chật. Bỏ dòng đường dẫn trên tiêu đề. Nút thêm ghi "Thêm mới", kèm nút xổ gom tải dữ liệu, Excel và thao tác hàng loạt. Dòng tổng dính đáy bảng, phân trang gọn. Hàng lọc cột mở khung lọc theo kiểu chữ, số, ngày, phân loại.
- T41: Danh sách chứng từ và màn Bán hàng có chip trạng thái kèm số phiếu, ô lọc Thời gian, Tìm kiếm, Đối tượng với nút Lọc, khung Bộ lọc nâng cao chọn được ô đưa ra ngoài. Hộp Tuỳ chỉnh cột kéo đổi thứ tự được. Cột có kẻ dọc, kéo giãn được độ rộng. Tick nhiều phiếu thì dùng nút Thao tác hàng loạt để ghi sổ, in, xuất Excel, xoá.
- T40: Mỗi danh mục có biểu tượng riêng, hiện ở menu Khác, ô tìm Ctrl K, hàng Danh mục dưới sơ đồ và sơ đồ Khởi tạo danh mục.
- T39: Danh sách chứng từ ở mọi phân hệ hiện được nhiều phiếu hơn: bỏ chia đôi 50/50, khung chi tiết bên dưới gọn lại. Chọn kỳ đưa lên đầu trang, cạnh nút Excel (nhập, xuất) và nút Tuỳ chỉnh giao diện; bỏ thanh lọc phía dưới và nút In. Bảng có cột STT và hàng lọc từng cột, mỗi ô có phễu chọn điều kiện theo kiểu dữ liệu. Dưới logo hiện gói đang dùng; tiêu đề các màn bỏ dòng mã, giai đoạn, nhãn gói.
- T25: Loại phiếu thu chi đổi tên thành Thu tiền mặt, Chi tiền mặt, Thu ngân hàng, Chi ngân hàng; Chuyển quỹ xuống cuối. Thêm nhanh có đủ 5 loại.
- T38: Sơ đồ Quy trình phân hệ Tiền gọn hơn. Mỗi làn một hàng thấp có màu riêng, nút nghiệp vụ nằm ngang, đường nối liền nét gom về khối Sổ sách, báo cáo.
- T37: Biểu tượng đổi theo iFaster. Sidebar dùng biểu tượng khối đặc, mục thường màu xám, mục đang chọn màu trắng. Biểu tượng đồ vật trong màn cũng thành khối đặc, các nút mũi tên, lọc, tải lại vẫn nét mảnh.
- T36: Gói Free chỉ hiện tính năng có trong gói, ẩn hẳn phân hệ, tab, báo cáo, ô sơ đồ của gói khác. Thanh trên hiện đủ tên công ty kèm nhãn Công ty, ô chi nhánh rộng hơn có nhãn Chi nhánh, nút Trải nghiệm gói màu cam nổi bật. Bỏ chọn vai trò: đăng nhập tài khoản nào thì vào đúng vai trò của tài khoản đó. Sơ đồ Quy trình tiền bỏ khung Báo cáo bị trùng, khối cuối thành Sổ sách, báo cáo.
- T32: Thanh trên có ô chọn chi nhánh làm việc, bỏ ô kỳ và trạng thái đồng bộ FABi. Ô tìm kiếm (Ctrl K) chuyển lên đầu sidebar. Thêm Danh mục chi nhánh. Danh sách chứng từ lọc theo chi nhánh đang chọn; chứng từ mới lập theo chi nhánh đó và không sửa được trên form.
- T25: Phiếu thu, chi có ô Lý do thu, Lý do chi ở đầu phiếu. Gói Free bỏ cột Khoản mục, Công việc ở dòng phiếu tiền. Loại phiếu Nộp tiền vào ngân hàng đổi thành Chuyển quỹ, chọn Từ quỹ, Đến quỹ. Sơ đồ Quy trình phân hệ Tiền vẽ lại: năm làn Thu tiền, Chi tiền, Chuyển quỹ, Đối chiếu công nợ, Phân bổ chi phí chuỗi cùng đổ về Sổ sách quỹ, gọn một trang. Gói Free mở Danh mục quỹ tiền và Sổ ngân hàng.
- T34: Thanh lọc mới trên mọi màn danh mục, danh sách, báo cáo: ô tìm, ô khoảng ngày, nút phễu mở khung Bộ lọc, nút tải lại. Ô khoảng ngày có lịch 2 tháng, chọn theo ngày, tháng, quý, có nút chọn nhanh Hôm nay, Tuần này, Tháng trước. Danh sách chứng từ mở mặc định ở tháng này.
- T29: Màn Bán hàng 3.1.1 chia đôi như Hoá đơn bán hàng: danh sách chứng từ ở trên có phân trang, chi tiết chứng từ đang chọn ở dưới, đúp chuột mở form.
- T28: Ô chọn trong form chứng từ cùng một kiểu, cao bằng ô gõ, ô bị khoá có nền xám. Ba cột thông tin chung thẳng hàng. Màn đăng nhập bỏ sơ đồ kết nối.
- T26: Giao diện đổi theo ngôn ngữ thiết kế iFaster: màu xanh mới, sidebar xám đen, mục đang chọn nổi khối xanh, đầu bảng nền xanh nhạt, thẻ trắng không viền. Logo đổi sang Accounting Powered by iPOS.vn.
- T25: Bấm Trước, Sau trong form chứng từ không còn chớp màn.
- T24: Bố cục danh sách chứng từ chia đôi 50/50 trên dưới cố định 1 trang không cần cuộn, chọn dòng ở trên đổi ngay chi tiết ở dưới; bỏ cụm thẻ stat để khu vực bảng chứng từ cao hơn. Sửa lỗi dính mép card thông tin chung trong chi tiết phiếu, chuẩn hoá cụm nút Trước - Sau cân đối, và bấm Esc từ duyệt phiếu đóng ngay về màn hình trước.
- T21: Sửa danh sách chứng từ bị vỡ bố cục, cột đầu phình to và các dòng trống.
- T22: Danh sách chứng từ có 3 thẻ tổng hợp trên đầu, phân trang 20, 50, 100 dòng, nút Cột để ẩn hiện cột. Ô chữ trong danh sách và danh mục giữ một dòng, rê chuột xem đủ.
- T23: Danh mục đối tượng, hàng hoá, kho có cột Chức năng để lập nhanh hoá đơn, phiếu thu, phiếu mua, xem công nợ, tồn kho. Số dư ban đầu mở bằng 4 thẻ theo loại số dư.

## 07/10/2026

- T17, T18: Dòng phiếu thu chi có Đối tượng, Khoản mục, Công việc; phiếu mua có Số lô, Hạn dùng. Danh mục kho và đối tượng có tài khoản mặc định, đối tượng có điều khoản thanh toán. Bút toán tự động hiện từng dòng định khoản. Số dư ban đầu có chi tiết công nợ và tồn kho.
- T15: Form chứng từ và danh sách chứng từ theo bố cục AMIS. Form mở ở chế độ xem, bấm Sửa để gõ trực tiếp trên bảng, có phím tắt Ctrl+S và Ctrl+E. Nhóm mua và bán có chọn thanh toán ngay, tự đổi tài khoản 1111 hoặc 1121; thêm tab Hoá đơn. Danh sách có lọc kỳ nhanh, cột Ngày và Số chứng từ đứng yên, cột chức năng đứng yên bên phải, thao tác hàng loạt và khung chi tiết bên dưới.
- Menu thả xuống làm lại cho cả app: đơn vị kế toán, Xem thử gói và vai trò, tài khoản, Thêm nhanh chia theo phân hệ, Khác của thanh tab, Tiện ích ở Quy trình, chọn loại phiếu. 22 ô chọn gốc của trình duyệt đổi sang ô chọn mới, dùng được phím mũi tên, Enter, Esc.
- Sửa lỗi mở Xem thử rồi không bấm được gói.
- Biểu tượng Hệ thống đổi sang bánh răng.
- Bản đầu tiên lên https://iaccdemo.pages.dev.
- Logo thật của IACC Cloud thay dấu vẽ bằng CSS, kể cả favicon.
- Bố cục kiểu AMIS: sidebar phân hệ lớn, thanh tab ngang có "Khác", màn Quy trình có sơ đồ bấm mở thẳng form chứng từ, tab Báo cáo, form chứng từ toàn màn hình.
- Khung đầu tiên: 13 phân hệ, 120 tính năng theo Excel, 4 gói Free, Starter, Medium, Advance, dữ liệu giả công ty Phố Mây.
