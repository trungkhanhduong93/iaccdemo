# Bắt đầu với iaccdemo

Tài liệu này dành cho thành viên mới, chưa quen Git và lập trình. Bạn không cần tự viết code. Claude Code sẽ làm mọi việc: kiểm tra máy, cài thư viện, sửa code, kiểm thử, ghi nhật ký và đưa lên GitHub. 

Việc của bạn: gõ lệnh vào Claude Code, xem kết quả trên trình duyệt, và hỏi Trum khi không chắc nghiệp vụ kế toán.

## Phần 1. Lần đầu tiên

Bạn đã có tài khoản GitHub được mời vào repo và đã cài sẵn Claude Code trên máy. Bây giờ chỉ cần làm đúng 3 bước:

### Bước 1. Tải mã nguồn về máy

1. Bấm phím Windows trên bàn phím, gõ `PowerShell`, bấm phím Enter.
2. Chép từng dòng lệnh sau, dán vào cửa sổ PowerShell rồi bấm Enter:

```powershell
cd D:\
git clone https://github.com/trungkhanhduong93/iaccdemo.git
cd iaccdemo
```

Nếu máy bạn không có ổ D, thay dòng đầu tiên bằng `cd C:\`.  
Nếu Git bật cửa sổ hỏi đăng nhập GitHub: bạn đăng nhập đúng tài khoản đã được Trum mời rồi bấm cho phép.

### Bước 2. Bật Claude Code

Tại đúng cửa sổ PowerShell vừa tải xong ở trên, gõ:

```powershell
claude
```

Nếu lần đầu chạy Claude Code hỏi đăng nhập tài khoản Anthropic: bấm Enter để mở trình duyệt và đăng nhập tài khoản Claude của bạn.

### Bước 3. Dán câu mở đầu cho Claude Code

Khi màn hình chat của Claude Code hiện lên, bạn chỉ cần chép nguyên văn câu sau, thay tên GitHub của bạn (ví dụ `PhuongXT` hoặc `dinhlanphuongipacc`), rồi bấm Enter:

```text
Tui là <tên GitHub của bạn>. Tui là người mới. Đọc BAT-DAU.md và AGENTS.md, kiểm tra máy tui đã đủ công cụ chưa (Node, Python, Chrome, Playwright), cài giúp tui những thứ còn thiếu, rồi hướng dẫn tui việc Trum giao cho tui.
```

Đến đây là xong việc chuẩn bị của bạn. Claude Code sẽ tự động kiểm tra máy, cài đặt thư viện và báo cho bạn biết Trum đã giao việc gì và cần làm gì tiếp theo.

## Hướng dẫn cho Claude Code khi gặp câu mở đầu của người mới

Mục này dành riêng cho Claude Code đọc và tự động thực thi.

Khi người dùng dán câu chào ở Bước 3 trên, Claude Code bắt buộc làm đủ các bước sau bằng lệnh tự động, không để người dùng phải tự gõ lệnh thủ công:

1. Kiểm tra môi trường máy:
   - Chạy `node -v` (yêu cầu Node 20 trở lên) và `npm -v`. Nếu chưa có Node, đưa link https://nodejs.org và dặn người dùng tải bản LTS. Nếu đã có Node, tự chạy `npm ci` để cài đủ thư viện frontend cho repo.
   - Chạy `python --version` hoặc `py --version`. Nếu chưa có Python, đưa link https://www.python.org/downloads/ (nhắc tick ô Add python.exe to PATH).
   - Kiểm tra Playwright bằng `python -c "import playwright"`. Nếu thiếu, tự chạy lệnh `pip install playwright` (hoặc `py -m pip install playwright`).
   - Kiểm tra Google Chrome trên máy (cần Chrome để chạy script `tools/kiem_tra.py`).
2. Chạy thử bản web:
   - Chạy thử `npm run dev` xem cổng 5180 có khởi động bình thường không.
   - Hướng dẫn người dùng mở trình duyệt vào http://localhost:5180 bấm thử đăng nhập xem có vào được màn hình kế toán không.
3. Đồng bộ và nhận việc:
   - Chạy `git pull --rebase` để đảm bảo code mới nhất.
   - Đọc `docs/TIEN-DO.md`, tìm dòng việc có tên GitHub của người dùng trong cột "Người làm" (hoặc việc chưa có người làm theo thứ tự ưu tiên từ trên xuống).
   - Đọc 3 file nhật ký mới nhất trong `docs/nhat-ky/` và nhật ký liên quan đến việc đó.
4. Báo cáo lại cho người dùng bằng tiếng Việt, lời lẽ dễ hiểu:
   - Thông báo tình trạng máy: đã đủ công cụ hay chưa, đã chạy thử được web chưa.
   - Giới thiệu công việc: Trum đang giao cho bạn việc mã số mấy (vd T03, T08...), công việc đó làm gì trên giao diện phần mềm kế toán.
   - Đề xuất bước tiếp theo cụ thể và hỏi người dùng có muốn bắt đầu làm ngay không.

## Phần 2. Mỗi lần ngồi vào làm việc hàng ngày

Mỗi ngày ngồi vào máy, bạn chỉ cần làm theo các bước sau:

### 1. Mở Claude Code
Mở PowerShell, gõ:

```powershell
cd D:\iaccdemo
claude
```

Hoặc `cd C:\iaccdemo` nếu bạn để ở ổ C.

### 2. Dán câu bắt đầu phiên
Dán câu sau vào ô chat của Claude Code:

```text
Tui là <tên GitHub của bạn>. Làm theo AGENTS.md: kéo bản mới về, đọc tiến độ và nhật ký, cho tui biết việc Trum giao cho tui và phiên trước dừng ở đâu.
```

### 3. Làm việc cùng Claude Code
- Claude Code sẽ kể việc Trum giao và hỏi bạn muốn sửa phần nào.
- Bạn chỉ cần nói yêu cầu bằng tiếng Việt bình thường (ví dụ: "Thêm cột thuế vào bảng", "Đổi tên nút Lưu thành Ghi sổ"...).
- Khi Claude Code sửa xong, bảo Claude: "Chạy bản thử giúp tui". Bạn mở http://localhost:5180 trên trình duyệt tự bấm xem đã ưng ý chưa.
- Nếu không chắc nghiệp vụ kế toán hoặc ý của Trum, hãy dừng lại hỏi Trum ngay, không để Claude đoán mò.

### 4. Khi làm xong việc
Khi bạn bấm thử trên web thấy ưng ý rồi, nói với Claude Code:

```text
Xong việc này rồi. Kiểm tra code, chạy typecheck, build, test, ghi nhật ký, cập nhật tiến độ rồi push lên GitHub giúp tui.
```

Claude Code sẽ tự chạy bộ kiểm tra, ghi nhật ký phiên làm việc, cập nhật bảng tiến độ và đẩy code lên GitHub. Sau khoảng 2 phút, robot sẽ đưa bản mới lên trang web demo https://iaccdemo.pages.dev.

### 5. Khi hết giờ hoặc muốn nghỉ giữa chừng
Nếu công việc chưa xong hẳn nhưng đến giờ nghỉ, bạn chỉ cần nói:

```text
Hôm nay dừng ở đây. Ghi nhật ký dở dang, cập nhật tiến độ rồi push giúp tui.
```

Lần sau bạn (hoặc người khác) mở lên, Claude Code sẽ đọc lại nhật ký và tiếp tục làm đúng chỗ đã dừng.

## Phần 3. Những luật cần nhớ

- Ai cũng tự push thẳng lên `main`: không cần tạo pull request hay chờ ai duyệt, nhưng Claude Code bắt buộc phải chạy bộ kiểm tra (typecheck, build, kiem_tra.py) không có lỗi thì mới được push.
- Cấm lệnh có cờ force: nếu Claude Code đề nghị gõ lệnh git nào có chữ `--force`, bạn từ chối ngay và báo Trum.
- Mọi việc đều lưu trong repo: mọi tiến độ, nhật ký, quyết định đều nằm trong thư mục `docs/`. Không giữ thông tin trong trí nhớ riêng.
- Khi robot báo đỏ: xem tại https://github.com/trungkhanhduong93/iaccdemo/actions. Nếu thấy dấu X màu đỏ, bạn chỉ cần copy lỗi hoặc đưa link cho Claude Code: "Robot báo đỏ, sửa giúp tui".

## Phần 4. Bảng xử lý lỗi nhanh khi tải code lần đầu

| Hiện tượng | Cách xử lý |
|---|---|
| Báo `Repository not found` | Bạn chưa bấm nhận lời mời vào repo của Trum trên GitHub, hoặc máy tính đang lưu tài khoản GitHub cũ. Vào Credential Manager của Windows > Windows Credentials, tìm xoá dòng `git:https://github.com` rồi chạy lại lệnh `git clone`. |
| Báo `cd : Cannot find path 'D:\'` | Máy bạn không có ổ D. Hãy đổi sang ổ C: gõ `cd C:\` rồi tiếp tục `git clone`. |
| Báo `claude : The term 'claude' is not recognized` | Máy bạn chưa cài Claude Code CLI. Gõ lệnh: `npm install -g @anthropic-ai/claude-code` rồi gõ lại `claude`. |
| `Port 5180 is already in use` | Đang có một cửa sổ khác chạy bản thử. Tìm cửa sổ đó bấm Ctrl+C để tắt, hoặc bảo Claude Code tắt tiến trình chiếm cổng. |
| Push báo `rejected` | Người khác vừa push code mới trước bạn. Nói với Claude: "pull --rebase rồi push lại giúp tui". |
