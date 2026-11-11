# Popup Thông báo sai sót, xem mẫu 04/SS-HĐĐT (T796)

- Ngày: 11/11/2026
- Người: dinhlanphuongipacc, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

Tất cả ở `src/modules/hoa-don/HoaDonDienTu.tsx`, CSS ở mục T796 cuối `src/styles/app.css`.

- Popup Tạo TBSS (`HopTbss`): mọi ô chung một khung `hddt-bang`, nhãn một cột. Thêm ô Địa chỉ, Email nhận TBSS, mặc định lấy theo hoá đơn có sai sót (`dongHd` thêm `email`). Nút Lưu nháp và nút Lưu và gửi CQT.
- Trạng thái TBSS đổi thành Trạng thái thuế: Chưa gửi, CQT chấp nhận, CQT từ chối (`TtTbss`). Lưu và gửi CQT trong bản mẫu cho CQT chấp nhận luôn.
- Tab Thông báo sai sót, nút Xem TBSS mở `HopXemTbss`: mẫu 04/SS-HĐĐT khổ ngang A4 theo file mẫu của CQT (bản thật do API nhà cung cấp HĐĐT trả về). Có dấu trạng thái thuế, chữ ký số khi đã gửi, nút Gửi email (`HopMailTbss`, mặc định email người mua), In thông báo (in trang ngang, `@page tbss-ngang`).
- Tab Hoá đơn điện tử: hoá đơn có TBSS chưa gửi hiện dấu chấm than ở cột Loại hoá đơn. Hoá đơn dự thảo ghi số 00000000.
- Tab Điều chỉnh thay thế: Số HĐ là link xem hoá đơn, bỏ chữ Xem, Số chứng từ thành cột riêng, dự thảo ghi 00000000.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `KIEM_TRA_URL=http://localhost:5183/ python tools/kiem_tra.py --nhanh`: Không có lỗi.
- `python tools/kiem_van.py src/modules/hoa-don/HoaDonDienTu.tsx`: 0 ĐỎ, 1 VÀNG (câu ghi chú (8) chép nguyên mẫu CQT, giữ).
- Trên trình duyệt: form TBSS lên sẵn địa chỉ, email; Lưu nháp hiện dấu chấm than ở hoá đơn; Xem TBSS hiện mẫu ngang; Gửi email báo đúng email.
- `python tools/xuat_bao_cao_he_thong.py` lỗi thiếu module `build_present`, chưa làm mới file Excel.

## Dở dang, việc tiếp theo

- Người dùng nhờ thêm ở tab Điều chỉnh thay thế, chuyển sang phiên T797 (cùng vùng `DieuChinhThayThe`):
  - khu Hoá đơn điều chỉnh, thay thế thêm cột Trạng thái HĐĐT (Đã phát hành, Dự thảo), Trạng thái thuế như tab Hoá đơn điện tử;
  - nút thao tác như tab Hoá đơn điện tử: dự thảo có Phát hành, Gửi CQT, Phát hành và Gửi CQT; đã phát hành chỉ Gửi CQT;
  - hoá đơn dự thảo vẫn xem được mẫu hoá đơn như hoá đơn đã có số.

## Bẫy, quyết định mới

- Không.
