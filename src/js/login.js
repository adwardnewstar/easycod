/**
 * LoginPage — 登录页独立模块
 * 负责渲染登录表单、事件绑定、Supabase 登录/演示登录 API 调用
 * 登录成功后通过 onLoginSuccess 回调通知 app.js
 */
class LoginPage {
  constructor(options = {}) {
    this.onLoginSuccess = options.onLoginSuccess || (() => {});
    this.showToast = options.showToast || ((msg) => alert(msg));
  }

  /** Login 表单已内嵌在 index.html 中，无需额外加载 */
  async render() {
    // HTML 已内联，无需操作
  }

  /** 绑定表单事件 */
  init() {
    const form = document.getElementById("loginForm");
    if (form) {
      // 移除旧监听器避免重复绑定
      const newForm = form.cloneNode(true);
      form.parentNode.replaceChild(newForm, form);
      newForm.addEventListener("submit", (e) => {
        e.preventDefault();
        this._handleLogin();
      });
    }
  }

  /** 按钮加载动画：点往返增减 */
  _startLoading() {
    const btn = document.querySelector(".btn-block");
    if (!btn) return;
    btn.disabled = true;
    let dots = 0;
    let dir = 1;
    this._loadingInterval = setInterval(() => {
      dots += dir;
      if (dots >= 3) dir = -1;
      else if (dots <= 0) dir = 1;
      btn.textContent = "Login" + ".".repeat(dots);
    }, 400);
  }

  _stopLoading() {
    clearInterval(this._loadingInterval);
    const btn = document.querySelector(".btn-block");
    if (btn) {
      btn.disabled = false;
      btn.textContent = "Login";
    }
  }

  /** 邮箱密码登录 */
  async _handleLogin() {
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

    this._startLoading();

    try {
      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        this.showToast(error.message, "error");
        this._stopLoading();
        return;
      }

      const user = data.user;
      const userData = {
        id: user.id,
        email: user.email,
        name: email.split("@")[0],
        isDemo: false,
      };

      // 显式保存 Supabase auth session，避免手机端 token 丢失导致 RLS 拒绝写入
      if (data.session) {
        userData._supabaseSession = {
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
          expires_at: data.session.expires_at,
        };
      }

      // 获取 ep_users 权限
      try {
        const { data: epData } = await supabaseClient
          .from("ep_users")
          .select(
            "role, easycod, easyorder, easyproc, easyvoice, menu_permissions",
          )
          .eq("auth_user_id", user.id)
          .eq("is_active", true)
          .single();
        if (epData) {
          userData.role = epData.role;
          userData.easycod = epData.easycod;
          userData.easyorder = epData.easyorder;
          userData.easyproc = epData.easyproc;
          userData.easyvoice = epData.easyvoice;
          userData.menuPermissions = epData.menu_permissions;
        }
      } catch (e) {
        // ep_users 中没有记录，非 admin 无法登录
        if (userData.email !== "452363508@qq.com") {
          await supabaseClient.auth.signOut();
          this.showToast("该账号未被授权", "error");
          this._stopLoading();
          return;
        }
      }

      Store.saveSession(userData);
      this.showToast("登录成功", "success");
      this.onLoginSuccess(userData);
    } catch (e) {
      this.showToast(e.message || "数据库连接失败，请检查网络后重试", "error");
      this._stopLoading();
    }
  }

  /** 演示模式登录 */
  async handleDemoLogin() {
    const user = {
      id: "demo-user",
      email: "demo@easycod.dev",
      name: "演示用户",
      isDemo: true,
    };
    Store.saveSession(user);
    this.showToast("已进入演示模式", "success");
    this.onLoginSuccess(user);
  }
}
