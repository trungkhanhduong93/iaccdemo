"""Xuất biểu tượng khối Solar (Bold Duotone / Bold) và nét Solar (Linear) cho web.

Nguồn:
- Solar Icon Set by 480 Design, CC BY 4.0, https://creativecommons.org/licenses/by/4.0/: tải qua API Iconify

Sinh ra:
- src/ui/icon-dac.ts: gồm DAC (khối), NET (nét), NHOM (nhóm màu).

Chạy lại:
    python tools/xuat_bieu_tuong.py
Kiểm tra tên thiếu:
    python tools/xuat_bieu_tuong.py --kiem
"""
import json
import re
import sys
import urllib.request
from pathlib import Path

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

WEB = Path(__file__).resolve().parent.parent
DICH = WEB / 'src' / 'ui' / 'icon-dac.ts'

# 1. 9 phân hệ và icon khối (SOLAR base names, không có hậu tố)
SOLAR = {
    # 9 phân hệ (chuyển sang Solar)
    'home': 'home-2',
    'folder': 'folder-with-files',
    'wallet': 'wallet',
    'cart': 'cart-large-2',
    'truck': 'delivery',
    'box': 'box',
    'percent': 'sale',
    'book': 'notebook-bookmark',
    'cog': 'settings',
    # Các icon đồ vật / nghiệp vụ khác
    'building': 'buildings-2',
    'tool': 'sledgehammer',
    'flask': 'test-tube',
    'grid': 'magic-stick-3',
    'bell': 'bell',
    'lock': 'lock-keyhole-minimalistic',
    'eye': 'eye',
    'edit': 'pen',
    'trash': 'trash-bin-trash',
    'logout': 'logout-2',
    'user': 'user',
    'users': 'users-group-rounded',
    'alert': 'danger-triangle',
    'info': 'info-circle',
    'clock': 'clock-circle',
    'keyboard': 'keyboard',
    'chart': 'chart-2',
    'pulse': 'pulse-2',
    'receipt': 'bill-list',
    'filein': 'file-download',
    'doc': 'document-text',
    'bank': 'card',
    'scale': 'scale',
    'sparkle': 'stars',
    'layers': 'layers',
    'history': 'history',
    'pos': 'monitor-smartphone',
    'store': 'shop',
    'db': 'database',
    'shield': 'shield-check',
    'mail': 'letter',
    'key': 'key',
    'play': 'play',
    'phone': 'phone',
    'flag': 'flag',
    'cashin': 'card-recive',
    'cashout': 'card-send',
    'chef': 'chef-hat',
    'calc': 'calculator',
    'clipboard': 'clipboard-list',
    'send': 'plain',
    'help': 'question-circle',
    'tag': 'tag',
    'flow': 'routing-2',
    'printer': 'printer',
    # Danh mục (T40)
    'sotk': 'notebook',
    'hanghoa': 'cup-hot',
    'dvt': 'ruler',
    'quydoi': 'transfer-horizontal',
    'congviec': 'checklist-minimalistic',
    'khohang': 'box',
    'tiente': 'dollar',
    'tygia': 'graph-up',
    'loaithue': 'sale',
    'quytien': 'safe-square',
    'banggia': 'tag-price',
    'buttoan': 'refresh-circle',
    'lydo': 'notes',
    'chinhanh': 'shop-2',
}

# 2. Bảng NET tải bản -linear cho: 9 phân hệ và 19 thao tác
NET_DEF = {
    # 9 phân hệ
    'home': 'home-2',
    'folder': 'folder-with-files',
    'wallet': 'wallet',
    'cart': 'cart-large-2',
    'truck': 'delivery',
    'box': 'box',
    'percent': 'sale',
    'book': 'notebook-bookmark',
    'cog': 'settings',
    # 19 thao tác
    'chevd': 'alt-arrow-down',
    'chevr': 'alt-arrow-right',
    'chevl': 'alt-arrow-left',
    'plus': 'add-circle',
    'x': 'close-circle',
    'check': 'check-read',
    'arrow': 'arrow-right',
    'back': 'undo-left',
    'more': 'menu-dots',
    'search': 'magnifer',
    'refresh': 'refresh',
    'filter': 'filter',
    'download': 'download-minimalistic',
    'upload': 'upload-minimalistic',
    'link': 'link',
    'swap': 'transfer-horizontal',
    'copy': 'copy',
    'calendar': 'calendar',
    'chinh': 'tuning-2',
}

# 3. Phân nhóm màu (8 nhóm nghiệp vụ)
NHOM_MAP = {
    'tien': {'wallet', 'cashin', 'quytien', 'tiente'},
    'chi': {'cashout'},
    'nh': {'bank', 'tygia', 'cart', 'pos', 'store'},
    'thue': {'percent', 'loaithue'},
    'bc': {'book', 'chart', 'scale', 'doc', 'pulse'},
    'ct': {'receipt', 'sotk', 'buttoan', 'calc', 'clipboard', 'filein', 'congviec', 'lydo'},
    'kho': {'box', 'truck', 'hanghoa', 'dvt', 'quydoi', 'banggia', 'khohang', 'tag', 'chef'},
    'ht': {
        'home', 'folder', 'cog', 'building', 'chinhanh', 'users', 'history', 'printer', 'shield', 'bell',
        'tool', 'flask', 'grid', 'lock', 'eye', 'edit', 'trash', 'logout', 'user', 'alert', 'info',
        'clock', 'keyboard', 'sparkle', 'layers', 'db', 'mail', 'key', 'play', 'phone', 'flag', 'send',
        'help', 'flow',
    },
}

NHOM = {}
for local_name in SOLAR:
    found = False
    for group, names in NHOM_MAP.items():
        if local_name in names:
            NHOM[local_name] = group
            found = True
            break
    if not found:
        NHOM[local_name] = 'ht'


def tai_iconify(names):
    """Tải một danh sách icon từ API Iconify (chia thành từng chunk nếu quá dài)."""
    icons_dict = {}
    aliases_dict = {}
    not_found = []
    root_w = 24
    root_h = 24

    chunk_size = 60
    for i in range(0, len(names), chunk_size):
        chunk = names[i:i + chunk_size]
        url = f"https://api.iconify.design/solar.json?icons={','.join(chunk)}"
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode('utf-8'))
        root_w = data.get('width', root_w)
        root_h = data.get('height', root_h)
        icons_dict.update(data.get('icons', {}))
        aliases_dict.update(data.get('aliases', {}))
        not_found.extend(data.get('not_found', []))

    return {
        'icons': icons_dict,
        'aliases': aliases_dict,
        'not_found': not_found,
        'width': root_w,
        'height': root_h,
    }


def lay_thong_tin_icon(icons_dict, aliases_dict, root_w, root_h, full_name):
    """Lấy dữ liệu viewBox và body của icon, giải quyết alias nếu có."""
    lookup = full_name
    seen = set()
    while lookup in aliases_dict:
        if lookup in seen:
            break
        seen.add(lookup)
        lookup = aliases_dict[lookup].get('parent', lookup)
    if lookup not in icons_dict:
        return None
    data = icons_dict[lookup]
    w = data.get('width', root_w)
    h = data.get('height', root_h)
    return {'vb': f'0 0 {w} {h}', 'body': data['body']}


def escape_nhay_don(s):
    """Escape nháy đơn và backslash để nhúng an toàn vào chuỗi TypeScript nháy đơn."""
    return s.replace('\\', '\\\\').replace("'", "\\'")


def main():
    kiem_tra_chi_dinh = '--kiem' in sys.argv
    canh_bao = []

    # 1. Thử tải bold-duotone trước cho mọi icon trong SOLAR
    duotone_targets = {k: f'{v}-bold-duotone' for k, v in SOLAR.items()}
    duotone_names = list(set(duotone_targets.values()))
    duotone_res = tai_iconify(duotone_names)

    # Các icon thiếu bold-duotone sẽ thử sang -bold
    bold_needed = {}
    for local_name, full_duotone in duotone_targets.items():
        if full_duotone in duotone_res['not_found']:
            base = SOLAR[local_name]
            bold_needed[local_name] = f'{base}-bold'

    bold_res = {'icons': {}, 'aliases': {}, 'not_found': []}
    if bold_needed:
        bold_res = tai_iconify(list(set(bold_needed.values())))

    # Kiểm tra thiếu hẳn trong DAC
    dac_not_found = []
    for local_name in SOLAR:
        full_duo = duotone_targets[local_name]
        if full_duo in duotone_res['not_found']:
            full_bld = bold_needed[local_name]
            if full_bld in bold_res['not_found']:
                dac_not_found.append(f'DAC: {local_name} ({full_duo} / {full_bld})')

    # 2. Tải bản linear cho NET
    # Mọi icon khối đều cần bản nét: thanh bên hiện bản nét ở mục thường (T275)
    net_targets = {k: f'{v}-linear' for k, v in {**SOLAR, **NET_DEF}.items()}
    net_names = list(set(net_targets.values()))
    net_res = tai_iconify(net_names)

    net_not_found = []
    for local_name, full_lin in list(net_targets.items()):
        if full_lin in net_res['not_found']:
            if local_name in NET_DEF:
                net_not_found.append(f'NET: {local_name} ({full_lin})')
            else:
                print(f'Cảnh báo: {local_name} không có bản nét, thanh bên dùng bản khối')
                del net_targets[local_name]

    if kiem_tra_chi_dinh:
        if dac_not_found or net_not_found:
            for nf in dac_not_found + net_not_found:
                print(nf)
        else:
            print('Tất cả icon đều hợp lệ trên API Iconify.')
        return

    if dac_not_found or net_not_found:
        print('Lỗi: có biểu tượng không tìm thấy:')
        for nf in dac_not_found + net_not_found:
            print(' ', nf)
        sys.exit(1)

    # 3. Trích xuất DAC
    dac = {}
    for local_name, full_duo in duotone_targets.items():
        info = None
        if full_duo not in duotone_res['not_found']:
            info = lay_thong_tin_icon(
                duotone_res['icons'], duotone_res['aliases'],
                duotone_res['width'], duotone_res['height'], full_duo
            )
        if not info:
            full_bld = bold_needed[local_name]
            info = lay_thong_tin_icon(
                bold_res['icons'], bold_res['aliases'],
                bold_res['width'], bold_res['height'], full_bld
            )
            canh_bao.append(f'{local_name}: dùng {full_bld} thay vì bold-duotone')

        body = info['body']
        # Đổi thuộc tính opacity=".5" (lớp phụ) thành class="l2"
        body = re.sub(r'\s+opacity=[\'"]0?\.5[\'"]', ' class="l2"', body)
        dac[local_name] = {'vb': info['vb'], 'body': body}

    # 4. Trích xuất NET
    net = {}
    for local_name, full_lin in net_targets.items():
        info = lay_thong_tin_icon(
            net_res['icons'], net_res['aliases'],
            net_res['width'], net_res['height'], full_lin
        )
        body = info['body']
        # Body nét: bỏ stroke-width="1.5" để CSS quyết định nét
        body = re.sub(r'\s+stroke-width=[\'"]1\.5[\'"]', '', body)
        net[local_name] = {'vb': info['vb'], 'body': body}

    # 5. Ghi file icon-dac.ts
    lines = [
        '// Sinh bởi tools/xuat_bieu_tuong.py, không sửa tay',
        '// Nguồn:',
        '// - Solar Icon Set by 480 Design, CC BY 4.0, https://creativecommons.org/licenses/by/4.0/',
        '',
        'export const DAC: Record<string, { vb: string; body: string }> = {',
    ]

    for k, v in dac.items():
        vb_esc = escape_nhay_don(v['vb'])
        body_esc = escape_nhay_don(v['body'])
        lines.append(f"  {k}: {{ vb: '{vb_esc}', body: '{body_esc}' }},")

    lines.append('}\n')

    lines.append('export const NET: Record<string, { vb: string; body: string }> = {')
    for k, v in net.items():
        vb_esc = escape_nhay_don(v['vb'])
        body_esc = escape_nhay_don(v['body'])
        lines.append(f"  {k}: {{ vb: '{vb_esc}', body: '{body_esc}' }},")
    lines.append('}\n')

    lines.append('export const NHOM: Record<string, string> = {')
    for k, v in NHOM.items():
        lines.append(f"  {k}: '{v}',")
    lines.append('}\n')

    DICH.write_text('\n'.join(lines), encoding='utf-8')
    print(f'Đã sinh {DICH.relative_to(WEB)} với {len(dac)} icon khối, {len(net)} icon nét.')
    if canh_bao:
        print(f'Cảnh báo ({len(canh_bao)}):')
        for cb in canh_bao:
            print('  -', cb)
    else:
        print('Không có cảnh báo (tất cả icon khối đều có bản bold-duotone).')


if __name__ == '__main__':
    main()
