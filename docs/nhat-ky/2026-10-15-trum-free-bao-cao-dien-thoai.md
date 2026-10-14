# Trang chủ Free và báo cáo dạng dòng trên điện thoại (T240, T241, gộp T234)

- Ngày: 14 và 15/10/2026
- Người: Trum, agent: Claude Code điều phối và kiểm, Antigravity WSL (Anti B) code T240, T241, Antigravity Windows (Anti A) khảo sát, gộp, chạy kiểm, xem ảnh
- Trạng thái cuối phiên: T240 Xong, T241 Xong, T234 Xong (gộp vào T240)

## Đã làm

T240, trang chủ điện thoại gói Free giống bản web:

- `src/ui/mobile/MTrangChu.tsx`: gói Free hiện ba bài toán như `BaBaiToanFree` bản web, có chọn tháng, nút Tạo quỹ (T245), thẻ Chi phí NVL dẫn tới màn `chi-phi-nvl` hiện có. Gói khác giữ nguyên.
- `src/ui/mobile/MChiPhiThang.tsx`, `MLichSuQuy.tsx` (mới): bản điện thoại của Chi phí trong tháng, Lịch sử thu chi; Lịch sử thu chi có chip lọc Tất cả, Khoản thu, Khoản chi (T246). Map trong `manMobile.ts`. Hết lỗi T234.

T241, báo cáo điện thoại dạng dòng:

- Anti A khảo sát 33 màn báo cáo, 22 màn còn bảng web cuộn ngang hoặc tờ A4 thu nhỏ.
- `src/ui/mobile/MBaoCaoDong.tsx` (mới): ba khuôn. Khuôn 1 chi tiết theo ngày (3.2.6, 3.2.8, 4.2.1, 4.2.6, 4.2.7, 5.2.1, 5.2.10, 5.2.12). Khuôn 2 tổng hợp theo đối tượng, thẻ 2 tầng (2.2.8, 3.2.7, 3.2.9, 4.2.2, 4.2.3, 5.2.3, 5.2.9, 5.2.11, 10.4.3). Khuôn 3 chỉ tiêu phân cấp (2.2.9, 10.2.3 gói F). Dòng tổng của khuôn 3 khai theo mã màn trong `BANG_TONG_KHUON_3`.
- `MSoBaoCao.tsx`: các màn trên mặc định dạng dòng, chip Bảng vẫn còn. `MToGiay.tsx`: 5.2.1, 5.2.3, 10.2.3 gói F mặc định dạng dòng, nút Xem mẫu in mở lại tờ A4.
- `tools/kiem_tra.py`: `kiem_tra_dot_19_b`, `kiem_tra_dot_20_b`; bước đo tốc độ chấp nhận lớp `m-bcd-item`.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_tra.py --nhanh` (cổng 5181): `Không có lỗi.`
- `--dien-thoai`: còn 1 lỗi thuộc màn Chi phí NVL chưa có bản điện thoại (T242 của PhuongXT).
- Số trang chủ Free điện thoại khớp bản web, tháng 10, tất cả chi nhánh: lãi lỗ 51.957.923, thu 699,3 tr, chi 503,1 tr.
- Tổng dạng dòng khớp tổng ở chip Bảng với 3.2.8, 3.2.9, 5.2.3, 2.2.9, 10.2.3.
- Claude tự đo màn 2.2.9: dòng tổng ghi Đầu kỳ 1,7 tỷ, Dòng thuần −178,4 tr, Cuối kỳ 1,6 tỷ.

## Dở dang, việc tiếp theo

- T242: bản điện thoại màn Chi phí NVL.
- 10.2.3 gói PR vẫn khoá chờ mẫu TT99 (T229).
- Chưa thử trên điện thoại thật.

## Bẫy, quyết định mới

- `rutGonSo` lấy trị tuyệt đối, nên số âm mất dấu. Khuôn 3 lúc đầu ghi Dòng thuần +178,4 tr, nhìn như đầu kỳ cộng thuần không ra cuối kỳ. Đã sửa: số âm ghi dấu − và tô màu chi. Dùng `rutGonSo` cho số có thể âm thì tự thêm dấu.
- Đoán dòng tổng theo chữ trong tên chỉ tiêu dễ bắt nhầm dòng. Khai dòng tổng theo mã màn.
- PhuongXT đổi bản web gói Free trong lúc làm (T232, T245, T246). Sau khi rebase đã so lại bản điện thoại với bản web mới.
