import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ClipboardList, CheckCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";

interface Survey {
  id: string;
  title: string;
  description: string | null;
  points: number;
}

interface SurveyQuestion {
  id: string;
  survey_id: string;
  question_text: string;
  question_type: string;
  options: any;
  is_required: boolean;
  display_order: number;
}

export function LewteSurveys() {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSurvey, setActiveSurvey] = useState<string | null>(null);
  const [questions, setQuestions] = useState<SurveyQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchSurveys();
  }, []);

  async function fetchSurveys() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const { data: allSurveys } = await supabase.from("surveys").select("*").eq("is_active", true);
    const surveyList = (allSurveys as Survey[]) || [];

    // Get user's verified school email domain
    const { data: verification } = await supabase
      .from("student_email_verifications")
      .select("school_email")
      .eq("user_id", user.id)
      .eq("verified", true)
      .maybeSingle();

    const userDomain = verification?.school_email?.split("@")[1] || null;

    // Get school targets for select_schools surveys
    const selectSchoolSurveyIds = surveyList.filter((s: any) => s.target_audience === "select_schools").map((s) => s.id);
    let allowedSelectIds = new Set<string>();

    if (selectSchoolSurveyIds.length > 0 && userDomain) {
      const { data: targets } = await supabase
        .from("survey_school_targets")
        .select("survey_id")
        .in("survey_id", selectSchoolSurveyIds)
        .eq("domain", userDomain);
      allowedSelectIds = new Set((targets || []).map((t: any) => t.survey_id));
    }

    // Filter: show "all" surveys + select_schools surveys where user's domain matches
    // Super admins (no verification) see all surveys
    const filtered = surveyList.filter((s: any) => {
      if (s.target_audience === "all" || !s.target_audience) return true;
      if (s.target_audience === "select_schools") return allowedSelectIds.has(s.id);
      return true;
    });

    setSurveys(filtered);

    // Check completed
    const { data: responses } = await supabase
      .from("survey_responses")
      .select("survey_id")
      .eq("user_id", user.id);
    if (responses) {
      setCompleted(new Set(responses.map((r: any) => r.survey_id)));
    }
    setLoading(false);
  }

  async function openSurvey(surveyId: string) {
    setActiveSurvey(surveyId);
    const { data } = await supabase
      .from("survey_questions")
      .select("*")
      .eq("survey_id", surveyId)
      .order("display_order");
    setQuestions((data as SurveyQuestion[]) || []);
    setAnswers({});
  }

  async function submitSurvey() {
    if (!activeSurvey) return;
    setSubmitting(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const responses = questions.map((q) => ({
      user_id: user.id,
      survey_id: activeSurvey,
      question_id: q.id,
      answer: { value: answers[q.id] || "" },
    }));

    const { error } = await supabase.from("survey_responses").insert(responses);
    if (error) {
      toast({ title: "Error submitting survey", description: error.message, variant: "destructive" });
    } else {
      // Award points
      const survey = surveys.find((s) => s.id === activeSurvey);
      const surveyPoints = survey?.points || 0;
      if (surveyPoints > 0) {
        await awardPoints(user.id, surveyPoints, activeSurvey, survey?.title || "Survey");
      }
      toast({ title: "Survey submitted!", description: surveyPoints > 0 ? `You earned ${surveyPoints} points!` : "Thank you for your response." });
      setCompleted((prev) => new Set([...prev, activeSurvey!]));
      setActiveSurvey(null);
    }
    setSubmitting(false);
  }

  async function awardPoints(userId: string, amount: number, surveyId: string, surveyTitle: string) {
    // Get or create user_points record
    const { data: existing } = await supabase
      .from("user_points")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    let currentTotal = existing?.total_points || 0;
    let currentRewards = existing?.reward_points || 0;

    currentTotal += amount;
    // Convert every 100 points to 1 reward
    const newRewards = Math.floor(currentTotal / 100);
    currentTotal = currentTotal % 100;
    currentRewards += newRewards;

    if (existing) {
      await supabase
        .from("user_points")
        .update({ total_points: currentTotal, reward_points: currentRewards, updated_at: new Date().toISOString() })
        .eq("user_id", userId);
    } else {
      await supabase
        .from("user_points")
        .insert({ user_id: userId, total_points: currentTotal, reward_points: currentRewards });
    }

    // Log the transaction
    await supabase.from("point_transactions").insert({
      user_id: userId,
      amount,
      transaction_type: "earned",
      source_id: surveyId,
      description: `Completed survey: ${surveyTitle}`,
    });
  }

  if (loading) {
    return <div className="space-y-4">{[1, 2].map((i) => <Skeleton key={i} className="h-32 rounded-lg" />)}</div>;
  }

  if (activeSurvey) {
    const survey = surveys.find((s) => s.id === activeSurvey);
    return (
      <Card>
        <CardHeader>
          <CardTitle>{survey?.title}</CardTitle>
          {survey?.description && <CardDescription>{survey.description}</CardDescription>}
        </CardHeader>
        <CardContent className="space-y-6">
          {questions.map((q, idx) => (
            <div key={q.id} className="space-y-2">
              <Label className="text-sm font-medium">
                {idx + 1}. {q.question_text}
                {q.is_required && <span className="text-destructive ml-1">*</span>}
              </Label>
              {q.question_type === "text" && (
                <Textarea
                  value={answers[q.id] || ""}
                  onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                  placeholder="Your answer..."
                />
              )}
              {q.question_type === "multiple_choice" && q.options?.choices && (
                <RadioGroup value={answers[q.id] || ""} onValueChange={(v) => setAnswers({ ...answers, [q.id]: v })}>
                  {(q.options.choices as string[]).map((choice) => (
                    <div key={choice} className="flex items-center space-x-2">
                      <RadioGroupItem value={choice} id={`${q.id}-${choice}`} />
                      <Label htmlFor={`${q.id}-${choice}`}>{choice}</Label>
                    </div>
                  ))}
                </RadioGroup>
              )}
              {q.question_type === "rating" && (
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Button
                      key={n}
                      variant={answers[q.id] === n ? "default" : "outline"}
                      size="sm"
                      onClick={() => setAnswers({ ...answers, [q.id]: n })}
                    >
                      {n}
                    </Button>
                  ))}
                </div>
              )}
              {q.question_type === "boolean" && (
                <RadioGroup value={answers[q.id] || ""} onValueChange={(v) => setAnswers({ ...answers, [q.id]: v })}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id={`${q.id}-yes`} />
                    <Label htmlFor={`${q.id}-yes`}>Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id={`${q.id}-no`} />
                    <Label htmlFor={`${q.id}-no`}>No</Label>
                  </div>
                </RadioGroup>
              )}
            </div>
          ))}
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setActiveSurvey(null)}>Cancel</Button>
            <Button onClick={submitSurvey} disabled={submitting}>
              {submitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Submitting...</> : "Submit Survey"}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (surveys.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <ClipboardList className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No surveys available yet. Check back soon!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {surveys.map((survey) => (
        <Card key={survey.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">{survey.title}</CardTitle>
                {survey.description && <CardDescription>{survey.description}</CardDescription>}
                {survey.points > 0 && (
                  <span className="text-xs text-muted-foreground">🎯 Earn {survey.points} points</span>
                )}
              </div>
              {completed.has(survey.id) ? (
                <div className="flex items-center text-green-600 text-sm">
                  <CheckCircle className="h-4 w-4 mr-1" /> Completed
                </div>
              ) : (
                <Button size="sm" onClick={() => openSurvey(survey.id)}>Take Survey</Button>
              )}
            </div>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}
