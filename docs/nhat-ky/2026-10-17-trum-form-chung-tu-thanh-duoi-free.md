# Form chứng từ web: thanh dưới bằng nhau, gói Free chỉ điền lý do, đối tượng ở phần trên (T346)

- Ngày: 17/10/2026
- Người: Trum, agent: Claude Code điều phối, Antigravity viết code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/ui/generic/ChungTuForm.tsx`: nút ở thanh dưới lúc xem bỏ cỡ `sm`, cao bằng lúc sửa. Gói Free, phiếu thu, chi tiền mặt và thu, chi ngân hàng (`thu`, `chi`, `bc`, `unc`): khi sửa hoặc thêm mới, mọi dòng lấy Lý do, Đối tượng phía trên; lưu thì dòng lưu đúng giá trị phía trên; bấm Huỷ sửa thì trả dòng về như đã lưu.
- `src/ui/generic/BangSua.tsx`: thêm 2 tham số chung `chiXemLy`, `chiXemDt`, cột tương ứng hiện chữ, không cho chọn. Chỗ khác dùng BangSua không truyền thì như cũ.
- `src/styles/app.css`: mục cuối T346.
- Coordinator sửa lại: worker cho effect gán tài khoản theo lý do (T233) và effect gán đối tượng dừng sớm ở gói Free, làm đổi lý do thì TK Nợ, Có của dòng không đổi theo. Đã bỏ 2 chỗ dừng sớm; 2 effect này vốn gán lý do, đối tượng phía trên cho mọi dòng.
- Gói S, PL, PR không đổi: cột Lý do, Đối tượng ở dòng vẫn chọn được.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi. `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- Playwright gói F, `#/app/tien/2-1-1/chi-3`: thanh dưới 49px lúc xem và lúc sửa; khi sửa có 2 ô chỉ xem, đúng lý do, đối tượng phía trên; không lỗi trang.
- Worker kiểm gói PL cột dòng vẫn chọn được.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- Không.
