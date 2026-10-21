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
  python doc_loi.py <ch01_en.json> <thư mục ra>     # bản tiếng Anh

Ngôn ngữ lấy từ trường "ngon_ngu" của tệp lịch (lay_lich_video_en.py ghi "en"):
bảng đọc chữ viết tắt và ngôn ngữ nhận dạng lại đổi theo. Vẫn cùng một mẫu
giọng của cô; VieNeu-TTS v3 Turbo học song ngữ Việt–Anh.
"""
import json
import os
import re
import sys
import time

import numpy as np
import soundfile as sf
from scipy.signal import resample_poly
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
    '4P': 'bốn pê',
    '7P': 'bảy pê',
    'STP': 'ét ti pi',
    'USP': 'iu ét pi',
    'D2C': 'đi tu xi',
    'VC': 'vi xi',
    'OCOP': 'ô cốp',
    'SUM': 'xăm',
}


# Bản tiếng Anh: viết tách chữ để mô hình đánh vần, không đọc thành một từ.
DOC_LA_EN = {
    'EC1606': 'E C sixteen oh six',
    'MVP': 'M V P',
    '4P': 'four P',
    '7P': 'seven P',
    'STP': 'S T P',
    'USP': 'U S P',
    'D2C': 'D to C',
    'VC': 'V C',
    'OCOP': 'O C O P',
}


def chuan_hoa(van, bang=DOC_LA):
    # theo ranh giới từ: thay chuỗi thô thì "VC" ăn cả vào giữa chữ khác
    for k, v in bang.items():
        van = re.sub(r'(?<![\w])' + re.escape(k) + r'(?![\w])', v, van)
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
    en = du_lieu.get('ngon_ngu') == 'en'
    bang, ngu = (DOC_LA_EN, 'en') if en else (DOC_LA, 'vi')
    tts = Vieneu()
    sr = getattr(tts, 'sample_rate', 48000)
    nghe = WhisperModel('small', device='cpu', compute_type='int8')
    # Đọc tiếp từ chỗ dừng: máy làm việc có thể khởi động lại giữa chừng (đã
    # xảy ra ở Chương 4, mất nửa chương), mà mỗi slide tốn vài phút. Slide nào
    # đã có trong so_do.json VÀ tệp đúng độ dài ghi ở đó thì giữ, không đọc lại.
    cu = {}
    duong_so_do = os.path.join(thu_muc_ra, 'so_do.json')
    if os.path.exists(duong_so_do):
        for x in json.load(open(duong_so_do, encoding='utf-8'))['slides']:
            tep = os.path.join(thu_muc_ra, x['tep'])
            if os.path.exists(tep) and abs(sf.info(tep).duration - x['giay']) <= 0.05:
                cu[x['tep']] = x
    so_do = []
    for s in du_lieu['slides']:
        ten = 'v%d_s%02d.wav' % (s['video'], s['so'])
        duong = os.path.join(thu_muc_ra, ten)
        if ten in cu:
            so_do.append(cu[ten])
            print('%s đã có, giữ nguyên' % ten, flush=True)
            continue
        t0 = time.time()
        doan, ghi = [], []
        for cau in chia_cau(chuan_hoa(s['loi_doc'], bang)):
            tot = None
            for lan in range(SO_LAN):
                wav = tts.infer(cau, ref_audio=MAU, denoise=False)
                # đưa thẳng mảng 16 kHz cho bộ nhận dạng: đọc lại từ tệp phải
                # qua PyAV, mà PyAV 15+ bỏ đối số faster-whisper còn dùng
                seg, _ = nghe.transcribe(resample_poly(wav, 1, sr // 16000).astype(np.float32),
                                         language=ngu, beam_size=5)
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
