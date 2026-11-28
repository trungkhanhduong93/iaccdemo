# TK công nợ, TK thuế lên đầu phiếu mua, bán; Hoá đơn mua hàng có Tk chi phí (T964)

- Ngày: 28/11/2026
- Người: dinhlanphuongipacc, agent: Claude Code
- Trạng thái cuối phiên: Dở dang

## Đã làm

- `src/ui/generic/ChungTuForm.tsx`: gói Pro, Phiếu mua hàng, Hoá đơn mua hàng, Hoá đơn bán hàng có hai ô `TK công nợ` (hoặc `TK thanh toán`) và `TK thuế GTGT` ở cột phải dưới Ngày chứng từ (lớp `ct-tk-phieu`). Mặc định đổi theo hình thức thanh toán (mua 331, bán 131, trả ngay 1111, 1121; thuế mua 1331, bán 33311), user chọn lại được, chọn lại đúng mặc định thì về theo mặc định. Lưu ở `_tkTt`, `_tkThue` của phiếu. Công tắc Ẩn cột tài khoản ẩn luôn hai ô này.
- `src/ui/generic/BangSua.tsx`: phiếu mua bỏ cột Tk thanh toán, Tk thuế, chỉ còn Tk kho; bán hàng ẩn cột TK công nợ qua prop `anTkBen`, còn cột TK doanh thu.
- `src/ui/generic/tk-mua.ts`: `tkPhieuMua`, `tkPhieuSua` đọc `_tkTt`, `_tkThue`; `butToanMua` nhận `tkThue`, `tkCpGoiY`; `tkKhoCua` nhận gợi ý Tk chi phí.
- `src/ui/generic/ChungTuForm.tsx` (`layButToan`, `HachToan`), `src/ui/mobile/butToan.ts`, `src/ui/generic/DanhSachButToan.tsx`: bút toán dùng tài khoản cấp phiếu đã sửa (tab Hạch toán, danh sách bút toán, điện thoại).
- Hoá đơn mua hàng không qua kho: cột Tk kho thành `Tk chi phí`, gợi ý theo lý do nghiệp vụ (`tkChiPhiCuaLy` trong `src/modules/tien/dinh-khoan-pro.ts`), sửa được từng dòng (`Dong.tkCp` trong `gen.ts`); lý do tích Chi phí phân bổ nhiều kỳ thì gợi ý tài khoản chi phí trả trước của lý do (mặc định 242). Diễn giải dòng ăn theo lý do, sửa lại được.
- Thẻ phân bổ lập từ hoá đơn mua hàng: số tiền = thành tiền đã trừ giảm giá, cộng tiền thuế khi thuế GTGT tính theo doanh thu, không cộng khi khấu trừ; màn thông báo có thêm dòng giải thích.
- `tools/kiem_tra.py`: bài T233 màn bán hàng 3-1-2 đổi theo bố cục mới.

## Đã kiểm

- `npm run typecheck`, `npm run build`: chạy xong, không lỗi.
- `python tools/kiem_tra.py --nhanh`: Không có lỗi (sau khi sửa bài T233).
- `python tools/kiem_van.py` cho 5 file đã sửa: 0 ĐỎ.
- Xem trên preview: Phiếu mua hàng, Hoá đơn mua hàng, Hoá đơn bán hàng hiện đủ hai ô; đổi radio Thanh toán thì TK đổi theo. Hàm `tkChiPhiCuaLy` trả đúng 153, 211, 242, 6422.
- Chưa kiểm được trên giao diện: đổi lý do thì Tk chi phí và Diễn giải dòng đổi theo; lưu hoá đơn mua có lý do phân bổ rồi xem số tiền ở màn tạo thẻ (cả hai phương pháp thuế); lưu phiếu rồi mở lại giữ tài khoản đã sửa. Lý do: ô chọn lý do không thao tác ổn định bằng công cụ tự động.

## Dở dang, việc tiếp theo

- Mặc định TK công nợ, TK thuế đang là hằng số trong code, chưa nối vào Giá trị mặc định theo cửa hàng của T955, T962 (Trum). Chờ Trum xong T962, nối `macDinhTt`, `macDinhThue` trong `ChungTuForm.tsx` vào `giaTriMacDinh.ts`.
- Trum chưa xác nhận việc bỏ hai cột Tk thanh toán, Tk thuế của T961.
- `DanhSachButToan.tsx` dòng gọi `tinhButToan` chưa truyền hình thức thanh toán cho phiếu bán, nên phiếu bán thu tiền ngay vẫn ra 131 trong danh sách; hỏi Trum có đúng ý không.
- Điện thoại (`MLapPhieu.tsx` do Trum giữ ở T552) chưa có ô sửa TK cấp phiếu; bút toán điện thoại đã đọc `_tkTt`, `_tkThue` nếu phiếu có.
- Hoá đơn mua hàng phân bổ nhiều kỳ: chỉ ghi Nợ 242, chưa kiểm luồng tạo thẻ đầy đủ.
- TK thuế luôn hiện, chưa ẩn khi mọi dòng KCT.

## Bẫy, quyết định mới

- Không ghi `docs/BAY.md`, `docs/QUYET-DINH.md`.
- Bẫy khi làm: nhiều phiên cùng thư mục thì `git add` cả file kéo theo sửa dở của phiên khác (lỡ commit 2 dòng `dungCho` làm trang trắng, đã gỡ). Chỉ stage đúng đoạn của mình.
- Bẫy preview: `.claude/launch.json` ở thư mục cha `IACC Cloud` có cổng 5184 trỏ `Web-T844`, không phải `IACC DEMO`; dùng cấu hình `iacc-demo-dir`.
