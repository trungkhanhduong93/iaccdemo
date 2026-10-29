# Hướng dẫn Trang chủ: làm xong việc thì về Trang chủ khen, thêm cột danh sách Kê khai thuế (T138)

- Ngày: 29/10/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Dở dang

## Đã làm

- `src/modules/home/HuongDan.tsx`: nút làm ngay trong bong bóng ghi việc đang chờ (`cho`: chi, quy, thue) vào `sessionStorage`. Màn đó lưu xong gọi `xongViecHuongDan` thì hướng dẫn về Trang chủ, khoanh đúng chỗ vừa đổi và khen (`KHEN`), rồi bấm Tiếp tục chạy bước sau.
  - Ghi khoản chi: khoanh dòng Chi phí hoạt động (`chonKhen`), câu "Tuyệt vời, bạn đã thêm chi phí “lý do” số tiền".
  - Nút bước 2 đổi thành "Nhập số dư quỹ", mở thẳng form quỹ TM01 (`?mo=TM01`). Form đó viền cam ô Số dư ban đầu, đặt con trỏ vào ô (`KhoanhSoDuQuy`). Lưu số dư khác 0 thì về Trang chủ khoanh ô Tồn quỹ, khen.
  - Kê khai thuế: khai xong popup thông tin kê khai thì danh sách tờ khai khoanh 4 cột doanh thu, tiền thuế (`GoiYKeKhai`). Lập tờ khai thuế mở hộp chọn kỳ rồi vào 4 bước; Bỏ qua về Trang chủ khen, kết thúc. Tới bước 4 Xem và nộp tờ khai thì khen ngay trong hộp (`KhenToKhai`), Bắt đầu dùng kết thúc hướng dẫn và về Trang chủ. Nộp CQT khi hướng dẫn còn chờ cũng về Trang chủ khen.
  - Đã qua bước Kê khai thuế mà quay lại Trang chủ thì hiện màn cuối "Bạn đã sẵn sàng dùng iPOS Accounting" (`KET`), không lặp bước 3/3.
  - Tách hàm đặt bong bóng `viTriBong`; vòng bám chỗ khoanh đo ngay lần đầu, không chờ `requestAnimationFrame` (tab chạy nền thì đứng).
- Gọi `xongViecHuongDan` ở: `ChungTuForm.tsx` (phiếu chi mới), `MDtThuChiLap.tsx` (điện thoại), `CatalogScreen.tsx` (lưu quỹ 1.12 có số dư), `ToKhaiHKD.tsx`, `MToKhaiHKD.tsx` (Đã nộp CQT).
- `src/modules/thue/ToKhaiHKD.tsx`: danh sách tờ khai thêm cột Doanh thu tính thuế, Giảm trừ, Thuế GTGT, Thuế TNCN (lấy `soLieu`).
- CSS 3 mục cuối `src/styles/app.css` (T138): bong bóng khen có biểu tượng sao, viền ô số dư, vị trí bong bóng khen trong hộp tờ khai.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi. `python tools/kiem_tra.py --nhanh`: "Không có lỗi.". `kiem_van.py` HuongDan.tsx, ToKhaiHKD.tsx: 0 ĐỎ, 1 VÀNG (câu khen quỹ 26 chữ).
- Thử trong khung trình duyệt của app, phiên tạm chuyển gói Standard: lưu phiếu chi về Trang chủ khen; Nhập số dư quỹ mở form, viền ô, lưu về khen; popup kê khai Hoàn tất hiện gợi ý; Lập tờ khai mở hộp chọn kỳ rồi 4 bước; bước 4 khen, Bắt đầu dùng về Trang chủ; Bỏ qua về Trang chủ khen; màn Bắt đầu dùng khi quay lại. Xong trả phiên về Phố Mây gói Plus.
- Chưa thử trên điện thoại. Chưa xuất lại `docs/IACC-Cloud-Chi-Tiet-He-Thong.xlsx`: máy PhuongXT không có file nguồn Excel.

## Dở dang, việc tiếp theo

- PhuongXT, Trum xem bản online, góp ý tiếp. Các mục dở của 2 nhật ký T138 ngày 29/10 vẫn còn.
- Cột "Giảm trừ" là phần doanh thu đến 1 tỷ/năm không tính TNCN. PhuongXT ghi "Giảm trừ thuế GTGT", chưa chốt có cần số giảm thuế GTGT riêng không.
- Điện thoại chưa có: khen khi nhập số dư quỹ (`MDanhMuc.tsx` không đọc `?mo`, không gọi `cfg.phien.luu` nên không lưu số dư ban đầu), gợi ý khoanh cột ở danh sách tờ khai.

## Bẫy, quyết định mới

- Không.
