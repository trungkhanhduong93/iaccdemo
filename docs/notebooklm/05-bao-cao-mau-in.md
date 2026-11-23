# 05. Báo cáo tài chính, sổ sách và mẫu in — IACC Cloud (iaccdemo)
Bản xuất từ repo iaccdemo commit 98d2bb3, ngày 23/11/2026.

Phạm vi tài liệu: File này đặc tả toàn bộ hệ thống báo cáo tài chính, sổ sách kế toán, báo cáo thuế và 19 mẫu in chứng từ trong iaccdemo. Nội dung gồm ký hiệu mẫu biểu pháp định, phân quyền gói thuê bao, tuỳ chỉnh khổ giấy và công cụ thiết kế mẫu in. Nguyên lý kế toán xem file 02. Phân hệ và màn hình xem file 03. Chứng từ và định khoản xem file 04.

## 1. Hệ thống Báo cáo tài chính pháp định

Hệ thống Báo cáo tài chính trong IACC Cloud tuân thủ quy chuẩn của Bộ Tài chính Việt Nam, áp dụng cho gói Plus và Pro (src/modules/tong-hop/BaoCaoTaiChinh.tsx, src/modules/bao-cao/danh-sach.ts:144-148). Báo cáo tài chính giữ nguyên bố cục pháp định, không cho phép xoá hoặc đổi thứ tự dòng (QD31).

### Báo cáo tình hình tài chính hay Bảng cân đối kế toán (10.2.2) — Đã có trong bản mẫu
- Mục đích: Phản ánh toàn bộ giá trị tài sản và nguồn hình thành tài sản của doanh nghiệp tại thời điểm kết thúc kỳ kế toán (src/modules/tong-hop/BaoCaoTaiChinh.tsx).
- Khổ giấy in: Khổ A4 đứng (`kho: 'doc'`, src/modules/bao-cao/danh-sach.ts:145).
- Ký hiệu mẫu biểu theo chế độ:
  + TT99: Mẫu `B01-DN` (Báo cáo tình hình tài chính doanh nghiệp).
  + TT133: Mẫu `B01a-DNN` (Báo cáo tình hình tài chính doanh nghiệp nhỏ và vừa).
  + TT58: Mẫu `B01-DNSN` (Báo cáo tình hình tài chính doanh nghiệp siêu nhỏ, trường hợp 2 và 4 nộp thuế TNDN theo thu nhập tính thuế, src/modules/bao-cao/danh-sach.ts:145).
  + TT152: Không áp dụng bảng cân đối kế toán cho hộ kinh doanh.
- Cấu trúc các khối chỉ tiêu:
  + Phần A: TÀI SẢN (Tài sản ngắn hạn gồm Tiền, Các khoản tương đương tiền, Phải thu ngắn hạn của khách hàng, Hàng tồn kho; Tài sản dài hạn gồm Tài sản cố định hữu hình, Hao mòn luỹ kế, Chi phí trả trước dài hạn).
  + Phần B: NGUỒN VỐN (Nợ phải trả gồm Phải trả người bán ngắn hạn, Thuế và các khoản phải nộp nhà nước, Phải trả người lao động; Vốn chủ sở hữu gồm Vốn góp của chủ sở hữu, Lợi nhuận sau thuế chưa phân phối).
  + Điều kiện cân đối bắt buộc: Tổng số dư Tài sản luôn bằng Tổng số dư Nguồn vốn (src/modules/tong-hop/CuoiKy.tsx:19).

### Báo cáo kết quả hoạt động kinh doanh (10.2.3) — Đã có trong bản mẫu
- Mục đích: Phản ánh tổng hợp doanh thu thuần, giá vốn hàng bán, chi phí hoạt động và lợi nhuận thuần từ kinh doanh trong kỳ (src/modules/tong-hop/BaoCaoTaiChinh.tsx).
- Khổ giấy in: Khổ A4 đứng (`kho: 'doc'`, src/modules/bao-cao/danh-sach.ts:146).
- Ký hiệu mẫu biểu theo chế độ:
  + TT99: Mẫu `B02-DN`.
  + TT133: Mẫu `B02-DNN`.
  + TT58: Mẫu `B02-DNSN`.
  + Gói Standard (Hộ kinh doanh và DN siêu nhỏ TT58 TH1): Xem bản Báo cáo kết quả kinh doanh rút gọn, không gắn ký hiệu mẫu pháp định (src/modules/bao-cao/danh-sach.ts:211, T632).
- Các chỉ tiêu tài chính cốt lõi:
  1. Doanh thu bán hàng và cung cấp dịch vụ (Mã số 01).
  2. Các khoản giảm trừ doanh thu (Mã số 02 - Chiết khấu thương mại, giảm giá hàng bán, hàng bán bị trả lại).
  3. Doanh thu thuần về bán hàng và cung cấp dịch vụ (Mã số 10 = Mã 01 − Mã 02).
  4. Giá vốn hàng bán (Mã số 11 - Chi phí nguyên vật liệu xuất chế biến và xuất bán).
  5. Lợi nhuận gộp về bán hàng và cung cấp dịch vụ (Mã số 20 = Mã 10 − Mã 11).
  6. Chi phí bán hàng (Mã số 25 - Chi phí bao bì, nhân công giao hàng, hoa hồng đối tác).
  7. Chi phí quản lý doanh nghiệp (Mã số 26 - Chi phí mặt bằng, điện nước gas, lương quản lý, khấu hao TSCĐ).
  8. Lợi nhuận thuần từ hoạt động kinh doanh (Mã số 30 = Mã 20 − (Mã 25 + Mã 26)).
  9. Lợi nhuận khác (Mã số 40 = Thu nhập khác Mã 31 − Chi phí khác Mã 32).
  10. Tổng lợi nhuận kế toán trước thuế (Mã số 50 = Mã 30 + Mã 40).

### Báo cáo lưu chuyển tiền tệ (10.2.4) — Đã có trong bản mẫu
- Mục đích: Báo cáo dòng tiền thực tế thu vào và chi ra trong kỳ theo phương pháp trực tiếp (src/modules/tong-hop/BaoCaoTaiChinh.tsx).
- Khổ giấy in: Khổ A4 đứng (`kho: 'doc'`, src/modules/bao-cao/danh-sach.ts:147).
- Ký hiệu mẫu biểu:
  + TT99: Mẫu `B03-DN`.
  + TT133: Mẫu `B03-DNN`.
- Nhóm dòng tiền chính:
  + Lưu chuyển tiền từ hoạt động kinh doanh: Tiền thu từ bán hàng; Tiền chi trả cho người cung cấp nguyên vật liệu; Tiền chi trả cho người lao động; Tiền chi nộp thuế; Tiền chi khác cho hoạt động kinh doanh.
  + Lưu chuyển tiền từ hoạt động đầu tư: Tiền chi mua sắm tài sản cố định, máy móc nhà bếp; Tiền thu hồi thanh lý thiết bị cũ.
  + Lưu chuyển tiền từ hoạt động tài chính: Tiền góp vốn của chủ sở hữu; Tiền trả nợ gốc vay; Tiền chi trả cổ tức, lợi nhuận cho chủ quán.

### Thuyết minh Báo cáo tài chính (10.2.5) — Đã có trong bản mẫu
- Mục đích: Cung cấp thông tin bổ sung chi tiết về chính sách kế toán áp dụng và diễn giải số liệu trên bảng cân đối kế toán, kết quả kinh doanh (src/modules/tong-hop/index.ts:34-37).
- Ký hiệu mẫu biểu: Mẫu `B09-DN` (TT99) và `B09-DNN` (TT133, src/modules/bao-cao/danh-sach.ts:148).
- 8 nội dung thuyết minh tiêu chuẩn:
  1. Đặc điểm hoạt động của doanh nghiệp nhà hàng F&B.
  2. Kỳ kế toán và đơn vị tiền tệ sử dụng trong ghi sổ.
  3. Chuẩn mực và chế độ kế toán áp dụng.
  4. Các chính sách kế toán áp dụng (tính giá hàng tồn kho, trích khấu hao TSCĐ).
  5. Thông tin bổ sung cho các khoản mục trên Báo cáo tình hình tài chính.
  6. Thông tin bổ sung cho các khoản mục trên Báo cáo kết quả kinh doanh.
  7. Thông tin bổ sung cho Báo cáo lưu chuyển tiền tệ.
  8. Những thông tin giải trình sự kiện sau ngày kết thúc kỳ kế toán.

### Bảng cân đối số phát sinh tài khoản (10.2.1) — Đã có trong bản mẫu
- Mục đích: Kiểm tra tính cân đối toàn diện của hệ thống tài khoản kế toán trước khi lập báo cáo tài chính (src/modules/tong-hop/BaoCaoTaiChinh.tsx).
- Khổ giấy in: Khổ A4 ngang (`kho: 'ngang'`, src/modules/bao-cao/danh-sach.ts:144).
- Ký hiệu mẫu biểu:
  + TT99: Mẫu `S06-DN` (Bảng cân đối số phát sinh).
  + TT133: Mẫu `F01-DNN` (Bảng cân đối tài khoản).
- Cấu trúc cột dữ liệu: Số hiệu tài khoản, Tên tài khoản, Số dư đầu kỳ (Nợ/Có), Số phát sinh trong kỳ (Nợ/Có), Số dư cuối kỳ (Nợ/Có).
- Nguyên tắc đối chiếu: Tổng số dư Nợ đầu kỳ = Tổng số dư Có đầu kỳ; Tổng phát sinh Nợ = Tổng phát sinh Có; Tổng số dư Nợ cuối kỳ = Tổng số dư Có cuối kỳ.

### Báo cáo tài chính quản trị (10.3.1) — Đã có trong bản mẫu
- Mục đích: Phục vụ trực tiếp cho chủ chuỗi F&B và ban quản trị, phân tích doanh thu, chi phí, biên lợi nhuận gộp và điểm hoà vốn theo từng điểm bán (src/modules/tong-hop/BaoCaoTaiChinh.tsx).
- Khổ giấy in: Khổ A4 ngang (`kho: 'ngang'`, src/modules/bao-cao/danh-sach.ts:149).


## 2. Hệ thống Sổ sách kế toán theo chế độ

Sổ sách kế toán là công cụ ghi chép chi tiết nghiệp vụ phục vụ thanh tra thuế và quản trị nội bộ (src/modules/bao-cao/danh-sach.ts:65-162).

### Ma trận ký hiệu các loại sổ sách theo từng Thông tư kế toán

| Mã màn hình | Tên sổ sách kế toán | TT152 (Hộ kinh doanh) | TT58 (DN siêu nhỏ) | TT133 (DN nhỏ & vừa) | TT99 (Doanh nghiệp) | Khổ in |
|---|---|---|---|---|---|---|
| `2.2.1` | Sổ quỹ tiền mặt | Không dùng | S1-DNSN (TH1) | S04a-DNN | S07-DN | Dọc |
| `2.2.3` | Sổ tiền gửi ngân hàng | Không dùng | Không dùng | S05-DNN | S08-DN | Dọc |
| `2.2.4` | Sổ nhật ký chung | Không dùng | Không dùng | S03a-DNN | S03a-DN | Ngang |
| `2.2.2` | Sổ chi tiết các tài khoản (Sổ cái)| Không dùng | Không dùng | S19-DNN | S38-DN | Ngang |
| `2.2.5` | Sổ công nợ tổng hợp | Không dùng | S4a-DNSN | S12-DNN | S31-DN | Ngang |
| `2.2.6` | Sổ chi tiết tiền vay | Không dùng | Không dùng | S15-DNN | S34-DN | Ngang |
| `2.2.7` | Sổ chi tiết tiền | S2e-HKD | S2d-DNSN | Không dùng | Không dùng | Dọc |
| `3.2.5` | Sổ doanh thu bán hàng | S1a/S2a/S2b-HKD | S1/S2a/S3a-DNSN | S16-DNN | S35-DN | Ngang |
| `5.2.8` | Sổ chi tiết vật liệu, dụng cụ | S2d-HKD | S2c-DNSN | S06-DNN | S10-DN | Ngang |
| `7.2.1` | Sổ tài sản cố định | Không dùng | S4b-DNSN | S09-DNN | S21-DN | Ngang |
| `7.2.3` | Thẻ tài sản cố định | Không dùng | Không dùng | S11-DNN | S23-DN | Dọc |
| `7.2.4` | Sổ theo dõi TSCĐ tại nơi dùng | Không dùng | Không dùng | S10-DNN | S22-DN | Ngang |
| `10.4.1` | Sổ chi tiết doanh thu, chi phí| S2c-HKD | S2b-DNSN | Không dùng | Không dùng | Ngang |
| `10.4.2` | Sổ theo dõi vốn chủ sở hữu | Không dùng | S4d-DNSN | S23-DNN | S51-DN | Dọc |
| `10.4.3` | Sổ chi phí sản xuất KD | Không dùng | Không dùng | Không dùng | Không dùng | Dọc |
| `5.2.1` | Thẻ kho | Báo cáo quản trị kho | Báo cáo quản trị kho | Báo cáo quản trị kho | Báo cáo quản trị kho | Dọc |
| `5.2.3` | Báo cáo xuất nhập tồn | Báo cáo quản trị kho | Báo cáo quản trị kho | Báo cáo quản trị kho | Báo cáo quản trị kho | Ngang |

### Trọn bộ 7 mẫu sổ kế toán Hộ kinh doanh theo Thông tư 152 — Đã có trong bản mẫu
Hộ kinh doanh và cá nhân kinh doanh áp dụng bộ sổ theo phương pháp tính thuế (src/modules/bao-cao/tt152.ts, src/modules/bao-cao/danh-sach.ts:195-220):
1. Mẫu `S1a-HKD`: Sổ chi tiết doanh thu bán hàng hoá, dịch vụ (dành riêng cho Hộ kinh doanh Nhóm 1 có doanh thu dưới 1 tỷ đồng/năm, src/modules/bao-cao/danh-sach.ts:214).
2. Mẫu `S2a-HKD`: Sổ doanh thu bán hàng hoá, dịch vụ (dành cho Hộ kinh doanh Nhóm 2 tính thuế TNCN theo tỷ lệ % trên doanh thu, src/modules/bao-cao/danh-sach.ts:214).
3. Mẫu `S2b-HKD`: Sổ doanh thu bán hàng hoá, dịch vụ (dành cho Hộ kinh doanh tính thuế theo phương pháp lợi nhuận thực tế 15%, 17%, 20%, src/modules/bao-cao/danh-sach.ts:214).
4. Mẫu `S2c-HKD`: Sổ chi tiết chi phí sản xuất, kinh doanh (theo dõi 6 nhóm chi phí: nhân công, mặt bằng, điện nước, nguyên vật liệu, quản lý, lãi vay).
5. Mẫu `S2d-HKD`: Sổ chi tiết vật liệu, dụng cụ, sản phẩm, hàng hoá (theo dõi số lượng và giá trị nhập xuất tồn từng loại nguyên vật liệu, src/modules/bao-cao/danh-sach.ts:115-118).
6. Mẫu `S2e-HKD`: Sổ chi tiết tiền (theo dõi thu, chi và tồn quỹ của từng quỹ tiền mặt hoặc tài khoản ngân hàng, src/modules/bao-cao/danh-sach.ts:78-80).
7. Mẫu `S3a-HKD`: Sổ theo dõi tình hình thực hiện nghĩa vụ thuế với ngân sách nhà nước (thuế GTGT, thuế TNCN, thuế môn bài, lệ phí khác, src/modules/bao-cao/danh-sach.ts:133).

### Trọn bộ 11 mẫu sổ kế toán Doanh nghiệp siêu nhỏ theo Thông tư 58 — Đã có trong bản mẫu
Doanh nghiệp siêu nhỏ áp dụng bộ sổ tinh gọn theo từng trường hợp tính thuế (src/modules/bao-cao/tt58.ts, src/modules/bao-cao/danh-sach.ts:194-210):
1. Mẫu `S1-DNSN`: Sổ doanh thu bán hàng hoá, dịch vụ (áp dụng cho Trường hợp 1: nộp thuế GTGT và TNDN theo % doanh thu, src/modules/bao-cao/danh-sach.ts:209).
2. Mẫu `S2a-DNSN`: Sổ doanh thu bán hàng hoá, dịch vụ (áp dụng cho Trường hợp 2: nộp GTGT theo % doanh thu, TNDN theo thu nhập tính thuế).
3. Mẫu `S2b-DNSN`: Sổ chi phí sản xuất, kinh doanh (tập hợp chi phí được trừ khi tính thuế TNDN, src/modules/bao-cao/danh-sach.ts:150).
4. Mẫu `S2c-DNSN`: Sổ chi tiết vật liệu, dụng cụ, sản phẩm, hàng hoá (src/modules/bao-cao/danh-sach.ts:115).
5. Mẫu `S2d-DNSN`: Sổ chi tiết tiền (src/modules/bao-cao/danh-sach.ts:78).
6. Mẫu `S3a-DNSN`: Sổ doanh thu bán hàng hoá, dịch vụ (áp dụng cho Trường hợp 3 và 4: nộp thuế GTGT theo phương pháp khấu trừ).
7. Mẫu `S3b-DNSN`: Sổ theo dõi nghĩa vụ thuế GTGT (theo dõi số thuế đầu vào được khấu trừ và đầu ra phải nộp, src/modules/bao-cao/danh-sach.ts:132).
8. Mẫu `S4a-DNSN`: Sổ chi tiết công nợ (theo dõi công nợ phải thu của khách hàng và công nợ phải trả cho nhà cung cấp, src/modules/bao-cao/danh-sach.ts:75).
9. Mẫu `S4b-DNSN`: Sổ tài sản cố định (theo dõi nguyên giá và trích khấu hao của máy móc thiết bị, src/modules/bao-cao/danh-sach.ts:134).
10. Mẫu `S4c-DNSN`: Sổ theo dõi nghĩa vụ thuế khác (thuế TNDN, thuế TNCN nộp thay nhân viên, src/modules/bao-cao/danh-sach.ts:133).
11. Mẫu `S4d-DNSN`: Sổ theo dõi vốn chủ sở hữu (theo dõi vốn góp ban đầu và lợi nhuận tích luỹ, src/modules/bao-cao/danh-sach.ts:151).


## 3. Hệ thống Báo cáo thuế

Phân hệ Kê khai thuế quản lý hồ sơ khai thuế định kỳ gửi cơ quan quản lý (src/modules/thue/index.ts:1-43).

### Tờ khai thuế GTGT khấu trừ (6.2.3, Mẫu 01/GTGT) — Đã có trong bản mẫu
- Đối tượng: Doanh nghiệp nộp thuế theo phương pháp khấu trừ (Gói Pro, TT99/TT133, src/modules/thue/ToKhaiGTGT.tsx).
- Khổ in: Khổ A4 đứng, bố cục pháp định khoá cứng không sửa thứ tự dòng (`khoa: true`, src/modules/bao-cao/danh-sach.ts:131).
- Các chỉ tiêu chính:
  + Chỉ tiêu [21]: Không phát sinh hoạt động mua bán trong kỳ.
  + Chỉ tiêu [22]: Thuế GTGT còn được khấu trừ kỳ trước chuyển sang.
  + Chỉ tiêu [23] và [24]: Giá trị và thuế GTGT của hàng hoá, dịch vụ mua vào.
  + Chỉ tiêu [25]: Tổng số thuế GTGT đầu vào được khấu trừ kỳ này.
  + Chỉ tiêu [26], [29], [30], [32]: Doanh thu hàng hoá dịch vụ bán ra theo các mức thuế suất 0%, 5%, 8%, 10%.
  + Chỉ tiêu [34] và [35]: Tổng doanh thu và thuế GTGT đầu ra bán ra.
  + Chỉ tiêu [40]: Thuế GTGT phải nộp trong kỳ (nếu Chỉ tiêu [36] > [25] + [22]).
  + Chỉ tiêu [43]: Thuế GTGT còn được khấu trừ chuyển kỳ sau.

### Tờ khai thuế Hộ kinh doanh (ToKhaiHKD, Mẫu 01/CNKD) — Đã có trong bản mẫu
- Đối tượng: Hộ kinh doanh cá thể nộp thuế theo phương pháp kê khai quy định tại Thông tư 40/2021/TT-BTC và Thông tư 152/2025/TT-BTC (src/modules/thue/ToKhaiHKD.tsx, docs/TONG-KET-LOGIC-STANDARD.md:29).
- Bốn bước kê khai trực quan:
  + Bước 1: Chọn kỳ tính thuế (tháng hoặc quý) và cửa hàng kê khai.
  + Bước 2: Rà soát tổng doanh thu theo từng nhóm ngành nghề kinh doanh (Ăn uống: GTGT 2%, TNCN 1%; Bán lẻ hàng hoá: GTGT 1%, TNCN 0.5%).
  + Bước 3: Tự động tính số thuế GTGT và thuế TNCN phải nộp theo tỷ lệ ngành nghề.
  + Bước 4: Ký số và kết xuất tệp XML nộp Cổng thông tin thuế điện tử.

### Báo cáo bảng kê hoá đơn mua vào và bán ra — Đã có trong bản mẫu
- Bảng kê hoá đơn mua vào (`6.2.1`): Tổng hợp hoá đơn thực phẩm, điện nước, dịch vụ mua vào (src/modules/thue/index.ts:36).
- Bảng kê hoá đơn bán ra (`6.2.2`): Tổng hợp hoá đơn bán hàng xuất cho khách lẻ và khách đặt tiệc (src/modules/thue/index.ts:37).


## 4. Hệ thống 19 Mẫu in chứng từ chuẩn (src/app/mau-in.ts)

Hệ thống cung cấp 19 mẫu in ấn chứng từ kế toán được thiết kế sẵn theo kích thước chuẩn A4 và A5 (src/app/mau-in.ts:82-984).

### Danh mục chi tiết 19 mẫu in chứng từ chuẩn

| STT | Mã mẫu in (id) | Tên mẫu in | Ký hiệu TT58 | Ký hiệu TT133 | Ký hiệu TT99 | Khổ giấy | Hướng in | Nguồn dữ liệu |
|---|---|---|---|---|---|---|---|---|
| 1 | `phieu-thu` | Phiếu thu | 01-TT | 01-TT | 01-TT | A5 | Ngang | Thu tiền mặt |
| 2 | `phieu-chi` | Phiếu chi | 02-TT | 02-TT | 02-TT | A5 | Ngang | Chi tiền mặt |
| 3 | `phieu-thu-nh` | Phiếu thu qua ngân hàng | Không có | Không có | Không có | A5 | Ngang | Thu chuyển khoản |
| 4 | `uy-nhiem-chi` | Uỷ nhiệm chi | Không có | Không có | Không có | A5 | Ngang | Chi chuyển khoản |
| 5 | `phieu-nhap-kho` | Phiếu nhập kho | 01-VT | 01-VT | 01-VT | A4 | Dọc | Mua hàng nhập kho |
| 6 | `phieu-xuat-kho` | Phiếu xuất kho | 02-VT | 02-VT | 02-VT | A4 | Dọc | Xuất dùng, xuất khác |
| 7 | `phieu-xuat-kho-ban` | Phiếu xuất kho bán hàng | 02-VT | 02-VT | 02-VT | A4 | Dọc | Xuất kho bán buôn |
| 8 | `bang-ke-mua-hang` | Bảng kê mua hàng | 04-VT | 04-VT | 04-VT | A4 | Dọc | Mua hàng của dân |
| 9 | `bien-ban-huy` | Biên bản huỷ hàng | Không có | Không có | Không có | A4 | Dọc | Xuất huỷ thực phẩm |
| 10 | `phieu-xk-vcnb` | Phiếu XK kiêm VC nội bộ | Không có | Không có | Không có | A4 | Dọc | Điều chuyển chi nhánh |
| 11 | `bien-ban-kiem-ke` | Biên bản kiểm kê vật tư | 05-VT | 05-VT | 05-VT | A4 | Dọc | Kiểm kê kho định kỳ |
| 12 | `bb-giao-nhan-tscd` | Biên bản giao nhận TSCĐ | 01-TS | 01-TS | 01-TS | A4 | Dọc | Mua sắm máy móc bếp |
| 13 | `bb-thanh-ly-tscd` | Biên bản thanh lý TSCĐ | 02-TS | 02-TS | 02-TS | A4 | Dọc | Bán bỏ thiết bị cũ |
| 14 | `bien-ban-ccdc` | Biên bản điều chuyển CCDC| Không có | Không có | Không có | A4 | Dọc | Điều chuyển bát đĩa |
| 15 | `phieu-ke-toan` | Phiếu kế toán | Không có | Không có | Không có | A5 | Ngang | Bút toán tổng hợp |
| 16 | `bang-ke-ban-hang` | Bảng kê bán hàng ngày | Không có | Không có | Không có | A4 | Dọc | Bảng kê doanh thu POS |
| 17 | `hoa-don-ban-hang` | Hoá đơn bán hàng | Không có | Không có | Không có | A5 | Ngang | Bán hàng trực tiếp |
| 18 | `hoa-don` | Hoá đơn GTGT | Không có | Không có | Không có | A4 | Dọc | Hoá đơn điện tử |
| 19 | `bien-ban-doi-chieu` | Biên bản đối chiếu công nợ| Không có | Không có | Không có | A4 | Dọc | Xác nhận nợ cuối kỳ |

### Quy tắc khối chữ ký theo từng chế độ kế toán — Đã có trong bản mẫu
Hàm `mauChoCheDo` tự động hoán đổi danh sách các ô chữ ký dưới chân chứng từ để phù hợp với pháp lý của từng thông tư (src/app/mau-in.ts:38-61):
1. Chữ ký trên Phiếu thu (`01-TT`) và Phiếu chi (`02-TT`):
   - Theo TT133 và TT99: Gồm 5 chức danh: Giám đốc (Ký, họ tên, đóng dấu), Kế toán trưởng, Thủ quỹ, Người lập phiếu, Người nộp tiền hoặc Người nhận tiền (src/app/mau-in.ts:112-118, 162-168).
   - Theo TT58: Gồm 5 chức danh được tinh gọn theo quy định cho DN siêu nhỏ: Người lập phiếu, Kế toán trưởng, Người đại diện theo pháp luật (Ký, họ tên, đóng dấu), Người nộp/nhận tiền, Thủ quỹ (src/app/mau-in.ts:120-126, 170-176).
   - Dòng ghi tay cuối phiếu: TT133 và TT99 bắt buộc in 3 dòng chữ: "Đã nhận đủ số tiền (viết bằng chữ)", "+ Tỷ giá ngoại tệ", "+ Số tiền quy đổi". Riêng TT58 bỏ 3 dòng này (src/app/mau-in.ts:76-80, 111, 161).
2. Chữ ký trên Phiếu nhập kho (`01-VT`) và Phiếu xuất kho (`02-VT`):
   - Gồm 4 chức danh: Người lập phiếu, Người giao hàng hoặc Người nhận hàng, Thủ kho, Kế toán trưởng (src/app/mau-in.ts:284-297).
3. Chữ ký trên Uỷ nhiệm chi ngân hàng:
   - Gồm 2 chức danh bắt buộc: Kế toán trưởng và Chủ tài khoản (Ký, họ tên, đóng dấu, src/app/mau-in.ts:227-229).

### Quy định in cặp tài khoản Nợ/Có trên mẫu chứng từ — Đã có trong bản mẫu
- Khi đơn vị sử dụng chế độ có Nợ/Có (TT133, TT99), góc trên bên phải của Phiếu thu, Phiếu chi, Phiếu nhập kho, Phiếu xuất kho tự động in khối Nợ: TK... / Có: TK... (src/app/mau-in.ts:130, 299, src/ui/bao-cao/InChungTu.tsx:68).
- Khi đơn vị sử dụng chế độ không dùng Nợ/Có (TT152 hoặc TT58 ở gói Standard), hệ thống tự động ẩn hoàn toàn khối Nợ/Có ở đầu phiếu và ẩn cột số hiệu tài khoản trên bảng chi tiết (src/ui/bao-cao/InChungTu.tsx:126).


## 5. Tuỳ chỉnh báo cáo và Tiện ích thiết kế mẫu in

### Cơ chế tuỳ chỉnh hiển thị báo cáo (ReportPaper) — Đã có trong bản mẫu
Toàn bộ các bảng báo cáo tài chính và sổ sách kế toán trong IACC Cloud được bọc qua lớp xử lý tập trung `ReportPaper` (src/modules/bao-cao/TrungTam.tsx, QD31):
- Lọc dữ liệu linh hoạt: Cho phép lọc theo từng Cửa hàng, theo khoảng thời gian từ ngày đến ngày, lọc theo từng Quỹ tiền, Đối tượng công nợ hoặc Kho hàng (src/modules/bao-cao/danh-sach.ts:13-18).
- Tuỳ chọn ẩn dòng không phát sinh: Tích chọn "Ẩn dòng không phát sinh" để loại bỏ các tài khoản hoặc mặt hàng có số dư đầu, phát sinh và số dư cuối đều bằng 0 (src/modules/bao-cao/danh-sach.ts:57).
- Gom nhóm dữ liệu đa tầng: Hỗ trợ gom nhóm dòng báo cáo theo Nhóm hàng hoá, theo Khách hàng, theo Ngày chứng từ hoặc theo Kho hàng (src/modules/bao-cao/danh-sach.ts:55).
- Cơ chế phân trang mượt mà: Báo cáo có hàng nghìn dòng được chia nhỏ hiển thị mỗi trang 100 dòng trên màn hình giúp chống giật lag, trong khi lệnh In và Xuất tệp Excel vẫn đảm bảo kết xuất trọn vẹn 100% dữ liệu (src/modules/bao-cao/danh-sach.ts:58).

### Tiện ích Thiết kế mẫu in chứng từ (11.11) — Đã có trong bản mẫu
Áp dụng tại màn hình `11.11` thuộc phân hệ Tiện ích bổ sung (src/modules/tien-ich/ThietKeMauIn.tsx:1-350):
- Tuỳ biến thông tin đầu phiếu: Bật tắt hiển thị logo công ty, tên đơn vị, địa chỉ, mã số thuế, số điện thoại nhà hàng.
- Cấu hình các khối nội dung: Sắp xếp thứ tự các khối: Đầu trang, Ký hiệu mẫu số, Tiêu đề phiếu, Thông tin chung, Bảng chi tiết, Dòng tổng cộng, Số tiền viết bằng chữ, Chữ ký và Chân trang (src/app/mau-in.ts:7-8).
- Điều chỉnh kích thước và lề trang: Lựa chọn khổ giấy in A4 hoặc A5, hướng in Dọc hoặc Ngang; căn chỉnh lề Trên, Dưới, Trái, Phải chính xác theo đơn vị milimet (src/app/mau-in.ts:19).
- Tuỳ biến cột trên bảng: Cho phép người dùng đổi tên tiêu đề cột, thay đổi độ rộng cột, ẩn bớt các cột không dùng và gán ký hiệu hàng A, B, 1, 2 theo đúng form mẫu riêng của từng doanh nghiệp (src/app/mau-in.ts:10).
- Lưu trữ cấu hình: Cấu hình mẫu in riêng được lưu trữ theo từng đơn vị kế toán trên bộ nhớ máy (src/app/mau-in.ts:38-40, QD31).
