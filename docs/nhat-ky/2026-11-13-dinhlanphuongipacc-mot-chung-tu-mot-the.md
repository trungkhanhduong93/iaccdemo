# Ghi tăng bổ sung: mỗi chứng từ một thẻ nhiều dòng (T828)

- Ngày: 13/11/2026
- Người: dinhlanphuongipacc, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- dinhlanphuongipacc chốt: web và điện thoại đều tạo mỗi chứng từ gốc một thẻ, mỗi dòng chứng từ một mục chi tiết của thẻ (kể cả phiếu chi nhiều dòng, không riêng hoá đơn mua hàng như T827).
- `src/modules/ccdc/GhiTangHangLoat.tsx`: xuất `theCuaDong` (khoá thẻ: `_goc` của chứng từ, không có thì số chứng từ). Form Ghi tăng bổ sung web: các dòng cùng chứng từ chung một số thẻ; Loại thẻ mặc định theo cả chứng từ (mọi dòng là CCDC thì CCDC); đổi loại ở một dòng thì đổi cả các dòng cùng chứng từ; nút "Tạo (n thẻ)" và thông báo đếm theo thẻ; `_theCp` của chứng từ không lặp số thẻ. Dòng phụ đầu form thêm câu "Mỗi chứng từ một thẻ, mỗi dòng một mục chi tiết của thẻ."
- `src/ui/mobile/MTaoTheBoSung.tsx`: gom theo `theCuaDong` cho mọi chứng từ; chứng từ nhiều dòng không phải hoá đơn ghi "ngày · n dòng".
- Bản mẫu artifact: sửa ghi chú cho đúng quy tắc mới.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi. `python tools/kiem_tra.py --nhanh`: Không có lỗi. `kiem_van.py` 2 file: sạch.
- Web gói Plus, `ccdc/8-1-1?moi=hang-loat`: 10 dòng ra 6 thẻ; UNC2610-0245 hai dòng chung TPB2610-0013, HDM2610-0253 hai dòng chung TPB2610-0015; đổi loại thẻ dòng Tiền thuê kho lạnh sang Công cụ dụng cụ thì dòng Phí bảo trì cùng chứng từ đổi theo. Chưa bấm Tạo trên web.
- Điện thoại 375x812: màn Tạo thẻ bổ sung "Đã chọn 10 khoản · 6 thẻ", UNC2610-0245 một thẻ 2 dòng.

## Dở dang, việc tiếp theo

- Không.
- Web Ghi tăng bổ sung chỉ đánh dấu khoản đã tạo, ghi số thẻ vào chứng từ gốc, chưa thêm thẻ vào danh sách thẻ web (có từ trước T828).
- Nên báo Trum quy tắc mới (mỗi chứng từ một thẻ) để ghi vào `docs/QUYET-DINH.md` nếu Trum đồng ý.
- Chưa lấy được 2 commit T818 trên GitHub (xung đột `docs/TIEN-DO.md`, xem nhật ký T827).
- Commit chỉ nằm trên máy, chưa push: người dùng dặn khi nào bảo mới push.

## Bẫy, quyết định mới

- Không.
