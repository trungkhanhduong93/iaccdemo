# Tiến trình đồng bộ trên màn, hộp kết quả theo IFASTER-604 (T950, T951, T952)

- Ngày: 27/11/2026
- Người: Trum, agent: Claude Code điều phối, Antigravity code
- Trạng thái cuối phiên: Xong

## Đã làm

- Vẽ artifact thiết kế https://claude.ai/artifact/U7rptTLgHo8WCrX5wqmZFp theo task Plane IFASTER-604, sửa 2 vòng theo góp ý Trum (thanh nằm trên màn, kết quả ở hộp chồng lên).
- Spec `backup/spec-T950-T952.md`.
- T950: `src/ui/HopKetQuaDongBo.tsx` (mới, dựng trên `ThongBao`), `src/ui/giuManDongBo.tsx` (mới, hỏi khi rời màn), `src/ui/HopDongBo.tsx` thanh % chân hộp, Huỷ tiến trình, hộp kết quả; 4 chỗ gọi `ChungTuBanHang.tsx`, `TienIch.tsx` (2 hộp), `DongBoThuChiFabi.tsx`; biểu tượng lỗi trong `ThongBao.tsx`; CSS mục T950 cuối `app.css`.
- T951: `src/ui/ThanhDongBo.tsx` (mới), nút Đồng bộ FABi ở `CatalogScreen.tsx`, nút Đồng bộ lại ở `VoucherScreen.tsx`; CSS mục T951.
- T952: hộp `HopThemCuaHang` trong `DanhMucCuaHang.tsx`.

## Đã kiểm

- `npm run typecheck`: exit 0. `npm run build`: exit 0.
- `python tools/kiem_tra.py --nhanh`: 220 lượt mở màn và các mục T233 tới T675 đúng; dừng ở mục T870 Thẻ kho (`.bc-ban-du-lieu table.tbl` quá 8 giây), lỗi có sẵn ghi ở T933, không do việc này.
- `kiem_van.py` 10 file: 0 ĐỎ (ChungTuBanHang 3 VÀNG ở đường SVG cũ).
- Anti bấm thử bằng Playwright: Xuất bán POS, Tải hoá đơn đầu vào, Thu chi FABi, Danh mục hàng hoá, chứng từ kho, Thêm cửa hàng từ FABi. Hộp POS theo kho ở Tiện ích 11.1 chưa bấm được vì màn không hiện ở tab gói S, Plus, Pro.
- Anti review chéo diff (pre-push-qa).

## Dở dang, việc tiếp theo

- Tạo task Plane mô tả, ảnh chụp, link artifact gửi dev design (làm tiếp trong phiên).
- Chuyển màn bằng code (nút gọi `nav()`) không chặn được khi đang đồng bộ, chỉ chặn link `#/`.

## Bẫy, quyết định mới

- QD120 trong `docs/QUYET-DINH.md`.
