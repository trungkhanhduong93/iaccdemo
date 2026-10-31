# Lý do nghiệp vụ: tích Chi phí phân bổ nhiều kỳ (T700)

- Ngày: 31/10/2026
- Người: dinhlanphuongipacc, agent: Claude Code
- Trạng thái cuối phiên: Dở dang

## Đã làm

- `src/data/mock.ts`: lý do có thêm `phanBo`, CHI35 tích phân bổ, bỏ khỏi `LY_LA_CHI_PHI`; thêm `ganLyDo`, `luuLyDo` ghi đè tích theo phiên.
- `src/app/session.tsx`: thêm `lyDoGhiDe` theo đơn vị, khoá mã lý do.
- `src/modules/danh-muc/truong-dm.ts`: ô tích Chi phí phân bổ nhiều kỳ, `doi` cho hai tích loại trừ nhau, `chiSua` thêm `phanBo`.
- `src/modules/danh-muc/index.ts`: cột Chi phí phân bổ nhiều kỳ, `phien` giữ tích đã sửa (trước đây sửa Là chi phí ở lý do có sẵn không lưu lại).
- `src/ui/generic/danhMucStore.ts`: `laLyPhanBo(ten, s)`; thêm lý do từ phiếu chi không còn tích sẵn Là chi phí.
- `src/ui/generic/ChungTuForm.tsx`: nhắc và gợi ý tạo thẻ theo `laLyPhanBo`, chữ hộp báo đổi thành "khoản chi phí phân bổ nhiều kỳ".
- `src/modules/ccdc/GhiTangHangLoat.tsx`: `useDongCho` lấy dòng phiếu chi có lý do tích Chi phí phân bổ nhiều kỳ thay cho so tên. Ghi tăng, Ghi tăng bổ sung, cảnh báo ở danh sách thẻ, mục Khoá sổ Standard đều dùng hàm này.
- Giữ lý do CHI35 Chi phí chờ phân bổ vì phiếu mẫu, sơ đồ Chi phí phân bổ, điện thoại đang dùng; người dùng chốt để tạm, chạy theo tích mới.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi. `python tools/kiem_tra.py --nhanh`: Không có lỗi. `kiem_van.py`: 0 ĐỎ.
- Trình duyệt gói Plus: hai tích loại trừ nhau, bỏ cả hai được; lưu CHI26 tích phân bổ thì danh sách hiện đúng; phiếu chi mới lý do CHI26, CHI35 hiện nhắc tạo thẻ, CHI22 không.

## Dở dang, việc tiếp theo

- Điện thoại chờ Trum xong T552: `MDanhMuc.tsx` thêm tích Chi phí phân bổ nhiều kỳ (đang có ghi đè Là chi phí riêng, T353); `MLapPhieu.tsx` (`TEN_LY_CHO_PHAN_BO`), `MDtThuChiLap.tsx` (`laLyChoPb`) đổi sang `laLyPhanBo`.
- Báo cáo chi phí (`LY_CHI_PHI`, `home/chiPhiPhieu.ts`) vẫn đọc tích Là chi phí từ dữ liệu mẫu, chưa theo tích đã sửa trong phiên.
- Commit chỉ nằm trên máy, chưa push: người dùng dặn khi nào bảo mới push.
- `tools/xuat_bao_cao_he_thong.py` lỗi thiếu module `build_present`, chưa làm mới báo cáo Excel.

## Bẫy, quyết định mới

- QD90 trong `docs/QUYET-DINH.md`.
