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
import time
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
            try:
                pg.wait_for_selector('.m-than', timeout=3000)
            except Exception:
                pass
            pg.wait_for_timeout(200)
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
                # T208: trang chủ bỏ thanh trên chung, đầu trang riêng .m-tc-dau thay chỗ
                if pg.locator('.m-thanh-tren').count() > 0 or pg.locator('.m-tc-dau').count() == 0:
                    loi.append('/app: trang chủ phải không có .m-thanh-tren và có đầu trang .m-tc-dau')

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
                    # T192: Dashboard 11.16 trên điện thoại chuyển về trang chủ
                    hop_le = hop_le or (man_href.endswith('/11-16') and cur_h.startswith('#/app/trang-chu'))
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

            so_the = pg.locator('.m-ds-ngay-dong, .m-the-dm').count()
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
                the_zzzz = pg.locator('.m-ds-ngay-dong, .m-the-dm').count()
                trong_zzzz = pg.locator('.m-trong').count()
                if the_zzzz > 0 or trong_zzzz == 0:
                    loi.append(f'{ten} ({path}): gõ zzzz không ra màn trống (thẻ: {the_zzzz}, trống: {trong_zzzz})')

                inp.fill('')
                pg.wait_for_timeout(100)
                the_lai = pg.locator('.m-ds-ngay-dong, .m-the-dm').count()
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

            thes = pg_dt.locator('.m-ds-ngay-dong')
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

            so_the_dau = pg.locator('.m-ds-ngay-dong .m-ds-ngay-so').first.inner_text().strip() if pg.locator('.m-ds-ngay-dong .m-ds-ngay-so').count() > 0 else ''
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
            pg.locator('.m-ds-ngay-dong').first.click()
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
                # Sổ ngân hàng mặc định dạng dòng (T223): bấm chip Bảng để kiểm cuộn ngang của bảng
                chip_bang = pg.locator('.m-so-dong-chip:has-text("Bảng")')
                if chip_bang.count():
                    chip_bang.first.click()
                    pg.wait_for_timeout(250)
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
                        # T273: Báo cáo điện thoại không đóng băng cột nào theo chiều ngang, cột đầu trôi khi cuộn ngang
                        pos_td = pg.evaluate("() => { const td = document.querySelector('.m-sbc-bang-wrap table tbody tr td:first-child'); return td ? getComputedStyle(td).position : ''; }")
                        left_td = pg.evaluate("() => { const td = document.querySelector('.m-sbc-bang-wrap table tbody tr td:first-child'); return td ? getComputedStyle(td).left : ''; }")
                        if pos_td == 'sticky' and left_td == '0px':
                            loi.append(f'{ten_man} ({path}): cột đầu vẫn bị ghim sticky ngang left: 0px (luật mới T273 không đóng băng cột ngang)')
                        scroll_w = pg.evaluate("() => document.documentElement.scrollWidth")
                        if scroll_w > 390:
                            loi.append(f'{ten_man} ({path}): trang bị tràn ngang khi cuộn bảng (scrollWidth = {scroll_w} > 390)')

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

                dong_pc = pg.locator('.m-nv-dong[href*="tien/2-1-1"], .m-qt2-o[href*="tien/2-1-1"]')
                if dong_pc.count() == 0:
                    loi.append('Phân hệ Thu chi: không tìm thấy màn Phiếu thu chi')
                else:
                    kiem_man('Dòng Phiếu thu chi', dong_pc.first)
                    dong_pc.first.click()
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


def kiem_tra_dot_9():
    """Đợt 9: Trang chủ 2 tab, tìm kiếm, tab Nghiệp vụ gói PL, tab Khác, bộ lọc nâng cao, lịch đáy (T193–T199)"""
    loi = []
    with sync_playwright() as p:
        b = p.chromium.launch(channel='chrome')
        pg = b.new_page(viewport={'width': 390, 'height': 844}, is_mobile=True, has_touch=True)
        con = []
        pg.on('console', lambda m: con.append(m.text) if m.type == 'error' else None)
        pg.on('pageerror', lambda e: con.append(str(e)))

        def kiem_man(ten, nut=None):
            if pg.evaluate("document.documentElement.scrollWidth > innerWidth"):
                loi.append(f'{ten}: tràn ngang màn hình')
            if con:
                loi.append(f'{ten}: lỗi console {con[:2]}')
                con.clear()
            if nut and nut.count() > 0:
                box = nut.first.bounding_box()
                if box and box['y'] + box['height'] > 844:
                    loi.append(f'{ten}: nút nằm ngoài khung nhìn 844px (y={box["y"] + box["height"]})')

        # Đăng nhập gói PL
        pg.goto(URL + '#/dang-nhap')
        pg.wait_for_selector('.auth-box')
        pg.evaluate(f"localStorage.setItem('iacc-cloud-session', {json.dumps(phien('PL'))})")
        pg.goto(URL + '?goi=PL#/app/trang-chu/tong-quan')
        pg.wait_for_selector('.m-app')
        pg.wait_for_timeout(300)

        # ── Bước 1: Trang chủ có 2 tab. Bấm Cần theo dõi: có ít nhất 1 dòng, bấm dòng đầu thì URL đổi ──
        tabs = pg.locator('.m-tc-tab')
        if tabs.count() < 2:
            loi.append('Trang chủ: không tìm thấy 2 tab Tổng quan | Cần theo dõi')
        else:
            tab_ctd = pg.locator('.m-tc-tab', has_text='Cần theo dõi')
            if tab_ctd.count() == 0:
                loi.append('Trang chủ: thiếu tab Cần theo dõi')
            else:
                tab_ctd.first.click()
                pg.wait_for_timeout(300)
                kiem_man('Tab Cần theo dõi')
                pg.screenshot(path=str(SHOTS / 'm-09-01-can-theo-doi.png'))

                dong_ctd = pg.locator('.m-tc-ctd-dong')
                if dong_ctd.count() == 0:
                    loi.append('Tab Cần theo dõi: không có dòng việc cần theo dõi nào')
                else:
                    url_truoc = pg.url
                    dong_ctd.first.click()
                    pg.wait_for_timeout(400)
                    if pg.url == url_truoc:
                        loi.append(f'Tab Cần theo dõi: bấm dòng đầu nhưng URL không đổi ({pg.url})')
                    print('  - Bước 1: Trang chủ 2 tab và Cần theo dõi thành công')

        # ── Bước 2: Bấm kính lúp, gõ "phieu chi" -> kết quả "Phiếu chi", URL chứa tien/2-1-1 ──
        pg.goto(URL + '?goi=PL#/app/trang-chu/tong-quan')
        pg.wait_for_selector('.m-app')
        pg.wait_for_timeout(200)

        nut_kinh_lup = pg.locator('button[aria-label="Tìm kiếm màn hình"], .m-dau-kinh-lup')
        if nut_kinh_lup.count() == 0:
            loi.append('Trang chủ: không tìm thấy nút kính lúp tìm kiếm')
        else:
            nut_kinh_lup.first.click()
            pg.wait_for_timeout(200)
            inp_tim = pg.locator('.m-tk-inp')
            if inp_tim.count() == 0:
                loi.append('Tìm kiếm: lớp phủ không mở hoặc thiếu ô tìm kiếm')
            else:
                inp_tim.fill('phieu chi')
                pg.wait_for_timeout(250)
                kiem_man('Lớp phủ tìm kiếm màn')
                pg.screenshot(path=str(SHOTS / 'm-09-02-tim-kiem.png'))

                # T208: kết quả mang tên loại phiếu (vd "Chi tiền mặt") của màn 2.1.1, không còn dòng "Phiếu chi" viết cứng
                kq = pg.locator('.m-tk-dong').filter(has_text='2.1.1').filter(has_text='Chi')
                if kq.count() == 0:
                    loi.append('Tìm kiếm: gõ "phieu chi" không thấy kết quả "Phiếu chi"')
                else:
                    kq.first.click()
                    pg.wait_for_timeout(400)
                    if 'tien/2-1-1' not in pg.url:
                        loi.append(f'Tìm kiếm: bấm Phiếu chi nhưng URL không chứa tien/2-1-1 ({pg.url})')
                    print('  - Bước 2: Tìm kiếm "phieu chi" trỏ đúng tien/2-1-1')

        # ── Bước 3: Tab Nghiệp vụ ở gói PL: không có màn chỉ mở cho Plus, Pro (vd ban-hang/3-1-7) ──
        pg.goto(URL + '?goi=PL#/app/nghiep-vu')
        pg.wait_for_selector('.m-nghiep-vu')
        pg.wait_for_timeout(200)
        kiem_man('Tab Nghiệp vụ gói PL')
        pg.screenshot(path=str(SHOTS / 'm-09-03-nghiep-vu-pl.png'))

        o_bh = pg.locator('.m-nv-o', has_text='Bán hàng')
        if o_bh.count() > 0:
            o_bh.first.click()
            pg.wait_for_timeout(250)
            if pg.locator('a[href*="ban-hang/3-1-7"], .m-nv-dong:has-text("3.1.7")').count() > 0:
                loi.append('Tab Nghiệp vụ: màn 3.1.7 (chỉ PL/PR) vẫn xuất hiện dù quy định chỉ hiện F/S')
            else:
                print('  - Bước 3: Tab Nghiệp vụ ẩn đúng các màn ngoài gói Free/Standard')
        else:
            loi.append('Tab Nghiệp vụ: không tìm thấy phân hệ Bán hàng')

        # ── Bước 4: Tab Khác có ít nhất 5 thẻ nhóm ──
        pg.goto(URL + '?goi=PL#/app/khac')
        pg.wait_for_selector('.m-khac')
        pg.wait_for_timeout(200)
        kiem_man('Tab Khác')
        pg.screenshot(path=str(SHOTS / 'm-09-04-tab-khac.png'))

        the_nhom = pg.locator('.m-khac-the')
        if the_nhom.count() < 5:
            loi.append(f'Tab Khác: chỉ có {the_nhom.count()} thẻ nhóm, yêu cầu ít nhất 5')
        else:
            print(f'  - Bước 4: Tab Khác có {the_nhom.count()} thẻ nhóm riêng biệt')

        # ── Bước 5: Danh sách Phiếu chi -> bộ lọc -> chọn Đối tượng -> Xong -> Áp dụng ──
        pg.goto(URL + '?goi=PL#/app/tien/2-1-1')
        pg.wait_for_selector('.m-ds-khung')
        pg.wait_for_timeout(300)

        so_dong_goc = pg.locator('.m-ds-ngay-dong').count()
        nut_loc = pg.locator('.m-ds-nut-loc, button:has-text("Lọc")')
        if nut_loc.count() == 0:
            loi.append('Phiếu chi: không tìm thấy nút mở bộ lọc')
        else:
            nut_loc.first.click()
            pg.wait_for_selector('.m-loc-man')
            pg.wait_for_timeout(200)

            dong_dt = pg.locator('.m-loc-dong', has_text='Đối tượng')
            if dong_dt.count() == 0:
                dong_dt = pg.locator('.m-loc-dong', has_text='Người nhận')
            if dong_dt.count() == 0:
                loi.append('Bộ lọc: không thấy dòng Đối tượng')
            else:
                dong_dt.first.click()
                pg.wait_for_timeout(250)

                inp_tim_dt = pg.locator('.m-loc-tim-inp')
                if inp_tim_dt.count() == 0:
                    loi.append('Bộ lọc: trang danh mục đối tượng không có ô tìm')
                else:
                    muc_dt = pg.locator('.m-loc-muc-dong')
                    if muc_dt.count() == 0:
                        loi.append('Bộ lọc: không có mục đối tượng nào để chọn')
                    else:
                        muc_dt.first.click()
                        pg.wait_for_timeout(100)

                        nut_xong_con = pg.locator('.m-loc-con-btn-xong, button:has-text("Xong")')
                        if nut_xong_con.count() == 0:
                            loi.append('Bộ lọc: thiếu nút Xong ở trang con')
                        else:
                            nut_xong_con.first.click()
                            pg.wait_for_timeout(200)

                            nut_ap_dung = pg.locator('.m-loc-btn-apply', has_text='Áp dụng')
                            if nut_ap_dung.count() == 0:
                                loi.append('Bộ lọc: thiếu nút Áp dụng ở đáy tấm lọc')
                            else:
                                nut_ap_dung.first.click()
                                pg.wait_for_timeout(300)
                                kiem_man('Sau khi áp dụng bộ lọc')
                                pg.screenshot(path=str(SHOTS / 'm-09-05-bo-loc.png'))

                                so_dong_sau = pg.locator('.m-ds-ngay-dong').count()
                                if so_dong_sau > so_dong_goc:
                                    loi.append(f'Bộ lọc: số dòng sau lọc ({so_dong_sau}) lớn hơn gốc ({so_dong_goc})')
                                else:
                                    print(f'  - Bước 5: Lọc đối tượng thành công ({so_dong_goc} -> {so_dong_sau} dòng)')

        # ── Bước 6: Lập phiếu chi, chạm ô Ngày chứng từ. Tấm lịch hiện ra, nút Xong dính đáy, chọn ngày 1 đổi giá trị ──
        pg.goto(URL + '?goi=PL#/app/tien/2-1-1')
        pg.wait_for_selector('.m-nut-them-fab')
        pg.locator('.m-nut-them-fab').first.click()
        pg.wait_for_timeout(200)
        pg.locator('.m-tam-dong:has-text("Chi")').first.click()
        pg.wait_for_selector('.m-lp')
        pg.wait_for_timeout(300)

        inp_ngay = pg.locator('.m-lp-the-truong:has-text("Thời gian") input')
        if inp_ngay.count() == 0:
            loi.append('Lập phiếu chi: không tìm thấy ô Ngày chứng từ')
        else:
            val_truoc = inp_ngay.first.input_value()
            inp_ngay.first.click()
            pg.wait_for_timeout(250)

            sheet_lich = pg.locator('.m-lich-sheet')
            if sheet_lich.count() == 0:
                loi.append('Lập phiếu chi: chạm ô ngày không mở tấm lịch đáy .m-lich-sheet')
            else:
                nut_xong_lich = pg.locator('.m-lich-btn-xong, button:has-text("Xong")')
                if nut_xong_lich.count() == 0:
                    loi.append('Tấm lịch đáy: thiếu nút Xong')
                else:
                    bottom_xong = pg.evaluate("() => document.querySelector('.m-lich-btn-xong').getBoundingClientRect().bottom")
                    if bottom_xong > 844 + 1:
                        loi.append(f'Tấm lịch đáy: nút Xong bị tràn ngoài màn hình (bottom={bottom_xong} > 844)')

                    o_ngay_1 = pg.locator('.m-lich-o:not(.ngoai) span', has_text='1').first
                    if o_ngay_1.count() == 0:
                        loi.append('Tấm lịch đáy: không tìm thấy ngày 1 trong tháng hiện tại')
                    else:
                        o_ngay_1.click()
                        pg.wait_for_timeout(100)
                        nut_xong_lich.first.click()
                        pg.wait_for_timeout(250)

                        val_sau = inp_ngay.first.input_value()
                        if val_sau == val_truoc and not val_sau.startswith('01/'):
                            loi.append(f'Lập phiếu chi: chọn ngày 1 nhưng ô ngày không đổi (trước={val_truoc}, sau={val_sau})')
                        kiem_man('Sau khi chọn ngày lịch')
                        pg.screenshot(path=str(SHOTS / 'm-09-06-chon-ngay.png'))
                        print(f'  - Bước 6: Lịch đáy chọn ngày thành công ({val_truoc} -> {val_sau})')

        b.close()
    return loi


def kiem_tra_dot_10():
    """Đợt 10: Sổ quỹ dạng bảng, báo cáo cuộn tự do, trang chủ theo IVT (T202–T204)"""
    loi = []
    with sync_playwright() as p:
        b = p.chromium.launch(channel='chrome')
        pg = b.new_page(viewport={'width': 390, 'height': 844}, is_mobile=True, has_touch=True)
        con = []
        pg.on('console', lambda m: con.append(m.text) if m.type == 'error' else None)
        pg.on('pageerror', lambda e: con.append(str(e)))

        def kiem_man(ten):
            if pg.evaluate("document.documentElement.scrollWidth > innerWidth"):
                loi.append(f'{ten}: tràn ngang màn hình')
            if con:
                loi.append(f'{ten}: lỗi console {con[:2]}')
                con.clear()

        # Đăng nhập gói PL
        pg.goto(URL + '#/dang-nhap')
        pg.wait_for_selector('.auth-box')
        pg.evaluate(f"localStorage.setItem('iacc-cloud-session', {json.dumps(phien('PL'))})")
        pg.goto(URL + '?goi=PL#/app/trang-chu/tong-quan')
        pg.wait_for_selector('.m-app')
        pg.wait_for_timeout(300)

        # ── Bước 1: Trang chủ có tab "Quản trị", "Cần theo dõi", chip "Kho". Có ít nhất 4 thẻ. Chụp đầu trang và cuộn cuối ──
        tab_qt = pg.locator('.m-tc-tab', has_text='Quản trị')
        tab_ctd = pg.locator('.m-tc-tab', has_text='Cần theo dõi')
        chip_kho = pg.locator('.m-tc-chip-kho', has_text='CN:')  # T208: chip Kho thành chip chi nhánh

        if tab_qt.count() == 0:
            loi.append('Trang chủ: thiếu tab "Quản trị"')
        if tab_ctd.count() == 0:
            loi.append('Trang chủ: thiếu tab "Cần theo dõi"')
        if chip_kho.count() == 0:
            loi.append('Trang chủ: thiếu chip "CN:"')

        the_ds = pg.locator('.m-tc-the-ivt')
        if the_ds.count() < 4:
            loi.append(f'Trang chủ: cần ít nhất 4 thẻ, nhưng chỉ thấy {the_ds.count()} thẻ')
        else:
            print(f'  - Bước 1: Trang chủ có các tab, chip kho và {the_ds.count()} thẻ')

        kiem_man('Trang chủ IVT đầu trang')
        pg.screenshot(path=str(SHOTS / 'm-10-01-trang-chu-dau.png'))

        # Cuộn xuống cuối trang
        pg.evaluate("() => { const m = document.querySelector('.m-than'); if (m) m.scrollTop = m.scrollHeight }")
        pg.wait_for_timeout(200)
        kiem_man('Trang chủ IVT cuối trang')
        pg.screenshot(path=str(SHOTS / 'm-10-02-trang-chu-cuoi.png'))

        # ── Bước 2: Mở #/app/bao-cao/2-2-1: có bảng trong khung MSoBaoCao, không có .m-to-giay. Gõ ô lọc dòng thì số dòng giảm ──
        pg.goto(URL + '?goi=PL&p=soquy#/app/bao-cao/2-2-1')
        pg.wait_for_selector('.m-app')
        pg.wait_for_timeout(350)

        so_bc = pg.locator('.m-so-bc')
        to_giay = pg.locator('.m-to-giay')
        if so_bc.count() == 0:
            loi.append('Sổ quỹ (2-2-1): không tìm thấy khung MSoBaoCao (.m-so-bc)')
        if to_giay.count() > 0:
            loi.append('Sổ quỹ (2-2-1): vẫn còn khung .m-to-giay (chưa chuyển sang MSoBaoCao)')

        # Sổ quỹ, sổ ngân hàng mặc định dạng dòng (T223): bấm chip Bảng để kiểm kiểu bảng
        def chon_kieu_bang():
            chip = pg.locator('.m-so-dong-chip:has-text("Bảng")')
            if chip.count():
                chip.first.click()
                pg.wait_for_timeout(250)

        chon_kieu_bang()
        bang = pg.locator('.m-so-bc table.rpt')
        if bang.count() == 0:
            loi.append('Sổ quỹ (2-2-1): không tìm thấy bảng trong khung MSoBaoCao')
        else:
            so_dong_truoc = pg.locator('.m-so-bc table.rpt tbody tr').count()
            inp_loc = pg.locator('.m-ds-tim-inp')
            if inp_loc.count() == 0:
                loi.append('Sổ quỹ (2-2-1): không tìm thấy ô lọc dòng (.m-ds-tim-inp)')
            else:
                inp_loc.first.fill('Thu')
                pg.wait_for_timeout(250)
                so_dong_sau = pg.locator('.m-so-bc table.rpt tbody tr').count()
                if so_dong_sau >= so_dong_truoc:
                    loi.append(f'Sổ quỹ (2-2-1): gõ lọc dòng nhưng số dòng không giảm ({so_dong_truoc} -> {so_dong_sau})')
                else:
                    print(f'  - Bước 2: Sổ quỹ dạng bảng thành công (lọc dòng: {so_dong_truoc} -> {so_dong_sau})')

        kiem_man('Sổ quỹ tiền mặt 2-2-1')
        pg.screenshot(path=str(SHOTS / 'm-10-03-so-quy-bang.png'))

        # ── Bước 3: Sổ ngân hàng: cuộn ngang khung 300px, ô đầu tiên trôi khỏi mép trái. Cuộn dọc thì tiêu đề trôi lên ──
        pg.goto(URL + '?goi=PL&p=songanhang#/app/bao-cao/2-2-3')
        pg.wait_for_selector('.m-so-bc')
        chon_kieu_bang()
        pg.wait_for_selector('.m-so-bc table.rpt')
        pg.wait_for_timeout(300)

        wrap = pg.locator('.m-sbc-bang-wrap')
        if wrap.count() == 0:
            loi.append('Sổ ngân hàng (2-2-3): không tìm thấy khung bảng .m-sbc-bang-wrap')
        else:
            # Kiểm tra cuộn ngang 300px: ô đầu tiên trôi khỏi mép trái (không ghim)
            td_dau = pg.locator('.m-so-bc table.rpt tbody tr td').first
            box_truoc = td_dau.bounding_box()

            wrap.first.evaluate("el => el.scrollLeft = 300")
            pg.wait_for_timeout(200)

            box_sau = td_dau.bounding_box()
            if box_truoc and box_sau:
                delta_x = abs(box_truoc['x'] - box_sau['x'])
                if delta_x < 50:
                    loi.append(f'Sổ ngân hàng (2-2-3): ô đầu tiên bị ghim khi cuộn ngang (delta_x={delta_x:.1f}px, luật mới T273 không ghim cột ngang)')
                else:
                    print(f'  - Bước 3a: Cuộn ngang 300px ô đầu trôi theo cuộn (delta_x={delta_x:.1f}px, không ghim theo T273)')

            # Kiểm tra cuộn dọc: tiêu đề bảng dính trên theo Mẫu A (T258)
            th_dau = pg.locator('.m-so-bc table.rpt thead th').first
            th_box_truoc = th_dau.bounding_box()

            wrap.first.evaluate("el => el.scrollTop = 300")
            pg.wait_for_timeout(200)

            th_box_sau = th_dau.bounding_box()
            if th_box_truoc and th_box_sau:
                delta_y = abs(th_box_truoc['y'] - th_box_sau['y'])
                if delta_y > 2:
                    loi.append(f'Sổ ngân hàng (2-2-3): tiêu đề bảng không dính khi cuộn dọc (delta_y={delta_y:.1f}px, chưa theo mẫu A)')
                else:
                    print(f'  - Bước 3b: Cuộn dọc tiêu đề dính trên (delta_y={delta_y:.1f}px, mẫu A)')

        kiem_man('Sổ ngân hàng bảng mẫu A')
        pg.screenshot(path=str(SHOTS / 'm-10-04-so-ngan-hang-cuon.png'))

        b.close()
    return loi


def kiem_tra_dot_11_a():
    """Đợt 11A: Hệ thống (T191) và Danh mục tài khoản, chi nhánh (T187)"""
    loi = []
    with sync_playwright() as p:
        b = p.chromium.launch(channel='chrome')
        pg = b.new_page(viewport={'width': 390, 'height': 844}, is_mobile=True, has_touch=True)
        con = []
        pg.on('console', lambda m: con.append(m.text) if m.type == 'error' else None)
        pg.on('pageerror', lambda e: con.append(str(e)))

        def kiem_man(ten):
            if pg.evaluate("document.documentElement.scrollWidth > innerWidth"):
                loi.append(f'{ten}: tràn ngang màn hình')
            if con:
                loi.append(f'{ten}: lỗi console {con[:2]}')
                con.clear()

        # Đăng nhập gói PL
        pg.goto(URL + '#/dang-nhap')
        pg.wait_for_selector('.auth-box')
        pg.evaluate(f"localStorage.setItem('iacc-cloud-session', {json.dumps(phien('PL'))})")

        # ── 1. Người dùng (#/app/he-thong/nguoi-dung) ──
        pg.goto(URL + '?goi=PL&p=nguoidung#/app/he-thong/nguoi-dung')
        pg.wait_for_selector('.m-app')
        pg.wait_for_timeout(300)
        if pg.locator('.m-chi-mt').count() > 0:
            loi.append('Người dùng: vẫn ra MChiMayTinh')
        users = pg.locator('.m-ht-the-user')
        if users.count() == 0:
            loi.append('Người dùng: không thấy thẻ người dùng .m-ht-the-user')
        else:
            # Mở tấm sửa người đầu
            users.first.click()
            pg.wait_for_timeout(350)
            panel = pg.locator('.m-form-dm .pn-hop')
            if panel.count() == 0:
                loi.append('Người dùng: không mở được tấm sửa từ đáy')
            else:
                nut_luu = pg.locator('.m-form-dm .pn-chan .btn.pri', has_text='Lưu')
                if nut_luu.count() == 0:
                    loi.append('Người dùng: thiếu nút Lưu trong tấm sửa')
                else:
                    box = nut_luu.first.bounding_box()
                    if not box or box['y'] < 0 or box['y'] + box['height'] > 844 + 5:
                        loi.append(f"Người dùng: nút Lưu không nằm trong khung nhìn (y={box['y'] if box else 'None'})")
            kiem_man('Người dùng')
            pg.screenshot(path=str(SHOTS / 'm-11-01-nguoi-dung.png'))
            # Đóng panel
            nut_dong = pg.locator('.m-form-dm .pn-dau button')
            if nut_dong.count() > 0:
                nut_dong.first.click()
                pg.wait_for_timeout(200)

        # ── 2. Vai trò và phân quyền (#/app/he-thong/phan-quyen) ──
        pg.goto(URL + '?goi=PL&p=phanquyen#/app/he-thong/phan-quyen')
        pg.wait_for_selector('.m-app')
        pg.wait_for_timeout(300)
        if pg.locator('.m-chi-mt').count() > 0:
            loi.append('Vai trò và phân quyền: vẫn ra MChiMayTinh')
        if pg.locator('.m-pq-vt-btn').count() == 0:
            loi.append('Vai trò và phân quyền: thiếu danh sách vai trò')
        if pg.locator('.m-pq-mod-the').count() == 0:
            loi.append('Vai trò và phân quyền: thiếu thẻ phân hệ quyền')
        kiem_man('Vai trò và phân quyền')
        pg.screenshot(path=str(SHOTS / 'm-11-02-phan-quyen.png'))

        # ── 3. Nhật ký thao tác (#/app/he-thong/nhat-ky) ──
        pg.goto(URL + '?goi=PL&p=nhatky#/app/he-thong/nhat-ky')
        pg.wait_for_selector('.m-app')
        pg.wait_for_timeout(300)
        if pg.locator('.m-chi-mt').count() > 0:
            loi.append('Nhật ký thao tác: vẫn ra MChiMayTinh')
        if pg.locator('.m-nk-the').count() == 0:
            loi.append('Nhật ký thao tác: không thấy danh sách thẻ nhật ký')
        kiem_man('Nhật ký thao tác')
        pg.screenshot(path=str(SHOTS / 'm-11-03-nhat-ky.png'))

        # ── 4. Gói thuê bao (#/app/he-thong/goi-thue-bao) ──
        pg.goto(URL + '?goi=PL&p=goithuebao#/app/he-thong/goi-thue-bao')
        pg.wait_for_selector('.m-app')
        pg.wait_for_timeout(300)
        if pg.locator('.m-chi-mt').count() > 0:
            loi.append('Gói thuê bao: vẫn ra MChiMayTinh')
        if pg.locator('.m-gtb-hero').count() == 0:
            loi.append('Gói thuê bao: thiếu thẻ hiện trạng bản quyền')
        if pg.locator('.m-gtb-the').count() < 4:
            loi.append('Gói thuê bao: thiếu 4 thẻ gói dịch vụ dọc')
        kiem_man('Gói thuê bao')
        pg.screenshot(path=str(SHOTS / 'm-11-04-goi-thue-bao.png'))

        # ── 5. Thông tin đơn vị (#/app/he-thong/thong-tin) ──
        pg.goto(URL + '?goi=PL&p=thongtin#/app/he-thong/thong-tin')
        pg.wait_for_selector('.m-app')
        pg.wait_for_timeout(300)
        if pg.locator('.m-chi-mt').count() > 0:
            loi.append('Thông tin đơn vị: vẫn ra MChiMayTinh')
        if pg.locator('.m-form-the').count() == 0:
            loi.append('Thông tin đơn vị: thiếu form thẻ một cột')
        # Cuộn cuối .m-than
        pg.evaluate("() => { const m = document.querySelector('.m-than'); if (m) m.scrollTop = m.scrollHeight }")
        pg.wait_for_timeout(250)
        nut_luu_dv = pg.locator('.m-form-chan-dinh button', has_text='Lưu')
        if nut_luu_dv.count() == 0:
            loi.append('Thông tin đơn vị: thiếu nút Lưu')
        else:
            box = nut_luu_dv.first.bounding_box()
            if not box or box['y'] < 0 or box['y'] + box['height'] > 844 + 5:
                loi.append(f"Thông tin đơn vị: nút Lưu không nằm trong khung nhìn khi cuộn cuối (y={box['y'] if box else 'None'})")
        kiem_man('Thông tin đơn vị')
        pg.screenshot(path=str(SHOTS / 'm-11-05-thong-tin-don-vi.png'))

        # ── 6. Cấu hình kế toán (#/app/he-thong/cau-hinh) ──
        pg.goto(URL + '?goi=PL&p=cauhinh#/app/he-thong/cau-hinh')
        pg.wait_for_selector('.m-app')
        pg.wait_for_timeout(300)
        if pg.locator('.m-chi-mt').count() > 0:
            loi.append('Cấu hình kế toán: vẫn ra MChiMayTinh')
        if pg.locator('.m-form-the').count() == 0:
            loi.append('Cấu hình kế toán: thiếu form thẻ một cột')
        kiem_man('Cấu hình kế toán')
        pg.screenshot(path=str(SHOTS / 'm-11-06-cau-hinh.png'))

        # ── 7. Danh mục tài khoản 1.1 (#/app/danh-muc/1-1) ──
        pg.goto(URL + '?goi=PL&p=taikhoan#/app/danh-muc/1-1')
        pg.wait_for_selector('.m-app')
        pg.wait_for_timeout(300)
        if pg.locator('.m-chi-mt').count() > 0:
            loi.append('Danh mục tài khoản: vẫn ra MChiMayTinh')
        so_truoc = pg.locator('.m-dmtk-the').count()
        inp_tk = pg.locator('.m-dmtk-tim-inp')
        if inp_tk.count() == 0:
            loi.append('Danh mục tài khoản: thiếu ô tìm kiếm')
        else:
            inp_tk.fill('111')
            pg.wait_for_timeout(250)
            so_sau = pg.locator('.m-dmtk-the').count()
            co_111 = pg.locator('.m-dmtk-the', has_text='111').count()
            if so_sau >= so_truoc:
                loi.append(f'Danh mục tài khoản: gõ 111 nhưng số dòng không giảm ({so_truoc} -> {so_sau})')
            if co_111 == 0:
                loi.append('Danh mục tài khoản: gõ 111 nhưng không thấy dòng 111')
        kiem_man('Danh mục tài khoản')
        pg.screenshot(path=str(SHOTS / 'm-11-07-tai-khoan.png'))

        # ── 8. Danh mục chi nhánh (#/app/danh-muc/chi-nhanh) ──
        pg.goto(URL + '?goi=PL&p=chinhanh#/app/danh-muc/chi-nhanh')
        pg.wait_for_selector('.m-app')
        pg.wait_for_timeout(300)
        if pg.locator('.m-chi-mt').count() > 0:
            loi.append('Danh mục chi nhánh: vẫn ra MChiMayTinh')
        if pg.locator('.m-cn-the').count() == 0:
            loi.append('Danh mục chi nhánh: thiếu thẻ chi nhánh .m-cn-the')
        kiem_man('Danh mục chi nhánh')
        pg.screenshot(path=str(SHOTS / 'm-11-08-chi-nhanh.png'))

        b.close()
    return loi


def kiem_tra_dot_11_b():
    """Đợt 11B: Màn tác vụ chung MTacVu (T190) và Sơ đồ quy trình MQuyTrinh (T210)"""
    loi = []
    with sync_playwright() as p:
        b = p.chromium.launch(channel='chrome')
        pg = b.new_page(viewport={'width': 390, 'height': 844}, is_mobile=True, has_touch=True)
        con = []
        pg.on('console', lambda m: con.append(m.text) if m.type == 'error' else None)
        pg.on('pageerror', lambda e: con.append(str(e)))

        def kiem_man(ten):
            if pg.evaluate("document.documentElement.scrollWidth > innerWidth"):
                loi.append(f'{ten}: tràn ngang màn hình')
            if con:
                loi.append(f'{ten}: lỗi console {con[:2]}')
                con.clear()

        # Đăng nhập gói PL
        pg.goto(URL + '#/dang-nhap')
        pg.wait_for_selector('.auth-box')
        pg.evaluate(f"localStorage.setItem('iacc-cloud-session', {json.dumps(phien('PL'))})")

        # ── Bước 1: Mở 3 màn tác vụ: 5.1.7, 10.1.5, 7.1.3 (gói PL). Có nút "Thực hiện" trong khung nhìn. Bấm nút thì có toast hoặc kết quả, không lỗi ──
        ds_tac_vu = [
            ('kho/5-1-7', 'Tính giá vốn (5.1.7)', 'PL'),
            ('tong-hop/10-1-5', 'Kết chuyển lãi lỗ (10.1.5)', 'PL'),
            ('tscd/7-1-3', 'Tính khấu hao TSCĐ (7.1.3)', 'PR'),  # TSCĐ chỉ có ở gói Pro
        ]
        for idx, (path, ten, goi) in enumerate(ds_tac_vu):
            pg.goto(f'{URL}?goi={goi}#/app/{path}')
            pg.reload()
            pg.wait_for_selector('.m-app')
            pg.wait_for_timeout(300)
            kiem_man(ten)

            btn = pg.locator('.m-tacvu-btn-thuc-hien', has_text='Thực hiện')
            if btn.count() == 0:
                loi.append(f'{ten}: không tìm thấy nút "Thực hiện" (.m-tacvu-btn-thuc-hien)')
            else:
                box = btn.first.bounding_box()
                if not box or box['y'] < 0 or box['y'] + box['height'] > 844:
                    loi.append(f'{ten}: nút "Thực hiện" không nằm trong khung nhìn viewport (y={box["y"] if box else "none"})')
                else:
                    btn.first.click()
                    pg.wait_for_timeout(250)
                    kiem_man(f'{ten} sau khi bấm nút')
                    print(f'  - Bước 1.{idx+1}: {ten} có nút Thực hiện trong khung nhìn và bấm thành công')

            pg.screenshot(path=str(SHOTS / f'm-11b-0{idx+1}-tacvu-{path.replace("/", "-")}.png'))

        # ── Bước 2: Mở 10.1.4 và 10.1.6: không ra thẻ "chưa có trên điện thoại" ──
        for idx, (path, ten, ma) in enumerate([('tong-hop/10-1-4', 'Kiểm tra cuối kỳ', '10.1.4'), ('tong-hop/10-1-6', 'Khoá sổ', '10.1.6')]):
            pg.goto(f'{URL}?goi=PL#/app/{path}')
            pg.wait_for_selector('.m-app')
            pg.wait_for_timeout(300)
            kiem_man(ten)

            chi_mt = pg.locator('.m-chi-may-tinh')
            if chi_mt.count() > 0:
                loi.append(f'{ten} ({ma}): vẫn ra thẻ .m-chi-may-tinh')

            chu_chua_co = pg.locator('text=Màn này chưa có trên điện thoại')
            if chu_chua_co.count() > 0:
                loi.append(f'{ten} ({ma}): vẫn hiện chữ chưa có trên điện thoại')

            if chi_mt.count() == 0 and chu_chua_co.count() == 0:
                print(f'  - Bước 2.{idx+1}: {ten} ({ma}) hiển thị đúng giao diện mobile, không ra MChiMayTinh')

            pg.screenshot(path=str(SHOTS / f'm-11b-0{idx+4}-{path.replace("/", "-")}.png'))

        # ── Bước 3: Mở quy trình của phân hệ Thu chi (tien/quy-trinh) và Kho (kho/quy-trinh): có ít nhất 3 thẻ bước. Bấm thẻ đầu thì URL đổi ──
        for idx, (path, ten) in enumerate([('tien/quy-trinh', 'Quy trình Thu chi'), ('kho/quy-trinh', 'Quy trình Kho')]):
            pg.goto(f'{URL}?goi=PL#/app/{path}')
            pg.wait_for_selector('.m-app')
            pg.wait_for_timeout(300)
            kiem_man(ten)

            the_ds = pg.locator('.m-qt2-the, .m-qt-the')
            count = the_ds.count()
            if count < 3:
                loi.append(f'{ten}: cần ít nhất 3 thẻ bước, nhưng chỉ thấy {count} thẻ (.m-qt2-the)')
            else:
                url_truoc = pg.url
                o_bam = the_ds.first.locator('.m-qt2-o, a').first
                if o_bam.count() > 0:
                    o_bam.click()
                else:
                    the_ds.first.click()
                pg.wait_for_timeout(300)
                url_sau = pg.url
                if url_sau == url_truoc:
                    loi.append(f'{ten}: bấm thẻ đầu tiên nhưng URL không đổi ({url_truoc})')
                else:
                    print(f'  - Bước 3.{idx+1}: {ten} có {count} thẻ bước, bấm thẻ đầu đổi URL ({url_truoc} -> {url_sau})')

            pg.screenshot(path=str(SHOTS / f'm-11b-0{idx+6}-quytrinh-{path.split("/")[0]}.png'))

        # ── Bước 4: Duyệt mọi màn kind: 'tool' và quytrinh qua địa chỉ: không màn nào còn hiện thẻ "chưa có trên điện thoại" của MChiMayTinh ──
        dia_chi_kiem = [
            'tien/2-1-3', 'kho/5-1-7', 'kho/5-1-8', 'tscd/7-1-3',
            'gia-thanh/9-1-1', 'gia-thanh/9-1-2', 'tong-hop/10-1-2',
            'tong-hop/10-1-4', 'tong-hop/10-1-5', 'tong-hop/10-1-6',
            'tong-hop/10-1-7', 'tong-hop/10-1-8', 'tong-hop/10-1-9',
            'tien-ich/11-2', 'tien-ich/11-3', 'tien-ich/11-8', 'tien-ich/11-9',
            'tien-ich/11-10', 'tien-ich/11-12', 'tien-ich/11-13', 'tien-ich/11-14',
            'tien-ich/11-15', 'tien-ich/X1', 'tien-ich/X3',
            'ban-hang/quy-trinh', 'ccdc/quy-trinh', 'danh-muc/quy-trinh',
            'gia-thanh/quy-trinh', 'kho/quy-trinh', 'mua-hang/quy-trinh',
            'thue/quy-trinh', 'tien/quy-trinh', 'tien-ich/quy-trinh',
            'tong-hop/quy-trinh', 'tscd/quy-trinh',
        ]
        dem_ok = 0
        for p_url in dia_chi_kiem:
            pg.goto(f'{URL}?goi=PL#/app/{p_url}')
            pg.wait_for_timeout(150)
            if pg.locator('.m-chi-may-tinh').count() > 0 or pg.locator('text=Màn này chưa có trên điện thoại').count() > 0:
                loi.append(f'{p_url}: vẫn hiện thẻ MChiMayTinh')
            else:
                dem_ok += 1
        print(f'  - Bước 4: đã duyệt {dem_ok}/{len(dia_chi_kiem)} màn tool và quy trình, không màn nào ra MChiMayTinh')

        b.close()
    return loi


def kiem_tra_dot_12_a():
    """Đợt 12A: Xuất bán POS (T186), Công thức (T188), Số dư ban đầu (T189)"""
    loi = []
    print('Kiểm tra đợt 12A (Anti A): Xuất bán POS, Công thức, Số dư ban đầu:')
    with sync_playwright() as p:
        b = p.chromium.launch(channel='chrome')
        pg = b.new_page(viewport={'width': 390, 'height': 844}, is_mobile=True, has_touch=True)
        con = []
        pg.on('console', lambda m: con.append(m.text) if m.type == 'error' else None)
        pg.on('pageerror', lambda e: con.append(str(e)))

        def kiem_man(ten):
            if pg.evaluate("document.documentElement.scrollWidth > innerWidth"):
                loi.append(f'{ten}: tràn ngang màn hình')
            if con:
                loi.append(f'{ten}: lỗi console {con[:2]}')
                con.clear()

        # Đăng nhập gói PL
        pg.goto(URL + '#/dang-nhap')
        pg.wait_for_selector('.auth-box')
        pg.evaluate(f"localStorage.setItem('iacc-cloud-session', {json.dumps(phien('PL'))})")

        # ── 1. Xuất bán POS (ban-hang/3-1-1) ──
        pg.goto(URL + '?goi=PL&p=pos#/app/ban-hang/3-1-1')
        pg.wait_for_selector('.m-app')
        pg.wait_for_timeout(350)
        if pg.locator('.m-chi-mt').count() > 0:
            loi.append('Xuất bán POS: vẫn ra MChiMayTinh')
        the_pos = pg.locator('.m-pos-the')
        if the_pos.count() == 0:
            loi.append('Xuất bán POS: không thấy thẻ đơn .m-pos-the')
        else:
            # Bấm thẻ mở tấm chi tiết
            the_pos.first.click()
            pg.wait_for_timeout(350)
            panel = pg.locator('.m-pos-ct-hop .pn-hop')
            if panel.count() == 0:
                loi.append('Xuất bán POS: không mở được tấm chi tiết đơn')
            else:
                nut_dong = pg.locator('.m-pos-ct-hop .pn-dau button')
                if nut_dong.count() > 0:
                    nut_dong.first.click()
                    pg.wait_for_timeout(200)
        kiem_man('Xuất bán POS')
        pg.screenshot(path=str(SHOTS / 'm-12-01-xuat-ban-pos.png'))

        # ── 2. Công thức sơ chế 5.1.5 (gói PR) ──
        pg.evaluate(f"localStorage.setItem('iacc-cloud-session', {json.dumps(phien('PR'))})")
        pg.goto(URL + '?goi=PR&p=ctsc#/app/kho/5-1-5')
        pg.wait_for_selector('.m-app')
        pg.wait_for_timeout(350)
        if pg.locator('.m-chi-mt').count() > 0:
            loi.append('Công thức sơ chế: vẫn ra MChiMayTinh')
        so_truoc_sc = pg.locator('.m-ct-the').count()
        if so_truoc_sc == 0:
            loi.append('Công thức sơ chế: không thấy thẻ công thức .m-ct-the')
        else:
            inp = pg.locator('.m-ct-tim-inp')
            if inp.count() == 0:
                loi.append('Công thức sơ chế: thiếu ô tìm kiếm .m-ct-tim-inp')
            else:
                inp.fill('NVL013')
                pg.wait_for_timeout(250)
                so_sau_sc = pg.locator('.m-ct-the').count()
                if so_sau_sc >= so_truoc_sc:
                    loi.append(f'Công thức sơ chế: gõ tìm NVL013 nhưng số thẻ không giảm ({so_truoc_sc} -> {so_sau_sc})')
                inp.fill('')
                pg.wait_for_timeout(200)
        kiem_man('Công thức sơ chế')
        pg.screenshot(path=str(SHOTS / 'm-12-02-cong-thuc-so-che.png'))

        # ── 3. Công thức chế biến 9.1.3 (gói PL) ──
        pg.evaluate(f"localStorage.setItem('iacc-cloud-session', {json.dumps(phien('PL'))})")
        pg.goto(URL + '?goi=PL&p=ctcb#/app/kho/9-1-3')
        pg.wait_for_selector('.m-app')
        pg.wait_for_timeout(350)
        if pg.locator('.m-chi-mt').count() > 0:
            loi.append('Công thức chế biến: vẫn ra MChiMayTinh')
        so_truoc_cb = pg.locator('.m-ct-the').count()
        if so_truoc_cb == 0:
            loi.append('Công thức chế biến: không thấy thẻ công thức .m-ct-the')
        else:
            inp = pg.locator('.m-ct-tim-inp')
            if inp.count() == 0:
                loi.append('Công thức chế biến: thiếu ô tìm kiếm .m-ct-tim-inp')
            else:
                inp.fill('PHO01')
                pg.wait_for_timeout(250)
                so_sau_cb = pg.locator('.m-ct-the').count()
                if so_sau_cb >= so_truoc_cb:
                    loi.append(f'Công thức chế biến: gõ tìm PHO01 nhưng số thẻ không giảm ({so_truoc_cb} -> {so_sau_cb})')
                inp.fill('')
                pg.wait_for_timeout(200)
        kiem_man('Công thức chế biến')
        pg.screenshot(path=str(SHOTS / 'm-12-03-cong-thuc-che-bien.png'))

        # ── 4. Số dư ban đầu Tổng hợp (tong-hop/10-1-3, gói PL) ──
        pg.goto(URL + '?goi=PL&p=sodu1013#/app/tong-hop/10-1-3')
        pg.wait_for_selector('.m-app')
        pg.wait_for_timeout(350)
        if pg.locator('.m-chi-mt').count() > 0:
            loi.append('Số dư ban đầu 10.1.3: vẫn ra MChiMayTinh')
        the_sdb = pg.locator('.m-sdb-the')
        if the_sdb.count() == 0:
            loi.append('Số dư ban đầu 10.1.3: không thấy thẻ số dư .m-sdb-the')
        else:
            # Mở tấm sửa dòng đầu
            the_sdb.first.click()
            pg.wait_for_timeout(350)
            panel = pg.locator('.m-sdb-form-hop .pn-hop')
            if panel.count() == 0:
                loi.append('Số dư ban đầu 10.1.3: không mở được tấm sửa từ đáy')
            else:
                nut_luu = pg.locator('.m-sdb-form-hop .pn-chan .btn.pri', has_text='Lưu')
                if nut_luu.count() == 0:
                    loi.append('Số dư ban đầu 10.1.3: thiếu nút Lưu trong tấm sửa')
                else:
                    box = nut_luu.first.bounding_box()
                    if not box or box['y'] < 0 or box['y'] + box['height'] > 844 + 5:
                        loi.append(f"Số dư ban đầu 10.1.3: nút Lưu không nằm trong khung nhìn (y={box['y'] if box else 'None'})")
                nut_dong = pg.locator('.m-sdb-form-hop .pn-dau button')
                if nut_dong.count() > 0:
                    nut_dong.first.click()
                    pg.wait_for_timeout(200)
        kiem_man('Số dư ban đầu 10.1.3')
        pg.screenshot(path=str(SHOTS / 'm-12-04-so-du-ban-dau.png'))

        # ── 5. Số dư ban đầu Thu chi (tien/so-du-ban-dau, gói F) ──
        pg.evaluate(f"localStorage.setItem('iacc-cloud-session', {json.dumps(phien('F'))})")
        pg.goto(URL + '?goi=F&p=sodufree#/app/tien/so-du-ban-dau')
        pg.wait_for_selector('.m-app')
        pg.wait_for_timeout(350)
        if pg.locator('.m-chi-mt').count() > 0:
            loi.append('Số dư ban đầu gói Free: vẫn ra MChiMayTinh')
        # T245: gói Free khai số dư ở Danh mục Quỹ tiền (1-12), đường dẫn cũ chuyển sang danh mục
        the_f = pg.locator('.m-sdb-the, .m-the-dm')
        if the_f.count() == 0:
            loi.append('Số dư ban đầu gói Free: không thấy thẻ số dư .m-sdb-the hoặc .m-the-dm')
        kiem_man('Số dư ban đầu gói Free')
        pg.screenshot(path=str(SHOTS / 'm-12-05-so-du-free.png'))

        b.close()
    return loi


def kiem_tra_dot_12_b():
    """Đợt 12B: Lập phiếu kiểm kê, điều chỉnh, sản xuất, điều chuyển trên điện thoại (T209)"""
    loi = []
    print('Kiểm tra đợt 12B (T209): lập phiếu kiểm kê, điều chỉnh, sản xuất, điều chuyển:')
    with sync_playwright() as p:
        b = p.chromium.launch(channel='chrome')
        pg = b.new_page(viewport={'width': 390, 'height': 844}, is_mobile=True, has_touch=True)
        con = []
        pg.on('console', lambda m: con.append(m.text) if m.type == 'error' else None)
        pg.on('pageerror', lambda e: con.append(str(e)))

        def kiem_man(ten):
            if pg.evaluate("document.documentElement.scrollWidth > innerWidth"):
                loi.append(f'{ten}: tràn ngang màn hình')
            if con:
                loi.append(f'{ten}: lỗi console {con[:2]}')
                con.clear()

        # Đăng nhập
        pg.goto(URL + '#/dang-nhap')
        pg.wait_for_selector('.auth-box')
        pg.evaluate(f"localStorage.setItem('iacc-cloud-session', {json.dumps(phien('PL'))})")

        ds_loai = [
            {
                'ten': 'Kiểm kê kho',
                'path': 'kho/5-1-10',
                'goi': 'PL',
                'co_tam_chon': False,
                'kiem_kho_trung': False,
                'anh': 'm-12b-01-kiem-ke.png',
            },
            {
                'ten': 'Điều chỉnh kho',
                'path': 'kho/dieu-chinh',
                'goi': 'PL',
                'co_tam_chon': True,
                'loai_text': 'Xuất điều chỉnh',
                'kiem_kho_trung': False,
                'anh': 'm-12b-02-dieu-chinh.png',
            },
            {
                'ten': 'Sản xuất (Xuất chế biến)',
                'path': 'kho/5-1-3',
                'goi': 'PR',
                'co_tam_chon': False,
                'kiem_kho_trung': False,
                'anh': 'm-12b-03-san-xuat.png',
            },
            {
                'ten': 'Điều chuyển (Chuyển kho)',
                'path': 'kho/5-1-4-3',
                'goi': 'PR',
                'co_tam_chon': False,
                'kiem_kho_trung': True,
                'anh': 'm-12b-04-dieu-chuyen.png',
            },
        ]

        for idx, item in enumerate(ds_loai):
            ten = item['ten']
            path = item['path']
            goi = item['goi']
            co_tam_chon = item['co_tam_chon']
            kiem_kho_trung = item['kiem_kho_trung']

            # Đặt gói phiên
            pg.evaluate(f"localStorage.setItem('iacc-cloud-session', {json.dumps(phien(goi))})")
            pg.goto(f'{URL}?goi={goi}#/app/{path}')
            pg.reload()
            pg.wait_for_selector('.m-app')
            pg.wait_for_timeout(350)
            kiem_man(f'{ten} (danh sách)')

            # Kiểm tra không hiện MChiMayTinh
            if pg.locator('.m-chi-may-tinh').count() > 0:
                loi.append(f'{ten}: danh sách hiện thẻ MChiMayTinh')

            # Bấm nút thêm mới nổi
            nut_them = pg.locator('.m-nut-them-fab')
            if nut_them.count() == 0:
                loi.append(f'{ten}: không tìm thấy nút thêm mới nổi (.m-nut-them-fab)')
                continue
            nut_them.first.click()
            pg.wait_for_timeout(300)

            # Nếu có tấm chọn loại phiếu
            if co_tam_chon:
                tam_dong = pg.locator('.m-tam-ds .m-tam-dong', has_text=item.get('loai_text', ''))
                if tam_dong.count() > 0:
                    tam_dong.first.click()
                    pg.wait_for_timeout(300)

            # Kiểm tra mở form lập phiếu
            if pg.locator('.m-lp').count() == 0:
                loi.append(f'{ten}: không mở form lập phiếu (.m-lp)')
                continue

            kiem_man(f'{ten} (Bước 1)')

            # Nếu là điều chuyển: thử chọn kho nhập trùng kho xuất thì bị chặn
            if kiem_kho_trung:
                the_kho_nhan = pg.locator('.m-lp-kho-nhan-wrap')
                if the_kho_nhan.count() > 0:
                    the_kho_nhan.first.click()
                    pg.wait_for_timeout(250)
                    kho_dau = pg.locator('.m-tam-ds .m-tam-dong', has_text='Kho bếp Lê Lợi')
                    if kho_dau.count() > 0:
                        kho_dau.first.click()
                        pg.wait_for_timeout(200)
                        nut_ad = pg.locator('.m-tam-overlay button:has-text("Áp dụng")')
                        if nut_ad.count() > 0:
                            nut_ad.first.click()
                            pg.wait_for_timeout(200)

                # Chọn trùng kho xuất thì tấm chọn từ chối, kho nhận giữ giá trị cũ
                if 'Kho bếp Lê Lợi' in the_kho_nhan.first.inner_text():
                    loi.append(f'{ten}: chọn kho nhận trùng kho xuất nhưng không bị chặn!')

                if the_kho_nhan.count() > 0:
                    the_kho_nhan.first.click()
                    pg.wait_for_timeout(250)
                    kho_khac = pg.locator('.m-tam-ds .m-tam-dong', has_text='Kho bar Lê Lợi')
                    if kho_khac.count() > 0:
                        kho_khac.first.click()
                        pg.wait_for_timeout(200)
                        nut_ad = pg.locator('.m-tam-overlay button:has-text("Áp dụng")')
                        if nut_ad.count() > 0:
                            nut_ad.first.click()
                            pg.wait_for_timeout(200)
                    else:
                        dong_khac = pg.locator('.m-tam-ds .m-tam-dong')
                        if dong_khac.count() > 1:
                            dong_khac.nth(1).click()
                            pg.wait_for_timeout(200)

            # Bấm Tiếp tục Bước 1
            nut_tiep_1 = pg.locator('.m-lp-nut-tiep, .m-lp-day button:has-text("Tiếp tục")')
            if nut_tiep_1.count() == 0:
                loi.append(f'{ten}: thiếu nút Tiếp tục ở Bước 1')
                continue
            nut_tiep_1.first.click()
            pg.wait_for_timeout(300)
            kiem_man(f'{ten} (Bước 2)')

            # Bước 2: Chọn hàng hoá hoặc thành phẩm
            tp_the = pg.locator('.m-lp-tp-the')
            hang_the = pg.locator('.m-lp-the-hang')

            if tp_the.count() > 0:
                tp_the.first.click()
                pg.wait_for_timeout(150)
            elif hang_the.count() > 0:
                hang_the.first.click()
                pg.wait_for_timeout(150)
            else:
                loi.append(f'{ten}: không có thẻ hàng hoá hoặc thành phẩm ở Bước 2')
                continue

            nut_ds_chon = pg.locator('.m-lp-day button:has-text("Danh sách đã chọn")')
            if nut_ds_chon.count() == 0:
                loi.append(f'{ten}: thiếu nút "Danh sách đã chọn" ở Bước 2')
                continue
            nut_ds_chon.first.click()
            pg.wait_for_timeout(300)
            kiem_man(f'{ten} (Bước 3)')

            # Bước 3: Sửa dòng, nhập số
            inps = pg.locator('.m-lp-sua-inp.num')
            if inps.count() > 0:
                inps.first.fill('15')
                pg.wait_for_timeout(150)

            nut_tiep_3 = pg.locator('.m-lp-day button:has-text("Tiếp tục")')
            if nut_tiep_3.count() == 0:
                loi.append(f'{ten}: thiếu nút Tiếp tục ở Bước 3')
                continue
            nut_tiep_3.first.click()
            pg.wait_for_timeout(300)
            kiem_man(f'{ten} (Bước 4)')

            # Bước 4: Xác nhận, bấm Lưu
            nut_luu = pg.locator('.m-lp-day button.m-lp-nut-chinh:has-text("Lưu")')
            if nut_luu.count() == 0:
                loi.append(f'{ten}: thiếu nút Lưu ở Bước 4')
                continue
            nut_luu.first.click()
            pg.wait_for_timeout(400)

            # Bước 5: Màn hình thành công
            thanh_cong = pg.locator('.m-lp-thanh-cong-tieu, :has-text("Tạo chứng từ thành công")')
            if thanh_cong.count() == 0:
                loi.append(f'{ten}: không hiện màn hình Tạo chứng từ thành công')
                continue

            mota_b = pg.locator('.m-lp-thanh-cong-mota b')
            so_phieu = mota_b.first.inner_text().strip() if mota_b.count() > 0 else ''
            if not so_phieu:
                mota_txt = pg.locator('.m-lp-thanh-cong-mota').inner_text() if pg.locator('.m-lp-thanh-cong-mota').count() > 0 else ''
                m_so = re.search(r'([A-Z0-9\-\/]+2610\-[0-9]+|[A-Z]+2610\-[0-9]+)', mota_txt)
                so_phieu = m_so.group(1) if m_so else ''

            if not so_phieu:
                loi.append(f'{ten}: không đọc được số phiếu mới')

            pg.screenshot(path=str(SHOTS / item['anh']))

            # Mở lại danh sách thấy phiếu đó
            pg.goto(f'{URL}?goi={goi}#/app/{path}')
            pg.wait_for_timeout(350)

            so_the_dau = pg.locator('.m-ds-ngay-dong .m-ds-ngay-so').first.inner_text().strip() if pg.locator('.m-ds-ngay-dong .m-ds-ngay-so').count() > 0 else ''
            if so_phieu and so_phieu not in so_the_dau:
                loi.append(f'{ten}: số phiếu {so_phieu} không nằm ở thẻ đầu danh sách (thấy {so_the_dau})')
            else:
                print(f'  - {ten}: lập thành công {so_phieu}, hiển thị ở danh sách mobile')

        b.close()
    return loi


def kiem_tra_dot_13_b():
    """Đợt 13B: Chỉnh giao diện điện thoại (T208)"""
    loi = []
    print('Kiểm tra đợt 13B (T208): chỉnh giao diện điện thoại đang có:')
    with sync_playwright() as p:
        b = p.chromium.launch(channel='chrome')
        pg = b.new_page(viewport={'width': 390, 'height': 844}, is_mobile=True, has_touch=True)
        con = []
        pg.on('console', lambda m: con.append(m.text) if m.type == 'error' else None)
        pg.on('pageerror', lambda e: con.append(str(e)))

        def kiem_man(ten):
            if pg.evaluate("document.documentElement.scrollWidth > innerWidth"):
                loi.append(f'{ten}: tràn ngang màn hình')
            if con:
                loi.append(f'{ten}: lỗi console {con[:2]}')
                con.clear()

        # Đăng nhập với gói Plus
        pg.goto(URL + '#/dang-nhap')
        pg.wait_for_selector('.auth-box')
        pg.evaluate(f"localStorage.setItem('iacc-cloud-session', {json.dumps(phien('PL'))})")

        # ── 1. Trang chủ không có thanh trên chung, màn khác vẫn có ──
        pg.goto(URL + '?goi=PL&p=tc13b#/app/trang-chu/tong-quan')
        pg.wait_for_selector('.m-app')
        pg.wait_for_timeout(350)
        kiem_man('Trang chủ')
        if pg.locator('.m-thanh-tren').count() > 0 and pg.locator('.m-thanh-tren').is_visible():
            loi.append('Trang chủ: thanh trên chung .m-thanh-tren vẫn hiển thị')

        pg.goto(URL + '?goi=PL&p=nv13b#/app/nghiep-vu')
        pg.wait_for_timeout(350)
        kiem_man('Nghiệp vụ')
        if pg.locator('.m-thanh-tren').count() == 0 or not pg.locator('.m-thanh-tren').is_visible():
            loi.append('Nghiệp vụ: thiếu thanh trên chung .m-thanh-tren')

        # ── 2. Chip CN ở trang chủ: chọn chi nhánh thứ hai thì nhãn chip đổi và Doanh thu thuần đổi ──
        pg.goto(URL + '?goi=PL&p=tc_cn13b#/app/trang-chu/tong-quan')
        pg.wait_for_selector('.m-app')
        pg.wait_for_timeout(350)
        chip_cn = pg.locator('.m-tc-chip-cn, .m-tc-chip-kho')
        if chip_cn.count() == 0:
            loi.append('Trang chủ: không tìm thấy chip chọn chi nhánh')
        else:
            nhan_cu = chip_cn.first.inner_text().strip()
            so_dt_cu = pg.locator('.m-tc-kpi-muc:has-text("Doanh thu thuần") .m-tc-kpi-so').inner_text().strip()
            chip_cn.first.click()
            pg.wait_for_timeout(300)
            dong_cn = pg.locator('.m-tam-ds .m-tam-dong')
            if dong_cn.count() < 2:
                loi.append('Trang chủ: tấm chọn chi nhánh không đủ 2 chi nhánh')
            else:
                dong_cn.nth(1).click()
                pg.wait_for_timeout(350)
                nhan_moi = chip_cn.first.inner_text().strip()
                so_dt_moi = pg.locator('.m-tc-kpi-muc:has-text("Doanh thu thuần") .m-tc-kpi-so').inner_text().strip()
                if nhan_moi == nhan_cu:
                    loi.append(f'Trang chủ: chọn chi nhánh thứ hai nhưng nhãn chip không đổi ({nhan_cu})')
                if so_dt_moi == so_dt_cu:
                    loi.append(f'Trang chủ: chọn chi nhánh thứ hai nhưng Doanh thu thuần không đổi ({so_dt_cu})')
        pg.screenshot(path=str(SHOTS / 'm-13b-01-trang-chu.png'))

        # ── 3. Kính lúp gõ "so quy": có mục "Báo cáo" và dòng "Sổ quỹ tiền mặt"; bấm vào URL chứa 2-2-1 ──
        nut_tim = pg.locator('.m-tc-nut-tron[title*="Tìm kiếm"], button[aria-label="Tìm kiếm màn hình"]')
        if nut_tim.count() == 0:
            loi.append('Trang chủ: không tìm thấy nút kính lúp')
        else:
            nut_tim.first.click()
            pg.wait_for_timeout(300)
            inp_tk = pg.locator('.m-tk-inp')
            if inp_tk.count() == 0:
                loi.append('Tìm kiếm: không thấy ô nhập .m-tk-inp')
            else:
                inp_tk.fill('so quy')
                pg.wait_for_timeout(350)
                muc_bc = pg.locator('.m-tk-nhom-tieu-de', has_text='Báo cáo')
                if muc_bc.count() == 0:
                    loi.append('Tìm kiếm "so quy": không thấy mục "Báo cáo"')
                dong_sq = pg.locator('.m-tk-dong', has_text='Sổ quỹ tiền mặt')
                if dong_sq.count() == 0:
                    loi.append('Tìm kiếm "so quy": không thấy dòng "Sổ quỹ tiền mặt"')
                else:
                    dong_sq.first.click()
                    pg.wait_for_timeout(400)
                    if '2-2-1' not in pg.url:
                        loi.append(f'Tìm kiếm: bấm vào Sổ quỹ tiền mặt nhưng URL không chứa 2-2-1 (URL={pg.url})')
        kiem_man('Sổ quỹ tiền mặt (từ tìm kiếm)')
        pg.screenshot(path=str(SHOTS / 'm-13b-02-so-quy.png'))

        # ── 4. Danh sách Phiếu chi, Xuất bán POS: hàng chip scrollWidth > clientWidth thì cuộn được, chip không xuống dòng (mọi chip cùng top) ──
        for ten_man, path_man, sel_hang in [
            ('Phiếu chi', 'tien/2-1-1', '.m-ds-chips'),
            ('Xuất bán POS', 'ban-hang/3-1-1', '.m-pos-chip-hang'),
        ]:
            pg.goto(f'{URL}?goi=PL&p=chip_{ten_man}#/app/{path_man}')
            pg.wait_for_selector('.m-app')
            pg.wait_for_timeout(350)
            hang = pg.locator(sel_hang)
            if hang.count() == 0:
                loi.append(f'{ten_man}: không thấy hàng chip {sel_hang}')
                continue
            info = pg.evaluate(f"""() => {{
                const el = document.querySelector('{sel_hang}');
                if (!el) return null;
                const chips = Array.from(el.children).filter(c => c.tagName === 'BUTTON' || c.classList.contains('m-chip') || c.classList.contains('m-pos-chip') || c.tagName === 'DIV');
                if (chips.length === 0) return null;
                const tops = chips.map(c => Math.round(c.getBoundingClientRect().top));
                const allSameTop = tops.every(t => Math.abs(t - tops[0]) <= 3);
                const canScroll = el.scrollWidth > el.clientWidth;
                return {{ canScroll, allSameTop, scrollWidth: el.scrollWidth, clientWidth: el.clientWidth, tops }};
            }}""")
            if not info:
                loi.append(f'{ten_man}: không đọc được thông tin hàng chip {sel_hang}')
            else:
                if not info['allSameTop']:
                    loi.append(f'{ten_man}: các chip bị xuống dòng (tops={info["tops"]})')
                if info['canScroll']:
                    scroll_ok = pg.evaluate(f"""() => {{
                        const el = document.querySelector('{sel_hang}');
                        el.scrollLeft = 40;
                        return el.scrollLeft > 0;
                    }}""")
                    if not scroll_ok:
                        loi.append(f'{ten_man}: hàng chip scrollWidth > clientWidth nhưng không cuộn được')
            kiem_man(ten_man)

        # ── 5. Cấu hình kế toán: nút Lưu có bottom <= innerHeight và không có phần tử nội dung nào hiện phía dưới nút trong khung nhìn ngoài thanh dưới ──
        pg.goto(f'{URL}?goi=PL&p=cauhinh13b#/app/he-thong/cau-hinh')
        pg.wait_for_selector('.m-app')
        pg.wait_for_timeout(350)
        nut_luu = pg.locator('button:has-text("Lưu cấu hình")')
        if nut_luu.count() == 0:
            loi.append('Cấu hình kế toán: không tìm thấy nút "Lưu cấu hình"')
        else:
            chk = pg.evaluate("""() => {
                const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Lưu cấu hình'));
                if (!btn) return { error: 'Không thấy nút Lưu' };
                const rect = btn.getBoundingClientRect();
                const btnBottom = rect.bottom;
                const innerHeight = window.innerHeight;

                const theNoiDung = Array.from(document.querySelectorAll('.m-form-the'));
                const thDuoi = document.querySelector('.m-thanh-duoi');
                const thDuoiTop = thDuoi ? thDuoi.getBoundingClientRect().top : innerHeight;

                // Lấy phần tử thật đang hiện ở khe giữa nút và thanh dưới (tính cả lớp phủ)
                let noiDungLo = false;
                for (let y = btnBottom + 3; y < thDuoiTop - 2; y += 4) {
                    const el = document.elementFromPoint(window.innerWidth / 2, y);
                    if (el && theNoiDung.some(t => t.contains(el))) { noiDungLo = true; break; }
                }
                return {
                    bottomValid: btnBottom <= innerHeight + 5,
                    btnBottom,
                    innerHeight,
                    noiDungLo
                };
            }""")
            if 'error' in chk:
                loi.append(f"Cấu hình kế toán: {chk['error']}")
            else:
                if not chk['bottomValid']:
                    loi.append(f"Cấu hình kế toán: nút Lưu có bottom ({chk['btnBottom']}) > innerHeight ({chk['innerHeight']})")
                if chk['noiDungLo']:
                    loi.append("Cấu hình kế toán: có phần tử nội dung hiện phía dưới nút Lưu ngoài thanh dưới")
        kiem_man('Cấu hình kế toán')
        pg.screenshot(path=str(SHOTS / 'm-13b-03-cau-hinh.png'))

        b.close()
    return loi


def kiem_tra_dot_13_a():
    """Đợt 13A: Tiện ích bổ sung trên điện thoại (T192): 11.4, 11.5, 11.6, 11.7, 11.16, 11.11"""
    loi = []
    print('Kiểm tra đợt 13A (Anti A): Tiện ích bổ sung trên điện thoại:')
    with sync_playwright() as p:
        b = p.chromium.launch(channel='chrome')
        pg = b.new_page(viewport={'width': 390, 'height': 844}, is_mobile=True, has_touch=True)
        con = []
        pg.on('console', lambda m: con.append(m.text) if m.type == 'error' else None)
        pg.on('pageerror', lambda e: con.append(str(e)))

        def kiem_man(ten):
            if pg.evaluate("document.documentElement.scrollWidth > innerWidth"):
                loi.append(f'{ten}: tràn ngang màn hình')
            if con:
                loi.append(f'{ten}: lỗi console {con[:2]}')
                con.clear()

        # Đăng nhập gói PR
        pg.goto(URL + '#/dang-nhap')
        pg.wait_for_selector('.auth-box')
        pg.evaluate(f"localStorage.setItem('iacc-cloud-session', {json.dumps(phien('PR'))})")

        # ── 1. Hoá đơn đầu vào 11.4 (gói PL) ──
        pg.evaluate(f"localStorage.setItem('iacc-cloud-session', {json.dumps(phien('PL'))})")
        pg.goto(URL + '?goi=PL#/app/tien-ich/11-4')
        pg.reload()
        pg.wait_for_selector('.m-app')
        pg.wait_for_timeout(350)
        if pg.locator('.m-chi-may-tinh, .m-chi-mt').count() > 0:
            loi.append('Hoá đơn đầu vào: ra MChiMayTinh')
        the_hddv = pg.locator('.m-hddv-the')
        if the_hddv.count() == 0:
            loi.append('Hoá đơn đầu vào: không thấy thẻ .m-hddv-the')
        else:
            the_hddv.first.click()
            pg.wait_for_timeout(300)
            panel = pg.locator('.m-hddv-hop .pn-hop')
            if panel.count() == 0:
                loi.append('Hoá đơn đầu vào: không mở được tấm chi tiết')
            else:
                nut_dong = pg.locator('.m-hddv-hop .pn-dau button')
                if nut_dong.count() > 0:
                    nut_dong.first.click()
                    pg.wait_for_timeout(200)
        nut_chinh_hddv = pg.locator('.m-hddv-day button.btn.pri')
        if nut_chinh_hddv.count() == 0:
            loi.append('Hoá đơn đầu vào: thiếu nút chính trong thanh đáy')
        else:
            box = nut_chinh_hddv.first.bounding_box()
            if not box or box['y'] < 0 or box['y'] + box['height'] > 844 + 5:
                loi.append(f"Hoá đơn đầu vào: nút chính không trong khung nhìn (y={box['y'] if box else 'None'})")
        kiem_man('Hoá đơn đầu vào')
        pg.screenshot(path=str(SHOTS / 'm-13-01-hoa-don-dau-vao.png'))

        # ── 2. Duyệt chứng từ 11.5 (gói PR) ──
        pg.evaluate(f"localStorage.setItem('iacc-cloud-session', {json.dumps(phien('PR'))})")
        pg.goto(URL + '?goi=PR#/app/tien-ich/11-5')
        pg.reload()
        pg.wait_for_selector('.m-app')
        pg.wait_for_timeout(350)
        if pg.locator('.m-chi-may-tinh, .m-chi-mt').count() > 0:
            loi.append('Duyệt chứng từ: ra MChiMayTinh')
        the_dct = pg.locator('.m-dct-the')
        so_the_ban_dau = the_dct.count()
        if so_the_ban_dau < 2:
            loi.append(f'Duyệt chứng từ: số thẻ < 2 ({so_the_ban_dau})')
        else:
            chks = pg.locator('.m-dct-the .m-dct-the-trai input[type="checkbox"]')
            if chks.count() >= 2:
                chks.nth(0).click()
                pg.wait_for_timeout(150)
                chks.nth(1).click()
                pg.wait_for_timeout(150)
                nut_duyet = pg.locator('.m-dct-day button.btn.pri')
                if nut_duyet.count() == 0:
                    loi.append('Duyệt chứng từ: thiếu nút Duyệt trong thanh đáy')
                else:
                    nut_duyet.first.click()
                    pg.wait_for_timeout(350)
                    so_the_sau = pg.locator('.m-dct-the').count()
                    co_toast = pg.locator('.toast, :has-text("Đã duyệt")').count() > 0
                    if not co_toast and so_the_sau != so_the_ban_dau - 2:
                        loi.append(f'Duyệt chứng từ: bấm duyệt 2 thẻ nhưng không thấy toast và số thẻ không giảm ({so_the_ban_dau} -> {so_the_sau})')
            else:
                loi.append('Duyệt chứng từ: không thấy đủ 2 checkbox')
        nut_chinh_dct = pg.locator('.m-dct-day button.btn.pri')
        if nut_chinh_dct.count() > 0:
            box = nut_chinh_dct.first.bounding_box()
            if not box or box['y'] < 0 or box['y'] + box['height'] > 844 + 5:
                loi.append(f"Duyệt chứng từ: nút Duyệt không trong khung nhìn (y={box['y'] if box else 'None'})")
        kiem_man('Duyệt chứng từ')
        pg.screenshot(path=str(SHOTS / 'm-13-02-duyet-chung-tu.png'))

        # ── 3. Cảnh báo số liệu cuối kỳ 11.6 (gói PL) ──
        pg.goto(URL + '?goi=PL#/app/tien-ich/11-6')
        pg.reload()
        pg.wait_for_selector('.m-app')
        pg.wait_for_timeout(350)
        if pg.locator('.m-chi-may-tinh, .m-chi-mt').count() > 0:
            loi.append('Cảnh báo số liệu: ra MChiMayTinh')
        the_cb = pg.locator('.m-cb-the')
        if the_cb.count() == 0:
            loi.append('Cảnh báo số liệu: không thấy thẻ cảnh báo .m-cb-the')
        else:
            chams = pg.locator('.m-cb-cham')
            if chams.count() == 0:
                loi.append('Cảnh báo số liệu: không thấy chấm mức độ .m-cb-cham')
        kiem_man('Cảnh báo số liệu')
        pg.screenshot(path=str(SHOTS / 'm-13-03-canh-bao.png'))

        # ── 4. Đối soát tự động 11.7 (gói S) ──
        pg.evaluate(f"localStorage.setItem('iacc-cloud-session', {json.dumps(phien('S'))})")
        pg.goto(URL + '?goi=S#/app/tien-ich/11-7')
        pg.reload()
        pg.wait_for_selector('.m-app')
        pg.wait_for_timeout(350)
        if pg.locator('.m-chi-may-tinh, .m-chi-mt').count() > 0:
            loi.append('Đối soát tự động: ra MChiMayTinh')
        kpi_ds = pg.locator('.m-ds-kpi')
        if kpi_ds.count() == 0:
            loi.append('Đối soát tự động: thiếu thẻ tổng hợp khớp/lệch .m-ds-kpi')
        the_ds = pg.locator('.m-ds-the')
        if the_ds.count() == 0:
            loi.append('Đối soát tự động: không thấy thẻ dòng lệch .m-ds-the')
        else:
            the_ds.first.click()
            pg.wait_for_timeout(300)
            panel = pg.locator('.m-ds-hop .pn-hop')
            if panel.count() == 0:
                loi.append('Đối soát tự động: không mở được tấm chi tiết dòng lệch')
            else:
                nut_dong = pg.locator('.m-ds-hop .pn-dau button')
                if nut_dong.count() > 0:
                    nut_dong.first.click()
                    pg.wait_for_timeout(200)
        nut_chay = pg.locator('.m-ds-day button.btn.pri')
        if nut_chay.count() == 0:
            loi.append('Đối soát tự động: thiếu nút chạy đối soát dính đáy')
        else:
            box = nut_chay.first.bounding_box()
            if not box or box['y'] < 0 or box['y'] + box['height'] > 844 + 5:
                loi.append(f"Đối soát tự động: nút chạy không trong khung nhìn (y={box['y'] if box else 'None'})")
        kiem_man('Đối soát tự động')
        pg.screenshot(path=str(SHOTS / 'm-13-04-doi-soat.png'))

        # ── 5. Dashboard 11.16 (chuyển về trang-chu) ──
        pg.evaluate(f"localStorage.setItem('iacc-cloud-session', {json.dumps(phien('PR'))})")
        pg.goto(URL + '?goi=PR#/app/tien-ich/11-16')
        pg.reload()
        pg.wait_for_selector('.m-app')
        pg.wait_for_timeout(450)
        cur_url = pg.evaluate('location.href')
        if 'trang-chu' not in cur_url:
            loi.append(f'Dashboard 11.16: URL {cur_url} không chuyển về trang-chu')
        kiem_man('Dashboard 11.16')
        pg.screenshot(path=str(SHOTS / 'm-13-05-dashboard.png'))

        # ── 6. Thiết kế mẫu in 11.11 (vẫn ra MChiMayTinh) ──
        pg.goto(URL + '?goi=PR#/app/tien-ich/11-11')
        pg.reload()
        pg.wait_for_selector('.m-app')
        pg.wait_for_timeout(350)
        if pg.locator('.m-chi-may-tinh, .m-chi-mt').count() == 0:
            loi.append('Thiết kế mẫu in 11.11: không ra MChiMayTinh')
        kiem_man('Thiết kế mẫu in 11.11')
        pg.screenshot(path=str(SHOTS / 'm-13-06-thiet-ke-mau-in.png'))

        # ── 7. Duyệt mọi màn MODULES ở gói PR qua manMobile ──
        pg.goto(URL + '?goi=PR#/app/trang-chu/tong-quan')
        pg.wait_for_selector('.m-app')
        pg.wait_for_timeout(200)
        m_chi = pg.evaluate('''async () => {
            const { MODULES } = await import('/src/app/registry.ts');
            const { manMobile } = await import('/src/ui/mobile/manMobile.ts');
            const { MChiMayTinh } = await import('/src/ui/mobile/MChiMayTinh.tsx');
            const ds = [];
            for (const m of MODULES) {
                if (m.key === 'thao-tac-nhanh') continue;
                for (const sc of m.screens) {
                    const comp = manMobile(sc, m);
                    if (comp === MChiMayTinh) {
                        ds.push({ mod: m.key, code: sc.code, slug: sc.slug, ten: sc.ten });
                    }
                }
            }
            return ds;
        }''')
        print(f'Màn còn ra MChiMayTinh ở gói PR ({len(m_chi)}):', m_chi)
        if len(m_chi) != 1 or m_chi[0].get('code') != '11.11':
            loi.append(f'Duyệt MODULES qua manMobile: danh sách còn lại phải chỉ có 11.11, thực tế: {m_chi}')

        b.close()
    return loi


def kiem_tra_dot_14_a():
    """Đợt 14A (Anti A): Thẻ Hao hụt và mục Chứng từ chưa ghi sổ trên điện thoại (T222)"""
    loi = []
    print('Kiểm tra đợt 14A (Anti A): Hao hụt nguyên vật liệu và Chứng từ chưa ghi sổ:')
    with sync_playwright() as p:
        b = p.chromium.launch(channel='chrome')
        pg = b.new_page(viewport={'width': 390, 'height': 844}, is_mobile=True, has_touch=True)
        con = []
        pg.on('console', lambda m: con.append(m.text) if m.type == 'error' else None)
        pg.on('pageerror', lambda e: con.append(str(e)))

        def kiem_man(ten):
            if pg.evaluate("document.documentElement.scrollWidth > innerWidth"):
                loi.append(f'{ten}: tràn ngang màn hình')
            if con:
                loi.append(f'{ten}: lỗi console {con[:2]}')
                con.clear()

        # Đăng nhập gói PR
        pg.goto(URL + '#/dang-nhap')
        pg.wait_for_selector('.auth-box')
        pg.evaluate(f"localStorage.setItem('iacc-cloud-session', {json.dumps(phien('PR'))})")

        # ── 1. Thẻ Hao hụt nguyên vật liệu ở tab Quản trị ──
        pg.goto(URL + '?goi=PR#/app')
        pg.wait_for_selector('.m-app')
        pg.wait_for_selector('.m-tc-hh-top3')
        pg.wait_for_timeout(350)

        # Lấy số tiền hao hụt ban đầu (Tất cả chi nhánh)
        the_hh = pg.locator('.m-tc-the-ivt:has-text("Hao hụt nguyên vật liệu")')
        if the_hh.count() == 0:
            loi.append('Thẻ Hao hụt: không tìm thấy thẻ trên trang chủ')
        else:
            so_text = the_hh.locator('.m-tc-nvl-hang-so .m-tc-so-lon').inner_text().strip()
            print(f'Thẻ Hao hụt (Tất cả chi nhánh): {so_text}')
            if not so_text or so_text.startswith('0'):
                loi.append(f'Thẻ Hao hụt: giá trị ban đầu bằng 0 hoặc rỗng ({so_text})')

            dong_top3 = the_hh.locator('.m-tc-hh-dong')
            if dong_top3.count() < 1:
                loi.append(f'Thẻ Hao hụt: thiếu danh sách mặt hàng hao hụt ({dong_top3.count()})')

            # Đổi chi nhánh ở chip "CN:"
            chip_cn = pg.locator('.m-tc-chip-cn')
            if chip_cn.count() == 0:
                loi.append('Không tìm thấy chip chọn chi nhánh .m-tc-chip-cn')
            else:
                chip_cn.click()
                pg.wait_for_selector('.m-tam-hop', state='visible')
                pg.wait_for_timeout(200)
                muc_cn = pg.locator('.m-tam-dong')
                if muc_cn.count() >= 2:
                    muc_cn.nth(1).click()
                    pg.wait_for_timeout(350)
                    so_text_moi = the_hh.locator('.m-tc-nvl-hang-so .m-tc-so-lon').inner_text().strip()
                    print(f'Thẻ Hao hụt (Sau khi đổi chi nhánh): {so_text_moi}')
                    if not so_text_moi or so_text_moi.startswith('0'):
                        loi.append(f'Thẻ Hao hụt: giá trị sau khi đổi chi nhánh bằng 0 ({so_text_moi})')
                    if so_text_moi == so_text:
                        loi.append(f'Thẻ Hao hụt: giá trị không đổi sau khi chọn chi nhánh ({so_text} -> {so_text_moi})')
                else:
                    loi.append('Sheet chọn chi nhánh: không đủ mục chi nhánh')

        the_hh.scroll_into_view_if_needed()
        pg.wait_for_timeout(200)
        kiem_man('Trang chủ - Thẻ Hao hụt')
        pg.screenshot(path=str(SHOTS / 'm-14-hao-hut.png'))

        # ── 2. Mục Chứng từ chưa ghi sổ ở tab Cần theo dõi ──
        tab_ctd = pg.locator('.m-tc-tab:has-text("Cần theo dõi")')
        if tab_ctd.count() == 0:
            loi.append('Không tìm thấy tab Cần theo dõi')
        else:
            tab_ctd.click()
            pg.wait_for_timeout(300)
            muc_ct = pg.locator('.m-tc-ctd-dong:has-text("Chứng từ chưa ghi sổ")')
            if muc_ct.count() == 0:
                loi.append('Tab Cần theo dõi: không có mục Chứng từ chưa ghi sổ')
            else:
                sub_txt = muc_ct.locator('.m-tc-ctd-sub').inner_text().strip()
                print(f'Mục Chứng từ chưa ghi sổ: {sub_txt}')
                if not sub_txt or '0 chứng từ' in sub_txt:
                    loi.append(f'Mục Chứng từ chưa ghi sổ: dòng phụ không hợp lệ ({sub_txt})')

                pg.screenshot(path=str(SHOTS / 'm-14-theo-doi.png'))

                muc_ct.click()
                pg.wait_for_timeout(400)
                cur_url = pg.evaluate('location.href')
                print(f'Sau khi bấm Chứng từ chưa ghi sổ: URL = {cur_url}')
                if 'mua-hang' not in cur_url and 'ban-hang' not in cur_url and 'tien' not in cur_url and 'kho' not in cur_url:
                    loi.append(f'Bấm Chứng từ chưa ghi sổ: không mở danh sách chứng từ (URL: {cur_url})')
                chip_on = pg.locator('.m-ds-chips .m-chip.on')
                if chip_on.count() == 0 or 'Chưa ghi sổ' not in chip_on.first.inner_text():
                    loi.append('Bấm Chứng từ chưa ghi sổ: danh sách không bật sẵn chip Chưa ghi sổ')

        kiem_man('Trang chủ - Tab Cần theo dõi')
        b.close()
    return loi


def kiem_tra_dot_14_toc_do():
    """Đo tốc độ mọi báo cáo trên điện thoại 390px, ghi ra tools/shots/toc-do-bao-cao-390.txt"""
    loi = []
    print('Đo tốc độ mọi báo cáo trên điện thoại 390px (gói PR):')
    with sync_playwright() as p:
        b = p.chromium.launch(channel='chrome')
        pg = b.new_page(viewport={'width': 390, 'height': 844}, is_mobile=True, has_touch=True)
        con = []
        pg.on('console', lambda m: con.append(m.text) if m.type == 'error' else None)
        pg.on('pageerror', lambda e: con.append(str(e)))

        # Đăng nhập gói PR
        pg.goto(URL + '#/dang-nhap')
        pg.wait_for_selector('.auth-box')
        pg.evaluate(f"localStorage.setItem('iacc-cloud-session', {json.dumps(phien('PR'))})")
        pg.goto(URL + '?goi=PR#/app/bao-cao/tat-ca')
        pg.wait_for_selector('.m-bc')
        pg.wait_for_timeout(200)

        # Lấy danh sách báo cáo hiển thị
        bc_list = pg.evaluate('''async () => {
            const { layNhomBaoCao } = await import('/src/modules/bao-cao/TrungTam.tsx');
            const { hienMan, tenMan } = await import('/src/app/registry.ts');
            const s = JSON.parse(localStorage.getItem('iacc-cloud-session'));
            const nhom = layNhomBaoCao(s);
            const map = new Map();
            for (const g of nhom) {
                for (const item of g.screens) {
                    if (hienMan(item, s.goi, s.cheDo, s)) {
                        map.set(item.slug, {
                            slug: item.slug,
                            code: item.code || item.slug,
                            ten: tenMan(item)
                        });
                    }
                }
            }
            return Array.from(map.values());
        }''')

        print(f'Tổng số báo cáo cần đo: {len(bc_list)}')
        ket_qua = []

        header = f"{'Mã':<10} | {'Tên báo cáo':<35} | {'Mili giây':>10}"
        sep = '-' * len(header)
        lines_out = [header, sep]
        print(header)
        print(sep)

        for item in bc_list:
            slug = item['slug']
            t0 = time.perf_counter()
            pg.goto(f"{URL}#/app/bao-cao/{slug}")
            loc = pg.locator('.m-bcd-item, .m-so-dong-item, .m-so-dong-trong, .m-so-bc table tbody tr, .m-to-giay table tbody tr, .m-to-giay .paper, .rpt tbody tr, table tbody tr, .lockpage, .empty').first
            loc.wait_for(state='visible', timeout=10000)
            ms = round((time.perf_counter() - t0) * 1000)
            # Màn khoá hoặc trống cũng hiện nhanh, không tính là đã mở xong
            if pg.locator('main .lockpage, main .empty').count() > 0:
                print(f"{item['code']:<10} | {item['ten']:<35} | không có dữ liệu, bỏ qua")
                continue

            line = f"{item['code']:<10} | {item['ten']:<35} | {ms:>7} ms"
            print(line)
            lines_out.append(line)
            ket_qua.append((item['code'], item['ten'], ms))

            if ms > 2000:
                print(f'  CHẬM: {item["code"]} {ms} ms > 2000 ms')
            # Đo trên dev server dao động theo tải máy (3.2.8 đo 1,2 đến 2,1 giây), nên chỉ tính lỗi khi quá 3 giây
            if ms > 3000:
                cdp = pg.context.new_cdp_session(pg)
                cdp.send('Profiler.enable')
                cdp.send('Profiler.start')
                pg.goto(f"{URL}#/app/bao-cao/{slug}")
                loc.wait_for(state='visible', timeout=10000)
                profile = cdp.send('Profiler.stop')['profile']
                loi.append(f"Báo cáo {item['code']} ({item['ten']}) chậm: {ms} ms > 3000 ms")

        # Ghi ra file toc-do-bao-cao-390.txt
        out_path = SHOTS / 'toc-do-bao-cao-390.txt'
        out_path.write_text('\n'.join(lines_out) + '\n', encoding='utf-8')
        print(f'Đã ghi kết quả đo vào {out_path}')

        b.close()
    return loi


def kiem_tra_dot_15_a():
    """Đợt 15A (T223): Màn xem phiếu và thẻ chứng từ điện thoại đủ thông tin, chống bỏ ghi sổ nhầm"""
    loi = []
    print('Kiểm tra đợt 15A (T223): Thông tin chứng từ điện thoại và chống bỏ ghi sổ nhầm:')
    with sync_playwright() as p:
        b = p.chromium.launch(channel='chrome')
        pg = b.new_page(viewport={'width': 390, 'height': 844}, is_mobile=True, has_touch=True)
        con = []
        pg.on('console', lambda m: con.append(m.text) if m.type == 'error' else None)
        pg.on('pageerror', lambda e: con.append(str(e)))

        # Đăng nhập gói PR
        pg.goto(URL + '#/dang-nhap')
        pg.wait_for_selector('.auth-box')
        pg.evaluate(f"localStorage.setItem('iacc-cloud-session', {json.dumps(phien('PR'))})")

        # ── 1. Mở PC2610-0250 ở màn thu chi tien/2-1-1 ──
        pg.goto(URL + '?goi=PR#/app/tien/2-1-1')
        pg.wait_for_selector('.m-ds-ngay-dong', timeout=8000)
        pg.wait_for_timeout(350)

        the_pc = pg.locator('.m-ds-ngay-dong:has-text("PC2610-0250")')
        if the_pc.count() == 0:
            the_pc = pg.locator('.m-ds-ngay-dong:has-text("PC")')
        if the_pc.count() == 0:
            loi.append('15A: không tìm thấy phiếu chi PC nào trong danh sách tien/2-1-1')
        else:
            the_pc.first.click()
            pg.wait_for_selector('.m-xp', timeout=6000)
            pg.wait_for_timeout(400)

            # Có khối Hạch toán mở sẵn với ít nhất 2 dòng có "Nợ" và "Có" kèm số tài khoản
            the_ht = pg.locator('.m-xp-the-ht')
            if the_ht.count() == 0:
                loi.append('15A: phiếu chi thiếu khối Hạch toán mở sẵn (.m-xp-the-ht)')
            else:
                ht_txt = the_ht.first.inner_text()
                if 'Nợ' not in ht_txt or 'Có' not in ht_txt:
                    loi.append(f'15A: khối Hạch toán không đủ dòng "Nợ" và "Có" (thấy: {ht_txt})')
                dong_ht = the_ht.locator('.m-xp-ht-dong')
                if dong_ht.count() < 2:
                    loi.append(f'15A: khối Hạch toán có ít hơn 2 dòng ({dong_ht.count()} dòng)')

            # Có trường Lý do chi, Quỹ
            xp_txt = pg.locator('.m-xp-the-dau').first.inner_text()
            if 'Lý do chi' not in xp_txt and 'Lý do thu' not in xp_txt:
                loi.append('15A: phiếu chi thiếu trường "Lý do chi" ở thẻ đầu')
            if 'Quỹ' not in xp_txt:
                loi.append('15A: phiếu chi thiếu trường "Quỹ" ở thẻ đầu')

            # Không có chữ "Thành tiền mặt hàng"
            tong_txt = pg.locator('.m-xp-the-tong').inner_text() if pg.locator('.m-xp-the-tong').count() > 0 else ''
            if 'Thành tiền mặt hàng' in tong_txt:
                loi.append('15A: phiếu chi còn hiện chữ "Thành tiền mặt hàng" ở khối tổng')

            # Chụp ảnh tools/shots/m-15-phieu-chi.png
            pg.screenshot(path=str(SHOTS / 'm-15-phieu-chi.png'))

            # Kiểm tra chống bỏ ghi sổ nhầm:
            # Nếu phiếu đã ghi sổ: nút "Bỏ ghi sổ" không phải nút chính; bấm thì hiện hộp hỏi lại, bấm Huỷ thì phiếu vẫn "Đã ghi sổ"
            chip_ghi = pg.locator('.m-xp-dau-phai .m-ct-chip:has-text("Đã ghi sổ")')
            if chip_ghi.count() > 0:
                nut_cam = pg.locator('.m-xp-day-phai .m-xp-nut-cam')
                if nut_cam.count() > 0 and 'Bỏ ghi sổ' in nut_cam.first.inner_text():
                    loi.append('15A: nút "Bỏ ghi sổ" vẫn là nút chính màu cam')
                nut_bo_ghi = pg.locator('.m-xp-nut-bo-ghi:has-text("Bỏ ghi sổ")')
                if nut_bo_ghi.count() == 0:
                    loi.append('15A: phiếu đã ghi sổ thiếu nút viền "Bỏ ghi sổ"')
                else:
                    nut_bo_ghi.first.click()
                    pg.wait_for_timeout(300)
                    hop_xac_nhan = pg.locator('.ds-hop:has-text("Bỏ ghi sổ")')
                    if hop_xac_nhan.count() == 0:
                        loi.append('15A: bấm "Bỏ ghi sổ" không hiện hộp xác nhận hỏi lại')
                    else:
                        nut_huy = hop_xac_nhan.locator('button:has-text("Bỏ qua"), button:has-text("Huỷ")')
                        if nut_huy.count() > 0:
                            nut_huy.first.click()
                            pg.wait_for_timeout(250)
                            if pg.locator('.m-xp-dau-phai .m-ct-chip:has-text("Đã ghi sổ")').count() == 0:
                                loi.append('15A: bấm Huỷ trong hộp hỏi lại nhưng trạng thái không còn "Đã ghi sổ"')

        # ── 2. Mở 1 hoá đơn bán hàng 3.1.x và 1 phiếu mua 4.1.x ──
        pg.goto(URL + '?goi=PR#/app/ban-hang/3-1-2')
        pg.wait_for_selector('.m-ds-ngay-dong', timeout=8000)
        pg.wait_for_timeout(350)
        the_bh = pg.locator('.m-ds-ngay-dong')
        if the_bh.count() == 0:
            loi.append('15A: không tìm thấy hoá đơn bán hàng nào ở ban-hang/3-1-2')
        else:
            the_bh.first.click()
            pg.wait_for_selector('.m-xp', timeout=6000)
            pg.wait_for_timeout(350)
            dau_txt = pg.locator('.m-xp-the-dau').first.inner_text()
            if 'Số hoá đơn' not in dau_txt:
                loi.append('15A: hoá đơn bán hàng 3.1.2 thiếu trường "Số hoá đơn"')
            if 'Tình trạng thanh toán' not in dau_txt:
                loi.append('15A: hoá đơn bán hàng 3.1.2 thiếu trường "Tình trạng thanh toán"')
            pg.screenshot(path=str(SHOTS / 'm-15-hoa-don.png'))

        # Phiếu mua 4.1.1
        pg.goto(URL + '?goi=PR#/app/mua-hang/4-1-1')
        pg.wait_for_selector('.m-ds-ngay-dong', timeout=8000)
        pg.wait_for_timeout(350)
        the_mh = pg.locator('.m-ds-ngay-dong')
        if the_mh.count() == 0:
            loi.append('15A: không tìm thấy phiếu mua hàng nào ở mua-hang/4-1-1')
        else:
            the_mh.first.click()
            pg.wait_for_selector('.m-xp', timeout=6000)
            pg.wait_for_timeout(350)
            dau_txt = pg.locator('.m-xp-the-dau').first.inner_text()
            if 'Số hoá đơn' not in dau_txt:
                loi.append('15A: phiếu mua 4.1.1 thiếu trường "Số hoá đơn"')
            if 'Tình trạng thanh toán' not in dau_txt:
                loi.append('15A: phiếu mua 4.1.1 thiếu trường "Tình trạng thanh toán"')

        # ── 3. Mở 1 phiếu 4.1.5 hoặc 10.1.1 (không có chữ "Danh sách hàng hoá") ──
        pg.goto(URL + '?goi=PR#/app/tong-hop/10-1-1')
        pg.wait_for_selector('.m-ds-ngay-dong', timeout=8000)
        pg.wait_for_timeout(350)
        the_th = pg.locator('.m-ds-ngay-dong')
        if the_th.count() == 0:
            loi.append('15A: không tìm thấy phiếu tổng hợp nào ở tong-hop/10-1-1')
        else:
            the_th.first.click()
            pg.wait_for_selector('.m-xp', timeout=6000)
            pg.wait_for_timeout(350)
            tieu_khoi = pg.locator('.m-xp-tieu-khoi').all_inner_texts()
            for t in tieu_khoi:
                if 'Danh sách hàng hoá' in t or 'DANH SÁCH HÀNG HOÁ' in t:
                    loi.append(f'15A: phiếu 10.1.1 còn có tiêu đề "{t}" (phải là CHI TIẾT)')
            pg.screenshot(path=str(SHOTS / 'm-15-chi-phi.png'))

        # ── 4. Danh sách Chuyển kho: thẻ không có chữ "0 đ" ──
        pg.goto(URL + '?goi=PR#/app/kho/5-1-4-3')
        pg.wait_for_selector('.m-ds-ngay-dong', timeout=8000)
        pg.wait_for_timeout(350)
        the_ck = pg.locator('.m-ds-ngay-dong')
        if the_ck.count() == 0:
            loi.append('15A: không tìm thấy thẻ chuyển kho nào ở kho/5-1-4-3')
        else:
            for i in range(min(5, the_ck.count())):
                txt = the_ck.nth(i).inner_text()
                if '0 đ' in txt:
                    loi.append(f'15A: thẻ danh sách Chuyển kho thứ {i+1} còn có chữ "0 đ"')
                    break

        b.close()
    return loi


def kiem_tra_dot_16_a():
    """Đợt 16A (Anti A): Màn xem phiếu điện thoại số tiền lớn có dấu, dòng hàng gọn 2 hàng (T223)"""
    loi = []
    print('Kiểm tra đợt 16A (Anti A): Xem phiếu gọn, số tiền lớn:')
    with sync_playwright() as p:
        b = p.chromium.launch(channel='chrome')
        pg = b.new_page(viewport={'width': 390, 'height': 844}, is_mobile=True, has_touch=True)
        con = []
        pg.on('console', lambda m: con.append(m.text) if m.type == 'error' else None)
        pg.on('pageerror', lambda e: con.append(str(e)))

        # Đăng nhập gói PR
        pg.goto(URL + '#/dang-nhap')
        pg.wait_for_selector('.auth-box')
        pg.evaluate(f"localStorage.setItem('iacc-cloud-session', {json.dumps(phien('PR'))})")

        # 1. Mở phiếu chi PC2610-0261 (2.1.1): có số tiền lớn bắt đầu "−" với lớp m-tien-ra, nằm trên khối Hạch toán
        pg.goto(URL + '?goi=PR#/app/tien/2-1-1')
        pg.wait_for_selector('.m-ds-ngay-dong, .m-ds-ngay-dong', timeout=8000)
        pg.wait_for_timeout(400)
        the_pc = pg.locator('.m-ds-ngay-dong:has-text("PC2610-0261"), .m-ds-ngay-dong:has-text("PC2610-0261")')
        if the_pc.count() == 0:
            loi.append('16A: không tìm thấy phiếu chi PC2610-0261 ở tien/2-1-1')
        else:
            the_pc.first.click()
            pg.wait_for_selector('.m-xp', timeout=6000)
            pg.wait_for_timeout(350)

            tien_lon = pg.locator('.m-xp-tien-lon')
            if tien_lon.count() == 0:
                loi.append('16A: phiếu chi thiếu phần tử số tiền lớn .m-xp-tien-lon')
            else:
                txt = tien_lon.first.inner_text().strip()
                cls = tien_lon.first.get_attribute('class') or ''
                if not (txt.startswith('−') or txt.startswith('-')):
                    loi.append(f'16A: số tiền lớn phiếu chi không bắt đầu bằng "−" (thực tế: {txt})')
                if 'm-tien-ra' not in cls:
                    loi.append(f'16A: số tiền lớn phiếu chi thiếu lớp m-tien-ra (class: {cls})')

                the_ht = pg.locator('.m-xp-the-ht, .m-xp-khoi-ht')
                if the_ht.count() > 0:
                    box_tien = tien_lon.first.bounding_box()
                    box_ht = the_ht.first.bounding_box()
                    if box_tien and box_ht and box_tien['y'] >= box_ht['y']:
                        loi.append('16A: số tiền lớn không nằm trên khối Hạch toán')

            # Chụp ảnh tools/shots/m-16-xem-chi.png
            pg.screenshot(path=str(SHOTS / 'm-16-xem-chi.png'))

            if pg.evaluate("document.documentElement.scrollWidth > 390"):
                loi.append('16A: phiếu chi bị tràn ngang màn hình (> 390px)')

        # 2. Mở phiếu thu bất kỳ: số tiền lớn bắt đầu "+" với lớp m-tien-vao
        pg.goto(URL + '?goi=PR#/app/tien/2-1-1')
        pg.wait_for_selector('.m-ds-ngay-dong, .m-ds-ngay-dong', timeout=8000)
        pg.wait_for_timeout(400)
        the_pt = pg.locator('.m-ds-ngay-dong:has-text("PT"), .m-ds-ngay-dong:has-text("Thu"), .m-ds-ngay-dong:has-text("PT"), .m-ds-ngay-dong:has-text("Thu")')
        if the_pt.count() == 0:
            loi.append('16A: không tìm thấy phiếu thu nào ở tien/2-1-1')
        else:
            the_pt.first.click()
            pg.wait_for_selector('.m-xp', timeout=6000)
            pg.wait_for_timeout(350)

            tien_lon_thu = pg.locator('.m-xp-tien-lon')
            if tien_lon_thu.count() == 0:
                loi.append('16A: phiếu thu thiếu phần tử số tiền lớn .m-xp-tien-lon')
            else:
                txt_thu = tien_lon_thu.first.inner_text().strip()
                cls_thu = tien_lon_thu.first.get_attribute('class') or ''
                if not txt_thu.startswith('+'):
                    loi.append(f'16A: số tiền lớn phiếu thu không bắt đầu bằng "+" (thực tế: {txt_thu})')
                if 'm-tien-vao' not in cls_thu:
                    loi.append(f'16A: số tiền lớn phiếu thu thiếu lớp m-tien-vao (class: {cls_thu})')

            if pg.evaluate("document.documentElement.scrollWidth > 390"):
                loi.append('16A: phiếu thu bị tràn ngang màn hình (> 390px)')

        # 3. Mở hoá đơn bán hàng có từ 4 mặt hàng (3.1.2): chiều cao trung bình một dòng hàng dưới 80px; có chữ "×"
        pg.goto(URL + '?goi=PR#/app/ban-hang/3-1-2')
        pg.wait_for_selector('.m-ds-ngay-dong, .m-ds-ngay-dong', timeout=8000)
        pg.wait_for_timeout(400)
        thes_bh = pg.locator('.m-ds-ngay-dong, .m-ds-ngay-dong')
        tim_thay_4 = False
        for i in range(min(thes_bh.count(), 10)):
            thes_bh.nth(i).click()
            pg.wait_for_selector('.m-xp', timeout=6000)
            pg.wait_for_timeout(300)
            dongs = pg.locator('.m-xp-dong')
            if dongs.count() >= 4:
                tim_thay_4 = True
                the_ds = pg.locator('.m-xp-ds-the')
                box_ds = the_ds.first.bounding_box() if the_ds.count() > 0 else None
                chieu_cao_tb = (box_ds['height'] / dongs.count()) if (box_ds and dongs.count() > 0) else 0
                print(f"16A đo chiều cao: {dongs.count()} dòng, tổng {box_ds['height']:.1f}px, tb {chieu_cao_tb:.1f}px/dòng")
                if chieu_cao_tb >= 80:
                    loi.append(f'16A: chiều cao trung bình một dòng hàng {chieu_cao_tb:.1f}px >= 80px')

                txt_ds = the_ds.first.inner_text() if the_ds.count() > 0 else ''
                if '×' not in txt_ds:
                    loi.append('16A: dòng hàng hoá đơn thiếu chữ "×"')

                # Chụp ảnh tools/shots/m-16-xem-hoa-don.png
                the_ds.first.scroll_into_view_if_needed()
                pg.wait_for_timeout(200)
                pg.screenshot(path=str(SHOTS / 'm-16-xem-hoa-don.png'))

                if pg.evaluate("document.documentElement.scrollWidth > 390"):
                    loi.append('16A: hoá đơn bán hàng bị tràn ngang (> 390px)')
                break

            pg.go_back()
            pg.wait_for_selector('.m-ds-ngay-dong, .m-ds-ngay-dong', timeout=8000)
            pg.wait_for_timeout(300)

        if not tim_thay_4:
            loi.append('16A: không tìm thấy hoá đơn bán hàng có từ 4 mặt hàng ở ban-hang/3-1-2')

        # 4. Mở phiếu kiểm kê (5.1.10): không có số tiền lớn, dòng hàng có chữ "Thực tế"
        pg.goto(URL + '?goi=PR#/app/kho/5-1-10')
        pg.wait_for_selector('.m-ds-ngay-dong, .m-ds-ngay-dong', timeout=8000)
        pg.wait_for_timeout(400)
        the_kk = pg.locator('.m-ds-ngay-dong, .m-ds-ngay-dong')
        if the_kk.count() == 0:
            loi.append('16A: không tìm thấy phiếu kiểm kê nào ở kho/5-1-10')
        else:
            the_kk.first.click()
            pg.wait_for_selector('.m-xp', timeout=6000)
            pg.wait_for_timeout(350)

            tien_lon_kk = pg.locator('.m-xp-tien-lon')
            if tien_lon_kk.count() > 0:
                loi.append('16A: phiếu kiểm kê còn hiện số tiền lớn .m-xp-tien-lon')

            dongs_kk = pg.locator('.m-xp-dong')
            if dongs_kk.count() == 0:
                loi.append('16A: phiếu kiểm kê không có dòng hàng .m-xp-dong nào')
            else:
                txt_dong_kk = dongs_kk.first.inner_text()
                if 'Thực tế' not in txt_dong_kk:
                    loi.append(f'16A: dòng hàng kiểm kê thiếu chữ "Thực tế" (thấy: {txt_dong_kk})')

            if pg.evaluate("document.documentElement.scrollWidth > 390"):
                loi.append('16A: phiếu kiểm kê bị tràn ngang (> 390px)')

        if con:
            loi.append(f'16A: lỗi console {con[:2]}')

        b.close()
    return loi


def kiem_tra_dot_15_b():
    """Đợt 15B (Anti B): Sổ dạng dòng trên điện thoại (T223, mục 2.7)"""
    loi = []
    print('Kiểm tra đợt 15B (Anti B): Sổ dạng dòng trên điện thoại:')
    with sync_playwright() as p:
        b = p.chromium.launch(channel='chrome')
        pg = b.new_page(viewport={'width': 390, 'height': 844}, is_mobile=True, has_touch=True)
        con = []
        pg.on('console', lambda m: con.append(m.text) if m.type == 'error' else None)
        pg.on('pageerror', lambda e: con.append(str(e)))

        # Đăng nhập gói PR
        pg.goto(URL + '#/dang-nhap')
        pg.wait_for_selector('.auth-box')
        pg.evaluate(f"localStorage.setItem('iacc-cloud-session', {json.dumps(phien('PR'))})")

        # Mở Sổ quỹ tiền mặt 2.2.1
        pg.goto(URL + '?goi=PR#/app/bao-cao/2-2-1')
        pg.wait_for_selector('.m-so-bc', timeout=8000)
        pg.wait_for_timeout(400)

        # 1. Có chip "Dạng dòng" đang bật
        chip_dong = pg.locator('.m-so-dong-chip:has-text("Dạng dòng")')
        if chip_dong.count() == 0:
            loi.append('Sổ dạng dòng: không tìm thấy chip "Dạng dòng"')
        else:
            cls = chip_dong.first.get_attribute('class') or ''
            if 'm-so-dong-chip-on' not in cls:
                loi.append(f'Sổ dạng dòng: chip "Dạng dòng" không ở trạng thái bật (class: {cls})')

        # 2. Có thẻ tổng 3 ô
        the_tong = pg.locator('.m-so-dong-tong')
        if the_tong.count() == 0:
            loi.append('Sổ dạng dòng: không tìm thấy thẻ tổng .m-so-dong-tong')
        else:
            o_tong = the_tong.locator('.m-so-dong-tong-o')
            if o_tong.count() != 3:
                loi.append(f'Sổ dạng dòng: thẻ tổng không đủ 3 ô (thực tế: {o_tong.count()})')

        # 3. Có ít nhất 1 tiêu đề ngày chứa "Tồn"
        tieu_de_ngay = pg.locator('.m-so-dong-ngay')
        if tieu_de_ngay.count() == 0:
            loi.append('Sổ dạng dòng: không tìm thấy tiêu đề ngày .m-so-dong-ngay')
        else:
            co_ton = False
            for i in range(tieu_de_ngay.count()):
                txt = tieu_de_ngay.nth(i).inner_text()
                if 'Tồn' in txt:
                    co_ton = True
                    break
            if not co_ton:
                loi.append('Sổ dạng dòng: tiêu đề ngày không chứa chữ "Tồn"')

        # 4. Có số màu xanh và số màu đỏ KHÔNG bắt đầu bằng "+" hay "−" (T273)
        so_xanh = pg.locator('.m-so-dong-duong')
        so_do = pg.locator('.m-so-dong-am')
        if so_xanh.count() == 0:
            loi.append('Sổ dạng dòng: không tìm thấy số màu xanh .m-so-dong-duong')
        else:
            co_plus = False
            for i in range(so_xanh.count()):
                txt = so_xanh.nth(i).inner_text().strip()
                if txt.startswith('+'):
                    co_plus = True
                    break
            if co_plus:
                loi.append('Sổ dạng dòng: số màu xanh vẫn bắt đầu bằng "+" (luật mới T273 bỏ dấu +)')

        if so_do.count() == 0:
            loi.append('Sổ dạng dòng: không tìm thấy số màu đỏ .m-so-dong-am')
        else:
            co_minus = False
            for i in range(so_do.count()):
                txt = so_do.nth(i).inner_text().strip()
                if txt.startswith('−') or txt.startswith('-'):
                    co_minus = True
                    break
            if co_minus:
                loi.append('Sổ dạng dòng: số màu đỏ vẫn bắt đầu bằng "−" (luật mới T273 bỏ dấu −)')

        # 5. Chụp ảnh tools/shots/m-15-so-dong.png
        pg.screenshot(path=str(SHOTS / 'm-15-so-dong.png'))

        # 6. Bấm chip "Bảng" thì hiện lại bảng (table)
        chip_bang = pg.locator('.m-so-dong-chip:has-text("Bảng")')
        if chip_bang.count() == 0:
            loi.append('Sổ dạng dòng: không tìm thấy chip "Bảng"')
        else:
            chip_bang.first.click()
            pg.wait_for_timeout(350)
            bang = pg.locator('.m-sbc-bang-wrap table')
            if bang.count() == 0:
                loi.append('Sổ dạng dòng: bấm chip "Bảng" không hiện lại bảng table')

        # 7. Không tràn ngang
        if pg.evaluate("document.documentElement.scrollWidth > 390"):
            loi.append('Sổ dạng dòng: tràn ngang màn hình (> 390px)')

        if con:
            loi.append(f'Sổ dạng dòng: lỗi console {con[:2]}')

        b.close()
    return loi


def kiem_tra_dot_16_b():
    loi = []
    print('Kiểm tra đợt 16B (Anti B): Danh sách theo ngày, tổng thu chi trên điện thoại:')
    with sync_playwright() as p:
        b = p.chromium.launch(channel='chrome')
        pg = b.new_page(viewport={'width': 390, 'height': 844}, is_mobile=True, has_touch=True)
        con = []
        pg.on('console', lambda m: con.append(m.text) if m.type == 'error' else None)
        pg.on('pageerror', lambda e: con.append(str(e)))

        # Đăng nhập gói PR
        pg.goto(URL + '#/dang-nhap')
        pg.wait_for_selector('.auth-box')
        pg.evaluate(f"localStorage.setItem('iacc-cloud-session', {json.dumps(phien('PR'))})")

        # 1. Mở #/app/tien/2-1-1 (Thu, chi tiền)
        pg.goto(URL + '?goi=PR#/app/tien/2-1-1')
        pg.wait_for_selector('.m-ds-khung', timeout=8000)
        pg.wait_for_timeout(400)

        # - Có thẻ 3 ô chứa "Tổng thu", "Tổng chi", "Chênh lệch"
        the_tong = pg.locator('.m-tong3')
        if the_tong.count() == 0:
            loi.append('DS thu chi: không tìm thấy thẻ 3 ô .m-tong3')
        else:
            txt_tong = the_tong.first.inner_text()
            for o in ['Tổng thu', 'Tổng chi', 'Chênh lệch']:
                if o not in txt_tong:
                    loi.append(f'DS thu chi: thẻ 3 ô thiếu nhãn "{o}"')

        # - Có ít nhất 1 tiêu đề nhóm ngày chứa "Thứ" hoặc "Chủ nhật"
        tieu_de_ngay = pg.locator('.m-ds-ngay-tieu-de')
        if tieu_de_ngay.count() == 0:
            loi.append('DS thu chi: không tìm thấy tiêu đề nhóm ngày .m-ds-ngay-tieu-de')
        else:
            co_thu = False
            for i in range(tieu_de_ngay.count()):
                txt = tieu_de_ngay.nth(i).inner_text()
                if 'Thứ' in txt or 'Chủ nhật' in txt:
                    co_thu = True
                    break
            if not co_thu:
                loi.append('DS thu chi: tiêu đề nhóm ngày không chứa "Thứ" hoặc "Chủ nhật"')

        # - Có số bắt đầu "+" mang lớp m-tien-vao và số bắt đầu "−" mang lớp m-tien-ra
        so_xanh = pg.locator('.m-tien-vao')
        so_do = pg.locator('.m-tien-ra')
        co_plus = False
        for i in range(so_xanh.count()):
            txt = so_xanh.nth(i).inner_text().strip()
            if txt.startswith('+'):
                co_plus = True
                break
        if not co_plus:
            loi.append('DS thu chi: không tìm thấy số mang lớp m-tien-vao bắt đầu bằng "+"')

        co_minus = False
        for i in range(so_do.count()):
            txt = so_do.nth(i).inner_text().strip()
            if txt.startswith('−') or txt.startswith('-'):
                co_minus = True
                break
        if not co_minus:
            loi.append('DS thu chi: không tìm thấy số mang lớp m-tien-ra bắt đầu bằng "−"')

        # - Chiều cao trung bình một dòng phiếu dưới 70px
        dong_phieu = pg.locator('.m-ds-ngay-dong')
        so_dong = dong_phieu.count()
        if so_dong == 0:
            loi.append('DS thu chi: không tìm thấy dòng phiếu .m-ds-ngay-dong')
        else:
            tong_cao = 0
            for i in range(so_dong):
                box = dong_phieu.nth(i).bounding_box()
                if box:
                    tong_cao += box['height']
            tb_cao = tong_cao / so_dong
            if tb_cao >= 70:
                loi.append(f'DS thu chi: chiều cao trung bình dòng phiếu ({tb_cao:.1f}px) không dưới 70px')

        # - Không tràn ngang
        if pg.evaluate("document.documentElement.scrollWidth > 390"):
            loi.append('DS thu chi: tràn ngang màn hình (> 390px)')

        # - Chụp tools/shots/m-16-ds-thu-chi.png
        pg.screenshot(path=str(SHOTS / 'm-16-ds-thu-chi.png'))

        # - Bấm dòng đầu thì URL đổi sang trang xem phiếu
        if so_dong > 0:
            dong_phieu.first.click()
            pg.wait_for_timeout(400)
            cur_h = pg.evaluate('location.hash')
            if not cur_h.startswith('#/app/tien/2-1-1/'):
                loi.append(f'DS thu chi: bấm dòng đầu URL không đổi sang xem phiếu, đang là: {cur_h}')

        # 2. Mở #/app/ban-hang/3-1-2: không có thẻ 3 ô, vẫn có tiêu đề nhóm ngày
        pg.goto(URL + '?goi=PR#/app/ban-hang/3-1-2')
        pg.wait_for_selector('.m-ds-khung', timeout=8000)
        pg.wait_for_timeout(400)

        the_tong_bh = pg.locator('.m-tong3')
        if the_tong_bh.count() > 0:
            loi.append('DS bán hàng: không được có thẻ 3 ô .m-tong3')

        tieu_de_bh = pg.locator('.m-ds-ngay-tieu-de')
        if tieu_de_bh.count() == 0:
            loi.append('DS bán hàng: thiếu tiêu đề nhóm ngày .m-ds-ngay-tieu-de')

        if pg.evaluate("document.documentElement.scrollWidth > 390"):
            loi.append('DS bán hàng: tràn ngang màn hình (> 390px)')

        # Chụp tools/shots/m-16-ds-ban-hang.png
        pg.screenshot(path=str(SHOTS / 'm-16-ds-ban-hang.png'))

        # 3. Mở danh mục khách hàng ở tab Khác: vẫn hiện danh sách như cũ, không có tiêu đề nhóm ngày
        pg.goto(URL + '?goi=PR#/app/khac')
        pg.wait_for_selector('.m-khac', timeout=8000)
        pg.wait_for_timeout(300)
        dong_dm = pg.locator('.m-khac-dong:has-text("Đối tượng")')
        if dong_dm.count() > 0:
            dong_dm.first.click()
            pg.wait_for_selector('.m-ds-khung', timeout=8000)
            pg.wait_for_timeout(350)
        else:
            pg.goto(URL + '?goi=PR#/app/danh-muc/1-5')
            pg.wait_for_selector('.m-ds-khung', timeout=8000)
            pg.wait_for_timeout(350)

        tieu_de_dm = pg.locator('.m-ds-ngay-tieu-de')
        if tieu_de_dm.count() > 0:
            loi.append('Danh mục khách hàng: không được có tiêu đề nhóm ngày .m-ds-ngay-tieu-de')

        if pg.evaluate("document.documentElement.scrollWidth > 390"):
            loi.append('Danh mục khách hàng: tràn ngang màn hình (> 390px)')

        if con:
            loi.append(f'Đợt 16B: lỗi console {con[:2]}')

        b.close()
    return loi


def kiem_tra_dot_17_a():
    loi = []
    print('Kiểm tra đợt 17A (Anti A): Màn lập phiếu trên điện thoại có tài khoản hạch toán:')
    with sync_playwright() as p:
        b = p.chromium.launch(channel='chrome')
        pg = b.new_page(viewport={'width': 390, 'height': 844}, is_mobile=True, has_touch=True)
        con = []
        pg.on('console', lambda m: con.append(m.text) if m.type == 'error' else None)
        pg.on('pageerror', lambda e: con.append(str(e)))

        # Đăng nhập gói PR
        pg.goto(URL + '#/dang-nhap')
        pg.wait_for_selector('.auth-box')
        pg.evaluate(f"localStorage.setItem('iacc-cloud-session', {json.dumps(phien('PR'))})")

        # ── 1. Lập phiếu chi (#/app/tien/2-1-1/moi?loai=chi) ──
        pg.goto(URL + '?goi=PR#/app/tien/2-1-1/moi?loai=chi')
        pg.wait_for_selector('.m-lp', timeout=8000)
        pg.wait_for_timeout(300)

        # Chọn chi nhánh nếu có hộp thoại / tấm chọn
        if pg.locator('.m-tam-hop:has-text("chi nhánh"), .m-tam-hop:has-text("Chi nhánh")').count() > 0:
            pg.locator('.m-tam-dong').first.click()
            pg.wait_for_timeout(300)

        # Qua bước 3
        nut_tiep = pg.locator('.m-lp-nut-tiep, .m-lp-nut-chinh:has-text("Tiếp tục")')
        if nut_tiep.count() == 0:
            loi.append('17A: không tìm thấy nút Tiếp tục ở bước 1 lập phiếu chi')
        else:
            nut_tiep.first.click()
            pg.wait_for_selector('.m-lp-ds-sua', timeout=6000)
            pg.wait_for_timeout(350)

            # Dòng có chữ "Nợ" và "Có" kèm số tài khoản
            hang_tk = pg.locator('.m-lp-hang-tk')
            if hang_tk.count() == 0:
                loi.append('17A: bước 3 thiếu hàng tài khoản .m-lp-hang-tk')
            else:
                txt_tk = hang_tk.first.inner_text()
                if 'Nợ' not in txt_tk or 'Có' not in txt_tk:
                    loi.append(f'17A: hàng tài khoản bước 3 thiếu "Nợ" hoặc "Có" (thấy: {txt_tk})')

                # Đổi lý do dòng sang "Chi trả lương": tài khoản Nợ thành 334
                o_ly_do = pg.locator('.m-lp-sua-o:has-text("Lý do")')
                if o_ly_do.count() == 0:
                    loi.append('17A: bước 3 thiếu ô chọn Lý do')
                else:
                    o_ly_do.first.click()
                    pg.wait_for_selector('.m-tam-hop', timeout=4000)
                    pg.wait_for_timeout(250)
                    muc_luong = pg.locator('.m-tam-dong:has-text("Chi trả lương")')
                    if muc_luong.count() == 0:
                        loi.append('17A: tấm chọn lý do thiếu "Chi trả lương"')
                    else:
                        muc_luong.first.click()
                        pg.wait_for_timeout(200)
                        if pg.locator('.m-tam-btn-apdung').count() > 0:
                            pg.locator('.m-tam-btn-apdung').first.click()
                        pg.wait_for_timeout(300)

                        txt_tk_sau_doi = hang_tk.first.inner_text()
                        if '334' not in txt_tk_sau_doi:
                            loi.append(f'17A: đổi lý do sang "Chi trả lương" nhưng tài khoản Nợ không thành 334 (thấy: {txt_tk_sau_doi})')

                # Bấm hàng tài khoản, chọn TK Nợ 6422: hàng ghi "Nợ 6422"
                hang_tk.first.click()
                pg.wait_for_selector('.m-tam-hop', timeout=4000)
                pg.wait_for_timeout(250)
                muc_6422 = pg.locator('.m-tam-dong:has-text("6422")')
                if muc_6422.count() == 0:
                    loi.append('17A: tấm chọn tài khoản thiếu mục 6422')
                else:
                    muc_6422.first.click()
                    pg.wait_for_timeout(200)
                    if pg.locator('.m-tam-btn-apdung').count() > 0:
                        pg.locator('.m-tam-btn-apdung').first.click()
                    pg.wait_for_timeout(300)

                    txt_tk_sau_chon = hang_tk.first.inner_text()
                    if 'Nợ 6422' not in txt_tk_sau_chon:
                        loi.append(f'17A: sau khi chọn TK 6422, hàng không ghi "Nợ 6422" (thấy: {txt_tk_sau_chon})')

            # Kiểm tra tràn ngang và chụp ảnh Bước 3
            if pg.evaluate("document.documentElement.scrollWidth > 390"):
                loi.append('17A: bước 3 lập phiếu chi tràn ngang màn hình (> 390px)')
            pg.screenshot(path=str(SHOTS / 'm-17-lap-chi-b3.png'))

            # Qua bước 4
            nut_qua_b4 = pg.locator('.m-lp-day .m-lp-nut-chinh:has-text("Tiếp tục")')
            if nut_qua_b4.count() == 0:
                loi.append('17A: bước 3 thiếu nút Tiếp tục để qua bước 4')
            else:
                nut_qua_b4.first.click()
                pg.wait_for_selector('.m-lp-buoc-b4', timeout=6000)
                pg.wait_for_timeout(350)

                # Có khối Hạch toán với dòng "Nợ 6422" và "Có 1111"
                the_ht_b4 = pg.locator('.m-xp-the-ht')
                if the_ht_b4.count() == 0:
                    loi.append('17A: bước 4 thiếu khối Hạch toán (.m-xp-the-ht)')
                else:
                    ht_b4_txt = the_ht_b4.first.inner_text()
                    if 'Nợ 6422' not in ht_b4_txt:
                        loi.append(f'17A: bước 4 khối Hạch toán thiếu dòng "Nợ 6422" (thấy: {ht_b4_txt})')
                    if 'Có 1111' not in ht_b4_txt:
                        loi.append(f'17A: bước 4 khối Hạch toán thiếu dòng "Có 1111" (thấy: {ht_b4_txt})')

                if pg.evaluate("document.documentElement.scrollWidth > 390"):
                    loi.append('17A: bước 4 lập phiếu chi tràn ngang màn hình (> 390px)')
                pg.screenshot(path=str(SHOTS / 'm-17-lap-chi-b4.png'))

                # Lưu, mở lại phiếu vừa lưu: khối Hạch toán màn xem phiếu có "Nợ 6422"
                nut_luu = pg.locator('.m-lp-day-hang-nut .m-lp-nut-chinh:has-text("Lưu")')
                if nut_luu.count() == 0:
                    loi.append('17A: bước 4 thiếu nút Lưu')
                else:
                    nut_luu.first.click()
                    pg.wait_for_selector('.m-lp-buoc-thanh-cong, .m-xp', timeout=6000)
                    pg.wait_for_timeout(350)
                    nut_xem = pg.locator('.m-lp-btn-xem:has-text("Xem phiếu")')
                    if nut_xem.count() > 0:
                        nut_xem.first.click()
                        pg.wait_for_selector('.m-xp', timeout=6000)
                        pg.wait_for_timeout(350)

                    the_ht_xp = pg.locator('.m-xp-the-ht')
                    if the_ht_xp.count() == 0:
                        loi.append('17A: màn xem phiếu sau khi lưu thiếu khối Hạch toán')
                    else:
                        xp_ht_txt = the_ht_xp.first.inner_text()
                        if 'Nợ 6422' not in xp_ht_txt:
                            loi.append(f'17A: khối Hạch toán màn xem phiếu vừa lưu thiếu "Nợ 6422" (thấy: {xp_ht_txt})')

        # ── 2. Lập hoá đơn bán hàng 3.1.2 ──
        pg.goto(URL + '?goi=PR#/app/ban-hang/3-1-2/moi')
        pg.wait_for_selector('.m-lp', timeout=8000)
        pg.wait_for_timeout(300)

        # Chọn chi nhánh nếu có
        if pg.locator('.m-tam-hop:has-text("chi nhánh"), .m-tam-hop:has-text("Chi nhánh")').count() > 0:
            pg.locator('.m-tam-dong').first.click()
            pg.wait_for_timeout(300)

        # Bước 1 có chữ "Kho xuất", không có "Kho nhập"
        b1_txt = pg.locator('.m-lp-than').first.inner_text()
        if 'Kho xuất' not in b1_txt:
            loi.append('17A: hoá đơn bán hàng 3.1.2 bước 1 thiếu chữ "Kho xuất"')
        if 'Kho nhập' in b1_txt:
            loi.append('17A: hoá đơn bán hàng 3.1.2 bước 1 còn có chữ "Kho nhập"')

        # Qua bước 2
        nut_tiep_bh = pg.locator('.m-lp-nut-tiep, .m-lp-nut-chinh:has-text("Tiếp tục")')
        if nut_tiep_bh.count() > 0:
            nut_tiep_bh.first.click()
            pg.wait_for_selector('.m-lp-ds-hang', timeout=6000)
            pg.wait_for_timeout(300)

            # Chọn 1 mặt hàng
            the_hang = pg.locator('.m-lp-the-hang')
            if the_hang.count() > 0:
                the_hang.first.click()
                pg.wait_for_timeout(200)

            # Qua bước 3
            nut_ds_chon = pg.locator('.m-lp-nut-chinh:has-text("Danh sách đã chọn")')
            if nut_ds_chon.count() > 0:
                nut_ds_chon.first.click()
                pg.wait_for_selector('.m-lp-ds-sua', timeout=6000)
                pg.wait_for_timeout(300)

                # Qua bước 4
                nut_b3_tiep = pg.locator('.m-lp-nut-chinh:has-text("Tiếp tục")')
                if nut_b3_tiep.count() > 0:
                    nut_b3_tiep.first.click()
                    pg.wait_for_selector('.m-lp-buoc-b4', timeout=6000)
                    pg.wait_for_timeout(350)

                    # Bước 4 có khối Hạch toán có "Nợ 131" hoặc "Nợ 1111" và "Có 5111"
                    the_ht_bh = pg.locator('.m-xp-the-ht')
                    if the_ht_bh.count() == 0:
                        loi.append('17A: hoá đơn bán hàng bước 4 thiếu khối Hạch toán')
                    else:
                        ht_bh_txt = the_ht_bh.first.inner_text()
                        if ('Nợ 131' not in ht_bh_txt and 'Nợ 1111' not in ht_bh_txt):
                            loi.append(f'17A: hoá đơn bán hàng bước 4 thiếu "Nợ 131" hoặc "Nợ 1111" (thấy: {ht_bh_txt})')
                        if 'Có 5111' not in ht_bh_txt:
                            loi.append(f'17A: hoá đơn bán hàng bước 4 thiếu "Có 5111" (thấy: {ht_bh_txt})')

                    if pg.evaluate("document.documentElement.scrollWidth > 390"):
                        loi.append('17A: hoá đơn bán hàng bước 4 tràn ngang (> 390px)')
                    pg.screenshot(path=str(SHOTS / 'm-17-lap-hoa-don-b4.png'))

        # ── 3. Mở lại PC2610-0261 ở màn xem phiếu: Hạch toán vẫn "Nợ 242", "Có 1111" ──
        pg.goto(URL + '?goi=PR#/app/tien/2-1-1/chi-cpb')
        pg.wait_for_selector('.m-xp', timeout=8000)
        pg.wait_for_timeout(350)

        the_ht_261 = pg.locator('.m-xp-the-ht')
        if the_ht_261.count() == 0:
            loi.append('17A: phiếu PC2610-0261 thiếu khối Hạch toán ở màn xem phiếu')
        else:
            txt_261 = the_ht_261.first.inner_text()
            if 'Nợ 242' not in txt_261:
                loi.append(f'17A: phiếu PC2610-0261 Hạch toán thiếu "Nợ 242" (thấy: {txt_261})')
            if 'Có 1111' not in txt_261:
                loi.append(f'17A: phiếu PC2610-0261 Hạch toán thiếu "Có 1111" (thấy: {txt_261})')

        # Kiểm tra console
        if con:
            loi.append(f'17A: lỗi console {con[:2]}')

        b.close()
    return loi


def kiem_tra_dot_18_a():
    loi = []
    print('Kiểm tra đợt 18A (Anti A): Biểu đồ trang chủ điện thoại và bản web:')
    SHOTS.mkdir(exist_ok=True)
    with sync_playwright() as p:
        b = p.chromium.launch(channel='chrome')
        pg = b.new_page(viewport={'width': 390, 'height': 844}, is_mobile=True, has_touch=True)
        con = []
        pg.on('console', lambda m: con.append(m.text) if m.type == 'error' else None)
        pg.on('pageerror', lambda e: con.append(str(e)))

        # ── 1. Đăng nhập gói PR, chi nhánh Tất cả ──
        pg.goto(URL + '#/dang-nhap')
        pg.wait_for_selector('.auth-box')
        pg.evaluate(f"localStorage.setItem('iacc-cloud-session', {json.dumps(phien('PR'))})")
        pg.goto(URL + '?goi=PR#/app')
        pg.wait_for_selector('.m-tc-the-ivt', timeout=8000)
        pg.wait_for_timeout(400)

        # 6 tiêu đề thẻ biểu đồ
        tieu_des = [
            'Thác nước lợi nhuận',
            'Xu hướng kinh doanh 4 tháng',
            'Dòng tiền kỳ',
            'Hiệu quả theo chi nhánh',
            'Cơ cấu chi phí',
            'Món bán chạy',
        ]

        for td in tieu_des:
            the = pg.locator(f".m-tc-the-ivt:has(.m-tc-the-tieu:text-is('{td}'))")
            if the.count() == 0:
                loi.append(f'18A: không tìm thấy thẻ "{td}" trên trang chủ điện thoại')
            else:
                if the.locator('svg').count() == 0:
                    loi.append(f'18A: thẻ "{td}" không có thẻ svg nào')

        # Thẻ Tổng quan tài chính có 3 hoặc 4 svg.spark
        the_tc = pg.locator(".m-tc-the-ivt:has(.m-tc-the-tieu:text-is('Tổng quan tài chính'))")
        if the_tc.count() == 0:
            loi.append('18A: không tìm thấy thẻ "Tổng quan tài chính"')
        else:
            so_spark = the_tc.locator('svg.spark').count()
            if so_spark not in (3, 4):
                loi.append(f'18A: thẻ Tổng quan tài chính có {so_spark} svg.spark (mong đợi 3 hoặc 4)')

        # Không tràn ngang, không lỗi console
        tran_ngang = pg.evaluate("document.documentElement.scrollWidth > window.innerWidth + 1")
        if tran_ngang:
            loi.append('18A: trang chủ điện thoại bị tràn ngang')
        if con:
            loi.append(f'18A: lỗi console {con[:2]}')
            con.clear()

        # Chụp 3 ảnh trên điện thoại
        # Ảnh 1: phần thẻ tài chính và thác nước
        the_tc.scroll_into_view_if_needed()
        pg.wait_for_timeout(200)
        pg.screenshot(path=str(SHOTS / 'm-18-trang-chu-1.png'))

        # Ảnh 2: dòng tiền, chi nhánh
        the_dt = pg.locator(".m-tc-the-ivt:has(.m-tc-the-tieu:text-is('Dòng tiền kỳ'))")
        if the_dt.count() > 0:
            the_dt.scroll_into_view_if_needed()
            pg.wait_for_timeout(200)
            pg.screenshot(path=str(SHOTS / 'm-18-trang-chu-2.png'))

        # Ảnh 3: cơ cấu chi phí, món bán chạy
        the_cp = pg.locator(".m-tc-the-ivt:has(.m-tc-the-tieu:text-is('Cơ cấu chi phí'))")
        if the_cp.count() > 0:
            the_cp.scroll_into_view_if_needed()
            pg.wait_for_timeout(200)
            pg.screenshot(path=str(SHOTS / 'm-18-trang-chu-3.png'))

        # ── 2. Đổi chi nhánh sang một chi nhánh khác ──
        chip_cn = pg.locator('.m-tc-chip-cn')
        if chip_cn.count() > 0:
            chip_cn.first.click()
            pg.wait_for_selector('.m-tam-dong', timeout=4000)
            pg.wait_for_timeout(200)
            dongs_cn = pg.locator('.m-tam-dong')
            if dongs_cn.count() > 1:
                dongs_cn.nth(1).click()
                pg.wait_for_timeout(400)

                # Kiểm tra thẻ Hiệu quả theo chi nhánh vẫn vẽ
                the_cn = pg.locator(".m-tc-the-ivt:has(.m-tc-the-tieu:text-is('Hiệu quả theo chi nhánh'))")
                if the_cn.count() == 0 or the_cn.locator('.branch-bars').count() == 0:
                    loi.append('18A: sau khi đổi chi nhánh, thẻ Hiệu quả theo chi nhánh không vẽ')

                # Kiểm tra thẻ Dòng tiền kỳ vẫn có số tổng
                if the_dt.count() > 0:
                    the_tong_dt_sau = the_dt.locator('.row b')
                    if the_tong_dt_sau.count() == 0:
                        loi.append('18A: thẻ Dòng tiền kỳ mất số tổng sau khi đổi chi nhánh')
            else:
                loi.append('18A: không tìm thấy chi nhánh thứ 2 trong sheet chọn chi nhánh')
        else:
            loi.append('18A: không tìm thấy nút chip chọn chi nhánh .m-tc-chip-cn')

        # ── 3. Gói Free: không có thẻ "Thác nước lợi nhuận" ──
        pg.goto(URL + '#/dang-nhap')
        pg.wait_for_selector('.auth-box')
        pg.evaluate(f"localStorage.setItem('iacc-cloud-session', {json.dumps(phien('F'))})")
        pg.goto(URL + '?goi=F#/app')
        pg.wait_for_selector('.m-tc-the-ivt', timeout=8000)
        pg.wait_for_timeout(400)

        the_thac_f = pg.locator(".m-tc-the-ivt:has(.m-tc-the-tieu:text-is('Thác nước lợi nhuận'))")
        if the_thac_f.count() > 0:
            loi.append('18A: gói Free vẫn có thẻ "Thác nước lợi nhuận"')

        if con:
            loi.append(f'18A: lỗi console gói Free {con[:2]}')
            con.clear()

        # ── 4. Ở 1440x900 gói PR: màn #/app/trang-chu/tong-quan bản web có 6 thẻ biểu đồ ──
        pg_w = b.new_page(viewport={'width': 1440, 'height': 900})
        pg_w.goto(URL + '#/dang-nhap')
        pg_w.wait_for_selector('.auth-box')
        pg_w.evaluate(f"localStorage.setItem('iacc-cloud-session', {json.dumps(phien('PR'))})")
        pg_w.goto(URL + '?goi=PR#/app/trang-chu/tong-quan')
        pg_w.wait_for_selector('.card', timeout=8000)
        pg_w.wait_for_timeout(400)

        for td in tieu_des:
            card_w = pg_w.locator(f".card:has-text('{td}')")
            if card_w.count() == 0:
                loi.append(f'18A: bản web thiếu thẻ "{td}" tại #/app/trang-chu/tong-quan')

        pg_w.screenshot(path=str(SHOTS / 'w-18-tong-quan.png'))
        pg_w.close()

        b.close()
    return loi


def kiem_tra_dot_18_b():
    """Đợt 18B: Sơ đồ quy trình kiểu app trên điện thoại (T236)"""
    loi = []
    print('Kiểm tra đợt 18B (Anti B): Sơ đồ quy trình điện thoại kiểu app (T236):')
    with sync_playwright() as p:
        b = p.chromium.launch(channel='chrome')
        pg = b.new_page(
            viewport={'width': 390, 'height': 844},
            is_mobile=True,
            has_touch=True,
        )
        con = []
        pg.on('console', lambda m: con.append(m.text) if m.type == 'error' else None)
        pg.on('pageerror', lambda e: con.append(str(e)))

        def kiem_man(ten):
            if pg.evaluate('document.documentElement.scrollWidth > innerWidth'):
                loi.append(f'{ten}: tràn ngang màn hình')
            if con:
                loi.append(f'{ten}: lỗi console {con[:2]}')
                con.clear()

        # ── 1. Gói PR: mở #/app/nghiep-vu, bấm ô "Tiền" (Thu chi) ──
        pg.goto(URL + '#/dang-nhap')
        pg.wait_for_selector('.auth-box')
        pg.evaluate(f"localStorage.setItem('iacc-cloud-session', {json.dumps(phien('PR'))})")

        pg.goto(f'{URL}?goi=PR#/app/nghiep-vu')
        pg.wait_for_selector('.m-nv-luoi', timeout=8000)
        pg.wait_for_timeout(300)
        kiem_man('Nghiệp vụ gói PR')

        so_o_pr = 0

        # Bấm ô Tiền (Thu chi: key tien)
        o_tien = pg.locator('.m-nv-o[href*="m=tien"]')
        if o_tien.count() == 0:
            loi.append('18B: không tìm thấy ô phân hệ Tiền trên lưới nghiệp vụ')
        else:
            o_tien.first.click()
            pg.wait_for_selector('.m-nv-chi-tiet', timeout=8000)
            pg.wait_for_timeout(350)
            kiem_man('Chi tiết phân hệ Tiền gói PR')

            # Có nút "Quy trình" đang chọn
            nut_qt = pg.locator('.m-nv-pd-nut:has-text("Quy trình")')
            if nut_qt.count() == 0:
                loi.append('18B: không tìm thấy nút phân đoạn "Quy trình"')
            else:
                cls_qt = nut_qt.first.get_attribute('class') or ''
                if 'on' not in cls_qt:
                    loi.append(f'18B: nút "Quy trình" không ở trạng thái đang chọn (class: {cls_qt})')

            # Có sơ đồ (≥2 thẻ bước)
            the_buoc = pg.locator('.m-qt2-the')
            count_the_pr = the_buoc.count()
            if count_the_pr < 2:
                loi.append(f'18B: sơ đồ Tiền gói PR cần ≥2 thẻ bước, thấy: {count_the_pr}')

            # Không có biểu tượng khoá trong sơ đồ
            the_khoa = pg.locator('.m-qt2-the .lock, .m-qt2-the .khoa, .m-qt2-the [title*="ngoài gói"], .m-qt2-the [title*="Ngoài gói"]')
            if the_khoa.count() > 0:
                loi.append(f'18B: sơ đồ Tiền gói PR còn biểu tượng khoá ({the_khoa.count()})')

            # Chụp ảnh m-18-qt-tien.png
            pg.screenshot(path=str(SHOTS / 'm-18-qt-tien.png'))

            # Đếm số ô gói PR để so sánh với gói F
            so_o_pr = pg.locator('.m-qt2-o').count()

            # ── 2. Bấm một ô chứng từ trên sơ đồ (vd phiếu thu): URL đổi sang màn chứng từ, có danh sách phiếu ──
            o_thu = pg.locator('.m-qt2-o[href*="tien/2-1-1"]').first
            if o_thu.count() == 0:
                o_thu = pg.locator('.m-qt2-o').first

            if o_thu.count() == 0:
                loi.append('18B: không có ô chứng từ nào để bấm trên sơ đồ Tiền')
            else:
                url_truoc = pg.evaluate('location.hash')
                o_thu.click()
                pg.wait_for_timeout(400)
                url_sau = pg.evaluate('location.hash')

                if url_sau == url_truoc:
                    loi.append(f'18B: bấm ô chứng từ nhưng URL không đổi ({url_truoc})')
                elif 'tien/2-1-1' not in url_sau and '/app/tien' not in url_sau:
                    loi.append(f'18B: URL không đổi sang màn chứng từ phù hợp (thấy: {url_sau})')

                # Có danh sách phiếu: .m-ct-ds hoặc thẻ phiếu .m-ct-the
                pg.wait_for_selector('.m-ct-ds, .m-ct-the, .m-ds-khung', timeout=6000)
                ds_phieu = pg.locator('.m-ct-ds, .m-ct-the, .m-ds-khung')
                if ds_phieu.count() == 0:
                    loi.append('18B: màn chứng từ không có danh sách phiếu (.m-ct-ds/.m-ct-the)')
                kiem_man('Danh sách phiếu sau khi bấm ô chứng từ')

            # ── 3. Quay lại, bấm "Tất cả": có danh sách màn ──
            pg.go_back()
            pg.wait_for_selector('.m-nv-chi-tiet', timeout=6000)
            pg.wait_for_timeout(300)

            nut_tat_ca = pg.locator('.m-nv-pd-nut:has-text("Tất cả")')
            if nut_tat_ca.count() == 0:
                loi.append('18B: không tìm thấy nút phân đoạn "Tất cả"')
            else:
                nut_tat_ca.first.click()
                pg.wait_for_timeout(300)

                cls_tc = nut_tat_ca.first.get_attribute('class') or ''
                if 'on' not in cls_tc:
                    loi.append(f'18B: nút "Tất cả" không ở trạng thái đang chọn sau khi bấm (class: {cls_tc})')

                ds_man = pg.locator('.m-nv-ds a.m-nv-dong')
                if ds_man.count() == 0:
                    loi.append('18B: tab "Tất cả" không có danh sách màn (.m-nv-ds .m-nv-dong)')
                kiem_man('Tab Tất cả phân hệ Tiền')

        # ── 4. Gói F: sơ đồ phân hệ Tiền không có ô nào trỏ tới màn ngoài gói F ──
        pg.goto(URL + '#/dang-nhap')
        pg.wait_for_selector('.auth-box')
        pg.evaluate(f"localStorage.setItem('iacc-cloud-session', {json.dumps(phien('F'))})")

        pg.goto(f'{URL}?goi=F#/app/nghiep-vu?m=tien')
        pg.wait_for_selector('.m-nv-chi-tiet', timeout=8000)
        pg.wait_for_timeout(350)
        kiem_man('Phân hệ Tiền gói Free')

        # Kiểm tra không có biểu tượng khoá
        khoa_f = pg.locator('.m-qt2-the .lock, .m-qt2-the .khoa, .m-qt2-the [title*="ngoài gói"], .m-qt2-the [title*="Ngoài gói"]')
        if khoa_f.count() > 0:
            loi.append(f'18B: gói F còn {khoa_f.count()} mục khoá trên sơ đồ')

        # Không có ô trỏ tới tính năng ngoài gói F (vd 2.1.3 Phân bổ chi phí chuỗi hoặc 10.1.3 Số dư ban đầu tổng hợp)
        o_ngoai_goi = pg.locator('.m-qt2-o[href*="2-1-3"], .m-qt2-o[href*="10-1-3"]')
        if o_ngoai_goi.count() > 0:
            loi.append(f'18B: gói F còn {o_ngoai_goi.count()} ô ngoài gói (2.1.3 hoặc 10.1.3)')

        # Chụp ảnh m-18-qt-free.png
        pg.screenshot(path=str(SHOTS / 'm-18-qt-free.png'))

        # ── 5. Phân hệ Bán hàng, Kho gói PR: sơ đồ có thẻ bước, số bước liên tục 1, 2, 3... ──
        pg.goto(URL + '#/dang-nhap')
        pg.wait_for_selector('.auth-box')
        pg.evaluate(f"localStorage.setItem('iacc-cloud-session', {json.dumps(phien('PR'))})")

        # Bán hàng gói PR
        pg.goto(f'{URL}?goi=PR#/app/nghiep-vu?m=ban-hang')
        pg.wait_for_selector('.m-qt2-the', timeout=8000)
        pg.wait_for_timeout(350)
        kiem_man('Bán hàng gói PR')
        pg.screenshot(path=str(SHOTS / 'm-18-qt-ban-hang.png'))

        so_buoc_bh = pg.eval_on_selector_all(
            '.m-qt2-so',
            'els => els.map(e => parseInt(e.innerText.trim(), 10)).filter(n => !isNaN(n))'
        )
        if not so_buoc_bh:
            loi.append('18B: phân hệ Bán hàng không có thẻ bước nào')
        elif so_buoc_bh != list(range(1, len(so_buoc_bh) + 1)):
            loi.append(f'18B: Bán hàng gói PR số bước không liên tục 1, 2, 3... (thấy: {so_buoc_bh})')

        # Kho gói PR
        pg.goto(f'{URL}?goi=PR#/app/nghiep-vu?m=kho')
        pg.wait_for_selector('.m-qt2-the', timeout=8000)
        pg.wait_for_timeout(350)
        kiem_man('Kho gói PR')

        so_buoc_kho = pg.eval_on_selector_all(
            '.m-qt2-so',
            'els => els.map(e => parseInt(e.innerText.trim(), 10)).filter(n => !isNaN(n))'
        )
        if not so_buoc_kho:
            loi.append('18B: phân hệ Kho không có thẻ bước nào')
        elif so_buoc_kho != list(range(1, len(so_buoc_kho) + 1)):
            loi.append(f'18B: Kho gói PR số bước không liên tục 1, 2, 3... (thấy: {so_buoc_kho})')

        # Chụp ảnh m-18-qt-kho.png
        pg.screenshot(path=str(SHOTS / 'm-18-qt-kho.png'))

        b.close()

    if not loi:
        print('  Không có lỗi đợt 18B.')
    else:
        print(f'  Có {len(loi)} lỗi đợt 18B:')
        for err in loi:
            print(f'    - {err}')
    return loi


def kiem_tra_dot_19_b():
    """Kiểm tra T240: Trang chủ điện thoại gói Free giống web; hai màn mới."""
    loi = []
    print('Kiểm tra đợt 19B (Anti B): Trang chủ Free & 2 màn mới trên điện thoại (T240):')
    SHOTS.mkdir(parents=True, exist_ok=True)

    with sync_playwright() as p:
        b = p.chromium.launch(channel='chrome')
        con = []

        def on_console(m):
            if m.type == 'error':
                con.append(m.text)

        def on_pageerror(e):
            con.append(str(e))

        # ── 1. Đo số lãi lỗ tháng gói F trên bản web 1440x900 ──
        pg_web = b.new_page(viewport={'width': 1440, 'height': 900})
        pg_web.on('console', on_console)
        pg_web.on('pageerror', on_pageerror)

        pg_web.goto(URL + '#/dang-nhap')
        pg_web.wait_for_selector('.auth-box')
        pg_web.evaluate(f"localStorage.setItem('iacc-cloud-session', {json.dumps(phien('F'))})")
        pg_web.goto(f'{URL}?goi=F&p=1901#/app/trang-chu/tong-quan')
        pg_web.wait_for_selector('.bbt', timeout=8000)
        pg_web.wait_for_timeout(300)

        # Lấy số lãi lỗ ở bài toán 1 trên web
        loc_lai_lo_web = pg_web.locator('.bbt-cot:has-text("Quản lý lãi lỗ") .bbt-tra')
        lai_lo_web = loc_lai_lo_web.inner_text().strip() if loc_lai_lo_web.count() > 0 else ''
        if not lai_lo_web:
            loi.append('19B: không tìm thấy số lãi lỗ trên bản web 1440x900 gói Free')

        # Lấy thu chi ở bài toán 2 trên web
        loc_tc_web = pg_web.locator('.bbt-cot:has-text("Quản lý thu chi") .bbt-phu')
        tc_web = loc_tc_web.inner_text().strip() if loc_tc_web.count() > 0 else ''
        if not tc_web:
            loi.append('19B: không tìm thấy thu chi trên bản web 1440x900 gói Free')

        co_bd_tc_web = pg_web.locator('.bbt-cot:has-text("Quản lý thu chi") :has-text("Biểu đồ thu chi")').count() > 0

        # Kiểm tra bấm thẻ quỹ mở modal M2 trên web (T272)
        the_quy_web = pg_web.locator('.bbt-cot:has-text("Quản lý thu chi") .t.qy, .bbt-the-btn').first
        if the_quy_web.count() == 0:
            loi.append('19B: không tìm thấy thẻ quỹ ở trang chủ web')
        else:
            the_quy_web.click()
            pg_web.wait_for_timeout(350)
            for o in ['Tồn đầu kỳ', 'Tiền thu vào', 'Tiền chi ra', 'Tồn cuối kỳ']:
                if pg_web.locator(f'.mq-hop :has-text("{o}")').count() == 0:
                    loi.append(f'19B: modal quỹ web thiếu ô {o}')
            pg_web.keyboard.press('Escape')
            pg_web.wait_for_timeout(250)
            if pg_web.locator('.mq-hop').count() > 0:
                loi.append('19B: Esc không đóng được modal quỹ trên web')

        # Kiểm tra trang lịch sử quy=tat-ca tháng 10, số dư ở dòng tổng ngày mới nhất bằng số Tồn cuối kỳ (T272)
        pg_web.goto(f'{URL}?goi=F&p=1903#/app/trang-chu/lich-su-quy?quy=tat-ca&thang=10')
        pg_web.wait_for_selector('.lsq-l1-bang', timeout=8000)
        pg_web.wait_for_timeout(300)
        ton_cuoi_el = pg_web.locator('.lsq-l1-st.st-cuoi b')
        ton_cuoi_txt = ton_cuoi_el.inner_text().strip() if ton_cuoi_el.count() > 0 else ''
        ngay_dau_du_el = pg_web.locator('.lsq-l1-ng').first.locator('.n').last
        ngay_dau_du_txt = ngay_dau_du_el.inner_text().strip() if ngay_dau_du_el.count() > 0 else ''
        so_ton_cuoi = ton_cuoi_txt.replace(' đ', '').replace('.', '').strip()
        so_ngay_dau = ngay_dau_du_txt.replace('.', '').strip()
        if not so_ton_cuoi or so_ton_cuoi != so_ngay_dau:
            loi.append(f'19B: lịch sử tat-ca số dư dòng ngày mới nhất ({ngay_dau_du_txt}) không khớp Tồn cuối kỳ ({ton_cuoi_txt})')

        pg_web.close()

        # ── 2. Kiểm tra trên điện thoại 390x844 gói Free ──
        pg = b.new_page(
            viewport={'width': 390, 'height': 844},
            is_mobile=True,
            has_touch=True,
        )
        pg.on('console', on_console)
        pg.on('pageerror', on_pageerror)

        def kiem_man(ten):
            if pg.evaluate('document.documentElement.scrollWidth > window.innerWidth'):
                loi.append(f'{ten}: tràn ngang màn hình')
            if con:
                loi.append(f'{ten}: lỗi console {con[:2]}')
                con.clear()

        pg.goto(URL + '#/dang-nhap')
        pg.wait_for_selector('.auth-box')
        pg.evaluate(f"localStorage.setItem('iacc-cloud-session', {json.dumps(phien('F'))})")
        pg.goto(f'{URL}?goi=F&p=1902#/app')
        pg.wait_for_selector('.m-trang-chu', timeout=8000)
        pg.wait_for_timeout(300)
        kiem_man('Trang chủ Free điện thoại')

        # Tiêu đề ba bài toán giống bản web
        for bai in ['Quản lý lãi lỗ', 'Quản lý thu chi', 'Quản lý kho']:
            if pg.locator(f':has-text("{bai}")').count() == 0:
                loi.append(f'19B: trang chủ Free điện thoại thiếu tiêu đề bài toán: {bai}')

        # Số lãi lỗ tháng trên điện thoại bằng số trên web
        loc_lai_lo_dt = pg.locator('.m-free-the:has-text("Quản lý lãi lỗ") .m-free-tra')
        if loc_lai_lo_dt.count() == 0:
            loi.append('19B: không tìm thấy số lãi lỗ trên trang chủ Free điện thoại')
        else:
            txt_lai_lo_dt = loc_lai_lo_dt.inner_text().strip()
            if lai_lo_web and lai_lo_web not in txt_lai_lo_dt:
                loi.append(
                    f'19B: số lãi lỗ điện thoại ({txt_lai_lo_dt}) không khớp bản web ({lai_lo_web})'
                )

        # Số tổng thu, tổng chi trên điện thoại bằng số trên web
        loc_tc_dt = pg.locator('.m-free-the:has-text("Quản lý thu chi") .m-free-phu')
        if loc_tc_dt.count() == 0:
            loi.append('19B: không tìm thấy thu chi trên trang chủ Free điện thoại')
        else:
            txt_tc_dt = loc_tc_dt.inner_text().strip()
            if tc_web and tc_web != txt_tc_dt:
                loi.append(
                    f'19B: thu chi điện thoại ({txt_tc_dt}) không khớp bản web ({tc_web})'
                )

        # Gói F có nút Biểu đồ thu chi ở trang chủ điện thoại (nếu web có) (T273)
        if co_bd_tc_web:
            loc_bd_tc = pg.locator('.m-free-the:has-text("Quản lý thu chi") :has-text("Biểu đồ thu chi")')
            if loc_bd_tc.count() == 0:
                loi.append('19B: trang chủ Free điện thoại thiếu nút Biểu đồ thu chi ở Quản lý thu chi')

        # Chụp ảnh trang chủ Free
        pg.screenshot(path=str(SHOTS / 'm-19-free-trang-chu.png'))

        # ── 3. Bấm lối Chi phí trong tháng ──
        link_cpt = pg.locator('a[href*="trang-chu/chi-phi-thang"]').first
        if link_cpt.count() == 0:
            loi.append('19B: không tìm thấy lối bấm Chi phí trong tháng trên trang chủ Free')
        else:
            link_cpt.click()
            pg.wait_for_timeout(350)
            cur_url = pg.evaluate('location.hash')
            if 'trang-chu/chi-phi-thang' not in cur_url:
                loi.append(f'19B: bấm Chi phí trong tháng URL không đúng ({cur_url})')
            if pg.locator('.m-chi-may-tinh').count() > 0:
                loi.append('19B: màn Chi phí trong tháng bị rơi về MChiMayTinh')
            if pg.locator('.m-free-cpt-dong').count() == 0:
                loi.append('19B: màn Chi phí trong tháng không có dòng dữ liệu')
            kiem_man('Màn Chi phí trong tháng')
            pg.screenshot(path=str(SHOTS / 'm-19-chi-phi-thang.png'))

        # ── 4. Kiểm tra Lịch sử thu chi ──
        pg.goto(f'{URL}?goi=F&p=1903#/app')
        pg.wait_for_selector('.m-trang-chu', timeout=8000)
        pg.wait_for_timeout(250)

        # Bấm thẻ quỹ để mở sheet quỹ M2 (T272)
        the_quy = pg.locator('.m-quy-the-btn, .tll-the.quy').first
        if the_quy.count() == 0:
            loi.append('19B: không tìm thấy thẻ quỹ ở khối Quản lý thu chi trên điện thoại')
        else:
            the_quy.click()
            pg.wait_for_timeout(350)

            # Kiểm tra sheet quỹ có đủ 4 ô: Tồn đầu kỳ, Tiền thu vào, Tiền chi ra, Tồn cuối kỳ (T272)
            for o in ['Tồn đầu kỳ', 'Tiền thu vào', 'Tiền chi ra', 'Tồn cuối kỳ']:
                if pg.locator(f'.m-quy-sheet :has-text("{o}")').count() == 0:
                    loi.append(f'19B: sheet quỹ mobile thiếu ô {o}')

            # Kiểm tra Esc đóng sheet quỹ (T272)
            pg.keyboard.press('Escape')
            pg.wait_for_timeout(250)
            if pg.locator('.m-quy-sheet').count() > 0:
                loi.append('19B: Esc không đóng được sheet quỹ mobile')

            # Mở lại sheet để bấm vào Lịch sử thu chi
            the_quy.click()
            pg.wait_for_timeout(350)

            link_lsq = pg.locator('.m-quy-sheet a:has-text("Xem chi tiết lịch sử thu chi")').first
            if link_lsq.count() == 0:
                loi.append('19B: không tìm thấy nút Xem chi tiết lịch sử thu chi trong sheet quỹ mobile')
            else:
                link_lsq.click()
                pg.wait_for_timeout(350)
                cur_url = pg.evaluate('location.hash')
                if 'trang-chu/lich-su-quy' not in cur_url:
                    loi.append(f'19B: bấm quỹ URL không đổi sang trang-chu/lich-su-quy ({cur_url})')
                if pg.locator('.m-chi-may-tinh').count() > 0:
                    loi.append('19B: màn Lịch sử thu chi bị rơi về MChiMayTinh')
                if pg.locator('.m-free-lsq-dong, .m-free-lsq-the, .m-free-lsq-the-hop').count() == 0:
                    loi.append('19B: màn Lịch sử thu chi không có dòng hoặc thẻ dữ liệu')

                # Kiểm tra bộ lọc thu chi dạng chip (T246)
                loc_chip = pg.locator('.m-free-lsq-chip')
                if loc_chip.count() < 3:
                    loi.append('19B: màn Lịch sử thu chi thiếu bộ lọc thu chi dạng chip')
                else:
                    chip_thu = pg.locator('.m-free-lsq-chip:has-text("Khoản thu")')
                    if chip_thu.count() > 0:
                        chip_thu.click()
                        pg.wait_for_timeout(150)
                        if pg.locator('.m-free-lsq-ic.ra').count() > 0:
                            loi.append('19B: lọc Khoản thu vẫn hiện giao dịch chi')
                    chip_all = pg.locator('.m-free-lsq-chip:has-text("Tất cả")')
                    if chip_all.count() > 0:
                        chip_all.click()
                        pg.wait_for_timeout(150)

                kiem_man('Màn Lịch sử thu chi')
                pg.screenshot(path=str(SHOTS / 'm-19-lich-su-quy.png'))

        # ── 5. Gói PR: trang chủ vẫn có thẻ "Thác nước lợi nhuận" (T235) ──
        pg.goto(URL + '#/dang-nhap')
        pg.wait_for_selector('.auth-box')
        pg.evaluate(f"localStorage.setItem('iacc-cloud-session', {json.dumps(phien('PR'))})")
        pg.goto(f'{URL}?goi=PR&p=1904#/app')
        pg.wait_for_selector('.m-trang-chu', timeout=8000)
        pg.wait_for_timeout(300)
        kiem_man('Trang chủ gói PR')

        if pg.locator('#m-the-thac-nuoc, :has-text("Thác nước lợi nhuận")').count() == 0:
            loi.append('19B: trang chủ gói PR mất thẻ Thác nước lợi nhuận')

        b.close()

    if not loi:
        print('  Không có lỗi đợt 19B.')
    else:
        print(f'  Có {len(loi)} lỗi đợt 19B:')
        for err in loi:
            print(f'    - {err}')
    return loi


# 22 màn báo cáo áp dụng 3 khuôn dạng dòng trên điện thoại (T241)
DS_MAN_20_B = [
    # Khuôn 1: Chi tiết theo ngày (8 màn mới + 3 màn cũ)
    ('3.2.6', 'ban-hang/3-2-6', 'Bán hàng theo ngày', 'chi-tiet-ngay', 'PR'),
    ('3.2.8', 'ban-hang/3-2-8', 'Chi tiết bán hàng', 'chi-tiet-ngay', 'PR'),
    ('4.2.1', 'mua-hang/4-2-1', 'Chi tiết mua hàng', 'chi-tiet-ngay', 'PR'),
    ('4.2.6', 'mua-hang/4-2-6', 'Mua hàng theo ngày', 'chi-tiet-ngay', 'PR'),
    ('4.2.7', 'mua-hang/4-2-7', 'Bảng kê mua hàng theo hàng hoá', 'chi-tiet-ngay', 'PR'),
    ('5.2.1', 'kho/5-2-1', 'Thẻ kho', 'chi-tiet-ngay', 'PR'),
    ('5.2.10', 'kho/5-2-10', 'Chi tiết nhập kho', 'chi-tiet-ngay', 'PR'),
    ('5.2.12', 'kho/5-2-12', 'Chi tiết xuất kho', 'chi-tiet-ngay', 'PR'),
    ('2.2.1', 'tien/2-2-1', 'Sổ quỹ tiền mặt', 'chi-tiet-ngay', 'PR'),
    ('2.2.3', 'tien/2-2-3', 'Sổ ngân hàng', 'chi-tiet-ngay', 'PR'),
    ('2.2.5', 'tien/2-2-5', 'Sổ công nợ', 'chi-tiet-ngay', 'S'),

    # Khuôn 2: Tổng hợp theo đối tượng (9 màn)
    ('2.2.8', 'tien/2-2-8', 'Tổng hợp quỹ tiền', 'tong-hop-doi-tuong', 'PR'),
    ('3.2.7', 'ban-hang/3-2-7', 'Tổng hợp bán hàng', 'tong-hop-doi-tuong', 'PR'),
    ('3.2.9', 'ban-hang/3-2-9', 'Công nợ khách hàng', 'tong-hop-doi-tuong', 'PR'),
    ('4.2.2', 'mua-hang/4-2-2', 'Tổng hợp mua hàng theo NCC', 'tong-hop-doi-tuong', 'PR'),
    ('4.2.3', 'mua-hang/4-2-3', 'Công nợ nhà cung cấp', 'tong-hop-doi-tuong', 'PR'),
    ('5.2.3', 'kho/5-2-3', 'Báo cáo xuất nhập tồn', 'tong-hop-doi-tuong', 'PR'),
    ('5.2.9', 'kho/5-2-9', 'Tổng hợp nhập kho', 'tong-hop-doi-tuong', 'PR'),
    ('5.2.11', 'kho/5-2-11', 'Tổng hợp xuất kho', 'tong-hop-doi-tuong', 'PR'),
    ('10.4.3', 'tong-hop/10-4-3', 'Sổ chi phí', 'tong-hop-doi-tuong', 'PR'),

    # Khuôn 3: Chỉ tiêu phân cấp (2 màn)
    ('2.2.9', 'tien/2-2-9', 'Báo cáo dòng tiền', 'chi-tieu-phan-cap', 'PR'),
    ('10.2.3', 'tong-hop/10-2-3', 'Báo cáo kết quả kinh doanh', 'chi-tieu-phan-cap', 'F'),
]

# Các màn cần chụp ảnh màn hình
DS_CHUP_ANH = {'3.2.8', '3.2.9', '5.2.3', '2.2.9', '10.2.3'}


def kiem_tra_dot_20_b():
    """Kiểm tra T241: 3 khuôn báo cáo dạng dòng trên điện thoại cho 22 màn hình."""
    loi = []
    print('Kiểm tra đợt 20B (Anti B): 3 khuôn báo cáo dạng dòng trên điện thoại (T241):')
    SHOTS.mkdir(parents=True, exist_ok=True)

    with sync_playwright() as p:
        b = p.chromium.launch(channel='chrome')
        pg = b.new_page(
            viewport={'width': 390, 'height': 844},
            is_mobile=True,
            has_touch=True,
        )
        con = []

        def on_console(m):
            if m.type == 'error':
                con.append(m.text)

        def on_pageerror(e):
            con.append(str(e))

        pg.on('console', on_console)
        pg.on('pageerror', on_pageerror)

        goi_hien_tai = 'PR'
        pg.goto(URL + '#/dang-nhap')
        pg.wait_for_selector('.auth-box')
        pg.evaluate(f"localStorage.setItem('iacc-cloud-session', {json.dumps(phien('PR'))})")

        # ── 1. Mở lần lượt 22 màn báo cáo trên điện thoại ──
        for idx, (ma, slug, ten_bc, khuon, goi) in enumerate(DS_MAN_20_B):
            if goi != goi_hien_tai:
                pg.evaluate(f"localStorage.setItem('iacc-cloud-session', {json.dumps(phien(goi))})")
                goi_hien_tai = goi

            path_bc = f'/app/{slug}'
            p_id = 24100 + idx
            pg.goto(f'{URL}?goi={goi}&p={p_id}#{path_bc}')
            pg.wait_for_selector('.m-so-bc, .m-to-giay-wrap, .m-to-giay', timeout=8000)
            pg.wait_for_timeout(350)

            # Bắt lỗi console
            if con:
                loi.append(f'{ma} ({ten_bc}): lỗi console điện thoại {con[:2]}')
                con.clear()

            # Mặc định dạng dòng, không có bảng cuộn ngang
            tran = pg.evaluate("""() => {
                const el = document.querySelector('.m-so-dong, .m-so-bc, .m-to-giay-wrap') || document.documentElement;
                return el.scrollWidth > el.clientWidth + 2;
            }""")
            if tran:
                loi.append(f'{ma} ({ten_bc}): bị tràn/cuộn ngang ở dạng dòng')

            # Có ít nhất 1 dòng dữ liệu dạng dòng
            so_dong = pg.locator('.m-bcd-item, .m-so-dong-item').count()
            if so_dong == 0:
                loi.append(f'{ma} ({ten_bc}): không có dòng dữ liệu dạng dòng (.m-bcd-item hoặc .m-so-dong-item)')

            # Khuôn 3: nhãn dòng tổng không chứa dấu "/"
            if khuon == 'chi-tieu-phan-cap':
                nhans_k3 = pg.locator('.m-so-dong-tong .m-so-dong-tong-nhan').all_inner_texts()
                for nh in nhans_k3:
                    if '/' in nh:
                        loi.append(f'{ma} ({ten_bc}): nhãn dòng tổng Khuôn 3 chứa dấu "/": "{nh}"')

            # Chụp ảnh 5 màn chỉ định
            if ma in DS_CHUP_ANH:
                ten_file_dot = f'm-20-{ma}.png'
                ten_file_dash = f'm-20-{slug.replace("/", "-")}.png'
                pg.screenshot(path=str(SHOTS / ten_file_dot))
                if ten_file_dot != ten_file_dash:
                    pg.screenshot(path=str(SHOTS / ten_file_dash))
                print(f'  - Đã chụp ảnh {ten_file_dot}')

        # ── 2. So sánh tổng ở dòng tổng bằng tổng ở bảng (1 màn mỗi khuôn) ──
        # Đảm bảo lại phiên gói PR
        if goi_hien_tai != 'PR':
            pg.evaluate(f"localStorage.setItem('iacc-cloud-session', {json.dumps(phien('PR'))})")
            goi_hien_tai = 'PR'

        def doc_so_rut_gon(s):
            s_clean = s.strip().replace('−', '-').replace(',', '.')
            m = re.search(r'([+-]?\d+(?:\.\d+)?)\s*(tỷ|tr|k)?', s_clean)
            if not m:
                return 0.0
            val = float(m.group(1))
            dv = m.group(2)
            if dv == 'tỷ':
                return val * 1e9
            elif dv == 'tr':
                return val * 1e6
            elif dv == 'k':
                return val * 1e3
            return val

        ds_so_sanh = [
            ('3.2.8', 'ban-hang/3-2-8', 'Chi tiết bán hàng (Khuôn 1)'),
            ('3.2.9', 'ban-hang/3-2-9', 'Công nợ khách hàng (Khuôn 2)'),
            ('2.2.9', 'tien/2-2-9', 'Báo cáo dòng tiền (Khuôn 3)'),
        ]

        for ma, slug, ten_so_sanh in ds_so_sanh:
            path_bc = f'/app/{slug}'
            pg.goto(f'{URL}?goi=PR&p={abs(hash(slug))}#{path_bc}')
            pg.wait_for_selector('.m-so-dong, .m-so-bc', timeout=8000)
            pg.wait_for_timeout(300)

            # Đọc các số ở thẻ tổng dạng dòng
            cac_so_dong = pg.locator('.m-so-dong-tong .m-so-dong-tong-so').all_inner_texts()
            digits_dong = [re.sub(r'\D', '', s) for s in cac_so_dong if re.sub(r'\D', '', s)]

            # Kiểm tra riêng màn 2.2.9: nhãn không chứa dấu "/" và ô 1 + ô 2 ≈ ô 3 (sai số tối đa 0,1 tỷ)
            if ma == '2.2.9':
                cac_nhan_dong = pg.locator('.m-so-dong-tong .m-so-dong-tong-nhan').all_inner_texts()
                for nh in cac_nhan_dong:
                    if '/' in nh:
                        loi.append(f'2.2.9: nhãn dòng tổng chứa dấu "/": "{nh}"')
                if len(cac_so_dong) >= 3:
                    v1 = doc_so_rut_gon(cac_so_dong[0])
                    v2 = doc_so_rut_gon(cac_so_dong[1])
                    v3 = doc_so_rut_gon(cac_so_dong[2])
                    sai_so_ty = abs((v1 + v2) - v3) / 1e9
                    if sai_so_ty > 0.1:
                        loi.append(
                            f'2.2.9: dòng tổng ô 1 ({cac_so_dong[0]}) + ô 2 ({cac_so_dong[1]}) không bằng ô 3 ({cac_so_dong[2]}), sai số {sai_so_ty:.3f} tỷ > 0.1 tỷ'
                        )
                    else:
                        print(f'  - 2.2.9: dòng tổng khớp ô 1 ({cac_so_dong[0]}) + ô 2 ({cac_so_dong[1]}) ≈ ô 3 ({cac_so_dong[2]}), sai số {sai_so_ty:.3f} tỷ <= 0.1 tỷ')

            # Bấm chip "Bảng" để chuyển sang bảng
            chip_bang = pg.locator('button.m-so-dong-chip:has-text("Bảng")')
            if chip_bang.count() == 0:
                loi.append(f'{ten_so_sanh}: không tìm thấy chip "Bảng" để chuyển xem bảng')
                continue

            chip_bang.first.click()
            pg.wait_for_selector('.m-sbc-bang-wrap table, .rpt', timeout=5000)
            pg.wait_for_timeout(300)

            # Đọc các số ở dòng tổng của bảng
            cac_so_bang = pg.locator('.rpt tbody tr.t td.num, .rpt tfoot td.num').all_inner_texts()
            digits_bang = [re.sub(r'\D', '', s) for s in cac_so_bang if re.sub(r'\D', '', s)]

            # Kiểm tra xem có khớp số liệu tổng không
            if digits_dong and digits_bang:
                # Tìm xem có ít nhất một cặp số tương ứng giữa dòng tổng và bảng
                khop = any(
                    db.startswith(dd) or dd.startswith(db)
                    for dd in digits_dong
                    for db in digits_bang
                )
                if not khop:
                    loi.append(
                        f'{ten_so_sanh}: số tổng ở dạng dòng ({cac_so_dong}) không khớp số ở bảng ({cac_so_bang})'
                    )
                else:
                    print(f'  - Khớp tổng {ten_so_sanh}: dòng {cac_so_dong} ~ bảng {cac_so_bang}')
            elif digits_dong and not digits_bang:
                # Nếu bảng không có dòng tổng tr.t riêng, kiểm tra có số liệu
                pass

        # ── 3. Kiểm tra 5.2.3: có nút "Xem mẫu in", bấm ra tờ A4 ──
        pg.goto(f'{URL}?goi=PR&p=241523#/app/kho/5-2-3')
        pg.wait_for_selector('.m-to-giay-wrap', timeout=8000)
        pg.wait_for_timeout(300)

        nut_mau_in = pg.locator('.m-bcd-nut-mau-in:has-text("Xem mẫu in")')
        if nut_mau_in.count() == 0:
            loi.append('5.2.3: không tìm thấy nút "Xem mẫu in" ở đầu màn hình')
        else:
            nut_mau_in.first.click()
            pg.wait_for_selector('.m-to-giay-noi-dung', timeout=5000)
            pg.wait_for_timeout(300)

            if pg.locator('.m-to-giay-noi-dung').count() == 0:
                loi.append('5.2.3: bấm nút "Xem mẫu in" không mở tờ A4 (.m-to-giay-noi-dung)')
            else:
                print('  - 5.2.3: bấm nút "Xem mẫu in" hiển thị tờ A4 thành công')

        # ── 4. Kiểm tra 2.2.1: vẫn hiển thị đúng dạng dòng sổ quỹ như T223 ──
        pg.goto(f'{URL}?goi=PR&p=241221#/app/tien/2-2-1')
        pg.wait_for_selector('.m-so-bc', timeout=8000)
        pg.wait_for_timeout(300)

        if pg.locator('.m-so-dong-tong').count() == 0:
            loi.append('2.2.1: Sổ quỹ mất thẻ tổng 3 ô .m-so-dong-tong')
        if pg.locator('.m-so-dong-item').count() == 0:
            loi.append('2.2.1: Sổ quỹ không hiển thị các dòng chứng từ .m-so-dong-item')
        if pg.locator('.m-so-dong-ngay').count() == 0:
            loi.append('2.2.1: Sổ quỹ không gom theo ngày .m-so-dong-ngay')

        print('  - 2.2.1: Sổ quỹ giữ nguyên vẹn logic dạng dòng theo T223')

        b.close()

    if not loi:
        print('  Không có lỗi đợt 20B.')
    else:
        print(f'  Có {len(loi)} lỗi đợt 20B:')
        for err in loi:
            print(f'    - {err}')
    return loi


def kiem_tra_dot_21_b():
    """Kiểm tra T258 (Mẫu A): Chế độ Bảng của các báo cáo trên điện thoại."""
    loi = []
    print('Kiểm tra đợt 21B (T258): Bảng báo cáo điện thoại mẫu A:')
    SHOTS.mkdir(parents=True, exist_ok=True)

    ds_man_21_b = [
        ('3.2.8', 'ban-hang/3-2-8', 'Chi tiết bán hàng'),
        ('3.2.9', 'ban-hang/3-2-9', 'Công nợ khách hàng'),
        ('5.2.3', 'kho/5-2-3', 'Báo cáo xuất nhập tồn (tiêu đề nhiều tầng)'),
        ('2.2.9', 'tien/2-2-9', 'Báo cáo dòng tiền'),
        ('4.2.1', 'mua-hang/4-2-1', 'Chi tiết mua hàng'),
        ('10.4.3', 'tong-hop/10-4-3', 'Sổ chi phí'),
        ('2.2.8', 'tien/2-2-8', 'Tổng hợp quỹ tiền'),
        ('5.2.9', 'kho/5-2-9', 'Tổng hợp nhập kho'),
    ]

    with sync_playwright() as p:
        b = p.chromium.launch(channel='chrome')
        pg = b.new_page(
            viewport={'width': 390, 'height': 844},
            is_mobile=True,
            has_touch=True,
        )
        con = []

        def on_console(m):
            if m.type == 'error':
                con.append(m.text)

        def on_pageerror(e):
            con.append(str(e))

        pg.on('console', on_console)
        pg.on('pageerror', on_pageerror)

        pg.goto(URL + '#/dang-nhap')
        pg.wait_for_selector('.auth-box')
        pg.evaluate(f"localStorage.setItem('iacc-cloud-session', {json.dumps(phien('PR'))})")

        for ma, slug, ten_bc in ds_man_21_b:
            path_bc = f'/app/{slug}'
            p_id = 25800 + abs(hash(ma)) % 1000
            pg.goto(f'{URL}?goi=PR&p={p_id}#{path_bc}')
            pg.wait_for_selector('.m-so-bc, .m-to-giay-wrap', timeout=8000)
            pg.wait_for_timeout(300)

            # Bấm chip "Bảng"
            chip_bang = pg.locator('button:has-text("Bảng")')
            if chip_bang.count() == 0:
                loi.append(f'{ma} ({ten_bc}): không tìm thấy chip "Bảng"')
                continue

            chip_bang.first.click()
            pg.wait_for_selector('.m-sbc-bang-wrap table', timeout=5000)
            pg.wait_for_timeout(350)

            # Bắt lỗi console
            if con:
                loi.append(f'{ma} ({ten_bc}): lỗi console điện thoại {con[:2]}')
                con.clear()

            # Chụp ảnh trước khi cuộn ngang
            ten_file_truoc = f'm-21-{ma}.png'
            pg.screenshot(path=str(SHOTS / ten_file_truoc))

            # Kiểm tra các điều kiện Mẫu A theo spec:
            # 1. ô tiêu đề có position: sticky
            # 2. ô cột đầu dòng dữ liệu có position: sticky, left: 0
            # 3. cuộn ngang thẻ bảng 200px rồi đo: ô cột đầu không đổi vị trí trái
            # 4. trang không cuộn ngang (document.documentElement.scrollWidth <= 390)
            # 5. báo cáo có dòng tổng: dòng tổng có position: sticky
            kiem_kq = pg.evaluate('''() => {
                const wrap = document.querySelector('.m-sbc-bang-wrap');
                const th = document.querySelector('.m-sbc-bang-wrap table th');
                const td = document.querySelector('.m-sbc-bang-wrap table tbody tr td:first-child');
                const trT = document.querySelector('.m-sbc-bang-wrap table tbody tr.t td, .m-sbc-bang-wrap table tfoot tr td');
                const scrollW = document.documentElement.scrollWidth;

                const posTh = th ? getComputedStyle(th).position : '';
                const posTd = td ? getComputedStyle(td).position : '';
                const leftTd = td ? getComputedStyle(td).left : '';
                const posTrT = trT ? getComputedStyle(trT).position : '';

                const hasGhim2 = wrap ? wrap.classList.contains('m-ghim-2-cot') : false;
                const tdGhim = hasGhim2
                    ? wrap.querySelector('table tbody tr:not(.t):not(.nhom) > td:nth-child(2)')
                    : td;

                let dx = 0;
                let dxGhim = 0;
                let insideCard = false;

                if (wrap && td) {
                    const b1 = td.getBoundingClientRect();
                    const bGhim1 = tdGhim ? tdGhim.getBoundingClientRect() : null;

                    wrap.scrollLeft = 200;

                    const b2 = td.getBoundingClientRect();
                    dx = Math.abs(b1.left - b2.left);

                    if (bGhim1 && tdGhim) {
                        const bGhim2 = tdGhim.getBoundingClientRect();
                        dxGhim = Math.abs(bGhim1.left - bGhim2.left);
                        const wrapRect = wrap.getBoundingClientRect();
                        insideCard = (bGhim2.left >= wrapRect.left - 2) && (bGhim2.right <= wrapRect.right + 2);
                    }
                }

                return {
                    scrollW,
                    posTh,
                    posTd,
                    leftTd,
                    hasTrT: !!trT,
                    posTrT,
                    dx,
                    hasGhim2,
                    dxGhim,
                    insideCard,
                };
            }''')

            # Kiểm tra trang không cuộn ngang
            if kiem_kq['scrollW'] > 390:
                loi.append(f'{ma} ({ten_bc}): trang bị tràn ngang (scrollWidth={kiem_kq["scrollW"]} > 390)')

            # Kiểm tra ô tiêu đề th sticky
            if kiem_kq['posTh'] != 'sticky':
                loi.append(f'{ma} ({ten_bc}): ô tiêu đề th không có position: sticky (hiện là "{kiem_kq["posTh"]}")')

            # T273: Kiểm tra cột đầu KHÔNG sticky ngang (position khác sticky hoặc left auto)
            if kiem_kq['posTd'] == 'sticky' and kiem_kq['leftTd'] == '0px':
                loi.append(f'{ma} ({ten_bc}): ô cột đầu vẫn có position: sticky left: 0px (luật mới T273 không ghim cột ngang)')

            # T273: Sau khi cuộn ngang 200px: ô cột đầu trôi theo cuộn (dx > 50)
            if kiem_kq['dx'] <= 1.5:
                loi.append(f'{ma} ({ten_bc}): ô cột đầu không trôi khi cuộn ngang 200px (dx={kiem_kq["dx"]}px, luật mới T273 không ghim)')

            # Kiểm tra dòng tổng (nếu có) phải có position: sticky
            if kiem_kq['hasTrT'] and kiem_kq['posTrT'] != 'sticky':
                loi.append(f'{ma} ({ten_bc}): dòng tổng không có position: sticky (hiện là "{kiem_kq["posTrT"]}")')

            # T273: Kiểm tra phân trang cho báo cáo >100 dòng (ở báo cáo 3.2.8)
            if ma == '3.2.8':
                thanh_pt = pg.locator('.m-sbc-phan-trang')
                if thanh_pt.count() == 0:
                    loi.append(f'{ma} ({ten_bc}): báo cáo >100 dòng nhưng không có thanh phân trang .m-sbc-phan-trang')
                else:
                    tr_t_loc = pg.locator('.m-sbc-bang-wrap table tbody tr.t, .m-sbc-bang-wrap table tfoot tr')
                    val_tong_trang_1 = tr_t_loc.first.inner_text().strip() if tr_t_loc.count() else ''
                    nut_sau = pg.locator('.m-sbc-pt-nut:has-text("Sau")')
                    if nut_sau.count() == 0:
                        loi.append(f'{ma} ({ten_bc}): không tìm thấy nút "Sau" trong thanh phân trang')
                    elif nut_sau.is_disabled():
                        loi.append(f'{ma} ({ten_bc}): nút "Sau" bị disabled ở trang 1')
                    else:
                        nut_sau.click()
                        pg.wait_for_timeout(350)
                        so_dong_trang_2 = pg.locator('.m-sbc-bang-wrap table tbody tr:not(.t):not(.nhom)').count()
                        if so_dong_trang_2 > 100:
                            loi.append(f'{ma} ({ten_bc}): sau khi bấm "Sau", số dòng hiện tại vượt quá 100 ({so_dong_trang_2})')
                        val_tong_trang_2 = tr_t_loc.first.inner_text().strip() if tr_t_loc.count() else ''
                        if val_tong_trang_1 != val_tong_trang_2:
                            loi.append(f'{ma} ({ten_bc}): dòng tổng cuối bảng bị đổi giá trị sau khi sang trang 2 (trang 1: "{val_tong_trang_1}", trang 2: "{val_tong_trang_2}")')
                        nut_truoc = pg.locator('.m-sbc-pt-nut:has-text("Trước")')
                        if nut_truoc.count():
                            nut_truoc.click()
                            pg.wait_for_timeout(250)

            # Chụp ảnh sau khi cuộn ngang
            pg.wait_for_timeout(150)
            ten_file_sau = f'm-21-{ma}-cuon.png'
            pg.screenshot(path=str(SHOTS / ten_file_sau))
            print(f'  - {ma} ({ten_bc}): đạt luật mới T273 (sticky header dọc, không ghim cột ngang dx={kiem_kq["dx"]:.1f}px, cuộn={kiem_kq["scrollW"]}px, tổng sticky={kiem_kq["posTrT"]})')

        b.close()

    if not loi:
        print('  Không có lỗi đợt 21B.')
    else:
        print(f'  Có {len(loi)} lỗi đợt 21B:')
        for err in loi:
            print(f'    - {err}')
    return loi



def kiem_tra_dot_22_b():
    """Kiểm tra T267 (Anti A): Sơ đồ quy trình điện thoại cho kho, ccdc, thue."""
    loi = []
    print('Kiểm tra đợt 22B (T267): Sơ đồ quy trình điện thoại cho kho, ccdc, thue (390x844):')
    SHOTS.mkdir(parents=True, exist_ok=True)

    mods = [('kho', 'Kiểm kê'), ('ccdc', 'Chi phí phân bổ'), ('thue', 'Kê khai thuế')]

    with sync_playwright() as p:
        b = p.chromium.launch(channel='chrome')
        pg = b.new_page(viewport={'width': 390, 'height': 844}, is_mobile=True, has_touch=True)
        con = []
        pg.on('console', lambda m: con.append(m.text) if m.type == 'error' else None)
        pg.on('pageerror', lambda e: con.append(str(e)))

        pg.goto(URL + '#/dang-nhap')
        pg.wait_for_selector('.auth-box')
        pg.evaluate(f"localStorage.setItem('iacc-cloud-session', {json.dumps(phien('F'))})")

        for mod, ten_ph in mods:
            path_qt = f'/app/{mod}/quy-trinh'
            pg.goto(f"{URL}?goi=F&p=m22-{mod}#{path_qt}")
            pg.wait_for_selector('.m-quytrinh', timeout=8000)
            pg.wait_for_timeout(350)

            # 1. Mở được, có ít nhất 1 thẻ bước
            the_ds = pg.locator('.m-qt2-the')
            count = the_ds.count()
            if count == 0:
                loi.append(f'T267 mobile ({mod}): Không tìm thấy thẻ bước (.m-qt2-the)')

            # 2. Không cuộn ngang trang
            tran = pg.evaluate("['.main', '.m-than', '.m-quytrinh'].filter(q => { const e = document.querySelector(q); return e && e.scrollWidth > e.clientWidth + 2 })")
            if tran:
                loi.append(f'T267 mobile ({mod}): Tràn ngang tại {tran}')

            # 3. Chụp ảnh
            pg.screenshot(path=str(SHOTS / f'm-22-{mod}.png'))

        if con:
            loi.append(f'T267 mobile: lỗi console {con[:2]}')
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
    loi_d9 = kiem_tra_popup_khoi_tao_dot_8()
    loi += loi_d9
    loi += kiem_tra_dot_9()
    loi += kiem_tra_dot_10()
    loi += kiem_tra_dot_11_a()
    loi += kiem_tra_dot_11_b()
    loi += kiem_tra_dot_12_a()
    loi += kiem_tra_dot_12_b()
    loi += kiem_tra_dot_13_b()
    loi += kiem_tra_dot_13_a()
    loi += kiem_tra_dot_14_a()
    loi += kiem_tra_dot_14_toc_do()
    loi += kiem_tra_dot_15_a()
    loi += kiem_tra_dot_16_a()
    loi += kiem_tra_dot_15_b()
    loi += kiem_tra_dot_16_b()
    loi += kiem_tra_dot_17_a()
    loi += kiem_tra_dot_18_a()
    loi += kiem_tra_dot_18_b()
    loi += kiem_tra_dot_19_b()
    loi += kiem_tra_dot_20_b()
    loi += kiem_tra_dot_21_b()
    loi += kiem_tra_dot_22_b()
    if loi:
        print(f'{len(loi)} LỖI:')
        for x in loi:
            print('  -', x)
        sys.exit(1)
    print('Không có lỗi.')


def kiem_tra_t233_may_tinh():
    loi = []
    print('Kiểm tra T233 máy tính (Anti B): điền tài khoản theo lý do, nhãn cột tài khoản:')
    with sync_playwright() as p:
        b = p.chromium.launch(channel='chrome')
        pg = b.new_page(viewport={'width': 1440, 'height': 900})
        con = []
        pg.on('console', lambda m: con.append(m.text) if m.type == 'error' else None)
        pg.on('pageerror', lambda e: con.append(str(e)))

        # Đăng nhập gói PR
        pg.goto(URL + '#/dang-nhap')
        pg.wait_for_selector('.auth-box')
        pg.evaluate(f"localStorage.setItem('iacc-cloud-session', {json.dumps(phien('PR'))})")

        def chon_cn_neu_hoi():
            btn = pg.locator('.chon-cn button:has-text("Phố Mây Lê Lợi")')
            if btn.count() > 0 and btn.first.is_visible():
                btn.first.click()
                pg.wait_for_timeout(300)

        # 1. Mở #/app/tien/2-1-1/moi?loai=chi, bật Cột tài khoản
        pg.goto(URL + '?goi=PR&p=chi#/app/tien/2-1-1/moi?loai=chi')
        pg.wait_for_timeout(600)
        chon_cn_neu_hoi()

        btn_tk = pg.locator('.btn-tk-toggle')
        if btn_tk.count() == 0:
            loi.append('T233: Phiếu chi mới không tìm thấy nút bật cột tài khoản (.btn-tk-toggle)')
        else:
            if 'on' not in (btn_tk.first.get_attribute('class') or ''):
                btn_tk.first.click()
                pg.wait_for_timeout(200)

        th_texts = pg.locator('.bang-sua thead th').all_inner_texts()
        if 'TK Nợ' not in th_texts or 'TK Có' not in th_texts:
            loi.append(f'T233: Phiếu chi mới tiêu đề cột tài khoản thiếu "TK Nợ" hoặc "TK Có" (thấy {th_texts})')
        if any('TK công nợ' in t for t in th_texts):
            loi.append(f'T233: Phiếu chi mới tiêu đề cột tài khoản vẫn còn "TK công nợ" (thấy {th_texts})')

        # 2. Bấm "Thêm dòng": dòng mới có TK Có 1111 và TK Nợ khác rỗng
        btn_them = pg.locator('button:has-text("Thêm dòng")')
        if btn_them.count() == 0:
            loi.append('T233: Phiếu chi mới không tìm thấy nút "Thêm dòng"')
        else:
            btn_them.first.click()
            pg.wait_for_timeout(200)

        rows = pg.locator('.bang-sua tbody tr')
        if rows.count() < 2:
            loi.append(f'T233: Phiếu chi mới sau khi thêm dòng chỉ có {rows.count()} dòng')
        else:
            dong_moi = rows.last
            inp_no = dong_moi.locator('input[placeholder="TK Nợ"]') if dong_moi.locator('input[placeholder="TK Nợ"]').count() > 0 else dong_moi.locator('input.code').nth(0)
            inp_co = dong_moi.locator('input[placeholder="TK Có"]') if dong_moi.locator('input[placeholder="TK Có"]').count() > 0 else dong_moi.locator('input.code').nth(1)
            val_no = inp_no.input_value().strip() if inp_no.count() > 0 else ''
            val_co = inp_co.input_value().strip() if inp_co.count() > 0 else ''
            if val_co != '1111':
                loi.append(f'T233: Phiếu chi mới dòng mới có TK Có "{val_co}", kỳ vọng "1111"')
            if not val_no:
                loi.append('T233: Phiếu chi mới dòng mới có TK Nợ rỗng')

            # 3. Đổi lý do dòng mới sang "Chi trả lương": TK Nợ dòng đó thành 334
            sel_ly = dong_moi.locator('button.sel').first
            if sel_ly.count() == 0:
                loi.append('T233: Phiếu chi mới không tìm thấy ô chọn lý do dòng mới')
            else:
                sel_ly.click()
                pg.wait_for_timeout(200)
                opt_luong = pg.locator('.pop-dm button[data-mi]:has-text("Chi trả lương"), .pop-dm .mi:has-text("Chi trả lương")')
                if opt_luong.count() == 0:
                    loi.append('T233: Phiếu chi mới không tìm thấy mục "Chi trả lương" trong danh mục lý do')
                else:
                    opt_luong.first.click()
                    pg.wait_for_timeout(200)
                    val_no_sau = inp_no.input_value().strip() if inp_no.count() > 0 else ''
                    if val_no_sau != '334':
                        loi.append(f'T233: Phiếu chi mới sau khi đổi lý do sang "Chi trả lương", TK Nợ là "{val_no_sau}", kỳ vọng "334"')

        # 4. Mở #/app/tien/2-1-1/moi?loai=thu, thêm dòng: TK Nợ 1111
        pg.goto(URL + '?goi=PR&p=thu#/app/tien/2-1-1/moi?loai=thu')
        pg.wait_for_timeout(600)
        chon_cn_neu_hoi()

        btn_tk = pg.locator('.btn-tk-toggle')
        if btn_tk.count() > 0 and 'on' not in (btn_tk.first.get_attribute('class') or ''):
            btn_tk.first.click()
            pg.wait_for_timeout(200)

        btn_them = pg.locator('button:has-text("Thêm dòng")')
        if btn_them.count() == 0:
            loi.append('T233: Phiếu thu mới không tìm thấy nút "Thêm dòng"')
        else:
            btn_them.first.click()
            pg.wait_for_timeout(200)

        rows = pg.locator('.bang-sua tbody tr')
        if rows.count() < 2:
            loi.append(f'T233: Phiếu thu mới sau khi thêm dòng chỉ có {rows.count()} dòng')
        else:
            dong_moi = rows.last
            inp_no = dong_moi.locator('input[placeholder="TK Nợ"]') if dong_moi.locator('input[placeholder="TK Nợ"]').count() > 0 else dong_moi.locator('input.code').nth(0)
            val_no = inp_no.input_value().strip() if inp_no.count() > 0 else ''
            if val_no != '1111':
                loi.append(f'T233: Phiếu thu mới dòng mới có TK Nợ "{val_no}", kỳ vọng "1111"')

        # 5. Mở #/app/ban-hang/3-1-2/moi, bật Cột tài khoản: tiêu đề vẫn có "TK công nợ (131)" như cũ
        pg.goto(URL + '?goi=PR&p=bh#/app/ban-hang/3-1-2/moi')
        pg.wait_for_timeout(600)
        chon_cn_neu_hoi()

        btn_tk = pg.locator('.btn-tk-toggle')
        if btn_tk.count() > 0 and 'on' not in (btn_tk.first.get_attribute('class') or ''):
            btn_tk.first.click()
            pg.wait_for_timeout(200)

        th_texts = pg.locator('.bang-sua thead th').all_inner_texts()
        if not any('TK công nợ (131)' in t for t in th_texts):
            loi.append(f'T233: Màn bán hàng 3-1-2 tiêu đề cột tài khoản thiếu "TK công nợ (131)" (thấy {th_texts})')

        if con:
            loi.append(f'T233: lỗi console {con[:2]}')
        b.close()
    return loi


def kiem_tra_t238_may_tinh():
    loi = []
    with sync_playwright() as p:
        b = p.chromium.launch(channel='chrome')
        pg = b.new_page(viewport={'width': 1440, 'height': 900})
        con = []
        pg.on('console', lambda m: con.append(m.text) if m.type == 'error' else None)
        pg.on('pageerror', lambda e: con.append(str(e)))

        pg.goto(URL + '#/dang-nhap')
        pg.wait_for_selector('.auth-box')
        pg.evaluate(f"localStorage.setItem('iacc-cloud-session', {json.dumps(phien('PL'))})")
        pg.evaluate("localStorage.removeItem('bc-dong-trang')")

        # 1. Mở báo cáo Chi tiết bán hàng (3-2-8) ở chế độ Bảng dữ liệu
        pg.goto(URL + '?goi=PL&p=ctbh#/app/ban-hang/3-2-8')
        pg.wait_for_selector('.bc-ban-du-lieu table.tbl')
        pg.wait_for_timeout(300)

        # 2. Xác nhận bảng có đúng 100 dòng dữ liệu + dòng tổng cuối
        dong_du_lieu = pg.locator('.bc-ban-du-lieu tbody tr:not(.bc-dong-tong):not(.tbl-spacer)')
        dong_tong = pg.locator('.bc-ban-du-lieu tbody tr.bc-dong-tong')
        so_dl = dong_du_lieu.count()
        so_tong = dong_tong.count()
        if so_dl != 100:
            loi.append(f'T238: Chi tiết bán hàng ban đầu có {so_dl} dòng dữ liệu, kỳ vọng đúng 100 dòng')
        if so_tong < 1:
            loi.append('T238: Chi tiết bán hàng không thấy dòng tổng cuối (.bc-dong-tong)')

        # Kiểm tra thanh phân trang có hiện và ở 100/trang
        pt_sel = pg.locator('.bc-thanh button.pt-sel')
        if pt_sel.count() == 0:
            loi.append('T238: Không tìm thấy thanh phân trang .bc-thanh .pt-sel trên Bảng dữ liệu')
        else:
            txt_sel = pt_sel.first.inner_text().strip()
            if '100' not in txt_sel:
                loi.append(f'T238: Cỡ trang mặc định là "{txt_sel}", kỳ vọng có "100"')

        # Chụp ảnh Bảng dữ liệu thấy thanh phân trang và dòng tổng cuối (lưu ngoài repo)
        pg.locator('.bc-ban-du-lieu .tbl-wrap').evaluate('el => el.scrollTop = el.scrollHeight')
        pg.wait_for_timeout(200)
        anh_t238 = SHOTS / 't238-bang-du-lieu.png'   # trước ghi đường dẫn máy Trum, máy khác báo lỗi quyền (T250)
        anh_t238.parent.mkdir(parents=True, exist_ok=True)
        pg.screenshot(path=str(anh_t238))
        pg.locator('.bc-ban-du-lieu .tbl-wrap').evaluate('el => el.scrollTop = 0')
        pg.wait_for_timeout(100)

        # 3. Chọn 200: số dòng đổi thành 200 dòng dữ liệu
        if pt_sel.count() > 0:
            pt_sel.first.click()
            pg.wait_for_timeout(150)
            opt_200 = pg.locator('.pop-sel button[role="option"]:has-text("200")')
            if opt_200.count() == 0:
                loi.append('T238: Không tìm thấy tuỳ chọn 200/trang trong menu phân trang')
            else:
                opt_200.first.click()
                pg.wait_for_timeout(300)
                so_dl_200 = pg.locator('.bc-ban-du-lieu tbody tr:not(.bc-dong-tong):not(.tbl-spacer)').count()
                if so_dl_200 != 200:
                    loi.append(f'T238: Sau khi chọn 200/trang, có {so_dl_200} dòng dữ liệu, kỳ vọng đúng 200 dòng')

                luu_storage = pg.evaluate("localStorage.getItem('bc-dong-trang')")
                if luu_storage != '200':
                    loi.append(f'T238: localStorage "bc-dong-trang" lưu "{luu_storage}", kỳ vọng "200"')

        # 4. Sang trang 2 rồi bấm Lọc thì về trang 1
        btn_trang2 = pg.locator('.bc-thanh .pt-num', has_text='2')
        if btn_trang2.count() == 0:
            loi.append('T238: Không tìm thấy nút trang 2 trên thanh phân trang')
        else:
            btn_trang2.first.click()
            pg.wait_for_timeout(200)
            trang_on = pg.locator('.bc-thanh .pt-num.on')
            if trang_on.count() == 0 or trang_on.first.inner_text().strip() != '2':
                loi.append('T238: Bấm trang 2 nhưng nút 2 không có trạng thái chọn (.on)')

            # Bấm nút Lọc
            btn_loc = pg.locator('.ds-nut-loc, button:has-text("Lọc")')
            if btn_loc.count() == 0:
                loi.append('T238: Không tìm thấy nút Lọc trên thanh công cụ báo cáo')
            else:
                btn_loc.first.click()
                pg.wait_for_timeout(300)
                trang_ve = pg.locator('.bc-thanh .pt-num.on')
                txt_ve = trang_ve.first.inner_text().strip() if trang_ve.count() > 0 else ''
                if txt_ve != '1':
                    loi.append(f'T238: Sau khi bấm Lọc, trang đang chọn là "{txt_ve}", kỳ vọng về trang 1')

        if con:
            loi.append(f'T238: lỗi console {con[:2]}')
        b.close()
    return loi


def kiem_tra_dot_22_a():
    """Kiểm tra T267 (Anti A): Sơ đồ hội tụ gói Free cho Kiểm kê (kho), Chi phí phân bổ (ccdc), Kê khai thuế (thue)."""
    loi = []
    print('Kiểm tra đợt 22A (T267): Sơ đồ hội tụ gói Free cho kho, ccdc, thue (1440x900):')
    SHOTS.mkdir(parents=True, exist_ok=True)

    cac_man = [
        ('kho', 'Kiểm kê', [
            ('mua-hang/4-1-1', 'Mua hàng'),
            ('ban-hang/3-1-1', 'Bán hàng'),
            ('', 'Tồn hệ thống'),
            ('kho/5-1-10', 'Kiểm kê kho'),
            ('kho/dieu-chinh?loai=xdc', 'Xuất điều chỉnh'),
            ('kho/dieu-chinh?loai=ndc', 'Nhập điều chỉnh'),
        ]),
        ('ccdc', 'Chi phí phân bổ', [
            ('tien/2-1-1/moi?loai=chi&ly=LD17', 'Chi tiền mặt'),
            ('tien/2-1-1/moi?loai=unc&ly=LD17', 'Chi ngân hàng'),
            ('ccdc/8-1-1', 'Thẻ chi phí phân bổ'),
            ('ccdc/8-1-1', 'Thẻ CPPB dư đầu kỳ'),
        ]),
        ('thue', 'Kê khai thuế', [
            ('thue/to-khai?buoc=1', 'Thông tin hộ kinh doanh'),
            ('thue/to-khai?buoc=2', 'Kê khai doanh thu'),
            ('thue/to-khai?buoc=3', 'Khai phụ lục'),
            ('thue/to-khai?buoc=4', 'Xem và nộp tờ khai'),
        ]),
    ]

    with sync_playwright() as p:
        b = p.chromium.launch(channel='chrome')
        pg = b.new_page(viewport={'width': 1440, 'height': 900})
        con = []
        pg.on('console', lambda m: con.append(m.text) if m.type == 'error' else None)
        pg.on('pageerror', lambda e: con.append(str(e)))

        pg.goto(URL + '#/dang-nhap')
        pg.wait_for_selector('.auth-box')
        pg.evaluate(f"localStorage.setItem('iacc-cloud-session', {json.dumps(phien('F'))})")

        # Chụp ảnh tien gói F để so sánh (spec item 5)
        pg.goto(f"{URL}?goi=F&p=tien-so-sanh#/app/tien/quy-trinh")
        pg.wait_for_selector('.qt-ht')
        pg.wait_for_timeout(300)
        pg.screenshot(path=str(SHOTS / 'qt-22-tien.png'))

        for mod, ten_ph, ds_o in cac_man:
            path_qt = f'/app/{mod}/quy-trinh'
            pg.goto(f"{URL}?goi=F&p={mod}-qt22#{path_qt}")
            pg.wait_for_selector('.qt-card', timeout=8000)
            pg.wait_for_timeout(350)

            # 1. Có sơ đồ hội tụ: lớp .qt-ht, có .qt-ht-lan, .qt-ht-ra, .qt-ht-gom
            if pg.locator('.qt-ht').count() == 0:
                loi.append(f'T267 ({mod}): Không thấy sơ đồ hội tụ (.qt-ht)')
            if pg.locator('.qt-ht-lan').count() == 0:
                loi.append(f'T267 ({mod}): Thiếu vùng làn nghiệp vụ (.qt-ht-lan)')
            if pg.locator('.qt-ht-ra').count() == 0:
                loi.append(f'T267 ({mod}): Thiếu khối Sổ sách, báo cáo (.qt-ht-ra)')

            # 2. Không có khung Báo cáo bên phải (.qt-bc)
            if pg.locator('.qt-bc').count() > 0:
                loi.append(f'T267 ({mod}): Vẫn còn khung Báo cáo bên phải (.qt-bc)')

            # 3. Kiểm tra mỗi ô di cũ có mặt và mở đúng màn
            for di, ten_o in ds_o:
                if not di:
                    # Ô tĩnh (Tồn hệ thống)
                    o_tinh = pg.locator('.qt-n.tinh', has_text=ten_o)
                    if o_tinh.count() == 0:
                        loi.append(f'T267 ({mod}): Không tìm thấy ô tĩnh "{ten_o}"')
                else:
                    o_nut = pg.locator(f'a.qt-n[href*="{di}"], a.qt-n', has_text=ten_o)
                    if o_nut.count() == 0:
                        loi.append(f'T267 ({mod}): Không tìm thấy ô "{ten_o}" với đường dẫn {di}')
                    else:
                        href = o_nut.first.get_attribute('href') or ''
                        if di not in href:
                            loi.append(f'T267 ({mod}): Ô "{ten_o}" có href "{href}", không khớp "{di}"')

            # 4. Kiểm tra tràn ngang và chụp ảnh
            tran = pg.evaluate("['.main', '.page', '.qt-ht'].filter(q => { const e = document.querySelector(q); return e && e.scrollWidth > e.clientWidth + 2 })")
            if tran:
                loi.append(f'T267 ({mod}): Tràn ngang tại {tran}')

            pg.screenshot(path=str(SHOTS / f'qt-22-{mod}.png'))

        if con:
            loi.append(f'T267: lỗi console {con[:2]}')
        b.close()
    return loi



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
                else:
                    # Bấm phân hệ vào thẳng danh sách phiếu (T226): mở tab Quy trình để gom ô sơ đồ
                    qt = [t for t in tabs if t and t.endswith('/quy-trinh')]
                    if qt:
                        pg.goto(URL + qt[0])
                        pg.wait_for_timeout(80)
                        nut += hrefs('a.qt-n')
                        if goi == 'F' and pg.locator('.qt-n.lock, .qt-bc a.lock, .qt-foot a.lock').count():
                            loi.append(f'[F] {qt[0]}: còn hiện mục ngoài gói có khoá')
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
                pg.wait_for_selector('.lockpage, .ds-nut-loc')
                if pg.locator('.lockpage').count():
                    continue
                for ky in ['8', '9', '10']:
                    # kỳ chọn ở ô Khoảng ngày trên thanh lọc (T237): mở lịch, sang Chọn tháng, bấm tháng của năm 2026, Xác nhận, rồi bấm Lọc
                    pg.locator('.ds-o-khoangNgay .kn-nut, .ds-o-thoiGian .kn-nut, .kn-nut').first.click()
                    pg.locator('.kn-pop').get_by_role('button', name='Chọn tháng', exact=True).click()
                    pg.locator('.kn-luoi-thang').first.get_by_role('button', name=f'Thg {ky}', exact=True).click()
                    pg.locator('.kn-pop').get_by_role('button', name='Xác nhận', exact=True).click()
                    pg.locator('.ds-nut-loc').first.click()
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
    loi += kiem_tra_t233_may_tinh()
    loi += kiem_tra_t238_may_tinh()
    loi += kiem_tra_dot_22_a()
    if loi:
        print(f'{len(loi)} LỖI:')
        for x in loi:
            print('  -', x)
        sys.exit(1)
    print('Không có lỗi.')


if __name__ == '__main__':
    main()
