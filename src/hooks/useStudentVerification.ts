import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useStudentVerification() {
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState<"idle" | "sending" | "sent" | "verifying" | "verified" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [schoolName, setSchoolName] = useState<string | null>(null);
  const [debugCode, setDebugCode] = useState<string | null>(null);

  useEffect(() => {
    checkVerification();
  }, []);

  async function checkVerification() {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setIsLoading(false); return; }

      const { data } = await supabase
        .from("student_email_verifications")
        .select("verified")
        .eq("user_id", user.id)
        .eq("verified", true)
        .maybeSingle();

      setIsVerified(!!data);
    } catch {
      console.error("Error checking verification");
    } finally {
      setIsLoading(false);
    }
  }

  async function sendVerificationCode(schoolEmail: string) {
    setVerificationStatus("sending");
    setError(null);
    try {
      const { data, error: fnError } = await supabase.functions.invoke("send-verification-email", {
        body: { school_email: schoolEmail },
      });
      if (fnError) throw new Error(fnError.message);
      if (data?.error) throw new Error(data.error);
      
      setSchoolName(data.school_name);
      setDebugCode(data.debug_code); // Remove in production
      setVerificationStatus("sent");
    } catch (err: any) {
      setError(err.message);
      setVerificationStatus("error");
    }
  }

  async function verifyCode(schoolEmail: string, code: string) {
    setVerificationStatus("verifying");
    setError(null);
    try {
      const { data, error: fnError } = await supabase.functions.invoke("verify-student-email", {
        body: { school_email: schoolEmail, code },
      });
      if (fnError) throw new Error(fnError.message);
      if (data?.error) throw new Error(data.error);
      
      setIsVerified(true);
      setVerificationStatus("verified");
    } catch (err: any) {
      setError(err.message);
      setVerificationStatus("error");
    }
  }

  return {
    isVerified,
    isLoading,
    verificationStatus,
    error,
    schoolName,
    debugCode,
    sendVerificationCode,
    verifyCode,
    checkVerification,
  };
}
