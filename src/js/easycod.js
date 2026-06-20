/**
 * EasyCod 页面 — 类别管理 / 样板管理 / 信息控制
 * 独立于 app.js 的事件绑定，在 HTML 注入 DOM 后执行
 */

const Easycod = {
  async load() {
    if (document.getElementById("projectsSection")) return;
    try {
      const res = await fetch("src/html/easycod.html");
      const html = await res.text();
      // 页面区块注入 #appSection，弹窗注入 body 末尾
      const target = document.querySelector("#labelsSection");
      if (target) {
        target.insertAdjacentHTML("beforebegin", html);
      }
      // 将所有弹窗移到 body 末尾，避免 iOS Safari 上 overflow:hidden 父容器导致输入框无法获取焦点
      document.querySelectorAll(".modal-overlay").forEach((modal) => {
        document.body.appendChild(modal);
      });
      this.bindEvents();
    } catch (e) {
      console.warn("easycod pages load failed:", e);
    }
  },

  bindEvents() {
    const app = window.app;

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
            app._projectView = view;
            app.renderProjects();
          }.bind(btn),
        );
      });

    // 类别页搜索框
    document
      .getElementById("projectSearchInput")
      .addEventListener("input", function () {
        app._projectSearch = this.value.trim();
        app.renderProjects();
      });

    // 类别页筛选（select 类型的筛选器）
    ["projectBrandFilter", "projectCategoryFilter"].forEach(function (id) {
      var el = document.getElementById(id);
      if (el)
        el.addEventListener("change", function () {
          app.renderProjects();
        });
    });

    // 是否集采 / 集采范围 — 切换按钮
    ["projectProcFilter", "projectRangeFilter"].forEach(function (id) {
      var container = document.getElementById(id);
      if (!container) return;
      container.addEventListener("click", function (e) {
        var btn = e.target.closest(".toggle-btn");
        if (!btn) return;
        container.querySelectorAll(".toggle-btn").forEach(function (b) {
          b.classList.remove("active");
        });
        btn.classList.add("active");
        app.renderProjects();
      });
    });
    // 刷新按钮 — 增量同步，每10次全量兜底
    document
      .getElementById("projectRefreshBtn")
      .addEventListener("click", async () => {
        if (!supabaseClient) return;
        var btn = document.getElementById("projectRefreshBtn");
        btn.classList.add("spinning");
        try {
          var count =
            (parseInt(localStorage.getItem("easycod_refresh_count"), 10) || 0) +
            1;
          localStorage.setItem("easycod_refresh_count", count);
          var lastSync = localStorage.getItem("easycod_last_sync");
          var doFullSync = count % 10 === 0 || !lastSync;

          if (doFullSync) {
            // 全量同步
            await Store.loadProjectsFromDB();
            await Store.loadSamplesFromDB();
          } else {
            // 增量同步：只拉变更数据
            var deltaProjects =
              await Store.loadProjectsFromDBIncremental(lastSync);
            var deltaSamples =
              await Store.loadSamplesFromDBIncremental(lastSync);
            Store.mergeProjects(deltaProjects);
            Store.mergeSamples(deltaSamples);
          }

          localStorage.setItem("easycod_last_sync", new Date().toISOString());
          app.renderProjects();
          app.showToast("数据已刷新", "success");
        } catch (e) {
          app.showToast("刷新失败: " + e.message, "error");
        } finally {
          btn.classList.remove("spinning");
        }
      });

    // 样板页面刷新按钮 — 只刷新当前项目的 samples
    document
      .getElementById("refreshSamplesBtn")
      .addEventListener("click", async () => {
        if (!supabaseClient) return;
        var btn = document.getElementById("refreshSamplesBtn");
        btn.classList.add("spinning");
        try {
          var count =
            (parseInt(
              localStorage.getItem("easycod_samples_refresh_count"),
              10,
            ) || 0) + 1;
          localStorage.setItem("easycod_samples_refresh_count", count);
          var lastSync = localStorage.getItem("easycod_samples_last_sync");
          var doFullSync = count % 10 === 0 || !lastSync;

          if (doFullSync) {
            await Store.loadSamplesFromDB();
          } else {
            var deltaSamples =
              await Store.loadSamplesFromDBIncremental(lastSync);
            Store.mergeSamples(deltaSamples);
          }

          localStorage.setItem(
            "easycod_samples_last_sync",
            new Date().toISOString(),
          );
          app.renderSamples(app.currentProjectId);
          app.showToast("样板数据已刷新", "success");
        } catch (e) {
          app.showToast("刷新失败: " + e.message, "error");
        } finally {
          btn.classList.remove("spinning");
        }
      });

    // 新建类别
    document
      .getElementById("createProjectBtn")
      .addEventListener("click", () => {
        app.openModal("projectModal");
        document.getElementById("projectModalTitle").textContent = "新建类别";
        document.getElementById("projectForm").reset();
        document.getElementById("projectId").value = "";
        app.initProjectTimeSelects();
        document.getElementById("procTimeRow").style.display = "none";
        var capsule = document.getElementById("projectProcCapsule");
        capsule.querySelector('[data-value="非集采"]').classList.add("active");
        capsule.querySelector('[data-value="集采"]').classList.remove("active");
        // 重置提交按钮状态
        const submitBtn = document.querySelector(
          '#projectForm button[type="submit"]',
        );
        submitBtn.disabled = false;
        submitBtn.textContent = "保存";
      });

    // 占位卡片点击 — 触发新建品类
    document
      .getElementById("projectsContainer")
      .addEventListener("click", (e) => {
        const card = e.target.closest(".card-placeholder");
        if (card) {
          document.getElementById("createProjectBtn").click();
        }
      });

    // 样板占位卡片点击 — 触发录入样板
    document
      .getElementById("samplesContainer")
      .addEventListener("click", (e) => {
        const card = e.target.closest(".sample-placeholder");
        if (card) {
          document.getElementById("createSampleBtn").click();
        }
      });

    // 录入样板
    document.getElementById("createSampleBtn").addEventListener("click", () => {
      app.openModal("sampleModal");
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
        (p) => p.id === app.currentProjectId,
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
      const seq = nextSeqForProject(app.currentProjectId);
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

    // 批量打印
    document.getElementById("batchPrintBtn").addEventListener("click", () => {
      app.showLabelTypeModal();
    });

    // 批量删除
    document
      .getElementById("batchDeleteBtn")
      .addEventListener("click", function () {
        var ids = Array.from(app.selectedSamples);
        if (ids.length === 0) return;
        window.app.promptDelete(
          "batch_samples",
          JSON.stringify(ids),
          "选中 " + ids.length + " 个样板",
        );
      });

    // 全选
    document.getElementById("selectAllBtn").addEventListener("click", () => {
      app.selectAllSamples();
    });

    // 返回类别
    document.getElementById("backToProjects").addEventListener("click", () => {
      app.renderProjects();
      app.showView("projects");
    });

    // 样板品牌模糊匹配筛选
    var sb = document.getElementById("sampleBrandFilter");
    if (sb)
      sb.addEventListener("input", function () {
        if (app.currentProjectId) app.renderSamples(app.currentProjectId);
      });

    // 编辑类别 — 打开项目弹窗
    document
      .getElementById("editProjectSampleBtn")
      .addEventListener("click", () => {
        app.openModal("projectModal");
        document.getElementById("projectModalTitle").textContent = "编辑类别";
        app.initProjectTimeSelects();
        const project = Store.getProjects().find(
          (p) => p.id === app.currentProjectId,
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
        // 重置提交按钮状态
        const submitBtn = document.querySelector(
          '#projectForm button[type="submit"]',
        );
        submitBtn.disabled = false;
        submitBtn.textContent = "保存";
      });

    // ---- 弹窗事件 ----

    // 弹窗关闭按钮（×）
    document.querySelectorAll(".modal-close").forEach((btn) => {
      btn.addEventListener("click", () => {
        const overlay = btn.closest(".modal-overlay");
        if (overlay && overlay.id) {
          app.closeModal(overlay.id);
        }
      });
    });

    // 集采/非集采 切换（sampleModal 中 — 范围/范围外）
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

    // 集采/非集采 切换（projectModal 中）
    document.getElementById("projectModal").addEventListener("click", (e) => {
      const btn = e.target.closest(".vis-pill-btn");
      if (!btn || btn.disabled) return;
      const capsule = btn.closest(".vis-pill");
      if (!capsule) return;
      capsule
        .querySelectorAll(".vis-pill-btn")
        .forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      // 控制集采日期选择展开/折叠
      const isProc = btn.dataset.value === "集采";
      document.getElementById("procTimeRow").style.display = isProc
        ? "flex"
        : "none";
    });

    // 类别表单提交
    document
      .getElementById("projectForm")
      .addEventListener("submit", async (e) => {
        e.preventDefault();
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        // 三点循环动画
        let dots = 0;
        let dotDir = 1;
        const dotTimer = setInterval(() => {
          dots += dotDir;
          if (dots >= 3) dotDir = -1;
          if (dots <= 0) dotDir = 1;
          submitBtn.textContent = "保存中" + ".".repeat(dots);
        }, 400);
        try {
          await app.saveProject();
        } catch (err) {
          app.showToast("保存失败", "error");
        } finally {
          clearInterval(dotTimer);
          submitBtn.disabled = false;
          submitBtn.textContent = originalText;
        }
      });

    // 取消类别弹窗
    document
      .getElementById("cancelProjectBtn")
      .addEventListener("click", () => {
        app.closeModal("projectModal");
      });

    // 样板表单提交
    document.getElementById("sampleForm").addEventListener("submit", (e) => {
      e.preventDefault();
      const submitBtn = e.target.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.disabled = true;
      let dots = 0;
      let dotDir = 1;
      const dotTimer = setInterval(() => {
        dots += dotDir;
        if (dots >= 3) dotDir = -1;
        if (dots <= 0) dotDir = 1;
        submitBtn.textContent = "保存中" + ".".repeat(dots);
      }, 400);
      Promise.resolve(app.saveSample()).then(() => {
        clearInterval(dotTimer);
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      });
    });

    // 取消样板弹窗
    document.getElementById("cancelSampleBtn").addEventListener("click", () => {
      app.closeModal("sampleModal");
    });

    // 图片上传区域点击 → 触发文件选择
    document.getElementById("imageUploadArea").addEventListener("click", () => {
      document.getElementById("sampleImageInput").click();
    });

    // 图片文件选择 → 打开裁切
    document
      .getElementById("sampleImageInput")
      .addEventListener("change", async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        app.openCropModal(file);
      });

    // 裁切弹窗 — 确认 / 取消
    document.getElementById("cropApplyBtn").addEventListener("click", () => {
      app.finalizeCrop();
    });
    document.getElementById("cropDiscardBtn").addEventListener("click", () => {
      app.closeCropModal();
    });

    // 标签类型弹窗 — 确认 / 取消
    document
      .getElementById("labelTypeConfirm")
      .addEventListener("click", () => {
        app.confirmLabelTypePrint();
      });
    document.getElementById("labelTypeCancel").addEventListener("click", () => {
      app.closeModal("labelTypeModal");
    });

    // 上传进度 Toast — 重试按钮
    document
      .getElementById("progressToastContainer")
      .addEventListener("click", (e) => {
        const btn = e.target.closest(".progress-retry-btn");
        if (!btn) return;
        const taskId = btn.dataset.taskId;
        if (taskId) app.uploadManager.retry(taskId);
      });
  },
};
