# Điện thoại, màn Nhập kho theo web T818 (T824)

- Ngày: 13/11/2026
- Người: dinhlanphuongipacc, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/ui/mobile/MChungTu.tsx`: thẻ danh sách Nhập kho có dòng "Người thực hiện: …", lấy `_nhanVien` đã lưu trên phiếu. Phiếu mẫu lấy `nguoiTaoMau(row.so)`.
- `src/ui/mobile/MLapPhieu.tsx`: form lập phiếu Nhập kho có tiêu đề "Lập phiếu nhập kho", ô "Kho nhập", ô "Người thực hiện" chọn từ danh sách nhân viên. Lưu vào `_nhanVien`.
- `src/ui/mobile/MXemPhieu.tsx`: màn xem phiếu Nhập kho có "Kho nhập" và "Người thực hiện". Phiếu mẫu chưa lưu kho thì lấy kho đầu của cửa hàng, như bản in web.
- `src/ui/mobile/MobileShell.tsx`: tiêu đề tách theo tab, Nhập kho và Xuất khác (trước chung "Nhập xuất khác").
- `src/ui/mobile/MNghiepVu.tsx`: nhóm Kho ở menu Nghiệp vụ đổi "KIỂM KÊ" thành "KHO" (người dùng yêu cầu).
- `src/ui/generic/gen.ts`: `nguoiTaoMau` mặc định bỏ lượt rng đầu, như `taoCua` của danh sách. Trước đó, với phiếu mẫu, cột Người thực hiện ở danh sách web có thể khác người ở form và bản in (T818).
- Danh sách điện thoại đọc cùng cấu hình `'5.1.1'` với web (`nguon: 'tay'`), nên đã chỉ còn phiếu thêm tay, không phải sửa thêm.
- Điện thoại chưa có nút in phiếu, nên phần in (nhánh `seedPrefix === '5.1.1'` của `duLieuIn.ts`) không phải sửa.

## Đã kiểm

- `npm run typecheck`: không lỗi.
- `python tools/xuat_bao_cao_he_thong.py` lỗi `No module named 'build_present'` như các phiên trước, chưa làm mới file Excel.
- `npm run build`: chạy xong, không lỗi.
- `python tools/kiem_tra.py --nhanh` (dev chạy cổng 5181, vì cổng 5180 đang có phiên khác): "Không có lỗi."
- Khung 390x844 gói Plus: danh sách 6 phiếu NK, thẻ ghi Người thực hiện. Phiếu NK2610-0260 thẻ và màn xem cùng ghi Lê Quốc Bảo. Form lập có Kho nhập, Người thực hiện.

## Dở dang, việc tiếp theo

- Không.
- `MLapPhieu.tsx`, `MXemPhieu.tsx`, `MNghiepVu.tsx` Trum đang giữ ở T552, T497, T498. Người dùng đồng ý sửa vài dòng riêng màn 5.1.1 và tên nhóm KHO.

## Bẫy, quyết định mới

- Không.
