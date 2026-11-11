# Hoá đơn máy tính tiền mẫu, xem hoá đơn dự thảo ở tab Hoá đơn điện tử (T799)

- Ngày: 11/11/2026
- Người: dinhlanphuongipacc, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/modules/ban-hang/ChungTuBanHang.tsx`: `MAU_TAY` thêm 4 chứng từ gốc cửa hàng thứ hai (ký hiệu máy tính tiền C26MAB), BH2610-0014 đến 0017, id `tay-15` đến `tay-18`. `MAU_HD_MOI` thêm `tay-tt3` (HDTT2610-0003), `tay-dc4` (HDDC2610-0003) đã phát hành chưa gửi CQT, `tay-tt4` (HDTT2610-0004), `tay-dc5` (HDDC2610-0004) dự thảo. Giờ lập gom vào mảng `GIO_HD_MOI`.
- `src/modules/ban-hang/hddt.tsx`: `HD_MAU` thêm số 129 đến 134, `soHdCuoi` nâng lên 134 để hoá đơn phát hành trong phiên không trùng số mẫu.
- `src/modules/hoa-don/HoaDonDienTu.tsx`, tab Hoá đơn điện tử (`DsHoaDon`): số 00000000 của hoá đơn dự thảo thành link, mở `HopXemHd` xem mẫu (prop `nhap`, hàm `hdNhap` làm ở T798). Người dùng nhờ giữa phiên.

## Đã kiểm

- Gói Plus, tab Điều chỉnh thay thế: 4 cặp C26MAB hiện đủ; dự thảo có Phát hành, Phát hành và Gửi CQT bấm được, Gửi CQT mờ; Gửi CQT hoá đơn 00000133 chuyển Đã gửi TCTN; Phát hành và Gửi CQT dự thảo HDDC2610-0004 cấp số 00000135, Đã gửi TCTN.
- Tab Hoá đơn điện tử: 4 số 00000000 là link, bấm mở mẫu hoá đơn ghi Dự thảo.
- `npm run typecheck`, `npm run build`: chạy xong, không lỗi. `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- Chưa làm mới `docs/IACC-Cloud-Chi-Tiet-He-Thong.xlsx`: `tools/xuat_bao_cao_he_thong.py` cần thư mục `Present/tools` cạnh repo, máy này không có.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- Không.
