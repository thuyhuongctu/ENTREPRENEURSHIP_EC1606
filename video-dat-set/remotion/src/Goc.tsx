import React from 'react';
import { CalculateMetadataFunction, Composition, Still, staticFile } from 'remotion';
import { Am, BaiGiang, FPS, Slide, ThamSo, soKhung } from './BaiGiang';
import { SanKhau } from './SanKhau';
import ch01 from '../../du-lieu/ch01.json';

const CHUONG: Record<number, { slides: Slide[] }> = { 1: ch01 as { slides: Slide[] } };

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
    {[1, 2].map((v) => (
      <Composition
        key={v}
        id={`EC1606-SX0${v}`}
        component={BaiGiang}
        fps={FPS}
        width={1920}
        height={1080}
        durationInFrames={FPS * 60}
        defaultProps={{ chuong: 1, video: v, slides: CHUONG[1].slides, am: [] }}
        calculateMetadata={doDai}
      />
    ))}
  </>
);
