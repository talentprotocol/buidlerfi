"use server";

import * as jose from "jose";
import { ERRORS } from "./errors";
import prisma from "./prisma";

const SPKI = `-----BEGIN PUBLIC KEY-----
MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE0yFanm3yTbCe4Z4KM9yi/IGZf+ugrj+rn82e/guPcFlyLiudyubOWqFFmL/bVdxDY5LFhJdvBwfDYKR8LwcmPg==
-----END PUBLIC KEY-----`;

const verificationKey = jose.importSPKI(SPKI, "ES256");

export interface ServerActionResponse<T> {
  data?: T;
  error?: (typeof ERRORS)[keyof typeof ERRORS];
  status?: number;
}

export type SortingParams<T> = Record<keyof T, "asc" | "desc">;

export interface ServerActionOptions {
  authorization?: string | null;
  pagination?: {
    offset: number;
  };
}

export interface ServerActionData {
  privyUserId: string;
}

//This wrapper is used to check authorization
export async function serverActionWrapper<TResponse>(
  fn: (data: ServerActionData) => Promise<ServerActionResponse<TResponse>>,
  options: ServerActionOptions,
  isAdminRoute?: boolean
) {
  if (!options?.authorization) return { error: ERRORS.UNAUTHORIZED } as ServerActionResponse<TResponse>;
  const verifKey = await verificationKey;
  const authToken = options.authorization.replace("Bearer ", "");
  const payload = authToken
    ? await jose.jwtVerify(authToken, verifKey, {
        issuer: "privy.io",
        audience: process.env.PRIVY_APP_ID
      })
    : undefined;
  if (!payload?.payload.sub) return { error: ERRORS.UNAUTHORIZED } as ServerActionResponse<TResponse>;
  if (isAdminRoute) {
    const user = await prisma.user.findUnique({ where: { privyUserId: payload.payload.sub } });
    if (!user?.isAdmin) return { error: ERRORS.UNAUTHORIZED } as ServerActionResponse<TResponse>;
  }
  const res = await fn({ privyUserId: payload.payload.sub })
    .catch(err => {
      console.error(err);
      return { error: ERRORS.SOMETHING_WENT_WRONG } as ServerActionResponse<TResponse>;
    })
    .then(res => {
      return res as ServerActionResponse<TResponse>;
    });

  return res;
}
