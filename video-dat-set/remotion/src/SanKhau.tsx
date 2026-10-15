import React, { useMemo } from 'react';
import { ThreeCanvas } from '@remotion/three';
import { useThree } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { MAU } from './mau';

/*
 * Sân khấu đất sét dựng một lần thành ẢNH TĨNH (npm run nen), rồi video dùng
 * ảnh ấy làm nền. Vì sao không dựng 3D từng khung: máy chủ không có GPU, kết
 * xuất WebGL bằng phần mềm mất ~0,6 giây/khung; hai video 25 phút là 45 000
 * khung, tức hơn 7 giờ. Nền tĩnh có thu phóng chậm nhìn vẫn sống, còn chuyển
 * động thật nằm ở nhân vật và các thẻ chữ phía trên, vốn vẽ bằng HTML rất nhanh.
 */

const W = 1920;
const H = 1080;

const DatSet: React.FC<{ mau: string }> = ({ mau }) => (
  <meshPhysicalMaterial color={mau} roughness={0.85} metalness={0} sheen={0.6} sheenRoughness={0.6} sheenColor="#fff1e0" />
);

/** Khối cầu nặn tay: tròn nhưng không tròn như máy tiện. */
const useCau = (r: number, hat: number, bien = 0.02) =>
  useMemo(() => {
    let g: THREE.BufferGeometry = new THREE.IcosahedronGeometry(r, 6);
    g.deleteAttribute('normal');
    g.deleteAttribute('uv');
    g = mergeVertices(g);
    const p = g.attributes.position;
    const v = new THREE.Vector3();
    for (let i = 0; i < p.count; i++) {
      v.fromBufferAttribute(p, i);
      const n = v.clone().normalize();
      const d = Math.sin(n.x * 4 + hat) * Math.sin(n.y * 5 + hat * 1.7) * Math.sin(n.z * 3 + hat * 0.6);
      v.addScaledVector(n, d * bien * r);
      p.setXYZ(i, v.x, v.y, v.z);
    }
    g.computeVertexNormals();
    return g;
  }, [r, hat, bien]);

const Cau: React.FC<{ r: number; mau: string; vi_tri: [number, number, number]; hat?: number; dep?: number }> = ({
  r, mau, vi_tri, hat = 1, dep = 1,
}) => {
  const g = useCau(r, hat);
  return (
    <mesh geometry={g} position={vi_tri} scale={[1, dep, 1]} castShadow receiveShadow>
      <DatSet mau={mau} />
    </mesh>
  );
};

/** Chậu cây: thân trụ + mấy chiếc lá cầu dẹt. */
const ChauCay: React.FC<{ x: number; z: number; to?: number }> = ({ x, z, to = 1 }) => (
  <group position={[x, 0, z]} scale={to}>
    <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
      <cylinderGeometry args={[0.42, 0.32, 0.9, 40]} />
      <DatSet mau={MAU.dat} />
    </mesh>
    {[[0, 1.35, 0, 0.55], [-0.35, 1.1, 0.1, 0.4], [0.38, 1.15, -0.05, 0.42], [0.1, 1.75, 0.05, 0.38]].map(
      ([a, b, c, r], i) => <Cau key={i} r={r} mau={i % 2 ? MAU.la : MAU.la_dam} vi_tri={[a, b, c]} hat={i + 3} dep={0.8} />,
    )}
  </group>
);

const ChongSach: React.FC<{ x: number; z: number }> = ({ x, z }) => (
  <group position={[x, 0, z]} rotation-y={0.3}>
    {[MAU.xanh, MAU.vang, MAU.giay, MAU.dat].map((m, i) => (
      <RoundedBox key={i} args={[1.3 - i * 0.08, 0.26, 0.95]} radius={0.06} smoothness={4}
        position={[i * 0.03, 0.13 + i * 0.27, 0]} rotation-y={(i % 2 ? 1 : -1) * 0.08} castShadow receiveShadow>
        <DatSet mau={m} />
      </RoundedBox>
    ))}
  </group>
);

const May: React.FC<{ vi_tri: V3; shot: V3 }> = ({ vi_tri, shot }) => {
  const cam = useThree((s) => s.camera);
  cam.position.set(...vi_tri);
  cam.lookAt(...shot);
  return null;
};

type V3 = [number, number, number];

/**
 * Hai kiểu nền: 'rong' (trang bìa, trang kết — sân khấu toàn cảnh) và
 * 'giang' (trang nội dung — phần phải để trống cho thẻ chữ, đạo cụ dồn về
 * hai mép để không tranh mắt với chữ).
 */
export const SanKhau: React.FC<{ kieu: 'rong' | 'giang' }> = ({ kieu }) => {
  const may: V3 = kieu === 'rong' ? [0, 4.0, 16] : [0, 3.6, 15];
  return (
    <div style={{ width: W, height: H, background: MAU.nen }}>
      <ThreeCanvas width={W} height={H} shadows camera={{ fov: 32, position: may }} gl={{ antialias: true }}>
        <May vi_tri={may} shot={[0, 2.4, 0]} />
        <color attach="background" args={[MAU.nen]} />
        <hemisphereLight args={['#fffaf2', '#e7c3a6', 1.35]} />
        <directionalLight position={[-7, 12, 9]} intensity={1.5} castShadow shadow-mapSize={[2048, 2048]}
          shadow-bias={-0.0004} shadow-camera-left={-16} shadow-camera-right={16}
          shadow-camera-top={16} shadow-camera-bottom={-16} />
        <directionalLight position={[8, 5, -4]} intensity={0.3} color="#ffd9c2" />
        {/* sàn */}
        <mesh rotation-x={-Math.PI / 2} receiveShadow>
          <planeGeometry args={[80, 80]} />
          <meshStandardMaterial color={MAU.san} roughness={1} />
        </mesh>
        {/* phông sau: một mặt phẳng lớn, cùng tông sàn nhưng sáng hơn để có đường chân tường */}
        <mesh position={[0, 10, -7]} receiveShadow>
          <planeGeometry args={[80, 24]} />
          <meshStandardMaterial color={MAU.vach} roughness={1} />
        </mesh>
        {/* vòm đất sét xanh sau lưng Hương AI: khung hình cho nhân vật, gợi cổng trường */}
        <mesh position={[-4.6, 0, -6.6]} castShadow receiveShadow>
          <torusGeometry args={[3.4, 0.42, 32, 96, Math.PI]} />
          <DatSet mau={MAU.xanh} />
        </mesh>
        <mesh position={[-4.6, 0, -6.75]} receiveShadow>
          <circleGeometry args={[3.0, 64, 0, Math.PI]} />
          <meshStandardMaterial color={MAU.giay} roughness={1} />
        </mesh>
        {/* bục tròn cho Hương AI đứng */}
        <mesh position={[-4.4, 0.17, 2.4]} castShadow receiveShadow>
          <cylinderGeometry args={[1.9, 2.0, 0.34, 64]} />
          <DatSet mau={MAU.xanh} />
        </mesh>
        <mesh position={[-4.4, 0.4, 2.4]} castShadow receiveShadow>
          <cylinderGeometry args={[1.65, 1.7, 0.14, 64]} />
          <DatSet mau={MAU.giay} />
        </mesh>
        <ChauCay x={-7.4} z={0.2} to={1.35} />
        <ChongSach x={-1.9} z={3.2} />
        <ChauCay x={7.6} z={-2} to={1.1} />
        {kieu === 'rong' && (
          <>
            <Cau r={0.9} mau={MAU.xanh} vi_tri={[3.2, 0.9, -1.5]} hat={9} />
            <Cau r={0.5} mau={MAU.dat} vi_tri={[4.6, 0.5, -0.4]} hat={11} />
          </>
        )}
      </ThreeCanvas>
    </div>
  );
};
