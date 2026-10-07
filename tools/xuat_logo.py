"""Xuất logo IACC Cloud cho web từ D:\\icon present\\logo (2).png.

Dùng lại iacc_logo() của bộ present: tô trắng vòng giữa (ảnh gốc để trong suốt), giữ trong suốt phần ngoài khối cam.
Ra src/assets/iacc-logo.webp (192 px, dấu sản phẩm) và public/favicon.png (64 px).
Đổi logo gốc thì chạy lại:  python tools/xuat_logo.py
"""
import base64
import contextlib
import io
import sys
from pathlib import Path

WEB = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(WEB.parent / 'Present' / 'tools'))
with contextlib.redirect_stdout(io.StringIO()):
    import build_present as b

fav, mark = b.iacc_logo()
ra = {WEB / 'public' / 'favicon.png': fav, WEB / 'src' / 'assets' / 'iacc-logo.webp': mark}
for path, uri in ra.items():
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(base64.b64decode(uri.split(',', 1)[1]))
    print(f'{path.relative_to(WEB)}: {path.stat().st_size} byte')
print(f'nguồn: {b.IACC_LOGO}')
