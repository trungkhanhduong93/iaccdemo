# Form phiếu thu chi: ô quỹ, ghi chú, lưu ở lại xem phiếu, nhật ký thêm sửa xoá (T51)

- Ngày: 09/10/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `ChungTuForm.tsx`: ô Quỹ tiền mặt (phiếu thu, chi tiền mặt, chỉ quỹ của chi nhánh lập phiếu) và Tài khoản ngân hàng (phiếu thu, chi ngân hàng) đứng đầu phiếu; lưu vào `_quy`. Phiếu chuyển quỹ giữ Từ quỹ, Đến quỹ.
- Ghi chú chuyển lên cột giữa, cùng hàng Địa chỉ.
- Lưu phiếu mới (nút Lưu, Ctrl+S) thì ở lại form, chuyển sang Chi tiết phiếu vừa lưu; đóng mới về danh sách.
- Tab Lịch sử có ở mọi gói, kể cả Free; gói Free ghi "Lưu chứng từ" thay "Ghi sổ".
- Nhật ký thêm mới, sửa (ô đã đổi, tổng tiền cũ → mới), xoá: `ghiNhatKy`, `useNhatKy` trong `generic/daXoa.ts`; `xoaPhieu` nhận số phiếu và người làm (`VoucherScreen.tsx`, `ChungTuBanHang.tsx`, form). Màn Nhật ký thao tác chung (`tien-ich/TienIch.tsx`) hiện các dòng trong phiên lên đầu, thấy được cả phiếu đã xoá.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi. `python tools/kiem_tra.py --nhanh`: `Không có lỗi.`
- Playwright: 5 loại phiếu có đúng ô quỹ; lưu ở lại xem phiếu, Esc về danh sách; thêm mới, sửa, xoá ghi đúng ở tab Lịch sử và màn Nhật ký thao tác.

## Dở dang, việc tiếp theo

- Không.
- Nhật ký trong phiên mất khi tải lại trang (bản mẫu chưa có backend). Lịch sử mẫu cũ của phiếu có sẵn vẫn hiện dưới các dòng thật.

## Bẫy, quyết định mới

- `docs/QUYET-DINH.md`: thêm vào QD33.
- `kiem_tra.py` có lúc hỏng ở bước chọn kỳ Báo cáo tài chính (`.report .kn-nut` chờ quá 30 giây), chạy lại thì qua. Chưa rõ nguyên nhân, cần Trum xem (phần T47, T50).
