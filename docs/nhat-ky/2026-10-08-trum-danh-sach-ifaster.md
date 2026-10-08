# Danh sách chứng từ theo iFaster (T41)

- Ngày: 08/10/2026
- Người: Trum, agent: Claude Code điều phối, worker Claude (opus, effort high) sửa code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/ui/LocNangCao.tsx` (mới): ô có nhãn trên viền, chip trạng thái, hộp Tuỳ chỉnh cột hiển thị.
- Cũng trong file đó: Bộ lọc nâng cao có cấu hình ô ra ngoài (kéo thả, lưu trên trình duyệt), nút Thao tác hàng loạt kèm hỏi lại khi xoá.
- `Table.tsx`: prop `doRong` để kéo giãn cột, prop `keDoc` để kẻ dọc. Bảng không truyền 2 prop này thì giữ như cũ.
- `ChonNgay.tsx`: prop `align`. Thanh lọc dùng `end` để lịch căn mép phải.
- `CongCuDs.tsx`: bỏ `NutGiaoDien`, thay bằng hộp Tuỳ chỉnh cột. Không nơi nào khác dùng.
- `VoucherScreen.tsx`: ghép các thành phần trên, bỏ thanh thao tác hàng loạt cũ.
- `ChungTuBanHang.tsx`: màn 3.1.1 dùng chung bố cục với danh sách chứng từ. Có thêm cột tick, STT, lọc từng cột, chip trạng thái, lọc theo chi nhánh trên thanh trên.
- `app.css`: mục T41 cuối file.
- Bố cục: ở 1440px thanh công cụ không đủ một hàng, nên màn dưới 1900px chia 2 hàng (coordinator duyệt khi worker hỏi).

## Đã kiểm

- `npm run typecheck`: không lỗi.
- `npm run build`: chạy xong.
- `python tools/kiem_tra.py --nhanh`: in `Không có lỗi.`
- Worker chạy 47 bước Playwright trên 2.1.1, 4.1.1, 3.1.1, đều đạt. Lịch lệch mép phải dưới 1px ở 1440 và 1920px. Không có lỗi trang.
- Coordinator chụp lại 2.1.1, 3.1.1 và menu Thao tác hàng loạt khi đã tick 2 phiếu.
- Chưa kiểm tự động kéo thả đổi thứ tự cột và ô lọc.

## Dở dang, việc tiếp theo

- Ở 1440x900, danh sách 3.1.1 chỉ thấy khoảng 2 dòng: dòng ghi chú FABi và khung chi tiết (cao tối đa 38%, T39) chiếm chỗ. Chờ Trum chọn cách xử lý.

## Bẫy, quyết định mới

- `docs/QUYET-DINH.md`: QD25.
