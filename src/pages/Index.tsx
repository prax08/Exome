import { MadeWithDyad } from "@/components/made-with-dyad";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/Card";
import { Modal } from "@/components/Modal";
import { Loading } from "@/components/Loading";
import { EmptyState } from "@/components/EmptyState";
import { useState } from "react";
import { PlusCircle } from "lucide-react";

const Index = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-gray-100">
          Welcome to Your Finance App
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          Showcasing Core UI Components
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-4xl">
        {/* Button Showcase */}
        <Card>
          <CardHeader>
            <CardTitle>Buttons</CardTitle>
            <CardDescription>Various button styles.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button variant="default">Default Button</Button>
            <Button variant="primary">Primary Button</Button>
            <Button variant="secondary">Secondary Button</Button>
            <Button variant="accent">Accent Button</Button>
            <Button variant="outline">Outline Button</Button>
            <Button variant="destructive">Destructive Button</Button>
            <Button variant="ghost">Ghost Button</Button>
            <Button variant="link">Link Button</Button>
          </CardContent>
        </Card>

        {/* Input Showcase */}
        <Card>
          <CardHeader>
            <CardTitle>Inputs</CardTitle>
            <CardDescription>Input fields with validation.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Input placeholder="Normal Input" />
            <Input placeholder="Input with Error" error />
          </CardContent>
        </Card>

        {/* Card Showcase */}
        <Card>
          <CardHeader>
            <CardTitle>Card Component</CardTitle>
            <CardDescription>A versatile container.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              This is content inside a card.
            </p>
          </CardContent>
        </Card>

        {/* Modal Showcase */}
        <Card>
          <CardHeader>
            <CardTitle>Modal</CardTitle>
            <CardDescription>Dialogs and confirmations.</CardDescription>
          </CardHeader>
          <CardContent>
            <Modal
              trigger={<Button onClick={() => setIsModalOpen(true)}>Open Modal</Button>}
              title="Example Modal"
              description="This is an example of a modal dialog."
              open={isModalOpen}
              onOpenChange={setIsModalOpen}
              footer={
                <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                  Close
                </Button>
              }
            >
              <p>Modal content goes here.</p>
            </Modal>
          </CardContent>
        </Card>

        {/* Loading Showcase */}
        <Card>
          <CardHeader>
            <CardTitle>Loading State</CardTitle>
            <CardDescription>Skeleton loaders.</CardDescription>
          </CardHeader>
          <CardContent>
            <Loading count={3} />
          </CardContent>
        </Card>

        {/* Empty State Showcase */}
        <Card className="md:col-span-2 lg:col-span-1">
          <CardHeader>
            <CardTitle>Empty State</CardTitle>
            <CardDescription>When there's no data.</CardDescription>
          </CardHeader>
          <CardContent>
            <EmptyState
              icon={<PlusCircle size={48} />}
              title="No Transactions Yet"
              description="Start by adding your first income or expense."
              action={<Button variant="primary">Add Transaction</Button>}
            />
          </CardContent>
        </Card>
      </div>
      <MadeWithDyad />
    </div>
  );
};

export default Index;