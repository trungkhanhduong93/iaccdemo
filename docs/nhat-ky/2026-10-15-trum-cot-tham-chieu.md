# Cột Tham chiếu một dòng, popup chọn mã, mở tab mới (T270)

- Ngày: 15/10/2026
- Người: Trum, agent: Claude Code điều phối, Antigravity (Anti A) viết code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/ui/generic/VoucherScreen.tsx`: thêm component `OThamChieu` cho cột Tham chiếu. Các mã nằm trên một dòng, nối bằng dấu phẩy, dài quá thì cắt "…".
- Một mã: thẻ `<a href="#/app/..." target="_blank">`, mở phiếu ở tab mới. App dùng HashRouter nên href phải có `#`.
- Từ hai mã: ô là nút, bấm mở popup "Phiếu tham chiếu" gắn vào `document.body`, đặt theo vị trí ô có tính hệ số zoom (`heSoZoom`). Đóng khi bấm ra ngoài, Esc, cuộn.
- Áp cho mọi danh sách chứng từ dùng `VoucherScreen`: mua, bán, thu chi, kiểm kê, xuất và nhập điều chỉnh.
- `src/styles/app.css`: mục mới cuối file `/* ── Cột Tham chiếu một dòng, popup chọn mã (T270) ── */`.
- Giữ nguyên khối Tham chiếu trong form phiếu (mở cùng tab), màn điện thoại, cột Tham chiếu của `PhieuSanXuat.tsx`.

## Đã kiểm

- `npm run typecheck`, `npm run build`: chạy xong, không lỗi.
- `python tools/kiem_tra.py --nhanh`: in `Không có lỗi.`
- Playwright ở màn Kiểm kê 5.1.10 gói PL: 3 ô nhiều mã, cao 17px (một dòng). Bấm ô KK2610-0258 ra popup 2 mục `#/app/kho/dieu-chinh/kk0-xdc`, `kk0-ndc`. Esc đóng popup. Màn Điều chỉnh kho có 4 link `target=_blank`.

## Dở dang, việc tiếp theo

- Không.
- Phiếu tạo trong phiên chỉ nằm trong bộ nhớ tab (`phieuMoi` ở `daXoa.ts`), nên tab mới không thấy. Trum chấp nhận cho bản demo.

## Bẫy, quyết định mới

- Không.
