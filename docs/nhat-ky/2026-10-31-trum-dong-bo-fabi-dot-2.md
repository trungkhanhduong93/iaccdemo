# Đồng bộ FABi đợt 2: cột Lý do, chia tab, kéo giãn cột, ghim cột tiền (T699)

- Ngày: 31/10/2026
- Người: Trum, agent: Claude Code điều phối, Antigravity viết code
- Trạng thái cuối phiên: Xong

## Đã làm

- Thu chi, chip Chưa đồng bộ (`VoucherScreen.tsx`): thêm cột Lý do (thu là Thu khác, chi là Chi phí khác). Cột Loại ghi chữ như danh sách thường (Thu tiền mặt, Chi tiền mặt, Thu ngân hàng, Chi ngân hàng), bỏ chip Thu/Chi.
- Chia theo tab: tab Tiền mặt chỉ hiện phiếu chờ PTTT tiền mặt, tab Ngân hàng hiện phiếu chờ PTTT còn lại, kể cả PTTT chưa map quỹ. Số đếm chip tính theo tab. `dong-bo-fabi.ts` thêm `maPttt`, `loai`, `tenLoai` cho phiếu chờ.
- Hộp Đồng bộ (`DongBoThuChiFabi.tsx` nhận prop `quy`, `HopDongBo.tsx` thêm nhãn loại phiếu tuỳ chọn): tab Tiền mặt ghi Thu tiền mặt, Chi tiền mặt; tab Ngân hàng ghi Thu ngân hàng, Chi ngân hàng.
- Bảng đồng bộ Thu chi và Xuất bán POS kéo giãn được cột, mỗi bảng lưu độ rộng riêng (`useDoRongCot`).
- Nút Excel ở bảng Chưa đồng bộ dùng `NutExcel` như danh sách thường.
- Cột Số tiền (Thu chi), Tổng tiền (Xuất bán POS) dời ra cuối bảng, ghim mép phải (`dinh: 'phai'`). CSS nền ô ghim ở mục T699 cuối `app.css`.

## Đã kiểm

- `npm run typecheck`: không lỗi.
- `npm run build`: chạy xong, không lỗi (chạy lại sau khi sửa nền ô ghim từ `var(--bg-card)` chưa khai báo sang `var(--white)`).
- `python tools/kiem_tra.py --nhanh`: `Không có lỗi.`
- `kiem_van`: 0 ĐỎ, 3 VÀNG.
- Chưa mở trình duyệt xem bằng mắt.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- Không.
