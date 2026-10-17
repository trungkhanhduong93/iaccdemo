# Trang chủ gói Free bản điện thoại theo bản web (T324)

- Ngày: 17/10/2026
- Người: Trum, agent: Claude Code điều phối, 2 Antigravity viết code, 1 Antigravity review
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/ui/mobile/MTrangChuFree.tsx` (mới): trang chủ điện thoại gói Free. Thứ tự: phần đầu, thanh thao tác nhanh, chọn năm và tháng, Quản lý lãi lỗ, Quỹ tiền, Mua hàng & công nợ NCC, Hao hụt kiểm kê, nhắc khoá sổ. Số liệu gọi đúng hàm bản web đang dùng.
- `src/ui/mobile/MKhoFree.tsx` (mới): khối Mua hàng & công nợ NCC, Hao hụt kiểm kê, dùng `khoFree.ts` như bản web.
- `src/ui/mobile/MTrangChu.tsx`: `MTrangChu` chọn `MTrangChuFree` khi gói F, gói S, PL, PR chạy ở `MTrangChuCoPhi`. Gỡ code chỉ phục vụ gói Free.
- `src/styles/app.css`: 2 mục cuối file T324 (lớp `m-tcf-`, `m-tck-`).
- Không đụng `src/modules/home/` vì T316 đang sửa `BaBaiToanFree.tsx`.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi. `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- Worker đối chiếu số tháng 10, tất cả cửa hàng: doanh thu 616.423.000 đ, lãi 51.957.923 đ, tồn quỹ 640.783.000 đ khớp web; khối kho khớp web cả tất cả cửa hàng và một cửa hàng; 6 nút mở đúng màn.
- Review chéo bắt lỗi ĐỎ: hook gọi sau return sớm ở `MTrangChu`, đổi gói sẽ lỗi React. Đã tách `MTrangChuCoPhi`, bỏ 4 import thừa.
- Playwright 390x844 gói F, PL, PR, S: không lỗi console. Gói F có 5 thẻ, gói khác 13 thẻ.
- `kiem_tra.py --dien-thoai` chưa chạy được hết vì T323.

## Dở dang, việc tiếp theo

- T316 xong thì chép chữ mới của trang chủ Free web sang `MTrangChuFree.tsx`, `MKhoFree.tsx`.
- Lớp CSS `m-free-*` cũ có thể còn sót không dùng, chưa dọn.

## Bẫy, quyết định mới

- Không.
