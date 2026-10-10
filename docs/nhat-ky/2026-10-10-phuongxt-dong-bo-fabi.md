# Cấu hình cách đồng bộ bán hàng FABi; theo dõi tồn kho (T107, T108, T109)

- Ngày: 10/10/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `session.tsx`: `dongBoFabi` ('chiTiet' hoặc 'kenh', thiếu là 'kenh').
- `he-thong/HeThong.tsx` Cấu hình kế toán: khung Đồng bộ bán hàng từ FABi, hai lựa chọn có mô tả; bảng Đánh số chứng từ ghi Xuất bán POS dùng số hoá đơn FABi.
- `ban-hang/ChungTuBanHang.tsx`: `theoKenh` chia doanh thu ngày thành Tại quán, Mang về (phần thu tại quầy 70/30), App giao đồ ăn (theo tiền app); `theoDon` chia thành từng hoá đơn (số đơn của ngày), giờ trải 09:00 tới 22:00, kênh, cách thanh toán theo tỷ lệ của ngày. Hàm `chiaTheo` cho phần cuối nhận số dư nên tổng doanh thu, thuế mỗi ngày giữ nguyên.
- Số chứng từ là số hoá đơn FABi 12 ký tự theo hạt giống của từng chứng từ. Cột Ngày có giờ; thêm cột Kênh bán (lọc kiểu chọn); nhãn cách đồng bộ trên thanh công cụ, bấm mở Cấu hình.
- T108 `data/mock.ts`: HANG có `tonKho` (món chế biến false, bia lon, nước suối true); danh mục 1.2 thêm trường Theo dõi tồn kho (`truong-dm.ts`, cột IS_INVENTORY) và cột Theo dõi tồn (ô tích chỉ xem `.o-tich-xem`); nguyên vật liệu luôn có. Xuất bán POS thêm cột Theo dõi tồn kho, cột cuối `dinh: 'phai'`, bật tắt được ở Tuỳ chỉnh giao diện.
- T109: danh sách bỏ cột Nguồn và ô lọc Nguồn; nhãn cách đồng bộ ghi Chi tiết hoặc Tổng hợp, rê chuột xem đủ.
- Form: kênh, thời gian xuất theo chứng từ. Hoá đơn lấy 1 tới 3 món (`dongMonDon`), chứng từ theo kênh chia theo cơ cấu món như trước (`dongCuaPhieu`).

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi. `python tools/kiem_tra.py --nhanh`: `Không có lỗi.`
- Gói Plus, chi nhánh Nguyễn Trãi, tháng 10: theo kênh 21 chứng từ; ngày 07/10 ba kênh 10.404.056, 4.459.453, 1.666.904, cộng 16.530.413 bằng chứng từ cả ngày trước đây. Chi tiết 1.113 hoá đơn; Tổng cộng cả hai cách đều 188.834.421.
- Hoá đơn N8BW3VNAAQD3: thẻ, tại quán, 21:54, 3 món, Tổng tiền 216.547. Đã trả máy thử về mặc định theo kênh.
- T108: Xuất bán POS: cột Theo dõi tồn kho cuối bảng, cuộn ngang đầu hay cuối mép phải vẫn ở 1004px; PHO01 tới TRA01 bỏ tích, BIA01, NS01 có tích. Danh mục 1.2 cùng giá trị, NVL001 tới NVL003 có tích.

## Dở dang, việc tiếp theo

- Phiếu thu tiền bán hàng bên Thu chi vẫn tham chiếu chứng từ gộp theo ngày (`soBH`), chưa theo cách đồng bộ.
- Món cuối của hoá đơn nhận phần dư nên số lượng × đơn giá có thể lệch thành tiền vài nghìn.

## Bẫy, quyết định mới

- Không.
