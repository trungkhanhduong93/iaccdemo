# Thẻ chi phí: cột hiện tại (T437), Lịch phân bổ và nút Phân bổ (T438), phiếu chi có thẻ không sửa, xoá thẻ theo khoá sổ (T439)

- Ngày: 19/10/2026
- Người: dinhlanphuongipacc, agent: Claude Code
- Trạng thái cuối phiên: T437, T438 Xong; T439 Dở dang (phần web xong, còn điện thoại)

## Đã làm

T437, `ccdc/the-phan-bo.tsx`: tab Chi tiết phân bổ có thêm 2 cột, dòng Cộng có tổng.
- Đã PB tới hiện tại: cộng các kỳ tới tháng hiện tại theo ngày máy, cộng phần đã phân bổ trước của thẻ dư đầu kỳ (`hienTaiDong`).
- Còn lại hiện tại: số tiền trừ Đã PB tới hiện tại.

T438:
- Tab Đã phân bổ đổi tên Lịch phân bổ. Cột Trạng thái:
  - kỳ ngừng là Ngừng phân bổ;
  - gói Free, Standard luôn Đã phân bổ;
  - gói Plus, Pro: kỳ đã bấm Phân bổ là Đã phân bổ, chưa bấm là Chờ phân bổ.
- Gói Plus, Pro, trạng thái kích hoạt giữ trong phiên (`daKichHoat`, khoá `soThe|yyyymm`): `kichHoatPhanBo`, `boKichHoatPhanBo`, `useBanPhanBo`.
- Danh sách thẻ có nút Phân bổ và Xoá phân bổ (`nutKichHoat` ở `ccdc/index.ts`):
  - chạy theo kỳ đang chọn ở ô Kỳ số liệu, chưa bấm Lọc thì áp luôn;
  - Xoá phân bổ hỏi lại;
  - tháng đã khoá sổ thì cả hai không làm (`kyKhoa`).
- `useHauXuLy` (`useKyNayTheoGoi`): Phân bổ trong kỳ, Đã phân bổ, Còn lại chỉ cộng các kỳ đã kích hoạt. Đã PB tới hiện tại trong thẻ cũng vậy.
- `types.ts`: thêm `useHauXuLy`, `nutKichHoat`. `CatalogScreen.tsx`: vẽ nút, hỏi lại, áp hậu xử lý.

T439:
- `ChungTuForm.tsx`, sửa phiếu:
  - phiếu chi còn thẻ thì bấm Sửa, Ctrl+E hiện hộp "Không sửa được", nút Mở thẻ;
  - lưu phiếu sửa mà còn dòng Chi phí chờ phân bổ nhưng chưa còn thẻ thì báo tạo thẻ như phiếu mới.
- `ChungTuForm.tsx`, khoá sổ:
  - `lyDoKhongXoaTheCuaPhieu`: thẻ thuộc kỳ đã khoá sổ thì không xoá phiếu;
  - `theCuaPhieu` bỏ thẻ đã xoá (`laDaXoa` ở `daXoa.ts`).
- `ccdc/the-phan-bo.tsx`: `lyDoKhongXoaThe`. Thẻ xoá được khi tháng bắt đầu phân bổ đầu tiên còn sau kỳ khoá sổ. `tienIch.chanXoa` thêm vào `truong-dm.ts`.
- `CatalogScreen.tsx`:
  - Tiện ích Xoá, Ctrl+Delete kiểm `chanXoa`;
  - xoá thẻ ghi `dm/<slug>` để phiếu gốc biết;
  - thẻ mở từ phiếu (`state.veGoc`): xoá xong về phiếu ở chế độ sửa (`?sua=1`).
- `VoucherScreen.tsx`: xoá hàng loạt giữ nguyên phiếu có thẻ thuộc kỳ đã khoá sổ.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- `kiem_van --loai giao-dien` các tệp đã sửa: không ĐỎ.
- T437, thẻ TPB2608-0003: Đã PB tới hiện tại 10.025.001, Còn lại hiện tại 40.674.999, khớp danh sách tháng 10.
- T438, thẻ TPB2601-0001 gói Plus:
  - Bấm Phân bổ tháng 10: phân bổ 2.050.000, còn lại 22.550.000, Lịch tháng 10 Đã phân bổ, tháng khác Chờ phân bổ.
  - Bấm Xoá phân bổ: hỏi lại, đồng ý thì về như cũ.
  - Chọn tháng 1/2026 (chưa bấm Lọc): Phân bổ, Xoá phân bổ đều báo kỳ đã khoá sổ.
  - Gói Free: Lịch toàn Đã phân bổ, không có nút.
- T439:
  - PC2610-0261: Sửa bị chặn. Mở thẻ, xoá thẻ thì về phiếu ở chế độ sửa. Lưu thì hiện thông báo tạo thẻ, tạo thẻ TPB2610-0012 thì phiếu hiện thẻ mới.
  - PC2610-0250 (thẻ TPB2601-0001 từ 01/2026): xoá phiếu, xoá thẻ đều báo kỳ đã khoá sổ.
- `xuat_bao_cao_he_thong.py` không chạy được trên máy này (thiếu `Present/tools`).

## Dở dang, việc tiếp theo

- T439 điện thoại, chờ Trum xong T424, T425 (`MXemPhieu.tsx`): chặn sửa phiếu có thẻ, xoá phiếu kiểm khoá sổ của thẻ, tham chiếu thẻ mẫu.
- Màn Khoá sổ 10.1.6 (`tong-hop/CuoiKy.tsx`) gói Standard trở lên mới là màn mẫu, Mở khoá kỳ không đổi `KHOA_SO_DEN`. Nên nối vào `datKhoaSoDen` như `KhoaSoFree.tsx` để thử được luật khoá sổ ở gói Plus, chờ dinhlanphuongipacc đồng ý làm thành việc mới.
- Trạng thái Đã phân bổ (T438) chỉ giữ trong phiên, tải lại trang là mất.
- Bản điện thoại chưa có Lịch phân bổ theo trạng thái, nút Phân bổ, 2 cột hiện tại.

## Bẫy, quyết định mới

- Không.
