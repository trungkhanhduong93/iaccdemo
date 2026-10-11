# Sản xuất ở Kho theo iPOS Inventory (T152)

- Ngày: 11/10/2026
- Người: Trum, agent: Claude Code điều phối, worker Claude viết code
- Trạng thái cuối phiên: Xong

## Đã làm

- Khảo sát ivtstag.ipos.vn, phân hệ Sản xuất (chỉ đọc): cột, ô lọc, chip, form của 4 màn phiếu và 2 màn công thức.
- Kho có 4 tab phiếu: Xuất sơ chế (5.1.6), Nhập sơ chế (5.1.6-2), Xuất chế biến (5.1.3), Nhập chế biến (5.1.3-2). Chip Chờ nhập, Đã nhập, Đã huỷ; dải giải thích Sơ chế là tách, Chế biến là gộp.
- Form dùng `ChungTuForm.tsx` (nhánh `sanXuat`), bảng dòng riêng `kho/BangSanXuat.tsx`: Kế hoạch, Thực tế hoặc Thực nhận, NVL đầu vào, đầu ra. Không có số lô (Trum chốt). Phiếu nhập bắt buộc tham chiếu phiếu xuất đang chờ nhập; lưu thì phiếu xuất chuyển Đã nhập. Hạch toán Nợ 154/Có 152 khi xuất, Nợ 152/Có 154 khi nhập.
- Công thức chế biến (9.1.3), công thức sơ chế (5.1.5) làm lại ở `kho/CongThuc.tsx`: danh sách gộp ô theo NVL, công tắc trạng thái, form chi tiết, Sao chép. Dữ liệu ở `kho/san-xuat.ts`, hàng bán thành phẩm `HANG_SX` ở `data/mock.ts`.
- Sơ đồ quy trình kho trỏ 4 tab, 2 công thức.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_tra.py --nhanh`: `Không có lỗi.`
- Xem ảnh form xuất chế biến (kéo NVL theo công thức), form nhập sơ chế (chọn tham chiếu), danh sách công thức chế biến: đúng bố cục.

## Dở dang, việc tiếp theo

- Form phiếu chưa có nút Huỷ phiếu; trạng thái Đã huỷ mới có ở phiếu mẫu.
- Công thức sửa trong phiên chưa tác động việc kéo NVL của phiếu.
- Ngoài phạm vi: Định mức biến thiên, Mẫu sơ chế, Mẫu chế biến, Báo cáo theo dõi, số lô.

## Bẫy, quyết định mới

- `docs/QUYET-DINH.md`: QD50.
