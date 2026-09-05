/**
 * Sidebar — 侧边栏独立模块
 * 负责加载 HTML、折叠/展开、导航分组、权限可见性、视图激活态
 */
class Sidebar {
  constructor() {
    this._initialized = false;
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
      settings: "navSettings",
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

  /** 初始化：绑定事件 + 恢复折叠/分组状态 + 移动端抽屉 */
  init() {
    if (this._initialized) return;
    this._initialized = true;
    this._bindEvents();
    this._restoreCollapsed();
    this._initNavGroups();
    this._initMobileDrawer();
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

  /** 根据用户权限显示/隐藏菜单项（模块总开关 + 子开关 + 空组整组隐藏） */
  updateVisibility(user) {
    const isAdmin = user?.role === "admin" || user?.menuPermissions === null;
    const perms = user?.menuPermissions || {};
    // 模块总开关：缺失/undefined 一律视为开启；false 才视为关闭
    const modOn = (v) => v !== false;
    const mods = {
      easycod: modOn(user?.easycod),
      easyorder: modOn(user?.easyorder),
      easyproc: modOn(user?.easyproc),
      easyvoic: modOn(user?.easyvoice),
    };

    const items = [
      { id: "navProjects", key: "projects", module: "easycod" },
      { id: "infoBtn", key: "info", module: "easycod" },
      { id: "navOrders", key: "orders", module: "easyorder" },
      { id: "navApply", key: "apply", module: "easyorder" },
      { id: "navClock", key: "clock", module: "easyorder" },
      { id: "navSettings", key: "settings", module: "easyorder" },
      {
        id: "navApprovalUsers",
        key: "approvalUsers",
        module: "easyproc",
        adminOnly: true,
      },
      { id: "navWorkflows", key: "workflows", module: "easyproc" },
      { id: "navApprovalRecords", key: "records", module: "easyproc" },
      { id: "navVoiceAssistant", key: "voice", module: "easyvoic" },
    ];

    const groupCounts = {
      easycod: 0,
      easyorder: 0,
      easyproc: 0,
      easyvoic: 0,
    };

    items.forEach((item) => {
      const el = document.getElementById(item.id);
      if (!el) return;
      let visible = true;
      if (!isAdmin) {
        if (item.adminOnly) visible = false;
        else if (!mods[item.module] || !perms[item.key]) visible = false;
      }
      el.style.display = visible ? "" : "none";
      if (visible) groupCounts[item.module] += 1;
    });

    // 模块总开关关闭 / 组内无任何可见子项 => 整个分组（含主标题）一起隐藏
    Object.keys(groupCounts).forEach((g) => {
      const header = document.querySelector(
        '.nav-group-header[data-group="' + g + '"]',
      );
      const group = header ? header.closest(".nav-group") : null;
      if (!group) return;
      const hidden = !isAdmin && (!mods[g] || groupCounts[g] === 0);
      group.style.display = hidden ? "none" : "";
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

  // ================================================================
  //  Mobile Drawer
  // ================================================================

  /** 初始化移动端抽屉 */
  _initMobileDrawer() {
    this._bindMobileToggle();
    this._bindNavClose();
    this._bindResizeCleanup();
  }

  /** 绑定移动端汉堡按钮 */
  _bindMobileToggle() {
    const btn = document.getElementById("sidebarMobileToggle");
    if (btn) {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.toggleMobile();
      });
    }
  }

  /** 导航链接/Logo点击后自动关闭抽屉 */
  _bindNavClose() {
    document.addEventListener("click", (e) => {
      const link = e.target.closest(".sidebar-link, .sidebar-logo");
      if (!link) return;
      // 只在移动端关闭抽屉
      if (window.innerWidth > 768) return;
      this.closeMobile();
    });
  }

  /** 窗口 resize 时从手机切回桌面自动清理 */
  _bindResizeCleanup() {
    let timer;
    window.addEventListener("resize", () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        if (window.innerWidth > 768) {
          this._cleanupMobile();
        }
      }, 200);
    });
  }

  /** 切换移动端抽屉 */
  toggleMobile() {
    const sidebar = document.getElementById("sidebar");
    if (!sidebar) return;
    const isOpen = sidebar.classList.toggle("mobile-open");
    document.body.classList.toggle("sidebar-open", isOpen);
    const overlay = this._getOrCreateOverlay();
    overlay.classList.toggle("active", isOpen);
    // 更新按钮图标
    const icon = document.querySelector("#sidebarMobileToggle .ph");
    if (icon) {
      icon.className = isOpen ? "ph ph-x" : "ph ph-list";
    }
  }

  /** 关闭移动端抽屉 */
  closeMobile() {
    const sidebar = document.getElementById("sidebar");
    if (!sidebar) return;
    sidebar.classList.remove("mobile-open");
    document.body.classList.remove("sidebar-open");
    const overlay = document.querySelector(".sidebar-overlay");
    if (overlay) overlay.classList.remove("active");
    const icon = document.querySelector("#sidebarMobileToggle .ph");
    if (icon) {
      icon.className = "ph ph-list";
    }
  }

  /** 获取或创建遮罩层 */
  _getOrCreateOverlay() {
    let overlay = document.querySelector(".sidebar-overlay");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.className = "sidebar-overlay";
      document.body.appendChild(overlay);
      overlay.addEventListener("click", () => this.closeMobile());
    }
    return overlay;
  }

  /** 清理移动端状态（切回桌面时） */
  _cleanupMobile() {
    this.closeMobile();
    const overlay = document.querySelector(".sidebar-overlay");
    if (overlay) overlay.remove();
  }
}
