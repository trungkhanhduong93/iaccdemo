# Tiến độ iaccdemo

Bảng việc của nhóm. Trum giao việc bằng cách điền cột "Người làm". Người làm tự đổi cột "Trạng thái".

- Trạng thái dùng một trong năm chữ: `Chờ`, `Đang làm`, `Dở dang`, `Kẹt`, `Xong`. `Kẹt` thì ghi lý do ở cột Ghi chú.
- Thứ tự dòng là thứ tự ưu tiên. Trum đổi thứ tự khi cần.
- Mã việc không đổi, không dùng lại. Việc mới lấy mã kế tiếp, mã lớn nhất hiện là T30.
- Mỗi dòng một việc. Sửa đúng dòng của mình để khỏi xung đột git với người khác.

## Đang làm và chờ làm

| Mã | Việc | Người làm | Trạng thái | Ghi chú |
|---|---|---|---|---|
| T30 | Robot báo lên group Telegram mỗi lần có người push lên `main`, báo thêm khi deploy hỏng | Trum | Đang làm | |
| T27 | Danh sách chứng từ 2.1.1: khung chi tiết bên dưới hiện dòng phiếu khác với form của cùng phiếu (UNC2610-0259: khung ghi "Chi mua rau, củ tại chợ", form ghi "Trả tiền nhà cung cấp thịt bò") | | Chờ | Thấy khi làm T26 |
| T02 | Chốt nghiệp vụ trên từng sơ đồ Quy trình: ô nào, nối thế nào, câu chữ. Sửa ở `src/modules/<phân hệ>/quy-trinh.ts` | Trum | Chờ | |
| T03 | Nối sổ quỹ, sổ tài khoản 2.2.2, sổ ngân hàng 2.2.3, sổ công nợ 2.2.5 vào `so-cai.ts` để mọi sổ khớp báo cáo tài chính | PhuongXT | Đang làm | Sổ quỹ đang tính riêng từ tiền mặt FABi từng chi nhánh. Tổng 3 quỹ chưa bằng dư TK 1111 trên cân đối kế toán |
| T25 | Rà soát, hoàn thiện phân hệ Kế toán tiền: form 5 loại phiếu thu chi, danh sách chứng từ 2.1.1, đối chiếu công nợ 2.1.2, phân bổ chi phí 2.1.3, sơ đồ Quy trình | PhuongXT | Đang làm | Làm cùng T03 |
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
| T01 | Tạo API token Cloudflare cho robot deploy, lưu vào GitHub | Trum | 08/10/2026 | `2026-10-08-trum-bao-telegram.md` |
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
