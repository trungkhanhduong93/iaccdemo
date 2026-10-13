"""Bấm hết sidebar, thanh tab, tab Báo cáo, ô trên sơ đồ Quy trình ở cả 4 gói; bắt lỗi console, trang trắng, tràn ngang;
kiểm form chứng từ mở toàn màn hình và đóng về đúng màn trước; kiểm báo cáo tài chính cân; chụp ảnh màn chính.

Chạy khi `npm run dev` đang mở ở cổng 5180 (đổi cổng qua biến môi trường KIEM_TRA_URL):
    python tools/kiem_tra.py            # đủ 4 gói + ảnh chụp
    python tools/kiem_tra.py --nhanh    # chỉ gói Medium, không chụp ảnh
    python tools/kiem_tra.py --dien-thoai   # khung 375, 390, 440 (iPhone 13 trở lên), thanh dưới, tràn ngang
    KIEM_TRA_URL=http://localhost:5181/ python tools/kiem_tra.py  # đổi địa chỉ qua biến môi trường
"""
import json
import os
import re
import sys
from pathlib import Path

from playwright.sync_api import sync_playwright

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')
    sys.stderr.reconfigure(encoding='utf-8')

URL = os.environ.get('KIEM_TRA_URL', 'http://localhost:5180/')
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


def tim_cac_man_dot_3():
    mans = [('Thu chi tiền mặt (2-1-1)', '/app/tien/2-1-1')]

    # Mua hàng
    mh_txt = (REPO / 'src' / 'modules' / 'mua-hang' / 'index.ts').read_text(encoding='utf-8')
    m_mh = re.search(r"'([0-9\.\-]+)':\s*\{[^}]*voucher", mh_txt)
    slug_mh = m_mh.group(1).replace('.', '-') if m_mh else '4-1-1'
    mans.append(('Danh sách mua hàng', f'/app/mua-hang/{slug_mh}'))

    # Bán hàng
    bh_txt = (REPO / 'src' / 'modules' / 'ban-hang' / 'index.ts').read_text(encoding='utf-8')
    feats = set()
    try:
        f_json = json.loads((REPO / 'src' / 'app' / 'features.json').read_text(encoding='utf-8'))
        feats = set(x['c'] for x in f_json.get('feats', []))
    except Exception:
        pass
    m_bh = re.findall(r"'([0-9\.\-]+)':\s*\{[^}]*voucher", bh_txt)
    slug_bh = '3-1-2'
    for c in m_bh:
        if not feats or c in feats:
            slug_bh = c.replace('.', '-')
            break
    mans.append(('Danh sách bán hàng', f'/app/ban-hang/{slug_bh}'))

    # Kho
    kho_txt = (REPO / 'src' / 'modules' / 'kho' / 'index.ts').read_text(encoding='utf-8')
    m_nk = re.search(r"'([0-9\.\-]+)':\s*phieu\('NK'", kho_txt)
    slug_nk = m_nk.group(1).replace('.', '-') if m_nk else '5-1-1'
    mans.append(('Nhập kho', f'/app/kho/{slug_nk}'))

    m_xk = re.search(r"'([0-9\.\-]+)':\s*phieu\('XB'", kho_txt)
    slug_xk = m_xk.group(1).replace('.', '-') if m_xk else '5-1-2'
    mans.append(('Xuất kho', f'/app/kho/{slug_xk}'))

    m_kk = re.search(r"'([0-9\.\-]+)':\s*KK", kho_txt)
    slug_kk = m_kk.group(1).replace('.', '-') if m_kk else '5-1-10'
    mans.append(('Kiểm kê', f'/app/kho/{slug_kk}'))

    # Danh mục
    dm_txt = (REPO / 'src' / 'modules' / 'danh-muc' / 'index.ts').read_text(encoding='utf-8')
    m_hh = re.search(r"'([0-9\.\-]+)':\s*\{\s*catalog:[^}]*them:\s*'[^']*hàng hoá", dm_txt, re.IGNORECASE)
    slug_hh = m_hh.group(1).replace('.', '-') if m_hh else '1-2'
    mans.append(('Danh mục hàng hoá', f'/app/danh-muc/{slug_hh}'))

    m_kho = re.search(r"'([0-9\.\-]+)':\s*\{\s*catalog:[^}]*them:\s*'[^']*kho", dm_txt, re.IGNORECASE)
    slug_kho = m_kho.group(1).replace('.', '-') if m_kho else '1-8'
    mans.append(('Danh mục kho', f'/app/danh-muc/{slug_kho}'))

    m_ncc = re.search(r"'([0-9\.\-]+)':\s*\{\s*catalog:[^}]*them:\s*'[^']*đối tượng", dm_txt, re.IGNORECASE)
    slug_ncc = m_ncc.group(1).replace('.', '-') if m_ncc else '1-5'
    mans.append(('Danh mục nhà cung cấp', f'/app/danh-muc/{slug_ncc}'))

    return mans


def kiem_tra_man_dot_3():
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

        pg.goto(URL + '#/dang-nhap')
        pg.wait_for_selector('.auth-box')
        pg.evaluate(f"localStorage.setItem('iacc-cloud-session', {json.dumps(phien('PL'))})")

        mans = tim_cac_man_dot_3()
        print('Kiểm tra các màn danh sách & danh mục đợt 3 (390px, gói PL):')
        for ten, path in mans:
            pg.goto(f'{URL}?goi=PL&p={abs(hash(path))}#{path}')
            pg.wait_for_timeout(250)
            if con:
                loi.append(f'{path}: lỗi console khi mở {con[:2]}')
                con.clear()

            if pg.locator('.m-chi-may-tinh').count() > 0:
                loi.append(f'{ten} ({path}): bị rơi về .m-chi-may-tinh')

            so_the = pg.locator('.m-the-ct, .m-the-dm').count()
            co_trong = pg.locator('.m-trong').count() > 0
            if so_the == 0 and not co_trong:
                loi.append(f'{ten} ({path}): không có thẻ và không có màn trống')

            print(f'  - {ten} ({path}): {so_the} thẻ mặc định')

            # Gõ zzzz vào ô tìm thì ra màn trống
            inp = pg.locator('.m-ds-tim-inp')
            if inp.count() == 0:
                loi.append(f'{ten} ({path}): thiếu ô tìm kiếm .m-ds-tim-inp')
            else:
                inp.fill('zzzz')
                pg.wait_for_timeout(100)
                the_zzzz = pg.locator('.m-the-ct, .m-the-dm').count()
                trong_zzzz = pg.locator('.m-trong').count()
                if the_zzzz > 0 or trong_zzzz == 0:
                    loi.append(f'{ten} ({path}): gõ zzzz không ra màn trống (thẻ: {the_zzzz}, trống: {trong_zzzz})')

                inp.fill('')
                pg.wait_for_timeout(100)
                the_lai = pg.locator('.m-the-ct, .m-the-dm').count()
                if the_lai != so_the:
                    loi.append(f'{ten} ({path}): xoá tìm kiếm không phục hồi thẻ (cũ: {so_the}, mới: {the_lai})')

            # Bấm từng chip không lỗi console
            chips = pg.locator('.m-ds-chips .m-chip')
            n_chips = chips.count()
            for i in range(n_chips):
                chips.nth(i).click()
                pg.wait_for_timeout(50)
                if con:
                    loi.append(f'{ten} ({path}): lỗi console khi bấm chip #{i} {con[:2]}')
                    con.clear()
            if n_chips > 0:
                chips.first.click()
                pg.wait_for_timeout(50)

        b.close()
    return loi


def kiem_tra_xem_phieu_dot_4():
    loi = []
    kho_txt = (REPO / 'src' / 'modules' / 'kho' / 'index.ts').read_text(encoding='utf-8')
    m_xdc = re.search(r"'([0-9\.\-]+)':\s*phieuDcn\('xdc'", kho_txt)
    slug_xdc = m_xdc.group(1).replace('.', '-') if m_xdc else '5-1-4'

    danh_sach = [
        ('Thu chi', 'tien/2-1-1'),
        ('Nhập kho', 'kho/5-1-1'),
        ('Kiểm kê', 'kho/5-1-10'),
        ('Xuất điều chuyển', f'kho/{slug_xdc}'),
    ]

    print('Kiểm tra màn xem chi tiết phiếu đợt 4 (390px vs 1440px, gói PL):')
    with sync_playwright() as p:
        b_dt = p.chromium.launch(channel='chrome')
        pg_dt = b_dt.new_page(
            viewport={'width': 390, 'height': 844},
            is_mobile=True,
            has_touch=True,
            device_scale_factor=3,
        )
        con_dt = []
        pg_dt.on('console', lambda m: con_dt.append(m.text) if m.type == 'error' else None)
        pg_dt.on('pageerror', lambda e: con_dt.append(str(e)))

        pg_dt.goto(URL + '#/dang-nhap')
        pg_dt.wait_for_selector('.auth-box')
        pg_dt.evaluate(f"localStorage.setItem('iacc-cloud-session', {json.dumps(phien('PL'))})")

        b_mt = p.chromium.launch(channel='chrome')
        pg_mt = b_mt.new_page(viewport={'width': 1440, 'height': 900})
        con_mt = []
        pg_mt.on('console', lambda m: con_mt.append(m.text) if m.type == 'error' else None)
        pg_mt.on('pageerror', lambda e: con_mt.append(str(e)))

        pg_mt.goto(URL + '#/dang-nhap')
        pg_mt.wait_for_selector('.auth-box')
        pg_mt.evaluate(f"localStorage.setItem('iacc-cloud-session', {json.dumps(phien('PL'))})")

        for ten_loai, slug in danh_sach:
            path_ds = f'/app/{slug}'
            pg_dt.goto(f'{URL}?goi=PL&p={abs(hash(path_ds))}#{path_ds}')
            pg_dt.wait_for_timeout(300)

            thes = pg_dt.locator('.m-the-ct')
            if thes.count() == 0:
                loi.append(f'{ten_loai} ({path_ds}): không tìm thấy thẻ chứng từ nào')
                continue

            thes.first.click()
            pg_dt.wait_for_timeout(300)

            if con_dt:
                loi.append(f'{ten_loai} ({path_ds}): lỗi console điện thoại {con_dt[:2]}')
                con_dt.clear()

            if pg_dt.locator('.m-chi-may-tinh').count() > 0:
                loi.append(f'{ten_loai} ({path_ds}): bị rơi về .m-chi-may-tinh')
                continue

            tran = pg_dt.evaluate("document.documentElement.scrollWidth > window.innerWidth")
            if tran:
                loi.append(f'{ten_loai} ({path_ds}): bị tràn ngang ở màn xem chi tiết điện thoại')

            so_phieu = pg_dt.locator('.m-xp-so').inner_text().strip() if pg_dt.locator('.m-xp-so').count() > 0 else ''
            ten_phieu = pg_dt.locator('.m-xp-loai').inner_text().strip() if pg_dt.locator('.m-xp-loai').count() > 0 else ten_loai

            tong_dt_txt = pg_dt.locator('.m-xp-day-tong').inner_text().strip() if pg_dt.locator('.m-xp-day-tong').count() > 0 else '0'
            so_dt = int(re.sub(r'\D', '', tong_dt_txt) or 0)

            url_phieu = pg_dt.evaluate("window.location.hash").lstrip('#')

            pg_mt.goto(f'{URL}?goi=PL&p={abs(hash(url_phieu))}#{url_phieu}')
            pg_mt.wait_for_timeout(300)

            if con_mt:
                loi.append(f'{ten_loai} ({url_phieu}): lỗi console máy tính {con_mt[:2]}')
                con_mt.clear()

            el_tong_mt = pg_mt.locator('.pos-day-tong b, .pos-day-cot .lon, .fsf-day-tong b')
            if el_tong_mt.count() > 0:
                tong_mt_txt = el_tong_mt.first.inner_text().strip()
                so_mt = int(re.sub(r'\D', '', tong_mt_txt) or 0)
            else:
                so_mt = 0

            if so_dt != so_mt:
                loi.append(f'{ten_phieu} ({so_phieu}): tổng tiền không bằng nhau (điện thoại: {so_dt:,} đ, máy tính: {so_mt:,} đ)'.replace(',', '.'))

            print(f'  - {ten_phieu} ({so_phieu}): điện thoại {so_dt:,} đ = máy tính {so_mt:,} đ'.replace(',', '.'))

        b_dt.close()
        b_mt.close()
    return loi


def kiem_tra_lap_phieu_dot_5():
    loi = []
    bh_txt = (REPO / 'src' / 'modules' / 'ban-hang' / 'index.ts').read_text(encoding='utf-8')
    feats = set()
    try:
        f_json = json.loads((REPO / 'src' / 'app' / 'features.json').read_text(encoding='utf-8'))
        feats = set(x['c'] for x in f_json.get('feats', []))
    except Exception:
        pass
    m_bh = re.findall(r"'([0-9\.\-]+)':\s*\{[^}]*voucher", bh_txt)
    slug_bh = '3-1-2'
    for c in m_bh:
        if not feats or c in feats:
            slug_bh = c.replace('.', '-')
            break

    ds_phieu = [
        ('Phiếu chi', 'tien/2-1-1', True),
        ('Nhập kho', 'kho/5-1-1', False),
        ('Bán hàng', f'ban-hang/{slug_bh}', False),
    ]

    print('Kiểm tra lập phiếu đợt 5 (390px -> 1440px, gói PL):')
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

        pg.goto(URL + '#/dang-nhap')
        pg.wait_for_selector('.auth-box')
        pg.evaluate(f"localStorage.setItem('iacc-cloud-session', {json.dumps(phien('PL'))})")

        for ten_phieu, slug, la_tien in ds_phieu:
            path_ds = f'/app/{slug}'
            pg.goto(f'{URL}?goi=PL&p={abs(hash(path_ds))}#{path_ds}')
            pg.wait_for_timeout(800)

            nut_them = pg.locator('.m-nut-them-fab')
            if nut_them.count() == 0:
                loi.append(f'{ten_phieu} ({path_ds}): không tìm thấy nút thêm mới')
                continue
            nut_them.first.click()
            pg.wait_for_timeout(200)

            if la_tien:
                dong_chi = pg.locator('.m-tam-dong:has-text("Chi")')
                if dong_chi.count() > 0:
                    dong_chi.first.click()
                    pg.wait_for_timeout(200)

            if pg.locator('.m-lp').count() == 0:
                loi.append(f'{ten_phieu} ({path_ds}): không mở form lập phiếu .m-lp')
                continue

            if pg.locator('.m-thanh-tren').count() > 0 and pg.locator('.m-thanh-tren').is_visible():
                loi.append(f'{ten_phieu} ({path_ds}): .m-thanh-tren vẫn hiển thị khi mở MLapPhieu')

            tran_b1 = pg.evaluate("document.documentElement.scrollWidth > window.innerWidth")
            if tran_b1:
                loi.append(f'{ten_phieu} ({path_ds}): tràn ngang ở Bước 1')

            nut_tiep_1 = pg.locator('.m-lp-nut-tiep, .m-lp-day button:has-text("Tiếp tục")')
            if nut_tiep_1.count() == 0:
                loi.append(f'{ten_phieu} ({path_ds}): thiếu nút Tiếp tục ở Bước 1')
                continue
            nut_tiep_1.first.click()
            pg.wait_for_timeout(250)

            if la_tien:
                nut_them_dong = pg.locator('.m-lp-btn-them-dong, button:has-text("Thêm dòng")')
                if nut_them_dong.count() > 0:
                    nut_them_dong.first.click()
                    pg.wait_for_timeout(150)

                inps_tien = pg.locator('.m-lp-sua-inp.num')
                if inps_tien.count() >= 2:
                    inps_tien.nth(0).fill('600.000')
                    inps_tien.nth(1).fill('400.000')
                elif inps_tien.count() >= 1:
                    inps_tien.nth(0).fill('600.000')

                nut_tiep_3 = pg.locator('.m-lp-day button:has-text("Tiếp tục")')
                nut_tiep_3.first.click()
                pg.wait_for_timeout(250)
            else:
                the_hang = pg.locator('.m-lp-the-hang')
                if the_hang.count() < 2:
                    loi.append(f'{ten_phieu} ({path_ds}): không đủ 2 thẻ hàng ở Bước 2')
                    continue
                the_hang.nth(0).click()
                pg.wait_for_timeout(100)
                the_hang.nth(1).click()
                pg.wait_for_timeout(100)

                nut_ds_chon = pg.locator('.m-lp-day button:has-text("Danh sách đã chọn")')
                nut_ds_chon.first.click()
                pg.wait_for_timeout(250)

                inps_num = pg.locator('.m-lp-sua-hang .m-lp-sua-inp.num')
                if inps_num.count() >= 2:
                    inps_num.nth(0).fill('2')
                if inps_num.count() >= 4:
                    inps_num.nth(2).fill('3')

                nut_tiep_3 = pg.locator('.m-lp-day button:has-text("Tiếp tục")')
                nut_tiep_3.first.click()
                pg.wait_for_timeout(250)

            tran_b4 = pg.evaluate("document.documentElement.scrollWidth > window.innerWidth")
            if tran_b4:
                loi.append(f'{ten_phieu} ({path_ds}): tràn ngang ở Bước 4')

            nut_luu = pg.locator('.m-lp-day button.m-lp-nut-chinh')
            if nut_luu.count() == 0:
                loi.append(f'{ten_phieu} ({path_ds}): không tìm thấy nút Lưu ở Bước 4')
                continue
            nut_luu.first.click()
            pg.wait_for_timeout(400)

            thanh_cong = pg.locator('.m-lp-thanh-cong-tieu, :has-text("Tạo chứng từ thành công")')
            if thanh_cong.count() == 0:
                loi.append(f'{ten_phieu} ({path_ds}): không hiện màn hình Tạo chứng từ thành công')
                continue

            mota_txt = pg.locator('.m-lp-thanh-cong-mota').inner_text() if pg.locator('.m-lp-thanh-cong-mota').count() > 0 else ''
            m_so = re.search(r'([A-Z0-9\-\/]+2610\-[0-9]+|[A-Z]+2610\-[0-9]+)', mota_txt)
            so_phieu = m_so.group(1) if m_so else ''
            if not so_phieu:
                m_b = pg.locator('.m-lp-thanh-cong-mota b')
                if m_b.count() > 0:
                    so_phieu = m_b.first.inner_text().strip()

            if not so_phieu:
                loi.append(f'{ten_phieu} ({path_ds}): không đọc được số phiếu từ màn hình thành công')

            nut_xem = pg.locator('button:has-text("Xem phiếu")')
            if nut_xem.count() == 0:
                loi.append(f'{ten_phieu} ({path_ds}): thiếu nút Xem phiếu')
                continue
            nut_xem.first.click()
            pg.wait_for_timeout(350)

            tong_txt = pg.locator('.m-xp-day-tong').inner_text().strip() if pg.locator('.m-xp-day-tong').count() > 0 else '0'
            so_tien = int(re.sub(r'\D', '', tong_txt) or 0)
            if so_tien == 0:
                loi.append(f'{ten_phieu} ({so_phieu}): tổng tiền bằng 0 đ')

            pg.goto(f'{URL}?goi=PL&p={abs(hash(path_ds))}#{path_ds}')
            pg.wait_for_timeout(300)

            so_the_dau = pg.locator('.m-the-ct .m-the-ct-so').first.inner_text().strip() if pg.locator('.m-the-ct .m-the-ct-so').count() > 0 else ''
            if so_phieu and so_phieu not in so_the_dau:
                loi.append(f'{ten_phieu}: số phiếu {so_phieu} không nằm ở thẻ đầu danh sách điện thoại (thấy {so_the_dau})')

            pg.set_viewport_size({'width': 1440, 'height': 900})
            pg.wait_for_timeout(300)

            row_dau = pg.locator('table.tbl tbody tr:first-child').inner_text() if pg.locator('table.tbl tbody tr').count() > 0 else ''
            if so_phieu and so_phieu not in row_dau:
                loi.append(f'{ten_phieu}: số phiếu {so_phieu} không nằm ở dòng đầu bảng máy tính (thấy {row_dau[:40]})')

            pg.set_viewport_size({'width': 390, 'height': 844})
            pg.wait_for_timeout(150)

            if con:
                loi.append(f'{ten_phieu}: lỗi console {con[:2]}')
                con.clear()

            print(f'  - {ten_phieu}: lập thành công {so_phieu}, tổng {so_tien:,} đ'.replace(',', '.'))

        # Sửa phiếu mẫu có sẵn (chưa có _dong): mở sửa, lưu không đổi gì, tổng và trạng thái phải giữ nguyên
        def doc_xem():
            tong = pg.locator('.m-xp-day-tong')
            chip = pg.locator('.m-xp .m-ct-chip')
            return (tong.inner_text().strip() if tong.count() else '',
                    chip.first.inner_text().strip() if chip.count() else '')
        for ten_phieu, slug in [('Phiếu thu chi', 'tien/2-1-1'), ('Nhập kho', 'kho/5-1-1')]:
            path_ds = f'/app/{slug}'
            pg.goto(f'{URL}?goi=PL&sua=1#{path_ds}')
            pg.wait_for_timeout(800)
            pg.locator('.m-the-ct').first.click()
            pg.wait_for_timeout(600)
            truoc = doc_xem()
            pg.locator('.m-xp-nut-menu').click()
            pg.wait_for_timeout(300)
            pg.get_by_text('Sửa chứng từ', exact=True).last.click()
            pg.wait_for_timeout(600)
            for _ in range(5):
                if pg.locator('.m-lp-day button:text-is("Lưu")').count():
                    break
                nut = pg.locator('.m-lp-day button').last
                if not nut.is_enabled():
                    break
                nut.click()
                pg.wait_for_timeout(400)
            if not pg.locator('.m-lp-day button:text-is("Lưu")').count():
                loi.append(f'Sửa {ten_phieu}: không tới được nút Lưu (dòng phiếu trống?)')
                continue
            pg.locator('.m-lp-day button:text-is("Lưu")').click()
            pg.wait_for_timeout(600)
            sau = doc_xem()
            if sau != truoc:
                loi.append(f'Sửa {ten_phieu}: trước {truoc}, sau khi lưu {sau}')
            print(f'  - Sửa {ten_phieu}: giữ nguyên {sau[0]}, {sau[1]}')

        b.close()
    return loi


def kiem_tra_form_dm_dot_6():
    loi = []
    print('Kiểm tra form danh mục đợt 6 (390px, gói PL):')
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

        pg.goto(URL + '#/dang-nhap')
        pg.wait_for_selector('.auth-box')
        pg.evaluate(f"localStorage.setItem('iacc-cloud-session', {json.dumps(phien('PL'))})")

        def kiem_nut_luu(mo_ta):
            tran = pg.evaluate("document.documentElement.scrollWidth > 390")
            if tran:
                loi.append(f'{mo_ta}: tràn ngang (scrollWidth > 390)')
            nut = pg.locator('.m-form-dm .pn-chan button.btn.pri:has-text("Lưu")')
            if nut.count() == 0:
                loi.append(f'{mo_ta}: không tìm thấy nút Lưu')
                return None
            che = pg.evaluate("""() => {
                const btn = document.querySelector('.m-form-dm .pn-chan button.btn.pri');
                if (!btn) return 'không thấy nút';
                const rect = btn.getBoundingClientRect();
                const cx = rect.left + rect.width / 2;
                const cy = rect.top + rect.height / 2;
                const el = document.elementFromPoint(cx, cy);
                if (!el) return 'elementFromPoint rỗng';
                if (btn.contains(el) || el.contains(btn)) return null;
                return 'bị che bởi ' + (el.className || el.tagName);
            }""")
            if che:
                loi.append(f'{mo_ta}: nút Lưu {che}')
            return nut.first

        # 1. Hàng hoá danh-muc/1-2: bấm thêm, gõ mã, tên, chọn đơn vị tính, bấm Lưu. Phải thấy toast "Đã lưu" và modal đóng.
        path_hh = '/app/danh-muc/1-2'
        pg.goto(f'{URL}?goi=PL&p={abs(hash(path_hh))}#{path_hh}')
        pg.wait_for_timeout(800)
        nut_them = pg.locator('.m-nut-them-fab')
        if nut_them.count() == 0:
            loi.append('Hàng hoá (1-2): không tìm thấy nút thêm mới .m-nut-them-fab')
        else:
            nut_them.first.click()
            pg.wait_for_timeout(400)
            if pg.locator('.m-form-dm').count() == 0:
                loi.append('Hàng hoá (1-2): không mở modal .m-form-dm')
            else:
                inps = pg.locator('.m-form-dm input.inp')
                if inps.count() >= 2:
                    inps.nth(0).fill('HH_TEST_T183')
                    inps.nth(1).fill('Hàng hoá thử nghiệm T183')
                dvt_nut = pg.locator('.m-form-dm .pop-nut').first
                if dvt_nut.count() > 0:
                    dvt_nut.click()
                    pg.wait_for_timeout(200)
                    dvt_opt = pg.locator('.pop .pop-opt').first
                    if dvt_opt.count() > 0:
                        dvt_opt.click()
                        pg.wait_for_timeout(200)

                nut_luu = kiem_nut_luu('Hàng hoá thêm mới')
                if nut_luu:
                    nut_luu.click()
                    pg.wait_for_timeout(400)
                    toast = pg.locator('.toast, :has-text("Đã lưu")')
                    if toast.count() == 0:
                        loi.append('Hàng hoá: không thấy toast "Đã lưu"')
                    if pg.locator('.m-form-dm').count() > 0:
                        loi.append('Hàng hoá: modal chưa đóng sau khi Lưu')
            print('  - Hàng hoá (1-2): thêm mới và lưu thành công')

        # 2. Kho danh-muc/1-8: bấm thẻ đầu, form mở đúng tên dòng, sửa 1 ô chữ, Lưu
        path_kho = '/app/danh-muc/1-8'
        pg.goto(f'{URL}?goi=PL&p={abs(hash(path_kho))}#{path_kho}')
        pg.wait_for_timeout(800)
        the_kho = pg.locator('.m-the-dm').first
        ten_kho_cu = pg.locator('.m-the-dm-ten').first.inner_text().strip() if pg.locator('.m-the-dm-ten').count() > 0 else ''
        the_kho.click()
        pg.wait_for_timeout(400)

        if pg.locator('.m-form-dm').count() == 0:
            loi.append('Kho (1-8): bấm thẻ không mở modal .m-form-dm')
        else:
            inps = pg.locator('.m-form-dm input.inp')
            val = inps.nth(1).input_value() if inps.count() >= 2 else ''
            if ten_kho_cu and ten_kho_cu not in val:
                loi.append(f'Kho (1-8): form mở không đúng tên dòng (thấy {val}, kỳ vọng chứa {ten_kho_cu})')
            if inps.count() >= 2:
                inps.nth(1).fill(val + ' (sửa)')
            nut_luu = kiem_nut_luu('Kho sửa')
            if nut_luu:
                nut_luu.click()
                pg.wait_for_timeout(400)
                if pg.locator('.m-form-dm').count() > 0:
                    loi.append('Kho: modal chưa đóng sau khi Lưu')
            print('  - Kho (1-8): sửa và lưu thành công')

        # 3. Đối tượng danh-muc/1-5 (một dòng nhà cung cấp): bấm thẻ đầu ncc, form mở đúng tên dòng, sửa 1 ô chữ, Lưu
        path_dt = '/app/danh-muc/1-5'
        pg.goto(f'{URL}?goi=PL&p={abs(hash(path_dt))}#{path_dt}')
        pg.wait_for_timeout(800)
        chip_ncc = pg.locator('.m-chip:has-text("Nhà cung cấp")')
        if chip_ncc.count() > 0:
            chip_ncc.first.click()
            pg.wait_for_timeout(300)

        the_dt = pg.locator('.m-the-dm').first
        ten_dt_cu = pg.locator('.m-the-dm-ten').first.inner_text().strip() if pg.locator('.m-the-dm-ten').count() > 0 else ''
        the_dt.click()
        pg.wait_for_timeout(400)

        if pg.locator('.m-form-dm').count() == 0:
            loi.append('Đối tượng (1-5): bấm thẻ không mở modal .m-form-dm')
        else:
            inps = pg.locator('.m-form-dm input.inp')
            val = inps.nth(1).input_value() if inps.count() >= 2 else ''
            if ten_dt_cu and ten_dt_cu not in val:
                loi.append(f'Đối tượng (1-5): form mở không đúng tên dòng (thấy {val}, kỳ vọng chứa {ten_dt_cu})')
            if inps.count() >= 2:
                inps.nth(1).fill(val + ' (sửa)')
            nut_luu = kiem_nut_luu('Đối tượng sửa')
            if nut_luu:
                nut_luu.click()
                pg.wait_for_timeout(400)
                if pg.locator('.m-form-dm').count() > 0:
                    loi.append('Đối tượng: modal chưa đóng sau khi Lưu')
            print('  - Đối tượng (1-5): sửa và lưu thành công')

        # 4. Phương thức thanh toán: bấm thẻ đầu, form mở đúng tên dòng, sửa 1 ô chữ, Lưu
        path_pttt = '/app/danh-muc/phuong-thuc-thanh-toan'
        pg.goto(f'{URL}?goi=PL&p={abs(hash(path_pttt))}#{path_pttt}')
        pg.wait_for_timeout(800)
        the_pttt = pg.locator('.m-the-dm').first
        ten_pttt_cu = pg.locator('.m-the-dm-ten').first.inner_text().strip() if pg.locator('.m-the-dm-ten').count() > 0 else ''
        the_pttt.click()
        pg.wait_for_timeout(400)

        if pg.locator('.m-form-dm').count() == 0:
            loi.append('Phương thức thanh toán: bấm thẻ không mở modal .m-form-dm')
        else:
            inps = pg.locator('.m-form-dm input.inp')
            val = inps.nth(1).input_value() if inps.count() >= 2 else ''
            if ten_pttt_cu and ten_pttt_cu not in val:
                loi.append(f'Phương thức thanh toán: form mở không đúng tên dòng (thấy {val}, kỳ vọng chứa {ten_pttt_cu})')
            if inps.count() >= 2:
                inps.nth(1).fill(val + ' (sửa)')
            nut_luu = kiem_nut_luu('Phương thức thanh toán sửa')
            if nut_luu:
                nut_luu.click()
                pg.wait_for_timeout(400)
                if pg.locator('.m-form-dm').count() > 0:
                    loi.append('Phương thức thanh toán: modal chưa đóng sau khi Lưu')
            print('  - Phương thức thanh toán: sửa và lưu thành công')

        if con:
            loi.append(f'Form danh mục: lỗi console {con[:2]}')

        b.close()
    return loi


def kiem_tra_bao_cao_dot_7():
    loi = []
    print('Kiểm tra báo cáo đợt 7 (390px, gói PL, chế độ mặc định & TT58):')
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

        def vao(path, goi='PL', che_do=None):
            pg.goto(URL + '#/dang-nhap')
            pg.wait_for_selector('.auth-box')
            s = json.loads(phien(goi))
            if che_do:
                s['cheDo'] = che_do
            pg.evaluate(f"localStorage.setItem('iacc-cloud-session', {json.dumps(json.dumps(s))})")
            pg.goto(f'{URL}?goi={goi}&cd={che_do or "df"}&p={abs(hash(path))}#{path}')
            pg.wait_for_selector('.m-than > *')
            pg.wait_for_timeout(300)

        SHOTS.mkdir(exist_ok=True)
        # 1. Mở tab Báo cáo, thấy ít nhất 2 thẻ nhóm
        vao('/app/bao-cao/tat-ca', 'PL')
        pg.screenshot(path=str(SHOTS / 'm-07-bao-cao.png'))
        the_nhom = pg.locator('.m-bc-the-nhom')
        if the_nhom.count() < 2:
            loi.append(f'Tab Báo cáo: không đủ 2 thẻ nhóm (thấy {the_nhom.count()})')
        else:
            print(f'  - Tab Báo cáo: thấy {the_nhom.count()} thẻ nhóm')

        # 2. Gõ tìm "quỹ" thấy Sổ quỹ tiền mặt
        pg.locator('.m-ds-tim-inp').first.fill('quỹ')
        pg.wait_for_timeout(200)
        co_so_quy = pg.locator(':text("Sổ quỹ tiền mặt")').count() > 0
        if not co_so_quy:
            loi.append('Tìm kiếm "quỹ" trong Báo cáo: không thấy Sổ quỹ tiền mặt')
        else:
            print('  - Tìm "quỹ": thấy Sổ quỹ tiền mặt')

        # 3. Mở Sổ quỹ tiền mặt, Sổ ngân hàng, hai báo cáo tài chính TT58 (B01 và B02) gói S
        ds_man = [
            ('Sổ quỹ tiền mặt', '/app/tien/2-2-1', False, 'PL', None, 'm-07-so-quy.png'),
            ('Sổ ngân hàng', '/app/tien/2-2-3', True, 'PL', None, 'm-07-so-ngan-hang.png'),
            ('Báo cáo tài chính TT58 (B01)', '/app/tong-hop/10-2-2', False, 'S', 'TT58', 'm-07-bctc-tt58.png'),
            ('Báo cáo tài chính TT58 (B02)', '/app/tong-hop/10-2-3', False, 'S', 'TT58', 'm-07-bctc-b02.png'),
        ]

        for ten_man, path, la_sbc, goi, cd, anh in ds_man:
            vao(path, goi, che_do=cd)
            pg.screenshot(path=str(SHOTS / anh))
            if con:
                loi.append(f'{ten_man} ({path}): lỗi console {con[:2]}')
                con.clear()

            than_txt = pg.evaluate("() => { const e = document.querySelector('.m-than'); return e ? (e.innerText || e.textContent || '').trim() : null; }")
            if not than_txt:
                loi.append(f'{ten_man} ({path}): trắng trang hoặc không có nội dung')
            else:
                than_lower = than_txt.lower()
                if 'chưa có mẫu' in than_lower or 'không dùng với thiết lập' in than_lower:
                    loi.append(f'{ten_man} ({path}): báo lỗi nội dung không hợp lệ ("chưa có mẫu" hoặc "không dùng với thiết lập")')

            tran = pg.evaluate("document.documentElement.scrollWidth > window.innerWidth")
            if tran:
                loi.append(f'{ten_man} ({path}): tràn ngang (scrollWidth > innerWidth)')

            co_bc_chon = pg.locator('.bc-chon').count() > 0
            if co_bc_chon:
                loi.append(f'{ten_man} ({path}): còn xuất hiện .bc-chon trong khung điện thoại')

            co_to_giay = pg.locator('.m-to-giay').count() > 0
            if co_to_giay:
                kiem_table = pg.evaluate("""() => {
                    const toGiay = document.querySelector('.m-to-giay');
                    if (!toGiay) return { ok: true };
                    const tables = Array.from(toGiay.querySelectorAll('table'));
                    if (tables.length === 0) return { ok: true };
                    let maxW = -1;
                    let maxRight = 0;
                    for (const t of tables) {
                        const r = t.getBoundingClientRect();
                        if (r.width > maxW) {
                            maxW = r.width;
                            maxRight = r.right;
                        }
                    }
                    return { ok: maxRight <= window.innerWidth + 1, right: maxRight, innerWidth: window.innerWidth };
                }""")
                if not kiem_table.get('ok'):
                    loi.append(f"{ten_man} ({path}): table lớn nhất trong .m-to-giay có right ({kiem_table.get('right')}) vượt innerWidth ({kiem_table.get('innerWidth')}) khi thu nhỏ")

            if la_sbc:
                wrap = pg.locator('.m-sbc-bang-wrap')
                if wrap.count() == 0:
                    loi.append(f'{ten_man} ({path}): không tìm thấy .m-sbc-bang-wrap')
                else:
                    co_cuon_ngang = pg.evaluate("() => { const e = document.querySelector('.m-sbc-bang-wrap'); return e ? e.scrollWidth > e.clientWidth : false; }")
                    if co_cuon_ngang:
                        pos_truoc = pg.evaluate("() => { const th = document.querySelector('.m-sbc-bang-wrap th:first-child'); return th ? th.getBoundingClientRect().left : 0; }")
                        pg.evaluate("() => { document.querySelector('.m-sbc-bang-wrap').scrollLeft = 250; }")
                        pg.wait_for_timeout(100)
                        scroll_left = pg.evaluate("() => document.querySelector('.m-sbc-bang-wrap').scrollLeft")
                        pos_sau = pg.evaluate("() => { const th = document.querySelector('.m-sbc-bang-wrap th:first-child'); return th ? th.getBoundingClientRect().left : 0; }")
                        if scroll_left < 50:
                            loi.append(f'{ten_man} ({path}): không cuộn ngang được khung bảng (scrollLeft = {scroll_left})')
                        if abs(pos_truoc - pos_sau) > 2:
                            loi.append(f'{ten_man} ({path}): cột ghim không giữ vị trí trái sau khi cuộn (trước: {pos_truoc}, sau: {pos_sau})')

            print(f'  - Đã kiểm: {ten_man} ({path})')

        b.close()
    return loi


def kiem_tra_dang_nhap_dot_8():
    loi = []
    print('Kiểm tra đăng nhập, chọn đơn vị, lập phiếu đợt 8 (390px):')
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

        def kiem_man(ten_man, nut_chinh_loc=None):
            if con:
                loi.append(f'{ten_man}: lỗi console {con[:2]}')
                con.clear()
            tran = pg.evaluate("document.documentElement.scrollWidth > window.innerWidth")
            if tran:
                loi.append(f'{ten_man}: tràn ngang (scrollWidth > innerWidth)')
            if nut_chinh_loc and nut_chinh_loc.count() > 0:
                nut = nut_chinh_loc.first
                nut.scroll_into_view_if_needed()
                pg.wait_for_timeout(100)
                bottom = nut.evaluate("el => el.getBoundingClientRect().bottom")
                inner_h = pg.evaluate("window.innerHeight")
                if bottom > inner_h + 1:
                    loi.append(f'{ten_man}: nút chính nằm ngoài khung nhìn (bottom={bottom} > innerHeight={inner_h})')

        SHOTS.mkdir(exist_ok=True)

        # 1. Bắt đầu từ localStorage trống
        pg.goto(URL + '#/dang-nhap')
        pg.evaluate("localStorage.clear()")
        pg.wait_for_timeout(200)

        # 2. Mở màn quên mật khẩu, kiểm không tràn ngang
        pg.goto(URL + '#/quen-mat-khau')
        pg.wait_for_selector('.auth-box')
        pg.wait_for_timeout(300)
        pg.screenshot(path=str(SHOTS / 'm-08-quen-mat-khau.png'))
        kiem_man('Quên mật khẩu')
        print('  - Màn Quên mật khẩu: không tràn ngang')

        # 3. Mở #/dang-nhap từ localStorage trống
        pg.goto(URL + '#/dang-nhap')
        pg.wait_for_selector('.auth-box')
        pg.wait_for_timeout(300)
        pg.screenshot(path=str(SHOTS / 'm-08-dang-nhap.png'))
        nut_login = pg.locator('.auth-box button[type="submit"]')
        kiem_man('Đăng nhập', nut_login)
        print('  - Màn Đăng nhập: không tràn ngang, nút trong khung nhìn')

        # Gõ email và mật khẩu như người dùng thật
        pg.locator('.auth-box input.inp').nth(0).fill('thuha@phomay.vn')
        pg.locator('.auth-box input[type="password"]').fill('123456')
        pg.wait_for_timeout(150)
        nut_login.click()
        pg.wait_for_timeout(500)

        # 4. Nếu có màn chọn đơn vị thì chọn đơn vị đầu tiên
        if pg.locator('.dv-card').count() > 0:
            pg.screenshot(path=str(SHOTS / 'm-08-chon-don-vi.png'))
            nut_dv = pg.locator('.dv-card').first
            kiem_man('Chọn đơn vị', nut_dv)
            print('  - Màn Chọn đơn vị: không tràn ngang, thẻ đơn vị trong khung nhìn')
            nut_dv.click()
            pg.wait_for_timeout(500)

        # 5. Vào được /app
        pg.wait_for_selector('.m-app')
        pg.wait_for_timeout(300)
        pg.screenshot(path=str(SHOTS / 'm-08-trang-chu.png'))
        kiem_man('Trang chủ /app')
        print('  - Vào được /app thành công')

        # 6. Mở Phiếu chi qua thao tác người dùng (Nghiệp vụ -> Thu chi -> Phiếu thu chi)
        tab_nv = pg.locator('.m-thanh-duoi a[href*="/app/nghiep-vu"]')
        if tab_nv.count() == 0:
            loi.append('Thanh dưới: không tìm thấy tab Nghiệp vụ')
        else:
            kiem_man('Tab Nghiệp vụ', tab_nv)
            tab_nv.click()
            pg.wait_for_timeout(300)
            kiem_man('Màn Nghiệp vụ')

            o_tien = pg.locator('.m-nv-o:has-text("Thu chi")')
            if o_tien.count() == 0:
                loi.append('Nghiệp vụ: không tìm thấy phân hệ Thu chi')
            else:
                kiem_man('Phân hệ Thu chi', o_tien)
                o_tien.click()
                pg.wait_for_timeout(300)
                kiem_man('Chi tiết phân hệ Thu chi')

                dong_pc = pg.locator('.m-nv-dong[href*="tien/2-1-1"]')
                if dong_pc.count() == 0:
                    loi.append('Phân hệ Thu chi: không tìm thấy màn Phiếu thu chi')
                else:
                    kiem_man('Dòng Phiếu thu chi', dong_pc)
                    dong_pc.click()
                    pg.wait_for_timeout(500)
                    pg.screenshot(path=str(SHOTS / 'm-08-ds-phieu-chi.png'))
                    kiem_man('Danh sách Phiếu chi')

                    nut_them = pg.locator('.m-nut-them-fab')
                    if nut_them.count() == 0:
                        loi.append('Phiếu chi: không tìm thấy nút thêm mới')
                    else:
                        kiem_man('Nút thêm Phiếu chi', nut_them)
                        nut_them.first.click()
                        pg.wait_for_timeout(200)

                        # Chọn loại "Chi" nếu có tấm trượt chọn loại
                        dong_chi = pg.locator('.m-tam-dong:has-text("Chi")')
                        if dong_chi.count() > 0:
                            dong_chi.first.click()
                            pg.wait_for_timeout(200)

                        if pg.locator('.m-lp').count() == 0:
                            loi.append('Phiếu chi: không mở form lập phiếu .m-lp')
                        else:
                            # Bước 1
                            nut_tiep_1 = pg.locator('.m-lp-nut-tiep, .m-lp-day button:has-text("Tiếp tục")')
                            if nut_tiep_1.count() == 0:
                                loi.append('Phiếu chi: thiếu nút Tiếp tục ở Bước 1')
                            else:
                                kiem_man('Lập phiếu chi Bước 1', nut_tiep_1)
                                pg.screenshot(path=str(SHOTS / 'm-08-lap-phieu-b1.png'))
                                nut_tiep_1.first.click()
                                pg.wait_for_timeout(250)

                                # Bước 2: Thêm dòng và điền số tiền
                                nut_them_dong = pg.locator('.m-lp-btn-them-dong, button:has-text("Thêm dòng")')
                                if nut_them_dong.count() > 0:
                                    nut_them_dong.first.click()
                                    pg.wait_for_timeout(150)

                                inps_tien = pg.locator('.m-lp-sua-inp.num')
                                if inps_tien.count() >= 1:
                                    inps_tien.nth(0).fill('600.000')

                                nut_tiep_2 = pg.locator('.m-lp-day button:has-text("Tiếp tục")')
                                kiem_man('Lập phiếu chi Bước 2', nut_tiep_2)
                                pg.screenshot(path=str(SHOTS / 'm-08-lap-phieu-b2.png'))
                                nut_tiep_2.first.click()
                                pg.wait_for_timeout(250)

                                # Bước 4: Lưu phiếu
                                nut_luu = pg.locator('.m-lp-day button.m-lp-nut-chinh')
                                if nut_luu.count() == 0:
                                    loi.append('Phiếu chi: không tìm thấy nút Lưu ở Bước 4')
                                else:
                                    kiem_man('Lập phiếu chi Bước 4', nut_luu)
                                    pg.screenshot(path=str(SHOTS / 'm-08-lap-phieu-b4.png'))
                                    nut_luu.first.click()
                                    pg.wait_for_timeout(400)

                                    thanh_cong = pg.locator('.m-lp-thanh-cong-tieu, :has-text("Tạo chứng từ thành công")')
                                    if thanh_cong.count() == 0:
                                        loi.append('Phiếu chi: không hiện màn hình Tạo chứng từ thành công')
                                    else:
                                        mota_txt = pg.locator('.m-lp-thanh-cong-mota').inner_text() if pg.locator('.m-lp-thanh-cong-mota').count() > 0 else ''
                                        m_so = re.search(r'([A-Z0-9\-\/]+2610\-[0-9]+|[A-Z]+2610\-[0-9]+)', mota_txt)
                                        so_phieu = m_so.group(1) if m_so else ''
                                        if not so_phieu:
                                            m_b = pg.locator('.m-lp-thanh-cong-mota b')
                                            if m_b.count() > 0:
                                                so_phieu = m_b.first.inner_text().strip()
                                        pg.screenshot(path=str(SHOTS / 'm-08-lap-phieu-thanh-cong.png'))
                                        nut_dong_xem = pg.locator('button:has-text("Xem phiếu"), button:has-text("Đóng")')
                                        kiem_man('Màn hình hoàn tất lập phiếu', nut_dong_xem)
                                        print(f'  - Lập phiếu chi thành công {so_phieu}: mọi màn không tràn ngang, nút chính trong khung nhìn')

        b.close()
    return loi


def kiem_tra_popup_khoi_tao_dot_8():
    """Popup khởi tạo (Thêm đơn vị kế toán) phủ kín màn 390px, nút cuối nằm trong khung nhìn (T184)"""
    loi = []
    with sync_playwright() as p:
        b = p.chromium.launch(channel='chrome')
        pg = b.new_page(viewport={'width': 390, 'height': 844}, is_mobile=True, has_touch=True)
        con = []
        pg.on('pageerror', lambda e: con.append(str(e)))
        pg.goto(URL + '#/dang-nhap')
        pg.wait_for_selector('.auth-box')
        pg.evaluate(f"localStorage.setItem('iacc-cloud-session', {json.dumps(phien('PL'))})")
        pg.goto(URL + '?popup=1#/chon-don-vi')
        pg.get_by_text('Thêm đơn vị kế toán').click()
        pg.wait_for_selector('.ktf-pop')
        pg.wait_for_timeout(500)
        r = pg.evaluate("() => { const q = document.querySelector('.ktf-pop').getBoundingClientRect(); return [q.x, q.y, q.width, q.height] }")
        if abs(r[0]) > 1 or abs(r[1]) > 1 or abs(r[2] - 390) > 1 or abs(r[3] - 844) > 1:
            loi.append(f'Popup khởi tạo: không phủ kín màn 390x844 (x={r[0]}, y={r[1]}, {r[2]}x{r[3]})')
        if pg.evaluate("document.documentElement.scrollWidth > innerWidth"):
            loi.append('Popup khởi tạo: tràn ngang')
        if con:
            loi.append(f'Popup khởi tạo: lỗi console {con[:2]}')
        print('  - Popup khởi tạo: phủ kín màn' if not loi else '  - Popup khởi tạo: có lỗi')
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
    loi_d3 = kiem_tra_man_dot_3()
    loi += loi_d3
    loi_d4 = kiem_tra_xem_phieu_dot_4()
    loi += loi_d4
    loi_d5 = kiem_tra_lap_phieu_dot_5()
    loi += loi_d5
    loi_d6 = kiem_tra_form_dm_dot_6()
    loi += loi_d6
    loi_d7 = kiem_tra_bao_cao_dot_7()
    loi += loi_d7
    loi_d8 = kiem_tra_dang_nhap_dot_8()
    loi += loi_d8
    loi += kiem_tra_popup_khoi_tao_dot_8()
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
                pg.wait_for_selector('.lockpage, .bc-nut-loc')
                if pg.locator('.lockpage').count():
                    continue
                for ky in ['8', '9', '10']:
                    # kỳ chọn trong popup lọc (nút phễu, T179): mở lịch, sang Chọn tháng, bấm tháng của năm 2026, Xác nhận, rồi Xem báo cáo
                    pg.locator('.bc-nut-loc').first.click()
                    pg.locator('.bc-loc-pop .kn-nut').click()
                    pg.locator('.kn-pop').get_by_role('button', name='Chọn tháng', exact=True).click()
                    pg.locator('.kn-luoi-thang').first.get_by_role('button', name=f'Thg {ky}', exact=True).click()
                    pg.locator('.kn-pop').get_by_role('button', name='Xác nhận', exact=True).click()
                    pg.locator('.bc-loc-pop-chan .bc-btn-xem').click()
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
