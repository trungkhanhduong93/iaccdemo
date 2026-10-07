# IACC Cloud Web: kế hoạch và bàn giao

Bản mẫu giao diện phần mềm kế toán web IACC Cloud. Dữ liệu giả, chưa nối backend.
Agent nào làm tiếp (Claude, Gemini) đọc hết file này trước khi sửa code.

Cập nhật lần cuối: 07/10/2026 tối, Claude. Bố cục kiểu AMIS (mục 1.8), menu thả xuống làm lại (mục 1.9), đã đưa lên GitHub và Cloudflare (mục 2). Mục 5 ghi phần đã xong và phần còn thiếu.

## 1. Đã chốt với Trum ngày 07/10/2026

1. Concept lai B + C. Ô tìm nhanh Ctrl+K. Trang chủ đổi theo vai trò: Chủ doanh nghiệp vào Tổng quan, kế toán vào Bàn làm việc. Bố cục thanh biểu tượng + menu dọc ban đầu đã thay bằng bố cục AMIS ở điểm 8.
2. Stack React 19 + Vite 8 + TypeScript 7, react-router-dom 7 (HashRouter). CSS tự viết, không thư viện UI, biểu đồ vẽ bằng SVG.
3. Thư mục `D:\IACC-CLOUD\Web\`. Không sửa gì trong `D:\IACC-CLOUD\Present\`.
4. Dữ liệu giả: Công ty TNHH Ẩm thực Phố Mây, 3 chi nhánh, kỳ đang mở 10/2026, kỳ đang khoá sổ 9/2026, mặc định gói Medium (TT133).
5. Mục ngoài gói vẫn hiện trên menu, kèm khoá và nhãn gói thấp nhất có nó. Bấm vào ra trang Nâng cấp gói.
6. Chỉ làm giao diện web. Không làm bản điện thoại, không làm app.
7. Ban đầu chỉ chạy local. Tối 07/10/2026 Trum yêu cầu đưa lên GitHub và Cloudflare Pages tại iaccdemo.pages.dev (xem mục 2).
8. Bố cục theo AMIS (Trum duyệt chiều 07/10/2026, tham khảo actapp.misa.vn, chỉ xem, không sửa dữ liệu AMIS):
   - Sidebar tối chỉ chứa phân hệ lớn: 11 phân hệ Excel, Trang chủ, Hệ thống. Không tách Tiền mặt, Tiền gửi như AMIS. Nút "Thêm nhanh" đầu sidebar, nút thu gọn cuối sidebar.
   - Màn trong phân hệ trải thành tab ngang. Tab không đủ chỗ dồn vào "Khác". Tab đang mở luôn hiện.
   - Phân hệ có sơ đồ thì tab đầu là Quy trình: sơ đồ nghiệp vụ, khung Báo cáo bên phải (5 báo cáo và "Tất cả báo cáo"), hàng dưới gồm danh mục liên quan, Tiện ích, Tuỳ chọn. Giá thành vẽ theo bước đánh số. Thuế cũng có Quy trình dù AMIS không có.
   - Bấm ô trên sơ đồ mở thẳng form chứng từ mới đúng loại. Một dòng Excel nhiều loại phiếu thì tách nhiều ô, vd 2.1.1 tách Phiếu thu, Phiếu chi, Nộp tiền vào ngân hàng, Thu qua ngân hàng, Chi qua ngân hàng.
   - Báo cáo không thành tab riêng từng cái. Tab "Báo cáo" cuối thanh liệt kê đủ báo cáo của phân hệ.
   - Form chứng từ mở toàn màn hình, che sidebar và thanh tab. Chân form: Huỷ, Lưu, Lưu và thêm. Đóng (Huỷ, X, Esc) thì về đúng màn trước.
   - Mục ngoài gói trên sidebar, tab, sơ đồ, khung Báo cáo vẫn hiện, làm mờ, có khoá và nhãn gói. Bấm vào ra trang Nâng cấp.
   - Chưa làm: ghim tính năng ("HAY DÙNG" của AMIS), tab Biểu đồ từng phân hệ, mục Báo cáo chung trên sidebar.
9. Menu thả xuống (Trum yêu cầu tối 07/10/2026): mọi menu và ô chọn dùng chung `ui/Dropdown.tsx`, bấm để mở, bấm ra ngoài hoặc Esc để đóng. Không còn thẻ `<select>` gốc của trình duyệt. Biểu tượng Hệ thống đổi sang bánh răng.
   - Lỗi Trum báo: mở "Xem thử" rồi không bấm được gói. Nguyên nhân là menu cũ đóng khi chuột rời nút, mà giữa nút và menu có khe 6px. Menu mới không đóng theo chuột rời nữa.

## 2. Chạy

```bash
cd D:\IACC-CLOUD\Web
npm install
npm run dev          # http://localhost:5180
npm run typecheck    # tsc --noEmit
npm run build        # ra dist/, mở được ở thư mục bất kỳ vì base './' và HashRouter
python tools/kiem_tra.py           # cần npm run dev đang chạy và Chrome đã cài
python tools/kiem_tra.py --nhanh   # chỉ gói Medium, không chụp ảnh
```

Đăng nhập bản mẫu: email bất kỳ, mật khẩu từ 6 ký tự. Nút "Xem thử" trên thanh trên đổi gói và vai trò.

Bản online: https://iaccdemo.pages.dev. Project Cloudflare Pages `iaccdemo`, kiểu tải thẳng bằng wrangler, không nối Git. Mã nguồn ở GitHub `trungkhanhduong93/iaccdemo` (riêng tư), nhánh `main`. Trang gắn `X-Robots-Tag: noindex` qua `public/_headers`, ai có link vẫn xem được.

Đưa bản mới lên:

```bash
cd D:\IACC-CLOUD\Web
npm run build
git add -A && git commit -m "..." && git push
npx --yes wrangler@4 pages deploy dist --project-name iaccdemo --branch main --commit-dirty=true
```

Không truyền `--force` khi deploy (chỉ dùng lúc tạo project). Wrangler hết phiên thì đăng nhập lại bằng `npx wrangler@4 login --device --scopes account:read user:read pages:write`.

Bố cục cũ (thanh biểu tượng + menu dọc) còn nguyên ở `backup/src-truoc-amis-0710/`, script kiểm cũ ở `backup/kiem_tra-truoc-amis.py`. Muốn quay lại thì chép đè `src/` bằng bản này. Thư mục backup chỉ có trên máy Trum: không vào build, không vào typecheck, không đẩy lên GitHub (`.gitignore`). Lịch sử Git bắt đầu từ bố cục AMIS.

Logo lấy từ `D:\icon present\logo (2).png`. Đổi logo thì chạy lại `python tools/xuat_logo.py`: script tô trắng vòng giữa (ảnh gốc để trong suốt, đặt trên nền navy sẽ thành vòng tối), ra `src/assets/iacc-logo.webp` và `public/favicon.png`. Component `ui/Logo.tsx` dùng ở thanh phân hệ, đăng nhập, chọn đơn vị, khởi tạo.

Excel tính năng đổi thì chạy lại `python tools/xuat_tinh_nang.py`. Script đọc qua `Present/tools/build_present.py` để dùng chung các chỉnh gói (GOI_FIX, EXTRA, KHO_IVT, KHONG_IVT). Ra đúng 120 tính năng: Free 16, Starter 56, Medium 96, Advance 120.

## 3. Cấu trúc

```
src/
  main.tsx, App.tsx        router: /dang-nhap, /quen-mat-khau, /chon-don-vi, /khoi-tao, /app/:mod/:slug(/:id)
  styles/app.css           toàn bộ CSS, biến màu ở :root (navy, cam iPOS, màu 4 gói)
  app/
    features.json          SINH TỪ EXCEL, không sửa tay
    plan.ts                gói, chế độ kế toán, coTrongGoi(), kieuGhiSo()
    session.tsx            phiên: người dùng, vai trò, đơn vị, gói (localStorage)
    registry.ts            thứ tự 13 phân hệ trên sidebar; tự thêm màn Quy trình, Báo cáo; moDuoc(), tenMan(), tabCua(), dich()
    Shell.tsx              sidebar phân hệ lớn, nút Thêm nhanh, thu gọn sidebar, Ctrl+K
    ModuleTabs.tsx         thanh tab ngang, đo bề rộng để dồn tab thừa vào "Khác"
    Topbar.tsx             đơn vị kế toán, kỳ, trạng thái đồng bộ, nút Xem thử gói và vai trò
    CommandPalette.tsx     tìm nhanh không dấu
    Screen.tsx             mở màn theo đường dẫn, trang Nâng cấp khi màn ngoài gói
  ui/                      Icon, format, Table, Page (tiêu đề, thẻ, nhãn gói), Charts, FormToanMan (khung form toàn màn hình),
                           Dropdown (menu thả xuống, MenuItem, ô chọn Select thay thẻ select)
    generic/               6 màn chung: CatalogScreen, VoucherScreen (danh sách + form toàn màn hình + hạch toán), ReportScreen, ToolScreen,
                           QuyTrinhScreen (sơ đồ, khung Báo cáo, hàng dưới), BaoCaoScreen (tab Báo cáo)
  data/mock.ts             dữ liệu giả dùng chung; DAILY là doanh thu từng ngày từng chi nhánh 01/07–07/10/2026
  modules/
    types.ts               ModuleDef, ScreenDef, tuExcel()
    auth/                  Đăng nhập, quên mật khẩu, chọn đơn vị kế toán
    onboarding/            Khởi tạo 4 bước
    home/                  Tổng quan (chủ doanh nghiệp), Bàn làm việc (kế toán)
    danh-muc/ tien/ ban-hang/ mua-hang/ kho/ thue/ tscd/ ccdc/ gia-thanh/ tong-hop/ tien-ich/
    he-thong/              Người dùng, phân quyền, gói thuê bao, thông tin đơn vị, cấu hình, nhật ký
```

Mỗi phân hệ: `index.ts` khai báo màn, nhãn tab ngắn (`NGAN`) và cấu hình từng màn; `quy-trinh.ts` khai sơ đồ Quy trình; màn làm riêng nằm trong file `.tsx` cùng thư mục; dữ liệu giả riêng nằm ở `data.ts`.

## 4. Quy ước

- Mỗi tính năng Excel là một màn, đường dẫn `/app/<phân hệ>/<mã thay dấu chấm bằng gạch ngang>`, vd `/app/ban-hang/3-1-1`.
- `tuExcel(mod, rieng)` sinh màn cho mọi tính năng của phân hệ. Kiểu màn mặc định theo nhóm Excel: Danh mục ra catalog, Chứng từ ra voucher, Chức năng và Tiện ích ra tool, còn lại ra report. Muốn màn riêng thì khai `kind: 'custom', comp` trong `rieng[mã]`.
- Kiểu màn lấy theo cấu hình khai trong `rieng`: có `voucher` ra màn chứng từ, `tool` ra màn chức năng, `catalog`, `report` tương tự. Không khai cấu hình thì theo nhóm Excel như trên. Trước 07/10 chiều kiểu màn chỉ theo nhóm Excel nên 2.1.3, 5.1.7, 5.1.8, 7.1.3, 8.1.2, 8.1.3, 10.1.1 dựng sai kiểu, đã sửa.
- Màn không có trong Excel (Bàn làm việc, Hệ thống) khai `can: [mã]` nếu phụ thuộc gói; không khai thì gói nào cũng mở.
- Thanh tab: màn có nhóm Excel chứa chữ "báo cáo" vào tab Báo cáo, còn lại thành tab riêng. Muốn ép một báo cáo thành tab thì khai `tab: true` (đang dùng cho Tờ khai thuế 6.2.3). Nhãn tab lấy `NGAN[mã]`, không có thì lấy tên Excel.
- Sơ đồ Quy trình (`quy-trinh.ts`): mỗi bước có một ô chính trên trục ngang, ô phụ treo `tren` hoặc `duoi`. Trường `di` là đường dẫn sau `/app/`, luôn ghi đủ phân hệ, vd `'kho/5-1-2-3/moi'`. Có `/moi` thì mở form chứng từ mới; thêm `?loai=k` để chọn loại phiếu. Khoá theo gói tự tính từ màn đích, không khai tay.
- Một màn nhiều loại phiếu: khai `loai: [{ k, ten, prefix, ... }]` trong `voucher`. Danh sách gộp các loại, có cột Loại; nút thêm có menu chọn loại; form mới có ô "Loại phiếu". Đang dùng ở 2.1.1, 7.1.2, 8.1.2.
- Kiểu ghi sổ theo gói: Free không hạch toán; Starter (TT58) ghi sổ, không dùng tài khoản; Medium (TT133) và Advance (TT99) có Nợ/Có. Form chứng từ và báo cáo đọc `kieuGhiSo(goi)`.
- Mẫu báo cáo đổi theo gói: Free bản đơn giản, Starter dạng tinh gọn, Medium mã B0x-DNN, Advance mã B0x-DN (tách chi phí bán hàng, quản lý; tài sản ngắn hạn, dài hạn). Ký hiệu mẫu sổ S0x-DNN chỉ hiện ở gói Medium.
- Số liệu phải khớp giữa các màn. Doanh thu, giá vốn, thuế đầu ra đọc `DAILY`; KQKD đọc `kqkd()`; cân đối số phát sinh, cân đối kế toán, lưu chuyển tiền tệ, tiền trên Tổng quan đọc `modules/tong-hop/so-cai.ts`. Không gõ số cứng vào các màn này.
- Chữ trên giao diện: viết hoa chữ đầu, bỏ dấu kiểu mới (hoá, khoá, xoá, huỷ), tiền `1.234.567 đ`, ngày `dd/MM/yyyy`. Soát bằng skill `viet-nhu-nguoi` (`--loai giao-dien`) trước khi giao.
- Lớp CSS trạng thái là `.stt`, không dùng `.st` vì trùng lớp màu gói Starter.
- Menu thả xuống: dùng `Dropdown` + `MenuHead`, `MenuItem`, `MenuSep` trong `ui/Dropdown.tsx`. `MenuItem` có `to` thì là liên kết, có `onClick` thì là nút; `icon` nhận tên biểu tượng hoặc phần tử tự vẽ; `on` hiện dấu chọn; `lock` làm mờ. Không tự viết menu bằng `onMouseLeave`.
- Ô chọn: dùng `Select` thay `<select>`, viết `<option>` bên trong như cũ. `onChange` nhận `{ target: { value } }` nên `e => setX(e.target.value)` giữ nguyên. Thêm `className="inp"` cho ô trong form, để trống cho ô lọc trong `.fld`.

## 5. Trạng thái

Đã xong, kiểm ngày 07/10/2026:
- [x] Khung kiểu AMIS (07/10 chiều): sidebar phân hệ lớn, Thêm nhanh, thu gọn sidebar, thanh tab ngang có "Khác", Ctrl+K, đổi đơn vị kế toán, nút Xem thử gói và vai trò, trang Nâng cấp
- [x] Màn Quy trình cho 11 phân hệ Excel, 39 ô bấm được tới form hoặc màn đích; tab Báo cáo cho 9 phân hệ có báo cáo
- [x] Form chứng từ toàn màn hình cho mọi màn chứng từ và chứng từ bán hàng FABi; Huỷ, Lưu, Lưu và thêm; Esc về đúng màn trước
- [x] Menu thả xuống làm lại (07/10 tối): đơn vị kế toán, Xem thử gói và vai trò, tài khoản, Thêm nhanh chia theo phân hệ, Khác của thanh tab, Tiện ích ở Quy trình, chọn loại phiếu. 22 thẻ select đổi sang ô chọn `Select`. Đã thử: chuột, phím mũi tên, Enter, Esc, Tab, lật lên khi sát đáy ở màn 1280x720, bấm gói trong Xem thử đổi được gói
- [x] Biểu tượng Hệ thống đổi sang bánh răng (dùng chung cho Tuỳ chọn, Cấu hình kế toán)
- [x] Đưa lên GitHub `trungkhanhduong93/iaccdemo` (riêng tư) và Cloudflare Pages https://iaccdemo.pages.dev (07/10 tối). Đã mở bản online bằng Chrome: đăng nhập, chọn đơn vị, đổi gói trong Xem thử, mở form Phiếu thu từ Quy trình, Esc về Quy trình, không lỗi console. Trang trả `x-robots-tag: noindex`
- [x] Đăng nhập, quên mật khẩu, chọn đơn vị kế toán, khởi tạo 4 bước
- [x] Tổng quan, Bàn làm việc
- [x] 13 phân hệ, 148 màn: 120 tính năng Excel, 11 màn Quy trình, 9 tab Báo cáo, 2 màn trang chủ, 6 màn hệ thống
- [x] Màn làm riêng, theo phân hệ:
  - Bán hàng: chứng từ gom từ FABi (danh sách, chi tiết, hạch toán), báo cáo bán hàng, báo cáo doanh thu.
  - Tiền: sổ quỹ, nhật ký chung. Kho: xuất nhập tồn, tồn kho tức thời, thẻ kho, công thức chế biến.
  - Thuế: tờ khai GTGT, Starter mẫu 04/GTGT, Medium và Advance mẫu 01/GTGT.
  - Tổng hợp: KQKD, cân đối kế toán, cân đối số phát sinh, lưu chuyển tiền tệ, báo cáo quản trị F&B, kiểm tra cuối kỳ, khoá sổ.
  - Tiện ích: đồng bộ, đối soát, hoá đơn đầu vào, duyệt chứng từ, cảnh báo, nhật ký thao tác.
  - Hệ thống: người dùng, phân quyền, gói thuê bao, thông tin đơn vị, cấu hình.
- [x] `npm run typecheck` sạch, `npm run build` xanh (Vite cảnh báo gói JS hơn 500 kB, chưa tách gói)
- [x] `tools/kiem_tra.py` (bản cho bố cục AMIS): 792 lượt mở màn ở 4 gói (148 màn mỗi gói qua sidebar, thanh tab, tab Báo cáo; 39 ô Quy trình), không lỗi console, không trắng trang, không tràn ngang kể cả thanh tab; ô trên sơ đồ mở đúng form toàn màn hình; Esc đóng form về đúng Quy trình; cân đối kế toán, cân đối số phát sinh, lưu chuyển tiền tệ cân ở kỳ 8, 9, 10 với gói Starter, Medium, Advance; 23 ảnh chụp ở `tools/shots/`
- [x] Soát chữ giao diện: 0 ĐỎ, 0 VÀNG
- [x] Logo thật của IACC Cloud (07/10/2026) thay dấu vẽ bằng CSS, kể cả favicon. Nút "Đăng nhập bằng tài khoản iPOS" dùng biểu tượng chìa khoá vì chưa có file logo iPOS.

Còn thiếu, biết rõ:
- [ ] Sổ quỹ tiền mặt tính riêng từ tiền mặt FABi từng chi nhánh, chưa nối `so-cai.ts`. Tổng 3 quỹ chưa bằng dư TK 1111 trên cân đối kế toán.
- [ ] Sổ tài khoản (2.2.2), sổ ngân hàng (2.2.3), sổ công nợ (2.2.5), báo cáo TSCĐ, CCDC dùng màn sổ chung, số sinh ngẫu nhiên theo hạt giống, chưa khớp báo cáo tài chính.
- [ ] Bảng kê mua vào 6.2.1, báo cáo mua hàng 4.2.1, bảng kê điều chuyển 3.2.4 dùng bảng kê hoá đơn chung.
- [ ] Ký hiệu mẫu (S03a-DNN, S03b-DNN, S07-DNN, S08-DNN, B01-DNN, B02-DNN, B03-DNN, F01-DNN, 01/GTGT, 04/GTGT) ghi theo hiểu biết, chưa đối chiếu văn bản gốc. Mẫu dạng tinh gọn TT58 chưa có. Kế toán trưởng phải duyệt trước khi coi là đúng.
- [ ] Thuế TNDN tạm tính 20% mỗi tháng cho đơn giản.
- [ ] Nút chỉ hiện thông báo, không lưu dữ liệu. Form chưa kiểm tra hợp lệ, trừ màn đăng nhập.
- [ ] Xuất hoá đơn điện tử 3.1.5 chưa có trạng thái phát hành, ký số, gửi cơ quan thuế.
- [ ] Giao diện thiết kế cho màn rộng từ 1280px (khung có min-width 1180px). Ở 1280px ô tìm kiếm trên thanh trên co còn khoảng 160px.
- [ ] Ô trên sơ đồ chưa có số đếm (vd "3 phiếu chưa ghi sổ"). Đường nối ô phụ là nét đứt, chưa có mũi tên chiều nghiệp vụ.

## 6. Việc tiếp theo, theo thứ tự

1. Trum xem bố cục AMIS, chốt nghiệp vụ trên từng sơ đồ Quy trình (ô nào, nối thế nào), câu chữ. Sửa theo góp ý ở `src/modules/<phân hệ>/quy-trinh.ts`.
2. Nối sổ quỹ, sổ tài khoản, sổ ngân hàng, sổ công nợ vào `so-cai.ts` để mọi sổ khớp báo cáo tài chính.
3. Kế toán trưởng duyệt mẫu sổ, báo cáo tài chính, tờ khai theo TT58, TT133, TT99. Sửa ký hiệu mẫu theo kết quả duyệt.
4. Làm màn hoá đơn điện tử 3.1.5 riêng: danh sách theo trạng thái, ký số, gửi, huỷ, thay thế.
5. Thống nhất API với Dev (BR-18 trong spec DEV), thay `data/mock.ts` bằng lớp gọi API, giữ nguyên màn.
6. Sửa xong bản nào thì build, commit, push, deploy lại theo mục 2. Không đụng các project Cloudflare khác (`iacccloud-present`, `iacc-present`, `iposivt-present`).

## 7. Bẫy đã biết

- TypeScript cài ra bản 7.0.2. Nếu `tsc` báo lỗi lạ về tuỳ chọn trong tsconfig, xem lại tuỳ chọn đó trước khi sửa code.
- Dùng HashRouter. Đổi sang BrowserRouter thì phải cấu hình chuyển hướng ở máy chủ, và mở `dist/index.html` trực tiếp sẽ trắng trang.
- `features.json` sinh từ Excel. Sửa tay sẽ mất khi chạy lại script.
- Dòng tổng của bảng (`sum` trong `Table`) chỉ vẽ cột có khoá trong dòng tổng. Cột có hàm `r` mà dòng tổng không có khoá thì để trống, nếu không hàm `r` nhận dữ liệu thiếu và làm sập cả app.
- Playwright: máy chưa tải trình duyệt của Playwright, script kiểm dùng `channel='chrome'`. Ghi phiên vào localStorage rồi phải tải lại hẳn trang (đổi query), chỉ đổi hash thì app giữ phiên cũ.
- Thanh tab đo bề rộng từng tab trên một hàng ẩn (`.mtabs-meas`). Sửa nội dung tab (thêm biểu tượng, nhãn) thì sửa cả hàng ẩn cho giống, nếu không tab sẽ tràn hoặc dồn sai. Script kiểm báo "tràn ngang ở .mtabs-in" khi lệch.
- Menu thả xuống (`.dd-pop`) luôn có trong DOM, ẩn bằng thuộc tính `hidden`, để script kiểm đọc được tab trong "Khác". Đừng đổi sang render có điều kiện.
- Form toàn màn hình là `position: fixed` nằm trong `.main`. Không thêm `transform` hay `filter` cho `.main` hoặc tổ tiên của nó, nếu không form sẽ bị nhốt trong vùng nội dung.
- Khung menu (`.pop`) gắn vào body và đặt vị trí thẳng vào style trước khi vẽ. Đừng đổi sang state React kèm `visibility: hidden`: khung ẩn thì không nhận con trỏ, phím mũi tên trong ô chọn sẽ hỏng (đã gặp 07/10).
- Esc khi đang mở menu chỉ đóng menu: menu bắt phím ở pha capture và chặn lan. Thêm phím tắt Esc mới thì nghe ở `window` như `FormToanMan`, đừng nghe ở pha capture.
- Menu "Khác" của thanh tab mở với `keep`: đóng vẫn nằm trong DOM (ẩn) để script kiểm đọc được tab. Script kiểm đọc `.mtabs-in a, .pop-khac a`.
