# Nối ô sơ đồ Kho gói Free tới danh sách (T128)

- Ngày: 10/10/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `kho/quy-trinh.ts` (`luongFree`): Kiểm kê kho mở danh sách `kho/5-1-10` thay form thêm mới; Xuất điều chỉnh, Nhập điều chỉnh (trước là ô chỉ để xem) mở `kho/dieu-chinh?loai=xdc`, `?loai=ndc`.
- `VoucherScreen.tsx`: tab con của Điều chỉnh kho lấy loại ban đầu từ tham số `?loai=` trên đường dẫn.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- Trên trình duyệt gói Free: bấm Nhập điều chỉnh trên sơ đồ mở tab Nhập điều chỉnh (NDC2610-0256, NDC2610-0248); ô Kiểm kê kho trỏ `#/app/kho/5-1-10`.
- `python tools/xuat_bao_cao_he_thong.py` không chạy được trên máy này (thiếu `../Present/tools/build_present`), chưa làm mới file Excel.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- Không.
