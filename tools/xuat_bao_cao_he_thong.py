"""Xuất Báo Cáo Chi Tiết Toàn Bộ Hệ Thống IACC Cloud ra Excel (docs/IACC-Cloud-Chi-Tiet-He-Thong.xlsx).
Gồm 5 sheet:
  1. TongQuan: Thống kê định lượng, quy ước 4 gói, 4 giai đoạn, 3 chế độ thông tư, tiến độ tổng thể.
  2. MaTranTinhNang: Toàn bộ 139 tính năng Roadmap chuẩn (mã, tên, phân hệ, gói F/S/PL/PR, GĐ, IVT, trạng thái).
  3. ChiTietManHinh: Toàn bộ màn hình hệ thống (slug, loại màn, cấu hình chứng từ, danh mục, hạch toán, sổ TT58).
  4. BaoCao_MauIn: Toàn bộ báo cáo tài chính, báo cáo quản trị, sổ sách theo thông tư và 17 mẫu in chứng từ.
  5. TienDo_Tasks: 110 đầu việc T01-T108 bóc từ docs/TIEN-DO.md (người làm, trạng thái, ngày xong, nhật ký, ghi chú).

Chạy: python tools/xuat_bao_cao_he_thong.py
"""
import datetime
import json
import re
import sys
from pathlib import Path

import openpyxl
from openpyxl.styles import Alignment, Border, Font, PatternFill, Side
from openpyxl.utils import get_column_letter

ROOT = Path(__file__).resolve().parent.parent
PRESENT_TOOLS = ROOT.parent / 'Present' / 'tools'
sys.path.insert(0, str(PRESENT_TOOLS))
import build_present as bp

XLSX_OUT = ROOT / 'docs' / 'IACC-Cloud-Chi-Tiet-He-Thong.xlsx'

# Màu sắc thương hiệu và giao diện
NAVY_HEADER = '1E3A8A'      # Xanh Navy đậm tiêu đề
BLUE_SUB = '2563EB'         # Xanh dương phụ
SLATE_HEADER = '334155'     # Xám đậm
ZEBRA_FILL = 'F8FAFC'       # Dòng xen kẽ
WHITE = 'FFFFFF'

FILL_GREEN = 'DCFCE7'       # Xanh lá trạng thái Xong
TEXT_GREEN = '166534'
FILL_YELLOW = 'FEF9C3'      # Vàng Đang làm
TEXT_YELLOW = '854D0E'
FILL_GRAY = 'F1F5F9'        # Xám Chờ
TEXT_GRAY = '475569'
FILL_RED = 'FEE2E2'         # Đỏ Dở dang / Kẹt
TEXT_RED = '991B1B'

FONT_NAME = 'Segoe UI'

font_title = Font(name=FONT_NAME, size=15, bold=True, color='1E3A8A')
font_subtitle = Font(name=FONT_NAME, size=10, italic=True, color='64748B')
font_section = Font(name=FONT_NAME, size=11, bold=True, color='1E293B')
font_header = Font(name=FONT_NAME, size=10, bold=True, color=WHITE)
font_bold = Font(name=FONT_NAME, size=10, bold=True)
font_regular = Font(name=FONT_NAME, size=10)
font_small = Font(name=FONT_NAME, size=9)

thin_border = Border(
    left=Side(style='thin', color='CBD5E1'),
    right=Side(style='thin', color='CBD5E1'),
    top=Side(style='thin', color='CBD5E1'),
    bottom=Side(style='thin', color='CBD5E1'),
)
double_bottom = Border(
    left=Side(style='thin', color='CBD5E1'),
    right=Side(style='thin', color='CBD5E1'),
    top=Side(style='thin', color='CBD5E1'),
    bottom=Side(style='double', color='1E3A8A'),
)


def apply_header(ws, row_idx, headers, fill_hex=NAVY_HEADER):
    fill = PatternFill(start_color=fill_hex, end_color=fill_hex, fill_type='solid')
    for col_idx, text in enumerate(headers, 1):
        c = ws.cell(row=row_idx, column=col_idx, value=text)
        c.font = font_header
        c.fill = fill
        c.alignment = Alignment(horizontal='center', vertical='center', wrap_text=True)
        c.border = thin_border
    ws.row_dimensions[row_idx].height = 26


def autofit_and_freeze(ws, freeze_cell='A2', max_len_cap=60):
    ws.views.sheetView[0].showGridLines = True
    if freeze_cell:
        ws.freeze_panes = freeze_cell
    for col in ws.columns:
        col_letter = get_column_letter(col[0].column)
        max_len = 0
        for cell in col:
            val_str = str(cell.value or '')
            lines = val_str.split('\n')
            for line in lines:
                if len(line) > max_len:
                    max_len = len(line)
        ws.column_dimensions[col_letter].width = max(min(max_len + 3, max_len_cap), 10)


def load_all_tasks():
    tien_do_path = ROOT / 'docs' / 'TIEN-DO.md'
    if not tien_do_path.exists():
        return []
    lines = tien_do_path.read_text(encoding='utf-8').splitlines()
    tasks = []
    section = ''
    for line in lines:
        line_s = line.strip()
        if '## Đang làm và chờ làm' in line_s:
            section = 'dang_lam'
            continue
        elif '## Đã xong' in line_s:
            section = 'da_xong'
            continue
        if line_s.startswith('| T') or (line_s.startswith('|') and 'T' in line_s[:6] and not line_s.startswith('| Mã')):
            parts = [p.strip() for p in line_s.split('|')[1:-1]]
            if len(parts) >= 5:
                ma = parts[0]
                viec = parts[1]
                nguoi = parts[2]
                if section == 'dang_lam':
                    trang_thai = parts[3]
                    ghi_chu = parts[4]
                    xong_ngay = ''
                    nhat_ky = ''
                else:
                    trang_thai = 'Xong'
                    xong_ngay = parts[3]
                    nhat_ky = parts[4]
                    ghi_chu = ''
                tasks.append(dict(ma=ma, viec=viec, nguoi=nguoi, trang_thai=trang_thai, xong_ngay=xong_ngay, nhat_ky=nhat_ky, ghi_chu=ghi_chu))
    return tasks


def main():
    wb = openpyxl.Workbook()
    wb.remove(wb.active)  # xoá sheet rỗng mặc định

    # 1. Nạp tính năng từ build_present
    feats = bp.load_features()
    tasks = load_all_tasks()

    # Thống kê tính năng
    cnt_f = sum('F' in f['goi'] for f in feats)
    cnt_s = sum('S' in f['goi'] for f in feats)
    cnt_pl = sum('PL' in f['goi'] for f in feats)
    cnt_pr = sum('PR' in f['goi'] for f in feats)
    cnt_gd1 = sum(f['gd'] == 1 for f in feats)
    cnt_gd2 = sum(f['gd'] == 2 for f in feats)
    cnt_gd3 = sum(f['gd'] == 3 for f in feats)
    cnt_gd4 = sum(f['gd'] == 4 for f in feats)

    cnt_xong = sum(t['trang_thai'] == 'Xong' for t in tasks)
    cnt_dang_lam = sum(t['trang_thai'] == 'Đang làm' for t in tasks)
    cnt_cho = sum(t['trang_thai'] == 'Chờ' for t in tasks)
    cnt_ket = sum(t['trang_thai'] in ('Kẹt', 'Dở dang') for t in tasks)

    # ─────────────────────────────────────────────────────────────────────────
    # SHEET 1: Tổng quan
    # ─────────────────────────────────────────────────────────────────────────
    ws1 = wb.create_sheet(title='Tổng quan')
    ws1.cell(row=1, column=1, value='BÁO CÁO HỆ THỐNG PHẦN MỀM KẾ TOÁN IACC CLOUD').font = font_title
    ws1.cell(row=2, column=1, value=f'Ngày xuất: {datetime.date.today().strftime("%d/%m/%Y")} | Bản mẫu iaccdemo (React 19 + TypeScript + Vite) | Deploy: https://iaccdemo.pages.dev').font = font_subtitle

    # Khối 1: Định lượng hệ thống
    ws1.cell(row=4, column=1, value='1. QUY MÔ & TIẾN ĐỘ TỔNG THỂ').font = font_section
    headers_qm = ['Chỉ tiêu', 'Số lượng / Trạng thái', 'Ghi chú kỹ thuật']
    apply_header(ws1, 5, headers_qm, fill_hex=NAVY_HEADER)
    data_qm = [
        ('Tổng số phân hệ nghiệp vụ', '13 phân hệ', 'Gồm Trang chủ, 11 phân hệ kế toán và Hệ thống'),
        ('Tổng số tính năng trong Roadmap', f'{len(feats)} tính năng', 'Bao gồm 120 dòng Roadmap gốc + các nhánh mở rộng KHO_IVT & Extra'),
        ('Phân bổ gói: Free', f'{cnt_f} tính năng', 'Siêu tinh gọn, hộ kinh doanh & DN siêu nhỏ, không tài khoản'),
        ('Phân bổ gói: Standard', f'{cnt_s} tính năng', 'Doanh nghiệp siêu nhỏ theo Thông tư 58/2026/TT-BTC'),
        ('Phân bổ gói: Plus', f'{cnt_pl} tính năng', 'Doanh nghiệp vừa và nhỏ theo Thông tư 133/2016/TT-BTC'),
        ('Phân bổ gói: Pro', f'{cnt_pr} tính năng', 'Chuỗi F&B lớn theo Thông tư 99/TT200, đa kho đa chi nhánh'),
        ('Tiến độ phát hành: Giai đoạn 1 (GĐ1)', f'{cnt_gd1} tính năng', 'Core kế toán căn bản & thu chi, mua bán, kho đơn giản (Q4/2026)'),
        ('Tiến độ phát hành: Giai đoạn 2 (GĐ2)', f'{cnt_gd2} tính năng', 'Thuế GTGT, TSCĐ, CCDC, đồng bộ tự động, giá thành F&B'),
        ('Tiến độ phát hành: Giai đoạn 3 (GĐ3)', f'{cnt_gd3} tính năng', 'Đa chi nhánh, hoá đơn điện tử, phân bổ chuỗi, BCTC hợp nhất'),
        ('Tiến độ phát hành: Giai đoạn 4 (GĐ4)', f'{cnt_gd4} tính năng', 'Quản trị chuyên sâu F&B, AI tự động hoá, đối soát đa nền tảng'),
        ('Tổng số đầu việc kỹ thuật (TIEN-DO.md)', f'{len(tasks)} việc (T01 - T108)', 'Theo dõi trực tiếp trên repo GitHub iaccdemo'),
        ('Tiến độ việc: Đã hoàn thành', f'{cnt_xong} việc ({cnt_xong/len(tasks)*100:.1f}%)' if tasks else '0', 'Đã kiểm tra qua Playwright, build xanh và push online'),
        ('Tiến độ việc: Đang làm', f'{cnt_dang_lam} việc', 'Đang sửa trên các nhánh hoặc bản clone cục bộ'),
        ('Tiến độ việc: Chờ thực hiện', f'{cnt_cho} việc', 'Đang xếp hàng ưu tiên theo phân công của Trum'),
    ]
    for idx, (ct, sl, gc) in enumerate(data_qm, 6):
        c1 = ws1.cell(row=idx, column=1, value=ct)
        c2 = ws1.cell(row=idx, column=2, value=sl)
        c3 = ws1.cell(row=idx, column=3, value=gc)
        for c in (c1, c2, c3):
            c.font = font_regular
            c.border = thin_border
        c2.alignment = Alignment(horizontal='center')
        if 'Đã hoàn thành' in ct:
            c2.fill = PatternFill(start_color=FILL_GREEN, end_color=FILL_GREEN, fill_type='solid')
            c2.font = Font(name=FONT_NAME, size=10, bold=True, color=TEXT_GREEN)

    # Khối 2: Định nghĩa 4 gói
    r_start = len(data_qm) + 8
    ws1.cell(row=r_start, column=1, value='2. BẢNG ĐỊNH NGHĨA 4 GÓI DỊCH VỤ IACC CLOUD').font = font_section
    headers_goi = ['Gói phần mềm', 'Mã', 'Khách hàng mục tiêu', 'Chế độ kế toán áp dụng', 'Quy mô chi nhánh / Kho', 'Hệ thống tài khoản']
    apply_header(ws1, r_start + 1, headers_goi, fill_hex=BLUE_SUB)
    data_goi = [
        ('Gói Free', 'F', 'Hộ kinh doanh, quán cà phê/nhà hàng độc lập cần theo dõi dòng tiền & doanh thu', 'Không áp dụng chế độ kế toán bắt buộc; hỗ trợ 17 báo cáo theo chế độ HKD', 'Mỗi chi nhánh một kho độc lập', 'Không sử dụng tài khoản kế toán'),
        ('Gói Standard', 'S', 'Doanh nghiệp siêu nhỏ (≤ 10 lao động, doanh thu ≤ 10 tỷ hoặc vốn ≤ 3 tỷ)', 'Thông tư 58/2026/TT-BTC (có 4 trường hợp kê khai thuế)', 'Quản lý kho căn bản', 'Không sử dụng tài khoản kế toán; quản lý theo 8 mẫu sổ chính + 4 mẫu sổ bổ sung'),
        ('Gói Plus', 'PL', 'Doanh nghiệp vừa và nhỏ (SME), doanh nghiệp F&B có bộ phận kế toán riêng', 'Thông tư 133/2016/TT-BTC', 'Đa chi nhánh, kho tổng & kho điểm bán', 'Hệ thống tài khoản kế toán doanh nghiệp vừa và nhỏ đầy đủ (TK cấp 1, cấp 2)'),
        ('Gói Pro', 'PR', 'Doanh nghiệp quy mô lớn, chuỗi F&B nhiều thương hiệu, nhiều pháp nhân', 'Thông tư 99/TT200/2014/TT-BTC', 'Đa chi nhánh, tách nhiều kho tại 1 điểm bán (kho bếp, kho bar, kho đồ khô)', 'Hệ thống tài khoản kế toán doanh nghiệp đầy đủ; hỗ trợ phân bổ chi phí chuỗi, AI'),
    ]
    for idx, row in enumerate(data_goi, r_start + 2):
        for col_idx, val in enumerate(row, 1):
            c = ws1.cell(row=idx, column=col_idx, value=val)
            c.font = font_regular
            c.border = thin_border
            if col_idx == 2:
                c.alignment = Alignment(horizontal='center')
                c.font = font_bold

    # Khối 3: Nhân sự phối hợp
    r_start_ns = r_start + len(data_goi) + 3
    ws1.cell(row=r_start_ns, column=1, value='3. PHÂN CÔNG & QUY TRÌNH PHỐI HỢP (AGENTS.md)').font = font_section
    headers_ns = ['Thành viên', 'Tên GitHub', 'Vai trò chính trong dự án', 'Quy trình kiểm tra bắt buộc trước khi Push']
    apply_header(ws1, r_start_ns + 1, headers_ns, fill_hex=SLATE_HEADER)
    data_ns = [
        ('Trum', 'trungkhanhduong93', 'Giao việc, chốt quyết định kiến trúc (QD01-QD42), duyệt nghiệp vụ và mẫu TT58', 'npm run typecheck -> npm run build -> python tools/kiem_tra.py --nhanh -> git push main'),
        ('PhuongXT', 'PhuongXT', 'Lập trình viên: hoàn thiện form chứng từ, danh sách, bộ lọc, tuỳ chỉnh giao diện', 'npm run typecheck -> npm run build -> python tools/kiem_tra.py --nhanh -> kiểm tra commit mới trên origin/main'),
        ('dinhlanphuongipacc', 'dinhlanphuongipacc', 'Lập trình viên: hoàn thiện nghiệp vụ thẻ chi phí phân bổ, CCDC, TSCĐ', 'npm run typecheck -> npm run build -> python tools/kiem_tra.py --nhanh -> kiểm tra commit mới trên origin/main'),
    ]
    for idx, row in enumerate(data_ns, r_start_ns + 2):
        for col_idx, val in enumerate(row, 1):
            c = ws1.cell(row=idx, column=col_idx, value=val)
            c.font = font_regular
            c.border = thin_border
            if col_idx in (1, 2):
                c.font = font_bold
    autofit_and_freeze(ws1, freeze_cell='A6')

    # ─────────────────────────────────────────────────────────────────────────
    # SHEET 2: Ma trận tính năng (MaTranTinhNang)
    # ─────────────────────────────────────────────────────────────────────────
    ws2 = wb.create_sheet(title='Ma trận tính năng')
    headers_feats = [
        'STT', 'Mã tính năng', 'Tên tính năng', 'Phân hệ', 'Nhóm chức năng',
        'Gói Free', 'Gói Standard', 'Gói Plus', 'Gói Pro',
        'Giai đoạn', 'Kế thừa IVT', 'Trạng thái Web Demo', 'Ghi chú điều chỉnh / Nghiệp vụ'
    ]
    apply_header(ws2, 1, headers_feats, fill_hex=NAVY_HEADER)

    # Đọc ghi chú từ GOI_FIX và GD_FIX trong build_present
    goi_fix_notes = {k: v[1] for k, v in bp.GOI_FIX.items()}
    gd_fix_notes = {k: v[1] for k, v in bp.GD_FIX.items()}

    FIRST = {'Danh mục': 'Danh mục', 'Tiện ích bổ sung': 'Tiện ích'}
    GRP = {'Sổ sách báo cáo': 'Sổ sách, báo cáo', 'Sổ sách và báo cáo': 'Sổ sách, báo cáo'}

    for idx, f in enumerate(feats, 2):
        c_code = f['code']
        c_name = f['name']
        c_mod = f['mod']
        c_goi = f['goi']
        c_gd = f['gd']
        c_ivt = 'Có' if f['ivt'] else 'Không'

        # Nhóm con
        parts = c_code.split('-')[0].split('.')
        grp_name = 'Chứng từ'
        if c_mod in FIRST:
            grp_name = FIRST[c_mod]
        elif len(parts) == 3 and bp.TOP.get(parts[0]) == c_mod:
            grp_name = 'Sổ sách, báo cáo' if '2' in parts[1] else 'Chứng từ'

        # Trạng thái web
        trang_thai = 'Đã có giao diện' if c_gd <= 2 else 'Chờ giai đoạn sau'
        ghi_chu_parts = []
        if c_code in goi_fix_notes:
            ghi_chu_parts.append(goi_fix_notes[c_code])
        if c_code in gd_fix_notes:
            ghi_chu_parts.append(gd_fix_notes[c_code])
        if c_code in bp.KHONG_IVT:
            ghi_chu_parts.append('IACC Cloud tự tính, không kế thừa IVT')
        ghi_chu = '; '.join(ghi_chu_parts)

        row_vals = [
            idx - 1,
            c_code,
            c_name,
            c_mod,
            grp_name,
            'X' if 'F' in c_goi else '',
            'X' if 'S' in c_goi else '',
            'X' if 'PL' in c_goi else '',
            'X' if 'PR' in c_goi else '',
            f'GĐ{c_gd}',
            c_ivt,
            trang_thai,
            ghi_chu,
        ]

        zebra = (idx % 2 == 0)
        row_fill = PatternFill(start_color=ZEBRA_FILL, end_color=ZEBRA_FILL, fill_type='solid') if zebra else None

        for col_idx, val in enumerate(row_vals, 1):
            c = ws2.cell(row=idx, column=col_idx, value=val)
            c.font = font_regular
            c.border = thin_border
            if row_fill:
                c.fill = row_fill
            if col_idx in (1, 2, 6, 7, 8, 9, 10, 11, 12):
                c.alignment = Alignment(horizontal='center', vertical='center')
            if col_idx in (6, 7, 8, 9) and val == 'X':
                c.font = font_bold
                c.fill = PatternFill(start_color=FILL_GREEN, end_color=FILL_GREEN, fill_type='solid')
            if col_idx == 12 and val == 'Đã có giao diện':
                c.font = Font(name=FONT_NAME, size=10, color=TEXT_GREEN)

    ws2.auto_filter.ref = f'A1:M{len(feats)+1}'
    autofit_and_freeze(ws2, freeze_cell='C2')

    # ─────────────────────────────────────────────────────────────────────────
    # SHEET 3: Chi tiết màn hình (ChiTietManHinh)
    # ─────────────────────────────────────────────────────────────────────────
    ws3 = wb.create_sheet(title='Chi tiết màn hình')
    headers_screens = [
        'STT', 'Phân hệ', 'Mã màn hình', 'Tên màn hình', 'URL Slug',
        'Loại màn hình', 'Tab hiển thị', 'Tiền tố phiếu', 'Đối tượng',
        'Bút toán Nợ / Có mẫu', 'Sổ TT58 tương ứng', 'Đặc tả kỹ thuật / Cấu hình UI'
    ]
    apply_header(ws3, 1, headers_screens, fill_hex=NAVY_HEADER)

    # Đọc cấu hình từ các module
    # Bóc tách từ features và modules
    screen_rows = []
    # Khai báo ánh xạ phân hệ
    mod_keys = [
        ('trang-chu', 'Trang chủ', 11),
        ('tien', 'Thu chi', 1),
        ('ban-hang', 'Kế toán bán hàng', 2),
        ('mua-hang', 'Kế toán mua hàng', 3),
        ('kho', 'Kho hàng', 4),
        ('tscd', 'Tài sản cố định', 6),
        ('ccdc', 'Chi phí phân bổ', 7),
        ('thue', 'Kê khai thuế', 5),
        ('gia-thanh', 'Chi phí, giá thành', 8),
        ('tong-hop', 'Kế toán tổng hợp', 9),
        ('tien-ich', 'Tiện ích bổ sung', 10),
        ('danh-muc', 'Danh mục', 0),
        ('he-thong', 'Hệ thống', -1),
    ]

    # Bản đồ chi tiết voucher / catalog đã thu thập
    VOUCHER_DETAILS = {
        '2.1.1': dict(prefix='PC / PT / BC / UNC / CQ', dt='NCC / KH', no_co='Nợ 6421, 1331 / Có 1111; Nợ 1111 / Có 131; Nợ 1121 / Có 131; Nợ 331 / Có 1121', so_tt58='Sổ quỹ tiền mặt, Sổ TGNH, Sổ chi phí SXKD', note='5 loại phiếu: Thu tiền mặt, Chi tiền mặt, Thu ngân hàng, Chi ngân hàng, Chuyển quỹ. Form chuẩn IACC 50/50'),
        '2.1.2': dict(prefix='DCCN', dt='KH / NCC', no_co='Đối chiếu công nợ, không sinh bút toán sổ cái', so_tt58='Sổ chi tiết công nợ', note='Biên bản đối chiếu công nợ định kỳ theo khách hàng hoặc nhà cung cấp'),
        '2.1.3': dict(prefix='PBCP', dt='Nội bộ chuỗi', no_co='Nợ 642 (CN) / Có 642 (VP tổng)', so_tt58='Sổ chi phí', note='Công cụ tự động phân bổ chi phí văn phòng/kho tổng cho các chi nhánh theo doanh thu/tỷ lệ'),
        '3.1.1': dict(prefix='BH', dt='Khách lẻ FABi', no_co='Nợ 1111, 1121 / Có 5111, 33311; Nợ 632 / Có 152', so_tt58='Sổ doanh thu bán hàng', note='Chứng từ Xuất bán POS tự động đồng bộ từ FABi, có chiết khấu, phí DV, thuế VAT'),
        '3.1.2': dict(prefix='HDB', dt='Khách hàng', no_co='Nợ 131 / Có 5111, 33311; Nợ 632 / Có 152', so_tt58='Sổ doanh thu bán hàng', note='Hoá đơn bán hàng lập tay cho tiệc, khách công ty (gói Plus trở lên)'),
        '3.1.3': dict(prefix='BNB', dt='Chi nhánh nhận', no_co='Nợ 136 / Có 5111; Nợ 632 / Có 152', so_tt58='Sổ theo dõi nội bộ', note='Bán hàng nội bộ, tự động sinh phiếu nhập mua nội bộ tại chi nhánh đích'),
        '3.1.4': dict(prefix='TL', dt='Khách hàng', no_co='Nợ 5111, 33311 / Có 1111, 131', so_tt58='Sổ doanh thu bán hàng', note='Phiếu hàng bán trả lại do làm sai món hoặc huỷ đơn sau chốt ca'),
        '3.1.5': dict(prefix='C26T', dt='Khách hàng', no_co='Nợ 131 / Có 5111, 33311', so_tt58='Sổ doanh thu', note='Màn hoá đơn điện tử: phát hành, ký số, gửi cơ quan thuế'),
        '3.1.6': dict(prefix='DCHD', dt='Khách hàng', no_co='Nợ 5111, 33311 / Có 131', so_tt58='Sổ doanh thu', note='Lập hoá đơn điều chỉnh, hoá đơn thay thế sai sót'),
        '4.1.1': dict(prefix='PM', dt='Nhà cung cấp', no_co='Nợ 152, 1331 / Có 331, 1111', so_tt58='Sổ chi phí SXKD, Sổ VLSP', note='Phiếu mua hàng nhận từ iPOS Inventory hoặc nhập tay, có thuế VAT, kho nhập'),
        '4.1.2': dict(prefix='HDM', dt='Nhà cung cấp', no_co='Nợ 152, 1331 / Có 331', so_tt58='Sổ chi phí SXKD', note='Hoá đơn mua hàng đầu vào độc lập'),
        '4.1.3': dict(prefix='MSC', dt='Nhà cung cấp', no_co='Nợ 152 / Có 331', so_tt58='Sổ vật liệu dụng cụ', note='Phiếu mua hàng qua sơ chế (nhập thịt bò tảng sơ chế thành thịt tái...)'),
        '4.1.4': dict(prefix='TLN', dt='Nhà cung cấp', no_co='Nợ 331 / Có 152, 1331', so_tt58='Sổ chi phí SXKD', note='Trả lại hàng cho nhà cung cấp do kém chất lượng hoặc sai quy cách'),
        '4.1.5': dict(prefix='CPM', dt='NCC Dịch vụ', no_co='Nợ 152, 1331 / Có 331', so_tt58='Sổ chi phí', note='Phân bổ chi phí mua hàng (vận chuyển, bốc xếp) vào giá trị nhập kho NVL'),
        '4.1.6': dict(prefix='BSHD', dt='Nhà cung cấp', no_co='Nợ 1331 / Có 331', so_tt58='Sổ chi phí', note='Gắn hoá đơn bổ sung cho các phiếu mua hàng lập trước chưa có hoá đơn'),
        '5.1.1': dict(prefix='NK', dt='Nhà cung cấp / Kho', no_co='Nợ 152, 156 / Có 331, 111, 711', so_tt58='Sổ vật liệu sản phẩm', note='Phiếu nhập kho khác, nhập hàng thừa, nhập hồi phục NVL'),
        '5.1.2': dict(prefix='XK', dt='Bộ phận sử dụng', no_co='Nợ 621, 642 / Có 152, 156', so_tt58='Sổ vật liệu sản phẩm', note='Phiếu xuất kho: xuất huỷ hỏng, xuất sử dụng nội bộ, xuất bếp chế biến'),
        '5.1.4': dict(prefix='DCK', dt='Kho chuyển / nhận', no_co='Nợ 152 (Kho nhận) / Có 152 (Kho xuất)', so_tt58='Sổ vật liệu sản phẩm', note='Xuất nhập điều chuyển hàng giữa các kho hoặc giữa các chi nhánh'),
        '5.1.7': dict(prefix='GV', dt='Hệ thống', no_co='Nợ 632 / Có 152, 156', so_tt58='Sổ chi phí SXKD', note='Tự động tính giá vốn cuối kỳ theo bình quân gia quyền hoặc đích danh'),
        '5.1.10': dict(prefix='KK', dt='Tổ kiểm kê', no_co='Nợ/Có 1388, 3388, 152', so_tt58='Sổ vật liệu sản phẩm', note='Biên bản kiểm kê kho định kỳ, tự động xử lý chênh lệch thừa thiếu'),
        '6.1.1': dict(prefix='KT', dt='Cơ quan thuế', no_co='Nợ 33311 / Có 1331', so_tt58='Sổ thuế', note='Bút toán khấu trừ thuế GTGT cuối tháng / quý'),
        '6.1.2': dict(prefix='NT', dt='Kho bạc / Thuế', no_co='Nợ 33311 / Có 1111, 1121', so_tt58='Sổ tiền gửi ngân hàng', note='Chứng từ nộp thuế GTGT vào ngân sách nhà nước'),
        '7.1.1': dict(prefix='TGTS', dt='Nhà cung cấp', no_co='Nợ 211 / Có 331, 1121', so_tt58='Sổ tài sản cố định', note='Ghi tăng tài sản cố định, lập hồ sơ trích khấu hao'),
        '7.1.2': dict(prefix='TLTS', dt='Hội đồng thanh lý', no_co='Nợ 214, 811 / Có 211', so_tt58='Sổ tài sản cố định', note='Giảm, thanh lý, nhượng bán, điều chuyển hoặc tạm ngừng trích khấu hao TSCĐ'),
        '7.1.3': dict(prefix='KHTS', dt='Hệ thống', no_co='Nợ 627, 642 / Có 214', so_tt58='Sổ tài sản cố định', note='Bảng trích khấu hao TSCĐ tự động hàng tháng'),
        '8.1.1': dict(prefix='CPPB', dt='Hệ thống', no_co='Nợ 642 / Có 242', so_tt58='Sổ chi phí trả trước', note='Bảng phân bổ chi phí trả trước và công cụ dụng cụ (Thẻ chi phí phân bổ T107)'),
        '8.1.2': dict(prefix='TGDC', dt='Bộ phận sử dụng', no_co='Nợ 242 / Có 153', so_tt58='Sổ theo dõi CCDC', note='Ghi tăng, giảm, điều chuyển công cụ dụng cụ tại nơi sử dụng'),
        '8.1.3': dict(prefix='KKDC', dt='Tổ kiểm kê', no_co='Đối chiếu kiểm kê thực tế', so_tt58='Sổ theo dõi CCDC', note='Kiểm kê công cụ dụng cụ đang dùng tại các cơ sở kinh doanh'),
        '9.1.1': dict(prefix='THCP', dt='Hệ thống', no_co='Nợ 154 / Có 621, 622, 627', so_tt58='Sổ chi phí SXKD', note='Tập hợp chi phí sản xuất theo món hoặc theo nhóm thực đơn F&B'),
        '9.1.2': dict(prefix='GT', dt='Hệ thống', no_co='Nợ 155, 632 / Có 154', so_tt58='Sổ chi phí SXKD', note='Tính giá thành món ăn, bán thành phẩm qua nhiều công đoạn chế biến'),
        '10.1.1': dict(prefix='PKT', dt='Đối tượng khác', no_co='Tuỳ chọn Nợ / Có', so_tt58='Sổ chi tiết', note='Phiếu kế toán tổng hợp cho các nghiệp vụ phi tiền tệ khác'),
        '10.1.2': dict(prefix='KC', dt='Hệ thống', no_co='Nợ 911 / Có 511; Nợ 911 / Có 632, 642; Nợ 911 / Có 421', so_tt58='Sổ cái', note='Tự động kết chuyển doanh thu, chi phí, xác định kết quả kinh doanh'),
        '10.1.3': dict(prefix='SDK', dt='Hệ thống', no_co='Khai báo số dư đầu kỳ', so_tt58='Số dư đầu các sổ', note='Khai báo số dư ban đầu cho tài khoản, tồn kho, công nợ khách hàng, NCC'),
        '10.1.6': dict(prefix='KS', dt='Hệ thống', no_co='Khoá sổ kế toán', so_tt58='Khoá sổ', note='Tiện ích khoá sổ dữ liệu theo tháng/quý/năm, chặn sửa chứng từ đã chốt'),
    }

    # Tổng hợp danh sách màn hình từ features và hệ thống
    stt_scr = 1
    for f in feats:
        c_code = f['code']
        c_name = f['name']
        c_mod_name = f['mod']
        c_slug = c_code.replace('.', '-')

        # Xác định loại màn
        v_info = VOUCHER_DETAILS.get(c_code, {})
        is_report = 'báo cáo' in c_name.lower() or 'sổ' in c_name.lower() or 'bảng kê' in c_name.lower() or 'cân đối' in c_name.lower()
        is_catalog = 'danh mục' in c_name.lower()
        is_tool = 'tiện ích' in c_name.lower() or 'tự động' in c_name.lower() or 'đồng bộ' in c_name.lower() or c_code.startswith('11.') or c_code.startswith('X')

        if v_info or 'phiếu' in c_name.lower() or 'hoá đơn' in c_name.lower() or 'chứng từ' in c_name.lower():
            kind = 'Voucher (Chứng từ)'
        elif is_report:
            kind = 'Report (Báo cáo / Sổ)'
        elif is_catalog:
            kind = 'Catalog (Danh mục)'
        elif is_tool:
            kind = 'Tool (Tiện ích / Tự động)'
        else:
            kind = 'Custom (Màn riêng)'

        tab_hien_thi = 'Tab riêng' if not is_report else 'Thuộc tab Báo cáo'
        if c_code == '3.1.1':
            tab_hien_thi = 'Tab riêng (Mặc định)'

        row_scr = [
            stt_scr,
            c_mod_name,
            c_code,
            c_name,
            f'/app/{c_slug}',
            kind,
            tab_hien_thi,
            v_info.get('prefix', '-'),
            v_info.get('dt', '-'),
            v_info.get('no_co', '-'),
            v_info.get('so_tt58', '-'),
            v_info.get('note', f'Màn hình chuẩn thuộc phân hệ {c_mod_name}'),
        ]
        screen_rows.append(row_scr)
        stt_scr += 1

    # Thêm các màn Hệ thống
    he_thong_screens = [
        ('Hệ thống', 'HT-01', 'Thông tin đơn vị', 'thong-tin', 'Custom (Cài đặt)', 'Tab Cài đặt', 'Cấu hình MST, tên cty, địa chỉ, ngày bắt đầu năm tài chính'),
        ('Hệ thống', 'HT-02', 'Cấu hình kế toán', 'cau-hinh', 'Custom (Cài đặt)', 'Tab Cài đặt', 'Chọn thông tư áp dụng (TT58/133/99), phương pháp thuế GTGT, TNDN'),
        ('Hệ thống', 'HT-03', 'Người dùng', 'nguoi-dung', 'Custom (Quản trị)', 'Tab Quản trị', 'Quản lý tài khoản kế toán, chủ quán, thu ngân, phân quyền'),
        ('Hệ thống', 'HT-04', 'Vai trò và phân quyền', 'phan-quyen', 'Custom (Quản trị)', 'Tab Quản trị', 'Phân quyền chi tiết xem/thêm/sửa/xoá/duyệt theo vai trò'),
        ('Hệ thống', 'HT-05', 'Nhật ký thao tác', 'nhat-ky', 'Custom (Quản trị)', 'Tab Quản trị', 'Ghi log chi tiết ai thêm, sửa, xoá chứng từ lúc nào (từ gói S)'),
        ('Hệ thống', 'HT-06', 'Gói thuê bao', 'goi-thue-bao', 'Custom (Thuê bao)', 'Tab Thuê bao', 'Hiển thị gói Free, Standard, Plus, Pro và nâng cấp gói'),
        ('Trang chủ', 'TC-01', 'Tổng quan (Dashboard)', 'tong-quan', 'Custom (Trang chủ)', 'Tab chính', 'Chủ DN xem doanh thu, dòng tiền, chi phí, lợi nhuận, biểu đồ'),
        ('Trang chủ', 'TC-02', 'Bàn làm việc', 'ban-lam-viec', 'Custom (Trang chủ)', 'Tab chính', 'Kế toán xem chứng từ chờ duyệt, nhắc việc cuối kỳ, cảnh báo lỗi'),
    ]
    for ht_mod, ht_code, ht_name, ht_slug, ht_kind, ht_tab, ht_note in he_thong_screens:
        screen_rows.append([
            stt_scr, ht_mod, ht_code, ht_name, f'/app/he-thong/{ht_slug}', ht_kind, ht_tab, '-', '-', '-', '-', ht_note
        ])
        stt_scr += 1

    for idx, r_data in enumerate(screen_rows, 2):
        zebra = (idx % 2 == 0)
        row_fill = PatternFill(start_color=ZEBRA_FILL, end_color=ZEBRA_FILL, fill_type='solid') if zebra else None
        for col_idx, val in enumerate(r_data, 1):
            c = ws3.cell(row=idx, column=col_idx, value=val)
            c.font = font_regular
            c.border = thin_border
            if row_fill:
                c.fill = row_fill
            if col_idx in (1, 3, 5, 6, 7, 8, 9):
                c.alignment = Alignment(horizontal='center', vertical='center')
            if col_idx == 6:
                if 'Voucher' in str(val):
                    c.font = font_bold
                    c.fill = PatternFill(start_color='E0E7FF', end_color='E0E7FF', fill_type='solid')
                elif 'Report' in str(val):
                    c.fill = PatternFill(start_color='FEF3C7', end_color='FEF3C7', fill_type='solid')

    ws3.auto_filter.ref = f'A1:L{len(screen_rows)+1}'
    autofit_and_freeze(ws3, freeze_cell='D2')

    # ─────────────────────────────────────────────────────────────────────────
    # SHEET 4: Báo cáo & Mẫu in (BaoCao_MauIn)
    # ─────────────────────────────────────────────────────────────────────────
    ws4 = wb.create_sheet(title='Báo cáo & Mẫu in')
    headers_bc = [
        'STT', 'Phân loại', 'Mã báo cáo / ID mẫu in', 'Tên báo cáo / Biểu mẫu', 'Phân hệ gốc',
        'Khổ in', 'Mẫu số TT58', 'Mẫu số TT133', 'Mẫu số TT99/200', 'Gói áp dụng', 'Trạng thái trên Web'
    ]
    apply_header(ws4, 1, headers_bc, fill_hex=NAVY_HEADER)

    # Danh sách báo cáo chi tiết
    bc_data = [
        # Thu chi
        ('Sổ quỹ', '2.2.1', 'Sổ quỹ tiền mặt', 'Thu chi', 'A4 Dọc', 'S2a-DNSN', 'S04a-DNN', 'S07-DN', 'F, S, PL, PR', 'Đã có mẫu tờ in & bảng dữ liệu'),
        ('Sổ kế toán', '2.2.2', 'Sổ chi tiết các tài khoản tiền mặt', 'Thu chi', 'A4 Ngang', '-', 'S19-DNN', 'S38-DN', 'PL, PR', 'Đã có mẫu tờ in & bảng dữ liệu'),
        ('Sổ ngân hàng', '2.2.3', 'Sổ tiền gửi ngân hàng', 'Thu chi', 'A4 Dọc', 'S2b-DNSN', 'S05-DNN', 'S08-DN', 'F, S, PL, PR', 'Đã có mẫu tờ in & bảng dữ liệu'),
        ('Sổ nhật ký', '2.2.4', 'Sổ nhật ký chung', 'Thu chi', 'A4 Ngang', '-', 'S03a-DNN', 'S03a-DN', 'PL, PR', 'Đã có mẫu tờ in & bảng dữ liệu'),
        ('Sổ công nợ', '2.2.5', 'Sổ chi tiết thanh toán với người mua / người bán', 'Thu chi', 'A4 Ngang', 'S4a-DNSN', 'S12-DNN', 'S31-DN', 'S, PL, PR', 'Đã có mẫu tờ in & bảng dữ liệu'),
        ('Sổ tiền vay', '2.2.6', 'Sổ chi tiết tiền vay (TK 341)', 'Thu chi', 'A4 Ngang', '-', 'S15-DNN', 'S34-DN', 'PL, PR', 'Đã có mẫu tờ in & bảng dữ liệu'),
        ('Sổ chi tiết tiền', '2.2.7', 'Sổ chi tiết tiền (Tiền mặt & TGNH kết hợp)', 'Thu chi', 'A4 Dọc', 'S2d-DNSN', '-', '-', 'S (TT58)', 'Đã có mẫu tờ in & bảng dữ liệu'),
        ('Báo cáo quản trị', '2.2.8', 'Tổng hợp quỹ tiền các chi nhánh', 'Thu chi', 'A4 Dọc', '-', '-', '-', 'F, S, PL, PR', 'Đã có mẫu tờ in & bảng dữ liệu'),
        ('Báo cáo quản trị', '2.2.9', 'Báo cáo dòng tiền thu chi thực tế', 'Thu chi', 'A4 Dọc', '-', '-', '-', 'F, S, PL, PR', 'Đã có mẫu tờ in & bảng dữ liệu'),

        # Bán hàng
        ('Báo cáo bán hàng', '3.2.1', 'Báo cáo chi tiết bán hàng theo nhóm món', 'Bán hàng', 'A4 Ngang', '-', '-', '-', 'F, S, PL, PR', 'Đã có mẫu tờ in & bảng dữ liệu'),
        ('Bảng kê hoá đơn', '3.2.2', 'Bảng kê hoá đơn bán ra đối soát', 'Bán hàng', 'A4 Ngang', '-', '-', '-', 'S, PL, PR', 'Màn riêng đối soát POS & HĐ'),
        ('Báo cáo doanh thu', '3.2.3', 'Báo cáo tổng hợp doanh thu theo kênh bán', 'Bán hàng', 'A4 Ngang', '-', '-', '-', 'F, S, PL, PR', 'Đã có mẫu tờ in & bảng dữ liệu'),
        ('Bảng kê', '3.2.4', 'Bảng kê chi tiết chứng từ bán lẻ POS', 'Bán hàng', 'A4 Ngang', '-', '-', '-', 'F, S, PL, PR', 'Đã có mẫu tờ in & bảng dữ liệu'),
        ('Sổ bán hàng', '3.2.5', 'Sổ doanh thu bán hàng hoá, dịch vụ', 'Bán hàng', 'A4 Ngang', 'S1-DNSN', 'S16-DNN', 'S35-DN', 'F, S, PL, PR', 'Đã có mẫu tờ in & bảng dữ liệu'),

        # Mua hàng
        ('Báo cáo mua hàng', '4.2.1', 'Báo cáo chi tiết mua hàng theo nhà cung cấp', 'Mua hàng', 'A4 Ngang', '-', '-', '-', 'S, PL, PR', 'Đã có mẫu tờ in & bảng dữ liệu'),
        ('Báo cáo mua hàng', '4.2.2', 'Báo cáo tổng hợp mua hàng theo ngày', 'Mua hàng', 'A4 Dọc', '-', '-', '-', 'F, S, PL, PR', 'Đã có mẫu tờ in & bảng dữ liệu'),
        ('Sổ công nợ NCC', '4.2.3', 'Sổ công nợ chi tiết nhà cung cấp', 'Mua hàng', 'A4 Ngang', 'S4b-DNSN', 'S13-DNN', 'S32-DN', 'S, PL, PR', 'Đã có mẫu tờ in & bảng dữ liệu'),
        ('Báo cáo nhập hàng', '4.2.4', 'Báo cáo tổng hợp nhập hàng từ nhà cung cấp', 'Mua hàng', 'A4 Dọc', '-', '-', '-', 'S, PL, PR', 'Đã có mẫu tờ in & bảng dữ liệu'),
        ('Báo cáo nhập hàng', '4.2.5', 'Báo cáo chi tiết nhập hàng theo mặt hàng', 'Mua hàng', 'A4 Ngang', '-', '-', '-', 'S, PL, PR', 'Đã có mẫu tờ in & bảng dữ liệu'),
        ('Báo cáo mua hàng', '4.2.6', 'Báo cáo mua hàng theo ngày chi tiết', 'Mua hàng', 'A4 Ngang', '-', '-', '-', 'F, S, PL, PR', 'Đã có mẫu tờ in & bảng dữ liệu'),

        # Kho
        ('Thẻ kho', '5.2.1', 'Thẻ kho (Sổ chi tiết vật liệu, hàng hoá)', 'Kho hàng', 'A4 Dọc', 'S3a-DNSN', 'S10-DNN', 'S12-DN', 'S, PL, PR', 'Đã có mẫu tờ in & bảng dữ liệu'),
        ('Báo cáo kho', '5.2.2', 'Báo cáo tổng hợp nhập kho, xuất kho', 'Kho hàng', 'A4 Ngang', '-', '-', '-', 'S, PL, PR', 'Đã có mẫu tờ in & bảng dữ liệu'),
        ('Báo cáo kho', '5.2.3', 'Báo cáo xuất nhập tồn kho nguyên vật liệu', 'Kho hàng', 'A4 Ngang', 'S3b-DNSN', '-', '-', 'F, S, PL, PR', 'Đã có mẫu tờ in & bảng dữ liệu'),
        ('Báo cáo kho', '5.2.4', 'Báo cáo tồn kho tức thời tại các điểm bán', 'Kho hàng', 'A4 Dọc', '-', '-', '-', 'F, S, PL, PR', 'Đã có mẫu tờ in & bảng dữ liệu'),
        ('Báo cáo F&B', '5.2.5', 'Đối chiếu xuất kho thực tế với định lượng POS', 'Kho hàng', 'A4 Ngang', '-', '-', '-', 'PL, PR', 'Đặc thù F&B iPOS'),
        ('Báo cáo F&B', '5.2.6', 'Báo cáo tiêu hao nguyên vật liệu chính', 'Kho hàng', 'A4 Dọc', '-', '-', '-', 'PL, PR', 'Đặc thù F&B iPOS'),
        ('Sổ chi tiết NVL', '5.2.8', 'Sổ chi tiết nguyên vật liệu, dụng cụ, sản phẩm', 'Kho hàng', 'A4 Ngang', 'S3-DNSN', '-', '-', 'S (TT58)', 'Đã có mẫu tờ in & bảng dữ liệu'),

        # Thuế GTGT
        ('Bảng kê thuế', '6.2.1', 'Bảng kê hoá đơn hàng hoá dịch vụ mua vào', 'Thuế GTGT', 'A4 Ngang', '01-2/GTGT', '01-2/GTGT', '01-2/GTGT', 'S, PL, PR', 'Đã có mẫu tờ in & bảng dữ liệu'),
        ('Bảng kê thuế', '6.2.2', 'Bảng kê hoá đơn hàng hoá dịch vụ bán ra', 'Thuế GTGT', 'A4 Ngang', '01-1/GTGT', '01-1/GTGT', '01-1/GTGT', 'S, PL, PR', 'Đã có mẫu tờ in & bảng dữ liệu'),
        ('Tờ khai thuế', '6.2.3', 'Tờ khai thuế giá trị gia tăng', 'Thuế GTGT', 'A4 Dọc', '01/GTGT', '01/GTGT', '01/GTGT', 'S, PL, PR', 'Chuẩn biểu mẫu Tổng cục Thuế'),

        # TSCĐ & CCDC
        ('Sổ TSCĐ', '7.2.1', 'Sổ tài sản cố định', 'TSCĐ', 'A4 Ngang', '-', 'S21-DNN', 'S40-DN', 'PL, PR', 'Đã có mẫu tờ in & bảng dữ liệu'),
        ('Báo cáo TSCĐ', '7.2.2', 'Báo cáo tình hình tăng giảm TSCĐ', 'TSCĐ', 'A4 Ngang', '-', '-', '-', 'PL, PR', 'Đã có mẫu tờ in & bảng dữ liệu'),
        ('Bảng tính KH', '7.2.3', 'Bảng tính và phân bổ khấu hao TSCĐ', 'TSCĐ', 'A4 Ngang', '-', '-', '-', 'PL, PR', 'Đã có mẫu tờ in & bảng dữ liệu'),
        ('Sổ theo dõi CCDC', '8.2.1', 'Sổ theo dõi CCDC tại nơi sử dụng', 'CCDC', 'A4 Ngang', '-', 'S22-DNN', 'S41-DN', 'S, PL, PR', 'Đã có mẫu tờ in & bảng dữ liệu'),
        ('Bảng phân bổ CCDC', '8.2.3', 'Bảng tính và phân bổ công cụ dụng cụ, chi phí', 'CCDC', 'A4 Ngang', '-', '-', '-', 'F, S, PL, PR', 'Đã có mẫu tờ in & bảng dữ liệu'),

        # Tổng hợp & BCTC
        ('Bảng cân đối', '10.2.1', 'Bảng cân đối số phát sinh các tài khoản', 'Tổng hợp', 'A4 Ngang', '-', 'F01-DNN', 'F01-DN', 'PL, PR', 'Đã có mẫu tờ in & bảng dữ liệu'),
        ('BCTC', '10.2.2', 'Báo cáo tình hình tài chính (Bảng CĐKT)', 'Tổng hợp', 'A4 Dọc', 'B01-DNSN', 'B01a-DNN', 'B01-DN', 'S, PL, PR', 'Đã có mẫu tờ in & bảng dữ liệu'),
        ('BCTC', '10.2.3', 'Báo cáo kết quả hoạt động kinh doanh', 'Tổng hợp', 'A4 Dọc', 'B02-DNSN', 'B02-DNN', 'B02-DN', 'S, PL, PR', 'Đã có mẫu tờ in & bảng dữ liệu'),
        ('BCTC', '10.2.4', 'Báo cáo lưu chuyển tiền tệ', 'Tổng hợp', 'A4 Dọc', '-', 'B03-DNN', 'B03-DN', 'PL, PR', 'Đã có mẫu tờ in & bảng dữ liệu'),
        ('BCTC', '10.2.5', 'Bản thuyết minh báo cáo tài chính', 'Tổng hợp', 'A4 Dọc', '-', 'B09-DNN', 'B09-DN', 'PL, PR', 'Khung thuyết minh chuẩn'),
        ('Báo cáo quản trị', '10.3.1', 'Bộ báo cáo quản trị F&B chuyên sâu', 'Tổng hợp', 'A4 Ngang', '-', '-', '-', 'PR', 'Đặc thù chuỗi F&B'),

        # 17 Mẫu in chứng từ (mau-in.ts)
        ('Mẫu in chứng từ', 'phieu-thu', 'Phiếu thu tiền mặt', 'Mẫu in', 'A5 / A4', '01-TT', '01-TT', '01-TT', 'Mọi gói', 'Đã dựng hoàn chỉnh theo QD31'),
        ('Mẫu in chứng từ', 'phieu-chi', 'Phiếu chi tiền mặt', 'Mẫu in', 'A5 / A4', '02-TT', '02-TT', '02-TT', 'Mọi gói', 'Đã dựng hoàn chỉnh theo QD31'),
        ('Mẫu in chứng từ', 'phieu-thu-nh', 'Giấy báo Có (Thu ngân hàng)', 'Mẫu in', 'A4 Dọc', '-', '-', '-', 'Mọi gói', 'Đã dựng hoàn chỉnh theo QD31'),
        ('Mẫu in chứng từ', 'uy-nhiem-chi', 'Uỷ nhiệm chi ngân hàng', 'Mẫu in', 'A4 Ngang', '-', '-', '-', 'Mọi gói', 'Đã dựng hoàn chỉnh theo QD31'),
        ('Mẫu in chứng từ', 'phieu-nhap-kho', 'Phiếu nhập kho vật tư, hàng hoá', 'Mẫu in', 'A5 / A4', '01-VT', '01-VT', '01-VT', 'Mọi gói', 'Đã dựng hoàn chỉnh theo QD31'),
        ('Mẫu in chứng từ', 'phieu-xuat-kho', 'Phiếu xuất kho vật tư, hàng hoá', 'Mẫu in', 'A5 / A4', '02-VT', '02-VT', '02-VT', 'Mọi gói', 'Đã dựng hoàn chỉnh theo QD31'),
        ('Mẫu in chứng từ', 'bang-ke-mua-hang', 'Bảng kê mua hàng hoá không hoá đơn', 'Mẫu in', 'A4 Dọc', '01/TNDN', '01/TNDN', '01/TNDN', 'Mọi gói', 'Đã dựng hoàn chỉnh theo QD31'),
        ('Mẫu in chứng từ', 'bien-ban-huy', 'Biên bản huỷ hàng / nguyên vật liệu', 'Mẫu in', 'A4 Dọc', '-', '-', '-', 'Mọi gói', 'Đã dựng hoàn chỉnh theo QD31'),
        ('Mẫu in chứng từ', 'phieu-xk-vcnb', 'Phiếu xuất kho kiêm vận chuyển nội bộ', 'Mẫu in', 'A4 Dọc', '-', '-', '-', 'Mọi gói', 'Đã dựng hoàn chỉnh theo QD31'),
        ('Mẫu in chứng từ', 'bien-ban-kiem-ke', 'Biên bản kiểm kê vật tư, hàng hoá', 'Mẫu in', 'A4 Ngang', '05-VT', '05-VT', '05-VT', 'Mọi gói', 'Đã dựng hoàn chỉnh theo QD31'),
        ('Mẫu in chứng từ', 'bb-giao-nhan-tscd', 'Biên bản giao nhận tài sản cố định', 'Mẫu in', 'A4 Dọc', '-', '01-TSCĐ', '01-TSCĐ', 'PL, PR', 'Đã dựng hoàn chỉnh theo QD31'),
        ('Mẫu in chứng từ', 'bb-thanh-ly-tscd', 'Biên bản thanh lý tài sản cố định', 'Mẫu in', 'A4 Dọc', '-', '02-TSCĐ', '02-TSCĐ', 'PL, PR', 'Đã dựng hoàn chỉnh theo QD31'),
        ('Mẫu in chứng từ', 'bien-ban-ccdc', 'Biên bản điều chuyển, ghi giảm CCDC', 'Mẫu in', 'A4 Dọc', '-', '-', '-', 'Mọi gói', 'Đã dựng hoàn chỉnh theo QD31'),
        ('Mẫu in chứng từ', 'phieu-ke-toan', 'Phiếu kế toán', 'Mẫu in', 'A5 / A4', '-', '-', '-', 'PL, PR', 'Đã dựng hoàn chỉnh theo QD31'),
        ('Mẫu in chứng từ', 'bang-ke-ban-hang', 'Bảng kê bán lẻ hàng hoá dịch vụ', 'Mẫu in', 'A4 Dọc', '-', '-', '-', 'Mọi gói', 'Đã dựng hoàn chỉnh theo QD31'),
        ('Mẫu in chứng từ', 'hoa-don', 'Hoá đơn giá trị gia tăng / Bán hàng', 'Mẫu in', 'A4 Dọc', '-', '-', '-', 'Mọi gói', 'Đã dựng hoàn chỉnh theo QD31'),
        ('Mẫu in chứng từ', 'bien-ban-doi-chieu', 'Biên bản đối chiếu công nợ', 'Mẫu in', 'A4 Dọc', '-', '-', '-', 'Mọi gói', 'Đã dựng hoàn chỉnh theo QD31'),
    ]

    for idx, r_item in enumerate(bc_data, 2):
        row_vals = [idx - 1] + list(r_item)
        zebra = (idx % 2 == 0)
        row_fill = PatternFill(start_color=ZEBRA_FILL, end_color=ZEBRA_FILL, fill_type='solid') if zebra else None
        for col_idx, val in enumerate(row_vals, 1):
            c = ws4.cell(row=idx, column=col_idx, value=val)
            c.font = font_regular
            c.border = thin_border
            if row_fill:
                c.fill = row_fill
            if col_idx in (1, 2, 3, 5, 6, 7, 8, 9, 10):
                c.alignment = Alignment(horizontal='center', vertical='center')
            if col_idx == 2 and 'Mẫu in' in str(val):
                c.fill = PatternFill(start_color='E0F2FE', end_color='E0F2FE', fill_type='solid')
                c.font = font_bold
            if col_idx == 11 and 'Đã' in str(val):
                c.font = Font(name=FONT_NAME, size=10, color=TEXT_GREEN)

    ws4.auto_filter.ref = f'A1:K{len(bc_data)+1}'
    autofit_and_freeze(ws4, freeze_cell='E2')

    # ─────────────────────────────────────────────────────────────────────────
    # SHEET 5: Tiến độ Task T01-T108 (TienDo_Tasks)
    # ─────────────────────────────────────────────────────────────────────────
    ws5 = wb.create_sheet(title='Tiến độ công việc')
    headers_tasks = [
        'STT', 'Mã Task', 'Nội dung công việc', 'Người phụ trách', 'Trạng thái',
        'Ngày hoàn thành', 'File nhật ký ghi nhận', 'Ghi chú kỹ thuật'
    ]
    apply_header(ws5, 1, headers_tasks, fill_hex=NAVY_HEADER)

    for idx, t in enumerate(tasks, 2):
        stt_val = idx - 1
        t_ma = t['ma']
        t_viec = t['viec']
        t_nguoi = t['nguoi']
        t_tt = t['trang_thai']
        t_ngay = t['xong_ngay']
        t_nk = t['nhat_ky']
        t_gc = t['ghi_chu']

        row_vals = [stt_val, t_ma, t_viec, t_nguoi, t_tt, t_ngay, t_nk, t_gc]
        zebra = (idx % 2 == 0)
        row_fill = PatternFill(start_color=ZEBRA_FILL, end_color=ZEBRA_FILL, fill_type='solid') if zebra else None

        for col_idx, val in enumerate(row_vals, 1):
            c = ws5.cell(row=idx, column=col_idx, value=val)
            c.font = font_regular
            c.border = thin_border
            if row_fill:
                c.fill = row_fill
            if col_idx in (1, 2, 4, 5, 6):
                c.alignment = Alignment(horizontal='center', vertical='center')
            if col_idx == 2:
                c.font = font_bold
            if col_idx == 5:
                # Đổi màu trạng thái
                if val == 'Xong':
                    c.fill = PatternFill(start_color=FILL_GREEN, end_color=FILL_GREEN, fill_type='solid')
                    c.font = Font(name=FONT_NAME, size=10, bold=True, color=TEXT_GREEN)
                elif val == 'Đang làm':
                    c.fill = PatternFill(start_color=FILL_YELLOW, end_color=FILL_YELLOW, fill_type='solid')
                    c.font = Font(name=FONT_NAME, size=10, bold=True, color=TEXT_YELLOW)
                elif val in ('Kẹt', 'Dở dang'):
                    c.fill = PatternFill(start_color=FILL_RED, end_color=FILL_RED, fill_type='solid')
                    c.font = Font(name=FONT_NAME, size=10, bold=True, color=TEXT_RED)
                else:
                    c.fill = PatternFill(start_color=FILL_GRAY, end_color=FILL_GRAY, fill_type='solid')
                    c.font = Font(name=FONT_NAME, size=10, color=TEXT_GRAY)

    ws5.auto_filter.ref = f'A1:H{len(tasks)+1}'
    autofit_and_freeze(ws5, freeze_cell='D2')

    # Lưu workbook
    XLSX_OUT.parent.mkdir(parents=True, exist_ok=True)
    wb.save(XLSX_OUT)
    print(f'✅ Đã xuất báo cáo chi tiết thành công: {XLSX_OUT}')
    print(f'   - Sheet 1: Tổng quan ({len(data_qm)} chỉ tiêu + {len(data_goi)} gói + {len(data_ns)} nhân sự)')
    print(f'   - Sheet 2: Ma trận tính năng ({len(feats)} tính năng Roadmap)')
    print(f'   - Sheet 3: Chi tiết màn hình ({len(screen_rows)} màn hình hệ thống)')
    print(f'   - Sheet 4: Báo cáo & Mẫu in ({len(bc_data)} sổ sách, BCTC & mẫu in)')
    print(f'   - Sheet 5: Tiến độ công việc ({len(tasks)} tasks T01-T108)')


if __name__ == '__main__':
    main()
