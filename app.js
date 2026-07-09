/**
 * 盲盒抽取平台 · 交互逻辑
 * 依赖：window.GACHA_CONFIG（来自 config.js）
 */
(function () {
  "use strict";

  // -------- 工具函数 --------
  function $(id) {
    return document.getElementById(id);
  }

  function wait(ms) {
    return new Promise(function (resolve) {
      setTimeout(resolve, ms);
    });
  }

  function pad(n) {
    return n < 10 ? "0" + n : "" + n;
  }

  // 轻量 toast 提示（避免阻塞式 alert/confirm）
  function showToast(message, duration) {
    duration = duration || 1800;
    var toast = document.createElement("div");
    toast.className = "toast";
    toast.textContent = message;
    document.body.appendChild(toast);
    // 强制重排以触发 transition
    // eslint-disable-next-line no-unused-expressions
    toast.offsetHeight;
    toast.classList.add("show");
    wait(duration).then(function () {
      toast.classList.remove("show");
      return wait(280);
    }).then(function () {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    });
  }

  // 内嵌式确认对话框（替代 confirm）
  function showInlineConfirm(message, onConfirm) {
    // 隐藏 resetBtn
    resetBtn.hidden = true;
    var actions = document.querySelector(".actions");
    var confirmEl = document.createElement("div");
    confirmEl.className = "inline-confirm";
    confirmEl.innerHTML =
      '<span class="inline-confirm-text">' + message + '</span>' +
      '<button class="inline-confirm-yes" type="button">确定</button>' +
      '<button class="inline-confirm-no" type="button">取消</button>';
    actions.appendChild(confirmEl);
    // 强制重排以触发 transition
    // eslint-disable-next-line no-unused-expressions
    confirmEl.offsetHeight;
    confirmEl.classList.add("show");

    var timer = setTimeout(function () {
      hideInlineConfirm(confirmEl);
    }, 4000);

    confirmEl.querySelector(".inline-confirm-yes").addEventListener("click", function () {
      clearTimeout(timer);
      hideInlineConfirm(confirmEl);
      if (onConfirm) onConfirm();
    });

    confirmEl.querySelector(".inline-confirm-no").addEventListener("click", function () {
      clearTimeout(timer);
      hideInlineConfirm(confirmEl);
    });
  }

  function hideInlineConfirm(confirmEl) {
    confirmEl.classList.remove("show");
    wait(250).then(function () {
      if (confirmEl.parentNode) confirmEl.parentNode.removeChild(confirmEl);
      resetBtn.hidden = false;
    });
  }

  // 存储键名
  var STORAGE_KEY = "gacha:history";

  // 稀有度文案
  var RARITY_LABELS = {
    common: "COMMON",
    rare: "RARE",
    epic: "EPIC",
    legend: "LEGENDARY"
  };

  // -------- DOM 引用 --------
  var titleEl = $("title");
  var subtitleEl = $("subtitle");
  var boxEl = $("box");
  var boxStageEl = document.querySelector(".box-stage");
  var drawBtn = $("drawBtn");
  var drawBtnText = $("drawBtnText");
  var resetBtn = $("resetBtn");
  var resetBtnText = $("resetBtnText");
  var resultEl = $("result");
  var resultBadge = $("resultBadge");
  var resultEmoji = $("resultEmoji");
  var resultText = $("resultText");
  var resultDesc = $("resultDesc");
  var historySection = $("historySection");
  var historyList = $("historyList");

  // -------- 配置读取与渲染 --------
  function getConfig() {
    var cfg = window.GACHA_CONFIG || {};
    return {
      title: cfg.title || "命运盲盒",
      subtitle: cfg.subtitle || "点一下，让命运替你选。",
      primaryColor: cfg.primaryColor,
      accentColor: cfg.accentColor,
      buttonText: cfg.buttonText || "抽一个",
      resetText: cfg.resetText || "清空记录",
      maxHistory: typeof cfg.maxHistory === "number" ? cfg.maxHistory : 10,
      items: Array.isArray(cfg.items) ? cfg.items : []
    };
  }

  function parseItemsTxt(text) {
    var lines = text.split(/\r?\n/);
    var items = [];
    for (var i = 0; i < lines.length; i++) {
      var line = lines[i].trim();
      if (!line) continue;
      var parts = line.split(/\|\s*/);
      var item = {
        id: "txt-" + (items.length + 1),
        text: parts[0].trim(),
        description: (parts[1] || "").trim() || undefined,
        emoji: (parts[2] || "").trim() || undefined,
        weight: parseInt(parts[3]) || 1
      };
      items.push(item);
    }
    return items;
  }

  function applyConfig() {
    var cfg = getConfig();

    titleEl.textContent = cfg.title;
    subtitleEl.textContent = cfg.subtitle;
    drawBtnText.textContent = cfg.buttonText;
    resetBtnText.textContent = cfg.resetText;
    document.title = cfg.title + " · 盲盒";

    var root = document.documentElement.style;
    if (cfg.primaryColor) root.setProperty("--primary", cfg.primaryColor);
    if (cfg.accentColor) root.setProperty("--accent", cfg.accentColor);

    fetch("./items.txt")
      .then(function (res) {
        if (!res.ok) throw new Error("Not found");
        return res.text();
      })
      .then(function (text) {
        var parsed = parseItemsTxt(text);
        if (parsed.length > 0) {
          window.GACHA_CONFIG = window.GACHA_CONFIG || {};
          window.GACHA_CONFIG.items = parsed;
          console.log("[gacha] Loaded " + parsed.length + " items from items.txt");
        }
        checkItems();
      })
      .catch(function () {
        console.log("[gacha] items.txt not found, using config.js");
        checkItems();
      });
  }

  function checkItems() {
    var cfg = getConfig();
    if (cfg.items.length === 0) {
      drawBtn.disabled = true;
      drawBtnText.textContent = "暂无盲盒内容";
      console.warn("[gacha] config.items 为空，请在 config.js 或 items.txt 中配置盲盒条目。");
    }
  }

  // -------- 加权随机抽取 --------
  function pickItem() {
    var items = getConfig().items;
    var totalWeight = 0;
    for (var i = 0; i < items.length; i++) {
      totalWeight += items[i].weight && items[i].weight > 0 ? items[i].weight : 1;
    }
    var rand = Math.random() * totalWeight;
    for (var j = 0; j < items.length; j++) {
      var w = items[j].weight && items[j].weight > 0 ? items[j].weight : 1;
      rand -= w;
      if (rand <= 0) return items[j];
    }
    return items[items.length - 1];
  }

  // -------- 结果展示 --------
  function showResult(item) {
    var rarity = item.rarity && RARITY_LABELS[item.rarity] ? item.rarity : "common";
    resultEl.dataset.rarity = rarity;
    resultBadge.textContent = RARITY_LABELS[rarity];
    resultEmoji.textContent = item.emoji || "✦";
    resultText.textContent = item.text || "—";
    if (item.description) {
      resultDesc.textContent = item.description;
      resultDesc.hidden = false;
    } else {
      resultDesc.textContent = "";
      resultDesc.hidden = true;
    }
    resultEl.hidden = false;
    boxStageEl.dataset.hasResult = "true";
    // 强制重排以触发 transition
    // eslint-disable-next-line no-unused-expressions
    resultEl.offsetHeight;
    resultEl.classList.add("show");
  }

  function hideResult() {
    resultEl.classList.remove("show");
    boxStageEl.removeAttribute("data-has-result");
    // 等淡出动画结束后再隐藏，便于重新触发
    wait(350).then(function () {
      if (!resultEl.classList.contains("show")) {
        resultEl.hidden = true;
      }
    });
  }

  // -------- 抽取主流程 --------
  var isDrawing = false;

  function draw() {
    if (isDrawing) return;
    var cfg = getConfig();
    if (cfg.items.length === 0) return;
    isDrawing = true;
    drawBtn.disabled = true;

    // 1. 重置结果
    hideResult();
    boxEl.dataset.state = "shake";

    // 2. 抖动 + 神秘停顿
    wait(1300)
      .then(function () {
        // 3. 抽中目标条目（与开盖"几乎同时"，让用户感到盒子"知道答案"）
        var item = pickItem();
        // 4. 开盖
        boxEl.dataset.state = "open";
        return wait(550).then(function () {
          showResult(item);
          saveHistory(item);
          renderHistory();
        });
      })
      .then(function () {
        return wait(400);
      })
      .then(function () {
        isDrawing = false;
        drawBtn.disabled = false;
      });
  }

  // -------- 历史记录 --------
  function loadHistory() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      var arr = JSON.parse(raw);
      return Array.isArray(arr) ? arr : [];
    } catch (e) {
      return [];
    }
  }

  function saveHistory(item) {
    var cfg = getConfig();
    var list = loadHistory();
    list.unshift({
      id: item.id,
      text: item.text,
      description: item.description || "",
      emoji: item.emoji || "✦",
      rarity: item.rarity || "common",
      timestamp: Date.now()
    });
    if (list.length > cfg.maxHistory) {
      list = list.slice(0, cfg.maxHistory);
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
      // localStorage 不可用时静默忽略
    }
  }

  function clearHistory() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      // ignore
    }
    renderHistory();
  }

  function formatTime(ts) {
    var d = new Date(ts);
    if (isNaN(d.getTime())) return "";
    return (
      pad(d.getMonth() + 1) +
      "-" +
      pad(d.getDate()) +
      " " +
      pad(d.getHours()) +
      ":" +
      pad(d.getMinutes())
    );
  }

  function renderHistory() {
    var list = loadHistory();
    if (list.length === 0) {
      historySection.hidden = true;
      return;
    }
    historySection.hidden = false;
    historyList.innerHTML = "";

    for (var i = 0; i < list.length; i++) {
      var item = list[i];
      var li = document.createElement("li");
      li.className = "history-item";
      li.style.animationDelay = i * 0.04 + "s";

      var emoji = document.createElement("span");
      emoji.className = "history-emoji";
      emoji.textContent = item.emoji || "✦";

      var text = document.createElement("span");
      text.className = "history-text";
      text.textContent = item.text || "—";

      var time = document.createElement("span");
      time.className = "history-time";
      time.textContent = formatTime(item.timestamp);

      li.appendChild(emoji);
      li.appendChild(text);
      li.appendChild(time);
      historyList.appendChild(li);
    }
  }

  // -------- 事件绑定 --------
  function bindEvents() {
    drawBtn.addEventListener("click", draw);

    resetBtn.addEventListener("click", function () {
      if (loadHistory().length === 0) {
        showToast("暂无抽取记录", 1500);
        return;
      }
      showInlineConfirm("确定清空所有记录？", function () {
        clearHistory();
        showToast("已清空记录", 1500);
      });
    });

    // 键盘快捷键：空格 / 回车触发抽取
    document.addEventListener("keydown", function (e) {
      if (e.code !== "Space" && e.code !== "Enter") return;
      var tag = (e.target && e.target.tagName) || "";
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      e.preventDefault();
      draw();
    });
  }

  // -------- 初始化 --------
  function init() {
    applyConfig();
    renderHistory();
    bindEvents();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
