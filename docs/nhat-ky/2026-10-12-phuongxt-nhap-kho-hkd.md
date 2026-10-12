# Giá trị nhập kho của hộ kinh doanh gồm thuế GTGT (T164)

- Ngày: 12/10/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/ui/generic/BangSua.tsx`: thêm prop `gtnkCoThue`. Khi bật, Giá trị nhập kho từng dòng và dòng tổng = tiền trước thuế + tiền thuế GTGT.
- `src/ui/generic/ChungTuForm.tsx`, `VoucherScreen.tsx`: bật `gtnkCoThue` khi đơn vị là hộ kinh doanh (`loaiHinhDv`). Lý do: hộ kinh doanh không khấu trừ thuế GTGT đầu vào. Dải tổng của form dùng cùng cách tính.
- Đổi mã việc: PhuongXT nhận T159 đến T163 nhưng chưa push, trong khi dinhlanphuongipacc đã push việc thẻ chi phí mang mã T159. Vì vậy việc của PhuongXT đã đổi thành T160 đến T164 trong TIEN-DO, nhật ký, CHANGELOG, ghi chú code. Các commit trước lần đổi vẫn mang mã cũ.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `PYTHONIOENCODING=utf-8 python tools/kiem_tra.py --nhanh`: Không có lỗi.
- `kiem_van.py` 3 file đã sửa: 0 ĐỎ. Còn 1 VÀNG có từ trước ở `ChungTuForm.tsx`.
- Bấm thử phiếu mua MH2610-0022. Ở Cà phê Góc Nhỏ (hộ kinh doanh): tiền trước thuế 4.751.000 + thuế 27.550 = Giá trị nhập kho 4.778.550. Ở Phố Mây (doanh nghiệp), Giá trị nhập kho vẫn bằng tiền trước thuế. Thử xong trả phiên về Phố Mây gói Plus.

## Dở dang, việc tiếp theo

- Giá vốn, thẻ kho, xuất nhập tồn của hộ kinh doanh chưa lấy giá trị nhập kho có thuế.

## Bẫy, quyết định mới

- Việc nhận mà chưa push thì người khác không thấy, nên dễ lấy trùng mã. Commit nhận việc phải push ngay như AGENTS.md dặn.
