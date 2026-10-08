# -*- coding: utf-8 -*-
"""Báo lên group Telegram. Robot .github/workflows/bao-telegram.yml gọi file này.

Push lên main: báo người push và các commit vừa đẩy.
Robot deploy hỏng: báo commit nào làm hỏng và link xem lỗi.

Dùng:
  python tools/bao_telegram.py FILE_SU_KIEN          (gửi thật, cần TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID)
  python tools/bao_telegram.py FILE_SU_KIEN --thu    (chỉ in tin ra màn hình, không gửi)

FILE_SU_KIEN là file JSON GitHub ghi sự kiện, robot lấy ở biến GITHUB_EVENT_PATH.
"""
import json
import os
import sys
import urllib.error
import urllib.request
from html import escape

# Push nhiều commit một lúc thì chỉ liệt kê chừng này dòng, Telegram giới hạn 4.096 ký tự mỗi tin
TOI_DA_COMMIT = 10


def dong_dau(message):
    dong = (message or '').strip().splitlines()
    return dong[0] if dong else ''


def tin_push(su_kien):
    commits = su_kien.get('commits') or []
    if not commits:
        return None
    dong = [f'<b>{escape(su_kien["pusher"]["name"])}</b> vừa push {len(commits)} commit lên iaccdemo:']
    for c in commits[:TOI_DA_COMMIT]:
        dong.append(f'• <code>{c["id"][:7]}</code> {escape(dong_dau(c["message"]))}')
    if len(commits) > TOI_DA_COMMIT:
        dong.append(f'… và {len(commits) - TOI_DA_COMMIT} commit khác')
    dong.append('')
    dong.append(f'<a href="{escape(su_kien["compare"])}">Xem thay đổi</a>')
    return '\n'.join(dong)


def tin_deploy_hong(su_kien):
    run = su_kien['workflow_run']
    if run.get('conclusion') != 'failure':
        return None
    commit = run.get('head_commit') or {}
    return '\n'.join([
        '<b>Robot deploy iaccdemo hỏng.</b> Bản online vẫn là bản trước.',
        f'Commit <code>{run["head_sha"][:7]}</code> {escape(dong_dau(commit.get("message")))}',
        f'Người push: {escape(run["actor"]["login"])}',
        '',
        f'<a href="{escape(run["html_url"])}">Xem lỗi</a>',
    ])


def gui(tin):
    token = os.environ.get('TELEGRAM_BOT_TOKEN', '')
    chat_id = os.environ.get('TELEGRAM_CHAT_ID', '')
    if not token or not chat_id:
        print('::warning::Chưa có secret TELEGRAM_BOT_TOKEN hoặc TELEGRAM_CHAT_ID nên không báo Telegram.')
        return 0
    body = json.dumps({
        'chat_id': chat_id,
        'text': tin,
        'parse_mode': 'HTML',
        'disable_web_page_preview': True,
    }).encode('utf-8')
    req = urllib.request.Request(
        f'https://api.telegram.org/bot{token}/sendMessage',
        data=body,
        headers={'Content-Type': 'application/json'},
    )
    # Chỉ in mô tả lỗi Telegram trả về, không in URL vì URL chứa token
    try:
        with urllib.request.urlopen(req, timeout=20) as res:
            json.load(res)
    except urllib.error.HTTPError as loi:
        mo_ta = json.loads(loi.read().decode('utf-8', 'replace') or '{}').get('description', '')
        print(f'::error::Telegram từ chối tin, mã {loi.code}: {mo_ta}')
        return 1
    except urllib.error.URLError as loi:
        print(f'::error::Không gọi được Telegram: {loi.reason}')
        return 1
    print('Đã gửi tin lên Telegram.')
    return 0


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        return 2
    with open(sys.argv[1], encoding='utf-8') as f:
        su_kien = json.load(f)
    tin = tin_deploy_hong(su_kien) if 'workflow_run' in su_kien else tin_push(su_kien)
    if not tin:
        print('Không có gì để báo.')
        return 0
    if '--thu' in sys.argv:
        print(tin)
        return 0
    return gui(tin)


if __name__ == '__main__':
    sys.exit(main())
