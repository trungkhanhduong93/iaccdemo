# Xem phiếu điện thoại sát mép, Nguồn chứng từ thành dòng (T424, T425)

- Ngày: 19/10/2026
- Người: Trum, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `MXemPhieu.tsx`: bỏ lớp `m-xp` ở khung ngoài màn xem phiếu, hết lề trái phải thừa, thanh số phiếu sát mép trên (T425). Áp cho phiếu thu, chi, mua hàng, kiểm kê vì cùng dùng `ThanPhieu`.
- `MXemPhieu.tsx`: phiếu thu, chi chỉ còn một ô Quỹ thu tiền / Quỹ chi tiền rộng hết hàng; Nguồn chứng từ thành dòng cuối nhóm Thông tin phiếu (T424).
- `MXuatBanPos.tsx`: chi tiết đơn đổi từ tấm trượt từ đáy sang màn đầy đủ `m-pb-man m-pos-ct-man`, thanh đầu `m-pb-thanh-dau` sát mép trên, chân một nút Đóng (T425).
- CSS mục "Xem phiếu điện thoại… (T424, T425)" ở cuối `app.css` đã lên `main` từ trước, đi kèm commit T434.

## Đã kiểm

- `npm run typecheck`: không lỗi.
- `npm run build`: chạy xong, không lỗi.
- `python tools/kiem_tra.py --nhanh`: `Không có lỗi.`
- Chưa chụp màn hình điện thoại để soi khoảng cách bằng mắt.

## Dở dang, việc tiếp theo

- Không. T430 (nút Đóng Xuất bán POS màu xanh chính) và phần điện thoại của T436 làm tiếp được vì `MXemPhieu.tsx`, `MXuatBanPos.tsx` đã trống.
- Quy tắc `.m-xp.m-pb-man` trong mục CSS T424, T425 không còn khớp phần tử nào sau khi bỏ lớp `m-xp`. Có thể xoá khi dọn CSS.

## Bẫy, quyết định mới

- Không.
