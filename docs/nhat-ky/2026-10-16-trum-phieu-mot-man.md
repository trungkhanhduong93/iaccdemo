# Điện thoại: phiếu nhập liệu một màn (T282)

- Ngày: 16/10/2026
- Người: Trum, agent: Claude Code giao Antigravity (gemini-3.8-flash-high) qua Orca
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/ui/mobile/MLapPhieu.tsx`, `MLapPhieuKho.tsx`: mọi phiếu tiền, hàng, kho thành một màn theo mẫu Trum gửi. Các ô xếp thành nhóm. Bấm dòng mở tấm chọn `MChon`. Thanh đáy có Tổng tiền và nút "Lưu lại". Tiêu đề "Phiếu … mới" khi thêm, "<Loại phiếu> <số>" khi sửa. Nút quay lại 44px giống thanh đầu T281.
- Hàm lưu giữ nguyên như luồng 5 bước cũ: kiểm ngày đầu năm, số chứng từ kế tiếp, sửa phiếu, thêm phiếu, nhật ký. Bỏ nút "Lưu và thêm mới".
- Khối Hạch toán thu gọn ở gói Plus, Pro. Gói Free không có.
- Phiếu chi lý do Chi phí chờ phân bổ (CHI35): lưu xong hỏi tạo thẻ. Đồng ý thì mở form Ghi tăng ở `MCcdc.tsx`, điền sẵn từ phiếu chi.
- `src/styles/app.css`: mục T282 cuối file.
- `tools/kiem_tra.py`: các bài `kiem_tra_lap_phieu_dot_5`, `kiem_tra_dot_12_b`, `kiem_tra_dot_17_a`, `kiem_tra_dot_15_a` đổi sang luồng một màn. Giữ các điều kiện kiểm số liệu và bút toán.

## Đã kiểm

- `npm run typecheck`, `npm run build`: chạy xong, không lỗi.
- `kiem_tra.py --nhanh`: in `Không có lỗi.` Chạy riêng các bài lập phiếu và đăng nhập đợt 8: không lỗi.
- 9 ảnh khung 390x844: phiếu chi Free trống và đã điền, phiếu chi Pro mở Hạch toán, mua hàng 2 dòng, tấm chọn hàng, nhập kho, bán hàng, hộp hỏi tạo thẻ, form Ghi tăng điền sẵn.
- Vòng sửa 1:
  - Dòng Nghiệp vụ lệch bố cục.
  - Phiếu Mua hàng cắt chữ, nút Lưu bị đẩy ra ngoài khung nhìn.
  - Nút quay lại nhỏ.
  - Tiêu đề "Tạo Mua hàng".
  - Đã sửa cả bốn lỗi.
- Coordinator sửa thêm:
  - `butToan.ts` trả về bản gốc. Worker đã ép kiểu `any` và lấy mã gói `PR` làm chế độ kế toán.
  - Bài `dot_12_b` thêm lại 2 điều kiện báo lỗi mà worker đã bỏ.

## Dở dang, việc tiếp theo

- `kiem_tra.py --dien-thoai` chưa chạy trọn: còn bài kiểm dùng lớp cũ của danh sách trước T281. Việc này để T295 làm.

## Bẫy, quyết định mới

- QD65 thêm phần phiếu một màn.
