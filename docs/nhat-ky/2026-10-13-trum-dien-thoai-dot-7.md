# Điện thoại đợt 7: báo cáo (T182)

- Ngày: 13/10/2026
- Người: Trum, agent: Claude Code điều phối, Anti B (Antigravity WSL) viết code, Anti A (Antigravity Windows) chạy kiểm và sửa lỗi nhỏ
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/ui/mobile/MBaoCao.tsx` (mới) dùng cho `bao-cao/tat-ca`, `bao-cao/nhom-*` và tab Báo cáo của phân hệ. Đầu trang nền vàng kem, chip tên gói, ô tìm theo mã hoặc tên. Thẻ nhóm A, B, C... lấy đúng nhóm `TrungTamBaoCao` đang hiện. Bấm thẻ ra danh sách báo cáo của nhóm.
- `TrungTam.tsx`: tách hàm thuần `layNhomBaoCao(s)`, bản máy tính và điện thoại dùng chung. Kết quả bản máy tính không đổi.
- `src/ui/mobile/MSoBaoCao.tsx` (mới) dùng cho màn `kind: 'report'`. Có chip Thời gian, chip Kho/CN, ô lọc dòng không phân biệt dấu. Bảng lấy từ `renderReport`, không có tờ giấy. Khung bảng cuộn ngang, cột đầu ghim trái. `ReportScreen.tsx` chỉ thêm `export` cho `renderReport`.
- `src/ui/mobile/MToGiay.tsx` (mới) dùng cho báo cáo `kind: 'custom'`: sổ quỹ, báo cáo tài chính, tờ khai. Dựng ở bề rộng 900px rồi thu nhỏ vừa màn, chạm để phóng 100% và cuộn hai chiều.
- `manMobile.ts`: thêm luật chọn 3 màn trên.
- `Screen.tsx`: trên điện thoại bỏ thanh "Tất cả báo cáo | tên báo cáo", vì thanh trên đã có nút quay lại và tên màn.
- `app.css` mục `Điện thoại đợt 7 (T182)`.
- `tools/kiem_tra.py`: thêm biến môi trường `KIEM_TRA_URL` để chạy kiểm ở cổng khác 5180. Thêm bước kiểm đợt 7 ở 390px: tab Báo cáo, tìm "quỹ", Sổ quỹ tiền mặt, Sổ ngân hàng (cuộn ngang, cột ghim), B01, B02 TT58 gói S. Bước kiểm báo lỗi khi màn hiện "chưa có mẫu" hoặc "không dùng với thiết lập", hoặc bảng thu nhỏ còn bị cắt.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `kiem_tra.py --nhanh`, `--dien-thoai` (cổng 5181): Không có lỗi.
- `kiem_van.py` 3 file mới: Sạch.
- Xem ảnh 390px của tab Báo cáo, Sổ công nợ S4a, B01-DNSN, Sổ doanh thu S2a (gói S, TT58): đọc được, trang không tràn ngang, không còn trùng tiêu đề.
- Lọc dòng Sổ ngân hàng: 170 dòng; gõ "điện" hoặc "dien" còn 64, "tạm ứng" còn 25, gõ chữ không có còn 2 dòng tổng.
- Bản máy tính: `kiem_tra.py --nhanh` mở 183 lượt màn không lỗi. Chưa so ảnh từng điểm trước và sau.
- Chưa thử trên điện thoại thật.

## Dở dang, việc tiếp theo

- Đợt 6 đã làm ở T183, push trước T182; lúc push gộp xung đột `kiem_tra.py`, `app.css`, `TIEN-DO.md`, `CHANGELOG.md` bằng cách giữ cả hai bên. Tiếp theo: đợt 8, đăng nhập, chọn đơn vị (mục 7 của `docs/ke-hoach-mobile-ivt.md`).
- Xuất nhập tồn `kho/5-2-3` không kiểm được ở điện thoại. T171 đã ẩn báo cáo này ở mọi chế độ.
- Lọc dòng ở `MSoBaoCao` giữ dòng tổng với số của cả sổ và bỏ dòng "Số dư đầu kỳ". Nếu cần tổng theo dòng đang lọc thì làm thành việc mới.
- Nhóm phân hệ (vd Thu chi ở gói PL) có thể không còn báo cáo, vì sổ đã gom vào nhóm "Sổ sách kế toán theo …". Bản máy tính cũng hiện nhóm trống y như vậy.

## Bẫy, quyết định mới

- TT58 chỉ hợp lệ với gói S (`CHE_DO_HOP_LE` ở `src/app/che-do.ts`). Bước kiểm đặt gói PL kèm TT58 thì phiên tự về TT133, màn hiện "chưa có mẫu", nhưng bước kiểm vẫn qua. Vòng đầu Anti A gặp đúng lỗi này.
- Cách chia việc lần này: Anti B viết code trong WSL, không chạy npm. Anti A chạy kiểm trên Windows và sửa lỗi nhỏ, 2 vòng. Claude soát diff, tự chạy lại kiểm, xem ảnh. Mỗi phiên làm ở bản clone riêng `D:\IACC-CLOUD\Web-dt` (QD21). Trong lúc đó `Web` chạy T181 và giữ cổng 5180.
