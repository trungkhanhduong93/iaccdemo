# Điện thoại đợt 14: nghiệm thu, rà thông tin chứng từ, tư vấn thiết kế (T222, T223, T224)

- Ngày: 14/10/2026
- Người: Trum, agent: Claude Code điều phối, Antigravity (Anti A) code T222
- Trạng thái cuối phiên: T222, T224 Xong; T223 Dở dang (chờ Trum duyệt bảng)

## Đã làm

- `src/ui/format.ts`: `money()` thay `toLocaleString('vi-VN')` bằng regex chèn dấu chấm. CPU profile của Anti A: hàm này tốn 365 ms ở Chi tiết bán hàng, sau khi sửa còn 12,8 ms. Kết quả chuỗi giữ nguyên, kể cả số âm; `NaN` ra chuỗi rỗng.
- `src/ui/mobile/MTrangChu.tsx`: thẻ Hao hụt nguyên vật liệu sau thẻ Tỷ lệ chi phí nguyên vật liệu. Số lấy từ phiếu xuất huỷ (5.1.2-3) và phiếu xuất điều chỉnh theo kiểm kê tháng 10. Thẻ có tỷ lệ trên chi phí nguyên vật liệu, 3 mặt hàng hao hụt nhiều nhất, đổi theo chi nhánh.
- `src/ui/mobile/MTrangChu.tsx`: mục Chứng từ chưa ghi sổ ở tab Cần theo dõi, đếm phiếu trạng thái `nhap` ở mọi màn chứng từ mở được theo gói, lọc theo chi nhánh. Dòng phụ ghi số phiếu và số màn, không cộng tiền vì cộng chung thu, chi, mua, bán không có nghĩa. Bấm thì mở màn có nhiều phiếu chưa ghi sổ nhất với `?tt=nhap`.
- `src/ui/mobile/MChungTu.tsx`: danh sách đọc `?tt=` để bật sẵn chip trạng thái.
- `tools/kiem_tra.py`: `kiem_tra_dot_14_a()` (thẻ hao hụt đổi theo chi nhánh, mục chưa ghi sổ mở danh sách có chip bật), `kiem_tra_dot_14_toc_do()` (đo 20 báo cáo ở 390px, ghi `tools/shots/toc-do-bao-cao-390.txt`, in CHẬM khi quá 2 giây, tính lỗi khi quá 3 giây). Cả hai gọi trong `--dien-thoai`.
- `docs/tu-van-thiet-ke-dien-thoai.md`: bảng 10 nhóm thông tin chứng từ điện thoại thiếu so với web, 3 chỗ hiện sai, 8 điểm thiết kế, thứ tự làm. Ảnh trước và ảnh mẫu sau ở `docs/tu-van-anh/`.
- `docs/QUYET-DINH.md` QD57: trang chủ điện thoại không có thanh trên, 11.11 chỉ dùng máy tính.

## Đã kiểm

- `npm run typecheck`: không lỗi. `npm run build`: chạy xong, không lỗi.
- `python tools/kiem_tra.py --nhanh` và `--dien-thoai` (cổng 5181): đều in `Không có lỗi.`
- Tự đo lại 20 báo cáo ở 3 gói Pro, Plus, Free bằng script riêng, chờ tới khi bảng có ô dữ liệu: Chi tiết bán hàng 1.443 ms, 1.511 ms, 2.091 ms; các báo cáo khác dưới 750 ms. Profile lại Chi tiết bán hàng: không còn hàm JS nóng, khoảng 1 giây là trình duyệt dựng DOM.
- Bản máy tính và điện thoại đều chỉ mở 20 báo cáo, đúng danh sách iFaster của T185.
- Rà chứng từ: script mở 45 phiếu của 35 màn ở gói Plus và Pro, so nhãn trường điện thoại 390px với máy tính 1440px. Chưa rà màn lập phiếu.
- Xem ảnh `tools/shots/m-14-hao-hut.png`, `m-14-theo-doi.png`: thẻ hao hụt đủ số, top 3; chọn CN Lê Lợi thì mục chưa ghi sổ còn 43 phiếu ở 28 màn.

## Dở dang, việc tiếp theo

- T223: Trum duyệt bảng mục 1 và chọn điểm thiết kế ở mục 2 của `docs/tu-van-thiet-ke-dien-thoai.md`. Sau đó giao anti theo bảng "Thứ tự làm đề xuất". Trước khi làm mục 1.1 phải thêm tài khoản vào dữ liệu giả dòng thu chi: bản web bật Cột tài khoản ở PC2610-0250 ra "—".
- T229: Báo cáo kết quả kinh doanh 10.2.3 ở TT133 mở ra "Báo cáo chưa có mẫu", cả máy tính và điện thoại.
- Chi tiết bán hàng còn 1,2 đến 2,1 giây ở chế độ dev. Muốn nhanh hơn thì ảo hoá bảng của `MSoBaoCao`.
- Chưa thử trên điện thoại thật.

## Bẫy, quyết định mới

- QD57 trong `docs/QUYET-DINH.md`.
- Bước kiểm tốc độ không được coi màn `.lockpage` hay `.empty` là đã mở xong. Báo cáo lỗi mẫu cũng sẽ ra số mili giây rất nhỏ.
