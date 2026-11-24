# Lập spec đồng bộ chứng từ gói Plus trên điện thoại theo khuôn Nhập mua (T929, T930, T931)

- Ngày: 24/11/2026
- Người: Trum, agent: Claude Code
- Trạng thái cuối phiên: Dở dang

## Đã làm

- Rà 16 phiếu gói Plus trên điện thoại so với khuôn Nhập mua. Ba nhóm lệch nhiều nhất: phiếu kho, Chứng từ tổng hợp, Hoá đơn điện tử.
- Trum chốt phạm vi đợt này: 5 phiếu kho (Nhập kho, Xuất huỷ, Xuất khác, Xuất/Nhập điều chuyển, Điều chỉnh) và Chứng từ tổng hợp. Kiểm kê, Thu chi, Hoá đơn điện tử để ngoài.
- Nhận việc T929, T930, T931 trong `docs/TIEN-DO.md`, giữ chỗ QD116.
- Viết spec `backup/spec-T929-T931.md` và prompt cho 3 anti `backup/prompt-T929-T931.md`. Hai file chỉ có trên máy Trum, không vào git.

## Đã kiểm

- `npm run typecheck` trên `main` e5523a3: exit 0.
- Chưa sửa code, chưa chạy build, `kiem_tra.py`.

## Dở dang, việc tiếp theo

- Phiên sau: đọc `backup/prompt-T929-T931.md` mục "Cách giao", giao 3 anti theo skill orca-dieu-phoi.
- Trước khi giao: `git pull --rebase`, xem dinhlanphuongipacc có push thêm phần phiếu kho điện thoại không. Commit 354260f (mã T928 của họ) đã đưa form lập Xuất huỷ sang khuôn phiếu mua; T931 làm tiếp theo cờ `khuonMuaGon`.
- Trum báo dinhlanphuongipacc dừng phần phiếu kho điện thoại để khỏi sửa trùng `MXemPhieu.tsx`, `MLapPhieu.tsx`.
- Quyết định Trum đã chốt, ghi vào QD116 khi xong: phiếu không thanh toán có thẻ đầu "Tổng giá trị", không khung thanh toán; danh sách kho hiện tiền; chân màn xem Sửa phiếu + Xoá; Điều chỉnh giữ chặn lập; form Điều chuyển đổi vỏ trong `MLapPhieuKho.tsx`; Chứng từ tổng hợp xem, lập bằng thẻ bút toán.

## Bẫy, quyết định mới

- Giữ chỗ `## QD116` trong `docs/QUYET-DINH.md`, chưa viết nội dung.
