# Tổng kết logic gói Standard

Bản tổng kết logic từng màn hình, từng phân hệ khi đơn vị chạy gói Standard (mã `S`), rút từ code ngày 27/10/2026. Số liệu là dữ liệu giả, chưa có backend.

Lưu ý khi đọc code: nhiều chú thích còn ghi "gói Free", đó là tên cũ của gói Standard.

## 0. Nguyên tắc chung của gói Standard

| Nguyên tắc | Nội dung | Ở đâu |
|---|---|---|
| Đối tượng | Hộ kinh doanh, quán F&B nhỏ. Miễn phí trọn đời, không giới hạn cửa hàng, mỗi cửa hàng một kho | `src/app/plan.ts` (`GOI`, `GIA_GOI_NAM`) |
| Gói đang bán | Chỉ Standard (`GOI_MO = ['S']`). Plus, Pro hiện nhãn "Sắp ra mắt" | `plan.ts:8` |
| Ẩn ngoài gói | Tính năng ngoài gói ẩn hẳn, không hiện ổ khoá mời nâng cấp (QD22) | `anNgoaiGoi`, `plan.ts:219` |
| Chế độ kế toán | Hộ kinh doanh chạy TT152. Doanh nghiệp chạy TT58 trường hợp 1 (GTGT, TNDN theo % doanh thu). Người dùng không tự chọn, chế độ đi theo loại hình | `session.tsx` (`chuanHoaStandard`), `che-do.ts` |
| Không ghi sổ | Không Nợ/Có, không khoản mục, không công việc, không bút toán, không nút Ghi sổ. Kể cả doanh nghiệp TT58 (QD81) | `kieuGhiSoDv`, `plan.ts:229` |
| Thuế GTGT bán ra | Luôn theo % doanh thu: không tiền thuế trên chứng từ bán, thay bằng dòng Giảm thuế GTGT = doanh thu × tỷ lệ ngành × 20% | `ban-hang/giam-thue.ts` |
| Cửa hàng | Danh sách, báo cáo lọc theo cửa hàng chọn trên thanh trên. Đang xem "Tất cả cửa hàng" thì không lập phiếu được: bấm lập phiếu hiện hộp chọn cửa hàng trước | `Shell.tsx:28-64` |
| Kỳ làm việc | Tháng chọn ở trang chủ thành kỳ mặc định cho danh sách, báo cáo, Chi phí phân bổ (giữ tới khi đóng tab) | `thangLamViec.ts` |
| Ngày chứng từ | Chứng từ mới không được trước ngày đầu năm tài chính của đơn vị | `ChungTuForm.tsx:402` |
| Khoá sổ | Chốt theo tháng, theo từng cửa hàng. Tháng đã khoá: phiếu chỉ xem, không sửa, không xoá | `tong-hop/KhoaSoStandard.tsx` |
| Đính kèm | Form chứng từ không có tab Đính kèm | `ChungTuForm.tsx:588` |

## 1. Khung app

### 1.1 Sidebar, phân hệ
- Phân hệ hiện ở gói Standard: Trang chủ, Thu chi, Bán hàng, Mua hàng, Kiểm kê (phân hệ Kho đổi tên), Chi phí phân bổ (CCDC), Kê khai thuế, Báo cáo, Danh mục, Hệ thống.
- Ẩn hẳn: Tổng hợp, Tiện ích (`AN_PHAN_HE.S`, `registry.ts:187`); TSCĐ, Giá thành (không còn màn nào mở được).
- Một phân hệ chỉ hiện khi còn ít nhất một màn thường (không tính Quy trình, Báo cáo) mở được ở gói (`hienPhanHe`, `registry.ts:201`).
- Màn mở được khi: `sc.goi` có gói S, hoặc mã tính năng có gói S (`coTrongGoi`), hoặc màn không gắn mã (`moDuoc`, `registry.ts:93`).
- Bấm logo luôn về Tổng quan. Ctrl+K mở ô tìm nhanh.

### 1.2 Thanh trên
- Chọn đơn vị kế toán: đổi đơn vị thì đổi luôn gói và đặt cửa hàng về "Tất cả". Có "Thêm đơn vị kế toán".
- Chọn cửa hàng làm việc: "Tất cả cửa hàng" chỉ để xem gộp.
- Chip "Dùng thử · còn N ngày": 30 ngày tính từ ngày tạo đơn vị, còn từ 7 ngày trở xuống thì tô cảnh báo.
- Menu tài khoản ẩn Người dùng.

### 1.3 Tìm nhanh (Ctrl+K), Thao tác nhanh
- Tìm nhanh chỉ ra màn đang hiện với gói, chế độ, cách tính thuế; gõ không dấu được; tối đa 40 kết quả.
- Thao tác nhanh mặc định: Thu tiền, Chi tiền, Nhập mua, Kiểm kê, Kê khai thuế. Tuỳ chỉnh tối đa 8 ô, lưu trên máy (`thaoTacNhanh.ts:48`).

### 1.4 Mở màn
- Vào `/app`: mọi vai trò về Tổng quan. Gói Standard không có Bàn làm việc.
- Màn có `goi` không gồm S (Người dùng, Bàn làm việc...): chuyển về màn đầu phân hệ.
- Báo cáo không hợp với chế độ, cách tính thuế: hiện "Báo cáo không dùng với thiết lập hiện tại" (`Screen.tsx:64-75`).

## 2. Đăng nhập, chọn đơn vị
- Đăng nhập: email hoặc số điện thoại không rỗng, mật khẩu từ 6 ký tự. Vai trò lấy theo tài khoản mẫu.
- Chọn đơn vị: mỗi thẻ ghi mã số thuế, chế độ, số điểm bán, kỳ đang mở. Có link "Thử mở từ FABi".

## 3. Khởi tạo từ FABi

### 3.1 Màn mở từ FABi (`/khoi-tao-fabi`, `KhoiTaoFabi.tsx`)
1. Chào: số liệu lấy từ FABi (thương hiệu, cửa hàng, kênh, món).
2. Giới thiệu giao diện: ảnh trang chủ đánh số 1–5.
3. Chọn cửa hàng dùng thử: mặc định chọn hết, phải chọn ít nhất 1.
4. Dùng thử: tạo đơn vị mới gói S, TT152, bắt đầu 30 ngày dùng thử, vào app. Popup khởi tạo hiện đè lên.

### 3.2 Popup khởi tạo 3 bước (`OnboardFabi.tsx`)
Popup bắt buộc, không đóng được, tiến độ lưu trên máy.

**Bước 1. Loại hình và gói**
- Hộ kinh doanh chọn nhóm theo doanh thu năm. Hệ thống gợi ý nhóm từ doanh thu FABi 12 tháng.

| Nhóm | Doanh thu năm | Thuế TNCN |
|---|---|---|
| 1 | Dưới 1 tỷ | Không nộp GTGT, TNCN, chỉ khai doanh thu |
| 2 | 1 đến dưới 3 tỷ | Chọn theo % doanh thu hoặc theo lợi nhuận 15% |
| 3 | 3 đến dưới 50 tỷ | Lợi nhuận 17% |
| 4 | Từ 50 tỷ | Lợi nhuận 20% |

- Doanh nghiệp: hỏi cách tính GTGT, TNDN; gói S dùng TT58, theo % doanh thu.
- Kê khai thuế có ở gói S khi: hộ kinh doanh nhóm 1, nhóm 2 tính theo doanh thu, hoặc doanh nghiệp tính theo doanh thu. Trường hợp khác hiện cảnh báo "chưa có ở gói Standard", phần quản lý vẫn dùng đủ.

**Bước 2. Thông tin đơn vị**
- Doanh nghiệp bắt buộc mã số thuế; hộ kinh doanh nhập CCCD/MST không bắt buộc. Nút Tra cứu điền sẵn tên, địa chỉ.
- Ngày đầu năm tài chính: 01/01, 01/04, 01/07 hoặc 01/10.

**Bước 3. Cửa hàng**
- Chọn ít nhất 1 cửa hàng lên sổ.
- Hộ kinh doanh bắt buộc chọn cửa hàng chính (địa điểm kinh doanh chính), chọn kênh bán online và sàn đã khấu trừ thuế (GrabFood, ShopeeFood, Be).

**Lấy dữ liệu FABi**
- Danh sách 4 việc kèm trạng thái: danh mục món và kênh; doanh thu (mỗi đơn một chứng từ Xuất bán POS từ ngày đầu năm); thu chi; ghi sổ.
- Bấm "Bắt đầu làm việc": lưu loại hình, nhóm, cách tính thuế, cửa hàng chính, kênh; đặt gói, chế độ, ngày đầu năm; chuyển sang Danh mục.

## 4. Trang chủ

Trang Tổng quan của gói S chỉ có một khối lớn (`BaBaiToanStandard.tsx`). Chọn Năm, Tháng (dữ liệu mẫu tháng 7–10/2026). Cửa hàng theo thanh trên. Đổi tháng thì đổi luôn tháng làm việc.

### 4.1 Thanh đầu
- Nhắc khoá sổ khi tháng trước chưa khoá, bấm sang Hệ thống › Khoá sổ.
- 5 thao tác nhanh: Thu tiền, Chi tiền, Mua hàng, Kiểm kê, Kê khai thuế.

### 4.2 Kết quả kinh doanh
**Lợi nhuận = Doanh thu thuần − Chi phí NVL − Chi phí hoạt động − Chi phí phân bổ, khấu hao.** Biên lợi nhuận = lợi nhuận / doanh thu.

| Dòng | Cách tính | Bấm vào |
|---|---|---|
| Doanh thu thuần | Từ chứng từ Xuất bán POS (dữ liệu ngày `DAILY`) | Báo cáo KQKD 10.2.3 |
| Chi phí NVL | Mỗi cửa hàng theo cách tính riêng, chọn ở Danh mục cửa hàng (xem bảng dưới) | Màn Chi phí NVL |
| Chi phí hoạt động | Cộng phiếu chi tiền mặt, chi ngân hàng có lý do là chi phí, theo tháng ghi nhận, trừ lý do "Chi phí chờ phân bổ" | Màn Chi phí hoạt động |
| Chi phí phân bổ | Phần phân bổ trong tháng của thẻ chi phí trả trước | Chi phí phân bổ 8.1.1 |

Ba cách tính chi phí NVL (`home/chi-phi-nvl.ts`):

| Cách | Công thức |
|---|---|
| Theo iPOS Inventory (mặc định) | Giá thành món × số món bán + NVL tiêu hao (xuất huỷ + xuất điều chỉnh − nhập điều chỉnh) |
| Nhập tay | Số món bán × giá thành người dùng nhập; món chưa có giá tính 0 |
| Theo phiếu nhập | Tổng tiền phiếu mua hàng 4.1.1 trong tháng, gồm thuế GTGT |

Đổi cách tính chỉ áp dụng từ tháng đầu tiên chưa khoá sổ; tháng đã khoá giữ cách cũ.

Biểu đồ hiệu quả 13 tháng: tháng 7–10/2026 tính thật, các tháng trước là số mẫu theo hệ số mùa vụ.

### 4.3 Quỹ tiền
- Tồn quỹ = tổng số dư cuối kỳ của quỹ tiền mặt các cửa hàng đang xem và mọi tài khoản ngân hàng, kèm thu, chi trong tháng.
- Vòng tròn cơ cấu quỹ (chỉ quỹ dương). Bấm một quỹ: Tồn đầu + Thu − Chi = Tồn cuối, số dư từng ngày, 3 giao dịch gần nhất, link Lịch sử thu chi.
- Chưa có quỹ: nút "Tạo quỹ". Menu "Xem sổ": Sổ quỹ tiền mặt 2.2.1, Sổ ngân hàng 2.2.3.

### 4.4 Mua hàng và công nợ nhà cung cấp (`home/khoStandard.ts`)
- Giá trị mua tháng = tổng tiền phiếu mua 4.1.1 (gồm thuế), số phiếu, top 3 mặt hàng.
- Công nợ: Nợ đầu + Mua nợ − Trả hàng − Thanh toán = Nợ cuối, khớp dòng tổng báo cáo 4.2.3. Gói S không có hạn thanh toán.
- Nút: Tạo phiếu mua hàng; Thanh toán nhà cung cấp (phiếu chi lý do CHI02).

### 4.5 Hao hụt kiểm kê
- Chỉ theo số lượng, không tính tiền thừa, thiếu. Lệch = tồn thực tế − tồn hệ thống trên phiếu kiểm kê của tháng.
- Số mặt hàng thiếu, thừa; đã kiểm bao nhiêu mặt hàng; tiến độ từng cửa hàng (cửa hàng chưa kiểm lên đầu); top 3 thiếu, top 3 thừa.
- Nút Kiểm kê ngay; link Báo cáo kiểm kê 5.2.15.

### 4.6 Màn con mở từ trang chủ
| Màn | Logic |
|---|---|
| Chi phí hoạt động (`ChiPhiThang.tsx`) | Mỗi lý do chi phí một dòng: số phiếu, tiền mặt, ngân hàng, % trên tổng. Bấm dòng xổ danh sách phiếu, bấm số phiếu mở phiếu. Xuất Excel, Lập phiếu chi |
| Chi phí NVL (`ChiPhiNvl.tsx`) | Xem tất cả cửa hàng: bảng cửa hàng, cách tính, doanh thu, NVL, tỷ lệ. Xem một cửa hàng theo cách tính: giá thành món và NVL tiêu hao; bảng phiếu mua; hoặc ô nhập giá thành từng món (nhập, xuất Excel). Tháng đã khoá sổ không sửa được |
| Lịch sử thu chi (`LichSuQuy.tsx`) | Lọc theo quỹ, loại thu/chi. Tồn đầu, Thu, Chi, Tồn cuối; giao dịch gom theo ngày kèm số dư cuối ngày, nhãn nguồn FABi POS hoặc Thủ công. Bấm giao dịch mở chứng từ gốc |

## 5. Danh mục

| Màn | Logic riêng gói Standard |
|---|---|
| Cửa hàng (`DanhMucCuaHang.tsx`) | Mỗi cửa hàng một kho mặc định, không khai kho. Mỗi cửa hàng chọn Cách tính chi phí NVL và bật/tắt Đồng bộ thu chi FABi. Thêm cửa hàng từ cửa hàng FABi chưa dùng kế toán; tích "khai số dư ngay" thì sang Danh mục Quỹ tiền |
| Hàng hoá 1.2 | Không có ĐVT phụ, mã vạch, giá mua, giá bán, kho mặc định, tồn tối thiểu/tối đa, nhà cung cấp, quy đổi ĐVT. Thương hiệu chỉ xem. "Theo dõi tồn kho" tự đặt theo loại hàng: Thành phẩm tắt, loại khác bật. Hàng mới mặc định ngành Dịch vụ ăn uống (tự điền tỷ lệ GTGT, TNCN) |
| Nhóm hàng hoá | Thêm tay hoặc Đồng bộ FABi |
| Khách hàng, NCC, nhân viên 1.5 | Không có số thẻ ngân hàng và các khối nâng cao |
| Kho 1.8 | Chỉ xem, không thêm kho, không có Nhóm kho |
| Quỹ tiền 1.12 | Có cột Số dư ban đầu (khai số dư quỹ ở đây thay màn Số dư ban đầu). Mỗi quỹ gắn phương thức thanh toán của từng cửa hàng để nhận phiếu đồng bộ từ FABi |
| Lý do nghiệp vụ 1.16 | Chỉ lý do Thu tiền, Chi tiền. Lý do được tích "là chi phí" vào Chi phí hoạt động |
| Nhóm lý do nghiệp vụ | 6 nhóm chi phí theo sổ S2c-HKD, chỉ xem |
| Phương thức thanh toán | Lấy từ FABi: không thêm, không sửa, không xoá, không nhập/xuất Excel; chỉ có mã, tên |
| Ẩn ở gói S | Nhóm mục chi phí, Nhóm công việc, Nhóm kho, Tài khoản, Đơn vị tính quy đổi, Bút toán tự động |

## 6. Thu chi

### 6.1 Phiếu thu, chi (2.1.1)
- 3 tab: Tiền mặt (Thu PT, Chi PC), Ngân hàng (Thu BC, Chi UNC), Chuyển quỹ (CQ). Số phiếu `PT{YY}{MM}-{0000}`.
- Quỹ: phiếu tiền mặt chỉ chọn quỹ tiền mặt của cửa hàng lập phiếu; phiếu ngân hàng chọn tài khoản ngân hàng.
- Lý do, Đối tượng chỉ chọn ở đầu phiếu; mọi dòng chi tiết lấy theo, bảng chi tiết bỏ hai cột này.
- Đối tượng bắt buộc khi lý do là thu nợ, đi vay, chi công nợ, cho vay.
- "Tháng ghi nhận chi phí" chỉ hiện khi lý do là chi phí: mặc định tháng của ngày phiếu, chọn được các tháng trước chưa khoá sổ. Chuyển quỹ không ảnh hưởng lãi lỗ.
- Lý do "Chi phí chờ phân bổ": lưu xong hỏi tạo thẻ chi phí phân bổ; phiếu đã có thẻ thì không sửa được.
- Danh sách gồm cả phiếu đồng bộ FABi, phiếu lương và thuê nhà hằng tháng, phiếu thanh toán sinh từ phiếu mua.

### 6.2 Đồng bộ thu chi từ FABi (`tien/dong-bo-fabi.ts`)
- Bật/tắt theo từng cửa hàng.
- Mỗi phiếu FABi có cửa hàng và phương thức thanh toán; quỹ nhận phiếu theo cặp "cửa hàng|phương thức" khai ở Danh mục Quỹ tiền. Mặc định: tiền mặt về quỹ tiền mặt cửa hàng; chuyển khoản, thẻ về ngân hàng; app giao đồ ăn chưa gắn.
- Phương thức chưa gắn quỹ thì phiếu chờ, chưa vào sổ.

### 6.3 Sổ, số dư
- Sổ quỹ tiền mặt 2.2.1, Sổ ngân hàng 2.2.3.
- Số dư ban đầu: khai ở Danh mục Quỹ tiền; đường dẫn cũ tự chuyển sang đó.
- Sơ đồ Quy trình: Khởi tạo (số dư) → Ghi nhận hằng ngày (5 loại phiếu) → Đối chiếu sổ → Công nợ, báo cáo.

## 7. Bán hàng
- Xuất bán POS 3.1.1 chỉ nhận chứng từ đổ về từ FABi, không lập tay, không sửa, trả hàng, huỷ (`ChungTuBanHang.tsx`).
  - Đồng bộ chi tiết: mỗi hoá đơn FABi thành một chứng từ.
  - Dòng món: thành tiền = số lượng × đơn giá, giảm giá theo khuyến mãi; phần chênh dồn vào món cuối để tổng khớp doanh thu ngày.
  - Gói S (GTGT theo % doanh thu): bỏ cột thuế suất, tiền thuế, luôn có Giảm thuế GTGT; tiền các phương thức thanh toán chia lại theo tổng = doanh thu − giảm thuế.
  - Số liệu khớp với KQKD và trang chủ.
- Báo cáo: Tổng hợp bán hàng, Bảng kê chi tiết bán hàng, Sổ doanh thu bán hàng 3.2.5 (theo chế độ, xem mục 12).
- Không có ở gói S: Bán hàng ngoài POS, hoá đơn bán hàng, hàng bán trả lại, hoá đơn điện tử, Công nợ khách hàng.

## 8. Mua hàng
- **Phiếu mua hàng 4.1.1** (tiền tố MH): nhà cung cấp, kho nhập (một kho ở đầu phiếu), ngày, dòng hàng.
  - Tích "Đã thanh toán": chọn quỹ; lưu xong tự lập phiếu chi hoặc UNC lý do "Thanh toán công nợ nhà cung cấp", tham chiếu hai chiều. Phiếu còn nợ có nút Thanh toán (số tiền > 0, không vượt số còn phải trả).
  - Tích "Nhận kèm hoá đơn": bắt buộc số, ký hiệu, ngày hoá đơn.
  - Hộ kinh doanh không khấu trừ thuế đầu vào: giá trị nhập kho = tiền trước thuế + thuế.
  - Phiếu đã trả thì không sửa được.
- Báo cáo, tính từ chính phiếu 4.1.1 nên khớp nhau:
  - Bảng kê chi tiết mua hàng 4-2-7: mỗi mặt hàng của phiếu một dòng.
  - Công nợ nhà cung cấp 4.2.3: mỗi nhà cung cấp một dòng, I Nợ đầu kỳ + II Tiền mua − III Tiền trả hàng − IV Thanh toán = V Nợ cuối kỳ. Xem tất cả cửa hàng thì dưới mỗi nhà cung cấp là từng cửa hàng. Bấm tên mở Lịch sử công nợ (cộng từ chính các phiếu nên khớp). Nút Thanh toán ngay chọn tiền mặt hay ngân hàng.

## 9. Kiểm kê (phân hệ Kho)
- **Phiếu kiểm kê 5.1.10** (KK): chọn kho; bảng tồn hệ thống, tồn thực tế, chênh lệch theo số lượng, không có tiền.
  - Ô tồn thực tế để trống thì lấy tồn hệ thống.
  - Lưu xong tự sinh phiếu Xuất điều chỉnh (thiếu) và Nhập điều chỉnh (thừa) cho phần chênh, số phiếu theo số kiểm kê (KK2610-0256 → XDC2610-0256, NDC2610-0256).
  - Phiếu đã sinh điều chỉnh thì không sửa; xoá kiểm kê thì xoá luôn phiếu điều chỉnh.
- Xuất, nhập điều chỉnh: nằm trong tab Kiểm kê, chỉ xem, gói S không hiện giá trị.
- Xuất nhập tồn 5.2.3 ghi đầu kỳ, nhập, xuất, cuối kỳ chỉ theo số lượng, không có giá trị, không dòng tổng. Kho đi theo cửa hàng đang chọn. Bấm mã hoặc tên hàng mở Thẻ kho 5.2.1 cùng hàng, kho, kỳ (Thẻ kho không hiện trong danh sách báo cáo).
- Báo cáo khác: Tổng hợp nhập kho, Chi tiết nhập kho, Báo cáo kiểm kê 5.2.15. Ẩn Tổng hợp xuất kho, Chi tiết xuất kho.
- Giá xuất kho: chỉ bình quân gia quyền cuối kỳ.

## 10. Chi phí phân bổ (CCDC 8.1.1)
- Gói S chỉ có thẻ Chi phí trả trước (không có CCDC, TSCĐ). Hai kiểu thẻ: ghi tăng trong kỳ (TPB{YY}{MM}-{0000}) và dư đầu kỳ (TPBDK...).
- Thẻ tạo từ phiếu chi lý do "Chi phí chờ phân bổ" (Ghi tăng hàng loạt các phiếu đang chờ).
- Lịch phân bổ đều theo tháng, mỗi kỳ là ngày cuối tháng, kỳ cuối nhận phần lẻ. Ngừng phân bổ nhập theo tháng.
- Gói S không có bước kích hoạt: kỳ tới tháng hiện tại tính là Đã phân bổ, kỳ sau là Chờ phân bổ.
- Thẻ chỉ xoá được khi kỳ khoá sổ còn trước tháng bắt đầu phân bổ.

## 11. Kê khai thuế
- Màn Kê khai thuế (`ToKhaiHKD.tsx`), theo iFaster: danh sách tờ khai (lọc năm, loại, trạng thái), hộp Lập tờ khai, tờ khai 4 bước.
  1. Thông tin hộ kinh doanh, điểm bán.
  2. Doanh thu kỳ, giảm trừ, thuế GTGT, TNCN.
  3. Bảng kê 01/BK-STK.
  4. Xem trước, tải XML, đánh dấu Đã nộp.
- Kỳ 6 tháng (nhóm doanh thu khoá theo thiết lập). Kỳ đã có tờ khai chưa huỷ thì lập thêm thành bổ sung lần kế.
- Công thức: GTGT = doanh thu kỳ × tỷ lệ GTGT ngành; TNCN = (doanh thu − giảm trừ) × tỷ lệ TNCN ngành, giảm trừ là phần còn lại của 1 tỷ/năm sau khi trừ doanh thu kỳ đầu năm.
- Nhóm báo cáo Thuế ẩn ở màn Báo cáo của gói S.

## 12. Báo cáo

Màn Báo cáo gom báo cáo của mọi phân hệ. Mỗi báo cáo có bộ lọc (Khoảng ngày, Tìm, tối đa 4 ô ngoài), in, xuất file, tuỳ chỉnh cột, gom nhóm. Số chứng từ trên báo cáo bấm được để mở phiếu.

Báo cáo hiện ở gói S (suy từ `bao-cao/danh-sach.ts`, nên soát lại trên màn):

| Nhóm | Báo cáo |
|---|---|
| Thu chi | Sổ quỹ tiền mặt 2.2.1, Sổ ngân hàng 2.2.3 |
| Bán hàng | Tổng hợp bán hàng, Bảng kê chi tiết bán hàng |
| Mua hàng, Công nợ | Bảng kê chi tiết mua hàng, Công nợ nhà cung cấp 4.2.3 |
| Kho | Xuất nhập tồn 5.2.3, Tổng hợp nhập kho, Chi tiết nhập kho, Báo cáo kiểm kê 5.2.15 (Thẻ kho chỉ mở từ Xuất nhập tồn) |
| Kết quả | Báo cáo kết quả kinh doanh 10.2.3, bản lãi lỗ đơn giản, không theo mẫu B02 |
| Sổ theo chế độ | Hộ kinh doanh TT152: Sổ doanh thu 3.2.5 mẫu S1a-HKD (nhóm 1) hoặc S2a-HKD (tính theo doanh thu); tính theo lợi nhuận thì không có sổ này. Doanh nghiệp TT58: chỉ S1-DNSN |

## 13. Hệ thống
- Màn có: Thông tin đơn vị, Cấu hình kế toán, Khoá sổ, Gói thuê bao. Ẩn: Người dùng, Vai trò và phân quyền.

### Thông tin đơn vị
  - Tên bắt buộc. Mã số thuế khoá nếu đã khai khi khởi tạo. Số điểm bán = số cửa hàng.
  - Hộ kinh doanh: TT152 cố định, chọn nhóm 1–4, GTGT trực tiếp, TNCN theo nhóm (nhóm 2 được chọn), cửa hàng chính, kênh online và sàn.
  - Doanh nghiệp: TT58 cố định, GTGT và TNDN theo % doanh thu.
  - Đổi loại hình thì cảnh báo đổi chế độ, sổ, báo cáo.

### Cấu hình kế toán
Không dùng Nợ/Có. Có bảng mẫu đánh số chứng từ, bật/tắt đồng bộ thu chi FABi theo cửa hàng.

### Khoá sổ (`KhoaSoStandard.tsx`)
  - Bảng các tháng của một cửa hàng, lọc năm, trạng thái (Đã khoá, Chưa khoá, Đang mở, Chưa tới).
  - Tháng chưa hết thì chưa khoá được. Khoá một tháng thì khoá luôn các tháng trước còn thiếu.
  - Mở khoá chỉ ở tháng khoá gần nhất, bắt buộc ghi lý do.
  - Trước khi khoá có các bước kiểm tra: kiểm kê, phân bổ, chi phí chờ ghi tăng, đối chiếu tồn quỹ, phiếu FABi chờ. Chưa xong vẫn khoá được, kèm cảnh báo.
  - Khoá sổ hàng loạt, Mở khoá hàng loạt, Lịch sử khoá sổ.

### Gói thuê bao
Thẻ gói đang dùng; 3 thẻ gói, Plus và Pro nhãn "Sắp ra mắt", không có nút chuyển; bảng so sánh theo phân hệ, hỏi đáp.

## 14. App điện thoại
- Bật khi màn rộng dưới 768px. Màn chưa có bản điện thoại hiện "Chỉ dùng trên máy tính".
- 4 tab đáy: Trang chủ, Nghiệp vụ, Báo cáo, Khác. Thanh tab ẩn khi cuộn xuống và ở màn cấp 2.
- Trang chủ giống web: thao tác nhanh (Thu, Chi hỏi tiền mặt hay ngân hàng trước), nhắc khoá sổ, Kết quả kinh doanh, Quỹ tiền, Mua hàng và công nợ, Hao hụt kiểm kê.
- Nghiệp vụ: Thu chi, Kế toán bán hàng, Kế toán mua hàng, Kiểm kê, Chi phí phân bổ.
- Lập phiếu:
  - Thu chi một màn: quỹ, lý do, ngày bắt buộc; số tiền > 0.
  - Mua hàng: như web, có Đã thanh toán, Nhận kèm hoá đơn.
  - Kiểm kê: lưu xong mở thẳng phiếu.
  - Phiếu khác lưu xong hiện màn Thành công (Xem chi tiết, Lập phiếu mới, Đóng).
- Xem phiếu: tab Chi tiết, Lịch sử (không có Hạch toán). Menu Sửa, Sao chép, Xoá. Chặn xoá khi tháng đã khoá sổ, phiếu có tham chiếu, thẻ phân bổ đã khoá.
- Khác với web: không Xuất Excel, không In phiếu.
