"""Hook PreToolUse nhắc agent dùng bản đồ repo thay vì dò tay (T911, học từ graphify).

Agent tìm code bằng Grep, Glob hoặc grep/rg trong Bash ở repo git mà 4 giờ qua chưa chạy soi_repo.py
thì từ lần dò thứ 3 hook gửi một câu nhắc. Tối đa 2 câu mỗi phiên. Không bao giờ chặn lệnh.
Lỗi gì cũng thoát êm để không cản việc của agent.
"""
import hashlib
import json
import re
import sys
import time
from pathlib import Path

THU_MUC = Path.home() / '.claude' / '.soi-repo-dung'
SOI = (Path(__file__).resolve().parent / 'soi_repo.py').as_posix()
HAN_GIAY = 4 * 3600
NHAC_TU_LAN = 3
TOI_DA_NHAC = 2
RE_DO_BASH = re.compile(r'(^|[|;&\s])(grep|rg|git grep|findstr|Select-String)\s')


def goc_repo(cwd):
    p = Path(cwd).resolve()
    for d in (p, *p.parents):
        if (d / '.git').exists():
            return d
    return None


def chinh():
    vao = json.loads(sys.stdin.read() or '{}')
    ten = vao.get('tool_name', '')
    if ten == 'Bash' and not RE_DO_BASH.search((vao.get('tool_input') or {}).get('command', '')):
        return
    goc = goc_repo(vao.get('cwd') or '.')
    if not goc:
        return
    dau = THU_MUC / hashlib.md5(goc.as_posix().lower().encode()).hexdigest()
    if dau.exists() and time.time() - float(dau.read_text() or 0) < HAN_GIAY:
        return
    THU_MUC.mkdir(parents=True, exist_ok=True)
    tt_file = THU_MUC / ('phien-' + re.sub(r'[^\w-]', '', vao.get('session_id', 'x'))[:64] + '.json')
    tt = json.loads(tt_file.read_text()) if tt_file.exists() else {'lan': 0, 'nhac': 0}
    tt['lan'] += 1
    nhac = tt['lan'] >= NHAC_TU_LAN and tt['nhac'] < TOI_DA_NHAC and (tt['lan'] - NHAC_TU_LAN) % 5 == 0
    if nhac:
        tt['nhac'] += 1
    tt_file.write_text(json.dumps(tt))
    if nhac:
        print(json.dumps({'hookSpecificOutput': {
            'hookEventName': 'PreToolUse',
            'additionalContext': (
                f'[bản đồ repo] Đã dò code {tt["lan"]} lần mà chưa chạy bản đồ repo ở {goc.name}. '
                f'Chạy `python "{SOI}" viec "<mô tả việc>"` để lấy chỗ sửa file:dòng; '
                f'`explain <tên hàm/màn>` để thấy mọi chỗ gọi; `lien-quan <file>` trước khi sửa file chưa rõ.')}},
            ensure_ascii=False))


if __name__ == '__main__':
    try:
        if sys.platform == 'win32':
            sys.stdout.reconfigure(encoding='utf-8')
        chinh()
    except Exception:   # hook nhắc, không phải chốt chặn: hỏng thì để agent làm tiếp
        pass
    sys.exit(0)
