# Chi tiết Xuất bán POS điện thoại đủ thông tin như web (T651)

- Ngày: 23/10/2026
- Người: Trum, agent: Claude Code (phiên cloud)
- Trạng thái cuối phiên: Xong

## Đã làm

- So chi tiết phiếu Xuất bán POS web (`ChungTuBanHang.tsx`, `ChiTiet`) với điện thoại (`MXuatBanPos.tsx`), vẽ 3 mẫu A, B, C trong artifact "Mẫu app Xuất bán POS"; Trum chọn mẫu A và chỉnh: bỏ In phiếu, STT, mã cạnh tên, chi tiết dòng thụt vào, tổng nền xám, FABi cam.
- `src/ui/mobile/MXuatBanPos.tsx`: tấm chi tiết đơn viết lại theo mẫu A. Dòng nhắc đồng bộ FABi; thẻ Đơn hàng POS (Số đơn POS, Thời gian xuất, Cửa hàng, Kho xuất, Kênh, Thanh toán); thẻ Khách hàng và Hoá đơn lấy từ `donPosCua` như web, trống ghi "—", không có hoá đơn thì nhãn "Không có thông tin HĐĐT"; nút chép mã tra cứu. Dòng hàng: STT, tên, mã, tổng dòng = doanh thu trước thuế + thuế (GTGT theo % doanh thu thì trừ giảm thuế), 3 dòng chi tiết (thêm Chiết khấu, Phí dịch vụ khi khác 0). Khung tổng tách Giảm giá, Chiết khấu, bỏ Phiếu giảm giá, Phí vận chuyển chỉ hiện khi khác 0. Trạng thái "Đã đồng bộ" khi đã ghi hoặc gói không ghi sổ, như web (T613). Thêm hàm `O` cho ô nhãn trên giá trị dưới.
- `src/styles/app.css`: mục mới cuối file "(T651)", lớp `m-xb651-*`. Lớp cũ `.m-pos-ct-ttin`, `.m-pos-mon-*-b`, `.m-pos-b-bien-lai` không còn dùng ở màn này, chưa xoá.

## Đã kiểm

- `npm run typecheck`: không lỗi. `npm run build`: chạy xong, không lỗi.
- `python tools/kiem_tra.py --nhanh` (máy cloud, Chromium có sẵn thay cho Chrome): "Không có lỗi."
- Playwright khung 390×844 gói PR: mở đơn có hoá đơn và đơn khách lẻ, đủ 3 thẻ, không tràn ngang, không lỗi console.
- `python tools/kiem_van.py src/ui/mobile/MXuatBanPos.tsx`: sạch.
- Chưa chạy `kiem_tra.py --dien-thoai` (đang kẹt ở T525).
- Chưa làm mới `docs/IACC-Cloud-Chi-Tiet-He-Thong.xlsx`: `tools/xuat_bao_cao_he_thong.py` cần module `build_present` không có trên máy cloud. Lần sau chạy ở máy Trum.

## Dở dang, việc tiếp theo

- Không.
- T575 (thêm In phiếu trên điện thoại): mẫu A Trum chốt không có nút In phiếu, Trum xem có bỏ T575 không.
- Dữ liệu giả hoá đơn FABi lẻ còn lộ T574: món cuối có số lượng × đơn giá khác thành tiền (vd 1 Phần × 60.000 = 31.000 đ), nay hiện rõ hơn vì dòng chi tiết ghi phép nhân.

## Bẫy, quyết định mới

- Không.
