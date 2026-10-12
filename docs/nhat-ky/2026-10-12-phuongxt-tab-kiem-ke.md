# Tab Kiểm kê có 3 tab con, bỏ tab Điều chỉnh kho (T167)

- Ngày: 12/10/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/modules/types.ts`: `ScreenDef` có thêm `tabCha`. Màn có `tabCha` không có tab riêng trên thanh tab. Khi mở màn đó, tab mang slug `tabCha` sáng.
- `src/app/ModuleTabs.tsx`: bỏ màn có `tabCha` khỏi thanh tab; tab đang sáng lấy theo `tabCha`.
- `src/modules/kho/index.ts`, `dieu-chinh.ts`: màn Điều chỉnh kho (`kho/dieu-chinh`) đặt `tabCha` là Kiểm kê (`5-1-10`). Đường dẫn cũ, `?loai=` và liên kết từ sơ đồ quy trình vẫn chạy.
- `src/ui/generic/VoucherScreen.tsx`: danh sách Kiểm kê và Điều chỉnh kho có cùng 3 tab con là Kiểm kê, Xuất điều chỉnh, Nhập điều chỉnh. Bấm tab con là chuyển sang đúng màn.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `PYTHONIOENCODING=utf-8 python tools/kiem_tra.py --nhanh`: Không có lỗi.
- `kiem_van.py` 5 file đã sửa: sạch.
- Bấm thử Phố Mây gói Plus. Thanh tab Kho không còn Điều chỉnh kho. Đi Kiểm kê, sang Nhập điều chỉnh, sang Xuất điều chỉnh rồi về Kiểm kê, tab con đúng mỗi lần, tab Kiểm kê trên thanh tab luôn sáng.

## Dở dang, việc tiếp theo

- Số đếm cạnh tên tab con chỉ có ở Xuất, Nhập điều chỉnh khi đang ở màn điều chỉnh. Ở màn Kiểm kê không có số.

## Bẫy, quyết định mới

- Không.
