# Lỗi điện thoại gom từ Trum: thẻ tổng Thu chi, sổ S1a, danh sách mua hàng (T551, T553, T554)

- Ngày: 21/10/2026
- Người: Trum, agent: Claude Code điều phối, Antigravity làm
- Trạng thái cuối phiên: Xong T551, T553, T554. T552, T555 còn Chờ.

## Đã làm

- Gom 5 lỗi Trum gửi, vẽ mẫu trên artifact https://claude.ai/artifact/SfcVrqZv9iukRWQeovc2Dh, Trum chốt thành QD77.
- T551: `MDtThuChiDs.tsx`, thẻ tổng bỏ số tổng gộp thu, chi, chuyển quỹ. Thẻ có 2 ô Tổng thu, Tổng chi ghi đủ số. CSS mục T551 cuối `app.css`.
- T553: `MSoTT152.tsx`, phần báo cáo S1a có thẻ tiêu đề kèm Tổng cộng, doanh thu theo ngày, dòng Tổng cộng. `MSoBaoCao.tsx` thêm thanh đáy nút Xuất báo cáo ra Excel ở S1a, ẩn nút Excel cũ ở S1a. CSS mục T553.
- T554: `MChungTu.tsx`, màn 4.1.1 có thẻ tổng, nhóm theo ngày kèm tổng ngày, dòng có nhãn số hàng hoá. Hàng lọc dùng lớp của danh sách Thu chi. Màn mua hàng khác giữ `MDanhSach`. CSS mục T554.
- Anti Windows làm 1 lượt, sửa 2 vòng: trả lớp `m-ds-dong-tom-tat`, bỏ chữ giả, thêm lớp `m-the-ct`, `m-ds-tim-inp`, `m-trong` cho màn 4.1.1.

## Đã kiểm

- `npm run typecheck`, `npm run build`: chạy xong, không lỗi.
- `KIEM_TRA_URL=http://localhost:5181/ python tools/kiem_tra.py --nhanh`: "Không có lỗi." (chạy trước vòng 2, vòng 2 chỉ sửa `MChungTu.tsx`, `app.css`).
- `kiem_tra.py --dien-thoai` dừng ở lỗi cũ T525 (`.m-xp-nut-menu`). Đoạn kiểm danh sách của nó chạy lại riêng bằng script: 4-1-1 có 22 thẻ, gõ zzzz ra màn trống, xoá thì hiện lại 22 thẻ, không lỗi console.
- `python tools/kiem_van.py` 4 file `.tsx`: sạch.
- Chưa xem giao diện bằng mắt trên máy. Trum xem trên bản online sau khi push.
- Không giao review chéo làn WSL. Claude tự đọc diff 3 file logic.

## Dở dang, việc tiếp theo

- T552 (màn tạo chứng từ thành công dùng chung), T555 (dòng chi tiết phiếu thu chi mọi gói) giao được ngay: T539 của PhuongXT đã lên `main` (6f57001). Spec viết trước T539, T539 đã xếp lại form thu chi, nên đọc lại `MDtThuChiLap.tsx` theo bản mới trước khi giao.
- Spec sẵn ở `backup/spec-T552-dot2.md`, mẫu ở `backup/mau-T551/`, plan ở `backup/plan-T551-T555.md`. Thư mục `backup/` không lên git, nằm ở bản clone `D:\IACC-CLOUD\Web-t551`.
- Giao: worker Antigravity làn Windows, prompt trỏ tới spec, khối LUẬT CẤM ghi thẳng trong prompt. Cổng 5180 thường có phiên khác dùng, chạy dev ở 5181 và đặt `KIEM_TRA_URL`.

## Bẫy, quyết định mới

- QD77 trong `docs/QUYET-DINH.md`.
- Dispatch Orca đã báo xong thì không nhận tin nhắn nữa. Sửa vòng sau phải `worker-start` lại trên cùng terminal, kèm `--worktree id:<repo>::<path>`.
