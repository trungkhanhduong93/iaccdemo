# Chứng từ chỉ ghi ngày, kiểm kê giữ giờ phút (T823)

- Ngày: 13/11/2026
- Người: dinhlanphuongipacc, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/ui/generic/VoucherScreen.tsx`: cột Ngày chỉ hiện ngày; màn có `kiemKe` vẫn hiện ngày giờ như cũ. Người dùng cho sửa dù Trum giữ ở T496.
- `src/ui/generic/ChungTuForm.tsx`: ngày chứng từ mở, lưu chỉ còn ngày; phiếu sản xuất, điều chuyển bỏ giờ (trước có từ T152); phiếu kiểm kê lấy giờ hiện tại, đổi ngày trên lịch giữ giờ. Nhãn "Thời gian xuất/nhập" đổi thành "Ngày xuất/nhập", kiểm kê là "Thời gian kiểm kê".
- `src/ui/bao-cao/duLieuIn.ts`: mọi mẫu in chỉ in ngày (bỏ biến `boGio`), riêng `bien-ban-kiem-ke` giữ giờ, kể cả ô Thời điểm kiểm kê.
- `src/modules/kho/dieu-chuyen.ts`, `san-xuat.ts`: dữ liệu mẫu tách giờ sang trường `gio`, `ngay` chỉ còn ngày; ngày tạo, cập nhật vẫn có giờ.
- `src/modules/kho/PhieuSanXuat.tsx`, `PhieuDieuChuyen.tsx`: cột "Thời gian" đổi thành "Ngày"/"Ngày xuất"/"Ngày nhập", danh sách bỏ giờ nếu phiếu cũ còn giờ.
- `src/modules/ban-hang/ChungTuBanHang.tsx`, `src/ui/mobile/MXuatBanPos.tsx`: chứng từ Xuất bán POS chỉ ghi ngày (giờ đơn POS vẫn ở `gio` và trong diễn giải); ô "Thời gian xuất" đổi thành "Ngày xuất".
- `src/ui/mobile/MChungTu.tsx`: danh sách chỉ hiện ngày, phiếu kiểm kê hiện ngày giờ.
- `src/ui/mobile/MLapPhieuKho.tsx`: ô "Thời gian" (ngoài kiểm kê) đổi thành "Ngày chứng từ", chỉ hiện ngày.
- `src/ui/mobile/MXemPhieu.tsx`: phiếu thu chi "Ngày lập", chứng từ khác "Ngày chứng từ" chỉ hiện ngày; khối kiểm kê giữ nguyên. Người dùng cho sửa dù Trum giữ ở T498.

## Đã kiểm

- `npm run typecheck`: không lỗi.
- `npm run build`: chạy xong, không lỗi.
- `python tools/kiem_tra.py --nhanh`: xem kết quả ở mục Dở dang nếu không in "Không có lỗi.".

## Dở dang, việc tiếp theo

- Không.
- Điện thoại vẫn lưu trường `gio` ẩn cho mọi phiếu (MLapPhieu, MLapPhieuKho), không còn chỗ nào hiện ra ngoài kiểm kê.
- Commit chỉ nằm trên máy, chưa push: người dùng dặn khi nào bảo mới push.

## Bẫy, quyết định mới

- Không.
