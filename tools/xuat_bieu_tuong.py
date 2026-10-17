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
import xml.etree.ElementTree as ET
from pathlib import Path
from playwright.sync_api import sync_playwright

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
    'truck': 'bag-4',
    'box': 'box',
    'percent': 'sale',
    'book': 'notebook-bookmark',
    'cog': 'settings',
    # Các icon đồ vật / nghiệp vụ khác
    'building': 'buildings-2',
    'tool': 'sledgehammer',
    'flask': 'test-tube',
    'grid': 'bill-list',
    'nghiepvu': 'widget-5',
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
    'clipboard': 'clipboard-check',
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
    'banggia': 'tag',
    'buttoan': 'refresh-circle',
    'lydo': 'notes',
    'chinhanh': 'shop-2',
    'more': 'menu-dots',
    # Mới theo spec T320
    'dieuchuyen': 'delivery',
    'giathanh': 'tag-price',
    'phanbo': 'pie-chart-2',
    'tienich': 'widget-add',
    'nhapkho': 'archive-down-minimlistic',
    'xuatkho': 'archive-up-minimlistic',
}

# 2. Bảng icon thao tác (THAO_TAC_DEF tải bản -linear) và 9 phân hệ (NET_PHAN_HE)
THAO_TAC_DEF = {
    # Điều khiển / thao tác
    'plus': 'add-circle',
    'x': 'close-circle',
    'close': 'close-circle',
    'check': 'check-read',
    'arrow': 'arrow-right',
    'chevd': 'alt-arrow-down',
    'chevr': 'alt-arrow-right',
    'chevl': 'alt-arrow-left',
    'chevu': 'alt-arrow-up',
    'back': 'undo-left',
    'more': 'menu-dots',
    'search': 'magnifier',
    'refresh': 'refresh',
    'filter': 'filter',
    'download': 'download-minimalistic',
    'upload': 'upload-minimalistic',
    'link': 'link',
    'swap': 'transfer-horizontal',
    'copy': 'copy',
    'calendar': 'calendar',
    'chinh': 'tuning-2',
    'edit': 'pen',
    'trash': 'trash-bin-trash',
    'eye': 'eye',
    'printer': 'printer',
    'logout': 'logout-2',
    'lock': 'lock-keyhole-minimalistic',
    'help': 'question-circle',
    'info': 'info-circle',
    'info-circle': 'info-circle',
    'alert': 'danger-triangle',
    'bell': 'bell',
    'clock': 'clock-circle',
    'send': 'plain',
    'play': 'play',
    # Giao diện chung theo chỉ đạo coordinator
    'user': 'user',
    'key': 'key',
    'mail': 'letter',
    'phone': 'phone',
    'keyboard': 'keyboard',
    'history': 'history',
    'flag': 'flag',
    'cuahang': 'home-angle',  # cửa hàng: hình nhà dễ nhận hơn gian hàng (T349)
}

NET_PHAN_HE = {
    'home': 'home-2',
    'folder': 'folder-with-files',
    'wallet': 'wallet',
    'cart': 'cart-large-2',
    'truck': 'bag-4',
    'box': 'box',
    'percent': 'sale',
    'book': 'notebook-bookmark',
    'cog': 'settings',
}

NET_DEF = {**NET_PHAN_HE, **THAO_TAC_DEF}
THAO_TAC = sorted(THAO_TAC_DEF.keys())

# 3. Phân nhóm màu (8 nhóm nghiệp vụ)
NHOM_MAP = {
    'tien': {'wallet', 'cashin', 'quytien', 'tiente'},
    'chi': {'cashout'},
    'nh': {'bank', 'tygia', 'cart', 'pos', 'store'},
    'thue': {'percent', 'loaithue'},
    'bc': {'book', 'chart', 'scale', 'doc', 'pulse'},
    'ct': {'receipt', 'sotk', 'buttoan', 'calc', 'clipboard', 'filein', 'congviec', 'lydo', 'giathanh', 'grid'},
    'kho': {'box', 'truck', 'hanghoa', 'dvt', 'quydoi', 'banggia', 'khohang', 'tag', 'chef', 'dieuchuyen', 'nhapkho', 'xuatkho'},
    'ht': {
        'home', 'folder', 'cog', 'building', 'chinhanh', 'users', 'history', 'printer', 'shield', 'bell',
        'tool', 'flask', 'lock', 'eye', 'edit', 'trash', 'logout', 'user', 'alert', 'info',
        'clock', 'keyboard', 'sparkle', 'layers', 'db', 'mail', 'key', 'play', 'phone', 'flag', 'send',
        'help', 'flow', 'phanbo', 'tienich',
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


# Bảng sửa tay: icon có trong bảng lấy ngược kết quả đo hộp bao (đo đảo thì giữ, đo giữ thì đảo)
# tool: đo hộp bao ra đảo nhầm, đầu búa thành cam (T301), chỉ bộ nét
DAO_TAY = {'tool'}

_CMD_RE = re.compile(r'([a-zA-Z])([^a-zA-Z]*)')
_NUM_RE = re.compile(r'[-+]?(?:\d*\.\d+|\d+)')


def trich_toa_do_d(d_str):
    """Trích xuất các điểm toạ độ (x, y) từ chuỗi d trong SVG."""
    cur_x, cur_y = 0.0, 0.0
    start_x, start_y = 0.0, 0.0
    points = []
    for cmd, args in _CMD_RE.findall(d_str):
        nums = [float(n) for n in _NUM_RE.findall(args)]
        if cmd in ('M', 'm'):
            is_rel = (cmd == 'm')
            for i in range(0, len(nums), 2):
                if i + 1 < len(nums):
                    cur_x = (cur_x + nums[i]) if is_rel and points else nums[i]
                    cur_y = (cur_y + nums[i+1]) if is_rel and points else nums[i+1]
                    points.append((cur_x, cur_y))
                    if i == 0:
                        start_x, start_y = cur_x, cur_y
        elif cmd in ('L', 'l'):
            is_rel = (cmd == 'l')
            for i in range(0, len(nums), 2):
                if i + 1 < len(nums):
                    cur_x = (cur_x + nums[i]) if is_rel else nums[i]
                    cur_y = (cur_y + nums[i+1]) if is_rel else nums[i+1]
                    points.append((cur_x, cur_y))
        elif cmd in ('H', 'h'):
            is_rel = (cmd == 'h')
            for x in nums:
                cur_x = (cur_x + x) if is_rel else x
                points.append((cur_x, cur_y))
        elif cmd in ('V', 'v'):
            is_rel = (cmd == 'v')
            for y in nums:
                cur_y = (cur_y + y) if is_rel else y
                points.append((cur_x, cur_y))
        elif cmd in ('C', 'c'):
            is_rel = (cmd == 'c')
            for i in range(0, len(nums), 6):
                if i + 5 < len(nums):
                    if is_rel:
                        p1 = (cur_x + nums[i], cur_y + nums[i+1])
                        p2 = (cur_x + nums[i+2], cur_y + nums[i+3])
                        cur_x += nums[i+4]
                        cur_y += nums[i+5]
                    else:
                        p1 = (nums[i], nums[i+1])
                        p2 = (nums[i+2], nums[i+3])
                        cur_x = nums[i+4]
                        cur_y = nums[i+5]
                    points.extend([p1, p2, (cur_x, cur_y)])
        elif cmd in ('S', 's', 'Q', 'q'):
            is_rel = cmd.islower()
            step = 4
            for i in range(0, len(nums), step):
                if i + step - 1 < len(nums):
                    if is_rel:
                        p1 = (cur_x + nums[i], cur_y + nums[i+1])
                        cur_x += nums[i+step-2]
                        cur_y += nums[i+step-1]
                    else:
                        p1 = (nums[i], nums[i+1])
                        cur_x = nums[i+step-2]
                        cur_y = nums[i+step-1]
                    points.extend([p1, (cur_x, cur_y)])
        elif cmd in ('A', 'a'):
            is_rel = (cmd == 'a')
            for i in range(0, len(nums), 7):
                if i + 6 < len(nums):
                    cur_x = (cur_x + nums[i+5]) if is_rel else nums[i+5]
                    cur_y = (cur_y + nums[i+6]) if is_rel else nums[i+6]
                    points.append((cur_x, cur_y))
        elif cmd in ('Z', 'z'):
            cur_x, cur_y = start_x, start_y
            points.append((cur_x, cur_y))
    return points


def dien_tich_hop_bao(points):
    """Tính diện tích hộp bao (w * h) của danh sách toạ độ (x, y)."""
    if not points:
        return 0.0
    xs = [p[0] for p in points]
    ys = [p[1] for p in points]
    return (max(xs) - min(xs)) * (max(ys) - min(ys))


def dao_class_l2(body):
    """Đảo class='l2' cho các thẻ con: thẻ có l2 thành không class, thẻ không class thành l2."""
    def swap_tag(match):
        tag_name = match.group(1)
        attrs = match.group(2)
        end = match.group(3)
        if 'class="l2"' in attrs or "class='l2'" in attrs:
            attrs = re.sub(r'\s+class=[\'"]l2[\'"]', '', attrs)
        else:
            attrs = attrs.rstrip() + ' class="l2"'
        return f'<{tag_name}{attrs}{end}'

    return re.sub(r'<(path|circle|ellipse|rect)\b([^>]*?)(/?>)', swap_tag, body)


def tach_hai_lop(raw_body, vb='0 0 24 24'):
    """Tách 2 lớp SVG: lớp có opacity và lớp không có opacity."""
    root = ET.fromstring(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vb}">{raw_body}</svg>')
    op_elements = []
    non_elements = []

    def process(elem, parent_has_op):
        has_op = parent_has_op or ('opacity' in elem.attrib)
        tag = elem.tag.split('}')[-1]
        if tag in ('path', 'circle', 'rect', 'ellipse', 'polygon', 'polyline', 'line'):
            elem_copy = ET.Element(tag, {k: v for k, v in elem.attrib.items() if k != 'opacity'})
            if has_op:
                op_elements.append(elem_copy)
            else:
                non_elements.append(elem_copy)
        else:
            for child in elem:
                process(child, has_op)

    for child in root:
        process(child, False)

    def to_svg(elems):
        if not elems:
            return None
        s = f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vb}" width="96" height="96" fill="#000">'
        for el in elems:
            s += ET.tostring(el, encoding='unicode')
        s += '</svg>'
        return s

    return to_svg(op_elements), to_svg(non_elements)


def gan_lop_dac(raw_body, lop, dao):
    """Gán class l2 hoặc l3 cho lớp phụ và xoá opacity."""
    if not lop:
        return re.sub(r'\s+opacity=[\'"]0?\.\d+[\'"]', '', raw_body)

    ET.register_namespace('', 'http://www.w3.org/2000/svg')
    root = ET.fromstring(f'<svg xmlns="http://www.w3.org/2000/svg">{raw_body}</svg>')
    elem_op = {}

    def mark_op(el, parent_has_op):
        has_op = parent_has_op or ('opacity' in el.attrib)
        elem_op[el] = has_op
        for ch in el:
            mark_op(ch, has_op)

    mark_op(root, False)

    for el in root.iter():
        tag = el.tag.split('}')[-1]
        has_op = elem_op.get(el, False)
        if 'opacity' in el.attrib:
            del el.attrib['opacity']
        if tag in ('path', 'circle', 'rect', 'ellipse', 'polygon', 'polyline', 'line'):
            is_phu = (not has_op) if dao else has_op
            if is_phu and lop:
                el.attrib['class'] = lop
            else:
                el.attrib.pop('class', None)
        elif tag == 'g':
            el.attrib.pop('class', None)

    res = ''.join(ET.tostring(ch, encoding='unicode') for ch in root)
    res = re.sub(r'\s+xmlns=[\'"][^\'"]*[\'"]', '', res)
    return res


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

    # 2. Tải bản icon cho NET: THAO_TAC ưu tiên -linear, các icon khác ưu tiên -line-duotone
    all_net_items = {**SOLAR, **NET_DEF}
    net_targets = {}
    for k, v in all_net_items.items():
        if k in THAO_TAC_DEF:
            net_targets[k] = f'{v}-linear'
        else:
            net_targets[k] = f'{v}-line-duotone'

    net_names = list(set(net_targets.values()))
    net_res = tai_iconify(net_names)

    # Các icon thiếu bản ưu tiên sẽ thử fallback
    fallback_needed = {}
    for local_name, full_target in net_targets.items():
        if full_target in net_res['not_found']:
            base = all_net_items[local_name]
            if local_name in THAO_TAC_DEF:
                fallback_needed[local_name] = f'{base}-line-duotone'
            else:
                fallback_needed[local_name] = f'{base}-linear'

    fallback_res = {'icons': {}, 'aliases': {}, 'not_found': []}
    if fallback_needed:
        fallback_res = tai_iconify(list(set(fallback_needed.values())))

    net_not_found = []
    for local_name, full_target in net_targets.items():
        if full_target in net_res['not_found']:
            full_fb = fallback_needed[local_name]
            if full_fb in fallback_res['not_found']:
                net_not_found.append(f'NET: {local_name} ({full_target} / {full_fb})')
            else:
                canh_bao.append(f'NET {local_name}: dùng {full_fb} thay vì {full_target}')

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

    # 3. Trích xuất DAC bằng Playwright đo diện tích điểm ảnh thực tế (canvas 96x96)
    print('Đang đo diện tích các lớp icon khối bằng Playwright...')
    dac = {}
    bang_ti_le = []

    with sync_playwright() as p:
        try:
            browser = p.chromium.launch(channel='chrome')
        except Exception:
            browser = p.chromium.launch(channel='msedge')
        page = browser.new_page(viewport={'width': 200, 'height': 200})
        page.set_content('<canvas id="c" width="96" height="96"></canvas>')

        def do_diem_anh(svg_str):
            if not svg_str:
                return 0
            return page.evaluate('''s => new Promise(r => {
                const c = document.getElementById('c'), ctx = c.getContext('2d');
                ctx.clearRect(0, 0, 96, 96);
                const img = new Image();
                img.onload = () => {
                    ctx.drawImage(img, 0, 0, 96, 96);
                    const d = ctx.getImageData(0, 0, 96, 96).data;
                    let n = 0;
                    for (let i = 3; i < d.length; i += 4) {
                        if (d[i] > 0) n++;
                    }
                    r(n);
                };
                img.onerror = () => r(0);
                img.src = 'data:image/svg+xml;utf8,' + encodeURIComponent(s);
            })''', svg_str)

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

            raw_body = info['body']
            vb = info['vb']

            s_op, s_non = tach_hai_lop(raw_body, vb)
            cnt_op = do_diem_anh(s_op)
            cnt_non = do_diem_anh(s_non)

            if cnt_op == 0 or cnt_non == 0:
                ratio = 0.0
                lop = ''
                dao = False
            else:
                phu = min(cnt_op, cnt_non)
                chinh = max(cnt_op, cnt_non)
                ratio = phu / (phu + chinh)
                lop = 'l2' if ratio < 0.27 else 'l3'
                dao = (cnt_op > cnt_non)

            final_body = gan_lop_dac(raw_body, lop, dao)
            dac[local_name] = {'vb': vb, 'body': final_body}
            solar_name = SOLAR.get(local_name, '')
            bang_ti_le.append((local_name, solar_name, ratio, lop or 'than'))

        browser.close()

    print('\nBảng tỉ lệ diện tích lớp phụ (Playwright 96x96):')
    print(f"  {'Icon':15s} {'Solar Name':26s} {'Tỉ lệ':7s} {'Lớp phụ'}")
    print('  ' + '-' * 56)
    for loc, sol, r, lop in sorted(bang_ti_le):
        print(f"  {loc:15s} {sol:26s} {r:6.2f}  {lop}")
    print()

    # 4. Trích xuất NET
    net = {}
    icon_da_dao = []
    for local_name, full_target in net_targets.items():
        info = None
        if full_target not in net_res['not_found']:
            info = lay_thong_tin_icon(
                net_res['icons'], net_res['aliases'],
                net_res['width'], net_res['height'], full_target
            )
        if not info and local_name in fallback_needed:
            full_fb = fallback_needed[local_name]
            info = lay_thong_tin_icon(
                fallback_res['icons'], fallback_res['aliases'],
                fallback_res['width'], fallback_res['height'], full_fb
            )
            canh_bao.append(f'NET {local_name}: dùng {full_fb} thay vì {full_target}')

        body = info['body']
        if local_name in THAO_TAC_DEF:
            # Icon thao tác: một màu, bỏ stroke-width="1.5" (CSS .ic định nét 1.5px)
            body = re.sub(r'\s+stroke-width=[\'"]1\.5[\'"]', '', body)
            body = re.sub(r'\s+opacity=[\'"]0?\.\d+[\'"]', '', body)
        else:
            # Icon phân hệ nét: line-duotone, lớp phụ class="l2", bỏ stroke-width="1.5"
            body = re.sub(r'\s+opacity=[\'"]0?\.\d+[\'"]', ' class="l2"', body)
            body = re.sub(r'\s+stroke-width=[\'"]1\.5[\'"]', '', body)

            # Tính hộp bao diện tích của lớp l2 vs lớp không class trong các d
            pts_l2 = []
            pts_non = []
            for t in re.findall(r'<path\b[^>]*>', body):
                dm = re.search(r'\bd=([\'"])(.*?)\1', t)
                if not dm:
                    continue
                d_val = dm.group(2)
                is_l2 = 'class="l2"' in t or "class='l2'" in t
                if is_l2:
                    pts_l2.extend(trich_toa_do_d(d_val))
                else:
                    pts_non.extend(trich_toa_do_d(d_val))

            dt_l2 = dien_tich_hop_bao(pts_l2)
            dt_non = dien_tich_hop_bao(pts_non)

            if (local_name in DAO_TAY) != (dt_l2 > dt_non):
                body = dao_class_l2(body)
                icon_da_dao.append(local_name)

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
        solar_name = SOLAR.get(k, '')
        comment = f' // {solar_name}' if solar_name else ''
        lines.append(f"  '{k}': {{ vb: '{vb_esc}', body: '{body_esc}' }},{comment}")

    lines.append('}\n')

    lines.append('export const NET: Record<string, { vb: string; body: string }> = {')
    for k, v in net.items():
        vb_esc = escape_nhay_don(v['vb'])
        body_esc = escape_nhay_don(v['body'])
        solar_name = all_net_items.get(k, '')
        comment = f' // {solar_name}' if solar_name else ''
        lines.append(f"  '{k}': {{ vb: '{vb_esc}', body: '{body_esc}' }},{comment}")
    lines.append('}\n')

    lines.append('export const NHOM: Record<string, string> = {')
    for k, v in NHOM.items():
        lines.append(f"  '{k}': '{v}',")
    lines.append('}\n')

    lines.append('export const THAO_TAC: string[] = [')
    for k in THAO_TAC:
        lines.append(f"  '{k}',")
    lines.append(']\n')

    DICH.write_text('\n'.join(lines), encoding='utf-8')
    print(f'Đã sinh {DICH.relative_to(WEB)} với {len(dac)} icon khối, {len(net)} icon nét, {len(THAO_TAC)} icon thao tác.')
    if icon_da_dao:
        print(f'Đã đảo {len(icon_da_dao)} icon NET (lớp l2 có hộp bao lớn hơn -> đảo để thân xanh, cam chi tiết):')
        print('  ' + ', '.join(sorted(icon_da_dao)))
    if canh_bao:
        print(f'Cảnh báo ({len(canh_bao)}):')
        for cb in canh_bao:
            print('  -', cb)
    else:
        print('Không có cảnh báo (tất cả icon khối đều có bản bold-duotone).')


if __name__ == '__main__':
    main()
