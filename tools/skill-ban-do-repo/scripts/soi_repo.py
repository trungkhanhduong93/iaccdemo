"""Soi quan hệ file trong repo và gom rác AI, chạy được với mọi repo git.

Lệnh:
  hieu               nạp một lượt là nắm repo (gồm tong-quan); chạy đầu phiên
  viec <mô tả>       gom ngữ cảnh cho một việc, dán thẳng vào spec giao agent khác
  tong-quan          khung project: công nghệ, worktree, vùng code, lõi chung, file lớn, vùng đứng riêng
  lien-quan <file>   file này dùng gì, ai dùng nó, CSS của nó, hay sửa cùng file nào
  vung <thư mục>     thư mục dính với vùng nào, vùng nào bỏ qua được
  don [--chuyen]     phân loại XANH/VÀNG/ĐỎ, ghi báo cáo ra <cha repo>/_can-xoa/; --chuyen mới chuyển file XANH
  explain <tên>      hàm, màn, kiểu: định nghĩa ở đâu, file nào dùng, nhãn [import]/[chữ] (T911)
  ma <mã>            mã việc, QD (T907, QD21): code, CSS, tài liệu, commit nào nhắc tới (T911)
  do [-n 20]         đo viec trên các commit gần nhất: độ trúng top 3, top 6, thời gian (T911)

Không bao giờ xoá file. Chạy trong repo (cwd) hoặc truyền --repo.
Kết quả đọc file lưu ở .git/soi-repo-cache.pickle, lần sau chỉ đọc lại file đã đổi (T911).
"""
import argparse
import hashlib
import json
import os
import pickle
import posixpath
import re
import subprocess
import sys
import time
from collections import Counter, defaultdict
from fnmatch import fnmatch
from pathlib import Path

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')
    sys.stderr.reconfigure(encoding='utf-8')

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


# ── Cache (T911): kết quả đọc từng file, khoá theo mtime + cỡ file, nằm trong .git nên không bị commit ──

PHIEN_BAN_CACHE = 1   # đổi cách tính một loại kết quả thì tăng số này


class Kho:
    def __init__(self):
        self.goc = self.duong = None
        self.du_lieu, self.ban = {}, False

    def mo(self, goc):
        if self.goc == goc:
            return
        self.goc = goc
        gp = git(goc, 'rev-parse', '--git-path', 'soi-repo-cache.pickle').strip()
        self.duong = (goc / gp) if gp else None
        try:
            d = pickle.loads(self.duong.read_bytes())
            self.du_lieu = d['f'] if d.get('v') == PHIEN_BAN_CACHE else {}
        except Exception:   # chưa có cache hoặc cache hỏng: dựng lại
            self.du_lieu = {}

    def lay(self, p, loai, ham):
        """ham(text) -> kết quả; chỉ đọc file khi file đổi từ lần trước."""
        try:
            st = p.stat()
        except OSError:
            return ham('')
        k, khoa = str(p), (st.st_mtime_ns, st.st_size)
        o = self.du_lieu.get(k)
        if not o or o[0] != khoa:
            o = self.du_lieu[k] = (khoa, {})
        if loai not in o[1]:
            o[1][loai] = ham(doc(p))
            self.ban = True
        return o[1][loai]

    def luu(self):
        if self.ban and self.duong:
            tam = self.duong.with_suffix('.tmp')
            tam.write_bytes(pickle.dumps({'v': PHIEN_BAN_CACHE, 'f': self.du_lieu}, protocol=pickle.HIGHEST_PROTOCOL))
            os.replace(tam, self.duong)


KHO = Kho()


def dau_dung(goc):
    """Ghi lúc vừa chạy bản đồ ở repo này; hook nhac_ban_do.py đọc để biết agent đã dùng bản đồ chưa."""
    try:
        d = Path.home() / '.claude' / '.soi-repo-dung'
        d.mkdir(parents=True, exist_ok=True)
        (d / hashlib.md5(goc.resolve().as_posix().lower().encode()).hexdigest()).write_text(str(time.time()))
    except OSError:
        pass


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


def giai_js(tu_rel, dich, ton_tai):
    """tu_rel, kết quả: đường dẫn posix tính từ gốc repo."""
    if dich.startswith('@/'):
        co_so = 'src/' + dich[2:]
    elif dich.startswith('.'):
        co_so = posixpath.join(posixpath.dirname(tu_rel), dich)
    else:
        return None
    co_so = posixpath.normpath(co_so)
    if co_so.startswith('..'):
        return None
    for duoi in ('', '.ts', '.tsx', '.js', '.jsx', '.mjs', '.vue', '.css', '/index.ts', '/index.tsx', '/index.js'):
        if co_so + duoi in ton_tai:
            return co_so + duoi
    return None


def giai_py(tu_rel, mod, ton_tai):
    thu_muc = posixpath.dirname(tu_rel)
    if mod.startswith('.'):
        cham = len(mod) - len(mod.lstrip('.'))
        co_so = thu_muc
        for _ in range(cham - 1):
            co_so = posixpath.dirname(co_so)
        phan = mod.lstrip('.').replace('.', '/')
        ung_vien = [posixpath.join(co_so, phan)] if phan else []
    else:
        phan = mod.replace('.', '/')
        ung_vien = [phan, posixpath.join(thu_muc, phan)]
    for c in ung_vien:
        c = posixpath.normpath(c)
        for p in (c + '.py', c + '/__init__.py'):
            if p in ton_tai:
                return p
    return None


def import_tho(rel, txt):
    """Đích import viết trong file, chưa giải ra đường dẫn: [(kiểu, chuỗi)]."""
    if rel.endswith('.py'):
        return [('py', a or b) for a, b in RE_PY.findall(txt)]
    if rel.endswith('.html'):
        return [('js', m if m.startswith(('.', '/')) else './' + m) for m in RE_HTML.findall(txt) if '://' not in m and not m.startswith('/')]
    if rel.endswith(('.css', '.scss')):
        return [('js', m if m.startswith('.') else './' + m) for m in RE_CSS_IMPORT.findall(txt)]
    return [('js', m) for m in RE_JS.findall(txt)]


_DO_THI = {}


def dung_do_thi(goc, ds_file):
    khoa = (str(goc), len(ds_file))
    if khoa in _DO_THI:
        return _DO_THI[khoa]
    KHO.mo(goc)
    ton_tai = set(ds_file)
    ra, vao = defaultdict(set), defaultdict(set)
    for rel in ds_file:
        if not rel.endswith(DUOI_CODE + ('.css', '.scss', '.html')):
            continue
        for kieu, m in KHO.lay(goc / rel, 'imp', lambda t, r=rel: import_tho(r, t)):
            d = giai_py(rel, m, ton_tai) if kieu == 'py' else giai_js(rel, m, ton_tai)
            if d and d != rel:
                ra[rel].add(d)
                vao[d].add(rel)
    _DO_THI[khoa] = ra, vao
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
    KHO.mo(goc)
    for rel in ds_file:
        if rel.endswith(('.css', '.scss')):
            for c, i, muc in KHO.lay(goc / rel, 'css_cls', class_css):
                bang[c].append((rel, i, muc))
    return bang


def class_css(txt):
    kq, muc = [], ''
    for i, l in enumerate(txt.splitlines(), 1):
        m = RE_MUC_CSS.search(l)
        if m:
            muc = m.group(1)
            continue
        if '{' in l:
            kq += [(c, i, muc) for c in set(RE_CLASS_DN.findall(l.split('{')[0]))]
    return kq


def muc_css(txt):
    """[(dòng, tiêu đề mục)] của file CSS."""
    return [(i, m.group(1)) for i, l in enumerate(txt.splitlines(), 1) for m in [RE_MUC_CSS.search(l)] if m]


# Mã việc, quyết định nhắc trong code, comment: T907, QD21, ADR-3, RFC12, kiểu Jira ABC-123 (T911)
RE_MA = re.compile(r'\b(?:T|QD|ADR|RFC)-?\d{2,4}\b|\b[A-Z]{2,6}-\d{1,5}\b')


def goi_y_file(rel, ds):
    """File gần đúng khi gõ sai đường dẫn: cùng tên file trước, rồi tên giống."""
    import difflib
    ten = rel.rsplit('/', 1)[-1].lower()
    cung = [f for f in ds if f.rsplit('/', 1)[-1].lower() == ten]
    return cung[:5] or difflib.get_close_matches(rel, ds, n=5, cutoff=0.5)


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
        gy = goi_y_file(rel, ds)
        sys.exit(f'Không thấy {rel} trong git ls-files.' + (' Ý bạn là: ' + ', '.join(gy) if gy else ''))
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

    ma = Counter(RE_MA.findall(doc(goc / rel)))
    if ma:
        print('Mã việc, QD nhắc trong file (tra bằng: ma <mã>): ' + ', '.join(f'{m} ({n})' for m, n in ma.most_common(10)))

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
    KHO.mo(goc)
    return KHO.lay(goc / rel, 'mo_ta', mo_ta_txt)


def mo_ta_txt(txt):
    """Comment đầu file, không có thì trả rỗng."""
    for l in txt.splitlines()[:8]:
        t = l.strip()
        if not t or t.startswith('#!') or 'coding:' in t:
            continue
        if t.startswith(('//', '/*', '*', '#', '"""', "'''", '<!--')):
            t = t.lstrip('/*#"\'<!- ').strip()
            if len(t) > 3 and sum(c.isalpha() for c in t) > 3:   # bỏ dòng kẻ ====, ----
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
    if not cn:   # không có file khai báo thư viện: đoán theo đuôi file nhiều nhất
        duoi = Counter(f.rsplit('.', 1)[-1] for f in ds if '.' in f.rsplit('/', 1)[-1] and f.endswith(DUOI_CHU))
        cn = [f'{d} ({n} file)' for d, n in duoi.most_common(5)]
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


# ── Lệnh hieu, viec (T901): nạp một lượt là nắm repo, gom ngữ cảnh cho một việc ──

import unicodedata

class _BangBoDau(dict):
    """Bảng cho str.translate: mỗi ký tự tính một lần rồi nhớ, nhanh hơn chuẩn hoá NFD từng dòng (T911)."""
    def __missing__(self, k):
        c = chr(k)
        v = 'd' if c == 'đ' else ''.join(x for x in unicodedata.normalize('NFD', c) if unicodedata.category(x) != 'Mn')
        self[k] = v
        return v


_BANG_BO_DAU = _BangBoDau()
RE_CAMEL = re.compile(r'([a-z0-9])([A-Z])')
RE_KHONG_CHU = re.compile(r'[^0-9a-z]+')


def bo_dau(t):
    return t.lower().translate(_BANG_BO_DAU)


def tach_van(txt):
    """Mỗi dòng thành ' tu tu ... ': tách camelCase, bỏ dấu, chữ thường; dùng để khớp nguyên từ."""
    return [' ' + RE_KHONG_CHU.sub(' ', l) + ' ' for l in bo_dau(RE_CAMEL.sub(r'\1 \2', txt)).splitlines()]


TU_BO = set('cho cua the khi thi la va voi cac mot nhung duoc trong tren duoi lai nay do de ma se da dang con khong co nhu lam them sua bo '
            'phai can nua roi luon giup vao ra tu den theo hay hoac neu vay cung moi tat ca nao gi sao bang cai man hinh'.split())
DUOI_DOC = ('.md',)
THU_MUC_NHAT_KY = ('nhat-ky', 'luu-tru', 'archive', 'changelog')


def tu_khoa(mo_ta):
    ds = [w for w in re.split(r'[^0-9a-z]+', bo_dau(' '.join(mo_ta))) if len(w) >= 3 and w not in TU_BO]
    return list(dict.fromkeys(ds))


def can_khop(kw):
    return 1 if len(kw) <= 2 else 2


def dem_khop(dong_bd, kw):
    return sum(1 for w in kw if w in dong_bd)


def tieu_de_md(goc, rel):
    KHO.mo(goc)
    return KHO.lay(goc / rel, 'tde', lambda t: [(i, l.strip()) for i, l in enumerate(t.splitlines(), 1) if re.match(r'#{2,3} ', l)])


def lenh_kiem(goc, ds):
    ds_lenh = []
    pk = goc / 'package.json'
    if pk.exists():
        try:
            sc = json.loads(doc(pk)).get('scripts', {})
            ds_lenh += [f'npm run {k}' for k in sc if re.search(r'type|build|test|lint|check', k)]
        except ValueError:
            pass
    ds_lenh += [f'python {f}' for f in ds if re.match(r'(tools|scripts)/[^/]*(kiem|check|test)[^/]*\.py$', f)][:3]
    if any(f.startswith(('tests/', 'test/')) for f in ds) and (goc / 'pyproject.toml').exists():
        ds_lenh.append('pytest')
    return ds_lenh


def lenh_hieu(a):
    goc = tim_goc(a.repo)
    ds = ds_file_git(goc)
    lenh_tong_quan(a)
    ra, vao = dung_do_thi(goc, ds)

    hay = sorted(((len(s), f) for f, s in vao.items() if len(s) >= 5 and not f.endswith(('.css', '.json'))), reverse=True)[:14]
    if hay:
        print('Thành phần dùng nhiều (file: số file dùng, mô tả):')
    for n, f in hay:
        mt = mo_ta_code(goc, f)
        print(f'  {f} ({n}){": " + mt if mt else ""}')

    for f in ('AGENTS.md', 'CLAUDE.md', 'GEMINI.md'):
        if f in ds:
            td = [f'{t.lstrip("# ")}:{i}' for i, t in tieu_de_md(goc, f) if t.startswith('## ')]
            if td:
                print(f'Luật {f}: ' + ', '.join(td)[:400])
    tai_lieu = [f for f in ds if f.endswith(DUOI_DOC) and '/' in f and not any(x in f.lower() for x in THU_MUC_NHAT_KY)]
    nhat_ky = [f for f in ds if f.endswith(DUOI_DOC) and any(x in f.lower() for x in THU_MUC_NHAT_KY)]
    if tai_lieu:
        print('Tài liệu (mục mới nhất ở cuối):')
        for f in sorted(tai_lieu)[:15]:
            td = [t.lstrip('# ') for _, t in tieu_de_md(goc, f) if t.startswith('## ')]
            kb = (goc / f).stat().st_size // 1024
            print(f'  {f} {kb}KB, {len(td)} mục' + (f'; cuối: {" | ".join(x[:50] for x in td[-3:])}' if len(td) > 6 else (': ' + ', '.join(x[:40] for x in td) if td else '')))
    if nhat_ky:
        print(f'Nhật ký, lưu trữ: {len(nhat_ky)} file, chỉ mở khi cần lịch sử')

    log = git(goc, 'log', '-n', '300', '--name-only', '--format=format:@@')
    tan = Counter(f for c in log.split('@@') for f in set(c.split()) if f.endswith(DUOI_CODE + ('.css',)))
    if tan:
        print('Hay sửa nhất (300 commit): ' + ', '.join(f'{f} ({n})' for f, n in tan.most_common(8)))
    print('Commit gần: ' + ' | '.join(l[:70] for l in git(goc, 'log', '-5', '--format=%h %s').splitlines()))
    kiem = lenh_kiem(goc, ds)
    if kiem:
        print('Lệnh kiểm: ' + ', '.join(kiem))

    bd = goc / 'tools' / 'ban_do.py'
    if bd.exists() and 'hieu-them' in doc(bd):
        print('── Riêng repo (tools/ban_do.py hieu-them) ──')
        r = subprocess.run([sys.executable, str(bd), 'hieu-them'], capture_output=True, text=True, encoding='utf-8', errors='replace', cwd=goc)
        print(r.stdout.rstrip())
    print('Tiếp: viec "<mô tả việc>" gom file:dòng, bẫy, quyết định, việc cũ, skill cho một việc; lien-quan <file> trước khi sửa file chưa rõ.')


def skill_goi_y(kw):
    nha = Path.home()
    thu_muc = [nha / '.claude' / 'skills', nha / '.gemini' / 'config' / 'skills']
    diem = {}
    for td in thu_muc:
        if not td.exists():
            continue
        for sk in td.glob('*/SKILL.md'):
            m = KHO.lay(sk, 'mo_ta_skill', lambda t: (re.findall(r'^description:\s*(.+)$', t[:1500], re.M) or [''])[0])
            if not m:
                continue
            n = dem_khop(bo_dau(m), kw)
            if n >= can_khop(kw):
                diem[sk.parent.name] = max(n, diem.get(sk.parent.name, 0))
    return [k for k, _ in sorted(diem.items(), key=lambda x: -x[1])[:3]]


RE_KB = re.compile(r'^\s*(export\s+)?(default\s+)?(async\s+)?(function|const|class|interface|type|def)\s|\b(ten|slug|title|label|t|n):\s')


def xep_hang(goc, ds, mo_ta):
    """Chấm điểm file cho một mô tả việc. Trả (từ khoá, Counter điểm, {file: [(điểm, dòng, là tên)]})."""
    # Khớp nguyên từ (tách camelCase), từ hiếm nặng hơn (idf), cụm từ liền nhau được thưởng,
    # mỗi file chỉ cộng 5 dòng tốt nhất để file to không thắng nhờ số lượng
    import math
    KHO.mo(goc)
    kw = tu_khoa(mo_ta)
    tho = [w for w in re.split(r'[^0-9a-z]+', bo_dau(' '.join(mo_ta))) if len(w) >= 2]   # giữ cả từ ngắn, từ bỏ để ghép cụm
    cum = [tuple(tho[i:i + n]) for n in (3, 2) for i in range(len(tho) - n + 1) if any(w in kw for w in tho[i:i + n])]
    van, toan_ds = {}, {}
    for f in ds:
        if f.endswith(DUOI_CODE):
            p = goc / f
            if p.exists() and p.stat().st_size <= 400 * 1024:
                van[f] = KHO.lay(p, 'tach', tach_van)
                toan_ds[f] = ''.join(van[f])
    df = Counter()
    for f, toan in toan_ds.items():
        df.update(w for w in kw if f' {w} ' in toan)
    idf = {w: math.log((len(van) + 1) / (df[w] + 1)) + 0.1 for w in kw}

    def cham(t):
        d = sum(idf[w] for w in kw if f' {w} ' in t)
        d += sum(len(c) * sum(idf.get(w, 0.5) for w in c) for c in cum if f' {" ".join(c)} ' in t or f' {"".join(c)} ' in t)
        return d

    diem, dong_tot = Counter(), {}
    for f, ls in van.items():
        if not any(f' {w} ' in toan_ds[f] for w in kw):
            continue
        ds_dong = []
        for i, t in enumerate(ls, 1):
            if any(f' {w} ' in t for w in kw):
                d = cham(t)
                la_ten = bool(RE_KB.search(t.replace('  ', ' ')) or ' ten ' in t or ' slug ' in t)
                ds_dong.append((d * 1.5 if la_ten else d, i, la_ten))
        ds_dong.sort(reverse=True)
        d = sum(x for x, _, _ in ds_dong[:5]) + 3 * cham(tach_van(f.replace('/', ' '))[0])
        diem[f] = round(d, 1)
        dong_tot[f] = ds_dong[:3]
    return kw, diem, dong_tot


def lenh_viec(a):
    goc = tim_goc(a.repo)
    ds = ds_file_git(goc)
    kw, diem, dong_tot = xep_hang(goc, ds, a.mo_ta)
    if not kw:
        sys.exit('Mô tả chưa có từ khoá nào dài từ 3 chữ cái.')
    print(f'Từ khoá: {" ".join(kw)}')
    print('Nhãn: [tên] khớp chỗ khai báo hàm, màn, nhãn; [chữ] chỉ khớp chữ, tự kiểm trước khi sửa; '
          '[import] nối thật qua import; [lịch sử] suy từ git log.')
    can = can_khop(kw)
    top = [f for f, _ in diem.most_common(6)]
    print('Chỗ sửa (điểm cao trước):')
    for f in top:
        mt = mo_ta_code(goc, f)
        print(f'  {f} ({diem[f]}){" — " + mt if mt else ""}')
        ls = doc(goc / f).splitlines()
        for _, i, la_ten in dong_tot[f]:
            print(f'    :{i} {"[tên]" if la_ten else "[chữ]"} {ls[i - 1].strip()[:100]}')

    if top:
        ra, vao = dung_do_thi(goc, ds)
        loi = {f for f, s in vao.items() if len(s) >= NGUONG_LOI}
        print('Dính kèm [import]:')
        for f in top[:3]:
            goi = sorted(vao[f] - loi)
            print(f'  {f}: {len(vao[f])} file dùng' + (f' ({", ".join(goi[:4])}{" …" if len(goi) > 4 else ""})' if goi else '') + (' [LÕI CHUNG]' if f in loi else ''))

    css = []
    for f in ds:
        if f.endswith(('.css', '.scss')):
            for i, m in KHO.lay(goc / f, 'css_muc', muc_css):
                n = dem_khop(bo_dau(m), kw)
                if n >= can:
                    css.append((n, f'{f}:{i} {m[:90]}'))
    if css:
        print('Mục CSS:')
        for _, x in sorted(css, key=lambda x: -x[0])[:5]:
            print('  ' + x)

    tl = []
    for f in ds:
        if f.endswith(DUOI_DOC) and not any(x in f.lower() for x in THU_MUC_NHAT_KY):
            for i, t in tieu_de_md(goc, f):
                n = dem_khop(bo_dau(t), kw)
                if n >= can:
                    tl.append((n, f'{f}:{i} {t[:100]}'))
    if tl:
        print('Quyết định, bẫy, tài liệu:')
        for _, x in sorted(tl, key=lambda x: -x[0])[:7]:
            print('  ' + x)

    # Một lệnh git log thay cho git show từng commit
    cu = []
    for khoi in git(goc, 'log', '-n', '800', '--format=@@%h %s', '--name-only').split('@@')[1:]:
        dong = khoi.strip().splitlines()
        if dong and dem_khop(bo_dau(dong[0]), kw) >= can:
            cu.append((dong[0], dong[1:]))
    if cu:
        print('Việc cũ giống [lịch sử]:')
        tep = Counter()
        for l, fs in cu[:6]:
            print('  ' + l[:110])
            tep.update(f for f in fs if f.endswith(DUOI_CODE + ('.css',)))
        if tep:
            print('  File các việc đó hay sửa: ' + ', '.join(f'{f} ({n})' for f, n in tep.most_common(5)))

    sk = skill_goi_y(kw)
    print('Skill nên nạp: ponytail' + (', ' + ', '.join(sk) if sk else '') + (', ban-do-repo' if (goc / 'tools' / 'ban_do.py').exists() and 'ban-do-repo' not in sk else ''))
    kiem = lenh_kiem(goc, ds)
    if kiem:
        print('Nghiệm thu: ' + ', '.join(kiem))
    if top:
        print(f'Trước khi đổi tên, tham số một hàm hay thành phần: explain <tên> để thấy mọi chỗ gọi.')


# ── Lệnh explain, ma, do (T911, học từ graphify: tra cấp ký hiệu, nối mã việc với code, tự đo độ trúng) ──

DUOI_GREP = [f'*{d}' for d in DUOI_CODE]


def git_grep(goc, *args, duoi=DUOI_GREP):
    """[(file, dòng, nội dung)] từ git grep; nhanh vì git đọc file bằng C."""
    kq = []
    for l in git(goc, 'grep', '-n', '-I', '--no-color', *args, '--', *duoi).splitlines():
        p = l.split(':', 2)
        if len(p) == 3 and p[1].isdigit():
            kq.append((p[0], int(p[1]), p[2].strip()))
    return kq


def lenh_explain(a):
    goc = tim_goc(a.repo)
    ds = ds_file_git(goc)
    ten = a.ten
    if not re.fullmatch(r'[A-Za-z_$][\w$]*', ten):
        sys.exit('Tên chỉ gồm chữ, số, _ (vd ChungTuForm, keoNvlCb).')
    mau_dn = rf'(function|const|let|var|class|interface|type|enum|def)\s+{ten}\b'
    dinh_nghia = [x for x in git_grep(goc, '-E', mau_dn) if x[0] in set(ds)]
    file_ten = [f for f in ds if f.rsplit('/', 1)[-1].rsplit('.', 1)[0] == ten and f.endswith(DUOI_CODE)]
    if not dinh_nghia and not file_ten:
        gan = git_grep(goc, '-i', '-o', '-E', rf'(function|const|class|interface|type|def)\s+\w*{ten}\w*')
        import difflib
        ten_file = {f.rsplit('/', 1)[-1].rsplit('.', 1)[0] for f in ds if f.endswith(DUOI_CODE)}
        ten_gan = list(dict.fromkeys([x[2].split()[-1] for x in gan] + difflib.get_close_matches(ten, ten_file, n=5, cutoff=0.7)))[:8]
        sys.exit(f'Không thấy định nghĩa {ten}.' + (' Tên gần giống: ' + ', '.join(ten_gan) if ten_gan else ' Thử tim <từ> trong tools/ban_do.py hoặc viec "<mô tả>".'))
    file_dn = list(dict.fromkeys([f for f, _, _ in dinh_nghia] + file_ten))
    print(f'{ten}')
    for f, i, t in dinh_nghia[:5]:
        print(f'  Định nghĩa: {f}:{i} {t[:100]}')
    for f in file_ten:
        if f not in {x[0] for x in dinh_nghia}:
            print(f'  File cùng tên: {f}')
    mt = mo_ta_code(goc, file_dn[0])
    if mt:
        print(f'  Mô tả: {mt}')

    ra, vao = dung_do_thi(goc, ds)
    nguoi_import = set().union(*(vao[f] for f in file_dn))
    dung = defaultdict(list)
    for f, i, t in git_grep(goc, '-w', ten):
        if (f, i) not in {(x[0], x[1]) for x in dinh_nghia} and not re.match(r'\s*(import|from)\b', t):
            dung[f].append(i)
    co_import = sorted((f for f in dung if f in nguoi_import), key=lambda f: -len(dung[f]))
    chu = sorted((f for f in dung if f not in nguoi_import and f not in file_dn), key=lambda f: -len(dung[f]))
    trong = sorted(f for f in dung if f in file_dn)
    print(f'Dùng ở {len(co_import)} file [import], {len(chu)} file [chữ] (không import file định nghĩa, có thể trùng tên):')
    for f in co_import[:20]:
        print(f'  [import] {f}: dòng {", ".join(map(str, dung[f][:6]))}{" …" if len(dung[f]) > 6 else ""}')
    if len(co_import) > 20:
        print(f'  … còn {len(co_import) - 20} file [import]')
    for f in chu[:8]:
        print(f'  [chữ] {f}: dòng {", ".join(map(str, dung[f][:4]))}')
    for f in trong:
        print(f'  Trong file định nghĩa {f}: {len(dung[f])} chỗ')
    chi_import = sorted(nguoi_import - set(dung))
    if chi_import:
        print(f'Import file định nghĩa nhưng không gọi {ten} (dùng thứ khác trong file): {len(chi_import)} file')
    ma = Counter(m for f in file_dn for m in RE_MA.findall(doc(goc / f)))
    if ma:
        print('Mã việc, QD trong file định nghĩa: ' + ', '.join(f'{m} ({n})' for m, n in ma.most_common(8)))
    print(f'Đổi tên, tham số, kiểu trả về của {ten} thì kiểm đủ {len(co_import)} file [import] ở trên.')


def lenh_ma(a):
    goc = tim_goc(a.repo)
    ma = a.ma.upper()
    if not re.fullmatch(r'[A-Z]{1,6}-?\d{1,5}', ma):
        sys.exit('Mã dạng T907, QD21, ABC-123.')
    bo = ('features.json', 'icon-dac.ts')
    kq = [x for x in git_grep(goc, '-w', ma, duoi=['*']) if not x[0].endswith(bo) and not x[0].startswith(('dist/', 'docs/luu-tru/'))]
    code = [x for x in kq if x[0].endswith(DUOI_CODE)]
    css = [x for x in kq if x[0].endswith(('.css', '.scss'))]
    tl = [x for x in kq if x not in code and x not in css]
    print(f'{ma}: {len(code)} chỗ trong code, {len(css)} chỗ CSS, {len(tl)} chỗ tài liệu')
    for nhan, ds_x, toi_da in (('Code', code, 15), ('CSS', css, 8), ('Tài liệu', tl, 8)):
        if ds_x:
            print(f'{nhan}:')
            for f, i, t in ds_x[:toi_da]:
                print(f'  {f}:{i} {t[:100]}')
            if len(ds_x) > toi_da:
                print(f'  … còn {len(ds_x) - toi_da} chỗ, ở {len({x[0] for x in ds_x[toi_da:]})} file')
    log = git(goc, 'log', '-n', '30', '-E', f'--grep=^{ma}\\b', '--format=@@%h %ad %s', '--date=format:%d/%m', '--name-only')
    commits = [k.strip().splitlines() for k in log.split('@@')[1:] if k.strip()]
    if commits:
        print(f'Commit ({len(commits)}):')
        for c in commits[:8]:
            print('  ' + c[0][:110])
        tep = Counter(f for c in commits for f in c[1:] if not f.endswith('.md'))
        if tep:
            print('  File các commit đó sửa: ' + ', '.join(f'{f} ({n})' for f, n in tep.most_common(8)))


def lenh_do(a):
    """Lấy n commit gần nhất có mã việc và sửa code, chạy xep_hang với câu commit, xem file đã sửa có trong top không."""
    goc = tim_goc(a.repo)
    ds = ds_file_git(goc)
    ca = []
    for khoi in git(goc, 'log', '-n', '400', '--no-merges', '--format=@@%h %s', '--name-only').split('@@')[1:]:
        dong = khoi.strip().splitlines()
        h, sub = (dong[0].split(' ', 1) + [''])[:2]
        files = {f for f in dong[1:] if f.endswith(DUOI_CODE) and not f.startswith('tools/')}
        mo_ta = RE_MA.sub('', sub).strip(' :-')
        if files and len(files) <= 15 and len(tu_khoa([mo_ta])) >= 2:
            ca.append((h, mo_ta[:160], files))
        if len(ca) >= a.n:
            break
    if not ca:
        sys.exit('Không có commit sửa code nào để đo.')
    t3 = t6 = 0
    t0 = time.time()
    for h, mo_ta, files in ca:
        _, diem, _ = xep_hang(goc, ds, [mo_ta])
        top = [f for f, _ in diem.most_common(6)]
        t3 += bool(files & set(top[:3]))
        t6 += bool(files & set(top[:6]))
        if a.chi_tiet:
            print(f'{h} {"trúng" if files & set(top[:3]) else "TRƯỢT"} {mo_ta[:70]}')
    tg = (time.time() - t0) / len(ca)
    print(f'viec trên {len(ca)} commit gần nhất: file đã sửa nằm trong top 3 ở {t3}/{len(ca)} việc ({t3 * 100 // len(ca)}%), '
          f'top 6 ở {t6}/{len(ca)} ({t6 * 100 // len(ca)}%). Chấm điểm TB {tg:.2f} giây/việc.')


def main():
    p = argparse.ArgumentParser(description='Soi quan hệ file và gom rác AI trong repo. Không xoá file nào.')
    p.add_argument('--repo', help='Đường dẫn repo, mặc định thư mục hiện tại')
    sub = p.add_subparsers(dest='lenh', required=True)
    s = sub.add_parser('tong-quan', help='Khung project khoảng 40 dòng: công nghệ, vùng code, lõi chung, file lớn')
    s.set_defaults(ham=lenh_tong_quan)
    s = sub.add_parser('hieu', help='Nạp một lượt là nắm repo: tong-quan, thành phần dùng nhiều, luật, tài liệu, lệnh kiểm, phần riêng repo')
    s.set_defaults(ham=lenh_hieu)
    s = sub.add_parser('viec', help='Gom ngữ cảnh cho một việc: chỗ sửa file:dòng, dính kèm, CSS, QD, bẫy, việc cũ, skill, nghiệm thu')
    s.add_argument('mo_ta', nargs='+', help='Mô tả việc, gõ có dấu hay không dấu đều được')
    s.set_defaults(ham=lenh_viec)
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
    s = sub.add_parser('explain', help='Hàm, màn, kiểu: định nghĩa ở đâu, file nào dùng, nhãn [import]/[chữ]')
    s.add_argument('ten')
    s.set_defaults(ham=lenh_explain)
    s = sub.add_parser('ma', help='Mã việc, QD (T907, QD21): code, CSS, tài liệu, commit nhắc tới')
    s.add_argument('ma')
    s.set_defaults(ham=lenh_ma)
    s = sub.add_parser('do', help='Đo viec trên các commit gần nhất: độ trúng top 3, top 6, thời gian')
    s.add_argument('-n', type=int, default=20)
    s.add_argument('--chi-tiet', action='store_true', help='In từng commit trúng hay trượt')
    s.set_defaults(ham=lenh_do)
    a = p.parse_args()
    a.ham(a)
    KHO.luu()
    if a.lenh != 'don':
        dau_dung(tim_goc(a.repo))


if __name__ == '__main__':
    main()
