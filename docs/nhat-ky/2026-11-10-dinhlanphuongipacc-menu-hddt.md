# Menu Hoá đơn điện tử 3 tab (T786)

- Ngày: 10/11/2026
- Người: dinhlanphuongipacc, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- Phân hệ mới `src/modules/hoa-don/` (key `hoa-don`, nhãn Hoá đơn), xếp ngay trên Kê khai thuế trong `src/app/registry.ts`. Ba tab: Hoá đơn điện tử (`hddt`), Điều chỉnh thay thế (`dieu-chinh`), Thông báo sai sót (`sai-sot`); mở theo mã 3.1.5, 3.1.6 nên chỉ có ở gói Plus, Pro.
- Bỏ tab 3.1.5, 3.1.6 ở `src/modules/ban-hang/index.ts` (lọc `CHUYEN_DI`). Sơ đồ quy trình Bán hàng, Kê khai thuế trỏ sang menu mới. `SidebarFlyout.tsx` thêm khối `hoa-don`, bỏ 2 link cũ ở Bán hàng.
- Tab Hoá đơn điện tử (`HoaDonDienTu.tsx`, `DsHoaDon`): lọc thời gian, tìm nhanh (số HĐ, tên đơn vị, MST, người mua), chip Tất cả, Dự thảo, Đã phát hành, hàng lọc từng cột, chọn cột, xuất Excel. Đủ cột theo bản thiết kế. Menu ⋯ ở cột Thao tác ghim phải, chức năng không hợp lệ thì mờ, rê chuột thấy lý do (`lyDo`). Chọn nhiều chỉ Gửi CQT, Tải XML, Tải PDF, bỏ qua dòng không đủ điều kiện. Gửi CQT chỉ với ký hiệu chữ M ở vị trí thứ 4. Điều chỉnh, Thay thế báo "làm ở T787". Tạo TBSS mở popup nhập nội dung, lưu nháp sang tab Thông báo sai sót.
- Dữ liệu tab 1 lấy từ chứng từ bán hàng lập tay đã phát hành (`ban-hang/3-1-1` gói Plus, `ban-hang/3-1-7` gói Pro), không hiện huỷ bán (số bắt đầu HBH). Hai chứng từ mẫu BH2610-0003 (ký hiệu C26TAA), BH2610-0002 (C26MAB, máy tính tiền) có sẵn hoá đơn đã phát hành qua `hdMau` trong `hddt.tsx`, gọi ở `hangTay` (`ChungTuBanHang.tsx`), nên danh sách bán hàng cũng hiện Đã xuất cho 2 chứng từ này.
- Tab Điều chỉnh thay thế: bảng cặp hoá đơn gốc và hoá đơn mới, dữ liệu mẫu, nút Xem mở popup xem hoá đơn, Gửi CQT chỉ với ký hiệu M chưa gửi. Tab Thông báo sai sót: lọc Trạng thái gửi CQT, chọn dòng, Gửi CQT và Xoá chỉ bật với thông báo lưu nháp.
- CSS mục "Menu Hoá đơn điện tử (T786)" cuối `src/styles/app.css`.
- Sửa thêm theo góp ý dinhlanphuongipacc: cả 3 tab gộp Mẫu số và Ký hiệu thành một cột "Mẫu số - Ký hiệu" (vd 1C26TAA) như màn xuất; ký tự đầu là mẫu số, 6 ký tự sau là ký hiệu. Chip trạng thái xếp Tất cả, Đã phát hành, Dự thảo.

## Đã kiểm

- `npm run typecheck`: không lỗi.
- `npm run build`: chạy xong, không lỗi.
- `python tools/kiem_tra.py --nhanh`: "Không có lỗi." Lần sửa thêm có một lần báo lỗi tour điện thoại màn Kiểm kê (`dataset` của null), chạy lại thì hết, màn này không liên quan T786.
- `python tools/kiem_van.py` cho `HoaDonDienTu.tsx`, `hoa-don/index.ts`, `SidebarFlyout.tsx`, nhật ký này: sạch.
- Chưa mở trình duyệt xem bằng mắt (QD75), chỉ kiểm bằng `kiem_tra.py`.

## Dở dang, việc tiếp theo

- Không. Việc tiếp là T787: thay `toast` "làm ở T787" ở `lam()` trong `src/modules/hoa-don/HoaDonDienTu.tsx` bằng mở form điều chỉnh, thay thế; thêm dòng Dự thảo, Hoá đơn điều chỉnh, thay thế, cột Hoá đơn gốc vào `dongHd`; tab Điều chỉnh thay thế đổi `CAP_MAU` sang dữ liệu thật.
- Trạng thái đã gửi CQT, thông báo sai sót chỉ giữ trong phiên, tải lại trang là mất.
- `tools/xuat_bao_cao_he_thong.py` vẫn chưa chạy được trên máy này (thiếu module `build_present`), chưa làm mới `docs/IACC-Cloud-Chi-Tiet-He-Thong.xlsx`.

## Bẫy, quyết định mới

- Không.
