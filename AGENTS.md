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

Mỗi phiên agent làm trong một bản clone riêng của repo, không dùng chung thư mục với phiên khác, kể cả trên cùng máy (QD21). Hai phiên chung một thư mục thì commit lẫn vào nhau, `git push` của phiên này đẩy luôn việc dở của phiên kia. Tạo bản riêng: `git clone https://github.com/trungkhanhduong93/iaccdemo D:\IACC-CLOUD\Web-<tên phiên>`. Cổng 5180 cố định, nên trên một máy mỗi lúc chỉ một bản chạy `npm run dev`: bản kia chờ tới lượt mới chạy `kiem_tra.py`.

Làm đủ các bước, theo thứ tự:

1. Chạy `git pull --rebase`. Có xung đột thì dừng, báo người dùng. `package-lock.json` vừa đổi thì chạy thêm `npm ci`.
2. Đọc `docs/TIEN-DO.md`: việc nào giao cho người dùng này, việc nào người khác đang làm.
3. Đọc 3 file mới nhất trong `docs/nhat-ky/` (bỏ qua `MAU.md`) và mọi nhật ký của việc sắp làm. Phiên trước dở dang thì làm tiếp từ mục "Dở dang, việc tiếp theo" của nhật ký đó.
4. Báo người dùng: việc được giao, việc nên làm trước, phiên trước dừng ở đâu. Chờ người dùng chọn rồi mới sửa.
5. Đổi trạng thái việc đó trong `docs/TIEN-DO.md` thành `Đang làm`, commit riêng file này, push ngay (làm mục "Ngay trước lệnh git push" trước). Người dùng muốn làm việc chưa có trong bảng thì thêm dòng mới với mã kế tiếp, ghi tên người dùng, rồi mới làm (QD21):
   - Lấy mã kế tiếp sau `git fetch origin` và đọc `docs/TIEN-DO.md` trên `origin/main`, không đọc bản trên máy.
   - Ghi vào cột Ghi chú các file dùng chung sẽ sửa, nhất là `VoucherScreen.tsx`, `ChungTuForm.tsx`, `app.css`. Thấy việc khác đang ghi cùng file thì hỏi người đó trước.
   - Việc có thể sinh quyết định mới thì giữ chỗ ngay trong commit này: thêm dòng `## QDxx. <tên> (đang soạn)` cuối `docs/QUYET-DINH.md`.
   - Commit nhận việc chỉ sửa `docs/TIEN-DO.md`, `docs/QUYET-DINH.md`. Push ngay kể cả khi người dùng dặn chỉ push khi được bảo.
6. Sắp sửa phần nào thì đọc mục tương ứng trong `docs/KIEN-TRUC.md` và `docs/BAY.md`. Định đổi bố cục, nghiệp vụ hay thư viện thì đọc thêm `docs/QUYET-DINH.md`.

## Trong phiên

- Sửa đúng chỗ cần sửa. Không viết lại cả file, không sửa thứ ngoài việc đang làm. Thấy lỗi khác thì ghi vào `docs/TIEN-DO.md` thành việc mới.
- Làm theo quy ước trong `docs/KIEN-TRUC.md`.
- Gặp lỗi mất hơn 15 phút mới ra nguyên nhân thì ghi vào `docs/BAY.md`: hiện tượng, nguyên nhân, cách tránh.
- Trum chốt điều mới về bố cục, nghiệp vụ, thư viện hay cách làm việc thì ghi vào `docs/QUYET-DINH.md`.
- Thêm CSS mới thì gom vào một mục riêng ở cuối `src/styles/app.css`, tiêu đề có mã việc, vd `/* ── Thanh lọc theo iFaster (T34) ── */`. Hai việc cùng thêm cuối file thì gộp bằng cách giữ cả hai mục.
- Giữ ngôn ngữ thiết kế hiện tại: màu, phông trong biến `:root` của `src/styles/app.css` và các thành phần có sẵn trong `src/ui/`. Tham khảo AMIS hay sản phẩm khác chỉ để học bố cục, luồng thao tác, tính năng. Không chép màu, phông, biểu tượng của họ (QD12).

## Trước khi push

Bắt buộc với mọi lần push có sửa code. Bước nào hỏng thì sửa rồi chạy lại từ đầu, không push.

1. `npm run typecheck` không báo lỗi.
2. `npm run build` chạy xong, không có lỗi.
3. Có sửa `src/`: chạy `npm run dev` ở một cửa sổ khác, rồi chạy `python tools/kiem_tra.py --nhanh`. Phải in dòng `Không có lỗi.`
4. Có sửa chữ trên giao diện hoặc tài liệu: chạy `python tools/kiem_van.py <file>` cho từng file đã sửa. Hết mục ĐỎ mới push.
5. Không còn `console.log`, dữ liệu thử, đoạn code tạm trong phần đã sửa.

## Ngay trước lệnh git push

Bắt buộc với mọi lần push, kể cả push chỉ sửa tài liệu (QD16). Ba người cùng push thẳng `main`, nên bản trên GitHub có thể đã mới hơn bản trên máy.

1. Chạy `git fetch origin`.
2. Chạy `git log --format="%h %an %s" HEAD..origin/main`. Không in dòng nào thì push được.
3. Có dòng nào thì chưa push. Báo người dùng: có mấy commit mới, của ai, việc gì (mã việc ở đầu commit). Nói rõ phải lấy bản mới về trước.
4. Chạy `git diff --name-only HEAD...origin/main` để xem người khác sửa file nào. Ghi lại danh sách này.
5. Chạy `git pull --rebase`. Máy còn file sửa chưa commit thì lệnh báo lỗi: hỏi người dùng commit luôn hay cất tạm bằng `git stash`. Xung đột thì dừng, báo người dùng, không tự chọn bên nào.
6. Danh sách ở bước 4 có file ngoài `.md` thì chạy lại mục "Trước khi push" trên bản vừa lấy về. Có `package-lock.json` thì chạy `npm ci` trước.
7. Quay lại bước 1. Hết commit mới mới chạy `git push`.
8. Push bị từ chối vì có người vừa push chen thì quay lại bước 1.

## Cuối phiên

Làm cả khi bỏ dở giữa chừng:

1. Tạo nhật ký mới trong `docs/nhat-ky/`, chép khung từ `docs/nhat-ky/MAU.md`. Tên file `YYYY-MM-DD-<tên GitHub viết thường>-<việc ngắn>.md`, vd `2026-10-08-phuongxt-noi-so-quy.md`. Không sửa nhật ký của người khác.
2. Cập nhật dòng của việc trong `docs/TIEN-DO.md`: `Xong`, `Dở dang` hoặc `Kẹt`, kèm một câu ghi chú. Việc xong thì chuyển dòng xuống bảng "Đã xong".
3. Chạy `python tools/xuat_bao_cao_he_thong.py` để tự động làm mới `docs/IACC-Cloud-Chi-Tiet-He-Thong.xlsx` trên repo. File này ghi nhận đầy đủ tính năng, đặc tả màn hình, mẫu in và tiến độ việc. Khi repo hoàn thiện hoặc khi ai trong 3 người cần lấy report tải về, agent xuất bản mới nhất cho người đó.
4. Thay đổi người dùng nhìn thấy trên bản online thì thêm dòng vào `CHANGELOG.md`.
5. `git add` đúng các file đã sửa, bao gồm `docs/IACC-Cloud-Chi-Tiet-He-Thong.xlsx`, không dùng `git add -A`. `package-lock.json` chỉ commit khi có thêm hoặc đổi thư viện.
6. Commit message tiếng Việt, bắt đầu bằng mã việc, vd `T03: nối sổ quỹ vào sổ cái`.
7. Làm mục "Ngay trước lệnh git push", rồi `git push`.
8. Báo người dùng commit vừa push. Có sửa code thì nhắc xem robot ở https://github.com/trungkhanhduong93/iaccdemo/actions sau khoảng 2 phút.

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
| `docs/IACC-Cloud-Chi-Tiet-He-Thong.xlsx` | Báo cáo chi tiết toàn bộ tính năng, màn hình, mẫu in, tiến độ task |
| `CHANGELOG.md` | Khi cần biết bản online có gì mới |
