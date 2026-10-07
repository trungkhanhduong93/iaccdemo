# Bắt đầu với iaccdemo

File này dành cho người mới vào nhóm, chưa quen git và lập trình. Phần 1 làm một lần trên máy mới. Phần 2 làm mỗi lần ngồi vào làm việc.

Bạn không cần tự viết code. Agent (Claude Code hoặc Antigravity) sửa code, kiểm tra, ghi nhật ký và đưa lên GitHub. Việc của bạn: nói cho agent biết cần làm gì, xem kết quả trên trình duyệt, hỏi Trum khi không chắc nghiệp vụ.

Hướng dẫn viết cho Windows. Dùng máy Mac thì hỏi agent lệnh tương ứng.

## Phần 1. Cài đặt, làm một lần

### Bước 1. Nhận lời mời vào repo

1. Đăng nhập GitHub bằng tài khoản Trum đã mời.
2. Mở https://github.com/trungkhanhduong93/iaccdemo/invitations, bấm **Accept invitation**.
3. Mở https://github.com/trungkhanhduong93/iaccdemo. Thấy danh sách file là xong.

Lời mời hết hạn sau 7 ngày. Hết hạn thì nhắn Trum mời lại.

### Bước 2. Cài Git

1. Tải Git ở https://git-scm.com/downloads/win, chạy file cài, bấm **Next** tới khi cài xong, không đổi tuỳ chọn nào.
2. Mở PowerShell: bấm phím Windows, gõ `PowerShell`, Enter.
3. Gõ `git --version`, Enter. Thấy dòng `git version ...` là xong.
4. Khai tên và email cho Git. Email là email đăng ký GitHub của bạn:

```bash
git config --global user.name "Ten Cua Ban"
```

```bash
git config --global user.email "email-github-cua-ban@example.com"
```

### Bước 3. Cài Node.js

1. Tải bản **LTS** ở https://nodejs.org, chạy file cài, để mặc định. Bỏ trống ô cài thêm công cụ biên dịch (Tools for Native Modules).
2. Đóng PowerShell cũ, mở PowerShell mới.
3. Gõ `node -v`. Thấy `v22.12` trở lên (vd `v24.11.0`) là xong.

### Bước 4. Cài Python và Chrome

Script kiểm của nhóm cần hai thứ này để mở thử từng màn.

1. Tải Python ở https://www.python.org/downloads/. Màn đầu của trình cài, tick ô **Add python.exe to PATH**, rồi bấm **Install Now**.
2. Mở PowerShell mới, chạy lệnh dưới. Báo không có `pip` thì chạy `py -m pip install playwright`.

```bash
pip install playwright
```

3. Cài Google Chrome nếu máy chưa có.

### Bước 5. Cài agent

Chọn một trong hai:

- Claude: tải ở https://claude.ai/download, đăng nhập, dùng tab **Code**.
- Antigravity: tải ở https://antigravity.google/download, đăng nhập tài khoản Google.

### Bước 6. Lấy mã nguồn về máy

1. Tạo thư mục làm việc, vd `D:\code`.
2. Trong PowerShell, vào thư mục đó:

```bash
cd D:\code
```

3. Tải repo về. Lần đầu Git mở trình duyệt hỏi đăng nhập GitHub: đăng nhập đúng tài khoản được mời, bấm cho phép.

```bash
git clone https://github.com/trungkhanhduong93/iaccdemo.git
```

4. Vào thư mục repo, cài thư viện. Chờ chạy xong, không có dòng `ERR!` là được.

```bash
cd iaccdemo
```

```bash
npm ci
```

### Bước 7. Chạy thử

1. Chạy bản thử trên máy:

```bash
npm run dev
```

2. Mở http://localhost:5180, đăng nhập bằng email bất kỳ, mật khẩu từ 6 ký tự.
3. Thấy màn chọn đơn vị kế toán là máy đã sẵn sàng.
4. Bấm vào cửa sổ PowerShell, bấm Ctrl+C để tắt bản thử.

### Bước 8. Mở repo bằng agent

1. Mở thư mục `D:\code\iaccdemo` trong agent:
   - Claude: tab **Code**, chọn thư mục `D:\code\iaccdemo`.
   - Antigravity: **File** > **Open Folder**, chọn `D:\code\iaccdemo`.
2. Dán câu sau vào ô chat, thay tên GitHub của bạn:

```text
Tui là <tên GitHub>, người mới. Đọc AGENTS.md và BAT-DAU.md, kiểm máy tui đã cài đủ Git, Node, Python, Playwright chưa, thiếu gì thì hướng dẫn tui cài.
```

Agent báo đủ là xong phần cài đặt.

## Phần 2. Mỗi lần làm việc

1. Mở agent ở thư mục `iaccdemo`.
2. Dán câu mở đầu, thay tên GitHub của bạn:

```text
Tui là <tên GitHub>. Làm theo AGENTS.md: kéo bản mới về, đọc tiến độ và nhật ký, cho tui biết việc Trum giao cho tui và phiên trước dừng ở đâu.
```

3. Agent kể việc được giao và đề xuất làm việc nào trước. Chọn việc, nói rõ bạn muốn gì. Không chắc nghiệp vụ kế toán thì hỏi Trum trước khi bảo agent sửa.
4. Agent sửa xong thì bảo agent chạy bản thử. Mở http://localhost:5180, tự bấm thử phần vừa sửa.
5. Ưng rồi thì nói:

```text
Xong việc này. Kiểm, ghi nhật ký, cập nhật tiến độ rồi push.
```

6. Agent chạy các bước kiểm, ghi nhật ký, push lên GitHub. Chừng 2 phút sau, robot đưa bản mới lên https://iaccdemo.pages.dev.
7. Xem robot ở https://github.com/trungkhanhduong93/iaccdemo/actions. Dòng trên cùng có dấu tích xanh là đã lên online. Dấu X đỏ là lỗi: nói với agent "robot báo đỏ, xem lỗi và sửa".
8. Hết giờ mà chưa xong việc thì nói:

```text
Dừng ở đây. Ghi nhật ký dở dang, cập nhật tiến độ rồi push.
```

Lần sau agent của bạn, hoặc của người khác, đọc nhật ký đó và làm tiếp đúng chỗ.

Lần push chỉ sửa file tài liệu `.md` thì robot không chạy. Như vậy là bình thường.

## Phần 3. Luật chung

- Trum giao việc trong `docs/TIEN-DO.md`. Muốn làm việc chưa có trong bảng thì bảo agent thêm dòng mới ghi tên bạn, rồi nhắn Trum.
- Ai cũng tự commit và push lên `main`, không chờ duyệt. Mỗi lần push là bản online đổi theo, nên chỉ push khi agent đã kiểm xong.
- Không được chạy lệnh có chữ `--force`. Agent đề nghị thì từ chối và hỏi Trum.
- Điều gì người sau cần biết phải nằm trong repo: nhật ký, tiến độ, quyết định. Nói miệng hoặc để trong bộ nhớ riêng của agent thì người khác không thấy.
- Bản online bị lỗi mà agent chưa sửa kịp thì báo Trum. Trum quay bản online về bản trước trên Cloudflare.

## Phần 4. Lỗi hay gặp

| Thấy gì | Làm gì |
|---|---|
| Clone báo `Repository not found` | Chưa nhận lời mời ở bước 1, hoặc Git đang nhớ tài khoản GitHub khác. Mở **Credential Manager** của Windows, mục **Windows Credentials**, xoá dòng `git:https://github.com`, clone lại |
| PowerShell báo không nhận ra `git`, `node`, `npm` | Cài xong phải mở PowerShell mới. Vẫn lỗi thì cài lại, để mặc định |
| `python` không chạy | Dùng `py` thay cho `python` |
| `Port 5180 is already in use` | Đang có một bản thử khác chạy. Tìm cửa sổ PowerShell đó, bấm Ctrl+C, hoặc đóng hẳn cửa sổ |
| Push báo `rejected` | Người khác vừa push trước. Nói với agent "pull --rebase rồi push lại" |
| Push báo `GH007` | GitHub đang chặn lộ email. Vào GitHub **Settings** > **Emails**, chép địa chỉ `...@users.noreply.github.com`, khai lại email ở bước 2 bằng địa chỉ đó |
| Robot báo X đỏ | Mở dòng bị đỏ trong tab Actions, đưa link cho agent sửa |
