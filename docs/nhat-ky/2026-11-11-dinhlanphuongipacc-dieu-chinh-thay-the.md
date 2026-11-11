# Hoá đơn thay thế, huỷ bán, hoá đơn điều chỉnh (T787)

- Ngày: 11/11/2026
- Người: dinhlanphuongipacc, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/modules/ban-hang/hddt.tsx`: thêm loại chứng từ `LoaiCt` (XBAN, HDTHAYTHE, HUYBAN, HDDIEUCHINH), tiền tố số HDTT, HBH, HDDC; hàm `mauTuGoc` chép chứng từ gốc sang form, `huyBanTu` sinh huỷ bán ghi âm, `dauDong` đổi dấu dòng hàng, `ttHdGoc` (Bị thay thế, Bị điều chỉnh), `thayTheNhap`, `lyDoKhongLap`, `phatHanhNhap`, `xoaCtHd`, `soCtMoi`.
- `hddt.tsx`, thẻ khai báo HĐĐT: bỏ ô chọn mẫu số. Mẫu số chỉ đọc, lấy theo `mauSoHd` (khấu trừ 1, % doanh thu 2). Bảng theo cửa hàng chỉ còn chọn ký hiệu. `cauHinhHddt` luôn trả mẫu số theo phương pháp tính thuế.
- `src/ui/generic/ChungTuForm.tsx`: thêm prop `lapHd`. Các ô đầu phiếu đọc từ `r0 = row ?? lapHd`. Thêm dòng hoá đơn gốc trên cùng, kèm link xem. Hoá đơn điều chỉnh có thêm lựa chọn Điều chỉnh giảm, Điều chỉnh tăng. Thêm ô lý do bắt buộc trải ngang, chân form Lưu dự thảo, Lưu và phát hành. Mở lại dự thảo có nút Phát hành. Huỷ bán khoá sửa xoá, chân form ghi "Sửa hoặc xoá ở hoá đơn thay thế". Tham chiếu 3 chiều. Xoá thay thế thì xoá luôn huỷ bán. Sửa ngày thay thế thì huỷ bán đổi ngày theo.
- `src/modules/ban-hang/ChungTuBanHang.tsx`: đường dẫn `moi?lap=tt|dc&goc=<id>` mở form lập. Danh sách thêm cột Loại chứng từ (lọc ở hàng lọc cột), cột Tham chiếu. Trạng thái xuất HĐĐT có thêm Dự thảo, Không xuất HĐ. Hoá đơn gốc có chip Bị thay thế, Bị điều chỉnh, hoặc nhắc đang có thay thế dự thảo. Xuất HĐĐT hàng loạt bỏ qua 3 loại mới.
- `src/modules/hoa-don/HoaDonDienTu.tsx`: menu ⋯ Thay thế, Điều chỉnh mở form thật; Phát hành, Xoá dùng được với dự thảo. Danh sách hiện dự thảo, cột Hoá đơn gốc, trạng thái Bị thay thế, Bị điều chỉnh, không hiện huỷ bán. Tab Điều chỉnh thay thế hiện cặp lập thật trước dữ liệu mẫu, bấm số chứng từ mở được cả hai.
- `src/styles/app.css`: mục cuối file `(T787)`.
- Góp ý của dinhlanphuongipacc sau lần push đầu, chỉ ở form Hoá đơn điều chỉnh: lựa chọn loại điều chỉnh lên cùng dòng hoá đơn gốc, Điều chỉnh tăng đứng trước. Khoá khối thông tin chung (kho, khách hàng, địa chỉ, MST, người giao dịch, kênh bán, ghi chú, người mua) bằng biến `suaTtc`. Ngày hoá đơn, ký hiệu, ngày chứng từ, lý do vẫn sửa được. Form Hoá đơn thay thế giữ nguyên.
- Góp ý tiếp: form điều chỉnh gõ được số âm ở số lượng, đơn giá, các ô tiền. `OSoGo` thêm prop `am` cho gõ dấu trừ đứng đầu, `BangHangBan` thêm prop `choAm`. Hàm `theoChieu` (BangHangBan.tsx) thay `dauDong` ở form: dòng nào thành tiền sai chiều tăng, giảm thì đổi dấu đơn giá; ô tiền gõ thẳng sai chiều thì đổi dấu ô đó. Đã thử: gõ -5 ở số lượng thì đơn giá về dương, thành tiền âm. Lỗi sau đó: bấm phím "-" xong con trỏ nhảy về trước dấu trừ, số gõ tiếp đứng trước nên mất dấu trừ. Đã sửa `OSoGo`: con trỏ tính cả dấu trừ, có dấu trừ ở đâu trong ô cũng là số âm (gõ "30-" thành -30). Dấu trừ chỉ nằm ở một trong hai ô: gõ âm số lượng thì đơn giá về dương, gõ âm đơn giá thì số lượng về dương (`theoChieu` nhận dòng cũ để biết ô vừa gõ). Đã thử: số lượng -5 thì giá 85.000; giá -90.000 thì số lượng 5.
- Góp ý tiếp: form hoá đơn thay thế, điều chỉnh (thêm mới và xem) ẩn ô Ghi chú, ô Email để bảng chi tiết rộng hơn. Ghi chú vẫn chép từ chứng từ gốc và lưu như cũ. Sau đó dinhlanphuongipacc cho hiện lại Email: hàng cuối khối thông tin chung là Lý do (hai cột trái) và Email nhận hoá đơn (hai cột phải), Email sửa được khi lập, sửa, cả ở form điều chỉnh.
- Luật menu ⋯ (dinhlanphuongipacc chốt 11/11/2026, `lyDoKhongLap` ở `hddt.tsx`): Điều chỉnh chỉ cho hoá đơn gốc, kể cả gốc đã bị điều chỉnh. Thay thế cho hoá đơn gốc hoặc hoá đơn thay thế. Hoá đơn điều chỉnh mờ cả hai. Đã thử trên danh sách hoá đơn điện tử.
- Góp ý tiếp, áp cho mọi form chứng từ (`app.css`, mục cuối "Form chứng từ gọn hơn"): khoảng cách giữa các khối 10px còn 6px, lề trên dưới còn 8px. Dải trống dưới dòng Tổng cộng khi bảng ít dòng là hàng nút Thêm dòng bị khung bảng cắt nửa. Đã thử ghim hàng nút ở đáy, dinhlanphuongipacc không đồng ý, giữ hàng nút cuộn ở cuối bảng như cũ.

## Đã kiểm

- `npm run typecheck`: không lỗi. `npm run build`: chạy xong, không lỗi.
- `python tools/kiem_tra.py --nhanh`: "Không có lỗi."
- `python tools/kiem_van.py` 4 file code: 0 ĐỎ.
- Bấm thử trên trình duyệt, gói Plus: lập thay thế BH2610-0003, Lưu dự thảo sinh HDTT2610-0001 và HBH2610-0001 ghi âm, tham chiếu 3 chiều. Phát hành từ menu ⋯ thì hoá đơn gốc chuyển Bị thay thế. Form điều chỉnh đổi giảm, tăng thì dòng hàng đổi dấu.
- Chưa bấm thử: xoá thay thế dự thảo, sửa ngày thay thế, nút Phát hành ở chân form.
- `tools/xuat_bao_cao_he_thong.py` vẫn lỗi thiếu module `build_present` trên máy này, chưa làm mới `docs/IACC-Cloud-Chi-Tiet-He-Thong.xlsx`.

## Dở dang, việc tiếp theo

- Không. Việc tiếp là T788: kê khai thay thế, điều chỉnh về kỳ gốc.
- Ghi chú cho T788: hoá đơn mới giữ hoá đơn gốc ở `_hdGoc`, tiền hoá đơn ở `_tienHd`, loại ở `_loaiCt`, chiều điều chỉnh ở `_dcLoai`. Huỷ bán có `_loaiCt: 'HUYBAN'`, không lên bảng kê.
- Hoá đơn gốc trả tiền mặt ngay: hoá đơn thay thế chép luôn hình thức thanh toán nên sinh thêm phiếu thu như bán hàng thường. Huỷ bán không sinh phiếu chi. Cần Trum hoặc dinhlanphuongipacc chốt có giữ cách này không.
- Chỉ màn Bán hàng gói Plus (`ban-hang/3-1-1`) lập được. Gói Pro 3.1.7 chưa có HĐĐT, menu ⋯ ghi rõ lý do.
- Lập, phát hành chỉ giữ trong phiên, tải lại trang là mất (bản mẫu chưa có backend).

## Bẫy, quyết định mới

- Không. Làm theo QD107.
