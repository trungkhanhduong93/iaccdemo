# Báo cáo mở ngay trong phân hệ (T384)

- Ngày: 18/10/2026
- Người: dinhlanphuongipacc, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/app/Screen.tsx`: máy tính, tab Báo cáo của phân hệ (vd `mua-hang/bao-cao`) không chuyển sang `bao-cao/nhom-<phân hệ>` nữa mà hiện danh sách báo cáo của phân hệ ngay tại chỗ; báo cáo mở ở đường dẫn phân hệ (vd `mua-hang/4-2-6`), không chuyển sang `bao-cao/4-2-6`. Điện thoại giữ cách cũ (chuyển sang phân hệ Báo cáo).
- `src/modules/bao-cao/TrungTam.tsx`: nhận `mod`; mở trong phân hệ thì liên kết báo cáo trỏ về đường dẫn phân hệ, ẩn cột nhóm, ghim, gần đây bên trái (lớp `bc-tt-phan-he`).
- `src/modules/bao-cao/ThanhChon.tsx`: thêm `trongPhanHe`; nút quay lại thành "Báo cáo <phân hệ>" về tab Báo cáo của phân hệ, ô đổi báo cáo đổi trong phân hệ (lớp `bc-chon-phan-he`).
- `src/styles/app.css`, mục cuối T384: danh sách một cột; báo cáo trong phân hệ vẫn hiện thanh tab phân hệ (quy tắc cũ ẩn thanh tab khi có `.bc-tt`, `.bc-chon` chỉ còn tác dụng ở phân hệ Báo cáo).
- Tắt báo cáo (nút X ở hộp Điều kiện xem báo cáo) vẫn là quay lại trang trước, nay là tab Báo cáo của phân hệ.

## Đã kiểm

- `npm run typecheck`: không lỗi.
- `npm run build`: chạy xong, không lỗi.
- `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- Gói Plus trên localhost: Mua hàng › Báo cáo hiện 3 báo cáo của Mua hàng, thanh tab giữ, tab Báo cáo đang chọn; bấm Mua hàng theo ngày mở `mua-hang/4-2-6`; bấm X ở hộp điều kiện về `mua-hang/bao-cao`. Kho › Báo cáo 7 báo cáo trỏ `kho/...`; Thẻ kho mở `kho/5-2-1` có số liệu. Phân hệ Báo cáo (`bao-cao/tat-ca`) giữ như cũ.
- Chưa kiểm bản điện thoại (không đổi).
- Chưa làm mới `docs/IACC-Cloud-Chi-Tiet-He-Thong.xlsx`: `tools/xuat_bao_cao_he_thong.py` cần thư mục `Present/tools` cạnh repo, máy này không có.

## Dở dang, việc tiếp theo

- Commit chỉ nằm trên máy, chưa push: người dùng dặn khi nào bảo mới push.
- Liên kết xem chi tiết bên trong báo cáo (vd từ Xuất nhập tồn sang Thẻ kho, `kho/bao-cao.ts`, `so-bo-sung.ts`) vẫn mở ở phân hệ Báo cáo.

## Bẫy, quyết định mới

- Không.
