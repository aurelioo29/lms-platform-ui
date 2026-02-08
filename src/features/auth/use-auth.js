"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  authKeys,
  fetchMe,
  loginRequest,
  logoutRequest,
  registerRequest,
  resendVerificationRequest,
  forgotPasswordRequest,
  resetPasswordRequest,
} from "./auth.queries";

export function useMe() {
  return useQuery({
    queryKey: authKeys.me,
    queryFn: fetchMe,
    retry: false,
  });
}

export function useLogin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: loginRequest,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: authKeys.me });
    },
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: registerRequest,
  });
}

export function useLogout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: logoutRequest,
    onSuccess: () => {
      qc.setQueryData(authKeys.me, null);
      qc.invalidateQueries({ queryKey: authKeys.me });
    },
  });
}

export function useResendVerification() {
  return useMutation({
    mutationFn: (email) => resendVerificationRequest(email),
  });
}

export function useForgotPassword() {
  return useMutation({ mutationFn: forgotPasswordRequest });
}

export function useResetPassword() {
  return useMutation({ mutationFn: resetPasswordRequest });
}
