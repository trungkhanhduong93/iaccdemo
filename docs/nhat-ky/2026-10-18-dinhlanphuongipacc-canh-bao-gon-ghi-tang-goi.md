# Cảnh báo khoản chờ gọn vào thanh công cụ (T429); Ghi tăng theo gói, xoá phiếu chi đã tạo thẻ (T436)

- Ngày: 18/10/2026
- Người: dinhlanphuongipacc, agent: Claude Code
- Trạng thái cuối phiên: T429 Xong; T436 Dở dang (phần web xong, còn điện thoại)

## Đã làm

T429:
- `ui/DaiCanhBao.tsx`:
  - `CanhBaoGon`: nhãn vàng chữ ngắn và nút làm ngay, chỉ hiện khi còn việc.
  - `NutCachLam`: nút ⓘ mở Cách làm.
  - `CanhBaoDs.gon`: chữ ngắn của nhãn.
- `CatalogScreen.tsx`, danh sách kiểu chứng từ:
  - nhãn vàng ở cuối hàng 2 bên trái, nút ⓘ cạnh nút thêm;
  - menu thêm hàng loạt kèm số khoản chờ;
  - không vẽ dải cảnh báo riêng một dòng nữa.
- `ccdc/GhiTangHangLoat.tsx`: chữ ngắn "N khoản chờ tạo thẻ · tổng".

T436:
- `ccdc/the-phan-bo.tsx`: kiểu `the` chỉ gói Free (`goi: ['F']`). Gói trên thì nút chính là thêm hàng loạt, chữ Ghi tăng (`hangLoat.nhanChinh`, thêm vào `types.ts`, `ccdc/index.ts`).
- `ChungTuForm.tsx`:
  - `theCuaPhieu` gồm `_theCp` và thẻ mẫu trỏ về phiếu (`theMauTheoGoc` ở `ccdc/index.ts`).
  - Dòng Thẻ chi phí hiện khi phiếu có thẻ, không bắt buộc lý do chờ phân bổ.
  - Xoá phiếu có thẻ thì hỏi "Xoá phiếu chi này sẽ xoá thẻ chi phí đã tạo. Bạn có muốn thực hiện không?", đồng ý thì `xoaTheCuaPhieu` xoá thẻ (`xoaPhieu('dm/8-1-1', …)`).
- `VoucherScreen.tsx`, `LocNangCao.tsx`: xoá hàng loạt ở danh sách cũng hỏi và xoá thẻ.
- `CatalogScreen.tsx`: ẩn dòng xoá theo chứng từ gốc (`useDaXoa('dm/<slug>')`).

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- `kiem_van --loai giao-dien` cho `DaiCanhBao.tsx`, `GhiTangHangLoat.tsx`, `ChungTuForm.tsx`, `LocNangCao.tsx`: không ĐỎ.
- Thử tay 1366x768:
  - Gói Free:
    - nhãn "4 khoản chờ tạo thẻ · 98,7 tr  Ghi tăng bổ sung ›" ở hàng 2;
    - ⓘ mở Cách làm; menu có "Ghi tăng bổ sung (4)".
  - Gói Standard: nút Ghi tăng có số 4, mở màn Ghi tăng thẻ chi phí phân bổ.
  - Phiếu PC2610-0261: xoá thì hỏi đúng câu, đồng ý thì thẻ TPB2610-0011 mất khỏi danh sách thẻ.
  - Phiếu PC2609-0243: hiện "Thẻ chi phí: TPB2609-0009".
- `xuat_bao_cao_he_thong.py` không chạy được trên máy này (thiếu `Present/tools`).

## Dở dang, việc tiếp theo

- T436 điện thoại, chờ Trum xong T424, T425 vì cùng sửa `MXemPhieu.tsx`:
  - `MXemPhieu.tsx` xoá phiếu có thẻ thì hỏi và xoá thẻ;
  - dòng Tham chiếu dùng `theCuaPhieu` để phiếu mẫu cũng hiện thẻ;
  - `MCcdc.tsx` ẩn thẻ đã xoá (`useDaXoa('dm/8-1-1')`).
- Dữ liệu mẫu: phiếu PC2609-0243 "Chi tiền gas tháng 10" trỏ tới thẻ "Ly thuỷ tinh 300ml và tủ mát" (ghép mẫu cũ ở `ccdc/index.ts` `GOC_MAU`), chờ dinhlanphuongipacc chốt có sửa cho khớp không.
- T437 (2 cột Đã PB tới hiện tại, Còn lại hiện tại) làm tiếp, chưa push.

## Bẫy, quyết định mới

- Không.
