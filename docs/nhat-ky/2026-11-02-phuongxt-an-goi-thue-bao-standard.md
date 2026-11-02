# Gói Standard ẩn Gói thuê bao, sửa tab Hệ thống (T712)

- Ngày: 02/11/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/modules/types.ts`: thêm `anTab?: Goi[]` cho ScreenDef, các gói trong danh sách không hiện tab của màn, đường dẫn vẫn mở được.
- `src/modules/he-thong/index.ts`: Gói thuê bao gắn `anTab: ['S']`; Nhật ký thao tác chuyển xuống tab cuối.
- `src/app/ModuleTabs.tsx`, `src/ui/mobile/MKhac.tsx`, `src/app/SidebarFlyout.tsx`: lọc màn có `anTab` chứa gói đang dùng.
- `src/app/Topbar.tsx`: menu tài khoản gói Standard ẩn mục Gói thuê bao.
- `src/modules/he-thong/HeThong.tsx`: nhãn "Định dạng số" đổi thành "Tiêu chuẩn định dạng số".
- Gói Standard vẫn mở Gói thuê bao từ nút Nâng cấp, So sánh gói, nhãn gói cạnh logo, nút dùng thử.

## Đã kiểm

- `npm run typecheck`: không lỗi.
- `npm run build`: chạy xong, không lỗi.
- `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- `python tools/kiem_van.py src/modules/he-thong/HeThong.tsx`: Sạch.
- Chưa mở trình duyệt xem tận mắt.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- Không.
