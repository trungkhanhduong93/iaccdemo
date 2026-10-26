# Màn Giao diện kế toán IACC dùng ảnh thật trang chủ gói Standard (T664)

- Ngày: 26/10/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `public/trang-chu-standard.jpg`: ảnh chụp trang chủ gói Standard (1440×900, Phố Mây, Tất cả cửa hàng).
- `KhoiTaoFabi.tsx`: bước Giao diện kế toán IACC thay khung minh hoạ vẽ tay bằng ảnh trên; số 1–5 gắn lên ảnh theo % (mảng `VUNG`).
- `KhoiTaoFabi.tsx`: sửa chữ mục Thanh phân hệ, Tổng quan, Chứng từ tự sinh theo góp ý PhuongXT; thêm mục 5 Thuế và sổ sách; câu dẫn đổi thành "Trang chủ gói Standard gồm các phần sau."
- Cuối `app.css` mục T664: `.ktf-anh`, cột ảnh rộng 1,6 phần.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- `python tools/kiem_van.py src/modules/onboarding/KhoiTaoFabi.tsx`: Sạch.
- Chụp vùng giới thiệu ở 1440×900: số 1–5 nằm đúng thanh phân hệ, ô cửa hàng, Kết quả kinh doanh, Quỹ tiền, Kê khai thuế.

## Dở dang, việc tiếp theo

- Không.
- Trang chủ Standard đổi bố cục thì chụp lại ảnh (Playwright, khổ 1440×900, phiên gói `S`, `#/app`) và chỉnh `VUNG`.
- CSS `.ktf-mo*` của T138 không còn dùng, chưa xoá.

## Bẫy, quyết định mới

- Không.
