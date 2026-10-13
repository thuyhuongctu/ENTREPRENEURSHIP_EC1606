// Dựng một cảnh "3D đất sét noir" từ mô tả cảnh của một slide
// (docs/dat_set_noir_ch0N.json). Chạy trong Chromium headless do
// dung_anh.mjs mở; hàm window.veCanh(canh) trả về ảnh JPEG dạng data URL.
//
// Ảnh này là KHUNG BỐ CỤC, không phải ảnh thành phẩm: nhân vật và đạo cụ là
// khối đất sét đơn giản để cô Hương đưa vào ArtCraft làm ảnh đầu vào
// (image-to-image, 3D compositing) cùng prompt của slide.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

const RONG = 1920;
const CAO = 1080;

// Noir: gần như đơn sắc, chỉ MỘT màu nhấn cho mỗi cảnh. Màu đất sét để hơi
// ngả xám — để bão hòa cao thì ánh đèn gắt làm cảnh thành đồ chơi nhựa.
const MAU_NHAN = { do: 0xb3261e, ho_phach: 0xd08a1a, xanh_ngoc: 0x1f8a83 };
const MAU = {
  san: 0x2a2826, tuong: 0x1d1c1b, da: 0xd9b49a, ao_dai: 0xe6e1d8, toc: 0x6e3420,
  mat: 0x161210, go: 0x6b5340, giay: 0xcfc8ba, kim_loai: 0x8d8a84, xam: 0x77736d,
  dat_nung: 0x9a4a2c, khoai: 0x6d3346, la: 0x4f5e46, vang: 0xb39245, toi: 0x3a3836,
};

// ---------------------------------------------------------------------------
// Chất liệu đất sét: nhám, có vân tay. Bề mặt "nặn tay" có được nhờ hai thứ:
// bản đồ gồ ghề (bump) vẽ bằng nhiễu, và làm méo nhẹ các đỉnh của khối.
// ---------------------------------------------------------------------------

let banDoGoGhe = null;

function taoBanDoGoGhe() {
  const c = document.createElement('canvas');
  c.width = c.height = 512;
  const g = c.getContext('2d');
  g.fillStyle = '#808080';
  g.fillRect(0, 0, 512, 512);
  const ngauNhien = soNgauNhien(7);
  // Vết miết ngón tay: nhiều cung tròn mờ chồng lên nhau.
  for (let i = 0; i < 900; i++) {
    const x = ngauNhien() * 512, y = ngauNhien() * 512, r = 6 + ngauNhien() * 26;
    g.strokeStyle = `rgba(${ngauNhien() < 0.5 ? 255 : 0},${0},${0},0)`;
    const sang = Math.floor(100 + ngauNhien() * 60);
    g.strokeStyle = `rgba(${sang},${sang},${sang},0.18)`;
    g.lineWidth = 1 + ngauNhien() * 2;
    g.beginPath();
    g.arc(x, y, r, ngauNhien() * 6.28, ngauNhien() * 6.28 + 1.5 + ngauNhien() * 2);
    g.stroke();
  }
  const anh = g.getImageData(0, 0, 512, 512);
  for (let i = 0; i < anh.data.length; i += 4) {
    const n = (ngauNhien() - 0.5) * 26;
    anh.data[i] = anh.data[i + 1] = anh.data[i + 2] = Math.max(0, Math.min(255, anh.data[i] + n));
  }
  g.putImageData(anh, 0, 0);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(2, 2);
  return t;
}

// bumpScale nhỏ là cố ý: từ Three.js r15x hệ số này tính theo đơn vị thế
// giới, để 0,9 (như lần dựng đầu) thì pháp tuyến bị bẻ gãy — nửa dưới mặt
// nhân vật đen kịt dù đã thêm đèn phụ.
function datSet(mau, them = {}) {
  if (!banDoGoGhe) banDoGoGhe = taoBanDoGoGhe();
  return new THREE.MeshStandardMaterial({
    color: mau, roughness: 0.88, metalness: 0.0, bumpMap: banDoGoGhe, bumpScale: 0.06, ...them,
  });
}

// Nhiễu giá trị 3D trơn — đủ để làm méo khối cho giống nặn tay, không cần
// thư viện nhiễu riêng.
function soNgauNhien(hat) {
  let s = hat >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}
function bam(x, y, z) {
  const s = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453;
  return s - Math.floor(s);
}
function nhieu(x, y, z) {
  const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
  const xf = x - xi, yf = y - yi, zf = z - zi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf), w = zf * zf * (3 - 2 * zf);
  const tron = (a, b, t) => a + (b - a) * t;
  const c = (dx, dy, dz) => bam(xi + dx, yi + dy, zi + dz);
  return tron(
    tron(tron(c(0, 0, 0), c(1, 0, 0), u), tron(c(0, 1, 0), c(1, 1, 0), u), v),
    tron(tron(c(0, 0, 1), c(1, 0, 1), u), tron(c(0, 1, 1), c(1, 1, 1), u), v), w) - 0.5;
}

function meo(geo, bienDo = 0.02, tanSo = 3.0) {
  const p = geo.attributes.position;
  const v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    const n = nhieu(v.x * tanSo + 11, v.y * tanSo + 3, v.z * tanSo + 7);
    const huong = v.clone().normalize();
    v.addScaledVector(huong, n * bienDo);
    p.setXYZ(i, v.x, v.y, v.z);
  }
  geo.computeVertexNormals();
  return geo;
}

function khoi(geo, mau, bienDo = 0.02) {
  const m = new THREE.Mesh(meo(geo, bienDo), typeof mau === 'number' ? datSet(mau) : mau);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

const cau = (r, mau, s = 32) => khoi(new THREE.SphereGeometry(r, s, s / 2), mau, r * 0.06);
const nang = (r, d, mau) => khoi(new THREE.CapsuleGeometry(r, d, 8, 24), mau, r * 0.08);
const tru = (r1, r2, h, mau, s = 32) => khoi(new THREE.CylinderGeometry(r1, r2, h, s, 4), mau, Math.min(r1, h) * 0.05);
const hop = (x, y, z, mau, bo = 0.04) => khoi(new RoundedBoxGeometry(x, y, z, 3, Math.min(bo, x / 2, y / 2, z / 2)), mau, 0.012);

function nhom(...ds) {
  const g = new THREE.Group();
  ds.forEach((d) => d && g.add(d));
  return g;
}
function dat(o, x, y, z) { o.position.set(x, y, z); return o; }

// ---------------------------------------------------------------------------
// Nhân vật Hương AI bằng đất sét: tóc dài gợn sóng màu nâu đỏ, áo dài trắng
// ngà — đủ để nhận ra cùng một nhân vật với ảnh Hương AI gốc, không cố giống
// mặt (khuôn mặt để ArtCraft lo, theo ảnh tham chiếu).
// ---------------------------------------------------------------------------

function huongAI(tuThe, mauNhan) {
  const g = new THREE.Group();
  const ao = datSet(MAU.ao_dai);
  // Thân áo dài: một mặt tiện xoay từ vai xuống bắp chân, eo thắt lại.
  // Điểm phải đi từ DƯỚI lên TRÊN: liệt kê ngược thì pháp tuyến của khối
  // tiện quay vào trong, áo dài trắng lên hình thành màu đen (lần dựng đầu).
  const bien = [[0.0, 0.3], [0.3, 0.32], [0.27, 0.55], [0.21, 0.86], [0.16, 0.98], [0.2, 1.08], [0.24, 1.3],
    [0.2, 1.4], [0.0, 1.42]].map(([x, y]) => new THREE.Vector2(x, y));
  const than = khoi(new THREE.LatheGeometry(bien, 40), ao, 0.01);
  g.add(than);
  // Quần trắng và chân.
  g.add(dat(tru(0.07, 0.07, 0.32, MAU.ao_dai), -0.09, 0.16, 0));
  g.add(dat(tru(0.07, 0.07, 0.32, MAU.ao_dai), 0.09, 0.16, 0));
  g.add(dat(hop(0.11, 0.06, 0.2, MAU.toi), -0.09, 0.03, 0.04));
  g.add(dat(hop(0.11, 0.06, 0.2, MAU.toi), 0.09, 0.03, 0.04));
  // Cổ áo đứng, dải lụa nhỏ mang màu nhấn của cảnh.
  g.add(dat(tru(0.075, 0.08, 0.1, MAU.ao_dai), 0, 1.47, 0));
  const lua = dat(hop(0.05, 0.42, 0.02, mauNhan, 0.01), 0.1, 1.18, 0.2);
  lua.rotation.z = -0.25;
  g.add(lua);
  // Đầu, mặt.
  const dau = new THREE.Group();
  dau.position.set(0, 1.68, 0);
  const mat = cau(0.2, MAU.da);
  mat.scale.set(1, 1.08, 0.98);
  dau.add(mat);
  for (const s of [-1, 1]) {
    dau.add(dat(cau(0.03, MAU.mat, 16), s * 0.075, 0.02, 0.18));
    dau.add(dat(cau(0.008, 0xffffff, 8), s * 0.075 + 0.01, 0.035, 0.205));
    const ma = dat(cau(0.035, 0xc98a7a, 16), s * 0.12, -0.06, 0.15);
    ma.scale.set(1, 0.6, 0.5);
    dau.add(ma);
  }
  // Miệng là một khối dẹt nhỏ màu hồng đất. Từng dùng nửa vòng xuyến màu sẫm:
  // ở cận cảnh nó đổ bóng thành vệt đen trông như ria mép.
  const mieng = cau(0.032, 0x8e3b3b, 16);
  mieng.scale.set(1.3, 0.45, 0.4);
  mieng.position.set(0, -0.085, 0.185);
  dau.add(mieng);
  // Tóc: mái trùm đầu + khối tóc dài sau lưng + vài lọn gợn sóng hai bên.
  const toc = datSet(MAU.toc);
  // Chỏm tóc chỉ phủ tới trên trán: góc phủ quá nửa cầu là che mất mắt.
  const mai = khoi(new THREE.SphereGeometry(0.225, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.4), toc, 0.012);
  // Ngả mái tóc ra SAU; ngả về trước thì chỏm tóc trùm kín mặt.
  mai.position.set(0, 0.03, -0.02);
  mai.rotation.x = 0.4;
  dau.add(mai);
  const sau = nang(0.2, 0.55, toc);
  sau.position.set(0, -0.35, -0.12);
  sau.scale.set(1.15, 1, 0.55);
  dau.add(sau);
  for (const s of [-1, 1]) {
    for (let k = 0; k < 3; k++) {
      const lon = cau(0.075, toc, 20);
      lon.position.set(s * (0.19 + 0.02 * k), -0.16 - 0.15 * k, -0.09 - 0.03 * k);
      dau.add(lon);
    }
  }
  // Các chi tiết trên đầu không đổ bóng: đèn rọi từ trên cao làm chỏm tóc
  // và mắt hắt bóng đen xuống nửa dưới mặt, trông như râu quai nón.
  dau.traverse((v) => { v.castShadow = false; });
  g.add(dau);
  // Tay: tay áo dài trắng + bàn tay. Tư thế xoay cánh tay quanh vai.
  const tay = (ben) => {
    const vai = new THREE.Group();
    vai.position.set(ben * 0.24, 1.36, 0);
    const canh = nang(0.055, 0.5, ao);
    canh.position.y = -0.3;
    const banTay = cau(0.055, MAU.da, 16);
    banTay.position.y = -0.6;
    vai.add(canh, banTay);
    return vai;
  };
  const trai = tay(-1), phai = tay(1);
  const xoay = {
    chi_bang: [[0, 0, -0.25], [0, 0, 1.7]],
    dang_tay: [[0, 0, -0.9], [0, 0, 0.9]],
    suy_nghi: [[0, 0, -0.2], [-1.9, 0, 0.45]],
    cam_vat: [[0, 0, -0.2], [-1.2, 0, 0.25]],
    vay_chao: [[0, 0, -0.2], [0, 0, 2.7]],
  }[tuThe] || [[0, 0, -0.15], [0, 0, 0.15]];
  trai.rotation.set(...xoay[0]);
  phai.rotation.set(...xoay[1]);
  g.add(trai, phai);
  g.userData.tayPhai = phai;
  return g;
}

// Người đất sét phụ (khách hàng, nhà đầu tư, đối tác): đơn giản, không tóc
// dài, màu áo sẫm để không tranh chỗ với Hương AI.
function nguoiPhu(mauAo = MAU.xam, cao = 1.0) {
  const g = nhom(
    dat(tru(0.18, 0.24, 0.85, mauAo), 0, 0.72, 0),
    dat(tru(0.06, 0.06, 0.32, MAU.toi), -0.08, 0.16, 0),
    dat(tru(0.06, 0.06, 0.32, MAU.toi), 0.08, 0.16, 0),
    dat(cau(0.17, MAU.da), 0, 1.33, 0),
    dat(cau(0.025, MAU.mat, 12), -0.06, 1.35, 0.15),
    dat(cau(0.025, MAU.mat, 12), 0.06, 1.35, 0.15),
  );
  const toc = khoi(new THREE.SphereGeometry(0.18, 24, 12, 0, Math.PI * 2, 0, Math.PI * 0.4), MAU.toi, 0.01);
  toc.position.set(0, 1.35, -0.02);
  toc.rotation.x = 0.35;
  g.add(toc);
  for (const s of [-1, 1]) {
    const c = nang(0.05, 0.45, mauAo);
    c.position.set(s * 0.25, 0.85, 0);
    c.rotation.z = s * 0.15;
    g.add(c);
  }
  g.scale.setScalar(cao);
  return g;
}

// ---------------------------------------------------------------------------
// Đạo cụ. Mỗi hàm trả về một nhóm có gốc ở mặt sàn (y = 0). "nho" = đặt
// được lên bàn hoặc bệ; còn lại đặt thẳng xuống sàn.
// ---------------------------------------------------------------------------

const DAO_CU = {
  ban_lam_viec: { nho: false, ve: () => nhom(dat(hop(1.6, 0.08, 0.8, MAU.go), 0, 0.78, 0),
    ...[[-0.72, -0.32], [0.72, -0.32], [-0.72, 0.32], [0.72, 0.32]].map(([x, z]) => dat(tru(0.04, 0.04, 0.76, MAU.go), x, 0.38, z))) },
  den_ban: { nho: true, ve: (n) => nhom(dat(tru(0.12, 0.14, 0.04, MAU.toi), 0, 0.02, 0),
    dat(tru(0.015, 0.015, 0.45, MAU.toi), 0, 0.24, 0),
    (() => { const c = khoi(new THREE.ConeGeometry(0.16, 0.18, 24, 1, true), datSet(n, { side: THREE.DoubleSide })); c.position.set(0.05, 0.48, 0); c.rotation.z = 0.5; return c; })(),
    dat(cau(0.05, datSet(0xfff1c8, { emissive: 0xffd27a, emissiveIntensity: 2.2 }), 16), 0.03, 0.43, 0)) },
  bong_den: { nho: true, ve: (n) => nhom(
    dat(cau(0.22, datSet(0xfff4cf, { emissive: n, emissiveIntensity: 1.6, roughness: 0.4 })), 0, 0.32, 0),
    dat(tru(0.09, 0.09, 0.14, MAU.kim_loai), 0, 0.07, 0)) },
  dong_xu: { nho: true, ve: (n) => {
    const g = new THREE.Group();
    [[0, 5], [0.17, 8], [0.34, 11]].forEach(([x, so]) => {
      for (let i = 0; i < so; i++) g.add(dat(tru(0.07, 0.07, 0.025, i === so - 1 ? n : MAU.vang, 24), x + (i % 2) * 0.006, 0.0125 + i * 0.027, 0));
    });
    return g;
  } },
  tui_tien: { nho: true, ve: (n) => { const t = cau(0.2, MAU.giay); t.scale.set(1, 1.1, 1); t.position.y = 0.2;
    return nhom(t, dat(khoi(new THREE.TorusGeometry(0.07, 0.02, 8, 20), n, 0.003), 0, 0.4, 0), dat(cau(0.07, MAU.giay, 16), 0, 0.47, 0)); } },
  bieu_do_cot: { nho: false, ve: (n) => nhom(dat(hop(1.2, 0.06, 0.4, MAU.toi), 0, 0.03, 0),
    ...[0.35, 0.6, 0.85, 1.25].map((h, i) => dat(hop(0.2, h, 0.2, i === 3 ? n : MAU.xam), -0.42 + i * 0.28, 0.06 + h / 2, 0))) },
  mui_ten_tang: { nho: false, ve: (n) => {
    const s = new THREE.Shape();
    s.moveTo(0, 0); s.lineTo(1.2, 0); s.lineTo(1.2, -0.12); s.lineTo(1.45, 0.1); s.lineTo(1.2, 0.32); s.lineTo(1.2, 0.2); s.lineTo(0, 0.2);
    const m = khoi(new THREE.ExtrudeGeometry(s, { depth: 0.12, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.03 }), n, 0.01);
    m.rotation.z = 0.6; m.position.set(-0.5, 0.15, 0);
    return nhom(m, dat(hop(0.5, 0.3, 0.3, MAU.toi), -0.55, 0.15, 0));
  } },
  khoai_lang: { nho: true, ve: () => { const g = new THREE.Group(); const r = soNgauNhien(3);
    for (let i = 0; i < 7; i++) { const k = cau(0.07, MAU.khoai, 20); k.scale.set(2.1, 1, 1);
      k.position.set((r() - 0.5) * 0.45, 0.07 + (i > 4 ? 0.1 : 0), (r() - 0.5) * 0.3); k.rotation.y = r() * 3; g.add(k); }
    return g; } },
  binh_gom: { nho: true, ve: () => khoi(new THREE.LatheGeometry([[0.0, 0], [0.12, 0], [0.18, 0.12], [0.2, 0.25], [0.14, 0.4], [0.08, 0.46], [0.1, 0.52], [0.0, 0.52]]
    .map(([x, y]) => new THREE.Vector2(x, y)), 40), MAU.dat_nung, 0.008) },
  lo_nung: { nho: false, ve: (n) => { const vom = khoi(new THREE.SphereGeometry(0.75, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), MAU.dat_nung, 0.03);
    const cua = dat(hop(0.4, 0.4, 0.1, datSet(0x2a1208, { emissive: n, emissiveIntensity: 1.4 })), 0, 0.22, 0.68);
    return nhom(vom, cua, dat(tru(0.08, 0.1, 0.5, MAU.dat_nung), 0.3, 0.85, -0.2)); } },
  nha_xuong: { nho: false, ve: (n) => { const mai = khoi(new THREE.CylinderGeometry(0.01, 0.95, 0.5, 4, 1), MAU.toi, 0.01);
    mai.rotation.y = Math.PI / 4; mai.position.y = 1.15; mai.scale.set(1, 1, 0.75);
    return nhom(dat(hop(1.3, 0.9, 1.0, MAU.giay), 0, 0.45, 0), mai, dat(hop(0.3, 0.5, 0.06, n), 0, 0.25, 0.51),
      dat(tru(0.08, 0.08, 0.6, MAU.xam), 0.4, 1.3, -0.2)); } },
  quay_hang: { nho: false, ve: (n) => { const g = nhom(dat(hop(1.4, 0.75, 0.6, MAU.go), 0, 0.375, 0));
    [[-0.65, -0.25], [0.65, -0.25], [-0.65, 0.25], [0.65, 0.25]].forEach(([x, z]) => g.add(dat(tru(0.03, 0.03, 1.6, MAU.go), x, 0.8, z)));
    for (let i = 0; i < 6; i++) g.add(dat(hop(0.25, 0.05, 0.8, i % 2 ? n : MAU.giay, 0.01), -0.62 + i * 0.25, 1.62, 0.05));
    return g; } },
  dien_thoai: { nho: true, ve: (n) => { const g = nhom(dat(hop(0.17, 0.32, 0.03, MAU.toi, 0.02), 0, 0.16, 0),
    dat(hop(0.145, 0.27, 0.01, datSet(0x0c1418, { emissive: n, emissiveIntensity: 0.55 }), 0.01), 0, 0.165, 0.018));
    g.rotation.x = -0.25; return g; } },
  may_tinh: { nho: true, ve: (n) => { const man = nhom(dat(hop(0.6, 0.4, 0.03, MAU.toi, 0.02), 0, 0.2, 0),
    dat(hop(0.54, 0.34, 0.01, datSet(0x0c1418, { emissive: n, emissiveIntensity: 0.45 }), 0.005), 0, 0.2, 0.02));
    man.position.set(0, 0.02, -0.18); man.rotation.x = -0.25; return nhom(dat(hop(0.62, 0.03, 0.42, MAU.xam, 0.015), 0, 0.015, 0), man); } },
  chong_tai_lieu: { nho: true, ve: (n) => { const g = new THREE.Group();
    for (let i = 0; i < 6; i++) { const t = hop(0.42, 0.035, 0.3, i === 5 ? n : MAU.giay, 0.01); t.position.set((i % 2) * 0.02, 0.02 + i * 0.038, 0); t.rotation.y = (i - 3) * 0.04; g.add(t); }
    return g; } },
  kinh_lup: { nho: true, ve: (n) => { const vong = khoi(new THREE.TorusGeometry(0.16, 0.025, 12, 32), n, 0.004);
    const kinh = new THREE.Mesh(new THREE.CircleGeometry(0.15, 32), new THREE.MeshStandardMaterial({ color: 0x9fb8c0, transparent: true, opacity: 0.35, roughness: 0.1 }));
    const can = tru(0.025, 0.03, 0.3, MAU.toi); can.position.set(0, -0.3, 0);
    const g = nhom(vong, kinh, can); g.position.y = 0.5; g.rotation.z = 0.5; return g; } },
  bia_muc_tieu: { nho: false, ve: (n) => { const bia = new THREE.Group();
    [[0.55, MAU.giay], [0.42, n], [0.29, MAU.giay], [0.16, n]].forEach(([r, m], i) => { const c = tru(r, r, 0.04, m, 40); c.rotation.x = Math.PI / 2; c.position.z = i * 0.015; bia.add(c); });
    bia.position.y = 1.0; const ten = tru(0.02, 0.02, 0.9, MAU.go); ten.rotation.z = Math.PI / 2 - 0.3; ten.position.set(0.25, 1.15, 0.25);
    return nhom(bia, ten, dat(tru(0.04, 0.06, 0.55, MAU.go), 0, 0.27, -0.05)); } },
  nhan_vat_phu: { nho: false, ve: () => nguoiPhu(MAU.xam, 1.0) },
  nhom_nguoi: { nho: false, ve: (n) => nhom(dat(nguoiPhu(MAU.xam, 0.85), -0.45, 0, 0.1), dat(nguoiPhu(n, 0.9), 0, 0, -0.15),
    dat(nguoiPhu(MAU.toi, 0.8), 0.45, 0, 0.12), dat(nguoiPhu(MAU.giay, 0.75), 0.85, 0, -0.1)) },
  bien_chi_duong: { nho: false, ve: (n) => { const g = nhom(dat(tru(0.04, 0.05, 1.7, MAU.go), 0, 0.85, 0));
    [[1.35, 0.3, n], [1.05, -0.35, MAU.giay], [0.75, 0.25, MAU.xam]].forEach(([y, r, m]) => { const b = hop(0.7, 0.18, 0.04, m, 0.02); b.position.set(0, y, 0.05); b.rotation.y = r; b.translateX(0.3); g.add(b); });
    return g; } },
  bac_thang: { nho: false, ve: (n) => nhom(...[0, 1, 2, 3].map((i) => dat(hop(0.45, 0.25 * (i + 1), 0.6, i === 3 ? n : MAU.xam), -0.65 + i * 0.45, 0.125 * (i + 1), 0))) },
  can_can: { nho: false, ve: (n) => { const g = nhom(dat(tru(0.25, 0.3, 0.08, MAU.toi), 0, 0.04, 0), dat(tru(0.03, 0.03, 1.1, MAU.kim_loai), 0, 0.6, 0));
    const don = new THREE.Group(); don.position.y = 1.15; don.rotation.z = 0.12;
    don.add(dat(hop(1.3, 0.04, 0.05, MAU.kim_loai, 0.015), 0, 0, 0));
    [[-0.6, n], [0.6, MAU.vang]].forEach(([x, m]) => { don.add(dat(tru(0.006, 0.006, 0.35, MAU.kim_loai, 8), x, -0.17, 0)); don.add(dat(tru(0.22, 0.17, 0.05, m), x, -0.36, 0)); });
    g.add(don); return g; } },
  dong_ho: { nho: false, ve: (n) => { const mat = tru(0.4, 0.4, 0.08, MAU.giay, 48); mat.rotation.x = Math.PI / 2; mat.position.y = 1.3;
    const vien = khoi(new THREE.TorusGeometry(0.4, 0.04, 12, 48), MAU.toi, 0.004); vien.position.y = 1.3;
    const kim1 = hop(0.03, 0.28, 0.02, MAU.toi, 0.008); kim1.position.set(0.05, 1.42, 0.06); kim1.rotation.z = -0.4;
    const kim2 = hop(0.03, 0.2, 0.02, n, 0.008); kim2.position.set(0.08, 1.27, 0.07); kim2.rotation.z = 2.2;
    return nhom(mat, vien, kim1, kim2, dat(tru(0.05, 0.08, 0.95, MAU.toi), 0, 0.47, -0.05)); } },
  chau_cay: { nho: false, ve: () => { const g = nhom(dat(tru(0.22, 0.16, 0.38, MAU.dat_nung), 0, 0.19, 0)); const r = soNgauNhien(5);
    for (let i = 0; i < 9; i++) { const l = cau(0.09, MAU.la, 16); l.scale.set(0.6, 1.8, 0.4); l.position.set((r() - 0.5) * 0.3, 0.55 + r() * 0.35, (r() - 0.5) * 0.3); l.rotation.z = (r() - 0.5) * 1.4; g.add(l); }
    return g; } },
  bang_trong: { nho: false, ve: () => { const g = nhom(dat(hop(1.5, 1.0, 0.06, MAU.giay, 0.03), 0, 1.35, 0), dat(hop(1.6, 1.1, 0.04, MAU.toi, 0.03), 0, 1.35, -0.03));
    [[-0.5, 1], [0.5, 1], [0, -1]].forEach(([x, s]) => { const c = tru(0.025, 0.025, 1.4, MAU.go); c.position.set(x, 0.65, s * 0.15 - 0.05); c.rotation.x = s * 0.12; g.add(c); });
    return g; } },
  thung_hang: { nho: false, ve: (n) => nhom(dat(hop(0.5, 0.4, 0.45, MAU.go, 0.02), 0, 0.2, 0), dat(hop(0.45, 0.35, 0.4, MAU.go, 0.02), 0.5, 0.175, 0.05),
    dat(hop(0.42, 0.34, 0.4, MAU.go, 0.02), 0.22, 0.57, 0), dat(hop(0.44, 0.03, 0.07, n, 0.01), 0.22, 0.75, 0)) },
  con_dau: { nho: true, ve: (n) => nhom(dat(hop(0.22, 0.06, 0.16, MAU.toi, 0.015), 0, 0.03, 0), dat(tru(0.035, 0.05, 0.14, MAU.go), 0, 0.13, 0), dat(cau(0.06, n, 16), 0, 0.24, 0)) },
  o_khoa: { nho: true, ve: (n) => { const quai = khoi(new THREE.TorusGeometry(0.1, 0.025, 12, 24, Math.PI), MAU.kim_loai, 0.003); quai.position.y = 0.3;
    return nhom(dat(hop(0.3, 0.26, 0.12, n, 0.04), 0, 0.15, 0), quai, dat(cau(0.025, MAU.toi, 12), 0, 0.16, 0.065)); } },
};

// ---------------------------------------------------------------------------
// Ánh sáng noir và máy quay
// ---------------------------------------------------------------------------

function datAnhSang(scene, kieu, mauNhan) {
  scene.add(new THREE.AmbientLight(0x9aa4b5, 0.12));
  // Đèn viền lạnh phía sau: tách khối khỏi nền tối — thiếu nó nhân vật tóc
  // sẫm chìm hẳn vào phông.
  const vien = new THREE.DirectionalLight(0x9db4d6, 1.1);
  vien.position.set(-3, 4, -5);
  scene.add(vien);
  // Đèn phụ dịu từ phía máy quay, ngang tầm mặt. Thiếu nó, đèn rọi từ trên
  // cao để nửa dưới mặt Hương AI đen kịt như đeo khẩu trang — noir cần
  // tương phản, không cần mất mặt nhân vật.
  const phu = new THREE.DirectionalLight(0xd8cfc4, 1.1);
  phu.position.set(0.5, 1.6, 8);
  scene.add(phu);
  if (kieu === 'den_ban') {
    const am = new THREE.PointLight(0xffc27a, 26, 9, 1.4);
    am.position.set(0.9, 2.1, 1.4);
    am.castShadow = true;
    am.shadow.mapSize.set(1024, 1024);
    scene.add(am);
    const lanh = new THREE.DirectionalLight(0x7f93b8, 0.7);
    lanh.position.set(-4, 3, 4);
    scene.add(lanh);
    return;
  }
  const den = new THREE.SpotLight(kieu === 'rem_sao' ? 0xf2ead8 : 0xfff6e6, kieu === 'rem_sao' ? 150 : 170,
    30, kieu === 'rem_sao' ? 0.5 : 0.36, 0.35, 1.4);
  den.castShadow = true;
  den.shadow.mapSize.set(2048, 2048);
  den.shadow.bias = -0.0004;
  if (kieu === 'rem_sao') {
    den.position.set(5.5, 5.2, 4.5);
    // Rèm sáo: các thanh mảnh chắn giữa đèn và cảnh, đổ bóng sọc lên tường
    // và nhân vật — dấu hiệu nhận diện của phim noir.
    const rem = new THREE.Group();
    const vatLieu = new THREE.MeshBasicMaterial({ color: 0x000000, colorWrite: false, depthWrite: false });
    for (let i = 0; i < 9; i++) {
      const t = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.07, 0.02), vatLieu);
      t.position.y = (i - 4) * 0.2;
      t.castShadow = true;
      rem.add(t);
    }
    rem.position.set(4.0, 4.0, 3.3);
    rem.lookAt(0, 1, 0);
    scene.add(rem);
  } else {
    // Đèn rọi chếch từ phía trước, không đặt thẳng trên đầu: rọi thẳng
    // đứng thì chỉ đỉnh đầu sáng, cả khuôn mặt chìm trong tối.
    den.position.set(1.4, 6.8, 5.6);
  }
  den.target.position.set(0.5, 0.8, 0);
  scene.add(den, den.target);
  const nhan = new THREE.PointLight(mauNhan, 1.6, 5, 2);
  nhan.position.set(2.8, 0.6, -1.4);
  scene.add(nhan);
}

const MAY_QUAY = {
  rong: { o: [0.9, 2.5, 8.8], nhin: [0.9, 1.05, 0], fov: 34 },
  trung: { o: [0.5, 1.9, 6.2], nhin: [0.6, 1.1, 0], fov: 34 },
  can: { o: [-0.9, 1.75, 3.5], nhin: [-0.9, 1.45, 0], fov: 32 },
  tu_tren: { o: [0.9, 6.4, 5.4], nhin: [0.9, 0.2, 0], fov: 36 },
};

// ---------------------------------------------------------------------------
// Bố cục: Hương AI đứng phần ba bên trái, đạo cụ dồn sang phải — chừa chỗ
// cho chữ của slide ở nửa phải/trên như các slide dựng sẵn của bộ bài giảng.
// ---------------------------------------------------------------------------

const O_SAN = [[1.5, 0.2], [2.9, -0.5], [0.4, 1.0], [3.4, 0.9]];
const O_GIUA = [[0.2, 0.2], [1.7, -0.4], [-1.2, 0.6], [2.6, 0.8]];

function xepCanh(scene, canh, mauNhan) {
  const coNguoi = canh.tu_the !== 'khong_co';
  const dsDaoCu = (canh.dao_cu || []).filter((k) => DAO_CU[k]).slice(0, 4);
  const ban = dsDaoCu.includes('ban_lam_viec');
  const nhoKhongBan = [];
  const o = coNguoi ? O_SAN : O_GIUA;
  let viTri = 0;
  let viTriBan = null;
  // Đạo cụ lớn đặt trước để giữ các ô gần trung tâm.
  for (const k of dsDaoCu) {
    const dc = DAO_CU[k];
    if (dc.nho || k === 'bong_den') continue;
    const vat = dc.ve(mauNhan);
    const [x, z] = o[viTri++ % o.length];
    vat.position.set(x, 0, z);
    vat.rotation.y = -0.25 + (viTri % 2) * 0.35;
    if (k === 'ban_lam_viec') viTriBan = vat.position.clone();
    scene.add(vat);
  }
  let oTrenBan = 0;
  for (const k of dsDaoCu) {
    const dc = DAO_CU[k];
    if (!dc.nho || k === 'bong_den') continue;
    const vat = dc.ve(mauNhan);
    if (ban && viTriBan) {
      vat.position.set(viTriBan.x - 0.45 + oTrenBan * 0.45, 0.82, viTriBan.z);
      oTrenBan++;
    } else {
      nhoKhongBan.push(vat);
    }
    scene.add(vat);
  }
  // Đạo cụ nhỏ không có bàn: đặt lên bệ đất sét cho khỏi lọt thỏm dưới sàn.
  nhoKhongBan.forEach((vat) => {
    const [x, z] = o[viTri++ % o.length];
    scene.add(dat(tru(0.38, 0.42, 0.7, MAU.toi), x, 0.35, z));
    vat.position.set(x, 0.7, z);
  });
  if (dsDaoCu.includes('bong_den')) {
    const b = DAO_CU.bong_den.ve(mauNhan);
    b.scale.setScalar(1.6);
    b.position.set(coNguoi ? -0.9 : 1.0, coNguoi ? 2.05 : 1.6, 0.2);
    scene.add(b);
    const sang = new THREE.PointLight(0xffe2a0, 2.5, 4, 2);
    sang.position.copy(b.position).add(new THREE.Vector3(0, 0.5, 0.3));
    scene.add(sang);
  }
  if (coNguoi) {
    const h = huongAI(canh.tu_the, mauNhan);
    h.position.set(-0.9, 0, 0.3);
    h.rotation.y = 0.35;
    scene.add(h);
  }
}

function hauKy(nguon) {
  // Hậu kỳ trên canvas 2D: tăng tương phản, viền tối (vignette) và hạt phim.
  // Làm ở 2D thay vì shader để khỏi kéo thêm EffectComposer — đủ cho ảnh tĩnh.
  const c = document.createElement('canvas');
  c.width = RONG;
  c.height = CAO;
  const g = c.getContext('2d');
  g.filter = 'contrast(1.18) saturate(0.85)';
  g.drawImage(nguon, 0, 0);
  g.filter = 'none';
  const v = g.createRadialGradient(RONG / 2, CAO / 2, CAO * 0.35, RONG / 2, CAO / 2, RONG * 0.62);
  v.addColorStop(0, 'rgba(0,0,0,0)');
  v.addColorStop(1, 'rgba(0,0,0,0.78)');
  g.fillStyle = v;
  g.fillRect(0, 0, RONG, CAO);
  const anh = g.getImageData(0, 0, RONG, CAO);
  const r = soNgauNhien(11);
  for (let i = 0; i < anh.data.length; i += 4) {
    const n = (r() - 0.5) * 22;
    anh.data[i] += n;
    anh.data[i + 1] += n;
    anh.data[i + 2] += n;
  }
  g.putImageData(anh, 0, 0);
  return c.toDataURL('image/jpeg', 0.88);
}

let renderer = null;

window.veCanh = (canh) => {
  if (!renderer) {
    renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    renderer.setSize(RONG, CAO);
    renderer.setPixelRatio(1);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    document.body.appendChild(renderer.domElement);
  }
  const mauNhan = MAU_NHAN[canh.mau_nhan] || MAU_NHAN.do;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x070708);
  scene.fog = new THREE.Fog(0x070708, 9, 22);
  const san = khoi(new THREE.PlaneGeometry(30, 30, 60, 60), MAU.san, 0.03);
  san.rotation.x = -Math.PI / 2;
  san.castShadow = false;
  scene.add(san);
  const tuong = khoi(new THREE.PlaneGeometry(30, 12, 60, 24), MAU.tuong, 0.03);
  tuong.position.set(0, 6, -2.6);
  tuong.castShadow = false;
  scene.add(tuong);
  datAnhSang(scene, canh.anh_sang, mauNhan);
  xepCanh(scene, canh, mauNhan);
  const mq = MAY_QUAY[canh.camera] || MAY_QUAY.trung;
  const cam = new THREE.PerspectiveCamera(mq.fov, RONG / CAO, 0.1, 60);
  // Không có nhân vật thì cận cảnh nhắm vào cụm đạo cụ thay vì khoảng trống.
  const nhin = canh.tu_the === 'khong_co' && canh.camera === 'can' ? [0.6, 0.9, 0.2] : mq.nhin;
  const o = canh.tu_the === 'khong_co' && canh.camera === 'can' ? [0.9, 1.6, 3.6] : mq.o;
  cam.position.set(...o);
  cam.lookAt(...nhin);
  renderer.render(scene, cam);
  const ketQua = hauKy(renderer.domElement);
  scene.traverse((v) => { if (v.geometry) v.geometry.dispose(); });
  return ketQua;
};

window.sanSang = true;
