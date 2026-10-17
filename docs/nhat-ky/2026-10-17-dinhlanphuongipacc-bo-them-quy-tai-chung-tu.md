# Bỏ thêm mới quỹ tại form chứng từ (T326)

- Ngày: 17/10/2026
- Người: dinhlanphuongipacc, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/ui/ChonDanhMuc.tsx`: thêm tuỳ chọn `khongThem`. Bật thì ô chọn không hiện nút Thêm … mới, Enter khi không tìm thấy cũng không mở hộp thêm nhanh.
- `src/ui/generic/ChungTuForm.tsx`: bật `khongThem` ở 4 ô chọn quỹ: ô Quỹ ở phần thông tin chung, ô Quỹ tiền mặt / Quỹ ngân hàng của phiếu thu chi, ô quỹ trả tiền ngay của phiếu mua hàng, ô quỹ trong hộp thanh toán. Quỹ chỉ khai ở danh mục Quỹ tiền.

## Đã kiểm

- `npm run typecheck`: không lỗi.
- `npm run build`: chạy xong, không lỗi.
- `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- Mở Thu tiền mặt › Thêm mới trên localhost: ô Quỹ tiền mặt chỉ có ô tìm và danh sách quỹ, không còn nút Thêm quỹ mới.
- Chưa làm mới `docs/IACC-Cloud-Chi-Tiet-He-Thong.xlsx`: `tools/xuat_bao_cao_he_thong.py` cần thư mục `Present/tools` cạnh repo, máy này không có.
- Bản điện thoại (`MLapPhieu.tsx`) không dùng `ChonDanhMuc` cho ô quỹ, không có nút thêm quỹ, không sửa.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- Không.
