# Cảnh báo khoản chờ tạo thẻ, Tạo thẻ bổ sung trên điện thoại (T827)

- Ngày: 13/11/2026
- Người: dinhlanphuongipacc, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- Bản mẫu duyệt trước trên artifact (canvas "Cảnh báo khoản chờ tạo thẻ"). dinhlanphuongipacc chốt: hoá đơn mua hàng nhiều dòng thành **một thẻ nhiều mục**; phiếu chi giữ như web, mỗi dòng một thẻ.
- `src/modules/ccdc/GhiTangHangLoat.tsx`: xuất `useDongCho`, kiểu `DongGoc` (thêm `cn` cửa hàng của chứng từ), hàm `danhDauDaTao` để điện thoại dùng chung danh sách khoản chờ với web.
- `src/ui/mobile/MTaoTheBoSung.tsx` (mới): `useKhoanCho(ky)` lấy khoản chờ tới hết kỳ đang xem (như dải cảnh báo web). Màn Tạo thẻ bổ sung: gom dòng của cùng hoá đơn mua hàng thành một thẻ nhiều mục, Loại thẻ và ngày phân bổ chung, mỗi mục một số tháng; còn lại mỗi dòng một thẻ. Tích chọn từng thẻ, Chọn tất cả, đổi Loại thẻ (sheet), ngày phân bổ (lịch), số tháng; mọi dòng là công cụ dụng cụ thì mặc định loại CCDC. Kiểm thiếu số tháng, ngày phân bổ trước ngày chứng từ. Số thẻ nối tiếp như web. Tạo xong đánh dấu khoản đã tạo, ghi `_theCp` vào chứng từ gốc.
- `src/ui/mobile/MCcdc.tsx`: khu tổng hợp danh sách thẻ có dải vàng "n khoản chờ tạo thẻ · tổng tiền" và nút Tạo thẻ bổ sung; hết khoản chờ thì dòng gợi ý xám. Thẻ tạo ra thêm vào danh sách và `theTaoPhien`.
- `src/styles/app.css`: mục T827 cuối file.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi. `python tools/kiem_tra.py --nhanh`: Không có lỗi. `kiem_van.py` 3 file: sạch.
- Trình duyệt 375x812, gói Plus, màn `ccdc/8-1-1`: dải cảnh báo "10 khoản chờ tạo thẻ · 138.300.000 đ". Màn Tạo thẻ bổ sung: phiếu chi mẫu mỗi dòng một thẻ, HDM2610-0253 và các hoá đơn mẫu 2 dòng gom một thẻ 2 mục. Bỏ chọn tất cả, chọn HDM2610-0253, bấm Tạo khi thiếu số tháng thì viền đỏ; nhập 24, 12 tháng, tạo ra TPB2610-0012 loại Công cụ dụng cụ, Mục phân bổ (2), cảnh báo còn 8 khoản.

## Dở dang, việc tiếp theo

- Không.
- Nút Ghi tăng bổ sung trên web vẫn tạo mỗi dòng hoá đơn một thẻ, khác điện thoại (một thẻ nhiều mục). Đổi web cho khớp là việc riêng, cần dinhlanphuongipacc hoặc Trum chốt.
- Phiếu chi nhiều dòng chờ phân bổ (vd UNC2610-0245) vẫn mỗi dòng một thẻ ở cả web và điện thoại.
- Form thẻ khi lưu hoá đơn trên điện thoại rồi bấm Tiếp tục (`MCcdc.tsx`, form Thêm thẻ chi phí) vẫn một mục, chưa đọc `tuPhieu.loai` (ghi ở T826).
- Thẻ tạo trên điện thoại chỉ giữ trong phiên (như các thẻ thêm tay khác), web không thấy.
- `MCcdc.tsx` Trum đang giữ ở T552; việc này dinhlanphuongipacc duyệt làm.
- `python tools/xuat_bao_cao_he_thong.py` chưa chạy được (thiếu `build_present`).
- Chưa lấy được 2 commit T818 mới trên GitHub: `git pull --rebase` xung đột ở `docs/TIEN-DO.md` (dòng T818 bên kia đã xoá, bên này thêm dòng T826), đã huỷ rebase, chờ dinhlanphuongipacc cho gộp.
- Commit chỉ nằm trên máy, chưa push: người dùng dặn khi nào bảo mới push.

## Bẫy, quyết định mới

- Không.
