# Phân trang Bảng dữ liệu báo cáo (T238)

- Ngày: 14/10/2026
- Người: Trum, agent: Claude Code điều phối, Antigravity (Gemini 3.8 Flash High) viết code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/ui/bao-cao/ToGiay.tsx`: Bảng dữ liệu cắt dòng theo trang, mặc định 100 dòng, chọn 100, 200, 500 bằng `PhanTrang`. Số dòng/trang lưu khoá `bc-dong-trang`, chung mọi báo cáo.
- Dòng tổng cuối báo cáo không tính vào số dòng, ghim cuối mọi trang. Trên 100 dòng mới hiện thanh phân trang, ít hơn giữ chữ "N dòng".
- Về trang 1 khi bấm Lọc (sự kiện `bc-da-xem`), đổi kỳ, đổi ô tìm, đổi số dòng/trang, đổi báo cáo.
- Bảng dữ liệu bỏ cuộn ảo (`virtual={false}`), vì mỗi trang tối đa 500 dòng.
- Tờ in giữ phân trang cũ theo `cfg.phanTrang` (50, 100, 200, 500).
- `tools/kiem_tra.py`: thêm `kiem_tra_t238_may_tinh()` trong luồng `--nhanh`. `src/styles/app.css` mục cuối T238. `docs/KIEN-TRUC.md` thêm một dòng.

## Đã kiểm

- `npm run typecheck`, `npm run build`: chạy xong, không lỗi.
- `python tools/kiem_tra.py --nhanh`: `Không có lỗi.`, gồm bước T238 (100 dòng, chọn 200, sang trang 2 rồi Lọc về trang 1).
- Anti tự xem ảnh Bảng dữ liệu; Claude chưa xem ảnh.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- QD60 trong `docs/QUYET-DINH.md`.
