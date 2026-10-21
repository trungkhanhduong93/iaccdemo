# Kéo giãn độ rộng cột ở chi tiết chứng từ (T618)

- Ngày: 22/10/2026
- Người: dinhlanphuongipacc, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/ui/Table.tsx`: thêm `useDoRongCot(khoa)` nhớ độ rộng cột trong localStorage (khoá `iacc-cot-rong-ct:<khoa>`, ghi khi thả chuột) và `ThKeo`, ô tiêu đề có tay nắm `.ds-keo-rong` cho bảng tự vẽ. Kéo dùng lại `keoRong` như danh sách (QD25, tối thiểu 60px).
- `src/ui/generic/BangSua.tsx`: mọi ô tiêu đề (trừ `#` và cột nút xoá) đổi sang `ThKeo`, prop mới `doRong`. Chế độ xem và sửa dùng chung độ rộng.
- `src/ui/generic/BangKiemKe.tsx`: như trên cho phiếu kiểm kê.
- `src/ui/generic/ChungTuForm.tsx`: `doRongCt = useDoRongCot(path)` truyền cho `BangSua`, `BangKiemKe`; tab khác (Hạch toán, Lịch sử) nhận độ rộng qua `BaoCaoDoRongCtx`, khoá `${path}:${tab}`.
- `src/modules/ban-hang/ChungTuBanHang.tsx`: `NoiDungTab` (Xuất bán POS) bọc `BaoCaoDoRongCtx`, khoá `xuat-ban-pos:${tab}`.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_tra.py --nhanh`: in `Không có lỗi.`
- `python tools/xuat_bao_cao_he_thong.py` báo thiếu module `build_present` trên máy này, chưa làm mới `docs/IACC-Cloud-Chi-Tiet-He-Thong.xlsx`.
- Trình duyệt (sự kiện chuột giả lập, vì công cụ kéo của trình duyệt trong app không kéo được cả bảng danh sách vốn đã chạy): phiếu mua MH2610-0017 kéo cột Tên hàng, tải lại vẫn giữ; bấm Sửa vẫn đúng độ rộng, kéo Đơn giá ở chế độ sửa được. Xuất bán POS kéo Tên hàng và Theo dõi tồn kho, cột Theo dõi tồn kho vẫn dính mép phải.

## Dở dang, việc tiếp theo

- Phiếu sản xuất, điều chuyển kho (`BangSanXuat.tsx`, `BangDieuChuyen.tsx`, tiêu đề 2 tầng) chưa có kéo giãn. Ghi thành T619.
- Chưa có nút đưa độ rộng về mặc định ở chi tiết chứng từ; muốn về mặc định thì xoá khoá `iacc-cot-rong-ct:*` trong localStorage.

## Bẫy, quyết định mới

- Không.
