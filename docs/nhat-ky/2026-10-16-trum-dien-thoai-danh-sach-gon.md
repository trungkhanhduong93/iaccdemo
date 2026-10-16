# Điện thoại bỏ quy trình, danh sách gọn, lọc báo cáo, chi phí phân bổ (T281)

- Ngày: 16/10/2026
- Người: Trum, agent: Claude Code giao Antigravity (gemini-3.8-flash-high) qua Orca
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/ui/mobile/MNghiepVu.tsx`, `MQuyTrinh.tsx`, `manMobile.ts`: bỏ sơ đồ quy trình ở mọi gói. Bấm phân hệ vào màn đầu có giao diện điện thoại, ưu tiên nhóm Chứng từ (`manDauMobile`). Đường dẫn `…/quy-trinh` cũ tự chuyển sang danh sách. Phân hệ không có màn chạy trên điện thoại thì ẩn khỏi tab Nghiệp vụ (`coManMobile`).
- `src/ui/mobile/MChungTu.tsx`, `MDanhSach.tsx`, `MLoc.tsx`: danh sách chứng từ theo mẫu Trum gửi. Có tab loại phiếu, hàng lọc ngày và trạng thái, dòng số chứng từ và tổng tiền. Thẻ gồm số phiếu, trạng thái, đối tượng, ngày, số dòng hàng, số tiền. Nút Thêm mới nổi.
- `src/ui/mobile/MobileShell.tsx`: nút quay lại vùng bấm 44px, mũi tên 24px nét đậm, tiêu đề 18px.
- `src/ui/mobile/MBaoCaoLoc.tsx` (mới): nút lọc trên thanh đầu báo cáo, mở tấm chọn kỳ, chi nhánh và ô lọc riêng của báo cáo.
- `src/ui/mobile/MBaoCaoTheoDoi.tsx` (mới): tab Báo cáo theo dõi, chứa danh mục và báo cáo trước chỉ có trong sơ đồ.
- `src/ui/mobile/MCcdc.tsx` (mới): phân hệ Chi phí phân bổ trên điện thoại. Có danh sách thẻ chi phí, tấm chọn chi nhánh kéo lên từ dưới, chi tiết thẻ, form ghi tăng.
- `src/styles/app.css`: mục T281 cuối file, chỉ lớp m-*.
- `tools/kiem_tra.py`: bài kiểm 11B và 22B đổi sang kiểm luồng mới, bấm phân hệ phải ra danh sách. Bài 22B bỏ phân hệ Thuế, vì gói Free không còn màn Thuế nào trên điện thoại.

## Đã kiểm

- `npm run typecheck`, `npm run build`: chạy xong, không lỗi.
- `python tools/kiem_tra.py --nhanh` với vite cổng 5181: in `Không có lỗi.` Chạy riêng `kiem_tra_dot_11_b`, `kiem_tra_dot_22_b`: không lỗi.
- 8 ảnh khung 390x844: Thu chi gói Free và gói Pro, danh sách Mua hàng, danh sách Kho có tab, Sổ quỹ có tấm lọc, thẻ chi phí, tấm chọn chi nhánh, chi tiết thẻ.
- Vòng sửa 1: danh sách Mua hàng hiện số tiền âm và ghi "0 hàng hoá". Thẻ chi phí xuống dòng chữ "đ". Đã sửa.
- Coordinator sửa thêm 3 chỗ:
  - Thuế gói Free chuyển sang màn chưa có trên điện thoại. Đã thêm `manDauMobile` và `coManMobile`.
  - Bài kiểm 22B có điều kiện không bao giờ báo lỗi. Đã sửa cho bắt lỗi thật.
  - Form ghi tăng dùng thẻ `select` gốc. Đã đổi sang tấm `MChon`.

## Sửa sau khi push

- Bản đã push làm trang chủ điện thoại mất thanh tab dưới. Lý do: `laBaoCao` trong `MobileShell.tsx` coi mọi màn `custom` là báo cáo, mà trang chủ cũng là màn `custom`. Đã sửa: màn `custom` chỉ tính là báo cáo khi `vaoBaoCao(sc)` đúng.
- Bài `kiem_tra_dang_nhap_dot_8` bắt được lỗi này, nhưng `--nhanh` không chạy bài đó. Đã sửa bài này theo luồng mới: bấm Thu chi vào thẳng danh sách.

## Dở dang, việc tiếp theo

- T282: phiếu nhập liệu 1 màn cho mọi nghiệp vụ trên điện thoại.

## Bẫy, quyết định mới

- QD65: điện thoại bỏ sơ đồ quy trình. Chọn màn đầu phải kiểm `manMobile(sc) !== MChiMayTinh`, không chỉ kiểm gói. Nếu chỉ kiểm gói, màn đầu có thể rơi vào câu "Màn này chưa có trên điện thoại".
