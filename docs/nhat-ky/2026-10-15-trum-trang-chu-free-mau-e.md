# Trang chủ Free mẫu E, modal quỹ, Lịch sử thu chi L1 (T272)

- Ngày: 15/10/2026
- Người: Trum, agent: Claude Code vẽ mẫu, điều phối, kiểm; Antigravity Windows (Anti A) code, chụp ảnh; Anti B (WSL) review chéo
- Trạng thái cuối phiên: Xong

## Đã làm

Claude vẽ 8 mẫu trang chủ, 2 mẫu modal quỹ, 3 mẫu Lịch sử thu chi trên canvas https://claude.ai/artifact/GB2jrKovkPxjybbT1KodZe. Trum chọn E, M2, L1. Điện thoại làm theo cho giống web.

- `home/BaBaiToanFree.tsx`: ba cột đều, câu hỏi gộp vào đầu cột. Số lớn ghi đủ đồng. Cột kho có Thao tác nhanh lấy 4 mục đầu của danh sách tuỳ chỉnh T266. Bấm thẻ quỹ mở modal quỹ đó, bấm số tồn quỹ tổng mở modal gộp.
- `home/quyThuChi.tsx` (mới): modal quỹ dùng chung web và điện thoại. Có 4 ô Tồn đầu kỳ + Tiền thu vào − Tiền chi ra = Tồn cuối kỳ, biểu đồ số dư từng ngày (SVG), 3 giao dịch gần nhất, nút Lập phiếu thu, chi, nút Xem chi tiết lịch sử thu chi.
- `home/LichSuQuy.tsx`: 4 ô màu thay băng xanh. Bảng Số phiếu, Diễn giải, Nguồn, Thu, Chi, Số dư gom theo ngày, mỗi ngày có dòng tổng. Số phiếu mở chứng từ gốc ở tab mới. `quy=tat-ca` gộp mọi quỹ, thêm cột Quỹ và ghi chú "Gồm tiền chuyển giữa các quỹ".
- `mobile/MTrangChu.tsx` phần Free, `mobile/MLichSuQuy.tsx`: làm theo web. Quỹ mở dạng ô kéo từ dưới lên. Khối Thao tác nhanh T259 giữ ở trên cùng, không lặp trong khối kho.
- `app.css`: mục T272 cuối file.
- `tools/kiem_tra.py` đợt 19B: bấm quỹ mở modal hoặc ô kéo, kiểm 4 ô, Esc đóng, rồi mới vào Lịch sử thu chi.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_tra.py --nhanh`: `Không có lỗi.`
- `--dien-thoai`: đợt 19B không lỗi. Còn 1 lỗi có từ trước, không thuộc T272: màn `trang-chu/chi-phi-nvl` (T242) và `thue/to-khai` chưa có bản điện thoại.
- Anti B review vòng 1 ra ĐỎ: số dư cuối ngày sai khi lọc chỉ thu hoặc chỉ chi, và khi xem gộp tất cả quỹ. Anti A đã sửa ở vòng 1. Claude đọc lại logic số dư và xem ảnh: dòng 07/10 gộp ra 528.533.000, khớp Tồn cuối kỳ.

## Dở dang, việc tiếp theo

- Không.
- Dữ liệu giả có số phiếu trùng giữa các quỹ (vd PT2610-0258 ở 3 quỹ), nên link tab mới có thể mở nhầm phiếu cùng số. Cách dò phiếu có từ T201, chưa sửa.

## Bẫy, quyết định mới

- Không.
