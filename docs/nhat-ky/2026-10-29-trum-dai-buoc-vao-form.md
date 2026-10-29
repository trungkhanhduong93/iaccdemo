# Dải bước Hướng dẫn nhanh đi theo vào form phiếu (T676)

- Ngày: 29/10/2026
- Người: Trum, agent: Claude Code (phiên trên mây)
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/ui/huongDanForm.ts` (mới): kho nhỏ để `FormToanMan` báo form toàn màn đang mở, `ChungTuForm` hỏi dải có đang chạy không và báo đã lưu.
- `src/ui/FormToanMan.tsx`: form mở thì tự báo qua `ganForm`.
- `src/ui/HuongDanNhanh.tsx`: form mở khi dải đang chạy thì dải, số cam, khung đủ được đưa vào trong form. Dải nằm ngay dưới thanh đầu form, thân form co lại. Số cam chỉ tìm chỗ trong form. Nhiều khoá cùng một chỗ gom thành một vòng.
- Cùng file, cách dải đổi bước:
  - Mở phiếu mới (`/moi`) khi dải còn ở bước trước form thì sang bước đầu trong form.
  - Đóng form lúc đang ở bước trong form: đã lưu thì sang bước sau form, chưa lưu thì về bước mở form.
  - Lưu và thêm thì về bước đầu trong form.
  - Bước trong form mà form chưa mở thì dải hiện nút làm ngay của bước mở form, vd Ghi một khoản chi.
- Cùng file: khoá ô trong form `ttc`, `chi-tiet`, `luu` (`O_FORM`). Thanh trên đang xem Tất cả cửa hàng thì `ttc`, `chi-tiet` tạm chỉ vào ô chọn cửa hàng (`KHUON_FORM`). Bộ chung màn chứng từ thêm `o: 'ttc'` cho bước "Điền thông tin rồi bấm Lưu". Khoá `tong` tìm ô Tổng cộng `.pt-bar .pt-tc` trước: `tfoot` nằm khuất dưới vùng cuộn của bảng nên trước đây bước Tổng cộng không có số cam. Dải có `data-o`, vòng số cam có `data-k` để máy kiểm.
- `src/ui/generic/ChungTuForm.tsx`: gắn `data-hd="ttc"` cho khối ô đầu form, `data-hd="chi-tiet"` cho bảng dòng chi tiết, `data-hd="luu"` cho nút Lưu. Lưu xong gọi `baoDaLuu()`. Lưu phiếu mới khi dải đang chạy thì đóng form về danh sách thay vì ở lại xem phiếu.
- `src/modules/tien/huong-dan.ts`: Thu chi bước 3 tách thành 3 bước: đối tượng, lý do ở phần đầu phiếu; diễn giải, số tiền ở bảng Chi tiết; bấm Lưu. Lý do: phiếu chi gói Standard để diễn giải, số tiền ở bảng Chi tiết. Trum duyệt cách này, Thu chi thành 7 bước.
- `src/modules/kho/huong-dan.ts`: Kiểm kê bước 2 chỉ vào bảng chi tiết, thêm bước Bấm Lưu. `src/modules/ban-hang/huong-dan.ts`: Xuất bán POS bước 3 đổi chữ theo ô Tổng cộng. Trum duyệt chữ cả 3 file.
- `src/styles/app.css`: mục mới cuối file (T676) cho dải, khung, số cam trong form.
- `tools/kiem_tra.py`: thêm `kiem_tra_t676_huong_dan`, chạy cả trong `--nhanh`. Gói Standard, màn 1440, 6 màn:
  - đi hết các bước bằng Bước kế, bước có khoá o phải có số cam đúng số bước; báo tên màn, số bước, khoá thiếu;
  - riêng Thu chi kiểm thêm: dải nằm dưới thanh đầu form, nút Lưu không bị che, khung đủ nằm giữa dải và chân form, hộp thoại nằm trên dải, Lưu xong form đóng, dải sang bước kế.
- `docs/QUYET-DINH.md` QD87 ghi phần đã làm thay dòng "Chưa làm". `docs/KIEN-TRUC.md` ghi khoá ô trong form.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_tra.py --nhanh`: "Không có lỗi.", bước T676 in "đúng". Máy trên mây trỏ `/opt/google/chrome/chrome` sang Chromium có sẵn, cài gói Python `playwright` 1.63.0.
- Thử bỏ `data-hd="chi-tiet"` và trả khuôn `tong` về cũ: bước kiểm báo đúng "Thu chi bước 4: thiếu số cam ở khoá o chi-tiet", "Xuất bán POS bước 3: thiếu số cam ở khoá o tong". Đã trả code lại.
- Script thử riêng, màn 1440, gói Standard, không đưa vào repo:
  - Thu chi: bước 2 bấm Ghi một khoản chi thì form mở, dải ở bước 3 nằm ngay dưới thanh đầu form, số cam 3, 4, 5 đúng chỗ. Bấm Lưu thì form đóng, dải ở bước 6.
  - Lưu và thêm về bước 3. Đóng không lưu về bước 2.
  - Không lỗi console.
- `python tools/kiem_van.py` cho file có chữ đã sửa: không có mục ĐỎ.
- Bỏ qua `python tools/xuat_bao_cao_he_thong.py` theo lời Trum dặn: lệnh chỉ chạy được trên máy Trum. File Excel báo cáo chưa làm mới, chạy lại trên máy Trum.

## Dở dang, việc tiếp theo

- Không. Màn dựng riêng có form khác (`CongThuc.tsx` không dùng `FormToanMan`, tờ khai thuế) chưa có khoá ô trong form: gắn khi soạn hướng dẫn riêng ở T677.

## Bẫy, quyết định mới

- QD87 thêm phần dải trong form. Không có bẫy mới. Lưu ý khi sửa tiếp: `.mtabs` có `z-index` 20 nên lớp số cam nằm trong đó không nổi được lên form dù đặt `z-index` cao. Vì vậy lớp số cam được đưa vào trong form.
