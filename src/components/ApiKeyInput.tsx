
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { KeyRound, Save } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface ApiKeyInputProps {
  onApiKeyChange: (apiKey: string) => void;
}

const LOCAL_STORAGE_KEY = "bioquery_gemini_api_key";

const ApiKeyInput = ({ onApiKeyChange }: ApiKeyInputProps) => {
  const [apiKey, setApiKey] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Load API key from localStorage if available
    const savedApiKey = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedApiKey) {
      setApiKey(savedApiKey);
      onApiKeyChange(savedApiKey);
    }
  }, [onApiKeyChange]);

  const handleSaveApiKey = () => {
    if (apiKey.trim()) {
      localStorage.setItem(LOCAL_STORAGE_KEY, apiKey);
      onApiKeyChange(apiKey);
      setIsVisible(false);
      toast({
        title: "API Key Saved",
        description: "Your Gemini API key has been saved successfully.",
      });
    } else {
      toast({
        title: "Error",
        description: "Please enter a valid API key.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="w-full mb-6">
      {!isVisible ? (
        <Button
          variant="outline"
          onClick={() => setIsVisible(true)}
          className="flex items-center gap-2 text-sm"
        >
          <KeyRound className="w-4 h-4" />
          {apiKey ? "Update API Key" : "Set Gemini API Key"}
        </Button>
      ) : (
        <div className="flex flex-col gap-3 p-4 border rounded-lg bg-white shadow-subtle">
          <h3 className="text-sm font-medium">Gemini API Key</h3>
          <p className="text-xs text-muted-foreground mb-2">
            Enter your Gemini API key to enable enhanced search results. Your key is saved locally and never sent to our servers.
          </p>
          <div className="flex gap-2">
            <Input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your Gemini API key"
              className="flex-1"
            />
            <Button onClick={handleSaveApiKey} className="shrink-0">
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApiKeyInput;
