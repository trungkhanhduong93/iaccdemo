# Phiếu mua hàng điện thoại theo Figma (T600)

- Ngày: 21/10/2026
- Người: Trum, agent: Claude Code điều phối, Antigravity (Gemini 3.8 Flash High) viết code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/ui/mobile/MLapPhieu.tsx`: màn sửa, thêm mới phiếu mua theo spec `backup/spec-T600.md` phần B. Có thẻ đầu, 3 lựa chọn thanh toán, sheet Thanh toán ngay cao 85dvh, sheet chọn quỹ 70dvh. Có sheet chọn và thêm nhà cung cấp, công tắc Nhận kèm hoá đơn, Giảm giá và Thuế GTGT áp chung. Thẻ hàng chia lưới 3 cột, sheet chọn hàng hoá có chọn tất cả, khối Tổng cộng nằm cuối danh sách.
- `MLapPhieu.tsx`: tách hàm `dungNoiDungPhieuMua` dùng cho nút Lưu phiếu và đường lưu trước khi thanh toán ngay. Lưu phiếu mua giờ ghi đủ địa chỉ, MST, người giao dịch. Tắt Nhận kèm hoá đơn thì 3 trường hoá đơn lưu rỗng.
- `MLapPhieu.tsx`: `thucHienLuu` không còn tự lập phiếu chi cho phiếu mua. Sửa phiếu cũ giữ nguyên `_httt`, `_soTienTra`, `_ctTt`, `_dsTt`, `_quy`.
- `src/ui/mobile/MDtThuChiLap.tsx`: đọc `dienSan` từ `state` của `navigate`, điền sẵn quỹ, ngày, số tiền, đối tượng, lý do, tham chiếu. Lưu xong thì ghi thêm lần thanh toán vào `_dsTt` của phiếu mua, quay về màn xem phiếu mua.
- `src/ui/mobile/MXemPhieu.tsx`: màn xem phiếu mua theo phần A. Lịch sử thanh toán chuyển vào menu ⋯.
- `src/styles/app.css`: mục `Phiếu mua hàng điện thoại theo Figma (T600)` cuối file, lớp `m-t600-*`, màu lấy biến `:root`.

## Đã kiểm

- `npm run typecheck`: không lỗi.
- `npm run build`: chạy xong, không lỗi.
- `python tools/kiem_tra.py --nhanh`: `Không có lỗi.` Chạy ở cổng 5181 với `KIEM_TRA_URL=http://localhost:5181/`, vì cổng 5180 đang có phiên khác giữ.
- `python tools/kiem_van.py` cho `MXemPhieu.tsx`, `MLapPhieu.tsx`, `MDtThuChiLap.tsx`: 0 ĐỎ. Còn 1 VÀNG, rơi vào chuỗi svg.
- Soát lớp CSS: mọi lớp `m-t600-` trong tsx đều có luật CSS, không còn CSS thừa.
- Chưa so ảnh từng ý A1–A8, B1–B11 trên điện thoại. Trum xem bằng mắt trước khi push.

## Dở dang, việc tiếp theo

- Không. Trum xem `?goi=PR#/app/mua-hang/4-1-1` (phiếu MH2610-0022) và `?goi=F` ở khổ 390×844.
- Ca biên còn để ngỏ: lần thanh toán ghi vào `_dsTt` ghép từ bản chụp lúc chuyển màn (`dienSan.dsTtCu`). Store `daXoa.ts` chưa có hàm đọc phiếu theo id. Hai người cùng trả một phiếu mua thì có thể mất lần trả của người kia. Bản mẫu chưa có backend nên chưa xử lý.
- T597 (dinhlanphuongipacc) cũng sửa `MLapPhieu.tsx`. Ai push sau thì gộp tay, giữ ràng buộc ô hoá đơn của T597.

## Bẫy, quyết định mới

- Không.
