'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface AdvancedSettingsProps {
  visibility: string
  onVisibilityChange: (value: string) => void
  allowComments: boolean
  onAllowCommentsChange: (value: boolean) => void
  postAs: string
  onPostAsChange: (value: string) => void
}

export function AdvancedSettings({
  visibility,
  onVisibilityChange,
  allowComments,
  onAllowCommentsChange,
  postAs,
  onPostAsChange,
}: AdvancedSettingsProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
      <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-3 rounded-lg hover:bg-muted/50 transition-colors group">
        <span className="text-foreground font-semibold">Advanced Settings</span>
        <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${
          isOpen ? 'rotate-180' : ''
        }`} />
      </CollapsibleTrigger>

      <CollapsibleContent className="space-y-4 mt-2">
        <div className="bg-muted/20 border border-border rounded-lg p-4 space-y-4">
          {/* Visibility Selector */}
          <div className="space-y-3">
            <Label className="text-foreground font-semibold">Visibility</Label>
            <Select value={visibility} onValueChange={onVisibilityChange}>
              <SelectTrigger className="bg-input border-border text-foreground focus:ring-2 focus:ring-accent">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="public" className="focus:bg-accent focus:text-accent-foreground">
                  Public
                </SelectItem>
                <SelectItem value="followers" disabled className="focus:bg-accent focus:text-accent-foreground opacity-50">
                  Followers Only (Coming Soon)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Comments Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-foreground font-semibold">Allow Comments</Label>
              <p className="text-xs text-muted-foreground mt-1">
                Community members can reply to your post
              </p>
            </div>
            <Switch
              checked={allowComments}
              onCheckedChange={onAllowCommentsChange}
              className="data-[state=checked]:bg-accent"
            />
          </div>

          {/* Post As Selector */}
          <div className="space-y-3">
            <Label className="text-foreground font-semibold">Post As</Label>
            <Select value={postAs} onValueChange={onPostAsChange}>
              <SelectTrigger className="bg-input border-border text-foreground focus:ring-2 focus:ring-accent">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="personal" className="focus:bg-accent focus:text-accent-foreground">
                  Personal Profile
                </SelectItem>
                <SelectItem value="startup" disabled className="focus:bg-accent focus:text-accent-foreground opacity-50">
                  Startup Name (Coming Soon)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
