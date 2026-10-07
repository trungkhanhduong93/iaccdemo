# -*- coding: utf-8 -*-
# Chép từ skill viet-nhu-nguoi của Trum ngày 07/10/2026. Sửa luật soát thì sửa bản gốc rồi chép lại cả kiem_van.py và mau.py.
"""Soát dấu hiệu văn AI và lỗi giọng theo loại văn bản.

Dùng:
  python kiem_van.py FILE [FILE ...] [--loai LOAI] [--json]
  python kiem_van.py - --loai email          (đọc từ stdin)

LOAI: tai-lieu, iso, thuyet-trinh, giao-dien, gioi-thieu, email, chat.
Bỏ trống thì script đoán theo đuôi và đường dẫn file.

Đọc được: .md .txt .eml .html .htm .js .jsx .ts .tsx .vue .docx .pptx
Với file mã nguồn và HTML, chỉ soát chữ người dùng nhìn thấy (chuỗi, chữ trong thẻ, title, placeholder).

Mã thoát: 0 sạch, 1 còn VÀNG, 2 còn ĐỎ, 3 không đọc được file.
"""
import argparse
import bisect
import html
import json
import re
import sys
import unicodedata
import zipfile
from collections import namedtuple
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import mau  # noqa: E402

CAC_LOAI = ("tai-lieu", "iso", "thuyet-trinh", "giao-dien", "gioi-thieu", "email", "chat")
DUOI_MA = {".js", ".jsx", ".ts", ".tsx", ".vue", ".mjs", ".cjs"}
DUOI_HTML = {".html", ".htm"}
DUOI_CHU = {".md", ".markdown", ".txt", ".eml"}
DUOI_HO_TRO = DUOI_MA | DUOI_HTML | DUOI_CHU | {".docx", ".pptx"}

DonVi = namedtuple("DonVi", "kieu so chu tieu_de", defaults=(False,))

# ---------------------------------------------------------------- chuẩn hoá

CU_SANG_MOI = {"òa": "oà", "óa": "oá", "ỏa": "oả", "õa": "oã", "ọa": "oạ",
               "òe": "oè", "óe": "oé", "ỏe": "oẻ", "õe": "oẽ", "ọe": "oẹ",
               "ùy": "uỳ", "úy": "uý", "ủy": "uỷ", "ũy": "uỹ", "ụy": "uỵ"}
RE_KIEU_CU = re.compile(r"(?<!q)(?:[òóỏõọ][ae]|[ùúủũụ]y)(?!\w)")
RE_TU_KIEU_CU = re.compile(r"\w*(?<!q)(?:[òóỏõọ][ae]|[ùúủũụ]y)(?!\w)")
RE_TU_KIEU_MOI = re.compile(r"\w*(?<!q)(?:o[àáảãạèéẻẽẹ]|u[ỳýỷỹỵ])(?!\w)")


def chuan_hoa(s):
    """Hạ chữ thường và quy kiểu bỏ dấu cũ về kiểu mới. Giữ nguyên độ dài để vị trí khớp với bản gốc."""
    thap = s.lower()
    if len(thap) != len(s):
        thap = "".join(c.lower() if len(c.lower()) == 1 else c for c in s)
    return RE_KIEU_CU.sub(lambda m: CU_SANG_MOI.get(m.group(0), m.group(0)), thap)


def _xoa(m):
    """Thay đoạn khớp bằng khoảng trắng, giữ dấu xuống dòng để số dòng không lệch."""
    return re.sub(r"[^\n]", " ", m.group(0))


class ViTriDong:
    def __init__(self, text, dong_dau=1):
        self.xuong = [i for i, c in enumerate(text) if c == "\n"]
        self.dau = dong_dau

    def dong(self, pos):
        return self.dau + bisect.bisect_left(self.xuong, pos)


# ---------------------------------------------------------------- tách chữ

RE_TOKEN_JS = re.compile(
    r"//[^\n]*|/\*[\s\S]*?\*/|'(?:\\.|[^'\\\n])*'|\"(?:\\.|[^\"\\\n])*\"|`(?:\\.|[^`\\])*`")


def la_chu_hien_thi(s):
    """Chuỗi trong code có phải chữ cho người đọc không, hay là tên lớp, khoá, đường dẫn, SQL."""
    s = s.strip()
    if not s or not re.search(r"[^\W\d_]", s):
        return False
    if s.startswith(("http", "/", "./", "../", "data:", "mailto:", "#")):
        return False
    # template literal bị tách lệch sẽ nuốt cả đoạn code
    if re.search(r"[;{}]\s*(?:\n|$)|\b(?:const|let|var|function|return)\s|=>|innerHTML|document\.", s):
        return False
    if len(s) > 80 and " " not in s:
        return False
    s = s.replace("…", " ")  # chỗ ${...} của template literal
    if s.isascii():
        if " " not in s.strip():
            return False
        tu = s.split()
        if all(re.fullmatch(r"[a-z0-9:/\[\]\.\-_#%!()&>+~=,*]+", t) for t in tu):
            return False
        # chuỗi class CSS: phần lớn token có gạch nối, hai chấm hoặc ngoặc vuông
        if sum(bool(re.search(r"[-:\[\]/]", t)) for t in tu) >= len(tu) / 2:
            return False
        if re.search(r"[{};=]|=>|\(\)", s):
            return False
        if re.match(r"(?i)\s*(?:select|insert|update|delete|with|create|alter|exec)\b", s):
            return False
    return True


def la_chu_jsx(t):
    t = t.strip()
    if not t or not re.search(r"[^\W\d_]", t):
        return False
    if re.search(r"[=;{}]|=>|&&|\|\||//|\b(?:const|let|return|function|import)\b", t):
        return False
    if not t.isascii():
        return True
    if re.search(r"[()\[\]]", t):
        return False
    return len(re.findall(r"[A-Za-z]+", t)) >= 2


def tach_js(src, dong_dau=1, jsx=False):
    vt = ViTriDong(src, dong_dau)
    don_vi = []
    for m in RE_TOKEN_JS.finditer(src):
        tok = m.group(0)
        if tok.startswith("/"):
            continue
        trong = tok[1:-1]
        if tok[0] == "`":
            trong = re.sub(r"\$\{[^}]*\}", "…", trong)
        trong = trong.replace("\\n", " ").replace("\\t", " ").replace("\\'", "'").replace('\\"', '"')
        if "<" in trong:
            trong = re.sub(r"<[^>]*>", " ", trong)
        if la_chu_hien_thi(trong):
            don_vi.append(DonVi("dòng", vt.dong(m.start()), trong))
    if not jsx:
        return don_vi
    sach = RE_TOKEN_JS.sub(_xoa, src)
    for m in re.finditer(r">([^<>{}]+)<", sach):
        if la_chu_jsx(m.group(1)):
            don_vi.append(DonVi("dòng", vt.dong(m.start(1)), m.group(1)))
    return don_vi


def tach_html(src):
    vt = ViTriDong(src)
    don_vi = []
    for m in re.finditer(r"(?is)<script\b[^>]*>(.*?)</script>", src):
        don_vi += tach_js(m.group(1), vt.dong(m.start(1)))
    sach = re.sub(r"(?is)<script\b[^>]*>.*?</script>|<style\b[^>]*>.*?</style>|<!--.*?-->", _xoa, src)
    for m in re.finditer(r'(?i)\b(?:title|placeholder|alt|aria-label|data-tooltip|value|content|label)\s*=\s*"([^"]*)"', sach):
        t = html.unescape(m.group(1))
        if la_chu_hien_thi(t):
            don_vi.append(DonVi("dòng", vt.dong(m.start(1)), t))
    for m in re.finditer(r">([^<]+)<", sach):
        t = html.unescape(m.group(1))
        if t.strip() and re.search(r"[^\W\d_]", t):
            don_vi.append(DonVi("dòng", vt.dong(m.start(1)), t))
    return don_vi


def lam_sach_md(src):
    """Xoá frontmatter, khối code, code nội dòng, comment HTML, URL. Giữ số dòng."""
    t = src
    m = re.match(r"---\n[\s\S]*?\n---\n", t)
    if m:
        t = _xoa(m) + t[m.end():]
    t = re.sub(r"(?ms)^[ \t]*(```|~~~).*?^[ \t]*\1[ \t]*$", _xoa, t)
    t = re.sub(r"<!--[\s\S]*?-->", _xoa, t)
    t = re.sub(r"`[^`\n]+`", _xoa, t)
    t = re.sub(r"\]\([^)\s]+\)", lambda m: "]" + " " * (len(m.group(0)) - 1), t)
    t = re.sub(r"https?://\S+", _xoa, t)
    return t


def tach_md(sach):
    don_vi, buf, dau = [], [], 0
    for i, dong in enumerate(sach.split("\n"), 1):
        if dong.strip():
            if not buf:
                dau = i
            buf.append(dong)
        elif buf:
            don_vi.append(DonVi("dòng", dau, "\n".join(buf)))
            buf = []
    if buf:
        don_vi.append(DonVi("dòng", dau, "\n".join(buf)))
    return don_vi


def _chu_trong_doan(xml, the):
    return html.unescape("".join(re.findall(r"<%s(?:\s[^>]*)?>([^<]*)</%s>" % (the, the), xml)))


def tach_docx(duong_dan):
    with zipfile.ZipFile(duong_dan) as z:
        xml = z.read("word/document.xml").decode("utf-8")
    don_vi = []
    for i, p in enumerate(re.findall(r"<w:p[ >][\s\S]*?</w:p>", xml), 1):
        chu = _chu_trong_doan(p, "w:t")
        if chu.strip():
            kieu = re.search(r'<w:pStyle w:val="([^"]+)"', p)
            tieu_de = bool(kieu and re.search(r"(?i)heading|title|tieude", kieu.group(1)))
            don_vi.append(DonVi("đoạn", i, chu, tieu_de))
    return don_vi


def tach_pptx(duong_dan):
    with zipfile.ZipFile(duong_dan) as z:
        ten = [n for n in z.namelist() if re.fullmatch(r"ppt/slides/slide\d+\.xml", n)]
        ten.sort(key=lambda n: int(re.search(r"(\d+)\.xml$", n).group(1)))
        don_vi = []
        for n in ten:
            so = int(re.search(r"(\d+)\.xml$", n).group(1))
            xml = z.read(n).decode("utf-8")
            dau_tien = True
            for p in re.findall(r"<a:p[ >][\s\S]*?</a:p>", xml):
                chu = _chu_trong_doan(p, "a:t")
                if chu.strip():
                    don_vi.append(DonVi("slide", so, chu, dau_tien))
                    dau_tien = False
    return don_vi


# ---------------------------------------------------------------- đoán loại

def doan_loai(ten):
    p = str(ten).replace("\\", "/").lower()
    duoi = Path(p).suffix
    if duoi == ".pptx" or "slides-data" in p or re.search(r"/(?:slides?|present[^/]*)/", p):
        return "thuyet-trinh"
    if re.search(r"quy[_ -]?trinh|/iso/|(?:^|/)iso[_-]", p):
        return "iso"
    if duoi in DUOI_MA or duoi in DUOI_HTML:
        return "giao-dien"
    if duoi == ".eml":
        return "email"
    return "tai-lieu"


# ---------------------------------------------------------------- luật

def _bien_dich():
    luat = []
    for r in mau.LUAT:
        luat.append(dict(r, mau=[(re.compile(x), g or r["goi_y"]) for x, g in r["mau"]]))
    return luat


LUAT = _bien_dich()
TU_VUNG = [re.compile(x) for x in mau.TU_VUNG["mau"]]
MIEN_TRU = {k: [re.compile(x) for x in v] for k, v in mau.MIEN_TRU.items()}
RE_EMOJI = re.compile("[\U0001F000-\U0001FAFF☀-➿⭐⭕]")
RE_DAU_DONG = re.compile(r"\s*(?:#{1,6}|[-*+•]|\d+[.)])?\s*")
RE_DS_TIEU_DE_DAM = re.compile(
    r"^\s*(?:[-*+•–]|\d+[.)])\s+(?:\*\*|__)[^*_\n]{1,60}?(?:(?:\*\*|__)\s*[:：]|[:：]\s*(?:\*\*|__))")
RE_IN_DAM = re.compile(r"\*\*[^*\n]+\*\*|__[^_\n]+__")
TU_NHO_EN = {"a", "an", "the", "and", "or", "but", "of", "in", "on", "at", "to", "for", "by", "with", "from", "as", "vs"}


def _trich(chu, a, b, them=0):
    s = chu[a:min(len(chu), b + them)].replace("\n", " ").strip()
    return s if len(s) <= 70 else s[:69] + "…"


def _vi_tri(dv, pos):
    if dv.kieu == "dòng":
        return "dòng %d" % (dv.so + dv.chu[:pos].count("\n"))
    return "%s %d" % (dv.kieu, dv.so)


def _chong_lan(a, b, khoang):
    return any(a < y and x < b for x, y in khoang)


def _gach_ngang(goc):
    """Vị trí gạch ngang dài dùng để ngắt câu. Bỏ qua ô bảng trống ghi "—"."""
    vi_tri = []
    for m in re.finditer("—", goc):
        dau = goc.rfind("\n", 0, m.start()) + 1
        cuoi = goc.find("\n", m.start())
        dong = goc[dau:cuoi if cuoi != -1 else len(goc)]
        if dong.strip() == "—" or re.search(r"\|\s*—\s*(?:\||$)", dong):
            continue
        vi_tri.append(m.start())
    return vi_tri


def kiem(don_vi, loai, tho=None, la_van_ban=True, sach_md=None):
    """Trả về (danh sách phát hiện, số chữ, số từ vựng AI dưới ngưỡng)."""
    phat_hien = []

    def them(muc, ma, khoa, vi_tri, trich, goi_y):
        phat_hien.append(dict(muc=muc, ma=ma, vi_tri=vi_tri, trich=trich, goi_y=goi_y, _khoa=khoa))

    van_xuoi = loai in mau.VAN_XUOI
    mien = MIEN_TRU.get(loai, [])
    so_chu = 0
    tu_vung = []

    for idx, dv in enumerate(don_vi):
        goc = unicodedata.normalize("NFC", dv.chu)
        so_sanh = chuan_hoa(goc)
        so_chu += len(re.findall(r"\w+", goc))
        khoang_mien = [m.span() for r in mien for m in r.finditer(so_sanh)]
        dv = dv._replace(chu=goc)

        for r in LUAT:
            if loai not in r["loai"]:
                continue
            if r["pham_vi"] == "tho" and tho is not None:
                continue
            if r["pham_vi"] == "tho_van_ban" and la_van_ban and tho is not None:
                continue
            for rx, goi_y in r["mau"]:
                for m in rx.finditer(so_sanh):
                    if _chong_lan(m.start(), m.end(), khoang_mien):
                        continue
                    them_chu = 40 if r["ma"] == "DUOI_BINH_LUAN" else 0
                    them(r["muc"], r["ma"], (idx, m.start()), _vi_tri(dv, m.start()),
                         _trich(goc, m.start(), m.end(), them_chu), goi_y)

        if van_xuoi:
            for rx in TU_VUNG:
                for m in rx.finditer(so_sanh):
                    if not _chong_lan(m.start(), m.end(), khoang_mien):
                        tu_vung.append(((idx, m.start()), _vi_tri(dv, m.start()), _trich(goc, m.start(), m.end())))

        # emoji: đầu dòng hoặc tiêu đề là trang trí, nặng hơn emoji giữa câu
        for m in RE_EMOJI.finditer(goc):
            if m.group(0) in mau.KY_TU_DUOC_PHEP:
                continue
            dau = goc.rfind("\n", 0, m.start()) + 1
            o_dau = bool(RE_DAU_DONG.fullmatch(goc[dau:m.start()])) or dv.tieu_de
            if van_xuoi and o_dau:
                them("do", "EMOJI_DAU_DONG", (idx, m.start()), _vi_tri(dv, m.start()),
                     _trich(goc, m.start(), m.end(), 30), "Bỏ emoji trang trí ở tiêu đề và đầu dòng")
            else:
                them("vang", "EMOJI", (idx, m.start()), _vi_tri(dv, m.start()),
                     _trich(goc, max(0, m.start() - 20), m.end(), 20), "Bỏ emoji; chữ đã đủ nghĩa")

        if van_xuoi:
            gach = _gach_ngang(goc)
            if gach:
                p = gach[0]
                them("vang", "GACH_NGANG_DAI", (idx, p), _vi_tri(dv, p),
                     _trich(goc, max(0, p - 25), p + 1, 25) + (" (%d lần trong đoạn)" % len(gach) if len(gach) > 1 else ""),
                     "Dùng dấu phẩy, dấu hai chấm, ngoặc đơn, hoặc tách câu")

        nguong = mau.CAU_DAI.get(loai)
        if nguong:
            dong_van = [d for d in goc.split("\n") if not d.lstrip().startswith("|")]
            van = re.sub(r"\n(?=\s*(?:[-*+•]|\d+[.)]|#))", ". ", "\n".join(dong_van)).replace("\n", " ")
            for cau in re.split(r"(?<=[.!?;…])\s+", van):
                n = len(re.findall(r"\w+", cau))
                if n > nguong:
                    p = max(0, goc.find(cau[:20].strip()))
                    them("vang", "CAU_DAI", (idx, p), _vi_tri(dv, p),
                         "%d chữ: %s" % (n, _trich(cau, 0, 50)), "Tách câu; tối đa %d chữ cho loại %s" % (nguong, loai))

    # dấu vết máy và chỗ trống: soát trên nguyên văn để bắt cả trong URL
    if tho is not None:
        goc_tho = unicodedata.normalize("NFC", tho)
        ss_tho = chuan_hoa(goc_tho)
        vt = ViTriDong(goc_tho)
        for r in LUAT:
            if loai not in r["loai"]:
                continue
            if r["pham_vi"] == "tho" or (r["pham_vi"] == "tho_van_ban" and la_van_ban):
                for rx, goi_y in r["mau"]:
                    for m in rx.finditer(ss_tho):
                        d = vt.dong(m.start())
                        them(r["muc"], r["ma"], (-1, d), "dòng %d" % d, _trich(goc_tho, m.start(), m.end()), goi_y)

    # cấu trúc markdown
    if sach_md is not None and van_xuoi:
        dong = sach_md.split("\n")
        ds = [i for i, d in enumerate(dong, 1) if RE_DS_TIEU_DE_DAM.match(d)]
        for i in ds:
            them("do" if len(ds) >= 2 else "vang", "DS_TIEU_DE_DAM", (-1, i), "dòng %d" % i,
                 _trich(dong[i - 1], 0, 60),
                 "Danh sách mở đầu bằng tiêu đề in đậm + hai chấm. Viết thành câu, hoặc dùng bảng 2 cột")
        ke = [i for i, d in enumerate(dong, 1) if re.fullmatch(r"\s*(?:-{3,}|\*{3,}|_{3,})\s*", d)]
        if len(ke) >= 3:
            them("vang", "KE_NGANG", (-1, ke[0]), "dòng %d" % ke[0], "%d đường kẻ ngang" % len(ke),
                 "Bỏ kẻ ngang giữa các mục; tiêu đề đã đủ phân cách")
        for i, d in enumerate(dong, 1):
            m = re.match(r"#{1,6}\s+(.+)", d)
            if m and m.group(1).isascii():
                tu = re.findall(r"[A-Za-z][A-Za-z'-]*", m.group(1))
                lon = [t for t in tu if t.lower() not in TU_NHO_EN]
                if len(tu) >= 3 and len(lon) >= 3 and all(t[0].isupper() for t in lon):
                    them("vang", "TIEU_DE_HOA", (-1, i), "dòng %d" % i, _trich(d, 0, 60),
                         "Chỉ viết hoa chữ đầu tiêu đề (sentence case)")
        for dv in tach_md(sach_md):
            if dv.chu.lstrip().startswith("|"):
                continue
            dam = RE_IN_DAM.findall(dv.chu)
            tong = len(re.findall(r"\w+", dv.chu)) or 1
            tu_dam = sum(len(re.findall(r"\w+", x)) for x in dam)
            if len(dam) >= 4 and tu_dam / tong >= 0.15:
                them("vang", "IN_DAM_DAY", (-1, dv.so), "dòng %d" % dv.so, "%d cụm in đậm trong một đoạn" % len(dam),
                     "Chỉ in đậm tên nút, từ khoá quyết định")

    # slide nhiều chữ
    so_chu_slide = {}
    for dv in don_vi:
        if dv.kieu == "slide":
            so_chu_slide[dv.so] = so_chu_slide.get(dv.so, 0) + len(re.findall(r"\w+", dv.chu))
    for so, n in so_chu_slide.items():
        if n > 60:
            them("vang", "SLIDE_NHIEU_CHU", (so, 0), "slide %d" % so, "%d chữ" % n,
                 "Một slide một ý, dưới 60 chữ; phần nói chi tiết để vào ghi chú")

    # trộn kiểu bỏ dấu
    tat_ca = unicodedata.normalize("NFC", "\n".join(dv.chu for dv in don_vi)).lower()
    cu = RE_TU_KIEU_CU.findall(tat_ca)
    moi = RE_TU_KIEU_MOI.findall(tat_ca)
    if cu and moi:
        # ngang nhau thì theo kiểu mới, là kiểu skill chọn
        thieu_so = "cũ" if len(cu) <= len(moi) else "mới"
        them("vang", "KIEU_DAU", (-1, 0), "cả file",
             "%d chữ kiểu cũ (%s), %d chữ kiểu mới (%s)" % (len(cu), ", ".join(sorted(set(cu))[:3]),
                                                           len(moi), ", ".join(sorted(set(moi))[:3])),
             "Trộn kiểu bỏ dấu. Sửa phần kiểu %s cho thống nhất với phần còn lại" % thieu_so)

    # từ vựng AI: chỉ báo khi dày đặc
    duoi_nguong = 0
    if tu_vung:
        mat_do = len(tu_vung) * 1000 / max(so_chu, 1)
        if len(tu_vung) >= mau.TU_VUNG["nguong_so_lan"] and mat_do >= mau.TU_VUNG["nguong_moi_1000_chu"]:
            for khoa, vi_tri, trich in tu_vung:
                them("vang", "TU_VUNG_AI", khoa, vi_tri, trich, mau.TU_VUNG["goi_y"])
        else:
            duoi_nguong = len(tu_vung)

    def thu_tu(f):
        so = re.search(r"\d+", f["vi_tri"])
        return (0 if f["muc"] == "do" else 1, int(so.group()) if so else 0, f["_khoa"][1])

    phat_hien.sort(key=thu_tu)
    for f in phat_hien:
        del f["_khoa"]
    return phat_hien, so_chu, duoi_nguong


# ---------------------------------------------------------------- điểm vào

def kiem_chu(ten, chu=None, loai=None):
    """Soát một file (đọc từ đĩa) hoặc một đoạn chữ kèm tên file để biết cách tách.

    Trả về dict: ten, loai, doan_loai, so_chu, phat_hien, tu_vung_duoi_nguong, bo_qua.
    """
    duoi = Path(str(ten)).suffix.lower()
    doan = loai is None
    loai = loai or doan_loai(ten)
    kq = dict(ten=str(ten), loai=loai, doan_loai=doan, so_chu=0, phat_hien=[], tu_vung_duoi_nguong=0, bo_qua=None)

    if duoi == ".docx" and chu is None:
        don_vi, tho, sach_md, van_ban = tach_docx(ten), None, None, True
    elif duoi == ".pptx" and chu is None:
        don_vi, tho, sach_md, van_ban = tach_pptx(ten), None, None, True
    else:
        if chu is None:
            chu = Path(ten).read_text(encoding="utf-8-sig", errors="replace")
        if mau.DANH_DAU_BO_QUA in chu:
            kq["bo_qua"] = "file có đánh dấu '%s'" % mau.DANH_DAU_BO_QUA
            return kq
        if duoi in DUOI_MA:
            don_vi, tho, sach_md, van_ban = tach_js(chu, jsx=duoi in (".tsx", ".jsx", ".vue")), chu, None, False
        elif duoi in DUOI_HTML:
            don_vi, tho, sach_md, van_ban = tach_html(chu), chu, None, False
        else:
            sach_md = lam_sach_md(chu)
            don_vi, tho, van_ban = tach_md(sach_md), chu, True
            if duoi not in (".md", ".markdown", ""):
                sach_md = None

    kq["phat_hien"], kq["so_chu"], kq["tu_vung_duoi_nguong"] = kiem(don_vi, loai, tho, van_ban, sach_md)
    return kq


def in_bao_cao(kq):
    if kq["bo_qua"]:
        return "%s: bỏ qua (%s)" % (kq["ten"], kq["bo_qua"])
    dong = ["%s  [loại %s%s, %d chữ]" % (kq["ten"], kq["loai"], ", đoán theo file" if kq["doan_loai"] else "", kq["so_chu"])]
    for f in kq["phat_hien"]:
        dong.append("  %s %-10s %-15s \"%s\"  -> %s" % ("ĐỎ  " if f["muc"] == "do" else "VÀNG", f["vi_tri"], f["ma"],
                                                      f["trich"], f["goi_y"]))
    n_do = sum(f["muc"] == "do" for f in kq["phat_hien"])
    n_vang = len(kq["phat_hien"]) - n_do
    cuoi = "  Sạch." if not kq["phat_hien"] else "  Tổng: %d ĐỎ, %d VÀNG." % (n_do, n_vang)
    if kq["tu_vung_duoi_nguong"]:
        cuoi += " Từ vựng AI: %d lần, dưới ngưỡng báo." % kq["tu_vung_duoi_nguong"]
    dong.append(cuoi)
    return "\n".join(dong)


def ma_thoat(kq):
    if any(f["muc"] == "do" for f in kq["phat_hien"]):
        return 2
    return 1 if kq["phat_hien"] else 0


def main():
    sys.stdout.reconfigure(encoding="utf-8")
    ap = argparse.ArgumentParser(description="Soát dấu hiệu văn AI theo loại văn bản")
    ap.add_argument("file", nargs="+", help="đường dẫn file, hoặc - để đọc stdin")
    ap.add_argument("--loai", choices=CAC_LOAI)
    ap.add_argument("--ten", default="stdin.md", help="tên giả cho stdin, để biết cách tách (vd: x.tsx)")
    ap.add_argument("--json", action="store_true")
    a = ap.parse_args()

    ket_qua, thoat = [], 0
    for f in a.file:
        try:
            if f == "-":
                kq = kiem_chu(a.ten, sys.stdin.buffer.read().decode("utf-8-sig", errors="replace"), a.loai)
            else:
                if Path(f).suffix.lower() not in DUOI_HO_TRO:
                    print("%s: không hỗ trợ đuôi file này" % f, file=sys.stderr)
                    thoat = max(thoat, 3)
                    continue
                kq = kiem_chu(f, None, a.loai)
        except (OSError, zipfile.BadZipFile, KeyError) as e:
            print("%s: không đọc được (%s)" % (f, e), file=sys.stderr)
            thoat = max(thoat, 3)
            continue
        ket_qua.append(kq)
        thoat = max(thoat, ma_thoat(kq))
        if not a.json:
            print(in_bao_cao(kq))
    if a.json:
        print(json.dumps(ket_qua, ensure_ascii=False, indent=1))
    return thoat


if __name__ == "__main__":
    sys.exit(main())
