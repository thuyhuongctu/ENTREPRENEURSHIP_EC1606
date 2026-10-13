# -*- coding: utf-8 -*-
"""Dựng ba loại tài liệu bài tập từ docs/bai_tap_ch01_ch03.json +
docs/bai_tap_ch04_ch05.json (gộp lại ở đây, không cần tệp gộp riêng):
  - chuong-0N/chu-de-M/BAI_TAP_TU_DANH_GIA.docx + .pdf        (10 văn bản,
    4-5 bài có đáp án/chủ đề — "kết thúc chủ đề")
  - chuong-0N/bai-tap-ket-thuc-chuong/BAI_TAP_KET_THUC_CHUONG.docx + .pdf
    (5 văn bản — 10-15 TN/3-5 tự luận/1-2 tình huống)
  - chuong-0N/danh-gia-ket-thuc-chuong/NGAN_HANG_DANH_GIA.docx + .pdf
    (5 văn bản — ngân hàng 20-30 TN/6-10 tự luận/2-4 tình huống)

Chạy: python3 tools/dung_bai_tap.py
"""
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import dinh_dang_vanban as dd  # noqa: E402

GOC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DOCS = os.path.join(GOC, 'docs')


def _tai_va_gop():
    a = json.load(open(os.path.join(DOCS, 'bai_tap_ch01_ch03.json'), encoding='utf-8'))
    b = json.load(open(os.path.join(DOCS, 'bai_tap_ch04_ch05.json'), encoding='utf-8'))
    gop = {}
    for khoa in ('ket_thuc_chu_de', 'ket_thuc_chuong', 'ngan_hang_ket_thuc_chuong'):
        gop[khoa] = {**a.get(khoa, {}), **b.get(khoa, {})}
    return gop


def _viet_docx_pdf(tieu_de, phu_de, doan_viet_fn, duong_dan_khong_duoi):
    doc = dd.tao_docx()
    dd.doan_van(doc, tieu_de, dam=True, co_chu=15, can_giua=True, cach_sau=2)
    if phu_de:
        dd.doan_van(doc, phu_de, nghieng=True, can_giua=True, cach_sau=14)
    doan_viet_fn('docx', doc)
    doc.save(duong_dan_khong_duoi + '.docx')

    v = dd.TrinhVietPdf(duong_dan_khong_duoi + '.pdf')
    v.viet(tieu_de, dam=True, co_chu=15, cach_sau=4)
    if phu_de:
        v.viet(phu_de, nghieng=True, cach_sau=14)
    doan_viet_fn('pdf', v)
    v.luu()


def dung_tu_danh_gia_chu_de(gop):
    for key, bai_list in gop['ket_thuc_chu_de'].items():
        ch = int(key[2:4])
        cd = int(key[-1])
        thu_muc = os.path.join(GOC, 'chuong-%02d' % ch, 'chu-de-%d' % cd)
        os.makedirs(thu_muc, exist_ok=True)

        def viet(dinh_dang, dich, bai_list=bai_list):
            for i, bai in enumerate(bai_list, 1):
                if dinh_dang == 'docx':
                    dd.doan_van(dich, '%d. %s' % (i, bai['cau_hoi']), dam=True, cach_sau=2)
                    dd.doan_van(dich, 'Đáp án: %s' % bai['dap_an'], nghieng=True, cach_sau=8)
                else:
                    dich.viet('%d. %s' % (i, bai['cau_hoi']), dam=True, cach_sau=2)
                    dich.viet('Đáp án: %s' % bai['dap_an'], nghieng=True, cach_sau=8)

        _viet_docx_pdf('BÀI TẬP TỰ ĐÁNH GIÁ — Chương %d, Chủ đề %d' % (ch, cd), None,
                        viet, os.path.join(thu_muc, 'BAI_TAP_TU_DANH_GIA'))
        print('%s: %d bài tự đánh giá' % (key, len(bai_list)))


def _viet_khoi_bai_tap(dinh_dang, dich, khoi, bat_dau_so=1):
    so = bat_dau_so
    if khoi.get('trac_nghiem'):
        tieu = 'A. TRẮC NGHIỆM (%d câu)' % len(khoi['trac_nghiem'])
        (dd.doan_van(dich, tieu, dam=True, cach_truoc=10) if dinh_dang == 'docx'
         else dich.viet(tieu, dam=True, cach_sau=6))
        for cau in khoi['trac_nghiem']:
            dong = '%d. %s' % (so, cau['cau_hoi'])
            lua_chon = '   '.join('%s. %s' % (k, v) for k, v in cau.get('lua_chon', {}).items())
            if dinh_dang == 'docx':
                dd.doan_van(dich, dong, cach_sau=1)
                if lua_chon:
                    dd.doan_van(dich, lua_chon, cach_sau=1)
                dd.doan_van(dich, 'Đáp án: %s' % cau['dap_an'], nghieng=True, cach_sau=6)
            else:
                dich.viet(dong, cach_sau=1)
                if lua_chon:
                    dich.viet(lua_chon, cach_sau=1)
                dich.viet('Đáp án: %s' % cau['dap_an'], nghieng=True, cach_sau=6)
            so += 1
    if khoi.get('tu_luan'):
        tieu = 'B. TỰ LUẬN (%d câu)' % len(khoi['tu_luan'])
        (dd.doan_van(dich, tieu, dam=True, cach_truoc=10) if dinh_dang == 'docx'
         else dich.viet(tieu, dam=True, cach_sau=6))
        for i, cau in enumerate(khoi['tu_luan'], 1):
            dong = '%d. %s' % (i, cau['cau_hoi'])
            (dd.doan_van(dich, dong, cach_sau=6) if dinh_dang == 'docx'
             else dich.viet(dong, cach_sau=6))
    if khoi.get('tinh_huong'):
        tieu = 'C. BÀI TẬP TÌNH HUỐNG (%d bài)' % len(khoi['tinh_huong'])
        (dd.doan_van(dich, tieu, dam=True, cach_truoc=10) if dinh_dang == 'docx'
         else dich.viet(tieu, dam=True, cach_sau=6))
        for i, th in enumerate(khoi['tinh_huong'], 1):
            if dinh_dang == 'docx':
                dd.doan_van(dich, '%d. Tình huống: %s' % (i, th['mo_ta']), cach_sau=1)
                dd.doan_van(dich, 'Yêu cầu: %s' % th['yeu_cau'], cach_sau=1)
                dd.doan_van(dich, 'Gợi ý đáp án: %s' % th.get('goi_y_dap_an', ''),
                            nghieng=True, cach_sau=8)
            else:
                dich.viet('%d. Tình huống: %s' % (i, th['mo_ta']), cach_sau=1)
                dich.viet('Yêu cầu: %s' % th['yeu_cau'], cach_sau=1)
                dich.viet('Gợi ý đáp án: %s' % th.get('goi_y_dap_an', ''), nghieng=True, cach_sau=8)


def dung_ket_thuc_chuong(gop):
    for key, khoi in gop['ket_thuc_chuong'].items():
        ch = int(key.split('_')[1])
        thu_muc = os.path.join(GOC, 'chuong-%02d' % ch, 'bai-tap-ket-thuc-chuong')
        os.makedirs(thu_muc, exist_ok=True)
        _viet_docx_pdf('BÀI TẬP TỰ ĐÁNH GIÁ KẾT THÚC CHƯƠNG %d' % ch, None,
                        lambda d, dich, khoi=khoi: _viet_khoi_bai_tap(d, dich, khoi),
                        os.path.join(thu_muc, 'BAI_TAP_KET_THUC_CHUONG'))
        print('Chương %d kết thúc chương: %d TN, %d tự luận, %d tình huống' % (
            ch, len(khoi.get('trac_nghiem', [])), len(khoi.get('tu_luan', [])),
            len(khoi.get('tinh_huong', []))))


def dung_ngan_hang(gop):
    for key, khoi in gop['ngan_hang_ket_thuc_chuong'].items():
        ch = int(key.split('_')[1])
        thu_muc = os.path.join(GOC, 'chuong-%02d' % ch, 'danh-gia-ket-thuc-chuong')
        os.makedirs(thu_muc, exist_ok=True)
        _viet_docx_pdf('NGÂN HÀNG ĐÁNH GIÁ KẾT THÚC CHƯƠNG %d' % ch,
                        'Khi kiểm tra sẽ chọn ngẫu nhiên 1/2 câu hỏi/bài tập từ ngân hàng này.',
                        lambda d, dich, khoi=khoi: _viet_khoi_bai_tap(d, dich, khoi),
                        os.path.join(thu_muc, 'NGAN_HANG_DANH_GIA'))
        print('Chương %d ngân hàng: %d TN, %d tự luận, %d tình huống' % (
            ch, len(khoi.get('trac_nghiem', [])), len(khoi.get('tu_luan', [])),
            len(khoi.get('tinh_huong', []))))


def main():
    gop = _tai_va_gop()
    dung_tu_danh_gia_chu_de(gop)
    dung_ket_thuc_chuong(gop)
    dung_ngan_hang(gop)
    print('Xong.')


if __name__ == '__main__':
    main()
