# Favicon bo tròn góc, khung xanh (T808)

- Ngày: 12/11/2026
- Người: Trum, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `public/favicon.png`: dựng lại từ `D:\IACC-CLOUD\gitbook-docs\icon accounting_Final.png`. Vẽ ở 256×256: khung xanh `#0560A6` (cùng màu dải iPOS.VN) dày 6px (lần đầu 12px, Trum chê dày), bo góc 56px, ảnh gốc đặt bên trong bo góc 50px. Thu về 64×64.
- `index.html`: đường dẫn favicon đổi `?v=2` thành `?v=4` để trình duyệt bỏ bản cũ.

## Đã kiểm

- `npm run build`: chạy xong, không lỗi.
- Xem ảnh 256×256: góc trong suốt, khung liền, không vệt sáng ở đáy.
- Không chạy `kiem_tra.py` vì không sửa `src/`.

## Dở dang, việc tiếp theo

- Không.
- Bẫy nhỏ: ảnh nguồn lúc làm T806 là 300×301, nay là 300×300. Cắt cứng `(0,1,300,301)` sẽ dư 1 hàng trong suốt ở đáy. Cắt theo cạnh ngắn của ảnh thật.
