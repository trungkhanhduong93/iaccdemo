# Thẻ chi phí phân bổ điện thoại theo artifact (T590)

- Ngày: 21/10/2026
- Người: dinhlanphuongipacc, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- Chốt giao diện trên artifact https://claude.ai/artifact/UwVTw7FUEyrMs9A8PG2noH (màn xem, tab Lịch phân bổ, tab Lịch sử, màn sửa thẻ), rồi làm theo.
- `src/ui/mobile/MThePhanBo.tsx` (mới): `MTheNoiDung` là nội dung màn xem thẻ, `MTheSua` là màn sửa thẻ.
  - Màn xem: khối đầu thêm Ngày ghi tăng dưới ô Đã phân bổ, Còn lại. Bỏ khu vực Thông tin thẻ. Nhãn thẻ: mọi mục ngừng thì Ngừng phân bổ; có mục ngừng, có mục chạy thì thêm nhãn phụ "Ngừng x/y mục". Thẻ dư đầu kỳ có nhãn Đầu kỳ.
  - Mục phân bổ: danh sách dòng theo khuôn dòng hàng phiếu mua (`m-t449-hang-*`). CCDC có Số lượng, Đơn giá; TSCĐ có Số hiệu, Mô tả chi tiết, không có Số lượng; chi phí trả trước không có Số lượng. Thẻ dư đầu kỳ thêm Giá trị đã phân bổ, Giá trị cần phân bổ, Số tháng đã phân bổ, Số tháng còn lại. Dòng ngừng có nhãn Ngừng phân bổ và Ngày ngừng phân bổ.
  - Tab Lịch phân bổ: lọc theo mục, ô tóm tắt (Đã phân bổ x/y kỳ, Kỳ tới, Còn phải phân bổ), gom theo năm, kỳ tháng hiện tại nổi bật, bấm kỳ ở Tất cả mục xem chia theo mục.
  - Trạng thái kỳ: Free, Standard tới hết tháng hiện tại là Đã phân bổ, sau đó là Chưa phân bổ; Plus, Pro theo nút Phân bổ trên web (Đã / Chờ phân bổ); kỳ từ tháng ngừng là Ngừng phân bổ.
  - Tab Lịch sử dùng `MLichSu` như phiếu thu chi, thao tác mẫu của thẻ: Ghi tăng thẻ (Nhập thẻ dư đầu kỳ), Phân bổ kỳ, Sửa thẻ.
  - Màn sửa thẻ: Tên thẻ, Ngày ghi tăng; mỗi mục chỉ có nút Sửa (không thêm, không xoá mục, muốn bỏ thì xoá cả thẻ, vẫn kiểm khoá sổ như cũ). Tấm sửa mục có đủ trường theo loại, công tắc Ngừng phân bổ và ngày ngừng. Nút Sửa số tiền từng kỳ mở màn gõ lại tiền từng kỳ, có Cần phân bổ, Tổng các kỳ, Chênh lệch, Chia đều lại. Lưu mà tổng lệch thì hỏi "Tổng giá trị phân bổ các kỳ của ... đang không khớp. Bạn có muốn điều chỉnh về kỳ phân bổ cuối cùng không?", Điều chỉnh dồn chênh lệch vào kỳ cuối còn phân bổ.
- `src/ui/mobile/MCcdc.tsx`: màn xem dùng `MTheNoiDung`, nút Sửa thẻ mở `MTheSua`; form cũ (T415) chỉ còn cho ghi tăng thẻ mới. Lưu thẻ ghi nhật ký `dm/8-1-1`. Dữ liệu mẫu thêm thẻ dư đầu kỳ TPB2601-0012 có một mục ngừng, thẻ TPB2606-0002 ngừng, TSCĐ TPB2610-0010 có Số hiệu, Mô tả.
- `src/ui/mobile/MLichSu.tsx`: thêm prop `mau` (thao tác mẫu riêng của màn), tách nhật ký "Sửa thẻ: Trường: cũ → mới; ...".
- `src/modules/ccdc/the-phan-bo.tsx`: xuất `tinhDong`, `lichDong`, thêm `kyNay`. Web gói Free, Standard, cột Trạng thái tab Đã phân bổ: kỳ sau tháng hiện tại là Chưa phân bổ (trước luôn Đã phân bổ).
- Cuối `src/styles/app.css`: mục T590.

## Đã kiểm

- `npm run typecheck`: không lỗi. `npm run build`: chạy xong, không lỗi.
- `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- `python tools/kiem_van.py` cho 4 file sửa: Sạch.
- Chạy Playwright 390x844 qua các thẻ TPB2601-0012, TPB2610-0010, TPB2606-0002, TPB2609-0009 ở gói S và PL: đủ trường theo loại, nhãn kỳ đúng gói, lọc mục, chia theo mục, Lịch sử; sửa một kỳ, lưu, cảnh báo lệch, hỏi, Điều chỉnh, Lịch sử ghi dòng Sửa thẻ. Không có lỗi console.
- Chưa kiểm bằng mắt phần web (cột Trạng thái), chỉ đổi nhãn.

## Dở dang, việc tiếp theo

- Không.
- Ở tấm sửa mục, ô chọn CCDC / Mục chi phí / TSCĐ chỉ hiện tên, mã, chưa bấm chọn được. Làm thành việc mới nếu cần.
- Thẻ mẫu TPB2609-0009 ghi `gt` 40.500.000 nhưng hai dòng cộng 35.700.000; màn xem điện thoại giờ lấy tổng các dòng. Danh sách thẻ vẫn hiện `gt` của thẻ.

## Bẫy, quyết định mới

- Không ghi QD. Các điểm đã chốt nằm ở artifact và nhật ký này: app không thêm, không xoá mục; trạng thái kỳ Đã / Chưa phân bổ theo tháng hiện tại dùng chung web và app (gói Free, Standard).
- Chưa làm mới `docs/IACC-Cloud-Chi-Tiet-He-Thong.xlsx`: `tools/xuat_bao_cao_he_thong.py` cần thư mục `Present/tools` cạnh repo, máy này không có.
