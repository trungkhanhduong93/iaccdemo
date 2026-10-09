# Đầu phiếu thu chi, chuyển quỹ bỏ Diễn giải, Ghi chú kéo dài (T77)

- Ngày: 09/10/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `ChungTuForm.tsx`: phiếu có ô Lý do (thu, chi tiền mặt, báo có, uỷ nhiệm chi) bỏ ô Diễn giải ở đầu phiếu; Địa chỉ lên cột giữa dưới Lý do; Ghi chú thành một hàng riêng kéo qua hai cột trái (`gridColumn: '1 / 3'`). Diễn giải vẫn chép theo Ghi chú khi lưu, danh sách hiện như cũ.
- Ô Địa chỉ, Ghi chú gom thành `oDiaChi`, `oGhiChu` trước `return` để dùng ở hai chỗ.
- Phiếu chuyển quỹ cũng bỏ Diễn giải (cờ `boDg`): Ghi chú mặc định là diễn giải và chép sang khi gõ. Hàng 1 Từ quỹ, Đến quỹ; hàng 2 Người thực hiện, Ghi chú (`oQuyCq`, `oNguoiTh`). Ẩn hàng Mã số thuế rỗng ở chuyển quỹ để hai cột thẳng hàng.
- Báo có, uỷ nhiệm chi: nhãn ô quỹ đổi từ Tài khoản ngân hàng thành Quỹ tiền.
- Phiếu phân hệ khác không đổi.
- Sửa câu về bố cục đầu phiếu trong QD33.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_tra.py --nhanh`: `Không có lỗi.`
- `python tools/kiem_van.py` cho `QUYET-DINH.md`, `TIEN-DO.md`, `ChungTuForm.tsx`: sạch.
- Trên trình duyệt: phiếu thu, báo có, uỷ nhiệm chi, chuyển quỹ đúng bố cục mới, hai cột chuyển quỹ thẳng hàng; Mua hàng giữ như cũ.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- QD33 sửa câu về vị trí Địa chỉ, Ghi chú, bỏ Diễn giải đầu phiếu thu chi.
