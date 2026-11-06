# Chi phí mua hàng phân bổ vào từng mặt hàng (T757)

- Ngày: 06/11/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- Vẽ bản mẫu trên artifact trước, PhuongXT chốt: chi phí nằm ngay trong phiếu mua hàng, không tách màn riêng, không nối sang màn Chi phí mua hàng 4.1.5; chỉ một nút Phân bổ, chia theo giá trị hàng, không có lựa chọn cách chia.
- File mới `src/ui/generic/ChiPhiMuaHang.tsx`: khối Chi phí mua hàng dưới lưới hàng (khoản chi phí, nhà cung cấp dịch vụ, số tiền, thuế GTGT, nút Thêm chi phí, Tổng chi phí, nút Phân bổ). Hàm `phanBoCp` chia theo thành tiền trừ chiết khấu, phần lẻ do làm tròn dồn vào dòng giá trị lớn nhất. Dòng chữ nhỏ dưới nút báo đã phân bổ, chưa phân bổ, hoặc hàng, chi phí đã đổi cần ấn lại (so số đang có với số chia lại, không lưu cờ riêng).
- `gen.ts`: dòng hàng có thêm `cpMua`.
- `BangSua.tsx`: thêm cột Chi phí mua hàng trước Giá trị nhập kho (prop `coCpMua`, mã cột `cpMua` trong Tuỳ chỉnh cột); Giá trị nhập kho cộng thêm `cpMua` ở cả chế độ xem, sửa, dòng tổng, hàng lọc.
- `ChungTuForm.tsx`: `coCpMua` = phiếu mua có Tổng nhập kho, không phải trả lại hàng, kiểm kê, sản xuất, điều chuyển. Danh sách khoản chi phí lưu vào `_cpMua` của phiếu. Khối ẩn khi đang mở bộ lọc dòng.
- Cuối `app.css` mục T757. Khối `position: sticky; left: 0` để lưới hàng cuộn ngang thì khối vẫn nằm trong khung nhìn.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_tra.py --nhanh`: `Không có lỗi.`
- `python tools/kiem_van.py src/ui/generic/ChiPhiMuaHang.tsx`: sạch.
- `python tools/xuat_bao_cao_he_thong.py` không chạy được: thiếu `../Present/tools/build_present.py` trên máy PhuongXT, nên chưa làm mới file xlsx.
- Mở tay phiếu mua hàng mới gói Plus (Phố Mây Lê Lợi), thêm Phí vận chuyển 650.000 rồi ấn Phân bổ. Cột Chi phí mua hàng ra 650.000, Giá trị nhập kho 1.120.000 + 650.000 = 1.770.000. Chỉ thử phiếu một dòng hàng; phiếu nhiều dòng chưa bấm tay.

## Dở dang, việc tiếp theo

- Tab Hạch toán chưa có bút toán chi phí mua hàng (Nợ 156, 1331 / Có 331 nhà cung cấp dịch vụ). Ô nhà cung cấp dịch vụ đang là ô chữ, chưa chọn từ danh mục nhà cung cấp. Hỏi Trum có cần không.
- Điện thoại (`MLapPhieu.tsx`) chưa có khối này.
- Tổng tiền của phiếu (trả nhà cung cấp hàng) không cộng chi phí mua hàng, vì chi phí trả cho nhà cung cấp dịch vụ khác.

## Bẫy, quyết định mới

- Không.
