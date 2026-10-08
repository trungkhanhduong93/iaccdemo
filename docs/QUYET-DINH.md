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
- Cố ý chưa làm: ghim tính năng ("HAY DÙNG" của AMIS), tab Biểu đồ từng phân hệ, mục Báo cáo chung trên sidebar.

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

## QD25. Danh sách chứng từ theo iFaster: lọc, cột, thao tác hàng loạt (đang soạn)
