/* eslint-disable */
// patched version that has following changes:
// - "fs" dependency commented out
// - esm export

const libheif = (() => {
  var _r
  var Se =
    typeof document != 'undefined'
      ? (_r = document.currentScript) == null
        ? void 0
        : _r.src
      : void 0
  return (
    typeof __filename != 'undefined' && (Se || (Se = __filename)),
    function (Xr = {}) {
      var or,
        a = Xr,
        sr,
        Ae,
        va = new Promise((e, r) => {
          ;(sr = e), (Ae = r)
        }),
        Gr = typeof window == 'object',
        he = typeof importScripts == 'function',
        ue =
          typeof process == 'object' &&
          typeof process.versions == 'object' &&
          typeof process.versions.node == 'string',
        fr = Object.assign({}, a),
        lr = [],
        Re = './this.program',
        dr = (e, r) => {
          throw r
        },
        U = ''
      function Kr(e) {
        return a.locateFile ? a.locateFile(e, U) : U + e
      }
      var te, Me, me
      if (ue) {
        var je = {} /*require("fs")*/,
          cr = require('path')
        ;(U = __dirname + '/'),
          (te = (e, r) => (
            (e = We(e) ? new URL(e) : cr.normalize(e)),
            je.readFileSync(e, r ? void 0 : 'utf8')
          )),
          (me = e => {
            var r = te(e, !0)
            return r.buffer || (r = new Uint8Array(r)), r
          }),
          (Me = (e, r, t, i = !0) => {
            ;(e = We(e) ? new URL(e) : cr.normalize(e)),
              je.readFile(e, i ? void 0 : 'utf8', (n, o) => {
                n ? t(n) : r(i ? o.buffer : o)
              })
          }),
          !a.thisProgram &&
            process.argv.length > 1 &&
            (Re = process.argv[1].replace(/\\/g, '/')),
          (lr = process.argv.slice(2)),
          (dr = (e, r) => {
            throw ((process.exitCode = e), r)
          })
      } else
        (Gr || he) &&
          (he
            ? (U = self.location.href)
            : typeof document != 'undefined' &&
              document.currentScript &&
              (U = document.currentScript.src),
          Se && (U = Se),
          U.startsWith('blob:')
            ? (U = '')
            : (U = U.substr(0, U.replace(/[?#].*/, '').lastIndexOf('/') + 1)),
          (te = e => {
            var r = new XMLHttpRequest()
            return r.open('GET', e, !1), r.send(null), r.responseText
          }),
          he &&
            (me = e => {
              var r = new XMLHttpRequest()
              return (
                r.open('GET', e, !1),
                (r.responseType = 'arraybuffer'),
                r.send(null),
                new Uint8Array(r.response)
              )
            }),
          (Me = (e, r, t) => {
            if (We(e)) {
              var i = new XMLHttpRequest()
              i.open('GET', e, !0),
                (i.responseType = 'arraybuffer'),
                (i.onload = () => {
                  if (i.status == 200 || (i.status == 0 && i.response)) {
                    r(i.response)
                    return
                  }
                  t()
                }),
                (i.onerror = t),
                i.send(null)
              return
            }
            fetch(e, { credentials: 'same-origin' })
              .then(n =>
                n.ok
                  ? n.arrayBuffer()
                  : Promise.reject(new Error(n.status + ' : ' + n.url))
              )
              .then(r, t)
          }))
      var Oe = a.print || console.log.bind(console),
        ie = a.printErr || console.error.bind(console)
      Object.assign(a, fr),
        (fr = null),
        a.arguments && (lr = a.arguments),
        a.thisProgram && (Re = a.thisProgram),
        a.quit && (dr = a.quit)
      var Ie
      a.wasmBinary && (Ie = a.wasmBinary)
      var ve,
        hr = !1,
        Jr,
        S,
        M,
        H,
        ae,
        w,
        k,
        ur,
        mr
      function vr() {
        var e = ve.buffer
        ;(a.HEAP8 = S = new Int8Array(e)),
          (a.HEAP16 = H = new Int16Array(e)),
          (a.HEAPU8 = M = new Uint8Array(e)),
          (a.HEAPU16 = ae = new Uint16Array(e)),
          (a.HEAP32 = w = new Int32Array(e)),
          (a.HEAPU32 = k = new Uint32Array(e)),
          (a.HEAPF32 = ur = new Float32Array(e)),
          (a.HEAPF64 = mr = new Float64Array(e))
      }
      var gr = [],
        pr = [],
        yr = [],
        Qr = !1
      function Zr() {
        if (a.preRun)
          for (
            typeof a.preRun == 'function' && (a.preRun = [a.preRun]);
            a.preRun.length;

          )
            tt(a.preRun.shift())
        Ne(gr)
      }
      function et() {
        ;(Qr = !0),
          !a.noFSInit && !_.init.initialized && _.init(),
          (_.ignorePermissions = !1),
          Y.init(),
          Ne(pr)
      }
      function rt() {
        if (a.postRun)
          for (
            typeof a.postRun == 'function' && (a.postRun = [a.postRun]);
            a.postRun.length;

          )
            at(a.postRun.shift())
        Ne(yr)
      }
      function tt(e) {
        gr.unshift(e)
      }
      function it(e) {
        pr.unshift(e)
      }
      function at(e) {
        yr.unshift(e)
      }
      var G = 0,
        ze = null,
        ne = null
      function ga(e) {
        return e
      }
      function Ue(e) {
        var r
        G++, (r = a.monitorRunDependencies) == null || r.call(a, G)
      }
      function ge(e) {
        var t
        if (
          (G--,
          (t = a.monitorRunDependencies) == null || t.call(a, G),
          G == 0 && (ze !== null && (clearInterval(ze), (ze = null)), ne))
        ) {
          var r = ne
          ;(ne = null), r()
        }
      }
      function pe(e) {
        var t
        ;(t = a.onAbort) == null || t.call(a, e),
          (e = 'Aborted(' + e + ')'),
          ie(e),
          (hr = !0),
          (Jr = 1),
          (e += '. Build with -sASSERTIONS for more info.')
        var r = new WebAssembly.RuntimeError(e)
        throw (Ae(r), r)
      }
      var nt = 'data:application/octet-stream;base64,',
        _t = e => e.startsWith(nt),
        We = e => e.startsWith('file://')
      function ot() {
        var e = 'libheif.wasm'
        return _t(e) ? e : Kr(e)
      }
      var ye
      function st(e) {
        if (e == ye && Ie) return new Uint8Array(Ie)
        if (me) return me(e)
        throw 'sync fetching of the wasm failed: you can preload it to Module["wasmBinary"] manually, or emcc.py will do that for you when generating HTML (but not JS)'
      }
      function ft(e, r) {
        var t,
          i = st(e)
        t = new WebAssembly.Module(i)
        var n = new WebAssembly.Instance(t, r)
        return [n, t]
      }
      function lt() {
        return { a: da }
      }
      function dt() {
        var e = lt()
        function r(i, n) {
          return (
            (s = i.exports),
            (ve = s.P),
            vr(),
            (Sr = s.S),
            it(s.Q),
            ge('wasm-instantiate'),
            s
          )
        }
        if ((Ue('wasm-instantiate'), a.instantiateWasm))
          try {
            return a.instantiateWasm(e, r)
          } catch (i) {
            ie(`Module.instantiateWasm callback failed with error: ${i}`), Ae(i)
          }
        ye || (ye = ot())
        var t = ft(ye, e)
        return r(t[0])
      }
      var E,
        A,
        Ne = e => {
          for (; e.length > 0; ) e.shift()(a)
        },
        pa = a.noExitRuntime || !0,
        wr =
          typeof TextDecoder != 'undefined' ? new TextDecoder('utf8') : void 0,
        Q = (e, r, t) => {
          for (var i = r + t, n = r; e[n] && !(n >= i); ) ++n
          if (n - r > 16 && e.buffer && wr) return wr.decode(e.subarray(r, n))
          for (var o = ''; r < n; ) {
            var f = e[r++]
            if (!(f & 128)) {
              o += String.fromCharCode(f)
              continue
            }
            var l = e[r++] & 63
            if ((f & 224) == 192) {
              o += String.fromCharCode(((f & 31) << 6) | l)
              continue
            }
            var d = e[r++] & 63
            if (
              ((f & 240) == 224
                ? (f = ((f & 15) << 12) | (l << 6) | d)
                : (f = ((f & 7) << 18) | (l << 12) | (d << 6) | (e[r++] & 63)),
              f < 65536)
            )
              o += String.fromCharCode(f)
            else {
              var c = f - 65536
              o += String.fromCharCode(55296 | (c >> 10), 56320 | (c & 1023))
            }
          }
          return o
        },
        K = (e, r) => (e ? Q(M, e, r) : ''),
        ct = (e, r, t, i) => {
          pe(
            `Assertion failed: ${K(e)}, at: ` +
              [r ? K(r) : 'unknown filename', t, i ? K(i) : 'unknown function']
          )
        }
      class ht {
        constructor(r) {
          ;(this.excPtr = r), (this.ptr = r - 24)
        }
        set_type(r) {
          k[(this.ptr + 4) >> 2] = r
        }
        get_type() {
          return k[(this.ptr + 4) >> 2]
        }
        set_destructor(r) {
          k[(this.ptr + 8) >> 2] = r
        }
        get_destructor() {
          return k[(this.ptr + 8) >> 2]
        }
        set_caught(r) {
          ;(r = r ? 1 : 0), (S[this.ptr + 12] = r)
        }
        get_caught() {
          return S[this.ptr + 12] != 0
        }
        set_rethrown(r) {
          ;(r = r ? 1 : 0), (S[this.ptr + 13] = r)
        }
        get_rethrown() {
          return S[this.ptr + 13] != 0
        }
        init(r, t) {
          this.set_adjusted_ptr(0), this.set_type(r), this.set_destructor(t)
        }
        set_adjusted_ptr(r) {
          k[(this.ptr + 16) >> 2] = r
        }
        get_adjusted_ptr() {
          return k[(this.ptr + 16) >> 2]
        }
        get_exception_ptr() {
          var r = ha(this.get_type())
          if (r) return k[this.excPtr >> 2]
          var t = this.get_adjusted_ptr()
          return t !== 0 ? t : this.excPtr
        }
      }
      var br = 0,
        ut = 0,
        mt = (e, r, t) => {
          var i = new ht(e)
          throw (i.init(r, t), (br = e), ut++, br)
        }
      function we() {
        var e = w[+O.varargs >> 2]
        return (O.varargs += 4), e
      }
      var Z = we,
        T = {
          isAbs: e => e.charAt(0) === '/',
          splitPath: e => {
            var r =
              /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/
            return r.exec(e).slice(1)
          },
          normalizeArray: (e, r) => {
            for (var t = 0, i = e.length - 1; i >= 0; i--) {
              var n = e[i]
              n === '.'
                ? e.splice(i, 1)
                : n === '..'
                  ? (e.splice(i, 1), t++)
                  : t && (e.splice(i, 1), t--)
            }
            if (r) for (; t; t--) e.unshift('..')
            return e
          },
          normalize: e => {
            var r = T.isAbs(e),
              t = e.substr(-1) === '/'
            return (
              (e = T.normalizeArray(
                e.split('/').filter(i => !!i),
                !r
              ).join('/')),
              !e && !r && (e = '.'),
              e && t && (e += '/'),
              (r ? '/' : '') + e
            )
          },
          dirname: e => {
            var r = T.splitPath(e),
              t = r[0],
              i = r[1]
            return !t && !i
              ? '.'
              : (i && (i = i.substr(0, i.length - 1)), t + i)
          },
          basename: e => {
            if (e === '/') return '/'
            ;(e = T.normalize(e)), (e = e.replace(/\/$/, ''))
            var r = e.lastIndexOf('/')
            return r === -1 ? e : e.substr(r + 1)
          },
          join: (...e) => T.normalize(e.join('/')),
          join2: (e, r) => T.normalize(e + '/' + r),
        },
        vt = () => {
          if (
            typeof crypto == 'object' &&
            typeof crypto.getRandomValues == 'function'
          )
            return i => crypto.getRandomValues(i)
          if (ue)
            try {
              var e = require('crypto'),
                r = e.randomFillSync
              if (r) return i => e.randomFillSync(i)
              var t = e.randomBytes
              return i => (i.set(t(i.byteLength)), i)
            } catch {}
          pe('initRandomDevice')
        },
        Er = e => (Er = vt())(e),
        L = {
          resolve: (...e) => {
            for (var r = '', t = !1, i = e.length - 1; i >= -1 && !t; i--) {
              var n = i >= 0 ? e[i] : _.cwd()
              if (typeof n != 'string')
                throw new TypeError('Arguments to path.resolve must be strings')
              if (!n) return ''
              ;(r = n + '/' + r), (t = T.isAbs(n))
            }
            return (
              (r = T.normalizeArray(
                r.split('/').filter(o => !!o),
                !t
              ).join('/')),
              (t ? '/' : '') + r || '.'
            )
          },
          relative: (e, r) => {
            ;(e = L.resolve(e).substr(1)), (r = L.resolve(r).substr(1))
            function t(c) {
              for (var u = 0; u < c.length && c[u] === ''; u++);
              for (var v = c.length - 1; v >= 0 && c[v] === ''; v--);
              return u > v ? [] : c.slice(u, v - u + 1)
            }
            for (
              var i = t(e.split('/')),
                n = t(r.split('/')),
                o = Math.min(i.length, n.length),
                f = o,
                l = 0;
              l < o;
              l++
            )
              if (i[l] !== n[l]) {
                f = l
                break
              }
            for (var d = [], l = f; l < i.length; l++) d.push('..')
            return (d = d.concat(n.slice(f))), d.join('/')
          },
        },
        He = [],
        Le = e => {
          for (var r = 0, t = 0; t < e.length; ++t) {
            var i = e.charCodeAt(t)
            i <= 127
              ? r++
              : i <= 2047
                ? (r += 2)
                : i >= 55296 && i <= 57343
                  ? ((r += 4), ++t)
                  : (r += 3)
          }
          return r
        },
        Be = (e, r, t, i) => {
          if (!(i > 0)) return 0
          for (var n = t, o = t + i - 1, f = 0; f < e.length; ++f) {
            var l = e.charCodeAt(f)
            if (l >= 55296 && l <= 57343) {
              var d = e.charCodeAt(++f)
              l = (65536 + ((l & 1023) << 10)) | (d & 1023)
            }
            if (l <= 127) {
              if (t >= o) break
              r[t++] = l
            } else if (l <= 2047) {
              if (t + 1 >= o) break
              ;(r[t++] = 192 | (l >> 6)), (r[t++] = 128 | (l & 63))
            } else if (l <= 65535) {
              if (t + 2 >= o) break
              ;(r[t++] = 224 | (l >> 12)),
                (r[t++] = 128 | ((l >> 6) & 63)),
                (r[t++] = 128 | (l & 63))
            } else {
              if (t + 3 >= o) break
              ;(r[t++] = 240 | (l >> 18)),
                (r[t++] = 128 | ((l >> 12) & 63)),
                (r[t++] = 128 | ((l >> 6) & 63)),
                (r[t++] = 128 | (l & 63))
            }
          }
          return (r[t] = 0), t - n
        }
      function be(e, r, t) {
        var i = t > 0 ? t : Le(e) + 1,
          n = new Array(i),
          o = Be(e, n, 0, n.length)
        return r && (n.length = o), n
      }
      var gt = () => {
          if (!He.length) {
            var e = null
            if (ue) {
              var r = 256,
                t = Buffer.alloc(r),
                i = 0,
                n = process.stdin.fd
              try {
                i = je.readSync(n, t, 0, r)
              } catch (o) {
                if (o.toString().includes('EOF')) i = 0
                else throw o
              }
              i > 0 && (e = t.slice(0, i).toString('utf-8'))
            } else
              typeof window != 'undefined' &&
                typeof window.prompt == 'function' &&
                ((e = window.prompt('Input: ')),
                e !== null &&
                  (e += `
`))
            if (!e) return null
            He = be(e, !0)
          }
          return He.shift()
        },
        Y = {
          ttys: [],
          init() {},
          shutdown() {},
          register(e, r) {
            ;(Y.ttys[e] = { input: [], output: [], ops: r }),
              _.registerDevice(e, Y.stream_ops)
          },
          stream_ops: {
            open(e) {
              var r = Y.ttys[e.node.rdev]
              if (!r) throw new _.ErrnoError(43)
              ;(e.tty = r), (e.seekable = !1)
            },
            close(e) {
              e.tty.ops.fsync(e.tty)
            },
            fsync(e) {
              e.tty.ops.fsync(e.tty)
            },
            read(e, r, t, i, n) {
              if (!e.tty || !e.tty.ops.get_char) throw new _.ErrnoError(60)
              for (var o = 0, f = 0; f < i; f++) {
                var l
                try {
                  l = e.tty.ops.get_char(e.tty)
                } catch {
                  throw new _.ErrnoError(29)
                }
                if (l === void 0 && o === 0) throw new _.ErrnoError(6)
                if (l == null) break
                o++, (r[t + f] = l)
              }
              return o && (e.node.timestamp = Date.now()), o
            },
            write(e, r, t, i, n) {
              if (!e.tty || !e.tty.ops.put_char) throw new _.ErrnoError(60)
              try {
                for (var o = 0; o < i; o++) e.tty.ops.put_char(e.tty, r[t + o])
              } catch {
                throw new _.ErrnoError(29)
              }
              return i && (e.node.timestamp = Date.now()), o
            },
          },
          default_tty_ops: {
            get_char(e) {
              return gt()
            },
            put_char(e, r) {
              r === null || r === 10
                ? (Oe(Q(e.output, 0)), (e.output = []))
                : r != 0 && e.output.push(r)
            },
            fsync(e) {
              e.output &&
                e.output.length > 0 &&
                (Oe(Q(e.output, 0)), (e.output = []))
            },
            ioctl_tcgets(e) {
              return {
                c_iflag: 25856,
                c_oflag: 5,
                c_cflag: 191,
                c_lflag: 35387,
                c_cc: [
                  3, 28, 127, 21, 4, 0, 1, 0, 17, 19, 26, 0, 18, 15, 23, 22, 0,
                  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                ],
              }
            },
            ioctl_tcsets(e, r, t) {
              return 0
            },
            ioctl_tiocgwinsz(e) {
              return [24, 80]
            },
          },
          default_tty1_ops: {
            put_char(e, r) {
              r === null || r === 10
                ? (ie(Q(e.output, 0)), (e.output = []))
                : r != 0 && e.output.push(r)
            },
            fsync(e) {
              e.output &&
                e.output.length > 0 &&
                (ie(Q(e.output, 0)), (e.output = []))
            },
          },
        },
        kr = e => {
          pe()
        },
        b = {
          ops_table: null,
          mount(e) {
            return b.createNode(null, '/', 16895, 0)
          },
          createNode(e, r, t, i) {
            if (_.isBlkdev(t) || _.isFIFO(t)) throw new _.ErrnoError(63)
            b.ops_table ||
              (b.ops_table = {
                dir: {
                  node: {
                    getattr: b.node_ops.getattr,
                    setattr: b.node_ops.setattr,
                    lookup: b.node_ops.lookup,
                    mknod: b.node_ops.mknod,
                    rename: b.node_ops.rename,
                    unlink: b.node_ops.unlink,
                    rmdir: b.node_ops.rmdir,
                    readdir: b.node_ops.readdir,
                    symlink: b.node_ops.symlink,
                  },
                  stream: { llseek: b.stream_ops.llseek },
                },
                file: {
                  node: {
                    getattr: b.node_ops.getattr,
                    setattr: b.node_ops.setattr,
                  },
                  stream: {
                    llseek: b.stream_ops.llseek,
                    read: b.stream_ops.read,
                    write: b.stream_ops.write,
                    allocate: b.stream_ops.allocate,
                    mmap: b.stream_ops.mmap,
                    msync: b.stream_ops.msync,
                  },
                },
                link: {
                  node: {
                    getattr: b.node_ops.getattr,
                    setattr: b.node_ops.setattr,
                    readlink: b.node_ops.readlink,
                  },
                  stream: {},
                },
                chrdev: {
                  node: {
                    getattr: b.node_ops.getattr,
                    setattr: b.node_ops.setattr,
                  },
                  stream: _.chrdev_stream_ops,
                },
              })
            var n = _.createNode(e, r, t, i)
            return (
              _.isDir(n.mode)
                ? ((n.node_ops = b.ops_table.dir.node),
                  (n.stream_ops = b.ops_table.dir.stream),
                  (n.contents = {}))
                : _.isFile(n.mode)
                  ? ((n.node_ops = b.ops_table.file.node),
                    (n.stream_ops = b.ops_table.file.stream),
                    (n.usedBytes = 0),
                    (n.contents = null))
                  : _.isLink(n.mode)
                    ? ((n.node_ops = b.ops_table.link.node),
                      (n.stream_ops = b.ops_table.link.stream))
                    : _.isChrdev(n.mode) &&
                      ((n.node_ops = b.ops_table.chrdev.node),
                      (n.stream_ops = b.ops_table.chrdev.stream)),
              (n.timestamp = Date.now()),
              e && ((e.contents[r] = n), (e.timestamp = n.timestamp)),
              n
            )
          },
          getFileDataAsTypedArray(e) {
            return e.contents
              ? e.contents.subarray
                ? e.contents.subarray(0, e.usedBytes)
                : new Uint8Array(e.contents)
              : new Uint8Array(0)
          },
          expandFileStorage(e, r) {
            var t = e.contents ? e.contents.length : 0
            if (!(t >= r)) {
              var i = 1024 * 1024
              ;(r = Math.max(r, (t * (t < i ? 2 : 1.125)) >>> 0)),
                t != 0 && (r = Math.max(r, 256))
              var n = e.contents
              ;(e.contents = new Uint8Array(r)),
                e.usedBytes > 0 && e.contents.set(n.subarray(0, e.usedBytes), 0)
            }
          },
          resizeFileStorage(e, r) {
            if (e.usedBytes != r)
              if (r == 0) (e.contents = null), (e.usedBytes = 0)
              else {
                var t = e.contents
                ;(e.contents = new Uint8Array(r)),
                  t && e.contents.set(t.subarray(0, Math.min(r, e.usedBytes))),
                  (e.usedBytes = r)
              }
          },
          node_ops: {
            getattr(e) {
              var r = {}
              return (
                (r.dev = _.isChrdev(e.mode) ? e.id : 1),
                (r.ino = e.id),
                (r.mode = e.mode),
                (r.nlink = 1),
                (r.uid = 0),
                (r.gid = 0),
                (r.rdev = e.rdev),
                _.isDir(e.mode)
                  ? (r.size = 4096)
                  : _.isFile(e.mode)
                    ? (r.size = e.usedBytes)
                    : _.isLink(e.mode)
                      ? (r.size = e.link.length)
                      : (r.size = 0),
                (r.atime = new Date(e.timestamp)),
                (r.mtime = new Date(e.timestamp)),
                (r.ctime = new Date(e.timestamp)),
                (r.blksize = 4096),
                (r.blocks = Math.ceil(r.size / r.blksize)),
                r
              )
            },
            setattr(e, r) {
              r.mode !== void 0 && (e.mode = r.mode),
                r.timestamp !== void 0 && (e.timestamp = r.timestamp),
                r.size !== void 0 && b.resizeFileStorage(e, r.size)
            },
            lookup(e, r) {
              throw _.genericErrors[44]
            },
            mknod(e, r, t, i) {
              return b.createNode(e, r, t, i)
            },
            rename(e, r, t) {
              if (_.isDir(e.mode)) {
                var i
                try {
                  i = _.lookupNode(r, t)
                } catch {}
                if (i) for (var n in i.contents) throw new _.ErrnoError(55)
              }
              delete e.parent.contents[e.name],
                (e.parent.timestamp = Date.now()),
                (e.name = t),
                (r.contents[t] = e),
                (r.timestamp = e.parent.timestamp)
            },
            unlink(e, r) {
              delete e.contents[r], (e.timestamp = Date.now())
            },
            rmdir(e, r) {
              var t = _.lookupNode(e, r)
              for (var i in t.contents) throw new _.ErrnoError(55)
              delete e.contents[r], (e.timestamp = Date.now())
            },
            readdir(e) {
              var r = ['.', '..']
              for (var t of Object.keys(e.contents)) r.push(t)
              return r
            },
            symlink(e, r, t) {
              var i = b.createNode(e, r, 41471, 0)
              return (i.link = t), i
            },
            readlink(e) {
              if (!_.isLink(e.mode)) throw new _.ErrnoError(28)
              return e.link
            },
          },
          stream_ops: {
            read(e, r, t, i, n) {
              var o = e.node.contents
              if (n >= e.node.usedBytes) return 0
              var f = Math.min(e.node.usedBytes - n, i)
              if (f > 8 && o.subarray) r.set(o.subarray(n, n + f), t)
              else for (var l = 0; l < f; l++) r[t + l] = o[n + l]
              return f
            },
            write(e, r, t, i, n, o) {
              if ((r.buffer === S.buffer && (o = !1), !i)) return 0
              var f = e.node
              if (
                ((f.timestamp = Date.now()),
                r.subarray && (!f.contents || f.contents.subarray))
              ) {
                if (o)
                  return (
                    (f.contents = r.subarray(t, t + i)), (f.usedBytes = i), i
                  )
                if (f.usedBytes === 0 && n === 0)
                  return (f.contents = r.slice(t, t + i)), (f.usedBytes = i), i
                if (n + i <= f.usedBytes)
                  return f.contents.set(r.subarray(t, t + i), n), i
              }
              if (
                (b.expandFileStorage(f, n + i),
                f.contents.subarray && r.subarray)
              )
                f.contents.set(r.subarray(t, t + i), n)
              else for (var l = 0; l < i; l++) f.contents[n + l] = r[t + l]
              return (f.usedBytes = Math.max(f.usedBytes, n + i)), i
            },
            llseek(e, r, t) {
              var i = r
              if (
                (t === 1
                  ? (i += e.position)
                  : t === 2 && _.isFile(e.node.mode) && (i += e.node.usedBytes),
                i < 0)
              )
                throw new _.ErrnoError(28)
              return i
            },
            allocate(e, r, t) {
              b.expandFileStorage(e.node, r + t),
                (e.node.usedBytes = Math.max(e.node.usedBytes, r + t))
            },
            mmap(e, r, t, i, n) {
              if (!_.isFile(e.node.mode)) throw new _.ErrnoError(43)
              var o,
                f,
                l = e.node.contents
              if (!(n & 2) && l.buffer === S.buffer)
                (f = !1), (o = l.byteOffset)
              else {
                if (
                  ((t > 0 || t + r < l.length) &&
                    (l.subarray
                      ? (l = l.subarray(t, t + r))
                      : (l = Array.prototype.slice.call(l, t, t + r))),
                  (f = !0),
                  (o = kr(r)),
                  !o)
                )
                  throw new _.ErrnoError(48)
                S.set(l, o)
              }
              return { ptr: o, allocated: f }
            },
            msync(e, r, t, i, n) {
              return b.stream_ops.write(e, r, 0, i, t, !1), 0
            },
          },
        },
        pt = (e, r, t, i) => {
          var n = i ? '' : `al ${e}`
          Me(
            e,
            o => {
              r(new Uint8Array(o)), n && ge(n)
            },
            o => {
              if (t) t()
              else throw `Loading data file "${e}" failed.`
            }
          ),
            n && Ue(n)
        },
        yt = (e, r, t, i, n, o) => {
          _.createDataFile(e, r, t, i, n, o)
        },
        wt = a.preloadPlugins || [],
        bt = (e, r, t, i) => {
          typeof Browser != 'undefined' && Browser.init()
          var n = !1
          return (
            wt.forEach(o => {
              n || (o.canHandle(r) && (o.handle(e, r, t, i), (n = !0)))
            }),
            n
          )
        },
        Et = (e, r, t, i, n, o, f, l, d, c) => {
          var u = r ? L.resolve(T.join2(e, r)) : e,
            v = `cp ${u}`
          function g(p) {
            function y($) {
              c == null || c(),
                l || yt(e, r, $, i, n, d),
                o == null || o(),
                ge(v)
            }
            bt(p, u, y, () => {
              f == null || f(), ge(v)
            }) || y(p)
          }
          Ue(v), typeof t == 'string' ? pt(t, g, f) : g(t)
        },
        kt = e => {
          var r = { r: 0, 'r+': 2, w: 577, 'w+': 578, a: 1089, 'a+': 1090 },
            t = r[e]
          if (typeof t == 'undefined')
            throw new Error(`Unknown file open mode: ${e}`)
          return t
        },
        Ve = (e, r) => {
          var t = 0
          return e && (t |= 365), r && (t |= 146), t
        },
        _ = {
          root: null,
          mounts: [],
          devices: {},
          streams: [],
          nextInode: 1,
          nameTable: null,
          currentPath: '/',
          initialized: !1,
          ignorePermissions: !0,
          ErrnoError: class {
            constructor(e) {
              ;(this.name = 'ErrnoError'), (this.errno = e)
            }
          },
          genericErrors: {},
          filesystems: null,
          syncFSRequests: 0,
          FSStream: class {
            constructor() {
              this.shared = {}
            }
            get object() {
              return this.node
            }
            set object(e) {
              this.node = e
            }
            get isRead() {
              return (this.flags & 2097155) !== 1
            }
            get isWrite() {
              return (this.flags & 2097155) !== 0
            }
            get isAppend() {
              return this.flags & 1024
            }
            get flags() {
              return this.shared.flags
            }
            set flags(e) {
              this.shared.flags = e
            }
            get position() {
              return this.shared.position
            }
            set position(e) {
              this.shared.position = e
            }
          },
          FSNode: class {
            constructor(e, r, t, i) {
              e || (e = this),
                (this.parent = e),
                (this.mount = e.mount),
                (this.mounted = null),
                (this.id = _.nextInode++),
                (this.name = r),
                (this.mode = t),
                (this.node_ops = {}),
                (this.stream_ops = {}),
                (this.rdev = i),
                (this.readMode = 365),
                (this.writeMode = 146)
            }
            get read() {
              return (this.mode & this.readMode) === this.readMode
            }
            set read(e) {
              e ? (this.mode |= this.readMode) : (this.mode &= ~this.readMode)
            }
            get write() {
              return (this.mode & this.writeMode) === this.writeMode
            }
            set write(e) {
              e ? (this.mode |= this.writeMode) : (this.mode &= ~this.writeMode)
            }
            get isFolder() {
              return _.isDir(this.mode)
            }
            get isDevice() {
              return _.isChrdev(this.mode)
            }
          },
          lookupPath(e, r = {}) {
            if (((e = L.resolve(e)), !e)) return { path: '', node: null }
            var t = { follow_mount: !0, recurse_count: 0 }
            if (((r = Object.assign(t, r)), r.recurse_count > 8))
              throw new _.ErrnoError(32)
            for (
              var i = e.split('/').filter(v => !!v), n = _.root, o = '/', f = 0;
              f < i.length;
              f++
            ) {
              var l = f === i.length - 1
              if (l && r.parent) break
              if (
                ((n = _.lookupNode(n, i[f])),
                (o = T.join2(o, i[f])),
                _.isMountpoint(n) &&
                  (!l || (l && r.follow_mount)) &&
                  (n = n.mounted.root),
                !l || r.follow)
              )
                for (var d = 0; _.isLink(n.mode); ) {
                  var c = _.readlink(o)
                  o = L.resolve(T.dirname(o), c)
                  var u = _.lookupPath(o, {
                    recurse_count: r.recurse_count + 1,
                  })
                  if (((n = u.node), d++ > 40)) throw new _.ErrnoError(32)
                }
            }
            return { path: o, node: n }
          },
          getPath(e) {
            for (var r; ; ) {
              if (_.isRoot(e)) {
                var t = e.mount.mountpoint
                return r ? (t[t.length - 1] !== '/' ? `${t}/${r}` : t + r) : t
              }
              ;(r = r ? `${e.name}/${r}` : e.name), (e = e.parent)
            }
          },
          hashName(e, r) {
            for (var t = 0, i = 0; i < r.length; i++)
              t = ((t << 5) - t + r.charCodeAt(i)) | 0
            return ((e + t) >>> 0) % _.nameTable.length
          },
          hashAddNode(e) {
            var r = _.hashName(e.parent.id, e.name)
            ;(e.name_next = _.nameTable[r]), (_.nameTable[r] = e)
          },
          hashRemoveNode(e) {
            var r = _.hashName(e.parent.id, e.name)
            if (_.nameTable[r] === e) _.nameTable[r] = e.name_next
            else
              for (var t = _.nameTable[r]; t; ) {
                if (t.name_next === e) {
                  t.name_next = e.name_next
                  break
                }
                t = t.name_next
              }
          },
          lookupNode(e, r) {
            var t = _.mayLookup(e)
            if (t) throw new _.ErrnoError(t)
            for (
              var i = _.hashName(e.id, r), n = _.nameTable[i];
              n;
              n = n.name_next
            ) {
              var o = n.name
              if (n.parent.id === e.id && o === r) return n
            }
            return _.lookup(e, r)
          },
          createNode(e, r, t, i) {
            var n = new _.FSNode(e, r, t, i)
            return _.hashAddNode(n), n
          },
          destroyNode(e) {
            _.hashRemoveNode(e)
          },
          isRoot(e) {
            return e === e.parent
          },
          isMountpoint(e) {
            return !!e.mounted
          },
          isFile(e) {
            return (e & 61440) === 32768
          },
          isDir(e) {
            return (e & 61440) === 16384
          },
          isLink(e) {
            return (e & 61440) === 40960
          },
          isChrdev(e) {
            return (e & 61440) === 8192
          },
          isBlkdev(e) {
            return (e & 61440) === 24576
          },
          isFIFO(e) {
            return (e & 61440) === 4096
          },
          isSocket(e) {
            return (e & 49152) === 49152
          },
          flagsToPermissionString(e) {
            var r = ['r', 'w', 'rw'][e & 3]
            return e & 512 && (r += 'w'), r
          },
          nodePermissions(e, r) {
            return _.ignorePermissions
              ? 0
              : (r.includes('r') && !(e.mode & 292)) ||
                  (r.includes('w') && !(e.mode & 146)) ||
                  (r.includes('x') && !(e.mode & 73))
                ? 2
                : 0
          },
          mayLookup(e) {
            if (!_.isDir(e.mode)) return 54
            var r = _.nodePermissions(e, 'x')
            return r || (e.node_ops.lookup ? 0 : 2)
          },
          mayCreate(e, r) {
            try {
              var t = _.lookupNode(e, r)
              return 20
            } catch {}
            return _.nodePermissions(e, 'wx')
          },
          mayDelete(e, r, t) {
            var i
            try {
              i = _.lookupNode(e, r)
            } catch (o) {
              return o.errno
            }
            var n = _.nodePermissions(e, 'wx')
            if (n) return n
            if (t) {
              if (!_.isDir(i.mode)) return 54
              if (_.isRoot(i) || _.getPath(i) === _.cwd()) return 10
            } else if (_.isDir(i.mode)) return 31
            return 0
          },
          mayOpen(e, r) {
            return e
              ? _.isLink(e.mode)
                ? 32
                : _.isDir(e.mode) &&
                    (_.flagsToPermissionString(r) !== 'r' || r & 512)
                  ? 31
                  : _.nodePermissions(e, _.flagsToPermissionString(r))
              : 44
          },
          MAX_OPEN_FDS: 4096,
          nextfd() {
            for (var e = 0; e <= _.MAX_OPEN_FDS; e++)
              if (!_.streams[e]) return e
            throw new _.ErrnoError(33)
          },
          getStreamChecked(e) {
            var r = _.getStream(e)
            if (!r) throw new _.ErrnoError(8)
            return r
          },
          getStream: e => _.streams[e],
          createStream(e, r = -1) {
            return (
              (e = Object.assign(new _.FSStream(), e)),
              r == -1 && (r = _.nextfd()),
              (e.fd = r),
              (_.streams[r] = e),
              e
            )
          },
          closeStream(e) {
            _.streams[e] = null
          },
          dupStream(e, r = -1) {
            var i, n
            var t = _.createStream(e, r)
            return (
              (n = (i = t.stream_ops) == null ? void 0 : i.dup) == null ||
                n.call(i, t),
              t
            )
          },
          chrdev_stream_ops: {
            open(e) {
              var t, i
              var r = _.getDevice(e.node.rdev)
              ;(e.stream_ops = r.stream_ops),
                (i = (t = e.stream_ops).open) == null || i.call(t, e)
            },
            llseek() {
              throw new _.ErrnoError(70)
            },
          },
          major: e => e >> 8,
          minor: e => e & 255,
          makedev: (e, r) => (e << 8) | r,
          registerDevice(e, r) {
            _.devices[e] = { stream_ops: r }
          },
          getDevice: e => _.devices[e],
          getMounts(e) {
            for (var r = [], t = [e]; t.length; ) {
              var i = t.pop()
              r.push(i), t.push(...i.mounts)
            }
            return r
          },
          syncfs(e, r) {
            typeof e == 'function' && ((r = e), (e = !1)),
              _.syncFSRequests++,
              _.syncFSRequests > 1 &&
                ie(
                  `warning: ${_.syncFSRequests} FS.syncfs operations in flight at once, probably just doing extra work`
                )
            var t = _.getMounts(_.root.mount),
              i = 0
            function n(f) {
              return _.syncFSRequests--, r(f)
            }
            function o(f) {
              if (f) return o.errored ? void 0 : ((o.errored = !0), n(f))
              ++i >= t.length && n(null)
            }
            t.forEach(f => {
              if (!f.type.syncfs) return o(null)
              f.type.syncfs(f, e, o)
            })
          },
          mount(e, r, t) {
            var i = t === '/',
              n = !t,
              o
            if (i && _.root) throw new _.ErrnoError(10)
            if (!i && !n) {
              var f = _.lookupPath(t, { follow_mount: !1 })
              if (((t = f.path), (o = f.node), _.isMountpoint(o)))
                throw new _.ErrnoError(10)
              if (!_.isDir(o.mode)) throw new _.ErrnoError(54)
            }
            var l = { type: e, opts: r, mountpoint: t, mounts: [] },
              d = e.mount(l)
            return (
              (d.mount = l),
              (l.root = d),
              i
                ? (_.root = d)
                : o && ((o.mounted = l), o.mount && o.mount.mounts.push(l)),
              d
            )
          },
          unmount(e) {
            var r = _.lookupPath(e, { follow_mount: !1 })
            if (!_.isMountpoint(r.node)) throw new _.ErrnoError(28)
            var t = r.node,
              i = t.mounted,
              n = _.getMounts(i)
            Object.keys(_.nameTable).forEach(f => {
              for (var l = _.nameTable[f]; l; ) {
                var d = l.name_next
                n.includes(l.mount) && _.destroyNode(l), (l = d)
              }
            }),
              (t.mounted = null)
            var o = t.mount.mounts.indexOf(i)
            t.mount.mounts.splice(o, 1)
          },
          lookup(e, r) {
            return e.node_ops.lookup(e, r)
          },
          mknod(e, r, t) {
            var i = _.lookupPath(e, { parent: !0 }),
              n = i.node,
              o = T.basename(e)
            if (!o || o === '.' || o === '..') throw new _.ErrnoError(28)
            var f = _.mayCreate(n, o)
            if (f) throw new _.ErrnoError(f)
            if (!n.node_ops.mknod) throw new _.ErrnoError(63)
            return n.node_ops.mknod(n, o, r, t)
          },
          create(e, r) {
            return (
              (r = r !== void 0 ? r : 438),
              (r &= 4095),
              (r |= 32768),
              _.mknod(e, r, 0)
            )
          },
          mkdir(e, r) {
            return (
              (r = r !== void 0 ? r : 511),
              (r &= 1023),
              (r |= 16384),
              _.mknod(e, r, 0)
            )
          },
          mkdirTree(e, r) {
            for (var t = e.split('/'), i = '', n = 0; n < t.length; ++n)
              if (t[n]) {
                i += '/' + t[n]
                try {
                  _.mkdir(i, r)
                } catch (o) {
                  if (o.errno != 20) throw o
                }
              }
          },
          mkdev(e, r, t) {
            return (
              typeof t == 'undefined' && ((t = r), (r = 438)),
              (r |= 8192),
              _.mknod(e, r, t)
            )
          },
          symlink(e, r) {
            if (!L.resolve(e)) throw new _.ErrnoError(44)
            var t = _.lookupPath(r, { parent: !0 }),
              i = t.node
            if (!i) throw new _.ErrnoError(44)
            var n = T.basename(r),
              o = _.mayCreate(i, n)
            if (o) throw new _.ErrnoError(o)
            if (!i.node_ops.symlink) throw new _.ErrnoError(63)
            return i.node_ops.symlink(i, n, e)
          },
          rename(e, r) {
            var t = T.dirname(e),
              i = T.dirname(r),
              n = T.basename(e),
              o = T.basename(r),
              f,
              l,
              d
            if (
              ((f = _.lookupPath(e, { parent: !0 })),
              (l = f.node),
              (f = _.lookupPath(r, { parent: !0 })),
              (d = f.node),
              !l || !d)
            )
              throw new _.ErrnoError(44)
            if (l.mount !== d.mount) throw new _.ErrnoError(75)
            var c = _.lookupNode(l, n),
              u = L.relative(e, i)
            if (u.charAt(0) !== '.') throw new _.ErrnoError(28)
            if (((u = L.relative(r, t)), u.charAt(0) !== '.'))
              throw new _.ErrnoError(55)
            var v
            try {
              v = _.lookupNode(d, o)
            } catch {}
            if (c !== v) {
              var g = _.isDir(c.mode),
                p = _.mayDelete(l, n, g)
              if (p) throw new _.ErrnoError(p)
              if (((p = v ? _.mayDelete(d, o, g) : _.mayCreate(d, o)), p))
                throw new _.ErrnoError(p)
              if (!l.node_ops.rename) throw new _.ErrnoError(63)
              if (_.isMountpoint(c) || (v && _.isMountpoint(v)))
                throw new _.ErrnoError(10)
              if (d !== l && ((p = _.nodePermissions(l, 'w')), p))
                throw new _.ErrnoError(p)
              _.hashRemoveNode(c)
              try {
                l.node_ops.rename(c, d, o), (c.parent = d)
              } catch (y) {
                throw y
              } finally {
                _.hashAddNode(c)
              }
            }
          },
          rmdir(e) {
            var r = _.lookupPath(e, { parent: !0 }),
              t = r.node,
              i = T.basename(e),
              n = _.lookupNode(t, i),
              o = _.mayDelete(t, i, !0)
            if (o) throw new _.ErrnoError(o)
            if (!t.node_ops.rmdir) throw new _.ErrnoError(63)
            if (_.isMountpoint(n)) throw new _.ErrnoError(10)
            t.node_ops.rmdir(t, i), _.destroyNode(n)
          },
          readdir(e) {
            var r = _.lookupPath(e, { follow: !0 }),
              t = r.node
            if (!t.node_ops.readdir) throw new _.ErrnoError(54)
            return t.node_ops.readdir(t)
          },
          unlink(e) {
            var r = _.lookupPath(e, { parent: !0 }),
              t = r.node
            if (!t) throw new _.ErrnoError(44)
            var i = T.basename(e),
              n = _.lookupNode(t, i),
              o = _.mayDelete(t, i, !1)
            if (o) throw new _.ErrnoError(o)
            if (!t.node_ops.unlink) throw new _.ErrnoError(63)
            if (_.isMountpoint(n)) throw new _.ErrnoError(10)
            t.node_ops.unlink(t, i), _.destroyNode(n)
          },
          readlink(e) {
            var r = _.lookupPath(e),
              t = r.node
            if (!t) throw new _.ErrnoError(44)
            if (!t.node_ops.readlink) throw new _.ErrnoError(28)
            return L.resolve(_.getPath(t.parent), t.node_ops.readlink(t))
          },
          stat(e, r) {
            var t = _.lookupPath(e, { follow: !r }),
              i = t.node
            if (!i) throw new _.ErrnoError(44)
            if (!i.node_ops.getattr) throw new _.ErrnoError(63)
            return i.node_ops.getattr(i)
          },
          lstat(e) {
            return _.stat(e, !0)
          },
          chmod(e, r, t) {
            var i
            if (typeof e == 'string') {
              var n = _.lookupPath(e, { follow: !t })
              i = n.node
            } else i = e
            if (!i.node_ops.setattr) throw new _.ErrnoError(63)
            i.node_ops.setattr(i, {
              mode: (r & 4095) | (i.mode & -4096),
              timestamp: Date.now(),
            })
          },
          lchmod(e, r) {
            _.chmod(e, r, !0)
          },
          fchmod(e, r) {
            var t = _.getStreamChecked(e)
            _.chmod(t.node, r)
          },
          chown(e, r, t, i) {
            var n
            if (typeof e == 'string') {
              var o = _.lookupPath(e, { follow: !i })
              n = o.node
            } else n = e
            if (!n.node_ops.setattr) throw new _.ErrnoError(63)
            n.node_ops.setattr(n, { timestamp: Date.now() })
          },
          lchown(e, r, t) {
            _.chown(e, r, t, !0)
          },
          fchown(e, r, t) {
            var i = _.getStreamChecked(e)
            _.chown(i.node, r, t)
          },
          truncate(e, r) {
            if (r < 0) throw new _.ErrnoError(28)
            var t
            if (typeof e == 'string') {
              var i = _.lookupPath(e, { follow: !0 })
              t = i.node
            } else t = e
            if (!t.node_ops.setattr) throw new _.ErrnoError(63)
            if (_.isDir(t.mode)) throw new _.ErrnoError(31)
            if (!_.isFile(t.mode)) throw new _.ErrnoError(28)
            var n = _.nodePermissions(t, 'w')
            if (n) throw new _.ErrnoError(n)
            t.node_ops.setattr(t, { size: r, timestamp: Date.now() })
          },
          ftruncate(e, r) {
            var t = _.getStreamChecked(e)
            if (!(t.flags & 2097155)) throw new _.ErrnoError(28)
            _.truncate(t.node, r)
          },
          utime(e, r, t) {
            var i = _.lookupPath(e, { follow: !0 }),
              n = i.node
            n.node_ops.setattr(n, { timestamp: Math.max(r, t) })
          },
          open(e, r, t) {
            if (e === '') throw new _.ErrnoError(44)
            ;(r = typeof r == 'string' ? kt(r) : r),
              r & 64
                ? ((t = typeof t == 'undefined' ? 438 : t),
                  (t = (t & 4095) | 32768))
                : (t = 0)
            var i
            if (typeof e == 'object') i = e
            else {
              e = T.normalize(e)
              try {
                var n = _.lookupPath(e, { follow: !(r & 131072) })
                i = n.node
              } catch {}
            }
            var o = !1
            if (r & 64)
              if (i) {
                if (r & 128) throw new _.ErrnoError(20)
              } else (i = _.mknod(e, t, 0)), (o = !0)
            if (!i) throw new _.ErrnoError(44)
            if (
              (_.isChrdev(i.mode) && (r &= -513), r & 65536 && !_.isDir(i.mode))
            )
              throw new _.ErrnoError(54)
            if (!o) {
              var f = _.mayOpen(i, r)
              if (f) throw new _.ErrnoError(f)
            }
            r & 512 && !o && _.truncate(i, 0), (r &= -131713)
            var l = _.createStream({
              node: i,
              path: _.getPath(i),
              flags: r,
              seekable: !0,
              position: 0,
              stream_ops: i.stream_ops,
              ungotten: [],
              error: !1,
            })
            return (
              l.stream_ops.open && l.stream_ops.open(l),
              a.logReadFiles &&
                !(r & 1) &&
                (_.readFiles || (_.readFiles = {}),
                e in _.readFiles || (_.readFiles[e] = 1)),
              l
            )
          },
          close(e) {
            if (_.isClosed(e)) throw new _.ErrnoError(8)
            e.getdents && (e.getdents = null)
            try {
              e.stream_ops.close && e.stream_ops.close(e)
            } catch (r) {
              throw r
            } finally {
              _.closeStream(e.fd)
            }
            e.fd = null
          },
          isClosed(e) {
            return e.fd === null
          },
          llseek(e, r, t) {
            if (_.isClosed(e)) throw new _.ErrnoError(8)
            if (!e.seekable || !e.stream_ops.llseek) throw new _.ErrnoError(70)
            if (t != 0 && t != 1 && t != 2) throw new _.ErrnoError(28)
            return (
              (e.position = e.stream_ops.llseek(e, r, t)),
              (e.ungotten = []),
              e.position
            )
          },
          read(e, r, t, i, n) {
            if (i < 0 || n < 0) throw new _.ErrnoError(28)
            if (_.isClosed(e)) throw new _.ErrnoError(8)
            if ((e.flags & 2097155) === 1) throw new _.ErrnoError(8)
            if (_.isDir(e.node.mode)) throw new _.ErrnoError(31)
            if (!e.stream_ops.read) throw new _.ErrnoError(28)
            var o = typeof n != 'undefined'
            if (!o) n = e.position
            else if (!e.seekable) throw new _.ErrnoError(70)
            var f = e.stream_ops.read(e, r, t, i, n)
            return o || (e.position += f), f
          },
          write(e, r, t, i, n, o) {
            if (i < 0 || n < 0) throw new _.ErrnoError(28)
            if (_.isClosed(e)) throw new _.ErrnoError(8)
            if (!(e.flags & 2097155)) throw new _.ErrnoError(8)
            if (_.isDir(e.node.mode)) throw new _.ErrnoError(31)
            if (!e.stream_ops.write) throw new _.ErrnoError(28)
            e.seekable && e.flags & 1024 && _.llseek(e, 0, 2)
            var f = typeof n != 'undefined'
            if (!f) n = e.position
            else if (!e.seekable) throw new _.ErrnoError(70)
            var l = e.stream_ops.write(e, r, t, i, n, o)
            return f || (e.position += l), l
          },
          allocate(e, r, t) {
            if (_.isClosed(e)) throw new _.ErrnoError(8)
            if (r < 0 || t <= 0) throw new _.ErrnoError(28)
            if (!(e.flags & 2097155)) throw new _.ErrnoError(8)
            if (!_.isFile(e.node.mode) && !_.isDir(e.node.mode))
              throw new _.ErrnoError(43)
            if (!e.stream_ops.allocate) throw new _.ErrnoError(138)
            e.stream_ops.allocate(e, r, t)
          },
          mmap(e, r, t, i, n) {
            if (i & 2 && !(n & 2) && (e.flags & 2097155) !== 2)
              throw new _.ErrnoError(2)
            if ((e.flags & 2097155) === 1) throw new _.ErrnoError(2)
            if (!e.stream_ops.mmap) throw new _.ErrnoError(43)
            return e.stream_ops.mmap(e, r, t, i, n)
          },
          msync(e, r, t, i, n) {
            return e.stream_ops.msync ? e.stream_ops.msync(e, r, t, i, n) : 0
          },
          ioctl(e, r, t) {
            if (!e.stream_ops.ioctl) throw new _.ErrnoError(59)
            return e.stream_ops.ioctl(e, r, t)
          },
          readFile(e, r = {}) {
            if (
              ((r.flags = r.flags || 0),
              (r.encoding = r.encoding || 'binary'),
              r.encoding !== 'utf8' && r.encoding !== 'binary')
            )
              throw new Error(`Invalid encoding type "${r.encoding}"`)
            var t,
              i = _.open(e, r.flags),
              n = _.stat(e),
              o = n.size,
              f = new Uint8Array(o)
            return (
              _.read(i, f, 0, o, 0),
              r.encoding === 'utf8'
                ? (t = Q(f, 0))
                : r.encoding === 'binary' && (t = f),
              _.close(i),
              t
            )
          },
          writeFile(e, r, t = {}) {
            t.flags = t.flags || 577
            var i = _.open(e, t.flags, t.mode)
            if (typeof r == 'string') {
              var n = new Uint8Array(Le(r) + 1),
                o = Be(r, n, 0, n.length)
              _.write(i, n, 0, o, void 0, t.canOwn)
            } else if (ArrayBuffer.isView(r))
              _.write(i, r, 0, r.byteLength, void 0, t.canOwn)
            else throw new Error('Unsupported data type')
            _.close(i)
          },
          cwd: () => _.currentPath,
          chdir(e) {
            var r = _.lookupPath(e, { follow: !0 })
            if (r.node === null) throw new _.ErrnoError(44)
            if (!_.isDir(r.node.mode)) throw new _.ErrnoError(54)
            var t = _.nodePermissions(r.node, 'x')
            if (t) throw new _.ErrnoError(t)
            _.currentPath = r.path
          },
          createDefaultDirectories() {
            _.mkdir('/tmp'), _.mkdir('/home'), _.mkdir('/home/web_user')
          },
          createDefaultDevices() {
            _.mkdir('/dev'),
              _.registerDevice(_.makedev(1, 3), {
                read: () => 0,
                write: (i, n, o, f, l) => f,
              }),
              _.mkdev('/dev/null', _.makedev(1, 3)),
              Y.register(_.makedev(5, 0), Y.default_tty_ops),
              Y.register(_.makedev(6, 0), Y.default_tty1_ops),
              _.mkdev('/dev/tty', _.makedev(5, 0)),
              _.mkdev('/dev/tty1', _.makedev(6, 0))
            var e = new Uint8Array(1024),
              r = 0,
              t = () => (r === 0 && (r = Er(e).byteLength), e[--r])
            _.createDevice('/dev', 'random', t),
              _.createDevice('/dev', 'urandom', t),
              _.mkdir('/dev/shm'),
              _.mkdir('/dev/shm/tmp')
          },
          createSpecialDirectories() {
            _.mkdir('/proc')
            var e = _.mkdir('/proc/self')
            _.mkdir('/proc/self/fd'),
              _.mount(
                {
                  mount() {
                    var r = _.createNode(e, 'fd', 16895, 73)
                    return (
                      (r.node_ops = {
                        lookup(t, i) {
                          var n = +i,
                            o = _.getStreamChecked(n),
                            f = {
                              parent: null,
                              mount: { mountpoint: 'fake' },
                              node_ops: { readlink: () => o.path },
                            }
                          return (f.parent = f), f
                        },
                      }),
                      r
                    )
                  },
                },
                {},
                '/proc/self/fd'
              )
          },
          createStandardStreams() {
            a.stdin
              ? _.createDevice('/dev', 'stdin', a.stdin)
              : _.symlink('/dev/tty', '/dev/stdin'),
              a.stdout
                ? _.createDevice('/dev', 'stdout', null, a.stdout)
                : _.symlink('/dev/tty', '/dev/stdout'),
              a.stderr
                ? _.createDevice('/dev', 'stderr', null, a.stderr)
                : _.symlink('/dev/tty1', '/dev/stderr')
            var e = _.open('/dev/stdin', 0),
              r = _.open('/dev/stdout', 1),
              t = _.open('/dev/stderr', 1)
          },
          staticInit() {
            ;[44].forEach(e => {
              ;(_.genericErrors[e] = new _.ErrnoError(e)),
                (_.genericErrors[e].stack = '<generic error, no stack>')
            }),
              (_.nameTable = new Array(4096)),
              _.mount(b, {}, '/'),
              _.createDefaultDirectories(),
              _.createDefaultDevices(),
              _.createSpecialDirectories(),
              (_.filesystems = { MEMFS: b })
          },
          init(e, r, t) {
            ;(_.init.initialized = !0),
              (a.stdin = e || a.stdin),
              (a.stdout = r || a.stdout),
              (a.stderr = t || a.stderr),
              _.createStandardStreams()
          },
          quit() {
            _.init.initialized = !1
            for (var e = 0; e < _.streams.length; e++) {
              var r = _.streams[e]
              r && _.close(r)
            }
          },
          findObject(e, r) {
            var t = _.analyzePath(e, r)
            return t.exists ? t.object : null
          },
          analyzePath(e, r) {
            try {
              var t = _.lookupPath(e, { follow: !r })
              e = t.path
            } catch {}
            var i = {
              isRoot: !1,
              exists: !1,
              error: 0,
              name: null,
              path: null,
              object: null,
              parentExists: !1,
              parentPath: null,
              parentObject: null,
            }
            try {
              var t = _.lookupPath(e, { parent: !0 })
              ;(i.parentExists = !0),
                (i.parentPath = t.path),
                (i.parentObject = t.node),
                (i.name = T.basename(e)),
                (t = _.lookupPath(e, { follow: !r })),
                (i.exists = !0),
                (i.path = t.path),
                (i.object = t.node),
                (i.name = t.node.name),
                (i.isRoot = t.path === '/')
            } catch (n) {
              i.error = n.errno
            }
            return i
          },
          createPath(e, r, t, i) {
            e = typeof e == 'string' ? e : _.getPath(e)
            for (var n = r.split('/').reverse(); n.length; ) {
              var o = n.pop()
              if (o) {
                var f = T.join2(e, o)
                try {
                  _.mkdir(f)
                } catch {}
                e = f
              }
            }
            return f
          },
          createFile(e, r, t, i, n) {
            var o = T.join2(typeof e == 'string' ? e : _.getPath(e), r),
              f = Ve(i, n)
            return _.create(o, f)
          },
          createDataFile(e, r, t, i, n, o) {
            var f = r
            e &&
              ((e = typeof e == 'string' ? e : _.getPath(e)),
              (f = r ? T.join2(e, r) : e))
            var l = Ve(i, n),
              d = _.create(f, l)
            if (t) {
              if (typeof t == 'string') {
                for (
                  var c = new Array(t.length), u = 0, v = t.length;
                  u < v;
                  ++u
                )
                  c[u] = t.charCodeAt(u)
                t = c
              }
              _.chmod(d, l | 146)
              var g = _.open(d, 577)
              _.write(g, t, 0, t.length, 0, o), _.close(g), _.chmod(d, l)
            }
          },
          createDevice(e, r, t, i) {
            var n = T.join2(typeof e == 'string' ? e : _.getPath(e), r),
              o = Ve(!!t, !!i)
            _.createDevice.major || (_.createDevice.major = 64)
            var f = _.makedev(_.createDevice.major++, 0)
            return (
              _.registerDevice(f, {
                open(l) {
                  l.seekable = !1
                },
                close(l) {
                  var d
                  ;(d = i == null ? void 0 : i.buffer) != null &&
                    d.length &&
                    i(10)
                },
                read(l, d, c, u, v) {
                  for (var g = 0, p = 0; p < u; p++) {
                    var y
                    try {
                      y = t()
                    } catch {
                      throw new _.ErrnoError(29)
                    }
                    if (y === void 0 && g === 0) throw new _.ErrnoError(6)
                    if (y == null) break
                    g++, (d[c + p] = y)
                  }
                  return g && (l.node.timestamp = Date.now()), g
                },
                write(l, d, c, u, v) {
                  for (var g = 0; g < u; g++)
                    try {
                      i(d[c + g])
                    } catch {
                      throw new _.ErrnoError(29)
                    }
                  return u && (l.node.timestamp = Date.now()), g
                },
              }),
              _.mkdev(n, o, f)
            )
          },
          forceLoadFile(e) {
            if (e.isDevice || e.isFolder || e.link || e.contents) return !0
            if (typeof XMLHttpRequest != 'undefined')
              throw new Error(
                'Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread.'
              )
            if (te)
              try {
                ;(e.contents = be(te(e.url), !0)),
                  (e.usedBytes = e.contents.length)
              } catch {
                throw new _.ErrnoError(29)
              }
            else
              throw new Error('Cannot load without read() or XMLHttpRequest.')
          },
          createLazyFile(e, r, t, i, n) {
            class o {
              constructor() {
                ;(this.lengthKnown = !1), (this.chunks = [])
              }
              get(p) {
                if (!(p > this.length - 1 || p < 0)) {
                  var y = p % this.chunkSize,
                    $ = (p / this.chunkSize) | 0
                  return this.getter($)[y]
                }
              }
              setDataGetter(p) {
                this.getter = p
              }
              cacheLength() {
                var p = new XMLHttpRequest()
                if (
                  (p.open('HEAD', t, !1),
                  p.send(null),
                  !((p.status >= 200 && p.status < 300) || p.status === 304))
                )
                  throw new Error(
                    "Couldn't load " + t + '. Status: ' + p.status
                  )
                var y = Number(p.getResponseHeader('Content-length')),
                  $,
                  R =
                    ($ = p.getResponseHeader('Accept-Ranges')) && $ === 'bytes',
                  C =
                    ($ = p.getResponseHeader('Content-Encoding')) &&
                    $ === 'gzip',
                  h = 1024 * 1024
                R || (h = y)
                var m = (P, I) => {
                    if (P > I)
                      throw new Error(
                        'invalid range (' +
                          P +
                          ', ' +
                          I +
                          ') or no bytes requested!'
                      )
                    if (I > y - 1)
                      throw new Error(
                        'only ' + y + ' bytes available! programmer error!'
                      )
                    var D = new XMLHttpRequest()
                    if (
                      (D.open('GET', t, !1),
                      y !== h &&
                        D.setRequestHeader('Range', 'bytes=' + P + '-' + I),
                      (D.responseType = 'arraybuffer'),
                      D.overrideMimeType &&
                        D.overrideMimeType(
                          'text/plain; charset=x-user-defined'
                        ),
                      D.send(null),
                      !(
                        (D.status >= 200 && D.status < 300) ||
                        D.status === 304
                      ))
                    )
                      throw new Error(
                        "Couldn't load " + t + '. Status: ' + D.status
                      )
                    return D.response !== void 0
                      ? new Uint8Array(D.response || [])
                      : be(D.responseText || '', !0)
                  },
                  F = this
                F.setDataGetter(P => {
                  var I = P * h,
                    D = (P + 1) * h - 1
                  if (
                    ((D = Math.min(D, y - 1)),
                    typeof F.chunks[P] == 'undefined' &&
                      (F.chunks[P] = m(I, D)),
                    typeof F.chunks[P] == 'undefined')
                  )
                    throw new Error('doXHR failed!')
                  return F.chunks[P]
                }),
                  (C || !y) &&
                    ((h = y = 1),
                    (y = this.getter(0).length),
                    (h = y),
                    Oe(
                      'LazyFiles on gzip forces download of the whole file when length is accessed'
                    )),
                  (this._length = y),
                  (this._chunkSize = h),
                  (this.lengthKnown = !0)
              }
              get length() {
                return this.lengthKnown || this.cacheLength(), this._length
              }
              get chunkSize() {
                return this.lengthKnown || this.cacheLength(), this._chunkSize
              }
            }
            if (typeof XMLHttpRequest != 'undefined') {
              if (!he)
                throw 'Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc'
              var f = new o(),
                l = { isDevice: !1, contents: f }
            } else var l = { isDevice: !1, url: t }
            var d = _.createFile(e, r, l, i, n)
            l.contents
              ? (d.contents = l.contents)
              : l.url && ((d.contents = null), (d.url = l.url)),
              Object.defineProperties(d, {
                usedBytes: {
                  get: function () {
                    return this.contents.length
                  },
                },
              })
            var c = {},
              u = Object.keys(d.stream_ops)
            u.forEach(g => {
              var p = d.stream_ops[g]
              c[g] = (...y) => (_.forceLoadFile(d), p(...y))
            })
            function v(g, p, y, $, R) {
              var C = g.node.contents
              if (R >= C.length) return 0
              var h = Math.min(C.length - R, $)
              if (C.slice) for (var m = 0; m < h; m++) p[y + m] = C[R + m]
              else for (var m = 0; m < h; m++) p[y + m] = C.get(R + m)
              return h
            }
            return (
              (c.read = (g, p, y, $, R) => (
                _.forceLoadFile(d), v(g, p, y, $, R)
              )),
              (c.mmap = (g, p, y, $, R) => {
                _.forceLoadFile(d)
                var C = kr(p)
                if (!C) throw new _.ErrnoError(48)
                return v(g, S, C, p, y), { ptr: C, allocated: !0 }
              }),
              (d.stream_ops = c),
              d
            )
          },
        },
        O = {
          DEFAULT_POLLMASK: 5,
          calculateAt(e, r, t) {
            if (T.isAbs(r)) return r
            var i
            if (e === -100) i = _.cwd()
            else {
              var n = O.getStreamFromFD(e)
              i = n.path
            }
            if (r.length == 0) {
              if (!t) throw new _.ErrnoError(44)
              return i
            }
            return T.join2(i, r)
          },
          doStat(e, r, t) {
            var i = e(r)
            ;(w[t >> 2] = i.dev),
              (w[(t + 4) >> 2] = i.mode),
              (k[(t + 8) >> 2] = i.nlink),
              (w[(t + 12) >> 2] = i.uid),
              (w[(t + 16) >> 2] = i.gid),
              (w[(t + 20) >> 2] = i.rdev),
              (A = [
                i.size >>> 0,
                ((E = i.size),
                +Math.abs(E) >= 1
                  ? E > 0
                    ? +Math.floor(E / 4294967296) >>> 0
                    : ~~+Math.ceil((E - +(~~E >>> 0)) / 4294967296) >>> 0
                  : 0),
              ]),
              (w[(t + 24) >> 2] = A[0]),
              (w[(t + 28) >> 2] = A[1]),
              (w[(t + 32) >> 2] = 4096),
              (w[(t + 36) >> 2] = i.blocks)
            var n = i.atime.getTime(),
              o = i.mtime.getTime(),
              f = i.ctime.getTime()
            return (
              (A = [
                Math.floor(n / 1e3) >>> 0,
                ((E = Math.floor(n / 1e3)),
                +Math.abs(E) >= 1
                  ? E > 0
                    ? +Math.floor(E / 4294967296) >>> 0
                    : ~~+Math.ceil((E - +(~~E >>> 0)) / 4294967296) >>> 0
                  : 0),
              ]),
              (w[(t + 40) >> 2] = A[0]),
              (w[(t + 44) >> 2] = A[1]),
              (k[(t + 48) >> 2] = (n % 1e3) * 1e3),
              (A = [
                Math.floor(o / 1e3) >>> 0,
                ((E = Math.floor(o / 1e3)),
                +Math.abs(E) >= 1
                  ? E > 0
                    ? +Math.floor(E / 4294967296) >>> 0
                    : ~~+Math.ceil((E - +(~~E >>> 0)) / 4294967296) >>> 0
                  : 0),
              ]),
              (w[(t + 56) >> 2] = A[0]),
              (w[(t + 60) >> 2] = A[1]),
              (k[(t + 64) >> 2] = (o % 1e3) * 1e3),
              (A = [
                Math.floor(f / 1e3) >>> 0,
                ((E = Math.floor(f / 1e3)),
                +Math.abs(E) >= 1
                  ? E > 0
                    ? +Math.floor(E / 4294967296) >>> 0
                    : ~~+Math.ceil((E - +(~~E >>> 0)) / 4294967296) >>> 0
                  : 0),
              ]),
              (w[(t + 72) >> 2] = A[0]),
              (w[(t + 76) >> 2] = A[1]),
              (k[(t + 80) >> 2] = (f % 1e3) * 1e3),
              (A = [
                i.ino >>> 0,
                ((E = i.ino),
                +Math.abs(E) >= 1
                  ? E > 0
                    ? +Math.floor(E / 4294967296) >>> 0
                    : ~~+Math.ceil((E - +(~~E >>> 0)) / 4294967296) >>> 0
                  : 0),
              ]),
              (w[(t + 88) >> 2] = A[0]),
              (w[(t + 92) >> 2] = A[1]),
              0
            )
          },
          doMsync(e, r, t, i, n) {
            if (!_.isFile(r.node.mode)) throw new _.ErrnoError(43)
            if (i & 2) return 0
            var o = M.slice(e, e + t)
            _.msync(r, o, n, t, i)
          },
          getStreamFromFD(e) {
            var r = _.getStreamChecked(e)
            return r
          },
          varargs: void 0,
          getStr(e) {
            var r = K(e)
            return r
          },
        }
      function xt(e, r, t) {
        O.varargs = t
        try {
          var i = O.getStreamFromFD(e)
          switch (r) {
            case 0: {
              var n = we()
              if (n < 0) return -28
              for (; _.streams[n]; ) n++
              var o
              return (o = _.dupStream(i, n)), o.fd
            }
            case 1:
            case 2:
              return 0
            case 3:
              return i.flags
            case 4: {
              var n = we()
              return (i.flags |= n), 0
            }
            case 12: {
              var n = Z(),
                f = 0
              return (H[(n + f) >> 1] = 2), 0
            }
            case 13:
            case 14:
              return 0
          }
          return -28
        } catch (l) {
          if (typeof _ == 'undefined' || l.name !== 'ErrnoError') throw l
          return -l.errno
        }
      }
      function Pt(e, r, t) {
        O.varargs = t
        try {
          var i = O.getStreamFromFD(e)
          switch (r) {
            case 21509:
              return i.tty ? 0 : -59
            case 21505: {
              if (!i.tty) return -59
              if (i.tty.ops.ioctl_tcgets) {
                var n = i.tty.ops.ioctl_tcgets(i),
                  o = Z()
                ;(w[o >> 2] = n.c_iflag || 0),
                  (w[(o + 4) >> 2] = n.c_oflag || 0),
                  (w[(o + 8) >> 2] = n.c_cflag || 0),
                  (w[(o + 12) >> 2] = n.c_lflag || 0)
                for (var f = 0; f < 32; f++) S[o + f + 17] = n.c_cc[f] || 0
                return 0
              }
              return 0
            }
            case 21510:
            case 21511:
            case 21512:
              return i.tty ? 0 : -59
            case 21506:
            case 21507:
            case 21508: {
              if (!i.tty) return -59
              if (i.tty.ops.ioctl_tcsets) {
                for (
                  var o = Z(),
                    l = w[o >> 2],
                    d = w[(o + 4) >> 2],
                    c = w[(o + 8) >> 2],
                    u = w[(o + 12) >> 2],
                    v = [],
                    f = 0;
                  f < 32;
                  f++
                )
                  v.push(S[o + f + 17])
                return i.tty.ops.ioctl_tcsets(i.tty, r, {
                  c_iflag: l,
                  c_oflag: d,
                  c_cflag: c,
                  c_lflag: u,
                  c_cc: v,
                })
              }
              return 0
            }
            case 21519: {
              if (!i.tty) return -59
              var o = Z()
              return (w[o >> 2] = 0), 0
            }
            case 21520:
              return i.tty ? -28 : -59
            case 21531: {
              var o = Z()
              return _.ioctl(i, r, o)
            }
            case 21523: {
              if (!i.tty) return -59
              if (i.tty.ops.ioctl_tiocgwinsz) {
                var g = i.tty.ops.ioctl_tiocgwinsz(i.tty),
                  o = Z()
                ;(H[o >> 1] = g[0]), (H[(o + 2) >> 1] = g[1])
              }
              return 0
            }
            case 21524:
              return i.tty ? 0 : -59
            case 21515:
              return i.tty ? 0 : -59
            default:
              return -28
          }
        } catch (p) {
          if (typeof _ == 'undefined' || p.name !== 'ErrnoError') throw p
          return -p.errno
        }
      }
      function Tt(e, r, t, i) {
        O.varargs = i
        try {
          ;(r = O.getStr(r)), (r = O.calculateAt(e, r))
          var n = i ? we() : 0
          return _.open(r, t, n).fd
        } catch (o) {
          if (typeof _ == 'undefined' || o.name !== 'ErrnoError') throw o
          return -o.errno
        }
      }
      var Ct = () => {
          pe('')
        },
        Ee = {},
        Ye = e => {
          for (; e.length; ) {
            var r = e.pop(),
              t = e.pop()
            t(r)
          }
        }
      function _e(e) {
        return this.fromWireType(k[e >> 2])
      }
      var ee = {},
        J = {},
        ke = {},
        xr,
        xe = e => {
          throw new xr(e)
        },
        qe = (e, r, t) => {
          e.forEach(function (l) {
            ke[l] = r
          })
          function i(l) {
            var d = t(l)
            d.length !== e.length && xe('Mismatched type converter count')
            for (var c = 0; c < e.length; ++c) W(e[c], d[c])
          }
          var n = new Array(r.length),
            o = [],
            f = 0
          r.forEach((l, d) => {
            J.hasOwnProperty(l)
              ? (n[d] = J[l])
              : (o.push(l),
                ee.hasOwnProperty(l) || (ee[l] = []),
                ee[l].push(() => {
                  ;(n[d] = J[l]), ++f, f === o.length && i(n)
                }))
          }),
            o.length === 0 && i(n)
        },
        $t = e => {
          var r = Ee[e]
          delete Ee[e]
          var t = r.rawConstructor,
            i = r.rawDestructor,
            n = r.fields,
            o = n
              .map(f => f.getterReturnType)
              .concat(n.map(f => f.setterArgumentType))
          qe([e], o, f => {
            var l = {}
            return (
              n.forEach((d, c) => {
                var u = d.fieldName,
                  v = f[c],
                  g = d.getter,
                  p = d.getterContext,
                  y = f[c + n.length],
                  $ = d.setter,
                  R = d.setterContext
                l[u] = {
                  read: C => v.fromWireType(g(p, C)),
                  write: (C, h) => {
                    var m = []
                    $(R, C, y.toWireType(m, h)), Ye(m)
                  },
                }
              }),
              [
                {
                  name: r.name,
                  fromWireType: d => {
                    var c = {}
                    for (var u in l) c[u] = l[u].read(d)
                    return i(d), c
                  },
                  toWireType: (d, c) => {
                    for (var u in l)
                      if (!(u in c))
                        throw new TypeError(`Missing field: "${u}"`)
                    var v = t()
                    for (u in l) l[u].write(v, c[u])
                    return d !== null && d.push(i, v), v
                  },
                  argPackAdvance: N,
                  readValueFromPointer: _e,
                  destructorFunction: i,
                },
              ]
            )
          })
        },
        Dt = (e, r, t, i, n) => {},
        Ft = () => {
          for (var e = new Array(256), r = 0; r < 256; ++r)
            e[r] = String.fromCharCode(r)
          Pr = e
        },
        Pr,
        j = e => {
          for (var r = '', t = e; M[t]; ) r += Pr[M[t++]]
          return r
        },
        oe,
        x = e => {
          throw new oe(e)
        }
      function St(e, r, t = {}) {
        var i = r.name
        if (
          (e || x(`type "${i}" must have a positive integer typeid pointer`),
          J.hasOwnProperty(e))
        ) {
          if (t.ignoreDuplicateRegistrations) return
          x(`Cannot register type '${i}' twice`)
        }
        if (((J[e] = r), delete ke[e], ee.hasOwnProperty(e))) {
          var n = ee[e]
          delete ee[e], n.forEach(o => o())
        }
      }
      function W(e, r, t = {}) {
        if (!('argPackAdvance' in r))
          throw new TypeError(
            'registerType registeredInstance requires argPackAdvance'
          )
        return St(e, r, t)
      }
      var N = 8,
        At = (e, r, t, i) => {
          ;(r = j(r)),
            W(e, {
              name: r,
              fromWireType: function (n) {
                return !!n
              },
              toWireType: function (n, o) {
                return o ? t : i
              },
              argPackAdvance: N,
              readValueFromPointer: function (n) {
                return this.fromWireType(M[n])
              },
              destructorFunction: null,
            })
        },
        Rt = e => ({
          count: e.count,
          deleteScheduled: e.deleteScheduled,
          preservePointerOnDelete: e.preservePointerOnDelete,
          ptr: e.ptr,
          ptrType: e.ptrType,
          smartPtr: e.smartPtr,
          smartPtrType: e.smartPtrType,
        }),
        Xe = e => {
          function r(t) {
            return t.$$.ptrType.registeredClass.name
          }
          x(r(e) + ' instance already deleted')
        },
        Ge = !1,
        Tr = e => {},
        Mt = e => {
          e.smartPtr
            ? e.smartPtrType.rawDestructor(e.smartPtr)
            : e.ptrType.registeredClass.rawDestructor(e.ptr)
        },
        Cr = e => {
          e.count.value -= 1
          var r = e.count.value === 0
          r && Mt(e)
        },
        $r = (e, r, t) => {
          if (r === t) return e
          if (t.baseClass === void 0) return null
          var i = $r(e, r, t.baseClass)
          return i === null ? null : t.downcast(i)
        },
        Dr = {},
        jt = () => Object.keys(le).length,
        Ot = () => {
          var e = []
          for (var r in le) le.hasOwnProperty(r) && e.push(le[r])
          return e
        },
        se = [],
        Ke = () => {
          for (; se.length; ) {
            var e = se.pop()
            ;(e.$$.deleteScheduled = !1), e.delete()
          }
        },
        fe,
        It = e => {
          ;(fe = e), se.length && fe && fe(Ke)
        },
        zt = () => {
          ;(a.getInheritedInstanceCount = jt),
            (a.getLiveInheritedInstances = Ot),
            (a.flushPendingDeletes = Ke),
            (a.setDelayFunction = It)
        },
        le = {},
        Ut = (e, r) => {
          for (r === void 0 && x('ptr should not be undefined'); e.baseClass; )
            (r = e.upcast(r)), (e = e.baseClass)
          return r
        },
        Wt = (e, r) => ((r = Ut(e, r)), le[r]),
        Pe = (e, r) => {
          ;(!r.ptrType || !r.ptr) &&
            xe('makeClassHandle requires ptr and ptrType')
          var t = !!r.smartPtrType,
            i = !!r.smartPtr
          return (
            t !== i && xe('Both smartPtrType and smartPtr must be specified'),
            (r.count = { value: 1 }),
            de(Object.create(e, { $$: { value: r, writable: !0 } }))
          )
        }
      function Nt(e) {
        var r = this.getPointee(e)
        if (!r) return this.destructor(e), null
        var t = Wt(this.registeredClass, r)
        if (t !== void 0) {
          if (t.$$.count.value === 0)
            return (t.$$.ptr = r), (t.$$.smartPtr = e), t.clone()
          var i = t.clone()
          return this.destructor(e), i
        }
        function n() {
          return this.isSmartPointer
            ? Pe(this.registeredClass.instancePrototype, {
                ptrType: this.pointeeType,
                ptr: r,
                smartPtrType: this,
                smartPtr: e,
              })
            : Pe(this.registeredClass.instancePrototype, {
                ptrType: this,
                ptr: e,
              })
        }
        var o = this.registeredClass.getActualType(r),
          f = Dr[o]
        if (!f) return n.call(this)
        var l
        this.isConst ? (l = f.constPointerType) : (l = f.pointerType)
        var d = $r(r, this.registeredClass, l.registeredClass)
        return d === null
          ? n.call(this)
          : this.isSmartPointer
            ? Pe(l.registeredClass.instancePrototype, {
                ptrType: l,
                ptr: d,
                smartPtrType: this,
                smartPtr: e,
              })
            : Pe(l.registeredClass.instancePrototype, { ptrType: l, ptr: d })
      }
      var de = e =>
          typeof FinalizationRegistry == 'undefined'
            ? ((de = r => r), e)
            : ((Ge = new FinalizationRegistry(r => {
                Cr(r.$$)
              })),
              (de = r => {
                var t = r.$$,
                  i = !!t.smartPtr
                if (i) {
                  var n = { $$: t }
                  Ge.register(r, n, r)
                }
                return r
              }),
              (Tr = r => Ge.unregister(r)),
              de(e)),
        Ht = () => {
          Object.assign(Te.prototype, {
            isAliasOf(e) {
              if (!(this instanceof Te) || !(e instanceof Te)) return !1
              var r = this.$$.ptrType.registeredClass,
                t = this.$$.ptr
              e.$$ = e.$$
              for (
                var i = e.$$.ptrType.registeredClass, n = e.$$.ptr;
                r.baseClass;

              )
                (t = r.upcast(t)), (r = r.baseClass)
              for (; i.baseClass; ) (n = i.upcast(n)), (i = i.baseClass)
              return r === i && t === n
            },
            clone() {
              if ((this.$$.ptr || Xe(this), this.$$.preservePointerOnDelete))
                return (this.$$.count.value += 1), this
              var e = de(
                Object.create(Object.getPrototypeOf(this), {
                  $$: { value: Rt(this.$$) },
                })
              )
              return (e.$$.count.value += 1), (e.$$.deleteScheduled = !1), e
            },
            delete() {
              this.$$.ptr || Xe(this),
                this.$$.deleteScheduled &&
                  !this.$$.preservePointerOnDelete &&
                  x('Object already scheduled for deletion'),
                Tr(this),
                Cr(this.$$),
                this.$$.preservePointerOnDelete ||
                  ((this.$$.smartPtr = void 0), (this.$$.ptr = void 0))
            },
            isDeleted() {
              return !this.$$.ptr
            },
            deleteLater() {
              return (
                this.$$.ptr || Xe(this),
                this.$$.deleteScheduled &&
                  !this.$$.preservePointerOnDelete &&
                  x('Object already scheduled for deletion'),
                se.push(this),
                se.length === 1 && fe && fe(Ke),
                (this.$$.deleteScheduled = !0),
                this
              )
            },
          })
        }
      function Te() {}
      var re = (e, r) => Object.defineProperty(r, 'name', { value: e }),
        Lt = (e, r, t) => {
          if (e[r].overloadTable === void 0) {
            var i = e[r]
            ;(e[r] = function (...n) {
              return (
                e[r].overloadTable.hasOwnProperty(n.length) ||
                  x(
                    `Function '${t}' called with an invalid number of arguments (${n.length}) - expects one of (${e[r].overloadTable})!`
                  ),
                e[r].overloadTable[n.length].apply(this, n)
              )
            }),
              (e[r].overloadTable = []),
              (e[r].overloadTable[i.argCount] = i)
          }
        },
        Je = (e, r, t) => {
          a.hasOwnProperty(e)
            ? ((t === void 0 ||
                (a[e].overloadTable !== void 0 &&
                  a[e].overloadTable[t] !== void 0)) &&
                x(`Cannot register public name '${e}' twice`),
              Lt(a, e, e),
              a.hasOwnProperty(t) &&
                x(
                  `Cannot register multiple overloads of a function with the same number of arguments (${t})!`
                ),
              (a[e].overloadTable[t] = r))
            : ((a[e] = r), t !== void 0 && (a[e].numArguments = t))
        },
        Bt = 48,
        Vt = 57,
        Yt = e => {
          if (e === void 0) return '_unknown'
          e = e.replace(/[^a-zA-Z0-9_]/g, '$')
          var r = e.charCodeAt(0)
          return r >= Bt && r <= Vt ? `_${e}` : e
        }
      function qt(e, r, t, i, n, o, f, l) {
        ;(this.name = e),
          (this.constructor = r),
          (this.instancePrototype = t),
          (this.rawDestructor = i),
          (this.baseClass = n),
          (this.getActualType = o),
          (this.upcast = f),
          (this.downcast = l),
          (this.pureVirtualFunctions = [])
      }
      var Qe = (e, r, t) => {
        for (; r !== t; )
          r.upcast ||
            x(
              `Expected null or instance of ${t.name}, got an instance of ${r.name}`
            ),
            (e = r.upcast(e)),
            (r = r.baseClass)
        return e
      }
      function Xt(e, r) {
        if (r === null)
          return this.isReference && x(`null is not a valid ${this.name}`), 0
        r.$$ || x(`Cannot pass "${tr(r)}" as a ${this.name}`),
          r.$$.ptr ||
            x(`Cannot pass deleted object as a pointer of type ${this.name}`)
        var t = r.$$.ptrType.registeredClass,
          i = Qe(r.$$.ptr, t, this.registeredClass)
        return i
      }
      function Gt(e, r) {
        var t
        if (r === null)
          return (
            this.isReference && x(`null is not a valid ${this.name}`),
            this.isSmartPointer
              ? ((t = this.rawConstructor()),
                e !== null && e.push(this.rawDestructor, t),
                t)
              : 0
          )
        ;(!r || !r.$$) && x(`Cannot pass "${tr(r)}" as a ${this.name}`),
          r.$$.ptr ||
            x(`Cannot pass deleted object as a pointer of type ${this.name}`),
          !this.isConst &&
            r.$$.ptrType.isConst &&
            x(
              `Cannot convert argument of type ${
                r.$$.smartPtrType ? r.$$.smartPtrType.name : r.$$.ptrType.name
              } to parameter type ${this.name}`
            )
        var i = r.$$.ptrType.registeredClass
        if (((t = Qe(r.$$.ptr, i, this.registeredClass)), this.isSmartPointer))
          switch (
            (r.$$.smartPtr === void 0 &&
              x('Passing raw pointer to smart pointer is illegal'),
            this.sharingPolicy)
          ) {
            case 0:
              r.$$.smartPtrType === this
                ? (t = r.$$.smartPtr)
                : x(
                    `Cannot convert argument of type ${
                      r.$$.smartPtrType
                        ? r.$$.smartPtrType.name
                        : r.$$.ptrType.name
                    } to parameter type ${this.name}`
                  )
              break
            case 1:
              t = r.$$.smartPtr
              break
            case 2:
              if (r.$$.smartPtrType === this) t = r.$$.smartPtr
              else {
                var n = r.clone()
                ;(t = this.rawShare(
                  t,
                  z.toHandle(() => n.delete())
                )),
                  e !== null && e.push(this.rawDestructor, t)
              }
              break
            default:
              x('Unsupporting sharing policy')
          }
        return t
      }
      function Kt(e, r) {
        if (r === null)
          return this.isReference && x(`null is not a valid ${this.name}`), 0
        r.$$ || x(`Cannot pass "${tr(r)}" as a ${this.name}`),
          r.$$.ptr ||
            x(`Cannot pass deleted object as a pointer of type ${this.name}`),
          r.$$.ptrType.isConst &&
            x(
              `Cannot convert argument of type ${r.$$.ptrType.name} to parameter type ${this.name}`
            )
        var t = r.$$.ptrType.registeredClass,
          i = Qe(r.$$.ptr, t, this.registeredClass)
        return i
      }
      var Jt = () => {
        Object.assign(Ce.prototype, {
          getPointee(e) {
            return this.rawGetPointee && (e = this.rawGetPointee(e)), e
          },
          destructor(e) {
            var r
            ;(r = this.rawDestructor) == null || r.call(this, e)
          },
          argPackAdvance: N,
          readValueFromPointer: _e,
          fromWireType: Nt,
        })
      }
      function Ce(e, r, t, i, n, o, f, l, d, c, u) {
        ;(this.name = e),
          (this.registeredClass = r),
          (this.isReference = t),
          (this.isConst = i),
          (this.isSmartPointer = n),
          (this.pointeeType = o),
          (this.sharingPolicy = f),
          (this.rawGetPointee = l),
          (this.rawConstructor = d),
          (this.rawShare = c),
          (this.rawDestructor = u),
          !n && r.baseClass === void 0
            ? i
              ? ((this.toWireType = Xt), (this.destructorFunction = null))
              : ((this.toWireType = Kt), (this.destructorFunction = null))
            : (this.toWireType = Gt)
      }
      var Fr = (e, r, t) => {
          a.hasOwnProperty(e) || xe('Replacing nonexistent public symbol'),
            a[e].overloadTable !== void 0 && t !== void 0
              ? (a[e].overloadTable[t] = r)
              : ((a[e] = r), (a[e].argCount = t))
        },
        Qt = (e, r, t) => {
          e = e.replace(/p/g, 'i')
          var i = a['dynCall_' + e]
          return i(r, ...t)
        },
        $e = [],
        Sr,
        Ar = e => {
          var r = $e[e]
          return (
            r ||
              (e >= $e.length && ($e.length = e + 1), ($e[e] = r = Sr.get(e))),
            r
          )
        },
        Zt = (e, r, t = []) => {
          if (e.includes('j')) return Qt(e, r, t)
          var i = Ar(r)(...t)
          return i
        },
        ei =
          (e, r) =>
          (...t) =>
            Zt(e, r, t),
        B = (e, r) => {
          e = j(e)
          function t() {
            return e.includes('j') ? ei(e, r) : Ar(r)
          }
          var i = t()
          return (
            typeof i != 'function' &&
              x(`unknown function pointer with signature ${e}: ${r}`),
            i
          )
        },
        ri = (e, r) => {
          var t = re(r, function (i) {
            ;(this.name = r), (this.message = i)
            var n = new Error(i).stack
            n !== void 0 &&
              (this.stack =
                this.toString() +
                `
` +
                n.replace(/^Error(:[^\n]*)?\n/, ''))
          })
          return (
            (t.prototype = Object.create(e.prototype)),
            (t.prototype.constructor = t),
            (t.prototype.toString = function () {
              return this.message === void 0
                ? this.name
                : `${this.name}: ${this.message}`
            }),
            t
          )
        },
        Rr,
        Mr = e => {
          var r = ca(e),
            t = j(r)
          return q(r), t
        },
        jr = (e, r) => {
          var t = [],
            i = {}
          function n(o) {
            if (!i[o] && !J[o]) {
              if (ke[o]) {
                ke[o].forEach(n)
                return
              }
              t.push(o), (i[o] = !0)
            }
          }
          throw (r.forEach(n), new Rr(`${e}: ` + t.map(Mr).join([', '])))
        },
        ti = (e, r, t, i, n, o, f, l, d, c, u, v, g) => {
          ;(u = j(u)),
            (o = B(n, o)),
            l && (l = B(f, l)),
            c && (c = B(d, c)),
            (g = B(v, g))
          var p = Yt(u)
          Je(p, function () {
            jr(`Cannot construct ${u} due to unbound types`, [i])
          }),
            qe([e, r, t], i ? [i] : [], y => {
              var D, Yr
              y = y[0]
              var $, R
              i
                ? (($ = y.registeredClass), (R = $.instancePrototype))
                : (R = Te.prototype)
              var C = re(u, function (...nr) {
                  if (Object.getPrototypeOf(this) !== h)
                    throw new oe("Use 'new' to construct " + u)
                  if (m.constructor_body === void 0)
                    throw new oe(u + ' has no accessible constructor')
                  var qr = m.constructor_body[nr.length]
                  if (qr === void 0)
                    throw new oe(
                      `Tried to invoke ctor of ${u} with invalid number of parameters (${
                        nr.length
                      }) - expected (${Object.keys(
                        m.constructor_body
                      ).toString()}) parameters instead!`
                    )
                  return qr.apply(this, nr)
                }),
                h = Object.create(R, { constructor: { value: C } })
              C.prototype = h
              var m = new qt(u, C, h, g, $, o, l, c)
              m.baseClass &&
                ((Yr = (D = m.baseClass).__derivedClasses) != null ||
                  (D.__derivedClasses = []),
                m.baseClass.__derivedClasses.push(m))
              var F = new Ce(u, m, !0, !1, !1),
                P = new Ce(u + '*', m, !1, !1, !1),
                I = new Ce(u + ' const*', m, !1, !0, !1)
              return (
                (Dr[e] = { pointerType: P, constPointerType: I }),
                Fr(p, C),
                [F, P, I]
              )
            })
        },
        Ze = [],
        V = [],
        er = e => {
          e > 9 && --V[e + 1] === 0 && ((V[e] = void 0), Ze.push(e))
        },
        ii = () => V.length / 2 - 5 - Ze.length,
        ai = () => {
          V.push(0, 1, void 0, 1, null, 1, !0, 1, !1, 1),
            (a.count_emval_handles = ii)
        },
        z = {
          toValue: e => (e || x('Cannot use deleted val. handle = ' + e), V[e]),
          toHandle: e => {
            switch (e) {
              case void 0:
                return 2
              case null:
                return 4
              case !0:
                return 6
              case !1:
                return 8
              default: {
                const r = Ze.pop() || V.length
                return (V[r] = e), (V[r + 1] = 1), r
              }
            }
          },
        },
        ni = {
          name: 'emscripten::val',
          fromWireType: e => {
            var r = z.toValue(e)
            return er(e), r
          },
          toWireType: (e, r) => z.toHandle(r),
          argPackAdvance: N,
          readValueFromPointer: _e,
          destructorFunction: null,
        },
        _i = e => W(e, ni),
        oi = (e, r, t) => {
          switch (r) {
            case 1:
              return t
                ? function (i) {
                    return this.fromWireType(S[i])
                  }
                : function (i) {
                    return this.fromWireType(M[i])
                  }
            case 2:
              return t
                ? function (i) {
                    return this.fromWireType(H[i >> 1])
                  }
                : function (i) {
                    return this.fromWireType(ae[i >> 1])
                  }
            case 4:
              return t
                ? function (i) {
                    return this.fromWireType(w[i >> 2])
                  }
                : function (i) {
                    return this.fromWireType(k[i >> 2])
                  }
            default:
              throw new TypeError(`invalid integer width (${r}): ${e}`)
          }
        },
        si = (e, r, t, i) => {
          r = j(r)
          function n() {}
          ;(n.values = {}),
            W(e, {
              name: r,
              constructor: n,
              fromWireType: function (o) {
                return this.constructor.values[o]
              },
              toWireType: (o, f) => f.value,
              argPackAdvance: N,
              readValueFromPointer: oi(r, t, i),
              destructorFunction: null,
            }),
            Je(r, n)
        },
        rr = (e, r) => {
          var t = J[e]
          return t === void 0 && x(`${r} has unknown type ${Mr(e)}`), t
        },
        fi = (e, r, t) => {
          var i = rr(e, 'enum')
          r = j(r)
          var n = i.constructor,
            o = Object.create(i.constructor.prototype, {
              value: { value: t },
              constructor: { value: re(`${i.name}_${r}`, function () {}) },
            })
          ;(n.values[t] = o), (n[r] = o)
        },
        tr = e => {
          if (e === null) return 'null'
          var r = typeof e
          return r === 'object' || r === 'array' || r === 'function'
            ? e.toString()
            : '' + e
        },
        li = (e, r) => {
          switch (r) {
            case 4:
              return function (t) {
                return this.fromWireType(ur[t >> 2])
              }
            case 8:
              return function (t) {
                return this.fromWireType(mr[t >> 3])
              }
            default:
              throw new TypeError(`invalid float width (${r}): ${e}`)
          }
        },
        di = (e, r, t) => {
          ;(r = j(r)),
            W(e, {
              name: r,
              fromWireType: i => i,
              toWireType: (i, n) => n,
              argPackAdvance: N,
              readValueFromPointer: li(r, t),
              destructorFunction: null,
            })
        }
      function Or(e) {
        for (var r = 1; r < e.length; ++r)
          if (e[r] !== null && e[r].destructorFunction === void 0) return !0
        return !1
      }
      function Ir(e, r) {
        if (!(e instanceof Function))
          throw new TypeError(
            `new_ called with constructor type ${typeof e} which is not a function`
          )
        var t = re(e.name || 'unknownFunctionName', function () {})
        t.prototype = e.prototype
        var i = new t(),
          n = e.apply(i, r)
        return n instanceof Object ? n : i
      }
      function ci(e, r, t, i) {
        for (var n = Or(e), o = e.length, f = '', l = '', d = 0; d < o - 2; ++d)
          (f += (d !== 0 ? ', ' : '') + 'arg' + d),
            (l += (d !== 0 ? ', ' : '') + 'arg' + d + 'Wired')
        var c = `
        return function (${f}) {
        if (arguments.length !== ${o - 2}) {
          throwBindingError('function ' + humanName + ' called with ' + arguments.length + ' arguments, expected ${
            o - 2
          }');
        }`
        n &&
          (c += `var destructors = [];
`)
        var u = n ? 'destructors' : 'null',
          v = [
            'humanName',
            'throwBindingError',
            'invoker',
            'fn',
            'runDestructors',
            'retType',
            'classParam',
          ]
        r &&
          (c +=
            "var thisWired = classParam['toWireType'](" +
            u +
            `, this);
`)
        for (var d = 0; d < o - 2; ++d)
          (c +=
            'var arg' +
            d +
            'Wired = argType' +
            d +
            "['toWireType'](" +
            u +
            ', arg' +
            d +
            `);
`),
            v.push('argType' + d)
        if (
          (r && (l = 'thisWired' + (l.length > 0 ? ', ' : '') + l),
          (c +=
            (t || i ? 'var rv = ' : '') +
            'invoker(fn' +
            (l.length > 0 ? ', ' : '') +
            l +
            `);
`),
          n)
        )
          c += `runDestructors(destructors);
`
        else
          for (var d = r ? 1 : 2; d < e.length; ++d) {
            var g = d === 1 ? 'thisWired' : 'arg' + (d - 2) + 'Wired'
            e[d].destructorFunction !== null &&
              ((c += `${g}_dtor(${g});
`),
              v.push(`${g}_dtor`))
          }
        return (
          t &&
            (c += `var ret = retType['fromWireType'](rv);
return ret;
`),
          (c += `}
`),
          [v, c]
        )
      }
      function hi(e, r, t, i, n, o) {
        var f = r.length
        f < 2 &&
          x(
            "argTypes array size mismatch! Must at least get return value and 'this' types!"
          )
        for (
          var l = r[1] !== null && t !== null,
            d = Or(r),
            c = r[0].name !== 'void',
            u = [e, x, i, n, Ye, r[0], r[1]],
            v = 0;
          v < f - 2;
          ++v
        )
          u.push(r[v + 2])
        if (!d)
          for (var v = l ? 1 : 2; v < r.length; ++v)
            r[v].destructorFunction !== null && u.push(r[v].destructorFunction)
        let [g, p] = ci(r, l, c, o)
        g.push(p)
        var y = Ir(Function, g)(...u)
        return re(e, y)
      }
      var ui = (e, r) => {
          for (var t = [], i = 0; i < e; i++) t.push(k[(r + i * 4) >> 2])
          return t
        },
        mi = e => {
          e = e.trim()
          const r = e.indexOf('(')
          return r !== -1 ? e.substr(0, r) : e
        },
        vi = (e, r, t, i, n, o, f) => {
          var l = ui(r, t)
          ;(e = j(e)),
            (e = mi(e)),
            (n = B(i, n)),
            Je(
              e,
              function () {
                jr(`Cannot call ${e} due to unbound types`, l)
              },
              r - 1
            ),
            qe([], l, d => {
              var c = [d[0], null].concat(d.slice(1))
              return Fr(e, hi(e, c, null, n, o, f), r - 1), []
            })
        },
        gi = (e, r, t) => {
          switch (r) {
            case 1:
              return t ? i => S[i] : i => M[i]
            case 2:
              return t ? i => H[i >> 1] : i => ae[i >> 1]
            case 4:
              return t ? i => w[i >> 2] : i => k[i >> 2]
            default:
              throw new TypeError(`invalid integer width (${r}): ${e}`)
          }
        },
        pi = (e, r, t, i, n) => {
          ;(r = j(r)), n === -1 && (n = 4294967295)
          var o = u => u
          if (i === 0) {
            var f = 32 - 8 * t
            o = u => (u << f) >>> f
          }
          var l = r.includes('unsigned'),
            d = (u, v) => {},
            c
          l
            ? (c = function (u, v) {
                return d(v, this.name), v >>> 0
              })
            : (c = function (u, v) {
                return d(v, this.name), v
              }),
            W(e, {
              name: r,
              fromWireType: o,
              toWireType: c,
              argPackAdvance: N,
              readValueFromPointer: gi(r, t, i !== 0),
              destructorFunction: null,
            })
        },
        yi = (e, r, t) => {
          var i = [
              Int8Array,
              Uint8Array,
              Int16Array,
              Uint16Array,
              Int32Array,
              Uint32Array,
              Float32Array,
              Float64Array,
            ],
            n = i[r]
          function o(f) {
            var l = k[f >> 2],
              d = k[(f + 4) >> 2]
            return new n(S.buffer, d, l)
          }
          ;(t = j(t)),
            W(
              e,
              {
                name: t,
                fromWireType: o,
                argPackAdvance: N,
                readValueFromPointer: o,
              },
              { ignoreDuplicateRegistrations: !0 }
            )
        },
        wi = (e, r, t) => Be(e, M, r, t),
        bi = (e, r) => {
          r = j(r)
          var t = r === 'std::string'
          W(e, {
            name: r,
            fromWireType(i) {
              var n = k[i >> 2],
                o = i + 4,
                f
              if (t)
                for (var l = o, d = 0; d <= n; ++d) {
                  var c = o + d
                  if (d == n || M[c] == 0) {
                    var u = c - l,
                      v = K(l, u)
                    f === void 0 ? (f = v) : ((f += '\0'), (f += v)),
                      (l = c + 1)
                  }
                }
              else {
                for (var g = new Array(n), d = 0; d < n; ++d)
                  g[d] = String.fromCharCode(M[o + d])
                f = g.join('')
              }
              return q(i), f
            },
            toWireType(i, n) {
              n instanceof ArrayBuffer && (n = new Uint8Array(n))
              var o,
                f = typeof n == 'string'
              f ||
                n instanceof Uint8Array ||
                n instanceof Uint8ClampedArray ||
                n instanceof Int8Array ||
                x('Cannot pass non-string to std::string'),
                t && f ? (o = Le(n)) : (o = n.length)
              var l = Hr(4 + o + 1),
                d = l + 4
              if (((k[l >> 2] = o), t && f)) wi(n, d, o + 1)
              else if (f)
                for (var c = 0; c < o; ++c) {
                  var u = n.charCodeAt(c)
                  u > 255 &&
                    (q(d),
                    x(
                      'String has UTF-16 code units that do not fit in 8 bits'
                    )),
                    (M[d + c] = u)
                }
              else for (var c = 0; c < o; ++c) M[d + c] = n[c]
              return i !== null && i.push(q, l), l
            },
            argPackAdvance: N,
            readValueFromPointer: _e,
            destructorFunction(i) {
              q(i)
            },
          })
        },
        zr =
          typeof TextDecoder != 'undefined'
            ? new TextDecoder('utf-16le')
            : void 0,
        Ei = (e, r) => {
          for (var t = e, i = t >> 1, n = i + r / 2; !(i >= n) && ae[i]; ) ++i
          if (((t = i << 1), t - e > 32 && zr))
            return zr.decode(M.subarray(e, t))
          for (var o = '', f = 0; !(f >= r / 2); ++f) {
            var l = H[(e + f * 2) >> 1]
            if (l == 0) break
            o += String.fromCharCode(l)
          }
          return o
        },
        ki = (e, r, t) => {
          if ((t != null || (t = 2147483647), t < 2)) return 0
          t -= 2
          for (
            var i = r, n = t < e.length * 2 ? t / 2 : e.length, o = 0;
            o < n;
            ++o
          ) {
            var f = e.charCodeAt(o)
            ;(H[r >> 1] = f), (r += 2)
          }
          return (H[r >> 1] = 0), r - i
        },
        xi = e => e.length * 2,
        Pi = (e, r) => {
          for (var t = 0, i = ''; !(t >= r / 4); ) {
            var n = w[(e + t * 4) >> 2]
            if (n == 0) break
            if ((++t, n >= 65536)) {
              var o = n - 65536
              i += String.fromCharCode(55296 | (o >> 10), 56320 | (o & 1023))
            } else i += String.fromCharCode(n)
          }
          return i
        },
        Ti = (e, r, t) => {
          if ((t != null || (t = 2147483647), t < 4)) return 0
          for (var i = r, n = i + t - 4, o = 0; o < e.length; ++o) {
            var f = e.charCodeAt(o)
            if (f >= 55296 && f <= 57343) {
              var l = e.charCodeAt(++o)
              f = (65536 + ((f & 1023) << 10)) | (l & 1023)
            }
            if (((w[r >> 2] = f), (r += 4), r + 4 > n)) break
          }
          return (w[r >> 2] = 0), r - i
        },
        Ci = e => {
          for (var r = 0, t = 0; t < e.length; ++t) {
            var i = e.charCodeAt(t)
            i >= 55296 && i <= 57343 && ++t, (r += 4)
          }
          return r
        },
        $i = (e, r, t) => {
          t = j(t)
          var i, n, o, f
          r === 2
            ? ((i = Ei), (n = ki), (f = xi), (o = l => ae[l >> 1]))
            : r === 4 && ((i = Pi), (n = Ti), (f = Ci), (o = l => k[l >> 2])),
            W(e, {
              name: t,
              fromWireType: l => {
                for (var d = k[l >> 2], c, u = l + 4, v = 0; v <= d; ++v) {
                  var g = l + 4 + v * r
                  if (v == d || o(g) == 0) {
                    var p = g - u,
                      y = i(u, p)
                    c === void 0 ? (c = y) : ((c += '\0'), (c += y)),
                      (u = g + r)
                  }
                }
                return q(l), c
              },
              toWireType: (l, d) => {
                typeof d != 'string' &&
                  x(`Cannot pass non-string to C++ string type ${t}`)
                var c = f(d),
                  u = Hr(4 + c + r)
                return (
                  (k[u >> 2] = c / r),
                  n(d, u + 4, c + r),
                  l !== null && l.push(q, u),
                  u
                )
              },
              argPackAdvance: N,
              readValueFromPointer: _e,
              destructorFunction(l) {
                q(l)
              },
            })
        },
        Di = (e, r, t, i, n, o) => {
          Ee[e] = {
            name: j(r),
            rawConstructor: B(t, i),
            rawDestructor: B(n, o),
            fields: [],
          }
        },
        Fi = (e, r, t, i, n, o, f, l, d, c) => {
          Ee[e].fields.push({
            fieldName: j(r),
            getterReturnType: t,
            getter: B(i, n),
            getterContext: o,
            setterArgumentType: f,
            setter: B(l, d),
            setterContext: c,
          })
        },
        Si = (e, r) => {
          ;(r = j(r)),
            W(e, {
              isVoid: !0,
              name: r,
              argPackAdvance: 0,
              fromWireType: () => {},
              toWireType: (t, i) => {},
            })
        },
        Ai = (e, r, t) => M.copyWithin(e, r, r + t),
        Ri = {},
        Ur = e => {
          var r = Ri[e]
          return r === void 0 ? j(e) : r
        },
        ir = [],
        Mi = (e, r, t, i, n) => (
          (e = ir[e]), (r = z.toValue(r)), (t = Ur(t)), e(r, r[t], i, n)
        ),
        ji = e => {
          var r = ir.length
          return ir.push(e), r
        },
        Oi = (e, r) => {
          for (var t = new Array(e), i = 0; i < e; ++i)
            t[i] = rr(k[(r + i * 4) >> 2], 'parameter ' + i)
          return t
        },
        ya = Reflect.construct,
        Ii = (e, r, t) => {
          var i = [],
            n = e.toWireType(i, t)
          return i.length && (k[r >> 2] = z.toHandle(i)), n
        },
        zi = (e, r, t) => {
          var i = Oi(e, r),
            n = i.shift()
          e--
          var o = `return function (obj, func, destructorsRef, args) {
`,
            f = 0,
            l = []
          t === 0 && l.push('obj')
          for (var d = ['retType'], c = [n], u = 0; u < e; ++u)
            l.push('arg' + u),
              d.push('argType' + u),
              c.push(i[u]),
              (o += `  var arg${u} = argType${u}.readValueFromPointer(args${
                f ? '+' + f : ''
              });
`),
              (f += i[u].argPackAdvance)
          var v = t === 1 ? 'new func' : 'func.call'
          ;(o += `  var rv = ${v}(${l.join(', ')});
`),
            n.isVoid ||
              (d.push('emval_returnValue'),
              c.push(Ii),
              (o += `  return emval_returnValue(retType, destructorsRef, rv);
`)),
            (o += `};
`),
            d.push(o)
          var g = Ir(Function, d)(...c),
            p = `methodCaller<(${i.map(y => y.name).join(', ')}) => ${n.name}>`
          return ji(re(p, g))
        },
        Ui = e => {
          e > 9 && (V[e + 1] += 1)
        },
        Wi = () => z.toHandle([]),
        Ni = e => z.toHandle(Ur(e)),
        Hi = () => z.toHandle({}),
        Li = e => {
          var r = z.toValue(e)
          Ye(r), er(e)
        },
        Bi = (e, r, t) => {
          ;(e = z.toValue(e)),
            (r = z.toValue(r)),
            (t = z.toValue(t)),
            (e[r] = t)
        },
        Vi = (e, r) => {
          e = rr(e, '_emval_take_value')
          var t = e.readValueFromPointer(r)
          return z.toHandle(t)
        },
        Yi = () => 2147483648,
        qi = e => {
          var r = ve.buffer,
            t = (e - r.byteLength + 65535) / 65536
          try {
            return ve.grow(t), vr(), 1
          } catch {}
        },
        Xi = e => {
          var r = M.length
          e >>>= 0
          var t = Yi()
          if (e > t) return !1
          for (
            var i = (d, c) => d + ((c - (d % c)) % c), n = 1;
            n <= 4;
            n *= 2
          ) {
            var o = r * (1 + 0.2 / n)
            o = Math.min(o, e + 100663296)
            var f = Math.min(t, i(Math.max(e, o), 65536)),
              l = qi(f)
            if (l) return !0
          }
          return !1
        },
        ar = {},
        Gi = () => Re || './this.program',
        ce = () => {
          if (!ce.strings) {
            var e =
                (
                  (typeof navigator == 'object' &&
                    navigator.languages &&
                    navigator.languages[0]) ||
                  'C'
                ).replace('-', '_') + '.UTF-8',
              r = {
                USER: 'web_user',
                LOGNAME: 'web_user',
                PATH: '/',
                PWD: '/',
                HOME: '/home/web_user',
                LANG: e,
                _: Gi(),
              }
            for (var t in ar) ar[t] === void 0 ? delete r[t] : (r[t] = ar[t])
            var i = []
            for (var t in r) i.push(`${t}=${r[t]}`)
            ce.strings = i
          }
          return ce.strings
        },
        Ki = (e, r) => {
          for (var t = 0; t < e.length; ++t) S[r++] = e.charCodeAt(t)
          S[r] = 0
        },
        Ji = (e, r) => {
          var t = 0
          return (
            ce().forEach((i, n) => {
              var o = r + t
              ;(k[(e + n * 4) >> 2] = o), Ki(i, o), (t += i.length + 1)
            }),
            0
          )
        },
        Qi = (e, r) => {
          var t = ce()
          k[e >> 2] = t.length
          var i = 0
          return t.forEach(n => (i += n.length + 1)), (k[r >> 2] = i), 0
        }
      function Zi(e) {
        try {
          var r = O.getStreamFromFD(e)
          return _.close(r), 0
        } catch (t) {
          if (typeof _ == 'undefined' || t.name !== 'ErrnoError') throw t
          return t.errno
        }
      }
      var ea = (e, r, t, i) => {
        for (var n = 0, o = 0; o < t; o++) {
          var f = k[r >> 2],
            l = k[(r + 4) >> 2]
          r += 8
          var d = _.read(e, S, f, l, i)
          if (d < 0) return -1
          if (((n += d), d < l)) break
          typeof i != 'undefined' && (i += d)
        }
        return n
      }
      function ra(e, r, t, i) {
        try {
          var n = O.getStreamFromFD(e),
            o = ea(n, r, t)
          return (k[i >> 2] = o), 0
        } catch (f) {
          if (typeof _ == 'undefined' || f.name !== 'ErrnoError') throw f
          return f.errno
        }
      }
      var ta = (e, r) =>
        (r + 2097152) >>> 0 < 4194305 - !!e ? (e >>> 0) + r * 4294967296 : NaN
      function ia(e, r, t, i, n) {
        var o = ta(r, t)
        try {
          if (isNaN(o)) return 61
          var f = O.getStreamFromFD(e)
          return (
            _.llseek(f, o, i),
            (A = [
              f.position >>> 0,
              ((E = f.position),
              +Math.abs(E) >= 1
                ? E > 0
                  ? +Math.floor(E / 4294967296) >>> 0
                  : ~~+Math.ceil((E - +(~~E >>> 0)) / 4294967296) >>> 0
                : 0),
            ]),
            (w[n >> 2] = A[0]),
            (w[(n + 4) >> 2] = A[1]),
            f.getdents && o === 0 && i === 0 && (f.getdents = null),
            0
          )
        } catch (l) {
          if (typeof _ == 'undefined' || l.name !== 'ErrnoError') throw l
          return l.errno
        }
      }
      var aa = (e, r, t, i) => {
        for (var n = 0, o = 0; o < t; o++) {
          var f = k[r >> 2],
            l = k[(r + 4) >> 2]
          r += 8
          var d = _.write(e, S, f, l, i)
          if (d < 0) return -1
          ;(n += d), typeof i != 'undefined' && (i += d)
        }
        return n
      }
      function na(e, r, t, i) {
        try {
          var n = O.getStreamFromFD(e),
            o = aa(n, r, t)
          return (k[i >> 2] = o), 0
        } catch (f) {
          if (typeof _ == 'undefined' || f.name !== 'ErrnoError') throw f
          return f.errno
        }
      }
      var De = e => e % 4 === 0 && (e % 100 !== 0 || e % 400 === 0),
        _a = (e, r) => {
          for (var t = 0, i = 0; i <= r; t += e[i++]);
          return t
        },
        Wr = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
        Nr = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
        oa = (e, r) => {
          for (var t = new Date(e.getTime()); r > 0; ) {
            var i = De(t.getFullYear()),
              n = t.getMonth(),
              o = (i ? Wr : Nr)[n]
            if (r > o - t.getDate())
              (r -= o - t.getDate() + 1),
                t.setDate(1),
                n < 11
                  ? t.setMonth(n + 1)
                  : (t.setMonth(0), t.setFullYear(t.getFullYear() + 1))
            else return t.setDate(t.getDate() + r), t
          }
          return t
        },
        sa = (e, r) => {
          S.set(e, r)
        },
        fa = (e, r, t, i) => {
          var n = k[(i + 40) >> 2],
            o = {
              tm_sec: w[i >> 2],
              tm_min: w[(i + 4) >> 2],
              tm_hour: w[(i + 8) >> 2],
              tm_mday: w[(i + 12) >> 2],
              tm_mon: w[(i + 16) >> 2],
              tm_year: w[(i + 20) >> 2],
              tm_wday: w[(i + 24) >> 2],
              tm_yday: w[(i + 28) >> 2],
              tm_isdst: w[(i + 32) >> 2],
              tm_gmtoff: w[(i + 36) >> 2],
              tm_zone: n ? K(n) : '',
            },
            f = K(t),
            l = {
              '%c': '%a %b %d %H:%M:%S %Y',
              '%D': '%m/%d/%y',
              '%F': '%Y-%m-%d',
              '%h': '%b',
              '%r': '%I:%M:%S %p',
              '%R': '%H:%M',
              '%T': '%H:%M:%S',
              '%x': '%m/%d/%y',
              '%X': '%H:%M:%S',
              '%Ec': '%c',
              '%EC': '%C',
              '%Ex': '%m/%d/%y',
              '%EX': '%H:%M:%S',
              '%Ey': '%y',
              '%EY': '%Y',
              '%Od': '%d',
              '%Oe': '%e',
              '%OH': '%H',
              '%OI': '%I',
              '%Om': '%m',
              '%OM': '%M',
              '%OS': '%S',
              '%Ou': '%u',
              '%OU': '%U',
              '%OV': '%V',
              '%Ow': '%w',
              '%OW': '%W',
              '%Oy': '%y',
            }
          for (var d in l) f = f.replace(new RegExp(d, 'g'), l[d])
          var c = [
              'Sunday',
              'Monday',
              'Tuesday',
              'Wednesday',
              'Thursday',
              'Friday',
              'Saturday',
            ],
            u = [
              'January',
              'February',
              'March',
              'April',
              'May',
              'June',
              'July',
              'August',
              'September',
              'October',
              'November',
              'December',
            ]
          function v(h, m, F) {
            for (
              var P = typeof h == 'number' ? h.toString() : h || '';
              P.length < m;

            )
              P = F[0] + P
            return P
          }
          function g(h, m) {
            return v(h, m, '0')
          }
          function p(h, m) {
            function F(I) {
              return I < 0 ? -1 : I > 0 ? 1 : 0
            }
            var P
            return (
              (P = F(h.getFullYear() - m.getFullYear())) === 0 &&
                (P = F(h.getMonth() - m.getMonth())) === 0 &&
                (P = F(h.getDate() - m.getDate())),
              P
            )
          }
          function y(h) {
            switch (h.getDay()) {
              case 0:
                return new Date(h.getFullYear() - 1, 11, 29)
              case 1:
                return h
              case 2:
                return new Date(h.getFullYear(), 0, 3)
              case 3:
                return new Date(h.getFullYear(), 0, 2)
              case 4:
                return new Date(h.getFullYear(), 0, 1)
              case 5:
                return new Date(h.getFullYear() - 1, 11, 31)
              case 6:
                return new Date(h.getFullYear() - 1, 11, 30)
            }
          }
          function $(h) {
            var m = oa(new Date(h.tm_year + 1900, 0, 1), h.tm_yday),
              F = new Date(m.getFullYear(), 0, 4),
              P = new Date(m.getFullYear() + 1, 0, 4),
              I = y(F),
              D = y(P)
            return p(I, m) <= 0
              ? p(D, m) <= 0
                ? m.getFullYear() + 1
                : m.getFullYear()
              : m.getFullYear() - 1
          }
          var R = {
            '%a': h => c[h.tm_wday].substring(0, 3),
            '%A': h => c[h.tm_wday],
            '%b': h => u[h.tm_mon].substring(0, 3),
            '%B': h => u[h.tm_mon],
            '%C': h => {
              var m = h.tm_year + 1900
              return g((m / 100) | 0, 2)
            },
            '%d': h => g(h.tm_mday, 2),
            '%e': h => v(h.tm_mday, 2, ' '),
            '%g': h => $(h).toString().substring(2),
            '%G': $,
            '%H': h => g(h.tm_hour, 2),
            '%I': h => {
              var m = h.tm_hour
              return m == 0 ? (m = 12) : m > 12 && (m -= 12), g(m, 2)
            },
            '%j': h =>
              g(
                h.tm_mday + _a(De(h.tm_year + 1900) ? Wr : Nr, h.tm_mon - 1),
                3
              ),
            '%m': h => g(h.tm_mon + 1, 2),
            '%M': h => g(h.tm_min, 2),
            '%n': () => `
`,
            '%p': h => (h.tm_hour >= 0 && h.tm_hour < 12 ? 'AM' : 'PM'),
            '%S': h => g(h.tm_sec, 2),
            '%t': () => '	',
            '%u': h => h.tm_wday || 7,
            '%U': h => {
              var m = h.tm_yday + 7 - h.tm_wday
              return g(Math.floor(m / 7), 2)
            },
            '%V': h => {
              var m = Math.floor((h.tm_yday + 7 - ((h.tm_wday + 6) % 7)) / 7)
              if (((h.tm_wday + 371 - h.tm_yday - 2) % 7 <= 2 && m++, m)) {
                if (m == 53) {
                  var P = (h.tm_wday + 371 - h.tm_yday) % 7
                  P != 4 && (P != 3 || !De(h.tm_year)) && (m = 1)
                }
              } else {
                m = 52
                var F = (h.tm_wday + 7 - h.tm_yday - 1) % 7
                ;(F == 4 || (F == 5 && De((h.tm_year % 400) - 1))) && m++
              }
              return g(m, 2)
            },
            '%w': h => h.tm_wday,
            '%W': h => {
              var m = h.tm_yday + 7 - ((h.tm_wday + 6) % 7)
              return g(Math.floor(m / 7), 2)
            },
            '%y': h => (h.tm_year + 1900).toString().substring(2),
            '%Y': h => h.tm_year + 1900,
            '%z': h => {
              var m = h.tm_gmtoff,
                F = m >= 0
              return (
                (m = Math.abs(m) / 60),
                (m = (m / 60) * 100 + (m % 60)),
                (F ? '+' : '-') + ('0000' + m).slice(-4)
              )
            },
            '%Z': h => h.tm_zone,
            '%%': () => '%',
          }
          f = f.replace(/%%/g, '\0\0')
          for (var d in R)
            f.includes(d) && (f = f.replace(new RegExp(d, 'g'), R[d](o)))
          f = f.replace(/\0\0/g, '%')
          var C = be(f, !1)
          return C.length > r ? 0 : (sa(C, e), C.length - 1)
        },
        la = (e, r, t, i, n) => fa(e, r, t, i)
      ;(_.createPreloadedFile = Et),
        _.staticInit(),
        (xr = a.InternalError =
          class extends Error {
            constructor(r) {
              super(r), (this.name = 'InternalError')
            }
          }),
        Ft(),
        (oe = a.BindingError =
          class extends Error {
            constructor(r) {
              super(r), (this.name = 'BindingError')
            }
          }),
        Ht(),
        zt(),
        Jt(),
        (Rr = a.UnboundTypeError = ri(Error, 'UnboundTypeError')),
        ai()
      var da = {
          a: ct,
          l: mt,
          r: xt,
          D: Pt,
          E: Tt,
          F: Ct,
          v: $t,
          y: Dt,
          J: At,
          n: ti,
          I: _i,
          j: si,
          b: fi,
          u: di,
          f: vi,
          i: pi,
          d: yi,
          t: bi,
          p: $i,
          w: Di,
          m: Fi,
          K: Si,
          H: Ai,
          M: Mi,
          c: er,
          N: zi,
          O: Ui,
          q: Wi,
          h: Ni,
          k: Hi,
          L: Li,
          g: Bi,
          e: Vi,
          G: Xi,
          A: Ji,
          B: Qi,
          s: Zi,
          C: ra,
          x: ia,
          o: na,
          z: la,
        },
        s = dt(),
        wa = s.Q,
        ba = (a._memcpy = s.R),
        Ea = (a._heif_image_release = s.T),
        Hr = (a._malloc = s.U),
        ka = (a._heif_nclx_color_profile_set_color_primaries = s.V),
        q = (a._free = s.W),
        xa = (a._heif_nclx_color_profile_set_transfer_characteristics = s.X),
        Pa = (a._heif_nclx_color_profile_set_matrix_coefficients = s.Y),
        Ta = (a._heif_init = s.Z),
        Ca = (a._heif_deinit = s._),
        $a = (a._heif_load_plugin = s.$),
        Da = (a._heif_unload_plugin = s.aa),
        Fa = (a._heif_load_plugins = s.ba),
        Sa = (a._heif_get_plugin_directories = s.ca),
        Aa = (a._heif_free_plugin_directories = s.da),
        Ra = (a._heif_get_version = s.ea),
        Ma = (a._heif_get_version_number = s.fa),
        ja = (a._heif_get_version_number_major = s.ga),
        Oa = (a._heif_get_version_number_minor = s.ha),
        Ia = (a._heif_get_version_number_maintenance = s.ia),
        za = (a._heif_check_filetype = s.ja),
        Ua = (a._heif_read_main_brand = s.ka),
        Wa = (a._heif_has_compatible_filetype = s.la),
        Na = (a._heif_list_compatible_brands = s.ma),
        Ha = (a._heif_free_list_of_compatible_brands = s.na),
        La = (a._heif_check_jpeg_filetype = s.oa),
        Ba = (a._heif_main_brand = s.pa),
        Va = (a._heif_fourcc_to_brand = s.qa),
        Ya = (a._heif_brand_to_fourcc = s.ra),
        qa = (a._heif_has_compatible_brand = s.sa),
        Xa = (a._heif_get_file_mime_type = s.ta),
        Ga = (a._heif_context_alloc = s.ua),
        Ka = (a._heif_context_free = s.va),
        Ja = (a._heif_context_read_from_file = s.wa),
        Qa = (a._heif_context_read_from_memory = s.xa),
        Za = (a._heif_context_read_from_memory_without_copy = s.ya),
        en = (a._heif_context_read_from_reader = s.za),
        rn = (a._heif_context_debug_dump_boxes_to_file = s.Aa),
        tn = (a._heif_context_get_primary_image_handle = s.Ba),
        an = (a._heif_context_get_primary_image_ID = s.Ca),
        nn = (a._heif_context_is_top_level_image_ID = s.Da),
        _n = (a._heif_context_get_number_of_top_level_images = s.Ea),
        on = (a._heif_context_get_list_of_top_level_image_IDs = s.Fa),
        sn = (a._heif_context_get_image_handle = s.Ga),
        fn = (a._heif_image_handle_is_primary_image = s.Ha),
        ln = (a._heif_image_handle_get_item_id = s.Ia),
        dn = (a._heif_image_handle_get_number_of_thumbnails = s.Ja),
        cn = (a._heif_image_handle_get_list_of_thumbnail_IDs = s.Ka),
        hn = (a._heif_image_handle_get_thumbnail = s.La),
        un = (a._heif_image_handle_get_number_of_auxiliary_images = s.Ma),
        mn = (a._heif_image_handle_get_list_of_auxiliary_image_IDs = s.Na),
        vn = (a._heif_image_handle_get_auxiliary_type = s.Oa),
        gn = (a._heif_image_handle_release_auxiliary_type = s.Pa),
        pn = (a._heif_image_handle_free_auxiliary_types = s.Qa),
        yn = (a._heif_image_handle_get_auxiliary_image_handle = s.Ra),
        wn = (a._heif_image_handle_get_width = s.Sa),
        bn = (a._heif_image_handle_get_height = s.Ta),
        En = (a._heif_image_handle_get_ispe_width = s.Ua),
        kn = (a._heif_image_handle_get_ispe_height = s.Va),
        xn = (a._heif_image_handle_get_context = s.Wa),
        Pn = (a._heif_image_handle_get_preferred_decoding_colorspace = s.Xa),
        Tn = (a._heif_image_handle_has_alpha_channel = s.Ya),
        Cn = (a._heif_image_handle_is_premultiplied_alpha = s.Za),
        $n = (a._heif_image_handle_get_luma_bits_per_pixel = s._a),
        Dn = (a._heif_image_handle_get_chroma_bits_per_pixel = s.$a),
        Fn = (a._heif_image_handle_has_depth_image = s.ab),
        Sn = (a._heif_depth_representation_info_free = s.bb),
        An = (a._heif_image_handle_get_depth_image_representation_info = s.cb),
        Rn = (a._heif_image_handle_get_number_of_depth_images = s.db),
        Mn = (a._heif_image_handle_get_list_of_depth_image_IDs = s.eb),
        jn = (a._heif_image_handle_get_depth_image_handle = s.fb),
        On = (a._heif_decoding_options_alloc = s.gb),
        In = (a._heif_decoding_options_free = s.hb),
        zn = (a._heif_decode_image = s.ib),
        Un = (a._heif_image_create = s.jb),
        Wn = (a._heif_image_get_decoding_warnings = s.kb),
        Nn = (a._heif_image_add_decoding_warning = s.lb),
        Hn = (a._heif_image_has_content_light_level = s.mb),
        Ln = (a._heif_image_get_content_light_level = s.nb),
        Bn = (a._heif_image_set_content_light_level = s.ob),
        Vn = (a._heif_image_has_mastering_display_colour_volume = s.pb),
        Yn = (a._heif_image_get_mastering_display_colour_volume = s.qb),
        qn = (a._heif_image_set_mastering_display_colour_volume = s.rb),
        Xn = (a._heif_mastering_display_colour_volume_decode = s.sb),
        Gn = (a._heif_image_get_pixel_aspect_ratio = s.tb),
        Kn = (a._heif_image_set_pixel_aspect_ratio = s.ub),
        Jn = (a._heif_image_handle_release = s.vb),
        Qn = (a._heif_image_get_colorspace = s.wb),
        Zn = (a._heif_image_get_chroma_format = s.xb),
        e_ = (a._heif_image_get_width = s.yb),
        r_ = (a._heif_image_get_height = s.zb),
        t_ = (a._heif_image_get_primary_width = s.Ab),
        i_ = (a._heif_image_get_primary_height = s.Bb),
        a_ = (a._heif_image_crop = s.Cb),
        n_ = (a._heif_image_get_bits_per_pixel = s.Db),
        __ = (a._heif_image_get_bits_per_pixel_range = s.Eb),
        o_ = (a._heif_image_has_channel = s.Fb),
        s_ = (a._heif_image_add_plane = s.Gb),
        f_ = (a._heif_image_get_plane_readonly = s.Hb),
        l_ = (a._heif_image_get_plane = s.Ib),
        d_ = (a._heif_image_set_premultiplied_alpha = s.Jb),
        c_ = (a._heif_image_is_premultiplied_alpha = s.Kb),
        h_ = (a._heif_image_extend_padding_to_size = s.Lb),
        u_ = (a._heif_image_scale_image = s.Mb),
        m_ = (a._heif_image_set_raw_color_profile = s.Nb),
        v_ = (a._heif_image_set_nclx_color_profile = s.Ob),
        g_ = (a._heif_image_handle_get_number_of_metadata_blocks = s.Pb),
        p_ = (a._heif_image_handle_get_list_of_metadata_block_IDs = s.Qb),
        y_ = (a._heif_image_handle_get_metadata_type = s.Rb),
        w_ = (a._heif_image_handle_get_metadata_content_type = s.Sb),
        b_ = (a._heif_image_handle_get_metadata_item_uri_type = s.Tb),
        E_ = (a._heif_image_handle_get_metadata_size = s.Ub),
        k_ = (a._heif_image_handle_get_metadata = s.Vb),
        x_ = (a._heif_image_handle_get_color_profile_type = s.Wb),
        P_ = (a._heif_image_handle_get_raw_color_profile_size = s.Xb),
        T_ = (a._heif_image_handle_get_nclx_color_profile = s.Yb),
        C_ = (a._heif_image_handle_get_raw_color_profile = s.Zb),
        $_ = (a._heif_image_get_color_profile_type = s._b),
        D_ = (a._heif_image_get_raw_color_profile_size = s.$b),
        F_ = (a._heif_image_get_raw_color_profile = s.ac),
        S_ = (a._heif_image_get_nclx_color_profile = s.bc),
        A_ = (a._heif_nclx_color_profile_alloc = s.cc),
        R_ = (a._heif_nclx_color_profile_free = s.dc),
        M_ = (a._heif_image_handle_has_camera_intrinsic_matrix = s.ec),
        j_ = (a._heif_image_handle_get_camera_intrinsic_matrix = s.fc),
        O_ = (a._heif_image_handle_has_camera_extrinsic_matrix = s.gc),
        I_ = (a._heif_image_handle_get_camera_extrinsic_matrix = s.hc),
        z_ = (a._heif_camera_extrinsic_matrix_release = s.ic),
        U_ = (a._heif_camera_extrinsic_matrix_get_rotation_matrix = s.jc),
        W_ = (a._heif_register_decoder = s.kc),
        N_ = (a._heif_register_decoder_plugin = s.lc),
        H_ = (a._heif_register_encoder_plugin = s.mc),
        L_ = (a._heif_context_write_to_file = s.nc),
        B_ = (a._heif_context_write = s.oc),
        V_ = (a._heif_context_add_compatible_brand = s.pc),
        Y_ = (a._heif_context_get_encoder_descriptors = s.qc),
        q_ = (a._heif_get_encoder_descriptors = s.rc),
        X_ = (a._heif_encoder_descriptor_get_name = s.sc),
        G_ = (a._heif_encoder_descriptor_get_id_name = s.tc),
        K_ = (a._heif_get_decoder_descriptors = s.uc),
        J_ = (a._heif_decoder_descriptor_get_name = s.vc),
        Q_ = (a._heif_decoder_descriptor_get_id_name = s.wc),
        Z_ = (a._heif_encoder_descriptor_get_compression_format = s.xc),
        eo = (a._heif_encoder_descriptor_supports_lossy_compression = s.yc),
        ro = (a._heif_encoder_descriptor_supports_lossless_compression = s.zc),
        to = (a._heif_encoder_descriptor_supportes_lossy_compression = s.Ac),
        io = (a._heif_encoder_descriptor_supportes_lossless_compression = s.Bc),
        ao = (a._heif_encoder_get_name = s.Cc),
        no = (a._heif_context_get_encoder = s.Dc),
        _o = (a._heif_have_decoder_for_format = s.Ec),
        oo = (a._heif_have_encoder_for_format = s.Fc),
        so = (a._heif_context_get_encoder_for_format = s.Gc),
        fo = (a._heif_encoder_release = s.Hc),
        lo = (a._heif_encoder_set_lossy_quality = s.Ic),
        co = (a._heif_encoder_set_lossless = s.Jc),
        ho = (a._heif_encoder_set_logging_level = s.Kc),
        uo = (a._heif_encoder_list_parameters = s.Lc),
        mo = (a._heif_encoder_parameter_get_name = s.Mc),
        vo = (a._heif_encoder_parameter_get_type = s.Nc),
        go = (a._heif_encoder_set_parameter_integer = s.Oc),
        po = (a._heif_encoder_parameter_get_valid_integer_values = s.Pc),
        yo = (a._heif_encoder_get_parameter_integer = s.Qc),
        wo = (a._heif_encoder_parameter_get_valid_integer_range = s.Rc),
        bo = (a._heif_encoder_parameter_get_valid_string_values = s.Sc),
        Eo = (a._heif_encoder_parameter_integer_valid_range = s.Tc),
        ko = (a._heif_encoder_set_parameter_boolean = s.Uc),
        xo = (a._heif_encoder_get_parameter_boolean = s.Vc),
        Po = (a._heif_encoder_set_parameter_string = s.Wc),
        To = (a._heif_encoder_get_parameter_string = s.Xc),
        Co = (a._heif_encoder_parameter_string_valid_values = s.Yc),
        $o = (a._heif_encoder_parameter_integer_valid_values = s.Zc),
        Do = (a._heif_encoder_set_parameter = s._c),
        Fo = (a._heif_encoder_get_parameter = s.$c),
        So = (a._heif_encoder_has_default = s.ad),
        Ao = (a._heif_encoding_options_alloc = s.bd),
        Ro = (a._heif_encoding_options_free = s.cd),
        Mo = (a._heif_context_encode_image = s.dd),
        jo = (a._heif_context_encode_grid = s.ed),
        Oo = (a._heif_context_assign_thumbnail = s.fd),
        Io = (a._heif_context_encode_thumbnail = s.gd),
        zo = (a._heif_context_set_primary_image = s.hd),
        Uo = (a._heif_context_add_exif_metadata = s.id),
        Wo = (a._heif_context_add_XMP_metadata = s.jd),
        No = (a._heif_context_add_XMP_metadata2 = s.kd),
        Ho = (a._heif_context_add_generic_metadata = s.ld),
        Lo = (a._heif_context_add_generic_uri_metadata = s.md),
        Bo = (a._heif_context_set_maximum_image_size_limit = s.nd),
        Vo = (a._heif_context_set_max_decoding_threads = s.od),
        Yo = (a._heif_image_handle_get_number_of_region_items = s.pd),
        qo = (a._heif_image_handle_get_list_of_region_item_ids = s.qd),
        Xo = (a._heif_context_get_region_item = s.rd),
        Go = (a._heif_region_item_get_id = s.sd),
        Ko = (a._heif_region_item_release = s.td),
        Jo = (a._heif_region_item_get_reference_size = s.ud),
        Qo = (a._heif_region_item_get_number_of_regions = s.vd),
        Zo = (a._heif_region_item_get_list_of_regions = s.wd),
        es = (a._heif_image_handle_add_region_item = s.xd),
        rs = (a._heif_region_item_add_region_point = s.yd),
        ts = (a._heif_region_item_add_region_rectangle = s.zd),
        is = (a._heif_region_item_add_region_ellipse = s.Ad),
        as = (a._heif_region_item_add_region_polygon = s.Bd),
        ns = (a._heif_region_item_add_region_polyline = s.Cd),
        _s = (a._heif_region_item_add_region_referenced_mask = s.Dd),
        os = (a._heif_region_item_add_region_inline_mask_data = s.Ed),
        ss = (a._heif_region_item_add_region_inline_mask = s.Fd),
        fs = (a._heif_region_release = s.Gd),
        ls = (a._heif_region_release_many = s.Hd),
        ds = (a._heif_region_get_type = s.Id),
        cs = (a._heif_region_get_point = s.Jd),
        hs = (a._heif_region_get_point_transformed = s.Kd),
        us = (a._heif_region_get_rectangle = s.Ld),
        ms = (a._heif_region_get_rectangle_transformed = s.Md),
        vs = (a._heif_region_get_ellipse = s.Nd),
        gs = (a._heif_region_get_ellipse_transformed = s.Od),
        ps = (a._heif_region_get_polygon_num_points = s.Pd),
        ys = (a._heif_region_get_polyline_num_points = s.Qd),
        ws = (a._heif_region_get_polygon_points = s.Rd),
        bs = (a._heif_region_get_polyline_points = s.Sd),
        Es = (a._heif_region_get_polygon_points_transformed = s.Td),
        ks = (a._heif_region_get_polyline_points_transformed = s.Ud),
        xs = (a._heif_region_get_referenced_mask_ID = s.Vd),
        Ps = (a._heif_region_get_inline_mask_data_len = s.Wd),
        Ts = (a._heif_region_get_inline_mask_data = s.Xd),
        Cs = (a._heif_region_get_mask_image = s.Yd),
        $s = (a._heif_item_get_properties_of_type = s.Zd),
        Ds = (a._heif_item_get_transformation_properties = s._d),
        Fs = (a._heif_item_get_property_type = s.$d),
        Ss = (a._heif_item_get_property_user_description = s.ae),
        As = (a._heif_item_add_property_user_description = s.be),
        Rs = (a._heif_item_get_property_transform_mirror = s.ce),
        Ms = (a._heif_item_get_property_transform_rotation_ccw = s.de),
        js = (a._heif_item_get_property_transform_crop_borders = s.ee),
        Os = (a._heif_property_user_description_release = s.fe),
        Is = (a._heif_item_add_raw_property = s.ge),
        zs = (a._heif_item_get_property_raw_size = s.he),
        Us = (a._heif_item_get_property_raw_data = s.ie),
        Ws = (a._heif_context_get_number_of_items = s.je),
        Ns = (a._heif_context_get_list_of_item_IDs = s.ke),
        Hs = (a._heif_release_item_data = s.le),
        Ls = (a._heif_context_get_item_references = s.me),
        Bs = (a._heif_release_item_references = s.ne),
        Vs = (a._heif_context_add_item = s.oe),
        Ys = (a._heif_context_add_mime_item = s.pe),
        qs = (a._heif_context_add_precompressed_mime_item = s.qe),
        Xs = (a._heif_context_add_uri_item = s.re),
        Gs = (a._heif_context_add_item_reference = s.se),
        Ks = (a._heif_context_add_item_references = s.te),
        Js = (a._heif_item_get_property_camera_intrinsic_matrix = s.ue),
        Qs = (a._heif_property_camera_intrinsic_matrix_release = s.ve),
        Zs = (a._heif_property_camera_intrinsic_matrix_get_focal_length = s.we),
        ef = (a._heif_property_camera_intrinsic_matrix_get_principal_point =
          s.xe),
        rf = (a._heif_property_camera_intrinsic_matrix_get_skew = s.ye),
        tf = (a._heif_property_camera_intrinsic_matrix_alloc = s.ze),
        af = (a._heif_property_camera_intrinsic_matrix_set_simple = s.Ae),
        nf = (a._heif_property_camera_intrinsic_matrix_set_full = s.Be),
        _f = (a._heif_item_add_property_camera_intrinsic_matrix = s.Ce),
        of = (a._heif_item_get_property_camera_extrinsic_matrix = s.De),
        sf = (a._heif_property_camera_extrinsic_matrix_release = s.Ee),
        ff = (a._heif_property_camera_extrinsic_matrix_get_rotation_matrix =
          s.Fe),
        lf = (a._heif_property_camera_extrinsic_matrix_get_position_vector =
          s.Ge),
        df =
          (a._heif_property_camera_extrinsic_matrix_get_world_coordinate_system_id =
            s.He),
        cf = (a._de265_get_version = s.Ie),
        hf = (a._de265_init = s.Je),
        uf = (a._de265_free = s.Ke),
        mf = (a._de265_new_decoder = s.Le),
        vf = (a._de265_set_parameter_bool = s.Me),
        gf = (a._de265_free_decoder = s.Ne),
        pf = (a._de265_push_NAL = s.Oe),
        yf = (a._de265_flush_data = s.Pe),
        wf = (a._de265_decode = s.Qe),
        bf = (a._de265_get_next_picture = s.Re),
        Ef = (a._de265_get_chroma_format = s.Se),
        kf = (a._de265_get_image_width = s.Te),
        xf = (a._de265_get_image_height = s.Ue),
        Pf = (a._de265_get_bits_per_pixel = s.Ve),
        Tf = (a._de265_get_image_plane = s.We),
        Cf = (a._de265_get_image_colour_primaries = s.Xe),
        $f = (a._de265_get_image_transfer_characteristics = s.Ye),
        Df = (a._de265_get_image_matrix_coefficients = s.Ze),
        Ff = (a._de265_get_image_full_range_flag = s._e),
        Sf = (a._de265_release_next_picture = s.$e),
        ca = s.af,
        ha = s.bf,
        Af = (a.dynCall_ji = s.cf),
        Rf = (a.dynCall_iij = s.df),
        Mf = (a.dynCall_jiji = s.ef),
        jf = (a.dynCall_viijii = s.ff),
        Of = (a.dynCall_iiiiij = s.gf),
        If = (a.dynCall_iiiiijj = s.hf),
        zf = (a.dynCall_iiiiiijj = s.jf),
        Uf = (a._heif_error_ok = 73712),
        Wf = (a._heif_error_success = 73144),
        Nf = (a._heif_error_invalid_parameter_value = 73736),
        Hf = (a._heif_error_unsupported_parameter = 73724),
        Fe
      ne = function e() {
        Fe || Lr(), Fe || (ne = e)
      }
      function Lr() {
        if (G > 0 || (Zr(), G > 0)) return
        function e() {
          Fe ||
            ((Fe = !0),
            (a.calledRun = !0),
            !hr &&
              (et(),
              sr(a),
              a.onRuntimeInitialized && a.onRuntimeInitialized(),
              rt()))
        }
        a.setStatus
          ? (a.setStatus('Running...'),
            setTimeout(function () {
              setTimeout(function () {
                a.setStatus('')
              }, 1),
                e()
            }, 1))
          : e()
      }
      if (a.preInit)
        for (
          typeof a.preInit == 'function' && (a.preInit = [a.preInit]);
          a.preInit.length > 0;

        )
          a.preInit.pop()()
      Lr()
      function Br(e) {
        for (
          var r = new ArrayBuffer(e.length),
            t = new Uint8Array(r),
            i = 0,
            n = e.length;
          i < n;
          i++
        )
          t[i] = e.charCodeAt(i)
        return r
      }
      var X = function (e) {
        ;(this.handle = e), (this.img = null)
      }
      ;(X.prototype.free = function () {
        this.handle &&
          (a.heif_image_handle_release(this.handle), (this.handle = null))
      }),
        (X.prototype._ensureImage = function () {
          if (!this.img) {
            var e = a.heif_js_decode_image(
              this.handle,
              a.heif_colorspace.heif_colorspace_YCbCr,
              a.heif_chroma.heif_chroma_420
            )
            if (!e || e.code) {
              console.log('Decoding image failed', this.handle, e)
              return
            }
            ;(this.data = new Uint8Array(Br(e.data))),
              delete e.data,
              (this.img = e),
              e.alpha !== void 0 &&
                ((this.alpha = new Uint8Array(Br(e.alpha))), delete e.alpha)
          }
        }),
        (X.prototype.get_width = function () {
          return a.heif_image_handle_get_width(this.handle)
        }),
        (X.prototype.get_height = function () {
          return a.heif_image_handle_get_height(this.handle)
        }),
        (X.prototype.is_primary = function () {
          return !!heif_image_handle_is_primary_image(this.handle)
        }),
        (X.prototype.display = function (e, r) {
          var t = this.get_width(),
            i = this.get_height()
          setTimeout(
            function () {
              if (!this.img) {
                var n = a.heif_js_decode_image2(
                  this.handle,
                  a.heif_colorspace.heif_colorspace_RGB,
                  a.heif_chroma.heif_chroma_interleaved_RGBA
                )
                if (!n || n.code) {
                  console.log('Decoding image failed', this.handle, n), r(null)
                  return
                }
                for (let o of n.channels)
                  if (o.id == a.heif_channel.heif_channel_interleaved)
                    if (o.stride == o.width * 4) e.data.set(o.data)
                    else
                      for (let f = 0; f < o.height; f++) {
                        let l = o.data.slice(
                            f * o.stride,
                            f * o.stride + o.width * 4
                          ),
                          d = f * o.width * 4
                        e.data.set(l, d)
                      }
                a.heif_image_release(n.image)
              }
              r(e)
            }.bind(this),
            0
          )
        })
      var Vr = function () {
        this.decoder = null
      }
      Vr.prototype.decode = function (e) {
        if (
          (this.decoder && a.heif_context_free(this.decoder),
          (this.decoder = a.heif_context_alloc()),
          !this.decoder)
        )
          return console.log('Could not create HEIF context'), []
        var r = a.heif_context_read_from_memory(this.decoder, e)
        if (r.code !== a.heif_error_code.heif_error_Ok)
          return console.log('Could not parse HEIF file', r.message), []
        var t = a.heif_js_context_get_list_of_top_level_image_IDs(this.decoder)
        if (!t || t.code) return console.log('Error loading image ids', t), []
        if (!t.length) return console.log('No images found'), []
        for (var i = [], n = 0; n < t.length; n++) {
          var o = a.heif_js_context_get_image_handle(this.decoder, t[n])
          if (!o || o.code) {
            console.log('Could not get image data for id', t[n], o)
            continue
          }
          i.push(new X(o))
        }
        return i
      }
      var ua = function (e) {
        return (
          (e.charCodeAt(0) << 24) |
          (e.charCodeAt(1) << 16) |
          (e.charCodeAt(2) << 8) |
          e.charCodeAt(3)
        )
      }
      ;(a.HeifImage = X), (a.HeifDecoder = Vr), (a.fourcc = ua)
      const ma = [
        'heif_error_code',
        'heif_suberror_code',
        'heif_compression_format',
        'heif_chroma',
        'heif_colorspace',
        'heif_channel',
      ]
      for (const e of ma)
        for (const r in a[e])
          !a[e].hasOwnProperty(r) || r === 'values' || (a[r] = a[e][r])
      for (const e in a)
        e.indexOf('_heif_') !== 0 ||
          a[e.slice(1)] !== void 0 ||
          (a[e.slice(1)] = a[e])
      return (or = a), or
    }
  )
})()

export default libheif
