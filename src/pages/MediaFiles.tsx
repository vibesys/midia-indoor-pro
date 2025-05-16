
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { PlusCircle, Image, Film, Edit, Trash2, Play, Eye, Link } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { useToast } from "@/components/ui/use-toast";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface MediaFile extends Tables<"media_files"> {}

const MediaFiles = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [search, setSearch] = useState("");
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fileName, setFileName] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [fileType, setFileType] = useState("image");
  const { toast } = useToast();

  useEffect(() => {
    fetchMediaFiles();
  }, []);

  const fetchMediaFiles = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("media_files")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) {
        throw error;
      }
      
      setMediaFiles(data || []);
    } catch (error) {
      console.error("Erro ao buscar arquivos de mídia:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os arquivos de mídia.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const extractGoogleDriveId = (url: string): string | null => {
    // Match pattern for Google Drive links
    // https://drive.google.com/file/d/{fileId}/view
    // https://drive.google.com/open?id={fileId}
    
    const fileIdRegex1 = /\/file\/d\/([a-zA-Z0-9_-]+)/;
    const fileIdRegex2 = /[?&]id=([a-zA-Z0-9_-]+)/;
    
    const match1 = url.match(fileIdRegex1);
    if (match1 && match1[1]) {
      return match1[1];
    }
    
    const match2 = url.match(fileIdRegex2);
    if (match2 && match2[1]) {
      return match2[1];
    }
    
    return null;
  };

  const getFileFormatFromUrl = (url: string): string => {
    const extension = url.split('.').pop()?.toLowerCase();
    if (extension) {
      return extension;
    }
    return fileType === "image" ? "jpg" : "mp4"; // Default extensions
  };

  const handleAddMedia = async () => {
    if (!fileName || !fileUrl) {
      toast({
        title: "Erro",
        description: "Por favor, forneça um nome e um link do Google Drive.",
        variant: "destructive"
      });
      return;
    }

    if (!fileUrl.includes("drive.google.com")) {
      toast({
        title: "Erro",
        description: "Por favor, forneça um link válido do Google Drive.",
        variant: "destructive"
      });
      return;
    }

    try {
      const fileId = extractGoogleDriveId(fileUrl);
      if (!fileId) {
        toast({
          title: "Erro",
          description: "Não foi possível extrair o ID do arquivo do Google Drive.",
          variant: "destructive"
        });
        return;
      }

      // Generate direct access URL
      const directUrl = `https://drive.google.com/uc?export=view&id=${fileId}`;
      const fileFormat = getFileFormatFromUrl(fileUrl);
      const fileSize = "Tamanho desconhecido"; // Size can't be determined from link

      // Dados adicionais para imagens e vídeos
      let additionalData = {};
      if (fileType === "image") {
        additionalData = { dimensions: "Dimensões desconhecidas" }; 
      } else if (fileType === "video") {
        additionalData = { duration: "Duração desconhecida" }; 
      }
      
      const { data, error } = await supabase
        .from("media_files")
        .insert([{
          name: fileName,
          type: fileType,
          format: fileFormat,
          size: fileSize,
          url: directUrl,
          ...additionalData
        }])
        .select();
      
      if (error) {
        throw error;
      }
      
      setOpenDialog(false);
      setFileName("");
      setFileUrl("");
      fetchMediaFiles();
      
      toast({
        title: "Sucesso",
        description: "Link de mídia adicionado com sucesso.",
        variant: "default"
      });
    } catch (error) {
      console.error("Erro ao adicionar link de mídia:", error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o link de mídia.",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("media_files")
        .delete()
        .eq("id", id);
      
      if (error) {
        throw error;
      }
      
      fetchMediaFiles();
      toast({
        title: "Sucesso",
        description: "Arquivo excluído com sucesso.",
        variant: "default"
      });
    } catch (error) {
      console.error("Erro ao excluir arquivo:", error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o arquivo.",
        variant: "destructive"
      });
    }
  };

  const filteredMedia = mediaFiles.filter(media => 
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
              Adicionar Mídia
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Adicionar Mídia do Google Drive</DialogTitle>
              <DialogDescription>
                Cole um link do Google Drive para imagens ou vídeos que você deseja exibir.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nome</Label>
                <Input 
                  id="name" 
                  placeholder="Nome descritivo do arquivo" 
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="url">Link do Google Drive</Label>
                <Input 
                  id="url" 
                  placeholder="https://drive.google.com/file/d/..." 
                  value={fileUrl}
                  onChange={(e) => setFileUrl(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Compartilhe o arquivo no Google Drive e cole o link aqui.
                </p>
              </div>
              <div className="grid gap-2">
                <Label>Tipo de Arquivo</Label>
                <RadioGroup defaultValue="image" value={fileType} onValueChange={setFileType}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="image" id="image" />
                    <Label htmlFor="image" className="flex items-center gap-1">
                      <Image className="h-4 w-4" /> Imagem
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="video" id="video" />
                    <Label htmlFor="video" className="flex items-center gap-1">
                      <Film className="h-4 w-4" /> Vídeo
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpenDialog(false)}>Cancelar</Button>
              <Button onClick={handleAddMedia}>
                Adicionar
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
          <TabsTrigger value="all">Todos ({mediaFiles.length})</TabsTrigger>
          <TabsTrigger value="images">Imagens ({images.length})</TabsTrigger>
          <TabsTrigger value="videos">Vídeos ({videos.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          {isLoading ? (
            <div className="flex justify-center p-8">Carregando...</div>
          ) : filteredMedia.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMedia.map((media) => (
                <MediaCard key={media.id} media={media} onDelete={handleDelete} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum arquivo de mídia encontrado
            </div>
          )}
        </TabsContent>
        <TabsContent value="images">
          {isLoading ? (
            <div className="flex justify-center p-8">Carregando...</div>
          ) : images.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {images.map((media) => (
                <MediaCard key={media.id} media={media} onDelete={handleDelete} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma imagem encontrada
            </div>
          )}
        </TabsContent>
        <TabsContent value="videos">
          {isLoading ? (
            <div className="flex justify-center p-8">Carregando...</div>
          ) : videos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {videos.map((media) => (
                <MediaCard key={media.id} media={media} onDelete={handleDelete} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum vídeo encontrado
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Media Card Component
const MediaCard = ({ media, onDelete }: { media: MediaFile, onDelete: (id: string) => void }) => {
  const [previewOpen, setPreviewOpen] = useState(false);
  
  return (
    <>
      <Card className={`syntax-card ${media.type === 'image' ? 'string-card' : 'var-card'} overflow-hidden`}>
        <div className="aspect-video bg-code relative flex items-center justify-center">
          {media.type === 'image' ? (
            <Image className="h-12 w-12 text-code-string" />
          ) : (
            <Film className="h-12 w-12 text-code-var" />
          )}
          <div className="absolute bottom-0 right-0 p-2 flex gap-1">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 bg-background/80 backdrop-blur-sm"
              onClick={() => setPreviewOpen(true)}
            >
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
            <div className="max-w-[70%]">
              <h3 className="font-semibold truncate">{media.name}</h3>
              <p className="text-xs text-muted-foreground">
                {media.type === 'image' 
                  ? `${media.format.toUpperCase()} • ${media.dimensions || 'Dimensões desconhecidas'}`
                  : `${media.format.toUpperCase()} • ${media.duration || 'Duração desconhecida'}`}
              </p>
              <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                <Link className="h-3 w-3" />
                <span className="truncate">Google Drive</span>
              </div>
            </div>
            <div className="flex gap-1">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8"
                onClick={() => onDelete(media.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>{media.name}</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center py-4">
            {media.type === 'image' ? (
              <img 
                src={media.url} 
                alt={media.name} 
                className="max-w-full max-h-[70vh] object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/placeholder.svg';
                  (e.target as HTMLImageElement).className += ' border border-muted p-4';
                }}
              />
            ) : (
              <video 
                src={media.url} 
                controls
                className="max-w-full max-h-[70vh]"
                onError={(e) => {
                  const video = e.target as HTMLVideoElement;
                  video.outerHTML = '<div class="flex flex-col items-center justify-center border border-muted p-8 text-muted-foreground"><Film class="h-16 w-16 mb-2" /><p>Erro ao carregar o vídeo</p></div>';
                }}
              />
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewOpen(false)}>Fechar</Button>
            <Button 
              onClick={() => {
                window.open(media.url, '_blank');
              }}
            >
              Ver no Google Drive
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MediaFiles;
