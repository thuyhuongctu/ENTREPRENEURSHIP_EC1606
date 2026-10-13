"""Gộp 5 cặp tệp kich_ban_chu_de_ch0N.json / slide_noi_dung_chu_de_ch0N.json
(mỗi cặp do một agent viết riêng cho một chương, tránh đụng độ ghi đồng thời)
thành hai tệp tổng docs/kich_ban_chu_de.json và docs/slide_noi_dung_chu_de.json
mà tools/dung_goi_chuong.py đọc.

Chạy: python3 tools/gop_chu_de.py
"""
import json
import os

GOC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DOCS = os.path.join(GOC, 'docs')

CHUONG = ['ch01', 'ch02', 'ch03', 'ch04', 'ch05']


def gop(tien_to_vao, tep_ra):
    gop_lai = {}
    for ch in CHUONG:
        duong_dan = os.path.join(DOCS, '%s_%s.json' % (tien_to_vao, ch))
        assert os.path.exists(duong_dan), 'Thiếu %s' % duong_dan
        d = json.load(open(duong_dan, encoding='utf-8'))
        for k, v in d.items():
            assert k not in gop_lai, 'Trùng khóa %s' % k
            gop_lai[k] = v
    duong_dan_ra = os.path.join(DOCS, tep_ra)
    json.dump(gop_lai, open(duong_dan_ra, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
    print('Đã gộp %d khóa -> %s' % (len(gop_lai), duong_dan_ra))
    return gop_lai


def main():
    kich_ban = gop('kich_ban_chu_de', 'kich_ban_chu_de.json')
    slide = gop('slide_noi_dung_chu_de', 'slide_noi_dung_chu_de.json')

    assert set(kich_ban.keys()) == set(slide.keys()), 'Hai tệp không khớp khóa'
    for k in kich_ban:
        n1 = len(kich_ban[k]['diem_doc'])
        n2 = len(slide[k])
        assert n1 == n2, '%s: %d điểm đọc nhưng %d slide' % (k, n1, n2)
    print('Kiểm tra khớp 1-1: OK (%d chủ đề)' % len(kich_ban))


if __name__ == '__main__':
    main()
