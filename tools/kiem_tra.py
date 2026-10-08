"""Bấm hết sidebar, thanh tab, tab Báo cáo, ô trên sơ đồ Quy trình ở cả 4 gói; bắt lỗi console, trang trắng, tràn ngang;
kiểm form chứng từ mở toàn màn hình và đóng về đúng màn trước; kiểm báo cáo tài chính cân; chụp ảnh màn chính.

Chạy khi `npm run dev` đang mở ở cổng 5180:
    python tools/kiem_tra.py            # đủ 4 gói + ảnh chụp
    python tools/kiem_tra.py --nhanh    # chỉ gói Medium, không chụp ảnh
"""
import json
import sys
from pathlib import Path

from playwright.sync_api import sync_playwright

URL = 'http://localhost:5180/'
SHOTS = Path(__file__).resolve().parent / 'shots'
NHANH = '--nhanh' in sys.argv
GOIS = ['M'] if NHANH else ['F', 'S', 'M', 'A']


def phien(goi, role='ktt', thu_gon=False):
    return json.dumps(dict(loggedIn=True, ten='Trần Thu Hà', email='thuha@phomay.vn', role=role, donVi='pm', goi=goi, khoiTao=True, thuGon=thu_gon))


def main():
    loi, dem = [], 0
    with sync_playwright() as p:
        b = p.chromium.launch(channel='chrome')   # dùng Chrome đã cài trên máy, khỏi tải bản Playwright
        pg = b.new_page(viewport={'width': 1440, 'height': 900})
        con = []
        pg.on('console', lambda m: con.append(m.text) if m.type == 'error' else None)
        pg.on('pageerror', lambda e: con.append(str(e)))

        def vao(path, goi, thu_gon=False):
            pg.goto(URL + '#/dang-nhap')
            pg.wait_for_selector('.auth-box')     # đợi app ghi phiên mặc định xong rồi mới ghi đè
            pg.evaluate(f"localStorage.setItem('iacc-cloud-session', {json.dumps(phien(goi, thu_gon=thu_gon))})")
            # đổi query để trình duyệt tải lại hẳn trang; chỉ đổi hash thì app vẫn giữ phiên cũ trong bộ nhớ
            pg.goto(f'{URL}?goi={goi}&p={abs(hash(path))}#{path}')
            pg.wait_for_timeout(200)

        def kiem(nhan):
            nonlocal dem
            dem += 1
            pg.wait_for_timeout(60)
            ok = pg.locator('.main h1, .fsf h1').count() > 0
            tran = pg.evaluate("""['.main', '.fsf-b', '.mtabs-in'].filter(q => { const e = document.querySelector(q); return e && e.scrollWidth > e.clientWidth + 2 })""")
            if not ok:
                loi.append(f'{nhan}: không có tiêu đề màn (trắng trang?)')
            if tran:
                loi.append(f'{nhan}: tràn ngang ở {tran}')
            if con:
                loi.append(f'{nhan}: lỗi console {con[:2]}')
                con.clear()

        def hrefs(q):
            return pg.eval_on_selector_all(q, 'as => as.map(a => a.getAttribute("href"))')

        for goi in GOIS:
            vao('/app', goi)
            links, nut = [], []
            for r in hrefs('.sb-nav a[href*="/app/"]'):
                pg.goto(URL + r)
                pg.wait_for_timeout(80)
                tabs = hrefs('.mtabs-in a, .pop-khac a')       # gồm cả tab dồn trong "Khác" (menu ẩn vẫn có trong DOM)
                links += tabs
                if pg.locator('.qt-n').count():
                    nut += hrefs('.qt-n')                       # ô trên sơ đồ Quy trình
                for t in tabs:
                    if t.endswith('/bao-cao'):
                        pg.goto(URL + t)
                        pg.wait_for_timeout(60)
                        links += hrefs('.rpt-card')
            links = list(dict.fromkeys(links))
            nut = [h for h in dict.fromkeys(nut) if h not in links]
            print(f'gói {goi}: {len(links)} màn, {len(nut)} ô quy trình mở form hoặc màn phân hệ khác')
            if len(links) < 140:
                loi.append(f'[{goi}] thanh tab và tab Báo cáo chỉ có {len(links)} màn, thiếu so với 120 tính năng cộng Quy trình, Báo cáo')
            for h in links:
                pg.goto(URL + h)
                kiem(f'[{goi}] {h}')
                # mở dòng đầu của bảng chứng từ: kiểm khung chi tiết .ct-panel rồi bấm Xem mở form toàn màn hình
                if goi == 'M' and pg.locator('.ct-xem').count() and '/app/' in h:
                    pg.locator('.main table.tbl tr.click').first.click()
                    if not pg.locator('.ct-panel').count():
                        loi.append(f'[{goi}] {h}: bấm dòng không hiện khung chi tiết .ct-panel')
                    pg.locator('.ct-xem').first.click()
                    kiem(f'[{goi}] {h} → xem form')
                    pg.keyboard.press('Escape')
                    pg.wait_for_timeout(60)
            for h in nut:
                pg.goto(URL + h)
                kiem(f'[{goi}] ô {h}')
                if '/moi' in h and not pg.locator('.lockpage').count() and not pg.locator('.fsf').count():
                    loi.append(f'[{goi}] ô {h}: không mở form chứng từ toàn màn hình')

        # Bấm ô Thu tiền mặt trên Quy trình: form phiếu thu mở toàn màn hình, Esc đóng về đúng Quy trình
        vao('/app/tien/quy-trinh', 'M')
        pg.locator('.qt-n', has_text='Thu tiền mặt').first.click()
        pg.wait_for_timeout(150)
        if not pg.locator('.fsf h1', has_text='Phiếu thu').count():
            loi.append('Quy trình tiền: bấm ô Thu tiền mặt không mở form phiếu thu')
        pg.keyboard.press('Escape')
        pg.wait_for_timeout(150)
        if not pg.url.endswith('#/app/tien/quy-trinh') or pg.locator('.fsf').count():
            loi.append(f'Form phiếu thu: Esc không quay về Quy trình, đang ở {pg.url}')

        # Báo cáo tài chính phải cân ở mọi kỳ, mọi gói có báo cáo
        for goi in ['M', 'A', 'S']:
            for path in ['/app/tong-hop/10-2-2', '/app/tong-hop/10-2-1', '/app/tong-hop/10-2-4']:
                vao(path, goi)
                if pg.locator('.lockpage').count():
                    continue
                for ky in ['8', '9', '10']:
                    # ô chọn kỳ là ô chọn tự vẽ (ui/Dropdown.tsx): bấm mở rồi bấm dòng của kỳ
                    pg.locator('.report .filters .sel').first.click()
                    pg.locator('.pop-sel [role=option]', has_text=f'Tháng {ky}/2026').first.click()
                    pg.wait_for_timeout(60)
                    if pg.locator('.report .chip.err').count():
                        loi.append(f'[{goi}] {path} kỳ {ky}: báo cáo lệch')

        # Màn ngoài app
        for path in ['/dang-nhap', '/quen-mat-khau', '/chon-don-vi', '/khoi-tao']:
            vao(path, 'M')
            if not pg.locator('h2').count():
                loi.append(f'{path}: trắng trang')
            if con:
                loi.append(f'{path}: lỗi console {con[:2]}')
                con.clear()

        if not NHANH:
            SHOTS.mkdir(exist_ok=True)
            anh = [('01-dang-nhap', '/dang-nhap', 'M'), ('02-chon-don-vi', '/chon-don-vi', 'M'), ('03-khoi-tao', '/khoi-tao', 'M'),
                   ('04-tong-quan', '/app/trang-chu/tong-quan', 'M'), ('05-ban-lam-viec', '/app/trang-chu/ban-lam-viec', 'M'),
                   ('06-chung-tu-ban-hang', '/app/ban-hang/3-1-1', 'M'), ('07-phieu-ban-hang', '/app/ban-hang/3-1-1/0', 'M'),
                   ('08-doi-soat', '/app/tien-ich/11-7', 'M'), ('09-kqkd', '/app/tong-hop/10-2-3', 'M'), ('10-cdkt', '/app/tong-hop/10-2-2', 'M'),
                   ('11-to-khai', '/app/thue/6-2-3', 'M'), ('12-goi-thue-bao', '/app/he-thong/goi-thue-bao', 'M'),
                   ('13-khoa-free', '/app/tscd/7-1-1', 'F'), ('14-to-khai-starter', '/app/thue/6-2-3', 'S'), ('15-so-quy', '/app/tien/2-2-1', 'M'),
                   ('16-quy-trinh-tien', '/app/tien/quy-trinh', 'M'), ('17-quy-trinh-kho', '/app/kho/quy-trinh', 'M'),
                   ('18-phieu-thu-toan-man', '/app/tien/2-1-1/moi?loai=thu', 'M'), ('19-bao-cao-tong-hop', '/app/tong-hop/bao-cao', 'M'),
                   ('20-quy-trinh-gia-thanh', '/app/gia-thanh/quy-trinh', 'A'), ('21-quy-trinh-tscd-medium', '/app/tscd/quy-trinh', 'M'),
                   ('22-quy-trinh-ban-hang-free', '/app/ban-hang/quy-trinh', 'F'), ('23-sidebar-thu-gon', '/app/mua-hang/quy-trinh', 'M'),
                   ('24-danh-sach-mua-hang', '/app/mua-hang/4-1-1', 'M'), ('25-form-mua-hang', '/app/mua-hang/4-1-1/moi', 'M')]
            for ten, path, goi in anh:
                vao(path, goi, thu_gon=ten == '23-sidebar-thu-gon')
                pg.wait_for_timeout(250)
                pg.screenshot(path=str(SHOTS / f'{ten}.png'))
            print(f'đã chụp {len(anh)} ảnh vào {SHOTS}')
        b.close()

    print(f'đã kiểm {dem} lượt mở màn')
    if loi:
        print(f'{len(loi)} LỖI:')
        for x in loi:
            print('  -', x)
        sys.exit(1)
    print('Không có lỗi.')


if __name__ == '__main__':
    main()
