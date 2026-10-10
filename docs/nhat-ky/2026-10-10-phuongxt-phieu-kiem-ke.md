# Làm lại phiếu kiểm kê (T124)

- Ngày: 10/10/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `modules/types.ts`: `VoucherCfg.kiemKe`. `kho/index.ts`: màn 5.1.10 bật `kiemKe` qua hàm `kiemKe(phieu(...))`.
- `gen.ts`: `Dong` thêm `tonHt`, `tonTt`, `ghiChu`. Phiếu kiểm kê mẫu: tồn thực tế bằng số lượng, tồn hệ thống lệch -2 tới +2 ở khoảng nửa số dòng, ghi chú theo chiều lệch.
- `gen.ts` (`chungTu`): 26 phiếu kiểm kê mẫu chia lần lượt cho các chi nhánh (trước bốc ngẫu nhiên nên tháng 10 chi nhánh Nguyễn Trãi không có phiếu nào). Kho, ghi chú lấy theo kho của chi nhánh, vd "Kiểm kê đột xuất Kho bếp Nguyễn Trãi".
- `BangKiemKe.tsx` (mới): bảng #, Mã hàng, Tên hàng hoá, ĐVT, Tồn hệ thống (không sửa tay), Tồn thực tế (gõ được), Chênh lệch (thực tế trừ hệ thống, thiếu đỏ, thừa xanh), Loại (thiếu thì Xuất điều chỉnh, thừa thì Nhập điều chỉnh, bằng nhau ghi Khớp), Ghi chú. Dòng tổng đếm số dòng thiếu, thừa. `COT_KK` cho Tuỳ chỉnh giao diện.
- `ChungTuForm.tsx` (`laKk`): bỏ cột Đối tượng, Người giao nhận, Địa chỉ; đầu phiếu gọn hai dòng: dòng 1 Kho kiểm kê (kho của chi nhánh lập phiếu), Nhân viên thực hiện; dòng 2 Ghi chú; cột phải Ngày, Số biên bản. Bỏ dải tổng tiền, tab Hạch toán, nút Cột tài khoản; tab Đính kèm theo luật chung (gói Free không có). Tab Chi tiết dùng `BangKiemKe`.
- `VoucherScreen.tsx`: khung chi tiết dưới danh sách dùng `BangKiemKe` cho phiếu kiểm kê, không có tab Hạch toán. Danh sách phiếu kiểm kê bỏ cột Tiền thuế, Tổng tiền, thêm Kho, Số mặt hàng (số dòng của phiếu); tổng cộng cộng số mặt hàng.
- `ChonDanhMuc.tsx`: thêm `chiMa`, ô đã chọn chỉ hiện mã, danh sách thả xuống vẫn hiện mã - tên. Dùng ở cột Mã hàng của phiếu kiểm kê và mọi phiếu (`BangSua`), vì tên đã có cột riêng.
- `app.css`: mục cuối "Phiếu kiểm kê: chênh lệch, loại xử lý (T124)".

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- Xem trên trình duyệt: form thêm mới gói Free, phiếu KK2610-0255 gói Plus (dòng thừa 1 ghi Nhập điều chỉnh).
- `python tools/xuat_bao_cao_he_thong.py` không chạy được trên máy này (thiếu `../Present/tools/build_present`), chưa làm mới file Excel.

## Dở dang, việc tiếp theo

- Phiếu kiểm kê chưa tự sinh phiếu xuất, nhập điều chỉnh.

## Bẫy, quyết định mới

- Không.
