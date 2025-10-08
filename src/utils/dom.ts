/**
 * 如果浏览器支持 View Transition API，则使用平滑过渡效果执行更新回调
 * 否则直接执行回调。支持从点击位置开始的径向过渡动画。
 *
 * @param updateCb - 需要执行的更新回调函数
 * @param clickEvent - 可选的点击事件，用于计算过渡动画的起始位置
 *
 * @example
 * ```typescript
 * // 简单使用
 * transitionViewIfSupported(() => {
 *   // 更新 DOM 或状态
 *   setCurrentPage('new-page');
 * });
 *
 * // 带点击事件的径向过渡
 * const handleClick = (event: MouseEvent) => {
 *   transitionViewIfSupported(() => {
 *     navigate('/new-route');
 *   }, event);
 * };
 * ```
 *
 * @since 1.0.0
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Document/startViewTransition | View Transition API}
 */
export const transitionViewIfSupported = (updateCb: () => void, clickEvent?: MouseEvent | React.MouseEvent) => {
  // 检查用户是否偏好减少动画
  if (window.matchMedia(`(prefers-reduced-motion: reduce)`).matches) {
    updateCb();
    return;
  }

  // 如果浏览器支持 View Transition API，使用它来创建平滑过渡
  if (document.startViewTransition) {
    // 如果有点击事件，计算点击位置作为动画圆心
    if (clickEvent) {
      const x = clickEvent.clientX;
      const y = clickEvent.clientY;

      // 计算从点击位置到屏幕四个角的最大距离
      const endRadius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));

      // 设置 CSS 自定义属性用于动画
      document.documentElement.style.setProperty("--x", `${x}px`);
      document.documentElement.style.setProperty("--y", `${y}px`);
      document.documentElement.style.setProperty("--r", `${endRadius}px`);
    }

    document.startViewTransition(updateCb);
  } else {
    // 降级处理：直接执行回调
    updateCb();
  }
};
