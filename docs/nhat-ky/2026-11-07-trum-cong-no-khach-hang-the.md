# Điện thoại, Công nợ khách hàng dạng thẻ giống Công nợ nhà cung cấp (T764)

- Ngày: 07/11/2026
- Người: Trum, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `MSoBaoCao.tsx`, `MBaoCaoDong.tsx`: 3.2.9 vào nhánh mẫu D, dùng chung `MBaoCaoTongHopMauD` với 4.2.3.
- `MBaoCaoTongHopMauD.tsx`: thêm `is329`, `laCongNo`; nhãn riêng cho khách hàng (Bán nợ trong kỳ, Tổng nợ phải thu khách hàng, nút Thu tiền đi phiếu thu lý do THU02 Thu Nợ).
- Khách có nợ cuối kỳ âm vào nhóm riêng "Khách hàng trả thừa", không gộp vào "Đã tất toán". Nhà cung cấp giữ nguyên hai nhóm.
- `MDtThuChiLap.tsx`: phiếu mới đọc `?dt=` để điền sẵn đối tượng. Trước đây link của nút Thanh toán 4.2.3 truyền `dt` nhưng form điện thoại bỏ qua.

## Đã kiểm

- `npm run typecheck`, `npm run build`, `python tools/kiem_tra.py --nhanh`: đều qua, `kiem_tra` in `Không có lỗi.`
- Script Playwright 390x844, gói Plus và Pro: thẻ 3.2.9 đúng tiêu đề, nhóm, chân. Tổng 81.629.000 khớp dòng Tổng cộng cột Nợ cuối kỳ trên web cùng tháng 9.
- Nút Thu tiền: qua popup chọn cửa hàng, mở phiếu thu có sẵn lý do Thu Nợ và tên khách, tài khoản Nợ 1111 Có 131. Nút Thanh toán 4.2.3 cũng điền sẵn nhà cung cấp.
- Gói Plus không có chip Bảng ở cả 4.2.3 lẫn 3.2.9. `kiem_tra_dot_21_b` không có nơi gọi trong `kiem_tra.py`, chạy tay thì kẹt ở bước bấm nên không dùng làm bằng chứng.
- Chưa chạy `kiem_tra.py --dien-thoai` vì đang kẹt ở đợt 5 (T696).

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- Không.
