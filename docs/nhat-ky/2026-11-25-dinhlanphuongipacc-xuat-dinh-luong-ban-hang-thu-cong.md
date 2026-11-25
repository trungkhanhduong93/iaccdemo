# Xuất định lượng cho chứng từ bán hàng lập thủ công (T936)

- Ngày: 25/11/2026
- Người: dinhlanphuongipacc, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/modules/ban-hang/xdl-ban-tay.ts` (mới): `taoXdlBanTay` ghi số phiếu `_xdlSo` vào chứng từ, `canXdlBanTay` chọn chứng từ cần xuất định lượng. File nhỏ để form gọi mà không vòng import.
- `src/ui/generic/ChungTuForm.tsx`: prop `xuatDinhLuong`, công tắc Xuất định lượng cạnh Xuất HĐĐT (mặc định bật khi thêm mới), lưu xong tạo phiếu, số phiếu ở Tham chiếu.
- `src/modules/ban-hang/ChungTuBanHang.tsx`: nút Tạo xuất kho định lượng ở chi tiết, dữ liệu mẫu cứ 3 chứng từ tay có 1 đã có phiếu, lọc Trạng thái xuất HĐĐT, Trạng thái xuất kho định lượng ở danh sách.
- `src/modules/kho/xuat-dinh-luong.ts`: tách `monXdl`, `useDsPhieuXdl` thêm phiếu từ chứng từ lập tay (nguồn Xuất bán hàng, gói Plus); chứng từ chưa có phiếu chỉ tính vào món thiếu (`chuaTao`), xuất bổ sung tạo phiếu cho chúng.
- `src/modules/kho/XuatDinhLuong.tsx`: ẩn phiếu `chuaTao` khỏi danh sách, chi tiết hiện Số chứng từ bán hàng.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_van.py` 5 file đã sửa: 0 ĐỎ.
- `python tools/kiem_tra.py --nhanh`: mở 221 màn không lỗi, các mục trước T870/T871 đúng; dừng ở T870/T871 (hỏng sẵn trên main, đã ghi ở nhật ký Trum 25/11), nên các mục sau đó chưa chạy.
- Thử tay trên giao diện gói Plus: lưu chứng từ mới ra phiếu, nút Tạo xuất kho định lượng, số phiếu ở Tham chiếu, danh sách Xuất kho định lượng. Hai ô lọc mới đã hiện, chưa thử bấm lọc.

## Dở dang, việc tiếp theo

- Không. Gợi ý: T852 (Xuất bán POS hiện tham chiếu ngược phiếu xuất kho định lượng) chưa làm.

## Bẫy, quyết định mới

- Không ghi vào `docs/BAY.md`, `docs/QUYET-DINH.md`.
