# Tab Hoá đơn mua hàng, mua hàng không qua kho (T821)

- Ngày: 13/11/2026
- Người: dinhlanphuongipacc, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `app/plan.ts`: mở mã 4.1.2 Hoá đơn mua hàng cho gói Plus, Pro (trước chỉ gói Pro), dinhlanphuongipacc chốt.
- `mua-hang/hoa-don-mua.ts` (mới): cấu hình phiếu HDM (`khongKho: true`), 8 kiểu hoá đơn mẫu (tiền điện, sửa chữa, nồi inox chờ phân bổ...), dòng không mã hàng, nhà cung cấp hợp khoản chi; hàm `hoaDonMuaChiPhiThang` lấy hoá đơn có lý do Là chi phí trong tháng.
- `mua-hang/index.ts`: màn 4.1.2 dùng cấu hình mới, tiêu đề phụ `phu: 'Mua hàng không qua kho'`.
- `modules/types.ts`: thêm `ScreenDef.phu` (tiêu đề phụ), `VoucherCfg.khongKho`.
- `ui/generic/nhom.ts`: nhóm `mua` có `khongKho` thì bỏ kho, bỏ Giá trị nhập kho, thêm ô Lý do nghiệp vụ (`LY_HD_MUA` = lý do chi bỏ các lý do chỉ là chuyển tiền: CHI02, CHI10, CHI16, CHI23, CHI32, CHI33, CHI34).
- `ChungTuForm.tsx`: ô Lý do nghiệp vụ dùng chung cơ chế phiếu chi (nhãn Chi phí, nhắc và hộp tạo thẻ chi phí phân bổ khi lưu); không có Trả hàng; dòng đầu phiếu mới để trống mã; tiêu đề form có dòng phụ.
- `BangSua.tsx`: cột "Diễn giải", thêm dòng là dòng trống mã, gõ tự do.
- `ChonDanhMuc.tsx` (hộp `HopThemHang`), `truong-dm.ts` (xuất `LOAI_HANG`, `LOAI_HANG_PRO`): gói Plus, Pro thêm hàng tại form chứng từ chọn được Loại hàng hoá, Nhóm hàng hoá, tiêu đề hộp "Thêm hàng hoá"; gói Standard giữ loại khoá theo màn.
- `gen.ts`: `tkTheoLyDo('mua')` Nợ TK theo lý do, Có 331.
- `VoucherScreen.tsx`: danh sách Hoá đơn mua hàng có cột Lý do, bộ lọc Lý do nghiệp vụ.
- Tab chỉ ghi "Hoá đơn mua hàng"; tiêu đề phụ "Mua hàng không qua kho" chữ nhỏ cùng dòng sau tiêu đề form (`app.css`).
- Đầu form hoá đơn (`lyDuoi` trong `ChungTuForm.tsx`): hàng 1 Nhà cung cấp, Mã số thuế; hàng 2 Địa chỉ, Người giao dịch; hàng 3 Lý do nghiệp vụ, Ghi chú (Ghi chú rộng một cột); hai ô nằm trong cột 1, cột 2 nên cách đều các ô trên, kể cả khi bật Nhận kèm hoá đơn.
- Dải đáy form hoá đơn chỉ còn Tổng tiền, bỏ Tiền hàng, Chiết khấu, Tiền thuế GTGT (số này đã có trên dòng).
- Chi phí: `home/chiPhiPhieu.ts` (Chi phí trong tháng, KQKD trang chủ, web và điện thoại), `bao-cao/so-bo-sung.ts` (Sổ chi phí 10.4.3), `tong-hop/BaoCaoTaiChinh.tsx` (KQKD gói Standard) cộng hoá đơn có lý do Là chi phí, số tiền trước thuế. `ChiPhiThang.tsx`, `MChiPhiThang.tsx` mở đúng hoá đơn, ghi loại Hoá đơn mua hàng.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- Trình duyệt gói Standard (trước khi đổi sang chỉ Plus, Pro): tab "Hoá đơn mua hàng · Mua hàng không qua kho"; danh sách có cột Lý do, không cột Kho; form có ô Lý do nghiệp vụ, không có kho; chọn "Chi phí chờ phân bổ" hiện nhắc, lưu xong hộp báo rồi mở Thẻ chi phí phân bổ điền sẵn số HDM.
- Sổ chi phí tháng 10 và chi phí trang chủ cộng 3 hoá đơn mẫu có lý do Là chi phí, bỏ hoá đơn chờ phân bổ.
- `python tools/kiem_tra.py --nhanh` sau khi xong: `Không có lỗi.`
- `python tools/kiem_tra.py` bản đầy đủ chạy trước khi xong việc báo 2 lỗi không dính việc này: "[PL] thanh tab ... chỉ có 84 màn" (ngưỡng 110 cũ) và tour Sổ quỹ quá thời gian bấm.
- `kiem_van.py`: các file có chữ giao diện sạch.

## Dở dang, việc tiếp theo

- Không.
- Gói mở màn ở dòng `'4.1.2'` trong `THEO_ROADMAP` của `app/plan.ts`; phần cộng chi phí (trang chủ, KQKD) tự theo gói.
- Chi phí lấy tiền trước thuế GTGT (thuế coi như được khấu trừ). Hộ kinh doanh không khấu trừ thì có thể phải cộng cả thuế, cần Trum chốt.
- Điện thoại chưa có màn lập Hoá đơn mua hàng riêng (người dùng chỉ yêu cầu web).
- `python tools/xuat_bao_cao_he_thong.py` lỗi `No module named 'build_present'` như các phiên trước, chưa làm mới file Excel.
- Commit chỉ nằm trên máy, chưa push: người dùng dặn khi nào bảo mới push.

## Bẫy, quyết định mới

- Không.
