# Form chứng từ: ép thêm chiều cao khối thông tin chung (T336)

- Ngày: 17/10/2026
- Người: dinhlanphuongipacc, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- Làm tiếp T335 theo ý người dùng: màn đặt tỉ lệ 150% vẫn ổn nên ép thêm cho bảng chi tiết nhiều chỗ hơn.
- `src/styles/app.css`, mục T335: trong khối `ct-ttc` ô nhập cao 32px (chung là 36px), cách hàng 6px; cỡ chữ giữ nguyên.
- `src/ui/generic/ChungTuForm.tsx`: khối thông tin chung đệm 8px 16px; các khối của form cách nhau 10px (trước 14px).

## Đã kiểm

- `npm run typecheck`: không lỗi.
- `npm run build`: chạy xong, không lỗi.
- `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- Phiếu mua hàng thêm mới trên localhost, khung 1280×720 (như màn Full HD đặt 150%): khối thông tin chung cao 126px (sau T335 là 150px, ban đầu 225px), không nhãn nào bị cắt, bảng chi tiết cao 450px.
- Chưa làm mới `docs/IACC-Cloud-Chi-Tiet-He-Thong.xlsx`: `tools/xuat_bao_cao_he_thong.py` cần thư mục `Present/tools` cạnh repo, máy này không có.

## Dở dang, việc tiếp theo

- Commit chỉ nằm trên máy, chưa push: người dùng dặn khi nào bảo mới push.

## Bẫy, quyết định mới

- Không.
