# -*- coding: utf-8 -*-
"""Dựng ba loại tài liệu từ docs/muc_tieu_tu_nghien_cuu_huong_dan.json:
  - chuong-0N/muc-tieu/MUC_TIEU_CHUONG.docx + .pdf   (5 văn bản)
  - chuong-0N/chu-de-M/TU_NGHIEN_CUU.docx + .pdf     (10 văn bản)
  - huong-dan-on-tap/HUONG_DAN_ON_TAP_VA_KIEM_TRA.docx + .pdf  (1 văn bản)

Chạy: python3 tools/dung_muc_tieu.py
"""
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import dinh_dang_vanban as dd  # noqa: E402

GOC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
NGUON = os.path.join(GOC, 'docs', 'muc_tieu_tu_nghien_cuu_huong_dan.json')

TEN_CHUONG = {
    '01': 'Tổng quan về khởi sự doanh nghiệp',
    '02': 'Đánh giá cơ hội, ý tưởng phát triển kế hoạch kinh doanh',
    '03': 'Một số kỹ thuật huy động vốn',
    '04': 'Lựa chọn mô hình kinh doanh',
    '05': 'Marketing cho doanh nghiệp mới',
}


def _van_ban_don(tieu_de, phu_de, doan_van_list, duong_dan_khong_duoi):
    doc = dd.tao_docx()
    dd.doan_van(doc, tieu_de, dam=True, co_chu=15, can_giua=True, cach_sau=2)
    if phu_de:
        dd.doan_van(doc, phu_de, nghieng=True, can_giua=True, cach_sau=14)
    for p in doan_van_list:
        dd.doan_van(doc, p, cach_sau=8)
    doc.save(duong_dan_khong_duoi + '.docx')

    v = dd.TrinhVietPdf(duong_dan_khong_duoi + '.pdf')
    v.viet(tieu_de, dam=True, co_chu=15, cach_sau=4)
    if phu_de:
        v.viet(phu_de, nghieng=True, cach_sau=14)
    for p in doan_van_list:
        v.viet(p, cach_sau=8)
    v.luu()


def dung_muc_tieu_chuong(du_lieu):
    for i in range(1, 6):
        key = 'chuong_%02d' % i
        muc = du_lieu['muc_tieu_chuong'][key]
        thu_muc = os.path.join(GOC, 'chuong-%02d' % i, 'muc-tieu')
        os.makedirs(thu_muc, exist_ok=True)
        tieu_de = 'MỤC TIÊU CHƯƠNG %d — %s' % (i, TEN_CHUONG['%02d' % i].upper())
        _van_ban_don(tieu_de, None, [muc['noi_dung']],
                     os.path.join(thu_muc, 'MUC_TIEU_CHUONG'))
        n = len(muc['noi_dung'].split())
        print('Mục tiêu Chương %d: %d từ' % (i, n))


def dung_tu_nghien_cuu(du_lieu):
    for i in range(1, 6):
        for m in (1, 2):
            key = 'ch%02d_cd%d' % (i, m)
            td = du_lieu['chu_de_tu_nghien_cuu'][key]
            thu_muc = os.path.join(GOC, 'chuong-%02d' % i, 'chu-de-%d' % m)
            os.makedirs(thu_muc, exist_ok=True)
            tieu_de = 'CHỦ ĐỀ TỰ NGHIÊN CỨU — Chương %d, Chủ đề %d: %s' % (i, m, td['tieu_de'])
            doan = [td['noi_dung']]
            if td.get('cau_hoi_dinh_huong'):
                doan.append('Câu hỏi định hướng tự nghiên cứu:')
                for j, ch in enumerate(td['cau_hoi_dinh_huong'], 1):
                    doan.append('%d. %s' % (j, ch))
            _van_ban_don(tieu_de, None, doan, os.path.join(thu_muc, 'TU_NGHIEN_CUU'))


def dung_huong_dan_on_tap(du_lieu):
    thu_muc = os.path.join(GOC, 'huong-dan-on-tap')
    os.makedirs(thu_muc, exist_ok=True)
    noi_dung = du_lieu['huong_dan_on_tap']['noi_dung']
    doan = [p for p in noi_dung.split('\n\n') if p.strip()]
    _van_ban_don('TÀI LIỆU HƯỚNG DẪN ÔN TẬP VÀ KIỂM TRA',
                 'Khởi sự doanh nghiệp (EC1606)', doan,
                 os.path.join(thu_muc, 'HUONG_DAN_ON_TAP_VA_KIEM_TRA'))
    print('Hướng dẫn ôn tập: %d từ' % sum(len(p.split()) for p in doan))


def main():
    du_lieu = json.load(open(NGUON, encoding='utf-8'))
    dung_muc_tieu_chuong(du_lieu)
    dung_tu_nghien_cuu(du_lieu)
    dung_huong_dan_on_tap(du_lieu)
    print('Xong.')


if __name__ == '__main__':
    main()
