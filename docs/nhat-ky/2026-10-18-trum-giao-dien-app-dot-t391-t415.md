# Giao diện app, web đợt T391–T415

- Ngày: 18/10/2026
- Người: Trum, agent: Claude Code điều phối, Antigravity (Windows, WSL) code và review
- Trạng thái cuối phiên: Xong (T414 dở dang: bản mẫu đã duyệt, chưa code)

## Đã làm

- T391: gói Free ẩn trạng thái Đã/Chưa ghi sổ ở danh sách chứng từ web, điện thoại (`VoucherScreen.tsx`, `MChungTu.tsx`, `MXemPhieu.tsx`).
- T392, T411: chi tiết đơn Xuất bán POS điện thoại theo mẫu B: thông tin hai cột, khối tổng ở chân ngoài vùng cuộn, bấm bung; chỉ nút Đóng (`MXuatBanPos.tsx`).
- T393: số tổng cuối phiếu mua in đậm (`ChungTuForm.tsx`, `MXemPhieu.tsx`).
- T394: thẻ Chi phí hoạt động bấm lý do mở danh sách Thu, chi tiền lọc sẵn (`?lyDo=<tên lý do>&thang=YYYY-MM`); màn chi phí NVL điện thoại (`MChiPhiNvl.tsx`); lọc Lý do ở danh sách thu chi điện thoại.
- T395: Lịch sử thu chi theo phương án A, giữ thanh lọc cũ (`LichSuQuy.tsx`, `MLichSuQuy.tsx`).
- T396, T397: báo cáo điện thoại dạng thẻ nền trắng; báo cáo nhóm Kho hiện mã báo cáo.
- T398, T409: danh mục có tab trạng thái dùng chip chung của danh sách chứng từ; số điều kiện lọc hiện trên icon phễu, bỏ dòng Lọc nâng cao; lọc nâng cao theo trường từng danh mục (không lọc Mã, Tên); nút Đồng bộ FABi chỉ ở Hàng hoá, Nhóm hàng hoá, Cửa hàng, Phương thức thanh toán, màu nút chung, không logo; bỏ dòng nhắc chờ đồng bộ (`CatalogScreen.tsx`, `MDanhMuc.tsx`, `ThanhLoc.tsx`, `MDanhSach.tsx`).
- T399: màn Thêm cửa hàng từ FABi điện thoại (`MThemCuaHangFabi.tsx`), chờ T321 bổ sung lọc.
- T400: icon Hàng hoá (nhãn), Nhóm hàng hoá (hai nhãn), Phương thức thanh toán (ví).
- T401: các màn Thiết lập điện thoại lề 16px, ô 100%, nút Lưu sát đáy.
- T402, T413: vòng tồn quỹ màu tươi có nhãn (web, điện thoại); điện thoại nút Tạo quỹ cùng hàng Xem dòng tiền 13 tháng. T408 (danh sách quỹ bên phải) đã bỏ theo Trum.
- T403: Bảng kê mua hàng 4.2.7 điện thoại gom theo nhà cung cấp, mặt hàng, phiếu; dòng hàng dạng nhãn và số (`MBangKeMua.tsx`; `MSoBaoCao.tsx` bỏ 4.2.7 khỏi nhóm ép xem bảng).
- T404, T405: thẻ KQKD trang chủ điện thoại số canh phải; báo cáo KQKD điện thoại dòng tổng bấm thả dòng con.
- T406: sổ TT152 điện thoại (S1a, S2a–S2e) dạng bảng dữ liệu (`MSoTT152.tsx`, hook trong `MBaoCaoDong.tsx`, `MSoBaoCao.tsx`).
- T407: nút lọc báo cáo điện thoại dùng icon phễu (`MobileShell.tsx`).
- T410, T415: Ghi tăng thẻ chi phí: ô tên hàng riêng, chọn được ngày (LichDon); form tạo, sửa cùng giao diện màn Xem (`MCcdc.tsx`).
- T412: Nhập xuất tồn lọc Kho, bấm mã hàng mở Thẻ kho cùng kỳ, kho; Thẻ kho đọc tham số (`XuatNhapTon.tsx`, `TheKho.tsx`, `MToGiay.tsx`).

## Đã kiểm

- `npm run typecheck`: không lỗi. `npm run build`: chạy xong, không lỗi.
- `python tools/kiem_tra.py --nhanh`: "Không có lỗi."
- `python tools/kiem_van.py` cho mọi `.tsx` đã sửa: 0 ĐỎ.
- Review chéo (Antigravity WSL, pre-push-qa) 4 lượt: T391–T402 VÀNG (đã xử lý), T403/T406 VÀNG (báo nhầm, giữ nguyên), T409–T411 XANH, T412/T413/T415 XANH.

## Dở dang, việc tiếp theo

- T414: Trum đã duyệt bản mẫu màn xem chi tiết và màn tạo mới, sửa của phiếu thu chi, phiếu mua hàng, phiếu kiểm kê điện thoại (file mẫu `backup/mock-T414.html` và artifact claude.ai "Form phiếu điện thoại"). Gói Free ẩn hạch toán. Phiếu mua: dòng hàng 6 ô (SL, ĐVT khoá ở ĐVT chính với gói Free, Đơn giá, Giảm giá % hoặc đ, VAT, Tổng tiền; sửa Tổng tiền thì đơn giá tự chia), ô tìm hàng trong phiếu, Thanh toán ngay có bảng chọn quỹ. Kiểm kê có nút Thêm hàng kiểm kê. Phiếu mua thêm Ngày hoá đơn dưới Ký hiệu; gói Free Thanh toán ngay trả hết tổng phiếu, không sửa số tiền trả. Bản mẫu cuối: `backup/mock-T414-form.html`. Bước kế: giao code.
- T399: chờ PhuongXT xong T321 để nối lọc vào màn Thêm cửa hàng từ FABi.

## Bẫy, quyết định mới

- Không ghi BAY, QUYET-DINH. Lưu ý: danh sách thu chi lọc theo TÊN lý do, liên kết `?lyDo=` phải truyền tên, không truyền mã.
