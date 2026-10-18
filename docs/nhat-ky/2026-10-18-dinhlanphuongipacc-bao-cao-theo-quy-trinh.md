# Tab Báo cáo của phân hệ có đủ báo cáo trong sơ đồ Quy trình (T385)

- Ngày: 18/10/2026
- Người: dinhlanphuongipacc, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/modules/bao-cao/cuaPhanHe.ts` (mới): `baoCaoCuaPhanHe(mod, s)` trả danh sách báo cáo ở tab Báo cáo của phân hệ = nhóm báo cáo của phân hệ (như trước) + mọi báo cáo mà sơ đồ Quy trình của phân hệ nhắc tới, theo đúng kiểu sơ đồ của gói (buocKyFree, luongFree, hoiTuFree, raFree, baoCaoFree ở gói Free; buoc, hoiTu, baoCao ở gói khác), kể cả báo cáo của phân hệ khác và sổ, công nợ trước đây bị gom sang nhóm Sổ sách, Công nợ.
- `src/modules/bao-cao/TrungTam.tsx`: tab Báo cáo trong phân hệ dùng danh sách trên.
- `src/modules/bao-cao/ThanhChon.tsx`: ô đổi báo cáo trong phân hệ lấy cùng danh sách.
- `src/app/Screen.tsx`: báo cáo của phân hệ khác mở ngay trong phân hệ đang đứng (vd `mua-hang/5-2-3` là Báo cáo xuất nhập tồn của Kho), có thanh chọn báo cáo của phân hệ; điện thoại không đổi.
- `src/app/ModuleTabs.tsx`: đang xem báo cáo phân hệ khác trong phân hệ thì tab Báo cáo vẫn được chọn.

## Đã kiểm

- `npm run typecheck`: không lỗi.
- `npm run build`: chạy xong, không lỗi.
- `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- Gói Free trên localhost: Mua hàng › Báo cáo có 5 báo cáo như sơ đồ (Bảng kê mua hàng theo hàng hoá, Công nợ nhà cung cấp, Báo cáo xuất nhập tồn, Tổng hợp nhập kho, Chi tiết nhập kho); mở Báo cáo xuất nhập tồn ở `mua-hang/5-2-3` có số liệu, tab Báo cáo đang chọn.
- So danh sách mọi phân hệ ở gói Free, Plus: Thu chi gói Free thêm Công nợ nhà cung cấp, Bán hàng gói Free có 3 báo cáo kho của sơ đồ. Kê khai thuế, Chi phí phân bổ, TSCĐ có báo cáo trong sơ đồ nhưng đang ẩn theo chế độ hoặc gói, sơ đồ cũng ẩn theo cùng quy tắc.
- Chưa làm mới `docs/IACC-Cloud-Chi-Tiet-He-Thong.xlsx`: `tools/xuat_bao_cao_he_thong.py` cần thư mục `Present/tools` cạnh repo, máy này không có.

## Dở dang, việc tiếp theo

- Commit chỉ nằm trên máy, chưa push: người dùng dặn khi nào bảo mới push.

## Bẫy, quyết định mới

- Không.
