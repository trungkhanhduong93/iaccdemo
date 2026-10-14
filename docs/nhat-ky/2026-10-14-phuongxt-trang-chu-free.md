# Trang chủ gói Free theo ba bài toán; lý do nghiệp vụ là chi phí (T230, T231)

- Ngày: 14/10/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- T230: file mới `src/modules/home/BaBaiToanFree.tsx`, `TongQuan.tsx` gói Free chỉ hiện khối này (bỏ tiêu đề, So với, chọn chi nhánh của trang, nút Tuỳ chỉnh, các khối khác); xem theo chi nhánh thanh trên; chọn năm rồi tháng (7 đến 10/2026).
- T230 cột 1 Lãi lỗ: số lãi, biên lãi; dưới là thẻ báo cáo lãi lỗ (Doanh thu, Chi phí nguyên vật liệu, Chi phí trong tháng, Chi phí phân bổ, Lợi nhuận) tính như KQKD gói Free (T220). Thẻ Chi phí trong tháng mở màn mới `home/ChiPhiThang.tsx` (tổng theo lý do chi phí), thẻ phân bổ mở 8-1-1.
- T230 cột 2 Thu chi: Số dư hiện có, thu, chi; khối Tồn quỹ hiện tại (tháng cũ: cuối tháng) từng quỹ. Số cộng từ Sổ quỹ tiền mặt, Sổ ngân hàng (`tonQuyTheoSo`). Bấm quỹ mở màn mới `home/LichSuQuy.tsx` kiểu app ngân hàng, bấm giao dịch mở chứng từ qua `phieuTheoSo` (T201).
- T230 cột 3 Kho: Quản lý mua hàng, công nợ, hao hụt hàng bán thẳng; thẻ Nhập mua (4-1-1), Công nợ phải trả (Nợ cuối kỳ của 4.2.3), Hao hụt kiểm kê (số mặt hàng, gói Free không có giá trị; mở dieu-chinh?loai=xdc).
- T230: gói Free bỏ tab Bàn làm việc (`home/index.ts` `goi`), `Screen.tsx` đăng nhập gói Free vào Tổng quan, màn khai `goi` mở ở gói khác thì về màn đầu phân hệ. `chiSo.ts` thêm `gv`, `cpHoatDong`, `cpPhanBo`, `lnKhac`, `tinhToanTongQuan` nhận tháng (`thangChon`).
- T230: sửa lỗi `tuyChinhBC.ts` mở báo cáo kèm kỳ khác tháng 9 thì treo (`kyDatSan`), ghi `docs/BAY.md`.
- T231: `LY_DO` có `chiPhi` (7 lý do chi: mua NVL, trả lương, chi phí khác, CCDC, thuê nhà, TSCĐ, chờ phân bổ), `LY_CHI_PHI`; danh mục đổi tên Lý do nghiệp vụ, cột và ô tích Là chi phí (chỉ khi Dùng cho là Chi tiền); Sổ chi phí, màn Chi phí trong tháng chỉ lấy lý do chi phí.

## Đã kiểm

- `npm run typecheck`: không lỗi. `npm run build`: chạy xong, không lỗi.
- `python tools/kiem_tra.py --nhanh`: `Không có lỗi.`
- `python tools/kiem_van.py` các file đã sửa: Sạch.
- Trình duyệt gói Free: lãi tháng 10 +90,8 tr, tháng 9 +431,2 tr khớp KQKD Free; Chi phí trong tháng 298.628.000 đ bằng tổng ba lý do; tổng tồn quỹ 528.533.000 đ bằng số dư cột, quỹ Lê Lợi 23.637.000 đ khớp Lịch sử thu chi, 13 giao dịch đều mở chứng từ; công nợ 378.567.000 đ khớp tổng Nợ cuối kỳ 4.2.3 tháng 10; hao hụt mở tab Xuất điều chỉnh; gói Plus trang chủ giữ nguyên.

## Dở dang, việc tiếp theo

- Số dư quỹ trang chủ lấy theo Sổ quỹ, Sổ ngân hàng nên khác báo cáo Tổng hợp quỹ tiền 2.2.8 (chia từ sổ cái). Nối sổ quỹ vào sổ cái là T03.
- Sổ ngân hàng (`soChiTiet` ở `gen.ts`) chọn diễn giải ngẫu nhiên, có dòng "Chi tiền điện tháng" mà là khoản thu.
- Màn Chi phí trong tháng chia theo cơ cấu chi phí, chưa cộng thẳng từ phiếu chi (phiếu mẫu quá ít). Ô tích Là chi phí trong form chưa lưu thật (chưa có backend).
- Hao hụt tính mọi hàng kiểm kê thiếu, chưa tách riêng hàng bán thẳng.
- Chưa làm mới `docs/IACC-Cloud-Chi-Tiet-He-Thong.xlsx`: script cần file Excel tính năng, `Present/tools` chỉ máy Trum có.

## Bẫy, quyết định mới

- Ghi `docs/BAY.md`: mở báo cáo kèm kỳ khác tháng 9 thì treo; thử trong console sau khi sửa file phải dùng đúng bản nạp nóng `?t=`.
- Server dev từng đọc file mới đúng lúc đang ghi và trả bản rỗng; trình duyệt giữ bộ nhớ đệm cũ. Khởi động lại server và `fetch(url, { cache: 'reload' })` các file liên quan thì hết.
