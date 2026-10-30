# Hướng dẫn nhanh điện thoại kiểu bong bóng nổi (T675)

- Ngày: 30/10/2026
- Người: Trum, agent: Claude Code điều phối, Antigravity viết code và review chéo
- Trạng thái cuối phiên: Xong

## Đã làm

- Dựng bản bấm thử 2 kiểu trên artifact https://claude.ai/artifact/ACgSeA4b7QqFeLnTBXYZyz. Trum chọn kiểu B, bong bóng nổi như web.
- `src/ui/mobile/MHuongDanNhanh.tsx` (mới): nút bóng đèn `MNutHuongDan` có chấm cam khi màn chưa xem, lớp tour `MTourOverlay` gồm màn tối, khoanh sáng, bong bóng có mũi nhọn, bong bóng chào và bong bóng cuối nằm giữa màn, Đi tiếp vẽ dọc.
- `src/ui/HuongDanNhanh.tsx`: export các hàm tour dùng chung (dsTour, choTour, timCho, luongCua, đọc ghi đã xem), thêm `layHuongDan`, kiểu bước thêm trường `dt`. Tour web giữ nguyên.
- `huong-dan.ts` của `tien`, `thue`, `ban-hang`, `kho`: thêm chữ `dt` ở bước thao tác điện thoại khác web.
- Gắn `data-hd` và nút bóng đèn ở `MDtThuChiDs`, `MDtThuChiLap`, `MDsChungTuChuan`, `MLapPhieu`, `MBaoCaoDau`, `MSoBaoCao`, `MToKhaiHKD`. `MobileShell` gắn nút và lớp tour.
- `MLapPhieu`, `MDtThuChiLap`: tour đang chạy thì lưu phiếu mẫu với giá trị điền sẵn, báo `baoDaLuu`, về danh sách. Lưu phiếu thường không đổi.
- `src/modules/home/HuongDan.tsx`: tour màn đang chạy thì ẩn dải Tiếp tục của tour Trang chủ.
- `tools/kiem_tra.py`: thêm `kiem_tra_t675_tour_dien_thoai`, chạy tour 5 màn Standard ở khung 390x844, mỗi màn đúng 1 nút bóng đèn.
- CSS mới ở mục T675 cuối `src/styles/app.css`.

## Đã kiểm

- `npm run typecheck`: sạch.
- `npm run build`: chạy xong, không lỗi.
- `python tools/kiem_tra.py --nhanh`: Không có lỗi, 5/5 màn Standard đúng. Anti viết code chạy, anti review chéo chạy lại, cả hai cùng ra kết quả này.
- `python tools/kiem_van.py` cho 4 file `huong-dan.ts`: 0 ĐỎ.
- Review chéo (pre-push-qa): XANH.
- Chưa bấm thử bằng tay trên điện thoại thật.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- Ghi QD89 vào `docs/QUYET-DINH.md`.
- Dispatch Orca đã báo xong thì không nhận tin nữa. Muốn sửa vòng sau thì `worker-start` dispatch mới với `--terminal` của worker cũ.
