# Người sử dụng bỏ phân quyền kho (T810)

- Ngày: 12/11/2026
- Người: Trum, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/modules/he-thong/HeThong.tsx`: bỏ ô Kho khỏi `CAU_HINH_NGUOI_DUNG`, bỏ `kho` ở dòng mới, xoá hằng `KHO_DS` không còn dùng. Khối Thông tin hệ thống bỏ 4 ô Người tạo, Ngày tạo, Người cập nhật, Ngày cập nhật, chỉ còn Đăng nhập gần nhất (giữ cách T809 làm). Bốn cột này ở danh sách bỏ `an: true`, hiện sẵn. Ghi chú dưới bảng bỏ chữ "kho".
- `src/modules/he-thong/huong-dan.ts`: bỏ chữ "kho" ở hướng dẫn màn Người sử dụng, Vai trò và phân quyền.
- `docs/QUYET-DINH.md`: thêm QD110.

## Đã kiểm

- `npm run typecheck`: không lỗi.
- `npm run build`: chạy xong, không lỗi.
- `python tools/kiem_tra.py --nhanh`: Không có lỗi.

## Dở dang, việc tiếp theo

- Không.
- Dữ liệu mẫu `NGUOI_DUNG` trong `src/data/mock` vẫn có trường `kho`, không hiện ở đâu. Hằng `PHAM_VI_DS` trong `HeThong.tsx` đã không dùng từ trước, chưa xoá vì ngoài việc này.
