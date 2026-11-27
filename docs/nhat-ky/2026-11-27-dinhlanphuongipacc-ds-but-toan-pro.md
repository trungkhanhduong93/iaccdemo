# Danh sách bút toán Chứng từ tổng hợp gói Pro (T949)

- Ngày: 27/11/2026
- Người: dinhlanphuongipacc, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- Thêm `src/ui/generic/DanhSachButToan.tsx`: gom bút toán của mọi màn chứng từ ở mọi phân hệ, mỗi cặp 2 dòng (Nợ: Số tiền nợ, tính chất DEB; Có: Số tiền có, tính chất CRD). Dòng có sẵn TK Nợ/Có thì lấy luôn, còn lại suy từ mẫu hạch toán (`tinhButToan`).
- Nối vào `VoucherScreen.tsx` (3 dòng): màn 10.1.1 gói Pro dùng danh sách này thay danh sách chứng từ; form `/moi`, `/:id` giữ nguyên.
- Cột: Ngày, Số chứng từ, Loại chứng từ, Diễn giải, Tài khoản, TK đối ứng, Số tiền nợ, Số tiền có, Đối tượng, Công việc, Thành phẩm, VTHH (nợ/có), Tính chất. Dòng tổng, lọc từng cột, gom nhóm, Tuỳ chỉnh cột, Bộ lọc nâng cao.

- Đợt 2: đổi cột chi tiết thành Đối tượng/Công việc/Thành phẩm/VTHH (theo Tài khoản) và đ/ứ (theo TK đối ứng); cột Ghi chú; số chứng từ là liên kết mở chứng từ gốc; giữ trang, lọc cột, gom nhóm, vị trí cuộn khi đóng chứng từ về danh sách (biến `GIU`); cảnh báo tài khoản tổng hợp cùng hàng thanh lọc kèm nút Chuyển tài khoản.
- Popup Chuyển mã tài khoản: Từ tài khoản (cả tổng hợp), Sang tài khoản (chi tiết), Từ ngày, Đến ngày, Loại chứng từ, hỏi xác nhận. Phiếu có dòng Nợ/Có lưu riêng thì sửa thẳng qua `suaPhieu`; mọi phiếu ghi thêm quy tắc `QUY_TAC` áp lên danh sách (mất khi F5, phiếu mua/bán dựng từ mẫu hạch toán không sửa được tại phiếu).
- CSS cuối `app.css` mục T949: cảnh báo cùng hàng lọc, danh sách thả xuống trên popup, viền ô chọn tài khoản.

- Đợt 3: lưới luôn hiện (kể cả không có dòng, thông báo nằm dưới); độ rộng cột cố định (`wCung`), kéo giãn vẫn ưu tiên; cảnh báo tài khoản tổng hợp chỉ đếm chứng từ trong kỳ đang xem; popup Chuyển mã mặc định theo kỳ, khoá nút Chuyển khi không có chứng từ.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_van.py src/ui/generic/DanhSachButToan.tsx`: sạch.
- Xem trên trình duyệt (bản Pro): 858 dòng kỳ 10/2026, lọc theo số chứng từ ra đúng 2 dòng Nợ/Có, console không lỗi.
- `python tools/kiem_tra.py --nhanh` (chạy lại sau đợt 2, kết quả như cũ): 220 lượt mở màn không lỗi, rồi dừng ở mục T870/T871 (Thẻ kho) vì thẻ kho bắt chọn Kho và Mặt hàng từ T923; đã có việc T933 chờ sửa, không do việc này. Các mục sau T870/T871 chưa chạy.

## Dở dang, việc tiếp theo

- Không. Chưa làm: bản điện thoại, phiếu đã xoá hoặc sửa trong phiên chưa được tính vào danh sách, nút Excel là nút giả, quy tắc Chuyển mã tài khoản chưa lưu qua F5.

## Bẫy, quyết định mới

- `VoucherScreen.tsx` đang được Trum giữ ở T496; việc này chỉ thêm 3 dòng.
- Không có thêm vào `docs/BAY.md`, `docs/QUYET-DINH.md`.
