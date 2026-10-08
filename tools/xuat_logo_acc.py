"""Xuất logo Accounting Powered by iPOS.vn cho web từ D:\\trum\\iPOS-ACC-Present\\logo acc.png.

Ra 4 file:
- src/assets/acc-logo.webp: logo màu gốc, dùng trên nền trắng.
- src/assets/acc-logo-trang.webp: dòng "Powered by iPOS.vn" tô trắng, dùng trên sidebar và nền tối.
- src/assets/acc-dau.webp: chữ A cam đầu logo, dùng khi sidebar thu gọn.
- public/favicon.png: chữ A cỡ 64 px.
Đổi logo gốc thì chạy lại:  python tools/xuat_logo_acc.py
"""
import sys
from pathlib import Path
from PIL import Image

WEB = Path(__file__).resolve().parent.parent
NGUON = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(r'D:\trum\iPOS-ACC-Present\logo acc.png')
CAO = 120  # px, gấp 3 cỡ hiển thị 40 px để nét trên màn hình mật độ cao

goc = Image.open(NGUON).convert('RGBA')
goc = goc.crop(goc.getbbox())


def la_cam(r, g, b):
    return r - b > 80


# Bản trắng: điểm xám (không phải cam) đổi thành trắng, giữ độ trong suốt
trang = goc.copy()
px = trang.load()
for y in range(trang.height):
    for x in range(trang.width):
        r, g, b, a = px[x, y]
        if a and not la_cam(r, g, b):
            px[x, y] = (255, 255, 255, a)

# Chữ A: quét từ trái sang tới cột đầu tiên không còn điểm cam, chỉ xét nửa trên (dòng ACCOUNTING)
nua_tren = goc.height // 2
px = goc.load()
x_cuoi = 0
dang_trong_chu = False
for x in range(goc.width):
    co_cam = any(px[x, y][3] > 40 and la_cam(*px[x, y][:3]) for y in range(nua_tren))
    if co_cam:
        dang_trong_chu, x_cuoi = True, x
    elif dang_trong_chu:
        break
chu_a = goc.crop((0, 0, x_cuoi + 1, nua_tren))
chu_a = chu_a.crop(chu_a.getbbox())


def vuong(im, canh):
    """Đặt ảnh vào ô vuông trong suốt, chừa lề 8%."""
    lot = Image.new('RGBA', (canh, canh), (0, 0, 0, 0))
    co = int(canh * .84)
    t = min(co / im.width, co / im.height)
    nho = im.resize((round(im.width * t), round(im.height * t)), Image.LANCZOS)
    lot.paste(nho, ((canh - nho.width) // 2, (canh - nho.height) // 2), nho)
    return lot


def theo_cao(im, cao):
    return im.resize((round(im.width * cao / im.height), cao), Image.LANCZOS)


ra = {
    WEB / 'src' / 'assets' / 'acc-logo.webp': theo_cao(goc, CAO),
    WEB / 'src' / 'assets' / 'acc-logo-trang.webp': theo_cao(trang, CAO),
    WEB / 'src' / 'assets' / 'acc-dau.webp': vuong(chu_a, 128),
    WEB / 'public' / 'favicon.png': vuong(chu_a, 64),
}
for path, im in ra.items():
    im.save(path, quality=92) if path.suffix == '.webp' else im.save(path)
    print(f'{path.relative_to(WEB)}: {im.width}x{im.height}, {path.stat().st_size} byte')
print(f'nguồn: {NGUON}')
