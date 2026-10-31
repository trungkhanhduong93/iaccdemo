# Tiện ích đồng bộ FABi cho Thu chi, Xuất bán POS (T697)

- Ngày: 31/10/2026
- Người: Trum, agent: Claude Code điều phối, Antigravity viết code và review chéo
- Trạng thái cuối phiên: Xong

## Đã làm

- Vẽ bản mẫu artifact 5 lần với Trum, chốt bản 5: https://claude.ai/artifact/Hesf4x2uPZG1ph5viLeTei (riêng tư, của Trum).
- Thu chi web (`VoucherScreen.tsx`, chỉ phân hệ `tien`): hàng chip đổi thành Tất cả, Chưa ghi sổ, Đã ghi sổ, Chưa đồng bộ; bỏ Lỗi hạch toán. Gói không ghi sổ hiện Tất cả, Đã ghi sổ, Chưa đồng bộ. Chip Chưa đồng bộ đổi bảng sang cột Mã phiếu FABi, Nguyên nhân, Xử lý, có ô tích, nút Đồng bộ lại, nút vuông Xuất Excel.
- `DongBoThuChiFabi.tsx`: bỏ nhãn cam và hộp lý do của T691, giữ nút Đồng bộ và dòng "Đang đồng bộ x / y phiếu thu chi" (T687).
- `dong-bo-fabi.ts`: phiếu chờ có thêm mã phiếu FABi (`soFabi`) và câu chi tiết nguyên nhân.
- `HopDongBo.tsx`: thêm prop tuỳ chọn `coLoaiPhieu`, hiện mục Loại phiếu (Phiếu thu, Phiếu chi). Nơi khác gọi hộp không đổi.
- Xuất bán POS web (`ChungTuBanHang.tsx`): thêm chip Đã đồng bộ, Chưa đồng bộ. Hai chip này hiện mỗi dòng một món (tên kèm mã món, ĐVT, Số lượng bán). Chip Tất cả giữ danh sách theo chứng từ. Chưa đồng bộ có 4 nguyên nhân: món chưa có trong danh mục, PTTT chưa map tài khoản, chưa chọn kho xuất, kỳ đã khoá sổ.
- Điện thoại: Thu chi (`MChungTu.tsx`) có cùng hàng chip; Xuất bán POS (`MXuatBanPos.tsx`) chọn trạng thái trong Bộ lọc, dòng món có nguyên nhân chữ đỏ (`MDsChungTuChuan.tsx` thêm prop `lyDo`). Điện thoại không có nút Đồng bộ, Đồng bộ lại, link xử lý.
- CSS mới ở mục T697 cuối `app.css`.

## Đã kiểm

- `npm run typecheck`: không lỗi.
- `npm run build`: chạy xong, không lỗi.
- `python tools/kiem_tra.py --nhanh`: `Không có lỗi.`
- `python tools/kiem_van.py` cho 6 file `.tsx` có chữ giao diện: 0 ĐỎ, 3 VÀNG ở `ChungTuBanHang.tsx`.
- Review chéo (pre-push-qa) ra VÀNG, 4 lỗi: sai tên nguyên nhân ở `MXuatBanPos.tsx`, toast Excel ghi cứng số dòng, số đếm chip điện thoại không dùng `khopChipTT`, ép `any`. Đã sửa cả 4, chạy lại ba lệnh trên đều qua.
- Chưa mở trình duyệt xem bằng mắt.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- Không ghi BAY, QUYET-DINH. CSS cũ `.dbtc-cho`, `.dbtc-hop` của T691 còn trong `app.css` nhưng không còn dùng.
