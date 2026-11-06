# Điện thoại, Công thức chế biến và sơ chế theo app IVT (T756)

- Ngày: 06/11/2026
- Người: Trum, agent: Claude Code điều phối, Antigravity code giao diện, OpenCode viết script kiểm và review
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/ui/mobile/MCongThuc.tsx`: thay giao diện bằng 5 màn: danh sách, bộ lọc, chi tiết, thêm sửa, tấm sửa nguyên vật liệu. Đường dẫn `path`, `path/<id>`, `path/<id>?sua=1`, `path/moi`.
- `src/ui/mobile/manMobile.ts`: gói Plus mở `danh-muc/cong-thuc-che-bien` ra `MCongThuc`, hết màn chỉ dùng máy tính.
- `src/ui/ChonCuaHangTruoc.tsx`: `kho/9-1-3`, `kho/5-1-5` không còn hỏi chọn cửa hàng trước khi vào `/moi`. Hàm này dùng chung, nên web cũng hết hỏi ở hai màn này.
- `src/modules/kho/CongThuc.tsx`: thêm `export` cho `KENH`, logic web giữ nguyên.
- `src/styles/app.css`: mục T756 cuối file. CSS cũ giữ nguyên, mục mới đè các luật cũ còn ăn vào màn mới (`.m-tc-tabs` thu nhỏ còn 2px, `.m-ct-tim-ic` tuyệt đối, `.m-ct-nvl-dong` flex có nền).
- Sau khi lưu sửa, lùi về chi tiết bằng `quayLaiMobile` thay cho `nav replace`. Trum chốt khi nghiệm thu, vì replace để lại 2 mục chi tiết, quay lại phải bấm 2 lần.

## Sửa sau nghiệm thu

- Form sửa: ô sửa được nền trắng có viền, ô không sửa được nền xám. Đơn vị tính chính khoá khi hàng chỉ có 1 đơn vị.
- Danh sách: `.m-ct-khung` còn ăn padding của luật cũ T188 nên tab hở 14px hai bên. Mục T756 đặt lại `padding: 0`, `gap: 0`.
- Nút thêm: dùng `m-nut-fab-tron`, dấu cộng về giữa nút.

## Đã kiểm

- `npm run typecheck`, `npm run build`: chạy xong, không lỗi.
- `python tools/kiem_tra.py --nhanh`: in "Không có lỗi."
- `python tools/kiem_van.py src/ui/mobile/MCongThuc.tsx`: sạch.
- Script Playwright tạm ngoài repo, khung 360px, mục a-h đều PASS: mở đủ 3 đường, Plus có mục trong Danh mục, tab tìm lọc đúng số thẻ, bật tắt đổi số đếm, sửa đủ 6 ô, thêm và sao chép ra mã mới, không tràn ngang, không lỗi console.
- Bài kiểm chặt thứ hai 33/33: so giá trị sau lưu, đọc kho phiếu thấy `tang`, `giam` còn nguyên ở dòng vừa sửa và dòng khác, sơ chế lưu vào `gocMa`, `dich`.
- Ô nhập đo được 16px: ô tìm, mô tả, số lượng.
- `tools/kiem_tra.py` không phải sửa: bài công thức vẫn đúng với tab mặc định.
- Chưa chạy `--dien-thoai` vì vẫn kẹt ở đợt 5 (T696). Chưa thử trên máy thật.

## Khác bản vẽ

- Thanh trên giữ của `MobileShell` theo yêu cầu, có chuông và chọn cửa hàng, nên tiêu đề danh sách bị cắt còn "Công th...".
- Bộ lọc là thẻ có viền theo `m-loc-*` của Xuất bán POS, bản vẽ là dòng kẻ.
- Đầu màn chi tiết, form dùng `m-ct-dau-*` riêng cùng `m-tc-lap-man`, không dùng `m-tc-lap-header`.
- Icon lấy từ repo. Danh sách có thanh tab dưới của shell.

## Dở dang, việc tiếp theo

- Không. Điểm nhỏ chưa kiểm: thêm mới, sao chép lưu bằng `nav replace` nên lịch sử có thể còn mục thừa khi bấm lùi ở danh sách.

## Bẫy, quyết định mới

- `docs/BAY.md`: `useDsCongThuc` trả object mới mỗi lần vẽ với dòng đã sửa.
- `docs/QUYET-DINH.md`: QD98, công thức không hỏi cửa hàng trước khi thêm.
