"use client"

import { useState, useEffect, useCallback } from "react"
import { Search, Package, LayoutTemplate, PlusCircle, Plus, Check } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { CartItem } from "@/app/(dashboard)/kasir/page"

type Product = {
  id: string
  name: string
  code: string
  basePrice?: number
  price?: number
  photoCount?: number
  category?: string
  type?: string
  isActive: boolean
  imageUrl?: string
  thumbnailUrl?: string
}

type ProductPanelProps = {
  onAddToCart: (item: Omit<CartItem, "quantity">) => void
  cart: CartItem[]
}

export function ProductPanel({ onAddToCart, cart }: ProductPanelProps) {
  const [packages, setPackages] = useState<Product[]>([])
  const [templates, setTemplates] = useState<Product[]>([])
  const [addons, setAddons] = useState<Product[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)

  const fetchAll = useCallback(async () => {
    try {
      const [pkgRes, tplRes, adnRes] = await Promise.all([
        fetch("/api/products/packages"),
        fetch("/api/products/templates"),
        fetch("/api/products/addons"),
      ])
      const [pkgData, tplData, adnData] = await Promise.all([
        pkgRes.json(),
        tplRes.json(),
        adnRes.json(),
      ])
      setPackages(pkgData.filter((p: Product) => p.isActive))
      setTemplates(tplData.filter((t: Product) => t.isActive))
      setAddons(adnData.filter((a: Product) => a.isActive))
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  const isInCart = (id: string) => cart.some((c) => c.id === id)

  const filtered = (items: Product[]) =>
    items.filter(
      (item) =>
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.code.toLowerCase().includes(search.toLowerCase())
    )

  const ProductCard = ({
    item,
    itemType,
  }: {
    item: Product
    itemType: "package" | "template" | "addon"
  }) => {
    const price =
      itemType === "package"
        ? Number(item.basePrice ?? 0)
        : itemType === "addon"
        ? Number(item.price ?? 0)
        : 0
    const inCart = isInCart(item.id)
    const imageUrl = item.imageUrl || item.thumbnailUrl

    return (
      <div
        className={cn(
          "group relative flex flex-col rounded-xl border bg-card transition-all duration-200 overflow-hidden cursor-pointer",
          "hover:border-primary/50 hover:shadow-md",
          inCart && "border-primary/50 bg-primary/5"
        )}
        onClick={() =>
          onAddToCart({
            id: item.id,
            type: itemType,
            name: item.name,
            code: item.code,
            price,
            packageId: itemType === "package" ? item.id : undefined,
            templateId: itemType === "template" ? item.id : undefined,
            addOnId: itemType === "addon" ? item.id : undefined,
          })
        }
      >
        {/* Gambar — lebih pendek di mobile */}
        <div className="relative h-24 sm:h-32 md:h-36 w-full bg-muted overflow-hidden">
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt={item.name}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              {itemType === "package" ? (
                <Package className="h-8 w-8 md:h-10 md:w-10 text-muted-foreground/40" />
              ) : itemType === "template" ? (
                <LayoutTemplate className="h-8 w-8 md:h-10 md:w-10 text-muted-foreground/40" />
              ) : (
                <PlusCircle className="h-8 w-8 md:h-10 md:w-10 text-muted-foreground/40" />
              )}
            </div>
          )}

          {inCart && (
            <div className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary">
              <Check className="h-3.5 w-3.5 text-primary-foreground" />
            </div>
          )}

          {itemType === "template" && item.category && (
            <Badge className="absolute bottom-2 left-2 text-xs" variant="secondary">
              {item.category}
            </Badge>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col gap-1 p-2 md:p-3">
          <p className="text-xs text-muted-foreground font-mono">{item.code}</p>
          <p className="font-semibold text-xs md:text-sm leading-tight line-clamp-2">{item.name}</p>
          {itemType === "package" && item.photoCount && (
            <p className="text-xs text-muted-foreground">{item.photoCount} foto</p>
          )}
          <div className="mt-1 flex items-center justify-between">
            <p className="font-bold text-primary text-xs md:text-sm">
              {price > 0 ? `Rp ${price.toLocaleString("id-ID")}` : "Gratis"}
            </p>
            <Button
              size="icon"
              variant={inCart ? "default" : "outline"}
              className="h-6 w-6 md:h-7 md:w-7 shrink-0"
              onClick={(e) => {
                e.stopPropagation()
                onAddToCart({
                  id: item.id,
                  type: itemType,
                  name: item.name,
                  code: item.code,
                  price,
                  packageId: itemType === "package" ? item.id : undefined,
                  templateId: itemType === "template" ? item.id : undefined,
                  addOnId: itemType === "addon" ? item.id : undefined,
                })
              }}
            >
              <Plus className="h-3 w-3 md:h-3.5 md:w-3.5" />
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const GridContent = ({
    items,
    type,
  }: {
    items: Product[]
    type: "package" | "template" | "addon"
  }) => {
    const filteredItems = filtered(items)
    if (loading) {
      return (
        <div className="flex h-40 items-center justify-center">
          <p className="text-muted-foreground text-sm">Memuat produk...</p>
        </div>
      )
    }
    if (filteredItems.length === 0) {
      return (
        <div className="flex h-40 items-center justify-center">
          <p className="text-muted-foreground text-sm">Tidak ada produk ditemukan</p>
        </div>
      )
    }
    return (
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:gap-3 xl:grid-cols-3 2xl:grid-cols-4">
        {filteredItems.map((item) => (
          <ProductCard key={item.id} item={item} itemType={type} />
        ))}
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center gap-2 border-b px-3 py-2 md:gap-3 md:px-4 md:py-3">
        <h2 className="font-semibold text-base md:text-lg shrink-0">Produk</h2>
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari produk..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-9"
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="packages" className="flex flex-1 flex-col overflow-hidden">
        <div className="border-b px-3 pt-2 md:px-4">
          <TabsList className="h-9">
            <TabsTrigger value="packages" className="text-xs">
              Paket
              <Badge variant="secondary" className="ml-1 text-xs px-1.5 py-0">
                {packages.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="templates" className="text-xs">
              Template
              <Badge variant="secondary" className="ml-1 text-xs px-1.5 py-0">
                {templates.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="addons" className="text-xs">
              Add-On
              <Badge variant="secondary" className="ml-1 text-xs px-1.5 py-0">
                {addons.length}
              </Badge>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="packages" className="flex-1 overflow-hidden mt-0">
          <ScrollArea className="h-full">
            <div className="p-3 md:p-4">
              <GridContent items={packages} type="package" />
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="templates" className="flex-1 overflow-hidden mt-0">
          <ScrollArea className="h-full">
            <div className="p-3 md:p-4">
              <GridContent items={templates} type="template" />
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="addons" className="flex-1 overflow-hidden mt-0">
          <ScrollArea className="h-full">
            <div className="p-3 md:p-4">
              <GridContent items={addons} type="addon" />
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  )
}