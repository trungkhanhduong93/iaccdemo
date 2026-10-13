# Hiện lại bộ sổ hộ kinh doanh TT152 (T179)

- Ngày: 13/10/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/modules/bao-cao/danh-sach.ts`: thêm `GIU_TT152_HKD` (2.2.7, 3.2.5, 5.2.8, 10.4.1), `laHkd`, `cachHkd`, trường `hkd` trong `CauHinhBC`. 2.2.7, 10.4.1 mở cho TT152; 5.2.8 bỏ ẩn tạm TT152. `kyHieuBC` cho Sổ doanh thu 3.2.5 ở TT152 đổi mẫu theo cách tính thuế: nhóm 1 S1a-HKD, TNCN theo % doanh thu S2a-HKD, theo lợi nhuận S2b-HKD.
- `src/app/registry.ts`: `apDung` chỉ hiện sổ hộ kinh doanh khi đơn vị là hộ kinh doanh (doanh nghiệp gói Free cũng chạy TT152 nhưng không có), lọc theo `hkd`.
- Bộ sổ theo Excel RoadMap (dòng 133 đến 138): nhóm 1 S1a (gói Free); TNCN theo % doanh thu S2a (Free, Standard); theo lợi nhuận S2b, S2c (10.4.1), S2d (5.2.8), S2e (2.2.7) (Standard). Sổ quỹ tiền mặt, Sổ ngân hàng vẫn hiện mọi đơn vị. Màn Báo cáo gom các sổ này vào nhóm Sổ sách kế toán theo TT152.

- Vẽ 6 sổ theo mẫu iFaster (itaxdev.ipos.vn, đọc 13/10/2026 bằng tài khoản PhuongXT đăng nhập, đơn vị MST 010676557711 và 123123456456, kho Lâm Quân Quán Nguyễn Khang tháng 9): file mới `src/modules/bao-cao/tt152.ts`.
  - S1a: Ngày tháng, Diễn giải, Số tiền; dòng Tổng cộng. Tên in Sổ chi tiết doanh thu bán hàng hoá, dịch vụ (`tenBC` ở `danh-sach.ts`).
  - S2a: cột Chứng từ (Số hiệu (A), Ngày tháng (B)), Diễn giải (C), Số tiền (1); nhóm "1. Ngành nghề: … (số dòng)", cuối nhóm Tổng cộng, Thuế GTGT, Thuế TNCN; cuối sổ Tổng số thuế GTGT, TNCN phải nộp.
  - S2b: như S2a, không có dòng thuế TNCN.
  - S2c: 1. Doanh thu (hoá đơn bán), 2. Chi phí hợp lý chia mục a tới f (tên mục theo iFaster, sửa lỗi chính tả), 3. Chênh lệch, 4. Thuế TNCN = (3) x 15%, 17%, 20% theo nhóm 2, 3, 4.
  - S2d: Chứng từ, Diễn giải, Đơn vị tính, Đơn giá, Nhập, Xuất, Tồn (số lượng, thành tiền), Ghi chú; Số dư đầu kỳ, cuối kỳ; dòng phụ Tên vật liệu, dụng cụ, sản phẩm, hàng hoá (mặc định Cà phê hạt Robusta).
  - S2e: Chứng từ, Diễn giải, Số tiền (Thu/Gửi vào, Chi/Rút ra); nhóm theo quỹ tiền mặt và từng tài khoản ngân hàng: đầu kỳ, phiếu, tổng gửi vào, tổng rút ra, cuối kỳ.
- `ReportScreen.tsx`: `renderReport` chọn mẫu hộ kinh doanh theo `cachHkd`; dòng phụ "Địa điểm kinh doanh: …" như iFaster; tên in trên tờ đọc `tenBC`.
- `src/ui/bao-cao/tuyChinhBC.ts` (dùng chung): `bienDoiBang` không bỏ dòng tiêu đề nhóm có sẵn của mẫu sổ (`_nhom`) khi người dùng không gom nhóm. Trước đây mọi dòng nhóm giữa bảng bị mất (vd "2. Ngành nghề", "B. Nhóm Bán lẻ hàng hoá" của sổ doanh thu TT58).
- Trên iFaster đã đổi tạm nhóm doanh thu, cách tính thuế TNCN để xem đủ mẫu, rồi trả lại: MST 010676557711 Nhóm 1 theo doanh thu; MST 123123456456 Nhóm 2 theo doanh thu.

- PhuongXT chốt: gói Free không hiện S2b-HKD (hộ kinh doanh tính thuế theo lợi nhuận); `anSoHkdGoiFree` ở `danh-sach.ts`, gọi trong `hienMan`. Gói Free: nhóm 1 S1a, theo % doanh thu S2a, theo lợi nhuận chỉ sổ quỹ, sổ ngân hàng.
- `HeThong.tsx`: Thông tin đơn vị lưu thì chế độ kế toán đổi theo loại hình (`cheDoTheoLoai`): hộ kinh doanh sang TT152, doanh nghiệp gói Standard sang TT58, gói Plus, Pro giữ. Trước đây đổi loại hình sang hộ kinh doanh mà chế độ vẫn TT58 nên màn Báo cáo hiện bộ sổ TT58 (PhuongXT phát hiện). Cảnh báo dưới ô loại hình báo trước chế độ sẽ đổi.
- `app.css`: bỏ quy tắc căn phải chữ ở dòng tổng cuối bảng báo cáo (`.rpt tr.t td:not(.num)`), chữ dòng tổng căn trái như dòng khác ở mọi báo cáo; ô số vẫn căn phải.
- `ThanhChon.tsx`, `ToGiay.tsx`, `ReportScreen.tsx`, `app.css`: màn xem báo cáo. Hàng tiêu đề: Tất cả báo cáo, nhóm, tên báo cáo đủ chữ (ô chọn giãn theo tên, bỏ độ rộng cố định 400px của T75), ký hiệu mẫu viết liền sau tên (vd "Sổ doanh thu bán hàng · S2b-HKD"); bộ lọc ngày, Xem báo cáo, Tuỳ chỉnh, Xuất, In dồn phải. Tờ in / Bảng dữ liệu và Khổ chuyển xuống thanh đáy của tờ, cạnh zoom (bỏ chỗ gắn `bc-xem-cho` trên thanh công cụ, T68). Đã thử 1600px, 1280px, cả Bảng dữ liệu.
- `ReportScreen.tsx`, `xuat.ts`, `app.css`: dòng "Đơn vị tính: đồng" chuyển từ dưới tiêu đề xuống sát trên bảng, căn phải (cả bản xuất HTML).
- `ReportScreen.tsx`: đầu tờ báo cáo ghi "Chi nhánh: …" (trước là "Đơn vị: …"), xem tất cả chi nhánh thì ghi Tất cả chi nhánh.
- `session.tsx`: đổi gói (nút Trải nghiệm gói, Gói thuê bao) mà không chỉ định chế độ thì hộ kinh doanh lấy TT152 nếu gói cho phép, doanh nghiệp lấy mặc định của gói. Trước đây hộ kinh doanh đổi sang Standard nhận TT58, phải lưu lại Thông tin đơn vị (PhuongXT phát hiện).
- `Screen.tsx`: mở báo cáo không hiện ở gói, chế độ, cách tính thuế đang chọn (vd đang xem S2b-HKD ở Standard rồi đổi sang Free) thì báo "Báo cáo không dùng với thiết lập hiện tại", chặn theo `hienMan` thay cho `apDung`. Trước đây sổ vẫn hiện mà ô tên báo cáo trống (PhuongXT phát hiện).
- `ToGiay.tsx`, `app.css`: Bảng dữ liệu của báo cáo (bảng chung `Table`) đánh dấu dòng nhóm, dòng cộng (`bc-dong-dam`), dòng tổng (`bc-dong-tong`) qua `rowCls`, in đậm, nền nhạt như Tờ in.
- Bộ lọc Kênh bán (Tại quán, Mang về, GrabFood, ShopeeFood, Be; chọn nhiều) cho Sổ doanh thu 3.2.5 ở TT152 (S1a, S2a, S2b): `LocBC` có thêm `cheDo` để chỉ hiện ở TT152; `tt152.ts` sinh hoá đơn có kênh, lọc tại nguồn nên dòng cộng, thuế tính lại; dòng cộng mang kênh đang chọn để khung lọc chung giữ lại. 
- Bộ lọc báo cáo (QD55, thay cột lọc trái của QD40): bỏ cột Bộ lọc bên trái (`CotLocBaoCao` và CSS `.bc-loc-cot`); thanh công cụ có nút phễu ghi khoảng ngày và số bộ lọc, bấm mở popup lọc (khoảng ngày, ô lọc, Ẩn dòng không phát sinh, Xoá lọc, Xem báo cáo). Điều kiện đang lọc hiện thành nhãn cạnh nút phễu, bấm × bỏ; tờ báo cáo có dòng "Điều kiện lọc: …"; Bảng dữ liệu cũng có dòng này trên đầu bảng (`dieuKienLoc` của `ToGiay`). Bỏ chữ tên nhóm (vd Kế toán bán hàng) trên hàng tiêu đề. `kiem_tra.py` đổi kỳ báo cáo tài chính qua nút phễu.
- Màn xem báo cáo dạng bảng (QD55): `ToGiay.tsx` mặc định vẽ bảng dữ liệu, trên bảng có tên báo cáo và dòng phụ (`dauBang`), ô tìm nhanh (`tim`); tờ in thành bản xem trước toàn màn hình (`bc-xem-in`: khổ Dọc/Ngang, zoom, In, Đóng/Esc). `ReportScreen.tsx`: thanh công cụ vào đầu khung bảng (phễu, nhãn lọc, ô Tìm trong báo cáo, Tuỳ chỉnh, Xuất, In), nút In mở xem trước. Bỏ chỗ gắn thanh công cụ lên hàng tiêu đề (`choThanh.ts`, `bc-chon-phai`), bỏ nút Tờ in / Bảng dữ liệu và Khổ ở thanh đáy, gỡ CSS cũ.
- Bỏ nhãn điều kiện lọc cạnh nút phễu (PhuongXT: để dưới thôi); điều kiện lọc chỉ còn ở dòng "Điều kiện lọc: …" trên bảng và trên tờ in.
- Tờ in bỏ chữ "Điều kiện lọc:", chỉ ghi điều kiện (vd Kênh bán: Tại quán); bảng dữ liệu vẫn ghi "Điều kiện lọc: …".
- S2d (5.2.8) thêm bộ lọc Hàng hoá, Nhóm hàng hoá, chọn một (sổ một mặt hàng; chỉ chọn nhóm thì lấy mặt hàng đầu tiên của nhóm, `matHangS2d`); S2e (2.2.7) thêm bộ lọc Quỹ (tiền mặt, từng tài khoản ngân hàng, chọn nhiều). Hai bộ lọc chỉ hiện ở TT152; dòng sổ mang mặt hàng, nhóm, quỹ để khung lọc chung giữ lại.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi. `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- Đếm bằng registry: hộ kinh doanh Free nhóm 1 thấy S1a; Free nhóm 2 theo doanh thu thấy S2a; Standard nhóm 2 theo doanh thu thấy S2a; Standard nhóm 3 thấy S2b, S2c, S2d, S2e; doanh nghiệp gói Free chỉ thấy sổ quỹ, sổ ngân hàng.
- Bản chạy thử, hộ kinh doanh Cà phê Góc Nhỏ gói Standard nhóm 3: Tất cả báo cáo có nhóm Sổ sách kế toán theo TT152 4 sổ; mở 3.2.5 đầu trang ghi Mẫu số S2b-HKD; 10.4.1, 5.2.8, 2.2.7 vẽ được. Đã trả phiên thử về Phố Mây gói Plus.

## Dở dang, việc tiếp theo

- Bản chạy thử: nhóm 1 ra S1a; nhóm 2 theo doanh thu ra S2a; nhóm 3 ra S2b, S2c (thuế 17%), S2d, S2e; dòng nhóm thứ hai hiện đủ; số dư tiền không âm. Số liệu sổ HKD là số mẫu sinh theo tháng, chưa nối dữ liệu bán hàng, kho, thu chi thật của đơn vị.
- S3a-HKD (Sổ theo dõi nghĩa vụ thuế khác 6.2.5) chưa mở lại, PhuongXT chưa nêu.

## Bẫy, quyết định mới

- QD55: màn xem báo cáo dạng bảng, bộ lọc trong nút phễu, tờ in thành xem trước khi in. PhuongXT chốt, không cần Trum duyệt.
