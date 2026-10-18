# Chia tab Thu, chi tiền thành Tiền mặt, Ngân hàng, Chuyển quỹ (T386)

- Ngày: 18/10/2026
- Người: dinhlanphuongipacc, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `modules/types.ts`: `VoucherCfg` thêm `nhomLoai` (tab con gom loại phiếu), `LoaiCT` thêm `nut` (chữ trên nút thêm khi tab có nhiều loại).
- `tien/index.ts`: màn 2.1.1 khai 3 tab con Tiền mặt (thu, chi), Ngân hàng (bc, unc), Chuyển quỹ (cq); nút của thu, bc là "Thu tiền", của chi, unc là "Chi tiền".
- `VoucherScreen.tsx`: thanh tab con ở hàng 2 thanh công cụ (dùng lại kiểu `seg dc-tabs` của Kiểm kê), danh sách lọc theo loại của tab, ô lọc Loại phiếu chỉ còn loại trong tab. Tab có nhiều loại thì mỗi loại một nút thêm, tab một loại thì một nút "Thêm chuyển quỹ". `?loai=` mở đúng tab chứa loại đó.
- Thanh tab của phân hệ sinh từ `features.json` (không sửa tay), nên 3 tab làm trong màn chứ không thành tab phân hệ.

## Đã kiểm

- `npm run typecheck`, `npm run build`: chạy xong, không lỗi.
- `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- Mở thử gói Pro: 3 tab đổi đúng danh sách, nút Thu tiền, Chi tiền trỏ `?loai=thu/chi` (Tiền mặt), `bc/unc` (Ngân hàng); mở form Chi tiền mặt đúng tiêu đề, console không lỗi.
- Chưa kiểm bản điện thoại (không đổi phần điện thoại).
- Chưa làm mới `docs/IACC-Cloud-Chi-Tiet-He-Thong.xlsx`: `tools/xuat_bao_cao_he_thong.py` cần thư mục `Present/tools` (`build_present.py`) cạnh repo, máy này không có.

## Dở dang, việc tiếp theo

- Máy có thư mục `Present/tools` chạy `python tools/xuat_bao_cao_he_thong.py` để file Excel có dòng T386.

## Bẫy, quyết định mới

- Không.
