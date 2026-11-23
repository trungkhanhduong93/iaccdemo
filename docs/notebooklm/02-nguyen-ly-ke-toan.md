# 02. Nguyên lý kế toán — IACC Cloud (iaccdemo)
Bản xuất từ repo iaccdemo commit 98d2bb3, ngày 23/11/2026.

Phạm vi tài liệu: File này giải thích các nguyên lý kế toán áp dụng trong iaccdemo. Nội dung gồm chế độ kế toán, hệ thống tài khoản, cơ chế ghi sổ, kỳ kế toán, khoá sổ, kết chuyển cuối kỳ, giá vốn và giá thành. Chi tiết về phân hệ và màn hình nằm ở file 03. Đặc tả từng loại chứng từ và định khoản Nợ/Có nằm ở file 04. Biểu mẫu báo cáo tài chính, sổ sách và mẫu in nằm ở file 05.

Lưu ý quan trọng: Toàn bộ định khoản kế toán trong bản mẫu hiện tại nằm ở dữ liệu giả (cấu hình mảng `noCo` của từng màn hình trong `src/modules/*/index.ts`). Đây là các định khoản mẫu minh hoạ luồng nghiệp vụ F&B, chưa phải engine hạch toán thật do hệ thống chưa có backend (docs/KIEN-TRUC.md:30).


## 1. Các chế độ kế toán pháp định trong hệ thống

Hệ thống IACC Cloud thiết kế để đáp ứng 4 chế độ kế toán hiện hành của Bộ Tài chính Việt Nam (src/app/che-do.ts:4-23). Gói dịch vụ quyết định các tính năng được mở; chế độ kế toán quyết định mẫu sổ sách, báo cáo tài chính, chứng từ và danh mục tài khoản (QD31).

### Chế độ kế toán hộ kinh doanh và cá nhân kinh doanh (TT152) — Đã có trong bản mẫu
- Số hiệu văn bản: Thông tư 152/2025/TT-BTC ban hành ngày 31/12/2025 (src/app/che-do.ts:19).
- Tên gọi chính thức: Chế độ kế toán hộ kinh doanh, cá nhân kinh doanh.
- Hậu tố ký hiệu mẫu biểu: `-HKD`.
- Kiểu ghi sổ: Không ghi sổ kép Nợ/Có (`kieuGhiSo: 'khong'`, src/app/che-do.ts:19).
- Đối tượng áp dụng: Các hộ kinh doanh cá thể, quán ăn, nhà hàng quy mô nhỏ và vừa, quán cà phê cá nhân (src/app/plan.ts:149).
- Trạng thái pháp lý trong bản mẫu: Ký hiệu mẫu đang chờ kế toán trưởng rà soát đối chiếu văn bản gốc (src/app/che-do.ts:19, T04).

### Chế độ kế toán doanh nghiệp siêu nhỏ (TT58) — Đã có trong bản mẫu
- Số hiệu văn bản: Thông tư 58/2026/TT-BTC ban hành ngày 25/05/2026 (src/app/che-do.ts:20).
- Tên gọi chính thức: Chế độ kế toán doanh nghiệp siêu nhỏ.
- Hậu tố ký hiệu mẫu biểu: `-DNSN`.
- Kiểu ghi sổ: Ghi theo mẫu sổ chuyên dụng, không hạch toán Nợ/Có phức tạp (`kieuGhiSo: 'so'`, src/app/che-do.ts:20).
- Đối tượng áp dụng: Doanh nghiệp siêu nhỏ có từ 1 điểm bán, doanh thu và lao động dưới ngưỡng doanh nghiệp nhỏ (src/app/plan.ts:150).
- Trạng thái pháp lý trong bản mẫu: Ký hiệu mẫu đang chờ kế toán trưởng rà soát đối chiếu văn bản gốc (src/app/che-do.ts:20, T04).

### Chế độ kế toán doanh nghiệp nhỏ và vừa (TT133) — Đã có trong bản mẫu
- Số hiệu văn bản: Thông tư 133/2016/TT-BTC ban hành ngày 26/08/2016 (src/app/che-do.ts:21).
- Tên gọi chính thức: Chế độ kế toán doanh nghiệp nhỏ và vừa.
- Hậu tố ký hiệu mẫu biểu: `-DNN`.
- Kiểu ghi sổ: Hạch toán kép Nợ/Có (`kieuGhiSo: 'noco'`, src/app/che-do.ts:21).
- Đối tượng áp dụng: Các doanh nghiệp vừa và nhỏ ngành F&B, chuỗi nhà hàng đang phát triển (src/app/plan.ts:151).
- Trạng thái pháp lý trong bản mẫu: Ký hiệu mẫu đang chờ kế toán trưởng rà soát đối chiếu văn bản gốc (src/app/che-do.ts:21, T04).

### Chế độ kế toán doanh nghiệp tiêu chuẩn (TT99) — Đã có trong bản mẫu
- Số hiệu văn bản: Thông tư 99/2025/TT-BTC (src/app/che-do.ts:22).
- Tên gọi chính thức: Chế độ kế toán doanh nghiệp (thay thế Thông tư 200/2014/TT-BTC).
- Hậu tố ký hiệu mẫu biểu: `-DN`.
- Kiểu ghi sổ: Hạch toán kép Nợ/Có đầy đủ (`kieuGhiSo: 'noco'`, src/app/che-do.ts:22).
- Đối tượng áp dụng: Doanh nghiệp quy mô lớn, chuỗi F&B từ 10 điểm bán trở lên, công ty đại chúng hoặc chuỗi nhượng quyền lớn (src/app/plan.ts:151).
- Trạng thái pháp lý trong bản mẫu: Khung tài khoản dựng theo quy ước kế thừa từ Thông tư 200, chờ kế toán trưởng duyệt (src/modules/danh-muc/he-thong-tk.ts:2-3, T04).


## 2. Phân bổ chế độ kế toán theo gói thuê bao

Hệ thống IACC Cloud quản lý 3 gói thuê bao chính thức: Standard (mã `S`), Plus (mã `PL`) và Pro (mã `PR`). Gói Free trước đây đã được bãi bỏ hoàn toàn và sáp nhập tính năng vào gói Standard (QD80, src/app/plan.ts:5-8).

### Ma trận gói thuê bao và chế độ kế toán tương ứng
Quy định cặp gói và chế độ hợp lệ được chốt bởi Trum và PhuongXT (src/app/che-do.ts:31-36, QD31, T138):

| Mã gói | Tên gói | Chế độ mặc định | Chế độ hợp lệ được chọn | Đối tượng khách hàng mục tiêu | Kiểu ghi sổ thực tế |
|---|---|---|---|---|---|
| `S` | Standard | TT152 | TT152 (HKD), TT58 (DN siêu nhỏ tính thuế theo % doanh thu) | Hộ kinh doanh, quán ăn nhỏ, không giới hạn cửa hàng | Không dùng Nợ/Có (lưu phiếu trực tiếp, không ghi sổ) |
| `PL` | Plus | TT58 | TT58, TT152 | Doanh nghiệp siêu nhỏ 1 điểm bán, chuỗi nhỏ không dùng tài khoản | Không ghi sổ, lưu phiếu là xong (QD81, T825) |
| `PR` | Pro | TT99 | TT99, TT133 | Doanh nghiệp vừa và lớn, chuỗi F&B trên 10 điểm bán | Ghi sổ kép Nợ/Có đầy đủ (có trạng thái ghi sổ) |

### Quy tắc chuẩn hoá chế độ khi đổi gói thuê bao — Đã có trong bản mẫu
- Khi người dùng đổi gói thuê bao trong phần Cấu hình kế toán hoặc Khởi tạo đơn vị, hàm `chuanHoaCheDo` sẽ kiểm tra tính tương thích (src/app/che-do.ts:39-41).
- Nếu chế độ kế toán hiện tại không nằm trong danh sách hợp lệ của gói mới, hệ thống tự động đưa về chế độ mặc định của gói đó (src/app/che-do.ts:40).
- Doanh nghiệp dùng gói Standard bị cố định chế độ TT58 theo trường hợp 1 (tính thuế GTGT và TNDN theo tỷ lệ % doanh thu), chỉ sử dụng sổ doanh thu S1-DNSN và không được chọn chế độ khác (src/app/che-do.ts:35-37, T632).


## 3. Cơ chế không dùng Nợ/Có cho hộ kinh doanh và doanh nghiệp siêu nhỏ

IACC Cloud giải quyết rào cản lớn nhất của kế toán truyền thống đối với chủ hộ kinh doanh và quản lý quán ăn: loại bỏ hoàn toàn khái niệm Nợ và Có trong giao diện vận hành gói Standard (QD81, src/app/plan.ts:238).

### Sự khác biệt giữa các kiểu ghi sổ trong hệ thống — Đã có trong bản mẫu
Hệ thống phân định rõ 3 trạng thái ghi sổ qua trường `kieuGhiSo` trong khai báo chế độ (src/app/che-do.ts:14), kết hợp với quy tắc gói tại `kieuGhiSoDv` (src/app/plan.ts:238, QD81):
1. Kiểu `khong` (Áp dụng cho TT152 ở gói Standard và Plus):
   - Không có tài khoản kế toán, không có khái niệm Nợ/Có (docs/TONG-KET-LOGIC-STANDARD.md:15).
   - Không có khái niệm định khoản, không có bảng phân bổ bút toán phức tạp.
   - Giao diện chứng từ ẩn toàn bộ cột Tài khoản Nợ, Tài khoản Có, Khoản mục chi phí và Mã công việc.
   - Không có nút "Ghi sổ" hay "Bỏ ghi sổ"; chứng từ khi lưu hợp lệ sẽ tự động cập nhật số dư tức thời vào các sổ quỹ, sổ mua bán và báo cáo (docs/TONG-KET-LOGIC-STANDARD.md:15).
2. Kiểu `so` (Áp dụng cho TT58 ở gói Plus hoặc doanh nghiệp gói Standard):
   - Chứng từ được phân loại trực tiếp vào các dòng sổ chuyên dụng như Sổ doanh thu (S1-DNSN), Sổ chi phí (S2b-DNSN), Sổ tiền (S2d-DNSN).
   - Bỏ qua các tài khoản trung gian như 154, 642, 911 (src/app/che-do.ts:20).
   - Theo quyết định QD81 và sửa đổi T825, chỉ gói Pro mới có chức năng ghi sổ. Gói Plus và Standard dùng TT58 đều không ghi sổ (`kieuGhiSoDv` trả về `'khong'`), lưu phiếu là hoàn tất.
3. Kiểu `noco` (Áp dụng cho TT133 và TT99 ở gói Pro):
   - Hạch toán kép chuẩn mực theo nguyên lý Nợ = Có.
   - Bắt buộc kiểm tra cân đối số phát sinh và đối ứng tài khoản hợp lệ trước khi cho phép ghi sổ (src/modules/tong-hop/so-cai.ts:39-85).

### Cơ chế ghi nhận nghiệp vụ không dùng Nợ/Có ở gói Standard — Đã có trong bản mẫu
- Nghiệp vụ Thu tiền: Lập qua loại phiếu Thu tiền mặt (`PT`) hoặc Thu ngân hàng (`BC`). Người dùng chỉ chọn Lý do thu và Đối tượng nộp tiền. Hệ thống tự động ghi tăng số dư Quỹ tiền mặt hoặc Tài khoản ngân hàng tương ứng (src/modules/tien/index.ts:34-40).
- Nghiệp vụ Chi tiền: Lập qua loại phiếu Chi tiền mặt (`PC`) hoặc Uỷ nhiệm chi (`UNC`). Người dùng chọn Lý do chi và Đối tượng nhận tiền. Nếu lý do chi mang tính chất chi phí hoạt động, phiếu tự động đưa số liệu vào Báo cáo Chi phí hoạt động của tháng ghi nhận (src/modules/home/ChiPhiThang.tsx, docs/TONG-KET-LOGIC-STANDARD.md:102).
- Nghiệp vụ Chuyển tiền giữa các quỹ: Lập phiếu Chuyển quỹ (`CQ`). Phiếu chỉ làm tăng quỹ đích và giảm quỹ nguồn, không tác động vào doanh thu, chi phí hay lãi lỗ của đơn vị (docs/TONG-KET-LOGIC-STANDARD.md:161).
- Nghiệp vụ Mua hàng: Phiếu mua hàng (`MH`) ghi nhận giá trị nhập kho nguyên vật liệu và công nợ nhà cung cấp. Vì hộ kinh doanh không được khấu trừ thuế GTGT đầu vào, toàn bộ tiền thuế được cộng thẳng vào giá trị hàng mua (docs/TONG-KET-LOGIC-STANDARD.md:188).
- Nghiệp vụ Bán hàng: Nhận tự động từ hệ thống máy bán hàng FABi POS (`3.1.1`). Doanh thu ghi nhận theo số thực thu sau khi đã trừ khuyến mãi và chiết khấu (docs/TONG-KET-LOGIC-STANDARD.md:176-180).

### Cơ chế giảm thuế GTGT theo Nghị quyết đặc thù cho ngành F&B — Đã có trong bản mẫu
- Đối với đơn vị nộp thuế GTGT theo tỷ lệ % trên doanh thu (gói Standard), trên chứng từ bán hàng không tách riêng tiền thuế GTGT đầu ra (docs/TONG-KET-LOGIC-STANDARD.md:16).
- Hệ thống tự động tạo dòng Giảm thuế GTGT theo công thức: Giảm thuế GTGT = Doanh thu tính thuế × Tỷ lệ ngành nghề × 20% (src/modules/ban-hang/giam-thue.ts:11-30).
- Tiền khách thanh toán được phân bổ lại theo tổng thanh toán thực tế = Doanh thu thuần − Tiền giảm thuế (docs/TONG-KET-LOGIC-STANDARD.md:179).


## 4. Hệ thống tài khoản kế toán

Hệ thống danh mục tài khoản kế toán đầy đủ được kích hoạt khi đơn vị sử dụng gói Pro với chế độ TT133 hoặc TT99 (src/modules/danh-muc/HeThongTaiKhoan.tsx:1-150, src/modules/danh-muc/he-thong-tk.ts).

### Cấu trúc phân loại tài khoản theo chữ số đầu — Đã có trong bản mẫu
Hệ thống tự động nhận diện bản chất tài khoản dựa trên ký tự số đầu tiên của số hiệu tài khoản (src/modules/danh-muc/HeThongTaiKhoan.tsx:36-40):
- Đầu số 1: Tài sản ngắn hạn (Tiền mặt, tiền gửi, phải thu khách hàng, nguyên vật liệu, hàng hoá).
- Đầu số 2: Tài sản dài hạn (Tài sản cố định hữu hình, vô hình, hao mòn tài sản, chi phí trả trước dài hạn).
- Đầu số 3: Nợ phải trả (Phải trả người bán, thuế và các khoản nộp nhà nước, phải trả người lao động).
- Đầu số 4: Vốn chủ sở hữu (Vốn đầu tư của chủ sở hữu, lợi nhuận sau thuế chưa phân phối).
- Đầu số 5: Doanh thu (Doanh thu bán hàng và cung cấp dịch vụ, doanh thu hoạt động tài chính).
- Đầu số 6: Chi phí sản xuất kinh doanh (Chi phí nguyên vật liệu trực tiếp, chi phí nhân công, chi phí sản xuất chung, giá vốn hàng bán, chi phí bán hàng, chi phí quản lý doanh nghiệp).
- Đầu số 7: Thu nhập khác (Thanh lý tài sản, thu tiền phạt vi phạm hợp đồng).
- Đầu số 8: Chi phí khác (Giá trị còn lại của tài sản thanh lý, tiền bị phạt).
- Đầu số 9: Xác định kết quả kinh doanh (Tài khoản tập hợp doanh thu và chi phí để kết chuyển lãi lỗ).
- Đầu số 0: Tài khoản ngoài bảng (Theo dõi ngoại tệ, tài sản nhận giữ hộ, tài sản thuê ngoài).

### Tính chất số dư tài khoản kế toán — Đã có trong bản mẫu
Hệ thống quy định 4 loại tính chất số dư chuẩn (`TinhChatTk`, src/modules/danh-muc/he-thong-tk.ts:8):
1. `Dư Nợ`: Mặc định cho toàn bộ tài khoản thuộc Loại 1 và Loại 2 (trừ các tài khoản điều chỉnh giảm như 214, 229 mang tính chất Dư Có).
2. `Dư Có`: Mặc định cho toàn bộ tài khoản thuộc Loại 3 và Loại 4 (trừ tài khoản điều chỉnh như 419, 421 khi lỗ).
3. `Lưỡng tính`: Tài khoản có thể vừa có số dư bên Nợ, vừa có số dư bên Có trên các đối tượng chi tiết khác nhau. Ví dụ: tài khoản 131 (Phải thu của khách hàng), tài khoản 331 (Phải trả cho người bán), tài khoản 138 (Phải thu khác), tài khoản 338 (Phải trả khác) (src/modules/danh-muc/he-thong-tk.ts:27-37).
4. `Không số dư`: Toàn bộ tài khoản thuộc Loại 5, 6, 7, 8 và 9. Toàn bộ số phát sinh trong kỳ phải được kết chuyển hết vào cuối kỳ, số dư cuối kỳ luôn bằng 0 (src/modules/danh-muc/he-thong-tk.ts:4-5).

### Danh mục tài khoản cấp 1 và cấp 2 tiêu biểu cho ngành F&B (src/modules/danh-muc/he-thong-tk.ts:14-120)

| Số hiệu TK | Tên tài khoản | Cấp | Tính chất | Thuộc tính theo dõi chi tiết bắt buộc | Ghi chú áp dụng trong F&B |
|---|---|---|---|---|---|
| `111` | Tiền mặt | 1 | Dư Nợ | Quỹ tiền | Tiền mặt tại các cửa hàng |
| `1111` | Tiền Việt Nam | 2 | Dư Nợ | Quỹ tiền | Quỹ tiền mặt thu ngân từng ca |
| `1112` | Ngoại tệ | 2 | Dư Nợ | Quỹ tiền, Ngoại tệ | Khách du lịch thanh toán ngoại tệ |
| `112` | Tiền gửi ngân hàng | 1 | Dư Nợ | Tài khoản ngân hàng | Tiền gửi các ngân hàng thương mại |
| `1121` | Tiền Việt Nam | 2 | Dư Nợ | Tài khoản ngân hàng | Tài khoản nhận tiền thanh toán QR, POS |
| `131` | Phải thu của khách hàng | 1 | Lưỡng tính | Đối tượng, Theo dõi thanh toán | Khách đặt tiệc, công nợ suất ăn công nghiệp |
| `1331` | Thuế GTGT được khấu trừ của HHDV | 2 | Dư Nợ | Thuế GTGT | Thuế GTGT đầu vào từ hoá đơn mua hàng |
| `1332` | Thuế GTGT được khấu trừ của TSCĐ | 2 | Dư Nợ | Thuế GTGT | Thuế GTGT đầu vào mua sắm máy móc bếp |
| `1381` | Tài sản thiếu chờ xử lý | 2 | Lưỡng tính | Đối tượng, Hàng hoá | Hao hụt nguyên vật liệu khi kiểm kê kho |
| `141` | Tạm ứng | 1 | Dư Nợ | Đối tượng | Nhân viên tạm ứng đi chợ mua thực phẩm tươi |
| `152` | Nguyên liệu, vật liệu | 1 | Dư Nợ | Vật tư hàng hoá, Số lượng, Kho | Thịt, rau, gia vị, đồ hộp, bao bì |
| `153` | Công cụ, dụng cụ | 1 | Dư Nợ | Vật tư hàng hoá, Số lượng, Kho | Bát đĩa, ly tách, xoong nồi nhỏ trong kho |
| `154` | Chi phí sản xuất, kinh doanh dở dang | 1 | Dư Nợ | Công việc, Thành phẩm | Tập hợp chi phí sơ chế và chế biến |
| `155` | Thành phẩm | 1 | Dư Nợ | Vật tư hàng hoá, Số lượng, Kho | Bán thành phẩm lưu trữ: nước sốt, cốt phở |
| `156` | Hàng hoá | 1 | Dư Nợ | Vật tư hàng hoá, Số lượng, Kho | Bia lon, nước ngọt đóng chai, kem bán liền |
| `211` | Tài sản cố định hữu hình | 1 | Dư Nợ | Danh mục TSCĐ | Tủ đông công nghiệp, hệ thống hút mùi bếp |
| `2141` | Hao mòn TSCĐ hữu hình | 2 | Dư Có | Danh mục TSCĐ | Giá trị trích khấu hao tích luỹ của máy móc |
| `242` | Chi phí trả trước | 1 | Dư Nợ | Thẻ chi phí phân bổ | Tiền thuê mặt bằng trả trước 6 tháng, 1 năm |
| `331` | Phải trả cho người bán | 1 | Lưỡng tính | Đối tượng, Theo dõi thanh toán | Công nợ nhà cung cấp thịt, rau, đồ uống |
| `33311` | Thuế GTGT đầu ra | 2 | Dư Có | Thuế GTGT | Thuế GTGT xuất hoá đơn điện tử cho khách |
| `334` | Phải trả người lao động | 1 | Dư Có | Đối tượng (Nhân viên) | Tiền lương bếp, phục vụ, quản lý ca |
| `3381` | Tài sản thừa chờ xử lý | 2 | Lưỡng tính | Hàng hoá | Thừa nguyên vật liệu khi kiểm kê kho |
| `4111` | Vốn góp của chủ sở hữu | 2 | Dư Có | Không | Vốn chủ quán hoặc cổ đông sáng lập góp |
| `4212` | Lợi nhuận chưa phân phối năm nay | 2 | Lưỡng tính | Không | Lãi hoặc lỗ luỹ kế của năm tài chính |
| `5111` | Doanh thu bán hàng hoá | 2 | Không số dư | Nhóm món, Kênh bán | Doanh thu đồ uống đóng lon, hàng mua đi bán lại |
| `5112` | Doanh thu bán thành phẩm | 2 | Không số dư | Nhóm món, Kênh bán | Doanh thu món ăn tự chế biến tại quán |
| `632` | Giá vốn hàng bán | 1 | Không số dư | Khoản mục, Món ăn | Chi phí nguyên vật liệu xuất bán trong kỳ |
| `6421` | Chi phí bán hàng | 2 | Không số dư | Khoản mục chi phí | Chi phí bao bì mang về, phí hoa hồng giao hàng |
| `6422` | Chi phí quản lý doanh nghiệp | 2 | Không số dư | Khoản mục chi phí | Điện nước, mặt bằng, văn phòng phẩm, quản lý |
| `711` | Thu nhập khác | 1 | Không số dư | Khoản mục | Thu nhập từ bán phế liệu, thanh lý bàn ghế cũ |
| `811` | Chi phí khác | 1 | Không số dư | Khoản mục | Giá trị còn lại của thiết bị bếp bị hỏng vứt bỏ |
| `911` | Xác định kết quả kinh doanh | 1 | Không số dư | Không | Tài khoản kết chuyển xác định lãi lỗ cuối kỳ |

### Quy tắc theo dõi chi tiết đa chiều — Đã có trong bản mẫu
Hàm `dsTheoDoiChiTiet` trong code tự động kích hoạt các chiều quản trị bổ sung khi chọn tài khoản (src/modules/danh-muc/HeThongTaiKhoan.tsx:22-33):
- Bắt đầu bằng `111`: Kích hoạt quản trị theo Quỹ tiền mặt.
- Bắt đầu bằng `112`: Kích hoạt quản trị theo Tài khoản ngân hàng.
- Bắt đầu bằng `131`, `331`: Kích hoạt quản trị theo Đối tượng công nợ và Chi tiết hoá đơn thanh toán.
- Bắt đầu bằng `152`, `153`, `155`, `156`: Kích hoạt quản trị theo Vật tư hàng hoá, Kho hàng và Số lượng tồn kho.
- Bắt đầu bằng `154`, `631`: Kích hoạt quản trị theo Công việc sản xuất và Thành phẩm món ăn.
- Bắt đầu bằng `641`, `642`: Kích hoạt quản trị theo Khoản mục chi phí (Điện, Nước, Mặt bằng, Nhân công, Khấu hao).


## 5. Kỳ kế toán, quy trình kiểm tra cuối kỳ và khoá sổ

### Kỳ kế toán và nguyên tắc ngày chứng từ — Đã có trong bản mẫu
- Đơn vị kế toán được chọn ngày bắt đầu năm tài chính là một trong các ngày: 01/01, 01/04, 01/07 hoặc 01/10 (docs/TONG-KET-LOGIC-STANDARD.md:77).
- Ngày chứng từ mới tạo không được phép trước ngày đầu năm tài chính đã khai báo của đơn vị (src/ui/generic/ChungTuForm.tsx:402).
- Tháng làm việc chọn trên thanh tiêu đề Trang chủ trở thành kỳ làm việc mặc định cho mọi danh sách chứng từ, sổ sách và báo cáo phân bổ trong phiên làm việc (docs/TONG-KET-LOGIC-STANDARD.md:18).

### Bộ kiểm tra số liệu cuối kỳ gồm 7 tiêu chuẩn — Đã có trong bản mẫu
Màn hình Kiểm tra cuối kỳ (`10.1.4`, src/modules/tong-hop/CuoiKy.tsx:13-42) thực hiện quét tự động dữ liệu trước khi cho phép khoá sổ:
1. Doanh thu POS FABi khớp sổ: Quét dữ liệu 30/30 ngày bán hàng của tất cả cửa hàng, đảm bảo không ngày nào bị sót hoặc lệch số (src/modules/tong-hop/CuoiKy.tsx:14).
2. Hoá đơn bán ra khớp doanh thu: Đối soát 100% doanh thu bán ra với hoá đơn điện tử tổng hợp đã ký phát hành, chênh lệch bằng 0 đồng (src/modules/tong-hop/CuoiKy.tsx:15).
3. Kiểm tra tồn kho âm: Cảnh báo ngay khi có mặt hàng bị âm kho tại bất kỳ kho bếp hay kho quầy bar nào để kế toán kịp thời nhập bổ sung phiếu mua hàng (src/modules/tong-hop/CuoiKy.tsx:16).
4. Kiểm tra chứng từ chưa ghi sổ: Quét toàn bộ chứng từ phát sinh trong kỳ, yêu cầu ghi sổ 100% chứng từ hợp lệ (src/modules/tong-hop/CuoiKy.tsx:17).
5. Hoá đơn đầu vào chưa hạch toán: Phát hiện các hoá đơn nhà cung cấp gửi về trên cổng thuế nhưng kế toán chưa lập chứng từ mua hàng (src/modules/tong-hop/CuoiKy.tsx:18).
6. Cân đối kế toán (Tài sản = Nguồn vốn): Xác nhận Bảng cân đối kế toán hoặc Báo cáo tình hình tài chính đạt trạng thái cân tuyệt đối (src/modules/tong-hop/CuoiKy.tsx:19).
7. Quỹ tiền mặt không âm: Kiểm tra dòng tiền luỹ kế theo từng ngày của toàn bộ các quỹ tiền mặt, ngăn chặn tình trạng xuất âm quỹ (src/modules/tong-hop/CuoiKy.tsx:20).

### Quy trình các bước khoá sổ tháng — Đã có trong bản mẫu
Theo quy trình chuẩn tại màn hình Khoá sổ (`10.1.6`, src/modules/tong-hop/CuoiKy.tsx:48-55), hệ thống yêu cầu kế toán thực hiện lần lượt 6 bước:
1. Đồng bộ đầy đủ dữ liệu bán hàng từ POS FABi trong tháng.
2. Đối soát doanh thu thực tế giữa POS và sổ kế toán.
3. Chạy tính giá vốn cuối kỳ (cho nguyên vật liệu xuất bán).
4. Thực hiện phân bổ công cụ dụng cụ và chi phí trả trước.
5. Chạy tiện ích kiểm tra số liệu cuối kỳ (xử lý dứt điểm các mục Cảnh báo và Lỗi).
6. Chạy kết chuyển lãi lỗ cuối kỳ sang tài khoản 911 và 421.

### Cơ chế khoá sổ theo từng gói dịch vụ — Đã có trong bản mẫu
- Gói Standard và Plus: Tính năng khoá sổ đặt tại phân hệ Hệ thống (`/app/he-thong/khoa-so`, src/modules/tong-hop/KhoaSoStandard.tsx, QD20). Khoá sổ cho phép chốt độc lập theo từng tháng và theo từng cửa hàng. Cửa hàng nào đã khoá sổ thì toàn bộ phiếu thu, chi, mua hàng, xuất kho của tháng đó bị vô hiệu hoá thao tác Sửa và Xoá (docs/TONG-KET-LOGIC-STANDARD.md:20).
- Gói Pro: Khoá sổ đặt tại phân hệ Kế toán tổng hợp (`10.1.6`, src/modules/tong-hop/CuoiKy.tsx:44-83). Khoá sổ áp dụng chung cho toàn bộ đơn vị kế toán. Khi phát hiện sai sót của kỳ đã khoá, người dùng có quyền quản trị phải mở khoá sổ kèm lý do giải trình; hệ thống ghi nhận lịch sử mở khoá vào nhật ký hệ thống (src/modules/tong-hop/CuoiKy.tsx:75-79).


## 6. Quy tắc kết chuyển số dư và kết chuyển cuối kỳ

### Các bút toán kết chuyển doanh thu và chi phí sang tài khoản 911 — Đã có trong bản mẫu
Tại màn hình Kết chuyển (`10.1.5`, src/modules/tong-hop/index.ts:24-25), hệ thống tự động sinh các bút toán kết chuyển khép kín cuối mỗi tháng hoặc mỗi quý:
1. Kết chuyển doanh thu bán hàng thuần:
   - Ghi Nợ TK 511 (5111, 5112) / Ghi Có TK 911 (Xác định kết quả kinh doanh).
2. Kết chuyển giá vốn hàng bán:
   - Ghi Nợ TK 911 / Ghi Có TK 632 (Giá vốn hàng bán).
3. Kết chuyển chi phí bán hàng và chi phí quản lý:
   - Ghi Nợ TK 911 / Ghi Có TK 6421 (Chi phí bán hàng).
   - Ghi Nợ TK 911 / Ghi Có TK 6422 (Chi phí quản lý doanh nghiệp).
4. Kết chuyển doanh thu hoạt động tài chính và thu nhập khác:
   - Ghi Nợ TK 515 / Ghi Có TK 911.
   - Ghi Nợ TK 711 / Ghi Có TK 911.
5. Kết chuyển chi phí tài chính và chi phí khác:
   - Ghi Nợ TK 911 / Ghi Có TK 635.
   - Ghi Nợ TK 911 / Ghi Có TK 811.
6. Kết chuyển kết quả kinh doanh cuối cùng (Lãi hoặc Lỗ):
   - Nếu đơn vị có Lãi (Doanh thu > Chi phí): Ghi Nợ TK 911 / Ghi Có TK 4212 (Lợi nhuận sau thuế chưa phân phối năm nay).
   - Nếu đơn vị bị Lỗ (Chi phí > Doanh thu): Ghi Nợ TK 4212 / Ghi Có TK 911.

### Cơ chế kết chuyển số dư sang năm tài chính mới (`10.1.9`) — Dự kiến / chưa làm
- Chức năng Kết chuyển số dư sang năm mới (`10.1.9`, src/modules/tong-hop/index.ts:29) cho phép kết chuyển số dư cuối kỳ của các tài khoản tài sản, nợ phải trả và vốn chủ sở hữu sang số dư đầu kỳ của năm sau.
- Chuyển toàn bộ số dư tài khoản 4212 (Lợi nhuận năm nay) sang tài khoản 4211 (Lợi nhuận năm trước).
- Trong bản mẫu hiện tại, màn hình hiển thị công cụ mẫu với nút bấm "Kết chuyển số dư sang năm 2027", logic xử lý dữ liệu thật đang chờ backend hoàn thiện.


## 7. Phương pháp tính giá vốn

### Phương pháp tính giá vốn bình quân gia quyền cuối kỳ (Gói Plus và Pro) — Đã có trong bản mẫu
- Áp dụng tại màn hình Tính giá vốn (`5.1.7`, src/modules/kho/index.ts:13, src/modules/kho/tinh-gia-von/giaVonBq.ts:1-64).
- Công thức tính đơn giá vốn bình quân tháng:
  $$\text{Đơn giá bình quân} = \frac{\text{Giá trị tồn đầu kỳ} + \text{Giá trị nhập trong kỳ}}{\text{Số lượng tồn đầu kỳ} + \text{Số lượng nhập trong kỳ}}$$
- Cơ chế cập nhật: Khi kế toán bấm "Tính giá vốn" cho tháng `t/n`, hệ thống lưu kết quả vào khoá `gia-von-bq` (src/modules/kho/tinh-gia-von/giaVonBq.ts:35-41).
- Tự động áp giá: Toàn bộ chứng từ bán hàng (gõ tay hoặc xuất bán POS) và phiếu xuất kho trong tháng đó sẽ tự động được điền Đơn giá vốn và Tiền vốn (src/modules/kho/tinh-gia-von/giaVonBq.ts:1-3, 44-51).
- Tháng nào chưa chạy tính giá vốn thì hai cột Đơn giá vốn và Tiền vốn trên phiếu bán được để trống (src/modules/kho/tinh-gia-von/giaVonBq.ts:3).

### Ba phương pháp xác định chi phí nguyên vật liệu cho gói Standard — Đã có trong bản mẫu
Hộ kinh doanh gói Standard không chạy tính giá vốn bình quân từng phiếu. Thay vào đó, mỗi cửa hàng được chọn 1 trong 3 phương pháp tính chi phí nguyên vật liệu tại Danh mục Cửa hàng (src/modules/danh-muc/DanhMucCuaHang.tsx, docs/TONG-KET-LOGIC-STANDARD.md:105-113):

1. Phương pháp 1: Theo phần mềm kho iPOS Inventory (Mặc định):
   - Công thức: Chi phí NVL = (Giá thành định lượng của món × Số lượng món bán trên POS) + NVL tiêu hao do hao hụt và xử lý nội bộ.
   - Trong đó: NVL tiêu hao = Xuất huỷ + Xuất điều chỉnh kiểm kê − Nhập điều chỉnh kiểm kê (docs/TONG-KET-LOGIC-STANDARD.md:109).
2. Phương pháp 2: Theo đơn giá thành nhập tay:
   - Công thức: Chi phí NVL = Tổng (Số lượng từng món bán × Giá thành do người dùng tự khai báo cho món đó).
   - Món ăn nào chưa được nhập giá thành thì hệ thống tính giá vốn bằng 0 (docs/TONG-KET-LOGIC-STANDARD.md:110).
3. Phương pháp 3: Theo phiếu mua hàng thực tế:
   - Công thức: Chi phí NVL = Tổng tiền các phiếu mua hàng nguyên vật liệu (`4.1.1`) phát sinh trong tháng của cửa hàng, bao gồm cả thuế GTGT (docs/TONG-KET-LOGIC-STANDARD.md:111).

Quy tắc chuyển đổi: Đổi cách tính chi phí NVL chỉ có hiệu lực từ tháng đầu tiên chưa khoá sổ trở đi; các tháng đã khoá sổ bắt buộc giữ nguyên cách tính cũ (docs/TONG-KET-LOGIC-STANDARD.md:113).

### Cảnh báo kiểm kê định kỳ cuối tháng và chốt theo tồn hệ thống (QD115) — Đã có trong bản mẫu
- Phiếu kiểm kê kho (`5.1.10`, prefix `KK`, src/modules/kho/index.ts:29) chỉ nhập số lượng kiểm kê thực tế, không nhập số tiền (docs/TONG-KET-LOGIC-STANDARD.md:128).
- Nếu ô Tồn thực tế để trống, hệ thống tự động gán bằng Tồn hệ thống (docs/TONG-KET-LOGIC-STANDARD.md:196).
- Khi lưu phiếu kiểm kê có chênh lệch, hệ thống tự động sinh 2 phiếu đối ứng (src/modules/kho/index.ts:31-43, docs/TONG-KET-LOGIC-STANDARD.md:197):
  + Hàng thiếu: Tự sinh phiếu Xuất điều chỉnh (mã `XDC`, định khoản Nợ TK 1381 / Có TK 152).
  + Hàng thừa: Tự sinh phiếu Nhập điều chỉnh (mã `NDC`, định khoản Nợ TK 152 / Có TK 3381).
- Phiếu kiểm kê đã sinh điều chỉnh không được sửa. Nếu xoá phiếu kiểm kê thì hệ thống tự động xoá luôn các phiếu điều chỉnh đã sinh kèm (docs/TONG-KET-LOGIC-STANDARD.md:198).


## 8. Phương pháp tập hợp chi phí và tính giá thành F&B

### Mô hình tính giá thành nhiều cấp trong ngành nhà hàng (Gói Pro) — Đã có trong bản mẫu
Phân hệ Chi phí, giá thành (`mod 8`, src/modules/gia-thanh/index.ts:1-52) thiết kế riêng cho đặc thù chế biến ẩm thực qua 3 cấp:
1. Cấp 1 (Nguyên liệu sơ chế):
   - Xuất nguyên liệu thô (thịt tảng, tôm nguyên vỏ, rau củ thô) để làm sạch, pha lóc, tẩm ướp.
   - Chứng từ: Phiếu xuất sơ chế (`XSC`, src/modules/kho/san-xuat.ts:24) và Phiếu nhập sơ chế (`NSC`, Nợ TK 152 / Có TK 154).
2. Cấp 2 (Bán thành phẩm chế biến trước):
   - Sử dụng nguyên liệu đã sơ chế để nấu nước dùng phở, làm sốt ướp, ninh nước cốt, làm nhân bánh.
   - Chứng từ: Phiếu xuất chế biến (`XCB`, src/modules/kho/san-xuat.ts:26) và Phiếu nhập chế biến (`NCB`, Nợ TK 152 / Có TK 154).
   - Giá thành của cấp sơ chế trở thành giá nguyên liệu đầu vào của cấp chế biến bán thành phẩm (src/modules/gia-thanh/index.ts:46).
3. Cấp 3 (Món ăn hoàn chỉnh bán cho khách):
   - Tập hợp nguyên liệu bán thành phẩm, nguyên liệu tươi và chi phí trực tiếp tại ca bán để tạo ra món ăn phục vụ khách hàng.

### Cơ cấu khoản mục chi phí cấu thành giá thành món ăn — Đã có trong bản mẫu
Báo cáo Tổng hợp chi phí phát sinh (`9.2.1`, src/modules/gia-thanh/index.ts:7-25) tập hợp 7 nhóm khoản mục chi phí:
- Chi phí nguyên vật liệu trực tiếp (chiếm khoảng 24% đến 36% giá bán món, src/modules/gia-thanh/index.ts:31).
- Chi phí nhân công trực tiếp bếp và pha chế (chiếm khoảng 12% giá bán món, src/modules/gia-thanh/index.ts:31).
- Chi phí mặt bằng phân bổ cho khu vực bếp.
- Chi phí điện, nước, gas công nghiệp phục vụ chế biến (chi phí sản xuất chung chiếm khoảng 8% giá bán món).
- Chi phí khấu hao tài sản cố định khu vực bếp (bếp Á, tủ hấp, lò nướng, máy rửa bát).
- Chi phí phân bổ công cụ dụng cụ (nồi inox, dao thớt, khay chứa).
- Chi phí sản xuất chung khác.

### Phân bổ chi phí chung tính giá thành (`9.1.1`) — Đã có trong bản mẫu
- Màn hình Phân bổ chi phí (`9.1.1`, src/modules/gia-thanh/index.ts:44-45) thực hiện phân bổ các chi phí chung của bộ phận bếp cho từng món ăn.
- Tiêu thức phân bổ được lựa chọn: Phân bổ theo chi phí nguyên vật liệu trực tiếp hoặc phân bổ theo số lượng món bán ra trong kỳ (src/modules/gia-thanh/index.ts:45).
