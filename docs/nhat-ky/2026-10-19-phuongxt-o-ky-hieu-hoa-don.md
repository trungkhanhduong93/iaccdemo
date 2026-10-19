# Gộp Mẫu số, Ký hiệu hoá đơn thành ô Ký hiệu; ô chọn ngày (T463, T464)

- Ngày: 19/10/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `ui/generic/ChungTuForm.tsx`, khối hoá đơn đầu phiếu (`ct-hd-dau`, mua tích Nhận kèm hoá đơn, bán tích Lập kèm hoá đơn): thứ tự Số hoá đơn, Ký hiệu, Ngày hoá đơn, mỗi ô một hàng. Bỏ ô Mẫu số HĐ (chỉ là ô `defaultValue="1"`, không lưu).
- Tab Hoá đơn của form: cùng thứ tự, bỏ ô Mẫu số hoá đơn, nhãn Ký hiệu hoá đơn đổi thành Ký hiệu.
- Ô Ký hiệu vẫn dùng `kyHieuHd` (vd `1C26TMM`, ký tự đầu là mẫu số), có chú thích khi rê chuột. Cột Ký hiệu HĐ ở danh sách chứng từ giữ nguyên. Bản điện thoại (`MLapPhieu.tsx`) đã có sẵn thứ tự Số hoá đơn, Ký hiệu nên không sửa.
- T464: `ChungTuForm.tsx` Ngày chứng từ khi sửa luôn là `ONgay` (trước chỉ phiếu thu chi, màn khác là ô gõ chữ). Phiếu sản xuất, điều chuyển có giờ (`07/10/2026 11:45`): chọn ngày trên lịch thì nối lại giờ đang có, giờ gõ trong ô. `ChonNgay.tsx` lịch chỉ đọc phần ngày của giá trị (trước đọc chuỗi có giờ thì mở nhầm tháng 7). Cột hoá đơn đầu phiếu 260px lên 280px để ô Ngày hoá đơn đủ năm (ô 120px mà chữ cần 128px). `MCongThuc.tsx` Ngày áp dụng dùng `ONgay`.

## Đã kiểm

- `npm run typecheck`, `npm run build`, `python tools/kiem_tra.py --nhanh`: không lỗi.
- Trình duyệt gói Plus 1640x900: phiếu mua MH2610-0022 và Hoá đơn bán hàng (3-1-2) khối hoá đơn hiện Số hoá đơn, Ký hiệu, Ngày hoá đơn, ba hàng thẳng với hai cột bên trái.
- T464 trên trình duyệt 1640x900: Sửa phiếu mua, ô Ngày hoá đơn 140px đủ chữ; bấm lịch Ngày chứng từ chọn 15 ra 15/10/2026. Phiếu Xuất điều chuyển mới: lịch mở Tháng 10/2026, chọn 12 ra 12/10/2026 11:45. Không lưu phiếu nào.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- Không.
