# Kế hoạch giao diện điện thoại theo IVT Pro (T170)

Mục tiêu: iaccdemo mở trên điện thoại thì ra giao diện giống app IVT Pro (iPOS Inventory), để khách dùng cả hai app thấy cùng một hệ sinh thái iPOS. Bản máy tính giữ nguyên.

Nguồn: `mobile/IVT Pro(STG).apk`, bản thử nghiệm, đọc ngày 12/10/2026. IVT Pro là app của iPOS nên được dùng lại màu, biểu tượng, hình minh hoạ (QD54).

## 1. Đọc được gì từ APK

IVT Pro viết bằng Flutter. Bố cục từng màn nằm trong `lib/*/libapp.so` dưới dạng mã máy, không có file layout để đọc. Từ APK lấy được:

| Lấy được | Ở đâu trong APK | Dùng làm gì |
|---|---|---|
| 238 biểu tượng SVG, PNG | `assets/flutter_assets/assets/icons/` | Thanh dưới, ô nghiệp vụ, truy cập nhanh, thông báo |
| 36 hình minh hoạ | `assets/flutter_assets/assets/images/` | Nền đầu trang chủ, màn trống (`img_empty_*`), không có mạng |
| Phông SF Pro Display 400–800 | `assets/flutter_assets/assets/fonts/` | Chỉ để đối chiếu, không đưa lên web (mục 3) |
| 1.640 câu chữ tiếng Việt | chuỗi trong `libapp.so` | Nhãn nút, tiêu đề, thông báo, tên báo cáo |
| 239 tên màn (`...Screen`) | chuỗi trong `libapp.so` | Bản đồ màn, khung màn dùng chung |

Không lấy được: khoảng cách, cỡ chữ, bo góc, đổ bóng, chuyển động. Phần này đo từ ảnh chụp màn hình (mục 6).

Bỏ qua `assets/flutter_assets/assets/config/.env.*`: file cấu hình máy chủ, có thể chứa khoá, không mở, không chép.

## 2. Cấu trúc app IVT Pro

Khung màn dùng chung (lớp gốc trong mã IVT), mọi màn nghiệp vụ kế thừa từ đây:

| Khung IVT | Việc của khung |
|---|---|
| `MainScreen` | Thanh điều hướng dưới 4 tab và nút Trợ lý (`ic_navigation_tab_1_v2`…`4_v2`, `ic_navigation_tab_assistant_v2`) |
| `DashboardScreen`, `DashboardTabAdminScreen`, `DashboardTabFollowScreen` | Trang chủ: ảnh nền kho (`img_bg_top_dashboard_1.png`), thẻ số liệu, truy cập nhanh, việc cần xử lý |
| `BusinessHomeScreen` | Lưới ô Nghiệp vụ: Nhập kho, Xuất kho, Đặt hàng, Kiểm kê, Sơ chế, Chế biến, Công nợ, Tồn đầu kỳ |
| `BaseListWithFilterScreen`, `BaseListScreen` | Danh sách: ô tìm, nút lọc, chip trạng thái, thẻ từng phiếu, nút thêm |
| `FilterScreen` | Màn lọc toàn màn: khoảng ngày (Hôm nay, Tuần này, 3 tháng gần đây), kho, trạng thái, Áp dụng |
| `BaseReceiptDetailScreen` | Xem phiếu: đầu phiếu, trạng thái, dòng hàng dạng thẻ, thanh thao tác dưới (Duyệt, Sửa, Sao chép, Chia sẻ, In) |
| `CreateNewReceiptScreen`, `PickItemToReceiptScreen`, `CartScreen` | Lập phiếu: chọn hàng như giỏ hàng, sửa số lượng, xác nhận |
| `BaseCatalogDetailScreen`, `BaseFormScreen` | Xem, thêm, sửa danh mục: nhóm ô nhập, nút Lưu dính đáy |
| `ChooseDropdownItemScreen`, `ChooseListWarehouseScreen` | Chọn từ danh sách dạng tấm trượt từ dưới lên |
| `ReportHomeScreen`, `ReportTypeTabScreen` | Báo cáo chia nhóm A–F, mỗi báo cáo một dòng có mô tả |
| `MoreScreen`, `ProfileScreen`, `SettingNotifyScreen` | Khác: Danh mục & thiết lập, tài khoản, cài đặt thông báo, đăng xuất |
| `ListNotificationScreen` | Thông báo theo loại (`ic_notification_*`) |
| `EmptyScreen`, `ErrorScreen` | Màn trống có hình minh hoạ, màn lỗi |

Đường dẫn trong app: `/business`, `/import_business`, `/export_business`, `/order_business`, `/stock_taking_business`, `/transfer_business`, `/prepare_business`, `/processing_business`, `/debt_business`, `/a_report`…`/f_report`, `/notification`, `/profile`.

## 3. Bộ nhận diện

Màu đếm theo số lần xuất hiện trong biểu tượng IVT, đặt cạnh biến đang có của iaccdemo:

| Vai trò | IVT Pro | iaccdemo hiện tại | Làm gì |
|---|---|---|---|
| Màu chính | `#0560A6` (153 lần), đậm `#0F6FBA` | `--blue: #0560a6` | Đã trùng, giữ |
| Màu nhấn cam | `#F89523`, `#F48220`, `#F0891F` | `--orange: #f28020` | Đã gần trùng, giữ |
| Chữ đậm | `#263238`, `#363636`, `#1A1A1A` (biểu tượng thanh dưới) | `--ink: #1f2225`, `--body: #363636` | Giữ |
| Chữ phụ | `#666666`, `#AAAAAA` | `--muted`, `--faint` | Giữ |
| Viền, nền | `#DBDBDB`, `#D8DFE6`, `#F5F5F5`, `#E8EAEB` | `--line`, `--bg: #f5f5f5` | Giữ |
| Đỏ | `#F83D23` | `--red: #c2362b` | Dùng `--red` hiện có |
| Vàng | `#FEC100` | `--amber` | Dùng `--amber` hiện có |

Kết luận: không cần thêm biến màu. iaccdemo đã dùng cùng màu chính, màu nhấn với IVT.

Phông: IVT nhúng SF Pro Display của Apple. Giấy phép của Apple chỉ cho dùng trên thiết bị Apple, nên không đưa file phông này lên web. Bản điện thoại dùng `-apple-system` trước, rồi tới Be Vietnam Pro: iPhone hiện đúng SF Pro như IVT, Android hiện Be Vietnam Pro.

Biểu tượng: chép SVG từ IVT vào `src/assets/ivt/`, chỉ chép cái nào dùng tới. Biểu tượng thao tác (tìm, lọc, thêm, quay lại) vẫn dùng `Icon.tsx` hiện có cho đồng bộ với bản máy tính.

## 4. Cách dựng trong iaccdemo

1. Giữ nguyên địa chỉ: `#/app/<phân hệ>/<màn>` mở đúng màn trên cả máy tính và điện thoại. Không làm địa chỉ riêng `/m`.
2. Màn rộng dưới 768px thì `App.tsx` dùng `MobileShell` thay `Shell`. Trên 768px không đổi gì. Kiểm bằng `window.matchMedia('(max-width: 767px)')`.
3. Làm khung điện thoại dùng chung trong `src/ui/mobile/`, mỗi khung ứng với một khung IVT. Màn generic hiện có (`CatalogScreen`, `VoucherScreen`, `ReportScreen`, `ChungTuForm`) khi ở điện thoại thì đưa dữ liệu sang khung này. Viết một lần, mọi phân hệ dùng được.
4. Dữ liệu, `registry.ts`, `features.json`, phân quyền theo gói giữ nguyên. Màn ngoài gói vẫn ra trang Nâng cấp.
5. CSS điện thoại gom vào một mục cuối `src/styles/app.css`, tiêu đề có mã việc. Mọi lớp bắt đầu bằng `m-` để không đè lên bản máy tính.
6. Màn chỉ có trên máy tính (thiết kế mẫu in, sơ đồ quy trình, bảng sửa nhiều cột) thì trên điện thoại hiện thẻ "Mở trên máy tính để dùng màn này".

Đối chiếu khung:

| Khung điện thoại mới | Theo khung IVT | Màn iaccdemo dùng |
|---|---|---|
| `MobileShell`: thanh trên + thanh dưới 4 tab | `MainScreen` | Toàn app |
| `MTrangChu` | `DashboardScreen` | `trang-chu/tong-quan`, `trang-chu/ban-lam-viec` |
| `MNghiepVu`: lưới phân hệ, bấm vào ra lưới màn | `BusinessHomeScreen` | Danh sách `MODULES` trong `registry.ts` |
| `MDanhSach`: tìm, lọc, chip, thẻ, nút thêm | `BaseListWithFilterScreen` | `VoucherScreen`, `CatalogScreen` |
| `MLoc`: màn lọc toàn màn | `FilterScreen` | Thanh lọc của danh sách, báo cáo |
| `MXemPhieu`: đầu phiếu, dòng hàng dạng thẻ, thanh thao tác | `BaseReceiptDetailScreen` | Xem phiếu trong `ChungTuForm` |
| `MLapPhieu`: chọn hàng kiểu giỏ | `PickItemToReceiptScreen`, `CartScreen` | Thêm, sửa phiếu trong `ChungTuForm` |
| `MForm`: nhóm ô nhập, Lưu dính đáy | `BaseFormScreen` | Thêm, sửa danh mục |
| `MChon`: tấm trượt chọn | `ChooseDropdownItemScreen` | `Dropdown`, `ChonDanhMuc`, chọn đơn vị, kho |
| `MBaoCao`: nhóm báo cáo, dòng có mô tả | `ReportHomeScreen` | `bao-cao/tat-ca` |
| `MKhac` | `MoreScreen`, `ProfileScreen` | Danh mục, hệ thống, gói thuê bao, đăng xuất |
| `MTrong` | `EmptyScreen` + `img_empty_*` | Danh sách rỗng, tìm không ra |

Thanh dưới đề xuất: Trang chủ, Nghiệp vụ, Báo cáo, Khác. Bỏ tab Trợ lý vì iaccdemo chưa có trợ lý.

## 5. Các đợt làm

Mỗi đợt là một việc trong `docs/TIEN-DO.md`, lấy mã khi nhận việc. Đợt sau dựa vào đợt trước, làm theo thứ tự.

| Đợt | Việc | File chính | Nghiệm thu |
|---|---|---|---|
| 0 | Chụp ảnh IVT Pro theo danh sách mục 6. Đo cỡ chữ, khoảng cách, bo góc, ghi vào mục 7 | `docs/ivt-anh/`, file này | Đủ 14 ảnh, bảng số đo điền xong |
| 1 | Khung: `MobileShell`, thanh trên, thanh dưới, chuyển giữa `Shell` và `MobileShell` theo bề rộng. Chép biểu tượng thanh dưới | `App.tsx`, `src/ui/mobile/`, `app.css` | Mở ở 390×844 thấy thanh dưới; ở 1280px bản máy tính không đổi một điểm ảnh |
| 2 | Trang chủ, Nghiệp vụ, Khác | `src/ui/mobile/` | Bấm hết ô Nghiệp vụ ra đúng màn |
| 3 | Danh sách, lọc, màn trống: chứng từ và danh mục | `VoucherScreen`, `CatalogScreen`, `src/ui/mobile/` | Thu chi, Mua hàng, Kho, Hàng hoá hiện dạng thẻ, lọc được |
| 4 | Xem phiếu | `ChungTuForm`, `src/ui/mobile/` | Mở phiếu chi, phiếu nhập kho xem đủ đầu phiếu, dòng, hạch toán |
| 5 | Lập, sửa phiếu kiểu giỏ hàng; tấm trượt chọn | `ChungTuForm`, `Dropdown`, `ChonDanhMuc` | Lập được phiếu nhập kho trên điện thoại |
| 6 | Form danh mục | `CatalogScreen`, `src/ui/mobile/` | Thêm, sửa hàng hoá, kho, nhà cung cấp |
| 7 | Báo cáo: danh sách nhóm, xem báo cáo cuộn ngang, chọn kỳ | `ReportScreen`, `BaoCaoScreen` | Mở xuất nhập tồn, sổ quỹ đọc được trên 390px |
| 8 | Đăng nhập, chọn đơn vị, thông báo | `modules/auth/`, `src/ui/mobile/` | Đi trọn từ đăng nhập tới lập phiếu trên điện thoại |

Mỗi đợt có sửa `src/` thì chạy đủ mục "Trước khi push" trong `AGENTS.md`. Thêm vào `tools/kiem_tra.py` một lượt chụp ở bề rộng 390px để bắt lỗi tràn ngang.

## 6. Ảnh cần chụp từ IVT Pro

Chụp trên điện thoại thật, bản mới nhất, cùng một máy. Lưu vào `docs/ivt-anh/`, đặt tên theo số dưới đây, vd `01-trang-chu.png`.

1. Trang chủ, cuộn tới cuối
2. Nghiệp vụ
3. Danh sách phiếu nhập kho, có chip trạng thái
4. Màn lọc của danh sách
5. Xem một phiếu nhập kho đã duyệt, cuộn tới cuối
6. Lập phiếu nhập kho: bước chọn hàng
7. Lập phiếu nhập kho: giỏ hàng, sửa số lượng
8. Tấm trượt chọn kho hoặc nhà cung cấp
9. Danh sách hàng hoá
10. Form thêm hàng hoá
11. Báo cáo: danh sách nhóm
12. Mở một báo cáo, vd xuất nhập tồn
13. Khác hoặc Tài khoản
14. Một màn trống, vd tìm không ra kết quả

## 7. Số đo từ ảnh

Điền ở đợt 0. Đợt 1 trở đi lấy số ở đây, không đoán.

| Thành phần | Số đo |
|---|---|
| Thanh trên: cao, cỡ chữ tiêu đề | |
| Thanh dưới: cao, cỡ biểu tượng, cỡ chữ nhãn, màu tab đang chọn | |
| Chữ thân, chữ phụ, chữ số tiền | |
| Thẻ danh sách: lề, bo góc, khoảng cách giữa thẻ | |
| Chip trạng thái: cao, bo góc, màu từng trạng thái | |
| Nút chính: cao, bo góc | |
| Ô nhập: cao, viền | |
| Tấm trượt: bo góc trên, thanh kéo | |

## 8. Rủi ro

- Đổi khung ở `App.tsx` ảnh hưởng mọi màn. Đợt 1 phải chứng minh bản máy tính không đổi: chụp 1280px trước và sau, so từng điểm ảnh.
- `ChungTuForm.tsx` (1.528 dòng), `VoucherScreen.tsx`, `CatalogScreen.tsx` đang có người khác sửa thường xuyên. Phần điện thoại tách ra file riêng trong `src/ui/mobile/`, file cũ chỉ thêm một nhánh rẽ, để ít xung đột.
- APK nặng 185 MB, là bản thử nghiệm. Không commit APK, không commit file `.env` trong APK.
