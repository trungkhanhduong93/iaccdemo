"""Cài skill bản đồ repo vào máy người đang dùng, để agent đỡ tốn token ở mọi repo git (T487).

Chép tools/skill-ban-do-repo/ vào ~/.claude/skills/ban-do-repo/, thêm một mục luật có đánh dấu
vào ~/.claude/CLAUDE.md và ~/.gemini/GEMINI.md (nếu máy có Antigravity). Sao lưu file luật trước khi sửa.

    python tools/cai_skill_ban_do.py          cài hoặc cập nhật
    python tools/cai_skill_ban_do.py --kiem   in trạng thái: chua-cai, da-cai, cu-hon, tu-choi, ban-rieng
    python tools/cai_skill_ban_do.py --khong  ghi nhớ người dùng không muốn cài, không hỏi lại
    python tools/cai_skill_ban_do.py --go     gỡ skill và mục luật đã thêm
"""
import shutil
import sys
import time
from pathlib import Path

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

ROOT = Path(__file__).resolve().parent.parent
GOI = ROOT / 'tools' / 'skill-ban-do-repo'
NHA = Path.home()
DICH = NHA / '.claude' / 'skills' / 'ban-do-repo'
DAU_CAI = DICH / '.cai-tu-iaccdemo'
TU_CHOI = NHA / '.claude' / '.ban-do-repo-tu-choi'
FILE_LUAT = [NHA / '.claude' / 'CLAUDE.md', NHA / '.gemini' / 'GEMINI.md']
MO = '<!-- ban-do-repo: bắt đầu'
DONG = '<!-- ban-do-repo: hết -->'


def phien_ban_goi() -> int:
    return int((GOI / 'VERSION').read_text(encoding='utf-8').strip())


def trang_thai() -> str:
    if DAU_CAI.exists():
        return 'cu-hon' if int(DAU_CAI.read_text(encoding='utf-8').strip() or 0) < phien_ban_goi() else 'da-cai'
    if DICH.exists():
        return 'ban-rieng'  # skill cùng tên do người dùng tự làm, không đụng
    return 'tu-choi' if TU_CHOI.exists() else 'chua-cai'


def khoi_luat(file_luat: Path) -> str:
    s = (DICH / 'scripts' / 'soi_repo.py').as_posix()
    dong = [f'{MO} (cài từ iaccdemo, gỡ bằng python tools/cai_skill_ban_do.py --go) -->',
            '## Bản đồ repo',
            f'- **Repo git chưa quen** → chạy `python "{s}" tong-quan` trước khi đọc file nào (khoảng 1k token, thay cho dò thư mục).',
            f'- **Sắp sửa file chưa rõ dính tới đâu** → chạy `python "{s}" lien-quan <file>` (hoặc `vung <thư mục>`) trước khi mở file khác. Chỉ mở file nó chỉ ra, bỏ qua "lõi chung" và vùng "không dính".',
            '- Repo có `tools/ban_do.py` → dùng nó theo luật của repo. Lệnh `don` chỉ chạy khi người dùng gọi ("dọn rác repo").']
    if file_luat.parent.name == '.gemini' and sys.platform == 'win32':
        wsl = '/mnt/' + s[0].lower() + s[2:]
        dong.append(f'- Ở WSL dùng `python3 "{wsl}"`.')
    return '\n'.join(dong + [DONG]) + '\n'


def bo_khoi(s: str) -> str:
    a = s.find(MO)
    if a < 0:
        return s
    b = s.find(DONG, a)
    return s[:a].rstrip('\n') + '\n' + s[b + len(DONG):].lstrip('\n') if b >= 0 else s


def sua_luat(them: bool):
    for f in FILE_LUAT:
        if not f.parent.exists() or (not them and not f.exists()):
            continue
        cu = f.read_text(encoding='utf-8') if f.exists() else ''
        moi = bo_khoi(cu)
        if them:
            moi = moi.rstrip('\n') + ('\n\n' if moi.strip() else '') + khoi_luat(f)
        if moi != cu:
            if cu:
                shutil.copy2(f, f.with_name(f.name + '.bak-ban-do-' + time.strftime('%Y%m%d-%H%M%S')))
            f.write_text(moi, encoding='utf-8')
            print(f'{"Thêm" if them else "Gỡ"} mục luật: {f}')


def cai(ep: bool):
    tt = trang_thai()
    if tt == 'ban-rieng' and not ep:
        print(f'{DICH} đã có skill cùng tên không do gói này cài. Không đụng. Muốn thay bằng bản gói thì chạy thêm --ep.')
        return
    DICH.mkdir(parents=True, exist_ok=True)
    shutil.copytree(GOI, DICH, dirs_exist_ok=True)
    k = DICH / 'SKILL.md'
    k.write_text(k.read_text(encoding='utf-8').replace('{{SKILL_DIR}}', DICH.as_posix()), encoding='utf-8')
    (DICH / 'VERSION').unlink(missing_ok=True)
    DAU_CAI.write_text(str(phien_ban_goi()), encoding='utf-8')
    TU_CHOI.unlink(missing_ok=True)
    sua_luat(them=True)
    print(f'Đã cài bản {phien_ban_goi()} vào {DICH}. Mở phiên agent mới để luật có hiệu lực.')


def go():
    sua_luat(them=False)
    if DAU_CAI.exists():
        shutil.rmtree(DICH)
        print(f'Đã gỡ {DICH}')
    else:
        print('Không có skill do gói này cài, không gỡ thư mục nào.')


if __name__ == '__main__':
    if '--kiem' in sys.argv:
        print(trang_thai())
    elif '--khong' in sys.argv:
        TU_CHOI.parent.mkdir(parents=True, exist_ok=True)
        TU_CHOI.write_text(time.strftime('%d/%m/%Y'), encoding='utf-8')
        print('Đã ghi nhớ: không cài, đầu phiên không hỏi lại. Đổi ý thì chạy python tools/cai_skill_ban_do.py')
    elif '--go' in sys.argv:
        go()
    else:
        cai(ep='--ep' in sys.argv)
