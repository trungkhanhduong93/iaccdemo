# Điện thoại: bỏ thứ ở ngày, thu chi nhanh chọn quỹ, chi phí NVL, ngày kiểm kê cuối (T611)

- Ngày: 21/10/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- Bỏ thứ trong ngày ở danh sách, báo cáo điện thoại: `MBangKeMua.tsx`, `MDsChungTuChuan.tsx`, `MChungTu.tsx`, `MDtThuChiDs.tsx`, `MSoBaoCao.tsx`, `MSoTT152.tsx`, `MLichSu.tsx`, `MLichSuQuy.tsx`. Hàm `dinhDangThuNgay` giữ tên, chỉ trả ngày tháng. Web (`LichSuQuy.tsx` hàm `tenNgay`) giữ nguyên.
- Thao tác nhanh Thu tiền, Chi tiền ở `MTrangChu.tsx`, `MTrangChuFree.tsx`: bấm mở bảng chọn Tiền mặt, Tiền gửi ngân hàng (`MChonLoaiTien.tsx`), ngân hàng thì lập phiếu `loai=bc`, `loai=unc`.
- `src/app/tuTrangChu.ts`: liên kết có thuộc tính `data-tu-mo` thì vùng trang chủ không tự chuyển màn, để ô thu chi mở được bảng chọn.
- `MTrangChuFree.tsx`: dòng phụ Chi phí nguyên vật liệu dùng `moTaCachNgan`, thay chữ cứng "Theo giá thành iPOS Inventory".
- `MChiPhiNvl.tsx`: dòng cách tính như web (tên, mô tả, nút Đổi cách tính); nút mở bảng chọn 3 cách tính (`MChon`) rồi hộp xác nhận như Danh mục cửa hàng; tháng đã khoá sổ chỉ xem. Cách nhập tay có ô nhập giá thành từng món (`datGiaThanhTay`), báo số món chưa có giá. Bấm cửa hàng trong danh sách đặt `cuaHang` của phiên, thanh đầu và tiêu đề đổi theo.
- `MKhoFree.tsx`: tiến độ kiểm kê theo cửa hàng ghi ngày kiểm kê cuối (dd/MM) thay "lệch n", giống `DongKkCn` ở web.
- CSS mục T611 cuối `app.css`.
- Thêm mới chứng từ khi đang xem Tất cả cửa hàng: trang chủ Free lưu Tất cả thành `undefined` nên bước chặn T418 (chỉ so `=== 'all'`) không chạy, form lấy `CUA_HANG[0]`. Sửa: `MTrangChuFree.tsx` lưu `all`; `MobileShell.tsx`, `MChungTu.tsx`, `MDtThuChiDs.tsx` coi rỗng là Tất cả; `MobileShell.tsx` không dựng `<Outlet />` khi URL tạo phiếu đang chờ chọn cửa hàng, để form lấy đúng cửa hàng vừa chọn; bộ bắt click của `MobileShell.tsx` bỏ qua liên kết có `data-tu-mo`, để ô thu chi nhanh hỏi quỹ trước rồi mới hỏi cửa hàng.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- `python tools/kiem_van.py` cho `MChiPhiNvl.tsx`, `MChonLoaiTien.tsx`, `MKhoFree.tsx`: sạch.
- Trình duyệt 390x844, gói Free: bấm Chi tiền ra bảng chọn, chọn ngân hàng mở Chi ngân hàng; đổi Nguyễn Trãi sang nhập tay ra 9 ô giá thành, dòng trang chủ ghi "Theo giá thành nhập tay"; tiến độ kiểm kê ghi "06/10"; danh sách thu chi không còn thứ. Thử xong đã trả phiên về gói Plus.
- Trình duyệt, gói Free, Tất cả cửa hàng: Thu tiền, chọn ngân hàng, hỏi cửa hàng, chọn Thảo Điền ra phiếu Thu ngân hàng của Thảo Điền; Nhập mua hỏi cửa hàng, phiếu mua ghi Thảo Điền.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- Không ghi bẫy mới. Lưu ý trong nhật ký này: trang chủ điện thoại phải lưu Tất cả cửa hàng là `'all'` như `Topbar.tsx`, không để rỗng.
- Đã chọn cửa hàng một lần trong tab thì lần thêm mới sau dùng luôn cửa hàng đó, không hỏi lại (T526, Trum chốt), nên giữ nguyên.
