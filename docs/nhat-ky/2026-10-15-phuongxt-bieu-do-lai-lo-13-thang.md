# Biểu đồ lãi lỗ 13 tháng trên trang chủ Free (T255)

- Ngày: 15/10/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/ui/Charts.tsx`: thêm `LaiLoChart`, SVG tự vẽ: mỗi tháng cột doanh thu (xanh dương), cột chi phí (cam), đường lãi lỗ với điểm xanh khi lãi, đỏ khi lỗ. Trục chia số tròn, phần dưới 0 chỉ vừa đủ cho tháng lỗ. Không ghi số trên biểu đồ; rê chuột vào tháng hiện doanh thu, chi phí, lãi lỗ. Tháng chưa hết (T10/26) cột nhạt viền nét đứt.
- `src/modules/home/BaBaiToanFree.tsx`:
  - `laiLo13Thang`: 13 tháng 10/2025–10/2026, cùng công thức thẻ Lãi lỗ (doanh thu thuần trừ NVL theo cách tính từng chi nhánh, trừ chi phí hoạt động). Tháng 7–10/2026 tính thật theo chi nhánh đang chọn.
  - Dữ liệu giả chỉ có từ 01/07/2026, nên 9 tháng trước là số mẫu: trung bình tháng 7–9 nhân hệ số mùa vụ `MUA_VU` (tháng 1 Tết cao, tháng 2 thấp), NVL theo tỷ lệ doanh thu, chi phí hoạt động gần cố định. PhuongXT chọn cách này.
  - Thẻ Quản lý lãi lỗ: nút "Xem kết quả kinh doanh" đổi thành "Xem biểu đồ lãi lỗ 13 tháng", mở hộp `HopLaiLo13` (biểu đồ bên trái, `TomTat13` bên phải: tổng doanh thu, tổng chi phí, tổng lãi, tháng lãi cao nhất, tháng lỗ). Chân hộp có nút Xem kết quả kinh doanh. `Cot` thêm `onNut` để nút mở hộp.
- `app.css`: mục T255 cuối file (chú thích màu, hộp, tóm tắt, nút dạng liên kết).
- Qua các vòng PhuongXT xem: bản đầu chỉ cột lãi lỗ tràn ngang trang; thêm cột doanh thu, chi phí và bảng số thì rối; thu nhỏ 2/3 trang; cuối cùng đưa vào hộp, màu đậm.

## Đã kiểm

- `npm run typecheck`: không lỗi. `npm run build`: chạy xong.
- `python tools/kiem_tra.py --nhanh`: `Không có lỗi.` `kiem_van.py` BaBaiToanFree, Charts: sạch.
- Bản dev gói Free: tháng 9 thẻ Lãi lỗ +92,6 tr khớp cột T9/26; tháng 10 doanh thu 235 tr, chi phí 235,4 tr, lỗ 453k khớp các thẻ. Hộp mở, đóng bằng nút, Esc. Đã trả phiên về gói Plus.
- Chưa làm mới `docs/IACC-Cloud-Chi-Tiet-He-Thong.xlsx`: script cần file Excel nguồn chỉ có trên máy Trum.

## Dở dang, việc tiếp theo

- Không. Có thể làm sau: bản điện thoại chưa có biểu đồ; dòng Tháng lỗ đang tính cả T10/26 chưa hết tháng.

## Bẫy, quyết định mới

- Không.
