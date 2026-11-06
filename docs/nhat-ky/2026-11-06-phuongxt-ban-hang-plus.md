# Gói Plus: màn Bán hàng lập tay, nguồn FABi, Thủ công, Excel (T753)

- Ngày: 06/11/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/modules/ban-hang/index.ts`: tab 3.1.1 gói Plus gọi Bán hàng (`nganGoi`), gói Standard vẫn Xuất bán POS.
- `src/modules/ban-hang/ChungTuBanHang.tsx`: gói Plus đổi tiêu đề Bán hàng; nút Thêm mới; cột Nguồn, ô lọc Nguồn (FABi, Thủ công, Excel); 4 chứng từ mẫu lập tay, nhập Excel (`MAU_TAY`) xếp chung với chứng từ FABi theo ngày. Chứng từ FABi mở chi tiết chỉ xem như cũ; chứng từ Thủ công, Excel mở form chung `ChungTuForm` với cấu hình `BAN_TAY` (dựa trên `NGOAI_POS`).
- Lọc cửa hàng, hàng hoá, theo dõi tồn kho, phương thức thanh toán đọc được cả chứng từ không có dữ liệu đơn POS. Lọc ngày bỏ phần giờ khi đọc ngày chứng từ lập tay.
- File mới `src/modules/ban-hang/BangHangBan.tsx`: bảng hàng gõ tay cùng cột với chi tiết Xuất bán POS: Thành tiền, Giảm giá (%), Tiền giảm giá, % CK, Tiền CK, % Phí dịch vụ, Phí dịch vụ, Doanh thu trước thuế, Thuế suất, Tiền thuế (GTGT theo % doanh thu thì Giảm thuế GTGT), Theo dõi tồn kho. Gõ % thì tính tiền, gõ tiền thì tính lại %.
- Ô cả bill trên thanh tab như phiếu mua hàng (T492): Chiết khấu (% hoặc đ), Phí dịch vụ (% hoặc đ), Thuế GTGT (ẩn khi GTGT theo % doanh thu). Áp xuống mọi dòng; số tiền chia theo tiền của dòng, dòng cuối nhận phần lẻ. Thêm, xoá dòng hoặc đổi thành tiền thì tự áp lại (`ApDauBangBan` trong `BangHangBan.tsx`).
- `tinhDong` chỉ tính lại khoản có căn cứ đổi, đổi thuế suất không làm lệch số tiền phí, chiết khấu đã gõ.
- `src/ui/generic/ChungTuForm.tsx`: cấu hình có `dongPos` thì dùng `BangHangBan` thay `BangSua`; tổng chân form có Thành tiền, Giảm giá, Chiết khấu, Phí dịch vụ.
- `src/app/session.tsx`, `gtgtTyLe`: doanh nghiệp theo phương pháp GTGT ở Thông tin đơn vị ở mọi gói, bỏ luật T450 cố định khấu trừ cho doanh nghiệp gói Plus, Pro (PhuongXT chốt 06/11/2026). Hộ kinh doanh, doanh nghiệp theo % doanh thu: ẩn Thuế suất, Tiền thuế, hiện Giảm thuế GTGT; doanh nghiệp khấu trừ: hiện Thuế suất, Tiền thuế. Áp cho mọi màn dùng `gtgtTyLe`: Xuất bán POS, Bán hàng, chứng từ bán chung, báo cáo bán hàng, điện thoại.
- `src/modules/types.ts` thêm `dongPos` cho `VoucherCfg`; `src/ui/generic/gen.ts` thêm trường `pt`, `giam`, `ptPhiDv`, `phiDv` (không bắt buộc) cho `Dong`.

## Đã kiểm

- `npm run typecheck`: không lỗi. `npm run build`: chạy xong.
- `python tools/kiem_tra.py --nhanh`: "Không có lỗi."
- `python tools/kiem_van.py` 4 file đã sửa: 0 ĐỎ (VÀNG là đường vẽ icon có sẵn).
- Trên trình duyệt gói Plus: danh sách tên Bán hàng, có Thêm mới, cột Nguồn; mở chứng từ mẫu Thủ công đúng số; thêm mới dòng Phở bò tái 10 tô, CK 10%, phí DV 5%: 650.000 − 65.000 + 29.250 = 614.250, thuế 8% 49.140, tổng 663.390; lưu xong hiện trong danh sách nguồn Thủ công.
- Ô cả bill: 2 dòng Phở bò tái, CK 10%, phí dịch vụ 50.000đ, thuế 10%: 130.000 − 13.000 + 50.000 = 167.000, thuế 16.700, tổng 183.700. Thêm dòng thứ 3 thì dòng mới nhận thuế 10%, CK 10%, phí 50.000 chia lại 16.667, 16.667, 16.666.
- Doanh nghiệp gói Plus, chứng từ mẫu BH2610-0003: theo % doanh thu thì cột có Giảm thuế GTGT, không Thuế suất, Tiền thuế; khấu trừ thì ngược lại, tổng 3.134.943.
- Chưa kiểm: điện thoại (`MXuatBanPos.tsx`) vẫn tên Xuất bán POS, chưa có thêm tay. Nút Nhập Excel vẫn chỉ báo, chưa có hộp nhập.

## Dở dang, việc tiếp theo

- Không với phần web. Cách tính tạm: giảm giá trên thành tiền, chiết khấu trên tiền sau giảm giá, phí dịch vụ trên tiền sau chiết khấu; PhuongXT, Trum xem có đúng nghiệp vụ không.
- Gói Pro vẫn có tab Xuất bán POS và tab Bán hàng 3.1.7 riêng, chưa gộp.

## Bẫy, quyết định mới

- Không.
