# Bảng Kết quả kinh doanh thẳng cột, vòng Quỹ tiền và biểu đồ 13 tháng to hơn (T503)

- Ngày: 20/10/2026
- Người: Trum, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/styles/app.css`, mục cuối T503: bảng Kết quả kinh doanh đổi sang lưới 4 cột (tên, số tiền, %, mũi tên). Dòng Doanh thu thiếu % và mũi tên, dòng Lợi nhuận thiếu mũi tên, nhưng số tiền vẫn thẳng cột với các dòng khác.
- `src/styles/app.css`: vòng tròn Quỹ tiền từ 120px lên 168px. SVG co giãn theo khung, chữ giữa vòng to theo.
- `src/modules/home/BaBaiToanFree.tsx`: 2 biểu đồ Hiệu quả kinh doanh 13 tháng, Dòng tiền 13 tháng đổi `KhungVua` từ cao 210, tối thiểu 120 sang cao 260, tối thiểu 220. Trang chủ máy tính vì vậy dài hơn màn hình, phải cuộn.

## Đã kiểm

- `npm run typecheck`, `npm run build`: chạy xong, không lỗi.
- `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- Chụp Playwright ở khung 1600x900: mép phải số tiền 5 dòng cùng ở x=787, cột % cùng ở x=841.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- Không.
