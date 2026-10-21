# -*- coding: utf-8 -*-
"""Dựng lịch slide TIẾNG ANH của một chương từ lịch tiếng Việt (du-lieu/chCC.json).

Slide chủ đề lấy bản dịch có sẵn trong docs/slide_noi_dung_chu_de_chCC.json
(title_en, bullets_en) và docs/kich_ban_chu_de_chCC.json (loi_doc_en). Ghép
theo lời đọc tiếng Việt chứ không theo tiêu đề: tiêu đề trùng nhau giữa trang
tổng kết chủ đề và trang tổng kết chương, mà lời đọc thì không. Lời đọc tiếng
Việt phải trùng từng chữ với docs, không thì bản dịch đã cũ so với kịch bản,
và trình này dừng chứ không dùng bản dịch lệch.

Trang khung (bìa, mục tiêu, ôn tập, tình huống...) dịch ở du-lieu/dich_en_chCC.json,
cùng nhãn tiếng Anh của hình minh họa.

Giữ tiêu đề tiếng Việt ở trường `tieu_de_vi`: luật chọn dáng Hương AI và nhãn
"đang ở đâu" trong BaiGiang.tsx khớp theo tiêu đề tiếng Việt.

Dùng: python3 video-dat-set/tools/lay_lich_video_en.py 1
Ra:   video-dat-set/du-lieu/ch01_en.json, du-lieu/minh_hoa_ch01_en.json
"""
import json
import os
import sys

DAY = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
GOC = os.path.dirname(DAY)


def main(so):
    cc = '%02d' % so
    vi = json.load(open(os.path.join(DAY, 'du-lieu', 'ch%s.json' % cc), encoding='utf-8'))
    dich = json.load(open(os.path.join(DAY, 'du-lieu', 'dich_en_ch%s.json' % cc), encoding='utf-8'))
    kb = json.load(open(os.path.join(GOC, 'docs', 'kich_ban_chu_de_ch%s.json' % cc), encoding='utf-8'))
    sl = json.load(open(os.path.join(GOC, 'docs', 'slide_noi_dung_chu_de_ch%s.json' % cc), encoding='utf-8'))
    theo_loi = {}
    for k, ds in sl.items():
        for s, d in zip(ds, kb[k]['diem_doc']):
            theo_loi[d['loi_doc'].strip()] = (s, d)
    ra, thieu = [], []
    for s in vi['slides']:
        khoa = str(s['so'])
        if khoa in dich['slides']:
            en = dich['slides'][khoa]
            moi = {'tieu_de': en['tieu_de'], 'tren_slide': en['tren_slide'], 'loi_doc': en['loi_doc']}
        elif s['loi_doc'].strip() in theo_loi:
            a, d = theo_loi[s['loi_doc'].strip()]
            # tiêu đề slide mở chủ đề mang số "1.1." như bản tiếng Việt
            so_cd = s['tieu_de'].split(' ', 1)[0] if s['tieu_de'][:1].isdigit() else ''
            moi = {'tieu_de': ((so_cd + ' ') if so_cd else '') + a['title_en'].upper(),
                   'tren_slide': a['bullets_en'], 'loi_doc': d['loi_doc_en']}
        else:
            thieu.append(s['so'])
            continue
        ra.append({'video': s['video'], 'so': s['so'], 'tieu_de_vi': s['tieu_de'], **moi,
                   'goi_y_hinh': s['goi_y_hinh']})
    assert not thieu, 'slide chưa có bản tiếng Anh: %s' % thieu
    with open(os.path.join(DAY, 'du-lieu', 'ch%s_en.json' % cc), 'w', encoding='utf-8') as f:
        json.dump({'chuong': so, 'ngon_ngu': 'en', 'slides': ra}, f, ensure_ascii=False, indent=1)

    mh = json.load(open(os.path.join(DAY, 'du-lieu', 'minh_hoa_ch%s.json' % cc), encoding='utf-8'))
    for k, m in mh['slides'].items():
        nhan = dich['minh_hoa'].get(k)
        assert nhan and len(nhan) == len(m['muc']), 'nhãn minh họa slide %s: %s mục, %s nhãn' % (
            k, len(m['muc']), len(nhan or []))
        for muc, n in zip(m['muc'], nhan):
            muc['nhan'] = n
    mh['ghi_chu'] = 'Bản tiếng Anh: cùng biểu tượng và bố cục với minh_hoa_ch%s.json, chỉ thay nhãn.' % cc
    with open(os.path.join(DAY, 'du-lieu', 'minh_hoa_ch%s_en.json' % cc), 'w', encoding='utf-8') as f:
        json.dump(mh, f, ensure_ascii=False, indent=1)
    for v in sorted({s['video'] for s in ra}):
        tu = sum(len(s['loi_doc'].split()) for s in ra if s['video'] == v)
        print('video %d: %d slide, %d từ tiếng Anh' % (v, sum(s['video'] == v for s in ra), tu))


if __name__ == '__main__':
    main(int(sys.argv[1]))
