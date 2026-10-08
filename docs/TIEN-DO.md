# Tiến độ iaccdemo

Bảng việc của nhóm. Trum giao việc bằng cách điền cột "Người làm". Người làm tự đổi cột "Trạng thái".

- Trạng thái dùng một trong năm chữ: `Chờ`, `Đang làm`, `Dở dang`, `Kẹt`, `Xong`. `Kẹt` thì ghi lý do ở cột Ghi chú.
- Thứ tự dòng là thứ tự ưu tiên. Trum đổi thứ tự khi cần.
- Mã việc không đổi, không dùng lại. Việc mới lấy mã kế tiếp, mã lớn nhất hiện là T43.
- Mỗi dòng một việc. Sửa đúng dòng của mình để khỏi xung đột git với người khác.

## Đang làm và chờ làm

| Mã | Việc | Người làm | Trạng thái | Ghi chú |
|---|---|---|---|---|
| T43 | Đợt chỉnh 13 điểm: thanh công cụ một hàng, nút Excel và Hàng loạt dạng biểu tượng, chip đếm mới, dòng tổng, bỏ cột và dòng tiêu đề, màu sidebar và cam logo, bỏ giới hạn rộng, gói Free/Standard/Plus/Pro (mã F/S/PL/PR), dữ liệu mua hàng, dòng tổng bảng chi tiết (QD27) | Trum | Đang làm | Sửa nhiều file dùng chung: `plan.ts`, `session.tsx`, `app.css`, `VoucherScreen.tsx`, `ChungTuBanHang.tsx`, `ChungTuForm.tsx`, `LocNangCao.tsx`, `Table.tsx`, `gen.ts`, `types.ts` và mọi file có mã gói |
| T42 | Giao diện gọn cho màn nhỏ (thu nhỏ toàn bộ dưới 1700px), bỏ đường dẫn trên tiêu đề, nút "Thêm mới" và nút xổ gom công cụ, chip trạng thái, dòng tổng dính đáy, phân trang mới, hàng lọc từng cột theo kiểu cột (QD26) | Trum | Đang làm | Sửa file dùng chung: `Page.tsx`, `Dropdown.tsx`, `QuyTrinhScreen.tsx`, `CatalogScreen.tsx`, `main.tsx`, `VoucherScreen.tsx`, `ChungTuBanHang.tsx`, `LocNangCao.tsx`, `LocCot.tsx`, `Table.tsx`, `PhanTrang.tsx`, `CongCuDs.tsx`, `app.css` |
| T27 | Danh sách chứng từ 2.1.1: khung chi tiết bên dưới hiện dòng phiếu khác với form của cùng phiếu (UNC2610-0259: khung ghi "Chi mua rau, củ tại chợ", form ghi "Trả tiền nhà cung cấp thịt bò") | | Chờ | Thấy khi làm T26 |
| T02 | Chốt nghiệp vụ trên từng sơ đồ Quy trình: ô nào, nối thế nào, câu chữ. Sửa ở `src/modules/<phân hệ>/quy-trinh.ts` | Trum | Chờ | |
| T03 | Nối sổ quỹ, sổ tài khoản 2.2.2, sổ ngân hàng 2.2.3, sổ công nợ 2.2.5 vào `so-cai.ts` để mọi sổ khớp báo cáo tài chính | | Chờ | Sổ quỹ đang tính riêng từ tiền mặt FABi từng chi nhánh. Tổng 3 quỹ chưa bằng dư TK 1111 trên cân đối kế toán |
| T25 | Thu chi gói Free theo sheet Roadmap: form phiếu thu, chi, chuyển quỹ; danh sách 2.1.1; sơ đồ Quy trình; sổ quỹ, sổ ngân hàng, sổ công nợ | PhuongXT | Dở dang | Đã xong form, Quy trình, chuyển quỹ, tên loại phiếu (Thu tiền mặt, Chi tiền mặt, Thu ngân hàng, Chi ngân hàng, Chuyển quỹ cuối). Còn sổ quỹ, sổ ngân hàng, sổ công nợ lọc theo chi nhánh trên thanh trên. Trùng mã với T25 của Trum ở bảng Đã xong, nhờ Trum đổi mã |
| T33 | Cập nhật Excel tính năng theo sheet Roadmap rồi chạy lại `tools/xuat_tinh_nang.py`: 1.12 và 2.2.3 có ở gói Free; thêm 1.17, S1a-HKD, S2a-HKD. Xong thì xoá các dòng tương ứng trong `THEO_ROADMAP` ở `src/app/plan.ts` | | Chờ | Chỉ máy Trum chạy được script |
| T04 | Kế toán trưởng duyệt mẫu sổ, báo cáo tài chính, tờ khai theo TT58, TT133, TT99. Sửa ký hiệu mẫu theo kết quả duyệt | | Chờ | Ký hiệu mẫu (S03a-DNN, B01-DNN, 01/GTGT...) ghi theo hiểu biết, chưa đối chiếu văn bản gốc. Mẫu dạng tinh gọn TT58 chưa có |
| T05 | Làm màn hoá đơn điện tử 3.1.5 riêng: danh sách theo trạng thái, ký số, gửi, huỷ, thay thế | | Chờ | Hiện chưa có trạng thái phát hành, ký số, gửi cơ quan thuế. DB iPOS lưu trạng thái ở `SALE.EVAT_STATUS`: chưa ký, đã ký, đã gửi, đã xoá |
| T06 | Thống nhất API với Dev (BR-18 trong spec DEV), thay `data/mock.ts` bằng lớp gọi API, giữ nguyên màn | | Chờ | |
| T07 | Báo cáo TSCĐ, CCDC làm khớp báo cáo tài chính | | Chờ | Đang dùng màn sổ chung, số sinh ngẫu nhiên theo hạt giống |
| T08 | Bảng kê mua vào 6.2.1, báo cáo mua hàng 4.2.1, bảng kê điều chuyển 3.2.4 làm màn riêng | | Chờ | Đang dùng bảng kê hoá đơn chung |
| T09 | Form kiểm tra dữ liệu nhập. Nút Lưu thật sự lưu | | Chờ | Hiện nút chỉ hiện thông báo. Chỉ màn đăng nhập có kiểm tra |
| T10 | Ô trên sơ đồ Quy trình hiện số đếm (vd "3 phiếu chưa ghi sổ"). Đường nối ô phụ có mũi tên chiều nghiệp vụ | | Chờ | Hiện đường nối là nét đứt |
| T11 | Thuế TNDN tính đúng theo kỳ | | Chờ | Đang tạm tính 20% mỗi tháng |
| T12 | Giao diện cho màn hẹp hơn 1280px | | Chờ | Khung có min-width 1180px. Ở 1280px ô tìm kiếm trên thanh trên co còn khoảng 160px |
| T13 | Tách gói JS khi build | | Chờ | `npm run build` cảnh báo gói JS hơn 500 kB |
| T14 | Thay biểu tượng chìa khoá ở nút "Đăng nhập bằng tài khoản iPOS" bằng logo iPOS | | Chờ | Chưa có file logo iPOS |
| T19 | Khoá sổ theo từng đơn vị, chi nhánh | | Chờ | DB iPOS lưu ngày khoá ở `DM_ORGANIZATION.DATE_LOCK`, màn Khoá sổ đang khoá chung |
| T20 | Cột trạng thái duyệt trong danh sách chứng từ, tách khỏi ghi sổ | | Chờ | DB iPOS có `REVIEW_STATUS` CHECKED/UNCHECKED riêng với `STATUS` DRAFT/POSTED |

## Đã xong

| Mã | Việc | Người làm | Xong ngày | Nhật ký |
|---|---|---|---|---|
| T41 | Danh sách chứng từ và màn Bán hàng 3.1.1 theo iFaster: chip trạng thái, ô lọc nhãn trên viền, Bộ lọc nâng cao, nút Lọc, Tuỳ chỉnh cột, kẻ dọc và kéo giãn cột, Thao tác hàng loạt (QD25) | Trum | 08/10/2026 | `2026-10-08-trum-danh-sach-ifaster.md` |
| T40 | Biểu tượng riêng cho 17 màn danh mục, hiện ở menu Khác, ô tìm Ctrl K, hàng Danh mục dưới sơ đồ và sơ đồ Khởi tạo danh mục (QD23) | Trum | 08/10/2026 | `2026-10-08-trum-bieu-tuong-danh-muc.md` |
| T39 | Danh sách chứng từ mọi phân hệ: bỏ chia đôi 50/50, kỳ lên đầu trang, nút Excel và Tuỳ chỉnh giao diện, bỏ thanh lọc dưới; STT và lọc từng cột có phễu theo kiểu dữ liệu. Gói đang dùng dưới logo, bỏ dòng mã, giai đoạn, nhãn gói dưới tiêu đề mọi màn (QD24) | PhuongXT | 08/10/2026 | `2026-10-08-phuongxt-danh-sach-chung-tu.md` |
| T38 | Sơ đồ Quy trình hội tụ (phân hệ Tiền) làm lại giao diện: làn gọn có màu, nút nghiệp vụ nằm ngang, đường nối vẽ bằng một lớp SVG, khối Sổ sách nổi bật | Trum | 08/10/2026 | `2026-10-08-trum-so-do-hoi-tu.md` |
| T37 | Biểu tượng theo iFaster: phân hệ dùng bộ khối đặc của iFaster, đồ vật dùng Solar bản đặc, thao tác giữ nét mảnh (QD23) | Trum | 08/10/2026 | `2026-10-08-trum-bieu-tuong-ifaster.md` |
| T36 | Thanh trên: đủ tên công ty kèm nhãn Công ty, nhãn Chi nhánh, nút Trải nghiệm gói nổi bật, bỏ chọn vai trò (vai trò theo tài khoản đăng nhập). Gói Free ẩn hẳn tính năng ngoài gói. Quy trình tiền gộp khung Báo cáo vào khối sổ sách (QD22) | PhuongXT | 08/10/2026 | `2026-10-08-phuongxt-thanh-tren-free.md` |
| T32 | Thanh trên chọn chi nhánh làm việc, bỏ ô kỳ và trạng thái đồng bộ FABi; ô tìm kiếm chuyển sang sidebar; danh mục chi nhánh; chứng từ mới lập theo chi nhánh chọn ngoài (QD17) | PhuongXT | 08/10/2026 | `2026-10-08-phuongxt-thu-chi-free.md` |
| T31 | Luật mới: agent kiểm bản mới trên GitHub trước mỗi lần push (QD16) | Trum | 08/10/2026 | `2026-10-08-trum-kiem-truoc-push.md` |
| T30 | Robot báo lên group Telegram mỗi lần có người push lên `main`, báo thêm khi deploy hỏng | Trum | 08/10/2026 | `2026-10-08-trum-bao-telegram.md` |
| T01 | Tạo API token Cloudflare cho robot deploy, lưu vào GitHub | Trum | 08/10/2026 | `2026-10-08-trum-bao-telegram.md` |
| T35 | Luật phối hợp: push ngay khi nhận việc, lấy mã sau fetch, giữ chỗ QD, mỗi phiên một bản clone, ghi file dùng chung, CSS theo mục có mã việc (QD21) | Trum | 08/10/2026 | `2026-10-08-trum-luat-phoi-hop.md` |
| T34 | Thanh lọc và chọn khoảng ngày theo iFaster cho mọi màn danh mục, danh sách, báo cáo | Trum | 08/10/2026 | `2026-10-08-trum-thanh-loc-ifaster.md` |
| T29 | Màn chứng từ bán hàng 3.1.1 chia đôi 50/50 như 3.1.2 | Trum | 08/10/2026 | `2026-10-08-trum-ban-hang-chia-doi.md` |
| T28 | Ô chọn trong form chứng từ dùng chung một kiểu, thẳng hàng. Màn đăng nhập bỏ sơ đồ kết nối | Trum | 08/10/2026 | `2026-10-08-trum-o-chon-ngay-ngan.md` |
| T26 | Đổi ngôn ngữ thiết kế theo iFaster (QD15), thay logo sang Accounting Powered by iPOS.vn | Trum | 08/10/2026 | `2026-10-08-trum-thiet-ke-ifaster.md` |
| T24 | Bố cục danh sách chứng từ 50/50 cố định 1 trang, sửa padding form và điều hướng Trước Sau Esc | Trum | 08/10/2026 | `2026-10-08-trum-bo-cuc-voucher-50-50.md` |
| T25 | Sửa hiệu ứng chớp khi bấm Trước, Sau ở form chứng từ | Trum | 08/10/2026 | `2026-10-08-trum-sua-hieu-ung-truoc-sau.md` |
| T00 | Bộ tài liệu làm việc nhóm, robot kiểm và deploy | Trum | 07/10/2026 | `2026-10-07-trum-khung-web.md` |
| T15 | Làm lại form chứng từ và màn danh sách chứng từ theo bố cục AMIS (QD14) | Trum | 07/10/2026 | `2026-10-07-trum-form-chung-tu-amis.md` |
| T16 | Chuẩn hoá BAT-DAU.md cho người mới, đồng bộ skill Clau - Anti (QD13) | Trum | 07/10/2026 | `2026-10-07-trum-chuan-hoa-bat-dau-skills.md` |
| T17 | Dòng chi tiết chứng từ bám DB iPOS: Đối tượng, Khoản mục, Công việc từng dòng phiếu thu chi; Số lô, Hạn dùng phiếu mua | Trum | 07/10/2026 | `2026-10-07-trum-giao-dien-bam-db-ipos.md` |
| T21 | Sửa danh sách chứng từ vỡ bố cục: lớp `sel` của hàng đang chọn đụng lớp `.sel` của ô chọn | Trum | 08/10/2026 | `2026-10-08-trum-hoc-amis-lan-2.md` |
| T22 | Danh sách chứng từ học AMIS: thẻ tổng hợp, phân trang, chọn cột, ô một dòng | Trum | 08/10/2026 | `2026-10-08-trum-hoc-amis-lan-2.md` |
| T23 | Danh mục học AMIS: cột Chức năng lập nhanh chứng từ; số dư ban đầu thành lưới thẻ | Trum | 08/10/2026 | `2026-10-08-trum-hoc-amis-lan-2.md` |
| T18 | Danh mục và số dư bám DB iPOS: kho 1.8, đối tượng 1.5, bút toán tự động 1.15, số dư ban đầu 10.1.3 | Trum | 07/10/2026 | `2026-10-07-trum-giao-dien-bam-db-ipos.md` |

Phần làm trước khi có bảng này (khung AMIS, 148 màn, menu thả xuống, đưa lên GitHub và Cloudflare) ghi ở `CHANGELOG.md` và `docs/nhat-ky/2026-10-07-trum-khung-web.md`.
