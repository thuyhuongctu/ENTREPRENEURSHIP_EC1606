import React from 'react';
import { ThreeCanvas } from '@remotion/three';
import { BIEU_TUONG, Be } from './BieuTuong';

/* Bảng soát toàn bộ biểu tượng (Still "bang-bieu-tuong"): thêm biểu tượng mới
 * thì dựng bảng này ra nhìn trước, đừng đợi tới lúc dựng cả chương. */
const COT = 8;
export const BangBieuTuong: React.FC = () => {
  const ten = Object.keys(BIEU_TUONG);
  const hang = Math.ceil(ten.length / COT);
  return (
    <div style={{ width: 1920, height: 1080, background: '#f3e6d6', position: 'relative' }}>
      <ThreeCanvas width={1920} height={1080} orthographic camera={{ position: [0, 9, 10], zoom: 50 }} shadows>
        <hemisphereLight args={['#fffaf2', '#e7c3a6', 1.35]} />
        <directionalLight position={[-7, 12, 9]} intensity={1.5} castShadow />
        <group>
        {ten.map((t, i) => {
          const Bt = BIEU_TUONG[t];
          const x = (i % COT - (COT - 1) / 2) * 3.2;
          const z = (Math.floor(i / COT) - (hang - 1) / 2) * 3.9;
          return <group key={t} position={[x, 0, z]} scale={0.8}><Be c="#5aa65a" /><group position={[0, 0.3, 0]}><Bt /></group></group>;
        })}
        </group>
      </ThreeCanvas>
      {/* tên biểu tượng đọc theo thứ tự trong BIEU_TUONG, trái sang phải, trên xuống */}
      <div style={{ position: 'absolute', left: 20, top: 10, right: 20, font: '500 15px Inter', color: '#76695e' }}>{ten.join(' · ')}</div>
    </div>
  );
};
