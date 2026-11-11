# Kê khai hoá đơn thay thế, điều chỉnh về kỳ gốc (T788)

- Ngày: 11/11/2026
- Người: dinhlanphuongipacc, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- dinhlanphuongipacc chốt: chỉ làm gói Plus (màn Kê khai thuế, tờ khai hộ kinh doanh kỳ 6 tháng). Gói Pro (Bảng kê bán ra 6.2.2, tờ khai 01/GTGT, 01/KHBS) chưa làm.
- File mới `src/modules/thue/hdKyGoc.ts`. Lấy hoá đơn thay thế, điều chỉnh đã phát hành có hoá đơn gốc (đầu chuỗi thay thế) thuộc kỳ, tính chênh lệch doanh thu. Thay thế tính bằng mới trừ gốc, điều chỉnh tính bằng số âm hoặc dương. Tờ khai chưa nộp lấy hết. Tờ khai đã nộp chỉ giữ các hoá đơn đã lấy lúc nộp. Hoá đơn phát hành sau khi nộp thì nhắc lập tờ khai bổ sung.
- `src/modules/thue/ToKhaiHKD.tsx`:
  - `ToKhai` có thêm `hd` (hoá đơn đã lấy lúc nộp).
  - `soLieu(tk, coHd)` cộng chênh lệch vào doanh thu.
  - `nopToKhai` ghi trạng thái Đã nộp và danh sách hoá đơn.
  - Danh sách tờ khai có dòng nhắc kỳ đã nộp và link Lập tờ khai bổ sung.
  - Bước 2 có bảng "Hoá đơn thay thế, điều chỉnh đưa về kỳ này". Hoá đơn bị thay thế bị gạch. Dòng cuối là chênh lệch doanh thu.
  - Tất cả chỉ chạy khi `s.goi === 'PL'`.
- `src/ui/mobile/MToKhaiHKD.tsx`: nút Đã nộp CQT dùng `nopToKhai`. Số liệu trên điện thoại chưa cộng chênh lệch.
- Dữ liệu mẫu:
  - `ban-hang/ChungTuBanHang.tsx` thêm chứng từ gốc `tay-14` (BH2606-0003, 26/06/2026) và hoá đơn điều chỉnh giảm `tay-dc3` (HDDC2608-0001, 14/08/2026). `MAU_HD_MOI` có thêm cột ngày lập, không bắt buộc.
  - `ban-hang/hddt.tsx` `HD_MAU` thêm số hoá đơn 41, 63.
- `src/styles/app.css` thêm mục cuối "Kê khai hoá đơn thay thế, điều chỉnh về kỳ gốc (T788)".

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_tra.py --nhanh` (KIEM_TRA_URL=http://localhost:5181/, dev server riêng của bản này vì cổng 5180 đang chạy thư mục gốc): `Không có lỗi.`
- Script Playwright riêng ở gói Plus cho 3 kết quả:
  - Danh sách tờ khai nhắc "Kỳ 6 tháng đầu năm 2026 có 1 hoá đơn điều chỉnh … doanh thu giảm 300.000, thuế phải nộp giảm 13.500".
  - Tờ khai kỳ cuối 2026 (chưa nộp) có bảng gạch HĐ 00000119, thêm HĐ 00000127, điều chỉnh giảm -425.000.
  - Bấm Lập tờ khai bổ sung thì mở tờ khai bổ sung kỳ đầu 2026, có bảng điều chỉnh -300.000, lời nhắc mất. Trang không có lỗi.
- `python tools/kiem_van.py`: 3 file đều 0 ĐỎ. 3 VÀNG ở `ChungTuBanHang.tsx` là đường vẽ SVG có sẵn.
- `python tools/xuat_bao_cao_he_thong.py` vẫn lỗi `No module named 'build_present'`, nên chưa làm mới được file Excel báo cáo.

## Dở dang, việc tiếp theo

- Không. Gói Pro (Bảng kê bán ra 6.2.2, 01/GTGT, 01/KHBS) và số liệu tờ khai trên điện thoại chưa làm. Cần thì mở việc mới.

## Bẫy, quyết định mới

- Không.
