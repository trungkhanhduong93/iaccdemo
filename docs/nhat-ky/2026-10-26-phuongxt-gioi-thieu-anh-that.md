# Màn Giao diện kế toán IACC dùng ảnh thật trang chủ gói Standard (T664–T667)

- Ngày: 26/10/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `public/trang-chu-standard.jpg`: ảnh chụp trang chủ gói Standard (1440×900, Phố Mây, Tất cả cửa hàng).
- `KhoiTaoFabi.tsx`: bước Giao diện kế toán IACC thay khung minh hoạ vẽ tay bằng ảnh trên; số 1–5 gắn lên ảnh theo % (mảng `VUNG`).
- `KhoiTaoFabi.tsx`: sửa chữ mục Thanh phân hệ, Tổng quan, Chứng từ tự sinh theo góp ý PhuongXT; thêm mục 5 Thuế và sổ sách; câu dẫn đổi thành "Trang chủ gói Standard gồm các phần sau."
- T665, `OnboardFabi.tsx` bước Đơn vị: hộ kinh doanh nhãn CCCD/MST, không bắt buộc; doanh nghiệp nhãn Mã số thuế *, nút Tiếp tục tắt khi chưa nhập.
- T666, `OnboardFabi.tsx` + cuối `app.css`: hàng nút popup thành `.ktf-pop-nut`, sticky sát đáy (`bottom` âm bằng lề dưới popup để nội dung không lộ dưới nút); màn hẹp ghi đè quy tắc `.card > .row:last-child` cũ.
- T667, `OnboardFabi.tsx` màn Đang lấy dữ liệu: mảng `viecTai` 4 việc theo mốc %, thêm Thu chi tiền (`soTcDaTao` là số mẫu, 3 phiếu một cửa hàng một ngày); màn xong ghi số đã lấy. CSS cuối `app.css` mục T667.
- Cuối `app.css` mục T664: `.ktf-anh`, cột ảnh rộng 1,6 phần.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- `python tools/kiem_van.py src/modules/onboarding/KhoiTaoFabi.tsx`: Sạch.
- T665 thử bằng Playwright: doanh nghiệp chưa nhập mã số thuế thì Tiếp tục tắt, nhập rồi thì bật; hộ kinh doanh để trống vẫn bật.
- T666 đo bằng Playwright: đáy nút trùng đáy popup ở 1440×700 và 390×844.
- T667 chụp màn đang tải (giữa chừng) và màn xong ở 1440×900: hiện đủ 4 việc, dấu xong, vòng quay.
- Chụp vùng giới thiệu ở 1440×900: số 1–5 nằm đúng thanh phân hệ, ô cửa hàng, Kết quả kinh doanh, Quỹ tiền, Kê khai thuế.

## Dở dang, việc tiếp theo

- Không.
- Trang chủ Standard đổi bố cục thì chụp lại ảnh (Playwright, khổ 1440×900, phiên gói `S`, `#/app`) và chỉnh `VUNG`.
- T667 là bản vẽ thử theo ý PhuongXT: số phiếu thu chi là số mẫu, chưa nối dữ liệu thu chi FABi thật; chưa hỏi Trum có đưa thu chi FABi vào bước khởi tạo không.
- CSS `.ktf-mo*` của T138 không còn dùng, chưa xoá.

## Bẫy, quyết định mới

- Không.
