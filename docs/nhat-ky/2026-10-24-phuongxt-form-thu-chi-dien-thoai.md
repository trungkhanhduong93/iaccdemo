# Form lập, sửa phiếu thu chi điện thoại kiểu nhập mua hàng (T650)

- Ngày: 24/10/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- Vẽ mẫu 2 kiểu trên artifact "Phiếu thu chi điện thoại"; PhuongXT chốt kiểu 2 (theo màn Tạo mới nhập mua hàng của app iPOS).
- `src/ui/mobile/MDtThuChiLap.tsx`: viết lại phần giao diện, giữ logic. Đầu màn có mũi tên quay lại, tiêu đề giữa, số phiếu chỉ hiện khi sửa. Thẻ đầu có nhãn loại phiếu, nhãn nguồn (Thủ công hoặc FABi), cửa hàng, Quỹ tiền mặt, Lý do, Ngày chứng từ, Tháng ghi nhận chi phí, ô Nợ/Có (gói có hạch toán), Ghi chú rộng hết thẻ. Thẻ Đối tượng gồm Đối tượng, Người giao dịch. Thẻ Chi tiết có Dòng n, nút xoá, Thêm dòng, Tổng cộng. Chân chỉ còn một nút Lưu.
- Bỏ khung số tiền to ở đầu, ô Số phiếu khoá, ô Địa chỉ (địa chỉ vẫn tự lấy theo đối tượng và vẫn lưu). Ô Số tiền ở thẻ đầu chỉ còn cho phiếu chuyển quỹ.
- Phiếu mới (trừ chuyển quỹ) chưa có dòng chi tiết, hiện hình minh hoạ và câu "Chưa có dòng chi tiết nào".
- Gói Standard dùng chung form này: bỏ ô Số tiền riêng, bỏ trường hợp 1 dòng gọi Ghi chú là Diễn giải, có nút Thêm dòng (PhuongXT chốt, thay cách làm của T608).
- `src/styles/app.css`: mục cuối file "(T650)", mọi luật gắn lớp `.m-t650`.
- `tools/kiem_tra.py`: 3 chỗ nhập số tiền phiếu thu chi bấm `.m-t650-them-dong` trước khi tìm `.m-lp-tien-inp` (ô Thành tiền dòng 1 mang lớp này).

- Bổ sung theo góp ý PhuongXT: Ghi chú mặc định theo lý do (đổi lý do thì ghi chú đổi theo nếu chưa gõ khác). Diễn giải dòng mặc định theo ghi chú: dòng trống hoặc đang giống ghi chú thì đổi theo, dòng đã gõ riêng giữ nguyên, dòng thêm mới lấy ghi chú. Nhãn Người nộp đổi thành Người giao dịch, cả ở form lập và màn lưu thành công.
- Thu gọn theo góp ý PhuongXT: dòng chi tiết bỏ nền xanh khi mới thêm, ô cao 38px, thẻ hẹp lề hơn, cột nhãn 112px, "Thêm thông tin dòng" thành một dòng chữ nhỏ. Phiếu tạo mới ghim Tổng cộng trên nút Lưu, phiếu sửa giữ Tổng cộng cuối thẻ Chi tiết. Đã thử kiểu số thứ tự cạnh ô số tiền, PhuongXT chọn giữ Dòng 1, Dòng 2.

## Đã kiểm

- `npm run typecheck`: không lỗi. `npm run build`: chạy xong, không lỗi.
- `python tools/kiem_tra.py --nhanh`: "Không có lỗi." Dev server trên máy này chỉ nghe IPv6 nên chạy kèm `KIEM_TRA_URL="http://[::1]:5180/"`.
- `python tools/kiem_van.py src/ui/mobile/MDtThuChiLap.tsx`: 0 ĐỎ, 1 VÀNG (đường vẽ SVG, không phải chữ).
- Mở bản chạy thử cỡ điện thoại: gói Pro phiếu chi, gói Standard phiếu thu; thêm 2 dòng 36.000.000 ra Tổng cộng 72.000.000 đ.
- Chưa chạy `kiem_tra.py --dien-thoai` (bộ đầy đủ, lâu).
- Chưa làm mới `docs/IACC-Cloud-Chi-Tiet-He-Thong.xlsx`: `tools/xuat_bao_cao_he_thong.py` cần thư mục `Present/tools` cạnh repo, máy PhuongXT không có (báo `No module named 'build_present'`).

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- Không.
