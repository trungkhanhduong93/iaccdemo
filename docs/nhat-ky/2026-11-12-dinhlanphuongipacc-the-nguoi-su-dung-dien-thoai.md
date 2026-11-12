# Thẻ người sử dụng trên điện thoại tách Quyền, Cửa hàng (T811)

- Ngày: 12/11/2026
- Người: dinhlanphuongipacc, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `MHeThong.tsx`: thẻ người sử dụng ở danh sách điện thoại tách dòng "chức vụ · cửa hàng" thành hai dòng "Quyền: <chức vụ>" và "Cửa hàng: <tên cửa hàng hoặc Tất cả cửa hàng>". Không cần thêm CSS vì `.m-ht-user-info` đã xếp dọc.
- Người dùng có nhờ bỏ ô Kho ở form Người sử dụng (web và điện thoại). Đã sửa rồi gỡ lại, không push, vì Trum nhận đúng việc này ở T810 (bỏ ô Kho, bỏ khối Thông tin hệ thống, QD110) cùng file `HeThong.tsx`. Phần đó để Trum làm.

## Đã kiểm

- `npm run typecheck`: không lỗi.
- `npm run build`: chạy xong, không lỗi.
- `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- `python tools/kiem_van.py src/ui/mobile/MHeThong.tsx`: sạch.
- Chưa chụp màn hình vì cổng 5180 đang có server của phiên khác.
- Chưa làm mới `docs/IACC-Cloud-Chi-Tiet-He-Thong.xlsx`: máy này thiếu `../Present/tools`.

## Dở dang, việc tiếp theo

- Không.
- Lưu ý cho T810 (Trum): T809 vừa đặt khối Thông tin hệ thống chỉ hiện khi xem (cờ `chiKhiXem`) và đưa Đăng nhập gần nhất xuống cuối khối đó. T810 bỏ hẳn khối này thì nhớ chuyển ô Đăng nhập gần nhất sang chỗ khác nếu còn cần.

## Bẫy, quyết định mới

- Không.
