# Lọc thu, chi và khoá sửa xoá phiếu FABi ở danh sách Thu, chi tiền (T283)

- Ngày: 16/10/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/ui/generic/VoucherScreen.tsx`: thêm ô lọc Thu, chi (Khoản thu: thu tiền mặt, thu ngân hàng; Khoản chi: chi tiền mặt, chi ngân hàng; Chuyển quỹ) ở danh sách Thu, chi tiền, hiện ngoài thanh lọc ngay sau Tìm kiếm. Trường mới `thuChi` trong `GtLoc`. Máy đã lưu cấu hình thanh lọc của màn này thì ô mới nằm trong Bộ lọc nâng cao.
- `src/ui/generic/ChungTuForm.tsx`: phiếu thu, chi nguồn FABi (`mod.key === 'tien'`, `nguon === 'FABi'`) bỏ nút Sửa, phím Ctrl E, mục Xoá chứng từ trong Tiện ích; mở bằng `?sua=1` cũng chỉ xem. Vẫn còn Sao chép, In, Ghi sổ, Bỏ ghi sổ.
- `src/ui/LocNangCao.tsx`: `NutHangLoat` nhận `khoaXoa` (hàm chọn phiếu không xoá được, kèm lý do). Danh sách Thu, chi tiền truyền phiếu FABi vào đây: xoá hàng loạt bỏ qua phiếu FABi, chọn toàn phiếu FABi thì hiện "Không xoá: phiếu đồng bộ từ FABi".

## Đã kiểm

- `npm run typecheck`: không lỗi.
- `npm run build`: chạy xong, không lỗi.
- `python tools/kiem_tra.py --nhanh`: `Không có lỗi.`
- `python tools/kiem_van.py` 3 file đã sửa: 0 ĐỎ (1 VÀNG ở `ChungTuForm.tsx` dòng cũ, không thuộc việc này).
- Mở màn trên máy, gói Plus, rộng 1500px: lọc Khoản thu chỉ còn phiếu thu tiền mặt, thu ngân hàng; mở FBTC261002-02 không có nút Sửa, Tiện ích chỉ còn Sao chép, Xuất Excel.
- Chưa kiểm bằng tay menu Hàng loạt với phiếu FABi. Chưa sửa bản điện thoại (T281 của Trum đang sửa `src/ui/mobile/*`).

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- Không.
