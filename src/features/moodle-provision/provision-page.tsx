import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CategoriesTab } from './components/categories-tab'
import { CoursesBulkTab } from './components/courses-bulk-tab'
import { QuickCourseTab } from './components/quick-course-tab'
import { SeedUsersTab } from './components/seed-users-tab'
import { MoodleTreeSheet } from './components/moodle-tree-sheet'

export function ProvisionPage() {
  const [treeOpen, setTreeOpen] = useState(false)

  const onBrowse = () => setTreeOpen(true)

  return (
    <div className="space-y-6 dashboard-stagger">
      <h1 className="font-display text-2xl font-semibold tracking-tight">Moodle Provisioning</h1>

      <Tabs defaultValue="categories">
        <TabsList>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="courses-bulk">Courses (Bulk)</TabsTrigger>
          <TabsTrigger value="quick-course">Quick Course</TabsTrigger>
          <TabsTrigger value="seed-users">Seed Users</TabsTrigger>
        </TabsList>

        <TabsContent value="categories" className="mt-6">
          <CategoriesTab onBrowse={onBrowse} />
        </TabsContent>

        <TabsContent value="courses-bulk" className="mt-6">
          <CoursesBulkTab onBrowse={onBrowse} />
        </TabsContent>

        <TabsContent value="quick-course" className="mt-6">
          <QuickCourseTab onBrowse={onBrowse} />
        </TabsContent>

        <TabsContent value="seed-users" className="mt-6">
          <SeedUsersTab onBrowse={onBrowse} />
        </TabsContent>
      </Tabs>

      <MoodleTreeSheet open={treeOpen} onOpenChange={setTreeOpen} />
    </div>
  )
}
