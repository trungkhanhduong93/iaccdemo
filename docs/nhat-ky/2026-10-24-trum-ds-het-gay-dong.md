# Danh sách chứng từ điện thoại hết gãy dòng, cỡ chữ mức 2 (T654)

- Ngày: 24/10/2026
- Người: Trum, agent: Claude Code (phiên trên máy chủ claude.ai)
- Trạng thái cuối phiên: Xong

## Đã làm

- Vẽ Đợt 3 trên artifact https://claude.ai/artifact/5qmgxtmQshquFoxZdqiet1: 2 mức cỡ chữ ở khung 360×800, mỗi mức có Thu chi, Thu chi cuộn xuống (để thấy dòng FABi), Mua hàng, Xuất bán POS. Số liệu đọc từ app gói S. Trum chọn mức 2.
- `src/ui/mobile/MDtThuChiDs.tsx`: dòng trên chỉ còn số phiếu và nhãn FABi; dòng dưới ghi "quỹ · đối tượng".
- `src/styles/app.css`: thêm mục T654 cuối file. Ghi đè cỡ chữ `.m-mh-dong-so`, `.m-mh-dong-hh`, `.m-mh-dong-ncc`, `.m-mh-dong-tien`, `.m-the-hang-tien`, `.m-the-hang-sl`, `.m-mh-nhom-ngay`, `.m-mh-nhom-tong`, `.m-t653-ngay-dem`. Số phiếu không xuống dòng (thiếu chỗ thì "…"), nhãn không xuống dòng. Ô Tổng thu, Tổng chi số tiền một dòng, màn dưới 390px hạ 14.5px và lề trong ô 8px.
- Thêm `.m-the-hang-tien` (số tiền Xuất bán POS, 14.5px) vào danh sách ghi đè dù việc giao không ghi, để POS cùng cỡ số tiền 13.5px như bản vẽ.
- `docs/QUYET-DINH.md`: QD84, thay phần cỡ chữ và dòng thu chi của QD83.

## Đã kiểm

- Đo dòng gãy (phần tử con của `.m-mh-dong-hang1` hoặc `.m-mh-dong-so` cao quá 24px) bằng Playwright Node. Trước khi sửa, Thu chi gãy 24/9/5 dòng ở 360/375/390px. Sau khi sửa, cả 6 danh sách gãy 0 dòng ở cả 3 bề rộng. Số dòng đã đo: Thu chi 53 dòng, Mua hàng 22, Xuất bán POS 600 dòng đầu (gói S), Kiểm kê 6, Nhập khác 6, Xuất khác 4 (gói PR). Không số phiếu nào bị cắt "…".
- Ô Tổng thu, Tổng chi: trước khi sửa gãy ở 360px và 375px. Sau khi sửa một dòng ở cả 3 bề rộng. Ở 390px số tiền 16px vừa khít ô, chỉ dư khoảng 1px.
- `npm run typecheck`: không lỗi.
- `npm run build`: chạy xong, không lỗi.
- `python tools/kiem_tra.py --nhanh`: "Không có lỗi."
- `python tools/kiem_tra.py --dien-thoai`: qua phần 3 bề rộng và các màn danh sách đợt 3, 4. Lệnh dừng ở "Kiểm tra lập phiếu đợt 5", lỗi cũ T525.
- Chưa chạy được `python tools/xuat_bao_cao_he_thong.py` vì thiếu `../Present/tools` (`build_present`), như phiên T652, T653. File `docs/IACC-Cloud-Chi-Tiet-He-Thong.xlsx` chưa làm mới, lần chạy sau trên máy Trum sẽ cập nhật.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- QD84 trong `docs/QUYET-DINH.md`. Không ghi bẫy mới.
