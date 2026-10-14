# Bộ lọc báo cáo theo kiểu danh sách chứng từ (T237)

- Ngày: 14/10/2026
- Người: Trum, agent: Claude Code điều phối, Antigravity (Gemini 3.8 Flash High) viết code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/ui/generic/ReportScreen.tsx`: bỏ nút phễu mở popup và ô Tìm riêng. Thanh công cụ báo cáo dùng `BoLoc` của danh sách chứng từ: ô nhãn trên viền, nút Bộ lọc nâng cao, nút Lọc. Ô ngoài mặc định là Khoảng ngày, Tìm trong báo cáo, ô đầu của `cfg.loc`. Ô tìm chỉ áp khi bấm Lọc hoặc Enter.
- Báo cáo tài chính (`LOAI_TRU_TU_SINH`), tờ khai, 6.2.x không có ô lọc nào thì chỉ có Khoảng ngày và nút Lọc. 6.2.x có `cfg.loc` khai tay vẫn giữ ô lọc.
- `src/ui/LocNangCao.tsx`: `BoLoc` thêm prop tuỳ chọn `anNangCao` (ẩn nút, khung nâng cao), `nhanXoa` (chữ nút xoá). Danh sách chứng từ không đổi hành vi.
- `src/ui/bao-cao/ToGiay.tsx`: nhắc "Bấm Lọc để cập nhật" thay "Bấm Xem báo cáo".
- `tools/kiem_tra.py`: bước đổi kỳ báo cáo bấm ô Khoảng ngày và nút `.ds-nut-loc`.
- `src/styles/app.css`: mục cuối T237. `docs/KIEN-TRUC.md`: đoạn bộ lọc màn xem báo cáo.

## Đã kiểm

- `npm run typecheck`, `npm run build`: chạy xong, không lỗi.
- `python tools/kiem_tra.py --nhanh`: `Không có lỗi.`
- `python tools/kiem_van.py` cho 4 file đã sửa: 0 ĐỎ. VÀNG dòng 74 `KIEN-TRUC.md` có từ trước.
- Anti chụp ảnh Sổ quỹ, báo cáo 10.2.2, danh sách chứng từ để so; Claude chưa tự xem ảnh.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- QD59 trong `docs/QUYET-DINH.md`, thay phần nút phễu của QD55.
