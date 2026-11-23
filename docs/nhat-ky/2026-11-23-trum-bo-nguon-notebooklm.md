# Bộ nguồn NotebookLM (T903)

- Ngày: 23/11/2026
- Người: Trum, agent: Claude Code điều phối, 4 Antigravity viết
- Trạng thái cuối phiên: Xong

## Đã làm

- Tạo 10 file viết tay trong `docs/notebooklm/`: 01 Tổng quan, 02 Nguyên lý kế toán, 03 Phân hệ và màn hình, 04 Chứng từ và định khoản, 05 Báo cáo và mẫu in, 06 Giao diện và UX, 09 Kiến trúc FE và BE dự kiến, 10 Quy trình team, 11 Tiện ích và hệ thống, 13 Hỏi đáp mẫu (72 câu).
- `tools/xuat_notebooklm.py`: chép 10 file viết tay, sinh 07 (QUYET-DINH), 08 (BAY), 12 (TIEN-DO + TIEN-DO-xong), 14 (CHANGELOG) vào `backup/notebooklm/`, ghi `manifest.json` và `docs/notebooklm/LAN-XUAT.txt`.
- `docs/notebooklm/LAM-MOI.md`: các bước khi Trum gõ "làm mới notebook". `AGENTS.md` thêm mục "Làm mới notebook" và dòng trong bản đồ tài liệu.
- Tải 14 Google Docs lên thư mục Drive `IACC Cloud – NotebookLM` của Trum. ID ghi trong `docs/notebooklm/drive.json`.

## Đã kiểm

- `python tools/kiem_van.py` cho 11 file trong `docs/notebooklm/`: 0 ĐỎ.
- `python tools/xuat_notebooklm.py`: thoát 0, 14 file, khoảng 164.000 từ (file dài nhất 12: 45.322 từ).
- Drive: tìm theo câu cuối file 14 thấy đúng Google Doc, nội dung lên đủ.
- Soát mẫu định khoản Thu chi, Bán hàng với mảng `noCo` trong `src/modules/*/index.ts`: khớp, sửa 1 chỗ ở 04 (giá vốn chỉ Có 152, không có 156).
- Chưa kiểm: hỏi thử trong NotebookLM. Trum tạo notebook xong thì hỏi vài câu ở file 13 để so.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- Anti bịa nội dung "Dự kiến", "Chưa chốt": NestJS, Golang, PostgreSQL, Open Banking, OCR, Dark Mode, JWT. Claude đã gỡ. Luật cấm bịa ghi ở `LAM-MOI.md` bước 2.
- Công cụ Google Drive của Claude không ghi đè được nội dung Google Doc: làm mới thì bỏ bản cũ vào thùng rác, tạo bản mới, Trum thay nguồn trong NotebookLM.
- Tải file lên Drive bằng `base64Content` dạng `sha256:<hash>:<đường dẫn>`, không dán nội dung. Script ghi byte để sha256 khớp file trên đĩa.
