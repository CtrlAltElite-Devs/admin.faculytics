import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CategoriesTab } from './components/categories-tab'
import { CoursesBulkTab } from './components/courses-bulk-tab'
import { QuickCourseTab } from './components/quick-course-tab'
import { SeedUsersTab } from './components/seed-users-tab'

export function ProvisionPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Moodle Provisioning</h1>

      <Tabs defaultValue="categories">
        <TabsList>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="courses-bulk">Courses (Bulk)</TabsTrigger>
          <TabsTrigger value="quick-course">Quick Course</TabsTrigger>
          <TabsTrigger value="seed-users">Seed Users</TabsTrigger>
        </TabsList>

        <TabsContent value="categories" className="mt-6">
          <CategoriesTab />
        </TabsContent>

        <TabsContent value="courses-bulk" className="mt-6">
          <CoursesBulkTab />
        </TabsContent>

        <TabsContent value="quick-course" className="mt-6">
          <QuickCourseTab />
        </TabsContent>

        <TabsContent value="seed-users" className="mt-6">
          <SeedUsersTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
