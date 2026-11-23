# 10. Quy trình làm việc và phối hợp team — IACC Cloud (iaccdemo)
Bản xuất từ repo iaccdemo commit 98d2bb3, ngày 23/11/2026.

## Phạm vi tài liệu
Tài liệu này hướng dẫn chi tiết quy trình làm việc và kiểm thử trong dự án IACC Cloud. Nội dung bao gồm vai trò của ba thành viên, các quy tắc trong AGENTS.md, quy trình phiên làm việc, bộ công cụ tools/ và điều phối Agent AI. Chi tiết về giao diện hoặc kiến trúc kỹ thuật nằm tại tài liệu 06 và 09.

## 1. Cơ cấu nhân sự và nguyên tắc phối hợp nhóm

### 1.1. Ba thành viên nòng cốt và phân công trách nhiệm
Dự án IACC Cloud do ba thành viên nòng cốt phát triển với trách nhiệm cụ thể (AGENTS.md:3):

| Thành viên | Tên tài khoản GitHub | Vai trò và trách nhiệm chính trong dự án |
| :--- | :--- | :--- |
| **Trum** | `trungkhanhduong93` | Trưởng dự án: giao việc, chốt quyết định kiến trúc và nghiệp vụ (QD01-QD115), duy trì các tệp sinh tự động (`features.json`, biểu tượng logo), quản trị khoá bảo mật Cloudflare và phê duyệt phát hành phiên bản mới. |
| **PhuongXT** | `PhuongXT` | Lập trình viên chính: xây dựng giao diện các phân hệ kế toán, hoàn thiện hệ thống báo cáo tài chính theo thông tư, thiết lập luồng nghiệp vụ mua bán hàng và kiểm tra đối soát số liệu. |
| **dinhlanphuongipacc** | `dinhlanphuongipacc` | Lập trình viên chuyên trách: phát triển các phân hệ tiện ích, chứng từ kho vận, kiểm thử giao diện di động, sửa đổi các bẫy kỹ thuật và tối ưu hoá câu chữ hiển thị. |

### 1.2. Cơ chế làm việc trực tiếp trên nhánh main
Dự án áp dụng mô hình phân phối liên tục không qua bước duyệt kéo mã (AGENTS.md:5):
Mọi thành viên và các trợ lý AI đều tự kiểm tra mã nguồn và đẩy trực tiếp lên nhánh main của kho chứa GitHub (AGENTS.md:5).
Mỗi khi có mã nguồn mới đẩy lên nhánh main, GitHub Actions tự động kiểm tra cú pháp và triển khai bản mới lên trang web `https://iaccdemo.pages.dev` (AGENTS.md:5).
Bản phát hành chính thức tại `https://i-accounting.pages.dev` chỉ cập nhật khi có thành viên gắn thẻ phiên bản phát hành theo quy trình quy định (AGENTS.md:5).
Vì không có bước duyệt mã trung gian, quy trình kiểm thử 5 bước trước khi đẩy mã là chốt chặn an toàn duy nhất để bảo vệ chất lượng hệ thống (AGENTS.md:5).

### 1.3. Văn hoá giao tiếp và xưng hô trong dự án
Quy tắc giao tiếp trong dự án được chuẩn hoá nhằm nâng cao hiệu quả làm việc (AGENTS.md:9):
Ngôn ngữ giao tiếp bắt buộc là tiếng Việt có dấu, diễn đạt trực diện, ngắn gọn, đi thẳng vào bản chất vấn đề, không mở đầu rườm rà.
Trợ lý AI xưng là "tui", gọi người dùng là "Trum" hoặc gọi bằng tên tài khoản GitHub (user_global).
Đối với thành viên mới, các chỉ dẫn kỹ thuật được diễn giải bằng từ ngữ phổ thông, kèm theo câu lệnh cụ thể có thể sao chép và chạy được ngay (AGENTS.md:10).
Khi gặp vấn đề chưa rõ ràng về nghiệp vụ kế toán hoặc quyết định thiết kế, bắt buộc phải hỏi lại Trum, tuyệt đối không được tự ý phỏng đoán (AGENTS.md:12).

## 2. Quy trình làm việc từng bước trong một phiên (Session Workflow)

Quy trình làm việc chuẩn trong một phiên gồm 6 giai đoạn nối tiếp nhau (AGENTS.md:17):

### Giai đoạn 1: Khởi động đầu phiên làm việc
Mỗi phiên làm việc của lập trình viên hoặc trợ lý AI bắt buộc phải thực hiện trong một thư mục clone độc lập, không dùng chung thư mục làm việc giữa các phiên để tránh xung đột mã nguồn (QD21, AGENTS.md:18).
Các bước thực hiện tuần tự như sau:
1. Chạy lệnh đồng bộ mã nguồn mới nhất: `git pull --rebase`. Nếu phát sinh xung đột, lập trình viên phải dừng lại và báo cáo, không tự ý ghi đè (AGENTS.md:19).
2. Nếu tệp `package-lock.json` có thay đổi, lập trình viên chạy lệnh `npm ci` để đồng bộ thư viện (AGENTS.md:19).
3. Chạy lệnh kiểm tra tiến độ đầu phiên: `python tools/ban_do.py dau-phien <tên GitHub>`. Lệnh in ra danh sách việc được giao, các việc người khác đang giữ kèm tệp liên quan, mã việc tiếp theo và phần dở dang của 3 nhật ký gần nhất (AGENTS.md:20).
4. Kiểm tra nhật ký phiên trước: nếu phiên trước còn dở dang, lập trình viên mở đúng tệp nhật ký đó và tiếp tục công việc từ mục dở dang (AGENTS.md:21).
5. Báo cáo kế hoạch làm việc với Trum hoặc người điều phối trước khi bắt đầu chỉnh sửa mã nguồn (AGENTS.md:22).

### Giai đoạn 2: Nhận việc và giữ chỗ quyết định
Để tránh tình trạng hai người cùng sửa một tệp gây xung đột mã nguồn, quy trình nhận việc được thực hiện nghiêm ngặt (QD21, AGENTS.md:23):
1. Lấy mã công việc tiếp theo dạng `Txxx` từ kết quả lệnh `dau-phien` (ví dụ `T903`).
2. Mở tệp `docs/TIEN-DO.md`, chuyển trạng thái công việc sang `Đang làm` hoặc thêm dòng mới nếu là công việc phát sinh ngoài kế hoạch (AGENTS.md:23).
3. Ghi rõ các tệp dùng chung sẽ chỉnh sửa vào cột Ghi chú của bảng tiến độ, đặc biệt là các tệp nhạy cảm gồm `VoucherScreen.tsx`, `ChungTuForm.tsx` và `app.css` (AGENTS.md:24).
4. Nếu công việc có khả năng làm phát sinh quyết định thiết kế hoặc nghiệp vụ mới, lập trình viên phải giữ chỗ trước bằng cách thêm dòng `## QDxx. <tên> (đang soạn)` vào cuối tệp `docs/QUYET-DINH.md` (AGENTS.md:25).
5. Thực hiện commit riêng việc nhận tác vụ này và đẩy ngay lên nhánh main để thông báo cho toàn đội ngũ (AGENTS.md:26).

### Giai đoạn 3: Thực hiện công việc trong phiên
Trong quá trình viết mã hoặc cập nhật tài liệu, lập trình viên tuân thủ các nguyên tắc kỹ thuật (AGENTS.md:58):
Tra cứu mã nguồn thông qua công cụ bản đồ: chạy `python tools/ban_do.py tim <từ khoá>` hoặc `python tools/ban_do.py file <đường dẫn>` để xem dàn ý, tuyệt đối không mở đọc toàn bộ tệp lớn trên 20 KB (QD74, AGENTS.md:35).
Sửa đổi tập trung và chính xác: chỉ sửa đúng các hàm và khối giao diện thuộc phạm vi công việc được giao, không viết lại cả tệp, không tự ý dọn dẹp mã nguồn ngoài phạm vi (AGENTS.md:58).
Thêm định dạng CSS mới: nếu có bổ sung CSS, toàn bộ lớp mới gom vào một mục riêng ở cuối tệp `src/styles/app.css` với tiêu đề có mã công việc, ví dụ `/* ── Thanh lọc theo iFaster (T34) ── */` (AGENTS.md:61).
Ghi nhận bẫy kỹ thuật: nếu gặp lỗi lập trình mất hơn 15 phút mới tìm ra nguyên nhân, lập trình viên ghi chép lại vào tệp `docs/BAY.md` gồm hiện tượng lỗi, nguyên nhân gốc rễ và cách phòng tránh (AGENTS.md:59).
Ghi nhận quyết định mới: mọi thống nhất mới về bố cục, nghiệp vụ kế toán hoặc thư viện đều ghi đầy đủ vào tệp `docs/QUYET-DINH.md` (AGENTS.md:60).

### Giai đoạn 4: Bộ kiểm tra 5 bước bắt buộc trước khi đẩy mã (Pre-push Gate)
Trước khi thực hiện lệnh đẩy mã lên kho chứa, lập trình viên bắt buộc phải chạy đủ 5 bước kiểm tra chất lượng (AGENTS.md:67).
Nếu bất kỳ bước nào báo lỗi, lập trình viên phải khắc phục triệt để và chạy lại từ bước đầu tiên (AGENTS.md:67):

| Bước kiểm tra | Câu lệnh thực thi | Mục tiêu và tiêu chuẩn đạt |
| :--- | :--- | :--- |
| Bước 1: Kiểm tra kiểu dữ liệu tĩnh | `npm run typecheck` | Trình biên dịch TypeScript xác nhận không có bất kỳ lỗi kiểu dữ liệu nào trong toàn dự án (AGENTS.md:68). |
| Bước 2: Kiểm tra biên dịch sản phẩm | `npm run build` | Đóng gói thành công toàn bộ mã nguồn vào thư mục `dist/` mà không phát sinh cảnh báo nghiêm trọng (AGENTS.md:69). |
| Bước 3: Kiểm tra giao diện tự động | `python tools/kiem_tra.py --nhanh` | Trình duyệt Chrome tự động mở kiểm tra các màn hình, bắt buộc phải in ra dòng: `Không có lỗi.` (AGENTS.md:70). |
| Bước 4: Kiểm tra câu chữ tiếng Việt | `python tools/kiem_van.py <file>` | Soát văn bản hiển thị trên giao diện và tài liệu, bắt buộc phải sạch toàn bộ các mục cảnh báo ĐỎ (AGENTS.md:71). |
| Bước 5: Dọn dẹp mã nguồn thử nghiệm | Rà soát thủ công các tệp đã sửa | Xoá bỏ toàn bộ lệnh `console.log`, các đoạn mã tạm thời và dữ liệu thử nghiệm nội bộ (AGENTS.md:72). |

### Giai đoạn 5: Quy trình đồng bộ ngay trước khi đẩy mã (Pre-push Sync)
Vì cả ba thành viên đều đẩy mã trực tiếp lên nhánh main, mã nguồn trên máy chủ GitHub có thể đã có commit mới của người khác trong lúc đang làm việc (QD16, AGENTS.md:77).
Quy trình đồng bộ an toàn được thực hiện như sau:
1. Chạy lệnh lấy thông tin mới nhất: `git fetch origin` (AGENTS.md:78).
2. Kiểm tra xem có commit mới trên máy chủ không: `git log --format="%h %an %s" HEAD..origin/main` (AGENTS.md:79).
3. Nếu lệnh không in ra dòng nào, kho chứa trên máy đang ngang hàng với máy chủ, lập trình viên có thể thực hiện đẩy mã ngay (AGENTS.md:79).
4. Nếu có commit mới xuất hiện, lập trình viên tuyệt đối chưa được đẩy mã. Kiểm tra danh sách các tệp người khác vừa chỉnh sửa bằng lệnh: `git diff --name-only HEAD...origin/main` (AGENTS.md:81).
5. Chạy lệnh tích hợp mã nguồn: `git pull --rebase`. Nếu có xung đột tệp, lập trình viên phải dừng lại và thông báo cho người liên quan, tuyệt đối không tự ý chọn bên nào (AGENTS.md:82).
6. Nếu danh sách tệp người khác vừa đẩy lên có chứa các tệp mã nguồn ngoài tài liệu Markdown, lập trình viên bắt buộc phải chạy lại toàn bộ Bộ kiểm tra 5 bước ở Giai đoạn 4 để đảm bảo mã tích hợp không gây lỗi (AGENTS.md:83).
7. Lặp lại bước 1 cho đến khi không còn commit mới nào trên máy chủ, sau đó mới thực thi lệnh `git push` (AGENTS.md:84).

### Giai đoạn 6: Kết thúc phiên làm việc và bàn giao
Sau khi hoàn thành công việc và trước khi đóng phiên, lập trình viên thực hiện các thủ tục bàn giao chuẩn hoá (AGENTS.md:94):
1. Tạo tệp nhật ký mới trong thư mục `docs/nhat-ky/` theo mẫu `docs/nhat-ky/MAU.md`. Tên tệp đặt theo cú pháp `YYYY-MM-DD-<tên-github>-<việc-ngắn>.md` (ví dụ `2026-11-23-trum-bo-nguon-notebooklm.md`) (AGENTS.md:95).
2. Cập nhật bảng tiến độ trong `docs/TIEN-DO.md`: chuyển trạng thái sang `Xong`, `Dở dang` hoặc `Kẹt`. Nếu công việc đã hoàn thành, chuyển dòng đó lên đầu bảng lưu trữ trong tệp `docs/luu-tru/TIEN-DO-xong.md` (AGENTS.md:96).
3. Chạy script cập nhật báo cáo hệ thống: `python tools/xuat_bao_cao_he_thong.py`. Lệnh sẽ tự động làm mới tệp bảng tính quản trị `docs/IACC-Cloud-Chi-Tiet-He-Thong.xlsx` trên kho chứa (AGENTS.md:97).
4. Nếu thay đổi có tác động trực tiếp đến giao diện người dùng thấy trên bản web trực tuyến, bổ sung một dòng tóm tắt vào tệp `CHANGELOG.md` (AGENTS.md:98).
5. Thực hiện thêm tệp bằng lệnh `git add` chỉ định đích danh từng tệp đã sửa, bao gồm tệp Excel báo cáo hệ thống, tuyệt đối không dùng lệnh `git add -A` để tránh thêm nhầm tệp rác (AGENTS.md:99).
6. Soạn nội dung commit bằng tiếng Việt rõ ràng, bắt đầu bằng mã công việc (ví dụ `T903: hoàn thiện bộ tài liệu nguồn NotebookLM`) (AGENTS.md:100).
7. Thực hiện quy trình đồng bộ Pre-push Sync ở Giai đoạn 5 và thực hiện đẩy mã lên máy chủ `git push` (AGENTS.md:101).
8. Báo cáo mã commit vừa đẩy cho người liên quan và nhắc nhở theo dõi robot triển khai tại địa chỉ Actions của GitHub sau 2 phút (AGENTS.md:102).

## 3. Quy trình phát hành phiên bản mới (Release Workflow)

Bất kỳ thành viên nào trong nhóm khi nhận yêu cầu phát hành bản mới đều thực hiện theo quy trình chuẩn trong `docs/RELEASE.md` mà không cần xin duyệt lại từ Trum (AGENTS.md:90):

| Bước thực hiện | Câu lệnh thao tác | Mục đích và kết quả kiểm tra |
| :--- | :--- | :--- |
| **Bước 1** | `git checkout main && git pull --rebase` | Đảm bảo mã nguồn trên máy là bản mới nhất và đã tích hợp toàn bộ commit trên nhánh chính. |
| **Bước 2** | `npm run typecheck && npm run build` | Kiểm tra toàn diện kiểu dữ liệu tĩnh và đảm bảo đóng gói sản phẩm hoàn hảo. |
| **Bước 3** | `git tag -l "v*"` | Xem danh sách các thẻ phiên bản đã phát hành để xác định số hiệu phiên bản tiếp theo (ví dụ bản cũ là `v1.2.0` thì bản mới là `v1.2.1` hoặc `v1.3.0`). |
| **Bước 4** | `git tag -a v1.X.X -m "Phát hành bản v1.X.X: <tóm tắt tính năng>"` | Tạo thẻ phiên bản mới trên máy cục bộ kèm thông điệp tóm tắt những thay đổi chính. |
| **Bước 5** | `git push origin v1.X.X` | Đẩy thẻ phiên bản mới lên máy chủ GitHub. Hành động này kích hoạt luồng công việc `.github/workflows/release.yml`. |
| **Bước 6** | Kiểm tra `https://github.com/trungkhanhduong93/iaccdemo/actions` | Theo dõi tiến trình đóng gói của robot trong khoảng 1 phút, đảm bảo robot báo biểu tượng tích xanh thành công. |
| **Bước 7** | Kiểm tra `https://i-accounting.pages.dev` | Truy cập trực tiếp trang phát hành chính thức để kiểm tra giao diện bản mới đã hoạt động hoàn hảo. |

Quy tắc bất biến trong phát hành: tuyệt đối không được xoá hoặc gắn lại thẻ phiên bản `v*` đã đẩy lên máy chủ (AGENTS.md:112).
Nếu phát hiện phát hành nhầm hoặc bản phát hành có lỗi nghiêm trọng, lập trình viên phải sửa lỗi và phát hành thẻ có số hiệu kế tiếp, hoặc nhờ Trum thực hiện quay ngược bản triển khai trên bảng điều khiển Cloudflare (AGENTS.md:112).

## 4. Danh mục công cụ tự động hoá trong thư mục tools/

Dự án trang bị bộ công cụ dòng lệnh chuyên dụng bằng Python trong thư mục `tools/` nhằm nâng cao năng suất và kiểm soát chất lượng mã nguồn:

### 4.1. Công cụ bản đồ mã nguồn tools/ban_do.py
Công cụ `ban_do.py` đóng vai trò bản đồ chỉ đường, giúp lập trình viên tra cứu nhanh mã nguồn mà không tốn chi phí đọc tệp lớn (QD74, AGENTS.md:35):
- `python tools/ban_do.py dau-phien <tên>`: in ra toàn bộ ngữ cảnh cần thiết đầu phiên gồm công việc đang làm, việc người khác đang giữ, mã việc tiếp theo và trích đoạn nhật ký (AGENTS.md:20).
- `python tools/ban_do.py tim <từ khoá>`: tìm kiếm vị trí định nghĩa màn hình, hàm xử lý, kiểu dữ liệu, quyết định và bẫy lỗi theo từ khoá không dấu hoặc có dấu (AGENTS.md:37).
- `python tools/ban_do.py file <đường dẫn>`: xuất dàn ý cấu trúc các khối hàm của tệp trên 20 KB thay vì phải đọc nguyên tệp (AGENTS.md:38).
- `python tools/ban_do.py css <từ khoá>`: tra cứu nhanh các khối lớp CSS theo mã công việc Txxx hoặc theo tên lớp chọn (AGENTS.md:39).
- `python tools/ban_do.py qd <từ khoá>`: tra cứu nguyên văn các quyết định thiết kế trong `docs/QUYET-DINH.md` (AGENTS.md:27).
- `python tools/ban_do.py bay <từ khoá>`: tra cứu các bẫy kỹ thuật đã được ghi nhận trong `docs/BAY.md` (AGENTS.md:27).
- `python tools/ban_do.py nhanh`: kiểm tra danh sách các nhánh làm việc và các commit chưa được tích hợp vào nhánh chính (AGENTS.md:41).

### 4.2. Công cụ kiểm thử giao diện tự động tools/kiem_tra.py
Công cụ `kiem_tra.py` sử dụng thư viện tự động hoá trình duyệt để điều khiển Chrome kiểm tra ứng dụng (docs/TRIEN-KHAI.md:12):
- Lệnh mở thử toàn bộ màn hình của cả 4 gói dịch vụ, chụp ảnh lưu vào thư mục `tools/shots/` để kiểm tra độ thẩm mỹ (docs/TRIEN-KHAI.md:12).
- Tuỳ chọn chạy nhanh `python tools/kiem_tra.py --nhanh`: bỏ qua bước chụp ảnh, kiểm tra nhanh lỗi trắng trang, lỗi tràn bề rộng màn hình và lỗi bảng điều khiển console (docs/TRIEN-KHAI.md:13).

### 4.3. Công cụ soát câu chữ tiếng Việt tools/kiem_van.py
Công cụ `kiem_van.py` và tệp mẫu `mau.py` chịu trách nhiệm quét sạch các dấu hiệu văn phong máy móc của trí tuệ nhân tạo (viet-nhu-nguoi):
- Quét toàn bộ văn bản hiển thị trên giao diện và tài liệu hướng dẫn, phát hiện các cách diễn đạt sáo rỗng bị cấm trong bộ quy tắc (viet-nhu-nguoi:45).
- Bắt lỗi danh sách mở đầu bằng tiêu đề in đậm và dấu hai chấm, cảnh báo các câu quá dài trên 40 từ và các đường kẻ ngang thừa (viet-nhu-nguoi:51).
- Trả về mã lỗi nghiêm ngặt: mã 0 là văn bản sạch hoàn toàn, mã 1 là còn cảnh báo VÀNG có thể xem xét, mã 2 là còn lỗi ĐỎ bắt buộc phải sửa trước khi đẩy mã (viet-nhu-nguoi:76).

### 4.4. Công cụ xuất báo cáo quản trị tools/xuat_bao_cao_he_thong.py
Công cụ `xuat_bao_cao_he_thong.py` tự động đọc cấu trúc mã nguồn dự án để xuất ra tệp bảng tính quản trị `docs/IACC-Cloud-Chi-Tiet-He-Thong.xlsx` gồm 5 bảng dữ liệu (tools/xuat_bao_cao_he_thong.py:2):
- Bảng 1 TongQuan: thống kê định lượng về số lượng màn hình, tính năng, quy ước các gói và tiến độ tổng thể.
- Bảng 2 MaTranTinhNang: ma trận 139 tính năng chi tiết, đối chiếu theo từng gói dịch vụ và giai đoạn phát triển.
- Bảng 3 ChiTietManHinh: đặc tả kỹ thuật toàn bộ màn hình, cấu hình chứng từ, danh mục và sổ sách kế toán.
- Bảng 4 BaoCao_MauIn: danh mục toàn bộ báo cáo tài chính, báo cáo thuế và 17 mẫu in chứng từ tiêu chuẩn khổ A4.
- Bảng 5 TienDo_Tasks: danh sách toàn bộ các đầu việc từ T01 đến T903 kèm trạng thái hoàn thành và đường dẫn nhật ký.

## 5. Phối hợp với các lập trình viên trí tuệ nhân tạo (AI Agents)

Trong dự án IACC Cloud, các trợ lý trí tuệ nhân tạo như Claude Code (Clau) và Antigravity (Anti) tham gia trực tiếp vào quá trình phát triển mã nguồn (AGENTS.md:7):

### 5.1. Định vị và nguyên tắc quản trị Agent AI
Mọi trợ lý AI khi làm việc trong kho chứa đều phải tuân thủ nghiêm ngặt toàn bộ quy định trong tệp `AGENTS.md` và luật chung của hệ thống (user_global).
Khi được giao việc qua hệ thống điều phối đa tác vụ Orca (có mã Task ID và Dispatch ID), trợ lý AI giữ vai trò công nhân kỹ thuật:
- Trợ lý AI tuyệt đối không tự ý thực hiện lệnh `git commit`, `git push` hoặc chuyển nhánh làm việc (user_global).
- Trợ lý AI chỉ tập trung hoàn thiện đúng yêu cầu kỹ thuật trong tài liệu đặc tả, kiểm tra sạch lỗi và báo cáo hoàn tất để người điều phối kiểm tra và commit mã nguồn (user_global).

### 5.2. Chuẩn mực viết tài liệu đặc tả công việc (Spec) giao cho Agent
Để trợ lý AI thực thi công việc đạt kết quả chuẩn xác nhất, tài liệu đặc tả công việc được cấu trúc gồm các mục rõ ràng:

| Mục trong tài liệu Spec | Nội dung yêu cầu cụ thể | Tiêu chuẩn chất lượng |
| :--- | :--- | :--- |
| Mục tiêu công việc | Nêu rõ sản phẩm đầu ra cần đạt được trong một câu súc tích. | Xác định cụ thể tệp cần tạo hoặc tính năng cần hoàn thiện. |
| Phạm vi chỉnh sửa | Liệt kê chính xác danh sách các tệp được phép tạo mới hoặc chỉnh sửa. | Nghiêm cấm sửa đổi các tệp ngoài danh mục được giao. |
| Ràng buộc kỹ thuật | Viện dẫn các quyết định thiết kế liên quan, quy tắc giao diện và các điều cấm kỵ. | Trích dẫn rõ mã quyết định QD hoặc mục trong KIEN-TRUC.md. |
| Tiêu chí nghiệm thu | Đặt ra các tiêu chuẩn đo lường định lượng cụ thể. | Số lượng từ tối thiểu, kết quả typecheck, kết quả kiem_van hết ĐỎ. |
| Ngữ cảnh mã nguồn | Cung cấp sẵn vị trí tệp, dòng lệnh và bẫy lỗi liên quan. | Trích xuất sẵn từ lệnh `soi_repo.py viec "<mô tả>"`. |

## 6. Danh mục các hành vi nghiêm cấm tuyệt đối (Strict Prohibitions)

Nhằm đảm bảo an toàn tuyệt đối cho kho chứa mã nguồn và môi trường vận hành, toàn bộ thành viên và các trợ lý AI phải tuân thủ các điều cấm sau (AGENTS.md:107):

| Hành vi bị nghiêm cấm | Lý do kỹ thuật và nguy cơ rủi ro |
| :--- | :--- |
| Cấm dùng lệnh `git push --force` hoặc xoá nhánh `main` | Làm ghi đè hoặc mất vĩnh viễn lịch sử đóng góp mã nguồn của các thành viên khác trên kho chứa (AGENTS.md:108). |
| Cấm dùng lệnh `git reset --hard` hoặc `git clean` | Gây mất toàn bộ các tệp mã nguồn đang sửa đổi dở dang của phiên làm việc khi chưa có sự đồng ý của người dùng (AGENTS.md:109). |
| Cấm sửa đổi thủ công tệp `src/app/features.json` | Tệp này được sinh tự động từ bảng tính Excel trên máy của Trum qua công cụ `xuat_tinh_nang.py`, việc sửa tay sẽ bị ghi đè hoàn toàn ở lần xuất tiếp theo (AGENTS.md:110). |
| Cấm tự ý sửa đổi thư mục luồng công việc `.github/workflows/` | Chứa các cấu hình robot triển khai tự động nhạy cảm, việc sửa đổi sai sót có thể làm gián đoạn toàn bộ hệ thống web trực tuyến (AGENTS.md:111). |
| Cấm thực hiện triển khai thủ công bằng lệnh `wrangler` | Robot GitHub Actions tự động đảm nhiệm việc đóng gói và triển khai sau mỗi lần đẩy mã, việc triển khai thủ công dễ gây sai lệch phiên bản (AGENTS.md:112). |
| Cấm lưu trữ hoặc in khoá bí mật, mã token, tệp mật khẩu | Tệp nhật ký phiên lưu trữ dưới dạng văn bản thuần, việc in khoá token sẽ làm lộ thông tin vĩnh viễn trên kho chứa (AGENTS.md:114, user_global). |
| Cấm lưu trữ tri thức vào bộ nhớ riêng của từng trợ lý AI | Mọi tri thức kỹ thuật, quy tắc kiến trúc và bẫy lỗi bắt buộc phải được ghi thành văn bản trong kho chứa để toàn bộ đội ngũ cùng kế thừa (AGENTS.md:115). |

## 7. Phân định trạng thái các quy trình của nhóm

Nhằm đảm bảo sự hiểu biết thống nhất giữa các thành viên, trạng thái các quy trình làm việc được phân định rõ ràng:

### 7.1. Đã có trong bản mẫu
Quy trình phối hợp 3 người và đẩy mã trực tiếp lên nhánh main qua bộ kiểm tra 5 bước nghiêm ngặt (AGENTS.md:17).
Hạ tầng tự động hoá đóng gói và triển khai liên tục qua GitHub Actions lên Cloudflare Pages (docs/TRIEN-KHAI.md:17).
Hệ thống quản lý công việc và tiến độ tập trung qua `docs/TIEN-DO.md` và `docs/luu-tru/TIEN-DO-xong.md` (AGENTS.md:23).
Quy trình ghi nhận bài học kinh nghiệm và phòng tránh sự cố qua `docs/BAY.md` và `docs/QUYET-DINH.md` (AGENTS.md:59).
Bộ công cụ dòng lệnh hoàn chỉnh gồm `ban_do.py`, `kiem_tra.py`, `kiem_van.py` và `xuat_bao_cao_he_thong.py` (AGENTS.md:35).

### 7.2. Dự kiến / chưa làm
Repo chưa có kế hoạch riêng cho chủ đề này ngoài phần backend (file 09, mục 2). Tính năng chưa làm xem file 12 (Tiến độ việc), dòng trạng thái `Chưa làm`, `Chờ`.

### 7.3. Chưa chốt
Repo không ghi việc nào đang chờ chốt trong chủ đề này. Việc đang mở xem file 12 (Tiến độ việc). Quyết định đang soạn xem các mục có chữ `(đang soạn)` trong file 07.

