// ───────────── the 3D hero layer (Three.js): a lit paper ribbon, the ivory paper jet, stone plinths, the extruded logo ─────────────
// Objects are placed with SCREEN fractions (xf, yf of the frame) at a depth z, so the 2D layout and the 3D layer line up in every aspect ratio.
// The camera drifts a little in time; objects keep their world positions, so the depth layers shift against each other (parallax).
const H3 = (() => {
  let R, S, CAM, BASE, cv, W = 0, H = 0, ready = false, FOV = 28, DIST = 15, used = false;
  const slots = [], plinths = [], P = {};
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  const paperTex = (seed, size, strength) => { const c = document.createElement("canvas"); c.width = c.height = size; const x = c.getContext("2d"), im = x.createImageData(size, size); let s = seed; const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < size * size; i++) { const v = 128 + (rnd() - 0.5) * strength; im.data[i * 4] = im.data[i * 4 + 1] = im.data[i * 4 + 2] = v; im.data[i * 4 + 3] = 255; } x.putImageData(im, 0, 0); const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; };

  function buildJet() {
    const g = new THREE.Group(), ivory = new THREE.MeshStandardMaterial({ color: 0xf5f0e4, roughness: 0.82, metalness: 0, side: THREE.DoubleSide }), shade = new THREE.MeshStandardMaterial({ color: 0xe3dccb, roughness: 0.9, side: THREE.DoubleSide }), dark = new THREE.MeshStandardMaterial({ color: 0x2b3a31, roughness: 0.35, metalness: 0.2 });
    // fuselage: a lofted body, nose to +x (length 2)
    const prof = [[1.02, 0], [0.96, 0.025], [0.8, 0.075], [0.5, 0.12], [0.1, 0.15], [-0.35, 0.15], [-0.75, 0.125], [-0.98, 0.09], [-1.0, 0.0]].map(([x, r]) => new THREE.Vector2(r, x));
    const fus = new THREE.Mesh(new THREE.LatheGeometry(prof, 28), ivory); fus.rotation.z = -Math.PI / 2; fus.scale.set(1, 1, 0.78); fus.castShadow = true; g.add(fus);
    const wingShape = (pts, depth) => { const sh = new THREE.Shape(); pts.forEach(([x, y], i) => (i ? sh.lineTo(x, y) : sh.moveTo(x, y))); sh.closePath(); const m = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth, bevelEnabled: false }), ivory); m.castShadow = true; return m; };
    // delta wings, tailplanes (flat sheets in the x–z plane) and canted tail fins, mirrored left/right
    for (const sgn of [1, -1]) {
      const rx = sgn > 0 ? -Math.PI / 2 : Math.PI / 2;
      const w = wingShape([[0.4, 0], [-0.55, 0], [-0.62, 0.72], [-0.12, 0.6]], 0.018); w.rotation.x = rx; w.position.y = -0.015; g.add(w);
      const tail = wingShape([[-0.7, 0], [-1.02, 0], [-1.08, 0.3], [-0.84, 0.28]], 0.014); tail.rotation.x = rx; tail.position.y = -0.012; g.add(tail);
      const fin = wingShape([[-0.5, 0], [-0.98, 0], [-0.96, 0.5], [-0.7, 0.5]], 0.014); fin.position.set(0, 0.07, sgn * 0.1); fin.rotation.x = sgn * 0.42; g.add(fin);
    }
    const can = new THREE.Mesh(new THREE.SphereGeometry(0.2, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2), dark); can.scale.set(1.5, 0.72, 0.7); can.position.set(0.34, 0.1, 0); can.castShadow = true; g.add(can);
    const noz = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.09, 0.12, 14), new THREE.MeshStandardMaterial({ color: 0x6f6c63, roughness: 0.6 })); noz.rotation.z = Math.PI / 2; noz.position.set(-1.03, 0, 0); g.add(noz);
    const keel = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.03, 0.2), shade); keel.position.set(0.15, -0.14, 0); g.add(keel);
    // folded-paper edges
    g.traverse((o) => { if (o.isMesh && o.geometry && o !== can && o !== noz) { const e = new THREE.LineSegments(new THREE.EdgesGeometry(o.geometry, 38), new THREE.LineBasicMaterial({ color: 0x163524, transparent: true, opacity: 0.28 })); o.add(e); } });
    return g;
  }
  function ribbonSlot(front, back) {
    const N = 240, geo = new THREE.BufferGeometry(), pos = new Float32Array((N + 1) * 2 * 3), uv = new Float32Array((N + 1) * 2 * 2), idx = [];
    for (let i = 0; i <= N; i++) { uv.set([i / N * 8, 0, i / N * 8, 1], i * 4); if (i < N) { const a = i * 2; idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3); } }
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3)); geo.setAttribute("uv", new THREE.BufferAttribute(uv, 2)); geo.setIndex(idx);
    const mf = new THREE.Mesh(geo, front), mb = new THREE.Mesh(geo, back); mf.castShadow = mb.castShadow = true; mf.receiveShadow = true; mf.frustumCulled = mb.frustumCulled = false; mf.visible = mb.visible = false;
    S.add(mf); S.add(mb); return { geo, N, mf, mb, frame: null, curve: null };
  }
  function init(w, h) {
    W = w; H = h; cv = document.createElement("canvas"); cv.width = W; cv.height = H;
    R = new THREE.WebGLRenderer({ canvas: cv, alpha: true, antialias: true, preserveDrawingBuffer: true }); R.setPixelRatio(1); R.setSize(W, H, false); R.setClearColor(0x000000, 0);
    R.shadowMap.enabled = true; R.shadowMap.type = THREE.PCFSoftShadowMap; R.outputEncoding = THREE.LinearEncoding; R.toneMapping = THREE.NoToneMapping;
    S = new THREE.Scene(); BASE = new THREE.PerspectiveCamera(FOV, W / H, 0.1, 200); BASE.position.set(0, 1.2, DIST); BASE.lookAt(0, 0, 0); BASE.updateMatrixWorld(); BASE.updateProjectionMatrix();
    CAM = BASE.clone();
    const key = new THREE.DirectionalLight(0xfff1d8, 1.25); key.position.set(-4.5, 8, 13); key.castShadow = true; key.shadow.mapSize.set(2048, 2048); const sc = key.shadow.camera; sc.left = -14; sc.right = 14; sc.top = 9; sc.bottom = -9; sc.near = 1; sc.far = 40; key.shadow.bias = -0.0004; key.shadow.radius = 5; key.shadow.normalBias = 0.02; S.add(key); P.key = key;
    S.add(new THREE.HemisphereLight(0xfffaf0, 0xb9a98a, 0.62));
    const back = new THREE.DirectionalLight(0xdfe9e2, 0.3); back.position.set(6, 2, -4); S.add(back);
    const wall = new THREE.Mesh(new THREE.PlaneGeometry(80, 50), new THREE.ShadowMaterial({ color: 0x3a2f1a, opacity: 0.14 })); wall.position.z = -1.1; wall.receiveShadow = true; S.add(wall); P.wall = wall;
    const bump = paperTex(7, 256, 70); bump.repeat.set(3, 1);
    const front = new THREE.MeshStandardMaterial({ color: 0x2f5a43, roughness: 0.78, metalness: 0, bumpMap: bump, bumpScale: 0.28 }), backM = new THREE.MeshStandardMaterial({ color: 0x10281b, roughness: 0.85, metalness: 0, side: THREE.BackSide, bumpMap: bump, bumpScale: 0.28 });
    for (let i = 0; i < 3; i++) slots.push(ribbonSlot(front, backM));
    P.jet = buildJet(); P.jet.visible = false; S.add(P.jet);
    const stone = new THREE.MeshStandardMaterial({ color: 0xefe6d2, roughness: 1, bumpMap: paperTex(11, 256, 40), bumpScale: 0.12 });
    for (let i = 0; i < 5; i++) { const sh = new THREE.Shape(), r = 0.06, w2 = 0.5, h2 = 0.5; sh.moveTo(-w2 + r, -h2); sh.lineTo(w2 - r, -h2); sh.quadraticCurveTo(w2, -h2, w2, -h2 + r); sh.lineTo(w2, h2 - r); sh.quadraticCurveTo(w2, h2, w2 - r, h2); sh.lineTo(-w2 + r, h2); sh.quadraticCurveTo(-w2, h2, -w2, h2 - r); sh.lineTo(-w2, -h2 + r); sh.quadraticCurveTo(-w2, -h2, -w2 + r, -h2);
      const m = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: 1, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.03, bevelSegments: 2 }), stone); m.castShadow = m.receiveShadow = true; m.visible = false; m.geometry.translate(0, 0, -0.5); S.add(m); plinths.push(m); }
    // the logo, extruded
    const segs = parseLogo(LOGO_D), shape = new THREE.Shape(), cx = LOGO_VB.x + LOGO_VB.w / 2, cy = LOGO_VB.y + LOGO_VB.h / 2, fx = (x) => x - cx, fy = (y) => -(y - cy);
    segs.forEach((sg) => { if (sg[0] === "M") shape.moveTo(fx(sg[1]), fy(sg[2])); else if (sg[0] === "L") shape.lineTo(fx(sg[1]), fy(sg[2])); else shape.bezierCurveTo(fx(sg[1]), fy(sg[2]), fx(sg[3]), fy(sg[4]), fx(sg[5]), fy(sg[6])); });
    shape.closePath();
    const lg = new THREE.ExtrudeGeometry(shape, { depth: 34, bevelEnabled: true, bevelThickness: 7, bevelSize: 6, bevelSegments: 4, curveSegments: 24 }); lg.translate(0, 0, -17); lg.scale(1 / 520, 1 / 520, 1 / 520);
    P.logo = new THREE.Mesh(lg, new THREE.MeshStandardMaterial({ color: 0x0f2a1b, roughness: 0.6, metalness: 0.02, bumpMap: bump, bumpScale: 0.5 })); P.logo.castShadow = true; P.logo.visible = false; S.add(P.logo);
    ready = true;
  }
  /** screen fraction → world position at depth z (using the static base camera) */
  function world(xf, yf, z) { const v = V(xf * 2 - 1, 1 - yf * 2, 0.5).unproject(BASE), d = v.sub(BASE.position).normalize(), t = (z - BASE.position.z) / d.z; return BASE.position.clone().add(d.multiplyScalar(t)); }
  /** units: how many world units is one "unit" of min(W,H)=1 at depth z (for sizes) */
  function unit(z) { const hh = 2 * (DIST - z) * Math.tan((FOV * Math.PI) / 360); return hh / (H) * Math.min(W, H); }
  function begin(k, t, drift) {
    if (!ready || W !== k.W || H !== k.H) { if (!ready) init(k.W, k.H); }
    slots.forEach((s) => (s.mf.visible = s.mb.visible = false)); plinths.forEach((p) => (p.visible = false)); P.jet.visible = false; P.logo.visible = false; used = false;
    setDrift(t, drift === undefined ? 1 : drift); P.wall.visible = true; P.key.castShadow = true;
  }
  /** the render camera drifts a little (parallax); drift 0 = exactly the static base camera, so 2D and 3D line up */
  function setDrift(t, dr) { CAM.position.set(Math.sin(t * 0.35) * 0.55 * dr, 1.2 + Math.cos(t * 0.28) * 0.25 * dr, DIST + Math.sin(t * 0.2) * 0.3 * dr); CAM.lookAt(0, 0, 0); CAM.updateMatrixWorld(); }
  /** arc-length fraction of the ribbon at waypoints idxs of pts (so a scene can park things on the stops) */
  function stops(pts, idxs) {
    if (!ready) return idxs.map((j) => j / (pts.length - 1));
    const w = pts.map(([xf, yf, z]) => world(xf, yf, z || 0)), curve = new THREE.CatmullRomCurve3(w, false, "centripetal"), n = 800, samp = curve.getSpacedPoints(n);
    return idxs.map((j) => { let best = 0, bd = 1e9; samp.forEach((p, i) => { const dd = p.distanceToSquared(w[j]); if (dd < bd) { bd = dd; best = i; } }); return best / n; });
  }
  /** a ribbon along waypoints [[xf,yf,z],…] from fraction s0 to s1 of its length; width in units of min(W,H) */
  function ribbon(i, o) {
    const sl = slots[i]; if (!sl || o.s1 - o.s0 < 0.002) return; used = true;
    const pts = o.pts.map(([xf, yf, z]) => world(xf, yf, z || 0)); const curve = new THREE.CatmullRomCurve3(pts, false, "centripetal"); sl.curve = curve;
    const wz = unit(o.pts[Math.floor(o.pts.length / 2)][2] || 0), width = o.width * wz, N = sl.N, pos = sl.geo.attributes.position.array, frames = [], tw = o.twist ?? 0.6, ph = o.phase ?? 0;
    for (let n = 0; n <= N; n++) {
      const u = n / N, s = o.s0 + (o.s1 - o.s0) * u, c = curve.getPointAt(Math.max(0, Math.min(1, s))), T = curve.getTangentAt(Math.max(0, Math.min(1, s))).normalize();
      let nrm = V(0, 0.28, 1); nrm.sub(T.clone().multiplyScalar(nrm.dot(T))).normalize(); const side = V().crossVectors(T, nrm).normalize();
      const head = o.curl ? THREE.MathUtils.smoothstep(u, 0.82, 1) : 0, tail = o.curl ? THREE.MathUtils.smoothstep(1 - u, 0.9, 1) * 0 : 0;
      const phi = tw * Math.PI * 2 * s + ph + head * 2.2, cp = Math.cos(phi), sp = Math.sin(phi);
      const sd = side.clone().multiplyScalar(cp).add(nrm.clone().multiplyScalar(sp)), nn = nrm.clone().multiplyScalar(cp).sub(side.clone().multiplyScalar(sp));
      const taper = Math.min(1, u / (o.tapeIn ?? 0.06) + 0.1, (1 - u) / (o.tapeOut ?? 0.04) + 0.18), hw = (width / 2) * Math.max(0.12, taper), rip = Math.sin(s * 40 + ph) * width * 0.012;
      const p = c.clone().add(nn.clone().multiplyScalar(rip)); frames.push({ p, T, n: nn, s });
      const a = p.clone().add(sd.clone().multiplyScalar(hw)), b = p.clone().sub(sd.clone().multiplyScalar(hw)); pos.set([a.x, a.y, a.z, b.x, b.y, b.z], n * 6);
    }
    sl.frame = frames; sl.geo.attributes.position.needsUpdate = true; sl.geo.computeVertexNormals(); sl.mf.visible = sl.mb.visible = true;
  }
  /** the jet riding a ribbon's frame at ribbon-fraction f (0..1 of the drawn part), lifted off the face by `lift` (units), with pitch/roll offsets */
  function jetOn(i, o) {
    const sl = slots[i]; if (!sl || !sl.frame) return; const n = Math.max(0, Math.min(sl.N, Math.round(o.f * sl.N))), fr = sl.frame[n], wz = unit(0), L = o.size * wz;
    const T = fr.T, N = fr.n.clone(); const X = T.clone(), Y = N.clone().sub(X.clone().multiplyScalar(N.dot(X))).normalize(), Z = V().crossVectors(X, Y).normalize();
    const m = new THREE.Matrix4().makeBasis(X, Y, Z), q = new THREE.Quaternion().setFromRotationMatrix(m); const adj = new THREE.Quaternion().setFromEuler(new THREE.Euler(o.roll || 0, o.yaw || 0, o.pitch || 0)); q.multiply(adj);
    P.jet.position.copy(fr.p).add(N.multiplyScalar((o.lift || 0) * wz)); P.jet.quaternion.copy(q); P.jet.scale.setScalar(L / 2); P.jet.visible = true; used = true; return { x: P.jet.position.x, y: P.jet.position.y, z: P.jet.position.z };
  }
  function jetAt(xf, yf, z, o) { P.jet.position.copy(world(xf, yf, z)); P.jet.quaternion.setFromEuler(new THREE.Euler(o.roll || 0, o.yaw || 0, o.pitch || 0)); P.jet.scale.setScalar((o.size * unit(z)) / 2); P.jet.visible = true; used = true; }
  function plinth(i, xf, yf, wu, hu, z, depthU, sc) { const p = plinths[i]; if (!p || (sc !== undefined && sc <= 0.01)) return; const f = sc === undefined ? 1 : sc, u = unit(z || 0), c = world(xf, yf, z || 0); p.position.set(c.x, c.y - (hu * u * f) / 2, c.z); p.scale.set(wu * u * f, hu * u * f, (depthU || wu * 0.7) * u * f); p.visible = true; used = true; }
  function logo(xf, yf, z, sizeU, o) { const c = world(xf, yf, z || 0), u = unit(z || 0); P.logo.position.copy(c); P.logo.scale.setScalar(sizeU * u * (o.scale ?? 1)); P.logo.rotation.set(o.rx || 0, o.ry || 0, o.rz || 0); P.logo.visible = (o.scale ?? 1) > 0.01; used = P.logo.visible || used; }
  function wall(on) { P.wall.visible = on; }
  /** render and composite onto g (at its current transform); returns false when nothing was drawn */
  function draw(g, W2, H2, alpha) { if (!ready || !used) return false; R.render(S, CAM); g.save(); if (alpha !== undefined) g.globalAlpha *= alpha; g.drawImage(cv, 0, 0, W2, H2); g.restore(); return true; }
  /** a world point → screen px (with the drifting camera) */
  function project(v) { const p = v.clone().project(CAM); return [(p.x + 1) / 2 * W, (1 - p.y) / 2 * H]; }
  function frameAt(i, f) { const sl = slots[i]; if (!sl || !sl.frame) return null; return sl.frame[Math.max(0, Math.min(sl.N, Math.round(f * sl.N)))]; }
  return { begin, setDrift, stops, ribbon, jetOn, jetAt, plinth, logo, wall, draw, project, world, unit, frameAt, get ready() { return ready; }, P };
})();
