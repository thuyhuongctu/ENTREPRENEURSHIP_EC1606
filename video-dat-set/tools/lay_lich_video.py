# -*- coding: utf-8 -*-
"""Lấy danh sách slide (chữ trên slide + lời đọc) của từng video trong một
chương, đọc thẳng từ tệp "nội dung slide" mà tools/dung_goi_chuong.py sinh ra.

Vì sao đọc tệp kết quả thay vì tự dựng lại thứ tự từ docs/*.json: thứ tự
slide, cách chia hai video và chỗ chèn các trang khung (bìa, mục tiêu, "đang
ở đâu", ôn tập...) chỉ nằm trong dung_chuong(). Chép lại logic ấy sang đây là
có hai nơi quyết định thứ tự; sửa một bên là video lệch slide mà không ai
báo. Tệp nội dung slide là bản ghi đúng của chính lần dựng ấy.

Dùng: python3 video-dat-set/tools/lay_lich_video.py 1
Ra:   video-dat-set/du-lieu/ch01.json
"""
import json
import os
import re
import sys

import docx

GOC = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


def doc_chuong(so):
    duong = os.path.join(GOC, 'chuong-%02d' % so, 'noi-dung-slide',
                         'NOI_DUNG_SLIDE__CHUONG_%d_EC1606.docx' % so)
    dong = [p.text.strip() for p in docx.Document(duong).paragraphs if p.text.strip()]
    slides, video, cur, phan = [], None, None, None
    for d in dong:
        m = re.match(r'^VIDEO (\d+)$', d)
        if m:
            video = int(m.group(1))
            continue
        m = re.match(r'^SLIDE (\d+) – (.+)$', d)
        if m:
            cur = {'video': video, 'so': int(m.group(1)), 'tieu_de': m.group(2),
                   'tren_slide': [], 'goi_y_hinh': '', 'loi_doc': ''}
            slides.append(cur)
            phan = None
            continue
        if cur is None:
            continue
        if d == 'Trên slide:':
            phan = 'tren'
        elif d.startswith('Gợi ý hình:'):
            cur['goi_y_hinh'] = d.split(':', 1)[1].strip()
            phan = None
        elif d.startswith('Lời đọc'):
            cur['loi_doc'] = d.split(':', 1)[1].strip()
            phan = 'loi'
        elif phan == 'tren' and d.startswith('–'):
            cur['tren_slide'].append(d.lstrip('– ').strip())
        elif phan == 'loi':
            cur['loi_doc'] += ' ' + d
    thieu = [s['so'] for s in slides if not s['loi_doc'] or s['video'] is None]
    assert not thieu, 'slide thiếu lời đọc hoặc không thuộc video nào: %s' % thieu
    return slides


if __name__ == '__main__':
    so = int(sys.argv[1])
    slides = doc_chuong(so)
    ra = os.path.join(GOC, 'video-dat-set', 'du-lieu', 'ch%02d.json' % so)
    os.makedirs(os.path.dirname(ra), exist_ok=True)
    with open(ra, 'w', encoding='utf-8') as f:
        json.dump({'chuong': so, 'slides': slides}, f, ensure_ascii=False, indent=1)
    for v in sorted({s['video'] for s in slides}):
        ss = [s for s in slides if s['video'] == v]
        tu = sum(len(s['loi_doc'].split()) for s in ss)
        print('video %d: %d slide, %d từ (~%.1f phút ở 206 từ/phút)' % (v, len(ss), tu, tu / 206))
