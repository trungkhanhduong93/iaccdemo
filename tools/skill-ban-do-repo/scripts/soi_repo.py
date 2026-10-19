"""Soi quan hệ file trong repo và gom rác AI, chạy được với mọi repo git.

Lệnh:
  tong-quan          khung project: công nghệ, worktree, vùng code, lõi chung, file lớn, vùng đứng riêng
  lien-quan <file>   file này dùng gì, ai dùng nó, CSS của nó, hay sửa cùng file nào
  vung <thư mục>     thư mục dính với vùng nào, vùng nào bỏ qua được
  don [--chuyen]     phân loại XANH/VÀNG/ĐỎ, ghi báo cáo ra <cha repo>/_can-xoa/; --chuyen mới chuyển file XANH

Không bao giờ xoá file. Chạy trong repo (cwd) hoặc truyền --repo.
"""
import argparse
import json
import os
import re
import subprocess
import sys
import time
from collections import Counter, defaultdict
from fnmatch import fnmatch
from pathlib import Path

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

DUOI_CODE = ('.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.py', '.vue', '.svelte')
DUOI_CHU = DUOI_CODE + ('.css', '.scss', '.html', '.md', '.json', '.yml', '.yaml', '.toml', '.txt', '.ps1', '.sh', '.gs')
THU_MUC_BO = {'.git', 'node_modules', 'dist', 'build', '.venv', 'venv', '.next', '.wrangler', '.turbo', 'coverage'}
NGUONG_LOI = 15  # bị từ ngần này file import trở lên thì là lõi chung, không bung ra

# Rác AI: chỉ xét file CHƯA từng commit
MAU_RAC = ['*.bak', '*.orig', '*.rej', '*.tmp', '*.swp', '*~', '*.log', '*.pyc', '.DS_Store', 'Thumbs.db',
           'test_*.py', 'tmp_*', 'temp_*', 'scratch*', 'spec-*.md', 'done-*.txt', 'hoi-*.txt', 'nghiem-thu*']
THU_MUC_RAC = {'__pycache__', 'shots', 'screenshots', '.pytest_cache'}

# Lõi: không bao giờ vào danh sách xoá
MAU_LOI = ['package.json', 'package-lock.json', 'pnpm-lock.yaml', 'yarn.lock', 'requirements*.txt', 'pyproject.toml',
           '*.config.*', 'tsconfig*.json', '.gitignore', '.gitattributes', '.editorconfig', '.env*', '.github/*',
           'index.html', 'src/main.*', 'src/index.*', 'main.py', 'app.py', 'manage.py', 'Code.gs', 'appsscript.json',
           'AGENTS.md', 'CLAUDE.md', 'GEMINI.md', 'README*', 'CHANGELOG*', '.claude/*', 'wrangler.*', 'vercel.json',
           'render.yaml', 'netlify.toml', 'Dockerfile', 'public/*']


def git(goc, *args):
    r = subprocess.run(['git', '-C', str(goc), *args], capture_output=True, text=True, encoding='utf-8', errors='replace')
    return r.stdout if r.returncode == 0 else ''


def tim_goc(repo_arg):
    goc = git(Path(repo_arg or '.').resolve(), 'rev-parse', '--show-toplevel').strip()
    if not goc:
        sys.exit('Không phải repo git. Chạy trong repo hoặc truyền --repo <đường dẫn>.')
    return Path(goc)


def doc(p):
    try:
        return p.read_text(encoding='utf-8', errors='replace')
    except OSError:
        return ''


def khop(rel, mau_ds):
    ten = rel.rsplit('/', 1)[-1]
    return any(fnmatch(rel, m) or fnmatch(ten, m) for m in mau_ds)


def mau_giu(goc):
    """Mẫu cấm xoá riêng của người dùng: .git/info/ban-do-giu, mỗi dòng một mẫu, chỉ nằm trên máy."""
    f = goc / '.git' / 'info' / 'ban-do-giu'
    return [l.strip() for l in doc(f).splitlines() if l.strip() and not l.startswith('#')] if f.exists() else []


# ── Đồ thị import ──

RE_JS = re.compile(r"""(?:from\s+|import\s*\(\s*|require\s*\(\s*|^\s*import\s+)['"]([^'"]+)['"]""", re.M)
RE_PY = re.compile(r'^\s*(?:from\s+(\.*[\w.]*)\s+import|import\s+([\w.]+))', re.M)
RE_HTML = re.compile(r'''<(?:script|link)[^>]+(?:src|href)=["']([^"'#?]+)''')
RE_CSS_IMPORT = re.compile(r"""@import\s+(?:url\()?['"]([^'"]+)['"]""")


def giai_js(goc, tu_file, dich, ton_tai):
    if dich.startswith('@/'):
        co_so = goc / 'src' / dich[2:]
    elif dich.startswith('.'):
        co_so = tu_file.parent / dich
    else:
        return None
    co_so = Path(os.path.normpath(co_so))
    for duoi in ('', '.ts', '.tsx', '.js', '.jsx', '.mjs', '.vue', '.css', '/index.ts', '/index.tsx', '/index.js'):
        rel = Path(str(co_so) + duoi).relative_to(goc).as_posix() if str(co_so).startswith(str(goc)) else None
        if rel in ton_tai:
            return rel
    return None


def giai_py(goc, tu_file, mod, ton_tai):
    if mod.startswith('.'):
        cham = len(mod) - len(mod.lstrip('.'))
        co_so = tu_file.parent
        for _ in range(cham - 1):
            co_so = co_so.parent
        phan = mod.lstrip('.').split('.') if mod.lstrip('.') else []
        ung_vien = [co_so.joinpath(*phan)] if phan else []
    else:
        phan = mod.split('.')
        ung_vien = [goc.joinpath(*phan), tu_file.parent.joinpath(*phan)]
    for c in ung_vien:
        for p in (Path(str(c) + '.py'), c / '__init__.py'):
            try:
                rel = p.relative_to(goc).as_posix()
            except ValueError:
                continue
            if rel in ton_tai:
                return rel
    return None


def dung_do_thi(goc, ds_file):
    ton_tai = set(ds_file)
    ra, vao = defaultdict(set), defaultdict(set)
    for rel in ds_file:
        if not rel.endswith(DUOI_CODE + ('.css', '.scss', '.html')):
            continue
        p = goc / rel
        txt = doc(p)
        dich_ds = []
        if rel.endswith('.py'):
            for a, b in RE_PY.findall(txt):
                d = giai_py(goc, p, a or b, ton_tai)
                d and dich_ds.append(d)
        elif rel.endswith('.html'):
            dich_ds = [giai_js(goc, p, m if m.startswith(('.', '/')) else './' + m, ton_tai)
                       for m in RE_HTML.findall(txt) if '://' not in m and not m.startswith('/')]
        elif rel.endswith(('.css', '.scss')):
            dich_ds = [giai_js(goc, p, m if m.startswith('.') else './' + m, ton_tai) for m in RE_CSS_IMPORT.findall(txt)]
        else:
            dich_ds = [giai_js(goc, p, m, ton_tai) for m in RE_JS.findall(txt)]
        for d in dich_ds:
            if d and d != rel:
                ra[rel].add(d)
                vao[d].add(rel)
    return ra, vao


def ds_file_git(goc):
    return [l for l in git(goc, 'ls-files').splitlines() if l and not any(x in THU_MUC_BO for x in l.split('/'))]


def vung_cua(rel, sau=2):
    phan = rel.split('/')[:-1]
    return '/'.join(phan[:sau]) or '(gốc)'


# ── CSS ──

RE_CLASS_DN = re.compile(r'\.(-?[A-Za-z_][\w-]*)')
RE_MUC_CSS = re.compile(r'/\*\s*[─═]+\s*(.*?)\s*[─═]*\s*\*/')


def chi_muc_css(goc, ds_file):
    """class -> [(file css, dòng, mục)]"""
    bang = defaultdict(list)
    for rel in ds_file:
        if not rel.endswith(('.css', '.scss')):
            continue
        muc = ''
        for i, l in enumerate(doc(goc / rel).splitlines(), 1):
            m = RE_MUC_CSS.search(l)
            if m:
                muc = m.group(1)
                continue
            if '{' in l:
                for c in set(RE_CLASS_DN.findall(l.split('{')[0])):
                    bang[c].append((rel, i, muc))
    return bang


def class_trong_file(txt):
    """Lấy token class từ className=, class=, cx(...)/clsx(...): mọi chữ dạng a-b trong chuỗi nằm sau các từ đó."""
    tokens = set()
    for m in re.finditer(r'(?:className|class)\s*=\s*(?:\{[^}]*\}|"[^"]*"|\'[^\']*\'|`[^`]*`)', txt):
        tokens.update(re.findall(r'[A-Za-z_][\w-]*', m.group(0)))
    return tokens - {'className', 'class'}


# ── Lệnh lien-quan ──

def lenh_lien_quan(a):
    goc = tim_goc(a.repo)
    ds = ds_file_git(goc)
    rel = Path(a.file).resolve().relative_to(goc).as_posix() if Path(a.file).is_absolute() or (Path.cwd() / a.file).exists() else a.file.replace('\\', '/')
    if rel not in ds:
        sys.exit(f'Không thấy {rel} trong git ls-files.')
    ra, vao = dung_do_thi(goc, ds)
    loi = {f for f, s in vao.items() if len(s) >= NGUONG_LOI}

    def in_ds(nhan, tap):
        thuong = sorted(tap - loi)
        print(f'{nhan} ({len(thuong)}): {", ".join(thuong[:12])}{" …" if len(thuong) > 12 else ""}')

    print(rel + (' [LÕI CHUNG]' if rel in loi else ''))
    in_ds('Dùng', ra[rel])
    tang2 = set().union(*(ra[x] for x in ra[rel] - loi)) - ra[rel] - {rel} if ra[rel] else set()
    print(f'  tầng 2: {len(tang2 - loi)} file')
    in_ds('Được dùng bởi', vao[rel])
    tang2v = set().union(*(vao[x] for x in vao[rel])) - vao[rel] - {rel} if vao[rel] else set()
    print(f'  tầng 2: {len(tang2v)} file')
    lc = sorted((ra[rel] | vao[rel]) & loi)
    if lc:
        print(f'Lõi chung (không cần mở): {", ".join(lc)}')

    if rel.endswith(('.tsx', '.jsx', '.vue', '.html', '.ts', '.js')):
        bang = chi_muc_css(goc, ds)
        muc = Counter()
        for c in class_trong_file(doc(goc / rel)):
            for f, i, m in bang.get(c, [])[:3]:
                muc[(f, m or f'quanh dòng {i}')] += 1
        if muc:
            print('CSS:')
            for (f, m), n in muc.most_common(6):
                print(f'  {f} [{m}] ({n} class)')

    log = git(goc, 'log', '-n', '300', '--name-only', '--format=format:@@')
    commits = [set(x.split()) for x in log.split('@@') if x.strip()]
    commits = [c for c in commits if len(c) <= 30]
    tan_suat = Counter(f for c in commits for f in c)
    on = {f for f, n in tan_suat.items() if n > len(commits) * 0.3}  # file sửa trong >30% commit là nhiễu
    cung = Counter(f for c in commits if rel in c for f in c if f != rel and f not in on and f.endswith(DUOI_CHU))
    if cung:
        print('Hay sửa cùng: ' + ', '.join(f'{f} ({n})' for f, n in cung.most_common(6)))


# ── Lệnh vung ──

def lenh_vung(a):
    goc = tim_goc(a.repo)
    ds = ds_file_git(goc)
    d = a.thu_muc.replace('\\', '/').strip('/')
    trong = [f for f in ds if f.startswith(d + '/')]
    if not trong:
        sys.exit(f'Không có file nào trong {d}/')
    ra, vao = dung_do_thi(goc, ds)
    loi = {f for f, s in vao.items() if len(s) >= NGUONG_LOI}
    sau = d.count('/') + 1
    vn = lambda f: vung_cua(f, sau) if not f.startswith(d + '/') else d
    ra_v, vao_v = Counter(), Counter()
    for f in trong:
        for x in ra[f] - loi:
            vn(x) != d and ra_v.update([vn(x)])
        for x in vao[f]:
            vn(x) != d and vao_v.update([vn(x)])
    print(f'{d}/: {len(trong)} file')
    print('Dùng tới: ' + (', '.join(f'{v} ({n})' for v, n in ra_v.most_common(12)) or 'không'))
    print('Bị dùng bởi: ' + (', '.join(f'{v} ({n})' for v, n in vao_v.most_common(12)) or 'không'))
    lc = sorted({x for f in trong for x in ra[f] & loi})
    if lc:
        print(f'Lõi chung dùng (bỏ qua): {", ".join(lc[:8])}')
    cha = d.rsplit('/', 1)[0] if '/' in d else ''
    anh_em = sorted({vung_cua(f, sau) for f in ds if f.startswith(cha) and f.endswith(DUOI_CODE) and f.count('/') >= sau})
    doc_lap = [v for v in anh_em if v != d and v not in ra_v and v not in vao_v]
    print('Không dính, bỏ qua được: ' + (', '.join(doc_lap) or 'không có'))


# ── Lệnh don ──

def lenh_don(a):
    goc = tim_goc(a.repo)
    giu = mau_giu(goc)
    da_commit = set(ds_file_git(goc))
    bay_gio = time.time()
    xanh, vang, do = [], [], []

    # 1. File chưa commit (kể cả file .gitignore che): rác theo mẫu thì XANH, còn lại VÀNG
    for thu_muc, dirs, files in os.walk(goc):
        dirs[:] = [x for x in dirs if x not in THU_MUC_BO]
        for ten in files:
            p = Path(thu_muc) / ten
            rel = p.relative_to(goc).as_posix()
            if rel in da_commit:
                continue
            if khop(rel, giu) or khop(rel, MAU_LOI):
                do.append((rel, 'chưa commit nhưng khớp mẫu lõi hoặc .git/info/ban-do-giu'))
                continue
            moi = bay_gio - p.stat().st_mtime < 7200
            la_rac = khop(rel, MAU_RAC) or any(x in THU_MUC_RAC for x in rel.split('/')[:-1])
            if la_rac and not moi:
                xanh.append((rel, 'file tạm chưa từng commit'))
            elif la_rac:
                vang.append((rel, 'dang_dung', ''))
            else:
                vang.append((rel, 'chua_commit', ''))

    # 2. File đã commit: lõi thì ĐỎ, không ai dùng thì VÀNG
    ds = sorted(da_commit)
    ra, vao = dung_do_thi(goc, ds)
    chu = {f: doc(goc / f) for f in ds if f.endswith(DUOI_CHU)}
    tat_ca_chu = '\n'.join(chu.values())
    for f in ds:
        ten = f.rsplit('/', 1)[-1]
        goc_ten = ten.rsplit('.', 1)[0]
        if khop(f, giu):
            do.append((f, 'nằm trong .git/info/ban-do-giu'))
        elif khop(f, MAU_LOI):
            do.append((f, 'file cấu hình, đầu vào hoặc luật'))
        elif len(vao[f]) >= NGUONG_LOI:
            do.append((f, f'lõi chung, {len(vao[f])} file import'))
        elif f.endswith(DUOI_CODE + ('.md',)) and not vao[f] and tat_ca_chu.count(goc_ten) <= chu.get(f, '').count(goc_ten):
            vang.append((f, 'khong_ai_dung', ''))

    # 3. Class CSS không file nào dùng, gom theo mục
    bang = chi_muc_css(goc, ds)
    nguon = '\n'.join(t for f, t in chu.items() if not f.endswith(('.css', '.scss')))
    tu_co = set(re.findall(r'[A-Za-z_][\w-]*', nguon))
    # Tiền tố class ghép động: `ds-o-${x}`, 'ds-o-' + x
    tien_to = tuple(set(re.findall(r'([A-Za-z_][\w-]*-)\$\{', nguon)) | set(re.findall(r"""['"]([A-Za-z_][\w-]*-)['"]\s*\+""", nguon)))
    muc_thua = defaultdict(list)
    for c, vt in bang.items():
        if c not in tu_co and not c.startswith(tien_to):
            for f, i, m in vt:
                muc_thua[(f, m or '(không mục)')].append((i, c))
    for (f, m), ds_c in sorted(muc_thua.items()):
        dong = min(i for i, _ in ds_c)
        vang.append((f'{f}:{dong}', 'css', f'mục "{m}": {len(ds_c)} class ({", ".join(sorted({c for _, c in ds_c}))})'))

    # 4. Nhánh local đã gộp vào nhánh chính
    chinh = 'main' if git(goc, 'rev-parse', '--verify', '-q', 'main') else 'master'
    hien_tai = git(goc, 'branch', '--show-current').strip()
    for b in git(goc, 'branch', '--merged', chinh, '--format=%(refname:short)').split():
        if b not in (chinh, hien_tai):
            vang.append((b, 'nhanh', chinh))

    # Ghi báo cáo
    ra_dir = Path(a.ra) if a.ra else goc.parent / '_can-xoa' / goc.name / time.strftime('%Y-%m-%d-%H%M')
    ra_dir.mkdir(parents=True, exist_ok=True)
    da_chuyen, loi_chuyen = [], []
    if a.chuyen:
        kho = ra_dir / '1-XANH-xoa-an-toan'
        for rel, _ in xanh:
            dich = kho / rel
            dich.parent.mkdir(parents=True, exist_ok=True)
            try:
                os.replace(goc / rel, dich)
                da_chuyen.append(rel)
            except OSError as e:
                loi_chuyen.append(f'{rel}: {e}')
        (ra_dir / 'hoan-lai.json').write_text(json.dumps({'goc': str(goc), 'files': da_chuyen}, ensure_ascii=False, indent=1), encoding='utf-8')
        (ra_dir / 'hoan-lai.ps1').write_text(
            '# Đưa mọi file XANH về đúng chỗ cũ trong repo\n'
            '$d = Get-Content -Raw -Encoding UTF8 (Join-Path $PSScriptRoot "hoan-lai.json") | ConvertFrom-Json\n'
            'foreach ($f in $d.files) {\n'
            '  $src = Join-Path (Join-Path $PSScriptRoot "1-XANH-xoa-an-toan") $f\n'
            '  $dst = Join-Path $d.goc $f\n'
            '  New-Item -ItemType Directory -Force (Split-Path $dst) | Out-Null\n'
            '  Move-Item -LiteralPath $src -Destination $dst\n'
            '}\n"Đã hoàn lại $($d.files.Count) file."\n', encoding='utf-8-sig')

    def bang_md(tieu_de, mo_ta, ds_):
        dong = [f'# {tieu_de}', '', mo_ta, '', f'Tổng: {len(ds_)}', '', '| File | Lý do |', '|---|---|']
        return '\n'.join(dong + [f'| `{r}` | {l} |' for r, l in ds_]) + '\n'

    viet_vang(goc, vang, ra_dir)
    (ra_dir / '3-DO-cam-xoa.md').write_text(bang_md(
        'ĐỎ: cấm xoá', 'Xoá một file ở đây là hỏng build, hỏng robot hoặc mất dữ liệu không tạo lại được. '
        'Thêm mẫu cấm xoá riêng vào `.git/info/ban-do-giu` của repo, mỗi dòng một mẫu.', do), encoding='utf-8')
    tom = [f'# Dọn rác repo {goc.name}', '', f'Chạy lúc {time.strftime("%d/%m/%Y %H:%M")}. Repo: `{goc}`', '',
           '| Nhóm | Số | Ở đâu | Làm gì |', '|---|---|---|---|',
           f'| XANH | {len(xanh)} | `1-XANH-xoa-an-toan/` | ' + ('Đã chuyển ra khỏi repo. Xoá cả thư mục là xong. Đổi ý thì chạy `hoan-lai.ps1`. |' if a.chuyen else 'Chưa chuyển. Chạy lại với `--chuyen` để gom vào đây. |'),
           f'| VÀNG | {len(vang)} | `2-VANG-xem-truoc.md` | Còn nằm trong repo. Mỗi nhóm có ghi: là gì, xoá thì sao, nên làm gì. |',
           f'| ĐỎ | {len(do)} | `3-DO-cam-xoa.md` | Không xoá. |', '']
    if xanh:
        tom += ['## Danh sách XANH', ''] + [f'- `{r}`' for r, _ in xanh] + ['']
    if loi_chuyen:
        tom += ['## Không chuyển được (file đang mở?)', ''] + [f'- {x}' for x in loi_chuyen] + ['']
    (ra_dir / 'DOC-TRUOC.md').write_text('\n'.join(tom), encoding='utf-8')

    print(f'XANH {len(xanh)}{" (đã chuyển " + str(len(da_chuyen)) + ")" if a.chuyen else ""}, VÀNG {len(vang)}, ĐỎ {len(do)}')
    print(f'Báo cáo: {ra_dir}')
    if loi_chuyen:
        print(f'{len(loi_chuyen)} file không chuyển được, xem DOC-TRUOC.md')


def la_gi(goc, rel):
    """Dòng đầu có chữ của file, bỏ dấu comment, để người dùng biết file nói về gì."""
    for l in doc(goc / rel).splitlines()[:15]:
        t = l.strip().lstrip('#/*-"\' ').strip()
        if len(t) > 3 and not t.startswith(('import', 'from ', '---', 'name:')):
            return t[:90]
    return '(không đoán được)'


def viet_vang(goc, vang, ra_dir):
    """Báo cáo VÀNG cho người không đọc code: gom theo loại, mỗi loại nói là gì, xoá thì sao, nên làm gì."""
    nhom = defaultdict(list)
    for rel, loai, ct in vang:
        nhom[loai].append((rel, ct))
    md = ['# VÀNG: cần bạn quyết', '',
          'Không mục nào bị xoá hay chuyển đi. Mỗi nhóm ghi: là gì, xoá thì sao, nên làm gì.',
          'Nhóm nào ghi "nhờ agent" thì đừng xoá tay, vì phải chạy build và kiểm giao diện sau khi xoá.', '']
    so = 0
    if nhom['css']:
        so += 1
        tong = sum(int(re.search(r'": (\d+) class', ct).group(1)) for _, ct in nhom['css'])
        md += [f'## {so}. Đoạn CSS thừa: nên dọn, nhờ agent làm', '',
               f'- **Là gì:** {len(nhom["css"])} đoạn trang trí (màu, khoảng cách, cỡ chữ) với {tong} tên class, không còn màn hình nào dùng. Thường là phần còn sót sau khi sửa giao diện.',
               '- **Xoá thì sao:** màn hình không đổi, file CSS nhẹ hơn. Rủi ro thấp: nếu máy đoán sót, một chỗ trên màn hình mất màu hoặc lệch khoảng cách, nhìn là thấy, lấy lại được.',
               f'- **Nên làm:** bảo agent "dọn CSS thừa theo `{ra_dir / "phu-luc-cho-agent.md"}`". Agent xoá trong một commit riêng, chạy build và kiểm giao diện.', '']
    if nhom['nhanh']:
        so += 1
        md += [f'## {so}. Nhánh git đã gộp: xoá an toàn', '',
               f'- **Là gì:** {len(nhom["nhanh"])} nhánh làm việc cũ, nội dung đã nằm hết trong `{nhom["nhanh"][0][1]}`.',
               '- **Xoá thì sao:** không mất code, chỉ gọn danh sách nhánh.',
               '- **Nên làm:** chạy các lệnh dưới trong thư mục repo:', '', '```bash'] + [f'git branch -d {b}' for b, _ in nhom['nhanh']] + ['```', '']
    code = [(r, ct) for r, ct in nhom['khong_ai_dung'] if not r.endswith('.md')]
    tai_lieu = [(r, ct) for r, ct in nhom['khong_ai_dung'] if r.endswith('.md')]
    for ds_, tieu_de, xoa, nen in [
        (code, 'File code không nơi nào gọi tới: nhờ agent kiểm rồi xoá',
         'theo máy đoán thì không hỏng gì. Máy có thể sót chỗ gọi file bằng tên ghép lúc chạy.',
         'bảo agent "xoá file code thừa theo báo cáo dọn rác", agent xoá từng file, chạy build và test, commit riêng.'),
        (tai_lieu, 'Tài liệu không trang nào trỏ tới: thường nên giữ',
         'phần mềm không hỏng, nhưng mất ghi chép. Xoá bằng `git rm` thì vẫn lấy lại được từ lịch sử git.',
         'đọc cột "Nói về" bên dưới. Hết giá trị thì xoá, không chắc thì giữ.')]:
        if not ds_:
            continue
        so += 1
        md += [f'## {so}. {tieu_de}', '', f'- **Xoá thì sao:** {xoa}', f'- **Nên làm:** {nen}', '',
               '| File | Người sửa cuối, ngày | Nói về |', '|---|---|---|']
        for r, _ in ds_:
            ai = git(goc, 'log', '-1', '--format=%an, %ad', '--date=format:%d/%m/%Y', '--', r).strip() or '?'
            md.append(f'| `{r}` | {ai} | {la_gi(goc, r)} |')
        md.append('')
    chua = nhom['chua_commit'] + nhom['dang_dung']
    if chua:
        so += 1
        md += [f'## {so}. File chưa lưu vào git: hỏi người tạo trước', '',
               '- **Là gì:** file mới tạo, chưa commit. Có thể là việc ai đó đang làm dở.',
               '- **Xoá thì sao:** mất hẳn, không lấy lại được.',
               '- **Nên làm:** biết của ai thì hỏi người đó. Không biết thì giữ.', '',
               '| File | Sửa lần cuối | Nói về |', '|---|---|---|']
        for r, _ in chua:
            md.append(f'| `{r}` | {time.strftime("%d/%m/%Y %H:%M", time.localtime((goc / r).stat().st_mtime))} | {la_gi(goc, r)} |')
        md.append('')
    # Gom các dòng "- **Là gì:** …" liền nhau thành bảng 2 cột cho dễ đọc
    ra_md, truoc = [], False
    for l in md:
        m = re.match(r'- \*\*(.+?):\*\* (.*)', l)
        if m and not truoc:
            ra_md += ['| | |', '|---|---|']
        ra_md.append(f'| {m.group(1)} | {m.group(2)} |' if m else l)
        truoc = bool(m)
    (ra_dir / '2-VANG-xem-truoc.md').write_text('\n'.join(ra_md), encoding='utf-8')
    if nhom['css']:
        (ra_dir / 'phu-luc-cho-agent.md').write_text(
            '# Phụ lục cho agent: class CSS không file nào dùng\n\n'
            'Mỗi dòng: vị trí mục, tên mục, các class thừa. Chỉ xoá rule mà MỌI selector đều thuộc class thừa. '
            'Grep lại từng class trong src (ranh giới từ, cả chuỗi ghép `tien-to-${x}`) trước khi xoá. '
            'BẮT BUỘC làm đủ 4 lớp ở mục 7 trong SKILL.md của skill ban-do-repo: giao với CSS coverage của Playwright, '
            'so ảnh trước sau, so getComputedStyle, xoá tối đa 10 mục một commit. '
            'Không xoá rule :hover, :focus, :active, ::before, ::after, @media print, rule hộp thoại, menu xổ, toast.\n\n'
            + '\n'.join(f'- `{r}` {ct}' for r, ct in nhom['css']) + '\n', encoding='utf-8')


# ── Lệnh tong-quan ──

def mo_ta_code(goc, rel):
    """Comment đầu file, không có thì trả rỗng."""
    for l in doc(goc / rel).splitlines()[:8]:
        t = l.strip()
        if not t or t.startswith('#!') or 'coding:' in t:
            continue
        if t.startswith(('//', '/*', '*', '#', '"""', "'''", '<!--')):
            t = t.lstrip('/*#"\'<!- ').strip()
            if len(t) > 3:
                return t[:60]
            continue
        return ''
    return ''


def lenh_tong_quan(a):
    goc = tim_goc(a.repo)
    ds = ds_file_git(goc)
    print(f'{goc.name} | nhánh {git(goc, "branch", "--show-current").strip()} | {git(goc, "log", "-1", "--format=%h %ad %s", "--date=format:%d/%m/%Y").strip()[:90]}')
    wt = [l.split()[0] + ' [' + l.split('[')[-1] for l in git(goc, 'worktree', 'list').splitlines() if '[' in l]
    if len(wt) > 1:
        print('Worktree: ' + ', '.join(wt))

    # Công nghệ: lấy từ file khai báo thư viện
    cn = []
    pk = goc / 'package.json'
    if pk.exists():
        try:
            j = json.loads(doc(pk))
            dep = {**j.get('dependencies', {}), **j.get('devDependencies', {})}
            cn += [f'{k} {v.lstrip("^~")}' for k, v in dep.items() if k in (
                'react', 'vue', 'svelte', 'next', 'vite', 'typescript', 'tailwindcss', 'express', 'electron', '@supabase/supabase-js', 'playwright')]
            cn.append('scripts: ' + ', '.join(j.get('scripts', {})))
        except ValueError:
            pass
    for f, ten in (('requirements.txt', 'python'), ('pyproject.toml', 'python'), ('appsscript.json', 'Google Apps Script'), ('Dockerfile', 'docker')):
        if f in ds:
            cn.append(ten)
    print('Công nghệ: ' + ('; '.join(cn) or 'không đoán được'))
    luat = [f for f in ('AGENTS.md', 'CLAUDE.md', 'GEMINI.md', 'tools/ban_do.py', 'docs/KIEN-TRUC.md') if f in ds]
    print('Đọc thêm: ' + (', '.join(luat) or 'không có file luật'))

    ra, vao = dung_do_thi(goc, ds)
    loi = sorted(((len(s), f) for f, s in vao.items() if len(s) >= NGUONG_LOI), reverse=True)
    vn = lambda f: vung_cua(f, 3 if f.startswith('src/') else 2)
    vung_ds = defaultdict(list)
    for f in ds:
        if f.endswith(DUOI_CODE):
            vung_ds[vn(f)].append(f)
    tap_loi = {f for _, f in loi}
    canh = defaultdict(set)
    for f, dich in ra.items():
        for d in dich - tap_loi:
            if vn(d) != vn(f):
                canh[vn(f)].add(vn(d))
                canh[vn(d)].add(vn(f))
    print(f'Vùng code ({len(vung_ds)}):')
    for v, fs in sorted(vung_ds.items(), key=lambda x: -len(x[1]))[:25]:
        chinh = next((f for f in fs if f.rsplit('/', 1)[-1].startswith(('index.', '__init__.'))), None)
        kb = sum((goc / f).stat().st_size for f in fs) // 1024
        mt = mo_ta_code(goc, chinh) if chinh else ''
        print(f'  {v} ({len(fs)} file, {kb} KB, dính {len(canh[v])} vùng){": " + mt if mt else ""}')
    if len(vung_ds) > 25:
        print(f'  … còn {len(vung_ds) - 25} vùng nhỏ')
    print('Lõi chung (đừng mở trừ khi sửa chính nó): ' + (', '.join(f'{f} ({n})' for n, f in loi[:8]) or 'không có'))
    lon = sorted(((goc / f).stat().st_size, f) for f in ds if f.endswith(DUOI_CHU) and (goc / f).stat().st_size > 50 * 1024)[::-1]
    if lon:
        print('File lớn (chỉ đọc qua dàn ý): ' + ', '.join(f'{f} {n // 1024}KB' for n, f in lon[:8]))
    co_loi = {vn(f) for f in tap_loi}
    doc_lap = sorted(v for v in vung_ds if not canh[v] and v not in co_loi and v != '(gốc)')
    if doc_lap:
        print('Vùng đứng riêng, không dính vùng nào: ' + ', '.join(doc_lap))


def main():
    p = argparse.ArgumentParser(description='Soi quan hệ file và gom rác AI trong repo. Không xoá file nào.')
    p.add_argument('--repo', help='Đường dẫn repo, mặc định thư mục hiện tại')
    sub = p.add_subparsers(dest='lenh', required=True)
    s = sub.add_parser('tong-quan', help='Khung project khoảng 40 dòng: công nghệ, vùng code, lõi chung, file lớn')
    s.set_defaults(ham=lenh_tong_quan)
    s = sub.add_parser('lien-quan', help='File dùng gì, ai dùng nó, CSS, hay sửa cùng')
    s.add_argument('file')
    s.set_defaults(ham=lenh_lien_quan)
    s = sub.add_parser('vung', help='Thư mục dính vùng nào, vùng nào bỏ qua được')
    s.add_argument('thu_muc')
    s.set_defaults(ham=lenh_vung)
    s = sub.add_parser('don', help='Phân loại XANH/VÀNG/ĐỎ, ghi báo cáo ra <cha repo>/_can-xoa/')
    s.add_argument('--chuyen', action='store_true', help='Chuyển file XANH vào thư mục báo cáo')
    s.add_argument('--ra', help='Thư mục báo cáo khác mặc định')
    s.set_defaults(ham=lenh_don)
    a = p.parse_args()
    a.ham(a)


if __name__ == '__main__':
    main()
