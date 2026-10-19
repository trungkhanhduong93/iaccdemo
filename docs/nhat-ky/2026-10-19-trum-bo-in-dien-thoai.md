# Điện thoại bỏ in chứng từ, đổi chữ Hiệu quả kinh doanh 13 tháng (T488)

- Ngày: 19/10/2026
- Người: Trum, agent: Claude Code điều phối, Antigravity (làn Windows) sửa code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/ui/mobile/MXemPhieu.tsx`: bỏ nút chính "In phiếu" khi phiếu đã ghi sổ (còn nút "Bỏ ghi sổ"), bỏ mục "In chứng từ" ở menu ba chấm, bỏ hàm `thucHienIn`, state `phieuIn` và hộp `HopInChungTu`.
- `src/ui/generic/ChungTuForm.tsx`: thêm prop `anIn`, có prop thì không hiện nút In. `src/ui/mobile/MChungTu.tsx` truyền `anIn`. Web không truyền nên vẫn in được.
- `src/ui/mobile/MTrangChuFree.tsx`: nút "Xem biểu đồ lãi lỗ 13 tháng" đổi thành "Xem hiệu quả kinh doanh 13 tháng".
- `src/modules/home/BaBaiToanFree.tsx`: hộp `HopLaiLo13` đổi tiêu đề và aria-label sang "Hiệu quả kinh doanh 13 tháng". Kiểu xem theo cửa hàng giữ chữ "Lãi lỗ theo cửa hàng".
- `tools/kiem_tra.py`: kiểm T274 điện thoại tìm nút theo chữ mới.
- `CHANGELOG.md`: thêm dòng T488.

## Đã kiểm

- `npm run typecheck`, `npm run build`: chạy xong, không lỗi.
- `python tools/kiem_tra.py --nhanh`: "Không có lỗi."
- `python tools/kiem_van.py` cho `MTrangChuFree.tsx`, `CHANGELOG.md`: 0 ĐỎ.
- Antigravity kiểm bằng Playwright: máy tính còn nút In ở form chứng từ; khổ 390x844 không còn nút In ở form, xem phiếu và menu ba chấm.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- Không.
