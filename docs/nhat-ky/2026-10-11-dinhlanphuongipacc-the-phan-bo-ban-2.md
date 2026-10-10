# Thẻ chi phí phân bổ bản 2 (T135)

- Ngày: 11/10/2026
- Người: dinhlanphuongipacc, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- Thẻ một khoản (T107, người dùng gọi là Ver1, commit `2ae0f50`) đổi thành thẻ nhiều dòng (`ccdc/the-phan-bo.tsx`, đổi đuôi từ `.ts`):
  - Thông tin chung còn Loại thẻ, Ngày ghi tăng, Số thẻ, Ngày bắt đầu phân bổ, Ngừng phân bổ (khi sửa).
  - Tab Chi tiết phân bổ: lưới nhiều dòng, Thêm dòng, Xoá hết. Thẻ CCDC chọn mã bằng `ChonDanhMuc` như phiếu mua, Tên, ĐVT lấy từ danh mục hàng hoá. Thẻ TSCĐ thêm Số hiệu, Mô tả. Thẻ dư đầu kỳ thêm Đã phân bổ, Số tháng đã, Số tháng còn, Cần phân bổ. Ngừng phân bổ thì có cột Ngày ngừng từng dòng.
  - Tab Đã phân bổ: các kỳ từng dòng nối nhau, dòng Cộng từng khoản, Tổng cộng dính đáy; lưu lệch tổng của dòng nào thì hỏi dồn vào kỳ cuối dòng đó.
  - Khối Thông tin mua sát đáy form: ô nhập khi thẻ nhập tay, chỉ xem và số chứng từ mở phiếu gốc khi tạo từ phiếu chi.
- Tạo thẻ từ phiếu chi: mỗi dòng phiếu lý do Chi phí chờ phân bổ thành một dòng thẻ (`ChungTuForm.tsx`).
- Danh sách thẻ chi phí theo kiểu danh sách thu chi (`CatalogScreen.tsx`, tuỳ chọn `dsChungTu`, `kySoLieu`, `tich`, `hangLoat`, `stt`): Ẩn thẻ hết phân bổ bên trái, Kỳ số liệu, Tìm kiếm, Loại thẻ nhãn trên viền, Tuỳ chỉnh cột, Excel, nút thêm tách đôi; phân trang, dòng Tổng, khung Chi tiết ở đáy, đúp chuột mở thẻ. Thẻ hiện theo ngày ghi tăng tới cuối kỳ, cột Đã phân bổ tính tới cuối kỳ.
- Ghi tăng hàng loạt (`ccdc/GhiTangHangLoat.tsx`): dòng phiếu chi chờ phân bổ chưa thành thẻ (mẫu và phiếu lưu trong phiên), chọn loại, số kỳ, ngày bắt đầu; CCDC có Mã, Tên, ĐVT, Số lượng, Đơn giá chỉ đọc = số tiền / số lượng. Gói Free, Standard: nút chính Ghi tăng; Plus, Pro: nút chính Ghi tăng hàng loạt, không có Ghi tăng từng thẻ.
- Danh mục hàng hoá thêm 8 mặt hàng loại Công cụ dụng cụ (`CCDC_HANG` ở `data/mock.ts`, TK 153).
- Báo cáo mới Bảng chi tiết phân bổ chi phí (`ccdc/index.ts`, slug `bang-phan-bo`, mở theo mã 8.1.1).
- Sơ đồ gói Free (`ccdc/quy-trinh.ts`, `luongFree`): Chi tiền mặt, Chi ngân hàng nối tới Thẻ chi phí phân bổ; Thẻ CPPB dư đầu kỳ đứng riêng (cờ `rieng` mới ở `QuyTrinhScreen.tsx`). Danh mục liên quan thêm Hàng hoá.
- Thông tin đơn vị: Ngày đầu năm trước, Năm làm việc hiện tại sau (`session.tsx`: `namTaiChinh`, `dsKyNam`, `kyMacDinh`).
- `PhanTrang.tsx`: số Tổng cộng của cột khuất hẳn không còn ghim mép phải, số đi theo cột khi cuộn ngang (mọi danh sách).
- `CongCuDs.tsx`: `NutThemMoiSplit` nhận nhãn nút `nhan`.
- Thẻ mẫu thêm 3 thẻ nhiều dòng (CPTT, CCDC, TSCĐ) và 2 thẻ để thử lọc kỳ.

## Đã kiểm

- `npm run typecheck`: không lỗi. `npm run build`: chạy xong.
- `python tools/kiem_tra.py --nhanh`: `Không có lỗi.` (222 lượt mở màn).
- `kiem_van.py --loai giao-dien` các file ccdc, HeThong: sạch.
- Bấm thử ở 1440x900 và 1150x800: danh sách, lọc kỳ, ẩn thẻ hết phân bổ, khung chi tiết, nút thêm theo gói Free và Plus, Ghi tăng hàng loạt (báo lỗi, tạo), thẻ nhiều dòng các loại, chọn mã CCDC, tạo thẻ từ phiếu chi, báo cáo, sơ đồ.

## Dở dang, việc tiếp theo

- Bản mẫu chưa lưu thật thẻ (Lưu, Tạo hàng loạt chỉ báo); thẻ tạo hàng loạt chưa hiện vào danh sách.
- Ghi tăng hàng loạt chưa lấy dòng từ hoá đơn mua hàng (người dùng hẹn bổ sung sau).
- Báo cáo Bảng chi tiết phân bổ chi phí chưa có dòng tổng cộng (bảng kê dùng chung chưa tự cộng).
- Lưới thẻ còn kẻ dọc mờ do dùng `Table` chung, khác `BangSua` của phiếu chi.

## Bẫy, quyết định mới

- Không ghi `docs/QUYET-DINH.md`. Đề xuất chờ Trum chốt thành QD: mọi màn danh sách làm đồng nhất với danh sách Thu, chi tiền (thanh `ds-thanh`, `NutTuyChinhCot`, `NutExcel`, `NutThemMoiSplit`, `PhanTrang`, khung chi tiết đáy); số kiểu quốc tế trên thẻ phân bổ; Năm làm việc hiện tại.
