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
  const pinyinMap = {
    一: "Y",
    二: "E",
    三: "S",
    四: "S",
    五: "W",
    六: "L",
    七: "Q",
    八: "B",
    九: "J",
    十: "S",
    百: "B",
    千: "Q",
    万: "W",
    亿: "Y",
    零: "L",
    水: "S",
    墨: "M",
    江: "J",
    南: "N",
    东: "D",
    鹏: "P",
    将: "J",
    军: "J",
    马: "M",
    可: "K",
    波: "B",
    诺: "N",
    米: "M",
    黄: "H",
    洞: "D",
    石: "S",
    意: "Y",
    大: "D",
    利: "L",
    灰: "H",
    黑: "H",
    金: "J",
    花: "H",
    白: "B",
    麻: "M",
    岗: "G",
    岩: "Y",
    芝: "Z",
    俄: "E",
    罗: "L",
    斯: "S",
    银: "Y",
    龙: "L",
    蓝: "L",
    沙: "S",
    红: "H",
    绿: "L",
    紫: "Z",
    棕: "Z",
    咖: "K",
    啡: "F",
    杏: "X",
    浅: "Q",
    深: "S",
    中: "Z",
    暖: "N",
    冷: "L",
    仿: "F",
    古: "G",
    木: "M",
    地: "D",
    板: "B",
    瓷: "C",
    砖: "Z",
    通: "T",
    体: "T",
    天: "T",
    然: "R",
    抛: "P",
    光: "G",
    釉: "Y",
    面: "M",
    防: "F",
    滑: "H",
    磨: "M",
    砂: "S",
    新: "X",
    国: "G",
    现: "X",
    代: "D",
    简: "J",
    约: "Y",
    风: "F",
    雅: "Y",
    致: "Z",
    经: "J",
    典: "D",
    奢: "S",
    华: "H",
    欧: "O",
    式: "S",
    美: "M",
    田: "T",
    法: "F",
    式: "S",
    艺: "Y",
    术: "S",
    理: "L",
    纹: "W",
    哑: "Y",
    亮: "L",
    精: "J",
    工: "G",
    星: "X",
    空: "K",
    闪: "S",
    钻: "Z",
    鱼: "Y",
    肚: "D",
    玉: "Y",
    贝: "B",
    冰: "B",
    川: "C",
    雪: "X",
    山: "S",
    云: "Y",
    海: "H",
    山: "S",
    河: "H",
    湖: "H",
    泊: "B",
    林: "L",
    木: "M",
    秋: "Q",
    韵: "Y",
    春: "C",
    夏: "X",
    冬: "D",
    宫: "G",
    殿: "D",
    庭: "T",
    院: "Y",
    家: "J",
    居: "J",
    酒: "J",
    店: "D",
    餐: "C",
    厅: "T",
    A: "A",
    B: "B",
    C: "C",
    D: "D",
    E: "E",
    F: "F",
    G: "G",
    H: "H",
    I: "I",
    J: "J",
    K: "K",
    L: "L",
    M: "M",
    N: "N",
    O: "O",
    P: "P",
    Q: "Q",
    R: "R",
    S: "S",
    T: "T",
    U: "U",
    V: "V",
    W: "W",
    X: "X",
    Y: "Y",
    Z: "Z",
  };
  const chars = str.trim().split("");
  let result = "";
  for (const ch of chars) {
    if (pinyinMap[ch]) {
      result += pinyinMap[ch];
    } else if (/[a-zA-Z]/.test(ch)) {
      result += ch.toUpperCase();
    } else if (/[\u4e00-\u9fff]/.test(ch)) {
      result += "X";
    }
    if (result.length >= 2) break;
  }
  return result.padEnd(2, "X");
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

function qrPageUrl(sampleId) {
  // 始终指向生产环境 GitHub Pages，不受本地开发影响
  return (
    "https://adwardnewstar.github.io/easycod/sample-detail.html?id=" + sampleId
  );
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
      .select("node_id,user_id");
    if (error) throw error;
    Store.saveWfAssignees(data || []);
  }

  static async loadAllWorkflowData() {
    if (!supabaseClient) return;
    await Promise.all([
      Store.loadWfTemplatesFromDB(),
      Store.loadWfNodesFromDB(),
      Store.loadWfAssigneesFromDB(),
    ]);
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
    await Promise.all([
      Store.loadApprovalUsersFromDB(),
      Store.loadAllWorkflowData(),
      Store.loadApprovalRecordsFromDB(),
      Store.loadApprovalLogsFromDB(),
    ]);
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
      await this._restoreSupabaseSession(session);
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
        this._restoreSupabaseSession(session);
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
    if (!session._supabaseSession || !supabaseClient) return;
    try {
      await supabaseClient.auth.setSession({
        access_token: session._supabaseSession.access_token,
        refresh_token: session._supabaseSession.refresh_token,
      });
    } catch (e) {
      console.warn("_restoreSupabaseSession failed:", e);
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
              ]).catch(function (e2) {
                console.warn("silent load failed:", e2);
              });
            };
          })(this),
        )
        .catch(function (e) {
          console.warn("DB load failed:", e);
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
      this.renderOrders();
      this.showView("orders");
    });
    bind("navApply", () => {
      this.renderApply();
      this.showView("apply");
    });
    bind("navClock", () => {
      this.renderClock();
      this.showView("clock");
    });
    bind("navApprovalUsers", () => {
      this.renderApprovalUsers();
      this.showView("approvalUsers");
    });
    bind("navWorkflows", () => {
      this.renderWorkflows();
      this.showView("workflows");
    });
    bind("navApprovalRecords", () => {
      this.renderApprovalRecords();
      this.showView("approvalRecords");
    });
    bind("navVoiceAssistant", () => {
      this.renderVoiceAssistantView();
      this.showView("voiceAssistant");
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

    // 语音助手 - 多标签切换
    const vaTabs = {
      vaTabKnowledge: "vaKnowledgeContainer",
      vaTabPersonality: "vaPersonalityContainer",
      vaTabBehavior: "vaBehaviorContainer",
      vaTabVerification: "vaVerificationContainer",
      vaTabPrecipRules: "vaPrecipRulesContainer",
      vaTabMemory: "vaMemoryContainer",
      vaTabErrors: "vaErrorsContainer",
      vaTabEmotion: "vaEmotionContainer",
      vaTabLogs: "vaLogsContainer",
      vaTabFunctions: "vaFunctionsContainer",
      vaTabInstincts: "vaInstinctsContainer",
    };
    const vaTabIds = Object.keys(vaTabs);
    const vaRenderMap = {
      vaTabKnowledge: () => this.renderVAKnowledge(),
      vaTabPersonality: () => this.renderVAPersonality(),
      vaTabBehavior: () => this.renderVABehavior(),
      vaTabVerification: () => this.renderVAVerification(),
      vaTabPrecipRules: () => this.renderVAPrecipRules(),
      vaTabMemory: () => this.renderVAMemory(),
      vaTabErrors: () => this.renderVAErrors(),
      vaTabEmotion: () => this.renderVAEmotion(),
      vaTabLogs: () => this.renderVALogs(),
      vaTabFunctions: () => this.renderVAFunctions(),
      vaTabInstincts: () => this.renderVAInstincts(),
    };
    for (const tabId of vaTabIds) {
      document.getElementById(tabId).addEventListener("click", () => {
        for (const tid of vaTabIds) {
          document.getElementById(tid).className = "toolbar-btn btn-secondary";
        }
        document.getElementById(tabId).className = "toolbar-btn btn-primary";
        for (const [tId, containerId] of Object.entries(vaTabs)) {
          document.getElementById(containerId).style.display =
            tId === tabId ? "" : "none";
        }
        if (vaRenderMap[tabId]) vaRenderMap[tabId]();
      });
    }

    // 每日沉淀
    document.getElementById("vaDailySummary").addEventListener("click", () => {
      this.runVADailySummary();
    });

    // 刷新：重渲当前可见标签
    document.getElementById("vaRefreshBtn").addEventListener("click", () => {
      const activeTabId = vaTabIds.find(
        (tid) => document.getElementById(vaTabs[tid]).style.display !== "none",
      );
      if (activeTabId && vaRenderMap[activeTabId]) {
        vaRenderMap[activeTabId]();
      }
      this.showToast("已刷新", "success");
    });

    // 刷新按钮
    document
      .getElementById("refreshOrdersBtn")
      .addEventListener("click", async () => {
        if (!supabaseClient) return;
        try {
          await Store.loadOrdersFromDB();
          this.renderOrders();
          this.showToast("订单数据已刷新", "success");
        } catch (e) {
          this.showToast("刷新失败: " + e.message, "error");
        }
      });
    document
      .getElementById("refreshApplyBtn")
      .addEventListener("click", async () => {
        if (!supabaseClient) return;
        try {
          await Store.loadApplyFromDB();
          this.renderApply();
          this.showToast("申请数据已刷新", "success");
        } catch (e) {
          this.showToast("刷新失败: " + e.message, "error");
        }
      });
    document
      .getElementById("refreshClockBtn")
      .addEventListener("click", async () => {
        if (!supabaseClient) return;
        try {
          await Store.loadClockFromDB();
          this.renderClock();
          this.showToast("打卡数据已刷新", "success");
        } catch (e) {
          this.showToast("刷新失败: " + e.message, "error");
        }
      });

    document
      .getElementById("refreshApprovalUsersBtn")
      .addEventListener("click", async () => {
        if (!supabaseClient) return;
        try {
          await Store.loadApprovalUsersFromDB();
        } catch (e) {
          /* silent */
        }
        this.renderApprovalUsers();
        this.showToast("数据已刷新", "success");
      });
    document
      .getElementById("refreshApprovalRecordsBtn")
      .addEventListener("click", async () => {
        if (!supabaseClient) return;
        try {
          await Store.loadApprovalRecordsFromDB();
        } catch (e) {
          /* silent */
        }
        this.renderApprovalRecords();
        this.showToast("数据已刷新", "success");
      });
    const refreshWfBtn = document.getElementById("refreshWorkflowsBtn");
    if (refreshWfBtn) {
      refreshWfBtn.addEventListener("click", async () => {
        if (!supabaseClient) return;
        try {
          await Store.loadAllWorkflowData();
        } catch (e) {
          /* silent */
        }
        this.renderWorkflows();
        this.showToast("数据已刷新", "success");
      });
    }

    // 录入按钮
    var createOrderBtn = document.getElementById("createOrderBtn");
    if (createOrderBtn)
      createOrderBtn.addEventListener("click", function () {
        window.app.showOrderEntry();
      });
    var createApplyBtn = document.getElementById("createApplyBtn");
    if (createApplyBtn)
      createApplyBtn.addEventListener("click", function () {
        window.app.showApplyEntry();
      });
    var createClockBtn = document.getElementById("createClockBtn");
    if (createClockBtn)
      createClockBtn.addEventListener("click", function () {
        window.app.showClockEntry();
      });

    document
      .getElementById("addApprovalUserBtn")
      .addEventListener("click", () => {
        this.showApprovalUserModal();
      });

    // Order filter
    document.getElementById("orderQueryBtn").addEventListener("click", () => {
      this.renderOrders();
    });

    // 全选按钮：点击切换全部勾选
    document
      .getElementById("selectAllOrders")
      .addEventListener("click", function () {
        var allCbs = document.querySelectorAll(".order-checkbox");
        var allChecked = Array.from(allCbs).every(function (cb) {
          return cb.checked;
        });
        var newState = !allChecked;
        var headerCb = document.getElementById("orderHeaderCheckbox");
        if (headerCb) headerCb.checked = newState;
        allCbs.forEach(function (cb) {
          cb.checked = newState;
        });
        this.textContent = newState ? "取消全选" : "全选";
      });

    // 批量删除
    document
      .getElementById("batchDeleteOrdersBtn")
      .addEventListener("click", () => {
        var checked = document.querySelectorAll(".order-checkbox:checked");
        if (checked.length === 0) {
          this.showToast("请先选择要删除的订单", "error");
          return;
        }
        var ids = Array.from(checked).map(function (cb) {
          return cb.value;
        });
        this.promptDelete(
          "batchOrders",
          ids,
          "批量删除 " + ids.length + " 条订单",
        );
      });

    // 申请管理 - 全选
    document
      .getElementById("selectAllApply")
      .addEventListener("click", function () {
        var allCbs = document.querySelectorAll(".apply-checkbox");
        var allChecked = Array.from(allCbs).every(function (cb) {
          return cb.checked;
        });
        var newState = !allChecked;
        var hcb = document.getElementById("applyHeaderCheckbox");
        if (hcb) hcb.checked = newState;
        allCbs.forEach(function (cb) {
          cb.checked = newState;
        });
        this.textContent = newState ? "取消全选" : "全选";
      });
    // 申请管理 - 批量删除
    document
      .getElementById("batchDeleteApplyBtn")
      .addEventListener("click", () => {
        var checked = document.querySelectorAll(".apply-checkbox:checked");
        if (checked.length === 0) {
          this.showToast("请先选择要删除的申请", "error");
          return;
        }
        var ids = Array.from(checked).map(function (cb) {
          return cb.value;
        });
        this.promptDelete(
          "batchApply",
          ids,
          "批量删除 " + ids.length + " 条申请",
        );
      });

    // 打卡管理 - 全选
    document
      .getElementById("selectAllClock")
      .addEventListener("click", function () {
        var allCbs = document.querySelectorAll(".clock-checkbox");
        var allChecked = Array.from(allCbs).every(function (cb) {
          return cb.checked;
        });
        var newState = !allChecked;
        var hcb = document.getElementById("clockHeaderCheckbox");
        if (hcb) hcb.checked = newState;
        allCbs.forEach(function (cb) {
          cb.checked = newState;
        });
        this.textContent = newState ? "取消全选" : "全选";
      });
    // 打卡管理 - 批量删除
    document
      .getElementById("batchDeleteClockBtn")
      .addEventListener("click", () => {
        var checked = document.querySelectorAll(".clock-checkbox:checked");
        if (checked.length === 0) {
          this.showToast("请先选择要删除的打卡记录", "error");
          return;
        }
        var ids = Array.from(checked).map(function (cb) {
          return cb.value;
        });
        this.promptDelete(
          "batchClock",
          ids,
          "批量删除 " + ids.length + " 条打卡记录",
        );
      });

    // Apply filter
    document.getElementById("applyQueryBtn").addEventListener("click", () => {
      this.renderApply();
    });

    // Clock filter
    document.getElementById("clockQueryBtn").addEventListener("click", () => {
      this.renderClock();
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
          this.handleDeleteConfirm();
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
    var samples = Store.getSamples() || [];
    var projects = Store.getProjects() || [];
    // 品牌
    var brandSet = {};
    samples.forEach(function (s) {
      if (s.brand) brandSet[s.brand] = 1;
    });
    projects.forEach(function (p) {
      if (p.brand) brandSet[p.brand] = 1;
    });
    var brands = Object.keys(brandSet).sort();
    var brandSel = document.getElementById("projectBrandFilter");
    if (brandSel) {
      var cur = brandSel.value;
      brandSel.innerHTML = '<option value="">全部品牌</option>';
      brands.forEach(function (b) {
        brandSel.innerHTML +=
          '<option value="' + esc(b) + '">' + esc(b) + "</option>";
      });
      brandSel.value = cur;
    }
    // 所属类别
    var catSel = document.getElementById("projectCategoryFilter");
    if (catSel) {
      var cur2 = catSel.value;
      catSel.innerHTML = '<option value="">所属类别</option>';
      projects.forEach(function (p) {
        catSel.innerHTML +=
          '<option value="' + esc(p.name) + '">' + esc(p.name) + "</option>";
      });
      catSel.value = cur2;
    }
  }

  renderProjects() {
    // 刷新筛选下拉
    this._populateProjectFilters();
    const container = document.getElementById("projectsContainer");
    // Sync search input
    var searchInput = document.getElementById("projectSearchInput");
    if (searchInput && this._projectSearch !== undefined) {
      searchInput.value = this._projectSearch;
    }
    // 读取筛选值
    var brandFlt =
      (document.getElementById("projectBrandFilter") || {}).value || "";
    var catFlt =
      (document.getElementById("projectCategoryFilter") || {}).value || "";
    var procFlt =
      (document.querySelector("#projectProcFilter .toggle-btn.active") || {})
        .dataset?.value || "";
    var rangeFlt =
      (document.querySelector("#projectRangeFilter .toggle-btn.active") || {})
        .dataset?.value || "";
    this._projectBrandFlt = brandFlt;
    this._projectCatFlt = catFlt;
    this._projectProcFlt = procFlt;
    this._projectRangeFlt = rangeFlt;

    if (this._projectView === "table") {
      container.className = "";
      this.renderSampleTable();
      return;
    }
    container.className = "card-grid";
    var projects = Store.getProjects();
    // 搜索过滤（品类名/品牌/是否集采）
    var searchTerm = (this._projectSearch || "").toLowerCase();
    if (searchTerm) {
      projects = projects.filter(function (p) {
        return (
          (p.name && p.name.toLowerCase().indexOf(searchTerm) !== -1) ||
          (p.brand && p.brand.toLowerCase().indexOf(searchTerm) !== -1) ||
          (p.description &&
            p.description.toLowerCase().indexOf(searchTerm) !== -1) ||
          (searchTerm.indexOf("集采") !== -1 && p.procurement) ||
          (searchTerm.indexOf("非集采") !== -1 && !p.procurement)
        );
      });
    }
    // 卡片模式品牌筛选
    if (brandFlt) {
      projects = projects.filter(function (p) {
        return p.brand === brandFlt;
      });
    }
    // 卡片模式所属类别（按项目名）
    if (catFlt) {
      projects = projects.filter(function (p) {
        return p.name === catFlt;
      });
    }
    // 卡片模式是否集采
    if (procFlt) {
      var isProc = procFlt === "集采";
      projects = projects.filter(function (p) {
        return (p.procurement || false) === isProc;
      });
    }
    if (projects.length === 0) {
      container.innerHTML = `
        <div class="card card-placeholder" id="placeholderCreateCard">
          <div class="card-body" style="display:flex;align-items:center;justify-content:center;flex-direction:column;gap:8px;min-height:120px">
            <span style="font-size:2rem;line-height:1;color:var(--primary)">+</span>
            <span style="font-size:0.9rem;color:var(--text-light)">新建品类</span>
          </div>
        </div>
      `;
      return;
    }
    container.innerHTML =
      `
        <div class="card card-placeholder" id="placeholderCreateCard">
          <div class="card-body" style="display:flex;align-items:center;justify-content:center;flex-direction:column;gap:8px;min-height:120px">
            <span style="font-size:2rem;line-height:1;color:var(--primary)">+</span>
            <span style="font-size:0.9rem;color:var(--text-light)">新建品类</span>
          </div>
        </div>
      ` +
      projects
        .map((project) => {
          const sampleCount = Store.getSamples().filter(
            (s) => s.projectId === project.id,
          ).length;
          const procurementHtml = project.procurement
            ? `<span class="card-badge procurement">集采</span>
           <span style="font-size:0.75rem;color:var(--text-light)">${formatDate(project.procurementStart)}-${formatDate(project.procurementEnd)}</span>`
            : `<span class="card-badge non-procurement">非集采</span>`;
          return `
        <div class="card" data-id="${project.id}">
          <div class="card-body">
            <div class="card-title-row">
              <div class="card-title">${project.name}</div>
              ${project.brand ? `<span class="card-meta-brand">${project.brand}</span>` : ""}
            </div>
            ${project.description ? `<div class="card-text">${project.description}</div>` : ""}
            <div class="card-meta">
              <span>${sampleCount} 个样板</span>
              ${procurementHtml}
            </div>
          </div>
          <div class="card-actions">
            <button class="btn btn-primary view-samples-btn" data-id="${project.id}">查看样板</button>
            <button class="btn btn-secondary edit-project-btn" data-id="${project.id}">编辑</button>
            <button class="btn btn-danger delete-project-btn" data-id="${project.id}">删除</button>
          </div>
        </div>
      `;
        })
        .join("");

    container.querySelectorAll(".view-samples-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.currentProjectId = btn.dataset.id;
        this.renderSamples(this.currentProjectId);
        this.showView("samples");
      });
    });

    container.querySelectorAll(".edit-project-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const project = projects.find((p) => p.id === btn.dataset.id);
        if (project) {
          this.initProjectTimeSelects();
          this.openModal("projectModal");
          document.getElementById("projectModalTitle").textContent = "编辑类别";
          document.getElementById("projectId").value = project.id;
          document.getElementById("projectName").value = project.name;
          document.getElementById("projectDescription").value =
            project.description || "";
          document.getElementById("projectBrand").value = project.brand || "";
          var isProc = project.procurement || false;
          var capsule = document.getElementById("projectProcCapsule");
          capsule.querySelectorAll(".vis-pill-btn").forEach(function (b) {
            b.classList.remove("active");
          });
          capsule
            .querySelector(
              '[data-value="' + (isProc ? "集采" : "非集采") + '"]',
            )
            .classList.add("active");
          document.getElementById("procTimeRow").style.display = isProc
            ? "flex"
            : "none";
          if (project.procurementStart) {
            var parts = project.procurementStart.split("-");
            if (parts.length === 2) {
              document.getElementById("procStartYear").value = parts[0];
              document.getElementById("procStartMonth").value = parts[1];
            }
          }
          if (project.procurementEnd) {
            var parts = project.procurementEnd.split("-");
            if (parts.length === 2) {
              document.getElementById("procEndYear").value = parts[0];
              document.getElementById("procEndMonth").value = parts[1];
            }
          }
        }
      });
    });

    container.querySelectorAll(".delete-project-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const project = Store.getProjects().find(function (p) {
          return p.id === btn.dataset.id;
        });
        window.app.promptDelete(
          "project",
          btn.dataset.id,
          "类别 " + (project ? project.name : ""),
        );
      });
    });
  }

  // ============ 样板列表视图 ============
  renderSampleTable() {
    this._allSamples = Store.getSamples() || [];
    var samples = Store.getSamples() || [];
    var projects = Store.getProjects() || [];
    var container = document.getElementById("projectsContainer");

    // Build maps (必须先构建，后续搜索过滤需要用到)
    var projectMap = {};
    var projectProcMap = {};
    projects.forEach(function (p) {
      projectMap[p.id] = p.name;
      projectProcMap[p.id] = p.procurement;
    });

    // 实时搜索过滤（编号/名称/型号/品牌/品类/集采/范围）
    var searchTerm = (this._projectSearch || "").toLowerCase();
    if (searchTerm) {
      samples = samples.filter(function (s) {
        var projectName = projectMap[s.projectId] || "";
        var isProc = projectProcMap[s.projectId];
        return (
          (s.code && s.code.toLowerCase().indexOf(searchTerm) !== -1) ||
          (s.name && s.name.toLowerCase().indexOf(searchTerm) !== -1) ||
          (s.model && s.model.toLowerCase().indexOf(searchTerm) !== -1) ||
          (s.brand && s.brand.toLowerCase().indexOf(searchTerm) !== -1) ||
          (s.procurementRange &&
            s.procurementRange.toLowerCase().indexOf(searchTerm) !== -1) ||
          (projectName &&
            projectName.toLowerCase().indexOf(searchTerm) !== -1) ||
          (searchTerm.indexOf("集采") !== -1 && isProc) ||
          (searchTerm.indexOf("非集采") !== -1 && !isProc)
        );
      });
    }

    if (samples.length === 0) {
      container.innerHTML = '<div class="empty-table">暂无样板数据</div>';
      return;
    }

    // Toolbar filters
    var brandFlt = this._projectBrandFlt || "";
    var catFlt = this._projectCatFlt || "";
    var procFlt = this._projectProcFlt || "";
    var rangeFlt = this._projectRangeFlt || "";

    var filteredSamples = samples.filter(function (s) {
      var pass = true;
      if (brandFlt && s.brand !== brandFlt) pass = false;
      if (pass && catFlt && projectMap[s.projectId] !== catFlt) pass = false;
      if (pass && procFlt) {
        var isProc = projectProcMap[s.projectId] ? "集采" : "非集采";
        if (isProc !== procFlt) pass = false;
      }
      if (pass && rangeFlt) {
        var r = projectProcMap[s.projectId] ? s.procurementRange : "范围外";
        if (r !== rangeFlt) pass = false;
      }
      return pass;
    });

    container.innerHTML =
      '<div style="overflow-x:auto;max-width:100%;">' +
      '<table class="data-table">' +
      "<thead><tr>" +
      '<th style="width:18px;padding:10px 4px;">序号</th>' +
      '<th style="width:44px;">图片</th>' +
      "<th>编号</th><th>名称</th><th>型号</th>" +
      "<th>品牌</th><th>所属类别</th><th>是否集采</th><th>集采范围</th>" +
      "<th>创建时间</th><th>操作</th>" +
      "</tr></thead><tbody>" +
      filteredSamples
        .map(function (s, i) {
          var thumb =
            s.thumbnailUrl || s.imageUrl
              ? '<img src="' +
                esc(s.thumbnailUrl || s.imageUrl) +
                '" style="width:32px;height:32px;object-fit:cover;border-radius:3px;cursor:pointer;display:block;" onclick="window.app.showImagePreview(\'' +
                esc(s.imageUrl) +
                "','" +
                esc(s.name) +
                "')\">"
              : '<span style="display:inline-block;width:32px;height:32px;background:var(--bg);border-radius:3px;"></span>';
          var isProcLabel = projectProcMap[s.projectId] ? "集采" : "非集采";
          return (
            "<tr>" +
            '<td style="text-align:center;padding:10px 4px;font-family:monospace;font-size:0.78rem;color:var(--text-light);">' +
            (i + 1) +
            "</td>" +
            '<td style="vertical-align:middle;">' +
            thumb +
            "</td>" +
            '<td style="font-family:monospace;font-size:0.78rem;">' +
            esc(s.code) +
            "</td>" +
            "<td>" +
            esc(s.name) +
            "</td>" +
            "<td>" +
            esc(s.model) +
            "</td>" +
            "<td>" +
            esc(s.brand) +
            "</td>" +
            "<td>" +
            esc(projectMap[s.projectId] || "-") +
            "</td>" +
            '<td style="color:' +
            (isProcLabel === "集采" ? "var(--success)" : "var(--danger)") +
            ';font-weight:500;">' +
            esc(isProcLabel) +
            "</td>" +
            '<td style="color:' +
            (projectProcMap[s.projectId]
              ? s.procurementRange === "范围内"
                ? "var(--success)"
                : "var(--warning)"
              : "var(--danger)") +
            ';font-weight:500;">' +
            esc(projectProcMap[s.projectId] ? s.procurementRange : "范围外") +
            "</td>" +
            '<td style="font-size:0.75rem;white-space:nowrap;">' +
            formatDateTime(s.createdAt) +
            "</td>" +
            '<td><div class="cell-actions">' +
            "<button onclick=\"window.app.showSampleDetail('" +
            s.id +
            "')\">查看</button>" +
            "<button onclick=\"window.app.editSample('" +
            s.id +
            "')\">编辑</button>" +
            "<button class=\"btn-danger\" onclick=\"window.app.promptDelete('sample','" +
            s.id +
            "','样板 " +
            esc(s.name) +
            "')\">删除</button>" +
            "</div></td>" +
            "</tr>"
          );
        })
        .join("") +
      "</tbody></table></div>";
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
    const initials = sample.name ? sample.name.substring(0, 2) : "??";
    const isProc = project && project.procurement;
    let scopeText, scopeColor, labelBg;
    if (isProc) {
      const r =
        sample.procurementRange || (sample.procurement ? "范围内" : "范围外");
      scopeText = "集采 · " + r;
      scopeColor = r === "范围内" ? "var(--success)" : "var(--warning)";
      labelBg =
        r === "范围内" ? "rgba(52,199,89,0.85)" : "rgba(255,149,0,0.85)";
    } else {
      scopeText = "非集采 · 范围外";
      scopeColor = "var(--danger)";
      labelBg = "rgba(255,59,48,0.85)";
    }
    return `
        <div class="sample-card" data-id="${sample.id}">
          <input type="checkbox" class="sample-checkbox" data-id="${sample.id}" ${this.selectedSamples.has(sample.id) ? "checked" : ""}>
          <div class="sample-image-wrap">
            ${
              sample.imageUrl
                ? `<img class="sample-image" src="${sample.thumbnailUrl || sample.imageUrl}" alt="${sample.name}" loading="lazy" data-fullsrc="${sample.imageUrl}">${sample._uploadFailed ? `<div class="sample-fail-watermark">FALSE</div>` : ""}`
                : `<div class="sample-image-placeholder">${initials}</div>`
            }
            <button class="btn-label-print" data-id="${sample.id}" title="打印标签" style="background:${labelBg};">标签</button>
          </div>
          <div class="sample-info">
            <div class="sample-title-row">
              <h3>${sample.name}</h3>
              <span class="sample-model">${sample.model || ""}</span>
            </div>
            <div class="sample-code">${sample.code || ""}</div>
            <div class="sample-scope" style="color:${scopeColor};">${scopeText}</div>
          </div>
          <div class="card-actions" style="padding:8px 12px;border-top:1px solid var(--border);background:var(--bg);display:flex;gap:4px;">
            <button class="btn btn-sm btn-ghost view-sample-detail-btn" data-id="${sample.id}" style="flex:1;">详情</button>
            <button class="btn btn-sm btn-ghost edit-sample-btn" data-id="${sample.id}" style="flex:1;">编辑</button>
            <button class="btn btn-sm btn-ghost delete-sample-btn" data-id="${sample.id}" style="flex:1;color:var(--danger);">删除</button>
          </div>
        </div>
      `;
  }

  _bindOneCard(cardEl) {
    const self = this;
    const cb = cardEl.querySelector(".sample-checkbox");
    if (cb) {
      cb.addEventListener("change", function (e) {
        e.stopPropagation();
        if (cb.checked) self.selectedSamples.add(cb.dataset.id);
        else self.selectedSamples.delete(cb.dataset.id);
        self.updateBatchBtns();
      });
    }
    const detailBtn = cardEl.querySelector(".view-sample-detail-btn");
    if (detailBtn) {
      detailBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        self.showSampleDetail(detailBtn.dataset.id);
      });
    }
    const editBtn = cardEl.querySelector(".edit-sample-btn");
    if (editBtn) {
      editBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        const samples = Store.getSamples();
        const sample = samples.find(function (s) {
          return s.id === editBtn.dataset.id;
        });
        if (sample) self.editSample(sample);
      });
    }
    const delBtn = cardEl.querySelector(".delete-sample-btn");
    if (delBtn) {
      delBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        const samples = Store.getSamples();
        const sample = samples.find(function (s) {
          return s.id === delBtn.dataset.id;
        });
        window.app.promptDelete(
          "sample",
          delBtn.dataset.id,
          "样板 " + (sample ? sample.name : ""),
        );
      });
    }
    const printBtn = cardEl.querySelector(".btn-label-print");
    if (printBtn) {
      printBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        self.showSingleLabel(printBtn.dataset.id);
      });
    }
  }

  renderSamples(projectId) {
    const project = Store.getProjects().find((p) => p.id === projectId);
    if (!project) {
      this.renderProjects();
      this.showView("projects");
      return;
    }

    document.getElementById("currentProjectName").textContent = project.name;
    document.getElementById("selectAllBtn").textContent = "全选";
    var allSamples = Store.getSamples().filter(
      (s) => s.projectId === projectId,
    );
    const container = document.getElementById("samplesContainer");
    this.selectedSamples.clear();
    this.updateBatchBtns();

    // 样板模糊匹配（编号/名称/型号/范围）
    var brandSel = document.getElementById("sampleBrandFilter");
    var brandFlt = brandSel ? brandSel.value.trim() : "";
    var samples = brandFlt
      ? allSamples.filter(function (s) {
          var t = brandFlt.toLowerCase();
          return (
            (s.code && s.code.toLowerCase().indexOf(t) !== -1) ||
            (s.name && s.name.toLowerCase().indexOf(t) !== -1) ||
            (s.model && s.model.toLowerCase().indexOf(t) !== -1) ||
            (s.procurementRange &&
              s.procurementRange.toLowerCase().indexOf(t) !== -1)
          );
        })
      : allSamples;

    if (samples.length === 0) {
      container.innerHTML = `
        <div class="sample-card sample-placeholder" id="placeholderSampleCard" style="display:flex;align-items:center;justify-content:center;flex-direction:column;gap:4px;">
          <span style="font-size:2rem;line-height:1;color:var(--primary)">+</span>
          <span style="font-size:0.8rem;color:var(--text-light)">录入样板</span>
        </div>
      `;
      return;
    }

    const self = this;
    container.innerHTML =
      `
        <div class="sample-card sample-placeholder" id="placeholderSampleCard" style="display:flex;align-items:center;justify-content:center;flex-direction:column;gap:4px;">
          <span style="font-size:2rem;line-height:1;color:var(--primary)">+</span>
          <span style="font-size:0.8rem;color:var(--text-light)">录入样板</span>
        </div>
      ` +
      samples
        .map(function (s) {
          return self._renderOneCard(project, s);
        })
        .join("");

    container
      .querySelectorAll(".sample-card[data-id]")
      .forEach(function (card) {
        self._bindOneCard(card);
      });
    this._markLocalOnlySamples(projectId);
  }

  async _markLocalOnlySamples(projectId) {
    if (!supabaseClient || !this.user || this.user.isDemo) return;
    try {
      const { data: dbSamples } = await supabaseClient
        .from("samples")
        .select("id")
        .eq("project_id", projectId);
      if (!dbSamples) return;
      const dbIds = new Set(
        dbSamples.map(function (s) {
          return s.id;
        }),
      );
      var allSamples = Store.getSamples();
      var changed = false;
      var removed = false;
      for (var i = allSamples.length - 1; i >= 0; i--) {
        var s = allSamples[i];
        if (s.projectId !== projectId) continue;
        if (dbIds.has(s.id)) continue;
        // 本地有、DB 无：判断是删除同步还是上传失败
        if (s.imageUrl && s.imageUrl.startsWith("http")) {
          // Supabase URL → 曾被同步到 DB，被其他端删了 → 本地移除
          allSamples.splice(i, 1);
          removed = true;
        } else if (!s._uploadFailed) {
          // data URL 或无图 → 从未上传成功 → 标记失败
          s._uploadFailed = true;
          s._pendingUpload = false;
          changed = true;
        }
      }
      if (changed || removed) {
        Store.saveSamples(allSamples);
        this.renderSamples(projectId);
      }
    } catch (e) {
      // 静默失败
    }
  }

  updateBatchBtns() {
    const count = this.selectedSamples.size;
    const printBtn = document.getElementById("batchPrintBtn");
    const deleteBtn = document.getElementById("batchDeleteBtn");
    if (count > 0) {
      printBtn.textContent = "批量打印 (" + count + ")";
      printBtn.disabled = false;
      if (deleteBtn) {
        deleteBtn.textContent = "批量删除 (" + count + ")";
        deleteBtn.disabled = false;
      }
    } else {
      printBtn.textContent = "批量打印";
      printBtn.disabled = true;
      if (deleteBtn) {
        deleteBtn.textContent = "批量删除";
        deleteBtn.disabled = true;
      }
    }
  }

  selectAllSamples() {
    const samples = Store.getSamples().filter(
      (s) => s.projectId === this.currentProjectId,
    );
    const allSelected = samples.every((s) => this.selectedSamples.has(s.id));
    if (allSelected) {
      samples.forEach((s) => this.selectedSamples.delete(s.id));
    } else {
      samples.forEach((s) => this.selectedSamples.add(s.id));
    }
    const checkboxes = document.querySelectorAll(`.sample-checkbox[data-id]`);
    checkboxes.forEach((cb) => {
      cb.checked = this.selectedSamples.has(cb.dataset.id);
    });
    const btn = document.getElementById("selectAllBtn");
    btn.textContent = allSelected ? "全选" : "取消全选";
    this.updateBatchBtns();
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
      const container = document.getElementById("samplesContainer");
      const placeholder = document.getElementById("placeholderSampleCard");
      if (placeholder) placeholder.remove();
      const project = Store.getProjects().find(function (p) {
        return p.id === this.currentProjectId;
      }, this);
      const cardHtml = this._renderOneCard(project || {}, targetSample);
      container.insertAdjacentHTML("beforeend", cardHtml);
      const newCard = container.querySelector(
        '.sample-card[data-id="' + targetId + '"]',
      );
      if (newCard) this._bindOneCard(newCard);
      this._markLocalOnlySamples(this.currentProjectId);
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
    const sample = Store.getSamples().find((s) => s.id === sampleId);
    if (!sample) return;

    const project = Store.getProjects().find((p) => p.id === sample.projectId);

    const container = document.getElementById("sampleDetailContainer");
    const qrUrl = qrPageUrl(sample.id);

    const procurementLabel = project && project.procurement ? "集采" : "非集采";
    const badgeColor =
      procurementLabel === "集采" ? "var(--success)" : "var(--danger)";
    const procurementBadge = `<span style="display:inline-block;padding:1px 0;border-radius:var(--radius);color:${badgeColor};">${procurementLabel}</span>`;

    const cell = (label, value, span, extraStyle) => {
      const s = span ? ` style="grid-column:span ${span};"` : "";
      const vs = extraStyle ? ` style="${extraStyle}"` : "";
      return `<div class="detail-cell"${s}><span class="cell-label">${label}</span><span class="cell-value"${vs}>${value}</span></div>`;
    };

    const cells = [];

    cells.push(cell("名称", sample.name));
    cells.push(cell("编号", sample.code || "-"));
    cells.push(cell("类别", project ? project.name : "-"));
    cells.push(cell("型号", sample.model || "-"));
    cells.push(cell("品牌", sample.brand || "-"));
    cells.push(cell("规格", sample.specs || "-"));
    cells.push(cell("颜色", sample.color || "-"));
    cells.push(cell("材质", sample.material || "-"));

    if (project && project.procurement) {
      cells.push(cell("是否集采", procurementBadge));
      cells.push(
        cell(
          "集采时间",
          `${formatDate(project.procurementStart)} - ${formatDate(project.procurementEnd)}`,
        ),
      );
      const rangeVal =
        sample.procurementRange || (sample.procurement ? "范围内" : "范围外");
      const rangeColor =
        rangeVal === "范围内" ? "var(--success)" : "var(--warning)";
      cells.push(cell("集采范围", rangeVal, null, `color:${rangeColor};`));
    } else {
      cells.push(cell("是否集采", procurementBadge, 2));
    }
    cells.push(cell("创建", formatDateTime(sample.createdAt)));
    cells.push(cell("更新", formatDateTime(sample.updatedAt)));

    cells.push(cell("描述", sample.description || "-", 2));

    if (sample.imageUrl) {
      cells.push(
        `<div class="detail-cell" style="grid-column:span 2;"><span class="cell-label">图片</span><img class="cell-image" src="${sample.thumbnailUrl || sample.imageUrl}" alt="${sample.name}" data-fullsrc="${sample.imageUrl}"></div>`,
      );
    }

    const qrSpan = sample.imageUrl ? 2 : 4;
    cells.push(
      `<div class="detail-cell" style="grid-column:span ${qrSpan};"><span class="cell-label">二维码</span><div class="cell-qr-wrap"><canvas id="detailQrCode" width="120" height="120"></canvas><span style="font-size:0.7rem;color:var(--text-light);word-break:break-all;line-height:1.4;">${qrUrl}</span></div></div>`,
    );

    container.innerHTML = `
      <div class="detail-body detail-grid" style="padding:10px 12px;border:1px solid var(--border);background:var(--card-bg);">
        ${cells.join("")}
      </div>
    `;

    const qrCanvas = document.getElementById("detailQrCode");
    drawQRCode(qrCanvas, qrUrl);

    container.querySelectorAll(".cell-image").forEach((img) => {
      img.addEventListener("click", (e) => {
        e.stopPropagation();
        const fullSrc = img.dataset.fullsrc || img.src;
        this.showImagePreview(fullSrc, img.alt);
      });
      img.style.cursor = "zoom-in";
    });

    this.showView("sampleDetail");
  }

  showSingleLabel(sampleId) {
    const samples = Store.getSamples();
    const sample = samples.find((s) => s.id === sampleId);
    if (!sample) return;

    const projects = Store.getProjects();
    const project = projects.find((p) => p.id === sample.projectId);
    const qrUrl = qrPageUrl(sample.id);

    const modal = document.getElementById("labelPreviewModal");
    const codeSeq = (sample.code || "").split("-")[0] || "";
    const capsuleText = [codeSeq, sample.brand, sample.name]
      .filter(Boolean)
      .join("-");
    const badgeInfo = getProcurementIndicator(sample, project);
    const dividerColor =
      badgeInfo.cls === "proc-in"
        ? "#2ecc40"
        : badgeInfo.cls === "proc-out"
          ? "#ffdc00"
          : "#ff4136";
    const color = hashToColor(sample.code || "");
    modal.innerHTML = `
      <div class="print-label-wrap">
      <div class="print-label">
        <div class="print-label-category">${project ? project.name : ""}<span class="proc-badge ${badgeInfo.cls}"></span></div>
        <div class="print-label-header">${sample.name}</div>
        <div class="print-label-row">
          <span class="label">型号：</span>
          <span class="value">${sample.model || "-"}</span>
        </div>
        <div class="print-label-row">
          <span class="label">编号：</span>
          <span class="value">${sample.code || "-"}</span>
        </div>
        <div class="print-label-row">
          <span class="label">品牌：</span>
          <span class="value">${sample.brand || "-"}</span>
        </div>
        <div class="print-label-row">
          <span class="label">是否集采：</span>
          <span class="value">${project && project.procurement ? "集采" : "非集采"}</span>
        </div>
        ${
          project && project.procurement
            ? `
        <div class="print-label-row">
          <span class="label">集采时间：</span>
          <span class="value">${formatDate(project.procurementStart)}-${formatDate(project.procurementEnd)}</span>
        </div>
        `
            : ""
        }
        ${
          project
            ? `
        <div class="print-label-row">
          <span class="label">范围内外：</span>
          <span class="value">${project && project.procurement ? sample.procurementRange || (sample.procurement ? "范围内" : "范围外") : "范围外"}</span>
        </div>
        `
            : ""
        }
        <div class="print-label-qrcode">
            <canvas id="modalQrCode" width="80" height="80"></canvas>
          </div>
      </div>
      <div class="print-label-capsule">
        <div class="capsule-circle" style="background:${color}"></div>
        <div class="capsule-code">${capsuleText}</div>
      </div>
      <div class="print-label-extra">
        <div class="extra-qr">
          <canvas id="extraQrCode" width="70" height="70"></canvas>
        </div>
        <div class="extra-divider" style="background:${dividerColor}"></div>
        <div class="extra-info">
          <div class="extra-info-line"><span class="extra-label">品牌：</span>${sample.brand || "-"}</div>
          <div class="extra-info-line"><span class="extra-label">型号：</span>${sample.model || "-"}</div>
          <div class="extra-info-line"><span class="extra-label">编号：</span>${sample.code || "-"}</div>
        </div>
      </div>
      </div>`;

    setTimeout(() => {
      const canvas = document.getElementById("modalQrCode");
      if (canvas) {
        drawQRCode(canvas, qrUrl);
      }
      const extraCanvas = document.getElementById("extraQrCode");
      if (extraCanvas) {
        drawQRCode(extraCanvas, qrUrl);
      }
      const label = modal.querySelector(".print-label-wrap");
      if (label) {
        const setRatio = () => {
          const h = label.offsetHeight;
          label.style.width = Math.round(h / 2) + "px";
        };
        requestAnimationFrame(() => {
          setRatio();
          requestAnimationFrame(setRatio);
        });
      }
    }, 50);

    this.openModal("labelPreviewModal");
  }

  showImagePreview(src, alt) {
    let overlay = document.getElementById("imageViewerModal");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "imageViewerModal";
      overlay.className = "image-viewer-overlay";
      overlay.addEventListener("click", (e) => {
        if (e.target === overlay) overlay.classList.remove("active");
      });
      document.body.appendChild(overlay);
    }
    overlay.innerHTML = `
      <div class="image-viewer-content">
        <img src="${src}" alt="${alt || ""}">
      </div>
    `;
    overlay.classList.add("active");
  }

  renderLabels() {
    const container = document.getElementById("labelsContainer");
    const samples = Store.getSamples();
    const projects = Store.getProjects();

    const labelsToPrint =
      this.selectedSamples.size > 0
        ? samples.filter((s) => this.selectedSamples.has(s.id))
        : samples;

    if (labelsToPrint.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="icon">🏷️</div>
          <p>暂无样板标签可打印，请先在类别中录入样板</p>
        </div>
      `;
      return;
    }

    container.innerHTML = labelsToPrint
      .map((sample) => {
        const project = projects.find((p) => p.id === sample.projectId);
        const canvasId = `qr-${sample.id}`;
        const codeSeq = (sample.code || "").split("-")[0] || "";
        const capsuleText = [codeSeq, sample.brand, sample.name]
          .filter(Boolean)
          .join("-");
        const badgeInfo = getProcurementIndicator(sample, project);
        const color = hashToColor(sample.code || "");
        const dividerColor =
          badgeInfo.cls === "proc-in"
            ? "#2ecc40"
            : badgeInfo.cls === "proc-out"
              ? "#ffdc00"
              : "#ff4136";

        return `
        <div class="print-label-wrap" data-id="${sample.id}">
        ${
          this.selectedLabels.label1
            ? `
        <div class="print-label">
          <div class="print-label-category">${project ? project.name : ""}<span class="proc-badge ${badgeInfo.cls}"></span></div>
          <div class="print-label-header">${sample.name}</div>
          <div class="print-label-row">
            <span class="label">型号：</span>
            <span class="value">${sample.model || "-"}</span>
          </div>
          <div class="print-label-row">
            <span class="label">编号：</span>
            <span class="value">${sample.code || "-"}</span>
          </div>
          <div class="print-label-row">
            <span class="label">品牌：</span>
            <span class="value">${sample.brand || "-"}</span>
          </div>
          <div class="print-label-row">
            <span class="label">是否集采：</span>
            <span class="value">${project && project.procurement ? "集采" : "非集采"}</span>
          </div>
          ${
            project && project.procurement
              ? `
          <div class="print-label-row">
            <span class="label">集采时间：</span>
            <span class="value">${formatDate(project.procurementStart)}-${formatDate(project.procurementEnd)}</span>
          </div>
          `
              : ""
          }
          ${
            project
              ? `
          <div class="print-label-row">
            <span class="label">范围内外：</span>
            <span class="value">${project && project.procurement ? sample.procurementRange || (sample.procurement ? "范围内" : "范围外") : "范围外"}</span>
          </div>
          `
              : ""
          }
          <div class="print-label-qrcode">
            <canvas id="${canvasId}" width="80" height="80"></canvas>
          </div>
        </div>
        `
            : ""
        }
        ${
          this.selectedLabels.label2
            ? `
        <div class="print-label-capsule">
          <div class="capsule-circle" style="background:${color}"></div>
          <div class="capsule-code">${capsuleText}</div>
        </div>
        `
            : ""
        }
        ${
          this.selectedLabels.label3
            ? this.renderLabelExtra(sample, project, dividerColor, badgeInfo)
            : ""
        }
        </div>
      `;
      })
      .join("");

    labelsToPrint.forEach((sample) => {
      const canvas = document.getElementById(`qr-${sample.id}`);
      if (canvas) {
        drawQRCode(canvas, qrPageUrl(sample.id));
      }
      if (this.selectedLabels.label3) {
        const extraCanvas = document.getElementById(`extraQr-${sample.id}`);
        if (extraCanvas) {
          drawQRCode(extraCanvas, qrPageUrl(sample.id));
        }
      }
    });

    if (container._dismissHandler) {
      container.removeEventListener("click", container._dismissHandler);
    }
    const dismissLabels = (e) => {
      if (e.target.closest(".print-label-wrap")) return;
      if (this.currentProjectId) {
        this.renderSamples(this.currentProjectId);
        this.showView("samples");
      } else {
        this.renderProjects();
        this.showView("projects");
      }
    };
    container._dismissHandler = dismissLabels;
    container.addEventListener("click", dismissLabels);
  }

  showLabelTypeModal() {
    document.getElementById("labelType1").checked =
      this.selectedLabels.label1 !== false;
    document.getElementById("labelType2").checked =
      this.selectedLabels.label2 !== false;
    document.getElementById("labelType3").checked =
      this.selectedLabels.label3 !== false;
    this.openModal("labelTypeModal");
  }

  confirmLabelTypePrint() {
    this.selectedLabels = {
      label1: document.getElementById("labelType1").checked,
      label2: document.getElementById("labelType2").checked,
      label3: document.getElementById("labelType3").checked,
    };
    this.closeModal("labelTypeModal");
    this.batchPrint();
  }

  batchPrint() {
    this.renderLabels();
    this.showView("labels");
    setTimeout(() => window.print(), 500);
  }

  renderLabelExtra(sample, project, dividerColor) {
    const extraId = `extraQr-${sample.id}`;
    return `
    <div class="print-label-extra">
      <div class="extra-qr">
        <canvas id="${extraId}" width="70" height="70"></canvas>
      </div>
      <div class="extra-divider" style="background:${dividerColor}"></div>
      <div class="extra-info">
        <div class="extra-info-line"><span class="extra-label">品牌：</span>${sample.brand || "-"}</div>
        <div class="extra-info-line"><span class="extra-label">型号：</span>${sample.model || "-"}</div>
        <div class="extra-info-line"><span class="extra-label">编号：</span>${sample.code || "-"}</div>
      </div>
    </div>`;
  }

  renderInfoView() {
    const container = document.getElementById("infoContainer");
    const code = Store.getDailyCode();
    Store.syncDailyCodeToDB(code);
    const now = new Date();
    const dateStr = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日`;

    const vis = Store.getFieldVisibility();

    const labelFields = [
      { label: "名称", desc: "样板名称" },
      { label: "编号", desc: "样板编号" },
      { label: "类别", desc: "所属项目" },
      { label: "型号", desc: "产品型号" },
      { label: "品牌", desc: "产品品牌" },
      { label: "是否集采", desc: "集采/非集采" },
      { label: "集采时间", desc: "起止月份" },
      { label: "范围内外", desc: "集采范围判定" },
    ];

    const configFields = [
      { key: "specs", label: "规格" },
      { key: "color", label: "颜色" },
      { key: "material", label: "材质" },
      { key: "description", label: "描述" },
      { key: "image", label: "图片" },
    ];

    container.innerHTML = `
      <div class="info-card">
        <div class="info-card-body" style="text-align:center;padding:28px 20px 20px;">
          <div style="display:flex;align-items:center;justify-content:center;gap:10px;margin-bottom:6px;">
            <span style="font-size:0.8rem;color:var(--text-secondary);">${dateStr}</span>
            <span class="card-badge procurement">有效</span>
          </div>
          <div style="font-size:2.8rem;font-weight:700;color:var(--primary);letter-spacing:10px;">${code}</div>
        </div>
      </div>

      <div class="info-card">
        <div class="info-card-body">
          <div style="font-weight:600;font-size:0.85rem;margin-bottom:10px;display:flex;align-items:center;gap:6px;">
            <span>标签内容</span>
            <span style="font-weight:400;font-size:0.72rem;color:var(--text-light);">—— 始终显示</span>
          </div>
          <div class="vis-grid">
            ${labelFields
              .map(
                (f) => `
              <div class="vis-cell">
                <span class="vis-cell-label">${f.label}</span>
                <span class="vis-cell-desc">${f.desc}</span>
              </div>
            `,
              )
              .join("")}
          </div>
        </div>
      </div>

      <div class="info-card">
        <div class="info-card-body">
          <div style="font-weight:600;font-size:0.85rem;margin-bottom:10px;display:flex;align-items:center;gap:6px;">
            <span>扫码可见性</span>
            <span style="font-weight:400;font-size:0.72rem;color:var(--text-light);">—— 点击切换状态</span>
          </div>
          <div class="vis-grid">
            ${configFields
              .map((f) => {
                const state = vis[f.key];
                const states = ["显示", "邀请", "敏感"];
                return `
                <div class="vis-cell">
                  <span class="vis-cell-label">${f.label}</span>
                  <div class="vis-pill" data-key="${f.key}">
                    ${states
                      .map(
                        (s) => `
                      <button class="vis-pill-btn ${s === state ? "active" : ""}" data-key="${f.key}" data-value="${s}">
                        ${s}
                      </button>
                    `,
                      )
                      .join("")}
                  </div>
                </div>
              `;
              })
              .join("")}
          </div>
        </div>
      </div>
    `;

    container.querySelectorAll(".vis-pill-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const key = btn.dataset.key;
        const value = btn.dataset.value;
        vis[key] = value;
        Store.saveFieldVisibility(vis);
        this.renderInfoView();
      });
    });
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

  showOrderEntry() {
    var self = this;
    this._makeEntryModal(
      "orderEntryModal",
      "录入订单",
      [
        { label: "下单人", id: "oeName", key: "name", placeholder: "必填" },
        { label: "电话", id: "oePhone", key: "phone", placeholder: "必填" },
        { label: "公司", id: "oeCompany", key: "company" },
        { label: "项目", id: "oeProject", key: "project" },
        { label: "备注", id: "oeRemark", key: "remark" },
      ],
      function (data, done) {
        if (!data.name || !data.phone) {
          alert("请填写下单人和电话");
          return;
        }
        var orders = Store.getOrders();
        data.id = crypto.randomUUID
          ? crypto.randomUUID()
          : "ord-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8);
        data.orderNo =
          "MANUAL-" +
          Date.now().toString(36).toUpperCase() +
          "-" +
          Math.random().toString(36).slice(2, 6).toUpperCase();
        data.status = "未提交";
        data.createdAt = new Date().toISOString();
        data.updatedAt = data.createdAt;
        data.openid = self.user ? self.user.id || self.user.openid || "" : "";
        orders.unshift(data);
        Store.saveOrders(orders);
        if (supabaseClient && self.user && !self.user.isDemo) {
          supabaseClient
            .from("orders")
            .insert(DbWriter.toSnakeCase(data))
            .then(function (r) {
              if (r.error) console.warn("sync order failed:", r.error);
            });
        }
        self.renderOrders();
        done();
        self.showToast("订单已录入", "success");
      },
    );
  }

  showApplyEntry() {
    var self = this;
    this._makeEntryModal(
      "applyEntryModal",
      "录入申请",
      [
        { label: "申请人", id: "aeName", key: "name", placeholder: "必填" },
        { label: "电话", id: "aePhone", key: "phone", placeholder: "必填" },
        { label: "公司", id: "aeCompany", key: "company" },
        {
          label: "事由类型",
          id: "aeType",
          key: "type",
          type: "select",
          options: ["运输", "参观", "选样", "借还", "其他"],
        },
        {
          label: "来访日期",
          id: "aeVisitDate",
          key: "visitDate",
          type: "date",
        },
        { label: "备注", id: "aeRemark", key: "remark" },
      ],
      function (data, done) {
        if (!data.name || !data.phone) {
          alert("请填写申请人和电话");
          return;
        }
        var list = Store.getApplyRecords();
        data.id = crypto.randomUUID
          ? crypto.randomUUID()
          : "app-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8);
        data.status = "待审核";
        data.createdAt = new Date().toISOString();
        data.updatedAt = data.createdAt;
        data.openid = self.user ? self.user.id || self.user.openid || "" : "";
        list.unshift(data);
        Store.saveApplyRecords(list);
        if (supabaseClient && self.user && !self.user.isDemo) {
          supabaseClient
            .from("apply_records")
            .insert(DbWriter.toSnakeCase(data))
            .then(function (r) {
              if (r.error) console.warn("sync apply failed:", r.error);
            });
        }
        self.renderApply();
        done();
        self.showToast("申请已录入", "success");
      },
    );
  }

  showClockEntry() {
    var self = this;
    this._makeEntryModal(
      "clockEntryModal",
      "录入打卡",
      [
        { label: "姓名", id: "ceName", key: "name", placeholder: "必填" },
        { label: "电话", id: "cePhone", key: "phone", placeholder: "必填" },
        { label: "公司", id: "ceCompany", key: "company" },
        {
          label: "公司类型",
          id: "ceCompanyType",
          key: "companyType",
          type: "select",
          options: ["业主方", "运营方", "品牌方", "其他"],
        },
        { label: "打卡位置", id: "ceLocation", key: "clockLocationName" },
        { label: "打卡事由", id: "ceReason", key: "reason" },
      ],
      function (data, done) {
        if (!data.name || !data.phone) {
          alert("请填写姓名和电话");
          return;
        }
        var list = Store.getClockRecords();
        data.id = crypto.randomUUID
          ? crypto.randomUUID()
          : "clk-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8);
        data.clockTime = new Date().toISOString();
        data.verifyResult = true;
        data.createdAt = new Date().toISOString();
        data.updatedAt = data.createdAt;
        data.openid = self.user ? self.user.id || self.user.openid || "" : "";
        list.unshift(data);
        Store.saveClockRecords(list);
        if (supabaseClient && self.user && !self.user.isDemo) {
          supabaseClient
            .from("clock_records")
            .insert(DbWriter.toSnakeCase(data))
            .then(function (r) {
              if (r.error) console.warn("sync clock failed:", r.error);
            });
        }
        self.renderClock();
        done();
        self.showToast("打卡已录入", "success");
      },
    );
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

  // ============ 订单管理 ============
  renderOrders() {
    const orders = Store.getOrders();
    const container = document.getElementById("ordersContainer");
    const searchVal = document
      .getElementById("orderSearchInput")
      .value.trim()
      .toLowerCase();
    const statusVal = document.getElementById("orderStatusFilter").value;
    const dateStart = document.getElementById("orderDateStart").value;
    const dateEnd = document.getElementById("orderDateEnd").value;

    let filtered = orders;
    if (searchVal)
      filtered = filtered.filter((o) =>
        o.orderNo.toLowerCase().includes(searchVal),
      );
    if (statusVal) filtered = filtered.filter((o) => o.status === statusVal);
    if (dateStart) filtered = filtered.filter((o) => o.createdAt >= dateStart);
    if (dateEnd)
      filtered = filtered.filter((o) => o.createdAt <= dateEnd + "T23:59:59");

    if (filtered.length === 0) {
      container.innerHTML = '<div class="empty-table">暂无订单数据</div>';
      return;
    }

    container.innerHTML = `
      <table class="data-table">
        <thead>
          <tr>
            <th style="width:36px"><input type="checkbox" id="orderHeaderCheckbox" /></th>
            <th>订单号</th>
            <th>下单人</th>
            <th>电话</th>
            <th>公司</th>
            <th>项目</th>
            <th>状态</th>
            <th>时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          ${filtered
            .map(
              (o) => `
            <tr>
              <td><input type="checkbox" class="order-checkbox" value="${o.id}" /></td>
              <td style="font-family:monospace;font-size:0.78rem;">${esc(o.orderNo)}</td>
              <td>${esc(o.name)}</td>
              <td>${esc(o.phone)}</td>
              <td>${esc(o.company)}</td>
              <td>${esc(o.project)}</td>
              <td><span class="status-badge ${o.status === "已收录" ? "done" : "pending"}">${esc(o.status)}</span></td>
              <td style="font-size:0.75rem;white-space:nowrap;">${formatDateTime(o.createdAt)}</td>
              <td>
                <div class="cell-actions">
                  <button onclick="window.app.showOrderDetail('${o.id}')">详情</button>
                  <button class="btn-success" onclick="window.app.toggleOrderStatus('${o.id}')">${o.status === "已收录" ? "↩" : "✓"}</button>
                  <button class="btn-danger" onclick="window.app.promptDelete('order','${o.id}','订单 ${esc(o.orderNo)}')">删除</button>
                </div>
              </td>
            </tr>
          `,
            )
            .join("")}
        </tbody>
      </table>
    `;

    // 表头全选 ↔ 全选按钮联动
    var headerCb = document.getElementById("orderHeaderCheckbox");
    var selectAllBtn = document.getElementById("selectAllOrders");
    if (headerCb && selectAllBtn) {
      headerCb.addEventListener("change", function () {
        var checked = headerCb.checked;
        document.querySelectorAll(".order-checkbox").forEach(function (cb) {
          cb.checked = checked;
        });
        selectAllBtn.textContent = checked ? "取消全选" : "全选";
      });
    }
  }

  async showOrderDetail(id) {
    const orders = Store.getOrders();
    const order = orders.find((o) => o.id === id);
    if (!order) return;

    // Fetch order items
    let items = [];
    if (supabaseClient) {
      const { data } = await supabaseClient
        .from("order_items")
        .select("*")
        .eq("order_no", order.orderNo);
      if (data) items = data.map(DbWriter.fromSnakeCase);
    }

    document.getElementById("detailModalTitle").textContent = "订单详情";

    let html = `
      <div class="detail-grid">
        <div class="detail-row"><span class="detail-label">订单号</span><span class="detail-value" style="font-family:monospace">${esc(order.orderNo)}</span></div>
        <div class="detail-row"><span class="detail-label">下单人</span><span class="detail-value">${esc(order.name)}</span></div>
        <div class="detail-row"><span class="detail-label">电话</span><span class="detail-value">${esc(order.phone)}</span></div>
        <div class="detail-row"><span class="detail-label">公司</span><span class="detail-value">${esc(order.company)}</span></div>
        <div class="detail-row"><span class="detail-label">项目</span><span class="detail-value">${esc(order.project)}</span></div>
        <div class="detail-row"><span class="detail-label">状态</span><span class="detail-value"><span class="status-badge ${order.status === "已收录" ? "done" : "pending"}">${esc(order.status)}</span></span></div>
        <div class="detail-row"><span class="detail-label">备注</span><span class="detail-value">${esc(order.remark) || "-"}</span></div>
        <div class="detail-row"><span class="detail-label">创建时间</span><span class="detail-value">${formatDateTime(order.createdAt)}</span></div>
        <div class="detail-row"><span class="detail-label">更新时间</span><span class="detail-value">${formatDateTime(order.updatedAt)}</span></div>
      </div>
    `;

    if (items.length > 0) {
      html += `<div class="detail-section-title">产品明细（${items.length} 项）</div>`;
      html += `
        <table class="detail-items-table">
          <thead>
            <tr>
              <th>品名</th>
              <th>型号</th>
              <th>品牌</th>
              <th>品类</th>
              <th>规格</th>
              <th>集采</th>
            </tr>
          </thead>
          <tbody>
            ${items
              .map(
                (item) => `
              <tr>
                <td>${esc(item.productName)}</td>
                <td>${esc(item.model)}</td>
                <td>${esc(item.brand)}</td>
                <td>${esc(item.category)}</td>
                <td>${esc(item.specs)}</td>
                <td>${item.procurement ? esc(item.procurementRange) || "范围内" : "非集采"}</td>
              </tr>
            `,
              )
              .join("")}
          </tbody>
        </table>
      `;
    }

    document.getElementById("detailModalBody").innerHTML = html;
    this.openModal("detailModal");
  }

  async toggleOrderStatus(id) {
    const orders = Store.getOrders();
    const order = orders.find((o) => o.id === id);
    if (!order) return;
    const newStatus = order.status === "已收录" ? "未提交" : "已收录";
    if (supabaseClient) {
      const { error } = await supabaseClient
        .from("orders")
        .update({ status: newStatus })
        .eq("id", id);
      if (error) {
        this.showToast("状态更新失败", "error");
        return;
      }
    }
    order.status = newStatus;
    Store.saveOrders(orders);
    this.renderOrders();
    this.showToast("状态已更新", "success");
  }

  // ============ 申请管理 ============
  renderApply() {
    const records = Store.getApplyRecords();
    const container = document.getElementById("applyContainer");
    const searchVal = document
      .getElementById("applySearchInput")
      .value.trim()
      .toLowerCase();
    const typeVal = document.getElementById("applyTypeFilter").value;
    const statusVal = document.getElementById("applyStatusFilter").value;
    const dateStart = document.getElementById("applyDateStart").value;
    const dateEnd = document.getElementById("applyDateEnd").value;

    let filtered = records;
    if (searchVal)
      filtered = filtered.filter((r) =>
        r.name.toLowerCase().includes(searchVal),
      );
    if (typeVal) filtered = filtered.filter((r) => r.type === typeVal);
    if (statusVal) filtered = filtered.filter((r) => r.status === statusVal);
    if (dateStart) filtered = filtered.filter((r) => r.createdAt >= dateStart);
    if (dateEnd)
      filtered = filtered.filter((r) => r.createdAt <= dateEnd + "T23:59:59");

    if (filtered.length === 0) {
      container.innerHTML = '<div class="empty-table">暂无申请记录</div>';
      return;
    }

    container.innerHTML = `
      <table class="data-table">
        <thead>
          <tr>
            <th style="width:36px"><input type="checkbox" id="applyHeaderCheckbox" /></th>
            <th>申请人</th>
            <th>电话</th>
            <th>公司</th>
            <th>事由类型</th>
            <th>来访日期</th>
            <th>状态</th>
            <th>提交时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          ${filtered
            .map(
              (r) => `
            <tr>
              <td><input type="checkbox" class="apply-checkbox" value="${r.id}" /></td>
              <td>${esc(r.name)}</td>
              <td>${esc(r.phone)}</td>
              <td>${esc(r.company)}</td>
              <td>${esc(r.type)}${r.type === "运输" && r.licensePlate ? " · " + esc(r.licensePlate) : ""}</td>
              <td style="font-size:0.75rem;">${esc(r.visitDate) || "-"}</td>
              <td><span class="status-badge ${r.status === "已收录" ? "done" : "pending"}">${esc(r.status)}</span></td>
              <td style="font-size:0.75rem;white-space:nowrap;">${formatDateTime(r.createdAt)}</td>
              <td>
                <div class="cell-actions">
                  <button onclick="window.app.showApplyDetail('${r.id}')">详情</button>
                  ${r.status === "待审核" ? `<button class="btn-success" onclick="window.app.approveApply('${r.id}')">审核</button>` : ""}
                  <button class="btn-danger" onclick="window.app.promptDelete('apply','${r.id}','申请 ${esc(r.name)} ${esc(r.type)}')">删除</button>
                </div>
              </td>
            </tr>
          `,
            )
            .join("")}
        </tbody>
      </table>
    `;
  }

  showApplyDetail(id) {
    const records = Store.getApplyRecords();
    const r = records.find((a) => a.id === id);
    if (!r) return;
    document.getElementById("detailModalTitle").textContent = "申请详情";

    let extraRows = "";
    if (r.type === "运输" && r.licensePlate) {
      extraRows += `<div class="detail-row"><span class="detail-label">车牌号</span><span class="detail-value">${esc(r.licensePlate)}</span></div>`;
    }
    if (r.type === "借还" && r.borrowReturnType) {
      extraRows += `<div class="detail-row"><span class="detail-label">借还类型</span><span class="detail-value">${esc(r.borrowReturnType)}</span></div>`;
    }
    if (r.type === "其他" && r.customReason) {
      extraRows += `<div class="detail-row"><span class="detail-label">具体事由</span><span class="detail-value">${esc(r.customReason)}</span></div>`;
    }

    document.getElementById("detailModalBody").innerHTML = `
      <div class="detail-grid">
        <div class="detail-row"><span class="detail-label">申请人</span><span class="detail-value">${esc(r.name)}</span></div>
        <div class="detail-row"><span class="detail-label">电话</span><span class="detail-value">${esc(r.phone)}</span></div>
        <div class="detail-row"><span class="detail-label">公司</span><span class="detail-value">${esc(r.company)}</span></div>
        <div class="detail-row"><span class="detail-label">事由类型</span><span class="detail-value">${esc(r.type)}</span></div>
        ${extraRows}
        <div class="detail-row"><span class="detail-label">来访日期</span><span class="detail-value">${esc(r.visitDate) || "-"}</span></div>
        <div class="detail-row"><span class="detail-label">状态</span><span class="detail-value"><span class="status-badge ${r.status === "已收录" ? "done" : "pending"}">${esc(r.status)}</span></span></div>
        <div class="detail-row"><span class="detail-label">审核时间</span><span class="detail-value">${r.approveTime ? formatDateTime(r.approveTime) : "-"}</span></div>
        <div class="detail-row"><span class="detail-label">备注</span><span class="detail-value">${esc(r.remark) || "-"}</span></div>
        <div class="detail-row"><span class="detail-label">提交时间</span><span class="detail-value">${formatDateTime(r.createdAt)}</span></div>
      </div>
    `;
    this.openModal("detailModal");
  }

  async approveApply(id) {
    const records = Store.getApplyRecords();
    const r = records.find((a) => a.id === id);
    if (!r) return;
    const now = new Date().toISOString();
    if (supabaseClient) {
      const { error } = await supabaseClient
        .from("apply_records")
        .update({ status: "已收录", approve_time: now })
        .eq("id", id);
      if (error) {
        this.showToast("审核失败", "error");
        return;
      }
    }
    r.status = "已收录";
    r.approveTime = now;
    Store.saveApplyRecords(records);
    this.renderApply();
    this.showToast("已收录", "success");
  }

  // ============ 打卡管理 ============
  renderClock() {
    const records = Store.getClockRecords();
    const container = document.getElementById("clockContainer");
    const searchVal = document
      .getElementById("clockSearchInput")
      .value.trim()
      .toLowerCase();
    const typeVal = document.getElementById("clockCompanyTypeFilter").value;
    const dateStart = document.getElementById("clockDateStart").value;
    const dateEnd = document.getElementById("clockDateEnd").value;

    let filtered = records;
    if (searchVal)
      filtered = filtered.filter((r) =>
        r.name.toLowerCase().includes(searchVal),
      );
    if (typeVal) filtered = filtered.filter((r) => r.companyType === typeVal);
    if (dateStart) filtered = filtered.filter((r) => r.clockTime >= dateStart);
    if (dateEnd)
      filtered = filtered.filter((r) => r.clockTime <= dateEnd + "T23:59:59");

    if (filtered.length === 0) {
      container.innerHTML = '<div class="empty-table">暂无打卡记录</div>';
      return;
    }

    container.innerHTML = `
      <table class="data-table">
        <thead>
          <tr>
            <th style="width:36px"><input type="checkbox" id="clockHeaderCheckbox" /></th>
            <th>姓名</th>
            <th>电话</th>
            <th>公司</th>
            <th>公司类型</th>
            <th>打卡位置</th>
            <th>核验</th>
            <th>打卡时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          ${filtered
            .map(
              (r) => `
            <tr>
              <td><input type="checkbox" class="clock-checkbox" value="${r.id}" /></td>
              <td>${esc(r.name)}</td>
              <td>${esc(r.phone)}</td>
              <td>${esc(r.company)}</td>
              <td>${esc(r.companyType) || "-"}</td>
              <td>${esc(r.clockLocationName) || "-"}</td>
              <td><span class="${r.verifyResult ? "verify-ok" : "verify-fail"}">${r.verifyResult ? "✅ 通过" : "❌ 未通过"}</span></td>
              <td style="font-size:0.75rem;white-space:nowrap;">${formatDateTime(r.clockTime)}</td>
              <td>
                <div class="cell-actions">
                  <button onclick="window.app.showClockDetail('${r.id}')">详情</button>
                  <button class="btn-danger" onclick="window.app.promptDelete('clock','${r.id}','打卡 ${esc(r.name)} ${esc(r.clockTime)}')">删除</button>
                </div>
              </td>
            </tr>
          `,
            )
            .join("")}
        </tbody>
      </table>
    `;
  }

  showClockDetail(id) {
    const records = Store.getClockRecords();
    const r = records.find((c) => c.id === id);
    if (!r) return;
    document.getElementById("detailModalTitle").textContent = "打卡详情";
    document.getElementById("detailModalBody").innerHTML = `
      <div class="detail-grid">
        <div class="detail-row"><span class="detail-label">姓名</span><span class="detail-value">${esc(r.name)}</span></div>
        <div class="detail-row"><span class="detail-label">电话</span><span class="detail-value">${esc(r.phone)}</span></div>
        <div class="detail-row"><span class="detail-label">公司</span><span class="detail-value">${esc(r.company)}</span></div>
        <div class="detail-row"><span class="detail-label">公司类型</span><span class="detail-value">${esc(r.companyType) || "-"}</span></div>
        <div class="detail-row"><span class="detail-label">打卡时间</span><span class="detail-value">${formatDateTime(r.clockTime)}</span></div>
        <div class="detail-row"><span class="detail-label">打卡位置</span><span class="detail-value">${esc(r.clockLocationName) || "-"}</span></div>
        <div class="detail-row"><span class="detail-label">位置核验</span><span class="detail-value"><span class="${r.verifyResult ? "verify-ok" : "verify-fail"}">${r.verifyResult ? "✅ 通过" : "❌ 未通过"}</span></span></div>
        <div class="detail-row"><span class="detail-label">经纬度</span><span class="detail-value">${r.latitude ? r.latitude + ", " + r.longitude : "-"}</span></div>
        <div class="detail-row"><span class="detail-label">打卡事由</span><span class="detail-value">${esc(r.reason) || "-"}</span></div>
        <div class="detail-row"><span class="detail-label">备注</span><span class="detail-value">${esc(r.remark) || "-"}</span></div>
      </div>
    `;
    this.openModal("detailModal");
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
        this.renderOrders();
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
        this.renderApply();
        Store.loadApprovalRecordsFromDB();
      } else if (target.type === "clock") {
        await this._execDelete("clock_records", target.id);
        let records = Store.getClockRecords();
        records = records.filter((r) => r.id !== target.id);
        Store.saveClockRecords(records);
        this.renderClock();
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
        this.renderOrders();
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
        this.renderApply();
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
        this.renderClock();
      } else if (target.type === "vaChatLog") {
        await this._execDelete("ev_chat_logs", target.id);
        this.renderVALogs();
      } else if (target.type === "batchVaChatLog") {
        var ids = target.id;
        await supabaseClient.from("ev_chat_logs").delete().in("id", ids);
        this.renderVALogs();
      } else if (target.type === "vaPersonality") {
        await this._execDelete("ev_personality", target.id);
        this.renderVAPersonality();
      } else if (target.type === "vaBehavior") {
        await this._execDelete("ev_behavior", target.id);
        this.renderVABehavior();
      } else if (target.type === "vaVerification") {
        await this._execDelete("ev_verification", target.id);
        this.renderVAVerification();
      } else if (target.type === "vaPrecipRules") {
        await this._execDelete("ev_precipitation_rules", target.id);
        this.renderVAPrecipRules();
      } else if (target.type === "vaFunction") {
        await this._execDelete("ev_functions", target.id);
        this.renderVAFunctions();
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

  async renderApprovalUsers() {
    const container = document.getElementById("approvalUsersContainer");
    if (!supabaseClient) {
      container.innerHTML =
        '<div class="empty-state"><p>数据库未连接</p></div>';
      return;
    }
    try {
      var users = Store.getApprovalUsers();
      if (users.length === 0) {
        await Store.loadApprovalUsersFromDB();
        users = Store.getApprovalUsers();
      }
      if (users.length === 0) {
        container.innerHTML =
          '<div class="empty-state"><div class="icon"><img src="src/icon/box.svg" alt="empty" class="empty-icon"></div><p>暂无审批人，点击"添加审批人"开始配置</p></div>';
        return;
      }
      container.innerHTML = `<table class="data-table" style="width:100%"><thead><tr>
        <th>邮箱</th><th>显示名称</th><th>电话</th><th>角色</th><th>EasyCod</th><th>EasyOrder</th><th>EasyProc</th><th>EasyVoice</th><th>状态</th><th>操作</th>
      </tr></thead><tbody>${users
        .map(
          (u) => `<tr>
        <td style="font-size:0.85rem">${this._esc(u.email || "")}</td>
        <td>${this._esc(u.display_name || "")}</td>
        <td style="font-size:0.85rem">${this._esc(u.phone || "-")}</td>
        <td><span class="status-badge ${u.role === "admin" ? "status-success" : "status-info"}">${this._esc(u.role || "审批人")}</span></td>
        <td>${this._toggleBadge(u.easycod, "ec", u.id)}</td>
        <td>${this._toggleBadge(u.easyorder, "eo", u.id)}</td>
        <td>${this._toggleBadge(u.easyproc, "ep", u.id)}</td>
        <td>${this._toggleBadge(u.easyvoice, "ev", u.id)}</td>
        <td><span class="status-badge ${u.is_active ? "status-success" : "status-error"}" style="cursor:pointer" data-id="${u.id}" data-active="${u.is_active ? "1" : "0"}">${u.is_active ? "启用" : "停用"}</span></td>
        <td><button class="btn btn-sm btn-ghost edit-ep-user" data-id="${u.id}" style="margin-right:4px">编辑</button><button class="btn btn-sm btn-ghost delete-ep-user" data-id="${u.id}" style="color:var(--danger)">删除</button></td>
      </tr>`,
        )
        .join("")}</tbody></table>`;

      container.querySelectorAll(".edit-ep-user").forEach((btn) => {
        btn.addEventListener("click", () => {
          const u = users.find((x) => x.id === btn.dataset.id);
          if (u) this.showApprovalUserModal(u);
        });
      });
      container.querySelectorAll(".delete-ep-user").forEach((btn) => {
        btn.addEventListener("click", async () => {
          if (!confirm("确定删除该审批人？")) return;
          const { error: e } = await supabaseClient
            .from("ep_users")
            .delete()
            .eq("id", btn.dataset.id);
          if (e) {
            this.showToast("删除失败: " + e.message, "error");
            return;
          }
          this.showToast("已删除", "success");
          // 更新缓存
          await Store.loadApprovalUsersFromDB();
          this.renderApprovalUsers();
        });
      });
      // 项目开关点击
      container.querySelectorAll(".toggle-badge").forEach((el) => {
        el.addEventListener("click", async () => {
          const id = el.dataset.id;
          const field = el.dataset.field;
          const current = el.dataset.value === "true";
          const update = {};
          update[field] = !current;
          const { error: e } = await supabaseClient
            .from("ep_users")
            .update(update)
            .eq("id", id);
          if (e) {
            this.showToast("更新失败: " + e.message, "error");
            return;
          }
          await Store.loadApprovalUsersFromDB();
          this.renderApprovalUsers();
        });
      });
      container.querySelectorAll("[data-active]").forEach((el) => {
        el.addEventListener("click", async () => {
          const id = el.dataset.id;
          const nowActive = el.dataset.active === "1" ? false : true;
          const { error: e } = await supabaseClient
            .from("ep_users")
            .update({ is_active: nowActive })
            .eq("id", id);
          if (e) {
            this.showToast("更新失败", "error");
            return;
          }
          await Store.loadApprovalUsersFromDB();
          this.renderApprovalUsers();
        });
      });
    } catch (e) {
      container.innerHTML =
        '<div class="empty-state"><p>加载失败: ' + e.message + "</p></div>";
    }
  }

  _toggleBadge(active, field, id) {
    return `<span class="status-badge toggle-badge ${active ? "status-success" : "status-error"}" style="cursor:pointer" data-id="${id}" data-field="${field}" data-value="${active}">${active ? "开启" : "关闭"}</span>`;
  }

  showApprovalUserModal(data) {
    const isEdit = !!data;
    const overlay = document.createElement("div");
    overlay.className = "modal-overlay active";
    const menuPerms = data?.menu_permissions || {};
    overlay.innerHTML = `<div class="modal" style="max-width:500px"><div class="modal-header"><h3>${isEdit ? "编辑权限" : "添加用户权限"}</h3><button class="modal-close">&times;</button></div>
      <form id="epUserForm"><div class="modal-body" style="display:flex;flex-direction:column;gap:12px;">
        ${!isEdit ? '<label style="font-size:0.82rem;color:var(--text-light)">请先在 Supabase Dashboard → Authentication 创建用户，然后在此填入 Auth User ID（UUID）</label><input type="text" id="epUserAuthId" class="toolbar-input" placeholder="Auth User ID *" required style="width:100%">' : ""}
        <input type="email" id="epUserEmail" class="toolbar-input" placeholder="邮箱" value="${isEdit ? this._esc(data.email || "") : ""}" style="width:100%">
        <input type="text" id="epUserDisplayName" class="toolbar-input" placeholder="显示名称 *" value="${isEdit ? this._esc(data.display_name || "") : ""}" required style="width:100%">
        <input type="text" id="epUserPhone" class="toolbar-input" placeholder="电话" value="${isEdit ? this._esc(data.phone || "") : ""}" style="width:100%">
        <select id="epUserRole" class="toolbar-select" style="width:100%"><option value="审批人" ${isEdit && data.role === "审批人" ? "selected" : ""}>审批人</option><option value="admin" ${isEdit && data.role === "admin" ? "selected" : ""}>管理员</option></select>
        <label style="font-size:0.85rem;font-weight:600;margin-top:4px">项目权限</label>
        <div style="display:flex;flex-wrap:wrap;gap:8px">
          <label class="switch-label"><input type="checkbox" id="epEasycod" ${isEdit && data.easycod ? "checked" : ""}><span class="switch-track"></span> EasyCod</label>
          <label class="switch-label"><input type="checkbox" id="epEasyorder" ${isEdit && data.easyorder ? "checked" : ""}><span class="switch-track"></span> EasyOrder</label>
          <label class="switch-label"><input type="checkbox" id="epEasyproc" ${isEdit && data.easyproc ? "checked" : ""}><span class="switch-track"></span> EasyProc</label>
          <label class="switch-label"><input type="checkbox" id="epEasyvoice" ${isEdit && data.easyvoice ? "checked" : ""}><span class="switch-track"></span> EasyVoice</label>
        </div>
        <label style="font-size:0.85rem;font-weight:600;margin-top:4px">侧边栏可见性 <span style="font-weight:400;color:var(--text-light);font-size:0.75rem">（管理员不受限制）</span></label>
        <div style="display:flex;flex-wrap:wrap;gap:8px">
          <label class="switch-label"><input type="checkbox" id="epMenuProjects" ${menuPerms.projects ? "checked" : ""}><span class="switch-track"></span> 类别</label>
          <label class="switch-label"><input type="checkbox" id="epMenuInfo" ${menuPerms.info ? "checked" : ""}><span class="switch-track"></span> 信息</label>
          <label class="switch-label"><input type="checkbox" id="epMenuOrders" ${menuPerms.orders ? "checked" : ""}><span class="switch-track"></span> 订单管理</label>
          <label class="switch-label"><input type="checkbox" id="epMenuApply" ${menuPerms.apply ? "checked" : ""}><span class="switch-track"></span> 申请管理</label>
          <label class="switch-label"><input type="checkbox" id="epMenuClock" ${menuPerms.clock ? "checked" : ""}><span class="switch-track"></span> 打卡管理</label>
          <label class="switch-label"><input type="checkbox" id="epMenuWorkflows" ${menuPerms.workflows ? "checked" : ""}><span class="switch-track"></span> 流程编辑</label>
          <label class="switch-label"><input type="checkbox" id="epMenuRecords" ${menuPerms.records ? "checked" : ""}><span class="switch-track"></span> 审批记录</label>
          <label class="switch-label"><input type="checkbox" id="epMenuVoice" ${menuPerms.voice ? "checked" : ""}><span class="switch-track"></span> 语音助手</label>
        </div>
      </div><div class="modal-footer" style="display:flex;gap:8px;justify-content:flex-end;padding:12px 20px;border-top:1px solid var(--border)"><button type="button" class="btn btn-secondary modal-close-btn">取消</button><button type="submit" class="btn btn-primary">${isEdit ? "保存" : "添加权限"}</button></div></form></div>`;
    document.body.appendChild(overlay);
    overlay
      .querySelector(".modal-close")
      .addEventListener("click", () => overlay.remove());
    overlay
      .querySelector(".modal-close-btn")
      .addEventListener("click", () => overlay.remove());
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) overlay.remove();
    });
    overlay.querySelector("form").addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = document.getElementById("epUserEmail").value.trim();
      const displayName = document
        .getElementById("epUserDisplayName")
        .value.trim();
      const phone = document.getElementById("epUserPhone").value.trim();
      const role = document.getElementById("epUserRole").value;
      const easycod = document.getElementById("epEasycod")?.checked || false;
      const easyorder =
        document.getElementById("epEasyorder")?.checked || false;
      const easyproc = document.getElementById("epEasyproc")?.checked || false;
      const easyvoice =
        document.getElementById("epEasyvoice")?.checked || false;
      // 侧边栏权限：admin 为 null
      const menuPermissions =
        role === "admin"
          ? null
          : {
              projects:
                document.getElementById("epMenuProjects")?.checked || false,
              info: document.getElementById("epMenuInfo")?.checked || false,
              orders: document.getElementById("epMenuOrders")?.checked || false,
              apply: document.getElementById("epMenuApply")?.checked || false,
              clock: document.getElementById("epMenuClock")?.checked || false,
              workflows:
                document.getElementById("epMenuWorkflows")?.checked || false,
              records:
                document.getElementById("epMenuRecords")?.checked || false,
              voice: document.getElementById("epMenuVoice")?.checked || false,
            };
      if (!displayName) {
        this.showToast("请填写显示名称", "error");
        return;
      }
      try {
        if (isEdit) {
          const { error: e } = await supabaseClient
            .from("ep_users")
            .update({
              email,
              display_name: displayName,
              phone,
              role,
              easycod,
              easyorder,
              easyproc,
              easyvoice,
              menu_permissions: menuPermissions,
            })
            .eq("id", data.id);
          if (e) throw e;
        } else {
          const authUserId = document
            .getElementById("epUserAuthId")
            .value.trim();
          if (!authUserId) {
            this.showToast("请填入 Auth User ID", "error");
            return;
          }
          const { error: e } = await supabaseClient.from("ep_users").insert({
            auth_user_id: authUserId,
            email,
            display_name: displayName,
            phone,
            role,
            easycod,
            easyorder,
            easyproc,
            easyvoice,
            is_active: true,
            menu_permissions: menuPermissions,
          });
          if (e) throw e;
        }
        overlay.remove();
        this.showToast(isEdit ? "已更新" : "已添加", "success");
        await Store.loadApprovalUsersFromDB();
        this.renderApprovalUsers();
      } catch (err) {
        this.showToast("操作失败: " + err.message, "error");
      }
    });
  }

  // ============ 流程编辑 ============

  async renderWorkflows() {
    const container = document.getElementById("workflowContainer");
    if (!supabaseClient) {
      container.innerHTML =
        '<div class="empty-state"><p>数据库未连接</p></div>';
      return;
    }
    try {
      // 从缓存读取
      let tpls = Store.getWfTemplates();
      let users = Store.getApprovalUsers().filter((u) => u.is_active);
      let allNodes = Store.getWfNodes();
      let allAssignees = Store.getWfAssignees();
      if (tpls.length === 0 || allNodes.length === 0) {
        await Store.loadAllWorkflowData();
        await Store.loadApprovalUsersFromDB();
        tpls = Store.getWfTemplates();
        users = Store.getApprovalUsers().filter((u) => u.is_active);
        allNodes = Store.getWfNodes();
        allAssignees = Store.getWfAssignees();
      }
      this._wfTemplates = tpls;
      this._wfUsers = users;

      // 按 template 分组 nodes
      const nodesByTpl = {};
      allNodes.forEach((n) => {
        if (!nodesByTpl[n.template_id]) nodesByTpl[n.template_id] = [];
        nodesByTpl[n.template_id].push(n);
      });

      // Build node→assignee mapping
      const nodeAssignees = {};
      allAssignees.forEach((a) => {
        if (!nodeAssignees[a.node_id]) nodeAssignees[a.node_id] = [];
        nodeAssignees[a.node_id].push(a.user_id);
      });

      const typeMap = { 运输: 1, 参观: 1, 选样: 1, 借还: 3, 其他: 1, 订单: 2 };
      const types = ["运输", "参观", "选样", "借还", "其他", "订单"];

      // 一次性渲染所有编辑器
      let html = "";
      const tplMap = {};
      tpls.forEach((t) => (tplMap[t.apply_type] = t));

      types.forEach((type) => {
        const tpl = tplMap[type];
        if (!tpl) return;
        const nodes = nodesByTpl[tpl.id] || [];
        const min = typeMap[type] || 2;
        html += this._renderOneWorkflowEditor(tpl, nodes, nodeAssignees, min);
      });

      container.innerHTML = html;

      // === 事件绑定（委托到 container） ===
      container.addEventListener("click", (e) => {
        // + 按钮
        const plusBtn = e.target.closest(".wf-plus-btn");
        if (plusBtn) {
          this._showWFAddNode(
            plusBtn.dataset.tpl,
            parseInt(plusBtn.dataset.pos),
          );
          return;
        }
        // 删除节点（必须放在 .wf-node 之前处理）
        const delBtn = e.target.closest(".wf-del-node-btn");
        if (delBtn) {
          e.stopPropagation();
          const nodeId = delBtn.dataset.nodeId;
          const node = allNodes.find((n) => n.id === nodeId);
          if (!node) return;
          if (node.is_preset) {
            this.showToast("预设节点不可删除", "error");
            return;
          }
          const tpl = this._wfTemplates.find((t) => t.id === node.template_id);
          if (!tpl) return;
          const min = typeMap[tpl.apply_type] || 2;
          const tplNodes = allNodes.filter(
            (n) => n.template_id === node.template_id,
          );
          if (tplNodes.length <= min) {
            this.showToast("该类型至少需要 " + min + " 个节点", "error");
            return;
          }
          if (!confirm("确定删除该节点？")) return;
          supabaseClient
            .from("ep_workflow_nodes")
            .delete()
            .eq("id", nodeId)
            .then(async ({ error }) => {
              if (error) {
                this.showToast("删除失败", "error");
                return;
              }
              await Store.loadAllWorkflowData();
              this.renderWorkflows();
            });
          return;
        }
        // 编辑节点
        const editBtn = e.target.closest(".wf-edit-node-btn");
        if (editBtn) {
          this._showWFEditNode(editBtn.dataset.nodeId);
          return;
        }
        // 节点卡片
        const nodeEl = e.target.closest(".wf-node");
        if (nodeEl) {
          this._showWFAssignModal(nodeEl.dataset.nodeId);
          return;
        }
      });
    } catch (e) {
      container.innerHTML =
        '<div class="empty-state"><p>加载失败: ' + e.message + "</p></div>";
    }
  }

  _renderOneWorkflowEditor(tpl, nodes, nodeAssignees, min) {
    let flowHtml =
      '<div class="workflow-flow-chain" style="display:flex;align-items:center;flex-wrap:wrap;gap:4px;padding:12px 0;overflow-x:auto;">';
    flowHtml +=
      '<div style="background:var(--primary);color:#fff;border-radius:20px;padding:5px 14px;font-size:0.85rem;font-weight:600;flex-shrink:0;">开始</div>';

    const rArr = () => {
      flowHtml +=
        '<div style="padding:0 2px;color:var(--text-light);font-size:1rem;flex-shrink:0;">→</div>';
    };
    const rPlus = (pos) => {
      flowHtml += `<button class="btn btn-sm wf-plus-btn" data-pos="${pos}" data-tpl="${tpl.id}" style="flex-shrink:0;background:none;border:1px dashed var(--border);border-radius:50%;width:28px;height:28px;display:inline-flex;align-items:center;justify-content:center;cursor:pointer;color:var(--text-light);font-size:1rem;line-height:1;" title="添加节点">+</button>`;
    };

    if (nodes.length === 0) {
      rArr();
      rPlus(0);
    } else {
      nodes.forEach((n, i) => {
        const assignedIds = nodeAssignees[n.id] || [];
        const assignedNames = assignedIds
          .map((id) => {
            const u = this._wfUsers.find((usr) => usr.id === id);
            return u ? u.display_name || u.email : "";
          })
          .filter(Boolean);
        rArr();
        if (i === 0) {
          rPlus(0);
          rArr();
        }
        flowHtml += `<div class="wf-node-card" data-node-id="${n.id}" style="flex-shrink:0;width:150px;background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);overflow:hidden;">
          <div style="padding:8px 10px 4px;text-align:center;">
            <div style="font-size:0.65rem;color:var(--text-light);margin-bottom:3px;">${n.is_preset ? '<span style="display:inline-block;background:var(--primary);color:#fff;border-radius:3px;padding:0 5px;font-size:0.6rem;line-height:1.4;">默认</span>' : "步骤" + n.order_index}</div>
            <div style="font-weight:600;font-size:0.85rem;margin-bottom:2px;">${this._esc(n.name)}</div>
            <div style="font-size:0.7rem;color:${assignedNames.length > 0 ? "var(--primary)" : "var(--text-light)"};overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${assignedNames.length > 0 ? assignedNames.join(", ") : "未分配"}</div>
          </div>
          <div style="display:flex;border-top:1px solid var(--border);">
            <button class="wf-edit-node-btn" data-node-id="${n.id}" style="flex:1;border:none;background:none;padding:4px;font-size:0.7rem;cursor:pointer;color:var(--primary);border-right:1px solid var(--border);">编辑</button>
            ${n.is_preset ? "" : `<button class="wf-del-node-btn" data-node-id="${n.id}" style="flex:1;border:none;background:none;padding:4px;font-size:0.7rem;cursor:pointer;color:var(--danger);">删除</button>`}
          </div>
        </div>`;
        rArr();
        rPlus(i + 1);
      });
    }
    rArr();
    flowHtml +=
      '<div style="background:var(--success);color:#fff;border-radius:20px;padding:5px 14px;font-size:0.85rem;font-weight:600;flex-shrink:0;">结束</div>';
    flowHtml += "</div>";

    return `<div class="wf-editor-card" data-tpl-id="${tpl.id}" style="border:1px solid var(--border);border-radius:var(--radius);padding:20px;background:var(--bg);margin-bottom:16px;">
      <div style="margin-bottom:12px;">
        <h3 style="margin:0;font-size:1rem;">${this._esc(tpl.name)}</h3>
        <p style="margin:2px 0 0;font-size:0.8rem;color:var(--text-light);">最少 ${min} 个节点 · 当前 ${nodes.length} 个</p>
      </div>
      ${flowHtml}
    </div>`;
  }

  _renderWorkflowEditor() {
    // 已废弃：改为一次性渲染所有流程
  }

  async _showWFAddNode(templateId, pos) {
    const name = prompt("请输入节点名称：", "审核" + (pos + 1));
    if (!name) return;
    // 读取当前模板的所有节点
    const { data: nodes } = await supabaseClient
      .from("ep_workflow_nodes")
      .select("id,order_index")
      .eq("template_id", templateId)
      .order("order_index");
    const curNodes = nodes || [];
    // 插入新节点
    const { error } = await supabaseClient.from("ep_workflow_nodes").insert({
      template_id: templateId,
      name: name,
      order_index: pos + 1,
    });
    if (error) {
      this.showToast("添加失败: " + error.message, "error");
      return;
    }
    // 后续节点的 order_index 后移
    for (let i = pos; i < curNodes.length; i++) {
      await supabaseClient
        .from("ep_workflow_nodes")
        .update({ order_index: i + 2 })
        .eq("id", curNodes[i].id);
    }
    await Store.loadAllWorkflowData();
    this.renderWorkflows();
  }

  async _showWFEditNode(nodeId) {
    // 移除已存在的弹窗
    document.querySelectorAll(".modal-overlay").forEach((el) => el.remove());
    // 从 Store 缓存读取节点和分配数据
    const allNodes = Store.getWfNodes();
    const allAssignees = Store.getWfAssignees();
    const node = allNodes.find((n) => n.id === nodeId);
    if (!node) {
      this.showToast("节点不存在", "error");
      return;
    }
    const nodeName = node.name;
    const assignedSet = new Set(
      allAssignees.filter((a) => a.node_id === nodeId).map((a) => a.user_id),
    );
    const users = this._wfUsers;
    const overlay = document.createElement("div");
    overlay.className = "modal-overlay active";
    let bodyHtml = `<div style="margin-bottom:12px;">
      <label style="display:block;font-size:0.85rem;font-weight:600;margin-bottom:4px;">节点名称</label>
      <input type="text" id="wfEditNodeName" class="toolbar-input" value="${this._esc(nodeName)}" style="width:100%;">
    </div>
    <div style="font-size:0.85rem;font-weight:600;margin-bottom:6px;">分配审批人</div>`;
    bodyHtml += users
      .map((u) => {
        const checked = assignedSet.has(u.id) ? "checked" : "";
        return `<label style="display:flex;align-items:center;gap:8px;padding:6px 0;cursor:pointer;font-size:0.85rem;">
        <input type="checkbox" value="${u.id}" ${checked} style="width:16px;height:16px;">
        <span>${this._esc(u.display_name || u.email)}</span>
      </label>`;
      })
      .join("");
    overlay.innerHTML = `<div class="modal" style="max-width:420px">
      <div class="modal-header"><h3>编辑节点</h3><button class="modal-close">&times;</button></div>
      <div class="modal-body">${bodyHtml}</div>
      <div class="modal-footer" style="display:flex;gap:8px;justify-content:flex-end;padding:12px 20px;border-top:1px solid var(--border);">
        <button type="button" class="btn btn-secondary modal-close-btn">取消</button>
        <button type="button" class="btn btn-primary" id="wfEditSave">保存</button>
      </div>
    </div>`;
    document.body.appendChild(overlay);
    overlay
      .querySelector(".modal-close")
      .addEventListener("click", () => overlay.remove());
    overlay
      .querySelector(".modal-close-btn")
      .addEventListener("click", () => overlay.remove());
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) overlay.remove();
    });
    document
      .getElementById("wfEditSave")
      .addEventListener("click", async () => {
        const newName = document.getElementById("wfEditNodeName").value.trim();
        if (!newName) {
          this.showToast("请输入节点名称", "error");
          return;
        }
        const checkedBoxes = overlay.querySelectorAll(
          ".modal-body input[type=checkbox]:checked",
        );
        const selectedIds = Array.from(checkedBoxes).map((cb) => cb.value);
        try {
          // 更新名称
          await supabaseClient
            .from("ep_workflow_nodes")
            .update({ name: newName })
            .eq("id", nodeId);
          // 删除旧分配
          await supabaseClient
            .from("ep_workflow_node_assignees")
            .delete()
            .eq("node_id", nodeId);
          // 插入新分配
          if (selectedIds.length > 0) {
            const inserts = selectedIds.map((uid) => ({
              node_id: nodeId,
              user_id: uid,
            }));
            await supabaseClient
              .from("ep_workflow_node_assignees")
              .insert(inserts);
          }
          overlay.remove();
          await Store.loadAllWorkflowData();
          this.renderWorkflows();
        } catch (err) {
          this.showToast("保存失败: " + err.message, "error");
        }
      });
  }

  async _showWFAssignModal(nodeId) {
    const users = this._wfUsers;
    if (users.length === 0) {
      this.showToast("暂无可用审批人，请先添加", "error");
      return;
    }

    // 从 Store 缓存读取已分配审批人
    const assignedSet = new Set(
      Store.getWfAssignees()
        .filter((a) => a.node_id === nodeId)
        .map((a) => a.user_id),
    );

    const overlay = document.createElement("div");
    overlay.className = "modal-overlay active";
    let bodyHtml = users
      .map((u) => {
        const checked = assignedSet.has(u.id) ? "checked" : "";
        return `<label style="display:flex;align-items:center;gap:8px;padding:6px 0;cursor:pointer;">
        <input type="checkbox" value="${u.id}" ${checked} style="width:16px;height:16px;">
        <span>${this._esc(u.display_name || u.email)}</span>
      </label>`;
      })
      .join("");

    overlay.innerHTML = `<div class="modal" style="max-width:380px">
      <div class="modal-header"><h3>分配审批人</h3><button class="modal-close">&times;</button></div>
      <div class="modal-body">${bodyHtml}</div>
      <div class="modal-footer" style="display:flex;gap:8px;justify-content:flex-end;padding:12px 20px;border-top:1px solid var(--border);">
        <button type="button" class="btn btn-secondary modal-close-btn">取消</button>
        <button type="button" class="btn btn-primary" id="wfAssignSave">保存</button>
      </div>
    </div>`;
    document.body.appendChild(overlay);
    overlay
      .querySelector(".modal-close")
      .addEventListener("click", () => overlay.remove());
    overlay
      .querySelector(".modal-close-btn")
      .addEventListener("click", () => overlay.remove());
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) overlay.remove();
    });

    document
      .getElementById("wfAssignSave")
      .addEventListener("click", async () => {
        const checked = Array.from(
          overlay.querySelectorAll("input[type=checkbox]:checked"),
        ).map((cb) => cb.value);
        try {
          // 删除旧的，插入新的
          await supabaseClient
            .from("ep_workflow_node_assignees")
            .delete()
            .eq("node_id", nodeId);
          if (checked.length > 0) {
            const inserts = checked.map((uid) => ({
              node_id: nodeId,
              user_id: uid,
            }));
            const { error } = await supabaseClient
              .from("ep_workflow_node_assignees")
              .insert(inserts);
            if (error) throw error;
          }
          overlay.remove();
          await Store.loadAllWorkflowData();
          this.renderWorkflows();
        } catch (e) {
          this.showToast("保存失败: " + e.message, "error");
        }
      });
  }

  // ============ 审批记录 ============

  async renderApprovalRecords() {
    const container = document.getElementById("approvalRecordsContainer");
    if (!supabaseClient) {
      container.innerHTML =
        '<div class="empty-state"><p>数据库未连接</p></div>';
      return;
    }
    try {
      // 从缓存读取
      let records = Store.getApprovalRecords();
      if (records.length === 0) {
        await Store.loadApprovalRecordsFromDB();
        records = Store.getApprovalRecords();
      }
      this._aprRecords = records;
      if (this._aprRecords.length === 0) {
        container.innerHTML =
          '<div class="empty-state"><div class="icon"><img src="src/icon/box.svg" alt="empty" class="empty-icon"></div><p>暂无审批记录</p></div>';
        return;
      }
      container.innerHTML = `<div class="table-filters" style="margin-bottom:12px;">
        <select id="aprStatusF" class="toolbar-select" style="width:100px"><option value="">全部状态</option><option value="pending">待审批</option><option value="approved">已通过</option><option value="rejected">已拒绝</option></select>
        <select id="aprTypeF" class="toolbar-select" style="width:100px"><option value="">全部类型</option><option value="运输">运输</option><option value="参观">参观</option><option value="选样">选样</option><option value="借还">借还</option><option value="其他">其他</option></select>
        <input type="text" id="aprSearch" placeholder="申请人" class="toolbar-input" style="width:100px" autocomplete="off">
        <button id="aprQueryBtn" class="toolbar-btn btn-secondary">查询</button>
      </div>
      <div style="overflow-x:auto;"><table class="data-table" style="width:100%"><thead><tr><th>序号</th><th>申请人</th><th>公司</th><th>类型</th><th>状态</th><th>当前节点</th><th>申请时间</th><th>操作</th></tr></thead><tbody id="aprTbody"></tbody></table></div>`;
      this._renderAprRows();
      document
        .getElementById("aprQueryBtn")
        ?.addEventListener("click", () => this._renderAprRows());
      document
        .getElementById("aprStatusF")
        ?.addEventListener("change", () => this._renderAprRows());
      document
        .getElementById("aprTypeF")
        ?.addEventListener("change", () => this._renderAprRows());
      document
        .getElementById("aprSearch")
        ?.addEventListener("input", () => this._renderAprRows());
    } catch (e) {
      container.innerHTML =
        '<div class="empty-state"><p>加载失败: ' + e.message + "</p></div>";
    }
  }

  _renderAprRows() {
    const statusF = document.getElementById("aprStatusF")?.value || "";
    const typeF = document.getElementById("aprTypeF")?.value || "";
    const search = (document.getElementById("aprSearch")?.value || "")
      .trim()
      .toLowerCase();
    const tbody = document.getElementById("aprTbody");
    let filtered = this._aprRecords;
    if (statusF)
      filtered = filtered.filter((r) => r.approval_status === statusF);
    if (typeF) filtered = filtered.filter((r) => r.apply_type === typeF);
    if (search)
      filtered = filtered.filter((r) =>
        (r.applicant_name || "").toLowerCase().includes(search),
      );
    if (filtered.length === 0) {
      tbody.innerHTML =
        '<tr><td colspan="8" style="text-align:center;color:var(--text-light);padding:24px;">无匹配记录</td></tr>';
      return;
    }
    const sm = { pending: "待审批", approved: "已通过", rejected: "已拒绝" };
    const sc = {
      pending: "status-info",
      approved: "status-success",
      rejected: "status-error",
    };
    tbody.innerHTML = filtered
      .map((r, i) => {
        const ns =
          typeof r.node_statuses === "string"
            ? JSON.parse(r.node_statuses)
            : r.node_statuses || [];
        const cur = ns.find((n) => n.status === "pending");
        const curText = cur
          ? cur.node_name || "待审批"
          : r.approval_status === "pending"
            ? "待审批"
            : r.approval_status === "approved"
              ? "已完成"
              : "已终止";
        return `<tr>
        <td style="text-align:center;color:var(--text-light);font-size:0.85rem">${i + 1}</td>
        <td><strong>${this._esc(r.applicant_name)}</strong></td>
        <td style="font-size:0.85rem">${this._esc(r.applicant_company || "-")}</td>
        <td><span class="status-badge status-info">${this._esc(r.apply_type)}</span></td>
        <td><span class="status-badge ${sc[r.approval_status] || "status-info"}">${sm[r.approval_status] || r.approval_status}</span></td>
        <td style="font-size:0.85rem">${curText}</td>
        <td style="font-size:0.8rem;color:var(--text-light)">${this._fmtDT(r.created_at)}</td>
        <td><button class="btn btn-sm btn-ghost view-apr-detail" data-id="${r.id}">详情</button></td>
      </tr>`;
      })
      .join("");
    tbody.querySelectorAll(".view-apr-detail").forEach((btn) => {
      btn.addEventListener("click", () =>
        this.showApprovalRecordDetail(btn.dataset.id),
      );
    });
  }

  async showApprovalRecordDetail(recordId) {
    const record = this._aprRecords.find((r) => r.id === recordId);
    if (!record) {
      this.showToast("记录不存在", "error");
      return;
    }
    // 日志需按 ID 过滤，走 DB 查询；节点和用户从 Store 缓存读取
    const [logsRes, mappsRes] = await Promise.all([
      supabaseClient
        .from("ep_approval_logs")
        .select("*")
        .eq("approval_id", recordId)
        .order("created_at"),
      supabaseClient
        .from("ep_approval_mappings")
        .select("*")
        .eq("approval_id", recordId),
    ]);
    const logs = logsRes.data || [];
    const wfNodes = Store.getWfNodes().filter(
      (n) => n.template_id === record.template_id,
    );
    const users = Store.getApprovalUsers();
    const userMap = {};
    users.forEach((u) => {
      userMap[u.id] = u.display_name || u.email;
    });

    const nodeStatuses =
      typeof record.node_statuses === "string"
        ? JSON.parse(record.node_statuses)
        : record.node_statuses || [];
    const sm = { pending: "待审批", approved: "已通过", rejected: "已拒绝" };
    const sc = { pending: "info", approved: "success", rejected: "error" };
    const am = { approve: "通过", reject: "拒绝", submit: "提交" };

    const overlay = document.createElement("div");
    overlay.className = "modal-overlay active";
    overlay.style.overflow = "auto";
    // 构建流程HTML
    let flowHtml =
      '<div style="background:var(--primary);color:#fff;border-radius:20px;padding:4px 12px;font-size:0.8rem;font-weight:600;">开始</div>';
    wfNodes.forEach((n, i) => {
      const ns = nodeStatuses.find(
        (s) => s.nodeId === n.id || s.node_id === n.id,
      );
      const done = ns && ns.status === "approved";
      const rejected = ns && ns.status === "rejected";
      let bg = "var(--border)",
        fg = "var(--text-light)",
        lbl = "待审批";
      if (done) {
        bg = "var(--success)";
        fg = "#fff";
        lbl = "已通过";
      } else if (rejected) {
        bg = "var(--danger)";
        fg = "#fff";
        lbl = "已拒绝";
      } else if (
        i === 0 ||
        (i > 0 &&
          nodeStatuses.find(
            (s) =>
              (s.nodeId === wfNodes[i - 1].id ||
                s.node_id === wfNodes[i - 1].id) &&
              s.status === "approved",
          ))
      ) {
        bg = "var(--warning)";
        fg = "#fff";
        lbl = "审批中";
      }
      const assignee = userMap[n.assignee_id] || "未知";
      flowHtml += `<div style="padding:0 4px;color:var(--text-light);font-size:0.9rem;">→</div>
        <div style="text-align:center;padding:6px 10px;background:${bg};color:${fg};border-radius:var(--radius);min-width:70px;">
          <div style="font-size:0.8rem;font-weight:600;">${this._esc(n.name)}</div>
          <div style="font-size:0.65rem;opacity:0.85;">${this._esc(assignee)}</div>
          <div style="font-size:0.65rem;opacity:0.75;">${lbl}</div>
        </div>`;
    });
    flowHtml +=
      '<div style="padding:0 4px;color:var(--text-light);font-size:0.9rem;">→</div><div style="background:var(--success);color:#fff;border-radius:20px;padding:4px 12px;font-size:0.8rem;font-weight:600;">结束</div>';
    // 日志HTML
    let logsHtml =
      logs.length === 0
        ? '<p style="color:var(--text-light);font-size:0.85rem;">暂无操作日志</p>'
        : logs
            .map((log) => {
              const op = userMap[log.operator_id] || "未知";
              return `<div style="display:flex;gap:10px;align-items:flex-start;padding:8px 0;border-bottom:1px solid var(--border);">
                <div style="min-width:60px;font-size:0.75rem;color:var(--text-light);">${this._fmtDT(log.created_at)}</div>
                <div><span class="status-badge ${log.action === "approve" ? "status-success" : log.action === "reject" ? "status-error" : "status-info"}" style="font-size:0.7rem;">${am[log.action] || log.action}</span></div>
                <div style="flex:1;"><div style="font-weight:600;font-size:0.85rem;">${this._esc(op)}</div>${log.comment ? '<div style="font-size:0.8rem;color:var(--text-light);margin-top:2px;">' + this._esc(log.comment) + "</div>" : ""}</div>
              </div>`;
            })
            .join("");
    // 一次性设置innerHTML
    overlay.innerHTML = `<div class="modal" style="max-width:700px;max-height:90vh;overflow-y:auto;">
      <div class="modal-header"><h3>审批详情</h3><button class="modal-close">&times;</button></div>
      <div class="modal-body">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:20px;">
          <div><span style="color:var(--text-light);font-size:0.8rem;">申请人</span><div style="font-weight:600;">${this._esc(record.applicant_name)}</div></div>
          <div><span style="color:var(--text-light);font-size:0.8rem;">电话</span><div>${this._esc(record.applicant_phone)}</div></div>
          <div><span style="color:var(--text-light);font-size:0.8rem;">公司</span><div>${this._esc(record.applicant_company || "-")}</div></div>
          <div><span style="color:var(--text-light);font-size:0.8rem;">申请类型</span><div><span class="status-badge status-info">${this._esc(record.apply_type)}</span></div></div>
          <div><span style="color:var(--text-light);font-size:0.8rem;">来访日期</span><div>${this._esc(record.visit_date || "-")}</div></div>
          <div><span style="color:var(--text-light);font-size:0.8rem;">状态</span><div><span class="status-badge status-${sc[record.approval_status] || "info"}">${sm[record.approval_status] || record.approval_status}</span></div></div>
        </div>
        <h4 style="font-size:0.9rem;margin:0 0 12px;">审批进度</h4>
        <div style="display:flex;align-items:center;flex-wrap:wrap;gap:4px;padding:12px;background:var(--surface);border-radius:var(--radius);margin-bottom:20px;">
          ${flowHtml}
        </div>
        <h4 style="font-size:0.9rem;margin:16px 0 12px;">操作日志</h4>
        <div style="background:var(--surface);border-radius:var(--radius);padding:12px;">
          ${logsHtml}
        </div>
      </div>
      <div class="modal-footer" style="display:flex;gap:8px;justify-content:flex-end;padding:12px 20px;border-top:1px solid var(--border);">
        <button type="button" class="btn btn-secondary modal-close-btn">关闭</button>
      </div>
    </div>`;
    document.body.appendChild(overlay);
    overlay
      .querySelector(".modal-close")
      .addEventListener("click", () => overlay.remove());
    overlay
      .querySelector(".modal-close-btn")
      .addEventListener("click", () => overlay.remove());
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) overlay.remove();
    });
  }

  // ============ 语音助手管理 ============

  renderVoiceAssistantView() {
    // 默认显示知识库标签
    const allContainers = [
      "vaKnowledgeContainer",
      "vaPersonalityContainer",
      "vaBehaviorContainer",
      "vaVerificationContainer",
      "vaPrecipRulesContainer",
      "vaMemoryContainer",
      "vaErrorsContainer",
      "vaEmotionContainer",
      "vaLogsContainer",
      "vaFunctionsContainer",
      "vaInstinctsContainer",
    ];
    const allTabs = [
      "vaTabKnowledge",
      "vaTabPersonality",
      "vaTabBehavior",
      "vaTabVerification",
      "vaTabPrecipRules",
      "vaTabMemory",
      "vaTabErrors",
      "vaTabEmotion",
      "vaTabLogs",
      "vaTabFunctions",
      "vaTabInstincts",
    ];
    allContainers.forEach((c, i) => {
      document.getElementById(c).style.display = i === 0 ? "" : "none";
    });
    allTabs.forEach((t, i) => {
      document.getElementById(t).className =
        i === 0 ? "toolbar-btn btn-primary" : "toolbar-btn btn-secondary";
    });
    this.renderVAKnowledge();
  }

  // ============ 知识库 ============
  async renderVAKnowledge() {
    const container = document.getElementById("vaKnowledgeContainer");
    if (!supabaseClient) {
      container.innerHTML =
        '<p style="color: var(--text-secondary);">Supabase 未连接</p>';
      return;
    }
    container.innerHTML =
      '<p style="color: var(--text-secondary);">加载中...</p>';
    try {
      const { data, error } = await supabaseClient
        .from("ev_knowledge_base")
        .select("content, version, updated_at")
        .order("version", { ascending: false })
        .limit(1)
        .single();
      if (error && error.code !== "PGRST116") throw error;
      const content = data?.content || "";
      const version = data?.version || 0;
      const updatedAt = data?.updated_at ? this._fmtDT(data.updated_at) : "-";
      container.innerHTML =
        '<div style="margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center;">' +
        '<span style="font-size: 0.82rem; color: var(--text-secondary);">版本: ' +
        version +
        " · 更新: " +
        updatedAt +
        "</span>" +
        '<div style="display: flex; gap: 8px;">' +
        '<button id="vaKnowledgeRefreshBtn" class="toolbar-btn btn-secondary" style="font-size: 0.78rem;">⟳ 刷新</button>' +
        '<button id="vaSaveKnowledgeBtn" class="toolbar-btn btn-primary" style="border-radius: 3px;">💾 保存</button>' +
        "</div>" +
        "</div>" +
        '<textarea id="vaKnowledgeEditor" style="width: 100%; min-height: 400px; padding: 12px; border: 1px solid var(--border); border-radius: 3px; font-size: 0.85rem; font-family: inherit; resize: vertical; background: var(--bg); color: var(--text); box-sizing: border-box;">' +
        this._esc(content) +
        "</textarea>";
      // 绑定刷新
      document
        .getElementById("vaKnowledgeRefreshBtn")
        .addEventListener("click", () => this.renderVAKnowledge());
      document
        .getElementById("vaSaveKnowledgeBtn")
        .addEventListener("click", async () => {
          const newContent = document.getElementById("vaKnowledgeEditor").value;
          const btn = document.getElementById("vaSaveKnowledgeBtn");
          btn.textContent = "保存中...";
          btn.disabled = true;
          try {
            const { error: insertErr } = await supabaseClient
              .from("ev_knowledge_base")
              .insert({ content: newContent, version: version + 1 });
            if (insertErr) throw insertErr;
            this.showToast("知识库保存成功", "success");
            this.renderVAKnowledge();
          } catch (e) {
            this.showToast("保存失败: " + e.message, "error");
            btn.textContent = "💾 保存";
            btn.disabled = false;
          }
        });
    } catch (e) {
      container.innerHTML =
        '<p style="color: var(--danger);">加载失败: ' +
        this._esc(e.message) +
        "</p>";
    }
  }

  // ============ 人格库（可编辑） ============
  async renderVAPersonality() {
    const container = document.getElementById("vaPersonalityContainer");
    if (!supabaseClient) {
      container.innerHTML =
        '<p style="color: var(--text-secondary);">Supabase 未连接</p>';
      return;
    }
    container.innerHTML =
      '<p style="color: var(--text-secondary);">加载中...</p>';
    try {
      const { data, error } = await supabaseClient
        .from("ev_personality")
        .select("*")
        .order("sort", { ascending: true });
      if (error) throw error;

      const sections = {
        basic: { title: "📋 基本信息", desc: "姓名、类型、核心性格等基础设定" },
        extended: {
          title: "📖 附加信息",
          desc: "有缘由的设定，如名字由来、使命",
        },
        innate: { title: "🌱 非附加信息", desc: "本色性格，无需解释成因" },
        tone_rule: {
          title: "🗣️ 语气适配规则",
          desc: "根据用户语气自动调整回复风格",
        },
      };

      let html = "";
      // 顶部操作栏 + 刷新
      html +=
        '<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">' +
        '<h3 style="margin: 0; font-size: 1rem;">🪪 人格库 — 可编辑</h3>' +
        '<button class="toolbar-btn btn-secondary" id="vaPersonRefreshBtn" style="font-size: 0.82rem;">⟳ 刷新</button>' +
        "</div>";
      // 新增表单
      html +=
        '<div style="padding: 14px; border: 2px solid var(--primary); border-radius: 6px; margin-bottom: 20px; background: var(--bg-secondary);">' +
        '<h3 style="margin: 0 0 10px; font-size: 0.95rem;">➕ 新增条目</h3>' +
        '<div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: flex-end;">' +
        '<div style="min-width: 120px;"><label style="font-size: 0.78rem; color: var(--text-secondary);">分区</label>' +
        '<select id="vaPersonNewSection" style="width: 100%; padding: 6px; border: 1px solid var(--border); border-radius: 3px; font-size: 0.82rem; background: var(--bg); color: var(--text);">' +
        '<option value="basic">基本信息</option><option value="extended">附加信息</option><option value="innate">非附加信息</option><option value="tone_rule">语气适配规则</option>' +
        "</select></div>" +
        '<div style="flex: 1; min-width: 150px;"><label style="font-size: 0.78rem; color: var(--text-secondary);">键(Key)</label>' +
        '<input id="vaPersonNewKey" placeholder="如 name / mission" style="width: 100%; padding: 6px; border: 1px solid var(--border); border-radius: 3px; font-size: 0.82rem; background: var(--bg); color: var(--text); box-sizing: border-box;"></div>' +
        '<div style="flex: 2; min-width: 200px;"><label style="font-size: 0.78rem; color: var(--text-secondary);">值(Value)</label>' +
        '<input id="vaPersonNewValue" placeholder="内容" style="width: 100%; padding: 6px; border: 1px solid var(--border); border-radius: 3px; font-size: 0.82rem; background: var(--bg); color: var(--text); box-sizing: border-box;"></div>' +
        '<div style="width: 60px;"><label style="font-size: 0.78rem; color: var(--text-secondary);">排序</label>' +
        '<input id="vaPersonNewSort" type="number" value="99" style="width: 100%; padding: 6px; border: 1px solid var(--border); border-radius: 3px; font-size: 0.82rem; background: var(--bg); color: var(--text); box-sizing: border-box;"></div>' +
        '<button id="vaPersonAddBtn" class="toolbar-btn btn-primary" style="border-radius: 3px; height: 32px;">添加</button>' +
        "</div></div>";

      // 按分区展示
      const dataBySection = {};
      for (const s of Object.keys(sections)) {
        dataBySection[s] = (data || []).filter((r) => r.section === s);
      }

      for (const [secKey, secInfo] of Object.entries(sections)) {
        const rows = dataBySection[secKey] || [];
        html +=
          '<div style="padding: 16px; border: 1px solid var(--border); border-radius: 6px; margin-bottom: 16px;">' +
          '<h3 style="margin: 0 0 8px; font-size: 1rem;">' +
          secInfo.title +
          "</h3>" +
          '<p style="margin: 0 0 10px; font-size: 0.78rem; color: var(--text-secondary);">' +
          secInfo.desc +
          "</p>";
        if (rows.length === 0) {
          html +=
            '<p style="color: var(--text-secondary); font-size: 0.82rem; padding: 8px;">暂无数据</p>';
        } else {
          html +=
            '<table style="width: 100%; font-size: 0.83rem; border-collapse: collapse;"><tbody>';
          for (const r of rows) {
            html +=
              '<tr id="vaPersonRow-' +
              r.id +
              '">' +
              '<td style="padding: 6px 8px; border-bottom: 1px solid var(--border); font-weight: 500; white-space: nowrap; width: 100px;">' +
              this._esc(r.personality_key || r.key || "") +
              "</td>" +
              '<td style="padding: 6px 8px; border-bottom: 1px solid var(--border);">' +
              '<input class="va-person-val" data-id="' +
              r.id +
              '" data-key="' +
              this._escAttr(r.personality_key || r.key || "") +
              '" value="' +
              this._escAttr(r.personality_value || r.value || "") +
              "\" style=\"width: 100%; padding: 4px 8px; border: 1px solid transparent; border-radius: 3px; font-size: 0.82rem; background: transparent; color: var(--text); box-sizing: border-box;\" onfocus=\"this.style.borderColor='var(--primary)';this.style.background='var(--bg-secondary)'\" onblur=\"this.style.borderColor='transparent';this.style.background='transparent'\">" +
              "</td>" +
              '<td style="padding: 6px 8px; border-bottom: 1px solid var(--border); width: 60px; text-align: center;">' +
              '<input class="va-person-sort" data-id="' +
              r.id +
              '" type="number" value="' +
              (r.sort || 0) +
              "\" style=\"width: 48px; padding: 4px; border: 1px solid transparent; border-radius: 3px; font-size: 0.78rem; background: transparent; color: var(--text); text-align: center;\" onfocus=\"this.style.borderColor='var(--primary)';this.style.background='var(--bg-secondary)'\" onblur=\"this.style.borderColor='transparent';this.style.background='transparent'\">" +
              "</td>" +
              '<td style="padding: 6px 8px; border-bottom: 1px solid var(--border); width: 70px; text-align: center;">' +
              '<button class="toolbar-btn btn-primary" style="padding: 2px 8px; font-size: 0.72rem;" data-va-save-person="' +
              r.id +
              '">保存</button>' +
              '<button class="toolbar-btn btn-danger" style="padding: 2px 6px; font-size: 0.72rem; margin-left: 4px;" data-va-del-person="' +
              r.id +
              '">删</button>' +
              "</td></tr>";
          }
          html += "</tbody></table>";
        }
        html += "</div>";
      }
      html +=
        '<p style="font-size: 0.78rem; color: var(--text-secondary); margin-top: 8px;">人格库来源：Supabase ev_personality 表，编辑后即时生效。</p>';
      container.innerHTML = html;

      // 绑定刷新
      document
        .getElementById("vaPersonRefreshBtn")
        .addEventListener("click", () => this.renderVAPersonality());

      // 绑定添加
      document
        .getElementById("vaPersonAddBtn")
        .addEventListener("click", async () => {
          const section = document.getElementById("vaPersonNewSection").value;
          const key = document.getElementById("vaPersonNewKey").value.trim();
          const value = document
            .getElementById("vaPersonNewValue")
            .value.trim();
          const sort =
            parseInt(document.getElementById("vaPersonNewSort").value) || 99;
          if (!key || !value) {
            this.showToast("键和值不能为空", "error");
            return;
          }
          const btn = document.getElementById("vaPersonAddBtn");
          btn.textContent = "保存中...";
          btn.disabled = true;
          try {
            await supabaseClient.from("ev_personality").insert({
              section,
              personality_key: key,
              personality_value: value,
              sort,
            });
            this.showToast("已添加", "success");
            this.renderVAPersonality();
          } catch (e) {
            this.showToast("添加失败: " + e.message, "error");
            btn.textContent = "添加";
            btn.disabled = false;
          }
        });

      // 绑定保存
      container.querySelectorAll("[data-va-save-person]").forEach((btn) => {
        btn.addEventListener("click", async () => {
          const id = btn.getAttribute("data-va-save-person");
          const row = document.getElementById("vaPersonRow-" + id);
          const valInput = row ? row.querySelector(".va-person-val") : null;
          const sortInput = row ? row.querySelector(".va-person-sort") : null;
          if (!valInput) return;
          const newValue = valInput.value;
          const newSort = sortInput ? parseInt(sortInput.value) || 0 : 0;
          btn.textContent = "保存中...";
          btn.disabled = true;
          try {
            await supabaseClient
              .from("ev_personality")
              .update({ personality_value: newValue, sort: newSort })
              .eq("id", id);
            this.showToast("已保存", "success");
            btn.textContent = "保存";
            btn.disabled = false;
          } catch (e) {
            this.showToast("保存失败: " + e.message, "error");
            btn.textContent = "保存";
            btn.disabled = false;
          }
        });
      });

      // 绑定删除
      container.querySelectorAll("[data-va-del-person]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const id = btn.getAttribute("data-va-del-person");
          this.promptDelete("vaPersonality", id, "人格库条目 #" + id);
        });
      });
    } catch (e) {
      container.innerHTML =
        '<p style="color: var(--danger);">加载失败: ' +
        this._esc(e.message) +
        "</p>";
    }
  }

  // ============ 行为库（可编辑） ============
  async renderVABehavior() {
    const container = document.getElementById("vaBehaviorContainer");
    if (!supabaseClient) {
      container.innerHTML =
        '<p style="color: var(--text-secondary);">Supabase 未连接</p>';
      return;
    }
    container.innerHTML =
      '<p style="color: var(--text-secondary);">加载中...</p>';
    try {
      const { data, error } = await supabaseClient
        .from("ev_behavior")
        .select("*")
        .order("sort", { ascending: true });
      if (error) throw error;

      const layers = {
        principle_forbidden: {
          title: "🚫 绝对禁区",
          desc: "任何情况不可触犯",
          color: "var(--danger)",
        },
        principle_rule: {
          title: "📋 行为准则",
          desc: "一般遵循的规则",
          color: "var(--text)",
        },
        emotion: {
          title: "💗 情感感知",
          desc: "根据用户情绪调整回应方式",
          color: "var(--text)",
        },
        execute: {
          title: "⚡ 执行策略",
          desc: "具体场景的应对方法",
          color: "var(--text)",
        },
      };

      let html = "";
      // 顶部操作栏 + 刷新
      html +=
        '<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">' +
        '<h3 style="margin: 0; font-size: 1rem;">🛡️ 行为库 — 可编辑</h3>' +
        '<button class="toolbar-btn btn-secondary" id="vaBehaviorRefreshBtn" style="font-size: 0.82rem;">⟳ 刷新</button>' +
        "</div>";
      // 新增表单
      html +=
        '<div style="padding: 14px; border: 2px solid var(--primary); border-radius: 6px; margin-bottom: 20px; background: var(--bg-secondary);">' +
        '<h3 style="margin: 0 0 10px; font-size: 0.95rem;">➕ 新增行为规则</h3>' +
        '<div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: flex-end;">' +
        '<div style="min-width: 130px;"><label style="font-size: 0.78rem; color: var(--text-secondary);">层级</label>' +
        '<select id="vaBehavNewLayer" style="width: 100%; padding: 6px; border: 1px solid var(--border); border-radius: 3px; font-size: 0.82rem; background: var(--bg); color: var(--text);">' +
        '<option value="principle_forbidden">绝对禁区</option><option value="principle_rule">行为准则</option><option value="emotion">情感感知</option><option value="execute">执行策略</option>' +
        "</select></div>" +
        '<div style="flex: 1; min-width: 150px;"><label style="font-size: 0.78rem; color: var(--text-secondary);">键(Key)/场景</label>' +
        '<input id="vaBehavNewKey" placeholder="如 编造事实 / 用户着急" style="width: 100%; padding: 6px; border: 1px solid var(--border); border-radius: 3px; font-size: 0.82rem; background: var(--bg); color: var(--text); box-sizing: border-box;"></div>' +
        '<div style="flex: 2; min-width: 200px;"><label style="font-size: 0.78rem; color: var(--text-secondary);">值(Value)/规则</label>' +
        '<input id="vaBehavNewValue" placeholder="行为描述或应对策略" style="width: 100%; padding: 6px; border: 1px solid var(--border); border-radius: 3px; font-size: 0.82rem; background: var(--bg); color: var(--text); box-sizing: border-box;"></div>' +
        '<div style="width: 60px;"><label style="font-size: 0.78rem; color: var(--text-secondary);">排序</label>' +
        '<input id="vaBehavNewSort" type="number" value="99" style="width: 100%; padding: 6px; border: 1px solid var(--border); border-radius: 3px; font-size: 0.82rem; background: var(--bg); color: var(--text); box-sizing: border-box;"></div>' +
        '<button id="vaBehavAddBtn" class="toolbar-btn btn-primary" style="border-radius: 3px; height: 32px;">添加</button>' +
        "</div></div>";

      const dataByLayer = {};
      for (const l of Object.keys(layers)) {
        dataByLayer[l] = (data || []).filter((r) => r.layer === l);
      }

      for (const [layerKey, layerInfo] of Object.entries(layers)) {
        const rows = dataByLayer[layerKey] || [];
        html +=
          '<div style="padding: 16px; border: 1px solid var(--border); border-radius: 6px; margin-bottom: 16px;">' +
          '<h3 style="margin: 0 0 8px; font-size: 1rem; color: ' +
          layerInfo.color +
          ';">' +
          layerInfo.title +
          "</h3>" +
          '<p style="margin: 0 0 10px; font-size: 0.78rem; color: var(--text-secondary);">' +
          layerInfo.desc +
          "</p>";
        if (rows.length === 0) {
          html +=
            '<p style="color: var(--text-secondary); font-size: 0.82rem; padding: 8px;">暂无数据</p>';
        } else {
          html +=
            '<table style="width: 100%; font-size: 0.83rem; border-collapse: collapse;"><tbody>';
          for (const r of rows) {
            html +=
              '<tr id="vaBehavRow-' +
              r.id +
              '">' +
              '<td style="padding: 6px 8px; border-bottom: 1px solid var(--border); font-weight: 500; white-space: nowrap; width: 110px;">' +
              this._esc(r.behavior_key || r.key || "") +
              "</td>" +
              '<td style="padding: 6px 8px; border-bottom: 1px solid var(--border);">' +
              '<input class="va-behav-val" data-id="' +
              r.id +
              '" value="' +
              this._escAttr(r.behavior_value || r.value || "") +
              "\" style=\"width: 100%; padding: 4px 8px; border: 1px solid transparent; border-radius: 3px; font-size: 0.82rem; background: transparent; color: var(--text); box-sizing: border-box;\" onfocus=\"this.style.borderColor='var(--primary)';this.style.background='var(--bg-secondary)'\" onblur=\"this.style.borderColor='transparent';this.style.background='transparent'\">" +
              "</td>" +
              '<td style="padding: 6px 8px; border-bottom: 1px solid var(--border); width: 60px; text-align: center;">' +
              '<input class="va-behav-sort" data-id="' +
              r.id +
              '" type="number" value="' +
              (r.sort || 0) +
              "\" style=\"width: 48px; padding: 4px; border: 1px solid transparent; border-radius: 3px; font-size: 0.78rem; background: transparent; color: var(--text); text-align: center;\" onfocus=\"this.style.borderColor='var(--primary)';this.style.background='var(--bg-secondary)'\" onblur=\"this.style.borderColor='transparent';this.style.background='transparent'\">" +
              "</td>" +
              '<td style="padding: 6px 8px; border-bottom: 1px solid var(--border); width: 70px; text-align: center;">' +
              '<button class="toolbar-btn btn-primary" style="padding: 2px 8px; font-size: 0.72rem;" data-va-save-behav="' +
              r.id +
              '">保存</button>' +
              '<button class="toolbar-btn btn-danger" style="padding: 2px 6px; font-size: 0.72rem; margin-left: 4px;" data-va-del-behav="' +
              r.id +
              '">删</button>' +
              "</td></tr>";
          }
          html += "</tbody></table>";
        }
        html += "</div>";
      }
      html +=
        '<p style="font-size: 0.78rem; color: var(--text-secondary); margin-top: 8px;">行为库来源：Supabase ev_behavior 表，编辑后即时生效。</p>';
      container.innerHTML = html;

      // 绑定刷新
      document
        .getElementById("vaBehaviorRefreshBtn")
        .addEventListener("click", () => this.renderVABehavior());

      document
        .getElementById("vaBehavAddBtn")
        .addEventListener("click", async () => {
          const layer = document.getElementById("vaBehavNewLayer").value;
          const key = document.getElementById("vaBehavNewKey").value.trim();
          const value = document.getElementById("vaBehavNewValue").value.trim();
          const sort =
            parseInt(document.getElementById("vaBehavNewSort").value) || 99;
          if (!key || !value) {
            this.showToast("键和值不能为空", "error");
            return;
          }
          const btn = document.getElementById("vaBehavAddBtn");
          btn.textContent = "保存中...";
          btn.disabled = true;
          try {
            await supabaseClient.from("ev_behavior").insert({
              layer,
              behavior_key: key,
              behavior_value: value,
              sort,
            });
            this.showToast("已添加", "success");
            this.renderVABehavior();
          } catch (e) {
            this.showToast("添加失败: " + e.message, "error");
            btn.textContent = "添加";
            btn.disabled = false;
          }
        });

      container.querySelectorAll("[data-va-save-behav]").forEach((btn) => {
        btn.addEventListener("click", async () => {
          const id = btn.getAttribute("data-va-save-behav");
          const row = document.getElementById("vaBehavRow-" + id);
          const valInput = row ? row.querySelector(".va-behav-val") : null;
          const sortInput = row ? row.querySelector(".va-behav-sort") : null;
          if (!valInput) return;
          const newValue = valInput.value;
          const newSort = sortInput ? parseInt(sortInput.value) || 0 : 0;
          btn.textContent = "保存中...";
          btn.disabled = true;
          try {
            await supabaseClient
              .from("ev_behavior")
              .update({ behavior_value: newValue, sort: newSort })
              .eq("id", id);
            this.showToast("已保存", "success");
            btn.textContent = "保存";
            btn.disabled = false;
          } catch (e) {
            this.showToast("保存失败: " + e.message, "error");
            btn.textContent = "保存";
            btn.disabled = false;
          }
        });
      });

      container.querySelectorAll("[data-va-del-behav]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const id = btn.getAttribute("data-va-del-behav");
          this.promptDelete("vaBehavior", id, "行为库条目 #" + id);
        });
      });
    } catch (e) {
      container.innerHTML =
        '<p style="color: var(--danger);">加载失败: ' +
        this._esc(e.message) +
        "</p>";
    }
  }

  // ============ 核验层（可编辑） ============
  async renderVAVerification() {
    const container = document.getElementById("vaVerificationContainer");
    if (!supabaseClient) {
      container.innerHTML =
        '<p style="color: var(--text-secondary);">Supabase 未连接</p>';
      return;
    }
    container.innerHTML =
      '<p style="color: var(--text-secondary);">加载中...</p>';
    try {
      const { data, error } = await supabaseClient
        .from("ev_verification")
        .select("*")
        .order("sort", { ascending: true });
      if (error) throw error;

      const twoGates = {
        rational: {
          title: "🔍 第一重·核验层面（理性）",
          desc: "事实对不对？逻辑是否一致？",
        },
        humanize: {
          title: "💬 第二重·拟人层面（感性）",
          desc: "语言像不像人？语调是否自然？",
        },
      };

      let html = "";
      // 顶部操作栏 + 刷新
      html +=
        '<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">' +
        '<h3 style="margin: 0; font-size: 1rem;">🔍 核验层 — 可编辑</h3>' +
        '<button class="toolbar-btn btn-secondary" id="vaVerificationRefreshBtn" style="font-size: 0.82rem;">⟳ 刷新</button>' +
        "</div>";
      html +=
        '<div style="padding: 16px; border: 2px solid var(--primary); border-radius: 6px; background: var(--bg-secondary); margin-bottom: 16px;">' +
        '<p style="margin: 0; font-size: 0.85rem; line-height: 1.6;">🔍 <strong>核验层是依维输出前的最后一道质检门。</strong>每次AI生成回答后，必须过一遍检查项，不通过就修正后再输出。通过 System Prompt 自检指令实现，不额外调API。</p>' +
        "</div>";

      // 新增表单
      html +=
        '<div style="padding: 14px; border: 2px solid var(--primary); border-radius: 6px; margin-bottom: 20px; background: var(--bg-secondary);">' +
        '<h3 style="margin: 0 0 10px; font-size: 0.95rem;">➕ 新增核验规则</h3>' +
        '<div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: flex-end;">' +
        '<div style="min-width: 130px;"><label style="font-size: 0.78rem; color: var(--text-secondary);">核验门</label>' +
        '<select id="vaVerifNewGate" style="width: 100%; padding: 6px; border: 1px solid var(--border); border-radius: 3px; font-size: 0.82rem; background: var(--bg); color: var(--text);">' +
        '<option value="rational">第一重·理性</option><option value="humanize">第二重·感性</option>' +
        "</select></div>" +
        '<div style="flex: 1; min-width: 150px;"><label style="font-size: 0.78rem; color: var(--text-secondary);">规则名称</label>' +
        '<input id="vaVerifNewName" placeholder="如 自然度核验" style="width: 100%; padding: 6px; border: 1px solid var(--border); border-radius: 3px; font-size: 0.82rem; background: var(--bg); color: var(--text); box-sizing: border-box;"></div>' +
        '<div style="flex: 2; min-width: 200px;"><label style="font-size: 0.78rem; color: var(--text-secondary);">不通过标准</label>' +
        '<input id="vaVerifNewDesc" placeholder="不通过的具体表现" style="width: 100%; padding: 6px; border: 1px solid var(--border); border-radius: 3px; font-size: 0.82rem; background: var(--bg); color: var(--text); box-sizing: border-box;"></div>' +
        '<div style="flex: 2; min-width: 200px;"><label style="font-size: 0.78rem; color: var(--text-secondary);">详细自检问题</label>' +
        '<input id="vaVerifNewDetail" placeholder="核验时问自己的问题" style="width: 100%; padding: 6px; border: 1px solid var(--border); border-radius: 3px; font-size: 0.82rem; background: var(--bg); color: var(--text); box-sizing: border-box;"></div>' +
        '<div style="width: 60px;"><label style="font-size: 0.78rem; color: var(--text-secondary);">排序</label>' +
        '<input id="vaVerifNewSort" type="number" value="99" style="width: 100%; padding: 6px; border: 1px solid var(--border); border-radius: 3px; font-size: 0.82rem; background: var(--bg); color: var(--text); box-sizing: border-box;"></div>' +
        '<button id="vaVerifAddBtn" class="toolbar-btn btn-primary" style="border-radius: 3px; height: 32px;">添加</button>' +
        "</div></div>";

      const dataByGate = {};
      for (const g of Object.keys(twoGates)) {
        dataByGate[g] = (data || []).filter((r) => r.gate === g);
      }

      for (const [gateKey, gateInfo] of Object.entries(twoGates)) {
        const rows = dataByGate[gateKey] || [];
        html +=
          '<div style="padding: 16px; border: 1px solid var(--border); border-radius: 6px; margin-bottom: 16px;">' +
          '<h3 style="margin: 0 0 8px; font-size: 1rem;">' +
          gateInfo.title +
          "</h3>" +
          '<p style="margin: 0 0 10px; font-size: 0.78rem; color: var(--text-secondary);">' +
          gateInfo.desc +
          "</p>";
        if (rows.length === 0) {
          html +=
            '<p style="color: var(--text-secondary); font-size: 0.82rem; padding: 8px;">暂无数据</p>';
        } else {
          html +=
            '<div style="display: flex; flex-direction: column; gap: 8px;">';
          for (const r of rows) {
            html +=
              '<div id="vaVerifRow-' +
              r.id +
              '" style="padding: 10px; border: 1px solid var(--border); border-radius: 4px; background: var(--bg-secondary);">' +
              '<div style="display: flex; gap: 8px; align-items: center; margin-bottom: 6px;">' +
              '<span style="font-weight: 600; font-size: 0.84rem; min-width: 100px;">' +
              this._esc(r.rule_name || "") +
              "</span>" +
              '<input class="va-verif-name" data-id="' +
              r.id +
              '" value="' +
              this._escAttr(r.rule_name || "") +
              "\" style=\"flex: 1; padding: 4px 8px; border: 1px solid transparent; border-radius: 3px; font-size: 0.82rem; background: transparent; color: var(--text);\" onfocus=\"this.style.borderColor='var(--primary)';this.style.background='var(--bg)'\" onblur=\"this.style.borderColor='transparent';this.style.background='transparent'\">" +
              '<input class="va-verif-sort" data-id="' +
              r.id +
              '" type="number" value="' +
              (r.sort || 0) +
              "\" style=\"width: 50px; padding: 4px; border: 1px solid transparent; border-radius: 3px; font-size: 0.78rem; background: transparent; color: var(--text); text-align: center;\" onfocus=\"this.style.borderColor='var(--primary)';this.style.background='var(--bg)'\" onblur=\"this.style.borderColor='transparent';this.style.background='transparent'\">" +
              "</div>" +
              '<div style="display: flex; gap: 8px; margin-bottom: 4px;">' +
              '<span style="font-size: 0.75rem; color: var(--danger); min-width: 100px;">不通过 →</span>' +
              '<input class="va-verif-desc" data-id="' +
              r.id +
              '" value="' +
              this._escAttr(r.check_desc || "") +
              "\" style=\"flex: 1; padding: 4px 8px; border: 1px solid transparent; border-radius: 3px; font-size: 0.8rem; background: transparent; color: var(--danger);\" onfocus=\"this.style.borderColor='var(--primary)';this.style.background='var(--bg)'\" onblur=\"this.style.borderColor='transparent';this.style.background='transparent'\">" +
              "</div>" +
              '<div style="display: flex; gap: 8px; align-items: center;">' +
              '<span style="font-size: 0.75rem; color: var(--text-secondary); min-width: 100px;">自检问题</span>' +
              '<input class="va-verif-detail" data-id="' +
              r.id +
              '" value="' +
              this._escAttr(r.check_detail || "") +
              "\" style=\"flex: 1; padding: 4px 8px; border: 1px solid transparent; border-radius: 3px; font-size: 0.8rem; background: transparent; color: var(--text);\" onfocus=\"this.style.borderColor='var(--primary)';this.style.background='var(--bg)'\" onblur=\"this.style.borderColor='transparent';this.style.background='transparent'\">" +
              '<button class="toolbar-btn btn-primary" style="padding: 2px 8px; font-size: 0.72rem;" data-va-save-verif="' +
              r.id +
              '">保存</button>' +
              '<button class="toolbar-btn btn-danger" style="padding: 2px 6px; font-size: 0.72rem;" data-va-del-verif="' +
              r.id +
              '">删</button>' +
              "</div></div>";
          }
          html += "</div>";
        }
        html += "</div>";
      }
      html +=
        '<div style="margin-top: 16px; padding: 12px; border-left: 3px solid var(--primary); font-size: 0.82rem; background: var(--bg-secondary);">' +
        '<strong>核验结果处理：</strong>通过→正常输出 · 不通过→修正后再输出 · 反复不通过（3次）→告诉用户"这个问题我需要再想想"并建议转人工</div>' +
        '<p style="font-size: 0.78rem; color: var(--text-secondary); margin-top: 8px;">核验层来源：Supabase ev_verification 表，编辑后即时生效。</p>';
      container.innerHTML = html;

      // 绑定刷新
      document
        .getElementById("vaVerificationRefreshBtn")
        .addEventListener("click", () => this.renderVAVerification());

      document
        .getElementById("vaVerifAddBtn")
        .addEventListener("click", async () => {
          const gate = document.getElementById("vaVerifNewGate").value;
          const name = document.getElementById("vaVerifNewName").value.trim();
          const desc = document.getElementById("vaVerifNewDesc").value.trim();
          const detail = document
            .getElementById("vaVerifNewDetail")
            .value.trim();
          const sort =
            parseInt(document.getElementById("vaVerifNewSort").value) || 99;
          if (!name || !desc) {
            this.showToast("规则名称和不通过标准不能为空", "error");
            return;
          }
          const btn = document.getElementById("vaVerifAddBtn");
          btn.textContent = "保存中...";
          btn.disabled = true;
          try {
            await supabaseClient.from("ev_verification").insert({
              gate,
              rule_name: name,
              check_desc: desc,
              check_detail: detail,
              sort,
            });
            this.showToast("已添加", "success");
            this.renderVAVerification();
          } catch (e) {
            this.showToast("添加失败: " + e.message, "error");
            btn.textContent = "添加";
            btn.disabled = false;
          }
        });

      container.querySelectorAll("[data-va-save-verif]").forEach((btn) => {
        btn.addEventListener("click", async () => {
          const id = btn.getAttribute("data-va-save-verif");
          const row = document.getElementById("vaVerifRow-" + id);
          if (!row) return;
          const nameInput = row.querySelector(".va-verif-name");
          const descInput = row.querySelector(".va-verif-desc");
          const detailInput = row.querySelector(".va-verif-detail");
          const sortInput = row.querySelector(".va-verif-sort");
          btn.textContent = "保存中...";
          btn.disabled = true;
          try {
            await supabaseClient
              .from("ev_verification")
              .update({
                rule_name: nameInput ? nameInput.value : "",
                check_desc: descInput ? descInput.value : "",
                check_detail: detailInput ? detailInput.value : "",
                sort: sortInput ? parseInt(sortInput.value) || 0 : 0,
              })
              .eq("id", id);
            this.showToast("已保存", "success");
            btn.textContent = "保存";
            btn.disabled = false;
          } catch (e) {
            this.showToast("保存失败: " + e.message, "error");
            btn.textContent = "保存";
            btn.disabled = false;
          }
        });
      });

      container.querySelectorAll("[data-va-del-verif]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const id = btn.getAttribute("data-va-del-verif");
          this.promptDelete("vaVerification", id, "核验规则 #" + id);
        });
      });
    } catch (e) {
      container.innerHTML =
        '<p style="color: var(--danger);">加载失败: ' +
        this._esc(e.message) +
        "</p>";
    }
  }

  // ============ 沉淀规则（可编辑） ============
  async renderVAPrecipRules() {
    const container = document.getElementById("vaPrecipRulesContainer");
    if (!supabaseClient) {
      container.innerHTML =
        '<p style="color: var(--text-secondary);">Supabase 未连接</p>';
      return;
    }
    container.innerHTML =
      '<p style="color: var(--text-secondary);">加载中...</p>';
    try {
      const { data, error } = await supabaseClient
        .from("ev_precipitation_rules")
        .select("*")
        .order("priority", { ascending: true });
      if (error) throw error;

      let html =
        '<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">' +
        '<h3 style="margin: 0; font-size: 1rem;">📐 沉淀规则 — 可编辑</h3>' +
        '<button class="toolbar-btn btn-secondary" id="vaPrecipRulesRefreshBtn" style="font-size: 0.82rem;">⟳ 刷新</button>' +
        "</div>" +
        '<p class="panel-desc" style="font-size: 0.84rem; color: var(--text-secondary); margin-bottom: 16px;">配置每日沉淀的分析维度、重点和提示词模板。</p>';

      // 新增表单
      html +=
        '<div style="padding: 14px; border: 2px solid var(--primary); border-radius: 6px; margin-bottom: 20px; background: var(--bg-secondary);">' +
        '<h3 style="margin: 0 0 10px; font-size: 0.95rem;">➕ 新增沉淀维度</h3>' +
        '<div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: flex-end;">' +
        '<div style="flex: 1; min-width: 130px;"><label style="font-size: 0.78rem; color: var(--text-secondary);">维度名称</label>' +
        '<input id="vaPrecipNewDim" placeholder="如 知识沉淀 / 情感分析" style="width: 100%; padding: 6px; border: 1px solid var(--border); border-radius: 3px; font-size: 0.82rem; background: var(--bg); color: var(--text); box-sizing: border-box;"></div>' +
        '<div style="width: 60px;"><label style="font-size: 0.78rem; color: var(--text-secondary);">优先级</label>' +
        '<input id="vaPrecipNewPriority" type="number" value="5" style="width: 100%; padding: 6px; border: 1px solid var(--border); border-radius: 3px; font-size: 0.82rem; background: var(--bg); color: var(--text); box-sizing: border-box;"></div>' +
        '<div style="flex: 2; min-width: 250px;"><label style="font-size: 0.78rem; color: var(--text-secondary);">分析提示词</label>' +
        '<input id="vaPrecipNewPrompt" placeholder="告诉AI从什么角度分析" style="width: 100%; padding: 6px; border: 1px solid var(--border); border-radius: 3px; font-size: 0.82rem; background: var(--bg); color: var(--text); box-sizing: border-box;"></div>' +
        '<button id="vaPrecipAddBtn" class="toolbar-btn btn-primary" style="border-radius: 3px; height: 32px;">添加</button>' +
        "</div></div>";

      if (!data || data.length === 0) {
        html +=
          '<p style="color: var(--text-secondary); font-size: 0.84rem; padding: 16px;">暂无沉淀规则。添加维度后，每日沉淀会按规则进行分析。</p>';
      } else {
        html +=
          '<div style="overflow-x: auto;"><table style="width: 100%; font-size: 0.83rem; border-collapse: collapse;"><thead><tr style="background: var(--bg-secondary);">' +
          '<th style="padding: 8px; border-bottom: 2px solid var(--border); text-align: left;">维度</th>' +
          '<th style="padding: 8px; border-bottom: 2px solid var(--border); text-align: center; width: 60px;">优先级</th>' +
          '<th style="padding: 8px; border-bottom: 2px solid var(--border); text-align: left;">分析提示词</th>' +
          '<th style="padding: 8px; border-bottom: 2px solid var(--border); text-align: center; width: 100px;">操作</th>' +
          "</tr></thead><tbody>";
        for (const r of data) {
          html +=
            '<tr id="vaPrecipRow-' +
            r.id +
            '">' +
            '<td style="padding: 6px 8px; border-bottom: 1px solid var(--border);">' +
            '<input class="va-precip-dim" data-id="' +
            r.id +
            '" value="' +
            this._escAttr(r.dimension || "") +
            "\" style=\"width: 100%; padding: 4px 8px; border: 1px solid transparent; border-radius: 3px; font-size: 0.82rem; background: transparent; color: var(--text); box-sizing: border-box;\" onfocus=\"this.style.borderColor='var(--primary)';this.style.background='var(--bg-secondary)'\" onblur=\"this.style.borderColor='transparent';this.style.background='transparent'\">" +
            "</td>" +
            '<td style="padding: 6px 8px; border-bottom: 1px solid var(--border); text-align: center;">' +
            '<input class="va-precip-priority" data-id="' +
            r.id +
            '" type="number" value="' +
            (r.priority || 5) +
            "\" style=\"width: 48px; padding: 4px; border: 1px solid transparent; border-radius: 3px; font-size: 0.78rem; background: transparent; color: var(--text); text-align: center;\" onfocus=\"this.style.borderColor='var(--primary)';this.style.background='var(--bg-secondary)'\" onblur=\"this.style.borderColor='transparent';this.style.background='transparent'\">" +
            "</td>" +
            '<td style="padding: 6px 8px; border-bottom: 1px solid var(--border);">' +
            '<input class="va-precip-prompt" data-id="' +
            r.id +
            '" value="' +
            this._escAttr(r.prompt || "") +
            "\" style=\"width: 100%; padding: 4px 8px; border: 1px solid transparent; border-radius: 3px; font-size: 0.82rem; background: transparent; color: var(--text); box-sizing: border-box;\" onfocus=\"this.style.borderColor='var(--primary)';this.style.background='var(--bg-secondary)'\" onblur=\"this.style.borderColor='transparent';this.style.background='transparent'\">" +
            "</td>" +
            '<td style="padding: 6px 8px; border-bottom: 1px solid var(--border); text-align: center;">' +
            '<button class="toolbar-btn btn-primary" style="padding: 2px 8px; font-size: 0.72rem;" data-va-save-precip="' +
            r.id +
            '">保存</button>' +
            '<button class="toolbar-btn btn-danger" style="padding: 2px 6px; font-size: 0.72rem; margin-left: 4px;" data-va-del-precip="' +
            r.id +
            '">删</button>' +
            "</td></tr>";
        }
        html += "</tbody></table></div>";
      }
      html +=
        '<p style="font-size: 0.78rem; color: var(--text-secondary); margin-top: 8px;">沉淀规则来源：Supabase ev_precipitation_rules 表，编辑后即时生效。每日沉淀时AI会按照这些维度进行分析。</p>';
      container.innerHTML = html;

      // 绑定刷新
      document
        .getElementById("vaPrecipRulesRefreshBtn")
        .addEventListener("click", () => this.renderVAPrecipRules());

      document
        .getElementById("vaPrecipAddBtn")
        .addEventListener("click", async () => {
          const dim = document.getElementById("vaPrecipNewDim").value.trim();
          const priority =
            parseInt(document.getElementById("vaPrecipNewPriority").value) || 5;
          const prompt = document
            .getElementById("vaPrecipNewPrompt")
            .value.trim();
          if (!dim) {
            this.showToast("维度名称不能为空", "error");
            return;
          }
          const btn = document.getElementById("vaPrecipAddBtn");
          btn.textContent = "保存中...";
          btn.disabled = true;
          try {
            await supabaseClient
              .from("ev_precipitation_rules")
              .insert({ dimension: dim, priority, prompt });
            this.showToast("已添加", "success");
            this.renderVAPrecipRules();
          } catch (e) {
            this.showToast("添加失败: " + e.message, "error");
            btn.textContent = "添加";
            btn.disabled = false;
          }
        });

      container.querySelectorAll("[data-va-save-precip]").forEach((btn) => {
        btn.addEventListener("click", async () => {
          const id = btn.getAttribute("data-va-save-precip");
          const row = document.getElementById("vaPrecipRow-" + id);
          if (!row) return;
          const dimInput = row.querySelector(".va-precip-dim");
          const priorityInput = row.querySelector(".va-precip-priority");
          const promptInput = row.querySelector(".va-precip-prompt");
          btn.textContent = "保存中...";
          btn.disabled = true;
          try {
            await supabaseClient
              .from("ev_precipitation_rules")
              .update({
                dimension: dimInput ? dimInput.value : "",
                priority: priorityInput
                  ? parseInt(priorityInput.value) || 5
                  : 5,
                prompt: promptInput ? promptInput.value : "",
              })
              .eq("id", id);
            this.showToast("已保存", "success");
            btn.textContent = "保存";
            btn.disabled = false;
          } catch (e) {
            this.showToast("保存失败: " + e.message, "error");
            btn.textContent = "保存";
            btn.disabled = false;
          }
        });
      });

      container.querySelectorAll("[data-va-del-precip]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const id = btn.getAttribute("data-va-del-precip");
          this.promptDelete("vaPrecipRules", id, "沉淀规则 #" + id);
        });
      });
    } catch (e) {
      container.innerHTML =
        '<p style="color: var(--danger);">加载失败: ' +
        this._esc(e.message) +
        "</p>";
    }
  }

  // ============ 记忆库 ============
  async renderVAMemory() {
    const container = document.getElementById("vaMemoryContainer");
    if (!supabaseClient) {
      container.innerHTML =
        '<p style="color: var(--text-secondary);">Supabase 未连接</p>';
      return;
    }
    container.innerHTML =
      '<p style="color: var(--text-secondary);">加载中...</p>';
    try {
      const { data, error } = await supabaseClient
        .from("ev_user_memory")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      if (!data || data.length === 0) {
        container.innerHTML =
          '<div style="padding: 20px; text-align: center; color: var(--text-secondary);">暂无记忆记录。当依维和用户对话累积后，这里会出现长期记忆。</div>';
        return;
      }
      let html =
        '<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">' +
        '<h3 style="margin: 0; font-size: 1rem;">🧠 记忆库</h3>' +
        '<button class="toolbar-btn btn-secondary" id="vaMemoryRefreshBtn" style="font-size: 0.82rem;">⟳ 刷新</button>' +
        "</div>" +
        '<div style="overflow-x: auto;"><table style="width: 100%; border-collapse: collapse; font-size: 0.82rem;">' +
        "<thead><tr>" +
        '<th style="padding: 8px; border-bottom: 2px solid var(--border); text-align: left;">时间</th>' +
        '<th style="padding: 8px; border-bottom: 2px solid var(--border); text-align: left;">关键词</th>' +
        '<th style="padding: 8px; border-bottom: 2px solid var(--border); text-align: left;">摘要</th>' +
        '<th style="padding: 8px; border-bottom: 2px solid var(--border); text-align: left;">记忆内容</th>' +
        '<th style="padding: 8px; border-bottom: 2px solid var(--border); text-align: center; width: 60px;">操作</th>' +
        "</tr></thead><tbody>";
      for (const m of data) {
        html +=
          "<tr>" +
          '<td style="padding: 6px 8px; border-bottom: 1px solid var(--border); white-space: nowrap;">' +
          this._fmtDT(m.created_at) +
          "</td>" +
          '<td style="padding: 6px 8px; border-bottom: 1px solid var(--border); font-weight: 500;">' +
          this._esc(m.memory_key) +
          "</td>" +
          '<td style="padding: 6px 8px; border-bottom: 1px solid var(--border); font-size: 0.78rem; color: var(--text-secondary); max-width: 150px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">' +
          this._esc(m.memory_summary || "") +
          "</td>" +
          '<td style="padding: 6px 8px; border-bottom: 1px solid var(--border);">' +
          this._esc(m.memory_value) +
          "</td>" +
          '<td style="padding: 6px 8px; border-bottom: 1px solid var(--border); text-align: center;">' +
          '<button class="toolbar-btn btn-danger" style="padding: 2px 8px; font-size: 0.75rem;" data-va-delete-memory="' +
          m.id +
          '">删除</button>' +
          "</td>" +
          "</tr>";
      }
      html += "</tbody></table></div>";
      container.innerHTML = html;
      // 绑定刷新
      document
        .getElementById("vaMemoryRefreshBtn")
        .addEventListener("click", () => this.renderVAMemory());
      // 绑定删除事件
      container.querySelectorAll("[data-va-delete-memory]").forEach((btn) => {
        btn.addEventListener("click", async () => {
          const id = btn.getAttribute("data-va-delete-memory");
          try {
            await supabaseClient.from("ev_user_memory").delete().eq("id", id);
            this.showToast("已删除", "success");
            this.renderVAMemory();
          } catch (e) {
            this.showToast("删除失败: " + e.message, "error");
          }
        });
      });
    } catch (e) {
      container.innerHTML =
        '<p style="color: var(--danger);">加载失败: ' +
        this._esc(e.message) +
        "</p>";
    }
  }

  // ============ 错误库 ============
  async renderVAErrors() {
    const container = document.getElementById("vaErrorsContainer");
    if (!supabaseClient) {
      container.innerHTML =
        '<p style="color: var(--text-secondary);">Supabase 未连接</p>';
      return;
    }
    // 表单区 + 列表区
    let html =
      '<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">' +
      '<h3 style="margin: 0; font-size: 1rem;">❌ 错误库</h3>' +
      '<button class="toolbar-btn btn-secondary" id="vaErrorsRefreshBtn" style="font-size: 0.82rem;">⟳ 刷新</button>' +
      "</div>" +
      '<div style="padding: 16px; border: 1px solid var(--border); border-radius: 6px; margin-bottom: 20px;">' +
      '<h3 style="margin: 0 0 12px; font-size: 0.95rem;">✏️ 教依维改进（写入后下次对话自动生效）</h3>' +
      '<div style="display: flex; flex-direction: column; gap: 8px;">' +
      '<div style="display: flex; gap: 8px;">' +
      '<input id="vaErrType" placeholder="问题类型（如：回复太报表化）" style="flex: 1; padding: 6px 10px; border: 1px solid var(--border); border-radius: 3px; font-size: 0.82rem; background: var(--bg); color: var(--text);">' +
      "</div>" +
      '<textarea id="vaErrUserInput" placeholder="用户当时的提问（可选）" style="width: 100%; min-height: 40px; padding: 6px 10px; border: 1px solid var(--border); border-radius: 3px; font-size: 0.82rem; background: var(--bg); color: var(--text); box-sizing: border-box; resize: vertical; font-family: inherit;"></textarea>' +
      '<textarea id="vaErrResponse" placeholder="依维当时不合适的回答（可选）" style="width: 100%; min-height: 40px; padding: 6px 10px; border: 1px solid var(--border); border-radius: 3px; font-size: 0.82rem; background: var(--bg); color: var(--text); box-sizing: border-box; resize: vertical; font-family: inherit;"></textarea>' +
      '<textarea id="vaErrFix" placeholder="告诉依维以后应该怎么做（必填）" style="width: 100%; min-height: 56px; padding: 6px 10px; border: 1px solid var(--border); border-radius: 3px; font-size: 0.82rem; background: var(--bg); color: var(--text); box-sizing: border-box; resize: vertical; font-family: inherit;"></textarea>' +
      '<div style="display: flex; justify-content: flex-end;">' +
      '<button id="vaAddErrorBtn" class="toolbar-btn btn-primary" style="border-radius: 3px;">💾 写入错误库</button>' +
      "</div>" +
      "</div>" +
      "</div>" +
      '<div id="vaErrorsList"><p style="color: var(--text-secondary);">加载中...</p></div>';
    container.innerHTML = html;
    // 绑定刷新
    document
      .getElementById("vaErrorsRefreshBtn")
      .addEventListener("click", () => this.renderVAErrors());
    // 绑定提交
    document
      .getElementById("vaAddErrorBtn")
      .addEventListener("click", async () => {
        const fix = document.getElementById("vaErrFix").value.trim();
        if (!fix) {
          this.showToast("改进方向必填", "error");
          return;
        }
        const btn = document.getElementById("vaAddErrorBtn");
        btn.textContent = "保存中...";
        btn.disabled = true;
        try {
          await supabaseClient.from("ev_errors").insert({
            error_type:
              document.getElementById("vaErrType").value.trim() || "手动标注",
            user_input:
              document.getElementById("vaErrUserInput").value.trim() || null,
            ai_response:
              document.getElementById("vaErrResponse").value.trim() || null,
            fix_suggest: fix,
          });
          this.showToast("已写入，下次对话自动生效", "success");
          this.renderVAErrors();
        } catch (e) {
          this.showToast("保存失败: " + e.message, "error");
          btn.textContent = "💾 写入错误库";
          btn.disabled = false;
        }
      });
    // 加载列表
    try {
      const { data, error } = await supabaseClient
        .from("ev_errors")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      if (!data || data.length === 0) {
        document.getElementById("vaErrorsList").innerHTML =
          '<div style="padding: 20px; text-align: center; color: var(--text-secondary);">暂无错误记录。在上面教你发现依维"不像人"的地方，她会记住并改进。</div>';
        return;
      }
      let listHtml =
        '<div style="display: flex; flex-direction: column; gap: 12px;">';
      for (const e of data) {
        listHtml +=
          '<div style="padding: 14px; border: 1px solid var(--border); border-radius: 6px; font-size: 0.83rem;">' +
          '<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">' +
          '<span style="font-weight: 600; color: var(--danger);">' +
          (e.error_type || "未分类") +
          "</span>" +
          '<span style="font-size: 0.75rem; color: var(--text-secondary);">' +
          this._fmtDT(e.created_at) +
          "</span>" +
          '<button class="toolbar-btn btn-danger" style="padding: 2px 8px; font-size: 0.72rem;" data-va-delete-error="' +
          e.id +
          '">删除</button>' +
          "</div>" +
          '<div style="margin-bottom: 6px;"><span style="color: var(--text-secondary);">用户问题：</span>' +
          this._esc(e.user_input || "") +
          "</div>" +
          '<div style="margin-bottom: 6px;"><span style="color: var(--text-secondary);">依维回答：</span>' +
          this._esc(e.ai_response || "") +
          "</div>" +
          '<div style="margin-bottom: 6px;"><span style="color: var(--text-secondary);">改进方向：</span>' +
          this._esc(e.fix_suggest || "待分析") +
          "</div>" +
          "</div>";
      }
      listHtml += "</div>";
      document.getElementById("vaErrorsList").innerHTML = listHtml;
      document.querySelectorAll("[data-va-delete-error]").forEach((btn) => {
        btn.addEventListener("click", async () => {
          const id = btn.getAttribute("data-va-delete-error");
          try {
            await supabaseClient.from("ev_errors").delete().eq("id", id);
            this.showToast("已删除", "success");
            this.renderVAErrors();
          } catch (e2) {
            this.showToast("删除失败: " + e2.message, "error");
          }
        });
      });
    } catch (e) {
      document.getElementById("vaErrorsList").innerHTML =
        '<p style="color: var(--danger);">加载失败: ' +
        this._esc(e.message) +
        "</p>";
    }
  }

  // ============ 情感趋势 ============
  async renderVAEmotion() {
    const container = document.getElementById("vaEmotionContainer");
    if (!supabaseClient) {
      container.innerHTML =
        '<p style="color: var(--text-secondary);">Supabase 未连接</p>';
      return;
    }
    container.innerHTML =
      '<p style="color: var(--text-secondary);">加载中...</p>';
    try {
      const { data, error } = await supabaseClient
        .from("ev_emotion_log")
        .select("*")
        .order("date", { ascending: false })
        .limit(30);
      if (error) throw error;
      if (!data || data.length === 0) {
        container.innerHTML =
          '<div style="padding: 20px; text-align: center; color: var(--text-secondary);">暂无情感趋势记录。每日沉淀运行后会自动生成。</div>';
        return;
      }
      let html =
        '<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">' +
        '<h3 style="margin: 0; font-size: 1rem;">💗 情感趋势</h3>' +
        '<button class="toolbar-btn btn-secondary" id="vaEmotionRefreshBtn" style="font-size: 0.82rem;">⟳ 刷新</button>' +
        "</div>" +
        '<div style="overflow-x: auto;"><table style="width: 100%; border-collapse: collapse; font-size: 0.82rem;">' +
        "<thead><tr>" +
        '<th style="padding: 8px; border-bottom: 2px solid var(--border); text-align: left;">日期</th>' +
        '<th style="padding: 8px; border-bottom: 2px solid var(--border); text-align: left;">情感总结</th>' +
        "</tr></thead><tbody>";
      for (const r of data) {
        html +=
          "<tr>" +
          '<td style="padding: 6px 8px; border-bottom: 1px solid var(--border); white-space: nowrap; font-weight: 500;">' +
          (r.date || "-") +
          "</td>" +
          '<td style="padding: 6px 8px; border-bottom: 1px solid var(--border);">' +
          this._esc(r.summary || "") +
          "</td>" +
          "</tr>";
      }
      html += "</tbody></table></div>";
      container.innerHTML = html;
      // 绑定刷新
      document
        .getElementById("vaEmotionRefreshBtn")
        .addEventListener("click", () => this.renderVAEmotion());
    } catch (e) {
      container.innerHTML =
        '<p style="color: var(--danger);">加载失败: ' +
        this._esc(e.message) +
        "</p>";
    }
  }

  // ============ 对话日志 ============
  async renderVALogs() {
    const container = document.getElementById("vaLogsContainer");
    if (!supabaseClient) {
      container.innerHTML =
        '<p style="color: var(--text-secondary);">Supabase 未连接</p>';
      return;
    }
    container.innerHTML =
      '<p style="color: var(--text-secondary);">加载中...</p>';
    try {
      const { data, error } = await supabaseClient
        .from("ev_chat_logs")
        .select("id, user_message, ai_response, created_at, session_id")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      if (!data || data.length === 0) {
        container.innerHTML =
          '<p style="color: var(--text-secondary);">暂无对话记录</p>';
        return;
      }
      let html =
        '<div style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px;">' +
        '<button id="vaLogsSelectAll" class="toolbar-btn btn-secondary" style="font-size: 0.78rem; padding: 4px 12px;">☑ 全选</button>' +
        '<button id="vaLogsDeselectAll" class="toolbar-btn btn-secondary" style="font-size: 0.78rem; padding: 4px 12px;">☐ 取消全选</button>' +
        '<span style="flex: 1;"></span>' +
        '<button id="vaLogsRefreshBtn" class="toolbar-btn btn-secondary" style="font-size: 0.78rem;">⟳ 刷新</button>' +
        '<button id="vaLogsSummaryBtn" class="toolbar-btn btn-primary" style="border-radius: 3px;">🔍 总结选中</button>' +
        '<button id="vaLogsBatchDelBtn" class="toolbar-btn btn-danger" style="border-radius: 3px;">🗑 批量删除</button>' +
        "</div>" +
        '<div id="vaLogsSummaryResult" style="display: none; padding: 16px; border: 2px solid var(--primary); border-radius: 6px; margin-bottom: 12px; font-size: 0.84rem; line-height: 1.7; white-space: pre-wrap;"></div>' +
        '<div style="overflow-x: auto;"><table style="width: 100%; border-collapse: collapse; font-size: 0.82rem;">' +
        "<thead><tr>" +
        '<th style="text-align: center; padding: 8px; border-bottom: 2px solid var(--border); width: 36px;">选</th>' +
        '<th style="text-align: left; padding: 8px; border-bottom: 2px solid var(--border);">时间</th>' +
        '<th style="text-align: left; padding: 8px; border-bottom: 2px solid var(--border); width: 100px;">会话ID</th>' +
        '<th style="text-align: left; padding: 8px; border-bottom: 2px solid var(--border);">用户问题</th>' +
        '<th style="text-align: left; padding: 8px; border-bottom: 2px solid var(--border);">AI 回答</th>' +
        '<th style="text-align: center; padding: 8px; border-bottom: 2px solid var(--border); width: 60px;">操作</th>' +
        "</tr></thead><tbody>";
      for (const log of data) {
        html +=
          "<tr>" +
          '<td style="padding: 4px 8px; border-bottom: 1px solid var(--border); text-align: center;">' +
          '<input type="checkbox" class="va-log-check" data-log-id="' +
          log.id +
          '" data-user-msg="' +
          this._escAttr(log.user_message) +
          '" data-ai-resp="' +
          this._escAttr(log.ai_response) +
          '">' +
          "</td>" +
          '<td style="padding: 6px 8px; border-bottom: 1px solid var(--border); white-space: nowrap;">' +
          this._fmtDT(log.created_at) +
          "</td>" +
          '<td style="padding: 6px 8px; border-bottom: 1px solid var(--border); font-family: monospace; font-size: 0.75rem; color: var(--text-secondary); white-space: nowrap; max-width: 100px; overflow: hidden; text-overflow: ellipsis;" title="' +
          this._escAttr(log.session_id || "") +
          '">' +
          this._esc(log.session_id || "-") +
          "</td>" +
          '<td style="padding: 6px 8px; border-bottom: 1px solid var(--border); max-width: 160px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="' +
          this._esc(log.user_message) +
          '">' +
          this._esc(log.user_message) +
          "</td>" +
          '<td style="padding: 6px 8px; border-bottom: 1px solid var(--border); max-width: 240px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="' +
          this._esc(log.ai_response) +
          '">' +
          this._esc(log.ai_response) +
          "</td>" +
          '<td style="padding: 6px 8px; border-bottom: 1px solid var(--border); text-align: center;">' +
          '<button class="toolbar-btn btn-danger" style="padding: 2px 8px; font-size: 0.75rem;" data-va-delete-log="' +
          log.id +
          '">删除</button>' +
          "</td>" +
          "</tr>";
      }
      html += "</tbody></table></div>";
      container.innerHTML = html;

      // 绑定刷新
      document
        .getElementById("vaLogsRefreshBtn")
        .addEventListener("click", () => this.renderVALogs());

      // 全选/取消
      document
        .getElementById("vaLogsSelectAll")
        .addEventListener("click", () => {
          container.querySelectorAll(".va-log-check").forEach((cb) => {
            cb.checked = true;
          });
        });
      document
        .getElementById("vaLogsDeselectAll")
        .addEventListener("click", () => {
          container.querySelectorAll(".va-log-check").forEach((cb) => {
            cb.checked = false;
          });
        });

      // 总结选中
      document
        .getElementById("vaLogsSummaryBtn")
        .addEventListener("click", async () => {
          const checks = container.querySelectorAll(".va-log-check:checked");
          if (checks.length === 0) {
            this.showToast("请先勾选要总结的记录", "error");
            return;
          }
          const logs = [];
          checks.forEach((cb) => {
            logs.push({
              user: cb.getAttribute("data-user-msg") || "",
              ai: cb.getAttribute("data-ai-resp") || "",
            });
          });
          const resultDiv = document.getElementById("vaLogsSummaryResult");
          resultDiv.style.display = "";
          resultDiv.innerHTML = "AI 分析中...";
          try {
            const summary = await this._summaryVALogs(logs);
            resultDiv.innerHTML =
              '<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">' +
              "<strong>分析结果（共 " +
              logs.length +
              " 条对话）</strong>" +
              '<button id="vaCopySummaryBtn" class="toolbar-btn btn-secondary" style="font-size: 0.78rem; padding: 4px 12px;">📋 一键复制到错误库</button>' +
              "</div>" +
              summary.replace(/\n/g, "<br>");
            document
              .getElementById("vaCopySummaryBtn")
              .addEventListener("click", () => {
                // 切换到错误库标签，预填改进方向
                document.getElementById("vaTabErrors").click();
                setTimeout(() => {
                  const fixEl = document.getElementById("vaErrFix");
                  if (fixEl) fixEl.value = summary;
                }, 300);
              });
          } catch (e) {
            resultDiv.innerHTML =
              '<span style="color: var(--danger);">分析失败: ' +
              this._esc(e.message) +
              "</span>";
          }
        });

      // 批量删除
      document
        .getElementById("vaLogsBatchDelBtn")
        .addEventListener("click", () => {
          const checks = container.querySelectorAll(".va-log-check:checked");
          if (checks.length === 0) {
            this.showToast("请先勾选要删除的记录", "error");
            return;
          }
          const ids = [];
          checks.forEach((cb) => ids.push(cb.getAttribute("data-log-id")));
          this.promptDelete(
            "batchVaChatLog",
            ids,
            "批量删除 " + ids.length + " 条对话记录",
          );
        });

      // 绑定删除事件
      container.querySelectorAll("[data-va-delete-log]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const id = btn.getAttribute("data-va-delete-log");
          this.promptDelete("vaChatLog", id, "对话记录");
        });
      });
    } catch (e) {
      container.innerHTML =
        '<p style="color: var(--danger);">加载失败: ' +
        this._esc(e.message) +
        "</p>";
    }
  }

  // ============ 函数技能库（可编辑） ============
  async renderVAFunctions() {
    const container = document.getElementById("vaFunctionsContainer");
    if (!supabaseClient) {
      container.innerHTML =
        '<p style="color: var(--text-secondary);">Supabase 未连接</p>';
      return;
    }
    container.innerHTML =
      '<p style="color: var(--text-secondary);">加载中...</p>';
    try {
      const { data, error } = await supabaseClient
        .from("ev_functions")
        .select("*")
        .order("sort", { ascending: true });
      if (error) {
        // 表可能不存在
        if (
          error.code === "42P01" ||
          error.message?.includes("does not exist")
        ) {
          container.innerHTML =
            '<div style="padding: 20px; text-align: center; color: var(--text-secondary);">' +
            "<p>ev_functions 表未创建。</p>" +
            '<p style="font-size: 0.82rem;">请在 Supabase SQL Editor 中执行 migrations/ev_functions.sql</p>' +
            "</div>";
          return;
        }
        throw error;
      }

      if (!data || data.length === 0) {
        container.innerHTML =
          '<div style="padding: 20px; text-align: center; color: var(--text-secondary);">' +
          "<p>暂无函数定义。</p>" +
          '<button id="vaFuncSeedBtn" class="toolbar-btn btn-primary" style="margin-top: 12px; border-radius: 3px;">🌱 初始化默认函数</button>' +
          "</div>";
        document
          .getElementById("vaFuncSeedBtn")
          .addEventListener("click", async () => {
            const defaults = [
              {
                function_name: "query_knowledge_base",
                cn_name: "知识库",
                description: "获取展馆知识库内容（介绍、规则等静态文本信息）",
                parameters: { type: "object", properties: {}, required: [] },
                sort: 1,
              },
              {
                function_name: "query_projects",
                cn_name: "项目列表",
                description: "获取展陈项目列表（项目名称、品牌、描述等）",
                parameters: { type: "object", properties: {}, required: [] },
                sort: 2,
              },
              {
                function_name: "query_brands",
                cn_name: "品牌列表",
                description: "获取所有品牌列表（如水墨江南、欣旺等）",
                parameters: { type: "object", properties: {}, required: [] },
                sort: 3,
              },
              {
                function_name: "query_sample_categories",
                cn_name: "样品品类",
                description:
                  "获取所有样品品类/品名列表（如木地板、染色枫木、胡桃木等）",
                parameters: { type: "object", properties: {}, required: [] },
                sort: 4,
              },
              {
                function_name: "query_sample_stats",
                cn_name: "样品统计",
                description: "获取样品统计数据（样品总数、品类数量、品牌数量）",
                parameters: { type: "object", properties: {}, required: [] },
                sort: 5,
              },
              {
                function_name: "search_samples",
                cn_name: "样品搜索",
                description: "按品牌、品类、关键词搜索样品详情",
                parameters: {
                  type: "object",
                  properties: {
                    brand: {
                      type: "string",
                      description: "品牌名称筛选（可选）",
                    },
                    category: {
                      type: "string",
                      description: "品类/品名筛选（可选）",
                    },
                    keyword: {
                      type: "string",
                      description: "搜索关键词（可选）",
                    },
                  },
                  required: [],
                },
                sort: 6,
              },
              {
                function_name: "query_visitors",
                cn_name: "访客记录",
                description:
                  "获取访客/来访记录（来展馆参观的人），包括姓名、公司、电话、来访日期",
                parameters: {
                  type: "object",
                  properties: {
                    limit: {
                      type: "number",
                      description: "返回条数（默认10）",
                    },
                  },
                  required: [],
                },
                sort: 7,
              },
              {
                function_name: "query_apply_records",
                cn_name: "申请记录",
                description:
                  "获取申请记录（包括借还、参观、运输等各种类型的申请），包括申请人姓名、公司、电话、申请类型、来访日期、状态等",
                parameters: {
                  type: "object",
                  properties: {
                    type: {
                      type: "string",
                      description:
                        "申请类型筛选：'参观'=访客来访, '借还'=借还样品, '运输'=运输, '其他'",
                    },
                    limit: {
                      type: "number",
                      description: "返回条数（默认20）",
                    },
                  },
                  required: [],
                },
                sort: 8,
              },
              {
                function_name: "query_orders",
                cn_name: "订单信息",
                description:
                  "获取订单信息（订单号、客户姓名、电话、公司、项目、状态等）",
                parameters: {
                  type: "object",
                  properties: {
                    status: {
                      type: "string",
                      description: "订单状态筛选：'已收档'或'未提交'",
                    },
                  },
                  required: [],
                },
                sort: 9,
              },
            ];
            for (const fn of defaults) {
              await supabaseClient
                .from("ev_functions")
                .upsert(fn, { onConflict: "function_name" });
            }
            this.showToast("默认函数已初始化", "success");
            this.renderVAFunctions();
          });
        return;
      }

      let html = "";
      // 顶部操作栏 + 刷新
      html +=
        '<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">' +
        '<div style="font-size: 0.82rem; color: var(--text-secondary);">AI 可调用的 <strong>' +
        data.length +
        "</strong> 个工具函数</div>" +
        '<button class="toolbar-btn btn-secondary" id="vaFunctionsRefreshBtn" style="font-size: 0.82rem;">⟳ 刷新</button>' +
        "</div>";

      // 新增表单
      html +=
        '<div style="padding: 14px; border: 2px solid var(--primary); border-radius: 6px; margin-bottom: 20px; background: var(--bg-secondary);">' +
        '<h3 style="margin: 0 0 10px; font-size: 0.95rem;">➕ 新增函数</h3>' +
        '<div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: flex-end;">' +
        '<div style="flex: 1; min-width: 130px;"><label style="font-size: 0.78rem; color: var(--text-secondary);">函数名</label>' +
        '<input id="vaFuncNewName" placeholder="如 get_user_info" style="width: 100%; padding: 6px; border: 1px solid var(--border); border-radius: 3px; font-size: 0.82rem; background: var(--bg); color: var(--text); box-sizing: border-box;"></div>' +
        '<div style="width: 100px;"><label style="font-size: 0.78rem; color: var(--text-secondary);">中文名</label>' +
        '<input id="vaFuncNewCN" placeholder="用户信息" style="width: 100%; padding: 6px; border: 1px solid var(--border); border-radius: 3px; font-size: 0.82rem; background: var(--bg); color: var(--text); box-sizing: border-box;"></div>' +
        '<div style="flex: 2; min-width: 200px;"><label style="font-size: 0.78rem; color: var(--text-secondary);">描述</label>' +
        '<input id="vaFuncNewDesc" placeholder="告诉AI此函数的用途" style="width: 100%; padding: 6px; border: 1px solid var(--border); border-radius: 3px; font-size: 0.82rem; background: var(--bg); color: var(--text); box-sizing: border-box;"></div>' +
        '<div style="width: 60px;"><label style="font-size: 0.78rem; color: var(--text-secondary);">排序</label>' +
        '<input id="vaFuncNewSort" type="number" value="99" style="width: 100%; padding: 6px; border: 1px solid var(--border); border-radius: 3px; font-size: 0.82rem; background: var(--bg); color: var(--text); box-sizing: border-box;"></div>' +
        '<button id="vaFuncAddBtn" class="toolbar-btn btn-primary" style="border-radius: 3px; height: 32px;">添加</button>' +
        "</div></div>";

      html +=
        '<div style="overflow-x: auto;"><table style="width: 100%; font-size: 0.83rem; border-collapse: collapse;"><thead><tr style="background: var(--bg-secondary);">' +
        '<th style="padding: 8px; border-bottom: 2px solid var(--border); text-align: left;">函数名</th>' +
        '<th style="padding: 8px; border-bottom: 2px solid var(--border); text-align: left;">中文名</th>' +
        '<th style="padding: 8px; border-bottom: 2px solid var(--border); text-align: left;">描述</th>' +
        '<th style="padding: 8px; border-bottom: 2px solid var(--border); text-align: center; width: 60px;">状态</th>' +
        '<th style="padding: 8px; border-bottom: 2px solid var(--border); text-align: center; width: 60px;">排序</th>' +
        '<th style="padding: 8px; border-bottom: 2px solid var(--border); text-align: center; width: 100px;">操作</th>' +
        "</tr></thead><tbody>";

      for (const fn of data) {
        const enabled = fn.is_enabled !== false;
        html +=
          '<tr id="vaFuncRow-' +
          fn.id +
          '">' +
          '<td style="padding: 6px 8px; border-bottom: 1px solid var(--border); font-family: monospace; font-size: 0.82rem; font-weight: 500;">' +
          '<input class="va-func-name" data-id="' +
          fn.id +
          '" value="' +
          this._escAttr(fn.function_name || "") +
          "\" style=\"width: 100%; padding: 4px 8px; border: 1px solid transparent; border-radius: 3px; font-size: 0.82rem; background: transparent; color: var(--text); box-sizing: border-box; font-family: monospace;\" onfocus=\"this.style.borderColor='var(--primary)';this.style.background='var(--bg-secondary)'\" onblur=\"this.style.borderColor='transparent';this.style.background='transparent'\">" +
          "</td>" +
          '<td style="padding: 6px 8px; border-bottom: 1px solid var(--border);">' +
          '<input class="va-func-cn" data-id="' +
          fn.id +
          '" value="' +
          this._escAttr(fn.cn_name || "") +
          "\" style=\"width: 100%; padding: 4px 8px; border: 1px solid transparent; border-radius: 3px; font-size: 0.82rem; background: transparent; color: var(--text); box-sizing: border-box;\" onfocus=\"this.style.borderColor='var(--primary)';this.style.background='var(--bg-secondary)'\" onblur=\"this.style.borderColor='transparent';this.style.background='transparent'\">" +
          "</td>" +
          '<td style="padding: 6px 8px; border-bottom: 1px solid var(--border);">' +
          '<textarea class="va-func-desc" data-id="' +
          fn.id +
          "\" style=\"width: 100%; padding: 4px 8px; border: 1px solid transparent; border-radius: 3px; font-size: 0.82rem; background: transparent; color: var(--text); box-sizing: border-box; resize: vertical; font-family: inherit; min-height: 28px;\" onfocus=\"this.style.borderColor='var(--primary)';this.style.background='var(--bg-secondary)'\" onblur=\"this.style.borderColor='transparent';this.style.background='transparent'\">" +
          this._esc(fn.description || "") +
          "</textarea>" +
          "</td>" +
          '<td style="padding: 6px 8px; border-bottom: 1px solid var(--border); text-align: center;">' +
          '<button class="toolbar-btn ' +
          (enabled ? "btn-primary" : "btn-danger") +
          ' va-func-toggle" data-id="' +
          fn.id +
          '" data-enabled="' +
          enabled +
          '" style="padding: 2px 8px; font-size: 0.72rem;">' +
          (enabled ? "✓" : "✗") +
          "</button>" +
          "</td>" +
          '<td style="padding: 6px 8px; border-bottom: 1px solid var(--border); text-align: center;">' +
          '<input class="va-func-sort" data-id="' +
          fn.id +
          '" type="number" value="' +
          (fn.sort || 99) +
          "\" style=\"width: 48px; padding: 4px; border: 1px solid transparent; border-radius: 3px; font-size: 0.78rem; background: transparent; color: var(--text); text-align: center;\" onfocus=\"this.style.borderColor='var(--primary)';this.style.background='var(--bg-secondary)'\" onblur=\"this.style.borderColor='transparent';this.style.background='transparent'\">" +
          "</td>" +
          '<td style="padding: 6px 8px; border-bottom: 1px solid var(--border); text-align: center;">' +
          '<button class="toolbar-btn btn-primary" style="padding: 2px 8px; font-size: 0.72rem;" data-va-save-func="' +
          fn.id +
          '">保存</button>' +
          '<button class="toolbar-btn btn-danger" style="padding: 2px 6px; font-size: 0.72rem; margin-left: 4px;" data-va-del-func="' +
          fn.id +
          '">删</button>' +
          "</td></tr>";
      }
      html += "</tbody></table></div>";
      html +=
        '<p style="font-size: 0.78rem; color: var(--text-secondary); margin-top: 8px;">函数技能库来源：Supabase ev_functions 表，修改后下一次对话自动生效。禁用/启用即时生效。注意：函数名修改后需在服务端代码中同步更新 TOOL_HANDLERS 映射。</p>';
      container.innerHTML = html;

      // 绑定刷新
      document
        .getElementById("vaFunctionsRefreshBtn")
        .addEventListener("click", () => this.renderVAFunctions());

      // 绑定添加
      document
        .getElementById("vaFuncAddBtn")
        .addEventListener("click", async () => {
          const name = document.getElementById("vaFuncNewName").value.trim();
          const cn = document.getElementById("vaFuncNewCN").value.trim();
          const desc = document.getElementById("vaFuncNewDesc").value.trim();
          const sort =
            parseInt(document.getElementById("vaFuncNewSort").value) || 99;
          if (!name || !desc) {
            this.showToast("函数名和描述不能为空", "error");
            return;
          }
          const btn = document.getElementById("vaFuncAddBtn");
          btn.textContent = "保存中...";
          btn.disabled = true;
          try {
            await supabaseClient.from("ev_functions").insert({
              function_name: name,
              cn_name: cn || name,
              description: desc,
              parameters: { type: "object", properties: {}, required: [] },
              sort,
            });
            this.showToast(
              "已添加（需在服务端添加 TOOL_HANDLER 才能执行）",
              "success",
            );
            this.renderVAFunctions();
          } catch (e) {
            this.showToast("添加失败: " + e.message, "error");
            btn.textContent = "添加";
            btn.disabled = false;
          }
        });

      // 绑定保存
      container.querySelectorAll("[data-va-save-func]").forEach((btn) => {
        btn.addEventListener("click", async () => {
          const id = btn.getAttribute("data-va-save-func");
          const row = document.getElementById("vaFuncRow-" + id);
          if (!row) return;
          const nameInput = row.querySelector(".va-func-name");
          const cnInput = row.querySelector(".va-func-cn");
          const descInput = row.querySelector(".va-func-desc");
          const sortInput = row.querySelector(".va-func-sort");
          btn.textContent = "保存中...";
          btn.disabled = true;
          try {
            await supabaseClient
              .from("ev_functions")
              .update({
                function_name: nameInput ? nameInput.value : "",
                cn_name: cnInput ? cnInput.value : "",
                description: descInput ? descInput.value : "",
                sort: sortInput ? parseInt(sortInput.value) || 99 : 99,
              })
              .eq("id", id);
            this.showToast("已保存", "success");
            btn.textContent = "保存";
            btn.disabled = false;
          } catch (e) {
            this.showToast("保存失败: " + e.message, "error");
            btn.textContent = "保存";
            btn.disabled = false;
          }
        });
      });

      // 绑定删除
      container.querySelectorAll("[data-va-del-func]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const id = btn.getAttribute("data-va-del-func");
          this.promptDelete("vaFunction", id, "函数 #" + id);
        });
      });

      // 绑定启用/禁用
      container.querySelectorAll(".va-func-toggle").forEach((btn) => {
        btn.addEventListener("click", async () => {
          const id = btn.getAttribute("data-id");
          const enabled = btn.getAttribute("data-enabled") === "true";
          try {
            await supabaseClient
              .from("ev_functions")
              .update({ is_enabled: !enabled })
              .eq("id", id);
            this.showToast(enabled ? "已禁用" : "已启用", "success");
            this.renderVAFunctions();
          } catch (e) {
            this.showToast("操作失败: " + e.message, "error");
          }
        });
      });
    } catch (e) {
      container.innerHTML =
        '<p style="color: var(--danger);">加载失败: ' +
        this._esc(e.message) +
        "</p>";
    }
  }

  // ===================== 本能库 - 自然语言规则 =====================
  async renderVAInstincts() {
    const container = document.getElementById("vaInstinctsContainer");
    if (!supabaseClient) {
      container.innerHTML =
        '<p style="color: var(--text-secondary);">Supabase 未连接</p>';
      return;
    }
    container.innerHTML =
      '<p style="color: var(--text-secondary);">加载中...</p>';
    try {
      const { data, error } = await supabaseClient
        .from("ev_instincts")
        .select("*")
        .order("priority", { ascending: false });

      if (error) throw error;

      const rows = data || [];

      let html = "";
      html +=
        '<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">' +
        '<h3 style="margin: 0; font-size: 1rem;">⚡ 本能库（' +
        rows.length +
        " 条）</h3>" +
        '<div style="display: flex; gap: 4px;">' +
        '<button id="vaInstinctsAddBtn" class="toolbar-btn btn-primary" style="font-size: 0.82rem;">＋ 新增</button>' +
        '<button id="vaInstinctsRefreshBtn" class="toolbar-btn btn-secondary" style="font-size: 0.82rem;">⟳ 刷新</button>' +
        "</div></div>";

      html +=
        '<div style="padding: 12px; border-left: 3px solid var(--primary); font-size: 0.82rem; background: var(--bg-secondary); margin-bottom: 14px;">' +
        "每条规则就是一句自然语言描述，LLM 会在对话中自动感知并反应。无需写正则或编程。</div>";

      if (rows.length === 0) {
        html +=
          '<p style="color: var(--text-secondary); font-size: 0.82rem; padding: 8px;">暂无本能规则</p>';
      } else {
        html +=
          '<div style="display: flex; flex-direction: column; gap: 8px;">';
        for (const r of rows) {
          html +=
            '<div style="padding: 10px; border: 1px solid var(--border); border-radius: 4px; background: var(--bg-secondary);">' +
            '<div style="display: flex; gap: 8px; align-items: center; margin-bottom: 6px;">' +
            '<span style="font-weight: 600; font-size: 0.84rem; min-width: 80px;">名称</span>' +
            '<input class="va-instinct-name" data-id="' +
            r.id +
            '" value="' +
            this._escAttr(r.name || "") +
            "\" style=\"flex: 1; padding: 4px 8px; border: 1px solid transparent; border-radius: 3px; font-size: 0.82rem; background: transparent; color: var(--text);\" onfocus=\"this.style.borderColor='var(--primary)';this.style.background='var(--bg)'\" onblur=\"this.style.borderColor='transparent';this.style.background='transparent'\">" +
            '<span style="font-size: 0.82rem; min-width: 50px;">优先级</span>' +
            '<input class="va-instinct-pri" data-id="' +
            r.id +
            '" type="number" value="' +
            (r.priority || 0) +
            "\" style=\"width: 50px; padding: 4px; border: 1px solid transparent; border-radius: 3px; font-size: 0.78rem; background: transparent; color: var(--text); text-align: center;\" onfocus=\"this.style.borderColor='var(--primary)';this.style.background='var(--bg)'\" onblur=\"this.style.borderColor='transparent';this.style.background='transparent'\">" +
            "</div>" +
            '<div style="display: flex; gap: 8px; align-items: center;">' +
            '<span style="font-size: 0.82rem; min-width: 80px;">描述</span>' +
            '<textarea class="va-instinct-desc" data-id="' +
            r.id +
            "\" style=\"flex: 1; padding: 4px 8px; border: 1px solid transparent; border-radius: 3px; font-size: 0.8rem; background: transparent; color: var(--text); min-height: 28px; resize: vertical;\" onfocus=\"this.style.borderColor='var(--primary)';this.style.background='var(--bg)'\" onblur=\"this.style.borderColor='transparent';this.style.background='transparent'\">" +
            this._esc(r.description || "") +
            "</textarea>" +
            '<label style="font-size: 0.78rem; white-space: nowrap;"><input type="checkbox" ' +
            (r.enabled ? "checked" : "") +
            ' data-va-instinct-enabled="' +
            r.id +
            '"> 启用</label>' +
            '<button class="toolbar-btn btn-primary" style="padding: 2px 8px; font-size: 0.72rem;" data-va-save-instinct="' +
            r.id +
            '">保存</button>' +
            '<button class="toolbar-btn btn-danger" style="padding: 2px 6px; font-size: 0.72rem;" data-va-del-instinct="' +
            r.id +
            '">删</button>' +
            "</div></div>";
        }
        html += "</div>";
      }

      container.innerHTML = html;

      document
        .getElementById("vaInstinctsRefreshBtn")
        .addEventListener("click", () => this.renderVAInstincts());

      document
        .getElementById("vaInstinctsAddBtn")
        .addEventListener("click", async () => {
          try {
            await supabaseClient.from("ev_instincts").insert({
              name: "新本能",
              description: "用自然语言描述触发场景和反应方式…",
              action_type: "system_prompt",
              priority: 99,
              mode: "both",
              enabled: true,
            });
            this.showToast("已新增", "success");
            this.renderVAInstincts();
          } catch (e) {
            this.showToast("新增失败: " + e.message, "error");
          }
        });

      container.querySelectorAll("[data-va-save-instinct]").forEach((btn) => {
        btn.addEventListener("click", async () => {
          const id = parseInt(btn.dataset.vaSaveInstinct);
          const fields = { action_type: "system_prompt", mode: "both" };
          const nameEl = container.querySelector(
            `.va-instinct-name[data-id="${id}"]`,
          );
          const descEl = container.querySelector(
            `.va-instinct-desc[data-id="${id}"]`,
          );
          const priEl = container.querySelector(
            `.va-instinct-pri[data-id="${id}"]`,
          );
          const enabledEl = container.querySelector(
            `[data-va-instinct-enabled="${id}"]`,
          );
          if (nameEl) fields.name = nameEl.value;
          if (descEl) fields.description = descEl.value;
          if (priEl) fields.priority = parseInt(priEl.value) || 0;
          if (enabledEl) fields.enabled = enabledEl.checked;
          try {
            await supabaseClient
              .from("ev_instincts")
              .update(fields)
              .eq("id", id);
            this.showToast("保存成功", "success");
          } catch (e) {
            this.showToast("保存失败: " + e.message, "error");
          }
        });
      });

      container.querySelectorAll("[data-va-del-instinct]").forEach((btn) => {
        btn.addEventListener("click", async () => {
          const id = parseInt(btn.dataset.vaDelInstinct);
          if (!confirm("确认删除这条本能规则？")) return;
          try {
            await supabaseClient.from("ev_instincts").delete().eq("id", id);
            this.showToast("已删除", "success");
            this.renderVAInstincts();
          } catch (e) {
            this.showToast("删除失败: " + e.message, "error");
          }
        });
      });
    } catch (e) {
      container.innerHTML =
        '<p style="color: var(--danger);">加载失败: ' +
        this._esc(e.message) +
        "</p>";
    }
  }

  // 辅助：HTML属性转义
  _escAttr(s) {
    if (!s) return "";
    return s
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  // 调用本地 chat-proxy 总结对话
  async _summaryVALogs(logs) {
    const conversations = logs
      .map((l, i) => `${i + 1}. 用户: ${l.user}\n   依维: ${l.ai}`)
      .join("\n\n");
    const analysisPrompt = `你是一个对话质量分析师。下面是依维（展馆智能助手）和用户的对话记录。请分析其中**依维回答不像人的地方**，按以下格式输出：

## 发现的问题
逐条列出，每条格式：问题类型 | 具体表现 | 改进方向

${conversations}

请直接用中文输出分析结果，不要客套开场白。`;

    // 用 fetch 通过本地代理调 DeepSeek
    const baseUrl = window.location.origin;
    const resp = await fetch(baseUrl + "/.netlify/functions/chat-proxy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: analysisPrompt,
        stream: false,
      }),
    });
    if (!resp.ok) throw new Error("请求失败: " + resp.status);
    const json = await resp.json();
    return (
      json.choices?.[0]?.message?.content ||
      json.content ||
      json.message ||
      JSON.stringify(json)
    );
  }

  // ============ 每日沉淀 ============
  async runVADailySummary() {
    if (!supabaseClient) {
      this.showToast("Supabase 未连接", "error");
      return;
    }
    this.showToast("正在分析今天的对话...", "info");
    // 先切换到情感趋势容器显示结果
    const container = document.getElementById("vaEmotionContainer");
    // 确保情感趋势容器可见
    const allContainers = [
      "vaKnowledgeContainer",
      "vaPersonalityContainer",
      "vaBehaviorContainer",
      "vaVerificationContainer",
      "vaPrecipRulesContainer",
      "vaMemoryContainer",
      "vaErrorsContainer",
      "vaEmotionContainer",
      "vaLogsContainer",
      "vaFunctionsContainer",
      "vaInstinctsContainer",
    ];
    const allTabs = [
      "vaTabKnowledge",
      "vaTabPersonality",
      "vaTabBehavior",
      "vaTabVerification",
      "vaTabPrecipRules",
      "vaTabMemory",
      "vaTabErrors",
      "vaTabEmotion",
      "vaTabLogs",
      "vaTabFunctions",
      "vaTabInstincts",
    ];
    allContainers.forEach((c) => {
      document.getElementById(c).style.display = "none";
    });
    container.style.display = "";
    allTabs.forEach((t) => {
      document.getElementById(t).className = "toolbar-btn btn-secondary";
    });
    document.getElementById("vaTabEmotion").className =
      "toolbar-btn btn-primary";

    container.innerHTML =
      '<p style="color: var(--text-secondary);">正在调用 AI 分析...</p>';

    try {
      const today = new Date().toISOString().slice(0, 10);
      const { data: logs } = await supabaseClient
        .from("ev_chat_logs")
        .select("user_message, ai_response")
        .gte("created_at", today)
        .order("created_at", { ascending: false })
        .limit(200);
      const logCount = logs?.length || 0;
      if (logCount === 0) {
        container.innerHTML =
          '<div style="padding: 20px; text-align: center; color: var(--text-secondary);">今天暂无对话记录</div>';
        this.showToast("今天暂无对话记录", "info");
        return;
      }

      // 加载沉淀规则
      const { data: rules } = await supabaseClient
        .from("ev_precipitation_rules")
        .select("*")
        .order("priority", { ascending: true });

      // 构建分析提示
      const conversations = logs
        .map(
          (l, i) =>
            `${i + 1}. 用户: ${l.user_message}\n   依维: ${l.ai_response}`,
        )
        .join("\n\n");
      let analysisPrompt =
        "你是依维（展馆智能助手）的自我反思系统。请分析今天的对话记录，从以下维度总结：\n\n";
      if (rules && rules.length > 0) {
        for (const r of rules) {
          analysisPrompt += `- **${r.dimension}**：${r.prompt || "请分析相关内容"}\n`;
        }
      } else {
        analysisPrompt +=
          "- **知识沉淀**：对话中出现了哪些值得记录的新知识？\n- **情感趋势**：用户的整体情绪如何？\n- **改进方向**：依维有哪些回答需要改进？\n";
      }
      analysisPrompt += `\n请按以下格式输出（每条一行，用 | 分隔）：\n维度 | 发现内容 | 建议操作（写入哪个表，如 knowledge/memory/behavior/emotion）\n\n对话记录：\n${conversations}\n\n请直接输出分析结果。`;

      const baseUrl = window.location.origin;
      const resp = await fetch(baseUrl + "/.netlify/functions/chat-proxy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: analysisPrompt }],
          stream: false,
        }),
      });
      if (!resp.ok) throw new Error("AI 请求失败: " + resp.status);
      const json = await resp.json();
      const aiResult =
        json.choices?.[0]?.message?.content ||
        json.content ||
        json.message ||
        "";

      // 解析 AI 结果
      const lines = aiResult
        .split("\n")
        .filter((l) => l.trim() && (l.includes("|") || l.includes("维度")));
      const items = [];
      for (const line of lines) {
        const parts = line.split("|").map((s) => s.trim());
        if (parts.length >= 3 && !parts[0].includes("维度")) {
          items.push({
            dimension: parts[0],
            content: parts[1],
            target: parts[2] || "",
          });
        }
      }

      // 保存情感趋势记录
      await supabaseClient
        .from("ev_emotion_log")
        .insert({ date: today, summary: aiResult.substring(0, 500) });

      // 渲染审核界面
      let html =
        '<div style="padding: 16px; border: 2px solid var(--primary); border-radius: 6px; margin-bottom: 16px; background: var(--bg-secondary);">' +
        '<h3 style="margin: 0 0 8px;">🌅 每日沉淀 · ' +
        today +
        "</h3>" +
        '<p style="margin: 0; font-size: 0.84rem; color: var(--text-secondary);">共分析 ' +
        logCount +
        " 轮对话，AI 发现 " +
        items.length +
        " 条可沉淀内容。</p>" +
        "</div>";

      html +=
        '<div style="margin-bottom: 12px; display: flex; gap: 8px;">' +
        '<button id="vaPrecipSelectAll" class="toolbar-btn btn-secondary" style="font-size: 0.78rem;">☑ 全选</button>' +
        '<button id="vaPrecipDeselectAll" class="toolbar-btn btn-secondary" style="font-size: 0.78rem;">☐ 取消全选</button>' +
        '<span style="flex: 1;"></span>' +
        '<button id="vaPrecipDistributeBtn" class="toolbar-btn btn-primary" style="border-radius: 3px;">📤 分发选中项到各库</button>' +
        "</div>";

      if (items.length === 0) {
        html +=
          '<div style="padding: 20px; text-align: center; color: var(--text-secondary);">AI 未发现需要沉淀的内容，或请检查 AI 输出格式。</div>' +
          '<div style="padding: 16px; border: 1px solid var(--border); border-radius: 6px; margin-top: 12px; white-space: pre-wrap; font-size: 0.82rem; line-height: 1.6;">' +
          this._esc(aiResult) +
          "</div>";
      } else {
        html +=
          '<div style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px;">';
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          html +=
            '<div style="padding: 10px 14px; border: 1px solid var(--border); border-radius: 6px; display: flex; gap: 12px; align-items: flex-start;">' +
            '<input type="checkbox" class="va-precip-check" data-idx="' +
            i +
            '" checked style="margin-top: 4px;">' +
            '<div style="flex: 1;">' +
            '<div style="font-weight: 600; font-size: 0.83rem; margin-bottom: 4px;">' +
            this._esc(item.dimension) +
            "</div>" +
            '<div style="font-size: 0.8rem; color: var(--text); margin-bottom: 4px;">' +
            this._esc(item.content) +
            "</div>" +
            '<div style="font-size: 0.75rem; color: var(--text-secondary);">→ 建议写入：<strong>' +
            this._esc(item.target || "待定") +
            "</strong></div>" +
            "</div></div>";
        }
        html += "</div>";
        // 原始 AI 输出
        html +=
          '<details style="margin-top: 12px;"><summary style="cursor: pointer; font-size: 0.8rem; color: var(--text-secondary);">查看 AI 原始输出</summary>' +
          '<div style="padding: 12px; border: 1px solid var(--border); border-radius: 4px; margin-top: 8px; white-space: pre-wrap; font-size: 0.8rem; line-height: 1.6;">' +
          this._esc(aiResult) +
          "</div></details>";
      }

      container.innerHTML = html;

      // 绑定全选/取消
      const selectAllBtn = document.getElementById("vaPrecipSelectAll");
      const deselectAllBtn = document.getElementById("vaPrecipDeselectAll");
      if (selectAllBtn) {
        selectAllBtn.addEventListener("click", () => {
          container.querySelectorAll(".va-precip-check").forEach((cb) => {
            cb.checked = true;
          });
        });
      }
      if (deselectAllBtn) {
        deselectAllBtn.addEventListener("click", () => {
          container.querySelectorAll(".va-precip-check").forEach((cb) => {
            cb.checked = false;
          });
        });
      }

      // 绑定分发按钮
      const distributeBtn = document.getElementById("vaPrecipDistributeBtn");
      if (distributeBtn) {
        distributeBtn.addEventListener("click", async () => {
          const checks = container.querySelectorAll(".va-precip-check:checked");
          if (checks.length === 0) {
            this.showToast("请先勾选要分发的项目", "error");
            return;
          }

          const selectedItems = [];
          checks.forEach((cb) => {
            const idx = parseInt(cb.getAttribute("data-idx"));
            if (idx >= 0 && idx < items.length) {
              selectedItems.push(items[idx]);
            }
          });

          distributeBtn.textContent = "分发中...";
          distributeBtn.disabled = true;

          try {
            const results = [];
            for (const item of selectedItems) {
              const target = (item.target || "").toLowerCase();
              if (target.includes("knowledge") || target.includes("知识")) {
                await supabaseClient.from("ev_knowledge_base").insert({
                  content: `[${today} 每日沉淀] ${item.content}`,
                  version: 0,
                });
                results.push("知识库 ✓");
              } else if (target.includes("memory") || target.includes("记忆")) {
                await supabaseClient.from("ev_user_memory").insert({
                  memory_key: item.dimension,
                  memory_value: item.content,
                  memory_summary: item.content.substring(0, 100),
                });
                results.push("记忆库 ✓");
              } else if (
                target.includes("behavior") ||
                target.includes("行为")
              ) {
                await supabaseClient.from("ev_behavior").insert({
                  layer: "execute",
                  behavior_key: item.dimension,
                  behavior_value: item.content,
                  sort: 99,
                });
                results.push("行为库 ✓");
              } else if (
                target.includes("emotion") ||
                target.includes("情感")
              ) {
                results.push("情感趋势(已保存) ✓");
              } else if (target.includes("error") || target.includes("错误")) {
                await supabaseClient.from("ev_errors").insert({
                  error_type: item.dimension,
                  fix_suggest: item.content,
                });
                results.push("错误库 ✓");
              } else if (
                target.includes("personality") ||
                target.includes("人格")
              ) {
                results.push("人格库(请手动添加) ⚠");
              } else {
                // 默认写入记忆库
                await supabaseClient.from("ev_user_memory").insert({
                  memory_key: item.dimension,
                  memory_value: item.content,
                  memory_summary: item.content.substring(0, 100),
                });
                results.push("记忆库(默认) ✓");
              }
            }
            this.showToast("分发完成！" + results.join(", "), "success");
            distributeBtn.textContent = "📤 分发选中项到各库";
            distributeBtn.disabled = false;
          } catch (e) {
            this.showToast("分发失败: " + e.message, "error");
            distributeBtn.textContent = "📤 分发选中项到各库";
            distributeBtn.disabled = false;
          }
        });
      }
    } catch (e) {
      container.innerHTML =
        '<p style="color: var(--danger);">每日沉淀失败: ' +
        this._esc(e.message) +
        "</p>";
      this.showToast("每日沉淀失败: " + e.message, "error");
    }
  }

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
