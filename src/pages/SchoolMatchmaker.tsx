import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AccountDropdown } from "@/components/AccountDropdown";
import { useIsMobile } from "@/hooks/use-mobile";
import { Loader2, GraduationCap, MapPin, DollarSign } from "lucide-react";

interface SchoolMatch {
  name: string;
  location: string;
  program: string;
  estimatedCost: string;
  description: string;
  ranking: string;
  admissionRate: string;
}

const US_STATES = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware",
  "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky",
  "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota", "Mississippi",
  "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey", "New Mexico",
  "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania",
  "Rhode Island", "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah", "Vermont",
  "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming"
];

export default function SchoolMatchmaker() {
  const [formData, setFormData] = useState({
    program: "",
    interests: "",
    budget: "",
    states: [] as string[],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<SchoolMatch[]>([]);
  const isMobile = useIsMobile();
  const { toast } = useToast();

  const handleStateToggle = (state: string) => {
    setFormData(prev => ({
      ...prev,
      states: prev.states.includes(state)
        ? prev.states.filter(s => s !== state)
        : [...prev.states, state]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setResults([]);

    try {
      const { data, error } = await supabase.functions.invoke('school-matcher', {
        body: formData
      });

      if (error) {
        throw new Error(error.message || 'Failed to find school matches');
      }
      setResults(data.schools);
      
      toast({
        title: "Success!",
        description: `Found ${data.schools.length} school matches`,
      });
    } catch (error) {
      console.error('Error finding schools:', error);
      toast({
        title: "Error",
        description: "Failed to find school matches. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-background">
      <div className={`container px-4 ${isMobile ? 'py-4' : 'py-8'}`}>
        <div className={`flex justify-between items-center ${isMobile ? 'mb-4' : 'mb-8'}`}>
          <Link to="/">
            <img 
              src="/lovable-uploads/24f07198-1e4c-4eea-8e07-259aa77d1711.png"
              alt="SwipeScholar Logo"
              className={`${isMobile ? 'h-24' : 'h-40'} w-auto invert`}
            />
          </Link>
          <AccountDropdown />
        </div>
        
        <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className={`${isMobile ? 'text-2xl' : 'text-4xl'} font-bold text-primary mb-4`}>School Matchmaker</h1>
          <p className={`${isMobile ? 'text-lg' : 'text-xl'} text-muted-foreground max-w-2xl mx-auto`}>
            Find the perfect schools and programs that match your interests, budget, and location preferences
          </p>
        </div>

        <div className={`max-w-4xl mx-auto ${isMobile ? 'pb-4' : 'pb-8'}`}>
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Tell us about your preferences
              </CardTitle>
              <CardDescription>
                The more specific you are, the better matches we can find for you
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="program">Desired Program/Major</Label>
                    <Input
                      id="program"
                      placeholder="e.g., Computer Science, Business, Engineering"
                      value={formData.program}
                      onChange={(e) => setFormData(prev => ({ ...prev, program: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="budget">Budget Range (Annual)</Label>
                    <Select value={formData.budget} onValueChange={(value) => setFormData(prev => ({ ...prev, budget: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select budget range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="under-20k">Under $20,000</SelectItem>
                        <SelectItem value="20k-40k">$20,000 - $40,000</SelectItem>
                        <SelectItem value="40k-60k">$40,000 - $60,000</SelectItem>
                        <SelectItem value="60k-80k">$60,000 - $80,000</SelectItem>
                        <SelectItem value="over-80k">Over $80,000</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="interests">Additional Interests & Requirements</Label>
                  <Textarea
                    id="interests"
                    placeholder="e.g., Strong research opportunities, diverse campus, good athletics program, urban setting..."
                    value={formData.interests}
                    onChange={(e) => setFormData(prev => ({ ...prev, interests: e.target.value }))}
                    rows={3}
                  />
                </div>

                <div className="space-y-3">
                  <Label>Preferred States (select multiple)</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-h-40 overflow-y-auto border rounded-md p-3">
                    {US_STATES.map((state) => (
                      <div key={state} className="flex items-center space-x-2">
                        <Checkbox
                          id={state}
                          checked={formData.states.includes(state)}
                          onCheckedChange={() => handleStateToggle(state)}
                        />
                        <Label htmlFor={state} className="text-sm">{state}</Label>
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Selected: {formData.states.length} states
                  </p>
                </div>

                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Finding your perfect matches...
                    </>
                  ) : (
                    "Find My School Matches"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {results.length > 0 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-foreground">Your School Matches</h2>
              {results.map((school, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl">{school.name}</CardTitle>
                        <CardDescription className="flex items-center gap-1 mt-1">
                          <MapPin className="h-4 w-4" />
                          {school.location}
                        </CardDescription>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-lg font-semibold text-primary">
                          {school.estimatedCost}
                        </div>
                        <p className="text-sm text-muted-foreground">per year</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-semibold text-foreground">Program: {school.program}</h4>
                      </div>
                      <p className="text-muted-foreground">{school.description}</p>
                      <div className="grid grid-cols-2 gap-4 pt-2">
                        <div>
                          <p className="text-sm font-medium">Ranking</p>
                          <p className="text-sm text-muted-foreground">{school.ranking}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Admission Rate</p>
                          <p className="text-sm text-muted-foreground">{school.admissionRate}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
        </div>
      </div>
    </div>
  );
}