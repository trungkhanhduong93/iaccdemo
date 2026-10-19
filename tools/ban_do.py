"""Công cụ bản đồ repo iaccdemo giúp agent tra cứu nhanh, tiết kiệm token."""
import argparse
import os
import re
import runpy
import subprocess
import sys
import unicodedata
from functools import lru_cache
from collections import defaultdict
from pathlib import Path

# Cấu hình encoding cho Windows console
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')
    sys.stderr.reconfigure(encoding='utf-8')

ROOT = Path(__file__).resolve().parent.parent

# Các file và thư mục luôn bỏ qua
BO_QUA_TAP_TIN = {'src/ui/icon-dac.ts', 'src/app/features.json'}
BO_QUA_THU_MUC = {'node_modules', 'dist', 'backup', '.git'}


def la_file_bo_qua(rel_path: str) -> bool:
    """Kiểm tra đường dẫn tương đối có thuộc danh sách bỏ qua hay không."""
    norm = rel_path.replace('\\', '/')
    if norm in BO_QUA_TAP_TIN:
        return True
    parts = norm.split('/')
    for part in parts:
        if part in BO_QUA_THU_MUC:
            return True
    return False


@lru_cache(maxsize=4096)
def bo_dau(van_ban: str) -> str:
    """Chuyển văn bản về dạng không dấu, chữ thường."""
    s = van_ban.lower().replace('đ', 'd')
    return ''.join(c for c in unicodedata.normalize('NFD', s) if unicodedata.category(c) != 'Mn')


def khop_tu(van_ban: str, tu_khoa_ds: list[str]) -> bool:
    """Kiểm tra văn bản có chứa tất cả các từ khoá (không phân biệt dấu và hoa thường)."""
    norm = bo_dau(van_ban)
    return all(bo_dau(w) in norm for w in tu_khoa_ds)


def in_nhom(ten_nhom: str, dong_ds: list[str], max_dong: int = 15):
    """In danh sách kết quả theo nhóm, tối đa max_dong dòng."""
    if not dong_ds:
        return
    if ten_nhom:
        print(f"[{ten_nhom}]")
    for d in dong_ds[:max_dong]:
        print(d)
    if len(dong_ds) > max_dong:
        con = len(dong_ds) - max_dong
        print(f"… còn {con}, thu hẹp từ khoá")


def lenh_dau_phien(args):
    """Lệnh dau-phien: thay việc agent đọc cả TIEN-DO và nhật ký."""
    ten = args.ten.strip()

    # 1. git fetch origin -q
    try:
        subprocess.run(['git', 'fetch', 'origin', '-q'], check=False, timeout=10, capture_output=True)
    except Exception:
        print("[fetch origin: lỗi mạng hoặc không có kết nối, dùng dữ liệu trên máy]")

    # Commit mới trên origin/main
    res_log = subprocess.run(['git', 'log', '--format=%h %an %s', 'HEAD..origin/main'], capture_output=True, text=True, encoding='utf-8')
    commits = [l for l in res_log.stdout.splitlines() if l.strip()]
    if commits:
        print(f"origin/main có {len(commits)} commit mới:")
        for c in commits[:10]:
            print(f"  {c}")
        if len(commits) > 10:
            print(f"  … còn {len(commits) - 10} commit")
    else:
        print("origin/main: không có commit mới.")

    # Nhánh hiện tại và số file chưa commit
    res_br = subprocess.run(['git', 'branch', '--show-current'], capture_output=True, text=True, encoding='utf-8')
    nhanh = res_br.stdout.strip() or 'HEAD'
    res_st = subprocess.run(['git', 'status', '--porcelain'], capture_output=True, text=True, encoding='utf-8')
    so_chua_commit = len([l for l in res_st.stdout.splitlines() if l.strip()])
    print(f"Nhánh: {nhanh} ({so_chua_commit} file chưa commit)")

    # 2. Đọc bảng Đang làm và chờ làm trên origin/main
    tien_do_txt = ''
    res_td = subprocess.run(['git', 'show', 'origin/main:docs/TIEN-DO.md'], capture_output=True, text=True, encoding='utf-8')
    if res_td.returncode == 0 and res_td.stdout.strip():
        tien_do_txt = res_td.stdout
    else:
        td_file = ROOT / 'docs' / 'TIEN-DO.md'
        if td_file.exists():
            tien_do_txt = td_file.read_text(encoding='utf-8')

    dang_lam_lines = []
    if '## Đang làm và chờ làm' in tien_do_txt:
        phan = tien_do_txt.split('## Đang làm và chờ làm')[1]
        if '## ' in phan:
            phan = phan.split('## ')[0]
        dang_lam_lines = phan.splitlines()

    ds_task = []
    for line in dang_lam_lines:
        line_s = line.strip()
        if line_s.startswith('| T'):
            parts = [p.strip() for p in line_s.split('|')[1:-1]]
            if len(parts) >= 5:
                ds_task.append({
                    'ma': parts[0],
                    'viec': parts[1],
                    'nguoi': parts[2],
                    'trang_thai': parts[3],
                    'ghi_chu': parts[4],
                })

    # Việc của <ten>
    viec_cua_ten = [t for t in ds_task if bo_dau(t['nguoi']) == bo_dau(ten)]
    print(f"\nViệc của {ten}:")
    if viec_cua_ten:
        for t in viec_cua_ten:
            print(f"  {t['ma']} | {t['trang_thai']} | {t['viec'][:140]} | {t['ghi_chu'][:200]}")
    else:
        print("  (không có việc đang giao)")

    # Người khác đang giữ
    nguoi_khac_giu = [
        t for t in ds_task
        if t['trang_thai'] in ('Đang làm', 'Dở dang') and bo_dau(t['nguoi']) != bo_dau(ten) and t['nguoi']
    ]
    print("\nNgười khác đang giữ:")
    if nguoi_khac_giu:
        for t in nguoi_khac_giu:
            files = re.findall(r'`([^`]+)`', t['ghi_chu'])
            files_str = ', '.join(files) if files else '(không ghi file)'
            print(f"  {t['ma']} | {t['nguoi']} | {files_str}")
    else:
        print("  (không ai đang giữ việc)")

    # Chờ chưa giao
    cho_chua_giao = [t for t in ds_task if t['trang_thai'] == 'Chờ' and not t['nguoi']]
    print(f"\nChờ chưa giao ({len(cho_chua_giao)} việc):")
    for t in cho_chua_giao[:5]:
        print(f"  {t['ma']} | {t['viec'][:80]}")

    # Mã kế tiếp
    # Đọc TIEN-DO.md và TIEN-DO-xong.md trên origin/main
    xong_txt = ''
    res_xong = subprocess.run(['git', 'show', 'origin/main:docs/luu-tru/TIEN-DO-xong.md'], capture_output=True, text=True, encoding='utf-8')
    if res_xong.returncode == 0 and res_xong.stdout.strip():
        xong_txt = res_xong.stdout
    else:
        xf = ROOT / 'docs' / 'luu-tru' / 'TIEN-DO-xong.md'
        if xf.exists():
            xong_txt = xf.read_text(encoding='utf-8')

    all_t_txt = tien_do_txt + ' ' + xong_txt
    ds_so_t = [int(m) for m in re.findall(r'\| ?T(\d+)', all_t_txt)] or [0]
    next_t = f"T{max(ds_so_t) + 1}"

    qd_txt = ''
    res_qd = subprocess.run(['git', 'show', 'origin/main:docs/QUYET-DINH.md'], capture_output=True, text=True, encoding='utf-8')
    if res_qd.returncode == 0 and res_qd.stdout.strip():
        qd_txt = res_qd.stdout
    else:
        qdf = ROOT / 'docs' / 'QUYET-DINH.md'
        if qdf.exists():
            qd_txt = qdf.read_text(encoding='utf-8')
    ds_so_qd = [int(m) for m in re.findall(r'## QD(\d+)', qd_txt)] or [0]
    next_qd = f"QD{max(ds_so_qd) + 1}"

    print(f"\nMã kế tiếp: {next_t}, {next_qd}")

    # Nhật ký
    nk_dir = ROOT / 'docs' / 'nhat-ky'
    nk_files_all = sorted([f.name for f in nk_dir.glob('*.md') if f.name != 'MAU.md'], reverse=True)
    nk_can_doc = nk_files_all[:3]

    # Bổ sung nhật ký trong Ghi chú của việc của <ten> đang Dở dang/Kẹt
    for t in viec_cua_ten:
        if t['trang_thai'] in ('Dở dang', 'Kẹt'):
            m_links = re.findall(r'\[.*?\]\((?:nhat-ky/|\.\./nhat-ky/)?([^\)]+\.md)\)', t['ghi_chu'])
            m_raw = re.findall(r'(?:nhat-ky/)?(\d{4}-\d{2}-\d{2}-[a-zA-Z0-9_-]+\.md)', t['ghi_chu'])
            for fn in m_links + m_raw:
                basename = Path(fn).name
                if basename not in nk_can_doc and (nk_dir / basename).exists():
                    nk_can_doc.append(basename)

    print("\nNhật ký:")
    for fn in nk_can_doc:
        f_path = nk_dir / fn
        if not f_path.exists():
            continue
        txt = f_path.read_text(encoding='utf-8')
        m_dd = re.search(r'## Dở dang,\s*việc tiếp theo\s*\n(.*?)(?=\n## |\Z)', txt, re.S)
        if not m_dd:
            print(f"- {fn}: không dở")
            continue
        dd_content = m_dd.group(1).strip()
        lines_dd = [l.strip() for l in dd_content.splitlines() if l.strip()]
        if not lines_dd or lines_dd[0].lower().startswith('không'):
            print(f"- {fn}: không dở")
        else:
            print(f"- {fn}:")
            for ld in lines_dd[:8]:
                print(f"    {ld}")

    # Skill bản đồ repo trên máy người dùng (T487)
    tt = runpy.run_path(str(ROOT / 'tools' / 'cai_skill_ban_do.py'), run_name='kiem')['trang_thai']()
    if tt in ('chua-cai', 'cu-hon'):
        print(f"\nSkill bản đồ repo trên máy này: {'chưa cài' if tt == 'chua-cai' else 'có bản mới'}. Hỏi người dùng theo AGENTS.md, Đầu phiên bước 4.")


def lenh_tim(args):
    """Lệnh tim: tìm màn hình, hàm/kiểu, CSS, QD, bẫy, và chữ thường."""
    tu_khoa = args.tu
    if not tu_khoa:
        print("Vui lòng nhập ít nhất một từ khoá.")
        return

    # 1. Tìm Màn: dòng trong src/modules/**/*.ts* và src/app/*.ts* có slug: hoặc ten: khớp
    ket_qua_man = []
    files_man = []
    for ext in ('*.ts', '*.tsx'):
        files_man.extend((ROOT / 'src' / 'modules').rglob(ext))
        files_man.extend((ROOT / 'src' / 'app').glob(ext))

    for fp in sorted(files_man):
        rel = fp.relative_to(ROOT).as_posix()
        if la_file_bo_qua(rel):
            continue
        try:
            lines = fp.read_text(encoding='utf-8').splitlines()
        except Exception:
            continue
        for idx, line in enumerate(lines, 1):
            if 'slug:' in line or 'ten:' in line:
                if khop_tu(line, tu_khoa):
                    # Rút gọn slug=.. ten=.. nếu có
                    m_slug = re.search(r"slug:\s*['\"]([^'\"]+)['\"]", line)
                    m_ten = re.search(r"ten:\s*['\"]([^'\"]+)['\"]", line)
                    thong_tin = []
                    if m_slug:
                        thong_tin.append(f"slug={m_slug.group(1)}")
                    if m_ten:
                        thong_tin.append(f"ten={m_ten.group(1)}")
                    if not thong_tin:
                        thong_tin.append(line.strip()[:80])
                    ket_qua_man.append(f"{rel}:{idx} {' '.join(thong_tin)}")

    in_nhom("Màn", ket_qua_man)

    # 2. Tìm Hàm/kiểu: khai báo ở thụt 0 hoặc 2 dấu cách trong src/
    ket_qua_ham = []
    re_khai_bao = re.compile(
        r'^( {0,2})(?:export\s+)?(?:default\s+)?(?:async\s+)?(?:function|const|let|var|class|type|interface)\s+([A-Za-z0-9_$]+)'
    )
    for ext in ('*.ts', '*.tsx'):
        for fp in sorted((ROOT / 'src').rglob(ext)):
            rel = fp.relative_to(ROOT).as_posix()
            if la_file_bo_qua(rel):
                continue
            try:
                lines = fp.read_text(encoding='utf-8').splitlines()
            except Exception:
                continue
            for idx, line in enumerate(lines, 1):
                m = re_khai_bao.match(line)
                if m:
                    ten_dinh_danh = m.group(2)
                    if khop_tu(ten_dinh_danh, tu_khoa):
                        ket_qua_ham.append(f"{rel}:{idx} {ten_dinh_danh}")

    in_nhom("Hàm/kiểu", ket_qua_ham)

    # 3. Tìm CSS: trong src/styles/*.css
    ket_qua_css = []
    for fp in sorted((ROOT / 'src' / 'styles').glob('*.css')):
        rel = fp.relative_to(ROOT).as_posix()
        if la_file_bo_qua(rel):
            continue
        try:
            lines = fp.read_text(encoding='utf-8').splitlines()
        except Exception:
            continue
        muc_hien_tai = ''
        tu_norm = [bo_dau(w) for w in tu_khoa]
        lines_norm = bo_dau('\n'.join(lines)).split('\n')
        for idx, line in enumerate(lines, 1):
            m_sec = re.search(r'/\*\s*──\s*(.*?)\s*──\s*\*/', line)
            if m_sec:
                muc_hien_tai = m_sec.group(1).strip()
                if khop_tu(muc_hien_tai, tu_khoa):
                    ket_qua_css.append(f"{rel}:{idx} [mục: {muc_hien_tai}]")
                continue
            if '.' in line and '{' in line:
                # Dòng chứa selector
                if all(w in lines_norm[idx - 1] for w in tu_norm):
                    sel_text = line.split('{')[0].strip()
                    muc_tag = f" [{muc_hien_tai}]" if muc_hien_tai else ""
                    ket_qua_css.append(f"{rel}:{idx} {sel_text}{muc_tag}")

    in_nhom("CSS", ket_qua_css)

    # 4. Tìm QD và BAY
    ket_qua_qd = []
    qd_file = ROOT / 'docs' / 'QUYET-DINH.md'
    if qd_file.exists():
        rel_qd = qd_file.relative_to(ROOT).as_posix()
        lines_qd = qd_file.read_text(encoding='utf-8').splitlines()
        for idx, line in enumerate(lines_qd, 1):
            if line.startswith('## QD'):
                if khop_tu(line, tu_khoa):
                    ket_qua_qd.append(f"{rel_qd}:{idx} {line[3:].strip()}")

    in_nhom("Quyết định", ket_qua_qd)

    ket_qua_bay = []
    bay_file = ROOT / 'docs' / 'BAY.md'
    if bay_file.exists():
        rel_bay = bay_file.relative_to(ROOT).as_posix()
        lines_bay = bay_file.read_text(encoding='utf-8').splitlines()
        idx = 0
        while idx < len(lines_bay):
            line = lines_bay[idx]
            line_s = line.strip()
            if line_s.startswith('## ') or line_s.startswith('- '):
                start_line = idx + 1
                block_lines = [line_s]
                idx += 1
                while idx < len(lines_bay):
                    next_s = lines_bay[idx].strip()
                    if next_s.startswith('## ') or next_s.startswith('- '):
                        break
                    block_lines.append(lines_bay[idx])
                    idx += 1
                block_txt = '\n'.join(block_lines)
                if khop_tu(block_txt, tu_khoa):
                    dau = block_lines[0].lstrip('#- ')[:80]
                    ket_qua_bay.append(f"{rel_bay}:{start_line} {dau}")
            else:
                idx += 1

    in_nhom("Bẫy", ket_qua_bay)

    # 5. Chữ thường: file:dòng trong src/, tools/, docs/ (xếp src/ lên đầu, tối đa 10 file)
    file_matches = {}
    tu_norm = [bo_dau(w) for w in tu_khoa]
    cum = ' '.join(tu_norm)
    scan_dirs = [ROOT / 'src', ROOT / 'tools', ROOT / 'docs']
    for sdir in scan_dirs:
        for root, dirs, files in os.walk(sdir):
            root_p = Path(root)
            rel_root = root_p.relative_to(ROOT).as_posix()
            if la_file_bo_qua(rel_root) or 'docs/nhat-ky' in rel_root:
                continue
            for f in files:
                f_path = root_p / f
                rel_f = f_path.relative_to(ROOT).as_posix()
                if la_file_bo_qua(rel_f) or rel_f.startswith('docs/nhat-ky/'):
                    continue
                # Bỏ qua các file nhị phân
                if f_path.suffix.lower() in ('.xlsx', '.png', '.jpg', '.jpeg', '.gif', '.ico', '.pdf', '.zip'):
                    continue
                try:
                    txt = f_path.read_text(encoding='utf-8')
                except Exception:
                    continue
                # Bỏ dấu cả file một lần, nhanh hơn bỏ dấu từng dòng
                lines_goc = txt.splitlines()
                lines_nodau = bo_dau(txt).splitlines()
                use_lines = lines_goc if len(lines_goc) == len(lines_nodau) else lines_nodau
                matches = []
                for i, line in enumerate(lines_nodau):
                    if all(w in line for w in tu_norm):
                        # Dòng chứa nguyên cụm từ khoá xếp trước
                        matches.append((cum not in line, i + 1, use_lines[i].strip()[:80]))
                if matches:
                    file_matches[rel_f] = sorted(matches)

    def uu_tien_nhom(rel: str):
        if rel.startswith('src/'):
            return 0
        if rel.startswith('tools/'):
            return 1
        if rel.startswith('docs/'):
            return 2
        return 3

    top_files = sorted(file_matches.items(), key=lambda x: (uu_tien_nhom(x[0]), -sum(not m[0] for m in x[1]), -len(x[1])))[:10]
    dong_chu_thuong = []
    for fn, matches in top_files:
        for _, lineno, snippet in matches[:3]:
            dong_chu_thuong.append(f"{fn}:{lineno} {snippet}")
        if len(matches) > 3:
            con = len(matches) - 3
            dong_chu_thuong.append(f"{fn}: còn {con} dòng nữa")
    in_nhom("Chữ thường", dong_chu_thuong, max_dong=30)


RE_KHAI_BAO = re.compile(
    r'^( *)(?:export\s+)?(?:default\s+)?(?:async\s+)?(?:function\*?|const|let|var|class|type|interface|def)\s+([A-Za-z0-9_$]+)'
)
RE_MOC_KHAC = re.compile(
    r'^( *)(?:(useEffect|useMemo|useCallback|useLayoutEffect)\s*\(|(return)\s*\(\s*$|(?://|\{?/\*)\s*[─═]+\s*(.*?)\s*[─═]*\s*(?:\*/\}?)?$)'
)


def moc_cua(line: str):
    """Trả (thụt, tên) nếu dòng là mốc dàn ý: khai báo, hook, return JSX, comment ──."""
    m = RE_KHAI_BAO.match(line)
    if m:
        return len(m.group(1)), m.group(2)
    m = RE_MOC_KHAC.match(line)
    if m:
        return len(m.group(1)), m.group(2) or ('return (JSX)' if m.group(3) else '── ' + (m.group(4) or '').strip())
    return None


def phan_tich_khoi_code(lines: list[str]) -> list[tuple[int, int, str, list]]:
    """Dựng cây khối: mốc thụt ít nhất là cấp ngoài, khối trên 300 dòng thì chia tiếp theo mức thụt kế tiếp."""
    moc = []
    for idx, l in enumerate(lines, 1):
        m = moc_cua(l)
        if m:
            moc.append((idx, m[0], m[1]))

    def dung(tu: int, den: int, thut_cha: int) -> list[tuple[int, int, str, list]]:
        con = [x for x in moc if tu <= x[0] <= den and x[1] > thut_cha]
        if not con:
            # Khối không có mốc (JSX dài): chia theo thẻ mở ở mức thụt nông nhất
            for i in range(tu, den + 1):
                s = lines[i - 1].lstrip()
                if (s.startswith('<') and not s.startswith('</')) or s.startswith('{'):
                    con.append((i, len(lines[i - 1]) - len(s), s[:50]))
            if not con:
                return []
        thut = min(x[1] for x in con)
        cung_cap = [x for x in con if x[1] == thut]
        khoi = []
        for k, (s, _, ten) in enumerate(cung_cap):
            e = cung_cap[k + 1][0] - 1 if k + 1 < len(cung_cap) else den
            khoi.append((s, e, ten, dung(s + 1, e, thut) if e - s + 1 > 300 else []))
        return khoi

    return dung(1, len(lines), -1)


def lenh_file(args):
    """Lệnh file: in dàn ý thay vì đọc nguyên file."""
    path_arg = args.path.replace('\\', '/')
    fp = Path(path_arg)
    if not fp.is_absolute():
        fp = ROOT / fp

    if not fp.exists():
        print(f"File không tồn tại: {path_arg}")
        return

    rel = fp.resolve().relative_to(ROOT).as_posix()
    size_bytes = fp.stat().st_size
    size_kb = round(size_bytes / 1024)
    lines = fp.read_text(encoding='utf-8').splitlines()
    tong_dong = len(lines)

    print(f"{rel}, {tong_dong} dòng, {size_kb} KB")

    # 2 dòng comment đầu file nếu có
    comment_lines = []
    for line in lines[:10]:
        l_s = line.strip()
        if l_s.startswith('//') or l_s.startswith('/*') or l_s.startswith('*') or l_s.startswith('"""') or l_s.startswith("'''"):
            comment_lines.append(l_s)
            if len(comment_lines) == 2:
                break
        elif not l_s:
            continue
        else:
            break
    for c in comment_lines:
        print(f"  {c}")

    # Import nội bộ gộp 1 dòng
    import_noibo = []
    for line in lines[:100]:
        m = re.search(r"from\s+['\"](\.\.?/[^'\"]+)['\"]", line)
        if m:
            import_noibo.append(m.group(1))
    if import_noibo:
        print(f"  import nội bộ ({len(import_noibo)}): {', '.join(import_noibo[:8])}{' …' if len(import_noibo) > 8 else ''}")

    ext = fp.suffix.lower()
    if ext in ('.ts', '.tsx', '.js', '.py'):
        khoi_ds = phan_tich_khoi_code(lines)

        def in_cay_khoi(danh_sach, thut=2):
            # Khối dưới 15 dòng liền nhau gộp một dòng cho đỡ nhiễu
            pad = ' ' * thut
            gom = []

            def xa_gom():
                if len(gom) == 1:
                    print(f"{pad}{gom[0][0]}-{gom[0][1]} {gom[0][2]}")
                elif gom:
                    ten = ', '.join(g[2] for g in gom[:3]) + (' …' if len(gom) > 3 else '')
                    print(f"{pad}{gom[0][0]}-{gom[-1][1]} {len(gom)} khai báo ngắn: {ten}")
                gom.clear()

            for start, end, name, children in danh_sach:
                if end - start + 1 < 15 and not children:
                    gom.append((start, end, name))
                    continue
                xa_gom()
                print(f"{pad}{start}-{end} {name}")
                if children:
                    in_cay_khoi(children, thut + 2)
            xa_gom()

        in_cay_khoi(khoi_ds)

    elif ext == '.css':
        sec_markers = []
        for idx, line in enumerate(lines, 1):
            m = re.search(r'/\*\s*──\s*(.*?)\s*──\s*\*/', line)
            if m:
                sec_markers.append((idx, m.group(1).strip()))

        css_blocks = []
        for i in range(len(sec_markers)):
            start, name = sec_markers[i]
            end = sec_markers[i + 1][0] - 1 if i + 1 < len(sec_markers) else tong_dong
            css_blocks.append(f"  {start}-{end} {name}")

        if len(css_blocks) > 40:
            print(f"  … (còn {len(css_blocks) - 40} mục phía trước, file css lớn)")
            for b in css_blocks[-40:]:
                print(b)
            print("  (Gợi ý: tra mục chi tiết bằng python tools/ban_do.py css <từ>)")
        else:
            for b in css_blocks[:400]:
                print(b)

    elif ext == '.md':
        headings = []
        for idx, line in enumerate(lines, 1):
            if line.startswith('#'):
                headings.append((idx, line.strip()))
        for i in range(len(headings)):
            start, name = headings[i]
            end = headings[i + 1][0] - 1 if i + 1 < len(headings) else tong_dong
            print(f"  {start}-{end} {name}")


def lenh_css(args):
    """Lệnh css: tra cứu mục CSS theo mã Txxx hoặc selector theo class."""
    tu = args.tu.strip()
    is_t_code = bool(re.match(r'^T\d+$', tu, re.IGNORECASE))
    styles_dir = ROOT / 'src' / 'styles'

    ket_qua = []
    for fp in sorted(styles_dir.glob('*.css')):
        rel = fp.relative_to(ROOT).as_posix()
        if la_file_bo_qua(rel):
            continue
        try:
            lines = fp.read_text(encoding='utf-8').splitlines()
        except Exception:
            continue

        sec_markers = []
        for idx, line in enumerate(lines, 1):
            m = re.search(r'/\*\s*──\s*(.*?)\s*──\s*\*/', line)
            if m:
                sec_markers.append((idx, m.group(1).strip()))

        if is_t_code:
            # Tìm mục CSS có mã T\d+
            for i in range(len(sec_markers)):
                start, name = sec_markers[i]
                end = sec_markers[i + 1][0] - 1 if i + 1 < len(sec_markers) else len(lines)
                if tu.lower() in name.lower():
                    ket_qua.append(f"{rel}:{start}-{end} {name}")
        else:
            # Tìm selector chứa class
            # Tạo map line -> tên mục
            cur_sec = ''
            sec_idx = 0
            for idx, line in enumerate(lines, 1):
                if sec_idx < len(sec_markers) and idx == sec_markers[sec_idx][0]:
                    cur_sec = sec_markers[sec_idx][1]
                    sec_idx += 1
                if '.' in line and '{' in line:
                    if tu.lower() in line.lower():
                        sel = line.split('{')[0].strip()
                        muc_tag = f" [{cur_sec}]" if cur_sec else ""
                        ket_qua.append(f"{rel}:{idx} {sel}{muc_tag}")

    if not ket_qua:
        print(f"Không có mục hay class CSS khớp '{tu}'. Thử python tools/ban_do.py tim {tu}")
    for r in ket_qua[:15]:
        print(r)
    if len(ket_qua) > 15:
        print(f"… còn {len(ket_qua) - 15}, thu hẹp từ khoá")


def lenh_qd(args):
    """Lệnh qd: tra cứu Quyết định (docs/QUYET-DINH.md)."""
    qd_file = ROOT / 'docs' / 'QUYET-DINH.md'
    if not qd_file.exists():
        print("Không tìm thấy docs/QUYET-DINH.md")
        return

    lines = qd_file.read_text(encoding='utf-8').splitlines()
    qd_sections = []
    for idx, l in enumerate(lines, 1):
        m = re.match(r'^##\s*(QD\d+)\.\s*(.*)', l)
        if m:
            qd_sections.append((idx, m.group(1), m.group(2).strip()))

    tham_so = ' '.join(args.arg).strip() or None

    if not tham_so:
        # Không tham số: mỗi QD một dòng
        for idx, qd_code, qd_name in qd_sections:
            print(f"{qd_code} {qd_name}")
        return

    # Tham số là số
    if tham_so.isdigit() or (tham_so.lower().startswith('qd') and tham_so[2:].isdigit()):
        so = tham_so if tham_so.isdigit() else tham_so[2:]
        target_code = f"QD{int(so)}"
        for i in range(len(qd_sections)):
            start, qd_code, qd_name = qd_sections[i]
            if int(re.search(r'\d+', qd_code).group()) == int(so):
                end = qd_sections[i + 1][0] - 1 if i + 1 < len(qd_sections) else len(lines)
                for l_idx in range(start, end + 1):
                    print(lines[l_idx - 1])
                return
        print(f"Không tìm thấy quyết định {target_code}")
        return

    # Tham số là chữ: tìm trong tiêu đề hoặc thân QD
    tu_khoa = tham_so.split()
    rel = qd_file.relative_to(ROOT).as_posix()
    matches = []
    for i in range(len(qd_sections)):
        start, qd_code, qd_name = qd_sections[i]
        end = qd_sections[i + 1][0] - 1 if i + 1 < len(qd_sections) else len(lines)
        body = '\n'.join(lines[start - 1:end])
        if khop_tu(body, tu_khoa):
            matches.append(f"{rel}:{start} ## {qd_code}. {qd_name}")

    for m in matches[:15]:
        print(m)
    if len(matches) > 15:
        print(f"… còn {len(matches) - 15}, thu hẹp từ khoá")


def lenh_bay(args):
    """Lệnh bay: tra cứu bẫy đã gặp (docs/BAY.md)."""
    bay_file = ROOT / 'docs' / 'BAY.md'
    if not bay_file.exists():
        print("Không tìm thấy docs/BAY.md")
        return

    lines = bay_file.read_text(encoding='utf-8').splitlines()
    rel = bay_file.relative_to(ROOT).as_posix()
    tu = ' '.join(args.tu).strip() or None

    if not tu:
        # Không tham số: danh sách heading
        for idx, line in enumerate(lines, 1):
            if line.startswith('#'):
                print(f"{rel}:{idx} {line.strip()}")
        return

    # Có từ: in nguyên các khối khớp
    tu_khoa = tu.split()
    blocks = []
    idx = 0
    while idx < len(lines):
        line = lines[idx]
        line_s = line.strip()
        if line_s.startswith('## ') or line_s.startswith('- '):
            start = idx + 1
            block_lines = [line]
            idx += 1
            while idx < len(lines):
                next_s = lines[idx].strip()
                if next_s.startswith('## ') or next_s.startswith('- '):
                    break
                block_lines.append(lines[idx])
                idx += 1
            blocks.append((start, block_lines))
        else:
            idx += 1

    khop_blocks = []
    for start, block_lines in blocks:
        block_txt = '\n'.join(block_lines)
        if khop_tu(block_txt, tu_khoa):
            khop_blocks.append((start, block_lines))

    for start, block_lines in khop_blocks[:15]:
        print(f"── {rel}:{start} ──")
        for bl in block_lines:
            print(bl)
        print()
    if len(khop_blocks) > 15:
        print(f"… còn {len(khop_blocks) - 15}, thu hẹp từ khoá")


def lenh_nhanh(args):
    """Lệnh nhanh: xem git worktree và các nhánh có commit chưa vào origin/main."""
    # 1. git worktree list
    res_wt = subprocess.run(['git', 'worktree', 'list'], capture_output=True, text=True, encoding='utf-8')
    print("Worktree:")
    for l in res_wt.stdout.splitlines():
        if l.strip():
            print(f"  {l}")

    # 2. Các nhánh
    res_br = subprocess.run(['git', 'branch', '-a', '--format=%(refname:short)'], capture_output=True, text=True, encoding='utf-8')
    branches = set()
    for b in res_br.stdout.splitlines():
        b = b.strip()
        if not b or b in ('main', 'origin/main', 'origin/HEAD', 'HEAD'):
            continue
        branches.add(b)

    da_gop = 0
    chua_gop = []

    for br in sorted(branches):
        # Đếm ahead và behind so với origin/main
        res_ahead = subprocess.run(['git', 'rev-list', '--count', f'origin/main..{br}'], capture_output=True, text=True, encoding='utf-8')
        ahead = int(res_ahead.stdout.strip() or 0)
        if ahead == 0:
            da_gop += 1
            continue

        res_behind = subprocess.run(['git', 'rev-list', '--count', f'{br}..origin/main'], capture_output=True, text=True, encoding='utf-8')
        behind = int(res_behind.stdout.strip() or 0)

        # Commit cuối
        res_c = subprocess.run(['git', 'log', '-1', '--format=%cd %h %s', '--date=short', br], capture_output=True, text=True, encoding='utf-8')
        commit_info = res_c.stdout.strip()

        # Merge base và diff file
        res_mb = subprocess.run(['git', 'merge-base', 'origin/main', br], capture_output=True, text=True, encoding='utf-8')
        mb = res_mb.stdout.strip()
        files = []
        if mb:
            res_diff = subprocess.run(['git', 'diff', '--name-only', mb, br], capture_output=True, text=True, encoding='utf-8')
            files = [f for f in res_diff.stdout.splitlines() if f.strip()]

        if len(files) > 5:
            files_str = ', '.join(files[:5]) + f" (+{len(files) - 5})"
        elif files:
            files_str = ', '.join(files)
        else:
            files_str = '(không đổi file)'

        chua_gop.append(f"{br} | +{ahead}/-{behind} | {commit_info} | {files_str}")

    print(f"\nNhánh chưa vào origin/main ({len(chua_gop)}):")
    for cg in chua_gop[:15]:
        print(f"  {cg}")
    if len(chua_gop) > 15:
        print(f"  … còn {len(chua_gop) - 15}, thu hẹp danh sách")

    print(f"Số nhánh đã gộp hết: {da_gop}")


def main():
    parser = argparse.ArgumentParser(
        prog='ban_do.py',
        description='Bản đồ repo iaccdemo: tra cứu file:dòng, đầu phiên, CSS, QD, bẫy tốn ít token.'
    )
    subparsers = parser.add_subparsers(dest='subcommand', required=True)

    # dau-phien
    p_dp = subparsers.add_parser('dau-phien', help='Thay việc đọc nguyên TIEN-DO và nhật ký đầu phiên')
    p_dp.add_argument('ten', help='Tên người dùng (Trum, PhuongXT, dinhlanphuongipacc)')
    p_dp.set_defaults(func=lenh_dau_phien)

    # tim
    p_tim = subparsers.add_parser('tim', help='Tìm màn hình, hàm/kiểu, CSS, QD, bẫy, chữ thường theo từ khoá')
    p_tim.add_argument('tu', nargs='+', help='Từ khoá tìm kiếm')
    p_tim.set_defaults(func=lenh_tim)

    # file
    p_file = subparsers.add_parser('file', help='Dàn ý tóm tắt thay vì đọc nguyên file lớn')
    p_file.add_argument('path', help='Đường dẫn file cần xem dàn ý')
    p_file.set_defaults(func=lenh_file)

    # css
    p_css = subparsers.add_parser('css', help='Tra cứu mục CSS theo mã Txxx hoặc selector theo class')
    p_css.add_argument('tu', help='Mã việc (Txxx) hoặc tên class CSS')
    p_css.set_defaults(func=lenh_css)

    # qd
    p_qd = subparsers.add_parser('qd', help='Tra cứu quyết định (QD) trong docs/QUYET-DINH.md')
    p_qd.add_argument('arg', nargs='*', default=[], help='Số QD hoặc từ khoá tìm kiếm (để trống: xem danh sách)')
    p_qd.set_defaults(func=lenh_qd)

    # bay
    p_bay = subparsers.add_parser('bay', help='Tra cứu bẫy đã gặp trong docs/BAY.md')
    p_bay.add_argument('tu', nargs='*', default=[], help='Từ khoá tra cứu bẫy (để trống: xem mục lục)')
    p_bay.set_defaults(func=lenh_bay)

    # nhanh
    p_nhanh = subparsers.add_parser('nhanh', help='Xem git worktree và các nhánh có commit chưa vào origin/main')
    p_nhanh.set_defaults(func=lenh_nhanh)

    args = parser.parse_args()
    args.func(args)


if __name__ == '__main__':
    main()
