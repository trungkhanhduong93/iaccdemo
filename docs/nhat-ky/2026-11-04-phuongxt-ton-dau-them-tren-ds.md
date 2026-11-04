# Tồn kho ban đầu sửa ngay trên bảng (T736)

- Ngày: 04/11/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- Lần 1 làm dòng nhập đầu bảng trên màn danh mục chung (`themTaiCho`). PhuongXT góp ý muốn đơn giản hơn nên bỏ hẳn cách đó, trả `CatalogScreen.tsx`, `Table.tsx`, `types.ts` về như cũ.
- `src/modules/kho/TonKhoBanDau.tsx` (mới): màn riêng cho 5.1.12, mọi dòng là ô sửa: Kho, Mặt hàng (nguyên vật liệu và hàng có tồn kho, chọn có tìm), ĐVT, Số lượng, Đơn giá, Thành tiền tự tính.
  - Nút + ở mỗi dòng chèn dòng trống ngay dưới (cùng kho), con trỏ vào ô Mặt hàng. Nút + ở tiêu đề cột thêm dòng cuối bảng.
  - Nút thùng rác ở mỗi dòng xoá dòng. Bỏ cột Trạng thái, bỏ panel thêm, sửa.
  - ĐVT chọn được đơn vị quy đổi của mặt hàng (lấy từ danh mục Quy đổi ĐVT, `quyDoiTuDanhMuc`). Đổi ĐVT thì đơn giá đổi theo, dưới số lượng hiện số ĐVT chính, vd "= 0,012 kg".
  - Thanh trên: tìm theo mã, tên; lọc kho; số dòng; Nhập, Xuất Excel. Chân bảng: tổng thành tiền.
  - Dòng giữ trong phiên (biến `luuPhien`), rời màn quay lại vẫn còn; tải lại trang thì về dữ liệu mẫu.
- `src/modules/kho/data.ts`: bỏ `tonBanDau` (cấu hình danh mục), thêm `tonBanDauMau()` sinh dòng mẫu như cũ.
- `src/modules/kho/index.ts`: 5.1.12 đổi sang `kind: 'custom'`, `comp: TonKhoBanDau`.
- Cuối `src/styles/app.css`: mục T736.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_tra.py --nhanh`: lần đầu báo 5.1.12 không có tiêu đề màn, thêm `h1.sr-only`, chạy lại `Không có lỗi.`
- `python tools/kiem_van.py src/modules/kho/TonKhoBanDau.tsx`: sạch.
- Chạy thử gói Plus: dòng Thịt bò thăn đổi ĐVT kg sang g, đơn giá 320.000 thành 320, hiện "= 0,012 kg"; bấm + ra dòng trống ngay dưới; bấm xoá thì dòng mất, tổng cộng tính lại.

## Dở dang, việc tiếp theo

- Không. Màn chưa có nút Lưu: sửa xong là giữ luôn trong phiên.

## Bẫy, quyết định mới

- Không.
