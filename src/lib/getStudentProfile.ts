// lib/getStudentProfile.ts
import Admission from "@/models/admissionModel";
import { User } from "@/models/user";

export async function getStudentProfile(email: string) {
  const admission = await Admission.findOne({ email }).lean();
  if (admission) {
    return {
      name: admission.name,
      email: admission.email,
      profileImageUrl: admission.profileImageUrl,
      createdAt: admission.createdAt,
    };
  }

  const profile = await User.findOne({ email }).lean();
  if (profile) {
    return {
      name: profile.name,
      email: profile.email,
      profileImageUrl: "",
      createdAt: profile.createdAt,
      subscription: profile.subscription,
    };
  }

  return null;
}
