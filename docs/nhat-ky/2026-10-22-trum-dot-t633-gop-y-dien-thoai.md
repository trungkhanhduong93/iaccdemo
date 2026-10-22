# Đợt góp ý điện thoại, Xuất bán POS web, sổ quỹ (T633 đến T639, T552)

- Ngày: 22/10/2026
- Người: Trum, agent: Claude Code điều phối, 2 Antigravity Windows và 1 Antigravity WSL viết code
- Trạng thái cuối phiên: Xong, riêng T552 Dở dang

## Đã làm

- T633: phiếu chi điện thoại (`MDtThuChiLap.tsx`) chọn lý do Chi phí chờ phân bổ, lưu xong bật bảng Tạo thẻ chi phí phân bổ. Bấm Tiếp tục thì mở màn tạo thẻ có sẵn tên, số tiền, ngày, chứng từ gốc. Cách làm giống `MLapPhieu.tsx`.
- T634: Thao tác nhanh trang chủ điện thoại, bấm Thu tiền hoặc Chi tiền thì mở sheet đáy chọn tiền mặt hay ngân hàng. Trước đây là menu nổi (T611). Chỉ sửa `MChonLoaiTien.tsx`, áp cho mọi gói.
- T635: Báo cáo theo dõi ở Mua hàng đổi Sổ chi tiết mua hàng (4.2.1) thành Bảng kê chi tiết mua hàng (4.2.7), cả điện thoại (`MBaoCaoTheoDoi.tsx`) và web (`mua-hang/quy-trinh.ts`).
- T636: trang chủ Free điện thoại, thanh "chưa khoá sổ" bỏ lề ngang 16px, giờ rộng bằng các thẻ. Sửa ở mục T636 cuối `app.css`.
- T637: chi tiết Xuất bán POS trên web giữ 3 nhóm có tiêu đề, mỗi ô đổi thành nhãn trái, ô giá trị phải, Ghi chú nằm một hàng dưới cùng. Bỏ nút Đóng (Esc), Esc và nút X vẫn đóng. Dải tính tổng tiền ở chân trang giữ nguyên. Phương thức thanh toán vẫn chỉ hiện ở hoá đơn lẻ (T116).
- T638: Lịch sử thu chi, Sổ quỹ tiền mặt, Sổ tiền gửi ngân hàng: bỏ màu gắn cứng. Tồn đầu, tồn cuối màu đen, tổng thu xanh lá, tổng chi đỏ. Dòng chi tiết bỏ biểu tượng, thu xanh lá, chi đỏ, chuyển quỹ màu đen.
- T639: lập phiếu mua mới trên điện thoại bỏ ô "Phiếu nhập", hàng tab chỉ hiện khi sửa phiếu. Bỏ khối chiết khấu và thuế GTGT áp chung ở đầu danh sách hàng.
- T552: `MThanhCong.tsx` thêm `kieu: 'luu' | 'xoa'`. Kiểu xoá: vòng trắng viền xanh, biểu tượng thùng rác, giá trị gạch ngang, nút Về danh sách. Màn lưu thành công mới đã gắn cho phiếu thu chi tiền mặt, ngân hàng, kiểm kê, phiếu kho, phiếu bán.
- Mẫu đã duyệt: https://claude.ai/artifact/DXPVAEAunDnZeedfv5eb4P. Spec chi tiết: `backup/spec-T633.md` (máy Trum).

## Đã kiểm

- `npm run typecheck`: không lỗi.
- `npm run build`: xong, chỉ có cảnh báo chunk lớn như cũ.
- `python tools/kiem_tra.py --nhanh`: "Không có lỗi."
- Chưa mở điện thoại để xem bằng mắt các màn mới.

## Dở dang, việc tiếp theo

- T552: chưa gắn màn xoá thành công vào nút xoá phiếu. Nút xoá nằm ở `MXemPhieu.tsx`, file này dinhlanphuongipacc đang giữ (T436). T436 xong thì gọi `<MThanhCong kieu="xoa" ... onVeDanhSach onLapMoi />` sau khi xoá.
- T552: chưa gắn cho thẻ chi phí phân bổ. File `MCcdc.tsx` đang do T436 và T583 giữ.
- Chưa chốt nghiệp vụ: xoá phiếu mua có xoá luôn phiếu chi tự sinh hay không. Màn xoá phiếu mua tạm ghi "Tồn kho và công nợ nhà cung cấp tính lại."

## Bẫy, quyết định mới

- Không.
