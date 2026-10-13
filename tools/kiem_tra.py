"""Bấm hết sidebar, thanh tab, tab Báo cáo, ô trên sơ đồ Quy trình ở cả 4 gói; bắt lỗi console, trang trắng, tràn ngang;
kiểm form chứng từ mở toàn màn hình và đóng về đúng màn trước; kiểm báo cáo tài chính cân; chụp ảnh màn chính.

Chạy khi `npm run dev` đang mở ở cổng 5180:
    python tools/kiem_tra.py            # đủ 4 gói + ảnh chụp
    python tools/kiem_tra.py --nhanh    # chỉ gói Medium, không chụp ảnh
    python tools/kiem_tra.py --dien-thoai   # khung 375, 390, 440 (iPhone 13 trở lên), thanh dưới, tràn ngang
"""
import json
import re
import sys
from pathlib import Path

from playwright.sync_api import sync_playwright

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')
    sys.stderr.reconfigure(encoding='utf-8')

URL = 'http://localhost:5180/'
REPO = Path(__file__).resolve().parent.parent
SHOTS = Path(__file__).resolve().parent / 'shots'
NHANH = '--nhanh' in sys.argv
DIEN_THOAI = '--dien-thoai' in sys.argv
# Bề rộng iPhone 13 trở lên: 13 mini, 13/14, 16 Pro Max (pt); ảnh chụp chỉ lấy khung 390
KHUNG_DT = [(375, 812), (390, 844), (440, 956)]
GOIS = ['PL'] if NHANH else ['F', 'S', 'PL', 'PR']


def phien(goi, role='ktt', thu_gon=False):
    return json.dumps(dict(loggedIn=True, ten='Trần Thu Hà', email='thuha@phomay.vn', role=role, donVi='pm', goi=goi, khoiTao=True, thuGon=thu_gon))


def lay_keys_phan_he():
    keys = []
    for f in sorted((REPO / 'src' / 'modules').glob('*/index.ts')):
        m = re.search(r"key:\s*'([a-z-]+)'", f.read_text(encoding='utf-8'))
        if m:
            k = m.group(1)
            if k not in keys:
                keys.append(k)
    return keys


def kiem_tra_dien_thoai(rong=390, cao=844):
    loi, dem = [], 0
    dia_chi = ['/app', '/app/nghiep-vu', '/app/bao-cao/tat-ca', '/app/khac']
    for k in lay_keys_phan_he():
        p = f'/app/{k}'
        if p not in dia_chi:
            dia_chi.append(p)

    with sync_playwright() as p:
        b = p.chromium.launch(channel='chrome')
        pg = b.new_page(
            viewport={'width': rong, 'height': cao},
            is_mobile=True,
            has_touch=True,
            device_scale_factor=3,
        )
        con = []
        pg.on('console', lambda m: con.append(m.text) if m.type == 'error' else None)
        pg.on('pageerror', lambda e: con.append(str(e)))

        def vao(path, goi='PL'):
            pg.goto(URL + '#/dang-nhap')
            pg.wait_for_selector('.auth-box')
            pg.evaluate(f"localStorage.setItem('iacc-cloud-session', {json.dumps(phien(goi))})")
            pg.goto(f'{URL}?goi={goi}&p={abs(hash(path))}#{path}')
            pg.wait_for_timeout(200)

        vao('/app', 'PL')

        for path in dia_chi:
            dem += 1
            pg.goto(f'{URL}#{path}')
            pg.wait_for_timeout(100)
            if con:
                loi.append(f'{path}: lỗi console {con[:2]}')
                con.clear()
            if not pg.locator('.m-thanh-duoi').count():
                loi.append(f'{path}: không thấy .m-thanh-duoi')
            tran = pg.evaluate('document.documentElement.scrollWidth > window.innerWidth + 1')
            if tran:
                loi.append(f'{path}: tràn ngang')
            than_txt = pg.evaluate("() => { const e = document.querySelector('.m-than'); return e ? (e.innerText || e.textContent || '').trim() : null; }")
            if than_txt is None:
                loi.append(f'{path}: không có .m-than (trắng trang)')
            elif not than_txt:
                loi.append(f'{path}: .m-than không có chữ (trắng trang)')
            win_w, app_w, duoi_w = pg.evaluate("""() => {
                const w = window.innerWidth;
                const a = document.querySelector('.m-app');
                const d = document.querySelector('.m-thanh-duoi');
                return [
                    w,
                    a ? a.getBoundingClientRect().width : null,
                    d ? d.getBoundingClientRect().width : null,
                ];
            }""")
            if app_w is None or abs(app_w - win_w) > 1:
                loi.append(f'{path}: khung rộng {round(app_w if app_w is not None else 0)}px, màn rộng {round(win_w)}px')
            if duoi_w is None or duoi_w > win_w + 1:
                loi.append(f'{path}: thanh dưới rộng {round(duoi_w if duoi_w is not None else 0)}px vượt màn rộng {round(win_w)}px')
            if path == '/app':
                co_logo = pg.locator('.m-thanh-tren img, .m-thanh-tren .m-thanh-tren-tieu-de svg, .m-thanh-tren svg.logo').count() > 0
                if not co_logo:
                    loi.append('/app: không có logo trên .m-thanh-tren')

        SHOTS.mkdir(exist_ok=True)
        tabs = [
            ('Trang chủ', '#/app', 'm-01-trang-chu.png'),
            ('Nghiệp vụ', '#/app/nghiep-vu', 'm-02-nghiep-vu.png'),
            ('Báo cáo', '#/app/bao-cao/tat-ca', 'm-03-bao-cao.png'),
            ('Khác', '#/app/khac', 'm-04-khac.png'),
        ]
        the_tabs = pg.locator('.m-thanh-duoi a')
        if the_tabs.count() < 4:
            loi.append(f'.m-thanh-duoi: không đủ 4 thẻ a (thấy {the_tabs.count()})')
            for nhan, hsh, ten_anh in tabs:
                pg.goto(f'{URL}{hsh}')
                pg.wait_for_timeout(150)
                if rong == 390:
                    pg.screenshot(path=str(SHOTS / ten_anh))
        else:
            for i, (nhan, hsh, ten_anh) in enumerate(tabs):
                the_tabs.nth(i).click()
                pg.wait_for_timeout(150)
                lop_on = pg.eval_on_selector_all(
                    '.m-thanh-duoi a',
                    'as => as.map(a => a.classList.contains("on"))'
                )
                if not (i < len(lop_on) and lop_on[i] and lop_on.count(True) == 1):
                    loi.append(f'tab {nhan}: lớp on không đúng ({lop_on})')
                cur_hash = pg.evaluate('location.hash')
                hop_le = (cur_hash == hsh or cur_hash.startswith('#/app/trang-chu')) if i == 0 else (cur_hash == hsh)
                if not hop_le:
                    loi.append(f'tab {nhan}: đổi hash sai, mong đợi {hsh}, thực tế {cur_hash}')
                if con:
                    loi.append(f'tab {nhan}: lỗi console {con[:2]}')
                    con.clear()
                if rong == 390:
                    pg.screenshot(path=str(SHOTS / ten_anh))

        b.close()
    return [f'{rong}px {x}' for x in loi], dem


def kiem_tra_nghiep_vu_4_goi():
    loi = []
    with sync_playwright() as p:
        b = p.chromium.launch(channel='chrome')
        pg = b.new_page(
            viewport={'width': 390, 'height': 844},
            is_mobile=True,
            has_touch=True,
            device_scale_factor=3,
        )
        con = []
        pg.on('console', lambda m: con.append(m.text) if m.type == 'error' else None)
        pg.on('pageerror', lambda e: con.append(str(e)))

        for goi in ['F', 'S', 'PL', 'PR']:
            pg.goto(URL + '#/dang-nhap')
            pg.wait_for_selector('.auth-box')
            pg.evaluate(f"localStorage.setItem('iacc-cloud-session', {json.dumps(phien(goi))})")
            pg.goto(f'{URL}?goi={goi}&p={abs(hash(goi))}#/app/nghiep-vu')
            pg.wait_for_timeout(150)

            o_links = pg.eval_on_selector_all(
                '.m-nv-luoi a',
                'as => as.map(a => a.getAttribute("href"))'
            )
            so_man = 0
            for o_href in o_links:
                if not o_href or 'm=' not in o_href:
                    continue
                k = o_href.split('m=')[1]
                pg.goto(f'{URL}{o_href}')
                pg.wait_for_timeout(60)
                if con:
                    loi.append(f'[{goi}] {o_href}: lỗi console {con[:2]}')
                    con.clear()

                man_links = pg.eval_on_selector_all(
                    '.m-nv-ds a',
                    'as => as.map(a => a.getAttribute("href"))'
                )
                for man_href in man_links:
                    if not man_href:
                        continue
                    so_man += 1
                    pg.goto(f'{URL}{man_href}')
                    pg.wait_for_timeout(40)
                    cur_h = pg.evaluate('location.hash')
                    hop_le = cur_h.startswith(f'#/app/{k}/') or cur_h == f'#/app/bao-cao/nhom-{k}'
                    if not hop_le:
                        loi.append(f'[{goi}] {man_href}: hash {cur_h} không bắt đầu bằng #/app/{k}/')
                    if con:
                        loi.append(f'[{goi}] {man_href}: lỗi console {con[:2]}')
                        con.clear()
                    than_txt = pg.evaluate("() => { const e = document.querySelector('.m-than'); return e ? (e.innerText || e.textContent || '').trim() : null; }")
                    if not than_txt:
                        loi.append(f'[{goi}] {man_href}: trắng trang')
                    pg.goto(f'{URL}{o_href}')
                    pg.wait_for_timeout(30)

                pg.goto(f'{URL}#/app/nghiep-vu')
                pg.wait_for_timeout(30)

            print(f'gói {goi}: đã bấm {so_man} màn')

        b.close()
    return loi


def kiem_tra_cac_khung_dt():
    loi, dem = [], 0
    for rong, cao in KHUNG_DT:
        l, d = kiem_tra_dien_thoai(rong, cao)
        loi += l
        dem += d
    print(f'đã kiểm {dem} lượt địa chỉ ở {len(KHUNG_DT)} bề rộng')
    loi_nv = kiem_tra_nghiep_vu_4_goi()
    loi += loi_nv
    if loi:
        print(f'{len(loi)} LỖI:')
        for x in loi:
            print('  -', x)
        sys.exit(1)
    print('Không có lỗi.')


def main():
    if DIEN_THOAI:
        kiem_tra_cac_khung_dt()
        return
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
                    nut += hrefs('a.qt-n')                       # ô trên sơ đồ Quy trình
                # Gói Free ẩn hẳn tính năng ngoài gói (QD22): không còn mục mờ có khoá trên sidebar, tab, sơ đồ
                if goi == 'F' and pg.locator('.sb-nav a.lock, .mtabs-in a.lock, .pop-khac a.lock, .qt-n.lock, .qt-bc a.lock, .qt-foot a.lock').count():
                    loi.append(f'[F] {r}: còn hiện mục ngoài gói có khoá')
                for t in tabs:
                    if t.endswith('/bao-cao'):
                        pg.goto(URL + t)
                        pg.wait_for_timeout(60)
                        links += hrefs('.rpt-card')
            links = list(dict.fromkeys(links))
            nut = [h for h in dict.fromkeys(nut) if h not in links]
            print(f'gói {goi}: {len(links)} màn, {len(nut)} ô quy trình mở form hoặc màn phân hệ khác')
            # T171 bỏ mọi báo cáo trừ sổ quỹ, sổ ngân hàng, bộ sổ TT58: gói Plus còn khoảng 117 màn
            if len(links) < (30 if goi == 'F' else 110):
                loi.append(f'[{goi}] thanh tab và tab Báo cáo chỉ có {len(links)} màn, thiếu so với số tính năng còn dùng cộng Quy trình, Báo cáo')
            for h in links:
                pg.goto(URL + h)
                kiem(f'[{goi}] {h}')
                # mở dòng đầu của bảng chứng từ: kiểm khung chi tiết .ct-panel rồi đúp chuột mở form toàn màn hình
                if goi == 'PL' and pg.locator('.voucher-top table.tbl tr.click').count() and '/app/' in h:
                    pg.locator('.main table.tbl tr.click').first.click()
                    if not pg.locator('.ct-panel').count():
                        loi.append(f'[{goi}] {h}: bấm dòng không hiện khung chi tiết .ct-panel')
                    pg.locator('.main table.tbl tr.click').first.dblclick()
                    kiem(f'[{goi}] {h} → xem form')
                    pg.keyboard.press('Escape')
                    pg.wait_for_timeout(60)
            for h in nut:
                pg.goto(URL + h)
                kiem(f'[{goi}] ô {h}')
                if '/moi' in h and not pg.locator('.lockpage').count() and not pg.locator('.fsf').count():
                    loi.append(f'[{goi}] ô {h}: không mở form chứng từ toàn màn hình')

        # Bấm ô Thu tiền mặt trên Quy trình: form phiếu thu mở toàn màn hình, Esc đóng về đúng Quy trình
        vao('/app/tien/quy-trinh', 'PL')
        pg.locator('.qt-n', has_text='Thu tiền mặt').first.click()
        pg.wait_for_timeout(150)
        if not pg.locator('.fsf h1', has_text='Thu tiền mặt').count():
            loi.append('Quy trình tiền: bấm ô Thu tiền mặt không mở form phiếu thu')
        pg.keyboard.press('Escape')
        pg.wait_for_timeout(150)
        if not pg.url.endswith('#/app/tien/quy-trinh') or pg.locator('.fsf').count():
            loi.append(f'Form phiếu thu: Esc không quay về Quy trình, đang ở {pg.url}')

        # Báo cáo tài chính phải cân ở mọi kỳ, mọi gói có báo cáo
        for goi in ['PL', 'PR', 'S']:
            for path in ['/app/tong-hop/10-2-2', '/app/tong-hop/10-2-1', '/app/tong-hop/10-2-4']:
                vao(path, goi)
                # chờ trang hiện hẳn (trang khoá theo gói hoặc nút chọn kỳ) rồi mới xét; chờ cố định 0,2 giây thì máy chậm sẽ bấm hụt (T65)
                pg.wait_for_selector('.lockpage, .bc-chon .kn-nut, .report .kn-nut')
                if pg.locator('.lockpage').count():
                    continue
                for ky in ['8', '9', '10']:
                    # kỳ chọn bằng ô khoảng ngày (ui/ChonNgay.tsx): mở lịch, sang Chọn tháng, bấm tháng của năm 2026 rồi Xác nhận
                    pg.locator('.bc-chon .kn-nut, .report .kn-nut').first.click()   # thanh công cụ báo cáo nằm ở hàng tiêu đề (T55)
                    pg.locator('.kn-pop').get_by_role('button', name='Chọn tháng', exact=True).click()
                    pg.locator('.kn-luoi-thang').first.get_by_role('button', name=f'Thg {ky}', exact=True).click()
                    pg.locator('.kn-pop').get_by_role('button', name='Xác nhận', exact=True).click()
                    pg.wait_for_timeout(60)
                    if pg.locator('.report .chip.err').count():
                        loi.append(f'[{goi}] {path} kỳ {ky}: báo cáo lệch')

        # Màn ngoài app
        for path in ['/dang-nhap', '/quen-mat-khau', '/chon-don-vi', '/khoi-tao']:
            vao(path, 'PL')
            if not pg.locator('h2').count():
                loi.append(f'{path}: trắng trang')
            if con:
                loi.append(f'{path}: lỗi console {con[:2]}')
                con.clear()

        if not NHANH:
            SHOTS.mkdir(exist_ok=True)
            anh = [('01-dang-nhap', '/dang-nhap', 'PL'), ('02-chon-don-vi', '/chon-don-vi', 'PL'), ('03-khoi-tao', '/khoi-tao', 'PL'),
                   ('04-tong-quan', '/app/trang-chu/tong-quan', 'PL'), ('05-ban-lam-viec', '/app/trang-chu/ban-lam-viec', 'PL'),
                   ('06-chung-tu-ban-hang', '/app/ban-hang/3-1-1', 'PL'), ('07-phieu-ban-hang', '/app/ban-hang/3-1-1/0', 'PL'),
                   ('08-doi-soat', '/app/tien-ich/11-7', 'PL'), ('09-kqkd', '/app/tong-hop/10-2-3', 'PL'), ('10-cdkt', '/app/tong-hop/10-2-2', 'PL'),
                   ('11-to-khai', '/app/thue/6-2-3', 'PL'), ('12-goi-thue-bao', '/app/he-thong/goi-thue-bao', 'PL'),
                   ('13-khoa-free', '/app/tscd/7-1-1', 'F'), ('14-to-khai-starter', '/app/thue/6-2-3', 'S'), ('15-so-quy', '/app/tien/2-2-1', 'PL'),
                   ('16-quy-trinh-tien', '/app/tien/quy-trinh', 'PL'), ('17-quy-trinh-kho', '/app/kho/quy-trinh', 'PL'),
                   ('18-phieu-thu-toan-man', '/app/tien/2-1-1/moi?loai=thu', 'PL'), ('19-bao-cao-tong-hop', '/app/tong-hop/bao-cao', 'PL'),
                   ('20-quy-trinh-gia-thanh', '/app/gia-thanh/quy-trinh', 'PR'), ('21-quy-trinh-tscd-medium', '/app/tscd/quy-trinh', 'PL'),
                   ('22-quy-trinh-ban-hang-free', '/app/ban-hang/quy-trinh', 'F'), ('23-sidebar-thu-gon', '/app/mua-hang/quy-trinh', 'PL'),
                   ('24-danh-sach-mua-hang', '/app/mua-hang/4-1-1', 'PL'), ('25-form-mua-hang', '/app/mua-hang/4-1-1/moi', 'PL')]
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
