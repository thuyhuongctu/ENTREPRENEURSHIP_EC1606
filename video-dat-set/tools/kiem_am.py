# -*- coding: utf-8 -*-
"""Đối chiếu độ dài thật của từng tệp lời đọc với so_do.json trước khi dựng.

Video lấy thời lượng mỗi slide từ so_do.json, không đo lại tệp âm thanh. Hai
bên lệch nhau thì lời đọc bị cắt cụt cuối slide hoặc thẻ chữ hiện lệch nhịp,
mà video vẫn dựng ra bình thường. Đã xảy ra một lần ở Chương 2: hai tiến trình
doc_loi.py chạy trùng cùng ghi một thư mục, 5 tệp đầu là bản của tiến trình
kia, lệch tới 1,4 giây.

Dùng: python3 kiem_am.py <thư mục âm thanh>   (thoát mã 1 nếu lệch quá 0,05 s)
"""
import json
import os
import sys
import wave

thu_muc = sys.argv[1]
so_do = json.load(open(os.path.join(thu_muc, 'so_do.json'), encoding='utf-8'))
lech = []
for s in so_do['slides']:
    with wave.open(os.path.join(thu_muc, s['tep'])) as w:
        that = w.getnframes() / w.getframerate()
    if abs(that - s['giay']) > 0.05:
        lech.append('%s: so_do %.2f s, tệp %.2f s' % (s['tep'], s['giay'], that))
if lech:
    print('Lời đọc lệch so_do.json:\n  ' + '\n  '.join(lech))
    sys.exit(1)
print('kiem_am: %d tệp khớp so_do.json' % len(so_do['slides']))
