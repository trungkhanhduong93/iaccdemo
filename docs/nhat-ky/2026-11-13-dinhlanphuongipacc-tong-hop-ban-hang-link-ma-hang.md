# Tổng hợp bán hàng: bấm mã hàng mở Bảng kê chi tiết bán hàng ở tab mới (T814)

- Ngày: 13/11/2026
- Người: dinhlanphuongipacc, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/modules/ban-hang/bao-cao.ts`: cột Mã hàng của Tổng hợp bán hàng 3.2.7 có hàm vẽ `oMaHang`, mỗi mã là liên kết (`target="_blank"`) tới Bảng kê chi tiết bán hàng 3.2.8. Liên kết mang kỳ, bộ lọc đang xem của 3.2.7, thêm `locHang` là tên mặt hàng của dòng (bộ lọc Hàng hoá lọc theo tên, `quaLocDong`). Dòng tổng, dòng nhóm giữ chữ. Dùng class có sẵn `ds-link-so`, không thêm CSS.
- `src/ui/bao-cao/tuyChinhBC.ts`: thêm `linkBaoCaoTabMoi(path, loc, ky)` dựng đường dẫn `#<path>?bcKy=..&bcLoc=<JSON>`; `daXemTrangHienTai()` đọc kỳ, bộ lọc đã xem của báo cáo đang mở. `layTrangThai` khi tạo trạng thái lần đầu cho một báo cáo thì đọc `bcKy`, `bcLoc` trên đường dẫn (chỉ khi đúng đường dẫn báo cáo đó), đặt cả bản nhập, bản đã xem, `kyDatSan` như `datLocDaXem`. Tab mới không có kho trạng thái của tab cũ nên phải gửi qua đường dẫn.
- Không sửa `ReportScreen.tsx` (Trum đang giữ ở T594). Bộ lọc không có ở 3.2.8 tự bỏ qua nhờ `locHienCo`.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- `python tools/kiem_van.py src/modules/ban-hang/bao-cao.ts`: Sạch.
- Playwright, gói Pro, tất cả cửa hàng, tháng 9/2026: 3.2.7 có 18 mã hàng là liên kết; bấm BUN01 mở tab thứ hai `#/app/ban-hang/3-2-8?bcKy=9&bcLoc={"locHang":["Bún chả Hà Nội"]}`, tab cũ giữ nguyên; tab mới tiêu đề Bảng kê chi tiết bán hàng, dòng phụ "Tháng 9/2026 · Tất cả cửa hàng · Hàng hoá: Bún chả Hà Nội", nút lọc có số 1, chỉ còn dòng BUN01, không lỗi trang.
- Chưa thử bằng tay trường hợp đổi kỳ khác tháng 9 hoặc chọn Kênh bán, Cửa hàng ở 3.2.7 trước khi bấm; code truyền nguyên kỳ, bộ lọc đã xem nên cùng cách.

## Dở dang, việc tiếp theo

- Không.
- Bản điện thoại (`MTongHopBanHang.tsx`) chưa có liên kết này, người dùng chỉ yêu cầu web.

## Bẫy, quyết định mới

- Không.
