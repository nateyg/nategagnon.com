/* <glossy-icon shape="moon|walkie|knight|bookmark" speed="0.55" finish="mirror|satin">
   Glossy jet-black 3D hero icon. Auto-rotates; drag to spin. Requires window.THREE (r128). */
(function () {
  'use strict';

  var TAU = Math.PI * 2;

  function whenThree(cb) {
    if (window.THREE) return cb();
    var t = setInterval(function () {
      if (window.THREE) { clearInterval(t); cb(); }
    }, 40);
  }

  function roundedRect(THREE, w, h, r) {
    var s = new THREE.Shape();
    var x = -w / 2, y = -h / 2;
    s.moveTo(x + r, y);
    s.lineTo(x + w - r, y);
    s.quadraticCurveTo(x + w, y, x + w, y + r);
    s.lineTo(x + w, y + h - r);
    s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    s.lineTo(x + r, y + h);
    s.quadraticCurveTo(x, y + h, x, y + h - r);
    s.lineTo(x, y + r);
    s.quadraticCurveTo(x, y, x + r, y);
    return s;
  }

  function roundedPoly(THREE, pts, r) {
    var s = new THREE.Shape();
    var n = pts.length;
    function pt(i) { return pts[(i + n) % n]; }
    for (var i = 0; i < n; i++) {
      var p = pt(i), prev = pt(i - 1), next = pt(i + 1);
      var v1 = [p[0] - prev[0], p[1] - prev[1]];
      var v2 = [next[0] - p[0], next[1] - p[1]];
      var l1 = Math.hypot(v1[0], v1[1]), l2 = Math.hypot(v2[0], v2[1]);
      var rr = Math.min(r, l1 / 2, l2 / 2);
      var a = [p[0] - v1[0] / l1 * rr, p[1] - v1[1] / l1 * rr];
      var b = [p[0] + v2[0] / l2 * rr, p[1] + v2[1] / l2 * rr];
      if (i === 0) s.moveTo(a[0], a[1]); else s.lineTo(a[0], a[1]);
      s.quadraticCurveTo(p[0], p[1], b[0], b[1]);
    }
    s.closePath();
    return s;
  }

  var EXTRUDE = {
    depth: 0.34,
    bevelEnabled: true,
    bevelThickness: 0.16,
    bevelSize: 0.14,
    bevelSegments: 6,
    curveSegments: 48
  };

  function extrude(THREE, shape, mat, opts) {
    var geo = new THREE.ExtrudeGeometry(shape, Object.assign({}, EXTRUDE, opts || {}));
    return new THREE.Mesh(geo, mat);
  }

  var BUILDERS = {

    moon: function (THREE, mat) {
      var R = 1.0, r = 0.82, d = 0.42;
      var x = (d * d + R * R - r * r) / (2 * d);
      var y = Math.sqrt(R * R - x * x);
      var aO = Math.atan2(y, x);          // angle of intersection on outer circle
      var aI = Math.atan2(y, x - d);      // angle on inner circle
      var s = new THREE.Shape();
      s.absarc(0, 0, R, aO, TAU - aO, false);   // long way around the outer edge
      s.absarc(d, 0, r, -aI, aI, true);         // concave inner edge (through 180deg)
      var g = new THREE.Group();
      g.add(extrude(THREE, s, mat, { depth: 0.30, bevelThickness: 0.18, bevelSize: 0.15 }));
      return g;
    },

    walkie: function (THREE, mat) {
      var g = new THREE.Group();
      var L = -0.5, R = 0.5, B = -1.0, T = 0.52, cr = 0.14;   // body
      var aR = -0.32, aT = 1.34, ar = 0.09;                    // antenna (flush left)
      var s = new THREE.Shape();
      s.moveTo(L + cr, B);
      s.lineTo(R - cr, B);
      s.quadraticCurveTo(R, B, R, B + cr);
      s.lineTo(R, T - cr);
      s.quadraticCurveTo(R, T, R - cr, T);
      s.lineTo(aR, T);
      s.lineTo(aR, aT - ar);
      s.quadraticCurveTo(aR, aT, aR - ar, aT);
      s.lineTo(L + ar, aT);
      s.quadraticCurveTo(L, aT, L, aT - ar);
      s.lineTo(L, B + cr);
      s.quadraticCurveTo(L, B, L + cr, B);
      s.closePath();
      g.add(extrude(THREE, s, mat));

      // speaker grille: three raised bars on the face
      var frontZ = 0.34 + 0.13; // body depth + most of front bevel
      var ys = [-0.02, -0.20, -0.38];
      for (var i = 0; i < ys.length; i++) {
        var bar = extrude(THREE, roundedRect(THREE, 0.52, 0.075, 0.037), mat, {
          depth: 0.02, bevelThickness: 0.035, bevelSize: 0.028, bevelSegments: 3
        });
        bar.position.set(0.02, ys[i], frontZ);
        g.add(bar);
      }
      // small round button above the grille
      var btn = new THREE.Mesh(new THREE.SphereGeometry(0.075, 24, 16), mat);
      btn.scale.z = 0.55;
      btn.position.set(-0.24, 0.26, frontZ + 0.02);
      g.add(btn);
      // knob on top edge
      var knob = new THREE.Mesh(new THREE.CylinderGeometry(0.095, 0.095, 0.16, 32), mat);
      knob.position.set(0.26, T + 0.06, 0.17);
      g.add(knob);
      return g;
    },

    knight: function (THREE, mat) {
      var P = [
        [-0.62, -1.00], [0.62, -1.00], [0.62, -0.78], [0.40, -0.70],
        [0.44, -0.28], [0.52, 0.18], [0.46, 0.55], [0.26, 0.80],
        [0.16, 0.84], [0.22, 1.04], [0.06, 0.90], [-0.02, 1.00], [-0.12, 0.84],
        [-0.30, 0.72], [-0.52, 0.50], [-0.68, 0.28], [-0.72, 0.16], [-0.58, 0.10],
        [-0.44, 0.14], [-0.34, 0.04], [-0.26, -0.14], [-0.22, -0.40], [-0.34, -0.70],
        [-0.62, -0.78]
      ];
      var s = new THREE.Shape();
      s.moveTo(P[0][0], P[0][1]);
      for (var i = 1; i < P.length; i++) s.lineTo(P[i][0], P[i][1]);
      s.closePath();
      var g = new THREE.Group();
      g.add(extrude(THREE, s, mat, { bevelThickness: 0.12, bevelSize: 0.10 }));
      return g;
    },

    bookmark: function (THREE, mat) {
      var w = 0.62, h = 1.0, notch = 0.52, rr = 0.16;
      var s = new THREE.Shape();
      s.moveTo(-w, -h);
      s.lineTo(0, -h + notch);
      s.lineTo(w, -h);
      s.lineTo(w, h - rr);
      s.quadraticCurveTo(w, h, w - rr, h);
      s.lineTo(-w + rr, h);
      s.quadraticCurveTo(-w, h, -w, h - rr);
      s.closePath();
      var g = new THREE.Group();
      g.add(extrude(THREE, s, mat, { depth: 0.28, bevelThickness: 0.17, bevelSize: 0.15 }));
      return g;
    },

    ctradio: function (THREE, mat) {
      var g = new THREE.Group();
      g.add(extrude(THREE, roundedRect(THREE, 1.34, 1.9, 0.2), mat));
      var frontZ = 0.34 + 0.13;
      // antenna: stick + ball
      var stick = extrude(THREE, roundedRect(THREE, 0.1, 0.6, 0.05), mat, { depth: 0.14, bevelThickness: 0.05, bevelSize: 0.04, bevelSegments: 3 });
      stick.position.set(-0.42, 1.2, 0.08);
      g.add(stick);
      var ball = new THREE.Mesh(new THREE.SphereGeometry(0.18, 32, 24), mat);
      ball.position.set(-0.42, 1.56, 0.17);
      g.add(ball);
      // four squares: two raised solid, two recessed frames
      var sq = 0.5, cx = 0.295, ry1 = 0.5, ry2 = -0.06;
      var solidAt = [[cx, ry1], [-cx, ry2]];
      var frameAt = [[-cx, ry1], [cx, ry2]];
      for (var i = 0; i < 2; i++) {
        var solid = extrude(THREE, roundedRect(THREE, sq, sq, 0.07), mat, { depth: 0.06, bevelThickness: 0.05, bevelSize: 0.04, bevelSegments: 3 });
        solid.position.set(solidAt[i][0], solidAt[i][1], frontZ);
        g.add(solid);
        var outer = roundedRect(THREE, sq, sq, 0.07);
        outer.holes.push(roundedRect(THREE, sq - 0.17, sq - 0.17, 0.05));
        var frame = extrude(THREE, outer, mat, { depth: 0.04, bevelThickness: 0.04, bevelSize: 0.03, bevelSegments: 3 });
        frame.position.set(frameAt[i][0], frameAt[i][1], frontZ);
        g.add(frame);
      }
      // smile
      var a1 = Math.PI + 0.5, a2 = TAU - 0.5;
      var smile = new THREE.Shape();
      smile.absarc(0, 0, 0.34, a1, a2, false);
      smile.absarc(0, 0, 0.26, a2, a1, true);
      var sm = extrude(THREE, smile, mat, { depth: 0.04, bevelThickness: 0.04, bevelSize: 0.03, bevelSegments: 3 });
      sm.position.set(0, -0.36, frontZ);
      g.add(sm);
      return g;
    },

    hncircle: function (THREE, mat) {
      return BUILDERS._hn(THREE, mat, false);
    },

    hncircle2: function (THREE, mat) {
      return BUILDERS._hn(THREE, mat, true);
    },

    _hn: function (THREE, mat, doubleSided) {
      var g = new THREE.Group();
      // seamless solid disc: cylinders + torus edges
      var R = 1.13, e = 0.16, half = 0.29;
      var dg = new THREE.Group();
      dg.add(new THREE.Mesh(new THREE.CylinderGeometry(R, R, 2 * (half - e), 96), mat));
      dg.add(new THREE.Mesh(new THREE.CylinderGeometry(R - e, R - e, 2 * half, 96), mat));
      for (var ti = 0; ti < 2; ti++) {
        var edge = new THREE.Mesh(new THREE.TorusGeometry(R - e, e, 24, 96), mat);
        edge.rotation.x = Math.PI / 2;
        edge.position.y = ti === 0 ? half - e : -(half - e);
        dg.add(edge);
      }
      dg.rotation.x = Math.PI / 2;
      dg.position.z = 0.13;
      g.add(dg);
      var frontZ = 0.26 + 0.12;
      var faces = doubleSided ? [1, -1] : [1];
      for (var fi = 0; fi < faces.length; fi++) {
        var dir = faces[fi];
        // disc spans z -0.16..0.42; embed details 0.04 into each face
        var fz = dir === 1 ? frontZ : -0.12;
        var face = new THREE.Group();
        // raised rim ring
        var ring = new THREE.Shape();
        ring.absarc(0, 0, 0.93, 0, TAU, false);
        var hole = new THREE.Path();
        hole.absarc(0, 0, 0.8, 0, TAU, true);
        ring.holes.push(hole);
        var rim = extrude(THREE, ring, mat, { depth: 0.03, bevelThickness: 0.035, bevelSize: 0.03, bevelSegments: 3 });
        face.add(rim);
        // glyph: arc + stem + two dots
        var arc = new THREE.Shape();
        arc.absarc(0, -0.13, 0.52, 0, Math.PI, false);
        arc.absarc(0, -0.13, 0.34, Math.PI, 0, true);
        var am = extrude(THREE, arc, mat, { depth: 0.05, bevelThickness: 0.045, bevelSize: 0.035, bevelSegments: 3 });
        face.add(am);
        var stem = extrude(THREE, roundedRect(THREE, 0.18, 0.58, 0.03), mat, { depth: 0.05, bevelThickness: 0.045, bevelSize: 0.035, bevelSegments: 3 });
        stem.position.set(-0.43, 0.16, 0);
        face.add(stem);
        for (var j = 0; j < 2; j++) {
          var dot = new THREE.Mesh(new THREE.SphereGeometry(0.14, 24, 16), mat);
          dot.scale.z = 0.55;
          dot.position.set(j === 0 ? -0.43 : 0.43, -0.4, 0.03);
          face.add(dot);
        }
        if (dir === -1) face.rotation.y = Math.PI;
        face.position.z = fz;
        g.add(face);
      }
      return g;
    },

    moontile: function (THREE, mat) {
      var g = new THREE.Group();
      g.add(extrude(THREE, roundedRect(THREE, 1.95, 1.45, 0.45), mat, { depth: 0.3, bevelThickness: 0.2, bevelSize: 0.18, curveSegments: 64 }));
      var frontZ = 0.3 + 0.17;
      var tri = roundedPoly(THREE, [[-0.26, 0.4], [0.42, 0], [-0.26, -0.4]], 0.1);
      var t = extrude(THREE, tri, mat, { depth: 0.07, bevelThickness: 0.06, bevelSize: 0.05, bevelSegments: 4 });
      t.position.set(-0.02, 0, frontZ);
      g.add(t);
      // craters: raised rim rings, front and back faces
      function crater(x, y, r, z) {
        var ring = new THREE.Mesh(new THREE.TorusGeometry(r, r * 0.34, 14, 40), mat);
        ring.scale.z = 0.75;
        ring.position.set(x, y, z);
        g.add(ring);
      }
      var faceZ = 0.3 + 0.2, backZ = -0.2; // true front/back faces
      // front (scattered around the play mark)
      crater(-0.6, 0.28, 0.13, faceZ);
      crater(-0.52, -0.36, 0.09, faceZ);
      crater(0.52, 0.36, 0.11, faceZ);
      crater(0.6, -0.24, 0.15, faceZ);
      crater(0.05, 0.42, 0.07, faceZ);
      crater(-0.12, -0.44, 0.06, faceZ);
      // back
      crater(0.22, 0.15, 0.2, backZ);
      crater(-0.48, -0.28, 0.12, backZ);
      crater(-0.38, 0.36, 0.09, backZ);
      crater(0.58, -0.34, 0.08, backZ);
      crater(0.08, -0.32, 0.06, backZ);
      return g;
    },

    checkmate: function (THREE, mat) {
      var g = BUILDERS.knight(THREE, mat);
      // pedestal base
      var base = extrude(THREE, roundedRect(THREE, 1.5, 0.34, 0.1), mat, { depth: 0.44, bevelThickness: 0.1, bevelSize: 0.08, bevelSegments: 4 });
      base.position.set(0, -1.14, -0.05);
      g.add(base);
      // headphones: band over the crown + ear cups
      var band = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.07, 20, 48, Math.PI), mat);
      band.rotation.y = Math.PI / 2;
      band.position.set(-0.05, 0.38, 0.17);
      g.add(band);
      for (var k = 0; k < 2; k++) {
        var cup = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.16, 0.14, 32), mat);
        cup.rotation.x = k === 0 ? Math.PI / 2 : -Math.PI / 2;
        cup.position.set(-0.05, 0.38, 0.17 + (k === 0 ? 0.5 : -0.5));
        g.add(cup);
      }
      return g;
    },

    hiword: function (THREE, mat) {
      var g = new THREE.Group();
      var w = 0.26, r = 0.14, R = r + w, y0 = 0.1, yB = -0.72, yT = 0.78;
      var xL = -0.78;
      var cx = xL + w + r;
      var aJoin = Math.acos(-r / R);
      var yI = y0 + R * Math.sin(aJoin);
      // letter h — simple outline (no self-intersection)
      var h = new THREE.Shape();
      h.moveTo(xL, yB);
      h.lineTo(xL, yT);
      h.lineTo(xL + w, yT);
      h.lineTo(xL + w, yI);
      h.absarc(cx, y0, R, aJoin, 0, true);
      h.lineTo(cx + R, yB);
      h.lineTo(cx + r, yB);
      h.lineTo(cx + r, y0);
      h.absarc(cx, y0, r, 0, Math.PI, false);
      h.lineTo(xL + w, yB);
      h.closePath();
      g.add(extrude(THREE, h, mat, { bevelThickness: 0.13, bevelSize: 0.11 }));
      // letter i — stem + dot
      var ix = cx + R + 0.24;
      var stem = extrude(THREE, roundedRect(THREE, w, y0 + 0.36 - yB, 0.06), mat, { bevelThickness: 0.13, bevelSize: 0.11 });
      stem.position.set(ix + w / 2, (y0 + 0.36 + yB) / 2, 0);
      g.add(stem);
      var dot = new THREE.Mesh(new THREE.SphereGeometry(0.19, 32, 24), mat);
      dot.position.set(ix + w / 2, yT - 0.06, 0.17);
      g.add(dot);
      return g;
    }
  };

  // Dark studio environment with bright softbox strips -> crisp travelling highlights
  function buildEnvTexture(THREE, renderer) {
    var scene = new THREE.Scene();
    scene.background = new THREE.Color(0x070707);
    function strip(w, h, x, y, z, c) {
      var m = new THREE.Mesh(
        new THREE.PlaneGeometry(w, h),
        new THREE.MeshBasicMaterial({ color: c, side: THREE.DoubleSide })
      );
      m.position.set(x, y, z);
      m.lookAt(0, 0, 0);
      scene.add(m);
    }
    strip(4.5, 1.5, -4, 5, 3, new THREE.Color(10, 10, 10));   // key, top-left
    strip(3, 0.7, 5, 2, -2, new THREE.Color(4, 4, 4.4));      // cool rim, right-rear
    strip(2, 0.5, 0, -4, 4, new THREE.Color(0.9, 0.9, 0.9));  // low front fill
    strip(1.0, 5, 4, 0.5, 4, new THREE.Color(3.4, 1.5, 1.0)); // vertical stripe, front-right — warm coral glint
    strip(1.1, 3.5, -4.5, -0.5, -2.5, new THREE.Color(1.7, 1.2, 3.4)); // violet rim, left-rear
    var pmrem = new THREE.PMREMGenerator(renderer);
    var tex = pmrem.fromScene(scene, 0.035).texture;
    pmrem.dispose();
    return tex;
  }

  // ---- shared renderer: one WebGL context serves every icon (avoids browser context cap) ----
  var SHARED = null;
  function getShared(THREE) {
    if (SHARED) return SHARED;
    var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(1); // we control resolution manually
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.95;
    SHARED = { renderer: renderer, env: buildEnvTexture(THREE, renderer), items: [], raf: 0 };
    function loop() {
      SHARED.raf = requestAnimationFrame(loop);
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      for (var i = 0; i < SHARED.items.length; i++) {
        var it = SHARED.items[i];
        if (!it.tick()) continue;
        var w = Math.round(it.host.clientWidth * dpr), h = Math.round(it.host.clientHeight * dpr);
        if (!w || !h) continue;
        var cv = renderer.domElement;
        if (cv.width !== w || cv.height !== h) renderer.setSize(w, h, false);
        if (it.canvas.width !== w || it.canvas.height !== h) { it.canvas.width = w; it.canvas.height = h; }
        it.camera.aspect = w / h;
        it.camera.updateProjectionMatrix();
        renderer.render(it.scene, it.camera);
        it.ctx.clearRect(0, 0, w, h);
        it.ctx.drawImage(cv, 0, 0);
      }
    }
    loop();
    return SHARED;
  }

  var PHASE = { moon: -0.55, walkie: 0.45, knight: -0.25, bookmark: 0.85, ctradio: 0.3, hncircle: -0.4, hncircle2: -0.4, moontile: 0.6, checkmate: -0.15, hiword: 0.35 };

  var FINISH = {
    mirror: { roughness: 0.07, clearcoatRoughness: 0.04 },
    satin: { roughness: 0.24, clearcoatRoughness: 0.16 }
  };

  class GlossyIcon extends HTMLElement {
    static get observedAttributes() { return ['speed', 'finish']; }

    connectedCallback() {
      if (this._started) return;
      this._started = true;
      this.style.display = 'block';
      if (!this.style.width) this.style.width = '100%';
      if (!this.style.height) this.style.height = '100%';
      if (getComputedStyle(this).position === 'static') this.style.position = 'relative';
      this.style.touchAction = 'none';
      this.style.cursor = 'grab';
      this._speed = parseFloat(this.getAttribute('speed'));
      if (!isFinite(this._speed)) this._speed = 0.55;
      var self = this;
      whenThree(function () { self._setup(); });
    }

    attributeChangedCallback(name, _old, val) {
      if (name === 'speed') {
        var v = parseFloat(val);
        this._speed = isFinite(v) ? v : 0.55;
      } else if (name === 'finish' && this._mat) {
        var f = FINISH[val] || FINISH.mirror;
        this._mat.roughness = f.roughness;
        this._mat.clearcoatRoughness = f.clearcoatRoughness;
        this._mat.needsUpdate = true;
      }
    }

    _setup() {
      if (!this.isConnected) return;
      var THREE = window.THREE;
      var shared = getShared(THREE);
      var cv = document.createElement('canvas');
      cv.style.position = 'absolute';
      cv.style.inset = '0';
      cv.style.width = '100%';
      cv.style.height = '100%';
      this.appendChild(cv);
      var ctx = cv.getContext('2d');

      var scene = new THREE.Scene();
      var camera = new THREE.PerspectiveCamera(32, 1, 0.1, 50);
      // zoom > 1 pulls the camera in so the object fills more of the element,
      // letting the host shrink the element (and thus the touch target)
      // without shrinking the rendered object
      var zoom = parseFloat(this.getAttribute('zoom'));
      if (!isFinite(zoom) || zoom <= 0) zoom = 1;
      camera.position.set(0, 0.12 / zoom, 6.2 / zoom);

      var env = shared.env;
      var fin = FINISH[this.getAttribute('finish')] || FINISH.mirror;
      var mat = this._mat = new THREE.MeshPhysicalMaterial({
        color: 0x020203,
        metalness: 0.0,
        roughness: fin.roughness,
        clearcoat: 1.0,
        clearcoatRoughness: fin.clearcoatRoughness,
        envMap: env,
        envMapIntensity: 1.0
      });

      var key = new THREE.DirectionalLight(0xffffff, 0.25);
      key.position.set(-3, 5, 4);
      scene.add(key);
      scene.add(new THREE.AmbientLight(0xffffff, 0.04));

      var shapeName = this.getAttribute('shape') || 'moon';
      var group = (BUILDERS[shapeName] || BUILDERS.moon)(THREE, mat);
      var pivot = new THREE.Group();
      var box = new THREE.Box3().setFromObject(group);
      var ctr = box.getCenter(new THREE.Vector3());
      var size = box.getSize(new THREE.Vector3());
      group.position.sub(ctr);
      pivot.scale.setScalar(2.2 / Math.max(size.x, size.y));
      pivot.add(group);
      scene.add(pivot);

      var self = this;

      // rotation state
      var baseTilt = -0.12;
      var rotY = parseFloat(this.getAttribute('phase'));
      if (!isFinite(rotY)) rotY = PHASE[shapeName] || 0;
      var rotX = baseTilt;
      var velY = this._speed;
      var dragging = false, lastX = 0, lastY = 0, lastT = 0;

      this.addEventListener('pointerdown', function (e) {
        dragging = true;
        lastX = e.clientX; lastY = e.clientY; lastT = performance.now();
        self.style.cursor = 'grabbing';
        self.setPointerCapture(e.pointerId);
      });
      this.addEventListener('pointermove', function (e) {
        if (!dragging) return;
        var now = performance.now();
        var dt = Math.max(8, now - lastT) / 1000;
        var dx = e.clientX - lastX, dy = e.clientY - lastY;
        rotY += dx * 0.012;
        rotX = Math.max(-0.9, Math.min(0.9, rotX + dy * 0.008));
        velY = Math.max(-9, Math.min(9, (dx * 0.012) / dt));
        lastX = e.clientX; lastY = e.clientY; lastT = now;
      });
      function endDrag() {
        dragging = false;
        self.style.cursor = 'grab';
      }
      this.addEventListener('pointerup', endDrag);
      this.addEventListener('pointercancel', endDrag);

      var clock = new THREE.Clock();
      this._item = {
        host: this, canvas: cv, ctx: ctx, scene: scene, camera: camera,
        tick: function () {
          var dt = Math.min(0.05, clock.getDelta());
          if (!dragging) {
            velY += (self._speed - velY) * Math.min(1, dt * 1.4);
            rotY += velY * dt;
            rotX += (baseTilt - rotX) * Math.min(1, dt * 2.5);
          }
          pivot.rotation.set(rotX, rotY, 0);
          return true;
        }
      };
      shared.items.push(this._item);
    }

    disconnectedCallback() {
      if (SHARED && this._item) {
        var ix = SHARED.items.indexOf(this._item);
        if (ix >= 0) SHARED.items.splice(ix, 1);
        this._item = null;
      }
      this._started = false;
    }
  }

  if (!customElements.get('glossy-icon')) customElements.define('glossy-icon', GlossyIcon);
})();
