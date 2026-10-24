# Danh sách Thu chi điện thoại gọn theo Lịch sử thu chi (T652)

- Ngày: 24/10/2026
- Người: Trum, agent: Claude Code (phiên trên máy chủ claude.ai)
- Trạng thái cuối phiên: Xong

## Đã làm

- Vẽ 2 mẫu trên artifact https://claude.ai/artifact/5qmgxtmQshquFoxZdqiet1. Trum chọn mẫu A, giữ từ hàng bộ lọc trở lên như cũ, bỏ khoảng ngày cạnh "53 chứng từ".
- `src/ui/mobile/MDtThuChiDs.tsx`: thêm class `m-t652` ở khung màn, bỏ khoảng ngày trong thẻ tổng, thay khối danh sách theo ngày bằng thẻ trắng mỗi ngày. Mỗi dòng có diễn giải, số tiền, số phiếu · đối tượng · FABi, quỹ (bảng `QUY_THEO_LOAI`). Bỏ vòng tròn mũi tên.
- Dòng chứng từ giữ class `m-ds-ngay-dong`, số phiếu giữ `m-ds-ngay-so` vì `tools/kiem_tra.py` tìm theo 2 class này.
- `src/styles/app.css`: mục cuối file "Danh sách Thu chi điện thoại gọn theo Lịch sử thu chi, mẫu A (T652)", mọi luật nằm dưới `.m-t652`.
- `docs/QUYET-DINH.md`: QD82.

## Đã kiểm

- `npm run typecheck`: không lỗi.
- `npm run build`: chạy xong, không lỗi.
- `python tools/kiem_tra.py --nhanh`: "Không có lỗi."
- `python tools/kiem_tra.py --dien-thoai`: qua phần bề rộng 375, 390, 440 và danh sách Thu chi (69 thẻ). Lệnh dừng ở "Kiểm tra lập phiếu đợt 5" vì không thấy `.m-xp-nut-menu`. Code trước T652 cũng dừng y như vậy, là lỗi cũ T525.
- Chụp 1 ảnh màn 390px, so khớp mẫu A.
- Chưa chạy được `python tools/xuat_bao_cao_he_thong.py`: lệnh cần `../Present/tools/build_present.py`, thư mục này chỉ có trên máy Trum. File `docs/IACC-Cloud-Chi-Tiet-He-Thong.xlsx` chưa làm mới, lần chạy sau trên máy Trum sẽ cập nhật.

## Dở dang, việc tiếp theo

- Không.
- Phiên trên máy chủ claude.ai muốn chạy `kiem_tra.py` phải làm thêm 3 bước: `pip install --break-system-packages playwright==<bản Playwright của Node>`, tạo symlink `/opt/google/chrome/chrome` trỏ tới `/opt/pw-browsers/chromium`, đặt `PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers`.

## Bẫy, quyết định mới

- QD82 trong `docs/QUYET-DINH.md`. Không ghi bẫy mới.
