"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PackageList } from "@/components/products/package-list"
import { TemplateList } from "@/components/products/template-list"
import { AddOnList } from "@/components/products/addon-list"

export default function ProductsPage() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-3xl font-bold">Produk</h1>
        <p className="text-muted-foreground">
          Kelola paket foto, template, dan add-on
        </p>
      </div>

      <Tabs defaultValue="packages" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="packages">Paket</TabsTrigger>
          <TabsTrigger value="templates">Template</TabsTrigger>
          <TabsTrigger value="addons">Add-On</TabsTrigger>
        </TabsList>
        
        <TabsContent value="packages" className="mt-4">
          <PackageList />
        </TabsContent>
        
        <TabsContent value="templates" className="mt-4">
          <TemplateList />
        </TabsContent>
        
        <TabsContent value="addons" className="mt-4">
          <AddOnList />
        </TabsContent>
      </Tabs>
    </div>
  )
}