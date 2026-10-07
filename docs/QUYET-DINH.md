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
