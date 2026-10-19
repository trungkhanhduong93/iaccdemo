# Khoá sổ gói Free theo từng cửa hàng (T19)

- Ngày: 19/10/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong (phần gói Free). Gói trên tách thành T478, điện thoại theo bố cục mới tách thành T479

## Đã làm

- `src/data/mock.ts`: mốc khoá sổ lưu riêng từng cửa hàng (`KHOA_SO_CH`, theo id). `KHOA_SO_DEN` thành mốc chung, là tháng mà mọi cửa hàng đều đã khoá. Thêm `khoaSoDenCua(ch)` (id hoặc tên cửa hàng), `khoaSoCuaHang(ids, mo, viec, ai)` thay `datKhoaSoDen`, `kySau`, `kyTruoc`. `daKhoaSo(ngay, ch?)` nhận thêm cửa hàng. Lịch sử có trường `ch`, các cửa hàng khoá cùng tháng gộp một dòng. Bản lưu cũ ở trình duyệt (chỉ có `den`) tự áp cho mọi cửa hàng.
- `src/modules/tong-hop/KhoaSoFree.tsx`: hàm `mocKhoaSo(s.cuaHang)` dùng chung cho web và điện thoại. Khoá theo cửa hàng chọn trên thanh trên: một cửa hàng thì khoá, mở khoá riêng cửa hàng đó; Tất cả thì mỗi cửa hàng khoá tiếp tháng kế của nó (cửa hàng đang ở tháng mở thì bỏ qua), mở khoá lùi một tháng từng cửa hàng. Thêm thẻ Khoá sổ từng cửa hàng (bấm dòng để chọn cửa hàng), lịch sử thêm cột Cửa hàng. Các bước kiểm tra chỉ tính cửa hàng sắp khoá.
- Làm lại màn web theo màn tham khảo PhuongXT gửi (cùng phiên): `KhoaSoFree.tsx` thành bảng tháng × cửa hàng theo năm (chọn Tất cả cửa hàng) hoặc Tháng, Trạng thái, Người khoá, Lúc khoá (chọn một cửa hàng). Nhãn ô: Đã khoá, Chưa khoá, Đang mở. Nút Khoá chỉ ở tháng kế tiếp đã hết, Mở khoá chỉ ở tháng khoá gần nhất. Bấm Khoá mở hộp có 5 bước kiểm tra của tháng, cửa hàng đó (`HopKhoa`). Nút Khoá sổ hàng loạt (`HopKhoaDen`): chọn tháng, tích cửa hàng, khoá lần lượt từng tháng còn thiếu. Lịch sử khoá sổ thành hộp thoại có lọc Cửa hàng, Thao tác, Tháng. Bỏ cột khoá cả N cửa hàng (PhuongXT bảo bỏ, trùng Khoá sổ hàng loạt). CSS cuối `app.css` mục T19.
- `src/ui/mobile/MKhoaSo.tsx`: phần gói Free làm như web, thêm thẻ Khoá sổ từng cửa hàng (dòng Tất cả cửa hàng và từng cửa hàng, tên ngắn), lịch sử ghi cửa hàng.
- Kiểm khoá theo cửa hàng trên phiếu (`row.cn`): `ChungTuForm.tsx` (chỉ xem, xoá, ô Tháng ghi nhận chi phí theo mốc của cửa hàng trên phiếu), `LocNangCao.tsx` (xoá hàng loạt), `MXemPhieu.tsx` (xoá trên điện thoại), `ccdc/the-phan-bo.tsx` (xoá thẻ, câu báo ghi mốc của cửa hàng trên thẻ).
- Chưa đổi: `ccdc/index.ts` (Phân bổ, Xoá phân bổ gói Plus, Pro), trang chủ nhắc tháng chưa khoá (`BaBaiToanFree.tsx`, `MTrangChuFree.tsx`), `chi-phi-nvl.ts`, `soLieuBieuDoFree.ts` vẫn dùng mốc chung. Mốc chung là cửa hàng khoá chậm nhất nên nhắc "tháng chưa khoá" vẫn đúng khi còn cửa hàng chưa khoá.

## Đã kiểm

- `npm run typecheck`: không lỗi. `npm run build`: xong, chỉ cảnh báo gói JS lớn có sẵn (T13).
- `python tools/kiem_tra.py --nhanh`: `Không có lỗi.`
- `python tools/kiem_van.py` cho `KhoaSoFree.tsx`, `MKhoaSo.tsx`, `the-phan-bo.tsx`: sạch. `mock.ts`: 0 ĐỎ, 3 VÀNG ở câu cũ (dòng 221 đến 224, lý do chi phí), không thuộc phần sửa.
- Xem trên trình duyệt, gói Free, Phố Mây 3 cửa hàng: chọn Lê Lợi khoá tháng 9 chỉ Lê Lợi lên 9; chọn Tất cả hiện "Khoá sổ tháng kế tiếp (2 cửa hàng)", khoá xong cả 3 đến 9, lịch sử gộp "Phố Mây Nguyễn Trãi, Phố Mây Thảo Điền" (nay đổi sang tên ngắn). `daKhoaSo('15/09/2026', 'Phố Mây Lê Lợi')` đúng, Nguyễn Trãi sai khi Nguyễn Trãi mới khoá đến 8. Điện thoại 375px: chọn Lê Lợi, mở khoá có lý do, chỉ Lê Lợi về 8.
- `python tools/xuat_bao_cao_he_thong.py` không chạy được trên máy này: thiếu `build_present` ở thư mục `Present/tools` ngoài repo. Chưa làm mới `docs/IACC-Cloud-Chi-Tiet-He-Thong.xlsx`.
- Xong thì xoá `iacc-khoa-so` trong trình duyệt, trả phiên về Phố Mây gói Plus.

## Dở dang, việc tiếp theo

- Điện thoại (`MKhoaSo.tsx`) chưa làm theo bố cục mới, ghi thành T479 (PhuongXT): vẫn là thẻ Khoá sổ từng cửa hàng, thẻ kiểm tra, nút Khoá, Mở khoá ở chân. Việc tiếp: danh sách tháng, mỗi tháng các cửa hàng kèm trạng thái, dùng `ttThang`, `NHAN_TT`, `thangCuaNam` trong `KhoaSoFree.tsx`.
- Gói trên ghi thành T478 (chưa ai nhận): màn 10.1.6 `CuoiKy.tsx` và phần gói khác của `MKhoaSo.tsx` đang là màn giả, chưa khoá thật.

## Bẫy, quyết định mới

- Không ghi `docs/BAY.md`. PhuongXT chốt trong phiên (chưa ghi `QUYET-DINH.md`, chờ Trum): khoá sổ theo từng cửa hàng làm ở gói Free trước; chọn Tất cả thì mỗi cửa hàng khoá tiếp tháng kế của nó, không ép về cùng tháng.
