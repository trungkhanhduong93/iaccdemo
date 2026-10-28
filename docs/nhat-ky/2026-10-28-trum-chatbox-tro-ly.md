# Chatbox Trợ lý IACC bản mẫu (T672)

- Ngày: 28/10/2026
- Người: Trum, agent: Claude Code điều phối, Antigravity code
- Trạng thái cuối phiên: Xong

## Đã làm

- Tạo `src/ui/TroLy.tsx`: nút nổi ✦ góc dưới phải, khung chat 400×580 (phóng to 720×85vh), mốc ngày giờ, bong bóng người dùng và bot, chấm "đang gõ", chân khung có đính kèm, gửi ảnh, ô nhập, nút gửi. Esc đóng khung.
- Kịch bản mẫu: tin chào kèm 3 chip gợi ý. Gõ câu mua hàng thì hàm `tachDongHang` tách ra thẻ kết quả (tên hàng, SL, ĐVT, đơn giá, thành tiền, tổng), nút Lập phiếu mua mở `/app/mua-hang/4-1-1/moi`, nút Sửa lại đưa câu về ô nhập. Gửi ảnh trả 3 dòng mẫu cố định. Đính kèm file báo bản mẫu chưa nhận file.
- Lịch sử chat lưu localStorage khoá `iacc.troLy.v1`, có nút xoá.
- `src/app/KhungApp.tsx`: gắn `<TroLy />` cạnh `<Shell />`, chỉ bản web.
- Cuối `src/styles/app.css`: mục `Chatbox Trợ lý IACC (T672)`, class tiền tố `tl-`.
- Claude sửa bộ tách: `\bvà\b` không khớp vì JS coi "à" không phải ký tự chữ, đổi thành `\svà\s`.

## Đã kiểm

- `tachDongHang` chạy thử 5 câu bằng node: "12 kg thịt bò giá 250k" ra 3.000.000; "3 thùng nước suối giá 120000, 2 bao gạo giá 1,5tr" ra 2 dòng; "30 cái móc dán giá 12k" ra 360.000; "xin chào" ra 0 dòng; câu có "và" tách 2 dòng.
- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- `python tools/kiem_van.py src/ui/TroLy.tsx`: Sạch.
- Chưa chụp màn hình xem bằng mắt.

## Dở dang, việc tiếp theo

- Không. Muốn có trên điện thoại hoặc điền sẵn dòng hàng vào phiếu mua thì mở việc mới.

## Bẫy, quyết định mới

- QD85 trong `docs/QUYET-DINH.md`: thay dòng "không đem sang trợ lý iOne" của QD15.
