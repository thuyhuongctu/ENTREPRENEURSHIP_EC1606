import React from 'react';
import { ThreeCanvas } from '@remotion/three';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';
import { BIEU_TUONG, Be } from './BieuTuong';
import { DON_VI_PX, KHUNG, MAY_NHIN, MAY_VI_TRI, MinhHoa, viTri } from './boCuc';
import { MAU } from '../mau';

/*
 * Dựng MỘT lớp của hình minh họa thành ảnh nền trong suốt: lop = -1 là phần
 * nối (mũi tên, đường nối), lop = i là mục thứ i (bệ + biểu tượng + bóng của
 * nó). Tách lớp để trong video từng mục hiện ra đúng lúc lời đọc nhắc tới và
 * nảy lên khi đang được giảng — một ảnh gộp thì chỉ hiện được cả cụm một lúc.
 */

const MAU_BE = [MAU.xanh, MAU.vang, MAU.dat, MAU.xanh_dam, MAU.la];

// Máy quay trực giao của R3F đo khung bằng pixel rồi chia cho zoom, nên zoom =
// số pixel mỗi đơn vị — đúng như mayQuay() trong boCuc.ts dùng để đặt nhãn.
const NhinVao: React.FC = () => {
  const cam = useThree((s) => s.camera);
  cam.lookAt(...MAY_NHIN);
  cam.updateMatrixWorld();
  return null;
};

const MuiTen: React.FC<{ tu: THREE.Vector3; den: THREE.Vector3; cong?: number }> = ({ tu, den, cong = 0.6 }) => {
  const g = React.useMemo(() => {
    const giua = tu.clone().lerp(den, 0.5);
    giua.y += cong;
    const duong = new THREE.QuadraticBezierCurve3(tu, giua, den);
    return { ong: new THREE.TubeGeometry(duong, 48, 0.07, 12, false), dau: duong.getPoint(1), huong: duong.getTangent(1) };
  }, [tu, den, cong]);
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), g.huong.clone().normalize());
  return (
    <group>
      <mesh geometry={g.ong} castShadow><meshPhysicalMaterial color={MAU.mo} roughness={0.8} /></mesh>
      <mesh position={g.dau} quaternion={q} castShadow><coneGeometry args={[0.2, 0.38, 24]} /><meshPhysicalMaterial color={MAU.mo} roughness={0.8} /></mesh>
    </group>
  );
};

export const LopMinhHoa: React.FC<{ mh: MinhHoa; lop: number }> = ({ mh, lop }) => {
  const vt = viTri(mh);
  const v3 = (i: number, y = 0.5) => new THREE.Vector3(vt[i].p[0], y + vt[i].nang, vt[i].p[2]);
  return (
    <div style={{ width: KHUNG.rong, height: KHUNG.cao }}>
      <ThreeCanvas width={KHUNG.rong} height={KHUNG.cao} shadows gl={{ antialias: true, alpha: true, premultipliedAlpha: false }} orthographic camera={{ position: MAY_VI_TRI, zoom: DON_VI_PX, near: 0.1, far: 100 }}>
        <NhinVao />
        <hemisphereLight args={['#fffaf2', '#e7c3a6', 1.35]} />
        <directionalLight position={[-7, 12, 9]} intensity={1.5} castShadow shadow-mapSize={[2048, 2048]}
          shadow-camera-left={-12} shadow-camera-right={12} shadow-camera-top={8} shadow-camera-bottom={-8} shadow-bias={-0.0004} />
        <directionalLight position={[8, 5, -4]} intensity={0.3} color="#ffd9c2" />
        {/* mặt hứng bóng: trong suốt, chỉ giữ lại bóng đổ, để bóng rơi xuống sân khấu nền của video */}
        <mesh rotation-x={-Math.PI / 2} receiveShadow>
          <planeGeometry args={[60, 30]} />
          <shadowMaterial opacity={0.22} />
        </mesh>
        {lop === -1 && (mh.kieu === 'vong'
          ? mh.muc.map((_, i) => <MuiTen key={i} tu={v3(i, 0.45)} den={v3((i + 1) % mh.muc.length, 0.45)} cong={0.25} />)
          : mh.kieu === 'chuoi' || mh.kieu === 'duong'
            ? mh.muc.slice(1).map((_, i) => {
                // mũi tên thấp, nằm giữa hai bệ: cao quá thì đè lên biểu tượng
                const a = v3(i, 0.3); const b = v3(i + 1, 0.3);
                const d = b.clone().sub(a).normalize();
                const le = 0.95 * vt[i].to;
                return <MuiTen key={i} tu={a.clone().addScaledVector(d, le)} den={b.clone().addScaledVector(d, -le)} cong={0.15} />;
              })
            : mh.kieu === 'trung_tam'
              ? mh.muc.slice(1).map((_, i) => {
                  const a = v3(0, 0.35); const b = v3(i + 1, 0.35);
                  const giua = a.clone().lerp(b, 0.5);
                  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize());
                  return <mesh key={i} position={giua} quaternion={q} castShadow><cylinderGeometry args={[0.06, 0.06, a.distanceTo(b), 12]} /><meshPhysicalMaterial color={MAU.mo} roughness={0.8} /></mesh>;
                })
              : null)}
        {lop >= 0 && (() => {
          const v = vt[lop];
          const Bt = BIEU_TUONG[mh.muc[lop].bt];
          return (
            <group position={v.p} scale={v.to}>
              {v.nang > 0 && <mesh position={[0, v.nang / v.to / 2, 0]} castShadow receiveShadow>
                <cylinderGeometry args={[0.92, 0.95, v.nang / v.to, 56]} /><meshPhysicalMaterial color={MAU.giay} roughness={0.85} /></mesh>}
              <group position={[0, v.nang / v.to, 0]}>
                <Be c={MAU_BE[lop % MAU_BE.length]} />
                <group position={[0, 0.3, 0]}>{Bt ? <Bt /> : null}</group>
              </group>
            </group>
          );
        })()}
      </ThreeCanvas>
    </div>
  );
};
