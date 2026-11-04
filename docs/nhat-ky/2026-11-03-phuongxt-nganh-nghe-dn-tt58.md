# Ngành nghề tính thuế doanh nghiệp TT58 tách riêng hộ kinh doanh (T720)

- Ngày: 03/11/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- Lưu bảng ngành nghề TT58 của PhuongXT vào `docs/NGANH-NGHE-THUE-TT58.xlsx`.
- File mới `src/modules/danh-muc/nganh-nghe-dn.ts`: 6 nhóm, 27 ngành nghề doanh nghiệp, mã tiền tố `DN`, % GTGT và % TNDN theo bảng. Danh sách hộ kinh doanh `nganh-nghe.ts` giữ nguyên.
- `truong-dm.ts`: form hàng hoá tách 2 khối Thông tin thuế, TT152 dùng `nganhNghe`, TT58 dùng `nganhNgheDn`, `nhomNganhDn`, `thueGtgtDn`, `thueTndn`. Thêm mới mặc định Dịch vụ ăn uống ở cả hai. Chọn nhóm hàng điền ngành nghề riêng từng ô. Form nhóm hàng có ô Ngành nghề cho TT58.
- `data.ts`: nhóm hàng mẫu có thêm `nganhNgheDn`. `danh-muc/index.ts`: hàng hoá mẫu điền cả ngành nghề doanh nghiệp; danh sách TT58 hiện cột Thuế GTGT, Thuế TNDN.
- `bao-cao/tt58.ts`: `NHOM_NGANH_TT58` lấy từ bảng doanh nghiệp. Sổ S1, S2a, S3a-DNSN tính và ghi tỷ lệ theo bảng: ăn uống TNDN 2%, bán lẻ 1% (trước ghi nhầm 1,5%, 0,5% của TNCN hộ kinh doanh).
- Ẩn theo phương pháp thuế (PhuongXT góp ý): ô form có thêm `pp` (`gtgt`, `tndn`), hàm `hopPp` trong `truong-dm.ts`. `CatalogScreen.tsx`, `TuyChonCotDM.tsx` lọc theo `hopPp`. Hàm `cols` của danh mục nhận thêm `s` (phương pháp thuế) ở `types.ts`, `CatalogScreen.tsx`, `MDanhMuc.tsx`. GTGT khấu trừ thì ẩn cột, ô Thuế GTGT; TNDN trên thu nhập thì ẩn cột, ô Thuế TNDN; ô Ngành nghề luôn hiện vì vẫn cần tạm tính TNDN theo tỷ lệ nộp hàng quý (PhuongXT góp ý lần 2).
- GTGT khấu trừ (PhuongXT góp ý lần 3, 04/11): hiện lại cột Thuế GTGT ở danh sách hàng hoá nhưng lấy ô `ts` người dùng tự chọn, không theo ngành nghề. `truong-dm.ts` thêm `pp: 'gtgtKt'` (chỉ hiện khi khấu trừ) và ô Thuế suất GTGT (%) trong khối Thông tin thuế TT58.
- `thue/ToKhaiGTGT.tsx`: bảng 04/GTGT lấy tỷ lệ theo nhóm từ bảng doanh nghiệp; điện thoại dùng chung số liệu.

## Đã kiểm

- `npm run typecheck`: không lỗi.
- `npm run build`: chạy xong, không lỗi.
- `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- Trình duyệt, gói Plus TT58, đổi 4 tổ hợp phương pháp thuế: cột danh sách hàng hoá và ô form Thêm mới ẩn hiện đúng.
- `python tools/xuat_bao_cao_he_thong.py` không chạy được trên máy này: thiếu file Excel tính năng "Dự kiến tính năng IACC Cloud.xlsx", nên chưa làm mới `docs/IACC-Cloud-Chi-Tiet-He-Thong.xlsx`.

## Dở dang, việc tiếp theo

- Không.
- Chưa có màn tờ khai TNDN theo tỷ lệ cho doanh nghiệp; khi làm thì lấy tỷ lệ từ `nganh-nghe-dn.ts`.
- `giam-thue.ts` vẫn lấy % GTGT ăn uống từ danh sách hộ kinh doanh; hai bảng cùng 3% nên chưa sai.

## Bẫy, quyết định mới

- `docs/QUYET-DINH.md`: QD93.
