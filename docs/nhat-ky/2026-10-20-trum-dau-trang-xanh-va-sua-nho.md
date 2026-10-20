# Đầu trang xanh Nghiệp vụ, Khác và các sửa nhỏ giao diện (T505)

- Ngày: 20/10/2026
- Người: Trum, agent: Claude Code (điều phối), Antigravity (2 đợt)
- Trạng thái cuối phiên: Xong

## Đã làm

- Điện thoại, `MNghiepVu.tsx`: đầu trang nền xanh dùng lại class `m-bc-hdr-*` của danh sách Báo cáo. Có tiêu đề, chip gói, dòng "N nghiệp vụ · M nhóm", ô tìm. Xoá CSS cũ `.m-t498-nv-header`, `.m-t498-nv-tieu-de`, `.m-t498-nv-tim-*`.
- Điện thoại, `MKhac.tsx`: đầu trang nền xanh, dòng "N danh mục · M thiết lập", ô tìm lọc dòng Danh mục, Thiết lập (dùng `fold`, gõ không dấu được). Ẩn thanh trên "Khác" bằng `.m-app:has(.m-khac) .m-thanh-tren`.
- Điện thoại, `MTrangChuFree.tsx`: dòng Doanh thu, Lợi nhuận của bảng Kết quả kinh doanh thêm mũi tên ẩn `.m-tcf-mui-an` giữ chỗ, số tiền thẳng cột với 3 dòng chi phí.
- Web, `TongQuan.tsx`: ô chọn năm trang chủ Free `minWidth` 96 lên 124 để bằng menu xổ.
- Web, `VoucherScreen.tsx`: cột STT danh sách chứng từ đổi tiêu đề thành "#", rộng 44. Dòng tổng chân cột chỉ ghi số dòng, Trum chốt.
- Web, `LocCot.tsx`: ô lọc cột phân loại bỏ `onClick` mở bảng chọn. Bấm ô chỉ để gõ, bấm phễu mới mở. Ô ngày giữ nguyên, bấm vào mở lịch (Trum chốt).
- Web, `BaBaiToanFree.tsx`: khối Mua hàng và Hao hụt kiểm kê bỏ link chữ, thay bằng nút "Xem sổ" xổ menu giống khối Quỹ tiền. Hàng nút "Tạo quỹ", "Tất cả quỹ" căn giữa.
- Web, `app.css`: `.ct-than-card > .ct-than` thêm lề 0 12px để lưới chi tiết phiếu thẳng lề tab Chi tiết, không tràn khung.

## Đã kiểm

- `npm run typecheck`, `npm run build`: chạy xong, không lỗi.
- `python tools/kiem_tra.py --nhanh`: `Không có lỗi.` Lần chạy đầu báo lỗi `Cannot access 'home' before initialization` do Vite nạp lại nóng đúng lúc phiên khác sửa file. Chạy lại thì sạch.
- `python tools/kiem_van.py` cho `MKhac.tsx`, `MNghiepVu.tsx`, `BaBaiToanFree.tsx`, `VoucherScreen.tsx`: sạch.
- Anti chụp ảnh trước và sau ở khung 390x844, 1440x900, tự xem. Claude chỉ đọc diff, không xem ảnh.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- Không. Ghi chú: phiên T500 chạy chung thư mục `D:\IACC-CLOUD\Web` cùng lúc, trái QD21. Lần sau mỗi phiên một bản clone.
