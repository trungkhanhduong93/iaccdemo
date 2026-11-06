# Chi phí mua hàng phân bổ vào từng mặt hàng (T757)

- Ngày: 06/11/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- Vẽ bản mẫu trên artifact. Lần lượt thử: khối ngay dưới lưới hàng, tab riêng, tab có NCC và cách thanh toán từng khoản. PhuongXT chốt cách gọn nhất: một nút tích, một ô số tiền, một nút Phân bổ, chia theo giá trị hàng.
- Phiếu mua hàng có nút tích Chi phí mua hàng cạnh Nhận kèm hoá đơn (`ChungTuForm.tsx`). Tích thì đầu dải đáy form (chỗ trống bên trái Tổng tiền) có ô số tiền, nút Phân bổ; bỏ tích thì xoá số đã chia trên các dòng.
- `ChiPhiMuaHang.tsx`: hàm `phanBoCp` chia theo thành tiền trừ chiết khấu, phần lẻ do làm tròn dồn vào dòng giá trị lớn nhất; `OChiPhiMua` là ô ở dải đáy. Số trên dòng khác số chia lại thì hiện chữ đỏ "Chưa phân bổ".
- `DaiTong` (cuối `ChungTuForm.tsx`) có thêm prop `trai` để đặt ô ở đầu dải.
- `gen.ts`: dòng hàng có thêm `cpMua`. `BangSua.tsx`: cột Chi phí mua hàng trước Giá trị nhập kho (prop `coCpMua`, mã cột `cpMua`), chỉ hiện khi đang tích; Giá trị nhập kho cộng thêm `cpMua`.
- Phiếu lưu số tiền vào `_cpMua`; có số thì mở lại phiếu tự tích sẵn.
- Cuối `app.css` mục T757.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_tra.py --nhanh`: `Không có lỗi.`
- `python tools/kiem_van.py src/ui/generic/ChiPhiMuaHang.tsx`: sạch.
- `python tools/xuat_bao_cao_he_thong.py` không chạy được: thiếu `../Present/tools/build_present.py` trên máy PhuongXT, nên chưa làm mới file xlsx.
- Mở tay phiếu mua hàng mới gói Plus (Phố Mây Lê Lợi), tích Chi phí mua hàng, gõ 650.000, thấy chữ "Chưa phân bổ". Ấn Phân bổ thì cột Chi phí mua hàng ra 650.000, Giá trị nhập kho 1.770.000, chữ đỏ mất. Chỉ thử phiếu một dòng hàng.

## Dở dang, việc tiếp theo

- Chưa có bút toán chi phí mua hàng ở tab Hạch toán, chưa tách nhà cung cấp chi phí, chưa có cách thanh toán riêng cho chi phí. Bản mẫu 4 trường hợp (cùng NCC hay khác NCC, trả ngay hay ghi nợ) đã vẽ trên artifact, chờ Trum chốt nghiệp vụ.
- Người dùng tắt Tổng tiền ở Tuỳ chỉnh giao diện phiếu thì dải đáy ẩn, ô chi phí ẩn theo.
- Điện thoại (`MLapPhieu.tsx`) chưa có.

## Bẫy, quyết định mới

- Không.
