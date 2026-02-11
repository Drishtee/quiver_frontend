import { useState, useEffect, useCallback } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Slider } from '../ui/slider';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';
import {
  ChevronDown,
  Save,
  Loader2,
  User,
  MessageSquare,
  Mic,
  Sparkles,
  SlidersHorizontal,
  Monitor,
  Search,
  X,
  Plus,
  Check,
  Trash2,
} from 'lucide-react';
import type { AIAssistantConfig } from '../../../types/aiAssistantConfig';
import type { ScreenAssistantConfig, ScreenConfigMap, AllScreenType } from '../../../types/screenAssistantConfig';
import { DEFAULT_SCREEN_CONFIGS } from '../../../config/defaultScreenConfigs';
import { fetchAIAssistantConfig, updateAIAssistantConfig, fetchScreenAssistantConfigs, updateScreenAssistantConfigs } from '../../../services/api';

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'Hindi' },
  { code: 'as', label: 'Assamese' },
  { code: 'mr', label: 'Marathi' },
];

const VOICE_OPTIONS = [
  { value: 'alloy', label: 'Alloy' },
  { value: 'echo', label: 'Echo' },
  { value: 'shimmer', label: 'Shimmer' },
  { value: 'ash', label: 'Ash' },
  { value: 'ballad', label: 'Ballad' },
  { value: 'coral', label: 'Coral' },
  { value: 'sage', label: 'Sage' },
  { value: 'verse', label: 'Verse' },
] as const;

const STYLE_OPTIONS = [
  { value: 'friendly', label: 'Friendly' },
  { value: 'professional', label: 'Professional' },
  { value: 'casual', label: 'Casual' },
  { value: 'empathetic', label: 'Empathetic' },
] as const;

function SectionHeader({ icon: Icon, title, isOpen }: { icon: any; title: string; isOpen: boolean }) {
  return (
    <div className="flex items-center justify-between w-full py-3 px-4 text-left hover:bg-gray-50 rounded-lg transition-colors">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon className="w-4 h-4 text-primary" />
        </div>
        <span className="font-medium text-gray-900">{title}</span>
      </div>
      <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
    </div>
  );
}

function MultiLangInput({
  label,
  values,
  onChange,
  multiline = false,
}: {
  label: string;
  values: Record<string, string>;
  onChange: (values: Record<string, string>) => void;
  multiline?: boolean;
}) {
  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {LANGUAGES.map(lang => (
          <div key={lang.code}>
            <label className="text-xs text-gray-500 mb-1 block">{lang.label}</label>
            {multiline ? (
              <textarea
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary resize-y min-h-[60px]"
                value={values[lang.code] || ''}
                onChange={e => onChange({ ...values, [lang.code]: e.target.value })}
                placeholder={`${label} in ${lang.label}`}
              />
            ) : (
              <Input
                value={values[lang.code] || ''}
                onChange={e => onChange({ ...values, [lang.code]: e.target.value })}
                placeholder={`${label} in ${lang.label}`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function TagInput({ tags, onChange }: { tags: string[]; onChange: (tags: string[]) => void }) {
  const [inputValue, setInputValue] = useState('');

  const addTag = () => {
    const trimmed = inputValue.trim();
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed]);
      setInputValue('');
    }
  };

  const removeTag = (index: number) => {
    onChange(tags.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {tags.map((tag, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-sm"
          >
            {tag}
            <button onClick={() => removeTag(i)} className="hover:text-red-500">
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <Input
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addTag();
            }
          }}
          placeholder="Add a trait..."
          className="flex-1"
        />
        <Button variant="outline" size="sm" onClick={addTag} disabled={!inputValue.trim()}>
          <Plus className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

const ALL_SCREEN_KEYS: AllScreenType[] = [
  'landing', 'login', 'signup', 'otp', 'business-model',
  'consent', 'profile', 'enterprise', 'industry', 'pathway',
  'ai-pathway', 'questionnaire', 'equity', 'documents', 'review',
  'admin', 'success', 'dashboard', 'schedule', 'video-meeting',
  'voice-onboarding',
];

const TOOL_OPTIONS = [
  { id: 'update_form_field', label: 'Fill Form Field' },
  { id: 'batch_update_fields', label: 'Batch Fill Fields' },
  { id: 'confirm_all_fields', label: 'Confirm Fields' },
  { id: 'navigate_to_screen', label: 'Navigate Screen' },
  { id: 'trigger_action', label: 'Trigger Action' },
] as const;

function ScreenConfigCard({
  config,
  onChange,
}: {
  config: ScreenAssistantConfig;
  onChange: (updated: ScreenAssistantConfig) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleTool = (toolId: string) => {
    const tools = config.enabled_tools.includes(toolId)
      ? config.enabled_tools.filter(t => t !== toolId)
      : [...config.enabled_tools, toolId];
    onChange({ ...config, enabled_tools: tools });
  };

  const addNavTarget = (target: AllScreenType) => {
    if (!config.allowed_navigation_targets.includes(target)) {
      onChange({ ...config, allowed_navigation_targets: [...config.allowed_navigation_targets, target] });
    }
  };

  const removeNavTarget = (target: AllScreenType) => {
    onChange({ ...config, allowed_navigation_targets: config.allowed_navigation_targets.filter(t => t !== target) });
  };

  const addAction = () => {
    onChange({
      ...config,
      custom_actions: [...config.custom_actions, { action_id: '', label: '', description: '' }],
    });
  };

  const updateAction = (index: number, field: string, value: string) => {
    const actions = [...config.custom_actions];
    actions[index] = { ...actions[index], [field]: value };
    onChange({ ...config, custom_actions: actions });
  };

  const removeAction = (index: number) => {
    onChange({ ...config, custom_actions: config.custom_actions.filter((_, i) => i !== index) });
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div
        className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-50"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onChange({ ...config, enabled: !config.enabled });
            }}
            className={`w-10 h-5 rounded-full transition-colors relative ${config.enabled ? 'bg-accent' : 'bg-gray-300'}`}
          >
            <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-transform ${config.enabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
          </button>
          <span className="font-medium text-gray-900 font-mono text-sm">{config.screen_key}</span>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && (
        <div className="px-4 pb-4 space-y-4 border-t border-gray-100 pt-4">
          {/* System Prompt Override */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">System Prompt Override</label>
            <textarea
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary resize-y min-h-[80px]"
              value={config.system_prompt_override}
              onChange={e => onChange({ ...config, system_prompt_override: e.target.value })}
              placeholder="Screen-specific instructions appended to the base prompt..."
            />
          </div>

          {/* Enabled Tools */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Enabled Tools</label>
            <div className="flex flex-wrap gap-2">
              {TOOL_OPTIONS.map(tool => (
                <button
                  key={tool.id}
                  onClick={() => toggleTool(tool.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    config.enabled_tools.includes(tool.id)
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {tool.label}
                </button>
              ))}
            </div>
          </div>

          {/* Navigation Targets */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Navigation Targets</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {config.allowed_navigation_targets.map(target => (
                <span
                  key={target}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-mono"
                >
                  {target}
                  <button onClick={() => removeNavTarget(target)} className="hover:text-red-500">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <select
              className="rounded-lg border border-gray-300 px-2 py-1.5 text-sm"
              value=""
              onChange={e => {
                if (e.target.value) addNavTarget(e.target.value as AllScreenType);
              }}
            >
              <option value="">+ Add target...</option>
              {ALL_SCREEN_KEYS.filter(k => k !== config.screen_key && !config.allowed_navigation_targets.includes(k)).map(k => (
                <option key={k} value={k}>{k}</option>
              ))}
            </select>
          </div>

          {/* Custom Actions */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Custom Actions</label>
            {config.custom_actions.map((action, i) => (
              <div key={i} className="flex gap-2 mb-2 items-start">
                <div className="flex-1 grid grid-cols-3 gap-2">
                  <Input
                    value={action.action_id}
                    onChange={e => updateAction(i, 'action_id', e.target.value)}
                    placeholder="action_id"
                    className="font-mono text-xs"
                  />
                  <Input
                    value={action.label}
                    onChange={e => updateAction(i, 'label', e.target.value)}
                    placeholder="Label"
                    className="text-xs"
                  />
                  <Input
                    value={action.description}
                    onChange={e => updateAction(i, 'description', e.target.value)}
                    placeholder="Description"
                    className="text-xs"
                  />
                </div>
                <button onClick={() => removeAction(i)} className="p-1.5 text-gray-400 hover:text-red-500">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={addAction}>
              <Plus className="w-3 h-3 mr-1" /> Add Action
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AIAssistantTab() {
  const [config, setConfig] = useState<AIAssistantConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Screen configs state
  const [screenConfigs, setScreenConfigs] = useState<ScreenConfigMap>({ ...DEFAULT_SCREEN_CONFIGS });
  const [savingScreenConfigs, setSavingScreenConfigs] = useState(false);
  const [screenConfigSaveSuccess, setScreenConfigSaveSuccess] = useState(false);
  const [screenFilter, setScreenFilter] = useState('');

  // Section open state
  const [openSections, setOpenSections] = useState({
    identity: true,
    greetings: false,
    voice: false,
    style: false,
    vad: false,
    screenBehaviors: false,
  });

  const toggleSection = (key: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const loadConfig = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [configData, screenData] = await Promise.allSettled([
        fetchAIAssistantConfig(),
        fetchScreenAssistantConfigs(),
      ]);
      if (configData.status === 'fulfilled') setConfig(configData.value);
      if (screenData.status === 'fulfilled' && Object.keys(screenData.value).length > 0) {
        setScreenConfigs(prev => ({ ...DEFAULT_SCREEN_CONFIGS, ...screenData.value }));
      }
      if (configData.status === 'rejected') {
        throw configData.reason;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load config');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  const handleSave = async () => {
    if (!config) return;
    try {
      setSaving(true);
      setError(null);
      setSaveSuccess(false);
      const { updated_at, ...dataToSave } = config;
      const updated = await updateAIAssistantConfig(dataToSave);
      setConfig(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save config');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveScreenConfigs = async () => {
    try {
      setSavingScreenConfigs(true);
      setError(null);
      setScreenConfigSaveSuccess(false);
      const updated = await updateScreenAssistantConfigs(screenConfigs);
      setScreenConfigs(prev => ({ ...DEFAULT_SCREEN_CONFIGS, ...updated }));
      setScreenConfigSaveSuccess(true);
      setTimeout(() => setScreenConfigSaveSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save screen configs');
    } finally {
      setSavingScreenConfigs(false);
    }
  };

  const updateScreenConfig = (screenKey: string, updated: ScreenAssistantConfig) => {
    setScreenConfigs(prev => ({ ...prev, [screenKey]: updated }));
  };

  const filteredScreenKeys = ALL_SCREEN_KEYS.filter(k =>
    !screenFilter || k.toLowerCase().includes(screenFilter.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error && !config) {
    return (
      <div className="text-center py-20">
        <p className="text-red-500 mb-4">{error}</p>
        <Button variant="outline" onClick={loadConfig}>Retry</Button>
      </div>
    );
  }

  if (!config) return null;

  return (
    <div className="space-y-4 max-w-4xl">
      {/* Section 1: Identity */}
      <Collapsible open={openSections.identity} onOpenChange={() => toggleSection('identity')}>
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <CollapsibleTrigger asChild>
            <button className="w-full">
              <SectionHeader icon={User} title="Identity" isOpen={openSections.identity} />
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="px-4 pb-4 space-y-4 border-t border-gray-100 pt-4">
              <MultiLangInput
                label="Assistant Name"
                values={config.assistant_name}
                onChange={v => setConfig({ ...config, assistant_name: v })}
              />
              <MultiLangInput
                label="Assistant Subtitle"
                values={config.assistant_subtitle}
                onChange={v => setConfig({ ...config, assistant_subtitle: v })}
              />
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>

      {/* Section 2: Greetings */}
      <Collapsible open={openSections.greetings} onOpenChange={() => toggleSection('greetings')}>
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <CollapsibleTrigger asChild>
            <button className="w-full">
              <SectionHeader icon={MessageSquare} title="Greetings" isOpen={openSections.greetings} />
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="px-4 pb-4 space-y-4 border-t border-gray-100 pt-4">
              <MultiLangInput
                label="Greeting Message"
                values={config.greeting_messages}
                onChange={v => setConfig({ ...config, greeting_messages: v })}
                multiline
              />
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>

      {/* Section 3: Voice Settings */}
      <Collapsible open={openSections.voice} onOpenChange={() => toggleSection('voice')}>
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <CollapsibleTrigger asChild>
            <button className="w-full">
              <SectionHeader icon={Mic} title="Voice Settings" isOpen={openSections.voice} />
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="px-4 pb-4 space-y-4 border-t border-gray-100 pt-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Voice Type</label>
                <Select
                  value={config.voice_type}
                  onValueChange={v => setConfig({ ...config, voice_type: v as AIAssistantConfig['voice_type'] })}
                >
                  <SelectTrigger className="w-full md:w-64">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {VOICE_OPTIONS.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>

      {/* Section 4: Communication Style */}
      <Collapsible open={openSections.style} onOpenChange={() => toggleSection('style')}>
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <CollapsibleTrigger asChild>
            <button className="w-full">
              <SectionHeader icon={Sparkles} title="Communication Style" isOpen={openSections.style} />
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="px-4 pb-4 space-y-4 border-t border-gray-100 pt-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Style Preset</label>
                <Select
                  value={config.style_preset}
                  onValueChange={v => setConfig({ ...config, style_preset: v as AIAssistantConfig['style_preset'] })}
                >
                  <SelectTrigger className="w-full md:w-64">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STYLE_OPTIONS.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Personality Traits</label>
                <TagInput
                  tags={config.personality_traits}
                  onChange={tags => setConfig({ ...config, personality_traits: tags })}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Custom System Prompt <span className="text-gray-400 font-normal">(optional override)</span>
                </label>
                <textarea
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary resize-y min-h-[120px] font-mono"
                  value={config.custom_system_prompt}
                  onChange={e => setConfig({ ...config, custom_system_prompt: e.target.value })}
                  placeholder="Leave empty to use auto-generated prompt from style preset and personality traits..."
                />
              </div>
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>

      {/* Section 5: VAD / Sensitivity Settings */}
      <Collapsible open={openSections.vad} onOpenChange={() => toggleSection('vad')}>
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <CollapsibleTrigger asChild>
            <button className="w-full">
              <SectionHeader icon={SlidersHorizontal} title="Sensitivity / VAD Settings" isOpen={openSections.vad} />
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="px-4 pb-4 space-y-6 border-t border-gray-100 pt-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">VAD Threshold</label>
                  <span className="text-sm text-gray-500 font-mono">{config.vad_threshold.toFixed(2)}</span>
                </div>
                <Slider
                  value={[config.vad_threshold]}
                  onValueChange={([v]) => setConfig({ ...config, vad_threshold: v })}
                  min={0}
                  max={1}
                  step={0.05}
                />
                <p className="text-xs text-gray-400 mt-1">Higher = less sensitive to background noise (0.0 - 1.0)</p>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">Silence Duration</label>
                  <span className="text-sm text-gray-500 font-mono">{config.silence_duration_ms}ms</span>
                </div>
                <Slider
                  value={[config.silence_duration_ms]}
                  onValueChange={([v]) => setConfig({ ...config, silence_duration_ms: v })}
                  min={200}
                  max={3000}
                  step={100}
                />
                <p className="text-xs text-gray-400 mt-1">How long to wait before considering speech ended (200 - 3000ms)</p>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">Prefix Padding</label>
                  <span className="text-sm text-gray-500 font-mono">{config.vad_prefix_padding_ms}ms</span>
                </div>
                <Slider
                  value={[config.vad_prefix_padding_ms]}
                  onValueChange={([v]) => setConfig({ ...config, vad_prefix_padding_ms: v })}
                  min={100}
                  max={1000}
                  step={50}
                />
                <p className="text-xs text-gray-400 mt-1">Buffer before speech starts (100 - 1000ms)</p>
              </div>
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>

      {/* Section 6: Screen Behaviors */}
      <Collapsible open={openSections.screenBehaviors} onOpenChange={() => toggleSection('screenBehaviors')}>
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <CollapsibleTrigger asChild>
            <button className="w-full">
              <SectionHeader icon={Monitor} title="Screen Behaviors" isOpen={openSections.screenBehaviors} />
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="px-4 pb-4 space-y-3 border-t border-gray-100 pt-4">
              <p className="text-sm text-gray-500">
                Configure which screens show the AI assistant and what tools/actions are available per screen.
              </p>
              {/* Search filter */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                  value={screenFilter}
                  onChange={e => setScreenFilter(e.target.value)}
                  placeholder="Filter screens..."
                  className="pl-9"
                />
              </div>
              {/* Screen config cards */}
              <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
                {filteredScreenKeys.map(key => {
                  const sc = screenConfigs[key] || DEFAULT_SCREEN_CONFIGS[key];
                  if (!sc) return null;
                  return (
                    <ScreenConfigCard
                      key={key}
                      config={sc}
                      onChange={(updated) => updateScreenConfig(key, updated)}
                    />
                  );
                })}
              </div>
              {/* Save button for screen configs */}
              <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
                {screenConfigSaveSuccess && (
                  <span className="text-sm text-green-600 flex items-center gap-1">
                    <Check className="w-4 h-4" /> Screen configs saved
                  </span>
                )}
                <Button onClick={handleSaveScreenConfigs} disabled={savingScreenConfigs}>
                  {savingScreenConfigs ? (
                    <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Saving...</>
                  ) : (
                    <><Save className="w-4 h-4 mr-2" /> Save Screen Configs</>
                  )}
                </Button>
              </div>
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>

      {/* Footer: Save + Status */}
      <div className="flex items-center justify-between bg-white rounded-xl border border-gray-200 px-4 py-3">
        <div className="text-sm text-gray-500">
          {config.updated_at && (
            <span>Last updated: {new Date(config.updated_at).toLocaleString()}</span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {error && <span className="text-sm text-red-500">{error}</span>}
          {saveSuccess && (
            <span className="text-sm text-green-600 flex items-center gap-1">
              <Check className="w-4 h-4" /> Saved
            </span>
          )}
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Saving...</>
            ) : (
              <><Save className="w-4 h-4 mr-2" /> Save Changes</>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
