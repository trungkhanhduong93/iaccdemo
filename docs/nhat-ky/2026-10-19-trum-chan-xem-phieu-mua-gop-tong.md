# Gộp khối tổng và hàng nút chân màn xem phiếu mua điện thoại (T481)

- Ngày: 19/10/2026
- Người: Trum, agent: Claude Code điều phối, Antigravity code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/ui/mobile/MXemPhieu.tsx`:
  - Khối tổng (Thành tiền mặt hàng, Tổng tiền giảm giá, Tổng tiền thuế) gộp vào chung khung chân trắng với hàng nút như màn chi tiết Xuất bán POS, thay khối nổi của T468.
  - Khối tổng chỉ hiển thị ở tab Chi tiết của phiếu mua; các tab khác và các màn xem phiếu khác giữ nguyên chân cũ.
  - Vùng nội dung cuộn kết thúc ngay trên khung chân. Dòng hàng cuối cùng hiển thị trọn vẹn phía trên khung chân, không bị che khuất. Bỏ lớp đệm đáy cứng 210px.
- `src/styles/app.css`:
  - Dọn lớp CSS cũ `.m-t468-tong-ghim` và `.m-pb-noi-dung-co-tong`.
  - Thêm mục CSS `/* ── Chân xem phiếu mua gộp tổng và nút (T481) ── */` định dạng khung chân dính đáy màu trắng, viền trên mảnh, chứa 3 dòng tổng và hàng nút thao tác.

## Đã kiểm

- `npm run typecheck`: không lỗi.
- `npm run build`: chạy xong, không lỗi.
- `python tools/kiem_tra.py --nhanh`: in "Không có lỗi."
- `python tools/kiem_van.py src/ui/mobile/MXemPhieu.tsx`: sạch, 0 ĐỎ.
- Ảnh chụp màn hình:
  - `backup/T481-phieu-mua-dautrang.png`
  - `backup/T481-phieu-mua-cuoncuoi.png`
  - `backup/T481-phieu-mua-thanhtoan.png`
  - `backup/T481-xuat-ban-pos.png`

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- Không.
