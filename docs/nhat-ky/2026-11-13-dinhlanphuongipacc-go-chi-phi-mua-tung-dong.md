# Gõ chi phí mua hàng ở từng dòng phiếu mua (T817)

- Ngày: 13/11/2026
- Người: dinhlanphuongipacc, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/ui/generic/BangSua.tsx`: ô Chi phí mua hàng ở từng dòng (chế độ sửa) thành ô nhập số. Thêm prop `onTongCp`, gõ ở dòng thì báo tổng chi phí các dòng. Phiếu trả lại lập từ phiếu mua (`chiDongCo`, T816) vẫn chỉ xem.
- `src/ui/generic/ChungTuForm.tsx`: truyền `onTongCp={setCpMua}`, ô tổng ở dải đáy bằng tổng các dòng khi gõ ở dòng. Thêm dòng, sửa số lượng không đổi ô tổng, nên số tổng gõ mà chưa phân bổ không mất.
- `src/ui/generic/ChiPhiMuaHang.tsx`: bỏ chữ đỏ "Chưa phân bổ" cạnh nút Phân bổ theo yêu cầu người dùng; bỏ class `.ct-cpm-tt` trong `src/styles/app.css`.
- Gõ tổng rồi bấm Phân bổ giữ như T757: chia theo giá trị hàng.

## Đã kiểm

- `npm run typecheck`: không lỗi.
- `npm run build`: chạy xong, không lỗi.
- `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- Trên trình duyệt (gói PR, Phố Mây Lê Lợi, phiếu mua mới): gõ 50.000 ở dòng thì Giá trị nhập kho tăng 50.000, ô tổng thành 50.000; gõ tổng 90.000 bấm Phân bổ thì dòng nhận 90.000; gõ tổng mà chưa phân bổ không còn chữ "Chưa phân bổ".
- `python tools/xuat_bao_cao_he_thong.py` chưa chạy được: thiếu `Present/tools` cạnh repo như các phiên trước, chưa làm mới file Excel.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- Không.
