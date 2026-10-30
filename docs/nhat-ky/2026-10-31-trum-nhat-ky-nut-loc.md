# Nhật ký thao tác web: nút Lọc, bảng giãn theo màn (T694)

- Ngày: 31/10/2026
- Người: Trum, agent: Claude Code (anti làm dở, Claude làm tiếp)
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/modules/tien-ich/TienIch.tsx` (`NhatKyThaoTac`): dùng `useLocNhap`, thêm nút `btn pri ds-nut-loc` có chấm cam khi điều kiện đổi chưa lọc. Mở màn chưa có dòng, hiện "Chọn điều kiện rồi bấm Lọc để xem nhật ký." Không tự chọn dòng đầu, bấm Lọc lại thì đóng side panel.
- `src/styles/app.css` mục T693 web: bảng `width: max(100%, 1394px)` để giãn hết khung trên màn rộng, màn hẹp vẫn cuộn ngang. Thêm `.nk-trong` cho dòng trống.

## Đã kiểm

- `npm run typecheck`, `npm run build`: qua.
- Playwright gói Standard: trước khi lọc 0 dòng, không có panel; bấm Lọc ra 7 dòng, không có panel; bấm dòng mở panel, Lọc lại thì đóng. Bảng bằng khung ở 1920px.
- `python tools/kiem_tra.py --nhanh`.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- `min-width` trên `<table>` có `table-layout: fixed` không giữ được bề rộng tối thiểu (bảng ra 1255px thay vì 1394px). Dùng `width: max(100%, 1394px)`.
