# 06. Giao diện và trải nghiệm người dùng (UX) — IACC Cloud (iaccdemo)
Bản xuất từ repo iaccdemo commit 98d2bb3, ngày 23/11/2026.

## Phạm vi tài liệu
Tài liệu này đặc tả toàn bộ hệ thống giao diện và quy chuẩn trải nghiệm người dùng (UX) trong iaccdemo. Nội dung bao gồm ngôn ngữ thiết kế, biến màu phông chữ, bố cục web máy tính, các thành phần giao diện dùng chung, thiết kế trên điện thoại di động và bảng tổng hợp các quyết định UX đã chốt. Quy tắc định khoản chứng từ hoặc cấu trúc thư mục mã nguồn chi tiết nằm tại tài liệu 04 và 09.

## 1. Ngôn ngữ thiết kế và biến giao diện :root

### 1.1. Triết lý thiết kế và quy tắc QD12
Giao diện của IACC Cloud được xây dựng dựa trên sự kết hợp giữa ngôn ngữ thiết kế iFaster và các chuẩn mực phần mềm kế toán hiện đại (QD15).
Quyết định QD12 xác định rõ nguyên tắc: học tập bố cục, luồng thao tác và tính năng từ các sản phẩm kế toán phổ biến như AMIS, nhưng giữ nguyên ngôn ngữ thiết kế, màu sắc và biểu tượng của iPOS.vn (QD12).
Hệ thống kiên quyết không sao chép màu sắc, phông chữ hoặc các biểu tượng riêng của bên ngoài (QD12).

### 1.2. Biến màu sắc và phông chữ trong :root
Toàn bộ mã màu, phông chữ và kích thước chuẩn được định nghĩa tại khối `:root` ở đầu tệp `src/styles/app.css:2` (QD15).

| Tên biến CSS | Giá trị mã màu / font | Mục đích và vị trí sử dụng |
| :--- | :--- | :--- |
| `--navy` | `#2a3042` | Xanh hải quân chủ đạo, nền chân trang form chứng từ |
| `--navy-d` | `#1d2231` | Xanh hải quân đậm, nền chân thanh điều hướng sidebar |
| `--navy-2` | `#353c52` | Xanh hải quân phụ, đường viền và phân cách tối màu |
| `--sb-on` | `#0560a6` | Màu xanh điểm nhấn khi kích hoạt mục menu sidebar |
| `--blue` | `#0560a6` | Xanh thương hiệu iFaster, màu nút bấm chính và liên kết |
| `--blue-d` | `#044a80` | Xanh đậm khi di chuột qua nút chính |
| `--tint`, `--bluet` | `#e6eff7` | Xanh nhạt nền thẻ, hàng chọn và tiêu đề bảng |
| `--orange` | `#f28020` | Cam thương hiệu iPOS, nút thêm nhanh và điểm nhấn nổi bật |
| `--orange-d` | `#d0650a` | Cam đậm khi di chuột qua nút cam |
| `--orange-t` | `#fff5ea` | Cam phớt nền thông báo hoặc cảnh báo nhẹ |
| `--st`, `--st-t` | `#0f8f84`, `#e2f3f1` | Xanh ngọc đậm và nhạt đại diện cho gói Standard |
| `--md`, `--md-t` | `#1b6fe0`, `#e6effc` | Xanh dương đậm và nhạt đại diện cho gói Plus |
| `--ad`, `--ad-t` | `#b1852b`, `#fbf5e8` | Vàng kim đậm và nhạt đại diện cho gói Pro |
| `--red`, `--red-t` | `#c2362b`, `#fcebea` | Đỏ cảnh báo lỗi, nút xoá dữ liệu và nền dòng lỗi |
| `--green`, `--green-t` | `#138a52`, `#e3f4ea` | Xanh lá trạng thái hoàn thành và thành công |
| `--amber`, `--amber-t`| `#a86a0c`, `#fcf1de` | Vàng cam trạng thái chờ xử lý hoặc cảnh báo |
| `--ink` | `#1f2225` | Màu mực đen tiêu đề chính và văn bản quan trọng |
| `--body` | `#363636` | Màu chữ nội dung thông thường, tương phản đạt chuẩn |
| `--muted` | `#6b7280` | Màu chữ phụ, ghi chú ngày tháng và nhãn mờ |
| `--line` | `#e5e7eb` | Đường kẻ viền bảng, phân cách ô và khung viền thẻ |
| `--bg` | `#f5f5f5` | Nền xám nhạt toàn trang ứng dụng web |
| `--fs` | `'Be Vietnam Pro'` | Phông chữ tiếng Việt chuẩn quốc gia, rõ nét trên mọi màn hình |
| `--r` | `12px` | Bán kính bo góc thẻ và khung chứa nội dung |
| `--r-sm` | `8px` | Bán kính bo góc nút bấm, ô nhập và bảng chọn |

### 1.3. Quy định kiểu chữ số và định dạng tiền tệ
Văn bản hiển thị áp dụng cỡ chữ thân chuẩn 13,5px hoặc 14px (QD12, src/styles/app.css:25).
Các cột số tiền được định dạng bằng lớp `.num`, căn lề phải tuyệt đối và sử dụng kiểu số có bề rộng đồng đều `tabular-nums` để thẳng hàng dọc (src/styles/app.css:30).
Dấu phân cách số tiền mặc định theo quy chuẩn Việt Nam: dấu chấm phân cách hàng nghìn và dấu phẩy phân cách phần thập phân, ví dụ `1.234.567 đ` (src/ui/format.ts:20, QD81).

## 2. Bố cục ứng dụng web máy tính (Shell Desktop)

### 2.1. Khung ứng dụng bốn vùng cố định
Bố cục giao diện web máy tính được chia thành bốn vùng chính với chiều rộng tối thiểu 1180px, không bị co vỡ khi thu nhỏ cửa sổ (src/styles/app.css:41, QD27):

```
+-------------------------------------------------------------------------------+
| Sidebar (232px / 64px) | Topbar: Đơn vị · Cửa hàng · Nút gói · User (56px)    |
|                        +------------------------------------------------------+
| Logo thương hiệu       | ModuleTabs: Thanh tab ngang phân hệ (46px)           |
| Ô tìm kiếm nhanh       +------------------------------------------------------+
| Nút thêm mới cam       | Nội dung màn hình chính (Voucher, Catalog, Report)   |
| Danh sách 14 phân hệ   |                                                      |
| Chân trang thu gọn     |                                                      |
+------------------------+------------------------------------------------------+
```

### 2.2. Chi tiết các vùng giao diện

#### Sidebar bên trái (Thanh điều hướng phân hệ)
Sidebar chiếm cột đầu tiên từ hàng 1 đến hàng 3, chiều rộng mặc định 232px (src/styles/app.css:47).
Khi bấm nút thu gọn ở chân trang, sidebar co lại còn 64px và chỉ hiển thị biểu tượng phân hệ (src/styles/app.css:42).
Trên cùng là logo IACC Cloud kết hợp biểu tượng kế toán.
Ngay dưới logo là ô tìm kiếm nhanh (Ctrl+K) hỗ trợ gõ không dấu để mở màn hình bất kỳ (src/app/CommandPalette.tsx:1).
Tiếp theo là nút Thêm mới màu cam nổi bật, hỗ trợ mở danh mục chọn nhanh chứng từ cần lập (src/styles/app.css:55).
Phần thân sidebar liệt kê 14 phân hệ kế toán. Mục đang chọn có nền xanh `--sb-on` và chữ trắng (src/styles/app.css:60).
Mục phân hệ ngoài gói thuê bao hiển thị biểu tượng ổ khoá mờ ở đuôi dòng (src/styles/app.css:61).

#### Topbar (Thanh công cụ trên cùng)
Topbar nằm ở hàng 1 bên phải sidebar, chiều cao cố định 56px, nền trắng có viền dưới mảnh (src/styles/app.css:84).
Khu vực bên trái chứa hộp chọn Đơn vị kế toán, hiển thị tên doanh nghiệp và mã số thuế (src/styles/app.css:86).
Cạnh đơn vị là hộp chọn Cửa hàng làm việc, cho phép kế toán lọc số liệu theo một chi nhánh cụ thể hoặc chọn Tất cả cửa hàng (QD66, src/app/session.tsx:33).
Chính giữa có nút Trải nghiệm gói màu cam nhấp nháy, hỗ trợ bấm chuyển nhanh giữa Standard, Plus và Pro để thử tính năng (QD17, src/styles/app.css:99).
Bên phải chứa chuông thông báo hệ thống, nút hướng dẫn nhanh và thông tin tài khoản người dùng đăng nhập (src/app/session.tsx:28).

#### ModuleTabs (Thanh tab ngang phân hệ)
ModuleTabs nằm ở hàng 2, chiều cao 46px, hiển thị danh sách các màn hình và tab tính năng thuộc phân hệ đang chọn (src/styles/app.css:74).
Mỗi tab có tên ngắn gọn, có gạch chân màu xanh `--blue` khi được kích hoạt (src/styles/app.css:79).
Hệ thống có cơ chế tự động đo bề rộng thanh tab. Nếu số lượng tab vượt quá chiều rộng màn hình, các tab thừa được dồn vào menu thả xuống Khác ở cuối thanh (src/app/ModuleTabs.tsx:18).

#### Khung nội dung chính
Vùng nội dung mở rộng toàn bộ không gian còn lại, có thanh cuộn độc lập khi dữ liệu vượt quá chiều cao màn hình.
Nền nội dung mang màu xám nhạt `--bg`, các khối dữ liệu đặt trong thẻ màu trắng bo góc 12px viền mảnh và bóng đổ nhẹ (src/styles/app.css:14).

### 2.3. Bố cục màn hình danh sách chứng từ (VoucherScreen)
Màn hình danh sách chứng từ áp dụng cấu trúc chia khung linh hoạt để kế toán thao tác nhanh không cần chuyển trang (src/ui/generic/VoucherScreen.tsx:20, QD25):
- Hàng trên cùng chứa thanh công cụ: chip trạng thái xử lý (Tất cả, Chưa ghi sổ, Đã ghi sổ, Lỗi), ô tìm kiếm, nút lọc ngày và nút chức năng (QD27).
- Bảng danh sách chứng từ: các cột quan trọng như Ngày chứng từ, Số chứng từ, Loại phiếu, Tên khách hàng hoặc nhà cung cấp, Số tiền. Cột đầu dòng có vạch màu trạng thái trực quan: vạch vàng cho phiếu chưa ghi sổ, nền đỏ nhạt cho phiếu có lỗi hạch toán (QD27).
- Hàng lọc từng cột: nằm ngay dưới tiêu đề bảng, cho phép gõ lọc văn bản trực tiếp hoặc bấm phễu lọc điều kiện số lớn hơn, nhỏ hơn, bằng (QD28).
- Dòng tổng cộng đáy bảng: luôn ghim cố định ở đáy vùng bảng, hiển thị tổng số tiền của các chứng từ đang lọc (QD27).
- Khung chi tiết bên dưới: khi bấm chọn một dòng chứng từ ở bảng trên, khung dưới lập tức hiển thị nội dung hạch toán chi tiết Nợ Có, danh sách hàng hoá và lịch sử xử lý mà không cần mở form mới (QD25).

## 3. Các thành phần giao diện dùng chung (Common UI Components)

Toàn bộ các phân hệ trong IACC Cloud tái sử dụng hệ thống thành phần chuẩn hoá trong thư mục `src/ui/` nhằm đảm bảo tính đồng nhất tuyệt đối:

### 3.1. Thành phần Page (Tiêu đề và bao khung trang)
Thành phần `Page` tại `src/ui/Page.tsx` đóng vai trò khung bọc chuẩn cho mọi màn hình:
Hỗ trợ hiển thị tiêu đề màn hình, thẻ trạng thái và các nút thao tác phía trên bên phải.
Cung cấp nhãn gói dịch vụ nhỏ gọn (Standard, Plus, Pro) gắn cạnh tiêu đề để người dùng nhận biết tính năng thuộc gói nào (src/ui/Page.tsx:15).
Trong các màn hình danh sách chứng từ hoặc danh mục, thẻ `h1` hiển thị tiêu đề được ẩn thị giác qua lớp `.sr-only` để nhường chỗ cho thanh tab ngang, nhưng vẫn giữ nguyên cho trình đọc màn hình của người khiếm thị và các script kiểm thử tự động (QD27).

### 3.2. Thành phần Table và LocCot (Bảng dữ liệu và bộ lọc cột)
Bảng dữ liệu `Table` tại `src/ui/Table.tsx` là thành phần hiển thị phức tạp nhất trong hệ thống:
- Hỗ trợ ghim cột đứng yên khi cuộn ngang qua thuộc tính `dinh: 'trai'` hoặc `dinh: 'phai'` (src/modules/types.ts:18).
- Hỗ trợ tiêu đề bảng hai tầng khi các cột khai báo chung trường `nhom`, phục vụ cho các biểu mẫu kế toán phức tạp theo Thông tư 58 (T108, src/modules/types.ts:21).
- Tích hợp bộ lọc từng cột `LocCot` ngay dưới hàng tiêu đề: cột chuỗi có ô gõ tìm nhanh, cột số có phễu chọn toán tử so sánh (QD28).
- Hàng tiêu đề cột mang lớp `.tbl-cot`, đảm bảo đo chính xác độ rộng cột mà không bị ảnh hưởng bởi dòng dữ liệu đầu tiên (docs/KIEN-TRUC.md:75).

### 3.3. Thành phần Dropdown và Select (Menu chọn và bảng thả xuống)
Thành phần `Dropdown` tại `src/ui/Dropdown.tsx` quản lý toàn bộ các menu thả xuống trong ứng dụng:
- Cung cấp các khối thành phần con: `MenuHead` (tiêu đề nhóm), `MenuItem` (mục chọn thao tác), `MenuSep` (đường kẻ phân cách) (docs/KIEN-TRUC.md:83).
- Xử lý tương tác chuẩn mực: mở khi bấm chuột, tự động đóng khi bấm ra ngoài hoặc nhấn phím Escape trên bàn phím.
- Thay thế hoàn toàn thẻ `<select>` mặc định của HTML bằng thành phần `Select` tuỳ biến, giúp đồng bộ giao diện trên mọi hệ điều hành (docs/KIEN-TRUC.md:84).

### 3.4. Thành phần ChonNgay (Chọn khoảng thời gian kế toán)
Thành phần `ChonNgay` tại `src/ui/ChonNgay.tsx` được thiết kế theo chuẩn iFaster (QD15):
Cho phép chọn nhanh các kỳ kế toán định sẵn: Hôm nay, Hôm qua, Tuần này, Tháng này, Tháng trước, Quý này, Năm nay.
Hỗ trợ chọn khoảng ngày tuỳ ý bằng lịch đôi trực quan hoặc gõ trực tiếp ngày tháng theo định dạng `dd/mm/yyyy`.
Dữ liệu ngày được kiểm soát chặt chẽ, tự động cảnh báo nếu ngày bắt đầu lớn hơn ngày kết thúc.

### 3.5. Thành phần ChungTuForm (Form nhập liệu toàn màn hình)
Thành phần `ChungTuForm` tại `src/ui/generic/ChungTuForm.tsx` quản lý giao diện tạo mới và chỉnh sửa chứng từ kế toán theo kiểu AMIS (QD14):
- Giao diện mở rộng toàn màn hình, che toàn bộ sidebar và thanh trên để kế toán tập trung nhập liệu.
- Phần thông tin chung phía trên: đối tượng (khách hàng, nhà cung cấp, nhân viên), địa chỉ, diễn giải, ngày chứng từ, ngày hạch toán, số chứng từ tự sinh.
- Phần lưới nhập liệu chi tiết `BangSua`: bảng nhập liệu trực tiếp không cần bấm sửa từng dòng, hỗ trợ phím Tab để nhảy ô liên tục, tự động thêm dòng mới khi nhấn Enter ở ô cuối cùng (QD14).
- Thanh công cụ chân trang màu xanh hải quân `--navy`: chứa các nút thao tác chính gồm Huỷ bỏ, Lưu tạm, Lưu và ghi sổ, Lưu và thêm mới.
- Hỗ trợ đầy đủ phím tắt thao tác nhanh: Alt+S để Lưu chứng từ, Alt+Q để Đóng form nhập liệu, Alt+A để Thêm dòng chi tiết mới.

### 3.6. Thành phần ReportScreen và ReportPaper (Xem và in báo cáo)
Thành phần báo cáo tại `src/ui/bao-cao/` cung cấp công cụ xem trước và xuất bản chuyên nghiệp:
- Hiển thị báo cáo trên khổ giấy A4 mô phỏng `ToGiay`, có vạch chia trang trực quan, hỗ trợ phóng to thu nhỏ từ 50% đến 150% (src/ui/bao-cao/ToGiay.tsx:1).
- Bảng báo cáo `RptTable` tự động tính tổng dòng, tổng nhóm và phân trang in ấn không bị cắt ngang dòng dữ liệu (docs/KIEN-TRUC.md:76).
- Hỗ trợ bộ lọc báo cáo linh hoạt: ô chọn khoảng ngày, ô tìm kiếm trong báo cáo và khung lọc nâng cao có thể kéo thả tối đa 4 điều kiện ra ngoài thanh công cụ (QD59, T237).
- Chế độ Bảng dữ liệu hỗ trợ phân trang 100, 200, 500 dòng trên một trang với dòng tổng cộng luôn ghim cố định ở đáy (QD60, T238).

### 3.7. Thành phần ThongBao theo chuẩn QD113
Thành phần `ThongBao` tại `src/ui/ThongBao.tsx` chuẩn hoá toàn bộ hộp thoại thông báo, xác nhận và chặn thao tác trong hệ thống (QD113):

| Loại thông báo | Mã loại (`loai`) | Biểu tượng và màu sắc | Cấu hình nút bấm | Trường hợp sử dụng |
| :--- | :--- | :--- | :--- | :--- |
| Chặn thao tác | `chan` | Khiên tròn đỏ gạch | Nút Đóng duy nhất | Chứng từ đã khoá sổ, vi phạm toàn vẹn dữ liệu, chứng từ gây chặn có liên kết mở xem. |
| Xác nhận xoá | `xoa` | Thùng rác đỏ nguy hiểm | Nút Huỷ (xám) + Nút Xoá (nút đỏ duy nhất) | Xoá chứng từ, xoá danh mục, xoá tài khoản người dùng. |
| Cảnh báo số liệu | `canhBao` | Tam giác vàng cảnh báo | Nút Bỏ qua + Nút Tiếp tục | Xuất âm kho, lệch số tiền thuế, ngày chứng từ ngoài kỳ làm việc. |
| Hỏi thao tác lớn | `hoi` | Dấu hỏi tròn xanh dương | Nút Huỷ + Nút Hành động cụ thể | Khoá sổ cuối kỳ, đổi chế độ kế toán, tải lại dữ liệu từ POS. |
| Thành công | `xong` | Dấu tích tròn xanh lá | Tự đóng sau 3 giây hoặc nút Đóng | Lưu phiếu thành công, cập nhật thông tin đơn vị hoàn tất. |
| Thông tin chung | `thongTin` | Chữ i tròn xanh ngọc | Nút Đã hiểu | Hướng dẫn tính năng mới, nhắc nhở hạn nộp tờ khai. |

Quy tắc bất biến của QD113 là nút màu đỏ chỉ xuất hiện duy nhất ở hộp thoại loại `xoa`.
Các nút bấm luôn ghi rõ động từ hành động cụ thể (ví dụ "Khoá sổ ngay", "Xoá chứng từ"), không ghi chung chung "Đồng ý" hoặc "Xác nhận" (QD113).
Hệ thống thông báo nổi (toast) cũng áp dụng các loại tương ứng, thời gian hiển thị từ 3 đến 5 giây tuỳ mức độ nghiêm trọng (QD113).

### 3.8. Bộ biểu tượng Solar nâng cao và hiệu ứng khối 3D
Hệ thống sử dụng bộ biểu tượng Solar tuỳ biến tại `src/ui/Icon.tsx` (QD63):
- Biểu tượng nét đôi (duotone) mang hai màu nhận diện thương hiệu: thân biểu tượng dùng xanh `--ic-than` (`--blue`), chi tiết nhấn dùng cam `--ic-nhan` (`--orange`) (src/styles/app.css:7, QD67).
- Ba kích thước chuẩn hoá: nhỏ 16px (`.ic.sm`), vừa 20px (`.ic`), lớn 24px (`.ic.lg`) (src/styles/app.css:32, QD67).
- Hỗ trợ chế độ biểu tượng khối 3D qua thuộc tính `data-ic="khoi"` trên phần tử gốc `:root`, tạo chiều sâu thị giác nổi bật cho các nút nghiệp vụ trên trang chủ (src/styles/app.css:22395, QD71).

## 4. Giao diện ứng dụng trên điện thoại di động (Mobile UX)

### 4.1. Chuẩn thiết kế mobile bề rộng 360px
Toàn bộ giao diện điện thoại được thiết kế và tối ưu hoá tại bề rộng chuẩn 360px theo phong cách ứng dụng iPOS Inventory Pro (QD54, QD73).
Hệ thống sử dụng thang cỡ chữ riêng cho mobile: tiêu đề chính 18px, tiêu đề phụ 15px, chữ nội dung 13px và nhãn phụ 11px (QD73).
Giao diện tự động kích hoạt khi màn hình có bề rộng dưới 768px thông qua hook `useLaMobile()` tại `src/ui/mobile/useLaMobile.ts`.

### 4.2. Cấu trúc khung màn hình di động (MobileShell)
Khung ứng dụng di động gồm ba phần cơ bản (src/ui/mobile/MobileShell.tsx:1):
- Thanh trên di động: hiển thị tên màn hình, nút quay lại trang trước, nút tìm kiếm và bộ lọc nhanh. Riêng trang chủ di động không có thanh trên để tối đa diện tích hiển thị (QD57).
- Vùng nội dung cuộn mượt mà: thiết kế dạng thẻ thẻ trắng bo góc 10px viền mảnh, khoảng cách lề hai bên chuẩn 12px.
- Thanh điều hướng đáy trang `ThanhDuoi`: ghim cố định dưới cùng màn hình với 5 nút chính: Trang chủ, Nghiệp vụ, Báo cáo, Thêm nhanh và Mở rộng (src/ui/mobile/ThanhDuoi.tsx:1).

### 4.3. Các thành phần giao diện đặc thù trên mobile
Giao diện di động không bê nguyên xi màn hình máy tính mà được thiết kế lại hoàn toàn cho thao tác chạm ngón tay:
- Bỏ sơ đồ quy trình phức tạp: trên điện thoại, các sơ đồ quy trình kế toán được loại bỏ hoàn toàn, thay bằng danh sách các tác vụ nghiệp vụ trực quan (QD65).
- Thẻ tổng danh sách: đầu các màn hình danh sách chứng từ có khối thẻ tóm tắt tổng số chứng từ và tổng số tiền phát sinh trong kỳ (QD77).
- Phiếu nhập liệu một màn hình: biểu mẫu thu chi và xuất nhập kho trên mobile bố trí toàn bộ trên một luồng cuộn dọc duy nhất, không chia tab phức tạp, các nút thao tác ghim cố định ở đáy (QD65).
- Tấm trượt từ đáy (Bottom Sheet): mọi menu lựa chọn, bộ lọc báo cáo và hộp thoại xác nhận trên mobile đều trượt từ dưới lên, nút bấm xếp dọc với nút chính nằm trên cùng giúp dễ bấm bằng một tay (QD113, src/ui/mobile/MLoc.tsx:1).
- Màn hình thông báo thành công: sau khi lập xong chứng từ, hệ thống hiển thị màn hình `MThanhCong` xác nhận kèm số phiếu, tổng tiền và các nút gợi ý: In phiếu, Chia sẻ hoặc Lập tiếp (QD77, src/ui/mobile/MThanhCong.tsx:1).

## 5. Bảng tổng hợp các quyết định UX đã chốt

Dưới đây là danh mục các quyết định thiết kế và trải nghiệm người dùng quan trọng đã được Trum phê duyệt và ghi nhận trong `docs/QUYET-DINH.md`:

| Mã QD | Ngày chốt | Nội dung quyết định thiết kế | Phạm vi ảnh hưởng trong mã nguồn |
| :--- | :--- | :--- | :--- |
| **QD08** | 07/10/2026 | Áp dụng bố cục kiểu AMIS: sidebar phân hệ, thanh trên, nội dung chính. | `src/styles/app.css:41`, Khung Shell |
| **QD12** | 07/10/2026 | Giữ ngôn ngữ thiết kế iPOS, cấm sao chép màu sắc biểu tượng AMIS. | Toàn bộ mã nguồn CSS và UI |
| **QD14** | 07/10/2026 | Bố cục form chứng từ toàn màn hình và danh sách chia đôi theo AMIS. | `src/ui/generic/ChungTuForm.tsx` |
| **QD15** | 08/10/2026 | Ngôn ngữ thiết kế chuẩn theo iFaster: xanh `#0560a6`, cam iPOS `#f28020`. | `src/styles/app.css:1`, `:root` |
| **QD17** | 08/10/2026 | Nút Trải nghiệm gói trên Topbar cho phép chuyển đổi nhanh 3 gói. | `src/app/Topbar.tsx`, Chuyển gói thử |
| **QD22** | 08/10/2026 | Gói Standard ẩn các tính năng ngoài gói trên thanh điều hướng. | `src/app/plan.ts:anNgoaiGoi` |
| **QD25** | 09/10/2026 | Danh sách chứng từ hiển thị khung chi tiết bên dưới khi bấm chọn dòng. | `src/ui/generic/VoucherScreen.tsx` |
| **QD27** | 09/10/2026 | Chuẩn hoá 4 gói, chip trạng thái một hàng, ẩn tiêu đề h1 danh sách. | `src/styles/app.css:40`, Bảng chứng từ |
| **QD28** | 09/10/2026 | Bộ lọc từng cột trực tiếp dưới tiêu đề bảng, tích hợp phễu lọc toán tử. | `src/ui/LocCot.tsx`, `Table.tsx` |
| **QD54** | 12/10/2026 | Giao diện điện thoại thiết kế theo chuẩn phần mềm iPOS Inventory Pro. | `src/ui/mobile/`, Toàn bộ màn hình mobile |
| **QD57** | 14/10/2026 | Trang chủ mobile không có thanh trên, thiết kế mẫu in chỉ dùng máy tính. | `src/ui/mobile/MTrangChu.tsx` |
| **QD59** | 14/10/2026 | Bộ lọc báo cáo chuẩn hoá kiểu danh sách chứng từ, hỗ trợ lọc nâng cao. | `src/ui/bao-cao/tuyChinhBC.ts` |
| **QD60** | 14/10/2026 | Bảng dữ liệu báo cáo phân trang 100 dòng, ghim dòng tổng cộng ở đáy. | `src/ui/Table.tsx`, Bảng báo cáo |
| **QD63** | 15/10/2026 | Bộ biểu tượng Solar nâng cao nét đôi hai màu thương hiệu iPOS. | `src/ui/Icon.tsx`, Solar icons |
| **QD65** | 16/10/2026 | Mobile bỏ sơ đồ quy trình, form nhập liệu dồn thành một màn hình cuộn. | `src/ui/mobile/MLapPhieu.tsx` |
| **QD66** | 16/10/2026 | Đổi toàn bộ khái niệm "Chi nhánh" thành "Cửa hàng" trên toàn hệ thống. | `src/app/session.tsx`, Toàn hệ thống |
| **QD67** | 17/10/2026 | Biểu tượng chuẩn kích thước 16px, 20px, 24px, sidebar màu xanh đậm. | `src/styles/app.css:32`, Icon sizing |
| **QD71** | 17/10/2026 | Bổ sung bộ icon Solar hiệu ứng khối 3D cho các nút nghiệp vụ chính. | `src/styles/app.css:22395`, 3D icons |
| **QD73** | 18/10/2026 | Mobile thiết kế chuẩn ở bề rộng 360px, chuẩn hoá thang cỡ chữ chung. | `src/ui/mobile/`, Quy chuẩn mobile |
| **QD77** | 18/10/2026 | Mobile bổ sung thẻ tổng danh sách và màn hình thông báo thành công. | `src/ui/mobile/MThanhCong.tsx` |
| **QD80** | 23/10/2026 | Bỏ gói Free, chuẩn hoá 3 gói Standard (S), Plus (PL) và Pro (PR). | `src/app/plan.ts:doiGoiTuExcel` |
| **QD113**| 19/11/2026 | Chuẩn hoá thành phần ThongBao: 6 loại, chỉ xoá có nút đỏ, toast có loại. | `src/ui/ThongBao.tsx` |
| **QD114**| 20/11/2026 | Quy tắc đánh số chứng từ POS và định dạng hộp đồng bộ realtime. | `src/modules/tien-ich/TienIch.tsx` |

## 6. Phân định trạng thái các thành phần giao diện

Để nhóm phát triển và người dùng nắm rõ mức độ hoàn thiện, các khối giao diện được phân chia cụ thể:

### 6.1. Đã có trong bản mẫu
Toàn bộ khung ứng dụng Shell desktop và MobileShell trên điện thoại di động đã hoàn thiện (src/styles/app.css:41, src/ui/mobile/MobileShell.tsx:1).
Toàn bộ các thành phần dùng chung gồm Page, Table, Dropdown, ChonNgay, ChungTuForm, VoucherScreen, CatalogScreen, ReportScreen, ThongBao và Icon Solar (src/ui/).
Bảng màu biến số `:root` và hệ thống CSS đáp ứng đầy đủ ngôn ngữ thiết kế iFaster và chuẩn iPOS.vn (src/styles/app.css:2).
Cơ chế chuyển đổi gói dịch vụ xem thử trực tiếp và đổi chế độ thông tư kế toán tức thì (src/app/Topbar.tsx:1).
Mô phỏng xem trước 17 mẫu in chứng từ tiêu chuẩn và báo cáo khổ A4 trên trình duyệt (src/app/mau-in.ts:1).

### 6.2. Dự kiến / chưa làm
Repo chưa có kế hoạch riêng cho chủ đề này ngoài phần backend (file 09, mục 2). Tính năng chưa làm xem file 12 (Tiến độ việc), dòng trạng thái `Chưa làm`, `Chờ`.

### 6.3. Chưa chốt
Repo không ghi việc nào đang chờ chốt trong chủ đề này. Việc đang mở xem file 12 (Tiến độ việc). Quyết định đang soạn xem các mục có chữ `(đang soạn)` trong file 07.

