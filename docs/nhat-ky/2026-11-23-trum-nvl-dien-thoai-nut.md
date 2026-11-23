# Chi phí NVL điện thoại: nút xem phiếu mua, bỏ tiền hàng (T905)

- Ngày: 23/11/2026
- Người: Trum, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/ui/mobile/MChiPhiNvl.tsx`, phần xem một cửa hàng: nút Xem danh sách phiếu mua hàng bỏ khung `m-standard-day-nut` ghim đáy (đè lên thanh tab), đổi sang nút viền `m-tcf-nut-vien chu-xanh` cuối danh sách, cùng kiểu nút Kiểm kê ngay.
- Cùng file: dòng phiếu mua bỏ dòng phụ "<số> tiền hàng", chỉ giữ tổng tiền phiếu.

## Đã kiểm

- `npm run typecheck`: không lỗi.
- `npm run build`: chạy xong, không lỗi.
- `python tools/kiem_van.py src/ui/mobile/MChiPhiNvl.tsx`: Sạch.
- Chụp khung 390x844 trên `vite preview` cổng 5181, đơn vị Góc Nhỏ, tháng 10, cửa hàng Phố Mây Lê Lợi: nút nằm cuối danh sách, dòng phiếu chỉ còn tổng tiền.
- Chưa chạy `python tools/kiem_tra.py --nhanh`: cổng 5180 đang có bản khác chạy `npm run dev`. Chạy trước khi push.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- Không. `MChiPhiThang.tsx` cũng dùng `m-standard-day-nut` ghim đáy, chưa kiểm có đè thanh tab không.
