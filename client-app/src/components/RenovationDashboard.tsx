import React, { useState, useRef } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import {
  ArrowLeft,
  Upload,
  Home,
  TrendingUp,
  DollarSign,
  Wrench,
  Lightbulb,
  CheckCircle,
  BarChart3,
  Camera,
  Sparkles,
  Calculator,
  Eye,
  Palette,
  Zap,
  Leaf,
  ArrowRight,
  RefreshCw,
  Download,
  AlertCircle,
  Loader2,
  ImageIcon,
  Settings,
  Star,
} from 'lucide-react';
import { useRouter } from './Router';
import renovationService, {
  type RenovationMetadata,
  type RenovationPreferences,
  type RenovationResult,
} from '../services/renovationService';

// ─────────────────────────────────────────────
// Step indicator component
// ─────────────────────────────────────────────
const STEPS = ['Upload Photo', 'Room Info', 'Preferences', 'Results'];

function StepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex items-center justify-center space-x-2 mb-8">
      {STEPS.map((label, index) => {
        const stepNum = index + 1;
        const isDone = stepNum < currentStep;
        const isActive = stepNum === currentStep;
        return (
          <React.Fragment key={index}>
            <div className="flex flex-col items-center">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${isDone
                    ? 'bg-[#00B894] text-white'
                    : isActive
                      ? 'bg-gradient-to-r from-[#0984E3] to-[#74B9FF] text-white shadow-lg scale-110'
                      : 'bg-gray-100 text-gray-400'
                  }`}
              >
                {isDone ? <CheckCircle className="w-4 h-4" /> : stepNum}
              </div>
              <span
                className={`text-xs mt-1 font-medium ${isActive ? 'text-[#0984E3]' : isDone ? 'text-[#00B894]' : 'text-gray-400'
                  }`}
              >
                {label}
              </span>
            </div>
            {index < STEPS.length - 1 && (
              <div
                className={`h-0.5 w-12 mb-4 transition-all ${stepNum < currentStep ? 'bg-[#00B894]' : 'bg-gray-200'
                  }`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────
// Step 1: Image Upload
// ─────────────────────────────────────────────
function Step1Upload({
  imageFile,
  imagePreview,
  onImageSelect,
  onNext,
}: {
  imageFile: File | null;
  imagePreview: string | null;
  onImageSelect: (file: File, preview: string) => void;
  onNext: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPG, JPEG)');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => onImageSelect(file, e.target?.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-r from-[#0984E3] to-[#74B9FF] rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Camera className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Upload Your Room Photo</h2>
        <p className="text-gray-500 mt-1">Our AI will analyze the room and generate renovation ideas</p>
      </div>

      {/* Drop zone */}
      <div
        className={`relative border-2 border-dashed rounded-2xl transition-all cursor-pointer ${dragging
            ? 'border-[#0984E3] bg-blue-50'
            : imagePreview
              ? 'border-[#00B894] bg-green-50'
              : 'border-gray-300 hover:border-[#0984E3] hover:bg-blue-50'
          }`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          const file = e.dataTransfer.files[0];
          if (file) processFile(file);
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) processFile(f); }}
        />

        {imagePreview ? (
          <div className="p-4">
            <img
              src={imagePreview}
              alt="Room preview"
              className="w-full max-h-72 object-contain rounded-xl"
            />
            <div className="flex items-center justify-center space-x-2 mt-3 text-[#00B894]">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm font-medium">Image ready • Click to change</span>
            </div>
          </div>
        ) : (
          <div className="py-16 text-center">
            <Upload className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-600">Drag & drop your room photo here</p>
            <p className="text-sm text-gray-400 mt-1">or click to browse • PNG, JPG up to 16MB</p>
          </div>
        )}
      </div>

      {/* Tips */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
        <p className="text-sm text-blue-700 font-semibold mb-1">💡 Tips for best results</p>
        <ul className="text-xs text-blue-600 space-y-0.5 list-disc list-inside">
          <li>Use well-lit, clear photos (natural light preferred)</li>
          <li>Capture the entire room if possible</li>
          <li>Avoid extreme angles or lens distortion</li>
        </ul>
      </div>

      <div className="flex justify-end">
        <Button
          onClick={onNext}
          disabled={!imagePreview}
          className="bg-gradient-to-r from-[#0984E3] to-[#74B9FF] text-white px-6"
        >
          Next: Room Information
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Step 2: Room Metadata Form
// ─────────────────────────────────────────────
function Step2RoomInfo({
  metadata,
  onChange,
  onBack,
  onNext,
}: {
  metadata: RenovationMetadata;
  onChange: (field: keyof RenovationMetadata, value: string) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const handleNext = () => {
    if (!metadata.room_length || !metadata.room_width || !metadata.property_age) {
      alert('Please fill in Room Dimensions (Length & Width) and Property Age');
      return;
    }
    onNext();
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-r from-[#00B894] to-[#55E6C1] rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Home className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Room Information</h2>
        <p className="text-gray-500 mt-1">Tell us about the room so the AI can tailor suggestions</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Room Type */}
        <div className="space-y-1.5">
          <Label className="text-sm font-semibold text-gray-700">Room Type</Label>
          <Select value={metadata.room_type} onValueChange={(v) => onChange('room_type', v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="kitchen">🍳 Kitchen</SelectItem>
              <SelectItem value="bedroom">🛏️ Bedroom</SelectItem>
              <SelectItem value="living_room">🛋️ Living Room</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Condition */}
        <div className="space-y-1.5">
          <Label className="text-sm font-semibold text-gray-700">Current Condition</Label>
          <Select value={metadata.condition} onValueChange={(v) => onChange('condition', v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="excellent">⭐ Excellent</SelectItem>
              <SelectItem value="good">✅ Good</SelectItem>
              <SelectItem value="fair">🔶 Fair</SelectItem>
              <SelectItem value="poor">⚠️ Poor</SelectItem>
              <SelectItem value="very_poor">❌ Very Poor</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Computed Area (auto-calculated from dimensions) */}
        {metadata.room_length && metadata.room_width && (
          <div className="space-y-1.5">
            <Label className="text-sm font-semibold text-gray-700">Computed Area</Label>
            <div className="px-3 py-2 bg-gray-50 border rounded-md text-sm font-medium text-[#00B894]">
              {(parseFloat(metadata.room_length) * parseFloat(metadata.room_width)).toFixed(0)} sq ft
            </div>
          </div>
        )}

        {/* Property Age */}
        <div className="space-y-1.5">
          <Label className="text-sm font-semibold text-gray-700">Property Age (years)</Label>
          <Input
            type="number"
            placeholder="e.g., 10"
            min={0}
            value={metadata.property_age}
            onChange={(e) => onChange('property_age', e.target.value)}
          />
        </div>
      </div>

      {/* Room Dimensions */}
      <div className="mt-2">
        <Label className="text-sm font-semibold text-gray-700 block mb-2">Room Dimensions (feet)</Label>
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1">
            <Label className="text-xs text-gray-500">Length</Label>
            <Input
              type="number"
              placeholder="e.g., 20"
              min={1}
              value={metadata.room_length}
              onChange={(e) => onChange('room_length', e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-gray-500">Width</Label>
            <Input
              type="number"
              placeholder="e.g., 15"
              min={1}
              value={metadata.room_width}
              onChange={(e) => onChange('room_width', e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-gray-500">Height</Label>
            <Input
              type="number"
              placeholder="e.g., 10"
              min={1}
              value={metadata.room_height}
              onChange={(e) => onChange('room_height', e.target.value)}
            />
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-1">Enter all measurements in feet</p>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button onClick={handleNext} className="bg-gradient-to-r from-[#00B894] to-[#55E6C1] text-white px-6">
          Next: Preferences
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Step 3: Renovation Preferences Form
// ─────────────────────────────────────────────
function Step3Preferences({
  preferences,
  onChange,
  onBack,
  onSubmit,
  loading,
}: {
  preferences: RenovationPreferences;
  onChange: (field: keyof RenovationPreferences, value: string) => void;
  onBack: () => void;
  onSubmit: () => void;
  loading: boolean;
}) {
  const goalDescriptions: Record<string, string> = {
    modernize: '✨ Update with contemporary design and features',
    refresh: '🔄 Light updates to freshen the space',
    luxury_upgrade: '💎 Premium materials and high-end finishes',
    budget_friendly: '💰 Cost-effective improvements with high ROI',
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-r from-[#FF7675] to-[#FAB1A0] rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Settings className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Renovation Preferences</h2>
        <p className="text-gray-500 mt-1">Customize how the AI generates your renovation plan</p>
      </div>

      <div className="space-y-5">
        {/* Renovation Goal */}
        <div className="space-y-1.5">
          <Label className="text-sm font-semibold text-gray-700">Renovation Goal</Label>
          <Select value={preferences.goal} onValueChange={(v) => onChange('goal', v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="modernize">Modernize</SelectItem>
              <SelectItem value="refresh">Refresh</SelectItem>
              <SelectItem value="luxury_upgrade">Luxury Upgrade</SelectItem>
              <SelectItem value="budget_friendly">Budget Friendly</SelectItem>
            </SelectContent>
          </Select>
          {preferences.goal && (
            <p className="text-xs text-gray-500 mt-1">{goalDescriptions[preferences.goal]}</p>
          )}
        </div>

        {/* Budget Tier */}
        <div className="space-y-1.5">
          <Label className="text-sm font-semibold text-gray-700">Budget Tier</Label>
          <Select value={preferences.budget_tier} onValueChange={(v) => onChange('budget_tier', v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">💵 Low ($)</SelectItem>
              <SelectItem value="medium">💵💵 Medium ($$)</SelectItem>
              <SelectItem value="high">💵💵💵 High ($$$)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Style Preference */}
        <div className="space-y-1.5">
          <Label className="text-sm font-semibold text-gray-700">Style Preference</Label>
          <Select value={preferences.style} onValueChange={(v) => onChange('style', v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="modern">🏙️ Modern</SelectItem>
              <SelectItem value="traditional">🏡 Traditional</SelectItem>
              <SelectItem value="minimalist">⬜ Minimalist</SelectItem>
              <SelectItem value="industrial">🏭 Industrial</SelectItem>
              <SelectItem value="scandinavian">🌿 Scandinavian</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Custom Preferences (Text) */}
        <div className="space-y-1.5">
          <Label className="text-sm font-semibold text-gray-700">Your Custom Preferences</Label>
          <textarea
            className="w-full min-h-[80px] px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-[#00B894] focus:border-transparent resize-y bg-white"
            placeholder="Describe what you want — e.g., 'I want warm earthy tones, a reading nook near the window, built-in bookshelves, and ambient lighting with dimmers. Prefer natural wood finishes.'"
            value={preferences.custom_preferences}
            onChange={(e) => onChange('custom_preferences', e.target.value)}
          />
          <p className="text-xs text-gray-400">Your preferences will be used in AI suggestions and image generation</p>
        </div>
      </div>

      {/* Summary box */}
      <div className="bg-gradient-to-r from-[#00B894]/10 to-[#55E6C1]/10 border border-[#00B894]/20 rounded-xl p-4">
        <p className="text-sm font-semibold text-[#00B894] mb-1">🎯 Ready to generate:</p>
        <p className="text-sm text-gray-600">
          {preferences.style.charAt(0).toUpperCase() + preferences.style.slice(1)}{' '}
          {preferences.goal.replace('_', ' ')} renovation with{' '}
          {preferences.budget_tier} budget tier
        </p>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack} disabled={loading}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button
          onClick={onSubmit}
          disabled={loading}
          className="bg-gradient-to-r from-[#FF7675] to-[#FAB1A0] text-white px-6"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Renovation
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Step 4: Results Display
// ─────────────────────────────────────────────
function Step4Results({
  results,
  onReset,
}: {
  results: RenovationResult;
  onReset: () => void;
}) {
  const { context_summary, suggestions, generated_image_url, original_image_url, metadata } = results;

  const getPriorityColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'high': return 'bg-[#FF7675] text-white';
      case 'medium': return 'bg-[#FAB1A0] text-white';
      case 'low': return 'bg-[#74B9FF] text-white';
      default: return 'bg-gray-400 text-white';
    }
  };

  return (
    <div className="space-y-6">
      {/* Mock warning */}
      {metadata?.is_mock_generation && (
        <div className="flex items-start space-x-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
          <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-700">
            <strong>Demo Mode:</strong> No API key configured — showing a placeholder image. Configure a Stability AI or Replicate API key in Phase 2 backend for real AI-generated renovations.
          </p>
        </div>
      )}

      {/* Context summary cards */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center space-x-2">
          <BarChart3 className="w-5 h-5 text-[#0984E3]" />
          <span>Analysis Summary</span>
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            { label: 'Room', value: context_summary?.room },
            { label: 'Size', value: context_summary?.size },
            { label: 'Dimensions', value: context_summary?.dimensions },
            { label: 'Condition', value: context_summary?.condition },
            { label: 'Style', value: context_summary?.style },
            { label: 'Budget', value: context_summary?.budget },
            { label: 'Urgency', value: context_summary?.urgency },
          ].map(({ label, value }) => (
            <div key={label} className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-500 mb-1">{label}</p>
              <p className="text-sm font-semibold text-gray-900 capitalize">{value || '—'}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Before / After images */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center space-x-2">
          <Eye className="w-5 h-5 text-[#00B894]" />
          <span>Before &amp; After Visualization</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="bg-gray-800 text-white text-xs font-bold px-3 py-1 rounded-t-xl inline-block">
              BEFORE
            </div>
            <img
              src={renovationService.getImageUrl(original_image_url)}
              alt="Original room"
              className="w-full rounded-b-xl rounded-tr-xl object-cover max-h-64 border border-gray-200"
            />
          </div>
          <div>
            <div className="bg-gradient-to-r from-[#00B894] to-[#55E6C1] text-white text-xs font-bold px-3 py-1 rounded-t-xl inline-block">
              AFTER (AI Generated)
            </div>
            <img
              src={renovationService.getImageUrl(generated_image_url)}
              alt="AI Renovated room"
              className="w-full rounded-b-xl rounded-tr-xl object-cover max-h-64 border border-[#00B894]/30"
            />
          </div>
        </div>
      </div>

      {/* AI Suggestions list */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-[#FF7675]" />
          <span>AI Renovation Suggestions ({suggestions?.length || 0})</span>
        </h3>
        <div className="space-y-3">
          {(suggestions || []).map((s, i) => (
            <Card key={i} className="border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-gray-900 leading-tight">{s.action}</h4>
                  <Badge className={`${getPriorityColor(s.priority_level)} ml-3 flex-shrink-0 text-xs`}>
                    {s.priority_level}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mb-3">{s.description}</p>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                  <span className="flex items-center space-x-1">
                    <TrendingUp className="w-3 h-3 text-[#00B894]" />
                    <span>Impact: <strong>{s.impact}/10</strong></span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Zap className="w-3 h-3 text-[#0984E3]" />
                    <span>Feasibility: <strong>{s.feasibility}/10</strong></span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <DollarSign className="w-3 h-3 text-[#FF7675]" />
                    <span>Budget: <strong>{s.budget_requirement}</strong></span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Star className="w-3 h-3 text-amber-400" />
                    <span>Score: <strong>{s.priority_score}</strong></span>
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3 justify-between pt-2">
        <Button variant="outline" onClick={onReset}>
          <RefreshCw className="w-4 h-4 mr-2" />
          New Analysis
        </Button>
        <a
          href={renovationService.getImageUrl(generated_image_url)}
          download="ai-renovation.png"
          className="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium bg-gradient-to-r from-[#00B894] to-[#55E6C1] text-white hover:opacity-90 transition"
        >
          <Download className="w-4 h-4 mr-2" />
          Download Result
        </a>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Main RenovationDashboard component
// ─────────────────────────────────────────────
export function RenovationDashboard() {
  const { navigate } = useRouter();

  // Wizard state
  const [step, setStep] = useState(1);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<RenovationMetadata>({
    room_type: 'living_room',
    room_size: '',
    property_age: '',
    condition: 'fair',
    room_length: '',
    room_width: '',
    room_height: '',
  });
  const [preferences, setPreferences] = useState<RenovationPreferences>({
    goal: 'modernize',
    budget_tier: 'medium',
    style: 'modern',
    custom_preferences: '',
  });
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<RenovationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);

  // Check backend health on mount
  React.useEffect(() => {
    renovationService.checkHealth().then((ok) => setBackendOnline(ok));
  }, []);

  const handleImageSelect = (file: File, preview: string) => {
    setImageFile(file);
    setImagePreview(preview);
    setError(null);
  };

  const handleMetadataChange = (field: keyof RenovationMetadata, value: string) => {
    setMetadata((prev) => ({ ...prev, [field]: value }));
  };

  const handlePreferencesChange = (field: keyof RenovationPreferences, value: string) => {
    setPreferences((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!imageFile) return;
    setLoading(true);
    setError(null);
    try {
      const result = await renovationService.analyzeAndGenerate(imageFile, metadata, preferences);
      setResults(result);
      setStep(4);
    } catch (err: any) {
      setError(err.message || 'Failed to connect to the AI Renovation Service. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStep(1);
    setImageFile(null);
    setImagePreview(null);
    setResults(null);
    setError(null);
    setMetadata({ room_type: 'living_room', room_size: '', property_age: '', condition: 'fair', room_length: '', room_width: '', room_height: '' });
    setPreferences({ goal: 'modernize', budget_tier: 'medium', style: 'modern', custom_preferences: '' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 p-4 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('dashboard')}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </Button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">AI Renovation Studio</h1>
              <p className="text-sm text-gray-500">Upload a room photo and get AI-powered renovation suggestions</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {/* Backend status indicator */}
            {backendOnline !== null && (
              <div
                className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-medium ${backendOnline
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                  }`}
              >
                <div className={`w-2 h-2 rounded-full ${backendOnline ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                <span>{backendOnline ? 'AI Backend Online' : 'AI Backend Offline'}</span>
              </div>
            )}
            <div className="flex items-center space-x-2 bg-gradient-to-r from-[#00B894]/10 to-[#55E6C1]/10 px-3 py-1 rounded-full">
              <Sparkles className="w-4 h-4 text-[#00B894]" />
              <span className="text-sm font-medium text-gray-700">AI Powered</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="max-w-3xl mx-auto p-6">
        {/* Backend offline banner */}
        {backendOnline === false && (
          <div className="mb-6 flex items-start space-x-3 bg-red-50 border border-red-200 rounded-xl p-4">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-700">AI Service is currently offline</p>
              <p className="text-xs text-red-600 mt-0.5">
                We are experiencing a temporary connection issue. Our team has been notified.
              </p>
            </div>
          </div>
        )}

        {/* Error banner */}
        {error && (
          <div className="mb-6 flex items-start space-x-3 bg-red-50 border border-red-200 rounded-xl p-4">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-700">Something went wrong</p>
              <p className="text-xs text-red-600 mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {/* Loading overlay card */}
        {loading && (
          <Card className="border-0 shadow-xl mb-6">
            <CardContent className="py-16 text-center">
              <div className="relative w-20 h-20 mx-auto mb-6">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#0984E3] to-[#74B9FF] opacity-20 animate-ping" />
                <div className="relative w-20 h-20 rounded-full bg-gradient-to-r from-[#0984E3] to-[#74B9FF] flex items-center justify-center">
                  <Loader2 className="w-10 h-10 text-white animate-spin" />
                </div>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Generating Your Renovation...</h2>
              <p className="text-gray-500 text-sm mb-6">This may take 30–60 seconds</p>
              <div className="text-left max-w-xs mx-auto space-y-2 text-xs text-gray-400">
                {[
                  '📸 Preprocessing image',
                  '🔍 Analyzing room features & objects',
                  '🔗 Building context model',
                  '💡 Generating renovation suggestions',
                  '🎨 Creating AI visualization',
                ].map((t) => (
                  <div key={t} className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#0984E3] animate-pulse" />
                    <span>{t}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Wizard card */}
        {!loading && (
          <Card className="border-0 shadow-xl">
            <CardContent className="p-8">
              <StepIndicator currentStep={step} />

              {step === 1 && (
                <Step1Upload
                  imageFile={imageFile}
                  imagePreview={imagePreview}
                  onImageSelect={handleImageSelect}
                  onNext={() => setStep(2)}
                />
              )}
              {step === 2 && (
                <Step2RoomInfo
                  metadata={metadata}
                  onChange={handleMetadataChange}
                  onBack={() => setStep(1)}
                  onNext={() => setStep(3)}
                />
              )}
              {step === 3 && (
                <Step3Preferences
                  preferences={preferences}
                  onChange={handlePreferencesChange}
                  onBack={() => setStep(2)}
                  onSubmit={handleSubmit}
                  loading={loading}
                />
              )}
              {step === 4 && results && (
                <Step4Results results={results} onReset={handleReset} />
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}