# Danh sách bút toán Chứng từ tổng hợp gói Pro (T949)

- Ngày: 27/11/2026
- Người: dinhlanphuongipacc, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- Thêm `src/ui/generic/DanhSachButToan.tsx`: gom bút toán của mọi màn chứng từ ở mọi phân hệ, mỗi cặp 2 dòng (Nợ: Số tiền nợ, tính chất DEB; Có: Số tiền có, tính chất CRD). Dòng có sẵn TK Nợ/Có thì lấy luôn, còn lại suy từ mẫu hạch toán (`tinhButToan`).
- Nối vào `VoucherScreen.tsx` (3 dòng): màn 10.1.1 gói Pro dùng danh sách này thay danh sách chứng từ; form `/moi`, `/:id` giữ nguyên.
- Cột: Ngày, Số chứng từ, Loại chứng từ, Diễn giải, Tài khoản, TK đối ứng, Số tiền nợ, Số tiền có, Đối tượng, Công việc, Thành phẩm, VTHH (nợ/có), Tính chất. Dòng tổng, lọc từng cột, gom nhóm, Tuỳ chỉnh cột, Bộ lọc nâng cao.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_van.py src/ui/generic/DanhSachButToan.tsx`: sạch.
- Xem trên trình duyệt (bản Pro): 858 dòng kỳ 10/2026, lọc theo số chứng từ ra đúng 2 dòng Nợ/Có, console không lỗi.
- `python tools/kiem_tra.py --nhanh`: 220 lượt mở màn không lỗi, rồi dừng ở mục T870/T871 (Thẻ kho) vì thẻ kho bắt chọn Kho và Mặt hàng từ T923; đã có việc T933 chờ sửa, không do việc này. Các mục sau T870/T871 chưa chạy.

## Dở dang, việc tiếp theo

- Không. Chưa làm: bản điện thoại, phiếu đã xoá hoặc sửa trong phiên chưa được tính vào danh sách, nút Excel là nút giả.

## Bẫy, quyết định mới

- `VoucherScreen.tsx` đang được Trum giữ ở T496; việc này chỉ thêm 3 dòng.
- Không có thêm vào `docs/BAY.md`, `docs/QUYET-DINH.md`.
