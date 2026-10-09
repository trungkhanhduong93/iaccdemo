# Sổ theo chi nhánh; danh sách chứng từ: tổng trang, tổng cộng, xoá có hỏi lại (T25, T48)

- Ngày: 09/10/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Dở dang (T25), Xong (T48)

## Đã làm

- T25: Sổ quỹ 2.2.1 theo chi nhánh trên thanh trên, bỏ ô chọn Quỹ riêng; xem tất cả thì gộp quỹ 3 chi nhánh, thêm cột Chi nhánh (`tien/SoQuy.tsx`).
- T25: Sổ ngân hàng 2.2.3, Sổ công nợ 2.2.5 tính theo chi nhánh đang chọn, tất cả bằng tổng các chi nhánh. Cờ `theoCn` trong `ReportCfg` (`types.ts`, `tien/index.ts`), hàm `gopSo` và phần sinh số trong `ReportScreen.tsx`.
- T25: Bỏ ô Chi nhánh trên thanh lọc mọi màn báo cáo (`ReportToolbar`), vì ô này không lọc gì và trái quy ước chi nhánh lấy trên thanh trên.
- T48: Gói Free bỏ chip trạng thái và vạch vàng dòng chưa ghi, danh sách luôn hiện tất cả; các gói khác giữ 4 chip (`LocNangCao.tsx`, `VoucherScreen.tsx`, `ChungTuBanHang.tsx`).
- T48: Dòng tổng dưới bảng thành Tổng trang (cộng trang đang xem). Tổng cộng mọi trang nằm trên hàng phân trang, số đo theo mép cột trong bảng để thẳng cột (`PhanTrang.tsx`, `Table.tsx` thêm `data-k` cho ô tiêu đề, mục CSS T48 cuối `app.css`).
- T48: Khung chi tiết phiếu mặc định đóng.
- T48: Tổng tiền là cột cuối; bỏ cột Chức năng (nút Xem, menu ⋯ từng dòng).
- T48: Xoá luôn hỏi lại. Gói Free xoá được mọi phiếu, gói có ghi sổ chỉ xoá phiếu chưa ghi, phiếu thuộc kỳ đã khoá sổ không xoá ở mọi gói (`KHOA_SO_DEN`, `daKhoaSo` trong `data/mock.ts`). Áp ở nút Hàng loạt và mục Xoá chứng từ trong menu Tiện ích của form (`ChungTuForm.tsx`).
- T48: Phiếu xoá được ẩn khỏi danh sách và form tới khi tải lại trang (`generic/daXoa.ts`), vì bản mẫu chưa có backend.
- T48: `tools/kiem_tra.py` mở form chứng từ bằng đúp chuột vào dòng thay cho nút Xem đã bỏ.

## Đã kiểm

- `npm run typecheck`: không lỗi. `npm run build`: chạy xong, không lỗi.
- `python tools/kiem_tra.py --nhanh`: 209 lượt mở màn, in `Không có lỗi.`
- `python tools/kiem_van.py` cho mọi file có chữ đã sửa: sạch.
- Mở thử bằng Playwright: 3 sổ × 4 cách chọn chi nhánh × gói Free và Plus, số "Tất cả" bằng tổng 3 chi nhánh. Xoá ở gói Free và Plus qua nút Hàng loạt và form: số phiếu và tổng giảm đúng. Mép số Tổng cộng trùng mép số Tổng trang ở 1920px và 1440px trên Thu chi, Mua hàng, Bán hàng.
- Chưa bấm thử trên giao diện trường hợp chọn phiếu kỳ đã khoá sổ (phải đổi Thời gian về tháng 7, 8). Đã thử hàm `daKhoaSo`: 31/08/2026 khoá, 01/09/2026 không.

## Dở dang, việc tiếp theo

- T25: Sổ ngân hàng ở gói Free vẫn hiện cột TK đối ứng và chữ Phát sinh Nợ/Có; Sổ quỹ đã ẩn cột này. Chờ PhuongXT chốt có sửa giống Sổ quỹ không (`renderReport` nhánh `kieu === 'so'` trong `ReportScreen.tsx`).
- T25: Gói Free, chỗ ký "Kế toán trưởng" trên sổ (`ReportPaper`) chờ chốt đổi chữ gì hay bỏ.
- T25: Mô tả gói Free, Standard trong `GOI` ở `src/app/plan.ts` ghi "1 điểm bán". Theo Roadmap gói Free là mỗi chi nhánh một kho, không giới hạn một chi nhánh. PhuongXT hẹn chốt sau.
- Mục Sửa, Nhân bản, In từng dòng đã bỏ cùng cột Chức năng; In vẫn có ở Hàng loạt, Sửa và Nhân bản ở trong form.

## Bẫy, quyết định mới

- `docs/QUYET-DINH.md`: QD32 (PhuongXT chốt, đổi điểm chip gói Free của QD25).
- Phiên này lấy T48, bỏ qua T47 vì tiêu đề mục CSS "Hộp Cột hiển thị & Đóng băng" của T46 đã ghi T47. Sau đó Trum dùng T47 cho việc phân hệ Báo cáo và giữ chỗ QD31, nên quyết định của phiên này đổi thành QD32.
