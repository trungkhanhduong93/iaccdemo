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
- Textarea có ô kéo giãn góc (`resize: vertical`) làm lần mở panel đầu tiên hở một khung 133ms: GPU vẽ lại cả panel, JS và layout chỉ vài ms nên Performance không thấy ở luồng chính (T73). Trong panel đặt `resize: none`. Đo khung hở bằng `requestAnimationFrame` liên tiếp và `long-animation-frame` trên Chrome có giao diện, rồi trace Chrome xem luồng `CrGpuMain`.

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

## Khung bảng mới mượn class `voucher-top` làm `kiem_tra.py` hết giờ chờ (T153)

- Hiện tượng: `python tools/kiem_tra.py --nhanh` dừng ở `Locator.dblclick: Timeout 30000ms exceeded`, log ghi `<aside class="pn-hop">… intercepts pointer events`.
- Nguyên nhân: bộ kiểm coi mọi `.voucher-top` có dòng `tr.click` là danh sách chứng từ, bấm dòng rồi bấm đúp. Ở danh mục, bấm dòng mở panel Sửa che mất bảng.
- Cách tránh: màn không phải danh sách chứng từ dùng class riêng (danh mục dùng `dm-bang`), chỉ mượn khung trang `.page-voucher`.

## Báo cáo nhiều dòng mở chậm vì `ToGiay` vẽ bảng 2 lần (T157)

- Hiện tượng: Chi tiết bán hàng tháng 9/2026 mở mất 6,64 giây, DOM có 4.862 thẻ `tr` cho 2.430 dòng.
- Nguyên nhân: `src/ui/bao-cao/ToGiay.tsx` vẽ tờ liền trên màn hình và thêm khung đo ẩn `bc-do` để chia trang in, cả hai đều đủ mọi dòng.
- Cách tránh: báo cáo có thể quá vài trăm dòng thì khai `phanTrang` trong `CAU_HINH_BC`; tờ xem chỉ vẽ trang đang xem, khung đo chỉ vẽ khi in.

## Mở báo cáo kèm kỳ khác tháng 9 thì trang trắng, "Maximum update depth exceeded" (T230)

- Hiện tượng: bấm liên kết mở báo cáo kèm bộ lọc, kỳ (`datLocDaXem`) với kỳ tháng 10 thì trang trắng; console báo vòng lặp cập nhật ở `src/ui/virtual.ts`. Kỳ tháng 9 thì chạy bình thường.
- Nguyên nhân: trang báo cáo khởi tạo kỳ mặc định '9' (`useState('9')`), `ReportToolbar` gọi `datKyMacDinh` ghi đè kỳ đã xem về 9, đoạn đồng bộ lại đặt kỳ theo kỳ đã xem là 10. Hai bên giành kỳ 9 ↔ 10 mãi.
- Cách tránh: `datLocDaXem` đánh dấu `kyDatSan`, `datKyMacDinh` bỏ qua khi có dấu này (`src/ui/bao-cao/tuyChinhBC.ts`). Thử liên kết mở báo cáo với cả kỳ khác tháng 9.
- Lưu ý khi thử bằng console: sau khi sửa file, ứng dụng dùng bản nạp nóng `?t=...`, còn `import('/src/...')` trong console nạp bản khác, hai bên không chung kho trạng thái. Lấy đúng URL có `?t=` trong `performance.getEntriesByType('resource')` rồi mới thử.

## Icon Solar Line Duotone bị cam lấn thân (T301)

- Hiện tượng: sau khi đổi bộ nét sang Solar Line Duotone, khoảng một nửa icon gần như toàn cam (ví, kho, thuế, giá thành).
- Nguyên nhân: Solar đặt nét phụ (opacity .5) không cố định là chi tiết; nhiều icon có viền ngoài ở lớp phụ. Script đổi opacity thành `class="l2"` rồi tô cam nên viền thành cam. So độ dài chuỗi `d` để đoán lớp chính cũng sai vì số lẻ làm chuỗi dài.
- Cách tránh: `tools/xuat_bieu_tuong.py` so diện tích hộp bao toạ độ của 2 lớp, lớp lớn hơn là thân. Icon đo sai thì thêm tên vào `DAO_TAY` để lấy ngược kết quả. Sinh lại xong phải xem ảnh phóng to (device_scale_factor 3): ảnh 390px thường làm tưởng nhầm icon đúng là sai.

## Đo bố cục khi khung trình duyệt của agent bị ẩn (T338)

- Hiện tượng: sửa code cho biểu đồ trang chủ tự đổi chiều cao theo `ResizeObserver`, tải lại trang rồi đo bằng script thì chiều cao vẫn như cũ, ghi dấu trong hàm cũng không thấy chạy. Bắn sự kiện `resize` thì lại đúng.
- Nguyên nhân: khung trình duyệt của agent đang ẩn nên trang chạy như tab nền, không vẽ khung hình, `ResizeObserver` không gọi tới khi trang được vẽ lại. Biến gán vào `window` cũng không đọc được từ công cụ chạy JavaScript (chạy ở môi trường tách riêng).
- Cách tránh: chụp màn hình một lần cho trang vẽ rồi mới đo. Cần ghi dấu tạm thì ghi vào thuộc tính DOM (`data-*`), không ghi vào `window`.

## Gộp xung đột cuối app.css làm mất dấu đóng khối (T340, T349)

- Hiện tượng: 2 việc cùng thêm mục mới cuối `app.css`, gộp bằng cách giữ cả hai bên thì `npm run build` báo `CssSyntaxError: Unclosed block`.
- Nguyên nhân: cả 2 mục đều kết thúc bằng dòng `}`, git coi dòng đó là phần chung và đặt sau khối xung đột. Ghép 2 phần lại thì phần trên thiếu dấu đóng.
- Cách tránh: sau khi gộp, đếm `{` và `}` của từng phần, phần nào thiếu thì bù. Chạy `npm run build` ngay sau khi gộp, trước khi commit.

## Bộ khối Solar Bold Duotone: lớp phụ có khi là cả mặt khối (T340)

- Hiện tượng: tô lớp phụ màu cam thì xe đẩy, hộp, toà nhà, sổ, thẻ thu chi thành mảng cam lớn.
- Nguyên nhân: lớp phụ của Bold Duotone khi là chi tiết nhỏ, khi là một mặt của khối. Đo hộp bao không phân biệt được.
- Cách tránh: `tools/xuat_bieu_tuong.py` vẽ từng lớp bằng Playwright, đo diện tích thật. Lớp phụ dưới 27% là chi tiết (`l2`, cam), từ 27% là mặt khối (`l3`, xanh nhạt).

## Gộp nhánh cùng thêm CSS cuối app.css làm hỏng khối (T354, T366)

- Hiện tượng: gộp nhánh xong, build báo `CssSyntaxError ... Unclosed block`, hoặc một mục CSS bị chèn vào giữa mục khác.
- Nguyên nhân: các nhánh cùng thêm vào cuối `src/styles/app.css`. Git coi dấu `}` cuối là phần chung, giữ lại một chỗ, nên vùng xung đột cắt ngang một khối.
- Cách tránh: khi `app.css` xung đột, không ghép tay vùng xung đột. Lấy bản `HEAD` rồi nối nguyên phần nhánh kia thêm vào sau base (`git show <merge-base>:src/styles/app.css` so với `git show MERGE_HEAD:...`). Sau đó đếm `{` và `}`, rồi chạy `npm run build`.

## Hook Claude Code gọi script Python không thấy file thì chặn mọi lệnh Read (T485)

- Hiện tượng: hook PreToolUse viết `python .claude/hooks/x.py`. Phiên Claude mở ở thư mục con thì đường dẫn tương đối hỏng.
- Nguyên nhân: Python không thấy file thì thoát mã 2. Mã 2 là mã hook dùng để chặn công cụ.
- Cách tránh: lệnh hook gọi `python -c` dùng `runpy`, lấy đường dẫn từ `CLAUDE_PROJECT_DIR`, file không có thì thoát 0. Mẫu ở `.claude/settings.json`.
- Test hook bằng JSON sinh từ Python. `printf` của Git Bash nuốt một dấu `\` trong đường dẫn Windows, JSON hỏng, hook thoát 0 nên tưởng hook sai.

## Chạy script Playwright từ Git Bash với tham số URL bị đổi thành đường dẫn Windows (T516)

- Hiện tượng: chạy script Playwright từ Git Bash với tham số dạng `/app/kho/5-1-1` thì trang bật về `#/dang-nhap` mà không báo lỗi.
- Nguyên nhân: MSYS tự đổi tham số dạng `/app/...` thành đường dẫn Windows (như `C:/Program Files/Git/app/...`), app không nhận ra đường dẫn nên chuyển hướng về trang đăng nhập.
- Cách tránh: đặt `MSYS_NO_PATHCONV=1` trước lệnh khi chạy từ Git Bash, hoặc chạy script từ PowerShell.

## Chữ trong form bị nhoè khi có will-change transform kết hợp zoom lẻ (T523)

- Hiện tượng: chữ trên form như thẻ chi phí phân bổ mờ hơn các form phiếu khác khi xem ở zoom lẻ 0.9.
- Nguyên nhân: phần tử có `will-change: transform` hoặc animation transform khiến trình duyệt tách riêng một lớp hiển thị. Tỉ lệ `zoom` lẻ làm mép chữ bị nhoè, độ nét giảm từ 14.82 xuống 11.64.
- Cách tránh: form tĩnh bỏ `will-change`, chuyển về `will-change: auto` và tắt animation; chỉ bật `will-change` khi đang chạy hiệu ứng.

## iPhone tự phóng to trang khi bấm vào ô nhập chữ nhỏ (T538)

- Hiện tượng: trên iPhone, mở sheet chọn đối tượng ở phiếu thu chi thì cả trang phóng to, lệch sang trái, phải tự thu nhỏ lại.
- Nguyên nhân: Safari iOS tự phóng to khi con trỏ vào ô `input`, `textarea` có cỡ chữ dưới 16px. Ô tìm kiếm có `autoFocus` nên vừa mở sheet đã phóng to.
- Cách tránh: ô nhập trên điện thoại để `font-size` từ 16px trở lên. Chrome máy tính giả lập điện thoại không thấy lỗi này.

## `kiem_tra.py` thỉnh thoảng báo tràn ngang `.main` ở màn báo cáo (T684)

- Hiện tượng: `kiem_tra.py`, cả `--nhanh`, thỉnh thoảng báo `tràn ngang ở ['.main']` ở một màn báo cáo, mỗi lượt một màn khác. Chạy lại thì hết. Mở thẳng màn đó không thấy.
- Nguyên nhân: màn báo cáo mới vẽ, thanh chọn báo cáo `.bc-chon` (`nowrap`) rộng hơn `.main` 3px trong 12–381ms rồi tự co lại. Đo 3 vòng cả 3 gói, 1002 lượt mở màn: 25 lần ở `.main`, luôn đúng 3px; 3 lần ở `.mtabs-in` (176px, dưới 20ms). Lúc đó `.main` đang `overflow: hidden` (`.main:has(.bc-chon)` trong `app.css`), người dùng không thấy thanh cuộn. Bộ kiểm cũ đo đúng một lần sau 60ms nên lúc trúng lúc trượt.
- Cách tránh: hàm `kiem` trong `main()` thấy tràn thì đo lại mỗi 100ms, hết 1 giây còn tràn mới báo. Đừng nới ngưỡng 2px hay bỏ ô đo. Viết bộ kiểm tràn mới cho màn có bảng tự cân cột thì cũng đo lại như vậy, không đo một lần sau thời gian chờ cố định.
