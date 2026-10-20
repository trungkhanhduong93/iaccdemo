# Tách nút Ghi tăng, Ghi tăng đầu kỳ danh sách thẻ chi phí (T512)

- Ngày: 20/10/2026
- Người: dinhlanphuongipacc, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/ui/generic/CatalogScreen.tsx`: màn có thêm hàng loạt (`cfg.hangLoat`, hiện chỉ thẻ chi phí phân bổ) bỏ nút xổ `NutThemMoiSplit`, vẽ nút riêng từng kiểu thêm, class `ds-btn-chinh` như danh sách Thu chi. Nút đầu "Ghi tăng" viền xanh lá có dấu + (`ds-btn-thu`), "Ghi tăng đầu kỳ" viền xanh dương (`ds-btn-outline`).
- Bỏ mục "Ghi tăng bổ sung" khỏi nút và số đếm trên nút. Ghi tăng bổ sung vẫn mở từ link trên dải cảnh báo khi còn khoản chờ tạo thẻ.
- Màn danh mục khác giữ nút xổ như cũ.

## Đã kiểm

- `npm run typecheck`: không lỗi.
- `npm run build`: chạy xong, không lỗi.
- `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- Chưa chụp màn hình vì trình duyệt cần đăng nhập.

## Dở dang, việc tiếp theo

- Không.
- T510 (Trum) định đổi nút Chi phí phân bổ thành "Thêm mới" kiểu nút xổ. T512 làm theo ý dinhlanphuongipacc, Trum làm T510 cần giữ 2 nút này hoặc chốt lại.

## Bẫy, quyết định mới

- Không.
