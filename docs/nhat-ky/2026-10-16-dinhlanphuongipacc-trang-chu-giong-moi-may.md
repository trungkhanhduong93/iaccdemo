# Trang chủ Free hiển thị giống nhau mọi máy (T303)

- Ngày: 16/10/2026
- Người: dinhlanphuongipacc, agent: Claude Code. Làm ở máy HAN-IPOS381
- Trạng thái cuối phiên: Xong

## Đã làm

- Hiện tượng: cùng bản online, máy phóng to chữ 125–150% và trình duyệt Cốc Cốc (thanh biểu tượng bên phải chiếm khoảng 60px) thấy chú thích quỹ rơi xuống dưới vòng tồn quỹ, cột Quản lý thu chi dài hơn cột Quản lý lãi lỗ, Quản lý kho bị đẩy xuống. Chrome cùng máy thì không. Nguyên nhân: khối vòng và chú thích dùng `flex-wrap`, bề rộng cột nằm sát ngưỡng xuống dòng.
- `src/styles/app.css` mục cuối T303: khối vòng không xuống dòng nữa. Vòng rộng bằng khung trừ 260px, trong khoảng 150–260px, nhường chỗ cho chú thích. Tên quỹ dài xuống 2 dòng thay vì cắt "...". Màn hẹp hơn 900px vẫn cho xuống dòng như cũ.
- `home/BaBaiToanFree.tsx` (`VongQuy`): mỗi dòng quỹ trong chú thích có mũi tên › ở cuối như các dòng chi phí cột lãi lỗ, để biết bấm được (mở biểu đồ thu chi quỹ đó). Rê chuột thì mũi tên xanh.
- Tiêu đề ba khối bỏ số 1, 2, 3 và in hoa (CSS `text-transform`, chữ gốc giữ thường): Quản lý lãi lỗ, Quỹ tiền (trước là Quản lý thu chi), Quản lý kho. Sửa `home/BaBaiToanFree.tsx`, `mobile/MTrangChu.tsx`, `app.css` mục T303; `tools/kiem_tra.py` đổi chữ dò "Quản lý thu chi" thành "Quỹ tiền".
- Nút cuối khối Quỹ tiền đổi thành "Xem biểu đồ thu chi 13 tháng", mở hộp mới `HopThuChi13` (`home/BaBaiToanFree.tsx`) bố cục như hộp lãi lỗ 13 tháng: cột Thu (xanh lá), cột Chi (đỏ), đường Tồn quỹ cuối tháng (xanh dương), tóm tắt bên phải, nút Xem lịch sử thu chi. Số liệu `thuChi13Thang`: tháng 7–10/2026 lấy thật từ `tonQuyTheoSo`, 9 tháng trước là số mẫu theo hệ số mùa vụ, tồn tính lùi từ tồn đầu tháng 7. `LaiLoChart` (`ui/Charts.tsx`) thêm tham số `ten`, `mau`, `duong` để dùng chung. Điện thoại (`mobile/MTrangChu.tsx`) dùng cùng hộp. Số tồn quỹ ở đầu khối vẫn mở modal gộp các quỹ như cũ.
- Lịch sử thu chi máy tính (`home/LichSuQuy.tsx`): danh sách trở lại kiểu app ngân hàng của T230 thay cho bảng mẫu L1 của T272: gom theo ngày, mỗi giao dịch một dòng có biểu tượng thu, chi, diễn giải, số phiếu, nguồn, số tiền chỉ tô màu (T273), số dư sau giao dịch. Bấm cả dòng mở chứng từ gốc ở tab mới. Phần đầu, 4 ô tổng và dòng ghi chú "Bấm vào một giao dịch..." (xem tất cả quỹ ghi thêm thu, chi gồm tiền chuyển giữa các quỹ) cố định, chỉ danh sách cuộn. Xem tất cả quỹ thì dòng phụ ghi thêm tên quỹ, số dư là tổng các quỹ (`duGop`). Giữ 4 ô Tồn đầu kỳ, Tiền thu vào, Tiền chi ra, Tồn cuối kỳ. Bản điện thoại vốn đã dạng danh sách, không đổi. `kiem_tra.py` đợt 19B dò `.lsq-ds` thay `.lsq-l1-bang`.
- Trang chủ máy tính, hai cột Quản lý lãi lỗ, Quỹ tiền gọn lại (lớp `bbt-gon`: dòng chi phí thấp hơn, vòng tồn quỹ 130–190px), dưới mỗi cột hiện thẳng biểu đồ 13 tháng (Lãi lỗ 13 tháng, Thu chi 13 tháng, hai biểu đồ thẳng hàng). Biểu đồ cao cố định 210px, vẽ theo bề rộng thật đo bằng `ResizeObserver` (`KhungVua`, tham số `rong` mới của `LaiLoChart`) nên không phình cao khi cột rộng. Cột lãi lỗ đổi sang dạng bảng kê gọn: mỗi khoản một hàng không nền màu, ghi chú nhỏ (Theo giá thành..., Nhiều nhất...) ngay sau tên, màn hẹp thì cắt "..."; Doanh thu chữ xanh dương, Lợi nhuận xanh lá có vạch trên; số tiền các dòng thẳng cột; số lớn 26px; vòng tồn quỹ 120–150px, khoảng cách các khối 4px. Ở màn 1535×810 (máy phóng to 125%) hai cột hết ở 752px, thấy trọn hai biểu đồ; cao hai cột như nhau ở 1180, 1535, 1920px. Bỏ nút dưới biểu đồ và bỏ luôn hộp chi tiết ở bản web: biểu đồ hiện thẳng, không cần bấm. Biểu đồ thu chi đổi tên Dòng tiền 13 tháng (web, hộp và nút "Xem dòng tiền 13 tháng" ở điện thoại). Bản web vì vậy mất kiểu xem lãi lỗ Theo cửa hàng của T274 (chỉ còn ở hộp lãi lỗ trên điện thoại). `kiem_tra.py`: bài T274 web đổi thành kiểm hai biểu đồ có trong cột; 19B dò chữ Dòng tiền 13 tháng. Điện thoại giữ nút mở hộp như cũ.
- Cuối phiên: biểu đồ tách khỏi phần trên rõ hơn (vạch trên, đệm 16px), khối trên co thêm (số lớn 24px, vòng 110–130px, chú thích quỹ 12,5px) để cột vẫn hết ở 733px trên màn 1535×810.
- Nhiều quỹ (`VongQuy`): quá 5 quỹ thì vòng và chú thích chỉ giữ 4 quỹ nhiều tiền nhất, còn lại gom một dòng "N quỹ khác" màu xám (cả lát xám trên vòng). Bấm vào mở bảng nổi "Tất cả quỹ (N)" ngay trên khối: đủ mọi quỹ xếp theo số tiền, cuộn trong bảng, bấm quỹ mở biểu đồ thu chi quỹ đó, cuối bảng có nút Biểu đồ thu chi tất cả quỹ; Esc, nút x hoặc bấm ra ngoài thì đóng. dinhlanphuongipacc muốn giữ ví dụ 10 quỹ: thêm `QUY_MAU_THEM` (5 quỹ mẫu Hai Bà Trưng, Phú Nhuận, Thủ Đức, MB Bank, VPBank, chỉ có số dư) vào khối Quỹ tiền trang chủ máy tính, tồn quỹ trang chủ thành 640.783.000 đ. Quỹ mẫu chưa có trong Danh mục Quỹ tiền, Lịch sử thu chi, bản điện thoại; bấm quỹ mẫu thì hộp quỹ hiện số 0.
- Khối Quỹ tiền có nút "+ Tạo quỹ" cạnh tiêu đề (mở Danh mục Quỹ tiền, form thêm mới, `?moi=1&goiY=thuchi` như T245, T250). Chưa có quỹ nào thì thay vòng bằng khung "Chưa có quỹ tiền nào", câu hướng dẫn tạo quỹ để lập phiếu thu, chi, nút Tạo quỹ (đã ép tạm trạng thái trống để xem, đã trả lại).
- Biểu đồ trong cột lãi lỗ đổi tiêu đề thành "Hiệu quả kinh doanh", dòng phụ nghiêng "Xu hướng doanh thu & tăng trưởng so với cùng kỳ (YoY)" theo chữ dinhlanphuongipacc đưa. Biểu đồ vẫn vẽ doanh thu, chi phí, lãi lỗ 13 tháng, chưa có số % tăng trưởng so với cùng kỳ. `kiem_tra.py` dò chữ tiêu đề mới. Biểu đồ Dòng tiền 13 tháng thêm dòng phụ "Thu, chi, dòng tiền thuần và tồn quỹ cuối tháng" để hai tiêu đề, dòng phụ, chú thích, biểu đồ thẳng hàng nhau.
- Dòng tiền 13 tháng thêm đường Dòng tiền thuần (thu − chi, có thể âm): `LaiLoChart` thêm tham số `duong2` và số `v2`; dùng ở cột Quỹ tiền web và hộp trên điện thoại.
- Màu hai biểu đồ: biến `--bd-*` ở mục T303 cuối `app.css`, màu rõ không chói, hai biểu đồ khác màu cho đỡ lẫn: Lãi lỗ cột xanh dương sáng `#2f80ed`, cam `#f5a03a`; Dòng tiền cột xanh ngọc `#14a38b`, đỏ san hô `#ef6b5b`, Tồn quỹ nét đứt chàm `#5b5bd6`. Đường kết quả (Lãi lỗ, Dòng tiền thuần) navy `--navy`, điểm xanh lá khi dương, đỏ khi âm. Đã thử pha trắng (`color-mix`) nhưng nhạt quá, bỏ. Đường mặc định của `LaiLoChart` đổi từ `--ink` sang `--navy`.

## Đã kiểm

- Đo trên `npm run dev` gói Free ở 1180, 1280, 1460, 1536, 1920px: chú thích luôn nằm cạnh vòng, không chữ nào bị cắt, hai cột trên cao bằng nhau (1180px: 493/493, 1920px: 510/510).
- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_tra.py --nhanh` chạy 3 lượt, lượt cuối trên đúng bản push (sau khi lấy commit T301, T302 của Trum): `Không có lỗi.` Chưa chạy `--dien-thoai`.
- `tools/xuat_bao_cao_he_thong.py` không chạy được ở máy này (thiếu thư mục `Present` cạnh repo), chưa làm mới file Excel báo cáo.
- Chưa mở thử trên Cốc Cốc thật, chờ robot đưa lên iaccdemo.pages.dev rồi xem lại.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- Việc nhận mã T301 lúc đầu, commit nhận việc chưa push được (máy chưa đăng nhập GitHub). Trong lúc đó Trum dùng T301, T302 cho việc khác, nên đổi sang T303 trước khi push. Máy mới phải đăng nhập GitHub và push được commit nhận việc ngay, nếu không mã việc dễ trùng.
