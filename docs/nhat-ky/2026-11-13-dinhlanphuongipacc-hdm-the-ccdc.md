# Hoá đơn mua hàng tạo thẻ mặc định loại CCDC, khoản chờ tạo thẻ gồm hoá đơn mua (T822)

- Ngày: 13/11/2026
- Người: dinhlanphuongipacc, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/ui/generic/BangSua.tsx`: Hoá đơn mua hàng (`cfg.khongKho`) có thêm tab CCDC ở ô Mã hàng, lấy từ `CCDC_HANG` và hàng thêm tại form.
- `src/ui/generic/danhMucStore.ts`: hàm `laMaCcdc(ma)`, nhận mã thuộc danh mục CCDC mẫu hoặc hàng thêm trong phiên có loại Khác (Công cụ dụng cụ).
- `src/ui/generic/ChungTuForm.tsx` (khúc tạo thẻ sau khi lưu): mọi dòng chờ phân bổ đều là hàng CCDC thì thẻ mở ra mặc định loại Công cụ dụng cụ, mang Mã, Tên, ĐVT, Số lượng (`_maTay: true` để `capMa` giữ mã). Có dòng không phải CCDC thì vẫn mặc định Chi phí trả trước như cũ. Người dùng đổi được loại thẻ; đổi loại thì mã sinh lại theo loại mới (logic `capMa` có sẵn).
- `src/modules/ccdc/GhiTangHangLoat.tsx`: khoản chờ tạo thẻ (Ghi tăng bổ sung, cảnh báo trên danh sách thẻ, kiểm tra khoá sổ) gồm cả hoá đơn mua hàng (mẫu, lập thêm, đã sửa, bỏ đã xoá) có lý do tích Chi phí phân bổ nhiều kỳ, chỉ ở gói có màn 4.1.2 (Plus, Pro). Dòng hàng CCDC mặc định loại Công cụ dụng cụ, điền sẵn Mã, Tên, ĐVT, Số lượng. Khoá dòng đổi thành `<màn>|<id>-<i>`.
- `src/modules/mua-hang/hoa-don-mua.ts`: hoá đơn mẫu "Mua bộ nồi inox, dao thớt cho bếp" gắn mã `CCDC0001`, `CCDC0005` (tên, ĐVT theo danh mục) để thấy mặc định CCDC.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_tra.py --nhanh`: "Không có lỗi." (chạy chung với phần sửa đang dở của T823 trong cùng thư mục).
- Trình duyệt gói Pro 1440x900: Ghi tăng bổ sung hiện các dòng HDM, dòng CCDC lên loại Công cụ dụng cụ đủ mã, tên, ĐVT, đơn giá. Sửa rồi lưu HDM2610-0253, bấm Tiếp tục: form thẻ loại Công cụ dụng cụ, 2 dòng CCDC0001, CCDC0005 đủ tên, ĐVT Bộ, số lượng 1, đơn giá.
- Chưa bấm đổi loại thẻ trên giao diện (ô chọn tuỳ biến khó bấm bằng công cụ); logic đổi loại là `capMa` có sẵn, không sửa.

## Dở dang, việc tiếp theo

- Không.
- Hàng CCDC thêm tại form (không có trong `CCDC_HANG`): đổi thẻ sang loại khác thì mã CCDC vẫn giữ, vì `capMa` chỉ sinh lại mã có trong `CCDC_HANG`. Muốn sinh lại thì đổi điều kiện trong `capMa` (`ccdc/the-phan-bo.tsx`) sang `laMaCcdc`.
- Bản điện thoại (`MCcdc.tsx`) chưa nhận loại CCDC từ hoá đơn mua; người dùng chỉ yêu cầu web.
- `python tools/xuat_bao_cao_he_thong.py` chưa chạy được (thiếu `build_present`, như các phiên trước).
- Commit chỉ nằm trên máy, chưa push: người dùng dặn khi nào bảo mới push.

## Bẫy, quyết định mới

- Không.
