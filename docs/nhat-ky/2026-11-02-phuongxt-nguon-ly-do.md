# Lý do nghiệp vụ thêm Nguồn FABi, Thủ công (T708)

- Ngày: 02/11/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/data/mock.ts`: mọi lý do có sẵn (`LY_DO`) ghi `nguon: 'FABi'`. PhuongXT chốt: tất cả lý do có sẵn là nguồn FABi, lý do người dùng thêm là Thủ công.
- `src/modules/danh-muc/index.ts`: danh sách 1.16 thêm cột Nguồn sau Dùng cho; dòng không có `nguon` hiện Thủ công.
- `src/modules/danh-muc/truong-dm.ts`: form 1.16 thêm ô Nguồn chỉ đọc; thêm mới tự ghi Thủ công (`moi`). Thêm khoá `chiSuaKhi` vào `CauHinhDM`: `chiSua` chỉ áp cho lý do FABi, nên lý do FABi chỉ sửa Là chi phí, Chi phí phân bổ nhiều kỳ, Nhóm lý do; lý do thủ công sửa hết. `tienIch.xoa` chỉ cho lý do không phải FABi.
- `src/ui/generic/CatalogScreen.tsx`: `khoaO` theo `chiSuaKhi`; panel cạnh (không phải form toàn màn) có nút Xoá khi `tienIch.xoa` cho phép, hỏi lại trước khi xoá; lưu khi sửa dòng đã thêm trong phiên thì ghi vào kho; xoá thì bỏ hẳn khỏi kho.
- `src/ui/generic/danhMucStore.ts`: thêm `suaCatalogRow(dm, ma, row | null)` sửa hoặc xoá dòng đã thêm trong phiên theo mã.
- `src/ui/mobile/MDanhMuc.tsx` (file T700 đang giữ): thẻ lý do hiện "Nguồn: ...", hộp chi tiết thêm dòng Nguồn. Điện thoại vẫn chỉ xem lý do.

## Đã kiểm

- `npm run typecheck`: không lỗi.
- `npm run build`: chạy xong, không lỗi.
- `python tools/kiem_tra.py --nhanh`: `Không có lỗi.`
- `kiem_van.py` các file đã sửa: 0 ĐỎ.
- `tools/xuat_bao_cao_he_thong.py` không chạy được: thiếu `../Present/tools/build_present.py` trên máy PhuongXT, nên file Excel báo cáo chưa làm mới.
- Trình duyệt 1440x900: THU01 các ô khoá, không có nút Xoá; thêm CHI99 hiện Thủ công, sửa tên lưu được, Xoá hỏi lại rồi mất khỏi danh sách. Điện thoại hiện "Nguồn: FABi".

## Dở dang, việc tiếp theo

- Không.
- Chưa làm: chấm Trạng thái ngoài danh sách vẫn bật tắt được lý do FABi như trước; xoá lý do thủ công đã dùng trong phiếu chưa chặn. Cần thì mở việc mới.

## Bẫy, quyết định mới

- Không.
