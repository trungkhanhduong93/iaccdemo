# Làm lại onboard mở từ FABi (T138)

- Ngày: 29/10/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Dở dang

## Đã làm

- Màn mở từ FABi (`KhoiTaoFabi.tsx`): bỏ màn Chào, viết lại theo khung nội dung PhuongXT gửi. Huy hiệu "Gói Standard miễn phí trọn đời cho khách hàng FABi POS", tiêu đề, ảnh trang chủ, 4 thẻ giá trị (đồng bộ POS, quỹ tiền, mua hàng công nợ hao hụt, kê khai thuế và sổ sách), một nút "Bắt đầu kết nối dữ liệu (chỉ mất 30 giây)" mở ngay trong tab, dòng gợi ý gói Plus, Pro. Vừa một màn 1440×900.
- Popup khởi tạo (`OnboardFabi.tsx`) khi kết nối từ FABi còn 1 bước: chọn cửa hàng, ngày bắt đầu làm việc, bảng PTTT FABi về quỹ (tiền mặt về quỹ tiền mặt, ngân hàng và ví điện tử về quỹ ngân hàng chung). Năm tài chính tự đặt 01/01 năm hiện tại. Lấy dữ liệu xong về thẳng Trang chủ, bỏ dòng Ghi sổ.
- Loại hình, thông tin đơn vị (3 bước cũ) chỉ hỏi khi mở Kê khai thuế (`session.choKeKhai`). Popup này một màn, bỏ chọn gói và khung Bạn sẽ có gì; hộ kinh doanh chỉ nhóm 1, 2, cách tính theo % doanh thu; doanh nghiệp chỉ theo % doanh thu; cửa hàng chỉ chọn cửa hàng chính (`DsCuaHang` thêm `chiChinh`). Giữ gói đang dùng. Luồng Thêm đơn vị kế toán vẫn đủ 3 bước.
- Hướng dẫn từng bước sau khi khởi tạo xong (`src/modules/home/HuongDan.tsx`), web và điện thoại: chào, Doanh thu (nút Ghi một khoản chi), Quỹ tiền (nút Nhập số dư két), Kê khai thuế (nút Mở Kê khai thuế). Bấm nút làm ngay thì tạm dừng, nút nổi Tiếp tục hướng dẫn ở màn khác (gắn qua `OnboardFabi`). Bỏ qua thì chỉ vào nút la bàn xem lại hướng dẫn cạnh Năm, Tháng (điện thoại ở đầu Trang chủ). Không hiện khi trình duyệt do máy điều khiển (kiem_tra).
- Trang chủ đơn vị mới (`NhacDonViMoi.tsx`, gắn vào `BaBaiToanStandard.tsx`, `MTrangChuStandard.tsx`): Lợi nhuận có nhãn Tạm tính, không tô xanh, kèm nút Ghi khoản chi; nhãn nhắc nhập số dư két dưới tồn quỹ.
- Gói Standard ẩn chữ dùng thử ở mọi màn (`dungThuDv` trả null khi gói S).
- Đổi chữ IACC, IACC Cloud thành iPOS Accounting trên giao diện (16 chỗ, 10 file, có `index.html`). Chú thích code, khoá lưu `iacc-…`, tài liệu, `tools/` giữ nguyên.
- Thêm biểu tượng `la-ban` vào `src/ui/Icon.tsx`.

## Đã kiểm

- Mỗi lần sửa: `npm run typecheck`, `npm run build` không lỗi; `python tools/kiem_tra.py --nhanh` in "Không có lỗi."; `kiem_van.py` các file giao diện đã sửa: Sạch.
- Chạy thử trong khung trình duyệt của app ở 1440×900, 1100×750, 375×812: luồng kết nối, hướng dẫn tạm dừng và chạy tiếp, Bỏ qua chỉ nút la bàn, popup Kê khai thuế lưu đúng gói S, chế độ TT58 (doanh nghiệp).
- Chưa xem trên Chrome thật của PhuongXT sau bản cuối.
- Chưa xuất lại `docs/IACC-Cloud-Chi-Tiet-He-Thong.xlsx`: `tools/xuat_bao_cao_he_thong.py` cần file nguồn `Dự kiến tính năng IACC Cloud.xlsx` không có trên máy PhuongXT.

## Dở dang, việc tiếp theo

- PhuongXT, Trum xem bản online, góp ý tiếp.
- Bảng PTTT về quỹ ở popup kết nối chỉ là chữ: dữ liệu mẫu chưa có "Quỹ ngân hàng chung", map thật vẫn đẩy chuyển khoản, thẻ về NH01 (`dong-bo-fabi.ts`).
- Dữ liệu mẫu đơn vị mới vẫn có chi phí, nên câu "chưa trừ tiền nhà, điện…" cạnh số chi phí đọc hơi lạ khi demo.
- Hướng dẫn viết theo Trang chủ gói Standard; Plus, Pro bố cục khác, bước không thấy chỗ khoanh thì tự bỏ qua.
- Ẩn dùng thử ở gói Standard và câu gợi ý gói Plus, Pro là ý PhuongXT, chưa hỏi Trum.

## Bẫy, quyết định mới

- Không ghi bẫy mới. Bẫy zoom ở thẻ html đã có trong `docs/BAY.md`, hướng dẫn dùng `heSoZoom()`. Lớp nổi `position: fixed` đặt trong Trang chủ bị lệch do khung có transform, nên gắn bằng `createPortal` vào body.
