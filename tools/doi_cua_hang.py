# T294: đổi khái niệm chi nhánh thành Cửa hàng trong src/ và tools/kiem_tra.py. Chạy lại được nhiều lần (lần sau không còn gì để đổi).
# Giữ nguyên chi nhánh ngân hàng. Chạy ở thư mục gốc repo: python tools/doi_cua_hang.py
# Dùng một lần cho T294 (QD66): lấy bản mới về rồi chạy lại để đổi cả code người khác vừa thêm. Tự bỏ qua chính tệp này.
import io, os, re, subprocess, sys

GIU = ['chiNhanhNh', 'Vietcombank, chi nhánh', 'Techcombank, chi nhánh', 'BIDV, chi nhánh', 'ACB, chi nhánh',
       'Chi nhánh ngân hàng', 'chi nhánh ngân hàng', 'BANK_BRANCH']
DOI = [
    ('CHI_NHANH', 'CUA_HANG'), ('ChiNhanh', 'CuaHang'), ('chiNhanh', 'cuaHang'), ('chi-nhanh', 'cua-hang'), ('chi_nhanh', 'cua_hang'),
    ('CHI NHÁNH', 'CỬA HÀNG'), ('Chi Nhánh', 'Cửa Hàng'), ('Chi nhánh', 'Cửa hàng'), ('chi nhánh', 'cửa hàng'),
    ('chi nhanh', 'cua hang'), ('Chi nhanh', 'Cua hang'),
    # khoá viết liền: nhóm lọc báo cáo, tham số kiem_tra; tên biểu tượng chinhanh giữ nguyên (icon-dac.ts sinh bởi xuat_bieu_tuong.py)
    ("nhom: 'chinhanh'", "nhom: 'cuahang'"), ("khopKhoa: ['cn', 'chinhanh']", "khopKhoa: ['cn', 'cuahang', 'chinhanh']"), ('p=chinhanh', 'p=cuahang'),
]
DUOI = ('.ts', '.tsx', '.css', '.json', '.py')
BO = {os.path.normpath('src/app/features.json')}

def tep():
    for goc in ('src',):
        for d, _, fs in os.walk(goc):
            for f in fs:
                p = os.path.normpath(os.path.join(d, f))
                if f.endswith(DUOI) and p not in BO:
                    yield p
    yield os.path.normpath('tools/kiem_tra.py')   # không đưa tools/doi_cua_hang.py vào, kẻo tự đổi bảng DOI

def doi(s):
    for i, g in enumerate(GIU):
        s = s.replace(g, f'\x00{i}\x00')
    for a, b in DOI:
        s = s.replace(a, b)
    for i, g in enumerate(GIU):
        s = s.replace(f'\x00{i}\x00', g)
    return s

so = 0
for p in tep():
    s = io.open(p, encoding='utf-8').read()
    m = doi(s)
    if m != s:
        io.open(p, 'w', encoding='utf-8', newline='').write(m)
        so += 1
print('đã sửa', so, 'tệp')

# Đổi tên tệp có ChiNhanh trong tên
for d, _, fs in os.walk('src'):
    for f in fs:
        if 'ChiNhanh' in f:
            cu, moi = os.path.join(d, f), os.path.join(d, f.replace('ChiNhanh', 'CuaHang'))
            subprocess.run(['git', 'mv', cu, moi], check=True)
            print('đổi tên', cu, '->', moi)
