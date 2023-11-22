import { MAX_QUESTION_SIZE } from "./constants";

export const ERRORS = {
  UNAUTHORIZED: "Unauthorized",
  INVALID_INVITE_CODE: "Invalid invite code",
  CODE_ALREADY_USED: "Invite code has already been used",
  SOMETHING_WENT_WRONG: "Something went wrong",
  USER_NOT_FOUND: "User not found",
  QUESTION_NOT_FOUND: "Question not found",
  MUST_HOLD_KEY: "You must hold a key to ask a question to this user",
  INVALID_REQUEST: "Invalid request",
  WALLET_MISSING: "Wallet missing",
  USER_ALREADY_EXISTS: "User already exists",
  PRIVY_WALLET_NOT_FOUND: "Privy wallet not found",
  NO_SOCIAL_PROFILE_FOUND: "No social profile found",
  CANNOT_CHOSE_USERNAME: "Cannot chose username if you have an onchain social profile",
  USERNAME_INVALID_FORMAT:
    "Username should contain between 3 and 20 alphanumeric characters or underscores, and start with a letter",
  CHALLENGE_EXPIRED: "Challenge expired",
  INVALID_SIGNATURE: "Invalid signature",
  QUESTION_TOO_LONG: `Question too long. Maximum ${MAX_QUESTION_SIZE} characters`
} as const;
