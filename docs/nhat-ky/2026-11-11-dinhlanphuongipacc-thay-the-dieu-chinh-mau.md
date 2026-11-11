# Chặn thay thế, điều chỉnh sai; hoá đơn mẫu thay thế, điều chỉnh (T794, T795)

- Ngày: 11/11/2026
- Người: dinhlanphuongipacc, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- T794, `src/modules/ban-hang/hddt.tsx` hàm `lyDoKhongLap`: hoá đơn gốc đã bị điều chỉnh (hoá đơn điều chỉnh đã phát hành) không cho Thay thế; hoá đơn thay thế không cho Điều chỉnh, báo lý do riêng.
- T795, `ChungTuBanHang.tsx`: thêm 4 chứng từ gốc mẫu `tay-10` đến `tay-13` (BH2610-0010 đến 0013) và mảng `MAU_HD_MOI`: HDTT2610-0001 đã phát hành (kèm huỷ bán HBH2610-0001), HDDC2610-0001 đã phát hành, HDTT2610-0002 dự thảo (kèm HBH2610-0002), HDDC2610-0002 dự thảo. `mauTay()` giờ nhớ kết quả, chạy một lần.
- T795, `hddt.tsx`: `dkCtMau` cho màn bán hàng đăng ký chứng từ mẫu, `ctMoi` tìm cả trong mẫu nên `ttHdGoc`, `thayTheNhap` nhận ra hoá đơn mẫu. `HD_MAU` thêm số 119, 120, 125, 126 (gốc), 127, 128 (mới). `hdMau` điền mẫu số, ký hiệu hoá đơn gốc theo gói; dự thảo mẫu lấy ký hiệu, tiền, khách như form lập. Thêm `soHdMau`, `hdMoiNhap`.
- T795, `HoaDonDienTu.tsx`: "Hoá đơn bị thay thế", "Hoá đơn bị điều chỉnh" ở cột Loại hoá đơn; cột Trạng thái HĐĐT chỉ Dự thảo hoặc Đã phát hành. Hoá đơn gốc có thay thế hoặc điều chỉnh dự thảo hiện dấu cảnh báo (`.hd-canh-bao`, cuối `app.css`), rê chuột: "Có hoá đơn dự thảo thay thế HDTT2610-0002 chờ phát hành".

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi, cả bản trên máy lẫn bản chỉ gồm phần T794, T795 (dựng riêng, vì phiên khác đang sửa dở T793 trong cùng thư mục).
- `python tools/kiem_van.py` 3 file code: không mục ĐỎ.
- `python tools/kiem_tra.py --nhanh`: `Không có lỗi.` (chạy trên thư mục có cả phần T793 chưa commit của phiên khác).
- Chưa chạy được `python tools/xuat_bao_cao_he_thong.py`: máy báo thiếu module `build_present`, nên file Excel báo cáo chưa làm mới.
- Xem trên trình duyệt gói Plus: tab Hoá đơn điện tử 13 hoá đơn, đúng loại, trạng thái, dấu cảnh báo; tab Điều chỉnh thay thế 4 cặp; mở form HDTT2610-0002 dự thảo bình thường.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- Không.
