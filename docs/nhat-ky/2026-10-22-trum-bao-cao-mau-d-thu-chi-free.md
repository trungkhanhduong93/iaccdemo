# Báo cáo điện thoại theo mẫu D, rà báo cáo gói Free, phiếu thu chi gói Free nhập gọn (T606, T607, T608)

- Ngày: 22/10/2026
- Người: Trum, agent: Claude Code điều phối, Antigravity viết code
- Trạng thái cuối phiên: Xong

## Đã làm

- T606: thêm `src/ui/mobile/MTongHopBanHang.tsx` (3.2.7 gom theo nhóm hàng) và `src/ui/mobile/MBaoCaoKiemKe.tsx` (5.2.15 gom theo kho, tiêu đề nhóm có tổng thừa, thiếu). Cả hai dùng lại lớp `m-bkm-*` của Bảng kê mua hàng mẫu D, đặt tiêu đề thanh trên, khối tổng ghim đáy lấy theo dòng Cộng trên web.
- T606: `MBaoCaoDong.tsx` rẽ 3.2.7, 5.2.15 sang hai màn mới; `MSoBaoCao.tsx` bỏ dạng bảng và nút chuyển bảng/thẻ cho hai báo cáo này (`laMauD`). 4.2.2 vẫn mở dạng bảng.
- T606: cuối `app.css` mục T606, hai lớp màu số `.m-bkm-card-tong.do`, `.xanh`.
- T607: rà các báo cáo điện thoại gói Free, kết quả ở bảng dưới.
- T608: `MDtThuChiLap.tsx`, gói Free (trừ chuyển quỹ): bỏ khung gợi ý dưới Số tiền, thay bằng ô Diễn giải; ẩn ô Ghi chú; phiếu 0 hoặc 1 dòng ẩn mục Chi tiết, lưu thì Số tiền, Diễn giải thành dòng chi tiết 1 và ghi chú phiếu; phiếu từ 2 dòng hiện Chi tiết nhưng không có nút Thêm dòng. Gói khác giữ nguyên.

Kết quả rà T607 (báo cáo điện thoại gói Free còn lệch mẫu D):

| Mã | Báo cáo | Lệch phần nào | Đề xuất gom |
|---|---|---|---|
| 2.2.1 | Sổ quỹ tiền mặt | màu chữ khoảng cách, khối tổng ghim đáy | Ngày; khối tổng 4 ô đang ở đầu trang |
| 2.2.3 | Sổ tiền gửi ngân hàng | màu chữ khoảng cách, khối tổng ghim đáy | Ngày; khối tổng 4 ô đang ở đầu trang |
| 3.2.8 | Bảng kê chi tiết bán hàng | màu chữ khoảng cách, gom nhóm, khối tổng | Ngày, hoá đơn, mặt hàng |
| 4.2.3 | Công nợ nhà cung cấp | màu chữ khoảng cách, gom nhóm, khối tổng | Nhóm nhà cung cấp hoặc tình trạng nợ |
| 5.2.3 | Báo cáo xuất nhập tồn | màu chữ khoảng cách, gom nhóm, khối tổng | Kho hoặc nhóm hàng |
| 5.2.9 | Tổng hợp nhập kho | màu chữ khoảng cách, gom nhóm, khối tổng | Kho hoặc loại phiếu nhập |
| 5.2.10 | Chi tiết nhập kho | màu chữ khoảng cách, gom nhóm, khối tổng | Ngày, phiếu nhập, mặt hàng |
| 10.2.3 | Báo cáo kết quả kinh doanh | màu chữ khoảng cách, khối tổng ghim đáy | Giữ phân cấp chỉ tiêu, ghim 3 số chính |
| 5.2.1 | Thẻ kho | màu chữ khoảng cách, khối tổng ghim đáy | Ngày phát sinh, ghim tồn cuối |

Đã đúng mẫu D: 4.2.7, 3.2.7, 5.2.15.

## Đã kiểm

- `npm run typecheck`, `npm run build`: chạy xong, không lỗi.
- `KIEM_TRA_URL=http://localhost:5182/ python tools/kiem_tra.py --nhanh`: "Không có lỗi." Chạy cổng 5182 vì 5180 đang là dev của thư mục `Web`.
- `python tools/kiem_van.py` cho `MDtThuChiLap.tsx`, `MTongHopBanHang.tsx`, `MBaoCaoKiemKe.tsx`: 0 ĐỎ, 1 VÀNG.
- Worker chụp ảnh 390x844 ở `backup/` (không lên repo). Trum chưa xem bằng mắt.

## Dở dang, việc tiếp theo

- Không. Trum chọn báo cáo nào trong bảng rà T607 để làm đợt sau, mỗi báo cáo tạo việc mới.
- T608 sửa cùng file `MDtThuChiLap.tsx` với T604 (PhuongXT), khác khúc. Ai push sau gộp tay.

## Bẫy, quyết định mới

- Không.
