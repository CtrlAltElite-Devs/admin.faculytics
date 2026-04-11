import { useState, useMemo, useEffect } from 'react'
import { Loader2, RefreshCw, Search } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ApiError } from '@/lib/api-client'
import { useMoodleTree } from '../use-moodle-tree'
import { CategoryTreeNode } from './category-tree-node'
import { CategoryCourseList } from './category-course-list'
import type { MoodleCategoryTreeNode } from '@/types/api'

function buildSearchIndex(
  nodes: MoodleCategoryTreeNode[],
  parentId: number | null,
  index: {
    parentMap: Map<number, number | null>
    allNodes: MoodleCategoryTreeNode[]
  },
) {
  for (const node of nodes) {
    index.parentMap.set(node.id, parentId)
    index.allNodes.push(node)
    buildSearchIndex(node.children, node.id, index)
  }
}

function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const seconds = Math.floor(diff / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  return `${hours}h ago`
}

interface MoodleTreeSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function MoodleTreeSheet({ open, onOpenChange }: MoodleTreeSheetProps) {
  const { data, isLoading, error, refetch, isFetching } = useMoodleTree()

  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null,
  )
  const [selectedCategoryName, setSelectedCategoryName] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  // Reset local state when sheet closes
  useEffect(() => {
    if (!open) {
      setSelectedCategoryId(null)
      setSelectedCategoryName('')
      setSearchTerm('')
    }
  }, [open])

  const { matchingIds, ancestorIds } = useMemo(() => {
    if (!data || !searchTerm.trim()) {
      return { matchingIds: undefined, ancestorIds: undefined }
    }

    const index = {
      parentMap: new Map<number, number | null>(),
      allNodes: [] as MoodleCategoryTreeNode[],
    }
    buildSearchIndex(data.tree, null, index)

    const term = searchTerm.toLowerCase()
    const matching = new Set<number>()
    const ancestors = new Set<number>()

    for (const node of index.allNodes) {
      if (node.name.toLowerCase().includes(term)) {
        matching.add(node.id)
        // Walk up parent chain
        let pid = index.parentMap.get(node.id)
        while (pid != null) {
          ancestors.add(pid)
          pid = index.parentMap.get(pid)
        }
      }
    }

    return { matchingIds: matching, ancestorIds: ancestors }
  }, [data, searchTerm])

  const searchActive = searchTerm.trim().length > 0

  const handleSelectCategory = (id: number, name: string) => {
    setSelectedCategoryId(id)
    setSelectedCategoryName(name)
  }

  const handleBack = () => {
    setSelectedCategoryId(null)
  }

  const isError =
    error instanceof ApiError &&
    (error.status === 502 || error.status === 503)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[480px] gap-0 overflow-hidden p-0 sm:w-[540px]">
        <SheetHeader className="gap-0 border-b px-4 py-3">
          <div className="flex items-center gap-2 pr-8">
            <SheetTitle className="text-base font-semibold">
              Moodle Categories
            </SheetTitle>
            {data && (
              <Badge variant="secondary" className="text-[10px]">
                {data.totalCategories}
              </Badge>
            )}
            <div className="ml-auto flex items-center gap-2">
              {data?.fetchedAt && (
                <span className="text-xs text-muted-foreground">
                  {formatRelativeTime(data.fetchedAt)}
                </span>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="size-7"
                onClick={() => refetch()}
                disabled={isFetching}
              >
                <RefreshCw
                  className={`size-3.5 ${isFetching ? 'animate-spin' : ''}`}
                />
              </Button>
            </div>
          </div>
          <SheetDescription className="sr-only">
            Browse Moodle category hierarchy
          </SheetDescription>
        </SheetHeader>

        {isLoading && (
          <div className="flex flex-1 items-center justify-center">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {error && isError && (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-4">
            <p className="text-sm text-muted-foreground">
              Failed to connect to Moodle
            </p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        )}

        {error && !isError && !isLoading && (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-4">
            <p className="text-sm text-muted-foreground">
              {error.message}
            </p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        )}

        {data && data.tree.length === 0 && (
          <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
            No categories found in Moodle
          </div>
        )}

        {data && data.tree.length > 0 && selectedCategoryId === null && (
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="border-b px-4 py-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Filter categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-8 pl-8 text-sm"
                />
              </div>
            </div>
            <ScrollArea className="flex-1">
              <div className="py-1" role="tree">
                {data.tree.map((node) => (
                  <CategoryTreeNode
                    key={node.id}
                    node={node}
                    onSelectCategory={handleSelectCategory}
                    matchingIds={matchingIds}
                    ancestorIds={ancestorIds}
                    searchActive={searchActive}
                  />
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        {data && selectedCategoryId !== null && (
          <div className="min-h-0 flex-1">
            <CategoryCourseList
              categoryId={selectedCategoryId}
              categoryName={selectedCategoryName}
              onBack={handleBack}
            />
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
