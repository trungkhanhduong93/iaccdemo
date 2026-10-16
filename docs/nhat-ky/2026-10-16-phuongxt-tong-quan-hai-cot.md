# Tab Tổng quan trang chủ Free: 2 cột trên, Quản lý kho dưới, bỏ 6 biểu đồ (T293)

- Ngày: 16/10/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/modules/home/BaBaiToanFree.tsx`:
  - Lưới tab Tổng quan thêm lớp `bbt-e-luoi-2`: hàng trên chỉ còn 1. Quản lý lãi lỗ và 2. Quản lý thu chi.
  - 3. Quản lý kho (lớp `bbt-kho-ngang`) kéo hết hàng dưới, 3 thẻ Nhập mua, Công nợ phải trả, Hao hụt kiểm kê xếp ngang trong `bbt-kho-the`.
  - Bỏ hẳn lưới 6 thẻ biểu đồ (5 thẻ top 5 và Lãi lỗ theo chi nhánh), cùng các `useMemo` top 5 và import thừa.
  - Vẫn giữ `laiLoCn` vì hộp lãi lỗ 13 tháng còn dùng khi xem theo chi nhánh. Các hàm, component biểu đồ trong `BieuDoFree.tsx` để nguyên.
- Vòng tồn quỹ (T291) phóng lên 260px cho vừa cột thu chi mới, khoảng 695px ở màn 1700px. Chữ giữa vòng và chú thích to theo, khối vòng lấp phần còn lại của cột. Cột không cao thêm vì cột lãi lỗ vẫn cao hơn.
- `src/styles/app.css`: mục cuối "Trang chủ Free: 2 cột trên, Quản lý kho hàng dưới, bỏ 6 thẻ biểu đồ (T293)". Màn dưới 900px thì mọi thứ về 1 cột.
- `tools/kiem_tra.py`, bài kiểm T274 web:
  - Bước 3, 4, 4b (đủ 6 thẻ biểu đồ, tổng top 5 so doanh thu, tổng lãi chi nhánh) đổi thành kiểm không còn thẻ biểu đồ, lưới 2 cột, có hàng Quản lý kho.
  - Bước 6 đổi chi nhánh so số lãi ở cột Quản lý lãi lỗ, thay cho số trong thẻ biểu đồ.

## Đã kiểm

- `npm run typecheck`: không lỗi.
- `npm run build`: chạy xong, không lỗi.
- `python tools/kiem_van.py src/modules/home/BaBaiToanFree.tsx`: sạch.
- `python tools/kiem_tra.py --nhanh`:
  - Lần đầu quá thời gian khi mở trang, ngay sau khi lấy code T281 của Trum về.
  - Lần hai báo 6 lỗi thiếu thẻ biểu đồ (đúng vì đã bỏ) và 2 lỗi Quy trình tiền.
  - Sau khi sửa bài T274: `Không có lỗi.`, 2 lỗi Quy trình tiền không lặp lại.
- Trên máy, Hộ kinh doanh Cà phê Góc Nhỏ gói Free, rộng 1700px:
  - Hàng trên 2 cột, Quản lý kho kéo hết hàng dưới với 3 thẻ ngang, không còn biểu đồ, trang không tràn ngang.
  - Tab Cần theo dõi và hộp lãi lỗ 13 tháng vẫn chạy.
  - Thử xong đã trả phiên về Phố Mây gói Plus.
- Chưa sửa bản điện thoại.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- Không.
