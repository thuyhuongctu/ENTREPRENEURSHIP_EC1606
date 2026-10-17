"""Dựng dải tiếng của một video từ các tệp lời đọc, đặt đúng chỗ Remotion đặt.

    python3 ghep_am.py <du-lieu/chCC.json> <so_do.json> <video> <ra.wav>

Remotion dựng tiếng (--codec=wav) mà vẫn phải dựng cảnh 3D từng khung: chạy 20
phút chưa ra nổi một tệp. Mà tiếng ở đây chỉ là mỗi slide một <Audio> đặt ở đầu
<Sequence> của slide ấy (BaiGiang.tsx), nên ghép tay cho kết quả y hệt trong
vài giây. Vị trí và độ dài theo đúng soKhung(): ceil(giây × 30) khung mỗi slide;
lời dài hơn khung thì cắt như Sequence cắt.
"""
import json, math, sys, wave
from array import array

FPS = 30
du_lieu, so_do, video, ra = sys.argv[1], sys.argv[2], int(sys.argv[3]), sys.argv[4]
thu_muc = so_do.rsplit('/', 1)[0]
slides = [s for s in json.load(open(du_lieu))['slides'] if s['video'] == video]
am = {a['so']: a for a in json.load(open(so_do))['slides'] if a['video'] == video}
tan_so = None
khung = [math.ceil(am[s['so']]['giay'] * FPS) if s['so'] in am else math.ceil(8 * FPS) for s in slides]
mau = []
for s, k in zip(slides, khung):
    dai = round(k * 48000 / FPS)
    if s['so'] in am:
        with wave.open(f"{thu_muc}/{am[s['so']]['tep']}") as w:
            assert w.getsampwidth() == 2 and w.getnchannels() == 1, w.getparams()
            tan_so = tan_so or w.getframerate()
            assert w.getframerate() == tan_so == 48000, w.getframerate()
            a = array('h', w.readframes(w.getnframes()))
    else:
        a = array('h')
    a = a[:dai]
    a.extend([0] * (dai - len(a)))
    mau.append(a)
tong = array('h')
for a in mau:
    tong.extend(a)
with wave.open(ra, 'wb') as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(48000)
    w.writeframes(tong.tobytes())
print(f'ghep_am: {len(slides)} slide, {sum(khung)} khung, {len(tong) / 48000:.2f} giây')
