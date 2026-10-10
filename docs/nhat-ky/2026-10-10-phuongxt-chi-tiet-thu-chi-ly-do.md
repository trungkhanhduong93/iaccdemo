# Khung chi tiết danh sách thu chi khớp form, thêm cột Lý do (T27, T82)

- Ngày: 10/10/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `VoucherScreen.tsx`: khung chi tiết dưới danh sách lấy dòng phiếu giống form. Nguyên nhân lệch là khung dùng cấu hình chung của màn, còn form dùng cấu hình theo loại phiếu (`theoLoai`), nên cùng hạt giống mà sinh ra diễn giải, số tiền khác. Phiếu đã lưu trong phiên thì dùng dòng đã lưu (`_dong`).
- Phiếu thu, chi, báo có, uỷ nhiệm chi: khung chi tiết có cột Lý do thu / Lý do chi và cột Đối tượng theo đầu phiếu. Lý do lấy từ `_lyDo`, chưa có thì đoán theo diễn giải như form. Chuyển quỹ không có cột Lý do, giống form.
- T82 `VoucherScreen.tsx`, `ChungTuBanHang.tsx`: chế độ không ghi sổ (gói Free) thì khung chi tiết dưới danh sách bỏ tab Ghi sổ, giống form (T62). Form Bán hàng POS cũng bỏ tab này. Đang ở tab Ghi sổ mà đổi sang gói Free thì về tab đầu.
- `ChungTuForm.tsx`: xuất hàm `lyMacDinh` để khung chi tiết dùng chung.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_tra.py --nhanh`: `Không có lỗi.` (máy Windows cần đặt `PYTHONIOENCODING=utf-8`, nếu không script báo lỗi in chữ tiếng Việt).
- Trên trình duyệt, gói Pro, màn 2.1.1: UNC2610-0259 khung chi tiết và form cùng 2 dòng "Trả tiền nhà cung cấp thịt bò", cùng số tiền, cùng lý do. Phiếu thu, chi, báo có có cột Lý do; chuyển quỹ không có.
- T82: gói Free, khung chi tiết Thu chi, Mua hàng, Bán hàng POS không còn tab Ghi sổ; gói Pro vẫn có tab Hạch toán.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- Không.
