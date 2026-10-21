# Nút Chứng từ trước, sau ra ngoài menu Tiện ích (T584)

- Ngày: 21/10/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `ChungTuForm.tsx`: bỏ 2 mục Chứng từ trước, Chứng từ sau khỏi menu Tiện ích ở chân form xem chứng từ web. Thêm 2 nút biểu tượng mũi tên trái, phải bên trái nút Tiện ích. Nút mờ đi khi đang ở phiếu đầu hoặc cuối danh sách. Không có phiếu trước lẫn sau thì ẩn cả cụm.
- `app.css`: mục mới cuối file (T584), lớp `.xp-chuyen-phieu`, `.xp-btn-ic`.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- `python tools/kiem_van.py src/ui/generic/ChungTuForm.tsx`: 0 ĐỎ.
- Mở phiếu mua hàng MH2610-0021, bấm Chứng từ sau: sang phiếu kế tiếp, nút Chứng từ trước bật.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- Không.
