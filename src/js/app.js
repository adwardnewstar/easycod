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

function generateSampleCode(sampleName) {
  const prefix = getChineseFirstTwoPinyin(sampleName);
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = String(Math.floor(1000 + Math.random() * 9000));
  return `${prefix}-${timestamp}-${random}`;
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
  var oldUrl = dataUrl;
  var { error } = await supabaseClient.storage
    .from("sample-images")
    .upload(path, blob, { upsert: true, contentType: blob.type });
  if (error) {
    console.warn("Storage upload failed:", error);
    return dataUrl;
  }
  var { data: publicData } = supabaseClient.storage
    .from("sample-images")
    .getPublicUrl(path);
  return publicData.publicUrl;
}

async function deleteImageFromStorage(imageUrl) {
  if (!supabaseClient || !imageUrl || !imageUrl.includes("sample-images"))
    return;
  var parts = imageUrl.split("/sample-images/");
  if (parts.length < 2) return;
  var path = parts[1];
  supabaseClient.storage
    .from("sample-images")
    .remove([path])
    .catch(function () {});
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
    return code;
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

  static async loadProjectsFromDB() {
    if (!supabaseClient || !window.app?.user?.id) return;
    const { data, error } = await supabaseClient
      .from("projects")
      .select("*")
      .eq("user_id", window.app.user.id)
      .order("created_at", { ascending: false });
    if (error) throw error;
    if (data && data.length > 0) {
      Store.set(STORAGE_KEYS.projects, data);
    }
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
      Store.set(STORAGE_KEYS.samples, data);
    }
  }

  static async upsertProjectToDB(project) {
    if (!supabaseClient || !window.app?.user?.id) return;
    const { error } = await supabaseClient.from("projects").upsert(project, {
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
    const { error } = await supabaseClient.from("samples").upsert(sample, {
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
    this.init();
  }

  init() {
    try {
      this.checkSession();
    } catch (e) {
      console.error("checkSession error:", e);
    }
    try {
      this.bindEvents();
    } catch (e) {
      console.error("bindEvents error:", e);
    }
  }

  checkSession() {
    const session = Store.getSession();
    if (session && supabaseClient) {
      this.user = session;
      this.showApp();
    } else if (session) {
      var self = this;
      setTimeout(function () {
        if (supabaseClient) {
          self.user = session;
          self.showApp();
        } else {
          Store.clearSession();
          self.showLogin();
        }
      }, 3000);
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

  showApp() {
    this.currentView = "projects";
    document.getElementById("loginSection").classList.remove("active");
    document.getElementById("appSection").classList.add("active");
    this.updateHeader();
    if (this.user && this.user.isDemo) {
      this.seedDemoData();
    }
    this.renderProjects();
    this.showView("projects");
    if (!DEMO_MODE && supabaseClient) {
      Store.loadFieldVisibilityFromDB();
    }
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
      projects: "projectsSection",
      samples: "samplesSection",
      labels: "labelsSection",
      sampleDetail: "sampleDetailSection",
      info: "infoSection",
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

    document.getElementById("navProjects").addEventListener("click", (e) => {
      e.preventDefault();
      this.renderProjects();
      this.showView("projects");
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
      document.getElementById("sampleCode").value = "";
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

    document.getElementById("backFromDetail").addEventListener("click", () => {
      if (this.currentProjectId) {
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
      await Store.loadProjectsFromDB();
      await Store.loadSamplesFromDB();
      this.showToast("登录成功", "success");
      this.showApp();
    } catch (e) {
      this.showToast(e.message || "数据库连接失败，请检查网络后重试", "error");
    }
  }

  handleDemoLogin() {
    this.user = {
      id: "demo-user",
      email: "demo@easycod.dev",
      name: "演示用户",
      isDemo: true,
    };
    Store.saveSession(this.user);
    this.seedDemoData();
    this.showToast("已进入演示模式", "success");
    this.showApp();
  }

  seedDemoData() {
    const SEED_VERSION = "v2";
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
        code: generateSampleCode("米黄洞石"),
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
        code: generateSampleCode("意大利灰"),
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
        code: generateSampleCode("黑金花"),
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
        code: generateSampleCode("白麻花岗岩"),
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
        code: generateSampleCode("芝麻灰"),
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
        code: generateSampleCode("俄罗斯金"),
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
        code: generateSampleCode("银白龙"),
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
        code: generateSampleCode("蓝金沙"),
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

  renderProjects() {
    const projects = Store.getProjects();
    const container = document.getElementById("projectsContainer");
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
        if (confirm("确定要删除该类别及其所有关联样板吗？")) {
          const id = btn.dataset.id;
          var allS = Store.getSamples();
          allS
            .filter(function (s) {
              return s.projectId === id;
            })
            .forEach(function (s) {
              if (s.imageUrl) deleteImageFromStorage(s.imageUrl);
              if (s.thumbnailUrl) deleteImageFromStorage(s.thumbnailUrl);
            });
          let projects = Store.getProjects();
          projects = projects.filter((p) => p.id !== id);
          Store.saveProjects(projects);
          let samples = allS.filter((s) => s.projectId !== id);
          Store.saveSamples(samples);
          Store.deleteProjectFromDB(id).catch((e) =>
            console.warn("DB delete project failed:", e),
          );
          Store.deleteSamplesByProjectFromDB(id).catch((e) =>
            console.warn("DB delete samples failed:", e),
          );
          this.renderProjects();
          this.showToast("类别已删除", "success");
        }
      });
    });
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
          samples.forEach((s) => {
            Store.upsertSampleToDB(s).catch((e) =>
              console.warn("Sample brand sync failed:", e),
            );
          });
        }
        Store.upsertProjectToDB(projects[index]).catch((e) =>
          console.warn("DB sync failed:", e),
        );
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
      Store.upsertProjectToDB(project).catch((e) =>
        console.warn("DB sync failed:", e),
      );
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
    const samples = Store.getSamples().filter((s) => s.projectId === projectId);
    const container = document.getElementById("samplesContainer");
    this.selectedSamples.clear();
    this.updateBatchPrintBtn();

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
        return `
        <div class="sample-card" data-id="${sample.id}">
          <input type="checkbox" class="sample-checkbox" data-id="${sample.id}" ${this.selectedSamples.has(sample.id) ? "checked" : ""}>
          <div class="sample-image-wrap">
            ${
              sample.imageUrl
                ? `<img class="sample-image" src="${sample.thumbnailUrl || sample.imageUrl}" alt="${sample.name}" loading="lazy" data-fullsrc="${sample.imageUrl}">`
                : `<div class="sample-image-placeholder">${initials}</div>`
            }
            <button class="btn-label-print" data-id="${sample.id}" title="打印标签">标签</button>
          </div>
          <div class="sample-info">
            <div class="sample-title-row">
              <h3>${sample.name}</h3>
              <span class="sample-model">${sample.model || ""}</span>
            </div>
            <div class="sample-code">${sample.code || ""}</div>
            <div class="sample-scope">${project && project.procurement ? sample.procurementRange || (sample.procurement ? "集采 · 范围内" : "集采 · 范围外") : "非集采 · 范围外"}</div>
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
          Store.deleteSampleFromDB(id).catch((e) =>
            console.warn("DB delete sample failed:", e),
          );
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
    var year = new Date().getFullYear();
    [
      ["procStartYear", "开始年", "procStartMonth"],
      ["procEndYear", "结束年", "procEndMonth"],
    ].forEach(function (pair) {
      var ySel = document.getElementById(pair[0]);
      var mSel = document.getElementById(pair[2]);
      if (!ySel || !mSel) return;
      ySel.innerHTML = '<option value="">' + pair[1] + "</option>";
      mSel.innerHTML = '<option value="">月</option>';
      for (var y = year - 5; y <= year + 5; y++) {
        var opt = document.createElement("option");
        opt.value = String(y);
        opt.textContent = y + "年";
        ySel.appendChild(opt);
      }
      for (var m = 1; m <= 12; m++) {
        var opt = document.createElement("option");
        var mv = String(m).padStart(2, "0");
        opt.value = mv;
        opt.textContent = m + "月";
        mSel.appendChild(opt);
      }
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
          procurementRange,
          imageUrl: imageUrl || samples[index].imageUrl,
          thumbnailUrl: thumbnailUrl || samples[index].thumbnailUrl,
          user_id: this.user?.id || samples[index].userId || "demo-user",
          updatedAt: new Date().toISOString(),
        };
        Store.saveSamples(samples);
        Store.upsertSampleToDB(samples[index]).catch((e) =>
          console.warn("DB sync failed:", e),
        );
        this.showToast("样板已更新", "success");
      }
    } else {
      const project = Store.getProjects().find(
        (p) => p.id === this.currentProjectId,
      );
      const code = generateSampleCode(name);
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
      Store.upsertSampleToDB(sample).catch((e) =>
        console.warn("DB sync failed:", e),
      );
      this.showToast("样板已创建", "success");
    }

    this.closeModal("sampleModal");
    this.renderSamples(this.currentProjectId);
  }

  editSample(sample) {
    this.openModal("sampleModal");
    document.getElementById("sampleModalTitle").textContent = "编辑样板";
    document.getElementById("sampleId").value = sample.id;
    document.getElementById("sampleName").value = sample.name;
    document.getElementById("sampleModel").value = sample.model || "";
    document.getElementById("sampleBrand").value = sample.brand || "";
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
    document.getElementById("sampleCode").value = sample.code || "";

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
    const procurementBadge = `<span class="card-badge ${project && project.procurement ? "procurement" : "non-procurement"}" style="font-size:0.72rem;padding:1px 8px;">${procurementLabel}</span>`;

    const cell = (label, value, span, extraStyle) => {
      const s = span ? ` style="grid-column:span ${span};"` : "";
      const vs = extraStyle ? ` style="${extraStyle}"` : "";
      return `<div class="detail-cell"${s}><span class="cell-label">${label}</span><span class="cell-value"${vs}>${value}</span></div>`;
    };

    const cells = [];

    cells.push(
      cell("名称", sample.name, null, "font-weight:600;font-size:.95rem"),
    );
    cells.push(cell("编号", sample.code || "-", null, "font-family:monospace"));
    cells.push(cell("类别", project ? project.name : "-"));
    cells.push(cell("型号", sample.model || "-"));
    cells.push(cell("品牌", sample.brand || "-"));
    cells.push(cell("规格", sample.specs || "-"));
    cells.push(cell("颜色", sample.color || "-"));
    cells.push(cell("材质", sample.material || "-"));

    if (project && project.procurement) {
      cells.push(cell("集采", procurementBadge));
      cells.push(
        cell(
          "集采时间",
          `${formatDate(project.procurementStart)} - ${formatDate(project.procurementEnd)}`,
        ),
      );
      cells.push(
        cell(
          "范围",
          sample.procurementRange || (sample.procurement ? "范围内" : "范围外"),
        ),
      );
    } else {
      cells.push(cell("集采", procurementBadge, 2));
    }
    cells.push(
      cell(
        "创建",
        formatDateTime(sample.createdAt),
        null,
        "font-size:.78rem;color:var(--text-light)",
      ),
    );
    cells.push(
      cell(
        "更新",
        formatDateTime(sample.updatedAt),
        null,
        "font-size:0.78rem;color:var(--text-light)",
      ),
    );

    if (sample.description) {
      cells.push(
        `<div class="detail-cell" style="grid-column:1/-1;"><span class="cell-label">描述</span><span class="cell-value" style="color:var(--text-secondary);line-height:1.5;">${sample.description}</span></div>`,
      );
    }

    if (sample.imageUrl) {
      cells.push(
        `<div class="detail-cell" style="grid-column:span 2;"><span class="cell-label">图片</span><img class="cell-image" src="${sample.imageUrl}" alt="${sample.name}" data-fullsrc="${sample.imageUrl}"></div>`,
      );
    }

    const qrSpan = sample.imageUrl ? 2 : 4;
    cells.push(
      `<div class="detail-cell" style="grid-column:span ${qrSpan};"><span class="cell-label">二维码</span><div class="cell-qr-wrap"><canvas id="detailQrCode" width="80" height="80"></canvas><span style="font-size:0.7rem;color:var(--text-light);word-break:break-all;line-height:1.4;">${qrUrl}</span></div></div>`,
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
    modal.innerHTML = `
      <div class="print-label">
        <div class="print-label-category">${project ? project.name : ""}<span class="proc-badge ${getProcurementIndicator(sample, project).cls}">${getProcurementIndicator(sample, project).symbol}</span></div>
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
      `;

    setTimeout(() => {
      const canvas = document.getElementById("modalQrCode");
      if (canvas) {
        drawQRCode(canvas, qrUrl);
      }
      const label = modal.querySelector(".print-label");
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

        return `
        <div class="print-label" data-id="${sample.id}">
          <div class="print-label-category">${project ? project.name : ""}<span class="proc-badge ${getProcurementIndicator(sample, project).cls}">${getProcurementIndicator(sample, project).symbol}</span></div>
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
      if (e.target.closest(".print-label")) return;
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
}

document.addEventListener("DOMContentLoaded", () => {
  window.app = new App();
});
