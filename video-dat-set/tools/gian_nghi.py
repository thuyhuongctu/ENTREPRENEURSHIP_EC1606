# -*- coding: utf-8 -*-
"""Giãn khoảng nghỉ trong lời đọc của MỘT video, không đọc lại câu nào.

Dùng khi kịch bản một video quá ngắn so với mức 12 phút của Mẫu HLS-VLU-08
(đã gặp ở Chương 4, video 1: 11,5 phút) mà chưa có lời giảng bổ sung. Đọc lại
bằng mô hình thì giọng mỗi lần một khác và tốn hàng giờ; ở đây chỉ chèn thêm
lặng vào đúng các khoảng nghỉ doc_loi.py đã đặt.

Khoảng nghỉ của doc_loi.py là chuỗi mẫu bằng ĐÚNG 0 (np.zeros), dài
NGHI_CAU giữa hai câu và NGHI_CUOI ở cuối slide; lời nói thật không bao giờ có
hàng chục nghìn mẫu 0 liền nhau. Nên tìm các đoạn 0 dài ít nhất NGHI_CAU, đếm
phải đúng bằng số câu của slide (mỗi câu một khoảng nghỉ theo sau), lệch là
dừng chứ không đoán.

Tệp gốc chép sang <thư mục>/goc_v<video>/ trước khi ghi đè; so_do.json cập
nhật độ dài mới và ghi lại mức nghỉ đã dùng.

Dùng: python gian_nghi.py <thư mục âm thanh> <video> <nghỉ giữa câu> <nghỉ cuối slide>
  vd: python gian_nghi.py am-ch04 1 1.15 1.5
"""
import json
import os
import shutil
import sys

import numpy as np
import soundfile as sf

NGHI_CAU_CU = 0.55   # phải khớp doc_loi.py


def main(thu_muc, video, nghi_cau, nghi_cuoi):
    duong_so_do = os.path.join(thu_muc, 'so_do.json')
    so_do = json.load(open(duong_so_do, encoding='utf-8'))
    sr = so_do['tan_so']
    sao = os.path.join(thu_muc, 'goc_v%d' % video)
    os.makedirs(sao, exist_ok=True)
    truoc = sau = 0.0
    for s in so_do['slides']:
        if s['video'] != video:
            continue
        tep = os.path.join(thu_muc, s['tep'])
        goc = os.path.join(sao, s['tep'])
        if not os.path.exists(goc):          # chạy lại lần hai vẫn đi từ bản gốc
            shutil.copy2(tep, goc)
        a, _ = sf.read(goc, dtype='int16')
        bien = np.diff(np.concatenate([[0], (a == 0).astype(np.int8), [0]]))
        dau, cuoi = np.where(bien == 1)[0], np.where(bien == -1)[0]
        nghi = [(b, e) for b, e in zip(dau, cuoi) if e - b >= int(sr * NGHI_CAU_CU) - 2]
        if len(nghi) != len(s['cau']):
            sys.exit('%s: tìm thấy %d khoảng nghỉ, nhưng có %d câu — dừng' % (s['tep'], len(nghi), len(s['cau'])))
        doan, tu = [], 0
        for i, (b, e) in enumerate(nghi):
            doan.append(a[tu:b])
            doan.append(np.zeros(int(sr * (nghi_cuoi if i == len(nghi) - 1 else nghi_cau)), np.int16))
            tu = e
        doan.append(a[tu:])
        moi = np.concatenate(doan)
        sf.write(tep, moi, sr, subtype='PCM_16')
        truoc += len(a) / sr
        s['giay'] = round(len(moi) / sr, 2)
        s['nghi'] = [nghi_cau, nghi_cuoi]
        sau += s['giay']
    json.dump(so_do, open(duong_so_do, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print('video %d: %.2f → %.2f phút' % (video, truoc / 60, sau / 60))


if __name__ == '__main__':
    main(sys.argv[1], int(sys.argv[2]), float(sys.argv[3]), float(sys.argv[4]))
