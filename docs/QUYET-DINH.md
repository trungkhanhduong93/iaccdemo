# Quyết định đã chốt

Ghi những điều Trum đã chốt về bố cục, nghiệp vụ, thư viện, cách làm việc, kèm lý do nếu có. Đọc trước khi đổi những thứ này.

Mỗi quyết định một mục, mã QDxx không dùng lại. Muốn đổi quyết định cũ thì thêm mục mới ghi "thay QDxx", không xoá mục cũ.

## QD01. Concept và trang chủ (07/10/2026)

Concept lai B + C. Ô tìm nhanh Ctrl+K. Trang chủ đổi theo vai trò: chủ doanh nghiệp vào Tổng quan, kế toán vào Bàn làm việc. Bố cục thanh biểu tượng + menu dọc ban đầu đã thay bằng bố cục AMIS ở QD08.

## QD02. Thư viện (07/10/2026)

React 19 + Vite 8 + TypeScript 7, react-router-dom 7 (HashRouter). CSS tự viết, không dùng thư viện UI. Biểu đồ vẽ bằng SVG.

## QD03. Không sửa bộ trình chiếu gói (07/10/2026)

Không sửa gì trong `D:\IACC-CLOUD\Present\` trên máy Trum. Đó là bộ trình chiếu gói IACC Cloud, project riêng. Repo này chỉ đọc cấu hình gói từ đó khi sinh `features.json` (xem `docs/TRIEN-KHAI.md`).

## QD04. Dữ liệu giả (07/10/2026)

Công ty TNHH Ẩm thực Phố Mây, 3 chi nhánh, kỳ đang mở 10/2026, kỳ đang khoá sổ 9/2026, mặc định gói Medium (TT133).

## QD05. Mục ngoài gói (07/10/2026)

Mục ngoài gói vẫn hiện trên menu, kèm khoá và nhãn gói thấp nhất có nó. Bấm vào ra trang Nâng cấp gói.

## QD06. Chỉ làm web (07/10/2026)

Chỉ làm giao diện web. Không làm bản điện thoại, không làm app.

## QD07. Đưa lên GitHub và Cloudflare (07/10/2026 tối)

Ban đầu chỉ chạy trên máy. Tối 07/10/2026 Trum yêu cầu đưa lên GitHub `trungkhanhduong93/iaccdemo` (riêng tư) và Cloudflare Pages tại https://iaccdemo.pages.dev.

## QD08. Bố cục kiểu AMIS (07/10/2026 chiều)

Tham khảo actapp.misa.vn, chỉ xem, không sửa dữ liệu AMIS.

- Sidebar tối chỉ chứa phân hệ lớn: 11 phân hệ Excel, Trang chủ, Hệ thống. Không tách Tiền mặt, Tiền gửi như AMIS. Nút "Thêm nhanh" đầu sidebar, nút thu gọn cuối sidebar.
- Màn trong phân hệ trải thành tab ngang. Tab không đủ chỗ dồn vào "Khác". Tab đang mở luôn hiện.
- Phân hệ có sơ đồ thì tab đầu là Quy trình: sơ đồ nghiệp vụ, khung Báo cáo bên phải (5 báo cáo và "Tất cả báo cáo"), hàng dưới gồm danh mục liên quan, Tiện ích, Tuỳ chọn. Giá thành vẽ theo bước đánh số. Thuế cũng có Quy trình dù AMIS không có.
- Bấm ô trên sơ đồ mở thẳng form chứng từ mới đúng loại. Một dòng Excel nhiều loại phiếu thì tách nhiều ô, vd 2.1.1 tách Phiếu thu, Phiếu chi, Nộp tiền vào ngân hàng, Thu qua ngân hàng, Chi qua ngân hàng.
- Báo cáo không thành tab riêng từng cái. Tab "Báo cáo" cuối thanh liệt kê đủ báo cáo của phân hệ.
- Form chứng từ mở toàn màn hình, che sidebar và thanh tab. Chân form: Huỷ, Lưu, Lưu và thêm. Đóng (Huỷ, X, Esc) thì về đúng màn trước.
- Mục ngoài gói trên sidebar, tab, sơ đồ, khung Báo cáo vẫn hiện, làm mờ, có khoá và nhãn gói. Bấm vào ra trang Nâng cấp.
- Cố ý chưa làm: ghim tính năng ("HAY DÙNG" của AMIS), tab Biểu đồ từng phân hệ. Mục Báo cáo chung trên sidebar đã làm theo QD31.

## QD09. Menu thả xuống dùng chung (07/10/2026 tối)

Mọi menu và ô chọn dùng chung `src/ui/Dropdown.tsx`. Bấm để mở, bấm ra ngoài hoặc Esc để đóng. Không dùng thẻ `<select>` gốc của trình duyệt. Biểu tượng Hệ thống là bánh răng.

Lý do: Trum báo mở "Xem thử" rồi không bấm được gói. Menu cũ đóng khi chuột rời nút, mà giữa nút và menu có khe 6px. Menu mới không đóng theo chuột rời nữa.

## QD10. Cách làm việc nhóm (07/10/2026 tối)

- Ba người: Trum giao việc, chốt quyết định. PhuongXT và dinhlanphuongipacc được sửa mọi thứ trong repo.
- Ai cũng tự commit, tự push thẳng `main`. Không mở pull request, không chờ duyệt.
- Theo dõi việc bằng file trong repo (`docs/TIEN-DO.md`, `docs/nhat-ky/`), để agent nào pull về cũng đọc được.
- Nhật ký mỗi phiên một file, để nhiều người cùng ghi không xung đột git.
- KE-HOACH.md cũ đã tách thành bộ tài liệu này. Bản cũ còn trong lịch sử Git (commit 6360856).

Lý do: Trum muốn hai thành viên tự làm, không phải chờ duyệt. GitHub gói Free không khoá được nhánh `main` của repo riêng tư (API trả lỗi 403), nên luật dựa trên `AGENTS.md` và robot kiểm.

## QD11. Robot tự deploy (07/10/2026 tối)

Mỗi lần push lên `main`, GitHub Actions chạy typecheck, build rồi đưa `dist/` lên project Cloudflare Pages `iaccdemo`. Lần push chỉ sửa file `.md` thì robot không chạy. Không ai deploy tay, trừ Trum khi robot hỏng.

Lý do: ai cũng deploy được mà không cần đăng nhập Cloudflare. Bản online luôn khớp code trên `main`.

Rủi ro đã chấp nhận:

- Token Cloudflare lưu trong GitHub Secrets sửa được mọi project Pages trong tài khoản của Trum, vì Cloudflare không giới hạn token theo từng project. Người có quyền ghi repo về lý thuyết dùng được token này.
- Robot không bắt được lỗi trắng trang. Bù bằng luật chạy `tools/kiem_tra.py --nhanh` trước khi push khi sửa `src/`.

## QD12. Giữ ngôn ngữ thiết kế hiện tại (07/10/2026 tối)

Đã thay bằng QD15 từ 08/10/2026. Phần màu, phông, thẻ dưới đây là bản cũ. Luật không chép màu, phông, biểu tượng của sản phẩm ngoài iPOS vẫn giữ.

Tham khảo AMIS hay sản phẩm khác chỉ để học bố cục, luồng thao tác, tính năng. Giao diện vẫn theo ngôn ngữ thiết kế của iaccdemo:

- Phông Be Vietnam Pro, chữ thân 13,5px.
- Màu lấy từ biến `:root` trong `src/styles/app.css`: navy, xanh, cam iPOS, màu 4 gói, màu trạng thái đỏ, vàng, xanh lá.
- Thẻ trắng bo góc 10px, viền mảnh, bóng nhẹ. Chân form chứng từ nền navy.
- Nút, bảng, nhãn trạng thái, nhãn nguồn, menu thả xuống, biểu tượng nét mảnh dùng thành phần có sẵn trong `src/ui/`.

Không chép màu, phông, biểu tượng hay tên tính năng riêng của sản phẩm khác, vd trợ lý "AVA Kế toán" của AMIS.

Lý do: Trum dặn khi giao việc làm lại form chứng từ và màn danh sách theo AMIS (T15).

## QD13. Tên gọi agent và mô hình phối hợp Clau - Anti (07/10/2026 tối)

- Tên gọi tắt trong nhóm: Claude Code gọi là **Clau**, Antigravity gọi là **Anti**.
- Hai agent chạy độc lập, không thông bộ nhớ chat trực tiếp. Mọi thông tin cần agent khác biết phải ghi vào repo (`docs/TIEN-DO.md`, `docs/nhat-ky/`, `docs/QUYET-DINH.md`).
- Phân vai tối ưu token:
  + **Clau** làm Kiến trúc sư & Quản lý (Planner & Reviewer): phân tích logic kế toán, chốt kiến trúc, chia nhỏ task, soát lỗi nghiệp vụ cuối. Không dùng Clau chạy lặp đi lặp lại việc sửa cú pháp/typecheck để tránh tốn token.
  + **Anti** làm Kỹ sư thi công (Builder & Executor): đọc code, viết code, sửa lỗi, chạy typecheck, build, chạy kiểm thử tự động (`tools/kiem_tra.py`).

## QD14. Bố cục form chứng từ và danh sách theo AMIS (07/10/2026 đêm)

- Form chứng từ toàn màn hình:
  + Mở ở chế độ xem mặc định; bấm Sửa (hoặc query `?sua=1`) sang chế độ sửa; phím tắt Ctrl+S (lưu), Ctrl+Shift+S (lưu và thêm), Ctrl+E (sửa), Esc (đóng).
  + Chân form: nút trước/sau; nút bật cột tài khoản (gói Medium/Advance); In, Tiện ích, Sửa, Ghi sổ hoặc Bỏ ghi sổ.
  + Nhóm mua/bán: có chọn hình thức thanh toán (chưa thanh toán, tiền mặt ngay, chuyển khoản ngay); nếu thanh toán ngay thì tự đổi TK công nợ thành 1111 hoặc 1121; tab Hoá đơn, điều khoản thanh toán, đính kèm, khối tổng tiền góc dưới phải.
  + Bảng dòng gõ trực tiếp (`BangSua`): ô số hiện số thô khi gõ, định dạng khi rời ô; chọn mã hàng tự điền tên, ĐVT, giá, thuế; tự tính chiết khấu và thuế.
- Màn danh sách chứng từ:
  + Chọn kỳ nhanh: Tháng này, Tháng trước, Quý này, Năm nay, Tất cả.
  + Cột Ngày, Số chứng từ đứng yên bên trái (`dinh: 'trai'`); cột Chức năng (Xem và menu thao tác) đứng yên bên phải (`dinh: 'phai'`).
  + Cột TT thanh toán và TT hoá đơn cho nhóm mua, bán.
  + Dòng chưa ghi sổ có vạch vàng bên trái; tick chọn nhiều dòng hiện thanh thao tác hàng loạt.
  + Bấm dòng hiện khung chi tiết `.ct-panel` bên dưới (thu gọn được); bấm đúp dòng hoặc nút Xem để mở form toàn màn hình.

## QD15. Ngôn ngữ thiết kế theo iFaster (08/10/2026)

iFaster (ifaster.ipos.vn) là sản phẩm của iPOS nên được dùng màu và cách trình bày. Thay phần thiết kế của QD12. Bố cục, màn hình, luồng thao tác giữ nguyên.

- Màu chính xanh `#0560a6`: nút chính, tab đang chọn, viền ô đang nhập.
- Sidebar nền xám đen `#2a3042`, chân sidebar `#1d2231`. Mục đang chọn là khối xanh sáng `#0090ff` bo 12px, chữ trắng.
- Nền vùng nội dung `#f5f5f5`. Thẻ trắng bo 12px, không viền, không bóng.
- Nút cao 34px, bo 8px. Đầu bảng nền xanh nhạt `#e6eff7`, chữ 13px đậm, không viết hoa.
- Phông vẫn là Be Vietnam Pro, chữ thân 14px. iFaster dùng SF Pro nhưng giấy phép của SF Pro không cho nhúng lên web.
- Giữ cam iPOS, màu 4 gói, màu trạng thái đỏ, vàng, xanh lá.
- Logo "Accounting Powered by iPOS.vn". Sidebar và nền tối dùng bản chữ trắng, sidebar thu gọn dùng chữ A. Xuất lại bằng `python tools/xuat_logo_acc.py`.
- Không đem sang: trợ lý iOne, nút Tải ứng dụng, ô chọn mã số thuế của iFaster.

Lý do: Trum giao việc T26, chốt các mặc định trên ngày 08/10/2026.

## QD16. Kiểm bản mới trên GitHub trước mỗi lần push (08/10/2026)

Trước mỗi lần push, kể cả push chỉ sửa tài liệu, agent fetch và so `HEAD..origin/main`. Có commit mới của người khác thì báo người dùng, pull về, chạy lại các bước kiểm nếu commit mới có sửa code, rồi mới push. Các bước cụ thể ở `AGENTS.md`, mục "Ngay trước lệnh git push".

Lý do: ba người cùng push thẳng `main`, không ai duyệt. Bước kiểm chạy trên bản cũ không chứng minh được bản sau khi gộp còn chạy đúng.

## QD17. Thanh trên chọn chi nhánh, tìm kiếm sang sidebar (08/10/2026)

Thay một phần QD01 và QD08: ô tìm nhanh không còn ở thanh trên, thanh trên không còn ô kỳ và trạng thái đồng bộ FABi.

- Ô tìm nhanh (Ctrl K) nằm trên cùng sidebar, trên nút Thêm nhanh. Sidebar thu gọn còn biểu tượng kính lúp.
- Kỳ chọn ở bộ lọc của từng màn, không đặt trên thanh trên.
- Thanh trên có ô chọn chi nhánh làm việc. Một mã số thuế có nhiều chi nhánh, lấy từ Danh mục chi nhánh (màn mới trong phân hệ Danh mục, gói nào cũng mở).
- Có lựa chọn "Tất cả chi nhánh" chỉ để xem gộp. Danh sách chứng từ lọc theo chi nhánh đang chọn; cột Chi nhánh chỉ hiện khi xem tất cả.
- Chứng từ mới lập cho chi nhánh chọn trên thanh trên, hiện thành nhãn trên đầu form, không sửa trên form. Đang xem tất cả mà lập chứng từ thì form bắt chọn một chi nhánh trước.
- Đổi đơn vị kế toán thì chi nhánh về "Tất cả".

Lý do: PhuongXT chốt khi làm T25, T32. Trum chưa xem lại.

## QD18. Thu chi gói Free và sơ đồ Quy trình tiền (08/10/2026)

- Phạm vi gói Free lấy theo sheet Roadmap trong file "Dự kiến tính năng IACC Cloud.xlsx" trên Google Drive.
- Phiếu thu, chi có ô Lý do thu, Lý do chi ở đầu phiếu, lấy từ Danh mục lý do nghiệp vụ 1.16. Gói Free không hạch toán nên dòng chi tiết không có cột Khoản mục, Công việc.
- Khối tổng của phiếu thu, chi chỉ có một dòng Tổng tiền.
- Loại phiếu "Nộp tiền vào ngân hàng" thay bằng "Chuyển quỹ" (số `CQ…`): chọn Từ quỹ, Đến quỹ trong các quỹ tiền mặt từng chi nhánh và tài khoản ngân hàng. Phiếu chuyển quỹ không có đối tượng.
- Sơ đồ Quy trình phân hệ Tiền vẽ kiểu hội tụ (`hoiTu` trong `quy-trinh.ts`). Năm làn Thu tiền, Chi tiền, Chuyển quỹ, Đối chiếu công nợ, Phân bổ chi phí chuỗi cùng đổ về khối Sổ sách quỹ. Thu tiền, Chi tiền đều gồm tiền mặt và ngân hàng. Bỏ ô Tiền bán hàng từ FABi và Khớp sao kê ngân hàng. Sơ đồ phải nằm gọn một trang ở màn 1366×768.

Lý do: PhuongXT chốt khi làm T25.

## QD19. Bổ sung gói theo Roadmap trong code khi Excel chưa cập nhật (08/10/2026)

`features.json` sinh từ Excel và không sửa tay. Khi sheet Roadmap đã đổi gói mà Excel chưa sinh lại, ghi mã và gói mới vào `THEO_ROADMAP` trong `src/app/plan.ts`. Danh sách này đè lên `features.json` lúc chạy. Excel cập nhật xong (việc T33) thì xoá dòng tương ứng.

Đang có: 1.12 Danh mục quỹ tiền và 2.2.3 Sổ ngân hàng mở cho gói Free.

Lý do: PhuongXT cần mở hai mục này cho gói Free ngay, không chờ chạy lại script trên máy Trum.

## QD20. Thanh lọc và chọn khoảng ngày theo iFaster (08/10/2026)

- Mọi màn danh mục, danh sách, báo cáo dùng `ThanhLoc` (`src/ui/ThanhLoc.tsx`). Trên thanh có ô tìm, khoảng ngày, nút phễu mở khung Bộ lọc, nút tải lại. Bên phải là các nút biểu tượng vuông.
- Ô lọc phụ (trạng thái, nhóm, kho, quỹ) nằm trong khung Bộ lọc, mỗi ô là một `LocO`. Đang lọc khác mặc định thì nút phễu có chấm xanh. Danh sách chứng từ không có ô Chi nhánh trong khung Bộ lọc, vì chi nhánh chọn trên thanh trên (QD17).
- Khoảng ngày (`src/ui/ChonNgay.tsx`) hiện lịch 2 tháng, có 3 chế độ ngày, tháng, quý, và các nút chọn nhanh. Bấm Xác nhận mới áp dụng. Hôm nay của app là `HOM_NAY` (07/10/2026).
- Ngày viết `dd/mm/yyyy`, không theo kiểu `dd-mm-yyyy` của iFaster.
- Danh sách chứng từ mở mặc định ở tháng này. Báo cáo, sổ vẫn mở ở tháng 9 và lấy tháng của ngày bắt đầu làm kỳ, vì dữ liệu mẫu tính theo tháng.

Lý do: Trum giao việc T34, chốt các mặc định trên ngày 08/10/2026.

## QD21. Phối hợp để không trùng mã, không đè việc nhau (08/10/2026)

Ngày 08/10 trùng mã ba lần: T30 dùng cho hai việc, T32 và T33 bị lấy hai lần, QD16 và QD17 cũng vậy. `VoucherScreen.tsx` bị hai việc cùng sửa khối lọc. Từ nay:

- Nhận việc là push ngay commit chỉ sửa `docs/TIEN-DO.md`, `docs/QUYET-DINH.md`, kể cả khi người dùng dặn agent chỉ push khi được bảo.
- Lấy mã việc kế tiếp sau `git fetch origin`, đọc bảng trên `origin/main`.
- Việc có thể sinh quyết định mới thì giữ chỗ dòng `## QDxx (đang soạn)` ngay lúc nhận việc.
- Mỗi phiên agent một bản clone riêng. Trên một máy mỗi lúc chỉ một bản chạy `npm run dev` (cổng 5180 cố định).
- Ghi file dùng chung sẽ sửa vào cột Ghi chú của `docs/TIEN-DO.md`.
- CSS mới gom thành một mục riêng có mã việc ở cuối `app.css`.

Lý do: Trum chốt sau khi gộp T34 với T32 của PhuongXT.

## QD22. Gói Free ẩn tính năng ngoài gói, thanh trên, vai trò theo tài khoản (08/10/2026)

Thay một phần QD05 và QD08 cho riêng gói Free.

- Gói Free ẩn hẳn mọi thứ ngoài gói: phân hệ trên sidebar, tab, ô sơ đồ Quy trình, khung và tab Báo cáo, danh mục, tiện ích, mục Thêm nhanh, kết quả Ctrl K. Không hiện dòng đếm "mở x/y". Hàm dùng chung: `anNgoaiGoi()` trong `plan.ts`, `hienMan()`, `hienPhanHe()` trong `registry.ts`.
- Gói Starter, Medium, Advance giữ cách cũ: mục ngoài gói hiện mờ, có khoá và nhãn gói để mời nâng cấp.
- Phân hệ có màn không gắn gói (Hệ thống: Người dùng, Gói thuê bao) không bị coi là khoá.
- Thanh trên: nút đơn vị hiện đủ tên, dòng nhỏ "Công ty · MST". Ô chi nhánh có dòng nhỏ "Chi nhánh". Nút "Trải nghiệm gói" màu cam nổi bật, chỉ đổi gói.
- Bỏ chọn vai trò trên thanh trên. Vai trò và tên lấy theo tài khoản đăng nhập trong danh sách người dùng mẫu; email lạ vào vai trò kế toán trưởng.
- Sơ đồ hội tụ không có khung Báo cáo bên phải. Khối cuối sơ đồ là "Sổ sách, báo cáo", có link Tất cả báo cáo.

Lý do: PhuongXT chốt khi làm T36.

## QD23. Biểu tượng theo iFaster (08/10/2026)

Thay phần biểu tượng của QD12. Tên gọi trong `src/ui/Icon.tsx` giữ nguyên, màn nào cũng gọi như cũ.

- Biểu tượng phân hệ (9) dùng bộ khối đặc `menu_*` của iFaster. iFaster là sản phẩm iPOS nên được dùng, như QD15.
- Biểu tượng đồ vật (45) dùng Solar bản đặc (bold) của 480 Design, giấy phép CC BY 4.0. Nguồn ghi ở đầu `src/ui/icon-dac.ts`, không được xoá.
- Biểu tượng thao tác (18: mũi tên, dấu cộng, đóng, tích, tìm, lọc, tải lại, tải lên, tải xuống, lịch...) giữ nét mảnh, như iFaster dùng nét mảnh cho các nút này.
- Sidebar: biểu tượng mục thường màu xám `#8197a8`, mục đang chọn và khi rê chuột màu trắng.
- Màn có thể có biểu tượng riêng qua trường `icon` của `ScreenDef` (T40). 17 màn danh mục đã có, khai báo trong bảng `BIEU_TUONG` của `src/modules/danh-muc/index.ts`. Biểu tượng riêng hiện ở menu Khác, ô tìm Ctrl K, hàng Danh mục dưới sơ đồ. Thanh tab ngang vẫn chỉ có chữ.
- Biểu tượng khối đặc nằm trong `src/ui/icon-dac.ts`, sinh bởi `python tools/xuat_bieu_tuong.py`, không sửa tay. Thêm hoặc đổi biểu tượng thì sửa bảng `IFASTER`, `SOLAR` trong script rồi chạy lại. Tên Solar tra ở https://icon-sets.iconify.design/solar/.

Lý do: Trum giao việc T37 ngày 08/10/2026.

## QD24. Danh sách chứng từ lọc từng cột, công cụ dạng biểu tượng (08/10/2026)

Thay một phần QD14 và QD20 cho danh sách chứng từ dùng chung (`VoucherScreen`). Màn Bán hàng 3.1.1 làm riêng chưa đổi.

- Bỏ chia đôi 50/50 của T24. Danh sách chiếm phần còn lại, khung chi tiết bên dưới cao vừa nội dung, tối đa 38% chiều cao.
- Đầu trang: ô chọn kỳ, nút biểu tượng Excel (Nhập Excel, Xuất Excel), nút Tuỳ chỉnh giao diện (ẩn hiện cột), nút Thêm. Không có nút In. Theo mẫu iPOS Inventory.
- Bỏ thanh lọc dưới (ô tìm, phễu Bộ lọc, tải lại). Thay bằng cột STT và hàng lọc từng cột dưới tiêu đề bảng.
- Mỗi ô lọc có phễu chọn điều kiện theo kiểu cột: chữ (chứa, không chứa, bằng, bắt đầu, kết thúc), số (=, ≠, >, <, ≥, ≤), ngày (đúng ngày, trước, sau, từ, đến), phân loại (tick giá trị có sẵn). Code ở `src/ui/LocCot.tsx`, bảng bật bằng prop `loc` của `Table`.
- Tiêu đề mọi màn không còn dòng mã tính năng, giai đoạn, nhãn gói. Gói đang dùng hiện dưới logo sidebar ("Phiên bản").
- Loại phiếu 2.1.1 đổi tên: Thu tiền mặt, Chi tiền mặt, Thu ngân hàng, Chi ngân hàng, Chuyển quỹ đứng cuối.

Lý do: PhuongXT chốt khi làm T25, T39. Trum chưa xem lại.

## QD25. Danh sách chứng từ theo iFaster: lọc, cột, thao tác hàng loạt (08/10/2026)

Áp cho danh sách chứng từ dùng chung (`VoucherScreen`) và màn Bán hàng 3.1.1. Giữ lọc từng cột của QD24. Thành phần dùng chung ở `src/ui/LocNangCao.tsx`.

- Chip trạng thái bên trái: Tất cả, Chưa ghi sổ, Đã ghi sổ, Lỗi hạch toán, kèm số phiếu. Gói Free: Nháp, Đã lưu. Mặc định Tất cả. Bấm chip áp dụng ngay.
- Ô lọc ngoài có nhãn nằm trên viền. Mặc định 3 ô Thời gian, Tìm kiếm, Đối tượng (3.1.1 là Chi nhánh), tối đa 4 ô. Các ô khác nằm trong khung "Bộ lọc nâng cao" mở từ nút phễu. Trong khung có phần cấu hình bật ô ra ngoài và kéo đổi thứ tự.
- Ô lọc ngoài và Bộ lọc nâng cao chỉ áp dụng khi bấm Lọc hoặc Enter trong ô tìm. Chip trạng thái và lọc từng cột áp dụng ngay.
- Lịch chọn ngày ở thanh lọc căn mép phải với ô ngày.
- Hộp "Tuỳ chỉnh cột hiển thị": tìm cột, bật tắt, kéo đổi thứ tự, nút Mặc định. Cột cố định không tắt được: ô tick, STT, Ngày, Số chứng từ, Chức năng. Chỉ áp dụng khi bấm Lưu lại.
- Bảng có kẻ dọc giữa cột, kéo mép phải tiêu đề để giãn cột, rộng tối thiểu 60px.
- Nút "Thao tác hàng loạt" chỉ bấm được khi đã tick phiếu: Ghi sổ, Bỏ ghi sổ (gói có ghi sổ), In, Xuất Excel, Xoá (có hỏi lại), Bỏ chọn. Thay cho thanh thao tác hàng loạt cũ.
- Thứ tự, ẩn hiện, độ rộng cột và cấu hình ô lọc ngoài lưu trên trình duyệt theo từng màn.
- Màn rộng dưới 1900px: thanh công cụ chia 2 hàng. Hàng trên là chip và các nút, hàng dưới là ô lọc căn phải. Từ 1900px gộp một hàng.

Lý do: Trum giao việc T41 ngày 08/10/2026, theo mẫu iFaster và iPOS Inventory.

## QD26. Giao diện gọn cho màn nhỏ, công cụ danh sách gom vào nút Thêm mới (08/10/2026)

- Màn rộng dưới 1700px thu nhỏ toàn bộ còn 90%, dưới 1450px còn 85%, bằng `zoom` trên `html` (`src/styles/scale.css`). Code đo vị trí bằng JS (khung bật ra, đường nối sơ đồ, kéo giãn cột) quy đổi theo `heSoZoom()` trong `src/ui/zoom.ts`. Khung app bù chiều cao để vẫn lấp đầy cửa sổ.
- Mọi màn bỏ dòng đường dẫn trên tiêu đề.
- Nút thêm chính ở danh sách, danh mục và các màn khác ghi "Thêm mới". Tiêu đề form vẫn giữ tên riêng (vd "Thêm phiếu thu, chi").
- Danh sách chứng từ: nút "Thêm mới" liền một nút xổ. Menu xổ có các nhóm Thêm theo loại, Dữ liệu (Tải từ nguồn, Nhập Excel, Xuất Excel), Hàng loạt (Ghi sổ, Bỏ ghi sổ, In, Xuất Excel, Xoá, Bỏ chọn). Không còn nút Excel và nút Thao tác hàng loạt riêng. Nút Tuỳ chỉnh cột vẫn đứng riêng.
- Số đếm trong chip trạng thái là viên tròn màu theo trạng thái. Chip đang chọn có viên nền xanh, chữ trắng.
- Dòng tổng dính đáy vùng bảng, ngay trên thanh cuộn ngang. Chân phân trang gọn một hàng: Tổng, số dòng mỗi trang, ‹ số trang ›.
- Hàng lọc dưới tiêu đề chỉ hiện biểu tượng phễu, cột ngày có thêm ô ngày. Bấm phễu mở khung lọc theo kiểu cột: chữ chọn điều kiện, số chọn so sánh, ngày chọn mốc, phân loại tick giá trị. Khung nào cũng có nút "Thiết lập lại".

Thay một phần QD24, QD25. Lý do: Trum giao việc T42 ngày 08/10/2026, theo mẫu iPOS Inventory.

## QD27. Gói Free/Standard/Plus/Pro, mã F/S/PL/PR và đợt chỉnh danh sách (09/10/2026)

Gói:
- Bốn gói đổi tên: Free, Standard (trước là Starter), Plus (trước là Medium), Pro (trước là Advance). Thay phần tên gói trong các quyết định trước.
- Mã nội bộ đổi: F, S, PL, PR (trước là F, S, M, A). Lớp CSS màu gói (`fr`, `st`, `md`, `ad`, biến `--md`, `--ad`) giữ tên cũ.
- `src/app/features.json` vẫn ghi mã 1 ký tự (vd "SMA") vì sinh từ Excel trên máy Trum. `plan.ts` đổi M thành PL, A thành PR khi đọc. Phiên cũ lưu trên trình duyệt có mã M, A cũng tự đổi.

Giao diện chung:
- Khối mục đang chọn ở sidebar dùng màu nút Lọc (`--blue`). Cam (`--orange`) đổi sang #f28020 cho khớp logo Accounting.
- Các màn không còn giới hạn rộng 1480px. Riêng báo cáo dạng mẫu in vẫn để giữa.
- Danh sách chứng từ, Bán hàng 3.1.1 và danh mục bỏ dòng tiêu đề màn, vì tên màn đã hiện ở tab. Thẻ `h1` vẫn giữ nhưng ẩn (`sr-only`) cho trình đọc màn hình và script kiểm.

Danh sách chứng từ (thay một phần QD25, QD26):
- Chip trạng thái và mọi nút nằm một hàng. Số đếm trong chip là ô vuông nền xám, chip đang chọn nền xanh nhạt.
- Bỏ cột Trạng thái. Dòng chưa ghi sổ có vạch vàng đầu dòng, dòng lỗi có nền đỏ nhạt.
- Nút Excel và nút Hàng loạt dạng biểu tượng nằm ngoài. Menu Thêm mới chỉ còn Thêm theo loại và Tải từ nguồn.
- Nút Hàng loạt chỉ hiện thao tác hợp trạng thái phiếu đã chọn: ghi sổ phiếu chưa ghi, bỏ ghi sổ phiếu đã ghi, xem lỗi, xoá chỉ phiếu chưa ghi, còn In và Xuất Excel luôn có. Gói Free không có ghi sổ. Bấm ô chọn tất cả thì menu tự mở.
- Ghi chú FABi ở 3.1.1 thu thành biểu tượng ⓘ.
- Ô lọc cột: xem QD28 (gõ lọc trực tiếp ở mọi ô, phễu cho điều kiện nâng cao).
- Dòng tổng luôn thấy ở đáy vùng bảng. Bảng chi tiết có cột tiền hoặc số lượng đều có dòng tổng. Ô nhãn dòng tổng trải sang các ô trống liền sau.

Dữ liệu mẫu: Mua hàng 4.1.1 có 80 phiếu trong tháng 9 và 10, qua trường `soPhieu` của cấu hình chứng từ.

Lý do: Trum giao việc T43 ngày 08/10/2026, chốt các mặc định cùng ngày.

## QD28. Giao diện gọn 85% cho màn 14 inch, tìm kiếm thanh trên và lọc bảng (09/10/2026)

- Màn hình Full HD và máy tính xách tay 14 inch thu nhỏ mặc định 90% qua CSS zoom (`src/styles/scale.css`), dưới 1280px thu 85%. Màn hình lớn hơn 1920px giữ 100%.
- Bỏ nút "Thêm nhanh" trên sidebar. Nút tìm kiếm Ctrl K chuyển từ sidebar lên thanh trên, nằm cạnh ô Chi nhánh.
- Badge phiên bản ở logo sidebar thiết kế theo mẫu iPOS Inventory: viên thuốc bo tròn góc, màu vàng đồng `#b1852b` cho gói Pro. Bỏ chữ "Phiên bản".
- Hàng lọc từng cột dưới tiêu đề bảng: cho phép bấm vào ô để gõ tìm kiếm trực tiếp cho mọi cột (chữ, số, phân loại, ngày). Phễu chọn điều kiện nâng cao vẫn giữ ở mép phải ô.
- Khắc phục khoảng hở giữa hàng tiêu đề và hàng lọc: đo chiều cao tiêu đề bằng JS rồi gán vào top hàng lọc. Bù thêm bóng đổ bên trong, không còn lộ chữ phía dưới.

Lý do: Trum giao việc T44 ngày 09/10/2026.

## QD29. Bảng flyout sidebar, thu gọn chi tiết chứng từ và liền mạch bảng (09/10/2026)

- Rê chuột vào phân hệ trên sidebar hiện bảng flyout menu 2 cột (Nghiệp vụ và Tiện ích). Bấm vào mục để truy cập nhanh đến chứng từ, quy trình, danh mục.
- Áp dụng cho cả hai trạng thái sidebar (mở rộng 216px và thu gọn 64px).
- Vị trí top bám theo mục đang hover, chia tỷ lệ `heSoZoom()` và giới hạn không tràn đáy màn hình.
- Có cầu nối hit-test trong suốt và độ trễ đóng 180ms giúp rê chuột mượt mà không nhấp nháy. Tự đóng khi click chọn mục hoặc chuyển route.
- Kiểm tra quyền theo gói: ẩn mục ngoài gói ở gói Free (QD22), hiện biểu tượng khoá ở các gói khác.
- Thêm nút thu gọn và mở rộng màn hình chi tiết chứng từ tại mọi màn hình danh sách chứng từ: nút trên thanh tiêu đề chi tiết và nút toggle trên thanh công cụ. Khi thu gọn, danh sách mở rộng tối đa màn hình.
- Bịt kín khe hở giữa hàng tiêu đề và hàng lọc: hàng lọc đè lên 1.5px mép dưới hàng tiêu đề kèm lớp phủ `::before` 4px.
- Xử lý liền mạch dòng tổng cộng và footer: bỏ `tbl-spacer`, thẻ `tfoot` static, ô `td` dòng tổng cộng sticky dính chặt đáy kèm lớp phủ che chân, nối liền mạch vào thanh phân trang.

Lý do: Trum giao việc T45 ngày 09/10/2026, theo mẫu MISA AMIS và phản hồi thực tế.

## QD31. Phân hệ Báo cáo, chế độ kế toán tách khỏi gói, mẫu in theo thông tư (09/10/2026)

Kế hoạch đầy đủ ở `docs/ke-hoach-bao-cao.md`. Trum duyệt làm theo mặc định cả 17 điểm ở mục 14.

- Có phân hệ Báo cáo trên sidebar, ngay dưới Tổng hợp. QD08 từng ghi "cố ý chưa làm mục Báo cáo chung", nay bỏ ý đó.
- Mọi sổ, báo cáo mở ở `/app/bao-cao/<mã>`. Đường dẫn cũ `/app/<phân hệ>/<mã>` và tab Báo cáo của từng phân hệ tự chuyển sang. Tờ khai 6.2.3 vẫn là tab trong phân hệ Thuế.
- Gói quyết định mở tính năng nào. Chế độ kế toán (TT152, TT58, TT133, TT99) quyết định mẫu sổ, báo cáo, chứng từ, mẫu in, số hiệu tài khoản. Nguồn duy nhất: `src/app/che-do.ts`. Cặp hợp lệ: Free chỉ TT152, Standard chỉ TT58, Plus mặc định TT133 chọn được TT99, Pro mặc định TT99 chọn được TT133. Đổi gói thì chế độ về mặc định của gói.
- Đổi chế độ ở Cấu hình kế toán có hộp cảnh báo. Bản mẫu áp ngay. Bản thật chỉ cho đổi từ đầu năm tài chính.
- Ký hiệu mẫu từng báo cáo khai ở `src/modules/bao-cao/danh-sach.ts`, mẫu in chứng từ ở `src/app/mau-in.ts`. Ký hiệu chưa đối chiếu văn bản gốc, gắn nhãn "chờ kế toán trưởng duyệt" tới khi xong T04. TT58, TT152 mới tra qua bài tổng hợp.
- Báo cáo tài chính và tờ khai giữ bố cục pháp định: không cho ẩn, đổi thứ tự cột, chỉ sửa người ký và cỡ chữ.
- Thêm 10 sổ theo thông tư khai tạm trong `BO_SUNG` của `plan.ts` (cùng cách QD19) chờ Trum cập nhật Excel (T33). Báo cáo TSCĐ 7.2.x mở cho gói Plus.
- Màn chỉ gói thấp hơn mới có (sổ riêng của hộ kinh doanh, DN siêu nhỏ) ẩn ở gói cao hơn, không hiện khoá mời nâng cấp.
- Thêm thư viện `exceljs` để xuất Excel giữ khung mẫu, nạp muộn thành gói JS riêng. PDF dùng hộp in của trình duyệt, không thêm thư viện.
- Tuỳ chỉnh báo cáo và mẫu in riêng lưu localStorage theo đơn vị (chưa có backend). Người ký dùng chung cả đơn vị.
- Bộ lọc, gom nhóm, ẩn hiện cột làm một lớp chung ở `ReportPaper` trên các bảng `RptTable`, không viết lại dữ liệu từng báo cáo như kế hoạch ban đầu. Sổ có số dư chạy và báo cáo tài chính không lọc, không gom nhóm dòng.

Lý do: Trum giao việc T47 ngày 09/10/2026.
## QD32. Danh sách chứng từ: gói Free bỏ chip trạng thái, tổng trang và tổng cộng, chi tiết mặc định đóng (09/10/2026)

- Gói Free: chứng từ lưu là được duyệt luôn, nên danh sách không có chip trạng thái, không có vạch vàng dòng chưa ghi, luôn hiện tất cả (bỏ chip Nháp, Đã lưu của QD25). Các gói khác giữ chip Tất cả, Chưa ghi sổ, Đã ghi sổ, Lỗi hạch toán.
- Dòng tổng dưới bảng là Tổng trang: chỉ cộng các phiếu trên trang đang xem.
- Tổng cộng mọi trang (theo bộ lọc đang áp dụng) nằm trên hàng phân trang, số đặt thẳng cột tiền của bảng ngay trên. Cột khuất bên phải thì số bám mép phải.
- Cột Tổng tiền là cột cuối. Bỏ cột Chức năng (nút Xem và menu ⋯ từng dòng): xem phiếu bằng đúp chuột hoặc khung chi tiết; ghi sổ, in, xoá dùng nút Hàng loạt hoặc trong form.
- Khung chi tiết phiếu dưới danh sách mặc định đóng, bấm Mở chi tiết mới hiện.
- Xoá chứng từ (nút Hàng loạt, mục Xoá chứng từ trong menu Tiện ích của form) luôn hỏi lại trước khi xoá. Gói Free xoá được mọi phiếu; gói có ghi sổ chỉ xoá phiếu chưa ghi. Phiếu thuộc kỳ đã khoá sổ không xoá được ở mọi gói. Bản mẫu coi kỳ đã khoá là đến hết tháng 8/2026 (`KHOA_SO_DEN` trong `data/mock.ts`). Bản mẫu chưa có backend: phiếu xoá được ẩn đến khi tải lại trang (`generic/daXoa.ts`).

Lý do: PhuongXT chốt ngày 09/10/2026 theo ảnh góp ý trên màn Thu, chi tiền, áp cho mọi phân hệ (T48).

## QD33. Form phiếu thu chi: đối tượng từ danh mục, lý do lên trên, tháng hạch toán lãi lỗ gói Free (09/10/2026)

- Áp cho 5 loại phiếu ở Thu, chi tiền. Đầu form không còn chip Số phiếu, chip tên màn, ô Loại phiếu, Tổng tiền (tổng ở cuối form). Loại phiếu chọn từ nút Thêm mới.
- Chính giữa đầu form hiện trạng thái: Thêm mới; Đang chỉnh sửa <số phiếu>; Chi tiết phiếu <số phiếu>. Từ T61 đầu form mọi phiếu ở mọi phân hệ làm như vậy: tiêu đề chỉ tên phiếu, không chip Chưa lưu, Số, tên màn, không ô Loại phiếu, không Tổng tiền góc phải. Gói Free không hiện chip trạng thái ghi sổ khi xem phiếu.
- Ô Đối tượng chọn từ danh mục đối tượng (khách hàng, nhà cung cấp, nhân viên), chọn xong điền Mã số thuế. Người giao, nhận và Nhân viên thực hiện gộp thành Người giao dịch.
- Lý do thu, chi đứng trên Diễn giải. Chọn lý do thì Diễn giải và lý do mọi dòng chi tiết đổi theo; sửa lại được từng ô, từng dòng.
- Ngày chứng từ gõ được hoặc chọn bằng lịch.
- Ô quỹ đứng đầu phiếu (T51): phiếu thu, chi tiền mặt có ô Quỹ tiền mặt, chỉ chọn quỹ tiền mặt của chi nhánh lập phiếu; phiếu thu, chi ngân hàng có ô Tài khoản ngân hàng, chỉ chọn tài khoản ngân hàng. Phiếu chuyển quỹ giữ Từ quỹ, Đến quỹ.
- Lưu phiếu mới (nút Lưu, Ctrl+S) thì ở lại form, chuyển sang Chi tiết phiếu vừa lưu; bấm đóng (X, Esc) mới về danh sách. Lưu và thêm vẫn mở phiếu mới tiếp theo (T51).
- Tab Lịch sử (nhật ký từng phiếu) có ở mọi gói, kể cả Free (T51). Màn Nhật ký thao tác chung (X2) vẫn theo gói trong Excel tính năng.
- Nhật ký ghi Thêm mới, Sửa (kèm ô đã đổi, tổng tiền cũ → mới), Xoá chứng từ, người làm, thời điểm. Tab Lịch sử của phiếu hiện các dòng này; thao tác xoá xem ở màn Nhật ký thao tác chung vì phiếu đã xoá không mở lại được (T51).
- Tiêu đề form phiếu thu chi chỉ là tên loại phiếu (Thu tiền mặt, Chi tiền mặt...), không có chữ "mới", không có số phiếu.
- Đối tượng đầu phiếu đổi thì đối tượng mọi dòng chi tiết đổi theo, sửa lại được từng dòng. Đầu mọi phiếu không có ô Diễn giải, Ghi chú chép sang diễn giải (thu chi, chuyển quỹ từ T77, phiếu khác từ T78). Người dùng tự ẩn ô ở Tuỳ chỉnh giao diện phiếu thì không giữ luật đều hàng (T89). Mặc định hai cột trái đầu phiếu đều hàng, không để ô trống: phiếu phân hệ khác Thu chi có Địa chỉ ở cột trái, Ghi chú ở cột giữa cùng hàng Địa chỉ; biên bản đối chiếu công nợ xếp như phiếu thu chi (T78). Phiếu mua, bán (T90): không có ô Nhân viên thực hiện; hàng 1 Đối tượng, Mã số thuế cùng Hạn thanh toán; hàng 2 Địa chỉ, Người giao dịch; Ghi chú kéo qua hai cột trái. Phiếu thu chi: Địa chỉ ở cột giữa dưới Lý do, Ghi chú một hàng riêng kéo qua hai cột trái; thu, chi ngân hàng ghi nhãn Quỹ ngân hàng thay Tài khoản ngân hàng (T78). Chuyển quỹ: hàng 1 Từ quỹ, Đến quỹ; hàng 2 Người thực hiện, Ghi chú (T77). Từ T69 mọi phiếu có ô Ghi chú. Phiếu có ô Lý do: Ghi chú mặc định theo lý do; phiếu khác: mặc định là diễn giải (T78). Gõ Ghi chú thì Diễn giải chép theo; diễn giải từng dòng chi tiết vẫn sửa riêng.
- Tuỳ chỉnh giao diện phiếu (T89), mọi phiếu dùng form chung, có ba khối. Đầu phiếu: bật tắt ô không bắt buộc (người giao dịch, địa chỉ, nhân viên, mã số thuế, hạn thanh toán, ghi chú), ô sau dồn lên; ô có dấu *, ngày, số phiếu luôn hiện. Bảng chi tiết: bật tắt từng cột, trừ Tên hàng hoặc Diễn giải (T86). Chân phiếu: dòng Tổng cộng cuối bảng, khối tổng tiền dưới bảng (phiếu thu chi là Tổng tiền ở dải đáy). Lựa chọn nhớ theo từng màn trên máy người dùng.
- Form phiếu (T105): đầu phiếu (hàng Thanh toán, khung thông tin chung) đứng yên, chỉ vùng bảng chi tiết và các tab cuộn, tiêu đề cột dính. Phần tổng nằm ở dải cố định ngay trên thanh nút (`DaiTong`), khoản bằng 0 hiện mờ; phiếu thu chi giữ Tổng tiền ở dải như cũ.
- Phiếu thu chi bỏ tab Hạch toán (Ghi sổ ở gói Free) trong form. Gói Free không có tab Ghi sổ ở mọi phiếu (T62).
- Form Mua hàng tích Nhận kèm hoá đơn, form Bán hàng tích Lập kèm hoá đơn thì Mẫu số, Ký hiệu, Số, Ngày hoá đơn thành một cột riêng trước cột Ngày chứng từ, Số phiếu. Cột này ba hàng đều với hai cột trái: Mẫu số và Ký hiệu, Số hoá đơn, Ngày hoá đơn, cả bốn ô bắt buộc (T83, thay cách xếp ở cột phải của T68). Mua, bán không có tab Hoá đơn (T62, T83). Phiếu mua, bán có kho: gói dưới Pro chọn một kho ở cột phải đầu phiếu, dưới số phiếu, bỏ cột Kho trên dòng. Mua ghi Kho nhập, trả lại hàng mua ghi Kho xuất; hoá đơn bán hàng ghi Kho xuất, trả lại hàng bán ghi Kho nhập. Lập hoá đơn 3.1.5, hoá đơn điều chỉnh 3.1.6 không có kho; gói Pro chọn kho trên từng dòng. Chi nhánh chỉ có một kho thì phiếu mới điền sẵn kho đó (T83). Số lô, Hạn dùng trên dòng chỉ có ở gói Pro (T68). Mua, bán chọn Tiền mặt ngay thì chọn quỹ tiền mặt của chi nhánh, Chuyển khoản ngay thì chọn quỹ ngân hàng, ngay trên hàng Thanh toán (T78). Nhật ký thêm mới, sửa, xoá áp cho mọi phiếu dùng form chung.
- Phiếu thu chi không có dòng Tổng cộng trong bảng chi tiết vì trùng Tổng tiền. Tổng tiền (kèm số dòng) nằm ở dải cố định đáy form, số thẳng cột Thành tiền.
- Mọi phiếu: menu Tiện ích ghi Sao chép (thay Nhân bản), thêm Tuỳ chỉnh giao diện phiếu để ẩn hiện cột bảng chi tiết; lựa chọn nhớ theo màn trên máy người dùng.
- Bản mẫu chưa có backend: phiếu mới lưu hiện lên đầu danh sách, số phiếu tăng dần; phiếu đã có sửa rồi lưu thì danh sách hiện nội dung mới; giữ tới khi tải lại trang (`generic/daXoa.ts`).
- Gói Free có ô Tháng hạch toán lãi lỗ: mặc định tháng của ngày chứng từ, chọn được các tháng trước chưa khoá sổ. Phiếu chuyển quỹ không có ô này vì không ảnh hưởng lãi lỗ.

Lý do: PhuongXT chốt ngày 09/10/2026 theo ảnh góp ý trên form Thu tiền mặt mới (T49).

## QD34. Tối ưu bộ khung 1 trang nhìn và dữ liệu lớn theo LedgerStudio (09/10/2026)

- Màn danh sách chứng từ (`.page-voucher`) và màn xem báo cáo (`.page-report`): khoá cứng 100vh theo mô hình Flexbox 3 tầng độc lập, chặn triệt để thanh cuộn ngoài cấp trang trên `.main`.
- Bảng danh sách chứng từ tích hợp Virtual Scrolling (`useVirtualScroll`): tự đo chiều cao dòng thật từ DOM bằng trung vị (median) 16 dòng đầu để tránh hở đáy; chế độ vuốt nhanh flushSync với key vị trí để không huỷ/tạo lại DOM node; thuật toán giữ min-width của tiêu đề cột chống giật rung ngang khi cuộn.
- Bổ sung thanh gom nhóm `GroupZone` trên đầu bảng danh sách chứng từ: cho phép chọn cột để gom nhóm đa cấp, tự động tính tổng con (subtotal) theo từng nhóm, hỗ trợ thu gọn và mở rộng từng nút nhóm (`buildGroupedData`).
- Tối ưu hiệu năng cuộn bảng báo cáo lớn: áp dụng CSS `content-visibility: auto` kèm `contain-intrinsic-size: 0 28px` cho các dòng `<tr>` trên bàn xem tờ giấy (`.bc-ban .rpt`), giữ nguyên khung đo ẩn và in ấn.

Lý do: Trum giao việc T50 ngày 09/10/2026, đúc kết từ kiến trúc của LedgerStudio.

## QD35. Gói Free gọn theo hộ kinh doanh, đổi tên phân hệ, Danh mục xuống dưới (09/10/2026)

- Gói Free không có phân hệ Tổng hợp. Bỏ khỏi gói Free: 3.2.5, 10.4.1. Giữ Báo cáo kết quả kinh doanh 10.2.3, xem ở phân hệ Báo cáo.
- Phân hệ Bán hàng, mọi gói: tab chứng từ 3.1.1 tên Xuất bán POS. Chứng từ chỉ đổ về từ phần mềm bán hàng (nút Tải từ FABi), không lập tay, giống Xuất bán POS của Inventory. Gói Free chỉ có tab này. Từ gói Plus có thêm tab Bán hàng 3.1.7 (lập tay bán ngoài POS: tiệc, khách công ty; màn mới khai ở `BO_SUNG`) và Hoá đơn bán hàng 3.1.2.
- Gói Free có phân hệ Kho chỉ với Kiểm kê 5.1.10 và Báo cáo xuất nhập tồn 5.2.3; bỏ Tồn kho tức thời 5.2.4, Sổ chi tiết vật liệu, dụng cụ, hàng hoá 5.2.8.
- Gói Free có Mua hàng 4.1.1 và Sổ công nợ nhà cung cấp 4.2.3 (màn mới, chưa có trong Excel, khai ở `BO_SUNG` của `plan.ts`).
- Gói Free không có tab Đính kèm trong form chứng từ.
- Đổi tên phân hệ: Kế toán tiền thành Thu chi, Thuế GTGT thành Kê khai thuế, Công cụ dụng cụ thành Chi phí phân bổ. Gói Free giữ Chi phí phân bổ và ô Tháng hạch toán lãi lỗ.
- Danh mục nằm dưới đường kẻ, ngay trên Hệ thống; giữa Danh mục và Hệ thống cũng có đường kẻ (T53). Kê khai thuế nằm ngay dưới Công cụ dụng cụ. Áp ở mọi gói.
- Các thay đổi gói ghi tạm ở `THEO_ROADMAP`, `BO_SUNG` của `src/app/plan.ts`; Trum cập nhật Excel tính năng rồi chạy lại `tools/xuat_tinh_nang.py` thì xoá các dòng đó.

Lý do: PhuongXT chốt ngày 09/10/2026 (T52).

## QD36. Sổ thu chi lọc theo quỹ tiền, màn xem báo cáo một tờ liền (09/10/2026)

- Sổ quỹ tiền mặt, Sổ ngân hàng có bộ lọc Quỹ tiền; Sổ công nợ có bộ lọc Đối tượng. Không có bộ lọc Chi nhánh vì sổ theo chi nhánh chọn trên thanh trên.
- Lọc quỹ thì số liệu sổ tính lại theo quỹ đó, không chỉ ẩn dòng, nên tồn đầu, tồn cuối đúng. Danh sách chọn khai cố định ở `ds` của `LocBC` (`bao-cao/danh-sach.ts`).
- Sổ ngân hàng tách theo tài khoản: xem tất cả quỹ thì có cột Quỹ tiền và mặc định khổ ngang. Khổ người dùng chọn nhớ theo báo cáo và khổ mặc định của trường hợp đang xem (`ToGiay.tsx`).
- Gói Free không có Sổ chi tiết tiền 2.2.7 và Sổ công nợ 2.2.5 ở Thu chi; công nợ xem ở Sổ công nợ nhà cung cấp 4.2.3 của Mua hàng.
- Màn xem báo cáo: hàng trên cùng gồm nút về Tất cả báo cáo, ô chọn báo cáo kiêm tiêu đề, ngày, lọc, in, xuất. Ẩn thanh tab của phân hệ Báo cáo khi đang xem một báo cáo. Khung báo cáo kéo tới đáy màn hình.
- Xem trên màn hình là một tờ liền: không ngắt trang, không dòng cộng chuyển trang, không số trang, không nút Liên tục/Từng trang, không nút In ở thanh dưới. In và xuất file vẫn chia trang theo khổ giấy.

Lý do: PhuongXT chốt ngày 09/10/2026 (T54, T55).

## QD37. Màn xem báo cáo gộp T55 và bản Anti (09/10/2026)

- Trong phân hệ Báo cáo, tên báo cáo chỉ hiện ở ô chọn trên hàng trên cùng. PageHead của màn ẩn đi, trừ màn có nút hành động riêng (vd Tờ khai GTGT có Xuất XML, Nộp tờ khai).
- Thanh công cụ báo cáo dùng nút có chữ: Tuỳ chỉnh, Xuất, In (nút chính). Màn rộng dưới 1360px thì Tuỳ chỉnh, Xuất chỉ còn biểu tượng; In luôn có chữ.
- Thanh dưới tờ giấy có nút Tờ in / Bảng dữ liệu. Tờ in là một tờ liền theo QD36. Bảng dữ liệu hiện bảng đầu tiên của báo cáo dạng lưới, cuộn ảo cho dữ liệu lớn, ẩn Khổ và phóng to thu nhỏ. Lựa chọn nhớ trên máy (`bc-che-xem`). In và xuất file ở chế độ nào cũng ra tờ in chia trang.
- Thanh dưới chỉ hiện số dòng khi đếm được dòng.

Lý do: Trum giao T57 ngày 09/10/2026, gộp nền T55 của PhuongXT với ý tưởng nút có chữ và chế độ lưới trong bản nháp của Anti.

## QD38. Báo cáo mua hàng, nhập hàng cho mọi gói (09/10/2026)

- Phân hệ Mua hàng có 5 báo cáo ở mọi gói, kể cả Free. Tổng hợp mua hàng 4.2.2 gom theo nhà cung cấp, Chi tiết mua hàng 4.2.1 mỗi phiếu một dòng. Tổng hợp nhập 4.2.4 gom theo mặt hàng, Chi tiết nhập 4.2.5 mỗi dòng hàng. Thêm Sổ công nợ nhà cung cấp 4.2.3.
- Số liệu tính từ đúng các phiếu mua hàng 4.1.1 trong danh sách (`mua-hang/bao-cao.ts`), theo chi nhánh trên thanh trên, nên các báo cáo khớp nhau.
- Tên 4.2.1, 4.2.2 trong app đổi theo; 4.2.4, 4.2.5 là màn mới khai ở `BO_SUNG`. Trum cập nhật Excel tính năng.
- Sơ đồ Quy trình Mua hàng kiểu hội tụ như Thu chi: các làn Nhập hàng, Hoá đơn và trả lại, Thanh toán, Đối chiếu công nợ có mũi tên đổ về khối Sổ sách, báo cáo.
- Sổ ngân hàng ở chế độ không dùng tài khoản (gói Free) bỏ cột TK đối ứng, ghi Thu, Chi, Tồn như Sổ quỹ (đóng T25).

Lý do: PhuongXT chốt ngày 09/10/2026 (T63).

## QD39. Ô chọn danh mục trong form chứng từ, nguồn chứng từ Mua hàng (09/10/2026)

- Ô nào trong form chứng từ lấy từ danh mục thì là ô chọn có ô tìm (gõ không dấu cũng tìm được). Cuối danh sách có nút Thêm mới; gõ tên chưa có rồi Enter thì mở hộp thêm nhanh.
- Mục thêm mới được chọn luôn cho ô đó và có trong mọi ô cùng danh mục (`ui/ChonDanhMuc.tsx`). Bản mẫu giữ trong phiên tới khi tải lại trang.
- Hàng hoá thêm tại dòng cần Mã và Tên, đơn vị tính tạm "cái", giá 0, sửa trên dòng.
- Phiếu Mua hàng (mua hàng, mua qua sơ chế, trả lại) có nguồn Thủ công hoặc Excel. Không có Tải từ iPOS Inventory ở nút Thêm mới và sơ đồ Mua hàng.

Lý do: PhuongXT chốt ngày 09/10/2026 (T64, T65).

## QD40. Bộ lọc tự sinh và cột lọc bên trái màn xem báo cáo (09/10/2026)

- Màn xem báo cáo có cột Bộ lọc bên trái, luôn hiện, thu gọn được (nhớ trên máy, khoá `bc-loc-thu`). Báo cáo không có bộ lọc nào ngoài kỳ thì không có cột này. Nút phễu trên thanh công cụ bỏ, không có hai nơi lọc.
- Mọi báo cáo tự có bộ lọc theo cột đang hiện: cột chữ thành ô chọn nhiều giá trị (có ô tìm khi trên 8 giá trị), cột số thành ô Từ – Đến. Không tạo cho cột ngày (kỳ chọn ở thanh trên), cột STT, cột chỉ có một giá trị. Bộ lọc khai tay ở `cfg.loc` (`bao-cao/danh-sach.ts`) đứng trước.
- Không tự sinh bộ lọc cho báo cáo tài chính 10.2.2, 10.2.3, 10.2.4, 10.3.1 và tờ khai thuế, vì lọc dòng làm sai ý nghĩa số tổng. Bảng cân đối số phát sinh 10.2.1 có bộ lọc.
- Lọc xong thì dòng tổng tính lại. Bộ lọc áp cho cả Tờ in và Bảng dữ liệu (QD37).
- Màn Tất cả báo cáo là danh sách gọn theo nhóm, một dòng mỗi báo cáo, hai cột. Trên cùng có Ghim và Mở gần đây (khoá `bc-ghim`, `bc-gan-day`). Biểu tượng theo loại: sổ, bảng kê, tờ khai, báo cáo.
- Bảng danh sách (`ui/Table.tsx`) dính cả khối tiêu đề (`thead` sticky), hàng tiêu đề trên kẻ đường dưới bằng bóng thay viền, không đo chiều cao hàng tiêu đề nữa (T67).

Lý do: Trum chốt ngày 09/10/2026 (T58, T66, T67, T75), chọn hướng cột lọc bên trái và danh sách gọn trong bản phác.

## QD41. Hệ thống tài khoản theo chế độ, panel danh mục (đang soạn)

## QD42. Chia bộ báo cáo theo gói và thông tư (10/10/2026)

- Báo cáo hiện khi gói có tính năng và thông tư đang chọn áp dụng báo cáo đó. Thông tư không áp dụng thì ẩn hẳn, không hiện khoá, không mời nâng cấp.
- Thông tư áp dụng khai ở `cheDo` trong `CAU_HINH_BC` (`src/modules/bao-cao/danh-sach.ts`). Thiếu `cheDo` là mọi thông tư. Hàm `apDung` trong `registry.ts` đọc khai báo này. Báo cáo không còn suy "không áp dụng" qua gói thấp nhất; màn khác báo cáo giữ cách cũ.
- Gói Free (TT152) có bộ báo cáo hộ kinh doanh theo iFaster, gồm 17 báo cáo.
  - Thu chi: 2.2.1, 2.2.3, 2.2.5, 2.2.8, 2.2.9. Gói Free có lại 2.2.5 Sổ công nợ, thay ý T54.
  - Bán hàng, mua hàng, kho: 3.2.5, 4.2.1 tới 4.2.6, 5.2.2, 5.2.3.
  - Báo cáo bán hàng, chi tiết bán hàng, bán hàng theo ngày của iFaster không làm riêng: 3.2.1, 3.2.3 đã bỏ ở mọi gói (T99), dùng Sổ doanh thu 3.2.5.
  - Thuế, tổng hợp: 6.2.5, 10.2.3, 10.4.3.
- Thêm 4 báo cáo cho mọi gói, mọi thông tư: 2.2.8 Tổng hợp quỹ tiền, 2.2.9 Báo cáo dòng tiền, 4.2.6 Mua hàng theo ngày, 10.4.3 Sổ chi phí. Mã chưa có trong Excel, khai ở `BO_SUNG`; gói mở thêm khai ở `THEO_ROADMAP`. Khi cập nhật Excel (T33) thì đưa vào Excel rồi xoá các dòng này.
- Sổ doanh thu 3.2.5 theo TT152 ghi ký hiệu S2a-HKD như iFaster, chờ kế toán trưởng duyệt (T04).
- Chỉ áp dụng TT58: 2.2.7, 10.4.1. Chỉ TT152, TT58: 6.2.5.

Lý do: Trum chốt ngày 10/10/2026 (T97), theo bộ báo cáo hộ kinh doanh của iFaster đọc cùng ngày.

## QD43. Bộ sổ TT58 theo phương pháp thuế

- Chế độ TT58 có thêm hai lựa chọn ở Thông tin đơn vị: phương pháp tính thuế GTGT (tỷ lệ % trên doanh thu, khấu trừ) và TNDN (tỷ lệ % trên doanh thu, trên thu nhập tính thuế). Mặc định trường hợp 2.
- Trường hợp quyết định sổ nào hiện (khai `th` trong `CAU_HINH_BC`): TH1 S1; TH2 S2a, S2b, S2c, S2d; TH3 S3a, S3b; TH4 S2b, S2c, S2d, S3b. S4a, S4b, S4c, S4d hiện mọi trường hợp. B01-DNSN, B02-DNSN chỉ hiện ở TH2, TH4 (nộp TNDN trên thu nhập tính thuế mới phải lập).
- S1, S2a, S3a dùng chung màn 3.2.5, ký hiệu và bố cục đổi theo trường hợp; TH4 ẩn màn này.
- Biểu mẫu dựng theo bộ file `D:\IACC-CLOUD\TT58` (bản dựng lại từ nguồn thứ cấp), kể cả 3 điểm chưa chắc; chờ kế toán trưởng đối chiếu Công báo (T04). Tỷ lệ % nhóm ngành là tỷ lệ mẫu.
- Phiếu thu, chi, nhập, xuất TT58 in đủ ô ký theo biểu mẫu, gồm Kế toán trưởng. Đơn vị không có kế toán trưởng tự xoá ô ở Thiết kế mẫu in.
- Gói Standard mở 7.2.1 (Sổ TSCĐ, S4b-DNSN) để đủ bộ sổ TT58.

Lý do: Trum chốt ngày 10/10/2026 (T108).

## QD44. Thiết kế lại màn hình Gói thuê bao và bộ logo nhận diện 4 gói (10/10/2026)

- Bộ nhận diện logo 4 gói (`src/ui/GoiLogo.tsx`):
  + Giữ nguyên hệ màu gốc: Free xám thép (`--fr`), Standard xanh ngọc (`--st`), Plus xanh dương hoàng gia (`--md`), Pro vàng hổ phách (`--ad`).
  + Phối gradient đa tầng sắc nét, viền specular phản quang ánh gương và bóng đổ màu phát quang (`glow`).
  + Biểu tượng vector SVG riêng biệt mang tính biểu trưng cho từng gói:
    * Free (F): Cánh lá mầm vươn lên, tượng trưng khởi đầu tinh gọn, 0 đ trọn đời, TT152.
    * Standard (S): Chiếc khiên chuẩn hoá 2 nửa vát cạnh kèm checkmark, biểu tượng chuẩn mực DN siêu nhỏ, TT58.
    * Plus (PL): Ngôi sao tăng trưởng 4 cánh kim cương kết hợp dấu cộng, bứt phá chuỗi 1–10 điểm, Nợ/Có, TT133.
    * Pro (PR): Vương miện hoàng gia 5 đỉnh vát cạnh kim cương, đại diện chuỗi lớn không giới hạn, TT99.
  + Nhãn gói `.pk`: nâng cấp gradient rực rỡ và viền kính cho toàn bộ app, có prop `logo` tùy chọn nhúng icon SVG.

- Màn hình Gói thuê bao (`src/modules/he-thong/GoiThueBao.tsx`):
  + Thẻ hiện trạng bản quyền (Hero Status Card): logo gói 52px glow, tên đơn vị, MST, chế độ kế toán, hạn dùng và thanh đếm ngày.
  + Bộ chuyển đổi kỳ thanh toán Năm / Tháng với huy hiệu "Tiết kiệm 20%".
  + 4 Thẻ gói dịch vụ: định vị phân khúc F&B rõ ràng, giá to bản, badge "Đang sử dụng", "Khuyên dùng cho chuỗi". Mỗi thẻ có nút CTA, thanh tiến độ tính năng mini, danh sách 5 tính năng cốt lõi.
  + Bảng so sánh 120 tính năng theo phân hệ: ô tìm kiếm tính năng real-time, checkbox lọc chỉ tính năng khác biệt, nút mở rộng/thu gọn tất cả, highlight cột gói đang dùng.
  + Khối Hỏi đáp thường gặp (FAQ) và modal xác nhận chuyển đổi gói đồng bộ chế độ kế toán.

Lý do: Trum giao việc thiết kế lại màn hình Gói thuê bao và logo 4 gói ngày 10/10/2026 (T119).

## QD45. Ẩn tạm mẫu báo cáo do agent tự dựng (đang soạn)
