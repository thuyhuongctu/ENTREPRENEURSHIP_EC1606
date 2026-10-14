# -*- coding: utf-8 -*-
"""Dựng de-cuong/DE_CUONG_HOC_PHAN_HLS.docx + .pdf từ docs/de_cuong_hls.json
(xem tools/dinh_dang_vanban.py cho quy cách Điều 20: A4, Times New Roman 13,
giãn dòng 1.5, lề 3-2-2-2.5cm).

Chạy: python3 tools/dung_de_cuong.py
"""
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import dinh_dang_vanban as dd  # noqa: E402

GOC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
NGUON = os.path.join(GOC, 'docs', 'de_cuong_hls.json')
THU_MUC_RA = os.path.join(GOC, 'de-cuong')

TIEU_DE = 'ĐỀ CƯƠNG HỌC PHẦN BIÊN SOẠN HỌC LIỆU SỐ'
# Tên trường mới (trước là Trường Đại học Sư phạm Kỹ thuật Vĩnh Long). Số hiệu
# "QĐ 55/QĐ-ĐHSPKTVL-ĐT_ĐBCL" trong nội dung thì giữ nguyên: đó là số văn bản
# đã ban hành, đổi theo tên mới là trích sai văn bản.
PHU_DE = 'Khởi sự doanh nghiệp (EC1606) — Trường Đại học Công nghệ Kỹ thuật Vĩnh Long'


def _them_bang_docx(doc, bang):
    t = doc.add_table(rows=1, cols=len(bang['headers']))
    t.style = 'Light Grid Accent 1'
    for i, h in enumerate(bang['headers']):
        t.rows[0].cells[i].text = h
        t.rows[0].cells[i].paragraphs[0].runs[0].bold = True
    for hang in bang['rows']:
        dong = t.add_row().cells
        for i, gt in enumerate(hang):
            dong[i].text = str(gt)
    doc.add_paragraph()


def dung_docx(du_lieu):
    doc = dd.tao_docx()
    dd.doan_van(doc, TIEU_DE, dam=True, co_chu=16, can_giua=True, cach_sau=2)
    dd.doan_van(doc, PHU_DE, nghieng=True, can_giua=True, cach_sau=16)

    for muc in du_lieu['sections']:
        dd.doan_van(doc, muc['heading'], dam=True, co_chu=14, cach_truoc=12, cach_sau=6)
        for p in muc.get('paragraphs', []):
            dd.doan_van(doc, p, cach_sau=6)
        if muc.get('table'):
            _them_bang_docx(doc, muc['table'])

    duong_dan = os.path.join(THU_MUC_RA, 'DE_CUONG_HOC_PHAN_HLS.docx')
    doc.save(duong_dan)
    return duong_dan


def _them_bang_pdf(v, bang):
    v.viet(' | '.join(bang['headers']), dam=True, cach_sau=4)
    for hang in bang['rows']:
        v.viet(' | '.join(str(x) for x in hang), cach_sau=2)
    v.viet('', cach_sau=8)


def dung_pdf(du_lieu):
    duong_dan = os.path.join(THU_MUC_RA, 'DE_CUONG_HOC_PHAN_HLS.pdf')
    v = dd.TrinhVietPdf(duong_dan)
    v.viet(TIEU_DE, dam=True, co_chu=16, cach_sau=4)
    v.viet(PHU_DE, nghieng=True, cach_sau=16)

    for muc in du_lieu['sections']:
        v.viet(muc['heading'], dam=True, co_chu=14, cach_sau=6)
        for p in muc.get('paragraphs', []):
            v.viet(p, cach_sau=6)
        if muc.get('table'):
            _them_bang_pdf(v, muc['table'])

    return v.luu()


def main():
    os.makedirs(THU_MUC_RA, exist_ok=True)
    du_lieu = json.load(open(NGUON, encoding='utf-8'))
    tong_tu = sum(len(p.split()) for muc in du_lieu['sections'] for p in muc.get('paragraphs', []))
    print('Tổng số từ (không tính bảng): %d' % tong_tu)
    d1 = dung_docx(du_lieu)
    d2 = dung_pdf(du_lieu)
    print('Đã lưu:', d1)
    print('Đã lưu:', d2)


if __name__ == '__main__':
    main()
