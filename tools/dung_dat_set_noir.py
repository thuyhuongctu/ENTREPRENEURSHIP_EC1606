# -*- coding: utf-8 -*-
"""Bộ prompt "3D đất sét noir" cho ArtCraft, từng slide của 5 chương EC1606.

Đầu vào (NGUỒN): docs/dat_set_noir_ch0N.json — mỗi slide một cảnh (mô tả
tiếng Việt, prompt ảnh, prompt video, đạo cụ/tư thế/góc máy/ánh sáng/màu
nhấn). Thứ tự slide khớp đúng bộ slide của chương (tools/dung_goi_chuong.py).

Đầu ra cho mỗi chương N, trong chuong-0N/dat-set-noir/:
  PROMPT_ARTCRAFT__CHUONG_N_EC1606.docx + .pdf   đọc và chép prompt
  PROMPT_ARTCRAFT__CHUONG_N_EC1606.csv           chép hàng loạt
  TONG_QUAN.jpg                                  ảnh ghép mọi khung bố cục
(ảnh khung bố cục anh/NNN.jpg do tools/dat_set_noir/dung_anh.mjs dựng.)

Prompt trong JSON cố ý KHÔNG chứa từ chỉ phong cách; khối phong cách ghép
thêm ở đây, một chỗ duy nhất — đổi phong cách cả 154 slide thì sửa ở đây.

Chạy: python3 tools/dung_dat_set_noir.py
"""
import csv
import json
import os
import sys

from PIL import Image

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from dung_goi_chuong import HaiBan, GIANG_VIEN, MA_HP, TEN_HP  # noqa: E402

GOC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DOCS = os.path.join(GOC, 'docs')

TEN_CHUONG = {
    1: 'Tổng quan về khởi sự doanh nghiệp',
    2: 'Đánh giá cơ hội, ý tưởng phát triển kế hoạch kinh doanh',
    3: 'Một số kỹ thuật huy động vốn',
    4: 'Lựa chọn mô hình kinh doanh',
    5: 'Marketing cho doanh nghiệp mới',
}

NHAN_VAT = ('Huong AI is a handmade clay figurine of a young Vietnamese woman lecturer with long wavy '
            'auburn hair, wearing a pearl-white ao dai; keep her identical to the reference image')

PHONG_CACH = ('3D claymation diorama, handmade plasticine figures and props with visible fingerprints and '
              'soft matte clay texture, film noir mood, deep black shadows, {anh_sang}, almost monochrome '
              'palette with a single {mau} accent, {camera}, shallow depth of field, 35mm film grain, '
              'aspect ratio 16:9')
PHONG_CACH_VIDEO = ('stop-motion claymation look with subtle frame-to-frame jitter, film noir, {anh_sang}, '
                    'single {mau} accent, 16:9, about 5 seconds')
TRANH = ('text, letters, words, numbers, captions, watermark, logo, glossy plastic, photorealistic skin, '
         'bright colorful background, extra fingers, distorted face')

ANH_SANG = {
    'rem_sao': 'hard light through venetian blinds casting striped shadows',
    'den_roi': 'one hard spotlight on a dark stage',
    'den_ban': 'warm pool of desk-lamp light in a dark room',
}
MAU = {'do': 'deep red', 'ho_phach': 'amber', 'xanh_ngoc': 'teal'}
CAMERA = {'rong': 'wide establishing shot', 'trung': 'medium shot', 'can': 'close-up shot',
          'tu_tren': 'high-angle shot'}


def prompt_day_du(c):
    co_nguoi = c['tu_the'] != 'khong_co'
    anh = c['prompt_anh'].rstrip('. ') + '. '
    if co_nguoi:
        anh += NHAN_VAT + '. '
    anh += PHONG_CACH.format(anh_sang=ANH_SANG[c['anh_sang']], mau=MAU[c['mau_nhan']],
                             camera=CAMERA[c['camera']]) + '.'
    video = c['prompt_video'].rstrip('. ') + '. ' + PHONG_CACH_VIDEO.format(
        anh_sang=ANH_SANG[c['anh_sang']], mau=MAU[c['mau_nhan']]) + '.'
    return anh, video


def tieu_de_slide(so):
    """Tiêu đề từng slide, lấy thẳng từ trình dựng gói chương (chỉ dựng trong
    bộ nhớ, không ghi tệp nào) — để số slide ở đây không lệch với bộ slide."""
    import dung_goi_chuong as g
    cu = (g.CHI_VAN_BAN, g.viet_noi_dung_slide, g.viet_kich_ban, g.viet_on_tap)
    g.CHI_VAN_BAN = True
    g.viet_noi_dung_slide = g.viet_kich_ban = g.viet_on_tap = lambda *a, **k: None
    try:
        sl = json.load(open(os.path.join(DOCS, 'slide_noi_dung_chu_de.json'), encoding='utf-8'))
        kb = json.load(open(os.path.join(DOCS, 'kich_ban_chu_de.json'), encoding='utf-8'))
        goi = json.load(open(os.path.join(DOCS, 'goi_chuong_ch%02d.json' % so), encoding='utf-8'))
        return [b[0] for b in g.dung_chuong(so, sl, kb, goi)]
    finally:
        g.CHI_VAN_BAN, g.viet_noi_dung_slide, g.viet_kich_ban, g.viet_on_tap = cu


def anh_tong_quan(thu_muc_anh, so_slide, duong_ra):
    cot, w, h = 6, 320, 180
    hang = -(-so_slide // cot)
    tam = Image.new('RGB', (cot * w, hang * h), 'black')
    for k in range(so_slide):
        tep = os.path.join(thu_muc_anh, '%03d.jpg' % (k + 1))
        if os.path.exists(tep):
            tam.paste(Image.open(tep).resize((w, h)), ((k % cot) * w, (k // cot) * h))
    tam.save(duong_ra, quality=85)


def dung_chuong(so):
    ds = json.load(open(os.path.join(DOCS, 'dat_set_noir_ch%02d.json' % so), encoding='utf-8'))
    tm = os.path.join(GOC, 'chuong-%02d' % so, 'dat-set-noir')
    os.makedirs(tm, exist_ok=True)
    goc_ten = os.path.join(tm, 'PROMPT_ARTCRAFT__CHUONG_%d_%s' % (so, MA_HP))

    with open(goc_ten + '.csv', 'w', newline='', encoding='utf-8-sig') as f:
        w = csv.writer(f)
        w.writerow(['slide', 'khung_bo_cuc', 'can_anh_huong_ai', 'prompt_anh', 'prompt_video', 'prompt_tranh'])
        for c in ds:
            anh, video = prompt_day_du(c)
            w.writerow([c['slide'], 'anh/%03d.jpg' % c['slide'], 'có' if c['tu_the'] != 'khong_co' else 'không',
                        anh, video, TRANH])

    v = HaiBan(goc_ten)
    v.doan('BỘ PROMPT ARTCRAFT — BÀI GIẢNG 3D ĐẤT SÉT NOIR', dam=True, co=15, giua=True)
    v.doan('CHƯƠNG %d: %s' % (so, TEN_CHUONG[so].upper()), dam=True, giua=True)
    v.doan('Học phần: %s (%s)' % (TEN_HP, MA_HP), giua=True)
    v.doan('Giảng viên: ' + GIANG_VIEN, nghieng=True, giua=True)
    v.doan('CÁCH DÙNG TRONG ARTCRAFT', dam=True, sau=4)
    for y in (
        'Mỗi mục dưới đây ứng với một slide, đúng số thứ tự trong bộ slide của chương (thư mục slides/).',
        'Tạo ảnh: chọn mô hình tạo/sửa ảnh, đưa ảnh khung bố cục "anh/NNN.jpg" làm ảnh tham chiếu bố cục; '
        'slide có Hương AI thì thêm ảnh Hương AI (assets/huong-ai/) làm tham chiếu nhân vật; dán "Prompt ảnh" '
        'và "Tránh" (negative prompt, nếu mô hình có ô này).',
        'Tạo video: dùng chức năng ảnh sang video với ảnh vừa tạo, dán "Prompt video". Mô hình Pixverse có '
        'sẵn kiểu "clay" — chọn kiểu đó thì càng đúng chất đất sét.',
        'Prompt viết bằng tiếng Anh vì các mô hình tạo ảnh hiểu tiếng Anh tốt hơn; không yêu cầu chữ trong '
        'ảnh — mô hình thường viết sai chữ tiếng Việt. Chữ của slide đặt vào sau, khi dựng slide.',
        'Cả bộ dùng chung một khối phong cách (đất sét nặn tay, noir, một màu nhấn) để 154 ảnh đồng bộ. '
        'Tệp .csv cùng thư mục chứa đủ prompt để chép hàng loạt.',
        'Ảnh/video tạo bằng AI từ nhân vật Hương AI cần ghi chú "nhân vật minh họa do AI tạo" khi đưa lên '
        'slide, như ảnh Hương AI ở trang bìa.',
    ):
        v.doan('• ' + y, thut=12, sau=2)
    video_truoc = 0
    ds_slide = tieu_de_slide(so)
    assert len(ds_slide) == len(ds), 'Chương %d: %d cảnh nhưng bộ slide có %d trang' % (so, len(ds), len(ds_slide))
    for c in ds:
        anh, video = prompt_day_du(c)
        v.doan('SLIDE %d' % c['slide'] + (' – ' + ds_slide[c['slide'] - 1] if ds_slide else ''), dam=True, sau=2)
        v.doan('Cảnh: ' + c['canh_vi'], nghieng=True, sau=2)
        v.doan('Khung bố cục: anh/%03d.jpg%s' % (
            c['slide'], ' · tham chiếu nhân vật: Hương AI' if c['tu_the'] != 'khong_co' else ''), co=12, sau=2)
        v.doan('Prompt ảnh: ' + anh, co=11, sau=2)
        v.doan('Prompt video: ' + video, co=11, sau=2)
        v.doan('Tránh: ' + TRANH, co=11, sau=10)
    v.luu()
    anh_tong_quan(os.path.join(tm, 'anh'), len(ds), os.path.join(tm, 'TONG_QUAN.jpg'))
    print('Chương %d: %d slide -> %s' % (so, len(ds), os.path.relpath(tm, GOC)))


def main():
    for so in [int(x) for x in sys.argv[1:]] or [1, 2, 3, 4, 5]:
        dung_chuong(so)


if __name__ == '__main__':
    main()
