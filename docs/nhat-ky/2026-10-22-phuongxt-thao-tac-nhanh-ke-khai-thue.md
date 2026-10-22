# Thao tác nhanh trang chủ thay Sổ quỹ bằng Kê khai thuế (T627)

- Ngày: 22/10/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/app/thaoTacNhanh.ts`: thêm mục `ke-khai-thue` (Kê khai thuế, `/app/thue/to-khai`) vào `THAO_TAC_UNG_VIEN`; `MAC_DINH_FREE` đổi `so-quy` thành `ke-khai-thue`.
- `src/app/thaoTacNhanh.ts`: `layTatCaThaoTac` bỏ mục cố định khi màn của nó không hiện ở gói đang dùng (`hienMan`), để gói Plus, Pro không thấy Kê khai thuế hộ kinh doanh.
- `src/ui/mobile/MTrangChuFree.tsx`: `layIconThaoTac` dùng icon gradient `ke-khai-thue` cho mục icon `percent`. Trang chủ Free web (`BaBaiToanFree.tsx`) đã có sẵn ánh xạ này.

## Đã kiểm

- `npm run typecheck`: không lỗi.
- `npm run build`: chạy xong, không lỗi.
- `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- Chưa mở trình duyệt xem bằng mắt.

## Dở dang, việc tiếp theo

- Không. Gói Standard, Plus, Pro vẫn mặc định Sổ quỹ (`MAC_DINH_KHAC`); muốn đổi gói Standard thì hỏi PhuongXT.
- Máy đã lưu Tuỳ chỉnh thao tác nhanh (localStorage `iacc-thao-tac-nhanh`) vẫn giữ danh sách cũ, bấm khôi phục mặc định mới thấy Kê khai thuế.

## Bẫy, quyết định mới

- Không.
