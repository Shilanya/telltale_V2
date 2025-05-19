import StoryForm from "@/components/story-form"

export default function CreateStoryPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Create New Story</h1>
      <StoryForm />
    </div>
  )
}
