/* ============================================================
 * UploadManager — 上传队列 + 进度条 Toast
 * 职责：管理样板图片的并发上传（最多 5 个），显示进度条，
 *       失败时可重试。不依赖 App 实例，通过依赖注入。
 *       数据库写入委托给 DbWriter 模块。
 * ============================================================ */

class UploadManager {
  constructor(options) {
    this.store = options.store;
    this.dbWriter = options.dbWriter;
    this.compressImage = options.compressImage;
    this.uploadToStorage = options.uploadToStorage;
    this.deleteFromStorage = options.deleteFromStorage;
    this.onToast = options.onToast || (() => {});
    this.onRender = options.onRender || (() => {});
    this._userId = options.userId || "";

    this._queue = [];
    this._active = 0;
    this._max = 5;
    this._progressToasts = {};
  }

  /** 更新 userId（登录/登出时调用） */
  setUserId(id) {
    this._userId = id || "";
  }

  // ── 公开 API ──

  /** 加入上传队列 */
  enqueue(task) {
    this._queue.push(task);
    if (this._queue.length > this._max) {
      this.onToast(
        "等待上传队列（" + (this._queue.length - this._active) + "个排队中）",
        "info",
      );
    }
    this._processQueue();
  }

  /** 重试失败的上传 */
  retry(taskId) {
    const data = this._progressToasts[taskId];
    if (!data) return;
    this._removeProgressToast(taskId);
    const samples = this.store.getSamples();
    const idx = samples.findIndex((s) => s.id === taskId);
    if (idx === -1) return;
    samples[idx]._uploadFailed = false;
    samples[idx]._pendingUpload = true;
    this.store.saveSamples(samples);
    this.onRender();
    const sample = samples[idx];
    this._showProgressToast(taskId, sample.code);
    this.enqueue({
      targetId: taskId,
      isEdit: true,
      localImageUrl: sample.imageUrl,
      hasNewImage: true,
      oldStorageUrl: null,
      oldThumbUrl: null,
      code: sample.code,
    });
  }

  // ── 进度条 Toast ──

  _showProgressToast(taskId, code) {
    const container = document.getElementById("progressToastContainer");
    if (!container) return;
    this._removeProgressToast(taskId);
    const toast = document.createElement("div");
    toast.className = "progress-toast";
    toast.id = "progressToast_" + taskId;
    toast.innerHTML =
      '<div class="progress-toast-header">' +
      '<span class="progress-toast-code">创建编号' +
      code +
      "样板</span>" +
      '<span class="progress-toast-pct">0%</span>' +
      "</div>" +
      '<div class="progress-toast-bar">' +
      '<div class="progress-toast-fill" style="width:0%"></div>' +
      "</div>" +
      '<div class="progress-toast-status">准备上传…</div>';
    container.appendChild(toast);
    this._progressToasts[taskId] = { toast: toast, code: code };
  }

  _updateProgressToast(taskId, progress, status) {
    const data = this._progressToasts[taskId];
    if (!data) return;
    const toast = data.toast;
    const pctEl = toast.querySelector(".progress-toast-pct");
    const fillEl = toast.querySelector(".progress-toast-fill");
    const statusEl = toast.querySelector(".progress-toast-status");
    const codeEl = toast.querySelector(".progress-toast-code");
    if (status === "uploading") {
      pctEl.textContent = progress + "%";
      fillEl.style.width = progress + "%";
      codeEl.textContent = "创建编号" + data.code + "样板";
      statusEl.textContent = "正在上传中";
    } else if (status === "done") {
      toast.classList.add("done");
      pctEl.textContent = "100%";
      fillEl.style.width = "100%";
      codeEl.textContent = "创建编号" + data.code + "样板";
      statusEl.textContent = "已完成";
      setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transition = "opacity 0.3s";
        setTimeout(() => this._removeProgressToast(taskId), 300);
      }, 3000);
    } else if (status === "failed") {
      toast.classList.add("failed");
      pctEl.textContent = "失败";
      codeEl.textContent = "创建编号" + data.code + "样板";
      statusEl.innerHTML =
        '<button class="progress-retry-btn" data-task-id="' +
        taskId +
        '">请重试</button>';
    }
  }

  _removeProgressToast(taskId) {
    const data = this._progressToasts[taskId];
    if (!data) return;
    data.toast.remove();
    delete this._progressToasts[taskId];
  }

  _startProgressTimer(onProgress) {
    let progress = 0;
    let target = 15;
    const timer = setInterval(() => {
      if (progress < target) {
        progress = Math.min(progress + 3, target);
        onProgress(progress, "uploading");
      }
    }, 30);
    return {
      setTarget: (t) => {
        target = t;
      },
      done: (pct, status) => {
        clearInterval(timer);
        onProgress(pct, status);
      },
    };
  }

  // ── 队列处理 ──

  _processQueue() {
    while (this._active < this._max && this._queue.length > 0) {
      const task = this._queue.shift();
      this._active++;
      if (task.code) {
        this._showProgressToast(task.targetId, task.code);
      }
      // 注入 onProgress 回调
      task.onProgress = (pct, status) => {
        this._updateProgressToast(task.targetId, pct, status);
      };
      this._executeUpload(task).finally(() => {
        this._active--;
        this._processQueue();
      });
    }
  }

  // ── 单次上传执行 ──

  async _executeUpload({
    targetId,
    localImageUrl,
    hasNewImage,
    oldStorageUrl,
    oldThumbUrl,
    onProgress,
  }) {
    const freshSamples = this.store.getSamples();
    const sample = freshSamples.find((s) => s.id === targetId);

    if (!sample || !hasNewImage) {
      if (!sample) {
        console.warn(
          "[UploadManager] Sample not found in cache:",
          targetId,
          "may have been lost due to localStorage quota exceeded",
        );
        this.onToast("样板保存异常，请刷新页面后重试", "error");
        if (onProgress) onProgress(0, "failed");
        return;
      }
      if (onProgress) onProgress(0, "uploading");
      try {
        await this.dbWriter.upsertSample(sample, this._userId);
        if (onProgress) onProgress(100, "done");
        // hasNewImage=false：无图片变更，卡面已由 saveSample 增量追加/编辑时全量渲染
        // 无需触发 this.onRender() 全量重建 DOM，避免 "+" 占位侵扰
      } catch (e) {
        console.warn("DB sync failed:", e);
        if (onProgress) onProgress(0, "failed");
        sample._uploadFailed = true;
        this.store.saveSamples(freshSamples);
      }
      return;
    }

    let imageUrl = sample.imageUrl;
    let thumbnailUrl = sample.thumbnailUrl || "";
    const progressTimer = this._startProgressTimer((pct, s) => {
      if (onProgress) onProgress(pct, s);
    });

    try {
      // 5% → 15% 压缩图片（直接传 data URL，避免手机端 fetch(data:) 失败）
      progressTimer.setTarget(15);
      if (onProgress) this._updateProgressToast(targetId, 5, "uploading");
      const compressed = await this.compressImage(localImageUrl, 600, 0.8);

      if (compressed) {
        // 15% → 50% 上传原图
        progressTimer.setTarget(50);
        imageUrl = await this.uploadToStorage(compressed, targetId, "full");

        // 50% → 70% 压缩缩略图
        progressTimer.setTarget(70);
        const thumb = await this.compressImage(compressed, 200, 0.7);

        if (thumb) {
          // 70% → 85% 上传缩略图
          progressTimer.setTarget(85);
          thumbnailUrl = await this.uploadToStorage(thumb, targetId, "thumb");
        }
      }

      // 删除旧图片
      if (oldStorageUrl && oldStorageUrl.includes("sample-images"))
        this.deleteFromStorage(oldStorageUrl);
      if (oldThumbUrl && oldThumbUrl.includes("sample-images"))
        this.deleteFromStorage(oldThumbUrl);

      // 85% → 95% 写入数据库
      progressTimer.setTarget(95);
      const latestSamples = this.store.getSamples();
      const idx = latestSamples.findIndex((s) => s.id === targetId);
      if (idx !== -1) {
        latestSamples[idx].imageUrl = imageUrl;
        latestSamples[idx].thumbnailUrl = thumbnailUrl;
        latestSamples[idx]._uploadFailed = false;
        latestSamples[idx]._pendingUpload = false;
        this.store.saveSamples(latestSamples);
        try {
          const result = await this.dbWriter.upsertSample(
            latestSamples[idx],
            this._userId,
          );
          if (!result) {
            // DB 写入失败（如 RLS 42501），标记为失败以便重试
            latestSamples[idx]._uploadFailed = true;
            latestSamples[idx]._pendingUpload = false;
            this.store.saveSamples(latestSamples);
            this.onToast("数据库写入失败，可稍后重试", "error");
          }
        } catch (e) {
          latestSamples[idx]._uploadFailed = true;
          latestSamples[idx]._pendingUpload = false;
          this.store.saveSamples(latestSamples);
          this.onToast("数据库写入失败: " + e.message, "error");
        }
      }

      progressTimer.done(100, "done");
      this.onRender();
    } catch (e) {
      console.warn("[UploadManager] Image upload FAILED:", e.message, e);
      progressTimer.done(0, "failed");
      this.onToast("上传失败:" + e.message.substring(0, 30), "error");

      const latestSamples = this.store.getSamples();
      const idx = latestSamples.findIndex((s) => s.id === targetId);
      if (idx !== -1) {
        latestSamples[idx]._uploadFailed = true;
        latestSamples[idx]._pendingUpload = false;
        this.store.saveSamples(latestSamples);
        // 写入元数据到 DB（不含图片 URL），确保刷新后不丢失
        try {
          const sampleToSave = { ...latestSamples[idx] };
          sampleToSave.imageUrl = "";
          sampleToSave.thumbnailUrl = "";
          await this.dbWriter.upsertSample(sampleToSave, this._userId);
        } catch (dbErr) {
          console.warn("DB sync on failure failed:", dbErr);
        }
      }
      this.onRender();
    }
  }
}
