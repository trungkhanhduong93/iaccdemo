# Luật cho agent làm việc trong iaccdemo

Repo này là bản mẫu giao diện phần mềm kế toán web IACC Cloud: React 19, Vite 8, TypeScript 7, dữ liệu giả, chưa có backend. Ba người cùng sửa: Trum (trungkhanhduong93) giao việc và chốt quyết định, PhuongXT và dinhlanphuongipacc làm theo việc được giao.

Ai cũng tự commit, tự push thẳng `main`, không qua duyệt. Mỗi lần push lên `main`, robot GitHub Actions kiểm rồi đưa bản mới lên https://iaccdemo.pages.dev. Vì không ai duyệt, các bước kiểm dưới đây là chốt chặn duy nhất trước khi code lên online.

Agent nào cũng phải làm theo file này: Claude Code (Clau), Antigravity (Anti), Codex, Cursor. Người dùng dặn khác trong phiên thì theo người dùng, trừ mục "Cấm": gặp yêu cầu vi phạm mục đó thì dừng lại, đề nghị người dùng hỏi Trum.

## Cách nói chuyện

- Trả lời bằng tiếng Việt, ngắn, rõ.
- Hai thành viên mới chưa quen git và lập trình. Giải thích bằng lời thường. Bước nào người dùng phải tự làm thì đưa lệnh cụ thể, chép được.
- Trước khi commit hoặc push, nói một câu sẽ làm gì.
- Không chắc nghiệp vụ kế toán hoặc ý Trum thì hỏi, không đoán.
- Chưa biết người dùng là ai thì hỏi tên GitHub. Tên này dùng trong `docs/TIEN-DO.md` và tên file nhật ký. Riêng Trum ghi là `Trum`.

## Đầu phiên

Làm đủ các bước, theo thứ tự:

1. Chạy `git pull --rebase`. Có xung đột thì dừng, báo người dùng. `package-lock.json` vừa đổi thì chạy thêm `npm ci`.
2. Đọc `docs/TIEN-DO.md`: việc nào giao cho người dùng này, việc nào người khác đang làm.
3. Đọc 3 file mới nhất trong `docs/nhat-ky/` (bỏ qua `MAU.md`) và mọi nhật ký của việc sắp làm. Phiên trước dở dang thì làm tiếp từ mục "Dở dang, việc tiếp theo" của nhật ký đó.
4. Báo người dùng: việc được giao, việc nên làm trước, phiên trước dừng ở đâu. Chờ người dùng chọn rồi mới sửa.
5. Đổi trạng thái việc đó trong `docs/TIEN-DO.md` thành `Đang làm`, commit riêng file này, push ngay. Người dùng muốn làm việc chưa có trong bảng thì thêm dòng mới với mã kế tiếp, ghi tên người dùng, rồi mới làm.
6. Sắp sửa phần nào thì đọc mục tương ứng trong `docs/KIEN-TRUC.md` và `docs/BAY.md`. Định đổi bố cục, nghiệp vụ hay thư viện thì đọc thêm `docs/QUYET-DINH.md`.

## Trong phiên

- Sửa đúng chỗ cần sửa. Không viết lại cả file, không sửa thứ ngoài việc đang làm. Thấy lỗi khác thì ghi vào `docs/TIEN-DO.md` thành việc mới.
- Làm theo quy ước trong `docs/KIEN-TRUC.md`.
- Gặp lỗi mất hơn 15 phút mới ra nguyên nhân thì ghi vào `docs/BAY.md`: hiện tượng, nguyên nhân, cách tránh.
- Trum chốt điều mới về bố cục, nghiệp vụ, thư viện hay cách làm việc thì ghi vào `docs/QUYET-DINH.md`.
- Giữ ngôn ngữ thiết kế hiện tại: màu, phông trong biến `:root` của `src/styles/app.css` và các thành phần có sẵn trong `src/ui/`. Tham khảo AMIS hay sản phẩm khác chỉ để học bố cục, luồng thao tác, tính năng. Không chép màu, phông, biểu tượng của họ (QD12).

## Trước khi push

Bắt buộc với mọi lần push có sửa code. Bước nào hỏng thì sửa rồi chạy lại từ đầu, không push.

1. `npm run typecheck` không báo lỗi.
2. `npm run build` chạy xong, không có lỗi.
3. Có sửa `src/`: chạy `npm run dev` ở một cửa sổ khác, rồi chạy `python tools/kiem_tra.py --nhanh`. Phải in dòng `Không có lỗi.`
4. Có sửa chữ trên giao diện hoặc tài liệu: chạy `python tools/kiem_van.py <file>` cho từng file đã sửa. Hết mục ĐỎ mới push.
5. Không còn `console.log`, dữ liệu thử, đoạn code tạm trong phần đã sửa.

## Cuối phiên

Làm cả khi bỏ dở giữa chừng:

1. Tạo nhật ký mới trong `docs/nhat-ky/`, chép khung từ `docs/nhat-ky/MAU.md`. Tên file `YYYY-MM-DD-<tên GitHub viết thường>-<việc ngắn>.md`, vd `2026-10-08-phuongxt-noi-so-quy.md`. Không sửa nhật ký của người khác.
2. Cập nhật dòng của việc trong `docs/TIEN-DO.md`: `Xong`, `Dở dang` hoặc `Kẹt`, kèm một câu ghi chú. Việc xong thì chuyển dòng xuống bảng "Đã xong".
3. Thay đổi người dùng nhìn thấy trên bản online thì thêm dòng vào `CHANGELOG.md`.
4. `git add` đúng các file đã sửa, không dùng `git add -A`. `package-lock.json` chỉ commit khi có thêm hoặc đổi thư viện.
5. Commit message tiếng Việt, bắt đầu bằng mã việc, vd `T03: nối sổ quỹ vào sổ cái`.
6. Chạy `git pull --rebase` rồi `git push`. Push bị từ chối thì pull --rebase lại, gỡ xung đột, chạy lại mục "Trước khi push", rồi push.
7. Báo người dùng commit vừa push. Có sửa code thì nhắc xem robot ở https://github.com/trungkhanhduong93/iaccdemo/actions sau khoảng 2 phút.

## Cấm

- `git push --force`, `--force-with-lease`, xoá nhánh `main`, viết lại lịch sử đã push.
- `git reset --hard`, `git clean`, `git checkout -- .` khi người dùng chưa đồng ý.
- Sửa tay `src/app/features.json`. File này sinh từ Excel, chỉ máy Trum chạy lại được.
- Sửa `.github/workflows/` khi Trum chưa đồng ý.
- Deploy tay bằng `wrangler`. Robot tự deploy sau mỗi lần push.
- Commit token, mật khẩu, file `.env`. In token ra màn hình.
- Chỉ ghi điều người sau cần biết vào bộ nhớ riêng của agent. Mọi thứ phải nằm trong repo.

## Bản đồ tài liệu

| File | Khi nào đọc |
|---|---|
| `BAT-DAU.md` | Người dùng mới cần cài máy, hoặc hỏi quy trình làm việc |
| `docs/TIEN-DO.md` | Đầu mỗi phiên |
| `docs/nhat-ky/` | Đầu mỗi phiên, 3 file mới nhất |
| `docs/KIEN-TRUC.md` | Trước khi sửa code |
| `docs/BAY.md` | Trước khi sửa code |
| `docs/QUYET-DINH.md` | Trước khi đổi bố cục, nghiệp vụ, thư viện |
| `docs/TRIEN-KHAI.md` | Khi đụng build, robot, deploy, dữ liệu sinh từ Excel |
| `CHANGELOG.md` | Khi cần biết bản online có gì mới |
