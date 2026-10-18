# Giao diện app, web đợt T391–T415

- Ngày: 18/10/2026
- Người: Trum, agent: Claude Code điều phối, Antigravity (Windows, WSL) code và review
- Trạng thái cuối phiên: Xong

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

- T414: màn xem, tạo mới, sửa phiếu thu chi, mua hàng, kiểm kê điện thoại theo khuôn thẻ phân bổ (`MXemPhieu.tsx`, `MLapPhieu.tsx`, `MLapPhieuKho.tsx`): gói Free ẩn hạch toán, ghi sổ; nút chính xanh; phiếu mua dòng hàng 6 ô, sửa Tổng tiền chia ngược đơn giá, Ngày hoá đơn, Thanh toán ngay chọn quỹ (Free số tiền trả chỉ đọc); màn xem phiếu mua có nút Thanh toán mở bảng chọn quỹ, lập phiếu chi bằng `themPhieu(MAN_THU_CHI)` như form chứng từ, lưu vào `_dsTt`; chip thanh toán hiện mọi gói; kiểm kê ô ĐVT đầu dải [ĐVT | Tồn sổ | Thực tế | Chênh lệch], gói Standard chọn ĐVT quy đổi, nút Thêm hàng kiểm kê.
- T416: CSS chung cho khung cuộn báo cáo, danh sách, Xuất bán POS khi có thanh tab (`.m-app:not(.m-cap-2)`), đo 22 màn.
- T417: % thẻ KQKD điện thoại bỏ nền, viền; khối Mua hàng & Công nợ 2 dòng (`MKhoFree.tsx`).
- T418: đang xem Tất cả mà mở đường dẫn tạo phiếu (`/moi`, `?moi=1`) thì bật bảng chọn cửa hàng (`src/ui/ChonCuaHangTruoc.tsx`, chặn ở `Shell.tsx`, `MobileShell.tsx`); chọn xong lưu làm cửa hàng hiện tại; danh mục không chặn.

## Đã kiểm

- `npm run typecheck`: không lỗi. `npm run build`: chạy xong, không lỗi.
- `python tools/kiem_tra.py --nhanh`: "Không có lỗi."
- `python tools/kiem_van.py` cho mọi `.tsx` đã sửa: 0 ĐỎ.
- Review chéo (Antigravity WSL, pre-push-qa) 4 lượt: T391–T402 VÀNG (đã xử lý), T403/T406 VÀNG (báo nhầm, giữ nguyên), T409–T411 XANH, T412/T413/T415 XANH.

## Dở dang, việc tiếp theo

- Không còn việc dở trong đợt này (T414 đã code xong).
- T399: chờ PhuongXT xong T321 để nối lọc vào màn Thêm cửa hàng từ FABi.

## Bẫy, quyết định mới

- Không ghi BAY, QUYET-DINH. Lưu ý: danh sách thu chi lọc theo TÊN lý do, liên kết `?lyDo=` phải truyền tên, không truyền mã.
