# 09. Kiến trúc Frontend và Backend dự kiến — IACC Cloud (iaccdemo)
Bản xuất từ repo iaccdemo commit 98d2bb3, ngày 23/11/2026.

## Phạm vi tài liệu
Tài liệu này đặc tả toàn diện kiến trúc kỹ thuật của hệ thống IACC Cloud. Nội dung bao gồm kiến trúc Frontend hiện hữu trong bản mẫu iaccdemo và mô hình kiến trúc Backend dự kiến xây dựng trong tương lai. Chi tiết về quy tắc giao diện người dùng hoặc quy trình làm việc nhóm nằm tại tài liệu 06 và 10.

## 1. Kiến trúc Frontend hiện hữu trong bản mẫu

### 1.1. Công nghệ nền tảng và môi trường thực thi
Bản mẫu iaccdemo được xây dựng trên nền tảng công nghệ gồm React 19.3.0, TypeScript 7.0.2 và Vite 8.3.3 (AGENTS.md:3, docs/KIEN-TRUC.md:1).
Toàn bộ mã nguồn chạy phía trình duyệt của người dùng qua cơ chế Client-Side Rendering (docs/KIEN-TRUC.md:1).
Ứng dụng dùng bộ định tuyến băm HashRouter trong React Router, giúp hệ thống chạy trên mọi máy chủ web tĩnh mà không cần cấu hình định tuyến lại (docs/TRIEN-KHAI.md:11).
Mã nguồn định dạng bằng CSS thuần tập trung trong một tệp duy nhất `src/styles/app.css` với hơn 49.000 dòng lệnh (docs/KIEN-TRUC.md:10).
Các biến giao diện `:root` ở đầu tệp CSS kiểm soát toàn bộ màu sắc, phông chữ và kích thước trong hệ thống (docs/KIEN-TRUC.md:10).

### 1.2. Cấu trúc thư mục mã nguồn
Cấu trúc cây thư mục của dự án được tổ chức theo từng lớp chức năng rõ ràng (docs/KIEN-TRUC.md:5):

```
src/
  main.tsx, App.tsx        Điểm khởi động ứng dụng, bộ định tuyến URL chính
  styles/app.css           Toàn bộ định dạng giao diện, biến màu :root
  app/                     Lõi quản trị ứng dụng: gói, phiên, quyền, thanh điều hướng
    features.json          Danh sách 120 tính năng sinh từ Excel trên máy Trum
    plan.ts                Quy tắc gói (S, PL, PR), lọc tính năng theo roadmap
    che-do.ts              4 chế độ thông tư kế toán (TT152, TT58, TT133, TT99)
    session.tsx            Quản lý trạng thái phiên làm việc, lưu localStorage
    registry.ts            Danh mục đăng ký 14 phân hệ và thứ tự hiển thị
    Shell.tsx              Khung bao ứng dụng web máy tính (Sidebar, Topbar)
    ModuleTabs.tsx         Thanh tab ngang đo bề rộng và dồn tab thừa
    Topbar.tsx             Thanh công cụ trên cùng chọn đơn vị, cửa hàng, gói
    CommandPalette.tsx     Hộp tìm kiếm nhanh không dấu toàn hệ thống
    Screen.tsx             Bộ điều phối mở màn hình theo đường dẫn URL
  ui/                      Hệ thống thành phần giao diện dùng chung (Page, Table, Dropdown)
    generic/               6 màn hình mẫu dùng chung (VoucherScreen, CatalogScreen, ChungTuForm)
    bao-cao/               Hạ tầng hiển thị và in ấn báo cáo tài chính (ToGiay, RptTable)
    mobile/                Toàn bộ hệ thống giao diện ứng dụng trên điện thoại di động
  data/
    mock.ts                Dữ liệu mô phỏng dùng chung, doanh thu ngày DAILY
  modules/                 Mã nguồn nghiệp vụ chia theo 14 phân hệ kế toán
    types.ts               Khai báo kiểu dữ liệu phân hệ, màn hình, chứng từ, danh mục
    auth/                  Màn hình đăng nhập, chọn đơn vị, quên mật khẩu
    onboarding/            Quy trình khởi tạo đơn vị dữ liệu mới từ FABi
    danh-muc/              Phân hệ 1: Quản lý danh mục kế toán
    tien/                  Phân hệ 2: Quản lý thu chi tiền mặt và ngân hàng
    ban-hang/              Phân hệ 3: Kế toán bán hàng và hoá đơn POS
    mua-hang/              Phân hệ 4: Kế toán mua hàng và công nợ nhà cung cấp
    kho/                   Phân hệ 5: Kế toán kho nguyên vật liệu và chế biến
    thue/                  Phân hệ 6: Kê khai thuế GTGT và thuế hộ kinh doanh
    tscd/                  Phân hệ 7: Quản lý tài sản cố định
    ccdc/                  Phân hệ 8: Quản lý công cụ dụng cụ và phân bổ chi phí
    gia-thanh/             Phân hệ 9: Tính giá thành sản xuất và chế biến
    tong-hop/              Phân hệ 10: Kế toán tổng hợp, kết chuyển và khoá sổ
    tien-ich/              Phân hệ 11: Tiện ích đồng bộ, đối soát và cảnh báo
    bao-cao/               Phân hệ 12: Trung tâm báo cáo toàn hệ thống
    he-thong/              Phân hệ 13: Quản trị người dùng, phân quyền, cấu hình
    trang-chu/             Phân hệ 14: Trang tổng quan và bàn làm việc kế toán
tools/                     Bộ công cụ kiểm thử, soát văn bản và xuất báo cáo
```

### 1.3. Registry phân hệ và cơ chế sinh màn hình tự động
Hệ thống sử dụng cơ chế đăng ký tập trung tại `src/app/registry.ts` để quản lý 14 phân hệ kế toán (docs/KIEN-TRUC.md:17):
- Mỗi phân hệ là một thư mục con trong `src/modules/`, có tệp `index.ts` xuất ra đối tượng kiểu `ModuleDef` (src/modules/types.ts:1).
- Hàm `tuExcel(modIndex, rieng)` tại `src/modules/types.ts:32` tự động đọc các tính năng tương ứng từ tệp `features.json` để sinh ra danh sách định nghĩa màn hình `ScreenDef`.
- Nếu tính năng được cấu hình trong `rieng` với thuộc tính `kind: 'custom'`, hệ thống sử dụng thành phần giao diện tự viết riêng (docs/KIEN-TRUC.md:64).
- Nếu không khai báo cấu hình riêng, hệ thống tự động gán vào một trong các màn hình mẫu dùng chung tuỳ theo nhóm tính năng: nhóm Danh mục ra `CatalogScreen`, nhóm Chứng từ ra `VoucherScreen`, nhóm Chức năng ra `ToolScreen`, nhóm Báo cáo ra `ReportScreen` (docs/KIEN-TRUC.md:64).

### 1.4. Đặc tả 6 màn hình mẫu dùng chung (Generic Screens)
Hệ thống xây dựng 6 màn hình mẫu dùng chung tại `src/ui/generic/` để phục vụ phần lớn các nghiệp vụ trong 120 tính năng Excel:

| Tên màn hình mẫu | Tệp mã nguồn | Vai trò và cấu trúc hiển thị | Nghiệp vụ tiêu biểu áp dụng |
| :--- | :--- | :--- | :--- |
| `CatalogScreen` | `src/ui/generic/CatalogScreen.tsx` | Quản lý danh mục dạng bảng, có thanh tìm kiếm, bộ lọc nâng cao, nút thêm mới mở bảng trượt bên phải và công cụ xuất nhập Excel. | Danh mục tài khoản, Danh mục khách hàng, Danh mục nhà cung cấp, Danh mục vật tư (Phân hệ 1). |
| `VoucherScreen` | `src/ui/generic/VoucherScreen.tsx` | Quản lý chứng từ kế toán hai vùng: bảng danh sách phía trên có vạch trạng thái màu và khung chi tiết hạch toán phía dưới khi bấm chọn dòng. | Phiếu thu chi tiền mặt 2.1.1, Hoá đơn mua hàng 4.1.1, Xuất kho huỷ 5.1.3 (Phân hệ 2, 4, 5). |
| `ChungTuForm` | `src/ui/generic/ChungTuForm.tsx` | Biểu mẫu lập và sửa chứng từ mở rộng toàn màn hình, thanh chân navy cố định, bảng dòng nhập liệu trực tiếp BangSua hỗ trợ phím Tab. | Biểu mẫu nhập phiếu chi tiền, Biểu mẫu nhập hoá đơn mua hàng, Biểu mẫu phiếu nhập kho. |
| `ReportScreen` | `src/ui/bao-cao/ReportScreen.tsx` | Trung tâm hiển thị báo cáo tài chính và sổ sách, tích hợp xem trước khổ A4 ToGiay, phân trang in ấn và xuất 5 định dạng tệp. | Sổ quỹ tiền mặt 2.2.1, Sổ tiền gửi ngân hàng 2.2.3, Báo cáo xuất nhập tồn 5.2.3. |
| `ToolScreen` | `src/ui/generic/ToolScreen.tsx` | Màn hình tiện ích thực thi tác vụ: khối mô tả chức năng, danh sách tham số thiết lập, nút bấm thực hiện và bảng nhật ký lần chạy gần nhất. | Đồng bộ kho 11.3, Tải sao kê ngân hàng 11.8, Kiểm tra kết nối cơ quan thuế 11.9 (Phân hệ 11). |
| `QuyTrinhScreen` | `src/ui/generic/QuyTrinhScreen.tsx` | Sơ đồ luồng nghiệp vụ trực quan dạng đồ thị các bước, liên kết trực tiếp tới các màn hình lập phiếu hoặc xem báo cáo tương ứng. | Tab Quy trình của các phân hệ Kho hàng, Mua hàng, Bán hàng, Thu chi tiền. |

### 1.5. Danh mục các màn hình tự viết riêng (Custom Screens)
Các nghiệp vụ có cấu trúc dữ liệu hoặc tương tác đặc thù được viết thành các thành phần riêng (docs/KIEN-TRUC.md:49):
- Phân hệ Bán hàng: màn hình gom chứng từ bán hàng POS `3-1-1`, bóc tách chi tiết từng dòng hoá đơn và kênh bán.
- Phân hệ Tiền: màn hình Sổ quỹ tiền mặt `SoQuy.tsx`, kết hợp kiểm tra số dư đầu kỳ, dòng phát sinh thu chi và số dư cuối kỳ theo thời gian thực.
- Phân hệ Kho hàng: màn hình Thẻ kho `TheKho.tsx`, Báo cáo xuất nhập tồn `XuatNhapTon.tsx`, Bảng tính giá vốn `TinhGiaVon.tsx` và màn hình Công thức chế biến `CongThucScreen.tsx`.
- Phân hệ Kê khai thuế: màn hình Tờ khai thuế GTGT `ToKhaiGTGT.tsx` (mẫu 01/GTGT khấu trừ và mẫu 04/GTGT trực tiếp) và Tờ khai thuế hộ kinh doanh `ToKhaiHKD.tsx`.
- Phân hệ Kế toán tổng hợp: Báo cáo kết quả kinh doanh `KetQuaKinhDoanh.tsx`, Bảng cân đối kế toán `CanDoiKeToan.tsx`, Bảng cân đối phát sinh `CanDoiPhatSinh.tsx`, Báo cáo lưu chuyển tiền tệ `LuuChuyenTien.tsx`, Tiện ích kiểm tra cuối kỳ `KiemTraCuoiKy.tsx` và Tiện ích khoá sổ `KhoaSo.tsx`.
- Phân hệ Tiện ích: Đồng bộ dữ liệu `DongBo`, Đối soát tự động `DoiSoat.tsx`, Hoá đơn đầu vào `HoaDonDauVao`, Duyệt chứng từ `DuyetChungTu` và Thiết kế mẫu in `ThietKeMauIn.tsx`.
- Phân hệ Hệ thống: Người sử dụng `NguoiDung`, Chức vụ và phân quyền `PhanQuyen`, Thông tin đơn vị `ThongTinDonVi`, Cấu hình kế toán `CauHinh` và Gói thuê bao `GoiThueBao.tsx`.

### 1.6. Quản lý trạng thái phiên làm việc trong Session
Toàn bộ thông tin trạng thái hoạt động của người dùng được đóng gói trong đối tượng `Session` tại `src/app/session.tsx:24`.
Bảng dưới đây liệt kê chi tiết các trường dữ liệu được lưu trữ trong phiên làm việc:

| Tên trường dữ liệu | Kiểu dữ liệu | Ý nghĩa nghiệp vụ trong hệ thống |
| :--- | :--- | :--- |
| `loggedIn` | `boolean` | Trạng thái đăng nhập của người dùng vào hệ thống. |
| `ten` | `string` | Họ và tên của người dùng đang đăng nhập (mặc định là Trần Thu Hà). |
| `email` | `string` | Địa chỉ email đăng nhập của tài khoản người dùng. |
| `role` | `Role` | Chức vụ vai trò của người dùng (ktt, ktv, tq, tk, cdn). |
| `donVi` | `string` | Mã định danh đơn vị kế toán đang mở (mặc định là pm - Phở May). |
| `goi` | `Goi` | Gói dịch vụ đang kích hoạt của đơn vị (S, PL, PR) (QD80). |
| `goiBan` | `number` | Phiên bản mã gói (giá trị 2 là bộ 3 gói S/PL/PR mới) (QD80). |
| `cheDo` | `CheDo` | Chế độ thông tư kế toán áp dụng (TT152, TT58, TT133, TT99) (QD31). |
| `cuaHang` | `string` | Cửa hàng đang làm việc, nhận mã cửa hàng cụ thể hoặc `all` để xem toàn chuỗi (QD66). |
| `khoiTao` | `boolean` | Trạng thái đã hoàn thành quy trình khởi tạo dữ liệu ban đầu. |
| `thuGon` | `boolean` | Trạng thái thu gọn thanh điều hướng sidebar về kích thước 64px. |
| `ppGtgt` | `PpGtgt` | Phương pháp tính thuế GTGT theo Thông tư 58 (`tyLe` hoặc `khauTru`). |
| `ppTndn` | `PpTndn` | Phương pháp tính thuế TNDN theo Thông tư 58 (`tyLe` hoặc `thuNhap`). |
| `soDuQuy` | `Record` | Số dư ban đầu của từng quỹ tiền mặt và tài khoản ngân hàng theo đơn vị. |
| `dongBoThuChi` | `Record` | Cấu hình tự động đồng bộ phiếu thu chi từ máy bán hàng FABi theo từng cửa hàng. |
| `mapPttt` | `Record` | Bảng ánh xạ phương thức thanh toán POS về tài khoản quỹ trong IACC Cloud. |
| `kieuSo` | `Record` | Cấu hình định dạng số tiền theo đơn vị (`vn` dùng 1.234.567,89 hoặc `qt` dùng 1,234,567.89). |
| `giamVat` | `Record` | Cấu hình giảm thuế giá trị gia tăng theo các nghị quyết của Quốc hội. |
| `hddt` | `Record` | Thiết lập thông số kết nối hệ thống phát hành hoá đơn điện tử của đơn vị. |

Toàn bộ đối tượng `Session` được lưu trữ trực tiếp vào bộ nhớ trình duyệt `localStorage` dưới khoá `iacc-cloud-session`, đảm bảo khi người dùng tải lại trang thì toàn bộ trạng thái làm việc vẫn được giữ nguyên vẹn (src/app/session.tsx:83).

### 1.7. Mô hình dữ liệu giả lập có hạt giống (Seed Mock Data)
Bản mẫu sử dụng kỹ thuật sinh dữ liệu giả lập có hạt giống toán học nhằm đảm bảo tính nhất quán tuyệt đối giữa các lần tải trang (docs/KIEN-TRUC.md:30):
- Dữ liệu doanh thu bán hàng theo ngày `DAILY` trong `src/data/mock.ts` ghi nhận số liệu bán hàng thực tế mô phỏng của từng cửa hàng từ 01/07/2026 đến 07/10/2026.
- Mọi màn hình báo cáo, từ Báo cáo kết quả kinh doanh đến Sổ cái và Cân đối phát sinh, đều đọc số liệu từ nguồn `DAILY` thông qua bộ tính toán tập trung tại `src/modules/tong-hop/so-cai.ts` (docs/KIEN-TRUC.md:80).
- Bộ sinh số ngẫu nhiên có hạt giống `src/ui/format.ts:40` và `src/ui/generic/gen.ts` đảm bảo mỗi chứng từ, mỗi danh mục khi mở lại đều có đúng số tiền, ngày tháng và nội dung hạch toán cũ, không bị thay đổi ngẫu nhiên.
- Các thao tác thêm mới, chỉnh sửa hoặc xoá chứng từ của người dùng được lưu tạm vào bộ nhớ phiên qua mô đun `src/ui/generic/daXoa.ts`, cho phép trải nghiệm đầy đủ nghiệp vụ CRUD mà không cần kết nối máy chủ (src/ui/generic/daXoa.ts:1).

### 1.8. Quy trình biên dịch và tự động triển khai (CI/CD)
Hạ tầng triển khai của iaccdemo được tự động hoá hoàn toàn thông qua GitHub Actions (docs/TRIEN-KHAI.md:17):
- Luồng triển khai `deploy.yml` tự động kích hoạt khi có commit đẩy lên nhánh `main` chứa tệp nguồn code (docs/TRIEN-KHAI.md:20).
- Hệ thống chạy lần lượt các bước: cài đặt gói thư viện chuẩn xác qua `npm ci`, kiểm tra kiểu dữ liệu tĩnh qua `npm run typecheck`, biên dịch ứng dụng qua `npm run build`.
- Thư mục đầu ra `dist/` được đẩy trực tiếp lên nền tảng Cloudflare Pages tại địa chỉ `https://iaccdemo.pages.dev` thông qua công cụ `wrangler` (docs/TRIEN-KHAI.md:23).
- Thời gian đóng gói và đưa lên mạng trung bình từ 20 đến 30 giây cho mỗi lần cập nhật (docs/TRIEN-KHAI.md:26).
- Đối với bản phát hành chính thức `https://i-accounting.pages.dev`, luồng công việc `release.yml` sẽ thực hiện đóng gói khi có git tag dạng `v*` được tạo (docs/TRIEN-KHAI.md:36).

---

## 2. Kiến trúc Backend dự kiến (Planned Backend Architecture)

> **Thông báo quan trọng**: Toàn bộ nội dung trong Mục 2 dưới đây mô tả thiết kế **Dự kiến** cho hệ thống Backend trong tương lai, chưa được lập trình trong mã nguồn hiện tại của repo iaccdemo.

### 2.1. Định hướng kiến trúc tổng thể Backend dự kiến
Repo chưa chốt công nghệ backend: chưa chọn ngôn ngữ, khung, cơ sở dữ liệu, hàng đợi. Tài liệu trong repo không nhắc tên công nghệ cụ thể nào. Ai hỏi "backend viết bằng gì, dùng cơ sở dữ liệu gì" thì câu trả lời đúng là: chưa chốt, hỏi Trum.
Những yêu cầu suy ra được từ bản mẫu (chưa phải thiết kế đã duyệt):
- Nhiều đơn vị kế toán trên một tài khoản: mỗi đơn vị có số liệu riêng, người dùng chọn đơn vị khi đăng nhập (src/app/session.tsx).
- Nhận dữ liệu đồng bộ từ FABi, iPOS Inventory, POS và hoá đơn điện tử (mục 2.3).
- Số liệu kế toán phải cân Nợ, Có và không được ghi dở dang khi lỗi giữa chừng.

### 2.2. Bảng thực thể dữ liệu cốt lõi Backend dự kiến
Bảng dưới suy từ kiểu dữ liệu và dữ liệu giả của bản mẫu (src/modules/types.ts, src/data/mock.ts). Tên bảng tiếng Anh là tên gợi ý của người soạn tài liệu, chưa phải thiết kế đã duyệt.


Dưới đây là danh mục chi tiết các bảng thực thể dữ liệu dự kiến cần lưu trữ trong cơ sở dữ liệu máy chủ:

| Tên thực thể dự kiến | Mô tả mục đích | Các trường thông tin chính | Quan hệ liên kết |
| :--- | :--- | :--- | :--- |
| `tenants` (Đơn vị kế toán) | Quản lý thông tin pháp lý doanh nghiệp hoặc hộ kinh doanh | `id`, `ten`, `mst`, `dia_chi`, `loai_hinh`, `che_do_tt`, `nam_tai_chinh`, `pp_thue_gtgt`, `pp_thue_tndn`, `goi_dich_vu`, `ngay_tao` | Cha của mọi dữ liệu trong hệ thống |
| `stores` (Cửa hàng / Chi nhánh) | Quản lý các điểm bán hàng trực thuộc chuỗi F&B | `id`, `tenant_id`, `ma_cua_hang`, `ten_cua_hang`, `dia_chi`, `fabi_store_id`, `kho_mac_dinh_id`, `trang_thai` | Thuộc `tenants`, liên kết POS FABi |
| `users` (Người sử dụng) | Quản lý tài khoản đăng nhập và nhân sự kế toán | `id`, `tenant_id`, `ho_ten`, `email`, `mat_khau_hash`, `dien_thoai`, `chuc_vu_id`, `trang_thai_2fa`, `ngay_khoi_tao` | Thuộc `tenants`, liên kết `roles` |
| `roles` (Chức vụ & Phân quyền) | Quản lý ma trận quyền hạn theo từng chức danh | `id`, `tenant_id`, `ten_chuc_vu`, `mo_ta`, `ds_quyen_json`, `la_mac_dinh` | Thuộc `tenants` |
| `user_stores` (Phân công cửa hàng) | Giới hạn phạm vi cửa hàng được phép thao tác của nhân viên | `user_id`, `store_id`, `quyen_han` | Nối giữa `users` và `stores` |
| `catalogs_item` (Hàng hoá / Vật tư) | Danh mục món ăn, nguyên vật liệu, đồ khô | `id`, `tenant_id`, `ma_hang`, `ten_hang`, `loai_hang`, `nhom_id`, `dvt_chuan_id`, `gia_von_dinh_muc`, `thue_suat` | Thuộc `tenants`, liên kết iPOS Inventory |
| `catalogs_partner` (Khách hàng / NCC) | Danh mục đối tượng công nợ, giao dịch | `id`, `tenant_id`, `ma_doi_tuong`, `ten_doi_tuong`, `loai` (KH/NCC/NV), `mst`, `dia_chi`, `dien_thoai`, `so_tai_khoan_nh` | Thuộc `tenants` |
| `accounts` (Hệ thống tài khoản) | Danh mục tài khoản kế toán theo thông tư áp dụng | `id`, `tenant_id`, `so_hieu_tk`, `ten_tk`, `tk_me_id`, `tinh_chat` (DuNo/DuCo/LuongTinh), `cap_tk`, `trang_thai` | Thuộc `tenants`, phân cấp cây |
| `vouchers` (Chứng từ kế toán) | Bảng đầu phiếu cho mọi loại giao dịch phát sinh | `id`, `tenant_id`, `store_id`, `loai_ct`, `so_ct`, `ngay_ct`, `ngay_hach_toan`, `doi_tuong_id`, `dien_giai`, `tong_tien`, `trang_thai_ghi_so`, `nguon_du_lieu` | Thuộc `tenants`, `stores`, `catalogs_partner` |
| `voucher_entries` (Bút toán hạch toán) | Dòng định khoản Nợ Có chi tiết của từng chứng từ | `id`, `voucher_id`, `stt_dong`, `tk_no_id`, `tk_co_id`, `so_tien`, `dien_giai_dong`, `khoan_muc_cp_id`, `cong_viec_id` | Thuộc `vouchers`, liên kết `accounts` |
| `voucher_lines` (Dòng chi tiết hàng hoá) | Dòng hàng hoá, vật tư, số lượng, đơn giá | `id`, `voucher_id`, `stt_dong`, `hang_hoa_id`, `kho_id`, `dvt_id`, `so_luong`, `don_gia`, `thanh_tien`, `tien_thue`, `tien_chiet_khau` | Thuộc `vouchers`, liên kết `catalogs_item` |
| `fiscal_periods` (Kỳ kế toán & Khoá sổ) | Trạng thái chốt số liệu kế toán theo từng tháng | `id`, `tenant_id`, `store_id`, `nam`, `thang`, `da_khoa_so`, `ngay_khoa_so`, `nguoi_khoa_so_id` | Thuộc `tenants`, `stores` |
| `audit_logs` (Nhật ký thao tác) | Ghi nhận toàn bộ vết tương tác hệ thống để kiểm tra | `id`, `tenant_id`, `user_id`, `thoi_diem`, `loai_thao_tac`, `ten_chung_tu`, `khoa_ngoai_id`, `du_lieu_cu_json`, `du_lieu_moi_json`, `ip_client` | Bất biến, không thể sửa xoá |

### 2.3. Luồng tích hợp và đồng bộ dữ liệu Backend dự kiến

#### Luồng đồng bộ bán hàng từ POS FABi dự kiến
Hệ thống kết nối với máy chủ FABi qua giao diện Webhook thời gian thực:
- Khi thu ngân đóng ca hoặc in hoá đơn thanh toán, máy POS gửi một gói dữ liệu giao dịch về Backend IACC Cloud.
- Backend tiếp nhận gói tin, kiểm tra tính toàn vẹn và xác thực chữ ký bảo mật của FABi.
- Động cơ hạch toán tự động đọc ánh xạ phương thức thanh toán để sinh phiếu Thu tiền mặt hoặc Thu chuyển khoản ngân hàng tương ứng.
- Động cơ đồng thời lập chứng từ Xuất bán POS mã 3.1.1, phân bổ doanh thu chi tiết theo từng dòng món ăn, thuế GTGT và tiền giảm giá khuyến mại.
- Trong trường hợp mất kết nối mạng tại cửa hàng, máy POS lưu tạm dữ liệu vào hàng đợi cục bộ và tự động gửi lại khi có mạng trở lại theo cơ chế đảm bảo giao hàng ít nhất một lần (At-least-once Delivery) kèm mã khoá chống trùng lặp dữ liệu (Idempotency Key).

#### Luồng đồng bộ kho từ iPOS Inventory dự kiến
Hệ thống kết nối định kỳ hoặc qua sự kiện với máy chủ kho vận iPOS Inventory:
- Lấy tự động danh mục nguyên vật liệu mới, đơn vị tính và nhóm hàng hoá sang danh mục IACC Cloud.
- Đọc các phiếu nhập mua nguyên liệu tại kho để sinh chứng từ Mua hàng (mã 4.1.1) và ghi nhận công nợ nhà cung cấp.
- Đọc các phiếu xuất kho điều chuyển, xuất huỷ và biên bản kiểm kê để sinh các chứng từ kế toán kho tương ứng.
- Đồng bộ công thức định lượng món ăn để tự động tính toán nhu cầu xuất kho nguyên liệu cho từng hoá đơn bán hàng phát sinh.

#### Luồng hoá đơn điện tử và hoá đơn đầu vào dự kiến
Hệ thống kết nối trực tiếp với cổng hoá đơn điện tử iPOS và Tổng cục Thuế:
- Nhận diện hoá đơn mua hàng đầu vào thông qua tệp XML hoá đơn điện tử chuẩn của cơ quan thuế.
- Động cơ đọc dữ liệu tự động đối chiếu mã số thuế người bán, kiểm tra tính hợp lệ của chữ ký số và so khớp với các phiếu mua hàng đang chờ hoá đơn.
- Cho phép kế toán duyệt hoá đơn hợp lệ để sinh ngay chứng từ Mua hàng kèm thuế GTGT đầu vào được khấu trừ mà không cần nhập liệu thủ công.

### 2.4. Hạ tầng phân quyền và bảo mật Backend dự kiến
Bản mẫu đã có phân quyền trên giao diện: chức vụ, vai trò, phạm vi cửa hàng được giao (src/modules/he-thong/HeThong.tsx, src/app/session.tsx). Backend sau này phải kiểm lại đúng các quyền đó phía máy chủ, vì giao diện chặn thì người dùng vẫn gọi thẳng được API.
Cách đăng nhập, cách mã hoá, cách lưu phiên: chưa thiết kế, repo chưa ghi.

### 2.5. Hệ thống nhật ký thao tác và tính toàn vẹn dữ liệu Backend dự kiến
Bản mẫu có màn Nhật ký thao tác với dữ liệu giả: ai, lúc nào, thêm, sửa, xoá chứng từ nào (src/modules/he-thong/nhatKyMau.ts, src/ui/generic/daXoa.ts). Backend sau này cần lưu thật các dòng này và không cho sửa, xoá nhật ký. Cách lưu cụ thể chưa thiết kế.

## 3. Phân định trạng thái các khối kiến trúc

Nhằm đảm bảo sự minh bạch về mặt kỹ thuật, hiện trạng kiến trúc của IACC Cloud được phân định cụ thể:

### 3.1. Đã có trong bản mẫu
Toàn bộ kiến trúc Frontend với 14 phân hệ, bộ định tuyến URL và hệ thống quản lý trạng thái phiên làm việc trong `src/app/session.tsx` (docs/KIEN-TRUC.md:16).
Hệ thống thành phần dùng chung, khung bao ứng dụng máy tính và di động (src/ui/).
Cơ chế sinh màn hình tự động qua `tuExcel()` kết hợp với màn hình tuỳ biến chuyên sâu (src/modules/types.ts:32).
Bộ sinh số liệu giả lập có hạt giống đảm bảo số liệu kế toán và báo cáo tài chính khớp đúng tuyệt đối (src/data/mock.ts:1, src/modules/tong-hop/so-cai.ts:1).
Quy trình tự động kiểm tra tĩnh và triển khai liên tục qua GitHub Actions lên Cloudflare Pages (docs/TRIEN-KHAI.md:17).

### 3.2. Dự kiến / chưa làm
Toàn bộ backend: máy chủ, cơ sở dữ liệu, API.
Cổng tiếp nhận kết nối với FABi và iPOS Inventory.
Đăng nhập thật, mã hoá mật khẩu, cấp quyền truy cập.
Lưu nhật ký thao tác trên máy chủ.

### 3.3. Chưa chốt
Công nghệ backend: ngôn ngữ, khung, cơ sở dữ liệu, hàng đợi. Repo chưa ghi lựa chọn nào.
Cách tách số liệu giữa các khách hàng trên máy chủ.
