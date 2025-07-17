"use server";

import { Effect } from "effect";
import {
  type CreateUserInput,
  type UpdateUserInput,
  type Auth0User,
} from "@/lib/effects";
import { UserService } from "@/lib/effects/services/server";
import { runServerActionSafe } from "./runtime";

// ユーザー作成のServer Action
export const createUser = async (input: CreateUserInput) => {
  const effect = Effect.gen(function* () {
    const userService = yield* UserService;
    const user = yield* userService.create(input);
    return user;
  });

  return runServerActionSafe(effect);
};

// ユーザー取得のServer Action
export const getUser = async (id: string) => {
  const effect = Effect.gen(function* () {
    const userService = yield* UserService;
    const user = yield* userService.findById(id);
    return user;
  });

  return runServerActionSafe(effect);
};

// Auth0 IDでユーザー取得のServer Action
export const getUserByAuth0Id = async (auth0Id: string) => {
  const effect = Effect.gen(function* () {
    const userService = yield* UserService;
    const user = yield* userService.findByAuth0Id(auth0Id);
    return user;
  });

  return runServerActionSafe(effect);
};

// メールアドレスでユーザー取得のServer Action
export const getUserByEmail = async (email: string) => {
  const effect = Effect.gen(function* () {
    const userService = yield* UserService;
    const user = yield* userService.findByEmail(email);
    return user;
  });

  return runServerActionSafe(effect);
};

// ユーザー更新のServer Action
export const updateUser = async (input: UpdateUserInput) => {
  const effect = Effect.gen(function* () {
    const userService = yield* UserService;
    const user = yield* userService.update(input);
    return user;
  });

  return runServerActionSafe(effect);
};

// Auth0ユーザー情報から作成/更新のServer Action
export const createOrUpdateUserFromAuth0 = async (auth0User: Auth0User) => {
  const effect = Effect.gen(function* () {
    const userService = yield* UserService;
    const user = yield* userService.createOrUpdateFromAuth0(auth0User);
    return user;
  });

  return runServerActionSafe(effect);
};
