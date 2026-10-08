"""Xuất biểu tượng khối đặc iFaster và Solar cho web.

Nguồn:
- Bộ biểu tượng menu của iFaster (iPOS): tải từ CSS https://ifaster.ipos.vn/login
- Solar Icon Set by 480 Design, CC BY 4.0, https://creativecommons.org/licenses/by/4.0/: tải qua API Iconify

Sinh ra:
- src/ui/icon-dac.ts: gồm 54 biểu tượng khối đặc (9 của iFaster + 45 của Solar).

Chạy lại:
    python tools/xuat_bieu_tuong.py
Kiểm tra tên thiếu:
    python tools/xuat_bieu_tuong.py --kiem
"""
import json
import re
import sys
import urllib.parse
import urllib.request
from pathlib import Path

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

WEB = Path(__file__).resolve().parent.parent
DICH = WEB / 'src' / 'ui' / 'icon-dac.ts'

# 1. Bộ iFaster i-me (9 cặp)
IFASTER = {
    'home': 'menu_dashboard',
    'folder': 'menu_catalog',
    'wallet': 'menu_income_expense',
    'cart': 'menu_sale',
    'truck': 'menu_order',
    'box': 'menu_warehouse',
    'percent': 'menu_business',
    'book': 'menu_report',
    'cog': 'menu_setting',
}

# 2. Solar bold (45 cặp)
SOLAR = {
    'building': 'buildings-2-bold',
    'tool': 'sledgehammer-bold',
    'flask': 'test-tube-bold',
    'grid': 'magic-stick-3-bold',
    'bell': 'bell-bold',
    'lock': 'lock-keyhole-minimalistic-bold',
    'eye': 'eye-bold',
    'edit': 'pen-bold',
    'trash': 'trash-bin-trash-bold',
    'logout': 'logout-2-bold',
    'user': 'user-bold',
    'users': 'users-group-rounded-bold',
    'alert': 'danger-triangle-bold',
    'info': 'info-circle-bold',
    'clock': 'clock-circle-bold',
    'keyboard': 'keyboard-bold',
    'chart': 'chart-2-bold',
    'pulse': 'pulse-2-bold',
    'receipt': 'bill-list-bold',
    'filein': 'file-download-bold',
    'doc': 'document-text-bold',
    'bank': 'card-bold',
    'scale': 'scale-bold',
    'sparkle': 'stars-bold',
    'layers': 'layers-bold',
    'history': 'history-bold',
    'pos': 'monitor-smartphone-bold',
    'store': 'shop-bold',
    'db': 'database-bold',
    'shield': 'shield-check-bold',
    'mail': 'letter-bold',
    'key': 'key-bold',
    'play': 'play-bold',
    'phone': 'phone-bold',
    'flag': 'flag-bold',
    'cashin': 'card-recive-bold',
    'cashout': 'card-send-bold',
    'chef': 'chef-hat-bold',
    'calc': 'calculator-bold',
    'clipboard': 'clipboard-list-bold',
    'send': 'plain-bold',
    'help': 'question-circle-bold',
    'tag': 'tag-bold',
    'flow': 'routing-2-bold',
    'printer': 'printer-bold',
}


def lay_ifaster():
    """Tải và trích xuất các biểu tượng i-me từ CSS công khai của iFaster."""
    url_login = 'https://ifaster.ipos.vn/login'
    req = urllib.request.Request(url_login, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req) as resp:
        html = resp.read().decode('utf-8')

    m_css = re.search(r'href=[\'"](/assets/index-[^\'"]+\.css)[\'"]', html)
    if not m_css:
        raise RuntimeError('Không tìm thấy liên kết CSS trên trang đăng nhập iFaster')

    url_css = 'https://ifaster.ipos.vn' + m_css.group(1)
    req_css = urllib.request.Request(url_css, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req_css) as resp:
        css = resp.read().decode('utf-8')

    pattern = re.compile(r'\.i.me.:([A-Za-z_0-9-]+)[^{]*\{--un-icon:url\("data:image/svg\+xml;utf8,([^"]*)"\)')
    icons = {}
    for m in pattern.finditer(css):
        name = m.group(1)
        svg_raw = urllib.parse.unquote(m.group(2))
        icons[name] = svg_raw
    return icons


def chuan_hoa_ime(svg_str):
    """Chuẩn hoá SVG i-me: lấy viewBox, bỏ <svg>, bỏ opacity, fill/stroke -> currentColor."""
    m_vb = re.search(r'viewBox=[\'"]([^\'"]+)[\'"]', svg_str)
    vb = m_vb.group(1) if m_vb else '0 0 20 20'

    # Bỏ thẻ <svg ...> ngoài và </svg>
    body = re.sub(r'^\s*<svg[^>]*>', '', svg_str.strip(), flags=re.IGNORECASE)
    body = re.sub(r'</svg>\s*$', '', body, flags=re.IGNORECASE).strip()

    # Bỏ thuộc tính opacity (màu và độ mờ do CSS quyết định)
    body = re.sub(r'\s+opacity=[\'"][^\'"]*[\'"]', '', body)

    # Đổi fill / stroke khác none về currentColor
    def rep_attr(m):
        attr = m.group(1)
        val = m.group(2)
        if val == 'none':
            return f'{attr}="none"'
        return f'{attr}="currentColor"'

    body = re.sub(r'\b(fill|stroke)=[\'"]([^\'"]*)[\'"]', rep_attr, body)

    # Chuẩn hoá các thuộc tính nháy đơn thành nháy kép
    body = re.sub(r'\b([a-zA-Z0-9_-]+)=\'([^\']*)\'', r'\1="\2"', body)

    return vb, body


def lay_solar():
    """Tải bộ biểu tượng Solar từ API Iconify."""
    solar_icons = list(SOLAR.values())
    url = f"https://api.iconify.design/solar.json?icons={','.join(solar_icons)}"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read().decode('utf-8'))
    return data


def escape_nhay_don(s):
    """Escape nháy đơn và backslash để nhúng an toàn vào chuỗi TypeScript nháy đơn."""
    return s.replace('\\', '\\\\').replace("'", "\\'")


def main():
    kiem_tra_chi_dinh = '--kiem' in sys.argv

    ifaster_raw = lay_ifaster()
    solar_data = lay_solar()

    not_found = []
    for k, v in IFASTER.items():
        if v not in ifaster_raw:
            not_found.append(f'iFaster: {k} -> {v}')

    for name in solar_data.get('not_found', []):
        not_found.append(f'Solar: {name}')

    if kiem_tra_chi_dinh:
        for nf in not_found:
            print(nf)
        return

    if not_found:
        print('Lỗi: có biểu tượng không tìm thấy:')
        for nf in not_found:
            print(' ', nf)
        sys.exit(1)

    dac = {}

    # 1. Trích xuất 9 biểu tượng iFaster
    for local_name, ifaster_name in IFASTER.items():
        vb, body = chuan_hoa_ime(ifaster_raw[ifaster_name])
        dac[local_name] = {'vb': vb, 'body': body}

    # 2. Trích xuất 45 biểu tượng Solar (xử lý alias nếu có)
    root_w = solar_data.get('width', 24)
    root_h = solar_data.get('height', 24)
    icons_dict = solar_data.get('icons', {})
    aliases_dict = solar_data.get('aliases', {})

    for local_name, solar_name in SOLAR.items():
        lookup = solar_name
        while lookup in aliases_dict:
            lookup = aliases_dict[lookup].get('parent', lookup)
        if lookup not in icons_dict:
            print(f'Lỗi: không có dữ liệu cho Solar {solar_name} ({lookup})')
            sys.exit(1)
        s_data = icons_dict[lookup]
        w = s_data.get('width', root_w)
        h = s_data.get('height', root_h)
        dac[local_name] = {'vb': f'0 0 {w} {h}', 'body': s_data['body']}

    lines = [
        '// Sinh bởi tools/xuat_bieu_tuong.py, không sửa tay',
        '// Nguồn:',
        '// - Bộ biểu tượng menu của iFaster (iPOS)',
        '// - Solar Icon Set by 480 Design, CC BY 4.0, https://creativecommons.org/licenses/by/4.0/',
        '',
        'export const DAC: Record<string, { vb: string; body: string }> = {',
    ]

    for k, v in dac.items():
        vb_esc = escape_nhay_don(v['vb'])
        body_esc = escape_nhay_don(v['body'])
        lines.append(f"  {k}: {{ vb: '{vb_esc}', body: '{body_esc}' }},")

    lines.append('}\n')

    DICH.write_text('\n'.join(lines), encoding='utf-8')
    print(f'Đã sinh {DICH.relative_to(WEB)} với {len(dac)} biểu tượng.')


if __name__ == '__main__':
    main()
