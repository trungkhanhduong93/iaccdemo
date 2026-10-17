# Form chứng từ: khối thông tin chung thấp xuống, nhãn bên trái ô (T335)

- Ngày: 17/10/2026
- Người: dinhlanphuongipacc, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/ui/generic/ChungTuForm.tsx`: khối thông tin chung (Kho, Nhà cung cấp, Mã số thuế, Ngày, Số phiếu…) thêm lớp `ct-ttc`; cột ngày, số phiếu rộng 300px (trước 280px) vì nhãn nằm bên trái ô.
- `src/styles/app.css`, mục cuối T335: trong `ct-ttc`, nhãn nằm bên trái ô (cột nhãn 112px), nhãn dài xuống 2 dòng; ô nhập giữ cỡ cũ 36px. Khối thấp xuống để bảng chi tiết bên dưới có nhiều chỗ hơn. Áp dụng mọi form chứng từ dùng `ChungTuForm` (mua hàng, thu chi, bán hàng, kho).
- Lần đầu làm theo hướng thu nhỏ ô, giới hạn bề ngang; người dùng bảo không phải ý đó, đã bỏ.

## Đã kiểm

- `npm run typecheck`: không lỗi.
- `npm run build`: chạy xong, không lỗi.
- `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- Phiếu mua hàng thêm mới trên localhost, khung 1900px: khối thông tin chung cao 150px (trước 225px), bảng chi tiết cao hơn tương ứng.
- Phiếu chi tiền mặt, khung 1280px: khối cao 150px, không nhãn nào bị cắt, Tháng hạch toán lãi lỗ xuống 2 dòng.
- Chưa làm mới `docs/IACC-Cloud-Chi-Tiet-He-Thong.xlsx`: `tools/xuat_bao_cao_he_thong.py` cần thư mục `Present/tools` cạnh repo, máy này không có.

## Dở dang, việc tiếp theo

- Commit chỉ nằm trên máy, chưa push: người dùng dặn khi nào bảo mới push.

## Bẫy, quyết định mới

- Không.
