# Tải PDF, XML hoá đơn điện tử, tải hàng loạt ra zip, chia sẻ qua ứng dụng (T793)

- Ngày: 11/11/2026
- Người: dinhlanphuongipacc, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/ui/luuFile.ts`: hàm `luuFile` mở hộp Lưu của máy (Chrome, Edge) để chọn thư mục, trình duyệt khác tải về thư mục Tải xuống; `chiaSeFile` mở bảng chia sẻ của máy; `taiVe` tải thẳng.
- `src/ui/zip.ts`: `taoZip` gói nhiều file thành một file zip không nén, tên file UTF-8.
- `src/modules/ban-hang/hddtFile.ts`: `pdfHd` vẽ bản thể hiện hoá đơn lên canvas A4 rồi gói thành PDF một trang; `xmlHd` xuất XML theo khung hoá đơn điện tử; `tenFileHd`.
- `src/modules/ban-hang/HopChiaSeHd.tsx`: popup Chia sẻ hoá đơn, 2 bước, ô Zalo, Messenger, Telegram, Gmail, nội dung tin nhắn sửa được, tên file đính kèm. Máy hỗ trợ chia sẻ file thì mở bảng chia sẻ của máy, file PDF và nội dung kèm sẵn; không hỗ trợ thì tải PDF, chép nội dung, mở bản web của ứng dụng (Gmail, Telegram điền sẵn nội dung).
- `hddt.tsx` (popup xem hoá đơn): Tải PDF, Tải XML dùng `luuFile`; Chia sẻ PDF mở popup chia sẻ. Export `ttXemHd`, `TtXem`.
- `HoaDonDienTu.tsx`: menu ⋯ Tải XML, Tải PDF, Chia sẻ PDF làm thật; chọn nhiều rồi Tải XML, Tải PDF ra một file zip, mỗi hoá đơn một file.
- `app.css`: mục `(T793)` cuối file cho popup chia sẻ.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- Trình duyệt: popup chia sẻ hiện đúng; file PDF sinh ra đúng cấu trúc (%PDF ... %%EOF), ảnh hoá đơn đọc được tiếng Việt; zip 2 file mở bằng Python `zipfile`, `testzip()` không lỗi.
- Chưa kiểm được trên máy thật: bảng chia sẻ của Windows (khung trình duyệt trong app không có `navigator.canShare`), hộp Lưu của máy chỉ mở được, không bấm thử được.

## Dở dang, việc tiếp theo

- Không.
- Giới hạn của trình duyệt: trang web không mở thẳng Zalo, Messenger kèm file được; cách gần nhất là bảng chia sẻ của máy. Trang web cũng không biết đường dẫn đầy đủ nơi lưu, nên hộp Lưu của máy là nơi người dùng thấy và chọn đường dẫn.

## Bẫy, quyết định mới

- Không.
