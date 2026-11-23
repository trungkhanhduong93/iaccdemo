# 04. Chứng từ kế toán và hạch toán định khoản — IACC Cloud (iaccdemo)
Bản xuất từ repo iaccdemo commit 98d2bb3, ngày 23/11/2026.

Phạm vi tài liệu: File này đặc tả toàn bộ chứng từ kế toán trong iaccdemo. Nội dung gồm mục đích sử dụng, các trường thông tin, định khoản Nợ/Có, chứng từ tự sinh kèm và quy tắc duyệt, sửa, xoá. Nguyên lý kế toán xem file 02. Phân hệ và màn hình xem file 03. Báo cáo và mẫu in xem file 05.


## 1. Nguyên tắc quản lý chứng từ và trạng thái ghi sổ

Hệ thống chứng từ trong IACC Cloud được thiết kế đồng bộ cho cả nghiệp vụ F&B bán lẻ và hạch toán tài chính doanh nghiệp (src/ui/generic/ChungTuForm.tsx).
Toàn bộ định khoản kế toán trong bản mẫu hiện tại nằm ở dữ liệu giả (cấu hình mảng `noCo` của từng màn hình trong `src/modules/*/index.ts`). Đây là các định khoản mẫu minh hoạ luồng nghiệp vụ, chưa phải engine hạch toán thật vì hệ thống chưa có backend (docs/KIEN-TRUC.md:30).

### Vòng đời và trạng thái chứng từ — Đã có trong bản mẫu
Hệ thống chứng từ áp dụng các trạng thái trực quan trên danh sách theo quyết định QD25 và QD27:
- Theo quyết định QD81 (sửa T825), trạng thái ghi sổ chỉ áp dụng cho gói Pro (nơi có hạch toán kép Nợ/Có). Gói Standard và Plus không áp dụng ghi sổ, lưu phiếu là hoàn tất.
- Trên giao diện gói Pro, danh sách chứng từ hiển thị các trạng thái (QD25, QD27):
  + Chưa ghi sổ: Dòng chứng từ hiển thị vạch màu vàng ở đầu dòng; chứng từ đã lưu nhưng chưa đưa vào sổ cái (QD27).
  + Đã ghi sổ: Dòng chứng từ ở trạng thái bình thường; toàn bộ số phát sinh đã được đưa vào sổ cái và báo cáo.
  + Bị lỗi hoặc cảnh báo: Dòng chứng từ hiển thị nền đỏ nhạt (QD27); xảy ra khi sai lệch định khoản hoặc thiếu thông tin bắt buộc.
  + Huỷ chứng từ: Chứng từ bị vô hiệu hoá, không tham gia vào bất kỳ sổ sách báo cáo nào nhưng vẫn lưu vết phục vụ kiểm toán nội bộ.

### Quy trình phê duyệt chứng từ hai cấp (11.5) — Đã có trong bản mẫu
- Áp dụng tại phân hệ Tiện ích bổ sung (`11.5`, src/modules/tien-ich/index.ts:25).
- Cấp 1 (Người lập): Nhân viên mua hàng, thủ kho hoặc thu ngân lập phiếu nháp và gửi phê duyệt.
- Cấp 2 (Người duyệt): Kế toán trưởng hoặc Chủ nhà hàng kiểm tra chứng từ gốc, hoá đơn đính kèm rồi bấm "Phê duyệt" để chứng từ chính thức ghi sổ.
- Hệ thống hỗ trợ tính năng duyệt hàng loạt cho các chứng từ định kỳ như thanh toán tiền điện, tiền nước, tiền rau hàng ngày (src/modules/tien-ich/TienIch.tsx).

### Ràng buộc sửa và xoá chứng từ — Đã có trong bản mẫu
Hệ thống thiết lập các chốt chặn an toàn nhằm ngăn ngừa sai lệch số liệu kế toán (docs/TONG-KET-LOGIC-STANDARD.md):
1. Ràng buộc khoá sổ: Mọi chứng từ thuộc kỳ kế toán hoặc cửa hàng đã khoá sổ đều bị vô hiệu hoá hoàn toàn hai nút "Sửa" và "Xoá" (docs/TONG-KET-LOGIC-STANDARD.md:20). Muốn điều chỉnh, người dùng phải mở khoá sổ và ghi rõ lý do.
2. Ràng buộc tham chiếu hai chiều:
   - Phiếu mua hàng (`4.1.1`) đã tích "Đã thanh toán" tự sinh Phiếu chi (`PC`): Muốn sửa hoặc xoá phiếu mua, hệ thống yêu cầu huỷ phiếu chi thanh toán liên kết trước (docs/TONG-KET-LOGIC-STANDARD.md:186).
   - Phiếu chi tiền có lý do "Chi phí chờ phân bổ" đã tạo Thẻ chi phí CCDC (`TPB`): Không cho phép sửa số tiền trên phiếu chi khi thẻ phân bổ đang hoạt động (docs/TONG-KET-LOGIC-STANDARD.md:162, src/modules/ccdc/index.ts:55-58).
   - Phiếu kiểm kê kho (`5.1.10`) đã sinh phiếu Xuất điều chỉnh (`XDC`) và Nhập điều chỉnh (`NDC`): Không cho sửa phiếu kiểm kê; thao tác xoá phiếu kiểm kê sẽ tự động xoá toàn bộ các phiếu điều chỉnh đi kèm (docs/TONG-KET-LOGIC-STANDARD.md:198).
   - Phiếu Bán hàng nội bộ (`3.1.3`) tự sinh Phiếu mua hàng nội bộ: Xoá phiếu bán sẽ đồng thời thu hồi phiếu mua tại chi nhánh nhận (src/modules/ban-hang/index.ts:48-49).


## 2. Chứng từ phân hệ Thu chi (tien)

Phân hệ Thu chi quản lý 6 loại chứng từ dòng tiền (src/modules/tien/index.ts:31-52).

### Phiếu thu tiền mặt (PT) — Đã có trong bản mẫu
- Khi nào dùng: Thu tiền đặt cọc tiệc của khách, thu nợ công nợ khách hàng, thu tiền bán phế liệu, thu hoàn ứng nhân viên (src/modules/tien/index.ts:36).
- Tiền tố số phiếu: `PT{YY}{MM}-{0000}` (docs/TONG-KET-LOGIC-STANDARD.md:157).
- Trường thông tin chính: Ngày chứng từ, Cửa hàng, Quỹ tiền mặt thu ngân, Người nộp tiền, Địa chỉ, Lý do thu, Kèm theo chứng từ gốc, Chi tiết số tiền (src/app/mau-in.ts:92-98).
- Định khoản theo từng chế độ kế toán:

| Chế độ kế toán | Tài khoản Nợ | Tài khoản Có | Diễn giải nghiệp vụ | Nguồn trong code |
|---|---|---|---|---|
| TT99 / TT133 | `1111` | `131` | Thu nợ khách hàng bằng tiền mặt | src/modules/tien/index.ts:36 |
| TT99 / TT133 | `1111` | `5111`, `33311` | Thu tiền bán hàng trực tiếp bằng tiền mặt (nghiệp vụ minh hoạ) | docs/TONG-KET-LOGIC-STANDARD.md:157 |
| TT99 / TT133 | `1111` | `711` | Thu tiền bán vỏ bia, phế liệu bếp (nghiệp vụ minh hoạ) | src/modules/tien/index.ts:32 |
| TT58 | Ghi Sổ tiền (S2d-DNSN) | Không dùng TK | Tăng quỹ tiền mặt | src/modules/tien/index.ts:35 |
| TT152 | Không ghi Nợ/Có | Không dùng TK | Tăng số dư Quỹ tiền mặt tại cửa hàng | docs/TONG-KET-LOGIC-STANDARD.md:15 |

- Chứng từ tự sinh kèm: Không.

### Phiếu chi tiền mặt (PC) — Đã có trong bản mẫu
- Khi nào dùng: Chi mua thực phẩm tươi sống tại chợ, chi tiền gas, chi tiền điện nước, chi tạm ứng cho nhân viên bếp, thanh toán nợ nhà cung cấp (src/modules/tien/index.ts:37-38).
- Tiền tố số phiếu: `PC{YY}{MM}-{0000}`.
- Trường thông tin chính: Ngày chứng từ, Cửa hàng, Quỹ tiền mặt xuất chi, Người nhận tiền, Địa chỉ, Lý do chi, Tháng ghi nhận chi phí, Chi tiết số tiền, Kèm theo hoá đơn (src/app/mau-in.ts:143-149, docs/TONG-KET-LOGIC-STANDARD.md:161).
- Định khoản theo từng chế độ kế toán:

| Chế độ kế toán | Tài khoản Nợ | Tài khoản Có | Diễn giải nghiệp vụ | Nguồn trong code |
|---|---|---|---|---|
| TT99 / TT133 | `6421` | `1111` | Chi phí bán hàng bằng tiền mặt | src/modules/tien/index.ts:33 |
| TT99 / TT133 | `6422` | `1111` | Chi phí quản lý (điện, nước, internet) (nghiệp vụ minh hoạ) | src/modules/tien/index.ts:32 |
| TT99 / TT133 | `1331` | `1111` | Thuế GTGT đầu vào kèm phiếu chi | src/modules/tien/index.ts:33 |
| TT99 / TT133 | `331` | `1111` | Thanh toán nợ tiền mua thực phẩm cho NCC | src/modules/tien/index.ts:42 |
| TT99 / TT133 | `242` | `1111` | Chi tiền mặt chờ phân bổ nhiều tháng | src/modules/tien/index.ts:18 |
| TT58 | Ghi Sổ chi phí (S2b-DNSN) | Ghi Sổ tiền (S2d-DNSN) | Chi phí sản xuất kinh doanh bằng tiền mặt | src/modules/tien/index.ts:31 |
| TT152 | Không ghi Nợ/Có | Không dùng TK | Giảm quỹ tiền mặt, ghi Chi phí hoạt động | docs/TONG-KET-LOGIC-STANDARD.md:102 |

- Chứng từ tự sinh kèm: Khi chọn lý do "Chi phí chờ phân bổ", hệ thống mở hộp thoại hỏi tạo Thẻ phân bổ chi phí `TPB` (docs/TONG-KET-LOGIC-STANDARD.md:162).

### Phiếu thu qua ngân hàng (BC) — Đã có trong bản mẫu
- Khi nào dùng: Khách công ty chuyển khoản thanh toán tiệc, sàn GrabFood/ShopeeFood chuyển trả tiền bán hàng định kỳ (src/modules/tien/index.ts:39-40).
- Tiền tố số phiếu: `BC{YY}{MM}-{0000}`.
- Trường thông tin chính: Ngày chứng từ, Tài khoản ngân hàng nhận tiền, Người chuyển tiền, Lý do nộp, Số tiền, Giấy báo Có ngân hàng (src/app/mau-in.ts:193-198).
- Định khoản theo từng chế độ kế toán:

| Chế độ kế toán | Tài khoản Nợ | Tài khoản Có | Diễn giải nghiệp vụ | Nguồn trong code |
|---|---|---|---|---|
| TT99 / TT133 | `1121` | `131` | Thu tiền khách hàng chuyển khoản | src/modules/tien/index.ts:40 |
| TT99 / TT133 | `1121` | `5111` | Doanh thu bán hàng thu ngay qua chuyển khoản | (chưa có trong code) |
| TT58 | Ghi Sổ tiền (S2d-DNSN) | Không dùng TK | Tăng số dư tiền gửi ngân hàng | src/modules/tien/index.ts:39 |
| TT152 | Không ghi Nợ/Có | Không dùng TK | Tăng số dư tài khoản ngân hàng | docs/TONG-KET-LOGIC-STANDARD.md:118 |

- Chứng từ tự sinh kèm: Không.

### Uỷ nhiệm chi ngân hàng (UNC) — Đã có trong bản mẫu
- Khi nào dùng: Chuyển khoản trả tiền nhà cung cấp nguyên liệu lớn, trả tiền thuê mặt bằng, nộp thuế GTGT vào ngân sách (src/modules/tien/index.ts:41-42).
- Tiền tố số phiếu: `UNC{YY}{MM}-{0000}`.
- Trường thông tin chính: Đơn vị trả tiền, Số tài khoản trích nợ, Ngân hàng trích nợ, Đơn vị thụ hưởng, Số tài khoản thụ hưởng, Ngân hàng thụ hưởng, Nội dung thanh toán, Số tiền (src/app/mau-in.ts:216-224).
- Định khoản theo từng chế độ kế toán:

| Chế độ kế toán | Tài khoản Nợ | Tài khoản Có | Diễn giải nghiệp vụ | Nguồn trong code |
|---|---|---|---|---|
| TT99 / TT133 | `331` | `1121` | Trả tiền nhà cung cấp qua ngân hàng | src/modules/tien/index.ts:42 |
| TT99 / TT133 | `6422` | `1121` | Trả tiền thuê mặt bằng, dịch vụ qua NH | src/modules/tien/index.ts:42 |
| TT99 / TT133 | `33311` | `1121` | Nộp tiền thuế GTGT qua ngân hàng | src/modules/tien/index.ts:42 |
| TT58 | Ghi Sổ chi phí (S2b-DNSN) | Ghi Sổ tiền (S2d-DNSN) | Chi tiền gửi thanh toán chi phí, công nợ | src/modules/tien/index.ts:41 |
| TT152 | Không ghi Nợ/Có | Không dùng TK | Giảm số dư tài khoản ngân hàng | docs/TONG-KET-LOGIC-STANDARD.md:118 |

- Chứng từ tự sinh kèm: Không.

### Phiếu chuyển quỹ nội bộ (CQ) — Đã có trong bản mẫu
- Khi nào dùng: Nộp tiền mặt bán hàng trong ngày vào tài khoản ngân hàng, rút tiền gửi về nhập quỹ tiền mặt, điều chuyển tiền giữa hai tài khoản ngân hàng (src/modules/tien/index.ts:43-45).
- Tiền tố số phiếu: `CQ{YY}{MM}-{0000}`.
- Trường thông tin chính: Quỹ xuất tiền, Quỹ nhập tiền, Ngày giao dịch, Người thực hiện, Diễn giải nội dung chuyển quỹ.
- Định khoản theo từng chế độ kế toán:

| Chế độ kế toán | Tài khoản Nợ | Tài khoản Có | Diễn giải nghiệp vụ | Nguồn trong code |
|---|---|---|---|---|
| TT99 / TT133 | `1121` | `1111` | Nộp tiền mặt vào tài khoản ngân hàng | src/modules/tien/index.ts:45 |
| TT99 / TT133 | `1111` | `1121` | Rút tiền gửi ngân hàng về quỹ tiền mặt | (chưa có trong code) |
| TT58 | Ghi Sổ tiền (S2d-DNSN) | Ghi Sổ tiền (S2d-DNSN) | Điều chuyển số dư giữa các quỹ | src/modules/tien/index.ts:43 |
| TT152 | Không ghi Nợ/Có | Không dùng TK | Tăng quỹ đích, giảm quỹ nguồn | docs/TONG-KET-LOGIC-STANDARD.md:161 |

- Chứng từ tự sinh kèm: Không ảnh hưởng đến lãi lỗ hoạt động của đơn vị.

### Biên bản đối chiếu công nợ (DCCN) — Đã có trong bản mẫu
- Khi nào dùng: Định kỳ cuối tháng hoặc cuối quý, kế toán đối soát xác nhận số dư công nợ còn phải thu hoặc phải trả với đối tác (src/modules/tien/index.ts:50-51).
- Tiền tố số phiếu: `DCCN{YY}{MM}-{0000}`.
- Định khoản: Nợ TK `131` / Có TK `131` hoặc Nợ TK `331` / Có TK `331` (src/modules/tien/index.ts:51). Đây là chứng từ đối chiếu nghiệp vụ, không làm biến động tổng tài sản hay nguồn vốn.


## 3. Chứng từ phân hệ Kế toán bán hàng (ban-hang)

Phân hệ Bán hàng quản lý 6 loại chứng từ doanh thu và giá vốn (src/modules/ban-hang/index.ts:31-52).

### Chứng từ Xuất bán POS (3.1.1) — Đã có trong bản mẫu
- Khi nào dùng: Tự động tiếp nhận toàn bộ các đơn hàng bán lẻ đã thanh toán thành công tại quầy thu ngân của máy bán hàng POS FABi (src/modules/ban-hang/ChungTuBanHang.tsx, docs/TONG-KET-LOGIC-STANDARD.md:176).
- Tiền tố số phiếu: Mã hoá đơn FABi hoặc số phiếu `XBP{YY}{MM}-{0000}` (QD114).
- Trường thông tin chính: Cửa hàng bán, Ngày giờ bán, Kênh bán (Tại bàn, Mang về, GrabFood), Chi tiết danh sách món ăn, Số lượng, Đơn giá, Khuyến mãi, Phương thức thanh toán (Tiền mặt, Thẻ, QR), Dòng Giảm thuế GTGT (docs/TONG-KET-LOGIC-STANDARD.md:178-179).
- Định khoản theo từng chế độ kế toán:

| Chế độ kế toán | Tài khoản Nợ | Tài khoản Có | Diễn giải nghiệp vụ | Nguồn trong code |
|---|---|---|---|---|
| TT99 / TT133 | `1111`, `1121`, `131` | `5111`, `5112` | Doanh thu bán đồ uống, món ăn | (chưa có trong code) |
| TT99 / TT133 | `1111`, `1121` | `33311` | Thuế GTGT đầu ra (nếu có thuế) | (chưa có trong code) |
| TT58 | Ghi Sổ DT (S1-DNSN) | Không dùng TK | Ghi nhận doanh thu bán hàng hoá, dịch vụ | src/modules/bao-cao/danh-sach.ts:89 |
| TT152 | Không ghi Nợ/Có | Không dùng TK | Ghi nhận doanh thu thuần theo ngày | docs/TONG-KET-LOGIC-STANDARD.md:179 |

- Chứng từ tự sinh kèm: Tự động kích hoạt quy trình xuất kho định lượng nguyên vật liệu tương ứng với số món bán ra (QD112).

### Phiếu Xuất kho định lượng (XDL, 5.1.2) — Đã có trong bản mẫu
- Khi nào dùng: Xuất tiêu hao thịt bò, rau củ, gia vị, bao bì từ kho bếp theo số lượng món ăn đã bán ra (src/modules/ban-hang/index.ts:31-35, QD112).
- Tiền tố số phiếu: `XDL{YY}{MM}-{0000}` (src/modules/ban-hang/index.ts:32).
- Trường thông tin chính: Cửa hàng lập, Kho bếp xuất, Ngày xuất, Căn cứ theo danh sách hoá đơn bán hàng, Chi tiết nguyên vật liệu tiêu hao, Đơn vị tính, Số lượng định lượng, Đơn giá vốn bình quân, Thành tiền vốn (src/modules/kho/XuatDinhLuong.tsx).
- Định khoản theo từng chế độ kế toán:

| Chế độ kế toán | Tài khoản Nợ | Tài khoản Có | Diễn giải nghiệp vụ | Nguồn trong code |
|---|---|---|---|---|
| TT99 / TT133 | `632` | `152` | Giá vốn xuất kho NVL theo định lượng | src/modules/ban-hang/index.ts:33 |
| TT58 | Ghi Sổ chi phí (S2b-DNSN) | Ghi Sổ vật liệu (S2c-DNSN) | Xuất kho nguyên vật liệu bán hàng | src/modules/bao-cao/danh-sach.ts:115 |
| TT152 | Không ghi Nợ/Có | Không dùng TK | Trừ số lượng tồn kho nguyên vật liệu | docs/TONG-KET-LOGIC-STANDARD.md:200 |

- Chứng từ tự sinh kèm: Không.

### Chứng từ Bán hàng lập tay ngoài POS (3.1.7) — Đã có trong bản mẫu
- Khi nào dùng: Bán tiệc cưới, tiệc liên hoan công ty, bán suất ăn công nghiệp theo hợp đồng kinh tế không qua máy POS FABi (src/modules/ban-hang/ChungTuBanHang.tsx:45, src/modules/ban-hang/index.ts:44-45).
- Tiền tố số phiếu: `BH{YY}{MM}-{0000}`.
- Định khoản theo từng chế độ kế toán:

| Chế độ kế toán | Tài khoản Nợ | Tài khoản Có | Diễn giải nghiệp vụ | Nguồn trong code |
|---|---|---|---|---|
| TT99 / TT133 | `1111` | `5111` | Doanh thu tiệc cho khách công ty | src/modules/ban-hang/ChungTuBanHang.tsx:45 |
| TT99 / TT133 | `1111` | `33311` | Thuế GTGT đầu ra của tiệc | src/modules/ban-hang/ChungTuBanHang.tsx:45 |
| TT99 / TT133 | `632` | `152` | Giá vốn nguyên vật liệu phục vụ tiệc | src/modules/ban-hang/ChungTuBanHang.tsx:45 |
| TT58 | Ghi Sổ DT (S1-DNSN) | Không dùng TK | Ghi nhận doanh thu tiệc | src/modules/bao-cao/danh-sach.ts:89 |
| TT152 | Không ghi Nợ/Có | Không dùng TK | Ghi nhận doanh thu bán hàng | docs/TONG-KET-LOGIC-STANDARD.md:181 |

- Chứng từ tự sinh kèm: Nếu khách hàng thanh toán ngay bằng tiền mặt hoặc chuyển khoản, phiếu mẫu tự động sinh phiếu thu tham chiếu (src/modules/ban-hang/index.ts:45, T586).

### Hoá đơn bán hàng thương mại (HDB, 3.1.2) — Đã có trong bản mẫu
- Khi nào dùng: Bán hàng đóng gói sẵn (cà phê hộp, trà túi lọc, bia lon mang về) kiêm xuất kho hàng hoá (src/modules/ban-hang/index.ts:46-47).
- Tiền tố số phiếu: `HDB{YY}{MM}-{0000}`.
- Định khoản: Nợ TK `131` / Có TK `5111` (Doanh thu), Nợ TK `131` / Có TK `33311` (Thuế GTGT), Nợ TK `632` / Có TK `152` (Giá vốn xuất bán, src/modules/ban-hang/index.ts:47).

### Phiếu Bán hàng nội bộ (BNB, 3.1.3) — Đã có trong bản mẫu
- Khi nào dùng: Chi nhánh trung tâm bán bán thành phẩm (nước cốt phở, sốt lẩu) cho chi nhánh khác trong cùng chuỗi nhà hàng (src/modules/ban-hang/index.ts:48-49).
- Tiền tố số phiếu: `BNB{YY}{MM}-{0000}`.
- Định khoản: Nợ TK `136` (Phải thu nội bộ) / Có TK `5111` (Doanh thu nội bộ); đồng thời ghi Nợ TK `632` / Có TK `152` (Giá vốn xuất bán, src/modules/ban-hang/index.ts:49).
- Chứng từ tự sinh kèm: Hệ thống tự động tạo một Phiếu mua hàng nội bộ đối ứng tại chi nhánh nhận với trạng thái chờ xác nhận nhập kho (src/modules/ban-hang/index.ts:48).

### Phiếu Hàng bán trả lại (TL, 3.1.4) — Đã có trong bản mẫu
- Khi nào dùng: Khách trả lại món ăn làm sai yêu cầu, huỷ đơn sau khi thu ngân đã chốt hoá đơn (src/modules/ban-hang/index.ts:50-52).
- Tiền tố số phiếu: `TL{YY}{MM}-{0000}`.
- Định khoản: Nợ TK `5111` / Có TK `1111` (Giảm trừ doanh thu), Nợ TK `33311` / Có TK `1111` (Giảm trừ thuế GTGT đầu ra, src/modules/ban-hang/index.ts:52).


## 4. Chứng từ phân hệ Kế toán mua hàng (mua-hang)

Phân hệ Mua hàng quản lý 6 loại chứng từ nhập kho và công nợ (src/modules/mua-hang/index.ts:1-43).

### Phiếu mua hàng (MH, 4.1.1) — Đã có trong bản mẫu
- Khi nào dùng: Nhập kho thực phẩm, rau củ, thịt cá, gia vị, đồ uống từ nhà cung cấp (src/modules/mua-hang/index.ts:20, src/modules/mua-hang/bao-cao.ts:12-15).
- Tiền tố số phiếu: `MH{YY}{MM}-{0000}`.
- Trường thông tin chính: Nhà cung cấp, Cửa hàng, Kho nhập hàng, Ngày hoá đơn, Ký hiệu hoá đơn, Số hoá đơn, Danh sách mặt hàng, Số lượng thực nhập, Đơn giá chưa thuế, Tiền thuế GTGT, Tổng tiền thanh toán (src/app/mau-in.ts:257-265, docs/TONG-KET-LOGIC-STANDARD.md:185-188).
- Định khoản theo từng chế độ kế toán:

| Chế độ kế toán | Tài khoản Nợ | Tài khoản Có | Diễn giải nghiệp vụ | Nguồn trong code |
|---|---|---|---|---|
| TT99 / TT133 | `152` | `331` | Nhập kho nguyên vật liệu chưa trả tiền | src/modules/mua-hang/bao-cao.ts:14 |
| TT99 / TT133 | `1331` | `331` | Thuế GTGT đầu vào được khấu trừ | src/modules/mua-hang/bao-cao.ts:14 |
| TT58 | Ghi Sổ vật liệu (S2c-DNSN) | Ghi Sổ công nợ (S4a-DNSN) | Nhập kho vật tư chưa thanh toán | src/modules/mua-hang/bao-cao.ts:14 |
| TT152 | Không ghi Nợ/Có | Không dùng TK | Tăng tồn kho, ghi nhận nợ NCC | docs/TONG-KET-LOGIC-STANDARD.md:188 |

- Lưu ý với TT152: Vì hộ kinh doanh không khấu trừ thuế GTGT, giá trị nhập kho bằng tiền trước thuế cộng toàn bộ tiền thuế GTGT (docs/TONG-KET-LOGIC-STANDARD.md:188).
- Chứng từ tự sinh kèm: Khi tích chọn "Đã thanh toán", hệ thống tự động sinh Phiếu chi (`PC`) hoặc Uỷ nhiệm chi (`UNC`) tương ứng (docs/TONG-KET-LOGIC-STANDARD.md:186).

### Hoá đơn mua hàng không qua kho (HDM, 4.1.2) — Đã có trong bản mẫu
- Khi nào dùng: Mua hàng tiêu dùng ngay không qua kho: chi phí tiếp khách, thuê xe chở khách, mua văn phòng phẩm dùng ngay (src/modules/mua-hang/hoa-don-mua.ts:25, src/modules/mua-hang/index.ts:22).
- Định khoản: Nợ TK `6422` / Có TK `331` (Chi phí mua ngoài), Nợ TK `1331` / Có TK `331` (Thuế GTGT được khấu trừ, src/modules/mua-hang/hoa-don-mua.ts:25).

### Phiếu Mua hàng qua sơ chế (MSC, 4.1.3) — Đã có trong bản mẫu
- Khi nào dùng: Mua thực phẩm tươi sống đưa thẳng vào khu sơ chế của bếp trung tâm (src/modules/mua-hang/index.ts:23-24).
- Tiền tố số phiếu: `MSC{YY}{MM}-{0000}`.
- Định khoản: Nợ TK `152` (Nguyên liệu đã sơ chế) / Có TK `331`, Nợ TK `1331` / Có TK `331` (src/modules/mua-hang/index.ts:24).

### Phiếu Trả lại hàng mua cho nhà cung cấp (TLN, 4.1.4) — Đã có trong bản mẫu
- Khi nào dùng: Trả lại thịt bò kém chất lượng, trả lại rau củ dập nát cho nhà cung cấp (src/modules/mua-hang/index.ts:25-26).
- Tiền tố số phiếu: `TLN{YY}{MM}-{0000}`.
- Định khoản: Nợ TK `331` / Có TK `152` (Giảm nợ phải trả, giảm kho NVL), Nợ TK `331` / Có TK `1331` (Giảm thuế GTGT được khấu trừ, src/modules/mua-hang/index.ts:26).

### Phiếu Chi phí mua hàng (CPM, 4.1.5) — Đã có trong bản mẫu
- Khi nào dùng: Ghi nhận cước vận chuyển xe lạnh, chi phí bốc dỡ nguyên liệu phân bổ vào giá trị lô hàng nhập (src/modules/mua-hang/index.ts:27-28).
- Tiền tố số phiếu: `CPM{YY}{MM}-{0000}`.
- Định khoản: Nợ TK `152` / Có TK `331` (Tăng giá trị nhập kho của NVL), Nợ TK `1331` / Có TK `331` (src/modules/mua-hang/index.ts:28).

### Phiếu Bổ sung hoá đơn (BSHD, 4.1.6) — Đã có trong bản mẫu
- Khi nào dùng: Nhà cung cấp xuất hoá đơn gộp vào cuối tháng cho các phiếu mua hàng đã giao rải rác trong tháng (src/modules/mua-hang/index.ts:29-30).
- Tiền tố số phiếu: `BSHD{YY}{MM}-{0000}`.
- Định khoản: Nợ TK `1331` / Có TK `331` (Ghi nhận bổ sung thuế GTGT được khấu trừ, src/modules/mua-hang/index.ts:30).


## 5. Chứng từ phân hệ Kho hàng (kho)

Phân hệ Kho hàng quản lý các nghiệp vụ xuất nhập kho nội bộ và quy trình chế biến F&B (src/modules/kho/index.ts:1-133).

### Phiếu Nhập khác (NK, 5.1.1) và Xuất khác (XK, 5.1.2-4) — Đã có trong bản mẫu
- Nhập kho (`5.1.1`): Nhập bán thành phẩm hoặc nguyên liệu dùng không hết: Ghi Nợ TK `152` / Có TK `154` (Nhập kho bán thành phẩm, src/modules/kho/index.ts:111).
- Xuất khác (`5.1.2-4`): Xuất nguyên liệu dùng thử món mới, liên hoan nhân viên: Ghi Nợ TK `6421` / Có TK `152` (Xuất dùng nội bộ, src/modules/kho/index.ts:109).

### Phiếu Xuất huỷ (XH, 5.1.2-3) — Đã có trong bản mẫu
- Khi nào dùng: Xuất huỷ thực phẩm hỏng do mất điện tủ đông, nguyên liệu quá hạn dùng (src/modules/kho/index.ts:77).
- Tiền tố số phiếu: `XH{YY}{MM}-{0000}`.
- Định khoản: Nợ TK `632` hoặc Nợ TK `811` / Có TK `152` (src/modules/kho/index.ts:77). Mẫu in kèm theo Biên bản huỷ hàng (`bang-ke-mua-hang`, src/app/mau-in.ts:468).

### Nhóm chứng từ Điều chuyển kho: Xuất điều chuyển (5.1.4), Nhập điều chuyển (5.1.4-2), Xuất chuyển kho (5.1.4-3) — Đã có trong bản mẫu
Quy định theo QD112: Gói Plus sử dụng cặp Xuất điều chuyển (`XDCK`) và Nhập điều chuyển (`NDCK`); gói Pro có thêm Xuất chuyển kho (`CK`) (src/modules/kho/dieu-chuyen.ts:14-18):
- Xuất điều chuyển (`XDCK`): Lập tại kho xuất: Ghi Nợ TK `1368` (Phải thu nội bộ khác) / Có TK `152` (src/modules/kho/dieu-chuyen.ts:16).
- Nhập điều chuyển (`NDCK`): Lập tại kho nhận khi hàng tới nơi: Ghi Nợ TK `152` / Có TK `3368` (Phải trả nội bộ khác, src/modules/kho/dieu-chuyen.ts:17).
- Xuất chuyển kho (`CK`): Chuyển kho tức thời trong cùng cửa hàng: không sinh bút toán Nợ/Có do chỉ điều chuyển nội bộ giữa hai kho (`noCo: []`, src/modules/kho/dieu-chuyen.ts:18).

### Nhóm chứng từ Sơ chế và Chế biến thực phẩm — Đã có trong bản mẫu
Phục vụ quản lý sản xuất bếp trung tâm (src/modules/kho/san-xuat.ts:22-28):
- Xuất sơ chế (`XSC`, `5.1.6`): Xuất thịt tươi thô đưa vào pha lóc: Ghi Nợ TK `154` / Có TK `152` (Thịt thô, src/modules/kho/san-xuat.ts:24). Tự sinh Phiếu nhập sơ chế `NSC`.
- Nhập sơ chế (`NSC`, `5.1.6-2`): Nhập kho thịt đã cắt lát chuẩn bị nấu: Ghi Nợ TK `152` (Thịt cắt lát) / Có TK `154` (src/modules/kho/san-xuat.ts:25).
- Xuất chế biến (`XCB`, `5.1.3`): Xuất xương ống, gia vị vào nồi hầm: Ghi Nợ TK `154` / Có TK `152` (src/modules/kho/san-xuat.ts:26). Tự sinh Phiếu nhập chế biến `NCB`.
- Nhập chế biến (`NCB`, `5.1.3-2`): Nhập kho nồi nước dùng phở hoàn chỉnh: Ghi Nợ TK `152` hoặc `155` / Có TK `154` (src/modules/kho/san-xuat.ts:28).

### Phiếu Kiểm kê kho (KK, 5.1.10) và Phiếu điều chỉnh tự sinh — Đã có trong bản mẫu
- Phiếu kiểm kê kho (`KK`): Lập định kỳ cuối tháng để chốt số lượng thực tế trong kho (src/modules/kho/index.ts:24-30).
- Bản thân phiếu kiểm kê chỉ ghi nhận số lượng Tồn hệ thống và Tồn thực tế, không hạch toán số tiền Nợ/Có trực tiếp (docs/TONG-KET-LOGIC-STANDARD.md:195).
- Cơ chế tự sinh chứng từ điều chỉnh (src/modules/kho/index.ts:31-43, docs/TONG-KET-LOGIC-STANDARD.md:197):
  + Khi kiểm kê thiếu: Tự động sinh Phiếu Xuất điều chỉnh (`XDC`), định khoản Nợ TK `1381` (Tài sản thiếu chờ xử lý) / Có TK `152` (src/modules/kho/index.ts:39).
  + Khi kiểm kê thừa: Tự động sinh Phiếu Nhập điều chỉnh (`NDC`), định khoản Nợ TK `152` / Có TK `3381` (Tài sản thừa chờ xử lý) (src/modules/kho/index.ts:40).


## 6. Chứng từ phân hệ Tài sản cố định và CCDC

### Chứng từ Tài sản cố định (tscd) — Đã có trong bản mẫu
Áp dụng tại màn hình `7.1.2` (src/modules/tscd/index.ts:50-60):
- Ghi tăng TSCĐ (`GTTS`): Nợ TK `211` / Có TK `331`, Nợ TK `1332` / Có TK `331` (src/modules/tscd/index.ts:51).
- Điều chuyển TSCĐ (`DCTS`): Nợ TK `211` (Cửa hàng nhận) / Có TK `211` (Cửa hàng chuyển, src/modules/tscd/index.ts:55).
- Ngừng trích khấu hao (`NKH`): Nợ TK `214` / Có TK `214` (src/modules/tscd/index.ts:57).
- Thanh lý TSCĐ (`TLTS`): Nợ TK `214` (Hao mòn luỹ kế) / Có TK `211`, Nợ TK `811` (Giá trị còn lại) / Có TK `211`, đồng thời ghi nhận số tiền thu được Nợ TK `1111` / Có TK `711` (src/modules/tscd/index.ts:58-60).

### Chứng từ Chi phí trả trước và CCDC (ccdc) — Đã có trong bản mẫu
Áp dụng tại phân hệ CCDC (src/modules/ccdc/index.ts:1-142):
- Thẻ ghi tăng chi phí phân bổ (`TPB`): Nợ TK `242` / Có TK `1111`, `1121`, `331` (src/modules/ccdc/index.ts:20-46).
- Bút toán trích phân bổ hàng tháng: Nợ TK `6421` (Chi phí bán hàng), `6422` (Chi phí quản lý) / Có TK `242` (Chi phí trả trước, src/modules/ccdc/the-phan-bo.ts).
- Biên bản điều chuyển CCDC (`DCCC`): Nợ TK `242` / Có TK `242` (Điều chuyển giữa cửa hàng, src/modules/ccdc/index.ts:123).
- Biên bản ghi giảm CCDC (`GGCC`): Nợ TK `6421` / Có TK `242` (Phân bổ nốt giá trị còn lại, src/modules/ccdc/index.ts:124).
- Kiểm kê CCDC thiếu: Nợ TK `1381` / Có TK `242` (CCDC thiếu chờ xử lý, src/modules/ccdc/index.ts:127).


## 7. Chứng từ phân hệ Kế toán tổng hợp (tong-hop) và Thuế (thue)

### Chứng từ tổng hợp (NVK, 10.1.1) — Đã có trong bản mẫu
Sử dụng để hạch toán các nghiệp vụ phi tiền tệ hoặc điều chỉnh sai sót cuối kỳ (src/modules/tong-hop/index.ts:18-19):
- Tiền tố số phiếu: `NVK{YY}{MM}-{0000}`.
- Cấu hình định khoản mẫu trong code: Nợ TK `6421` / Có TK `242` (Phân bổ chi phí trả trước, src/modules/tong-hop/index.ts:19).
- Các bút toán tiêu biểu trong diễn giải mẫu:
  + Phân bổ tiền thuê mặt bằng trong kỳ: Nợ TK `6421`, `6422` / Có TK `242` (src/modules/tong-hop/index.ts:19).
  + Trích khấu hao tài sản cố định trong kỳ: Nợ TK `6421`, `6422` / Có TK `214` (src/modules/tong-hop/index.ts:19).
  + Trích bảng tính lương nhân viên nhà hàng: Nợ TK `6421`, `6422` / Có TK `334` (src/modules/tong-hop/index.ts:19).
  + Khấu trừ thuế GTGT đầu vào với đầu ra cuối tháng: Nợ TK `33311` / Có TK `1331` (src/modules/tong-hop/index.ts:19).

### Bút toán kết chuyển xác định kết quả kinh doanh (10.1.5) — Đã có trong bản mẫu
Hệ thống tự động sinh bút toán kết chuyển khép kín cuối kỳ kế toán (src/modules/tong-hop/index.ts:24-25):
- Kết chuyển doanh thu: Nợ TK `5111`, `5112`, `515`, `711` / Có TK `911`.
- Kết chuyển chi phí: Nợ TK `911` / Có TK `632`, `6421`, `6422`, `635`, `811`.
- Kết chuyển lãi kinh doanh: Nợ TK `911` / Có TK `4212` (Lợi nhuận năm nay).
- Kết chuyển lỗ kinh doanh: Nợ TK `4212` / Có TK `911`.

### Chứng từ kê khai thuế mua vào (KKV) và bán ra (KKR) — Đã có trong bản mẫu
Áp dụng tại phân hệ Kê khai thuế (src/modules/thue/index.ts:32-35):
- Kê khai mua vào (`KKV`, `6.1.1`): Nợ TK `1331` / Có TK `331` (Thuế GTGT đầu vào được khấu trừ, src/modules/thue/index.ts:33).
- Kê khai bán ra (`KKR`, `6.1.2`): Nợ TK `131` / Có TK `33311` (Thuế GTGT đầu ra phải nộp, src/modules/thue/index.ts:35).
