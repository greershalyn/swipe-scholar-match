import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail, ShieldCheck, Loader2, CalendarIcon } from "lucide-react";
import { useStudentVerification } from "@/hooks/useStudentVerification";
import { GradientIcon } from "@/components/ui/gradient-icon";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export function LewteVerification() {
  const [schoolEmail, setSchoolEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState<Date>();
  const { verificationStatus, error, schoolName, debugCode, sendVerificationCode, verifyCode } = useStudentVerification();

  const handleSendCode = () => {
    if (schoolEmail && dateOfBirth) {
      sendVerificationCode(schoolEmail, format(dateOfBirth, "yyyy-MM-dd"));
    }
  };

  const handleVerify = () => {
    if (verificationCode) verifyCode(schoolEmail, verificationCode);
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-md">
      <Card>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <GradientIcon icon={ShieldCheck} className="h-12 w-12" />
          </div>
          <CardTitle className="text-xl">Verify Your Student Email</CardTitle>
          <CardDescription>
            Lewte is exclusively available to verified students aged 16 and older. Enter your school email and date of birth to get started.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {verificationStatus === "idle" || verificationStatus === "sending" || verificationStatus === "error" ? (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">School Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="you@university.edu"
                    value={schoolEmail}
                    onChange={(e) => setSchoolEmail(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Date of Birth</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dateOfBirth && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateOfBirth ? format(dateOfBirth, "PPP") : "Select your date of birth"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dateOfBirth}
                      onSelect={setDateOfBirth}
                      disabled={(date) =>
                        date > new Date() || date < new Date("1900-01-01")
                      }
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                      captionLayout="dropdown-buttons"
                      fromYear={1950}
                      toYear={new Date().getFullYear()}
                    />
                  </PopoverContent>
                </Popover>
                <p className="text-xs text-muted-foreground">You must be at least 16 years old</p>
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button onClick={handleSendCode} className="w-full" disabled={!schoolEmail || !dateOfBirth || verificationStatus === "sending"}>
                {verificationStatus === "sending" ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Sending...</>
                ) : (
                  "Send Verification Code"
                )}
              </Button>
            </>
          ) : verificationStatus === "sent" || verificationStatus === "verifying" ? (
            <>
              <p className="text-sm text-muted-foreground text-center">
                A verification code has been sent to <strong>{schoolEmail}</strong>
                {schoolName && <> ({schoolName})</>}.
              </p>
              {debugCode && (
                <div className="bg-muted p-3 rounded-md text-center">
                  <p className="text-xs text-muted-foreground">Debug: Your code is</p>
                  <p className="text-lg font-mono font-bold text-foreground">{debugCode}</p>
                </div>
              )}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Verification Code</label>
                <Input
                  type="text"
                  placeholder="123456"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  className="text-center text-lg tracking-widest"
                  maxLength={6}
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button onClick={handleVerify} className="w-full" disabled={verificationCode.length !== 6 || verificationStatus === "verifying"}>
                {verificationStatus === "verifying" ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Verifying...</>
                ) : (
                  "Verify"
                )}
              </Button>
            </>
          ) : verificationStatus === "verified" ? (
            <div className="text-center space-y-2">
              <ShieldCheck className="h-12 w-12 text-green-500 mx-auto" />
              <p className="font-medium text-foreground">Email Verified!</p>
              <p className="text-sm text-muted-foreground">Refreshing to show your Lewte access...</p>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
