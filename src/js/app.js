const DEMO_MODE = false;

const SUPABASE_URL = "https://vqoortdzgvllyxplduxq.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_arXBSdeuLwK2UkZkTyDfZg_Zmr5yIqI";

let supabaseClient = null;

function initSupabase() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return;
  if (typeof supabase === "undefined") return;
  try {
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  } catch (e) {
    console.warn("Supabase client init failed:", e);
  }
}

initSupabase();
var _initRetries = 0;
function retryInitSupabase() {
  if (supabaseClient) return true;
  if (typeof supabase !== "undefined") {
    try {
      supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      if (supabaseClient) return true;
    } catch (e) {
      console.warn("Supabase retry init failed:", e);
    }
  }
  return false;
}
if (!supabaseClient) {
  setTimeout(retryInitSupabase, 2000);
}

const STORAGE_KEYS = {
  projects: "easycod_projects",
  samples: "easycod_samples",
  session: "easycod_session",
  dailyCode: "easycod_daily_code",
  users: "easycod_users",
  fieldVisibility: "easycod_field_visibility",
  orders: "easycod_orders",
  applyRecords: "easycod_apply_records",
  clockRecords: "easycod_clock_records",
  approvalUsers: "easycod_approval_users",
  workflowTemplates: "easycod_wf_templates",
  workflowNodes: "easycod_wf_nodes",
  workflowAssignees: "easycod_wf_node_assignees",
  approvalRecords: "easycod_approval_records",
  approvalLogs: "easycod_approval_logs",
  settings: "easycod_settings",
};

const DEFAULT_FIELD_VISIBILITY = {
  specs: "邀请",
  color: "邀请",
  material: "邀请",
  description: "邀请",
  image: "邀请",
};

const VIS_NEXT = { 显示: "邀请", 邀请: "敏感", 敏感: "显示" };
const VIS_COLOR = {
  显示: "var(--success)",
  邀请: "var(--warning)",
  敏感: "var(--danger)",
};
const VIS_LABEL = { 显示: "直接可见", 邀请: "需邀请码", 敏感: "需邀请码·敏感" };

function generateId() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

function today() {
  return new Date().toISOString().split("T")[0];
}

function formatDate(dateStr) {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  return `${d.getFullYear()}年${String(d.getMonth() + 1).padStart(2, "0")}月`;
}

function formatDateTime(dateStr) {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function getChineseFirstTwoPinyin(str) {
  if (!str) return "XX";
  try {
    const result = pinyinPro.pinyin(str, {
      pattern: "first",
      toneType: "none",
    });
    const letters = result.replace(/\s/g, "");
    return letters.substring(0, 2).toUpperCase().padEnd(2, "X");
  } catch (e) {
    return "XX";
  }
}

function generateSampleCode(sampleName, brand, seq) {
  const prefix = getChineseFirstTwoPinyin(sampleName);
  const middle = getChineseFirstTwoPinyin(brand || "");
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let random = "";
  for (let i = 0; i < 4; i++) {
    random += chars[Math.floor(Math.random() * chars.length)];
  }
  const seqStr = String(seq).padStart(4, "0");
  return `${seqStr}-${middle}-${prefix}-${random}`;
}

function nextSeqForProject(projectId) {
  const samples = Store.getSamples();
  const projectSamples = samples.filter((s) => s.projectId === projectId);
  return projectSamples.length + 1;
}

function setSampleCodeFields(code) {
  const seqInput = document.getElementById("sampleCodeSeq");
  const suffixSpan = document.getElementById("sampleCodeSuffix");
  if (!code || !code.includes("-")) {
    seqInput.value = "";
    suffixSpan.textContent = "";
    return;
  }
  const dashIdx = code.indexOf("-");
  seqInput.value = code.substring(0, dashIdx);
  suffixSpan.textContent = code.substring(dashIdx);
}

function getSampleCode() {
  const seq = document.getElementById("sampleCodeSeq").value.trim() || "0000";
  const suffix = document.getElementById("sampleCodeSuffix").textContent;
  return seq + suffix;
}

function generateDailyCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

async function compressImage(file, maxDim = 600, quality = 0.8) {
  // 支持 data URL 字符串直接传入，避免手机端 fetch(data:) 失败
  if (typeof file === "string" && file.startsWith("data:")) {
    return compressImageFromDataUrl(file, maxDim, quality);
  }
  // 支持 http(s) URL 字符串，fetch 后转为 blob 再压缩
  if (
    typeof file === "string" &&
    (file.startsWith("http://") || file.startsWith("https://"))
  ) {
    try {
      const blob = await (await fetch(file)).blob();
      return compressImage(blob, maxDim, quality);
    } catch (e) {
      console.warn("[compressImage] fetch URL failed:", e);
      return null;
    }
  }
  return new Promise((resolve) => {
    if (!file) {
      resolve(null);
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      compressImageFromDataUrl(e.target.result, maxDim, quality).then(resolve);
    };
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });
}

/** 从 data URL 直接压缩图片，跳过 FileReader，手机端更可靠 */
function compressImageFromDataUrl(dataUrl, maxDim, quality) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      let w = img.width,
        h = img.height;
      if (w > maxDim || h > maxDim) {
        const ratio = Math.min(maxDim / w, maxDim / h);
        w = Math.round(w * ratio);
        h = Math.round(h * ratio);
      }
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, w, h);
      let q = quality;
      let result;
      do {
        result = canvas.toDataURL("image/jpeg", q);
        q -= 0.1;
      } while (result.length > 1024 * 1024 && q > 0.1);
      resolve(result);
    };
    img.onerror = () => resolve(null);
    img.src = dataUrl;
  });
}

async function compressImagesForSample(file) {
  if (!file) return { imageUrl: null, thumbnailUrl: null };
  const imageUrl = await compressImage(file, 600, 0.8);
  const thumbnailUrl = await compressImage(file, 200, 0.7);
  return { imageUrl, thumbnailUrl };
}

// 根据编码哈希生成 100 色之一（HSL 均匀分布，饱和度亮度固定）
function hashToColor(code) {
  let hash = 0;
  for (let i = 0; i < code.length; i++) {
    hash = ((hash << 5) - hash + code.charCodeAt(i)) | 0;
  }
  const index = ((Math.abs(hash) % 100) / 100) * 360;
  return `hsl(${index}, 70%, 55%)`;
}

function getProcurementIndicator(sample, project) {
  const isProc = project && project.procurement;
  let state, symbol, cls;
  if (!isProc) {
    state = "非集采";
    symbol = "✕";
    cls = "proc-non";
  } else {
    const range =
      sample.procurementRange || (sample.procurement ? "范围内" : "范围外");
    if (range === "范围内") {
      state = "集采范围内";
      symbol = "●";
      cls = "proc-in";
    } else {
      state = "集采范围外";
      symbol = "■";
      cls = "proc-out";
    }
  }
  return { state, symbol, cls };
}

function drawQRCode(canvas, text) {
  if (typeof qrcode !== "undefined") {
    try {
      var qr = qrcode(0, "M");
      qr.addData(text);
      qr.make();
      var img = new Image();
      img.onload = function () {
        var ctx = canvas.getContext("2d");
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        var pad = 6;
        var size = canvas.width - pad * 2;
        ctx.drawImage(img, pad, pad, size, size);
      };
      img.src = qr.createDataURL(4, 0);
      return;
    } catch (_) {}
  }
  var ctx = canvas.getContext("2d");
  ctx.fillStyle = "#eee";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#999";
  ctx.font = "10px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("QR", canvas.width / 2, canvas.height / 2);
}

function dataUrlToBlob(dataUrl) {
  var parts = dataUrl.split(",");
  var mime = parts[0].match(/:(.*?);/)[1];
  var bytes = atob(parts[1]);
  var buf = new ArrayBuffer(bytes.length);
  var view = new Uint8Array(buf);
  for (var i = 0; i < bytes.length; i++) {
    view[i] = bytes.charCodeAt(i);
  }
  return new Blob([buf], { type: mime });
}

async function uploadImageToStorage(dataUrl, sampleId, suffix) {
  if (!supabaseClient || !dataUrl || !dataUrl.startsWith("data:"))
    return dataUrl;
  var tBlob = performance.now();
  var blob = dataUrlToBlob(dataUrl);
  tBlob = Math.round(performance.now() - tBlob);
  var ext = blob.type === "image/png" ? "png" : "jpg";
  var path = "samples/" + sampleId + "_" + suffix + "." + ext;
  var tUp = performance.now();
  var { error } = await supabaseClient.storage
    .from("sample-images")
    .upload(path, blob, { upsert: true, contentType: blob.type });
  tUp = Math.round(performance.now() - tUp);
  if (error) {
    console.warn("Storage upload failed:", error);
    window.app &&
      window.app.showToast(
        suffix + "上传失败:" + error.message.substring(0, 20),
        "error",
      );
    return dataUrl;
  }
  var tSign = performance.now();
  var { data: signedData } = await supabaseClient.storage
    .from("sample-images")
    .createSignedUrl(path, 604800);
  tSign = Math.round(performance.now() - tSign);
  return signedData ? signedData.signedUrl : dataUrl;
}

function extractStoragePath(url) {
  if (!url) return null;
  var parts = url.split("/sample-images/");
  if (parts.length < 2) return null;
  return parts[1].split("?")[0];
}

function isSignedUrlExpiringSoon(url) {
  if (!url) return false;
  if (!url.includes("/object/sign/")) return false;
  var match = url.match(/[?&]expiry=(\d+)/);
  if (!match) return true;
  var expiry = parseInt(match[1]) * 1000;
  var oneDay = 24 * 60 * 60 * 1000;
  return Date.now() + oneDay > expiry;
}

async function refreshSignedUrl(url) {
  if (!url || !supabaseClient) return url;
  var path = extractStoragePath(url);
  if (!path) return url;
  // 确保 Supabase 客户端有 auth session
  try {
    var { data: sessionData } = await supabaseClient.auth.getSession();
    if (!sessionData || !sessionData.session) {
      console.warn("[refreshSignedUrl] no auth session, skipping");
      return url;
    }
  } catch (e) {
    console.warn("[refreshSignedUrl] getSession failed:", e.message);
  }
  try {
    var result = await supabaseClient.storage
      .from("sample-images")
      .createSignedUrl(path, 604800);
    return result.data ? result.data.signedUrl : url;
  } catch (e) {
    // 400/404 说明文件不存在 → 清掉这个路径，避免反复重试
    if (
      e.status === 400 ||
      e.status === 404 ||
      (e.message && (e.message.includes("400") || e.message.includes("404")))
    ) {
      return null;
    }
    return url;
  }
}

async function deleteImageFromStorage(imageUrl) {
  if (!supabaseClient || !imageUrl || !imageUrl.includes("sample-images"))
    return;
  var path = extractStoragePath(imageUrl);
  if (!path) return;
  supabaseClient.storage
    .from("sample-images")
    .remove([path])
    .catch(function () {});
}

function esc(str) {
  if (str == null) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

var BASE_PATH = (function () {
  var p = window.location.pathname;
  var i = p.lastIndexOf("/");
  return i >= 0 ? p.substring(0, i + 1) : "/";
})();

// 短码内存缓存
var _shortCodeCache = {};
var _SC_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function _genShortCode() {
  var c = "";
  for (var i = 0; i < 6; i++)
    c += _SC_CHARS[Math.floor(Math.random() * _SC_CHARS.length)];
  return c;
}

function _qrBase() {
  return window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
    ? window.location.origin + "/sample-detail.html"
    : "https://adwardnewstar.github.io/easycod/sample-detail.html";
}

async function qrPageUrl(sampleId) {
  // 1) 内存缓存命中
  if (_shortCodeCache[sampleId])
    return _qrBase() + "?c=" + _shortCodeCache[sampleId];

  // 2) 查 localStorage 中该样本的 short_code/短码（毫秒级，无需网络）
  //    若样本存在但无短码，也记入缓存，跳过后续 DB 查询
  try {
    var _samples = Store.getSamples();
    for (var _i = 0; _i < _samples.length; _i++) {
      if (_samples[_i].id === sampleId) {
        // fromSnakeCase 会将 short_code 转为 shortCode，两者都检查
        var _sc = _samples[_i].short_code || _samples[_i].shortCode;
        if (_sc) {
          _shortCodeCache[sampleId] = _sc;
          return _qrBase() + "?c=" + _sc;
        }
        // 样本存在但短码为空 → 跳过 DB 查询，直接回退
        return _qrBase() + "?id=" + sampleId;
      }
    }
  } catch (_) {}

  // 3) 查 DB 是否已有 short_code（兜底，仅查找不生成）
  try {
    if (typeof supabaseClient !== "undefined" && supabaseClient) {
      var { data } = await supabaseClient
        .from("samples")
        .select("short_code")
        .eq("id", sampleId)
        .maybeSingle();
      if (data && data.short_code) {
        _shortCodeCache[sampleId] = data.short_code;
        return _qrBase() + "?c=" + data.short_code;
      }
    }
  } catch (_) {}

  // 4) 无 short_code → 回退到旧版 ?id= 路径（兼容已打印标签）
  return _qrBase() + "?id=" + sampleId;
}

class Store {
  // 内存缓存：解决手机端 localStorage 配额超限时数据静默丢失的问题
  static _samplesCache = null;
  static _projectsCache = null;
  static _samplesCleaned = false;

  static get(key) {
    try {
      return JSON.parse(localStorage.getItem(key));
    } catch (e) {
      console.error("Store.get error:", e);
      return null;
    }
  }

  static set(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      // localStorage 配额超限时，清除旧数据并重试
      if (
        e.name === "QuotaExceededError" ||
        e.toString().indexOf("quota") !== -1
      ) {
        console.warn(
          "[Store] localStorage quota exceeded, trying to free space",
        );
        try {
          // 清除图片相关的旧数据来释放空间（不修改内存缓存，调用方已设置正确缓存）
          const rawSamples = Store.getSamplesRaw();
          if (rawSamples && rawSamples.length > 0) {
            // 只保留最近 20 条样板，且清除旧图片
            const trimmed = rawSamples.slice(-20).map(function (s) {
              return { ...s, imageUrl: "", thumbnailUrl: "" };
            });
            localStorage.setItem(STORAGE_KEYS.samples, JSON.stringify(trimmed));
          }
          // 重试写入
          localStorage.setItem(key, JSON.stringify(data));
          console.log("[Store] retry succeeded after freeing space");
          return;
        } catch (e2) {
          console.error("[Store] retry also failed:", e2);
        }
      }
    }
  }

  static getProjects() {
    if (Store._projectsCache !== null) return Store._projectsCache;
    Store._projectsCache = Store.get(STORAGE_KEYS.projects) || [];
    return Store._projectsCache;
  }

  static saveProjects(projects) {
    // DEBUG: 追踪谁修改了项目缓存
    var prevCount = Store._projectsCache ? Store._projectsCache.length : -1;
    var newCount = projects ? projects.length : -1;
    if (prevCount >= 0 && newCount < prevCount) {
      console.warn(
        "[Store.saveProjects] 项目数减少! " + prevCount + " → " + newCount,
        new Error().stack,
      );
    }
    console.log("[Store.saveProjects] count:", newCount, "prev:", prevCount);
    Store._projectsCache = projects;
    Store.set(STORAGE_KEYS.projects, projects);
  }

  static getSamples() {
    if (Store._samplesCache !== null) return Store._samplesCache;
    Store._samplesCache = Store.get(STORAGE_KEYS.samples) || [];
    // 启动时清理超过 1 天的上传失败样板（释放 localStorage 空间）
    if (!Store._samplesCleaned) {
      Store._samplesCleaned = true;
      Store._cleanExpiredFailedSamples();
    }
    return Store._samplesCache;
  }

  /** 直接从 localStorage 读取（绕过缓存，用于配额恢复） */
  static getSamplesRaw() {
    return Store.get(STORAGE_KEYS.samples) || [];
  }

  /** 清理超过 1 天的上传失败样板 */
  static _cleanExpiredFailedSamples() {
    var samples = Store._samplesCache;
    if (!samples || !samples.length) return;
    var dayAgo = Date.now() - 24 * 60 * 60 * 1000;
    var cleaned = samples.filter(function (s) {
      if (!s._uploadFailed) return true;
      var created = s.created_at ? new Date(s.created_at).getTime() : 0;
      if (created > 0 && created < dayAgo) return false; // 超过 1 天的失败样板，丢弃
      return true;
    });
    if (cleaned.length < samples.length) {
      Store._samplesCache = cleaned;
      Store.set(STORAGE_KEYS.samples, cleaned);
    }
  }

  static saveSamples(samples) {
    Store._samplesCache = samples;
    Store.set(STORAGE_KEYS.samples, samples);
  }

  static getSession() {
    return Store.get(STORAGE_KEYS.session);
  }

  static saveSession(session) {
    Store.set(STORAGE_KEYS.session, session);
  }

  static clearSession() {
    localStorage.removeItem(STORAGE_KEYS.session);
  }

  /** 异步从 DB 获取今天的全局统一 code，缓存到 localStorage */
  static async initDailyCode() {
    const local = Store.get(STORAGE_KEYS.dailyCode);
    if (local && local.date === today()) return local.code;
    const dbCode = await Store.fetchDailyCodeFromDB();
    if (dbCode) {
      Store.set(STORAGE_KEYS.dailyCode, { code: dbCode, date: today() });
      return dbCode;
    }
    return null;
  }

  /** 同步读取（dashboard 等同步渲染使用）— 优先读 localStorage，无缓存时本地生成 */
  static getDailyCode() {
    const data = Store.get(STORAGE_KEYS.dailyCode);
    if (data && data.date === today()) {
      return data.code;
    }
    const code = generateDailyCode();
    Store.set(STORAGE_KEYS.dailyCode, { code, date: today() });
    Store.syncDailyCodeToDB(code);
    return code;
  }

  static syncDailyCodeToDB(code) {
    if (!supabaseClient) return;
    const date = today();
    const vis = Store.getFieldVisibility();
    supabaseClient
      .from("daily_codes")
      .upsert(
        {
          code,
          date,
          field_visibility: {
            specs: vis.specs,
            color: vis.color,
            material: vis.material,
            description: vis.description,
            image: vis.image,
          },
        },
        { onConflict: "date" },
      )
      .then((res) => {
        if (res.error) console.warn("syncDailyCode failed:", res.error);
      });
  }

  static async fetchDailyCodeFromDB() {
    if (!supabaseClient) return null;
    const date = today();
    const { data, error } = await supabaseClient
      .from("daily_codes")
      .select("code")
      .eq("date", date)
      .maybeSingle();
    if (error || !data) return null;
    return data.code;
  }

  static getUsers() {
    return Store.get(STORAGE_KEYS.users) || [];
  }

  static saveUsers(users) {
    Store.set(STORAGE_KEYS.users, users);
  }

  static getFieldVisibility() {
    return {
      ...DEFAULT_FIELD_VISIBILITY,
      ...(Store.get(STORAGE_KEYS.fieldVisibility) || {}),
    };
  }

  static saveFieldVisibility(vis) {
    Store.set(STORAGE_KEYS.fieldVisibility, vis);
    if (!DEMO_MODE && supabaseClient && window.app?.user?.id) {
      Store._saveFieldVisibilityToDB(vis).catch((e) =>
        console.warn("DB save visibility failed:", e),
      );
    }
    // 同步到 daily_codes（公开可读，供扫码页使用）
    if (!DEMO_MODE && supabaseClient) {
      Store._syncFieldVisibilityToDailyCodes(vis).catch((e) =>
        console.warn("daily_codes visibility sync failed:", e),
      );
    }
  }

  static async _saveFieldVisibilityToDB(vis) {
    const userId = window.app?.user?.id;
    if (!userId || !supabaseClient) return;
    const { error } = await supabaseClient.from("field_visibility").upsert(
      {
        specs: vis.specs,
        color: vis.color,
        material: vis.material,
        description: vis.description,
        image: vis.image,
        user_id: userId,
      },
      { onConflict: "user_id" },
    );
    if (error) throw error;
  }

  static async _syncFieldVisibilityToDailyCodes(vis) {
    if (!supabaseClient) return;
    const date = today();
    const code = Store.getDailyCode();
    const { error } = await supabaseClient.from("daily_codes").upsert(
      {
        date,
        code,
        field_visibility: {
          specs: vis.specs,
          color: vis.color,
          material: vis.material,
          description: vis.description,
          image: vis.image,
        },
      },
      { onConflict: "date" },
    );
    if (error) throw error;
  }

  static async loadFieldVisibilityFromDB() {
    if (DEMO_MODE || !supabaseClient || !window.app?.user?.id) return;
    const userId = window.app?.user?.id;
    const { data, error } = await supabaseClient
      .from("field_visibility")
      .select("specs, color, material, description, image")
      .eq("user_id", userId)
      .maybeSingle();
    if (!error && data) {
      const merged = { ...DEFAULT_FIELD_VISIBILITY };
      for (const k of ["specs", "color", "material", "description", "image"]) {
        if (data[k]) merged[k] = data[k];
      }
      Store.set(STORAGE_KEYS.fieldVisibility, merged);
    }
  }

  static getOrders() {
    return Store.get(STORAGE_KEYS.orders) || [];
  }
  static saveOrders(orders) {
    Store.set(STORAGE_KEYS.orders, orders);
  }
  static async loadOrdersFromDB() {
    if (!supabaseClient) return;
    const { data, error } = await supabaseClient
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    Store.set(
      STORAGE_KEYS.orders,
      data && data.length > 0 ? data.map(DbWriter.fromSnakeCase) : [],
    );
  }

  static getApplyRecords() {
    return Store.get(STORAGE_KEYS.applyRecords) || [];
  }
  static saveApplyRecords(records) {
    Store.set(STORAGE_KEYS.applyRecords, records);
  }
  static async loadApplyFromDB() {
    if (!supabaseClient) return;
    const { data, error } = await supabaseClient
      .from("apply_records")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    Store.set(
      STORAGE_KEYS.applyRecords,
      data && data.length > 0 ? data.map(DbWriter.fromSnakeCase) : [],
    );
  }

  static getClockRecords() {
    return Store.get(STORAGE_KEYS.clockRecords) || [];
  }
  static saveClockRecords(records) {
    Store.set(STORAGE_KEYS.clockRecords, records);
  }
  static async loadClockFromDB() {
    if (!supabaseClient) return;
    const { data, error } = await supabaseClient
      .from("clock_records")
      .select("*")
      .order("clock_time", { ascending: false });
    if (error) throw error;
    Store.set(
      STORAGE_KEYS.clockRecords,
      data && data.length > 0 ? data.map(DbWriter.fromSnakeCase) : [],
    );
  }

  // ===== 相关设置缓存 =====
  static getSettings() {
    return Store.get(STORAGE_KEYS.settings) || null;
  }
  static saveSettings(data) {
    Store.set(STORAGE_KEYS.settings, data);
  }
  static async loadSettingsFromDB() {
    if (!supabaseClient) return;
    try {
      const { data, error } = await supabaseClient
        .from("settings")
        .select("*")
        .eq("key", "clockLocation")
        .single();
      if (error) throw error;
      Store.saveSettings(data);
    } catch (e) {
      console.warn("Settings load failed:", e.message);
    }
  }

  // ===== 审批人缓存 =====
  static getApprovalUsers() {
    return Store.get(STORAGE_KEYS.approvalUsers) || [];
  }
  static saveApprovalUsers(users) {
    Store.set(STORAGE_KEYS.approvalUsers, users);
  }
  static async loadApprovalUsersFromDB() {
    if (!supabaseClient) return;
    const { data, error } = await supabaseClient
      .from("ep_users")
      .select(
        "id,email,display_name,phone,role,is_active,auth_user_id,easycod,easyorder,easyproc,easyvoice,menu_permissions,created_at,last_login",
      )
      .order("created_at", { ascending: false });
    if (error) throw error;
    Store.saveApprovalUsers(data || []);
  }

  // ===== 流程数据缓存 =====
  static getWfTemplates() {
    return Store.get(STORAGE_KEYS.workflowTemplates) || [];
  }
  static saveWfTemplates(tpls) {
    Store.set(STORAGE_KEYS.workflowTemplates, tpls);
  }
  static async loadWfTemplatesFromDB() {
    if (!supabaseClient) return;
    const { data, error } = await supabaseClient
      .from("ep_workflow_templates")
      .select("*")
      .order("apply_type");
    if (error) throw error;
    Store.saveWfTemplates(data || []);
  }

  static getWfNodes() {
    return Store.get(STORAGE_KEYS.workflowNodes) || [];
  }
  static saveWfNodes(nodes) {
    Store.set(STORAGE_KEYS.workflowNodes, nodes);
  }
  static async loadWfNodesFromDB() {
    if (!supabaseClient) return;
    const { data, error } = await supabaseClient
      .from("ep_workflow_nodes")
      .select("*")
      .order("order_index");
    if (error) throw error;
    Store.saveWfNodes(data || []);
  }

  static getWfAssignees() {
    return Store.get(STORAGE_KEYS.workflowAssignees) || [];
  }
  static saveWfAssignees(as2) {
    Store.set(STORAGE_KEYS.workflowAssignees, as2);
  }
  static async loadWfAssigneesFromDB() {
    if (!supabaseClient) return;
    const { data, error } = await supabaseClient
      .from("ep_workflow_node_assignees")
      .select("node_id,user_id,notify_type");
    if (error) throw error;
    Store.saveWfAssignees(data || []);
  }

  static async loadAllWorkflowData() {
    if (!supabaseClient) return;
    try {
      await Promise.all([
        Store.loadWfTemplatesFromDB(),
        Store.loadWfNodesFromDB(),
        Store.loadWfAssigneesFromDB(),
      ]);
    } catch (e) {
      console.error("[loadAllWorkflowData] FAILED:", e.name, e.message);
    }
  }

  // ===== 审批记录缓存 =====
  static getApprovalRecords() {
    return Store.get(STORAGE_KEYS.approvalRecords) || [];
  }
  static saveApprovalRecords(records) {
    Store.set(STORAGE_KEYS.approvalRecords, records);
  }
  static async loadApprovalRecordsFromDB() {
    if (!supabaseClient) return;
    const { data, error } = await supabaseClient
      .from("ep_approvals")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    Store.saveApprovalRecords(data || []);
  }

  static getApprovalLogs() {
    return Store.get(STORAGE_KEYS.approvalLogs) || [];
  }
  static saveApprovalLogs(logs) {
    Store.set(STORAGE_KEYS.approvalLogs, logs);
  }
  static async loadApprovalLogsFromDB() {
    if (!supabaseClient) return;
    const { data, error } = await supabaseClient
      .from("ep_approval_logs")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    Store.saveApprovalLogs(data || []);
  }

  static async loadAllApprovalData() {
    if (!supabaseClient) return;
    try {
      await Promise.all([
        Store.loadApprovalUsersFromDB(),
        Store.loadAllWorkflowData(),
        Store.loadApprovalRecordsFromDB(),
        Store.loadApprovalLogsFromDB(),
      ]);
    } catch (e) {
      console.error("[loadAllApprovalData] FAILED:", e.name, e.message);
    }
  }

  static async loadProjectsFromDB() {
    if (!supabaseClient || !window.app?.user?.id) return;
    const { data, error } = await supabaseClient
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    if (data && data.length > 0) {
      const dbProjects = data.map(DbWriter.fromSnakeCase);
      // 合并本地数据：本地新建但 DB 尚未写入的条目不会被覆盖
      const localProjects = Store.getProjects();
      const map = {};
      for (let i = 0; i < localProjects.length; i++) {
        map[localProjects[i].id] = localProjects[i];
      }
      for (let j = 0; j < dbProjects.length; j++) {
        map[dbProjects[j].id] = dbProjects[j];
      }
      const merged = Object.values(map);
      Store._projectsCache = merged;
      Store.set(STORAGE_KEYS.projects, merged);
    }
    // 注意：DB 无数据时不覆盖 localStorage，避免本地新建但 DB 写入失败时数据丢失
  }

  static async loadSamplesFromDB() {
    if (!supabaseClient || !window.app?.user?.id) return;
    const { data, error } = await supabaseClient
      .from("samples")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    if (data && data.length > 0) {
      var dbSamples = data.map(DbWriter.fromSnakeCase);
      var refreshes = [];
      for (var i = 0; i < dbSamples.length; i++) {
        (function (s) {
          if (isSignedUrlExpiringSoon(s.imageUrl)) {
            refreshes.push(
              refreshSignedUrl(s.imageUrl).then(function (u) {
                s.imageUrl = u;
              }),
            );
          }
          if (isSignedUrlExpiringSoon(s.thumbnailUrl)) {
            refreshes.push(
              refreshSignedUrl(s.thumbnailUrl).then(function (u) {
                s.thumbnailUrl = u;
              }),
            );
          }
        })(dbSamples[i]);
      }
      if (refreshes.length > 0) {
        await Promise.all(refreshes);
      }
      // 合并本地数据：本地新建但 DB 尚未写入的条目不会被覆盖
      var localSamples = Store.getSamples();
      var map = {};
      for (var k = 0; k < localSamples.length; k++) {
        map[localSamples[k].id] = localSamples[k];
      }
      for (var m = 0; m < dbSamples.length; m++) {
        map[dbSamples[m].id] = dbSamples[m];
      }
      var merged = Object.values(map);
      Store._samplesCache = merged;
      Store.set(STORAGE_KEYS.samples, merged);
    }
    // 注意：DB 无数据时不覆盖 localStorage，避免本地新建但 DB 写入失败时数据丢失
  }

  // 增量加载：只拉 updated_at > since 的变更数据
  static async loadProjectsFromDBIncremental(since) {
    if (!supabaseClient || !window.app?.user?.id) return [];
    const { data, error } = await supabaseClient
      .from("projects")
      .select("*")
      .gt("updated_at", since)
      .order("updated_at", { ascending: false });
    if (error) throw error;
    return data && data.length > 0 ? data.map(DbWriter.fromSnakeCase) : [];
  }

  static async loadSamplesFromDBIncremental(since) {
    if (!supabaseClient || !window.app?.user?.id) return [];
    const { data, error } = await supabaseClient
      .from("samples")
      .select("*")
      .gt("updated_at", since)
      .order("updated_at", { ascending: false });
    if (error) throw error;
    if (!data || data.length === 0) return [];
    var samples = data.map(DbWriter.fromSnakeCase);
    var refreshes = [];
    for (var i = 0; i < samples.length; i++) {
      (function (s) {
        if (isSignedUrlExpiringSoon(s.imageUrl)) {
          refreshes.push(
            refreshSignedUrl(s.imageUrl).then(function (u) {
              s.imageUrl = u;
            }),
          );
        }
        if (isSignedUrlExpiringSoon(s.thumbnailUrl)) {
          refreshes.push(
            refreshSignedUrl(s.thumbnailUrl).then(function (u) {
              s.thumbnailUrl = u;
            }),
          );
        }
      })(samples[i]);
    }
    if (refreshes.length > 0) await Promise.all(refreshes);
    return samples;
  }

  // 按 id 合并增量数据到本地 Store
  static mergeProjects(delta) {
    if (!delta || delta.length === 0) return;
    var existing = Store.getProjects();
    var map = {};
    for (var i = 0; i < existing.length; i++) {
      map[existing[i].id] = existing[i];
    }
    for (var j = 0; j < delta.length; j++) {
      map[delta[j].id] = delta[j];
    }
    Store.saveProjects(Object.values(map));
  }

  static mergeSamples(delta) {
    if (!delta || delta.length === 0) return;
    var existing = Store.getSamples();
    var map = {};
    for (var i = 0; i < existing.length; i++) {
      map[existing[i].id] = existing[i];
    }
    for (var j = 0; j < delta.length; j++) {
      map[delta[j].id] = delta[j];
    }
    Store.saveSamples(Object.values(map));
  }

  static async upsertProjectToDB(project) {
    const db = window.app?.dbWriter;
    if (!db) return;
    await db.upsertProject(project, window.app?.user?.id);
  }

  static async deleteProjectFromDB(projectId) {
    if (!supabaseClient || !window.app?.user?.id) return;
    const { error } = await supabaseClient
      .from("projects")
      .delete()
      .eq("id", projectId);
    if (error) throw error;
  }

  static async deleteSamplesByProjectFromDB(projectId) {
    if (!supabaseClient || !window.app?.user?.id) return;
    const { error } = await supabaseClient
      .from("samples")
      .delete()
      .eq("project_id", projectId);
    if (error) throw error;
  }

  static async upsertSampleToDB(sample, userId) {
    const uid = userId || window.app?.user?.id;
    if (!supabaseClient || !uid) {
      console.warn(
        "[Store] upsertSampleToDB skipped: supabaseClient=" +
          !!supabaseClient +
          " userId=" +
          (uid || "none"),
      );
      return;
    }
    sample.user_id = uid;
    const { error } = await supabaseClient
      .from("samples")
      .upsert(DbWriter.toSnakeCase(sample), {
        onConflict: "id",
      });
    if (error) throw error;
  }

  static async deleteSampleFromDB(sampleId) {
    if (!supabaseClient || !window.app?.user?.id) return;
    const { error } = await supabaseClient
      .from("samples")
      .delete()
      .eq("id", sampleId);
    if (error) throw error;
  }
}

class QRCodeGenerator {
  static draw(canvas, text, size = 120) {
    const cellSize = 4;
    const qr = QRCodeGenerator._generateQR(text);
    if (!qr) return;
    const qrSize = qr.length;
    const scale = size / (qrSize * cellSize + cellSize * 4);
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = "#000000";
    const offset = (size - qrSize * cellSize * scale) / 2;
    for (let r = 0; r < qrSize; r++) {
      for (let c = 0; c < qrSize; c++) {
        if (qr[r][c]) {
          ctx.fillRect(
            offset + c * cellSize * scale,
            offset + r * cellSize * scale,
            cellSize * scale,
            cellSize * scale,
          );
        }
      }
    }
  }

  static _generateQR(text) {
    const len = text.length;
    const size = 21 + Math.ceil(len / 2) * 4;
    if (size > 177) return null;
    const qr = [];
    for (let i = 0; i < size; i++) {
      qr[i] = new Array(size).fill(false);
    }
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        qr[i][j] = (i + j) % 2 === 0;
      }
    }
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        if (i < 7 && j < 7) {
          qr[i][j] = !(i === 0 || i === 6 || j === 0 || j === 6);
        }
        if (i < 7 && j > size - 8) {
          qr[i][j] = !(i === 0 || i === 6 || j === size - 1 || j === size - 7);
        }
        if (i > size - 8 && j < 7) {
          qr[i][j] = !(i === size - 1 || i === size - 7 || j === 0 || j === 6);
        }
      }
    }
    return qr;
  }
}

class App {
  constructor() {
    this.currentView = "login";
    this.currentProjectId = null;
    this.selectedSamples = new Set();
    this.selectedLabels = { label1: true, label2: true, label3: true };
    this._projectView = "cards";
    // 全局单例 — 数据库写入模块
    this.dbWriter = new DbWriter({
      onToast: (msg, type) => this.showToast(msg, type),
    });
    this.uploadManager = new UploadManager({
      store: Store,
      dbWriter: this.dbWriter,
      compressImage: compressImage,
      uploadToStorage: uploadImageToStorage,
      deleteFromStorage: deleteImageFromStorage,
      onToast: (msg, type) => this.showToast(msg, type),
      onRender: () => this.renderSamples(this.currentProjectId),
    });
    this.sidebar = new Sidebar();
    this.loginPage = new LoginPage({
      onLoginSuccess: (user) => {
        this.user = user;
        this.uploadManager.setUserId(user?.id);
        this.showApp();
      },
      showToast: (msg, type) => this.showToast(msg, type),
    });
    this.dashboard = new DashboardPage(this);
    this.easycodRenderer = new EasycodRenderer(this);
    this.init();
  }

  init() {
    try {
      this.checkSession().catch(function (e) {
        return console.error("checkSession error:", e);
      });
    } catch (e) {
      console.error("checkSession error:", e);
    }
    try {
      this.bindEvents();
    } catch (e) {
      console.error("bindEvents error:", e);
    }
  }

  async checkSession() {
    const session = Store.getSession();
    if (session && supabaseClient) {
      // 恢复 Supabase auth session，避免手机端 token 丢失导致 RLS 42501
      const restored = await this._restoreSupabaseSession(session);
      if (!restored) {
        // session 已过期（如 refresh token 失效），引导重新登录
        Store.clearSession();
        this.showLogin();
        return;
      }
      this.user = session;
      this.uploadManager.setUserId(session?.id);
      // 并行：权限查询(DB网络) + UI渲染，不互相等待
      var permPromise = this._refreshUserPermissions();
      await this.showApp();
      await permPromise;
      // 权限回来后更新侧边栏可见性
      this.sidebar.updateVisibility(this.user);
    } else if (session) {
      await new Promise(function (resolve) {
        return setTimeout(resolve, 3000);
      });
      if (supabaseClient) {
        const restored = await this._restoreSupabaseSession(session);
        if (!restored) {
          Store.clearSession();
          this.showLogin();
          return;
        }
        this.user = session;
        this.uploadManager.setUserId(session?.id);
        await this._refreshUserPermissions();
        await this.showApp();
      } else {
        Store.clearSession();
        this.showLogin();
      }
    } else {
      this.showLogin();
    }
  }

  async _restoreSupabaseSession(session) {
    if (!session._supabaseSession || !supabaseClient) return false;
    try {
      await supabaseClient.auth.setSession({
        access_token: session._supabaseSession.access_token,
        refresh_token: session._supabaseSession.refresh_token,
      });
      // 验证 session 是否真正恢复（refresh token 过期时 setSession 可能不抛异常但 session 为空）
      const { data } = await supabaseClient.auth.getSession();
      return !!data?.session;
    } catch (e) {
      console.warn("_restoreSupabaseSession failed:", e);
      return false;
    }
  }

  async _refreshUserPermissions() {
    if (!this.user?.id || this.user.isDemo) return;
    try {
      const { data: epData } = await supabaseClient
        .from("ep_users")
        .select(
          "role, easycod, easyorder, easyproc, easyvoice, menu_permissions",
        )
        .eq("auth_user_id", this.user.id)
        .eq("is_active", true)
        .single();
      if (epData) {
        this.user.role = epData.role;
        this.user.easycod = epData.easycod;
        this.user.easyorder = epData.easyorder;
        this.user.easyproc = epData.easyproc;
        this.user.easyvoice = epData.easyvoice;
        this.user.menuPermissions = epData.menu_permissions;
        Store.saveSession(this.user);
      }
    } catch (e) {
      // 静默失败，用现有的 session
    }
  }

  showLogin() {
    this.currentView = "login";
    document.getElementById("loginSection").classList.add("active");
    document.getElementById("appSection").classList.remove("active");
    return this.loginPage.render().then(() => this.loginPage.init());
  }

  async showApp() {
    this.currentView = "dashboard";
    document.getElementById("loginSection").classList.remove("active");
    document.getElementById("appSection").classList.add("active");

    // 先加载 EasyCod 页面（类别/样板/信息），dashboard 依赖 #projectsSection
    await Easycod.load();

    // 加载 EasyVoice 页面
    await Easyvoice.load();

    // 加载 EasyOrder & EasyProc 页面
    await EasyorderAndproc.load();

    // 并行加载 HTML（本地文件，毫秒级）
    const [sidebarPromise, dashPromise] = [
      this.sidebar.load(),
      this.dashboard.load(),
    ];
    await Promise.all([sidebarPromise, dashPromise]);

    // 侧边栏处理（不依赖数据）
    this.bindSidebarNavEvents();
    this.sidebar.updateHeader(this.user);
    this.sidebar.updateVisibility(this.user);
    this.sidebar.init();

    // 预先从 DB 获取今天的全局统一邀请码（跨设备保持一致）
    await Store.initDailyCode();

    // 立即渲染仪表盘骨架（数据可能为空，但布局先出来）
    this.dashboard.render();
    this.showView("dashboard");

    // 后台加载数据 — 不阻塞渲染，加载完成后自动刷新仪表盘
    if (this.user && this.user.isDemo) {
      this.seedDemoData();
      this.dashboard.render();
    } else if (!DEMO_MODE && supabaseClient && this.user?.id) {
      Store.loadFieldVisibilityFromDB();
      Promise.all([Store.loadProjectsFromDB(), Store.loadSamplesFromDB()])
        .then(
          (function (self) {
            return function () {
              self.dashboard.render();
              // 品类+样板加载完成后，后台静默加载其他表
              Promise.all([
                Store.loadOrdersFromDB(),
                Store.loadApplyFromDB(),
                Store.loadClockFromDB(),
                Store.loadAllApprovalData(),
                Store.loadSettingsFromDB(),
              ]).catch(function () {});
            };
          })(this),
        )
        .catch(function () {
          window.app && window.app.showToast
            ? window.app.showToast("数据加载失败，请检查网络后刷新", "error")
            : void 0;
        });
    }
  }

  showView(view) {
    this.currentView = view;
    document
      .querySelectorAll("#appSection .page-section")
      .forEach((el) => el.classList.remove("active"));
    const sectionMap = {
      dashboard: "dashboardSection",
      projects: "projectsSection",
      samples: "samplesSection",
      labels: "labelsSection",
      sampleDetail: "sampleDetailSection",
      info: "infoSection",
      orders: "ordersSection",
      apply: "applySection",
      clock: "clockSection",
      approvalUsers: "approvalUsersSection",
      workflows: "workflowSection",
      approvalRecords: "approvalRecordsSection",
      voiceAssistant: "voiceAssistantSection",
      settings: "settingsSection",
    };
    const sectionId = sectionMap[view];
    if (sectionId) {
      document.getElementById(sectionId).classList.add("active");
    }
    this.sidebar.setActiveView(view);

    // 仪表盘撑满宽度，其他页保持 max-width 约束
    var container = document.querySelector("#appSection .container");
    if (container) {
      if (view === "dashboard") {
        container.style.maxWidth = "none";
        container.style.margin = "5px";
        container.style.paddingTop = "0";
        container.style.paddingBottom = "0";
      } else {
        container.style.maxWidth = "";
        container.style.margin = "";
        container.style.paddingTop = "";
        container.style.paddingBottom = "";
      }
    }
  }

  /** 绑定侧边栏导航按钮事件（sidebar.html 动态加载后调用） */
  bindSidebarNavEvents() {
    const bind = (id, fn) => {
      const el = document.getElementById(id);
      if (el) el.addEventListener("click", fn);
    };

    bind("logoutBtn", () => this.handleLogout());

    bind("navProjects", () => {
      this.renderProjects();
      this.showView("projects");
    });
    bind("infoBtn", () => {
      this.renderInfoView();
      this.showView("info");
    });
    bind("navOrders", () => {
      EasyorderAndproc.renderOrders();
      this.showView("orders");
    });
    bind("navApply", () => {
      EasyorderAndproc.renderApply();
      this.showView("apply");
    });
    bind("navClock", () => {
      EasyorderAndproc.renderClock();
      this.showView("clock");
    });
    bind("navApprovalUsers", () => {
      EasyorderAndproc.renderApprovalUsers();
      this.showView("approvalUsers");
    });
    bind("navWorkflows", () => {
      EasyorderAndproc.renderWorkflows();
      this.showView("workflows");
    });
    bind("navApprovalRecords", () => {
      EasyorderAndproc.renderApprovalRecords();
      this.showView("approvalRecords");
    });
    bind("navVoiceAssistant", () => {
      Easyvoice.renderView();
      this.showView("voiceAssistant");
    });
    bind("navSettings", () => {
      EasyorderAndproc.renderSettings();
      this.showView("settings");
    });
  }

  bindEvents() {
    document.getElementById("backFromDetail").addEventListener("click", () => {
      if (this._projectView === "table") {
        this.renderProjects();
        this.showView("projects");
      } else if (this.currentProjectId) {
        this.renderSamples(this.currentProjectId);
        this.showView("samples");
      } else {
        this.renderProjects();
        this.showView("projects");
      }
    });

    document.getElementById("backFromLabels").addEventListener("click", () => {
      if (this.currentProjectId) {
        this.renderSamples(this.currentProjectId);
        this.showView("samples");
      } else {
        this.renderProjects();
        this.showView("projects");
      }
    });

    document.querySelectorAll(".modal-overlay").forEach((overlay) => {
      overlay.addEventListener("click", (e) => {
        if (e.target === overlay && overlay.id !== "sampleModal") {
          overlay.classList.remove("active");
        }
      });
    });

    document.querySelectorAll(".modal-close").forEach((btn) => {
      btn.addEventListener("click", () => {
        btn.closest(".modal-overlay").classList.remove("active");
      });
    });

    // Delete confirm modal
    document.getElementById("cancelDeleteBtn").addEventListener("click", () => {
      this.closeModal("deleteConfirmModal");
      document.getElementById("deletePasswordInput").value = "";
      document.getElementById("deletePasswordError").style.display = "none";
    });

    document
      .getElementById("confirmDeleteBtn")
      .addEventListener("click", async () => {
        const btn = document.getElementById("confirmDeleteBtn");
        const originalText = btn.textContent;
        btn.disabled = true;
        let dots = 0;
        let dotDir = 1;
        const dotTimer = setInterval(() => {
          dots += dotDir;
          if (dots >= 3) dotDir = -1;
          if (dots <= 0) dotDir = 1;
          btn.textContent = "删除中" + ".".repeat(dots);
        }, 400);
        try {
          await this.handleDeleteConfirm();
        } finally {
          clearInterval(dotTimer);
          btn.disabled = false;
          btn.textContent = originalText;
        }
      });

    document
      .getElementById("deletePasswordInput")
      .addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          document.getElementById("confirmDeleteBtn").click();
        }
      });

    // 标签页切换回前台时自动静默同步
    document.addEventListener("visibilitychange", () => {
      if (
        document.visibilityState === "visible" &&
        this.user &&
        !this.user.isDemo &&
        supabaseClient
      ) {
        this.silentSync().catch(() => {});
      }
    });
  }

  seedDemoData() {
    const SEED_VERSION = "v3";
    const seeded = Store.get("easycod_seeded");
    if (seeded === SEED_VERSION) return;
    Store.set(STORAGE_KEYS.projects, []);
    Store.set(STORAGE_KEYS.samples, []);
    Store._projectsCache = [];
    Store._samplesCache = [];

    const now = new Date().toISOString();

    const seedProjects = [
      {
        id: "p-demo-1",
        name: "地板砖",
        brand: "水墨江南",
        description:
          "室内地面瓷砖系列，涵盖多种规格和花色，适用于客厅、卧室、厨房等空间",
        procurement: true,
        procurementStart: "2025-01",
        procurementEnd: "2025-12",
        userId: "demo-user",
        createdAt: now,
        updatedAt: now,
      },
    ];

    function svgImageUrl(letter, bgColor) {
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
        <rect width="400" height="400" fill="${bgColor}"/>
        <text x="200" y="210" text-anchor="middle" font-size="120" font-weight="bold" font-family="sans-serif" fill="${bgColor === "#e8f0fe" ? "#4a8dc7" : "#999"}" opacity="0.6">${letter}</text>
        <line x1="0" y1="0" x2="400" y2="400" stroke="rgba(0,0,0,0.04)" stroke-width="1"/>
        <line x1="400" y1="0" x2="0" y2="400" stroke="rgba(0,0,0,0.04)" stroke-width="1"/>
      </svg>`;
      return "data:image/svg+xml;base64," + btoa(svg);
    }

    const seedSamples = [
      {
        id: "s-demo-1",
        projectId: "p-demo-1",
        name: "米黄洞石",
        model: "MHY-001",
        brand: "水墨江南",
        code: generateSampleCode("米黄洞石", "水墨江南", 1),
        specs: "600x600x20mm",
        color: "米黄色",
        material: "天然大理石",
        description:
          "水墨江南经典系列米黄洞石瓷砖，纹理细腻均匀，表面做哑光防滑处理。",
        procurement: true,
        procurementRange: "范围内",
        imageUrl: svgImageUrl("M", "#f5e6d3"),
      },
      {
        id: "s-demo-2",
        projectId: "p-demo-1",
        name: "意大利灰",
        model: "YDLH-002",
        brand: "水墨江南",
        code: generateSampleCode("意大利灰", "水墨江南", 2),
        specs: "800x800x20mm",
        color: "深灰色",
        material: "通体大理石",
        description:
          "水墨江南现代简约灰色地砖，灰色底纹配白色细纹，耐磨抗污易清洁。",
        procurement: true,
        procurementRange: "范围内",
        imageUrl: svgImageUrl("Y", "#d5d5d5"),
      },
      {
        id: "s-demo-3",
        projectId: "p-demo-1",
        name: "黑金花",
        model: "HJH-003",
        brand: "水墨江南",
        code: generateSampleCode("黑金花", "水墨江南", 3),
        specs: "600x900x20mm",
        color: "黑色金色",
        material: "通体大理石",
        description:
          "水墨江南奢华黑金花系列，黑色底色配上金色纹理，适合豪华大堂等区域。",
        procurement: false,
        procurementRange: "范围外",
        imageUrl: svgImageUrl("H", "#2a2a2a"),
      },
      {
        id: "s-demo-4",
        projectId: "p-demo-1",
        name: "白麻花岗岩",
        model: "BMG-001",
        brand: "水墨江南",
        code: generateSampleCode("白麻花岗岩", "水墨江南", 4),
        specs: "600x600x30mm",
        color: "白色麻点",
        material: "通体瓷砖",
        description:
          "水墨江南白麻花岗岩纹瓷砖，高密度耐磨抗压，适合高人流量空间。",
        procurement: false,
        procurementRange: "范围外",
        imageUrl: svgImageUrl("B", "#f0f0e8"),
      },
      {
        id: "s-demo-5",
        projectId: "p-demo-1",
        name: "芝麻灰",
        model: "ZMH-002",
        brand: "水墨江南",
        code: generateSampleCode("芝麻灰", "水墨江南", 5),
        specs: "600x600x30mm",
        color: "灰白色",
        material: "通体瓷砖",
        description:
          "水墨江南芝麻灰系列，颗粒均匀色调柔和，室内外通用性价比极高。",
        procurement: false,
        procurementRange: "范围外",
        imageUrl: svgImageUrl("Z", "#c8c8c0"),
      },
      {
        id: "s-demo-6",
        projectId: "p-demo-1",
        name: "俄罗斯金",
        model: "ELSJ-003",
        brand: "水墨江南",
        code: generateSampleCode("俄罗斯金", "水墨江南", 6),
        specs: "800x800x20mm",
        color: "金色",
        material: "通体大理石",
        description:
          "水墨江南俄罗斯金色系列，暖金色调高贵典雅，适合背景墙和柱面装饰。",
        procurement: false,
        procurementRange: "范围外",
        imageUrl: svgImageUrl("E", "#e8d5a3"),
      },
      {
        id: "s-demo-7",
        projectId: "p-demo-1",
        name: "银白龙",
        model: "YBL-001",
        brand: "水墨江南",
        code: generateSampleCode("银白龙", "水墨江南", 7),
        specs: "600x900x20mm",
        color: "银白色",
        material: "通体大理石",
        description: "水墨江南银白龙系列，银白底色配深灰纹理，极具装饰效果。",
        procurement: true,
        imageUrl: svgImageUrl("Y", "#e8e8f0"),
      },
      {
        id: "s-demo-8",
        projectId: "p-demo-1",
        name: "蓝金沙",
        model: "LJS-002",
        brand: "水墨江南",
        code: generateSampleCode("蓝金沙", "水墨江南", 8),
        specs: "800x800x20mm",
        color: "蓝色金色",
        material: "通体大理石",
        description:
          "水墨江南蓝金沙系列，深邃蓝色底纹上点缀金色沙粒，星空般璀璨夺目。",
        procurement: true,
        imageUrl: svgImageUrl("L", "#c8d8e8"),
      },
    ];

    Store.saveProjects(seedProjects);
    Store.saveSamples(seedSamples);
    Store.set("easycod_seeded", SEED_VERSION);
  }

  async handleLogout() {
    // 显示模糊加载遮罩
    document.getElementById("globalLoading").classList.add("active");

    if (supabaseClient) {
      supabaseClient.auth
        .signOut()
        .catch((e) => console.warn("Supabase signOut error:", e));
    }
    Store.clearSession();
    this.user = null;
    this.uploadManager.setUserId("");
    this.currentProjectId = null;
    this.inviteCodeVerified = false;
    document.getElementById("loginEmail").value = "";
    document.getElementById("loginPassword").value = "";
    await this.showLogin();
    this.showToast("已退出登录", "info");

    // 登录页渲染完成后隐藏遮罩
    document.getElementById("globalLoading").classList.remove("active");
  }

  openModal(id) {
    document.getElementById(id).classList.add("active");
  }

  closeModal(id) {
    document.getElementById(id).classList.remove("active");
  }

  // 静默同步（不弹toast，仅后台拉取数据并刷新界面）
  async silentSync() {
    await Store.loadProjectsFromDB();
    await Store.loadSamplesFromDB();
    Store.loadFieldVisibilityFromDB();
    Store.loadAllApprovalData().catch(() => {});
    this.renderProjects();
  }

  showToast(message, type = "info") {
    const container = document.getElementById("toastContainer");
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(8px)";
      toast.style.transition = "all 0.3s ease";
      setTimeout(() => toast.remove(), 300);
    }, 6000);
  }

  _populateProjectFilters() {
    return this.easycodRenderer._populateProjectFilters();
  }

  renderProjects() {
    return this.easycodRenderer.renderProjects();
  }

  // ============ 样板列表视图 ============
  renderSampleTable() {
    return this.easycodRenderer.renderSampleTable();
  }

  async saveProject() {
    const id = document.getElementById("projectId").value;
    const name = document.getElementById("projectName").value.trim();
    const description = document
      .getElementById("projectDescription")
      .value.trim();
    var isProc =
      document
        .getElementById("projectProcCapsule")
        .querySelector(".vis-pill-btn.active").dataset.value === "集采";
    var sy = document.getElementById("procStartYear").value;
    var sm = document.getElementById("procStartMonth").value;
    var ey = document.getElementById("procEndYear").value;
    var em = document.getElementById("procEndMonth").value;
    const procurementStart = isProc && sy && sm ? sy + "-" + sm : "";
    const procurementEnd = isProc && ey && em ? ey + "-" + em : "";
    const brand = document.getElementById("projectBrand").value.trim();

    if (
      isProc &&
      sy &&
      (sy.length !== 4 || parseInt(sy) < 2022 || parseInt(sy) > 2050)
    ) {
      this.showToast("开始年必须是 2022-2050 的四位数", "error");
      return;
    }
    if (
      isProc &&
      ey &&
      (ey.length !== 4 || parseInt(ey) < 2022 || parseInt(ey) > 2050)
    ) {
      this.showToast("结束年必须是 2022-2050 的四位数", "error");
      return;
    }

    if (!name) {
      this.showToast("请输入类别名称", "error");
      return;
    }

    const projects = Store.getProjects();

    if (id) {
      const index = projects.findIndex((p) => p.id === id);
      if (index !== -1) {
        const oldBrand = projects[index].brand;
        projects[index] = {
          ...projects[index],
          name,
          description,
          brand,
          procurement: isProc,
          procurementStart,
          procurementEnd,
          user_id: this.user?.id || projects[index].userId || "demo-user",
          updatedAt: new Date().toISOString(),
        };
        Store.saveProjects(projects);
        if (brand !== oldBrand) {
          const samples = Store.getSamples().map((s) =>
            s.projectId === id ? { ...s, brand } : s,
          );
          Store.saveSamples(samples);
          try {
            await Promise.all(samples.map((s) => Store.upsertSampleToDB(s)));
          } catch (e) {
            console.warn("Sample brand sync failed:", e);
            this.showToast("品牌同步到数据库失败，请检查网络", "error");
          }
        }
        // DB 写入失败不阻塞本地渲染
        try {
          await Store.upsertProjectToDB(projects[index]);
        } catch (e) {
          console.warn("Project DB sync failed:", e);
          this.showToast("数据库同步失败，请检查网络", "error");
        }
        this.showToast("类别已更新", "success");
      }
    } else {
      const project = {
        id: generateId(),
        name,
        description,
        brand,
        procurement: isProc,
        procurementStart: procurementStart || "",
        procurementEnd: procurementEnd || "",
        userId: this.user?.id || "demo-user",
        user_id: this.user?.id || "demo-user",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      projects.push(project);
      Store.saveProjects(projects);
      // DB 写入失败不阻塞本地渲染
      try {
        await Store.upsertProjectToDB(project);
      } catch (e) {
        console.warn("Project DB sync failed:", e);
        this.showToast("数据库同步失败，请检查网络", "error");
      }
      this.showToast("类别已创建", "success");
    }

    this.closeModal("projectModal");
    this.renderProjects();
  }

  _renderOneCard(project, sample) {
    return this.easycodRenderer._renderOneCard(project, sample);
  }

  _bindOneCard(cardEl) {
    return this.easycodRenderer._bindOneCard(cardEl);
  }

  renderSamples(projectId) {
    return this.easycodRenderer.renderSamples(projectId);
  }

  async _markLocalOnlySamples(projectId) {
    return this.easycodRenderer._markLocalOnlySamples(projectId);
  }

  async regenerateThumbnail(sampleId) {
    var samples = Store.getSamples();
    var sample = samples.find(function (s) {
      return s.id === sampleId;
    });
    if (!sample) return this.showToast("未找到样板", "error");
    if (!sample.imageUrl || !sample.imageUrl.startsWith("data:")) {
      this.showToast("原图数据不可用，无法生成缩略图", "error");
      this.renderSamples(this.currentProjectId);
      return;
    }
    // 检查 auth session，避免触发全局认证错误
    if (!supabaseClient) {
      this.showToast("未连接到数据库", "error");
      return;
    }
    try {
      var { data: sessionData } = await supabaseClient.auth.getSession();
      if (!sessionData || !sessionData.session) {
        this.showToast("登录已过期，请重新登录", "error");
        return;
      }
    } catch (e) {
      this.showToast("认证检查失败，请重新登录", "error");
      return;
    }
    var projectId = sample.projectId || this.currentProjectId;
    try {
      this.showToast("正在生成缩略图...", "info");
      var thumb = await compressImage(sample.imageUrl, 200, 0.7);
      if (!thumb) {
        this.showToast("缩略图压缩失败", "error");
        this.renderSamples(projectId);
        return;
      }
      var signedUrl = await uploadImageToStorage(thumb, sampleId, "thumb");
      sample.thumbnailUrl = signedUrl;
      sample._uploadFailed = false;
      sample._pendingUpload = false;
      Store.saveSamples(samples);
      await this.dbWriter.upsertSample(sample, this.user?.id);
      this.showToast("缩略图已生成", "success");
      this.renderSamples(projectId);
    } catch (e) {
      console.warn("regenerateThumbnail failed:", e);
      this.showToast(
        "缩略图生成失败: " + (e.message || "").substring(0, 30),
        "error",
      );
      this.renderSamples(projectId);
    }
  }

  updateBatchBtns() {
    return this.easycodRenderer.updateBatchBtns();
  }

  selectAllSamples() {
    return this.easycodRenderer.selectAllSamples();
  }

  initProjectTimeSelects() {
    [
      ["procStartYear", "开始年", "procStartMonth"],
      ["procEndYear", "结束年", "procEndMonth"],
    ].forEach(function (pair) {
      var mSel = document.getElementById(pair[2]);
      if (!mSel) return;
      mSel.innerHTML = '<option value="">月</option>';
      for (var m = 1; m <= 12; m++) {
        var opt = document.createElement("option");
        var mv = String(m).padStart(2, "0");
        opt.value = mv;
        opt.textContent = m + "月";
        mSel.appendChild(opt);
      }
    });
    // year input: only allow digits, validate on blur
    document
      .querySelectorAll("#procStartYear,#procEndYear")
      .forEach(function (inp) {
        inp.addEventListener("input", function () {
          this.value = this.value.replace(/\D/g, "").slice(0, 4);
        });
        inp.addEventListener("blur", function () {
          var v = this.value.trim();
          if (
            v &&
            (v.length !== 4 || parseInt(v) < 2022 || parseInt(v) > 2050)
          ) {
            this.style.borderColor = "var(--danger)";
          } else {
            this.style.borderColor = "";
          }
        });
      });
  }

  openCropModal(file) {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      this._cropImageSrc = e.target.result;
      this._loadCropImage(this._cropImageSrc);
    };
    reader.readAsDataURL(file);

    document.getElementById("cropModal").classList.add("active");
  }

  _loadCropImage(src) {
    const img = new Image();
    img.onload = () => {
      this._cropOriginalImg = img;

      const canvas = document.getElementById("cropImageCanvas");
      const maxW = window.innerWidth * 0.95;
      const maxH = (window.innerHeight - 140) * 0.9;
      let w = img.width;
      let h = img.height;
      const scale = Math.min(maxW / w, maxH / h, 1);
      w = Math.round(w * scale);
      h = Math.round(h * scale);
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, w, h);
      ctx.drawImage(img, 0, 0, w, h);

      this._cropDisplayW = w;
      this._cropDisplayH = h;
      this._cropScale = scale;

      const selector = document.getElementById("cropSelector");
      const size = Math.min(w, h) * 0.85;
      const sx = (w - size) / 2;
      const sy = (h - size) / 2;
      selector.style.left = sx + "px";
      selector.style.top = sy + "px";
      selector.style.width = size + "px";
      selector.style.height = size + "px";

      this._initCropDrag(selector);
      this._initCropResize(selector);
    };
    img.src = src;
  }

  _initCropDrag(selector) {
    let startX, startY, startL, startT;

    const onStart = (ex, ey) => {
      startX = ex;
      startY = ey;
      startL = parseInt(selector.style.left);
      startT = parseInt(selector.style.top);
    };

    const onMove = (ex, ey) => {
      if (startX === undefined) return;
      const dx = ex - startX;
      const dy = ey - startY;
      let l = startL + dx;
      let t = startT + dy;
      const pw = parseInt(selector.style.width);
      const ph = parseInt(selector.style.height);
      l = Math.max(0, Math.min(l, this._cropDisplayW - pw));
      t = Math.max(0, Math.min(t, this._cropDisplayH - ph));
      selector.style.left = l + "px";
      selector.style.top = t + "px";
    };

    const onEnd = () => {
      startX = undefined;
    };

    selector.addEventListener("mousedown", (e) => {
      if (e.target !== selector) return;
      onStart(e.clientX, e.clientY);
    });
    document.addEventListener("mousemove", (e) => {
      onMove(e.clientX, e.clientY);
    });
    document.addEventListener("mouseup", onEnd);

    selector.addEventListener(
      "touchstart",
      (e) => {
        if (e.target !== selector) return;
        const t = e.touches[0];
        onStart(t.clientX, t.clientY);
      },
      { passive: true },
    );
    document.addEventListener(
      "touchmove",
      (e) => {
        const t = e.touches[0];
        onMove(t.clientX, t.clientY);
      },
      { passive: true },
    );
    document.addEventListener("touchend", onEnd, { passive: true });
  }

  _initCropResize(selector) {
    let handle = null;
    let startX, startY, startL, startT, startW, startH;
    const minSize = 40;

    const onStart = (hEl, ex, ey) => {
      handle = hEl;
      startX = ex;
      startY = ey;
      startL = parseInt(selector.style.left);
      startT = parseInt(selector.style.top);
      startW = parseInt(selector.style.width);
      startH = parseInt(selector.style.height);
    };

    const onMove = (ex, ey) => {
      if (!handle) return;
      const dx = ex - startX;
      const dy = ey - startY;
      let l = startL,
        t = startT,
        w = startW,
        h = startH;

      const cls = handle.className;
      const isE = cls.includes("crop-handle-e");
      const isW = cls.includes("crop-handle-w");
      const isS = cls.includes("crop-handle-s");
      const isN = cls.includes("crop-handle-n");
      if (isE) {
        w = Math.max(minSize, startW + dx);
      }
      if (isW) {
        const nw = Math.max(minSize, startW - dx);
        l = startL + startW - nw;
        w = nw;
      }
      if (isS) {
        h = Math.max(minSize, startH + dy);
      }
      if (isN) {
        const nh = Math.max(minSize, startH - dy);
        t = startT + startH - nh;
        h = nh;
      }

      l = Math.max(0, Math.min(l, this._cropDisplayW - minSize));
      t = Math.max(0, Math.min(t, this._cropDisplayH - minSize));
      w = Math.min(w, this._cropDisplayW - l);
      h = Math.min(h, this._cropDisplayH - t);

      selector.style.left = l + "px";
      selector.style.top = t + "px";
      selector.style.width = w + "px";
      selector.style.height = h + "px";
    };

    const onEnd = () => {
      handle = null;
    };

    document.querySelectorAll(".crop-handle").forEach((el) => {
      el.addEventListener("mousedown", (e) => {
        e.stopPropagation();
        onStart(el, e.clientX, e.clientY);
      });
      el.addEventListener(
        "touchstart",
        (e) => {
          e.stopPropagation();
          const t = e.touches[0];
          onStart(el, t.clientX, t.clientY);
        },
        { passive: true },
      );
    });
    document.addEventListener("mousemove", (e) => {
      onMove(e.clientX, e.clientY);
    });
    document.addEventListener("mouseup", onEnd);
    document.addEventListener(
      "touchmove",
      (e) => {
        const t = e.touches[0];
        onMove(t.clientX, t.clientY);
      },
      { passive: true },
    );
    document.addEventListener("touchend", onEnd, { passive: true });
  }

  closeCropModal() {
    document.getElementById("cropModal").classList.remove("active");
    this._cropOriginalImg = null;
  }

  finalizeCrop() {
    const selector = document.getElementById("cropSelector");
    const sx = parseInt(selector.style.left);
    const sy = parseInt(selector.style.top);
    const sw = parseInt(selector.style.width);
    const sh = parseInt(selector.style.height);

    const scale = this._cropScale;
    const ox = Math.round(sx / scale);
    const oy = Math.round(sy / scale);
    const ow = Math.round(sw / scale);
    const oh = Math.round(sh / scale);

    const cropCanvas = document.createElement("canvas");
    cropCanvas.width = ow;
    cropCanvas.height = oh;
    const ctx = cropCanvas.getContext("2d");
    ctx.drawImage(this._cropOriginalImg, ox, oy, ow, oh, 0, 0, ow, oh);

    let croppedDataUrl = cropCanvas.toDataURL("image/jpeg", 0.9);

    const maxBytes = 1024 * 1024;
    let q = 0.9;
    while (croppedDataUrl.length * 0.75 > maxBytes && q > 0.15) {
      q = Math.round((q - 0.1) * 10) / 10;
      croppedDataUrl = cropCanvas.toDataURL("image/jpeg", q);
    }

    this.closeCropModal();
    this._applyCroppedImage(croppedDataUrl);
  }

  _applyCroppedImage(dataUrl) {
    const preview = document.getElementById("sampleImagePreview");
    preview.src = dataUrl;
    document.getElementById("imagePreview").classList.add("has-image");
    document.getElementById("imagePlaceholder").style.display = "none";
  }

  async saveSample() {
    const id = document.getElementById("sampleId").value;
    const name = document.getElementById("sampleName").value.trim();
    const model = document.getElementById("sampleModel").value.trim();
    const brand = document.getElementById("sampleBrand").value.trim();
    const specs = document.getElementById("sampleSpecs").value.trim();
    const color = document.getElementById("sampleColor").value.trim();
    const material = document.getElementById("sampleMaterial").value.trim();
    const description = document
      .getElementById("sampleDescription")
      .value.trim();
    const activeBtn = document.querySelector(
      "#procurementRangeCapsule .vis-pill-btn.active",
    );
    const procurementRange = activeBtn ? activeBtn.dataset.value : "范围外";
    const localImageUrl =
      document.getElementById("sampleImagePreview").src || "";

    if (!name) {
      this.showToast("请输入样板名称", "error");
      return;
    }

    if (model) {
      const allSamples = Store.getSamples();
      const duplicate = allSamples.find(
        (s) => s.model === model && s.id !== id,
      );
      if (duplicate) {
        this.showToast(
          `型号"${model}"已存在（${duplicate.name}），请勿重复录入`,
          "error",
        );
        return;
      }
    }

    // ── 阶段一：乐观更新（立即写本地 Store，关闭弹窗，渲染卡片）──
    const samples = Store.getSamples();
    const hasNewImage = localImageUrl && localImageUrl.startsWith("data:");
    const previewEl = document.getElementById("sampleImagePreview");
    const oldStorageUrl = previewEl ? previewEl.dataset.storageUrl || "" : "";
    const oldThumbUrl = previewEl
      ? previewEl.dataset.thumbnailStorageUrl || ""
      : "";

    // 新图片压缩为极小的预览版存 Store，避免手机端 data URL 导致 localStorage 配额超限
    // 原图仍通过 localImageUrl 传给 UploadManager 上传 Supabase
    let previewImageUrl = localImageUrl;
    if (hasNewImage) {
      try {
        const compressed = await compressImage(localImageUrl, 200, 0.6);
        if (compressed) {
          previewImageUrl = compressed;
        }
      } catch (e) {
        console.warn("[saveSample] preview compression failed:", e);
      }
    }

    if (id) {
      // 编辑已有样板
      const index = samples.findIndex((s) => s.id === id);
      if (index !== -1) {
        samples[index] = {
          ...samples[index],
          name,
          model,
          brand,
          specs,
          color,
          material,
          description,
          code: getSampleCode() || samples[index].code,
          procurementRange,
          imageUrl: hasNewImage
            ? previewImageUrl
            : samples[index].imageUrl || "",
          thumbnailUrl: hasNewImage
            ? previewImageUrl
            : samples[index].thumbnailUrl || "",
          user_id: this.user?.id || samples[index].userId || "demo-user",
          updatedAt: new Date().toISOString(),
          _uploadFailed: false,
          _pendingUpload: hasNewImage,
        };
        Store.saveSamples(samples);
      }
    } else {
      // 新建样板
      const project = Store.getProjects().find(
        (p) => p.id === this.currentProjectId,
      );
      const code =
        getSampleCode() ||
        generateSampleCode(
          name,
          brand,
          nextSeqForProject(this.currentProjectId),
        );
      const sample = {
        id: generateId(),
        projectId: this.currentProjectId,
        name,
        model,
        brand,
        code,
        short_code: _genShortCode(), // 新建样板自动生成短码（动态二维码）
        imageUrl: previewImageUrl || "",
        thumbnailUrl: previewImageUrl || "",
        description,
        specs,
        color,
        material,
        procurementRange,
        userId: this.user?.id || "demo-user",
        user_id: this.user?.id || "demo-user",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        _uploadFailed: false,
        _pendingUpload: hasNewImage,
      };
      samples.push(sample);
      Store.saveSamples(samples);
      // 确保新建后 sampleId 被清除，防止下次保存变成编辑
      document.getElementById("sampleId").value = "";
    }

    const targetId = id || samples[samples.length - 1].id;
    const targetSample = samples.find((s) => s.id === targetId);
    const code = targetSample ? targetSample.code : "";

    this.closeModal("sampleModal");

    if (id) {
      // 编辑：全量重渲染（封面、信息可能变化）
      this.renderSamples(this.currentProjectId);
    } else {
      // 新建：增量追加，不动已有 DOM
      console.log(
        "[SAVE] 新建样板:",
        targetSample.name,
        targetSample.code,
        "id=",
        targetId,
      );
      const container = document.getElementById("samplesContainer");
      const oldPlaceholder = document.getElementById("placeholderSampleCard");
      if (oldPlaceholder) oldPlaceholder.remove();
      const project = Store.getProjects().find(function (p) {
        return p.id === this.currentProjectId;
      }, this);
      const cardHtml = this._renderOneCard(project || {}, targetSample);
      container.insertAdjacentHTML("beforeend", cardHtml);
      const newCard = container.querySelector(
        '.sample-card[data-id="' + targetId + '"]',
      );
      if (newCard) this._bindOneCard(newCard);
      // 重新插入 "+" 占位卡到最前面
      container.insertAdjacentHTML(
        "afterbegin",
        '<div class="sample-card sample-placeholder" id="placeholderSampleCard" style="display:flex;align-items:center;justify-content:center;flex-direction:column;gap:4px;">' +
          '<span style="font-size:2rem;line-height:1;color:var(--primary)">+</span>' +
          '<span style="font-size:0.8rem;color:var(--text-light)">录入样板</span>' +
          "</div>",
      );
      // 新建样板暂不检查同步状态——UploadManager 上传完成后再 sync 即可
    }

    // ── 阶段二：加入上传队列（UploadManager 管理）──
    this.uploadManager.enqueue({
      targetId,
      isEdit: !!id,
      localImageUrl,
      hasNewImage,
      oldStorageUrl,
      oldThumbUrl,
      code,
    });
  }

  editSample(sample) {
    // 支持传字符串 ID
    if (typeof sample === "string") {
      sample = this._allSamples
        ? this._allSamples.find((s) => s.id === sample)
        : null;
      if (!sample) return;
    }
    this.openModal("sampleModal");
    document.getElementById("sampleModalTitle").textContent = "编辑样板";
    document.getElementById("sampleId").value = sample.id;
    document.getElementById("sampleName").value = sample.name;
    document.getElementById("sampleModel").value = sample.model || "";
    document.getElementById("sampleBrand").value = sample.brand || "";
    document.getElementById("sampleSpecs").value = sample.specs || "";
    document.getElementById("sampleColor").value = sample.color || "";
    document.getElementById("sampleMaterial").value = sample.material || "";
    document.getElementById("sampleDescription").value =
      sample.description || "";
    document.getElementById("sampleEditFields").style.display = "block";
    const range =
      sample.procurementRange || (sample.procurement ? "范围内" : "范围外");
    const capsule = document.getElementById("procurementRangeCapsule");
    capsule.querySelectorAll(".vis-pill-btn").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.value === range);
    });
    const project = Store.getProjects().find((p) => p.id === sample.projectId);
    if (project && project.procurement) {
      capsule.classList.remove("disabled");
      capsule.querySelectorAll("button").forEach((btn) => {
        btn.disabled = false;
      });
    } else {
      capsule.classList.add("disabled");
      capsule.querySelectorAll("button").forEach((btn) => {
        btn.disabled = true;
      });
    }
    setSampleCodeFields(sample.code || "");

    if (sample.imageUrl) {
      document.getElementById("sampleImagePreview").src = sample.imageUrl;
      document.getElementById("sampleImagePreview").dataset.thumbnailUrl =
        sample.thumbnailUrl || "";
      document.getElementById("sampleImagePreview").dataset.storageUrl =
        sample.imageUrl.includes("sample-images") ? sample.imageUrl : "";
      document.getElementById(
        "sampleImagePreview",
      ).dataset.thumbnailStorageUrl =
        sample.thumbnailUrl && sample.thumbnailUrl.includes("sample-images")
          ? sample.thumbnailUrl
          : "";
      document.getElementById("imagePreview").classList.add("has-image");
      document.getElementById("imagePlaceholder").style.display = "none";
    } else {
      document.getElementById("imagePreview").classList.remove("has-image");
      document.getElementById("sampleImagePreview").src = "";
      document.getElementById("imagePlaceholder").style.display = "";
    }
  }

  showSampleDetail(sampleId) {
    return this.easycodRenderer.showSampleDetail(sampleId);
  }

  showSingleLabel(sampleId) {
    return this.easycodRenderer.showSingleLabel(sampleId);
  }

  showImagePreview(src, alt) {
    return this.easycodRenderer.showImagePreview(src, alt);
  }

  renderLabels() {
    return this.easycodRenderer.renderLabels();
  }

  showLabelTypeModal() {
    return this.easycodRenderer.showLabelTypeModal();
  }

  confirmLabelTypePrint() {
    return this.easycodRenderer.confirmLabelTypePrint();
  }

  batchPrint() {
    return this.easycodRenderer.batchPrint();
  }

  renderLabelExtra(sample, project, dividerColor) {
    return this.easycodRenderer.renderLabelExtra(sample, project, dividerColor);
  }

  renderInfoView() {
    return this.easycodRenderer.renderInfoView();
  }

  // ============ 通用录入弹窗 ============
  _makeEntryModal(id, title, fields, saveFn) {
    var old = document.getElementById(id);
    if (old) old.remove();
    var overlay = document.createElement("div");
    overlay.className = "modal-overlay active";
    overlay.id = id;
    var fieldHtml = fields
      .map(function (f) {
        if (f.type === "select") {
          var opts = f.options
            .map(function (o) {
              return '<option value="' + esc(o) + '">' + esc(o) + "</option>";
            })
            .join("");
          return (
            '<div class="form-group"><label>' +
            esc(f.label) +
            '</label><select id="' +
            esc(f.id) +
            '">' +
            opts +
            "</select></div>"
          );
        }
        return (
          '<div class="form-group"><label>' +
          esc(f.label) +
          '</label><input type="' +
          esc(f.type || "text") +
          '" id="' +
          esc(f.id) +
          '" placeholder="' +
          esc(f.placeholder || "") +
          '" /></div>'
        );
      })
      .join("");
    overlay.innerHTML =
      '<div class="modal" style="max-width:480px"><div class="modal-header"><h3>' +
      esc(title) +
      '</h3><button class="modal-close">&times;</button></div><form class="modal-body" id="' +
      id +
      'Form">' +
      fieldHtml +
      '<div style="display:flex;gap:8px;justify-content:flex-end;margin-top:16px"><button type="button" class="btn btn-secondary modal-close-btn">取消</button><button type="submit" class="btn btn-primary">保存</button></div></form></div>';
    document.body.appendChild(overlay);
    overlay
      .querySelector(".modal-close")
      .addEventListener("click", function () {
        overlay.remove();
      });
    overlay
      .querySelector(".modal-close-btn")
      .addEventListener("click", function () {
        overlay.remove();
      });
    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) overlay.remove();
    });
    overlay.querySelector("form").addEventListener("submit", function (e) {
      e.preventDefault();
      var data = {};
      fields.forEach(function (f) {
        data[f.key] = document.getElementById(f.id).value.trim();
      });
      saveFn(data, function () {
        overlay.remove();
      });
    });
  }

  // ============ 仪表盘 ============
  copyInviteCode() {
    var code = Store.getDailyCode();
    if (!code) return;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(code)
        .then(function () {
          window.app.showToast("已复制邀请码: " + code, "success");
        })
        .catch(function () {
          alert("邀请码: " + code);
        });
    } else {
      alert("邀请码: " + code);
    }
  }

  // ============ 删除（密码验证） ============
  promptDelete(type, id, info) {
    this._deleteTarget = { type, id };
    document.getElementById("deleteConfirmInfo").textContent =
      "确定要删除此记录吗？此操作不可恢复。\n记录：" + info;
    document.getElementById("deletePasswordInput").value = "";
    document.getElementById("deletePasswordError").style.display = "none";
    this.openModal("deleteConfirmModal");
    setTimeout(
      () => document.getElementById("deletePasswordInput").focus(),
      100,
    );
  }

  async handleDeleteConfirm() {
    const password = document
      .getElementById("deletePasswordInput")
      .value.trim();
    if (!password) {
      this.showToast("请输入密码", "error");
      return;
    }

    // Verify password by trying to sign in
    if (this.user && !this.user.isDemo && supabaseClient) {
      try {
        const { error } = await supabaseClient.auth.signInWithPassword({
          email: this.user.email,
          password: password,
        });
        if (error) {
          document.getElementById("deletePasswordError").style.display =
            "block";
          this.showToast("密码错误，删除已取消", "error");
          return;
        }
      } catch (e) {
        this.showToast("密码验证失败", "error");
        return;
      }
    }

    // Password verified, proceed with delete
    const target = this._deleteTarget;
    if (!target) return;

    try {
      if (target.type === "order") {
        await this._execDelete("orders", target.id);
        let orders = Store.getOrders();
        orders = orders.filter((o) => o.id !== target.id);
        Store.saveOrders(orders);
        EasyorderAndproc.renderOrders();
      } else if (target.type === "apply") {
        await this._execDelete("apply_records", target.id);
        // 级联删除关联的审批记录
        await supabaseClient
          .from("ep_approvals")
          .delete()
          .eq("apply_record_id", target.id);
        let records = Store.getApplyRecords();
        records = records.filter((r) => r.id !== target.id);
        Store.saveApplyRecords(records);
        EasyorderAndproc.renderApply();
        Store.loadApprovalRecordsFromDB();
      } else if (target.type === "clock") {
        await this._execDelete("clock_records", target.id);
        let records = Store.getClockRecords();
        records = records.filter((r) => r.id !== target.id);
        Store.saveClockRecords(records);
        EasyorderAndproc.renderClock();
      } else if (target.type === "wfnode") {
        // 流程节点删除：删节点 + 清理审批人分配 + 重排序号（在流程模块内完成）
        await EasyorderAndproc.deleteWorkflowNode(target.id);
      } else if (target.type === "sample") {
        await this._execDelete("samples", target.id);
        // 删除关联的存储图片
        var oldSamples = Store.getSamples();
        var oldS = oldSamples.find((s) => s.id === target.id);
        if (oldS) {
          if (oldS.imageUrl) deleteImageFromStorage(oldS.imageUrl);
          if (oldS.thumbnailUrl) deleteImageFromStorage(oldS.thumbnailUrl);
        }
        var samples = oldSamples.filter(function (s) {
          return s.id !== target.id;
        });
        Store.saveSamples(samples);
        this.renderSamples(this.currentProjectId);
      } else if (target.type === "batch_samples") {
        var ids = JSON.parse(target.id);
        var samples = Store.getSamples();
        var idSet = new Set(ids);
        // 删除关联的存储图片
        samples.forEach(function (s) {
          if (idSet.has(s.id)) {
            if (s.imageUrl) deleteImageFromStorage(s.imageUrl);
            if (s.thumbnailUrl) deleteImageFromStorage(s.thumbnailUrl);
          }
        });
        // 删除 DB 记录
        ids.forEach(function (id) {
          this._execDelete("samples", id);
        }, this);
        samples = samples.filter(function (s) {
          return !idSet.has(s.id);
        });
        Store.saveSamples(samples);
        this.selectedSamples.clear();
        this.updateBatchBtns();
        this.renderSamples(this.currentProjectId);
      } else if (target.type === "ep_user") {
        await this._execDelete("ep_users", target.id);
        await Store.loadApprovalUsersFromDB();
        EasyorderAndproc.renderApprovalUsers();
      } else if (target.type === "project") {
        // 删除类别及其关联的样板（含存储桶中的图片）
        var id = target.id;
        var allS = Store.getSamples();
        allS
          .filter(function (s) {
            return s.projectId === id;
          })
          .forEach(function (s) {
            if (s.imageUrl) deleteImageFromStorage(s.imageUrl);
            if (s.thumbnailUrl) deleteImageFromStorage(s.thumbnailUrl);
          });
        await this._execDelete("projects", id);
        await Store.deleteSamplesByProjectFromDB(id);
        var projects = Store.getProjects().filter(function (p) {
          return p.id !== id;
        });
        Store.saveProjects(projects);
        var samples = allS.filter(function (s) {
          return s.projectId !== id;
        });
        Store.saveSamples(samples);
        // 如果删除的是当前正在查看的类别，切回类别列表
        if (this.currentProjectId === id) {
          this.currentProjectId = null;
          this.showView("projects");
        }
        this.renderProjects();
      } else if (target.type === "batchOrders") {
        // 批量删除订单
        var ids = target.id; // array
        for (var bi = 0; bi < ids.length; bi++) {
          await this._execDelete("orders", ids[bi]);
        }
        var orders = Store.getOrders().filter(function (o) {
          return ids.indexOf(o.id) === -1;
        });
        Store.saveOrders(orders);
        EasyorderAndproc.renderOrders();
      } else if (target.type === "batchApply") {
        var ids = target.id;
        for (var bi = 0; bi < ids.length; bi++) {
          await this._execDelete("apply_records", ids[bi]);
        }
        // 级联删除关联的审批记录
        await supabaseClient
          .from("ep_approvals")
          .delete()
          .in("apply_record_id", ids);
        var records = Store.getApplyRecords().filter(function (r) {
          return ids.indexOf(r.id) === -1;
        });
        Store.saveApplyRecords(records);
        EasyorderAndproc.renderApply();
        Store.loadApprovalRecordsFromDB();
      } else if (target.type === "batchClock") {
        var ids = target.id;
        for (var bi = 0; bi < ids.length; bi++) {
          await this._execDelete("clock_records", ids[bi]);
        }
        var records = Store.getClockRecords().filter(function (r) {
          return ids.indexOf(r.id) === -1;
        });
        Store.saveClockRecords(records);
        EasyorderAndproc.renderClock();
      } else if (target.type === "vaChatLog") {
        await this._execDelete("ev_chat_logs", target.id);
        Easyvoice.renderLogs();
      } else if (target.type === "batchVaChatLog") {
        var ids = target.id;
        await supabaseClient.from("ev_chat_logs").delete().in("id", ids);
        Easyvoice.renderLogs();
      } else if (target.type === "vaPersonality") {
        await this._execDelete("ev_personality", target.id);
        Easyvoice.renderPersonality();
      } else if (target.type === "vaBehavior") {
        await this._execDelete("ev_behavior", target.id);
        Easyvoice.renderBehavior();
      } else if (target.type === "vaVerification") {
        await this._execDelete("ev_verification", target.id);
        Easyvoice.renderVerification();
      } else if (target.type === "vaPrecipRules") {
        await this._execDelete("ev_precipitation_rules", target.id);
        Easyvoice.renderPrecipRules();
      } else if (target.type === "vaFunction") {
        await this._execDelete("ev_functions", target.id);
        Easyvoice.renderFunctions();
      }
      this.closeModal("deleteConfirmModal");
      document.getElementById("deletePasswordInput").value = "";
      this.showToast("删除成功", "success");
    } catch (e) {
      this.showToast("删除失败: " + e.message, "error");
    }
    this._deleteTarget = null;
  }

  async _execDelete(table, id) {
    if (!supabaseClient) return;
    const { error } = await supabaseClient.from(table).delete().eq("id", id);
    if (error) throw error;
  }

  // ============ 审批人管理 ============

  // ============ 工具方法 ============

  _esc(str) {
    if (!str && str !== 0) return "";
    var d = document.createElement("div");
    d.appendChild(document.createTextNode(str));
    return d.innerHTML;
  }

  _fmtDT(val) {
    if (!val) return "-";
    try {
      var d = new Date(val);
      return (
        d.getFullYear() +
        "-" +
        String(d.getMonth() + 1).padStart(2, "0") +
        "-" +
        String(d.getDate()).padStart(2, "0") +
        " " +
        String(d.getHours()).padStart(2, "0") +
        ":" +
        String(d.getMinutes()).padStart(2, "0")
      );
    } catch (e) {
      return val;
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  window.app = new App();
});
