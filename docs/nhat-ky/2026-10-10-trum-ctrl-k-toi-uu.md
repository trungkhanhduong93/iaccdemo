# Hộp tìm Ctrl K, ô Nhóm trong panel, panel tài khoản khựng (T80, T87, T73)

- Ngày: 10/10/2026
- Người: Trum, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- T80 `CommandPalette.tsx`: hộp tìm kiểu iPOS Inventory. Chưa gõ: mục Vừa mở (5 màn mới nhất, bỏ màn ngoài gói) và Gợi ý (Trang chủ, 2.1.1, 4.1.1, Tất cả báo cáo, 1.2; màn nào chưa mở được ở gói thì bỏ). Gõ: một mục Kết quả. Dòng có ô biểu tượng, tên (báo cáo ghi mã trước tên), dòng phụ "Phân hệ · Nhóm", báo cáo ghi "Báo cáo · phân hệ gốc". Thanh phím tắt dưới đáy, nút X đóng.
- T80: `TEN_QUEN` thêm tên quen cho vài màn (4.1.1 "nhập mua hàng", 2.1.1 "phiếu thu, phiếu chi"...). Kết quả xếp: mã hoặc tên bắt đầu bằng chữ gõ, rồi cụm nằm trong tên, rồi đủ từ trong tên, cuối cùng chỉ khớp tên phân hệ. Phần khớp tô xanh.
- T80 `Shell.tsx`: mỗi lần đổi đường dẫn gọi `ghiGanDay`, lưu localStorage khoá `cmdk-gan-day`, tối đa 10 màn. `app.css`: bỏ luật `.palette*`, thêm mục T80.
- T87 `CatalogScreen.tsx`: ô Nhóm lấy nhóm có trong dữ liệu khi danh mục lọc theo nhóm (`nhomLoc === 'nhom'`), vì danh sách khai trong `truong-dm.ts` không có nhóm của dữ liệu giả (vd "Món cơm"). Giá trị không có trong danh sách chọn thì thêm vào cuối, ô khỏi trống.
- T73 `app.css`: `.pn-hop textarea.inp { resize: none; }`.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi. `python tools/kiem_tra.py --nhanh`: `Không có lỗi.` `kiem_van.py src/app/CommandPalette.tsx`: sạch.
- T80 Playwright gói Pro: mở 4 màn, Ctrl K ra Vừa mở đúng thứ tự, mới nhất trên cùng, rồi Gợi ý. Ô nhập có focus. Gõ "nhap mua", Enter: sang `/app/mua-hang/4-1-1`. ↑ ↓ cuộn dòng đang chọn vào tầm nhìn. Esc, bấm nền mờ đều đóng. Gói Free: Nhập khác 5.1.1 không vào Vừa mở. Không lỗi console.
- T87: panel 1.2 dòng Cơm tấm ra Nhóm "Món cơm" (trước để trống); 1.6, 1.7 vẫn điền đúng.
- T73: đo trên Chrome có giao diện, 1440x900, lần mở panel 1.1 đầu tiên: trước hở 133ms (3 lần đo), sau 33–34ms. Trace Chrome: trước có tác vụ GPU raster 108ms ngay khi thân panel hiện, JS chỉ 24ms. Đã thử bỏ bóng panel, bóng khối, ẩn chữ, ẩn svg: không đổi. `field-sizing: content` thêm 50ms layout nên không dùng.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- `docs/BAY.md` mục Code: ô kéo giãn của textarea làm GPU vẽ lại cả panel, cách đo khung hở.
