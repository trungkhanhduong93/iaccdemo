# Thẻ kho tiêu đề Chứng từ, popup HĐĐT, cân cột mẫu in (T871, T872, T594, T873)

- Ngày: 17/11/2026
- Người: Trum, agent: Claude Code điều phối, Antigravity viết code
- Trạng thái cuối phiên: T871, T872 Xong; T594, T873 Dở dang

## Đã làm

- T871: `src/modules/kho/data.ts` cột soNhap, soXuat thêm `nhom: 'Chứng từ'`, tên cột thành Nhập, Xuất. Ca T870 trong `tools/kiem_tra.py` đổi theo tiêu đề mới.
- T872: cuối `src/styles/app.css` mục T872, tờ hoá đơn trong popup cao theo nội dung, QR và khối chữ ký nằm trong khung.
- T594: `src/ui/bao-cao/chiaCot.ts` đo độ dài số phiếu thật (`phieuTheoSo`), nới bề rộng tối thiểu cột số, ngày, mã; phần dư dồn hết cho cột chữ dài; cỡ chữ sàn 7px; cột Cửa hàng tính là cột chữ.
- T873: trích 17 sheet file mẫu TT58 bản 13/11 ra `backup/review-T873/excel_summary.txt`.

## Đã kiểm

- `npm run typecheck`, `npm run build`: chạy xong, không lỗi.
- `backup/review-T594/scan_all_reports.py` quét mẫu in mọi báo cáo S, PL: hết lỗi cắt số phiếu (2.2.1), cắt số tiền (4.2.6, 4.2.7, 5.2.10, 5.2.12). Kết quả ở `backup/review-T594/ket-qua-truoc-sua.txt` và `ket-qua-sau-sua-lan-1.txt`.
- T872: `backup/review-T872/kiem_tra_t872.py` đo ở 1600x800 và 1366x768, pass.

## Dở dang, việc tiếp theo

- T594: khổ dọc còn chữ quá 2 dòng ở 2.2.3, 3.2.8, 4.2.7, 5.2.10, 5.2.12 (gói S và PL). Bảng nhiều cột số, khổ dọc hẹp. Bước kế tiếp: hỏi Trum cho phép 3 dòng ở khổ dọc, hoặc mặc định khổ ngang cho 5 báo cáo này trong `src/modules/bao-cao/danh-sach.ts`. Chạy lại `python backup/review-T594/scan_all_reports.py` để kiểm.
- Nhiều báo cáo gói S báo `KHONG_CO_NUT_IN` trong script quét: script mở sai đường dẫn, chưa phải lỗi app. Sửa script trước khi tin kết quả gói S.
- T873: viết `docs/RA-SOAT-MAU-TT58.md` từ `backup/review-T873/excel_summary.txt`, so với `src/modules/bao-cao/tt58.ts`, `danh-sach.ts`, `src/app/mau-in.ts`. Spec ở `backup/spec-T594-T871-T873.md`.
- Bẫy agy: worker treo 50 phút ở lệnh `curl -I http://localhost:5180/` chạy nền. Ghi spec cấm curl và lệnh nền.

## Bẫy, quyết định mới

- Không.
