# Chia tab Thu, chi tiền thành Tiền mặt, Ngân hàng, Chuyển quỹ (T386)

- Ngày: 18/10/2026
- Người: dinhlanphuongipacc, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `modules/types.ts`: `VoucherCfg` thêm `nhomLoai` (tab con gom loại phiếu), `LoaiCT` thêm `nut` (chữ trên nút thêm khi tab có nhiều loại).
- `tien/index.ts`: màn 2.1.1 khai 3 tab con Tiền mặt (thu, chi), Ngân hàng (bc, unc), Chuyển quỹ (cq); nút của thu, bc là "Thu tiền", của chi, unc là "Chi tiền".
- `VoucherScreen.tsx`: thanh tab con ở hàng 2 thanh công cụ (dùng lại kiểu `seg dc-tabs` của Kiểm kê), danh sách lọc theo loại của tab, ô lọc Loại phiếu chỉ còn loại trong tab. Tab có nhiều loại thì mỗi loại một nút thêm, tab một loại thì một nút "Thêm chuyển quỹ". `?loai=` mở đúng tab chứa loại đó.
- Lần 2 (cùng ngày, theo góp ý của người dùng): bỏ dải tab con trong màn, đưa 3 tab lên thẳng thanh tab phân hệ thay tab "Thu, chi tiền". `features.json` không sửa tay nên vẫn là một màn 2.1.1: `ModuleTabs.tsx` tách màn có `nhomLoai` thành mỗi nhóm một tab, đường dẫn `2-1-1?nhom=tm|nh|cq`; `registry.ts` thêm `nhomDangMo` (theo `?nhom=`, không có thì theo nhóm chứa `?loai=`, không có nữa thì Tiền mặt). Các đường dẫn cũ `2-1-1/moi?loai=...` vẫn chạy.

## Đã kiểm

- `npm run typecheck`, `npm run build`: chạy xong, không lỗi.
- `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- Lần 2: mở thử gói Pro và Free, thanh tab phân hệ hiện Tiền mặt, Ngân hàng, Chuyển quỹ, tab đang mở sáng đúng, danh sách 20 / 13 / 5 dòng, nút đúng theo tab; `kiem_tra.py --nhanh`: Không có lỗi.
- Lần 1, mở thử gói Pro: 3 tab đổi đúng danh sách, nút Thu tiền, Chi tiền trỏ `?loai=thu/chi` (Tiền mặt), `bc/unc` (Ngân hàng); mở form Chi tiền mặt đúng tiêu đề, console không lỗi.
- Chưa kiểm bản điện thoại (không đổi phần điện thoại).
- Chưa làm mới `docs/IACC-Cloud-Chi-Tiet-He-Thong.xlsx`: `tools/xuat_bao_cao_he_thong.py` cần thư mục `Present/tools` (`build_present.py`) cạnh repo, máy này không có.

## Dở dang, việc tiếp theo

- Máy có thư mục `Present/tools` chạy `python tools/xuat_bao_cao_he_thong.py` để file Excel có dòng T386.

## Bẫy, quyết định mới

- Không.
