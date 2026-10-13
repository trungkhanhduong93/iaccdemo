# Mở lại báo cáo theo danh sách iFaster (T185)

- Ngày: 13/10/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- PhuongXT đưa ảnh màn Báo cáo của iFaster (itaxdev.ipos.vn), chọn các nhóm Quỹ tiền, Công nợ, Quản trị, Kho, Mua hàng, Bán hàng. PhuongXT chốt: mở mọi gói (ẩn bớt sau), Sổ quỹ tiền mặt, Sổ ngân hàng giữ như cũ, công nợ gộp một sổ, không đổi màn Báo cáo sang dạng ô nhóm như iFaster, khung báo cáo giữ như IACC.
- Đối chiếu tên iFaster với mã IACC: Tổng hợp quỹ tiền 2.2.8, Báo cáo dòng tiền 2.2.9, Công nợ nhà cung cấp, khách hàng gộp vào Sổ công nợ 2.2.5, Báo cáo kết quả kinh doanh 10.2.3, Sổ chi phí 10.4.3, Nhập xuất tồn 5.2.3, Tổng hợp, Chi tiết xuất kho 5.2.11, 5.2.12, Tổng hợp, Chi tiết nhập kho 5.2.9, 5.2.10, Báo cáo mua hàng 4.2.2, Chi tiết mua hàng 4.2.1, Mua hàng theo ngày 4.2.6, Báo cáo bán hàng 3.2.7, Chi tiết bán hàng 3.2.8, Bán hàng theo ngày 3.2.6. Tên màn giữ tên IACC.
- `src/modules/bao-cao/danh-sach.ts`: thêm `MO_IFASTER` (16 mã trên), `giuBC` giữ các mã này ở mọi chế độ.
- `src/app/registry.ts`: `apDung` cho qua các mã `MO_IFASTER` không xét `anTam`, `cheDo`, `th`, `hkd` (2.2.5, 10.2.3 trước bị ẩn tạm ở TT133, TT99, lọc theo trường hợp thuế TT58). `conBaoCao`: phân hệ ẩn ở gói mà còn báo cáo hiện được thì nhóm báo cáo vẫn hiện.
- `src/modules/bao-cao/TrungTam.tsx`: `layNhomBaoCao` giữ nhóm của phân hệ ẩn ở gói khi còn báo cáo hiện được; gói Free thấy nhóm Kế toán tổng hợp (Báo cáo kết quả kinh doanh, Sổ chi phí) dù phân hệ Tổng hợp ẩn trên thanh trái.
- `src/modules/ban-hang/index.ts`, `src/modules/kho/index.ts`: báo cáo mới 3.2.6 đến 3.2.8, 5.2.9 đến 5.2.14 bỏ giới hạn `goi: ['S', 'PL', 'PR']` để gói Free mở được (5.2.13, 5.2.14 vẫn ẩn vì không nằm trong danh sách giữ).
- `docs/KIEN-TRUC.md`: ghi quy ước `MO_IFASTER`.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi. `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- Script Playwright tạm mở Tất cả báo cáo rồi từng báo cáo ở 4 gói: Free 18, Standard (TT58) 26, Plus 18, Pro 18 báo cáo; không trang trắng, không lỗi console, không màn "không dùng", "Nâng cấp".

## Dở dang, việc tiếp theo

- PhuongXT sẽ báo báo cáo nào cần ẩn ở gói nào: bỏ mã khỏi `MO_IFASTER` hoặc thêm điều kiện lọc.
- Chưa chạy `python tools/xuat_bao_cao_he_thong.py` (máy này thiếu `../Present/tools/build_present`, xem nhật ký T171).

## Bẫy, quyết định mới

- Không.
