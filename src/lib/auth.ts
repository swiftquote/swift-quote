import { NextAuthOptions } from "next-auth"

export const authOptions: NextAuthOptions = {
  providers: [],
  session: {
    strategy: "jwt"
  },
}

