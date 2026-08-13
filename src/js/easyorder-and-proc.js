/**
 * EasyOrderAndProc — 订单/申请/打卡 + 审批管理
 * 独立于 app.js，在 HTML 注入 DOM 后执行
 * 通过 window.app 引用 App 实例
 */

const EasyorderAndproc = {
  // 内部状态
  _wfTemplates: [],
  _wfUsers: [],
  _aprRecords: [],

  async load() {
    if (document.getElementById("ordersSection")) return;
    try {
      const res = await fetch("src/html/easyorder-and-proc.html");
      const html = await res.text();
      // 注入到 #appSection .container，如果在 voiceAssistantSection 之后则紧随其后
      const voiceSection = document.querySelector("#voiceAssistantSection");
      if (voiceSection) {
        voiceSection.insertAdjacentHTML("afterend", html);
      } else {
        const container = document.querySelector("#appSection .container");
        if (container) container.insertAdjacentHTML("beforeend", html);
      }
      this.bindEvents();
    } catch (e) {
      console.warn("easyorder-and-proc page load failed:", e);
    }
  },

  bindEvents() {
    const app = window.app;

    document
      .getElementById("refreshOrdersBtn")
      .addEventListener("click", async () => {
        if (!supabaseClient) return;
        try {
          await Store.loadOrdersFromDB();
          EasyorderAndproc.renderOrders();
          app.showToast("订单数据已刷新", "success");
        } catch (e) {
          app.showToast("刷新失败: " + e.message, "error");
        }
      });
    document
      .getElementById("refreshApplyBtn")
      .addEventListener("click", async () => {
        if (!supabaseClient) return;
        try {
          await Store.loadApplyFromDB();
          EasyorderAndproc.renderApply();
          app.showToast("申请数据已刷新", "success");
        } catch (e) {
          app.showToast("刷新失败: " + e.message, "error");
        }
      });
    document
      .getElementById("refreshClockBtn")
      .addEventListener("click", async () => {
        if (!supabaseClient) return;
        try {
          await Store.loadClockFromDB();
          EasyorderAndproc.renderClock();
          app.showToast("打卡数据已刷新", "success");
        } catch (e) {
          app.showToast("刷新失败: " + e.message, "error");
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
        EasyorderAndproc.renderApprovalUsers();
        app.showToast("数据已刷新", "success");
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
        EasyorderAndproc.renderApprovalRecords();
        app.showToast("数据已刷新", "success");
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
        EasyorderAndproc.renderWorkflows();
        app.showToast("数据已刷新", "success");
      });
    }

    // 设置页刷新按钮（动态 DOM，委托到 container）
    document.addEventListener("click", function (e) {
      // ... 在内层处理
      _handleSettingsClick(e);
    });
    // 搜索框回车
    document.addEventListener("keydown", function (e) {
      if (e.key === "Enter" && e.target.id === "setLocationName") {
        EasyorderAndproc._searchLocation();
      }
    });
    // 半径修改 → 实时更新打卡范围圆
    document.addEventListener("input", function (e) {
      if (e.target.id !== "setRadius") return;
      var lat = parseFloat(document.getElementById("setLatitude").value);
      var lng = parseFloat(document.getElementById("setLongitude").value);
      if (!isNaN(lat) && !isNaN(lng)) {
        var rad = parseInt(e.target.value) || 200;
        EasyorderAndproc._updateSettingsCircle(lat, lng, rad);
      }
    });

    function _handleSettingsClick(e) {
      var btn = e.target.closest("#refreshSettingsBtn");
      if (btn) {
        Store.loadSettingsFromDB().then(function () {
          EasyorderAndproc.renderSettings();
        });
      }
      var saveBtn = e.target.closest("#saveSettingsBtn");
      if (saveBtn) {
        EasyorderAndproc.saveSettings();
      }
      var searchBtn = e.target.closest("#searchLocationBtn");
      if (searchBtn) {
        EasyorderAndproc._searchLocation();
      }
    }

    // 录入按钮
    var createOrderBtn = document.getElementById("createOrderBtn");
    if (createOrderBtn)
      createOrderBtn.addEventListener("click", function () {
        EasyorderAndproc.showOrderEntry();
      });
    var createApplyBtn = document.getElementById("createApplyBtn");
    if (createApplyBtn)
      createApplyBtn.addEventListener("click", function () {
        EasyorderAndproc.showApplyEntry();
      });
    var createClockBtn = document.getElementById("createClockBtn");
    if (createClockBtn)
      createClockBtn.addEventListener("click", function () {
        EasyorderAndproc.showClockEntry();
      });

    document
      .getElementById("addApprovalUserBtn")
      .addEventListener("click", () => {
        EasyorderAndproc.showApprovalUserModal();
      });

    // Order filter
    document.getElementById("orderQueryBtn").addEventListener("click", () => {
      EasyorderAndproc.renderOrders();
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
          app.showToast("请先选择要删除的订单", "error");
          return;
        }
        var ids = Array.from(checked).map(function (cb) {
          return cb.value;
        });
        app.promptDelete(
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
          app.showToast("请先选择要删除的申请", "error");
          return;
        }
        var ids = Array.from(checked).map(function (cb) {
          return cb.value;
        });
        app.promptDelete(
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
          app.showToast("请先选择要删除的打卡记录", "error");
          return;
        }
        var ids = Array.from(checked).map(function (cb) {
          return cb.value;
        });
        app.promptDelete(
          "batchClock",
          ids,
          "批量删除 " + ids.length + " 条打卡记录",
        );
      });

    // Apply filter
    document.getElementById("applyQueryBtn").addEventListener("click", () => {
      EasyorderAndproc.renderApply();
    });

    // Clock filter
    document.getElementById("clockQueryBtn").addEventListener("click", () => {
      EasyorderAndproc.renderClock();
    });
  },

  // ============ easyorder: 订单管理 ============

  showOrderEntry() {
    var self = window.app;
    window.app._makeEntryModal(
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
        EasyorderAndproc.renderOrders();
        done();
        window.app.showToast("订单已录入", "success");
      },
    );
  },

  showApplyEntry() {
    var self = window.app;
    window.app._makeEntryModal(
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
              if (r.error) {
                console.warn("sync apply failed:", r.error);
                window.app.showToast("数据库同步失败，请检查网络", "error");
              }
            });
        }
        EasyorderAndproc.renderApply();
        done();
        window.app.showToast("申请已录入", "success");
      },
    );
  },

  showClockEntry() {
    var self = window.app;
    window.app._makeEntryModal(
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
              if (r.error) {
                console.warn("sync clock failed:", r.error);
                window.app.showToast("数据库同步失败，请检查网络", "error");
              }
            });
        }
        EasyorderAndproc.renderClock();
        done();
        window.app.showToast("打卡已录入", "success");
      },
    );
  },

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
  },

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
    document.getElementById("detailModalFooter").innerHTML =
      '<button type="button" class="btn btn-secondary modal-close">关闭</button>';
    window.app.openModal("detailModal");
  },

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
        window.app.showToast("状态更新失败", "error");
        return;
      }
    }
    order.status = newStatus;
    Store.saveOrders(orders);
    EasyorderAndproc.renderOrders();
    window.app.showToast("状态已更新", "success");
  },

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
                  <button onclick="EasyorderAndproc.showApplyEdit('${r.id}')">编辑</button>
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
  },

  showApplyEdit(id) {
    const records = Store.getApplyRecords();
    const r = records.find((a) => a.id === id);
    if (!r) return;
    document.getElementById("detailModalTitle").textContent = "编辑申请";

    // 根据类型渲染对应的额外字段
    function getExtraFieldsHtml(type, r) {
      var html = "";
      html +=
        '<div class="settings-field" id="editLicensePlateWrap"' +
        (type === "运输" ? "" : ' style="display:none"') +
        ">" +
        '<label class="settings-label">车牌号</label>' +
        '<input type="text" id="editLicensePlate" class="toolbar-input" value="' +
        esc(r.licensePlate || "") +
        '">' +
        "</div>";
      html +=
        '<div class="settings-field" id="editBorrowReturnWrap"' +
        (type === "借还" ? "" : ' style="display:none"') +
        ">" +
        '<label class="settings-label">借还类型</label>' +
        '<input type="text" id="editBorrowReturnType" class="toolbar-input" value="' +
        esc(r.borrowReturnType || "") +
        '">' +
        "</div>";
      html +=
        '<div class="settings-field" id="editCustomReasonWrap"' +
        (type === "其他" ? "" : ' style="display:none"') +
        ">" +
        '<label class="settings-label">具体事由</label>' +
        '<textarea id="editCustomReason" class="toolbar-input" rows="2">' +
        esc(r.customReason || "") +
        "</textarea>" +
        "</div>";
      return html;
    }

    document.getElementById("detailModalBody").innerHTML =
      '<div class="detail-grid" style="display:flex;flex-direction:column;gap:10px;">' +
      '  <div class="settings-field">' +
      '    <label class="settings-label">申请人 <span style="color:red">*</span></label>' +
      '    <input type="text" id="editName" class="toolbar-input" value="' +
      esc(r.name) +
      '">' +
      "  </div>" +
      '  <div class="settings-field">' +
      '    <label class="settings-label">电话 <span style="color:red">*</span></label>' +
      '    <input type="text" id="editPhone" class="toolbar-input" value="' +
      esc(r.phone) +
      '">' +
      "  </div>" +
      '  <div class="settings-field">' +
      '    <label class="settings-label">公司</label>' +
      '    <input type="text" id="editCompany" class="toolbar-input" value="' +
      esc(r.company || "") +
      '">' +
      "  </div>" +
      '  <div class="settings-field">' +
      '    <label class="settings-label">事由类型</label>' +
      '    <select id="editType" class="toolbar-select" onchange="EasyorderAndproc._onEditTypeChange()">' +
      '      <option value="运输"' +
      (r.type === "运输" ? " selected" : "") +
      ">运输</option>" +
      '      <option value="参观"' +
      (r.type === "参观" ? " selected" : "") +
      ">参观</option>" +
      '      <option value="选样"' +
      (r.type === "选样" ? " selected" : "") +
      ">选样</option>" +
      '      <option value="借还"' +
      (r.type === "借还" ? " selected" : "") +
      ">借还</option>" +
      '      <option value="其他"' +
      (r.type === "其他" ? " selected" : "") +
      ">其他</option>" +
      "    </select>" +
      "  </div>" +
      getExtraFieldsHtml(r.type, r) +
      '  <div class="settings-field">' +
      '    <label class="settings-label">来访日期</label>' +
      '    <input type="date" id="editVisitDate" class="toolbar-input" value="' +
      esc(r.visitDate || "") +
      '">' +
      "  </div>" +
      '  <div class="settings-field">' +
      '    <label class="settings-label">备注</label>' +
      '    <textarea id="editRemark" class="toolbar-input" rows="2">' +
      esc(r.remark || "") +
      "</textarea>" +
      "  </div>" +
      '  <div class="detail-row"><span class="detail-label">状态</span><span class="detail-value"><span class="status-badge ' +
      (r.status === "已收录" ? "done" : "pending") +
      '">' +
      esc(r.status) +
      "</span></span></div>" +
      '  <div class="detail-row"><span class="detail-label">提交时间</span><span class="detail-value">' +
      formatDateTime(r.createdAt) +
      "</span></div>" +
      "</div>";

    // 设置 footer: 取消 + 保存
    document.getElementById("detailModalFooter").innerHTML =
      '<button type="button" class="btn btn-secondary" id="cancelApplyEditBtn">取消</button>' +
      '<button type="button" class="btn btn-primary" id="saveApplyEditBtn">保存</button>';

    window.app.openModal("detailModal");

    // 绑定取消按钮
    document.getElementById("cancelApplyEditBtn").onclick = function () {
      window.app.closeModal("detailModal");
    };

    // 绑定保存按钮
    document.getElementById("saveApplyEditBtn").onclick = async function () {
      const btn = this;
      const originalText = btn.textContent;
      btn.disabled = true;
      // 三点循环动画
      let dots = 0;
      let dotDir = 1;
      const dotTimer = setInterval(() => {
        dots += dotDir;
        if (dots >= 3) dotDir = -1;
        if (dots <= 0) dotDir = 1;
        btn.textContent = "保存中" + ".".repeat(dots);
      }, 400);
      try {
        await EasyorderAndproc.saveApplyEdit(id);
      } catch (err) {
        window.app.showToast("保存失败", "error");
      } finally {
        clearInterval(dotTimer);
        btn.disabled = false;
        btn.textContent = originalText;
      }
    };
  },

  async saveApplyEdit(id) {
    const records = Store.getApplyRecords();
    const r = records.find((a) => a.id === id);
    if (!r) return;

    var name = document.getElementById("editName").value.trim();
    var phone = document.getElementById("editPhone").value.trim();
    var company = document.getElementById("editCompany").value.trim();
    var type = document.getElementById("editType").value;
    var visitDate = document.getElementById("editVisitDate").value;
    var remark = document.getElementById("editRemark").value.trim();

    if (!name || !phone) {
      window.app.showToast("请填写申请人和电话", "error");
      return;
    }

    // 收集类型相关字段
    var licensePlate = "";
    var borrowReturnType = "";
    var customReason = "";
    if (type === "运输") {
      licensePlate = document.getElementById("editLicensePlate").value.trim();
    } else if (type === "借还") {
      borrowReturnType = document
        .getElementById("editBorrowReturnType")
        .value.trim();
    } else if (type === "其他") {
      customReason = document.getElementById("editCustomReason").value.trim();
    }

    var now = new Date().toISOString();

    // 更新内存数据
    r.name = name;
    r.phone = phone;
    r.company = company;
    r.type = type;
    r.visitDate = visitDate;
    r.remark = remark;
    r.licensePlate = licensePlate;
    r.borrowReturnType = borrowReturnType;
    r.customReason = customReason;
    r.updatedAt = now;
    Store.saveApplyRecords(records);

    // 同步数据库
    if (supabaseClient) {
      var { error } = await supabaseClient
        .from("apply_records")
        .update({
          name: name,
          phone: phone,
          company: company,
          type: type,
          visit_date: visitDate,
          remark: remark,
          license_plate: licensePlate,
          borrow_return_type: borrowReturnType,
          custom_reason: customReason,
          updated_at: now,
        })
        .eq("id", id);
      if (error) {
        console.warn("sync apply edit failed:", error);
        window.app.showToast("数据库同步失败", "error");
        return;
      }
    }

    window.app.closeModal("detailModal");
    EasyorderAndproc.renderApply();
    window.app.showToast("申请已更新", "success");
  },

  _onEditTypeChange() {
    var type = document.getElementById("editType").value;
    var licenseWrap = document.getElementById("editLicensePlateWrap");
    var borrowWrap = document.getElementById("editBorrowReturnWrap");
    var reasonWrap = document.getElementById("editCustomReasonWrap");
    if (licenseWrap) licenseWrap.style.display = type === "运输" ? "" : "none";
    if (borrowWrap) borrowWrap.style.display = type === "借还" ? "" : "none";
    if (reasonWrap) reasonWrap.style.display = type === "其他" ? "" : "none";
  },

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
        window.app.showToast("审核失败", "error");
        return;
      }
    }
    r.status = "已收录";
    r.approveTime = now;
    Store.saveApplyRecords(records);
    EasyorderAndproc.renderApply();
    window.app.showToast("已收录", "success");
  },

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
                  <button onclick="EasyorderAndproc.showClockEdit('${r.id}')">编辑</button>
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
  },

  showClockEdit(id) {
    const records = Store.getClockRecords();
    const r = records.find((c) => c.id === id);
    if (!r) return;
    document.getElementById("detailModalTitle").textContent = "编辑打卡";

    document.getElementById("detailModalBody").innerHTML =
      '<div class="detail-grid" style="display:flex;flex-direction:column;gap:10px;">' +
      '  <div class="settings-field">' +
      '    <label class="settings-label">姓名 <span style="color:red">*</span></label>' +
      '    <input type="text" id="ceName" class="toolbar-input" value="' +
      esc(r.name) +
      '">' +
      "  </div>" +
      '  <div class="settings-field">' +
      '    <label class="settings-label">电话 <span style="color:red">*</span></label>' +
      '    <input type="text" id="cePhone" class="toolbar-input" value="' +
      esc(r.phone) +
      '">' +
      "  </div>" +
      '  <div class="settings-field">' +
      '    <label class="settings-label">公司</label>' +
      '    <input type="text" id="ceCompany" class="toolbar-input" value="' +
      esc(r.company || "") +
      '">' +
      "  </div>" +
      '  <div class="settings-field">' +
      '    <label class="settings-label">公司类型</label>' +
      '    <select id="ceCompanyType" class="toolbar-select">' +
      '      <option value="业主方"' +
      (r.companyType === "业主方" ? " selected" : "") +
      ">业主方</option>" +
      '      <option value="运营方"' +
      (r.companyType === "运营方" ? " selected" : "") +
      ">运营方</option>" +
      '      <option value="品牌方"' +
      (r.companyType === "品牌方" ? " selected" : "") +
      ">品牌方</option>" +
      '      <option value="其他"' +
      (r.companyType === "其他" ? " selected" : "") +
      ">其他</option>" +
      "    </select>" +
      "  </div>" +
      '  <div class="settings-field">' +
      '    <label class="settings-label">打卡位置</label>' +
      '    <input type="text" id="ceLocation" class="toolbar-input" value="' +
      esc(r.clockLocationName || "") +
      '">' +
      "  </div>" +
      '  <div class="settings-field">' +
      '    <label class="settings-label">打卡事由</label>' +
      '    <input type="text" id="ceReason" class="toolbar-input" value="' +
      esc(r.reason || "") +
      '">' +
      "  </div>" +
      '  <div class="settings-field">' +
      '    <label class="settings-label">备注</label>' +
      '    <textarea id="ceRemark" class="toolbar-input" rows="2">' +
      esc(r.remark || "") +
      "</textarea>" +
      "  </div>" +
      '  <div class="detail-row"><span class="detail-label">打卡时间</span><span class="detail-value">' +
      formatDateTime(r.clockTime) +
      "</span></div>" +
      '  <div class="detail-row"><span class="detail-label">位置核验</span><span class="detail-value"><span class="' +
      (r.verifyResult ? "verify-ok" : "verify-fail") +
      '">' +
      (r.verifyResult ? "✅ 通过" : "❌ 未通过") +
      "</span></span></div>" +
      '  <div class="detail-row"><span class="detail-label">经纬度</span><span class="detail-value">' +
      (r.latitude ? r.latitude + ", " + r.longitude : "-") +
      "</span></div>" +
      "</div>";

    // 设置 footer: 取消 + 保存
    document.getElementById("detailModalFooter").innerHTML =
      '<button type="button" class="btn btn-secondary" id="cancelClockEditBtn">取消</button>' +
      '<button type="button" class="btn btn-primary" id="saveClockEditBtn">保存</button>';

    window.app.openModal("detailModal");

    // 绑定取消按钮
    document.getElementById("cancelClockEditBtn").onclick = function () {
      window.app.closeModal("detailModal");
    };

    // 绑定保存按钮
    document.getElementById("saveClockEditBtn").onclick = async function () {
      const btn = this;
      const originalText = btn.textContent;
      btn.disabled = true;
      // 三点循环动画
      let dots = 0;
      let dotDir = 1;
      const dotTimer = setInterval(() => {
        dots += dotDir;
        if (dots >= 3) dotDir = -1;
        if (dots <= 0) dotDir = 1;
        btn.textContent = "保存中" + ".".repeat(dots);
      }, 400);
      try {
        await EasyorderAndproc.saveClockEdit(id);
      } catch (err) {
        window.app.showToast("保存失败", "error");
      } finally {
        clearInterval(dotTimer);
        btn.disabled = false;
        btn.textContent = originalText;
      }
    };
  },

  async saveClockEdit(id) {
    const records = Store.getClockRecords();
    const r = records.find((c) => c.id === id);
    if (!r) return;

    var name = document.getElementById("ceName").value.trim();
    var phone = document.getElementById("cePhone").value.trim();
    var company = document.getElementById("ceCompany").value.trim();
    var companyType = document.getElementById("ceCompanyType").value;
    var clockLocationName = document.getElementById("ceLocation").value.trim();
    var reason = document.getElementById("ceReason").value.trim();
    var remark = document.getElementById("ceRemark").value.trim();

    if (!name || !phone) {
      window.app.showToast("请填写姓名和电话", "error");
      return;
    }

    var now = new Date().toISOString();

    // 更新内存数据
    r.name = name;
    r.phone = phone;
    r.company = company;
    r.companyType = companyType;
    r.clockLocationName = clockLocationName;
    r.reason = reason;
    r.remark = remark;
    r.updatedAt = now;
    Store.saveClockRecords(records);

    // 同步数据库
    if (supabaseClient) {
      var { error } = await supabaseClient
        .from("clock_records")
        .update({
          name: name,
          phone: phone,
          company: company,
          company_type: companyType,
          clock_location_name: clockLocationName,
          reason: reason,
          remark: remark,
          updated_at: now,
        })
        .eq("id", id);
      if (error) {
        console.warn("sync clock edit failed:", error);
        window.app.showToast("数据库同步失败", "error");
        return;
      }
    }

    window.app.closeModal("detailModal");
    EasyorderAndproc.renderClock();
    window.app.showToast("打卡已更新", "success");
  },

  // ============ easyproc: 审批人管理 ============

  renderApprovalUsers() {
    const container = document.getElementById("approvalUsersContainer");
    if (!supabaseClient) {
      container.innerHTML =
        '<div class="empty-state"><p>数据库未连接</p></div>';
      return;
    }
    try {
      var users = Store.getApprovalUsers();
      if (users.length === 0) {
        container.innerHTML =
          '<div class="empty-state"><div class="icon"><img src="src/icon/box.svg" alt="empty" class="empty-icon"></div><p>暂无审批人，点击"添加审批人"开始配置</p></div>';
        return;
      }
      container.innerHTML = `<table class="data-table" style="width:100%"><thead><tr>
        <th>邮箱</th><th>显示名称</th><th>电话</th><th>角色</th><th>EasyCod</th><th>EasyOrder</th><th>EasyProc</th><th>EasyVoice</th><th>操作</th>
      </tr></thead><tbody>${users
        .map(
          (u) => `<tr>
        <td style="font-size:0.85rem">${window.app._esc(u.email || "")}</td>
        <td>${window.app._esc(u.display_name || "")}</td>
        <td style="font-size:0.85rem">${window.app._esc(u.phone || "-")}</td>
        <td><span class="status-badge ${u.role === "admin" ? "status-success" : "status-info"}">${window.app._esc(u.role || "审批人")}</span></td>
        <td>${EasyorderAndproc._toggleBadge(u.easycod, "ec", u.id)}</td>
        <td>${EasyorderAndproc._toggleBadge(u.easyorder, "eo", u.id)}</td>
        <td>${EasyorderAndproc._toggleBadge(u.easyproc, "ep", u.id)}</td>
        <td>${EasyorderAndproc._toggleBadge(u.easyvoice, "ev", u.id)}</td>
        <td style="white-space:nowrap"><div class="view-toggle wf-active-toggle" data-id="${u.id}" style="display:inline-flex;vertical-align:middle"><button type="button" class="toggle-btn ${u.is_active ? "active" : ""}" data-val="true" style="${u.is_active ? "background:var(--primary);color:#fff;" : ""}">正常</button><button type="button" class="toggle-btn ${!u.is_active ? "active" : ""}" data-val="false" style="${!u.is_active ? "background:#e74c3c;color:#fff;" : ""}">禁用</button></div><button class="btn btn-sm btn-ghost edit-ep-user" data-id="${u.id}" style="margin-left:6px;margin-right:4px">编辑</button><button class="btn btn-sm btn-ghost" onclick="window.app.promptDelete('ep_user','${u.id}','审批人 ${window.app._esc(u.display_name || "")}')" style="color:var(--danger)">删除</button></td>
      </tr>`,
        )
        .join("")}</tbody></table>`;

      container.querySelectorAll(".edit-ep-user").forEach((btn) => {
        btn.addEventListener("click", () => {
          const u = users.find((x) => x.id === btn.dataset.id);
          if (u) EasyorderAndproc.showApprovalUserModal(u);
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
            window.app.showToast("更新失败: " + e.message, "error");
            return;
          }
          await Store.loadApprovalUsersFromDB();
          EasyorderAndproc.renderApprovalUsers();
        });
      });
      container.querySelectorAll(".wf-active-toggle").forEach((el) => {
        el.addEventListener("click", async function (e) {
          const btn = e.target.closest(".toggle-btn");
          if (!btn) return;
          const id = this.dataset.id;
          const nowActive = btn.dataset.val === "true";
          // 乐观更新：先改本地缓存再渲染，用户无感知等待
          const users = Store.getApprovalUsers();
          const user = users.find((u) => u.id === id);
          if (!user) return;
          const prev = user.is_active;
          user.is_active = nowActive;
          Store.saveApprovalUsers(users);
          EasyorderAndproc.renderApprovalUsers();
          // 后台同步数据库
          const { error: e2 } = await supabaseClient
            .from("ep_users")
            .update({ is_active: nowActive })
            .eq("id", id);
          if (e2) {
            user.is_active = prev;
            Store.saveApprovalUsers(users);
            EasyorderAndproc.renderApprovalUsers();
            window.app.showToast("更新失败", "error");
          }
        });
      });
    } catch (e) {
      container.innerHTML =
        '<div class="empty-state"><p>加载失败: ' + e.message + "</p></div>";
    }
  },

  _toggleBadge(active, field, id) {
    return `<span class="status-badge toggle-badge ${active ? "status-success" : "status-error"}" style="cursor:pointer" data-id="${id}" data-field="${field}" data-value="${active}">${active ? "开启" : "关闭"}</span>`;
  },

  showApprovalUserModal(data) {
    const isEdit = !!data;
    const overlay = document.createElement("div");
    overlay.className = "modal-overlay active";
    const menuPerms = data?.menu_permissions || {};
    overlay.innerHTML = `<div class="modal" style="max-width:500px"><div class="modal-header"><h3>${isEdit ? "编辑权限" : "添加用户权限"}</h3><button class="modal-close">&times;</button></div>
      <form id="epUserForm"><div class="modal-body" style="display:flex;flex-direction:column;gap:12px;">
        ${!isEdit ? '<input type="email" id="epUserEmail" class="toolbar-input" placeholder="邮箱 *" required style="width:100%"><input type="password" id="epUserPassword" class="toolbar-input" placeholder="密码 *" required style="width:100%">' : '<input type="email" id="epUserEmail" class="toolbar-input" placeholder="邮箱" value="' + window.app._esc(data.email || "") + '" style="width:100%">'}
        <input type="text" id="epUserDisplayName" class="toolbar-input" placeholder="显示名称 *" value="${isEdit ? window.app._esc(data.display_name || "") : ""}" required style="width:100%">
        <input type="text" id="epUserPhone" class="toolbar-input" placeholder="电话" value="${isEdit ? window.app._esc(data.phone || "") : ""}" style="width:100%">
        <select id="epUserRole" class="toolbar-select" style="width:100%"><option value="审批人" ${isEdit && data.role === "审批人" ? "selected" : ""}>审批人</option><option value="admin" ${isEdit && data.role === "admin" ? "selected" : ""}>管理员</option></select>
        <!-- 标签分组权限 -->
        <style>
          .ep-tab-btn{ padding:6px 16px; cursor:pointer; border:none; background:transparent; color:var(--text); border-radius:4px 4px 0 0; font-size:0.85rem; transition:all .15s }
          .ep-tab-btn:hover{ background:var(--hover-bg, rgba(0,0,0,.04)) }
          .ep-tab-btn.active{ background:var(--primary); color:#fff }
        </style>
        <div style="display:flex;gap:4px;border-bottom:2px solid var(--border);margin-bottom:8px">
          <button type="button" class="ep-tab-btn active" data-tab="easycod">EasyCod</button>
          <button type="button" class="ep-tab-btn" data-tab="easyorder">EasyOrder</button>
          <button type="button" class="ep-tab-btn" data-tab="easyproc">EasyProc</button>
          <button type="button" class="ep-tab-btn" data-tab="easyvoice">EasyVoice</button>
        </div>
        <!-- EasyCod -->
        <div class="ep-panel" id="epPanel_easycod">
          <label style="font-size:0.85rem;font-weight:600;margin-top:4px">项目权限</label>
          <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:8px">
            <label class="switch-label"><input type="checkbox" id="epEasycod" ${isEdit && data.easycod ? "checked" : ""}><span class="switch-track"></span> EasyCod</label>
          </div>
          <label style="font-size:0.85rem;font-weight:600;margin-top:4px">侧边栏可见性</label>
          <div style="display:flex;flex-wrap:wrap;gap:8px">
            <label class="switch-label"><input type="checkbox" id="epMenuProjects" ${menuPerms.projects ? "checked" : ""}><span class="switch-track"></span> 样板类别</label>
            <label class="switch-label"><input type="checkbox" id="epMenuInfo" ${menuPerms.info ? "checked" : ""}><span class="switch-track"></span> 信息控制</label>
          </div>
        </div>
        <!-- EasyOrder -->
        <div class="ep-panel" id="epPanel_easyorder" style="display:none">
          <label style="font-size:0.85rem;font-weight:600;margin-top:4px">项目权限</label>
          <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:8px">
            <label class="switch-label"><input type="checkbox" id="epEasyorder" ${isEdit && data.easyorder ? "checked" : ""}><span class="switch-track"></span> EasyOrder</label>
          </div>
          <label style="font-size:0.85rem;font-weight:600;margin-top:4px">侧边栏可见性</label>
          <div style="display:flex;flex-wrap:wrap;gap:8px">
            <label class="switch-label"><input type="checkbox" id="epMenuOrders" ${menuPerms.orders ? "checked" : ""}><span class="switch-track"></span> 订单管理</label>
            <label class="switch-label"><input type="checkbox" id="epMenuApply" ${menuPerms.apply ? "checked" : ""}><span class="switch-track"></span> 申请管理</label>
            <label class="switch-label"><input type="checkbox" id="epMenuClock" ${menuPerms.clock ? "checked" : ""}><span class="switch-track"></span> 打卡管理</label>
            <label class="switch-label"><input type="checkbox" id="epMenuSettings" ${menuPerms.settings ? "checked" : ""}><span class="switch-track"></span> 相关设置</label>
          </div>
        </div>
        <!-- EasyProc -->
        <div class="ep-panel" id="epPanel_easyproc" style="display:none">
          <label style="font-size:0.85rem;font-weight:600;margin-top:4px">项目权限</label>
          <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:8px">
            <label class="switch-label"><input type="checkbox" id="epEasyproc" ${isEdit && data.easyproc ? "checked" : ""}><span class="switch-track"></span> EasyProc</label>
          </div>
          <label style="font-size:0.85rem;font-weight:600;margin-top:4px">侧边栏可见性</label>
          <div style="display:flex;flex-wrap:wrap;gap:8px">
            <label class="switch-label"><input type="checkbox" id="epMenuWorkflows" ${menuPerms.workflows ? "checked" : ""}><span class="switch-track"></span> 流程编辑</label>
            <label class="switch-label"><input type="checkbox" id="epMenuRecords" ${menuPerms.records ? "checked" : ""}><span class="switch-track"></span> 审批记录</label>
          </div>
        </div>
        <!-- EasyVoice -->
        <div class="ep-panel" id="epPanel_easyvoice" style="display:none">
          <label style="font-size:0.85rem;font-weight:600;margin-top:4px">项目权限</label>
          <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:8px">
            <label class="switch-label"><input type="checkbox" id="epEasyvoice" ${isEdit && data.easyvoice ? "checked" : ""}><span class="switch-track"></span> EasyVoice</label>
          </div>
          <label style="font-size:0.85rem;font-weight:600;margin-top:4px">侧边栏可见性</label>
          <div style="display:flex;flex-wrap:wrap;gap:8px">
            <label class="switch-label"><input type="checkbox" id="epMenuVoice" ${menuPerms.voice ? "checked" : ""}><span class="switch-track"></span> 语音助手</label>
          </div>
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
    // 标签切换
    overlay.querySelectorAll(".ep-tab-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        overlay.querySelectorAll(".ep-tab-btn").forEach(function (b) {
          b.classList.remove("active");
        });
        this.classList.add("active");
        overlay.querySelectorAll(".ep-panel").forEach(function (p) {
          p.style.display = "none";
        });
        var panel = document.getElementById("epPanel_" + this.dataset.tab);
        if (panel) panel.style.display = "block";
      });
    });
    overlay.querySelector("form").addEventListener("submit", async (e) => {
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
              settings:
                document.getElementById("epMenuSettings")?.checked || false,
              workflows:
                document.getElementById("epMenuWorkflows")?.checked || false,
              records:
                document.getElementById("epMenuRecords")?.checked || false,
              voice: document.getElementById("epMenuVoice")?.checked || false,
            };
      if (!displayName) {
        window.app.showToast("请填写显示名称", "error");
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
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
          const password = document
            .getElementById("epUserPassword")
            .value.trim();
          if (!password) {
            window.app.showToast("请填写密码", "error");
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
            return;
          }
          // 调用 Edge Function 创建用户
          const { data: sessionData } = await supabaseClient.auth.getSession();
          const token = sessionData?.session?.access_token;
          if (!token) {
            throw new Error("未登录，请重新登录");
          }
          const fnRes = await fetch(
            "https://vqoortdzgvllyxplduxq.supabase.co/functions/v1/create-user",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + token,
              },
              body: JSON.stringify({
                email,
                password,
                display_name: displayName,
                phone,
                role,
                menu_permissions: menuPermissions,
                projects: { easycod, easyorder, easyproc, easyvoice },
              }),
            },
          );
          const fnData = await fnRes.json();
          if (!fnRes.ok) throw new Error(fnData.error || "创建用户失败");
        }
        overlay.remove();
        window.app.showToast(isEdit ? "已更新" : "已添加", "success");
        await Store.loadApprovalUsersFromDB();
        EasyorderAndproc.renderApprovalUsers();
      } catch (err) {
        window.app.showToast("操作失败: " + err.message, "error");
      } finally {
        clearInterval(dotTimer);
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }
    });
  },

  // ============ 流程编辑 ============

  renderWorkflows() {
    const container = document.getElementById("workflowContainer");
    if (!supabaseClient) {
      container.innerHTML =
        '<div class="empty-state"><p>数据库未连接</p></div>';
      return;
    }
    try {
      // 从缓存读取（启动时已预加载）
      let tpls = Store.getWfTemplates();
      let users = Store.getApprovalUsers().filter((u) => u.is_active);
      let allNodes = Store.getWfNodes();
      let allAssignees = Store.getWfAssignees();
      EasyorderAndproc._wfTemplates = tpls;
      EasyorderAndproc._wfUsers = users;

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
        html += EasyorderAndproc._renderOneWorkflowEditor(
          tpl,
          nodes,
          nodeAssignees,
          min,
        );
      });

      container.innerHTML = html;

      // === 事件绑定（委托到 container） ===
      // 仅在首次渲染时绑定，防止重复渲染导致监听器叠加、点击 + 一次创建多个弹框
      if (!container._wfClickBound) {
        container._wfClickBound = true;
        container.addEventListener("click", (e) => {
          // 每次从 Store 实时读取最新节点，避免闭包捕获首次渲染的旧数据
          // （否则新增节点在旧数组里找不到，点击删除会无反应）
          const allNodes = Store.getWfNodes();
          // + 按钮
          const plusBtn = e.target.closest(".wf-plus-btn");
          if (plusBtn) {
            EasyorderAndproc._showWFAddNode(
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
              window.app.showToast("预设节点不可删除", "error");
              return;
            }
            const tpl = EasyorderAndproc._wfTemplates.find(
              (t) => t.id === node.template_id,
            );
            if (!tpl) return;
            const min = typeMap[tpl.apply_type] || 2;
            const tplNodes = allNodes.filter(
              (n) => n.template_id === node.template_id,
            );
            if (tplNodes.length <= min) {
              window.app.showToast(
                "该类型至少需要 " + min + " 个节点",
                "error",
              );
              return;
            }
            // 与申请汇总一致：弹出带密码验证的确认弹框，替代原生 confirm
            // （原生 confirm 在部分环境会被挂起，导致"点击无反应"）
            window.app.promptDelete("wfnode", nodeId, "流程节点 " + node.name);
            return;
          }
          // 编辑节点
          const editBtn = e.target.closest(".wf-edit-node-btn");
          if (editBtn) {
            EasyorderAndproc._showWFEditNode(editBtn.dataset.nodeId);
            return;
          }
          // 节点卡片
          const nodeEl = e.target.closest(".wf-node");
          if (nodeEl) {
            EasyorderAndproc._showWFAssignModal(nodeEl.dataset.nodeId);
            return;
          }
        });
      }
    } catch (e) {
      container.innerHTML =
        '<div class="empty-state"><p>加载失败: ' + e.message + "</p></div>";
    }
  },

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
            const u = EasyorderAndproc._wfUsers.find((usr) => usr.id === id);
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
            <div style="font-weight:600;font-size:0.85rem;margin-bottom:2px;">${window.app._esc(n.name)}</div>
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
        <h3 style="margin:0;font-size:1rem;">${window.app._esc(tpl.name)}</h3>
        <p style="margin:2px 0 0;font-size:0.8rem;color:var(--text-light);">最少 ${min} 个节点 · 当前 ${nodes.length} 个</p>
      </div>
      ${flowHtml}
    </div>`;
  },

  _renderWorkflowEditor() {
    // 已废弃：改为一次性渲染所有流程
  },

  async _showWFAddNode(templateId, pos) {
    // 清理已存在的添加节点弹框，防止叠加（监听器叠加/双击等导致残留时兜底）
    document.querySelectorAll(".modal-overlay").forEach((el) => {
      if (el.querySelector("#wfAddNodeSave")) el.remove();
    });
    const overlay = document.createElement("div");
    overlay.className = "modal-overlay active";
    overlay.innerHTML = `<div class="modal" style="max-width:400px">
      <div class="modal-header"><h3>添加节点</h3><button class="modal-close">&times;</button></div>
      <div class="modal-body">
        <div style="margin-bottom:12px;">
          <label style="display:block;font-size:0.85rem;font-weight:600;margin-bottom:4px;">节点名称</label>
          <input type="text" id="wfAddNodeName" class="toolbar-input" value="${window.app._esc("审核" + (pos + 1))}" style="width:100%;">
        </div>
      </div>
      <div class="modal-footer" style="display:flex;gap:8px;justify-content:flex-end;padding:12px 20px;border-top:1px solid var(--border);">
        <button type="button" class="btn btn-secondary modal-close-btn">取消</button>
        <button type="button" class="btn btn-primary" id="wfAddNodeSave">保存</button>
      </div>
    </div>`;
    document.body.appendChild(overlay);
    overlay.querySelector(".modal-close").addEventListener("click", () => {
      overlay.remove();
    });
    overlay.querySelector(".modal-close-btn").addEventListener("click", () => {
      overlay.remove();
    });
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) {
        overlay.remove();
      }
    });
    document
      .getElementById("wfAddNodeSave")
      .addEventListener("click", async () => {
        const name = document.getElementById("wfAddNodeName").value.trim();
        if (!name) {
          window.app.showToast("请输入节点名称", "error");
          return;
        }
        const submitBtn = document.getElementById("wfAddNodeSave");
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
          // 读取当前模板的所有节点
          const { data: nodes, error: readErr } = await supabaseClient
            .from("ep_workflow_nodes")
            .select("id,order_index")
            .eq("template_id", templateId)
            .order("order_index");
          if (readErr) {
            window.app.showToast("添加失败: " + readErr.message, "error");
            return;
          }
          const curNodes = nodes || [];
          // 插入新节点
          const { data: inserted, error } = await supabaseClient
            .from("ep_workflow_nodes")
            .insert({
              template_id: templateId,
              name: name,
              order_index: pos + 1,
            })
            .select("id")
            .single();
          if (error) {
            window.app.showToast("添加失败: " + error.message, "error");
            return;
          }
          // 整条链重新编号：新节点插入到 pos 位置（0-based），
          // 其余节点按原顺序从 1 开始重排，保证 order_index 连续不重复
          // （顺带修正历史遗留的乱序数据，如 1,3 缺 2）
          const newOrder = curNodes.map((n) => n.id);
          newOrder.splice(pos, 0, inserted.id);
          for (let i = 0; i < newOrder.length; i++) {
            const { error: upErr } = await supabaseClient
              .from("ep_workflow_nodes")
              .update({ order_index: i + 1 })
              .eq("id", newOrder[i]);
            if (upErr) {
              window.app.showToast("添加失败: " + upErr.message, "error");
              return;
            }
          }
          overlay.remove();
          await Store.loadAllWorkflowData();
          EasyorderAndproc.renderWorkflows();
        } catch (e) {
          window.app.showToast("添加失败: " + e.message, "error");
        } finally {
          clearInterval(dotTimer);
          submitBtn.disabled = false;
          submitBtn.textContent = originalText;
        }
      });
  },

  // 删除流程节点：删节点 + 清理审批人分配 + 整链重排序号 + 只刷新受影响模板
  async deleteWorkflowNode(nodeId) {
    if (!supabaseClient) return;
    try {
      // 1. 取节点模板 ID（用于删除后重排/局部刷新）
      const { data: nodeRow } = await supabaseClient
        .from("ep_workflow_nodes")
        .select("template_id")
        .eq("id", nodeId)
        .maybeSingle();
      // 2. 删除节点
      const { error } = await supabaseClient
        .from("ep_workflow_nodes")
        .delete()
        .eq("id", nodeId);
      if (error) {
        window.app.showToast("删除失败: " + error.message, "error");
        return;
      }
      // 3. 级联清理该节点的审批人分配
      await supabaseClient
        .from("ep_workflow_node_assignees")
        .delete()
        .eq("node_id", nodeId);
      const tplId = nodeRow && nodeRow.template_id;
      // 4. 整链重排 order_index（并行 update，避免逐个串行等待拖慢删除）
      if (tplId) {
        const { data: rest } = await supabaseClient
          .from("ep_workflow_nodes")
          .select("id")
          .eq("template_id", tplId)
          .order("order_index");
        const results = await Promise.all(
          (rest || []).map((n, i) =>
            supabaseClient
              .from("ep_workflow_nodes")
              .update({ order_index: i + 1 })
              .eq("id", n.id),
          ),
        );
        const failed = results.find((r) => r.error);
        if (failed) throw failed.error;
      }
      // 5. 只刷新受影响模板（替代全量 loadAllWorkflowData + renderWorkflows）
      if (tplId) {
        await EasyorderAndproc._reloadOneWorkflow(tplId);
      } else {
        await Store.loadAllWorkflowData();
        EasyorderAndproc.renderWorkflows();
      }
    } catch (e) {
      window.app.showToast("删除失败: " + e.message, "error");
    }
  },

  // 仅重拉并重渲染指定流程模板（避免删除/改动后全量刷新拖慢）
  async _reloadOneWorkflow(tplId) {
    // 1. 重拉该模板的节点
    const { data: tplNodes, error: nErr } = await supabaseClient
      .from("ep_workflow_nodes")
      .select("*")
      .eq("template_id", tplId)
      .order("order_index");
    if (nErr) throw nErr;
    // 合并进全局节点缓存（替换该模板，保留其他模板）
    const cachedNodes = Store.getWfNodes() || [];
    Store.saveWfNodes(
      cachedNodes.filter((n) => n.template_id !== tplId).concat(tplNodes || []),
    );
    // 2. 重拉该模板节点的分配
    const nodeIds = (tplNodes || []).map((n) => n.id);
    let tplAssignees = [];
    if (nodeIds.length) {
      const { data: as, error: asErr } = await supabaseClient
        .from("ep_workflow_node_assignees")
        .select("node_id,user_id,notify_type")
        .in("node_id", nodeIds);
      if (asErr) throw asErr;
      tplAssignees = as || [];
    }
    const cachedAs = Store.getWfAssignees() || [];
    Store.saveWfAssignees(
      cachedAs.filter((a) => !nodeIds.includes(a.node_id)).concat(tplAssignees),
    );
    // 3. 只重渲染该模板卡片
    EasyorderAndproc.renderOneWorkflow(tplId);
  },

  // 仅重渲染单个流程模板卡片（复用 _renderOneWorkflowEditor）
  renderOneWorkflow(tplId) {
    const container = document.getElementById("workflowContainer");
    if (!container) return;
    const tpl = (Store.getWfTemplates() || []).find((t) => t.id === tplId);
    if (!tpl) {
      EasyorderAndproc.renderWorkflows();
      return;
    }
    EasyorderAndproc._wfUsers = Store.getApprovalUsers().filter(
      (u) => u.is_active,
    );
    const nodes = Store.getWfNodes().filter((n) => n.template_id === tplId);
    const nodeAssignees = {};
    Store.getWfAssignees().forEach((a) => {
      if (!nodeAssignees[a.node_id]) nodeAssignees[a.node_id] = [];
      nodeAssignees[a.node_id].push(a.user_id);
    });
    const typeMap = { 运输: 1, 参观: 1, 选样: 1, 借还: 3, 其他: 1, 订单: 2 };
    const min = typeMap[tpl.apply_type] || 2;
    const card = container.querySelector(
      '.wf-editor-card[data-tpl-id="' + tplId + '"]',
    );
    const html = EasyorderAndproc._renderOneWorkflowEditor(
      tpl,
      nodes,
      nodeAssignees,
      min,
    );
    if (card) {
      card.outerHTML = html;
    } else {
      // 卡片不在（例如首次进入页面），全量渲染兜底
      EasyorderAndproc.renderWorkflows();
    }
  },

  async _showWFEditNode(nodeId) {
    // 移除已存在的弹窗
    document.querySelectorAll(".modal-overlay").forEach((el) => el.remove());
    // 从 Store 缓存读取节点和分配数据
    const allNodes = Store.getWfNodes();
    const allAssignees = Store.getWfAssignees();
    const node = allNodes.find((n) => n.id === nodeId);
    if (!node) {
      window.app.showToast("节点不存在", "error");
      return;
    }
    const nodeName = node.name;
    const assignedSet = new Set(
      allAssignees.filter((a) => a.node_id === nodeId).map((a) => a.user_id),
    );
    // 建立 notify_type 映射: user_id -> notify_type
    var assigneeNotifyMap = {};
    allAssignees.forEach(function (a) {
      if (a.node_id === nodeId)
        assigneeNotifyMap[a.user_id] = a.notify_type || "all";
    });
    const users = EasyorderAndproc._wfUsers;
    const overlay = document.createElement("div");
    overlay.className = "modal-overlay active";
    let bodyHtml = `<div style="margin-bottom:12px;">
      <label style="display:block;font-size:0.85rem;font-weight:600;margin-bottom:4px;">节点名称</label>
      <input type="text" id="wfEditNodeName" class="toolbar-input" value="${window.app._esc(nodeName)}" style="width:100%;">
    </div>
    <div style="font-size:0.85rem;font-weight:600;margin-bottom:6px;">分配审批人</div>`;
    bodyHtml += users
      .map((u) => {
        const checked = assignedSet.has(u.id) ? "checked" : "";
        var nt = assigneeNotifyMap[u.id] || "all";
        return `<div style="display:flex;align-items:center;gap:8px;padding:4px 0;">
        <label style="display:flex;align-items:center;gap:6px;cursor:pointer;min-width:140px;">
        <input type="checkbox" class="wf-assignee-cb" value="${u.id}" ${checked} style="width:16px;height:16px;">
        <span style="font-size:0.85rem;">${window.app._esc(u.display_name || u.email)}</span>
        </label>
        <div class="view-toggle wf-notify-toggle" data-user="${u.id}" style="display:inline-flex;">
          <button type="button" class="toggle-btn ${nt === "all" ? "active" : ""}" data-val="all">全部</button>
          <button type="button" class="toggle-btn ${nt === "phone" ? "active" : ""}" data-val="phone">短信</button>
          <button type="button" class="toggle-btn ${nt === "email" ? "active" : ""}" data-val="email">邮箱</button>
        </div>
      </div>`;
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
    // 通知类型切换按钮
    overlay.querySelectorAll(".wf-notify-toggle").forEach(function (toggle) {
      toggle.addEventListener("click", function (e) {
        var btn = e.target.closest(".toggle-btn");
        if (!btn) return;
        toggle.querySelectorAll(".toggle-btn").forEach(function (b) {
          b.classList.remove("active");
        });
        btn.classList.add("active");
      });
    });
    document
      .getElementById("wfEditSave")
      .addEventListener("click", async () => {
        const newName = document.getElementById("wfEditNodeName").value.trim();
        if (!newName) {
          window.app.showToast("请输入节点名称", "error");
          return;
        }
        const checkedBoxes = overlay.querySelectorAll(
          ".modal-body input[type=checkbox]:checked",
        );
        const selectedIds = Array.from(checkedBoxes).map((cb) => cb.value);
        // 保存中…三点循环动画（与其他保存交互一致）
        const submitBtn = document.getElementById("wfEditSave");
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
          // 插入新分配（含通知类型）
          if (selectedIds.length > 0) {
            const inserts = selectedIds.map((uid) => {
              var toggle = overlay.querySelector(
                '.wf-notify-toggle[data-user="' + uid + '"]',
              );
              var nt = toggle
                ? toggle.querySelector(".toggle-btn.active")?.dataset.val ||
                  "all"
                : "all";
              return { node_id: nodeId, user_id: uid, notify_type: nt };
            });
            await supabaseClient
              .from("ep_workflow_node_assignees")
              .insert(inserts);
          }
          overlay.remove();
          // 只刷新受影响模板（替代全量刷新，与删除/添加一致）
          if (node.template_id) {
            await EasyorderAndproc._reloadOneWorkflow(node.template_id);
          } else {
            await Store.loadAllWorkflowData();
            EasyorderAndproc.renderWorkflows();
          }
        } catch (err) {
          window.app.showToast("保存失败: " + err.message, "error");
        } finally {
          clearInterval(dotTimer);
          submitBtn.disabled = false;
          submitBtn.textContent = originalText;
        }
      });
  },

  async _showWFAssignModal(nodeId) {
    const users = EasyorderAndproc._wfUsers;
    if (users.length === 0) {
      window.app.showToast("暂无可用审批人，请先添加", "error");
      return;
    }

    // 从 Store 缓存读取已分配审批人
    const assignedSet = new Set(
      Store.getWfAssignees()
        .filter((a) => a.node_id === nodeId)
        .map((a) => a.user_id),
    );
    var assigneeNotifyMap2 = {};
    Store.getWfAssignees().forEach(function (a) {
      if (a.node_id === nodeId)
        assigneeNotifyMap2[a.user_id] = a.notify_type || "all";
    });

    const overlay = document.createElement("div");
    overlay.className = "modal-overlay active";
    let bodyHtml = users
      .map((u) => {
        const checked = assignedSet.has(u.id) ? "checked" : "";
        var nt = assigneeNotifyMap2[u.id] || "all";
        return `<div style="display:flex;align-items:center;gap:8px;padding:4px 0;">
        <label style="display:flex;align-items:center;gap:6px;cursor:pointer;min-width:140px;">
        <input type="checkbox" class="wf-assignee-cb2" value="${u.id}" ${checked} style="width:16px;height:16px;">
        <span style="font-size:0.85rem;">${window.app._esc(u.display_name || u.email)}</span>
        </label>
        <div class="view-toggle wf-notify-toggle2" data-user="${u.id}" style="display:inline-flex;">
          <button type="button" class="toggle-btn ${nt === "all" ? "active" : ""}" data-val="all">全部</button>
          <button type="button" class="toggle-btn ${nt === "phone" ? "active" : ""}" data-val="phone">电话</button>
          <button type="button" class="toggle-btn ${nt === "email" ? "active" : ""}" data-val="email">邮箱</button>
        </div>
      </div>`;
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
    // 通知类型切换按钮
    overlay.querySelectorAll(".wf-notify-toggle2").forEach(function (toggle) {
      toggle.addEventListener("click", function (e) {
        var btn = e.target.closest(".toggle-btn");
        if (!btn) return;
        toggle.querySelectorAll(".toggle-btn").forEach(function (b) {
          b.classList.remove("active");
        });
        btn.classList.add("active");
      });
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
            const inserts = checked.map((uid) => {
              var toggle = overlay.querySelector(
                '.wf-notify-toggle2[data-user="' + uid + '"]',
              );
              var nt = toggle
                ? toggle.querySelector(".toggle-btn.active")?.dataset.val ||
                  "all"
                : "all";
              return { node_id: nodeId, user_id: uid, notify_type: nt };
            });
            const { error } = await supabaseClient
              .from("ep_workflow_node_assignees")
              .insert(inserts);
            if (error) throw error;
          }
          overlay.remove();
          await Store.loadAllWorkflowData();
          EasyorderAndproc.renderWorkflows();
        } catch (e) {
          window.app.showToast("保存失败: " + e.message, "error");
        }
      });
  },

  // ============ 审批记录 ============

  renderApprovalRecords() {
    const container = document.getElementById("approvalRecordsContainer");
    if (!supabaseClient) {
      container.innerHTML =
        '<div class="empty-state"><p>数据库未连接</p></div>';
      return;
    }
    try {
      // 从缓存读取（启动时已预加载）
      let records = Store.getApprovalRecords();
      EasyorderAndproc._aprRecords = records;
      if (EasyorderAndproc._aprRecords.length === 0) {
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
      EasyorderAndproc._renderAprRows();
      document
        .getElementById("aprQueryBtn")
        ?.addEventListener("click", () => EasyorderAndproc._renderAprRows());
      document
        .getElementById("aprStatusF")
        ?.addEventListener("change", () => EasyorderAndproc._renderAprRows());
      document
        .getElementById("aprTypeF")
        ?.addEventListener("change", () => EasyorderAndproc._renderAprRows());
      document
        .getElementById("aprSearch")
        ?.addEventListener("input", () => EasyorderAndproc._renderAprRows());
    } catch (e) {
      container.innerHTML =
        '<div class="empty-state"><p>加载失败: ' + e.message + "</p></div>";
    }
  },

  _renderAprRows() {
    const statusF = document.getElementById("aprStatusF")?.value || "";
    const typeF = document.getElementById("aprTypeF")?.value || "";
    const search = (document.getElementById("aprSearch")?.value || "")
      .trim()
      .toLowerCase();
    const tbody = document.getElementById("aprTbody");
    let filtered = EasyorderAndproc._aprRecords;
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
        <td><strong>${window.app._esc(r.applicant_name)}</strong></td>
        <td style="font-size:0.85rem">${window.app._esc(r.applicant_company || "-")}</td>
        <td><span class="status-badge status-info">${window.app._esc(r.apply_type)}</span></td>
        <td><span class="status-badge ${sc[r.approval_status] || "status-info"}">${sm[r.approval_status] || r.approval_status}</span></td>
        <td style="font-size:0.85rem">${curText}</td>
        <td style="font-size:0.8rem;color:var(--text-light)">${window.app._fmtDT(r.created_at)}</td>
        <td><button class="btn btn-sm btn-ghost view-apr-detail" data-id="${r.id}">详情</button></td>
      </tr>`;
      })
      .join("");
    tbody.querySelectorAll(".view-apr-detail").forEach((btn) => {
      btn.addEventListener("click", () =>
        EasyorderAndproc.showApprovalRecordDetail(btn.dataset.id),
      );
    });
  },

  async showApprovalRecordDetail(recordId) {
    const record = EasyorderAndproc._aprRecords.find((r) => r.id === recordId);
    if (!record) {
      window.app.showToast("记录不存在", "error");
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
          <div style="font-size:0.8rem;font-weight:600;">${window.app._esc(n.name)}</div>
          <div style="font-size:0.65rem;opacity:0.85;">${window.app._esc(assignee)}</div>
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
                <div style="min-width:60px;font-size:0.75rem;color:var(--text-light);">${window.app._fmtDT(log.created_at)}</div>
                <div><span class="status-badge ${log.action === "approve" ? "status-success" : log.action === "reject" ? "status-error" : "status-info"}" style="font-size:0.7rem;">${am[log.action] || log.action}</span></div>
                <div style="flex:1;"><div style="font-weight:600;font-size:0.85rem;">${window.app._esc(op)}</div>${log.comment ? '<div style="font-size:0.8rem;color:var(--text-light);margin-top:2px;">' + window.app._esc(log.comment) + "</div>" : ""}</div>
              </div>`;
            })
            .join("");
    // 一次性设置innerHTML
    overlay.innerHTML = `<div class="modal" style="max-width:700px;max-height:90vh;overflow-y:auto;">
      <div class="modal-header"><h3>审批详情</h3><button class="modal-close">&times;</button></div>
      <div class="modal-body">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:20px;">
          <div><span style="color:var(--text-light);font-size:0.8rem;">申请人</span><div style="font-weight:600;">${window.app._esc(record.applicant_name)}</div></div>
          <div><span style="color:var(--text-light);font-size:0.8rem;">电话</span><div>${window.app._esc(record.applicant_phone)}</div></div>
          <div><span style="color:var(--text-light);font-size:0.8rem;">公司</span><div>${window.app._esc(record.applicant_company || "-")}</div></div>
          <div><span style="color:var(--text-light);font-size:0.8rem;">申请类型</span><div><span class="status-badge status-info">${window.app._esc(record.apply_type)}</span></div></div>
          <div><span style="color:var(--text-light);font-size:0.8rem;">来访日期</span><div>${window.app._esc(record.visit_date || "-")}</div></div>
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
  },

  // ============ 相关设置 ============

  /** 腾讯地图 API Key */
  _MAP_KEY: "GE2BZ-DKVCG-E74QK-QQNWV-XXQYS-TBF3Q",

  /** 加载腾讯地图 JS API v2（callback 模式，所有模块同步加载） */
  _loadMapAPI() {
    if (typeof qq !== "undefined" && qq.maps && qq.maps.Map && qq.maps.Marker) {
      return Promise.resolve();
    }
    if (EasyorderAndproc._mapLoading) return EasyorderAndproc._mapLoading;
    EasyorderAndproc._mapLoading = new Promise(function (resolve) {
      var cb = "__qqmaps_cb_" + Date.now();
      window[cb] = function () {
        delete window[cb];
        resolve();
      };
      var s = document.createElement("script");
      s.src =
        "https://map.qq.com/api/js?v=2.exp&key=" +
        EasyorderAndproc._MAP_KEY +
        "&callback=" +
        cb;
      s.onerror = function () {
        console.error("腾讯地图 v2 API 加载失败");
        delete window[cb];
        resolve();
      };
      document.head.appendChild(s);
    });
    return EasyorderAndproc._mapLoading;
  },

  /** 逆地址解析（经纬度 → 地址）—— 走 server.js 代理 */
  _reverseGeocode: async function (lat, lng) {
    try {
      var url =
        "/api/maps/ws/geocoder/v1/?location=" +
        lat +
        "," +
        lng +
        "&key=" +
        EasyorderAndproc._MAP_KEY;
      var res = await fetch(url);
      var json = await res.json();
      if (json.status === 0) {
        var addr = json.result.address;
        var recommend =
          json.result.formatted_addresses &&
          json.result.formatted_addresses.recommend;
        var elAddr = document.getElementById("setAddress");
        var elName = document.getElementById("setLocationName");
        if (elAddr) elAddr.value = addr;
        if (elName && !elName.value) {
          elName.value = recommend || addr;
        }
        // 同步更新搜索城市限定
        var comp = json.result.ad_info;
        var city =
          (comp && comp.city) ||
          (json.result.address_component && json.result.address_component.city);
        if (city) {
          EasyorderAndproc._settingsCity = city.replace(/市$/, "");
        }
      }
    } catch (e) {
      console.warn("逆地址解析失败:", e);
    }
  },

  /** 根据已存位置逆地址查出城市，用于限定搜索范围 */
  async _detectSettingsCity(loc) {
    var lat = loc.latitude;
    var lng = loc.longitude;
    if (!lat || !lng) return;
    try {
      var url =
        "/api/maps/ws/geocoder/v1/?location=" +
        lat +
        "," +
        lng +
        "&key=" +
        EasyorderAndproc._MAP_KEY;
      var res = await fetch(url);
      var json = await res.json();
      if (json.status === 0) {
        var comp = json.result.ad_info;
        var city =
          (comp && comp.city) ||
          (json.result.address_component && json.result.address_component.city);
        if (city) {
          EasyorderAndproc._settingsCity = city.replace(/市$/, "");
        }
      }
    } catch (e) {
      console.warn("城市检测失败:", e);
    }
  },

  /** 关键词搜索位置 → 定位到地图 */
  async _searchLocation() {
    var keyword = document.getElementById("setLocationName").value.trim();
    if (!keyword) {
      if (window.app) window.app.showToast("请输入位置名称", "error");
      return;
    }
    try {
      var url =
        "/api/maps/ws/place/v1/suggestion/?keyword=" +
        encodeURIComponent(keyword) +
        "&key=" +
        EasyorderAndproc._MAP_KEY;
      // 限定搜索范围在当前城市
      if (EasyorderAndproc._settingsCity) {
        url += "&region=" + encodeURIComponent(EasyorderAndproc._settingsCity);
      }
      var res = await fetch(url);
      var json = await res.json();
      if (json.status === 0 && json.data && json.data.length > 0) {
        var item = json.data[0];
        var lat = item.location.lat;
        var lng = item.location.lng;

        // 更新地图
        if (EasyorderAndproc._settingsMap && EasyorderAndproc._settingsMarker) {
          EasyorderAndproc._settingsMap.panTo(new qq.maps.LatLng(lat, lng));
          EasyorderAndproc._settingsMarker.setPosition(
            new qq.maps.LatLng(lat, lng),
          );
        }

        // 更新打卡范围圆
        var rad = parseInt(document.getElementById("setRadius").value) || 200;
        EasyorderAndproc._updateSettingsCircle(lat, lng, rad);

        // 更新表单
        var elLat = document.getElementById("setLatitude");
        var elLng = document.getElementById("setLongitude");
        var elAddr = document.getElementById("setAddress");
        var elName = document.getElementById("setLocationName");
        if (elLat) elLat.value = lat.toFixed(6);
        if (elLng) elLng.value = lng.toFixed(6);
        if (elAddr) elAddr.value = item.address || "";
        if (elName) elName.value = item.title || keyword;
      } else {
        if (window.app) window.app.showToast("未找到该位置", "error");
      }
    } catch (e) {
      console.warn("位置搜索失败:", e);
      if (window.app) window.app.showToast("搜索失败", "error");
    }
  },

  /** 初始化设置页面的地图（腾讯地图 JS API v2） */
  _initSettingsMap(loc) {
    if (EasyorderAndproc._settingsMap) {
      EasyorderAndproc._settingsMap = null;
      EasyorderAndproc._settingsMarker = null;
      EasyorderAndproc._settingsCircle = null;
    }
    var container = document.getElementById("mapContainer");
    if (!container || container.clientWidth === 0) return;

    if (typeof qq === "undefined" || !qq.maps || !qq.maps.Map) {
      container.innerHTML =
        '<div style="padding:40px;text-align:center;color:var(--danger);">腾讯地图未加载，请刷新重试</div>';
      return;
    }

    var lat = loc.latitude || 30.5589;
    var lng = loc.longitude || 104.0237;
    var center = new qq.maps.LatLng(lat, lng);

    EasyorderAndproc._settingsMap = new qq.maps.Map(container, {
      center: center,
      zoom: 16,
      mapTypeId: qq.maps.MapTypeId.SATELLITE,
    });

    // 可拖拽标记
    EasyorderAndproc._settingsMarker = new qq.maps.Marker({
      map: EasyorderAndproc._settingsMap,
      position: center,
      draggable: true,
    });

    // 拖拽结束
    qq.maps.event.addListener(
      EasyorderAndproc._settingsMarker,
      "dragend",
      function (e) {
        var p = e.latLng;
        var elLat = document.getElementById("setLatitude");
        var elLng = document.getElementById("setLongitude");
        if (elLat) elLat.value = p.lat.toFixed(6);
        if (elLng) elLng.value = p.lng.toFixed(6);
        var rad = parseInt(document.getElementById("setRadius").value) || 200;
        EasyorderAndproc._updateSettingsCircle(p.lat, p.lng, rad);
        EasyorderAndproc._reverseGeocode(p.lat, p.lng);
      },
    );

    // 点击地图
    qq.maps.event.addListener(
      EasyorderAndproc._settingsMap,
      "click",
      function (e) {
        var p = e.latLng;
        EasyorderAndproc._settingsMarker.setPosition(
          new qq.maps.LatLng(p.lat, p.lng),
        );
        var elLat = document.getElementById("setLatitude");
        var elLng = document.getElementById("setLongitude");
        if (elLat) elLat.value = p.lat.toFixed(6);
        if (elLng) elLng.value = p.lng.toFixed(6);
        var rad = parseInt(document.getElementById("setRadius").value) || 200;
        EasyorderAndproc._updateSettingsCircle(p.lat, p.lng, rad);
        EasyorderAndproc._reverseGeocode(p.lat, p.lng);
      },
    );

    // 填充表单
    var elLat = document.getElementById("setLatitude");
    var elLng = document.getElementById("setLongitude");
    var elAddr = document.getElementById("setAddress");
    var elName = document.getElementById("setLocationName");
    if (elLat) elLat.value = lat.toFixed(6);
    if (elLng) elLng.value = lng.toFixed(6);
    if (elAddr) elAddr.value = loc.address || "";
    if (elName) elName.value = loc.locationName || "";

    // 画打卡半径圆
    var rad = parseInt(document.getElementById("setRadius").value) || 200;
    EasyorderAndproc._updateSettingsCircle(lat, lng, rad);
  },

  /** 更新打卡范围圆圈（移除旧的，画新的） */
  _updateSettingsCircle(lat, lng, radius) {
    if (EasyorderAndproc._settingsCircle) {
      EasyorderAndproc._settingsCircle.setMap(null);
      EasyorderAndproc._settingsCircle = null;
    }
    if (!EasyorderAndproc._settingsMap) return;
    EasyorderAndproc._settingsCircle = new qq.maps.Circle({
      map: EasyorderAndproc._settingsMap,
      center: new qq.maps.LatLng(lat, lng),
      radius: radius,
      strokeColor: new qq.maps.Color(229, 57, 53, 1),
      strokeWeight: 2,
      fillColor: new qq.maps.Color(229, 57, 53, 0.3),
    });
  },

  async renderSettings() {
    var container = document.getElementById("settingsContainer");
    if (!supabaseClient) {
      container.innerHTML =
        '<div class="empty-state"><p>数据库未连接</p></div>';
      return;
    }

    // 从 Store 读取（数据已在 app 初始化时后台预加载）
    var data = Store.getSettings();
    var loc = data?.value || {};
    EasyorderAndproc._settingsData = data;

    // 根据已存位置反向查城市，用于搜索范围限制
    EasyorderAndproc._detectSettingsCity(loc);

    var escapedName = esc(loc.locationName || "");
    var escapedAddr = esc(loc.address || "");
    var latVal = loc.latitude || "";
    var lngVal = loc.longitude || "";
    var radVal = loc.radius || 200;

    // toolbar: 左侧[打卡位置][位置名称][搜索][打卡范围][保存]，右侧[刷新]
    container.innerHTML =
      '<div class="settings-page">' +
      '  <div class="table-filters" style="margin-bottom:16px;">' +
      '    <label style="font-size:0.8rem;color:var(--text-light);white-space:nowrap;display:flex;align-items:center;">打卡位置</label>' +
      '    <input type="text" id="setLocationName" class="toolbar-input" value="' +
      escapedName +
      '" placeholder="输入位置名称搜索" style="width:160px;">' +
      '    <button id="searchLocationBtn" class="toolbar-btn btn-secondary">🔍</button>' +
      '    <label style="margin-left:50px;font-size:0.8rem;color:var(--text-light);white-space:nowrap;display:flex;align-items:center;">打卡范围</label>' +
      '    <input type="number" id="setRadius" class="toolbar-input" value="' +
      radVal +
      '" min="10" max="10000" style="width:80px;">' +
      '    <button id="saveSettingsBtn" class="toolbar-btn btn-primary">保存设置</button>' +
      '    <span style="flex:1"></span>' +
      '    <button id="refreshSettingsBtn" class="toolbar-btn btn-secondary">⟳ 刷新</button>' +
      "  </div>" +
      '  <div class="settings-body">' +
      '    <div class="settings-map-section">' +
      '      <div id="mapContainer" class="settings-map"></div>' +
      '      <p class="settings-map-tip">拖拽地图上的红色标记或点击地图选择位置</p>' +
      "    </div>" +
      '    <div class="settings-form-section">' +
      '      <div class="settings-field">' +
      '        <label class="settings-label">地址</label>' +
      '        <input type="text" id="setAddress" class="toolbar-input settings-input" value="' +
      escapedAddr +
      '" placeholder="自动从地图获取" readonly style="background:#f5f5f7;">' +
      "      </div>" +
      '      <div class="settings-row">' +
      '        <div class="settings-field" style="flex:1;">' +
      '          <label class="settings-label">经度</label>' +
      '          <input type="text" id="setLatitude" class="toolbar-input settings-input" value="' +
      latVal +
      '" readonly style="background:#f5f5f7;">' +
      "        </div>" +
      '        <div class="settings-field" style="flex:1;">' +
      '          <label class="settings-label">纬度</label>' +
      '          <input type="text" id="setLongitude" class="toolbar-input settings-input" value="' +
      lngVal +
      '" readonly style="background:#f5f5f7;">' +
      "        </div>" +
      "      </div>" +
      (data?.updated_at
        ? '<p class="settings-update-time">上次更新：' +
          formatDateTime(data.updated_at) +
          "</p>"
        : "") +
      "    </div>" +
      "  </div>" +
      "</div>";

    // 地图异步加载 — 不阻塞 UI
    if (!EasyorderAndproc._mapApiLoaded) {
      var mapEl = document.getElementById("mapContainer");
      if (mapEl)
        mapEl.innerHTML =
          '<div style="height:380px;display:flex;align-items:center;justify-content:center;color:var(--text-light);font-size:0.85rem;">地图加载中…</div>';
      EasyorderAndproc._loadMapAPI().then(function () {
        EasyorderAndproc._mapApiLoaded = true;
        setTimeout(function () {
          EasyorderAndproc._initSettingsMap(loc);
        }, 100);
      });
    } else {
      setTimeout(function () {
        EasyorderAndproc._initSettingsMap(loc);
      }, 100);
    }
  },

  async saveSettings() {
    const app = window.app;
    const locationName = document
      .getElementById("setLocationName")
      .value.trim();
    const address = document.getElementById("setAddress").value.trim();
    const longitude = parseFloat(document.getElementById("setLongitude").value);
    const latitude = parseFloat(document.getElementById("setLatitude").value);
    const radius = parseInt(document.getElementById("setRadius").value) || 200;

    if (!locationName || !address) {
      app.showToast("请填写位置名称和地址", "error");
      return;
    }
    if (isNaN(longitude) || isNaN(latitude)) {
      app.showToast("请填写有效的经纬度", "error");
      return;
    }

    const value = { locationName, address, longitude, latitude, radius };
    const id = EasyorderAndproc._settingsData?.id;
    const updatedBy = app.user?.email || "system";

    try {
      const { error } = await supabaseClient
        .from("settings")
        .update({
          value,
          updated_by: updatedBy,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);
      if (error) throw error;
      // 更新 Store 缓存，确保下次 render 读到最新数据
      var savedData = EasyorderAndproc._settingsData || {};
      savedData.value = value;
      savedData.updated_by = updatedBy;
      savedData.updated_at = new Date().toISOString();
      Store.saveSettings(savedData);
      app.showToast("设置已保存", "success");
      EasyorderAndproc.renderSettings();
    } catch (e) {
      app.showToast("保存失败: " + e.message, "error");
    }
  },
};
