/**
 * DashboardPage — 仪表盘独立模块
 * 依赖: Store (全局), app (用于调用 seedDemoData)
 */
(function () {
  var global = window;

  function DashboardPage(app) {
    this.app = app;
  }

  /** 加载仪表盘 HTML 容器到 DOM（只在首次加载） */
  DashboardPage.prototype.load = async function () {
    var el = document.getElementById("dashboardSection");
    if (el) return;
    try {
      var res = await fetch("src/html/dashboard.html?v=3");
      var html = await res.text();
      var target = document.querySelector("#projectsSection");
      if (target) {
        target.insertAdjacentHTML("beforebegin", html);
      }
    } catch (e) {
      console.warn("dashboard load failed:", e);
    }
  };

  DashboardPage.prototype.render = function () {
    this._startClock = function () {
      function pad(n) {
        return n < 10 ? "0" + n : n;
      }
      function tick() {
        var now = new Date();
        var y = now.getFullYear();
        var m = now.getMonth() + 1;
        var d = now.getDate();
        var h = pad(now.getHours());
        var mi = pad(now.getMinutes());
        var s = pad(now.getSeconds());
        var el = document.getElementById("dashClock");
        if (el)
          el.textContent =
            y + "年" + m + "月" + d + "日  " + h + ":" + mi + ":" + s;
      }
      tick();
      setInterval(tick, 1000);
    };

    this._startClock();
    var projects = Store.getProjects() || [];
    var samples = Store.getSamples() || [];
    var orders = Store.getOrders() || [];
    var apply = Store.getApplyRecords() || [];
    var clock = Store.getClockRecords() || [];

    // 演示模式或空数据，拉取一遍
    if (this.app.user && this.app.user.isDemo) {
      this.app.seedDemoData();
      projects = Store.getProjects();
      samples = Store.getSamples();
      orders = Store.getOrders();
      apply = Store.getApplyRecords();
      clock = Store.getClockRecords();
    }

    var sc = samples.length;
    var pc = projects.length;
    var oc = orders.length;
    var ac = apply.length;
    var cc = clock.length;
    var dailyCode = Store.getDailyCode();
    var userName = (this.app.user && this.app.user.email) || "用户";

    // ===== 填充顶部栏 + 问候语 =====
    document.getElementById("dashAvatar").setAttribute("title", userName);
    document.getElementById("dashWelcomeH1").textContent =
      "Hello，" + esc(userName) + "！";

    // ===== 统计卡片 =====
    document.getElementById("dashCardVisits").setAttribute("data-target", cc);
    document.getElementById("dashCardVisits").textContent = "0";
    document
      .getElementById("dashCardCategories")
      .setAttribute("data-target", pc);
    document.getElementById("dashCardCategories").textContent = "0";
    document.getElementById("dashCardSamples").setAttribute("data-target", sc);
    document.getElementById("dashCardSamples").textContent = "0";
    var codeEl = document.getElementById("dashInviteCode");
    if (codeEl) {
      codeEl.textContent = this._randomCodeStr(
        (dailyCode && dailyCode.length) || 6,
      );
    }

    // ===== 柱状图 =====
    document.getElementById("dashRightCard").innerHTML = this._barChart(
      samples,
      projects,
    );

    // ===== 到访表 =====
    document.getElementById("dashTodoWrap").innerHTML = this._renderTodo(clock);

    // ===== 热力图 =====
    document.getElementById("dashHeatmapWrap").innerHTML = this._renderHeatmap(
      clock,
      apply,
      orders,
    );

    // ===== 饼图（数据归一化） =====
    var applyNorm = (apply || []).map(function (a) {
      var v = a.type;
      return v === "运输" || v === "参观" || v === "选样" || v === "借还"
        ? a
        : { type: "其他" };
    });
    var clockNorm = (clock || []).map(function (c) {
      var v = c.companyType;
      return v === "业主方" || v === "品牌方" || v === "运营方"
        ? c
        : { companyType: "其他" };
    });
    var self = this;
    function _insertDonut(title, data, field, colorMap) {
      var html = self._miniDonut(title, data, field, colorMap);
      var wrap = document.createElement("div");
      wrap.innerHTML = html;
      var chart = wrap.firstElementChild;
      if (chart) {
        document.getElementById("dashDonutGrid").appendChild(chart);
      }
    }
    var donutGrid = document.getElementById("dashDonutGrid");
    donutGrid.innerHTML = "";
    _insertDonut("订单状态", orders, "status", {
      未提交: "#FF9800",
      已收录: "#4CAF50",
    });
    _insertDonut("申请类型", applyNorm, "type", {
      运输: "#2196F3",
      参观: "#9C27B0",
      选样: "#FF5722",
      借还: "#00BCD4",
      其他: "#607D8B",
    });
    _insertDonut("打卡角色", clockNorm, "companyType", {
      业主方: "#4CAF50",
      运营方: "#2196F3",
      品牌方: "#FF9800",
      其他: "#607D8B",
    });

    // ===== 热力图自适应（延迟执行） =====
    requestAnimationFrame(function () {
      var _qCont = document.querySelector(".heatmap-quarters");
      if (_qCont) {
        var _qGrids = _qCont.querySelectorAll(".quarter-grid");

        // 第一遍：收集每个季度的约束
        var _qs = [];
        for (var _qi = 0; _qi < _qGrids.length; _qi++) {
          var _qGrid = _qGrids[_qi];
          var _qH = _qGrid.clientHeight;
          var _qW = _qGrid.clientWidth;
          if (_qH <= 0 || _qW <= 0) continue;
          var _qCm = _qGrid.style.gridTemplateColumns.match(/repeat\((\d+)/);
          if (!_qCm) continue;
          var _qCols = parseInt(_qCm[1], 10);
          var _qCells = _qGrid.querySelectorAll(".heatmap-cell");
          var _qRows = Math.ceil(_qCells.length / _qCols);
          _qs.push({
            grid: _qGrid,
            cells: _qCells,
            cols: _qCols,
            rows: _qRows,
            w: _qW,
            h: _qH,
          });
        }

        // 计算统一 cell：取所有季度的最小约束
        var _uCell = 9999;
        for (var _qi2 = 0; _qi2 < _qs.length; _qi2++) {
          var _c = _qs[_qi2];
          var _cH = (4 * _c.h) / (5 * _c.rows - 1);
          var _cW = (4 * _c.w) / (5 * _c.cols - 1);
          _uCell = Math.min(_uCell, _cH, _cW);
        }
        if (_uCell < 2) _uCell = 2;
        var _uGap = _uCell / 4;

        // 统一应用到所有季度
        for (var _qi3 = 0; _qi3 < _qs.length; _qi3++) {
          var _g = _qs[_qi3].grid;
          var _cells = _qs[_qi3].cells;
          _g.style.columnGap = _uGap + "px";
          _g.style.rowGap = _uGap + "px";
          _g.style.gridTemplateColumns =
            "repeat(" + _qs[_qi3].cols + ", " + _uCell + "px)";
          _g.style.justifyContent = "center";
          _g.style.alignContent = "start";
          _g.style.width = "auto";
          _g.style.margin = "0 auto";
          for (var _ci = 0; _ci < _cells.length; _ci++) {
            _cells[_ci].style.width = _uCell + "px";
            _cells[_ci].style.height = _uCell + "px";
          }
        }

        // 淡入：跨季度统一排序
        var _allCells = _qCont.querySelectorAll(".heatmap-cell");
        var _uArr = [];
        for (var _ui = 0; _ui < _allCells.length; _ui++) {
          _uArr.push({
            el: _allCells[_ui],
            cnt: parseInt(_allCells[_ui].getAttribute("data-count")) || 0,
          });
        }
        _uArr.sort(function (a, b) {
          return b.cnt - a.cnt;
        });
        var _uGroups = [];
        var _uPrev = -1;
        for (var _ui2 = 0; _ui2 < _uArr.length; _ui2++) {
          if (_uArr[_ui2].cnt !== _uPrev) {
            _uPrev = _uArr[_ui2].cnt;
            _uGroups.push([]);
          }
          _uGroups[_uGroups.length - 1].push(_uArr[_ui2].el);
        }
        for (var _ug = 0; _ug < _uGroups.length; _ug++) {
          for (var _ue = 0; _ue < _uGroups[_ug].length; _ue++) {
            _uGroups[_ug][_ue].style.opacity = "0";
            _uGroups[_ug][_ue].style.transition = "opacity 0.35s ease";
            (function (el, delay) {
              setTimeout(function () {
                el.style.opacity = "";
              }, delay);
            })(_uGroups[_ug][_ue], _ug * 60);
          }
        }
      }
    });

    // 清除旧的拖拽排序记录
    try {
      localStorage.removeItem("dash_bar_order");
    } catch (e) {}

    // 动画
    this._animateNumbers();
    this._animateFlipCode(dailyCode);
    this._animateMiniDonuts();
    this._setupChartSettings();
  };

  // ===== 动画 =====

  DashboardPage.prototype._animateNumbers = function () {
    var els = document.querySelectorAll(".dash-card-value[data-target]");
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
  };

  DashboardPage.prototype._animateFlipCode = function (finalCode) {
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
  };

  DashboardPage.prototype._animateMiniDonuts = function () {
    var els = document.querySelectorAll(".mini-donut[data-final-bg]");
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
      var duration = 600;
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
  };

  DashboardPage.prototype._lerpColor = function (c1, c2, t) {
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
  };

  DashboardPage.prototype._randomCodeStr = function (len) {
    var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    var s = "";
    for (var i = 0; i < len; i++)
      s += chars[Math.floor(Math.random() * chars.length)];
    return s;
  };

  // ===== 迷你甜甜圈（用于右侧列） =====
  DashboardPage.prototype._miniDonut = function (title, data, field, colorMap) {
    var total = data.length;
    var counts = {};
    data.forEach(function (d) {
      var val = d[field] || "其他";
      counts[val] = (counts[val] || 0) + 1;
    });

    var conicParts = [];
    var legendHtml = "";
    var startDeg = 0;
    var colorKeys = Object.keys(colorMap);

    for (var ci = 0; ci < colorKeys.length; ci++) {
      var key = colorKeys[ci];
      var cnt = counts[key] || 0;
      if (cnt === 0) continue;
      var deg = (cnt / total) * 360;
      var color = colorMap[key];
      conicParts.push(
        color + " " + startDeg + "deg " + (startDeg + deg) + "deg",
      );
      legendHtml +=
        '<span class="mini-legend-item"><span class="mini-dot" style="background:' +
        color +
        '"></span>' +
        key +
        " " +
        cnt +
        "</span>";
      startDeg += deg;
    }

    // 未在 colorMap 中的值
    for (var k in counts) {
      if (colorKeys.indexOf(k) === -1) {
        var cnt2 = counts[k];
        var deg2 = (cnt2 / total) * 360;
        conicParts.push(
          "#607D8B " + startDeg + "deg " + (startDeg + deg2) + "deg",
        );
        legendHtml +=
          '<span class="mini-legend-item"><span class="mini-dot" style="background:#607D8B"></span>' +
          k +
          " " +
          cnt2 +
          "</span>";
        startDeg += deg2;
      }
    }

    var hasData = total > 0 && conicParts.length > 0;
    var finalBg = hasData
      ? "conic-gradient(" + conicParts.join(", ") + ")"
      : "#f0f0f0";

    return (
      '<div class="dash-mini-chart">' +
      '<div class="mini-body">' +
      '<div class="mini-donut" data-final-bg="' +
      esc(finalBg) +
      '" style="background:conic-gradient(#e0e0e0 0deg 360deg)">' +
      '<span class="mini-donut-count">' +
      total +
      "</span></div>" +
      '<div class="mini-legend">' +
      '<div class="mini-title">' +
      title +
      "</div>" +
      (legendHtml ||
        '<span style="color:var(--text-light);font-size:0.7rem;">暂无数据</span>') +
      "</div>" +
      "</div></div>"
    );
  };

  // ===== 到访表 =====
  DashboardPage.prototype._renderTodo = function (clock) {
    var html = "";

    // 到访数据
    var items = [];
    var cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30);
    (clock || []).forEach(function (r) {
      var t = r.clockTime;
      if (t && new Date(t) >= cutoff) {
        items.push({
          name: r.name || "未知",
          phone: r.phone || "-",
          company: r.company || "",
          time: t,
        });
      }
    });

    // 按时间倒序
    items.sort(function (a, b) {
      return (b.time || "").localeCompare(a.time || "");
    });

    // 取最近 10 条
    var show = items.slice(0, 10);

    html += '<table class="todo-table">';
    html += "<thead><tr>";
    html += "<th>序号</th><th>姓名</th><th>电话</th><th>公司</th><th>时间</th>";
    html += "</tr></thead><tbody>";
    show.forEach(function (item, i) {
      html += "<tr>";
      html += "<td>" + (i + 1) + "</td>";
      html += "<td>" + esc(item.name) + "</td>";
      html += "<td>" + esc(item.phone) + "</td>";
      html += "<td>" + esc(item.company) + "</td>";
      html += "<td>" + this._fmtHour(item.time) + "</td>";
      html += "</tr>";
    }, this);
    if (show.length === 0) {
      html +=
        '<tr><td colspan="5" style="text-align:center;color:var(--text-light);padding:16px 0;">暂无记录</td></tr>';
    }
    html += "</tbody></table>";

    return html;
  };

  // ===== 日期热力图 =====
  DashboardPage.prototype._renderHeatmap = function (clock, apply, orders) {
    var html = "";

    // 按日期汇总（申请+到访+订单）
    var dateCounts = {};
    function addItems(items, field) {
      (items || []).forEach(function (item) {
        var raw = item[field];
        if (raw) {
          var key = raw.slice(0, 10);
          dateCounts[key] = (dateCounts[key] || 0) + 1;
        }
      });
    }
    addItems(clock, "clockTime");
    addItems(apply, "createdAt");
    addItems(orders, "createdAt");

    // 最大密度
    var maxCount = 0;
    for (var k in dateCounts) {
      if (dateCounts[k] > maxCount) maxCount = dateCounts[k];
    }
    if (maxCount === 0) maxCount = 1;

    // 生成当年所有天数（1月1日 ~ 12月31日）
    var now = new Date();
    var year = now.getFullYear();
    var isLeap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    var totalDays = isLeap ? 366 : 365;
    var days = [];
    for (var i = 1; i <= totalDays; i++) {
      var d = new Date(year, 0, i);
      var y = d.getFullYear();
      var m = String(d.getMonth() + 1).padStart(2, "0");
      var dd = String(d.getDate()).padStart(2, "0");
      var dateKey = y + "-" + m + "-" + dd;
      days.push({ key: dateKey, count: dateCounts[dateKey] || 0 });
    }

    // 按月份分 4 组
    var quarters = [
      { label: "1-3", months: [1, 2, 3] },
      { label: "4-6", months: [4, 5, 6] },
      { label: "7-9", months: [7, 8, 9] },
      { label: "10-12", months: [10, 11, 12] },
    ];

    function getLevel(cnt) {
      var r = cnt / maxCount;
      return r > 0.75 ? 4 : r > 0.5 ? 3 : r > 0.25 ? 2 : r > 0 ? 1 : 0;
    }

    html += '<div class="heatmap-quarters">';
    quarters.forEach(function (q) {
      var qDays = days.filter(function (d) {
        var m = parseInt(d.key.slice(5, 7), 10);
        return q.months.indexOf(m) !== -1;
      });
      var qCols = Math.ceil(Math.sqrt(qDays.length));
      var startMonth = q.months[0];
      var endMonth = q.months[q.months.length - 1];
      html += '<div class="quarter-group">';
      html +=
        '<div class="quarter-grid" style="grid-template-columns:repeat(' +
        qCols +
        ', 1fr);">';
      qDays.forEach(function (day) {
        var level = getLevel(day.count);
        html +=
          '<div class="heatmap-cell heatmap-lvl-' +
          level +
          '" data-count="' +
          day.count +
          '" title="' +
          day.key +
          "：活动" +
          day.count +
          '条"></div>';
      });
      html += "</div>"; // end quarter-grid
      html +=
        '<div class="quarter-label">' +
        startMonth +
        "月~" +
        endMonth +
        "月</div>";
      html += "</div>"; // end quarter-group
    });
    html += "</div>"; // end heatmap-quarters

    return html;
  };

  DashboardPage.prototype._fmtHour = function (isoStr) {
    if (!isoStr) return "";
    try {
      var d = new Date(isoStr);
      var y = d.getFullYear();
      var m = d.getMonth() + 1;
      var day = d.getDate();
      var h = d.getHours();
      var ampm = h < 12 ? "am" : "pm";
      if (h > 12) h = h - 12;
      if (h === 0) h = 12;
      return y + "/" + m + "/" + day + " " + h + ampm;
    } catch (e) {
      return "";
    }
  };

  // ===== 柱状图（最近动态） =====
  DashboardPage.prototype._barChart = function (samples, projects) {
    var self = this;
    if (!this._chartSettings) {
      this._chartSettings = {};
      projects.forEach(function (p) {
        self._chartSettings[p.id] = true;
      });
    }
    if (!this._chartSort) this._chartSort = "total-desc";

    // 按 projectId 分组：左柱=该品类总样板数，右柱=集采范围内数量
    var group = {};
    samples.forEach(function (s) {
      var pid = s.projectId;
      if (!group[pid]) group[pid] = { total: 0, procurement: 0 };
      group[pid].total++;
      if (s.procurementRange === "范围内") group[pid].procurement++;
    });

    // 排序 projects
    var sorted = projects.slice();
    sorted.sort(function (a, b) {
      var ga = group[a.id] || { total: 0, procurement: 0 };
      var gb = group[b.id] || { total: 0, procurement: 0 };
      switch (self._chartSort) {
        case "total-desc":
          return gb.total - ga.total;
        case "procurement-desc":
          return gb.procurement - ga.procurement;
        case "rate-desc": {
          var rateA = ga.total > 0 ? ga.procurement / ga.total : 0;
          var rateB = gb.total > 0 ? gb.procurement / gb.total : 0;
          return rateB - rateA;
        }
        default:
          return 0;
      }
    });

    // 计算最大值，用于柱高缩放和网格线
    var maxVal = 0;
    projects.forEach(function (p) {
      var g = group[p.id] || { total: 0, procurement: 0 };
      var m = Math.max(g.total, g.procurement);
      if (m > maxVal) maxVal = m;
    });
    if (maxVal === 0) maxVal = 10;
    var gridMax = Math.ceil(maxVal / 10) * 10;
    if (gridMax === 0) gridMax = 10;

    function escHtml(s) {
      if (typeof s !== "string") return s;
      return s
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
    }

    var html = "";

    // ===== 整体统计 =====
    var totalSamples = samples.length;
    var totalProcurement = 0;
    samples.forEach(function (s) {
      if (s.procurementRange === "范围内") totalProcurement++;
    });

    // ===== Header：红点 =====
    html += '<div class="dash-bar-header">';
    html += '<div class="chart-settings-wrapper">';
    html += '<span class="chart-settings-dot"></span>';
    html += '<div class="chart-settings-popup">';
    html += '<div class="chart-sort-wrap">';
    var sortOpts = [
      { val: "total-desc", label: "样板总数 ↓" },
      { val: "procurement-desc", label: "集采数量 ↓" },
      { val: "rate-desc", label: "集采率 ↓" },
    ];
    sortOpts.forEach(function (opt) {
      var checked = self._chartSort === opt.val ? "checked" : "";
      html +=
        '<label class="sort-radio"><input type="radio" name="chartSort" value="' +
        opt.val +
        '" ' +
        checked +
        "> " +
        opt.label +
        "</label>";
    });
    html += "</div>";
    projects.forEach(function (p) {
      var checked = self._chartSettings[p.id] !== false ? "checked" : "";
      html +=
        '<label><input type="checkbox" data-pid="' +
        p.id +
        '" ' +
        checked +
        "> " +
        escHtml(p.name) +
        "</label>";
    });
    html += "</div></div></div>";

    // ===== 统计 + 图例 =====
    html += '<div class="dash-chart-info">';
    html += '<div class="dash-chart-stats">';
    html +=
      '<span class="legend-item"><span class="legend-dot legend-total"></span>展示样板：' +
      totalSamples +
      "</span>";
    html +=
      '<span class="legend-item"><span class="legend-dot legend-procurement"></span>集采范围内：' +
      totalProcurement +
      "</span>";
    html += "</div>";
    html += "</div>";

    // ===== Chart body：网格线 + 柱子 =====
    html += '<div class="dash-bar-body">';

    // 5 条水平网格线（0%、25%、50%、75%、100%）
    html += '<div class="chart-grid">';
    var steps = [0, 1, 2, 3, 4];
    steps.forEach(function (i) {
      var pct = (i / 4) * 100;
      var val = Math.round((gridMax * i) / 4);
      html +=
        '<div class="chart-grid-line" style="bottom:' +
        pct +
        '%"><span class="chart-grid-label">' +
        val +
        "</span></div>";
    });
    html += "</div>";

    // 柱子区域
    html += '<div class="chart-bars">';
    sorted.forEach(function (p) {
      var g = group[p.id] || { total: 0, procurement: 0 };
      var totalH = gridMax > 0 ? (g.total / gridMax) * 100 : 0;
      var procH = gridMax > 0 ? (g.procurement / gridMax) * 100 : 0;
      var hidden = self._chartSettings[p.id] === false;
      html +=
        '<div class="bar-group' +
        (hidden ? " hidden" : "") +
        '" data-pid="' +
        p.id +
        '">';
      html += '<div class="bar-wrapper">';
      html += '<div class="bar bar-total" style="height:' + totalH + '%">';
      if (g.total > 0) html += '<span class="bar-value">' + g.total + "</span>";
      html += "</div>";
      html += '<div class="bar bar-procurement" style="height:' + procH + '%">';
      if (g.procurement > 0)
        html += '<span class="bar-value">' + g.procurement + "</span>";
      html += "</div>";
      html += "</div>";
      html += '<div class="bar-group-label">' + escHtml(p.name) + "</div>";
      html += "</div>";
    });
    html += "</div>"; // end chart-bars
    html += "</div>"; // end dash-bar-body

    return html;
  };

  // ===== 品类设置更新（柱状图红点 + 排序） =====
  DashboardPage.prototype._setupChartSettings = function () {
    var self = this;
    var container = document.querySelector(".dash-right-card");
    if (!container) return;

    // 红点点击切换弹窗
    var dot = container.querySelector(".chart-settings-dot");
    var popup = container.querySelector(".chart-settings-popup");
    if (dot && popup) {
      dot.addEventListener("click", function (e) {
        e.stopPropagation();
        var isOpen = popup.style.display === "block";
        popup.style.display = isOpen ? "none" : "block";
      });
      // 点击外部关闭
      document.addEventListener("click", function () {
        popup.style.display = "none";
      });
      popup.addEventListener("click", function (e) {
        e.stopPropagation();
      });
    }

    // checkbox 切换品类显示
    var checks = container.querySelectorAll(
      '.chart-settings-popup input[type="checkbox"]',
    );
    checks.forEach(function (cb) {
      cb.addEventListener("change", function () {
        var pid = this.getAttribute("data-pid");
        self._chartSettings[pid] = this.checked;
        var group = container.querySelector(
          '.bar-group[data-pid="' + pid + '"]',
        );
        if (group) {
          group.classList.toggle("hidden", !this.checked);
        }
      });
    });

    // 排序 radio 切换 → 重绘柱状图
    var radios = container.querySelectorAll(
      '.chart-sort-wrap input[type="radio"]',
    );
    radios.forEach(function (radio) {
      radio.addEventListener("change", function () {
        if (!this.checked) return;
        self._chartSort = this.value;
        var samples = Store.getSamples() || [];
        var projects = Store.getProjects() || [];
        var el = document.getElementById("dashRightCard");
        if (el) {
          el.innerHTML = self._barChart(samples, projects);
          self._setupChartSettings();
        }
      });
    });
  };

  // 暴露全局
  global.DashboardPage = DashboardPage;
})();
