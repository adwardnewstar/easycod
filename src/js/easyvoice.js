/**
 * EasyVoice — 语音助手管理
 * 独立于 app.js，在 HTML 注入 DOM 后执行
 * 通过 window.app 引用 App 实例
 */

const Easyvoice = {
  async load() {
    if (document.getElementById("voiceAssistantSection")) return;
    try {
      const res = await fetch("src/html/easyvoice.html");
      const html = await res.text();
      const container = document.querySelector("#appSection .container");
      if (container) {
        container.insertAdjacentHTML("beforeend", html);
      }
      this.bindEvents();
    } catch (e) {
      console.warn("easyvoice page load failed:", e);
    }
  },

  bindEvents() {
    const app = window.app;
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
      vaTabKnowledge: () => Easyvoice.renderKnowledge(),
      vaTabPersonality: () => Easyvoice.renderPersonality(),
      vaTabBehavior: () => Easyvoice.renderBehavior(),
      vaTabVerification: () => Easyvoice.renderVerification(),
      vaTabPrecipRules: () => Easyvoice.renderPrecipRules(),
      vaTabMemory: () => Easyvoice.renderMemory(),
      vaTabErrors: () => Easyvoice.renderErrors(),
      vaTabEmotion: () => Easyvoice.renderEmotion(),
      vaTabLogs: () => Easyvoice.renderLogs(),
      vaTabFunctions: () => Easyvoice.renderFunctions(),
      vaTabInstincts: () => Easyvoice.renderInstincts(),
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
      Easyvoice.runDailySummary();
    });

    // 刷新：重渲当前可见标签
    document.getElementById("vaRefreshBtn").addEventListener("click", () => {
      const activeTabId = vaTabIds.find(
        (tid) => document.getElementById(vaTabs[tid]).style.display !== "none",
      );
      if (activeTabId && vaRenderMap[activeTabId]) {
        vaRenderMap[activeTabId]();
      }
      app.showToast("已刷新", "success");
    });
  },

  // ============ 入口 ============

  renderView() {
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
    Easyvoice.renderKnowledge();
  },

  // ============ 知识库（基础知识 + 动态数据） ============
  _knowledgeSubTab: "static", // 'static' | 'dynamic'

  async renderKnowledge() {
    const container = document.getElementById("vaKnowledgeContainer");
    if (!supabaseClient) {
      container.innerHTML = '<p style="color: var(--text-secondary);">Supabase 未连接</p>';
      return;
    }
    // Sub-tab buttons
    container.innerHTML =
      '<div style="display: flex; gap: 8px; margin-bottom: 12px;">' +
      '<button id="vaSubKnowledgeStatic" class="toolbar-btn ' +
      (this._knowledgeSubTab === "static" ? "btn-primary" : "btn-secondary") +
      '" style="border-radius:3px;font-size:0.82rem;">📋 基础知识</button>' +
      '<button id="vaSubKnowledgeDynamic" class="toolbar-btn ' +
      (this._knowledgeSubTab === "dynamic" ? "btn-primary" : "btn-secondary") +
      '" style="border-radius:3px;font-size:0.82rem;">📊 动态数据</button>' +
      '</div><div id="vaKnowledgeSubContainer"></div>';
    document.getElementById("vaSubKnowledgeStatic").addEventListener("click", () => {
      this._knowledgeSubTab = "static";
      this.renderKnowledge();
    });
    document.getElementById("vaSubKnowledgeDynamic").addEventListener("click", () => {
      this._knowledgeSubTab = "dynamic";
      this.renderKnowledge();
    });
    if (this._knowledgeSubTab === "static") {
      this.renderStaticKnowledge();
    } else {
      this.renderDynamicKnowledge();
    }
  },

  /** 基础知识：手动编辑（type=static） */
  async renderStaticKnowledge() {
    const container = document.getElementById("vaKnowledgeSubContainer");
    container.innerHTML = '<p style="color: var(--text-secondary);">加载中...</p>';
    try {
      const { data, error } = await supabaseClient
        .from("ev_knowledge_base")
        .select("content, version, updated_at")
        .eq("type", "static")
        .order("version", { ascending: false })
        .limit(1)
        .single();
      if (error && error.code !== "PGRST116") throw error;
      const content = data?.content || "";
      const version = data?.version || 0;
      const updatedAt = data?.updated_at ? window.app._fmtDT(data.updated_at) : "-";
      container.innerHTML =
        '<div style="margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center;">' +
        '<span style="font-size: 0.82rem; color: var(--text-secondary);">版本: ' + version + " · 更新: " + updatedAt + "</span>" +
        '<div style="display: flex; gap: 8px;">' +
        '<button id="vaKnowledgeRefreshBtn" class="toolbar-btn btn-secondary" style="font-size:0.78rem;">⟳ 刷新</button>' +
        '<button id="vaSaveKnowledgeBtn" class="toolbar-btn btn-primary" style="border-radius:3px;">💾 保存</button>' +
        "</div></div>" +
        '<textarea id="vaKnowledgeEditor" style="width:100%;min-height:400px;padding:12px;border:1px solid var(--border);border-radius:3px;font-size:0.85rem;font-family:inherit;resize:vertical;background:var(--bg);color:var(--text);box-sizing:border-box;">' +
        window.app._esc(content) + "</textarea>";
      document.getElementById("vaKnowledgeRefreshBtn").addEventListener("click", () => {
        this.renderStaticKnowledge();
      });
      document.getElementById("vaSaveKnowledgeBtn").addEventListener("click", async () => {
        const newContent = document.getElementById("vaKnowledgeEditor").value;
        const btn = document.getElementById("vaSaveKnowledgeBtn");
        btn.textContent = "保存中..."; btn.disabled = true;
        try {
          const { error: insertErr } = await supabaseClient
            .from("ev_knowledge_base")
            .insert({ content: newContent, version: version + 1, type: "static" });
          if (insertErr) throw insertErr;
          window.app.showToast("基础知识保存成功", "success");
          this.renderStaticKnowledge();
        } catch (e) {
          window.app.showToast("保存失败: " + e.message, "error");
          btn.textContent = "💾 保存"; btn.disabled = false;
        }
      });
    } catch (e) {
      container.innerHTML = '<p style="color: var(--danger);">加载失败: ' + window.app._esc(e.message) + "</p>";
    }
  },

  /** 动态数据：模板编辑 + 同步按钮（type=dynamic） */
  async renderDynamicKnowledge() {
    const container = document.getElementById("vaKnowledgeSubContainer");
    container.innerHTML = '<p style="color: var(--text-secondary);">加载中...</p>';
    try {
      const { data, error } = await supabaseClient
        .from("ev_knowledge_base")
        .select("content, version, updated_at")
        .eq("type", "dynamic")
        .order("version", { ascending: false })
        .limit(1)
        .single();
      if (error && error.code !== "PGRST116") throw error;
      const content = data?.content || "";
      const version = data?.version || 0;
      const updatedAt = data?.updated_at ? window.app._fmtDT(data.updated_at) : "-";
      container.innerHTML =
        '<div style="margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center;">' +
        '<span style="font-size: 0.82rem; color: var(--text-secondary);">模板 · 版本: ' + version + " · 更新: " + updatedAt + "</span>" +
        '<div style="display: flex; gap: 8px;">' +
        '<button id="vaSyncDynamicBtn" class="toolbar-btn btn-primary" style="border-radius:3px;font-size:0.82rem;">🔄 同步更新</button>' +
        '<button id="vaSaveDynamicTemplateBtn" class="toolbar-btn btn-secondary" style="font-size:0.78rem;">💾 保存模板</button>' +
        "</div></div>" +
        '<textarea id="vaDynamicEditor" style="width:100%;min-height:300px;padding:12px;border:1px solid var(--border);border-radius:3px;font-size:0.85rem;font-family:inherit;resize:vertical;background:var(--bg);color:var(--text);box-sizing:border-box;">' +
        window.app._esc(content) + "</textarea>" +
        '<p style="margin-top:6px;font-size:0.75rem;color:var(--text-secondary);">占位符：{样板总数} {集采内} {集采外} {品牌列表} {品牌详情} {品类品牌列表} {总订单数} {已提交订单数} {总申请人数} {总到访人数} {日到访数} {周到访数} {月到访数} {更新时间}</p>' +
        '<div id="vaDynamicResult" style="margin-top:12px;padding:12px;border:1px solid var(--border);border-radius:3px;background:var(--bg);font-size:0.82rem;color:var(--text);display:none;white-space:pre-wrap;"></div>';

      // Sync button
      document.getElementById("vaSyncDynamicBtn").addEventListener("click", async () => {
         const btn = document.getElementById("vaSyncDynamicBtn");
         btn.textContent = "同步中..."; btn.disabled = true;
         try {
           const syncedContent = await Easyvoice._syncDynamicKnowledge();
           const resultDiv = document.getElementById("vaDynamicResult");
           resultDiv.textContent = syncedContent;
           resultDiv.style.display = "block";
           const { error: insertErr } = await supabaseClient
             .from("ev_knowledge_base")
             .insert({ content: syncedContent, version: version + 1, type: "dynamic" });
           if (insertErr) throw insertErr;
           window.app.showToast("动态数据同步成功", "success");
           this.renderDynamicKnowledge();
         } catch (e) {
           window.app.showToast("同步失败: " + e.message, "error");
           btn.textContent = "🔄 同步更新"; btn.disabled = false;
         }
       });

      // Save template button
      document.getElementById("vaSaveDynamicTemplateBtn").addEventListener("click", async () => {
        const newContent = document.getElementById("vaDynamicEditor").value;
        const btn = document.getElementById("vaSaveDynamicTemplateBtn");
        btn.textContent = "保存中..."; btn.disabled = true;
        try {
          const { error: insertErr } = await supabaseClient
            .from("ev_knowledge_base")
            .insert({ content: newContent, version: version + 1, type: "dynamic" });
          if (insertErr) throw insertErr;
          window.app.showToast("动态模板保存成功", "success");
          this.renderDynamicKnowledge();
        } catch (e) {
          window.app.showToast("保存失败: " + e.message, "error");
          btn.textContent = "💾 保存模板"; btn.disabled = false;
        }
      });
    } catch (e) {
      container.innerHTML = '<p style="color: var(--danger);">加载失败: ' + window.app._esc(e.message) + "</p>";
    }
  },

  /** 同步动态数据：从业务表查询最新数字并替换模板占位符 */
  async _syncDynamicKnowledge() {
    const now = new Date();
    const nowISO = now.toISOString();
    const dayAgo = new Date(now - 864e5).toISOString();
    const weekAgo = new Date(now - 7 * 864e5).toISOString();
    const monthAgo = new Date(now - 30 * 864e5).toISOString();
    const fmt = now.toLocaleString("zh-CN", { hour12: false });

    // 1. Samples: total, procurement, brands
    const { data: samples } = await supabaseClient.from("samples").select("id, project_id, procurement");
    const sampleTotal = samples?.length || 0;
    const sampleIn = samples?.filter(s => s.procurement).length || 0;
    const sampleOut = sampleTotal - sampleIn;

    // 2. Projects -> category-brand mapping
    const { data: projects } = await supabaseClient.from("projects").select("id, name, brand, procurement");
    const projectMap = {};
    for (const p of projects || []) {
      projectMap[p.id] = { name: p.name, brand: p.brand, procurement: p.procurement };
    }

    // Brand stats: count samples per brand/project
    const brandStats = {};
    const brandSet = new Set();
    for (const s of samples || []) {
      const prj = projectMap[s.project_id];
      if (!prj) continue;
      const key = prj.name;
      if (!brandStats[key]) brandStats[key] = { brand: prj.brand, procurement: prj.procurement, total: 0, inProcurement: 0 };
      brandStats[key].total++;
      if (s.procurement) brandStats[key].inProcurement++;
      brandSet.add(prj.brand);
    }

    // Brand detail lines
    const brandLines = [];
    for (const [name, stat] of Object.entries(brandStats)) {
      const status = stat.procurement ? "集采品牌" : "非集采品牌";
      brandLines.push(`  · ${name}（${status}），品牌 ${stat.brand || "—"}，共 ${stat.total} 个，集采内 ${stat.inProcurement} 个，集采外 ${stat.total - stat.inProcurement} 个`);
    }
    const brandDetail = brandLines.length > 0 ? brandLines.join("\n") : "暂无数据";

    // Category → brand list
    const categoryMap = {};
    for (const p of projects || []) {
      if (!categoryMap[p.name]) categoryMap[p.name] = new Set();
      if (p.brand) categoryMap[p.name].add(p.brand);
    }
    const categoryLines = [];
    for (const [cat, brands] of Object.entries(categoryMap)) {
      categoryLines.push(`  · ${cat}：${[...brands].join("、")}`);
    }
    const categoryList = categoryLines.length > 0 ? categoryLines.join("\n") : "暂无数据";

    // 3. Orders
    const { count: orderTotal } = await supabaseClient.from("orders").select("*", { count: "exact", head: true });
    const { count: orderSubmitted } = await supabaseClient
      .from("orders").select("*", { count: "exact", head: true })
      .eq("status", "已提交");
    const orderTotal2 = orderTotal || 0;
    const orderSub = orderSubmitted || 0;

    // 4. Apply records: total distinct users
    const { data: applyData } = await supabaseClient.from("apply_records").select("openid");
    const applicantSet = new Set((applyData || []).map(r => r.openid).filter(Boolean));
    const applicants = applicantSet.size;

    // 5. Clock records: visitors total, daily, weekly, monthly
    const { data: clockData } = await supabaseClient.from("clock_records").select("openid, clock_time");
    const visitorSet = new Set((clockData || []).map(r => r.openid).filter(Boolean));
    const visitors = visitorSet.size;
    const dailyVisitors = (clockData || []).filter(r => r.clock_time >= dayAgo).length;
    const weeklyVisitors = (clockData || []).filter(r => r.clock_time >= weekAgo).length;
    const monthlyVisitors = (clockData || []).filter(r => r.clock_time >= monthAgo).length;

    // Build result
    return [
      "【样板数据】",
      `总样板 ${sampleTotal} 个，集采范围内 ${sampleIn} 个，集采范围外 ${sampleOut} 个。`,
      `展览品牌：${[...brandSet].join("、") || "暂无"}。`,
      "",
      "【品牌统计】",
      brandDetail,
      "",
      "【品类展厅】",
      categoryList,
      "",
      "【订单数据】",
      `总订单 ${orderTotal2} 个，已提交 ${orderSub} 个。`,
      `总申请人数：${applicants} 人。`,
      "",
      "【到访数据】",
      `总到访 ${visitors} 人。最近一天 ${dailyVisitors} 人，一周 ${weeklyVisitors} 人，一月 ${monthlyVisitors} 人。`,
      "",
      `（同步于 ${fmt}）`,
    ].join("\n");
  },

  // ============ 人格库（可编辑） ============
  async renderPersonality() {
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
              window.app._esc(r.personality_key || r.key || "") +
              "</td>" +
              '<td style="padding: 6px 8px; border-bottom: 1px solid var(--border);">' +
              '<input class="va-person-val" data-id="' +
              r.id +
              '" data-key="' +
              _escAttr(r.personality_key || r.key || "") +
              '" value="' +
              _escAttr(r.personality_value || r.value || "") +
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
        .addEventListener("click", () => Easyvoice.renderPersonality());

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
            window.app.showToast("键和值不能为空", "error");
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
            window.app.showToast("已添加", "success");
            Easyvoice.renderPersonality();
          } catch (e) {
            window.app.showToast("添加失败: " + e.message, "error");
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
            window.app.showToast("已保存", "success");
            btn.textContent = "保存";
            btn.disabled = false;
          } catch (e) {
            window.app.showToast("保存失败: " + e.message, "error");
            btn.textContent = "保存";
            btn.disabled = false;
          }
        });
      });

      // 绑定删除
      container.querySelectorAll("[data-va-del-person]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const id = btn.getAttribute("data-va-del-person");
          window.app.promptDelete("vaPersonality", id, "人格库条目 #" + id);
        });
      });
    } catch (e) {
      container.innerHTML =
        '<p style="color: var(--danger);">加载失败: ' +
        window.app._esc(e.message) +
        "</p>";
    }
  },

  // ============ 行为库（可编辑） ============
  async renderBehavior() {
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
              window.app._esc(r.behavior_key || r.key || "") +
              "</td>" +
              '<td style="padding: 6px 8px; border-bottom: 1px solid var(--border);">' +
              '<input class="va-behav-val" data-id="' +
              r.id +
              '" value="' +
              _escAttr(r.behavior_value || r.value || "") +
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
        .addEventListener("click", () => Easyvoice.renderBehavior());

      document
        .getElementById("vaBehavAddBtn")
        .addEventListener("click", async () => {
          const layer = document.getElementById("vaBehavNewLayer").value;
          const key = document.getElementById("vaBehavNewKey").value.trim();
          const value = document.getElementById("vaBehavNewValue").value.trim();
          const sort =
            parseInt(document.getElementById("vaBehavNewSort").value) || 99;
          if (!key || !value) {
            window.app.showToast("键和值不能为空", "error");
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
            window.app.showToast("已添加", "success");
            Easyvoice.renderBehavior();
          } catch (e) {
            window.app.showToast("添加失败: " + e.message, "error");
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
            window.app.showToast("已保存", "success");
            btn.textContent = "保存";
            btn.disabled = false;
          } catch (e) {
            window.app.showToast("保存失败: " + e.message, "error");
            btn.textContent = "保存";
            btn.disabled = false;
          }
        });
      });

      container.querySelectorAll("[data-va-del-behav]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const id = btn.getAttribute("data-va-del-behav");
          window.app.promptDelete("vaBehavior", id, "行为库条目 #" + id);
        });
      });
    } catch (e) {
      container.innerHTML =
        '<p style="color: var(--danger);">加载失败: ' +
        window.app._esc(e.message) +
        "</p>";
    }
  },

  // ============ 核验层（可编辑） ============
  async renderVerification() {
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
              window.app._esc(r.rule_name || "") +
              "</span>" +
              '<input class="va-verif-name" data-id="' +
              r.id +
              '" value="' +
              _escAttr(r.rule_name || "") +
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
              _escAttr(r.check_desc || "") +
              "\" style=\"flex: 1; padding: 4px 8px; border: 1px solid transparent; border-radius: 3px; font-size: 0.8rem; background: transparent; color: var(--danger);\" onfocus=\"this.style.borderColor='var(--primary)';this.style.background='var(--bg)'\" onblur=\"this.style.borderColor='transparent';this.style.background='transparent'\">" +
              "</div>" +
              '<div style="display: flex; gap: 8px; align-items: center;">' +
              '<span style="font-size: 0.75rem; color: var(--text-secondary); min-width: 100px;">自检问题</span>' +
              '<input class="va-verif-detail" data-id="' +
              r.id +
              '" value="' +
              _escAttr(r.check_detail || "") +
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
        .addEventListener("click", () => Easyvoice.renderVerification());

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
            window.app.showToast("规则名称和不通过标准不能为空", "error");
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
            window.app.showToast("已添加", "success");
            Easyvoice.renderVerification();
          } catch (e) {
            window.app.showToast("添加失败: " + e.message, "error");
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
            window.app.showToast("已保存", "success");
            btn.textContent = "保存";
            btn.disabled = false;
          } catch (e) {
            window.app.showToast("保存失败: " + e.message, "error");
            btn.textContent = "保存";
            btn.disabled = false;
          }
        });
      });

      container.querySelectorAll("[data-va-del-verif]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const id = btn.getAttribute("data-va-del-verif");
          window.app.promptDelete("vaVerification", id, "核验规则 #" + id);
        });
      });
    } catch (e) {
      container.innerHTML =
        '<p style="color: var(--danger);">加载失败: ' +
        window.app._esc(e.message) +
        "</p>";
    }
  },

  // ============ 沉淀规则（可编辑） ============
  async renderPrecipRules() {
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
            _escAttr(r.dimension || "") +
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
            _escAttr(r.prompt || "") +
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
        .addEventListener("click", () => Easyvoice.renderPrecipRules());

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
            window.app.showToast("维度名称不能为空", "error");
            return;
          }
          const btn = document.getElementById("vaPrecipAddBtn");
          btn.textContent = "保存中...";
          btn.disabled = true;
          try {
            await supabaseClient
              .from("ev_precipitation_rules")
              .insert({ dimension: dim, priority, prompt });
            window.app.showToast("已添加", "success");
            Easyvoice.renderPrecipRules();
          } catch (e) {
            window.app.showToast("添加失败: " + e.message, "error");
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
            window.app.showToast("已保存", "success");
            btn.textContent = "保存";
            btn.disabled = false;
          } catch (e) {
            window.app.showToast("保存失败: " + e.message, "error");
            btn.textContent = "保存";
            btn.disabled = false;
          }
        });
      });

      container.querySelectorAll("[data-va-del-precip]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const id = btn.getAttribute("data-va-del-precip");
          window.app.promptDelete("vaPrecipRules", id, "沉淀规则 #" + id);
        });
      });
    } catch (e) {
      container.innerHTML =
        '<p style="color: var(--danger);">加载失败: ' +
        window.app._esc(e.message) +
        "</p>";
    }
  },

  // ============ 记忆库 ============
  async renderMemory() {
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
          window.app._fmtDT(m.created_at) +
          "</td>" +
          '<td style="padding: 6px 8px; border-bottom: 1px solid var(--border); font-weight: 500;">' +
          window.app._esc(m.memory_key) +
          "</td>" +
          '<td style="padding: 6px 8px; border-bottom: 1px solid var(--border); font-size: 0.78rem; color: var(--text-secondary); max-width: 150px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">' +
          window.app._esc(m.memory_summary || "") +
          "</td>" +
          '<td style="padding: 6px 8px; border-bottom: 1px solid var(--border);">' +
          window.app._esc(m.memory_value) +
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
        .addEventListener("click", () => Easyvoice.renderMemory());
      // 绑定删除事件
      container.querySelectorAll("[data-va-delete-memory]").forEach((btn) => {
        btn.addEventListener("click", async () => {
          const id = btn.getAttribute("data-va-delete-memory");
          try {
            await supabaseClient.from("ev_user_memory").delete().eq("id", id);
            window.app.showToast("已删除", "success");
            Easyvoice.renderMemory();
          } catch (e) {
            window.app.showToast("删除失败: " + e.message, "error");
          }
        });
      });
    } catch (e) {
      container.innerHTML =
        '<p style="color: var(--danger);">加载失败: ' +
        window.app._esc(e.message) +
        "</p>";
    }
  },

  // ============ 错误库 ============
  async renderErrors() {
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
      .addEventListener("click", () => Easyvoice.renderErrors());
    // 绑定提交
    document
      .getElementById("vaAddErrorBtn")
      .addEventListener("click", async () => {
        const fix = document.getElementById("vaErrFix").value.trim();
        if (!fix) {
          window.app.showToast("改进方向必填", "error");
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
          window.app.showToast("已写入，下次对话自动生效", "success");
          Easyvoice.renderErrors();
        } catch (e) {
          window.app.showToast("保存失败: " + e.message, "error");
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
          window.app._fmtDT(e.created_at) +
          "</span>" +
          '<button class="toolbar-btn btn-danger" style="padding: 2px 8px; font-size: 0.72rem;" data-va-delete-error="' +
          e.id +
          '">删除</button>' +
          "</div>" +
          '<div style="margin-bottom: 6px;"><span style="color: var(--text-secondary);">用户问题：</span>' +
          window.app._esc(e.user_input || "") +
          "</div>" +
          '<div style="margin-bottom: 6px;"><span style="color: var(--text-secondary);">依维回答：</span>' +
          window.app._esc(e.ai_response || "") +
          "</div>" +
          '<div style="margin-bottom: 6px;"><span style="color: var(--text-secondary);">改进方向：</span>' +
          window.app._esc(e.fix_suggest || "待分析") +
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
            window.app.showToast("已删除", "success");
            Easyvoice.renderErrors();
          } catch (e2) {
            window.app.showToast("删除失败: " + e2.message, "error");
          }
        });
      });
    } catch (e) {
      document.getElementById("vaErrorsList").innerHTML =
        '<p style="color: var(--danger);">加载失败: ' +
        window.app._esc(e.message) +
        "</p>";
    }
  },

  // ============ 情感趋势 ============
  async renderEmotion() {
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
          window.app._esc(r.summary || "") +
          "</td>" +
          "</tr>";
      }
      html += "</tbody></table></div>";
      container.innerHTML = html;
      // 绑定刷新
      document
        .getElementById("vaEmotionRefreshBtn")
        .addEventListener("click", () => Easyvoice.renderEmotion());
    } catch (e) {
      container.innerHTML =
        '<p style="color: var(--danger);">加载失败: ' +
        window.app._esc(e.message) +
        "</p>";
    }
  },

  // ============ 对话日志 ============
  async renderLogs() {
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
          _escAttr(log.user_message) +
          '" data-ai-resp="' +
          _escAttr(log.ai_response) +
          '">' +
          "</td>" +
          '<td style="padding: 6px 8px; border-bottom: 1px solid var(--border); white-space: nowrap;">' +
          window.app._fmtDT(log.created_at) +
          "</td>" +
          '<td style="padding: 6px 8px; border-bottom: 1px solid var(--border); font-family: monospace; font-size: 0.75rem; color: var(--text-secondary); white-space: nowrap; max-width: 100px; overflow: hidden; text-overflow: ellipsis;" title="' +
          _escAttr(log.session_id || "") +
          '">' +
          window.app._esc(log.session_id || "-") +
          "</td>" +
          '<td style="padding: 6px 8px; border-bottom: 1px solid var(--border); max-width: 160px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="' +
          window.app._esc(log.user_message) +
          '">' +
          window.app._esc(log.user_message) +
          "</td>" +
          '<td style="padding: 6px 8px; border-bottom: 1px solid var(--border); max-width: 240px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="' +
          window.app._esc(log.ai_response) +
          '">' +
          window.app._esc(log.ai_response) +
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
        .addEventListener("click", () => Easyvoice.renderLogs());

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
            window.app.showToast("请先勾选要总结的记录", "error");
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
            const summary = await _summaryVALogs(logs);
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
              window.app._esc(e.message) +
              "</span>";
          }
        });

      // 批量删除
      document
        .getElementById("vaLogsBatchDelBtn")
        .addEventListener("click", () => {
          const checks = container.querySelectorAll(".va-log-check:checked");
          if (checks.length === 0) {
            window.app.showToast("请先勾选要删除的记录", "error");
            return;
          }
          const ids = [];
          checks.forEach((cb) => ids.push(cb.getAttribute("data-log-id")));
          window.app.promptDelete(
            "batchVaChatLog",
            ids,
            "批量删除 " + ids.length + " 条对话记录",
          );
        });

      // 绑定删除事件
      container.querySelectorAll("[data-va-delete-log]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const id = btn.getAttribute("data-va-delete-log");
          window.app.promptDelete("vaChatLog", id, "对话记录");
        });
      });
    } catch (e) {
      container.innerHTML =
        '<p style="color: var(--danger);">加载失败: ' +
        window.app._esc(e.message) +
        "</p>";
    }
  },

  // ============ 函数技能库（可编辑） ============
  async renderFunctions() {
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
            window.app.showToast("默认函数已初始化", "success");
            Easyvoice.renderFunctions();
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
          _escAttr(fn.function_name || "") +
          "\" style=\"width: 100%; padding: 4px 8px; border: 1px solid transparent; border-radius: 3px; font-size: 0.82rem; background: transparent; color: var(--text); box-sizing: border-box; font-family: monospace;\" onfocus=\"this.style.borderColor='var(--primary)';this.style.background='var(--bg-secondary)'\" onblur=\"this.style.borderColor='transparent';this.style.background='transparent'\">" +
          "</td>" +
          '<td style="padding: 6px 8px; border-bottom: 1px solid var(--border);">' +
          '<input class="va-func-cn" data-id="' +
          fn.id +
          '" value="' +
          _escAttr(fn.cn_name || "") +
          "\" style=\"width: 100%; padding: 4px 8px; border: 1px solid transparent; border-radius: 3px; font-size: 0.82rem; background: transparent; color: var(--text); box-sizing: border-box;\" onfocus=\"this.style.borderColor='var(--primary)';this.style.background='var(--bg-secondary)'\" onblur=\"this.style.borderColor='transparent';this.style.background='transparent'\">" +
          "</td>" +
          '<td style="padding: 6px 8px; border-bottom: 1px solid var(--border);">' +
          '<textarea class="va-func-desc" data-id="' +
          fn.id +
          "\" style=\"width: 100%; padding: 4px 8px; border: 1px solid transparent; border-radius: 3px; font-size: 0.82rem; background: transparent; color: var(--text); box-sizing: border-box; resize: vertical; font-family: inherit; min-height: 28px;\" onfocus=\"this.style.borderColor='var(--primary)';this.style.background='var(--bg-secondary)'\" onblur=\"this.style.borderColor='transparent';this.style.background='transparent'\">" +
          window.app._esc(fn.description || "") +
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
        .addEventListener("click", () => Easyvoice.renderFunctions());

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
            window.app.showToast("函数名和描述不能为空", "error");
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
            window.app.showToast(
              "已添加（需在服务端添加 TOOL_HANDLER 才能执行）",
              "success",
            );
            Easyvoice.renderFunctions();
          } catch (e) {
            window.app.showToast("添加失败: " + e.message, "error");
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
            window.app.showToast("已保存", "success");
            btn.textContent = "保存";
            btn.disabled = false;
          } catch (e) {
            window.app.showToast("保存失败: " + e.message, "error");
            btn.textContent = "保存";
            btn.disabled = false;
          }
        });
      });

      // 绑定删除
      container.querySelectorAll("[data-va-del-func]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const id = btn.getAttribute("data-va-del-func");
          window.app.promptDelete("vaFunction", id, "函数 #" + id);
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
            window.app.showToast(enabled ? "已禁用" : "已启用", "success");
            Easyvoice.renderFunctions();
          } catch (e) {
            window.app.showToast("操作失败: " + e.message, "error");
          }
        });
      });
    } catch (e) {
      container.innerHTML =
        '<p style="color: var(--danger);">加载失败: ' +
        window.app._esc(e.message) +
        "</p>";
    }
  },

  // ===================== 本能库 - 自然语言规则 =====================
  async renderInstincts() {
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
            _escAttr(r.name || "") +
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
            window.app._esc(r.description || "") +
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
        .addEventListener("click", () => Easyvoice.renderInstincts());

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
            window.app.showToast("已新增", "success");
            Easyvoice.renderInstincts();
          } catch (e) {
            window.app.showToast("新增失败: " + e.message, "error");
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
            window.app.showToast("保存成功", "success");
          } catch (e) {
            window.app.showToast("保存失败: " + e.message, "error");
          }
        });
      });

      container.querySelectorAll("[data-va-del-instinct]").forEach((btn) => {
        btn.addEventListener("click", async () => {
          const id = parseInt(btn.dataset.vaDelInstinct);
          if (!confirm("确认删除这条本能规则？")) return;
          try {
            await supabaseClient.from("ev_instincts").delete().eq("id", id);
            window.app.showToast("已删除", "success");
            Easyvoice.renderInstincts();
          } catch (e) {
            window.app.showToast("删除失败: " + e.message, "error");
          }
        });
      });
    } catch (e) {
      container.innerHTML =
        '<p style="color: var(--danger);">加载失败: ' +
        window.app._esc(e.message) +
        "</p>";
    }
  },

  // ============ 每日沉淀 ============
  async runDailySummary() {
    if (!supabaseClient) {
      window.app.showToast("Supabase 未连接", "error");
      return;
    }
    window.app.showToast("正在分析今天的对话...", "info");
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
        window.app.showToast("今天暂无对话记录", "info");
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
          window.app._esc(aiResult) +
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
            window.app._esc(item.dimension) +
            "</div>" +
            '<div style="font-size: 0.8rem; color: var(--text); margin-bottom: 4px;">' +
            window.app._esc(item.content) +
            "</div>" +
            '<div style="font-size: 0.75rem; color: var(--text-secondary);">→ 建议写入：<strong>' +
            window.app._esc(item.target || "待定") +
            "</strong></div>" +
            "</div></div>";
        }
        html += "</div>";
        // 原始 AI 输出
        html +=
          '<details style="margin-top: 12px;"><summary style="cursor: pointer; font-size: 0.8rem; color: var(--text-secondary);">查看 AI 原始输出</summary>' +
          '<div style="padding: 12px; border: 1px solid var(--border); border-radius: 4px; margin-top: 8px; white-space: pre-wrap; font-size: 0.8rem; line-height: 1.6;">' +
          window.app._esc(aiResult) +
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
            window.app.showToast("请先勾选要分发的项目", "error");
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
            window.app.showToast("分发完成！" + results.join(", "), "success");
            distributeBtn.textContent = "📤 分发选中项到各库";
            distributeBtn.disabled = false;
          } catch (e) {
            window.app.showToast("分发失败: " + e.message, "error");
            distributeBtn.textContent = "📤 分发选中项到各库";
            distributeBtn.disabled = false;
          }
        });
      }
    } catch (e) {
      container.innerHTML =
        '<p style="color: var(--danger);">每日沉淀失败: ' +
        window.app._esc(e.message) +
        "</p>";
      window.app.showToast("每日沉淀失败: " + e.message, "error");
    }
  },
};

// ============ 辅助函数 ============

// 辅助：HTML属性转义
function _escAttr(s) {
  if (!s) return "";
  return s
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// 调用本地 chat-proxy 总结对话
async function _summaryVALogs(logs) {
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
