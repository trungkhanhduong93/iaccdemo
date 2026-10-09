# Đường kẻ Danh mục, lọc sổ thu chi theo quỹ, màn xem báo cáo gọn một tờ liền (T53, T54, T55)

- Ngày: 09/10/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- T53: `Shell.tsx` thêm đường kẻ giữa Danh mục và Hệ thống.
- T54: `plan.ts` gói Free bỏ Sổ chi tiết tiền 2.2.7 (`BO_SUNG`) và Sổ công nợ 2.2.5 (`THEO_ROADMAP`).
- T54: `bao-cao/danh-sach.ts` thêm `ds` cho `LocBC` (danh sách chọn cố định), bộ lọc Quỹ tiền cho 2.2.1, 2.2.3, Đối tượng cho 2.2.5; hàm `tenQuyTm`, `tenTkNh`. `ReportScreen.tsx` dùng `ds` khi có, `renderReport` nhận `loc`, Sổ ngân hàng tách theo tài khoản (`theoTk` trong `types.ts`, `tien/index.ts`), cột Quỹ tiền, xem tất cả quỹ mặc định khổ ngang. `SoQuy.tsx` tính sổ theo quỹ được lọc. Dòng chi tiết mang `locQuy` để khung lọc chung (`bienDoiBang`) giữ lại.
- T55: `ThanhChon.tsx` thêm ô `#bc-chon-phai`; `ReportToolbar` vẽ thanh công cụ vào đó bằng portal, trong phân hệ Báo cáo không vẽ tạm trong khung. CSS mục T55 cuối `app.css`: khung báo cáo cùng cột flex với thanh chọn, ẩn dòng tiêu đề trùng, ô chọn báo cáo kiêm tiêu đề, ẩn thanh tab khi xem một báo cáo.
- T55: `ToGiay.tsx` xem trên màn hình là một tờ liền (`bc-to-lien`, đo chiều cao cho khung cuộn theo zoom); bỏ nút chuyển trang, Liên tục/Từng trang, nút In dưới. In và xuất vẫn chia trang. Khổ đã chọn nhớ theo `đường dẫn:khổ mặc định`.
- T55: `SoQuy.tsx` dùng khung `page page-report`. `tools/kiem_tra.py` tìm nút chọn ngày ở `.bc-chon` trước.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_tra.py` bản đầy đủ 4 gói: 698 lượt mở màn, `Không có lỗi.` Bản `--nhanh` chạy liền 3 lần đều qua sau khi bỏ vẽ tạm thanh công cụ.
- `python tools/kiem_van.py` các file có chữ đã sửa: sạch.
- Playwright: lọc quỹ ở Sổ quỹ (tồn đầu Thảo Điền 40.048.000 khớp sổ riêng), Sổ ngân hàng (cột Quỹ tiền, khổ ngang khi xem tất cả, dọc khi chọn một quỹ), Sổ công nợ; màn báo cáo không tràn ở 1920px và 1366px; in vẫn ra 3 trang có dòng cộng chuyển trang.

## Dở dang, việc tiếp theo

- Không.
- Gói Free không còn sổ phải thu khách hàng (2.2.5 ẩn); PhuongXT chốt dùng Sổ công nợ nhà cung cấp.
- Nhờ Trum cập nhật Excel: 2.2.5 bỏ gói Free.

## Bẫy, quyết định mới

- `docs/QUYET-DINH.md`: QD36; thêm vào QD35 (đường kẻ T53).
- Khung lọc chung lọc dòng theo cột rồi giữ nguyên dòng tồn đầu, tồn cuối, nên sổ có số dư phải tính lại số liệu theo lựa chọn lọc, không dựa vào khung lọc.
- Khổ giấy đã lưu đè khổ mặc định; đổi khổ mặc định theo trường hợp thì khoá lưu phải theo cả khổ mặc định.
