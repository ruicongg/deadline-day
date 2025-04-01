import { DataImportForm } from "@/components/data-import-form"

export default function ImportPage() {
  return (
    <div className="container mx-auto py-6 px-4 md:px-6">
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Data Import</h1>
          <p className="text-muted-foreground">Import football player data from CSV files</p>
        </div>

        <DataImportForm />
      </div>
    </div>
  )
}

