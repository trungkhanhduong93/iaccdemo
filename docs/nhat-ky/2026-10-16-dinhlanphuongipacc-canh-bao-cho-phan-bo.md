# Cảnh báo khoản chờ phân bổ chưa tạo thẻ, lưới thẻ gọn (T287)

- Ngày: 16/10/2026
- Người: dinhlanphuongipacc, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `ccdc/GhiTangHangLoat.tsx`: tách `useDongCho` (dòng phiếu chi lý do Chi phí chờ phân bổ chưa tạo thẻ), dùng chung cho form Ghi tăng và `useCanhBaoCho(ky)`. Còn khoản chờ tới hết kỳ số liệu (gồm khoản tồn kỳ trước) thì dải vàng "Còn N khoản…", hết thì gợi ý xám; cả hai có link Cách làm mở bảng 2 bước (link lập phiếu chi lý do chờ phân bổ). Mô tả form: "Danh sách lấy từ các phiếu chi có lý do "Chi phí chờ phân bổ" chưa tạo thẻ."
- `ui/DaiCanhBao.tsx` (mới): dải cảnh báo, gợi ý trên bảng danh mục, link Cách làm mở `Popover`.
- `types.ts`, `CatalogScreen.tsx`: `CatalogCfg.useCanhBao` (hook, CatalogScreen có key theo màn nên gọi có điều kiện vẫn đúng thứ tự); số đếm hiện trên nút thêm hàng loạt. `CongCuDs.tsx`: `NutThemMoiSplit` nhận `so`.
- `ui/Table.tsx`, `types.ts`: `Col.wCung`: cột rộng đúng `w`, không tự giãn theo tiêu đề, tiêu đề xuống dòng (lớp `w-cung`). Chỉ lưới thẻ chi phí dùng.
- `ccdc/the-phan-bo.tsx`: lưới Chi tiết phân bổ cột hẹp (số tháng 84 đến 92, tiền 112, ngày 132), tiêu đề viết tắt PB; đang xem thì ô hiện chữ trơn như bảng phiếu chi (`bang(v, doi, goi, xem)`), ẩn cột Ngừng PB khi không dòng nào ngừng; tab Đã phân bổ cũng chữ trơn khi xem.
- `ccdc/quy-trinh.ts`: tiêu đề sơ đồ Nghiệp vụ chi phí trả trước cần phân bổ.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi. `python tools/kiem_tra.py --nhanh`: Không có lỗi. `kiem_van --loai giao-dien` các file đã sửa: sạch.
- Thử tay ở 1366x607: dải vàng 4 khoản, số 4 trên nút Ghi tăng; Tháng 09/2026 dải xám, không số; tạo 1 thẻ thì còn 3; Cách làm mở đúng, link mở phiếu chi lý do chờ phân bổ; thẻ TPB2608-0003, TPBDK2512-0002 vừa khung, xem chữ trơn, Sửa hiện lại 18 ô nhập.
- Chưa thử: bảng trống của form Ghi tăng (phải tạo hết khoản mẫu). `xuat_bao_cao_he_thong.py` không chạy được trên máy này (thiếu `Present/tools`).

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- Không.
