# Khai báo hoá đơn điện tử ở Cấu hình kế toán (T784)

- Ngày: 10/11/2026
- Người: dinhlanphuongipacc, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/modules/ban-hang/hddt.tsx`: `NCC_HDDT` chỉ còn iPOS Invoice. `CauHinhHddt` mới: `tenKhachLe` (mặc định `KHACH_LE_HD` "Bán cho người tiêu dùng"), `mau` chung (gợi ý theo `mauSoHd`), `kyHieu` chung, `giamThue`, `cuaHang` (mẫu số, ký hiệu từng cửa hàng, để trống thì theo chung). Bỏ ô `ncc` và `tenLoaiHd`.
- `cauHinhHddt` đọc được bản lưu cũ (kyHieu là bảng theo cửa hàng thì bỏ, dùng mặc định). Dữ liệu mẫu: Lê Lợi C26TAA, Nguyễn Trãi C26MAB (máy tính tiền), Thảo Điền để trống.
- Hàm mới `kyHieuXuat(h, cnId)` trả mẫu số + ký hiệu, vd 1C26TAA; `laMayTinhTien` nhận chữ M ở vị trí thứ 4. Popup phát hành một chứng từ, hàng loạt dùng hàm này, mẫu số lấy theo khai báo thay vì cố định theo phương pháp thuế.
- `TheCauHinhHddt` chia 3 khối: Kết nối iPOS Invoice, Thông tin mặc định (người mua, mẫu số chung, ký hiệu chung, công tắc giảm thuế), Mẫu số, ký hiệu theo cửa hàng (cột Đang dùng khi xuất, nhãn Máy tính tiền). Ghi chú ký hiệu lấy theo thông báo phát hành trên phần mềm hoá đơn điện tử.
- `src/modules/he-thong/HeThong.tsx`: truyền `nq` là nghị quyết đang bật ở thẻ Giảm thuế GTGT; không có thì công tắc giảm thuế mờ.
- `src/styles/app.css`: mục mới cuối file, tiêu đề có T784.

## Đã kiểm

- `npm run typecheck`: không lỗi.
- `npm run build`: chạy xong, không lỗi.
- `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- `python tools/kiem_van.py` cho `hddt.tsx`, `HeThong.tsx`: sạch.
- Mở màn Cấu hình kế toán gói Plus, đơn vị tính GTGT theo % doanh thu: thẻ hiện đủ 3 khối, Thảo Điền ghi "Theo khai báo chung (2C26TAA)", Nguyễn Trãi có nhãn Máy tính tiền.

## Dở dang, việc tiếp theo

- Không. Việc tiếp là T785 (form chứng từ bán hàng lập tay), dùng `KHACH_LE_HD`, `cauHinhHddt(s).tenKhachLe`, `kyHieuXuat` từ `hddt.tsx`.
- Đơn vị khấu trừ không có thẻ Giảm thuế GTGT nên công tắc giảm thuế trên thẻ Hoá đơn điện tử luôn mờ. Cần dinhlanphuongipacc hoặc Trum chốt: đơn vị khấu trừ có áp dụng giảm thuế NQ 204/2025/QH15 trên hoá đơn không, nếu có thì lấy nghị quyết từ đâu.
- Cờ `giamThue` mới lưu, chưa nối vào tính tiền hoá đơn (làm cùng T785).
- `tools/xuat_bao_cao_he_thong.py` vẫn lỗi thiếu module `build_present` trên máy này, chưa làm mới `docs/IACC-Cloud-Chi-Tiet-He-Thong.xlsx`.

## Bẫy, quyết định mới

- Không. Làm theo QD106.
