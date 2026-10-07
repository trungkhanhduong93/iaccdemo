# Tiến độ iaccdemo

Bảng việc của nhóm. Trum giao việc bằng cách điền cột "Người làm". Người làm tự đổi cột "Trạng thái".

- Trạng thái dùng một trong năm chữ: `Chờ`, `Đang làm`, `Dở dang`, `Kẹt`, `Xong`. `Kẹt` thì ghi lý do ở cột Ghi chú.
- Thứ tự dòng là thứ tự ưu tiên. Trum đổi thứ tự khi cần.
- Mã việc không đổi, không dùng lại. Việc mới lấy mã kế tiếp, mã lớn nhất hiện là T15.
- Mỗi dòng một việc. Sửa đúng dòng của mình để khỏi xung đột git với người khác.

## Đang làm và chờ làm

| Mã | Việc | Người làm | Trạng thái | Ghi chú |
|---|---|---|---|---|
| T01 | Tạo API token Cloudflare cho robot deploy, lưu vào GitHub. Cách làm ở `docs/TRIEN-KHAI.md` mục "Khoá Cloudflare cho robot" | Trum | Chờ | Chưa có token thì robot chỉ kiểm, không đưa lên online |
| T02 | Chốt nghiệp vụ trên từng sơ đồ Quy trình: ô nào, nối thế nào, câu chữ. Sửa ở `src/modules/<phân hệ>/quy-trinh.ts` | Trum | Chờ | |
| T03 | Nối sổ quỹ, sổ tài khoản 2.2.2, sổ ngân hàng 2.2.3, sổ công nợ 2.2.5 vào `so-cai.ts` để mọi sổ khớp báo cáo tài chính | | Chờ | Sổ quỹ đang tính riêng từ tiền mặt FABi từng chi nhánh. Tổng 3 quỹ chưa bằng dư TK 1111 trên cân đối kế toán |
| T04 | Kế toán trưởng duyệt mẫu sổ, báo cáo tài chính, tờ khai theo TT58, TT133, TT99. Sửa ký hiệu mẫu theo kết quả duyệt | | Chờ | Ký hiệu mẫu (S03a-DNN, B01-DNN, 01/GTGT...) ghi theo hiểu biết, chưa đối chiếu văn bản gốc. Mẫu dạng tinh gọn TT58 chưa có |
| T05 | Làm màn hoá đơn điện tử 3.1.5 riêng: danh sách theo trạng thái, ký số, gửi, huỷ, thay thế | | Chờ | Hiện chưa có trạng thái phát hành, ký số, gửi cơ quan thuế |
| T06 | Thống nhất API với Dev (BR-18 trong spec DEV), thay `data/mock.ts` bằng lớp gọi API, giữ nguyên màn | | Chờ | |
| T07 | Báo cáo TSCĐ, CCDC làm khớp báo cáo tài chính | | Chờ | Đang dùng màn sổ chung, số sinh ngẫu nhiên theo hạt giống |
| T08 | Bảng kê mua vào 6.2.1, báo cáo mua hàng 4.2.1, bảng kê điều chuyển 3.2.4 làm màn riêng | | Chờ | Đang dùng bảng kê hoá đơn chung |
| T09 | Form kiểm tra dữ liệu nhập. Nút Lưu thật sự lưu | | Chờ | Hiện nút chỉ hiện thông báo. Chỉ màn đăng nhập có kiểm tra |
| T10 | Ô trên sơ đồ Quy trình hiện số đếm (vd "3 phiếu chưa ghi sổ"). Đường nối ô phụ có mũi tên chiều nghiệp vụ | | Chờ | Hiện đường nối là nét đứt |
| T11 | Thuế TNDN tính đúng theo kỳ | | Chờ | Đang tạm tính 20% mỗi tháng |
| T12 | Giao diện cho màn hẹp hơn 1280px | | Chờ | Khung có min-width 1180px. Ở 1280px ô tìm kiếm trên thanh trên co còn khoảng 160px |
| T13 | Tách gói JS khi build | | Chờ | `npm run build` cảnh báo gói JS hơn 500 kB |
| T14 | Thay biểu tượng chìa khoá ở nút "Đăng nhập bằng tài khoản iPOS" bằng logo iPOS | | Chờ | Chưa có file logo iPOS |

## Đã xong

| Mã | Việc | Người làm | Xong ngày | Nhật ký |
|---|---|---|---|---|
| T00 | Bộ tài liệu làm việc nhóm, robot kiểm và deploy | Trum | 07/10/2026 | `2026-10-07-trum-khung-web.md` |
| T15 | Làm lại form chứng từ và màn danh sách chứng từ theo bố cục AMIS (QD14) | Trum | 07/10/2026 | `2026-10-07-trum-form-chung-tu-amis.md` |
| T16 | Chuẩn hoá BAT-DAU.md cho người mới, đồng bộ skill Clau - Anti (QD13) | Trum | 07/10/2026 | `2026-10-07-trum-chuan-hoa-bat-dau-skills.md` |

Phần làm trước khi có bảng này (khung AMIS, 148 màn, menu thả xuống, đưa lên GitHub và Cloudflare) ghi ở `CHANGELOG.md` và `docs/nhat-ky/2026-10-07-trum-khung-web.md`.
