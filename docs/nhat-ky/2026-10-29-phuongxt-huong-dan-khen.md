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
- Điện thoại làm như web: `MDanhMuc.tsx` đọc `?mo=`, gắn và lưu giá trị phiên (`cfg.phien.gan`, `cfg.phien.luu`) nên quỹ gói Standard lưu được số dư ban đầu, lưu số dư từ hướng dẫn thì về Trang chủ khen. `MToKhaiHKD.tsx`: mỗi dòng tờ khai thêm ô số liệu 4 mục, gợi ý lập tờ khai khoanh dòng đầu (`GoiYKeKhai` nhận `chon`), Lập tờ khai mở tấm chọn kỳ, bước 4 khen.
- Sửa theo ảnh iPhone của PhuongXT: bong bóng đo chiều cao thật (`useCaoBong`), cao màn lấy `visualViewport`, cao quá thì cuộn trong; cuộn tới chỗ khoanh qua `cuonToi` rồi trả trang về lề trái (`scrollIntoView` đẩy cả trang lệch ngang); điện thoại không tự đặt con trỏ vào ô số dư (bàn phím bật làm viền lệch lên ô trên); điện thoại ẩn nút Tiếp tục hướng dẫn khi đang làm việc của nút làm ngay.
- Điện thoại: nút Tiếp tục hướng dẫn đổi thành dải mỏng 28px ngay dưới thanh tiêu đề màn (`DaiHuongDanDt`, PhuongXT chọn cách B sau khi xem bản vẽ 3 cách); thanh tiêu đề được chừa khoảng dưới để dải không đè nội dung; giữ thanh đã chọn, bám vị trí từng khung hình để không nháy. Web giữ nút dài ở đáy.
- Bỏ dòng "Chưa trừ tiền nhà, điện, nguyên liệu bạn chưa ghi." kèm nút Ghi khoản chi ở Trang chủ web và điện thoại (`LoiNhuanTamTinh` trong `NhacDonViMoi.tsx`), giữ nhãn Tạm tính.
- Sửa chữ theo file "Chỉnh text Onboarding.xlsx" của PhuongXT (web và điện thoại dùng chung): 4 thẻ và dòng nâng cấp ở màn mở từ FABi (`KhoiTaoFabi.tsx`), cột phải và nút popup kết nối (số đơn, số phiếu in đậm), màn chờ (`OnboardFabi.tsx`), câu chào, nút Khám phá ngay, 3 bước hướng dẫn, nút "+ Tạo phiếu chi" (`HuongDan.tsx`). Đơn vị chưa có MST: nhãn cam "Bổ sung MST" kèm Thông tư, loại hình ở thanh trên web (`Topbar.tsx`) và đầu Trang chủ điện thoại (`MTrangChuStandard.tsx`), bấm mở Thông tin đơn vị.
- Popup Thông tin kê khai thuế bắt buộc CCCD/MST cả với hộ kinh doanh; luồng Thêm đơn vị kế toán giữ không bắt buộc (T665).
- Bong bóng khen ở bước 4 tờ khai nổi bật hơn (viền xanh, bóng đậm, sao nền cam). Bước hướng dẫn web khối to vừa màn thì cuộn đáy khối sát đáy màn, cuộn lại sau 400ms khi biểu đồ vẽ xong, thấy trọn khối kèm biểu đồ.
- CSS mục cuối `src/styles/app.css` (T138): bong bóng khen có biểu tượng sao, viền ô số dư, vị trí bong bóng khen trong hộp tờ khai.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi. `python tools/kiem_tra.py --nhanh`: "Không có lỗi.". `kiem_van.py` HuongDan.tsx, ToKhaiHKD.tsx: 0 ĐỎ, 1 VÀNG (câu khen quỹ 26 chữ).
- Thử trong khung trình duyệt của app, phiên tạm chuyển gói Standard: lưu phiếu chi về Trang chủ khen; Nhập số dư quỹ mở form, viền ô, lưu về khen; popup kê khai Hoàn tất hiện gợi ý; Lập tờ khai mở hộp chọn kỳ rồi 4 bước; bước 4 khen, Bắt đầu dùng về Trang chủ; Bỏ qua về Trang chủ khen; màn Bắt đầu dùng khi quay lại. Xong trả phiên về Phố Mây gói Plus.
- Điện thoại 375×812: nhập số dư quỹ mở form, viền ô, lưu về khen; danh sách tờ khai có số liệu, gợi ý, lập tờ khai tới bước 4 khen, Bắt đầu dùng về Trang chủ; khen chi khoanh dòng Chi phí hoạt động.
- Sau khi sửa theo ảnh iPhone: thử lại cỡ 375×812 (bong bóng không tràn đáy, trang không lệch ngang, viền khớp ô số dư, không còn nút nổi). Chưa thử lại trên iPhone thật.
- Dải hướng dẫn điện thoại: cỡ 375×812 đứng yên ở phiếu chi, danh sách và các bước kê khai, kể cả khi cuộn. Form quỹ, tấm Lập tờ khai chưa xem được (khung trình duyệt chạy nền, tấm không trượt lên). PhuongXT thử lại trên iPhone.
- Chữ mới, nhãn Bổ sung MST: xem ở 1440 và 375×812 (tạm xoá MST trong phiên rồi trả lại). Khung khoanh bước 1 ở 1920×911 trọn cả biểu đồ.
- Chưa xuất lại `docs/IACC-Cloud-Chi-Tiet-He-Thong.xlsx`: máy PhuongXT không có file nguồn Excel.

## Dở dang, việc tiếp theo

- PhuongXT, Trum xem bản online, góp ý tiếp. Các mục dở của 2 nhật ký T138 ngày 29/10 vẫn còn.
- Cột "Giảm trừ" là phần doanh thu đến 1 tỷ/năm không tính TNCN. PhuongXT ghi "Giảm trừ thuế GTGT", chưa chốt có cần số giảm thuế GTGT riêng không.

## Bẫy, quyết định mới

- Không ghi `docs/BAY.md`. Lưu ý trong code `HuongDan.tsx`: `scrollIntoView` cuộn cả trang ngang trên điện thoại, focus ô nhập trên iPhone làm lệch lớp `position: fixed`.
