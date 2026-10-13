# Kế hoạch giao diện điện thoại theo IVT Pro (T170)

Tài liệu này dành cho agent nhận một đợt trong mục 7. Đọc mục 0 tới 6 trước khi làm bất kỳ đợt nào. Mỗi đợt ở mục 7 ghi đủ điều kiện bắt đầu, các bước, file, việc không làm và cách nghiệm thu.

## 0. Đọc trước

1. `AGENTS.md`: luật repo, các bước trước khi push, cuối phiên.
2. `docs/QUYET-DINH.md` mục QD54: quyết định gốc của việc này.
3. `docs/KIEN-TRUC.md`, `docs/BAY.md`: quy ước code, bẫy đã gặp.
4. Nhật ký các đợt trước: `docs/nhat-ky/*-mobile-*.md`, `docs/nhat-ky/2026-10-12-trum-ke-hoach-mobile-ivt.md`.

Nhận đợt theo `AGENTS.md` mục "Đầu phiên" bước 5: thêm dòng vào `docs/TIEN-DO.md` với mã kế tiếp, tên việc bắt đầu bằng `Điện thoại đợt N:`. Ghi vào cột Ghi chú các file dùng chung sẽ sửa (`App.tsx`, `Screen.tsx`, `VoucherScreen.tsx`, `CatalogScreen.tsx`, `app.css`).

## 1. Mục tiêu và phạm vi

Mở iaccdemo trên điện thoại (màn rộng dưới 768px) thì ra giao diện giống app IVT Pro (iPOS Inventory). Khách dùng cả hai app thấy cùng một hệ sinh thái iPOS.

Trong phạm vi:

- Khung app, thanh dưới, trang chủ, lưới nghiệp vụ, danh sách, xem phiếu, lập phiếu, form danh mục, báo cáo, đăng nhập, cho mọi phân hệ.
- Dùng lại biểu tượng, hình minh hoạ, câu chữ, bố cục của IVT Pro.

Ngoài phạm vi:

- Bản máy tính (màn rộng từ 768px trở lên). Không được đổi một điểm ảnh nào.
- Dữ liệu, `src/app/registry.ts`, `src/app/features.json`, khoá theo gói, chế độ kế toán. Bản điện thoại đọc chung nguồn với bản máy tính.
- Trợ lý, chat, gọi điện, quét mã, giọng nói, thanh toán bản quyền của IVT. iaccdemo chưa có các tính năng này.
- Máy tính bảng. Màn 768px trở lên dùng bản máy tính.
- App cài đặt (PWA, Android, iOS).

## 2. Quyết định đã chốt

Không bàn lại các điểm sau. Muốn đổi thì hỏi Trum.

| Điểm | Chốt |
|---|---|
| Ngưỡng | `max-width: 767px` là điện thoại |
| Địa chỉ | Giữ `#/app/<phân hệ>/<màn>/<id>` như bản máy tính. Không làm `/m/...` |
| Chuyển khung | `useLaMobile()` đúng thì dùng `MobileShell`, sai thì dùng `Shell` cũ |
| Thư mục | Mọi component điện thoại nằm ở `src/ui/mobile/`. Biểu tượng, hình IVT dùng thật thì chép vào `src/assets/ivt/` |
| Đặt tên | Component bắt đầu bằng `M` + tiếng Việt không dấu, vd `MDanhSach`. Lớp CSS bắt đầu bằng `m-` |
| CSS | Mỗi đợt một mục riêng cuối `src/styles/app.css`, tiêu đề `/* ── Điện thoại đợt N (Txxx) ── */`. Lớp `m-` không được đè lên lớp của bản máy tính |
| Màu | Dùng biến `:root` có sẵn (mục 5). Không thêm biến màu |
| Phông | Bản điện thoại: `'Be Vietnam Pro', -apple-system, 'Segoe UI', Roboto, sans-serif` cho mọi máy, giống web. Không đưa file SF Pro lên web vì giấy phép Apple |
| Biểu tượng thao tác | Tìm, lọc, thêm, quay lại, đóng dùng `Icon.tsx` có sẵn. Biểu tượng thanh dưới, hình màn trống dùng SVG của IVT. Ô phân hệ ở tab Nghiệp vụ dùng biểu tượng khối đặc của bản web (`Icon` theo `m.icon`, như sidebar, QD23) |
| Thương hiệu | Thanh trên tab Trang chủ hiện logo ACCOUNTING của web thay chữ tiêu đề |
| Thanh dưới | 4 tab Trang chủ, Nghiệp vụ, Báo cáo, Khác. Bỏ tab Trợ lý của IVT |
| File dùng chung đang nóng | `ChungTuForm.tsx`, `VoucherScreen.tsx`, `CatalogScreen.tsx` chỉ được thêm export hoặc tách hook, không sửa giao diện bản máy tính. Giao diện điện thoại viết trong `src/ui/mobile/` |
| Màn chưa có bản điện thoại | Hiện `MChiMayTinh`: thẻ "Màn này chưa có trên điện thoại. Mở trên máy tính để dùng." kèm nút về Nghiệp vụ |

Còn mở:

- Chờ đời máy chụp từ Trum để chốt hệ số điểm ảnh chính xác (tạm dùng giả định 1,505).

## 3. Tài nguyên IVT trong repo

APK gốc không nằm trong git (`.gitignore` chặn `*.apk`). Tài nguyên cần dùng đã rút sẵn vào `docs/ivt-tai-nguyen/`:

| Đường dẫn | Có gì |
|---|---|
| `docs/ivt-tai-nguyen/icons/` | 222 biểu tượng SVG của IVT |
| `docs/ivt-tai-nguyen/images/` | 15 hình màn trống SVG (`img_empty_*`, `img_ro`, `img_po_dashboard`, `img_wait_export`), hình tìm không ra `img_search_no_result.png`, ảnh nền trang chủ `img_bg_top_dashboard_1.png` |
| `docs/ivt-tai-nguyen/cau-chu.txt` | 1.640 câu chữ tiếng Việt lấy từ app, mỗi dòng một câu. Tra ở đây trước khi tự đặt nhãn |
| `docs/ivt-tai-nguyen/ten-man.txt` | 239 tên màn (`...Screen`, `...Page`) của IVT |
| `docs/ivt-anh/` | Ảnh chụp IVT Pro, có sau đợt 0 |

Biểu tượng PNG, ảnh nền khác, phông, nhạc chuông không rút vì nặng hoặc không dùng. Cần thì xin Trum file `mobile/IVT Pro(STG).apk`, giải nén bằng Python `zipfile`. Không mở, không chép thư mục `assets/flutter_assets/assets/config/`: chứa file `.env` cấu hình máy chủ, có thể có khoá.

Cách dùng SVG trong code:

- Hình tĩnh (màn trống): `import hinh from '../../assets/ivt/img_empty_data.svg'` rồi `<img src={hinh} alt="" />`. Ô phân hệ dùng biểu tượng khối đặc của bản web (`Icon` theo `m.icon`, QD23).
- Biểu tượng cần đổi màu theo trạng thái (thanh dưới): `import raw from '../../assets/ivt/ic_navigation_tab_1_v2.svg?raw'`, thay `#1A1A1A` bằng `currentColor`, gắn bằng `dangerouslySetInnerHTML`. SVG thanh dưới của IVT vẽ nét màu cứng `#1A1A1A`, dùng `<img>` thì không đổi màu được.

## 4. Bản đồ app IVT Pro

IVT Pro viết bằng Flutter. Không có file bố cục để đọc, bố cục chỉ biết qua ảnh chụp. Các khung màn dùng chung của IVT, lấy từ `ten-man.txt`:

| Khung IVT | Việc của khung | Khung điện thoại iaccdemo |
|---|---|---|
| `MainScreen` | Thanh dưới IVT có 5 tab (Trang chủ, Nghiệp vụ, Trợ lý, Báo cáo, Khác) dạng nổi bo góc | `MobileShell`: thanh dưới 4 tab, bỏ Trợ lý |
| `DashboardScreen`, `DashboardTabAdminScreen`, `DashboardTabFollowScreen` | Trang chủ: nền kem đầu trang, tài khoản/đơn vị, nút tìm và chuông, tab Quản trị / Cần theo dõi, lọc Kho, thao tác nhanh, thẻ số liệu, việc cần theo dõi | `MTrangChu` |
| `BusinessHomeScreen` | Nghiệp vụ: 2 tab Quy trình và Vận hành, chip phân hệ, thẻ các bước quy trình | `MNghiepVu`: lưới ô phân hệ với biểu tượng web (QD23) |
| `BaseListWithFilterScreen`, `BaseListScreen` | Danh sách: tab con loại phiếu, hàng lọc (nút lọc, khoảng ngày, chip), đếm chứng từ & tổng tiền, nút sắp xếp & tìm, danh sách thẻ, nút thêm nổi FAB pill "+ Thêm mới" | `MDanhSach` |
| `FilterScreen` | Màn lọc toàn màn: các trường lọc dạng thẻ nổi (thời gian, kho, nhà cung cấp, hàng hoá), nút Thiết lập lại và Áp dụng ở đáy | `MLoc` |
| `BaseReceiptDetailScreen` | Xem phiếu: loại phiếu & số phiếu, chip trạng thái, thẻ nhà cung cấp & thông tin nhập, ô tìm hàng, thẻ dòng hàng, khối tổng kết, thanh đáy có nút cam Trả lại và menu ba chấm | `MXemPhieu` |
| `CreateNewReceiptScreen`, `PickItemToReceiptScreen`, `CartScreen` | Lập phiếu: chọn hàng như giỏ hàng, sửa số lượng | `MLapPhieu` |
| `BaseCatalogDetailScreen`, `BaseFormScreen` | Xem, thêm, sửa danh mục, nút Lưu dính đáy | `MFormDm` |
| `ChooseDropdownItemScreen`, `ChooseListWarehouseScreen` | Chọn trong danh sách, tấm trượt từ dưới lên | `MChon` |
| `ReportHomeScreen`, `ReportTypeTabScreen` | Báo cáo chia nhóm, mỗi dòng tên và mô tả | `MBaoCao` |
| `MoreScreen`, `ProfileScreen` | Danh mục và thiết lập, tài khoản, đăng xuất | `MKhac` |
| `EmptyScreen`, `ErrorScreen` | Màn trống, màn lỗi có hình | `MTrong` |
| `LoginScreen`, `CompanySelectScreen` | Đăng nhập, chọn công ty | Đợt 8 |

## 4b. Bố cục đọc từ ảnh IVT

Số đo tính theo hệ số giả định 1,505 (587px = 390pt).

### 01-trang-chu.png

Ảnh ghép 3 khung cuộn của tab Quản trị trên Trang chủ. Mỗi khung rộng 587px (390pt), cao 1280px (850.5pt).

- Nền đầu trang: đỉnh màn hình tới y=200pt, kích thước 390pt × 200pt, chuyển sắc từ màu kem `#F4E4C0` sang trắng `#FFFFFF` và xám `#F5F6FA`, không bo góc, không bóng.
- Huy hiệu gói: góc trên trái cách lề 13.3pt, kích thước 32pt × 16pt, nền vàng cam `#C68A36`, chữ trắng "PRO" 10pt đậm 700, bo góc 4pt, không bóng.
- Khối tài khoản và đơn vị: dưới huy hiệu gói lề trái 13.3pt. Gồm logo avatar iPOS.vn (28pt × 28pt), tên đơn vị "Demo-Pro" chữ `#1A1A1A` 16pt đậm 600, vai trò "Chủ công ty" chữ `#666666` 12pt.
- Nút tìm kiếm nhanh: góc trên phải cách mép 53pt, nút tròn đường kính 44.5pt, nền trắng `#FFFFFF`, biểu tượng kính lúp `#0560A6` 20pt, bo tròn 100%, bóng mờ nhẹ `rgba(0,0,0,0.06)`.
- Nút chuông thông báo: góc trên phải cách mép 13.3pt, nút tròn đường kính 44.5pt, nền trắng `#FFFFFF`, biểu tượng chuông `#0560A6` 20pt, bo tròn 100%, bóng mờ nhẹ, huy hiệu đỏ `#E74538` chứa số "45" chữ trắng 10pt đậm.
- Thanh chọn Quản trị / Cần theo dõi: dạng viên thuốc lề trái 13.3pt, kích thước 168.1pt × 44.5pt, nền `#FAFAFA`, bo góc 22pt. Gồm tab "Quản trị" (đang chọn, nền trắng `#FFFFFF` bo góc 20pt, chữ `#1A1A1A` 13pt đậm 600) và tab "Cần theo dõi" (chữ `#666666` 13pt).
- Nút lọc kho: góc phải ngang hàng thanh chọn, kích thước 103.6pt × 28pt, lề phải 13.3pt, nền trắng `#FFFFFF`, viền xám `#DBDBDB` 1px, bo góc 14pt, chữ "Kho: Tất cả v" màu `#1A1A1A` 12pt.
- Khối Thao tác nhanh: thẻ trắng lề hai bên 13.3pt, kích thước 363.4pt × 110pt, bo góc 16pt, bóng nhẹ `rgba(0,0,0,0.05)`, cách trên 12pt; dòng đầu gồm chữ "Thao tác nhanh" (`#1A1A1A` 16pt đậm 600) và nút "Tuỳ chỉnh" (`#0560A6` 13pt); hàng 5 nút thao tác gồm icon tròn nền xanh nhạt `#D7EBF8` (36pt) và nhãn chữ `#1A1A1A` 11pt căn giữa: "Nhập mua", "Kiểm kê", "Đặt mua hàng", "Xuất trả", "Đặt hàng nội bộ".
- Thẻ Tổng tồn kho: thẻ trắng lề hai bên 13.3pt, kích thước 363.4pt × 130pt, bo góc 16pt, bóng nhẹ, cách trên 12pt; tiêu đề "Tổng tồn kho (i)" kèm nút "Chi tiết" (`#0560A6` 13pt); số tiền to "-87,104,352 đ" (`#1A1A1A` 20pt đậm 700); 3 cột trạng thái: "Hết hàng" (101 HH, chữ đỏ `#E74538` 13pt), "Dưới ngưỡng" (50 HH, chữ cam `#E58B20` 13pt), "Vượt ngưỡng" (17 HH, chữ nâu cam `#A36214` 13pt).
- Thẻ Chi phí nguyên vật liệu T10/2026: thẻ trắng lề 13.3pt, kích thước 363.4pt × 125pt, bo góc 16pt, bóng nhẹ; tiêu đề kèm nút "Chi tiết"; số tiền "0 đ (0% doanh thu)" 18pt đậm 700; 2 dòng chỉ số so sánh: "0% so với cùng kỳ tháng trước" (xanh lá `#1F9E4B` 12pt) và "-100% so với cùng kỳ năm trước" (đỏ `#E74538` 12pt).
- Thẻ Tỷ lệ chi phí nguyên vật liệu: thẻ trắng lề 13.3pt, bo góc 16pt, tiêu đề kèm nút chọn "Năm 2026 v" (`#0560A6` 12pt); biểu đồ kết hợp cột xanh `#5BB4E5` và đường đen `#1A1A1A`.
- Thẻ Hao hụt nguyên vật liệu: thẻ trắng lề 13.3pt, bo góc 16pt, nút chọn "Năm 2026 v"; thanh chuyển đổi tròn gồm "So với doanh thu" (đang chọn) và "So với tổng xuất"; biểu đồ cột xanh `#5BB4E5`.
- Thẻ Tỷ lệ tồn tại các kho: thẻ trắng lề 13.3pt, bo góc 16pt, danh sách kho "Kho tổng bàn quyền" kèm tỷ lệ: Hết hàng (đỏ `#E74538` 65.52%), Khác (xám `#666666` 34.48%); biểu đồ thanh phân bổ màu từng kho.
- Thanh điều hướng dưới nổi: vị trí nổi cách đáy 22pt, cách lề hai bên 13.3pt, kích thước 348.8pt × 85pt, nền trắng `#FFFFFF`, bo góc viên thuốc 35pt, bóng mờ `rgba(0,0,0,0.1)`. Gồm 5 tab chia đều:
  1. Tab Trang chủ: biểu tượng ngôi nhà xanh `#0560A6` 24pt, nhãn "Trang chủ" `#0560A6` 11pt đậm (đang chọn).
  2. Tab Nghiệp vụ: biểu tượng 4 ô vuông xám `#666666` 24pt, huy hiệu đỏ `#E74538` số "3", nhãn "Nghiệp vụ" `#666666` 11pt.
  3. Tab Trợ lý: biểu tượng tròn tím iOne 28pt, nhãn "Trợ lý" `#666666` 11pt. iaccdemo không làm tab này.
  4. Tab Báo cáo: biểu tượng cột sóng xám `#666666` 24pt, nhãn "Báo cáo" `#666666` 11pt.
  5. Tab Khác: biểu tượng 3 gạch ngang xám `#666666` 24pt, nhãn "Khác" `#666666` 11pt.

### 01b-trang-chu-cuoi.png

Ảnh 1 khung cuộn cuối của tab Cần theo dõi trên Trang chủ. Rộng 587px (390pt), cao 1280px (850.5pt).

- Nền đầu trang và khối tài khoản: giống ảnh 01, huy hiệu chuông hiện số "52", tab "Cần theo dõi" đang chọn (nền trắng `#FFFFFF`, chữ `#1A1A1A` 13pt đậm 600).
- Thẻ Kiểm kê: thẻ trắng lề 13.3pt, kích thước 363.4pt × 115pt, bo góc 16pt, bóng nhẹ, cách trên 12pt; tiêu đề "Kiểm kê (i)" kèm nút "Chi tiết" (`#0560A6` 13pt); số tiền "0 đ Tiền hao hụt" (`#1A1A1A` 17pt đậm 700); 2 cột số liệu: "2 Lượt (7 ngày qua)" và "5 Hàng hoá được kiểm" chữ `#1A1A1A` 14pt, chữ phụ `#666666` 12pt.
- Thẻ Huỷ hàng: thẻ trắng lề 13.3pt, kích thước 363.4pt × 115pt, bo góc 16pt, bóng nhẹ, cách trên 12pt; tiêu đề "Huỷ hàng (i)" kèm nút "Chi tiết"; số tiền "0 đ Giá trị huỷ hàng" 17pt đậm; 2 cột số liệu: "0 Phiếu (7 ngày qua)" và "0 Hàng hoá bị huỷ".
- Thẻ Nhập hàng: thẻ trắng lề 13.3pt, kích thước 363.4pt × 115pt, bo góc 16pt, bóng nhẹ, cách trên 12pt; tiêu đề "Nhập hàng (i)" kèm nút "Chi tiết"; số tiền "11,014,477 đ Tiền nhập hàng" 17pt đậm; 2 cột số liệu: "14 Phiếu (7 ngày qua)" và "20 Hàng hoá được nhập".
- Thẻ Thanh toán công nợ: thẻ trắng lề 13.3pt, kích thước 363.4pt × 115pt, bo góc 16pt, bóng nhẹ, cách trên 12pt; tiêu đề "Thanh toán công nợ (i)" kèm nút "Chi tiết"; số tiền "0 đ Tiền thanh toán" 17pt đậm; 2 cột số liệu: "0 Phiếu (7 ngày qua)" và "0 Đơn hàng đã thanh toán".
- Thanh điều hướng dưới nổi: nổi trên phần chân thẻ cuối, kích thước 348.8pt × 85pt, bo góc 35pt, bóng mờ nhẹ, gồm đủ 5 tab giống ảnh 01.

### 02-nghiep-vu.png

Ảnh ghép 2 khung của màn Nghiệp vụ. Rộng 1174px, mỗi khung 587px (390pt), cao 1280px (850.5pt).

- Tiêu đề màn hình: đỉnh màn hình lề trái 13.3pt, chữ "Nghiệp vụ" màu `#1A1A1A` 24pt đậm 700; cạnh tiêu đề có huy hiệu "Pro" nền vàng cam `#C68A36` bo góc 8pt, chữ trắng 11pt đậm.
- Thanh tab cấp 1: dưới tiêu đề lề trái 13.3pt, gồm 2 tab: "Quy trình" (đang chọn, chữ `#1A1A1A` 14pt đậm, có thanh gạch chân xanh `#0560A6` dày 2pt) và "Vận hành" (chữ `#666666` 14pt).
- Hàng chip phân hệ: cuộn ngang cách thanh tab 8pt, các chip bo góc viên thuốc 16pt, cao 32pt; chip đang chọn nền xanh `#0560A6` chữ trắng 13pt đậm ("Đặt hàng" ở khung 1, "Mua hàng" ở khung 2); chip chưa chọn nền trắng viền xám `#DBDBDB` chữ `#666666` ("Mua hàng", "Bán hàng", "Điều chuyển"...).
- Thẻ Quy trình đặt hàng (khung 1): thẻ trắng lề 13.3pt, bo góc 16pt, bóng nhẹ, cách trên 12pt; biểu tượng tròn nền xanh nhạt `#D7EBF8` (32pt) chứa chữ "ĐH" (`#0560A6` 14pt đậm); tiêu đề "Quy trình đặt hàng" (`#1A1A1A` 16pt đậm 600); dòng phụ "4 bước · 4 loại chứng từ" (`#666666` 12pt); mô tả "Từ kế hoạch và nhu cầu của bếp/chi nhánh đến đơn chốt với nhà cung cấp." (`#666666` 13pt).
- Bốn bước quy trình Đặt hàng: mỗi bước có số thứ tự tròn nền xanh `#0560A6` (đường kính 18pt, số trắng), tiêu đề bước (`#1A1A1A` 14pt đậm), mô tả bước (`#666666` 12pt), nút hành động bên dưới:
  1. "Yêu cầu mua hàng": mô tả "Bếp/chi nhánh đề xuất nhu cầu...", nút "Làm bước này" (nền xanh nhạt `#E7F3FA`, chữ `#0560A6` 13pt đậm, bo góc 8pt, cao 33pt).
  2. "Đặt mua hàng": mô tả "Gộp yêu cầu, chốt giá & số lượng...", nút "Làm bước này".
  3. "Đặt hàng nội bộ": mô tả "Chi nhánh đặt hàng từ kho tổng...", nút "Làm bước này".
  4. "Báo cáo theo dõi": mô tả "Tiến độ đặt và nhận, đơn quá hạn giao và tỷ lệ giao đủ của từng NCC.", nút "Xem báo cáo" (nền xanh nhạt `#E7F3FA`, chữ `#0560A6` 13pt đậm).
- Thẻ Quy trình mua hàng (khung 2): thẻ trắng bo góc 16pt; biểu tượng tròn "MH"; tiêu đề "Quy trình mua hàng", dòng phụ "4 bước · 3 loại chứng từ", mô tả "Nhận hàng, trả hàng lỗi và theo dõi tiền phải trả nhà cung cấp."; 4 bước:
  1. "Nhập mua": mô tả "Nhập từ đơn đặt hoặc nhập tay. Chụp hoá đơn để trợ lý điền hộ.", nút "Làm bước này". Phần chụp hoá đơn trợ lý iaccdemo không làm.
  2. "Xuất trả": mô tả "Trả hàng lỗi/thiếu, giảm công nợ tương ứng.", nút "Làm bước này".
  3. "Công nợ NCC": mô tả "Đối chiếu và ghi nhận thanh toán cho nhà cung cấp theo kỳ.", nút "Làm bước này".
  4. "Báo cáo theo dõi": mô tả "Lượng nhập theo NCC, giá mua biến động và tỷ lệ hàng trả.", nút "Xem báo cáo".
- Thanh điều hướng dưới nổi: tab Nghiệp vụ đang chọn (sáng xanh), huy hiệu đỏ số "3", đủ 5 tab giống ảnh 01. Lưu ý: iaccdemo làm lưới ô phân hệ với biểu tượng web (QD23), không làm chia bước quy trình như IVT.

### 03-ds-nhap-kho.png

Ảnh 1 khung danh sách chứng từ Mua hàng (Nhập mua). Rộng 587px (390pt), cao 1280px (850.5pt).

- Thanh trên: cao 48pt, nút quay lại mũi tên trái `<-` (`#1A1A1A` 20pt) cách lề trái 13.3pt; tiêu đề "Mua hàng" căn giữa (`#1A1A1A` 18pt đậm 600).
- Hàng tab loại chứng từ: dưới thanh trên, cuộn ngang, gồm tab "Nhập mua" (đang chọn, chữ `#0560A6` 14pt đậm, gạch chân xanh `#0560A6` dày 2pt), "Xuất trả", "Phiếu thanh toán", "Báo cáo theo dõi" (chữ `#666666` 14pt).
- Hàng bộ lọc: gồm nút biểu tượng bộ lọc (nền xám nhạt `#F1F5F8`, bo góc 8pt, kích thước 40pt × 40pt, icon thanh trượt); ô chọn khoảng ngày (kích thước 211pt × 40pt, nền `#F1F5F8`, bo góc 8pt, chữ "13/09/2026 - 12/11/2026 v" `#1A1A1A` 12pt); chip trạng thái cuộn ngang "Tất cả 23" (nền xanh `#0560A6`, chữ trắng 12pt đậm, bo góc 16pt), "Chờ duyệt...".
- Hàng tóm tắt số liệu: dòng chữ phụ xám "23 chứng từ · 3,055,020,302 đ" (`#666666` 13pt, số tiền đậm); bên phải có nút sắp xếp (icon hai mũi tên) và nút tìm kiếm (icon kính lúp).
- Danh sách thẻ chứng từ: các thẻ trắng cách lề hai bên 13.3pt – 16.6pt, bo góc 16pt, bóng nhẹ, khoảng cách giữa hai thẻ 10.6pt:
  + Dòng 1: mã phiếu bên trái "NMH00254/T10/2026" (`#1A1A1A` 16pt đậm 600); chip trạng thái bên phải "Hoàn thành" (nền xanh nhạt `#E8F8EE`, chữ xanh lá `#1F9E4B` 11pt, bo góc 5.3pt, cao 22pt).
  + Dòng 2: tên đối tượng "Công ty TNHH một thành viên Bắp Rang Bơ" (`#363636` 14pt).
  + Dòng 3: kho "Kho nhập: KHO TỔNG" (`#666666` 13pt).
  + Dòng 4: ngày & số lượng hàng bên trái "13/10/2026 · 0 hàng hoá" (`#8C8C8C` 12pt); tổng tiền bên phải "0 đ" (`#1A1A1A` 16pt đậm 700). Các thẻ tiếp theo có số tiền "6,811,536 đ", "32,219 đ", "2,813,073 đ".
- Nút thêm nổi (FAB): góc dưới phải, dạng viên thuốc dài kích thước 120pt × 45pt, nền xanh `#0560A6`, bo góc tròn 22.5pt, bóng đổ rõ `rgba(0,0,0,0.2)`; biểu tượng `+` và chữ "Thêm mới" màu trắng 14pt đậm; cách lề phải 13.3pt, cách đáy màn hình 30pt.

### 04-loc.png

Ảnh 1 khung của màn hình Bộ lọc toàn màn hình. Rộng 587px (390pt), cao 1280px (850.5pt).

- Thanh trên: cao 48pt, nút quay lại `<-` cách lề trái 13.3pt, tiêu đề "Bộ lọc" căn giữa (`#1A1A1A` 18pt đậm 600).
- Bốn trường lọc dạng thẻ nổi: nền thẻ trắng `#FFFFFF`, lề hai bên 13.3pt, bo góc 13.3pt, cao 60pt, bóng mờ nhẹ, khoảng cách giữa các thẻ 12pt:
  1. Trường "Thời gian nhập": nhãn trên `#666666` 12pt; giá trị dưới "13/09/2026 - 12/11/2026" màu xanh `#0560A6` 14pt đậm 600; nút xoá tròn icon `x` màu xám bên phải.
  2. Trường "Kho": nhãn trên `#666666` 12pt; placeholder dưới "Chọn kho" màu xám `#8C8C8C` 14pt; biểu tượng mũi tên xuống `v` màu xanh `#0560A6` bên phải.
  3. Trường "Nhà cung cấp": nhãn trên `#666666` 12pt; placeholder "Chọn nhà cung cấp" màu xám `#8C8C8C` 14pt; biểu tượng `v` màu xanh bên phải.
  4. Trường "Hàng hoá": nhãn trên `#666666` 12pt; placeholder "Chọn hàng hoá" màu xám `#8C8C8C` 14pt; biểu tượng `v` màu xanh bên phải.
- Thanh thao tác đáy dính: gồm 2 nút lớn đặt cạnh nhau, cách đáy màn hình 20pt, lề hai bên 13.3pt:
  + Nút phụ "Thiết lập lại": bên trái, chiếm 45% bề rộng, cao 48pt, nền xám tím nhạt `#F3F2F8`, chữ `#1A1A1A` 15pt đậm 600, bo góc 13.3pt.
  + Nút chính "Áp dụng": bên phải, chiếm 50% bề rộng, cao 48pt, nền xanh `#0560A6`, chữ trắng 15pt đậm 600, bo góc 13.3pt.

### 05-xem-phieu.png

Ảnh ghép 2 khung cuộn của màn hình Xem chi tiết phiếu nhập mua (NMH00254/T10/2026). Rộng 1173px, mỗi khung 586.5px (390pt), cao 1280px (850.5pt).

- Thanh trên: cao 53pt, nút quay lại `<-` bên trái cách lề 13.3pt; khối tiêu đề gồm tên loại nhỏ "Nhập mua" (`#666666` 12pt) và số phiếu to "NMH00254/T10/2026" (`#1A1A1A` 18.6pt đậm 700); chip trạng thái "Hoàn thành" góc trên phải (nền `#E8F8EE`, chữ xanh lá `#1F9E4B` 11pt, bo góc 5.3pt, cao 22pt).
- Thẻ Thông tin nhà cung cấp: thẻ trắng lề 13.3pt, bo góc 13.3pt, bóng nhẹ, cách trên 12pt; tiêu đề nhỏ "Thông tin nhà cung cấp" (`#1A1A1A` 14pt đậm 600); nhãn "Nhà cung cấp:" (`#666666` 13pt) kèm giá trị "Công ty TNHH một thành viên Bắp Rang Bơ" (`#1A1A1A` 13pt đậm).
- Thẻ Thông tin nhập: thẻ trắng bo góc 13.3pt, cách trên 10pt; tiêu đề "Thông tin nhập" 14pt đậm; 3 dòng thông tin: "Kho nhập:" (`#666666` 13pt) -> "KHO TỔNG" (`#1A1A1A` 13pt đậm); "Thời gian nhập:" (`#666666` 13pt) -> "13/10/2026 10:10" (`#1A1A1A` 13pt); "Tham chiếu:" (`#666666` 13pt) -> liên kết màu xanh `#0560A6` "PO00138/T10/2026".
- Tiêu đề khối danh sách: chữ in hoa "DANH SÁCH HÀNG HOÁ" (`#666666` 12pt đậm), cách trên 14pt.
- Ô tìm kiếm hàng hoá trong phiếu: nền xám nhạt `#F0F1F5`, cao 40pt, bo góc 10.6pt, biểu tượng kính lúp `#8C8C8C`, placeholder "Nhập tên, mã hàng hoá" (`#8C8C8C` 13pt), cách trên 8pt.
- Danh sách thẻ từng mặt hàng: mỗi mặt hàng là một thẻ trắng bo góc 13.3pt, cách nhau 10pt:
  + Dòng tên hàng: "1. Heiniken-8723D55C" (`#1A1A1A` 14.6pt đậm 600).
  + Dòng số lượng: nhãn "Số lượng:" (`#666666` 13pt) bên trái, giá trị "1 Thùng" (`#1A1A1A` 13pt đậm) bên phải.
  + Các dòng chi tiết: "Đơn giá: 0 đ", "Giảm giá (0%): 0 đ", "VAT (0%): 0 đ", "Tổng tiền: 0 đ", "Ghi chú:1" (nhãn `#666666`, giá trị `#1A1A1A` 13pt).
  + Các mặt hàng tiếp theo (khung 2): "2. 7UP-7UP" (Số lượng: 1 Lon), "3. Trà sữa chân châu-7QV5LFTBYGAY" (Số lượng: 1 Chai).
- Khối tổng kết dòng hàng (khung 2): thẻ trắng bo góc 13.3pt, gồm 3 dòng: "Thành tiền mặt hàng: 0 đ", "Tổng tiền giảm giá: 0 đ", "Tổng tiền thuế: 0 đ" (`#666666` 13pt, số tiền `#1A1A1A` 13pt).
- Thanh thao tác đáy dính: cố định ở chân màn hình, nền trắng `#FFFFFF`, viền trên `#DBDBDB` 1px, cao 56pt:
  + Dòng tổng tiền bên trái: nhãn "Tổng:" (`#666666` 13pt), số tiền to "0 đ" (`#1A1A1A` 17.3pt đậm 700).
  + Nút hành động chính: nút màu cam rực `#F48220`, chữ trắng "Trả lại" 15pt đậm 600, cao 48pt, bo góc 13.3pt, chiếm phần lớn khoảng bên phải.
  + Nút menu thao tác khác: icon ba chấm dọc `⋮` (`#1A1A1A` 20pt) mở menu phụ (In, Sao chép, Xoá...).

### 06-chon-hang.png

Ảnh ghép 3 khung của quy trình lập phiếu nhập mua và chọn hàng hoá. Mỗi khung rộng 587px (390pt), cao 1280px (850.5pt). Khung 1: Thêm mới nhập mua; khung 2: Chọn hàng hóa; khung 3: Chọn hàng hóa đã tích 1 mặt hàng.

Khung 1 (Thêm mới nhập mua):
- Thanh trên: cao 48pt, nút quay lại `<-` (`#1A1A1A` 20pt) cách lề trái 13.3pt; tiêu đề "Thêm mới nhập mua" căn giữa (`#1A1A1A` 18pt đậm 600).
- Thẻ Kho nhập: nền trắng, lề 13.3pt, bo góc 13.3pt, cao 67.8pt, bóng nhẹ; icon kho hàng màu xám `#8C8C8C` bên trái; nhãn "Kho nhập *" (`#666666` 13pt, dấu sao đỏ `#F83D23`); giá trị bên dưới "Corn 3" màu xanh `#0560A6` 15pt đậm 600; nút xoá tròn icon `x` màu xám bên phải.
- Thẻ Nhà cung cấp: nền trắng, lề 13.3pt, bo góc 13.3pt, cao 67.8pt, bóng nhẹ; icon xe tải màu xám bên trái; nhãn "Nhà cung cấp *" (`#666666` 13pt, dấu sao đỏ `#F83D23`); giá trị bên dưới "Công ty TNHH một thành viên Bắ|" màu xanh `#0560A6` 15pt đậm 600 kèm con trỏ nhập; nút xoá tròn icon `x` màu xám bên phải.
- Thẻ Thời gian nhập: nền trắng, lề 13.3pt, bo góc 13.3pt, cao 67.8pt, bóng nhẹ; icon đồng hồ màu xám bên trái; nhãn "Thời gian nhập *" (`#666666` 13pt, dấu sao đỏ `#F83D23`); giá trị bên dưới "13/10/2026 10:16" màu xanh `#0560A6` 15pt đậm 600; nút xoá tròn icon `x` màu xám bên phải.
- Thẻ chọn phương thức nhập hàng: nền trắng, lề 13.3pt, bo góc 13.3pt, cao 260.5pt, bóng nhẹ:
  + Dòng lựa chọn 1: chữ "Tự chọn hàng hóa" (`#0560A6` 15pt đậm 600) bên trái; nút radio tròn viền xanh `#0560A6` có chấm tròn xanh ở giữa (đang chọn) bên phải.
  + Dòng lựa chọn 2: tiêu đề "Nhập theo mẫu đã khai báo" (`#1A1A1A` 15pt đậm 600) bên trái; liên kết "Xem tất cả >" màu xanh `#0560A6` 13pt bên phải.
  + Thẻ mẫu hàng cuộn ngang bên trong: thẻ mẫu "Nước" (nền xám nhạt `#F5F6FA`, bo góc 10.6pt, tiêu đề "Nước" màu xanh `#0560A6` 14pt đậm; danh sách dòng hàng: "1. 7UP", "2. Coca", "3. Olong Tea Plus" chữ `#1A1A1A` 13pt); cạnh bên là thẻ mẫu "Mẫu test d" bị cắt mép phải.
- Nút thao tác đáy: nút chính "Tiếp tục" rộng toàn màn (lề 13.3pt), cao 45.8pt, nền xanh `#0560A6`, chữ trắng 16pt đậm 600, bo góc 16pt, cách đáy màn hình 12pt.

Khung 2 (Chọn hàng hóa):
- Thanh trên: cao 48pt, nút quay lại `<-` cách lề trái 13.3pt; tiêu đề "Chọn hàng hóa" căn giữa (`#1A1A1A` 18pt đậm 600).
- Hàng bộ lọc và tìm kiếm:
  + Ô thả xuống danh mục: chữ "Tất cả" (`#1A1A1A` 14pt) bên trái, mũi tên chữ v màu xanh `#0560A6` bên phải; nền trắng, viền `#DBDBDB` 1px, bo góc 10.6pt, cao 40pt, rộng 236pt.
  + Nút tìm kiếm: ô vuông nền trắng viền `#DBDBDB` 1px, bo góc 10.6pt, kích thước 40pt × 40pt, biểu tượng kính lúp màu xám `#8C8C8C`.
  + Ô đánh dấu chọn tất cả: ô checkbox viền xám `#C4C4C4` bo góc 4pt, kích thước 18.6pt × 18.6pt, căn phải.
- Danh sách thẻ mặt hàng: nền trang xám nhạt `#F5F6FA`, các thẻ trắng lề 13.3pt, bo góc 13.3pt, cao 56pt, khoảng cách giữa các thẻ 9pt, bóng mờ nhẹ:
  + Thẻ 1: tên "Hàng bán đơn vị tính 1" (`#1A1A1A` 14.6pt đậm 600), dòng dưới "Mã: 10013" (`#8C8C8C` 12pt); ô đánh dấu (checkbox) trống bên phải (viền xám `#C4C4C4` bo góc 4pt, kích thước 18.6pt × 18.6pt).
  + Thẻ 2: tên "123123", dòng dưới "Mã: 3PBETRHETGAJ", ô checkbox trống bên phải.
  + Thẻ 3: tên "Tàu Hủ Tôm Tươi", dòng dưới "Mã: 586WC7FFMPBZ", ô checkbox trống bên phải.
  + Thẻ 4: tên "banh keo", dòng dưới "Mã: 5SD7F8AW9EBB", ô checkbox trống bên phải.
  + Thẻ 5: tên "hang hoa tat", dòng dưới "Mã: 5UXY7Y2W6DAY", ô checkbox trống bên phải.
  + Thẻ 6: tên "hahahhhahaa", dòng dưới "Mã: 6SD7Q3GNLMBA", ô checkbox trống bên phải.
  + Thẻ 7: tên "app2", dòng dưới "Mã: 6WAZLT4ZY5A8", ô checkbox trống bên phải.
  + Thẻ 8: tên "App", dòng dưới "Mã: 76FV8CRWVJA8", ô checkbox trống bên phải.
- Đáy màn hình: để trống, chưa có thanh thao tác đáy vì chưa chọn mặt hàng nào.

Khung 3 (Chọn hàng hóa đã tích 1 mặt hàng):
- Thanh trên và hàng bộ lọc: giống khung 2 (tiêu đề "Chọn hàng hóa", ô thả xuống "Tất cả", nút tìm kiếm, ô chọn tất cả).
- Danh sách thẻ mặt hàng: giống khung 2. Riêng thẻ thứ 4 ("banh keo", "Mã: 5SD7F8AW9EBB") ô đánh dấu đổi sang trạng thái đã chọn: nền xanh `#0560A6`, dấu tích chữ v màu trắng, kích thước 18.6pt × 18.6pt, bo góc 4pt.
- Thanh thao tác đáy dính: cố định ở chân màn hình, nền trắng `#FFFFFF`, viền trên mờ, cao 56pt:
  + Dòng tóm tắt bên trái: nhãn "Đã chọn:" (`#1A1A1A` 14pt), số lượng "1" (`#1A1A1A` 15pt đậm 700), cách lề trái 13.3pt.
  + Nút chính "Danh sách đã chọn": nền xanh `#0560A6`, chữ trắng 15pt đậm 600, cao 44pt, bo góc 13.3pt, cách lề phải 13.3pt, chiếm 58% bề rộng.

### 07-gio-hang.png

Ảnh ghép 3 khung của màn hình Thông tin nhập mua và màn hình hoàn thành tạo chứng từ. Mỗi khung rộng 587px (390pt), cao 1280px (850.5pt). Khung 1: Thông tin nhập mua (đầu phiếu và danh sách hàng có 1 mặt hàng); khung 2: Thông tin nhập mua (cuộn xuống danh sách hàng có 2 mặt hàng và khối tổng kết); khung 3: Tạo chứng từ thành công.

Khung 1 (Thông tin nhập mua - đầu phiếu):
- Thanh trên: cao 48pt, nút quay lại `<-` cách lề trái 13.3pt, tiêu đề "Thông tin nhập mua" căn giữa (`#1A1A1A` 18pt đậm 600).
- Thẻ Thông tin nhập: thẻ trắng lề 13.3pt, bo góc 13.3pt, bóng nhẹ; 3 dòng thông tin: "Kho nhập:" (`#666666` 13pt) -> "Corn 3" (`#1A1A1A` 13pt); "Thời gian nhập:" (`#666666` 13pt) -> "13/10/2026 11:12" (`#1A1A1A` 13pt); "Nhà cung cấp:" (`#666666` 13pt) -> "Công ty TNHH một thành viên Bắp Rang Bơ" (`#1A1A1A` 13pt).
- Thẻ Ghi chú: thẻ trắng lề 13.3pt, bo góc 13.3pt, bóng nhẹ; icon tờ giấy ghi chú màu xám; nhãn "Ghi chú" (`#666666` 13pt); placeholder "Nhập ghi chú nếu có" (`#8C8C8C` 13pt).
- Thẻ Thông tin hoá đơn Vat: thẻ trắng lề 13.3pt, bo góc 13.3pt, bóng nhẹ; tiêu đề "Thông tin hoá đơn Vat" (`#1A1A1A` 14pt đậm 600); dòng "Số hóa đơn:" kèm ô nhập viền xám mờ bo góc 6pt bên phải; dòng "Ký hiệu hóa đơn:" kèm ô nhập bên phải.
- Thẻ Hình ảnh: thẻ trắng lề 13.3pt, bo góc 13.3pt, bóng nhẹ; tiêu đề "Hình ảnh" (`#1A1A1A` 14pt đậm 600); nút "Thêm ảnh" (khung chữ nhật bo góc 8pt viền xanh `#0560A6` 1px, icon máy ảnh màu xanh, chữ "Thêm ảnh" `#0560A6` 12pt).
- Tiêu đề khối danh sách: chữ in hoa "DANH SÁCH HÀNG HÓA" (`#1A1A1A` 13pt đậm 600), cách trên 14pt.
- Ô tìm kiếm hàng hoá trong phiếu: nền xám nhạt `#F0F1F5`, cao 40pt, bo góc 10.6pt, biểu tượng kính lúp màu xám `#8C8C8C`, placeholder "Nhập tên, mã hàng hóa" (`#8C8C8C` 13pt).
- Danh sách thẻ mặt hàng: thẻ trắng bo góc 13.3pt, bóng nhẹ; dòng tên "1. banh keo-5SD7F8AW9EBB" (`#1A1A1A` 14pt đậm 600), nút "Sửa" bên phải (nền xanh nhạt `#EBF3FA`, chữ xanh `#0560A6` 12pt đậm, bo góc 6pt, cao 26pt).
- Thanh thao tác đáy dính: cố định ở chân màn hình, nền trắng `#FFFFFF`, cao 76pt:
  + Dòng tổng: nhãn "Tổng:" (`#1A1A1A` 14pt) bên trái, số tiền "0 đ" (`#1A1A1A` 16pt đậm 700) bên phải.
  + Hàng nút hành động: nút phụ "Lưu chờ duyệt" bên trái (nền xám nhạt `#EDEDED`, chữ xanh đậm `#0560A6` 15pt đậm 600, cao 44pt, bo góc 13.3pt, rộng 46% bề rộng); nút chính "Lưu & duyệt" bên phải (nền xanh `#0560A6`, chữ trắng 15pt đậm 600, cao 44pt, bo góc 13.3pt, rộng 48% bề rộng).

Khung 2 (Thông tin nhập mua - cuộn xuống):
- Phần trên: mép dưới thẻ "Thêm ảnh", tiêu đề khối "DANH SÁCH HÀNG HÓA", ô tìm kiếm hàng hoá.
- Danh sách thẻ mặt hàng:
  + Thẻ 1: "1. banh keo-5SD7F8AW9EBB", nút "Sửa" bên phải; các dòng chi tiết: "Số lượng:" 13pt -> "1 000" 13pt, "Đơn giá: 0 đ", "Giảm giá (0%): 0 đ", "VAT (0%): 0 đ", "Tổng tiền: 0 đ".
  + Thẻ 2: "2. Nước suối Dasani-DASANI", nút "Sửa" bên phải; các dòng chi tiết: "Số lượng:" -> "1 Chai", "Đơn giá: 0 đ", "Giảm giá (0%): 0 đ", "VAT (0%): 0 đ", "Tổng tiền: 0 đ".
- Khối tổng kết dòng hàng: thẻ trắng bo góc 13.3pt, gồm 3 dòng: "Thành tiền mặt hàng:" -> "0 đ", "Tổng tiền giảm giá:" -> "0 đ", "Tổng tiền thuế:" -> "0 đ" (nhãn `#666666` 13pt, số tiền `#1A1A1A` 13pt).
- Thanh thao tác đáy dính: giống khung 1 (dòng "Tổng: 0 đ", nút phụ "Lưu chờ duyệt" và nút chính "Lưu & duyệt").

Khung 3 (Tạo chứng từ thành công):
- Nút biểu tượng ngôi nhà (Home): góc trên trái, nút tròn đường kính 32pt nền xanh nhạt `#EBF3FA`, icon nhà màu xanh `#0560A6`.
- Khối thông báo thành công ở giữa màn hình:
  + Biểu tượng tích tròn: đường kính 60pt, nền xanh chuyển sắc `#3498DB` – `#2980B9`, dấu tích chữ v màu trắng; xung quanh có các ngôi sao nhỏ trang trí.
  + Tiêu đề chính: "Tạo chứng từ thành công" (`#1A1A1A` 18pt đậm 700), cách biểu tượng 18pt.
  + Đoạn mô tả: "Bạn vừa tạo thành công phiếu Nhập mua NMH00261/T10/2026. Bấm Thanh toán để thực hiện quá trình thanh toán hoặc bấm đóng để quay lại danh sách phiếu" (`#363636` 13pt, số phiếu và chữ "Thanh toán" đậm 600, căn giữa 3 dòng).
- Hai nút hành động ở giữa màn hình:
  + Nút phụ "Đóng": bên trái, cao 46.5pt, nền xám nhạt `#EEEEEE`, chữ `#1A1A1A` 15pt đậm 600, bo góc 13.3pt, rộng 113pt.
  + Nút chính "Thanh toán": bên phải, cao 46.5pt, nền xanh `#0560A6`, chữ trắng 15pt đậm 600, bo góc 13.3pt, rộng 113pt.

### 08-tam-truot.png

Ảnh ghép 3 khung của chi tiết mặt hàng đã chọn, màn hình tạo phiếu và tấm trượt chọn đối tượng. Mỗi khung rộng 587px (390pt), cao 1280px (850.5pt). Khung 1: Danh sách đã chọn (sửa chi tiết mặt hàng đã chọn); khung 2: Thêm mới nhập mua (màn hình chọn phương thức nhập); khung 3: Tấm trượt chọn Nhà cung cấp.

Khung 1 (Danh sách đã chọn):
- Thanh trên: cao 48pt, nút quay lại `<-` cách lề trái 13.3pt, tiêu đề "Danh sách đã chọn" căn giữa (`#1A1A1A` 18pt đậm 600), icon thùng rác màu cam đỏ `#E74538` bên phải.
- Hàng tìm kiếm và thêm hàng: ô tìm kiếm nền `#F0F1F5`, cao 40pt, bo góc 10.6pt, placeholder "Nhập mã, tên hàng hóa" (`#8C8C8C` 13pt); bên phải là nút tròn xanh `#0560A6` đường kính 26.5pt có dấu cộng `+` màu trắng.
- Thẻ chi tiết mặt hàng: thẻ trắng lề 13.3pt, bo góc 13.3pt, bóng nhẹ:
  + Dòng tiêu đề thẻ: tên hàng "1. banh keo-5SD7F8AW9EBB" (`#1A1A1A` 14.6pt đậm 600); bên phải có nút sao chép (hai trang giấy viền xanh nhạt) và nút xoá dòng (icon `x` màu đỏ nhạt).
  + Dòng "Số lượng:": nhãn `#363636` 13pt; ô nhập số lượng "0" (nền trắng viền xám mờ bo góc 6pt, rộng 80pt, căn giữa); ô chọn đơn vị "000 v" (nền trắng viền xám mờ bo góc 6pt, chữ xanh `#0560A6` căn phải).
  + Dòng "Đơn giá:": nhãn 13pt; ô nhập "0", đơn vị "đ" màu xám bên phải.
  + Dòng "Giảm giá:": nhãn 13pt; ô nhập "0", ô chọn đơn vị "% v" chữ xanh.
  + Dòng "Tiền giảm giá:": nhãn 13pt; giá trị "0 đ" bên phải kèm icon bút chì xanh `#0560A6` sửa nhanh.
  + Dòng "VAT:": nhãn 13pt; ô nhập "0" "%", giá trị "0 đ" kèm icon bút chì xanh.
  + Dòng "Tổng tiền:": nhãn 13pt đậm; giá trị "0 đ" (`#1A1A1A` 14pt đậm) kèm icon bút chì xanh.
  + Ô nhập ghi chú: khung chữ nhật viền xám mờ `#DBDBDB` bo góc 8pt, cao 44pt, placeholder "Nhập ghi chú nếu có" (`#8C8C8C` 13pt).
- Nút thao tác đáy: nút "Tiếp tục" rộng toàn màn (lề 13.3pt), cao 45.8pt, nền xanh `#0560A6`, chữ trắng 16pt đậm 600, bo góc 16pt.

Khung 2 (Thêm mới nhập mua):
- Màn hình thiết lập thông tin đầu phiếu trước khi mở tấm trượt (giống khung 1 của ảnh 06).
- Thanh trên: nút `<-`, tiêu đề "Thêm mới nhập mua" (`#1A1A1A` 18pt đậm 600).
- Các thẻ trường thông tin: Thẻ "Kho nhập *" giá trị "Corn 3"; thẻ "Nhà cung cấp *" giá trị "Công ty TNHH một thành viên Bắ|"; thẻ "Thời gian nhập *" giá trị "13/10/2026 10:16" (đều có nút xoá `x`).
- Thẻ chọn phương thức nhập: "Tự chọn hàng hóa" (nút radio tròn xanh đang chọn); "Nhập theo mẫu đã khai báo" kèm liên kết "Xem tất cả >" và thẻ mẫu "Nước".
- Nút thao tác đáy: nút chính "Tiếp tục" cao 45.8pt nền xanh `#0560A6`.

Khung 3 (Tấm trượt chọn Nhà cung cấp):
- Vùng phủ mờ: màu đen mờ chiếm 15% phía trên màn hình, để lộ một phần thanh trên của màn Thêm mới nhập mua.
- Tấm trượt nổi từ đáy: chiếm 85% chiều cao màn hình, nền trắng `#FFFFFF`, bo tròn 2 góc trên 16pt (không có tay nắm kéo):
  + Thanh tiêu đề: nút dấu nhân `x` bên phải (vòng tròn xám nhạt bo tròn icon `x`); tiêu đề "Nhà cung cấp" căn trái (`#1A1A1A` 18pt đậm 700).
  + Ô tìm kiếm nhanh: nền xám nhạt `#F0F1F5`, cao 40pt, bo góc 10.6pt, biểu tượng kính lúp, placeholder "Tìm kiếm" (`#8C8C8C` 14pt).
  + Danh sách đối tượng nhà cung cấp: các dòng cao 46pt, phân tách bằng đường kẻ ngang mờ `#EEEEEE` 1px:
    * Dòng 1 (đang chọn): tên "Công ty TNHH một thành viên Bắp Rang Bơ" (`#1A1A1A` 14pt đậm), nền hàng màu xanh nhạt `#EBF3FA`, nút radio tròn xanh `#0560A6` có chấm tròn bên phải.
    * Dòng 2: tên "Ncc new 5", dòng dưới "88844 nadasdk" (`#8C8C8C` 12pt), nút radio tròn rỗng viền xám bên phải.
    * Dòng 3 tới 10: "test123", "Ncc new 4", "sonne123", "Nhà cung cấp test123", "Công ty Ngô", "NCC Lớn", "Công ty TNHH TNT", "nha cung cap 12331", kèm nút radio rỗng bên phải.
  + Thanh thao tác đáy dính: gồm 2 nút đặt cạnh nhau, lề 13.3pt:
    * Nút phụ "Hủy": bên trái, cao 46.5pt, nền xám nhạt `#EDEDED`, chữ `#1A1A1A` 15pt đậm 600, bo góc 13.3pt, chiếm 46% bề rộng.
    * Nút chính "Áp dụng": bên phải, cao 46.5pt, nền xanh `#0560A6`, chữ trắng 15pt đậm 600, bo góc 13.3pt, chiếm 48% bề rộng.

### 09-ds-hang-hoa.png

Ảnh ghép 2 khung của màn hình Tác vụ khác và màn hình Danh mục Hàng hoá. Mỗi khung rộng 587px (390pt), cao 1280px (850.5pt). Khung 1: Tác vụ khác (tab Khác trên thanh điều hướng dưới); khung 2: Danh sách Hàng hóa (màn hình danh mục Hàng hóa).

Khung 1 (Tác vụ khác):
- Đầu trang: nền chuyển sắc vàng kem nhạt `#F6E4BE` sang `#FFFFFF` và `#F5F6FA`, tiêu đề "Tác vụ khác" (`#1A1A1A` 20pt đậm 700), chip vàng bo góc "Pro" (chữ trắng 12pt đậm).
- Ô tìm kiếm: nền trắng viền `#DBDBDB` 1px, cao 40pt, bo góc 10.6pt, placeholder "Tìm cài đặt, danh mục, tài liệu..." (`#8C8C8C` 13pt).
- Thẻ nhóm "Danh mục": thẻ trắng lề 13.3pt, bo góc 13.3pt, bóng nhẹ; liên kết "Xem thêm (11)" màu xanh `#0560A6` góc trên phải; 3 dòng danh mục phân cách bởi đường kẻ mờ:
  + Dòng 1: icon vuông bo góc xanh nhạt chữ "HH", tiêu đề "Hàng hóa" (`#1A1A1A` 15pt đậm 600), mô tả "Tổng 237 hàng hóa" (`#8C8C8C` 12pt), mũi tên sang phải `>`.
  + Dòng 2: icon vuông chữ "NH", tiêu đề "Nhóm hàng hoá" (`#1A1A1A` 15pt đậm 600), mô tả "Tổng 17 nhóm" (`#8C8C8C` 12pt), mũi tên `>`.
  + Dòng 3: icon vuông chữ "ĐV", tiêu đề "Đơn vị tính" (`#1A1A1A` 15pt đậm 600), mô tả "Tổng 259 đơn vị tính" (`#8C8C8C` 12pt), mũi tên `>`.
- Thẻ nhóm "Tài khoản": thẻ trắng lề 13.3pt, bo góc 13.3pt, bóng nhẹ; tiêu đề nhóm "Tài khoản" (`#1A1A1A` 16pt đậm 600); gồm 3 dòng: icon vuông chữ "TK" "Tài khoản", icon chữ "CV" "Chức vụ", icon chữ "BQ" "Bản quyền", đều có mũi tên `>`.
- Thẻ nhóm "Hỗ trợ" ở chân danh sách (bị che một phần bởi thanh điều hướng).
- Thanh điều hướng dưới: dạng nổi, bo góc 35pt, bóng nhẹ, gồm 5 tab: Trang chủ, Nghiệp vụ (huy hiệu đỏ "3"), Trợ lý (iOne), Báo cáo, Khác (đang chọn, icon 3 vạch xanh `#0560A6`).

Khung 2 (Danh sách Hàng hóa):
- Thanh trên: cao 48pt, nút quay lại `<-` cách lề trái 13.3pt, tiêu đề "Hàng hóa" căn giữa (`#1A1A1A` 18pt đậm 600), icon phễu lọc màu xám `#1A1A1A` bên phải.
- Chip trạng thái lọc: chip "Trạng thái: Đang hoạt động" (nền xám nhạt `#EDEDED`, chữ `#1A1A1A` 13pt, bo góc 8pt, cao 28pt, cách lề trái 13.3pt).
- Hàng tab phân loại: tab "Tất cả" kèm huy hiệu số "237" (đang chọn, chữ xanh `#0560A6`, gạch chân xanh dày 2pt, badge nền xanh nhạt); tab "Đã phân loại" kèm huy hiệu "234"; tab "Chưa phân loại" kèm huy hiệu "3".
- Ô tìm kiếm: nền xám nhạt `#F0F1F5`, cao 40pt, bo góc 10.6pt, biểu tượng kính lúp, placeholder "Nhập từ khóa" (`#8C8C8C` 13pt).
- Danh sách thẻ mặt hàng: các thẻ trắng lề 13.3pt, bo góc 13.3pt, cao 56pt, bóng mờ nhẹ, khoảng cách 10pt:
  + Dòng tiêu đề: số thứ tự, tên hàng hoá và mã hàng (`#1A1A1A` 14.6pt đậm 600), mũi tên sang phải `>` ở mép phải.
  + Dòng phụ: "Đơn vị tính chính: Cái" (hoặc "Món") (`#666666` 13pt).
  + Các mặt hàng hiển thị: "1. Bánh xíu páo - 100012", "2. Hàng bán không có mô tả - 100032", "3. Hàng bán đơn vị tính 1 - 10013", "4. Hàng bán theo dõi lô - 10022", "5. Nguyên vật liệu theo dõi lô - 10033", "6. Nước mía - 102".
- Nút Đồng bộ FABi: góc dưới trái, dạng viên thuốc viền cam `#F48220` 1.5px, nền trắng `#FFFFFF`, icon tròn cam và chữ "Đồng bộ FABi" màu cam `#F48220` 13pt đậm, cao 38pt, bo góc 19pt.
- Nút thêm mới nổi (FAB): góc dưới phải, nút tròn đường kính 36pt, nền xanh `#0560A6`, icon dấu cộng `+` màu trắng 20pt, bóng đổ rõ.

### 10-form-hang-hoa.png

Ảnh ghép 3 khung của form Tạo mới hàng hóa dạng modal nổi từ đáy và tấm trượt quy đổi đơn vị. Mỗi khung rộng 587px (390pt), cao 1280px (850.5pt). Khung 1: Tạo mới hàng hóa (nửa trên form); khung 2: Tạo mới hàng hóa (cuộn xuống nửa dưới form); khung 3: Tấm trượt Quy đổi so với đơn vị tính chính.

Khung 1 (Tạo mới hàng hóa - nửa trên):
- Vùng phủ mờ: màu đen mờ chiếm phần đỉnh màn hình (lộ một phần tiêu đề "Hàng hóa" và icon phễu của màn danh mục).
- Modal nổi từ đáy: nền trắng `#FFFFFF`, bo tròn 2 góc trên 16pt, chiếm 90% chiều cao màn hình:
  + Thanh tiêu đề: nút dấu nhân `x` bên trái (nút tròn xám nhạt); tiêu đề "Tạo mới hàng hóa" căn giữa (`#1A1A1A` 18pt đậm 700).
  + Thẻ Thông tin chung: thẻ trắng lề 13.3pt, bo góc 13.3pt, bóng nhẹ; tiêu đề "Thông tin chung" (`#1A1A1A` 14pt đậm 600):
    * Hàng 1 chia 2 cột: bên trái là ô "Mã hàng", placeholder "Mã sinh tự động" (`#8C8C8C` 13pt); bên phải là ô "Đơn vị tính chính *", giá trị "000" màu xanh `#0560A6` 14pt, nút xoá `x` bên phải.
    * Hàng 2: ô "Tên hàng *", placeholder "Nhập tên hàng" (`#8C8C8C` 13pt).
    * Hàng 3: ô "Loại hàng *", giá trị "Nguyên vật liệu" màu xanh `#0560A6` 14pt, nút xoá `x` bên phải.
    * Liên kết mở rộng: chữ "Mở rộng v" màu xanh `#0560A6` 13pt căn phải.
  + Thẻ Theo dõi tồn kho: thẻ trắng lề 13.3pt, bo góc 13.3pt, bóng nhẹ:
    * Dòng 1: nhãn "Theo dõi tồn kho" (`#1A1A1A` 14pt đậm 600) bên trái; công tắc (toggle switch) bật ON màu xanh `#0560A6` (nút tròn trắng bên phải, cao 32.6pt, rộng 53pt) bên phải.
    * Dòng mô tả: "Đang theo dõi ở tất cả các kho đang quản lý. Bấm cấu hình nếu chỉ theo dõi 1 số kho nhất định" (`#666666` 12pt).
    * Nút liên kết cấu hình: icon bánh răng màu xanh, chữ "Cấu hình" màu xanh `#0560A6` 13pt căn giữa.
    * Đường phân cách đứt nét màu xám.
    * Dòng 2: nhãn "Quản lý theo lô, date" (`#1A1A1A` 14pt đậm 600) bên trái; công tắc (toggle switch) tắt OFF màu xám nhạt `#E0E0E0` (nút tròn trắng bên trái) bên phải.
- Nút thao tác đáy: nút chính "Lưu lại" toàn chiều rộng (lề 13.3pt), cao 45.8pt, nền xanh `#0560A6`, chữ trắng 16pt đậm 600, bo góc 16pt.

Khung 2 (Tạo mới hàng hóa - cuộn xuống nửa dưới):
- Phần trên: mép dưới của dòng "Mở rộng v" và khối "Theo dõi tồn kho" (giống khung 1).
- Thẻ Quy tắc làm tròn: thẻ trắng lề 13.3pt, bo góc 13.3pt, bóng nhẹ; tiêu đề "Quy tắc làm tròn" (`#1A1A1A` 14pt đậm 600); ô chọn nhãn "Quy tắc làm tròn *", giá trị "Không làm tròn" màu xanh `#0560A6` 14pt, nút xoá `x` bên phải.
- Thẻ Quy đổi so với đơn vị tính chính: thẻ trắng lề 13.3pt, bo góc 13.3pt, bóng nhẹ; tiêu đề "Quy đổi so với đơn vị tính chính" (`#1A1A1A` 14pt đậm 600); mô tả "Hàng hóa chỉ có 1 đơn vị tính, bấm Thêm mới nếu có nhiều hơn 1 đơn vị tính" (`#666666` 12pt, chữ "Thêm mới" đậm); nút bấm liên kết tròn xanh `+` kèm chữ "Thêm mới" màu xanh `#0560A6` 13pt căn giữa.
- Nút thao tác đáy: nút chính "Lưu lại" giống khung 1 (cao 45.8pt, nền xanh `#0560A6`, bo góc 16pt).

Khung 3 (Tấm trượt Quy đổi so với đơn vị tính chính):
- Vùng phủ mờ: màu đen mờ chiếm phần trên màn hình, để lộ nút `x` và tiêu đề "Tạo mới hàng hóa" của modal cha.
- Tấm trượt con nổi lên: nền trắng `#FFFFFF`, bo tròn 2 góc trên 16pt:
  + Thanh tiêu đề: nút dấu nhân `x` bên trái (nút tròn xám); tiêu đề "Quy đổi so với đơn vị tính chính" căn giữa (`#1A1A1A` 17pt đậm 700).
  + Đoạn hướng dẫn: "Vui lòng chọn đơn vị tính và nhập tỷ lệ quy đổi vào ô dưới đây sau đó bấm Thêm mới" (`#1A1A1A` 13pt, chữ "Thêm mới" đậm 600, căn giữa 2 dòng).
  + Khối thiết lập quy đổi: thẻ nền xám nhạt `#F5F6FA`, bo góc 13.3pt, lề 13.3pt:
    * Nửa trên: nhãn "Đơn vị tính chính" (`#666666` 12pt); giá trị "000" (`#1A1A1A` 15pt đậm 600).
    * Nút đảo ở giữa: viên thuốc nền trắng viền mờ bo tròn, chữ "Đảo vị trí ⇅" màu xanh `#0560A6` 13pt kèm hai mũi tên ngược chiều màu xanh.
    * Nửa dưới: bên trái là ô chọn "Đơn vị quy đổi", giá trị "Chọn đơn vị quy đổi v" màu xanh `#0560A6` 13pt; bên phải là nhãn "Tỷ lệ" (`#666666` 11pt) và ô nhập giá trị "1" (nền trắng bo góc 6pt, căn giữa).
- Nút thao tác đáy: nút chính "Thêm mới" toàn chiều rộng (lề 13.3pt), cao 45.8pt, nền xanh `#0560A6`, chữ trắng 16pt đậm 600, bo góc 16pt.

### 11-bao-cao.png

Ảnh 1 khung của màn hình Trung tâm Báo cáo (tab Báo cáo trên thanh điều hướng dưới). Rộng 587px (390pt), cao 1280px (850.5pt). Khung 1: Báo cáo (Trung tâm Báo cáo / tab Báo cáo).

- Đầu trang: nền chuyển sắc vàng kem nhạt `#F6E4BE` sang `#FFFFFF` và `#F5F6FA`, tiêu đề "Báo cáo" (`#1A1A1A` 20pt đậm 700), chip vàng bo góc "Pro" (chữ trắng 12pt đậm), không có nút quay lại vì là tab chính.
- Ô tìm kiếm báo cáo: nền trắng viền `#DBDBDB` 1px, cao 40pt, bo góc 10.6pt, biểu tượng kính lúp xám, placeholder "Tìm theo mã hoặc tên báo cáo..." (`#8C8C8C` 13pt).
- Danh sách 6 thẻ nhóm báo cáo: các thẻ trắng lề 13.3pt, bo góc 13.3pt, cao 58pt, bóng mờ nhẹ, khoảng cách 11pt:
  + Thẻ A: icon tròn nền xanh nhạt `#E1EBF5` chữ "A" màu xanh `#0560A6` 15pt đậm (đường kính 26.5pt); tiêu đề "Báo cáo quản trị kho" (`#1A1A1A` 15pt đậm 600); mô tả "Báo cáo kiểm soát, quản trị kho hàng" (`#666666` 12pt); mũi tên sang phải `>` màu xám mép phải thẻ.
  + Thẻ B: icon tròn chữ "B"; tiêu đề "Báo cáo đặt hàng" (`#1A1A1A` 15pt đậm 600); mô tả "Báo cáo kiểm soát, quản trị đặt hàng" (`#666666` 12pt); mũi tên `>`.
  + Thẻ C: icon tròn chữ "C"; tiêu đề "Báo cáo sản xuất" (`#1A1A1A` 15pt đậm 600); mô tả "Báo cáo kiểm soát, quản trị sản xuất" (`#666666` 12pt); mũi tên `>`.
  + Thẻ D: icon tròn chữ "D"; tiêu đề "Báo cáo giá thành" (`#1A1A1A` 15pt đậm 600); mô tả "Báo cáo giá thành sản phẩm, giá thành chế biến..." (`#666666` 12pt); mũi tên `>`.
  + Thẻ E: icon tròn chữ "E"; tiêu đề "Báo cáo công nợ" (`#1A1A1A` 15pt đậm 600); mô tả "Báo cáo công nợ nhà cung cấp, khách hàng" (`#666666` 12pt); mũi tên `>`.
  + Thẻ F: icon tròn chữ "F"; tiêu đề "Báo cáo phân tích" (`#1A1A1A` 15pt đậm 600); mô tả "Báo cáo phân tích nhà cung cấp..." (`#666666` 12pt); mũi tên `>`.
- Thanh điều hướng dưới: dạng nổi, bo góc 35pt, bóng nhẹ, gồm 5 tab: Trang chủ, Nghiệp vụ (huy hiệu đỏ "3"), Trợ lý (iOne), Báo cáo (đang chọn, icon cột sóng xanh `#0560A6`, chữ xanh), Khác.

### 12-xem-bao-cao.png

Ảnh ghép 3 khung của màn hình Xem chi tiết báo cáo A06 - Xuất nhập tồn. Mỗi khung rộng 632px (419.9pt, cắt chia 3 từ ảnh ghép 1895px gồm 2 màn hình cuộn ngang đối chiếu ảnh gốc), cao 1280px (850.5pt). Khung 1: Xem báo cáo A06 - Xuất nhập tồn (cột ghim và cột lô hàng); khung 2: Xem báo cáo A06 - Xuất nhập tồn (cuộn sang phải phần giữa bảng số liệu); khung 3: Xem báo cáo A06 - Xuất nhập tồn (các cột số liệu tồn đầu, nhập, xuất, tồn cuối).

Khung 1 (Cột ghim và cột lô hàng):
- Thanh trên: cao 48pt, nút quay lại `<-` cách lề trái 13.3pt, tiêu đề "A06 - Xuất nhập tồn" căn giữa (`#1A1A1A` 18pt đậm 600), icon phễu lọc màu xám `#1A1A1A` bên phải.
- Hàng chip điều kiện lọc: chip thời gian "Thời gian: 01/10/2026 - 13/10/2026" (nền xám nhạt `#EDEDED`, chữ `#1A1A1A` 12pt, bo góc 6pt, cao 26pt); chip kho "Kho: Corn 3" (nền xám nhạt, chữ `#1A1A1A` 12pt, bo góc 6pt).
- Ô tìm kiếm và công cụ bảng: ô tìm kiếm nền xám nhạt `#F0F1F5`, cao 38pt, bo góc 8pt, placeholder "Nhập mã, tên hàng hóa" (`#8C8C8C` 13pt); bên phải có nút chọn cột hiển thị (icon 3 cột dọc) và nút xoay ngang màn hình (icon xoay).
- Bảng số liệu:
  + Dòng tiêu đề bảng 2 tầng: tổng chiều cao 66.4pt, nền `#F5F5F5`, viền mờ `#EEEEEE` 1px; tầng trên có nhóm cột "Lô hàng"; tầng dưới gồm các cột: `#` (rộng 23pt), `Hàng hóa` (rộng 113pt, chữ `#666666` 12pt đậm), `Số lô`, `Ngày`.
  + Cột Hàng hóa ghim cố định: gồm tên hàng màu xanh `#0560A6` 13pt đậm và mã hàng `#1A1A1A` 12pt ở dòng dưới. Ví dụ: "Nguyên vật liệu theo dõi lô / 10033", "10 UP / 10UP", "12 quả trứng gà / 12", "Test gợi ý giá / 3LN6QGX2JTAT".
  + Cột Lô hàng: số lô (vd "TRUM011", "TRUM003", hoặc dấu gạch `--`), ngày (vd "30/06/2025", "02/07/2025", hoặc gạch `--`).
  + Mỗi dòng dữ liệu cao 54pt, phân cách bằng đường kẻ ngang mờ `#EEEEEE` 1px.

Khung 2 (Cuộn sang phải phần giữa bảng số liệu):
- Cắt từ phần giữa của ảnh gốc (chứa nửa trái của màn hình cuộn ngang thứ hai, phía trên có khoảng trống trắng do bố cục ảnh ghép).
- Hiển thị thanh trên "A06 - Xuất nhập tồn", các chip lọc thời gian và kho.
- Bảng số liệu ở trạng thái cuộn ngang: cột `#`, cột ghim `Hàng hóa` (mã và tên hàng), cột `Số lô` ("TRUM011", "TRUM003"), cột `Ngày`.

Khung 3 (Các cột số liệu tồn đầu, nhập, xuất, tồn cuối):
- Cắt từ nửa phải của màn hình cuộn ngang thứ hai.
- Hiển thị phần đuôi thanh trên với icon phễu lọc, công cụ bảng.
- Các cột số liệu cuộn ngang:
  + Tiêu đề cột: `Tồn đầu kỳ`, `Nhập kho`, `Xuất kho`, `Tồn cuối kỳ` (chữ `#666666` 12pt đậm, nền `#F5F5F5`).
  + Các dòng số liệu: mỗi ô hiển thị số lượng kèm đơn vị tính căn giữa hoặc căn phải (vd dòng 1: Tồn đầu kỳ "2 Cái", Nhập kho "0 Cái", Xuất kho "0 Cái", Tồn cuối kỳ "2 Cái"; dòng 2: Tồn đầu kỳ "0 Cái", Nhập kho "0 Cái", Xuất kho "0 Cái", Tồn cuối kỳ "0 Cái").
  + (Lưu ý: Không có dòng tổng cộng dính đáy bảng trong ảnh chụp).

### 13-khac.png

Ảnh 1 khung của màn hình Tác vụ khác / Tab Khác (nửa dưới màn hình khi cuộn trang). Rộng 587px (390pt), cao 1280px (850.5pt). Khung 1: Tác vụ khác (nửa dưới màn hình: nhóm Tài khoản, nhóm Hỗ trợ, phiên bản ứng dụng).

- Đầu trang: nền chuyển sắc vàng kem nhạt `#F6E4BE` sang `#FFFFFF` và `#F5F6FA`, tiêu đề "Tác vụ khác" (`#1A1A1A` 20pt đậm 700), chip vàng bo góc "Pro".
- Ô tìm kiếm: nền trắng viền `#DBDBDB` 1px, cao 40pt, bo góc 10.6pt, placeholder "Tìm cài đặt, danh mục, tài liệu..." (`#8C8C8C` 13pt).
- Thẻ danh mục (cuộn dở): dòng "Đơn vị tính" (icon vuông chữ "ĐV", mô tả "Tổng 259 đơn vị tính", mũi tên sang phải `>`).
- Thẻ nhóm "Tài khoản": thẻ trắng lề 13.3pt, bo góc 13.3pt, bóng nhẹ; tiêu đề nhóm "Tài khoản" (`#1A1A1A` 16pt đậm 600); gồm 3 dòng phân cách bởi đường kẻ mờ:
  + Dòng 1: icon vuông bo góc chữ "TK" (nền xanh nhạt `#E1EBF5`, chữ `#0560A6`), tên "Tài khoản" (`#1A1A1A` 15pt đậm 600), mũi tên `>`.
  + Dòng 2: icon vuông chữ "CV", tên "Chức vụ" (`#1A1A1A` 15pt đậm 600), mũi tên `>`.
  + Dòng 3: icon vuông chữ "BQ", tên "Bản quyền" (`#1A1A1A` 15pt đậm 600), mũi tên `>`.
- Thẻ nhóm "Hỗ trợ": thẻ trắng lề 13.3pt, bo góc 13.3pt, bóng nhẹ; tiêu đề nhóm "Hỗ trợ" (`#1A1A1A` 16pt đậm 600); gồm 3 dòng:
  + Dòng 1: icon vuông chữ "TL", tên "Tài liệu" (`#1A1A1A` 15pt đậm 600), mũi tên `>`.
  + Dòng 2: icon vuông chữ "GY", tên "Góp ý sản phẩm" (`#1A1A1A` 15pt đậm 600), mô tả "Đề xuất tính năng" (`#666666` 12pt), mũi tên `>`.
  + Dòng 3: icon vuông chữ "MS", tên "Lấy mã hỗ trợ" (`#1A1A1A` 15pt đậm 600), mô tả "Cho kỹ thuật viên truy cập" (`#666666` 12pt), mũi tên `>`.
- Chân trang:
  + Nút chọn ngôn ngữ bên trái: dạng viên thuốc viền mờ `#DBDBDB`, nền trắng, icon tròn cờ đỏ sao vàng Việt Nam, chữ "Tiếng Việt v" (`#1A1A1A` 13pt đậm).
  + Thông tin phiên bản bên phải: dòng chữ "Phiên bản: 2.6.5" màu xanh `#0560A6` 13pt.
  + (Lưu ý: Không có thẻ thông tin người dùng / avatar, không có số điện thoại quản trị viên, không có nút Đăng xuất màu đỏ như bản mô tả cũ bịa).

### 14-trong.png

Ảnh 1 khung của màn hình Trạng thái trống (Empty state) khi tìm kiếm trong danh mục Hàng hoá không có dữ liệu. Rộng 587px (390pt), cao 1280px (850.5pt). Khung 1: Trạng thái trống (tìm kiếm từ khóa không có dữ liệu trong danh mục Hàng hóa).

- Thanh trên: cao 48pt, nút quay lại `<-` cách lề trái 13.3pt, tiêu đề "Hàng hóa" căn giữa (`#1A1A1A` 18pt đậm 600), icon phễu lọc bên phải.
- Chip trạng thái: "Trạng thái: Đang hoạt động" (nền xám nhạt bo góc 8pt, cao 28pt).
- Hàng tab phân loại: tab "Tất cả 237" (đang chọn, gạch chân xanh), "Đã phân loại 234", "Chưa phân loại 3".
- Ô tìm kiếm: nền xám nhạt `#F0F1F5`, cao 40pt, bo góc 10.6pt, biểu tượng kính lúp, đang nhập từ khóa "zzzz|" kèm nút xoá `x` màu xám bên phải.
- Khối minh hoạ trung tâm: căn giữa toàn màn hình theo cả hai chiều:
  + Hình vẽ minh hoạ: tờ tài liệu có các dòng kẻ mờ và kính lúp đè lên, nét vẽ màu xám nhạt `#D8DFE6` và xanh nhạt, kích thước khoảng 120pt × 120pt.
  + Dòng thông báo chính: "Không tìm thấy dữ liệu" (`#1A1A1A` 16pt đậm 700), cách hình vẽ 20pt.
  + Dòng gợi ý phụ: "Xin vui lòng thử lại với từ khóa khác" (`#666666` 13pt), cách dòng chính 8pt.
  + (Lưu ý: Không có nút hành động phụ riêng như "Xoá tìm kiếm" hay "Làm mới").
- Các nút góc dưới:
  + Góc dưới trái: nút viên thuốc "Đồng bộ FABi" (viền cam `#F48220`, nền trắng, icon tròn cam và chữ cam).
  + Góc dưới phải: nút tròn xanh nổi (FAB) có icon dấu cộng `+` màu trắng.

## 5. Bộ nhận diện

### 5.1 Màu

Đếm theo số lần xuất hiện trong SVG của IVT. iaccdemo đã dùng cùng màu chính, nên chỉ dùng biến có sẵn:

| Vai trò | IVT Pro | Biến dùng |
|---|---|---|
| Màu chính, tab đang chọn, nút chính | `#0560A6` | `var(--blue)` |
| Màu chính đậm | `#0F6FBA` | `var(--blue-d)` |
| Nền nhạt màu chính | | `var(--tint)` |
| Màu nhấn cam | `#F89523`, `#F48220` | `var(--orange)` |
| Chữ đậm | `#263238`, `#1A1A1A` | `var(--ink)` |
| Chữ thân | `#363636` | `var(--body)` |
| Chữ phụ | `#666666`, `#AAAAAA` | `var(--muted)`, `var(--faint)` |
| Viền | `#DBDBDB`, `#D8DFE6` | `var(--line)` |
| Nền trang | `#F5F5F5` | `var(--bg)` |
| Đỏ, vàng, xanh lá | `#F83D23`, `#FEC100` | `var(--red)`, `var(--amber)`, `var(--green)` |

Chip trạng thái chứng từ lấy theo `TT_CT` ở `src/ui/generic/gen.ts`: `ok` xanh lá, `warn` vàng, `err` đỏ, `dim` xám. Dùng lại lớp `St` có sẵn nếu hợp, không đặt màu mới.

### 5.2 Kích thước

Số tạm, đợt 0 thay bằng số đo từ ảnh. Khai một lần thành biến trong mục CSS đợt 1, vd `--m-thanh-tren: 56px`. Đợt sau chỉ dùng biến, không ghi số trực tiếp.

| Thành phần | Số tạm | Số đo (đợt 0 điền) |
|---|---|---|
| Thanh trên: cao, cỡ chữ tiêu đề | 56px, 17px đậm 600 | 48pt – 53pt, tiêu đề 18pt đậm 600 (ảnh 03, 05) |
| Thanh dưới: cao (chưa tính vùng an toàn), biểu tượng, chữ nhãn | 60px, 24px, 11px | 85pt (dạng nổi), biểu tượng 24pt, chữ nhãn 11pt (ảnh 01, 01b) |
| Chữ thân, chữ phụ, chữ số tiền | 15px, 13px, 15px đậm 600 | Chữ thân 14pt – 15pt, chữ phụ 12pt – 13pt, số tiền 16pt – 17pt đậm (tổng to 20pt) (ảnh 01, 03, 05) |
| Lề hai bên màn | 16px | 13.3pt – 16.6pt (ảnh 01 – 05) |
| Thẻ danh sách: lề trong, bo góc, khoảng cách giữa thẻ | 12px 16px, 12px, 8px | Lề trong 10.6pt 13.3pt, bo góc 13.3pt – 16pt, khoảng cách 10.6pt – 12pt (ảnh 03, 05) |
| Chip trạng thái: cao, bo góc, cỡ chữ | 22px, 11px, 12px | 22pt, bo góc 5.3pt, chữ 11pt – 12pt (ảnh 03, 05) |
| Nút chính: cao, bo góc | 44px, 8px | 44pt – 48pt, bo góc 13.3pt – 16pt (ảnh 04, 05, 06 k1, 07 k1, 08 k3, 10 k1) |
| Ô nhập: cao, viền | 44px, 1px `var(--line)` | Ô nhập 38pt – 44pt bo 8pt – 13.3pt; thẻ trường 60pt – 67.8pt bo 13.3pt; viền 1px `var(--line)` (ảnh 04, 05, 06 k1, 07 k1, 08 k1, 10 k1) |
| Tấm trượt: bo góc trên | 16px | Bo góc trên 16pt; nút đóng tròn x ở góc trên; không có tay nắm kéo trong ảnh (ảnh 08 k3, ảnh 10 k1) |
| Nút thêm nổi: cỡ, cách đáy | 56px tròn, 16px trên thanh dưới | Viên thuốc dài 120pt × 45pt, bo góc 22.5pt, cách đáy 30pt (ảnh 03) |
| Thanh dưới nổi bo góc có bóng | | Cao 85pt, rộng 331.5pt – 348.8pt, bo góc 35pt, bóng mờ nhẹ, cách đáy 22pt, lề 13.3pt (ảnh 01, 01b) |
| Nền đầu trang màu kem | | Cao 180pt – 200pt, chuyển sắc từ #F4E4C0 sang #FFFFFF và #F5F6FA (ảnh 01) |
| Nút tròn tìm kiếm và chuông | | Đường kính 44.5pt, bo tròn 100%, nền #FFFFFF, bóng nhẹ, badge đỏ #E74538 14pt (ảnh 01) |
| Thanh chọn Quản trị / Cần theo dõi | | Cao 44.5pt, rộng 168.1pt, bo góc 22pt, nền #FAFAFA, tab chọn nền #FFFFFF bóng nhẹ (ảnh 01) |
| Nút lọc Kho | | Cao 28pt, rộng 103.6pt, bo góc 14pt, nền #FFFFFF, viền #DBDBDB (ảnh 01) |
| Công tắc bật tắt (toggle switch) | 24px × 40px | Cao 32.6pt, rộng 53pt, nút tròn 30pt, nền xanh #0560A6 khi bật, nền xám #E0E0E0 khi tắt; ảnh 13 không có công tắc (ảnh 10 k1) |
| Ô đánh dấu (checkbox) | 20px | 18.6pt × 18.6pt, bo góc 4pt, viền xanh #0560A6 nền xanh dấu tích trắng khi chọn, viền xám khi trống; ảnh 07 không có ô đánh dấu (ảnh 06 k2, ảnh 06 k3) |
| Bảng báo cáo: dòng tiêu đề, dòng số liệu | | Tiêu đề 2 tầng cao 66.4pt nền #F5F5F5; dòng số liệu cao 54pt viền mờ #EEEEEE; cột hàng hoá ghim cố định; không có dòng tổng cộng trong ảnh (ảnh 12 k1, k2, k3) |
| Trạng thái trống: hình minh hoạ, nút thao tác | | Hình minh hoạ 120pt × 120pt, tiêu đề "Không tìm thấy dữ liệu" 16pt đậm 700; không có nút thao tác phụ riêng (ảnh 14 k1) |

Thanh dưới cộng thêm `env(safe-area-inset-bottom)` để không bị thanh vuốt của iPhone che. `index.html` dòng 5 hiện chưa có `viewport-fit=cover`, đợt 1 thêm vào thẻ `meta viewport`.

## 6. Kiến trúc

### 6.1 File mới

```
src/ui/mobile/
  useLaMobile.ts      hook ngưỡng 767px
  MobileShell.tsx     khung: thanh trên, Outlet, thanh dưới
  ThanhDuoi.tsx       4 tab
  MTrangChu.tsx
  MNghiepVu.tsx
  MKhac.tsx
  MDanhSach.tsx       danh sách dùng chung (thẻ, tìm, chip, nút thêm)
  MLoc.tsx
  MXemPhieu.tsx
  MLapPhieu.tsx
  MChon.tsx           tấm trượt chọn
  MFormDm.tsx
  MBaoCao.tsx
  MTrong.tsx
  MChiMayTinh.tsx
  manMobile.ts        bảng tra: màn nào dùng component điện thoại nào
src/app/KhungApp.tsx  chọn Shell hay MobileShell
src/assets/ivt/       SVG chép từ docs/ivt-tai-nguyen khi dùng tới
```

Tạo file nào thì tạo đúng đợt cần nó, không tạo trước.

### 6.2 Hook ngưỡng

```ts
// src/ui/mobile/useLaMobile.ts
import { useSyncExternalStore } from 'react'

const MQ = '(max-width: 767px)'
const dangKy = (bao: () => void) => {
  const m = window.matchMedia(MQ)
  m.addEventListener('change', bao)
  return () => m.removeEventListener('change', bao)
}
export const useLaMobile = () => useSyncExternalStore(dangKy, () => window.matchMedia(MQ).matches)
```

### 6.3 Chọn khung

`src/app/KhungApp.tsx` trả `useLaMobile() ? <MobileShell /> : <Shell />`. Ở `src/App.tsx` đổi `<Route path="/app" element={<Shell />}>` thành `element={<KhungApp />}`. Không sửa gì khác trong `Shell.tsx`.

`MobileShell` phải giữ các việc `Shell` đang làm, ngoài phần giao diện:

- Chưa đăng nhập (`!s.loggedIn`) thì `<Navigate to="/dang-nhap" replace />`.
- Ghi lịch sử màn: `useEffect(() => { if (s.loggedIn) ghiGanDay(loc.pathname) }, [loc.pathname, s.loggedIn])`, import `ghiGanDay` từ `src/app/CommandPalette.tsx`.
- Gắn `<OnboardFabi />` (popup khởi tạo từ FABi).
- Thanh trên có chọn chi nhánh. Số liệu nhiều màn lọc theo `s.chiNhanh`, đổi bằng `set({ chiNhanh: c.id })` như `src/app/Topbar.tsx` dòng 63–66. Chọn đơn vị, đổi gói, đăng xuất đặt ở `MKhac`, làm y như `Topbar.tsx` dòng 36, 84, 104.

### 6.4 Chọn màn

Ở `src/app/Screen.tsx`, hàm `ScreenRoute`, dòng `const C = sc.comp ?? GENERIC[sc.kind]`:

```ts
const laMobile = useLaMobile()   // gọi ở đầu hàm, trước mọi return, đúng luật hook
...
const C = laMobile ? manMobile(sc, mod) : (sc.comp ?? GENERIC[sc.kind])
```

`manMobile` ở `src/ui/mobile/manMobile.ts` tra theo thứ tự:

1. Bảng riêng theo `mod.key + '/' + sc.slug`, vd `'trang-chu/tong-quan': MTrangChu`.
2. Theo `sc.kind`: `voucher` ra `MChungTu`, `catalog` ra `MDanhMuc`, `report` và `baocao` ra `MSoBaoCao`.
3. Không có thì ra `MChiMayTinh`.

Đợt nào làm xong component thì thêm vào bảng đúng đợt đó. Các nhánh trước `const C` trong `ScreenRoute` (chuyển báo cáo, trang khoá theo gói, báo cáo chưa có mẫu) giữ nguyên cho cả hai bản.

Các tab Nghiệp vụ, Khác không phải phân hệ. Thêm route tĩnh trong `App.tsx`, đặt trước `:mod`: `<Route path="nghiep-vu" element={<MNghiepVu />} />`, `<Route path="khac" element={<MKhac />} />`. Bản máy tính vào hai địa chỉ này thì `<Navigate to="/app" replace />`.

### 6.5 Dữ liệu

Không viết nguồn dữ liệu mới. Lấy đúng chỗ bản máy tính lấy:

| Màn | Lấy dữ liệu |
|---|---|
| Danh sách chứng từ | Bốn dòng đầu `VoucherScreen` (`cfg`, `tatCa`, `useDaXoa`, `rows`) ở `src/ui/generic/VoucherScreen.tsx` khoảng dòng 70–76. Đợt 3 tách thành hook `export function useDongChungTu(sc, mod)` trong cùng file, `VoucherScreen` gọi lại hook đó. Hành vi bản máy tính không đổi |
| Dòng của một phiếu | `r._dong` nếu có, không thì `dongCua(theoLoai(cfg, r.loai), \`${sc.code ?? sc.slug}-${r.id}\`)`. Kiểu `Dong` ở `gen.ts` dòng 23 |
| Trạng thái, nguồn phiếu | `TT_CT`, `NGUON` ở `gen.ts` |
| Lưu phiếu mới, sửa phiếu | `themPhieu`, `suaPhieu`, `soKeTiep` ở `src/ui/generic/daXoa.ts`, khoá màn là `` `${mod.key}/${sc.slug}` `` |
| Danh mục | `cfg.rows(s.cheDo, ky)` rồi lọc `cfg.locGoi`, cột `cfg.cols` (có thể là hàm theo gói, chế độ), như `CatalogScreen.tsx` dòng 33–48 |
| Lưu danh mục | Bản máy tính chỉ hiện toast "Đã lưu". Bản điện thoại làm giống, không lưu thật (việc T09) |
| Trang chủ | `tinhToanTongQuan` ở `src/modules/home/chiSo.ts` |
| Danh sách phân hệ, màn | `MODULES`, `hienPhanHe`, `tabCua`, `hienMan`, `moDuoc`, `duongDan` ở `src/app/registry.ts` |
| Chi nhánh | `CHI_NHANH` ở `src/data/mock.ts`, `chiNhanhHienTai(s)` ở `src/app/session.tsx` |

### 6.6 Thẻ danh sách

Mỗi dòng danh sách là một thẻ, bấm vào mở chi tiết theo đúng địa chỉ bản máy tính dùng.

Thẻ chứng từ:

```
┌──────────────────────────────────────┐
│ PC2610-0258            12.500.000    │  số phiếu (đậm)          tổng tiền (đậm, phải)
│ Công ty Hải Nam        [Đã ghi sổ]   │  đối tượng (doiTuong)    chip theo TT_CT[r.tt]
│ 07/10/2026 09:15 · Chi tiền mặt      │  ngày, giờ, tenLoai nếu có (chữ phụ)
└──────────────────────────────────────┘
```

Thẻ danh mục: dòng 1 `ten` (đậm), dòng 2 `ma` (chữ phụ), bên phải cột số đầu tiên của `cols` nếu có, chip Đang dùng hoặc Ngừng dùng theo `r._tt`.

## 7. Các đợt

Làm theo thứ tự. Đợt sau cần đợt trước đã push.

### Đợt 0. Chụp ảnh, đo số

- Trạng thái: Xong ngày 13/10/2026, còn chờ đời máy chụp để chốt hệ số.
- Người làm: Trum chụp, agent đo.
- Bắt đầu khi: luôn bắt đầu được.
- Bước:
  1. Trum chụp 16 ảnh ở mục 8 trên điện thoại thật, bỏ vào `docs/ivt-anh/`, tên đúng như mục 8.
  2. Agent ghi vào đầu mục 8 tên máy và độ phân giải ảnh. Tính hệ số điểm ảnh: bề rộng ảnh chia bề rộng logic của máy (iPhone 13: 1170 / 390 = 3).
  3. Đo từng mục trong bảng 5.2 trên ảnh bằng Python `PIL`, chia cho hệ số, điền cột "Số đo".
  4. Chốt nhãn thanh dưới theo ảnh 01, sửa mục 2 phần "Còn mở".
  5. Đối chiếu bảng mục 4 với ảnh, sửa chỗ sai.
- Không làm: không sửa `src/`.
- Nghiệm thu: bảng 5.2 không còn ô trống; mục 2 hết phần "Còn mở".

### Đợt 1. Khung, thanh trên, thanh dưới

- Bắt đầu khi: đợt 0 xong. Chưa có ảnh thì làm bằng số tạm ở 5.2, ghi rõ vào nhật ký.
- Bước:
  1. Tạo `useLaMobile.ts` (6.2), `KhungApp.tsx` (6.3), sửa `App.tsx`.
  2. Tạo `MobileShell.tsx`: thanh trên (tên màn hiện tại: lấy `mod`, `slug` từ địa chỉ, gọi `timMan` rồi `tenMan(sc)` ở `registry.ts`; tab Nghiệp vụ, Khác ghi tên tab; nút quay lại khi không ở tab gốc, nút chọn chi nhánh), `<Outlet />` cuộn được, `ThanhDuoi`.
  3. `ThanhDuoi.tsx`: 4 tab Trang chủ (`/app` để `HomeRedirect` chọn màn theo vai trò), Nghiệp vụ (`/app/nghiep-vu`), Báo cáo (`/app/bao-cao/tat-ca`), Khác (`/app/khac`). Biểu tượng `ic_navigation_tab_1_v2` … `4_v2`, đổi màu theo 3.
  4. Tab sáng theo địa chỉ: `/app/trang-chu/*` là Trang chủ; `/app/bao-cao/*` là Báo cáo; `/app/khac`, `/app/danh-muc/*`, `/app/he-thong/*` là Khác; còn lại là Nghiệp vụ.
  5. Thêm `manMobile.ts` (6.4) và `MChiMayTinh.tsx`. Sửa `Screen.tsx` như 6.4. Lúc này mọi màn trên điện thoại ra `MChiMayTinh`.
  6. Thêm tạm route `nghiep-vu`, `khac` ra `MChiMayTinh`. Đợt 2 thay bằng màn thật.
  7. Thêm cờ `--dien-thoai` cho `tools/kiem_tra.py`: mở trang ở khung 390×844, đi qua 4 tab và màn đầu của mọi phân hệ đang hiện, báo lỗi console, trang trắng, tràn ngang (`document.documentElement.scrollWidth > innerWidth`).
- File: `App.tsx`, `Screen.tsx`, `src/app/KhungApp.tsx`, `src/ui/mobile/*`, `src/assets/ivt/`, `app.css`, `index.html`, `tools/kiem_tra.py`.
- Không làm: không sửa `Shell.tsx`, `Topbar.tsx`, `Sidebar`.
- Nghiệm thu:
  1. Trước khi sửa, chạy `python tools/kiem_tra.py` rồi chép `tools/shots` sang `backup/shots-truoc`. Sau khi sửa, chạy lại, so từng cặp ảnh bằng `PIL.ImageChops.difference(a, b).getbbox()`. Mọi cặp phải ra `None`, trừ vùng đồng hồ nếu có.
  2. `python tools/kiem_tra.py --nhanh` in `Không có lỗi.`
  3. `python tools/kiem_tra.py --dien-thoai` in `Không có lỗi.`
  4. Mở Chrome DevTools, chế độ thiết bị iPhone 12 Pro (390×844): thấy thanh dưới, bấm đủ 4 tab, đổi chi nhánh được.
  5. Kéo cửa sổ qua lại mốc 768px: khung đổi theo, không lỗi console.

### Đợt 2. Trang chủ, Nghiệp vụ, Khác

- Bắt đầu khi: đợt 1 đã push.
- Bước:
  1. `MTrangChu`: ảnh nền `img_bg_top_dashboard_1.png` ở đầu, lời chào và tên đơn vị trên ảnh. Dưới ảnh là thẻ số liệu lấy từ `tinhToanTongQuan`: doanh thu, chi phí, lợi nhuận, tiền. Tiếp theo là hàng truy cập nhanh 4 ô: Thu tiền, Chi tiền, Nhập kho, Xuất kho, dùng `ic_quick_access_*` nếu hợp. Cuối là khối "Cần xử lý": phiếu chưa ghi sổ, lỗi hạch toán. Gắn vào bảng `manMobile` cho `trang-chu/tong-quan` và `trang-chu/ban-lam-viec`.
  2. `MNghiepVu`: lưới 3 cột, mỗi phân hệ đang hiện (`hienPhanHe(m, s.goi)`) một ô, trừ `trang-chu`, `bao-cao`, `danh-muc`, `he-thong`. Bấm ô thì mở danh sách màn của phân hệ (`tabCua(m)` lọc `hienMan`). Màn ngoài gói có ổ khoá, bấm vào ra trang khoá như QD05.
  3. Biểu tượng ô phân hệ: dùng biểu tượng khối đặc của bản web (`Icon` theo `m.icon`, như sidebar, QD23). Bỏ bảng biểu tượng IVT vì dùng chung biểu tượng web.
  4. `MKhac`: thẻ người dùng (tên, email, vai trò), nhóm "Danh mục & thiết lập" liệt kê màn của `danh-muc`, `he-thong`, nhóm "Đơn vị" (chọn đơn vị, gói), nút Đăng xuất màu đỏ.
- Không làm: biểu đồ của trang chủ bản máy tính, tuỳ chỉnh khối trang chủ.
- Nghiệm thu: ở 390×844, bấm hết ô Nghiệp vụ, mọi màn mở ra đúng địa chỉ bản máy tính; đổi gói Free, Standard, Plus, Pro thì ô và ổ khoá đổi theo; `--dien-thoai` sạch.

### Đợt 3. Danh sách chứng từ, danh mục, lọc, màn trống

- Bắt đầu khi: đợt 2 đã push.
- Bước:
  1. Tách hook `useDongChungTu` ở `VoucherScreen.tsx` (6.5). Chạy lại nghiệm thu so ảnh của đợt 1 để chắc bản máy tính không đổi.
  2. `MDanhSach`: props `{ rows, the: (r) => ReactNode, timTheo, chip?, onMo, onThem? }`. Ô tìm dính đầu, hàng chip cuộn ngang, danh sách thẻ, nút thêm nổi viên thuốc góc dưới phải, `MTrong` khi rỗng.
  3. `MChungTu`: có `id` trên địa chỉ thì để đợt 4 xử lý (tạm ra `MChiMayTinh`). Không có `id` thì gọi `useDongChungTu`, lọc theo `s.chiNhanh` giống `VoucherList` (tìm `cnChon` trong file đó), thẻ như 6.6. Chip: Tất cả, Chưa ghi sổ, Đã ghi sổ, Lỗi hạch toán. Màn nhiều loại phiếu (`cfg.loai`) thêm hàng chip loại phiếu. Bấm thẻ mở `` `${duongDan(mod, sc)}/${r.id}` ``. Nút thêm mở `/moi`, chọn loại bằng `MChon` nếu có `cfg.loai`. Không có nút thêm khi `cfg.khongThem`.
  4. `MLoc`: màn toàn màn, chọn khoảng ngày (Hôm nay, Tuần này, Tháng này, Tháng trước), đối tượng, nguồn. Thẻ lọc nổi bo góc, nút phụ Thiết lập lại, nút chính Áp dụng dính đáy.
  5. `MDanhMuc`: dữ liệu như 6.5, thẻ như 6.6, lọc nhóm theo `cfg.nhomLoc` bằng chip. Bấm thẻ tạm hiện toast, đợt 6 làm form.
  6. `MTrong`: hình theo màn (`img_empty_item`, `img_empty_supplier`, `img_search_no_result`, `img_empty_data`). Hình kèm thông báo "Không tìm thấy dữ liệu" và câu gợi ý (ảnh 14 k1). Không có nút phụ làm mới.
- Không làm: chọn nhiều, xoá hàng loạt, in hàng loạt, tuỳ chỉnh cột.
- Nghiệm thu: Thu chi, Mua hàng, Bán hàng, Kho (nhập, xuất, kiểm kê), Hàng hoá, Kho, Nhà cung cấp hiện thẻ; tìm, chip, lọc ra đúng số dòng như bản máy tính cùng điều kiện; bản máy tính không đổi.

### Đợt 4. Xem phiếu

- Bắt đầu khi: đợt 3 đã push.
- Bước:
  1. `MXemPhieu` mở khi địa chỉ có `id` khác `moi`. Thứ tự từ trên xuống:
     - Thẻ đầu phiếu: số phiếu, chip trạng thái, ngày giờ, đối tượng, chi nhánh, kho, tham chiếu liên kết.
     - Dòng phiếu dạng thẻ từng mặt hàng: số thứ tự, tên hàng, mã hàng, số lượng và đơn vị tính, đơn giá, chiết khấu, VAT, tổng tiền, ghi chú.
     - Khối tổng kết dòng hàng: thành tiền mặt hàng, tổng tiền giảm giá, tổng tiền thuế.
     - Khối Hạch toán thu gọn, bấm để mở. Dùng lại `HachToan` của `ChungTuForm.tsx` nếu hiển thị ổn ở 390px, không thì tự vẽ bảng Nợ, Có, Số tiền.
     - Lịch sử: dùng lại `LichSu`.
  2. Thanh thao tác dính đáy: dòng tổng tiền to bên trái; nút hành động màu cam rực "Trả lại" (hoặc hành động chính theo loại phiếu) và nút "⋮" mở menu phụ (Sửa, In, Sao chép, Xoá). Ẩn nút theo đúng điều kiện bản máy tính (phiếu đã khoá sổ không sửa).
  3. Phiếu có tham chiếu (điều chuyển, sản xuất, kiểm kê, thanh toán) hiện dòng "Tham chiếu" bấm sang phiếu kia.
- Không làm: sửa ngay trên màn xem.
- Nghiệm thu: mở phiếu chi, phiếu nhập kho, phiếu kiểm kê, phiếu xuất điều chuyển; số liệu khớp bản máy tính cùng phiếu.

### Đợt 5. Lập, sửa phiếu

- Bắt đầu khi: đợt 4 đã push.
- Bước:
  1. `MChon`: tấm trượt (bottom sheet) từ dưới lên, nút x đóng góc trên phải (không có tay nắm kéo). Có tiêu đề, ô tìm nhanh, danh sách chọn có nút tròn tích bên phải, hai nút Huỷ và Áp dụng ở đáy (ảnh 08 k3). Dùng cho chọn đối tượng, kho, nhóm hàng, lý do, loại phiếu.
  2. `MLapPhieu` mở ở `/moi` và ở chế độ sửa:
     - Bước 1 đầu phiếu (ảnh 06 k1, 08 k2): các thẻ trường Kho nhập, Nhà cung cấp, Thời gian nhập; chọn "Tự chọn hàng hóa" hoặc "Nhập theo mẫu đã khai báo"; nút Tiếp tục.
     - Bước 2 chọn hàng (ảnh 06 k2, k3): ô "Tất cả" thả xuống, nút tìm, ô tích chọn tất cả, thẻ hàng có ô tích (checkbox), thanh đáy hiện "Đã chọn: N" và nút "Danh sách đã chọn".
     - Bước 3 sửa hàng đã chọn (ảnh 08 k1): màn "Danh sách đã chọn", thẻ hàng có nút nhân đôi và xoá dòng. Có các ô số lượng, đơn vị tính, đơn giá, giảm giá, VAT, ghi chú, nút Tiếp tục.
     - Bước 4 thông tin nhập mua (ảnh 07 k1, k2): tóm tắt thông tin nhập, ô ghi chú, hoá đơn VAT, nút Thêm ảnh. Danh sách hàng có nút Sửa từng dòng, khối tổng kết, thanh đáy có dòng Tổng và hai nút "Lưu chờ duyệt", "Lưu & duyệt".
     - Bước 5 hoàn thành (ảnh 07 k3): màn "Tạo chứng từ thành công" với icon tích xanh, số phiếu vừa tạo, nút Đóng và nút Thanh toán.
  3. Lưu bằng `themPhieu` hoặc `suaPhieu`, số phiếu `soKeTiep`, ghi nhật ký `ghiNhatKy` như `ChungTuForm.tsx`. Lưu xong về `MXemPhieu` của phiếu vừa lưu.
  4. Phiếu thu, chi không có hàng: bước 2 là các dòng lý do, số tiền.
- Không làm: phiếu kiểm kê, điều chỉnh, sản xuất, điều chuyển trên điện thoại. Các loại này ra `MChiMayTinh` ở `/moi`.
- Nghiệm thu: lập được phiếu chi, phiếu nhập kho, phiếu bán hàng trên 390px; phiếu mới hiện đầu danh sách ở cả bản điện thoại và bản máy tính khi chưa tải lại trang.

### Đợt 6. Form danh mục

- Bắt đầu khi: đợt 3 đã push.
- Bước:
  1. `MFormDm`: dùng lại `CatalogPanel` (`CatalogScreen.tsx` dòng 302) với cùng props bản máy tính truyền ở dòng 280–295. Ép panel thành modal nổi bo góc trên bằng CSS trong `.m-app` (ảnh 10 k1..k3): nút x đóng góc trên trái, tiêu đề modal; các thẻ trường Thông tin chung, thẻ Theo dõi tồn kho có công tắc bật tắt (toggle switch) và link Cấu hình bánh răng, thẻ Quy tắc làm tròn, thẻ Quy đổi đơn vị tính kèm sheet con; nút Lưu lại dính đáy.
  2. `CatalogPanel` vỡ ở 390px chỗ nào thì sửa bằng CSS trong `.m-app`. Không đổi markup của panel.
- Không làm: thêm hàng loạt (`cfg.hangLoat`).
- Nghiệm thu: thêm, sửa hàng hoá, kho, nhà cung cấp, tài khoản trên 390px; ô nào cũng gõ được, không tràn ngang.

### Đợt 7. Báo cáo

- Bắt đầu khi: đợt 3 đã push.
- Bước:
  1. `MBaoCao` cho `bao-cao/tat-ca`: nền đầu trang chuyển sắc vàng kem nhạt kèm chip "Pro" (ảnh 11 k1); ô tìm kiếm "Tìm theo mã hoặc tên báo cáo..."; 6 thẻ nhóm báo cáo có icon tròn chữ cái A đến F (Quản trị kho, Đặt hàng, Sản xuất, Giá thành, Công nợ, Phân tích), mỗi dòng có tiêu đề, mô tả và mũi tên sang phải `>`.
  2. `MSoBaoCao` cho `report` và `baocao`: thanh lọc gồm chip thời gian và kho (ảnh 12 k1..k3); ô tìm kiếm mã/tên hàng kèm nút chọn hiển thị cột và nút xoay ngang; bảng số liệu tiêu đề 2 tầng nền `#F5F5F5`, cột `#` và cột Hàng hóa (mã và tên hàng) ghim cố định bên trái, các cột số liệu cuộn ngang gồm số lượng kèm đơn vị tính. Bảng lấy lại `RptTable` nếu được.
  3. Báo cáo tài chính, tờ khai (giấy A4) giữ tờ giấy, thu nhỏ vừa bề rộng, chạm để phóng to.
- Không làm: thiết kế mẫu in, tuỳ chỉnh báo cáo, xuất Excel trên điện thoại.
- Lưu ý: từ T171 (13/10/2026) chỉ còn Sổ quỹ tiền mặt 2.2.1, Sổ ngân hàng 2.2.3 ở mọi chế độ; TT58 giữ thêm bộ sổ, báo cáo tài chính TT58. Đọc `giuBC` ở `src/modules/bao-cao/danh-sach.ts` trước khi làm.
- Nghiệm thu: xuất nhập tồn (màn của Kho), sổ quỹ tiền mặt, sổ ngân hàng, một báo cáo tài chính TT58 đọc được trên 390px; trang không tràn ngang, chỉ khung bảng cuộn ngang.

### Đợt 8. Đăng nhập, chọn đơn vị, popup

- Bắt đầu khi: đợt 2 đã push.
- Bước:
  1. CSS điện thoại cho `Login`, `QuenMatKhau`, `ChonDonVi` (`src/modules/auth/`), `KhoiTao`, `KhoiTaoFabi`. Các màn này nằm ngoài `/app` nên không qua `MobileShell`. Bọc CSS bằng `@media (max-width: 767px)`, không đổi markup.
  2. `OnboardFabi` và các hộp thoại khác hiện toàn màn khi ở điện thoại.
  3. Rà màn `kind: 'custom'` (lệnh `grep -rn "kind: 'custom'" src/modules`), liệt kê màn đang ra `MChiMayTinh` vào `docs/TIEN-DO.md`, mỗi màn hoặc nhóm màn một việc.
- Nghiệm thu: đi trọn từ đăng nhập, chọn đơn vị, tới lập một phiếu chi trên 390px không gặp chỗ tràn hay nút bị che.

## 8. Ảnh cần chụp từ IVT Pro

Máy chụp: iPhone, chưa rõ đời (giả định 1 khung 587px = 390pt, đổi khi Trum báo đời máy). Độ phân giải ảnh: mỗi khung 587×1280px, file ghép nhiều khung. Hệ số điểm ảnh: giả định 1,505.

Cách chụp:

1. Dùng một điện thoại cho cả bộ ảnh, cầm dọc. Chụp cả màn hình, không cắt, không phóng to.
2. Để giao diện sáng (không bật chế độ tối), ngôn ngữ tiếng Việt, cỡ chữ hệ thống mặc định.
3. Đăng nhập IVT Pro bằng tài khoản thử có dữ liệu (bản STG). Ảnh sẽ nằm trong repo, nên không dùng tài khoản có dữ liệu khách thật.
4. Màn nào có chữ "Xem thêm", số đếm, chip trạng thái thì chụp lúc đang có dữ liệu, không chụp lúc trống (trừ ảnh 14).
5. Gửi ảnh về máy tính, đổi tên đúng cột "Tên file", bỏ vào `D:\IACC-CLOUD\Web\docs\ivt-anh\`. Định dạng PNG hoặc JPG đều được, giữ nguyên độ phân giải gốc.

| Tên file | Mở màn nào | Ảnh phải thấy |
|---|---|---|
| `01-trang-chu.png` | Mở app, đứng ở tab đầu của thanh dưới | Thanh trên, ảnh nền đầu trang, các thẻ số liệu, thanh dưới đủ tab và nhãn |
| `01b-trang-chu-cuoi.png` | Trang chủ, vuốt xuống tới cuối | Các khối dưới: truy cập nhanh, việc cần xử lý, thanh dưới |
| `02-nghiep-vu.png` | Bấm tab Nghiệp vụ | Toàn bộ lưới ô nghiệp vụ, biểu tượng, nhãn dưới ô |
| `03-ds-nhap-kho.png` | Nghiệp vụ, Nhập kho | Ô tìm, nút lọc, hàng chip trạng thái, ít nhất 3 thẻ phiếu, nút thêm |
| `04-loc.png` | Danh sách nhập kho, bấm nút lọc | Toàn màn lọc: chọn ngày, kho, trạng thái, nút Áp dụng, Đặt lại |
| `05-xem-phieu.png` | Bấm một phiếu nhập kho đã duyệt | Ảnh ghép 2 khung: khung 1 đầu phiếu và danh sách hàng; khung 2 các mặt hàng tiếp theo, khối tổng tiền và thanh nút thao tác dưới đáy |
| `06-chon-hang.png` | Danh sách nhập kho, bấm thêm phiếu, tới bước chọn hàng | Danh sách hàng có nút cộng trừ, ô tìm hàng, thanh dưới đếm số dòng, tổng tiền |
| `07-gio-hang.png` | Chọn 2 tới 3 mặt hàng, mở giỏ hàng | Các dòng đã chọn, ô số lượng, nút Lưu hoặc Tạo phiếu |
| `08-tam-truot.png` | Trong phiếu đang lập, bấm ô chọn kho hoặc nhà cung cấp | Tấm trượt từ dưới lên: thanh kéo, tiêu đề, ô tìm, danh sách |
| `09-ds-hang-hoa.png` | Danh mục, Hàng hoá | Danh sách hàng, ô tìm, nút thêm |
| `10-form-hang-hoa.png` | Danh sách hàng hoá, bấm thêm | Các ô nhập, nhãn ô, ô bắt buộc, nút Lưu |
| `11-bao-cao.png` | Bấm tab Báo cáo | Nhóm báo cáo, tên và mô tả từng báo cáo |
| `12-xem-bao-cao.png` | Mở báo cáo xuất nhập tồn | Chọn kỳ, bảng số liệu, dòng tổng |
| `13-khac.png` | Bấm tab cuối của thanh dưới | Thẻ tài khoản, danh sách mục cài đặt, nút Đăng xuất |
| `14-trong.png` | Danh sách hàng hoá, gõ tìm một chữ không có, vd `zzzz` | Hình minh hoạ, câu báo không có kết quả |

## 9. Rủi ro và cách chặn

| Rủi ro | Chặn bằng |
|---|---|
| Đổi khung ở `App.tsx`, `Screen.tsx` làm hỏng bản máy tính | So ảnh trước, sau ở đợt 1 và đợt 3. `useLaMobile` sai thì mọi thứ chạy như cũ |
| Xung đột git với người đang sửa `ChungTuForm.tsx`, `VoucherScreen.tsx`, `CatalogScreen.tsx` | Chỉ thêm export hoặc tách hook trong các file này. Ghi file vào cột Ghi chú khi nhận việc, thấy việc khác ghi cùng file thì hỏi người đó |
| Lệch số liệu giữa hai bản | Không viết nguồn dữ liệu mới (6.5). Nghiệm thu đợt 3, 4, 7 so số với bản máy tính |
| Màn mới thêm sau này không có bản điện thoại | `manMobile` tự rơi về `MChiMayTinh`, không trắng trang |
| Lộ khoá trong APK | Không mở `assets/flutter_assets/assets/config/`. Không commit APK |
| Phông SF Pro | Không đưa lên web (mục 2) |
