# Gói Plus hiện màn nghiệp vụ, báo cáo theo roadmap (T721)

- Ngày: 04/11/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- So tab Tính năng của roadmap (lọc "Mới ở Plus", PhuongXT gửi ảnh) với các màn gói Plus đang mở.
- `src/app/plan.ts`, `THEO_ROADMAP`: mở cho gói Plus Hoá đơn bán hàng 3.1.2, Xuất hoá đơn điện tử 3.1.5, Hoá đơn điều chỉnh, thay thế 3.1.6, Xuất, nhập điều chuyển kho 5.1.4 (kèm Nhập điều chuyển, Chuyển kho), Tự động đồng bộ dữ liệu kho 11.3, Nhận hoá đơn đầu vào 11.4. Trước đây chỉ gói Pro có.
- Cùng file, `DA_BO`: bỏ 3.2.1, 3.2.3 ra khỏi danh sách màn bỏ hẳn. PhuongXT mở lại Báo cáo bán hàng, Báo cáo doanh thu (đảo lại T99), có ở gói Plus, Pro theo Excel.
- `src/modules/bao-cao/danh-sach.ts`, `MO_IFASTER`: thêm 3.2.1, 3.2.2, 3.2.3, 5.2.5 để Báo cáo bán hàng, Đối soát bán hàng với POS, Báo cáo doanh thu, Đối chiếu xuất kho với định lượng hiện ở mọi chế độ. Trước đây Đối soát và Đối chiếu có trong gói Plus nhưng bị lọc theo chế độ nên không hiện.
- Báo cáo nhập kho, xuất kho 5.2.2 của roadmap: PhuongXT chốt dùng Tổng hợp xuất kho 5.2.11, Chi tiết xuất kho 5.2.12, hai màn này gói Plus đã có. 5.2.2 vẫn bỏ (T624).
- Gói Standard không đổi.
- PhuongXT dặn ẩn hết màn, ghi chú gói Pro ở gói Plus. `src/app/plan.ts`: `anNgoaiGoi` đúng cho cả gói Plus. Gói Plus ẩn hẳn màn ngoài gói như gói Standard, không còn màn khoá, nhãn Pro, trang mời nâng cấp.
- Các chỗ dùng `anNgoaiGoi` mà thật ra là giao diện riêng gói Standard đổi sang `goi === 'S'`. Gồm quy đổi ĐVT ở `MLapPhieu.tsx`, `MLapPhieuKho.tsx`, hàng tab ở `MChungTu.tsx`, tab Báo cáo theo dõi ở `MCcdc.tsx`.
- `src/modules/home/BanLamViec.tsx`, `TongQuan.tsx`: gói Plus bỏ việc, thẻ Cảnh báo rủi ro của gói Pro. `src/modules/tong-hop/CuoiKy.tsx`: Khoá sổ bỏ bước Kiểm tra cuối kỳ, Kết chuyển lãi lỗ ghi "Có từ gói Pro".
- `src/app/Screen.tsx`: mở bằng đường dẫn phân hệ không màn nào trong gói (Giá thành ở gói Plus) thì về Trang chủ, không hiện sơ đồ xem trước gói Pro.
- PhuongXT dặn gọn tiếp gói Plus. `src/modules/kho/index.ts`, `CHI_GOI_PRO`: Kho bỏ Xuất bán POS, Xuất bán hàng (đã có ở Bán hàng), Chuyển kho (mỗi cửa hàng một kho), Công thức chế biến (đã ở Danh mục), Tính giá thành đơn giản. Các màn này chỉ còn gói Pro.
- `src/app/registry.ts`, `AN_PHAN_HE`: gói Plus ẩn phân hệ Tài sản cố định, Tiện ích. Sổ TSCĐ S4b-DNSN vẫn ở phân hệ Báo cáo. `Screen.tsx`: mở hai phân hệ này bằng đường dẫn thì về Trang chủ.
- Khoá sổ: Tổng hợp bỏ Khoá sổ 10.1.6 (`goi: ['PR']`), Hệ thống hiện Khoá sổ như gói Standard (`he-thong/index.ts`). Link Mở khoá sổ ở `ChungTuBanHang.tsx`, `DongBoThuChiFabi.tsx`, bước Khoá sổ ở Bàn làm việc trỏ về Hệ thống.
- `BanLamViec.tsx`: gói Plus bỏ việc Hoá đơn đầu vào (thuộc Tiện ích). Việc lệch đối soát, bước Đối soát doanh thu trỏ về Đối soát bán hàng với POS 3.2.2.
- Thanh tab Kho gói Plus xếp lại: Tồn kho ban đầu, Nhập khác, Điều chuyển, Xuất huỷ, Xuất khác, Kiểm kê, Tính giá vốn. Thêm `xepTab` ở `ModuleDef` (thứ tự tab theo gói), `tabCua(m, goi)` xếp theo đó.
- Tab Điều chuyển gói Plus: Xuất điều chuyển đổi nhãn bằng `nganGoi`, Nhập điều chuyển không có tab riêng nhờ `tabChaGoi`. `PhieuDieuChuyen.tsx` thêm tab con Xuất, Nhập điều chuyển trước chip trạng thái (`tabCon` ở `KieuDs`, `PhieuSanXuat.tsx`).

## Đã kiểm

- `npm run typecheck`: không lỗi.
- `npm run build`: chạy xong, không lỗi.
- `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- Bản chạy trên máy, gói Plus: mở được 3.1.2, 3.1.5, 3.1.6, 5.1.4, 11.3, 11.4, 3.2.1, 3.2.2, 3.2.3, 5.2.5, không hiện mời nâng cấp; Báo cáo bán hàng có số liệu. `hienMan` gói Plus đúng cả TT58 lẫn TT152, gói Standard vẫn ẩn.

## Dở dang, việc tiếp theo

- Không.
- Roadmap ghi 3.1.2 là "Bán hàng"; đang mở theo mã là Hoá đơn bán hàng 3.1.2. Bán hàng lập tay 3.1.7 vẫn chỉ gói Pro. Cần thì PhuongXT chốt lại.
- Tự động xuất kho định lượng 11.2 roadmap xếp Plus, chưa mở lại (vẫn bỏ theo T100).
- Điện thoại gói Plus đã theo thứ tự tab mới, Nhập điều chuyển vẫn là một mục riêng, chưa gộp như web.
- Gói Plus còn mở 8 màn roadmap không ghi "Mới ở Plus": 5.1.8, 10.1.1, 2.2.8, 2.2.9, 4.2.6, 10.4.3, 11.13, X3. Giữ nguyên vì chưa biết roadmap xếp gói Standard hay Pro.

## Bẫy, quyết định mới

- `anNgoaiGoi` giờ đúng cho gói Standard và Plus. Giao diện chỉ riêng gói Standard thì xét `goi === 'S'`, đừng dùng `anNgoaiGoi`.
