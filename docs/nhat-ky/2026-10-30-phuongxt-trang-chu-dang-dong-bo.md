# Trang chủ báo đang đồng bộ chứng từ FABi (T687)

- Ngày: 30/10/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/app/session.tsx`: thêm trường `dongBoFabi` theo đơn vị (lúc bắt đầu, số chứng từ Xuất bán POS, số phiếu thu chi).
- `src/modules/onboarding/OnboardFabi.tsx`: popup Kết nối lấy xong danh mục (mốc `MOC_DANH_MUC` 30%) là vào Trang chủ, ghi `dongBoFabi`; chứng từ đổ về tiếp ở Trang chủ.
- `src/modules/home/NhacDonViMoi.tsx`: hook `useDongBoFabi` (mẫu 90 giây đổ về hết), `phanDaVe`, dòng `DongDongBo` (thanh vàng "Đang đồng bộ x / y chứng từ", đủ thì "Đã đủ" xanh); chip lợi nhuận đổi thành "Đang đồng bộ, tạm tính".
- `src/modules/home/BaBaiToanStandard.tsx` (web gói Standard): dải vàng tổng chứng từ trên hai khối; dòng Doanh thu viền cam kèm tiến độ; doanh thu, giá vốn, chi phí hoạt động tăng dần theo phần đã về; Tồn quỹ có chip "Chưa đủ"; từng quỹ có thu ở chú thích vòng quỹ báo tiến độ riêng, mỗi quỹ về hết một lúc khác nhau, dòng Còn lại cộng các quỹ gộp; vòng tròn và hai biểu đồ 13 tháng làm mờ, nhãn "Hiện đủ khi đồng bộ xong".
- Popup Kết nối: dừng 1,5 giây ở mốc danh mục cho thấy tích xanh danh mục; hai dòng Doanh thu, Thu chi quay kèm chữ "Đổ về tiếp, xem tiến độ ở Trang chủ" (PhuongXT góp ý).
- Chip "Tạm tính" cạnh lợi nhuận chỉ hiện lúc đang đồng bộ, xong thì bỏ, cả web lẫn điện thoại (PhuongXT góp ý).
- Cuối `src/styles/app.css`: mục T687.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- `python tools/kiem_van.py` cho `NhacDonViMoi.tsx`: sạch.
- Xem trên trình duyệt (cổng 5185), giả lập đơn vị mới vừa kết nối: dải vàng, dòng Doanh thu, từng quỹ tăng dần; hết 90 giây tự về như cũ.
- Bấm thử trọn luồng màn mở từ FABi, popup Kết nối: dòng danh mục tích xanh, hai dòng chứng từ báo đổ về tiếp, rồi vào Trang chủ.

## Dở dang, việc tiếp theo

- Điện thoại (`src/ui/mobile/MTrangChuStandard.tsx`) chưa báo đang đồng bộ, ghi thành T688.

## Bẫy, quyết định mới

- Không.
