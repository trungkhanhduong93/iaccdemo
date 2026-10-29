# Đổi số phiếu mẫu Tiền nhà 6 tháng (T682)

- Ngày: 29/10/2026
- Người: Trum, agent: Claude Code (máy mây)
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/modules/tien/index.ts:16`: phiếu chi mẫu `chi-cpb` "Tiền nhà 6 tháng" đổi số PC2610-0261 thành PC2610-0260. Số 0261 là số phiếu chi mới đầu tiên mà `soKeTiep` cấp nên danh sách hiện hai phiếu cùng số.
- `src/modules/ccdc/index.ts:16`: chứng từ gốc của thẻ TPB2610-0011 trỏ theo số mới. Dòng 36 sửa chú thích cho khớp.
- Không sửa `soKeTiep` (`src/ui/generic/daXoa.ts`), không sửa `MCcdc.tsx` theo lời Trum.
- Chọn 0260 vì: `grep` cả `src` không có PC2610-0260; danh sách Thu chi (phiếu thêm cộng phiếu sinh theo seed `2.1.1`) chỉ dùng PC2610-0001 tới 0012, 0247, 0250, 0253, 0255, 0259, 0261; phiếu FABi dùng tiền tố FBTC; `soKeTiep` cấp từ 0261 trở lên. Số 0260 nằm ngay sau PC2610-0259 cùng ngày 07/10.
- Ghi việc mới T683: `src/ui/mobile/MCcdc.tsx:40` (thẻ TPB2610-0011 trên điện thoại) còn ghi PC2610-0261, chờ T436 nhả file.

## Đã kiểm

- Đếm số phiếu thật của danh sách Thu chi bằng script Vite SSR (nạp `src/app/registry.ts`, gọi `phieuThem` và `gopLoai` của màn 2.1.1): trước khi sửa có PC2610-0261, sau khi sửa có PC2610-0260, không số nào trùng.
- `npm run typecheck`: không lỗi.
- `npm run build`: chạy xong, không lỗi.
- `python tools/kiem_tra.py --nhanh`: in `Không có lỗi.` Máy mây không có Chrome nên cài `playwright` cho Python, nạp `sitecustomize.py` (vá `BrowserType.launch` bỏ `channel`, dùng `/opt/pw-browsers/chromium`) qua `PYTHONPATH`. Không chụp ảnh.
- `python tools/kiem_van.py` cho `CHANGELOG.md`, `docs/TIEN-DO.md`, `docs/luu-tru/TIEN-DO-xong.md`, nhật ký này: 0 ĐỎ. Các mục VÀNG là dòng cũ, không thuộc phần sửa.
- `python tools/xuat_bao_cao_he_thong.py`: không chạy được trên máy mây, báo `ModuleNotFoundError: No module named 'build_present'`. Script đọc `build_present` ở thư mục `Present/tools` nằm cạnh repo, máy mây không có thư mục này. `docs/IACC-Cloud-Chi-Tiet-He-Thong.xlsx` chưa làm mới, lần chạy sau trên máy có `Present` sẽ cập nhật cả dòng T682, T683.

## Dở dang, việc tiếp theo

- Không. Việc nối tiếp là T683 (đổi số trong `MCcdc.tsx`), làm sau T436.

## Bẫy, quyết định mới

- Không.
