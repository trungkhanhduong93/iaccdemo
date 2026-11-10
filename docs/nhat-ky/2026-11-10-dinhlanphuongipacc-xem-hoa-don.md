# Popup Xem hoá đơn, bản hoá đơn điện tử từ nhà cung cấp (T789)

- Ngày: 10/11/2026
- Người: dinhlanphuongipacc, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- Dựng bản thiết kế trên Artifact (popup Xem hoá đơn, bản hoá đơn điện tử, biến thể mẫu 2), người dùng duyệt rồi mới code.
- `src/modules/ban-hang/hddt.tsx`: viết lại `HopXemHd`. Phần đầu có dải tóm tắt: ngày, mã CQT, mã tra cứu (có nút chép), tổng tiền. Tiếp theo là các thẻ Hoá đơn, Người bán (đơn vị đang dùng), Người mua (Công ty, Cá nhân, hoặc người mua không lấy hoá đơn), Tiền hoá đơn. Thẻ Tiền hoá đơn ở mẫu 1 gồm tiền trước thuế, thuế suất, tiền thuế, tổng; ở mẫu 2 gồm cộng tiền hàng, giảm trừ thuế, tổng. Thẻ này có thêm số tiền bằng chữ. Theo góp ý của người dùng, popup không có bảng mặt hàng.
- Chân popup: bên trái Tải PDF, Tải XML, bên phải Đóng và Xem hoá đơn điện tử (`xp-btn-outline`, `xp-btn-sua`).
- Thêm `BanHd`, `MaQr`. Bấm Xem hoá đơn điện tử thì hiện bản hoá đơn nhà cung cấp trả về. Bản giả lập có khung viền, logo viết tắt, tiêu đề đỏ, ký hiệu, số đỏ, mã CQT, người mua, bảng hàng có hàng số cột, tổng, bằng chữ, mã QR, chữ ký số. Chân popup: Tải PDF, Tải XML, Chia sẻ PDF, Đóng, In hoá đơn. Nút In chỉ in vùng hoá đơn (lớp `in-hdx` trên `body`), các nút tải, chia sẻ báo toast.
- `loiLayHd`: chưa kết nối iPOS Invoice, hoặc thông tin hoá đơn chưa khớp (số không đủ 8 chữ số, ký hiệu sai, ký hiệu C mà thiếu mã CQT), thì không xem bản hoá đơn, không tải PDF, XML, chỉ báo lý do. Người dùng chốt: bản hoá đơn là bản nhà cung cấp trả về, không tự vẽ.
- `Vo` thêm prop `lop` để gắn class riêng cho popup.
- `src/styles/app.css`: mục mới cuối file `/* ── Popup Xem hoá đơn, bản hoá đơn điện tử từ nhà cung cấp (T789) ── */`.

## Đã kiểm

- `npm run typecheck`: không lỗi. `npm run build`: chạy xong.
- `python tools/kiem_tra.py --nhanh`: "Không có lỗi."
- `python tools/kiem_van.py src/modules/ban-hang/hddt.tsx`: Sạch.
- Mở tay ở Hoá đơn điện tử gói Plus, hoá đơn 00000124 (mẫu 2): popup và bản hoá đơn hiện đủ, cộng tiền hàng trừ giảm trừ thuế khớp tổng.
- Chưa thử bấm In thật (hộp in của trình duyệt), chưa thử mẫu 1 trên đơn vị khấu trừ.

## Dở dang, việc tiếp theo

- Không.
- Số điện thoại, số tài khoản người bán chưa có trong `DON_VI` nên bản hoá đơn chưa in hai dòng này.
- `tools/xuat_bao_cao_he_thong.py` vẫn lỗi thiếu module `build_present` trên máy này, chưa làm mới `docs/IACC-Cloud-Chi-Tiet-He-Thong.xlsx`.

## Bẫy, quyết định mới

- Không.
