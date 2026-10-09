# Kế hoạch: phân hệ Báo cáo và màn xem báo cáo

Soạn 09/10/2026, Trum duyệt cùng ngày. Mã việc T47, quyết định QD31.

## 1. Hiện trạng

- 35 báo cáo nằm rải ở 9 phân hệ, mở qua tab "Báo cáo" cuối thanh tab (`BaoCaoScreen.tsx`).
- 25 báo cáo dùng màn chung `ReportScreen.tsx`. Màn này trả thẳng JSX, không có dữ liệu dạng bảng. Vì vậy chưa xuất file, chưa ẩn cột, chưa gom nhóm được.
- 10 báo cáo làm riêng. Gồm Sổ quỹ 2.2.1, Đối soát POS 3.2.2, Xuất nhập tồn 5.2.3, Tờ khai thuế 6.2.3.
- Thêm 4 báo cáo tài chính 10.2.1–10.2.4 và Quản trị F&B 10.3.1, cũng làm riêng.
- Nút In, Xuất Excel, Xuất PDF trên `ReportToolbar` chưa làm gì.
- Tờ báo cáo `.paper` là một khối dài, không chia trang, không có khổ giấy, không zoom.
- QD08 ghi "cố ý chưa làm mục Báo cáo chung trên sidebar". Việc này đảo quyết định đó, cần QD mới.
- Còn thiếu khoảng 10 mẫu sổ theo thông tư, 2 ký hiệu mẫu ghi sai (mục 7).
- Chế độ kế toán gắn cứng vào gói, mẫu chọn theo gói chứ không theo thông tư (mục 8).

## 2. Kết quả cần có

1. Phân hệ **Báo cáo** trên sidebar, đứng ngay dưới Tổng hợp.
2. Trung tâm báo cáo: toàn bộ báo cáo chia nhóm theo phân hệ, có tìm kiếm.
3. Màn xem báo cáo: ô chọn đổi sang báo cáo khác cùng nhóm, ví dụ đang xem 4.2.1 thì chọn được 4.2.2.
4. Mẫu chuẩn theo thông tư: đầu trang, ký hiệu mẫu, căn cứ, hàng ký hiệu cột, dòng cộng, ô ký. Mẫu đổi theo gói (TT58, TT133, TT99).
5. Xem như bản in: tờ A4 thật, chia trang, zoom to nhỏ, Vừa khung, nhảy trang. Học thanh dưới `ReportBar` của LedgerStudio.
6. **Bộ lọc riêng từng báo cáo** (bảng mục 6).
7. In và xuất: A4 dọc hoặc ngang, xuất CSV, XLSX, PDF, HTML, XML.
8. Tuỳ chỉnh mẫu: ẩn hiện cột, đổi thứ tự cột, đổi tên cột, gom nhóm, sửa chức danh và họ tên người ký.
9. Đủ mẫu sổ, báo cáo của bốn chế độ TT152, TT58, TT133, TT99 (mục 7).
10. Chọn chế độ ở cấu hình thì danh mục, chứng từ, mẫu in, báo cáo đổi theo (mục 8).
11. Mỗi loại chứng từ có mẫu in đúng thông tư đang cấu hình (mục 8.6).
12. Tiện ích thiết kế mẫu in: người dùng tự sửa cỡ chữ, tên, người ký, ẩn hiện, thứ tự, chiều cao dòng, độ rộng cột (mục 8.7).

## 3. Bố cục

### 3.1 Trung tâm báo cáo `/app/bao-cao`

```
┌ Báo cáo ─────────────────────────────────────────────────────────────┐
│ [Tìm báo cáo...]                         Khổ: ☐ Dọc ☐ Ngang  (lọc)   │
├───────────────┬──────────────────────────────────────────────────────┤
│ Tất cả     35 │ MUA HÀNG                                             │
│ Tiền        5 │ ┌──────────────────────┐ ┌──────────────────────┐    │
│ Bán hàng    4 │ │▤ Báo cáo mua hàng    │ │▤ Tổng hợp mua hàng   │    │
│ Mua hàng    2 │ │ 4.2.1 · S… · Ngang   │ │ 4.2.2 · Dọc          │    │
│ Kho         7 │ └──────────────────────┘ └──────────────────────┘    │
│ Thuế        3 │ KHO                                                  │
│ TSCĐ        2 │ ┌──────────────────────┐ ┌───────────┐ ┌──────────┐  │
│ CCDC        4 │ │▤ Thẻ kho             │ │…          │ │🔒 Pro    │  │
│ Giá thành   2 │ └──────────────────────┘ └───────────┘ └──────────┘  │
│ Tổng hợp    5 │                                                      │
│ Quản trị    1 │                                                      │
└───────────────┴──────────────────────────────────────────────────────┘
```

- Cột trái: nhóm theo phân hệ, kèm số báo cáo. Bấm nhóm thì cuộn tới nhóm đó.
- Thẻ báo cáo: tên, mã, ký hiệu mẫu (gói Plus, Pro), biểu tượng khổ dọc hay ngang. Báo cáo ngoài gói hiện mờ có khoá. Gói Free ẩn hẳn (QD22).
- Dùng lại `.rpt-card`, `.rpt-grid` đang có.

### 3.2 Màn xem `/app/bao-cao/<mã>`, ví dụ `/app/bao-cao/4-2-1`

```
┌ ← Báo cáo  Mua hàng ▸ [Báo cáo mua hàng           ▾]     [In] [Xuất ▾] [Tuỳ chỉnh] ┐
│ [01/09/2026 – 30/09/2026] [Bộ lọc ▾ 2] [Xem báo cáo]                              │
├───────────────────────────────────────────────────────────────────────────────────┤
│  nền xám                                                                          │
│        ┌──────────── A4 ngang ────────────┐                                       │
│        │ Đơn vị: …          Mẫu số S…     │                                       │
│        │      BÁO CÁO MUA HÀNG            │                                       │
│        │  Từ ngày 01/09 đến ngày 30/09    │                                       │
│        │ ┌──┬──────┬─────┬──────┐         │                                       │
│        │ │A │  B   │  1  │  2   │         │                                       │
│        │ └──┴──────┴─────┴──────┘         │                                       │
│        │                    Trang 1/4     │                                       │
│        └──────────────────────────────────┘                                       │
├───────────────────────────────────────────────────────────────────────────────────┤
│ |◀ ◀ [ 1 ]/4 ▶ ▶|  · 312 dòng · A4 ngang ▾ ·    Liên tục | Từng trang   − 85% + Vừa khung │
└───────────────────────────────────────────────────────────────────────────────────┘
```

- Ô chọn báo cáo ở tiêu đề liệt kê báo cáo cùng nhóm phân hệ, có mục cuối "Tất cả báo cáo". Đổi báo cáo thì giữ kỳ, bỏ bộ lọc riêng.
- Đổi bộ lọc chưa vẽ lại ngay. Nút "Xem báo cáo" có chấm cam khi bộ lọc đã đổi mà chưa bấm, giống LedgerStudio.
- Nút "Xuất" mở menu: Excel (.xlsx), CSV, PDF, HTML, XML. Mỗi định dạng có lựa chọn "Cột như đang xem" hoặc "Đủ cột".
- "Tuỳ chỉnh" mở khung bên phải (mục 10).

## 4. Màn xem như bản in

- Tờ giấy theo milimét: A4 dọc 210 × 297, A4 ngang 297 × 210. Lề mặc định 15 mm trái, 10 mm ba cạnh còn lại.
- Chia trang: vẽ ẩn cả bảng một lần, đo chiều cao từng dòng, rồi xếp dòng vào trang. Trang 1 trừ phần đầu trang. Trang cuối cần chỗ cho ô ký, thiếu thì đẩy ô ký sang trang mới.
- Mỗi trang lặp lại tiêu đề cột và hàng ký hiệu cột. Sổ có thêm dòng "Cộng chuyển sang trang sau" ở cuối trang và "Số trang trước chuyển sang" ở đầu trang kế.
- Chân trang "Trang x/y". Sổ in thêm "Sổ này có … trang, đánh số từ trang 01 đến trang …" và "Ngày mở sổ".
- Zoom: dùng `transform: scale` kèm khung giữ chỗ, như Bẫy 17 của LedgerStudio. Không dùng CSS `zoom`. Mức 50–200%, mặc định Vừa khung (chỉ thu nhỏ, không phóng quá 100%). Nhớ lựa chọn trong localStorage.
- Hai chế độ xem: Liên tục (cuộn qua mọi trang) và Từng trang (một trang, bấm ◀ ▶). Báo cáo trên 30 trang chỉ vẽ trang đang trong tầm nhìn.
- In: các trang đã chia sẵn nên bản in khớp bản xem. CSS `@media print` gỡ khung app, gỡ scale, gỡ `zoom` 85% của `html` (T42), đặt `@page { size: A4 portrait|landscape }` theo khổ đang chọn, mỗi trang `break-after: page`.
- Cần tránh hai bẫy có sẵn trong `docs/BAY.md`: `html` đang bị `zoom` dưới 1700px nên mọi phép đo phải chia `heSoZoom()`; không đặt khung bật ra `position: fixed` bên trong tờ đã scale.

## 5. Mẫu chuẩn theo thông tư

Phần đầu và phần cuối dựng từ cấu hình của chế độ kế toán (mục 8), không theo gói. Bảng dưới là mặc định của từng chế độ:

| Thành phần | TT152 (hộ kinh doanh) | TT58 | TT133 | TT99 |
|---|---|---|---|---|
| Đầu trang trái | Tên, địa chỉ, MST | Đơn vị, địa chỉ, MST | Đơn vị, địa chỉ, MST | Đơn vị, địa chỉ, MST |
| Đầu trang phải | Mẫu số S…-HKD | Mẫu số S…-DNSN, B0x-DNSN | Mẫu số B0x-DNN, S0x-DNN, kèm căn cứ | Mẫu số B0x-DN, S0x-DN, kèm căn cứ |
| Hàng ký hiệu cột A, B, 1, 2… | Không | Có ở sổ | Có ở sổ, BCTC | Có ở sổ, BCTC |
| Ô ký | Người lập | 2 ô | 3 ô | 3 ô |
| Dòng "Ngày … tháng … năm …" | Có | Có | Có | Có |

- Căn cứ đọc từ `che-do.ts` (mục 8).
- Ký hiệu mẫu từng báo cáo gom về một file cấu hình. Ký hiệu chưa đối chiếu văn bản gốc thì đánh dấu "chờ duyệt", để kế toán trưởng duyệt ở việc T04.
- Chữ trong bảng 12px khi xem, 10pt khi in. Số tiền căn phải, số âm trong ngoặc. Dòng tổng in đậm, kẻ trên.
- Báo cáo tài chính B01, B02, B03, B09 và tờ khai thuế giữ đúng bố cục mẫu: khoá ẩn cột, khoá đổi thứ tự. Chỉ sửa được chức danh, họ tên ký.

## 6. Bộ lọc từng báo cáo

Ô Kỳ (khoảng ngày) có ở mọi báo cáo, trừ báo cáo chỉ cần một ngày. Ô Chi nhánh có ở mọi báo cáo khi đơn vị có nhiều chi nhánh. Hai ô này không ghi lại trong bảng dưới.

| Mã | Báo cáo | Khổ | Bộ lọc riêng | Gom nhóm được theo |
|---|---|---|---|---|
| 2.2.1 | Sổ quỹ tiền mặt | Dọc | Quỹ, loại phiếu (thu, chi), đối tượng | Ngày, quỹ |
| 2.2.2 | Sổ tài khoản | Ngang | Tài khoản (chọn nhiều), TK đối ứng, đối tượng; kiểu sổ: Sổ cái hoặc Sổ chi tiết | Tài khoản, đối tượng |
| 2.2.3 | Sổ ngân hàng | Dọc | Tài khoản ngân hàng, loại tiền | Tài khoản ngân hàng |
| 2.2.4 | Sổ nhật ký | Ngang | Loại chứng từ, tài khoản; Chi tiết hoặc Tổng hợp | Ngày, loại chứng từ |
| 2.2.5 | Sổ công nợ | Ngang | Loại đối tượng (khách, nhà cung cấp, nhân viên), đối tượng, TK công nợ; Tổng hợp hoặc Chi tiết; ẩn đối tượng không phát sinh | Đối tượng, tài khoản |
| 3.2.1 | Báo cáo bán hàng | Ngang | Nhóm món, món, kênh bán, ca; thống kê theo ngày, món, nhóm món, chi nhánh, ca | Nhóm món, ngày, chi nhánh |
| 3.2.2 | Đối soát với POS | Ngang | Trạng thái (khớp, lệch), phương thức thanh toán | Ngày |
| 3.2.3 | Báo cáo doanh thu | Ngang | Phương thức thanh toán, kênh bán; theo ngày, tuần, tháng; so kỳ trước | Chi nhánh, phương thức |
| 3.2.4 | Bảng kê điều chuyển | Ngang | Từ kho, đến kho, hàng hoá, trạng thái | Kho đi, kho đến |
| 4.2.1 | Báo cáo mua hàng | Ngang | Nhà cung cấp, nhóm NVL, NVL, nguồn (IVT, hoá đơn, nhập tay), có hoá đơn hay chưa | Nhà cung cấp, ngày, nhóm NVL |
| 4.2.2 | Tổng hợp mua hàng | Dọc | Tổng hợp theo: ngày, nhà cung cấp hoặc hàng hoá; nhà cung cấp, nhóm NVL | Theo lựa chọn "Tổng hợp theo" |
| 5.2.1 | Thẻ kho | Dọc | Kho (bắt buộc), hàng hoá (bắt buộc, chọn nhiều thì mỗi mặt hàng một thẻ, sang trang mới) | Không |
| 5.2.2 | Nhập kho, xuất kho | Ngang | Kho, loại (nhập, xuất, cả hai), lý do, nhóm hàng, hàng hoá | Kho, lý do, ngày |
| 5.2.3 | Xuất nhập tồn | Ngang | Kho, nhóm hàng, hàng hoá; ẩn mặt hàng không phát sinh; chỉ số lượng hoặc cả giá trị | Kho, nhóm hàng |
| 5.2.4 | Tồn kho tức thời | Dọc | Đến ngày (một ngày), kho, nhóm hàng; chỉ hàng dưới tồn tối thiểu | Kho, nhóm hàng |
| 5.2.5 | Đối chiếu xuất kho với định lượng | Ngang | Món, nhóm NVL, ngưỡng lệch % | Món |
| 5.2.6 | Sử dụng NVL so với định mức | Ngang | NVL, nhóm NVL, ngưỡng lệch % | Nhóm NVL |
| 5.2.7 | Tiêu hao NVL chính | Ngang | NVL chính, số mặt hàng đầu bảng (10, 20, 50), so kỳ trước | Không |
| 6.2.1 | Bảng kê mua vào | Ngang | Kỳ tính thuế (tháng, quý), thuế suất, nhóm hàng hoá dịch vụ, trạng thái hoá đơn | Thuế suất |
| 6.2.2 | Bảng kê bán ra | Ngang | Kỳ tính thuế, thuế suất; Chi tiết hoặc Tổng hợp | Thuế suất |
| 6.2.3 | Tờ khai thuế | Dọc | Kỳ tính thuế, lần đầu hoặc bổ sung lần thứ | Khoá |
| 7.2.1 | Sổ TSCĐ | Ngang | Loại tài sản, bộ phận sử dụng, trạng thái | Loại, bộ phận |
| 7.2.2 | Tăng, giảm TSCĐ | Ngang | Loại tài sản, lý do tăng giảm | Loại, lý do |
| 8.2.1 | Chi phí trả trước | Ngang | Loại chi phí, TK chi phí | Loại |
| 8.2.2 | Bảng kê CCDC | Ngang | Đến ngày, loại CCDC, bộ phận, trạng thái | Loại, bộ phận |
| 8.2.3 | Phân bổ CCDC | Ngang | Loại CCDC, bộ phận, TK chi phí | Bộ phận, TK chi phí |
| 8.2.4 | Tăng, giảm CCDC | Ngang | Loại CCDC, lý do | Loại, lý do |
| 9.2.1 | Tổng hợp chi phí phát sinh | Ngang | Khoản mục chi phí, đối tượng tập hợp | Khoản mục |
| 9.2.2 | Giá thành sản phẩm | Ngang | Nhóm món, món | Nhóm món |
| 10.2.1 | Cân đối số phát sinh | Ngang | Bậc tài khoản (1, 2, 3); ẩn TK không số dư, không phát sinh | Khoá |
| 10.2.2 | Cân đối kế toán | Dọc | Đến ngày; cột so sánh đầu năm; bỏ dòng bằng 0 | Khoá |
| 10.2.3 | Kết quả kinh doanh | Dọc | Kỳ so sánh (kỳ trước, cùng kỳ năm trước) | Khoá |
| 10.2.4 | Lưu chuyển tiền tệ | Dọc | Phương pháp trực tiếp hoặc gián tiếp | Khoá |
| 10.2.5 | Thuyết minh BCTC | Dọc | Năm tài chính | Khoá |
| 10.3.1 | Quản trị F&B | Ngang | So kỳ trước, nhóm chỉ tiêu | Không |

Bộ lọc khai bằng dữ liệu, không viết tay từng màn:

```ts
interface LocBC { k: string; nhan: string; kieu: 'chon' | 'chonNhieu' | 'gat' | 'ngay' | 'so'; nguon?: 'kho' | 'ncc' | 'hang' | 'tk' | …; batBuoc?: boolean; macDinh?: unknown }
```

Hàng đầu thanh lọc hiện Kỳ, Chi nhánh và tối đa hai ô bắt buộc. Các ô còn lại vào khung "Bộ lọc" (`LocNangCao`, `Popover` đang có), nút hiện số bộ lọc đang bật.

## 7. Bổ sung mẫu theo thông tư

Đối chiếu 35 báo cáo hiện có với danh mục mẫu sổ, báo cáo tài chính của từng chế độ thì còn thiếu. Gói Free theo TT152/2025 (hộ kinh doanh), Standard theo TT58/2026, Plus theo TT133/2016, Pro theo TT99/2025. Đợt này thêm 10 màn mới, sửa tên và ký hiệu mẫu của 15 màn cũ.

Nguyên tắc:

- Mỗi sổ làm một màn. Mẫu, tên và cột đổi theo gói. Ví dụ Sổ doanh thu hiện S1a-HKD ở Free, S1-DNSN ở Standard, S16-DNN ở Plus, S35-DN ở Pro.
- Số liệu đọc từ nguồn đang có: doanh thu, giá vốn, thuế đầu ra từ `DAILY`; kết quả kinh doanh từ `kqkd()`; số dư tài khoản từ `so-cai.ts`; hàng hoá từ dữ liệu kho của Xuất nhập tồn. Thiếu tài khoản thì thêm vào `so-cai.ts`, không gõ số cứng.
- Hai thông tư mới (TT58, TT152) mới đối chiếu qua bài tổng hợp của MISA và trang luật, chưa đọc văn bản gốc. Mọi ký hiệu dưới đây gắn nhãn "chờ duyệt" tới khi kế toán trưởng duyệt ở T04.

### 7.1 Màn mới

Mã tạm chọn tiếp sau mã lớn nhất của từng nhóm, Trum đổi được khi cập nhật Excel.

| Mã tạm | Báo cáo | Free (TT152) | Standard (TT58) | Plus (TT133) | Pro (TT99) | Nguồn số liệu |
|---|---|---|---|---|---|---|
| 2.2.6 | Sổ chi tiết tiền vay | – | – | S15-DNN | S34-DN | TK 341 trong `so-cai.ts` |
| 2.2.7 | Sổ chi tiết tiền (tiền mặt và ngân hàng chung một sổ) | S2e-HKD | S2d-DNSN | – | – | Sổ quỹ, sổ ngân hàng |
| 3.2.5 | Sổ doanh thu bán hàng / Sổ chi tiết bán hàng | S1a, S2a hoặc S2b-HKD theo nhóm nộp thuế | S1, S2a hoặc S3a-DNSN theo cách nộp thuế | S16-DNN | S35-DN | `DAILY` |
| 5.2.8 | Sổ chi tiết vật liệu, dụng cụ, hàng hoá | S2d-HKD | S2c-DNSN | S06-DNN | S10-DN | Dữ liệu kho của Xuất nhập tồn |
| 6.2.4 | Sổ theo dõi nghĩa vụ thuế GTGT | – | S3b-DNSN | S25-DNN | S61-DN | Thuế đầu ra `DAILY`, đầu vào phiếu mua |
| 6.2.5 | Sổ theo dõi nghĩa vụ thuế khác | S3a-HKD | S4c-DNSN | – | – | TK 3334, 3335, 3338 |
| 7.2.3 | Thẻ tài sản cố định | – | – | S11-DNN | S23-DN | Danh sách TSCĐ của 7.2.1 |
| 7.2.4 | Sổ theo dõi TSCĐ, CCDC tại nơi sử dụng | – | – | S10-DNN | S22-DN | TSCĐ, CCDC theo bộ phận |
| 10.4.1 | Sổ chi tiết doanh thu, chi phí | S2c-HKD | S2b-DNSN | – | – | `kqkd()` |
| 10.4.2 | Sổ theo dõi vốn chủ sở hữu | – | S4d-DNSN | S23-DNN | S51-DN | TK 411, 421 trong `so-cai.ts` |

Bộ lọc của màn mới:

| Mã tạm | Khổ | Bộ lọc riêng | Gom nhóm được theo |
|---|---|---|---|
| 2.2.6 | Ngang | Khế ước vay, ngân hàng cho vay | Khế ước |
| 2.2.7 | Dọc | Loại tiền (tiền mặt, ngân hàng), tài khoản ngân hàng | Loại tiền |
| 3.2.5 | Ngang | Nhóm nộp thuế (tự lấy theo cấu hình đơn vị), nhóm ngành nghề, nhóm món | Ngành nghề, ngày |
| 5.2.8 | Ngang | Kho, hàng hoá (chọn nhiều thì mỗi mặt hàng sang trang mới) | Không |
| 6.2.4 | Dọc | Kỳ tính thuế (tháng, quý) | Khoá |
| 6.2.5 | Dọc | Loại thuế | Loại thuế |
| 7.2.3 | Dọc | Tài sản (bắt buộc, chọn nhiều thì mỗi tài sản một thẻ) | Không |
| 7.2.4 | Ngang | Bộ phận sử dụng, loại (TSCĐ, CCDC) | Bộ phận |
| 10.4.1 | Ngang | Khoản mục doanh thu, chi phí | Khoản mục |
| 10.4.2 | Dọc | Chủ sở hữu, loại vốn | Chủ sở hữu |

### 7.2 Sửa tên và ký hiệu mẫu của màn cũ

| Mã | Màn | Free | Standard | Plus | Pro |
|---|---|---|---|---|---|
| 2.2.1 | Sổ quỹ tiền mặt | – | – | S04a-DNN | S07-DN |
| 2.2.2 | Sổ tài khoản: kiểu Sổ cái | – | – | S03b-DNN | S03b-DN |
| 2.2.2 | Sổ tài khoản: kiểu Sổ chi tiết | – | – | S19-DNN | S38-DN |
| 2.2.3 | Sổ ngân hàng (code đang ghi sai `S08-DNN`, đó là Thẻ kho) | – | – | S05-DNN | S08-DN |
| 2.2.4 | Sổ nhật ký chung | – | – | S03a-DNN | S03a-DN |
| 2.2.5 | Sổ công nợ | – | S4a-DNSN | S12-DNN | S31-DN |
| 5.2.1 | Thẻ kho | – | – | S08-DNN | S12-DN |
| 5.2.3 | Xuất nhập tồn | – | – | S07-DNN | S11-DN |
| 7.2.1 | Sổ TSCĐ | – | S4b-DNSN | S09-DNN | S21-DN |
| 9.2.1 | Sổ chi phí sản xuất, kinh doanh | – | – | S17-DNN | S36-DN |
| 9.2.2 | Thẻ tính giá thành | – | – | S18-DNN | S37-DN |
| 10.2.1 | Cân đối số phát sinh | – | – | F01-DNN (Bảng cân đối tài khoản) | S06-DN |
| 10.2.2 | Đổi tên thành Báo cáo tình hình tài chính | – | B01-DNSN | B01a-DNN | B01-DN |
| 10.2.3 | Kết quả kinh doanh | – | B02-DNSN | B02-DNN | B02-DN |
| 10.2.4, 10.2.5 | Lưu chuyển tiền tệ, Thuyết minh | – | – | B03-DNN, B09-DNN | B03-DN, B09-DN |

- Màn có dấu "–" ở một gói vẫn mở được nếu gói đó có quyền. Khi đó đầu trang không ghi ký hiệu mẫu, coi là báo cáo quản trị.
- Gói Free giữ màn Kết quả kinh doanh làm báo cáo quản trị. Hộ kinh doanh không phải lập báo cáo tài chính.
- `GOI.F.cheDo` trong `plan.ts` đang ghi "Chưa áp chế độ kế toán". Đổi thành TT152/2025/TT-BTC.

### 7.3 Khai màn mới khi Excel chưa có

`features.json` sinh từ Excel, chỉ máy Trum chạy lại được (T33). Trong lúc chờ:

- Thêm danh sách `BO_SUNG` trong `plan.ts`, cùng dạng phần tử của `features.json` (mã, tên, nhóm, gói), gộp vào `FEATURES` như cách `THEO_ROADMAP` đang làm (QD19). `tuExcel()` tự sinh màn, không sửa thêm chỗ nào.
- Khi Trum chạy lại script có đủ mã mới thì xoá dòng tương ứng trong `BO_SUNG`.
- Gói mở cho màn mới lấy theo cột có ký hiệu ở bảng 7.1. Riêng 7.2.3, 7.2.4 còn chờ Trum chốt TSCĐ có mở cho Plus không (câu hỏi 11, mục 14).

### 7.4 Để sau

- Bốn sổ nhật ký đặc biệt S03a1–S03a4 (thu tiền, chi tiền, mua hàng, bán hàng): tuỳ chọn, phần mềm dùng Nhật ký chung là đủ.
- Sổ ngoại tệ (S13, S14-DNN), sổ cổ phiếu, chứng khoán, đầu tư xây dựng: hiếm gặp ở F&B.
- Bộ báo cáo tài chính giữa niên độ của TT99: dành cho công ty niêm yết.
- XML tờ khai đúng chuẩn HTKK, tờ khai TNDN, TNCN: cần mẫu XSD gốc của cơ quan thuế.

## 8. Chế độ kế toán quyết định mọi mẫu

Yêu cầu của Trum (09/10/2026): chọn gói và thông tư ở cấu hình kế toán xong thì danh mục, chứng từ, mẫu in chứng từ, mẫu báo cáo liên quan phải khớp thông tư đó.

### 8.1 Hiện trạng

- Chế độ đang gắn cứng vào gói: `GOI[goi].cheDo` trong `plan.ts`. Màn Cấu hình hệ thống chỉ hiện chế độ ở ô chỉ đọc.
- Mẫu đang chọn bằng cách hỏi gói ở 13 file (`s.goi === 'PL'`, `kieuGhiSo(goi)`, `GOI[goi].cheDo`). Ví dụ ký hiệu mẫu chỉ hiện khi gói là Plus, kể cả báo cáo của gói Pro.
- Nút In ở form và danh sách chứng từ chỉ hiện thông báo, chưa có mẫu in.
- Danh mục tài khoản 1.1 và tài khoản mặc định ở bộ định khoản 1.15 dùng một bộ chung cho mọi chế độ.

### 8.2 Cách làm

Tách hai khái niệm. Gói quyết định mở tính năng nào. Chế độ kế toán quyết định mẫu, tên, ký hiệu, tài khoản.

- Thêm `cheDo` vào phiên làm việc (`session.tsx`), lưu theo đơn vị, cạnh `goi`.
- Tạo một nguồn duy nhất `src/app/che-do.ts`. Mỗi chế độ khai:

| Trường | Ví dụ TT133 |
|---|---|
| Số hiệu, tên, ngày ban hành | TT133/2016/TT-BTC |
| Có dùng tài khoản không, kiểu ghi sổ | Có, Nợ/Có |
| Hệ thống tài khoản | Danh sách tài khoản cấp 1, cấp 2 theo phụ lục của thông tư |
| Tài khoản mặc định cho bộ định khoản, kết chuyển | Chi phí bán hàng, quản lý ghi vào đâu |
| Mẫu chứng từ | Phiếu thu 01-TT, phiếu chi 02-TT, phiếu nhập kho 01-VT, phiếu xuất kho 02-VT… |
| Mẫu sổ, báo cáo | Bảng 7.1, 7.2 theo cột chế độ |
| Người ký mặc định | Người lập biểu, Kế toán trưởng, Người đại diện theo pháp luật |
| Tuỳ chọn thuế đi kèm | Phương pháp tính thuế GTGT; với TT58, TT152 thêm cách nộp thuế, quyết định dùng sổ S1, S2 hay S3 |

- Mọi màn đọc chế độ qua một hàm `cheDoHienTai(s)`. Bỏ hẳn kiểu hỏi `s.goi === 'PL'` để chọn mẫu. Kiểm bằng `grep`: ngoài `che-do.ts` và `plan.ts` không còn chỗ nào đọc `GOI[...].cheDo`.
- `kieuGhiSo()` chuyển sang đọc chế độ thay vì gói.

### 8.3 Những gì đổi theo chế độ

| Phần | Đổi gì |
|---|---|
| Danh mục tài khoản 1.1 | Nạp hệ thống tài khoản của chế độ. TT58, TT152 không dùng tài khoản thì ẩn màn |
| Cột tài khoản ở danh mục hàng hoá, đối tượng, kho | Tài khoản mặc định theo chế độ; ẩn khi chế độ không dùng tài khoản |
| Bộ định khoản 1.15, kết chuyển 10.1.5 | Tài khoản mặc định theo chế độ |
| Form chứng từ | Dòng hạch toán Nợ/Có hay ghi sổ không tài khoản (đã có theo gói, chuyển sang theo chế độ); tên loại chứng từ |
| Mẫu in chứng từ (mới) | Mỗi loại chứng từ có mẫu in theo chế độ, chi tiết ở mục 8.6 |
| Sổ, báo cáo | Ký hiệu, tên, căn cứ, người ký theo bảng 7.1, 7.2 |
| Thuế | Phương pháp tính thuế GTGT, mẫu tờ khai |
| Trung tâm báo cáo | Chỉ liệt kê mẫu có trong chế độ, cộng báo cáo quản trị |
| Thanh trên, chọn đơn vị, Khởi tạo | Hiện chế độ thật của đơn vị thay vì suy từ gói |

### 8.4 Cấu hình và đổi chế độ

- Bước 1 của Khởi tạo và màn Cấu hình hệ thống cho chọn gói và chế độ. Chỉ cho chọn cặp hợp lệ, xem câu hỏi 12.
- Đổi chế độ khi đã có chứng từ: hộp xác nhận ghi rõ danh mục tài khoản, mẫu in, mẫu báo cáo sẽ đổi. Nghiệp vụ thật chỉ đổi từ đầu năm tài chính và chuyển số dư bằng 10.1.9. Bản mẫu áp ngay để xem thử.
- Nút "Trải nghiệm gói" trên thanh trên: đổi gói thì đổi chế độ về chế độ mặc định của gói đó.
- Số tiền không đổi khi đổi chế độ. Chỉ số hiệu, tên tài khoản và mẫu đổi. `so-cai.ts` có bảng ánh xạ tài khoản giữa TT133 và TT99 để báo cáo hai chế độ cùng ra một tổng.

### 8.5 Kiểm

- `kiem_tra.py` chạy thêm vòng theo chế độ: mỗi chế độ mở danh mục tài khoản, một form chứng từ, mẫu in phiếu thu, ba báo cáo tài chính. Đọc ký hiệu mẫu trên trang, so với `che-do.ts`.
- Báo cáo tài chính phải cân ở cả TT133 và TT99 với cùng dữ liệu.

### 8.6 Mẫu in từng chứng từ

Hiện nút In ở form chứng từ, menu In ở dòng danh sách và In hàng loạt chỉ hiện thông báo. Đợt này làm mẫu in thật cho mọi loại chứng từ, ký hiệu và đầu mẫu đọc từ chế độ đang cấu hình.

Bảng ghép chứng từ với mẫu in:

| Màn, loại chứng từ | Mẫu in | TT133, TT99 | TT58, TT152 |
|---|---|---|---|
| 2.1.1 Thu tiền mặt | Phiếu thu | 01-TT | Theo phụ lục chứng từ của thông tư |
| 2.1.1 Chi tiền mặt | Phiếu chi | 02-TT | Như trên |
| 2.1.1 Chuyển quỹ | Phiếu chi (nộp tiền vào ngân hàng) hoặc Phiếu thu (rút về quỹ) | 02-TT, 01-TT | Như trên |
| 2.1.1 Thu ngân hàng | Phiếu thu ngân hàng (chứng từ nội bộ kèm giấy báo có) | Tự thiết kế | Tự thiết kế |
| 2.1.1 Chi ngân hàng | Uỷ nhiệm chi | Mẫu chung của ngân hàng | Như cột trái |
| 2.1.2 Đối chiếu công nợ | Biên bản đối chiếu công nợ | Tự thiết kế | Tự thiết kế |
| 3.1.1 Bán hàng FABi | Bảng kê bán hàng theo ngày, chi nhánh | Tự thiết kế | Tự thiết kế |
| 3.1.2, 3.1.5, 3.1.6 Hoá đơn | Bản thể hiện hoá đơn điện tử, hoá đơn điều chỉnh, thay thế | Theo quy định hoá đơn, không theo thông tư kế toán | Như cột trái |
| 3.1.3 Bán hàng nội bộ, 5.1.4 Điều chuyển kho | Phiếu xuất kho kiêm vận chuyển nội bộ | Theo quy định hoá đơn | Như cột trái |
| 3.1.4 Hàng bán trả lại, 4.1.1–4.1.3 Mua hàng, 5.1.1 Nhập khác | Phiếu nhập kho | 01-VT | Theo phụ lục chứng từ |
| 4.1.1 Mua hàng ở chợ không có hoá đơn | Thêm Bảng kê mua hàng | 06-VT | Theo phụ lục chứng từ |
| 4.1.4 Trả lại hàng mua, 5.1.2 Xuất bán, xuất huỷ, xuất khác | Phiếu xuất kho | 02-VT | Theo phụ lục chứng từ |
| 5.1.2 Xuất huỷ | Thêm Biên bản huỷ hàng | Tự thiết kế | Tự thiết kế |
| 5.1.3, 5.1.6 Chế biến, sơ chế | Phiếu xuất kho nguyên liệu và Phiếu nhập kho thành phẩm | 02-VT, 01-VT | Theo phụ lục chứng từ |
| 5.1.10 Kiểm kê kho, 8.1.3 Kiểm kê CCDC | Biên bản kiểm kê vật tư, hàng hoá | 05-VT | Theo phụ lục chứng từ |
| 7.1.2 Ghi tăng, điều chuyển TSCĐ | Biên bản giao nhận TSCĐ | 01-TSCĐ | S4b-DNSN không có mẫu này |
| 7.1.2 Thanh lý TSCĐ | Biên bản thanh lý TSCĐ | 02-TSCĐ | Như trên |
| 7.1.3 Tính khấu hao | Bảng tính và phân bổ khấu hao TSCĐ | 06-TSCĐ | Như trên |
| 8.1.2 Phân bổ CCDC | Bảng phân bổ nguyên vật liệu, CCDC | 07-VT | Theo phụ lục chứng từ |
| 2.1.3, 4.1.5, 4.1.6, 5.1.11, 10.1.1 và chứng từ tổng hợp khác | Phiếu kế toán | Tự thiết kế | Tự thiết kế |

- Ký hiệu cột TT133, TT99 là ký hiệu quen dùng từ TT200, TT133. TT99 và hai thông tư mới phải tra phụ lục chứng từ gốc, gắn nhãn "chờ duyệt" tới T04.
- Chứng từ "tự thiết kế" vẫn in đủ đầu trang đơn vị, số, ngày, người ký. Đầu trang không ghi "Mẫu số".

Bố cục mẫu in:

- Mỗi mẫu là cấu hình dữ liệu trong `src/app/mau-in.ts`: ký hiệu theo chế độ, tiêu đề, khối thông tin (người nộp, địa chỉ, lý do…), bảng dòng, dòng tổng, số tiền bằng chữ, ô ký, số liên. Không viết JSX riêng cho từng phiếu.
- Đầu mẫu bên trái là đơn vị, bộ phận. Bên phải là "Mẫu số … (Ban hành theo Thông tư số … của Bộ Tài chính)" đọc từ `che-do.ts`. Có Quyển số, Số. Nợ, Có chỉ hiện khi chế độ dùng tài khoản.
- Khổ mặc định: phiếu thu, phiếu chi A5 ngang; phiếu nhập, xuất kho, biên bản A4 dọc; bảng phân bổ A4 ngang. Tuỳ chọn in 2 liên trên một tờ A4.
- Số tiền bằng chữ: thêm hàm `docSoTien()` trong `src/ui/format.ts`. Kiểm các ca 0, 5, 15, 105, 1.000.005, 1.234.567.890.
- Ô ký theo mẫu, ví dụ phiếu thu có Giám đốc, Kế toán trưởng, Người nộp tiền, Người lập phiếu, Thủ quỹ. Sửa chức danh, họ tên bằng thẻ Người ký của khung Tuỳ chỉnh (mục 10).

Cách dùng:

- Nút In ở form, menu In ở dòng danh sách: mở khung xem trước toàn màn hình (`FormToanMan`), dùng lại tờ giấy, zoom, chọn khổ của màn xem báo cáo. Trên khung có In, Xuất PDF, Xuất HTML.
- Chứng từ có nhiều mẫu (phiếu mua hàng có Phiếu nhập kho và Bảng kê mua hàng): nút In có menu chọn mẫu, mẫu đầu là mặc định.
- In hàng loạt: các phiếu đã tick in liền, mỗi phiếu sang trang mới.
- Sửa mẫu in làm ở tiện ích Thiết kế mẫu in (mục 8.7). Trên khung xem trước có nút "Sửa mẫu" mở thẳng tiện ích với đúng mẫu đang in.

### 8.7 Tiện ích thiết kế mẫu in

Làm màn riêng cho tiện ích 11.11 "Tự thiết kế phiếu in, báo cáo" (Excel mở cho Plus, Pro). Hiện màn này chỉ là màn chức năng chung có một nút.

Bố cục ba cột:

```
┌ Thiết kế mẫu in ──────────────────────────────────────────────── [Về mẫu chuẩn] [Lưu] ┐
│ Mẫu             │  Xem trước (dữ liệu một phiếu thật)          │ Thuộc tính             │
│ ▸ Tiền          │  ┌──────────── A5 ngang ─────────────┐       │ Đang chọn: cột Số tiền │
│   Phiếu thu  ●  │  │ Đơn vị …          Mẫu số 01-TT   │       │ Tên cột  [Số tiền    ] │
│   Phiếu chi     │  │        PHIẾU THU                 │       │ Hiện     [x]           │
│ ▸ Kho           │  │ Họ tên người nộp: …              │       │ Rộng     [ 32 ] mm     │
│   Phiếu nhập    │  │ ┌────┬──────────┬────────┐       │       │ Căn      trái giữa phải│
│   Phiếu xuất    │  │ │STT │ Diễn giải │Số tiền │       │       │ Cỡ chữ   [ 10 ] pt     │
│ ▸ TSCĐ          │  │ └────┴──────────┴────────┘       │       │                        │
│ Mẫu của phiếu:  │  │ Giám đốc  Kế toán trưởng  …      │       │                        │
│ ◉ Mẫu chuẩn     │  └───────────────────────────────────┘       │                        │
│ ○ Mẫu A5 gọn    │                         − 100% + Vừa khung   │                        │
└─────────────────┴──────────────────────────────────────────────┴────────────────────────┘
```

- Cột trái: danh sách mẫu chia theo phân hệ, giống bảng mục 8.6. Dưới là các mẫu của chứng từ đang chọn, đánh dấu mẫu mặc định.
- Cột giữa: tờ xem trước dùng lại `ToGiay` và thanh zoom. Bấm vào phần tử nào trên tờ thì cột phải hiện thuộc tính của phần tử đó.
- Cột phải: thuộc tính, chia thẻ Trang, Tiêu đề, Thông tin chung, Bảng chi tiết, Người ký.

Những gì sửa được:

| Phần | Sửa được |
|---|---|
| Trang | Khổ (A4, A5), hướng, lề, số liên trên một tờ, cỡ chữ chung (8–14pt), phông chữ |
| Tiêu đề | Chữ tiêu đề, cỡ chữ, in đậm, hiện hay ẩn dòng phụ (ngày, số, quyển số) |
| Thông tin chung | Từng trường (người nộp, địa chỉ, lý do, kèm theo…): hiện hay ẩn, đổi nhãn, kéo đổi thứ tự, chia 1 hoặc 2 cột, độ rộng nhãn |
| Bảng chi tiết | Từng cột: hiện hay ẩn, đổi tên, kéo đổi thứ tự, độ rộng (mm), căn lề, cỡ chữ. Cả bảng: chiều cao dòng (mm), số dòng trống tối thiểu để in đủ khung, hiện hay ẩn dòng tổng |
| Người ký | Số ô ký, chức danh, dòng gợi ý "(Ký, họ tên)", họ tên in sẵn mặc định, để trống cho ký tay |
| Khối | Mọi khối (đầu trang, mẫu số, tiêu đề, thông tin chung, bảng, số tiền bằng chữ, ô ký, chân trang): hiện hay ẩn, đổi thứ tự trên dưới |

Thao tác trên tờ xem trước:

- Kéo mép cột để đổi độ rộng. Số mm cập nhật ngay ở cột phải.
- Kéo trường trong danh sách Thông tin chung, kéo tiêu đề cột trong danh sách Bảng chi tiết để đổi vị trí.
- Bố cục vẫn chảy theo hàng, không đặt toạ độ tự do. Phiếu nhiều dòng hay ít dòng đều không vỡ.

Lưu và quản lý mẫu:

- Mẫu chuẩn theo thông tư không sửa trực tiếp. Bấm sửa thì tự tạo bản sao "Mẫu riêng". Mẫu chuẩn luôn còn để in khi cần.
- Một chứng từ có nhiều mẫu riêng, đặt được mẫu mặc định. Có Nhân bản, Đổi tên, Xoá, Về mẫu chuẩn.
- Xuất, nhập mẫu ra file `.json` để chép sang đơn vị khác.
- Lưu theo đơn vị, loại chứng từ, chế độ kế toán. Đổi chế độ thì mẫu riêng của chế độ cũ giữ nguyên, không áp sang chế độ mới.
- Chưa có backend nên lưu localStorage, đọc ghi bọc `try/catch`, hỏng thì quay về mẫu chuẩn.

Ràng buộc:

- Không cho ẩn nội dung bắt buộc của chứng từ kế toán: tên và số chứng từ, ngày lập, tên đơn vị, nội dung nghiệp vụ, số tiền, chữ ký. Ô bị khoá có biểu tượng khoá và dòng giải thích.
- Mẫu riêng in đầu trang "Mẫu số …" của mẫu gốc khi không ẩn nội dung bắt buộc nào (câu hỏi 16).
- Lõi tuỳ chỉnh (cột, độ rộng, thứ tự, người ký, trang) viết một lần trong `src/ui/thiet-ke/`. Khung Tuỳ chỉnh báo cáo (mục 10) dùng lại lõi này.

Kiểm:

- Mỗi loại chứng từ: tạo mẫu riêng, ẩn một cột, đổi tên, đổi rộng, đổi thứ tự, lưu, tải lại trang, in. Bản in phải đúng như xem trước.
- Ẩn hết cột không bắt buộc vẫn in được. Độ rộng cột cộng lại vượt khổ thì báo, không cho lưu.
- Kéo mép cột ở màn rộng dưới 1700px (đang có `zoom` 85%) và ở mức zoom tờ 75%, 150%: số mm phải đúng.

## 9. In và xuất file

| Định dạng | Cách làm | Ghi chú |
|---|---|---|
| In | `window.print()` trên các trang đã chia | Khổ dọc, ngang theo lựa chọn |
| PDF | Hộp in của trình duyệt, chọn "Lưu dưới dạng PDF" | Không thêm thư viện, chữ tiếng Việt nét. Muốn tải thẳng file thì cần thư viện, xem câu hỏi 3 |
| XLSX | Thư viện `exceljs`, chỉ tải khi bấm Xuất | Giữ đầu trang, gộp ô tiêu đề, kẻ khung, định dạng số `#,##0;(#,##0)`, khổ in, lặp tiêu đề cột, ô ký |
| CSV | Tự viết | UTF-8 có BOM để Excel đọc đúng dấu, số lưu số thô |
| HTML | Tự viết | Một file chứa các trang đã chia và CSS in, mở bằng trình duyệt nào cũng in được |
| XML | Tự viết | Cấu trúc chung: thông tin đơn vị, kỳ, cột, dòng. Tờ khai đúng chuẩn HTKK để việc sau |

- Tên file: `<mã>_<tên không dấu>_<từ ngày>_<đến ngày>.<đuôi>`, vd `4.2.1_Bao_cao_mua_hang_01092026_30092026.xlsx`.
- File xuất theo tuỳ chỉnh đang dùng (cột, thứ tự, tên cột, nhóm, chức danh) khi chọn "Như đang xem".
- `exceljs` nạp bằng `import()` nên tách thành gói JS riêng, không làm nặng lúc mở app (việc T13 đang cảnh báo gói trên 500 kB).

## 10. Tuỳ chỉnh mẫu

Khung bên phải, bốn thẻ:

1. Cột: bật tắt từng cột, kéo để đổi thứ tự, bấm tên để đổi tên, chỉnh độ rộng. Nút "Hiện tất cả", "Về mẫu chuẩn". Phải còn ít nhất một cột. Dùng lại khung "Tuỳ chọn cột" của T46 nếu vừa.
2. Gom nhóm: chọn tối đa hai cấp trong danh sách "Gom nhóm được theo" (mục 6). Mỗi nhóm có dòng cộng. Tuỳ chọn mỗi nhóm sang trang mới. Trên bản xem bấm tiêu đề nhóm để thu gọn.
3. Người ký: số ô ký (0–4), chức danh, họ tên, dòng "Ngày … tháng … năm …", nơi lập. Mặc định lưu chung cho cả đơn vị, có ô tick "Chỉ báo cáo này".
4. Trang: khổ dọc hoặc ngang, lề, cỡ chữ (9–12pt), lặp tiêu đề cột, số trang, dòng cộng chuyển trang.

- Lưu trong localStorage theo đơn vị và mã báo cáo: `bc-mau:<đơn vị>:<mã>`, `bc-ky:<đơn vị>`. Chưa có backend nên mỗi máy giữ riêng. Đọc ghi bọc `try/catch`, hỏng thì về mẫu chuẩn.
- Báo cáo khoá bố cục (mục 5) chỉ mở thẻ Người ký và Trang.

## 11. Thay đổi trong code

Muốn xuất file, ẩn cột, gom nhóm thì báo cáo phải trả **dữ liệu** chứ không trả JSX. Đây là phần nặng nhất.

```ts
interface DuLieuBC {
  cot: CotBC[]            // k, t, num, w, nhom (tiêu đề hai tầng), kyHieu ('A', '1'…), batBuoc
  dong: Row[]             // _b in đậm, _t dòng tổng, _i thụt lề, _nhom
  dauKy?: Row; cuoiKy?: Row
}
type LayDuLieu = (loc: Record<string, unknown>, cheDo: CheDo) => DuLieuBC
```

File mới:

| File | Việc |
|---|---|
| `src/modules/bao-cao/index.ts` | Phân hệ Báo cáo: màn Trung tâm, màn xem gom từ mọi phân hệ |
| `src/modules/bao-cao/TrungTam.tsx` | Trung tâm báo cáo |
| `src/modules/bao-cao/danh-sach.ts` | Cấu hình 45 báo cáo: khổ, ký hiệu mẫu theo chế độ, bộ lọc, cột gom nhóm, khoá bố cục |
| `src/ui/bao-cao/XemBaoCao.tsx` | Khung màn xem: tiêu đề, ô chọn báo cáo, thanh lọc, công cụ |
| `src/ui/bao-cao/ToGiay.tsx` | Đo và chia trang, đầu trang, chân trang, ô ký |
| `src/ui/bao-cao/ThanhTrang.tsx` | Thanh dưới: trang, zoom, khổ, chế độ xem |
| `src/ui/bao-cao/TuyChinh.tsx` | Khung Tuỳ chỉnh 4 thẻ |
| `src/ui/bao-cao/boLoc.tsx` | Dựng ô lọc từ cấu hình `LocBC` |
| `src/ui/bao-cao/xuat.ts` | CSV, HTML, XML, gọi XLSX |
| `src/ui/bao-cao/xuatXlsx.ts` | XLSX bằng `exceljs`, nạp muộn |
| `src/ui/bao-cao/mau.ts` | Đầu trang, căn cứ, người ký theo chế độ |
| `src/app/che-do.ts` | Nguồn duy nhất của chế độ kế toán: tài khoản, mẫu chứng từ, mẫu sổ, báo cáo, người ký (mục 8) |
| `src/ui/InChungTu.tsx` | Khung xem trước và in chứng từ, dùng khung chia trang của `ToGiay` |
| `src/app/mau-in.ts` | Cấu hình mẫu in từng loại chứng từ theo chế độ (mục 8.6) |
| `src/modules/tien-ich/ThietKeMauIn.tsx` | Màn tiện ích 11.11 Thiết kế mẫu in (mục 8.7) |
| `src/ui/thiet-ke/` | Lõi tuỳ chỉnh dùng chung cho mẫu in và báo cáo: danh sách cột, kéo đổi thứ tự, kéo mép cột, người ký, trang |
| Màn mới mục 7.1 | 10 sổ, khai trong `BO_SUNG` của `plan.ts` và `rieng` của từng phân hệ |

File sửa:

| File | Sửa gì |
|---|---|
| `src/app/registry.ts` | Thêm phân hệ Báo cáo sau Tổng hợp. Tab "Báo cáo" của phân hệ khác trỏ sang Trung tâm đã lọc nhóm |
| `src/app/Screen.tsx` | Đường dẫn cũ `/app/mua-hang/4-2-1` chuyển sang `/app/bao-cao/4-2-1` |
| `src/ui/generic/ReportScreen.tsx` | Tách `renderReport` thành hàm trả `DuLieuBC`. Giữ `ReportPaper`, `RptTable` cho màn cũ tới khi chuyển xong |
| `src/ui/generic/BaoCaoScreen.tsx` | Chuyển thành Trung tâm hoặc bỏ |
| `src/ui/generic/QuyTrinhScreen.tsx` | Khung Báo cáo trên sơ đồ trỏ sang đường dẫn mới |
| `src/app/SidebarFlyout.tsx`, `CommandPalette.tsx` | Phân hệ Báo cáo, tìm báo cáo bằng Ctrl K |
| 10 màn báo cáo riêng | Chuyển dần sang `LayDuLieu` (đợt 11) |
| `src/styles/app.css` | Mục mới cuối file `/* ── Phân hệ Báo cáo (T47) ── */`, thêm `@media print` |
| `tools/kiem_tra.py` | Script đang đọc `.rpt-card`, `/bao-cao`, `.report .kn-nut`, `.report .chip.err`. Giữ các lớp này hoặc sửa script. Thêm kiểm: đủ 35 báo cáo mở được, chia trang không tràn, đổi khổ không lỗi |
| `src/app/plan.ts`, `session.tsx` | `BO_SUNG`, `cheDo` trong phiên, `kieuGhiSo()` đọc chế độ, `GOI.F` hết ghi "Chưa áp chế độ" |
| `src/modules/he-thong/HeThong.tsx`, `onboarding/KhoiTao.tsx`, `app/Topbar.tsx`, `auth/ChonDonVi.tsx` | Chọn chế độ, hiện chế độ thật của đơn vị |
| `src/modules/danh-muc/index.ts`, `tong-hop/so-cai.ts` | Hệ thống tài khoản, tài khoản mặc định theo chế độ; ánh xạ TT133 và TT99 |
| `src/ui/generic/ChungTuForm.tsx`, `VoucherScreen.tsx`, `src/ui/LocNangCao.tsx` | Đọc chế độ thay gói; nút In, menu In, In hàng loạt mở mẫu in |
| `src/ui/format.ts` | Thêm `docSoTien()` |
| `src/modules/tien-ich/index.ts` | 11.11 chuyển sang `kind: 'custom'` |
| 13 file đang hỏi gói để chọn mẫu | Chuyển sang `cheDoHienTai(s)` |
| `docs/KIEN-TRUC.md`, `docs/QUYET-DINH.md`, `CHANGELOG.md` | Ghi kiến trúc, QD mới, thay đổi |

## 12. Thứ tự làm

Mỗi đợt một commit, chạy đủ bước "Trước khi push" rồi mới push, để bản online luôn chạy được.

| Đợt | Nội dung | Xong khi |
|---|---|---|
| 0 | Nhận việc: dòng T47 trong `TIEN-DO.md`, giữ chỗ QD31 | Đã push |
| 1 | Chế độ kế toán làm gốc: `che-do.ts`, `cheDo` trong phiên, chọn ở Cấu hình và Khởi tạo, 13 file chuyển sang đọc chế độ. Chưa thêm mẫu mới | Giao diện mọi gói y như trước; `grep` không còn chỗ chọn mẫu theo gói |
| 2 | Phân hệ Báo cáo, Trung tâm, đường dẫn mới, chuyển hướng đường dẫn cũ, ô chọn báo cáo cùng nhóm | 35 báo cáo mở được từ Trung tâm và từ link cũ, gói Free ẩn đúng |
| 3 | Màn xem: tờ A4, chia trang, zoom, thanh dưới, in dọc ngang | In ra PDF bằng trình duyệt khớp số trang trên màn xem |
| 4 | Mẫu chuẩn theo chế độ: đầu trang, ký hiệu mẫu, hàng ký hiệu cột, cộng chuyển trang, ô ký. Danh mục tài khoản, tài khoản mặc định theo chế độ | Đổi chế độ thì danh mục, đầu trang báo cáo đổi đúng mục 5, 8.3 |
| 5 | Mẫu in chứng từ theo mục 8.6: cấu hình `mau-in.ts`, khung xem trước, In ở form, danh sách, hàng loạt, `docSoTien()` | Mọi loại chứng từ in được; đổi chế độ thì ký hiệu mẫu, Nợ/Có trên phiếu đổi theo |
| 6 | Tiện ích thiết kế mẫu in (mục 8.7) và lõi tuỳ chỉnh `src/ui/thiet-ke/` | Sửa được cỡ chữ, tên cột, tiêu đề, chức danh, người ký, ẩn hiện, thứ tự, chiều cao dòng, độ rộng cột; tải lại vẫn giữ; bản in khớp xem trước |
| 7 | Tách dữ liệu 25 báo cáo màn chung thành `DuLieuBC`, bộ lọc theo bảng mục 6 | Tổng cộng từng báo cáo trước và sau khi tách bằng nhau |
| 8 | Bổ sung 10 mẫu sổ mục 7.1, sửa tên và ký hiệu mục 7.2 | Mỗi chế độ mở đủ mẫu trong bảng; số trên sổ mới khớp sổ cái, KQKD |
| 9 | Xuất CSV, HTML, XML, XLSX, PDF | Mở file XLSX bằng Excel đúng khung, đúng số; CSV đúng dấu tiếng Việt |
| 10 | Tuỳ chỉnh báo cáo dùng lõi của đợt 6: cột, gom nhóm, người ký, trang; lưu theo đơn vị | Tải lại trang vẫn giữ tuỳ chỉnh; "Về mẫu chuẩn" trả về như cũ |
| 11 | Chuyển 10 báo cáo riêng sang `DuLieuBC` | `kiem_tra.py` vẫn báo BCTC cân ở kỳ 8, 9, 10, cả TT133 và TT99 |
| 12 | Tài liệu, nhật ký, CHANGELOG | Đủ mục "Cuối phiên" |

Trước đợt 1, đợt 7 và đợt 11 chụp lại tổng cộng của mọi báo cáo ở kỳ 8, 9, 10 cho cả 4 gói, làm mốc so sau khi sửa. Luật trong `KIEN-TRUC.md`: số liệu các màn phải khớp nhau, không gõ số cứng.

## 13. Rủi ro đã thấy

1. Đụng việc người khác: T25 của PhuongXT đang dở sổ quỹ, sổ ngân hàng, sổ công nợ (2.2.1, 2.2.3, 2.2.5). T08 định làm riêng 4.2.1, 6.2.1, 3.2.4. T07 làm báo cáo TSCĐ, CCDC. T03 nối các sổ vào `so-cai.ts`.
2. **QD08** ghi cố ý chưa làm mục Báo cáo chung trên sidebar. Cần QD mới thay.
3. Chi nhánh: `KIEN-TRUC.md` bảo màn mới đọc chi nhánh trên thanh trên. Báo cáo lại hay cần gộp nhiều chi nhánh.
4. **Thư viện mới** (`exceljs`): QD02 chỉ cho React, router. Thêm thư viện phải commit cả `package-lock.json`, robot chạy `npm ci`.
5. **Zoom 85% của `html`** (T42) làm lệch phép đo chiều cao dòng và bản in. Phải chia `heSoZoom()` và gỡ zoom khi in.
6. Báo cáo dài: dữ liệu giả ít dòng nên chưa thấy chậm. Đã tính chỉ vẽ trang trong tầm nhìn khi trên 30 trang, để khi nối API (T06) không phải làm lại.
7. Tuỳ chỉnh nằm ở localStorage: đổi máy là mất. Khi có backend thì chuyển lên máy chủ.
8. **Script kiểm** dựa vào lớp CSS của màn cũ. Đổi màn mà quên sửa script thì robot báo đỏ hoặc bỏ sót.
9. **Ký hiệu mẫu, căn cứ thông tư** chưa đối chiếu văn bản gốc (T04). In ra cho khách xem phải ghi chú "mẫu minh hoạ".
10. TT58, TT152 mới tra qua bài tổng hợp. Bài của MISA về TT58 tự mâu thuẫn chỗ tên sổ S2a, S3a và bộ báo cáo tài chính. Cần văn bản gốc.
11. Đợt 1 đụng nhiều file dùng chung: `ChungTuForm.tsx`, `VoucherScreen.tsx`, `session.tsx`, `plan.ts`. Ghi vào cột Ghi chú của `TIEN-DO.md`, báo hai bạn trước khi làm.
12. Tách chế độ khỏi gói làm số tổ hợp tăng. Chỉ cho chọn cặp hợp lệ, script kiểm chạy đủ các cặp đó.
13. Màn mới chưa có trong Excel nên `BO_SUNG` phải xoá khi Trum chạy lại `xuat_tinh_nang.py`, nếu không sẽ trùng mã.
14. Ký hiệu chứng từ của TT58, TT152 chưa tra được. Mẫu in hai chế độ này tạm dùng bố cục TT133, bỏ Nợ/Có, ghi "chờ duyệt".
15. Kéo mép cột trên tờ đang scale, trong `html` đang `zoom` 85%: phải chia cả hai hệ số, nếu không số mm lệch.

Quay đầu: mỗi đợt là một commit. Đợt nào hỏng thì `git revert` đúng commit đó, không viết lại lịch sử.

## 14. Đã chốt

Trum chốt 09/10/2026: làm theo mặc định cả 17 điểm dưới đây.

1. Tab "Báo cáo" của từng phân hệ trỏ sang Trung tâm đã lọc nhóm đó. Link cũ tự chuyển sang `/app/bao-cao/<mã>`.
2. Ghi QD31 thay ý "chưa làm mục Báo cáo chung" của QD08.
3. PDF dùng hộp in của trình duyệt, không thêm thư viện.
4. XLSX dùng `exceljs`, chỉ tải khi bấm Xuất.
5. Chi nhánh theo thanh trên; Bộ lọc có ô chọn nhiều chi nhánh ở gói Plus, Pro.
6. Báo cáo tài chính và tờ khai khoá ẩn cột, đổi thứ tự cột; chỉ sửa người ký.
7. Tuỳ chỉnh lưu localStorage theo đơn vị; người ký dùng chung cả đơn vị.
8. Ký hiệu mẫu gắn nhãn "chờ duyệt" tới T04. XML làm cấu trúc chung, XML tờ khai chuẩn HTKK để sau.
9. Gộp T07, T08 vào việc này. Ba sổ của T25 chuyển sau cùng, khi PhuongXT làm xong.
10. Tui làm đợt 0–6 (nền chung, mẫu in, thiết kế mẫu in). Đợt 7–12 Trum chia người hoặc để tui làm tiếp.
11. Mở TSCĐ (7.2.1, 7.2.3, 7.2.4) cho gói Plus, vì TT133 vẫn phải trích khấu hao để lập báo cáo tài chính.
12. Cặp gói và chế độ hợp lệ: Free chỉ TT152; Standard chỉ TT58 (không dùng tài khoản); Plus mặc định TT133, chọn được TT99; Pro mặc định TT99, chọn được TT133.
13. Đổi chế độ khi đã có chứng từ: bản mẫu áp ngay kèm hộp cảnh báo; ghi chú rằng bản thật chỉ cho đổi từ đầu năm tài chính.
14. Mẫu in chứng từ: phiếu thu, phiếu chi in A5 ngang, có tuỳ chọn 2 liên trên A4.
15. Thiết kế mẫu in theo gói Excel của 11.11: Plus, Pro sửa đủ. Free, Standard chỉ sửa người ký, cỡ chữ, khổ.
16. Mẫu riêng vẫn in "Mẫu số …" của mẫu gốc nếu không ẩn nội dung bắt buộc nào.
17. Phông chữ cho chọn hai loại: phông của app và Times New Roman (phông thường dùng trên giấy tờ kế toán).
