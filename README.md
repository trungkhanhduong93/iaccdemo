# Tài liệu iaccdemo

Bản mẫu giao diện phần mềm kế toán web IACC Cloud. Dữ liệu giả, chưa nối backend, chạy hoàn toàn trên trình duyệt.

- Bản online: https://iaccdemo.pages.dev. Đăng nhập bằng email bất kỳ, mật khẩu từ 6 ký tự.
- Mã nguồn: https://github.com/trungkhanhduong93/iaccdemo, repo riêng tư.
- Mỗi lần có người push lên nhánh `main`, robot GitHub Actions kiểm code rồi đưa bản mới lên link online.

## Người mới bắt đầu từ đâu

1. Đọc [BAT-DAU.md](BAT-DAU.md): cài máy, lấy mã nguồn về, làm việc mỗi ngày cùng agent.
2. Mở [docs/TIEN-DO.md](docs/TIEN-DO.md) xem Trum giao việc gì cho bạn.

Agent (Claude Code, Antigravity, Codex, Cursor) tự đọc [AGENTS.md](AGENTS.md) khi mở thư mục này. Claude Code đọc qua [CLAUDE.md](CLAUDE.md).

## Thành viên

| GitHub | Việc |
|---|---|
| trungkhanhduong93 (Trum) | Giao việc, chốt quyết định, quản lý GitHub và Cloudflare |
| PhuongXT | Sửa mọi thứ trong repo theo việc được giao |
| dinhlanphuongipacc | Sửa mọi thứ trong repo theo việc được giao |

## Bộ tài liệu

| File | Nội dung | Đọc khi nào |
|---|---|---|
| [BAT-DAU.md](BAT-DAU.md) | Cài máy, quy trình mỗi ngày, lỗi hay gặp | Người mới, đọc một lần |
| [AGENTS.md](AGENTS.md) | Luật cho agent: đầu phiên, trước khi push, cuối phiên, việc cấm | Agent đọc mỗi phiên |
| [docs/TIEN-DO.md](docs/TIEN-DO.md) | Bảng việc: ai làm, trạng thái, thứ tự ưu tiên | Đầu mỗi phiên |
| [docs/nhat-ky/](docs/nhat-ky/) | Mỗi phiên làm việc một file: đã làm, đã kiểm, dừng ở đâu | Đầu mỗi phiên |
| [docs/KIEN-TRUC.md](docs/KIEN-TRUC.md) | Cấu trúc thư mục, quy ước code | Trước khi sửa code |
| [docs/BAY.md](docs/BAY.md) | Bẫy đã gặp và cách tránh | Trước khi sửa code |
| [docs/QUYET-DINH.md](docs/QUYET-DINH.md) | Quyết định đã chốt, lý do, việc cố ý chưa làm | Trước khi đổi bố cục, nghiệp vụ, thư viện |
| [docs/TRIEN-KHAI.md](docs/TRIEN-KHAI.md) | Robot deploy, khoá Cloudflare, script chỉ chạy trên máy Trum | Khi đụng build, deploy, dữ liệu sinh từ Excel |
| [CHANGELOG.md](CHANGELOG.md) | Bản online đổi gì, theo ngày | Khi cần biết có gì mới |

## Lệnh hay dùng

```bash
npm ci                           # cài thư viện đúng bản đã khoá, chạy sau khi clone
npm run dev                      # chạy thử ở http://localhost:5180
npm run typecheck                # kiểm lỗi kiểu TypeScript
npm run build                    # đóng gói ra thư mục dist/
python tools/kiem_tra.py --nhanh # mở thử mọi màn ở gói Medium, cần npm run dev đang chạy
```
