import { Password } from "@convex-dev/auth/providers/Password";
import { convexAuth } from "@convex-dev/auth/server";
import { DataModel } from "./_generated/dataModel";

const CustomPassword = Password<DataModel>({
  profile(params) {
    return {
      email: (params.email as string).toLowerCase(),
      name: (params.name as string) || (params.email as string).split("@")[0],
      role: (params.role as "admin" | "manager" | "employee" | "accounts") || "employee",
      annualAllowance: Number(params.annualAllowance) || 20,
      isActive: true,
    };
  },
});

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [CustomPassword],
});
