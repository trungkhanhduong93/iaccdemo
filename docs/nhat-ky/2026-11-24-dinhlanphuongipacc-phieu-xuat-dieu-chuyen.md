# Phiếu xuất điều chuyển trên máy tính (T926)

- Ngày: 24/11/2026
- Người: dinhlanphuongipacc, agent: Claude Code
- Trạng thái cuối phiên: Dở dang (phần điện thoại chưa làm)

## Đã làm

- `src/modules/kho/BangDieuChuyen.tsx`: Kho nhận của Phiếu xuất điều chuyển là mọi kho trừ kho xuất đang chọn, kể cả kho cùng cửa hàng.
- Cùng file: bảng chi tiết như Phiếu mua hàng (hàng Tổng cộng luôn hiện, Thêm dòng, Thêm hàng loạt, Xoá hết), tách cột Mã hàng và Tên hàng hoá, ĐVT chọn theo quy đổi của hàng, đổi ĐVT thì giá vốn quy theo.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_van.py src/modules/kho/BangDieuChuyen.tsx`: sạch.
- Xem tay trên trình duyệt: chọn kho xuất, Thêm dòng, Thêm hàng loạt, đổi ĐVT kg sang g đều chạy.
- `python tools/kiem_tra.py --nhanh`: dừng ở ca T870/T871 (Thẻ kho, `.bc-ban-du-lieu table.tbl` không hiện), do T923 đổi popup Thẻ kho. Không liên quan file đã sửa. Các ca trước đó đều qua.

## Dở dang, việc tiếp theo

- Điện thoại (`src/ui/mobile/MLapPhieuKho.tsx`): Xuất điều chuyển vẫn chọn Cửa hàng nhận rồi mới chọn kho. Cần đổi sang kho nhận là mọi kho trừ kho xuất như máy tính, đổi bố cục theo phiếu mua hàng (`MLapPhieu.tsx`, lớp `m-t655-*`, `m-t601-*`, `m-t656-*`), chân phiếu ghi Tổng tiền vốn. MLapPhieuKho.tsx đang do T552 (Trum) giữ, hỏi Trum trước.
- Ca `kiem_tra_the_kho` (T870/T871) cần cập nhật theo T923.
- Chưa làm: nút phễu lọc dòng và kéo giãn cột ở bảng điều chuyển.

## Bẫy, quyết định mới

- Không.
