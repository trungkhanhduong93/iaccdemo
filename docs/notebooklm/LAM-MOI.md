# Quy trình làm mới bộ nguồn NotebookLM

Tài liệu quy định trình tự làm mới dữ liệu nguồn NotebookLM của dự án IACC Cloud.

## Chỉ ai được chạy
Chỉ chạy quy trình này khi Trum gõ lệnh "làm mới notebook". Không tự ý chạy trong các trường hợp khác.

## Trình tự thực hiện

### Bước 1. Rà soát thay đổi mã nguồn
1. Mở file `docs/notebooklm/LAN-XUAT.txt` lấy mã commit của lần xuất trước.
2. Chạy lệnh kiểm tra thay đổi:
   ```bash
   git log --stat <commit_cu>..HEAD
   ```
3. Xác định các phân hệ, màn hình hoặc quyết định vừa được cập nhật.

### Bước 2. Cập nhật tài liệu viết tay
1. Đối chiếu danh sách thay đổi với 10 file viết tay trong `docs/notebooklm/` (01–06, 09–11, 13).
2. Sửa đúng mục bị ảnh hưởng trong từng file tương ứng.
3. Giữ nguyên các phần không đổi, tuyệt đối không viết lại cả file.
4. Chỉ ghi điều có trong repo, kèm nguồn `file:dòng`, `QDxx` hoặc `Txxx`. Mục "Dự kiến" và "Chưa chốt" cũng vậy: không tự nghĩ ra tính năng tương lai hay tên công nghệ. Lần xuất đầu (T903), anti bịa NestJS, Golang, Open Banking, OCR, Dark Mode, Claude phải gỡ.

### Bước 3. Xuất bộ nguồn hoàn chỉnh
1. Chạy script xuất nguồn tại thư mục gốc repo:
   ```bash
   python tools/xuat_notebooklm.py
   ```
2. Kiểm tra thư mục `backup/notebooklm/` để xác nhận đủ 14 file markdown và file `manifest.json`.
3. Kiểm tra thông tin commit mới đã được ghi vào `docs/notebooklm/LAN-XUAT.txt`.

### Bước 4. Tải dữ liệu lên Google Drive
1. Dùng công cụ Google Drive tải các file nguồn lên thư mục `IACC Cloud – NotebookLM`.
2. Định dạng mỗi file thành một Google Doc theo mẫu tên: `IACC Cloud – <số thứ tự>. <chủ đề>`.
3. Tìm file có thay đổi bằng lệnh dưới. Đừng so `sha256`: dòng 2 ghi commit mới nên sha của mọi file đều đổi mỗi lần xuất. `git diff --stat <commit_cu>..HEAD -- docs/notebooklm docs/QUYET-DINH.md docs/BAY.md docs/TIEN-DO.md docs/luu-tru/TIEN-DO-xong.md CHANGELOG.md`.
4. Với file có thay đổi nội dung: chuyển bản cũ vào thùng rác rồi tạo bản mới. Không ghi đè trực tiếp vì công cụ không hỗ trợ ghi đè nội dung Google Doc.
5. Tải lên bằng `base64Content` dạng tham chiếu file `sha256:<sha256 trong manifest>:<duong_dan trong manifest>`, `contentMimeType` là `text/markdown`. Không dán nội dung vào `textContent`: tốn token, file 07, 12, 14 rất dài.
6. Ghi toàn bộ mã định danh Google Doc vào file `docs/notebooklm/drive.json`.

### Bước 5. Báo Trum cập nhật NotebookLM
1. Lập danh sách các file đã thay đổi nội dung trong đợt làm mới.
2. Báo danh sách cho Trum để xoá nguồn cũ và nạp nguồn mới vào NotebookLM.

### Bước 6. Lưu trữ thay đổi vào kho mã nguồn
1. Kiểm tra trạng thái kho mã nguồn bằng lệnh `git status`.
2. Tạo commit chứa các file viết tay đã sửa, file `docs/notebooklm/LAN-XUAT.txt` và file `docs/notebooklm/drive.json`.
