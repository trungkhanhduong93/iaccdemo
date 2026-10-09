# Kiến trúc và quy ước code

Đọc trước khi sửa code: thư mục nào chứa gì, viết theo quy ước nào.

## Cấu trúc thư mục

```
src/
  main.tsx, App.tsx        router: /dang-nhap, /quen-mat-khau, /chon-don-vi, /khoi-tao, /app/:mod/:slug(/:id)
  styles/app.css           toàn bộ CSS, biến màu ở :root (navy, cam iPOS, màu 4 gói)
  app/
    features.json          SINH TỪ EXCEL, không sửa tay
    plan.ts                gói, coTrongGoi(), kieuGhiSo(); THEO_ROADMAP đè gói lên features.json (QD19); BO_SUNG thêm màn chưa có trong Excel (QD31); anNgoaiGoi() gói Free ẩn tính năng ngoài gói (QD22)
    che-do.ts              4 chế độ kế toán TT152, TT58, TT133, TT99, cặp gói và chế độ hợp lệ, canCu() (QD31)
    mau-in.ts              17 mẫu in chứng từ theo chế độ, mauCuaChungTu() ghép chứng từ với mẫu
    session.tsx            phiên: người dùng, vai trò, đơn vị, chi nhánh làm việc, gói (localStorage); chiNhanhHienTai()
    registry.ts            thứ tự 14 phân hệ trên sidebar; tự thêm màn Quy trình, Báo cáo; dựng phân hệ Báo cáo gom mọi màn báo cáo; moDuoc(), hienMan(), hienPhanHe(), tenMan(), tabCua(), dich()
    Shell.tsx              sidebar: ô tìm nhanh (Ctrl+K), nút Thêm nhanh, phân hệ lớn, thu gọn sidebar
    ModuleTabs.tsx         thanh tab ngang, đo bề rộng để dồn tab thừa vào "Khác"
    Topbar.tsx             đơn vị kế toán, chi nhánh làm việc, nút Trải nghiệm gói (QD17, QD22). Vai trò lấy theo tài khoản lúc đăng nhập
    CommandPalette.tsx     tìm nhanh không dấu
    Screen.tsx             mở màn theo đường dẫn, trang Nâng cấp khi màn ngoài gói
  ui/                      Icon, format, Table (có hàng lọc từng cột qua prop loc), LocCot (ô lọc có phễu theo kiểu cột), CongCuDs (nút Excel, Tuỳ chỉnh giao diện),
                           Page (tiêu đề, thẻ, nhãn gói), Charts, FormToanMan (khung form toàn màn hình),
                           Dropdown (menu thả xuống, MenuItem, ô chọn Select thay thẻ select), Logo
    generic/               6 màn chung: CatalogScreen, VoucherScreen (danh sách có cột đứng yên, khung chi tiết), ChungTuForm (form toàn màn hình AMIS), BangSua (bảng dòng gõ trực tiếp), ReportScreen, ToolScreen,
                           QuyTrinhScreen (sơ đồ, khung Báo cáo, hàng dưới), BaoCaoScreen (tab Báo cáo)
    bao-cao/               ToGiay (tờ A4 chia trang, zoom, in), InChungTu (mẫu in, hộp in), duLieuIn, khoMauIn (mẫu riêng, người ký), xuat, xuatXlsx, tuyChinhBC, TuyChinhBC
    thiet-ke/              lõi tuỳ chỉnh dùng chung: DsCot, DsKy, CaiTrang
  data/mock.ts             dữ liệu giả dùng chung; DAILY là doanh thu từng ngày từng chi nhánh 01/07–07/10/2026
  modules/
    types.ts               ModuleDef, ScreenDef, tuExcel()
    auth/                  Đăng nhập, quên mật khẩu, chọn đơn vị kế toán
    onboarding/            Khởi tạo 4 bước
    home/                  Tổng quan (chủ doanh nghiệp), Bàn làm việc (kế toán)
    danh-muc/ tien/ ban-hang/ mua-hang/ kho/ thue/ tscd/ ccdc/ gia-thanh/ tong-hop/ tien-ich/
    he-thong/              Người dùng, phân quyền, gói thuê bao, thông tin đơn vị, cấu hình, nhật ký
tools/
  kiem_tra.py              mở thử mọi màn bằng Chrome, bắt lỗi console, trắng trang, tràn ngang, lệch báo cáo
  kiem_van.py, mau.py      soát chữ tiếng Việt trên giao diện và tài liệu
  xuat_tinh_nang.py        sinh src/app/features.json từ Excel, chỉ chạy được trên máy Trum
  xuat_logo.py             sinh logo và favicon, chỉ chạy được trên máy Trum
```

Mỗi phân hệ: `index.ts` khai báo màn, nhãn tab ngắn (`NGAN`) và cấu hình từng màn; `quy-trinh.ts` khai sơ đồ Quy trình; màn làm riêng nằm trong file `.tsx` cùng thư mục; dữ liệu giả riêng nằm ở `data.ts`.

Cả app có 14 phân hệ. Phân hệ Báo cáo (`src/modules/bao-cao/`) không có màn riêng của Excel: nó chứa Trung tâm báo cáo và bản sao mọi màn báo cáo của phân hệ khác (`goc` là phân hệ gốc). Có 120 tính năng Excel cộng 10 sổ bổ sung (`BO_SUNG`).

## Màn làm riêng

Phần lớn màn dựng từ 6 màn chung. Các màn sau viết riêng:

- Bán hàng: chứng từ gom từ FABi (danh sách, chi tiết, hạch toán), báo cáo bán hàng, báo cáo doanh thu.
- Tiền: sổ quỹ, nhật ký chung.
- Kho: xuất nhập tồn, tồn kho tức thời, thẻ kho, công thức chế biến.
- Thuế: tờ khai GTGT, Starter mẫu 04/GTGT, Medium và Advance mẫu 01/GTGT.
- Tổng hợp: KQKD, cân đối kế toán, cân đối số phát sinh, lưu chuyển tiền tệ, báo cáo quản trị F&B, kiểm tra cuối kỳ, khoá sổ.
- Tiện ích: đồng bộ, đối soát, hoá đơn đầu vào, duyệt chứng từ, cảnh báo, nhật ký thao tác.
- Hệ thống: người dùng, phân quyền, gói thuê bao, thông tin đơn vị, cấu hình.

## Quy ước

- Mỗi tính năng Excel là một màn, đường dẫn `/app/<phân hệ>/<mã thay dấu chấm bằng gạch ngang>`, vd `/app/ban-hang/3-1-1`.
- `tuExcel(mod, rieng)` sinh màn cho mọi tính năng của phân hệ. Kiểu màn lấy theo cấu hình khai trong `rieng`: có `voucher` ra màn chứng từ, `tool` ra màn chức năng, `catalog`, `report` tương tự. Không khai cấu hình thì theo nhóm Excel: Danh mục ra catalog, Chứng từ ra voucher, Chức năng và Tiện ích ra tool, còn lại ra report. Muốn màn riêng thì khai `kind: 'custom', comp` trong `rieng[mã]`.
- Màn không có trong Excel (Bàn làm việc, Hệ thống) khai `can: [mã]` nếu phụ thuộc gói; không khai thì gói nào cũng mở.
- Thanh tab: màn có nhóm Excel chứa chữ "báo cáo" vào tab Báo cáo, còn lại thành tab riêng. Muốn ép một báo cáo thành tab thì khai `tab: true` (đang dùng cho Tờ khai thuế 6.2.3). Nhãn tab lấy `NGAN[mã]`, không có thì lấy tên Excel. Tab Báo cáo và màn báo cáo của phân hệ tự chuyển sang phân hệ Báo cáo (`ScreenRoute` trong `Screen.tsx`).
- Sơ đồ Quy trình (`quy-trinh.ts`): mỗi bước có một ô chính trên trục ngang, ô phụ treo `tren` hoặc `duoi`. Nghiệp vụ song song cùng đổ về một kết quả thì khai `hoiTu: { lan, ra }` và để `buoc: []`: mỗi làn một nhóm ô xếp ngang, mũi tên gom về khối `ra` bên phải. Sơ đồ này không có khung Báo cáo riêng, đang dùng ở phân hệ Tiền. Trường `di` là đường dẫn sau `/app/`, luôn ghi đủ phân hệ, vd `'kho/5-1-2-3/moi'`. Có `/moi` thì mở form chứng từ mới; thêm `?loai=k` để chọn loại phiếu. Khoá theo gói tự tính từ màn đích, không khai tay.
- Một màn nhiều loại phiếu: khai `loai: [{ k, ten, prefix, ... }]` trong `voucher`. Danh sách gộp các loại, có cột Loại; nút thêm có menu chọn loại; form mới có ô "Loại phiếu". Đang dùng ở 2.1.1, 7.1.2, 8.1.2. Loại phiếu 2.1.1: thu, chi, cq (chuyển quỹ), bc (thu qua ngân hàng), unc (chi qua ngân hàng).
- Chi nhánh: danh sách chứng từ lọc theo `chiNhanhHienTai(s)`; form chứng từ mới lấy chi nhánh từ đó, không cho sửa. Màn mới có chi nhánh thì đọc chi nhánh trên thanh trên, không tự làm ô chọn chi nhánh riêng.
- Gói và chế độ kế toán là hai thứ khác nhau (QD31). Điều kiện mở tính năng đọc gói (`coTrongGoi`, `moDuoc`, `hienMan`). Mẫu, tên, ký hiệu, số hiệu tài khoản, cách hạch toán đọc chế độ: `s.cheDo`, `cheDoHienTai(s)`. Đừng viết `s.goi === 'PL'` để chọn mẫu.
- Kiểu ghi sổ theo chế độ: TT152 không hạch toán (dòng phiếu tiền không có Khoản mục, Công việc); TT58 ghi sổ, không dùng tài khoản; TT133 và TT99 có Nợ/Có. Form chứng từ và báo cáo đọc `kieuGhiSo(s.cheDo)`.
- Số hiệu tài khoản: sổ cái lưu theo TT133. Chỗ hiển thị gọi `tkTheoCheDo()` trong `so-cai.ts` để TT99 hiện 641, 642, 8211.
- Mẫu báo cáo đổi theo chế độ: TT152 bản đơn giản, TT58 dạng tinh gọn, TT133 mã B0x-DNN, TT99 mã B0x-DN (tách chi phí bán hàng, quản lý). Ký hiệu, tên in, khổ, loại (sổ, báo cáo tài chính, báo cáo, tờ khai), bộ lọc, cột gom nhóm của từng báo cáo khai ở `src/modules/bao-cao/danh-sach.ts`. `ReportPaper` tự tra theo mã trên đường dẫn, không truyền ký hiệu từ màn.
- Báo cáo mới: đưa bảng qua `<RptTable cols rows>` bên trong `<ReportPaper>`. Như vậy tự có chia trang, in, xuất 5 định dạng, bộ lọc, tuỳ chỉnh cột, gom nhóm. Bảng tự vẽ bằng thẻ table thì không có những thứ đó.
- Mẫu in chứng từ: thêm mẫu ở `src/app/mau-in.ts`, ghép với mã chứng từ trong `mauCuaChungTu()`. Khoá trường, cột trong mẫu phải có trong `duLieuIn()`.
- Số liệu phải khớp giữa các màn. Doanh thu, giá vốn, thuế đầu ra đọc `DAILY`; KQKD đọc `kqkd()`; cân đối số phát sinh, cân đối kế toán, lưu chuyển tiền tệ, tiền trên Tổng quan đọc `modules/tong-hop/so-cai.ts`. Không gõ số cứng vào các màn này.
- Chữ trên giao diện: viết hoa chữ đầu, bỏ dấu kiểu mới (hoá, khoá, xoá, huỷ), tiền `1.234.567 đ`, ngày `dd/MM/yyyy`. Soát bằng `python tools/kiem_van.py <file> --loai giao-dien` trước khi push.
- Lớp CSS trạng thái là `.stt`, không dùng `.st` vì trùng lớp màu gói Starter.
- Menu thả xuống: dùng `Dropdown` + `MenuHead`, `MenuItem`, `MenuSep` trong `ui/Dropdown.tsx`. `MenuItem` có `to` thì là liên kết, có `onClick` thì là nút; `icon` nhận tên biểu tượng hoặc phần tử tự vẽ; `on` hiện dấu chọn; `lock` làm mờ. Không tự viết menu bằng `onMouseLeave`.
- Ô chọn: dùng `Select` thay `<select>`, viết `<option>` bên trong như cũ. `onChange` nhận `{ target: { value } }` nên `e => setX(e.target.value)` giữ nguyên. Thêm `className="inp"` cho ô trong form, để trống cho ô lọc trong `.fld`.
