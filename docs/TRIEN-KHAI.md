# Triển khai

Bản online được cập nhật thế nào, khoá Cloudflare của robot nằm đâu, và những script chỉ chạy được trên máy Trum.

## Chạy trên máy

```bash
npm ci                             # cài thư viện đúng bản trong package-lock.json
npm run dev                        # http://localhost:5180, cổng bận thì báo lỗi
npm run typecheck                  # tsc --noEmit
npm run build                      # ra dist/, mở được ở thư mục bất kỳ vì base './' và HashRouter
python tools/kiem_tra.py           # mở thử mọi màn ở 4 gói, chụp ảnh vào tools/shots/; cần npm run dev đang chạy và Chrome
python tools/kiem_tra.py --nhanh   # chỉ gói Medium, không chụp ảnh
python tools/kiem_van.py <file>    # soát chữ tiếng Việt; file .tsx thêm --loai giao-dien
```

## Robot tự kiểm và deploy

Robot nằm ở `.github/workflows/deploy.yml`. Nó kiểm code rồi đưa bản mới lên https://iaccdemo.pages.dev, không ai phải deploy tay.

- Robot chạy khi có push lên `main` chứa ít nhất một file không phải `.md`. Lần push chỉ sửa tài liệu thì robot không chạy.
- Muốn chạy lại bằng tay: vào tab Actions, chọn **Kiểm và đưa lên iaccdemo**, bấm **Run workflow**.
- Các bước: `npm ci`, `npm run typecheck`, `npm run build`, rồi `wrangler pages deploy dist --project-name iaccdemo --branch main`.
- Bước nào hỏng thì robot dừng, bản online giữ bản cũ. GitHub báo lỗi cho người push qua email hoặc chuông thông báo, tuỳ cài đặt của người đó.
- Nhiều lần push sát nhau thì robot chạy lần lượt. Lần nào đang chờ mà có lần mới hơn thì bỏ lần đang chờ, chỉ chạy lần mới nhất.
- Lần chạy đầu (07/10/2026, commit e59c251) mất 12 giây cho phần cài thư viện, kiểm và build. Bước deploy chưa đo vì chưa có token, ước thêm dưới 1 phút.
- Xem kết quả ở https://github.com/trungkhanhduong93/iaccdemo/actions.
- GitHub gói Free cho 2.000 phút chạy mỗi tháng với repo riêng tư.

Robot chỉ kiểm kiểu TypeScript và build. Nó không mở thử từng màn, nên lỗi trắng trang vẫn lọt lên online được. Vì vậy `AGENTS.md` bắt chạy `tools/kiem_tra.py --nhanh` trên máy trước khi push.

## Quay bản online về bản trước

Chỉ Trum làm được, vì cần đăng nhập Cloudflare.

1. Vào https://dash.cloudflare.com, chọn **Workers & Pages**, chọn **iaccdemo**, mở tab **Deployments**.
2. Ở bản cũ muốn quay về, bấm **...**, chọn **Rollback to this deployment**.
3. Sửa lỗi trên code rồi push. Robot đưa bản đã sửa lên, đè bản vừa quay về.

## Khoá Cloudflare cho robot

Robot cần hai secret trong GitHub, đặt ở https://github.com/trungkhanhduong93/iaccdemo/settings/secrets/actions.

| Secret | Là gì | Trạng thái |
|---|---|---|
| `CLOUDFLARE_ACCOUNT_ID` | Mã tài khoản Cloudflare của Trum, không phải bí mật | Đã đặt 07/10/2026 |
| `CLOUDFLARE_API_TOKEN` | Token có quyền Cloudflare Pages: Edit | Trum tạo, việc T01 |

Chưa có `CLOUDFLARE_API_TOKEN` thì robot vẫn kiểm và build, bỏ qua bước deploy, để lại một cảnh báo vàng.

Trum tạo token:

1. Mở https://dash.cloudflare.com/profile/api-tokens, bấm **Create Token**.
2. Ở dòng **Create Custom Token**, bấm **Get started**.
3. Ô **Token name** nhập `iaccdemo-github`.
4. Ô **Permissions** chọn lần lượt **Account**, **Cloudflare Pages**, **Edit**.
5. Ô **Account Resources** chọn **Include** và tài khoản của Trum.
6. Bấm **Continue to summary**, rồi **Create Token**. Bấm nút chép token. Trang này chỉ hiện token một lần.
7. Mở trang secret ở trên, bấm **New repository secret**. Ô **Name** nhập `CLOUDFLARE_API_TOKEN`, ô **Secret** dán token, bấm **Add secret**.
8. Vào tab Actions, chọn **Kiểm và đưa lên iaccdemo**, bấm **Run workflow**. Dòng mới có dấu tích xanh và bước "Đưa lên Cloudflare Pages" có chạy là xong.

Token bị lộ (dán vào chat, commit nhầm) thì vào trang API Tokens, ở dòng `iaccdemo-github` bấm **...**, chọn **Roll** để đổi token, rồi làm lại bước 7.

## Deploy tay khi robot hỏng

Chỉ Trum, trên máy đã đăng nhập wrangler:

```bash
npm run build
npx --yes wrangler@4 pages deploy dist --project-name iaccdemo --branch main --commit-dirty=true
```

Không truyền `--force` (chỉ dùng lúc tạo project). Wrangler hết phiên thì đăng nhập lại bằng `npx wrangler@4 login --device --scopes account:read user:read pages:write`.

Deploy tay xong phải push đúng code đó lên `main`. Nếu không, lần push sau của người khác sẽ làm robot đưa bản khác lên, đè mất bản vừa deploy.

## Cloudflare và GitHub

- Cloudflare Pages: project `iaccdemo`, kiểu tải thẳng (direct upload), không nối Git. Trang gắn `X-Robots-Tag: noindex` qua `public/_headers` để Google không lập chỉ mục. Ai có link vẫn xem được.
- Không đụng các project khác cùng tài khoản: `iacccloud-present`, `iacc-present`, `iposivt-present`.
- GitHub: repo riêng tư `trungkhanhduong93/iaccdemo`, gói Free. Gói này không khoá được nhánh `main`, nên ai có quyền ghi cũng push thẳng được, kể cả `push --force`. Luật cấm nằm trong `AGENTS.md`.

## Script chỉ chạy trên máy Trum

Hai script đọc file nằm ngoài repo, người khác chạy sẽ báo lỗi. Cần đổi tính năng hay logo thì nhắn Trum.

- `tools/xuat_tinh_nang.py` sinh `src/app/features.json` từ Excel tính năng. Script đọc qua `D:\IACC-CLOUD\Present\tools\build_present.py` để dùng chung các chỉnh gói (GOI_FIX, EXTRA, KHO_IVT, KHONG_IVT). Ra đúng 120 tính năng: Free 16, Starter 56, Medium 96, Advance 120.
- `tools/xuat_logo.py` sinh `src/assets/iacc-logo.webp` và `public/favicon.png` từ `D:\icon present\logo (2).png`, dùng lại hàm `iacc_logo()` của bộ trình chiếu. Hàm này tô trắng vòng giữa, vì ảnh gốc để trong suốt, đặt trên nền navy sẽ thành vòng tối. Component `ui/Logo.tsx` dùng logo ở thanh phân hệ, đăng nhập, chọn đơn vị, khởi tạo.

Bố cục cũ (thanh biểu tượng + menu dọc) còn ở `backup/src-truoc-amis-0710/` trên máy Trum, script kiểm cũ ở `backup/kiem_tra-truoc-amis.py`. Thư mục backup không lên GitHub. Lịch sử Git bắt đầu từ bố cục AMIS.
