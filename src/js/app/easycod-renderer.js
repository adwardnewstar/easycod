/* ============================================================
 * EasycodRenderer — EasyCod 页面渲染模块
 * 从 App 类中拆分出来，负责类别/样板/标签/信息控制的所有 DOM 渲染
 * 通过 this.app 访问 App 实例的状态和方法
 * ============================================================ */

class EasycodRenderer {
  constructor(app) {
    this.app = app;
    this._sortState = 0; // 0=编号升序, 1=编号降序, 2=修改日期, 3=录入日期
    this._sortLabels = ["编号升序", "编号降序", "修改日期", "录入日期"];
    this._sortIcons = [
      "ph-list-numbers",
      "ph-list",
      "ph-pencil-simple",
      "ph-plus",
    ];
  }

  _nextSortState() {
    this._sortState = (this._sortState + 1) % 4;
    this._updateSortBtn();
  }

  _updateSortBtn() {
    var btn = document.getElementById("sortSamplesBtn");
    if (!btn) return;
    btn.innerHTML =
      '<i class="ph ' +
      this._sortIcons[this._sortState] +
      '"></i> ' +
      this._sortLabels[this._sortState];
  }

  // ============ 类别筛选 ============
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

  // ============ 类别卡片 / 表格渲染 ============
  renderProjects() {
    // 刷新筛选下拉
    this._populateProjectFilters();
    const container = document.getElementById("projectsContainer");
    // Sync search input
    var searchInput = document.getElementById("projectSearchInput");
    if (searchInput && this.app._projectSearch !== undefined) {
      searchInput.value = this.app._projectSearch;
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
    this.app._projectBrandFlt = brandFlt;
    this.app._projectCatFlt = catFlt;
    this.app._projectProcFlt = procFlt;
    this.app._projectRangeFlt = rangeFlt;

    if (this.app._projectView === "table") {
      container.className = "";
      this.renderSampleTable();
      return;
    }
    container.className = "card-grid";
    var projects = Store.getProjects();
    // 搜索过滤（品类名/品牌/是否集采）
    var searchTerm = (this.app._projectSearch || "").toLowerCase();
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
              <span class="card-count">${sampleCount}</span>
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
        this.app.currentProjectId = btn.dataset.id;
        this.renderSamples(this.app.currentProjectId);
        this.app.showView("samples");
      });
    });

    container.querySelectorAll(".edit-project-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const project = projects.find((p) => p.id === btn.dataset.id);
        if (project) {
          this.app.initProjectTimeSelects();
          this.app.openModal("projectModal");
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

    // 绑定手机端卡片交互（单击→查看样板，长按→操作菜单）
    this._bindMobileProjectCards();
  }

  // ============ 手机端项目卡片交互 ============
  _bindMobileProjectCards() {
    if (this._mobileCardsBound) return;
    this._mobileCardsBound = true;

    var self = this;
    var container = document.getElementById("projectsContainer");
    if (!container) return;

    function isMobile() {
      return window.innerWidth <= 768;
    }

    // 单击整张卡片 → 查看样板（仅手机端）
    container.addEventListener("click", function (e) {
      if (!isMobile()) return;
      var card = e.target.closest(".card:not(.card-placeholder)");
      if (!card) return;
      if (e.target.closest("button")) return; // 忽略按钮点击
      self.app.currentProjectId = card.dataset.id;
      self.renderSamples(self.app.currentProjectId);
      self.app.showView("samples");
    });

    // 长按 → 弹出底部操作菜单（仅手机端）
    var timer = null;
    var triggered = false;

    container.addEventListener(
      "touchstart",
      function (e) {
        if (!isMobile()) return;
        var card = e.target.closest(".card:not(.card-placeholder)");
        if (!card) return;
        triggered = false;
        timer = setTimeout(function () {
          triggered = true;
          if (navigator.vibrate) navigator.vibrate(15);
          self.showProjectSheet(card.dataset.id);
        }, 500);
      },
      { passive: true },
    );

    container.addEventListener(
      "touchmove",
      function () {
        if (timer) {
          clearTimeout(timer);
          timer = null;
        }
      },
      { passive: true },
    );

    container.addEventListener(
      "touchend",
      function (e) {
        if (timer) {
          clearTimeout(timer);
          timer = null;
        }
        if (triggered) {
          e.preventDefault();
          triggered = false;
        }
      },
      { passive: false },
    );
  }

  /** 显示项目操作菜单（底部弹出） */
  showProjectSheet(projectId) {
    var project = Store.getProjects().find(function (p) {
      return p.id === projectId;
    });
    if (!project) return;

    // 计算样板数量
    var sampleCount = Store.getSamples().filter(function (s) {
      return s.projectId === projectId;
    }).length;

    // 集采信息（完整版，含日期范围）
    var procurementHtml = project.procurement
      ? '<span class="card-badge procurement">集采</span><span style="font-size:0.75rem;color:var(--text-light);margin-left:4px">' +
        formatDate(project.procurementStart) +
        " - " +
        formatDate(project.procurementEnd) +
        "</span>"
      : '<span class="card-badge non-procurement">非集采</span>';

    // 移除旧菜单
    this.closeProjectSheet();

    // 遮罩层
    var overlay = document.createElement("div");
    overlay.className = "project-sheet-overlay";
    overlay.addEventListener("click", this.closeProjectSheet.bind(this));
    document.body.appendChild(overlay);

    // 底部弹出面板
    var sheet = document.createElement("div");
    sheet.className = "project-sheet";
    sheet.innerHTML =
      '<div class="sheet-handle-wrap"><div class="sheet-handle"></div></div>' +
      // ---- 完整信息区 ----
      '<div class="sheet-info">' +
      '<div class="sheet-info-name">' +
      project.name +
      "</div>" +
      (project.brand
        ? '<div class="sheet-info-row"><span class="sheet-info-label">品牌</span><span>' +
          project.brand +
          "</span></div>"
        : "") +
      '<div class="sheet-info-row"><span class="sheet-info-label">样板</span><span>' +
      sampleCount +
      " 个</span></div>" +
      (project.description
        ? '<div class="sheet-info-desc">' + project.description + "</div>"
        : "") +
      '<div class="sheet-info-proc">' +
      procurementHtml +
      "</div>" +
      "</div>" +
      // ---- 操作区 ----
      '<div class="sheet-actions">' +
      '<button class="sheet-action" data-action="view">' +
      '<span class="sheet-act-icon">' +
      '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>' +
      "</span>" +
      '<span class="sheet-act-text"><span class="sheet-act-label">查看样板</span><span class="sheet-act-desc">浏览该类别下所有样板</span></span>' +
      "</button>" +
      '<button class="sheet-action" data-action="edit">' +
      '<span class="sheet-act-icon">' +
      '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>' +
      "</span>" +
      '<span class="sheet-act-text"><span class="sheet-act-label">编辑类别</span><span class="sheet-act-desc">修改名称、品牌等</span></span>' +
      "</button>" +
      '<button class="sheet-action sheet-action--danger" data-action="delete">' +
      '<span class="sheet-act-icon">' +
      '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>' +
      "</span>" +
      '<span class="sheet-act-text"><span class="sheet-act-label">删除类别</span><span class="sheet-act-desc">删除后不可恢复</span></span>' +
      "</button>" +
      "</div>";

    var self = this;
    // 绑定操作按钮
    sheet.querySelectorAll(".sheet-action").forEach(function (btn) {
      btn.addEventListener("click", function () {
        self._handleProjectSheetAction(btn.dataset.action, projectId);
        self.closeProjectSheet();
      });
    });

    document.body.appendChild(sheet);

    // 延迟触发入场动画
    requestAnimationFrame(function () {
      sheet.classList.add("open");
    });
  }

  /** 关闭项目操作菜单 */
  closeProjectSheet() {
    document.querySelectorAll(".project-sheet-overlay").forEach(function (el) {
      el.remove();
    });
    document.querySelectorAll(".project-sheet").forEach(function (el) {
      el.remove();
    });
  }

  /** 执行操作菜单中的动作 */
  _handleProjectSheetAction(action, projectId) {
    var app = this.app;
    var project = Store.getProjects().find(function (p) {
      return p.id === projectId;
    });
    if (!project) return;

    if (action === "view") {
      app.currentProjectId = projectId;
      this.renderSamples(projectId);
      app.showView("samples");
    } else if (action === "edit") {
      app.initProjectTimeSelects();
      app.openModal("projectModal");
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
        .querySelector('[data-value="' + (isProc ? "集采" : "非集采") + '"]')
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
      var submitBtn = document.querySelector(
        '#projectForm button[type="submit"]',
      );
      submitBtn.disabled = false;
      submitBtn.textContent = "保存";
    } else if (action === "delete") {
      app.promptDelete("project", project.id, "类别 " + project.name);
    }
  }

  // ============ 样板列表视图 ============
  renderSampleTable() {
    this.app._allSamples = Store.getSamples() || [];
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
    var searchTerm = (this.app._projectSearch || "").toLowerCase();
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
    var brandFlt = this.app._projectBrandFlt || "";
    var catFlt = this.app._projectCatFlt || "";
    var procFlt = this.app._projectProcFlt || "";
    var rangeFlt = this.app._projectRangeFlt || "";

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

  // ============ 样板卡片渲染 ============
  _renderOneCard(project, sample) {
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
          <input type="checkbox" class="sample-checkbox" data-id="${sample.id}" ${this.app.selectedSamples.has(sample.id) ? "checked" : ""}>
          <div class="sample-image-wrap">
            ${
              sample.imageUrl
                ? `<img class="sample-image" src="${sample.thumbnailUrl || sample.imageUrl}" alt="${sample.name}" loading="lazy" data-fullsrc="${sample.imageUrl}">${sample._uploadFailed ? `<div class="sample-fail-watermark">FALSE</div>` : ""}${sample.imageUrl && !sample.thumbnailUrl ? `<button class="thumb-regen-btn" data-id="${sample.id}" title="重新生成缩略图"><i class="ph ph-arrow-clockwise"></i></button>` : ""}`
                : `<div class="sample-image-placeholder">空</div>`
            }
            <button class="btn-label-print" data-id="${sample.id}" title="打印标签" style="background:${labelBg};">标签</button>
            <div class="sample-card-overlay">
              <span class="sco-name">${sample.name}</span>
              <span class="sco-code">${sample.code || ""}</span>
            </div>
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
        if (cb.checked) self.app.selectedSamples.add(cb.dataset.id);
        else self.app.selectedSamples.delete(cb.dataset.id);
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
        if (sample) self.app.editSample(sample);
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
    const regenBtn = cardEl.querySelector(".thumb-regen-btn");
    if (regenBtn) {
      regenBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        e.preventDefault();
        regenBtn.classList.add("regenerating");
        var icon = regenBtn.querySelector("i");
        if (icon) {
          icon.className = "ph ph-spinner";
        }
        window.app.regenerateThumbnail(regenBtn.dataset.id);
      });
    }
    // 图片加载失败时显示"空"占位
    const img = cardEl.querySelector(".sample-image");
    if (img) {
      img.addEventListener("error", function () {
        var wrap = this.parentElement;
        if (!wrap) return;
        var ph = document.createElement("div");
        ph.className = "sample-image-placeholder";
        ph.textContent = "空";
        wrap.insertBefore(ph, this);
        this.remove();
      });
    }
  }

  async _refreshCardImage(cardEl) {
    var img = cardEl.querySelector(".sample-image");
    if (!img) return;
    var sampleId = cardEl.dataset.id;
    if (!sampleId) return;
    var samples = Store.getSamples();
    var sample = samples.find(function (s) {
      return s.id === sampleId;
    });
    if (!sample) return;
    var url = sample.imageUrl;
    if (!url || !url.includes("/object/sign/")) return;
    try {
      if (typeof refreshSignedUrl !== "undefined") {
        var fresh = await refreshSignedUrl(url);
        if (fresh && fresh !== url) {
          sample.imageUrl = fresh;
          sample.thumbnailUrl = fresh;
          Store.saveSamples(samples);
          img.src = fresh;
          img.dataset.fullsrc = fresh;
        }
      }
    } catch (_) {}
  }

  renderSamples(projectId) {
    const project = Store.getProjects().find((p) => p.id === projectId);
    if (!project) {
      this.renderProjects();
      this.app.showView("projects");
      return;
    }

    var allSamples = Store.getSamples().filter(
      (s) => s.projectId === projectId,
    );
    const container = document.getElementById("samplesContainer");
    this.app.selectedSamples.clear();
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

    console.log(
      "[RENDER] renderSamples project=",
      projectId,
      "total=",
      allSamples.length,
      "filtered=",
      samples.length,
      "sort=",
      this._sortState,
      "samples:",
      samples.map((s) => s.name + "(" + (s.code || "") + ")").join(","),
    );
    document.getElementById("currentProjectName").textContent = project.name;

    // 排序
    this._updateSortBtn();
    var self = this;
    samples.sort(function (a, b) {
      switch (self._sortState) {
        case 0: // 编号升序
          return (
            parseInt((a.code || "").split("-")[0] || "0", 10) -
            parseInt((b.code || "").split("-")[0] || "0", 10)
          );
        case 1: // 编号降序
          return (
            parseInt((b.code || "").split("-")[0] || "0", 10) -
            parseInt((a.code || "").split("-")[0] || "0", 10)
          );
        case 2: // 修改日期 updatedAt
          return (b.updatedAt || "").localeCompare(a.updatedAt || "");
        case 3: // 录入日期 createdAt
          return (b.createdAt || "").localeCompare(a.createdAt || "");
        default:
          return 0;
      }
    });

    if (samples.length === 0) {
      container.innerHTML = `
        <div class="sample-card sample-placeholder" id="placeholderSampleCard" style="display:flex;align-items:center;justify-content:center;flex-direction:column;gap:4px;">
          <span style="font-size:2rem;line-height:1;color:var(--primary)">+</span>
          <span style="font-size:0.8rem;color:var(--text-light)">录入样板</span>
        </div>
      `;
      return;
    }

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
        self._refreshCardImage(card);
      });

    // 手机端：单击样板卡片→底部弹出菜单
    container.addEventListener("click", function (e) {
      if (window.innerWidth > 768) return;
      var card = e.target.closest(".sample-card:not(.sample-placeholder)");
      if (!card || !card.dataset.id) return;
      if (e.target.closest("button") || e.target.closest(".sample-checkbox"))
        return;
      e.preventDefault();
      self.showSampleSheet(card.dataset.id);
    });

    this._markLocalOnlySamples(projectId);
  }

  async _markLocalOnlySamples(projectId) {
    if (!supabaseClient || !this.app.user || this.app.user.isDemo) return;
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
        // 跳过正在上传中的新建样板（还未写入 DB，等待 UploadManager 完成）
        if (s._pendingUpload) continue;
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
    const count = this.app.selectedSamples.size;
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
    const allCards = document.querySelectorAll(".sample-card[data-id]");
    const allChecked = Array.from(
      document.querySelectorAll(".sample-checkbox"),
    ).every((cb) => cb.checked);
    const newState = !allChecked;
    document.getElementById("selectAllBtn").textContent = newState
      ? "取消全选"
      : "全选";
    this.app.selectedSamples.clear();
    document.querySelectorAll(".sample-checkbox").forEach((cb) => {
      cb.checked = newState;
      if (newState) this.app.selectedSamples.add(cb.dataset.id);
    });
    this.updateBatchBtns();
  }

  // ============ 样板详情 ============
  async showSampleDetail(sampleId) {
    const sample = Store.getSamples().find((s) => s.id === sampleId);
    if (!sample) return;

    const project = Store.getProjects().find((p) => p.id === sample.projectId);

    const container = document.getElementById("sampleDetailContainer");
    const qrUrl = await qrPageUrl(sample.id);

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

    this.app.showView("sampleDetail");
  }

  // ============ 标签打印 ============
  async showSingleLabel(sampleId) {
    const samples = Store.getSamples();
    const sample = samples.find((s) => s.id === sampleId);
    if (!sample) return;

    const projects = Store.getProjects();
    const project = projects.find((p) => p.id === sample.projectId);
    const qrUrl = await qrPageUrl(sample.id);

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
        label.style.width = "";
      }
    }, 50);

    this.app.openModal("labelPreviewModal");

    // 点击标签内容外部关闭弹窗
    if (!modal.dataset.closeReady) {
      modal.addEventListener("click", (e) => {
        if (!e.target.closest(".print-label-wrap")) {
          modal.classList.remove("active");
        }
      });
      modal.dataset.closeReady = "1";
    }
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

  async renderLabels() {
    const container = document.getElementById("labelsContainer");
    const samples = Store.getSamples();
    const projects = Store.getProjects();

    const labelsToPrint =
      this.app.selectedSamples.size > 0
        ? samples.filter((s) => this.app.selectedSamples.has(s.id))
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
          this.app.selectedLabels.label1
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
          this.app.selectedLabels.label2
            ? `
        <div class="print-label-capsule">
          <div class="capsule-circle" style="background:${color}"></div>
          <div class="capsule-code">${capsuleText}</div>
        </div>
        `
            : ""
        }
        ${
          this.app.selectedLabels.label3
            ? this.renderLabelExtra(sample, project, dividerColor, badgeInfo)
            : ""
        }
        </div>
      `;
      })
      .join("");

    for (var _i = 0; _i < labelsToPrint.length; _i++) {
      var sample = labelsToPrint[_i];
      const url = await qrPageUrl(sample.id);
      var canvas = document.getElementById("qr-" + sample.id);
      if (canvas) {
        drawQRCode(canvas, url);
      }
      if (this.app.selectedLabels.label3) {
        var extraCanvas = document.getElementById("extraQr-" + sample.id);
        if (extraCanvas) {
          drawQRCode(extraCanvas, url);
        }
      }
    }

    if (container._dismissHandler) {
      container.removeEventListener("click", container._dismissHandler);
    }
    const dismissLabels = (e) => {
      if (e.target.closest(".print-label-wrap")) return;
      if (this.app.currentProjectId) {
        this.renderSamples(this.app.currentProjectId);
        this.app.showView("samples");
      } else {
        this.renderProjects();
        this.app.showView("projects");
      }
    };
    container._dismissHandler = dismissLabels;
    container.addEventListener("click", dismissLabels);
  }

  showLabelTypeModal() {
    document.getElementById("labelType1").checked =
      this.app.selectedLabels.label1 !== false;
    document.getElementById("labelType2").checked =
      this.app.selectedLabels.label2 !== false;
    document.getElementById("labelType3").checked =
      this.app.selectedLabels.label3 !== false;
    this.app.openModal("labelTypeModal");
  }

  confirmLabelTypePrint() {
    this.app.selectedLabels = {
      label1: document.getElementById("labelType1").checked,
      label2: document.getElementById("labelType2").checked,
      label3: document.getElementById("labelType3").checked,
    };
    this.app.closeModal("labelTypeModal");
    this.batchPrint();
  }

  async batchPrint() {
    await this.renderLabels();
    this.app.showView("labels");
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

  // ============ 手机端样本底部弹出菜单 ============
  showSampleSheet(sampleId) {
    var sample = Store.getSamples().find(function (s) {
      return s.id === sampleId;
    });
    if (!sample) return;
    var project = Store.getProjects().find(function (p) {
      return p.id === sample.projectId;
    });
    var self = this;

    // 已有弹窗则关闭
    this.closeSampleSheet();

    // 遮罩层
    var overlay = document.createElement("div");
    overlay.className = "project-sheet-overlay";
    overlay.addEventListener("click", function () {
      self.closeSampleSheet();
    });
    document.body.appendChild(overlay);

    // 构建信息区
    var procurementLabel = project && project.procurement ? "集采" : "非集采";
    var infoHtml =
      '<div class="sheet-info-name">' +
      esc(sample.name) +
      "</div>" +
      '<div class="sheet-info-row"><span class="sheet-info-label">编号</span><span>' +
      esc(sample.code || "-") +
      "</span></div>" +
      '<div class="sheet-info-row"><span class="sheet-info-label">型号</span><span>' +
      esc(sample.model || "-") +
      "</span></div>" +
      '<div class="sheet-info-row"><span class="sheet-info-label">品牌</span><span>' +
      esc(sample.brand || "-") +
      "</span></div>" +
      '<div class="sheet-info-row"><span class="sheet-info-label">类别</span><span>' +
      esc(project ? project.name : "-") +
      "</span></div>";

    if (sample.specs)
      infoHtml +=
        '<div class="sheet-info-row"><span class="sheet-info-label">规格</span><span>' +
        esc(sample.specs) +
        "</span></div>";
    if (sample.color)
      infoHtml +=
        '<div class="sheet-info-row"><span class="sheet-info-label">颜色</span><span>' +
        esc(sample.color) +
        "</span></div>";
    if (sample.material)
      infoHtml +=
        '<div class="sheet-info-row"><span class="sheet-info-label">材质</span><span>' +
        esc(sample.material) +
        "</span></div>";

    if (sample.description) {
      infoHtml +=
        '<div class="sheet-info-desc">' + esc(sample.description) + "</div>";
    }

    infoHtml += '<div class="sheet-info-row" style="margin-top:6px">';
    infoHtml +=
      '<span class="card-badge ' +
      (procurementLabel === "集采" ? "procurement" : "non-procurement") +
      '">' +
      procurementLabel +
      "</span>";
    if (project && project.procurement) {
      var rangeVal = sample.procurementRange || "范围内";
      infoHtml +=
        '<span style="font-size:0.78rem;color:#6b7280;margin-left:4px">' +
        esc(rangeVal) +
        "</span>";
    }
    infoHtml += "</div>";

    if (sample.imageUrl) {
      infoHtml +=
        '<div style="margin-top:10px"><img src="' +
        esc(sample.thumbnailUrl || sample.imageUrl) +
        '" alt="' +
        esc(sample.name) +
        '" style="width:100%;border-radius:8px;max-height:200px;object-fit:cover"></div>';
    }

    // 底部弹窗
    var sheet = document.createElement("div");
    sheet.className = "project-sheet";
    sheet.innerHTML =
      '<div class="sheet-handle-wrap"><div class="sheet-handle"></div></div>' +
      '<div class="sheet-info">' +
      infoHtml +
      "</div>" +
      '<div class="sheet-actions">' +
      // 编辑
      '<button class="sheet-action sheet-action--edit" data-action="edit" data-id="' +
      sample.id +
      '">' +
      '<span class="sheet-act-icon">' +
      '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>' +
      "</span>" +
      '<span class="sheet-act-text"><span class="sheet-act-label">编辑样板</span><span class="sheet-act-desc">修改样板信息</span></span>' +
      "</button>" +
      // 标签
      '<button class="sheet-action sheet-action--label" data-action="label" data-id="' +
      sample.id +
      '">' +
      '<span class="sheet-act-icon">' +
      '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>' +
      "</span>" +
      '<span class="sheet-act-text"><span class="sheet-act-label">打印标签</span><span class="sheet-act-desc">查看或打印标签</span></span>' +
      "</button>" +
      // 删除
      '<button class="sheet-action sheet-action--danger" data-action="delete" data-id="' +
      sample.id +
      '">' +
      '<span class="sheet-act-icon">' +
      '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>' +
      "</span>" +
      '<span class="sheet-act-text"><span class="sheet-act-label">删除样板</span><span class="sheet-act-desc">删除后不可恢复</span></span>' +
      "</button>" +
      "</div>";

    // 绑定操作按钮
    sheet.querySelectorAll(".sheet-action").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var action = btn.dataset.action;
        var id = btn.dataset.id;
        self.closeSampleSheet();
        if (action === "edit") {
          self.app.editSample(sample);
        } else if (action === "label") {
          self.showSingleLabel(id);
        } else if (action === "delete") {
          window.app.promptDelete("sample", id, "样板 " + sample.name);
        }
      });
    });

    document.body.appendChild(sheet);

    // 延迟触发入场动画
    requestAnimationFrame(function () {
      sheet.classList.add("open");
    });
  }

  /** 关闭样本操作菜单 */
  closeSampleSheet() {
    document.querySelectorAll(".project-sheet-overlay").forEach(function (el) {
      el.remove();
    });
    document.querySelectorAll(".project-sheet").forEach(function (el) {
      el.remove();
    });
  }

  // ============ 信息控制页 ============
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
}
