import React from 'react';
import { CalculateMetadataFunction, Composition, Still, staticFile } from 'remotion';
import { Am, BaiGiang, FPS, Slide, ThamSo, soKhung } from './BaiGiang';
import { SanKhau } from './SanKhau';
import ch01 from '../../du-lieu/ch01.json';
import ch02 from '../../du-lieu/ch02.json';
import ch03 from '../../du-lieu/ch03.json';
import ch04 from '../../du-lieu/ch04.json';
import ch05 from '../../du-lieu/ch05.json';
import { LopMinhHoa } from './minh-hoa/MinhHoa';
import { KHUNG } from './minh-hoa/boCuc';
import { MINH_HOA } from './duLieu';
import { BangBieuTuong } from './minh-hoa/BangBieuTuong';

const CHUONG: Record<number, { slides: Slide[] }> = Object.fromEntries(
  [ch01, ch02, ch03, ch04, ch05].map((c) => [c.chuong, c as { slides: Slide[] }]),
);

// Mỗi chương hai video. Số thứ tự SX chạy liền cả học phần (Mẫu HLS-VLU-08,
// mục 3b): Chương 1 là SX01–SX02, Chương 2 là SX03–SX04... Đánh lại từ 01 ở
// mỗi chương thì hai chương sinh ra hai tệp trùng tên.
const VIDEO = [1, 2, 3, 4, 5].flatMap((chuong) => [1, 2].map((video) => ({
  chuong, video, ma: `SX${String((chuong - 1) * 2 + video).padStart(2, '0')}`,
})));

// Thời lượng từng slide lấy từ CHÍNH bản đọc (so_do.json do tools/doc_loi.py
// ghi), không ước theo số chữ: video phải khớp lời từng khung.
const doDai: CalculateMetadataFunction<ThamSo> = async ({ props }) => {
  const r = await fetch(staticFile(`am-thanh/ch${String(props.chuong).padStart(2, '0')}/so_do.json`));
  const am: Am[] = (await r.json()).slides.filter((a: Am) => a.video === props.video);
  const so_slide = props.slides.filter((s) => s.video === props.video).length;
  // Bản nháp (--props '{"nhap":true}') cho xem thử khi lời đọc chưa đủ; bản
  // thật thì thiếu một slide cũng dừng, để không lọt slide câm vào video.
  if (am.length !== so_slide && !props.nhap) throw new Error(`video ${props.video}: ${am.length}/${so_slide} slide có lời đọc`);
  const tong = props.slides.filter((s) => s.video === props.video)
    .reduce((t, s) => t + soKhung(am.find((a) => a.so === s.so)?.giay ?? 8), 0);
  return { durationInFrames: tong, props: { ...props, am } };
};

export const Goc: React.FC = () => (
  <>
    <Still id="nen-rong" component={() => <SanKhau kieu="rong" />} width={1920} height={1080} />
    <Still id="nen-giang" component={() => <SanKhau kieu="giang" />} width={1920} height={1080} />
    <Still id="bang-bieu-tuong" component={BangBieuTuong} width={1920} height={1080} />
    <Still
      id="minh-hoa"
      component={({ chuong, so, lop }: { chuong: number; so: number; lop: number }) => (
        <LopMinhHoa mh={MINH_HOA[chuong][String(so)]} lop={lop} />
      )}
      width={KHUNG.rong}
      height={KHUNG.cao}
      defaultProps={{ chuong: 1, so: 6, lop: 0 }}
    />
    {VIDEO.map(({ chuong, video, ma }) => (
      <Composition
        key={ma}
        id={`EC1606-${ma}`}
        component={BaiGiang}
        fps={FPS}
        width={1920}
        height={1080}
        durationInFrames={FPS * 60}
        defaultProps={{ chuong, video, slides: CHUONG[chuong].slides, am: [] }}
        calculateMetadata={doDai}
      />
    ))}
  </>
);
