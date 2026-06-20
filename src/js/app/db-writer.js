/* ============================================================
 * DbWriter — 数据库写入模块
 * 职责：将样板/品类数据清洗后写入 Supabase，处理 camelCase→snake_case
 *       转换，过滤内部属性（_ 开头），确保只写入表中存在的列。
 * 不依赖 App / UploadManager，仅依赖全局 supabaseClient。
 *
 * 静态方法：DbWriter.toSnakeCase / DbWriter.fromSnakeCase
 *   供 app.js 中其他模块（Store 加载、订单/申请/打卡等直接写入）复用。
 * ============================================================ */

class DbWriter {
  /**
   * @param {Object} options
   * @param {Function} options.onToast - 提示回调 (msg, type)
   */
  constructor(options) {
    this.onToast = options.onToast || (() => {});
  }

  // ── 静态工具：字段名转换（供外部模块复用） ──

  /** camelCase → snake_case */
  static toSnakeCase(obj) {
    const r = {};
    for (const k in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, k)) {
        const sk = k.replace(/[A-Z]/g, (m) => "_" + m.toLowerCase());
        r[sk] = obj[k];
      }
    }
    return r;
  }

  /** snake_case → camelCase */
  static fromSnakeCase(obj) {
    const r = {};
    for (const k in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, k)) {
        const ck = k.replace(/_([a-z])/g, (m, c) => c.toUpperCase());
        r[ck] = obj[k];
      }
    }
    return r;
  }

  // ── 实例方法：工具 ──

  /** 过滤掉内部属性（_ 开头），只保留数据库表中存在的列 */
  _cleanRow(row) {
    const clean = {};
    for (const k in row) {
      if (Object.prototype.hasOwnProperty.call(row, k) && !k.startsWith("_")) {
        clean[k] = row[k];
      }
    }
    return clean;
  }

  /** 检查 supabaseClient 是否可用，并确保 auth session 有效 */
  async _checkClient() {
    if (typeof supabaseClient === "undefined" || !supabaseClient) {
      console.warn("[DbWriter] supabaseClient is null/undefined");
      this.onToast("数据库未连接，请刷新页面", "error");
      return false;
    }
    // 检查 session 是否有效，避免 RLS 42501 错误
    const {
      data: { session },
    } = await supabaseClient.auth.getSession();
    // 如果 Supabase 内部 session 不存在，尝试从 Store 中恢复
    if (!session && typeof Store !== "undefined" && Store.getSession) {
      const stored = Store.getSession();
      if (stored && stored._supabaseSession) {
        try {
          const { data } = await supabaseClient.auth.setSession({
            access_token: stored._supabaseSession.access_token,
            refresh_token: stored._supabaseSession.refresh_token,
          });
          if (data.session) {
            session = data.session;
          }
        } catch (e) {
          console.warn("[DbWriter] Store session restore failed:", e);
        }
      }
    }
    if (session) {
      // token 未过期，直接通过
      if (session.expires_at && session.expires_at > Date.now() / 1000) {
        return true;
      }
    }
    try {
      const {
        data: { session: refreshed },
      } = await supabaseClient.auth.refreshSession();
      if (refreshed) {
        return true;
      }
    } catch (e) {
      console.warn("[DbWriter] Session refresh failed:", e);
    }
    this.onToast("登录已过期,请重新登录", "error");
    return false;
  }

  // ── 写入操作 ──

  /**
   * 写入/更新单条样板到 samples 表
   * @param {Object} sample - 样板对象（camelCase，可能含 _ 内部属性）
   * @param {string} userId  - 当前用户 ID
   * @returns {Promise<boolean>} 是否成功
   */
  async upsertSample(sample, userId) {
    if (!(await this._checkClient())) return false;
    if (!userId) {
      console.warn("[DbWriter] upsertSample skipped: userId is empty");
      this.onToast("用户信息丢失，请重新登录", "error");
      return false;
    }

    const clean = this._cleanRow(sample);
    clean.user_id = userId;
    const row = DbWriter.toSnakeCase(clean);

    const { error } = await supabaseClient
      .from("samples")
      .upsert(row, { onConflict: "id" });

    if (error) {
      console.error("[DbWriter] upsertSample error:", error);
      throw error;
    }
    return true;
  }

  /**
   * 写入/更新单条品类到 projects 表
   * @param {Object} project - 品类对象（camelCase，可能含 _ 内部属性）
   * @param {string} userId   - 当前用户 ID
   * @returns {Promise<boolean>} 是否成功
   */
  async upsertProject(project, userId) {
    if (!(await this._checkClient())) return false;
    if (!userId) {
      console.warn("[DbWriter] upsertProject skipped: userId is empty");
      this.onToast("用户信息丢失，请重新登录", "error");
      return false;
    }

    const clean = this._cleanRow(project);
    clean.user_id = userId;
    const row = DbWriter.toSnakeCase(clean);

    const { error } = await supabaseClient
      .from("projects")
      .upsert(row, { onConflict: "id" });

    if (error) {
      console.error("[DbWriter] upsertProject error:", error);
      throw error;
    }
    return true;
  }
}
