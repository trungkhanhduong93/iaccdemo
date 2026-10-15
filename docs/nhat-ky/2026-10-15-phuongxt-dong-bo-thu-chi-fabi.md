# Đồng bộ thu chi tự động từ FABi, map PTTT ở Quỹ tiền (T264)

- Ngày: 15/10/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

PhuongXT chốt: mọi gói; bật, tắt theo từng chi nhánh; map PTTT theo từng cửa hàng như màn Thêm quỹ tiền của FABi; phiếu đồng bộ hiện trong danh sách Thu chi. Sau đó gom công tắc về Danh mục chi nhánh cạnh cách tính chi phí NVL, và cho chọn cấu hình ngay lúc thêm chi nhánh từ FABi.

- `src/modules/tien/dong-bo-fabi.ts` (mới): map 'mã chi nhánh|mã PTTT' → mã quỹ theo đơn vị (`mapPttt` trong phiên), mặc định tiền mặt về quỹ tiền mặt chi nhánh, chuyển khoản, thẻ về Vietcombank, App giao đồ ăn chưa map. Công tắc từng chi nhánh (`dongBoThuChi`, chưa đặt là bật). `phieuThuChiFabi` sinh phiếu FABi mẫu tuần đầu tháng 10 của chi nhánh đang bật: PTTT đã map thành phiếu thu, chi tiền mặt hoặc thu, chi ngân hàng theo loại quỹ (số FBTC…, nguồn FABi); chưa map thì vào danh sách chờ.
- `src/app/session.tsx`: thêm `dongBoThuChi`, `mapPttt`.
- Danh mục Quỹ tiền: khối "Phương thức thanh toán từ FABi" (`danh-muc/QuyPttt.tsx`, khối `ve` trong `truong-dm.ts`) theo cửa hàng của chi nhánh áp dụng; một PTTT của một cửa hàng chỉ thuộc một quỹ, đã gán quỹ khác thì hiện tên quỹ, khoá. Cột "PTTT từ FABi". Lưu map trong `phien.luu` cùng số dư ban đầu gói Free.
- Danh mục chi nhánh: cột công tắc "Đồng bộ thu chi FABi" cạnh Cách tính chi phí NVL; dòng nhắc phiếu chờ vì PTTT chưa map. Hộp Thêm chi nhánh từ FABi có bảng "Cấu hình chi nhánh lên sổ" (cách tính NVL gói Free, đồng bộ thu chi), lên sổ lưu luôn; `onLenSo` thêm tham số `caiDat`, `MChiNhanh.tsx` (điện thoại) gộp theo.
- Danh sách Thu chi: `phieuThem` nhận phiên (`types.ts`), `VoucherScreen.tsx` (`useDongChungTu`) truyền phiên, tính lại khi đổi đơn vị, công tắc, map.
- Lịch sử thu chi trang chủ: nhãn nguồn từng giao dịch (tiền bán hàng là FABi, còn lại Thủ công, suy từ diễn giải vì sổ quỹ chưa có nguồn), file Excel thêm cột Nguồn.
- `app.css`: mục T264 cuối file.

## Đã kiểm

- `npm run typecheck`: không lỗi. `npm run build`: chạy xong.
- `python tools/kiem_tra.py --nhanh`: `Không có lỗi.` `kiem_van.py` các file sửa: không ĐỎ.
- Bản dev gói Free: Thu chi chi nhánh Lê Lợi hiện 4 phiếu FABi; map App giao đồ ăn Thảo Điền vào Techcombank thì cột PTTT cập nhật, phiếu chờ vào sổ; tắt Thảo Điền ở Danh mục chi nhánh thì số phiếu và dòng nhắc chờ đổi theo; thêm 4 chi nhánh từ FABi với cấu hình khác nhau, bảng chi nhánh hiện đúng. Đã xoá dữ liệu thử, trả phiên về Phố Mây gói Plus.
- Chưa làm mới `docs/IACC-Cloud-Chi-Tiet-He-Thong.xlsx`: script cần file Excel nguồn chỉ có trên máy Trum.

## Dở dang, việc tiếp theo

- Phiếu FABi đồng bộ chưa vào Sổ quỹ tiền mặt, Sổ ngân hàng, Lịch sử thu chi và tồn quỹ trang chủ (đưa vào sẽ đổi số dư); chờ PhuongXT quyết.
- Danh mục Phương thức thanh toán gói Plus, Pro vẫn còn cột Quỹ tiền (map chiều PTTT → quỹ, dùng cho bán hàng); hai chiều map chưa đồng nhất.

## Bẫy, quyết định mới

- Bẫy nhỏ: sửa nhiều file liền nhau, Vite đôi khi giữ module cũ hoặc báo "Cannot access 'home' before initialization" khi nạp nóng; khởi động lại `npm run dev` là hết. Không ghi BAY.md vì mất dưới 15 phút.
