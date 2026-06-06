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
  return new Promise((resolve) => {
    if (!file) {
      resolve(null);
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
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
        let dataUrl;
        do {
          dataUrl = canvas.toDataURL("image/jpeg", q);
          q -= 0.1;
        } while (dataUrl.length > 1024 * 1024 && q > 0.1);
        resolve(dataUrl);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
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
  var blob = dataUrlToBlob(dataUrl);
  var ext = blob.type === "image/png" ? "png" : "jpg";
  var path = "samples/" + sampleId + "_" + suffix + "." + ext;
  var { error } = await supabaseClient.storage
    .from("sample-images")
    .upload(path, blob, { upsert: true, contentType: blob.type });
  if (error) {
    console.warn("Storage upload failed:", error);
    return dataUrl;
  }
  var { data: signedData } = await supabaseClient.storage
    .from("sample-images")
    .createSignedUrl(path, 604800);
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
  try {
    var result = await supabaseClient.storage
      .from("sample-images")
      .createSignedUrl(path, 604800);
    return result.data ? result.data.signedUrl : url;
  } catch (e) {
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

function toSnakeCase(obj) {
  var r = {};
  for (var k in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, k)) {
      var sk = k.replace(/[A-Z]/g, function (m) {
        return "_" + m.toLowerCase();
      });
      r[sk] = obj[k];
    }
  }
  return r;
}

function fromSnakeCase(obj) {
  var r = {};
  for (var k in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, k)) {
      var ck = k.replace(/_([a-z])/g, function (m, c) {
        return c.toUpperCase();
      });
      r[ck] = obj[k];
    }
  }
  return r;
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
  return (
    window.location.origin + BASE_PATH + "sample-detail.html?id=" + sampleId
  );
}

class Store {
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
      console.error("Store.set error:", e);
    }
  }

  static getProjects() {
    return Store.get(STORAGE_KEYS.projects) || [];
  }

  static saveProjects(projects) {
    Store.set(STORAGE_KEYS.projects, projects);
  }

  static getSamples() {
    return Store.get(STORAGE_KEYS.samples) || [];
  }

  static saveSamples(samples) {
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
    supabaseClient
      .from("daily_codes")
      .upsert({ code, date }, { onConflict: "date" })
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
    if (!supabaseClient || !window.app?.user?.id) return;
    const { data, error } = await supabaseClient
      .from("orders")
      .select("*")
      .eq("user_id", window.app.user.id)
      .order("created_at", { ascending: false });
    if (error) throw error;
    Store.set(
      STORAGE_KEYS.orders,
      data && data.length > 0 ? data.map(fromSnakeCase) : [],
    );
  }

  static getApplyRecords() {
    return Store.get(STORAGE_KEYS.applyRecords) || [];
  }
  static saveApplyRecords(records) {
    Store.set(STORAGE_KEYS.applyRecords, records);
  }
  static async loadApplyFromDB() {
    if (!supabaseClient || !window.app?.user?.id) return;
    const { data, error } = await supabaseClient
      .from("apply_records")
      .select("*")
      .eq("user_id", window.app.user.id)
      .order("created_at", { ascending: false });
    if (error) throw error;
    Store.set(
      STORAGE_KEYS.applyRecords,
      data && data.length > 0 ? data.map(fromSnakeCase) : [],
    );
  }

  static getClockRecords() {
    return Store.get(STORAGE_KEYS.clockRecords) || [];
  }
  static saveClockRecords(records) {
    Store.set(STORAGE_KEYS.clockRecords, records);
  }
  static async loadClockFromDB() {
    if (!supabaseClient || !window.app?.user?.id) return;
    const { data, error } = await supabaseClient
      .from("clock_records")
      .select("*")
      .eq("user_id", window.app.user.id)
      .order("clock_time", { ascending: false });
    if (error) throw error;
    Store.set(
      STORAGE_KEYS.clockRecords,
      data && data.length > 0 ? data.map(fromSnakeCase) : [],
    );
  }

  static async loadProjectsFromDB() {
    if (!supabaseClient || !window.app?.user?.id) return;
    const { data, error } = await supabaseClient
      .from("projects")
      .select("*")
      .eq("user_id", window.app.user.id)
      .order("created_at", { ascending: false });
    if (error) throw error;
    Store.set(
      STORAGE_KEYS.projects,
      data && data.length > 0 ? data.map(fromSnakeCase) : [],
    );
  }

  static async loadSamplesFromDB() {
    if (!supabaseClient || !window.app?.user?.id) return;
    const { data, error } = await supabaseClient
      .from("samples")
      .select("*")
      .eq("user_id", window.app.user.id)
      .order("created_at", { ascending: false });
    if (error) throw error;
    if (data && data.length > 0) {
      var samples = data.map(fromSnakeCase);
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
      if (refreshes.length > 0) {
        await Promise.all(refreshes);
      }
      Store.set(STORAGE_KEYS.samples, samples);
    } else {
      Store.set(STORAGE_KEYS.samples, []);
    }
  }

  static async upsertProjectToDB(project) {
    if (!supabaseClient || !window.app?.user?.id) return;
    const { error } = await supabaseClient
      .from("projects")
      .upsert(toSnakeCase(project), {
        onConflict: "id",
      });
    if (error) throw error;
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

  static async upsertSampleToDB(sample) {
    if (!supabaseClient || !window.app?.user?.id) return;
    const { error } = await supabaseClient
      .from("samples")
      .upsert(toSnakeCase(sample), {
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
    this._projectView = "cards";
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
      this.user = session;
      await this.showApp();
    } else if (session) {
      await new Promise(function (resolve) {
        return setTimeout(resolve, 3000);
      });
      if (supabaseClient) {
        this.user = session;
        await this.showApp();
      } else {
        Store.clearSession();
        this.showLogin();
      }
    } else {
      this.showLogin();
    }
  }

  showLogin() {
    this.currentView = "login";
    document.getElementById("loginSection").classList.add("active");
    document.getElementById("appSection").classList.remove("active");
    const demoBtn = document.getElementById("demoLoginBtn");
    if (demoBtn) {
      demoBtn.style.display = DEMO_MODE ? "" : "none";
    }
  }

  async showApp() {
    this.currentView = "dashboard";
    document.getElementById("loginSection").classList.remove("active");
    document.getElementById("appSection").classList.add("active");
    this.updateHeader();
    if (this.user && this.user.isDemo) {
      this.seedDemoData();
    } else if (!DEMO_MODE && supabaseClient && this.user?.id) {
      try {
        // 1. 优先加载品类+样板（小数据量，快速准备数据）
        await Promise.all([
          Store.loadProjectsFromDB(),
          Store.loadSamplesFromDB(),
        ]);
        // 2. 后台静默加载其他表
        Promise.all([
          Store.loadOrdersFromDB(),
          Store.loadApplyFromDB(),
          Store.loadClockFromDB(),
        ]).catch(function (e2) {
          console.warn("silent load failed:", e2);
        });
      } catch (e) {
        console.warn("DB load failed:", e);
        this.showToast("数据加载失败，请检查网络后刷新", "error");
      }
      Store.loadFieldVisibilityFromDB();
    }
    this.renderDashboard();
    this.showView("dashboard");
  }

  updateHeader() {
    const userName = this.user?.name || this.user?.email || "用户";
    const demoBadge = this.user?.isDemo
      ? '<span class="demo-badge">演示模式</span> '
      : "";
    document.getElementById("sidebarUser").innerHTML =
      `${demoBadge}${userName}`;
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
    };
    const sectionId = sectionMap[view];
    if (sectionId) {
      document.getElementById(sectionId).classList.add("active");
    }
    document
      .querySelectorAll(".sidebar-link")
      .forEach((el) => el.classList.remove("active"));
    if (view === "projects") {
      document.getElementById("navProjects").classList.add("active");
    } else if (view === "info") {
      document.getElementById("infoBtn").classList.add("active");
    } else if (view === "orders") {
      document.getElementById("navOrders").classList.add("active");
    } else if (view === "apply") {
      document.getElementById("navApply").classList.add("active");
    } else if (view === "clock") {
      document.getElementById("navClock").classList.add("active");
    } else if (view === "dashboard") {
      document.querySelector(".sidebar-title").classList.add("active");
    }
  }

  bindEvents() {
    document.getElementById("loginForm").addEventListener("submit", (e) => {
      e.preventDefault();
      this.handleLogin();
    });

    document.getElementById("sampleModal").addEventListener("click", (e) => {
      const btn = e.target.closest(".vis-pill-btn");
      if (!btn || btn.disabled) return;
      const capsule = btn.closest(".vis-pill");
      if (!capsule) return;
      capsule
        .querySelectorAll(".vis-pill-btn")
        .forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
    });

    document.getElementById("demoLoginBtn").addEventListener("click", () => {
      this.handleDemoLogin();
    });

    document.getElementById("logoutBtn").addEventListener("click", () => {
      this.handleLogout();
    });

    document.getElementById("navProjects").addEventListener("click", () => {
      this.renderProjects();
      this.showView("projects");
    });

    // 类别视图切换
    document
      .querySelectorAll("#projectViewToggle .toggle-btn")
      .forEach(function (btn) {
        btn.addEventListener(
          "click",
          function () {
            var view = this.dataset.view;
            document
              .querySelectorAll("#projectViewToggle .toggle-btn")
              .forEach(function (b) {
                b.classList.remove("active");
              });
            this.classList.add("active");
            window.app._projectView = view;
            window.app.renderProjects();
          }.bind(btn),
        );
      });

    // 类别页搜索框
    document
      .getElementById("projectSearchInput")
      .addEventListener("input", function () {
        window.app._projectSearch = this.value.trim();
        window.app.renderProjects();
      });

    // 类别页筛选
    [
      "projectBrandFilter",
      "projectCategoryFilter",
      "projectProcFilter",
      "projectRangeFilter",
    ].forEach(function (id) {
      var el = document.getElementById(id);
      if (el)
        el.addEventListener("change", function () {
          window.app.renderProjects();
        });
    });
    var qBtn = document.getElementById("projectQueryBtn");
    if (qBtn)
      qBtn.addEventListener("click", function () {
        window.app.renderProjects();
      });

    document
      .getElementById("projectRefreshBtn")
      .addEventListener("click", async () => {
        if (!supabaseClient) return;
        try {
          await Store.loadProjectsFromDB();
          await Store.loadSamplesFromDB();
          // 后台静默刷新其他表
          Promise.all([
            Store.loadOrdersFromDB(),
            Store.loadApplyFromDB(),
            Store.loadClockFromDB(),
          ]).catch(function (e) {
            console.warn("silent refresh failed:", e);
          });
          this.renderProjects();
          this.showToast("数据已刷新", "success");
        } catch (e) {
          this.showToast("刷新失败: " + e.message, "error");
        }
      });

    document
      .getElementById("createProjectBtn")
      .addEventListener("click", () => {
        this.openModal("projectModal");
        document.getElementById("projectModalTitle").textContent = "新建类别";
        document.getElementById("projectForm").reset();
        document.getElementById("projectId").value = "";
        this.initProjectTimeSelects();
        document.getElementById("procTimeRow").style.display = "none";
        var capsule = document.getElementById("projectProcCapsule");
        capsule.querySelector('[data-value="非集采"]').classList.add("active");
        capsule.querySelector('[data-value="集采"]').classList.remove("active");
      });

    document.getElementById("projectForm").addEventListener("submit", (e) => {
      e.preventDefault();
      this.saveProject();
    });

    document
      .getElementById("projectProcCapsule")
      .addEventListener("click", (e) => {
        var btn = e.target.closest(".vis-pill-btn");
        if (!btn) return;
        var capsule = btn.closest(".vis-pill");
        capsule.querySelectorAll(".vis-pill-btn").forEach(function (b) {
          b.classList.remove("active");
        });
        btn.classList.add("active");
        document.getElementById("procTimeRow").style.display =
          btn.dataset.value === "集采" ? "flex" : "none";
      });

    document
      .getElementById("cancelProjectBtn")
      .addEventListener("click", () => {
        this.closeModal("projectModal");
      });

    document.getElementById("createSampleBtn").addEventListener("click", () => {
      this.openModal("sampleModal");
      document.getElementById("sampleModalTitle").textContent = "录入样板";
      document.getElementById("sampleForm").reset();
      document.getElementById("sampleId").value = "";
      document.getElementById("sampleCodeSeq").value = "";
      document.getElementById("sampleCodeSuffix").textContent = "";
      document.getElementById("imagePreview").classList.remove("has-image");
      document.getElementById("sampleImagePreview").src = "";
      document.getElementById("imagePlaceholder").style.display = "";
      document.getElementById("sampleImagePreview").dataset.storageUrl = "";
      document.getElementById(
        "sampleImagePreview",
      ).dataset.thumbnailStorageUrl = "";

      const project = Store.getProjects().find(
        (p) => p.id === this.currentProjectId,
      );
      document.getElementById("sampleBrand").value = project?.brand || "";
      const capsule = document.getElementById("procurementRangeCapsule");
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
        capsule.querySelector('[data-value="范围外"]').classList.add("active");
        capsule
          .querySelector('[data-value="范围内"]')
          .classList.remove("active");
      }
      const seq = nextSeqForProject(this.currentProjectId);
      const code = generateSampleCode(
        document.getElementById("sampleName").value || "名称",
        document.getElementById("sampleBrand").value || project?.brand || "",
        seq,
      );
      setSampleCodeFields(code);
      document.getElementById("sampleEditFields").style.display = "none";
      document.getElementById("sampleSpecs").value = "";
      document.getElementById("sampleColor").value = "";
      document.getElementById("sampleMaterial").value = "";
      document.getElementById("sampleDescription").value = "";
    });

    document.getElementById("sampleName").addEventListener("input", () => {
      const seq = nextSeqForProject(this.currentProjectId);
      const name = document.getElementById("sampleName").value.trim();
      const brand =
        document.getElementById("sampleBrand").value.trim() ||
        Store.getProjects().find((p) => p.id === this.currentProjectId)
          ?.brand ||
        "";
      if (name) {
        setSampleCodeFields(generateSampleCode(name, brand, seq));
      }
    });

    document.getElementById("sampleForm").addEventListener("submit", (e) => {
      e.preventDefault();
      this.saveSample();
    });

    document.getElementById("cancelSampleBtn").addEventListener("click", () => {
      this.closeModal("sampleModal");
    });

    document
      .getElementById("sampleImageInput")
      .addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (file) this.openCropModal(file);
        e.target.value = "";
      });

    document.getElementById("imageUploadArea").addEventListener("click", () => {
      document.getElementById("sampleImageInput").click();
    });

    document.getElementById("batchPrintBtn").addEventListener("click", () => {
      this.batchPrint();
    });

    document.getElementById("selectAllBtn").addEventListener("click", () => {
      this.selectAllSamples();
    });

    document.getElementById("backToProjects").addEventListener("click", () => {
      this.renderProjects();
      this.showView("projects");
    });

    // 样板品牌模糊匹配筛选
    var sb = document.getElementById("sampleBrandFilter");
    if (sb)
      sb.addEventListener("input", function () {
        if (window.app.currentProjectId)
          window.app.renderSamples(window.app.currentProjectId);
      });

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

    document.getElementById("cropDiscardBtn").addEventListener("click", () => {
      this.closeCropModal();
    });

    document.getElementById("cropApplyBtn").addEventListener("click", () => {
      this.finalizeCrop();
    });

    document
      .getElementById("editProjectSampleBtn")
      .addEventListener("click", () => {
        this.openModal("projectModal");
        document.getElementById("projectModalTitle").textContent = "编辑类别";
        this.initProjectTimeSelects();
        const project = Store.getProjects().find(
          (p) => p.id === this.currentProjectId,
        );
        if (project) {
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

    document.getElementById("infoBtn").addEventListener("click", () => {
      this.renderInfoView();
      this.showView("info");
    });

    document.getElementById("navOrders").addEventListener("click", () => {
      this.renderOrders();
      this.showView("orders");
    });

    document.getElementById("navApply").addEventListener("click", () => {
      this.renderApply();
      this.showView("apply");
    });

    document.getElementById("navClock").addEventListener("click", () => {
      this.renderClock();
      this.showView("clock");
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
      .addEventListener("click", () => {
        this.handleDeleteConfirm();
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

  async handleLogin() {
    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value.trim();
    if (!email || !password) {
      this.showToast("请填写邮箱和密码", "error");
      return;
    }

    if (!supabaseClient) {
      if (!retryInitSupabase()) {
        this.showToast("数据库未连接，请检查网络后刷新页面重试", "error");
        return;
      }
    }
    try {
      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        this.showToast(error.message, "error");
        return;
      }
      const user = data.user;
      this.user = {
        id: user.id,
        email: user.email,
        name: email.split("@")[0],
        isDemo: false,
      };
      Store.saveSession(this.user);
      this.showToast("登录成功", "success");
      await this.showApp();
    } catch (e) {
      this.showToast(e.message || "数据库连接失败，请检查网络后重试", "error");
    }
  }

  async handleDemoLogin() {
    this.user = {
      id: "demo-user",
      email: "demo@easycod.dev",
      name: "演示用户",
      isDemo: true,
    };
    Store.saveSession(this.user);
    this.seedDemoData();
    this.showToast("已进入演示模式", "success");
    await this.showApp();
  }

  seedDemoData() {
    const SEED_VERSION = "v3";
    const seeded = Store.get("easycod_seeded");
    if (seeded === SEED_VERSION) return;
    Store.set(STORAGE_KEYS.projects, []);
    Store.set(STORAGE_KEYS.samples, []);

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
    if (supabaseClient) {
      try {
        await supabaseClient.auth.signOut();
      } catch (e) {
        console.warn("Supabase signOut error:", e);
      }
    }
    Store.clearSession();
    this.user = null;
    this.currentProjectId = null;
    this.inviteCodeVerified = false;
    document.getElementById("loginEmail").value = "";
    document.getElementById("loginPassword").value = "";
    this.showLogin();
    this.showToast("已退出登录", "info");
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
      toast.style.transition = "opacity 0.3s ease";
      setTimeout(() => toast.remove(), 300);
    }, 3000);
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
      (document.getElementById("projectProcFilter") || {}).value || "";
    var rangeFlt =
      (document.getElementById("projectRangeFilter") || {}).value || "";
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
        <div class="empty-state">
          <div class="icon"><img src="src/icon/file.svg" alt="empty" class="empty-icon"></div>
          <p>暂无类别，点击右上角"新建类别"开始</p>
        </div>
      `;
      return;
    }
    container.innerHTML = projects
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

    // Build maps
    var projectMap = {};
    var projectProcMap = {};
    projects.forEach(function (p) {
      projectMap[p.id] = p.name;
      projectProcMap[p.id] = p.procurement;
    });

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
        try {
          await Store.upsertProjectToDB(projects[index]);
        } catch (e) {
          console.warn("DB sync failed:", e);
          this.showToast("数据保存到数据库失败，请检查网络", "error");
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
      try {
        await Store.upsertProjectToDB(project);
      } catch (e) {
        console.warn("DB sync failed:", e);
        this.showToast("数据保存到数据库失败，请检查网络", "error");
      }
      this.showToast("类别已创建", "success");
    }

    this.closeModal("projectModal");
    this.renderProjects();
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
    this.updateBatchPrintBtn();

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
        <div class="empty-state">
          <div class="icon"><img src="src/icon/box.svg" alt="empty" class="empty-icon"></div>
          <p>暂无样板，点击"录入样板"开始添加</p>
        </div>
      `;
      return;
    }

    container.innerHTML = samples
      .map((sample) => {
        const initials = sample.name ? sample.name.substring(0, 2) : "??";
        const isProc = project && project.procurement;
        let scopeText, scopeColor, labelBg;
        if (isProc) {
          const r =
            sample.procurementRange ||
            (sample.procurement ? "范围内" : "范围外");
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
                ? `<img class="sample-image" src="${sample.thumbnailUrl || sample.imageUrl}" alt="${sample.name}" loading="lazy" data-fullsrc="${sample.imageUrl}">`
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
      })
      .join("");

    container.querySelectorAll(".sample-checkbox").forEach((cb) => {
      cb.addEventListener("change", (e) => {
        e.stopPropagation();
        const id = cb.dataset.id;
        if (cb.checked) {
          this.selectedSamples.add(id);
        } else {
          this.selectedSamples.delete(id);
        }
        this.updateBatchPrintBtn();
      });
    });

    container.querySelectorAll(".view-sample-detail-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.showSampleDetail(btn.dataset.id);
      });
    });

    container.querySelectorAll(".edit-sample-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const sample = samples.find((s) => s.id === btn.dataset.id);
        if (sample) this.editSample(sample);
      });
    });

    container.querySelectorAll(".delete-sample-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        if (confirm("确定要删除该样板吗？")) {
          const id = btn.dataset.id;
          var s = samples.find(function (s) {
            return s.id === id;
          });
          if (s) {
            if (s.imageUrl) deleteImageFromStorage(s.imageUrl);
            if (s.thumbnailUrl) deleteImageFromStorage(s.thumbnailUrl);
          }
          let allSamples = Store.getSamples();
          allSamples = allSamples.filter((s) => s.id !== id);
          Store.saveSamples(allSamples);
          Store.deleteSampleFromDB(id).catch((e) => {
            console.warn("DB delete sample failed:", e);
            this.showToast("删除数据同步到数据库失败，请检查网络", "error");
          });
          this.renderSamples(this.currentProjectId);
          this.showToast("样板已删除", "success");
        }
      });
    });

    container.querySelectorAll(".btn-label-print").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.showSingleLabel(btn.dataset.id);
      });
    });
  }

  updateBatchPrintBtn() {
    const btn = document.getElementById("batchPrintBtn");
    const count = this.selectedSamples.size;
    if (count > 0) {
      btn.textContent = `批量打印 (${count})`;
      btn.disabled = false;
    } else {
      btn.textContent = "批量打印";
      btn.disabled = true;
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
    this.updateBatchPrintBtn();
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
    let imageUrl = document.getElementById("sampleImagePreview").src || "";

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

    let thumbnailUrl =
      document.getElementById("sampleImagePreview").dataset.thumbnailUrl || "";
    if (imageUrl && imageUrl.startsWith("data:")) {
      var preview = document.getElementById("sampleImagePreview");
      var oldImageUrl = preview.dataset.storageUrl || "";
      var sampleId = document.getElementById("sampleId").value || generateId();
      if (!document.getElementById("sampleId").value) {
        document.getElementById("sampleId").value = sampleId;
      }
      var compressed = await compressImage(
        await (await fetch(imageUrl)).blob(),
        600,
        0.8,
      );
      if (compressed) {
        imageUrl = await uploadImageToStorage(compressed, sampleId, "full");
        var thumb = await compressImage(
          await (
            await fetch(imageUrl.startsWith("http") ? imageUrl : compressed)
          ).blob(),
          200,
          0.7,
        );
        if (thumb)
          thumbnailUrl = await uploadImageToStorage(thumb, sampleId, "thumb");
      }
      if (oldImageUrl && oldImageUrl.includes("sample-images")) {
        deleteImageFromStorage(oldImageUrl);
        var oldThumb = preview.dataset.thumbnailStorageUrl || "";
        if (oldThumb) deleteImageFromStorage(oldThumb);
      }
    }

    const samples = Store.getSamples();

    if (id) {
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
          imageUrl: imageUrl || samples[index].imageUrl,
          thumbnailUrl: thumbnailUrl || samples[index].thumbnailUrl,
          user_id: this.user?.id || samples[index].userId || "demo-user",
          updatedAt: new Date().toISOString(),
        };
        Store.saveSamples(samples);
        try {
          await Store.upsertSampleToDB(samples[index]);
        } catch (e) {
          console.warn("DB sync failed:", e);
          this.showToast("数据保存到数据库失败，请检查网络", "error");
        }
        this.showToast("样板已更新", "success");
      }
    } else {
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
        imageUrl: imageUrl || "",
        thumbnailUrl: thumbnailUrl || "",
        description: "",
        specs: "",
        color: "",
        material: "",
        procurementRange: procurementRange,
        userId: this.user?.id || "demo-user",
        user_id: this.user?.id || "demo-user",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      samples.push(sample);
      Store.saveSamples(samples);
      try {
        await Store.upsertSampleToDB(sample);
      } catch (e) {
        console.warn("DB sync failed:", e);
        this.showToast("数据保存到数据库失败，请检查网络", "error");
      }
      this.showToast("样板已创建", "success");
    }

    this.closeModal("sampleModal");
    this.renderSamples(this.currentProjectId);
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
        `<div class="detail-cell" style="grid-column:span 2;"><span class="cell-label">图片</span><img class="cell-image" src="${sample.imageUrl}" alt="${sample.name}" data-fullsrc="${sample.imageUrl}"></div>`,
      );
    }

    const qrSpan = sample.imageUrl ? 2 : 4;
    cells.push(
      `<div class="detail-cell" style="grid-column:span ${qrSpan};"><span class="cell-label">二维码</span><div class="cell-qr-wrap"><canvas id="detailQrCode" width="120" height="120"></canvas><span style="font-size:0.7rem;color:var(--text-light);word-break:break-all;line-height:1.4;">${qrUrl}</span></div></div>`,
    );

    container.innerHTML = `
      <div class="detail-view" style="box-shadow:none;border:1px solid var(--border);">
        <div class="detail-body detail-grid" style="padding:10px 12px;">
          ${cells.join("")}
        </div>
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
      </div>`;

    setTimeout(() => {
      const canvas = document.getElementById("modalQrCode");
      if (canvas) {
        drawQRCode(canvas, qrUrl);
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

        return `
        <div class="print-label-wrap" data-id="${sample.id}">
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
        <div class="print-label-capsule">
          <div class="capsule-circle" style="background:${color}"></div>
          <div class="capsule-code">${capsuleText}</div>
        </div>
        </div>
      `;
      })
      .join("");

    labelsToPrint.forEach((sample) => {
      const canvas = document.getElementById(`qr-${sample.id}`);
      if (canvas) {
        drawQRCode(canvas, qrPageUrl(sample.id));
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

  batchPrint() {
    this.renderLabels();
    this.showView("labels");
    setTimeout(() => window.print(), 500);
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
            .insert(toSnakeCase(data))
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
            .insert(toSnakeCase(data))
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
            .insert(toSnakeCase(data))
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

  renderDashboard() {
    var projects = Store.getProjects() || [];
    var samples = Store.getSamples() || [];
    var orders = Store.getOrders() || [];
    var apply = Store.getApplyRecords() || [];
    var clock = Store.getClockRecords() || [];

    // 如果是演示模式或空数据，拉取一遍
    if (this.user && this.user.isDemo) {
      this.seedDemoData();
      projects = Store.getProjects();
      samples = Store.getSamples();
      orders = Store.getOrders();
      apply = Store.getApplyRecords();
      clock = Store.getClockRecords();
    }

    var sc = samples.length;
    var pc = projects.length;
    var dailyCode = Store.getDailyCode();

    var html = '<div class="dashboard-grid">';

    // 第一行：样板 + 品类 + 邀请码
    html += '<div class="dash-metric-row">';
    html +=
      '<div class="dash-metric-card"><div class="dash-num" data-target="' +
      sc +
      '">0</div><div class="dash-label">已录入样板</div></div>';
    html +=
      '<div class="dash-metric-card"><div class="dash-num" data-target="' +
      pc +
      '">0</div><div class="dash-label">当前品类</div></div>';
    html +=
      '<div class="dash-metric-card invite-code-card"><div class="dash-num dash-code" id="dashInviteCode">' +
      this._randomCodeStr(dailyCode.length || 6) +
      '</div><div class="dash-label">今日邀请码</div></div>';
    html += "</div>";

    // 第二行：三个甜甜圈图
    html += '<div class="dash-chart-row">';
    html += this._donutChart("订单状态", orders, "status", {
      未提交: "#FF9800",
      已收录: "#4CAF50",
    });
    html += this._donutChart("申请类型", apply, "type", {
      运输: "#2196F3",
      参观: "#9C27B0",
      选样: "#FF5722",
      借还: "#00BCD4",
      其他: "#607D8B",
    });
    html += this._donutChart("打卡角色", clock, "companyType", {
      业主方: "#4CAF50",
      运营方: "#2196F3",
      品牌方: "#FF9800",
      其他: "#607D8B",
    });
    html += "</div>";

    html += "</div>";

    document.getElementById("dashboardContainer").innerHTML = html;

    // 动画：数字计数
    this._animateNumbers();
    // 动画：邀请码翻转
    this._animateFlipCode(dailyCode);
    // 动画：甜甜圈比例
    this._animateDonuts();
  }

  // 计数动画
  _animateNumbers() {
    var els = document.querySelectorAll(".dash-num[data-target]");
    els.forEach(function (el) {
      var target = parseInt(el.getAttribute("data-target"), 10);
      if (isNaN(target) || target <= 0) {
        el.textContent = target || 0;
        return;
      }
      var duration = 800;
      var start = performance.now();
      function step(now) {
        var t = Math.min((now - start) / duration, 1);
        var eased = 1 - Math.pow(1 - t, 3);
        el.textContent = Math.round(eased * target);
        if (t < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  }

  // 邀请码翻牌效果
  _animateFlipCode(finalCode) {
    var el = document.getElementById("dashInviteCode");
    if (!el || !finalCode) return;
    var len = finalCode.length;
    var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    var duration = 1200;
    var interval = 60;
    var steps = Math.floor(duration / interval);
    var count = 0;
    var timer = setInterval(function () {
      count++;
      var pct = count / steps;
      var fixed = Math.floor(pct * len);
      var s = "";
      for (var i = 0; i < len; i++) {
        s +=
          i < fixed
            ? finalCode[i]
            : chars[Math.floor(Math.random() * chars.length)];
      }
      el.textContent = s;
      if (count >= steps) {
        clearInterval(timer);
        el.textContent = finalCode;
      }
    }, interval);
  }

  _animateDonuts() {
    var els = document.querySelectorAll(".donut-chart[data-final-bg]");
    if (els.length === 0) return;
    var self = this;
    els.forEach(function (el) {
      var finalBg = el.getAttribute("data-final-bg");
      if (!finalBg || finalBg.indexOf("conic-gradient") !== 0) return;
      var content = finalBg.slice("conic-gradient(".length, -1);
      var parts = content
        .split(", ")
        .map(function (p) {
          var m = p.match(/^(#[0-9a-fA-F]{3,8})\s+([\d.]+)deg\s+([\d.]+)deg$/);
          return m
            ? { color: m[1], from: parseFloat(m[2]), to: parseFloat(m[3]) }
            : null;
        })
        .filter(Boolean);
      if (parts.length === 0) {
        el.style.background = finalBg;
        return;
      }

      var duration = 800;
      var start = performance.now();
      function step(now) {
        var t = Math.min((now - start) / duration, 1);
        var eased = 1 - Math.pow(1 - t, 3);
        var cur = parts.map(function (p) {
          var c = self._lerpColor("#e0e0e0", p.color, eased);
          return c + " " + p.from + "deg " + p.to + "deg";
        });
        el.style.background = "conic-gradient(" + cur.join(", ") + ")";
        if (t < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  }

  _lerpColor(c1, c2, t) {
    var r1 = parseInt(c1.slice(1, 3), 16),
      g1 = parseInt(c1.slice(3, 5), 16),
      b1 = parseInt(c1.slice(5, 7), 16);
    var r2 = parseInt(c2.slice(1, 3), 16),
      g2 = parseInt(c2.slice(3, 5), 16),
      b2 = parseInt(c2.slice(5, 7), 16);
    var r = Math.round(r1 + (r2 - r1) * t);
    var g = Math.round(g1 + (g2 - g1) * t);
    var b = Math.round(b1 + (b2 - b1) * t);
    return (
      "#" +
      [r, g, b]
        .map(function (x) {
          return x.toString(16).padStart(2, "0");
        })
        .join("")
    );
  }

  _randomCodeStr(len) {
    var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    var s = "";
    for (var i = 0; i < len; i++)
      s += chars[Math.floor(Math.random() * chars.length)];
    return s;
  }

  // 生成甜甜圈图 HTML
  _donutChart(title, data, field, colorMap) {
    var total = data.length;
    var counts = {};
    data.forEach(function (d) {
      var val = d[field] || "其他";
      counts[val] = (counts[val] || 0) + 1;
    });

    if (total === 0) {
      return (
        '<div class="dash-chart-card"><h3>' +
        title +
        '</h3><div class="dash-chart-body"><div style="color:var(--text-light);font-size:0.85rem;">暂无数据</div></div></div>'
      );
    }

    // 构建渐变色
    var conicParts = [];
    var legendHtml = "";
    var startDeg = 0;
    var idx = 0;
    var colorKeys = Object.keys(colorMap);
    for (var ci = 0; ci < colorKeys.length; ci++) {
      var key = colorKeys[ci];
      var cnt = counts[key] || 0;
      if (cnt === 0) continue;
      var pct = (cnt / total) * 100;
      var deg = (cnt / total) * 360;
      var color = colorMap[key];
      conicParts.push(
        color + " " + startDeg + "deg " + (startDeg + deg) + "deg",
      );
      legendHtml +=
        '<div class="donut-legend-item"><span class="color-dot" style="background:' +
        color +
        '"></span><span class="legend-label">' +
        key +
        '</span><span class="legend-val">' +
        cnt +
        '</span><span class="legend-pct">' +
        Math.round(pct) +
        "%</span></div>";
      startDeg += deg;
      idx++;
    }

    // 处理其他未在 colorMap 中的值
    for (var k in counts) {
      if (colorKeys.indexOf(k) === -1) {
        var cnt2 = counts[k];
        var pct2 = (cnt2 / total) * 100;
        var deg2 = (cnt2 / total) * 360;
        conicParts.push(
          "#607D8B " + startDeg + "deg " + (startDeg + deg2) + "deg",
        );
        legendHtml +=
          '<div class="donut-legend-item"><span class="color-dot" style="background:#607D8B"></span><span class="legend-label">' +
          k +
          '</span><span class="legend-val">' +
          cnt2 +
          '</span><span class="legend-pct">' +
          Math.round(pct2) +
          "%</span></div>";
        startDeg += deg2;
      }
    }

    var bg =
      conicParts.length > 0
        ? "conic-gradient(" + conicParts.join(", ") + ")"
        : "#eee";

    var finalBg = bg;

    // 初始渲染灰色，动画过渡到最终色
    bg = conicParts.length > 0 ? "conic-gradient(#e0e0e0 0deg 360deg)" : "#eee";

    return (
      '<div class="dash-chart-card">' +
      "<h3>" +
      title +
      ' <span class="dash-total">(共' +
      total +
      "条)</span></h3>" +
      '<div class="dash-chart-body">' +
      '<div class="donut-wrapper"><div class="donut-chart" data-final-bg="' +
      esc(finalBg) +
      '" style="background:' +
      bg +
      '"></div></div>' +
      '<div class="donut-legend">' +
      legendHtml +
      "</div>" +
      "</div></div>"
    );
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
      if (data) items = data.map(fromSnakeCase);
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
        let records = Store.getApplyRecords();
        records = records.filter((r) => r.id !== target.id);
        Store.saveApplyRecords(records);
        this.renderApply();
      } else if (target.type === "clock") {
        await this._execDelete("clock_records", target.id);
        let records = Store.getClockRecords();
        records = records.filter((r) => r.id !== target.id);
        Store.saveClockRecords(records);
        this.renderClock();
      } else if (target.type === "sample") {
        await this._execDelete("samples", target.id);
        var samples = Store.getSamples().filter(function (s) {
          return s.id !== target.id;
        });
        Store.saveSamples(samples);
        if (this._projectView === "table") {
          document.getElementById("projectsContainer").className = "";
          this.renderSampleTable();
        } else {
          this.renderProjects();
        }
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
        var records = Store.getApplyRecords().filter(function (r) {
          return ids.indexOf(r.id) === -1;
        });
        Store.saveApplyRecords(records);
        this.renderApply();
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
}

document.addEventListener("DOMContentLoaded", () => {
  window.app = new App();
});
