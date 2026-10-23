# Dọn sót sau khi bỏ gói Free (T649)

- Ngày: 23/10/2026
- Người: Trum, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/app/session.tsx`: `chuanHoaGoi` đổi mã Excel cũ `M` (Plus cũ) thành Pro như QD80, trước đây thành Plus.
- `tools/kiem_tra.py`: hàm `phien` ghi thêm `goiBan=2`, để app không coi phiên thử là mã gói cũ.
- `src/ui/mobile/MXemPhieu.tsx`: tab Bút toán, Hạch toán ẩn theo `kieu === 'khong'` thay cho gói Standard (QD81).
- `src/ui/mobile/MLapPhieu.tsx`: thêm `coHachToan = kieuGhiSoDv(s) !== 'khong'` cho tab, khối Hạch toán.
- `docs/KIEN-TRUC.md`: bỏ chữ gói Free, ghi doanh nghiệp gói Standard chạy TT58 trường hợp 1 (T632), thêm `kieuGhiSoDv()`.
- `docs/TRIEN-KHAI.md`: ghi các chỗ phải sửa cùng một lần khi Excel đổi sang mã gói mới.
- Comment `src/modules/bao-cao/danh-sach.ts` (`GIU_TT152_HKD`): doanh nghiệp gói Standard chạy TT58.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_tra.py --nhanh`: `Không có lỗi.`
- Script riêng: link `?goi=M` ra gói `PR`. Điện thoại xem phiếu mua 4.1.1: Plus hộ kinh doanh, Standard doanh nghiệp không có tab Hạch toán; Plus doanh nghiệp có.
- Chưa chạy `python tools/xuat_bao_cao_he_thong.py`: máy ảo không có `build_present.py` (nằm ngoài repo, trên máy Trum).

## Dở dang, việc tiếp theo

- Không.
- Excel trên máy Trum vẫn ghi 4 gói. Khi sửa Excel, làm theo mục `tools/xuat_tinh_nang.py` trong `docs/TRIEN-KHAI.md`.

## Bẫy, quyết định mới

- Không.
