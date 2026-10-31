# Tour hướng dẫn tự bấm nút Đồng bộ, chip Chưa đồng bộ (T703)

- Ngày: 31/10/2026
- Người: Trum, agent: Claude Code điều phối, Antigravity viết code (2 worker, worker đầu hết quota giữa chừng)
- Trạng thái cuối phiên: Xong

## Đã làm

- `HuongDanNhanh.tsx`: `BuocHD` thêm `bam` (vào bước mà chưa thấy chỗ khoanh thì tour bấm phần tử `data-hd` này) và `web` (bước chỉ có trên máy tính). Bước có `o` bắt đầu bằng `hdb` là bước trong hộp Đồng bộ, sang bước ngoài hộp thì tour đóng hộp. Bước khoanh chip thì Tiếp bấm chip đó. Bắt đầu tour ghi lại chip đang chọn, kết thúc tour đóng hộp, bấm lại chip cũ. `timCho` cuộn phần tử có `data-hd` vào tầm nhìn (cột Xử lý nằm khuất bên phải bảng).
- `MHuongDanNhanh.tsx`: tour và danh sách Làm nhanh điện thoại bỏ bước `web`.
- `data-hd` mới: hộp Đồng bộ (`hdbNgay`, `hdbLoai`, `hdbDs`, `hdbMon`, `hdbLamLai`, `hdbNut`, `hdbDong`), chip (`chip-<khoá>`, `LocNangCao.tsx`), tiêu đề cột bảng chung (`cot-<khoá>`, `Table.tsx`).
- `tien/huong-dan.ts`, `ban-hang/huong-dan.ts`: bước từng mục trong hộp, bước chip, bước cột bảng Chưa đồng bộ. Ô chip trên sơ đồ đổi khoá sang `chip-chua-db`.
- `app.css` mục T703: lớp tour web z-index 600, nằm trên hộp Đồng bộ.
- `tools/kiem_tra.py`: ca tour T681 nâng giới hạn bấm Tiếp từ 20 lên 30 lần, vì tour Thu chi giờ dài hơn.
- `QUYET-DINH.md`: QD91.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_tra.py --nhanh`: `Không có lỗi.`
- `kiem_van` hai file `huong-dan.ts`: mỗi file 0 ĐỎ, 1 VÀNG.
- Anti chạy Playwright tour 2 màn tới hết: hộp đóng, chip về như lúc bắt đầu. Claude chưa mở trình duyệt xem bằng mắt.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- QD91. Tour dài hơn 20 lần bấm Tiếp thì ca T681 của `kiem_tra.py` dừng trước bong bóng cuối, báo "Tiep khong toi bong bong cuoi".
