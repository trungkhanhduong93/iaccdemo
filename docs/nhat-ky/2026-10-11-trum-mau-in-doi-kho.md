# Mẫu in tự cân đối khi đổi khổ (T134)

- Ngày: 11/10/2026
- Người: Trum, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- Nguyên nhân: cột bảng phiếu in đặt độ rộng bằng mm cố định (`<col style="width: Xmm">`). Mẫu ngang chuyển sang dọc thì bảng tràn mép 47–147 mm.
- `mau-in.ts`: thêm `rongVungIn(trang)` (bề rộng vùng in, mm) và `doiTrangMau(m, trang)`. Đổi khổ, hướng, lề thì độ rộng cột co giãn theo vùng in mới, giữ tỷ lệ; phần lẻ 0,5 mm chia lại để đổi qua lại nhiều lần tổng không hao.
- `ThietKeMauIn.tsx`: ô Khổ trên thanh trên và nhóm Khổ giấy và lề gọi `doiTrangMau`; bỏ hàm `vungIn` riêng, dùng `rongVungIn`.
- `InChungTu.tsx`, `veMauIn`: cột chia theo phần trăm tổng độ rộng, bảng luôn vừa vùng in (cả mẫu riêng cũ đã lưu). Khổ hẹp hơn khổ của mẫu chuẩn thì chữ bảng co theo, thấp nhất 75%, lề ô hẹp lại (lớp `chat`). Vùng in dưới 150 mm (A5 dọc) thì thông tin in một cột. Ô số xuống dòng sau dấu chấm phân nhóm khi không đủ chỗ, không đè ô bên.
- `InChungTu.tsx`, hộp Sửa nhanh (gói Free, Standard): đổi A4/A5 cũng gọi `doiTrangMau`.
- `app.css`: mục "Mẫu in tự cân đối khi đổi khổ (T134)".

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi. `kiem_tra.py --nhanh`: 220 lượt, `Không có lỗi.`. `kiem_van.py` 3 file: sạch.
- Playwright ở màn Thiết kế mẫu in, 17 mẫu × 4 khổ (A4 dọc, A4 ngang, A5 ngang, A5 dọc), TT133: 0 mm tràn mép vùng in, 0 ô số tràn. Trước khi sửa: bảng kê mua hàng A4 dọc tràn 83 mm, kiểm kê A5 dọc tràn 137 mm.
- Đổi khổ 5 lần liên tiếp (dọc, A5 dọc, ngang, A5 ngang, dọc): tổng độ rộng cột ổn định, nút Lưu không bị khoá vì "Tổng độ rộng cột vượt vùng in".
- Chưa in giấy thật. Chưa chạy đo ở TT99, TT58.

## Dở dang, việc tiếp theo

- Không.
- Ghi nhận: biên bản kiểm kê 05-VT (18 cột) ở A4 dọc, A5 dọc vẫn chật, số dòng Cộng xuống dòng ở dấu chấm. Mẫu này nên giữ A4 ngang.

## Bẫy, quyết định mới

- Không.
