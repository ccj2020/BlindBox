/**
 * 盲盒抽取平台 · 配置文件
 * ============================================================
 *  使用说明：直接修改下面这个对象即可更换盲盒内容。
 *  - title       页面主标题
 *  - subtitle    副标题
 *  - primaryColor / accentColor 主题色（CSS 颜色值）
 *  - buttonText  抽取按钮文字
 *  - resetText   清空记录按钮文字
 *  - maxHistory  历史记录最大条数
 *  - items       盲盒条目数组
 *      - id          唯一 id
 *      - text        抽取后展示的文字
 *      - description 可选：附加说明
 *      - emoji       可选：结果前的 emoji
 *      - rarity      可选：common / rare / epic / legend
 *      - weight      可选：抽取权重，数字越大越容易抽中（默认 1）
 * ============================================================
 */
window.GACHA_CONFIG = {
  title: "命运盲盒",
  subtitle: "点一下，让命运替你选。",
  primaryColor: "#7C5CFF",
  accentColor: "#FFB347",
  buttonText: "抽一个",
  resetText: "清空记录",
  maxHistory: 10,
  items: [
    {
      id: "f01",
      text: "今天会收到一个久违的好消息。",
      description: "留意下午 3 点前后的消息。",
      emoji: "✉️",
      rarity: "rare",
      weight: 8
    },
    {
      id: "f02",
      text: "别犹豫，选 A。",
      description: "直觉往往是对的。",
      emoji: "🅰️",
      rarity: "common",
      weight: 20
    },
    {
      id: "f03",
      text: "深夜适合做一个大胆的决定。",
      description: "但记得开灯。",
      emoji: "🌙",
      rarity: "epic",
      weight: 5
    },
    {
      id: "f04",
      text: "奇迹不会自己走过来，去迎它。",
      emoji: "✨",
      rarity: "legend",
      weight: 2
    },
    {
      id: "f05",
      text: "今天适合：发呆。",
      description: "高效地发呆，也是一种能力。",
      emoji: "☁️",
      rarity: "common",
      weight: 18
    },
    {
      id: "f06",
      text: "有人正在想你。",
      emoji: "💭",
      rarity: "rare",
      weight: 8
    },
    {
      id: "f07",
      text: "出门左转，会遇见一点小幸运。",
      emoji: "🍀",
      rarity: "epic",
      weight: 4
    },
    {
      id: "f08",
      text: "把这道题留给明天的自己。",
      description: "睡一觉，答案会浮现。",
      emoji: "📦",
      rarity: "common",
      weight: 16
    },
    {
      id: "f09",
      text: "你最近会被人温柔以待。",
      emoji: "🌸",
      rarity: "rare",
      weight: 7
    },
    {
      id: "f10",
      text: "去买那张彩票。",
      description: "不中也没关系，过程也值得。",
      emoji: "🎟️",
      rarity: "epic",
      weight: 3
    },
    {
      id: "f11",
      text: '把"算了"换成"再试试"。',
      emoji: "🔁",
      rarity: "common",
      weight: 14
    },
    {
      id: "f12",
      text: "今晚的月亮很特别，记得抬头。",
      description: "如果下雨，那就听雨。",
      emoji: "🌕",
      rarity: "legend",
      weight: 1
    }
  ]
};
