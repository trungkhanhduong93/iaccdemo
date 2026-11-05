# Phân quyền chọn phân hệ bằng dropdown, Vai trò thành Chức vụ (T742)

- Ngày: 05/11/2026
- Người: Trum, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `HeThong.tsx`: card chi tiết của `PhanQuyen` chuyển sang dropdown phân hệ, dòng Tất cả tính năng, dòng theo nhóm, ô không có thao tác là công tắc disabled. Thêm `dsManPhanHe`, `nhomMan`. `apDungQuyen` có luật riêng cho Tiện ích bổ sung, Kê khai thuế, Số dư ban đầu, Tính giá vốn. Bỏ ô `cv` khỏi form Người dùng.
- `MHeThong.tsx`: giữ bố cục, công tắc của phân hệ không có màn nào dùng thao tác đó thì disabled.
- Đổi chữ Vai trò thành Chức vụ ở `he-thong/index.ts`, `SidebarFlyout.tsx`, `huong-dan.ts`, `MHeThong.tsx`, `xuat_bao_cao_he_thong.py`, `kiem_tra.py`.
- `mock.ts`: bỏ trường `cv` của người dùng mẫu.
- `app.css`: bỏ CSS accordion của T375, thêm mục T742.
- `kiem_tra.py`: thêm `kiem_tra_t742_phan_quyen`.

## Đã kiểm

- `npm run typecheck`, `npm run build`: mã thoát 0.
- `python tools/kiem_tra.py --nhanh`: in `Không có lỗi.`
- `kiem_tra_t742_phan_quyen` chạy trong `--nhanh`: ô readonly, đổi phân hệ không mất quyền vừa sửa, không còn chữ Vai trò.
- `python tools/kiem_van.py` cho `HeThong.tsx`, `huong-dan.ts`, `MHeThong.tsx`: sạch.
- Điện thoại đã mở thử khung 390x844 bằng Playwright. Bước tour `phanHe` chưa bấm thử trong trình duyệt.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- QD95 trong `docs/QUYET-DINH.md`.
