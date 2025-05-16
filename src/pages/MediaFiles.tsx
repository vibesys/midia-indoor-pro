
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { PlusCircle, Image, Film, Edit, Trash2, Play, Eye } from "lucide-react";

const MediaFiles = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [search, setSearch] = useState("");

  // Mock media files data (will be replaced with Supabase data)
  const mockMediaFiles = [
    { id: 1, name: "Banner Promocional", type: "image", format: "jpg", size: "1.2 MB", dimensions: "1920x1080", createdAt: "2025-05-10", url: "#" },
    { id: 2, name: "Vídeo Institucional", type: "video", format: "mp4", size: "15.4 MB", duration: "45s", createdAt: "2025-05-08", url: "#" },
    { id: 3, name: "Quadro de Avisos", type: "image", format: "png", size: "0.8 MB", dimensions: "1280x720", createdAt: "2025-05-05", url: "#" },
    { id: 4, name: "Promoção do Mês", type: "image", format: "jpg", size: "1.5 MB", dimensions: "1920x1080", createdAt: "2025-05-01", url: "#" },
    { id: 5, name: "Tutorial de Produto", type: "video", format: "mp4", size: "22.7 MB", duration: "1m 30s", createdAt: "2025-04-28", url: "#" },
    { id: 6, name: "Logo Animado", type: "video", format: "mp4", size: "3.2 MB", duration: "5s", createdAt: "2025-04-25", url: "#" },
  ];

  const filteredMedia = mockMediaFiles.filter(media => 
    media.name.toLowerCase().includes(search.toLowerCase())
  );

  const images = filteredMedia.filter(media => media.type === "image");
  const videos = filteredMedia.filter(media => media.type === "video");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Mídia</h2>
          <p className="text-muted-foreground">
            Gerenciamento de imagens e vídeos para exibição.
          </p>
        </div>
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <PlusCircle className="h-4 w-4" />
              Upload de Mídia
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Upload de Mídia</DialogTitle>
              <DialogDescription>
                Carregue imagens ou vídeos para exibição nos dispositivos.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nome</Label>
                <Input id="name" placeholder="Nome descritivo do arquivo" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="file">Arquivo</Label>
                <div className="border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center">
                  <p className="text-sm text-muted-foreground mb-2">Arraste um arquivo ou</p>
                  <Input id="file" type="file" className="w-full max-w-xs" />
                  <p className="text-xs text-muted-foreground mt-2">JPG, PNG ou MP4 (max. 50MB)</p>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
              <Button variant="outline" onClick={() => setOpenDialog(false)}>
                Fazer Upload
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-4">
        <Input
          placeholder="Buscar mídia..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">Todos ({mockMediaFiles.length})</TabsTrigger>
          <TabsTrigger value="images">Imagens ({images.length})</TabsTrigger>
          <TabsTrigger value="videos">Vídeos ({videos.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMedia.map((media) => (
              <MediaCard key={media.id} media={media} />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="images">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {images.map((media) => (
              <MediaCard key={media.id} media={media} />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="videos">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {videos.map((media) => (
              <MediaCard key={media.id} media={media} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Media Card Component
const MediaCard = ({ media }: { media: any }) => {
  return (
    <Card className={`syntax-card ${media.type === 'image' ? 'string-card' : 'var-card'} overflow-hidden`}>
      <div className="aspect-video bg-code relative flex items-center justify-center">
        {media.type === 'image' ? (
          <Image className="h-12 w-12 text-code-string" />
        ) : (
          <Film className="h-12 w-12 text-code-var" />
        )}
        <div className="absolute bottom-0 right-0 p-2 flex gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8 bg-background/80 backdrop-blur-sm">
            <Eye className="h-4 w-4" />
          </Button>
          {media.type === 'video' && (
            <Button variant="ghost" size="icon" className="h-8 w-8 bg-background/80 backdrop-blur-sm">
              <Play className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold truncate">{media.name}</h3>
            <p className="text-xs text-muted-foreground">
              {media.type === 'image' 
                ? `${media.format.toUpperCase()} • ${media.dimensions} • ${media.size}`
                : `${media.format.toUpperCase()} • ${media.duration} • ${media.size}`}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Adicionado em {media.createdAt}</p>
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MediaFiles;
