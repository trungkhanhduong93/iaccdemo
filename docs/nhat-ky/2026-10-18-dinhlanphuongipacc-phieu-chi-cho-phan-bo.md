# Phiếu chi chờ phân bổ thông báo tạo thẻ, về lại phiếu gốc, mã CCDC 4 số (T419)

- Ngày: 18/10/2026
- Người: dinhlanphuongipacc, agent: Claude Code
- Trạng thái cuối phiên: Dở dang (phần web xong, còn bản điện thoại)

## Đã làm

Tạo thẻ từ phiếu chi:
- `ChungTuForm.tsx`:
  - Phiếu mới có lý do Chi phí chờ phân bổ thì dưới ô Lý do chi có dòng nhắc "Lưu phiếu xong sẽ tạo Thẻ chi phí phân bổ".
  - Lưu xong hiện hộp thông báo một nút Tiếp tục, thay cho hộp hỏi Đồng ý / Không.
- `LocNangCao.tsx`: `HopXacNhan` nhận `nutHuy={null}` để thành hộp một nút.
- `CatalogScreen.tsx`: thẻ mở từ phiếu chi (`state.tuPhieu._goc`):
  - đóng form, hoặc lưu xong, thì `nav` về phiếu gốc;
  - lưu xong thì `suaPhieu` ghi `_theCp` vào phiếu gốc, phiếu hiện dòng Thẻ chi phí (T168).

Form phiếu chi:
- Nhãn Chi phí nằm cuối ô Lý do, trước mũi tên chọn (`.ly-o`).
- "Tháng hạch toán lãi lỗ" đổi thành "Tháng ghi nhận chi phí". Ô này chỉ hiện khi có dòng lý do thuộc `LY_CHI_PHI`.
- Câu ở Khoá sổ web, điện thoại đổi theo tên mới.
- `BangSua.tsx`: phiếu thu, chi cột Thành tiền rộng 25% bảng.

Thêm hàng nhanh tại form:
- `ChonDanhMuc.tsx`: `MucDm` có `dvt`, hộp thêm hàng trả kèm ĐVT đã chọn.
- Thẻ chi phí, Ghi tăng, phiếu mua dùng ĐVT này; trước đây để trống, hoặc luôn ghi "cái".

Mã CCDC:
- `danhMucStore.ts`: mã CCDC gợi ý CCDC + 4 chữ số.
- Mã mẫu CC001…CC008 đổi thành CCDC0001…CCDC0008 ở `mock.ts`, `so-bo-sung.ts`, `ccdc/index.ts`, `ReportScreen.tsx`, `MCcdc.tsx`.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- `kiem_van --loai giao-dien` cho `ChungTuForm.tsx`, `KhoaSoFree.tsx`, `MKhoaSo.tsx`: không ĐỎ.
- Thử tay ở 1366x768, phiếu chi lý do Chi phí chờ phân bổ:
  - có dòng nhắc; lưu thì hiện hộp một nút; Tiếp tục mở màn Tạo thẻ điền sẵn;
  - lưu thẻ thì về lại phiếu, phiếu hiện "Thẻ chi phí: TPB2610-0012".
- Thử tay, thẻ dư đầu kỳ loại CCDC: thêm CCDC mới chọn ĐVT Bộ, dòng hiện ĐVT Bộ. Mã gợi ý CCDC0009.
- Thử tay, phiếu thu: không có ô Tháng ghi nhận chi phí.
- `xuat_bao_cao_he_thong.py` không chạy được trên máy này (thiếu `Present/tools`).

## Dở dang, việc tiếp theo

- Bản điện thoại: hộp "Tạo thẻ chi phí phân bổ" ở `MLapPhieu.tsx` (khoảng dòng 962 và 1747) chưa đổi thành thông báo một nút. Chờ Trum đồng ý, vì T414 đang sửa form phiếu điện thoại.
- Thẻ tạo bằng nút Ghi tăng ở danh sách thẻ (`GhiTangHangLoat.tsx`) chưa ghi `_theCp` vào phiếu gốc. Chờ dinhlanphuongipacc chốt có làm không.
- T339 (tiến độ kiểm kê nhiều cửa hàng) đang cất ở `git stash` "T339 tien do kiem ke nhieu cua hang (cat tam)".

## Bẫy, quyết định mới

- Không.
