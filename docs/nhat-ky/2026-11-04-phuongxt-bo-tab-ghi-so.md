# Gói Plus ẩn hoá đơn bán hàng, bỏ tab ghi sổ ở chứng từ (T725)

- Ngày: 04/11/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/app/plan.ts`: mã 3.1.2 Hoá đơn bán hàng chỉ còn gói Pro, gói Plus ẩn hẳn (luật `anNgoaiGoi`).
- `src/ui/LocNangCao.tsx`: `dsChipTT` trả danh sách rỗng, mọi màn chứng từ web và điện thoại bỏ tab Tất cả, Chưa ghi sổ, Đã ghi sổ, Lỗi hạch toán.
- `src/ui/mobile/MChungTu.tsx`, `src/ui/mobile/MDtThuChiDs.tsx`: bỏ đọc `?tt=` từ đường dẫn, danh sách luôn hiện tất cả. Mục Chứng từ chưa ghi sổ ở trang chủ điện thoại vẫn gắn `?tt=nhap` nhưng không còn lọc.
- Giữ nguyên tab Đã đồng bộ, Chưa đồng bộ của Xuất bán POS và chữ trạng thái trong từng phiếu.

## Đã kiểm

- `npm run typecheck`: không lỗi.
- `npm run build`: chạy xong, không lỗi.
- `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- Chưa mở trình duyệt xem bằng mắt.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- Không.
