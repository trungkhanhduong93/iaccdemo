# Lọc theo kho ở Kiểm kê, Điều chỉnh kho (T130)

- Ngày: 10/10/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `VoucherScreen.tsx`: dòng phiếu kiểm kê, điều chỉnh có `_khoDs` theo kho của phiếu; bộ lọc thêm ô Kho (dùng chung cách lọc kho của mua, bán ở T94), hiện sẵn ngoài thanh lọc ở hai màn này.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- Trên trình duyệt gói Free: ô Kho hiện ở thanh lọc của Kiểm kê và Điều chỉnh kho.
- `python tools/xuat_bao_cao_he_thong.py` không chạy được trên máy này (thiếu `../Present/tools/build_present`), chưa làm mới file Excel.

## Dở dang, việc tiếp theo

- Danh sách kho trong ô lọc lấy mọi kho có trên phiếu, chưa thu theo chi nhánh đang chọn (giống mua, bán).

## Bẫy, quyết định mới

- Không.
