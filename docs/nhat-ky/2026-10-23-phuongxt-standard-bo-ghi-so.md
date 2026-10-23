# Gói Standard bỏ ghi sổ (T646)

- Ngày: 23/10/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- Gói Standard dùng TT58 vẫn bị coi là có bước ghi sổ (kiểu `so`). Đổi điều kiện ghi sổ thành chỉ chế độ Nợ/Có (`kieuGhiSo(s.cheDo) === 'noco'`).
- `src/ui/generic/ChungTuForm.tsx`: bỏ nhãn Chưa ghi sổ, tab Ghi sổ, nút Ghi sổ, Bỏ ghi sổ; lưu phiếu mới là `ghi`; xoá không đòi bỏ ghi sổ; lịch sử mẫu ghi Lưu chứng từ.
- `src/modules/ban-hang/ChungTuBanHang.tsx`: danh sách, chi tiết Xuất bán POS không còn trạng thái Chưa ghi sổ (tab Ghi sổ Trum đã bỏ ở T640).
- `src/ui/generic/VoucherScreen.tsx`: danh sách chứng từ web bỏ trạng thái ghi sổ.
- Điện thoại: `MXemPhieu`, `MLapPhieu`, `MChungTu`, `MDtThuChiDs`, `MXuatBanPos`, `MLichSu`, `butToan.ts` dùng cùng điều kiện.

## Đã kiểm

- Gộp với T642 của Trum (đổi Free thành Standard): 7 file xung đột, giữ tên gói mới của Trum và phần bỏ ghi sổ, PhuongXT đồng ý cách gộp.
- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- Chưa mở trình duyệt xem bằng mắt.
- Chưa làm mới `docs/IACC-Cloud-Chi-Tiet-He-Thong.xlsx`: `tools/xuat_bao_cao_he_thong.py` báo thiếu module `build_present`, không có trong repo.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- Không.
