# -*- coding: utf-8 -*-
"""Đọc lời thuyết minh từng slide bằng giọng tổng hợp nhân bản từ mẫu giọng
của cô Hương (VieNeu-TTS, Apache-2.0, chạy tại máy, không gửi giọng đi đâu).

Mẫu giọng: video-dat-set/mau-giong/MAU_GIONG_CO_HUONG.wav — 14 giây cắt từ
video 1 gói EC6035TX (giọng thật, thu sạch). Chính cô chọn đoạn này ("bạn
lấy mẫu này sẽ giống"); các đoạn khác máy chấm điểm "giống" cao hơn nhưng
tai người mới là chuẩn, nên giữ đúng đoạn cô chọn.

Vì sao đọc TỪNG CÂU rồi tự chèn khoảng nghỉ: mô hình không có nút chỉnh tốc
độ và đọc khoảng 238 từ/phút, nhanh hơn giọng thật (206). Đọc liền một mạch
thì video 1 chỉ chừng 10 phút, dưới mức 12 phút của Mẫu HLS-VLU-08. Nghỉ
giữa câu như lúc giảng thật vừa đủ bù mà không phải kéo giãn âm thanh.

Mỗi câu đọc xong được nhận dạng lại (faster-whisper) và so với chữ gốc; câu
nào sai quá NGUONG thì đọc lại, tối đa SO_LAN lần, giữ lần tốt nhất. Đây là
lưới thô (bộ nhận dạng cũng sai, ngay giọng thật cũng bị chép sai 5-8%),
không thay việc nghe duyệt.

Dùng (trong môi trường có vieneu + faster-whisper):
  python doc_loi.py <ch01.json> <thư mục ra>
"""
import json
import os
import re
import sys
import time

import numpy as np
import soundfile as sf
from faster_whisper import WhisperModel
from vieneu import Vieneu

DAY = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MAU = os.path.join(DAY, 'mau-giong', 'MAU_GIONG_CO_HUONG.wav')
NGHI_CAU = 0.55       # giây, giữa hai câu
NGHI_CUOI = 0.9       # giây, cuối slide trước khi sang slide sau
NGUONG = 0.12
SO_LAN = 3

# Cách đọc các chữ viết tắt, viết sẵn ra âm để không phụ thuộc cách bộ chuẩn
# hóa của mô hình đoán chữ hoa liền nhau. Muốn đọc khác thì sửa ở đây.
DOC_LA = {
    'EC1606': 'E C một sáu không sáu',
    'MVP': 'em vi pi',
}


def chuan_hoa(van):
    for k, v in DOC_LA.items():
        van = van.replace(k, v)
    return van


def chia_cau(van):
    cau = [c.strip() for c in re.split(r'(?<=[.!?…;])\s+', van) if c.strip()]
    ra = []
    for c in cau:
        # câu cực ngắn ("Đúng vậy.") đọc riêng nghe cụt — gộp vào câu trước
        if ra and len(c.split()) < 4:
            ra[-1] += ' ' + c
        else:
            ra.append(c)
    return ra


def tu(s):
    return re.sub(r'[^\w\s]', ' ', s.lower()).split()


def ty_le_sai(goc, nghe):
    r, h = tu(goc), tu(nghe)
    D = np.zeros((len(r) + 1, len(h) + 1), int)
    D[:, 0] = range(len(r) + 1)
    D[0, :] = range(len(h) + 1)
    for i in range(1, len(r) + 1):
        for j in range(1, len(h) + 1):
            D[i, j] = min(D[i - 1, j] + 1, D[i, j - 1] + 1, D[i - 1, j - 1] + (r[i - 1] != h[j - 1]))
    return D[-1, -1] / max(1, len(r))


def main(duong_json, thu_muc_ra):
    os.makedirs(thu_muc_ra, exist_ok=True)
    du_lieu = json.load(open(duong_json, encoding='utf-8'))
    tts = Vieneu()
    sr = getattr(tts, 'sample_rate', 48000)
    nghe = WhisperModel('small', device='cpu', compute_type='int8')
    so_do = []
    for s in du_lieu['slides']:
        ten = 'v%d_s%02d.wav' % (s['video'], s['so'])
        duong = os.path.join(thu_muc_ra, ten)
        t0 = time.time()
        doan, ghi = [], []
        for cau in chia_cau(chuan_hoa(s['loi_doc'])):
            tot = None
            for lan in range(SO_LAN):
                wav = tts.infer(cau, ref_audio=MAU, denoise=False)
                sf.write('/tmp/_cau.wav', wav, sr)
                seg, _ = nghe.transcribe('/tmp/_cau.wav', language='vi', beam_size=5)
                sai = ty_le_sai(cau, ' '.join(x.text for x in seg))
                if tot is None or sai < tot[0]:
                    tot = (sai, wav, lan + 1)
                if sai <= NGUONG:
                    break
            doan += [tot[1], np.zeros(int(sr * NGHI_CAU), np.float32)]
            # so_lan: lần đọc được GIỮ (lần tốt nhất), không phải số lần đã thử —
            # câu sai nhiều mà so_lan = 1 nghĩa là đã đọc lại nhưng các lần sau còn tệ hơn.
            ghi.append({'cau': cau, 'sai': round(tot[0], 3), 'so_lan': tot[2]})
        doan[-1] = np.zeros(int(sr * NGHI_CUOI), np.float32)
        am = np.concatenate(doan)
        sf.write(duong, am, sr)
        dai = len(am) / sr
        so_do.append({'video': s['video'], 'so': s['so'], 'tep': ten, 'giay': round(dai, 2), 'cau': ghi})
        print('%s %.1fs (%.0fs xử lý), sai TB %.2f, câu đọc lại: %d' % (
            ten, dai, time.time() - t0, np.mean([g['sai'] for g in ghi]),
            sum(g['so_lan'] > 1 for g in ghi)), flush=True)
        json.dump({'mau_giong': os.path.basename(MAU), 'tan_so': sr, 'slides': so_do},
                  open(os.path.join(thu_muc_ra, 'so_do.json'), 'w', encoding='utf-8'),
                  ensure_ascii=False, indent=1)
    for v in sorted({x['video'] for x in so_do}):
        print('video %d: %.1f phút lời đọc' % (v, sum(x['giay'] for x in so_do if x['video'] == v) / 60))


if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2])
