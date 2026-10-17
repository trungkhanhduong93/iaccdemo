# Khoá sổ cho gói Free (T315)

- Ngày: 17/10/2026
- Người: dinhlanphuongipacc, agent: Claude Code. Làm ở máy HAN-IPOS381
- Trạng thái cuối phiên: Xong

## Đã làm

- Khoá sổ gói Free là tab riêng trong Hệ thống: `he-thong/index.ts` thêm màn `khoa-so` (Hệ thống › Khoá sổ, chỉ gói Free, `goi: ['F']`). Bản đầu mở 10.1.6 và hiện phân hệ Tổng hợp tên Khoá sổ trên thanh bên; dinhlanphuongipacc muốn để trong Hệ thống nên đã trả `plan.ts`, `registry.ts`, `CuoiKy.tsx` về như cũ. Gói khác vẫn dùng Khoá sổ 10.1.6 ở Tổng hợp.
- `tong-hop/KhoaSoFree.tsx` (mới): kiểm tra trước khi khoá tháng kế tiếp tháng đã khoá (đồng bộ doanh thu FABi, kiểm kê cuối tháng các cửa hàng, phân bổ chi phí trả trước, tồn quỹ cuối tháng, phiếu thu chi FABi chờ), mỗi bước có nút Xem; khoá sổ; mở khoá tháng đã khoá gần nhất bắt buộc lý do; lịch sử. Tháng đang mở (10/2026) chưa khoá được. Bố cục hai cột bằng nhau (`ks-luoi`): trái là trạng thái đã khoá, các bước kiểm tra, ô mở khoá; phải là Lịch sử khoá sổ đủ rộng, không cuộn ngang (bản đầu cột lịch sử hẹp, dinhlanphuongipacc thấy mất cân đối).
- Các bước kiểm tra theo cửa hàng đang chọn trên thanh trên (kiểm kê, tồn quỹ): chọn một cửa hàng thì chỉ xét cửa hàng đó (vd "Phố Mây Lê Lợi đã kiểm kê, lệch 8 mặt hàng"), tất cả thì mọi cửa hàng. Trước đó luôn xét mọi cửa hàng.
- Bước Phân bổ chi phí trả trước kiểm còn khoản chờ phân bổ chưa ghi tăng thẻ tới hết tháng cần khoá (`useChoGhiTang` mới ở `ccdc/GhiTangHangLoat.tsx`, cùng nguồn dải cảnh báo T287): còn thì báo "Còn N khoản chờ phân bổ chưa ghi tăng thẻ · tổng tiền", nút Xem mở danh sách thẻ. Số mẫu chờ phân bổ đều tháng 10, nên khoá tháng 9 thấy "Không còn khoản…".
- Chi phí chờ phân bổ tách 2 chỉ tiêu theo ý dinhlanphuongipacc: "Phân bổ chi phí trong tháng: Đã phân bổ 49.850.000 đ" (khấu hao, CCDC, chi phí trả trước của tháng, `cpPhanBo` như trang chủ) và "Chi phí chờ phân bổ chưa ghi tăng thẻ: Không còn khoản nào / Còn N khoản · tổng". Màn còn 6 bước.
- Lịch sử khoá sổ, cột Lúc ghi đủ ngày tháng năm giờ phút giây (vd 07/10/2026 11:38:28): lần khoá, mở khoá mới lấy giờ theo đồng hồ máy, ngày theo ngày làm việc bản mẫu; dòng mẫu cũ thêm giờ mẫu. Lịch sử thử trước đó lưu ở trình duyệt vẫn chỉ có ngày, xoá khoá `iacc-khoa-so` trong trình duyệt để về số mẫu.
- `data/mock.ts`: `KHOA_SO_DEN` đổi được qua `datKhoaSoDen` (lưu trình duyệt `iacc-khoa-so`, kèm lịch sử `LICH_SU_KHOA_SO`, phát sự kiện `iacc-khoa-so`). Mọi chỗ đọc `KHOA_SO_DEN`, `daKhoaSo` (xoá phiếu, Tháng hạch toán lãi lỗ, chi phí NVL tháng chưa khoá) dùng luôn tháng đã khoá mới.
- `ChungTuForm.tsx`: phiếu thuộc tháng đã khoá sổ chỉ xem (không Sửa, không xoá), đầu phiếu có chip "Đã khoá sổ". Áp dụng mọi gói (trước chỉ chặn xoá).
- `home/BaBaiToanFree.tsx`: thanh đầu trang chủ Free nhắc "Tháng 9/2026 chưa khoá sổ · Khoá sổ ›" khi tháng trước tháng đang mở chưa khoá.
- `app.css` mục T315 cuối file.

## Đã kiểm

- `npm run typecheck`: không lỗi.
- Xem trên `npm run dev` gói Free: Hệ thống có tab Khoá sổ (cuối hàng tab), thanh bên không thêm mục; màn 5/5 bước. Bấm Khoá sổ tháng 9/2026: lịch sử thêm dòng, phiếu mua MH2609-0058 có chip Đã khoá sổ, không còn nút Sửa; MH2610-0022 vẫn sửa được. Mở khoá để trống lý do thì báo "Nhập lý do mở khoá", nhập lý do thì mở được, lịch sử ghi lý do. Trang chủ hiện lời nhắc, bấm mở Hệ thống › Khoá sổ. Đã xoá dữ liệu thử (`iacc-khoa-so`).
- `npm run build`: không lỗi. `python tools/kiem_tra.py --nhanh`: `Không có lỗi.` Chưa chạy `--dien-thoai` (không sửa màn điện thoại).

## Dở dang, việc tiếp theo

- Trum duyệt QD69.
- Bản điện thoại chưa có màn Khoá sổ gói Free (mục Khoá sổ ở điện thoại gói Free đang ẩn từ T257).

## Bẫy, quyết định mới

- QD69 (đang soạn, chờ Trum): gói Free có Khoá sổ bản đơn giản, khoá theo tháng, phiếu tháng đã khoá chỉ xem ở mọi gói.
