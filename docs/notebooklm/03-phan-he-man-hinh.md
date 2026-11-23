# 03. Phân hệ và màn hình chức năng — IACC Cloud (iaccdemo)
Bản xuất từ repo iaccdemo commit 98d2bb3, ngày 23/11/2026.

Phạm vi tài liệu: File này mô tả chi tiết toàn bộ các phân hệ và màn hình chức năng trong iaccdemo. Nội dung bao gồm mục đích phân hệ, danh sách màn hình, phân quyền gói thuê bao, luồng thao tác chính và kết nối hệ sinh thái FABi, IVT. Nguyên lý kế toán chung xem ở file 02. Định khoản chi tiết từng loại chứng từ xem ở file 04. Mẫu biểu báo cáo tài chính và mẫu in ấn xem ở file 05.


## 1. Kiến trúc phân hệ và phân quyền theo gói thuê bao

Hệ thống IACC Cloud được tổ chức thành 15 phân hệ chức năng chuyên biệt cho ngành F&B (src/modules/types.ts, tools/xuat_bao_cao_he_thong.py). Hệ thống phân cấp tính năng qua 3 gói thuê bao: Standard (mã `S`), Plus (mã `PL`) và Pro (mã `PR`) (QD80, src/app/plan.ts:5-8).

### Quy tắc hiển thị phân hệ và màn hình theo gói — Đã có trong bản mẫu
Hệ thống sử dụng các bộ lọc phân quyền tại `src/app/plan.ts` và `src/app/registry.ts`:
- Phân hệ chỉ xuất hiện trên thanh điều hướng bên trái khi có ít nhất một màn hình được mở trong gói hiện tại (src/app/registry.ts:201).
- Tính năng ngoài gói thuê bao đang dùng sẽ bị ẩn hoàn toàn khỏi thanh điều hướng và menu chức năng (QD22, src/app/plan.ts:228).
- Gói Standard mở các phân hệ: Trang chủ, Thu chi, Bán hàng, Mua hàng, Kiểm kê (phân hệ Kho đổi tên), Chi phí phân bổ (CCDC), Kê khai thuế, Báo cáo, Danh mục và Hệ thống (docs/TONG-KET-LOGIC-STANDARD.md:26).
- Gói Standard ẩn hoàn toàn các phân hệ: Kế toán tổng hợp, Tiện ích bổ sung, Tài sản cố định và Chi phí giá thành (docs/TONG-KET-LOGIC-STANDARD.md:27).
- Gói Plus mở thêm các nghiệp vụ: Phân bổ CCDC nhiều kỳ, Hoá đơn điện tử, Điều chuyển kho, Hoá đơn mua hàng không qua kho và báo cáo doanh nghiệp siêu nhỏ theo TT58.
- Gói Pro mở đầy đủ 100% tính năng: Kế toán tổng hợp Nợ/Có, Tính giá thành nhiều cấp, Quản lý tài sản cố định đầy đủ và hệ thống báo cáo tài chính pháp định theo TT99/TT133.


## 2. Phân hệ Trang chủ (trang-chu)

Phân hệ Trang chủ cung cấp bức tranh tài chính tức thời cho chủ quán ăn, nhà hàng và nhân sự kế toán (src/modules/home/index.ts:1-23).

### Mục đích nghiệp vụ phân hệ Trang chủ — Đã có trong bản mẫu
- Cho phép chủ đơn vị nắm bắt doanh thu thực tế, chi phí hoạt động, dòng tiền quỹ và tình hình thất thoát kho.
- Cung cấp điểm điều hướng nhanh đến các nghiệp vụ phát sinh hằng ngày.

### Danh sách màn hình chức năng thuộc phân hệ Trang chủ

| Mã màn hình | Tên màn hình | Đường dẫn (slug) | Loại màn hình | Gói áp dụng | Mục đích nghiệp vụ chi tiết |
|---|---|---|---|---|---|
| `11.16` | Tổng quan | `tong-quan` | custom | S, PL, PR | Dashboard chỉ số tài chính, biểu đồ doanh thu và lãi lỗ |
| Không mã | Chi phí hoạt động | `chi-phi-thang` | custom | S | Xem chi tiết các khoản chi phí hoạt động theo từng lý do chi |
| Không mã | Chi phí NVL | `chi-phi-nvl` | custom | S | Xem và cấu hình phương pháp tính chi phí nguyên vật liệu |
| Không mã | Lịch sử thu chi | `lich-su-quy` | custom | S | Xem sổ phụ dòng tiền vào ra theo từng quỹ tiền mặt, ngân hàng |
| Không mã | Bàn làm việc | `ban-lam-viec` | custom | PL, PR | Không gian tác nghiệp dành riêng cho kế toán chuyên nghiệp |

### Luồng thao tác chính trên Trang chủ gói Standard — Đã có trong bản mẫu
1. Chọn Năm và Tháng làm việc trên thanh công cụ đầu trang (src/modules/home/BaBaiToanStandard.tsx, docs/TONG-KET-LOGIC-STANDARD.md:89).
2. Theo dõi khối Kết quả kinh doanh: Lợi nhuận = Doanh thu thuần − Chi phí NVL − Chi phí hoạt động − Chi phí phân bổ (docs/TONG-KET-LOGIC-STANDARD.md:96).
3. Bấm vào dòng "Chi phí hoạt động" để mở màn hình `ChiPhiThang.tsx`, xem danh sách phiếu chi theo từng lý do và xuất dữ liệu ra tệp Excel (docs/TONG-KET-LOGIC-STANDARD.md:135).
4. Bấm vào dòng "Chi phí NVL" để mở màn hình `ChiPhiNvl.tsx`, kiểm tra giá thành định lượng món ăn hoặc nhập giá thành trực tiếp (docs/TONG-KET-LOGIC-STANDARD.md:136).
5. Theo dõi khối Quỹ tiền: Xem cơ cấu tiền mặt, tài khoản ngân hàng; bấm vào từng quỹ để mở màn hình `LichSuQuy.tsx` (docs/TONG-KET-LOGIC-STANDARD.md:137).
6. Theo dõi khối Hao hụt kiểm kê: Nắm bắt số lượng mặt hàng thừa thiếu sau kiểm kê thực tế tại các điểm bán (docs/TONG-KET-LOGIC-STANDARD.md:128-130).


## 3. Phân hệ Danh mục (danh-muc, mod 0)

Phân hệ Danh mục quản lý toàn bộ cơ sở dữ liệu nền tảng cho việc vận hành phần mềm (src/modules/danh-muc/index.ts:1-60).

### Mục đích nghiệp vụ phân hệ Danh mục — Đã có trong bản mẫu
- Khởi tạo danh sách cửa hàng, kho hàng, quỹ tiền, đối tượng khách hàng, nhà cung cấp, nhân viên và các loại hàng hoá.
- Thiết lập hệ thống tài khoản kế toán và bảng quy đổi đơn vị tính trong sơ chế ẩm thực.

### Danh sách màn hình chức năng thuộc phân hệ Danh mục

| Mã màn hình | Tên màn hình | Đường dẫn (slug) | Loại màn hình | Gói áp dụng | Mục đích nghiệp vụ chi tiết |
|---|---|---|---|---|---|
| `1.1` | Hệ thống tài khoản | `1-1` | custom | PR | Quản lý danh mục tài khoản kế toán cấp 1, 2 theo TT99/TT133 |
| `1.2` | Hàng hoá | `1-2` | catalog | S, PL, PR | Danh mục món ăn, đồ uống, nguyên vật liệu, bán thành phẩm |
| Không mã | Nhóm hàng hoá | `nhom-hang-hoa` | catalog | S, PL, PR | Phân nhóm món ăn phục vụ báo cáo và đồng bộ từ FABi POS |
| `1.3` | Đơn vị tính | `1-3` | catalog | S, PL, PR | Danh mục đơn vị tính định lượng: kg, gam, lít, chai, đĩa |
| `1.4` | Quy đổi đơn vị tính | `1-4` | catalog | PL, PR | Tỷ lệ quy đổi giữa đơn vị mua hàng và đơn vị tiêu hao |
| `1.5` | Đối tượng | `1-5` | catalog | S, PL, PR | Quản lý thông tin khách hàng, nhà cung cấp và nhân viên |
| Không mã | Nhóm đối tượng | `nhom-doi-tuong` | catalog | S, PL, PR | Phân loại đối tượng để gán tài khoản công nợ ngầm định |
| `1.6` | Mục chi phí | `1-6` | catalog | S, PL, PR | Danh mục các khoản mục chi phí hoạt động kinh doanh |
| `1.7` | Công việc | `1-7` | catalog | PR | Theo dõi chi phí theo vụ việc, tiệc lớn, hội nghị |
| `1.8` | Kho hàng | `1-8` | catalog | S, PL, PR | Quản lý kho bếp, kho bar, kho tổng, kho bảo quản |
| `1.9` | Tiền tệ | `1-9` | catalog | PR | Danh mục đồng tiền hạch toán và ngoại tệ |
| `1.10` | Tỷ giá | `1-10` | catalog | PR | Quản lý bảng tỷ giá ngoại tệ phục vụ quy đổi |
| `1.11` | Loại thuế | `1-11` | catalog | S, PL, PR | Biểu thuế suất GTGT, tỷ lệ tính thuế theo ngành nghề |
| `1.12` | Quỹ tiền | `1-12` | catalog | S, PL, PR | Quản lý các quỹ tiền mặt cửa hàng và tài khoản ngân hàng |
| `1.14` | Bảng giá | `1-14` | catalog | PR | Thiết lập bảng giá bán theo từng kênh hoặc thời điểm |
| `1.15` | Bút toán tự động | `1-15` | catalog | PR | Cấu hình mẫu định khoản tự động cho chứng từ thường xuyên |
| `1.16` | Lý do nghiệp vụ | `1-16` | catalog | S, PL, PR | Danh mục lý do thu chi tiền dùng cho giao diện không Nợ/Có |
| Không mã | Cửa hàng | `cua-hang` | custom | S, PL, PR | Quản lý điểm bán, gán kho ngầm định và phương pháp NVL |
| Không mã | Công thức món Plus | `cong-thuc` | custom | PL | Cấu hình định lượng tiêu hao nguyên vật liệu cho gói Plus |

### Luồng thao tác chính trên phân hệ Danh mục — Đã có trong bản mẫu
1. Thêm cửa hàng mới từ danh sách điểm bán đã có trên FABi POS qua màn hình `DanhMucCuaHang.tsx` (docs/TONG-KET-LOGIC-STANDARD.md:143).
2. Đồng bộ tự động nhóm món và thực đơn từ FABi POS sang danh mục Hàng hoá (docs/TONG-KET-LOGIC-STANDARD.md:145).
3. Thiết lập liên kết giữa phương thức thanh toán trên POS (Tiền mặt, Chuyển khoản, Thẻ, GrabFood) với Quỹ tiền tương ứng tại màn hình Quỹ tiền `1.12` (docs/TONG-KET-LOGIC-STANDARD.md:148, 167).
4. Khai báo số dư đầu kỳ của các quỹ tiền mặt và tài khoản ngân hàng trực tiếp trên lưới danh mục Quỹ tiền đối với gói Standard (docs/TONG-KET-LOGIC-STANDARD.md:148).


## 4. Phân hệ Thu chi (tien, mod 1)

Phân hệ Thu chi xử lý dòng tiền mặt, giao dịch ngân hàng và quản lý công nợ (src/modules/tien/index.ts:1-68).

### Mục đích nghiệp vụ phân hệ Thu chi — Đã có trong bản mẫu
- Theo dõi toàn bộ dòng tiền vào ra từ hoạt động kinh doanh nhà hàng.
- Đồng bộ tự động các khoản thu chi phát sinh tại quầy thu ngân của máy bán hàng FABi POS.
- Quản lý công nợ khách hàng và nhà cung cấp thông qua đối chiếu công nợ.

### Danh sách màn hình chức năng thuộc phân hệ Thu chi

| Mã màn hình | Tên màn hình | Đường dẫn (slug) | Loại màn hình | Gói áp dụng | Mục đích nghiệp vụ chi tiết |
|---|---|---|---|---|---|
| `2.1.1` | Phiếu thu, chi tiền | `2-1-1` | voucher | S, PL, PR | Lập và quản lý phiếu thu chi tiền mặt, ngân hàng, chuyển quỹ |
| `2.1.2` | Đối chiếu công nợ | `2-1-2` | voucher | S, PL, PR | Lập biên bản đối soát số dư công nợ định kỳ với đối tác |
| `2.1.3` | Phân bổ chi phí chuỗi | `2-1-3` | tool | PR | Phân bổ chi phí văn phòng tổng cho các chi nhánh cửa hàng |
| `2.2.1` | Sổ quỹ tiền mặt | `2-2-1` | custom/report| S, PL, PR | Báo cáo chi tiết thu chi và tồn quỹ tiền mặt từng ngày |
| `2.2.3` | Sổ tiền gửi ngân hàng | `2-2-3` | report | S, PL, PR | Sổ theo dõi giao dịch và số dư từng tài khoản ngân hàng |
| `2.2.4` | Sổ nhật ký chung | `2-2-4` | report | PR | Sổ kế toán ghi nhận nghiệp vụ tài chính theo trình tự thời gian |
| `2.2.5` | Sổ công nợ | `2-2-5` | report | S, PL, PR | Tổng hợp tình hình công nợ phải thu, phải trả theo đối tượng |
| `2.2.6` | Sổ chi tiết tiền vay | `2-2-6` | report | PR | Theo dõi các khoản vay ngân hàng và vay cá nhân |
| `2.2.7` | Sổ chi tiết tiền | `2-2-7` | report | S, PL, PR | Mẫu sổ tiền chuyên dụng theo TT58 (S2d-DNSN) và TT152 (S2e-HKD) |
| `2.2.8` | Tổng hợp quỹ tiền | `2-2-8` | report | S, PL, PR | Báo cáo cơ cấu số dư của toàn bộ hệ thống quỹ tiền |
| `2.2.9` | Báo cáo dòng tiền | `2-2-9` | report | PL, PR | Báo cáo lưu chuyển tiền tệ quản trị theo mô hình trực tiếp |

### Luồng thao tác chính trên phân hệ Thu chi — Đã có trong bản mẫu
1. Lập phiếu thu chi tiền mặt: Chọn tab Tiền mặt, bấm nút "Thu tiền" hoặc "Chi tiền", chọn Quỹ tiền mặt, Lý do nghiệp vụ, Đối tượng và Số tiền (docs/TONG-KET-LOGIC-STANDARD.md:157-160).
2. Lập uỷ nhiệm chi ngân hàng: Chọn tab Ngân hàng, bấm nút "Chi tiền", chọn Tài khoản ngân hàng chi, Tài khoản nhận của đối tác và Nội dung thanh toán.
3. Chuyển tiền giữa các quỹ: Chọn tab Chuyển quỹ, lập phiếu chuyển tiền từ quỹ tiền mặt cửa hàng nộp vào tài khoản ngân hàng công ty (src/modules/tien/index.ts:43-45).
4. Nhận dữ liệu tự động từ FABi: Khi thu ngân tạo phiếu chi mua đá, chi mua rau lẻ trên máy POS FABi, hệ thống tự động sinh phiếu chi tương ứng tại màn hình `2.1.1` (src/modules/tien/dong-bo-fabi.ts, docs/TONG-KET-LOGIC-STANDARD.md:163).


## 5. Phân hệ Kế toán bán hàng (ban-hang, mod 2)

Phân hệ Kế toán bán hàng xử lý toàn bộ luồng doanh thu từ hệ thống máy bán hàng POS FABi và bán hàng trực tiếp (src/modules/ban-hang/index.ts:1-60).

### Mục đích nghiệp vụ phân hệ Kế toán bán hàng — Đã có trong bản mẫu
- Tiếp nhận dữ liệu hoá đơn bán hàng từ POS FABi theo thời gian thực hoặc chốt sổ cuối ngày.
- Quản lý bán hàng đặt tiệc, suất ăn công ty ngoài máy POS.
- Xử lý các giao dịch điều chuyển bán hàng nội bộ giữa các chi nhánh nhà hàng.
- Tự động xuất kho nguyên vật liệu theo định lượng món ăn đã bán (QD112).

### Danh sách màn hình chức năng thuộc phân hệ Kế toán bán hàng

| Mã màn hình | Tên màn hình | Đường dẫn (slug) | Loại màn hình | Gói áp dụng | Mục đích nghiệp vụ chi tiết |
|---|---|---|---|---|---|
| `3.1.1` | Xuất bán POS | `3-1-1` | custom | S, PL, PR | Nhận và quản lý chứng từ bán lẻ đổ về tự động từ máy POS FABi |
| `5.1.2` | Xuất kho định lượng | `5-1-2` | custom | PL, PR | Xuất kho tiêu hao NVL tự động theo công thức món bán (QD112) |
| `3.1.7` | Bán hàng | `3-1-7` | voucher | PL, PR | Lập chứng từ bán tiệc, bán suất ăn hội nghị ngoài máy POS |
| `3.1.2` | Hoá đơn bán hàng | `3-1-2` | voucher | PR | Lập hoá đơn thương mại kiêm phiếu xuất hàng |
| `3.1.3` | Bán hàng nội bộ | `3-1-3` | voucher | PR | Bán nguyên liệu sơ chế cho chi nhánh khác, tự sinh phiếu mua |
| `3.1.4` | Hàng bán trả lại | `3-1-4` | voucher | PL, PR | Tiếp nhận món ăn bị khách trả lại, hạch toán giảm trừ doanh thu |
| `3.2.1` | Báo cáo bán hàng | `3-2-1` | report | PL, PR | Báo cáo tổng hợp số lượng và doanh số theo nhóm món ăn |
| `3.2.2` | Đối soát với POS | `3-2-2` | custom | PL, PR | Đối chiếu chênh lệch doanh thu giữa POS FABi và kế toán |
| `3.2.3` | Báo cáo doanh thu | `3-2-3` | report | PL, PR | Báo cáo phân tích doanh thu theo thuế suất và phương thức thu |
| `3.2.5` | Sổ doanh thu bán hàng | `3-2-5` | report | S, PL, PR | Sổ chi tiết doanh thu theo TT152 (S2a-HKD) hoặc TT58 (S1-DNSN) |
| `3.2.6` | Bán hàng theo ngày | `3-2-6` | report | PL, PR | Báo cáo tiến độ doanh số từng ngày trong tháng |
| `3.2.7` | Tổng hợp bán hàng | `3-2-7` | report | S, PL, PR | Tổng hợp số lượng, doanh thu, giảm giá theo từng món ăn |
| `3.2.8` | Bảng kê chi tiết bán hàng | `3-2-8` | report | S, PL, PR | Chi tiết từng dòng món ăn bán ra trên từng hoá đơn |
| `3.2.9` | Công nợ khách hàng | `3-2-9` | report | PL, PR | Quản lý tình hình công nợ phải thu của khách hàng theo iFaster |

### Luồng thao tác chính trên phân hệ Kế toán bán hàng — Đã có trong bản mẫu
1. Kiểm tra chứng từ Xuất bán POS `3.1.1`: Chứng từ tự động đổ về từ FABi, hệ thống tự động kiểm tra số tiền khớp với doanh thu ngày của cửa hàng (docs/TONG-KET-LOGIC-STANDARD.md:176-179).
2. Lập chứng từ bán tiệc công ty `3.1.7`: Nhập thông tin khách hàng doanh nghiệp, chọn danh sách món ăn, đơn giá thoả thuận và phương thức thanh toán trả ngay hoặc nợ (src/modules/ban-hang/ChungTuBanHang.tsx:40-55).
3. Chuyển đổi bán hàng nội bộ `3.1.3`: Cửa hàng trung tâm lập phiếu xuất bán nước cốt phở cho cửa hàng chi nhánh; hệ thống tự động sinh phiếu mua hàng tại cửa hàng chi nhánh đó (src/modules/ban-hang/index.ts:48-49).
4. Chạy xuất kho định lượng `5.1.2`: Sau khi đơn hàng hoàn tất, hệ thống tự động trừ kho nguyên liệu thịt bò, bánh phở, rau thơm theo định mức đã cấu hình (src/modules/kho/XuatDinhLuong.tsx, QD112).


## 6. Phân hệ Kế toán mua hàng (mua-hang, mod 3)

Phân hệ Mua hàng quản lý quy trình nhập mua nguyên vật liệu, hàng hoá, chi phí mua và công nợ nhà cung cấp (src/modules/mua-hang/index.ts:1-43).

### Mục đích nghiệp vụ phân hệ Kế toán mua hàng — Đã có trong bản mẫu
- Ghi nhận đầy đủ nguồn gốc thực phẩm đầu vào phục vụ công tác kiểm soát an toàn và tính toán giá thành.
- Quản lý chi tiết công nợ phải trả cho các nhà cung cấp thực phẩm, đồ uống.
- Phân bổ chi phí vận chuyển, bốc xếp vào giá trị nhập kho của lô hàng.

### Danh sách màn hình chức năng thuộc phân hệ Kế toán mua hàng

| Mã màn hình | Tên màn hình | Đường dẫn (slug) | Loại màn hình | Gói áp dụng | Mục đích nghiệp vụ chi tiết |
|---|---|---|---|---|---|
| `4.1.1` | Phiếu mua hàng | `4-1-1` | voucher | S, PL, PR | Nhập kho nguyên vật liệu, thực phẩm từ nhà cung cấp |
| `4.1.2` | Hoá đơn mua hàng | `4-1-2` | voucher | PL, PR | Mua hàng không qua kho (chi phí dịch vụ ăn uống, sửa chữa) |
| `4.1.3` | Mua hàng qua sơ chế | `4-1-3` | voucher | PR | Mua thực phẩm tươi sống đưa thẳng vào sơ chế |
| `4.1.4` | Trả lại hàng cho NCC | `4-1-4` | voucher | PL, PR | Xuất trả thực phẩm ôi thiu, không đạt chất lượng cam kết |
| `4.1.5` | Bổ sung chi phí mua hàng | `4-1-5` | voucher | PR | Phân bổ cước xe đông lạnh, bốc dỡ vào giá gốc lô thực phẩm |
| `4.1.6` | Bổ sung hoá đơn | `4-1-6` | voucher | PR | Ghép hoá đơn thuế GTGT vào các phiếu mua hàng chưa có hoá đơn |
| `4.2.1` | Chi tiết mua hàng | `4-2-1` | report | S, PL, PR | Báo cáo chi tiết từng lần mua theo từng nhà cung cấp |
| `4.2.2` | Tổng hợp mua hàng theo NCC| `4-2-2` | report | PL, PR | Tổng hợp giá trị hàng mua và thuế theo từng đối tượng người bán |
| `4.2.3` | Công nợ nhà cung cấp | `4-2-3` | report | S, PL, PR | Báo cáo công nợ nhà cung cấp: Nợ đầu + Mua − Trả − Trả tiền = Nợ cuối |
| `4.2.4` | Tổng hợp nhập kho | `4-2-4` | report | S, PL, PR | Báo cáo tổng hợp số lượng và giá trị nhập theo nhóm hàng |
| `4.2.5` | Chi tiết nhập kho | `4-2-5` | report | S, PL, PR | Xem chi tiết từng mặt hàng nhập kho qua các phiếu mua |
| `4.2.6` | Mua hàng theo ngày | `4-2-6` | report | PL, PR | Báo cáo theo dõi biến động mua sắm thực phẩm theo ngày |
| `4.2.7` | Bảng kê chi tiết mua hàng | `4-2-7` | report | S, PL, PR | Bảng kê chi tiết hàng hoá, số lượng, đơn giá từng phiếu mua |

### Luồng thao tác chính trên phân hệ Kế toán mua hàng — Đã có trong bản mẫu
1. Lập Phiếu mua hàng `4.1.1`: Chọn Nhà cung cấp, Kho nhập (Kho bếp, Kho bar), Ngày chứng từ, sau đó thêm các mặt hàng thịt bò, rau củ, gia vị (docs/TONG-KET-LOGIC-STANDARD.md:185-189).
2. Thanh toán trực tiếp tại phiếu mua: Tích chọn "Đã thanh toán", chọn Quỹ tiền mặt hoặc Tài khoản ngân hàng; khi lưu phiếu, hệ thống tự động tạo phiếu chi tiền mặt hoặc uỷ nhiệm chi tương ứng (docs/TONG-KET-LOGIC-STANDARD.md:186).
3. Thanh toán công nợ nhà cung cấp sau: Tại màn hình Công nợ nhà cung cấp `4.2.3`, bấm nút "Thanh toán ngay" để mở sẵn phiếu chi với đúng số tiền công nợ còn phải trả (docs/TONG-KET-LOGIC-STANDARD.md:192).


## 7. Phân hệ Kho hàng (kho, mod 4)

Phân hệ Kho hàng quản lý biến động vật tư, kiểm kê, điều chuyển nội bộ và quy trình chế biến ẩm thực theo chuẩn iPOS Inventory (src/modules/kho/index.ts:1-133).

### Mục đích nghiệp vụ phân hệ Kho hàng — Đã có trong bản mẫu
- Theo dõi xuất nhập tồn kho nguyên vật liệu, bán thành phẩm và hàng hoá.
- Quản lý định mức công thức chế biến món ăn và sơ chế thực phẩm.
- Kiểm soát hao hụt qua công tác kiểm kê định kỳ và xử lý chênh lệch tồn kho.

### Danh sách màn hình chức năng thuộc phân hệ Kho hàng

| Mã màn hình | Tên màn hình | Đường dẫn (slug) | Loại màn hình | Gói áp dụng | Mục đích nghiệp vụ chi tiết |
|---|---|---|---|---|---|
| `5.1.1` | Nhập khác | `5-1-1` | voucher | S, PL, PR | Nhập kho thu hồi, hàng khuyến mãi nhận được không qua mua |
| `5.1.2-2` | Xuất bán hàng | `5-1-2-2` | voucher | PR | Xuất kho bán buôn hàng hoá đóng chai, đóng gói |
| `5.1.2-3` | Xuất huỷ | `5-1-2-3` | voucher | S, PL, PR | Xuất huỷ thực phẩm hỏng, hết hạn sử dụng, rơi vỡ |
| `5.1.2-4` | Xuất khác | `5-1-2-4` | voucher | S, PL, PR | Xuất nguyên liệu làm mẫu thử, dùng thử, liên hoan nội bộ |
| `5.1.4` | Xuất điều chuyển | `5-1-4` | custom | PL, PR | Xuất hàng từ kho này chuyển sang kho khác |
| `5.1.4-2` | Nhập điều chuyển | `5-1-4-2` | custom | PL, PR | Nhận hàng do kho khác điều chuyển đến |
| `5.1.4-3` | Xuất chuyển kho | `5-1-4-3` | custom | PR | Chuyển kho tức thời trong cùng một điểm bán |
| `5.1.6` | Xuất sơ chế | `5-1-6` | custom | PR | Xuất thực phẩm thô để nhân viên bếp sơ chế làm sạch |
| `5.1.6-2` | Nhập sơ chế | `5-1-6-2` | custom | PR | Nhập kho thực phẩm sau khi đã sơ chế (thịt cắt lát, tôm bóc vỏ) |
| `5.1.5` | Công thức sơ chế | `5-1-5` | catalog | PR | Thiết lập tỷ lệ hao hụt và định mức sơ chế |
| `5.1.3` | Xuất chế biến | `5-1-3` | custom | PR | Xuất nguyên liệu đưa vào nấu nướng bán thành phẩm |
| `5.1.3-2` | Nhập chế biến | `5-1-3-2` | custom | PR | Nhập kho bán thành phẩm: nồi nước dùng, mẻ sốt |
| `9.1.3` | Công thức chế biến | `9-1-3` | custom | PR | Định mức nguyên vật liệu cho từng món ăn hoàn chỉnh |
| `5.1.7` | Tính giá vốn | `5-1-7` | custom | PL, PR | Chạy tính đơn giá vốn bình quân tháng cho hàng xuất kho |
| `5.1.8` | Giá thành đơn giản | `5-1-8` | tool | PR | Tính giá thành cho cơ sở chế biến quy mô nhỏ |
| `5.1.10` | Kiểm kê số lượng | `5-1-10` | voucher | S, PL, PR | Lập biên bản kiểm kê kho thực tế theo từng kho hàng |
| Không mã | Xuất nhập điều chỉnh | `dieu-chinh` | voucher | S, PL, PR | Các phiếu xuất nhập điều chỉnh tự sinh sau khi kiểm kê kho |
| `5.1.11` | Bổ sung giá nhập | `5-1-11` | voucher | PR | Cập nhật bổ sung đơn giá nhập kho cho các phiếu tạm tính |
| `5.1.12` | Tồn kho ban đầu | `5-1-12` | custom | PL, PR | Khai báo số lượng và giá trị tồn kho tại ngày bắt đầu dùng app |
| `5.1.13` | Định mức tồn | `5-1-13` | catalog | PR | Thiết lập ngưỡng tồn tối thiểu, tối đa để cảnh báo đặt hàng |
| `5.2.1` | Thẻ kho | `5-2-1` | report | S, PL, PR | Báo cáo chi tiết số lượng nhập xuất tồn của từng mặt hàng |
| `5.2.3` | Báo cáo xuất nhập tồn | `5-2-3` | report | S, PL, PR | Tổng hợp tồn đầu, nhập, xuất và tồn cuối của toàn bộ kho |
| `5.2.9` | Tổng hợp nhập kho | `5-2-9` | report | S, PL, PR | Báo cáo tổng hợp số lượng và giá trị nhập kho theo nguồn |
| `5.2.10` | Chi tiết nhập kho | `5-2-10` | report | S, PL, PR | Chi tiết từng giao dịch nhập kho |
| `5.2.11` | Tổng hợp xuất kho | `5-2-11` | report | PL, PR | Báo cáo tổng hợp xuất kho theo các mục đích sử dụng |
| `5.2.12` | Chi tiết xuất kho | `5-2-12` | report | PL, PR | Báo cáo chi tiết các dòng nguyên vật liệu xuất kho |
| `5.2.15` | Báo cáo kiểm kê | `5-2-15` | report | S, PL, PR | Báo cáo tổng hợp số lượng chênh lệch thừa thiếu sau kiểm kê |


## 8. Phân hệ Kê khai thuế (thue, mod 5)

Phân hệ Kê khai thuế hỗ trợ lập tờ khai thuế GTGT và nghĩa vụ thuế cho hộ kinh doanh và doanh nghiệp (src/modules/thue/index.ts:1-43).

### Mục đích nghiệp vụ phân hệ Kê khai thuế — Đã có trong bản mẫu
- Quản lý hoá đơn chứng từ đầu vào và đầu ra phục vụ kê khai thuế.
- Lập bảng kê mua vào, bảng kê bán ra và tự động kết xuất tờ khai thuế điện tử.
- Theo dõi tình hình thực hiện nghĩa vụ nộp ngân sách nhà nước.

### Danh sách màn hình chức năng thuộc phân hệ Kê khai thuế

| Mã màn hình | Tên màn hình | Đường dẫn (slug) | Loại màn hình | Gói áp dụng | Mục đích nghiệp vụ chi tiết |
|---|---|---|---|---|---|
| Không mã | Tờ khai thuế HKD | `to-khai` | custom | S, PL | Lập tờ khai thuế định kỳ cho hộ kinh doanh theo mẫu 01/CNKD |
| `6.1.1` | Kê khai mua vào | `6-1-1` | voucher | PL, PR | Quản lý bảng kê các hoá đơn giá trị gia tăng mua vào |
| `6.1.2` | Kê khai bán ra | `6-1-2` | voucher | PL, PR | Quản lý bảng kê các hoá đơn giá trị gia tăng bán ra |
| `6.2.1` | Bảng kê mua vào | `6-2-1` | report | PL, PR | Báo cáo bảng kê hoá đơn, chứng từ hàng hoá dịch vụ mua vào |
| `6.2.2` | Bảng kê bán ra | `6-2-2` | report | PL, PR | Báo cáo bảng kê hoá đơn, chứng từ hàng hoá dịch vụ bán ra |
| `6.2.3` | Tờ khai thuế GTGT | `6-2-3` | custom | PR | Lập tờ khai thuế GTGT mẫu 01/GTGT cho doanh nghiệp khấu trừ |
| `6.2.4` | Sổ nghĩa vụ thuế GTGT | `6-2-4` | report | PL, PR | Sổ theo dõi nghĩa vụ thuế GTGT theo mẫu S3b-DNSN (TT58) |
| `6.2.5` | Sổ nghĩa vụ thuế khác | `6-2-5` | report | S, PL, PR | Sổ theo dõi thuế TNCN, môn bài theo S3a-HKD hoặc S4c-DNSN |


## 9. Phân hệ Hoá đơn điện tử (hoa-don)

Phân hệ Hoá đơn điện tử quản lý vòng đời hoá đơn điện tử xuất cho khách hàng ẩm thực (src/modules/hoa-don/index.ts:1-15, QD106).

### Mục đích nghiệp vụ phân hệ Hoá đơn điện tử — Đã có trong bản mẫu
- Quản lý danh sách hoá đơn điện tử đã phát hành từ máy tính tiền hoặc từ kế toán.
- Lập hoá đơn điều chỉnh, hoá đơn thay thế khi phát hiện sai sót thông tin khách hàng hoặc tiền thuế.
- Gửi thông báo hoá đơn điện tử có sai sót (Mẫu 04/SS-HĐĐT) đến Cơ quan thuế.

### Danh sách màn hình chức năng thuộc phân hệ Hoá đơn điện tử

| Tên màn hình | Đường dẫn (slug) | Loại màn hình | Gói áp dụng | Mục đích nghiệp vụ chi tiết |
|---|---|---|---|---|
| Hoá đơn điện tử | `hddt` | custom | PL, PR | Danh sách hoá đơn điện tử đã phát hành, tra cứu mã cơ quan thuế |
| Điều chỉnh thay thế | `dieu-chinh` | custom | PL, PR | Lập cặp hoá đơn điều chỉnh tăng giảm hoặc hoá đơn thay thế |
| Thông báo sai sót | `sai-sot` | custom | PL, PR | Lập và truyền thông báo Mẫu 04/SS-HĐĐT sang hệ thống Thuế |


## 10. Phân hệ Tài sản cố định (tscd, mod 6)

Phân hệ Tài sản cố định theo dõi các thiết bị bếp, máy móc pha chế, cơ sở vật chất có giá trị lớn (src/modules/tscd/index.ts:1-70).

### Mục đích nghiệp vụ phân hệ Tài sản cố định — Đã có trong bản mẫu
- Ghi tăng nguyên giá và quản lý hồ sơ kỹ thuật của tài sản cố định trong nhà hàng.
- Trích khấu hao định kỳ theo phương pháp đường thẳng vào chi phí từng cửa hàng.
- Theo dõi quá trình điều chuyển thiết bị giữa các chi nhánh, thanh lý thiết bị cũ hỏng.

### Danh sách màn hình chức năng thuộc phân hệ Tài sản cố định

| Mã màn hình | Tên màn hình | Đường dẫn (slug) | Loại màn hình | Gói áp dụng | Mục đích nghiệp vụ chi tiết |
|---|---|---|---|---|---|
| `7.1.1` | Danh sách TSCĐ | `7-1-1` | catalog | PR | Danh sách tài sản, theo dõi nguyên giá, hao mòn luỹ kế và giá trị còn lại |
| `7.1.2` | Tăng, giảm TSCĐ | `7-1-2` | voucher | PR | Lập chứng từ ghi tăng, điều chuyển, ngừng trích khấu hao và thanh lý TSCĐ |
| `7.1.3` | Tính khấu hao | `7-1-3` | tool | PR | Tiện ích tự động tính khấu hao tháng và sinh bút toán chi phí |
| `7.2.1` | Sổ tài sản cố định | `7-2-1` | report | PL, PR | Sổ theo dõi tài sản theo mẫu S4b-DNSN (TT58) hoặc S21-DN (TT99) |
| `7.2.2` | Báo cáo tăng giảm TSCĐ | `7-2-2` | report | PR | Tổng hợp biến động tăng giảm nguyên giá và hao mòn trong kỳ |
| `7.2.3` | Thẻ tài sản cố định | `7-2-3` | report | PR | Thẻ theo dõi chi tiết từng tài sản cố định từ lúc mua đến thanh lý |
| `7.2.4` | Sổ theo dõi tại nơi dùng | `7-2-4` | report | PR | Sổ theo dõi hiện vật máy móc đặt tại từng bếp nhà hàng |
| `1.13` | Danh mục TSCĐ | `1-13` | catalog | PR | Danh mục quản lý thông tin khai báo ban đầu của tài sản |


## 11. Phân hệ Chi phí phân bổ và Công cụ dụng cụ (ccdc, mod 7)

Phân hệ CCDC quản lý vật dụng phục vụ ăn uống (bát đĩa, xoong chảo) và các khoản chi phí trả trước dài hạn (src/modules/ccdc/index.ts:1-142).

### Mục đích nghiệp vụ phân hệ CCDC — Đã có trong bản mẫu
- Quản lý các khoản chi tiền một lần nhưng dùng nhiều tháng: Tiền thuê mặt bằng, tiền bản quyền phần mềm, chi phí sửa chữa quán.
- Theo dõi số lượng công cụ dụng cụ đang dùng tại các khu vực bếp, quầy bar, bàn ăn.
- Tự động tính số tiền trích phân bổ hàng tháng đưa vào chi phí hoạt động.

### Danh sách màn hình chức năng thuộc phân hệ CCDC

| Mã màn hình | Tên màn hình | Đường dẫn (slug) | Loại màn hình | Gói áp dụng | Mục đích nghiệp vụ chi tiết |
|---|---|---|---|---|---|
| `8.1.1` | Quản lý chi phí phân bổ | `8-1-1` | custom | S, PL, PR | Quản lý danh sách thẻ phân bổ chi phí trả trước và CCDC |
| `8.1.2` | Tăng, giảm CCDC | `8-1-2` | voucher | PR | Chứng từ điều chuyển công cụ giữa các quán hoặc ghi giảm đồ vỡ |
| `8.1.3` | Kiểm kê CCDC | `8-1-3` | voucher | PR | Kiểm kê số lượng bát đĩa, ly tách thực tế tại nhà hàng |
| `8.2.1` | Chi tiết chi phí trả trước | `8-2-1` | report | PL, PR | Báo cáo tiến độ phân bổ chi phí thuê mặt bằng, bảo hiểm |
| `8.2.2` | Bảng kê chi tiết CCDC | `8-2-2` | report | PL, PR | Danh sách chi tiết các công cụ dụng cụ đang sử dụng |
| `8.2.3` | Bảng phân bổ CCDC | `8-2-3` | report | PL, PR | Bảng phân bổ chi phí công cụ dụng cụ trong từng tháng |
| `8.2.4` | Báo cáo tăng giảm CCDC | `8-2-4` | report | PL, PR | Theo dõi biến động nhập mới, hư hỏng, đền bù công cụ dụng cụ |


## 12. Phân hệ Chi phí, giá thành (gia-thanh, mod 8)

Phân hệ Chi phí giá thành dành cho các bếp trung tâm và chuỗi nhà hàng tự sản xuất (src/modules/gia-thanh/index.ts:1-52).

### Mục đích nghiệp vụ phân hệ Chi phí giá thành — Đã có trong bản mẫu
- Tập hợp toàn bộ chi phí sản xuất: Nguyên vật liệu trực tiếp, nhân công bếp, chi phí khấu hao máy móc bếp, điện nước gas.
- Phân bổ chi phí sản xuất chung cho các loại bán thành phẩm và món ăn theo các tiêu thức khoa học.
- Tính toán giá thành một đơn vị sản phẩm chế biến, làm cơ sở kiểm soát định mức giá vốn.

### Danh sách màn hình chức năng thuộc phân hệ Chi phí giá thành

| Mã màn hình | Tên màn hình | Đường dẫn (slug) | Loại màn hình | Gói áp dụng | Mục đích nghiệp vụ chi tiết |
|---|---|---|---|---|---|
| `9.1.1` | Phân bổ chi phí | `9-1-1` | tool | PR | Tiện ích phân bổ chi phí chung bếp cho từng món ăn chế biến |
| `9.1.2` | Tính giá thành | `9-1-2` | tool | PR | Tiện ích tính giá thành theo quy trình nhiều cấp từ sơ chế đến món |
| `9.2.1` | Tổng hợp chi phí phát sinh | `9-2-1` | report | PR | Sổ tổng hợp chi phí sản xuất theo khoản mục và theo từng cửa hàng |
| `9.2.2` | Báo cáo giá thành sản phẩm | `9-2-2` | report | PR | Báo cáo giá thành chi tiết từng món ăn: NVL, nhân công, chi phí chung |


## 13. Phân hệ Kế toán tổng hợp (tong-hop, mod 9)

Phân hệ Kế toán tổng hợp là trung tâm xử lý số liệu cuối kỳ và lập báo cáo tài chính pháp định (src/modules/tong-hop/index.ts:1-44).

### Mục đích nghiệp vụ phân hệ Kế toán tổng hợp — Đã có trong bản mẫu
- Lập các bút toán kế toán tổng hợp, phân bổ doanh thu nhận trước (bán thẻ thành viên, bán voucher).
- Khai báo và quản lý số dư đầu kỳ của hệ thống tài khoản.
- Thực hiện rà soát số liệu, kết chuyển kết quả kinh doanh và khoá sổ kế toán.
- Kết xuất toàn bộ hệ thống Báo cáo tài chính pháp định phục vụ nộp cơ quan chức năng.

### Danh sách màn hình chức năng thuộc phân hệ Kế toán tổng hợp

| Mã màn hình | Tên màn hình | Đường dẫn (slug) | Loại màn hình | Gói áp dụng | Mục đích nghiệp vụ chi tiết |
|---|---|---|---|---|---|
| `10.1.1` | Chứng từ tổng hợp | `10-1-1` | voucher | PR | Lập các bút toán kế toán tổng hợp, điều chỉnh ngoài các phân hệ |
| `10.1.2` | Doanh thu trả trước | `10-1-2` | tool | PR | Phân bổ doanh thu từ thẻ nạp trả trước, voucher ăn uống |
| `10.1.3` | Số dư ban đầu | `10-1-3` | custom | PL, PR | Nhập số dư đầu kỳ của tài khoản, công nợ và tồn kho |
| `10.1.4` | Kiểm tra cuối kỳ | `10-1-4` | custom | PR | Quét 7 tiêu chí kiểm tra dữ liệu trước khi khoá sổ |
| `10.1.5` | Kết chuyển cuối kỳ | `10-1-5` | tool | PR | Tự động sinh bút toán kết chuyển doanh thu, chi phí sang 911 và 421 |
| `10.1.6` | Khoá sổ | `10-1-6` | custom | PR | Chốt dữ liệu kỳ kế toán, ngăn chặn sửa xoá chứng từ cũ |
| `10.1.7` | Kế hoạch tài chính | `10-1-7` | tool | PR | Lập dự toán ngân sách doanh thu và chi phí cho năm kế hoạch |
| `10.1.8` | Kế hoạch sản xuất | `10-1-8` | tool | PR | Dự báo nhu cầu chế biến bán thành phẩm theo tuần |
| `10.1.9` | Kết chuyển số dư | `10-1-9` | tool | PR | Chuyển toàn bộ số dư cuối năm sang năm tài chính tiếp theo |
| `10.2.1` | Cân đối phát sinh | `10-2-1` | custom | PR | Bảng cân đối số phát sinh tài khoản theo TT99 hoặc TT133 |
| `10.2.2` | Báo cáo tình hình tài chính | `10-2-2` | custom | PL, PR | Bảng cân đối kế toán theo quy chuẩn pháp định |
| `10.2.3` | Kết quả kinh doanh | `10-2-3` | custom | S, PL, PR | Báo cáo kết quả hoạt động kinh doanh (KQKD) |
| `10.2.4` | Lưu chuyển tiền tệ | `10-2-4` | custom | PR | Báo cáo lưu chuyển tiền tệ theo phương pháp trực tiếp |
| `10.2.5` | Thuyết minh BCTC | `10-2-5` | report | PR | Thuyết minh báo cáo tài chính theo quy định |
| `10.3.1` | Báo cáo quản trị | `10-3-1` | custom | PR | Báo cáo phân tích hiệu quả tài chính đa chiều cho ban giám đốc |
| `10.4.1` | Sổ chi tiết doanh thu, chi phí | `10-4-1` | report | PL, PR | Sổ chi tiết DT-CP theo mẫu S2b-DNSN (TT58) hoặc S2c-HKD (TT152) |
| `10.4.2` | Sổ vốn chủ sở hữu | `10-4-2` | report | PL, PR | Sổ theo dõi biến động nguồn vốn theo mẫu S4d-DNSN |
| `10.4.3` | Sổ chi phí | `10-4-3` | report | S, PL, PR | Báo cáo chi tiết các khoản chi phí hoạt động theo danh mục |


## 14. Phân hệ Tiện ích bổ sung (tien-ich, mod 10)

Phân hệ Tiện ích bổ sung tích hợp các công nghệ tự động hoá và kết nối đa nền tảng (src/modules/tien-ich/index.ts:1-46).

### Mục đích nghiệp vụ phân hệ Tiện ích bổ sung — Đã có trong bản mẫu
- Tự động hoá nhập liệu từ hệ sinh thái F&B và hoá đơn điện tử đầu vào.
- Cung cấp công cụ kiểm soát rủi ro thông qua quy trình xét duyệt chứng từ nhiều cấp và hệ thống cảnh báo sớm.
- Hỗ trợ tuỳ biến mẫu biểu báo cáo và mẫu in chứng từ phù hợp với từng thương hiệu.

### Danh sách màn hình chức năng thuộc phân hệ Tiện ích bổ sung

| Mã màn hình | Tên màn hình | Đường dẫn (slug) | Loại màn hình | Gói áp dụng | Mục đích nghiệp vụ chi tiết |
|---|---|---|---|---|---|
| `11.1` | Tự động đồng bộ bán hàng | `11-1` | custom | PR | Đồng bộ giao dịch bán hàng từ POS FABi theo thời gian thực |
| `11.2` | Xuất kho theo định lượng | `11-2` | tool | PR | Tiện ích tự động chạy xuất kho tiêu hao NVL theo mẻ đơn hàng |
| `11.3` | Tự động đồng bộ kho | `11-3` | tool | PL, PR | Lấy phiếu xuất nhập điều chuyển từ phần mềm iPOS Inventory |
| `11.4` | Nhận hoá đơn đầu vào | `11-4` | custom | PL, PR | Tự động tải hoá đơn điện tử của người bán từ cổng Tổng cục Thuế |
| `11.5` | Duyệt chứng từ hai cấp | `11-5` | custom | PR | Quy trình phê duyệt chứng từ chi tiền và mua hàng nhiều cấp |
| `11.6` | Cảnh báo số liệu cuối kỳ | `11-6` | custom | PR | Trung tâm cảnh báo rủi ro số liệu: lệch thuế, âm kho, âm quỹ |
| `11.7` | Đối soát tự động | `11-7` | custom | PR | Tự động đối chiếu số liệu bán hàng giữa POS, Kế toán và Thuế |
| `11.8` | Kết nối ngân hàng | `11-8` | tool | PR | Nhận sao kê ngân hàng điện tử và tự động đối chiếu giao dịch QR |
| `11.9` | Kết nối cơ quan thuế | `11-9` | tool | PR | Nộp tờ khai và tra cứu nghĩa vụ thuế trực tiếp không qua cổng riêng |
| `11.10` | AI nhập liệu | `11-10` | tool | PR | Quét hoá đơn giấy hoặc nhận diện giọng nói để lập chứng từ nháp |
| `11.11` | Thiết kế mẫu in | `11-11` | custom | PR | Công cụ chỉnh sửa mẫu in ấn chứng từ theo nhận diện thương hiệu |
| `11.12` | Báo cáo tự khai báo | `11-12` | tool | PR | Cho phép kế toán tự định nghĩa công thức dòng báo cáo quản trị |
| `11.13` | Quản lý đa bộ dữ liệu | `11-13` | tool | PR | Quản lý nhiều công ty, nhiều pháp nhân trên một tài khoản |
| `11.14` | Xử lý dữ liệu lớn | `11-14` | tool | PR | Tối ưu xuất dữ liệu lớn hàng trăm nghìn dòng ra tệp Excel |
| `11.15` | Đa kho một điểm bán | `11-15` | tool | PR | Cấu hình xuất kho bán hàng tự động theo từng quầy Bar, Bếp |
| `X2` | Nhật ký thao tác | `nhat-ky` | custom | S, PL, PR | Ghi vết toàn bộ hành vi thêm, sửa, xoá, khoá sổ của người dùng |


## 15. Phân hệ Hệ thống (he-thong) và Thao tác nhanh (thao-tac-nhanh)

### Phân hệ Hệ thống (he-thong) — Đã có trong bản mẫu
Phân hệ Hệ thống đảm nhiệm việc quản trị người dùng, phân quyền truy cập và thiết lập thông số đơn vị (src/modules/he-thong/index.ts:1-24):
- Người sử dụng (`nguoi-dung`): Quản lý danh sách tài khoản nhân viên kế toán, thủ kho, thu ngân (mở cho gói Plus và Pro).
- Chức vụ và phân quyền (`phan-quyen`): Thiết lập ma trận phân quyền chi tiết theo vai trò: Kế toán trưởng, Kế toán kho, Kế toán thanh toán, Thủ kho (gói Plus, Pro).
- Thông tin đơn vị (`thong-tin`): Khai báo tên công ty, mã số thuế, địa chỉ trụ sở, người đại diện pháp luật và ngày bắt đầu năm tài chính.
- Cấu hình kế toán (`cau-hinh`): Lựa chọn chế độ kế toán (TT152, TT58, TT133, TT99), phương pháp tính thuế GTGT và thuế TNDN (QD31).
- Khoá sổ Standard (`khoa-so`): Giao diện khoá sổ độc lập theo từng tháng và từng cửa hàng dành riêng cho gói Standard và Plus (src/modules/tong-hop/KhoaSoStandard.tsx).
- Gói thuê bao (`goi-thue-bao`): Xem thông tin hạn dùng, các tính năng của gói và thực hiện nâng cấp gói dịch vụ.

### Phân hệ Thao tác nhanh (thao-tac-nhanh) — Đã có trong bản mẫu
- Đặt tại góc trên bên phải thanh công cụ để người dùng truy cập ngay lập tức vào các nghiệp vụ thường dùng nhất mà không cần tìm qua menu phân hệ (src/modules/thao-tac-nhanh/index.ts:1-21).
- 5 chức năng thao tác nhanh mặc định gồm: Thu tiền, Chi tiền, Nhập mua hàng, Kiểm kê kho và Kê khai thuế (docs/TONG-KET-LOGIC-STANDARD.md:40).
- Hệ thống cho phép người dùng tuỳ biến ghim tối đa 8 nút tắt phù hợp với thói quen tác nghiệp của từng cá nhân (docs/TONG-KET-LOGIC-STANDARD.md:40).


## 16. Kết nối hệ sinh thái iPOS: POS FABi, iPOS Inventory và Dịch vụ ngoài

### Kết nối phần mềm quản lý bán hàng POS FABi — Đã có trong bản mẫu
- Đồng bộ danh mục món ăn và danh mục nhóm hàng hoá: Tránh việc phải nhập liệu hai lần (docs/TONG-KET-LOGIC-STANDARD.md:84, 145).
- Đồng bộ doanh thu bán hàng: Nhận dữ liệu từng hoá đơn chi tiết hoặc nhận dữ liệu tổng hợp theo ngày từ máy tính tiền FABi (docs/TONG-KET-LOGIC-STANDARD.md:176-179).
- Đồng bộ thu chi tiền mặt tại quầy thu ngân: Tự động ghi nhận các khoản thu tiền cọc, chi tạm ứng, nộp tiền két ca bán hàng về sổ kế toán (src/modules/tien/dong-bo-fabi.ts).

### Kết nối phần mềm quản lý kho iPOS Inventory (IVT) — Đã có trong bản mẫu
- Kế thừa toàn bộ hệ thống phiếu kho ẩm thực đặc thù: Phiếu xuất sơ chế, nhập sơ chế, xuất chế biến, nhập chế biến và bảng định lượng công thức (src/modules/kho/index.ts:44-58).
- Đồng bộ số liệu tồn kho thực tế và đơn giá xuất kho sang phần mềm kế toán định kỳ mỗi giờ hoặc theo lệnh thủ công (src/modules/tien-ich/index.ts:22-23).

### Kết nối Cổng thuế điện tử và Ngân hàng số — Dự kiến / chưa làm
- Kết nối Cổng Tổng cục Thuế (`11.4`, `11.9`): Tự động kéo dữ liệu hoá đơn đầu vào XML và nộp báo cáo thuế điện tử trực tiếp từ app.
- Kết nối Ngân hàng điện tử (`11.8`): Kết nối mở qua API với các ngân hàng lớn (Vietcombank, Techcombank) để tự động đối soát dòng tiền thanh toán quét mã VietQR tại bàn ăn.
