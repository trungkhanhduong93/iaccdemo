# Danh mục vừa một trang, phân trang (T150)

- Ngày: 11/10/2026
- Người: Trum, agent: Claude Code (giao Antigravity nhưng Antigravity hết quota giữa chừng, chưa sửa file nào, Claude làm tiếp)
- Trạng thái cuối phiên: Xong

## Đã làm

- `CatalogScreen.tsx`: danh mục thường dùng khung `.page-voucher` cộng `page-dm`, bảng trong khung `dm-bang`. Phân trang mọi danh mục, mặc định 50 dòng/trang. Đổi danh mục, tìm, lọc thì về trang 1. Danh mục kiểu chứng từ (CCDC) giữ 20 dòng/trang và dòng cộng tiền.
- `PhanTrang.tsx`: prop `dsCoTrang` (mặc định 20, 50, 100 như cũ), hằng `CO_TRANG_DM` = 50, 100, 200, 500, 1000.
- `DanhMucChiNhanh.tsx`: cùng khung và phân trang.
- `HeThongTaiKhoan.tsx`: cùng khung, không phân trang, chân giữ "Tổng: N tài khoản".
- `app.css`: mục T150 cuối file.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_tra.py --nhanh` (đặt `PYTHONIOENCODING=utf-8`): 218 lượt mở màn, `Không có lỗi.`
- Đo bằng Playwright ở 1366x768 và 1920x1080 trên 8 màn (hàng hoá, đối tượng, tài khoản, chi nhánh, nhóm hàng, TSCĐ 1-13, định mức tồn 5-1-13, CCDC 8-1-1): vùng `.main` không cuộn, chân bảng ở đáy màn hình, bảng dài cuộn trong khung.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- Không dùng class `voucher-top` cho khung không phải danh sách chứng từ: `tools/kiem_tra.py` gặp `.voucher-top` có dòng `tr.click` thì bấm dòng rồi bấm đúp, ở danh mục panel Sửa che dòng nên bước bấm đúp hết giờ chờ. Đã ghi `docs/BAY.md`.
