# Làm mới Excel báo cáo hệ thống sau T171 (T172)

- Ngày: 13/10/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- Chạy `tools/xuat_bao_cao_he_thong.py`, làm mới `docs/IACC-Cloud-Chi-Tiet-He-Thong.xlsx`: 139 tính năng, 147 màn hình, 62 dòng báo cáo và mẫu in, 176 việc.
- Việc giao cho Trum, PhuongXT làm thay khi đã có thư mục `Present`.

## Đã kiểm

- Sheet Báo cáo & Mẫu in: 2 dòng Còn dùng mọi gói, 11 dòng Còn dùng chỉ TT58, 32 dòng Đã ẩn, khớp T171.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- Máy PhuongXT để `Present` ở `C:\Users\phuong.nguyen\Desktop\IACC-CLOUD\Present`, không phải `D:\IPOS\IACC CLOUD\Present` như công cụ tìm. Chạy được bằng cách chỉ đường qua biến môi trường: `PYTHONPATH="C:/Users/phuong.nguyen/Desktop/IACC-CLOUD/Present/tools" python tools/xuat_bao_cao_he_thong.py`. File Excel tính năng phải nằm cạnh thư mục `Present`.
- Không chép thư mục `Present` vào trong repo: nó có `.wrangler` (thông tin đăng nhập Cloudflare), lỡ `git add` là lộ.
