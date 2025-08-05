import { act, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

/**
 * act warningを防ぐためのユーザーイベントセットアップ
 */
export const setupUser = () => userEvent.setup();

/**
 * 非同期処理を含むアクションを安全に実行
 */
export const waitAndAct = async (callback: () => void | Promise<void>) => {
  await act(async () => {
    await callback();
  });
};

/**
 * フォームの送信を安全に実行
 */
export const submitForm = (formElement: HTMLElement) => {
  act(() => {
    formElement.dispatchEvent(
      new Event("submit", { bubbles: true, cancelable: true }),
    );
  });
};

/**
 * ボタンクリックを安全に実行
 */
export const clickButton = async (buttonText: string | RegExp) => {
  const user = setupUser();
  const button = screen.getByRole("button", { name: buttonText });
  await user.click(button);
};

/**
 * 入力フィールドに値を入力
 */
export const typeInField = async (
  labelText: string | RegExp,
  value: string,
) => {
  const user = setupUser();
  const input = screen.getByLabelText(labelText);
  await user.clear(input);
  await user.type(input, value);
};

/**
 * セレクトボックスの値を選択
 */
export const selectOption = async (
  labelText: string | RegExp,
  value: string,
) => {
  const user = setupUser();
  const select = screen.getByLabelText(labelText);
  await user.selectOptions(select, value);
};

/**
 * チェックボックスをトグル
 */
export const toggleCheckbox = async (labelText: string | RegExp) => {
  const user = setupUser();
  const checkbox = screen.getByLabelText(labelText);
  await user.click(checkbox);
};
