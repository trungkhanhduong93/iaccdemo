# Gói Free ẩn tạm 5 báo cáo (T251)

- Ngày: 15/10/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/app/plan.ts`: bỏ gói Free khỏi Tổng hợp quỹ tiền (2.2.8), Báo cáo dòng tiền (2.2.9), Mua hàng theo ngày (4.2.6), Sổ chi phí (10.4.3) trong `BO_SUNG` và Tổng hợp mua hàng theo NCC (4.2.2) trong `THEO_ROADMAP`. Gói Free ẩn màn ngoài gói (`anNgoaiGoi`), nên 5 báo cáo không còn trong danh sách. Gói Standard, Plus, Pro giữ nguyên.
- Nút ở trang chủ trỏ tới các báo cáo này (`layLinkBaoCao`) tự ẩn khi báo cáo không mở được, không phải sửa thêm.

## Đã kiểm

- `npm run typecheck`: không lỗi. `npm run build`: chạy xong.
- `python tools/kiem_tra.py --nhanh`: `Không có lỗi.` Các bài kiểm 5 báo cáo này trong `kiem_tra.py` chạy ở gói Pro nên không ảnh hưởng.
- Bản dev: gói Free trang Báo cáo không còn 5 báo cáo, trang chủ không lỗi; gói Plus vẫn đủ. Đã trả phiên về Phố Mây gói Plus.
- Chưa làm mới `docs/IACC-Cloud-Chi-Tiet-He-Thong.xlsx`: script cần file Excel nguồn chỉ có trên máy Trum.

## Dở dang, việc tiếp theo

- Không. Mở lại cho gói Free thì thêm `'F'` vào 5 mã trên trong `plan.ts` (dòng có chú thích T251).

## Bẫy, quyết định mới

- Không.
