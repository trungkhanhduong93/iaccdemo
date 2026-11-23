"""Xuất bộ nguồn NotebookLM cho IACC Cloud (iaccdemo).

Gồm 14 file markdown và manifest.json ghi vào backup/notebooklm/:
  - 10 file viết tay (01–06, 09–11, 13) từ docs/notebooklm/
  - 4 file sinh từ tài liệu repo:
    07-quyet-dinh.md (docs/QUYET-DINH.md)
    08-bay-ky-thuat.md (docs/BAY.md)
    12-tien-do-viec.md (docs/TIEN-DO.md + docs/luu-tru/TIEN-DO-xong.md)
    14-nhat-ky-thay-doi.md (CHANGELOG.md)

Chạy: python tools/xuat_notebooklm.py
"""
import datetime
import hashlib
import json
from pathlib import Path
import subprocess
import sys

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

ROOT = Path(__file__).resolve().parent.parent
DOCS_DIR = ROOT / "docs" / "notebooklm"
BACKUP_DIR = ROOT / "backup" / "notebooklm"

HANDWRITTEN = [
    "01-tong-quan.md", "02-nguyen-ly-ke-toan.md", "03-phan-he-man-hinh.md",
    "04-chung-tu-dinh-khoan.md", "05-bao-cao-mau-in.md", "06-giao-dien-ux.md",
    "09-kien-truc-fe-be.md", "10-quy-trinh-team.md", "11-tien-ich.md", "13-hoi-dap.md",
]

GENERATED = {
    "07-quyet-dinh.md": (
        "# 07. Quyết định kiến trúc và nghiệp vụ — IACC Cloud (iaccdemo)",
        "Tài liệu này tập hợp toàn bộ quyết định kiến trúc, nghiệp vụ và giao diện của dự án IACC Cloud từ docs/QUYET-DINH.md. Chi tiết về quy trình phối hợp nhóm hoặc bẫy kỹ thuật xem tại tài liệu 08 và 10.",
        lambda: (ROOT / "docs" / "QUYET-DINH.md").read_text(encoding="utf-8"),
    ),
    "08-bay-ky-thuat.md": (
        "# 08. Bẫy kỹ thuật và bài học kinh nghiệm — IACC Cloud (iaccdemo)",
        "Tài liệu này ghi nhận toàn bộ bẫy kỹ thuật, lỗi tiềm ẩn và bài học kinh nghiệm từ docs/BAY.md. Các quyết định thiết kế và quy trình phối hợp nhóm được trình bày ở tài liệu 07 và 10.",
        lambda: (ROOT / "docs" / "BAY.md").read_text(encoding="utf-8"),
    ),
    "12-tien-do-viec.md": (
        "# 12. Tiến độ công việc và lịch sử nhiệm vụ — IACC Cloud (iaccdemo)",
        "Tài liệu này tổng hợp danh sách công việc đang thực hiện và lịch sử nhiệm vụ đã hoàn thành từ docs/TIEN-DO.md và docs/luu-tru/TIEN-DO-xong.md. Thông tin nhật ký thay đổi phiên bản nằm ở tài liệu 14.",
        lambda: (
            (ROOT / "docs" / "TIEN-DO.md").read_text(encoding="utf-8")
            + "\n\n"
            + (ROOT / "docs" / "luu-tru" / "TIEN-DO-xong.md").read_text(encoding="utf-8")
        ),
    ),
    "14-nhat-ky-thay-doi.md": (
        "# 14. Nhật ký thay đổi hệ thống — IACC Cloud (iaccdemo)",
        "Tài liệu này theo dõi lịch sử cập nhật và thay đổi tính năng người dùng từ CHANGELOG.md. Chi tiết về phân hệ màn hình hoặc chứng từ nằm ở tài liệu 03 và 04.",
        lambda: (ROOT / "CHANGELOG.md").read_text(encoding="utf-8"),
    ),
}


def main():
    missing = [f for f in HANDWRITTEN if not (DOCS_DIR / f).is_file()]
    if missing:
        print(f"Lỗi: Thiếu file viết tay: {', '.join(missing)}", file=sys.stderr)
        sys.exit(1)

    commit = subprocess.run(
        ["git", "rev-parse", "--short", "HEAD"],
        capture_output=True, text=True, check=True
    ).stdout.strip()
    ngay = datetime.date.today().strftime("%d/%m/%Y")

    BACKUP_DIR.mkdir(parents=True, exist_ok=True)
    for p in BACKUP_DIR.glob("*.md"):
        p.unlink()

    files_content = {}
    for f in HANDWRITTEN:
        raw = (DOCS_DIR / f).read_text(encoding="utf-8")
        lines = raw.splitlines()
        if len(lines) > 1:
            lines[1] = f"Bản xuất từ repo iaccdemo commit {commit}, ngày {ngay}."
        files_content[f] = "\n".join(lines) + "\n"

    for f, (tieu_de, pham_vi, nguon_fn) in GENERATED.items():
        dau = f"{tieu_de}\nBản xuất từ repo iaccdemo commit {commit}, ngày {ngay}.\n\n## Phạm vi tài liệu\n{pham_vi}\n\n"
        files_content[f] = dau + nguon_fn()

    manifest = []
    for ten in sorted(files_content.keys()):
        noi_dung = files_content[ten]
        so_tu = len(noi_dung.split())
        if so_tu > 450000:
            print(f"Lỗi: File {ten} vượt quá 450.000 từ ({so_tu} từ)", file=sys.stderr)
            sys.exit(1)

        out_path = BACKUP_DIR / ten
        out_path.write_bytes(noi_dung.encode("utf-8"))   # ghi byte để sha256 khớp file trên đĩa (Windows đổi \n thành \r\n)
        manifest.append({
            "ten": ten,
            "duong_dan": out_path.resolve().as_posix(),
            "sha256": hashlib.sha256(noi_dung.encode("utf-8")).hexdigest(),
            "so_tu": so_tu,
        })

    (BACKUP_DIR / "manifest.json").write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    (DOCS_DIR / "LAN-XUAT.txt").write_text(f"{commit} {ngay}\n", encoding="utf-8")

    for item in manifest:
        print(f"{item['ten']:<32} {item['so_tu']:>8} từ")


if __name__ == "__main__":
    main()
