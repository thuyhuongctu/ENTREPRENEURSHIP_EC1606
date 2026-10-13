"""Dựng toàn bộ 10 video "chủ đề có bài giảng" (2 chủ đề/chương x 5 chương)
từ docs/kich_ban_chu_de.json (lời đọc) + docs/slide_noi_dung.json (tiêu đề/
gạch đầu dòng trên slide) — hai tệp này do gộp các tệp con
kich_ban_chu_de_ch0N.json / slide_noi_dung_chu_de_ch0N.json bằng
tools/gop_chu_de.py.

Sinh ra, cho MỖI chủ đề ch0N_cdM:
  chuong-0N/chu-de-M/bai-giang/NNN.jpg  (ảnh slide — Playwright, không qua
    LibreOffice/soffice vì soffice trong môi trường làm việc không chuyển
    được bất kỳ tệp nào sang PDF)
  chuong-0N/chu-de-M/bai-giang/video.mp4  (video — ffmpeg concat demuxer)

Không sửa tay bất kỳ tệp kết quả nào — sửa hai tệp JSON nguồn rồi chạy lại.

Chạy:  pip install playwright && playwright install chromium  # nếu chưa có
       python3 tools/dung_bai_giang.py
"""
import json
import os
import subprocess
import sys

from playwright.sync_api import sync_playwright

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import mau_slide as mau  # noqa: E402

GOC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
KICH_BAN_JSON = os.path.join(GOC, 'docs', 'kich_ban_chu_de.json')
SLIDE_JSON = os.path.join(GOC, 'docs', 'slide_noi_dung_chu_de.json')

CHROME_PATH = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome'

TOC_DO_DOC = 206.0  # từ/phút — đo thật ở ec6035tx-chuong-5 (ComDraft, cùng tác giả)
NGHI_CHUYEN_SLIDE = 1.0
THOI_LUONG_TOI_THIEU = 4.0

# (ma_chu_de, so_chuong, so_chu_de, thu_muc_chuong)
CAC_CHU_DE = [
    ('ch01_cd1', 1, 1, 'chuong-01'), ('ch01_cd2', 1, 2, 'chuong-01'),
    ('ch02_cd1', 2, 1, 'chuong-02'), ('ch02_cd2', 2, 2, 'chuong-02'),
    ('ch03_cd1', 3, 1, 'chuong-03'), ('ch03_cd2', 3, 2, 'chuong-03'),
    ('ch04_cd1', 4, 1, 'chuong-04'), ('ch04_cd2', 4, 2, 'chuong-04'),
    ('ch05_cd1', 5, 1, 'chuong-05'), ('ch05_cd2', 5, 2, 'chuong-05'),
]

# Chủ đề tiếp theo để hiện ở slide kết (rỗng nếu là chủ đề cuối học phần)
CHU_DE_TIEP_THEO = {}
for i, (ma, ch, cd, _) in enumerate(CAC_CHU_DE):
    if i + 1 < len(CAC_CHU_DE):
        ma_sau, ch_sau, cd_sau, _ = CAC_CHU_DE[i + 1]
        CHU_DE_TIEP_THEO[ma] = (ch_sau, cd_sau)
    else:
        CHU_DE_TIEP_THEO[ma] = None


def uoc_tinh_thoi_luong(loi_doc):
    so_tu = len(loi_doc.split())
    return max(THOI_LUONG_TOI_THIEU, so_tu / TOC_DO_DOC * 60.0 + NGHI_CHUYEN_SLIDE)


def dung_mot_chu_de(trinh_duyet, ma_chu_de, so_chuong, so_chu_de, thu_muc_chuong,
                     diem_doc, slides):
    assert len(diem_doc) == len(slides), (
        '%s: %d điểm đọc nhưng %d slide — hai tệp phải khớp 1-1'
        % (ma_chu_de, len(diem_doc), len(slides)))

    tong_so_tu = sum(len(d['loi_doc'].split()) for d in diem_doc)
    thoi_luong_uoc = tong_so_tu / TOC_DO_DOC * 60.0 + len(diem_doc) * NGHI_CHUYEN_SLIDE
    print('%s: %d từ, %d slide, ước tính %.1f phút' % (
        ma_chu_de, tong_so_tu, len(slides), thoi_luong_uoc / 60))
    if not (7 * 60 <= thoi_luong_uoc <= 15 * 60):
        print('  !! CẢNH BÁO: ngoài khoảng 7-15 phút bắt buộc của quy định')

    thu_muc_ra = os.path.join(GOC, thu_muc_chuong, 'chu-de-%d' % so_chu_de, 'bai-giang')
    os.makedirs(thu_muc_ra, exist_ok=True)
    for ten_tep in os.listdir(thu_muc_ra):
        if ten_tep.endswith('.jpg'):
            os.remove(os.path.join(thu_muc_ra, ten_tep))

    tong_so = len(slides)
    chu_de_sau = CHU_DE_TIEP_THEO[ma_chu_de]
    chu_tiep_theo_chu = ''
    if chu_de_sau:
        chu_tiep_theo_chu = 'Tiếp theo — Chương %d, Chủ đề %d' % chu_de_sau

    trang = trinh_duyet.new_page(viewport={'width': 1280, 'height': 720}, device_scale_factor=1.5)
    anh_xa = []
    for i, s in enumerate(slides):
        so_trang = i + 1
        dur = uoc_tinh_thoi_luong(diem_doc[i]['loi_doc'])
        anh_xa.append((so_trang, dur))
        if so_trang == 1:
            mo_ta = ' '.join(s.get('bullets', []))
            noi_dung = mau.trang_bia(so_chuong, so_chu_de, s['title'], mo_ta, tong_so)
        elif so_trang == tong_so:
            mo_ta = ' '.join(s.get('bullets', []))
            noi_dung = mau.trang_ket(so_chuong, so_chu_de, mo_ta, chu_tiep_theo_chu, so_trang, tong_so)
        else:
            noi_dung = mau.trang_noi_dung(s.get('kicker', ''), s['title'], s['bullets'], so_trang, tong_so)

        trang.set_content(mau.trang_html_day_du(noi_dung))
        trang.wait_for_timeout(80)
        trang.screenshot(path=os.path.join(thu_muc_ra, '%03d.jpg' % so_trang), type='jpeg', quality=90)
    trang.close()

    duong_dan_concat = '/tmp/%s_concat.txt' % ma_chu_de
    dong = []
    for so_anh, dur in anh_xa:
        anh = os.path.join(thu_muc_ra, '%03d.jpg' % so_anh)
        dong.append("file '%s'" % anh)
        dong.append('duration %.2f' % dur)
    anh_cuoi = os.path.join(thu_muc_ra, '%03d.jpg' % anh_xa[-1][0])
    dong.append("file '%s'" % anh_cuoi)
    with open(duong_dan_concat, 'w', encoding='utf-8') as f:
        f.write('\n'.join(dong))

    duong_dan_video = os.path.join(thu_muc_ra, 'video.mp4')
    lenh = [
        'ffmpeg', '-y', '-f', 'concat', '-safe', '0', '-i', duong_dan_concat,
        '-vf', 'scale=1280:720,format=yuv420p',
        '-r', '25', '-c:v', 'libx264', '-pix_fmt', 'yuv420p',
        duong_dan_video,
    ]
    subprocess.run(lenh, check=True, capture_output=True)
    return thoi_luong_uoc


def main():
    kich_ban = json.load(open(KICH_BAN_JSON, encoding='utf-8'))
    slide_noi_dung = json.load(open(SLIDE_JSON, encoding='utf-8'))

    with sync_playwright() as p:
        trinh_duyet = p.chromium.launch(executable_path=CHROME_PATH)
        tong_ket = []
        for ma_chu_de, so_chuong, so_chu_de, thu_muc_chuong in CAC_CHU_DE:
            assert ma_chu_de in kich_ban, 'Thiếu %s trong %s' % (ma_chu_de, KICH_BAN_JSON)
            assert ma_chu_de in slide_noi_dung, 'Thiếu %s trong %s' % (ma_chu_de, SLIDE_JSON)
            diem_doc = kich_ban[ma_chu_de]['diem_doc']
            slides = slide_noi_dung[ma_chu_de]
            dur = dung_mot_chu_de(trinh_duyet, ma_chu_de, so_chuong, so_chu_de,
                                   thu_muc_chuong, diem_doc, slides)
            tong_ket.append((ma_chu_de, len(slides), dur))
        trinh_duyet.close()

    print('\n== TỔNG KẾT ==')
    for ma, so_slide, dur in tong_ket:
        ok = '' if 7 * 60 <= dur <= 15 * 60 else '  !! NGOÀI 7-15 PHÚT'
        print('  %-10s %2d slide  %5.1f phút%s' % (ma, so_slide, dur / 60, ok))


if __name__ == '__main__':
    main()
