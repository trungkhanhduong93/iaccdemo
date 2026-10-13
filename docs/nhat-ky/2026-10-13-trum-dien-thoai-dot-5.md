# Điện thoại đợt 5: lập, sửa phiếu (T178)

- Ngày: 13/10/2026
- Người: Trum, agent: Claude Code điều phối, Anti B (Antigravity WSL) viết code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/ui/mobile/MLapPhieu.tsx` (mới): lập và sửa phiếu theo luồng giỏ hàng IVT (ảnh 06, 07, 08). Bước 1 đầu phiếu dạng thẻ trường (kho, quỹ, đối tượng, thời gian, diễn giải). Bước 2 chọn hàng có lọc nhóm, tìm, tích chọn, thanh "Đã chọn: N". Bước 3 sửa số lượng, đơn giá, VAT, nhân đôi, xoá dòng. Bước 4 xác nhận, thanh đáy hai tầng: dòng Tổng, nút "Lưu và thêm", "Lưu". Bước 5 "Tạo chứng từ thành công", nút Đóng, Xem phiếu. Phiếu thu chi gộp bước 2, 3 thành màn dòng lý do, số tiền.
- Lưu giống hàm `luu` của `ChungTuForm.tsx`: `soKeTiep`, `themPhieu`, `suaPhieu`, `ghiNhatKy`, phiếu mới `tt` theo gói (chưa ghi sổ, gói không ghi sổ thì đã ghi). Sửa phiếu giữ trạng thái ghi sổ, hình thức thanh toán cũ.
- Sửa, sao chép phiếu mẫu chưa có `_dong`: sinh dòng bằng `dongCua(cfg, seed)` cùng hạt giống với `MXemPhieu`, bản máy tính.
- `MChon.tsx`: thêm chế độ `apDung` (nút tròn, Huỷ, Áp dụng, không tay nắm) và `tim` (ô tìm). Chỗ gọi cũ giữ nguyên.
- `MChungTu.tsx`: `/moi`, `?sua=1` mở `MLapPhieu`; kiểm kê, điều chỉnh, sản xuất, điều chuyển vẫn ra `MChiMayTinh`. `MXemPhieu.tsx`: Sao chép mở `/moi` kèm phiếu gốc.
- `ChungTuForm.tsx`: chỉ thêm `export` cho hằng, hàm có sẵn.
- `app.css` mục `Điện thoại đợt 5 (T178)`: ẩn thanh trên chung và thanh dưới khi đang lập phiếu.
- `tools/kiem_tra.py --dien-thoai`: lập phiếu chi, nhập kho, bán hàng ở 390px, thấy phiếu mới đầu danh sách điện thoại và máy tính; sửa phiếu mẫu thu chi, nhập kho, lưu, tổng và trạng thái giữ nguyên.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi. `kiem_tra.py --nhanh`, `--dien-thoai`, lượt đủ 4 gói: Không có lỗi.
- Lập: PC2610-0261 1.000.000 đ, NK2610-0261 724.200 đ, HDB2610-0261 232.197 đ. Sửa giữ nguyên: thu chi 72.000.000 đ Đã ghi sổ, nhập kho 8.024.000 đ Chưa ghi sổ.
- Xem ảnh chụp từng bước ở 390px: một thanh trên, thanh đáy không che, chữ nút một dòng.
- So 25 ảnh bản máy tính trước và sau: không khác ngoài vùng nút có hiệu ứng.
- Chưa thử trên điện thoại thật.

## Dở dang, việc tiếp theo

- Đợt 6: form danh mục; đợt 7: báo cáo; đợt 8: đăng nhập, chọn đơn vị (mục 7 của `docs/ke-hoach-mobile-ivt.md`).
- Phiếu mới đầu tiên của Phiếu chi mang số PC2610-0261, trùng số một phiếu mẫu. Bản máy tính cũng vậy (`soKeTiep` bắt đầu từ 261), chưa sửa.

## Bẫy, quyết định mới

- Anti B không chạy npm, python; Claude chạy kiểm. Vòng đầu Anti B có 4 lỗi bố cục, nhãn (hai thanh trên, thanh đáy ép, nút "Lưu & duyệt" lưu luôn ghi sổ khác bản máy tính), sửa 1 vòng. Claude tự sửa import sai, sửa phiếu mẫu mất dòng, sửa phiếu làm lùi trạng thái ghi sổ.
