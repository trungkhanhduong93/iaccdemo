# Đối tượng thu chi chỉ bắt buộc theo lý do (T330)

- Ngày: 17/10/2026
- Người: dinhlanphuongipacc, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/data/mock.ts`: thêm `LY_CAN_DOI_TUONG`, tên các lý do bắt buộc chọn đối tượng: THU02 Thu Nợ, THU10 Đi vay, CHI02 Thanh toán công nợ nhà cung cấp, CHI34 Cho vay. "Thu công nợ" và "thu nợ" cùng ứng với THU02, vì danh mục chỉ có một lý do thu nợ.
- `src/ui/generic/ChungTuForm.tsx`: phiếu thu, chi chỉ hiện dấu * ở ô Đối tượng khi lý do thuộc danh sách trên; lưu mà để trống đối tượng thì báo "Chọn đối tượng cho lý do …". Lý do khác để trống được.
- `src/ui/mobile/MLapPhieu.tsx`: điện thoại trước đây bắt buộc đối tượng với mọi phiếu thu chi, nay chỉ bắt buộc khi có dòng lý do thuộc danh sách trên; dấu * theo đó.

## Đã kiểm

- `npm run typecheck`: không lỗi.
- `npm run build`: chạy xong, không lỗi.
- `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- Web trên localhost, Thu tiền mặt thêm mới: lý do Thu tiền bán hàng thì ô Đối tượng không có *, đổi sang Thu Nợ thì có *.
- Chưa bấm thử bản điện thoại, mới kiểm bằng typecheck.
- Chưa làm mới `docs/IACC-Cloud-Chi-Tiet-He-Thong.xlsx`: `tools/xuat_bao_cao_he_thong.py` cần thư mục `Present/tools` cạnh repo, máy này không có.

## Dở dang, việc tiếp theo

- Các lý do gần nghĩa chưa đưa vào danh sách: CHI16 Trả nợ, CHI23 Thanh toán tiền cho nhà cung cấp, CHI32 Thanh toán tiền vay. Cần thì thêm mã vào `LY_CAN_DOI_TUONG` ở `src/data/mock.ts`.

## Bẫy, quyết định mới

- Không.
