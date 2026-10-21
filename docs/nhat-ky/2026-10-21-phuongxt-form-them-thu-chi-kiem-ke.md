# Thu chi, kiểm kê điện thoại: bảng chọn, form thêm mới theo phiếu mua (T604)

- Ngày: 21/10/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- Tạo `src/ui/mobile/MThemNhanh.tsx`: sheet thêm nhanh danh mục dùng chung, cùng bố cục sheet Thêm nhà cung cấp của phiếu mua (`MLapPhieu.tsx`, T600). Nhận danh sách ô (chữ, chip, ô tích, ô `ngan` đứng cạnh ô sau), nút Huỷ, Lưu và chọn.
- `MDtThuChiLap.tsx`: bảng Chọn đối tượng làm theo bảng Chọn nhà cung cấp (ô tìm, thanh Thêm mới, Tải lại, số đối tượng, dòng có ô chữ viết tắt, mã · loại · MST). Giữ hàng chip lọc Nhà cung cấp, Nhân viên, Khách hàng vì thu chi chọn cả 3 loại.
- `MDtThuChiLap.tsx`: bảng Chọn lý do thu, chi bỏ `MChon`, làm cùng kiểu bảng nhà cung cấp, dòng phụ ghi mã lý do · Thu tiền/Chi tiền.
- `MDtThuChiLap.tsx`: form Thêm đối tượng, Thêm lý do bỏ `MFormDm`, dùng `MThemNhanh`. Mã để trống thì tự sinh bằng `sinhMaKeTiep`. Lý do chi có ô Là chi phí, nhóm lý do tự xếp qua `doi` của cấu hình 1.16.
- `MLapPhieuKho.tsx`: phiếu kiểm kê có sheet chọn hàng riêng theo sheet chọn hàng phiếu mua (tích tạm, nút Thêm n dòng, nhãn "đã có trong phiếu"). Phiếu nhập, xuất kho giữ sheet cũ.

## Đã kiểm

- `npm run typecheck`: không lỗi. `npm run build`: chạy xong, không lỗi.
- `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- `python tools/kiem_van.py` các file đã sửa: 0 ĐỎ.
- Bấm thử ở khổ 390×844: thêm đối tượng lưu xong chọn luôn vào phiếu; bảng lý do hiện 35 lý do chi; kiểm kê tích 2 hàng, bấm Thêm 2 dòng thì phiếu có thêm 2 dòng.
- Chưa bấm thử luồng lưu Thêm lý do trên trình duyệt, chỉ kiểm qua typecheck.
- `python tools/xuat_bao_cao_he_thong.py` không chạy được trên máy PhuongXT: thiếu file `Dự kiến tính năng IACC Cloud.xlsx` (chỉ máy Trum có). Báo cáo hệ thống chưa làm mới cho T604.

## Dở dang, việc tiếp theo

- Không.
- Form Tạo mới hàng hoá ở kiểm kê vốn dùng chung `MFormDm` với phiếu mua nên không đổi.

## Bẫy, quyết định mới

- Không.
