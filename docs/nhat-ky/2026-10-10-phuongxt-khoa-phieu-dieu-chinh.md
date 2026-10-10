# Phiếu điều chỉnh chỉ xem, xoá theo kiểm kê (T129)

- Ngày: 10/10/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `ChungTuForm.tsx`: phiếu điều chỉnh (`laDc`) không có nút Sửa, phím Ctrl+E, mục Sao chép, mục Xoá chứng từ trong Tiện ích. Hộp xác nhận xoá phiếu kiểm kê ghi thêm số phiếu điều chỉnh sẽ bị xoá theo (xoá theo đã có từ T126).
- `LocNangCao.tsx`: `NutHangLoat` thêm `khongXoa` ẩn các mục xoá. `VoucherScreen.tsx`: màn Điều chỉnh kho bật `khongXoa`; xoá hàng loạt phiếu kiểm kê xoá luôn phiếu điều chỉnh của các phiếu đó.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- Trên trình duyệt gói Free: phiếu NDC2610-0256 không có nút Sửa, Tiện ích chỉ còn Xuất Excel. Xoá KK2610-0256: hộp xác nhận báo NDC2610-0256 bị xoá theo; tab Nhập điều chỉnh còn 1 phiếu.
- `python tools/xuat_bao_cao_he_thong.py` không chạy được trên máy này (thiếu `../Present/tools/build_present`), chưa làm mới file Excel.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- Không.
