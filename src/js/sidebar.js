/**
 * Sidebar — 侧边栏独立模块
 * 负责加载 HTML、折叠/展开、导航分组、权限可见性、视图激活态
 */
class Sidebar {
  constructor() {
    this.viewLinkMap = {
      projects: "navProjects",
      info: "infoBtn",
      orders: "navOrders",
      apply: "navApply",
      clock: "navClock",
      approvalUsers: "navApprovalUsers",
      workflows: "navWorkflows",
      approvalRecords: "navApprovalRecords",
      voiceAssistant: "navVoiceAssistant",
    };
  }

  /** 加载 sidebar.html 并注入到页面 */
  async load(targetSelector = "#appSection") {
    if (document.getElementById("sidebar")) return;
    try {
      const res = await fetch("src/html/sidebar.html?v=5");
      const html = await res.text();
      const target = document.querySelector(targetSelector);
      if (target) {
        target.insertAdjacentHTML("afterbegin", html);
      }
    } catch (err) {
      console.error("Sidebar 加载失败:", err);
    }
  }

  /** 初始化：绑定事件 + 恢复折叠/分组状态 */
  init() {
    this._bindEvents();
    this._restoreCollapsed();
    this._initNavGroups();
  }

  /** 折叠/展开切换 */
  toggle() {
    const sidebar = document.getElementById("sidebar");
    if (!sidebar) return;
    const isCollapsed = sidebar.classList.toggle("collapsed");
    localStorage.setItem("sidebarCollapsed", isCollapsed);
    this._updateToggleIcon();
  }

  /** 同步折叠按钮图标与当前状态 */
  _updateToggleIcon() {
    const sidebar = document.getElementById("sidebar");
    const icon = document.querySelector("#sidebarToggle .toggle-icon");
    const btn = document.getElementById("sidebarToggle");
    if (!sidebar || !icon || !btn) return;
    const isCollapsed = sidebar.classList.contains("collapsed");
    if (isCollapsed) {
      icon.className = "ph ph-caret-double-right toggle-icon";
      btn.title = "展开侧边栏";
    } else {
      icon.className = "ph ph-caret-double-left toggle-icon";
      btn.title = "折叠侧边栏";
    }
  }

  /** 恢复折叠状态 — HTML 默认折叠，只有用户明确展开过才展开 */
  _restoreCollapsed() {
    const sidebar = document.getElementById("sidebar");
    if (!sidebar) return;
    if (localStorage.getItem("sidebarCollapsed") === "false") {
      sidebar.classList.remove("collapsed");
    }
    this._updateToggleIcon();
  }

  /** 初始化导航分组：点击展开/折叠 + 恢复上次状态 */
  _initNavGroups() {
    const headers = document.querySelectorAll(".nav-group-header");
    headers.forEach((header) => {
      header.addEventListener("click", () => {
        const group = header.closest(".nav-group");
        if (!group) return;
        const groupId = header.getAttribute("data-group");
        group.classList.toggle("collapsed");
        const saved = JSON.parse(
          localStorage.getItem("navGroupStates") || "{}",
        );
        saved[groupId] = group.classList.contains("collapsed");
        localStorage.setItem("navGroupStates", JSON.stringify(saved));
      });

      // 恢复上次状态
      const groupId = header.getAttribute("data-group");
      const saved = JSON.parse(localStorage.getItem("navGroupStates") || "{}");
      if (saved[groupId] === true) {
        const group = header.closest(".nav-group");
        if (group) group.classList.add("collapsed");
      }
    });
  }

  /** 更新用户名显示 */
  updateHeader(user) {
    const nameEl = document.querySelector(".sidebar-user-name");
    if (!nameEl) return;
    const userName = user?.name || user?.email || "用户";
    const demoBadge = user?.isDemo
      ? '<span class="demo-badge">演示模式</span> '
      : "";
    nameEl.innerHTML = `${demoBadge}${userName}`;
  }

  /** 根据用户权限显示/隐藏菜单项 */
  updateVisibility(user) {
    const isAdmin = user?.role === "admin" || user?.menuPermissions === null;
    const perms = user?.menuPermissions || {};

    const items = [
      { id: "navProjects", key: "projects" },
      { id: "infoBtn", key: "info" },
      { id: "navOrders", key: "orders" },
      { id: "navApply", key: "apply" },
      { id: "navClock", key: "clock" },
      { id: "navApprovalUsers", key: "approvalUsers", adminOnly: true },
      { id: "navWorkflows", key: "workflows" },
      { id: "navApprovalRecords", key: "records" },
      { id: "navVoiceAssistant", key: "voice" },
    ];

    items.forEach((item) => {
      const el = document.getElementById(item.id);
      if (!el) return;
      el.style.display = item.adminOnly
        ? isAdmin
          ? ""
          : "none"
        : isAdmin || perms[item.key]
          ? ""
          : "none";
    });
  }

  /** 高亮当前视图对应的侧边栏链接 */
  setActiveView(view) {
    // 清除所有 active
    document
      .querySelectorAll(".sidebar-link")
      .forEach((el) => el.classList.remove("active"));
    document.querySelector(".sidebar-logo")?.classList.remove("active");

    if (view === "dashboard") {
      document.querySelector(".sidebar-logo")?.classList.add("active");
    } else {
      const linkId = this.viewLinkMap[view];
      if (linkId) {
        document.getElementById(linkId)?.classList.add("active");
      }
    }

    // 自动展开包含当前激活按钮的分组
    const activeLink = document.querySelector(".sidebar-link.active");
    if (activeLink) {
      const group = activeLink.closest(".nav-group");
      if (group && group.classList.contains("collapsed")) {
        group.classList.remove("collapsed");
        const groupId = group
          .querySelector(".nav-group-header")
          ?.getAttribute("data-group");
        if (groupId) {
          const saved = JSON.parse(
            localStorage.getItem("navGroupStates") || "{}",
          );
          saved[groupId] = false;
          localStorage.setItem("navGroupStates", JSON.stringify(saved));
        }
      }
    }
  }

  /** 绑定侧边栏事件（toggle 按钮） */
  _bindEvents() {
    const toggleBtn = document.getElementById("sidebarToggle");
    if (toggleBtn) {
      toggleBtn.addEventListener("click", () => this.toggle());
    }
  }
}
