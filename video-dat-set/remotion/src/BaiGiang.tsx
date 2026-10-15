import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Img,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { CHU, CHU_TIEU_DE, MAU } from './mau';

export const FPS = 30;

export type Slide = {
  video: number;
  so: number;
  tieu_de: string;
  tren_slide: string[];
  goi_y_hinh: string;
  loi_doc: string;
};
export type Am = { video: number; so: number; tep: string; giay: number };
export type ThamSo = { chuong: number; video: number; slides: Slide[]; am: Am[]; nhap?: boolean };

export const soKhung = (giay: number) => Math.ceil(giay * FPS);

/* ---------- quy tắc chọn dáng Hương AI theo nội dung slide ---------- */

// Thứ tự quan trọng: luật đầu tiên khớp thắng. Tiêu đề trong dữ liệu viết hoa.
const LUAT_DANG: [RegExp, string][] = [
  [/TRANG BÌA/, 'chao'],
  [/KẾT THÚC/, 'vay_sen'],
  [/MỤC TIÊU/, 'chi_len'],
  [/NỘI DUNG CHƯƠNG|ĐANG Ở ĐÂU/, 'gioi_thieu'],
  [/CÂU HỎI|BA CÂU HỎI/, 'suy_nghi'],
  [/KIỂM CHỨNG|TIÊU CHÍ/, 'kinh_lup'],
  [/TÀI LIỆU/, 'om_sach'],
  [/KẾ HOẠCH/, 'ghi_chep'],
  [/RỦI RO|ĐẠO ĐỨC/, 'cam_khoa'],
  [/TÌNH HUỐNG|CHỊ HOA|GỐM ĐỎ/, 'cam_giay'],
  [/TỔNG KẾT/, 'chi_gay'],
];
const XOAY = ['chi_ngang', 'gioi_thieu', 'chi_gay', 'chi_len'];

const chonDang = (s: Slide, i: number) => {
  for (const [re, dang] of LUAT_DANG) if (re.test(s.tieu_de)) return dang;
  return XOAY[i % XOAY.length];
};

/* ---------- tách thẻ: "Nhãn: nội dung" ---------- */

// Cùng quy tắc với tach_y() trong tools/dung_goi_chuong.py: chỉ tách khi
// phần nhãn ngắn, không thì câu dài bị cắt đôi ở dấu hai chấm giữa câu.
const tachThe = (dong: string): { nhan: string; than: string } => {
  for (const dau of [': ', ' — ', ' – ']) {
    const k = dong.indexOf(dau);
    if (k > 0) {
      const trai = dong.slice(0, k).trim();
      const phai = dong.slice(k + dau.length).trim();
      const so_tu_trai = trai.split(/\s+/).length;
      if (so_tu_trai >= 1 && so_tu_trai <= 7 && phai.split(/\s+/).length >= 3) {
        return { nhan: trai, than: phai[0].toUpperCase() + phai.slice(1) };
      }
    }
  }
  return { nhan: '', than: dong };
};

/**
 * Thẻ hiện ra khi lời đọc chạm tới nó: tìm vị trí nhãn thẻ (hoặc mấy chữ đầu
 * của thân thẻ) trong lời đọc, quy ra tỉ lệ thời lượng. Không tìm thấy thì
 * rải đều trong 60% đầu slide. Ép tăng dần để thẻ không hiện ngược thứ tự.
 */
const thoiDiemThe = (s: Slide, the: { nhan: string; than: string }[], dai: number) => {
  const loi = s.loi_doc.toLowerCase();
  let truoc = 0.04;
  return the.map((t, i) => {
    const moc = (t.nhan || t.than).toLowerCase().split(/\s+/).slice(0, 3).join(' ').replace(/[.,:;]/g, '');
    const k = moc.length > 3 ? loi.indexOf(moc) : -1;
    let ti = k >= 0 ? k / loi.length : 0.08 + (0.55 * i) / Math.max(1, the.length);
    ti = Math.max(ti, truoc + 0.03);
    truoc = ti;
    return Math.min(ti, 0.85) * dai;
  });
};

/* ---------- mảnh giao diện đất sét ---------- */

const phong = (nen: string, bo = 30): React.CSSProperties => ({
  background: nen,
  borderRadius: bo,
  boxShadow:
    'inset -7px -9px 16px rgba(90,55,30,.14), inset 7px 9px 16px rgba(255,255,255,.7), 0 18px 36px rgba(120,80,50,.20)',
});

const Vien: React.FC<{ children: React.ReactNode; style?: React.CSSProperties; nen?: string }> = ({
  children, style, nen = MAU.giay,
}) => <div style={{ position: 'absolute', ...phong(nen), ...style }}>{children}</div>;

const Bat = (khung: number, tre: number, fps: number, damping = 13) =>
  spring({ frame: khung - tre, fps, config: { damping, stiffness: 130 } });

/* ---------- một slide ---------- */

const NHAN_AI = 'Hương AI · nhân vật minh họa do AI tạo';
const NHAN_GIONG = 'Giọng đọc tổng hợp bằng AI từ mẫu giọng của giảng viên';

const HuongAI: React.FC<{ dang: string; dai: number }> = ({ dang, dai }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const vao = Bat(f, 0, fps, 15);
  const tho = Math.sin((f / fps) * 1.6) * 0.006;
  return (
    <>
      <div style={{
        position: 'absolute', left: 150, top: 902, width: 330, height: 40, borderRadius: '50%',
        background: 'radial-gradient(ellipse at center, rgba(70,45,25,.30), rgba(70,45,25,0) 70%)',
      }} />
      <Img
        src={staticFile(`huong-ai/${dang}.webp`)}
        style={{
          position: 'absolute', left: 318, bottom: 158, height: 750,
          transform: `translateX(-50%) translateY(${(1 - vao) * 60}px) scale(${1 + tho}, ${1 - tho})`,
          transformOrigin: '50% 100%', opacity: Math.min(1, vao * 1.5),
        }}
      />
      <div style={{
        position: 'absolute', left: 310, bottom: 34, transform: 'translateX(-50%)', fontFamily: CHU,
        fontSize: 17, color: MAU.mo, fontStyle: 'italic', whiteSpace: 'nowrap',
        opacity: interpolate(f, [0, 20, dai - 10, dai], [0, 0.95, 0.95, 0.95]),
      }}>{NHAN_AI}</div>
    </>
  );
};

const Dau: React.FC<{ chuong: number; video: number; so: number; tong: number }> = ({ chuong, video, so, tong }) => (
  <>
    <Vien nen={MAU.xanh_dam} style={{ left: 40, top: 30, padding: '10px 26px', borderRadius: 999 }}>
      <div style={{ fontFamily: CHU, fontSize: 19, fontWeight: 700, letterSpacing: 1.5, color: MAU.giay }}>
        TRƯỜNG ĐẠI HỌC CÔNG NGHỆ KỸ THUẬT VĨNH LONG · KHOA KINH DOANH VÀ LUẬT
      </div>
    </Vien>
    <Vien style={{ right: 40, top: 30, padding: '10px 26px', borderRadius: 999 }}>
      <div style={{ fontFamily: CHU, fontSize: 19, fontWeight: 700, color: MAU.xanh_dam }}>
        Chương {chuong} · Video {video} · {so}/{tong}
      </div>
    </Vien>
    <div style={{
      position: 'absolute', right: 48, bottom: 30, fontFamily: CHU, fontSize: 18, color: MAU.mo,
    }}>Học liệu số · Khởi sự doanh nghiệp (EC1606)</div>
  </>
);

const TrangBia: React.FC<{ s: Slide; video: number }> = ({ s, video }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const a = Bat(f, 6, fps);
  const [ten, ...dong] = s.tren_slide;
  return (
    <Vien style={{
      left: 640, top: 210, width: 1180, padding: '48px 60px',
      opacity: Math.min(1, a * 1.4), transform: `scale(${0.9 + 0.1 * a})`,
    }}>
      <div style={{ fontFamily: CHU, fontSize: 24, fontWeight: 800, letterSpacing: 4, color: MAU.dat }}>
        HỌC LIỆU SỐ · VIDEO {video}
      </div>
      <div style={{ fontFamily: CHU_TIEU_DE, fontWeight: 700, fontSize: 64, lineHeight: 1.15, color: MAU.xanh_dam, marginTop: 14 }}>
        {ten}
      </div>
      <div style={{ height: 6, width: interpolate(f, [20, 60], [0, 360], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }), background: MAU.vang, borderRadius: 3, margin: '26px 0' }} />
      {dong.map((d) => (
        <div key={d} style={{ fontFamily: CHU, fontSize: 30, color: MAU.muc, lineHeight: 1.5 }}>{d}</div>
      ))}
      <div style={{ fontFamily: CHU, fontSize: 30, color: MAU.muc, lineHeight: 1.5, marginTop: 10 }}>
        Giảng viên: <b>Đỗ Thùy Hương</b>
      </div>
      <div style={{ fontFamily: CHU, fontSize: 20, color: MAU.mo, marginTop: 26, fontStyle: 'italic', lineHeight: 1.5 }}>
        {NHAN_GIONG}. {NHAN_AI}.
      </div>
    </Vien>
  );
};

const TrangThe: React.FC<{ s: Slide; dai: number; dinh_vi: string | null; tien: [number, number] | null }> = ({
  s, dai, dinh_vi, tien,
}) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const the = s.tren_slide.map(tachThe);
  const moc = thoiDiemThe(s, the, dai);
  const dang_doc = moc.reduce((k, m, i) => (f >= m ? i : k), -1);
  const n = the.length;
  const hai_cot = n >= 4;
  const tong_chu = the.reduce((a, t) => a + t.nhan.length + t.than.length, 0);
  // Chữ nhiều thì thu cỡ; mốc 420/600 ký tự đo trên các slide dài nhất chương 1.
  const co = tong_chu > 600 ? 27 : tong_chu > 420 ? 30 : 33;
  const a = Bat(f, 2, fps);
  return (
    <>
      <Vien style={{ left: 640, top: 104, right: 70, padding: '22px 36px', opacity: Math.min(1, a * 1.4), transform: `translateY(${(1 - a) * 20}px)` }}>
        {dinh_vi && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 8 }}>
            <div style={{ fontFamily: CHU, fontSize: 19, fontWeight: 800, letterSpacing: 2.5, color: MAU.dat }}>{dinh_vi}</div>
            {tien && (
              <div style={{ display: 'flex', gap: 6 }}>
                {Array.from({ length: tien[1] }).map((_, i) => (
                  <div key={i} style={{ width: 13, height: 13, borderRadius: 7, background: i < tien[0] ? MAU.xanh : i === tien[0] ? MAU.vang : '#e2d6c6' }} />
                ))}
              </div>
            )}
          </div>
        )}
        <div style={{ fontFamily: CHU_TIEU_DE, fontWeight: 700, fontSize: s.tieu_de.length > 44 ? 38 : 46, lineHeight: 1.15, color: MAU.xanh_dam }}>
          {s.tieu_de}
        </div>
      </Vien>
      <div style={{
        position: 'absolute', left: 640, right: 70, top: 280, bottom: 90,
        display: 'grid', gridTemplateColumns: hai_cot ? '1fr 1fr' : '1fr', gap: 24, alignContent: 'center',
      }}>
        {the.map((t, i) => {
          const b = Bat(f, moc[i], fps, 12);
          const dang = i === dang_doc;
          return (
            <div key={i} style={{
              ...phong(MAU.giay, 26), padding: '20px 26px',
              border: `4px solid ${dang ? MAU.vang : 'transparent'}`,
              opacity: Math.min(1, b * 1.4), transform: `translateY(${(1 - b) * 30}px) scale(${0.94 + 0.06 * b})`,
              gridColumn: hai_cot && n % 2 === 1 && i === n - 1 ? 'span 2' : undefined,
            }}>
              {t.nhan && (
                <div style={{ fontFamily: CHU, fontWeight: 800, fontSize: co + 2, color: MAU.xanh_dam, marginBottom: 6 }}>{t.nhan}</div>
              )}
              <div style={{ fontFamily: CHU, fontSize: co, lineHeight: 1.36, color: MAU.muc }}>{t.than}</div>
            </div>
          );
        })}
      </div>
    </>
  );
};

const Trang: React.FC<{ s: Slide; i: number; dai: number; tham: ThamSo; dinh_vi: string | null; tien: [number, number] | null; tong: number }> = ({
  s, i, dai, tham, dinh_vi, tien, tong,
}) => {
  const f = useCurrentFrame();
  const bia = /TRANG BÌA|KẾT THÚC/.test(s.tieu_de);
  const zoom = interpolate(f, [0, dai], [1, 1.035]);
  const mo = interpolate(f, [0, 8, dai - 8, dai], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <AbsoluteFill style={{ opacity: mo }}>
      <Img src={staticFile(bia ? 'nen/rong.png' : 'nen/giang.png')} style={{ position: 'absolute', inset: 0, transform: `scale(${zoom})` }} />
      <Dau chuong={tham.chuong} video={tham.video} so={i + 1} tong={tong} />
      <HuongAI dang={chonDang(s, i)} dai={dai} />
      {/TRANG BÌA/.test(s.tieu_de) ? <TrangBia s={s} video={tham.video} /> : <TrangThe s={s} dai={dai} dinh_vi={dinh_vi} tien={tien} />}
    </AbsoluteFill>
  );
};

/**
 * Nhãn "đang ở đâu": slide nằm trong một chủ đề (sau slide mở chủ đề "1.1.",
 * "1.2." ...) thì ghi tên chủ đề và chấm tiến độ; trang khung thì ghi tên phần.
 */
const dinhVi = (slides: Slide[]) => {
  let bat_dau = -1;
  let ten = '';
  return slides.map((s, i) => {
    const m = s.tieu_de.match(/^(\d+\.\d+)\./);
    if (m) {
      bat_dau = i;
      ten = m[1];
      return { nhan: `CHỦ ĐỀ ${ten}`, tien: null as [number, number] | null };
    }
    if (/TỔNG KẾT CHƯƠNG|CÂU HỎI ÔN TẬP|TÌNH HUỐNG|TÀI LIỆU|KẾT THÚC/.test(s.tieu_de)) bat_dau = -1;
    if (bat_dau >= 0) {
      let cuoi = slides.length - 1;
      for (let k = bat_dau + 1; k < slides.length; k++) {
        if (/TỔNG KẾT CHƯƠNG|CÂU HỎI ÔN TẬP|TÌNH HUỐNG|TÀI LIỆU|KẾT THÚC/.test(slides[k].tieu_de)) { cuoi = k - 1; break; }
        if (/TỔNG KẾT CHỦ ĐỀ/.test(slides[k].tieu_de)) { cuoi = k; break; }
      }
      return { nhan: `CHỦ ĐỀ ${ten} · ${i - bat_dau}/${cuoi - bat_dau}`, tien: [i - bat_dau - 1, cuoi - bat_dau] as [number, number] };
    }
    return { nhan: 'CHƯƠNG 1 · TỔNG QUAN VỀ KHỞI SỰ DOANH NGHIỆP', tien: null };
  });
};

export const BaiGiang: React.FC<ThamSo> = (tham) => {
  const slides = tham.slides.filter((s) => s.video === tham.video);
  const vi = dinhVi(slides);
  let tu = 0;
  return (
    <AbsoluteFill style={{ background: MAU.nen }}>
      {slides.map((s, i) => {
        const am = tham.am.find((a) => a.so === s.so);
        const dai = soKhung(am ? am.giay : 8);
        const bd = tu;
        tu += dai;
        return (
          <Sequence key={s.so} from={bd} durationInFrames={dai}>
            {am && <Audio src={staticFile(`am-thanh/ch${String(tham.chuong).padStart(2, '0')}/${am.tep}`)} />}
            <Trang s={s} i={i} dai={dai} tham={tham} dinh_vi={vi[i].nhan} tien={vi[i].tien} tong={slides.length} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
