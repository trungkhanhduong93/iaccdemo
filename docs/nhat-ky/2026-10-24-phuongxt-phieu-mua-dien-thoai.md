# Phiếu mua hàng điện thoại theo bản nháp: tạo mới, chi tiết, thanh toán (T655)

- Ngày: 24/10/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- Bản nháp trên artifact (canvas Phiếu thu chi điện thoại, cột "Phiếu nhập mua hàng"): https://claude.ai/artifact/2KXibEiENjGxbKFHYh3Q1n
- `MLapPhieu.tsx`, màn tạo mới phiếu mua: thẻ đầu nhãn trái ô phải (Nhà cung cấp, Kho nhập, Ngày chứng từ, Ghi chú), cửa hàng kèm biểu tượng nhà ở hàng chip, ô tích "Đã thanh toán" (tích thì hiện ô Quỹ thanh toán). Bỏ Địa chỉ, Mã số thuế, Người giao dịch, Số phiếu nhập khỏi màn tạo mới (vẫn tự lưu theo nhà cung cấp). Thẻ Thông tin hoá đơn VAT có công tắc, nằm dưới danh sách hàng. Màn sửa phiếu giữ bố cục cũ.
- `MLapPhieu.tsx`, bảng chọn quỹ khi tạo mới hiện cả Tiền mặt và Ngân hàng, chọn quỹ nào thì hình thức trả theo quỹ đó.
- `MXemPhieu.tsx`, chi tiết phiếu mua: thẻ đầu chỉ còn cửa hàng + chip nguồn (như chi tiết thu chi), tổng tiền, khung Thanh toán; bỏ tên nhà cung cấp chữ to và chip trạng thái. Tab đổi tên "Chi tiết". Trong tab: Thông tin chung (Nhà cung cấp, Ngày chứng từ, Kho nhập, Ghi chú, Tham chiếu), Thông tin hoá đơn tách thẻ riêng khi nhận kèm hoá đơn, Hàng hoá. Bỏ Số phiếu nhập, Địa chỉ, Mã số thuế, Người giao dịch, dòng Số lượng ở Tổng cộng, mục Lịch sử thanh toán ở menu ba chấm. Thẻ đầu và hai khối thông tin gọn hơn (CSS `m-t655-dau`, `m-t655-gon`).
- `MThanhToanNgay.tsx`: ô Số tiền sửa được ở mọi gói (bỏ khoá gói Standard của T630), không vượt số còn phải trả. Hàm chung `lapPhieuChiTraNcc` lập luôn phiếu chi tiền mặt hoặc uỷ nhiệm chi bên Thu chi và ghi vào thanh toán của phiếu mua, không mở form điền lại. Màn chi tiết và màn sửa phiếu mua cùng dùng hàm này.
- `MDtThuChiXem.tsx`: chi tiết phiếu thu chi bỏ chip loại phiếu (vd "Chi tiền mặt") ở đầu thẻ.
- `app.css`: mục "Tạo mới phiếu mua hàng điện thoại ... (T655)" ở cuối file.

## Đã kiểm

- `npm run typecheck`: không lỗi. `npm run build`: chạy xong, không lỗi.
- `python tools/kiem_tra.py --nhanh`: "Không có lỗi.", chạy lại sau khi gộp bản T652, T653 của Trum.
- `python tools/kiem_van.py` cho 4 file tsx đã sửa: 0 ĐỎ.
- `python tools/xuat_bao_cao_he_thong.py` không chạy được trên máy này: script tìm `Present/tools` ở thư mục cha của repo (`ROOT.parent`), máy PhuongXT để `Present/` trong repo. Chưa làm mới file Excel.
- Mở thử trên điện thoại ảo: tạo mới phiếu mua (tích Đã thanh toán, chọn quỹ Vietcombank), chi tiết MH2610-0018 (thanh toán 5.000.000, lập PC2610-0261, Đã trả cập nhật, chip đổi Thanh toán một phần).

## Dở dang, việc tiếp theo

- Không.
- Chip "Thanh toán một phần" trong khung Thanh toán màn chi tiết phiếu mua không có màu nền (class `mot-phan` chưa có CSS, chỉ có `.mot`). Chưa sửa.
- Lúc làm, `MLapPhieu.tsx`, `MXemPhieu.tsx` đang ghi trong việc của Trum (T552) và dinhlanphuongipacc (T436). PhuongXT bảo push.

## Bẫy, quyết định mới

- Không. Mở ô số tiền gói Standard là đổi điều đã làm ở T630, PhuongXT chốt trong phiên.
