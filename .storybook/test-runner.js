const { getStoryContext } = require("@storybook/test-runner");

module.exports = {
  // テストのタイムアウト設定（デフォルト: 15000ms）
  testTimeout: 60000,

  // テスト実行前のセットアップ
  async preVisit(page, context) {
    // ビューポートサイズの設定
    await page.setViewportSize({ width: 1280, height: 720 });

    // 日本語ロケールの設定
    await page.addInitScript(() => {
      window.localStorage.setItem("i18nextLng", "ja");
    });
  },

  // 各ストーリーのレンダリング後
  async postVisit(page, context) {
    // アクセシビリティチェックなど
    const storyContext = await getStoryContext(page, context);

    // Play関数が存在する場合は自動的に実行される
    if (storyContext.parameters?.play) {
      // Play関数の実行を待つ
      await page.waitForLoadState("networkidle");
    }
  },
};
