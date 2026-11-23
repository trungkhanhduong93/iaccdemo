# Kho gói Plus gom tab Điều chuyển (T912)

- Ngày: 24/11/2026
- Người: dinhlanphuongipacc, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/modules/kho/index.ts`: gói Plus, tab Xuất điều chuyển đổi nhãn thành Điều chuyển (`nganGoi`). Nhập điều chuyển không còn tab riêng, mở màn này thì tab Điều chuyển sáng (`tabChaGoi`). Bỏ `5-1-4-2` khỏi `xepTab` gói Plus. Hai tab con Xuất, Nhập điều chuyển giữ như T721.
- Gói Pro giữ ba tab Xuất điều chuyển, Nhập điều chuyển, Xuất chuyển kho, vì gói Pro không có tab con.

## Đã kiểm

- `npm run typecheck`: không lỗi.
- `npm run build`: chạy xong, không lỗi.
- `python tools/kiem_tra.py --nhanh`: in "Không có lỗi."
- `python tools/kiem_van.py src/modules/kho/index.ts`: sạch.
- Mở `#/app/kho/5-1-4-2` gói Plus trên trình duyệt: thanh tab Quy trình, Tồn kho ban đầu, Nhập kho, Điều chuyển (sáng), Xuất huỷ, Khác, Báo cáo; tab con Xuất, Nhập điều chuyển.

## Dở dang, việc tiếp theo

- Không.
- Lúc đầu việc này lấy mã T909, trùng với việc báo cáo Tổng hợp mua hàng theo hàng hoá làm song song cùng thư mục, nên đổi sang T910; phiên mua hàng lại push việc đó với mã T910, việc này lấy T911; Trum lại nhận T911 cho việc khác, nên lấy T912.
- Chưa làm mới `docs/IACC-Cloud-Chi-Tiet-He-Thong.xlsx`: máy này thiếu thư mục `Present` mà `tools/xuat_bao_cao_he_thong.py` cần.

## Bẫy, quyết định mới

- Không.
