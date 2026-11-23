# Báo cáo Tổng hợp mua hàng theo hàng hoá; Bảng kê chi tiết mua hàng chỉ xem chi tiết; đường dẫn về nhóm báo cáo (T910)

- Ngày: 24/11/2026
- Người: dinhlanphuongipacc, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/modules/mua-hang/bao-cao.ts`: thêm `tongHopMuaTheoHang`, gom dòng hàng của phiếu mua 4.1.1 theo mã hàng. Cột như Bảng kê chi tiết mua hàng 4.2.7, bỏ Ngày, Số phiếu, Nhà cung cấp: Mã hàng, Tên hàng, ĐVT, Số lượng, Đơn giá (bình quân = Thành tiền / Số lượng), Thành tiền, Chiết khấu, Tiền trước thuế, Thuế GTGT, Tổng tiền. Xếp theo Tổng tiền giảm dần, cuối có dòng Tổng cộng.
- Cột Mã hàng có hàm vẽ `oMaHang` như T814 bên bán hàng: liên kết `target="_blank"` tới `/app/mua-hang/4-2-7`, mang kỳ, bộ lọc đang xem (`daXemTrangHienTai`), thêm `locHang` là tên mặt hàng của dòng (`linkBaoCaoTabMoi`). Dòng tổng giữ chữ.
- `src/modules/mua-hang/index.ts`: màn `4-2-8` "Tổng hợp mua hàng theo hàng hoá", ngoài Excel như 4-2-7.
- `src/modules/bao-cao/danh-sach.ts`: cấu hình mẫu `4.2.8` khổ ngang, bộ lọc `LOC_MUA` (kho, hàng hoá, nhóm hàng, nhà cung cấp); thêm `4.2.8` vào `MO_IFASTER` để mở mọi gói như các báo cáo mua hàng khác.
- `src/modules/mua-hang/quy-trinh.ts`: tab Báo cáo của phân hệ Mua hàng có 4-2-8, đứng sau Tổng hợp mua hàng theo NCC.
- Bảng kê chi tiết mua hàng 4.2.7 chỉ xem Chi tiết (người dùng yêu cầu giữa phiên): cờ cấu hình mới `chiChiTiet` ở `CauHinhBC` (`danh-sach.ts`). Có cờ thì `ReportScreen.tsx` ẩn nút Tổng hợp/Chi tiết và luôn xem chi tiết, kể cả khi tuỳ chỉnh đã lưu `xemNhom: 'tongHop'`; hộp Tuỳ chỉnh (`TuyChinhBC.tsx`) ẩn mục Kiểu xem. Gom nhóm vẫn dùng được.
- Hai lối vào trang chủ trước mở 4.2.7 gom theo mã hàng dạng Tổng hợp: nút Bảng kê mua hàng ở `BaBaiToanStandard.tsx`, liên kết Bảng kê ở `MKhoStandard.tsx` (điện thoại). Giờ cả hai mở 4.2.8, bỏ đoạn ghi tuỳ chỉnh.
- Thanh đường dẫn đầu báo cáo (`ThanhChon.tsx`): tên nhóm (vd Mua hàng) thành liên kết về `/app/bao-cao/nhom-<phân hệ>`; báo cáo mở trong phân hệ thì về tab Báo cáo của phân hệ. Trước đây chỉ có nút Báo cáo về Tất cả báo cáo.
- Đổi mã việc từ T907 sang T910: Trum đã nhận T907 (Xuất kho định lượng) trên GitHub trước khi phiên này push.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_tra.py --nhanh`: lần 1 báo 2 lỗi ở tour điện thoại, console ghi lỗi nạp nóng `registry.ts` sau khi `src/modules/kho/index.ts` bị một phiên khác sửa giữa lúc chạy (không phải file của việc này). Lần 2: Không có lỗi.
- `python tools/kiem_van.py` cho `mua-hang/bao-cao.ts`, `mua-hang/index.ts`: Sạch.
- Trình duyệt: 4.2.7 lưu sẵn tuỳ chỉnh gom theo mã hàng, kiểu xem Tổng hợp vẫn hiện dòng chi tiết dưới từng nhóm, không còn nút Tổng hợp/Chi tiết. Ở 4.2.8, bấm Mua hàng trên thanh đường dẫn mở `#/app/bao-cao/nhom-mua-hang`, nhóm có 4 báo cáo.
- Trình duyệt, gói Pro, tất cả cửa hàng, tháng 9/2026: 4.2.8 có 12 mặt hàng, tổng thành tiền 440.569.000; mã hàng là liên kết tab mới. Mở liên kết NVL001 ra `#/app/mua-hang/4-2-7?bcKy=9&bcLoc={"locHang":["Thịt bò thăn"]}`, dòng phụ "Tháng 9/2026 · Tất cả cửa hàng · Hàng hoá: Thịt bò thăn", chỉ còn dòng NVL001. Màn Báo cáo, nhóm Mua hàng có 4 báo cáo, gồm báo cáo mới.

## Dở dang, việc tiếp theo

- Chưa push: người dùng dặn chỉ push khi được bảo.
- `ReportScreen.tsx` (T594) và `TuyChinhBC.tsx` (T595) đang ghi tên Trum giữ. Phiên này sửa vài dòng nhỏ có ghi mã T910; cần báo Trum.
- `docs/IACC-Cloud-Chi-Tiet-He-Thong.xlsx` chưa làm mới: `tools/xuat_bao_cao_he_thong.py` cần thư mục `Present` cạnh repo, máy này không có.
- Bản điện thoại chưa có báo cáo này, người dùng chỉ yêu cầu web.
- Báo cáo Tổng hợp nhập 4.2.4 (ẩn, không trong `MO_IFASTER`) gần giống báo cáo mới; giữ nguyên.

## Bẫy, quyết định mới

- Không.
