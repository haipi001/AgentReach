# AgentReach Design System

## 1. 视觉主题

Editorial Ghost Computing

关键词：

- Technology White
- Porcelain
- Fog
- Mint Signal
- Spatial UI
- Calm
- Quiet Intelligence
- High trust
- Minimal but not empty

## 2. 色彩 Tokens

```css
:root {
  --ar-bg: #F5F7F6;
  --ar-bg-soft: #EEF2F0;
  --ar-surface: rgba(255,255,255,0.72);
  --ar-surface-solid: #FFFFFF;
  --ar-ink: #17201C;
  --ar-ink-muted: #66716C;
  --ar-border: rgba(52,83,71,0.12);

  --ar-mint: #7FE3C2;
  --ar-mint-strong: #2EB98D;
  --ar-mint-soft: #DFF8EF;

  --ar-amber: #E8B86C;
  --ar-danger: #E67569;

  --ar-shadow: 0 24px 80px rgba(34,57,48,0.10);
}
```

## 3. 字体

- UI：Geist / Mona Sans / system sans
- 技术信息：Geist Mono / SF Mono
- 大标题哲学性语句：Instrument Serif / Cormorant Garamond

## 4. 圆角

- small: 10
- medium: 16
- large: 22
- floating: 28

## 5. Motion

- micro: 160–200ms
- UI: 240–320ms
- spatial: 650–900ms
- camera: 900–1400ms

推荐 easing：

`cubic-bezier(.22,1,.36,1)`

## 6. Surface

只使用三类：

### Glass
观察、轻信息。

### Dark
执行、系统、Engineering。

### Porcelain
审批、证据、关键决策。

## 7. Orb

Orb 必须是 Shader 驱动，而不是静态 PNG。

状态通过：

- 内部 noise；
- Fresnel rim；
- bloom；
- pulse；
- particle；
- ring；
- satellite；
- color shift；

表达。

## 8. 可读性

- 正文最低 12px；
- 主要交互 14px+；
- 投影/比赛演示中关键文本 16px+；
- WebGL 不承担关键正文；
- 关键 UI 使用 DOM overlay。

## 9. Accessibility

必须支持：

- reduced motion；
- keyboard；
- list alternative；
- screen reader；
- focus visible；
- high contrast。
