# Thêm đơn vị kế toán theo onboard mới (T138)

- Ngày: 29/10/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Dở dang

## Đã làm

- Thêm đơn vị kế toán (màn Chọn đơn vị, menu đơn vị trên thanh trên) dùng chung popup kết nối 1 bước như mở từ FABi: chọn cửa hàng, ngày bắt đầu làm việc, tiền FABi về quỹ nào. Bỏ 3 bước cũ. Web và điện thoại chung popup (`OnboardFabi.tsx`, `nhanh = !n.thue`).
- Danh sách cửa hàng chỉ có cửa hàng FABi chưa dùng kế toán, kèm câu đã ẩn bao nhiêu cửa hàng ở đơn vị khác.
- Thêm đơn vị kế toán xong không hiện hướng dẫn từng bước (đặt `huongDan` của đơn vị là true); kết nối từ FABi vẫn hiện. Nút la bàn vẫn mở lại được.
- Popup kết nối (từ FABi lẫn Thêm đơn vị kế toán) có nút Để sau: bỏ đơn vị mới, trả phiên về như trước khi mở (`Nhap.truoc`), về màn trước. Từ FABi về `/khoi-tao-fabi`, giữ đăng nhập; Thêm đơn vị về màn đang mở lúc bấm.
- Mô tả mục Thêm đơn vị kế toán ở menu (`Topbar.tsx`): "Kết nối cửa hàng FABi chưa dùng kế toán".

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi. `python tools/kiem_tra.py --nhanh`: Không có lỗi. `kiem_van.py` 2 file đã sửa: Sạch.
- Script Playwright tạm ở 1440×900 và 390×844: bấm Thêm đơn vị kế toán ra popup Kết nối dữ liệu FABi, bấm Kết nối và lấy dữ liệu về Trang chủ, `huongDan` của đơn vị mới là true, không lỗi console.
- Chưa xem bằng mắt trên Chrome thật. Chưa xuất lại `docs/IACC-Cloud-Chi-Tiet-He-Thong.xlsx`: thiếu file nguồn trên máy PhuongXT.

- Script Playwright tạm cho nút Để sau: từ FABi (đã và chưa đăng nhập), Thêm đơn vị từ màn Chọn đơn vị và từ menu, ở 1440×900 và 390×844. Đều về đúng màn, đơn vị cũ, không còn đơn vị mới.
## Dở dang, việc tiếp theo

- PhuongXT, Trum xem bản online, góp ý tiếp. Các mục dở của `2026-10-29-phuongxt-lam-lai-onboard-fabi.md` vẫn còn.
- Nhánh 3 bước cũ (không `nhanh`, không `thue`) trong `xong()` giờ không còn đường vào; để nguyên, dọn khi chốt hẳn.

## Bẫy, quyết định mới

- Không ghi vào `docs/BAY.md`. Ghi chú: lưu phiên cũ vào localStorage bằng JSON thì trường `undefined` bị rơi, nên `deSau` xoá rõ `dvMoi`, `cnThem`, `dungThu` trước rồi mới trả giá trị cũ.
