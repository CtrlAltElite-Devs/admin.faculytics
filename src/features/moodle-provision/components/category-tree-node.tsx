import { useState } from 'react'
import {
  ChevronRight,
  Building,
  Calendar,
  Briefcase,
  GraduationCap,
  FolderOpen,
  Copy,
} from 'lucide-react'
import { toast } from 'sonner'
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from '@/components/ui/collapsible'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { MoodleCategoryTreeNode } from '@/types/api'

const depthIcons: Record<number, typeof Building> = {
  1: Building,
  2: Calendar,
  3: Briefcase,
  4: GraduationCap,
}

interface CategoryTreeNodeProps {
  node: MoodleCategoryTreeNode
  onSelectCategory: (id: number, name: string) => void
  defaultExpanded?: boolean
  matchingIds?: Set<number>
  ancestorIds?: Set<number>
  searchActive?: boolean
}

export function CategoryTreeNode({
  node,
  onSelectCategory,
  defaultExpanded = false,
  matchingIds,
  ancestorIds,
  searchActive = false,
}: CategoryTreeNodeProps) {
  const [manualOpen, setManualOpen] = useState(defaultExpanded)

  const forceExpanded = searchActive && ancestorIds?.has(node.id)
  const isOpen = forceExpanded || manualOpen

  if (searchActive && !matchingIds?.has(node.id) && !ancestorIds?.has(node.id)) {
    return null
  }

  const Icon = depthIcons[node.depth] ?? FolderOpen
  const hasChildren = node.children.length > 0
  const isHighlighted = searchActive && matchingIds?.has(node.id)

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={(open) => {
        if (!forceExpanded) setManualOpen(open)
      }}
      role="treeitem"
      aria-expanded={hasChildren ? isOpen : undefined}
    >
      <div
        className={cn(
          'flex items-center gap-1 rounded-md py-1 pr-2 hover:bg-accent/50',
          node.visible === 0 && 'opacity-50',
          isHighlighted && 'bg-accent/30',
        )}
        style={{ paddingLeft: node.depth * 16 }}
      >
        {hasChildren ? (
          <CollapsibleTrigger asChild>
            <button className="flex size-6 shrink-0 items-center justify-center rounded-sm hover:bg-accent">
              <ChevronRight
                className={cn(
                  'size-4 transition-transform',
                  isOpen && 'rotate-90',
                )}
              />
            </button>
          </CollapsibleTrigger>
        ) : (
          <span className="size-6 shrink-0" />
        )}

        <Icon className="size-4 shrink-0 text-muted-foreground" />

        <button
          className="truncate text-left text-sm hover:underline"
          onClick={() => onSelectCategory(node.id, node.name)}
          title={node.name}
        >
          {node.name}
        </button>

        <button
          className="ml-1 flex size-5 shrink-0 items-center justify-center rounded-sm text-muted-foreground opacity-0 transition-opacity hover:bg-accent hover:text-foreground group-hover:opacity-100 [div:hover>&]:opacity-100"
          onClick={() => {
            navigator.clipboard.writeText(node.name).then(
              () => toast.success('Copied to clipboard'),
              () => toast.error('Failed to copy'),
            )
          }}
          title="Copy name"
        >
          <Copy className="size-3" />
        </button>

        {node.coursecount > 0 && (
          <Badge variant="secondary" className="ml-auto text-[10px]">
            {node.coursecount}
          </Badge>
        )}
      </div>

      {hasChildren && (
        <CollapsibleContent>
          {node.children.map((child) => (
            <CategoryTreeNode
              key={child.id}
              node={child}
              onSelectCategory={onSelectCategory}
              matchingIds={matchingIds}
              ancestorIds={ancestorIds}
              searchActive={searchActive}
            />
          ))}
        </CollapsibleContent>
      )}
    </Collapsible>
  )
}
