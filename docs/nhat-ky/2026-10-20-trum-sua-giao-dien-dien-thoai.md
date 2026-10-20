# Sửa giao diện điện thoại: trang chủ Free, icon khối, hàng lọc, màn chứng từ (T519, T520, T521, T522)

- Ngày: 20/10/2026
- Người: Trum, agent: Claude Code điều phối, 4 Antigravity code, 1 Antigravity review
- Trạng thái cuối phiên: Xong

## Đã làm

- T519, `MTrangChuFree.tsx`: chip Năm, Tháng bỏ ô `<select>` ẩn, mở bảng trượt `MChon` như chip CN.
- T519, `MTrangChuFree.tsx`, `BaBaiToanFree.tsx`: Quỹ tiền dùng `VongQuy kieu="mobile"`, vòng nằm giữa, nhãn % và tên quỹ kéo ra quanh vòng, màu dải xanh `MAU_QUY_FIGMA`. `VongQuy` nhận thêm `moDs`, `onMoDsThayDoi` để nút "Tất cả quỹ (N)" mở bảng nhỏ danh sách quỹ. Xoá `MAU_QUY_T402`, `MAU_CON_LAI` vì hết chỗ dùng.
- T519, `MKhoFree.tsx`: 3 nút Tạo phiếu mua hàng, Thanh toán nhà cung cấp, Kiểm kê ngay chữ xanh (`chu-xanh`), icon plus, card, clipboard như web.
- T520, `app.css` mục T520: icon khối điện thoại (`ic-2m`, `.o-nen .ic`, tab đang chọn thanh dưới) bỏ chi tiết cam, đổi xanh đậm `#1673BD`, xanh nhạt `#7FBCEE`, chỉ áp trong `body:has(.m-app)`.
- T520, `app.css` mục T520: hộp Lãi lỗ theo cửa hàng xếp 3 cột theo đỉnh, ô tên cao đủ 2 dòng, đáy cột thẳng hàng.
- T521, `MDtThuChiDs.tsx`, `MChungTu.tsx`: chip ngày, CN, Trạng thái thành `<span class="m-chip-xem">` chỉ xem. Chỉ nút phễu mở bộ lọc. Gỡ bảng chọn CN, Trạng thái cũ.
- T521, `MLoc.tsx`: thêm dòng Chi nhánh, Trạng thái (prop tuỳ chọn `dsChiNhanh`, `dsTrangThai`). Chọn Chi nhánh ghi vào phiên `cuaHang`, Trạng thái ghi `chipTT` và tham số URL `tt`.
- T521, `MSoBaoCao.tsx`: Sổ quỹ, Sổ ngân hàng và báo cáo khác cùng một hàng lọc: nút phễu + chip xám chỉ xem. Kính lúp bật dùng class `on`, bỏ nền vàng `.active` dùng chung với nút ghim.
- T522, `app.css` mục T522: màn xem, sửa, tạo phiếu thu chi bỏ lề cộng dồn, thẻ trắng sát mép, chữ cách mép 16px. Khoảng trống đáy đặt ở phần thân để footer 68px không che dòng cuối. Đã soát MXemPhieu, MLapPhieu, MLapPhieuKho, MCcdc: không cùng lỗi, không sửa.

## Đã kiểm

- `npm run typecheck`: không lỗi. `npm run build`: chạy xong, không lỗi.
- `python tools/kiem_tra.py --nhanh` (dev server cổng 5183, `KIEM_TRA_URL`): lần 1 báo "Form phiếu thu: Esc không quay về Quy trình", lần 2 in `Không có lỗi.`. Lỗi lần 1 là lỗi thất thường, phần sửa đợt này chỉ đụng điện thoại.
- `python tools/kiem_tra.py --dien-thoai`: dừng ở bước bấm `.m-xp-nut-menu` (TimeoutError) trong "Kiểm tra lập phiếu đợt 5". Bản sạch commit `e0284ea` cũng dừng y chỗ đó, nên lỗi có từ trước. Đã ghi việc mới T525.
- Mỗi anti tự kiểm bằng Playwright khổ 390×844 (T522 thêm 360×740, T520 thêm 1366×768).

## Dở dang, việc tiếp theo

- Không.
- CSS `.m-tc-chip-select-an` (`app.css`, mục T498) hết chỗ dùng, để lại vì đang có người sửa giữa file. Dọn khi rảnh.

## Bẫy, quyết định mới

- Không. Cổng 5180 và 5181 trên máy Trum đang có dev server của 2 bản clone khác (`Web`, `Web-t510`). Chạy `kiem_tra.py` cho bản này phải mở cổng khác và đặt `KIEM_TRA_URL`.
