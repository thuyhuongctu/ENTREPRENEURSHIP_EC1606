import React, { useMemo } from 'react';
import { RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { MAU } from '../mau';

/*
 * Thư viện biểu tượng nặn đất sét cho hình minh họa slide. Mỗi biểu tượng
 * đứng trên mặt đất (y >= 0), cao chừng 1,2–1,8 đơn vị, tâm ở gốc tọa độ, để
 * bố cục chỉ việc đặt vào vị trí. Dựng từ khối cơ bản cho nhẹ và đồng bộ chất
 * liệu; thêm biểu tượng mới thì thêm vào BIEU_TUONG ở cuối tệp.
 */

const M: React.FC<{ c: string }> = ({ c }) => (
  <meshPhysicalMaterial color={c} roughness={0.82} metalness={0} sheen={0.6} sheenRoughness={0.6} sheenColor="#fff1e0" />
);

type P = { position?: [number, number, number]; rotation?: [number, number, number]; scale?: number | [number, number, number] };

const useCau = (r: number, hat: number, bien = 0.03) =>
  useMemo(() => {
    let g: THREE.BufferGeometry = new THREE.IcosahedronGeometry(r, 5);
    g.deleteAttribute('normal');
    g.deleteAttribute('uv');
    g = mergeVertices(g);
    const p = g.attributes.position;
    const v = new THREE.Vector3();
    for (let i = 0; i < p.count; i++) {
      v.fromBufferAttribute(p, i);
      const n = v.clone().normalize();
      v.addScaledVector(n, Math.sin(n.x * 4 + hat) * Math.sin(n.y * 5 + hat) * Math.sin(n.z * 3 + hat) * bien * r);
      p.setXYZ(i, v.x, v.y, v.z);
    }
    g.computeVertexNormals();
    return g;
  }, [r, hat, bien]);

const Cau: React.FC<P & { r: number; c: string; hat?: number }> = ({ r, c, hat = 1, ...p }) => {
  const g = useCau(r, hat);
  return <mesh geometry={g} {...p} castShadow receiveShadow><M c={c} /></mesh>;
};
const Tru: React.FC<P & { r: number; r2?: number; h: number; c: string; s?: number }> = ({ r, r2, h, c, s = 40, ...p }) => (
  <mesh {...p} castShadow receiveShadow><cylinderGeometry args={[r, r2 ?? r, h, s]} /><M c={c} /></mesh>
);
const Hop: React.FC<P & { w: number; h: number; d: number; c: string; bo?: number }> = ({ w, h, d, c, bo = 0.08, ...p }) => (
  <RoundedBox args={[w, h, d]} radius={Math.min(bo, w / 2.1, h / 2.1, d / 2.1)} smoothness={4} {...p} castShadow receiveShadow><M c={c} /></RoundedBox>
);
const Vong: React.FC<P & { R: number; r: number; c: string; cung?: number }> = ({ R, r, c, cung = Math.PI * 2, ...p }) => (
  <mesh {...p} castShadow receiveShadow><torusGeometry args={[R, r, 20, 64, cung]} /><M c={c} /></mesh>
);

/* ---------- các biểu tượng ---------- */

const BongDen = () => (
  <group>
    <Tru r={0.22} r2={0.26} h={0.36} c="#9a948a" position={[0, 0.18, 0]} />
    <Cau r={0.55} c={MAU.vang} position={[0, 0.85, 0]} hat={2} />
    <Tru r={0.05} h={0.5} c="#fff3c4" position={[0, 0.8, 0]} />
  </group>
);

const TenLua = () => (
  <group>
    <Tru r={0.32} h={1.0} c={MAU.giay} position={[0, 0.75, 0]} />
    <mesh position={[0, 1.45, 0]} castShadow><coneGeometry args={[0.32, 0.5, 40]} /><M c={MAU.dat} /></mesh>
    <Cau r={0.13} c={MAU.xanh} position={[0, 0.95, 0.3]} />
    {[0, 1, 2].map((i) => (
      <mesh key={i} position={[Math.sin((i * 2 * Math.PI) / 3) * 0.36, 0.38, Math.cos((i * 2 * Math.PI) / 3) * 0.36]} rotation={[0, (i * 2 * Math.PI) / 3, 0]} castShadow>
        <boxGeometry args={[0.08, 0.45, 0.3]} /><M c={MAU.dat} />
      </mesh>
    ))}
    <Cau r={0.2} c={MAU.vang} position={[0, 0.16, 0]} hat={4} />
  </group>
);

const XucXac = () => (
  <group rotation={[0.15, 0.6, 0]}>
    <Hop w={1} h={1} d={1} c={MAU.giay} bo={0.18} position={[0, 0.55, 0]} />
    {[[0, 0.55, 0.51], [0.25, 0.8, 0.51], [-0.25, 0.3, 0.51], [0.51, 0.55, 0], [0.51, 0.8, 0.25]].map((v, i) => (
      <Cau key={i} r={0.08} c={MAU.muc} position={v as [number, number, number]} />
    ))}
  </group>
);

const BanhRang = () => (
  <group position={[0, 0.85, 0]} rotation={[0, 0.3, 0]}>
    <Tru r={0.55} h={0.3} c={MAU.xanh} rotation={[Math.PI / 2, 0, 0]} />
    {Array.from({ length: 8 }).map((_, i) => {
      const a = (i / 8) * Math.PI * 2;
      return <Hop key={i} w={0.24} h={0.24} d={0.3} c={MAU.xanh} position={[Math.cos(a) * 0.62, Math.sin(a) * 0.62, 0]} rotation={[0, 0, a]} />;
    })}
    <Tru r={0.18} h={0.34} c={MAU.giay} rotation={[Math.PI / 2, 0, 0]} />
  </group>
);

const Loa = () => (
  <group position={[0, 0.75, 0]} rotation={[0, 0, 0.35]}>
    <mesh rotation={[0, 0, -Math.PI / 2]} position={[0.2, 0, 0]} castShadow><coneGeometry args={[0.55, 0.9, 40, 1, true]} /><meshPhysicalMaterial color={MAU.dat} roughness={0.8} side={THREE.DoubleSide} /></mesh>
    <Tru r={0.2} h={0.4} c={MAU.giay} rotation={[0, 0, Math.PI / 2]} position={[-0.42, 0, 0]} />
    <Hop w={0.16} h={0.5} d={0.16} c={MAU.muc} position={[-0.42, -0.35, 0]} />
  </group>
);

const MoHinh = () => (
  <group>
    {[[0, 1.3, 0], [-0.6, 0.45, 0.1], [0.6, 0.45, 0.1], [0, 0.6, -0.4]].map((v, i) => (
      <Cau key={i} r={0.24} c={[MAU.vang, MAU.xanh, MAU.dat, MAU.xanh_dam][i]} position={v as [number, number, number]} hat={i} />
    ))}
    {[[[0, 1.3, 0], [-0.6, 0.45, 0.1]], [[0, 1.3, 0], [0.6, 0.45, 0.1]], [[-0.6, 0.45, 0.1], [0.6, 0.45, 0.1]], [[0, 1.3, 0], [0, 0.6, -0.4]]].map(([a, b], i) => {
      const va = new THREE.Vector3(...(a as [number, number, number]));
      const vb = new THREE.Vector3(...(b as [number, number, number]));
      const giua = va.clone().add(vb).multiplyScalar(0.5);
      const dai = va.distanceTo(vb);
      const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), vb.clone().sub(va).normalize());
      return <mesh key={i} position={giua} quaternion={q} castShadow><cylinderGeometry args={[0.06, 0.06, dai, 12]} /><M c={MAU.giay} /></mesh>;
    })}
  </group>
);

const DienThoai = () => (
  <group rotation={[0, 0.35, 0]}>
    <Hop w={0.78} h={1.4} d={0.16} c={MAU.muc} bo={0.12} position={[0, 0.75, 0]} />
    <Hop w={0.64} h={1.12} d={0.04} c={MAU.xanh} bo={0.06} position={[0, 0.8, 0.08]} />
    <Cau r={0.07} c={MAU.giay} position={[0, 0.18, 0.09]} />
    <Hop w={0.4} h={0.12} d={0.04} c={MAU.giay} bo={0.04} position={[0, 1.0, 0.11]} />
    <Hop w={0.4} h={0.12} d={0.04} c={MAU.vang} bo={0.04} position={[0, 0.8, 0.11]} />
  </group>
);

const Nguoi: React.FC<{ c?: string }> = ({ c = MAU.dat }) => (
  <group>
    <mesh position={[0, 0.5, 0]} castShadow><capsuleGeometry args={[0.32, 0.45, 8, 24]} /><M c={c} /></mesh>
    <Cau r={0.3} c="#f1c9a5" position={[0, 1.25, 0]} hat={3} />
    <Cau r={0.31} c="#5b3a29" position={[0, 1.36, -0.05]} hat={6} />
  </group>
);

const Nhom = () => (
  <group>
    <group position={[-0.62, 0, -0.1]} scale={0.8}><Nguoi c={MAU.xanh} /></group>
    <group position={[0.62, 0, -0.1]} scale={0.8}><Nguoi c={MAU.vang} /></group>
    <group position={[0, 0, 0.25]}><Nguoi c={MAU.dat} /></group>
  </group>
);

const Khoai = () => (
  <group position={[0, 0.42, 0]} rotation={[0, 0.4, 0.25]}>
    <Cau r={0.5} c="#8e4f7d" hat={7} scale={[1.6, 0.8, 0.85]} />
    <Cau r={0.28} c="#8e4f7d" hat={9} position={[-0.55, 0.2, 0.25]} scale={[1.4, 0.8, 0.8]} />
    <Tru r={0.03} h={0.3} c={MAU.la_dam} position={[0.8, 0.05, 0]} rotation={[0, 0, Math.PI / 2]} />
  </group>
);

const HopBanh = () => (
  <group rotation={[0, 0.5, 0]}>
    <Hop w={1.1} h={0.55} d={0.8} c={MAU.vang} bo={0.1} position={[0, 0.3, 0]} />
    <Hop w={1.16} h={0.12} d={0.86} c={MAU.dat} bo={0.05} position={[0, 0.62, 0]} />
    <Hop w={0.14} h={0.13} d={0.88} c={MAU.giay} bo={0.03} position={[0, 0.62, 0]} />
    <Cau r={0.18} c={MAU.giay} position={[0, 0.78, 0]} hat={2} scale={[1.3, 0.7, 1]} />
  </group>
);

const DongXu = () => (
  <group>
    {[0, 1, 2, 3].map((i) => (
      <Tru key={i} r={0.42} h={0.16} c={MAU.vang} position={[(i % 2) * 0.05, 0.08 + i * 0.17, 0]} />
    ))}
    <group position={[0.75, 0.42, 0.1]} rotation={[0, 0, Math.PI / 2 - 0.25]}>
      <Tru r={0.38} h={0.15} c={MAU.vang} />
      <Tru r={0.2} h={0.17} c="#c99a24" />
    </group>
  </group>
);

const KinhLup = () => (
  <group position={[0, 0.9, 0]} rotation={[0.2, 0.3, 0.5]}>
    <Vong R={0.42} r={0.09} c={MAU.vang} />
    <mesh castShadow><circleGeometry args={[0.4, 40]} /><meshPhysicalMaterial color="#dff0f2" roughness={0.1} transparent opacity={0.55} side={THREE.DoubleSide} /></mesh>
    <Tru r={0.09} h={0.75} c={MAU.dat} position={[0, -0.82, 0]} />
  </group>
);

const TaiLieu = () => (
  <group rotation={[-0.25, 0.35, 0]}>
    <Hop w={0.95} h={1.25} d={0.08} c={MAU.giay} bo={0.04} position={[0, 0.7, 0]} />
    {[0, 1, 2, 3].map((i) => (
      <Hop key={i} w={i === 0 ? 0.55 : 0.7} h={0.08} d={0.03} c={i === 0 ? MAU.xanh : '#c9bba8'} bo={0.03} position={[-0.0, 1.1 - i * 0.22, 0.05]} />
    ))}
  </group>
);

const BieuDo = () => (
  <group rotation={[0, 0.3, 0]}>
    <Hop w={1.4} h={0.1} d={0.7} c={MAU.giay} position={[0, 0.05, 0]} />
    {[0.45, 0.75, 1.15].map((h, i) => (
      <Hop key={i} w={0.3} h={h} d={0.3} c={[MAU.xanh, MAU.vang, MAU.dat][i]} position={[-0.42 + i * 0.42, 0.1 + h / 2, 0]} />
    ))}
  </group>
);

const MucTieu = () => (
  <group position={[0, 0.8, 0]} rotation={[0, 0.3, 0]}>
    {[0.62, 0.44, 0.24].map((r, i) => (
      <Tru key={i} r={r} h={0.1 + i * 0.04} c={i % 2 ? MAU.giay : MAU.dat} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, i * 0.03]} />
    ))}
    <Tru r={0.04} h={0.9} c={MAU.muc} rotation={[Math.PI / 2 - 0.3, 0, 0]} position={[0.05, 0.15, 0.4]} />
    <Tru r={0.05} h={0.8} c="#9a7a5a" position={[0, -0.45, -0.1]} />
  </group>
);

const La = () => (
  <group position={[0, 0.6, 0]}>
    <Cau r={0.55} c={MAU.la} hat={4} scale={[0.55, 1.1, 0.18]} rotation={[0, 0, -0.5]} position={[0.2, 0.15, 0]} />
    <Cau r={0.45} c={MAU.la_dam} hat={5} scale={[0.55, 1.1, 0.18]} rotation={[0, 0.5, 0.6]} position={[-0.25, 0.05, 0.05]} />
    <Tru r={0.04} h={0.7} c={MAU.la_dam} position={[0, -0.3, 0]} />
  </group>
);

const Cay = () => (
  <group>
    <Tru r={0.12} r2={0.16} h={0.7} c="#9a6a45" position={[0, 0.35, 0]} />
    <Cau r={0.5} c={MAU.la} position={[0, 1.0, 0]} hat={1} />
    <Cau r={0.38} c={MAU.la_dam} position={[-0.35, 0.85, 0.15]} hat={2} />
    <Cau r={0.36} c={MAU.la_dam} position={[0.36, 0.88, 0.1]} hat={3} />
  </group>
);

const TraiTim = () => (
  <group position={[0, 0.75, 0]}>
    <Cau r={0.34} c="#d9534f" position={[-0.22, 0.18, 0]} hat={2} />
    <Cau r={0.34} c="#d9534f" position={[0.22, 0.18, 0]} hat={3} />
    <mesh position={[0, -0.18, 0]} rotation={[0, 0, Math.PI]} castShadow><coneGeometry args={[0.52, 0.7, 40]} /><M c="#d9534f" /></mesh>
  </group>
);

const BinhGom = () => {
  const g = useMemo(() => {
    const pts = [[0, 0], [0.3, 0], [0.45, 0.2], [0.55, 0.55], [0.45, 0.9], [0.25, 1.15], [0.22, 1.35], [0.32, 1.45]].map(
      ([x, y]) => new THREE.Vector2(x, y));
    return new THREE.LatheGeometry(pts, 48);
  }, []);
  return (
    <group>
      <mesh geometry={g} castShadow receiveShadow><meshPhysicalMaterial color="#b4532f" roughness={0.85} side={THREE.DoubleSide} /></mesh>
      <Vong R={0.5} r={0.04} c={MAU.giay} rotation={[Math.PI / 2, 0, 0]} position={[0, 0.6, 0]} />
    </group>
  );
};

const Khien = () => (
  <group position={[0, 0.8, 0]} rotation={[0, 0.3, 0]}>
    <Cau r={0.6} c={MAU.xanh} hat={1} scale={[1, 1.15, 0.3]} />
    <Hop w={0.12} h={0.6} d={0.1} c={MAU.giay} position={[0, 0.02, 0.17]} />
    <Hop w={0.45} h={0.12} d={0.1} c={MAU.giay} position={[0, 0.12, 0.17]} />
  </group>
);

const MuTotNghiep = () => (
  <group position={[0, 0.5, 0]} rotation={[0, 0.5, 0]}>
    <Tru r={0.38} h={0.4} c={MAU.muc} position={[0, 0, 0]} />
    <Hop w={1.2} h={0.08} d={1.2} c={MAU.muc} bo={0.03} position={[0, 0.26, 0]} />
    <Cau r={0.07} c={MAU.vang} position={[0, 0.33, 0]} />
    <Tru r={0.025} h={0.5} c={MAU.vang} position={[0.5, 0.05, 0.3]} />
  </group>
);

const Nha = () => (
  <group rotation={[0, 0.4, 0]}>
    <Hop w={1.1} h={0.75} d={0.9} c={MAU.giay} position={[0, 0.38, 0]} />
    <mesh position={[0, 1.0, 0]} rotation={[0, Math.PI / 4, 0]} castShadow><coneGeometry args={[0.85, 0.55, 4]} /><M c={MAU.dat} /></mesh>
    <Hop w={0.26} h={0.42} d={0.04} c={MAU.xanh} position={[0, 0.22, 0.46]} />
  </group>
);

const BanDo = () => (
  <group rotation={[-0.9, 0, 0.1]} position={[0, 0.25, 0]}>
    {[0, 1, 2].map((i) => (
      <Hop key={i} w={0.5} h={1.2} d={0.05} c={i === 1 ? '#e9dcc7' : MAU.giay} bo={0.02} position={[-0.48 + i * 0.48, 0.4, i === 1 ? 0.06 : 0]} rotation={[0, i === 1 ? 0 : (i - 1) * -0.3, 0]} />
    ))}
    <Cau r={0.12} c={MAU.dat} position={[0.35, 0.75, 0.12]} />
    <Cau r={0.08} c={MAU.xanh} position={[-0.4, 0.1, 0.12]} />
  </group>
);

const DauHoi = () => (
  <group position={[0, 0.25, 0]}>
    <Vong R={0.35} r={0.12} c={MAU.vang} cung={Math.PI * 1.3} rotation={[0, 0, -0.65]} position={[0, 1.05, 0]} />
    <Tru r={0.12} h={0.3} c={MAU.vang} position={[0.05, 0.55, 0]} />
    <Cau r={0.14} c={MAU.vang} position={[0.05, 0.1, 0]} />
  </group>
);

const Tick = () => (
  <group position={[0, 0.75, 0]} rotation={[0, 0.2, 0]}>
    <Cau r={0.62} c={MAU.xanh} hat={2} scale={[1, 1, 0.45]} />
    <Hop w={0.18} h={0.4} d={0.14} c={MAU.giay} rotation={[0, 0, 0.75]} position={[-0.16, -0.05, 0.26]} />
    <Hop w={0.18} h={0.7} d={0.14} c={MAU.giay} rotation={[0, 0, -0.6]} position={[0.14, 0.08, 0.26]} />
  </group>
);

const Can = () => (
  <group rotation={[0, 0.15, 0]}>
    <Tru r={0.4} r2={0.5} h={0.14} c={MAU.muc} position={[0, 0.07, 0]} />
    <Tru r={0.06} h={1.1} c={MAU.muc} position={[0, 0.65, 0]} />
    <Hop w={1.6} h={0.08} d={0.1} c={MAU.muc} position={[0, 1.2, 0]} rotation={[0, 0, 0.06]} />
    {[-0.72, 0.72].map((x, i) => (
      <group key={i} position={[x, 0.75 + (i ? -0.05 : 0.05), 0]}>
        <Tru r={0.32} r2={0.22} h={0.1} c={MAU.vang} />
        <Cau r={0.18} c={i ? MAU.xanh : MAU.dat} position={[0, 0.17, 0]} hat={i + 2} />
      </group>
    ))}
  </group>
);

const NgoiSao = () => {
  const g = useMemo(() => {
    const s = new THREE.Shape();
    for (let i = 0; i < 10; i++) {
      const r = i % 2 ? 0.28 : 0.62;
      const a = (i / 10) * Math.PI * 2 + Math.PI / 2;
      if (i === 0) s.moveTo(Math.cos(a) * r, Math.sin(a) * r);
      else s.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    const geo = new THREE.ExtrudeGeometry(s, { depth: 0.22, bevelEnabled: true, bevelThickness: 0.08, bevelSize: 0.06, bevelSegments: 4 });
    geo.center();
    return geo;
  }, []);
  return <mesh geometry={g} position={[0, 0.85, 0]} rotation={[0, 0.35, 0]} castShadow><M c={MAU.vang} /></mesh>;
};

const DamMay = () => (
  <group position={[0, 0.75, 0]}>
    <Cau r={0.42} c="#e8eef0" position={[0, 0.15, 0]} hat={1} />
    <Cau r={0.32} c="#e8eef0" position={[-0.45, -0.02, 0]} hat={2} />
    <Cau r={0.34} c="#e8eef0" position={[0.45, 0, 0]} hat={3} />
    <Tru r={0.05} h={0.6} c={MAU.xanh} position={[0, -0.55, 0]} />
  </group>
);

const But = () => (
  <group position={[0, 0.7, 0]} rotation={[0, 0, -0.6]}>
    <Tru r={0.13} h={1.1} c={MAU.vang} s={6} />
    <mesh position={[0, -0.68, 0]} rotation={[Math.PI, 0, 0]} castShadow><coneGeometry args={[0.13, 0.26, 6]} /><M c="#f1c9a5" /></mesh>
    <Tru r={0.13} h={0.16} c={MAU.dat} position={[0, 0.62, 0]} />
  </group>
);

const Sach = () => (
  <group rotation={[0, 0.4, 0]}>
    {[MAU.xanh, MAU.dat, MAU.vang].map((c, i) => (
      <Hop key={i} w={1.05 - i * 0.07} h={0.24} d={0.75} c={c} bo={0.05} position={[i * 0.03, 0.12 + i * 0.25, 0]} rotation={[0, (i - 1) * 0.12, 0]} />
    ))}
  </group>
);

/* ---------- thêm cho Chương 2–5 (vốn, mô hình, marketing) ---------- */

const TuiTien = () => (
  <group>
    <Cau r={0.55} c="#c9a36b" position={[0, 0.55, 0]} hat={3} scale={[1, 0.95, 0.95]} />
    <Tru r={0.18} r2={0.3} h={0.28} c="#c9a36b" position={[0, 1.12, 0]} />
    <Vong R={0.2} r={0.05} c={MAU.dat} rotation={[Math.PI / 2, 0, 0]} position={[0, 1.04, 0]} />
    <Cau r={0.13} c="#c9a36b" position={[-0.12, 1.32, 0]} hat={5} />
    <Cau r={0.13} c="#c9a36b" position={[0.13, 1.33, 0.02]} hat={6} />
    <Tru r={0.2} h={0.05} c={MAU.vang} rotation={[Math.PI / 2, 0, 0]} position={[0, 0.58, 0.52]} />
  </group>
);

const HeoDat = () => (
  <group rotation={[0, 0.5, 0]}>
    <Cau r={0.5} c="#e59aa3" position={[0, 0.62, 0]} hat={2} scale={[1.3, 1, 1]} />
    <Tru r={0.16} r2={0.18} h={0.18} c="#d98490" rotation={[0, 0, Math.PI / 2]} position={[0.7, 0.62, 0]} />
    {[[-0.35, 0.28], [0.35, 0.28], [-0.35, -0.28], [0.35, -0.28]].map(([x, z], i) => (
      <Tru key={i} r={0.11} h={0.25} c="#d98490" position={[x, 0.13, z]} />
    ))}
    <mesh position={[0.35, 1.08, 0.2]} castShadow><coneGeometry args={[0.12, 0.22, 16]} /><M c="#d98490" /></mesh>
    <mesh position={[0.35, 1.08, -0.2]} castShadow><coneGeometry args={[0.12, 0.22, 16]} /><M c="#d98490" /></mesh>
    <Hop w={0.32} h={0.04} d={0.06} c={MAU.muc} position={[-0.05, 1.11, 0]} />
    <Tru r={0.17} h={0.06} c={MAU.vang} position={[-0.05, 1.32, 0]} rotation={[Math.PI / 2, 0, 0]} />
  </group>
);

const BatTay = () => (
  <group position={[0, 0.75, 0]} rotation={[0, 0.25, 0]}>
    <Tru r={0.2} h={0.9} c={MAU.xanh} rotation={[0, 0, Math.PI / 2 - 0.35]} position={[-0.62, -0.18, 0]} />
    <Tru r={0.2} h={0.9} c={MAU.dat} rotation={[0, 0, -(Math.PI / 2 - 0.35)]} position={[0.62, -0.18, 0]} />
    <Cau r={0.3} c="#f1c9a5" position={[-0.12, 0.02, 0.02]} hat={2} scale={[1.3, 0.85, 0.9]} />
    <Cau r={0.3} c="#e6b48e" position={[0.12, 0.06, -0.04]} hat={4} scale={[1.3, 0.85, 0.9]} />
    <Cau r={0.1} c="#f1c9a5" position={[0.05, 0.25, 0.18]} hat={1} scale={[1.6, 0.8, 0.8]} />
  </group>
);

const XeTai = () => (
  <group rotation={[0, 0.5, 0]}>
    <Hop w={1.05} h={0.7} d={0.7} c={MAU.giay} position={[-0.2, 0.55, 0]} />
    <Hop w={0.45} h={0.5} d={0.66} c={MAU.xanh} position={[0.6, 0.45, 0]} />
    <Hop w={0.06} h={0.22} d={0.5} c="#dff0f2" position={[0.83, 0.55, 0]} />
    <Hop w={0.5} h={0.08} d={0.02} c={MAU.dat} position={[-0.2, 0.62, 0.36]} />
    {[[-0.5, 0.36], [0.55, 0.36], [-0.5, -0.36], [0.55, -0.36]].map(([x, z], i) => (
      <Tru key={i} r={0.17} h={0.1} c={MAU.muc} rotation={[Math.PI / 2, 0, 0]} position={[x, 0.17, z]} />
    ))}
  </group>
);

const DongHoCat = () => (
  <group rotation={[0, 0.3, 0.12]}>
    <Tru r={0.5} h={0.1} c="#9a6a45" position={[0, 0.05, 0]} />
    <Tru r={0.5} h={0.1} c="#9a6a45" position={[0, 1.55, 0]} />
    <mesh position={[0, 1.1, 0]} castShadow><coneGeometry args={[0.36, 0.8, 32]} /><meshPhysicalMaterial color="#dff0f2" roughness={0.1} transparent opacity={0.5} /></mesh>
    <mesh position={[0, 0.5, 0]} rotation={[Math.PI, 0, 0]} castShadow><coneGeometry args={[0.36, 0.8, 32]} /><meshPhysicalMaterial color="#dff0f2" roughness={0.1} transparent opacity={0.5} /></mesh>
    <mesh position={[0, 1.22, 0]} rotation={[Math.PI, 0, 0]}><coneGeometry args={[0.2, 0.35, 24]} /><M c={MAU.vang} /></mesh>
    <mesh position={[0, 0.3, 0]}><coneGeometry args={[0.3, 0.35, 24]} /><M c={MAU.vang} /></mesh>
    {[-0.42, 0.42].map((x, i) => <Tru key={i} r={0.05} h={1.5} c="#9a6a45" position={[x, 0.8, 0]} />)}
  </group>
);

// Ngọn lửa tiện tròn (lathe) theo biên dạng giọt nước, đầu nhọn: dựng từ cầu
// + nón thì đọc ra quả trứng, không ai nhận ra là lửa.
const useLua = (cao: number, rong: number) =>
  useMemo(() => {
    const pts: THREE.Vector2[] = [];
    for (let i = 0; i <= 24; i++) {
      const t = i / 24;
      pts.push(new THREE.Vector2(rong * Math.sin(Math.PI * Math.pow(t, 0.6)) * (1 - t * 0.35), t * cao));
    }
    return new THREE.LatheGeometry(pts, 40);
  }, [cao, rong]);
const NgonLua = () => {
  const ngoai = useLua(1.5, 0.5);
  const trong = useLua(0.95, 0.3);
  return (
    <group>
      {[0, 1, 2].map((i) => (
        <Tru key={i} r={0.07} h={0.9} c="#9a6a45" rotation={[Math.PI / 2, (i * Math.PI) / 3, 0]} position={[0, 0.08, 0]} />
      ))}
      <mesh geometry={ngoai} position={[0, 0.1, 0]} castShadow><M c={MAU.dat} /></mesh>
      <mesh geometry={trong} position={[0, 0.12, 0.2]} castShadow><M c={MAU.vang} /></mesh>
    </group>
  );
};

const MayTinh = () => (
  <group rotation={[0, 0.35, 0]}>
    <Hop w={1.3} h={0.08} d={0.85} c="#b9b2a8" position={[0, 0.06, 0.15]} />
    <group position={[0, 0.1, -0.27]} rotation={[-0.25, 0, 0]}>
      <Hop w={1.3} h={0.85} d={0.06} c="#b9b2a8" position={[0, 0.43, 0]} />
      <Hop w={1.14} h={0.7} d={0.02} c={MAU.giay} bo={0.02} position={[0, 0.45, 0.035]} />
      {[0, 1, 2].map((i) => (
        <Hop key={i} w={0.16} h={0.12 + i * 0.12} d={0.02} c={[MAU.xanh, MAU.vang, MAU.dat][i]} bo={0.01} position={[-0.25 + i * 0.25, 0.2 + (0.12 + i * 0.12) / 2, 0.05]} />
      ))}
    </group>
    <Hop w={1.0} h={0.02} d={0.4} c="#8f887e" bo={0.01} position={[0, 0.11, 0.2]} />
  </group>
);

const CuaHang = () => (
  <group rotation={[0, 0.4, 0]}>
    <Hop w={1.2} h={0.5} d={0.6} c="#c9a36b" position={[0, 0.25, 0]} />
    {[-0.55, 0.55].map((x, i) => <Tru key={i} r={0.05} h={1.0} c="#9a6a45" position={[x, 0.9, -0.2]} />)}
    {[0, 1, 2, 3].map((i) => (
      <Hop key={i} w={0.32} h={0.08} d={0.75} c={i % 2 ? MAU.giay : MAU.dat} bo={0.03} position={[-0.45 + i * 0.3, 1.38, 0.02]} rotation={[0.35, 0, 0]} />
    ))}
    <Cau r={0.14} c={MAU.vang} position={[-0.3, 0.6, 0.05]} hat={1} />
    <Cau r={0.13} c="#8e4f7d" position={[0, 0.6, 0.1]} hat={2} scale={[1.4, 0.8, 0.8]} />
    <Cau r={0.13} c={MAU.la} position={[0.3, 0.6, 0.05]} hat={3} />
  </group>
);

const ConDau = () => (
  <group rotation={[0, 0.3, 0]}>
    <Hop w={1.1} h={0.05} d={0.8} c={MAU.giay} bo={0.02} position={[0.2, 0.03, 0.1]} />
    <Tru r={0.22} h={0.05} c="#d9534f" position={[0.55, 0.07, 0.25]} />
    <Tru r={0.32} h={0.18} c="#d9534f" position={[-0.2, 0.15, 0]} />
    <Tru r={0.12} r2={0.18} h={0.5} c="#9a6a45" position={[-0.2, 0.5, 0]} />
    <Cau r={0.24} c="#9a6a45" position={[-0.2, 0.88, 0]} hat={3} />
  </group>
);

const TheGia = () => {
  const g = useMemo(() => {
    const h = new THREE.Shape();
    h.moveTo(-0.4, -0.55); h.lineTo(0.4, -0.55); h.lineTo(0.4, 0.3); h.lineTo(0, 0.65); h.lineTo(-0.4, 0.3); h.closePath();
    const lo = new THREE.Path(); lo.absarc(0, 0.35, 0.09, 0, Math.PI * 2, true); h.holes.push(lo);
    const geo = new THREE.ExtrudeGeometry(h, { depth: 0.08, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.04, bevelSegments: 3 });
    geo.center();
    return geo;
  }, []);
  return (
    <group position={[0, 0.85, 0]} rotation={[0, 0.3, -0.25]}>
      <mesh geometry={g} castShadow><M c={MAU.vang} /></mesh>
      <Hop w={0.42} h={0.09} d={0.03} c={MAU.muc} bo={0.02} position={[0, -0.05, 0.08]} />
      <Hop w={0.28} h={0.09} d={0.03} c={MAU.muc} bo={0.02} position={[0, -0.28, 0.08]} />
      <Vong R={0.32} r={0.025} c={MAU.dat} cung={Math.PI} position={[0, 0.62, 0]} />
    </group>
  );
};

const Co = () => (
  <group rotation={[0, 0.4, 0]}>
    <Tru r={0.35} r2={0.42} h={0.16} c={MAU.giay} position={[0, 0.08, 0]} />
    <Tru r={0.05} h={1.7} c="#9a6a45" position={[-0.3, 0.9, 0]} />
    <Cau r={0.08} c={MAU.vang} position={[-0.3, 1.78, 0]} />
    <Hop w={0.9} h={0.6} d={0.06} c={MAU.dat} bo={0.05} position={[0.17, 1.38, 0]} rotation={[0, 0.15, 0]} />
    <NgoiSaoNho />
  </group>
);

const NgoiSaoNho = () => <Cau r={0.11} c={MAU.vang} position={[0.17, 1.38, 0.08]} hat={2} />;

const CanhBao = () => (
  <group position={[0, 0.8, 0]} rotation={[0, 0.3, 0]}>
    {/* lăng trụ ba cạnh dựng đứng, quay -90° quanh X để một đỉnh chĩa LÊN */}
    <group rotation={[-Math.PI / 2, 0, 0]}>
      <mesh castShadow><cylinderGeometry args={[0.75, 0.75, 0.16, 3]} /><M c={MAU.vang} /></mesh>
    </group>
    <Hop w={0.13} h={0.45} d={0.04} c={MAU.muc} position={[0, 0.02, 0.1]} />
    <Cau r={0.08} c={MAU.muc} position={[0, -0.32, 0.1]} />
  </group>
);

const BieuDoTron = () => (
  <group position={[0, 0.3, 0]} rotation={[0.35, 0.3, 0]}>
    <mesh castShadow><cylinderGeometry args={[0.75, 0.75, 0.3, 48, 1, false, 0, Math.PI * 1.4]} /><M c={MAU.xanh} /></mesh>
    <mesh castShadow><cylinderGeometry args={[0.75, 0.75, 0.3, 48, 1, false, Math.PI * 1.4, Math.PI * 0.35]} /><M c={MAU.vang} /></mesh>
    <mesh position={[0.12, 0.1, 0.12]} castShadow><cylinderGeometry args={[0.75, 0.75, 0.3, 48, 1, false, Math.PI * 1.75, Math.PI * 0.25]} /><M c={MAU.dat} /></mesh>
  </group>
);

const BuaGo = () => (
  <group rotation={[0, 0.35, 0]}>
    <Tru r={0.45} r2={0.5} h={0.18} c="#9a6a45" position={[0.15, 0.09, 0]} />
    <group position={[-0.05, 0.85, 0]} rotation={[0, 0, 0.55]}>
      <Tru r={0.2} h={0.6} c="#7a4f33" rotation={[0, 0, Math.PI / 2]} />
      <Tru r={0.22} h={0.08} c={MAU.vang} rotation={[0, 0, Math.PI / 2]} position={[0.22, 0, 0]} />
      <Tru r={0.22} h={0.08} c={MAU.vang} rotation={[0, 0, Math.PI / 2]} position={[-0.22, 0, 0]} />
      <Tru r={0.06} h={0.95} c="#9a6a45" position={[0, -0.5, 0]} />
    </group>
  </group>
);

const ChiaKhoa = () => (
  <group position={[0, 0.85, 0]} rotation={[0.2, 0.3, -0.6]}>
    <Vong R={0.3} r={0.1} c={MAU.vang} />
    <Tru r={0.08} h={0.95} c={MAU.vang} position={[0, -0.75, 0]} />
    <Hop w={0.24} h={0.1} d={0.12} c={MAU.vang} position={[0.15, -1.05, 0]} />
    <Hop w={0.18} h={0.1} d={0.12} c={MAU.vang} position={[0.12, -0.85, 0]} />
  </group>
);

const BangMau = () => (
  <group position={[0, 0.2, 0]} rotation={[0.6, 0.3, 0]}>
    <Cau r={0.75} c={MAU.giay} hat={2} scale={[1.15, 0.12, 0.9]} />
    {[MAU.dat, MAU.vang, MAU.xanh, '#4f7fb3', '#d9534f'].map((c, i) => {
      const a = -2.4 + i * 0.9;
      return <Cau key={i} r={0.13} c={c} hat={i} position={[Math.cos(a) * 0.55, 0.08, Math.sin(a) * 0.42]} scale={[1, 0.5, 1]} />;
    })}
    <Tru r={0.035} h={1.0} c="#9a6a45" rotation={[0.2, 0, 1.1]} position={[0.25, 0.25, 0.2]} />
  </group>
);

const GiaVe = () => (
  <group rotation={[0, 0.3, 0]}>
    {[-0.45, 0.45].map((x, i) => <Tru key={i} r={0.05} h={1.6} c="#9a6a45" rotation={[0.12, 0, (i ? -1 : 1) * 0.1]} position={[x, 0.8, 0.1]} />)}
    <Tru r={0.05} h={1.5} c="#9a6a45" rotation={[-0.35, 0, 0]} position={[0, 0.75, -0.25]} />
    <Hop w={1.3} h={0.9} d={0.06} c={MAU.giay} bo={0.04} position={[0, 1.15, 0.16]} />
    <Hop w={1.3} h={0.07} d={0.14} c="#9a6a45" position={[0, 0.68, 0.2]} />
    {[0, 1, 2].map((i) => (
      <Hop key={i} w={0.18} h={0.15 + i * 0.15} d={0.03} c={[MAU.xanh, MAU.vang, MAU.dat][i]} bo={0.02} position={[-0.3 + i * 0.3, 0.85 + (0.15 + i * 0.15) / 2, 0.2]} />
    ))}
  </group>
);

export const BIEU_TUONG: Record<string, React.FC> = {
  bong_den: BongDen, ten_lua: TenLua, xuc_xac: XucXac, banh_rang: BanhRang, loa: Loa,
  mo_hinh: MoHinh, dien_thoai: DienThoai, nguoi: () => <Nguoi />, nhom: Nhom, khoai: Khoai,
  hop_banh: HopBanh, dong_xu: DongXu, kinh_lup: KinhLup, tai_lieu: TaiLieu, bieu_do: BieuDo,
  muc_tieu: MucTieu, la: La, cay: Cay, trai_tim: TraiTim, binh_gom: BinhGom, khien: Khien,
  mu_tot_nghiep: MuTotNghiep, nha: Nha, ban_do: BanDo, dau_hoi: DauHoi, tick: Tick, can: Can,
  ngoi_sao: NgoiSao, dam_may: DamMay, but: But, sach: Sach,
  tui_tien: TuiTien, heo_dat: HeoDat, bat_tay: BatTay, xe_tai: XeTai, dong_ho_cat: DongHoCat,
  ngon_lua: NgonLua, may_tinh: MayTinh, cua_hang: CuaHang, con_dau: ConDau, the_gia: TheGia,
  co: Co, canh_bao: CanhBao, bieu_do_tron: BieuDoTron, bua_go: BuaGo, chia_khoa: ChiaKhoa,
  bang_mau: BangMau, gia_ve: GiaVe,
};

/** Bệ đất sét dưới mỗi biểu tượng: làm các biểu tượng khác nhau thành một bộ. */
export const Be: React.FC<{ c: string }> = ({ c }) => (
  <group>
    <Tru r={0.85} r2={0.92} h={0.22} c={c} position={[0, 0.11, 0]} s={56} />
    <Tru r={0.72} h={0.08} c={MAU.giay} position={[0, 0.26, 0]} s={56} />
  </group>
);
