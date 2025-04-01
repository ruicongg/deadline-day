import { DatabaseTest } from "@/components/database-test"

export default function TestDbPage() {
  return (
    <div className="container mx-auto py-6 px-4 md:px-6">
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Database Connection Test</h1>
          <p className="text-muted-foreground">Verify the connection to your Neon Postgres database</p>
        </div>

        <DatabaseTest />

        <div className="bg-muted p-4 rounded-md">
          <h2 className="text-lg font-semibold mb-2">Troubleshooting Tips</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Ensure your DATABASE_URL environment variable is correctly set</li>
            <li>Check that your Neon database is active and accessible</li>
            <li>Verify that your IP address is allowed in Neon's connection settings</li>
            <li>Make sure your database user has the necessary permissions</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

