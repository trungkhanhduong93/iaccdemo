# Lọc dòng ở bảng chi tiết chứng từ (T383)

- Ngày: 17/10/2026
- Người: dinhlanphuongipacc, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/ui/generic/ChungTuForm.tsx`: phễu lọc nhỏ ngay sau tab cuối (Lịch sử) trên thanh tab bảng chi tiết; bấm thì bật, tắt hàng lọc và chuyển về tab Chi tiết. Mặc định ẩn. Áp dụng khi thêm mới, sửa, xem chi tiết. Đã thử nút Lọc bên phải thanh tab, rồi phễu ở đầu form; người dùng chốt đặt sau tab Lịch sử.
- `src/ui/generic/BangSua.tsx`: thêm `hienLoc`. Bật thì dưới tiêu đề có hàng lọc như danh sách chứng từ (lớp `loc-hang`, ô `OLoc` của `src/ui/LocCot.tsx`: ô gõ cộng phễu chọn điều kiện). Cột chữ lọc Chứa, Bằng, Bắt đầu với…; cột số lọc =, >, Trong khoảng…. Dòng giữ số thứ tự gốc nên sửa trên dòng đã lọc vẫn ghi đúng dòng. Tắt Lọc thì xoá từ lọc. Dòng Tổng cộng vẫn cộng mọi dòng.
- `src/styles/app.css`, mục cuối T383: phễu lọc trên thanh tab; hàng lọc dùng kiểu sẵn có của danh sách.
- `src/ui/generic/BangKiemKe.tsx`: phiếu kiểm kê có `hienLoc`, hàng lọc cùng kiểu (Mã hàng, Tên, ĐVT, Tồn hệ thống, Tồn thực tế, Chênh lệch, Loại, Ghi chú); `ChungTuForm.tsx` hiện phễu cả ở kiểm kê.
- `src/modules/ban-hang/ChungTuBanHang.tsx`: chứng từ Xuất bán POS có phễu sau tab cuối (Hàng bán, Ghi sổ); bảng Hàng bán dùng `loc` sẵn có của `Table`, lọc dòng trước khi đưa vào bảng.
- Chưa làm cho phiếu sản xuất, điều chuyển (bảng riêng).

## Đã kiểm

- `npm run typecheck`: không lỗi.
- `npm run build`: chạy xong, không lỗi.
- `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- Phiếu mua hàng MH2610-0021 trên localhost: hàng lọc ẩn sẵn; bấm phễu sau tab Lịch sử hiện hàng lọc giống danh sách mua hàng; gõ "kg" ở cột ĐVT còn 2 dòng (Bánh phở tươi, Sườn heo); chuyển sang Sửa vẫn lọc, số thứ tự 3, 4 giữ nguyên.
- Kiểm kê KK2610-0258: lọc cột Loại "xuat" còn 2 dòng Xuất điều chỉnh. Xuất bán POS RKSEMJYZ25F3: lọc cột Hàng hoá "pho" còn 2 món phở.
- Chưa làm mới `docs/IACC-Cloud-Chi-Tiet-He-Thong.xlsx`: `tools/xuat_bao_cao_he_thong.py` cần thư mục `Present/tools` cạnh repo, máy này không có.

## Dở dang, việc tiếp theo

- Commit chỉ nằm trên máy, chưa push: người dùng dặn khi nào bảo mới push.

## Bẫy, quyết định mới

- Không.
