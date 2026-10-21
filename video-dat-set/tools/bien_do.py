# -*- coding: utf-8 -*-
"""Độ mở miệng của Hương AI từng khung hình, lấy từ độ to của lời đọc.

    python3 bien_do.py <thư mục âm thanh của doc_loi.py>
    → <thư mục>/bien_do.json  {"v1_s01.wav": [0.0, 0.12, ...], ...}  (30 giá trị/giây)

Không khớp từng âm như các mô hình khớp môi: chỉ là miệng mở to khi giọng to,
khép khi lặng. Đủ để nhân vật trông như đang nói, chạy trong vài giây, không
cần GPU. Chuẩn hóa theo từng tệp (bách phân vị 95 của độ to), vì các slide đọc
to nhỏ khác nhau một chút mà miệng thì nên mở cùng một tầm.
"""
import json
import os
import sys
import wave

import numpy as np

FPS = 30


def mo_mieng(duong):
    with wave.open(duong) as w:
        sr = w.getframerate()
        a = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768
    buoc = sr // FPS
    so = int(np.ceil(len(a) / buoc))
    a = np.pad(a, (buoc, buoc * 2))
    # cửa sổ rộng hơn một khung một chút để miệng không giật theo từng chu kỳ âm
    rms = np.array([np.sqrt(np.mean(a[i * buoc: i * buoc + buoc * 2] ** 2)) for i in range(so)])
    tham_chieu = np.percentile(rms[rms > 1e-4], 95) if np.any(rms > 1e-4) else 1
    x = np.clip((rms / tham_chieu - 0.12) / 0.88, 0, 1) ** 0.75
    # mở nhanh, khép chậm hơn một chút như miệng thật
    ra = np.zeros_like(x)
    for i, v in enumerate(x):
        truoc = ra[i - 1] if i else 0
        ra[i] = truoc + (v - truoc) * (0.75 if v > truoc else 0.45)
    return [round(float(v), 3) for v in ra]


if __name__ == '__main__':
    thu_muc = sys.argv[1]
    so_do = json.load(open(os.path.join(thu_muc, 'so_do.json'), encoding='utf-8'))
    bd = {s['tep']: mo_mieng(os.path.join(thu_muc, s['tep'])) for s in so_do['slides']}
    json.dump(bd, open(os.path.join(thu_muc, 'bien_do.json'), 'w'), separators=(',', ':'))
    print('bien_do: %d tệp, %d khung' % (len(bd), sum(len(v) for v in bd.values())))
