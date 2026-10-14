# Báo cáo kiểm kê, số dư quỹ ở danh mục, nhãn chi phí (T244, T245, T246)

- Ngày: 14/10/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- T244: `kho/bao-cao.ts` thêm `baoCaoKiemKe` (cộng dòng phiếu xuất, nhập điều chỉnh sinh từ kiểm kê theo mặt hàng, kho). `kho/index.ts` đăng ký 5-2-15. `bao-cao/danh-sach.ts` cấu hình 5.2.15, mở mọi gói.
- T244: `ReportScreen.tsx` nút ô lọc chọn nhiều thêm lớp `sel`, hết chữ căn giữa. `BaBaiToanFree.tsx` thẻ Hao hụt kiểm kê mở báo cáo cùng tháng.
- T245: `types.ts` thêm `CatalogCfg.phien` (gắn giá trị phiên vào dòng, lưu form vào phiên); `CatalogScreen.tsx` dùng nó. `danh-muc/index.ts`, `truong-dm.ts`: cột, ô Số dư ban đầu gói Free. `SoDuBanDau.tsx` thêm `soDuQuyBanDau`, `datSoDuQuy`.
- T245: `tien/index.ts` màn `so-du-ban-dau` thành chuyển hướng sang `danh-muc/1-12`, ẩn khỏi thanh tab. `DanhMucChiNhanh.tsx`, `MChiNhanh.tsx`, `manMobile.ts` đổi lối vào. Trang chủ nút Tạo quỹ, gợi ý bấm quỹ.
- T246: `ChiPhiThang.tsx` dòng giải thích; `ChungTuForm.tsx` nhãn Chi phí cạnh ô lý do; `LichSuQuy.tsx` lọc khoản thu, khoản chi.
- `app.css`: mục cuối T232 có thêm dòng của T245, T246.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `kiem_tra.py --nhanh`: Không có lỗi. Chạy bằng bản sao tạm đổi đường dẫn ảnh, vì T243 chưa sửa.
- `kiem_van.py` các file đã sửa: không ĐỎ.
- Trình duyệt: báo cáo kiểm kê tháng 9 ra 31 dòng; thẻ Hao hụt mở đúng kỳ; sửa số dư TM01 thành 100.000.000 thì bảng đổi theo; link cũ `tien/so-du-ban-dau` chuyển sang danh mục; nhãn Chi phí hiện với lý do Chi mua nguyên vật liệu; lọc Khoản chi còn 6 giao dịch đều là chi.
- Chưa thử: đổi sang lý do không tích chi phí trên form (hộp chọn không mở bằng cú bấm thử); danh mục Quỹ tiền trên điện thoại.

## Dở dang, việc tiếp theo

- Không. Lưu ý: thêm quỹ mới thì số dư lưu được nhưng dòng quỹ chưa hiện thêm trong bảng (form danh mục chưa lưu thật dòng mới, việc T09).

## Bẫy, quyết định mới

- `docs/QUYET-DINH.md`: QD61 số dư ban đầu quỹ gói Free khai ở Danh mục Quỹ tiền.
