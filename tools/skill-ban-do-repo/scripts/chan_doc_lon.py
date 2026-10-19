"""Hook chan Claude Code doc file lon khi khong co gioi han dong."""
import json
import sys
from pathlib import Path

# Repo goc la thu muc cha cua .claude
GOC_REPO = Path(__file__).resolve().parent.parent.parent
DUOI_FILE_KIEM_TRA = {'.ts', '.tsx', '.js', '.css', '.md', '.json', '.py', '.html', '.txt', '.csv'}


def xu_ly_stdin():
    try:
        raw = sys.stdin.read().strip()
        if not raw:
            sys.exit(0)
        data = json.loads(raw)
    except Exception:
        sys.exit(0)

    try:
        tool_input = data.get('tool_input') or {}
        file_path_raw = tool_input.get('file_path') or data.get('file_path') or ''
        if not file_path_raw:
            sys.exit(0)

        limit = tool_input.get('limit') if 'limit' in tool_input else data.get('limit')
        if limit is not None:
            try:
                limit = int(limit)
            except Exception:
                limit = None

        p = Path(file_path_raw)
        if not p.is_absolute():
            target = (GOC_REPO / p).resolve()
        else:
            target = p.resolve()

        # Kiem tra xem file co nam trong repo khong
        try:
            rel_path = target.relative_to(GOC_REPO).as_posix()
        except ValueError:
            # File ngoai repo, khong chan
            sys.exit(0)

        # Truong hop (a): file cam doc
        cam_doc = (
            rel_path in ('src/ui/icon-dac.ts', 'src/app/features.json')
            or rel_path.startswith('dist/')
            or rel_path.startswith('node_modules/')
            or p.name in ('icon-dac.ts', 'features.json')
        )
        if cam_doc:
            sys.stderr.reconfigure(encoding='utf-8')
            sys.stderr.write(f"File {rel_path} la file cam doc. Tra cuu qua tools/ban_do.py thay vi doc nguyen file.\n")
            sys.exit(2)

        # Truong hop (b): file lon tren 20 KB khong co limit hoac limit > 400
        if target.exists() and target.is_file():
            ext = target.suffix.lower()
            if ext in DUOI_FILE_KIEM_TRA:
                size_bytes = target.stat().st_size
                if size_bytes > 20 * 1024:
                    if limit is None or limit > 400:
                        size_kb = round(size_bytes / 1024)
                        sys.stderr.reconfigure(encoding='utf-8')
                        sys.stderr.write(
                            f"File {size_kb} KB. Chạy python tools/ban_do.py file {rel_path} lấy dàn ý, "
                            f"rồi Read có offset và limit ≤400.\n"
                        )
                        sys.exit(2)

    except Exception:
        # Khong bao gio chan nham vi hook loi
        sys.exit(0)

    sys.exit(0)


if __name__ == '__main__':
    xu_ly_stdin()
