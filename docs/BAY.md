# Bẫy đã gặp

Lỗi đã từng làm mất thời gian, kèm cách tránh. Đọc trước khi sửa phần liên quan. Gặp lỗi mới mất hơn 15 phút mới ra nguyên nhân thì ghi thêm vào đây.

## Code

- TypeScript cài ra bản 7.0.2. Nếu `tsc` báo lỗi lạ về tuỳ chọn trong tsconfig, xem lại tuỳ chọn đó trước khi sửa code.
- Dùng HashRouter. Đổi sang BrowserRouter thì phải cấu hình chuyển hướng ở máy chủ, và mở `dist/index.html` trực tiếp sẽ trắng trang.
- `features.json` sinh từ Excel. Sửa tay sẽ mất khi chạy lại script.
- Dòng tổng của bảng (`sum` trong `Table`) chỉ vẽ cột có khoá trong dòng tổng. Cột có hàm `r` mà dòng tổng không có khoá thì để trống, nếu không hàm `r` nhận dữ liệu thiếu và làm sập cả app.
- Thanh tab đo bề rộng từng tab trên một hàng ẩn (`.mtabs-meas`). Sửa nội dung tab (thêm biểu tượng, nhãn) thì sửa cả hàng ẩn cho giống, nếu không tab sẽ tràn hoặc dồn sai. Script kiểm báo "tràn ngang ở .mtabs-in" khi lệch.
- Form toàn màn hình là `position: fixed` nằm trong `.main`. Không thêm `transform` hay `filter` cho `.main` hoặc tổ tiên của nó, nếu không form sẽ bị nhốt trong vùng nội dung.
- Khung menu (`.pop`) gắn vào body và đặt vị trí thẳng vào style trước khi vẽ. Đừng đổi sang state React kèm `visibility: hidden`: khung ẩn thì không nhận con trỏ, phím mũi tên trong ô chọn sẽ hỏng (đã gặp 07/10).
- Esc khi đang mở menu chỉ đóng menu: menu bắt phím ở pha capture và chặn lan. Thêm phím tắt Esc mới thì nghe ở `window` như `FormToanMan`, đừng nghe ở pha capture.
- Menu "Khác" của thanh tab mở với `keep`: đóng vẫn nằm trong DOM (ẩn) để script kiểm đọc được tab. Script kiểm đọc `.mtabs-in a, .pop-khac a`. Đừng đổi sang render có điều kiện.
- Tên lớp CSS ngắn dễ đụng nhau. Ô chọn `Select` dùng `.sel { display: inline-flex }`, hàng đang chọn trong bảng cũng từng mang lớp `sel`: hàng bị bẻ thành flex, cột ô tick phình 946px, cả danh sách chứng từ vỡ. Bộ kiểm không bắt được vì không có lỗi console. Hàng đang chọn giờ là `dang-chon`. Đặt lớp mới thì `grep` cả `app.css` trước, giống vụ `.st` và `.stt`.
- Khung bật ra lồng nhau, vd ô chọn trong khung Bộ lọc: menu của ô chọn cũng gắn vào body, nằm ngoài khung cha. `Popover` cũ coi cú bấm vào menu con là bấm ra ngoài, đóng khung cha trước khi cú bấm kịp chọn, nên chọn chi nhánh không lọc gì (gặp 08/10). `Popover` giờ bỏ qua cú bấm trong `.pop` khác và Esc khi con trỏ đang ở menu con. Viết khung bật ra mới thì dùng `Popover`, đừng tự viết bắt cú bấm ra ngoài.
- Giao diện thu nhỏ bằng `zoom` trên `html` khi màn rộng dưới 1700px (T42). Toạ độ `getBoundingClientRect`, `clientX`, `innerWidth` nằm ở hệ đã zoom, còn số px ghi vào `style` bị nhân thêm zoom, nên khung bật ra và đường vẽ lệch. Chiều cao `100vh` cũng hụt theo zoom. Code mới đo vị trí thì chia cho `heSoZoom()` trong `src/ui/zoom.ts`. Khung cao theo cửa sổ thì bù như `.shell` trong `scale.css`.
- Bảng có hàng tiêu đề dính (`.tbl`): đừng cho từng hàng `th` dính riêng với `top` tính bằng chiều cao hàng trên. Ở `zoom` 0.85–0.9 số đo lẻ, hàng lọc nhảy 1px khi cuộn. Dính cả `thead` một lần. Hàng tiêu đề trên không dùng `border-bottom` mà kẻ bằng `box-shadow` trong ô: viền gộp thuộc về bảng nên không dính theo, ở tỉ lệ màn hình 125–150% thành khe lộ chữ dòng dưới. Đừng đổi `.tbl` sang `border-collapse: separate`: vị trí cột dính (`viTri` trong `Table.tsx`) tính theo viền gộp, đổi sẽ lệch đường kẻ cột dính. Lỗi này chạy headless không thấy, phải mở Chrome có giao diện với `device_scale_factor` 1.5 (T67).

- Vòng import làm sập cả app: file dữ liệu dùng chung (vd `bao-cao/so-bo-sung.ts`) import `index.ts` của một phân hệ, trong khi `index.ts` đó lại import file dữ liệu và dùng ngay lúc khởi tạo. Trình duyệt báo "Cannot access X before initialization", trắng toàn app (gặp 09/10). Dữ liệu dùng chung đặt ở `data.ts` của phân hệ, file dữ liệu không import `index.ts` nào.
- Tờ báo cáo (`ToGiay`) có khung đo ẩn chứa bản sao nội dung. Tìm phần tử trên tờ bằng script thì giới hạn trong `.bc-ds-trang`, đừng dùng `.bc-trang` trần, không thì đếm trùng.

## Script kiểm và máy Windows

- Hai agent cùng chạy `kiem_tra.py` hoặc Playwright trên một dev server, agent kia đang sửa file: Vite tải lại trang giữa chừng, script báo "Execution context was destroyed". Đó không phải lỗi màn. Chạy lại khi không còn ai sửa file.

- Playwright: script kiểm dùng `channel='chrome'`, tức Chrome đã cài trên máy, không cần tải trình duyệt của Playwright. Ghi phiên vào localStorage rồi phải tải lại hẳn trang (đổi query), chỉ đổi hash thì app giữ phiên cũ.
- Cổng 5180 đang bận thì `npm run dev` báo lỗi, không tự chuyển sang 5181 (`strictPort` trong `vite.config.ts`). Bỏ `strictPort` thì bản thử thứ hai sẽ lặng lẽ chạy ở 5181 trong khi script kiểm vẫn mở 5180, tức thử nhầm bản cũ.
- Agent chạy script Python in tiếng Việt qua ống dẫn trên Windows có thể báo `UnicodeEncodeError` vì Windows mặc định cp1252. Đặt biến môi trường `PYTHONIOENCODING=utf-8` trước khi chạy.
- PowerShell 5.1: `Set-Content` và `Add-Content` mặc định ghi ANSI, làm hỏng tiếng Việt. Luôn thêm `-Encoding utf8`, hoặc ghi file bằng công cụ sửa file của agent.

## Git và robot

- Robot cài thư viện bằng `npm ci`, đọc đúng `package-lock.json`. Thêm thư viện thì chạy `npm install <tên>` và commit cả `package.json` lẫn `package-lock.json`, nếu không robot báo đỏ.
- Chạy `npm install` không thêm thư viện vẫn có thể làm `package-lock.json` đổi vặt. Không commit thay đổi đó. Cài lại thư viện thì dùng `npm ci`.
- Xuống dòng: `.gitattributes` để Git tự đổi CRLF và LF. Đừng xoá file này, nếu không máy Windows và máy Mac sẽ đổi xuống dòng của nhau, commit hiện mọi dòng của file là đã đổi dù nội dung giữ nguyên.
