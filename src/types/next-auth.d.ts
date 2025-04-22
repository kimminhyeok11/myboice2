import NextAuth, { DefaultSession } from "next-auth";

// NextAuth 타입 확장을 위해 모듈 선언 병합(Module Augmentation)
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      /** 사용자 고유 ID */
      id: string;
    } & DefaultSession["user"];
  }
}
